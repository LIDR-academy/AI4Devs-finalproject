<?php
namespace App\Api;

require_once __DIR__ . '/../bootstrap.php';

// Configurar cabeceras para API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si es una petición OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Prevenir que PHP muestre errores directamente
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Capturar todos los errores
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Capturar errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
        echo json_encode([
            'success' => false,
            'message' => 'Error interno del servidor',
            'error' => $error['message']
        ]);
    }
});

try {
    // Decodificar el cuerpo de la petición si es POST o PUT
    $method = $_SERVER['REQUEST_METHOD'];
    if (in_array($method, ['POST', 'PUT'])) {
        $json = file_get_contents('php://input');
        $_POST = json_decode($json, true) ?? [];
    }

    // Procesar la petición
    require_once __DIR__ . '/Routes/api.php';

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor',
        'error' => $e->getMessage()
    ]);
}