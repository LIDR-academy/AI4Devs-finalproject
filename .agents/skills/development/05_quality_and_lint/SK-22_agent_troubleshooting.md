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
   - **Error de Tipos / Compilación (ej. faltantes de módulos, inconsistencias de tipos/interfaces):** Módulos o declaraciones desactualizadas.
   - **Error de Persistencia / Migración de BD (ej. locks de migración, esquemas desalineados):** Tablas desincronizadas o clientes ORM no generados.
   - **Error de Dependencias o Monorepo:** Módulo compartido no construido o faltante en el árbol del paquete.

---

## 🛠️ FASE 2: Algoritmo de Autorrecuperación

### Caso A: Fallo de Compilación en Monorepo / Módulos Compartidos
1. **Acción:** Recompilar todos los paquetes del monorepo en orden de dependencia usando el comando de `build` declarado en `AGENTS.md`.

### Caso B: Desincronización de Base de Datos o Esquema ORM
1. **Acción:** Regenerar el cliente del ORM y forzar la sincronización del esquema local según los comandos oficiales declarados en `AGENTS.md` (ej. generación de cliente ORM o sincronización de esquema local de desarrollo).

### Caso C: Choque de Tipos o Caché de Build/Linter
1. **Acción:** Limpiar la caché de compilación y artefactos generados (carpetas de salida del compilador ej. `dist/`, `build/`, `.cache/`, artefactos del framework) e invocar el comprobador de tipos u orden de `build` oficial de `AGENTS.md`.

---

## 🚨 FASE 3: Verificación de Recuperación
1. **Confirmar Corrección:** Ejecutar nuevamente el comando que había fallado inicialmente.
2. **Validar Calidad:** Ejecutar los comandos oficiales de `test` y `lint` declarados en `AGENTS.md` para asegurar 0 errores y 0 regresiones.
