<?php
namespace App\Services;

use App\DTO\ResponseDTO;
use App\Utils\Environment;
use App\Utils\SessionManager;
use PDO;
use App\Services\DatabaseService;
use App\Services\RateLimitService;

class AuthService {
    private EmailServiceRailway $emailService;
    private RateLimitService $rateLimitService;

    public function __construct() {
        $this->emailService = new EmailServiceRailway();
        $this->rateLimitService = new RateLimitService();
    }

    private function getClientIP(): string {
        // Primero obtener REMOTE_ADDR como base segura
        $remoteIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        // Solo confiar en X-Forwarded-For si existe y validar el primer IP
        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        
        if ($forwarded) {
            // Tomar solo el primer IP de la lista (el cliente original)
            $ips = array_map('trim', explode(',', $forwarded));
            $candidate = $ips[0] ?? null;
            
            // Validar que sea una IP válida antes de usarla
            if ($candidate && filter_var($candidate, FILTER_VALIDATE_IP)) {
                return $candidate;
            }
        }
        
        // Si no hay X-Forwarded-For válido, usar REMOTE_ADDR
        return $remoteIp;
    }

    public function sendCode(string $email): ResponseDTO {
        try {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return new ResponseDTO(false, "Formato de email inválido", null, 400);
            }

            $ipAddress = $this->getClientIP();

            // Verificar rate limiting
            if ($this->rateLimitService->isBlocked($email, $ipAddress)) {
                $timeRemaining = $this->rateLimitService->getBlockTimeRemaining($email, $ipAddress);
                $minutesRemaining = ceil($timeRemaining / 60);
                
                return new ResponseDTO(
                    false, 
                    "Demasiados intentos fallidos. Intenta de nuevo en $minutesRemaining minutos.", 
                    ['blocked_until_seconds' => $timeRemaining],
                    429 // Too Many Requests
                );
            }
            
            // Verificar si el usuario existe
            $result = DatabaseService::executeQuery(
                "SELECT uuid, nombre FROM usuarios WHERE email = :email AND activo = 1",
                ['email' => $email]
            );
            
            if (empty($result)) {
                // Registrar intento fallido
                $this->rateLimitService->recordAttempt($email, $ipAddress, false);
                
                $remainingAttempts = $this->rateLimitService->getRemainingAttempts($email, $ipAddress);
                
                return new ResponseDTO(
                    false, 
                    "El usuario no está registrado. Intentos restantes: $remainingAttempts", 
                    ['remaining_attempts' => $remainingAttempts],
                    404
                );
            }
            
            $usuario = $result[0];

            // Generar código aleatorio
            $codigo = $this->generarCodigo();

            // Guardar código en la base de datos
            DatabaseService::executeStatement(
                "INSERT INTO codigos_login (usuario_uuid, codigo, fecha_envio, activo) 
                 VALUES (?, ?, CURRENT_TIMESTAMP, 1)",
                [$usuario['uuid'], $codigo]
            );

            // Enviar el código por email
            $enviado = $this->emailService->enviarCodigoLogin($email, $usuario['nombre'], $codigo);

            if (!$enviado) {
                // En modo debug, permitir continuar sin email
                if (Environment::isDevelopment()) {
                    error_log("⚠️ Email no enviado, pero continuando en modo desarrollo");
                    error_log("📧 Código de acceso para {$email}: {$codigo}");
                } else {
                    // En producción, desactivar el código y retornar error
                    DatabaseService::executeStatement(
                        "UPDATE codigos_login SET activo = 0 WHERE usuario_uuid = ? AND codigo = ?",
                        [$usuario['uuid'], $codigo]
                    );
                    
                    // Registrar como intento fallido
                    $this->rateLimitService->recordAttempt($email, $ipAddress, false);
                    
                    return new ResponseDTO(false, "Error al enviar el código por email", null, 500);
                }
            }

            // En producción, no devolver el código en la respuesta
            $response = [
                'usuario' => $usuario['nombre']
            ];

            // Solo en desarrollo, incluir el código para pruebas
            if (Environment::isDevelopment()) {
                $response['codigo'] = $codigo;
                $response['debug'] = 'Código generado. Revisa los logs si no recibiste el email.';
            }

            return new ResponseDTO(true, "Código enviado con éxito", $response);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al enviar código: " . $e->getMessage(), null, 500);
        }
    }

    public function validateCode(string $email, string $codigo): ResponseDTO {
        try {
            $ipAddress = $this->getClientIP();

            // Verificar rate limiting
            if ($this->rateLimitService->isBlocked($email, $ipAddress)) {
                $timeRemaining = $this->rateLimitService->getBlockTimeRemaining($email, $ipAddress);
                $minutesRemaining = ceil($timeRemaining / 60);
                
                return new ResponseDTO(
                    false, 
                    "Demasiados intentos fallidos. Intenta de nuevo en $minutesRemaining minutos.", 
                    ['blocked_until_seconds' => $timeRemaining],
                    429
                );
            }

            $result = DatabaseService::executeQuery(
                "SELECT c.*, u.uuid, u.nombre, u.email
                 FROM codigos_login c
                 JOIN usuarios u ON c.usuario_uuid = u.uuid
                 WHERE u.email = ? 
                 AND c.codigo = ?
                 AND c.activo = 1
                 AND c.fecha_envio >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                 ORDER BY c.fecha_envio DESC
                 LIMIT 1",
                [$email, $codigo]
            );

            if (empty($result)) {
                // Registrar intento fallido
                $this->rateLimitService->recordAttempt($email, $ipAddress, false);
                
                $remainingAttempts = $this->rateLimitService->getRemainingAttempts($email, $ipAddress);
                
                return new ResponseDTO(
                    false, 
                    "Código inválido o expirado. Intentos restantes: $remainingAttempts", 
                    ['remaining_attempts' => $remainingAttempts],
                    401
                );
            }

            $validacion = $result[0];

            // Marcar código como usado
            DatabaseService::executeStatement(
                "UPDATE codigos_login 
                 SET activo = 0, fecha_validacion = CURRENT_TIMESTAMP
                 WHERE id = ?",
                [$validacion['id']]
            );

            // ✅ Login exitoso - resetear intentos fallidos
            $this->rateLimitService->resetAttempts($email);
            $this->rateLimitService->recordAttempt($email, $ipAddress, true);

            // Crear sesión con SessionManager mejorado
            SessionManager::initSession(
                $validacion['uuid'], 
                $validacion['email'],
                $validacion['nombre']
            );

            // Obtener información de la sesión
            $sessionInfo = SessionManager::getSessionInfo();

            return new ResponseDTO(true, "Código validado correctamente", $sessionInfo);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al validar código: " . $e->getMessage(), null, 500);
        }
    }

    public function checkSession(): ResponseDTO {
        try {
            $sessionInfo = SessionManager::getSessionInfo();

            if (!$sessionInfo['active']) {
                return new ResponseDTO(false, $sessionInfo['message'], null, 401);
            }

            return new ResponseDTO(true, "Sesión activa", $sessionInfo);
        } catch (\Exception $e) {
            return new ResponseDTO(false, "Error al verificar sesión: " . $e->getMessage(), null, 500);
        }
    }

    public function logout(): ResponseDTO {
        try {
            // Siempre intentar cerrar la sesión, incluso si no está activa
            // Esto evita errores si la sesión ya expiró
            SessionManager::endSession();
            return new ResponseDTO(true, "Sesión cerrada correctamente");
        } catch (\Exception $e) {
            // Si hay un error, igual consideramos exitoso el logout
            // (la sesión ya no existe de todas formas)
            return new ResponseDTO(true, "Sesión cerrada", null, 200);
        }
    }

    private function generarCodigo(int $longitud = 8): string {
        $caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $codigo = '';
        for ($i = 0; $i < $longitud; $i++) {
            $codigo .= $caracteres[random_int(0, strlen($caracteres) - 1)];
        }
        return $codigo;
    }
}