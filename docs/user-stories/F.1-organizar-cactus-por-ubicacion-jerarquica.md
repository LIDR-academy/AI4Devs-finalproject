# F.1 - Organizar cactus por ubicación jerárquica

**Estado:** Fuera de alcance del MVP / Roadmap

## Historia

**Como** propietario de una colección grande
**Quiero** organizar mis cactus mediante una jerarquía de ubicaciones (vivero > zona > bandeja)
**Para** gestionar conjuntamente las plantas de una misma zona en lugar de un campo de texto plano.

## Notas

* El MVP ya tiene un catálogo plano `Location` (ver [0.9](0.9-registrar-localizacion.md)). Esta historia consistiría en darle jerarquía (p. ej. un `parentId` opcional en `Location`) en lugar de crear una entidad nueva desde cero.
* Es un prerrequisito natural para [F.2](F.2-registrar-cuidados-por-lote.md) (cuidados por lote).
