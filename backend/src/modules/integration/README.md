# Módulo de integración (HL7, DICOM, laboratorio, farmacia)

Integración con sistemas externos: Orthanc (DICOM), FHIR (laboratorio), webhook de laboratorio, sync automática y farmacia.

## Servicios

- **OrthancService**: Conexión con Orthanc (PACS). Variables: `ORTHANC_URL`, `ORTHANC_USERNAME`, `ORTHANC_PASSWORD`.
- **HL7Service**: Cliente FHIR para resultados de laboratorio. Variables: `FHIR_SERVER_URL`, `FHIR_CLIENT_ID`, `FHIR_CLIENT_SECRET`.
- **PharmacyService**: Estado y solicitud de medicación. Variable opcional: `PHARMACY_API_URL`.
- **IntegrationSchedulerService**: Sync automática programada (DICOM + laboratorio).

## Webhook laboratorio

`POST /api/v1/integration/webhook/lab` (público, sin JWT).

Recibe resultados de laboratorio desde un sistema externo. Si se define `INTEGRATION_WEBHOOK_SECRET`, el cliente debe enviar el mismo valor en el header `X-Webhook-Secret`.

**Ejemplo de cuerpo:**

```json
{
  "patientId": "uuid-del-paciente",
  "sourceLabId": "LAB-001",
  "observations": [
    {
      "testName": "Glucosa",
      "code": "2345-7",
      "value": 95,
      "unit": "mg/dL",
      "interpretation": "normal",
      "effectiveDateTime": "2026-01-27T10:00:00Z"
    }
  ]
}
```

## Sync automática programada

- **Cron**: Por defecto cada día a las 2:00 AM. Configurable con `INTEGRATION_SYNC_CRON` (expresión cron).
- **Deshabilitar**: `INTEGRATION_SYNC_ENABLED=false`.
- **Lote**: Hasta 50 pacientes actualizados en los últimos 7 días. Configurable con `INTEGRATION_SYNC_BATCH_SIZE` (máx. 200).

La sync llama a Orthanc y FHIR por cada paciente del lote y persiste imágenes y resultados en HCE.

## Farmacia

- `GET /api/v1/integration/pharmacy/status`: Estado del servicio de farmacia.
- `POST /api/v1/integration/pharmacy/request`: Solicitud de medicación (body: `patientId`, `medicationName`, `quantity`, `unit`, `instructions`, `priority`).

Sin `PHARMACY_API_URL` se responde en modo simulado (aceptado con `referenceId` de desarrollo).

## Logging

Todas las operaciones de integración usan el prefijo `[Integration]` y sub-etiquetas: `[DICOM]`, `[FHIR]`, `[Lab:Webhook]`, `[Scheduler]`, `[Pharmacy]`.

## Tests

- `integration.service.spec.ts`: sync DICOM/FHIR, webhook laboratorio, estado.
- `pharmacy.service.spec.ts`: estado y solicitud en modo desarrollo.
