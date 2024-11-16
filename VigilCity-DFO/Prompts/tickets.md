## Tickets de trabajo

### Historia de Usuario 1: Autenticación con OAUTH2 con Google

**Historia de usuario:**  
Como **usuario nuevo**, quiero **registrarme e iniciar sesión con mi cuenta de Google** para **acceder rápidamente sin crear una nueva cuenta en la plataforma**.

### Ticket de Trabajo 1.1: Implementación de Autenticación con Google (Backend)

- **ID del Ticket:** TKT-101
- **Título del Ticket:** Configuración de Autenticación OAUTH2 con Google
- **Descripción:** Configurar y habilitar la autenticación OAUTH2 con Google en el backend, permitiendo que los usuarios puedan registrarse e iniciar sesión utilizando su cuenta de Google.
- **Criterios de aceptación:**
  - El sistema permite el registro y login de usuarios mediante Google.
  - Se maneja de forma segura el acceso, sin almacenar contraseñas de usuarios.
  - El perfil del usuario se crea en la base de datos al registrarse con Google.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 8 horas
- **Tareas Técnicas:**
  1. Configurar el SDK de Google OAUTH2 en el backend de Node.js.
  2. Configurar las credenciales de la API de Google y ajustar los permisos de autenticación.
  3. Crear rutas y controladores de autenticación para gestionar el flujo de login y registro.
  4. Almacenar los datos esenciales del usuario en la base de datos (nombre, correo, ID de Google) sin almacenar la contraseña.
  5. Manejar posibles errores y redirigir el usuario a la interfaz con mensajes de error cuando sea necesario.
- **Notas:**
  - Validar que las rutas y el flujo de autenticación estén protegidos y no se dupliquen perfiles.
  - Utilizar JWT para autenticar al usuario y enviar el token al frontend para gestionar la sesión.

---

### Ticket de Trabajo 1.2: Configuración del flujo de autenticación con Google en el frontend (Angular)

- **ID del Ticket:** TKT-102
- **Título del Ticket:** Integración de Autenticación con Google en el Frontend
- **Descripción:** Implementar la funcionalidad en Angular para que los usuarios puedan registrarse e iniciar sesión mediante Google, integrándose con el backend que ya maneja el proceso de autenticación.
- **Criterios de aceptación:**
  - El usuario puede hacer clic en "Iniciar sesión con Google" para iniciar el proceso de autenticación.
  - Al autenticarse con éxito, el usuario es redirigido a su perfil.
  - Si ocurre un error, el usuario es informado y puede intentar de nuevo.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 6 horas
- **Tareas Técnicas:**
  1. Configurar el SDK de Google OAUTH2 en Angular y enlazarlo con el botón de "Iniciar sesión con Google".
  2. Implementar el flujo de autenticación que envía el token JWT desde el backend y guarda la sesión del usuario en el frontend.
  3. Manejar redirección automática en caso de éxito o de error durante el proceso de autenticación.
  4. Diseñar el mensaje de error en el frontend en caso de autenticación fallida.
- **Notas:**
  - Configurar el almacenamiento seguro del token JWT en el frontend para manejar la sesión.
  - Considerar futuras expansiones del flujo de login en caso de necesitar más proveedores de autenticación.

---

### Ticket de Trabajo 1.3: Creación y gestión de perfil de usuario autenticado (Backend)

- **ID del Ticket:** TKT-103
- **Título del Ticket:** Almacenamiento y actualización de perfil de usuario autenticado
- **Descripción:** Diseñar la estructura de la entidad de Usuario en la base de datos PostgreSQL utilizando Sequelize, y crear un modelo para almacenar la información del usuario al autenticarse con Google.
- **Criterios de aceptación:**
  - Al registrarse por primera vez, el perfil del usuario se almacena con la información recibida de Google.
  - La estructura del perfil debe incluir `id_usuario`, `nombre`, `correo_electronico`, y `fecha_creacion`.
  - La información del usuario es única y se verifica mediante su `correo_electronico`.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Crear el modelo de usuario con Sequelize, configurando los atributos necesarios y aplicando validaciones.
  2. Configurar la tabla para almacenar la fecha de creación (`fecha_creacion`) de cada usuario.
  3. Establecer restricciones de unicidad en el campo `correo_electronico`.
  4. Desarrollar lógica en el controlador para verificar si el usuario existe, y en caso contrario, crear un nuevo perfil.
- **Notas:**
  - Asegurar la integración entre la autenticación y el almacenamiento del perfil del usuario en la base de datos.
  - Documentar el modelo de usuario y sus validaciones en el repositorio.

---

### Ticket de Trabajo 1.4: Verificación de token y redirección de usuarios autenticados (Frontend)

- **ID del Ticket:** TKT-104
- **Título del Ticket:** Implementación de verificación de token y redirección en Angular
- **Descripción:** Crear una lógica en el frontend para verificar el token JWT recibido del backend al iniciar sesión, y redirigir al usuario autenticado a su perfil.
- **Criterios de aceptación:**
  - Si el usuario no tiene un token válido, se le redirige al inicio de sesión.
  - Si el token es válido, el usuario puede navegar al perfil y otras áreas de la plataforma.
  - El token debe almacenarse de forma segura y verificarse antes de cada solicitud importante.
- **Prioridad:** Media
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Crear un servicio en Angular para manejar el almacenamiento y la verificación del token JWT.
  2. Implementar lógica de redirección para que, si el token es válido, el usuario sea redirigido al perfil.
  3. Configurar protección de rutas para que el acceso a las secciones privadas solo sea posible si el usuario tiene un token válido.
  4. Asegurar que el token se verifique antes de cada solicitud relevante.
- **Notas:**
  - Considerar el uso de `localStorage` o `sessionStorage` para almacenar el token de manera segura en el frontend.
  - Implementar un interceptor HTTP para añadir el token a cada solicitud autenticada.

---

### Historia de Usuario 2: Capacidad de Reportar Incidencias

**Historia de usuario:**  
Como **usuario registrado**, quiero **reportar problemas de seguridad en mi área** para **que otros usuarios puedan conocer los riesgos y ayudar a mejorar la seguridad en la comunidad**.

---

### Ticket de Trabajo 2.1: Creación de la entidad y API de Reporte de Incidencias (Backend)

- **ID del Ticket:** TKT-201
- **Título del Ticket:** Implementación de la entidad y API de Reporte de Incidencias
- **Descripción:** Crear el modelo de datos para la entidad "Reporte" en la base de datos usando Sequelize, incluyendo los campos `id_reporte`, `id_usuario`, `descripcion`, `direccion`, `latitud`, `longitud`, `categoria`, y `fecha_creacion`.
- **Criterios de aceptación:**
  - La entidad "Reporte" se almacena correctamente en la base de datos.
  - La API permite crear un nuevo reporte asociándolo al `id_usuario` correspondiente.
  - Los datos del reporte incluyen todos los campos requeridos (`descripcion`, `direccion`, `latitud`, `longitud`, y `categoria`).
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 6 horas
- **Tareas Técnicas:**
  1. Crear el modelo de la entidad "Reporte" con Sequelize.
  2. Configurar las relaciones entre "Reporte" y "Usuario".
  3. Crear la migración para la tabla "Reporte".
  4. Implementar una ruta API en el backend para crear un nuevo reporte de incidencia.
  5. Agregar validaciones para asegurar que todos los campos requeridos estén presentes.
- **Notas:**
  - Definir las posibles categorías para los reportes y aplicarlas como valores predefinidos.
  - Verificar que cada reporte esté asociado a un usuario registrado.

---

### Ticket de Trabajo 2.2: Endpoint para listar reportes por ubicación (Backend)

- **ID del Ticket:** TKT-202
- **Título del Ticket:** Creación de Endpoint para listar reportes según ubicación
- **Descripción:** Crear un endpoint en el backend que permita obtener todos los reportes de incidencias filtrados por ubicación, devolviendo los reportes más cercanos a las coordenadas proporcionadas por el usuario.
- **Criterios de aceptación:**
  - El endpoint recibe coordenadas (`latitud`, `longitud`) y devuelve reportes dentro de un radio de distancia.
  - La respuesta incluye datos relevantes de cada reporte como `descripcion`, `categoria`, `direccion`, y coordenadas.
  - Se pueden listar múltiples reportes ordenados por proximidad a la ubicación.
- **Prioridad:** Media
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Implementar la lógica para calcular y filtrar reportes cercanos usando las coordenadas.
  2. Crear el endpoint `/api/reportes/ubicacion` en el backend.
  3. Agregar paginación para gestionar grandes cantidades de datos.
  4. Implementar pruebas para validar el filtro y ordenamiento por proximidad.
- **Notas:**
  - Utilizar funciones geoespaciales de PostgreSQL para el cálculo de la distancia entre coordenadas.
  - Probar el endpoint con distintas ubicaciones para verificar precisión.

---

### Ticket de Trabajo 2.3: Formulario de Reporte en el Frontend (Angular)

- **ID del Ticket:** TKT-203
- **Título del Ticket:** Creación de formulario de reporte en el frontend
- **Descripción:** Implementar el formulario en Angular que permite al usuario registrado enviar un nuevo reporte, incluyendo los campos `descripcion`, `direccion`, `latitud`, `longitud`, y `categoria`.
- **Criterios de aceptación:**
  - El formulario permite la captura de todos los campos requeridos.
  - El usuario puede seleccionar una categoría de una lista de opciones.
  - Al enviar el reporte, este se guarda correctamente en el backend y el usuario recibe una confirmación.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 5 horas
- **Tareas Técnicas:**
  1. Crear el formulario en Angular con los campos necesarios.
  2. Implementar la selección de la categoría mediante un menú desplegable.
  3. Realizar la integración con la API de backend para enviar los datos del reporte.
  4. Validar el formulario para asegurar que todos los campos estén completos antes de enviarlo.
  5. Mostrar mensaje de éxito o error según el resultado del envío.
- **Notas:**
  - Utilizar Angular Reactive Forms para manejar validaciones.
  - Asegurarse de que el formulario sea accesible solo para usuarios autenticados.

---

### Ticket de Trabajo 2.4: Integración de geolocalización en el formulario (Frontend)

- **ID del Ticket:** TKT-204
- **Título del Ticket:** Integración de geolocalización en el formulario de reporte
- **Descripción:** Integrar la funcionalidad de geolocalización en el formulario para obtener automáticamente la `latitud` y `longitud` del usuario si este permite el acceso a su ubicación.
- **Criterios de aceptación:**
  - Si el usuario permite el acceso a su ubicación, se completan automáticamente los campos `latitud` y `longitud`.
  - Si el usuario no permite el acceso, puede ingresar la ubicación manualmente.
  - Se muestra un mensaje si ocurre un error en la obtención de la ubicación.
- **Prioridad:** Media
- **Estimación de esfuerzo:** 3 horas
- **Tareas Técnicas:**
  1. Configurar el acceso a la API de geolocalización en Angular.
  2. Implementar la captura automática de `latitud` y `longitud` al cargar el formulario.
  3. Habilitar la entrada manual en caso de error o rechazo del permiso.
  4. Informar al usuario si la ubicación no se puede obtener automáticamente.
- **Notas:**
  - Considerar la privacidad del usuario y solicitar permiso explícito para acceder a la ubicación.
  - Verificar compatibilidad en navegadores móviles y de escritorio.

---

### Ticket de Trabajo 2.5: Validación y persistencia de los datos de reportes (Backend)

- **ID del Ticket:** TKT-205
- **Título del Ticket:** Validación y persistencia de datos de reporte en el backend
- **Descripción:** Desarrollar lógica en el backend para validar los datos antes de almacenarlos en la base de datos. Garantizar que los campos `descripcion`, `direccion`, `latitud`, `longitud`, y `categoria` cumplan con las restricciones requeridas.
- **Criterios de aceptación:**
  - Los datos de los reportes se validan antes de ser almacenados.
  - Las coordenadas son válidas (dentro de un rango permitido de latitud y longitud).
  - Los datos almacenados cumplen con los formatos y restricciones predefinidos.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Configurar middleware de validación para el endpoint de creación de reportes.
  2. Implementar validaciones en Sequelize para verificar la integridad de los datos.
  3. Controlar el manejo de errores y devolver respuestas claras al frontend en caso de datos incorrectos.
  4. Configurar pruebas unitarias para los datos de entrada y validaciones.
- **Notas:**
  - Considerar que la longitud de `descripcion` y `direccion` tenga límites definidos.
  - Verificar que las coordenadas estén dentro de un rango válido para prevenir entradas incorrectas.

---

### Historia de Usuario 3: Comentarios en los Reportes

**Historia de usuario:**  
Como **usuario registrado**, quiero **dejar comentarios en los reportes** para **que otros usuarios puedan ver mis observaciones y contribuir con la solución del problema**.

---

### Ticket de Trabajo 3.1: Creación de la entidad y API de Comentarios (Backend)

- **ID del Ticket:** TKT-301
- **Título del Ticket:** Implementación de la entidad y API de Comentarios
- **Descripción:** Crear el modelo de datos para la entidad "Comentario" en la base de datos usando Sequelize, incluyendo los campos `id_comentario`, `id_reporte`, `id_usuario`, `contenido`, y `fecha_creacion`.
- **Criterios de aceptación:**
  - La entidad "Comentario" se almacena correctamente en la base de datos.
  - La API permite crear un nuevo comentario asociándolo al `id_usuario` y `id_reporte`.
  - Se validan los campos requeridos antes de almacenar el comentario.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 6 horas
- **Tareas Técnicas:**
  1. Crear el modelo de la entidad "Comentario" con Sequelize.
  2. Configurar las relaciones entre "Comentario", "Usuario" y "Reporte".
  3. Crear la migración para la tabla "Comentario".
  4. Implementar una ruta API para crear un nuevo comentario.
  5. Agregar validaciones de datos para los campos de los comentarios.
- **Notas:**
  - La relación entre "Comentario" y "Reporte" es de uno a muchos, lo que significa que un reporte puede tener múltiples comentarios.
  - Se debe asegurar que solo los usuarios registrados puedan comentar.

---

### Ticket de Trabajo 3.2: Endpoint para listar los comentarios de un reporte (Backend)

- **ID del Ticket:** TKT-302
- **Título del Ticket:** Creación de Endpoint para listar los comentarios de un reporte
- **Descripción:** Crear un endpoint en el backend que permita obtener todos los comentarios asociados a un reporte específico.
- **Criterios de aceptación:**
  - El endpoint recibe un `id_reporte` y devuelve todos los comentarios relacionados con ese reporte.
  - Los comentarios incluyen `contenido`, `fecha_creacion`, y el `nombre` del usuario que hizo el comentario.
  - Los comentarios se ordenan por la fecha de creación (más recientes primero).
- **Prioridad:** Media
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Crear la ruta API para obtener los comentarios de un reporte.
  2. Implementar el filtrado por `id_reporte` y ordenarlos por fecha.
  3. Configurar paginación en caso de que haya muchos comentarios.
  4. Asegurarse de que los comentarios devuelvan datos del usuario (`id_usuario` y `nombre`).
- **Notas:**
  - Considerar paginación para mejorar la eficiencia en reportes con muchos comentarios.

---

### Ticket de Trabajo 3.3: Formulario de Comentario en el Frontend (Angular)

- **ID del Ticket:** TKT-303
- **Título del Ticket:** Implementación del formulario de comentario en el frontend
- **Descripción:** Crear un formulario en Angular para que los usuarios registrados puedan dejar comentarios en un reporte. El formulario debe incluir un campo de texto para el contenido y un botón para enviar el comentario.
- **Criterios de aceptación:**
  - El formulario permite capturar un comentario de texto.
  - El formulario se valida para asegurarse de que el contenido no esté vacío.
  - Al enviar el formulario, el comentario se guarda correctamente y se muestra en la lista de comentarios.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Crear el formulario en Angular para ingresar un comentario.
  2. Validar que el comentario no esté vacío antes de enviarlo.
  3. Integrar la API de backend para guardar el comentario.
  4. Mostrar un mensaje de confirmación tras el envío.
- **Notas:**
  - El formulario debe ser accesible solo para usuarios registrados.
  - Validar que el contenido no exceda una longitud razonable.

---

### Ticket de Trabajo 3.4: Visualización de los comentarios en el reporte (Frontend)

- **ID del Ticket:** TKT-304
- **Título del Ticket:** Implementación de la visualización de comentarios en el reporte
- **Descripción:** Mostrar los comentarios asociados a cada reporte en la página de detalles del reporte.
- **Criterios de aceptación:**
  - Los comentarios se muestran bajo el reporte correspondiente.
  - Los comentarios están ordenados por fecha, con los más recientes primero.
  - Se muestran el contenido del comentario y el nombre del usuario que lo escribió.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 5 horas
- **Tareas Técnicas:**
  1. Crear la interfaz de usuario para mostrar los comentarios debajo del reporte.
  2. Implementar la llamada a la API para obtener los comentarios.
  3. Asegurarse de que los comentarios se ordenen correctamente.
  4. Mostrar el nombre del usuario junto al comentario.
- **Notas:**
  - Asegurar que la visualización de los comentarios se cargue correctamente en el frontend.

---

### Historia de Usuario 4: Puntuar Comentarios

**Historia de usuario:**  
Como **usuario registrado**, quiero **poder calificar los comentarios de otros usuarios** para **dar mi opinión sobre la utilidad del comentario y ayudar a otros usuarios a identificar comentarios útiles**.

---

### Ticket de Trabajo 4.1: Creación de la entidad Rating (Backend)

- **ID del Ticket:** TKT-401
- **Título del Ticket:** Implementación de la entidad Rating
- **Descripción:** Crear el modelo de datos para la entidad "Rating" en la base de datos utilizando Sequelize, que incluirá los campos `id_rating`, `id_comentario`, `id_usuario`, `puntaje`, y `fecha_creacion`.
- **Criterios de aceptación:**
  - La entidad "Rating" se almacena correctamente en la base de datos.
  - La API permite crear un nuevo puntaje asociado a un `comentario` y a un `usuario`.
  - El puntaje debe ser un valor numérico entre 1 y 5.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 6 horas
- **Tareas Técnicas:**
  1. Crear el modelo de la entidad "Rating" con Sequelize.
  2. Configurar la relación entre "Rating" y "Comentario".
  3. Crear la migración para la tabla "Rating".
  4. Implementar la API para crear un nuevo puntaje para un comentario.
  5. Validar que el puntaje esté dentro del rango permitido (1-5).
- **Notas:**
  - Asegurarse de que no se pueda agregar más de un puntaje por usuario a un comentario.

---

### Ticket de Trabajo 4.2: Endpoint para obtener el puntaje promedio de un comentario (Backend)

- **ID del Ticket:** TKT-402
- **Título del Ticket:** Endpoint para obtener el puntaje promedio de un comentario
- **Descripción:** Crear un endpoint para obtener el puntaje promedio de todos los ratings de un comentario.
- **Criterios de aceptación:**
  - El endpoint recibe un `id_comentario` y devuelve el puntaje promedio.
  - El puntaje promedio se calcula correctamente, considerando todos los ratings asociados.
  - Si no hay ratings, el endpoint devuelve `null` o un mensaje adecuado.
- **Prioridad:** Media
- **Estimación de esfuerzo:** 4 horas
- **Tareas Técnicas:**
  1. Crear la ruta API para obtener el puntaje promedio de un comentario.
  2. Implementar la lógica para calcular el puntaje promedio de los ratings.
  3. Verificar que el puntaje promedio se calcule correctamente.
  4. Asegurarse de que el endpoint devuelva un valor adecuado si no hay ratings.
- **Notas:**
  - El cálculo debe ser eficiente, ya que puede haber muchos ratings por comentario.

---

### Ticket de Trabajo 4.3: Interfaz para puntuar comentarios (Frontend)

- **ID del Ticket:** TKT-403
- **Título del Ticket:** Implementación de la interfaz para puntuar comentarios
- **Descripción:** Crear una interfaz en Angular que permita a los usuarios puntuar los comentarios de otros usuarios utilizando una escala del 1 al 5.
- **Criterios de aceptación:**
  - Los usuarios pueden seleccionar una puntuación entre 1 y 5.
  - Al puntuar un comentario, la puntuación se guarda correctamente en el backend.
  - Se muestra la puntuación promedio actual del comentario.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 5 horas
- **Tareas Técnicas:**
  1. Crear el componente de puntuación en Angular.
  2. Implementar la llamada a la API para guardar la puntuación.
  3. Mostrar el puntaje promedio del comentario.
  4. Validar que los usuarios solo puedan puntuar una vez por comentario.
- **Notas:**
  - La interfaz debe ser clara y fácil de usar, utilizando estrellas o un control de selección similar para puntuar.

---

### Historia de Usuario 5: Notificaciones para el Usuario

**Historia de usuario:**  
Como **usuario registrado

**, quiero **recibir notificaciones cuando haya nuevos comentarios en los reportes que he seguido o sobre los que he comentado** para **mantenerme informado sobre las discusiones en los reportes**.

---

### Ticket de Trabajo 5.1: Implementación de notificaciones por comentarios (Backend)

- **ID del Ticket:** TKT-501
- **Título del Ticket:** Implementación de notificaciones por comentarios
- **Descripción:** Crear un sistema de notificaciones para enviar alertas a los usuarios cuando haya nuevos comentarios en los reportes que siguen o sobre los que han comentado.
- **Criterios de aceptación:**
  - Los usuarios reciben una notificación cuando se comenta en un reporte que han seguido o en el que han comentado.
  - La notificación debe contener información sobre el comentario y el reporte.
- **Prioridad:** Alta
- **Estimación de esfuerzo:** 8 horas
- **Tareas Técnicas:**
  1. Crear el modelo de notificación en la base de datos.
  2. Configurar un servicio de notificaciones en el backend.
  3. Implementar lógica para enviar notificaciones cuando se agregue un nuevo comentario.
  4. Asegurarse de que las notificaciones se envíen solo a los usuarios relevantes.
- **Notas:**
  - Las notificaciones pueden enviarse por correo electrónico o mediante un sistema interno dentro de la plataforma.

---

### Ticket de Trabajo 5.2: Visualización de las notificaciones (Frontend)

- **ID del Ticket:** TKT-502
- **Título del Ticket:** Implementación de la visualización de notificaciones
- **Descripción:** Crear una interfaz para mostrar las notificaciones de los usuarios cuando se reciban nuevos comentarios en los reportes que han seguido o comentado.
- **Criterios de aceptación:**
  - Las notificaciones deben ser visibles en un panel o barra de notificaciones.
  - Los usuarios pueden ver los detalles de la notificación al hacer clic en ella.
  - Las notificaciones se actualizan en tiempo real.
- **Prioridad:** Media
- **Estimación de esfuerzo:** 6 horas
- **Tareas Técnicas:**
  1. Crear la interfaz de usuario para mostrar las notificaciones.
  2. Implementar la funcionalidad para hacer que las notificaciones se actualicen en tiempo real.
  3. Crear un enlace en la notificación que permita al usuario ver el comentario o reporte relevante.
- **Notas:**
  - Se debe manejar el caso de notificaciones leídas/no leídas y permitir la eliminación de notificaciones antiguas.

---

Esto cubre todas las historias de usuario relacionadas con el sistema de comentarios.