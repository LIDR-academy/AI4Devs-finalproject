package com.mtl.gateway;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import reactor.test.StepVerifier;
import reactor.core.publisher.Mono;

/** Unitario: el decoder stub no resuelve tokens (evita red hacia el issuer). */
@ExtendWith(SpringExtension.class)
@Import(StubReactiveJwtDecoderConfigTest.StubReactiveJwtDecoderConfig.class)
class StubReactiveJwtDecoderConfigTest {

  @Autowired private ReactiveJwtDecoder reactiveJwtDecoder;

  @Test
  void decodeFailsWithoutCallingIssuer() {
    StepVerifier.create(reactiveJwtDecoder.decode("dummy"))
        .expectErrorSatisfies(
            ex -> {
              assertThat(ex).isInstanceOf(UnsupportedOperationException.class);
              assertThat(ex.getMessage()).contains("JWT no resuelto");
            })
        .verify();
  }

  @TestConfiguration
  static class StubReactiveJwtDecoderConfig {
    @Bean
    ReactiveJwtDecoder stubReactiveJwtDecoder() {
      return token ->
          Mono.error(new UnsupportedOperationException("JWT no resuelto en test unitario"));
    }
  }
}
