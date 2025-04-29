# Ticket: TK-002

## Título
FE: Crear Componente y Lógica de Formulario de Login

## Descripción
Desarrollar el componente de interfaz de usuario (UI) para el formulario de login en el frontend del ATS MVP. Incluir campos para email y contraseña, botón de envío, y manejo básico de estado (carga, errores). Implementar la lógica para llamar al endpoint de autenticación del backend al enviar el formulario y manejar la respuesta (guardar token/sesión, redirigir o mostrar error).

## User Story Relacionada
US-004: Autenticar Usuario para Acceder al Sistema

## Criterios de Aceptación Técnicos (Verificables)
1.  El formulario renderiza correctamente con campos para email, contraseña y botón de submit.
2.  Se realiza validación básica de formato de email en el cliente.
3.  Al enviar, se realiza una petición POST al endpoint `/api/v1/auth/login` del backend con email y contraseña.
4.  Si la respuesta es exitosa (ej. 200 OK con token), se almacena el token/identificador de sesión de forma segura en el cliente (ej. localStorage, sessionStorage, cookie HttpOnly).
5.  Si la respuesta es exitosa, el usuario es redirigido al dashboard principal.
6.  Si la respuesta es de error (ej. 401 Unauthorized), se muestra un mensaje de error claro al usuario en el formulario.
7.  El estado de carga se indica visualmente durante la petición API.

## Solución Técnica Propuesta (Opcional)
Usar el framework frontend establecido (React/Vue/Angular) y librería de peticiones HTTP (axios/fetch). Considerar librería de manejo de formularios.

## Dependencias Técnicas (Directas)
* TK-003 (Endpoint Backend Login)
* Definición del formato del token/respuesta de login (parte de TK-001 - API Contract)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-004)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Incluye desarrollo UI, lógica de llamada API, manejo de estado y errores básicos]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, authentication, login, component

## Comentarios
Asegurar la accesibilidad básica del formulario.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI si existen]