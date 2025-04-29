## 3. Feature 3: Portal de Empleo y Proceso de Aplicación (Prioridad: Muy Alta)

### 3.1. Objetivos de Prueba

* Validar que el portal público muestra únicamente las vacantes publicadas y la información correcta.
* Verificar que el formulario de aplicación funciona correctamente, incluyendo la carga de CVs (PDF, DOCX) y las validaciones de cliente.
* Asegurar que el backend recibe, procesa y almacena correctamente las nuevas candidaturas y los archivos CV.
* Confirmar que la recepción de una candidatura desencadena correctamente los procesos posteriores (gestión de `CandidatoIA` e invocación de evaluación IA en Core AI).

### 3.2. User Stories Cubiertas

* [US-09: Visualizar Lista de Vacantes Públicas](./us/us-09-visualizar-lista-vacantes.md)
* [US-10: Aplicar a una Vacante](./us/us-10-aplicar-vacante.md)
* [US-11: Recepcionar y Almacenar Nueva Candidatura](./us/us-11-recepcionar-almacenar-candidatura.md)

### 3.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales:**
    * **UI (Frontend - TK-038, TK-040, TK-041):**
        * **Portal (US-09):** Acceder a la URL pública. Verificar que solo se listan vacantes con estado 'PUBLICADA'. Comprobar que se muestra título y ubicación. Verificar que el enlace "Aplicar" dirige al formulario correcto pasando el ID de la vacante. Probar con 0 vacantes publicadas (mensaje adecuado).
        * **Formulario Aplicación (US-10):** Verificar que se muestra el título de la vacante correcta. Probar la introducción de datos en todos los campos (nombre, email, teléfono opcional). Validar campos obligatorios (nombre, email). Validar formato de email. Probar la carga de archivos CV (PDF y DOCX válidos). Probar la carga de archivos con extensiones no permitidas (esperar error de validación cliente). Probar checkbox GDPR (si aplica). Probar botón "Enviar Aplicación". Verificar mensaje de éxito tras envío correcto y mensaje de error en caso de fallo (validación o API).
    * **API (Backend - TK-036, TK-042):**
        * Probar `GET /api/v1/jobs?status=PUBLISHED` (o ruta pública) sin autenticación. Verificar que devuelve solo vacantes publicadas y los campos mínimos necesarios.
        * Probar `POST /api/v1/applications` (multipart/form-data) con:
            * Datos válidos y CV PDF/DOCX (esperar 201 Created).
            * Datos inválidos (campos obligatorios vacíos, email mal formado) (esperar 400).
            * Archivo CV con tipo no permitido (esperar 400).
            * Sin archivo CV (esperar 400).
            * ID de vacante inexistente (esperar 400/404).
* **Pruebas de Integración:**
    * **Flujo Completo:** Simular el flujo completo: un candidato visita el portal, selecciona una vacante, completa y envía el formulario, el backend recibe la petición, almacena el CV, crea/actualiza `Candidato`, crea `ArchivoCandidato` y `Candidatura` en BBDD ATS, y desencadena las llamadas a Core AI (US-018, US-019 - TK-045). Verificar que todos los pasos se completan y los datos se registran correctamente en la BBDD del ATS. Verificar que el frontend muestra el mensaje de éxito.
* **Pruebas de Seguridad:**
    * Verificar que el endpoint de listado público (TK-036) no expone información sensible ni vacantes no publicadas.
    * Verificar que el endpoint de recepción de candidaturas (TK-042) valida tipos de archivo y maneja la subida de forma segura para prevenir vulnerabilidades (TK-043).
* **Pruebas de Usabilidad (TK-038, TK-040):** Evaluar la facilidad para encontrar vacantes y completar el proceso de aplicación desde la perspectiva de un candidato externo.
* **Pruebas Unitarias (TK-037, TK-044):** Responsabilidad del desarrollador verificar la lógica de filtrado de vacantes, procesamiento de aplicación, almacenamiento de archivos e interacciones con BBDD.

### 3.4. Datos de Prueba Necesarios

* Vacantes en estado 'BORRADOR', 'PUBLICADA', 'CERRADA'.
* CVs de prueba en formato PDF y DOCX.
* Archivos de prueba con extensiones no permitidas (ej. .txt, .exe, .jpg).
* Datos de candidatos de prueba (nombres, emails válidos e inválidos).

### 3.5. Priorización Interna

* Todas las User Stories (US-09, US-10, US-11) son "Must Have" y forman un flujo interdependiente que debe probarse de forma integral.

---