<?php
namespace App\Utils;

class Logger {
    private static string $logFile;
    private static bool $initialized = false;
    private static bool $debugEnabled = false;

    public static function initialize(): void {
        if (self::$initialized) return;

        $logDir = __DIR__ . '/logs';
        if (!file_exists($logDir)) {
            @mkdir($logDir, 0777, true);
        }

        self::$logFile = $logDir . '/app.log';
        self::$initialized = true;
        self::$debugEnabled = Environment::get('APP_DEBUG', false) === true;

        // Configurar el manejador de errores de PHP para usar nuestro logger
        if (self::$debugEnabled) {
            ini_set('log_errors', '1');
            ini_set('error_log', self::$logFile);
        }
    }

    private static function shouldLog(string $level): bool {
        // Siempre loguear errores, independientemente de APP_DEBUG
        if ($level === 'ERROR') {
            return true;
        }

        // Para otros niveles, solo loguear si APP_DEBUG está activado
        return self::$debugEnabled;
    }

    public static function log(string $message, string $level = 'INFO', ?string $context = null): void {
        self::initialize();

        if (!self::shouldLog($level)) {
            return;
        }

        $timestamp = date('Y-m-d H:i:s');
        $context = $context ? "[$context]" : '';
        $formattedMessage = "[$timestamp][$level]$context $message" . PHP_EOL;
        
        error_log($formattedMessage, 3, self::$logFile);
    }

    public static function info(string $message, ?string $context = null): void {
        self::log($message, 'INFO', $context);
    }

    public static function error(string $message, ?string $context = null): void {
        self::log($message, 'ERROR', $context);
    }

    public static function debug(string $message, ?string $context = null): void {
        self::log($message, 'DEBUG', $context);
    }

    public static function warn(string $message, ?string $context = null): void {
        self::log($message, 'WARN', $context);
    }
}