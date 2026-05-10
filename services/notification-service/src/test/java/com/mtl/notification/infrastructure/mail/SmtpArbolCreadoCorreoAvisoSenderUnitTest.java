package com.mtl.notification.infrastructure.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mtl.notification.config.NotificationMailProperties;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class SmtpArbolCreadoCorreoAvisoSenderUnitTest {

  @Mock private JavaMailSender javaMailSender;
  @Mock private MimeMessage mimeMessage;

  @Test
  void cuandoMailHabilitadoYSenderPresente_enviaMensaje() throws Exception {
    NotificationMailProperties props = new NotificationMailProperties();
    props.setEnabled(true);
    props.setFrom("MyTreeLibrary <noreply@localhost>");

    when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

    @SuppressWarnings("unchecked")
    ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
    when(provider.getIfAvailable()).thenReturn(javaMailSender);

    SmtpArbolCreadoCorreoAvisoSender sender = new SmtpArbolCreadoCorreoAvisoSender(props, provider);

    boolean ok = sender.intentarEnviar("dest@example.test", 3L, 9L);
    assertThat(ok).isTrue();

    ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
    verify(javaMailSender).send(captor.capture());
    assertThat(captor.getValue()).isSameAs(mimeMessage);
  }
}
