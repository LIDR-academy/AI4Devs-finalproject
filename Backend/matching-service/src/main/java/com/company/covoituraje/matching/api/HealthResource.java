package com.company.covoituraje.matching.api;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/health")
@Produces(MediaType.APPLICATION_JSON)
public class HealthResource {
    @GET
    public HealthResponse health() {
        HealthResponse r = new HealthResponse();
        r.status = "UP";
        r.service = "matching-service";
        r.timestamp = System.currentTimeMillis();
        return r;
    }

    public static class HealthResponse {
        public String status;
        public String service;
        public long timestamp;
    }
}



