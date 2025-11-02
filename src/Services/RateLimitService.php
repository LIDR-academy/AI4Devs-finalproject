<?php
namespace App\Services;

use App\Services\DatabaseService;
use App\Utils\Environment;

class RateLimitService {
    private int $maxAttempts;
    private int $windowSeconds;
    private int $blockDuration;

    public function __construct() {
        $this->maxAttempts = (int) Environment::get('RATE_LIMIT_MAX_ATTEMPTS', 5);
        $this->windowSeconds = (int) Environment::get('RATE_LIMIT_WINDOW', 900); // 15 minutos
        $this->blockDuration = (int) Environment::get('RATE_LIMIT_BLOCK_DURATION', 3600); // 1 hora
    }

    /**
     * Verifica si un email o IP está bloqueado por exceso de intentos
     */
    public function isBlocked(string $email, string $ipAddress): bool {
        try {
            // Limpiar intentos antiguos
            $this->cleanOldAttempts();

            // Calcular timestamp de corte en PHP (evita problemas con INTERVAL en prepared statements)
            $cutoff = (new \DateTimeImmutable())
                ->sub(new \DateInterval('PT' . $this->windowSeconds . 'S'))
                ->format('Y-m-d H:i:s');

            // Contar intentos fallidos recientes por email
            $emailAttempts = DatabaseService::executeQuery(
                "SELECT COUNT(*) as count FROM login_attempts 
                 WHERE email = :email 
                 AND success = 0 
                 AND attempt_time >= :cutoff",
                ['email' => $email, 'cutoff' => $cutoff]
            );

            // Contar intentos fallidos recientes por IP
            $ipAttempts = DatabaseService::executeQuery(
                "SELECT COUNT(*) as count FROM login_attempts 
                 WHERE ip_address = :ip 
                 AND success = 0 
                 AND attempt_time >= :cutoff",
                ['ip' => $ipAddress, 'cutoff' => $cutoff]
            );

            $emailCount = $emailAttempts[0]['count'] ?? 0;
            $ipCount = $ipAttempts[0]['count'] ?? 0;

            return $emailCount >= $this->maxAttempts || $ipCount >= $this->maxAttempts;
        } catch (\Exception $e) {
            error_log("Error verificando rate limit: " . $e->getMessage());
            // En caso de error, permitir el intento (fail open)
            return false;
        }
    }

    /**
     * Registra un intento de login
     */
    public function recordAttempt(string $email, string $ipAddress, bool $success): void {
        try {
            DatabaseService::executeStatement(
                "INSERT INTO login_attempts (email, ip_address, attempt_time, success) 
                 VALUES (?, ?, NOW(), ?)",
                [$email, $ipAddress, $success ? 1 : 0]
            );
        } catch (\Exception $e) {
            error_log("Error registrando intento de login: " . $e->getMessage());
        }
    }

    /**
     * Obtiene el tiempo restante de bloqueo en segundos
     */
    public function getBlockTimeRemaining(string $email, string $ipAddress): int {
        try {
            // Obtener el último intento fallido
            $lastAttempt = DatabaseService::executeQuery(
                "SELECT MAX(attempt_time) as last_attempt FROM login_attempts 
                 WHERE (email = :email OR ip_address = :ip) 
                 AND success = 0",
                ['email' => $email, 'ip' => $ipAddress]
            );

            if (empty($lastAttempt) || !$lastAttempt[0]['last_attempt']) {
                return 0;
            }

            $lastAttemptTime = strtotime($lastAttempt[0]['last_attempt']);
            $blockUntil = $lastAttemptTime + $this->blockDuration;
            $remaining = $blockUntil - time();

            return max(0, $remaining);
        } catch (\Exception $e) {
            error_log("Error obteniendo tiempo de bloqueo: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Limpia intentos antiguos para mantener la tabla limpia
     */
    private function cleanOldAttempts(): void {
        try {
            // Eliminar intentos de más de 24 horas
            DatabaseService::executeStatement(
                "DELETE FROM login_attempts 
                 WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)"
            );
        } catch (\Exception $e) {
            error_log("Error limpiando intentos antiguos: " . $e->getMessage());
        }
    }

    /**
     * Resetea los intentos de un email/IP (útil después de login exitoso)
     */
    public function resetAttempts(string $email): void {
        try {
            // Calcular timestamp de corte en PHP
            $cutoff = (new \DateTimeImmutable())
                ->sub(new \DateInterval('PT' . $this->windowSeconds . 'S'))
                ->format('Y-m-d H:i:s');
            
            // No eliminamos, solo marcamos como exitosos los más recientes
            // Esto mantiene el historial pero "perdona" los intentos anteriores
            DatabaseService::executeStatement(
                "UPDATE login_attempts 
                 SET success = 1 
                 WHERE email = :email 
                 AND success = 0 
                 AND attempt_time >= :cutoff",
                ['email' => $email, 'cutoff' => $cutoff]
            );
        } catch (\Exception $e) {
            error_log("Error reseteando intentos: " . $e->getMessage());
        }
    }

    /**
     * Obtiene el número de intentos restantes
     */
    public function getRemainingAttempts(string $email, string $ipAddress): int {
        try {
            // Calcular timestamp de corte en PHP
            $cutoff = (new \DateTimeImmutable())
                ->sub(new \DateInterval('PT' . $this->windowSeconds . 'S'))
                ->format('Y-m-d H:i:s');
            
            $emailAttempts = DatabaseService::executeQuery(
                "SELECT COUNT(*) as count FROM login_attempts 
                 WHERE email = :email 
                 AND success = 0 
                 AND attempt_time >= :cutoff",
                ['email' => $email, 'cutoff' => $cutoff]
            );

            $count = $emailAttempts[0]['count'] ?? 0;
            return max(0, $this->maxAttempts - $count);
        } catch (\Exception $e) {
            error_log("Error obteniendo intentos restantes: " . $e->getMessage());
            return $this->maxAttempts;
        }
    }
}
