<?php
namespace App\Api;

use App\Controllers\AuthController;
use App\DTO\ResponseDTO;
use App\Utils\Validator;
use App\Utils\Logger;

class AuthEndpoint {
    private $controller;

    public function __construct() {
        $this->controller = new AuthController();
    }

    public function sendCode(?array $jsonData = null): ResponseDTO {
        try {
            Logger::info("Inicio del método", "AuthEndpoint::sendCode");
            Logger::debug("Datos recibidos: " . json_encode($jsonData), "AuthEndpoint::sendCode");
            $email = $jsonData['email'] ?? '';
            Logger::debug("Email extraído: " . $email, "AuthEndpoint::sendCode");
            
            if (empty($email)) {
                return new ResponseDTO(false, "El email es requerido", null, 400);
            }

            if (!Validator::validateEmail($email)) {
                return new ResponseDTO(false, "El formato del email no es válido", null, 400);
            }

            return $this->controller->sendCode($email);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al procesar la solicitud: " . $e->getMessage(), null, 500);
        }
    }

    public function validateCode(): ResponseDTO {
        try {
            $jsonData = json_decode(file_get_contents('php://input'), true);
            $email = $jsonData['email'] ?? '';
            $code = $jsonData['codigo'] ?? '';
            
            if (empty($code) || empty($email)) {
                return new ResponseDTO(false, "El código y el email son requeridos", null, 400);
            }

            if (!Validator::validateLoginCode($code)) {
                return new ResponseDTO(false, "El código debe tener 8 caracteres alfanuméricos", null, 400);
            }

            if (!Validator::validateEmail($email)) {
                return new ResponseDTO(false, "El formato del email no es válido", null, 400);
            }

            return $this->controller->validateCode($email, $code);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al validar el código: " . $e->getMessage(), null, 500);
        }
    }

    public function checkSession(): ResponseDTO {
        try {
            return $this->controller->checkSession();
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al verificar sesión: " . $e->getMessage(), null, 500);
        }
    }

    public function getCsrfToken(): ResponseDTO {
        try {
            if (!isset($_SESSION['csrf_token'])) {
                $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            }
            
            return new ResponseDTO(true, "Token CSRF obtenido", ['token' => $_SESSION['csrf_token']]);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al obtener token CSRF: " . $e->getMessage(), null, 500);
        }
    }

    public function logout(): ResponseDTO {
        try {
            return $this->controller->logout();
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al cerrar sesión: " . $e->getMessage(), null, 500);
        }
    }
}
