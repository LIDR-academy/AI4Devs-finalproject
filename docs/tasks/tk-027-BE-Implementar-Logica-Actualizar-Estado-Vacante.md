# Ticket: TK-027

## Título
BE: Implementar Lógica de Negocio para Actualizar Estado de Vacante

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend para manejar la actualización del estado de una vacante. Debe validar que la transición de estado solicitada sea permitida (ej. BORRADOR -> PUBLICADA, PUBLICADA -> CERRADA), actualizar el campo `estado` en la BBDD, y actualizar las fechas relevantes (`fecha_publicacion`, `fecha_cierre`) si aplica.

## User Story Relacionada
US-007: Publicar y Despublicar una Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe el `jobId` y el `nuevoEstado` deseado.
2.  Recupera la vacante actual por `jobId`. Si no existe, lanza error 404.
3.  Valida la transición del `estadoActual` al `nuevoEstado` según reglas predefinidas (ej. máquina de estados simple: Borrador -> Publicada; Publicada -> Cerrada; Cerrada -> Publicada (Reabrir); Cerrada -> Archivada). Si no es válida, lanza error 400/409.
4.  Si la transición es válida, actualiza el campo `estado` de la vacante en la BBDD.
5.  Si la transición es a 'PUBLICADA' y `fecha_publicacion` es null, actualiza `fecha_publicacion` a la fecha/hora actual.
6.  Si la transición es a 'CERRADA', actualiza `fecha_cierre` a la fecha/hora actual.
7.  Actualiza `fecha_actualizacion`.
8.  Guarda los cambios en la BBDD.
9.  Devuelve la entidad `Vacante` actualizada.

## Solución Técnica Propuesta (Opcional)
Implementar una máquina de estados simple o una lógica condicional clara para validar las transiciones.

## Dependencias Técnicas (Directas)
* TK-016 (Esquema BBDD `Vacante` con `estado`, `fecha_publicacion`, `fecha_cierre`)
* TK-026 (Endpoint API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-007)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica de servicio, máquina de estados, lógica fechas, operación UPDATE BBDD]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, vacancy, job, status, state-machine

## Comentarios
Definir claramente los estados válidos y las transiciones permitidas. Estados sugeridos: BORRADOR, PUBLICADA, CERRADA, ARCHIVADA.

## Enlaces o Referencias
[Documentación ORM]