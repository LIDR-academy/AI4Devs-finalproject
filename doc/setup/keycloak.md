# Keycloak (dev) – Configuración OIDC

## Acceso
- URL: http://localhost:8080
- Admin: admin / admin

## Pasos
1) Crear Realm: `covoituraje-dev`
2) Crear Client OIDC (public SPA para Frontend)
   - Client ID: `frontend-spa`
   - Client Type: OpenID Connect
   - Access Type: Public
   - Root URL: `http://localhost:5173`
   - Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`
3) Crear Client OIDC (confidential para Backend/gateway si aplica)
   - Client ID: `backend-api`
   - Access Type: Confidential (habilitar client secret)
   - Valid Redirect URIs: `http://localhost:8080/*`
4) Roles
   - Realm roles: `EMPLOYEE`, `ADMIN`
5) Users
   - Crear usuario de prueba con correo corporativo; asignar rol `EMPLOYEE`.
6) Proveedor de claves (JWKS)
   - Endpoint JWKS: `http://localhost:8080/realms/covoituraje-dev/protocol/openid-connect/certs`
7) Endpoints OIDC útiles
   - Discovery: `http://localhost:8080/realms/covoituraje-dev/.well-known/openid-configuration`
   - Token: `.../protocol/openid-connect/token`
   - UserInfo: `.../protocol/openid-connect/userinfo`

## Notas
- En Frontend usar PKCE (Auth Code + PKCE).
- En Backend validar JWT (audience, issuer del realm) y roles.
