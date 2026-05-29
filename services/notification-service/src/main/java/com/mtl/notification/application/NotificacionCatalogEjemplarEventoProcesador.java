package com.mtl.notification.application;

import com.mtl.notification.domain.EnvioNotificacion;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.EventoCatalogo;
import com.mtl.notification.domain.Notificacion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.CatalogEjemplarEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EnvioNotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.NotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * HU-007-04: persiste {@link Notificacion}, {@link EnvioNotificacion} por suscriptor ACTIVA y
 * envía correo (Mailpit en dev). Sin suscriptores activos: notificación de trazabilidad y
 * actualización del evento a procesado.
 */
@Service
public class NotificacionCatalogEjemplarEventoProcesador implements CatalogEjemplarEventoProcesador {

  private static final Logger log =
      LoggerFactory.getLogger(NotificacionCatalogEjemplarEventoProcesador.class);

  public static final String ESTADO_GENERACION_COMPLETADA = "COMPLETADA";
  public static final String ESTADO_GENERACION_SIN_DESTINATARIOS = "SIN_DESTINATARIOS_ACTIVOS";

  public static final String ESTADO_ENVIO_PENDIENTE = "PENDIENTE";
  public static final String ESTADO_ENVIO_ENVIADA = "ENVIADA";
  public static final String ESTADO_ENVIO_ERROR = "ERROR";

  private static final String MENSAJE_ERROR_TRANSPORTE =
      "Fallo de transporte SMTP (detalle en logs operativos, sin PII).";

  private final EventoCatalogoRepository eventoCatalogoRepository;
  private final NotificacionRepository notificacionRepository;
  private final EnvioNotificacionRepository envioNotificacionRepository;
  private final SuscriptorRepository suscriptorRepository;
  private final EjemplarCreadoCorreoAvisoSender correoAvisoSender;

  public NotificacionCatalogEjemplarEventoProcesador(
      EventoCatalogoRepository eventoCatalogoRepository,
      NotificacionRepository notificacionRepository,
      EnvioNotificacionRepository envioNotificacionRepository,
      SuscriptorRepository suscriptorRepository,
      EjemplarCreadoCorreoAvisoSender correoAvisoSender) {
    this.eventoCatalogoRepository = eventoCatalogoRepository;
    this.notificacionRepository = notificacionRepository;
    this.envioNotificacionRepository = envioNotificacionRepository;
    this.suscriptorRepository = suscriptorRepository;
    this.correoAvisoSender = correoAvisoSender;
  }

  @Override
  @Transactional
  public void procesarEjemplarCreado(CatalogEjemplarEventoPayload payload) {
    EventoCatalogo evento =
        eventoCatalogoRepository
            .findById(payload.eventoId())
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "evento_catalogo no encontrado para evento_id=" + payload.eventoId()));

    List<Suscriptor> activos =
        suscriptorRepository.findAllByEstadoSuscripcionOrderByIdAsc(EstadoSuscripcion.ACTIVA);

    OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);
    Notificacion notificacion = new Notificacion();
    notificacion.setEventoCatalogo(evento);
    notificacion.setGeneradaEn(ahora);
    if (activos.isEmpty()) {
      notificacion.setEstadoGeneracion(ESTADO_GENERACION_SIN_DESTINATARIOS);
      log.info(
          "EJEMPLAR_CREADO sin suscriptores ACTIVA (evento_id={}, ejemplar_id={})",
          payload.eventoId(),
          evento.getEjemplarId());
    } else {
      notificacion.setEstadoGeneracion(ESTADO_GENERACION_COMPLETADA);
    }
    notificacionRepository.save(notificacion);

    List<EnvioNotificacion> envios = new ArrayList<>();
    for (Suscriptor suscriptor : activos) {
      EnvioNotificacion envio = new EnvioNotificacion();
      envio.setNotificacion(notificacion);
      envio.setSuscriptor(suscriptor);
      envio.setEstadoEnvio(ESTADO_ENVIO_PENDIENTE);
      envio.setGeneradaEn(ahora);
      envios.add(envio);
    }
    if (!envios.isEmpty()) {
      envioNotificacionRepository.saveAll(envios);
      envioNotificacionRepository.flush();
      for (EnvioNotificacion envio : envios) {
        Suscriptor destinatario = envio.getSuscriptor();
        String email = destinatario.getEmail();
        boolean enviado =
            correoAvisoSender.intentarEnviar(email, evento.getEjemplarId(), payload.eventoId());
        if (enviado) {
          envio.setEstadoEnvio(ESTADO_ENVIO_ENVIADA);
          envio.setEnviadaEn(OffsetDateTime.now(ZoneOffset.UTC));
          envio.setMensajeError(null);
        } else {
          envio.setEstadoEnvio(ESTADO_ENVIO_ERROR);
          envio.setMensajeError(MENSAJE_ERROR_TRANSPORTE);
        }
      }
      envioNotificacionRepository.saveAll(envios);
    }

    evento.setEstadoProcesamiento(CatalogEjemplarEventoConsumoService.ESTADO_PROCESADO);
    evento.setProcesadoEn(OffsetDateTime.now(ZoneOffset.UTC));
    eventoCatalogoRepository.save(evento);
  }
}
