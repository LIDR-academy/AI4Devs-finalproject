<?php
namespace App\Middlewares;

use App\DTO\ResponseDTO;
use App\Utils\SessionManager;

class AuthMiddleware {
    public static function verificarSesion(): ?ResponseDTO {
        // Usar el SessionManager para verificar la sesión
        if (!SessionManager::checkSession()) {
            return new ResponseDTO(false, "No autenticado o sesión expirada", null, 401);
        }

        return null;
    }
}