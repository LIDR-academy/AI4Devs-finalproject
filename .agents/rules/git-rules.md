# 🐙 Reglas de Git, Flujo de Trabajo y Pull Requests (Git Rules)

Esta regla define los estándares de control de versiones, nomenclatura y formato para RestoStock.

---

## 💬 1. Mensajes de Commit (Conventional Commits)
Los commits deben seguir estrictamente el estándar de Conventional Commits con la estructura: `<tipo>(<alcance>): <descripción_breve_en_minúsculas>`

### Tipos Permitidos:
*   `feat`: Nueva funcionalidad de código.
*   `fix`: Corrección de un bug.
*   `docs`: Cambios exclusivos en documentación o especificaciones.
*   `refactor`: Cambios de código que no corrigen bugs ni añaden funcionalidades (ej: renombrados, simplificación).
*   `test`: Añadir o modificar suites de pruebas.
*   `chore`: Tareas de mantenimiento, configuración de compilación o dependencias.

---

## 🌿 2. Ramas de Trabajo y Entregas
*   **Formatos de Rama Obligatorios (LIDR):** Las ramas del proyecto se deben estructurar según la fase de la entrega:
    *   **Entrega 1 (Especificaciones):** `feature-entrega1-[iniciales]` (Ej: `feature-entrega1-JDLM`).
    *   **Entrega 2 (Código Funcional):** `feature-entrega2-[iniciales]` (Ej: `feature-entrega2-JDLM`).
    *   **Entrega Final:** `finalproject-[iniciales]` (Ej: `finalproject-JDLM`).
*   **Restricción del Agente de IA:** El agente de IA **nunca** debe crear, renombrar o eliminar ramas de Git de forma autónoma. La creación y el cambio (`checkout`) de ramas es una tarea de control reservada exclusivamente para el desarrollador humano.
*   **Limpieza de Conflictos:** Antes de abrir un Pull Request, la rama de funcionalidad debe estar sincronizada y sin conflictos con `main`.


---

## 🔄 3. Quality Gates de Pull Requests (DoD)
Antes de fusionar (merge) cualquier código a `main`, el Pull Request debe cumplir:
1.  **Pipeline CI en Verde:** El pipeline de GitHub Actions (`ci.yml`) debe completarse exitosamente (compilación, lint y tests pasados).
2.  **Traceabilidad Documentada:** El PR debe listar explícitamente el ticket técnico de Agile (`TK-XXX.md`) y la historia de usuario (`US-XXX.md`) que resuelve.
3.  **Auditoría de Specs pasada:** Cualquier cambio de diseño debe haber completado el protocolo de cascada VSDD.
