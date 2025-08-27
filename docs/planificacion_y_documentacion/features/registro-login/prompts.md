Eres un experto en Ingenieria de Prompts, en analisis de negocio y levantamiento de requerimientos
# Contexto Inicial
Actualmente se tienen definido el MVP para un sistema de búsqueda de especialidades médicas y profesionales de la salud, sin embargo no se tiene definido el registro y acceso para pacientes y medicos especialistas

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a generar las historias de usuario para el registro de pacientes/medicos, así como el login de acceso a la plataforma cumpliendo con los siguientes requerimientos

# Requerimientos
- Las historias de usuario y tickets de trabajo van a ser tanto para pacientes y medicos especialistas
- Considerar tickets tanto para el Backend como para el Frontend
- Considerar las siguientes validaciones para el registro
    - General:
        - el nombre de usuario es el email, tanto para pacientes como medicos
        - el nombre de usuario es unico e irrepetible
        - la contraseña tiene que tener al menos 8 caracteres, con al menos: un numero, un caracter especial y una letra mayuscula
        - Se debe confirmar la contraseña, para ello se deben usar dos campos de entrada lo cuales su valor tiene que coincidir
        - desde un inicio se pregunta si el registro es para un paciente o un medico
        - las contraseñas se guardan como hashes
        - considerar los campos minimos para el registro: nombre, email, password y tipo de usuario: paciente|medico
    - Medico:
        - Si el visitante se registra como medico es obligatorio el "license_number" para completar el registro
- Considerar las siguientes validaciones pra el login
    - desde un inicio se pregunta si el inicio de sesión es como paciente o como medico
    - los campos minimos para el inicio de sesion son: email y contraseña
- Por el momento el registro y login no tendran acceso mediante google y outlook
- Incluir criterios de aceptacion y tiempo estimado de cada ticket

# Consideraciones
- El Chatbot tendra acceso a los siguientes documentos:
    - modelo de datos del sistema
    - arquitectura de alto nivel
    - el product requirement document (PRD)
- El Chatbot tendrá que consultar los documentos ya mencionados para generar las historias de usurio y tickets de trabajo
- Utilizar los ejemplos de Historias de usuario y Tickets para generar el contenido

## Ejemplos de Historias de usuario
```markdown
## 6. Tickets Buscar especialistas por especialidad y ubicación [US-1]

**Historia de usuario relacionada:**  
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.
```
## Ejemplo de Ticket de trabajo
```markdown
### 6.1 [Backend] Diseñar el endpoint de búsqueda de especialistas por especialidad y ubicación (ciudad y estado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los visitantes buscar especialistas médicos filtrando por especialidad, ciudad y estado, cumpliendo los criterios del Product Backlog y modelo de datos.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctors/search`) que acepte los siguientes parámetros de consulta:
  - `specialty_id` (ID de la especialidad)
  - `city_id` (ID de la ciudad)
  - `state_id` (ID del estado)
El endpoint debe estar accesible sin autenticación y retornar información básica del especialista y su ubicación general.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros de consulta permiten filtrar por especialidad, ciudad y estado.
- El endpoint está accesible para usuarios no autenticados.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de búsqueda de especialistas.
```

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot
- el prompt debe guiar como dividir historias grandes en tickets mas pequeños

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para Chatbot: Generación de Historias de Usuario y Tickets para Registro y Login de Pacientes y Médicos

## Rol del chatbot
Actúa como experto en análisis de negocio y levantamiento de requerimientos.

## Objetivo
Generar historias de usuario y tickets de trabajo para el registro y acceso (login) de pacientes y médicos especialistas en el sistema de búsqueda de especialidades médicas, considerando tanto el Backend como el Frontend, siguiendo la arquitectura hexagonal y las convenciones del proyecto.

## Instrucciones para el chatbot

1. **Consulta de documentos de contexto**
   - Revisa y extrae información relevante de los siguientes documentos:
     - `docs/product_requirement_document.md` (PRD)
     - `docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md` (Modelo de datos)
     - `docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md` (Arquitectura)
     - `docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md` (Casos de uso)

2. **Generación de historias de usuario**
   - Crea historias de usuario para el registro y login de pacientes y médicos especialistas.
   - Incluye historias separadas para cada rol (paciente y médico).
   - Asegúrate de que cada historia tenga un título, ID, descripción y esté alineada con los requerimientos funcionales y de seguridad.

3. **División en tickets de trabajo**
   - Divide cada historia de usuario en tickets de trabajo específicos para Backend y Frontend.
   - Enlista los tickets, indicando dependencias entre ellos (por ejemplo, el backend debe estar listo antes que el frontend).
   - Incluye etiquetas sugeridas (Backend, Frontend, Validación, Seguridad, Internacionalización, etc.).

4. **Validaciones y requisitos**
   - Para el registro:
     - El nombre de usuario es el email, único e irrepetible.
     - Contraseña: mínimo 8 caracteres, al menos un número, un carácter especial y una letra mayúscula.
     - Confirmación de contraseña (dos campos coincidentes).
     - Selección de tipo de usuario (paciente o médico) desde el inicio.
     - Contraseñas almacenadas como hashes.
     - Campos mínimos: nombre, email, password, tipo de usuario.
     - Para médicos: campo obligatorio `license_number`.
   - Para el login:
     - Selección de tipo de usuario (paciente o médico) desde el inicio.
     - Campos mínimos: email y contraseña.
   - No incluir acceso mediante Google u Outlook por el momento.

5. **Criterios de aceptación**
   - Documenta los criterios de aceptación para cada ticket como lista de chequeo, siguiendo los ejemplos proporcionados.

6. **Estimación de tiempo**
   - Incluye la estimación de tiempo total por ticket.

7. **Estructura sugerida para el archivo Markdown**
   - Índice de historias de usuario y tickets.
   - Secciones separadas para registro y login.
   - Subdivisión por tipo de usuario (paciente, médico).
   - Tickets agrupados por Backend y Frontend.
   - Dependencias claramente indicadas.
   - Etiquetas y criterios de aceptación en cada ticket.

8. **Mejores prácticas**
   - Guía sobre cómo dividir historias grandes en tickets más pequeños y manejables.
   - Mantén la lógica de negocio fuera de los controladores y adáptala en servicios de dominio.
   - Sigue los patrones hexagonales y las convenciones de internacionalización y seguridad del proyecto.

## Ejemplos de Historias de usuario
```markdown
## 6. Tickets Buscar especialistas por especialidad y ubicación [US-1]

**Historia de usuario relacionada:**  
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.
```
## Ejemplo de Ticket de trabajo
```markdown
### 6.1 [Backend] Diseñar el endpoint de búsqueda de especialistas por especialidad y ubicación (ciudad y estado)

**Descripción detallada:**  
- **Propósito:**  
Definir la estructura y parámetros del endpoint que permitirá a los visitantes buscar especialistas médicos filtrando por especialidad, ciudad y estado, cumpliendo los criterios del Product Backlog y modelo de datos.
- **Detalle específico:**  
Diseñar el endpoint REST (por ejemplo, `GET /api/doctors/search`) que acepte los siguientes parámetros de consulta:
  - `specialty_id` (ID de la especialidad)
  - `city_id` (ID de la ciudad)
  - `state_id` (ID del estado)
El endpoint debe estar accesible sin autenticación y retornar información básica del especialista y su ubicación general.

**Criterios de aceptación:**  
- El endpoint está definido y documentado en el backend.
- Los parámetros de consulta permiten filtrar por especialidad, ciudad y estado.
- El endpoint está accesible para usuarios no autenticados.
- **Pruebas de validación:**  
  - Revisar la definición del endpoint y sus parámetros en el código y documentación.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
1 hora

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Backend, API REST, Documentación

**Comentarios y Notas:**  
Asegurarse de que el endpoint cumpla con los criterios de aceptación del Product Backlog y modelo de datos.

**Enlaces o Referencias:**  
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Product Requirement Document](docs/product_requirement_document.md)

**Historial de cambios:**  
- [14/08/2025] [GitHub Copilot] Ticket creado para diseño de endpoint de búsqueda de especialistas.
```

## Formato de salida
- El resultado debe ser un archivo en formato Markdown (.md).
- Utiliza la estructura sugerida y los ejemplos proporcionados para historias de usuario y tickets.
- Presenta los criterios de aceptación como listas de chequeo.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.