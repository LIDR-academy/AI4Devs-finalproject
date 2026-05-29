package com.mtl.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mtl.notification.kafka")
public class NotificationKafkaProperties {

  /** Si es falso, no se registra el listener (p. ej. tests sin broker). */
  private boolean enabled = false;

  private String ejemplarEventoTopic = "catalog.ejemplar.evento";

  /** Grupo de consumo para {@code catalog.ejemplar.evento}. */
  private String consumerGroupId = "notification-service";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getEjemplarEventoTopic() {
    return ejemplarEventoTopic;
  }

  public void setEjemplarEventoTopic(String ejemplarEventoTopic) {
    this.ejemplarEventoTopic = ejemplarEventoTopic;
  }

  public String getConsumerGroupId() {
    return consumerGroupId;
  }

  public void setConsumerGroupId(String consumerGroupId) {
    this.consumerGroupId = consumerGroupId;
  }
}
