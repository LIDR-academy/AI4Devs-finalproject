<?php
/**
 * Punto de entrada para las peticiones API
 */

// Iniciar output buffering para capturar cualquier salida inesperada
ob_start();

// Configurar manejador de errores global para convertir errores PHP en JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // No procesar errores suprimidos con @
    if (!(error_reporting() & $errno)) {
        return false;
    }
    
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => [
            'type' => $errno,
            'message' => $errstr,
            'file' => $errfile,
            'line' => $errline
        ]
    ]);
    exit;
});

// Configurar manejador de excepciones no capturadas
set_exception_handler(function($exception) {
    ob_clean();
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => [
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine()
        ]
    ]);
    exit;
});

// Verificar si ya se cargó este script para evitar ejecución duplicada
if (defined('SRC_INDEX_LOADED')) {
    error_log('[WARNING] src/index.php ya fue cargado previamente');
    return;
}
define('SRC_INDEX_LOADED', true);

// Cargar autoloader de Composer (para PHPMailer, Resend y otras dependencias)
$composerAutoloader = __DIR__ . '/../vendor/autoload.php';
if (file_exists($composerAutoloader)) {
    require_once $composerAutoloader;
} else {
    error_log('[ERROR] Composer autoloader not found at: ' . $composerAutoloader);
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Composer dependencies not installed']);
    exit;
}

// Configuración inicial
require_once __DIR__ . '/Utils/Environment.php';
require_once __DIR__ . '/Utils/Logger.php';

// Cargar variables de entorno
try {
    App\Utils\Environment::init();
    App\Utils\Logger::initialize();
} catch (\RuntimeException $e) {
    ob_clean(); // Limpiar cualquier output anterior
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de configuración: ' . $e->getMessage()
    ]);
    exit;
}

// Composer PSR-4 autoloader maneja todas las clases automáticamente
// No necesitamos autoloaders manuales

// Autoloader para las clases del proyecto - DESACTIVADO
// Composer PSR-4 autoloader ya maneja esto correctamente
// El autoloader manual causaba problemas de case-sensitivity en Linux (Railway)
/*
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});
*/

// Inicializar el proyecto si es necesario (solo en localhost)
// En Railway, la estructura ya está en el código fuente
if (App\Utils\Environment::isDevelopment()) {
    try {
        $initializer = new \App\Utils\ProjectInitializer();
        $initializer->initializeProject();
    } catch (\Exception $e) {
        error_log('Error al inicializar el proyecto: ' . $e->getMessage());
    }
}

// Configurar headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Limpiar cualquier output previo (warnings, notices, etc.) antes de enviar JSON
ob_clean();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Cargar el Router explícitamente (por si el autoloader falla)
require_once __DIR__ . '/Routes/Router.php';

// Iniciar la aplicación
try {
    // Crear instancia del router y procesar la solicitud
    \App\Routes\Router::handleRequest($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (\Exception $e) {
    ob_clean(); // Limpiar cualquier output anterior
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => App\Utils\Environment::get('APP_DEBUG', false) 
            ? $e->getMessage() 
            : 'Error interno del servidor'
    ]);
}