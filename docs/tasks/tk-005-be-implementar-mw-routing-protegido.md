# Ticket: TK-005

## Título
BE: Implementar Middleware de Autenticación para Rutas Protegidas

## Descripción
Crear un middleware (o decorador/guardia según el framework) en el backend del ATS MVP que intercepte las peticiones a endpoints protegidos. Debe verificar la validez de la sesión o token JWT presente en la petición. Si es válido, permite continuar la petición; si no es válido o no está presente, rechaza la petición con un código 401 Unauthorized.

## User Story Relacionada
US-004: Autenticar Usuario para Acceder al Sistema (y todas las US que requieran acceso autenticado)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un middleware/decorador/guardia de autenticación aplicable a rutas/controladores.
2.  El middleware extrae el identificador de sesión o token JWT de la petición (ej. cabecera `Authorization: Bearer <token>`, cookie).
3.  Si no hay sesión/token, devuelve 401.
4.  *Si JWT:* Verifica la firma del token usando la clave secreta correcta (ver TK-004). Si la firma es inválida, devuelve 401.
5.  *Si JWT:* Verifica que el token no haya expirado (`exp` claim). Si ha expirado, devuelve 401.
6.  *Si JWT:* (Opcional) Verifica otros claims como `iss` (emisor) o `aud` (audiencia) si son relevantes.
7.  Si la sesión/token es válido, adjunta la información del usuario autenticado (ej. `userId`, `role` extraídos del token/sesión) al objeto de la petición para uso posterior en los controladores.
8.  Si la sesión/token es válido, permite que la petición continúe hacia el controlador de la ruta protegida.
9.  El middleware se aplica (o está listo para aplicarse) a todas las rutas de la API interna excepto `/api/v1/auth/login` (definidas en TK-001).

## Solución Técnica Propuesta (Opcional)
Usar las capacidades de middleware del framework backend. Para JWT, usar la función de verificación de la librería JWT elegida.

## Dependencias Técnicas (Directas)
* TK-004 (Mecanismo de Sesión/Token a validar).
* TK-001 (Definición de rutas a proteger).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-004)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación middleware, lógica de extracción y validación token/sesión, integración en rutas]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, authentication, security, middleware, authorization, jwt

## Comentarios
Este middleware es crucial para proteger todas las funcionalidades del ATS MVP que se desarrollen posteriormente.

## Enlaces o Referencias
[Documentación del framework sobre middleware/guards]