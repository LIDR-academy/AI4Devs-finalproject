package com.company.covoituraje.booking.infrastructure;

import com.company.covoituraje.booking.domain.Booking;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.TypedQuery;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class BookingRepository {
    
    private final EntityManager entityManager;
    
    public BookingRepository() {
        this.entityManager = JpaConfig.createEntityManager();
    }
    
    public BookingRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Booking save(Booking booking) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            if (booking.getId() == null) {
                entityManager.persist(booking);
            } else {
                booking = entityManager.merge(booking);
            }
            tx.commit();
            return booking;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }

    public Optional<Booking> findById(UUID id) {
        Booking booking = entityManager.find(Booking.class, id);
        return Optional.ofNullable(booking);
    }

    public List<Booking> findAll() {
        TypedQuery<Booking> query = entityManager.createQuery(
            "SELECT b FROM Booking b ORDER BY b.createdAt DESC", Booking.class);
        return query.getResultList();
    }

    public List<Booking> findByTripId(UUID tripId) {
        TypedQuery<Booking> query = entityManager.createQuery(
            "SELECT b FROM Booking b WHERE b.tripId = :tripId ORDER BY b.createdAt ASC", 
            Booking.class);
        query.setParameter("tripId", tripId);
        return query.getResultList();
    }

    public List<Booking> findByPassengerId(String passengerId) {
        TypedQuery<Booking> query = entityManager.createQuery(
            "SELECT b FROM Booking b WHERE b.passengerId = :passengerId ORDER BY b.createdAt DESC", 
            Booking.class);
        query.setParameter("passengerId", passengerId);
        return query.getResultList();
    }

    public List<Booking> findByPassengerIdAndCreatedAtBetween(String passengerId, OffsetDateTime from, OffsetDateTime to) {
        TypedQuery<Booking> query = entityManager.createQuery(
            "SELECT b FROM Booking b WHERE b.passengerId = :passengerId AND b.createdAt >= :from AND b.createdAt <= :to ORDER BY b.createdAt DESC",
            Booking.class);
        query.setParameter("passengerId", passengerId);
        query.setParameter("from", from);
        query.setParameter("to", to);
        return query.getResultList();
    }

    public List<Booking> findByStatus(String status) {
        TypedQuery<Booking> query = entityManager.createQuery(
            "SELECT b FROM Booking b WHERE b.status = :status ORDER BY b.createdAt DESC", 
            Booking.class);
        query.setParameter("status", status);
        return query.getResultList();
    }

    public void delete(Booking booking) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            entityManager.remove(booking);
            tx.commit();
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }
}
