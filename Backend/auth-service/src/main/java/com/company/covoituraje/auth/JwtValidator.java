package com.company.covoituraje.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.DefaultResourceRetriever;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;

import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

public class JwtValidator {
    private final String expectedIssuer;
    private final JWKSource<SecurityContext> jwkSource;

    public JwtValidator(String issuer, String jwksUri) {
        this.expectedIssuer = Objects.requireNonNull(issuer, "issuer");
        try {
            URL url = new URL(jwksUri);
            // Reasonable timeouts for JWKS fetch
            DefaultResourceRetriever retriever = new DefaultResourceRetriever(2000, 2000);
            this.jwkSource = new RemoteJWKSet<>(url, retriever);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid JWKS URI", e);
        }
    }

    // Overload for tests with in-memory JWKs
    public JwtValidator(String issuer, ImmutableJWKSet<SecurityContext> inMemoryJwkSet) {
        this.expectedIssuer = Objects.requireNonNull(issuer, "issuer");
        this.jwkSource = Objects.requireNonNull(inMemoryJwkSet, "jwkSource");
    }

    public void validate(String token) {
        if (token == null || token.isBlank()) {
            throw new JwtValidationException("Empty token");
        }
        SignedJWT signed;
        try {
            signed = SignedJWT.parse(token);
        } catch (ParseException e) {
            throw new JwtValidationException("Invalid JWT format", e);
        }

        ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
        processor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwkSource));
        // Disable Nimbus default time/claims verification to control error messages explicitly
        processor.setJWTClaimsSetVerifier((claims, ctx) -> {});

        JWTClaimsSet claims;
        try {
            claims = processor.process(signed, null);
        } catch (Exception e) {
            throw new JwtValidationException("JWT signature/processing failed", e);
        }

        // iss
        String iss = claims.getIssuer();
        if (!expectedIssuer.equals(iss)) {
            throw new JwtValidationException("Invalid issuer");
        }
        // exp
        Instant now = Instant.now();
        if (claims.getExpirationTime() == null || claims.getExpirationTime().toInstant().isBefore(now)) {
            throw new JwtValidationException("Token expired");
        }
        // nbf
        if (claims.getNotBeforeTime() != null && claims.getNotBeforeTime().toInstant().isAfter(now)) {
            throw new JwtValidationException("Token not before in future");
        }
        // sub
        if (claims.getSubject() == null || claims.getSubject().isBlank()) {
            throw new JwtValidationException("Missing sub claim");
        }
        // aud contains backend-api
        List<String> aud = claims.getAudience();
        if (aud == null || aud.stream().noneMatch("backend-api"::equals)) {
            throw new JwtValidationException("Invalid audience");
        }
    }
}
