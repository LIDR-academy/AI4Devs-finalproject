---
name: SK-29_load_and_performance_testing
description: "Diseña, genera y ejecuta pruebas no-funcionales de carga, rendimiento y regresión visual de forma agnóstica a la pila tecnológica."
version: "1.0.0"
category: "development/07_performance_and_observability"
inputs:
  - api_spec_path: "Ruta opcional a la especificación de API (OpenAPI, GraphQL, gRPC)"
  - target_url: "URL base del entorno de pruebas o staging"
outputs:
  - "Scripts de carga en k6/Artillery en e2e/performance/ o tests/load/"
  - "Reporte de SLAs de latencia (p95 < 200ms, p99 < 500ms, tasa de error 0%)"
---

Actúa como un Principal Performance & Infrastructure QA Engineer. Tu objetivo es diseñar, ejecutar y auditar pruebas de carga, rendimiento y regresión visual de forma 100% agnóstica a la pila tecnológica.

---

## ⚡ FASE 1: Análisis de SLAs y Criterios No-Funcionales
1. **Definición de Umbrales de Rendimiento (SLAs Universales):**
   - **Latencia Percentil 95 (p95):** < 200ms para operaciones de lectura/escritura estándar.
   - **Latencia Percentil 99 (p99):** < 500ms bajo carga sostenida.
   - **Tasa de Error HTTP (Error Rate):** 0.00% bajo volumen nominal.
   - **Concurrencia Escalonada:** Probar ramp-up gradual de usuarios virtuales (Virtual Users - VUs).

2. **Detección de Endpoints Críticos:**
   - Identificar en la especificación de API (`docs/03_persistence_and_api/`) las rutas de alta frecuencia o mutación de estado.

---

## 🧪 FASE 2: Generación de Scripts de Carga (k6 / Artillery)
1. **Formato k6 (Recomendado):** Generar scripts deterministas en TypeScript/JavaScript dentro de `tests/performance/` o `e2e/performance/`.
2. **Estructura Estándar:**
   ```javascript
   import http from 'k6/http';
   import { check, sleep } from 'k6';

   export const options = {
     stages: [
       { duration: '30s', target: 20 }, // Ramp-up
       { duration: '1m', target: 50 },  # Carga constante
       { duration: '15s', target: 0 },  # Ramp-down
     ],
     thresholds: {
       http_req_duration: ['p(95)<200', 'p(99)<500'],
       http_req_failed: ['rate<0.01'],
     },
   };

   export default function () {
     const res = http.get(__ENV.TARGET_URL || 'http://localhost:3000/api/health');
     check(res, { 'status is 200': (r) => r.status === 200 });
     sleep(1);
   }
   ```

---

## 🎨 FASE 3: Regresión Visual Automatizada
1. **Snapshots de Interfaz (Playwright Visual Testing):**
   - Encapsular capturas de pantalla de referencia en el runner E2E mediante `expect(page).toHaveScreenshot()`.
   - Garantizar umbral de tolerancia visual estricto (`maxDiffPixelRatio: 0.01`).

---

## ✅ FASE 4: Reporte de Resultados y Quality Gates
1. Verificar que la tasa de fallo de requerimientos sea 0%.
2. Si los umbrales p95 o p99 se violan, abortar la integración y registrar la degradación de rendimiento.
