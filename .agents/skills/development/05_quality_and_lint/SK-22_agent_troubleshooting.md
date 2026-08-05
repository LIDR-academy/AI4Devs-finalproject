---
name: SK-22_agent_troubleshooting
description: "Guía procedimental de autorrecuperación para diagnosticar y resolver fallos de compilación, bloqueos de migraciones o errores de dependencias de forma agnóstica."
version: "1.0.0"
category: "development/05_quality_and_lint"
inputs:
  - error_log: "Mensaje o traza de error de compilación/ejecución"
outputs:
  - "Diagnóstico de la causa raíz del fallo"
  - "Acción de autorrecuperación ejecutada con éxito"
  - "Estado del entorno restaurado y suite de pruebas en verde"
---

Actúa como un DevOps & Infrastructure Troubleshooting Specialist. Tu objetivo es diagnosticar la causa raíz del error presentado en `error_log` y aplicar el algoritmo de autorrecuperación correspondiente sin desconfigurar el entorno del proyecto.

Sigue estrictamente este árbol de decisión procedimental:

---

## 🔍 FASE 1: Clasificación del Error
1. **Identificar la Naturaleza del Error:**
   - **Error de Tipos / Compilación (ej. TS2307, TS2339):** Fallo en interfaces o módulos desactualizados.
   - **Error de Migración de BD (ej. Prisma P3009, lock de migración):** Tablas desincronizadas o migraciones fallidas.
   - **Error de Dependencias (ej. Module Not Found):** Paquete de monorepo no construido.

---

## 🛠️ FASE 2: Algoritmo de Autorrecuperación

### Caso A: Fallo de Compilación en Monorepo / Módulos Compartidos
1. **Acción:** Recompilar todos los paquetes del monorepo en orden de dependencia:
   - Ejecutar `pnpm run build` desde la raíz del proyecto para regenerar las declaraciones `.d.ts` de librerías compartidas.

### Caso B: Desincronización de Base de Datos o Prisma Schema
1. **Acción:** Regenerar el cliente del ORM y forzar la sincronización del esquema local:
   - Ejecutar `pnpm --filter @restostock/backend exec prisma generate`.
   - Si la BD local está corrupta en entorno dev efímero, ejecutar `pnpm --filter @restostock/backend exec prisma db push --skip-generate`.

### Caso C: Choque de Tipos o Caché del Linter
1. **Acción:** Limpiar la caché de compilación:
   - Eliminar carpetas `dist/`, `.next/`, `node_modules/.cache` e invocar el comprobador de tipos `pnpm run build`.

---

## 🚨 FASE 3: Verificación de Recuperación
1. **Confirmar Corrección:** Ejecutar nuevamente el comando que había fallado inicialmente.
2. **Validar Calidad:** Ejecutar `pnpm run test` y `pnpm run lint` para asegurar 0 errores y 0 regresiones.
