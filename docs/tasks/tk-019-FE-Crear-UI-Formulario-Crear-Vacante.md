# Ticket: TK-019

## Título
FE: Crear Interfaz de Usuario para Formulario "Crear Nueva Vacante"

## Descripción
Desarrollar el componente de UI en el frontend del ATS MVP que presenta el formulario para crear una nueva vacante. Incluir campos para Título, Departamento, Ubicación, y Requisitos Clave iniciales, junto con botones de Guardar/Cancelar.

## User Story Relacionada
US-005: Crear Nueva Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta/página accesible (ej. `/vacantes/nueva`) que muestra el formulario.
2.  El formulario contiene campos de entrada de texto para Título, Departamento, Ubicación y un área de texto para Requisitos Clave.
3.  Los campos Título y Ubicación están marcados/validados como obligatorios en el frontend.
4.  Existen botones "Guardar Vacante" y "Cancelar".
5.  Al hacer clic en "Cancelar", se redirige al usuario a la lista de vacantes o al dashboard.

## Solución Técnica Propuesta (Opcional)
Usar el framework frontend y librerías de componentes UI.

## Dependencias Técnicas (Directas)
* TK-020 (Lógica Frontend para enviar datos)
* Diseño de UI/Mockups para el formulario.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-005)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Desarrollo componente formulario, campos, validación básica cliente]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, vacancy, job, creation, form, component

## Comentarios
Mantener el formulario simple para esta US inicial.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]