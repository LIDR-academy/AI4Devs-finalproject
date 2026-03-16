<?php
namespace App\Utils;

class Environment {
    private static array $env = [];
    private static bool $loaded = false;

    public static function init(): void {
        self::loadEnv();
    }

    private static function loadEnv(): void {
        if (self::$loaded) {
            return;
        }

        // PRIORIDAD 1: Variables de entorno del sistema (Railway, Docker, etc.)
        // Cargar variables de entorno del sistema primero
        foreach ($_ENV as $key => $value) {
            self::$env[$key] = $value;
        }
        
        // También revisar getenv() por si acaso
        foreach ($_SERVER as $key => $value) {
            if (!isset(self::$env[$key]) && is_string($value)) {
                self::$env[$key] = $value;
            }
        }

        // PRIORIDAD 2: Archivo .env (solo para desarrollo local)
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '#') === 0) {
                    continue;
                }

                if (strpos($line, '=') === false) {
                    continue;
                }

                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);

                // No sobrescribir variables de entorno del sistema
                if (isset(self::$env[$name])) {
                    continue;
                }

                // Manejar valores vacíos
                if ($value === '""' || $value === "''") {
                    $value = '';
                }
                // Quitar comillas si existen
                elseif (preg_match('/^"(.+)"$/', $value, $matches) || 
                        preg_match("/^'(.+)'$/", $value, $matches)) {
                    $value = $matches[1];
                }

                self::$env[$name] = $value;
            }
        }
        
        self::$loaded = true;
    }

    public static function get(string $key, $default = null) {
        if (!self::$loaded) {
            self::loadEnv();
        }
        
        // Intentar primero con el key original
        if (isset(self::$env[$key])) {
            return self::$env[$key];
        }
        
        // Fallback: Intentar con getenv() directamente (por si Railway no cargó en $_ENV)
        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }
        
        return $default;
    }

    public static function isProduction(): bool {
        return self::get('APP_ENV') === 'production';
    }

    public static function isDevelopment(): bool {
        $env = self::get('APP_ENV');
        return $env === 'development' || $env === 'test';
    }

    public static function isTest(): bool {
        return self::get('APP_ENV') === 'test';
    }
}