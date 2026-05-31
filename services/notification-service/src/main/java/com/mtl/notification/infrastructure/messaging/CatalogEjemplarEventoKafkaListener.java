package com.mtl.notification.infrastructure.messaging;

import com.mtl.notification.application.CatalogEjemplarEventoIngestionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "mtl.notification.kafka.enabled", havingValue = "true")
public class CatalogEjemplarEventoKafkaListener {

  private final CatalogEjemplarEventoIngestionService ingestionService;

  public CatalogEjemplarEventoKafkaListener(CatalogEjemplarEventoIngestionService ingestionService) {
    this.ingestionService = ingestionService;
  }

  @KafkaListener(
      id = "catalogEjemplarEventoNotification",
      topics = "${mtl.notification.kafka.ejemplar-evento-topic}",
      groupId = "${mtl.notification.kafka.consumer-group-id}")
  public void consume(String value) {
    ingestionService.onKafkaValue(value);
  }
}
