# Ticket: TK-023

## Título
BE: Implementar Lógica de Negocio para Obtener y Actualizar Vacante

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend del ATS MVP para: 1) Obtener los detalles de una vacante por su ID. 2) Actualizar los campos de una vacante existente, validando los datos y actualizando la `fecha_actualizacion`.

## User Story Relacionada
US-006: Editar Información de Vacante Existente

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método de servicio para obtener vacante por ID (`getVacancyById(jobId)`). Busca en la BBDD y devuelve la entidad `Vacante` completa o null/error si no existe.
2.  Existe una función/método de servicio para actualizar vacante (`updateVacancy(jobId, dataToUpdate)`).
3.  La función de actualización primero verifica que la vacante con `jobId` exista (usando `getVacancyById`). Si no, lanza error 404.
4.  Valida los datos en `dataToUpdate` (ej. campos obligatorios no vacíos si se incluyen). Si falla, lanza error 400.
5.  Actualiza los campos correspondientes del registro `Vacante` en la BBDD.
6.  Actualiza automáticamente el campo `fecha_actualizacion` de la vacante.
7.  Devuelve la entidad `Vacante` actualizada o lanza excepción en caso de error de BBDD.

## Solución Técnica Propuesta (Opcional)
Implementar en la capa de Servicios/Casos de Uso. Usar ORM para buscar y actualizar.

## Dependencias Técnicas (Directas)
* TK-016 (Esquema BBDD `Vacante`)
* TK-021 (Endpoint API que invoca la obtención)
* TK-022 (Endpoint API que invoca la actualización)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-006)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica de servicio get/update, validaciones, operaciones SELECT/UPDATE BBDD]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, vacancy, job, update, read

## Comentarios
Separar la lógica de obtención y actualización en métodos distintos dentro del servicio.

## Enlaces o Referencias
[Documentación ORM]