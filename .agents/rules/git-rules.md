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

## 🌿 2. Ramas de Trabajo
*   **Nombre de Ramas:** Las ramas de trabajo deben crearse a partir de `main` con el formato `feature-XXXX` (donde XXXX es el hito o ticket, ej: `feature-entrega1-JDLM`).
*   **Limpieza de Conflictos:** Antes de abrir un Pull Request, la rama de funcionalidad debe estar sincronizada y sin conflictos con `main`.

---

## 🔄 3. Quality Gates de Pull Requests (DoD)
Antes de fusionar (merge) cualquier código a `main`, el Pull Request debe cumplir:
1.  **Pipeline CI en Verde:** El pipeline de GitHub Actions (`ci.yml`) debe completarse exitosamente (compilación, lint y tests pasados).
2.  **Traceabilidad Documentada:** El PR debe listar explícitamente el ticket técnico de Agile (`TK-XXX.md`) y la historia de usuario (`US-XXX.md`) que resuelve.
3.  **Auditoría de Specs pasada:** Cualquier cambio de diseño debe haber completado el protocolo de cascada VSDD.
