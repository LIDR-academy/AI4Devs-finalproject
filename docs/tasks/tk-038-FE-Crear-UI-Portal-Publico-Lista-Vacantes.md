# Ticket: TK-038

## Título
FE: Crear Interfaz de Usuario para Portal Público de Empleo (Lista Vacantes)

## Descripción
Desarrollar la página/componente UI pública del portal de empleo en el frontend del ATS MVP. Debe mostrar la lista de vacantes publicadas obtenidas de la API (TK-036), con un diseño simple y claro, incluyendo un enlace para aplicar a cada vacante.

## User Story Relacionada
US-009: Visualizar Lista de Vacantes Públicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta pública (ej. `/portal` o `/`) que renderiza el componente del portal.
2.  Al cargar, el componente llama a la lógica (TK-039) para obtener las vacantes públicas.
3.  Muestra una lista/tarjetas con el Título y Ubicación de cada vacante recibida.
4.  Cada item de la lista tiene un botón/enlace "Aplicar" o "Ver Detalles" que redirige a la página/URL del formulario de aplicación (US-010 / TK-041) pasando el ID de la vacante.
5.  Si no se reciben vacantes, muestra un mensaje apropiado (ej. "No hay ofertas disponibles en este momento").
6.  La página tiene un diseño limpio y profesional básico. No requiere login.

## Solución Técnica Propuesta (Opcional)
Usar el framework frontend. Puede ser una página estática que hace la llamada API al cargar, o SSR/SSG si el framework lo soporta y se desea mejor SEO/performance inicial.

## Dependencias Técnicas (Directas)
* TK-039 (Lógica Frontend para obtener datos)
* Diseño de UI/Mockups para el portal público.
* Definición de la ruta/URL para el formulario de aplicación (US-010).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-009)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Desarrollo componente UI, maquetación básica, iteración lista]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, portal, public, vacancy, job, list, component

## Comentarios
Interfaz pública clave para la captación.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]