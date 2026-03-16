# Colección Postman - MS-AUTH

Esta carpeta contiene la colección de Postman para probar todos los endpoints del microservicio de autenticación (MS-AUTH).

## Archivos

- **MS-AUTH.postman_collection.json**: Colección completa con todos los endpoints
- **MS-AUTH.postman_environment.json**: Variables de entorno para desarrollo

## Instalación

1. Abre Postman
2. Click en **Import** (esquina superior izquierda)
3. Selecciona los archivos:
   - `MS-AUTH.postman_collection.json`
   - `MS-AUTH.postman_environment.json`
4. Selecciona el ambiente **MS-AUTH - Development** en el selector de ambientes

## Configuración

### Variables de Entorno

La colección utiliza las siguientes variables:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `baseUrl` | URL base del microservicio | `http://localhost:3000` |
| `accessToken` | Token de acceso JWT (se actualiza automáticamente) | - |
| `refreshToken` | Token de refresco (se actualiza automáticamente) | - |
| `sessionUuid` | UUID de la sesión actual (se actualiza automáticamente) | - |
| `resetToken` | Token para reset de contraseña | - |
| `deviceFingerprint` | Fingerprint del dispositivo (opcional) | `device-fingerprint-12345` |

### Actualización Automática de Tokens

Los endpoints **Login** y **Refresh Token** tienen scripts de prueba que actualizan automáticamente las variables `accessToken`, `refreshToken` y `sessionUuid` en el ambiente.

## Estructura de la Colección

### 1. Autenticación Pública
Endpoints que no requieren autenticación:

- **Login**: Inicia sesión con username y password
- **Refresh Token**: Refresca el access token
- **Forgot Password**: Solicita recuperación de contraseña
- **Reset Password**: Restablece contraseña con token

### 2. Gestión de Sesión
Endpoints que requieren autenticación JWT:

- **Logout**: Cierra la sesión actual
- **Logout All**: Cierra todas las sesiones activas
- **Get Sessions**: Lista todas las sesiones activas
- **Revoke Session**: Revoca una sesión específica

### 3. Perfil y Contraseña
Endpoints que requieren autenticación JWT:

- **Get Profile**: Obtiene el perfil del usuario
- **Change Password**: Cambia la contraseña del usuario

## Flujo de Prueba Recomendado

### 1. Autenticación Inicial
```
1. Ejecutar "Login" con credenciales válidas
   → Los tokens se guardan automáticamente en las variables
```

### 2. Probar Endpoints Protegidos
```
2. Ejecutar "Get Profile" (requiere accessToken)
3. Ejecutar "Get Sessions" (requiere accessToken)
```

### 3. Gestión de Sesiones
```
4. Ejecutar "Revoke Session" con un sessionId
5. Ejecutar "Logout All" para cerrar todas las sesiones
```

### 4. Refresh Token
```
6. Ejecutar "Refresh Token" para obtener nuevos tokens
   → Los tokens se actualizan automáticamente
```

### 5. Cambio de Contraseña
```
7. Ejecutar "Change Password" con la contraseña actual y nueva
```

### 6. Recuperación de Contraseña
```
8. Ejecutar "Forgot Password" con un email válido
9. Obtener el token del correo o base de datos
10. Actualizar la variable "resetToken" en el ambiente
11. Ejecutar "Reset Password" con el token y nueva contraseña
```

## Ejemplos de Request Body

### Login
```json
{
  "username": "jperez",
  "password": "Password123!"
}
```

### Change Password
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NuevaPassword456!",
  "confirmPassword": "NuevaPassword456!"
}
```

### Forgot Password
```json
{
  "email": "usuario@ejemplo.com"
}
```

### Reset Password
```json
{
  "token": "abc123...",
  "newPassword": "NuevaPassword123!",
  "confirmPassword": "NuevaPassword123!"
}
```

### Refresh Token
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Respuestas Esperadas

### Login Exitoso (200)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionUuid": "550e8400-e29b-41d4-a716-446655440000",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "username": "jperez",
    "nombreCompleto": "Juan Pérez",
    "email": "jperez@ejemplo.com",
    "perfil": {
      "id": 1,
      "nombre": "Administrador"
    }
  }
}
```

### Error de Validación (400)
```json
{
  "statusCode": 400,
  "message": [
    "El nombre de usuario es requerido",
    "La contraseña debe tener al menos 8 caracteres"
  ],
  "error": "Bad Request"
}
```

### Error de Autenticación (401)
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
```

## Notas Importantes

1. **Tokens Automáticos**: Los tokens se actualizan automáticamente después de Login y Refresh Token
2. **Headers Requeridos**: Los endpoints protegidos requieren el header `Authorization: Bearer {{accessToken}}`
3. **Validaciones**: Todos los endpoints validan los datos de entrada según las políticas del sistema
4. **Auditoría**: Todas las operaciones se registran en la tabla de auditoría
5. **Horarios**: El login valida los horarios permitidos del usuario (excepto usuarios SISTEMA)

## Troubleshooting

### Error: "Unauthorized"
- Verifica que el `accessToken` esté actualizado
- Ejecuta "Login" nuevamente para obtener un token válido

### Error: "Token expired"
- Ejecuta "Refresh Token" para obtener nuevos tokens
- Si el refresh token también expiró, ejecuta "Login" nuevamente

### Error: "Session not found"
- Verifica que el `sessionUuid` sea correcto
- Ejecuta "Get Sessions" para ver las sesiones activas

### Error: "Validation failed"
- Revisa los mensajes de error en la respuesta
- Verifica que los campos cumplan con las validaciones (longitud mínima, formato, etc.)

