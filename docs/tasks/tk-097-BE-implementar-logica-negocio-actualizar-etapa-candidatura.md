# Ticket: TK-097

## Título
BE: Implementar Lógica de Negocio Actualizar Etapa Candidatura (Validar, Actualizar, Historizar)

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend para manejar la actualización de la etapa de una candidatura. Debe: 1) Validar que la candidatura y la nueva etapa existan. 2) Actualizar el campo `etapa_pipeline_actual_id` en la `Candidatura`. 3) Crear un registro en `HistorialEtapa`. Todo dentro de una transacción.

## User Story Relacionada
US-031: Mover Candidato entre Etapas del Pipeline

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe `applicationId`, `newStageId`, `userId`.
2.  Inicia una transacción de base de datos.
3.  Verifica que la `Candidatura` con `applicationId` existe. Si no, lanza error 404.
4.  Verifica que la `EtapaPipeline` con `newStageId` existe. Si no, lanza error 400.
5.  Actualiza `etapa_pipeline_actual_id = newStageId` y `fecha_ultimo_cambio_etapa = now()` en el registro de `Candidatura`.
6.  Crea un nuevo registro en `HistorialEtapa` con `candidatura_id = applicationId`, `etapa_id = newStageId`, `fecha_cambio = now()`, `usuario_id = userId`.
7.  Confirma (commit) la transacción.
8.  Si alguna operación falla, realiza rollback de la transacción y lanza la excepción apropiada.
9.  Devuelve la entidad `Candidatura` actualizada (o void si se prefiere).

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM y su manejo de transacciones.

## Dependencias Técnicas (Directas)
* Esquemas BBDD: `Candidatura`, `EtapaPipeline`, `HistorialEtapa` (TK-016, TK-011, y definiciones de TK-044).
* TK-096 (Endpoint API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-031)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica de servicio, validaciones BBDD, operaciones UPDATE/INSERT, manejo transacciones]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, stage, update, history, transaction

## Comentarios
La transaccionalidad es importante para mantener la consistencia entre Candidatura e HistorialEtapa. Necesita definir el esquema `HistorialEtapa`.

## Enlaces o Referencias
[Documentación ORM sobre Transacciones]