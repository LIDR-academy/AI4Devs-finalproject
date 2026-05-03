package com.mtl.media.config;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Sustituye el {@link JwtDecoder} auto-configurado por issuer en tests de integración: no requiere
 * Keycloak ni red; los valores de token son convención solo para pruebas.
 */
@TestConfiguration
public class MediaJwtDecoderConfigTest {

  /** Token con rol COLABORADOR (acceso a endpoints de upload/foto privados). */
  public static final String TOKEN_COLABORADOR = "test-token-colaborador";

  /** Token con rol de realm que no autoriza los endpoints de media. */
  public static final String TOKEN_ROL_NO_AUTORIZADO = "test-token-rol-no-autorizado";

  private static final String ISSUER = "http://localhost:8180/realms/mtl";

  @Bean
  @Primary
  JwtDecoder jwtDecoder() {
    return token -> {
      if (TOKEN_COLABORADOR.equals(token)) {
        return jwtWithRole(token, "it-media-colaborador", "COLABORADOR");
      }
      if (TOKEN_ROL_NO_AUTORIZADO.equals(token)) {
        return jwtWithRole(token, "it-media-visitante", "VISITANTE");
      }
      throw new BadJwtException("Token de prueba no reconocido");
    };
  }

  private static Jwt jwtWithRole(String tokenValue, String subject, String role) {
    return Jwt.withTokenValue(tokenValue)
        .header("alg", "none")
        .issuer(ISSUER)
        .subject(subject)
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plusSeconds(3600))
        .claim("realm_access", Map.of("roles", List.of(role)))
        .claim("email", "it-" + role.toLowerCase() + "@test.invalid")
        .claim("name", "Usuario IT " + role)
        .build();
  }
}
