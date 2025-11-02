<?php
namespace App\Utils;

class SecurityUtils {
    /**
     * Sanitiza y valida entradas de usuario
     */
    public static function sanitizeInput(string $input): string {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Valida que un string contenga solo caracteres seguros
     */
    public static function isValidString(string $input): bool {
        return preg_match('/^[a-zA-Z0-9\s\-_.@]+$/', $input) === 1;
    }

    /**
     * Valida rutas de archivo
     */
    public static function isValidPath(string $path): bool {
        // Prevenir directory traversal
        if (strpos($path, '..') !== false) {
            return false;
        }
        
        // Validar caracteres permitidos
        if (!preg_match('/^[a-zA-Z0-9\/_.-]+$/', $path)) {
            return false;
        }

        // Asegurar que la ruta está dentro del directorio del proyecto
        $realPath = realpath($path);
        $projectRoot = realpath(__DIR__ . '/../../');
        
        return $realPath !== false && strpos($realPath, $projectRoot) === 0;
    }

    /**
     * Genera un token CSRF
     */
    public static function generateCsrfToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Valida un token CSRF
     */
    public static function validateCsrfToken(?string $token): bool {
        if (empty($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Sanitiza nombres de archivo
     */
    public static function sanitizeFileName(string $filename): string {
        // Remover caracteres especiales y espacios
        $filename = preg_replace('/[^a-zA-Z0-9\-._]/', '', $filename);
        
        // Prevenir nombres que empiecen con punto
        $filename = ltrim($filename, '.');
        
        return $filename;
    }
}