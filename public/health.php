<?php
/**
 * Health check endpoint para Railway
 */
header('Content-Type: application/json');
http_response_code(200);

echo json_encode([
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
]);
