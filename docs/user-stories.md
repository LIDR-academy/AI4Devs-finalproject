# UserStories.md

## Módulo: Autenticación y Registro

1. US-AUTH-001 – Registro de usuario
   Como Usuario,
   quiero registrarme con mi email, nombre y una contraseña segura (>6 caracteres),
   para poder acceder al sistema y participar en viajes de gastos. [file:1]

   Criterios de Aceptación:
   - Se requiere email único, nombre y contraseña con longitud mínima de 7 caracteres.
   - Si el email ya existe, el sistema muestra un mensaje de error claro.
   - Tras el registro exitoso, el usuario puede iniciar sesión con sus credenciales. [file:1]

2. US-AUTH-002 – Inicio de sesión
   Como Usuario,
   quiero iniciar sesión con mi email y contraseña,
   para acceder a mis viajes activos e históricos. [file:1]

   Criterios de Aceptación:
   - Al iniciar sesión correcto, el sistema emite un token JWT válido.
   - Si las credenciales son incorrectas, muestra mensaje de error sin revelar cuál campo falló.
   - El token se envía en el header Authorization: Bearer <token> en las peticiones posteriores. [file:1]

3. US-AUTH-003 – Mantener sesión autenticada
   Como Usuario,
   quiero que mi sesión autenticada sea válida por un tiempo razonable,
   para no tener que iniciar sesión en cada acción menor que realice. [file:1]

   Criterios de Aceptación:
   - El backend valida el JWT en cada petición protegida.
   - Si el token expira o es inválido, se responde con error de autenticación. [file:1]

---

## Módulo: Perfil de Usuario

4. US-PROFILE-001 – Actualizar mi perfil
   Como Usuario,
   quiero actualizar mis datos de perfil (nombre y contraseña),
   para mantener mi información al día. [file:1]

   Criterios de Aceptación:
   - Solo puedo actualizar mi propio perfil (req.user.id === id de la ruta).
   - No es posible actualizar el perfil de otros usuarios.
   - Los cambios se reflejan inmediatamente en nuevas sesiones. [file:1]

---

## Módulo: Gestión de Viajes

5. US-TRIP-001 – Crear viaje
   Como Creador,
   quiero crear un nuevo viaje indicando nombre y moneda fija COP,
   para comenzar a registrar los gastos de un grupo específico. [file:1]

   Criterios de Aceptación:
   - Solo usuarios autenticados pueden crear viajes.
   - El viaje se guarda con la moneda fija COP sin opción de cambio.
   - El creador queda registrado con rol CREATOR en TripParticipant.
   - Se debe poder añadir participantes por medio de correo electronico .

6. US-TRIP-002 – Listar mis viajes
   Como Usuario Recurrente,
   quiero ver un listado de mis viajes activos e históricos,
   para revisar rápidamente en qué viajes estoy participando. [file:1]

   Criterios de Aceptación:
   - La lista muestra viajes donde el usuario es CREATOR o MEMBER.
   - Se distinguen viajes activos de viajes históricos (cerrados). [file:1]

7. US-TRIP-003 – Invitar participantes por email (Strict User Policy)
   Como Creador,
   quiero invitar a mis amigos por correo al viaje,
   para que se unan al registro de gastos sin necesidad de crearlos manualmente. [file:1]

   Criterios de Aceptación:
   - Solo el CREATOR puede invitar participantes.
   - El sistema valida que el email exista como usuario registrado.
   - Si el email no está registrado, la invitación se bloquea y se muestra un mensaje indicando que el amigo debe registrarse primero. [file:1]

8. US-TRIP-004 – Unirse a viaje por código
   Como Participante,
   quiero unirme a un viaje usando un código alfanumérico,
   para participar sin que el creador tenga que agregarme manualmente por email. [file:1]

   Criterios de Aceptación:
   - Ingresar un código de viaje válido me asocia al viaje como MEMBER.
   - Si el código es inválido o el viaje no acepta más participantes, se muestra error. [file:1]

9. US-TRIP-005 – Editar configuración de viaje
   Como Creador,
   quiero modificar datos del viaje (ej.: nombre),
   para corregir errores o ajustar la información a medida que se organiza el viaje. [file:1]

   Criterios de Aceptación:
   - Solo el CREATOR del viaje puede editar la configuración.
   - Los cambios no afectan el historial de gastos ni los saldos existentes. [file:1]

---

## Módulo: Participantes y Roles

10. US-PART-001 – Ver participantes del viaje
    Como Participante,
    quiero ver la lista de personas que hacen parte del viaje,
    para entender con quién estoy compartiendo gastos. [file:1]

    Criterios de Aceptación:
    - La lista muestra nombres y rol (CREATOR o MEMBER).
    - Todos los participantes del viaje pueden ver esta lista. [file:1]

11. US-PART-002 – Ver mi rol en el viaje
    Como Usuario,
    quiero ver claramente qué rol tengo en cada viaje,
    para saber qué acciones puedo o no puedo realizar. [file:1]

    Criterios de Aceptación:
    - Para cada viaje, el sistema muestra si el usuario es CREATOR o MEMBER.
    - No existe rol de administrador global del sistema. [file:1]

---

## Módulo: Gestión de Gastos

12. US-EXP-001 – Crear gasto
    Como Participante,
    quiero registrar un gasto indicando título, monto, pagador, beneficiarios y categoría,
    para mantener un registro transparente de lo que se ha gastado en el viaje. [file:1]

    Criterios de Aceptación:
    - Cualquier participante (CREATOR o MEMBER) del viaje puede crear gastos.
    - El gasto incluye título, monto en COP, categoría, pagador y lista de beneficiarios.
    - El gasto aparece en el feed de gastos del viaje. [file:1]

13. US-EXP-002 – Adjuntar foto de recibo
    Como Participante,
    quiero adjuntar una foto del recibo al crear un gasto,
    para que exista evidencia visual del monto cobrado. [file:1]

    Criterios de Aceptación:
    - La foto es opcional pero, si se envía, se almacena en un sistema de archivos o servicio cloud.
    - La URL o referencia de la foto se asocia al gasto. [file:1]

14. US-EXP-003 – Feed de gastos del viaje
    Como Participante,
    quiero ver un feed ordenado de los gastos del viaje,
    para entender qué se ha pagado recientemente. [file:1]

    Criterios de Aceptación:
    - El feed se muestra en orden descendente por fecha de creación.
    - Todos los participantes del viaje pueden ver el feed. [file:1]

15. US-EXP-004 – Editar o eliminar gasto (solo Creador)
    Como Creador,
    quiero editar o eliminar cualquier gasto del viaje,
    para corregir errores y mantener las cuentas claras. [file:1]

    Criterios de Aceptación:
    - Solo el CREATOR puede editar o eliminar gastos.
    - Ningún MEMBER puede editar ni siquiera sus propios gastos una vez creados.
    - La eliminación es lógica (soft delete) marcando deleted_at. [file:1]

---

## Módulo: Saldos y Cierre de Viaje

16. US-BAL-001 – Ver saldos por persona
    Como Usuario,
    quiero ver cuánto debo o cuánto me deben en cada viaje,
    para poder hacer las transferencias necesarias y evitar malentendidos. [file:1]

    Criterios de Aceptación:
    - El sistema calcula total gastado por usuario vs cuota justa (fair share).
    - Se muestra una lista de deudas tipo “Juan debe X a Pedro”. [file:1]

17. US-BAL-002 – Ver resumen total personal
    Como Usuario,
    quiero ver un resumen de mi saldo total en el viaje,
    para saber si soy deudor neto o acreedor neto. [file:1]

    Criterios de Aceptación:
    - Se muestra un total “Debes X” o “Te deben Y”.
    - La información se actualiza al registrar nuevos gastos. [file:1]

18. US-BAL-003 – Cerrar / equilibrar gastos del viaje
    Como Creador,
    quiero ejecutar una acción para “equilibrar gastos” del viaje,
    para marcar el viaje como finalizado cuando todos los saldos estén claros. [file:1]

    Criterios de Aceptación:
    - Solo el CREATOR puede marcar el viaje como equilibrado/cerrado.
    - Una vez cerrado, ya no se permiten nuevos gastos.
    - El historial de gastos y saldos sigue visible. [file:1]

---

## Módulo: Notificaciones

19. US-NOTIF-001 – Notificación al ser agregado a un viaje
    Como Usuario,
    quiero recibir un correo cuando se me agregue a un viaje,
    para enterarme inmediatamente y poder empezar a registrar gastos. [file:1]

    Criterios de Aceptación:
    - Cuando el CREATOR agrega un usuario a un viaje, se dispara una notificación por email.
    - El email contiene el nombre del viaje y un enlace para acceder. [file:1]

---

## Módulo: Auditoría y Soft Delete

20. US-AUD-001 – Mantener historial sin borrar definitivamente
    Como Sistema,
    quiero que los datos de gastos y viajes se eliminen de forma lógica,
    para conservar la trazabilidad financiera aún después de eliminaciones. [file:1]

    Criterios de Aceptación:
    - Al “eliminar” un gasto o viaje se marca deleted_at sin borrar físicamente el registro.
    - Los cálculos de saldos ignoran los elementos marcados como eliminados. [file:1]
