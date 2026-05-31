package com.mtl.notification.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.SubscriptionAdminItemResponse;
import com.mtl.notification.dto.SubscriptionAdminPageResponse;
import com.mtl.notification.exception.NotificationException;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class SubscriptionAdminServiceTest {

  @Mock private SuscriptorRepository suscriptorRepository;

  private SubscriptionAdminService service;

  @BeforeEach
  void setUp() {
    service = new SubscriptionAdminService(suscriptorRepository);
  }

  @Test
  void list_sinFiltro_usaFindAll() {
    Suscriptor row = suscriptor(1L, EstadoSuscripcion.ACTIVA);
    when(suscriptorRepository.findAll(any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(row), PageRequest.of(0, 20), 1));

    SubscriptionAdminPageResponse page = service.list(0, 20, null, null);

    assertThat(page.content()).hasSize(1);
    assertThat(page.content().get(0).subscriptionId()).isEqualTo(1L);
    assertThat(page.totalElements()).isEqualTo(1);
    verify(suscriptorRepository).findAll(any(Pageable.class));
    verify(suscriptorRepository, never()).findAllByEstadoSuscripcion(any(), any());
    verify(suscriptorRepository, never()).findByEmailContainingIgnoreCase(any(), any());
  }

  @Test
  void list_conFiltro_usaFindByEstado() {
    when(suscriptorRepository.findAllByEstadoSuscripcion(eq(EstadoSuscripcion.CANCELADA), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

    SubscriptionAdminPageResponse page = service.list(0, 20, EstadoSuscripcion.CANCELADA, null);

    assertThat(page.content()).isEmpty();
    verify(suscriptorRepository).findAllByEstadoSuscripcion(eq(EstadoSuscripcion.CANCELADA), any(Pageable.class));
    verify(suscriptorRepository, never()).findAll(any(Pageable.class));
    verify(suscriptorRepository, never()).findByEmailContainingIgnoreCase(any(), any());
  }

  @Test
  void list_conFiltroCorreo_usaContainingIgnoreCase() {
    when(suscriptorRepository.findByEmailContainingIgnoreCase(eq("user"), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

    SubscriptionAdminPageResponse page = service.list(0, 20, null, " user ");

    assertThat(page.content()).isEmpty();
    verify(suscriptorRepository).findByEmailContainingIgnoreCase(eq("user"), any(Pageable.class));
    verify(suscriptorRepository, never()).findAll(any(Pageable.class));
  }

  @Test
  void list_conFiltroCorreoYEstado_usaMetodoCombinado() {
    when(suscriptorRepository.findByEmailContainingIgnoreCaseAndEstadoSuscripcion(
            eq("x@"), eq(EstadoSuscripcion.ACTIVA), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

    SubscriptionAdminPageResponse page = service.list(0, 20, EstadoSuscripcion.ACTIVA, "x@");

    assertThat(page.content()).isEmpty();
    verify(suscriptorRepository)
        .findByEmailContainingIgnoreCaseAndEstadoSuscripcion(
            eq("x@"), eq(EstadoSuscripcion.ACTIVA), any(Pageable.class));
    verify(suscriptorRepository, never()).findAll(any(Pageable.class));
  }

  @Test
  void list_correoSoloBlancos_ignoraFiltroCorreo() {
    when(suscriptorRepository.findAll(any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

    SubscriptionAdminPageResponse page = service.list(0, 20, null, "   ");

    assertThat(page.content()).isEmpty();
    verify(suscriptorRepository).findAll(any(Pageable.class));
    verify(suscriptorRepository, never()).findByEmailContainingIgnoreCase(any(), any());
  }

  @Test
  void updateEstado_idempotente_noPersisteDeNuevo() {
    Suscriptor row = suscriptor(9L, EstadoSuscripcion.ACTIVA);
    when(suscriptorRepository.findById(9L)).thenReturn(Optional.of(row));

    SubscriptionAdminItemResponse out = service.updateEstado(9L, EstadoSuscripcion.ACTIVA);

    assertThat(out.estadoSuscripcion()).isEqualTo(EstadoSuscripcion.ACTIVA);
    verify(suscriptorRepository, never()).save(any());
  }

  @Test
  void updateEstado_aCancelada_persisteYBajaEn() {
    Suscriptor row = suscriptor(3L, EstadoSuscripcion.ACTIVA);
    row.setBajaEn(null);
    when(suscriptorRepository.findById(3L)).thenReturn(Optional.of(row));
    when(suscriptorRepository.save(any(Suscriptor.class))).thenAnswer(inv -> inv.getArgument(0));

    SubscriptionAdminItemResponse out = service.updateEstado(3L, EstadoSuscripcion.CANCELADA);

    assertThat(out.estadoSuscripcion()).isEqualTo(EstadoSuscripcion.CANCELADA);
    ArgumentCaptor<Suscriptor> captor = ArgumentCaptor.forClass(Suscriptor.class);
    verify(suscriptorRepository).save(captor.capture());
    assertThat(captor.getValue().getBajaEn()).isNotNull();
  }

  @Test
  void updateEstado_aActiva_limpiaBajaEn() {
    Suscriptor row = suscriptor(4L, EstadoSuscripcion.CANCELADA);
    row.setBajaEn(OffsetDateTime.parse("2020-01-01T00:00:00Z"));
    when(suscriptorRepository.findById(4L)).thenReturn(Optional.of(row));
    when(suscriptorRepository.save(any(Suscriptor.class))).thenAnswer(inv -> inv.getArgument(0));

    SubscriptionAdminItemResponse out = service.updateEstado(4L, EstadoSuscripcion.ACTIVA);

    assertThat(out.estadoSuscripcion()).isEqualTo(EstadoSuscripcion.ACTIVA);
    ArgumentCaptor<Suscriptor> captor = ArgumentCaptor.forClass(Suscriptor.class);
    verify(suscriptorRepository).save(captor.capture());
    assertThat(captor.getValue().getBajaEn()).isNull();
  }

  @Test
  void updateEstado_noExiste_devuelve404() {
    when(suscriptorRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.updateEstado(99L, EstadoSuscripcion.CANCELADA))
        .isInstanceOf(NotificationException.class)
        .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
  }

  private static Suscriptor suscriptor(Long id, EstadoSuscripcion estado) {
    Suscriptor s = new Suscriptor();
    s.setId(id);
    s.setEmail("a@b.com");
    s.setEstadoSuscripcion(estado);
    s.setAltaEn(OffsetDateTime.parse("2024-06-01T12:00:00Z"));
    s.setConfirmadoEn(OffsetDateTime.parse("2024-06-01T12:00:00Z"));
    return s;
  }
}
