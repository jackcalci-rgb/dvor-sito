<?php
declare(strict_types=1);
const ROOT_DIR = __DIR__ . '/..';
define('DATA_DIR', realpath(__DIR__ . '/../data') ?: (__DIR__ . '/../data'));
define('UP_DIR', realpath(__DIR__ . '/../uploads') ?: (__DIR__ . '/../uploads'));

$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('dvor_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin/index.php'), '/') . '/',
    'secure'   => $https,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

function cfg(): array { static $c = null; return $c ??= (require __DIR__ . '/../config.php'); }

function auth_data(): array {
    $f = DATA_DIR . '/auth.php';
    return is_file($f) ? (array)(require $f) : [];
}
function pw_hash(string $pw, string $saltHex, int $iter): string {
    return hash_pbkdf2('sha256', $pw, (string)hex2bin($saltHex), $iter, 64, false);
}
function pw_check(string $pw): bool {
    $a = auth_data();
    if (empty($a['salt']) || empty($a['hash'])) return false;
    return hash_equals((string)$a['hash'], pw_hash($pw, (string)$a['salt'], (int)($a['iter'] ?? 200000)));
}
function pw_save(string $pw): bool {
    $salt = bin2hex(random_bytes(16)); $iter = 200000;
    $php = "<?php\nreturn " . var_export(['salt' => $salt, 'hash' => pw_hash($pw, $salt, $iter), 'iter' => $iter], true) . ";\n";
    $f = DATA_DIR . '/auth.php';
    $ok = @file_put_contents($f, $php, LOCK_EX) !== false;
    if ($ok && function_exists('opcache_invalidate')) @opcache_invalidate($f, true);
    return $ok;
}

function logged_in(): bool { return !empty($_SESSION['ok']); }
function csrf(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
function csrf_ok(): bool {
    $h = $_SERVER['HTTP_X_CSRF'] ?? '';
    return $h !== '' && hash_equals(csrf(), $h);
}

// Massimo 5 tentativi di accesso sbagliati ogni 15 minuti per indirizzo IP
function throttle_file(): string { return sys_get_temp_dir() . '/dvor_login_' . sha1($_SERVER['REMOTE_ADDR'] ?? 'x'); }
function throttle_hits(): array {
    $f = throttle_file(); $now = time(); $h = [];
    if (is_file($f)) foreach (explode("\n", (string)@file_get_contents($f)) as $l) if ($l !== '' && (int)$l > $now - 900) $h[] = (int)$l;
    return $h;
}
function throttle_add(): void { $h = throttle_hits(); $h[] = time(); @file_put_contents(throttle_file(), implode("\n", $h), LOCK_EX); }
function throttle_clear(): void { @unlink(throttle_file()); }

// ---------- foto ----------
function photos_read(): array {
    $f = DATA_DIR . '/photos.json';
    if (!is_file($f)) return [];
    $j = json_decode((string)file_get_contents($f), true);
    return is_array($j) ? $j : [];
}
function photos_write(array $a): bool {
    $f = DATA_DIR . '/photos.json'; $tmp = $f . '.tmp';
    $json = json_encode(array_values($a), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return @rename($tmp, $f);
}
function with_lock(callable $fn) {
    $lk = @fopen(DATA_DIR . '/.lock', 'c');
    if ($lk) flock($lk, LOCK_EX);
    try { return $fn(); } finally { if ($lk) { flock($lk, LOCK_UN); fclose($lk); } }
}
// ---------- recensioni aggiunte a mano ----------
function rev_read(): array {
    $f = DATA_DIR . '/reviews_manual.json';
    if (!is_file($f)) return [];
    $j = json_decode((string)file_get_contents($f), true);
    return is_array($j) ? $j : [];
}
function rev_write(array $a): bool {
    $f = DATA_DIR . '/reviews_manual.json'; $tmp = $f . '.tmp';
    if (@file_put_contents($tmp, json_encode(array_values($a), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) === false) return false;
    return @rename($tmp, $f);
}
const CATS = ['sale', 'giardino', 'panorama', 'piatti', 'eventi'];

function save_image(array $f, string $cat): array {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $e = $f['error'] ?? 0;
        throw new RuntimeException(in_array($e, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 'too_large' : 'upload');
    }
    $tmp = $f['tmp_name'];
    if (!is_uploaded_file($tmp) && !(PHP_SAPI === 'cli-server' && is_file($tmp))) throw new RuntimeException('upload');
    if (filesize($tmp) > 25 * 1048576) throw new RuntimeException('too_large');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mime] ?? null;
    if (!$ext || !@getimagesize($tmp)) throw new RuntimeException('type');
    $id = date('Ymd-His') . '-' . bin2hex(random_bytes(4));
    $dest = UP_DIR . '/' . $id . '.jpg';
    $w = 0; $h = 0;
    if (function_exists('imagecreatefromjpeg') && function_exists('imagejpeg')) {
        $img = match ($mime) { 'image/jpeg' => @imagecreatefromjpeg($tmp), 'image/png' => @imagecreatefrompng($tmp), default => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmp) : false };
        if (!$img) throw new RuntimeException('type');
        if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
            $ex = @exif_read_data($tmp);
            $o = (int)($ex['Orientation'] ?? 1);
            $rot = [3 => 180, 6 => -90, 8 => 90][$o] ?? 0;
            if ($rot) { $r = imagerotate($img, $rot, 0); if ($r) $img = $r; }
        }
        $w = imagesx($img); $h = imagesy($img);
        $max = (int)(cfg()['max_px'] ?? 1800); $sc = min(1, $max / max($w, $h));
        $nw = max(1, (int)round($w * $sc)); $nh = max(1, (int)round($h * $sc));
        $out = imagecreatetruecolor($nw, $nh);
        imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255));
        imagecopyresampled($out, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
        if (!imagejpeg($out, $dest, 82)) throw new RuntimeException('write');
        $w = $nw; $h = $nh;
    } else {
        if ($mime !== 'image/jpeg') throw new RuntimeException('type');
        if (!@move_uploaded_file($tmp, $dest) && !@copy($tmp, $dest)) throw new RuntimeException('write');
        [$w, $h] = getimagesize($dest);
    }
    @chmod($dest, 0644);
    return ['id' => $id, 'file' => $id . '.jpg', 'cat' => in_array($cat, CATS, true) ? $cat : 'sale', 'it' => '', 'en' => '', 'w' => $w, 'h' => $h, 'createdAt' => (int)(microtime(true) * 1000)];
}

// ---------- eventi ----------
function events_read(): array {
    $f = DATA_DIR . '/events.json';
    if (!is_file($f)) return [];
    $j = json_decode((string)file_get_contents($f), true);
    return is_array($j) ? $j : [];
}
function events_write(array $a): bool {
    $f = DATA_DIR . '/events.json'; $tmp = $f . '.tmp';
    if (@file_put_contents($tmp, json_encode(array_values($a), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX) === false) return false;
    @chmod($tmp, 0644);
    return @rename($tmp, $f);
}
// Menù dell'evento: immagine (JPG/PNG/WebP) oppure PDF
function save_menu_file(array $f): array {
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $e = $f['error'] ?? 0;
        throw new RuntimeException(in_array($e, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 'too_large' : 'upload');
    }
    $tmp = $f['tmp_name'];
    if (!is_uploaded_file($tmp) && !(PHP_SAPI === 'cli-server' && is_file($tmp))) throw new RuntimeException('upload');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    if ($mime === 'application/pdf') {
        if (filesize($tmp) > 15 * 1048576) throw new RuntimeException('too_large');
        $id = 'menu-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.pdf';
        if (!@move_uploaded_file($tmp, UP_DIR . '/' . $id) && !@copy($tmp, UP_DIR . '/' . $id)) throw new RuntimeException('write');
        @chmod(UP_DIR . '/' . $id, 0644);
        return ['file' => $id, 'type' => 'pdf'];
    }
    $r = save_image($f, 'eventi');
    return ['file' => $r['file'], 'type' => 'image'];
}
function ev_clean(string $v, int $max): string { return mb_substr(trim(str_replace("\r", '', $v)), 0, $max); }
function ev_oneline(string $v, int $max): string { return mb_substr(trim(str_replace(["\r", "\n"], ' ', $v)), 0, $max); }
function up_unlink(?string $file): void {
    if ($file) { $p = UP_DIR . '/' . basename($file); if (is_file($p)) @unlink($p); }
}
