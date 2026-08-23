# HU-008 — Registro y Autenticación

## Historia
Como persona que llega por primera vez a la plataforma (futuro propietario, agente o inquilino),
quiero registrarme elegiendo mi rol e iniciar sesión con email y contraseña,
para poder acceder a las funcionalidades que me corresponden sin depender de un JWT emitido manualmente como herramienta de desarrollo.

## Criterios de aceptación
- [x] La pantalla de entrada muestra explícitamente y de forma simétrica las 3 opciones de registro desde el inicio: "Quiero publicar mi inmueble" (propietario), "Gestiono inmuebles de otros" (agente), "Busco dónde vivir" (inquilino).
- [x] Una persona puede registrarse como propietario indicando los datos básicos de cuenta (email, contraseña, nombre) y queda con acceso inmediato tras el registro.
- [x] Una persona puede registrarse como inquilino indicando los datos básicos de cuenta y queda con acceso inmediato tras el registro.
- [x] Una persona puede registrarse como agente indicando los datos básicos de cuenta, y el registro no se considera completo hasta resolver el paso obligatorio de agencia (ver criterio siguiente).
- [x] Dentro del flujo de registro de agente, la persona debe elegir entre: (a) crear una agencia nueva indicando razón social y NIT, quedando como su primer miembro, o (b) buscar y solicitar unirse a una agencia existente, quedando su ingreso en estado `pendiente` hasta aprobación de un miembro actual (reutiliza el modelo de HU-007).
- [x] Existe un nuevo endpoint público de búsqueda de agencias por razón social o NIT, usado por el flujo de registro de agente para poder elegir a cuál unirse.
- [x] El rol elegido en el registro (`propietario` | `agente` | `inquilino`) queda fijo en la cuenta; no hay ningún flujo para cambiarlo después ni para que una cuenta tenga más de un rol.
- [x] Una persona ya registrada puede iniciar sesión con email + contraseña y recibe un JWT (access token) válido para autenticarse en el resto de la plataforma.
- [x] El registro no exige verificación de email: el acceso es inmediato tras crear la cuenta.
- [x] El JWT emitido no tiene mecanismo de refresh token asociado; al expirar, el usuario debe volver a iniciar sesión.
- [x] La búsqueda pública de inmuebles disponibles (HU-003) sigue funcionando sin sesión activa — esta HU no introduce ningún requisito de autenticación sobre ese flujo. (HU-003 todavía no está implementada — no existe el endpoint de búsqueda pública de inmuebles. Se marca cumplido porque lo que este criterio pide es que HU-008 no le agregue ningún requisito nuevo de auth a ese flujo, y en efecto no lo hace: `usuarios`/`agencias` no tocan `inmuebles`, y el endpoint de búsqueda pública que exista en el futuro no requerirá JWT. Verificado en el E2E como "no aplica, endpoint no existe aún" — ver `openspec/changes/hu-008/specs/reports/`.)
- [x] Un intento de login con credenciales inválidas (email inexistente o contraseña incorrecta) es rechazado con un mensaje de error, sin revelar cuál de los dos datos fue el incorrecto.

## Notas técnicas

### Dependencia funcional con HU-001, HU-002 y HU-007
HU-001 (publicación de inmueble por propietario), HU-002 (publicación de inmueble por agente) y HU-007 (gestión de agencias) están implementadas asumiendo un usuario ya autenticado vía JWT — hoy ese JWT se emite manualmente como herramienta de desarrollo, no a través de un flujo de registro/login real. Esta HU-008 introduce el mecanismo real que reemplaza esa herramienta manual: **HU-001, HU-002 y HU-007 dependen funcionalmente de HU-008** para ser utilizables por una persona real fuera de un entorno de desarrollo. No se espera que HU-008 modifique la lógica de dominio de esas tres HUs — el contrato del JWT (claims de `sub`/rol/etc.) debe mantenerse compatible con lo que `shared/infrastructure/auth/dependencies.py` ya valida hoy.

### Reutilización del modelo de agencias (HU-007)
El paso obligatorio de crear/unirse a agencia dentro del registro de agente reutiliza las operaciones de dominio y el modelo de estados (`pendiente`/`activa`/`revocada` para la relación, aprobación de un miembro existente para el ingreso) ya construidos en HU-007 — no introduce una máquina de estados nueva. El endpoint de búsqueda pública de agencias por razón social o NIT es nuevo (no existía antes de esta HU) y es de solo lectura, sin autenticación.

### Fuera de alcance explícito
- **Verificación de email**: no hay envío de correo de confirmación; el acceso es inmediato tras el registro.
- **Recuperación de contraseña ("forgot password")**: fuera de alcance porque depende de un proveedor de email que todavía no existe en el proyecto.
- **Refresh tokens**: la sesión es solo access token (JWT); cuando expira, el usuario vuelve a loguearse. El mecanismo de refresh token mencionado como decisión general en `architecture.md` queda para una iteración futura.
- **Cambio de rol posterior**: una cuenta no puede cambiar su rol después de registrada.
- **Multi-rol**: una cuenta no puede tener más de un rol (`propietario` | `agente` | `inquilino`) simultáneamente — el modelo de datos ya fija esto con `usuario.rol NOT NULL`.

## Prioridad
Alta — es un hueco fundacional: sin esta HU, ninguna de las funcionalidades ya construidas (HU-001, HU-002, HU-007) es usable por una persona real, ya que hoy el "login" es literalmente pegar un JWT emitido a mano como herramienta de desarrollo. Bloquea el uso real de la plataforma más allá de un entorno de desarrollo.

## Estimación
13 — Gigante (26h)

Justificación (calibrado contra HU-001 = 13, HU-002 = 05, HU-007 = 08): esta HU tiene una superficie comparable a HU-001 en cantidad de flujos distintos a construir — pantalla de entrada simétrica de 3 roles, tres variantes de registro (propietario, inquilino, agente), el subflujo obligatorio de crear/unirse a agencia embebido dentro del registro de agente, un endpoint nuevo de búsqueda pública de agencias, login con email+contraseña, y la emisión real de JWT (hashing de contraseña, validación de credenciales) reemplazando la herramienta manual de desarrollo. Aunque reutiliza el modelo de estados de agencia ya construido en HU-007 (lo que evita relevantar esa complejidad desde cero), la cantidad de superficie nueva — tanto de frontend (pantalla de entrada + 3 formularios de registro) como de backend (auth real, nuevo endpoint público, wiring con agencias) — la ubica un escalón por encima de HU-007 y en línea con HU-001.
