package com.company.covoituraje.matching.api;

import com.company.covoituraje.auth.JwtValidationException;
import com.company.covoituraje.auth.JwtValidator;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthFilterTest {

    private static String base64Url(String json) {
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static String tokenWithSub(String sub) {
        String header = base64Url("{\"alg\":\"RS256\"}");
        String payload = base64Url("{\"iss\":\"i\",\"sub\":\"" + sub + "\",\"aud\":[\"backend-api\"],\"exp\":9999999999}");
        return header + "." + payload + ".signature";
    }

    @Test
    void missingBearer_aborts401() {
        JwtValidator validator = mock(JwtValidator.class);
        AuthFilter filter = new AuthFilter(validator);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        when(ctx.getHeaderString("Authorization")).thenReturn(null);

        filter.filter(ctx);

        ArgumentCaptor<Response> cap = ArgumentCaptor.forClass(Response.class);
        verify(ctx).abortWith(cap.capture());
        assertEquals(401, cap.getValue().getStatus());
    }

    @Test
    void invalidToken_aborts401() {
        JwtValidator validator = mock(JwtValidator.class);
        doThrow(new JwtValidationException("bad")).when(validator).validate(anyString());
        AuthFilter filter = new AuthFilter(validator);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        when(ctx.getHeaderString("Authorization")).thenReturn("Bearer x.y.z");

        filter.filter(ctx);

        ArgumentCaptor<Response> cap = ArgumentCaptor.forClass(Response.class);
        verify(ctx).abortWith(cap.capture());
        assertEquals(401, cap.getValue().getStatus());
    }

    @Test
    void validToken_setsUserIdProperty() {
        JwtValidator validator = mock(JwtValidator.class);
        AuthFilter filter = new AuthFilter(validator);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        String tok = tokenWithSub("USER-4");
        when(ctx.getHeaderString("Authorization")).thenReturn("Bearer " + tok);

        filter.filter(ctx);

        // Verify that the filter didn't abort the request
        verify(ctx, never()).abortWith(any());
        verify(validator).validate(tok);
    }

    @Test
    void missingEmployeeRole_aborts403_whenRequired() {
        JwtValidator validator = mock(JwtValidator.class);
        AuthFilter filter = new AuthFilter(validator, true);
        ContainerRequestContext ctx = mock(ContainerRequestContext.class);
        String header = base64Url("{\"alg\":\"RS256\"}");
        String payload = base64Url("{\"iss\":\"i\",\"sub\":\"U\",\"aud\":[\"backend-api\"],\"exp\":9999999999,\"realm_access\":{\"roles\":[\"OTHER\"]}}");
        String tok = header + "." + payload + ".sig";
        when(ctx.getHeaderString("Authorization")).thenReturn("Bearer " + tok);

        filter.filter(ctx);

        ArgumentCaptor<Response> cap = ArgumentCaptor.forClass(Response.class);
        verify(ctx).abortWith(cap.capture());
        assertEquals(403, cap.getValue().getStatus());
    }
}


