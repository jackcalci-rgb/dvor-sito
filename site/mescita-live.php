<?php
/* Carta Mescita: bottiglie aperte adesso e calici serviti, letti da Mescita (stesse credenziali di vini-stock.php).
   Espone solo nome, categoria e calici: niente prezzi, costi, utenti. Copia di 15 secondi in data/mescita-live.json. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=10');
$cfg = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
$mc = is_file(__DIR__ . '/data/mescita.php') ? (require __DIR__ . '/data/mescita.php') : [];
if (is_array($mc)) $cfg = $mc + $cfg;
$url = rtrim((string)($cfg['mescita_url'] ?? ''), '/'); $usr = (string)($cfg['mescita_user'] ?? ''); $pin = (string)($cfg['mescita_pin'] ?? '');
$dir = __DIR__ . '/data'; $cache = $dir . '/mescita-live.json'; $per = 7;
function out($b, $src, $at) { echo json_encode(['ok' => true, 'bottles' => $b, 'per' => 7, 'source' => $src, 'at' => $at], JSON_UNESCAPED_UNICODE); exit; }
function nk($n) { $n = preg_replace('/^\s*\[[^\]]*\]\s*/', '', (string)$n); $n = function_exists('iconv') ? (@iconv('UTF-8', 'ASCII//TRANSLIT', $n) ?: $n) : $n; $w = array_values(array_unique(array_filter(explode(' ', preg_replace('/[^a-z0-9]+/', ' ', strtolower($n)))))); sort($w); return implode(' ', $w); }
/* La foto si prende dal prodotto ATTIVO con lo stesso nome (inventario di vini-stock.php): una bottiglia aperta con un vecchio prodotto archiviato non usa la sua foto. */
function activeIds($dir) {
    $m = []; $f = $dir . '/vini-stock.json';
    if (is_file($f)) { $c = json_decode((string)file_get_contents($f), true); foreach (($c['items'] ?? []) as $it) { if (!empty($it['id']) && !empty($it['name'])) $m[nk($it['name'])] = (int)$it['id']; } }
    return $m;
}
function clean($rows, $ids = []) {
    if (!is_array($rows)) return null;
    $o = [];
    foreach ($rows as $r) {
        if (!is_array($r) || ($r['stato'] ?? 'aperta') !== 'aperta') continue;
        $n = trim(preg_replace('/^\s*\[[^\]]*\]\s*/', '', (string)($r['nome'] ?? '')));
        if ($n === '') continue;
        $o[] = ['pid' => $ids ? ($ids[nk($n)] ?? 0) : (int)($r['product_id'] ?? 0), 'name' => $n, 'cat' => (string)($r['categoria'] ?? ''), 'calici' => max(0, (int)($r['calici'] ?? 0))];
    }
    return $o;
}
if (is_file($cache) && time() - filemtime($cache) < 15) { $c = json_decode((string)file_get_contents($cache), true); if (is_array($c) && isset($c['bottles'])) out($c['bottles'], 'cache', $c['at'] ?? ''); }
$b = null;
if ($url !== '' && $usr !== '' && $pin !== '' && function_exists('curl_init')) {
    $jar = tempnam(sys_get_temp_dir(), 'ml'); $o = [CURLOPT_COOKIEJAR => $jar, CURLOPT_COOKIEFILE => $jar, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20, CURLOPT_CONNECTTIMEOUT => 5];
    $ch = curl_init($url . '/api/login');
    curl_setopt_array($ch, $o + [CURLOPT_POST => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode(['nome' => $usr, 'pin' => $pin])]);
    curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($code === 200) {
        $ch = curl_init($url . '/api/bottiglie'); curl_setopt_array($ch, $o);
        $r = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        if ($r !== false && $code === 200) $b = clean(json_decode((string)$r, true), activeIds($dir));
    }
    @unlink($jar);
}
if ($b !== null) { $at = date('c'); if (is_dir($dir) || @mkdir($dir, 0775, true)) @file_put_contents($cache, json_encode(['bottles' => $b, 'at' => $at]), LOCK_EX); out($b, 'live', $at); }
http_response_code(503); echo json_encode(['ok' => false]);
