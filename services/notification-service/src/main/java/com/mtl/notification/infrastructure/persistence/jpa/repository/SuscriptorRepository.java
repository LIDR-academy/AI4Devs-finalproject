package com.mtl.notification.infrastructure.persistence.jpa.repository;

import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.Suscriptor;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SuscriptorRepository extends JpaRepository<Suscriptor, Long> {

  @Query("select s from Suscriptor s where lower(trim(s.email)) = :normalizedEmail")
  Optional<Suscriptor> findByNormalizedEmail(@Param("normalizedEmail") String normalizedEmail);

  Page<Suscriptor> findAllByEstadoSuscripcion(EstadoSuscripcion estadoSuscripcion, Pageable pageable);

  Page<Suscriptor> findByEmailContainingIgnoreCase(String email, Pageable pageable);

  Page<Suscriptor> findByEmailContainingIgnoreCaseAndEstadoSuscripcion(
      String email, EstadoSuscripcion estadoSuscripcion, Pageable pageable);
}
