package com.company.covoituraje.auth;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtValidatorTest {

    private static final String ISS = "http://localhost:8080/realms/covoituraje-dev";
    private RSAKey rsaJwk;
    private JWSSigner signer;
    private ImmutableJWKSet<SecurityContext> jwkSource;
    private JwtValidator jwtValidator;

    @BeforeEach
    void setUp() throws Exception {
        rsaJwk = new RSAKey.Builder(new com.nimbusds.jose.jwk.gen.RSAKeyGenerator(2048).keyUse(com.nimbusds.jose.jwk.KeyUse.SIGNATURE).algorithm(JWSAlgorithm.RS256).generate()).build();
        signer = new RSASSASigner(rsaJwk.toPrivateKey());
        jwkSource = new ImmutableJWKSet<>(new JWKSet(rsaJwk.toPublicJWK()));
        jwtValidator = new JwtValidator(ISS, jwkSource);
    }

    private String sign(JWTClaimsSet claims) throws Exception {
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(rsaJwk.getKeyID()).build(), claims);
        jwt.sign(signer);
        return jwt.serialize();
    }

    @Test
    void acceptsValidJwt() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .subject(UUID.randomUUID().toString())
                .audience("backend-api")
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .notBeforeTime(Date.from(Instant.now().minusSeconds(60)))
                .build();
        String token = sign(claims);
        assertDoesNotThrow(() -> jwtValidator.validate(token));
    }

    @Test
    void rejectsWrongIssuer() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("http://wrong-issuer")
                .subject(UUID.randomUUID().toString())
                .audience("backend-api")
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .build();
        String token = sign(claims);
        JwtValidationException ex = assertThrows(JwtValidationException.class, () -> jwtValidator.validate(token));
        assertTrue(ex.getMessage().toLowerCase().contains("issuer"));
    }

    @Test
    void rejectsExpiredToken() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .subject(UUID.randomUUID().toString())
                .audience("backend-api")
                .expirationTime(Date.from(Instant.now().minusSeconds(1)))
                .build();
        String token = sign(claims);
        JwtValidationException ex = assertThrows(JwtValidationException.class, () -> jwtValidator.validate(token));
        assertTrue(ex.getMessage().toLowerCase().contains("expired"));
    }

    @Test
    void rejectsNotBeforeInFuture() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .subject(UUID.randomUUID().toString())
                .audience("backend-api")
                .notBeforeTime(Date.from(Instant.now().plusSeconds(120)))
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .build();
        String token = sign(claims);
        JwtValidationException ex = assertThrows(JwtValidationException.class, () -> jwtValidator.validate(token));
        assertTrue(ex.getMessage().toLowerCase().contains("not before"));
    }

    @Test
    void rejectsMissingSubject() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .audience("backend-api")
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .build();
        String token = sign(claims);
        JwtValidationException ex = assertThrows(JwtValidationException.class, () -> jwtValidator.validate(token));
        assertTrue(ex.getMessage().toLowerCase().contains("sub"));
    }

    @Test
    void audienceMustContainBackendApi() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .subject(UUID.randomUUID().toString())
                .audience(List.of("some-other-aud"))
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .build();
        String token = sign(claims);
        JwtValidationException ex = assertThrows(JwtValidationException.class, () -> jwtValidator.validate(token));
        assertTrue(ex.getMessage().toLowerCase().contains("aud"));
    }
}
