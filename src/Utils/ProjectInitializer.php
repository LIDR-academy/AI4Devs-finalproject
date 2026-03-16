<?php
namespace App\Utils;

use App\Services\DatabaseService;
use PDO;
use PDOException;

class ProjectInitializer {
    private string $dbName;
    
    // Lista blanca de caracteres permitidos para el nombre de la base de datos
    private const VALID_DB_NAME_PATTERN = '/^[a-zA-Z0-9_]+$/';
    
    // Lista de queries DDL permitidas para validación
    private const ALLOWED_DDL_PATTERNS = [
        '/^CREATE\s+TABLE\s+/i',
        '/^ALTER\s+TABLE\s+/i',
        '/^CREATE\s+INDEX\s+/i',
        '/^DROP\s+TABLE\s+/i',
        '/^CREATE\s+DATABASE\s+/i',
        '/^USE\s+/i'
    ];

    public function __construct(string $dbName = 'astillero_tools') {
        if (!$this->isValidDatabaseName($dbName)) {
            throw new \InvalidArgumentException(
                'Nombre de base de datos inválido. Solo se permiten letras, números y guiones bajos.'
            );
        }
        $this->dbName = $dbName;
    }

    public function initializeProject(): bool {
        try {
            // Crear base de datos si no existe
            $this->createDatabaseIfNotExists();

            // Ejecutar schema.sql
            $this->executeSQLFile('schema.sql');

            // Verificar si las tablas necesitan datos iniciales
            if ($this->needsInitialData()) {
                $this->executeSQLFile('data.sql');
            }
            
            // Activar usuarios iniciales
            DatabaseService::executeStatement(
                "UPDATE usuarios SET activo = 1"
            );

            return true;

        } catch (\Exception $e) {
            error_log('Error en la inicialización del proyecto: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createDatabaseIfNotExists(): void {
        try {
            // La conexión automáticamente creará la base de datos si no existe
            $conn = DatabaseService::executeQuery("SELECT DATABASE() as db");
            if (empty($conn)) {
                throw new \Exception("No se pudo conectar a la base de datos");
            }
            
            // Verificar que estamos usando la base de datos correcta
            if ($conn[0]['db'] !== $this->dbName) {
                DatabaseService::executeScript("USE `{$this->dbName}`");
            }
        } catch (\Exception $e) {
            throw new \Exception('Error al crear/seleccionar la base de datos: ' . $e->getMessage());
        }
    }

    private function executeSQLFile(string $filename): void {
        $allowedFiles = ['schema.sql', 'data.sql'];
        if (!in_array($filename, $allowedFiles, true)) {
            throw new \RuntimeException('Archivo SQL no permitido');
        }

        $sqlFile = __DIR__ . '/../../db/' . $filename;
        if (!file_exists($sqlFile) || !is_readable($sqlFile)) {
            throw new \RuntimeException("Archivo {$filename} no encontrado o no legible");
        }

        $sql = file_get_contents($sqlFile);
        if ($sql === false) {
            throw new \RuntimeException("Error al leer el archivo {$filename}");
        }

        // Eliminar comentarios SQL antes de dividir
        $sql = preg_replace('/--.*$/m', '', $sql);
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);

        // Dividir en queries individuales y limpiar
        $queries = array_filter(
            array_map(
                'trim',
                preg_split("/;\s*[\r\n]+/", $sql)
            ),
            function($query) {
                return !empty(trim($query));
            }
        );

        foreach ($queries as $query) {
            try {
                // Validar que la query es segura
                if (!$this->isValidQuery($query)) {
                    error_log("Query potencialmente no segura: " . $query);
                    throw new \RuntimeException("Query no permitida detectada en {$filename}");
                }

                // Ejecutar la query
                DatabaseService::executeScript($query);
                
            } catch (\PDOException $e) {
                // Ignorar errores específicos que son seguros de ignorar
                if ($this->isIgnorableError($e)) {
                    error_log("Advertencia ignorada: " . $e->getMessage());
                    continue;
                }
                throw new \Exception("Error ejecutando query en {$filename}: " . $e->getMessage());
            } catch (\Exception $e) {
                throw new \Exception("Error ejecutando query en {$filename}: " . $e->getMessage());
            }
        }
    }

    private function needsInitialData(): bool {
        try {
            $result = DatabaseService::executeQuery("SELECT COUNT(*) as count FROM usuarios");
            return (int)$result[0]['count'] === 0;
        } catch (\Exception $e) {
            return true; // Si la tabla no existe, necesitamos datos iniciales
        }
    }

    private function isValidDatabaseName(string $name): bool {
        return preg_match(self::VALID_DB_NAME_PATTERN, $name) === 1;
    }

    private function isValidQuery(string $query): bool {
        // Remover comentarios SQL y espacios extra
        $query = preg_replace('/--.*$/m', '', $query);
        $query = preg_replace('/\/\*.*?\*\//s', '', $query);
        $query = trim($query);
        
        // Si la query está vacía después de limpiar comentarios, es válida
        if (empty($query)) {
            return true;
        }
        
        // Verificar patrones maliciosos
        $maliciousPatterns = [
            '/EXECUTE\s+.*?INTO/i',      // Ejecución con salida
            '/EXEC\s+xp_/i',             // Procedimientos extendidos
            '/SHELL|SYSTEM/i',           // Comandos de sistema
            '/INTO\s+OUTFILE/i',         // Escritura de archivos
            '/LOAD\s+DATA\s+INFILE/i',   // Carga de archivos externos
        ];

        foreach ($maliciousPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                return false;
            }
        }

        // Patrones permitidos extendidos
        $allowedPatterns = array_merge(
            self::ALLOWED_DDL_PATTERNS,
            [
                '/^INSERT\s+INTO\s+/i',
                '/^UPDATE\s+/i',
                '/^DELETE\s+FROM\s+/i',
                '/^SELECT\s+/i',
                '/^DROP\s+/i',
                '/^FOREIGN\s+KEY\s+/i',
                '/^REFERENCES\s+/i',
                '/^DEFAULT\s+/i',
                '/^ON\s+UPDATE\s+/i',
                '/^PRIMARY\s+KEY\s+/i'
            ]
        );

        // Verificar si la query coincide con algún patrón permitido
        foreach ($allowedPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                return true;
            }
        }

        // Si no coincide con ningún patrón conocido, revisar si es parte de una definición de columna
        if (preg_match('/^\w+\s+(?:VARCHAR|INT|CHAR|DATETIME|BOOLEAN|TEXT|FLOAT|DECIMAL)/i', $query)) {
            return true;
        }

        return false;
    }

    private function isDataManipulationQuery(string $query): bool {
        $dmlPatterns = [
            '/^INSERT\s+INTO\s+/i',
            '/^UPDATE\s+/i',
            '/^DELETE\s+FROM\s+/i'
        ];

        foreach ($dmlPatterns as $pattern) {
            if (preg_match($pattern, $query)) {
                return true;
            }
        }

        return false;
    }

    private function isIgnorableError(\PDOException $e): bool {
        // Lista de códigos de error que podemos ignorar de forma segura
        $ignorableCodes = [
            '42S01', // Tabla ya existe
            '42S02', // Tabla no existe (al intentar eliminarla)
            '23000', // Violación de clave duplicada
            '42000'  // Error de sintaxis (en algunos casos específicos)
        ];

        return in_array($e->getCode(), $ignorableCodes);
    }
}