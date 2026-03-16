<?php

namespace App\Utils;

class Validator {
    public static function validateEmail(string $email): bool {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validateUuid(string $uuid): bool {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $uuid) === 1;
    }

    public static function validateId(int $id): bool {
        return $id > 0;
    }

    public static function validateDate(?string $endDate): bool {

        if (!empty($endDate)) {
            $end = strtotime($endDate);
            if ($end === false) {
                return false;
            }
        }

        return true;
    }

    public static function sanitizeString(string $input): string {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    public static function validateLoginCode(string $code): bool {
        // Validate 8-character alphanumeric code
        return preg_match('/^[A-Za-z0-9]{8}$/', $code) === 1;
    }

    public static function validateRequiredFields(array $data, array $requiredFields): array {
        $errors = [];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[] = "El campo '$field' es obligatorio.";
            }
        }
        return $errors;
    }
}