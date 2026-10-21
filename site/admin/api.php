<?php
declare(strict_types=1);
require __DIR__ . '/inc.php';
header('Content-Type: application/json; charset=utf-8');
function out(int $c, array $d): void { http_response_code($c); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);
$a = (string)($_POST['action'] ?? '');

if ($a === 'login') {
    if (count(throttle_hits()) >= 5) out(429, ['ok' => false, 'error' => 'locked']);
    if (pw_check((string)($_POST['password'] ?? ''))) {
        session_regenerate_id(true); $_SESSION['ok'] = true; throttle_clear();
        out(200, ['ok' => true, 'csrf' => csrf()]);
    }
    throttle_add(); usleep(600000);
    out(401, ['ok' => false, 'error' => 'bad']);
}
if (!logged_in()) out(401, ['ok' => false, 'error' => 'auth']);
if ($a === 'me') out(200, ['ok' => true, 'csrf' => csrf()]);
if (!csrf_ok()) out(403, ['ok' => false, 'error' => 'csrf']);

switch ($a) {
    case 'logout':
        $_SESSION = []; session_destroy(); out(200, ['ok' => true]);

    case 'list':
        $p = photos_read(); usort($p, fn($x, $y) => ($y['createdAt'] ?? 0) <=> ($x['createdAt'] ?? 0));
        out(200, ['ok' => true, 'photos' => $p]);

    case 'upload':
        if (empty($_FILES['photo'])) out(400, ['ok' => false, 'error' => 'nofile']);
        try {
            $rec = save_image($_FILES['photo'], (string)($_POST['cat'] ?? 'sale'));
        } catch (RuntimeException $e) { out(422, ['ok' => false, 'error' => $e->getMessage()]); }
        $ok = with_lock(function () use ($rec) { $p = photos_read(); $p[] = $rec; return photos_write($p); });
        if (!$ok) { @unlink(UP_DIR . '/' . $rec['file']); out(500, ['ok' => false, 'error' => 'data']); }
        out(200, ['ok' => true, 'photo' => $rec]);

    case 'update':
        $id = (string)($_POST['id'] ?? '');
        $ok = with_lock(function () use ($id) {
            $p = photos_read(); $hit = false;
            foreach ($p as &$r) if (($r['id'] ?? '') === $id) {
                $hit = true;
                if (isset($_POST['cat']) && in_array($_POST['cat'], CATS, true)) $r['cat'] = $_POST['cat'];
                if (isset($_POST['it'])) $r['it'] = mb_substr(trim(str_replace(["\r", "\n"], ' ', (string)$_POST['it'])), 0, 140);
                if (isset($_POST['en'])) $r['en'] = mb_substr(trim(str_replace(["\r", "\n"], ' ', (string)$_POST['en'])), 0, 140);
            }
            unset($r);
            return $hit && photos_write($p);
        });
        out($ok ? 200 : 404, ['ok' => (bool)$ok]);

    case 'delete':
        $id = (string)($_POST['id'] ?? '');
        $ok = with_lock(function () use ($id) {
            $p = photos_read(); $keep = []; $file = null;
            foreach ($p as $r) { if (($r['id'] ?? '') === $id) $file = $r['file'] ?? null; else $keep[] = $r; }
            if ($file === null) return false;
            if (!photos_write($keep)) return false;
            $f = UP_DIR . '/' . basename((string)$file);
            if (is_file($f)) @unlink($f);
            return true;
        });
        out($ok ? 200 : 404, ['ok' => (bool)$ok]);

    case 'passwd':
        $old = (string)($_POST['old'] ?? ''); $new = (string)($_POST['new'] ?? '');
        if (!pw_check($old)) out(401, ['ok' => false, 'error' => 'bad']);
        if (mb_strlen($new) < 10) out(422, ['ok' => false, 'error' => 'short']);
        out(pw_save($new) ? 200 : 500, ['ok' => true]);

    case 'rev_list':
        out(200, ['ok' => true, 'reviews' => rev_read()]);

    case 'rev_add':
        $au = mb_substr(trim(str_replace(["\r", "\n"], ' ', (string)($_POST['author'] ?? ''))), 0, 80);
        $tx = mb_substr(trim((string)($_POST['text'] ?? '')), 0, 2000);
        $rt = max(1, min(5, (int)($_POST['rating'] ?? 5)));
        $dt = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($_POST['date'] ?? '')) ? (string)$_POST['date'] : '';
        $src = in_array($_POST['source'] ?? '', ['google', 'tripadvisor', 'facebook', 'altro'], true) ? $_POST['source'] : 'google';
        if ($au === '' || $tx === '') out(422, ['ok' => false, 'error' => 'rev_fields']);
        $rec = ['id' => bin2hex(random_bytes(6)), 'author' => $au, 'text' => $tx, 'rating' => $rt, 'date' => $dt, 'source' => $src];
        $ok = with_lock(function () use ($rec) { $r = rev_read(); array_unshift($r, $rec); return rev_write($r); });
        out($ok ? 200 : 500, ['ok' => (bool)$ok, 'review' => $rec, 'error' => $ok ? null : 'data']);

    case 'rev_del':
        $id = (string)($_POST['id'] ?? '');
        $ok = with_lock(function () use ($id) { $r = rev_read(); $k = array_values(array_filter($r, fn($x) => ($x['id'] ?? '') !== $id)); return count($k) < count($r) && rev_write($k); });
        out($ok ? 200 : 404, ['ok' => (bool)$ok]);

    case 'status':
        $ini = fn($k) => ini_get($k);
        out(200, ['ok' => true, 'checks' => [
            ['PHP ' . PHP_VERSION, version_compare(PHP_VERSION, '7.4', '>=')],
            ['Estensione immagini (GD)', function_exists('imagecreatefromjpeg')],
            ['Cartella data/ scrivibile', is_writable(DATA_DIR)],
            ['Cartella uploads/ scrivibile', is_writable(UP_DIR)],
            ['Funzione di invio email (mail)', function_exists('mail')],
            ['Connessione sicura (https)', !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'],
            ['Chiave Google per le recensioni (facoltativa, in config.php)', trim((string)(cfg()['google_api_key'] ?? '')) !== ''],
        ], 'limits' => 'upload_max_filesize ' . $ini('upload_max_filesize') . ', post_max_size ' . $ini('post_max_size')]);
}
out(400, ['ok' => false, 'error' => 'action']);
