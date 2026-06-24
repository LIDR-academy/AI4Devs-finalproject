## PSRP-001C: chore(infra): angular-workspace-scaffolding

**Type:** chore
**Priority:** P0 (Must)
**Estimated Effort:** S (1d)
**Sprint Week:** W1
**Dependencies:** PSRP-001A

## Resumen de Funcionalidad

Crear el workspace Angular 22 con standalone components, signals, strict mode, y Tailwind CSS configurado con los design tokens de Aura (colores, tipografía, espaciado). Una vez mergeado, el equipo frontend puede empezar PSRP-005 (auth UI). Se ejecuta en PARALELO con PSRP-001B.

## Requisitos

- [ ] Crear workspace Angular 22 en `frontend/` con standalone components, signals, strict mode
- [ ] Configurar Tailwind CSS con design tokens de Aura: colores (primary #7C9A72, accent #C9A96E, etc.), tipografía (Playfair Display + Inter), espaciado (4px base), border-radius, shadows
- [ ] Crear estructura de directorios: src/app/core/, src/app/features/, src/app/shared/, src/environments/, src/assets/
- [ ] Crear app component shell (standalone, mínimo — "Aura Planning")
- [ ] Crear `app.routes.ts` con array de rutas vacío
- [ ] Crear environment files: `environment.ts` (apiBaseUrl localhost), `environment.prod.ts` (production URL)
- [ ] Crear `nginx.conf` para SPA routing en producción (try_files $uri $uri/ /index.html)
- [ ] Añadir job `angular-build` al CI: setup Node 22, npm ci, ng build --configuration production

## Notas Técnicas

- **Frontend:** Angular 22, standalone components (sin NgModules), signals, nuevo control flow (@if, @for).
- **Design tokens:** CSS custom properties en `:root` + Tailwind config que los referencia. Valores exactos de `conventions/style-guide.md`.
- **Build:** `npm run build -- --configuration production` debe producir `dist/` sin errores.

## Criterios de Aceptación

- [ ] AC1: Dado el directorio frontend, cuando se ejecuta `npm install && npm run build`, entonces Angular se construye sin errores y produce `dist/`
- [ ] AC2: Dado el archivo styles.scss, cuando se inspeccionan las CSS custom properties, entonces los valores coinciden con `conventions/style-guide.md` (primary: #7C9A72, spacing-4: 16px, etc.)
- [ ] AC3: Dado un archivo .ts en el workspace, cuando se inspecciona tsconfig.json, entonces `"strict": true` está habilitado
- [ ] AC4: Dado un push a main, cuando el CI corre, entonces el job `angular-build` completa con éxito

## Elementos Relacionados

- **Architecture:** 03-project-structure.md (frontend structure)
- **Style Guide:** conventions/style-guide.md (design tokens)

## Bloqueadores

Bloqueado por: PSRP-001A

## Branch Name

`feature/PSRP-001C-angular-scaffolding`
