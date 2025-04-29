# Ticket: TK-003

## Título
BE: Implementar Endpoint de Login (`POST /api/v1/auth/login`)

## Descripción
Crear y exponer un endpoint en el backend del ATS MVP que reciba credenciales (email, contraseña) en formato JSON. Debe verificar las credenciales contra la base de datos de usuarios, comparar la contraseña hasheada de forma segura, y si son válidas, generar e iniciar una sesión o emitir un token (JWT recomendado).

## User Story Relacionada
US-004: Autenticar Usuario para Acceder al Sistema

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `POST /api/v1/auth/login` que acepta `{"email": "...", "password": "..."}` (definido en TK-001).
2.  Busca al usuario por email en la tabla `Usuario`. Si no existe, devuelve 401 Unauthorized.
3.  Verifica que el estado del usuario encontrado sea "Activo" (requiere US-003 implementada parcialmente para tener el campo). Si no, devuelve 403 Forbidden (o 401).
4.  Compara la contraseña proporcionada con la contraseña hasheada almacenada en la BBDD usando una librería segura (ej. bcrypt.compare).
5.  Si la contraseña no coincide, devuelve 401 Unauthorized.
6.  Si la contraseña coincide y el usuario está activo, genera un mecanismo de sesión/token (ver TK-004).
7.  Devuelve una respuesta 200 OK con el token/identificador de sesión en el cuerpo o cabecera/cookie según se defina (TK-001).
8.  Las contraseñas nunca se loguean en texto plano.

## Solución Técnica Propuesta (Opcional)
Usar el framework backend (Node/Express, Python/Django, etc.). Implementar hashing con bcrypt. Considerar JWT para tokens stateless.

## Dependencias Técnicas (Directas)
* Modelo de datos `Usuario` (base de US-003) con contraseña hasheada.
* TK-004 (Mecanismo de Sesión/Token a generar).
* TK-001 (Definición API).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-004)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Incluye lógica de endpoint, consulta DB, verificación hash, generación token básica]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, authentication, login, security, jwt

## Comentarios
La seguridad en la comparación de hash y el manejo de errores es crítica. Requiere que la estructura de la tabla Usuario exista.

## Enlaces o Referencias
[Link a documentación bcrypt, JWT.io]