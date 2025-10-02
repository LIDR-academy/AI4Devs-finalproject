### 1.1 Registro de paciente

#### Historias de usuario

**ID:** REG-PAC-01  
**Título:** Registro de paciente  
**Descripción:**  
Como visitante, quiero registrarme como paciente proporcionando mi nombre, correo electrónico y contraseña segura, para poder agendar citas y gestionar mi perfil en la plataforma.

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
- [ ] El Toogle de registro como medico se encuentra en estado "No" 
- [ ] El Toogle de registro como medico al estar desactivado oculta el campo de "Cedula profesional"
- [ ] Los titulos y labels de la vista se encuentran internacionalizados

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
- [ ] El endpoint para el registro de un paciente es `POST /api/auth/register/patient`
- [ ] Para que un paciente se pueda registrar el Toggle "Registrarme como médico" debe estar desactivado
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito al usuario tras registro exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El usuario es redirigido al login tras registro exitoso.
- [ ] Los campos obligatorios y opcionales en el formulario deben coincidir con los definidos en el API del endpoint

**Estimación de tiempo:**  
1 hora


### 1.2 Registro de médico especialista

#### Historias de usuario

**ID:** REG-MED-01  
**Título:** Registro de médico especialista  
**Descripción:**  
Como visitante, quiero registrarme como médico especialista proporcionando mi nombre, correo electrónico, contraseña segura y número de cédula profesional, para poder ofrecer mis servicios y gestionar mi agenda en la plataforma.

##### 1.2.5 [Frontend] Crear formulario de registro de médico especialista

**Descripción detallada:**  
Diseñar el formulario de registro de médico especialista en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: nombre, apellido, email, contraseña, confirmación de contraseña, selección de tipo de usuario (médico) y license_number.

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye todos los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "Registrarme como médico".
- [ ] El campo license_number es obligatorio y validado en frontend.
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de registro está deshabilitado hasta que todos los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.

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

**Estimación de tiempo:**  
1 hora