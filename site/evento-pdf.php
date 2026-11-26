<?php
// Scarica in un unico PDF tutte le immagini/menù di un evento (solo sito principale).
// Uso: evento-pdf.php?t=Titolo&f[]=URL1&f[]=URL2 ... Accetta solo immagini di prenota.osteriadvor.com/uploads/ o di questo sito.
declare(strict_types=1);
$MAX = 20; $MAXB = 12 * 1024 * 1024;
$files = isset($_GET['f']) && is_array($_GET['f']) ? array_slice($_GET['f'], 0, $MAX) : [];
$title = trim(preg_replace('/[^\p{L}\p{N} _.\-]+/u', ' ', (string)($_GET['t'] ?? 'evento')));
$slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $title) ?: 'evento')), '-') ?: 'evento';
$root = __DIR__;

function fail(int $c, string $m): void { http_response_code($c); header('Content-Type: text/plain; charset=utf-8'); echo $m; exit; }
function fetch_remote(string $url, int $max): ?string {
    if (function_exists('curl_init')) {
        $c = curl_init($url);
        curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_FOLLOWLOCATION => false, CURLOPT_MAXFILESIZE => $max]);
        $r = curl_exec($c); $code = (int)curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    } else {
        $r = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 15]])); $code = $r === false ? 0 : 200;
    }
    return ($r !== false && $r !== null && $code === 200 && strlen((string)$r) <= $max) ? (string)$r : null;
}
function load_image(string $u, string $root, string $me, int $max): ?string {
    $p = parse_url($u);
    if (!$p || empty($p['path'])) {
        $p = ['path' => $u];
    }
    $path = (string)$p['path'];
    if (!preg_match('~\.(jpe?g|png|webp|gif)$~i', $path)) return null;
    $host = strtolower((string)($p['host'] ?? ''));
    if ($host === 'prenota.osteriadvor.com' && preg_match('~^/uploads/[A-Za-z0-9_.-]+$~', $path)) {
        return fetch_remote('https://prenota.osteriadvor.com' . $path, $max);
    }
    if ($host === '' || $host === $me || $host === 'www.' . $me || 'www.' . $host === $me) {
        $rel = ltrim($path, '/');
        if (!preg_match('~^(images|uploads)/[A-Za-z0-9_./-]+$~', $rel) || strpos($rel, '..') !== false) return null;
        $f = realpath($root . '/' . $rel);
        if ($f && strpos($f, $root . DIRECTORY_SEPARATOR) === 0 && is_file($f) && filesize($f) <= $max) return (string)file_get_contents($f);
        return null;
    }
    return null;
}
// ogni immagine diventa un JPEG (RGB/grigio) pronto da incorporare
function to_jpeg(string $raw): ?array {
    $i = @getimagesizefromstring($raw);
    if (!$i) return null;
    if ($i[2] === IMAGETYPE_JPEG && in_array($i['channels'] ?? 3, [1, 3], true)) return ['d' => $raw, 'w' => $i[0], 'h' => $i[1], 'cs' => (($i['channels'] ?? 3) === 1) ? '/DeviceGray' : '/DeviceRGB'];
    if (!function_exists('imagecreatefromstring')) return null;
    $im = @imagecreatefromstring($raw);
    if (!$im) return null;
    $w = imagesx($im); $h = imagesy($im);
    $bg = imagecreatetruecolor($w, $h);
    imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
    imagecopy($bg, $im, 0, 0, 0, 0, $w, $h);
    ob_start(); imagejpeg($bg, null, 88); $d = (string)ob_get_clean();
    return ['d' => $d, 'w' => $w, 'h' => $h, 'cs' => '/DeviceRGB'];
}

$me = strtolower(preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? '')));
$imgs = [];
foreach ($files as $u) {
    if (!is_string($u) || strlen($u) > 300) continue;
    $raw = load_image($u, $root, $me, $MAXB);
    if ($raw === null) continue;
    $j = to_jpeg($raw);
    if ($j) $imgs[] = $j;
}
if (!$imgs) fail(404, 'Nessuna immagine disponibile.');

// PDF a mano: una pagina per immagine, pagina grande quanto l'immagine (lato lungo max 842 pt)
$objs = []; $pages = [];
$add = function (string $s) use (&$objs): int { $objs[] = $s; return count($objs); };
$add(''); $add(''); // 1 catalogo, 2 elenco pagine (compilati dopo)
foreach ($imgs as $k => $im) {
    $sc = min(1.0, 842 / max($im['w'], $im['h']));
    $pw = round($im['w'] * $sc, 2); $ph = round($im['h'] * $sc, 2);
    $io = $add('<< /Type /XObject /Subtype /Image /Width ' . $im['w'] . ' /Height ' . $im['h'] . ' /ColorSpace ' . $im['cs'] . ' /BitsPerComponent 8 /Filter /DCTDecode /Length ' . strlen($im['d']) . " >>\nstream\n" . $im['d'] . "\nendstream");
    $c = "q $pw 0 0 $ph 0 0 cm /Im0 Do Q";
    $co = $add('<< /Length ' . strlen($c) . " >>\nstream\n$c\nendstream");
    $pages[] = $add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 $pw $ph] /Resources << /XObject << /Im0 $io 0 R >> >> /Contents $co 0 R >>");
}
$objs[0] = '<< /Type /Catalog /Pages 2 0 R >>';
$objs[1] = '<< /Type /Pages /Kids [' . implode(' ', array_map(fn($n) => "$n 0 R", $pages)) . '] /Count ' . count($pages) . ' >>';
$out = "%PDF-1.4\n"; $off = [];
foreach ($objs as $n => $o) { $off[$n] = strlen($out); $out .= ($n + 1) . " 0 obj\n$o\nendobj\n"; }
$x = strlen($out);
$out .= "xref\n0 " . (count($objs) + 1) . "\n0000000000 65535 f \n";
foreach ($off as $o) $out .= sprintf("%010d 00000 n \n", $o);
$out .= 'trailer << /Size ' . (count($objs) + 1) . " /Root 1 0 R >>\nstartxref\n$x\n%%EOF";

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="dvor-' . $slug . '.pdf"');
header('Content-Length: ' . strlen($out));
header('Cache-Control: public, max-age=3600');
echo $out;
