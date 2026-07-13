# ComercIA Backend

Rama standalone para desplegar solo el backend de ComercIA Marketplace Assistant.

## Railway

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Healthcheck:

```text
/health
```

## Variables

Usar `railway.env.example` como base.

Minimas para Railway:

- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL`
- `DATABASE_SSL=true`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `WHATSAPP_PROVIDER`
- `META_WHATSAPP_VERIFY_TOKEN`

Webhook Meta:

```text
https://TU-BACKEND.up.railway.app/webhooks/whatsapp
```

## Poblado de base de datos

El seed crea datos demo completos para probar el flujo E2E: catalogo, reglas de precio, leads de WhatsApp, conversaciones, negociaciones, orden pendiente de pago, orden pagada y entrega programada.

Local con SQLite:

```bash
npm run db:seed
```

Railway con PostgreSQL:

```bash
npm run db:seed
```

En Railway el comando debe ejecutarse con `DATABASE_URL` disponible en el servicio backend. El seed es idempotente: se puede correr varias veces y actualiza los registros demo por SKU, telefono y referencias `seed_*` sin duplicar el dataset principal.

## Chatbot comercial

El webhook de WhatsApp procesa mensajes entrantes y responde automaticamente en sandbox Meta. Comandos utiles para demo:

```text
CATALOGO
STOCK
Quiero comprar AUD-BT-001 con 12% de descuento
ACEPTO
PAGADO
Entrega en Centro Comercial Andino, Bogota
```

El bot consulta inventario, propone oferta, crea orden, genera link de pago simulado, permite confirmar pago sandbox y programa entrega con enlace de Google Maps.

En WhatsApp Meta, el backend envia el catalogo como lista interactiva, las ofertas con botones de respuesta y los links de pago/mapa como botones URL. Las tarjetas de producto nativas requieren conectar un catalogo de Meta Commerce; este flujo deja lista la demo comercial sin depender de ese catalogo.

Si configuras OpenAI, GPT decide la accion comercial usando el contexto de inventario, conversacion y endpoints internos disponibles. El backend no deja que el modelo ejecute acciones arbitrarias: solo puede seleccionar una accion permitida y el servidor ejecuta la funcion validada.

Variables:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

Sin `OPENAI_API_KEY`, el webhook usa el parser deterministico local como respaldo.
