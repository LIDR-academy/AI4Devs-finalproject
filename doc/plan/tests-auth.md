# Tests – A1 Auth (OIDC/JWT)

## JwtValidator
- accepts valid JWT: issuer == OIDC_ISSUER_URI; signature verified via JWKS; not expired
- rejects wrong issuer
- rejects expired token (exp < now)
- rejects before time (nbf > now)
- rejects missing required claim `sub`
- optional: audience contains `backend-api`

## JWKS retrieval
- loads JWKS from OIDC_JWKS_URI; caches for TTL; refresh on key miss
- network error → fails validation with clear error

## Roles mapping
- maps realm roles from `realm_access.roles` into internal roles
- user without required role → 403 at resource filter layer

## Config
- reads env: OIDC_ISSUER_URI, OIDC_JWKS_URI
- missing config → startup/config error surfaced clearly
