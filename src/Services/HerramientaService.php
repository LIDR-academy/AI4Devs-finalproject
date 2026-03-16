<?php
namespace App\Services;

use App\DTO\ResponseDTO;
use App\DTO\HerramientaDTO;
use PDO;
use App\Services\DatabaseService;

class HerramientaService {

    public function getHerramientas(): ResponseDTO {
        try {
            $result = DatabaseService::executeQuery("
                SELECT h.*, 
                       u.nombre as ubicacion_actual,
                       o.nombre as operario_actual,
                       o.uuid as operario_uuid,
                       m_active.fecha_inicio,
                       m_active.fecha_fin,
                       m_active.fecha_solicitud_fin,
                       m_active.id as movimiento_id,
                       COALESCE(m_active.ubicacion_id, m_last.ubicacion_id) as ubicacion_id
                FROM herramientas h
                -- Movimiento activo (si existe)
                LEFT JOIN movimientos_herramienta m_active ON h.id = m_active.herramienta_id 
                    AND m_active.fecha_fin IS NULL
                    AND m_active.id = (
                        SELECT id 
                        FROM movimientos_herramienta 
                        WHERE herramienta_id = h.id 
                          AND fecha_fin IS NULL
                        ORDER BY dh_created DESC 
                        LIMIT 1
                    )
                -- Último movimiento (independiente de si está finalizado) para conocer la última ubicación
                LEFT JOIN movimientos_herramienta m_last ON h.id = m_last.herramienta_id
                    AND m_last.id = (
                        SELECT id 
                        FROM movimientos_herramienta 
                        WHERE herramienta_id = h.id 
                        ORDER BY dh_created DESC 
                        LIMIT 1
                    )
                LEFT JOIN ubicaciones u ON u.id = COALESCE(m_active.ubicacion_id, m_last.ubicacion_id)
                LEFT JOIN usuarios o ON m_active.operario_uuid = o.uuid
                WHERE h.activo = 1
                ORDER BY h.nombre
            ");

            $herramientas = array_map(
                fn($row) => HerramientaDTO::fromArray($row),
                $result
            );

            return new ResponseDTO(true, "Herramientas recuperadas con éxito", $herramientas);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al recuperar herramientas: " . $e->getMessage(), null, 500);
        }
    }

    public function getEstadoHerramienta(int $id): ResponseDTO {
        try {
            $result = DatabaseService::executeQuery(
                    "SELECT h.*,
                           u.nombre as ubicacion_actual,
                           o.nombre as operario_actual,
                           o.uuid as operario_uuid,
                           m_active.fecha_inicio,
                           m_active.fecha_fin,
                           m_active.fecha_solicitud_fin,
                           COALESCE(m_active.ubicacion_id, m_last.ubicacion_id) as ubicacion_id
                    FROM herramientas h
                    LEFT JOIN movimientos_herramienta m_active ON h.id = m_active.herramienta_id AND m_active.fecha_fin IS NULL
                        AND m_active.id = (
                            SELECT id FROM movimientos_herramienta WHERE herramienta_id = h.id AND fecha_fin IS NULL ORDER BY dh_created DESC LIMIT 1
                        )
                    LEFT JOIN movimientos_herramienta m_last ON h.id = m_last.herramienta_id
                        AND m_last.id = (
                            SELECT id FROM movimientos_herramienta WHERE herramienta_id = h.id ORDER BY dh_created DESC LIMIT 1
                        )
                    LEFT JOIN ubicaciones u ON u.id = COALESCE(m_active.ubicacion_id, m_last.ubicacion_id)
                    LEFT JOIN usuarios o ON m_active.operario_uuid = o.uuid
                    WHERE h.id = ? AND h.activo = 1
                    LIMIT 1",
                    [$id]
            );
            
            $herramienta = !empty($result) ? $result[0] : null;

            if (!$herramienta) {
                return new ResponseDTO(false, "Herramienta no encontrada", null, 404);
            }

            return new ResponseDTO(
                true,
                "Estado de herramienta recuperado con éxito",
                HerramientaDTO::fromArray($herramienta)
            );
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al recuperar estado: " . $e->getMessage(), null, 500);
        }
    }

    public function usarHerramienta(int $id, int $ubicacionId, ?string $fechaFin): ResponseDTO {
        try {
            $sessionUser = \App\Utils\SessionManager::getSessionUser();
            
            if (!$sessionUser) {
                return new ResponseDTO(false, "No hay sesión activa", null, 401);
            }
            
            $operarioUuid = $sessionUser['uuid'];

            // Verificar si la herramienta está en uso
            $result = DatabaseService::executeQuery(
                "SELECT m.*, o.nombre as operario_nombre, u.nombre as ubicacion_nombre
                FROM movimientos_herramienta m
                JOIN usuarios o ON m.operario_uuid = o.uuid
                JOIN ubicaciones u ON m.ubicacion_id = u.id
                WHERE m.herramienta_id = ? 
                  AND m.operario_uuid IS NOT NULL 
                  AND m.fecha_fin IS NULL
                LIMIT 1",
                [$id]
            );

            $usoActual = !empty($result) ? $result[0] : null;

            if ($usoActual) {
                return new ResponseDTO(
                    false,
                    "La herramienta está siendo utilizada por {$usoActual['operario_nombre']} en {$usoActual['ubicacion_nombre']}",
                    null,
                    409
                );
            }

            // Validar que la herramienta existe y está activa
            $herramienta = DatabaseService::executeQuery(
                "SELECT id FROM herramientas WHERE id = ? AND activo = 1 LIMIT 1",
                [$id]
            );
            if (empty($herramienta)) {
                return new ResponseDTO(false, "Herramienta no encontrada o inactiva", null, 404);
            }

            // Validar que la ubicación existe y está activa
            $ubicacion = DatabaseService::executeQuery(
                "SELECT id FROM ubicaciones WHERE id = ? AND activo = 1 LIMIT 1",
                [$ubicacionId]
            );
            if (empty($ubicacion)) {
                return new ResponseDTO(false, "Ubicación no válida", null, 400);
            }

            // Registrar nuevo uso usando CURRENT_TIMESTAMP del servidor
            DatabaseService::executeStatement(
                "INSERT INTO movimientos_herramienta 
                (herramienta_id, operario_uuid, ubicacion_id, fecha_inicio, fecha_solicitud_fin)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)",
                [$id, $operarioUuid, $ubicacionId, $fechaFin]
            );
            
            return new ResponseDTO(true, "Herramienta registrada para uso correctamente");
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al registrar uso: " . $e->getMessage(), null, 500);
        }
    }

    public function dejarHerramienta(int $id, int $ubicacionId): ResponseDTO {
        try {
            $sessionUser = \App\Utils\SessionManager::getSessionUser();
            
            if (!$sessionUser) {
                return new ResponseDTO(false, "No hay sesión activa", null, 401);
            }
            
            $operarioUuid = $sessionUser['uuid'];
            
            // Verificar que existe un movimiento activo de este operario con esta herramienta
            $movimientoActivo = DatabaseService::executeQuery(
                "SELECT id FROM movimientos_herramienta 
                WHERE herramienta_id = ? 
                  AND operario_uuid = ? 
                  AND fecha_fin IS NULL
                LIMIT 1",
                [$id, $operarioUuid]
            );
            
            if (empty($movimientoActivo)) {
                return new ResponseDTO(false, "No tienes esta herramienta en uso", null, 400);
            }
            
            $movimientoId = $movimientoActivo[0]['id'];
            
            // Validar que la ubicación destino existe y está activa
            $ubicacion = DatabaseService::executeQuery(
                "SELECT id FROM ubicaciones WHERE id = ? AND activo = 1 LIMIT 1",
                [$ubicacionId]
            );
            if (empty($ubicacion)) {
                return new ResponseDTO(false, "Ubicación no válida", null, 400);
            }
            
            DatabaseService::executeStatement(
                "UPDATE movimientos_herramienta
                SET fecha_fin = CURRENT_TIMESTAMP, ubicacion_id = ?
                WHERE id = ?",
                [$ubicacionId, $movimientoId]
            );
            
            return new ResponseDTO(true, "Herramienta devuelta correctamente");
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al devolver herramienta: " . $e->getMessage(), null, 500);
        }
    }

    public function getHistorial(int $id): ResponseDTO {
        try {
            $historial = DatabaseService::executeQuery(
                "SELECT m.*,
                       h.nombre as herramienta_nombre,
                       u.nombre as ubicacion_nombre,
                       o.nombre as operario_nombre
                FROM movimientos_herramienta m
                JOIN herramientas h ON m.herramienta_id = h.id
                LEFT JOIN ubicaciones u ON m.ubicacion_id = u.id
                LEFT JOIN usuarios o ON m.operario_uuid = o.uuid
                WHERE m.herramienta_id = ?
                ORDER BY m.fecha_inicio DESC",
                [$id]
            );

            return new ResponseDTO(true, "Historial recuperado con éxito", $historial);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al recuperar historial: " . $e->getMessage(), null, 500);
        }
    }
}