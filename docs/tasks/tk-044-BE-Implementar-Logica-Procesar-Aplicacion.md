# Ticket: TK-044

## Título
BE: Implementar Lógica de Negocio para Procesar Nueva Aplicación

## Descripción
Desarrollar la lógica de negocio principal en el backend para procesar una nueva aplicación recibida. Debe coordinar: 1) Almacenar el CV (usando TK-043). 2) Encontrar o crear el registro `Candidato` (basado en email). 3) Crear el registro `ArchivoCandidato` con la referencia al CV almacenado. 4) Crear el registro `Candidatura` vinculando `Candidato`, `Vacante` y `ArchivoCandidato`. 5) Asignar la etapa inicial del pipeline.

## User Story Relacionada
US-011: Recepcionar y Almacenar Nueva Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe datos validados (nombre, email, tel, jobId) y el objeto archivo CV (desde TK-042).
2.  Invoca a TK-043 para almacenar el archivo CV y obtiene la referencia (cvPathOrId).
3.  Busca un `Candidato` por email. Si no existe, crea uno nuevo con los datos recibidos (nombre, email, tel). Obtiene el `candidatoId`.
4.  Crea un registro `ArchivoCandidato` asociando el `candidatoId` y la `cvPathOrId`. Obtiene el `archivoCandidatoId`.
5.  Obtiene la etapa inicial por defecto del pipeline (ej. consultando `EtapaPipeline` donde `orden` = 1 o por un flag 'inicial'). Obtiene el `etapaInicialId`.
6.  Crea un nuevo registro `Candidatura` con: `candidato_id` = `candidatoId`, `vacante_id` = `jobId` recibido, `fecha_aplicacion` = now(), `etapa_pipeline_actual_id` = `etapaInicialId`, `referencia_archivo_cv_id` = `archivoCandidatoId` (o campo similar).
7.  Toda la operación (búsqueda/creación candidato, creación archivo, creación candidatura) se maneja preferiblemente dentro de una transacción de base de datos para asegurar consistencia.
8.  Si todo es exitoso, devuelve información relevante (ej. ID de la candidatura creada).
9.  Si falla algún paso (almacenamiento CV, creación BBDD), se realiza rollback de la transacción (si aplica) y se lanza un error apropiado.

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM y su manejo de transacciones.

## Dependencias Técnicas (Directas)
* TK-042 (Endpoint API que invoca esta lógica)
* TK-043 (Servicio/Lógica Almacenamiento CV)
* TK-006 (Esquema `Usuario` - para buscar/crear)
* TK-016 (Esquema `Vacante` - para referenciar `vacante_id`)
* TK-011 (Esquema `EtapaPipeline` - para obtener etapa inicial)
* Esquema `ArchivoCandidato` (necesita definirse, similar a TK-016)
* Esquema `Candidatura` (necesita definirse, similar a TK-016)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-011)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Coordinación de múltiples pasos, lógica find-or-create, creación múltiples registros BBDD, manejo de transacciones y errores]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, candidate, cv, database, transaction

## Comentarios
Lógica central que une varias entidades. Necesita definición de esquemas `ArchivoCandidato` y `Candidatura`.

## Enlaces o Referencias
[Documentación ORM sobre Transacciones]