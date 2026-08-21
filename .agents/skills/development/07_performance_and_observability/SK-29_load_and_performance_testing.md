---
name: SK-29_load_and_performance_testing
description: "Diseña, genera y ejecuta pruebas no-funcionales de carga y rendimiento de forma agnóstica a la pila tecnológica. La regresión visual vive en SK-21 (development/06_visual_qa), no aquí — evita duplicación entre skills con responsabilidades distintas."
version: "1.1.0"
category: "development/07_performance_and_observability"
inputs:
  - api_spec_path: "Ruta opcional a la especificación de API (OpenAPI, GraphQL, gRPC)"
  - target_url: "URL base del entorno de pruebas o staging — si no se pasa, se infiere de docs/00_stack_manifest.md §7 (Guard 24)"
outputs:
  - "Scripts de carga en k6/Artillery en e2e/performance/ o tests/load/"
  - "Reporte de SLAs de latencia (p95 < 200ms, p99 < 500ms, tasa de error 0%)"
---

Actúa como un Principal Performance & Infrastructure QA Engineer. Tu objetivo es diseñar, ejecutar y auditar pruebas de carga y rendimiento de forma 100% agnóstica a la pila tecnológica.

---

## 🌐 FASE 0 OBLIGATORIA (Guard 24): Descubrimiento de `target_url`
1. Si `target_url` no fue pasado explícitamente, lee `docs/00_stack_manifest.md` §7 ("URLs de Desarrollo Local") para obtener la URL del entorno a probar (Backend Dev Server, o la URL de staging si está declarada).
2. Si el manifiesto no declara ninguna URL utilizable, **DETENTE** y pregunta al humano — nunca generes un script de carga apuntando a un host/puerto/ruta asumidos (ej. `localhost:3000/api/health`) como si fueran universales a cualquier proyecto que instale `.agents/`. Mismo criterio ya establecido en `workflows/08_smoke_test_deploy_validation.md` y `SK-21`.

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
     // TARGET_URL debe venir de la URL descubierta en FASE 0 (docs/00_stack_manifest.md) —
     // nunca un host/puerto hardcodeado a mano aquí, cambia por proyecto.
     const res = http.get(__ENV.TARGET_URL);
     check(res, { 'status is 200': (r) => r.status === 200 });
     sleep(1);
   }
   ```

---

## ✅ FASE 3: Reporte de Resultados y Quality Gates
1. Verificar que la tasa de fallo de requerimientos sea 0%.
2. Si los umbrales p95 o p99 se violan, abortar la integración y registrar la degradación de rendimiento.
