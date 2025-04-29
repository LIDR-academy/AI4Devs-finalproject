# Ticket: TK-040

## Título
FE: Crear Interfaz de Usuario para Formulario de Aplicación a Vacante

## Descripción
Desarrollar el componente/página UI en el frontend público del ATS MVP que presenta el formulario de aplicación para una vacante específica. Debe incluir campos para Nombre Completo, Email, Teléfono (opcional), un control para subir el archivo CV, y un botón de envío.

## User Story Relacionada
US-010: Aplicar a una Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una ruta pública (ej. `/aplicar/{jobId}`) que renderiza el formulario de aplicación.
2.  El formulario muestra claramente el título de la vacante a la que se está aplicando (obtenido de la ruta o data pasada).
3.  Contiene campos de entrada de texto para Nombre Completo y Email (marcados como obligatorios).
4.  Contiene un campo de entrada de texto para Teléfono (opcional).
5.  Contiene un control de tipo `input type="file"` para seleccionar el CV. Se especifica que se aceptan archivos `.pdf, .docx`.
6.  (Opcional GDPR) Contiene un checkbox para aceptar políticas de privacidad, marcado como obligatorio.
7.  Existe un botón "Enviar Aplicación".

## Solución Técnica Propuesta (Opcional)
Usar el framework frontend y librerías de componentes UI. Utilizar atributos `accept` en el input de archivo y validación cliente.

## Dependencias Técnicas (Directas)
* TK-041 (Lógica Frontend para validación y envío)
* Diseño de UI/Mockups para el formulario de aplicación.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-010)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Desarrollo componente formulario, campos, layout básico]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, portal, public, application, form, component, candidate

## Comentarios
Formulario clave para la interacción del candidato.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]