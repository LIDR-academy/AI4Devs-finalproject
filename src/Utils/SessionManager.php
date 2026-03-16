<?php

namespace App\Utils;

class SessionManager {
    private static int $sessionDuration;
    
    private static function getSessionDuration(): int {
        if (!isset(self::$sessionDuration)) {
            self::$sessionDuration = (int) Environment::get('SESSION_DURATION', 1800); // 30 minutos por defecto
        }
        return self::$sessionDuration;
    }

    private static function configureSessionCookie(): void {
        $cookieName = Environment::get('SESSION_COOKIE_NAME', 'ASTILLERO_SESSION');
        $isSecure = Environment::get('SESSION_COOKIE_SECURE', 'false') === 'true';
        $httpOnly = Environment::get('SESSION_COOKIE_HTTPONLY', 'true') === 'true';
        
        session_name($cookieName);
        
        session_set_cookie_params([
            'lifetime' => self::getSessionDuration(),
            'path' => '/',
            'domain' => '',
            'secure' => $isSecure, // Solo con HTTPS en producción
            'httponly' => $httpOnly, // No accesible desde JavaScript
            'samesite' => 'Lax' // Protección CSRF adicional
        ]);
    }

    public static function initSession(string $userUuid, string $email, string $nombre = ''): void {
        if (session_status() === PHP_SESSION_NONE) {
            self::configureSessionCookie();
            session_start();
        }

        $_SESSION['user_uuid'] = $userUuid;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_nombre'] = $nombre;
        $_SESSION['last_activity'] = time();
        $_SESSION['created_at'] = time();
        
        // Generate CSRF token
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        // Regenerate session ID for security
        session_regenerate_id(true);
    }

    public static function checkSession(): bool {
        // Verificar si hay una cookie de sesión antes de iniciar
        $sessionName = Environment::get('SESSION_COOKIE_NAME', 'ASTILLERO_SESSION');
        $hasCookie = isset($_COOKIE[$sessionName]);
        
        // Si no hay cookie de sesión, NO iniciar una nueva sesión
        if (!$hasCookie) {
            return false;
        }
        
        // Si no hay sesión iniciada, iniciarla
        if (session_status() === PHP_SESSION_NONE) {
            self::configureSessionCookie();
            session_start();
        }

        // Verificar si existe sesión con datos de usuario
        if (!isset($_SESSION['user_uuid']) || !isset($_SESSION['last_activity'])) {
            // Si no hay datos de usuario, destruir la sesión vacía
            if (session_status() === PHP_SESSION_ACTIVE) {
                self::endSession();
            }
            return false;
        }
        
        $currentTime = time();
        $sessionDuration = self::getSessionDuration();

        // Verificar timeout por inactividad
        if ($currentTime - $_SESSION['last_activity'] > $sessionDuration) {
            self::endSession();
            return false;
        }

        // Actualizar timestamp de última actividad
        $_SESSION['last_activity'] = $currentTime;

        return true;
    }

    public static function getSessionUser(): ?array {
        if (!self::checkSession()) {
            return null;
        }

        return [
            'uuid' => $_SESSION['user_uuid'],
            'email' => $_SESSION['user_email'],
            'nombre' => $_SESSION['user_nombre'] ?? '',
            'last_activity' => $_SESSION['last_activity'],
            'expires_in' => self::getSessionDuration() - (time() - $_SESSION['last_activity'])
        ];
    }

    public static function getCsrfToken(): ?string {
        if (session_status() === PHP_SESSION_NONE) {
            self::configureSessionCookie();
            session_start();
        }
        return $_SESSION['csrf_token'] ?? null;
    }

    public static function validateCsrfToken(string $token): bool {
        $sessionToken = $_SESSION['csrf_token'] ?? null;
        
        if (!$sessionToken) {
            return false;
        }
        
        return hash_equals($sessionToken, $token);
    }

    public static function endSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            self::configureSessionCookie();
            session_start();
        }
        
        // Obtener el nombre de la sesión antes de destruirla
        $sessionName = session_name();
        
        // Limpiar todas las variables de sesión
        $_SESSION = [];

        // Destruir TODAS las posibles cookies de sesión (por si hay cookies antiguas)
        $cookieNames = [$sessionName, 'PHPSESSID', 'ASTILLERO_SESSION'];
        
        foreach ($cookieNames as $cookieName) {
            if (isset($_COOKIE[$cookieName])) {
                setcookie(
                    $cookieName,
                    '',
                    1,  // 1 de enero de 1970 = expirado
                    '/',
                    '',
                    false,
                    true
                );
                unset($_COOKIE[$cookieName]);
            }
        }

        // Destruir completamente la sesión
        session_unset();
        session_destroy();
    }

    public static function getSessionInfo(): array {
        // Primero verificar si hay sesión válida
        if (!self::checkSession()) {
            return [
                'active' => false,
                'message' => 'No hay sesión activa o la sesión expiró'
            ];
        }

        $currentTime = time();
        $lastActivity = $_SESSION['last_activity'];
        $createdAt = $_SESSION['created_at'] ?? $lastActivity;
        $sessionDuration = self::getSessionDuration();
        $expiresIn = $sessionDuration - ($currentTime - $lastActivity);

        return [
            'active' => true,
            'user' => [
                'uuid' => $_SESSION['user_uuid'],
                'email' => $_SESSION['user_email'],
                'nombre' => $_SESSION['user_nombre'] ?? ''
            ],
            'session' => [
                'created_at' => date('Y-m-d H:i:s', $createdAt),
                'last_activity' => date('Y-m-d H:i:s', $lastActivity),
                'expires_in_seconds' => $expiresIn,
                'expires_in_minutes' => round($expiresIn / 60, 1),
                'duration_seconds' => $sessionDuration
            ]
        ];
    }
}
