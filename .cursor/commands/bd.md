Actúa como un ingeniero de datos y auditor de seguridad. Realiza un escaneo estático de la capa de base de datos en este proyecto de AdonisJS, analizando exhaustivamente las carpetas database/migrations, app/Models y las consultas a base de datos dentro de los controladores.

El objetivo es identificar los siguientes hallazgos (findings):

Vulnerabilidades de seguridad (ej. riesgo de asignación masiva, inyección SQL).

Problemas de rendimiento y optimización (ej. consultas N+1, falta de índices en columnas de búsqueda frecuente).

Fallos de integridad (ej. ausencia de restricciones de clave foránea o eliminación en cascada incorrecta).

Por cada hallazgo identificado, utiliza la herramienta MCP de Jira disponible en este entorno para crear un ticket de forma automática.

La estructura de cada ticket de Jira debe ser la siguiente:

Summary: [Categoría del Hallazgo] - Breve título descriptivo.

Description:

Problema: Explicación técnica del hallazgo.

Ubicación: Rutas de los archivos implicados.

Impacto: Consecuencias de dejar este código en producción.

Solución Propuesta: Código refactorizado sugerido utilizando las mejores prácticas de Lucid ORM.

Issue Type: Clasificar como 'Bug' para vulnerabilidades de seguridad, o 'Task'/'Technical Debt' para optimizaciones.

Al finalizar el proceso, genera en este chat una tabla de resumen que contenga el título del hallazgo y el identificador (Issue Key) del ticket de Jira creado

