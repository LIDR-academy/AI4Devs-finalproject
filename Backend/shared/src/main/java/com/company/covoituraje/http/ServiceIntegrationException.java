package com.company.covoituraje.http;

/**
 * Excepción lanzada cuando hay problemas en la comunicación entre servicios
 */
public class ServiceIntegrationException extends Exception {
    
    public ServiceIntegrationException(String message) {
        super(message);
    }
    
    public ServiceIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
