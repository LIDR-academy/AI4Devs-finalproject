# Ticket: TK-061

## Título
CAI-BE: Investigar e Implementar Uso de Datos Internos para Enriquecer Generación JD

## Descripción
Investigar las posibles fuentes de datos internas relevantes (ej. perfiles de puesto, matrices de competencias, BBDD de RRHH) y su accesibilidad. Implementar la lógica en el servicio Core AI de Generación de JD para acceder a la fuente seleccionada, extraer información pertinente para una vacante dada, e incorporarla en el proceso de generación de JD (ya sea modificando el prompt a LLM - TK-056, o post-procesando la respuesta del LLM) para mejorar la especificidad y alineación con la organización.

## User Story Relacionada
US-017: Enriquecer Generación de JD con Datos Internos (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  Se ha identificado y documentado al menos una fuente de datos interna viable y accesible.
2.  Se ha implementado la lógica para conectar y consultar esa fuente de datos desde el servicio Core AI.
3.  La lógica puede extraer datos relevantes basados en el contexto de la vacante (ej. título, departamento).
4.  La lógica de generación de JD (TK-056 o el post-procesamiento) ha sido modificada para utilizar estos datos internos.
5.  Se puede demostrar mediante pruebas (ej. JDs generadas para puestos específicos) que la incorporación de datos internos mejora la calidad/especificidad del resultado comparado con no usarlos.
6.  Si la fuente de datos interna no está disponible o no devuelve datos relevantes, el proceso de generación de JD continúa sin errores (fallback al comportamiento de US-015).
7.  La implementación maneja errores de conexión/consulta a la fuente interna de forma controlada.

## Solución Técnica Propuesta (Opcional)
Dependerá de la fuente de datos. Podría implicar llamadas API REST a otros sistemas internos, consultas SQL a BBDD compartidas, o lectura de archivos estructurados. La adaptación del prompt (TK-056) es probablemente el enfoque más directo.

## Dependencias Técnicas (Directas)
* Disponibilidad y formato de los datos internos.
* Posibles credenciales/permisos para acceder a la fuente interna.
* TK-056 (Lógica de Prompt Engineering a modificar).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-017)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Incluye investigación inicial de fuentes (1-2h), implementación de conexión/consulta (3-4h), adaptación lógica IA (2-3h). Alta incertidumbre.]

## Asignación Inicial
Equipo Backend (Core AI) / AI Engineer

## Etiquetas
backend, core-ai, ai, llm, generate-jd, integration, internal-data, enrichment, research

## Comentarios
Ticket complejo debido a la dependencia de sistemas/datos externos a la solución Core AI inicial. La estimación es preliminar y depende fuertemente de la complejidad de la integración.

## Enlaces o Referencias
[Documentación sobre las posibles fuentes de datos internas]