package com.mtl.catalog.infrastructure.messaging;

import com.mtl.catalog.application.ArbolCreadoEventPublisher;
import com.mtl.catalog.config.CatalogKafkaProperties;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.imp.CatalogArbolEventoIdSequence;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
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
public class KafkaArbolCreadoEventPublisher implements ArbolCreadoEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(KafkaArbolCreadoEventPublisher.class);

  static final String TIPO_ARBOL_CREADO = "ARBOL_CREADO";
  static final String SCHEMA_VERSION = "1.0";
  static final String RESUMEN_ALTA = "Alta de ficha";

  private final CatalogArbolEventoIdSequence eventoIdSequence;
  private final KafkaTemplate<String, String> kafkaTemplate;
  private final JsonMapper jsonMapper;
  private final CatalogKafkaProperties kafkaProperties;

  public KafkaArbolCreadoEventPublisher(
      CatalogArbolEventoIdSequence eventoIdSequence,
      KafkaTemplate<String, String> kafkaTemplate,
      JsonMapper jsonMapper,
      CatalogKafkaProperties kafkaProperties) {
    this.eventoIdSequence = eventoIdSequence;
    this.kafkaTemplate = kafkaTemplate;
    this.jsonMapper = jsonMapper;
    this.kafkaProperties = kafkaProperties;
  }

  @Override
  public void publishArbolCreado(long arbolId, Instant ocurridoEn) {
    long eventoId = eventoIdSequence.next();
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("schemaVersion", SCHEMA_VERSION);
    body.put("evento_id", eventoId);
    body.put("tipo_evento", TIPO_ARBOL_CREADO);
    body.put("arbol_id", arbolId);
    body.put("ocurrido_en", ocurridoEn);
    body.put("resumen_cambio", RESUMEN_ALTA);
    String json = writeJson(body);
    String topic = kafkaProperties.getArbolEventoTopic();
    String key = Long.toString(arbolId);
    try {
      kafkaTemplate.send(topic, key, json).get();
    } catch (Exception ex) {
      log.error(
          "No se pudo publicar ARBOL_CREADO en Kafka (topic={}, arbolId={}, eventoId={})",
          topic,
          arbolId,
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
