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

1. **Restricción de Nomenclatura:** Toda tabla nueva debe ser nombrada en minúsculas, plural y snake_case.
2. **Claves Primarias y Foráneas:** Las claves primarias deben ser `id` y las claves foráneas deben ser `singular_table_name_id`.
3. **No-Destructive Changes:** Jamás generar una migración de base de datos que borre (DROP) tablas o columnas existentes sin un plan de transición documentado.
4. **Tipos de Datos Consistentes:** Utilizar tipos de datos estándar y consistentes para las claves foráneas que coincidan exactamente con la clave primaria referenciada.
5. **No Credenciales:** Queda estrictamente prohibido incluir contraseñas, tokens o secretos en texto plano en cualquier script SQL.
6. **Políticas de Cascade:** Toda clave foránea debe definir explícitamente su comportamiento ante borrados (`ON DELETE RESTRICT` o `ON DELETE CASCADE`).
7. **Idempotencia Completa:** Todo script de migración debe poder ejecutarse múltiples veces sin lanzar errores (uso de `IF NOT EXISTS` / `IF EXISTS`).
8. **Índices en Claves Foráneas:** Cada clave foránea declarada debe poseer un índice explícito asociado para optimizar las operaciones de JOIN.
9. **Campos de Auditoría:** Todas las tablas de negocio deben incluir columnas `created_at` y `updated_at` con tipos de zona horaria adecuados (UTC).
10. **Límites de Tamaño:** Todos los campos de texto variable (`VARCHAR`/`TEXT`) deben poseer un límite máximo explícito definido y justificado.
11. **Valores por Defecto:** Los valores por defecto no deben invocar funciones dinámicas no estándar que comprometan la portabilidad del motor de BD.
12. **Restricciones de Unicidad:** Toda restricción de unicidad (`UNIQUE`) debe incluir un índice único nombrado de manera explícita con el prefijo `uq_`.
13. **Procedimiento de Autoverificación - Nombres:** Verificar mediante expresión regular que todas las tablas y columnas cumplen con snake_case.
14. **Procedimiento de Autoverificación - Idempotencia:** Validar sintácticamente que no hay declaraciones `CREATE` o `ALTER` sin su correspondiente guardia condicional.
15. **Procedimiento de Autoverificación - Plan de Regresión:** Comprobar que existe un script de rollback para cada migración propuesta.
16. **Procedimiento de Autoverificación - Normalización:** Confirmar que no hay dependencias transitivas redundantes (cumplimiento de 3NF).
17. **Procedimiento de Autoverificación - Seguridad:** Escanear los scripts SQL buscando credenciales hardcodeadas o patrones de inyección SQL.
18. **Procedimiento de Autoverificación - Índices:** Revisar el plan de ejecución teórico para asegurar que los queries frecuentes usan índices.
19. **Procedimiento de Autoverificación - Documentación:** Asegurar que el diagrama ER (`docs/db/schema.md`) está sincronizado con el código SQL.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
