<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Método no permitido.']);
}

$username = trim((string)($_POST['username'] ?? ''));
$password = (string)($_POST['password'] ?? '');

if ($username === '' || $password === '') {
    respond(422, ['ok' => false, 'message' => 'Completa los dos campos para continuar.']);
}

$invalid = ['ok' => false, 'message' => 'Usuario o contraseña incorrectos.'];

// Entradas con formato imposible: mismo mensaje genérico, sin consultar la base.
if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username) || strlen($password) > 72) {
    respond(401, $invalid);
}

if (!db_is_configured()) {
    respond(503, ['ok' => false, 'message' => 'No se pudo completar la operación. Inténtalo de nuevo.'] + debug_info('Falta configurar la base de datos (nombre o usuario vacíos).'));
}

try {
    $pdo  = get_db();
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM users WHERE username = :u LIMIT 1');
    $stmt->execute([':u' => $username]);
    $user = $stmt->fetch();

    // Se verifica siempre un hash para que el tiempo de respuesta no delate si el usuario existe.
    $hash  = $user ? $user['password_hash'] : password_hash('codexa-no-user', PASSWORD_DEFAULT);
    $valid = password_verify($password, $hash) && $user;

    if (!$valid) {
        respond(401, $invalid);
    }

    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        $up = $pdo->prepare('UPDATE users SET password_hash = :h WHERE id = :id');
        $up->execute([':h' => password_hash($password, PASSWORD_DEFAULT), ':id' => $user['id']]);
    }
} catch (Throwable $e) {
    error_log('CODEXA login: ' . $e->getMessage());
    respond(500, ['ok' => false, 'message' => 'No se pudo completar la operación. Inténtalo de nuevo.'] + debug_info($e->getMessage()));
}

// Sesión segura
ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();
session_regenerate_id(true);
$_SESSION['user_id']  = (int)$user['id'];
$_SESSION['username'] = $user['username'];

// Punto de enlace para la siguiente fase: aquí aún no se redirige a ninguna página.
respond(200, ['ok' => true, 'message' => 'Sesión iniciada correctamente.']);
