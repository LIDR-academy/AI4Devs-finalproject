package com.mtl.catalog.infrastructure.persistence.jpa.repository;

import com.mtl.catalog.domain.AuditoriaCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditoriaCatalogoRepository extends JpaRepository<AuditoriaCatalogo, Long> {}
