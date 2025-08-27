### 1.1 Registro de paciente

#### Historias de usuario

**ID:** REG-PAC-01  
**Título:** Registro de paciente  
**Descripción:**  
Como visitante, quiero registrarme como paciente proporcionando mi nombre, correo electrónico y contraseña segura, para poder agendar citas y gestionar mi perfil en la plataforma.

#### Tickets Backend
##### 1.1.1 [Backend] Crear endpoint de registro de paciente

**Descripción detallada:**  
Diseñar y desarrollar el endpoint REST (`POST /api/auth/register/patient`) que permita registrar un nuevo paciente. Debe validar los campos requeridos, almacenar la contraseña como hash y crear las entidades USER y PATIENT en la base de datos.

**Dependencias:**  
- Ninguna (primer paso del flujo de registro).

**Etiquetas:**  
Backend, API REST, Validación, Seguridad

**Criterios de aceptación:**  
- [ ] El endpoint recibe los campos: nombre, apellido, email, contraseña, confirmación de contraseña, tipo de usuario (paciente).
- [ ] El email es único y no se repite en la base de datos.
- [ ] La contraseña cumple con los requisitos de seguridad (mínimo 8 caracteres, al menos un número, un carácter especial y una letra mayúscula).
- [ ] La contraseña y su confirmación coinciden.
- [ ] La contraseña se almacena como hash usando bcryptjs.
- [ ] Se crea el registro en las tablas USER y PATIENT.
- [ ] El endpoint responde siguiendo el formato estándar de la API.
- [ ] Se incluyen pruebas unitarias para validaciones y casos de error.

**Estimación de tiempo:**  
3 horas

---

##### 1.1.2 [Backend] Validaciones y mensajes de error 

**Descripción detallada:**  
Implementar validaciones de datos y mensajes de error (inglés por defecto) en el endpoint de registro de paciente.

**Dependencias:**  
- Depende de la creación del endpoint de registro.

**Etiquetas:**  
Backend, Validación

**Criterios de aceptación:**  
- [ ] Todos los errores de validación se devuelven en inglés y en el formato estándar de la API.
- [ ] Los mensajes de error son claros y específicos (ejemplo: "Email already exists", "Password too weak").
- [ ] Se incluyen pruebas unitarias para los mensajes de error.

**Estimación de tiempo:**  
1 hora

### 1.1.3 [Backend] Documentar el endpoint de registro de paciente

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de registro de paciente para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/auth/register/patient` en Swagger, incluyendo:
  - Descripción de la funcionalidad.
  - Campos requeridos: nombre, apellido, email, contraseña, confirmación de contraseña, tipo de usuario (paciente).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (id, nombre, email, fecha de registro).
  - Posibles errores y mensajes de validación (email duplicado, contraseña débil, campos faltantes).

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)


---

### 1.1.4 [Backend] Crear pruebas unitarias para el endpoint de registro de paciente

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de registro de paciente mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `POST /api/auth/register/patient` que cubran:
  - Registro exitoso con datos válidos.
  - Error por email duplicado.
  - Error por contraseña débil.
  - Error por campos faltantes o inválidos.
  - Validación de almacenamiento seguro de la contraseña (hash).
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha) y mocks para dependencias externas.

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
-

### 1.2 Registro de médico especialista

#### Historias de usuario

**ID:** REG-MED-01  
**Título:** Registro de médico especialista  
**Descripción:**  
Como visitante, quiero registrarme como médico especialista proporcionando mi nombre, correo electrónico, contraseña segura y número de cédula profesional, para poder ofrecer mis servicios y gestionar mi agenda en la plataforma.

#### Tickets Backend

##### 1.2.1 [Backend] Crear endpoint de registro de médico especialista

**Descripción detallada:**  
Diseñar y desarrollar el endpoint REST (`POST /api/auth/register/doctor`) que permita registrar un nuevo médico especialista. Debe validar los campos requeridos, almacenar la contraseña como hash y crear las entidades USER y DOCTOR en la base de datos, incluyendo el campo obligatorio `license_number`.

**Dependencias:**  
- Ninguna (primer paso del flujo de registro de médico).

**Etiquetas:**  
Backend, API REST, Validación, Seguridad

**Criterios de aceptación:**  
- [ ] El endpoint recibe los campos: nombre, apellido, email, contraseña, confirmación de contraseña, tipo de usuario (médico), license_number.
- [ ] El email es único y no se repite en la base de datos.
- [ ] El license_number es obligatorio y único para cada médico.
- [ ] La contraseña cumple con los requisitos de seguridad (mínimo 8 caracteres, al menos un número, un carácter especial y una letra mayúscula).
- [ ] La contraseña y su confirmación coinciden.
- [ ] La contraseña se almacena como hash usando bcryptjs.
- [ ] Se crea el registro en las tablas USER y DOCTOR.
- [ ] El endpoint responde siguiendo el formato estándar de la API.
- [ ] Se incluyen pruebas unitarias para validaciones y casos de error.

**Estimación de tiempo:**  
3 horas

---

##### 1.2.2 [Backend] Validaciones y mensajes de error

**Descripción detallada:**  
Implementar validaciones de datos y mensajes de error (inglés por defecto) en el endpoint de registro de médico especialista.

**Dependencias:**  
- Depende de la creación del endpoint de registro.

**Etiquetas:**  
Backend, Validación

**Criterios de aceptación:**  
- [ ] Todos los errores de validación se devuelven en inglés y en el formato estándar de la API.
- [ ] Los mensajes de error son claros y específicos (ejemplo: "Email already exists", "License number required", "Password too weak").
- [ ] Se incluyen pruebas unitarias para los mensajes de error.

**Estimación de tiempo:**  
1 hora

##### 1.2.3 [Backend] Documentar el endpoint de registro de médico especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de registro de médico especialista para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/auth/register/doctor` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Campos requeridos: nombre, apellido, email, contraseña, confirmación de contraseña, tipo de usuario (médico), license_number.
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (id, nombre, email, license_number, fecha de registro).
  - Posibles errores y mensajes de validación (email duplicado, license_number faltante o duplicado, contraseña débil, campos faltantes).

**Criterios de aceptación:**  
- La documentación está disponible y accesible para el equipo.
- Incluye ejemplos claros de uso y respuesta.
- Los parámetros y mensajes de error están descritos.
- **Pruebas de validación:**  
  - Revisar la documentación y verificar que cubre todos los aspectos funcionales del endpoint.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Documentación  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Actualizar la documentación si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

---

##### 1.2.4 [Backend] Crear pruebas unitarias para el endpoint de registro de médico especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de registro de médico especialista mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `POST /api/auth/register/doctor` que cubran:
  - Registro exitoso con datos válidos.
  - Error por email duplicado.
  - Error por license_number faltante o duplicado.
  - Error por contraseña débil.
  - Error por campos faltantes o inválidos.
  - Validación de almacenamiento seguro de la contraseña (hash).
Utilizar el framework de pruebas definido en el backend (por ejemplo, Jest o Mocha) y mocks para dependencias externas.

**Criterios de aceptación:**  
- Las pruebas unitarias cubren los casos principales y errores del endpoint.
- Todas las pruebas pasan correctamente en el entorno de desarrollo.
- Las pruebas pueden ejecutarse automáticamente.
- **Pruebas de validación:**  
  - Ejecutar el comando de pruebas y verificar que todas pasan.

**Prioridad:**  
Alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Tarea Técnica  
- Característica del producto: Backend, Pruebas Unitarias

**Comentarios y Notas:**  
Actualizar las pruebas si el endpoint cambia en futuras iteraciones.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

---
