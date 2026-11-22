<?php
/**
 * Contact form handler — used when CONTACT_MODE is 'php' in js/config.js.
 * Only works on hosting that runs PHP and can send mail (most cPanel / shared hosting).
 * It does NOT work on GitHub Pages, Netlify or Vercel — use Formspree there.
 *
 * Returns JSON: {"ok":true}  or  {"ok":false,"error":"..."}
 */

// ---- Settings ----
const TO_EMAIL  = 'marcaustriapelayo@gmail.com';
// Sender address. Many hosts only deliver mail "from" an address on your own domain,
// e.g. 'no-reply@marcpelayo.dev'. Leave empty to use no-reply@<this site's domain>.
const FROM_EMAIL = '';
const SUBJECTS  = ['Internship / OJT', 'Job offer', 'Freelance / PC repair', 'Other'];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply(bool $ok, string $error = '', int $code = 200): void {
    http_response_code($code);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(false, 'Method not allowed.', 405);
}

// Honeypot: real visitors never fill this hidden field. Pretend success so bots learn nothing.
if (trim((string)($_POST['_gotcha'] ?? '')) !== '') {
    reply(true);
}

// Read fields as plain strings
$name    = trim((string)($_POST['name'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$subject = trim((string)($_POST['subject'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

// ---- Validation ----
if ($name === '' || mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    reply(false, 'Please enter your name (2–100 characters).', 422);
}
// Header injection guard: no line breaks (or other control characters) in anything that could reach a header
if (preg_match('/[\r\n\0]/', $name . $email . $subject)) {
    reply(false, 'Invalid characters in the form.', 422);
}
if ($email === '' || mb_strlen($email) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(false, 'Please enter a valid email address.', 422);
}
if (!in_array($subject, SUBJECTS, true)) {
    reply(false, 'Please choose a subject.', 422);
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    reply(false, 'Please write a message of 10–5000 characters.', 422);
}

// ---- Build the email ----
$host = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['SERVER_NAME'] ?? 'localhost');
$from = FROM_EMAIL !== '' ? FROM_EMAIL : 'no-reply@' . ($host !== '' ? $host : 'localhost');

// Name goes into the subject line, so strip anything unusual from it
$safeName = preg_replace('/[^\p{L}\p{N} .\'\-]/u', '', $name);
$mailSubject = '=?UTF-8?B?' . base64_encode('Portfolio: ' . $subject . ' — ' . $safeName) . '?=';

$body  = "New message from your portfolio contact form\n";
$body .= "--------------------------------------------\n";
$body .= "Name:    {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= $message . "\n\n";
$body .= "--------------------------------------------\n";
$body .= 'Sent: ' . date('Y-m-d H:i') . ' · IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers = implode("\r\n", [
    'From: Portfolio <' . $from . '>',
    'Reply-To: ' . $email,            // validated above: a single address with no line breaks
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
]);

if (@mail(TO_EMAIL, $mailSubject, $body, $headers)) {
    reply(true);
}
reply(false, 'The server could not send the email right now.', 500);
