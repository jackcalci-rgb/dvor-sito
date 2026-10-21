<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
$cfg = require __DIR__ . '/config.php';

function out(int $code, array $d): void { http_response_code($code); echo json_encode($d); exit; }
function clean(string $s, int $max): string {
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr(trim($s), 0, $max);
}
function oneline(string $s, int $max): string { return str_replace(["\r", "\n"], ' ', clean($s, $max)); }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);

// Trappola antispam: questo campo, nascosto, lo riempiono solo i bot.
if (!empty($_POST['website'])) out(200, ['ok' => true]);
$t = (int)($_POST['t'] ?? 0);
$d = (int)(microtime(true) * 1000) - $t;
if ($t > 0 && $d >= 0 && $d < 3000) out(429, ['ok' => false, 'error' => 'too_fast']);

// Massimo 5 messaggi ogni 10 minuti per indirizzo IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'x';
$rf = sys_get_temp_dir() . '/dvor_rate_' . sha1($ip);
$now = time();
$hits = [];
if (is_file($rf)) {
    foreach (explode("\n", (string)@file_get_contents($rf)) as $l) { if ($l !== '' && (int)$l > $now - 600) $hits[] = (int)$l; }
}
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = $now;
@file_put_contents($rf, implode("\n", $hits), LOCK_EX);

$name    = oneline((string)($_POST['name'] ?? ''), 100);
$email   = oneline((string)($_POST['email'] ?? ''), 150);
$phone   = oneline((string)($_POST['phone'] ?? ''), 40);
$date    = oneline((string)($_POST['date'] ?? ''), 20);
$guests  = oneline((string)($_POST['guests'] ?? ''), 6);
$message = clean((string)($_POST['message'] ?? ''), 4000);
$reason  = (string)($_POST['reason'] ?? 'other');
$lang    = in_array($_POST['lang'] ?? 'it', ['it','en','de','sl','nl'], true) ? $_POST['lang'] : 'it';

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'invalid']);

$labels = ['table' => 'Prenotazione di un tavolo', 'event' => 'Evento privato', 'other' => 'Altra richiesta'];
if (!isset($labels[$reason])) $reason = 'other';
$to = $reason === 'other' ? $cfg['mail_to_info'] : $cfg['mail_to_reservations'];

$subject = 'Richiesta dal sito - ' . $labels[$reason];
$body  = "Nuova richiesta dal sito ({$cfg['site_name']})\n\n";
$body .= "Motivo: {$labels[$reason]}\nNome: $name\nEmail: $email\n";
if ($phone !== '')  $body .= "Telefono: $phone\n";
if ($date !== '')   $body .= "Data: $date\n";
if ($guests !== '') $body .= "Ospiti: $guests\n";
$body .= "Lingua del sito: " . strtoupper($lang) . "\n\nMessaggio:\n$message\n";

$headers = [
    'From: ' . $cfg['site_name'] . ' <' . $cfg['mail_from'] . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
$ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . $cfg['mail_from']);
if (!$ok) $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
out($ok ? 200 : 500, ['ok' => (bool)$ok, 'error' => $ok ? null : 'mail']);
