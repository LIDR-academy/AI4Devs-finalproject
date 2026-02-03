# Historias de usuario — Flotiko

Índice de las historias de usuario del MVP. Cada historia está en un archivo individual.

## Must-Have (flujo E2E prioritario)

| ID | Historia (resumida) | Archivo |
|----|---------------------|---------|
| MH1 | Login y acceso a la app | [MH1.md](historias-usuario/MH1.md) |
| MH2 | Listado de vehículos y detalle | [MH2.md](historias-usuario/MH2.md) |
| MH3 | Registrar repostaje | [MH3.md](historias-usuario/MH3.md) |
| MH4 | Registrar mantenimiento | [MH4.md](historias-usuario/MH4.md) |
| MH5 | Historial e informe del vehículo | [MH5.md](historias-usuario/MH5.md) |

## Should-Have (opcionales)

| ID | Historia (resumida) | Archivo |
|----|---------------------|---------|
| SH1 | Notificaciones (mantenimientos, ITV, seguros) | [SH1.md](historias-usuario/SH1.md) |
| SH2 | Gasolineras cercanas al repostar | [SH2.md](historias-usuario/SH2.md) |

## Resumen y priorización

| ID | Prioridad | Dependencias |
|----|-----------|--------------|
| MH1 | Must-Have | — |
| MH2 | Must-Have | MH1 |
| MH3 | Must-Have | MH1, MH2 |
| MH4 | Must-Have | MH1, MH2 |
| MH5 | Must-Have | MH1, MH2 (MH3 para informe útil) |
| SH1 | Should-Have | MH1 |
| SH2 | Should-Have | MH1, MH3 |

Orden sugerido de implementación del flujo E2E: **MH1 → MH2 → MH3 → MH4 → MH5**; después **SH1** y **SH2** según capacidad.
