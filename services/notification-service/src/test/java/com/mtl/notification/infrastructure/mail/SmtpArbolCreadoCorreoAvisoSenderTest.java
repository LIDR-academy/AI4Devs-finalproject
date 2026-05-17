package com.mtl.notification.infrastructure.mail;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SmtpArbolCreadoCorreoAvisoSenderTest {

  @Test
  void resumenErrorSeguro_enmascaraCorreosYAcota() {
    String largo = "x".repeat(600);
    Throwable e = new IllegalStateException("fallo para user@dominio.example " + largo);
    String resumen = SmtpArbolCreadoCorreoAvisoSender.resumenErrorSeguro(e);
    assertThat(resumen).doesNotContain("user@");
    assertThat(resumen).contains("[correo]");
    assertThat(resumen).hasSize(500);
  }

  @Test
  void cuerpo_incluyeIdsSinPiiExtra() {
    String cuerpo = SmtpArbolCreadoCorreoAvisoSender.cuerpo(7L, 99L);
    assertThat(cuerpo).contains("7").contains("99").contains("MyTreeLibrary");
  }
}
