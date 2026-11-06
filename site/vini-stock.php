<?php
/* Disponibilita' dei vini: il sito la legge da Mescita (mescita.profumidistria.com), che a sua volta la legge da Odoo.
   Modo diretto (consigliato): in data/mescita.php (o config.php) 'mescita_url', 'mescita_user', 'mescita_pin' (utente admin dedicato al sito): il sito entra come quell'utente e legge /api/inventario (disponibili = giacenza Odoo - bottiglie aperte).
   Modo alternativo: endpoint /api/sito/vini con 'mescita_token'.
   Serve in config.php: 'mescita_url' => 'https://mescita.profumidistria.com' e 'mescita_token' => '<lo stesso di MESCITA_SITE_TOKEN>'.
   Copia di 45 secondi (quasi tempo reale) in data/vini-stock.json; se Mescita non risponde si usa l'ultima copia, altrimenti errore (la carta resta completa). */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30');
$cfg = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
$mc = is_file(__DIR__ . '/data/mescita.php') ? (require __DIR__ . '/data/mescita.php') : []; /* credenziali Mescita: data/mescita.php ha la precedenza (il deploy non lo tocca) */
if (is_array($mc)) $cfg = $mc + $cfg;
$url = rtrim((string)($cfg['mescita_url'] ?? ''), '/'); $tok = (string)($cfg['mescita_token'] ?? '');
$dir = __DIR__ . '/data'; $cache = $dir . '/vini-stock.json';
function clean($j) {
    if (!is_array($j) || !isset($j['vini']) || !is_array($j['vini'])) return null;
    $o = [];
    foreach ($j['vini'] as $v) { if (is_array($v) && isset($v['name'])) $o[] = ['name' => (string)$v['name'], 'qty' => (float)($v['qty'] ?? 0)]; }
    return $o ?: null;
}
function reply($items, $src, $abs = false) { echo json_encode(['ok' => true, 'items' => $items, 'source' => $src, 'absent0' => $abs], JSON_UNESCAPED_UNICODE); exit; }
function fromInv($j) {
    if (!is_array($j) || !isset($j['righe']) || !is_array($j['righe'])) return null;
    $o = [];
    foreach ($j['righe'] as $v) { if (is_array($v) && isset($v['nome'])) $o[] = ['name' => (string)$v['nome'], 'qty' => (float)($v['disponibili'] ?? 0), 'id' => (int)($v['id'] ?? 0), 'ord' => array_key_exists('ordinabile', $v) ? ($v['ordinabile'] ? 1 : 0) : 1]; }
    return count($o) >= 10 ? $o : null;
}
if (is_file($cache) && time() - filemtime($cache) < 45) { $c = json_decode((string)file_get_contents($cache), true); if (!empty($c['items'])) reply($c['items'], 'cache', !empty($c['abs'])); }
$items = null; $abs = false;
$usr = (string)($cfg['mescita_user'] ?? ''); $pin = (string)($cfg['mescita_pin'] ?? '');
if ($url !== '' && $usr !== '' && $pin !== '' && function_exists('curl_init')) {
    $jar = tempnam(sys_get_temp_dir(), 'mc'); $o = [CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_CONNECTTIMEOUT => 5];
    $ch = curl_init($url . '/api/login');
    curl_setopt_array($ch, $o + [CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['nome' => $usr, 'pin' => $pin])]);
    curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($code === 200) {
        $ch = curl_init($url . '/api/inventario'); curl_setopt_array($ch, $o);
        $r = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        if ($r !== false && $code === 200) { $items = fromInv(json_decode((string)$r, true)); $abs = (bool)$items; }
    }
    @unlink($jar);
}
if (!$items && $url !== '' && $tok !== '' && function_exists('curl_init')) {
    $ch = curl_init($url . '/api/sito/vini');
    curl_setopt_array($ch, [CURLOPT_HTTPHEADER => ['X-Site-Token: ' . $tok], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 3]);
    $r = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($r !== false && $code === 200) $items = clean(json_decode((string)$r, true));
}
if ($items) { if (is_dir($dir) || @mkdir($dir, 0775, true)) @file_put_contents($cache, json_encode(['items' => $items, 'abs' => $abs, 'at' => date('c')]), LOCK_EX); reply($items, 'live', $abs); }
if (is_file($cache)) { $c = json_decode((string)file_get_contents($cache), true); if (!empty($c['items'])) reply($c['items'], 'stale', !empty($c['abs'])); }
http_response_code(503); echo json_encode(['ok' => false]);
