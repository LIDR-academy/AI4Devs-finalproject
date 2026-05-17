package com.mtl.notification.application;

/**
 * Envío del aviso de alta de ficha (HU-007). La implementación SMTP concreta vive en {@code
 * infrastructure.mail}; en tests se sustituye por mock.
 */
public interface ArbolCreadoCorreoAvisoSender {

  /**
   * Intenta enviar el correo de aviso.
   *
   * @return true si el mensaje se envió por SMTP o se omitió de forma controlada (mail
   *     desactivado / sin {@code JavaMailSender}); false si hubo fallo de transporte.
   */
  boolean intentarEnviar(String destinatarioEmail, long arbolId, long eventoId);
}
