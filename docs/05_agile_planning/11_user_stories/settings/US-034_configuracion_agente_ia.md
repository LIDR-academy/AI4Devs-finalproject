---
user_story: US-034
title: Panel de Configuración de Agentes IA
epic: Configuración y Gobernanza del Sistema
status: approved
---

# 📖 Historia de Usuario: US-034 — Panel de Configuración de Agentes IA

## 👤 Rol del Usuario
Como administrador del restaurante (ADMIN),

## 🎯 Objetivo / Valor de Negocio
Quiero disponer de una pantalla de configuración centralizada en `/ajustes/ia` para seleccionar el proveedor de IA (Google Gemini, OpenAI / Ollama local o Motor Heurístico interno), configurar credenciales de forma segura cifradas en base de datos, verificar la conectividad mediante una prueba de ping y activar o desactivar módulos de IA, con el fin de gobernar de forma transparente y predecible los costos, la privacidad y la disponibilidad de los modelos inteligentes en la cocina.

## 📌 Justificación (Gap Analysis)
RestoStock no disponía hasta ahora de un mecanismo administrable para configurar modelos de lenguaje o agentes inteligentes en la interfaz táctil. Para evitar el hardcoding de credenciales o URLs de proveedores (violación de Guard 14 y Guard 24), este panel permite al dueño o encargado del restaurante alternar entre proveedores en la nube y motores locales offline sin necesidad de reiniciar el contenedor ni editar archivos `.env`.

## 🗣️ Decisiones de Negocio Consultadas con el Humano (Guard 28)
*   **Pregunta 1:** ¿Cómo se almacenan y gestionan las API Keys?
*   **Respuesta:** En base de datos cifradas simétricamente con AES-256-GCM. La API nunca devuelve la clave en texto claro (responde `hasApiKey: true`). Se permite además fallback a variable de entorno `AI_API_KEY` en el backend si el campo en base de datos no está configurado.
*   **Pregunta 2:** ¿Qué conectores se soportan?
*   **Respuesta:** Conector HTTP nativo (`fetch` de Node 24) compatible con la API de Google Gemini, endpoints compatibles con OpenAI / Ollama local en la red del restaurante, y el Motor Heurístico determinista propio.
*   **Pregunta 3:** ¿Quién tiene acceso a esta configuración?
*   **Respuesta:** Exclusivamente el rol `ADMIN`. Operarios y cocineros son redirigidos si intentan ingresar a la ruta.
*   **Pregunta 4:** ¿Qué control de temperatura y límites se aplican?
*   **Respuesta:** Determinismo obligatorio por Guard 9 (`temperature` con valor por defecto 0.0 y cota máxima <= 0.2).

---

## 🥒 Criterios de Aceptación (BDD - Sintaxis Gherkin)

### Escenario 1 (Control de Acceso): Ruta Restringida a ADMIN
- **Given** Un operario autenticado con rol `OPERATOR` o `STAFF` (distinto de `ADMIN`).
- **When** Intenta navegar a la ruta `/ajustes/ia` o invocar `GET /api/v1/settings/ai`.
- **Then** En frontend es redirigido a `/inventario` y en backend la API responde `403 Forbidden`.

### Escenario 2: Guardado de Configuración con API Key Cifrada
- **Given** Un administrador autenticado en `/ajustes/ia`.
- **When** Selecciona el proveedor `GEMINI`, modelo `gemini-2.5-flash`, ingresa su clave de API y pulsa "Guardar Configuración".
- **Then** El sistema valida el esquema con Zod, cifra la clave con AES-256-GCM antes de persistir, actualiza el registro en `ai_configurations` y devuelve un estado `200 OK` con `{ hasApiKey: true }` sin exponer la clave en texto plano.

### Escenario 3: Diagnóstico de Conectividad (Ping Test)
- **Given** Un administrador en `/ajustes/ia` con proveedor `HEURISTIC` o un proveedor remoto configurado.
- **When** Pulsa el botón "Probar Conexión".
- **Then** El sistema ejecuta un diagnóstico rápido a través del gateway (`POST /api/v1/settings/ai/test`) y muestra en la interfaz un badge verde de estado exitoso indicando la latencia en milisegundos.

---

## 🔗 Referencias
*   PRD: [`docs/01_product_definition/02_prd.md`](../../../01_product_definition/02_prd.md) §5 (US-034)
*   Manifiesto: [`docs/00_stack_manifest.md`](../../../00_stack_manifest.md) §2 (Conector IA y Cifrado)
*   Esquema: [`docs/03_persistence_and_api/06_database_schema.md`](../../../03_persistence_and_api/06_database_schema.md) — `AiConfiguration`
*   Tickets: [`TK-123`](../../12_tickets/settings/backend/TK-123.md) (Backend) | [`TK-123-FE`](../../12_tickets/settings/frontend/TK-123-FE.md) (Frontend)
