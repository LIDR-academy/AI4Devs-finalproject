package com.company.covoituraje.matching.api;

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

        String origin = requestContext.getHeaderString("Origin");
        if (origin != null && (ALLOWED_ORIGINS.contains("*") || ALLOWED_ORIGINS.contains(origin))) {
            MultivaluedMap<String, Object> headers = responseContext.getHeaders();
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
}
