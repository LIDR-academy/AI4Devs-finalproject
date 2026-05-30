package com.mtl.gateway.integration.support;

import java.security.interfaces.RSAPublicKey;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;

@TestConfiguration
public class LocalRsaReactiveJwtDecoderConfig {

  @Bean
  @Primary
  ReactiveJwtDecoder testReactiveJwtDecoder() {
    RSAPublicKey publicKey = (RSAPublicKey) JwtTestTokens.rsaKeyPair().getPublic();
    return NimbusReactiveJwtDecoder.withPublicKey(publicKey).build();
  }
}
