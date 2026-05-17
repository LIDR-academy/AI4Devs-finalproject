package com.mtl.catalog.util;

import java.util.List;
import java.util.Map;
import org.springframework.security.oauth2.jwt.Jwt;

/** Lectura de roles de realm Keycloak desde el JWT (`realm_access.roles`). */
public final class JwtRealmRoles {

  private JwtRealmRoles() {}

  public static boolean hasRealmRole(Jwt jwt, String role) {
    if (jwt == null || role == null || role.isBlank()) {
      return false;
    }
    Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
    if (realmAccess == null) {
      return false;
    }
    Object rolesObj = realmAccess.get("roles");
    if (!(rolesObj instanceof List<?> roles)) {
      return false;
    }
    return roles.stream().filter(String.class::isInstance).map(String.class::cast).anyMatch(role::equals);
  }
}
