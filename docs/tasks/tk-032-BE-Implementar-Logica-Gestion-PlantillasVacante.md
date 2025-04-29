# Ticket: TK-032

## Título
BE: Implementar Lógica de Negocio para Gestión de Plantillas de Vacante

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend para manejar las operaciones CRUD de plantillas de vacantes. Incluye obtener una vacante existente para guardarla como plantilla, guardar/leer/listar/eliminar registros en la tabla `VacantePlantilla` (TK-030).

## User Story Relacionada
US-008: Utilizar Plantillas para Crear Vacantes

## Criterios de Aceptación Técnicos (Verificables)
1.  Al crear plantilla desde `vacante_id`: Recupera la vacante por ID (usando lógica de TK-023), extrae los campos relevantes (titulo, desc, etc.), los serializa en `datos_vacante`, valida el nombre de plantilla y guarda el nuevo registro `VacantePlantilla`.
2.  Al crear plantilla con `datos_vacante` directos: Valida el nombre, valida la estructura de `datos_vacante` (opcional), y guarda el nuevo registro.
3.  Al obtener plantilla por ID: Recupera el registro `VacantePlantilla` y lo devuelve (incluyendo `datos_vacante` deserializados si es necesario).
4.  Al listar plantillas: Recupera todos los registros `VacantePlantilla` (solo id, nombre).
5.  Al eliminar plantilla: Busca por ID y elimina el registro.
6.  Maneja errores (ej. Vacante ID no existe al crear, nombre duplicado si se define unique, error BBDD).

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM. Usar librería JSON para serializar/deserializar `datos_vacante`.

## Dependencias Técnicas (Directas)
* TK-030 (Esquema BBDD `VacantePlantilla`)
* TK-031 (Endpoints API que invocan esta lógica)
* TK-023 (Lógica para obtener Vacante)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-008)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Implementación lógica CRUD para plantillas, serialización/deserialización JSON, interacción BBDD]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, vacancy, job, template, crud, json

## Comentarios
La lógica de creación desde vacante existente es la más específica.

## Enlaces o Referencias
[Documentación ORM, Documentación librería JSON]