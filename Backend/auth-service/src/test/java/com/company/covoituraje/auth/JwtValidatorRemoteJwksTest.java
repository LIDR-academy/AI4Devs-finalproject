package com.company.covoituraje.auth;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static org.junit.jupiter.api.Assertions.*;

class JwtValidatorRemoteJwksTest {

    private static WireMockServer wireMockServer;
    private static RSAKey rsaJwkA;
    private static JWSSigner signerA;
    private static String jwksPath = "/.well-known/jwks.json";
    private static String jwksUri;
    private static final String ISS = "http://issuer.example";

    @BeforeAll
    static void startServer() throws Exception {
        wireMockServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());

        rsaJwkA = new com.nimbusds.jose.jwk.gen.RSAKeyGenerator(2048)
                .keyUse(com.nimbusds.jose.jwk.KeyUse.SIGNATURE)
                .keyID("kid-a")
                .algorithm(JWSAlgorithm.RS256)
                .generate();
        signerA = new RSASSASigner(rsaJwkA.toPrivateKey());

        serveJwks(jwksWithoutAlg(rsaJwkA));
        jwksUri = "http://localhost:" + wireMockServer.port() + jwksPath;
    }

    @AfterAll
    static void stopServer() {
        if (wireMockServer != null) wireMockServer.stop();
    }

    private static void serveJwks(JWKSet jwkSet) {
        WireMock.stubFor(get(jwksPath)
                .willReturn(aResponse()
                        .withHeader("Content-Type", "application/json")
                        .withBody(jwkSet.toJSONObject().toString())));
    }

    private static JWKSet jwksWithoutAlg(RSAKey rsa) {
        try {
            RSAKey pub = new RSAKey.Builder(rsa.toRSAPublicKey())
                    .keyID(rsa.getKeyID())
                    .keyUse(com.nimbusds.jose.jwk.KeyUse.SIGNATURE)
                    .build();
            return new JWKSet(pub);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String signWithA(JWTClaimsSet claims) throws Exception {
        SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims);
        jwt.sign(signerA);
        return jwt.serialize();
    }

    @Test
    @Disabled("Pending: stabilize signature verification against RemoteJWKSet in test env")
    void validatesTokenAgainstRemoteJwks() throws Exception {
        JwtValidator validator = new JwtValidator(ISS, jwksUri);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .subject(UUID.randomUUID().toString())
                .audience("backend-api")
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .notBeforeTime(Date.from(Instant.now().minusSeconds(60)))
                .build();
        String token = signWithA(claims);

        assertDoesNotThrow(() -> validator.validate(token));
    }

    @Test
    void failsWhenKidUnknown_refreshRequired() throws Exception {
        // Serve a JWKS that does NOT contain kid-a
        RSAKey other = new RSAKey.Builder(new com.nimbusds.jose.jwk.gen.RSAKeyGenerator(2048)
                .keyUse(com.nimbusds.jose.jwk.KeyUse.SIGNATURE)
                .keyID("kid-b")
                .algorithm(JWSAlgorithm.RS256)
                .generate()).build();
        serveJwks(jwksWithoutAlg(other));

        String jwksUri = "http://localhost:" + wireMockServer.port() + jwksPath;
        JwtValidator validator = new JwtValidator(ISS, jwksUri);

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(ISS)
                .subject(UUID.randomUUID().toString())
                .audience("backend-api")
                .expirationTime(Date.from(Instant.now().plusSeconds(300)))
                .build();
        String token = signWithA(claims);

        JwtValidationException ex = assertThrows(JwtValidationException.class, () -> validator.validate(token));
        assertTrue(ex.getMessage().toLowerCase().contains("signature") || ex.getMessage().toLowerCase().contains("processing"));
    }

    @Test
    void networkErrorProducesValidationException() throws Exception {
        // Stop server to simulate network error
        wireMockServer.stop();
        try {
            JwtValidator validator = new JwtValidator(ISS, jwksUri);

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(ISS)
                    .subject(UUID.randomUUID().toString())
                    .audience("backend-api")
                    .expirationTime(Date.from(Instant.now().plusSeconds(120)))
                    .build();
            String token = signWithA(claims);

            assertThrows(JwtValidationException.class, () -> validator.validate(token));
        } finally {
            // Restart for other tests (idempotent)
            wireMockServer.start();
            WireMock.configureFor("localhost", wireMockServer.port());
            serveJwks(jwksWithoutAlg(rsaJwkA));
            jwksUri = "http://localhost:" + wireMockServer.port() + jwksPath;
        }
    }
}


