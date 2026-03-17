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
import java.util.logging.Logger;
import java.util.logging.Level;

public class JwtValidator {
    private static final Logger LOGGER = Logger.getLogger(JwtValidator.class.getName());
    private final String expectedIssuer;
    private final JWKSource<SecurityContext> jwkSource;

    public JwtValidator(String issuer, String jwksUri) {
        this.expectedIssuer = Objects.requireNonNull(issuer, "issuer");
        LOGGER.log(Level.INFO, "Initializing JWT validator with issuer: {0}", issuer);
        try {
            URL url = new URL(jwksUri);
            // Increase timeout to 10 seconds for Docker networking
            DefaultResourceRetriever retriever = new DefaultResourceRetriever(10000, 10000);
            this.jwkSource = new RemoteJWKSet<>(url, retriever);
            LOGGER.log(Level.INFO, "Successfully initialized RemoteJWKSet");
        } catch (MalformedURLException e) {
            LOGGER.log(Level.SEVERE, "Invalid JWKS URI: {0}", jwksUri);
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
        LOGGER.log(Level.FINE, "Validating token issuer: {0}, Expected: {1}", new Object[]{iss, expectedIssuer});
        if (!expectedIssuer.equals(iss)) {
            LOGGER.log(Level.WARNING, "Token issuer mismatch");
            throw new JwtValidationException("Invalid issuer");
        }
        Instant now = Instant.now();
        if (claims.getExpirationTime() == null || claims.getExpirationTime().toInstant().isBefore(now)) {
            LOGGER.log(Level.WARNING, "Token expired");
            throw new JwtValidationException("Token expired");
        }
        if (claims.getNotBeforeTime() != null && claims.getNotBeforeTime().toInstant().isAfter(now)) {
            LOGGER.log(Level.WARNING, "Token not before in future");
            throw new JwtValidationException("Token not before in future");
        }
        if (claims.getSubject() == null || claims.getSubject().isBlank()) {
            LOGGER.log(Level.WARNING, "Missing sub claim");
            throw new JwtValidationException("Missing sub claim");
        }
        List<String> aud = claims.getAudience();
        LOGGER.log(Level.FINE, "Token audience: {0}", aud);
        if (aud == null || aud.stream().noneMatch("backend-api"::equals)) {
            LOGGER.log(Level.WARNING, "Invalid audience - backend-api not found");
            throw new JwtValidationException("Invalid audience");
        }
        LOGGER.log(Level.FINE, "Token validation successful");
    }
}


