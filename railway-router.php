<?php
/**
 * Router principal para Railway
 * Railway sirve desde la raíz sin subdirectorios
 */

// Logging para debug
error_log("REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'no-uri'));
error_log("SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'no-script'));

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
error_log("Parsed URI: " . $uri);

// Si es la raíz, servir index.html
if ($uri === '/' || $uri === '') {
    error_log("Serving index.html");
    if (file_exists(__DIR__ . '/public/index.html')) {
        readfile(__DIR__ . '/public/index.html');
    } else {
        error_log("ERROR: index.html not found");
        http_response_code(500);
        echo "Error: index.html not found";
    }
    exit;
}

// Si es una petición a la API
if (strpos($uri, '/api/') === 0) {
    require_once __DIR__ . '/src/index.php';
    exit;
}

// Intentar servir archivo estático desde public/
$file = __DIR__ . '/public' . $uri;

if (file_exists($file) && is_file($file)) {
    // Detectar el tipo MIME correcto
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $mime_types = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon'
    ];
    
    if (isset($mime_types[$ext])) {
        header('Content-Type: ' . $mime_types[$ext]);
    }
    
    readfile($file);
    exit;
}

// Si no se encuentra, servir index.html (para SPA routing)
readfile(__DIR__ . '/public/index.html');
exit;
