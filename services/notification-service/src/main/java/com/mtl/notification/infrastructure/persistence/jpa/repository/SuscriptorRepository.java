package com.mtl.notification.infrastructure.persistence.jpa.repository;

import com.mtl.notification.domain.Suscriptor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SuscriptorRepository extends JpaRepository<Suscriptor, Long> {

  @Query("select s from Suscriptor s where lower(trim(s.email)) = :normalizedEmail")
  Optional<Suscriptor> findByNormalizedEmail(@Param("normalizedEmail") String normalizedEmail);
}
