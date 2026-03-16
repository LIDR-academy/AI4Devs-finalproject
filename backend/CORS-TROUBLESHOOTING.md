# Solución de Problemas de CORS

## Problema: Error de CORS al hacer login

### Soluciones Implementadas

1. **Configuración de CORS mejorada en el backend** (`backend/src/main.ts`):
   - Permite cualquier origen `localhost` o `127.0.0.1` en desarrollo
   - Soporta requests sin origin (Postman, curl)
   - Configuración más permisiva para desarrollo

2. **Cliente Axios con credentials** (`frontend/src/utils/api.ts`):
   - Agregado `withCredentials: true` para soportar cookies y headers de autenticación

3. **Proxy de Vite** (`frontend/vite.config.ts`):
   - Configurado para redirigir `/api` a `http://localhost:3000`
   - Esto evita problemas de CORS al hacer que las peticiones parezcan venir del mismo origen

## Verificación

### 1. Verificar que el backend esté corriendo
```bash
cd backend
npm run start:dev
```

Deberías ver en los logs:
```
🚀 Servidor corriendo en: http://localhost:3000
```

### 2. Verificar que el frontend esté usando el proxy

El frontend debería hacer peticiones a `/api/v1/auth/login` (relativo), no a `http://localhost:3000/api/v1/auth/login` (absoluto).

Verifica en `frontend/src/utils/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

Si estás usando el proxy de Vite, deberías usar:
```typescript
const API_BASE_URL = '/api/v1'; // Relativo - usa el proxy
```

### 3. Verificar variables de entorno

En `docker/.env` o `.env.local`:
```bash
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 4. Verificar en el navegador

Abre las DevTools (F12) → Network tab:
- Busca la petición de login
- Verifica que la URL sea relativa: `/api/v1/auth/login`
- Verifica los headers de respuesta:
  - `Access-Control-Allow-Origin: http://localhost:5173`
  - `Access-Control-Allow-Credentials: true`

## Soluciones Alternativas

### Opción 1: Usar el proxy de Vite (Recomendado)

Si usas el proxy de Vite, no deberías tener problemas de CORS porque todas las peticiones pasan por el mismo origen.

**Configuración en `frontend/src/utils/api.ts`**:
```typescript
const API_BASE_URL = '/api/v1'; // Relativo - usa el proxy de Vite
```

### Opción 2: Configurar CORS manualmente

Si necesitas hacer peticiones directas al backend (sin proxy):

1. **Backend** (`backend/src/main.ts`):
   - Ya está configurado para permitir `localhost` en desarrollo

2. **Frontend** (`frontend/src/utils/api.ts`):
   ```typescript
   const API_BASE_URL = 'http://localhost:3000/api/v1'; // Absoluto
   ```

3. **Verificar CORS_ORIGIN**:
   ```bash
   # En docker/.env
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```

### Opción 3: Deshabilitar CORS en desarrollo (Solo para desarrollo local)

⚠️ **NO usar en producción**

Si nada funciona, puedes temporalmente permitir todos los orígenes en desarrollo:

```typescript
// backend/src/main.ts
origin: isDevelopment ? true : corsOrigins, // Permite todos los orígenes en desarrollo
```

## Errores Comunes

### Error: "Access to XMLHttpRequest has been blocked by CORS policy"

**Causa**: El origen del frontend no está en la lista de orígenes permitidos.

**Solución**: 
1. Verifica que `CORS_ORIGIN` incluya el puerto del frontend
2. Reinicia el backend después de cambiar variables de entorno

### Error: "Credentials flag is 'true', but 'Access-Control-Allow-Credentials' header is ''"

**Causa**: El backend no está enviando el header `Access-Control-Allow-Credentials`.

**Solución**: Ya está configurado con `credentials: true` en `app.enableCors()`.

### Error: "Preflight request doesn't pass"

**Causa**: El backend no está respondiendo correctamente a las peticiones OPTIONS.

**Solución**: Ya está configurado con `optionsSuccessStatus: 204` y métodos OPTIONS permitidos.

## Testing

### Probar CORS con curl

```bash
# Preflight request (OPTIONS)
curl -X OPTIONS http://localhost:3000/api/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Deberías ver:
# < HTTP/1.1 204 No Content
# < Access-Control-Allow-Origin: http://localhost:5173
# < Access-Control-Allow-Credentials: true
```

### Probar login con curl

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

## Contacto

Si el problema persiste después de seguir estos pasos, verifica:
1. Que el backend esté corriendo en el puerto correcto (3000)
2. Que el frontend esté corriendo en el puerto correcto (5173)
3. Que no haya firewalls bloqueando las peticiones
4. Que no haya otros servicios usando los mismos puertos
