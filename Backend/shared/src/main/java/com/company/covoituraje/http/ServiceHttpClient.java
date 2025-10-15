package com.company.covoituraje.http;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Cliente HTTP compartido para comunicación entre microservicios
 */
public class ServiceHttpClient {
    
    private final java.net.http.HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    
    public ServiceHttpClient(String baseUrl) {
        this.baseUrl = baseUrl;
        this.httpClient = java.net.http.HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    public ServiceHttpClient(String baseUrl, java.net.http.HttpClient httpClient) {
        this.baseUrl = baseUrl;
        this.httpClient = httpClient;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }
    
    /**
     * Realiza una petición GET y deserializa la respuesta
     */
    public <T> T get(String path, Class<T> responseType) throws ServiceIntegrationException {
        return get(path, responseType, null);
    }
    
    /**
     * Realiza una petición GET con token de autorización
     */
    public <T> T get(String path, Class<T> responseType, String authToken) throws ServiceIntegrationException {
        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(30))
                    .GET();
            
            if (authToken != null) {
                requestBuilder.header("Authorization", "Bearer " + authToken);
            }
            
            HttpRequest request = requestBuilder.build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), responseType);
            } else {
                throw new ServiceIntegrationException(
                    "HTTP " + response.statusCode() + " error calling " + baseUrl + path + ": " + response.body()
                );
            }
        } catch (IOException | InterruptedException e) {
            throw new ServiceIntegrationException("Error calling service at " + baseUrl + path, e);
        }
    }
    
    /**
     * Realiza una petición POST y deserializa la respuesta
     */
    public <T> T post(String path, Object requestBody, Class<T> responseType) throws ServiceIntegrationException {
        return post(path, requestBody, responseType, null);
    }
    
    /**
     * Realiza una petición POST con token de autorización
     */
    public <T> T post(String path, Object requestBody, Class<T> responseType, String authToken) throws ServiceIntegrationException {
        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .header("Content-Type", "application/json");
            
            if (authToken != null) {
                requestBuilder.header("Authorization", "Bearer " + authToken);
            }
            
            HttpRequest request = requestBuilder.build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), responseType);
            } else {
                throw new ServiceIntegrationException(
                    "HTTP " + response.statusCode() + " error calling " + baseUrl + path + ": " + response.body()
                );
            }
        } catch (IOException | InterruptedException e) {
            throw new ServiceIntegrationException("Error calling service at " + baseUrl + path, e);
        }
    }
    
    /**
     * Realiza una petición PUT y deserializa la respuesta
     */
    public <T> T put(String path, Object requestBody, Class<T> responseType) throws ServiceIntegrationException {
        return put(path, requestBody, responseType, null);
    }
    
    /**
     * Realiza una petición PUT con token de autorización
     */
    public <T> T put(String path, Object requestBody, Class<T> responseType, String authToken) throws ServiceIntegrationException {
        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .timeout(Duration.ofSeconds(30))
                    .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .header("Content-Type", "application/json");
            
            if (authToken != null) {
                requestBuilder.header("Authorization", "Bearer " + authToken);
            }
            
            HttpRequest request = requestBuilder.build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), responseType);
            } else {
                throw new ServiceIntegrationException(
                    "HTTP " + response.statusCode() + " error calling " + baseUrl + path + ": " + response.body()
                );
            }
        } catch (IOException | InterruptedException e) {
            throw new ServiceIntegrationException("Error calling service at " + baseUrl + path, e);
        }
    }
    
    /**
     * Verifica si el servicio está disponible
     */
    public boolean isServiceAvailable() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/health"))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            return false;
        }
    }
}
