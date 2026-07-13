# Entrega Final - ComercIA Marketplace Assistant

Esta carpeta contiene la version funcional preparada para la entrega final.

## Objetivo

Publicar ComercIA Marketplace Assistant con:

- Backend desplegable en Railway.
- Frontend desplegable en Railway.
- Base de datos PostgreSQL en Railway.
- Webhook listo para Meta WhatsApp Cloud API.
- Variables de entorno separadas para frontend y backend.
- Flujo principal funcional: WhatsApp -> conversacion -> oferta -> orden -> pago -> entrega Maps.

## Modos de base de datos

El backend soporta dos modos:

- Local sin `DATABASE_URL`: usa SQLite local para desarrollo y tests.
- Railway con `DATABASE_URL`: usa PostgreSQL automaticamente.

## Instalacion local

```powershell
cd F:\aspis\SergioCursos\AI4Devs-finalproject\entrega3
npm install
Copy-Item backend/.env.example backend/.env
npm run db:migrate
npm run db:seed
```

## Desarrollo local

Terminal 1:

```powershell
npm run dev:backend
```

Terminal 2:

```powershell
npm run dev:frontend
```

URLs locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Validacion

```powershell
npm test
npm run build
```

Validado localmente:

- 2 suites de tests pasan.
- 4 tests pasan.
- Backend compila.
- Frontend compila.

## Railway

Crear 3 servicios:

1. PostgreSQL.
2. Backend Node.js.
3. Frontend Vite.

Backend:

```text
Root directory: entrega3
Build command: npm install && npm --workspace backend run build
Start command: npm --workspace backend start
Healthcheck path: /health
```

Frontend:

```text
Root directory: entrega3
Build command: npm install && npm --workspace frontend run build
Start command: npm --workspace frontend start
```

Mas detalle en:

- `docs/deployment-railway-meta.md`
- `docs/env-reference.md`
- `docs/checklist-final.md`

## Meta WhatsApp

Webhook backend:

```text
GET  /webhooks/whatsapp
POST /webhooks/whatsapp
```

Callback URL en Meta:

```text
https://TU-BACKEND.up.railway.app/webhooks/whatsapp
```

Verify token:

```text
META_WHATSAPP_VERIFY_TOKEN
```

Para activar envio real de mensajes:

```text
WHATSAPP_PROVIDER=meta
META_WHATSAPP_ACCESS_TOKEN=...
META_WHATSAPP_PHONE_NUMBER_ID=...
```

Para pruebas sin Meta:

```text
WHATSAPP_PROVIDER=simulator
```

