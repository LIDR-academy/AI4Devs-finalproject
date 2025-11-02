<?php

namespace App\Middlewares;

class SessionMiddleware {
    public function handle() {
        // Configurar los parámetros de la sesión antes de iniciarla
        if (session_status() === PHP_SESSION_NONE) {
            // Obtener configuración desde el .env
            $cookieName = \App\Utils\Environment::get('SESSION_COOKIE_NAME', 'ASTILLERO_SESSION');
            $sessionDuration = (int) \App\Utils\Environment::get('SESSION_DURATION', 1800);
            $isSecure = \App\Utils\Environment::get('SESSION_COOKIE_SECURE', 'false') === 'true';
            $httpOnly = \App\Utils\Environment::get('SESSION_COOKIE_HTTPONLY', 'true') === 'true';
            
            // Configurar nombre de sesión ANTES de session_start()
            session_name($cookieName);
            
            // Configurar parámetros de cookie
            session_set_cookie_params([
                'lifetime' => $sessionDuration,
                'path' => '/',
                'domain' => '',
                'secure' => $isSecure,
                'httponly' => $httpOnly,
                'samesite' => 'Lax'
            ]);
            
            ini_set('session.use_strict_mode', '1');
            
            session_start();
        }

        // Actualizar timestamp de actividad si hay sesión activa
        if (isset($_SESSION['user_uuid'])) {
            $_SESSION['last_activity'] = time();
        }
    }

    public static function regenerateSession(): void {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerate session ID to prevent session fixation
        session_regenerate_id(true);
    }
}