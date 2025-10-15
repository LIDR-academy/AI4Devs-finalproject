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
        System.out.println("[JwtValidator] Initializing with issuer: " + issuer + ", JWKS URI: " + jwksUri);
        try {
            URL url = new URL(jwksUri);
            // Increase timeout to 10 seconds for Docker networking
            DefaultResourceRetriever retriever = new DefaultResourceRetriever(10000, 10000);
            this.jwkSource = new RemoteJWKSet<>(url, retriever);
            System.out.println("[JwtValidator] Successfully initialized RemoteJWKSet");
        } catch (MalformedURLException e) {
            System.err.println("[JwtValidator] Invalid JWKS URI: " + jwksUri);
            throw new IllegalArgumentException("Invalid JWKS URI", e);
        }
    }

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
        processor.setJWTClaimsSetVerifier((claims, ctx) -> {});

        JWTClaimsSet claims;
        try {
            claims = processor.process(signed, null);
        } catch (Exception e) {
            throw new JwtValidationException("JWT signature/processing failed", e);
        }

        String iss = claims.getIssuer();
        System.out.println("[JwtValidator] Token issuer: " + iss + ", Expected: " + expectedIssuer);
        if (!expectedIssuer.equals(iss)) {
            System.err.println("[JwtValidator] Issuer mismatch!");
            throw new JwtValidationException("Invalid issuer");
        }
        Instant now = Instant.now();
        if (claims.getExpirationTime() == null || claims.getExpirationTime().toInstant().isBefore(now)) {
            System.err.println("[JwtValidator] Token expired");
            throw new JwtValidationException("Token expired");
        }
        if (claims.getNotBeforeTime() != null && claims.getNotBeforeTime().toInstant().isAfter(now)) {
            System.err.println("[JwtValidator] Token not before in future");
            throw new JwtValidationException("Token not before in future");
        }
        if (claims.getSubject() == null || claims.getSubject().isBlank()) {
            System.err.println("[JwtValidator] Missing sub claim");
            throw new JwtValidationException("Missing sub claim");
        }
        List<String> aud = claims.getAudience();
        System.out.println("[JwtValidator] Token audience: " + aud);
        if (aud == null || aud.stream().noneMatch("backend-api"::equals)) {
            System.err.println("[JwtValidator] Invalid audience - backend-api not found in: " + aud);
            throw new JwtValidationException("Invalid audience");
        }
        System.out.println("[JwtValidator] Token validation successful");
    }
}


