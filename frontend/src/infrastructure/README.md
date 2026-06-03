# Capa infrastructure

Clientes HTTP y adaptadores a servicios externos.

- **Cliente base:** `httpClient.ts` — wrapper `apiGet<T>()` sobre `fetch('/api' + path)`
- **Adaptadores:** `profileApi.ts` — GET `/api/profile`

Los adaptadores traducen respuestas HTTP a tipos consumibles por la capa application.
