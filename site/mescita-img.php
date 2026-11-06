<?php
/* Foto di una bottiglia presa da Odoo tramite Mescita (GET /api/immagine/<product_id> in Mescita).
   Copia su disco in data/mescita-img/ (la foto cambia di rado). Se Mescita non ha la foto risponde 404 e la pagina mostra solo il nome. */
$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) { http_response_code(404); exit; }
$dir = __DIR__ . '/data/mescita-img'; $f = $dir . '/' . $id . '.bin';
function send($bin) {
    $t = (strncmp($bin, "\x89PNG", 4) === 0) ? 'image/png' : ((strncmp($bin, 'GIF', 3) === 0) ? 'image/gif' : ((strncmp($bin, 'RIFF', 4) === 0) ? 'image/webp' : 'image/jpeg'));
    header('Content-Type: ' . $t); header('Cache-Control: public, max-age=86400'); echo $bin; exit;
}
if (is_file($f) && time() - filemtime($f) < 7 * 86400) { $b = (string)file_get_contents($f); if ($b !== '') send($b); }
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
        if ($r !== false && $code === 200 && stripos($ct, 'image/') === 0 && strlen($r) > 100) $bin = $r;
    }
    @unlink($jar);
}
if ($bin !== null) { if (is_dir($dir) || @mkdir($dir, 0775, true)) @file_put_contents($f, $bin, LOCK_EX); send($bin); }
if (is_file($f)) { $b = (string)file_get_contents($f); if ($b !== '') send($b); }
http_response_code(404);
