package com.company.covoituraje.users.infrastructure;

import com.company.covoituraje.users.domain.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.TypedQuery;
import java.util.List;
import java.util.Optional;

public class UserRepository {
    
    private final EntityManager entityManager;
    
    public UserRepository() {
        this.entityManager = JpaConfig.createEntityManager();
    }
    
    public UserRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public User save(User user) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            if (user.getId() == null) {
                entityManager.persist(user);
            } else {
                user = entityManager.merge(user);
            }
            tx.commit();
            return user;
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }

    public Optional<User> findById(String id) {
        User user = entityManager.find(User.class, id);
        return Optional.ofNullable(user);
    }

    public Optional<User> findByEmail(String email) {
        TypedQuery<User> query = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.email = :email", User.class);
        query.setParameter("email", email);
        List<User> results = query.getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<User> findAll() {
        TypedQuery<User> query = entityManager.createQuery(
            "SELECT u FROM User u ORDER BY u.name ASC", User.class);
        return query.getResultList();
    }

    public List<User> findBySedeId(String sedeId) {
        TypedQuery<User> query = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.sedeId = :sedeId ORDER BY u.name ASC", 
            User.class);
        query.setParameter("sedeId", sedeId);
        return query.getResultList();
    }

    public List<User> findByRole(String role) {
        TypedQuery<User> query = entityManager.createQuery(
            "SELECT u FROM User u WHERE u.role = :role ORDER BY u.name ASC", 
            User.class);
        query.setParameter("role", role);
        return query.getResultList();
    }

    public void delete(User user) {
        EntityTransaction tx = entityManager.getTransaction();
        try {
            tx.begin();
            entityManager.remove(user);
            tx.commit();
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            throw e;
        }
    }
}
