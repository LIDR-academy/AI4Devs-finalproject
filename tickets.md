# Tickets de trabajo — Flotiko

Índice de los tickets de trabajo. Cada ticket está en un archivo individual. **Orden: Backend (T1–T2) → API (T3–T8) → Frontend (T9–T13) → Opcionales (T14–T15).**

## Orden de implementación

1. **Backend (T1–T2)**: Proyecto Laravel, BD, migraciones, modelos y middleware API key. Base para todo lo demás.
2. **API (T3–T8)**: Endpoints REST (auth, usuarios, vehículos, fuel-refills, maintenances, reporte). El frontend depende de estos endpoints.
3. **Frontend (T9–T13)**: Pantallas React que consumen la API.
4. **Opcionales (T14–T15)**: Notificaciones y gasolineras cercanas.

---

## Backend (T1–T2)

| ID | Título | Archivo | Historia(s) |
|----|--------|---------|-------------|
| T1 | Backend: Proyecto Laravel, BD, migraciones y modelos | [T1.md](tickets/T1.md) | Base MH1–MH5 |
| T2 | Backend: Middleware API key y scopes company | [T2.md](tickets/T2.md) | MH1 |

## API (T3–T8)

| ID | Título | Archivo | Historia(s) |
|----|--------|---------|-------------|
| T3 | API: Auth login y middleware API key | [T3.md](tickets/T3.md) | MH1 |
| T4 | API: CRUD usuarios (listar, perfil) | [T4.md](tickets/T4.md) | MH1 |
| T5 | API: CRUD vehículos y brands | [T5.md](tickets/T5.md) | MH2 |
| T6 | API: CRUD fuel-refills y cálculo consumo | [T6.md](tickets/T6.md) | MH3 |
| T7 | API: CRUD maintenances, maintenance-types y workshops | [T7.md](tickets/T7.md) | MH4 |
| T8 | API: Reporte vehículo (consumo, costes) | [T8.md](tickets/T8.md) | MH5 |

## Frontend (T9–T13)

| ID | Título | Archivo | Historia(s) |
|----|--------|---------|-------------|
| T9 | Frontend: Login y guardado de API key | [T9.md](tickets/T9.md) | MH1 |
| T10 | Frontend: Dashboard y listado vehículos | [T10.md](tickets/T10.md) | MH2 |
| T11 | Frontend: Detalle vehículo y formulario repostaje | [T11.md](tickets/T11.md) | MH2, MH3 |
| T12 | Frontend: Formulario mantenimiento | [T12.md](tickets/T12.md) | MH4 |
| T13 | Frontend: Historial e informe vehículo | [T13.md](tickets/T13.md) | MH5 |

## Opcionales (T14–T15)

| ID | Título | Archivo | Historia(s) |
|----|--------|---------|-------------|
| T14 | Notificaciones en app y push (opcional) | [T14.md](tickets/T14.md) | SH1 |
| T15 | Gasolineras cercanas en repostaje (opcional) | [T15.md](tickets/T15.md) | SH2 |

---

## Matriz de trazabilidad

Vista visual por historia (Historia → Tickets): [TRACEABILITY.md](TRACEABILITY.md).

| Ticket | MH1 | MH2 | MH3 | MH4 | MH5 | SH1 | SH2 |
|--------|-----|-----|-----|-----|-----|-----|-----|
| T1 | — | — | — | — | — | | |
| T2 | X | | | | | | |
| T3 | X | | | | | | |
| T4 | X | | | | | | |
| T5 | | X | | | | | |
| T6 | | | X | | | | |
| T7 | | | | X | | | |
| T8 | | | | | X | | |
| T9 | X | | | | | | |
| T10 | | X | | | | | |
| T11 | | X | X | | | | |
| T12 | | | | X | | | |
| T13 | | | | | X | | |
| T14 | | | | | | X | |
| T15 | | | | | | | X |

(T1 es base para todo el flujo.)
