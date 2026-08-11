# Historias de usuario — Frapen Angels

Este documento recoge tres historias principales del producto, derivadas del alcance funcional descrito en los documentos de arquitectura, modelo de datos y API del proyecto. Se han redactado siguiendo buenas prácticas de producto: enfoque en el usuario, valor de negocio, claridad y criterios de aceptación verificables.

---

## Historia de usuario 1: Registro y acceso del socio

### ID
HU-01

### Como
socio del club Frapen Angels

### Quiero
registrarme en la plataforma, crear mi perfil y acceder con mis credenciales

### Para
poder participar en rutas, consultar información relevante del club y gestionar mi perfil de forma autónoma.

### Valor de negocio
Permite captar nuevos socios y habilitar su participación en la experiencia digital del club desde el primer contacto.

### Criterios de aceptación
- El usuario puede registrarse con nombre, apellidos, correo electrónico, contraseña y datos básicos de contacto.
- El sistema valida que el correo electrónico sea único y que los datos obligatorios estén completos.
- Tras el registro, el socio queda con un estado inicial activo o pendiente de activación según la regla de negocio definida.
- El socio puede iniciar sesión con su correo y contraseña y recibir un token de sesión válido.
- Si las credenciales son incorrectas, el sistema devuelve un error de autenticación claro y sin exponer información sensible.

### Notas de producto
El flujo de registro debe ser simple y rápido, con un proceso que reduzca fricción y genere confianza desde el inicio.

---

## Historia de usuario 2: Consulta y reserva de rutas

### ID
HU-02

### Como
socio del club

### Quiero
consultar las rutas publicadas y poder inscribirme en aquellas que me interesen

### Para
planificar mi participación en actividades del club y reservar mi plaza de forma sencilla.

### Valor de negocio
Aumenta la participación de los socios y facilita la organización de actividades con una experiencia más fluida.

### Criterios de aceptación
- El socio puede ver una lista de rutas publicadas con información básica: título, fecha, dificultad, precio, punto de encuentro y estado.
- Al abrir una ruta, puede consultar detalles como descripción, distancia, servicios incluidos y si tiene alojamiento o restaurante.
- El socio puede inscribirse en una ruta indicando, si procede, el número de acompañantes.
- El sistema evita duplicidades de inscripción para el mismo socio en la misma ruta.
- Si la ruta requiere pago asociado, el sistema genera un registro de pago y refleja el estado de la operación.
- El socio recibe una confirmación clara de la inscripción y del estado del pago.

### Notas de producto
Esta historia es central para el valor del producto, ya que conecta la experiencia del socio con la gestión operativa del club.

---

## Historia de usuario 3: Gestión de rutas, calendario y avisos por parte del administrador

### ID
HU-03

### Como
administrador del sistema

### Quiero
crear y gestionar rutas, eventos del calendario y avisos para los socios

### Para
mantener informados a los socios, organizar la actividad del club y controlar la operación diaria del servicio.

### Valor de negocio
Permite a la organización operar de manera más eficiente y mantener una comunicación efectiva con los socios.

### Criterios de aceptación
- El administrador puede crear una ruta con sus datos principales: título, descripción, dificultad, fechas, precio y servicios asociados.
- El administrador puede adjuntar imágenes o contenido visual a la ruta para enriquecer la galería.
- El administrador puede programar eventos de calendario vinculados a rutas o actividades del club.
- El administrador puede crear y enviar avisos a los socios con información relevante sobre próximas rutas o cambios.
- Solo los usuarios con permisos de administrador pueden realizar estas acciones.
- Las operaciones realizadas quedan registradas con trazabilidad para auditoría y control.

### Notas de producto
Esta historia garantiza que el producto no solo sirve para la participación del socio, sino también para la gestión operativa y la comunicación del club.
