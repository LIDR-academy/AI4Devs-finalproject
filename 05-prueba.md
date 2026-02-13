# Resumen: 5. Prueba

**Carpeta:** `5. prueba/`  
**Propósito:** Referencia a la fase de pruebas y QA del sistema.

---

## Ubicación de las pruebas

Las pruebas **se realizan dentro del proyecto mismo**, en la carpeta `3. desarrollo/`. No existe una carpeta de pruebas separada; los tests están integrados en cada microservicio y en el frontend.

---

## Estructura de la carpeta 5. prueba

```
5. prueba/
└── README.md   (indica estado/fase pendiente como organización)
```

---

## Dónde se ejecutan las pruebas

### Backend (microservicios)

| Microservicio | Unit tests | E2E tests | Ubicación |
|---------------|------------|-----------|-----------|
| **MS-AUTH** | login, refresh-token, change-password, auth.repository, schedule.service | login | `3. desarrollo/backend/ms-auth/` |
| **MS-CONFI** | ciiu: service, repository, usecase; pg.service | app | `3. desarrollo/backend/ms-confi/` |
| **MS-CORE** | — | app | `3. desarrollo/backend/ms-core/` |
| **MS-PERSO** | clien, clbnc (controller, service, repository, usecase, value objects); pg.service | login, recuperar-password, registrar-cliente, actualizar-cliente | `3. desarrollo/backend/ms-perso/` |

### Frontend (Angular)

| Módulo | Tests | Ubicación |
|--------|-------|-----------|
| **Shared** | button, input, select, table, form, alert, icon, wrapper | `3. desarrollo/frontend/src/app/shared/` |
| **Auth** | login, change-password-modal, token-storage, telemetry, inactivity, auth.facade | `3. desarrollo/frontend/src/app/modules/auth/` |
| **Admin/Confi** | ofici, opcio, empre | `3. desarrollo/frontend/src/app/modules/admin/confi/` |
| **Core** | auth.guard, noAuth.guard, office-selected.guard | `3. desarrollo/frontend/src/app/core/` |

### Estructura de tests en el proyecto

```
3. desarrollo/
├── backend/
│   ├── ms-auth/
│   │   ├── src/**/*.spec.ts      (unit)
│   │   └── test/
│   │       ├── app.e2e-spec.ts
│   │       └── auth/login.e2e-spec.ts
│   ├── ms-confi/
│   │   ├── src/**/*.spec.ts
│   │   └── test/
│   ├── ms-core/
│   │   └── test/app.e2e-spec.ts
│   └── ms-perso/
│       ├── src/**/*.spec.ts
│       ├── test/
│       │   ├── e2e/
│       │   │   ├── clbnc/login.e2e-spec.ts
│       │   │   ├── clbnc/recuperar-password.e2e-spec.ts
│       │   │   ├── clien/registrar-cliente-completo.e2e-spec.ts
│       │   │   └── clien/actualizar-cliente-completo.e2e-spec.ts
│       │   ├── PLAN_PRUEBAS.md
│       │   └── README-SPEC-KIT.md
│       └── ...
└── frontend/
    └── src/**/*.spec.ts
```

---

## Tipos de pruebas implementadas

| Tipo | Herramienta | Cobertura |
|------|-------------|-----------|
| **Unit tests** | Jest (backend), Karma/Jasmine (Angular) | UseCases, repositories, services, controllers, componentes |
| **E2E tests** | Jest + Supertest | Login, registro cliente, actualización cliente, recuperar contraseña |
| **Plan de pruebas** | PLAN_PRUEBAS.md (ms-perso) | Pirámide: 70% unit, 20% integration, 10% E2E |

---

## Resumen

| | Descripción |
|---|-------------|
| **Qué se hizo** | Tests unitarios y E2E implementados dentro de cada microservicio y del frontend. |
| **Cómo** | Jest para backend, Karma/Jasmine para Angular; tests junto al código fuente y en carpetas `test/`. |
| **Dónde** | `3. desarrollo/backend/ms-*/` y `3. desarrollo/frontend/src/`. La carpeta `5. prueba/` solo contiene un README de referencia. |

---

*[← Volver al índice](README.md)*
