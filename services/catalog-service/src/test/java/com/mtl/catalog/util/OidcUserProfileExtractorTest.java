package com.mtl.catalog.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class OidcUserProfileExtractorTest {

  @Test
  void extract_usaNameSiExiste() {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("sub-1")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("email", "a@b.co")
            .claim("name", "Nombre Completo")
            .build();

    OidcUserProfileExtractor.OidcUserProfile p = OidcUserProfileExtractor.extract(jwt);

    assertThat(p.subject()).isEqualTo("sub-1");
    assertThat(p.email()).isEqualTo("a@b.co");
    assertThat(p.displayName()).isEqualTo("Nombre Completo");
  }

  @Test
  void extract_componeGivenYFamily() {
    Jwt jwt =
        Jwt.withTokenValue("dummy.jwt.value")
            .headers(h -> h.put("alg", "none"))
            .issuer("http://localhost:8180/realms/mtl")
            .subject("sub-2")
            .audience(Collections.singletonList("account"))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .claim("email", "x@y.co")
            .claim("given_name", " Ana ")
            .claim("family_name", " López ")
            .build();

    OidcUserProfileExtractor.OidcUserProfile p = OidcUserProfileExtractor.extract(jwt);

    assertThat(p.displayName()).isEqualTo("Ana López");
  }
}
