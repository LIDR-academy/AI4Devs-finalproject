<?php
namespace App\Controllers;

use App\Services\HerramientaService;
use App\DTO\ResponseDTO;
use App\Utils\SessionManager;

class HerramientaController {
    private HerramientaService $herramientaService;

    public function __construct() {
        $this->herramientaService = new HerramientaService();
    }

    public function index(): ResponseDTO {
        return $this->herramientaService->getHerramientas();
    }

    public function getEstado(int $id): ResponseDTO {
        return $this->herramientaService->getEstadoHerramienta($id);
    }

    public function usar(int $id, array $data = []): ResponseDTO {
        try {
            $sessionUser = SessionManager::getSessionUser();
            
            if (!$sessionUser) {
                return new ResponseDTO(false, "Sesión no válida", null, 401);
            }

            $ubicacionId = $data['ubicacion_id'] ?? null;
            $fechaFin = $data['fecha_fin'] ?? null;

            if (!$ubicacionId) {
                return new ResponseDTO(false, "Datos incompletos", null, 400);
            }

            return $this->herramientaService->usarHerramienta(
                $id,
                $ubicacionId,
                $fechaFin
            );
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error en controlador: " . $e->getMessage(), null, 500);
        }
    }

    public function dejar(int $id, array $data = []): ResponseDTO {
        $ubicacionId = $data['ubicacion_id'] ?? null;

        if (!$ubicacionId) {
            return new ResponseDTO(false, "Ubicación no especificada", null, 400);
        }

        return $this->herramientaService->dejarHerramienta($id, $ubicacionId);
    }

    public function historial(int $id): ResponseDTO {
        return $this->herramientaService->getHistorial($id);
    }
}