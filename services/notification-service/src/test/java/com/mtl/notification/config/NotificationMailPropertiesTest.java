package com.mtl.notification.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@EnableConfigurationProperties(NotificationMailProperties.class)
@TestPropertySource(
    properties = {
      "mtl.notification.mail.enabled=true",
      "mtl.notification.mail.from=Pruebas <avisos@example.invalid>",
    })
class NotificationMailPropertiesTest {

  @Autowired private NotificationMailProperties notificationMailProperties;

  @Test
  void bindsMtlNotificationMailPrefix() {
    assertThat(notificationMailProperties.isEnabled()).isTrue();
    assertThat(notificationMailProperties.getFrom()).isEqualTo("Pruebas <avisos@example.invalid>");
  }
}
