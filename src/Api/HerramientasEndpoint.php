<?php
namespace App\Api;

use App\Controllers\HerramientaController;
use App\DTO\ResponseDTO;
use App\Utils\Validator;
use App\Utils\SessionManager;

class HerramientasEndpoint {
    private $controller;

    public function __construct() {
        $this->controller = new HerramientaController();
    }

    public function index(): ResponseDTO {
        try {
            return $this->controller->index();
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al obtener las herramientas: " . $e->getMessage(), null, 500);
        }
    }

    public function getEstado(?int $id): ResponseDTO {
        try {
            if (!$id || !Validator::validateId($id)) {
                return new ResponseDTO(false, "ID de herramienta inválido", null, 400);
            }
            return $this->controller->getEstado($id);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al obtener el estado: " . $e->getMessage(), null, 500);
        }
    }

    public function usar(?int $id, ?array $jsonBody = null): ResponseDTO {
        try {
            if (!$id || !Validator::validateId($id)) {
                return new ResponseDTO(false, "ID de herramienta inválido", null, 400);
            }

            // Si no se pasó jsonBody desde Router, intentar leerlo (fallback)
            if ($jsonBody === null) {
                $jsonBody = json_decode(file_get_contents('php://input'), true);
            }
            
            if (!$jsonBody) {
                return new ResponseDTO(false, "Datos inválidos", null, 400);
            }

            $ubicacion_id = $jsonBody['ubicacion_id'] ?? null;
            $fecha_fin = $jsonBody['fecha_fin'] ?? null;

            // Validar campos requeridos
            if (empty($ubicacion_id)) {
                return new ResponseDTO(false, "El campo ubicacion_id es obligatorio", null, 400);
            }

            // Validar ubicación
            if (!Validator::validateId($ubicacion_id)) {
                return new ResponseDTO(false, "ID de ubicación inválido", null, 400);
            }

            // Validar fecha fin si se proporciona
            if (!empty($fecha_fin) && !Validator::validateDate($fecha_fin)) {
                return new ResponseDTO(false, "La fecha fin proporcionada no es válida", null, 400);
            }

            // Preparar los datos para el controlador
            $data = [
                'ubicacion_id' => $ubicacion_id,
                'fecha_fin' => $fecha_fin
            ];

            return $this->controller->usar($id, $data);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al usar la herramienta: " . $e->getMessage(), null, 500);
        }
    }

    public function dejar(?int $id, ?array $jsonBody = null): ResponseDTO {
        try {
            if (!$id || !Validator::validateId($id)) {
                return new ResponseDTO(false, "ID de herramienta inválido", null, 400);
            }

            // Si no se pasó jsonBody desde Router, intentar leerlo (fallback)
            if ($jsonBody === null) {
                $jsonBody = json_decode(file_get_contents('php://input'), true);
            }
            
            if (!$jsonBody) {
                return new ResponseDTO(false, "Datos inválidos", null, 400);
            }

            $ubicacion_id = $jsonBody['ubicacion_id'] ?? null;
            
            if (empty($ubicacion_id) || !Validator::validateId($ubicacion_id)) {
                return new ResponseDTO(false, "ID de ubicación inválido o no proporcionado", null, 400);
            }

            // Preparar los datos para el controlador
            $data = [
                'ubicacion_id' => $ubicacion_id
            ];

            return $this->controller->dejar($id, $data);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al dejar la herramienta: " . $e->getMessage(), null, 500);
        }
    }

    public function historial(?int $id): ResponseDTO {
        try {
            if (!$id || !Validator::validateId($id)) {
                return new ResponseDTO(false, "ID de herramienta inválido", null, 400);
            }
            return $this->controller->historial($id);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al obtener el historial: " . $e->getMessage(), null, 500);
        }
    }

    public function getUbicaciones(): ResponseDTO {
        try {
            $ubicaciones = \App\Services\DatabaseService::executeQuery(
                "SELECT id, nombre FROM ubicaciones WHERE activo = 1 ORDER BY nombre"
            );
            return new ResponseDTO(true, "Ubicaciones obtenidas correctamente", $ubicaciones);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al obtener ubicaciones: " . $e->getMessage(), null, 500);
        }
    }
}