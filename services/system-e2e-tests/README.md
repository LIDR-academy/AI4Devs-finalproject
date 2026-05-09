# system-e2e-tests

Pruebas de sistema contra el **API Gateway** y microservicios reales (sin WireMock).

## Requisitos

1. Infra y servicios según [services/README.md](../README.md): al menos **Keycloak**, **PostgreSQL** con migraciones Flyway del catálogo aplicadas (**semilla de maestros**, p. ej. `V2__seed_maestros_inicial`), **catalog-service** (8081) y **api-gateway** (8080) con perfil `dev`.
2. Un **access token** JWT de Keycloak (realm `mtl`) con rol **COLABORADOR** o **ADMIN**, válido para el `issuer-uri` configurado en gateway y catálogo.

## Ejecución

Desde la carpeta `services/`:

```powershell
$env:MTL_E2E_ACCESS_TOKEN = "<access_token>"
$env:MTL_E2E_GATEWAY_BASE_URL = "http://127.0.0.1:8080"  # opcional; por defecto igual
mvn -pl system-e2e-tests verify
```

En bash:

```bash
export MTL_E2E_ACCESS_TOKEN="<access_token>"
export MTL_E2E_GATEWAY_BASE_URL="http://127.0.0.1:8080"  # opcional
mvn -pl system-e2e-tests verify
```

Si **no** defines `MTL_E2E_ACCESS_TOKEN`, la clase `CatalogMastersGatewayE2EIT` queda deshabilitada y Failsafe no ejecuta esos tests (el módulo sigue pasando `verify` gracias al smoke unitario).

## Qué comprueba

- `GET {gateway}/api/catalog/species?page=0&size=5` → 200, paginación coherente y **`content` con al menos un elemento** (asume semilla Flyway de maestros).
- `GET {gateway}/api/catalog/species?page=0&size=5&q=cina` → lo mismo y ejercita búsqueda con **`unaccent`** en PostgreSQL.
- `GET {gateway}/api/catalog/provinces?page=0&size=5` → igual que especies sin filtro.
- `GET {gateway}/api/catalog/provinces?page=0&size=5&q=01` → búsqueda por código de provincia en semilla (`01` / Álava) con `unaccent`.

Convención documentada: [docs/engineering/testing-java.md](../../docs/engineering/testing-java.md).

## Postman (gateway + maestros catálogo)

Objetivo: llamar al **API Gateway** (puerto **8080** por defecto) con un **access token** del realm **`mtl`**, igual que la SPA. Los endpoints `/api/catalog/species` y `/api/catalog/provinces` **no** son públicos: hace falta usuario con rol **COLABORADOR** o **ADMIN** (usuarios de prueba y SPA: [jwt-gateway-strategy.md](../../docs/security/jwt-gateway-strategy.md) §4 *Front (Vue)*).

### 1. Redirect de Postman y Keycloak

El error **`Invalid parameter: redirect_uri`** aparece cuando la URL de callback que envía Postman **no está** en la lista **Valid redirect URIs** del cliente **`mtl-spa`** en Keycloak (coincidencia estricta: sin barra final de más, `https` correcto).

Postman usa **una de estas dos** según cómo autentiques:

| Situación | Callback URL que debes poner en Postman **y** registrar en Keycloak |
|-----------|----------------------------------------------------------------------|
| Postman **escritorio**, “Authorize using browser” o flujo clásico | `https://oauth.pstmn.io/v1/callback` |
| Postman **web** o callback por defecto en configuración reciente | `https://oauth.pstmn.io/v1/browser-callback` |

En el **realm import** del repo (`infra/compose/init/keycloak/mtl-realm.json`) ya van ambas URIs en **`mtl-spa`**. Si tu Keycloak se creó **antes** de ese cambio, o usas un volumen con realm antiguo, añádelas a mano: **Clients → mtl-spa → Valid redirect URIs** (una línea por URI, exactas como arriba) y **Web origins** incluye `https://oauth.pstmn.io` para el login desde el navegador. Luego **Save**.

### 2. Obtener el token en Postman

1. Crea una petición cualquiera (p. ej. `GET {{gateway}}/api/catalog/species`).
2. Pestaña **Authorization** → Type **OAuth 2.0** → **Get New Access Token**.
3. Configuración típica (ajusta host/puerto si tu Keycloak no está en 8180):

| Campo | Valor |
|--------|--------|
| **Grant Type** | Authorization Code (with PKCE) |
| **Callback URL** | `https://oauth.pstmn.io/v1/callback` |
| **Auth URL** | `http://localhost:8180/realms/mtl/protocol/openid-connect/auth` |
| **Access Token URL** | `http://localhost:8180/realms/mtl/protocol/openid-connect/token` |
| **Client ID** | `mtl-spa` |
| **Client Secret** | (vacío: cliente público) |
| **Code Challenge Method** | SHA-256 |
| **Scope** | `openid profile email` (o el scope que tengáis acordado) |

4. **Get New Access Token** → inicia sesión (usuarios de dev: `colaborador` / `colaborador_dev` o `admin_mtl` / `admin_mtl_dev`, según [jwt-gateway-strategy.md](../../docs/security/jwt-gateway-strategy.md) §4 *Front (Vue)*).
5. **Use Token** y, si quieres reutilizarlo, **Sync** o copia el token a una variable de entorno de colección `{{access_token}}`.

### 3. Peticiones

Variables de colección sugeridas:

- `gateway` → `http://localhost:8080` (o la URL base de tu gateway).
- `access_token` → el token obtenido (o usa la pestaña Authorization OAuth 2.0 en cada request).

**Cabeceras**

- `Authorization`: `Bearer <access_token>` (Postman lo rellena si eliges OAuth 2.0 y el token vigente).
- Opcional: `X-Correlation-Id`: un UUID (trazabilidad alineada con el backend).

**Ejemplos**

| Método | URL |
|--------|-----|
| GET | `{{gateway}}/api/catalog/species?page=0&size=20` |
| GET | `{{gateway}}/api/catalog/species?page=0&size=5&q=cina` (búsqueda con `unaccent`, alineado con E2E) |
| GET | `{{gateway}}/api/catalog/provinces?page=0&size=20` |
| GET | `{{gateway}}/api/catalog/provinces?page=0&size=5&q=01` (código provincia en semilla, alineado con E2E) |

Query opcionales: `q` (búsqueda), `unpaged=true` (según el contrato del controlador).

### 4. Probar solo el catálogo (sin gateway)

Misma cabecera `Authorization: Bearer …` contra **`http://localhost:8081`** (catalog-service), mismas rutas:  
`http://localhost:8081/api/catalog/species`, etc. Útil para aislar si un fallo viene del gateway o del servicio.
