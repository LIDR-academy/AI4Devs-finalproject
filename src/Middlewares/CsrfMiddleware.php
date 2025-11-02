<?php

namespace App\Middlewares;

use App\Utils\SessionManager;

class CsrfMiddleware {
    public function handle(): void {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            return;
        }

        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? null;

        if (!$token || !SessionManager::validateCsrfToken($token)) {
            http_response_code(403);
            echo json_encode(['error' => 'Invalid CSRF token']);
            exit();
        }
    }

    public static function getToken(): string {
        return SessionManager::getCsrfToken() ?? '';
    }
}