# Ticket: TK-159

## Título
BE-Logic: Implementar Lógica de Negocio para Generar Exportación (Datos+CV)

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend ATS para generar el archivo de exportación. Debe: obtener datos del candidato, obtener el archivo CV del almacenamiento, crear un archivo de texto/CSV con los datos, crear un archivo ZIP con ambos, y devolver el ZIP (como buffer o stream).

## User Story Relacionada
US-044: Exportar Información Básica de un Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe `applicationId`.
2.  Recupera la `Candidatura` y el `Candidato` asociado para obtener Nombre, Email, Teléfono.
3.  Recupera la referencia al `ArchivoCandidato` asociado a la `Candidatura`.
4.  Invoca la lógica de almacenamiento (TK-043/TK-067) para obtener el contenido binario del archivo CV usando su referencia. Si no se encuentra el CV, lanza error.
5.  Crea en memoria (o temporalmente) un archivo de texto simple (ej. `datos_contacto.txt`) con el Nombre, Email y Teléfono.
6.  Utiliza una librería de compresión para crear un archivo ZIP en memoria (o temporal).
7.  Añade el archivo de texto y el archivo CV (con su nombre original) al ZIP.
8.  Devuelve el contenido del archivo ZIP como un buffer de bytes o un stream legible.
9.  Maneja errores (candidatura no encontrada, CV no encontrado, error al crear ZIP).

## Solución Técnica Propuesta (Opcional)
Usar librerías estándar del lenguaje para manejo de archivos en memoria y compresión ZIP (ej. `java.util.zip` en Java, `zipfile` en Python, `archiver` en Node.js).

## Dependencias Técnicas (Directas)
* Lógica para obtener Candidatura/Candidato.
* Lógica para obtener contenido de archivo CV (TK-043/TK-067).
* TK-158 (API que invoca esta lógica).
* Librería de compresión ZIP.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-044)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Recuperación datos y archivo, creación archivo texto, compresión ZIP, manejo streams/buffers]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, export, zip, file, generation, candidate, cv

## Comentarios
La creación del ZIP en memoria es preferible a usar archivos temporales en disco.

## Enlaces o Referencias
[Documentación librería ZIP]