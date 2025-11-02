<?php
// Redirigir todas las solicitudes al directorio public
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Si la URI es la raíz, redirigir a public/
if ($uri === '/AI4Devs-finalproject/' || $uri === '/AI4Devs-finalproject') {
    header('Location: /AI4Devs-finalproject/public/');
    exit;
}

// Si la URI comienza con /AI4Devs-finalproject/api/, manejar como API
if (strpos($uri, '/AI4Devs-finalproject/api/') === 0) {
    require_once __DIR__ . '/src/index.php';
    exit;
}

// Para cualquier otra URI que comience con /AI4Devs-finalproject/, servir desde public/
if (strpos($uri, '/AI4Devs-finalproject/') === 0) {
    // Prevenir path traversal: validar que el archivo está dentro de /public
    $publicDir = realpath(__DIR__ . '/public');
    $relativePath = str_replace('/AI4Devs-finalproject', '', $uri);
    $candidatePath = $publicDir . $relativePath;
    $resolvedPath = realpath($candidatePath);
    
    // Verificar que el path resuelto está dentro de public/ y es un archivo
    if ($resolvedPath !== false && 
        strpos($resolvedPath, $publicDir) === 0 && 
        is_file($resolvedPath)) {
        
        // Detectar el tipo MIME correcto
        $ext = pathinfo($resolvedPath, PATHINFO_EXTENSION);
        $mime_types = [
            'html' => 'text/html',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif'
        ];
        
        if (isset($mime_types[$ext])) {
            header('Content-Type: ' . $mime_types[$ext]);
        }
        
        readfile($resolvedPath);
        exit;
    }
    
    // Si no hay archivo estático válido dentro de /public, servir index.html
    if (strpos($uri, '/AI4Devs-finalproject/api/') !== 0) {
        readfile(__DIR__ . '/public/index.html');
        exit;
    }
}