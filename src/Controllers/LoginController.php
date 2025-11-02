<?php
namespace App\Controllers;

use App\Services\DatabaseService;
use App\Services\EmailServiceRailway;

class LoginController {
    private DatabaseService $db;
    private EmailServiceRailway $email;

    public function __construct() {
        $this->db = new DatabaseService();
        $this->email = new EmailServiceRailway();
    }

    public function sendCode(string $email): string {
        try {
            if (empty($email)) {
                return json_encode([
                    'success' => false,
                    'message' => 'El email es requerido'
                ]);
            }

            // Verificar si el usuario existe
            $user = $this->db->executeQuery(
                "SELECT uuid, nombre, email FROM usuarios WHERE email = ? AND activo = 1",
                [$email]
            );

            if (empty($user)) {
                return json_encode([
                    'success' => false,
                    'message' => 'Usuario no encontrado o inactivo'
                ]);
            }

            // Generar código aleatorio
            $codigo = bin2hex(random_bytes(4)); // 8 caracteres hexadecimales

            // Guardar el código
            $this->db->executeStatement(
                "INSERT INTO codigos_login (usuario_uuid, codigo, fecha_envio, activo) VALUES (?, ?, NOW()), true",
                [$user[0]['uuid'], $codigo]
            );

            // Enviar email
            $sent = $this->email->enviarCodigoLogin($email, $user[0]['nombre'], $codigo);
            
            if (!$sent) {
                throw new \Exception('Error al enviar el email');
            }

            return json_encode([
                'success' => true,
                'message' => 'Código enviado correctamente'
            ]);

        } catch (\Throwable $e) {
            error_log("Error en LoginController::sendCode: " . $e->getMessage());
            return json_encode([
                'success' => false,
                'message' => 'Error al enviar el código'
            ]);
        }
    }

    public function validateCode(string $email, string $codigo): string {
        try {
            if (empty($email) || empty($codigo)) {
                return json_encode([
                    'success' => false,
                    'message' => 'El email y el código son requeridos'
                ]);
            }

            // Verificar el código
            $result = $this->db->executeQuery(
                "SELECT cl.id, u.uuid, u.nombre, u.email
                FROM codigos_login cl
                JOIN usuarios u ON u.uuid = cl.usuario_uuid
                WHERE u.email = ?
                AND cl.codigo = ?
                AND cl.activo = 1
                AND cl.fecha_envio >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                ORDER BY cl.fecha_envio DESC
                LIMIT 1",
                [$email, $codigo]
            );

            if (empty($result)) {
                return json_encode([
                    'success' => false,
                    'message' => 'Código inválido o expirado'
                ]);
            }

            // Marcar código como usado
            $this->db->executeStatement(
                "UPDATE codigos_login SET activo = 0, fecha_validacion = NOW() WHERE id = ?",
                [$result[0]['id']]
            );

            // Preparar datos de sesión
            $sessionData = [
                'uuid' => $result[0]['uuid'],
                'nombre' => $result[0]['nombre'],
                'email' => $result[0]['email'],
                'expira' => time() + (24 * 60 * 60) // 24 horas
            ];

            return json_encode([
                'success' => true,
                'message' => 'Código validado correctamente',
                'data' => $sessionData
            ]);

        } catch (\Throwable $e) {
            error_log("Error en LoginController::validateCode: " . $e->getMessage());
            return json_encode([
                'success' => false,
                'message' => 'Error al validar el código'
            ]);
        }
    }
}