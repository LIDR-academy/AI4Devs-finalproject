# Referencia de variables de entorno

## Backend

| Variable | Requerida | Entorno | Descripcion |
|---|---:|---|---|
| `NODE_ENV` | Si | Railway | Usar `production` en despliegue |
| `PORT` | Si | Railway | Railway la inyecta automaticamente |
| `DATABASE_URL` | Si | Railway | URL de PostgreSQL creada por Railway |
| `DATABASE_SSL` | Si | Railway | Usar `true` en Railway |
| `DATABASE_PATH` | No | Local | Ruta SQLite cuando no existe `DATABASE_URL` |
| `FRONTEND_URL` | Si | Todos | URL principal del frontend |
| `ALLOWED_ORIGINS` | Si | Todos | Lista separada por comas para CORS |
| `DEFAULT_STORE_NAME` | Si | Todos | Nombre de tienda demo para seed |
| `DEFAULT_STORE_PHONE` | Si | Todos | Telefono demo |
| `DEFAULT_PRODUCT_SKU` | Si | Todos | SKU usado si WhatsApp no envia referencia |
| `PAYMENT_BASE_URL` | Si | Todos | Base del link de pago simulado |
| `WHATSAPP_PROVIDER` | Si | Todos | `simulator` o `meta` |
| `META_GRAPH_API_VERSION` | Si | Meta | Version Graph API, por ejemplo `v20.0` |
| `META_WHATSAPP_VERIFY_TOKEN` | Si | Meta | Token inventado por ti para validar webhook |
| `META_WHATSAPP_ACCESS_TOKEN` | Si | Meta | Token de acceso de WhatsApp Cloud API |
| `META_WHATSAPP_PHONE_NUMBER_ID` | Si | Meta | Phone Number ID de Meta |
| `META_APP_SECRET` | Recomendado | Meta | App Secret para futura validacion de firma |
| `AWS_REGION` | No | AWS | Region si se usa S3 o servicios AWS |
| `AWS_ACCESS_KEY_ID` | No | AWS | Access key para integraciones AWS |
| `AWS_SECRET_ACCESS_KEY` | No | AWS | Secret key para integraciones AWS |
| `AWS_S3_BUCKET` | No | AWS | Bucket opcional para assets/evidencias |

## Frontend

| Variable | Requerida | Descripcion |
|---|---:|---|
| `VITE_API_URL` | Si | URL publica del backend en Railway |

## Valores locales minimos

Backend local:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
DATABASE_PATH=./data/comercia.db
WHATSAPP_PROVIDER=simulator
PAYMENT_BASE_URL=https://payments.example.test/pay
```

Frontend local:

```env
VITE_API_URL=http://localhost:3000
```

