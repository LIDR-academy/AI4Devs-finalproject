# Cómo Usar Autenticación en Swagger

## Problema: Error 401 Unauthorized

Si ves este error al probar endpoints en Swagger:
```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

Significa que necesitas autenticarte primero.

## Solución: Autenticarse en Swagger

### Paso 1: Obtener Token de Autenticación

1. **Abre Swagger**: http://localhost:3000/api/docs

2. **Busca el endpoint de Login**:
   - Ve a la sección `Autenticación`
   - Encuentra `POST /api/v1/auth/login`
   - Haz clic en "Try it out"

3. **Completa el formulario**:
   ```json
   {
     "email": "test@example.com",
     "password": "test123"
   }
   ```
   
   **Nota**: En modo desarrollo, si Keycloak no está configurado, el sistema generará automáticamente un token de prueba.

4. **Ejecuta el request**:
   - Haz clic en "Execute"
   - Copia el `accessToken` de la respuesta

### Paso 2: Autorizar en Swagger

1. **Haz clic en el botón "Authorize"** (🔒) en la parte superior derecha de Swagger

2. **En el campo "Value"**, pega el token que copiaste:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Haz clic en "Authorize"**

4. **Haz clic en "Close"**

### Paso 3: Probar Endpoints Protegidos

Ahora todos los endpoints protegidos deberían funcionar. Verás un 🔒 junto a cada endpoint protegido.

## Ejemplo Completo

### 1. Login
```bash
POST /api/v1/auth/login
{
  "email": "test@example.com",
  "password": "test123"
}

Respuesta:
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": "15m"
  }
}
```

### 2. Copiar Token
Copia el valor de `accessToken` (sin las comillas)

### 3. Autorizar en Swagger
- Clic en "Authorize" 🔒
- Pegar token en "Value"
- Clic en "Authorize" y "Close"

### 4. Crear Paciente
```bash
POST /api/v1/hce/patients
{
  "firstName": "Juan",
  "lastName": "Pérez García",
  "dateOfBirth": "1985-05-15",
  "gender": "M",
  "ssn": "12345678A",
  "phone": "+34 600 123 456"
}
```

Ahora debería funcionar sin error 401.

## Modo Desarrollo

En modo desarrollo (`NODE_ENV=development`), si Keycloak no está disponible:

- El login generará automáticamente un token de prueba
- No necesitas configurar Keycloak para probar
- El token tendrá roles de desarrollo: `cirujano` y `administrador`

## Verificar que Estás Autenticado

Después de autorizar, puedes probar:
```
GET /api/v1/auth/profile
```

Si devuelve tu información de usuario, estás autenticado correctamente.

## Problemas Comunes

### "Token inválido o expirado"
- El token expiró (válido por 15 minutos por defecto)
- Solución: Haz login de nuevo y autoriza con el nuevo token

### "No autenticado"
- No has hecho clic en "Authorize" en Swagger
- Solución: Sigue los pasos 2-3 arriba

### El botón "Authorize" no aparece
- Verifica que Swagger esté cargado completamente
- Recarga la página: http://localhost:3000/api/docs

## Token de Prueba Rápida (Solo Desarrollo)

Si necesitas un token rápidamente para pruebas, puedes usar este endpoint:

```bash
POST /api/v1/auth/login
{
  "email": "dev@test.com",
  "password": "dev123"
}
```

En modo desarrollo, esto generará un token automáticamente incluso si Keycloak no está disponible.
