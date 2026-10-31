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

// Invio tramite SMTP autenticato (se in config.php e' impostato smtp_host).
function smtp_send(array $c, string $to, string $subject, string $body, string $from, string $fromName, string $replyTo): bool {
    $host = (string)$c['smtp_host']; $port = (int)($c['smtp_port'] ?? 465);
    $sec  = (string)($c['smtp_secure'] ?? 'ssl');
    $user = (string)($c['smtp_user'] ?? ''); $pass = (string)($c['smtp_pass'] ?? '');
    $local = in_array($host, ['localhost', '127.0.0.1', '::1'], true);
    $ctx = stream_context_create(['ssl' => ['verify_peer' => !$local, 'verify_peer_name' => !$local, 'allow_self_signed' => $local]]);
    $fp = @stream_socket_client(($sec === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port, $en, $es, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { error_log("dvor smtp: connect $host:$port failed: $es"); return false; }
    stream_set_timeout($fp, 15);
    $rd = function () use ($fp): string { $r = ''; while (($l = fgets($fp, 1024)) !== false) { $r .= $l; if (strlen($l) < 4 || $l[3] === ' ') break; } return $r; };
    $cmd = function (string $s, string $ok) use ($fp, $rd): bool { if ($s !== '') fwrite($fp, $s . "\r\n"); $r = $rd(); if (strpos($r, $ok) !== 0) { error_log('dvor smtp: ' . trim($s === '' ? 'greeting' : (stripos($s, 'AUTH') === 0 || !preg_match('/^[A-Z]/', $s) ? 'auth' : $s)) . ' -> ' . trim($r)); return false; } return true; };
    $me = $_SERVER['SERVER_NAME'] ?? 'localhost';
    if (!$cmd('', '220') || !$cmd("EHLO $me", '250')) { fclose($fp); return false; }
    if ($sec === 'tls') {
        if (!$cmd('STARTTLS', '220') || !@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT) || !$cmd("EHLO $me", '250')) { fclose($fp); return false; }
    }
    if ($user !== '') {
        if (!$cmd('AUTH LOGIN', '334') || !$cmd(base64_encode($user), '334') || !$cmd(base64_encode($pass), '235')) { fclose($fp); return false; }
    }
    $h  = 'From: =?UTF-8?B?' . base64_encode($fromName) . "?= <$from>\r\nTo: <$to>\r\nReply-To: $replyTo\r\n";
    $h .= 'Subject: =?UTF-8?B?' . base64_encode($subject) . "?=\r\nDate: " . date('r') . "\r\nMessage-ID: <" . bin2hex(random_bytes(8)) . "@$me>\r\n";
    $h .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
    $data = $h . "\r\n" . chunk_split(base64_encode($body)) . "\r\n.";
    $ok = $cmd("MAIL FROM:<$from>", '250') && $cmd("RCPT TO:<$to>", '25') && $cmd('DATA', '354') && $cmd($data, '250');
    @fwrite($fp, "QUIT\r\n"); fclose($fp);
    return $ok;
}

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
$lang    = in_array($_POST['lang'] ?? 'it', ['it','en','de','sl','nl'], true) ? ($_POST['lang'] ?? 'it') : 'it';

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(422, ['ok' => false, 'error' => 'invalid']);

$labels = ['table' => 'Prenotazione di un tavolo', 'event' => 'Evento privato', 'other' => 'Altra richiesta'];
if (!isset($labels[$reason])) $reason = 'other';
$to = $cfg['mail_to_info'];

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
$ok = false;
if (!empty($cfg['smtp_host'])) {
    $ok = smtp_send($cfg, $to, $subject, $body, $cfg['mail_from'], $cfg['site_name'], $email);
} else {
$ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . $cfg['mail_from']);
if (!$ok) $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
}
if (!$ok) error_log('dvor contact: invio a ' . $to . ' non riuscito (smtp_host ' . (empty($cfg['smtp_host']) ? 'vuoto: uso mail()' : $cfg['smtp_host']) . ')');

// Conferma di ricevimento al cliente (la richiesta e' gia' arrivata a info@: un errore qui non blocca nulla)
if ($ok) {
    $tr = [
        'it' => ['Abbiamo ricevuto la tua richiesta - Osteria Enoteca Dvor', "Gentile {n},\n\nabbiamo ricevuto la tua richiesta e ti risponderemo al più presto.\n\nEcco il riepilogo di quanto ci hai scritto:\n\n{m}\n\nPer urgenze puoi chiamarci al +39 0481 090740.\n\nA presto,\nOsteria Enoteca Dvor"],
        'en' => ['We have received your request - Osteria Enoteca Dvor', "Dear {n},\n\nwe have received your request and will get back to you as soon as possible.\n\nHere is a summary of your message:\n\n{m}\n\nFor urgent matters you can call us on +39 0481 090740.\n\nKind regards,\nOsteria Enoteca Dvor"],
        'de' => ['Wir haben Ihre Anfrage erhalten - Osteria Enoteca Dvor', "Guten Tag {n},\n\nwir haben Ihre Anfrage erhalten und melden uns so schnell wie möglich.\n\nHier die Zusammenfassung Ihrer Nachricht:\n\n{m}\n\nIn dringenden Fällen erreichen Sie uns unter +39 0481 090740.\n\nFreundliche Grüsse,\nOsteria Enoteca Dvor"],
        'sl' => ['Prejeli smo vaše povpraševanje - Osteria Enoteca Dvor', "Spoštovani {n},\n\nprejeli smo vaše povpraševanje in vam bomo odgovorili v najkrajšem možnem času.\n\nPovzetek vašega sporočila:\n\n{m}\n\nV nujnih primerih nas pokličite na +39 0481 090740.\n\nLep pozdrav,\nOsteria Enoteca Dvor"],
        'nl' => ['We hebben uw aanvraag ontvangen - Osteria Enoteca Dvor', "Beste {n},\n\nwe hebben uw aanvraag ontvangen en antwoorden zo snel mogelijk.\n\nHierbij een samenvatting van uw bericht:\n\n{m}\n\nVoor dringende zaken kunt u ons bellen op +39 0481 090740.\n\nMet vriendelijke groet,\nOsteria Enoteca Dvor"],
    ];
    $t2 = $tr[$lang] ?? $tr['it'];
    $b2 = str_replace(['{n}', '{m}'], [$name, $message], $t2[1]);
    if (!empty($cfg['smtp_host'])) {
        smtp_send($cfg, $email, $t2[0], $b2, $cfg['mail_from'], $cfg['site_name'], $to);
    } else {
        $h2 = ['From: ' . $cfg['site_name'] . ' <' . $cfg['mail_from'] . '>', 'Reply-To: ' . $to, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit'];
        @mail($email, '=?UTF-8?B?' . base64_encode($t2[0]) . '?=', $b2, implode("\r\n", $h2), '-f' . $cfg['mail_from']);
    }
}
out($ok ? 200 : 500, ['ok' => (bool)$ok, 'error' => $ok ? null : 'mail']);
