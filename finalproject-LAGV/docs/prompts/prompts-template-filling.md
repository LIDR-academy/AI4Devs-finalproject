# Chatbot: Cursor - Claude Sonnet 3.5

## 1. Descripción general del producto

**Prompt 1:**  Con base en este documento @PRD.md , vamos a llenar este archivo @readme.md, vamos a ir punto por punto, iniciamos con el punto 1.1 y así sucesivamente hasta completar todos los puntos del apartado 1.

Hazme las preguntas que necesites para completar el documento.


## 2. Arquitectura del Sistema

**Prompt 1:** Con base en este documento @PRD.md , vamos a llenar este archivo @readme.md, vamos a ir punto por punto, todo diagrama debe estar en formato mermaid.

Iniciamos con el punto 2.1 y así sucesivamente hasta completar todos los puntos del apartado 2.

Hazme las preguntas que necesites para completar el documento.

**Prompt 2:** Continuamos con el punto 2.2

**Prompt 3:** Para el punto 2.3 Descripción de alto nivel del proyecto y estructura de ficheros, vamos a tener 3 carpetas principales, backend, frontend, cada una de estas carpetas va a tener sus propias carpetas internas, por ejemplo, backend va a tener api, config, models, services, utils, etc y en frontend vamos a ocupar la arquitetura de featues y lazy loading, es decir vamos a ocupar el patrón de arquitectura limpia (Clean Architecture).

Para todo esto asume el rol de arquitecto y desarrollador full stack.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

# Chatbot: ChatGPT-4.0

**Prompt 1:**  Dame un prompt para generar un Modelo de Datos con los siguiente puntos:
    1. Diagrama del modelo de datos
    2. Descripción de entidades principales
    
Todo esto con base en el siguiente Product Requirements Document @PRD.md, que cumpla con todas las buenas practicas de DB y que se adapte a todas las caracteristicas mencionadas en el PRD, todos los modelos deben ser en formato mermaid.

**Prompt 2:**


*"Genera un **modelo de base de datos relacional** basado en el siguiente **Product Requirements Document (@PRD.md)** para la aplicación *Easy Reader*. Sigue las mejores prácticas de modelado de datos, asegurando escalabilidad, integridad referencial y optimización para consultas eficientes.  

### **Consideraciones Clave**  
1. **Usuarios**  
   - Se permite el acceso sin registro, pero los usuarios registrados pueden almacenar archivos y enlaces.  
   - Se deben almacenar datos de autenticación segura (correo, contraseñas encriptadas).  
   - Un usuario puede tener múltiples documentos y configuraciones personalizadas.  

2. **Gestión de Documentos**  
   - Los usuarios pueden subir archivos **PDF** y guardar **URLs**.  
   - Usuarios no registrados: Solo almacenamiento local en el cliente.  
   - Usuarios registrados: Asociación de documentos a su cuenta, con almacenamiento en la base de datos o en la nube.  
   - Se debe permitir gestionar documentos (renombrar, eliminar).  

3. **Modos de Lectura Automática**  
   - Cada usuario puede configurar su **modo de lectura automático**:  
     - **Acelerómetro** (movimiento del dispositivo).  
     - **Detección de rostro** (movimiento de la cabeza).  
     - **Gestos de manos** (futuro).  
   - Se debe guardar la configuración seleccionada para futuras sesiones.  

4. **Configuraciones Personalizadas**  
   - Los usuarios registrados pueden personalizar su experiencia con:  
     - **Modo oscuro o claro**.  
     - **Ajuste de brillo**.  
     - **Velocidad de desplazamiento automático**.  

5. **Notas y Subrayado**  
   - Los usuarios pueden **agregar notas y subrayar texto** en los documentos.  
   - Usuarios no registrados: Notas guardadas en el cliente localmente.  
   - Usuarios registrados: Notas almacenadas en la base de datos, asociadas a documentos.  
   - Un documento puede tener múltiples notas/subrayados asociados a diferentes secciones.  

### **Buenas Prácticas de Modelado**  
- **Normalización (3NF)** para evitar redundancias y mejorar eficiencia.  
- **Índices** en columnas clave (ID de usuario, documentos) para optimización.  
- **Relaciones adecuadas** (*1:N*, *N:M* donde aplique).  
- **Campos de auditoría** (`created_at`, `updated_at`, `deleted_at`) en todas las entidades principales.  
- **Extensibilidad** para futuras mejoras sin refactorización compleja.  

### **Tecnologías**  
- **ORM:** Prisma  
- **Base de Datos:** PostgreSQL  
- **Tablas esperadas:**  
  - `users` (usuarios)  
  - `documents` (documentos PDF y URLs)  
  - `reading_settings` (configuración de lectura)  
  - `notes` (notas de usuario)  
  - `highlights` (subrayados de usuario)  
  - `themes` (preferencias de tema y brillo)  

**Genera un Diagrama Entidad-Relación (ERD) en Mermaid** mostrando claves primarias, claves foráneas y tipos de datos adecuados.  

**Prompt 3:** También proporciona el **script SQL para la creación de la base de datos** con constraints apropiadas.


### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:** Ahora vamos a generar el punto 5. Historias de Usuario, únicamente vamos a generar 3 historias de usuario, que sean las más importantes y que cumplan con las buenas prácticas de producto.

La historia de usuario debe tener el formato estandar de historias de usuario, vamos a ser lo más detallados posibles.

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:** Con base en las historias de usuario del punto 5, documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto y las funcionalidad del PRD.md

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
