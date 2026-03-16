<?php

namespace App\Middlewares;

class SecurityHeadersMiddleware {
    public function handle(): void {
        // Prevent clickjacking
        header('X-Frame-Options: DENY');
        
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Enforce HTTPS
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        
        // Content Security Policy
        header("Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.tailwindcss.com; style-src 'self' https://cdn.tailwindcss.com 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
        
        // Referrer Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Remove PHP version
        header_remove('X-Powered-By');
    }
}