# Ticket: TK-138

## Título
FE-Logic: Manejar Estado y Construir Payload para Feedback Detallado

## Descripción
Implementar la lógica en el frontend para gestionar el estado de los controles de feedback detallado (score ajustado, estado de validación de skills, texto de comentarios - de TK-137). Al iniciar el envío de feedback (invocando a TK-133), debe construir un objeto JSON complejo en `feedback_data` que contenga toda esta información granular.

## User Story Relacionada
US-040: Capturar Feedback Detallado sobre Evaluación IA

## Criterios de Aceptación Técnicos (Verificables)
1.  El estado del componente/store maneja los valores actuales de: score ajustado (si se modificó), un mapa/objeto con el estado de validación de cada skill, y el texto del comentario.
2.  Al preparar el envío del feedback (para llamar a TK-133), se construye un objeto `feedback_data`, por ejemplo:
    ```json
    {
      "adjusted_score": 85, // si se ajustó
      "skill_validations": {
        "Java": "VALIDATED_RELEVANT",
        "SQL": "INVALIDATED",
        "React": "VALIDATED_IRRELEVANT"
        // ...
      },
      "comment": "Buen perfil técnico, pero..."
    }
    ```
3.  Este objeto `feedback_data` se pasa a la función de envío (TK-133) junto con `evaluationId` y un `feedbackType` apropiado (ej. 'DETAILED_FEEDBACK').
4.  La lógica maneja correctamente campos opcionales (si el usuario no ajusta el score o no valida skills).

## Solución Técnica Propuesta (Opcional)
Ampliar el manejo de estado local o del store para incluir estos nuevos campos. Crear una función específica para construir el objeto `feedback_data` estructurado.

## Dependencias Técnicas (Directas)
* TK-137 (Controles UI que actualizan este estado)
* TK-133 (Lógica Frontend que envía el feedback con estos datos)

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-040)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Manejo de estado para múltiples inputs, lógica de construcción objeto JSON]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, state-management, feedback, json, payload

## Comentarios
Clave para enviar la información detallada correctamente estructurada.

## Enlaces o Referencias
[Definición estructura `feedback_data` en TK-001/TK-135]