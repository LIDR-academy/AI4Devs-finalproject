package com.mtl.notification.infrastructure.messaging;

import com.mtl.notification.application.CatalogArbolEventoIngestionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "mtl.notification.kafka.enabled", havingValue = "true")
public class CatalogArbolEventoKafkaListener {

  private final CatalogArbolEventoIngestionService ingestionService;

  public CatalogArbolEventoKafkaListener(CatalogArbolEventoIngestionService ingestionService) {
    this.ingestionService = ingestionService;
  }

  @KafkaListener(
      id = "catalogArbolEventoNotification",
      topics = "${mtl.notification.kafka.arbol-evento-topic}",
      groupId = "${mtl.notification.kafka.consumer-group-id}")
  public void consume(String value) {
    ingestionService.onKafkaValue(value);
  }
}
