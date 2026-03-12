package com.company.covoituraje.matching.service;

import com.company.covoituraje.matching.domain.Match;
import com.company.covoituraje.matching.infrastructure.MatchRepository;
import com.company.covoituraje.matching.integration.TripsServiceClient;
import com.company.covoituraje.matching.api.TripInfo;
import com.company.covoituraje.matching.api.MatchResult;
import com.company.covoituraje.http.ServiceIntegrationException;
import com.company.covoituraje.shared.dto.TripDto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

public class MatchingService {
    
    private final MatchRepository matchRepository;
    private final TripsServiceClient tripsServiceClient;
    
    public MatchingService(MatchRepository matchRepository, TripsServiceClient tripsServiceClient) {
        this.matchRepository = matchRepository;
        this.tripsServiceClient = tripsServiceClient;
    }
    
    public List<MatchResult> findMatches(String passengerId, String destinationSedeId, 
                                       String preferredTime, String originLocation) {
        
        // Get real trip data from trips-service
        List<TripInfo> availableTrips = getAvailableTripsFromService(destinationSedeId);
        
        List<MatchResult> matches = new ArrayList<>();
        
        for (TripInfo trip : availableTrips) {
            if (trip.seatsFree <= 0) continue; // Skip trips with no available seats
            
            double score = calculateMatchScore(trip, destinationSedeId, preferredTime, originLocation);
            
            if (score > 0.0) { // Only include trips with some compatibility
                MatchResult match = new MatchResult();
                match.tripId = trip.id;
                match.driverId = trip.driverId;
                match.origin = trip.origin;
                match.destinationSedeId = trip.destinationSedeId;
                match.dateTime = trip.dateTime;
                match.seatsFree = trip.seatsFree;
                match.score = score;
                match.reasons = getMatchReasons(trip, destinationSedeId, preferredTime, originLocation, score);
                
                matches.add(match);
            }
        }
        
        // Sort by score (highest first)
        matches.sort((a, b) -> Double.compare(b.score, a.score));
        
        // Save matches to database for tracking
        saveMatchesToDatabase(passengerId, matches);
        
        return matches;
    }
    
    private List<TripInfo> getAvailableTripsFromService(String destinationSedeId) {
        try {
            List<TripDto> tripDtos = tripsServiceClient.getAvailableTrips(destinationSedeId);
            return tripDtos.stream()
                    .filter(trip -> trip.seatsFree > 0) // Only trips with available seats
                    .map(this::convertToTripInfo)
                    .collect(Collectors.toList());
        } catch (ServiceIntegrationException e) {
            // Log the error and return empty list as fallback
            System.err.println("Error fetching trips from trips-service: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private TripInfo convertToTripInfo(TripDto tripDto) {
        TripInfo tripInfo = new TripInfo();
        tripInfo.id = tripDto.id;
        tripInfo.driverId = tripDto.driverId;
        tripInfo.destinationSedeId = tripDto.destinationSedeId;
        tripInfo.dateTime = tripDto.dateTime;
        tripInfo.seatsTotal = tripDto.seatsTotal;
        tripInfo.seatsFree = tripDto.seatsFree;
        
        // Convert origin from DTO format to string format
        if (tripDto.origin != null) {
            tripInfo.origin = tripDto.origin.lat + "," + tripDto.origin.lng;
        } else {
            tripInfo.origin = "0.0,0.0"; // Default fallback
        }
        
        return tripInfo;
    }
    
    private double calculateMatchScore(TripInfo trip, String destinationSedeId, 
                                    String preferredTime, String originLocation) {
        double score = 0.0;
        
        // 1. Destination match (40% weight)
        if (destinationSedeId != null && destinationSedeId.equals(trip.destinationSedeId)) {
            score += 0.4;
        }
        
        // 2. Time compatibility (30% weight)
        if (preferredTime != null) {
            double timeScore = calculateTimeScore(trip.dateTime, preferredTime);
            score += timeScore * 0.3;
        }
        
        // 3. Origin proximity (20% weight)
        if (originLocation != null) {
            double locationScore = calculateLocationScore(trip.origin, originLocation);
            score += locationScore * 0.2;
        }
        
        // 4. Availability bonus (10% weight)
        if (trip.seatsFree > 0) {
            double availabilityScore = Math.min(1.0, trip.seatsFree / 4.0); // Max score for 4+ seats
            score += availabilityScore * 0.1;
        }
        
        return Math.min(1.0, score); // Cap at 1.0
    }
    
    private double calculateTimeScore(String tripTime, String preferredTime) {
        try {
            // Parse times (simplified - assumes HH:mm format for preferredTime)
            OffsetDateTime tripDateTime = OffsetDateTime.parse(tripTime, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            int tripHour = tripDateTime.getHour();
            int tripMinute = tripDateTime.getMinute();
            int tripMinutes = tripHour * 60 + tripMinute;
            
            String[] preferredParts = preferredTime.split(":");
            int preferredHour = Integer.parseInt(preferredParts[0]);
            int preferredMinute = Integer.parseInt(preferredParts[1]);
            int preferredMinutes = preferredHour * 60 + preferredMinute;
            
            int timeDiff = Math.abs(tripMinutes - preferredMinutes);
            
            if (timeDiff <= 15) return 1.0;      // Perfect match
            if (timeDiff <= 30) return 0.8;      // Good match
            if (timeDiff <= 60) return 0.5;      // Acceptable match
            if (timeDiff <= 120) return 0.2;     // Poor match
            return 0.0;                          // No match
            
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    private double calculateLocationScore(String tripOrigin, String userOrigin) {
        // Simplified location matching based on Madrid districts
        // In production, this would use real geocoding and distance calculation
        
        if (tripOrigin.equalsIgnoreCase(userOrigin)) {
            return 1.0; // Same location
        }
        
        // Define proximity groups
        Map<String, List<String>> proximityGroups = new HashMap<>();
        proximityGroups.put("north", Arrays.asList("Madrid Norte", "Madrid Centro"));
        proximityGroups.put("south", Arrays.asList("Madrid Sur", "Madrid Centro"));
        proximityGroups.put("east", Arrays.asList("Madrid Este", "Madrid Centro"));
        proximityGroups.put("west", Arrays.asList("Madrid Oeste", "Madrid Centro"));
        proximityGroups.put("center", Arrays.asList("Madrid Centro", "Madrid Norte", "Madrid Sur", "Madrid Este", "Madrid Oeste"));
        
        // Check if origins are in the same proximity group
        for (List<String> group : proximityGroups.values()) {
            if (group.contains(tripOrigin) && group.contains(userOrigin)) {
                return 0.7; // Same proximity group
            }
        }
        
        return 0.3; // Different areas but still in Madrid
    }
    
    private List<String> getMatchReasons(TripInfo trip, String destinationSedeId, 
                                       String preferredTime, String originLocation, double score) {
        List<String> reasons = new ArrayList<>();
        
        if (destinationSedeId != null && destinationSedeId.equals(trip.destinationSedeId)) {
            reasons.add("Same destination");
        }
        
        if (preferredTime != null) {
            try {
                OffsetDateTime tripDateTime = OffsetDateTime.parse(trip.dateTime, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                String[] preferredParts = preferredTime.split(":");
                int preferredHour = Integer.parseInt(preferredParts[0]);
                int preferredMinute = Integer.parseInt(preferredParts[1]);
                
                int timeDiff = Math.abs(tripDateTime.getHour() * 60 + tripDateTime.getMinute() - 
                                      (preferredHour * 60 + preferredMinute));
                
                if (timeDiff <= 15) {
                    reasons.add("Perfect time match");
                } else if (timeDiff <= 30) {
                    reasons.add("Good time match");
                } else if (timeDiff <= 60) {
                    reasons.add("Acceptable time");
                }
            } catch (Exception e) {
                // Ignore time parsing errors
            }
        }
        
        if (trip.seatsFree >= 2) {
            reasons.add("Multiple seats available");
        }
        
        if (score >= 0.8) {
            reasons.add("High compatibility");
        }
        
        return reasons;
    }
    
    private void saveMatchesToDatabase(String passengerId, List<MatchResult> matches) {
        for (MatchResult match : matches) {
            try {
                UUID tripId = UUID.fromString(match.tripId);
                
                // Check if match already exists
                List<Match> existingMatches = matchRepository.findByTripIdAndPassengerId(tripId, passengerId);
                if (!existingMatches.isEmpty()) {
                    // Update existing match
                    Match existingMatch = existingMatches.get(0);
                    existingMatch.setMatchScore(BigDecimal.valueOf(match.score));
                    existingMatch.setUpdatedAt(OffsetDateTime.now());
                    matchRepository.save(existingMatch);
                } else {
                    // Create new match
                    Match newMatch = new Match(tripId, passengerId, match.driverId, 
                                             BigDecimal.valueOf(match.score), "PENDING");
                    matchRepository.save(newMatch);
                }
            } catch (Exception e) {
                // Log error but continue processing
                System.err.println("Error saving match: " + e.getMessage());
            }
        }
    }
}
