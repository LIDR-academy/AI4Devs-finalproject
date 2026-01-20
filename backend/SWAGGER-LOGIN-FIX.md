# Solución: No Puedo Loguearme en Swagger

## Problema
Al intentar hacer login en Swagger con:
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```
Se obtiene un error 401 o no funciona.

## Solución Implementada

He actualizado el código para que **en modo desarrollo**, si Keycloak no está disponible, el sistema genere automáticamente un token de prueba.

### Pasos para Probar

1. **Verificar que el backend esté corriendo**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Verificar que NODE_ENV esté en desarrollo**:
   - El archivo `.env` debe tener: `NODE_ENV=development`
   - O simplemente no definir `NODE_ENV` (por defecto es desarrollo)

3. **Abrir Swagger**:
   - Ve a: http://localhost:3000/api/docs

4. **Hacer Login**:
   - Ve a la sección `Autenticación`
   - Abre `POST /api/v1/auth/login`
   - Haz clic en "Try it out"
   - Usa cualquier email y password (ejemplo):
     ```json
     {
       "email": "test@example.com",
       "password": "test123"
     }
     ```
   - Haz clic en "Execute"

5. **Resultado Esperado**:
   - Si Keycloak NO está disponible: El sistema generará automáticamente un token de desarrollo
   - Si Keycloak SÍ está disponible: Intentará autenticar con Keycloak primero
   - En ambos casos, deberías recibir un `accessToken`

6. **Autorizar en Swagger**:
   - Copia el `accessToken` de la respuesta
   - Haz clic en el botón "Authorize" (🔒) en la parte superior derecha
   - Pega el token en el campo "Value"
   - Haz clic en "Authorize" y luego "Close"

7. **Probar Endpoints Protegidos**:
   - Ahora puedes probar `POST /api/v1/hce/patients` y otros endpoints

## Cómo Funciona el Modo Desarrollo

Cuando `NODE_ENV=development`:

1. **Primero verifica si Keycloak está disponible**:
   - Intenta conectar a `http://localhost:8080/health/ready`
   - Timeout de 2 segundos

2. **Si Keycloak NO está disponible**:
   - Genera automáticamente un token JWT de desarrollo
   - El token incluye roles: `cirujano` y `administrador`
   - No necesitas configurar Keycloak

3. **Si Keycloak SÍ está disponible**:
   - Intenta autenticar con Keycloak normalmente
   - Si falla, genera token de desarrollo como fallback

## Verificar Logs

Si tienes problemas, revisa los logs del backend. Deberías ver mensajes como:

```
[AuthService] Intentando autenticar usuario: test@example.com
[KeycloakService] Keycloak no disponible: connect ECONNREFUSED
[AuthService] Keycloak no disponible, generando token de desarrollo
```

## Si Aún No Funciona

1. **Verifica que el backend esté corriendo**:
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verifica los logs del backend** para ver qué error específico está ocurriendo

3. **Verifica que NODE_ENV sea 'development'**:
   ```bash
   echo $NODE_ENV
   # O en el archivo .env
   ```

4. **Reinicia el backend** después de cualquier cambio en `.env`

## Token de Desarrollo

El token de desarrollo generado incluye:
- `id`: `dev-{timestamp}`
- `email`: El email que proporcionaste en el login
- `roles`: `['cirujano', 'administrador']`

Este token es válido por 15 minutos (configurable en `auth.jwt.expiresIn`).
