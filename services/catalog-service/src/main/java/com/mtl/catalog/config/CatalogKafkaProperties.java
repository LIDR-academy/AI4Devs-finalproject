package com.mtl.catalog.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mtl.catalog.kafka")
public class CatalogKafkaProperties {

  /** Si es falso, no se publica a Kafka (p. ej. perfil test sin broker). */
  private boolean enabled = false;

  private String arbolEventoTopic = "catalog.arbol.evento";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getArbolEventoTopic() {
    return arbolEventoTopic;
  }

  public void setArbolEventoTopic(String arbolEventoTopic) {
    this.arbolEventoTopic = arbolEventoTopic;
  }
}
