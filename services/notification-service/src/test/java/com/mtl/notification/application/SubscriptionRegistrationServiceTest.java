package com.mtl.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.SubscriptionCreatedResponse;
import com.mtl.notification.exception.NotificationException;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class SubscriptionRegistrationServiceTest {

  @Mock private SuscriptorRepository suscriptorRepository;

  private SubscriptionRegistrationService service;

  @BeforeEach
  void setUp() {
    service = new SubscriptionRegistrationService(suscriptorRepository);
  }

  @Test
  void register_correoNuevo_persisteActivaYDevuelveEmailNormalizado() {
    when(suscriptorRepository.findByNormalizedEmail("user@example.com")).thenReturn(Optional.empty());

    SubscriptionCreatedResponse result = service.register("  User@Example.COM  ");

    assertThat(result.email()).isEqualTo("user@example.com");
    ArgumentCaptor<Suscriptor> captor = ArgumentCaptor.forClass(Suscriptor.class);
    verify(suscriptorRepository).save(captor.capture());
    Suscriptor saved = captor.getValue();
    assertThat(saved.getEmail()).isEqualTo("user@example.com");
    assertThat(saved.getEstadoSuscripcion()).isEqualTo(EstadoSuscripcion.ACTIVA);
    assertThat(saved.getAltaEn()).isNotNull();
    assertThat(saved.getConfirmadoEn()).isNotNull();
  }

  @Test
  void register_yaActiva_lanzaConflict() {
    Suscriptor row = new Suscriptor();
    row.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    when(suscriptorRepository.findByNormalizedEmail("x@y.com")).thenReturn(Optional.of(row));

    assertThatThrownBy(() -> service.register("x@y.com"))
        .isInstanceOf(NotificationException.class)
        .extracting(ex -> ((NotificationException) ex).getStatus())
        .isEqualTo(HttpStatus.CONFLICT);
    verify(suscriptorRepository, never()).save(any());
  }

  @Test
  void register_cancelada_lanzaConflict() {
    Suscriptor row = new Suscriptor();
    row.setEstadoSuscripcion(EstadoSuscripcion.CANCELADA);
    when(suscriptorRepository.findByNormalizedEmail("x@y.com")).thenReturn(Optional.of(row));

    assertThatThrownBy(() -> service.register("x@y.com"))
        .isInstanceOf(NotificationException.class)
        .extracting(ex -> ((NotificationException) ex).getStatus())
        .isEqualTo(HttpStatus.CONFLICT);
    verify(suscriptorRepository, never()).save(any());
  }

  @Test
  void register_integridadDuplicada_mapeaAConflict() {
    when(suscriptorRepository.findByNormalizedEmail("nuevo@example.com")).thenReturn(Optional.empty());
    when(suscriptorRepository.save(any(Suscriptor.class)))
        .thenThrow(new DataIntegrityViolationException("duplicate", null));

    assertThatThrownBy(() -> service.register("nuevo@example.com"))
        .isInstanceOf(NotificationException.class)
        .extracting(ex -> ((NotificationException) ex).getStatus())
        .isEqualTo(HttpStatus.CONFLICT);
  }
}
