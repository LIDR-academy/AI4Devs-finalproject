# Despliegue Railway + Meta WhatsApp

## 1. Preparar Railway

Crear un proyecto en Railway con tres servicios:

- `comercia-postgres`
- `comercia-backend`
- `comercia-frontend`

## 2. PostgreSQL

1. Agregar plugin PostgreSQL en Railway.
2. Copiar o referenciar la variable `DATABASE_URL`.
3. El backend ejecutara migraciones al iniciar, pero tambien puedes correr:

```bash
npm --workspace backend run db:migrate
npm --workspace backend run db:seed
```

## 3. Backend

Configuracion del servicio backend:

```text
Root directory: entrega3
Build command: npm install && npm --workspace backend run build
Start command: npm --workspace backend start
Healthcheck path: /health
```

Variables:

- Usar `backend/railway.env.example` como plantilla.
- `DATABASE_URL` debe venir del plugin PostgreSQL.
- `DATABASE_SSL=true`.
- `FRONTEND_URL` y `ALLOWED_ORIGINS` deben apuntar a la URL publica del frontend.

Despues del primer deploy, abrir:

```text
https://TU-BACKEND.up.railway.app/health
```

Debe responder:

```json
{
  "ok": true,
  "service": "comercia-backend",
  "database": "postgres"
}
```

## 4. Frontend

Configuracion del servicio frontend:

```text
Root directory: entrega3
Build command: npm install && npm --workspace frontend run build
Start command: npm --workspace frontend start
```

Variables:

```env
VITE_API_URL=https://TU-BACKEND.up.railway.app
```

## 5. Meta WhatsApp Cloud API

En Meta Developers:

1. Crear o abrir la app.
2. Agregar producto WhatsApp.
3. Obtener `Phone Number ID`.
4. Generar token de acceso.
5. Configurar webhook:

```text
Callback URL:
https://TU-BACKEND.up.railway.app/webhooks/whatsapp

Verify token:
el mismo valor de META_WHATSAPP_VERIFY_TOKEN
```

6. Suscribir el webhook al campo `messages`.

## 6. Prueba de webhook sin Meta

Con `WHATSAPP_PROVIDER=simulator`, probar:

```bash
curl -X POST https://TU-BACKEND.up.railway.app/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laura Perez",
    "phone": "+573001231231",
    "productSku": "AUD-BT-001",
    "message": "Hola, lo vi en Marketplace. Tiene descuento?",
    "requestedDiscountPercent": 10
  }'
```

## 7. Prueba con Meta

Enviar un WhatsApp al numero configurado con un texto que incluya el SKU:

```text
Hola, me interesa el producto SKU AUD-BT-001. Tiene descuento?
```

Si no incluye SKU, el backend usa `DEFAULT_PRODUCT_SKU`.

## 8. AWS

AWS queda preparado como integracion opcional mediante variables:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

Uso recomendado para entrega final:

- Guardar capturas/video de evidencia.
- Almacenar archivos adjuntos si se agrega media de WhatsApp.
- Logs o backups futuros.

