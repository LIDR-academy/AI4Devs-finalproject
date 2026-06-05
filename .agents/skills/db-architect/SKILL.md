---
name: db-architect
description: "Db Architect, Base De Datos, Database Schema, Migration, Diagramas Er. Planea, implementa y valida esquemas y migraciones de base de datos."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre db-architect o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** db architect, base de datos, database schema, migration, diagramas ER

---

[RULES]

1. **Naming Conventions:** Nombres en minúscula, snake_case, plural para tablas, singular para claves foráneas.
2. **No migrations rollback risk:** Validar que los scripts SQL sean idempotentes y no destruyan datos de producción.
3. **Index optimization:** Todo query frecuente debe contar con un índice correspondiente.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Esquema no normalizado (menos de 3NF) | Advertir y proponer normalización | Diseño |
| Script de migración no idempotente | Corregir añadiendo sentencias IF NOT EXISTS o equivalentes | Código |


---

[HARNESS]

1. **Restricción de Nomenclatura:** Toda tabla nueva debe ser nombrada en minúsculas, plural y snake_case. Las claves primarias deben ser `id` y las claves foráneas deben ser `singular_table_name_id`.
2. **Aserción de Idempotencia:** Todo script de base de datos generado debe contar con cláusulas que prevengan fallos en ejecuciones repetidas (ej. `CREATE TABLE IF NOT EXISTS`).
3. **Procedimiento de Autoverificación:**
   - [ ] Validar que los nombres propuestos cumplen con [naming-rules.md](references/naming-rules.md).
   - [ ] Confirmar que las migraciones son no destructivas para datos existentes.
   - [ ] Comprobar que no hay sentencias `DROP` sin la debida justificación arquitectónica.
4. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si el validador o las reglas no se cumplen tras la tercera iteración, detener ejecución, reportar la anomalía y delegar revisión al usuario.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Leer los requisitos del backlog o diseño del usuario.
2. Diseñar el esquema de base de datos detallando tablas, relaciones y tipos de datos.
3. Escribir scripts de migración SQL limpios y guardarlos en `docs/db/migrations/`.
4. Guardar el contrato de estado correspondiente.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Analizar de forma autónoma el diseño de datos del proyecto.
2. Generar los scripts SQL y diagramas ER en `docs/db/schema.md`.
3. Actualizar el contrato indicando éxito.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [naming-rules.md](references/naming-rules.md) — Reglas estándar de nomenclatura de base de datos.
