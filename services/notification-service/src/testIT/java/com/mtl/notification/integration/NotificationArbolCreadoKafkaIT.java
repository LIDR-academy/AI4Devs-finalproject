package com.mtl.notification.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.mtl.notification.domain.EstadoSuscripcion;
import com.mtl.notification.domain.Suscriptor;
import com.mtl.notification.integration.support.DockerConditions;
import com.mtl.notification.integration.support.NotificationJwtDecoderItConfig;
import com.mtl.notification.infrastructure.persistence.jpa.repository.EventoCatalogoRepository;
import com.mtl.notification.infrastructure.persistence.jpa.repository.SuscriptorRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Postgres + Kafka (Docker): consume {@code catalog.arbol.evento}, idempotencia por {@code
 * evento_id} y persistencia de notificación (TASK-HU-007-05).
 */
@Tag("integration")
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test-it-pg-kafka")
@Import(NotificationJwtDecoderItConfig.class)
@EnabledIf("com.mtl.notification.integration.support.DockerConditions#dockerDisponible")
@SuppressWarnings("deprecation")
class NotificationArbolCreadoKafkaIT {

  private static final String CONSUMER_GROUP = "notification-arbol-it-" + UUID.randomUUID();

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("postgres:16-alpine")
          .withInitScript("postgres-init-notification-it.sql");

  /** Imagen soportada de forma nativa por {@link KafkaContainer} (misma familia que espera Testcontainers). */
  @Container
  static final KafkaContainer KAFKA =
      new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

  @DynamicPropertySource
  static void registerProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("spring.kafka.bootstrap-servers", KAFKA::getBootstrapServers);
    registry.add("mtl.notification.kafka.consumer-group-id", () -> CONSUMER_GROUP);
    registry.add("spring.main.web-application-type", () -> "servlet");
  }

  @Autowired private KafkaTemplate<String, String> kafkaTemplate;
  @Autowired private EventoCatalogoRepository eventoCatalogoRepository;
  @Autowired private SuscriptorRepository suscriptorRepository;
  @Autowired private JdbcTemplate jdbcTemplate;

  private String suscriptorEmail;

  @BeforeEach
  void limpiarYCrearSuscriptorActivo() {
    jdbcTemplate.execute(
        "truncate notification.envio_notificacion, notification.notificacion, notification.evento_catalogo, notification.suscriptor restart identity cascade");

    suscriptorEmail = "kafka-it-" + UUID.randomUUID() + "@example.test";
    Suscriptor s = new Suscriptor();
    s.setEmail(suscriptorEmail);
    s.setEstadoSuscripcion(EstadoSuscripcion.ACTIVA);
    s.setAltaEn(Instant.now());
    suscriptorRepository.saveAndFlush(s);
  }

  @Test
  void kafka_arbolCreado_persisteEventoNotificacionYEnvio() throws Exception {
    long eventoId = 8_001_100L + (System.nanoTime() % 1_000_000);
    long arbolId = 50_001L;
    String json = payloadJson(eventoId, arbolId);

    kafkaTemplate.send("catalog.arbol.evento", String.valueOf(arbolId), json).get();

    awaitEventoProcesado(eventoId);
    assertThat(notificacionCount(eventoId)).isEqualTo(1);
    assertThat(envioCount(eventoId)).isEqualTo(1);
    assertThat(eventoCatalogoRepository.findById(eventoId)).isPresent();
  }

  @Test
  void kafka_arbolCreado_segundaEntrega_idempotenteSinDuplicarNotificacion() throws Exception {
    long eventoId = 8_002_200L + (System.nanoTime() % 1_000_000);
    long arbolId = 50_002L;
    String json = payloadJson(eventoId, arbolId);

    kafkaTemplate.send("catalog.arbol.evento", String.valueOf(arbolId), json).get();
    awaitEventoProcesado(eventoId);
    assertThat(notificacionCount(eventoId)).isEqualTo(1);

    kafkaTemplate.send("catalog.arbol.evento", String.valueOf(arbolId), json).get();
    Thread.sleep(800);

    assertThat(notificacionCount(eventoId)).isEqualTo(1);
    assertThat(envioCount(eventoId)).isEqualTo(1);
  }

  private String payloadJson(long eventoId, long arbolId) {
    return """
        {
          "evento_id": %d,
          "tipo_evento": "ARBOL_CREADO",
          "arbol_id": %d,
          "ocurrido_en": "2026-05-10T18:00:00Z",
          "schemaVersion": "1.0",
          "resumen_cambio": "IT notification-service"
        }
        """
        .formatted(eventoId, arbolId);
  }

  private void awaitEventoProcesado(long eventoId) {
    Duration timeout = Duration.ofSeconds(45);
    long deadline = System.nanoTime() + timeout.toNanos();
    while (System.nanoTime() < deadline) {
      var opt = eventoCatalogoRepository.findById(eventoId);
      if (opt.isPresent() && "PROCESADO".equals(opt.get().getEstadoProcesamiento())) {
        return;
      }
      try {
        Thread.sleep(200);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new AssertionError(e);
      }
    }
    throw new AssertionError("Timeout esperando evento_id=" + eventoId + " en PROCESADO");
  }

  private int notificacionCount(long eventoId) {
    return jdbcTemplate.queryForObject(
        "select count(*) from notification.notificacion where evento_id = ?", Integer.class, eventoId);
  }

  private int envioCount(long eventoId) {
    return jdbcTemplate.queryForObject(
        """
        select count(*) from notification.envio_notificacion en
        inner join notification.notificacion n on n.notificacion_id = en.notificacion_id
        where n.evento_id = ?
        """,
        Integer.class,
        eventoId);
  }
}
