package com.company.covoituraje.booking.integration;

import com.company.covoituraje.http.ServiceHttpClient;
import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.shared.dto.TripDto;

/**
 * Cliente para comunicarse con el trips-service desde booking-service
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
     * Obtiene un trip específico por ID para validar que existe
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
     * Verifica si un trip tiene suficientes asientos disponibles
     */
    public boolean hasAvailableSeats(String tripId, int seatsRequested) throws ServiceIntegrationException {
        TripDto trip = getTripById(tripId);
        return trip.seatsFree >= seatsRequested;
    }
    
    /**
     * Verifica si el trips-service está disponible
     */
    public boolean isServiceAvailable() {
        return httpClient.isServiceAvailable();
    }
}
