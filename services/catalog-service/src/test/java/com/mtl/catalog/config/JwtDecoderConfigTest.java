package com.mtl.catalog.config;

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
public class JwtDecoderConfigTest {

  /** Token con rol de realm que no autoriza los endpoints de catálogo. */
  public static final String TOKEN_ROL_NO_AUTORIZADO = "test-token-rol-no-autorizado";

  /** Token con rol COLABORADOR (útil si se amplían pruebas de éxito). */
  public static final String TOKEN_COLABORADOR = "test-token-colaborador";

  private static final String ISSUER = "http://localhost:8180/realms/mtl";

  @Bean
  @Primary
  JwtDecoder jwtDecoder() {
    return token -> {
      if (TOKEN_COLABORADOR.equals(token)) {
        return colaboradorJwt(token);
      }
      if (TOKEN_ROL_NO_AUTORIZADO.equals(token)) {
        return Jwt.withTokenValue(token)
            .header("alg", "none")
            .issuer(ISSUER)
            .subject("it-subject-no-rol")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("realm_access", Map.of("roles", List.of("VISITANTE")))
            .build();
      }
      throw new BadJwtException("Token de prueba no reconocido");
    };
  }

  private static Jwt colaboradorJwt(String tokenValue) {
    return Jwt.withTokenValue(tokenValue)
        .header("alg", "none")
        .issuer(ISSUER)
        .subject("it-subject-colaborador")
        .issuedAt(Instant.now())
        .expiresAt(Instant.now().plusSeconds(3600))
        .claim("realm_access", Map.of("roles", List.of("COLABORADOR")))
        .claim("email", "colab-it@test.invalid")
        .claim("name", "Usuario IT Colaborador")
        .build();
  }
}
