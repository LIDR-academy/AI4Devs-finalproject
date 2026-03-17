package com.company.covoituraje.booking.api;

import com.company.covoituraje.auth.JwtValidator;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.UriInfo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthFilterBypassTest {

    @Test
    void optionsRequest_isBypassed() {
        JwtValidator validator = mock(JwtValidator.class);
        AuthFilter filter = new AuthFilter(validator);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        when(ctx.getMethod()).thenReturn("OPTIONS");

        assertDoesNotThrow(() -> filter.filter(ctx));
        verify(ctx, never()).abortWith(any());
        verifyNoInteractions(validator);
    }

    @Test
    void healthPath_isBypassed() {
        JwtValidator validator = mock(JwtValidator.class);
        AuthFilter filter = new AuthFilter(validator);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        UriInfo uriInfo = mock(UriInfo.class);
        when(ctx.getMethod()).thenReturn("GET");
        when(ctx.getUriInfo()).thenReturn(uriInfo);
        when(uriInfo.getPath()).thenReturn("health");

        assertDoesNotThrow(() -> filter.filter(ctx));
        verify(ctx, never()).abortWith(any());
        verifyNoInteractions(validator);
    }

    @Test
    void employeeRole_allows_whenRequired() {
        JwtValidator validator = mock(JwtValidator.class);
        AuthFilter filter = new AuthFilter(validator, true);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        // Token with EMPLOYEE role
        String header = base64Url("{\"alg\":\"RS256\"}");
        String payload = base64Url("{\"iss\":\"i\",\"sub\":\"U\",\"aud\":[\"backend-api\"],\"exp\":9999999999,\"realm_access\":{\"roles\":[\"EMPLOYEE\"]}}");
        String tok = header + "." + payload + ".sig";
        when(ctx.getHeaderString("Authorization")).thenReturn("Bearer " + tok);

        assertDoesNotThrow(() -> filter.filter(ctx));
        verify(ctx, never()).abortWith(any());
        verify(validator).validate(tok);
    }

    private static String base64Url(String json) {
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}


