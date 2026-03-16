<?php
namespace App\Controllers;

use App\Services\AuthService;
use App\DTO\ResponseDTO;

class AuthController {
    private AuthService $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    public function sendCode(string $email): ResponseDTO {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new ResponseDTO(false, "Email inválido", null, 400);
        }

        return $this->authService->sendCode($email);
    }

    public function validateCode(string $email, string $codigo): ResponseDTO {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new ResponseDTO(false, "Email inválido", null, 400);
        }

        if (empty($codigo)) {
            return new ResponseDTO(false, "El código es requerido", null, 400);
        }

        return $this->authService->validateCode($email, $codigo);
    }

    public function checkSession(): ResponseDTO {
        return $this->authService->checkSession();
    }

    public function logout(): ResponseDTO {
        return $this->authService->logout();
    }
}