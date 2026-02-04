# Módulo de Seguimiento Postoperatorio y Alta Médica

Seguimiento postoperatorio con evolución diaria, alertas de complicaciones y generación de plan de alta.

## Entidades

- **PostopEvolution**: Evolución diaria (fecha, notas clínicas, signos vitales, complicaciones, medicación).
- **DischargePlan**: Plan de alta por cirugía (resumen, instrucciones, medicación al alta, citas de seguimiento).

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/followup/evolutions` | Registrar evolución |
| GET | `/followup/evolutions/surgery/:surgeryId` | Listar evoluciones |
| GET | `/followup/evolutions/surgery/:surgeryId/complications` | Alertas de complicaciones |
| GET | `/followup/discharge-plan/:surgeryId` | Obtener plan de alta |
| GET | `/followup/discharge-plan/:surgeryId/pdf` | Descargar plan de alta en PDF |
| PUT | `/followup/discharge-plan/:surgeryId` | Crear/actualizar plan de alta |
| POST | `/followup/discharge-plan/:surgeryId/finalize` | Finalizar plan |
| POST | `/followup/discharge-plan/:surgeryId/generate` | Generar plan desde cirugía |

## Criterios de alertas de complicaciones

- **Qué se considera alerta**: Cualquier evolución postoperatoria con el campo `hasComplications = true`.
- **Dónde se registra**: Al crear/editar una evolución (`POST /followup/evolutions`), el cliente puede enviar `hasComplications: true` y opcionalmente `complicationsNotes` con el detalle.
- **Consulta de alertas**: `GET /followup/evolutions/surgery/:surgeryId/complications` devuelve solo las evoluciones con `hasComplications = true`, ordenadas por fecha de evolución descendente.
- **Uso en UI**: El frontend muestra un banner de aviso cuando hay al menos una evolución con complicaciones y, en la lista de evoluciones, cada una con complicaciones lleva borde destacado y etiqueta "Complicación"; si existe `complicationsNotes`, se muestra el texto.

No se generan alertas automáticas por umbrales (p. ej. fiebre >38°C); las alertas son explícitas según el criterio clínico del usuario al marcar "Presenta complicaciones" en la evolución.

**Criterios concretos (Ticket 8)**: Ver [ALERTAS-CRITERIOS.md](./ALERTAS-CRITERIOS.md) en este módulo.

## Frontend

- Ruta: `/followup/surgeries/:surgeryId`
- Acceso desde detalle de cirugía: botón "Seguimiento / Alta".
- Pestañas: Evolución diaria (listado + formulario nueva evolución) y Plan de alta (ver/generar/finalizar/descargar PDF).

## Exportación PDF

El plan de alta se puede descargar en PDF desde el endpoint `GET /followup/discharge-plan/:surgeryId/pdf`. El servicio `PdfGeneratorService` (pdfkit) genera un documento con datos del paciente, procedimiento, resumen, instrucciones, medicación al alta y citas de seguimiento.
