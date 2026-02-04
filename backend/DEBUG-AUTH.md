# Debug: Error 401 al usar Token en Swagger

## Problema
Después de hacer login y obtener un token, al intentar usar endpoints protegidos se obtiene:
```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

## Posibles Causas

### 1. Token no se está enviando correctamente
- Verifica que hayas hecho clic en "Authorize" en Swagger
- Verifica que el token esté en el formato correcto: `Bearer {token}` o solo `{token}`

### 2. Secret JWT no coincide
- El secret usado para generar el token debe ser el mismo que se usa para validarlo
- Verifica que `JWT_SECRET` en `.env` sea el mismo en todo momento

### 3. Token expirado
- Los tokens tienen una expiración de 15 minutos por defecto
- Si pasó mucho tiempo, haz login de nuevo

## Solución Paso a Paso

### Paso 1: Verificar que el Token se Genere Correctamente

1. Haz login en Swagger: `POST /api/v1/auth/login`
2. Copia el `accessToken` completo
3. Decodifica el token en https://jwt.io para verificar su contenido

El token debería tener:
```json
{
  "sub": "dev-1234567890",
  "email": "test@example.com",
  "roles": ["cirujano", "administrador"],
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Paso 2: Verificar Autorización en Swagger

1. En Swagger, haz clic en el botón "Authorize" (🔒)
2. En el campo "Value", pega SOLO el token (sin "Bearer "):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Swagger automáticamente agregará "Bearer " al inicio
4. Haz clic en "Authorize"
5. Haz clic en "Close"

### Paso 3: Verificar Variables de Entorno

Verifica que tu archivo `.env` tenga:
```env
JWT_SECRET=change-this-secret-in-production-use-strong-secret-min-32-chars
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Paso 4: Verificar Logs del Backend

Cuando intentas usar un endpoint protegido, deberías ver en los logs:
```
[JwtStrategy] Validating token...
```

Si ves errores como:
```
JsonWebTokenError: invalid signature
```
Significa que el secret no coincide.

### Paso 5: Probar con curl

Prueba directamente con curl para verificar:

```bash
# 1. Obtener token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.data.accessToken')

# 2. Usar token
curl -X POST http://localhost:3000/api/v1/hce/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "dateOfBirth": "1985-05-15",
    "gender": "M",
    "ssn": "12345678A"
  }'
```

## Verificación del Secret

El código ahora busca el secret en este orden:
1. `auth.jwt.secret` (desde ConfigModule)
2. `JWT_SECRET` (variable de entorno directa)
3. Valor por defecto (solo para desarrollo)

Asegúrate de que el mismo secret se use en ambos lugares.

## Si Aún No Funciona

1. **Reinicia el backend** después de cambiar `.env`
2. **Verifica los logs** del backend para ver el error específico
3. **Prueba decodificar el token** en jwt.io para verificar su contenido
4. **Verifica que el token no haya expirado** (revisa el campo `exp`)

## Test Rápido

Ejecuta este script para probar todo el flujo:

```bash
# Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo "Token obtenido: ${TOKEN:0:50}..."

# Probar endpoint protegido
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

Si esto funciona, el problema está en cómo Swagger está enviando el token.
