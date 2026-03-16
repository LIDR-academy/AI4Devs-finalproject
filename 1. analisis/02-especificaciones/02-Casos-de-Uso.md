# 📋 CASOS DE USO - RRFinances

**Sistema Web Financiero Core para Cooperativas de Ahorro y Crédito**  
**Fecha:** 17 de Diciembre de 2025  
**Versión:** 1.0  
**Total de Casos de Uso:** 76

---

## 📑 ÍNDICE DE CONTENIDOS

1. [Módulo 1: Autenticación y Login](#módulo-1-autenticación-y-login) (5 CU)
2. [Módulo 2: Gestión de Usuarios](#módulo-2-gestión-de-usuarios) (13 CU)
3. [Módulo 3: Catálogos Maestros](#módulo-3-catálogos-maestros) (10 CU)
4. [Módulo 4: Clientes - Gestión](#módulo-4-clientes---gestión) (7 CU)
5. [Módulo 5: Clientes - Búsqueda y Consultas](#módulo-5-clientes---búsqueda-y-consultas) (8 CU)
6. [Módulo 6: Mensajes a Clientes](#módulo-6-mensajes-a-clientes) (6 CU)
7. [Módulo 7: Apoderados](#módulo-7-apoderados) (7 CU)
8. [Módulo 8: Poderes Notariales](#módulo-8-poderes-notariales) (10 CU)
9. [Módulo 9: Auditoría](#módulo-9-auditoría) (6 CU)
10. [Módulo 10: Configuración del Sistema](#módulo-10-configuración-del-sistema) (4 CU)

---

## MÓDULO 1: AUTENTICACIÓN Y LOGIN

### CU-001: Iniciar sesión en el sistema

**Módulo:** Autenticación y Login  
**Identificador:** CU-001  
**Prioridad:** Crítica

#### Descripción
Permite a un usuario autenticarse en el sistema mediante sus credenciales (usuario/email y contraseña) para acceder a las funcionalidades según sus permisos asignados.

#### Actores
- **Actor Principal:** Usuario del sistema (cualquier rol)
- **Actores Secundarios:** Sistema de auditoría, Sistema de autenticación

#### Precondiciones
1. El usuario debe estar registrado en el sistema
2. La cuenta del usuario debe estar activa (no bloqueada ni desactivada)
3. El usuario debe tener acceso a la URL del sistema
4. El sistema debe estar operativo y accesible

#### Flujo Principal

1. El usuario accede a la página de login del sistema
2. El sistema presenta el formulario de autenticación con campos:
   - Usuario o Email (obligatorio)
   - Contraseña (obligatorio)
   - Botón "Iniciar Sesión"
   - Link "¿Olvidaste tu contraseña?"
3. El usuario ingresa su nombre de usuario o email
4. El usuario ingresa su contraseña
5. El usuario hace clic en "Iniciar Sesión"
6. El sistema valida el formato de los datos ingresados
7. El sistema verifica las credenciales contra la base de datos
8. El sistema verifica que la cuenta no esté bloqueada
9. El sistema verifica que la cuenta esté activa
10. El sistema genera tokens JWT (access token y refresh token)
11. El sistema registra el login exitoso en la tabla de intentos de login
12. El sistema registra el evento en el log de auditoría
13. El sistema resetea el contador de intentos fallidos a cero
14. El sistema retorna:
    - Access token (validez: 1 hora)
    - Refresh token (validez: 7 días)
    - Información del usuario (sin contraseña)
    - Permisos y roles asignados
15. El frontend almacena los tokens en localStorage/sessionStorage
16. El sistema redirecciona al usuario al dashboard principal
17. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Credenciales inválidas**
- En el paso 7, si las credenciales no coinciden:
  1. El sistema incrementa el contador de intentos fallidos
  2. El sistema registra el intento fallido con IP y timestamp
  3. El sistema verifica si se alcanzó el límite de intentos (5)
  4. Si NO se alcanzó el límite:
     - Muestra mensaje: "Usuario o contraseña incorrectos. Intentos restantes: X"
  5. Si SÍ se alcanzó el límite:
     - Ir a flujo de excepción FE-001
  6. El sistema retorna error 401 Unauthorized
  7. El usuario permanece en la pantalla de login
  8. **Fin del caso de uso**

**FA-002: Primer acceso - Cambio obligatorio de contraseña**
- En el paso 10, si el usuario tiene contraseña temporal:
  1. El sistema genera token temporal de cambio de contraseña
  2. El sistema redirecciona a pantalla de cambio de contraseña obligatorio
  3. Ir a CU-004: Cambiar contraseña en primer acceso
  4. **Fin del caso de uso**

**FA-003: Uso de email en lugar de usuario**
- En el paso 3, el usuario puede ingresar su email en lugar del username
- El sistema acepta ambos formatos y realiza la búsqueda correspondiente
- Continúa con el flujo principal desde el paso 6

#### Flujos de Excepción

**FE-001: Cuenta bloqueada por intentos fallidos**
- Cuando se alcanza el límite de 5 intentos fallidos consecutivos:
  1. El sistema marca la cuenta como bloqueada
  2. El sistema registra la fecha/hora de bloqueo
  3. El sistema registra el evento en auditoría
  4. El sistema muestra mensaje: "Tu cuenta ha sido bloqueada por seguridad. Contacta al administrador del sistema."
  5. El sistema retorna error 423 Locked
  6. El usuario NO puede intentar login nuevamente
  7. **Fin del caso de uso**

**FE-002: Cuenta desactivada**
- En el paso 9, si la cuenta está desactivada:
  1. El sistema muestra mensaje: "Tu cuenta ha sido desactivada. Contacta al administrador."
  2. El sistema registra el intento en auditoría
  3. El sistema retorna error 403 Forbidden
  4. **Fin del caso de uso**

**FE-003: Rate limiting excedido**
- Si se excede el límite de 5 intentos por minuto:
  1. El sistema bloquea temporalmente las peticiones desde esa IP
  2. El sistema muestra mensaje: "Demasiados intentos. Intenta nuevamente en X segundos."
  3. El sistema retorna error 429 Too Many Requests
  4. El usuario debe esperar el tiempo indicado
  5. **Fin del caso de uso**

**FE-004: Error del sistema**
- Si ocurre un error técnico en el proceso:
  1. El sistema registra el error en logs
  2. El sistema muestra mensaje genérico: "Error al procesar la solicitud. Intenta nuevamente."
  3. El sistema retorna error 500 Internal Server Error
  4. **Fin del caso de uso**

#### Postcondiciones

**Éxito:**
- El usuario está autenticado en el sistema
- Tokens JWT válidos generados y almacenados
- Sesión del usuario activa
- Evento de login registrado en auditoría
- Contador de intentos fallidos reseteado
- Usuario puede acceder a funcionalidades según sus permisos

**Fallo:**
- El usuario permanece sin autenticar
- No se generan tokens
- Intento fallido registrado
- Contador de intentos incrementado
- Usuario permanece en página de login

#### Reglas de Negocio

**RN-001:** La contraseña nunca se muestra en texto plano ni se transmite sin encriptar  
**RN-002:** Se permiten máximo 5 intentos fallidos consecutivos antes de bloquear cuenta  
**RN-003:** El access token tiene una validez de 1 hora  
**RN-004:** El refresh token tiene una validez de 7 días  
**RN-005:** El contador de intentos fallidos se resetea tras un login exitoso  
**RN-006:** Los intentos de login se registran por 90 días para auditoría  
**RN-007:** El sistema acepta tanto username como email para autenticación  
**RN-008:** Rate limiting: máximo 5 intentos por minuto por IP  
**RN-009:** Las contraseñas se validan con bcrypt (10 rounds)  
**RN-010:** El payload del JWT debe incluir: userId, username, roles, cooperativaId

#### Requisitos No Funcionales

**RNF-001 (Performance):** El tiempo de respuesta no debe superar 2 segundos  
**RNF-002 (Seguridad):** Todas las comunicaciones deben ser HTTPS  
**RNF-003 (Seguridad):** Las contraseñas deben estar hasheadas con bcrypt  
**RNF-004 (Disponibilidad):** El endpoint de login debe tener 99.9% de uptime  
**RNF-005 (Usabilidad):** Los mensajes de error deben ser claros pero no revelar información sensible  
**RNF-006 (Auditoría):** Todos los intentos de login deben registrarse en auditoría  
**RNF-007 (Escalabilidad):** Debe soportar al menos 100 logins concurrentes

#### Referencias
- RF-AUTH-001: Login de Usuario (PRD)
- TICKET-014: Implementar endpoint POST /auth/login
- TICKET-017: Crear tabla para intentos de login fallidos
- TICKET-018: Implementar lógica de bloqueo por intentos fallidos

---

### CU-002: Cerrar sesión

**Módulo:** Autenticación y Login  
**Identificador:** CU-002  
**Prioridad:** Alta

#### Descripción
Permite a un usuario autenticado cerrar su sesión activa en el sistema, invalidando sus tokens y registrando el evento para auditoría.

#### Actores
- **Actor Principal:** Usuario autenticado (cualquier rol)
- **Actores Secundarios:** Sistema de auditoría

#### Precondiciones
1. El usuario debe estar autenticado (tener token JWT válido)
2. El usuario debe tener acceso a la interfaz del sistema
3. El sistema debe estar operativo

#### Flujo Principal

1. El usuario hace clic en el menú de usuario (generalmente en la esquina superior derecha)
2. El sistema despliega el menú con las opciones disponibles
3. El usuario selecciona la opción "Cerrar Sesión"
4. El sistema muestra un diálogo de confirmación (opcional según configuración)
   - Mensaje: "¿Estás seguro que deseas cerrar sesión?"
   - Botones: "Sí, cerrar sesión" y "Cancelar"
5. El usuario confirma haciendo clic en "Sí, cerrar sesión"
6. El sistema valida el token JWT actual
7. El sistema invalida el refresh token en la base de datos o blacklist
8. El sistema registra el evento de logout en auditoría con:
   - Usuario ID
   - Fecha y hora
   - IP de origen
   - User agent
9. El sistema limpia los tokens almacenados en el cliente (localStorage/sessionStorage)
10. El sistema limpia el estado de la aplicación en memoria
11. El sistema redirecciona al usuario a la página de login
12. El sistema muestra mensaje de confirmación: "Sesión cerrada exitosamente"
13. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Usuario cancela el cierre de sesión**
- En el paso 5, si el usuario hace clic en "Cancelar":
  1. El sistema cierra el diálogo de confirmación
  2. El usuario permanece autenticado
  3. El sistema no realiza ninguna acción
  4. **Fin del caso de uso**

**FA-002: Cierre de sesión sin confirmación**
- Si la configuración no requiere confirmación:
  1. Se omite el paso 4
  2. El sistema procede directamente desde el paso 3 al paso 6
  3. Continúa con el flujo principal

**FA-003: Cierre por inactividad**
- Si la sesión expira por tiempo de inactividad:
  1. El sistema detecta inactividad superior al tiempo configurado (ej: 30 minutos)
  2. El sistema invalida automáticamente la sesión
  3. El sistema registra evento de "logout por inactividad" en auditoría
  4. Al siguiente intento de acción, el sistema redirecciona a login
  5. El sistema muestra mensaje: "Tu sesión expiró por inactividad"
  6. **Fin del caso de uso**

**FA-004: Cierre por expiración de token**
- Si el access token expira y el refresh token también:
  1. El sistema detecta ambos tokens expirados
  2. El sistema limpia tokens del cliente
  3. El sistema redirecciona a login
  4. El sistema muestra mensaje: "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
  5. **Fin del caso de uso**

#### Flujos de Excepción

**FE-001: Token ya inválido**
- En el paso 6, si el token ya estaba invalidado:
  1. El sistema registra el intento en logs
  2. Continúa con los pasos de limpieza (9-12)
  3. El proceso finaliza normalmente
  4. **Fin del caso de uso**

**FE-002: Error al invalidar token**
- En el paso 7, si falla la invalidación en BD:
  1. El sistema registra el error en logs
  2. El sistema continúa con limpieza del lado del cliente (pasos 9-11)
  3. El sistema redirecciona a login
  4. El token expirará naturalmente por tiempo
  5. **Fin del caso de uso**

**FE-003: Error de comunicación con servidor**
- Si hay error de red durante el logout:
  1. El sistema intenta reintentar una vez
  2. Si persiste el error, limpia tokens del cliente de todos modos
  3. El sistema redirecciona a login
  4. Muestra mensaje: "Sesión cerrada localmente. Verifica tu conexión."
  5. **Fin del caso de uso**

#### Postcondiciones

**Éxito:**
- Tokens JWT invalidados en servidor
- Tokens eliminados del cliente
- Estado de aplicación limpiado
- Evento de logout registrado en auditoría
- Usuario redirigido a página de login
- Usuario debe volver a autenticarse para acceder al sistema

**Fallo:**
- Tokens del cliente eliminados (aunque falle servidor)
- Usuario redirigido a login
- Puede registrarse error en logs pero no afecta al usuario

#### Reglas de Negocio

**RN-001:** El logout debe invalidar el refresh token en el servidor  
**RN-002:** Se debe registrar cada logout en auditoría  
**RN-003:** El logout por inactividad se configura por defecto en 30 minutos  
**RN-004:** La limpieza del estado del cliente es obligatoria incluso si falla el servidor  
**RN-005:** El diálogo de confirmación es opcional y se configura por cooperativa  
**RN-006:** Los tokens no se pueden reutilizar después de un logout exitoso  
**RN-007:** El logout cierra todas las sesiones del usuario (no sesiones parciales)

#### Requisitos No Funcionales

**RNF-001 (Performance):** El logout debe completarse en menos de 1 segundo  
**RNF-002 (Seguridad):** La invalidación del token debe ser efectiva inmediatamente  
**RNF-003 (Usabilidad):** El proceso debe ser simple y rápido  
**RNF-004 (Auditoría):** Todo logout debe quedar registrado  
**RNF-005 (Confiabilidad):** La limpieza del cliente debe funcionar incluso sin conexión  
**RNF-006 (UX):** Debe haber feedback visual durante el proceso

#### Referencias
- RF-AUTH-003: Cierre de Sesión (PRD)
- TICKET-016: Implementar endpoint POST /auth/logout
- CU-001: Iniciar sesión en el sistema
- CU-005: Refrescar token de sesión expirado

---

### CU-003: Recuperar contraseña olvidada

**Módulo:** Autenticación y Login  
**Identificador:** CU-003  
**Prioridad:** Media

#### Descripción
Permite a un usuario que olvidó su contraseña solicitar un proceso de recuperación mediante su email registrado, recibiendo un enlace temporal para establecer una nueva contraseña.

#### Actores
- **Actor Principal:** Usuario del sistema (sin autenticar)
- **Actores Secundarios:** Sistema de email, Sistema de auditoría

#### Precondiciones
1. El usuario debe estar registrado en el sistema
2. El usuario debe tener un email registrado en su perfil
3. El sistema de envío de emails debe estar operativo
4. El usuario debe tener acceso a su correo electrónico

#### Flujo Principal

1. El usuario accede a la página de login
2. El usuario hace clic en el link "¿Olvidaste tu contraseña?"
3. El sistema redirecciona a la página de recuperación de contraseña
4. El sistema presenta el formulario con:
   - Campo "Email" (obligatorio)
   - Botón "Enviar enlace de recuperación"
   - Link "Volver al login"
5. El usuario ingresa su email registrado
6. El usuario hace clic en "Enviar enlace de recuperación"
7. El sistema valida el formato del email
8. El sistema busca el usuario asociado al email (sin revelar si existe)
9. Si el usuario existe:
   a. El sistema invalida cualquier token de recuperación anterior del usuario
   b. El sistema genera un token único de recuperación (UUID)
   c. El sistema almacena el token en la tabla `password_reset_tokens` con:
      - Token generado
      - Usuario ID
      - Fecha de creación
      - Fecha de expiración (1 hora desde creación)
   d. El sistema construye URL de recuperación: `{BASE_URL}/reset-password?token={token}`
   e. El sistema envía email al usuario con:
      - Asunto: "Recuperación de contraseña - RRFinances"
      - Enlace de recuperación
      - Instrucciones
      - Tiempo de expiración (1 hora)
      - Advertencia de seguridad
   f. El sistema registra el evento en auditoría
10. El sistema muestra mensaje genérico (sin revelar si el email existe):
    - "Si el email está registrado, recibirás un enlace de recuperación en los próximos minutos."
11. El sistema redirecciona a página de confirmación
12. **Fin del caso de uso** (continúa en CU con el token)

#### Flujos Alternativos

**FA-001: Email no registrado**
- En el paso 9, si el email no existe en el sistema:
  1. El sistema NO envía ningún email
  2. El sistema registra el intento en logs (sin datos sensibles)
  3. El sistema muestra el MISMO mensaje genérico del paso 10
  4. Esto previene enumeración de usuarios
  5. **Fin del caso de uso**

**FA-002: Usuario cancela y vuelve al login**
- En cualquier momento antes del paso 6:
  1. El usuario hace clic en "Volver al login"
  2. El sistema redirecciona a la página de login
  3. No se realiza ninguna acción
  4. **Fin del caso de uso**

**FA-003: Solicitud duplicada en corto tiempo**
- Si el usuario solicita recuperación múltiples veces:
  1. El sistema invalida el token anterior
  2. El sistema genera un nuevo token
  3. Solo el token más reciente será válido
  4. Continúa con el flujo normal

#### Flujos de Excepción

**FE-001: Rate limiting excedido**
- Si se excede el límite de 3 solicitudes por hora:
  1. El sistema bloquea temporalmente solicitudes desde esa IP
  2. El sistema muestra mensaje: "Has excedido el límite de intentos. Intenta nuevamente en 1 hora."
  3. El sistema retorna error 429 Too Many Requests
  4. El sistema registra el intento en logs de seguridad
  5. **Fin del caso de uso**

**FE-002: Cuenta bloqueada o desactivada**
- En el paso 9, si la cuenta está bloqueada/desactivada:
  1. El sistema NO envía email
  2. El sistema registra el intento en auditoría
  3. El sistema muestra el mensaje genérico del paso 10 (por seguridad)
  4. **Fin del caso de uso**

**FE-003: Error al enviar email**
- En el paso 9e, si falla el envío de email:
  1. El sistema registra el error en logs
  2. El sistema reintenta envío 2 veces más
  3. Si persiste el error:
     - El sistema mantiene el token válido
     - Muestra mensaje: "Error temporal al enviar email. Intenta nuevamente en unos minutos."
     - El usuario puede reintentar más tarde
  4. **Fin del caso de uso**

**FE-004: Sistema de email no disponible**
- Si el servicio de email está completamente caído:
  1. El sistema detecta la indisponibilidad
  2. El sistema muestra mensaje: "Servicio temporalmente no disponible. Contacta al administrador."
  3. El sistema registra error crítico en logs
  4. No se genera token
  5. **Fin del caso de uso**

**FE-005: Formato de email inválido**
- En el paso 7, si el formato es inválido:
  1. El sistema muestra mensaje: "Por favor ingresa un email válido"
  2. El campo email se marca como inválido visualmente
  3. El botón de envío permanece deshabilitado
  4. El usuario debe corregir el email
  5. Continúa desde el paso 5

#### Postcondiciones

**Éxito:**
- Token de recuperación generado y almacenado
- Email con enlace de recuperación enviado (si usuario existe)
- Token anterior invalidado (si existía)
- Evento registrado en auditoría
- Usuario informado con mensaje genérico
- Token válido por 1 hora

**Fallo:**
- No se genera token
- No se envía email
- Usuario recibe mensaje de error o mensaje genérico (según caso)
- Evento de error registrado en logs

#### Reglas de Negocio

**RN-001:** El sistema nunca revela si un email está registrado o no (previene enumeración)  
**RN-002:** Solo puede existir un token de recuperación activo por usuario  
**RN-003:** El token de recuperación tiene validez de 1 hora  
**RN-004:** El token se genera con UUID v4 para máxima seguridad  
**RN-005:** Rate limiting: máximo 3 solicitudes por hora por IP  
**RN-006:** Los tokens anteriores se invalidan al generar uno nuevo  
**RN-007:** El email debe incluir advertencias de seguridad  
**RN-008:** No se envía email a cuentas bloqueadas o desactivadas  
**RN-009:** El token se invalida automáticamente tras su uso o expiración

#### Requisitos No Funcionales

**RNF-001 (Performance):** La solicitud debe procesarse en menos de 3 segundos  
**RNF-002 (Seguridad):** El token debe ser criptográficamente seguro (UUID v4)  
**RNF-003 (Seguridad):** El token debe transmitirse solo por HTTPS  
**RNF-004 (Usabilidad):** El mensaje debe ser claro y no técnico  
**RNF-005 (Privacidad):** No se debe revelar información sobre existencia de usuarios  
**RNF-006 (Confiabilidad):** El email debe enviarse en menos de 30 segundos  
**RNF-007 (Auditoría):** Todas las solicitudes deben registrarse  
**RNF-008 (Email):** El email debe ser responsive y accesible

#### Referencias
- RF-AUTH-002: Recuperación de Contraseña (PRD)
- TICKET-021: Implementar servicio de recuperación de contraseña
- TICKET-022: Crear endpoint POST /auth/forgot-password
- CU-001: Iniciar sesión en el sistema

---

### CU-004: Cambiar contraseña en primer acceso

**Módulo:** Autenticación y Login  
**Identificador:** CU-004  
**Prioridad:** Alta

#### Descripción
Obliga a los usuarios con contraseña temporal (nuevos usuarios o después de un reset administrativo) a establecer una contraseña personal en su primer inicio de sesión, garantizando que solo el usuario conozca su contraseña definitiva.

#### Actores
- **Actor Principal:** Usuario con contraseña temporal
- **Actores Secundarios:** Sistema de auditoría

#### Precondiciones
1. El usuario tiene una contraseña temporal asignada
2. El usuario acaba de autenticarse exitosamente (CU-001)
3. El sistema ha detectado que es el primer acceso o que la contraseña es temporal
4. El usuario tiene acceso a la interfaz del sistema

#### Flujo Principal

1. El sistema detecta que el usuario tiene contraseña temporal durante el login
2. El sistema genera un token temporal de cambio de contraseña
3. El sistema redirecciona automáticamente a la página de cambio obligatorio de contraseña
4. El sistema presenta formulario con:
   - Campo "Contraseña temporal actual" (prellenado y readonly)
   - Campo "Nueva contraseña" (obligatorio)
   - Campo "Confirmar nueva contraseña" (obligatorio)
   - Indicador visual de fortaleza de contraseña en tiempo real
   - Lista de requisitos de política de contraseña con checkmarks dinámicos
   - Botón "Establecer contraseña" (deshabilitado hasta que sea válida)
   - Mensaje: "Por seguridad, debes establecer tu propia contraseña"
5. El usuario ingresa su nueva contraseña en el campo correspondiente
6. El sistema valida en tiempo real la fortaleza de la contraseña mostrando:
   - Barra de progreso con colores (rojo=débil, amarillo=media, verde=fuerte)
   - Checkmarks verdes para cada requisito cumplido:
     * ✅ Mínimo 8 caracteres
     * ✅ Al menos una mayúscula
     * ✅ Al menos una minúscula
     * ✅ Al menos un número
     * ✅ Al menos un carácter especial
7. El usuario ingresa la confirmación de la contraseña
8. El sistema valida que ambas contraseñas coincidan en tiempo real
9. El usuario hace clic en "Establecer contraseña"
10. El sistema valida nuevamente todos los requisitos de la política
11. El sistema genera hash bcrypt de la nueva contraseña (10 rounds)
12. El sistema actualiza la contraseña en la tabla `users`:
    - Actualiza `password_hash`
    - Marca `requiere_cambio_password = false`
    - Actualiza `fecha_ultimo_cambio_password`
13. El sistema invalida todos los refresh tokens anteriores del usuario
14. El sistema genera nuevos tokens JWT (access y refresh)
15. El sistema registra el evento en auditoría:
    - Acción: "Cambio de contraseña en primer acceso"
    - Usuario ID
    - Fecha y hora
    - IP de origen
16. El sistema muestra mensaje de éxito: "Contraseña establecida exitosamente"
17. El sistema redirecciona al dashboard principal
18. El usuario puede continuar usando el sistema con normalidad
19. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Nueva contraseña igual a la temporal**
- En el paso 10, si la nueva contraseña es igual a la temporal:
  1. El sistema muestra mensaje: "La nueva contraseña debe ser diferente a la temporal"
  2. El campo "Nueva contraseña" se marca como inválido
  3. El botón "Establecer contraseña" permanece deshabilitado
  4. El usuario debe ingresar una contraseña diferente
  5. Continúa desde el paso 5

**FA-002: Usuario intenta salir sin cambiar contraseña**
- Si el usuario intenta cerrar o navegar fuera de la página:
  1. El sistema muestra diálogo de confirmación:
     - "Debes cambiar tu contraseña antes de continuar"
     - Botón "Entendido"
  2. El usuario no puede salir hasta completar el cambio
  3. La navegación es bloqueada
  4. Continúa desde el paso 4

**FA-003: Nueva contraseña muy similar a datos del usuario**
- En el paso 10, si la contraseña contiene el username, email o nombres:
  1. El sistema muestra warning: "Tu contraseña no debe contener tu nombre o email"
  2. El botón permanece deshabilitado
  3. El usuario debe elegir otra contraseña
  4. Continúa desde el paso 5

#### Flujos de Excepción

**FE-001: Contraseña no cumple política**
- En el paso 10, si la contraseña no cumple los requisitos:
  1. El sistema muestra mensaje específico por cada requisito faltante
  2. Los checkmarks de requisitos no cumplidos permanecen en rojo
  3. El botón permanece deshabilitado
  4. El usuario debe corregir la contraseña
  5. Continúa desde el paso 5

**FE-002: Contraseñas no coinciden**
- En el paso 8, si las contraseñas no coinciden:
  1. El sistema muestra mensaje: "Las contraseñas no coinciden"
  2. El campo de confirmación se marca como inválido
  3. El botón permanece deshabilitado
  4. El usuario debe corregir
  5. Continúa desde el paso 7

**FE-003: Sesión temporal expirada**
- Si el token temporal expira durante el proceso (ej: > 10 minutos):
  1. El sistema detecta token expirado
  2. El sistema muestra mensaje: "Tu sesión expiró. Por favor inicia sesión nuevamente."
  3. El sistema redirecciona a login
  4. El usuario debe autenticarse nuevamente
  5. Se reinicia el proceso desde el paso 1

**FE-004: Error al actualizar contraseña**
- En el paso 12, si falla la actualización en BD:
  1. El sistema registra el error en logs
  2. El sistema muestra mensaje: "Error al actualizar contraseña. Intenta nuevamente."
  3. El formulario permanece activo
  4. El usuario puede reintentar
  5. Continúa desde el paso 9

**FE-005: Contraseña en lista de contraseñas comunes**
- En el paso 10, si la contraseña está en una lista de passwords débiles conocidos:
  1. El sistema muestra mensaje: "Esta contraseña es muy común. Elige una más segura."
  2. El botón permanece deshabilitado
  3. El usuario debe elegir otra
  4. Continúa desde el paso 5

#### Postcondiciones

**Éxito:**
- Contraseña temporal reemplazada por contraseña personal
- Flag `requiere_cambio_password` establecido en false
- Nueva contraseña hasheada con bcrypt almacenada
- Fecha de último cambio actualizada
- Tokens anteriores invalidados
- Nuevos tokens JWT generados
- Evento registrado en auditoría
- Usuario puede usar el sistema normalmente

**Fallo:**
- Contraseña temporal permanece activa
- Usuario no puede acceder al sistema hasta completar el cambio
- Evento de error registrado en logs

#### Reglas de Negocio

**RN-001:** El cambio de contraseña es obligatorio en primer acceso  
**RN-002:** La nueva contraseña debe cumplir TODAS las políticas de seguridad  
**RN-003:** La nueva contraseña debe ser diferente a la temporal  
**RN-004:** El proceso no puede ser omitido o cancelado  
**RN-005:** La sesión temporal tiene validez máxima de 10 minutos  
**RN-006:** Se invalidan todos los tokens anteriores tras el cambio  
**RN-007:** La nueva contraseña no puede contener username o email del usuario  
**RN-008:** Se debe validar contra lista de contraseñas comunes  
**RN-009:** El cambio se registra en auditoría con fecha/hora/IP

#### Política de Contraseñas
- Mínimo 8 caracteres
- Al menos una letra mayúscula (A-Z)
- Al menos una letra minúscula (a-z)
- Al menos un número (0-9)
- Al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)
- No debe contener el username
- No debe contener el email
- No debe estar en lista de contraseñas comunes

#### Requisitos No Funcionales

**RNF-001 (Performance):** La validación en tiempo real debe ser instantánea (< 100ms)  
**RNF-002 (Seguridad):** La contraseña nunca se envía en texto plano  
**RNF-003 (Seguridad):** El hash debe usar bcrypt con factor de costo 10  
**RNF-004 (Usabilidad):** El indicador de fortaleza debe ser visual e intuitivo  
**RNF-005 (Usabilidad):** Los requisitos deben mostrarse claramente con feedback inmediato  
**RNF-006 (Seguridad):** La página no puede ser sorteada ni cerrada  
**RNF-007 (Auditoría):** El cambio debe registrarse en logs de auditoría  
**RNF-008 (Accesibilidad):** El formulario debe ser accesible con teclado  
**RNF-009 (UX):** Debe haber feedback visual claro de validaciones

#### Referencias
- RF-AUTH-001: Login de Usuario (PRD)
- TICKET-024: Crear servicio de validación de política de contraseñas
- CU-001: Iniciar sesión en el sistema
- CU-003: Recuperar contraseña olvidada

---

### CU-005: Refrescar token de sesión expirado

**Módulo:** Autenticación y Login  
**Identificador:** CU-005  
**Prioridad:** Alta

#### Descripción
Permite al sistema renovar automáticamente el access token expirado utilizando el refresh token válido, manteniendo la sesión del usuario activa sin necesidad de volver a iniciar sesión, mejorando la experiencia de usuario.

#### Actores
- **Actor Principal:** Sistema frontend (automático)
- **Actores Secundarios:** Usuario autenticado (pasivo), Sistema de auditoría

#### Precondiciones
1. El usuario tiene una sesión activa (ha iniciado sesión previamente)
2. El access token ha expirado o está próximo a expirar
3. El refresh token está almacenado en el cliente y sigue siendo válido
4. El sistema backend está operativo

#### Flujo Principal

1. El usuario realiza una acción que requiere autenticación (ej: consultar datos, guardar información)
2. El frontend detecta que el access token ha expirado o expirará en los próximos 5 minutos
3. El interceptor HTTP captura la necesidad de refresh
4. El sistema frontend extrae el refresh token del almacenamiento local
5. El sistema frontend envía petición a `POST /api/v1/auth/refresh` con:
   - Refresh token en el body o header
6. El sistema backend recibe la petición
7. El sistema backend valida el formato del refresh token
8. El sistema backend decodifica el refresh token
9. El sistema backend verifica:
   - Que el token no ha expirado (validez de 7 días)
   - Que el token está en la whitelist (no ha sido invalidado)
   - Que el usuario asociado existe y está activo
   - Que la cooperativa asociada existe y está activa
10. El sistema backend genera un nuevo access token con:
    - Payload: userId, username, roles, cooperativaId
    - Expiración: 1 hora desde generación
11. (Opcional) El sistema backend rota el refresh token:
    - Genera nuevo refresh token
    - Invalida el refresh token anterior
    - Expiración: 7 días desde generación
12. El sistema backend registra el evento de refresh en auditoría (opcional, para sesiones largas)
13. El sistema backend responde con status 200 y:
    ```json
    {
      "accessToken": "nuevo.jwt.token",
      "refreshToken": "nuevo.refresh.token", // opcional
      "expiresIn": 3600
    }
    ```
14. El frontend recibe la respuesta
15. El frontend almacena el nuevo access token (y nuevo refresh token si aplica)
16. El frontend reintenta automáticamente la petición original con el nuevo token
17. La petición original se completa exitosamente
18. El usuario continúa su trabajo sin interrupción ni notificación
19. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Refresh proactivo antes de expiración**
- En el paso 2, si el token está próximo a expirar (< 5 minutos):
  1. El sistema realiza refresh proactivo en background
  2. El usuario no nota ninguna interrupción
  3. La petición original continúa con el token actual
  4. El nuevo token se usará en peticiones subsiguientes
  5. Continúa desde el paso 4

**FA-002: Refresh token rotado**
- En el paso 11, si la configuración tiene rotación habilitada:
  1. El sistema backend genera nuevo refresh token
  2. El sistema invalida el refresh token anterior en BD
  3. El sistema retorna ambos tokens (access y refresh)
  4. El frontend almacena ambos tokens nuevos
  5. Continúa desde el paso 14

**FA-003: Refresh sin rotación**
- En el paso 11, si NO hay rotación de refresh tokens:
  1. Se omite la generación de nuevo refresh token
  2. El refresh token actual permanece válido
  3. Solo se retorna nuevo access token
  4. El frontend solo actualiza access token
  5. Continúa desde el paso 14

#### Flujos de Excepción

**FE-001: Refresh token expirado**
- En el paso 9, si el refresh token ha expirado (> 7 días):
  1. El sistema backend retorna error 401 Unauthorized con:
     ```json
     {
       "error": "refresh_token_expired",
       "message": "Tu sesión expiró"
     }
     ```
  2. El frontend detecta el error
  3. El frontend limpia todos los tokens almacenados
  4. El frontend muestra mensaje: "Tu sesión expiró. Por favor inicia sesión nuevamente."
  5. El frontend redirecciona automáticamente a la página de login
  6. El usuario debe volver a autenticarse
  7. **Fin del caso de uso**

**FE-002: Refresh token invalidado (logout previo)**
- En el paso 9, si el token está en blacklist:
  1. El sistema backend verifica que el token fue invalidado (logout manual)
  2. El sistema retorna error 401 Unauthorized con:
     ```json
     {
       "error": "refresh_token_revoked",
       "message": "Token inválido"
     }
     ```
  3. El frontend limpia tokens
  4. El frontend muestra mensaje: "Tu sesión es inválida. Por favor inicia sesión."
  5. El frontend redirecciona a login
  6. **Fin del caso de uso**

**FE-003: Usuario desactivado**
- En el paso 9, si el usuario fue desactivado:
  1. El sistema backend detecta usuario inactivo
  2. El sistema backend invalida el refresh token
  3. El sistema retorna error 403 Forbidden con:
     ```json
     {
       "error": "user_disabled",
       "message": "Tu cuenta ha sido desactivada"
     }
     ```
  4. El frontend limpia tokens
  5. El frontend muestra mensaje: "Tu cuenta ha sido desactivada. Contacta al administrador."
  6. El frontend redirecciona a login
  7. **Fin del caso de uso**

**FE-004: Cooperativa desactivada**
- En el paso 9, si la cooperativa fue desactivada:
  1. El sistema backend detecta cooperativa inactiva
  2. El sistema retorna error 403 Forbidden
  3. El frontend muestra mensaje: "La cooperativa ha sido desactivada. Contacta soporte."
  4. El frontend limpia tokens y redirecciona a login
  5. **Fin del caso de uso**

**FE-005: Refresh token malformado o inválido**
- En el paso 7-8, si el token es inválido:
  1. El sistema backend retorna error 401 Unauthorized
  2. El frontend limpia tokens
  3. El frontend redirecciona a login con mensaje: "Sesión inválida. Inicia sesión nuevamente."
  4. **Fin del caso de uso**

**FE-006: Error del servidor durante refresh**
- En cualquier paso del backend, si ocurre error técnico:
  1. El sistema backend registra error en logs
  2. El sistema retorna error 500 Internal Server Error
  3. El frontend mantiene los tokens actuales
  4. El frontend reintenta una vez más después de 1 segundo
  5. Si persiste, muestra mensaje: "Error temporal. Recarga la página."
  6. Si el usuario recarga, volverá a intentar refresh
  7. Si falla múltiples veces, redirecciona a login
  8. **Fin del caso de uso**

**FE-007: Múltiples intentos simultáneos de refresh**
- Si hay múltiples peticiones con token expirado simultáneamente:
  1. El interceptor frontend detecta refresh en progreso
  2. Las peticiones adicionales se ponen en cola (queuing)
  3. Se espera el resultado del primer refresh
  4. Si exitoso, todas las peticiones en cola usan el nuevo token
  5. Si falla, todas las peticiones reciben el error
  6. Continúa según el resultado

#### Postcondiciones

**Éxito:**
- Nuevo access token generado y almacenado
- (Opcional) Nuevo refresh token generado y almacenado
- Token anterior invalidado (si hay rotación)
- Sesión del usuario extendida
- Petición original completada exitosamente
- Usuario continúa trabajando sin interrupción

**Fallo:**
- Tokens eliminados del cliente
- Sesión terminada
- Usuario redirigido a login
- Debe volver a autenticarse

#### Reglas de Negocio

**RN-001:** El refresh solo es posible con un refresh token válido  
**RN-002:** El refresh token tiene validez de 7 días  
**RN-003:** El nuevo access token tiene validez de 1 hora  
**RN-004:** El refresh proactivo se realiza 5 minutos antes de expiración  
**RN-005:** La rotación de refresh tokens es opcional y configurable  
**RN-006:** Un refresh token invalidado no puede ser reutilizado  
**RN-007:** El refresh falla si el usuario o cooperativa están desactivados  
**RN-008:** Múltiples refresh simultáneos se manejan con queuing  
**RN-009:** El proceso debe ser transparente para el usuario

#### Requisitos No Funcionales

**RNF-001 (Performance):** El refresh debe completarse en menos de 1 segundo  
**RNF-002 (Seguridad):** El refresh token debe validarse completamente  
**RNF-003 (Usabilidad):** El proceso debe ser invisible para el usuario  
**RNF-004 (Confiabilidad):** Debe manejar correctamente errores de red  
**RNF-005 (Escalabilidad):** Debe soportar múltiples refresh concurrentes  
**RNF-006 (Seguridad):** Los tokens nunca se exponen en URLs o logs  
**RNF-007 (UX):** No debe haber parpadeos o interrupciones visuales

#### Referencias
- RF-AUTH-004: Gestión de Sesiones (PRD)
- TICKET-012: Implementar generación y validación de JWT
- TICKET-015: Implementar endpoint POST /auth/refresh
- CU-001: Iniciar sesión en el sistema
- CU-002: Cerrar sesión

---

## 📊 RESUMEN DEL MÓDULO 1

**Casos de Uso Documentados:** 5 de 5 (100%)

| CU | Nombre | Prioridad | Estado |
|----|--------|-----------|--------|
| CU-001 | Iniciar sesión en el sistema | Crítica | ✅ Completo |
| CU-002 | Cerrar sesión | Alta | ✅ Completo |
| CU-003 | Recuperar contraseña olvidada | Media | ✅ Completo |
| CU-004 | Cambiar contraseña en primer acceso | Alta | ✅ Completo |
| CU-005 | Refrescar token de sesión expirado | Alta | ✅ Completo |

---

**Estado:** ✅ Módulo 1 completado  
**Fecha:** 17 de Diciembre de 2025

---

## MÓDULO 2: GESTIÓN DE USUARIOS

### CU-006: Crear nuevo usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-006  
**Prioridad:** Alta

#### Descripción
Permite a un administrador crear una nueva cuenta de usuario en el sistema, asignando roles, permisos y configurando los datos básicos necesarios para que el usuario pueda acceder al sistema.

#### Actores
- **Actor Principal:** Administrador o SuperAdmin
- **Actores Secundarios:** Sistema de auditoría, Sistema de email (opcional)

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Gestion.Crear"
3. El actor debe tener acceso al módulo de Gestión de Usuarios
4. La cooperativa del actor debe estar activa
5. Debe existir al menos un rol disponible para asignar

#### Flujo Principal

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios existentes con botón "Crear Usuario"
3. El administrador hace clic en "Crear Usuario"
4. El sistema presenta el formulario de creación con las siguientes secciones:

   **Sección 1: Datos de Acceso**
   - Campo "Nombre de usuario" (obligatorio, único)
   - Campo "Email" (obligatorio, único, formato email)
   - Checkbox "Generar contraseña temporal automáticamente" (marcado por defecto)
   - Campo "Contraseña temporal" (opcional, solo si checkbox desmarcado)
   - Checkbox "Requerir cambio de contraseña en primer acceso" (marcado por defecto)

   **Sección 2: Datos Personales**
   - Campo "Tipo de identificación" (dropdown: Cédula, Pasaporte, RUC)
   - Campo "Número de identificación" (obligatorio, validación según tipo)
   - Campo "Nombres" (obligatorio)
   - Campo "Apellidos" (obligatorio)
   - Campo "Fecha de nacimiento" (datepicker, opcional)
   - Campo "Género" (dropdown: Masculino, Femenino, Otro, opcional)

   **Sección 3: Datos de Contacto**
   - Campo "Email secundario" (opcional)
   - Campo "Teléfono móvil" (obligatorio, formato: +593...)
   - Campo "Teléfono fijo" (opcional)
   - Campo "Dirección" (opcional)

   **Sección 4: Roles y Permisos**
   - Lista de checkboxes con roles disponibles (selección múltiple)
   - Indicador visual de permisos incluidos en cada rol (tooltip)
   - Al menos un rol debe ser seleccionado

   **Sección 5: Configuración Adicional**
   - Dropdown "Sucursal asignada" (opcional, si aplica)
   - Dropdown "Departamento" (opcional)
   - Campo "Cargo/Posición" (opcional)
   - Toggle "Estado activo" (activado por defecto)
   - Campo "Observaciones" (textarea, opcional)

5. El administrador completa los campos obligatorios del formulario
6. El sistema valida en tiempo real cada campo:
   - Username: único, alfanumérico, 4-30 caracteres
   - Email: formato válido, único en el sistema
   - Identificación: formato válido según tipo, único
   - Teléfono: formato ecuatoriano válido
7. El administrador selecciona al menos un rol
8. El administrador hace clic en botón "Guardar Usuario"
9. El sistema realiza validaciones finales:
   - Todos los campos obligatorios completos
   - Formatos correctos
   - Username único en la cooperativa
   - Email único en el sistema
   - Identificación única en la cooperativa
   - Al menos un rol seleccionado
10. El sistema genera contraseña temporal si está activada la opción:
    - Genera contraseña aleatoria de 12 caracteres
    - Cumple política de seguridad
11. El sistema hashea la contraseña con bcrypt (10 rounds)
12. El sistema crea registro en tabla `personas`:
    - Inserta datos personales y de contacto
    - Asigna cooperativa_id del administrador
    - Marca timestamps de creación
13. El sistema crea registro en tabla `users`:
    - Vincula con persona_id
    - Almacena username, email, password_hash
    - Establece estado = 'activo'
    - Marca requiere_cambio_password = true
    - Asigna cooperativa_id
14. El sistema crea registros en tabla `user_roles`:
    - Vincula usuario con roles seleccionados
15. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Crear
    - Usuario creador: ID del administrador
    - Datos nuevos: información del usuario (sin contraseña)
    - IP y timestamp
16. (Opcional) El sistema envía email al nuevo usuario con:
    - Bienvenida al sistema
    - Username asignado
    - Contraseña temporal (si aplica)
    - URL de acceso
    - Instrucciones de primer acceso
17. El sistema muestra mensaje de éxito:
    - "Usuario creado exitosamente"
    - Muestra username y contraseña temporal generada (para que el admin la copie)
    - Opción "Copiar contraseña"
18. El sistema redirecciona a la vista de detalle del usuario creado
19. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Username ya existe**
- En el paso 9, si el username ya está registrado en la cooperativa:
  1. El sistema muestra error: "El nombre de usuario ya existe. Elige otro."
  2. El campo username se marca en rojo
  3. El foco se coloca en el campo username
  4. El usuario permanece en el formulario
  5. Continúa desde el paso 5

**FA-002: Email ya existe**
- En el paso 9, si el email ya está registrado en el sistema:
  1. El sistema muestra error: "El email ya está registrado en el sistema"
  2. El sistema puede mostrar opción "¿Es el mismo usuario? Ver usuario existente"
  3. El campo email se marca en rojo
  4. Continúa desde el paso 5

**FA-003: Identificación ya existe**
- En el paso 9, si la identificación ya existe en la cooperativa:
  1. El sistema muestra advertencia: "Ya existe una persona con esta identificación"
  2. El sistema ofrece opciones:
     - "Ver persona existente"
     - "Continuar de todos modos" (si tiene permisos)
  3. Si el admin elige ver persona existente:
     - Muestra modal con datos de la persona
     - Opción "Crear usuario para esta persona" (si no tiene usuario)
  4. Si el admin elige continuar:
     - El sistema valida que no exista usuario para esa persona
     - Continúa desde el paso 10

**FA-004: Crear usuario con identificación existente sin usuario**
- En el paso 9, si existe persona pero no tiene usuario:
  1. El sistema detecta persona existente en tabla `personas`
  2. El sistema muestra mensaje: "Se encontró una persona con esta identificación"
  3. El sistema muestra datos de la persona encontrada
  4. El sistema pregunta: "¿Deseas crear usuario para esta persona?"
  5. Si el admin confirma:
     - El sistema prellenará datos personales
     - El admin solo completa datos de acceso y roles
     - El sistema NO crea nuevo registro en `personas`
     - El sistema vincula el nuevo user con persona_id existente
  6. Continúa desde el paso 13

**FA-005: Contraseña temporal manual**
- En el paso 4, si el admin desmarca "Generar automáticamente":
  1. El campo "Contraseña temporal" se habilita
  2. El admin ingresa contraseña manual
  3. El sistema valida que cumpla política de seguridad
  4. El sistema muestra indicador de fortaleza en tiempo real
  5. Continúa con el flujo normal desde el paso 8

**FA-006: Admin cancela creación**
- En cualquier momento antes del paso 8:
  1. El admin hace clic en "Cancelar"
  2. El sistema muestra diálogo de confirmación: "¿Descartar cambios?"
  3. Si el admin confirma:
     - El sistema descarta el formulario
     - Redirecciona a lista de usuarios
  4. Si el admin cancela:
     - Permanece en el formulario
     - Continúa desde el paso 5

**FA-007: Envío de email falla**
- En el paso 16, si falla el envío de email:
  1. El sistema registra el error en logs
  2. El usuario SE CREA de todos modos (email no es crítico)
  3. El sistema muestra advertencia: "Usuario creado pero no se pudo enviar email"
  4. El sistema muestra la contraseña temporal para que el admin la comparta manualmente
  5. Continúa desde el paso 17

#### Flujos de Excepción

**FE-001: Sin permisos para crear usuarios**
- En el paso 3, si el actor no tiene permisos:
  1. El sistema no muestra el botón "Crear Usuario"
  2. Si intenta acceder directamente a la URL:
     - El sistema retorna error 403 Forbidden
     - Muestra mensaje: "No tienes permisos para crear usuarios"
     - Redirecciona a dashboard o vista anterior
  3. **Fin del caso de uso**

**FE-002: Campos obligatorios incompletos**
- En el paso 9, si faltan campos obligatorios:
  1. El sistema previene el guardado
  2. El sistema marca todos los campos obligatorios faltantes en rojo
  3. El sistema muestra mensaje: "Completa todos los campos obligatorios"
  4. El sistema hace scroll al primer campo faltante
  5. El formulario permanece abierto
  6. Continúa desde el paso 5

**FE-003: Formato de datos inválido**
- En el paso 9, si hay formatos inválidos:
  1. El sistema muestra errores específicos:
     - Email: "Formato de email inválido"
     - Teléfono: "Formato de teléfono inválido (debe ser +593...)"
     - Cédula: "Cédula ecuatoriana inválida (10 dígitos)"
     - RUC: "RUC ecuatoriano inválido (13 dígitos)"
  2. Los campos inválidos se marcan en rojo
  3. El formulario no se envía
  4. Continúa desde el paso 5

**FE-004: No se seleccionó ningún rol**
- En el paso 9, si no hay roles seleccionados:
  1. El sistema muestra error: "Debes seleccionar al menos un rol"
  2. La sección de roles se marca en rojo
  3. El formulario no se envía
  4. Continúa desde el paso 7

**FE-005: Error al crear en base de datos**
- En el paso 12-14, si falla la transacción:
  1. El sistema hace rollback completo
  2. No se crea ni persona ni usuario
  3. El sistema registra error en logs
  4. El sistema muestra mensaje: "Error al crear usuario. Intenta nuevamente."
  5. El formulario permanece con los datos ingresados
  6. El admin puede reintentar desde el paso 8

**FE-006: Contraseña temporal manual no cumple política**
- En FA-005, si la contraseña no cumple requisitos:
  1. El sistema muestra mensaje: "La contraseña no cumple la política de seguridad"
  2. El sistema lista los requisitos no cumplidos
  3. El campo se marca en rojo
  4. El botón "Guardar" permanece deshabilitado
  5. Continúa desde el paso 5 de FA-005

**FE-007: Límite de usuarios alcanzado**
- En el paso 9, si la cooperativa alcanzó su límite de usuarios (según licencia):
  1. El sistema verifica límite de licencia
  2. El sistema muestra error: "Se alcanzó el límite de usuarios permitidos. Contacta a soporte para ampliar."
  3. El sistema no permite crear el usuario
  4. El sistema registra intento en auditoría
  5. **Fin del caso de uso**

#### Postcondiciones

**Éxito:**
- Nuevo usuario creado en tabla `users`
- Registro de persona creado o vinculado en tabla `personas`
- Roles asignados en tabla `user_roles`
- Usuario con estado activo
- Flag requiere_cambio_password establecido
- Contraseña temporal hasheada almacenada
- Evento registrado en auditoría
- Email de bienvenida enviado (opcional)
- Usuario puede iniciar sesión con credenciales temporales

**Fallo:**
- No se crea ningún registro (rollback completo)
- Evento de error registrado en logs
- Administrador recibe mensaje de error
- Formulario permanece con datos ingresados para corrección

#### Reglas de Negocio

**RN-001:** El username debe ser único dentro de la cooperativa  
**RN-002:** El email debe ser único en todo el sistema (todas las cooperativas)  
**RN-003:** La identificación debe ser única dentro de la cooperativa  
**RN-004:** Todo usuario debe tener al menos un rol asignado  
**RN-005:** La contraseña temporal debe cumplir la política de seguridad  
**RN-006:** Por defecto se requiere cambio de contraseña en primer acceso  
**RN-007:** Solo usuarios con permisos de creación pueden crear usuarios  
**RN-008:** Los usuarios se crean siempre en estado activo por defecto  
**RN-009:** El usuario heredará el cooperativa_id del administrador que lo crea  
**RN-010:** Si existe persona con misma identificación, se reutiliza (no duplicar personas)  
**RN-011:** La contraseña temporal generada automáticamente tiene 12 caracteres  
**RN-012:** El envío de email es opcional y no crítico (no detiene la creación)

#### Validaciones de Formatos

**Username:**
- Alfanumérico (permite guiones y guiones bajos)
- Longitud: 4-30 caracteres
- No espacios
- Case sensitive

**Email:**
- Formato RFC 5322 válido
- Ejemplo: usuario@ejemplo.com

**Cédula ecuatoriana:**
- Exactamente 10 dígitos numéricos
- Validación de dígito verificador (algoritmo módulo 10)

**RUC ecuatoriano:**
- Exactamente 13 dígitos numéricos
- Termina en 001
- Validación de dígito verificador

**Teléfono móvil:**
- Formato: +593 9XX XXX XXX
- Inicia con +593 9
- 12 caracteres total con código de país

**Teléfono fijo:**
- Formato: +593 X XXX XXXX
- Inicia con +593
- 11 caracteres total con código de país

#### Requisitos No Funcionales

**RNF-001 (Performance):** El formulario debe cargar en menos de 2 segundos  
**RNF-002 (Performance):** La validación en tiempo real debe responder en < 300ms  
**RNF-003 (Performance):** La creación completa debe tomar menos de 3 segundos  
**RNF-004 (Seguridad):** La contraseña nunca se muestra ni se registra en logs  
**RNF-005 (Seguridad):** La contraseña temporal debe mostrarse una sola vez al crear  
**RNF-006 (Usabilidad):** Los errores de validación deben ser claros y específicos  
**RNF-007 (Usabilidad):** Los campos obligatorios deben estar claramente marcados (*)  
**RNF-008 (Auditoría):** Toda creación debe registrarse con datos completos  
**RNF-009 (Transaccionalidad):** La creación debe ser atómica (todo o nada)  
**RNF-010 (Accesibilidad):** El formulario debe ser navegable con teclado  
**RNF-011 (UX):** Debe haber feedback visual inmediato en validaciones

#### Referencias
- RF-USER-001: Gestión de Usuarios (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-050+: Implementar CRUD de usuarios
- CU-001: Iniciar sesión en el sistema
- CU-007: Editar usuario existente
- CU-008: Desactivar usuario

---

### CU-007: Editar usuario existente

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-007  
**Prioridad:** Alta

#### Descripción
Permite a un administrador modificar la información de un usuario existente en el sistema, incluyendo datos personales, de contacto, roles asignados y configuraciones, manteniendo la trazabilidad de los cambios realizados.

#### Actores
- **Actor Principal:** Administrador o SuperAdmin
- **Actores Secundarios:** Sistema de auditoría

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Gestion.Editar"
3. El usuario a editar debe existir en el sistema
4. El usuario a editar debe pertenecer a la misma cooperativa del administrador (excepto SuperAdmin)
5. El actor debe tener acceso al módulo de Gestión de Usuarios

#### Flujo Principal

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios con opciones de búsqueda y filtros
3. El administrador localiza el usuario que desea editar mediante:
   - Búsqueda por nombre, username o email
   - Navegación en la lista paginada
   - Filtros por rol, estado, sucursal
4. El administrador hace clic en el botón "Editar" (ícono de lápiz) del usuario
5. El sistema valida que el administrador tenga permisos para editar ese usuario
6. El sistema carga y presenta el formulario de edición prellenado con:

   **Sección 1: Datos de Acceso**
   - Campo "Nombre de usuario" (readonly, no editable)
   - Campo "Email" (editable, único)
   - Botón "Restablecer contraseña" (acción separada)
   - Toggle "Requerir cambio de contraseña en próximo acceso"
   - Badge de estado actual del usuario (Activo/Inactivo/Bloqueado)

   **Sección 2: Datos Personales**
   - Campo "Tipo de identificación" (readonly)
   - Campo "Número de identificación" (readonly)
   - Campo "Nombres" (editable)
   - Campo "Apellidos" (editable)
   - Campo "Fecha de nacimiento" (editable)
   - Campo "Género" (editable)

   **Sección 3: Datos de Contacto**
   - Campo "Email secundario" (editable)
   - Campo "Teléfono móvil" (editable)
   - Campo "Teléfono fijo" (editable)
   - Campo "Dirección" (editable)

   **Sección 4: Roles y Permisos**
   - Lista de checkboxes con roles disponibles (prellenados con roles actuales)
   - Indicador de cambios respecto a roles actuales
   - Al menos un rol debe permanecer seleccionado
   - Alerta si se están removiendo roles

   **Sección 5: Configuración Adicional**
   - Dropdown "Sucursal asignada" (editable)
   - Dropdown "Departamento" (editable)
   - Campo "Cargo/Posición" (editable)
   - Campo "Observaciones" (editable)
   - Toggle "Estado activo" (editable)
   - Información de auditoría (readonly):
     * Fecha de creación
     * Usuario creador
     * Última modificación
     * Usuario que modificó

7. El administrador modifica los campos deseados
8. El sistema valida en tiempo real cada campo modificado:
   - Email: formato válido, único en el sistema
   - Teléfono: formato ecuatoriano válido
   - Roles: al menos uno seleccionado
9. El administrador hace clic en botón "Guardar Cambios"
10. El sistema detecta qué campos fueron modificados (comparación con datos originales)
11. El sistema realiza validaciones finales:
    - Email único (si fue modificado)
    - Formatos correctos
    - Al menos un rol seleccionado
    - El usuario no se está auto-desactivando (si es el mismo usuario logueado)
12. El sistema captura el estado anterior del usuario (para auditoría)
13. El sistema actualiza registro en tabla `personas`:
    - Actualiza solo los campos modificados de datos personales y contacto
    - Actualiza updated_at timestamp
14. El sistema actualiza registro en tabla `users`:
    - Actualiza email si fue modificado
    - Actualiza estado si fue modificado
    - Actualiza requiere_cambio_password si fue modificado
    - Actualiza updated_at timestamp
15. El sistema actualiza roles en tabla `user_roles`:
    - Elimina roles desmarcados
    - Agrega nuevos roles marcados
    - Mantiene roles sin cambios
16. El sistema invalida caché de permisos del usuario (si existe Redis)
17. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Editar
    - Usuario editor: ID del administrador
    - Entidad ID: ID del usuario editado
    - Datos anteriores: campos antes de la edición
    - Datos nuevos: campos después de la edición
    - IP, timestamp, detalles específicos de cambios
18. Si se modificaron roles, el sistema registra evento adicional:
    - Acción: Modificar Roles
    - Roles anteriores vs nuevos roles
19. El sistema muestra mensaje de éxito: "Usuario actualizado exitosamente"
20. El sistema actualiza la vista con los nuevos datos
21. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Email modificado ya existe**
- En el paso 11, si el nuevo email ya está registrado:
  1. El sistema muestra error: "El email ya está registrado en el sistema"
  2. El campo email se marca en rojo
  3. El sistema muestra el usuario que tiene ese email (si tiene permisos para verlo)
  4. El formulario no se guarda
  5. Continúa desde el paso 7

**FA-002: Administrador no modifica nada**
- En el paso 10, si no hay cambios:
  1. El sistema detecta que no hubo modificaciones
  2. El sistema muestra mensaje informativo: "No se realizaron cambios"
  3. El sistema NO registra evento en auditoría
  4. El formulario permanece abierto
  5. El administrador puede continuar editando o cerrar
  6. **Fin del caso de uso**

**FA-003: Intento de remover todos los roles**
- En el paso 11, si se intentan remover todos los roles:
  1. El sistema muestra error: "El usuario debe tener al menos un rol asignado"
  2. La sección de roles se marca en rojo
  3. El formulario no se guarda
  4. El sistema sugiere desactivar el usuario si esa es la intención
  5. Continúa desde el paso 7

**FA-004: Modificación de roles críticos**
- En el paso 15, si se remueve rol de SuperAdmin o Admin:
  1. El sistema verifica que no sea el último SuperAdmin del sistema
  2. Si es el último SuperAdmin:
     - El sistema previene la modificación
     - Muestra error: "No puedes remover el rol SuperAdmin del único SuperAdmin del sistema"
     - El cambio no se aplica
  3. Si no es el último:
     - El sistema muestra confirmación: "Estás removiendo un rol administrativo. ¿Confirmas?"
     - Si el admin confirma, continúa con el flujo
     - Si cancela, vuelve al paso 7

**FA-005: Administrador cancela edición**
- En cualquier momento antes del paso 9:
  1. El admin hace clic en "Cancelar" o cierra el formulario
  2. Si hay cambios sin guardar:
     - El sistema muestra diálogo: "Tienes cambios sin guardar. ¿Deseas descartarlos?"
     - Botones: "Descartar cambios" y "Continuar editando"
  3. Si el admin confirma descartar:
     - El sistema cierra el formulario
     - No se guardan cambios
     - Redirecciona a lista de usuarios
  4. Si elige continuar editando:
     - Permanece en el formulario
     - Continúa desde el paso 7

**FA-006: Restablecer contraseña durante edición**
- En el paso 7, si el admin hace clic en "Restablecer contraseña":
  1. El sistema muestra modal de confirmación
  2. El sistema genera nueva contraseña temporal
  3. El sistema actualiza la contraseña del usuario
  4. El sistema marca requiere_cambio_password = true
  5. El sistema muestra la contraseña temporal con opción "Copiar"
  6. El sistema registra evento de reset de contraseña en auditoría
  7. El admin debe comunicar la nueva contraseña al usuario
  8. El formulario de edición permanece abierto
  9. Continúa desde el paso 7

**FA-007: Auto-edición (usuario se edita a sí mismo)**
- En el paso 5, si el usuario a editar es el mismo que está logueado:
  1. El sistema aplica restricciones adicionales:
     - No puede modificar su propio estado (no puede auto-desactivarse)
     - No puede modificar sus propios roles (previene auto-escalación)
     - Puede modificar sus datos personales y de contacto
  2. El sistema muestra advertencia: "Estás editando tu propio usuario. Algunas opciones están restringidas."
  3. Los campos restringidos aparecen en readonly
  4. Continúa con el flujo normal

#### Flujos de Excepción

**FE-001: Sin permisos para editar usuarios**
- En el paso 5, si el actor no tiene permisos:
  1. El sistema retorna error 403 Forbidden
  2. El sistema muestra mensaje: "No tienes permisos para editar usuarios"
  3. El formulario no se carga
  4. Redirecciona a la lista de usuarios
  5. **Fin del caso de uso**

**FE-002: Usuario a editar no existe**
- En el paso 5, si el usuario fue eliminado/no existe:
  1. El sistema retorna error 404 Not Found
  2. El sistema muestra mensaje: "El usuario no existe o fue eliminado"
  3. Redirecciona a la lista de usuarios
  4. **Fin del caso de uso**

**FE-003: Usuario pertenece a otra cooperativa**
- En el paso 5, si el usuario no pertenece a la cooperativa del admin:
  1. El sistema verifica cooperativa_id
  2. Si el admin NO es SuperAdmin:
     - Retorna error 403 Forbidden
     - Muestra mensaje: "No tienes permisos para editar usuarios de otras cooperativas"
     - Redirecciona a lista
  3. Si es SuperAdmin:
     - Permite la edición (tiene permisos globales)
  4. **Fin del caso de uso**

**FE-004: Formato de datos inválido**
- En el paso 11, si hay formatos inválidos:
  1. El sistema muestra errores específicos:
     - Email: "Formato de email inválido"
     - Teléfono: "Formato de teléfono inválido (+593...)"
  2. Los campos inválidos se marcan en rojo
  3. El formulario no se guarda
  4. Continúa desde el paso 7

**FE-005: Error al actualizar en base de datos**
- En el paso 13-15, si falla la transacción:
  1. El sistema hace rollback completo
  2. Ningún cambio se aplica
  3. El sistema registra error en logs
  4. El sistema muestra mensaje: "Error al actualizar usuario. Intenta nuevamente."
  5. El formulario permanece con los datos ingresados
  6. El admin puede reintentar desde el paso 9

**FE-006: Conflicto de concurrencia**
- En el paso 11, si otro usuario editó el mismo registro:
  1. El sistema detecta que updated_at cambió desde que se cargó el formulario
  2. El sistema muestra advertencia: "Otro usuario modificó este registro. Recargando datos..."
  3. El sistema recarga el formulario con datos actualizados
  4. El sistema resalta los campos que tienen conflictos
  5. El admin debe revisar y decidir qué cambios aplicar
  6. Continúa desde el paso 7

**FE-007: Usuario está bloqueado**
- En el paso 6, si el usuario está bloqueado por intentos fallidos:
  1. El sistema muestra badge "Bloqueado" en estado
  2. El sistema muestra información:
     - Fecha de bloqueo
     - Motivo: "Intentos de login fallidos"
     - Botón "Desbloquear usuario"
  3. El admin puede editar normalmente otros campos
  4. Si el admin activa el toggle "Estado activo":
     - Se desbloquea automáticamente
     - Se resetea contador de intentos
  5. Continúa con el flujo normal

#### Postcondiciones

**Éxito:**
- Usuario actualizado en tabla `users`
- Datos personales actualizados en tabla `personas`
- Roles actualizados en tabla `user_roles`
- Caché de permisos invalidado
- Cambios registrados en auditoría con antes/después
- Vista actualizada con nuevos datos
- Si el usuario editado está logueado, sus cambios se reflejarán en su próxima sesión o al refrescar token

**Fallo:**
- No se aplica ningún cambio (rollback completo)
- Evento de error registrado en logs
- Administrador recibe mensaje de error específico
- Formulario permanece abierto con datos para corrección

#### Reglas de Negocio

**RN-001:** El username NO puede ser modificado una vez creado  
**RN-002:** La identificación NO puede ser modificada (es inmutable)  
**RN-003:** El email debe ser único en todo el sistema si se modifica  
**RN-004:** Todo usuario debe mantener al menos un rol asignado  
**RN-005:** Un usuario no puede modificar su propio estado  
**RN-006:** Un usuario no puede modificar sus propios roles  
**RN-007:** Debe existir siempre al menos un SuperAdmin activo en el sistema  
**RN-008:** Solo se registran en auditoría los campos que realmente cambiaron  
**RN-009:** Las modificaciones de roles se registran en evento de auditoría separado  
**RN-010:** Al invalidar caché, el usuario debe refrescar token para ver cambios  
**RN-011:** SuperAdmin puede editar usuarios de cualquier cooperativa  
**RN-012:** Administradores regulares solo pueden editar usuarios de su cooperativa

#### Campos Editables vs No Editables

**✅ Editables:**
- Email principal
- Nombres y apellidos
- Fecha de nacimiento
- Género
- Email secundario
- Teléfonos
- Dirección
- Roles
- Sucursal
- Departamento
- Cargo
- Estado activo
- Observaciones
- Flag requiere_cambio_password

**❌ No Editables (Readonly):**
- Username
- Tipo de identificación
- Número de identificación
- Cooperativa ID
- Fecha de creación
- Usuario creador
- Última modificación (se actualiza automáticamente)

#### Requisitos No Funcionales

**RNF-001 (Performance):** El formulario debe cargar en menos de 2 segundos  
**RNF-002 (Performance):** La validación en tiempo real debe responder en < 300ms  
**RNF-003 (Performance):** La actualización completa debe tomar menos de 3 segundos  
**RNF-004 (Seguridad):** Solo se validan permisos al abrir y al guardar  
**RNF-005 (Auditoría):** Debe registrarse exactamente qué campos cambiaron y sus valores antes/después  
**RNF-006 (Usabilidad):** Los errores de validación deben ser claros y específicos  
**RNF-007 (Usabilidad):** Debe haber indicación visual de campos modificados  
**RNF-008 (Transaccionalidad):** La actualización debe ser atómica (todo o nada)  
**RNF-009 (Concurrencia):** Debe detectar y manejar conflictos de edición simultánea  
**RNF-010 (UX):** Debe advertir antes de descartar cambios no guardados  
**RNF-011 (Accesibilidad):** El formulario debe ser navegable con teclado

#### Referencias
- RF-USER-002: Edición de Usuarios (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-051+: Implementar endpoint PUT /users/:id
- CU-006: Crear nuevo usuario
- CU-008: Desactivar usuario
- CU-009: Bloquear/Desbloquear usuario

---

### CU-008: Desactivar usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-008  
**Prioridad:** Alta

#### Descripción
Permite a un administrador desactivar un usuario del sistema sin eliminar sus datos, manteniendo el registro histórico y la trazabilidad. El usuario desactivado no podrá iniciar sesión hasta que sea reactivado.

#### Actores
- **Actor Principal:** Administrador o SuperAdmin
- **Actores Secundarios:** Sistema de auditoría

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Gestion.Desactivar"
3. El usuario a desactivar debe existir y estar actualmente activo
4. El usuario a desactivar debe pertenecer a la misma cooperativa del administrador (excepto SuperAdmin)
5. El usuario a desactivar no debe ser el mismo usuario logueado

#### Flujo Principal

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios con indicadores visuales de estado:
   - Badge verde "Activo" para usuarios activos
   - Badge rojo "Inactivo" para usuarios desactivados
   - Badge amarillo "Bloqueado" para usuarios bloqueados
3. El administrador localiza el usuario que desea desactivar
4. El administrador hace clic en el menú de acciones del usuario (ícono de tres puntos)
5. El sistema despliega menú contextual con opciones:
   - Ver detalles
   - Editar
   - **Desactivar** (si está activo)
   - Restablecer contraseña
   - Historial de auditoría
6. El administrador selecciona la opción "Desactivar"
7. El sistema valida que el administrador tenga permisos para desactivar usuarios
8. El sistema valida que el usuario no sea él mismo
9. El sistema valida que no sea el último SuperAdmin activo (si aplica)
10. El sistema muestra modal de confirmación con:
    - Título: "¿Desactivar usuario?"
    - Mensaje: "El usuario [username] no podrá iniciar sesión hasta ser reactivado."
    - Información del usuario:
      * Nombre completo
      * Email
      * Roles asignados
      * Última conexión
    - Campo obligatorio "Motivo de desactivación" (textarea, 10-500 caracteres)
    - Checkbox "Invalidar sesiones activas inmediatamente" (marcado por defecto)
    - Botones: "Sí, desactivar" (rojo) y "Cancelar" (gris)
11. El administrador ingresa el motivo de desactivación
12. El administrador confirma haciendo clic en "Sí, desactivar"
13. El sistema captura el estado anterior del usuario (para auditoría)
14. El sistema actualiza la tabla `users`:
    - Establece `estado = 'inactivo'`
    - Establece `fecha_desactivacion = NOW()`
    - Establece `desactivado_por = admin_user_id`
    - Establece `motivo_desactivacion = motivo ingresado`
    - Actualiza `updated_at = NOW()`
15. Si el checkbox está marcado:
    - El sistema invalida todos los refresh tokens del usuario en BD
    - El sistema agrega access tokens activos a blacklist (si usa Redis)
    - Las sesiones activas serán cerradas inmediatamente
16. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Desactivar
    - Usuario administrador: ID del que desactiva
    - Entidad: Usuario desactivado
    - Datos anteriores: estado = 'activo'
    - Datos nuevos: estado = 'inactivo', motivo
    - IP, timestamp
17. El sistema muestra notificación de éxito: "Usuario desactivado exitosamente"
18. El sistema actualiza la vista de lista de usuarios:
    - El badge del usuario cambia a "Inactivo" (rojo)
    - La opción en el menú cambia a "Activar"
    - El usuario aparece con estilo visual atenuado/gris
19. Si el usuario desactivado tenía sesiones activas y se invalidaron:
    - La próxima petición del usuario recibirá error 401
    - Será redirigido a login con mensaje: "Tu cuenta ha sido desactivada"
20. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Desactivación sin invalidar sesiones**
- En el paso 10, si el admin desmarca el checkbox:
  1. En el paso 15, se omite la invalidación de tokens
  2. Las sesiones activas del usuario continuarán funcionando
  3. El usuario podrá trabajar hasta que expire su access token (máx 1 hora)
  4. Al intentar refrescar el token, se bloqueará el acceso
  5. Continúa desde el paso 16

**FA-002: Administrador cancela la desactivación**
- En el paso 12, si el admin hace clic en "Cancelar":
  1. El sistema cierra el modal de confirmación
  2. No se realiza ningún cambio
  3. El usuario permanece activo
  4. No se registra evento en auditoría
  5. **Fin del caso de uso**

**FA-003: Desactivación desde vista de detalle**
- Alternativa al paso 4-6:
  1. El admin accede a la vista de detalle del usuario
  2. El sistema muestra botón destacado "Desactivar Usuario" (rojo)
  3. El admin hace clic en el botón
  4. Continúa desde el paso 7

**FA-004: Desactivación masiva (múltiples usuarios)**
- Alternativa para desactivar varios usuarios:
  1. El admin selecciona múltiples usuarios con checkboxes
  2. El sistema habilita botón "Acciones masivas"
  3. El admin selecciona "Desactivar seleccionados"
  4. El sistema muestra modal de confirmación listando usuarios
  5. El admin ingresa un motivo común
  6. El sistema desactiva todos los usuarios en una transacción
  7. Se registra evento de auditoría por cada usuario
  8. Continúa con el flujo normal

**FA-005: Usuario ya tiene sesiones cerradas**
- En el paso 15, si el usuario no tiene sesiones activas:
  1. El sistema detecta que no hay tokens activos
  2. La invalidación de tokens no realiza cambios
  3. Se continúa normalmente con el flujo
  4. El evento de auditoría indica "sin sesiones activas"

#### Flujos de Excepción

**FE-001: Sin permisos para desactivar**
- En el paso 7, si el actor no tiene permisos:
  1. El sistema retorna error 403 Forbidden
  2. El sistema muestra mensaje: "No tienes permisos para desactivar usuarios"
  3. El modal no se abre
  4. No se realiza ningún cambio
  5. **Fin del caso de uso**

**FE-002: Intento de auto-desactivación**
- En el paso 8, si el usuario intenta desactivarse a sí mismo:
  1. El sistema previene la acción
  2. El sistema muestra error: "No puedes desactivar tu propia cuenta"
  3. El sistema sugiere: "Solicita a otro administrador que desactive tu cuenta"
  4. No se permite continuar
  5. **Fin del caso de uso**

**FE-003: Intento de desactivar último SuperAdmin**
- En el paso 9, si es el único SuperAdmin activo:
  1. El sistema cuenta cuántos SuperAdmin activos existen
  2. Si es el único (count = 1):
     - El sistema previene la desactivación
     - Muestra error: "No puedes desactivar el único SuperAdmin del sistema"
     - Sugiere: "Primero asigna el rol SuperAdmin a otro usuario"
  3. No se permite continuar
  4. **Fin del caso de uso**

**FE-004: Usuario ya está desactivado**
- En el paso 13, si el usuario ya estaba desactivado:
  1. El sistema detecta estado = 'inactivo'
  2. El sistema muestra advertencia: "Este usuario ya está desactivado"
  3. El sistema muestra información:
     - Fecha de desactivación
     - Desactivado por
     - Motivo
  4. El sistema ofrece opción "Activar usuario" en su lugar
  5. **Fin del caso de uso**

**FE-005: Usuario no existe**
- En el paso 7, si el usuario fue eliminado:
  1. El sistema retorna error 404 Not Found
  2. El sistema muestra mensaje: "El usuario no existe"
  3. El sistema refresca la lista de usuarios
  4. **Fin del caso de uso**

**FE-006: Usuario pertenece a otra cooperativa**
- En el paso 7, si el usuario no pertenece a la cooperativa del admin:
  1. Si el admin NO es SuperAdmin:
     - El sistema previene la acción
     - Muestra error: "No tienes permisos para desactivar usuarios de otras cooperativas"
  2. Si es SuperAdmin:
     - Permite la desactivación (permisos globales)
  3. **Fin del caso de uso (fallo para admin regular)**

**FE-007: Motivo de desactivación inválido**
- En el paso 11, si el motivo es muy corto o vacío:
  1. El sistema valida longitud mínima (10 caracteres)
  2. El sistema marca el campo en rojo
  3. El sistema muestra mensaje: "El motivo debe tener al menos 10 caracteres"
  4. El botón "Sí, desactivar" permanece deshabilitado
  5. Continúa desde el paso 11

**FE-008: Error al actualizar base de datos**
- En el paso 14, si falla la actualización:
  1. El sistema hace rollback completo
  2. El usuario permanece activo
  3. No se invalidan tokens
  4. El sistema registra error en logs
  5. El sistema muestra mensaje: "Error al desactivar usuario. Intenta nuevamente."
  6. El modal permanece abierto
  7. El admin puede reintentar
  8. **Fin del caso de uso (fallo)**

**FE-009: Error al invalidar tokens**
- En el paso 15, si falla la invalidación de tokens pero la desactivación fue exitosa:
  1. El usuario queda desactivado en BD
  2. Las sesiones activas pueden continuar temporalmente
  3. El sistema registra warning en logs
  4. El sistema muestra advertencia: "Usuario desactivado pero las sesiones activas pueden tardar en cerrarse"
  5. Las sesiones se cerrarán naturalmente al expirar (1 hora máx)
  6. Continúa desde el paso 17

#### Postcondiciones

**Éxito:**
- Usuario desactivado en tabla `users` (estado = 'inactivo')
- Fecha y motivo de desactivación registrados
- Referencia al administrador que desactivó
- Tokens invalidados (si se seleccionó la opción)
- Sesiones activas cerradas inmediatamente (si aplica)
- Evento registrado en auditoría con todos los detalles
- Usuario no puede iniciar sesión
- Badge visual actualizado a "Inactivo"
- Usuario puede ser reactivado posteriormente

**Fallo:**
- Usuario permanece activo
- No se invalidan tokens
- Evento de error registrado en logs (no en auditoría)
- Se muestra mensaje de error al administrador

#### Reglas de Negocio

**RN-001:** Un usuario no puede desactivarse a sí mismo  
**RN-002:** Debe existir siempre al menos un SuperAdmin activo en el sistema  
**RN-003:** La desactivación es reversible (puede reactivarse)  
**RN-004:** Se debe proporcionar un motivo obligatorio de desactivación  
**RN-005:** El motivo debe tener entre 10 y 500 caracteres  
**RN-006:** Las sesiones activas pueden invalidarse opcionalmente de inmediato  
**RN-007:** Se registra quién desactivó y cuándo  
**RN-008:** Los datos del usuario desactivado se conservan íntegramente  
**RN-009:** Un usuario desactivado no puede iniciar sesión  
**RN-010:** Los datos históricos del usuario desactivado permanecen intactos  
**RN-011:** SuperAdmin puede desactivar usuarios de cualquier cooperativa  
**RN-012:** Administradores regulares solo pueden desactivar usuarios de su cooperativa

#### Diferencias: Desactivar vs Eliminar vs Bloquear

**Desactivar (CU-008):**
- Acción administrativa controlada
- Requiere motivo
- Es reversible
- Conserva todos los datos
- Usuario no puede iniciar sesión
- Útil para: empleados que ya no trabajan, suspensiones temporales

**Bloquear (CU-009):**
- Puede ser automático (por intentos fallidos)
- Temporal por seguridad
- Es reversible
- Usuario no puede iniciar sesión
- Útil para: seguridad, intentos de intrusión

**Eliminar (soft delete):**
- Marcado como eliminado
- No reversible fácilmente
- Datos ocultos pero conservados
- Usuario no puede iniciar sesión
- Útil para: cumplimiento de solicitudes de eliminación (GDPR)

#### Requisitos No Funcionales

**RNF-001 (Performance):** La desactivación debe completarse en menos de 2 segundos  
**RNF-002 (Performance):** La invalidación de tokens debe ser inmediata (< 1 segundo)  
**RNF-003 (Seguridad):** Las sesiones invalidadas deben cerrarse de inmediato  
**RNF-004 (Auditoría):** Debe registrarse el motivo completo y quién desactivó  
**RNF-005 (Usabilidad):** El modal debe ser claro sobre las consecuencias  
**RNF-006 (Usabilidad):** Debe confirmar la acción antes de ejecutarla  
**RNF-007 (Transaccionalidad):** La desactivación debe ser atómica  
**RNF-008 (UX):** El cambio de estado debe reflejarse inmediatamente en la UI  
**RNF-009 (Integridad):** Los datos históricos deben permanecer intactos  
**RNF-010 (Trazabilidad):** Debe ser posible saber quién, cuándo y por qué se desactivó

#### Referencias
- RF-USER-003: Desactivación de Usuarios (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-052+: Implementar endpoint PATCH /users/:id/deactivate
- CU-006: Crear nuevo usuario
- CU-007: Editar usuario existente
- CU-010: Reactivar usuario
- CU-001: Iniciar sesión en el sistema (validación de estado)

---

### CU-009: Bloquear/Desbloquear usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-009  
**Prioridad:** Alta

#### Descripción
Permite a un administrador bloquear manualmente una cuenta de usuario por razones de seguridad, o desbloquear una cuenta que fue bloqueada automáticamente por intentos de login fallidos o manualmente por otro administrador.

#### Actores
- **Actor Principal:** Administrador o SuperAdmin
- **Actores Secundarios:** Sistema de auditoría, Sistema de seguridad (bloqueo automático)

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Gestion.Bloquear" o "Usuarios.Gestion.Desbloquear"
3. El usuario a bloquear/desbloquear debe existir en el sistema
4. El usuario a bloquear/desbloquear debe pertenecer a la misma cooperativa del administrador (excepto SuperAdmin)
5. Para bloquear: el usuario debe estar activo (no bloqueado actualmente)
6. Para desbloquear: el usuario debe estar bloqueado

#### Flujo Principal - BLOQUEAR USUARIO

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios con badges de estado
3. El administrador localiza el usuario que desea bloquear
4. El administrador hace clic en el menú de acciones del usuario
5. El sistema despliega menú contextual con opción "Bloquear usuario"
6. El administrador selecciona "Bloquear usuario"
7. El sistema valida que el administrador tenga permisos para bloquear
8. El sistema valida que el usuario no esté ya bloqueado
9. El sistema muestra modal de confirmación con:
    - Título: "⚠️ ¿Bloquear usuario por seguridad?"
    - Mensaje: "El usuario [username] no podrá iniciar sesión hasta ser desbloqueado."
    - Información del usuario:
      * Nombre completo
      * Email
      * Última conexión
      * Sesiones activas actuales
    - Campo obligatorio "Motivo del bloqueo" (textarea, 10-500 caracteres)
    - Ejemplos sugeridos: "Actividad sospechosa", "Solicitud del usuario", "Investigación de seguridad"
    - Checkbox "Invalidar sesiones activas inmediatamente" (marcado por defecto)
    - Advertencia: "Este bloqueo por seguridad no afecta el estado activo del usuario"
    - Botones: "Sí, bloquear" (rojo) y "Cancelar"
10. El administrador ingresa el motivo del bloqueo
11. El administrador confirma haciendo clic en "Sí, bloquear"
12. El sistema actualiza la tabla `users`:
    - Establece `cuenta_bloqueada = true`
    - Establece `fecha_bloqueo = NOW()`
    - Establece `bloqueado_por = admin_user_id` (o 'sistema' si es automático)
    - Establece `motivo_bloqueo = motivo ingresado`
    - Resetea `intentos_fallidos_login = 0`
    - Actualiza `updated_at = NOW()`
13. Si el checkbox está marcado:
    - El sistema invalida todos los refresh tokens del usuario
    - El sistema agrega access tokens activos a blacklist
    - Las sesiones activas se cierran inmediatamente
14. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Bloquear
    - Usuario administrador: ID del que bloquea
    - Entidad: Usuario bloqueado
    - Motivo: texto ingresado
    - IP, timestamp
15. El sistema muestra notificación: "Usuario bloqueado exitosamente"
16. El sistema actualiza la vista:
    - Badge del usuario cambia a "🔒 Bloqueado" (amarillo/naranja)
    - La opción en el menú cambia a "Desbloquear usuario"
17. Si el usuario bloqueado tenía sesiones activas:
    - En su próxima petición recibirá error 423 Locked
    - Será redirigido a login con mensaje: "Tu cuenta ha sido bloqueada. Contacta al administrador."
18. **Fin del caso de uso**

#### Flujo Principal - DESBLOQUEAR USUARIO

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios
3. El administrador identifica usuario con badge "🔒 Bloqueado"
4. El administrador hace clic en el menú de acciones del usuario
5. El sistema despliega menú contextual con opción "Desbloquear usuario"
6. El administrador selecciona "Desbloquear usuario"
7. El sistema valida que el administrador tenga permisos para desbloquear
8. El sistema valida que el usuario esté efectivamente bloqueado
9. El sistema muestra modal de confirmación con:
    - Título: "¿Desbloquear usuario?"
    - Información del bloqueo actual:
      * Fecha de bloqueo
      * Bloqueado por (usuario o 'Sistema')
      * Motivo del bloqueo
      * Duración del bloqueo
    - Campo opcional "Observaciones del desbloqueo" (textarea)
    - Mensaje: "El usuario podrá iniciar sesión nuevamente"
    - Botones: "Sí, desbloquear" (verde) y "Cancelar"
10. El administrador opcionalmente ingresa observaciones
11. El administrador confirma haciendo clic en "Sí, desbloquear"
12. El sistema actualiza la tabla `users`:
    - Establece `cuenta_bloqueada = false`
    - Establece `fecha_desbloqueo = NOW()`
    - Establece `desbloqueado_por = admin_user_id`
    - Resetea `intentos_fallidos_login = 0`
    - Limpia `motivo_bloqueo = NULL` (opcional, puede conservarse)
    - Actualiza `updated_at = NOW()`
13. El sistema elimina los tokens de la blacklist (si aplica)
14. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Desbloquear
    - Usuario administrador: ID del que desbloquea
    - Entidad: Usuario desbloqueado
    - Observaciones: texto ingresado
    - IP, timestamp
15. El sistema muestra notificación: "Usuario desbloqueado exitosamente"
16. El sistema actualiza la vista:
    - Badge del usuario cambia según su estado (Activo/Inactivo, sin bloqueo)
    - La opción en el menú vuelve a "Bloquear usuario"
17. El usuario puede iniciar sesión normalmente
18. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Bloqueo automático por intentos fallidos**
- Alternativa al flujo principal de bloqueo:
  1. Durante CU-001 (Login), el sistema detecta 5 intentos fallidos consecutivos
  2. El sistema bloquea automáticamente la cuenta
  3. El sistema establece:
     - `cuenta_bloqueada = true`
     - `fecha_bloqueo = NOW()`
     - `bloqueado_por = 'sistema'`
     - `motivo_bloqueo = 'Intentos de login fallidos excedidos'`
  4. El sistema registra evento en auditoría con acción "Bloqueo Automático"
  5. El usuario recibe mensaje: "Tu cuenta ha sido bloqueada por seguridad"
  6. Un administrador debe desbloquear manualmente
  7. **Fin del caso de uso**

**FA-002: Administrador cancela bloqueo/desbloqueo**
- En el paso 11 de cualquier flujo:
  1. El admin hace clic en "Cancelar"
  2. El sistema cierra el modal
  3. No se realiza ningún cambio
  4. No se registra evento en auditoría
  5. **Fin del caso de uso**

**FA-003: Desbloqueo desde vista de detalle**
- Alternativa a los pasos 4-6 de desbloqueo:
  1. El admin accede a la vista de detalle del usuario bloqueado
  2. El sistema muestra alerta destacada: "⚠️ Usuario bloqueado"
  3. El sistema muestra información del bloqueo
  4. El sistema muestra botón "Desbloquear Usuario" (verde, destacado)
  5. El admin hace clic en el botón
  6. Continúa desde el paso 7 del flujo de desbloqueo

**FA-004: Bloqueo con sesiones sin invalidar**
- En el paso 9 del flujo de bloqueo, si el admin desmarca el checkbox:
  1. En el paso 13, se omite la invalidación de tokens
  2. Las sesiones activas pueden continuar temporalmente
  3. Al intentar refrescar token, se bloqueará el acceso
  4. El usuario podrá trabajar hasta que expire su access token (máx 1 hora)
  5. Continúa desde el paso 14

**FA-005: Desbloqueo masivo**
- Si hay múltiples usuarios bloqueados:
  1. El admin puede seleccionar múltiples usuarios bloqueados
  2. El sistema habilita "Acciones masivas" > "Desbloquear seleccionados"
  3. El sistema muestra modal listando todos los usuarios
  4. El admin ingresa observaciones comunes
  5. El sistema desbloquea todos en transacción
  6. Se registra evento de auditoría por cada uno
  7. Continúa con el flujo normal

**FA-006: Usuario bloqueado también está inactivo**
- Si el usuario tiene ambos estados (bloqueado E inactivo):
  1. El desbloqueo solo quita el bloqueo
  2. El usuario permanece inactivo
  3. El admin debe además reactivar al usuario (CU-010)
  4. El sistema muestra mensaje: "Usuario desbloqueado pero sigue inactivo"
  5. El usuario no podrá iniciar sesión hasta ser reactivado

#### Flujos de Excepción

**FE-001: Sin permisos para bloquear**
- En el paso 7 del flujo de bloqueo:
  1. El sistema retorna error 403 Forbidden
  2. Muestra mensaje: "No tienes permisos para bloquear usuarios"
  3. El modal no se abre
  4. **Fin del caso de uso**

**FE-002: Sin permisos para desbloquear**
- En el paso 7 del flujo de desbloqueo:
  1. El sistema retorna error 403 Forbidden
  2. Muestra mensaje: "No tienes permisos para desbloquear usuarios"
  3. El modal no se abre
  4. **Fin del caso de uso**

**FE-003: Usuario ya está bloqueado**
- En el paso 8 del flujo de bloqueo:
  1. El sistema detecta `cuenta_bloqueada = true`
  2. Muestra advertencia: "Este usuario ya está bloqueado"
  3. Muestra información del bloqueo actual:
     - Fecha de bloqueo
     - Bloqueado por
     - Motivo
  4. Ofrece opción "Desbloquear usuario" en su lugar
  5. **Fin del caso de uso**

**FE-004: Usuario no está bloqueado**
- En el paso 8 del flujo de desbloqueo:
  1. El sistema detecta `cuenta_bloqueada = false`
  2. Muestra mensaje: "Este usuario no está bloqueado"
  3. El sistema refresca la vista
  4. **Fin del caso de uso**

**FE-005: Usuario no existe**
- En el paso 7 de cualquier flujo:
  1. El sistema retorna error 404 Not Found
  2. Muestra mensaje: "El usuario no existe"
  3. El sistema refresca la lista
  4. **Fin del caso de uso**

**FE-006: Motivo de bloqueo inválido**
- En el paso 10 del flujo de bloqueo:
  1. El sistema valida longitud mínima (10 caracteres)
  2. Si es muy corto o vacío:
     - Marca el campo en rojo
     - Muestra mensaje: "El motivo debe tener al menos 10 caracteres"
     - El botón "Sí, bloquear" permanece deshabilitado
  3. Continúa desde el paso 10

**FE-007: Error al actualizar base de datos**
- En el paso 12 de cualquier flujo:
  1. El sistema hace rollback completo
  2. El estado del usuario no cambia
  3. No se invalidan tokens
  4. El sistema registra error en logs
  5. Muestra mensaje: "Error al bloquear/desbloquear usuario. Intenta nuevamente."
  6. El modal permanece abierto para reintentar
  7. **Fin del caso de uso (fallo)**

**FE-008: Usuario pertenece a otra cooperativa**
- En el paso 7 de cualquier flujo:
  1. Si el admin NO es SuperAdmin:
     - Sistema previene la acción
     - Muestra error: "No tienes permisos para bloquear/desbloquear usuarios de otras cooperativas"
  2. Si es SuperAdmin:
     - Permite la acción (permisos globales)
  3. **Fin del caso de uso (fallo para admin regular)**

#### Postcondiciones

**Éxito - Bloqueo:**
- Usuario bloqueado en tabla `users` (cuenta_bloqueada = true)
- Fecha, motivo y responsable del bloqueo registrados
- Tokens invalidados (si se seleccionó)
- Sesiones activas cerradas (si aplica)
- Evento registrado en auditoría
- Usuario no puede iniciar sesión
- Badge actualizado a "Bloqueado"
- Intentos fallidos reseteados a 0

**Éxito - Desbloqueo:**
- Usuario desbloqueado en tabla `users` (cuenta_bloqueada = false)
- Fecha y responsable del desbloqueo registrados
- Evento registrado en auditoría
- Usuario puede iniciar sesión nuevamente
- Badge actualizado según estado (Activo/Inactivo)
- Intentos fallidos reseteados a 0

**Fallo:**
- Estado del usuario no cambia
- No se invalidan tokens
- Evento de error registrado en logs
- Se muestra mensaje de error al administrador

#### Reglas de Negocio

**RN-001:** El bloqueo puede ser manual (administrador) o automático (sistema)  
**RN-002:** El bloqueo automático ocurre tras 5 intentos de login fallidos consecutivos  
**RN-003:** Solo un administrador puede desbloquear (no es automático)  
**RN-004:** El bloqueo requiere motivo obligatorio (10-500 caracteres)  
**RN-005:** El desbloqueo permite observaciones opcionales  
**RN-006:** Bloquear resetea el contador de intentos fallidos a 0  
**RN-007:** Desbloquear resetea el contador de intentos fallidos a 0  
**RN-008:** El bloqueo es independiente del estado activo/inactivo  
**RN-009:** Un usuario puede estar bloqueado E inactivo simultáneamente  
**RN-010:** Las sesiones activas pueden invalidarse opcionalmente de inmediato  
**RN-011:** Se registra quién bloqueó/desbloqueó y cuándo  
**RN-012:** SuperAdmin puede bloquear/desbloquear usuarios de cualquier cooperativa  
**RN-013:** Administradores regulares solo pueden gestionar usuarios de su cooperativa

#### Diferencias: Bloquear vs Desactivar

**Bloquear:**
- Propósito: Seguridad (actividad sospechosa, intentos de intrusión)
- Puede ser automático o manual
- Temporal por naturaleza
- Requiere acción administrativa para desbloquear
- No afecta el estado "activo" del usuario
- Mensaje al usuario: "Cuenta bloqueada por seguridad"
- Típicamente reversible el mismo día

**Desactivar:**
- Propósito: Administrativo (empleado se fue, suspensión)
- Siempre es manual
- Puede ser permanente o de larga duración
- Requiere acción administrativa para reactivar
- Establece estado "inactivo"
- Mensaje al usuario: "Cuenta desactivada"
- Puede ser indefinido

#### Requisitos No Funcionales

**RNF-001 (Performance):** El bloqueo/desbloqueo debe completarse en menos de 2 segundos  
**RNF-002 (Seguridad):** El bloqueo automático debe activarse inmediatamente  
**RNF-003 (Seguridad):** Las sesiones invalidadas deben cerrarse de inmediato  
**RNF-004 (Auditoría):** Debe registrarse el motivo completo y quién bloqueó/desbloqueó  
**RNF-005 (Usabilidad):** El modal debe mostrar información clara del bloqueo  
**RNF-006 (Usabilidad):** Debe haber indicadores visuales distintivos (badge amarillo/naranja)  
**RNF-007 (Transaccionalidad):** La operación debe ser atómica  
**RNF-008 (UX):** El cambio de estado debe reflejarse inmediatamente en la UI  
**RNF-009 (Automatización):** El bloqueo automático debe funcionar sin intervención  
**RNF-010 (Trazabilidad):** Debe distinguirse entre bloqueo manual y automático

#### Referencias
- RF-AUTH-005: Bloqueo por Intentos Fallidos (PRD)
- RF-USER-004: Bloqueo/Desbloqueo Manual (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-018: Implementar lógica de bloqueo por intentos fallidos
- TICKET-053+: Implementar endpoints PATCH /users/:id/block y /users/:id/unblock
- CU-001: Iniciar sesión en el sistema (donde ocurre bloqueo automático)
- CU-008: Desactivar usuario (diferencias conceptuales)

---

### CU-010: Reactivar usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-010  
**Prioridad:** Media

#### Descripción
Permite a un administrador reactivar un usuario previamente desactivado, restaurando su acceso al sistema y manteniendo todos sus datos, roles y permisos intactos.

#### Actores
- **Actor Principal:** Administrador o SuperAdmin
- **Actores Secundarios:** Sistema de auditoría

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Gestion.Activar"
3. El usuario a reactivar debe existir en el sistema
4. El usuario debe estar actualmente desactivado (estado = 'inactivo')
5. El usuario debe pertenecer a la misma cooperativa del administrador (excepto SuperAdmin)

#### Flujo Principal

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios con filtros de estado
3. El administrador aplica filtro "Estado: Inactivo" o visualiza todos los usuarios
4. El sistema muestra usuarios inactivos con badge rojo "Inactivo"
5. El administrador localiza el usuario que desea reactivar
6. El administrador hace clic en el menú de acciones del usuario
7. El sistema despliega menú contextual con opción "Reactivar usuario"
8. El administrador selecciona "Reactivar usuario"
9. El sistema valida que el administrador tenga permisos para reactivar usuarios
10. El sistema valida que el usuario esté efectivamente desactivado
11. El sistema muestra modal de confirmación con:
    - Título: "¿Reactivar usuario?"
    - Información del usuario:
      * Nombre completo
      * Username
      * Email
      * Roles asignados
    - Información de la desactivación:
      * Fecha de desactivación
      * Desactivado por
      * Motivo de desactivación
      * Tiempo desactivado (ej: "15 días")
    - Campo opcional "Observaciones de reactivación" (textarea, máx 500 caracteres)
    - Checkbox "Requerir cambio de contraseña en próximo acceso" (opcional)
    - Checkbox "Enviar notificación por email al usuario" (opcional)
    - Mensaje: "El usuario podrá iniciar sesión inmediatamente"
    - Botones: "Sí, reactivar" (verde) y "Cancelar"
12. El administrador opcionalmente ingresa observaciones
13. El administrador opcionalmente marca los checkboxes
14. El administrador confirma haciendo clic en "Sí, reactivar"
15. El sistema actualiza la tabla `users`:
    - Establece `estado = 'activo'`
    - Establece `fecha_reactivacion = NOW()`
    - Establece `reactivado_por = admin_user_id`
    - Si checkbox marcado: `requiere_cambio_password = true`
    - Actualiza `updated_at = NOW()`
    - Conserva información de desactivación anterior (para historial)
16. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Reactivar
    - Usuario administrador: ID del que reactiva
    - Entidad: Usuario reactivado
    - Datos anteriores: estado = 'inactivo'
    - Datos nuevos: estado = 'activo'
    - Observaciones: texto ingresado (si aplica)
    - IP, timestamp
17. Si el checkbox de email está marcado:
    - El sistema envía notificación al email del usuario:
      * Asunto: "Tu cuenta ha sido reactivada - RRFinances"
      * Mensaje de reactivación
      * URL de acceso
      * Si requiere cambio de contraseña: instrucciones
18. El sistema muestra notificación de éxito: "Usuario reactivado exitosamente"
19. El sistema actualiza la vista de lista:
    - El badge del usuario cambia a "Activo" (verde)
    - La opción en el menú cambia a "Desactivar"
    - El usuario ya no aparece con estilo atenuado
20. El usuario puede iniciar sesión inmediatamente
21. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Reactivación sin notificación por email**
- En el paso 13, si el admin NO marca el checkbox de email:
  1. En el paso 17, se omite el envío de email
  2. El admin debe comunicar manualmente al usuario
  3. El usuario puede intentar login y verificará que está activo
  4. Continúa desde el paso 18

**FA-002: Reactivación requiriendo cambio de contraseña**
- En el paso 13, si el admin marca "Requerir cambio de contraseña":
  1. En el paso 15, se establece `requiere_cambio_password = true`
  2. El admin debe proporcionar una contraseña temporal al usuario
  3. El sistema puede generar una nueva contraseña temporal automáticamente
  4. En el primer login, el usuario será forzado a cambiar contraseña (CU-004)
  5. Continúa con el flujo normal

**FA-003: Administrador cancela la reactivación**
- En el paso 14, si el admin hace clic en "Cancelar":
  1. El sistema cierra el modal de confirmación
  2. No se realiza ningún cambio
  3. El usuario permanece desactivado
  4. No se registra evento en auditoría
  5. **Fin del caso de uso**

**FA-004: Reactivación desde vista de detalle**
- Alternativa a los pasos 6-8:
  1. El admin accede a la vista de detalle del usuario desactivado
  2. El sistema muestra alerta: "⚠️ Usuario desactivado"
  3. El sistema muestra información de la desactivación
  4. El sistema muestra botón destacado "Reactivar Usuario" (verde)
  5. El admin hace clic en el botón
  6. Continúa desde el paso 9

**FA-005: Reactivación masiva**
- Si hay múltiples usuarios desactivados a reactivar:
  1. El admin aplica filtro "Inactivos"
  2. El admin selecciona múltiples usuarios con checkboxes
  3. El sistema habilita "Acciones masivas" > "Reactivar seleccionados"
  4. El sistema muestra modal listando todos los usuarios
  5. El admin ingresa observaciones comunes (opcional)
  6. El sistema reactiva todos en transacción
  7. Se registra evento de auditoría por cada usuario
  8. Continúa con el flujo normal

**FA-006: Usuario desactivado también está bloqueado**
- Si el usuario tiene ambos estados (inactivo Y bloqueado):
  1. El sistema muestra advertencia en el modal: "⚠️ Este usuario también está bloqueado"
  2. El sistema muestra información del bloqueo
  3. El admin puede elegir:
     - Solo reactivar (permanecerá bloqueado)
     - Checkbox adicional: "Desbloquear también"
  4. Si marca el checkbox, se aplican ambas acciones:
     - Reactivar (estado = activo)
     - Desbloquear (cuenta_bloqueada = false)
  5. Se registran ambos eventos en auditoría
  6. Continúa con el flujo normal

**FA-007: Envío de email falla**
- En el paso 17, si falla el envío de email:
  1. El sistema registra el error en logs
  2. El usuario SE REACTIVA de todos modos (email no es crítico)
  3. El sistema muestra advertencia: "Usuario reactivado pero no se pudo enviar email"
  4. El sistema muestra las credenciales para que el admin las comunique manualmente
  5. Continúa desde el paso 18

#### Flujos de Excepción

**FE-001: Sin permisos para reactivar**
- En el paso 9, si el actor no tiene permisos:
  1. El sistema retorna error 403 Forbidden
  2. El sistema muestra mensaje: "No tienes permisos para reactivar usuarios"
  3. El modal no se abre
  4. No se realiza ningún cambio
  5. **Fin del caso de uso**

**FE-002: Usuario ya está activo**
- En el paso 10, si el usuario no está desactivado:
  1. El sistema detecta estado = 'activo'
  2. El sistema muestra mensaje: "Este usuario ya está activo"
  3. El sistema muestra información del estado actual
  4. El modal no se abre
  5. **Fin del caso de uso**

**FE-003: Usuario no existe**
- En el paso 9, si el usuario fue eliminado:
  1. El sistema retorna error 404 Not Found
  2. El sistema muestra mensaje: "El usuario no existe"
  3. El sistema refresca la lista de usuarios
  4. **Fin del caso de uso**

**FE-004: Usuario pertenece a otra cooperativa**
- En el paso 9, si el usuario no pertenece a la cooperativa del admin:
  1. Si el admin NO es SuperAdmin:
     - El sistema previene la acción
     - Muestra error: "No tienes permisos para reactivar usuarios de otras cooperativas"
  2. Si es SuperAdmin:
     - Permite la reactivación (permisos globales)
  3. **Fin del caso de uso (fallo para admin regular)**

**FE-005: Error al actualizar base de datos**
- En el paso 15, si falla la actualización:
  1. El sistema hace rollback completo
  2. El usuario permanece desactivado
  3. El sistema registra error en logs
  4. El sistema muestra mensaje: "Error al reactivar usuario. Intenta nuevamente."
  5. El modal permanece abierto
  6. El admin puede reintentar desde el paso 14
  7. **Fin del caso de uso (fallo)**

**FE-006: Límite de usuarios activos alcanzado**
- En el paso 15, si la cooperativa alcanzó su límite de usuarios activos:
  1. El sistema verifica límite de licencia
  2. El sistema cuenta usuarios activos actuales
  3. Si se alcanzó el límite:
     - El sistema previene la reactivación
     - Muestra error: "Se alcanzó el límite de usuarios activos permitidos. Desactiva otros usuarios o contacta a soporte."
     - El sistema muestra contador: "Usuarios activos: X/Y"
  4. El usuario permanece desactivado
  5. **Fin del caso de uso**

**FE-007: Usuario eliminado (soft delete)**
- Si el usuario fue marcado como eliminado además de desactivado:
  1. El sistema detecta `deleted_at IS NOT NULL`
  2. El sistema muestra advertencia: "Este usuario fue marcado como eliminado"
  3. El sistema requiere permisos especiales de SuperAdmin
  4. Si el admin es SuperAdmin:
     - Muestra opción adicional: "Restaurar usuario eliminado"
     - Requiere confirmación adicional
  5. Si no es SuperAdmin:
     - Previene la acción
     - Muestra error: "Solo SuperAdmin puede reactivar usuarios eliminados"
  6. **Fin del caso de uso**

#### Postcondiciones

**Éxito:**
- Usuario reactivado en tabla `users` (estado = 'activo')
- Fecha de reactivación y responsable registrados
- Observaciones registradas (si aplica)
- Flag de cambio de contraseña actualizado (si aplica)
- Si estaba bloqueado también, puede desbloquearse simultáneamente
- Evento registrado en auditoría con detalles completos
- Email de notificación enviado (si se seleccionó)
- Usuario puede iniciar sesión inmediatamente
- Badge visual actualizado a "Activo"
- Todos los roles y permisos previos permanecen intactos

**Fallo:**
- Usuario permanece desactivado
- No se envía email
- Evento de error registrado en logs (no en auditoría)
- Se muestra mensaje de error al administrador

#### Reglas de Negocio

**RN-001:** Solo usuarios desactivados pueden ser reactivados  
**RN-002:** La reactivación restaura el acceso inmediato al sistema  
**RN-003:** Todos los roles y permisos se mantienen intactos tras reactivación  
**RN-004:** Se conserva el historial de desactivación anterior  
**RN-005:** Se registra quién reactivó y cuándo  
**RN-006:** Las observaciones de reactivación son opcionales  
**RN-007:** El envío de email es opcional y no crítico  
**RN-008:** Se puede requerir cambio de contraseña en próximo acceso  
**RN-009:** Si el usuario también está bloqueado, puede desbloquearse simultáneamente  
**RN-010:** SuperAdmin puede reactivar usuarios de cualquier cooperativa  
**RN-011:** Administradores regulares solo pueden reactivar usuarios de su cooperativa  
**RN-012:** La reactivación verifica límite de licencia de usuarios activos

#### Información Preservada tras Reactivación

**✅ Se conserva:**
- Todos los datos personales
- Username y email
- Roles y permisos asignados
- Historial de auditoría completo
- Historial de desactivaciones previas
- Fecha de creación original
- Todos los datos de contacto
- Configuraciones personalizadas

**🔄 Se actualiza:**
- Estado: cambia a 'activo'
- Fecha de reactivación
- Usuario que reactivó
- Flag requiere_cambio_password (opcional)
- Timestamp de última actualización

**❌ No se modifica:**
- Contraseña (a menos que se genere nueva temporal)
- Cooperativa asignada
- Username
- Identificación
- Fecha de creación original

#### Requisitos No Funcionales

**RNF-001 (Performance):** La reactivación debe completarse en menos de 2 segundos  
**RNF-002 (Performance):** La actualización debe ser inmediata en la BD  
**RNF-003 (Usabilidad):** El modal debe mostrar información clara del historial  
**RNF-004 (Usabilidad):** Debe haber confirmación antes de reactivar  
**RNF-005 (Auditoría):** Debe registrarse quién, cuándo y observaciones  
**RNF-006 (Transaccionalidad):** La reactivación debe ser atómica  
**RNF-007 (UX):** El cambio de estado debe reflejarse inmediatamente en la UI  
**RNF-008 (Integridad):** Todos los datos previos deben permanecer intactos  
**RNF-009 (Seguridad):** Debe validar límites de licencia antes de reactivar  
**RNF-010 (Accesibilidad):** Los usuarios reactivados deben poder acceder inmediatamente

#### Referencias
- RF-USER-005: Reactivación de Usuarios (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-054+: Implementar endpoint PATCH /users/:id/activate
- CU-006: Crear nuevo usuario
- CU-008: Desactivar usuario (operación inversa)
- CU-009: Bloquear/Desbloquear usuario (puede ser combinado)
- CU-001: Iniciar sesión en el sistema (validación de estado activo)

---

### CU-011: Restablecer contraseña de usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-011  
**Prioridad:** Alta

#### Descripción
Permite a un administrador restablecer la contraseña de un usuario, generando una contraseña temporal que el usuario deberá cambiar en su próximo acceso, útil cuando un usuario olvida su contraseña o por medidas de seguridad.

#### Actores
- **Actor Principal:** Administrador o SuperAdmin
- **Actores Secundarios:** Sistema de auditoría, Sistema de email (opcional), Usuario afectado

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Gestion.ResetPassword"
3. El usuario objetivo debe existir y estar activo en el sistema
4. El usuario objetivo debe pertenecer a la misma cooperativa del administrador (excepto SuperAdmin)
5. El administrador no debe poder restablecer su propia contraseña mediante este proceso

#### Flujo Principal

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la lista de usuarios
3. El administrador localiza el usuario cuya contraseña desea restablecer
4. El administrador hace clic en el menú de acciones del usuario
5. El sistema despliega menú contextual con opción "Restablecer contraseña"
6. El administrador selecciona "Restablecer contraseña"
7. El sistema valida que el administrador tenga permisos para restablecer contraseñas
8. El sistema valida que el usuario objetivo no sea el mismo que el administrador
9. El sistema muestra modal de confirmación con:
    - Título: "⚠️ ¿Restablecer contraseña?"
    - Información del usuario:
      * Nombre completo
      * Username
      * Email
      * Última modificación de contraseña
      * Número de resets previos
    - Advertencia: "Se generará una contraseña temporal que deberás comunicar al usuario de forma segura"
    - Radio buttons para seleccionar método de generación:
      * ⦿ Generar contraseña automática (recomendado)
      * ○ Ingresar contraseña temporal manual
    - Campo "Contraseña temporal" (visible solo si se selecciona opción manual)
    - Indicador de fortaleza de contraseña (para opción manual)
    - Checkbox "Enviar contraseña por email al usuario" (marcado por defecto)
    - Checkbox "Requerir cambio en próximo acceso" (marcado por defecto, readonly)
    - Campo opcional "Motivo del restablecimiento" (textarea, máx 300 caracteres)
    - Botones: "Sí, restablecer" (naranja) y "Cancelar"
10. El administrador selecciona el método de generación (automática es default)
11. El administrador opcionalmente ingresa el motivo
12. El administrador confirma haciendo clic en "Sí, restablecer"
13. El sistema valida los datos:
    - Si es manual, valida que cumpla política de contraseñas
    - Valida que el motivo no exceda 300 caracteres (si se ingresó)
14. Si la opción es automática:
    - El sistema genera contraseña temporal aleatoria de 12 caracteres
    - Incluye mayúsculas, minúsculas, números y caracteres especiales
    - Cumple con la política de contraseñas del sistema
15. El sistema hashea la nueva contraseña con bcrypt (10 rounds)
16. El sistema actualiza la tabla `users`:
    - Actualiza `password_hash` con la nueva contraseña
    - Establece `requiere_cambio_password = true`
    - Establece `fecha_ultimo_cambio_password = NOW()`
    - Incrementa contador `numero_resets_password`
    - Establece `ultimo_reset_por = admin_user_id`
    - Actualiza `updated_at = NOW()`
17. El sistema invalida todos los refresh tokens activos del usuario
18. El sistema cierra todas las sesiones activas del usuario
19. El sistema registra el evento en auditoría:
    - Módulo: Usuarios
    - Acción: Restablecer Contraseña
    - Usuario administrador: ID del que restablece
    - Entidad: Usuario afectado
    - Motivo: texto ingresado (si aplica)
    - Método: Automático o Manual
    - IP, timestamp
20. Si el checkbox de email está marcado:
    - El sistema envía email al usuario con:
      * Asunto: "Tu contraseña ha sido restablecida - RRFinances"
      * Notificación del restablecimiento
      * Contraseña temporal (en texto plano, con advertencia de seguridad)
      * Instrucciones para cambiar contraseña
      * URL de acceso al sistema
      * Recomendaciones de seguridad
21. El sistema muestra modal de éxito con:
    - Mensaje: "✓ Contraseña restablecida exitosamente"
    - La contraseña temporal generada (en texto grande, copiable)
    - Botón "Copiar contraseña" con feedback visual
    - Advertencia: "Esta es la única vez que verás esta contraseña. Guárdala de forma segura."
    - Checkbox "He copiado la contraseña" (debe marcarlo para cerrar)
    - Botón "Cerrar"
22. El administrador copia la contraseña y marca el checkbox
23. El administrador hace clic en "Cerrar"
24. El sistema regresa a la vista de lista de usuarios
25. El usuario afectado deberá cambiar la contraseña en su próximo login
26. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Contraseña temporal manual**
- En el paso 10, si el admin selecciona opción manual:
  1. El campo "Contraseña temporal" se habilita
  2. El admin ingresa contraseña manualmente
  3. El sistema valida en tiempo real:
     - Longitud mínima 8 caracteres
     - Al menos una mayúscula
     - Al menos una minúscula
     - Al menos un número
     - Al menos un carácter especial
  4. El sistema muestra indicador de fortaleza con colores
  5. Si la contraseña no cumple requisitos:
     - El botón "Sí, restablecer" permanece deshabilitado
     - Se muestran mensajes de error específicos
  6. Una vez válida, continúa desde el paso 12

**FA-002: Administrador no copia contraseña**
- En el paso 22, si el admin intenta cerrar sin marcar checkbox:
  1. El sistema previene el cierre del modal
  2. Muestra advertencia: "⚠️ Debes copiar la contraseña antes de continuar"
  3. El botón "Cerrar" permanece deshabilitado
  4. Debe marcar el checkbox para poder cerrar
  5. Continúa desde el paso 22

**FA-003: Envío de email deshabilitado**
- En el paso 10, si el admin desmarca "Enviar por email":
  1. En el paso 20, se omite el envío de email
  2. El sistema muestra advertencia adicional en modal de éxito:
     - "No se envió email. Debes comunicar la contraseña manualmente al usuario."
  3. El admin es responsable de comunicar la contraseña
  4. Continúa desde el paso 21

**FA-004: Administrador cancela el restablecimiento**
- En el paso 12, si el admin hace clic en "Cancelar":
  1. El sistema cierra el modal de confirmación
  2. No se realiza ningún cambio
  3. La contraseña del usuario permanece sin cambios
  4. No se registra evento en auditoría
  5. **Fin del caso de uso**

**FA-005: Envío de email falla**
- En el paso 20, si falla el envío de email:
  1. El sistema registra el error en logs
  2. La contraseña SE RESTABLECE de todos modos
  3. El sistema muestra advertencia en modal de éxito:
     - "⚠️ Contraseña restablecida pero no se pudo enviar email"
     - "Debes comunicar la contraseña manualmente al usuario"
  4. El modal de éxito permanece mostrando la contraseña
  5. Continúa desde el paso 21

**FA-006: Restablecer desde vista de detalle del usuario**
- Alternativa a los pasos 4-6:
  1. El admin accede a la vista de detalle del usuario
  2. El sistema muestra botón "Restablecer Contraseña" en sección de seguridad
  3. El admin hace clic en el botón
  4. Continúa desde el paso 7

**FA-007: Usuario tiene sesiones activas**
- En el paso 17-18, si el usuario tiene sesiones activas:
  1. El sistema muestra información adicional en modal:
     - "Este usuario tiene N sesiones activas que serán cerradas"
  2. Al confirmar, todas las sesiones se cierran inmediatamente
  3. El usuario verá mensaje "Tu contraseña fue restablecida. Inicia sesión con la nueva contraseña."
  4. Continúa con el flujo normal

#### Flujos de Excepción

**FE-001: Sin permisos para restablecer**
- En el paso 7, si el actor no tiene permisos:
  1. El sistema retorna error 403 Forbidden
  2. El sistema muestra mensaje: "No tienes permisos para restablecer contraseñas"
  3. El modal no se abre
  4. No se realiza ningún cambio
  5. **Fin del caso de uso**

**FE-002: Intento de auto-restablecimiento**
- En el paso 8, si el admin intenta restablecer su propia contraseña:
  1. El sistema previene la acción
  2. El sistema muestra error: "No puedes restablecer tu propia contraseña"
  3. El sistema sugiere: "Usa la opción 'Cambiar mi contraseña' en tu perfil o solicita a otro administrador"
  4. No se permite continuar
  5. **Fin del caso de uso**

**FE-003: Usuario no existe**
- En el paso 7, si el usuario fue eliminado:
  1. El sistema retorna error 404 Not Found
  2. El sistema muestra mensaje: "El usuario no existe"
  3. El sistema refresca la lista de usuarios
  4. **Fin del caso de uso**

**FE-004: Usuario está inactivo**
- En el paso 9, si el usuario está desactivado:
  1. El sistema detecta estado = 'inactivo'
  2. El sistema muestra advertencia en modal:
     - "⚠️ Este usuario está desactivado"
     - "El restablecimiento de contraseña se aplicará pero no podrá usar el sistema hasta ser reactivado"
  3. El sistema muestra opción adicional:
     - Checkbox "Reactivar usuario automáticamente"
  4. Si el admin marca el checkbox:
     - Se reactiva el usuario junto con el reset de contraseña
  5. Si no lo marca:
     - Solo se restablece contraseña
     - Usuario permanece inactivo
  6. Continúa con el flujo normal

**FE-005: Contraseña manual no cumple política**
- En el paso 13 (FA-001), si la contraseña manual es inválida:
  1. El sistema muestra errores específicos:
     - "Mínimo 8 caracteres"
     - "Debe contener al menos una mayúscula"
     - "Debe contener al menos una minúscula"
     - "Debe contener al menos un número"
     - "Debe contener al menos un carácter especial"
  2. Los requisitos no cumplidos se muestran en rojo
  3. El botón "Sí, restablecer" permanece deshabilitado
  4. El admin debe corregir la contraseña
  5. Continúa desde FA-001 paso 3

**FE-006: Error al actualizar base de datos**
- En el paso 16, si falla la actualización:
  1. El sistema hace rollback completo
  2. La contraseña no se modifica
  3. No se invalidan tokens
  4. El sistema registra error en logs
  5. El sistema muestra mensaje: "Error al restablecer contraseña. Intenta nuevamente."
  6. El modal de confirmación permanece abierto
  7. El admin puede reintentar desde el paso 12
  8. **Fin del caso de uso (fallo)**

**FE-007: Usuario pertenece a otra cooperativa**
- En el paso 7, si el usuario no pertenece a la cooperativa del admin:
  1. Si el admin NO es SuperAdmin:
     - El sistema previene la acción
     - Muestra error: "No tienes permisos para restablecer contraseñas de usuarios de otras cooperativas"
  2. Si es SuperAdmin:
     - Permite el restablecimiento (permisos globales)
  3. **Fin del caso de uso (fallo para admin regular)**

**FE-008: Usuario bloqueado por intentos fallidos**
- Si el usuario está bloqueado:
  1. El sistema muestra información adicional:
     - "Este usuario está bloqueado por intentos de login fallidos"
  2. El sistema ofrece checkbox adicional:
     - "Desbloquear usuario automáticamente"
  3. Si se marca:
     - Se desbloquea el usuario
     - Se resetea contador de intentos
     - Se restablece contraseña
  4. Si no se marca:
     - Solo se restablece contraseña
     - Usuario permanece bloqueado
  5. Continúa con el flujo normal

#### Postcondiciones

**Éxito:**
- Contraseña del usuario actualizada con nueva contraseña temporal
- Flag requiere_cambio_password establecido en true
- Contador de resets incrementado
- Fecha de último cambio actualizada
- Referencia al administrador que realizó el reset
- Todos los tokens del usuario invalidados
- Todas las sesiones activas cerradas
- Evento registrado en auditoría con método y motivo
- Email enviado al usuario (si se seleccionó la opción)
- Contraseña temporal mostrada al administrador una única vez
- Usuario deberá cambiar contraseña en próximo login

**Fallo:**
- Contraseña del usuario permanece sin cambios
- Tokens no se invalidan
- Sesiones permanecen activas
- Evento de error registrado en logs (no en auditoría)
- Se muestra mensaje de error al administrador

#### Reglas de Negocio

**RN-001:** Un administrador no puede restablecer su propia contraseña mediante este proceso  
**RN-002:** El restablecimiento siempre requiere cambio de contraseña en próximo acceso  
**RN-003:** La contraseña temporal debe cumplir la política de seguridad del sistema  
**RN-004:** Se invalidan todas las sesiones activas del usuario al restablecer  
**RN-005:** La contraseña temporal solo se muestra una vez al administrador  
**RN-006:** El motivo del restablecimiento es opcional pero recomendado  
**RN-007:** El envío de email es opcional, el admin puede comunicarla manualmente  
**RN-008:** SuperAdmin puede restablecer contraseñas de usuarios de cualquier cooperativa  
**RN-009:** Administradores regulares solo pueden restablecer de su cooperativa  
**RN-010:** Se incrementa contador de resets para tracking de seguridad  
**RN-011:** La contraseña autogenerada tiene 12 caracteres con alta entropía  
**RN-012:** Se puede combinar con reactivación o desbloqueo de usuario

#### Política de Contraseñas Temporales

**Contraseñas Autogeneradas:**
- Longitud: 12 caracteres
- Composición:
  - 3 letras mayúsculas aleatorias
  - 3 letras minúsculas aleatorias
  - 3 números aleatorios
  - 3 caracteres especiales aleatorios (!@#$%^&*()_+-=)
- Orden aleatorio para mayor seguridad
- Sin patrones predecibles
- Sin caracteres confusos (0/O, 1/l/I)

**Contraseñas Manuales:**
- Mínimo 8 caracteres
- Al menos una mayúscula (A-Z)
- Al menos una minúscula (a-z)
- Al menos un número (0-9)
- Al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)

#### Requisitos No Funcionales

**RNF-001 (Performance):** El restablecimiento debe completarse en menos de 3 segundos  
**RNF-002 (Seguridad):** La contraseña temporal nunca se registra en logs  
**RNF-003 (Seguridad):** La contraseña solo se muestra en texto plano una vez al admin  
**RNF-004 (Seguridad):** La invalidación de sesiones debe ser inmediata (< 1 segundo)  
**RNF-005 (Usabilidad):** El modal debe tener advertencias claras sobre responsabilidad  
**RNF-006 (Usabilidad):** El botón copiar debe dar feedback visual inmediato  
**RNF-007 (Auditoría):** Debe registrarse quién, cuándo, cómo (método) y por qué (motivo)  
**RNF-008 (Transaccionalidad):** El restablecimiento debe ser atómico  
**RNF-009 (UX):** El admin no debe poder cerrar modal sin confirmar que copió contraseña  
**RNF-010 (Email):** El email debe contener advertencias de seguridad claras

#### Referencias
- RF-USR-004: Resetear Contraseña (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-055+: Implementar endpoint POST /users/:id/reset-password
- CU-001: Iniciar sesión en el sistema
- CU-003: Recuperar contraseña olvidada (flujo diferente, usuario lo solicita)
- CU-004: Cambiar contraseña en primer acceso (se activa tras reset)
- CU-006: Crear nuevo usuario (también genera contraseña temporal)

---

### CU-012: Buscar y filtrar usuarios

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-012  
**Prioridad:** Alta

#### Descripción
Permite a un administrador buscar y filtrar usuarios del sistema mediante múltiples criterios, facilitando la localización rápida de usuarios específicos y la generación de listados personalizados con paginación y ordenamiento.

#### Actores
- **Actor Principal:** Administrador, SuperAdmin u Operador
- **Actores Secundarios:** Ninguno

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener el permiso "Usuarios.Busqueda.Consultar"
3. El actor debe tener acceso al módulo de Gestión de Usuarios
4. Debe haber al menos un usuario registrado en el sistema

#### Flujo Principal

1. El administrador accede al módulo "Gestión de Usuarios"
2. El sistema presenta la vista principal con:
   
   **Barra de búsqueda rápida:**
   - Campo de búsqueda global (placeholder: "Buscar por usuario, nombre, email o identificación...")
   - Botón "Buscar" (lupa)
   - Botón "Filtros avanzados" (icono de filtro con contador de filtros activos)
   - Botón "Limpiar" (visible solo si hay búsqueda o filtros activos)
   
   **Panel de filtros avanzados (colapsable):**
   - Dropdown "Estado": Todos, Activo, Inactivo, Bloqueado
   - Dropdown "Rol": Todos, SuperAdmin, Administrador, Operador, Consultor, [otros roles]
   - Dropdown "Cooperativa": Solo visible para SuperAdmin, lista todas las cooperativas
   - Dropdown "Sucursal": Lista de sucursales de la cooperativa
   - Date picker "Fecha creación desde"
   - Date picker "Fecha creación hasta"
   - Checkbox "Mostrar usuarios eliminados" (solo para usuarios con permisos especiales)
   
   **Tabla de resultados:**
   - Columnas visibles por defecto:
     * Checkbox (selección múltiple)
     * Username
     * Nombre completo
     * Email
     * Roles (badges con colores)
     * Estado (badge: verde=activo, rojo=inactivo, amarillo=bloqueado)
     * Última conexión
     * Acciones (menú de 3 puntos)
   - Ordenamiento por columna (clic en encabezado)
   - Paginación en pie de tabla
   
   **Información de resultados:**
   - "Mostrando 1-25 de 156 usuarios"
   - Selector de registros por página: 10, 25, 50, 100
   
   **Acciones masivas (visible solo si hay selección):**
   - "Activar seleccionados"
   - "Desactivar seleccionados"
   - "Exportar seleccionados"

3. Por defecto, el sistema carga y muestra los primeros 25 usuarios activos ordenados por fecha de creación descendente (más recientes primero)

4. El administrador puede realizar búsqueda rápida:
   - Ingresa texto en el campo de búsqueda global
   - El sistema busca en tiempo real (debounce de 500ms) en:
     * Username
     * Nombres y apellidos
     * Email
     * Número de identificación
   - La búsqueda es case-insensitive y parcial (LIKE %texto%)

5. Alternativamente, el administrador puede usar filtros avanzados:
   - Hace clic en "Filtros avanzados"
   - El panel se expande mostrando todos los filtros
   - Selecciona valores en los dropdowns y date pickers deseados
   - Los filtros se aplican en tiempo real o al hacer clic en "Aplicar filtros"

6. El sistema ejecuta la búsqueda/filtrado:
   - Construye query con los criterios especificados
   - Aplica filtro de cooperativa automáticamente (excepto SuperAdmin)
   - Respeta el filtro de usuarios no eliminados (por defecto)
   - Ejecuta consulta paginada en base de datos

7. El sistema retorna y muestra los resultados:
   - Lista de usuarios que coinciden con los criterios
   - Actualiza el contador "Mostrando X-Y de Z usuarios"
   - Resalta el texto buscado en los resultados (opcional)
   - Muestra mensaje si no hay resultados: "No se encontraron usuarios"

8. El administrador puede:
   - **Ordenar resultados:** Clic en encabezado de columna (alterna ASC/DESC)
   - **Cambiar página:** Usa controles de paginación (anterior, siguiente, número específico)
   - **Cambiar registros por página:** Selecciona 10, 25, 50 o 100
   - **Ver detalle:** Clic en fila o botón "Ver" en menú de acciones
   - **Realizar acciones:** Editar, desactivar, restablecer contraseña, etc.

9. Si selecciona múltiples usuarios:
   - Marca checkboxes de usuarios deseados
   - O usa checkbox en encabezado para "Seleccionar todos en esta página"
   - El sistema muestra barra de acciones masivas
   - Puede aplicar acciones a todos los seleccionados

10. El sistema mantiene el estado de búsqueda/filtros:
    - Al volver de ver detalle, mantiene filtros y posición
    - Los filtros persisten en sesión
    - Puede guardar filtro frecuente como "favorito" (opcional)

11. **Fin del caso de uso**

#### Flujos Alternativos

**FA-001: Búsqueda sin resultados**
- En el paso 7, si no hay usuarios que coincidan:
  1. El sistema muestra mensaje: "No se encontraron usuarios que coincidan con tu búsqueda"
  2. El sistema sugiere:
     - "Intenta con otros criterios"
     - "Verifica los filtros aplicados"
  3. Muestra botón "Limpiar filtros"
  4. La tabla queda vacía
  5. El administrador puede modificar criterios
  6. Continúa desde el paso 4 o 5

**FA-002: Limpiar búsqueda y filtros**
- En cualquier momento:
  1. El admin hace clic en "Limpiar"
  2. El sistema:
     - Limpia el campo de búsqueda
     - Resetea todos los filtros a valores por defecto
     - Recarga la lista completa de usuarios activos
     - Vuelve a la primera página
  3. Continúa desde el paso 3

**FA-003: Guardar filtro como favorito**
- En el paso 5, después de configurar filtros:
  1. El admin hace clic en "Guardar filtro"
  2. El sistema muestra modal:
     - Campo "Nombre del filtro" (ej: "Usuarios activos de mi sucursal")
     - Botón "Guardar"
  3. El admin ingresa nombre y guarda
  4. El sistema guarda la configuración asociada al usuario
  5. El filtro aparece en lista desplegable "Mis filtros"
  6. Puede cargarlo en el futuro con un clic

**FA-004: Exportar resultados actuales**
- En el paso 8:
  1. El admin hace clic en botón "Exportar"
  2. El sistema muestra opciones:
     - Formato: Excel, CSV, PDF
     - Rango: "Página actual" o "Todos los resultados"
     - Columnas: Selección de columnas a incluir
  3. El admin selecciona opciones y confirma
  4. El sistema genera archivo con resultados filtrados
  5. El sistema descarga automáticamente el archivo
  6. Continúa con la vista actual

**FA-005: Seleccionar todos los usuarios (más allá de página actual)**
- En el paso 9:
  1. El admin marca checkbox de encabezado
  2. El sistema selecciona usuarios de la página actual
  3. El sistema muestra banner: "25 usuarios seleccionados en esta página"
  4. El sistema ofrece link: "Seleccionar todos los 156 usuarios que coinciden"
  5. Si el admin hace clic en el link:
     - Se marcan todos los usuarios del resultado (todas las páginas)
     - Banner actualiza: "156 usuarios seleccionados"
  6. Las acciones masivas se aplican a todos
  7. Continúa desde el paso 9

**FA-006: Ver usuarios eliminados (soft delete)**
- Si el admin tiene permisos especiales:
  1. En el paso 5, marca checkbox "Mostrar usuarios eliminados"
  2. El sistema incluye usuarios con `fecha_eliminacion NOT NULL`
  3. Los usuarios eliminados se muestran con estilo diferente:
     - Texto tachado
     - Badge "Eliminado" en rojo
     - Fecha de eliminación en tooltip
  4. Las acciones disponibles son limitadas:
     - Ver detalle
     - Restaurar (si tiene permisos)
  5. Continúa con el flujo normal

**FA-007: Búsqueda por cooperativa (SuperAdmin)**
- Si el actor es SuperAdmin:
  1. En el paso 5, aparece filtro "Cooperativa"
  2. El admin selecciona una o varias cooperativas
  3. El sistema filtra usuarios solo de las cooperativas seleccionadas
  4. Puede ver usuarios de cualquier cooperativa
  5. Continúa con el flujo normal

#### Flujos de Excepción

**FE-001: Sin permisos para buscar usuarios**
- En el paso 2, si el actor no tiene permisos:
  1. El sistema no muestra el módulo en el menú
  2. Si intenta acceder directamente a la URL:
     - Retorna error 403 Forbidden
     - Muestra mensaje: "No tienes permisos para consultar usuarios"
     - Redirecciona al dashboard
  3. **Fin del caso de uso**

**FE-002: Error en la consulta de base de datos**
- En el paso 6, si falla la consulta:
  1. El sistema captura el error
  2. El sistema registra error en logs
  3. El sistema muestra mensaje amigable:
     - "Error temporal al buscar usuarios"
     - "Por favor intenta nuevamente en unos momentos"
  4. El sistema mantiene los filtros aplicados
  5. El admin puede reintentar la búsqueda
  6. **Fin del caso de uso (fallo)**

**FE-003: Timeout en búsqueda**
- En el paso 6, si la consulta tarda más de 10 segundos:
  1. El sistema cancela la consulta
  2. El sistema muestra advertencia:
     - "La búsqueda está tomando más tiempo de lo esperado"
     - "Intenta con criterios más específicos"
  3. Sugiere reducir el rango de fechas o usar más filtros
  4. El admin debe ajustar criterios
  5. Continúa desde el paso 4

**FE-004: Formato de fecha inválido**
- En el paso 5, si las fechas son inválidas:
  1. El sistema valida en tiempo real
  2. Muestra error específico:
     - "Fecha desde no puede ser mayor a Fecha hasta"
     - "Fecha no puede ser futura"
     - "Formato de fecha inválido"
  3. Marca el campo en rojo
  4. No ejecuta la búsqueda hasta corregir
  5. Continúa desde el paso 5

**FE-005: Demasiados resultados para exportar**
- En FA-004, si hay más de 10,000 registros:
  1. El sistema previene la exportación completa
  2. Muestra advertencia:
     - "El resultado tiene más de 10,000 registros"
     - "Usa filtros más específicos o exporta por páginas"
  3. Ofrece opciones:
     - Exportar solo página actual
     - Exportar primeros 10,000
     - Aplicar más filtros
  4. El admin debe elegir una opción
  5. Continúa según elección

**FE-006: Acción masiva sobre demasiados usuarios**
- En FA-005, si se intenta acción masiva sobre > 100 usuarios:
  1. El sistema muestra confirmación adicional:
     - "Vas a realizar esta acción sobre 156 usuarios"
     - "Esta operación puede tardar varios minutos"
     - "¿Deseas continuar?"
  2. Si confirma:
     - Ejecuta acción en background
     - Muestra barra de progreso
     - Notifica al completar
  3. Si cancela:
     - Descarta la acción
     - Vuelve a la vista de búsqueda

#### Postcondiciones

**Éxito:**
- Usuarios filtrados mostrados correctamente en tabla
- Criterios de búsqueda/filtros aplicados y activos
- Paginación funcionando correctamente
- Estado de búsqueda mantenido en sesión
- Ordenamiento aplicado según selección
- Contador de resultados actualizado
- Acciones disponibles según permisos del usuario

**Fallo:**
- Se muestra mensaje de error apropiado
- Filtros se mantienen (no se pierden)
- El usuario puede reintentar la búsqueda
- Error registrado en logs del sistema

#### Reglas de Negocio

**RN-001:** Por defecto, solo se muestran usuarios activos (no eliminados)  
**RN-002:** La búsqueda es case-insensitive y admite coincidencias parciales  
**RN-003:** Los administradores regulares solo ven usuarios de su cooperativa  
**RN-004:** SuperAdmin puede ver usuarios de todas las cooperativas  
**RN-005:** La búsqueda tiene un debounce de 500ms para evitar consultas excesivas  
**RN-006:** Los resultados se paginan con máximo 100 registros por página  
**RN-007:** El ordenamiento por defecto es por fecha de creación descendente  
**RN-008:** Los filtros se mantienen al navegar entre páginas  
**RN-009:** Las exportaciones están limitadas a 10,000 registros máximo  
**RN-010:** Las acciones masivas sobre más de 100 usuarios requieren confirmación adicional  
**RN-011:** Solo usuarios con permisos especiales pueden ver usuarios eliminados  
**RN-012:** Los usuarios bloqueados se muestran con badge distintivo

#### Criterios de Búsqueda Disponibles

**Búsqueda Rápida (campo global):**
- Username (coincidencia parcial)
- Nombres (coincidencia parcial)
- Apellidos (coincidencia parcial)
- Email (coincidencia parcial)
- Número de identificación (coincidencia exacta o parcial)

**Filtros Avanzados:**
- Estado: Activo, Inactivo, Bloqueado
- Rol: Todos los roles definidos en el sistema
- Cooperativa: Lista de cooperativas (solo SuperAdmin)
- Sucursal: Sucursales de la cooperativa del usuario
- Fecha creación desde/hasta
- Mostrar eliminados (checkbox)

**Ordenamiento Disponible:**
- Username (A-Z, Z-A)
- Nombre completo (A-Z, Z-A)
- Email (A-Z, Z-A)
- Fecha de creación (más reciente, más antiguo)
- Última conexión (más reciente, más antiguo)
- Estado (alfabético)

#### Requisitos No Funcionales

**RNF-001 (Performance):** La búsqueda debe retornar resultados en menos de 1 segundo para hasta 1,000 usuarios  
**RNF-002 (Performance):** Para más de 1,000 usuarios, máximo 3 segundos  
**RNF-003 (Performance):** El debounce de búsqueda debe ser de 500ms  
**RNF-004 (Usabilidad):** Los filtros deben ser intuitivos y fáciles de usar  
**RNF-005 (Usabilidad):** Debe haber feedback visual inmediato al aplicar filtros  
**RNF-006 (UX):** La tabla debe ser responsive y adaptarse a diferentes tamaños de pantalla  
**RNF-007 (Accesibilidad):** Navegación por teclado debe estar soportada  
**RNF-008 (Escalabilidad):** Debe manejar eficientemente hasta 10,000 usuarios  
**RNF-009 (Cache):** Los catálogos de filtros (roles, sucursales) deben cachearse  
**RNF-010 (Persistencia):** El estado de búsqueda debe persistir en la sesión

#### Referencias
- RF-USR-005: Buscar Usuarios (PRD)
- RF-USR-006: Filtros Avanzados (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-056+: Implementar endpoint GET /users con filtros y paginación
- CU-006: Crear nuevo usuario
- CU-007: Editar usuario existente
- CU-013: Ver detalle de usuario (navegación desde búsqueda)

---

### CU-013: Ver detalle de usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-013  
**Prioridad:** Alta

#### Descripción
Permite visualizar de forma detallada toda la información de un usuario específico del sistema, incluyendo datos personales, credenciales, permisos asignados, roles, historial de actividad y estado actual. Proporciona una vista consolidada de 360° del usuario con acceso a funciones relacionadas.

#### Actores
- **Actor Principal:** Administrador, SuperAdmin
- **Actor Secundario:** Usuario consultor con permisos, Sistema de auditoría

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener permiso "Usuarios.Gestión.Consultar" o "Usuarios.Gestión.Editar"
3. El usuario a consultar debe existir en el sistema
4. El actor debe tener acceso multi-tenant apropiado (misma cooperativa o SuperAdmin)

#### Flujo Principal

1. El actor accede al detalle del usuario mediante una de estas vías:
   - Clic en una fila de la tabla de búsqueda de usuarios
   - Clic en botón "Ver detalle" o ícono de ojo en la grilla
   - Navegación directa por URL con ID del usuario
   - Desde notificación o enlace contextual del sistema

2. El sistema valida los permisos del actor para consultar usuarios

3. El sistema valida el acceso multi-tenant:
   - Si es SuperAdmin: puede ver usuarios de cualquier cooperativa
   - Si es Administrador/Operador: solo puede ver usuarios de su cooperativa

4. El sistema recupera toda la información del usuario desde la base de datos

5. El sistema presenta una vista detallada organizada en secciones/tabs:

   **Tab 1: Información General**
   - Fotografía del usuario (si existe)
   - Estado actual (badge visual: Activo/Inactivo/Bloqueado)
   - Código de usuario
   - Nombre de usuario (username)
   - Nombres completos (desde tabla personas)
   - Tipo de identificación y número
   - Email (con indicador de verificación)
   - Teléfonos (celular y convencional)
   - Sucursal/Oficina asignada
   - Fecha de creación de la cuenta
   - Último inicio de sesión (fecha y hora)
   - Fecha de última modificación

   **Tab 2: Roles y Permisos**
   - Listado de roles asignados con descripción
   - Árbol de permisos agrupados por módulo
   - Indicadores visuales de permisos heredados vs. directos
   - Fecha de asignación de cada rol
   - Usuario que asignó el rol

   **Tab 3: Historial de Actividad**
   - Tabla de últimas 50 acciones realizadas
   - Columnas: Fecha/Hora, Acción, Módulo, Detalles
   - Filtros por fecha y tipo de acción
   - Enlace a auditoría completa del usuario
   - Gráfico de actividad de últimos 30 días

   **Tab 4: Sesiones Activas**
   - Lista de sesiones activas del usuario
   - Por cada sesión: Fecha inicio, IP, Navegador, Ubicación estimada
   - Estado de sesión (activa/expirada)
   - Opción de cerrar sesiones remotamente (solo SuperAdmin)

   **Tab 5: Historial de Cambios**
   - Timeline de modificaciones al usuario
   - Por cada cambio: Fecha, Usuario que modificó, Campo modificado, Valor anterior, Valor nuevo
   - Cambios de estado (activaciones, desactivaciones, bloqueos)
   - Cambios de roles y permisos
   - Reseteos de contraseña

6. El sistema muestra en la parte superior acciones rápidas (según permisos):
   - Botón "Editar usuario" (si tiene permiso de edición)
   - Botón "Resetear contraseña" (si tiene permiso)
   - Botón "Cambiar estado" (Activar/Desactivar/Bloquear)
   - Botón "Ver auditoría completa"
   - Botón "Imprimir perfil"
   - Botón "Enviar notificación al usuario"
   - Botón "Volver" (regresa a búsqueda conservando filtros)

7. El sistema registra en auditoría la consulta del detalle del usuario

8. El caso de uso finaliza exitosamente

#### Flujos Alternativos

**FA-001: Usuario actualmente bloqueado**
- En paso 5, si el usuario está bloqueado, el sistema muestra:
  - Banner de alerta roja indicando estado bloqueado
  - Motivo del bloqueo
  - Fecha y hora del bloqueo
  - Usuario que realizó el bloqueo
  - Cantidad de intentos fallidos de login (si aplica)
  - Botón destacado "Desbloquear usuario" (si tiene permiso)
- El flujo continúa normalmente

**FA-002: Usuario inactivo/eliminado**
- En paso 5, si el usuario está inactivo (soft delete):
  - Se muestra banner amarillo indicando "Usuario Inactivo"
  - Se muestra motivo de desactivación
  - Fecha de desactivación y usuario que la realizó
  - Opción "Reactivar usuario" disponible (si tiene permiso)
  - Se muestran todos los datos históricos en modo solo lectura
- El flujo continúa normalmente

**FA-003: Primera vez que se consulta al usuario**
- Si es la primera consulta del usuario desde su creación:
  - Se muestra badge "Cuenta nueva - Sin actividad"
  - Se indica que nunca ha iniciado sesión
  - Se sugiere enviar recordatorio de activación
- El flujo continúa normalmente

**FA-004: Usuario con sesión activa actualmente**
- En paso 5, si el usuario está conectado en ese momento:
  - Se muestra indicador verde "En línea" con tiempo transcurrido
  - Se muestra actividad actual (última acción hace X minutos)
  - Se muestra IP y ubicación actual
- El flujo continúa normalmente

**FA-005: Consulta de perfil propio**
- Si el actor está consultando su propio perfil:
  - Se ocultan opciones de edición de roles/permisos
  - Se oculta opción de cambio de estado
  - Se muestra botón "Editar mi perfil" para datos básicos
  - Se muestra botón "Cambiar mi contraseña"
- El flujo continúa normalmente

**FA-006: Ver desde notificación**
- Si el acceso fue desde una notificación del sistema:
  - El sistema resalta automáticamente la sección relevante
  - Ejemplo: Si notificación es de cambio de permisos, abre tab "Roles y Permisos"
  - Se muestra contexto de la notificación en un panel lateral
- El flujo continúa normalmente

**FA-007: Usuario sin roles asignados**
- En step 5, tab 2, si el usuario no tiene roles:
  - Se muestra mensaje "Usuario sin roles asignados"
  - Se muestra advertencia "Este usuario no podrá acceder al sistema"
  - Se ofrece botón "Asignar rol ahora" (si tiene permiso)
- El flujo continúa normalmente

#### Flujos de Excepción

**FE-001: Usuario no encontrado**
- En paso 4, si el ID del usuario no existe:
  - Sistema muestra mensaje: "El usuario solicitado no existe o fue eliminado permanentemente"
  - Se ofrece botón "Volver a búsqueda de usuarios"
  - El caso de uso termina con error

**FE-002: Permisos insuficientes**
- En paso 2, si el actor no tiene permisos de consulta:
  - Sistema muestra mensaje: "No tiene permisos para consultar información de usuarios"
  - Se registra el intento en auditoría como "Acceso Denegado"
  - Se redirige a la página anterior o dashboard
  - El caso de uso termina con error

**FE-003: Violación de multi-tenancy**
- En paso 3, si el actor intenta ver usuario de otra cooperativa sin ser SuperAdmin:
  - Sistema muestra mensaje: "No tiene acceso a usuarios de otras cooperativas"
  - Se registra el intento como posible amenaza de seguridad
  - Se notifica a SuperAdmin sobre el intento
  - El caso de uso termina con error

**FE-004: Error al cargar información**
- En paso 4, si hay error al recuperar datos de BD:
  - Sistema muestra mensaje: "Error temporal al cargar información del usuario. Por favor intente nuevamente"
  - Se registra el error técnico en logs
  - Se ofrece botón "Reintentar"
  - El caso de uso termina con error

**FE-005: Sesión expirada durante consulta**
- En cualquier paso, si la sesión del actor expira:
  - Sistema guarda el contexto (ID usuario consultado)
  - Redirige a pantalla de login
  - Tras re-autenticación, redirige de vuelta al detalle del usuario
  - El caso de uso se reanuda

**FE-006: Error al cargar historial**
- En paso 5, si falla la carga de historial/auditoría:
  - Se muestran los datos principales normalmente
  - En tabs afectados se muestra: "Error al cargar historial. [Reintentar]"
  - El resto de tabs funcionan normalmente
  - El caso de uso continúa parcialmente

#### Postcondiciones

**Postcondición de Éxito:**
1. El actor ha visualizado toda la información del usuario consultado
2. Se ha registrado la consulta en el log de auditoría
3. El sistema mantiene el contexto para navegación posterior
4. El estado de búsqueda previa se conserva (si aplica)

**Postcondición de Fallo:**
1. No se ha accedido a información del usuario
2. El intento fallido se ha registrado en auditoría
3. El sistema muestra mensaje de error apropiado
4. El actor permanece en contexto de trabajo previo

#### Reglas de Negocio

**RN-001:** Solo usuarios con permisos explícitos de consulta pueden ver detalles de otros usuarios

**RN-002:** Los usuarios pueden ver su propio perfil sin restricciones, pero no pueden modificar sus propios roles/permisos

**RN-003:** SuperAdmin puede consultar usuarios de cualquier cooperativa; otros roles solo de su cooperativa

**RN-004:** Toda consulta de detalle de usuario debe registrarse en auditoría con timestamp e IP

**RN-005:** Las sesiones activas de otros usuarios solo pueden ser cerradas por SuperAdmin

**RN-006:** Los datos personales sensibles (teléfono, email) solo son visibles si el actor tiene permiso "Usuarios.Gestión.VerDatosPersonales"

**RN-007:** El historial de cambios debe mostrar solo los últimos 100 registros por defecto, con opción de ver más

**RN-008:** Los permisos heredados de roles deben diferenciarse visualmente de los permisos directos

**RN-009:** Si el usuario consultado está actualmente ejecutando acciones críticas, debe mostrarse indicador de advertencia antes de cambiar su estado

**RN-010:** La información de sesiones activas se actualiza en tiempo real cada 30 segundos

**RN-011:** El botón de "Resetear contraseña" requiere confirmación con motivo obligatorio

**RN-012:** Los datos del usuario en estado "eliminado" (soft delete) son de solo lectura y no pueden editarse

#### Requisitos No Funcionales

**RNF-001 (Performance):** La carga de la vista detallada debe completarse en menos de 1 segundo

**RNF-002 (Performance):** El cambio entre tabs debe ser instantáneo (< 200ms)

**RNF-003 (Seguridad):** Los datos personales sensibles deben estar enmascarados si el actor no tiene permisos específicos

**RNF-004 (Usabilidad):** La navegación entre usuarios (anterior/siguiente) debe estar disponible cuando se viene desde búsqueda

**RNF-005 (Usabilidad):** Las acciones principales deben ser accesibles sin scroll (sticky header)

**RNF-006 (Responsividad):** La vista debe adaptarse a tablets y dispositivos móviles con tabs colapsables

**RNF-007 (Cache):** Los catálogos de referencia (sucursales, roles) deben cachearse para evitar consultas repetidas

**RNF-008 (Accesibilidad):** La vista debe cumplir WCAG 2.1 nivel AA

**RNF-009 (Auditoría):** Cada apertura de tab debe registrarse para análisis de uso

**RNF-010 (Disponibilidad):** El historial de actividad debe cargarse de forma lazy para no bloquear la vista principal

**RNF-011 (UX):** Debe incluir breadcrumbs para facilitar navegación (Inicio > Usuarios > [Nombre Usuario])

**RNF-012 (Escalabilidad):** El historial debe implementar scroll infinito o paginación para manejar grandes volúmenes

#### Referencias
- RF-USR-005: Buscar Usuarios (PRD)
- RF-USR-002: Editar Usuario (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-057: Implementar endpoint GET /users/:id con información completa
- TICKET-058: Crear vista detallada de usuario en frontend
- CU-012: Buscar y filtrar usuarios (origen de navegación)
- CU-007: Editar usuario existente (acción desde detalle)
- CU-014: Asignar roles a usuario (acción desde detalle)

---

### CU-014: Asignar roles a usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-014  
**Prioridad:** Crítica

#### Descripción
Permite asignar, modificar o revocar roles a usuarios del sistema para definir sus niveles de acceso y permisos. Este proceso es fundamental para el control de acceso basado en roles (RBAC) y define qué operaciones puede realizar cada usuario en el sistema.

#### Actores
- **Actor Principal:** SuperAdmin, Administrador con permisos de gestión de roles
- **Actor Secundario:** Sistema de auditoría, Sistema de permisos

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener permiso "Usuarios.Gestión.AsignarRoles"
3. El usuario objetivo debe existir y estar activo
4. Debe existir al menos un rol disponible en el sistema
5. El actor debe tener nivel de privilegio igual o superior al rol que desea asignar
6. El actor debe pertenecer a la misma cooperativa que el usuario objetivo (excepto SuperAdmin)

#### Flujo Principal

1. El actor accede a la funcionalidad de asignación de roles mediante una de estas vías:
   - Desde el detalle del usuario (botón "Gestionar roles")
   - Desde la tabla de usuarios (opción en menú contextual)
   - Desde el módulo de "Roles y Permisos" seleccionando usuario

2. El sistema valida que el actor tenga permisos para asignar roles

3. El sistema valida el acceso multi-tenant (misma cooperativa)

4. El sistema presenta un modal/vista con la siguiente información:

   **Sección Superior - Información del Usuario:**
   - Nombre completo del usuario
   - Username
   - Email
   - Estado actual
   - Sucursal asignada

   **Sección Central - Roles Disponibles:**
   - Lista de todos los roles disponibles en el sistema
   - Por cada rol muestra:
     * Nombre del rol
     * Descripción breve
     * Nivel de privilegio (indicador visual)
     * Cantidad de permisos incluidos
     * Checkbox de selección/deselección
     * Estado actual (asignado/no asignado)
     * Fecha de asignación (si ya está asignado)
   - Roles actuales marcados con badge "Asignado"
   - Opción "Ver permisos detallados" por cada rol (expandible)

   **Sección de Roles Actuales:**
   - Listado de roles ya asignados con opción de remover
   - Usuario que asignó el rol
   - Fecha de asignación
   - Botón "Revocar" individual por rol

5. El actor selecciona/deselecciona los roles deseados:
   - Marcar checkbox para asignar nuevo rol
   - Desmarcar checkbox o clic en "Revocar" para quitar rol existente

6. El sistema valida en tiempo real:
   - El actor solo puede asignar roles de su nivel o inferior
   - Al menos debe quedar un rol asignado (no puede dejar sin roles)
   - SuperAdmin es rol único (solo un usuario puede tenerlo)
   - Roles mutuamente excluyentes (si aplica)

7. El actor opcionalmente puede agregar:
   - Motivo de la asignación/revocación (campo de texto)
   - Fecha de inicio de vigencia (por defecto inmediata)
   - Fecha de fin de vigencia (opcional, para roles temporales)
   - Notificar al usuario por email (checkbox)

8. El actor hace clic en "Guardar cambios" o "Aplicar"

9. El sistema muestra confirmación con resumen de cambios:
   - Roles que se agregarán (en verde)
   - Roles que se revocarán (en rojo)
   - Permisos que ganará (resumen)
   - Permisos que perderá (resumen)
   - Advertencia si pierde acceso a áreas críticas

10. El actor confirma la operación

11. El sistema procesa la transacción:
    - Revoca roles marcados para remover
    - Asigna nuevos roles seleccionados
    - Actualiza tabla `usuarios_roles` con timestamps
    - Registra motivo y usuario que realizó el cambio

12. El sistema invalida sesiones activas del usuario modificado (opcional configurable)

13. El sistema registra en auditoría:
    - Acción: "ASSIGN_ROLES" o "REVOKE_ROLES"
    - Usuario afectado
    - Roles agregados/removidos
    - Actor que realizó el cambio
    - Timestamp
    - IP origen
    - Motivo (si se proporcionó)

14. Si se activó notificación, el sistema envía email al usuario informando:
    - Roles asignados/revocados
    - Fecha efectiva
    - Nuevos permisos disponibles
    - Contacto de soporte si tiene dudas

15. El sistema muestra mensaje de éxito: "Roles actualizados correctamente para [Nombre Usuario]"

16. El sistema actualiza la vista de detalle del usuario (si aplica)

17. El caso de uso finaliza exitosamente

#### Flujos Alternativos

**FA-001: Asignación de rol SuperAdmin**
- En paso 5, si el actor intenta asignar rol SuperAdmin:
  - Sistema valida que el actor sea SuperAdmin actual
  - Muestra advertencia crítica: "El rol SuperAdmin es único. Al asignarlo a [Usuario], el rol será removido de [Usuario Actual SuperAdmin]. ¿Desea continuar?"
  - Requiere confirmación adicional con contraseña del SuperAdmin actual
  - Requiere motivo obligatorio
  - Al confirmar, transfiere el rol SuperAdmin
  - Notifica a ambos usuarios (nuevo y anterior SuperAdmin)
  - Registra evento crítico en auditoría
- El flujo continúa en paso 11

**FA-002: Revocar último rol del usuario**
- En paso 6, si el actor intenta dejar al usuario sin roles:
  - Sistema bloquea la acción
  - Muestra mensaje: "Un usuario debe tener al menos un rol asignado. Asigne un rol alternativo antes de revocar este."
  - No permite continuar hasta asignar otro rol
- El flujo regresa a paso 5

**FA-003: Asignación masiva de roles**
- En paso 1, si el actor seleccionó múltiples usuarios desde la tabla:
  - Sistema abre modal de asignación masiva
  - Muestra lista de usuarios seleccionados (máx. 50)
  - Permite seleccionar roles comunes para todos
  - Valida que todos los usuarios cumplan precondiciones
  - Aplica cambios de forma transaccional (todo o nada)
  - Genera reporte de asignación con resultado por usuario
- El caso de uso finaliza con reporte de resultados

**FA-004: Roles con vigencia temporal**
- En paso 7, si el actor define fecha de fin de vigencia:
  - Sistema marca el rol como "temporal"
  - Muestra indicador visual en vista de usuario
  - Programa tarea automática para revocar rol en fecha indicada
  - Notifica 7 días antes del vencimiento al usuario y administradores
  - Al vencer, revoca automáticamente el rol
  - Registra en auditoría como "AUTO_REVOKE_EXPIRED"
- El flujo continúa normalmente

**FA-005: Visualización de impacto de permisos**
- En paso 4, si el actor hace clic en "Ver permisos detallados":
  - Sistema despliega panel lateral con árbol de permisos del rol
  - Agrupa permisos por módulo
  - Muestra con colores los permisos que ya tiene vs. nuevos
  - Incluye buscador de permisos
  - Permite comparar permisos entre roles
- El flujo continúa normalmente

**FA-006: Usuario actualmente conectado**
- En paso 11, si el usuario objetivo tiene sesión activa:
  - Sistema muestra advertencia: "El usuario está conectado actualmente. Los cambios surtirán efecto al cerrar/refrescar su sesión."
  - Ofrece opción "Forzar cierre de sesión inmediato"
  - Si se selecciona, invalida tokens JWT activos
  - Usuario afectado es deslogueado y debe volver a iniciar sesión
  - Registra evento en auditoría
- El flujo continúa en paso 13

**FA-007: Auto-asignación de roles (para pruebas)**
- Si el actor intenta modificar sus propios roles:
  - Sistema muestra advertencia: "Está modificando sus propios roles. Esto puede resultar en pérdida de acceso."
  - Requiere confirmación adicional
  - Bloquea remoción del último rol administrativo propio
  - Registra evento crítico en auditoría
- El flujo continúa con restricciones de seguridad

#### Flujos de Excepción

**FE-001: Permisos insuficientes**
- En paso 2, si el actor no tiene permiso para asignar roles:
  - Sistema muestra mensaje: "No tiene permisos para asignar roles a usuarios"
  - Registra intento en auditoría como "ACCESS_DENIED"
  - Redirige a página anterior
  - El caso de uso termina con error

**FE-002: Intento de asignar rol superior**
- En paso 6, si el actor intenta asignar un rol de nivel superior al suyo:
  - Sistema bloquea la selección
  - Muestra tooltip: "No puede asignar roles de nivel superior al suyo"
  - Deshabilita checkbox del rol
  - El flujo regresa a paso 5

**FE-003: Usuario no encontrado o eliminado**
- En paso 3, si el usuario objetivo no existe o está eliminado:
  - Sistema muestra mensaje: "El usuario no existe o fue eliminado"
  - Ofrece botón "Volver a búsqueda"
  - El caso de uso termina con error

**FE-004: Violación de multi-tenancy**
- En paso 3, si el usuario objetivo es de otra cooperativa y actor no es SuperAdmin:
  - Sistema muestra mensaje: "No tiene acceso a usuarios de otras cooperativas"
  - Registra intento como posible amenaza de seguridad
  - Notifica a SuperAdmin del intento
  - El caso de uso termina con error

**FE-005: Error en transacción de base de datos**
- En paso 11, si falla la actualización en BD:
  - Sistema ejecuta rollback completo
  - No se aplica ningún cambio
  - Muestra mensaje: "Error al actualizar roles. Por favor intente nuevamente."
  - Registra error técnico en logs
  - Ofrece botón "Reintentar"
  - El caso de uso termina con error

**FE-006: Sesión expirada durante asignación**
- En cualquier paso, si la sesión del actor expira:
  - Sistema guarda draft de los cambios pendientes en sesión
  - Redirige a login
  - Tras re-autenticación, ofrece "Continuar con asignación pendiente"
  - Valida nuevamente permisos
  - El caso de uso se reanuda o termina según permisos

**FE-007: Conflicto de concurrencia**
- En paso 11, si otro usuario modificó roles del mismo usuario simultáneamente:
  - Sistema detecta conflicto (optimistic locking)
  - Muestra mensaje: "Otro usuario modificó los roles de este usuario mientras editaba. Cambios actuales: [lista de cambios]"
  - Ofrece opciones:
    * "Recargar y ver cambios actuales"
    * "Sobrescribir con mis cambios" (solo SuperAdmin)
    * "Cancelar"
  - El flujo se adapta según opción seleccionada

#### Postcondiciones

**Postcondición de Éxito:**
1. Los roles del usuario han sido actualizados correctamente en la base de datos
2. La tabla `usuarios_roles` refleja los cambios con timestamps actualizados
3. El cambio ha sido registrado en el log de auditoría con todos los detalles
4. Si aplicaba, las sesiones activas del usuario han sido invalidadas
5. El usuario ha sido notificado por email (si se activó la opción)
6. Los permisos efectivos del usuario han sido actualizados
7. El actor puede ver los cambios reflejados en la vista de usuario

**Postcondición de Fallo:**
1. No se han realizado cambios en los roles del usuario
2. El intento fallido ha sido registrado en auditoría
3. Se ha mostrado mensaje de error apropiado al actor
4. El sistema mantiene estado consistente (no hay cambios parciales)
5. Las sesiones activas no han sido afectadas

#### Reglas de Negocio

**RN-001:** Todo usuario debe tener al menos un rol asignado en todo momento

**RN-002:** Solo SuperAdmin puede asignar el rol SuperAdmin a otro usuario

**RN-003:** Solo puede existir un usuario con rol SuperAdmin activo simultáneamente

**RN-004:** Un administrador no puede asignar roles de nivel superior al suyo propio

**RN-005:** La asignación de roles debe registrarse con usuario, fecha, hora y motivo en auditoría

**RN-006:** Al revocar roles, el usuario debe quedar al menos con un rol que le permita acceso básico

**RN-007:** Los cambios de roles pueden requerir cierre de sesión del usuario afectado según configuración

**RN-008:** SuperAdmin no puede auto-removerse el rol SuperAdmin sin asignarlo a otro usuario primero

**RN-009:** Los roles temporales deben tener fecha de inicio y fin definidas

**RN-010:** La revocación automática de roles temporales vencidos se ejecuta diariamente

**RN-011:** La asignación de roles solo puede hacerse dentro de la misma cooperativa (excepto SuperAdmin)

**RN-012:** Un usuario puede tener múltiples roles simultáneamente; los permisos se acumulan (unión)

**RN-013:** Si existen roles mutuamente excluyentes, el sistema debe validarlo y prevenir asignación simultánea

**RN-014:** La modificación de roles propios requiere confirmación adicional y se registra como evento crítico

**RN-015:** Los roles con permisos críticos (cambios de estado, eliminaciones) requieren motivo obligatorio al asignar

#### Requisitos No Funcionales

**RNF-001 (Performance):** La carga de roles disponibles debe completarse en menos de 500ms

**RNF-002 (Performance):** El guardado de cambios debe ejecutarse en menos de 2 segundos

**RNF-003 (Seguridad):** Toda asignación de roles debe registrarse en auditoría con contexto completo

**RNF-004 (Seguridad):** El sistema debe validar permisos en backend además de frontend

**RNF-005 (Usabilidad):** Los roles deben mostrarse ordenados por nivel de privilegio (menor a mayor)

**RNF-006 (Usabilidad):** Debe existir indicador visual claro entre roles asignados y disponibles

**RNF-007 (UX):** El modal de asignación debe incluir buscador de roles para sistemas con muchos roles

**RNF-008 (Transaccionalidad):** La asignación/revocación debe ser atómica (todo o nada)

**RNF-009 (Notificación):** El email de notificación debe enviarse de forma asíncrona sin bloquear la operación

**RNF-010 (Concurrencia):** Debe implementarse control de concurrencia optimista para evitar conflictos

**RNF-011 (Disponibilidad):** Los cambios de roles deben ser efectivos inmediatamente o en próxima validación de token

**RNF-012 (Auditoría):** Debe registrarse tanto roles agregados como removidos con datos antes/después

**RNF-013 (Accesibilidad):** La interfaz debe ser completamente navegable por teclado

**RNF-014 (Responsividad):** El modal debe adaptarse a dispositivos móviles con scroll vertical

#### Referencias
- RF-USR-007: Gestión de Roles (PRD)
- RF-USR-008: Gestión de Permisos (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-068: Implementar endpoint POST /users/:id/roles para asignación
- TICKET-069: Implementar endpoint DELETE /users/:id/roles/:roleId para revocación
- TICKET-070: Crear interfaz de asignación de roles en frontend
- CU-013: Ver detalle de usuario (contexto de origen)
- CU-015: Gestionar permisos específicos de usuario (complementario)

---

### CU-015: Gestionar permisos específicos de usuario

**Módulo:** Gestión de Usuarios  
**Identificador:** CU-015  
**Prioridad:** Alta

#### Descripción
Permite asignar, modificar o revocar permisos individuales y específicos a un usuario, independientemente de los permisos heredados de sus roles. Esta funcionalidad proporciona control granular para casos especiales donde se requiere otorgar o restringir accesos puntuales sin modificar la estructura de roles.

#### Actores
- **Actor Principal:** SuperAdmin, Administrador con permisos de gestión avanzada
- **Actor Secundario:** Sistema de auditoría, Sistema de autorización

#### Precondiciones
1. El actor debe estar autenticado en el sistema
2. El actor debe tener permiso "Usuarios.Gestión.GestionarPermisosEspecíficos"
3. El usuario objetivo debe existir y estar activo
4. Debe existir un catálogo de permisos disponibles en el sistema
5. El actor debe pertenecer a la misma cooperativa que el usuario objetivo (excepto SuperAdmin)
6. El usuario objetivo debe tener al menos un rol asignado

#### Flujo Principal

1. El actor accede a la gestión de permisos específicos mediante:
   - Desde el detalle del usuario (tab "Roles y Permisos" → botón "Gestionar permisos específicos")
   - Desde el módulo de "Roles y Permisos" → opción "Permisos por usuario"

2. El sistema valida que el actor tenga permisos para gestionar permisos específicos

3. El sistema valida el acceso multi-tenant (misma cooperativa)

4. El sistema presenta una interfaz dividida en tres paneles:

   **Panel Izquierdo - Información del Usuario:**
   - Nombre completo
   - Username
   - Roles asignados (lista con badges)
   - Sucursal
   - Estado
   - Indicador de permisos personalizados activos

   **Panel Central - Árbol de Permisos:**
   - Estructura jerárquica agrupada por módulo
   - Por cada módulo:
     * Nombre del módulo (expandible/colapsable)
     * Contador de permisos (ej: "8/12 permisos activos")
     * Icono de estado general
   - Por cada permiso muestra:
     * Checkbox de selección
     * Nombre del permiso (formato: Módulo.Submódulo.Acción)
     * Descripción breve (tooltip)
     * Origen del permiso (badge):
       - "Heredado de rol [Nombre Rol]" (color azul, read-only)
       - "Permiso directo" (color verde, editable)
       - "Denegado explícitamente" (color rojo, editable)
     * Fecha de asignación directa (si aplica)
   - Buscador en la parte superior para filtrar permisos
   - Filtros rápidos:
     * "Todos"
     * "Solo heredados"
     * "Solo directos"
     * "Denegados"
     * "Por módulo" (dropdown)

   **Panel Derecho - Resumen de Cambios:**
   - Lista de cambios pendientes por aplicar
   - Permisos a agregar (verde)
   - Permisos a revocar (rojo)
   - Contador total de cambios
   - Botón "Deshacer todos los cambios"
   - Campo de "Motivo" (opcional)
   - Checkbox "Notificar al usuario"

5. El actor visualiza los permisos actuales:
   - Los heredados de roles se muestran con checkbox deshabilitado
   - Los permisos directos se muestran con checkbox habilitado
   - Los denegados se muestran con badge rojo

6. El actor realiza modificaciones:
   - **Para agregar permiso directo:**
     * Marcar checkbox de un permiso no activo
     * El permiso se agrega al panel de cambios
     * Se marca como "Permiso directo" pendiente
   
   - **Para denegar permiso explícitamente:**
     * Clic derecho sobre permiso heredado → "Denegar explícitamente"
     * El permiso se marca como denegado aunque esté heredado del rol
     * Se agrega al panel de cambios en rojo
   
   - **Para revocar permiso directo:**
     * Desmarcar checkbox de permiso directo activo
     * El permiso se agrega al panel de cambios para remoción
   
   - **Para remover denegación explícita:**
     * Clic derecho sobre permiso denegado → "Remover denegación"
     * El permiso vuelve a estado según roles

7. El sistema valida en tiempo real:
   - No se pueden modificar permisos heredados (solo denegar)
   - Al denegar, se muestra advertencia de impacto
   - Se previene dejar usuario sin permisos críticos básicos
   - Se valida coherencia lógica (ej: no puede tener permiso de editar sin consultar)

8. El actor puede usar funciones avanzadas:
   - **"Copiar permisos de otro usuario":** Abre selector para copiar configuración
   - **"Plantilla de permisos":** Aplica conjunto predefinido de permisos
   - **"Vista comparativa":** Compara permisos con otro usuario o rol
   - **"Exportar configuración":** Genera reporte de permisos actuales

9. El actor revisa los cambios en el panel derecho

10. El actor opcionalmente agrega:
    - Motivo de los cambios (recomendado para denegaciones)
    - Activa/desactiva notificación por email

11. El actor hace clic en "Aplicar cambios"

12. El sistema muestra confirmación detallada:
    - Resumen de permisos que se agregarán
    - Resumen de permisos que se denegarán
    - Resumen de permisos que se revocarán
    - Advertencias críticas si aplica
    - Impacto estimado en acceso del usuario

13. El actor confirma la operación

14. El sistema procesa la transacción:
    - Inserta registros en tabla `usuarios_permisos` para permisos directos
    - Inserta registros con flag `denegado=true` para denegaciones explícitas
    - Elimina registros de permisos revocados
    - Actualiza timestamp de modificación

15. El sistema invalida caché de permisos del usuario

16. El sistema registra en auditoría:
    - Acción: "MANAGE_USER_PERMISSIONS"
    - Usuario afectado
    - Permisos agregados/denegados/revocados (detalle completo)
    - Actor que realizó el cambio
    - Motivo (si se proporcionó)
    - Timestamp e IP

17. Si se activó notificación, el sistema envía email al usuario:
    - Permisos agregados
    - Permisos revocados
    - Permisos denegados
    - Fecha efectiva
    - Contacto de soporte

18. El sistema muestra mensaje de éxito: "Permisos actualizados correctamente para [Nombre Usuario]"

19. El sistema actualiza la vista de permisos del usuario

20. El caso de uso finaliza exitosamente

#### Flujos Alternativos

**FA-001: Copiar permisos de otro usuario**
- En paso 8, si el actor usa "Copiar permisos de otro usuario":
  - Sistema abre modal con búsqueda de usuarios
  - Actor selecciona usuario origen
  - Sistema muestra comparativa lado a lado
  - Actor selecciona qué permisos copiar (puede ser parcial)
  - Opciones: "Solo directos", "Incluir denegaciones", "Todo"
  - Los permisos seleccionados se cargan como cambios pendientes
  - Se requiere confirmación explícita antes de aplicar
- El flujo continúa en paso 11

**FA-002: Aplicar plantilla de permisos**
- En paso 8, si el actor usa "Plantilla de permisos":
  - Sistema muestra lista de plantillas predefinidas
  - Por cada plantilla: nombre, descripción, cantidad de permisos
  - Actor selecciona plantilla
  - Sistema muestra vista previa de permisos a aplicar
  - Actor decide si:
    * "Reemplazar todos los permisos directos" (limpia existentes)
    * "Agregar a permisos existentes" (modo aditivo)
  - Los permisos se cargan como cambios pendientes
- El flujo continúa en paso 11

**FA-003: Denegar permiso crítico**
- En paso 6, si el actor intenta denegar un permiso crítico:
  - Sistema detecta que es permiso crítico (login, acceso básico)
  - Muestra advertencia en rojo: "⚠️ ADVERTENCIA: Está denegando un permiso crítico que puede impedir al usuario acceder al sistema"
  - Requiere confirmación adicional
  - Requiere motivo obligatorio
  - Registra evento crítico en auditoría
- El flujo continúa normalmente

**FA-004: Vista comparativa de permisos**
- En paso 8, si el actor usa "Vista comparativa":
  - Sistema abre modal de comparación
  - Actor selecciona entidad a comparar (usuario o rol)
  - Sistema muestra tabla comparativa de tres columnas:
    * Permiso
    * Estado en usuario actual
    * Estado en entidad comparada
  - Resalta diferencias con colores
  - Permite hacer clic para agregar/quitar permisos diferentes
- El flujo continúa en paso 9

**FA-005: Usuario sin roles asignados**
- En paso 6, si el usuario no tiene roles:
  - Sistema muestra advertencia: "Este usuario no tiene roles asignados. Todos los permisos deberán ser directos."
  - Todos los permisos se muestran como no heredados
  - Se requiere asignación manual de permisos mínimos
  - Sistema sugiere "Asignar rol básico primero"
- El flujo continúa con advertencias

**FA-006: Exportar configuración actual**
- En paso 8, si el actor usa "Exportar configuración":
  - Sistema genera documento PDF o Excel con:
    * Información del usuario
    * Roles asignados
    * Permisos heredados (agrupados por rol)
    * Permisos directos
    * Permisos denegados explícitamente
    * Fecha de generación
  - Se incluye resumen estadístico
  - Se ofrece descarga del archivo
- El flujo continúa normalmente

**FA-007: Asignación masiva de permisos**
- En paso 6, si el actor selecciona múltiples permisos de un módulo:
  - Clic en checkbox del módulo selecciona/deselecciona todos los hijos
  - Sistema muestra contador de selección masiva
  - Opción "Aplicar a todos los permisos de tipo X"
  - Se aplican reglas de dependencia entre permisos
- El flujo continúa normalmente

#### Flujos de Excepción

**FE-001: Permisos insuficientes**
- En paso 2, si el actor no tiene permiso para gestionar permisos específicos:
  - Sistema muestra mensaje: "No tiene autorización para gestionar permisos específicos de usuarios"
  - Registra intento en auditoría como "ACCESS_DENIED"
  - Redirige a página anterior
  - El caso de uso termina con error

**FE-002: Intento de auto-asignación de permisos críticos**
- En paso 6, si el actor intenta asignarse permisos a sí mismo:
  - Sistema muestra advertencia: "Está modificando sus propios permisos. Esto puede resultar en pérdida de acceso."
  - Bloquea asignación de ciertos permisos críticos a sí mismo
  - Requiere confirmación adicional con contraseña
  - Registra evento crítico en auditoría
- El flujo continúa con restricciones

**FE-003: Conflicto de dependencias de permisos**
- En paso 7, si se detecta conflicto de dependencias:
  - Ejemplo: Intenta dar permiso de "Editar" sin permiso de "Consultar"
  - Sistema muestra mensaje: "El permiso [X] requiere el permiso [Y]. ¿Desea agregarlo automáticamente?"
  - Opciones: "Agregar dependencias", "Cancelar", "Continuar sin dependencias (no recomendado)"
  - Si se agregan dependencias, se incluyen en el panel de cambios
- El flujo continúa según decisión

**FE-004: Error al aplicar cambios**
- En paso 14, si falla la transacción en BD:
  - Sistema ejecuta rollback completo
  - Ningún cambio se aplica parcialmente
  - Muestra mensaje: "Error al actualizar permisos. Por favor intente nuevamente."
  - Registra error técnico en logs
  - Los cambios pendientes se mantienen en sesión
  - Ofrece botón "Reintentar"
  - El caso de uso termina con error

**FE-005: Usuario objetivo inactivo o bloqueado**
- En paso 3, si el usuario está inactivo o bloqueado:
  - Sistema muestra advertencia: "El usuario está [ESTADO]. Los cambios se guardarán pero no tendrán efecto hasta que el usuario sea activado."
  - Permite continuar con advertencia visible
  - Marca los cambios como "pendientes de activación"
- El flujo continúa con advertencia

**FE-006: Sesión expirada durante edición**
- En cualquier paso, si la sesión del actor expira:
  - Sistema guarda draft de cambios pendientes en sesión
  - Redirige a login
  - Tras re-autenticación, ofrece "Continuar con cambios pendientes"
  - Valida nuevamente permisos
  - El caso de uso se reanuda o termina según permisos

**FE-007: Catálogo de permisos desactualizado**
- En paso 4, si hay discrepancia entre permisos en código vs. BD:
  - Sistema detecta permisos huérfanos o nuevos
  - Muestra notificación: "Se detectaron cambios en el catálogo de permisos. [Sincronizar ahora]"
  - Ofrece sincronización automática
  - Registra alerta para administradores
- El flujo puede continuar con advertencia

#### Postcondiciones

**Postcondición de Éxito:**
1. Los permisos específicos del usuario han sido actualizados en la base de datos
2. La tabla `usuarios_permisos` refleja los cambios con timestamps
3. El caché de permisos del usuario ha sido invalidado
4. Los cambios han sido registrados en auditoría con detalle completo
5. El usuario ha sido notificado por email (si se activó la opción)
6. Los permisos efectivos del usuario se actualizan en próxima validación
7. El sistema refleja los cambios en la vista de permisos del usuario

**Postcondición de Fallo:**
1. No se han realizado cambios en los permisos del usuario
2. El intento fallido ha sido registrado en auditoría
3. Se ha mostrado mensaje de error claro al actor
4. El sistema mantiene estado consistente (sin cambios parciales)
5. Los cambios pendientes se conservan en sesión para reintentar

#### Reglas de Negocio

**RN-001:** Los permisos directos tienen mayor prioridad que los heredados de roles

**RN-002:** Una denegación explícita siempre prevalece sobre permisos heredados o directos

**RN-003:** No se puede denegar un permiso y otorgarlo directamente simultáneamente (son mutuamente excluyentes)

**RN-004:** Los permisos heredados de roles no pueden ser removidos individualmente (solo denegados); deben modificarse desde el rol

**RN-005:** Todo cambio de permisos específicos debe registrarse en auditoría con detalle completo

**RN-006:** Un usuario debe mantener al menos permisos básicos de acceso al sistema

**RN-007:** Las denegaciones explícitas de permisos críticos requieren motivo obligatorio

**RN-008:** Los permisos específicos de un usuario se evalúan después de los permisos de rol (orden: rol → específicos → denegaciones)

**RN-009:** La gestión de permisos específicos solo puede hacerse dentro de la misma cooperativa (excepto SuperAdmin)

**RN-010:** Los permisos que tienen dependencias deben otorgarse junto con sus prerrequisitos

**RN-011:** No se puede auto-asignar el permiso de gestión de permisos específicos

**RN-012:** Los cambios en permisos específicos invalidan el caché inmediatamente

**RN-013:** Las plantillas de permisos son globales pero pueden ser personalizadas por cooperativa

**RN-014:** La copia de permisos entre usuarios debe respetar el nivel de privilegio del actor

#### Requisitos No Funcionales

**RNF-001 (Performance):** La carga del árbol de permisos debe completarse en menos de 1 segundo

**RNF-002 (Performance):** La aplicación de cambios debe ejecutarse en menos de 2 segundos

**RNF-003 (Seguridad):** Toda modificación de permisos debe registrarse en auditoría con contexto completo

**RNF-004 (Seguridad):** Las validaciones de permisos deben ejecutarse en backend además de frontend

**RNF-005 (Usabilidad):** El árbol de permisos debe ser totalmente expandible/colapsable por nivel

**RNF-006 (Usabilidad):** Debe incluir búsqueda en tiempo real con resaltado de coincidencias

**RNF-007 (Usabilidad):** Los cambios pendientes deben ser visibles y reversibles antes de aplicar

**RNF-008 (UX):** Debe mostrar indicadores visuales claros del origen de cada permiso

**RNF-009 (Cache):** El caché de permisos debe invalidarse inmediatamente tras cambios

**RNF-010 (Transaccionalidad):** Todos los cambios deben aplicarse de forma atómica (todo o nada)

**RNF-011 (Accesibilidad):** La interfaz debe cumplir WCAG 2.1 nivel AA

**RNF-012 (Responsividad):** La interfaz de tres paneles debe adaptarse a tablets con layout vertical

**RNF-013 (Granularidad):** Debe soportar al menos 200 permisos diferentes en el catálogo

**RNF-014 (Auditoría):** Debe registrarse antes y después del estado de permisos en formato JSON

#### Referencias
- RF-USR-008: Gestión de Permisos (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-071: Implementar endpoint POST /users/:id/permissions para permisos específicos
- TICKET-072: Implementar endpoint DELETE /users/:id/permissions/:permissionId para revocación
- TICKET-073: Implementar endpoint POST /users/:id/permissions/deny para denegaciones explícitas
- TICKET-074: Crear interfaz de gestión de permisos específicos en frontend
- CU-013: Ver detalle de usuario (contexto de origen)
- CU-014: Asignar roles a usuario (complementario)

---

### CU-016: Ver historial de actividad de usuario

**Módulo:** Gestión de Usuarios / Auditoría  
**Identificador:** CU-016  
**Prioridad:** Alta

#### Descripción
Permite consultar el historial de actividad (auditoría) asociado a un usuario específico. Muestra eventos auditables en los que el usuario actuó (actor) y, cuando aplique, eventos donde fue el objeto afectado, con filtros por fecha, módulo, acción, entidad, IP y resultado. Incluye visualización de datos antes/después, navegación a entidades relacionadas y exportación controlada.

#### Actores
- **Actor Principal:** SuperAdmin, Administrador
- **Actores Secundarios:** Auditor/Consultor con permisos, Sistema de auditoría

#### Precondiciones
1. El actor está autenticado en el sistema
2. El actor tiene permiso "Usuarios.Gestión.VerHistorial" o "Auditoría.Ver"
3. El usuario objetivo existe en el sistema
4. Se respetan políticas de multi-tenant; solo SuperAdmin puede consultar cross-tenant
5. Existe configuración de retención de logs vigente

#### Flujo Principal
1. El actor accede al historial desde una de estas vías:
   - Tab "Historial de Actividad" en el detalle del usuario
   - Módulo Auditoría con filtro pre-cargado `usuario_id=[ID]`
   - Enlace desde notificación relacionada a actividad del usuario
2. El sistema valida permisos del actor y alcance multi-tenant
3. El sistema carga filtros por defecto: rango de fechas últimos 30 días, orden por fecha desc, tipo=Todos
4. El sistema consulta registros en `audit_logs` filtrando por `usuario_id` (actor) y, si aplica, por `entidad_id` relacionada al usuario
5. El sistema presenta una tabla con columnas:
   - Fecha/Hora (con zona horaria del actor)
   - Módulo
   - Acción (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, RESET_PASSWORD, ASSIGN_ROLE, etc.)
   - Entidad (tabla/recurso)
   - ID Entidad
   - Resultado (OK/ERROR)
   - IP Origen
   - Resumen/Descripción
6. El actor puede ajustar filtros avanzados:
   - Rango de fechas (con quick-picks: Hoy, 7 días, 30 días, Personalizado)
   - Módulo(s) y Acción(es)
   - Resultado
   - Texto libre (busca en Resumen/Descripción y metadata)
   - Incluir solo operaciones críticas
7. El actor puede expandir un registro para ver detalles:
   - Datos anteriores y nuevos (JSON) cuando aplique
   - Metadata (user agent, correlationId)
   - Enlaces rápidos: Ver entidad afectada, Ver más del mismo correlationId
8. El actor puede ejecutar acciones:
   - Exportar resultados (CSV/PDF) respetando filtros y límites
   - Copiar enlace con filtros (URL shareable interna)
   - Ver timeline gráfico de actividad (sparklines/heatmap de horas)
9. El sistema pagina resultados (lazy load o server-side) y mantiene estado de filtros
10. El sistema registra en auditoría la consulta de historial (acción: VIEW_USER_HISTORY)
11. El caso de uso finaliza exitosamente

#### Flujos Alternativos
**FA-001: Sin resultados en rango seleccionado**
- En paso 5, si no hay registros:
  - Mostrar mensaje "No se encontraron actividades para los filtros seleccionados"
  - Sugerir ampliar rango de fechas o limpiar filtros
- El flujo continúa permitiendo modificar filtros

**FA-002: Ver solo eventos críticos**
- En paso 6, si se activa filtro "Críticos":
  - Mostrar únicamente acciones marcadas como críticas (cambios de estado, roles, permisos, eliminaciones)
  - Mantener contador de críticos vs totales en el período
- El flujo continúa normalmente

**FA-003: Exportación**
- En paso 8, al exportar:
  - Validar límite de filas exportables (configurable)
  - Generar archivo de manera asíncrona si supera umbral, notificando al completar
  - Incluir pie de página con filtros y rango aplicado
- El flujo continúa tras descarga/cola de exportación

**FA-004: Drill-down a entidad afectada**
- En paso 7, al abrir un registro con entidad relacionada:
  - Ofrecer link "Ver entidad"
  - Navegar a detalle de la entidad en nueva pestaña/vista (según permisos)
- El flujo regresa a la lista con estado preservado

**FA-005: Vista por correlationId**
- En paso 7, si el registro tiene `correlationId`:
  - Mostrar opción "Ver cadena completa"
  - Listar todos los eventos del mismo `correlationId` en orden
- El flujo continúa normalmente

**FA-006: Comparación entre períodos**
- El actor habilita "Comparar períodos":
  - Selecciona dos rangos de fechas
  - El sistema muestra métricas comparativas (conteo por acción/módulo)
- El flujo continúa normalmente

#### Flujos de Excepción
**FE-001: Permisos insuficientes**
- En paso 2, si el actor no posee permisos:
  - Mostrar "No tiene permisos para ver historial de actividad"
  - Registrar intento en auditoría (ACCESS_DENIED)
  - Termina con error

**FE-002: Violación de multi-tenant**
- En paso 2, si intenta acceder a otro tenant sin ser SuperAdmin:
  - Mostrar "No tiene acceso a información de otras cooperativas"
  - Registrar intento como alerta de seguridad
  - Termina con error

**FE-003: Error en consulta**
- En paso 4/5, si falla la consulta:
  - Mostrar "Error al cargar historial. Reintente"
  - Log técnico con detalle
  - Ofrecer botón "Reintentar"

**FE-004: Rango de fechas inválido o excesivo**
- En paso 6, si el rango supera el máximo permitido:
  - Mostrar "El rango seleccionado excede el máximo de X días"
  - Sugerir acotar rango o usar exportación asíncrona

**FE-005: Sesión expirada**
- En cualquier paso:
  - Guardar filtros en sesión
  - Redirigir a login y restaurar contexto al volver

#### Postcondiciones
**Postcondición de Éxito:**
1. El actor visualiza el historial filtrado del usuario
2. Se registra en auditoría la consulta realizada
3. El sistema preserva el estado de filtros y página para navegación posterior

**Postcondición de Fallo:**
1. No se expone información de auditoría
2. Se registra el intento con estado denegado/error
3. El actor permanece en contexto previo con feedback claro

#### Reglas de Negocio
**RN-001:** Solo roles autorizados (SuperAdmin/Administrador/Auditor) pueden ver el historial de otros usuarios

**RN-002:** Cada usuario puede ver su propio historial sin restricción, con datos sensibles enmascarados según política

**RN-003:** La retención de `audit_logs` se rige por configuración (p. ej., 12-84 meses); consultas respetan ese límite

**RN-004:** El rango máximo consultable en una sola petición es configurable (p. ej., 90 días)

**RN-005:** Los datos sensibles en `datos_anteriores`/`datos_nuevos` deben redactionarse (p. ej., hashes, tokens)

**RN-006:** El orden por defecto es descendente por `fecha_hora`

**RN-007:** La exportación está limitada a N filas por solicitud; para más, se usa exportación asíncrona

**RN-008:** El timezone mostrado corresponde al del actor; los registros se almacenan en UTC

**RN-009:** Los enlaces a entidades respetan permisos del actor; si no posee acceso, se ocultan

**RN-010:** La vista debe distinguir eventos donde el usuario es actor vs. objeto afectado

**RN-011:** El `correlationId` agrupa eventos de una misma operación transversal

**RN-012:** Las consultas deben usar índices por `usuario_id`, `fecha_hora`, `modulo`, `accion`

#### Requisitos No Funcionales
**RNF-001 (Performance):** La vista debe responder en < 1 s para 1,000 registros en el período consultado

**RNF-002 (Escalabilidad):** Debe soportar historiales de >1M de eventos por usuario con paginación eficiente

**RNF-003 (Seguridad):** Aplicar control de acceso en backend; redacción de campos sensibles previa a render

**RNF-004 (Usabilidad):** Filtros persistentes por sesión y recordatorios de último rango usado

**RNF-005 (Exportación):** Exportes generados en < 10 s para hasta 10,000 filas; para más, job asíncrono

**RNF-006 (Accesibilidad):** Navegable por teclado; descripciones para iconografía; contraste AA

**RNF-007 (Observabilidad):** Trazabilidad de consultas (self-audit) incluyendo filtros aplicados y volumen retornado

**RNF-008 (Consistencia):** Visualización de diffs JSON formateada, con colapsado de campos largos

**RNF-009 (Disponibilidad):** La vista no debe bloquear si falla auditoría; carga degradada con mensaje parcial

#### Referencias
- RF-USR-002: Editar Usuario (PRD)
- RF-USR-003: Desactivar/Activar Usuario (PRD)
- Sección 7.3 Auditoría (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-075: Endpoint GET /audit/logs?userId=&desde=&hasta=&modulo=&accion=&resultado
- TICKET-076: Vista de historial en detalle de usuario (tab)
- CU-013: Ver detalle de usuario (origen)
- CU-014: Asignar roles a usuario (acciones críticas visibles en historial)
- CU-015: Gestionar permisos específicos (acciones visibles en historial)

---

### CU-017: Exportar usuarios

**Módulo:** Gestión de Usuarios / Búsqueda y Reportes  
**Identificador:** CU-017  
**Prioridad:** Alta

#### Descripción
Permite exportar a archivos (Excel/CSV y opcionalmente PDF) la información de usuarios resultante de una búsqueda/filtrado, respetando permisos, columnas permitidas, límites de tamaño y alcance multi-tenant. Soporta exportación sincrónica para volúmenes pequeños y exportación asíncrona (en cola) para volúmenes grandes, con notificación al completar.

#### Actores
- **Actor Principal:** Administrador, SuperAdmin
- **Actores Secundarios:** Operador con permiso de exportación, Sistema de auditoría, Servicio de jobs asíncronos

#### Precondiciones
1. El actor está autenticado en el sistema
2. El actor posee permiso "Usuarios.Búsqueda.Exportar"
3. Existe al menos un conjunto de resultados filtrados o selección manual de filas
4. Se respetan políticas multi-tenant (solo SuperAdmin puede exportar cross-tenant)
5. Están configurados los límites de exportación (filas, tamaño, formatos)

#### Flujo Principal
1. El actor abre la vista de usuarios y aplica filtros o selecciona filas específicas
2. El actor hace clic en "Exportar"
3. El sistema muestra un diálogo con opciones:
   - Formato: Excel (XLSX) o CSV (y PDF opcional para listados pequeños)
   - Alcance: "Todos los resultados filtrados" o "Solo seleccionados"
   - Columnas: preselección por defecto + opción de personalizar columnas permitidas
   - Orden: respetar orden actual o definir columna/criterio
   - Opciones: incluir encabezados, formato de fechas, codificación CSV (UTF-8), separador
4. El sistema calcula una estimación de filas a exportar y valida contra límites configurados (por ejemplo, sincrónico ≤ 5,000 filas)
5. Si la estimación no supera el umbral sincrónico:
   - El sistema genera el archivo de forma sincrónica (streaming del lado servidor)
   - El navegador inicia la descarga del archivo
6. Si la estimación supera el umbral sincrónico:
   - El sistema propone exportación asíncrona (job en cola)
   - El actor confirma; el sistema crea un job con parámetros (filtros, columnas, formato)
   - Se muestra un indicador de "Exportación en proceso" y se registra para seguimiento
   - Al finalizar, el sistema notifica (campana y opcional email) con enlace de descarga
7. El sistema registra en auditoría el intento/ejecución de exportación, incluyendo filtros y columnas seleccionadas (con redacción de datos sensibles)
8. El caso de uso finaliza exitosamente (descarga iniciada) o con job en progreso

#### Flujos Alternativos
**FA-001: Sin resultados**
- En paso 4, si no hay filas a exportar:
  - Mostrar mensaje "No hay resultados para exportar con los filtros actuales"
  - Ofrecer "Volver a filtros" o "Limpiar filtros"

**FA-002: Exportar solo filas seleccionadas**
- En paso 3, si el actor elige "Solo seleccionados":
  - El sistema valida que existan filas seleccionadas
  - Continúa con flujo según tamaño (sincrónico/asíncrono)

**FA-003: Personalizar columnas y guardar preset**
- En paso 3, al personalizar columnas:
  - El actor guarda un preset (nombre + columnas)
  - El preset queda disponible para futuros exportes del mismo actor

**FA-004: Exportación asíncrona masiva**
- En paso 6, para grandes volúmenes:
  - El sistema divide en chunks (por ejemplo, 50k filas por archivo) y comprime ZIP
  - Genera múltiples archivos numerados dentro del ZIP
  - Notifica y mantiene enlace temporal (URL firmada con expiración)

**FA-005: Inclusión de eliminados (soft delete)**
- Si el actor activó "Mostrar eliminados":
  - El export respeta el estado y añade columna `fecha_eliminacion` si está visible

**FA-006: Filtro por cooperativa (SuperAdmin)**
- SuperAdmin puede seleccionar una o varias cooperativas antes de exportar
- El archivo incluye columna `cooperativa` para contexto

**FA-007: Reintentar exportación fallida**
- Si un job falla, el actor puede "Reintentar" desde el historial de exportes
- El sistema reencola con los mismos parámetros y marca reintento en auditoría

#### Flujos de Excepción
**FE-001: Permisos insuficientes**
- En paso 2/3, si el actor no posee permiso de exportación:
  - Mostrar "No tiene permisos para exportar usuarios"
  - Registrar intento en auditoría (ACCESS_DENIED)
  - Terminar con error

**FE-002: Límite de exportación excedido**
- En paso 4, si la estimación supera el máximo permitido:
  - Mostrar "La exportación excede el límite permitido. Acote los filtros o use exportación asíncrona"
  - Ofrecer conmutar a asíncrona (si aplica) o ajustar filtros

**FE-003: Error generando archivo**
- En paso 5/6, si ocurre un error al generar el archivo:
  - Mostrar "Error al generar el archivo de exportación. Intente nuevamente"
  - Registrar error técnico en logs y auditoría
  - Ofrecer reintento

**FE-004: Sesión expirada durante exportación**
- En cualquier paso:
  - Guardar parámetros seleccionados
  - Redirigir a login y restaurar el intento

**FE-005: Formato no soportado**
- Si el formato solicitado no está habilitado:
  - Mostrar "Formato de exportación no disponible"
  - Sugerir formatos habilitados

**FE-006: Datos sensibles bloqueados**
- Si el actor incluye columnas marcadas como sensibles y no tiene permiso "Usuarios.Búsqueda.ExportarDatosPersonales":
  - Bloquear dichas columnas
  - Mostrar advertencia y permitir continuar sin ellas

#### Postcondiciones
**Postcondición de Éxito:**
1. Se genera el archivo y se inicia la descarga, o queda un job en cola con notificación
2. Se registra en auditoría el evento de exportación con filtros y columnas
3. Se preservan los parámetros para futuras exportaciones del actor

**Postcondición de Fallo:**
1. No se genera archivo
2. Se registra el intento fallido en auditoría
3. El actor recibe feedback claro y opciones para corregir

#### Reglas de Negocio
**RN-001:** La exportación respeta alcance multi-tenant; solo SuperAdmin puede exportar múltiples cooperativas

**RN-002:** Se debe definir un umbral de exportación sincrónica y máxima (por ejemplo, 5k/100k filas)

**RN-003:** Las columnas exportables están gobernadas por un catálogo y permisos; datos sensibles requieren permiso específico

**RN-004:** Las exportaciones asíncronas generan enlaces firmados con expiración (por ejemplo, 7 días)

**RN-005:** Solo se permite una exportación masiva concurrente por usuario; posteriores quedan en cola o se rechazan según política

**RN-006:** Los archivos deben incluir metadatos: fecha de generación, filtros aplicados y usuario que exportó (en hoja/cabecera)

**RN-007:** La exportación debe respetar el orden determinado por el actor o por defecto (username asc)

**RN-008:** Los formatos habilitados por fase son CSV y XLSX; PDF se limita a listados ≤ 1,000 filas

**RN-009:** El tamaño máximo de archivo comprimido por exporte es configurable (por ejemplo, 200 MB)

**RN-010:** Toda exportación se audita con detalle de parámetros (redactados cuando aplique)

#### Requisitos No Funcionales
**RNF-001 (Performance):** Exportación sincrónica debe iniciar descarga en < 3 s para hasta 5,000 filas

**RNF-002 (Escalabilidad):** Exportación asíncrona debe manejar > 100,000 filas mediante chunking/streaming

**RNF-003 (Seguridad):** Enlaces de descarga deben ser firmados, con expiración y no cacheables en CDN público

**RNF-004 (Observabilidad):** Registrar métricas de duración, filas exportadas y fallos; trazabilidad por `correlationId`

**RNF-005 (Concurrencia):** Limitar trabajos concurrentes por usuario y globalmente para proteger recursos

**RNF-006 (Fiabilidad):** Reintentos automáticos con backoff para jobs asíncronos fallidos

**RNF-007 (Usabilidad):** Progreso visible de exportes asíncronos y acceso a historial de exportaciones

**RNF-008 (Accesibilidad):** Diálogo de exportación accesible (WCAG AA), navegable por teclado

**RNF-009 (Compatibilidad):** Archivos CSV generados en UTF-8 con BOM opcional para compatibilidad con Excel

#### Referencias
- RF-USR-005: Buscar Usuarios (PRD)
- RF-USR-006: Filtros Avanzados (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-077: Endpoint GET /users/export (sincrónico con límites)
- TICKET-078: Job asíncrono de exportación y almacenamiento temporal
- TICKET-079: UI de exportación con presets y seguimiento
- CU-012: Buscar y filtrar usuarios (origen)

---

### CU-018: Gestión de perfil del usuario

**Módulo:** Gestión de Usuarios / Perfil  
**Identificador:** CU-018  
**Prioridad:** Media-Alta

#### Descripción
Permite al propio usuario gestionar su perfil: actualizar datos de contacto permitidos (teléfono, email), cargar/actualizar fotografía, cambiar contraseña, configurar seguridad opcional (2FA) y preferencias personales (idioma, tema, notificaciones). Respeta campos inmutables (usuario, identificación) y registra auditoría de cambios relevantes.

#### Actores
- **Actor Principal:** Usuario autenticado (cualquier rol)
- **Actores Secundarios:** Sistema de autenticación, Sistema de auditoría

#### Precondiciones
1. El actor está autenticado en el sistema
2. El actor posee permiso "MiPerfil.Ver" y "MiPerfil.Editar" para cambios permitidos
3. El usuario existe y está activo o bloqueado parcialmente (solo lectura si bloqueado)
4. Campos inmutables definidos por política (username, identificación) están protegidos
5. Configuración de 2FA disponible si la cooperativa lo habilitó

#### Flujo Principal
1. El actor abre "Mi Perfil" desde el menú de usuario
2. El sistema muestra tabs/secciones:
  - **Resumen:** nombre completo, username, rol(es), estado, cooperativa, sucursal
  - **Contacto:** email, teléfono(s); email/phone editables según política
  - **Seguridad:** cambio de contraseña, habilitar/deshabilitar 2FA (si disponible), cierre de sesiones activas
  - **Preferencias:** idioma, tema (claro/oscuro), formato de fecha/hora, zona horaria, notificaciones (email/in-app)
  - **Fotografía:** ver/cargar/actualizar foto de perfil
3. El actor edita campos permitidos y guarda cambios
4. El sistema valida:
  - Formatos de email/teléfono
  - Unicidad de email (no duplicado en otros usuarios)
  - Tamaño/formato de imagen (JPG/PNG, ≤ 500KB, resolución recomendada 400x400)
  - Política de contraseña (longitud y complejidad) si se cambia
5. Para cambios sensibles (email/phone), el sistema inicia verificación:
  - Envía código OTP al nuevo email o SMS al nuevo teléfono
  - Solicita ingreso del código y valida
6. Para cambio de contraseña:
  - Solicita contraseña actual
  - Valida política y coincidencia de confirmación
  - Al guardar, invalida tokens de sesión (opción configurable) y registra auditoría
7. Para habilitar 2FA (si disponible):
  - Muestra QR/clave secreta
  - Solicita código TOTP de verificación
  - Activa 2FA al validar correctamente
8. El sistema guarda cambios válidos, actualiza vista y muestra mensaje de éxito
9. El sistema registra en auditoría los cambios relevantes (contacto, seguridad, preferencias, foto)
10. El caso de uso finaliza exitosamente

#### Flujos Alternativos
**FA-001: Cambio de email con verificación diferida**
- El actor guarda nuevo email; el sistema marca estado "pendiente de verificación"
- Se envía enlace/OTP al nuevo email
- Al confirmar, se actualiza email y se registra auditoría

**FA-002: Cambio de teléfono con OTP SMS**
- Solicita OTP enviado al nuevo número
- Tras validarlo, actualiza teléfono y auditoría

**FA-003: Habilitar/Deshabilitar 2FA**
- Habilitar: QR + TOTP, requiere validación; guarda códigos de recuperación (si aplica)
- Deshabilitar: solicita contraseña y un código TOTP actual

**FA-004: Cargar/actualizar foto de perfil**
- El actor sube imagen; el sistema valida peso/formatos
- Redimensiona/optimiza (400x400, JPG/PNG)
- Actualiza URL y muestra preview

**FA-005: Preferencias inmediatas**
- Cambios de idioma/tema se aplican en vivo (sin recargar)
- Persisten en perfil para futuras sesiones

**FA-006: Ver y cerrar sesiones activas**
- El actor ve lista de sesiones propias y puede cerrarlas
- Al cerrar, invalida tokens relacionados

#### Flujos de Excepción
**FE-001: Permisos insuficientes**
- Si el actor no tiene permiso de edición de perfil: muestra mensaje y solo lectura

**FE-002: Contraseña incorrecta al cambiar contraseña**
- Bloquea el cambio y muestra error; registra intento fallido

**FE-003: OTP inválido o expirado**
- Permite reenvío limitado; si excede, bloquea temporalmente el cambio

**FE-004: Imagen inválida (formato/tamaño)**
- Rechaza la carga y muestra requisitos

**FE-005: Email duplicado**
- Informa duplicidad y solicita otro email o cancelación del cambio

**FE-006: Sesión expirada**
- Guarda borrador de cambios en sesión; redirige a login y restaura tras autenticación

#### Postcondiciones
**Postcondición de Éxito:**
1. El perfil del usuario refleja los cambios permitidos
2. Las verificaciones (email/phone) completadas actualizan los datos de contacto
3. Se registra auditoría de cambios sensibles
4. Opcional: sesiones previas invalidadas tras cambio de contraseña/2FA

**Postcondición de Fallo:**
1. No se aplican cambios parciales (se mantiene estado previo)
2. Se registra el intento fallido en auditoría (cuando aplica)
3. El actor recibe feedback para corregir

#### Reglas de Negocio
**RN-001:** `username` e identificación son inmutables en el perfil

**RN-002:** Email debe ser único por usuario; cambios requieren verificación

**RN-003:** Teléfono celular debe cumplir formato local y, si se usa para 2FA/SMS, requiere verificación

**RN-004:** Contraseña cumple política de complejidad; cambios requieren contraseña actual

**RN-005:** Al cambiar contraseña, se pueden invalidar todas las sesiones activas del usuario

**RN-006:** Datos de contacto sensibles no se exportan ni se muestran sin permisos adecuados

**RN-007:** 2FA solo puede habilitarse si la cooperativa lo tiene activo; secret se almacena de forma segura (hashed/encrypted)

**RN-008:** La foto de perfil debe respetar tamaño máximo (≤500KB) y formatos permitidos; se almacena en servicio seguro

**RN-009:** Preferencias de idioma/tema se almacenan por usuario y no afectan a otros

**RN-010:** Auditoría debe registrar antes/después en cambios de contacto, seguridad y foto

**RN-011:** El perfil solo puede gestionarse dentro de la misma cooperativa; SuperAdmin puede verse a sí mismo pero no editar otros perfiles desde este CU

**RN-012:** Límite de reintentos de OTP para contacto/2FA para prevenir abuso

#### Requisitos No Funcionales
**RNF-001 (Performance):** Carga de "Mi Perfil" en < 1 s; cambio de tema/idioma inmediato

**RNF-002 (Seguridad):** Datos sensibles (secret 2FA, hashes, tokens) nunca se muestran; cifrado en tránsito y en reposo

**RNF-003 (Usabilidad):** Formularios con validación en tiempo real y mensajes claros

**RNF-004 (Accesibilidad):** Cumplir WCAG 2.1 AA; navegación por teclado en tabs y formularios

**RNF-005 (Disponibilidad):** La vista debe funcionar aunque servicios de verificación estén temporalmente degradados (mostrar estado y permitir reintento)

**RNF-006 (Integridad):** Cambios aplican de forma atómica por sección; no mezclar estados parciales

**RNF-007 (Compatibilidad):** Carga de imágenes soportada en navegadores principales; fallback para captura en dispositivos móviles

**RNF-008 (Auditoría):** Toda acción de cambio relevante genera evento con IP, user agent y timestamp

#### Referencias
- RF-USR-001: Crear Usuario (PRD) — campos base
- RF-USR-002: Editar Usuario (PRD) — restricciones de edición
- RF-AUTH-004: Gestión de Sesiones (PRD) — cierre de sesiones
- Sección 7.3 Auditoría (PRD)
- US-002: Gestión Completa de Usuarios
- TICKET-080: Vista "Mi Perfil" (frontend)
- TICKET-081: Endpoints PATCH /me para contacto/preferencias
- TICKET-082: Endpoint POST /me/change-password
- TICKET-083: Habilitar/Deshabilitar 2FA para usuario
- CU-013: Ver detalle de usuario (referencia cruzada)
- CU-011: Restablecer contraseña de usuario (relacionado)

---

_Documento en desarrollo. Los módulos restantes se completarán progresivamente._
