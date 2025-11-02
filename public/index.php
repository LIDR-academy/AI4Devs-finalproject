<?php
/**
 * Router para Railway - Sirve desde /public
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Logging para debug
error_log("[PUBLIC ROUTER] URI: " . $uri);

// Si es petición a la API, redirigir a src/index.php
if (strpos($uri, '/api/') === 0) {
    error_log("[PUBLIC ROUTER] API request detected");
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    require_once __DIR__ . '/../src/index.php';
    exit;
}

// Para archivos estáticos, dejar que PHP los sirva naturalmente
// El servidor PHP built-in se encargará de esto

// Si llegamos aquí y no es un archivo, servir index.html
if ($uri === '/' || !file_exists(__DIR__ . $uri)) {
    error_log("[PUBLIC ROUTER] Serving index.html");
    readfile(__DIR__ . '/index.html');
    exit;
}

// Si es un archivo que existe, retornar false para que PHP lo sirva
return false;
