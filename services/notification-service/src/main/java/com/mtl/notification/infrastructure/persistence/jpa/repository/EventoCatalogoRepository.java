package com.mtl.notification.infrastructure.persistence.jpa.repository;

import com.mtl.notification.domain.EventoCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoCatalogoRepository extends JpaRepository<EventoCatalogo, Long> {}
