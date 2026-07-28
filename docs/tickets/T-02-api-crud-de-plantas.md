# T-02 - API CRUD de plantas

**Área:** Backend
**Historias relacionadas:** [0.1](../user-stories/0.1-registrar-cactus.md), [0.9](../user-stories/0.9-registrar-localizacion.md), [0.10](../user-stories/0.10-etiquetar-cactus-con-tags.md), [0.11](../user-stories/0.11-buscar-cactus-por-tag-o-localizacion.md)

## Descripción

Implementar los endpoints necesarios para crear y consultar plantas, incluyendo la selección de especie y localización, la asignación de tags, y el filtrado del inventario, según Spring Boot 3 (controller → service → repository).

## Alcance

* `POST /plants`: crea una planta (nickname, `locationId`, `speciesId`).
* `GET /plants`: lista el inventario de plantas; admite filtros opcionales `tag` y `location` combinables entre sí.
* `GET /plants/{id}`: obtiene el detalle de una planta, incluyendo los datos heredados de su especie y sus tags.
* `PUT /plants/{id}/tags`: asigna/reemplaza el conjunto de tags de una planta.
* `POST /locations`, `GET /locations`: catálogo de localizaciones.
* `POST /tags`, `GET /tags`: catálogo de tags.
* Validación: la especie y la localización indicadas deben existir; el nickname es obligatorio.

## Criterios de aceptación

* Se puede crear una planta indicando una especie y localización válidas, y consultarla después en el listado.
* Si se indica una especie o localización inexistente, la API devuelve un error controlado (400/404), no un error 500.
* Se pueden asignar tags a una planta y filtrar el listado de plantas por tag y/o localización.
* Los tests de integración cubren el caso de creación, el caso de especie/localización inválida, y el filtrado por tag y localización.
