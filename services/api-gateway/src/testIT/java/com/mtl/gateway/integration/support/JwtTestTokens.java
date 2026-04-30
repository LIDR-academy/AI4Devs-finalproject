package com.mtl.gateway.integration.support;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

/** Par RSA efímero (solo tests de integración) y JWT de acceso firmados (claims cercanos a Keycloak). */
public final class JwtTestTokens {

  private static final ReentrantLock LOCK = new ReentrantLock();
  private static volatile KeyPair keyPair;

  private JwtTestTokens() {}

  public static KeyPair rsaKeyPair() {
    if (keyPair == null) {
      LOCK.lock();
      try {
        if (keyPair == null) {
          try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            keyPair = gen.generateKeyPair();
          } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
          }
        }
      } finally {
        LOCK.unlock();
      }
    }
    return keyPair;
  }

  /** Access token RS256 con {@code realm_access.roles}. */
  public static String accessTokenWithRealmRoles(String subject, List<String> realmRoles) {
    Date now = new Date();
    JWTClaimsSet claims =
        new JWTClaimsSet.Builder()
            .subject(subject)
            .issuer("http://127.0.0.1:9/realms/mtl")
            .issueTime(now)
            .expirationTime(new Date(now.getTime() + 120_000))
            .claim("realm_access", Map.of("roles", realmRoles))
            .build();

    SignedJWT jwt =
        new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).type(JOSEObjectType.JWT).build(), claims);
    try {
      jwt.sign(new RSASSASigner(rsaKeyPair().getPrivate()));
    } catch (JOSEException e) {
      throw new IllegalStateException(e);
    }
    return jwt.serialize();
  }
}
