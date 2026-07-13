# PR Entrega Final - ComercIA Marketplace Assistant

## Titulo sugerido

Entrega final: ComercIA funcional con Railway, PostgreSQL y Meta WhatsApp

## Descripcion

Este PR consolida la entrega final de `ComercIA Marketplace Assistant`, un asistente comercial para vendedores de marketplaces que convierte conversaciones de WhatsApp en ventas cerradas mediante oferta, orden, pago y entrega con Maps.

## Cambios incluidos

- Carpeta `entrega3/` separada de entregas anteriores.
- Backend Express + TypeScript.
- Runtime dual:
  - SQLite local cuando no existe `DATABASE_URL`.
  - PostgreSQL en Railway cuando existe `DATABASE_URL`.
- Migracion y seed para PostgreSQL.
- Webhook Meta WhatsApp:
  - `GET /webhooks/whatsapp` para verificacion.
  - `POST /webhooks/whatsapp` para mensajes reales de Meta o simulador.
- Envio opcional de mensajes por WhatsApp Cloud API con `WHATSAPP_PROVIDER=meta`.
- Frontend React + Vite preparado para `VITE_API_URL`.
- Plantillas de variables:
  - `backend/railway.env.example`
  - `frontend/railway.env.example`
- Documentacion de despliegue en Railway y Meta.
- Checklist final de validacion.

## Validacion local

```powershell
cd F:\aspis\SergioCursos\AI4Devs-finalproject\entrega3
npm install
npm test
npm run build
```

Resultado esperado:

- 2 suites de tests pasan.
- 4 tests pasan.
- Backend compila.
- Frontend compila.

## Variables principales

- `DATABASE_URL`
- `DATABASE_SSL`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `VITE_API_URL`
- `WHATSAPP_PROVIDER`
- `META_WHATSAPP_VERIFY_TOKEN`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `PAYMENT_BASE_URL`

## Pendiente operativo antes de enviar formulario

- Publicar backend en Railway.
- Publicar frontend en Railway.
- Crear PostgreSQL en Railway.
- Configurar webhook en Meta Developers.
- Agregar URLs publicas al README principal.
- Adjuntar capturas o video del flujo completo.

