<?php
namespace App\Services;

use App\DTO\ResponseDTO;
use PDO;
use App\Services\DatabaseService;

class HistoricoService {

    public function getHistorico(): ResponseDTO {
        try {
            $result = DatabaseService::executeQuery("
                SELECT 
                    m.id,
                    m.herramienta_id,
                    m.operario_uuid,
                    m.ubicacion_id,
                    m.fecha_inicio,
                    m.fecha_fin,
                    m.dh_created,
                    h.nombre as herramienta_nombre,
                    h.codigo as herramienta_codigo,
                    u.nombre as ubicacion_nombre,
                    o.nombre as operario_nombre,
                    o.email as operario_email
                FROM movimientos_herramienta m
                INNER JOIN herramientas h ON m.herramienta_id = h.id
                LEFT JOIN ubicaciones u ON m.ubicacion_id = u.id
                LEFT JOIN usuarios o ON m.operario_uuid = o.uuid
                WHERE h.activo = 1
                ORDER BY m.dh_created DESC
                LIMIT 500
            ");

            return new ResponseDTO(true, "Histórico recuperado con éxito", $result);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al recuperar histórico: " . $e->getMessage(), null, 500);
        }
    }
}
