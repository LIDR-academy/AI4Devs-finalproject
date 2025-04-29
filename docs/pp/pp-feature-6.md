## 7. Feature 6: Sistema de Feedback para IA (Prioridad: Media)

### 7.1. Objetivos de Prueba

* Verificar que los usuarios pueden proporcionar feedback básico (ej. pulgar arriba/abajo) sobre las evaluaciones IA en la interfaz del ATS.
* (Should Have) Verificar que los usuarios pueden proporcionar feedback detallado (ajuste de score, validación de skills, comentarios) si se implementa.
* Asegurar que el feedback capturado en el ATS se envía correctamente a Core AI a través de la API interna.
* Validar que Core AI recibe y almacena correctamente el feedback en su base de datos para futuro aprendizaje.

### 7.2. User Stories Cubiertas

* **Must Have:**
    * [US-37: Capturar Feedback Básico sobre Evaluación IA](./us/us-37-capturar-feedback-basico-evaluacion-ia.md)
    * [US-38: Enviar Feedback Capturado a Core AI](./us/us-38-enviar-feedback-capturado-core-ai.md)
    * [US-39: Recibir y Almacenar Feedback de Usuario (Capacidad Core AI)](./us/us-39-recibir-almacenar-feedback-usuario-core-ai.md)
* **Should Have:**
    * [US-40: Capturar Feedback Detallado sobre Evaluación IA](./us/us-40-capturar-feedback-detallado-evaluacion-ia.md)

### 7.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales:**
    * **UI (Frontend - TK-125, TK-126, TK-137, TK-138):**
        * **Feedback Básico (US-037):** Probar la interacción con los controles 👍/👎. Verificar que el estado se actualiza y se prepara el envío.
        * **Feedback Detallado (US-040 - Should Have):** Probar los controles para ajustar score, validar/invalidar skills (verificar que se muestren las skills detectadas por IA - requiere TK-140), y añadir comentarios. Verificar que el estado y el payload se construyen correctamente.
    * **API (Backend ATS/Core AI - TK-131, TK-134):**
        * Probar el endpoint ATS (`POST /feedback` - TK-131) enviando diferentes tipos de feedback (básico, detallado). Verificar validaciones y respuesta.
        * Probar directamente el endpoint Core AI para recibir feedback (TK-134), simulando la llamada desde ATS. Verificar que acepta la estructura de datos definida (especialmente el JSON en `datos_feedback` para US-040).
* **Pruebas de Integración:**
    * **Flujo Completo (FE -> ATS -> Core AI -> Core AI DB):** Realizar la acción de feedback en la UI, verificar que la llamada FE -> ATS y ATS -> Core AI se realizan, y finalmente **confirmar que el registro correcto se crea en la tabla `registros_feedback_ia`** en la BBDD de Core AI (TK-135, TK-136). Probar con feedback básico y detallado.
* **Pruebas de Usabilidad (TK-125, TK-137):** Evaluar si los controles de feedback son claros, fáciles de encontrar y de usar.
* **Pruebas Unitarias (TK-132, TK-136, TK-140):** Responsabilidad del desarrollador (lógica de envío, validación y almacenamiento de feedback).

### 7.4. Datos de Prueba Necesarios

* Candidaturas que ya tengan una evaluación IA realizada (con score, etapa sugerida, y opcionalmente skills detectadas si se prueba US-040).
* Usuarios (Reclutador/Manager) para realizar la acción de feedback.

### 7.5. Priorización Interna

1.  **Feedback Básico (US-037):** Interfaz mínima viable.
2.  **Envío y Almacenamiento (US-038, US-039):** Asegurar que el feedback básico llega y se guarda.
3.  **Feedback Detallado (US-040):** Menor prioridad (Should Have), dependiente de que Core AI devuelva skills (TK-139/TK-140).

---