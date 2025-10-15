package com.company.covoituraje.auth;

import com.nimbusds.jwt.SignedJWT;
import java.text.ParseException;
import java.util.Collections;
import java.util.List;

public final class AuthUtils {
    private AuthUtils() {}

    public static String extractUserIdFromToken(String jwt) {
        try {
            return SignedJWT.parse(jwt).getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public static List<String> extractRealmRoles(String jwt) {
        try {
            var claims = SignedJWT.parse(jwt).getJWTClaimsSet().getClaims();
            Object realmAccess = claims.get("realm_access");
            if (!(realmAccess instanceof java.util.Map)) return Collections.emptyList();
            Object roles = ((java.util.Map<?, ?>) realmAccess).get("roles");
            if (roles instanceof List) {
                return (List<String>) roles;
            }
            return Collections.emptyList();
        } catch (ParseException e) {
            return Collections.emptyList();
        }
    }
}


