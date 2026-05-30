package com.mtl.notification.application;

import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.SubscriptionCreatedResponse;
import com.mtl.notification.exception.NotificationException;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionRegistrationService {

  static final String TITLE_CONFLICT = "Conflicto";
  static final String MSG_ALREADY_ACTIVE = "Este correo electrónico ya está suscrito a las notificaciones.";
  static final String MSG_CANCELLED =
      "Esta suscripción está cancelada. Un administrador puede reactivarla desde la gestión de suscripciones.";

  private final SuscriptorRepository suscriptorRepository;

  public SubscriptionRegistrationService(SuscriptorRepository suscriptorRepository) {
    this.suscriptorRepository = suscriptorRepository;
  }

  @Transactional
  public SubscriptionCreatedResponse register(String emailRaw) {
    String normalized = normalizeEmail(emailRaw);
    Optional<Suscriptor> existing = suscriptorRepository.findByNormalizedEmail(normalized);
    if (existing.isPresent()) {
      Suscriptor row = existing.get();
      if (row.getEstadoSuscripcion() == EstadoSuscripcion.ACTIVA) {
        throw new NotificationException(HttpStatus.CONFLICT, TITLE_CONFLICT, MSG_ALREADY_ACTIVE);
      }
      throw new NotificationException(HttpStatus.CONFLICT, TITLE_CONFLICT, MSG_CANCELLED);
    }
    Suscriptor created = new Suscriptor();
    created.setEmail(normalized);
    created.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    created.setAltaEn(now);
    created.setConfirmadoEn(now);
    try {
      suscriptorRepository.save(created);
    } catch (DataIntegrityViolationException ex) {
      throw new NotificationException(
          HttpStatus.CONFLICT, TITLE_CONFLICT, MSG_ALREADY_ACTIVE, ex);
    }
    return new SubscriptionCreatedResponse(normalized);
  }

  private static String normalizeEmail(String emailRaw) {
    return emailRaw.trim().toLowerCase(Locale.ROOT);
  }
}
