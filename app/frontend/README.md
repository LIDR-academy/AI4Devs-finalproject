# Frontend - ProjectScope AI

Aplicacion React + Vite para el flujo MVP:

1. Crear proyecto
2. Agregar casos de uso
3. Ejecutar estimacion
4. Visualizar reporte

## Scripts

- `npm run dev`: inicia frontend en `http://127.0.0.1:3000`.
- `npm run build`: compila TypeScript y genera build de produccion.
- `npm run test`: ejecuta pruebas unitarias con Vitest.
- `npm run test:e2e`: ejecuta E2E con Playwright.
- `npm run test:e2e:install`: instala Chromium y dependencias del sistema para Playwright.

## Requisitos para E2E (T11)

Antes de ejecutar E2E en local:

1. Instalar dependencias backend y frontend:
   - `npm ci --prefix ../backend`
   - `npm ci`
2. Configurar `DATABASE_URL` para backend.
3. Aplicar esquema Prisma:
   - `npm run prisma:push --prefix ../backend`
4. Instalar navegador de Playwright:
   - `npm run test:e2e:install`
5. Ejecutar pruebas:
   - `npm run test:e2e`

Playwright levanta backend y frontend automaticamente usando `playwright.config.ts`.

## Variables de entorno

- `VITE_API_BASE_URL` (opcional en local): URL publica del backend.
- `PLAYWRIGHT_BASE_URL` (opcional): URL base para E2E. Por defecto `http://127.0.0.1:3000`.
