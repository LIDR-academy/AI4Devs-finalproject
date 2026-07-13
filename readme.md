# Entrega 2 - ComercIA Marketplace Assistant MVP

Esta carpeta contiene el desarrollo de la segunda entrega, separado de la documentacion de Entrega 1.

## Que incluye

- Backend Express + TypeScript.
- SQLite local mediante `node:sqlite` para facilitar ejecucion del MVP.
- Frontend React + TypeScript con Vite.
- Simulador de lead por WhatsApp.
- Motor de negociacion deterministico basado en stock, margen minimo y reglas.
- Generacion de orden y link de pago simulado.
- Webhook de pago simulado.
- Coordinacion de entrega con enlace de Google Maps.
- Tests unitarios e integracion del backend.

## Flujo principal

1. El vendedor revisa producto, stock y regla de negociacion.
2. Simula un mensaje entrante de WhatsApp de un comprador.
3. El sistema crea lead, conversacion y mensaje.
4. El vendedor genera una oferta sugerida.
5. El sistema calcula precio seguro y registra la negociacion.
6. El vendedor crea una orden y un link de pago.
7. El vendedor simula confirmacion de pago.
8. El sistema descuenta inventario.
9. El vendedor coordina entrega con direccion y coordenadas.
10. El sistema genera y registra un link de Google Maps.

## Requisitos

- Node.js 22 o superior.
- npm.

## Instalacion

Desde esta carpeta:

```powershell
npm install
Copy-Item backend/.env.example backend/.env
npm run db:migrate
npm run db:seed
```

## Ejecutar en desarrollo

Terminal 1:

```powershell
npm run dev:backend
```

Terminal 2:

```powershell
npm run dev:frontend
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## Tests y build

```powershell
npm test
npm run build
```

## Notas de alcance

- WhatsApp esta simulado mediante `POST /webhooks/whatsapp`.
- Pagos estan simulados mediante `POST /webhooks/payments`.
- Maps usa enlaces publicos con latitud y longitud, sin geocoding real.
- Node puede mostrar una advertencia `ExperimentalWarning` por `node:sqlite`; no bloquea ejecucion, tests ni build.
- Para Entrega Final se puede migrar a PostgreSQL administrado manteniendo el contrato REST del MVP.
