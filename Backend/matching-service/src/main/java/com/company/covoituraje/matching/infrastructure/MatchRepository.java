package com.company.covoituraje.matching.infrastructure;

import com.company.covoituraje.matching.domain.Match;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.TypedQuery;
import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class MatchRepository {
    
    private final EntityManager entityManager;
    
    public MatchRepository() {
        this.entityManager = JpaConfig.createEntityManager();
    }
    
    public MatchRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Match save(Match match) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            if (match.getId() == null) {
                entityManager.persist(match);
            } else {
                match = entityManager.merge(match);
            }
            tx.commit();
            return match;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }

    public Optional<Match> findById(UUID id) {
        Match match = entityManager.find(Match.class, id);
        return Optional.ofNullable(match);
    }

    public List<Match> findAll() {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m ORDER BY m.matchScore DESC, m.createdAt DESC", Match.class);
        return query.getResultList();
    }

    public List<Match> findByTripId(UUID tripId) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.tripId = :tripId ORDER BY m.matchScore DESC", 
            Match.class);
        query.setParameter("tripId", tripId);
        return query.getResultList();
    }

    public List<Match> findByPassengerId(String passengerId) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.passengerId = :passengerId ORDER BY m.matchScore DESC", 
            Match.class);
        query.setParameter("passengerId", passengerId);
        return query.getResultList();
    }

    public List<Match> findByPassengerIdAndCreatedAtBetween(String passengerId, OffsetDateTime from, OffsetDateTime to) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.passengerId = :passengerId AND m.createdAt >= :from AND m.createdAt <= :to ORDER BY m.matchScore DESC",
            Match.class);
        query.setParameter("passengerId", passengerId);
        query.setParameter("from", from);
        query.setParameter("to", to);
        return query.getResultList();
    }

    public List<Match> findByDriverId(String driverId) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.driverId = :driverId ORDER BY m.matchScore DESC", 
            Match.class);
        query.setParameter("driverId", driverId);
        return query.getResultList();
    }

    public List<Match> findByDriverIdAndCreatedAtBetween(String driverId, OffsetDateTime from, OffsetDateTime to) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.driverId = :driverId AND m.createdAt >= :from AND m.createdAt <= :to ORDER BY m.matchScore DESC",
            Match.class);
        query.setParameter("driverId", driverId);
        query.setParameter("from", from);
        query.setParameter("to", to);
        return query.getResultList();
    }

    public List<Match> findByStatus(String status) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.status = :status ORDER BY m.matchScore DESC", 
            Match.class);
        query.setParameter("status", status);
        return query.getResultList();
    }

    public List<Match> findByTripIdAndPassengerId(UUID tripId, String passengerId) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.tripId = :tripId AND m.passengerId = :passengerId", 
            Match.class);
        query.setParameter("tripId", tripId);
        query.setParameter("passengerId", passengerId);
        return query.getResultList();
    }

    public List<Match> findHighScoreMatches(BigDecimal minScore) {
        TypedQuery<Match> query = entityManager.createQuery(
            "SELECT m FROM Match m WHERE m.matchScore >= :minScore ORDER BY m.matchScore DESC", 
            Match.class);
        query.setParameter("minScore", minScore);
        return query.getResultList();
    }

    public void delete(Match match) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            entityManager.remove(match);
            tx.commit();
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }
}
