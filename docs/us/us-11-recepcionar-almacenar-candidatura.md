# User Story: US-011

## Feature Asociada
Feature 3: Portal de Empleo y Proceso de Aplicación

## Título
Recepcionar y Almacenar Nueva Candidatura

## Narrativa
Como Sistema ATS
Quiero poder recibir los datos y el CV enviados desde el formulario de aplicación, almacenar el CV de forma segura, y crear los registros correspondientes en la base de datos (Candidato, Candidatura)
Para que la postulación del candidato quede registrada y lista para ser procesada.

## Detalles
Cubre el procesamiento backend de una nueva aplicación enviada por un candidato.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que se recibe una petición HTTP POST desde el formulario de aplicación (US-010) con datos (nombre, email, tel) y un archivo CV adjunto (PDF o DOCX).
2.  El sistema almacena el archivo CV recibido en una ubicación segura designada (ej. S3 bucket, file system seguro) y guarda la referencia (ruta/ID) a esta ubicación.
3.  El sistema busca en la BBDD del ATS un registro `Candidato` que coincida con el email recibido.
4.  Si no existe un `Candidato` con ese email, se crea un nuevo registro `Candidato` con el nombre, email y teléfono proporcionados.
5.  Si ya existe un `Candidato` con ese email, se utiliza el ID de ese candidato existente (no se crea duplicado).
6.  Se crea un nuevo registro `Candidatura` en la BBDD, vinculando el ID del `Candidato` (nuevo o existente), el ID de la `Vacante` a la que aplicó, la fecha/hora de aplicación y la referencia al `ArchivoCandidato` almacenado.
7.  La nueva `Candidatura` se asigna a la etapa inicial por defecto del pipeline (ej. "Nuevo", configurada en US-002).
8.  Tras el procesamiento exitoso, se devuelve una respuesta de éxito al frontend (que mostrará un mensaje de confirmación al candidato en el portal).
9.  Si ocurre un error durante el almacenamiento del archivo o la creación en BBDD, se registra el error y se devuelve una respuesta de error apropiada.

## Requisito(s) Funcional(es) Asociado(s)
RF-09

## Prioridad: Must Have
* **Justificación:** Procesa y persiste la aplicación del candidato; sin esto, las aplicaciones se pierden.

## Estimación Preliminar (SP): 5
* **Justificación:** Implica lógica de backend significativa: manejar la carga de archivos, interactuar con almacenamiento de archivos, realizar consultas y escrituras en base de datos ( potentially 2 tablas con lógica de find-or-create), y manejar errores. Complejidad moderada.