# Solución: Error 401 en Swagger

## Problema
Después de hacer login y autorizar en Swagger, los endpoints protegidos devuelven:
```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

## Pasos para Solucionar

### 1. Verificar que el Token se Obtuvo Correctamente

1. En Swagger, ve a `POST /api/v1/auth/login`
2. Haz clic en "Try it out"
3. Usa estas credenciales:
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```
4. Haz clic en "Execute"
5. **IMPORTANTE**: Copia el `accessToken` completo de la respuesta

### 2. Autorizar Correctamente en Swagger

1. **Haz clic en el botón "Authorize" (🔒)** en la parte superior derecha de Swagger
2. En el campo "Value", pega **SOLO el token** (sin "Bearer " ni comillas):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtMTczNzM0NDE5OTUwMCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImNpcnVqYW5vIiwiYWRtaW5pc3RyYWRvciJdLCJpYXQiOjE3MzczNDQxOTksImV4cCI6MTczNzM0NTA5OX0.xxxxx
   ```
3. **NO agregues "Bearer "** - Swagger lo agrega automáticamente
4. Haz clic en "Authorize"
5. Haz clic en "Close"

### 3. Verificar que el Token Esté Activo

Después de autorizar, deberías ver un 🔒 junto a cada endpoint protegido. Si no lo ves, el token no se guardó correctamente.

### 4. Probar un Endpoint Simple Primero

Antes de probar crear un paciente, prueba:
- `GET /api/v1/auth/profile`

Este endpoint es más simple y te dirá si el token funciona.

### 5. Verificar los Logs del Backend

Cuando intentas usar un endpoint protegido, deberías ver en los logs del backend:

```
[JwtStrategy] Validando payload: { sub: 'dev-...', email: '...', roles: [...] }
[JwtStrategy] Usuario validado: { userId: '...', email: '...', roles: [...] }
```

Si ves errores como:
```
[JwtAuthGuard] Error: invalid signature
```
Significa que el secret JWT no coincide.

Si ves:
```
[JwtAuthGuard] Info: jwt expired
```
Significa que el token expiró (válido por 15 minutos).

### 6. Verificar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga:
```env
JWT_SECRET=change-this-secret-in-production-use-strong-secret-min-32-chars
JWT_EXPIRATION=15m
```

**IMPORTANTE**: Si cambias `JWT_SECRET`, debes:
1. Reiniciar el backend
2. Hacer login de nuevo (el token anterior no funcionará)

### 7. Probar con curl (Para Verificar)

Si Swagger no funciona, prueba con curl para verificar que el token es válido:

```bash
# 1. Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq -r '.data.accessToken // .accessToken')

# 2. Verificar perfil
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

Si esto funciona, el problema está en cómo Swagger está enviando el token.

## Errores Comunes

### Error: "Token no proporcionado"
- **Causa**: No hiciste clic en "Authorize" en Swagger
- **Solución**: Sigue el paso 2 arriba

### Error: "Token inválido o expirado"
- **Causa 1**: El token expiró (válido por 15 minutos)
- **Solución**: Haz login de nuevo y autoriza con el nuevo token

- **Causa 2**: El secret JWT cambió
- **Solución**: Reinicia el backend y haz login de nuevo

- **Causa 3**: El token está mal formateado
- **Solución**: Asegúrate de copiar el token completo sin espacios ni saltos de línea

### Error: "invalid signature"
- **Causa**: El secret usado para generar el token es diferente al usado para validarlo
- **Solución**: Verifica que `JWT_SECRET` en `.env` sea el mismo y reinicia el backend

## Debug Avanzado

Si nada funciona, habilita logs detallados:

1. En el backend, busca en los logs cuando intentas usar un endpoint:
   - `[JwtStrategy] Inicializando con secret: ...`
   - `[JwtStrategy] Validando payload: ...`
   - `[JwtAuthGuard] Error: ...`

2. Verifica que el token sea válido decodificándolo en https://jwt.io
   - Pega el token completo
   - Verifica que tenga `sub`, `email`, y `roles`
   - Verifica que no esté expirado (campo `exp`)

3. Compara el secret usado:
   - El secret debe ser el mismo en:
     - `auth.config.ts` (lee de `JWT_SECRET`)
     - `JwtModule` (en `auth.module.ts`)
     - `JwtStrategy` (en `jwt.strategy.ts`)
     - `AuthService` (en `auth.service.ts`)

## Solución Rápida

Si todo lo anterior falla:

1. **Reinicia el backend completamente**
2. **Limpia el caché de Swagger** (recarga la página con Ctrl+Shift+R)
3. **Haz login de nuevo**
4. **Autoriza con el nuevo token**
5. **Prueba `GET /api/v1/auth/profile` primero**
