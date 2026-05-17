package com.mtl.notification.infrastructure.persistence.jpa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.mtl.notification.domain.EnvioNotificacion;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.EventoCatalogo;
import com.mtl.notification.domain.Notificacion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EnvioNotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.NotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class NotificationCatalogEventPersistenceTest {

  @Autowired private SuscriptorRepository suscriptorRepository;
  @Autowired private EventoCatalogoRepository eventoCatalogoRepository;
  @Autowired private NotificacionRepository notificacionRepository;
  @Autowired private EnvioNotificacionRepository envioNotificacionRepository;

  @Test
  void persiste_cadena_evento_notificacion_envio_y_resuelve_por_evento_id() {
    Suscriptor suscriptor = new Suscriptor();
    suscriptor.setEmail("hu007-test@example.test");
    suscriptor.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    Instant ahora = Instant.parse("2026-05-10T12:00:00Z");
    suscriptor.setAltaEn(ahora);
    suscriptorRepository.save(suscriptor);

    EventoCatalogo evento = new EventoCatalogo();
    evento.setEventoId(9_001L);
    evento.setTipoEvento("ARBOL_CREADO");
    evento.setArbolId(55L);
    evento.setEstadoProcesamiento("RECIBIDO");
    evento.setRecibidoEn(ahora);
    eventoCatalogoRepository.save(evento);

    Notificacion notificacion = new Notificacion();
    notificacion.setEventoCatalogo(evento);
    notificacion.setArbolId(55L);
    notificacion.setTipoEventoCatalogo("ARBOL_CREADO");
    notificacion.setEstadoGeneracion("PENDIENTE");
    notificacion.setGeneradaEn(ahora);
    notificacionRepository.save(notificacion);

    EnvioNotificacion envio = new EnvioNotificacion();
    envio.setNotificacion(notificacion);
    envio.setSuscriptor(suscriptor);
    envio.setEstadoEnvio("PENDIENTE");
    envio.setGeneradaEn(ahora);
    envioNotificacionRepository.save(envio);

    assertThat(eventoCatalogoRepository.existsById(9_001L)).isTrue();
    assertThat(notificacionRepository.findById(notificacion.getNotificacionId()))
        .isPresent()
        .get()
        .extracting(Notificacion::getArbolId)
        .isEqualTo(55L);
    assertThat(envioNotificacionRepository.findAll()).hasSize(1);
  }

  @Test
  void envio_duplicado_misma_notificacion_y_suscriptor_falla_por_unicidad() {
    Suscriptor suscriptor = new Suscriptor();
    suscriptor.setEmail("hu007-dup@example.test");
    suscriptor.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    Instant ahora = Instant.parse("2026-05-10T13:00:00Z");
    suscriptor.setAltaEn(ahora);
    suscriptorRepository.save(suscriptor);

    EventoCatalogo evento = new EventoCatalogo();
    evento.setEventoId(9_002L);
    evento.setTipoEvento("ARBOL_CREADO");
    evento.setArbolId(56L);
    evento.setEstadoProcesamiento("RECIBIDO");
    evento.setRecibidoEn(ahora);
    eventoCatalogoRepository.save(evento);

    Notificacion notificacion = new Notificacion();
    notificacion.setEventoCatalogo(evento);
    notificacion.setArbolId(56L);
    notificacion.setTipoEventoCatalogo("ARBOL_CREADO");
    notificacion.setEstadoGeneracion("PENDIENTE");
    notificacion.setGeneradaEn(ahora);
    notificacionRepository.save(notificacion);

    EnvioNotificacion primero = new EnvioNotificacion();
    primero.setNotificacion(notificacion);
    primero.setSuscriptor(suscriptor);
    primero.setEstadoEnvio("PENDIENTE");
    primero.setGeneradaEn(ahora);
    envioNotificacionRepository.saveAndFlush(primero);

    EnvioNotificacion duplicado = new EnvioNotificacion();
    duplicado.setNotificacion(notificacion);
    duplicado.setSuscriptor(suscriptor);
    duplicado.setEstadoEnvio("PENDIENTE");
    duplicado.setGeneradaEn(ahora);

    assertThatThrownBy(() -> envioNotificacionRepository.saveAndFlush(duplicado))
        .isInstanceOf(DataIntegrityViolationException.class);
  }

  @Test
  void findAllByEstadoSuscripcionOrderByIdAsc_solo_activa_y_orden_por_id() {
    Instant ahora = Instant.parse("2026-05-10T14:00:00Z");

    Suscriptor cancelado = new Suscriptor();
    cancelado.setEmail("cancelado-repo@example.test");
    cancelado.setEstadoSuscripcion(EstadoSuscripcion.CANCELADA);
    cancelado.setAltaEn(ahora);
    suscriptorRepository.saveAndFlush(cancelado);

    Suscriptor a1 = new Suscriptor();
    a1.setEmail("activo-a@example.test");
    a1.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    a1.setAltaEn(ahora);
    suscriptorRepository.saveAndFlush(a1);

    Suscriptor a2 = new Suscriptor();
    a2.setEmail("activo-b@example.test");
    a2.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    a2.setAltaEn(ahora);
    suscriptorRepository.saveAndFlush(a2);

    List<Suscriptor> activos =
        suscriptorRepository.findAllByEstadoSuscripcionOrderByIdAsc(EstadoSuscripcion.ACTIVA);

    assertThat(activos).hasSize(2).extracting(Suscriptor::getEmail).containsExactly("activo-a@example.test", "activo-b@example.test");
    assertThat(activos.get(0).getId()).isLessThan(activos.get(1).getId());
  }
}
