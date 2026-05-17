package com.mtl.notification.infrastructure.mail;

import com.mtl.notification.application.ArbolCreadoCorreoAvisoSender;
import com.mtl.notification.config.NotificationMailProperties;
import jakarta.mail.internet.MimeMessage;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class SmtpArbolCreadoCorreoAvisoSender implements ArbolCreadoCorreoAvisoSender {

  private static final Logger log = LoggerFactory.getLogger(SmtpArbolCreadoCorreoAvisoSender.class);

  private static final Pattern EMAIL_LIKE =
      Pattern.compile("[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");

  private static final String ASUNTO = "MyTreeLibrary — nueva ficha de árbol";

  private final NotificationMailProperties mailProperties;
  private final ObjectProvider<JavaMailSender> javaMailSender;

  public SmtpArbolCreadoCorreoAvisoSender(
      NotificationMailProperties mailProperties,
      ObjectProvider<JavaMailSender> javaMailSender) {
    this.mailProperties = mailProperties;
    this.javaMailSender = javaMailSender;
  }

  @Override
  public boolean intentarEnviar(String destinatarioEmail, long arbolId, long eventoId) {
    if (!mailProperties.isEnabled()) {
      log.debug(
          "Correo de aviso omitido: mtl.notification.mail.enabled=false (arbol_id={}, evento_id={})",
          arbolId,
          eventoId);
      return true;
    }
    JavaMailSender sender = javaMailSender.getIfAvailable();
    if (sender == null) {
      log.debug(
          "Correo de aviso omitido: JavaMailSender no configurado (spring.mail.host; arbol_id={}, evento_id={})",
          arbolId,
          eventoId);
      return true;
    }
    try {
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(mailProperties.getFrom());
      helper.setTo(destinatarioEmail);
      helper.setSubject(ASUNTO);
      helper.setText(cuerpo(arbolId, eventoId), false);
      sender.send(message);
      return true;
    } catch (Exception e) {
      log.warn(
          "Fallo SMTP al enviar aviso de alta (arbol_id={}, evento_id={}): {}",
          arbolId,
          eventoId,
          resumenErrorSeguro(e));
      return false;
    }
  }

  static String cuerpo(long arbolId, long eventoId) {
    return """
        Alta de una nueva ficha de árbol en MyTreeLibrary.

        Identificador del ejemplar (referencia interna): %d
        Referencia del evento (trazabilidad): %d

        Este mensaje es informativo. Para darse de baja de estos avisos, use el enlace o contacto indicados en la plataforma cuando estén disponibles.
        """
        .formatted(arbolId, eventoId);
  }

  static String resumenErrorSeguro(Throwable e) {
    String raw = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
    String sinCorreos = EMAIL_LIKE.matcher(raw).replaceAll("[correo]");
    return sinCorreos.length() > 500 ? sinCorreos.substring(0, 500) : sinCorreos;
  }
}
