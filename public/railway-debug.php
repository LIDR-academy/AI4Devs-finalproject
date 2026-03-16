<?php
// DIAGNÓSTICO DIRECTO - Sin router, sin nada
// Acceder directamente: https://[tu-app].up.railway.app/railway-debug.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
http_response_code(200);

$result = [
    'success' => true,
    'message' => 'Railway Debug - Direct Access',
    'php_version' => phpversion(),
    'php_sapi' => php_sapi_name(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown',
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'unknown',
    'pwd' => getcwd(),
    'env_vars' => [],
    'env_var_count' => 0
];

// Lista de variables que buscamos
$searchVars = [
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_PASS',
    'MYSQLHOST', 'MYSQLPORT', 'MYSQLDATABASE', 'MYSQLUSER', 'MYSQLPASSWORD',
    'APP_ENV', 'PORT', 'RAILWAY_ENVIRONMENT', 'RAILWAY_SERVICE_NAME'
];

// Buscar en $_ENV
foreach ($_ENV as $key => $value) {
    if (in_array($key, $searchVars)) {
        $result['env_vars'][$key] = 'SET (in $_ENV)';
        $result['env_var_count']++;
    }
}

// Buscar en $_SERVER
foreach ($_SERVER as $key => $value) {
    if (in_array($key, $searchVars) && !isset($result['env_vars'][$key])) {
        $result['env_vars'][$key] = 'SET (in $_SERVER)';
        $result['env_var_count']++;
    }
}

// Buscar con getenv()
foreach ($searchVars as $var) {
    if (!isset($result['env_vars'][$var])) {
        $value = getenv($var);
        if ($value !== false) {
            $result['env_vars'][$var] = 'SET (via getenv)';
            $result['env_var_count']++;
        } else {
            $result['env_vars'][$var] = 'NOT SET';
        }
    }
}

// Verificar archivos importantes
$result['files'] = [
    'bootstrap.php' => file_exists(__DIR__ . '/../src/bootstrap.php') ? 'EXISTS' : 'MISSING',
    'index.php' => file_exists(__DIR__ . '/index.php') ? 'EXISTS' : 'MISSING',
    '.env' => file_exists(__DIR__ . '/../.env') ? 'EXISTS' : 'MISSING',
    'composer.json' => file_exists(__DIR__ . '/../composer.json') ? 'EXISTS' : 'MISSING'
];

// Extensiones PHP
$result['extensions'] = [
    'pdo' => extension_loaded('pdo') ? 'LOADED' : 'MISSING',
    'pdo_mysql' => extension_loaded('pdo_mysql') ? 'LOADED' : 'MISSING',
    'mysqli' => extension_loaded('mysqli') ? 'LOADED' : 'MISSING',
    'json' => extension_loaded('json') ? 'LOADED' : 'MISSING',
    'mbstring' => extension_loaded('mbstring') ? 'LOADED' : 'MISSING'
];

// Permisos de escritura
$result['writable'] = [
    '/tmp' => is_writable('/tmp') ? 'YES' : 'NO',
    'current_dir' => is_writable(getcwd()) ? 'YES' : 'NO'
];

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
