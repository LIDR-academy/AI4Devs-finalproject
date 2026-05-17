package com.mtl.catalog.infrastructure.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.config.CatalogKafkaProperties;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.imp.CatalogArbolEventoIdSequence;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import tools.jackson.databind.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
class KafkaArbolCreadoEventPublisherTest {

  @Mock private CatalogArbolEventoIdSequence eventoIdSequence;
  @Mock private KafkaTemplate<String, String> kafkaTemplate;

  @Captor private ArgumentCaptor<String> jsonCaptor;

  private final JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();

  @Test
  void publishArbolCreado_enviaJsonConContratoYClaveArbolId() throws Exception {
    when(eventoIdSequence.next()).thenReturn(99L);
    @SuppressWarnings("unchecked")
    SendResult<String, String> sendResult = org.mockito.Mockito.mock(SendResult.class);
    when(kafkaTemplate.send(any(), any(), jsonCaptor.capture()))
        .thenReturn(CompletableFuture.completedFuture(sendResult));

    CatalogKafkaProperties props = new CatalogKafkaProperties();
    props.setArbolEventoTopic("catalog.arbol.evento");
    KafkaArbolCreadoEventPublisher publisher =
        new KafkaArbolCreadoEventPublisher(eventoIdSequence, kafkaTemplate, jsonMapper, props);

    Instant ocurrido = Instant.parse("2024-03-10T08:00:00Z");
    publisher.publishArbolCreado(42L, ocurrido);

    verify(kafkaTemplate).send(eq("catalog.arbol.evento"), eq("42"), any());
    String json = jsonCaptor.getValue();
    assertThat(json)
        .contains("\"tipo_evento\":\"ARBOL_CREADO\"")
        .contains("\"evento_id\":99")
        .contains("\"arbol_id\":42")
        .contains("\"schemaVersion\":\"1.0\"")
        .contains("\"resumen_cambio\":\"Alta de ficha\"")
        .contains("2024-03-10T08:00:00");
  }
}
