package com.mtl.notification.application;

import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.SubscriptionAdminItemResponse;
import com.mtl.notification.dto.SubscriptionAdminPageResponse;
import com.mtl.notification.exception.NotificationException;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionAdminService {

  private static final String TITLE_NOT_FOUND = "No encontrado";

  private final SuscriptorRepository suscriptorRepository;

  public SubscriptionAdminService(SuscriptorRepository suscriptorRepository) {
    this.suscriptorRepository = suscriptorRepository;
  }

  @Transactional(readOnly = true)
  public SubscriptionAdminPageResponse list(
      int page, int size, EstadoSuscripcion filterEstado, String emailFilterRaw) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "altaEn"));
    String emailFilter = normalizeEmailFilter(emailFilterRaw);
    Page<Suscriptor> entityPage;
    if (emailFilter == null) {
      entityPage =
          filterEstado == null
              ? suscriptorRepository.findAll(pageable)
              : suscriptorRepository.findAllByEstadoSuscripcion(filterEstado, pageable);
    } else {
      entityPage =
          filterEstado == null
              ? suscriptorRepository.findByEmailContainingIgnoreCase(emailFilter, pageable)
              : suscriptorRepository.findByEmailContainingIgnoreCaseAndEstadoSuscripcion(
                  emailFilter, filterEstado, pageable);
    }
    Page<SubscriptionAdminItemResponse> mapped = entityPage.map(SubscriptionAdminService::toItem);
    return SubscriptionAdminPageResponse.fromPage(mapped);
  }

  private static String normalizeEmailFilter(String raw) {
    if (raw == null) {
      return null;
    }
    String trimmed = raw.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  @Transactional
  public SubscriptionAdminItemResponse updateEstado(long subscriptionId, EstadoSuscripcion requested) {
    Suscriptor row =
        suscriptorRepository
            .findById(subscriptionId)
            .orElseThrow(
                () ->
                    new NotificationException(
                        HttpStatus.NOT_FOUND,
                        TITLE_NOT_FOUND,
                        "No existe una suscripción con el identificador indicado."));
    if (row.getEstadoSuscripcion() == requested) {
      return toItem(row);
    }
    if (requested == EstadoSuscripcion.CANCELADA) {
      row.setEstadoSuscripcion(EstadoSuscripcion.CANCELADA);
      row.setBajaEn(Instant.now());
    } else {
      row.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
      row.setBajaEn(null);
    }
    suscriptorRepository.save(row);
    return toItem(row);
  }

  private static SubscriptionAdminItemResponse toItem(Suscriptor s) {
    return new SubscriptionAdminItemResponse(
        s.getId(), s.getEmail(), s.getEstadoSuscripcion(), s.getAltaEn(), s.getConfirmadoEn(), s.getBajaEn());
  }
}
