# PR Entrega 2 - ComercIA Marketplace Assistant MVP

## Titulo sugerido

Entrega 2: MVP ejecutable de ComercIA Marketplace Assistant

## Descripcion

Este PR agrega el primer MVP ejecutable de `ComercIA Marketplace Assistant`, separado de la documentacion de Entrega 1. El objetivo es demostrar el flujo E2E principal del producto: lead por WhatsApp, negociacion automatizada, orden, link de pago, confirmacion de pago y coordinacion de entrega con Maps.

## Cambios incluidos

- Carpeta independiente `entrega2/`.
- Backend Express + TypeScript.
- SQLite local mediante `node:sqlite` para ejecucion rapida del MVP.
- Modelo de datos para productos, reglas, inventario, leads, conversaciones, mensajes, negociaciones, ordenes, pagos y entregas.
- Motor de negociacion deterministico con proteccion de margen minimo.
- Simulador de WhatsApp mediante `POST /webhooks/whatsapp`.
- Pago simulado mediante link y `POST /webhooks/payments`.
- Generacion de enlace de Google Maps con coordenadas.
- Frontend React + TypeScript para ejecutar el flujo desde navegador.
- Tests unitarios del motor de precios.
- Test de integracion del flujo principal.

## Historias relacionadas

- US-01: Configuracion de productos, inventario y reglas comerciales.
- US-02: Registro de leads y conversaciones desde WhatsApp.
- US-03: Negociacion automatizada basada en inventario y rotacion.
- US-04: Generacion de orden y link de pago.
- US-05: Coordinacion de entrega con coordenadas de Maps.

## Validacion esperada

```powershell
cd F:\aspis\SergioCursos\AI4Devs-finalproject\entrega2
npm install
Copy-Item backend/.env.example backend/.env
npm run db:migrate
npm run db:seed
npm test
npm run build
```

## Impacto

El PR introduce codigo funcional para Entrega 2 sin modificar el contenido de Entrega 1. Las integraciones externas quedan simuladas para poder validar el flujo completo en local.

## Pendientes para entrega final

- Cambiar SQLite local por PostgreSQL administrado.
- Reemplazar simulador de pago por proveedor test real.
- Reemplazar simulador de WhatsApp por WhatsApp Business Cloud API o mantenerlo como fallback de demo.
- Agregar test E2E Playwright desde UI.
- Publicar URL publica de frontend y backend.
