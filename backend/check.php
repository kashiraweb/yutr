<?php
declare(strict_types=1);
// Diagnóstico temporal. BÓRRALO antes de publicar el sitio.
require_once __DIR__ . '/config/database.php';
header('Content-Type: text/plain; charset=utf-8');

if (empty(db_local()['debug'])) {
    http_response_code(403);
    exit("Desactivado. Pon 'debug' => true en backend/config/database.local.php\n");
}

$c = db_config();
echo "1. PHP funciona. Versión: " . PHP_VERSION . "\n";
echo "2. Extensión pdo_mysql: " . (extension_loaded('pdo_mysql') ? 'OK' : 'FALTA (actívala en php.ini)') . "\n";
echo "3. Archivo database.local.php: " . (is_file(__DIR__ . '/config/database.local.php') ? 'encontrado' : 'NO encontrado') . "\n";
echo "4. Configuración leída -> servidor: '{$c['host']}', base: '{$c['name']}', usuario: '{$c['user']}'\n";
try {
    $pdo = get_db();
    echo "5. Conexión a MySQL: OK\n";
    $n = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    echo "6. Tabla users: OK ($n usuarios registrados)\n";
    echo "\nTodo está bien. El registro y el inicio de sesión deberían funcionar.\n";
} catch (Throwable $e) {
    echo "FALLO: " . $e->getMessage() . "\n";
}
