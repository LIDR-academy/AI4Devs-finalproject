package com.company.covoituraje.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthUtilsTest {

    private static String base64Url(String json) {
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static String token(String payloadJson) {
        String header = base64Url("{\"alg\":\"RS256\"}");
        String payload = base64Url(payloadJson);
        return header + "." + payload + ".sig";
    }

    @Test
    void extractUserId_ok() {
        String t = token("{\"sub\":\"user-1\"}");
        assertEquals("user-1", AuthUtils.extractUserIdFromToken(t));
    }

    @Test
    void extractUserId_badFormat_returnsNull() {
        assertNull(AuthUtils.extractUserIdFromToken("not-a-jwt"));
    }

    @Test
    void extractRealmRoles_ok() {
        String t = token("{\"realm_access\":{\"roles\":[\"EMPLOYEE\",\"ADMIN\"]}}");
        assertTrue(AuthUtils.extractRealmRoles(t).contains("EMPLOYEE"));
        assertTrue(AuthUtils.extractRealmRoles(t).contains("ADMIN"));
    }

    @Test
    void extractRealmRoles_missing_returnsEmpty() {
        String t = token("{}");
        assertTrue(AuthUtils.extractRealmRoles(t).isEmpty());
    }
}


