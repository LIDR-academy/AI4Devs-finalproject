package com.mtl.catalog.util;

import java.util.Objects;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Extrae perfil mínimo desde un JWT validado (Keycloak / OIDC). Los roles de negocio no se persisten
 * en {@code usuario_app}; siguen en {@code realm_access.roles} del token.
 */
public final class OidcUserProfileExtractor {

  private OidcUserProfileExtractor() {}

  public static OidcUserProfile extract(Jwt jwt) {
    String subject = jwt.getSubject();
    String email = blankToNull(jwt.getClaimAsString("email"));
    String displayName = resolveDisplayName(jwt);
    return new OidcUserProfile(subject, email, displayName);
  }

  private static String resolveDisplayName(Jwt jwt) {
    String name = blankToNull(jwt.getClaimAsString("name"));
    if (name != null) {
      return name;
    }
    String given = blankToNull(jwt.getClaimAsString("given_name"));
    String family = blankToNull(jwt.getClaimAsString("family_name"));
    if (given == null && family == null) {
      return null;
    }
    if (given == null) {
      return family;
    }
    if (family == null) {
      return given;
    }
    return given + " " + family;
  }

  private static String blankToNull(String s) {
    if (s == null) {
      return null;
    }
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  public record OidcUserProfile(String subject, String email, String displayName) {

    public OidcUserProfile {
      Objects.requireNonNull(subject, "subject");
    }
  }
}
