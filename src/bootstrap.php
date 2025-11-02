<?php
// Autoloader para PHPMailer
spl_autoload_register(function ($class) {
    // Verificar si es una clase de PHPMailer
    $prefix = 'PHPMailer\\PHPMailer\\';
    $baseDir = __DIR__ . '/../lib/PHPMailer/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    // Obtener el nombre de la clase sin el namespace
    $relativeClass = substr($class, $len);
    
    // Crear la ruta del archivo
    $file = $baseDir . $relativeClass . '.php';

    // Si el archivo existe, cargarlo
    if (file_exists($file)) {
        require $file;
    }
});

// Autoloader para las clases del proyecto
spl_autoload_register(function ($class) {
    // Convertir namespace a ruta de archivo
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/';

    // Si la clase no usa nuestro prefix, pasar al siguiente autoloader
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    // Obtener la ruta relativa de la clase
    $relativeClass = substr($class, $len);

    // Convertir namespace a ruta de archivo
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    // Si el archivo existe, cargarlo
    if (file_exists($file)) {
        require $file;
    }
});