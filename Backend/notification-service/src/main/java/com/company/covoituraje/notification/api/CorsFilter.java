package com.company.covoituraje.notification.api;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.ext.Provider;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Provider
@Priority(Priorities.HEADER_DECORATOR)
public class CorsFilter implements ContainerResponseFilter {

    private static final Set<String> ALLOWED_ORIGINS = initAllowedOrigins();

    private static Set<String> initAllowedOrigins() {
        String env = System.getenv().getOrDefault("ALLOWED_ORIGINS", "http://localhost:5173");
        return Arrays.stream(env.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toSet());
    }

    @Override
    public void filter(ContainerRequestContext requestContext,
                       ContainerResponseContext responseContext) {

        // Add security headers to all responses
        MultivaluedMap<String, Object> headers = responseContext.getHeaders();
        addSecurityHeaders(headers);

        // CORS handling - NO WILDCARD SUPPORT for security
        String origin = requestContext.getHeaderString("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            headers.putSingle("Access-Control-Allow-Origin", origin);
            headers.putSingle("Vary", "Origin");
            headers.putSingle("Access-Control-Allow-Credentials", "true");
            headers.putSingle("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");

            String reqHeaders = requestContext.getHeaderString("Access-Control-Request-Headers");
            if (reqHeaders != null && !reqHeaders.isBlank()) {
                headers.putSingle("Access-Control-Allow-Headers", reqHeaders);
            } else {
                headers.putSingle("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
            }
            headers.putSingle("Access-Control-Max-Age", "3600");
        }
    }

    /**
     * Add security headers to all responses.
     * Follows OWASP security guidelines.
     */
    private void addSecurityHeaders(MultivaluedMap<String, Object> headers) {
        // Prevent MIME type sniffing
        headers.putSingle("X-Content-Type-Options", "nosniff");
        
        // Prevent clickjacking
        headers.putSingle("X-Frame-Options", "DENY");
        
        // XSS Protection (legacy but still useful)
        headers.putSingle("X-XSS-Protection", "1; mode=block");
        
        // Referrer Policy
        headers.putSingle("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Content Security Policy (basic)
        headers.putSingle("Content-Security-Policy", 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' https:; " +
            "font-src 'self'; " +
            "object-src 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'");
        
        // HSTS (only for HTTPS in production)
        String protocol = System.getenv().getOrDefault("HTTPS_ENABLED", "false");
        if ("true".equalsIgnoreCase(protocol)) {
            headers.putSingle("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        }
    }
}
