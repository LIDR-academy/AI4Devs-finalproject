# HU-001 — Publicación de inmueble por propietario

## Historia
Como propietario,
quiero publicar mi inmueble con información completa, fotos y disponibilidad real,
para recibir solicitudes de arrendamiento a través de la plataforma sin depender de una agencia ni de procesos presenciales.

## Criterios de aceptación
- [ ] El propietario puede crear una publicación completando un formulario con al menos: dirección, barrio/ciudad, tipo de inmueble, área en m², número de habitaciones, número de baños, valor mensual del arriendo y descripción libre.
- [ ] El formulario permite cargar un mínimo de 1 foto y un máximo definido (a especificar en diseño técnico).
- [ ] El inmueble publicado aparece con estado "Disponible" de forma inmediata tras la publicación exitosa.
- [ ] El propietario puede editar los datos de su inmueble después de publicarlo.
- [ ] El propietario puede despublicar temporalmente un inmueble (ocultarlo de búsquedas) sin eliminarlo.
- [ ] Cuando un arrendamiento se completa exitosamente, el estado del inmueble cambia automáticamente a "No disponible" sin acción manual del propietario.
- [ ] El propietario puede ver el listado de sus inmuebles publicados y su estado actual (Disponible / No disponible / Despublicado).

## Notas técnicas
- El cambio automático de estado a "No disponible" es un evento que se dispara al completarse el flujo de arrendamiento (HU-005 o HU-006 según el punto de cierre del proceso). Requiere coordinación entre módulos.
- El almacenamiento de fotos requiere definir un proveedor de object storage (ej. S3 o equivalente).
- La plataforma es web-first; si se desarrolla versión mobile nativa en fases posteriores, este formulario debe ser revisado para adaptación UX.

## Prioridad
Alta

## Estimación
13 — Gigante (26h)
