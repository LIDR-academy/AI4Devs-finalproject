<?php
namespace App\Services;

use App\DTO\ResponseDTO;
use App\Utils\Environment;
use PDO;

class DatabaseService {
    /**
     * Crea una nueva conexión a la base de datos
     */
    private static function createConnection(bool $withoutDatabase = false): PDO {
        try {
            // Intentar primero con variables estándar, luego con variables de Railway
            $host = Environment::get('DB_HOST') ?? Environment::get('MYSQLHOST');
            $user = Environment::get('DB_USER') ?? Environment::get('MYSQLUSER');
            // Soportar DB_PASS, DB_PASSWORD (estándar) y MYSQLPASSWORD (Railway)
            $pass = Environment::get('DB_PASSWORD') ?? Environment::get('DB_PASS') ?? Environment::get('MYSQLPASSWORD');
            
            if ($withoutDatabase) {
                $dsn = "mysql:host={$host}";
            } else {
                $dbName = Environment::get('DB_NAME') ?? Environment::get('MYSQLDATABASE');
                // Intentar primero sin la base de datos
                try {
                    $tempConn = new PDO("mysql:host={$host}", $user, $pass);
                    // Crear la base de datos si no existe
                    $tempConn->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}`");
                    $tempConn = null;
                } catch (\PDOException $e) {
                    error_log("Error al crear base de datos: " . $e->getMessage());
                }
                $dsn = "mysql:host={$host};dbname={$dbName}";
            }
            
            return new PDO(
                $dsn,
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_PERSISTENT => false // Desactivar conexiones persistentes
                ]
            );
        } catch (\PDOException $e) {
            throw new \Exception("Error de conexión: " . $e->getMessage());
        }
    }

    /**
     * Ejecuta una consulta y cierra la conexión automáticamente
     */
    public static function executeQuery(string $query, array $params = [], bool $withoutDatabase = false): array {
        $connection = null;
        try {
            $connection = self::createConnection($withoutDatabase);
            $stmt = $connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } finally {
            if ($connection) {
                $stmt = null; // Liberar el statement
                $connection = null; // Cerrar la conexión
            }
        }
    }

    /**
     * Ejecuta una sentencia y devuelve el número de filas afectadas
     */
    public static function executeStatement(string $query, array $params = [], bool $withoutDatabase = false): int {
        $connection = null;
        try {
            $connection = self::createConnection($withoutDatabase);
            $stmt = $connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } finally {
            if ($connection) {
                $stmt = null; // Liberar el statement
                $connection = null; // Cerrar la conexión
            }
        }
    }

    /**
     * Ejecuta múltiples sentencias en una transacción
     */
    public static function executeTransaction(array $queries, bool $withoutDatabase = false): bool {
        $connection = null;
        try {
            $connection = self::createConnection($withoutDatabase);
            $connection->beginTransaction();

            foreach ($queries as $query) {
                $stmt = $connection->prepare($query['query']);
                $stmt->execute($query['params'] ?? []);
                $stmt = null; // Liberar el statement
            }

            $connection->commit();
            return true;
        } catch (\Exception $e) {
            if ($connection && $connection->inTransaction()) {
                $connection->rollBack();
            }
            throw $e;
        } finally {
            if ($connection) {
                $connection = null; // Cerrar la conexión
            }
        }
    }

    /**
     * Ejecuta un script SQL directamente (para DDL)
     */
    public static function executeScript(string $script, bool $withoutDatabase = false): void {
        $connection = null;
        try {
            $connection = self::createConnection($withoutDatabase);
            $connection->exec($script);
        } finally {
            if ($connection) {
                $connection = null; // Cerrar la conexión
            }
        }
    }
}