# TSK-3.5: Función Serverless de OCR Nube (Firebase Cloud Function)

- **Historia de Usuario Relacionada:** [US-01: Escaneo OCR Inteligente de Tickets](../epic-1-core/US-01.md)
- **Épica:** Epic 3: Cloud Convenience & Connectivity Flow
- **Capa:** Backend e Integraciones (Serverless)
- **Complejidad:** 5 SP
- **Dependencias:** TSK-3.1

## 1. Descripción de la Tarea
Crear el endpoint seguro en Firebase Cloud Functions que reciba la imagen del ticket en base64 desde la app del cliente, realice la extracción de texto mediante la API de Google Cloud Vision, y retorne los datos parseados de forma legible.

## 2. Detalles de Implementación
1. **Estructura del Handler:**
   * Crear `functions/src/ocr/ocrHandler.ts` en Node.js 20.
   * Consumir credenciales de Google Cloud Vision de forma segura mediante variables de entorno de Firebase Secret Manager.
   * Implementar validación de payloads base64 (limitar tamaño a 5MB).
2. **Lógica del Parser de Servidor:**
   * Invocar la API `/v1/images:annotate` de Google Vision.
   * Aplicar las expresiones regulares estructuradas locales para formatear el JSON que se devolverá al cliente, tal como se define en el contrato `docs/api/integration_contracts.md`.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Ejecutar test de integración local emulando la función con `firebase emulators:start`.
* Comprobar respuesta exitosa (200 OK) con la estructura de datos contractual al enviarle un ticket real de prueba.
* Si el cliente no envía cabecera de autenticación válida, aplicar límite de cuota estricto (rate limit) de 5 peticiones diarias por IP.
