# Ticket: TK-052

## Título
FE: Manejar Respuesta API Generación JD y Actualizar Editor

## Descripción
Ampliar la lógica frontend iniciada en TK-047. Específicamente, manejar la respuesta *exitosa* de la API de generación de JD de Core AI (invocada por TK-047/US-015). Debe extraer el texto de la JD generada de la respuesta y actualizar el contenido del componente editor de JD (TK-053) en el formulario.

## User Story Relacionada
US-014: Recibir y Editar Descripción de Puesto (JD) Generada por IA

## Criterios de Aceptación Técnicos (Verificables)
1.  Dado que la llamada API a Core AI para generar JD (iniciada en TK-047) devuelve una respuesta exitosa (ej. 200 OK) con el texto de la JD generada.
2.  La lógica frontend extrae correctamente el texto de la JD de la estructura de la respuesta API (definida en TK-001).
3.  El contenido del componente editor de texto (TK-053) se actualiza programáticamente para mostrar la JD recibida.
4.  El indicador de carga (iniciado en TK-047) se oculta.
5.  Si la respuesta API indica un error en la generación (a pesar de ser una respuesta 200, ej. con un campo de error interno), se muestra un mensaje apropiado al usuario.

## Solución Técnica Propuesta (Opcional)
Extender el manejador de la promesa/callback de la llamada API iniciada en TK-047. Actualizar el estado/modelo vinculado al editor de texto.

## Dependencias Técnicas (Directas)
* TK-047 (Lógica que inicia la llamada y maneja carga/error inicial)
* TK-053 (Componente Editor donde se muestra el texto)
* Definición API Core AI y formato de respuesta (TK-001 / US-015).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-014)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Manejo de respuesta API exitosa, actualización de estado/modelo del editor]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, generate-jd, editor

## Comentarios
Completa el flujo de la solicitud de generación desde la perspectiva del frontend.

## Enlaces o Referencias
[TK-001 - Especificación API]