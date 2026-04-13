# Notas complementarias al modelo de datos

**Contexto:** [readme.md](../../readme.md) (§3 modelo de datos) · [Modelo técnico MongoDB](mongo.md) · [ADR-0002: PK numéricas frente a UUID](../adr/0002-claves-primarias-numericas-frente-a-uuid.md)

## 1. Reglas de negocio consolidadas

| ID | Regla |
|----|--------|
| R1 | Cada **ÁRBOL** referencia **exactamente una ESPECIE**; nombres científico y común de la especie (y contexto de género/familia) provienen de los maestros taxonómicos. |
| R2 | Cada **ÁRBOL** lleva **coordenadas** del ejemplar. |
| R3 | **AUDITORÍA:** toda alta/modificación relevante sobre maestros y fichas operativas deja trazas de auditoría según política (p. ej. **AUDITORIA_CATALOGO** en catálogo; uso de IA acotado en **AUDITORIA_USO_IA**). |
| R4 | **Fotografía – PUBLIC:** visible donde la ficha y el mapa lo permitan, incluido público no autenticado si la ficha es pública. |
| R5 | **Fotografía – PRIVATE:** solo **Administrador** y el **Colaborador** creador. |
| R6 | **Fotografía – RESTRICTED:** **Administrador**, creador y **Colaboradores autenticados**; no el visitante sin sesión. |
| R7 | **NOTIFICACION** a **SUSCRIPTOR** con suscripción válida tras la **alta** (creación) de una ficha de **ÁRBOL**; en el MVP **no** se envía notificación por **modificaciones** posteriores a la ficha (UC-09). |
| R8 | **FAMILIA**, **GÉNERO**, **ESPECIE** y **PROVINCIA:** **gestión** solo **Administrador**; consulta para edición de ficha por roles autenticados según matriz acordada. |
| R9 | **Identificadores persistentes (SQL):** las claves primarias técnicas de las entidades en bases relacionales serán **numéricas autogeneradas** (por ejemplo `BIGINT` con secuencia o columna identidad); no se usará **UUID** como PK en el MVP. Contexto, alternativas y consecuencias: [ADR-0002](../adr/0002-claves-primarias-numericas-frente-a-uuid.md). |

---

## 2. Matriz de visibilidad de fotografías (resumen)

| Categoría | Público (sin login) | Colaborador autenticado | Administrador |
|-----------|---------------------|-------------------------|---------------|
| PUBLIC | Sí, si la ficha/árbol es accesible en contexto público | Sí | Sí |
| RESTRICTED | No | Sí | Sí |
| PRIVATE | No | No (salvo que sea el creador) | Sí |

*El creador de la fotografía siempre puede ver su propia PRIVATE.*

---


## 3. Próximos pasos (fuera de este documento)

- Detallar **máquina de estados** de SUSCRIPTOR y NOTIFICACION.
- Si en el futuro se notificaran **cambios** (no solo alta), actualizar R7, UC-09, [kafka-events.md](../events/kafka-events.md) y el productor de eventos en **catalog-service** de forma coordinada.
