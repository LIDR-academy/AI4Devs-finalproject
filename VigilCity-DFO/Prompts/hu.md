## Historias de Usuario

### 1. Autenticación con OAUTH2 con Google

**Historia de usuario:**  
Como **usuario nuevo**, quiero **registrarme e iniciar sesión con mi cuenta de Google** para **acceder rápidamente sin crear una nueva cuenta en la plataforma**.

**Criterios de aceptación:**
1. El usuario debe poder registrarse usando su cuenta de Google.
2. La autenticación con Google debe ser segura, y no almacenar la contraseña del usuario en la plataforma.
3. El sistema debe crear un perfil de usuario en la base de datos una vez que el registro con Google sea exitoso.
4. Si el usuario ya está registrado con Google, el sistema debe permitirle iniciar sesión sin duplicar su cuenta.
5. Si la autenticación falla, el usuario debe ver un mensaje de error y debe poder intentar de nuevo.

---

### 2. Capacidad de reportar incidencias

**Historia de usuario:**  
Como **usuario autenticado**, quiero **reportar incidencias en el mapa** para **informar a la comunidad y las autoridades sobre problemas de seguridad en una zona específica**.

**Criterios de aceptación:**
1. El usuario debe poder seleccionar una ubicación en el mapa y marcarla como el lugar de la incidencia.
2. El sistema debe permitir al usuario seleccionar una categoría para el reporte, como "Iluminación", "Robo", "Vandalismo", etc.
3. El reporte debe incluir los campos de descripción, dirección, latitud, longitud y categoría, y ser almacenado en la base de datos al enviar el formulario.
4. Al guardar el reporte, debe mostrarse un mensaje de confirmación al usuario y el reporte debe aparecer en el mapa.
5. Si falta información obligatoria, el sistema debe mostrar un mensaje de error indicando los campos pendientes.

---

### 3. Sistema de comentarios y valoraciones

**Historia de usuario:**  
Como **usuario autenticado**, quiero **comentar y calificar reportes de incidentes** para **contribuir con mis opiniones sobre la seguridad de un área**.

**Criterios de aceptación:**
1. El usuario debe poder escribir un comentario sobre un reporte existente y enviarlo.
2. El usuario debe poder asignar una puntuación de 1 a 5 al comentario, donde 1 es "muy inseguro" y 5 es "muy seguro".
3. La plataforma debe almacenar cada comentario y su puntuación en la base de datos, asociándolo con el reporte y el usuario.
4. El sistema debe mostrar un promedio de las puntuaciones para cada comentario, calculado automáticamente.
5. Si el comentario no se puede enviar, debe mostrarse un mensaje de error y permitir al usuario intentarlo de nuevo.

---

### 4. Modo anónimo para consulta

**Historia de usuario:**  
Como **visitante anónimo**, quiero **consultar incidentes en el mapa sin necesidad de registrarme** para **obtener información sobre la seguridad en una zona específica sin crear una cuenta**.

**Criterios de aceptación:**
1. El usuario no autenticado debe poder ver los reportes de incidentes en el mapa sin necesidad de iniciar sesión o registrarse.
2. Cada reporte en el mapa debe mostrar su categoría, ubicación y descripción al hacer clic, sin revelar la identidad del usuario que lo creó.
3. El visitante debe poder filtrar los reportes en el mapa por categoría.
4. Los comentarios y el puntaje promedio de cada reporte deben ser visibles para los visitantes.
5. Si el visitante intenta reportar o comentar, debe recibir un mensaje que le solicite registrarse.

---

### 5. Visualización de reportes en el mapa

**Historia de usuario:**  
Como **usuario de la plataforma**, quiero **ver los reportes de incidencias en un mapa interactivo** para **comprender mejor las áreas de riesgo y los problemas comunes en una zona**.

**Criterios de aceptación:**
1. El mapa debe mostrar todos los reportes como marcadores, ubicados según las coordenadas proporcionadas por los usuarios.
2. Cada marcador debe representar la categoría del incidente con un color o ícono específico.
3. Al hacer clic en un marcador, debe aparecer un resumen del reporte, incluyendo descripción, categoría, y puntaje promedio de los comentarios.
4. El usuario debe poder ampliar, reducir y moverse en el mapa para explorar diferentes zonas.
5. El sistema debe actualizar el mapa automáticamente si se crea un nuevo reporte o se elimina uno existente.

---

### 6. Gestión de perfil de usuario

**Historia de usuario:**  
Como **usuario autenticado**, quiero **actualizar mi perfil** para **asegurar que mi información personal esté correcta y actualizada**.

**Criterios de aceptación:**
1. El usuario debe poder acceder a una sección de perfil donde pueda ver su nombre y correo electrónico asociados a la cuenta.
2. El usuario debe poder cambiar su nombre y verificar el cambio en su perfil.
3. Los cambios en el perfil deben guardarse en la base de datos al confirmar la actualización.
4. Si hay algún error en la actualización, el usuario debe ver un mensaje de error y poder intentar de nuevo.
5. El usuario debe poder eliminar su cuenta, con un mensaje de confirmación antes de realizar la acción.
