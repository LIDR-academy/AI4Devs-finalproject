## **Product Roadmap: Plataforma de Gestión de Servicios y Reservas (MVP)**

### **Visión del Producto**
Ser la plataforma de referencia para marcas personales y creativas que buscan profesionalizar y monetizar sus servicios (talleres, asesorías), combinando una gestión de reservas sencilla con una potente narrativa de marca. Nos diferenciamos por ofrecer una experiencia más simple que un e-commerce completo y más centrada en el catálogo de servicios que las herramientas de agendamiento individual.

### **1. Scope y Alcance del MVP**

El objetivo estratégico del MVP es validar dos hipótesis críticas:
1.  Las marcas adoptarán la herramienta si reduce drásticamente la fricción operativa de la gestión manual (email/hojas de cálculo).
2.  Un flujo centrado en la **aprobación manual + sincronización de calendario** es el punto óptimo para el segmento objetivo, ofreciendo control sin sacrificar eficiencia.

#### **Funcionalidades DENTRO (In) del Alcance del MVP:**
* **Gestión de Servicios y Slots:** CRUD completo para que la marca defina su oferta.
* **Flujo de Reserva del Usuario Final:** Página pública de servicios, formulario de reserva y página de consulta de estado.
* **Gestión de Reservas (Admin):** Flujo de aprobación/rechazo de reservas pendientes.
* **Autenticación de Administrador:** Un único login para la marca.
* **Sincronización Bidireccional de Calendario (Google Calendar):** Característica **crítica** para evitar el doble-booking y eliminar el proceso manual de consulta. Las reservas aprobadas se añaden al calendario del admin y los eventos existentes en su calendario bloquean slots de disponibilidad.
* **Notificaciones Transaccionales Básicas por Email:** Emails automáticos para (1) el usuario al solicitar una reserva y (2) el usuario cuando su reserva es aprobada/rechazada.

#### **Funcionalidades FUERA (Out) del Alcance del MVP:**
* **Pasarela de Pago:** La monetización se gestionará externamente en esta fase.
* **Cancelaciones y Políticas Avanzadas:** No habrá un flujo para que el usuario cancele o para definir políticas de no-show.
* **Multi-tenant / Múltiples Marcas:** El sistema funcionará para una sola marca.
* **Roles y Permisos:** Solo existirá el rol de "Administrador".
* **Recordatorios Automáticos:** No se enviarán recordatorios antes del evento.
* **Personalización Avanzada de la Interfaz:** Se usará un diseño limpio y estándar, con opción de subir un logo.

### **2. Features del MVP: Épicas e Historias de Usuario**

A continuación, se desglosan las funcionalidades en Épicas e Historias de Usuario.

---
### **Épica 1: Gestión de Servicios y Disponibilidad (Admin)**
*Esta épica cubre todas las funcionalidades que necesita la marca para configurar y publicar su catálogo de servicios.*

**Título de la Historia de Usuario: Creación de un Nuevo Servicio**
* **Como** administrador de la marca,
* **quiero** crear y definir un nuevo servicio con título, descripción, duración y precio,
* **para que** pueda mostrar mi oferta a potenciales clientes en mi página pública.
* **Criterios de Aceptación:**
    * El formulario de creación debe incluir campos para: Título (texto), Descripción (texto simple), Duración (en minutos), Precio (numérico).
    * Al guardar, el nuevo servicio aparece en mi listado de servicios en el backoffice.
    * Puedo editar y eliminar servicios existentes.
* **Historias de Usuario Relacionadas:** *Creación de Slots de Disponibilidad*.

**Título de la Historia de Usuario: Creación de Slots de Disponibilidad**
* **Como** administrador de la marca,
* **quiero** asignar franjas horarias (slots) disponibles a un servicio específico,
* **para que** los usuarios puedan ver mi disponibilidad real y solicitar una reserva.
* **Criterios de Aceptación:**
    * Desde la vista de un servicio, puedo añadir un nuevo slot definiendo una fecha y hora de inicio únicas.
    * El sistema calcula la hora de fin automáticamente basándose en la duración del servicio.
    * Los slots creados se muestran como "Abiertos" por defecto.
    * Los slots cuya fecha/hora ya ha pasado no se muestran en la página pública.
* **Historias de Usuario Relacionadas:** *Sincronización con Calendario Externo*.

---
### **Épica 2: Flujo de Reserva del Usuario Final**
*Esta épica cubre la experiencia completa del cliente, desde que descubre los servicios hasta que consulta el estado de su reserva.*

**Título de la Historia de Usuario: Visualización del Catálogo de Servicios**
* **Como** un visitante (potencial cliente),
* **quiero** ver un listado de todos los servicios ofrecidos por la marca,
* **para que** pueda explorar y elegir el que más me interesa.
* **Criterios de Aceptación:**
    * Existe una página pública (landing) que muestra todos los servicios "activos" en formato de tarjetas.
    * Cada tarjeta de servicio muestra el título, un resumen de la descripción y el precio.
    * Al hacer clic en una tarjeta, navego a la página de detalle de ese servicio.

**Título de la Historia de Usuario: Solicitud de Reserva de un Slot**
* **Como** un visitante,
* **quiero** seleccionar un slot disponible y rellenar un formulario con mi nombre y email,
* **para que** pueda solicitar mi reserva para ese servicio.
* **Criterios de Aceptación:**
    * La página de detalle del servicio muestra su descripción completa y la lista de próximos slots "Abiertos".
    * Al hacer clic en un slot, se muestra un formulario simple que solicita Nombre y Email.
    * Tras enviar el formulario, el sistema crea una reserva con estado "Pendiente".
    * Soy redirigido a una página de confirmación que me muestra un código de reserva único (`booking_code`) y me informa que recibiré un email.

**Título de la Historia de Usuario: Consulta del Estado de mi Reserva**
* **Como** un cliente que ha solicitado una reserva,
* **quiero** usar mi código de reserva (`booking_code`) para consultar el estado actualizado,
* **para que** tenga visibilidad inmediata de si mi solicitud ha sido aceptada.
* **Criterios de Aceptación:**
    * Existe una página `/reserva/{booking_code}` que muestra el estado actual ("Pendiente", "Aprobado", "Rechazado").
    * La página muestra los detalles del servicio y el slot que reservé.

---
### **Épica 3: Gestión de Reservas e Integraciones (Admin)**
*Esta épica cierra el ciclo, permitiendo al admin gestionar las solicitudes entrantes y sincronizar su disponibilidad.*

**Título de la Historia de Usuario: Gestión de Solicitudes de Reserva**
* **Como** administrador de la marca,
* **quiero** ver un listado de todas las reservas "Pendientes" y poder aprobarlas o rechazarlas,
* **para que** pueda tener control total sobre mi agenda y mis clientes.
* **Criterios de Aceptación:**
    * Mi dashboard principal en el backoffice muestra una lista de reservas con estado "Pendiente".
    * Cada elemento de la lista muestra el nombre del cliente, su email, el servicio y el slot solicitado.
    * Tengo botones para "Aprobar" y "Rechazar" cada solicitud.
    * Al aprobar, el estado de la reserva cambia a "Aprobado" y el slot a "Cerrado".
    * Al rechazar, el estado de la reserva cambia a "Rechazado" y el slot vuelve a "Abierto".

**Título de la Historia de Usuario: Sincronización con Calendario Externo**
* **Como** administrador de la marca,
* **quiero** conectar mi Google Calendar a la plataforma,
* **para que** mi disponibilidad se gestione automáticamente y no tenga que revisar dos sitios a la vez.
* **Criterios de Aceptación:**
    * En mi configuración, puedo autenticar mi cuenta de Google de forma segura (OAuth2).
    * Cuando un slot es creado en la plataforma, este no debe coincidir con un evento existente en mi calendario.
    * Cuando apruebo una reserva, se crea automáticamente un evento en mi Google Calendar con los detalles del servicio y el cliente.
    * Cuando creo un evento personal en mi Google Calendar, los slots de la plataforma que se solapen con ese evento deben quedar como "No disponibles".

---
### **3. Pasos Lógicos para la Implementación (Tech-Agnóstico)**

1.  **Fase 1: Fundación y Backoffice (Core Admin)**
    * Definición de modelos de datos: `Servicio`, `Slot`, `Reserva`, `UsuarioAdmin`.
    * Implementación del sistema de autenticación para el administrador.
    * Desarrollo de las interfaces (CRUD) para que el admin pueda crear, ver, editar y eliminar Servicios y sus Slots asociados.

2.  **Fase 2: Experiencia Pública y Captura de Reservas**
    * Desarrollo de las vistas públicas: listado de servicios y página de detalle de servicio.
    * Implementación del formulario de reserva y la lógica para crear una `Reserva` con estado "Pendiente".
    * Creación de la página de confirmación con el `booking_code` y la página de consulta de estado.

3.  **Fase 3: Cierre del Bucle de Gestión y Sincronización**
    * Implementación del dashboard del admin para visualizar y gestionar las reservas pendientes (Aprobar/Rechazar).
    * Desarrollo de la lógica de negocio para los cambios de estado.
    * **Integración con la API de Google Calendar:** Implementar el flujo OAuth2 y la lógica para la sincronización bidireccional. Este es el paso técnicamente más complejo.
    * Implementación del servicio de envío de emails transaccionales básicos.

4.  **Fase 4: Despliegue y Puesta en Producción**
    * Configuración de la infraestructura básica: servidor de aplicaciones, base de datos.
    * Configuración de dominio (DNS), certificados de seguridad (SSL).
    * Implementación de un sistema de logging y monitorización simple.
    * Instrumentación de las métricas clave definidas en la hipótesis (ej. `H1`, `H2`, `H3`) usando una herramienta de analítica básica.
    * Creación de un pipeline de despliegue continuo (CI/CD) para automatizar futuras actualizaciones.

### **4. Siguientes Pasos: Iteración y Mejora Continua**

El lanzamiento del MVP no es el final, sino el comienzo del aprendizaje.

1.  **Iteración Inmediata (0-3 meses post-lanzamiento):**
    * **Validación de Hipótesis:** Medir activamente las métricas `H1`, `H2`, `H3`. ¿Se cumple que crear un servicio toma < 5 min? ¿Se reducen los emails de seguimiento?
    * **Feedback Cualitativo:** Realizar entrevistas con los primeros usuarios (early adopters) para entender sus puntos de dolor y deseos.
    * **Desarrollo Prioritario:** Basado en el feedback, las próximas features probablemente serán:
        * **Políticas de Cancelación:** Permitir que el admin defina y el usuario pueda cancelar su reserva.
        * **Recordatorios por Email:** Enviar un recordatorio 24h antes del servicio.
        * **Personalización Visual:** Más opciones para adaptar la página pública a la marca.

2.  **Mediano Plazo (3-9 meses):**
    * **Monetización:** Implementar la **pasarela de pago** (ej. Stripe) para cobrar por los servicios en el momento de la reserva. Esto transformará el producto en una solución de e-commerce completa.
    * **Gestión de Clientes:** Un CRM simple para que la marca vea el historial de reservas de cada cliente.
    * **Reservas de Grupo:** Permitir que un mismo slot pueda ser reservado por múltiples usuarios (para talleres).

3.  **Largo Plazo (Visión a +9 meses):**
    * **Plataforma Multi-tenant:** Re-arquitecturar el sistema para que múltiples marcas puedan registrarse y gestionar sus propios perfiles.
    * **Roles y Permisos:** Permitir que una marca invite a miembros de su equipo con acceso limitado.
    * **Dashboard de Analíticas:** Ofrecer al admin informes sobre ingresos, servicios más populares, tasa de ocupación, etc.
    * **Marketplace (Opcional):** Explorar la posibilidad de crear una galería pública donde los usuarios finales puedan descubrir servicios de diferentes marcas.