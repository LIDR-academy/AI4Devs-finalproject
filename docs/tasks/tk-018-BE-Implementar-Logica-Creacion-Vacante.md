# Ticket: TK-018

## Título
BE: Implementar Lógica de Negocio para Crear Vacante

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend del ATS MVP para manejar la creación de una nueva vacante. Esto incluye tomar los datos validados del endpoint (TK-017), asignar el estado inicial, generar un ID único si no lo hace la BBDD, asociar al reclutador (usuario autenticado) y guardar el nuevo registro en la BBDD (usando esquema TK-016).

## User Story Relacionada
US-005: Crear Nueva Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe los datos validados de la vacante (titulo, depto, ubicacion, reqs) y el ID del usuario reclutador.
2.  Asigna el estado inicial a 'BORRADOR'.
3.  Asigna el `recruiter_id` recibido.
4.  Prepara el objeto/entidad `Vacante` para la inserción.
5.  Guarda el nuevo registro `Vacante` en la base de datos usando el ORM o cliente BBDD.
6.  Devuelve la entidad `Vacante` recién creada (con su ID asignado) o lanza una excepción en caso de error de BBDD.

## Solución Técnica Propuesta (Opcional)
Implementar en la capa de Servicios/Casos de Uso. Usar ORM para la interacción con BBDD.

## Dependencias Técnicas (Directas)
* TK-016 (Esquema BBDD `Vacante`)
* TK-017 (Endpoint API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-005)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación lógica de servicio, preparación datos, operación INSERT BBDD]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, vacancy, job, creation

## Comentarios
Lógica relativamente simple de creación.

## Enlaces o Referencias
[Documentación ORM]