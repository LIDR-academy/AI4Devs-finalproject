package com.mtl.notification.application;

import com.mtl.notification.domain.EnvioNotificacion;
import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.EventoCatalogo;
import com.mtl.notification.domain.Notificacion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.dto.CatalogArbolEventoPayload;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EnvioNotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.NotificacionRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.Instant;
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
public class NotificacionCatalogArbolEventoProcesador implements CatalogArbolEventoProcesador {

  private static final Logger log = LoggerFactory.getLogger(NotificacionCatalogArbolEventoProcesador.class);

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
  private final ArbolCreadoCorreoAvisoSender correoAvisoSender;

  public NotificacionCatalogArbolEventoProcesador(
      EventoCatalogoRepository eventoCatalogoRepository,
      NotificacionRepository notificacionRepository,
      EnvioNotificacionRepository envioNotificacionRepository,
      SuscriptorRepository suscriptorRepository,
      ArbolCreadoCorreoAvisoSender correoAvisoSender) {
    this.eventoCatalogoRepository = eventoCatalogoRepository;
    this.notificacionRepository = notificacionRepository;
    this.envioNotificacionRepository = envioNotificacionRepository;
    this.suscriptorRepository = suscriptorRepository;
    this.correoAvisoSender = correoAvisoSender;
  }

  @Override
  @Transactional
  public void procesarArbolCreado(CatalogArbolEventoPayload payload) {
    EventoCatalogo evento =
        eventoCatalogoRepository
            .findById(payload.eventoId())
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "evento_catalogo no encontrado para evento_id=" + payload.eventoId()));

    List<Suscriptor> activos =
        suscriptorRepository.findAllByEstadoSuscripcionOrderByIdAsc(EstadoSuscripcion.ACTIVA);

    Instant ahora = Instant.now();
    Notificacion notificacion = new Notificacion();
    notificacion.setEventoCatalogo(evento);
    notificacion.setArbolId(payload.arbolId());
    notificacion.setTipoEventoCatalogo(payload.tipoEvento().trim());
    notificacion.setGeneradaEn(ahora);
    if (activos.isEmpty()) {
      notificacion.setEstadoGeneracion(ESTADO_GENERACION_SIN_DESTINATARIOS);
      log.info(
          "ARBOL_CREADO sin suscriptores ACTIVA (evento_id={}, arbol_id={})",
          payload.eventoId(),
          payload.arbolId());
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
            correoAvisoSender.intentarEnviar(email, payload.arbolId(), payload.eventoId());
        if (enviado) {
          envio.setEstadoEnvio(ESTADO_ENVIO_ENVIADA);
          envio.setEnviadaEn(Instant.now());
          envio.setMensajeError(null);
        } else {
          envio.setEstadoEnvio(ESTADO_ENVIO_ERROR);
          envio.setMensajeError(MENSAJE_ERROR_TRANSPORTE);
        }
      }
      envioNotificacionRepository.saveAll(envios);
    }

    evento.setEstadoProcesamiento(CatalogArbolEventoConsumoService.ESTADO_PROCESADO);
    evento.setProcesadoEn(Instant.now());
    eventoCatalogoRepository.save(evento);
  }
}
