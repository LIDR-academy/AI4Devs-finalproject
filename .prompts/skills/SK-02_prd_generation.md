Actúa como un Senior Product Manager y Arquitecto de Software experto en metodologías ágiles, Spec-Driven Development (SDD) y Domain-Driven Design (DDD). Su especialidad es traducir descripciones de alcance o flujos de Happy Path en Documentos de Requisitos de Producto (PRD) de alta fidelidad, diseñados específicamente para actuar como una "especificación ejecutable" que un agente de codificación autónomo pueda implementar sin desviaciones lógicas.

Analiza el siguiente documento de entrada que describe el alcance y flujo principal del MVP:
[RUTA_DE_IDEA_INICIAL]

Tu objetivo es procesar este insumo y generar un PRD estructurado bajo la versión 1.1.0 (Aprobado para Desarrollo). Debes ser riguroso, explícito y no asumir nada que no esté estrictamente justificado por el negocio. Sigue exactamente la siguiente estructura estándar de salida en Markdown limpio:

---

# 📝 Documento de Requisitos de Producto (PRD): [Nombre del Sistema]

## 🎯 1. Descripción General del Producto

### 1.1. Problemática de Negocio
- Describe el dolor real de negocio, las ineficiencias o las pérdidas financieras del usuario sin prescribir tecnologías, bases de datos o Inteligencia Artificial. Concéntrate en la ineficiencia operativa y el impacto directo en el negocio.

### 1.2. Propuesta de Solución (MVP)
- Define el propósito central de la solución y explica cómo el software resolverá el problema planteado, delimitándolo estrictamente al flujo principal descrito en el insumo.

### 1.3. Objetivos de Negocio y KPIs (Métricas de Éxito)
- Detalla de 2 a 3 indicadores clave de rendimiento (KPIs) cuantitativos que reflejen éxito operativo (ej. reducción de tiempos de proceso, incremento de conversión, tasa de retención de valor). No utilices métricas técnicas de código o infraestructura en esta sección.

---

## 👥 2. Definición de Usuarios (User Personas)
Identifica al menos dos perfiles o roles clave que interactuarán con el sistema (ej. Administrador / Operario de Línea):
- **Contexto operativo:** Dónde y cómo interactúa el usuario (ej. alta transaccionalidad, estrés físico, escritorio o tablet).
- **Necesidades específicas:** Frustraciones de su día a día y qué valor obtiene del sistema.
- **Identificación y Permisos:** Define de forma clara el mecanismo de autenticación del usuario (ej. PIN rápido para entornos ágiles o login tradicional) y restringe rigurosamente los permisos de escritura/auditoría por rol para proteger la integridad de los datos.

---

## 🧭 3. Flujo End-to-End Prioritario

### 3.1. Happy Path: Secuencia de Pasos
- Describe detalladamente la secuencia lógica y numerada (Paso 1, Paso 2...) del flujo ideal de extremo a extremo que el usuario recorre para obtener valor, reflejando el Happy Path provisto en el insumo.

### 3.2. Flujos Alternativos y Manejo de Errores (Edge Cases)
Debes prever y detallar el comportamiento del sistema ante fallos para evitar que la IA improvise la lógica. Incluye de forma obligatoria especificaciones de comportamiento para:
- **Validaciones de Entrada de Datos:** Cómo reacciona el sistema ante campos vacíos, inválidos o transacciones que dejen saldos lógicos negativos.
- **Fallas de Conectividad o Red:** Mecanismos de resiliencia transaccional (ej. almacenamiento local/diferido) en el cliente si se interrumpe la conexión de red.
- **Políticas de Vencimiento o Caducidad Dinámica:** Cómo maneja el sistema la alteración o caducidad del estado de las entidades de negocio.

---

## 🛑 4. Límites del Sistema y "Non-Goals" (Fuera de Alcance)
- Lista explícitamente de 3 a 5 características, módulos complejos, automatizaciones avanzadas o integraciones externas que NO se construirán en esta iteración. Esto actúa como salvaguarda innegociable contra el "scope creep" (deriva de alcance) e impide que los agentes de codificación asuman lógica o inventen endpoints fuera del happy path.

---

## 📋 5. Backlog de Historias de Usuario (INVEST)
Traduce el flujo del MVP en historias de usuario independientes y estimables. Cada historia de usuario debe seguir estrictamente este formato:

### [ID-US-XX]: [Título de la Historia]
*   **Historia:** "Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]".
*   **Complejidad:** S / M / L (Estimación de esfuerzo relativo).
*   **Evaluación INVEST:** Justifica brevemente por qué la historia cumple con los criterios: Independiente, Negociable, Valiosa, Estimable, Pequeña (Small) y Testeable.
*   **Criterios de Aceptación (BDD - Sintaxis Gherkin):** Proporciona de 2 a 3 escenarios detallados empleando la estructura:
    *   **Escenario:** [Descripción del caso de uso]
        *   **Given (Dado que)** [Contexto inicial del sistema o estado de datos]
        *   **When (Cuando)** [Acción exacta realizada por el usuario]
        *   **Then (Entonces)** [Resultado medible y observable esperado]

---

## 🛡️ 6. Estrategia de Calidad y Verificación (QA/Testing)
- Especifica la política de desarrollo **Test-First (TDD con IA)**. 
- Prohibe explícitamente que la IA genere de forma simultánea el código y los tests correspondientes para mitigar el riesgo de "Test Theater" (validación circular o autoconfirmación de alucinaciones).
- Establece la regla innegociable de que el humano o un oráculo determinista define o revisa el test (el "qué") y la IA implementa el código mínimo para hacerlo pasar a verde (el "cómo").
- Clasifica las pruebas mínimas requeridas:
  1. **Unitarias:** Pruebas de lógica inmutable de negocio (reglas de dominio y validadores puros sin llamadas de red o persistencia).
  2. **Integración:** Pruebas sobre llamadas HTTP y transacciones utilizando una base de datos real o simulada para verificar estados y respuestas REST.
  3. **End-to-End (E2E):** Un escenario completo con automatización de navegador que replique el Happy Path prioritario del usuario.

---

Genera tu respuesta con un tono directo, estructurado y profesional, comenzando directamente con el título del PRD en formato Markdown, con indice.

Guarda el archivo en: [RUTA_DE_SALIDA_PRD]
