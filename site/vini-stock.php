<?php
/* Disponibilita' dei vini: il sito la legge da Mescita (mescita.profumidistria.com), che a sua volta la legge da Odoo.
   Serve in config.php: 'mescita_url' => 'https://mescita.profumidistria.com' e 'mescita_token' => '<lo stesso di MESCITA_SITE_TOKEN>'.
   Copia di 45 secondi (quasi tempo reale) in data/vini-stock.json; se Mescita non risponde si usa l'ultima copia, altrimenti errore (la carta resta completa). */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=30');
$cfg = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
$url = rtrim((string)($cfg['mescita_url'] ?? ''), '/'); $tok = (string)($cfg['mescita_token'] ?? '');
$dir = __DIR__ . '/data'; $cache = $dir . '/vini-stock.json';
function clean($j) {
    if (!is_array($j) || !isset($j['vini']) || !is_array($j['vini'])) return null;
    $o = [];
    foreach ($j['vini'] as $v) { if (is_array($v) && isset($v['name'])) $o[] = ['name' => (string)$v['name'], 'qty' => (float)($v['qty'] ?? 0)]; }
    return $o ?: null;
}
function reply($items, $src) { echo json_encode(['ok' => true, 'items' => $items, 'source' => $src], JSON_UNESCAPED_UNICODE); exit; }
if (is_file($cache) && time() - filemtime($cache) < 45) { $c = json_decode((string)file_get_contents($cache), true); if (!empty($c['items'])) reply($c['items'], 'cache'); }
$items = null;
if ($url !== '' && $tok !== '' && function_exists('curl_init')) {
    $ch = curl_init($url . '/api/sito/vini');
    curl_setopt_array($ch, [CURLOPT_HTTPHEADER => ['X-Site-Token: ' . $tok], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 3]);
    $r = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($r !== false && $code === 200) $items = clean(json_decode((string)$r, true));
}
if ($items) { if (is_dir($dir) || @mkdir($dir, 0775, true)) @file_put_contents($cache, json_encode(['items' => $items, 'at' => date('c')]), LOCK_EX); reply($items, 'live'); }
if (is_file($cache)) { $c = json_decode((string)file_get_contents($cache), true); if (!empty($c['items'])) reply($c['items'], 'stale'); }
http_response_code(503); echo json_encode(['ok' => false]);
