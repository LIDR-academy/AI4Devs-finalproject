## 4. Feature 2: Asistencia IA para Descripción de Puesto (JD) (Prioridad: Alta)

### 4.1. Objetivos de Prueba

* Verificar el flujo completo de solicitud, generación, recepción y edición de Descripciones de Puesto (JD) asistidas por IA.
* Validar la correcta configuración y almacenamiento de los parámetros de evaluación IA (score de corte, etapas sugeridas) asociados a una vacante.
* Evaluar la calidad y relevancia inicial de las JDs generadas por Core AI.
* Asegurar la correcta integración entre ATS MVP (solicitud, configuración, edición) y Core AI (generación, almacenamiento de parámetros).
* (Should Have) Validar el enriquecimiento opcional de JDs con datos internos.
* Verificar el cumplimiento del NFR de latencia para la generación de JD (RNF-02).

### 4.2. User Stories Cubiertas

* [US-12: Solicitar Generación de Descripción de Puesto (JD) con IA](./us/us-12-solicitar-generacion-jd-con-IA.md)
* [US-13: Configurar Parámetros de Evaluación IA para la Vacante](./us/us-13-configurar-parametros-ia-vacamte.md) (*Nota: Nombre archivo parece tener errata*)
* [US-14: Recibir y Editar Descripción de Puesto (JD) Generada por IA](./us/us-14-recibir-editar-JD-generada-IA.md)
* [US-15: Generar Borrador de JD Usando IA (Capacidad Core AI)](./us/us-15-generar-borrador-JD-IA.md)
* [US-16: Almacenar Parámetros de Evaluación IA Asociados a Vacante (Capacidad Core AI)](./us/us-16-almacenar-parametros-evaluacion-IA-vacante.md)
* [US-17: Enriquecer Generación de JD con Datos Internos (Capacidad Core AI)](./us/us-17-enriquecer-generacion-JD.md) (Should Have)

### 4.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales:**
    * **UI (Frontend - TK-046, TK-047, TK-048, TK-049, TK-052, TK-053, TK-054):**
        * **Generación JD (US-12, US-14):** Probar clic en botón "Generar JD", verificar indicador de carga. Confirmar que la respuesta se carga en el editor RTE. Probar la edición del contenido en el RTE. Verificar que el contenido editado se guarda correctamente al guardar la vacante. Probar el manejo de errores si la generación falla.
        * **Configuración IA (US-13):** Probar los campos de Score de Corte, Etapa Aceptación, Etapa Rechazo. Verificar que los selectores de etapa se poblen correctamente (con etapas marcadas como `seleccionable_ia` desde US-02). Validar input de score (0-100). Verificar que los valores se envían al guardar la vacante.
    * **API (Backend ATS/Core AI - TK-050, TK-055, TK-059):**
        * Probar `PATCH /jobs/{id}` en ATS enviando parámetros IA válidos e inválidos. Verificar validaciones y respuesta.
        * Probar endpoint Core AI para guardar parámetros IA (ej. `PUT /ai/vacancies/{id}/config` - TK-059). Verificar persistencia (TK-060).
        * Probar endpoint Core AI para generar JD (ej. `POST /ai/generate-jd` - TK-055) con diferentes inputs. Verificar la respuesta (JD generada o error).
* **Pruebas de Integración:**
    * **Flujo Generación JD:** FE (TK-047) -> Core AI API (TK-055) -> Core AI Lógica (TK-056, TK-057, TK-058) -> FE (TK-052). Verificar el flujo completo y la correcta visualización/edición/guardado.
    * **Flujo Guardado Params IA:** FE (TK-049) -> ATS API (TK-050) -> ATS Lógica (TK-051) -> Core AI API (TK-059) -> Core AI Lógica (TK-060). Verificar que los parámetros se guardan correctamente en Core AI.
    * **Core AI -> LLM (TK-057):** Verificar la correcta formulación del prompt y el manejo de la respuesta/errores del LLM externo.
    * **(Should Have) Core AI -> Datos Internos (TK-061):** Si se implementa, probar la conexión, consulta y uso de datos internos.
* **Pruebas de Calidad de IA (US-015):**
    * Evaluar cualitativamente la calidad, estructura, coherencia y relevancia de las JDs generadas para diferentes tipos de vacantes (ej. técnica, ventas, administrativa). ¿Sigue las instrucciones del prompt? ¿Es útil como borrador?
* **Pruebas de Rendimiento (RNF-02):** Medir el tiempo desde que se solicita la generación hasta que el texto aparece en el editor. Verificar que cumple el NFR (< 15 segundos para 90%).
* **Pruebas de Seguridad:**
    * Verificar el manejo seguro de la API Key del LLM externo (RNF-11).
    * Asegurar que la configuración de parámetros IA está protegida por la autenticación/autorización del ATS MVP.
* **Pruebas Unitarias (TK-051, TK-056, TK-057, TK-058, TK-060, TK-061):** Responsabilidad del desarrollador (lógica de prompt, llamada LLM, guardado BBDD, etc.).

### 4.4. Datos de Prueba Necesarios

* Vacantes existentes en estado 'Borrador' para editar.
* Datos básicos para crear nuevas vacantes (títulos variados, requisitos clave).
* Etapas del pipeline configuradas, con algunas marcadas como `seleccionable_ia`.
* Criterios cualitativos para evaluar las JDs generadas.
* (Should Have) Acceso a datos internos de prueba si se implementa US-17/TK-061.

### 4.5. Priorización Interna

1.  **Configuración y Guardado Params IA (US-13, US-16):** Esencial para la Feature 4.
2.  **Flujo Básico Generación/Edición (US-12, US-14, US-15):** Funcionalidad central de la feature.
3.  **Calidad Generación JD / Rendimiento:** Validar el valor aportado por la IA.
4.  **Enriquecimiento con Datos Internos (US-17):** Menor prioridad (Should Have).

---