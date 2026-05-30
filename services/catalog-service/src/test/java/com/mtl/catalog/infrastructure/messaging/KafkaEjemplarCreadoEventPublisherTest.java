package com.mtl.catalog.infrastructure.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.catalog.config.CatalogKafkaProperties;
import com.mtl.catalog.infrastructure.persistence.jpa.repository.imp.CatalogEjemplarEventoIdSequence;
import java.time.OffsetDateTime;
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
class KafkaEjemplarCreadoEventPublisherTest {

  @Mock private CatalogEjemplarEventoIdSequence eventoIdSequence;
  @Mock private KafkaTemplate<String, String> kafkaTemplate;

  @Captor private ArgumentCaptor<String> jsonCaptor;

  private final JsonMapper jsonMapper = JsonMapper.builder().findAndAddModules().build();

  @Test
  void publishEjemplarCreado_enviaJsonConContratoYClaveEjemplarId() throws Exception {
    when(eventoIdSequence.next()).thenReturn(99L);
    @SuppressWarnings("unchecked")
    SendResult<String, String> sendResult = org.mockito.Mockito.mock(SendResult.class);
    when(kafkaTemplate.send(any(), any(), jsonCaptor.capture()))
        .thenReturn(CompletableFuture.completedFuture(sendResult));

    CatalogKafkaProperties props = new CatalogKafkaProperties();
    props.setEjemplarEventoTopic("catalog.ejemplar.evento");
    KafkaEjemplarCreadoEventPublisher publisher =
        new KafkaEjemplarCreadoEventPublisher(eventoIdSequence, kafkaTemplate, jsonMapper, props);

    OffsetDateTime ocurrido = OffsetDateTime.parse("2024-03-10T08:00:00Z");
    publisher.publishEjemplarCreado(42L, ocurrido);

    verify(kafkaTemplate).send(eq("catalog.ejemplar.evento"), eq("42"), any());
    String json = jsonCaptor.getValue();
    assertThat(json)
        .contains("\"tipo_evento\":\"EJEMPLAR_CREADO\"")
        .contains("\"evento_id\":99")
        .contains("\"ejemplar_id\":42")
        .contains("\"schemaVersion\":\"1.0\"")
        .contains("\"resumen_cambio\":\"Alta de ficha\"")
        .contains("2024-03-10T08:00:00");
  }
}
