package com.mtl.notification.application;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.mtl.notification.dto.CatalogEjemplarEventoPayload;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
class CatalogEjemplarEventoIngestionServiceTest {

  private static final String JSON_EJEMPLAR_CREADO =
      "{\"schemaVersion\":\"1.0\",\"evento_id\":99,\"tipo_evento\":\"EJEMPLAR_CREADO\","
          + "\"ejemplar_id\":42,\"ocurrido_en\":\"2026-05-10T10:15:30Z\",\"resumen_cambio\":\"Alta de ficha\"}";

  @Mock private CatalogEjemplarEventoConsumoService consumoService;

  private CatalogEjemplarEventoIngestionService ingestionService;

  @BeforeEach
  void setUp() {
    JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();
    ingestionService =
        new CatalogEjemplarEventoIngestionService(
            new CatalogEjemplarEventoPayloadParser(jsonMapper), consumoService);
  }

  @Test
  void onKafkaValue_ejemplarCreadoValido_delegaEnConsumo() {
    ingestionService.onKafkaValue(JSON_EJEMPLAR_CREADO);
    verify(consumoService)
        .registrarYProcesarSiPrimero(
            new CatalogEjemplarEventoPayload(
                99L,
                "EJEMPLAR_CREADO",
                42L,
                OffsetDateTime.parse("2026-05-10T10:15:30Z"),
                "1.0",
                "Alta de ficha"));
  }

  @Test
  void onKafkaValue_otroTipoEvento_noDelega() {
    String json =
        "{\"evento_id\":1,\"tipo_evento\":\"EJEMPLAR_ACTUALIZADO\",\"ejemplar_id\":2,"
            + "\"ocurrido_en\":\"2026-05-10T10:15:30Z\"}";
    ingestionService.onKafkaValue(json);
    verify(consumoService, never()).registrarYProcesarSiPrimero(any());
  }

  @Test
  void onKafkaValue_jsonInvalido_noDelega() {
    ingestionService.onKafkaValue("{");
    verify(consumoService, never()).registrarYProcesarSiPrimero(any());
  }

  @Test
  void onKafkaValue_faltaCampoObligatorio_noDelega() {
    ingestionService.onKafkaValue("{\"tipo_evento\":\"EJEMPLAR_CREADO\"}");
    verify(consumoService, never()).registrarYProcesarSiPrimero(any());
  }

  /** Misma forma que {@code KafkaEjemplarCreadoEventPublisher} (LinkedHashMap + JsonMapper). */
  @Test
  void onKafkaValue_serializadoComoCatalogoProductor_delegaEnConsumo() throws Exception {
    JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();
    CatalogEjemplarEventoIngestionService svc =
        new CatalogEjemplarEventoIngestionService(
            new CatalogEjemplarEventoPayloadParser(jsonMapper), consumoService);
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("schemaVersion", "1.0");
    body.put("evento_id", 77L);
    body.put("tipo_evento", "EJEMPLAR_CREADO");
    body.put("ejemplar_id", 55L);
    body.put("ocurrido_en", OffsetDateTime.parse("2026-01-02T11:22:33Z"));
    body.put("resumen_cambio", "Alta de ficha");
    var out = new ByteArrayOutputStream();
    jsonMapper.writeValue(out, body);
    String json = out.toString(StandardCharsets.UTF_8);
    svc.onKafkaValue(json);
    verify(consumoService)
        .registrarYProcesarSiPrimero(
            new CatalogEjemplarEventoPayload(
                77L,
                "EJEMPLAR_CREADO",
                55L,
                OffsetDateTime.parse("2026-01-02T11:22:33Z"),
                "1.0",
                "Alta de ficha"));
  }
}
