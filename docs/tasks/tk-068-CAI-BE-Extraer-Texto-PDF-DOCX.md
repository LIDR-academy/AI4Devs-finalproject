# Ticket: TK-068

## Título
CAI-BE: Implementar Extracción de Texto desde Archivos PDF y DOCX

## Descripción
Desarrollar la lógica dentro del servicio Core AI para extraer el contenido de texto plano desde el contenido binario de archivos PDF y DOCX (obtenido en TK-067). Utilizar librerías apropiadas para esta tarea.

## User Story Relacionada
US-020: Extraer Datos Estructurados del CV (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método `extractText(fileContent, mimeType)` que recibe el buffer/stream del archivo y su tipo.
2.  Si el tipo es PDF, utiliza una librería (ej. Apache PDFBox, pdf-parse) para extraer el texto.
3.  Si el tipo es DOCX, utiliza una librería (ej. Apache POI, docx) para extraer el texto.
4.  Maneja correctamente archivos protegidos por contraseña (devolviendo error o texto vacío).
5.  Maneja errores durante la extracción (ej. archivo corrupto).
6.  Devuelve el texto extraído como una única cadena de texto o lanza una excepción.

## Solución Técnica Propuesta (Opcional)
Integrar librerías Java/Python robustas y bien mantenidas para la extracción de texto (Apache Tika es una opción que maneja múltiples formatos).

## Dependencias Técnicas (Directas)
* TK-067 (Provee el contenido del archivo).
* TK-069 (Consume el texto extraído).
* Librerías de extracción de texto elegidas.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-020)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Investigación/Integración de librerías, implementación lógica extracción, manejo errores básicos]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, nlp, text-extraction, pdf, docx, parsing, library

## Comentarios
La calidad de la extracción de texto impacta directamente en el parsing posterior.

## Enlaces o Referencias
[Documentación librerías Tika, PDFBox, POI, etc.]