# Notas complementarias al modelo de datos

**Contexto:** [readme.md](../../readme.md) (§3 modelo de datos) · [Modelo técnico MongoDB](mongo.md) · [ADR-0002: PK numéricas frente a UUID](../adr/0002-claves-primarias-numericas-frente-a-uuid.md)

## 1. Reglas de negocio consolidadas

| ID | Regla |
|----|--------|
| R1 | Cada **ÁRBOL** referencia **exactamente una ESPECIE**; nombres científico y común de la especie (y contexto de género/familia) provienen de los maestros taxonómicos. |
| R2 | Cada **ÁRBOL** lleva **coordenadas** del ejemplar. |
| R3 | **AUDITORÍA:** toda alta/modificación relevante sobre maestros y fichas operativas deja trazas de auditoría según política (p. ej. **AUDITORIA_CATALOGO** en catálogo; uso de IA acotado en **AUDITORIA_USO_IA**). |
| R4 | **Fotografía – PUBLIC:** visible donde la ficha y el mapa lo permitan, incluido público no autenticado si la ficha es pública. |
| R5 | **Fotografía – PRIVATE:** solo **ADMIN** y el **Colaborador** creador de la fotografía. |
| R7 | **NOTIFICACION** a **SUSCRIPTOR** con suscripción válida tras la **alta** (creación) de una ficha de **ÁRBOL**; en el MVP **no** se envía notificación por **modificaciones** posteriores a la ficha (UC-09). |
| R8 | **FAMILIA**, **GÉNERO**, **ESPECIE** y **PROVINCIA:** **gestión** solo **ADMIN**; consulta para edición de ficha por roles autenticados según matriz acordada. |
| R9 | **Identificadores persistentes (SQL):** las claves primarias técnicas de las entidades en bases relacionales serán **numéricas autogeneradas** (por ejemplo `BIGINT` con secuencia o columna identidad); no se usará **UUID** como PK en el MVP. Contexto, alternativas y consecuencias: [ADR-0002](../adr/0002-claves-primarias-numericas-frente-a-uuid.md). |
| R10 | En alta de **ÁRBOL**, `estado_publicacion` admite solo `BORRADOR` o `PUBLICADO`; `visibilidad_mapa_publico` admite solo `PRIVADO` o `PUBLICO`. |

*R6 no se usa en el MVP (no hay categoría de fotografía intermedia entre PUBLIC y PRIVATE); R7 y siguientes conservan su numeración para no desalinear referencias en otros documentos.*

---
