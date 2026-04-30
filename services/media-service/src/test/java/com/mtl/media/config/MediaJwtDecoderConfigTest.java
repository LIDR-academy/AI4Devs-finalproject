package com.mtl.media.config;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Sustituye el {@link JwtDecoder} por issuer en tests de integración: no requiere Keycloak ni red.
 */
@TestConfiguration
public class MediaJwtDecoderConfigTest {

  @Bean
  @Primary
  JwtDecoder jwtDecoder() {
    return token ->
        Jwt.withTokenValue(token)
            .header("alg", "none")
            .issuer("http://localhost:8180/realms/mtl")
            .subject("it-media-subject")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("realm_access", Map.of("roles", List.of("COLABORADOR")))
            .build();
  }
}
