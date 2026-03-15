# Solución de Error CORS

## 🔴 Problema

Error CORS al intentar hacer login desde el frontend:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/v1/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## ✅ Solución Aplicada

Se ha configurado CORS en el backend (`src/main.ts`) para permitir peticiones desde:
- `http://localhost:5173` (Vite dev server por defecto)
- `http://localhost:3000` (Backend/Swagger)
- `http://localhost:5174` (Puerto alternativo de Vite)

### Configuración CORS Aplicada

**Cambios realizados:**

1. **CORS configurado ANTES de helmet** (importante para evitar bloqueos)
2. **Helmet configurado para permitir CORS**:
   - `crossOriginResourcePolicy: { policy: 'cross-origin' }`
   - `crossOriginEmbedderPolicy: false`

```typescript
// CORS - Debe configurarse ANTES de helmet
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];
app.enableCors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Accept'],
  exposedHeaders: ['X-Request-ID'],
});

// Seguridad - Configurar helmet para no bloquear CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  }),
);
```

## 🔄 Para Aplicar el Cambio

1. **Reiniciar el backend**:
```bash
cd backend
npm run start:dev
```

2. **Verificar que el backend esté corriendo** en `http://localhost:3000`

3. **Probar el login** desde el frontend en `http://localhost:5173`

## 🐛 Troubleshooting

### Si el error persiste:

1. **Verificar que el backend esté corriendo**:
```bash
curl http://localhost:3000/health
```

2. **Verificar el puerto del frontend**:
   - Si Vite está usando un puerto diferente a 5173, agregarlo a la lista de `origin` en `main.ts`

3. **Verificar headers en el navegador**:
   - Abrir DevTools → Network
   - Verificar que las peticiones incluyan `Authorization: Bearer <token>`

4. **Verificar que `credentials: true` esté configurado**:
   - Esto permite el envío de cookies y headers de autenticación

## 📝 Nota para Producción

En producción, cambiar `origin` para usar variables de entorno:

```typescript
origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'],
```
