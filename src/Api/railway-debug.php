<?php
// Diagnóstico ultra-simple para Railway
// NO requiere bootstrap, clases, ni nada

header('Content-Type: application/json');
http_response_code(200);

error_log("=== RAILWAY DEBUG START ===");

// 1. Verificar PHP version
$phpVersion = phpversion();
error_log("PHP Version: " . $phpVersion);

// 2. Verificar variables de entorno
$envVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DB_PASS',
    'MYSQLHOST',
    'MYSQLPORT',
    'MYSQLDATABASE',
    'MYSQLUSER',
    'MYSQLPASSWORD',
    'APP_ENV',
    'PORT'
];

$result = [
    'php_version' => $phpVersion,
    'env_vars' => [],
    'server_vars' => [],
    'getenv_vars' => []
];

foreach ($envVars as $var) {
    // Probar $_ENV
    $envValue = isset($_ENV[$var]) ? 'SET' : 'NOT SET';
    $result['env_vars'][$var] = $envValue;
    error_log("$var in \$_ENV: " . $envValue);
    
    // Probar $_SERVER
    $serverValue = isset($_SERVER[$var]) ? 'SET' : 'NOT SET';
    $result['server_vars'][$var] = $serverValue;
    error_log("$var in \$_SERVER: " . $serverValue);
    
    // Probar getenv()
    $getenvValue = getenv($var);
    $result['getenv_vars'][$var] = $getenvValue !== false ? 'SET' : 'NOT SET';
    error_log("$var with getenv(): " . ($getenvValue !== false ? 'SET' : 'NOT SET'));
}

// 3. Ver si hay .env file
$envFilePath = __DIR__ . '/../../.env';
$result['env_file_exists'] = file_exists($envFilePath);
error_log(".env file exists: " . ($result['env_file_exists'] ? 'YES' : 'NO'));

// 4. Verificar extensiones PHP necesarias
$extensions = ['pdo', 'pdo_mysql', 'mysqli'];
$result['extensions'] = [];
foreach ($extensions as $ext) {
    $loaded = extension_loaded($ext);
    $result['extensions'][$ext] = $loaded ? 'LOADED' : 'NOT LOADED';
    error_log("Extension $ext: " . ($loaded ? 'LOADED' : 'NOT LOADED'));
}

error_log("=== RAILWAY DEBUG END ===");

echo json_encode($result, JSON_PRETTY_PRINT);
