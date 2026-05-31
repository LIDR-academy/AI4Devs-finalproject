package com.mtl.notification.infrastructure.persistence.jpa.repository;

import com.mtl.notification.domain.EnvioNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvioNotificacionRepository extends JpaRepository<EnvioNotificacion, Long> {}
