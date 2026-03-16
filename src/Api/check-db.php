<?php
require_once __DIR__ . '/../bootstrap.php';

use App\Services\DatabaseService;
use App\Utils\Environment;

header('Content-Type: application/json');
http_response_code(200);

try {
    // Log para debugging
    error_log("[CHECK-DB] Iniciando verificación de base de datos");
    
    // Verificar que tenemos las variables de entorno
    // Intentar primero con las variables estándar, luego con las de Railway
    $dbHost = Environment::get('DB_HOST') ?? Environment::get('MYSQLHOST');
    $dbName = Environment::get('DB_NAME') ?? Environment::get('MYSQLDATABASE');
    $dbUser = Environment::get('DB_USER') ?? Environment::get('MYSQLUSER');
    $dbPass = Environment::get('DB_PASSWORD') ?? Environment::get('DB_PASS') ?? Environment::get('MYSQLPASSWORD');
    
    error_log("[CHECK-DB] DB_HOST: " . ($dbHost ?? 'NO CONFIGURADO'));
    error_log("[CHECK-DB] DB_NAME: " . ($dbName ?? 'NO CONFIGURADO'));
    error_log("[CHECK-DB] DB_USER: " . ($dbUser ?? 'NO CONFIGURADO'));
    error_log("[CHECK-DB] DB_PASS: " . ($dbPass ? 'CONFIGURADO' : 'NO CONFIGURADO'));
    
    if (!$dbHost || !$dbName || !$dbUser || !$dbPass) {
        error_log("[CHECK-DB] Variables de entorno faltantes");
        echo json_encode([
            'success' => false,
            'message' => 'Variables de entorno de base de datos no configuradas',
            'debug' => [
                'DB_HOST' => $dbHost ? 'OK' : 'MISSING',
                'DB_NAME' => $dbName ? 'OK' : 'MISSING',
                'DB_USER' => $dbUser ? 'OK' : 'MISSING',
                'DB_PASS' => $dbPass ? 'OK' : 'MISSING'
            ]
        ]);
        exit;
    }
    
    // Verificar si las tablas existen
    $tables = ['usuarios', 'herramientas', 'movimientos_herramienta', 'codigos_login'];
    $allTablesExist = true;
    $missingTables = [];
    
    error_log("[CHECK-DB] Verificando tablas...");
    
    foreach ($tables as $table) {
        try {
            $result = DatabaseService::executeQuery("SHOW TABLES LIKE ?", [$table]);
            if (empty($result)) {
                $allTablesExist = false;
                $missingTables[] = $table;
                error_log("[CHECK-DB] Tabla faltante: {$table}");
            } else {
                error_log("[CHECK-DB] Tabla OK: {$table}");
            }
        } catch (\Exception $e) {
            $allTablesExist = false;
            $missingTables[] = $table;
            error_log("[CHECK-DB] Error verificando tabla {$table}: " . $e->getMessage());
        }
    }
    
    if ($allTablesExist) {
        error_log("[CHECK-DB] ✅ Todas las tablas existen");
        echo json_encode([
            'success' => true,
            'message' => 'Base de datos inicializada correctamente'
        ]);
    } else {
        error_log("[CHECK-DB] ⚠️ Tablas faltantes: " . implode(', ', $missingTables));
        echo json_encode([
            'success' => false,
            'message' => 'Se requiere inicialización de la base de datos',
            'missing_tables' => $missingTables
        ]);
    }
    
} catch (\Exception $e) {
    error_log("[CHECK-DB] ❌ Error: " . $e->getMessage());
    error_log("[CHECK-DB] Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos',
        'error' => $e->getMessage()
    ]);
}