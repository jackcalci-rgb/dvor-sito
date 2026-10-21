<?php
// Recensioni positive per la home: Google (se configurato) + recensioni aggiunte a mano dall'area admin.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=600');
$cfg = require __DIR__ . '/config.php';
$dataDir = __DIR__ . '/data';
$min = (int)($cfg['reviews_min_rating'] ?? 4);
$out = ['ok' => true, 'rating' => null, 'total' => null, 'url' => (string)($cfg['google_maps_url'] ?? ''), 'reviews' => []];

function http_json(string $method, string $url, array $headers, ?string $body = null): ?array {
    if (function_exists('curl_init')) {
        $c = curl_init($url);
        curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers]);
        if ($body !== null) curl_setopt($c, CURLOPT_POSTFIELDS, $body);
        $r = curl_exec($c); $code = (int)curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    } else {
        $ctx = stream_context_create(['http' => ['method' => $method, 'header' => implode("\r\n", $headers), 'content' => $body ?? '', 'timeout' => 8, 'ignore_errors' => true]]);
        $r = @file_get_contents($url, false, $ctx); $code = 200;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $code = (int)$m[1];
    }
    if (!$r || $code >= 400) return null;
    $j = json_decode((string)$r, true);
    return is_array($j) ? $j : null;
}

// ---- Google (cache 12 ore) ----
$key = trim((string)($cfg['google_api_key'] ?? ''));
if ($key !== '') {
    $cacheF = $dataDir . '/reviews_cache.json';
    $cache = is_file($cacheF) ? json_decode((string)file_get_contents($cacheF), true) : null;
    if (!is_array($cache) || ($cache['at'] ?? 0) < time() - 43200) {
        $pid = trim((string)($cfg['google_place_id'] ?? '')) ?: (string)($cache['pid'] ?? '');
        $h = ['X-Goog-Api-Key: ' . $key, 'Content-Type: application/json'];
        if ($pid === '') {
            $s = http_json('POST', 'https://places.googleapis.com/v1/places:searchText', array_merge($h, ['X-Goog-FieldMask: places.id']), json_encode(['textQuery' => (string)$cfg['google_query']]));
            $pid = (string)($s['places'][0]['id'] ?? '');
        }
        $fresh = null;
        if ($pid !== '') {
            $all = [];
            foreach (['it', 'en'] as $lc) {   // due lingue: Google restituisce al massimo 5 recensioni per richiesta
                $d = http_json('GET', 'https://places.googleapis.com/v1/places/' . rawurlencode($pid) . '?languageCode=' . $lc, array_merge($h, ['X-Goog-FieldMask: rating,userRatingCount,reviews,googleMapsUri']));
                if (!$d) continue;
                $fresh = $fresh ?? ['rating' => $d['rating'] ?? null, 'total' => $d['userRatingCount'] ?? null, 'maps' => $d['googleMapsUri'] ?? ''];
                foreach (($d['reviews'] ?? []) as $rv) {
                    $txt = (string)($rv['originalText']['text'] ?? $rv['text']['text'] ?? '');
                    $id = (string)($rv['name'] ?? md5($txt));
                    $all[$id] = ['author' => (string)($rv['authorAttribution']['displayName'] ?? ''), 'authorUrl' => (string)($rv['authorAttribution']['uri'] ?? ''),
                        'photo' => (string)($rv['authorAttribution']['photoUri'] ?? ''), 'rating' => (int)($rv['rating'] ?? 0), 'text' => $txt,
                        'when' => (string)($rv['relativePublishTimeDescription'] ?? ''), 'date' => substr((string)($rv['publishTime'] ?? ''), 0, 10), 'source' => 'google'];
                }
            }
            if ($fresh) { $fresh['reviews'] = array_values($all); $fresh['pid'] = $pid; $fresh['at'] = time(); @file_put_contents($cacheF, json_encode($fresh, JSON_UNESCAPED_UNICODE), LOCK_EX); $cache = $fresh; }
        }
        if (!$fresh && is_array($cache)) { $cache['at'] = time() - 39600; @file_put_contents($cacheF, json_encode($cache, JSON_UNESCAPED_UNICODE), LOCK_EX); } // riprova tra 1 ora
    }
    if (is_array($cache)) {
        $out['rating'] = $cache['rating'] ?? null; $out['total'] = $cache['total'] ?? null;
        foreach (($cache['reviews'] ?? []) as $r) $out['reviews'][] = $r;
    }
}

// ---- recensioni aggiunte a mano ----
$mf = $dataDir . '/reviews_manual.json';
$man = is_file($mf) ? json_decode((string)file_get_contents($mf), true) : [];
foreach ((array)$man as $r) {
    if (!is_array($r)) continue;
    $out['reviews'][] = ['author' => (string)($r['author'] ?? ''), 'authorUrl' => '', 'photo' => '', 'rating' => (int)($r['rating'] ?? 5),
        'text' => (string)($r['text'] ?? ''), 'when' => '', 'date' => (string)($r['date'] ?? ''), 'source' => (string)($r['source'] ?? 'google')];
}
$out['reviews'] = array_values(array_filter($out['reviews'], fn($r) => $r['rating'] >= $min && trim($r['text']) !== ''));
echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
