package com.mtl.catalog.infrastructure.messaging;

import com.mtl.catalog.application.EjemplarCreadoEventPublisher;
import com.mtl.catalog.config.CatalogKafkaProperties;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.imp.CatalogEjemplarEventoIdSequence;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Service
@ConditionalOnProperty(name = "mtl.catalog.kafka.enabled", havingValue = "true")
public class KafkaEjemplarCreadoEventPublisher implements EjemplarCreadoEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(KafkaEjemplarCreadoEventPublisher.class);

  static final String TIPO_EJEMPLAR_CREADO = "EJEMPLAR_CREADO";
  static final String SCHEMA_VERSION = "1.0";
  static final String RESUMEN_ALTA = "Alta de ficha";

  private final CatalogEjemplarEventoIdSequence eventoIdSequence;
  private final KafkaTemplate<String, String> kafkaTemplate;
  private final JsonMapper jsonMapper;
  private final CatalogKafkaProperties kafkaProperties;

  public KafkaEjemplarCreadoEventPublisher(
      CatalogEjemplarEventoIdSequence eventoIdSequence,
      KafkaTemplate<String, String> kafkaTemplate,
      JsonMapper jsonMapper,
      CatalogKafkaProperties kafkaProperties) {
    this.eventoIdSequence = eventoIdSequence;
    this.kafkaTemplate = kafkaTemplate;
    this.jsonMapper = jsonMapper;
    this.kafkaProperties = kafkaProperties;
  }

  @Override
  public void publishEjemplarCreado(long ejemplarId, OffsetDateTime ocurridoEn) {
    long eventoId = eventoIdSequence.next();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("schemaVersion", SCHEMA_VERSION);
    body.put("evento_id", eventoId);
    body.put("tipo_evento", TIPO_EJEMPLAR_CREADO);
    body.put("ejemplar_id", ejemplarId);
    body.put("ocurrido_en", ocurridoEn);
    body.put("resumen_cambio", RESUMEN_ALTA);
    String json = writeJson(body);
    String topic = kafkaProperties.getEjemplarEventoTopic();
    String key = Long.toString(ejemplarId);
    try {
      kafkaTemplate.send(topic, key, json).get();
    } catch (Exception ex) {
      log.error(
          "No se pudo publicar EJEMPLAR_CREADO en Kafka (topic={}, ejemplarId={}, eventoId={})",
          topic,
          ejemplarId,
          eventoId,
          ex);
    }
  }

  private String writeJson(Map<String, Object> body) {
    try {
      var out = new ByteArrayOutputStream();
      jsonMapper.writeValue(out, body);
      return out.toString(StandardCharsets.UTF_8);
    } catch (Exception ex) {
      throw new IllegalStateException("Serialización JSON del evento de árbol", ex);
    }
  }
}
