<?php
/* Orari settimanali dal gestionale di prenota.osteriadvor.com (Impostazioni -> Regole e offerte -> Orari settimanali).
   Il sito li legge da qui (server a server), li tiene 5 minuti in una copia e, se il gestionale non risponde,
   usa l'ultima copia; se non c'e' nulla restituisce errore e la pagina lascia gli orari scritti nell'HTML. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=120');
$cfg = is_file(__DIR__ . '/config.php') ? (require __DIR__ . '/config.php') : [];
$api = (string)($cfg['booking_api'] ?? 'https://prenota.osteriadvor.com/api.php');
$days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
$dir = __DIR__ . '/data'; $cache = $dir . '/orari-cache.json';

function good($w, array $days) {
    if (!is_array($w)) return null;
    $out = [];
    foreach ($days as $d) {
        $x = $w[$d] ?? null; if (!is_array($x)) return null; $out[$d] = [];
        foreach ($x as $r) {
            if (!is_array($r) || count($r) !== 2 || !preg_match('/^\d\d:\d\d$/', (string)$r[0]) || !preg_match('/^\d\d:\d\d$/', (string)$r[1]) || $r[0] > $r[1]) return null;
            $out[$d][] = [(string)$r[0], (string)$r[1]];
        }
    }
    return $out;
}
function reply($w, $src) { echo json_encode(['ok' => true, 'windows' => $w, 'source' => $src], JSON_UNESCAPED_UNICODE); exit; }

if (is_file($cache) && time() - filemtime($cache) < 300) {
    $c = json_decode((string)file_get_contents($cache), true); $w = good($c['windows'] ?? null, $days); if ($w) reply($w, 'cache');
}
$w = null;
if (function_exists('curl_init')) {
    $ch = curl_init($api);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode(['op' => 'getdoc', 'path' => 'settings/main']),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5, CURLOPT_CONNECTTIMEOUT => 3]);
    $r = curl_exec($ch); $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($r !== false && $code === 200) { $j = json_decode((string)$r, true); if (!empty($j['exists'])) $w = good($j['data']['windows'] ?? null, $days); }
}
if ($w) {
    if (is_dir($dir) || @mkdir($dir, 0775, true)) @file_put_contents($cache, json_encode(['windows' => $w, 'at' => date('c')]), LOCK_EX);
    reply($w, 'live');
}
if (is_file($cache)) { $c = json_decode((string)file_get_contents($cache), true); $w = good($c['windows'] ?? null, $days); if ($w) reply($w, 'stale'); }
http_response_code(503); echo json_encode(['ok' => false]);
