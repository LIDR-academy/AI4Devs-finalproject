package com.company.covoituraje.matching.integration;

import com.company.covoituraje.http.ServiceHttpClient;
import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.shared.dto.TripDto;

import java.util.Arrays;
import java.util.List;

/**
 * Cliente para comunicarse con el trips-service
 */
public class TripsServiceClient {
    
    private final ServiceHttpClient httpClient;
    
    public TripsServiceClient(String tripsServiceUrl) {
        this.httpClient = new ServiceHttpClient(tripsServiceUrl);
    }
    
    public TripsServiceClient(ServiceHttpClient httpClient) {
        this.httpClient = httpClient;
    }
    
    /**
     * Obtiene todos los trips disponibles para un destino específico
     */
    public List<TripDto> getAvailableTrips(String destinationSedeId) throws ServiceIntegrationException {
        try {
            String path = "/trips?destinationSedeId=" + destinationSedeId;
            TripDto[] trips = httpClient.get(path, TripDto[].class);
            return Arrays.asList(trips);
        } catch (ServiceIntegrationException e) {
            throw new ServiceIntegrationException("Error fetching available trips for destination: " + destinationSedeId, e);
        }
    }
    
    /**
     * Obtiene un trip específico por ID
     */
    public TripDto getTripById(String tripId) throws ServiceIntegrationException {
        try {
            String path = "/trips/" + tripId;
            return httpClient.get(path, TripDto.class);
        } catch (ServiceIntegrationException e) {
            throw new ServiceIntegrationException("Error fetching trip with ID: " + tripId, e);
        }
    }
    
    /**
     * Obtiene todos los trips disponibles
     */
    public List<TripDto> getAllTrips() throws ServiceIntegrationException {
        try {
            TripDto[] trips = httpClient.get("/trips", TripDto[].class);
            return Arrays.asList(trips);
        } catch (ServiceIntegrationException e) {
            throw new ServiceIntegrationException("Error fetching all trips", e);
        }
    }
    
    /**
     * Verifica si el trips-service está disponible
     */
    public boolean isServiceAvailable() {
        return httpClient.isServiceAvailable();
    }
}
