<?php
namespace App\Utils;

class FileUploadSecurity {
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'application/pdf' => 'pdf'
    ];
    
    private const MAX_FILE_SIZE = 5242880; // 5MB
    
    public static function validateUpload(array $file): bool {
        // Verificar errores de subida
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }
        
        // Verificar tamaño
        if ($file['size'] > self::MAX_FILE_SIZE) {
            return false;
        }
        
        // Verificar tipo MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!array_key_exists($mimeType, self::ALLOWED_MIME_TYPES)) {
            return false;
        }
        
        // Verificar extensión real del archivo
        $extension = self::ALLOWED_MIME_TYPES[$mimeType];
        if (!self::hasValidExtension($file['name'], $extension)) {
            return false;
        }
        
        return true;
    }
    
    public static function moveUploadedFile(array $file, string $destination): bool {
        if (!self::validateUpload($file)) {
            return false;
        }
        
        // Generar nombre seguro
        $filename = self::generateSecureFilename($file['name']);
        $fullPath = rtrim($destination, '/') . '/' . $filename;
        
        // Verificar path destino
        if (!SecurityUtils::isValidPath($fullPath)) {
            return false;
        }
        
        // Mover archivo
        return move_uploaded_file(
            $file['tmp_name'],
            $fullPath
        );
    }
    
    private static function hasValidExtension(string $filename, string $expectedExt): bool {
        $actualExt = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        return $actualExt === $expectedExt;
    }
    
    private static function generateSecureFilename(string $originalName): string {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        return sprintf(
            '%s.%s',
            bin2hex(random_bytes(16)),
            SecurityUtils::sanitizeFileName($extension)
        );
    }
}