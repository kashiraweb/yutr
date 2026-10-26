<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Método no permitido.']);
}

$username = trim((string)($_POST['username'] ?? ''));
$password = (string)($_POST['password'] ?? '');

// El servidor valida siempre, aunque el navegador ya lo haya hecho.
$errors = [];
if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username)) {
    $errors['username'] = 'Usa de 3 a 20 caracteres: letras, números o guion bajo.';
}
if (mb_strlen($password, 'UTF-8') < 8) {
    $errors['password'] = 'La contraseña debe tener al menos 8 caracteres.';
} elseif (strlen($password) > 72) {
    $errors['password'] = 'La contraseña es demasiado larga.';
}
if ($errors) {
    respond(422, ['ok' => false, 'message' => 'Revisa los datos del formulario.', 'errors' => $errors]);
}

// Sin base de datos configurada no se guarda nada ni se finge éxito.
if (!db_is_configured()) {
    respond(503, ['ok' => false, 'message' => 'No se pudo completar la operación. Inténtalo de nuevo.'] + debug_info('Falta configurar la base de datos (nombre o usuario vacíos).'));
}

try {
    $pdo  = get_db();
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:u, :h)');
    $stmt->execute([':u' => $username, ':h' => password_hash($password, PASSWORD_DEFAULT)]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') { // nombre de usuario duplicado
        respond(409, ['ok' => false, 'message' => 'El nombre de usuario ya está en uso.', 'errors' => ['username' => 'El nombre de usuario ya está en uso.']]);
    }
    error_log('CODEXA register: ' . $e->getMessage());
    respond(500, ['ok' => false, 'message' => 'No se pudo completar la operación. Inténtalo de nuevo.'] + debug_info($e->getMessage()));
} catch (RuntimeException $e) {
    respond(503, ['ok' => false, 'message' => 'No se pudo completar la operación. Inténtalo de nuevo.'] + debug_info('Falta configurar la base de datos (nombre o usuario vacíos).'));
}

respond(201, ['ok' => true, 'message' => 'La cuenta se ha creado correctamente.']);
