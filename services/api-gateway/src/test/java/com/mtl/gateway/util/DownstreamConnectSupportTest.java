package com.mtl.gateway.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.ConnectException;
import org.junit.jupiter.api.Test;

class DownstreamConnectSupportTest {

  @Test
  void detectaConnectException() {
    assertThat(DownstreamConnectSupport.isConnectionRefused(new ConnectException("Connection refused")))
        .isTrue();
  }

  @Test
  void detectaMensajeEnCadenaDeCausas() {
    Throwable inner =
        new RuntimeException(
            "failure",
            new Exception("io.netty.channel.AbstractChannel$AnnotatedConnectException: Connection refused: getsockopt: localhost/127.0.0.1:8081"));
    assertThat(DownstreamConnectSupport.isConnectionRefused(inner)).isTrue();
  }

  @Test
  void ignoraOtrosErrores() {
    assertThat(DownstreamConnectSupport.isConnectionRefused(new IllegalStateException("boom"))).isFalse();
  }
}
