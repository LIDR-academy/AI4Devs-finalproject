# Troubleshooting - Problemas de Login

## 🔍 Diagnóstico de Problemas

### 1. Verificar que el Backend esté corriendo

```bash
# Verificar que el backend esté corriendo en el puerto 3000
curl http://localhost:3000/health
```

Debería devolver: `{"status":"ok"}`

### 2. Verificar la URL del API

Abre la consola del navegador (F12) y verifica:
- La URL base del API debe ser: `http://localhost:3000/api/v1`
- Si usas una variable de entorno, verifica que esté configurada en `.env`:
  ```
  VITE_API_URL=http://localhost:3000/api/v1
  ```

### 3. Verificar CORS

Si ves errores de CORS en la consola:
- Verifica que el backend tenga CORS configurado correctamente
- El backend debe permitir `http://localhost:5173` (puerto por defecto de Vite)

### 4. Verificar el formato de la respuesta

El backend debe devolver:
```json
{
  "accessToken": "token...",
  "refreshToken": "token...",
  "expiresIn": "15m",
  "requiresMfa": false,
  "devMode": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "roles": ["cirujano"],
    "username": "usuario@ejemplo.com"
  }
}
```

### 5. Errores comunes

#### Error: "No se pudo conectar con el servidor"
- **Causa**: El backend no está corriendo o la URL es incorrecta
- **Solución**: 
  1. Inicia el backend: `cd backend && npm run start:dev`
  2. Verifica la URL en `frontend/src/utils/api.ts`

#### Error: "Credenciales inválidas"
- **Causa**: Email o contraseña incorrectos
- **Solución**: 
  - En modo desarrollo, cualquier email/contraseña debería funcionar si Keycloak no está disponible
  - Verifica que el backend esté en modo desarrollo (`NODE_ENV=development`)

#### Error: "CORS policy"
- **Causa**: El backend no permite el origen del frontend
- **Solución**: Verifica la configuración CORS en `backend/src/main.ts`

#### Error: "No se recibió token de acceso"
- **Causa**: El backend no está devolviendo el token correctamente
- **Solución**: 
  1. Verifica los logs del backend
  2. Prueba el endpoint directamente con curl o Postman

### 6. Probar el endpoint directamente

```bash
# Probar login directamente
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Debería devolver un JSON con `accessToken` y `user`.

### 7. Verificar en la consola del navegador

Abre DevTools (F12) → Console y busca:
- Errores de red (Network tab)
- Errores de JavaScript
- Logs de `console.error` o `console.log`

### 8. Limpiar localStorage

Si hay tokens corruptos:
```javascript
// En la consola del navegador
localStorage.clear();
// Luego recarga la página
```

## 🔧 Soluciones Rápidas

1. **Reiniciar ambos servidores**:
   ```bash
   # Backend
   cd backend
   npm run start:dev
   
   # Frontend (en otra terminal)
   cd frontend
   npm run dev
   ```

2. **Verificar variables de entorno**:
   - Backend: `backend/.env` debe tener `NODE_ENV=development`
   - Frontend: `frontend/.env` debe tener `VITE_API_URL=http://localhost:3000/api/v1`

3. **Verificar puertos**:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5173` (o el puerto que muestre Vite)

## 📝 Logs Útiles

El código ahora incluye logs detallados:
- En el navegador: `console.error('Error en login:', err)`
- En el backend: Verifica los logs de NestJS

Si el problema persiste, comparte:
1. El mensaje de error exacto
2. Los logs de la consola del navegador
3. Los logs del backend
4. La respuesta del endpoint `/health`
