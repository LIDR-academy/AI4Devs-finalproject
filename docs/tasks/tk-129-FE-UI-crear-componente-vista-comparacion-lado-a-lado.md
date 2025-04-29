# Ticket: TK-129

## Título
FE-UI: Crear Componente UI Vista Comparación Lado a Lado

## Descripción
Desarrollar un nuevo componente UI (modal o página) que presente la vista de comparación de candidatos. Debe ser capaz de mostrar la información clave (Nombre, Score IA, Resumen IA, enlace) de varios candidatos en columnas paralelas.

## User Story Relacionada
US-036: Comparar Perfiles de Candidatos Lado a Lado

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un componente UI (ej. `CandidateComparisonView`) que recibe un array de objetos, donde cada objeto representa los datos de un candidato a comparar.
2.  El componente renderiza una estructura de columnas, una por cada candidato en el array recibido.
3.  Cada columna muestra claramente:
    * Nombre del Candidato.
    * Score IA (si disponible).
    * Resumen IA (si disponible).
    * Un enlace al perfil completo de la candidatura.
4.  El diseño permite una fácil comparación visual entre las columnas.
5.  Si es un modal, incluye un botón para cerrarlo.

## Solución Técnica Propuesta (Opcional)
Usar sistema de rejilla (grid) CSS o componentes de layout del framework UI para crear las columnas.

## Dependencias Técnicas (Directas)
* TK-130 (Lógica que obtiene los datos y muestra este componente)
* Diseño de UI/Mockups para la vista de comparación.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-036)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Desarrollo nuevo componente UI complejo, layout multi-columna, renderizado de datos]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, compare, modal, page, multi-column

## Comentarios
La complejidad reside en crear un layout claro y efectivo para la comparación.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]