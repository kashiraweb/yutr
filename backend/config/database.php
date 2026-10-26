<?php
declare(strict_types=1);

/*
 * CODEXA · Configuración de la conexión con MySQL
 *
 * ESTADO: PENDIENTE DE CONFIGURAR. Mientras no se definan los datos de abajo,
 * el registro y el inicio de sesión responden que la base de datos no está
 * disponible y NO guardan ni validan nada.
 *
 * Opción A (recomendada en XAMPP): editar backend/config/database.local.php.
 * Opción B: variables de entorno del servidor. Los datos no están escritos aquí:
 * se leen de variables de entorno
 * del servidor (en Apache: SetEnv CODEXA_DB_NAME codexa, en el VirtualHost
 * o en un archivo fuera de la carpeta pública).
 *
 *   CODEXA_DB_HOST   (por defecto: localhost)
 *   CODEXA_DB_NAME   (obligatoria)
 *   CODEXA_DB_USER   (obligatoria)
 *   CODEXA_DB_PASS   (contraseña del usuario de MySQL)
 *
 * Para activar el sistema:
 *   1. Crear la base de datos y la tabla con el SQL de abajo.
 *   2. Crear un usuario de MySQL con permisos solo sobre esa base.
 *   3. Definir las variables de entorno anteriores.
 *
 *   CREATE DATABASE codexa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 *   USE codexa;
 *   CREATE TABLE users (
 *     id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 *     username      VARCHAR(20)  NOT NULL,
 *     password_hash VARCHAR(255) NOT NULL,
 *     created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *     CONSTRAINT uq_users_username UNIQUE (username)
 *   ) ENGINE=InnoDB;
 */

function db_local(): array
{
    static $local = null;
    if ($local === null) {
        $f = __DIR__ . '/database.local.php';
        $local = is_file($f) ? (array)(require $f) : [];
    }
    return $local;
}

// Prioridad: database.local.php; si no existe, variables de entorno.
function db_config(): array
{
    $l = db_local();
    return [
        'host' => $l['host'] ?? (getenv('CODEXA_DB_HOST') ?: 'localhost'),
        'name' => $l['name'] ?? (getenv('CODEXA_DB_NAME') ?: ''),
        'user' => $l['user'] ?? (getenv('CODEXA_DB_USER') ?: ''),
        'pass' => $l['pass'] ?? (getenv('CODEXA_DB_PASS') ?: ''),
    ];
}

// Modo de prueba: con 'debug' => true se muestra el motivo técnico del fallo. Apágalo al publicar.
function debug_info(string $reason): array
{
    return !empty(db_local()['debug']) ? ['debug' => $reason] : [];
}

function db_is_configured(): bool
{
    $c = db_config();
    return $c['name'] !== '' && $c['user'] !== '';
}

function get_db(): PDO
{
    if (!db_is_configured()) {
        throw new RuntimeException('Base de datos sin configurar.');
    }
    $c = db_config();
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $c['host'], $c['name']);
    return new PDO($dsn, $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
}

function respond(int $code, array $body): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
