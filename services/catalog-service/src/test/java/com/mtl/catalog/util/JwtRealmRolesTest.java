package com.mtl.catalog.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class JwtRealmRolesTest {

  @Test
  void hasRealmRole_returnsTrueWhenRolePresent() {
    Jwt jwt =
        Jwt.withTokenValue("t")
            .header("alg", "none")
            .claim("realm_access", Map.of("roles", List.of("COLABORADOR", "ADMIN")))
            .build();

    assertThat(JwtRealmRoles.hasRealmRole(jwt, "COLABORADOR")).isTrue();
    assertThat(JwtRealmRoles.hasRealmRole(jwt, "ADMIN")).isTrue();
    assertThat(JwtRealmRoles.hasRealmRole(jwt, "VISITOR")).isFalse();
  }

  @Test
  void hasRealmRole_returnsFalseWhenClaimMissing() {
    Jwt jwt = Jwt.withTokenValue("t").header("alg", "none").claim("sub", "user").build();

    assertThat(JwtRealmRoles.hasRealmRole(jwt, "ADMIN")).isFalse();
    assertThat(JwtRealmRoles.hasRealmRole(null, "ADMIN")).isFalse();
  }
}
