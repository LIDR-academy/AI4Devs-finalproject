package com.company.covoituraje.users.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.MultivaluedMap;

import java.io.IOException;

public class CorsFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        MultivaluedMap<String, Object> headers = responseContext.getHeaders();
        
        // Get the origin from the request
        String origin = requestContext.getHeaderString("Origin");
        
        // Allow all origins for development
        if (origin != null) {
            headers.add("Access-Control-Allow-Origin", origin);
        } else {
            headers.add("Access-Control-Allow-Origin", "*");
        }
        
        headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
        headers.add("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With");
        headers.add("Access-Control-Allow-Credentials", "true");
        headers.add("Vary", "Origin");
        headers.add("Access-Control-Max-Age", "3600");
    }
}

