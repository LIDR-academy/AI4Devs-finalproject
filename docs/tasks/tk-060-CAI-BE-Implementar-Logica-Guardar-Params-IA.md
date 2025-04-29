# Ticket: TK-060

## Título
CAI-BE: Implementar Lógica Core AI para Almacenar Parámetros IA por Vacante

## Descripción
Desarrollar la lógica dentro del servicio Core AI que busca o crea la entidad `DescripcionPuestoGenerada` (o similar) asociada al `ats_vacante_id` proporcionado, y guarda/actualiza en ella los campos `evaluacion_corte`, `etapa_pre_aceptacion`, `etapa_pre_rechazo` con los valores recibidos de la API (TK-059). Persiste los cambios en la BBDD de Core AI.

## User Story Relacionada
US-016: Almacenar Parámetros de Evaluación IA Asociados a Vacante (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe `ats_vacante_id` y los parámetros IA (`cutoff_score`, `accept_stage`, `reject_stage`).
2.  Busca una entidad `DescripcionPuestoGenerada` existente que tenga ese `ats_vacante_id`.
3.  Si no existe, crea una nueva entidad `DescripcionPuestoGenerada` asociándola al `ats_vacante_id`.
4.  Actualiza los campos `evaluacion_corte`, `etapa_pre_aceptacion`, `etapa_pre_rechazo` en la entidad encontrada o recién creada con los valores recibidos.
5.  Guarda (INSERT o UPDATE) la entidad `DescripcionPuestoGenerada` en la base de datos de Core AI.
6.  Maneja errores de base de datos y devuelve éxito o error al controlador (TK-059).

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios de Core AI. Usar ORM para la interacción con la BBDD de Core AI donde reside `DescripcionPuestoGenerada`.

## Dependencias Técnicas (Directas)
* TK-059 (Endpoint API que invoca esta lógica)
* Esquema BBDD Core AI con entidad `DescripcionPuestoGenerada` y los campos necesarios (definido en F5/Modelo de Datos, necesita ticket de BBDD si no existe).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-016)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación lógica find-or-create/update, operación INSERT/UPDATE BBDD Core AI]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, ai-config, vacancy, save, database

## Comentarios
Lógica central para persistir la configuración IA. Requiere que el modelo de datos de Core AI esté definido.

## Enlaces o Referencias
[Documentación ORM], [Modelo de Datos Fase 5]