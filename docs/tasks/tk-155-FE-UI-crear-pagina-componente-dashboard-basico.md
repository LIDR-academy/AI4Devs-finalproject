# Ticket: TK-155

## Título
FE-UI: Crear Página/Componente Dashboard Básico

## Descripción
Desarrollar el componente UI principal en el frontend para la página del Dashboard. Servirá como contenedor para los diferentes widgets de métricas (TK-156) y gestionará la carga inicial de datos.

## User Story Relacionada
US-043: Visualizar Dashboard con Métricas Básicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta/página (ej. `/dashboard`) que renderiza el componente del Dashboard.
2.  Al cargar, invoca la lógica (TK-157) para obtener los datos del dashboard.
3.  Muestra un estado de carga mientras se obtienen los datos.
4.  Una vez obtenidos los datos, renderiza los componentes de widget (TK-156) pasándoles los datos correspondientes.
5.  Define el layout general de la página del dashboard (ej. disposición de los widgets).

## Solución Técnica Propuesta (Opcional)
Componente estándar del framework frontend que actúa como contenedor y orquesta la carga de datos.

## Dependencias Técnicas (Directas)
* TK-156 (Componentes Widget)
* TK-157 (Lógica Frontend API)
* Sistema de Routing del Frontend.
* Diseño de UI/Mockups para el Dashboard.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-043)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Creación componente página, layout básico, integración lógica carga]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, page, component, dashboard, layout

## Comentarios
Contenedor principal para la vista del dashboard.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]