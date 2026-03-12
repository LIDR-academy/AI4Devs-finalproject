package com.company.covoituraje.notification.repository;

import com.company.covoituraje.notification.domain.NotificationSubscription;
import com.company.covoituraje.notification.infrastructure.JpaConfig;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class NotificationSubscriptionRepository {
    
    private final EntityManager entityManager;
    
    public NotificationSubscriptionRepository() {
        this.entityManager = JpaConfig.createEntityManager();
    }
    
    public NotificationSubscriptionRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }
    
    public NotificationSubscription save(NotificationSubscription subscription) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            if (subscription.getId() == null) {
                entityManager.persist(subscription);
            } else {
                subscription = entityManager.merge(subscription);
            }
            tx.commit();
            return subscription;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }
    
    public Optional<NotificationSubscription> findByUserIdAndEndpoint(String userId, String endpoint) {
        TypedQuery<NotificationSubscription> query = entityManager.createQuery(
            "SELECT ns FROM NotificationSubscription ns WHERE ns.userId = :userId AND ns.endpoint = :endpoint",
            NotificationSubscription.class
        );
        query.setParameter("userId", userId);
        query.setParameter("endpoint", endpoint);
        
        List<NotificationSubscription> results = query.getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
    
    public List<NotificationSubscription> findActiveByUserId(String userId) {
        TypedQuery<NotificationSubscription> query = entityManager.createQuery(
            "SELECT ns FROM NotificationSubscription ns WHERE ns.userId = :userId AND ns.active = true",
            NotificationSubscription.class
        );
        query.setParameter("userId", userId);
        return query.getResultList();
    }
    
    public void delete(NotificationSubscription subscription) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            if (entityManager.contains(subscription)) {
                entityManager.remove(subscription);
            } else {
                entityManager.remove(entityManager.merge(subscription));
            }
            tx.commit();
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }
}
