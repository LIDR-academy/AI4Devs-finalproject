# Diagram 3 — Authentication Flow (OIDC Authorization Code + PKCE)

**What it shows:** The OIDC authorization code + PKCE dance between a browser SPA, the identity container, and the api container. This is architecturally distinct from the other diagrams because it involves a multi-step protocol with redirect flows, HTTP-only cookies for refresh tokens, in-memory access token storage, and JWKS-based JWT validation — none of which are visible in the infrastructure or request-flow diagrams. Any developer implementing auth or debugging a 401 needs this diagram independently.

sequenceDiagram
    actor User
    participant SPA as Browser SPA<br/>(client-portal / backoffice)
    participant Identity as identity container<br/>:5001 (OpenIddict)
    participant API as api container<br/>:5000 (ASP.NET Core)

    Note over SPA: User clicks "Login"

    SPA->>SPA: Generate PKCE code_verifier + code_challenge (S256)
    SPA->>Identity: GET /connect/authorize<br/>?response_type=code<br/>&client_id=client-portal<br/>&code_challenge=...&code_challenge_method=S256<br/>&scope=openid profile email roles

    Identity->>SPA: 302 → Login page (or auth cookie present → code directly)
    Note over SPA: User enters credentials (if not already authenticated)

    SPA->>Identity: POST credentials to login endpoint
    Identity->>Identity: Validate credentials (ASP.NET Core Identity)<br/>Check lockout, increment failed attempts

    Identity->>SPA: 302 redirect_uri?code=AUTH_CODE

    SPA->>Identity: POST /connect/token<br/>grant_type=authorization_code<br/>&code=AUTH_CODE<br/>&code_verifier=...

    Identity->>SPA: { access_token (JWT 1h), expires_in }<br/>Set-Cookie: refresh_token (HttpOnly, Secure, 8h sliding)

    Note over SPA: Access token stored in memory (React context)<br/>Refresh token stored in HttpOnly cookie only

    SPA->>API: GET /api/tickets<br/>Authorization: Bearer {access_token}

    API->>Identity: GET /.well-known/openid-configuration (cached JWKS)
    Identity->>API: JWKS public keys
    API->>API: Validate JWT signature, audience, expiry<br/>Extract sub, role, locale claims

    API->>SPA: 200 OK { tickets }

    Note over SPA: Token expires after 1h — silent refresh
    SPA->>Identity: POST /connect/token<br/>grant_type=refresh_token<br/>(HttpOnly cookie sent automatically)
    Identity->>SPA: New access_token + rotated refresh cookie

    Note over SPA: After 8h inactivity — refresh token expired
    Identity->>SPA: 400 invalid_grant
    SPA->>SPA: Clear auth state<br/>Redirect to /login?reason=session_expired
