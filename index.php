<?php
// Router principal - funciona tanto en desarrollo local como en producción (Railway)
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Determinar si estamos en desarrollo local (con prefijo) o producción
$isLocal = strpos($uri, '/AI4Devs-finalproject') === 0;
$prefix = $isLocal ? '/AI4Devs-finalproject' : '';

// Si la URI comienza con /api/, manejar como API
if (strpos($uri, $prefix . '/api/') === 0) {
    require_once __DIR__ . '/src/index.php';
    exit;
}

// Para cualquier otra URI, servir desde public/
$cleanUri = str_replace($prefix, '', $uri);

// Si es la raíz, servir index.html
if ($cleanUri === '/' || $cleanUri === '') {
    if (file_exists(__DIR__ . '/public/index.html')) {
        header('Content-Type: text/html');
        readfile(__DIR__ . '/public/index.html');
        exit;
    }
}

// Buscar el archivo en public/
$file = __DIR__ . '/public' . $cleanUri;

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
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf'
    ];
    
    if (isset($mime_types[$ext])) {
        header('Content-Type: ' . $mime_types[$ext]);
    }
    
    readfile($file);
    exit;
}

// Si el archivo no existe y no es una API, servir index.html (para SPA routing)
if (!file_exists($file) && strpos($uri, $prefix . '/api/') !== 0) {
    if (file_exists(__DIR__ . '/public/index.html')) {
        header('Content-Type: text/html');
        readfile(__DIR__ . '/public/index.html');
    } else {
        http_response_code(404);
        echo '404 - Not Found';
    }
    exit;
}