<?php
declare(strict_types=1);
// Riceve il preventivo di Natale generato sul sito e ne invia copia (PDF allegato) a info@.
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

// Invio SMTP (stessa logica di contact.php) con messaggio MIME gia' pronto
function smtp_raw(array $c, string $to, string $from, string $headers, string $body): bool {
    $host = (string)$c['smtp_host']; $port = (int)($c['smtp_port'] ?? 465); $sec = (string)($c['smtp_secure'] ?? 'ssl');
    $user = (string)($c['smtp_user'] ?? ''); $pass = (string)($c['smtp_pass'] ?? '');
    $local = in_array($host, ['localhost', '127.0.0.1', '::1'], true);
    $ctx = stream_context_create(['ssl' => ['verify_peer' => !$local, 'verify_peer_name' => !$local, 'allow_self_signed' => $local]]);
    $fp = @stream_socket_client(($sec === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port, $en, $es, 15, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) { error_log("dvor natale smtp: connect failed: $es"); return false; }
    stream_set_timeout($fp, 20);
    $rd = function () use ($fp): string { $r = ''; while (($l = fgets($fp, 1024)) !== false) { $r .= $l; if (strlen($l) < 4 || $l[3] === ' ') break; } return $r; };
    $cmd = function (string $s, string $ok) use ($fp, $rd): bool { if ($s !== '') fwrite($fp, $s . "\r\n"); $r = $rd(); if (strpos($r, $ok) !== 0) { error_log('dvor natale smtp: ' . trim($r)); return false; } return true; };
    $me = $_SERVER['SERVER_NAME'] ?? 'localhost';
    if (!$cmd('', '220') || !$cmd("EHLO $me", '250')) { fclose($fp); return false; }
    if ($sec === 'tls') {
        if (!$cmd('STARTTLS', '220') || !@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT) || !$cmd("EHLO $me", '250')) { fclose($fp); return false; }
    }
    if ($user !== '') {
        if (!$cmd('AUTH LOGIN', '334') || !$cmd(base64_encode($user), '334') || !$cmd(base64_encode($pass), '235')) { fclose($fp); return false; }
    }
    $data = $headers . "\r\nTo: <$to>\r\nDate: " . date('r') . "\r\nMessage-ID: <" . bin2hex(random_bytes(8)) . "@$me>\r\n\r\n" . $body . "\r\n.";
    $ok = $cmd("MAIL FROM:<$from>", '250') && $cmd("RCPT TO:<$to>", '25') && $cmd('DATA', '354') && $cmd($data, '250');
    @fwrite($fp, "QUIT\r\n"); fclose($fp);
    return $ok;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, ['ok' => false, 'error' => 'method']);
if (!empty($_POST['website'])) out(200, ['ok' => true]);
$t = (int)($_POST['t'] ?? 0);
$d = (int)(microtime(true) * 1000) - $t;
if ($t > 0 && $d >= 0 && $d < 3000) out(429, ['ok' => false, 'error' => 'too_fast']);

// Massimo 5 preventivi ogni 10 minuti per IP
$rf = sys_get_temp_dir() . '/dvor_natale_' . sha1($_SERVER['REMOTE_ADDR'] ?? 'x');
$now = time(); $hits = [];
if (is_file($rf)) foreach (explode("\n", (string)@file_get_contents($rf)) as $l) { if ($l !== '' && (int)$l > $now - 600) $hits[] = (int)$l; }
if (count($hits) >= 5) out(429, ['ok' => false, 'error' => 'rate']);
$hits[] = $now; @file_put_contents($rf, implode("\n", $hits), LOCK_EX);

$f = [];
foreach (['name' => 100, 'company' => 120, 'email' => 150, 'phone' => 40, 'date' => 30, 'number' => 40, 'kind' => 10, 'package' => 12, 'adults' => 5, 'kids' => 5, 'total' => 20, 'deposit' => 20, 'lang' => 2] as $k => $m) $f[$k] = oneline((string)($_POST[$k] ?? ''), $m);
$f['menu'] = oneline((string)($_POST['menu'] ?? ''), 1200);
$notes = clean((string)($_POST['notes'] ?? ''), 2000);
if ($f['name'] === '' || !filter_var($f['email'], FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9A-Z]{8,30}$/', $f['number'])) out(422, ['ok' => false, 'error' => 'invalid']);

$pdf = '';
if (isset($_FILES['pdf']) && is_uploaded_file($_FILES['pdf']['tmp_name']) && $_FILES['pdf']['size'] > 0 && $_FILES['pdf']['size'] < 3000000) {
    $pdf = (string)file_get_contents($_FILES['pdf']['tmp_name']);
    if (strncmp($pdf, '%PDF', 4) !== 0) $pdf = '';
}
if ($pdf === '') out(422, ['ok' => false, 'error' => 'pdf']);

$to = $cfg['mail_to_info'];
$subject = 'preventivo richiesto';
$text  = "Preventivo richiesto dal sito ({$cfg['site_name']}) - Pranzi e cene aziendali di Natale\n\n";
$text .= "Numero preventivo: {$f['number']}\n\nDATI DEL CLIENTE\nNome: {$f['name']}\n";
if ($f['company'] !== '') $text .= "Azienda: {$f['company']}\n";
$text .= "Email: {$f['email']}\nTelefono: {$f['phone']}\n";
if ($f['date'] !== '') $text .= "Data desiderata: {$f['date']}\n";
$text .= "\nRICHIESTA\nPacchetto: {$f['package']}\nPranzo/Cena: {$f['kind']}\nAdulti: {$f['adults']}  Bambini: {$f['kids']}\nTotale: {$f['total']}  Acconto 50%: {$f['deposit']}\nMenu: {$f['menu']}\n";
if ($notes !== '') $text .= "\nNote del cliente:\n$notes\n";
$text .= "\nLingua del sito: " . strtoupper($f['lang']) . "\nIl preventivo in PDF e' allegato.\n";

$fname = 'Preventivo-Dvor-' . $f['number'] . '.pdf';

// Costruisce un'email MIME con il PDF allegato e la spedisce (SMTP se configurato, altrimenti mail()).
function send_with_pdf(array $cfg, string $to, string $subject, string $text, string $replyTo, string $pdf, string $fname): bool {
    $b = '=_dvor_' . bin2hex(random_bytes(8));
    $hdr  = 'From: =?UTF-8?B?' . base64_encode($cfg['site_name']) . "?= <{$cfg['mail_from']}>\r\nReply-To: $replyTo\r\n";
    $hdr .= 'Subject: =?UTF-8?B?' . base64_encode($subject) . "?=\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$b\"";
    $body  = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text)) . "\r\n";
    $body .= "--$b\r\nContent-Type: application/pdf; name=\"$fname\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$fname\"\r\n\r\n" . chunk_split(base64_encode($pdf)) . "\r\n--$b--";
    if (!empty($cfg['smtp_host'])) return smtp_raw($cfg, $to, $cfg['mail_from'], $hdr, $body);
    $h2 = preg_replace('/^Subject:.*\r\n/m', '', $hdr);
    $enc = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return @mail($to, $enc, $body, $h2, '-f' . $cfg['mail_from']) || @mail($to, $enc, $body, $h2);
}

$ok = send_with_pdf($cfg, $to, $subject, $text, $f['email'], $pdf, $fname);

// Copia al cliente (solo se la copia a info@ e' partita; un eventuale errore qui non blocca nulla)
if ($ok) {
    $tr = [
        'it' => ['Il tuo preventivo - Osteria Enoteca Dvor', "Gentile {n},\n\nin allegato trovi il preventivo n. {no} per il pranzo/cena aziendale di Natale.\n\nPer confermare chiamaci al +39 0481 090740 oppure scrivi a info@osteriadvor.com allegando il preventivo o indicando il numero del preventivo.\n\nA presto,\nOsteria Enoteca Dvor"],
        'en' => ['Your quote - Osteria Enoteca Dvor', "Dear {n},\n\nplease find attached quote no. {no} for your corporate Christmas lunch/dinner.\n\nTo confirm, call us on +39 0481 090740 or write to info@osteriadvor.com attaching the quote or giving the quote number.\n\nKind regards,\nOsteria Enoteca Dvor"],
        'de' => ['Ihr Angebot - Osteria Enoteca Dvor', "Guten Tag {n},\n\nim Anhang finden Sie das Angebot Nr. {no} fuer Ihr Weihnachtsessen.\n\nZur Bestaetigung rufen Sie uns an unter +39 0481 090740 oder schreiben Sie an info@osteriadvor.com, mit dem Angebot im Anhang oder unter Angabe der Angebotsnummer.\n\nFreundliche Gruesse,\nOsteria Enoteca Dvor"],
        'sl' => ['Vasa ponudba - Osteria Enoteca Dvor', "Spostovani {n},\n\nv prilogi je ponudba st. {no} za vase bozicno poslovno kosilo/vecerjo.\n\nZa potrditev nas pokliccite na +39 0481 090740 ali pisite na info@osteriadvor.com s priloceno ponudbo ali navedbo stevilke ponudbe.\n\nLep pozdrav,\nOsteria Enoteca Dvor"],
        'nl' => ['Uw offerte - Osteria Enoteca Dvor', "Beste {n},\n\nin de bijlage vindt u offerte nr. {no} voor uw zakelijke kerstlunch/-diner.\n\nBel ons voor bevestiging op +39 0481 090740 of mail naar info@osteriadvor.com met de offerte als bijlage of onder vermelding van het offertenummer.\n\nMet vriendelijke groet,\nOsteria Enoteca Dvor"],
    ];
    $l = $tr[$f['lang']] ?? $tr['it'];
    $ctext = str_replace(['{n}', '{no}'], [$f['name'], $f['number']], $l[1]);
    send_with_pdf($cfg, $f['email'], $l[0], $ctext, $cfg['mail_to_info'], $pdf, $fname);
}
out($ok ? 200 : 500, ['ok' => (bool)$ok, 'error' => $ok ? null : 'mail']);
