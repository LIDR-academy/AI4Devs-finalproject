package com.mtl.notification.infrastructure.mail;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SmtpEjemplarCreadoCorreoAvisoSenderTest {

  @Test
  void resumenErrorSeguro_enmascaraCorreosYAcota() {
    String largo = "x".repeat(600);
    Throwable e = new IllegalStateException("fallo para user@dominio.example " + largo);
    String resumen = SmtpEjemplarCreadoCorreoAvisoSender.resumenErrorSeguro(e);
    assertThat(resumen).doesNotContain("user@");
    assertThat(resumen).contains("[correo]");
    assertThat(resumen).hasSize(500);
  }

  @Test
  void cuerpo_incluyeIdsSinPiiExtra() {
    String cuerpo = SmtpEjemplarCreadoCorreoAvisoSender.cuerpo(7L, 99L);
    assertThat(cuerpo).contains("7").contains("99").contains("MyTreeLibrary");
  }
}
