# Solución: "No auth token" en Swagger

## Problema
Los logs muestran:
```
[JwtAuthGuard] Info: No auth token
Token no proporcionado. Usa el botón "Authorize" en Swagger y pega el token.
```

Esto significa que Swagger **NO está enviando el token** en el header `Authorization`.

## Solución Implementada

He corregido la configuración de Swagger para que el esquema de autenticación se llame `'bearer'` en lugar de `'JWT-auth'`. Esto asegura que Swagger envíe correctamente el token.

## Pasos para Probar (IMPORTANTE)

### 1. Reinicia el Backend
```bash
cd backend
# Detén el backend (Ctrl+C)
npm run start:dev
```

### 2. Recarga Swagger Completamente
- Cierra la pestaña de Swagger
- Abre una nueva: http://localhost:3000/api/docs
- O recarga con Ctrl+Shift+R (Cmd+Shift+R en Mac)

### 3. Haz Login
1. Ve a `POST /api/v1/auth/login`
2. Haz clic en "Try it out"
3. Usa:
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```
4. Haz clic en "Execute"
5. **Copia el `accessToken` completo** de la respuesta

### 4. Autoriza en Swagger (PASO CRÍTICO)

1. **Haz clic en el botón "Authorize" (🔒)** en la parte superior derecha
2. Deberías ver un modal con el título "Available authorizations"
3. Deberías ver una entrada llamada **"bearer (http, Bearer)"**
4. Haz clic en el campo "Value" de esa entrada
5. **Pega SOLO el token** (sin "Bearer " ni comillas):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtMTczNzM0NDE5OTUwMCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImNpcnVqYW5vIiwiYWRtaW5pc3RyYWRvciJdLCJpYXQiOjE3MzczNDQxOTksImV4cCI6MTczNzM0NTA5OX0.xxxxx
   ```
6. **NO agregues "Bearer "** - Swagger lo agrega automáticamente
7. Haz clic en "Authorize"
8. Deberías ver un 🔒 junto a "bearer (http, Bearer)"
9. Haz clic en "Close"

### 5. Verifica que el Token Esté Activo

Después de autorizar:
- Deberías ver un 🔒 junto a cada endpoint protegido
- Si no ves el 🔒, el token no se guardó correctamente

### 6. Prueba un Endpoint Simple

Prueba primero `GET /api/v1/auth/profile`:
1. Haz clic en "Try it out"
2. Haz clic en "Execute"
3. Deberías recibir tu información de usuario

Si esto funciona, el token se está enviando correctamente.

## Si Aún No Funciona

### Verificar que el Token se Esté Enviando

1. Abre las herramientas de desarrollador del navegador (F12)
2. Ve a la pestaña "Network" (Red)
3. Intenta usar un endpoint protegido
4. Haz clic en la petición
5. Ve a "Headers" (Encabezados)
6. Busca "Authorization" en "Request Headers"
7. Deberías ver: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Si NO ves el header "Authorization", Swagger no está enviando el token.

### Soluciones Alternativas

1. **Limpia el caché del navegador**:
   - Ctrl+Shift+Delete (Cmd+Shift+Delete en Mac)
   - Selecciona "Cached images and files"
   - Limpia y recarga Swagger

2. **Prueba en modo incógnito**:
   - Abre una ventana incógnita
   - Ve a http://localhost:3000/api/docs
   - Repite los pasos de login y autorización

3. **Verifica que el backend esté usando el código actualizado**:
   - Asegúrate de que el backend se reinició después de los cambios
   - Verifica que no haya errores de compilación

## Verificación Final

Después de autorizar, cuando uses un endpoint protegido, los logs deberían mostrar:

```
[JwtStrategy] Validando payload: { sub: '...', email: '...', roles: [...] }
[JwtStrategy] Usuario validado: { userId: '...', email: '...', roles: [...] }
[JwtAuthGuard] Usuario autenticado: { userId: '...', email: '...' }
```

Si ves "No auth token", significa que el header Authorization no se está enviando.

## Nota Importante

El nombre del esquema de autenticación en Swagger ahora es `'bearer'` (en minúsculas). Esto debe coincidir con:
- El nombre en `addBearerAuth()` en `main.ts`
- El nombre en `@ApiBearerAuth('bearer')` en los controladores

Si cambias uno, debes cambiar el otro también.
