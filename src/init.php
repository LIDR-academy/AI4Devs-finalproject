<?php
require_once __DIR__ . '/bootstrap.php';
use App\Services\DatabaseService;

// Establecer headers antes de cualquier output
header('Content-Type: application/json');
http_response_code(200);

try {
    // Log para debugging
    error_log("[INIT] Iniciando inicialización de base de datos");
    
    // Intentar inicializar la base de datos
    $schemaFile = __DIR__ . '/../db/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception('Archivo schema.sql no encontrado en: ' . $schemaFile);
    }
    
    error_log("[INIT] Archivo schema.sql encontrado");
    
    // Ejecutar el script de creación de base de datos
    $schema = file_get_contents($schemaFile);
    DatabaseService::executeScript($schema, true);
    
    error_log("[INIT] Schema ejecutado correctamente");
    
    // Ejecutar script de datos iniciales si existe
    $dataFile = __DIR__ . '/../db/data.sql';
    if (file_exists($dataFile)) {
        $data = file_get_contents($dataFile);
        DatabaseService::executeScript($data);
        error_log("[INIT] Data.sql ejecutado correctamente");
    }
    
    // Si llegamos aquí, la inicialización fue exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Base de datos inicializada correctamente',
        'redirect' => '/' // El frontend manejará la redirección
    ]);
    
} catch (Exception $e) {
    error_log("[INIT ERROR] " . $e->getMessage());
    error_log("[INIT ERROR] Trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al inicializar la base de datos: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}