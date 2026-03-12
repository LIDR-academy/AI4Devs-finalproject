package com.company.covoituraje.booking.integration;

import com.company.covoituraje.http.ServiceHttpClient;
import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.shared.dto.UserDto;

/**
 * Cliente para comunicarse con el users-service desde booking-service
 */
public class UsersServiceClient {
    
    private final ServiceHttpClient httpClient;
    
    public UsersServiceClient(String usersServiceUrl) {
        this.httpClient = new ServiceHttpClient(usersServiceUrl);
    }
    
    public UsersServiceClient(ServiceHttpClient httpClient) {
        this.httpClient = httpClient;
    }
    
    /**
     * Obtiene información de un usuario específico por ID
     */
    public UserDto getUserById(String userId) throws ServiceIntegrationException {
        try {
            String path = "/users/" + userId;
            return httpClient.get(path, UserDto.class);
        } catch (ServiceIntegrationException e) {
            throw new ServiceIntegrationException("Error fetching user with ID: " + userId, e);
        }
    }
    
    /**
     * Verifica si un usuario existe
     */
    public boolean userExists(String userId) {
        try {
            getUserById(userId);
            return true;
        } catch (ServiceIntegrationException e) {
            return false;
        }
    }
    
    /**
     * Verifica si el users-service está disponible
     */
    public boolean isServiceAvailable() {
        return httpClient.isServiceAvailable();
    }
}
