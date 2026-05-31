package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.Ejemplar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EjemplarRepository extends JpaRepository<Ejemplar, Long> {

  @Query("select count(e) > 0 from Ejemplar e where e.especie.id = :especieId")
  boolean existsByEspecieId(@Param("especieId") Long especieId);
}
