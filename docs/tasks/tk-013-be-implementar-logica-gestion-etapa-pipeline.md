# Ticket: TK-013

## Título
BE: Implementar Lógica de Negocio para Gestión de Etapas de Pipeline

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend del ATS MVP para manejar las operaciones CRUD y de reordenamiento de las etapas del pipeline, invocadas por los endpoints API (TK-012). Incluye validaciones (nombre no vacío), interacción con BBDD (TK-011), lógica para asignar `orden` al crear/reordenar, y validación para borrado seguro.

## User Story Relacionada
US-002: Gestionar Etapas del Pipeline de Selección

## Criterios de Aceptación Técnicos (Verificables)
1.  Al crear una etapa: Se asigna automáticamente el siguiente valor disponible en el campo `orden`. Se guarda el registro.
2.  Al actualizar nombre/flag: Se valida que el `stageId` exista. Se actualizan los campos correspondientes.
3.  Al reordenar (recibiendo array de IDs ordenados): Se actualiza el campo `orden` de todos los registros `EtapaPipeline` para reflejar la nueva secuencia (orden = index en el array + 1). La operación debe ser atómica si es posible.
4.  Al eliminar una etapa:
    * Se valida que el `stageId` exista.
    * Se verifica que ninguna `Candidatura` tenga esa etapa como `etapa_pipeline_actual_id`. Si existe alguna, devuelve error (ej. 409 Conflict).
    * Se verifica que la etapa no esté configurada como `etapa_pre_aceptacion` o `etapa_pre_rechazo` en ninguna `DescripcionPuestoGenerada` (requiere consultar Core AI o tener una copia/referencia). Si lo está, devuelve error.
    * Si las validaciones pasan, se elimina el registro de la BBDD.
5.  Al listar etapas: Se devuelven ordenadas por el campo `orden`.

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios/Casos de Uso. Usar ORM. La validación de borrado puede ser compleja si implica llamadas entre servicios (ATS a Core AI); considerar alternativas si es problemático para MVP (ej. borrado lógico, o impedir marcar etapas en uso como eliminables). *Decisión inicial: Para MVP, solo validar contra tabla `Candidatura` del ATS.*

## Dependencias Técnicas (Directas)
* TK-011 (Esquema BBDD `EtapaPipeline`)
* TK-012 (Endpoints API que invocan esta lógica)
* (Potencial) API Core AI si se valida contra `DescripcionPuestoGenerada` - *Simplificado para MVP*

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-002)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Lógica CRUD, lógica reordenamiento, lógica validación borrado (simplificada), interacción BBDD]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, pipeline, stage, crud, validation, reorder

## Comentarios
La lógica de reordenamiento y la validación de borrado son los puntos clave. Simplificar validación de borrado para MVP es aceptable.

## Enlaces o Referencias
[Documentación ORM]