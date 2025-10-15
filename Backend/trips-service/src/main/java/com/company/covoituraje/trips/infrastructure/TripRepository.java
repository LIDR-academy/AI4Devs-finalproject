package com.company.covoituraje.trips.infrastructure;

import com.company.covoituraje.trips.domain.Trip;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.TypedQuery;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class TripRepository {
    
    private final EntityManager entityManager;
    
    public TripRepository() {
        this.entityManager = JpaConfig.createEntityManager();
    }
    
    public TripRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Trip save(Trip trip) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            if (trip.getId() == null) {
                entityManager.persist(trip);
            } else {
                trip = entityManager.merge(trip);
            }
            tx.commit();
            return trip;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }

    public Optional<Trip> findById(UUID id) {
        Trip trip = entityManager.find(Trip.class, id);
        return Optional.ofNullable(trip);
    }

    public List<Trip> findAll() {
        TypedQuery<Trip> query = entityManager.createQuery(
            "SELECT t FROM Trip t ORDER BY t.dateTime ASC", Trip.class);
        return query.getResultList();
    }

    public List<Trip> findByDestinationSedeId(String destinationSedeId) {
        TypedQuery<Trip> query = entityManager.createQuery(
            "SELECT t FROM Trip t WHERE t.destinationSedeId = :destinationSedeId ORDER BY t.dateTime ASC", 
            Trip.class);
        query.setParameter("destinationSedeId", destinationSedeId);
        return query.getResultList();
    }

    public List<Trip> findByDateTimeBetween(OffsetDateTime from, OffsetDateTime to) {
        TypedQuery<Trip> query = entityManager.createQuery(
            "SELECT t FROM Trip t WHERE t.dateTime >= :from AND t.dateTime <= :to ORDER BY t.dateTime ASC",
            Trip.class);
        query.setParameter("from", from);
        query.setParameter("to", to);
        return query.getResultList();
    }

    public List<Trip> findByDestinationSedeIdAndDateTimeBetween(String destinationSedeId, OffsetDateTime from, OffsetDateTime to) {
        TypedQuery<Trip> query = entityManager.createQuery(
            "SELECT t FROM Trip t WHERE t.destinationSedeId = :destinationSedeId AND t.dateTime >= :from AND t.dateTime <= :to ORDER BY t.dateTime ASC",
            Trip.class);
        query.setParameter("destinationSedeId", destinationSedeId);
        query.setParameter("from", from);
        query.setParameter("to", to);
        return query.getResultList();
    }

    public List<Trip> findByDriverId(String driverId) {
        TypedQuery<Trip> query = entityManager.createQuery(
            "SELECT t FROM Trip t WHERE t.driverId = :driverId ORDER BY t.dateTime ASC", 
            Trip.class);
        query.setParameter("driverId", driverId);
        return query.getResultList();
    }

    public List<Trip> findAvailableTrips(String destinationSedeId) {
        OffsetDateTime now = OffsetDateTime.now();
        TypedQuery<Trip> query = entityManager.createQuery(
            "SELECT t FROM Trip t WHERE t.destinationSedeId = :destinationSedeId AND t.seatsFree > 0 AND t.dateTime > :now ORDER BY t.dateTime ASC", 
            Trip.class);
        query.setParameter("destinationSedeId", destinationSedeId);
        query.setParameter("now", now);
        return query.getResultList();
    }

    public void delete(Trip trip) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            // Ensure the entity is managed before removing
            if (!entityManager.contains(trip)) {
                trip = entityManager.merge(trip);
            }
            entityManager.remove(trip);
            tx.commit();
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }
}
