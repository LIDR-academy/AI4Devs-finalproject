package com.mtl.notification.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Parámetros de negocio del envío de correo (HU-007). {@code spring.mail.*} define el transporte
 * (host, puerto, SMTP); este bean el remitente y si el envío está permitido en el perfil actual.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mtl.notification.mail")
public class NotificationMailProperties {

  /** Si es false, no se debe intentar enviar correo (p. ej. tests o entornos sin relay). */
  private boolean enabled = false;

  /** Valor de la cabecera {@code From} (RFC 5322, p. ej. {@code Nombre <correo@dominio>}). */
  @NotBlank
  private String from = "MyTreeLibrary <noreply@localhost>";
}
