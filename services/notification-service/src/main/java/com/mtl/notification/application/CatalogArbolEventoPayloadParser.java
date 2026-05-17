package com.mtl.notification.application;

import com.mtl.notification.dto.CatalogArbolEventoPayload;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
@SuppressWarnings("deprecation") // JsonNode#isTextual / isIntegralNumber deprecados en Jackson 3; API estable aún.
public class CatalogArbolEventoPayloadParser {

  private final JsonMapper jsonMapper;

  public CatalogArbolEventoPayloadParser(JsonMapper jsonMapper) {
    this.jsonMapper = jsonMapper;
  }

  /**
   * Interpreta el valor del topic. Devuelve vacío si el JSON no es objeto, faltan campos
   * obligatorios del contrato MVP o los tipos no son válidos.
   */
  public Optional<CatalogArbolEventoPayload> parse(String json) {
    if (json == null || json.isBlank()) {
      return Optional.empty();
    }
    final JsonNode root;
    try {
      root = jsonMapper.readTree(json);
    } catch (Exception ex) {
      return Optional.empty();
    }
    if (!root.isObject()) {
      return Optional.empty();
    }
    JsonNode eventoIdNode = root.path("evento_id");
    JsonNode arbolIdNode = root.path("arbol_id");
    JsonNode tipoNode = root.path("tipo_evento");
    JsonNode ocurridoNode = root.path("ocurrido_en");
    if (!eventoIdNode.isIntegralNumber()
        || !arbolIdNode.isIntegralNumber()
        || !tipoNode.isTextual()
        || !ocurridoNode.isTextual()) {
      return Optional.empty();
    }
    long eventoId = eventoIdNode.longValue();
    long arbolId = arbolIdNode.longValue();
    String tipo = tipoNode.stringValue();
    Instant ocurridoEn;
    try {
      ocurridoEn = Instant.parse(ocurridoNode.stringValue());
    } catch (Exception ex) {
      return Optional.empty();
    }
    JsonNode schemaNode = root.path("schemaVersion");
    String schema = schemaNode.isTextual() ? schemaNode.stringValue() : null;
    JsonNode resumenNode = root.path("resumen_cambio");
    String resumen = resumenNode.isTextual() ? resumenNode.stringValue() : null;
    return Optional.of(
        new CatalogArbolEventoPayload(eventoId, tipo, arbolId, ocurridoEn, schema, resumen));
  }
}
