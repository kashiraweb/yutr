<?php
// Configuración local de MySQL (XAMPP por defecto). Cambia estos valores si los tuyos son distintos.
// IMPORTANTE: este archivo contiene credenciales. No lo subas a un repositorio público.
return [
    'host'  => 'localhost',
    'name'  => 'codexa',   // nombre de tu base de datos
    'user'  => 'root',     // usuario de MySQL
    'pass'  => '',         // contraseña de MySQL (en XAMPP suele estar vacía)
    'debug' => true,       // muestra el motivo técnico del fallo; ponlo en false al publicar
];
