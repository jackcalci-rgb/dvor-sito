<?php
/* Foto di una bottiglia presa da Odoo tramite Mescita (GET /api/immagine/<product_id> in Mescita).
   Copia su disco in data/mescita-img/ (la foto cambia di rado). Se Mescita non ha la foto risponde 404 e la pagina mostra solo il nome. */
$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) { http_response_code(404); exit; }
$dir = __DIR__ . '/data/mescita-img'; $f = $dir . '/' . $id . '.v2.bin';
/* Ritaglia i bordi vuoti (trasparenti o bianchi) cosi' tutte le bottiglie risultano alla stessa altezza. Senza GD restituisce l'immagine com'e'. */
function trim_img($bin) {
    if (!function_exists('imagecreatefromstring')) return $bin;
    $im = @imagecreatefromstring($bin); if (!$im) return $bin;
    $w = imagesx($im); $h = imagesy($im); $x0 = $w; $y0 = $h; $x1 = -1; $y1 = -1;
    for ($y = 0; $y < $h; $y++) for ($x = 0; $x < $w; $x++) {
        $c = imagecolorat($im, $x, $y); $a = ($c >> 24) & 127; $r = ($c >> 16) & 255; $g = ($c >> 8) & 255; $b = $c & 255;
        if ($a < 100 && !($r > 244 && $g > 244 && $b > 244)) { if ($x < $x0) $x0 = $x; if ($x > $x1) $x1 = $x; if ($y < $y0) $y0 = $y; if ($y > $y1) $y1 = $y; }
    }
    if ($x1 < $x0 || $y1 < $y0) { imagedestroy($im); return $bin; }
    $p = 3; $x0 = max(0, $x0 - $p); $y0 = max(0, $y0 - $p); $x1 = min($w - 1, $x1 + $p); $y1 = min($h - 1, $y1 + $p);
    $cw = $x1 - $x0 + 1; $ch = $y1 - $y0 + 1;
    if ($cw < 20 || $ch < 20 || ($cw >= $w - 2 && $ch >= $h - 2)) { imagedestroy($im); return $bin; }
    $o = imagecreatetruecolor($cw, $ch); imagealphablending($o, false); imagesavealpha($o, true);
    imagefill($o, 0, 0, imagecolorallocatealpha($o, 0, 0, 0, 127));
    imagecopy($o, $im, 0, 0, $x0, $y0, $cw, $ch);
    ob_start(); imagepng($o); $r = ob_get_clean(); imagedestroy($im); imagedestroy($o);
    return $r ?: $bin;
}
function send($bin) {
    $t = (strncmp($bin, "\x89PNG", 4) === 0) ? 'image/png' : ((strncmp($bin, 'GIF', 3) === 0) ? 'image/gif' : ((strncmp($bin, 'RIFF', 4) === 0) ? 'image/webp' : 'image/jpeg'));
    header('Content-Type: ' . $t); header('Cache-Control: public, max-age=3600'); echo $bin; exit;
}
if (is_file($f) && time() - filemtime($f) < 6 * 3600 + ($id % 36) * 600) { $b = (string)file_get_contents($f); if ($b !== '') send($b); }
$cfg = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
$mc = is_file(__DIR__ . '/data/mescita.php') ? (require __DIR__ . '/data/mescita.php') : [];
if (is_array($mc)) $cfg = $mc + $cfg;
$url = rtrim((string)($cfg['mescita_url'] ?? ''), '/'); $usr = (string)($cfg['mescita_user'] ?? ''); $pin = (string)($cfg['mescita_pin'] ?? '');
$bin = null;
if ($url !== '' && $usr !== '' && $pin !== '' && function_exists('curl_init')) {
    $jar = tempnam(sys_get_temp_dir(), 'mi'); $o = [CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 5];
    $ch = curl_init($url . '/api/login');
    curl_setopt_array($ch, $o + [CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['nome' => $usr, 'pin' => $pin])]);
    curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($code === 200) {
        $ch = curl_init($url . '/api/immagine/' . $id); curl_setopt_array($ch, $o);
        $r = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $ct = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE); curl_close($ch);
        if ($r !== false && $code === 200 && stripos($ct, 'image/') === 0 && strlen($r) > 100) $bin = trim_img($r);
    }
    @unlink($jar);
}
if ($bin !== null) { if (is_dir($dir) || @mkdir($dir, 0775, true)) @file_put_contents($f, $bin, LOCK_EX); send($bin); }
if (is_file($f)) { $b = (string)file_get_contents($f); if ($b !== '') send($b); }
http_response_code(404);
