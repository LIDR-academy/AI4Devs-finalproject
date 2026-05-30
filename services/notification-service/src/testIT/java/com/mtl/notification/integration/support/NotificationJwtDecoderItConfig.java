package com.mtl.notification.integration.support;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Sustituye el {@link JwtDecoder} por issuer en IT: no requiere Keycloak ni red (misma idea que
 * catalog-service).
 */
@TestConfiguration
public class NotificationJwtDecoderItConfig {

  private static final String ISSUER = "http://localhost:8180/realms/mtl";

  @Bean
  @Primary
  JwtDecoder jwtDecoder() {
    return token ->
        Jwt.withTokenValue(token)
            .header("alg", "none")
            .issuer(ISSUER)
            .subject("notification-it-subject")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
            .claim("email", "admin-it@example.invalid")
            .build();
  }
}
