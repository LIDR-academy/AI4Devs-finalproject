# Historias de usuario y tickets de trabajo: Registro y Login

## Índice

1. Registro de usuarios
   1.1 Registro de paciente
      - Historias de usuario
      - Tickets Backend
      - Tickets Frontend
   1.2 Registro de médico especialista
      - Historias de usuario
      - Tickets Backend
      - Tickets Frontend
2. Login de usuarios
   2.1 Login de paciente
      - Historias de usuario
      - Tickets Backend
      - Tickets Frontend
   2.2 Login de médico especialista
      - Historias de usuario
      - Tickets Backend
      - Tickets Frontend
3. Guía de mejores prácticas

---

## 1. Registro de usuarios

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

---

#### Tickets Frontend

##### 1.1.5 [Frontend] Crear formulario de registro de paciente

**Descripción detallada:**  
Diseñar el formulario de registro de paciente en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: nombre, apellido, email, contraseña, confirmación de contraseña y selección de tipo de usuario (paciente).

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye todos los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "Paciente".
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de registro está deshabilitado hasta que todos los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.
- [ ] Se muestran mensajes de error del backend en el idioma seleccionado.
- [ ] Se incluyen pruebas unitarias/mocks de validación de formulario.

**Estimación de tiempo:**  
2 horas

---

##### 1.1.6 [Frontend] Integrar consumo del endpoint de registro y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de registro, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de registro y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**  
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito al usuario tras registro exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El usuario es redirigido al login tras registro exitoso.
- [ ] Se incluyen pruebas unitarias/mocks de integración.

**Estimación de tiempo:**  
1 hora


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

#### Tickets Frontend

##### 1.2.5 [Frontend] Crear formulario de registro de médico especialista

**Descripción detallada:**  
Diseñar el formulario de registro de médico especialista en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: nombre, apellido, email, contraseña, confirmación de contraseña, selección de tipo de usuario (médico) y license_number.

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye todos los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "Médico especialista".
- [ ] El campo license_number es obligatorio y validado en frontend.
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de registro está deshabilitado hasta que todos los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.
- [ ] Se muestran mensajes de error del backend en el idioma seleccionado.
- [ ] Se incluyen pruebas unitarias/mocks de validación de formulario.

**Estimación de tiempo:**  
2 horas

---

##### 1.2.6 [Frontend] Integrar consumo del endpoint de registro y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de registro, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de registro y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**  
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito al usuario tras registro exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El usuario es redirigido al login tras registro exitoso.
- [ ] Se incluyen pruebas unitarias/mocks de integración.

**Estimación de tiempo:**  
1 hora

---

## 2. Login de usuarios

### 2.1 Login de paciente

#### Historias de usuario

**ID:** LOGIN-PAC-01  
**Título:** Login de paciente  
**Descripción:**  
Como paciente registrado, quiero iniciar sesión con mi correo electrónico y contraseña, para acceder a mi perfil, agendar citas y recibir notificaciones.

#### Tickets Backend

##### 2.1.1 [Backend] Crear endpoint de login para paciente

**Descripción detallada:**  
Diseñar y desarrollar el endpoint REST (`POST /api/auth/login/patient`) que permita a los pacientes autenticarse con email y contraseña. Debe validar credenciales, generar y devolver un JWT, y responder en el formato estándar de la API.

**Dependencias:**  
- Requiere que el registro de paciente esté implementado.

**Etiquetas:**  
Backend, API REST, Seguridad, Validación

**Criterios de aceptación:**  
- [ ] El endpoint recibe los campos: email y contraseña.
- [ ] Valida que el email exista y la contraseña coincida (usando bcryptjs).
- [ ] Devuelve un JWT válido en la respuesta.
- [ ] El endpoint responde siguiendo el formato estándar de la API.
- [ ] Los errores de autenticación se devuelven en inglés y en el formato estándar.
- [ ] Se incluyen pruebas unitarias/mocks para casos de éxito y error.

**Estimación de tiempo:**  
2 horas

---

##### 2.1.2 [Backend] Validaciones y mensajes de error 

**Descripción detallada:**  
Implementar mensajes de error (inglés por defecto) para el endpoint de login de paciente.

**Dependencias:**  
- Depende de la creación del endpoint de login.

**Etiquetas:**  
Backend, Validación

**Criterios de aceptación:**  
- [ ] Todos los errores de validación y autenticación se devuelven en inglés.
- [ ] Los mensajes de error son claros y específicos (ejemplo: "Invalid credentials", "User not found").
- [ ] Se incluyen pruebas unitarias/mocks para los mensajes de error.

**Estimación de tiempo:**  
1 hora

##### 2.1.3 [Backend] Documentar el endpoint de login para paciente

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de login de paciente para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/auth/login/patient` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Campos requeridos: email, contraseña, tipo de usuario (paciente).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (JWT, id, nombre, email).
  - Posibles errores y mensajes de validación (credenciales inválidas, usuario no encontrado, campos faltantes).

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

##### 2.1.4 [Backend] Crear pruebas unitarias para el endpoint de login de paciente

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de login de paciente mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `POST /api/auth/login/patient` que cubran:
  - Login exitoso con credenciales válidas.
  - Error por usuario no encontrado.
  - Error por contraseña incorrecta.
  - Error por campos faltantes o inválidos.
  - Validación de generación y formato del JWT.
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

#### Tickets Frontend

##### 2.1.5 [Frontend] Crear formulario de login de paciente

**Descripción detallada:**  
Diseñar el formulario de login de paciente en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: email, contraseña y selección de tipo de usuario (paciente).

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "Paciente".
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de login está deshabilitado hasta que los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.
- [ ] Se muestran mensajes de error del backend en el idioma seleccionado.
- [ ] Se incluyen pruebas unitarias/mocks de validación de formulario.

**Estimación de tiempo:**  
1 hora

---

##### 2.1.6 [Frontend] Integrar consumo del endpoint de login y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de login, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de login y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**  
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito y el usuario es redirigido al portal de paciente tras login exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El JWT se almacena de forma segura en frontend.
- [ ] Se incluyen pruebas unitarias/mocks de integración.

**Estimación de tiempo:**  
1 hora

### 2.2 Login de médico especialista

#### Historias de usuario

**ID:** LOGIN-MED-01  
**Título:** Login de médico especialista  
**Descripción:**  
Como médico especialista registrado, quiero iniciar sesión con mi correo electrónico y contraseña, para gestionar mi perfil, agenda y recibir notificaciones.

#### Tickets Backend

##### 2.2.1 [Backend] Crear endpoint de login para médico especialista

**Descripción detallada:**  
Diseñar y desarrollar el endpoint REST (`POST /api/auth/login/doctor`) que permita a los médicos especialistas autenticarse con email y contraseña. Debe validar credenciales, generar y devolver un JWT, y responder en el formato estándar de la API.

**Dependencias:**  
- Requiere que el registro de médico especialista esté implementado.

**Etiquetas:**  
Backend, API REST, Seguridad, Validación

**Criterios de aceptación:**  
- [ ] El endpoint recibe los campos: email y contraseña.
- [ ] Valida que el email exista y la contraseña coincida (usando bcryptjs).
- [ ] Devuelve un JWT válido en la respuesta.
- [ ] El endpoint responde siguiendo el formato estándar de la API.
- [ ] Los errores de autenticación se devuelven en inglés y en el formato estándar.
- [ ] Se incluyen pruebas unitarias/mocks para casos de éxito y error.

**Estimación de tiempo:**  
2 horas

---

##### 2.2.2 [Backend] Validaciones y mensajes de error

**Descripción detallada:**  
Implementar mensajes de error (inglés por defecto) para el endpoint de login de médico especialista.

**Dependencias:**  
- Depende de la creación del endpoint de login.

**Etiquetas:**  
Backend, Validación

**Criterios de aceptación:**  
- [ ] Todos los errores de validación y autenticación se devuelven en inglés.
- [ ] Los mensajes de error son claros y específicos (ejemplo: "Invalid credentials", "User not found").
- [ ] Se incluyen pruebas unitarias/mocks para los mensajes de error.

**Estimación de tiempo:**  
1 hora

##### 2.2.3 [Backend] Documentar el endpoint de login para médico especialista

**Descripción detallada:**  
- **Propósito:**  
Facilitar la integración y el mantenimiento del sistema documentando el endpoint de login de médico especialista para que otros desarrolladores y el frontend puedan consumirlo correctamente.
- **Detalle específico:**  
Documentar el endpoint `POST /api/auth/login/doctor` en Swagger o README, incluyendo:
  - Descripción de la funcionalidad.
  - Campos requeridos: email, contraseña, tipo de usuario (médico especialista).
  - Ejemplo de petición y respuesta.
  - Estructura de los datos retornados (JWT, id, nombre, email).
  - Posibles errores y mensajes de validación (credenciales inválidas, usuario no encontrado, campos faltantes).

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

##### 2.2.4 [Backend] Crear pruebas unitarias para el endpoint de login de médico especialista

**Descripción detallada:**  
- **Propósito:**  
Asegurar la calidad y correcto funcionamiento del endpoint de login de médico especialista mediante pruebas unitarias que validen los casos principales y los posibles errores.
- **Detalle específico:**  
Desarrollar pruebas unitarias para el endpoint `POST /api/auth/login/doctor` que cubran:
  - Login exitoso con credenciales válidas.
  - Error por usuario no encontrado.
  - Error por contraseña incorrecta.
  - Error por campos faltantes o inválidos.
  - Validación de generación y formato del JWT.
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

#### Tickets Frontend

##### 2.2.5 [Frontend] Crear formulario de login de médico especialista

**Descripción detallada:**  
Diseñar el formulario de login de médico especialista en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: email, contraseña y selección de tipo de usuario (médico especialista).

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "Médico especialista".
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de login está deshabilitado hasta que los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.
- [ ] Se muestran mensajes de error del backend en el idioma seleccionado.
- [ ] Se incluyen pruebas unitarias/mocks de validación de formulario.

**Estimación de tiempo:**  
1 hora

---

##### 2.2.6 [Frontend] Integrar consumo del endpoint de login y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de login, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de login y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**  
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito y el usuario es redirigido al portal de médico tras login exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El JWT se almacena de forma segura en frontend.
- [ ] Se incluyen pruebas unitarias/mocks de integración.

**Estimación de tiempo:**  
1 hora

---

## 3. Guía de mejores prácticas

### Lógica de negocio en servicios de dominio

- Mantén la lógica de negocio fuera de los controladores (API REST).
- Implementa la lógica en servicios de dominio ubicados en `/src/domain`.
- Los controladores solo deben orquestar la llamada a los casos de uso y manejar la respuesta estándar.

### Patrones hexagonales y convenciones

- Utiliza la arquitectura hexagonal:  
  - Adaptadores de entrada (API REST, controladores) en `/src/adapters/in`.
  - Adaptadores de salida (persistencia, email, storage) en `/src/adapters/out`.
  - Casos de uso en `/src/application`.
  - Entidades y servicios de dominio en `/src/domain`.
- Los endpoints REST deben seguir la estructura `/api/{recurso}` y usar JWT para autenticación.
- Los modelos de datos deben respetar las claves primarias y foráneas según el diagrama Mermaid.

### Internacionalización

- El Backend responde siempre en inglés para facilitar la traducción en el Frontend.
- El Frontend utiliza react-i18next para mostrar mensajes y errores en el idioma seleccionado por el usuario.
- Todos los textos y mensajes deben estar definidos en archivos de localización.

### Seguridad y cumplimiento

- Almacena las contraseñas como hashes usando bcryptjs.
- Utiliza JWT para autenticación y autorización.
- Cumple con la LFPDPPP:  
  - Solicita consentimiento explícito para el tratamiento de datos personales.
  - Permite el ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación y Oposición).
  - Implementa medidas técnicas y organizacionales para proteger los datos.
- No almacenes datos sensibles en el frontend ni en archivos públicos.

### Pruebas unitarias y mocks

- Todas las validaciones y lógica de negocio deben estar cubiertas por pruebas unitarias.
- Utiliza mocks para simular dependencias externas (base de datos, servicios de email, etc.).
- Documenta los casos de prueba y resultados esperados en cada ticket.

---