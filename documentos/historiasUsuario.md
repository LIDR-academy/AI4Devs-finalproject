# Historias de usuario — Frapen Angels

Este documento recoge las historias principales del producto, derivadas del alcance funcional descrito en los documentos de arquitectura, modelo de datos y API del proyecto. Se han redactado siguiendo buenas prácticas de producto: enfoque en el usuario, valor de negocio, claridad y criterios de aceptación verificables.

Cada historia está consolidada en torno a un rol y un flujo principal, evitando redundancias y priorizando la claridad operativa.

---

## Historia de usuario 1: Gestión de perfil y autenticación del socio

### ID
HU-01

### Como
socio del club Frapen Angels

### Quiero
registrarme en la plataforma, acceder con mis credenciales, crear y mantener mi perfil actualizado

### Para
participar en rutas, consultar información del club y gestionar mi información personal de forma autónoma y segura.

### Valor de negocio
Permite captar nuevos socios, asegurar datos actualizados en la base de datos del club, mejorar la calidad de comunicaciones y pagos, y habilitar la participación digital desde el primer contacto.

### Criterios de aceptación

**Registro inicial:**
- El usuario puede registrarse con nombre, apellidos, correo electrónico, contraseña y datos básicos de contacto (teléfono, dirección, ciudad, código postal).
- El sistema valida que el correo sea único y que los datos obligatorios estén completos.
- Las contraseñas se almacenan de forma segura mediante hash (bcrypt).
- Tras el registro, el socio queda con estado `ACTIVE` o `INACTIVE` según la política del negocio.
- El socio recibe una confirmación de registro (por correo o interfaz) con su número de socio asignado.

**Acceso y autenticación:**
- El socio puede iniciar sesión con correo y contraseña y recibir un token JWT válido.
- Si las credenciales son incorrectas, el sistema devuelve un error claro sin exponer información sensible.
- La autenticación y autorización se validan en la capa de aplicación según el rol del usuario.
- El sistema permite cerrar sesión y limpiar el token.

**Actualización de perfil:**
- El socio puede acceder a una vista de edición de su perfil desde un área protegida.
- Puede actualizar: nombre, apellidos, teléfono, dirección, ciudad, código postal.
- No puede cambiar: correo de acceso original, número de socio, fecha de nacimiento (si se registraron).
- El socio puede cambiar su contraseña mediante validación de contraseña actual.
- El sistema valida el formato de datos (teléfono, código postal, etc.).
- Todos los cambios se guardan con timestamp para trazabilidad.
- El sistema muestra confirmación clara de cambios guardados.

### Notas de producto
El flujo de registro debe ser simple, rápido y confiable. Un perfil bien mantenido es fundamental para la calidad operativa del club en comunicaciones y cobros. La capacidad de auto-mantener datos reduce fricción y errores.

---

## Historia de usuario 2: Experiencia de rutas para el socio

### ID
HU-02

### Como
socio del club

### Quiero
consultar rutas publicadas, ver galerías de fotos, acceder al calendario, inscribirme en rutas, proponer nuevas rutas y revisar mi historial de participación

### Para
planificar mi participación, conocer actividades disponibles con detalle visual, contribuir al club con propuestas y recordar mi participación histórica.

### Valor de negocio
Aumenta participación, facilita la toma de decisiones del socio, enriquece el catálogo de forma colaborativa, fortalece la fidelización mediante historial visible, y reduce fricción en la experiencia de usuario.

### Criterios de aceptación

**Consulta y visualización de rutas:**
- El socio ve una lista de rutas publicadas con: título, fecha, dificultad, precio, punto de encuentro, estado.
- Al abrir una ruta, accede a detalles: descripción, distancia, servicios (alojamiento, restaurante), duración, fotos.
- El socio puede ver la galería de imágenes asociadas a cada ruta (fotos de viajes anteriores, puntos de interés).
- El socio accede a un calendario de actividades que muestra rutas programadas y eventos del club por fecha.
- Puede filtrar rutas por dificultad, fecha, precio o servicios incluidos.

**Inscripción y reserva:**
- El socio puede inscribirse en una ruta publicada indicando número de acompañantes si es permitido.
- El sistema evita duplicidades de inscripción para el mismo socio en la misma ruta.
- Si la ruta requiere pago, el sistema genera un registro de pago con desglose de costos.
- El socio recibe confirmación clara de inscripción con detalles del importe total y estado del pago.
- La inscripción se registra en `route_registrations` consistente con el flujo de pagos.

**Propuesta de nuevas rutas:**
- El socio accede a un formulario para proponer nuevas rutas desde su área personal.
- Propone: título, descripción, dificultad, distancia, fecha, punto de encuentro, servicios, precios estimados.
- Puede adjuntar fotos que haya tomado previamente.
- El sistema valida datos obligatorios antes de enviar.
- Una propuesta queda en estado `PENDING_REVIEW` no visible para otros socios.
- El socio recibe confirmación y puede hacer seguimiento del estado de sus propuestas.
- Si es rechazada, recibe notificación con el motivo para mejorar propuestas futuras.

**Historial y seguimiento:**
- El socio accede a "Mis Rutas" con dos secciones: "Próximas Rutas" (inscritas) y "Rutas Realizadas" (históricas).
- Cada entrada muestra: título, fecha, dificultad, estado de inscripción, estado del pago si aplica.
- Al hacer clic, ve detalles completos: descripción, fotos, servicios, costo final.
- Puede filtrar historial por fecha o rango.
- El sistema muestra contadores: rutas totales realizadas, km recorridos, dificultad promedio.
- Para rutas pagadas, ve desglose de costos y estado del pago (PENDING, PAID, REFUNDED).

### Notas de producto
Esta es la historia central del valor del producto. Una experiencia clara y visual en la consulta de rutas, combinada con propuestas colaborativas y un historial motivador, crea un ciclo de participación recurrente y fidelización del socio.

---

## Historia de usuario 3: Gestión administrativa de rutas, contenido y comunicaciones

### ID
HU-03

### Como
administrador del sistema

### Quiero
crear y gestionar rutas, cargar contenido multimedia, programar eventos, moderar propuestas de socios y enviar comunicaciones

### Para
mantener una oferta de rutas atractiva, enriquecer la experiencia visual, organizar la actividad del club, asegurar calidad de propuestas y comunicar cambios y novedades a los socios.

### Valor de negocio
Permite operación eficiente del club, garantiza calidad de contenido, reduce fricción administrativa, fomenta participación mediante comunicación efectiva, y centraliza el control de la experiencia del socio.

### Criterios de aceptación

**Creación y gestión de rutas:**
- El administrador puede crear rutas con: título, descripción, dificultad, fechas, punto de encuentro, distancia, servicios (alojamiento, restaurante), precios.
- Puede editar y actualizar rutas ya creadas.
- Puede cambiar estado: DRAFT, PUBLISHED, COMPLETED, CANCELLED.
- Solo administradores con permisos pueden realizar estas acciones (verificado en backend).

**Gestión de contenido multimedia y galería:**
- El administrador adjunta imágenes y vídeos a una ruta para enriquecer la galería.
- Puede marcar una imagen como portada de la ruta.
- La galería es visible para socios en la consulta de rutas.

**Gestión del calendario:**
- El administrador crea eventos de calendario vinculados a rutas o como actividades independientes.
- Define: fecha, hora, ubicación, descripción, capacidad máxima.
- Los eventos se muestran en la vista de calendario pública para socios.

**Moderación de propuestas de socios:**
- El administrador accede a una lista de propuestas en estado `PENDING_REVIEW`.
- Ve datos básicos: propuesta, autor, fecha de creación.
- Puede aprobar la propuesta → cambia a `PUBLISHED` y es visible para otros socios.
- Puede rechazar con motivo → el socio recibe notificación explicativa.
- Puede devolver para revisión → el socio puede mejorar y reenviar.
- La decisión queda registrada con identificador del administrador y timestamp.

**Comunicaciones y avisos:**
- El administrador crea avisos (notificaciones) con: título, descripción, tipo (ROUTE, GENERAL, REMINDER).
- Puede programar cuándo enviar o enviar inmediatamente.
- Los avisos se entregan a socios con registro de entrega y lectura.
- El administrador ve estadísticas de entrega y apertura.

**Trazabilidad y auditoría:**
- Todas las operaciones se registran con: identificador del administrador, tipo de acción, entidad modificada, timestamp.
- El sistema permite auditoría y seguimiento de cambios en rutas, propuestas y comunicaciones.

### Notas de producto
Esta historia es el corazón operativo del club. Un administrador capacitado con herramientas claras puede enriquecer la experiencia del socio, mantener estándares de calidad, moderar colaborativamente y comunicar eficientemente. El flujo respeta la arquitectura modular: todo se gestiona desde la capa de aplicación/services del backend mediante endpoints REST.

---

## Orden de ejecución recomendado

Basado en dependencias técnicas y valor de negocio:

1. **HU-01**: Gestión de perfil y autenticación → Foundation. Sin esto, nada funciona.
2. **HU-03**: Gestión administrativa → Los admins crean el contenido inicial.
3. **HU-02**: Experiencia de rutas para el socio → El socio interactúa con rutas ya creadas.

Este orden permite:
- Fase 1: Autenticación funcional.
- Fase 2: Administrador crea rutas, contenido, calendario.
- Fase 3: Socio consulta, se inscribe, propone, ve historial.

---

## Notas finales

Estas tres historias consolidadas cubren:
- ✅ Inscripción y gestión de perfiles de socios
- ✅ Consulta del calendario de actividades
- ✅ Visualización de la galería de rutas
- ✅ Propuesta, revisión y publicación de rutas
- ✅ Consulta y seguimiento de rutas realizadas
- ✅ Pasarela de pago asociada a rutas
- ✅ Panel administrativo para gestionar rutas, avisos y comunicaciones

Todos los requisitos del punto 1.2 del README y la arquitectura.md están cubiertos de forma consolidada, evitando redundancias y manteniendo claridad operativa.
