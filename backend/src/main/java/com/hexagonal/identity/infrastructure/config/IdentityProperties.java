package com.hexagonal.identity.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for the Identity bounded context.
 *
 * <pre>
 * identity:
 *   jwt:
 *     secret: ${IDENTITY_JWT_SECRET:change-me-in-production-min-32chars}
 *   google:
 *     jwks-uri: https://www.googleapis.com/oauth2/v3/certs
 * </pre>
 */
@ConfigurationProperties(prefix = "identity")
public class IdentityProperties {

    private final Jwt jwt = new Jwt();
    private final Google google = new Google();

    public Jwt getJwt()     { return jwt; }
    public Google getGoogle() { return google; }

    public static class Jwt {
        /** HS256 signing secret — minimum 32 characters (256 bits). */
        private String secret = "change-me-in-production-minimum-32-chars!!";

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
    }

    public static class Google {
        /** Google public JWKS endpoint used to verify the id_token signature. */
        private String jwksUri = "https://www.googleapis.com/oauth2/v3/certs";

        public String getJwksUri() { return jwksUri; }
        public void setJwksUri(String jwksUri) { this.jwksUri = jwksUri; }
    }
}
