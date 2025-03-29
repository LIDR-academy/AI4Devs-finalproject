
#prompt 1

#salida 1
- Actua como un arquitecto de software, mejora este ticket que esta incompleto, porque para crear un reporte de perdida, se necesitan mas tablas, segun el modelo, revisa el PRD.
de acuerdo a este, cuales son los ajustes que consideras necesarios
- Crea el ticket con los ajustes, manteneindo la estructura del ticket que tenemos en el PRD
### **📌 Ticket 2 - Implementar API y Base de Datos para Reportar Mascotas Perdidas**  

#### **📍 Descripción:**  
Se debe desarrollar el **módulo de reportes de pérdida** en el backend, permitiendo a los usuarios **crear, visualizar, actualizar y eliminar reportes de mascotas perdidas**. Además, los reportes deben permitir la **subida de imágenes**, almacenándolas en **AWS S3** y asociándolas al reporte.  

**En esta fase NO se implementarán:**  
🚫 **Reconocimiento de imágenes con AWS Rekognition.**  
🚫 **Notificaciones automáticas de coincidencias.**  

---

### **✅ Criterios de Aceptación:**  

#### **📌 Base de Datos:**  
- Crear las siguientes tablas en **PostgreSQL**:  
  ✔ **`REPORTE_PERDIDA`** → Información principal del reporte.  
  ✔ **`HISTORIAL_REPORTE`** → Para registrar cambios de estado del reporte.  
  ✔ **`IMAGENES`** → Para almacenar imágenes de los reportes en **AWS S3**.  

#### **📌 Endpoints REST:**  
- `POST /reportes-perdida` → Crear un reporte de pérdida.  
- `GET /reportes-perdida` → Listar reportes de pérdida.  
- `GET /reportes-perdida/{id}` → Obtener detalles de un reporte.  
- `PUT /reportes-perdida/{id}` → Actualizar estado del reporte.  
- `DELETE /reportes-perdida/{id}` → Eliminar un reporte.  
- `POST /reportes-perdida/{id}/imagenes` → Subir imagen del reporte a AWS S3.  

#### **📌 Reglas de Negocio:**  
- Un usuario **no puede crear reportes duplicados** para la misma mascota en menos de **24 horas**.  
- Un usuario **solo puede editar o eliminar sus propios reportes**.  
- La imagen subida **debe almacenarse en AWS S3** y asociarse al reporte.  
- Si un usuario elimina un reporte, **también deben eliminarse sus imágenes en S3**.  

#### **📌 Integraciones:**  
- **AWS S3** → Para almacenar imágenes de mascotas perdidas.  

---

### **📌 Estimación:**  
🔹 **8 puntos de historia**  

### **📌 Prioridad:**  
🚀 **Alta**  

### **📌 Asignado a:**  
🛠 **Equipo de Backend y DBA**  

### **📌 Etiquetas:**  
🔖 `API`, `Backend`, `Database`, `Sprint 1`  

### **📌 Comentarios:**  
💡 **Asegurar validaciones de datos antes de insertar en la base de datos.**  
💡 **Verificar eliminación de imágenes en AWS S3 al eliminar un reporte.**  
💡 **La estructura debe ser escalable para futuras funcionalidades.**  

---

**🔗 Enlaces:**  
📑 **Documentación de API y Esquema de Base de Datos en Diagrama ERD**  

---

### **📌 Historial de Cambios:**  
📌 **Versión 1.0 - Creación del ticket con ajustes en la base de datos y API.**  
