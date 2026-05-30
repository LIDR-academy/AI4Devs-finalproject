package com.mtl.notification.infrastructure.persistence.jpa.repository;

import com.mtl.notification.domain.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {}
