# prompts.md — ChatBot Self-Improvement System

Documentación de los prompts más relevantes utilizados durante el desarrollo del proyecto, organizados por fase del SDLC.

---

## 1. Producto y Definición

### Prompt 1.1 — Definición del concepto del sistema

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Necesito definir mi TFM del máster AI4Devs. La idea es un sistema que permita mejorar automáticamente un chatbot basándose en el feedback de un administrador humano. El sistema debe tener un "meta-agente" que analice el feedback, identifique si el problema viene del prompt del bot o de factores externos, y proponga mejoras. Ayúdame a definir el MVP, el alcance, y el concepto académico central.
```

**Nota:** Este prompt inicial sirvió para acotar el alcance del MVP y definir el concepto de "meta-aprendizaje human-in-the-loop". La clave fue delimitar explícitamente lo que estaba dentro y fuera del alcance (solo mejora de prompts, no workflows).

---

### Prompt 1.2 — Generación del Lean Canvas

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Basándome en el concepto del ChatBot Self-Improvement System, genera un Lean Canvas completo con los 9 bloques: problema, segmentos de clientes, propuesta de valor única, solución, métricas clave, canales, estructura de costes, flujos de ingresos y ventaja competitiva.
```

**Nota:** El output fue usado directamente en el readme-VSL.md. Se ajustó manualmente el bloque de "ventaja competitiva" para enfatizar el enfoque académico del sistema.

---

### Prompt 1.3 — Definición de User Stories

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Define las User Stories Must-Have para el MVP del ChatBot Self-Improvement System. Para cada historia incluye: título, descripción en formato "Como X quiero Y para Z", criterios de aceptación, notas adicionales e historias relacionadas. El flujo principal es: usuario chatea → admin da feedback → meta-agente analiza → admin confirma → nuevo prompt activo.
```

**Nota:** Se generaron 6 US Must-Have y 1 Should-Have. Se revisaron manualmente los criterios de aceptación para asegurar que fueran verificables y no ambiguos.

---

## 2. Arquitectura y Modelo de Datos

### Prompt 2.1 — Diseño de la arquitectura

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Diseña la arquitectura para un sistema FastAPI + PostgreSQL + OpenAI con estas características:
- Backend monolítico modular con módulos: chatbot, feedback, meta_agent, prompts
- Frontend con Jinja2 templates (no React)
- El meta-agente llama a OpenAI para analizar feedback y proponer mejoras de prompt
- Necesito el diagrama ASCII de la arquitectura y la justificación de cada decisión
```

**Nota:** Se eligió monolito modular conscientemente para reducir la complejidad de despliegue dado el tiempo disponible. El diagrama ASCII fue generado automáticamente y luego incluido en el README sin modificaciones.

---

### Prompt 2.2 — Diseño del modelo de datos

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Diseña el modelo de datos relacional (PostgreSQL) para el ChatBot Self-Improvement System. Las entidades necesarias son: conversaciones con trazabilidad (session_id, workflow_id, execution_id), mensajes, feedback del admin, análisis del meta-agente y versiones de prompts. Necesito que haya trazabilidad completa desde una versión de prompt hasta el feedback que la originó.
```

**Nota:** El campo `feedback_analysis_id` en `prompt_versions` fue la decisión clave para garantizar la trazabilidad. Se añadió tras revisar el modelo inicial que no incluía esa relación.

---

## 3. Backend y API

### Prompt 3.1 — Scaffolding del backend FastAPI

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Genera el scaffolding completo de un backend FastAPI con esta estructura:
- app/modules/chatbot/router.py: endpoint POST /api/v1/chat que llama a OpenAI
- app/modules/feedback/router.py: CRUD de feedback y listado de conversaciones  
- app/modules/meta_agent/router.py: endpoints analyse/apply/reject
- app/modules/prompts/router.py: historial y activación de versiones
- app/shared/models.py: modelos SQLAlchemy para todas las tablas
- app/shared/config.py: configuración con pydantic-settings
- Docker Compose con PostgreSQL en puerto 5433 (evitar conflicto local)
Incluye también el seed script con prompt inicial y conversación de demo.
```

**Nota:** El puerto 5433 para PostgreSQL fue un ajuste humano necesario porque el puerto 5432 estaba ocupado localmente. El scaffold generado funcionó directamente sin modificaciones mayores.

---

### Prompt 3.2 — Sistema prompt del meta-agente

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Escribe el system prompt para un meta-agente que analiza fallos de chatbots. El meta-agente recibe: el prompt actual del chatbot, la conversación completa donde ocurrió el problema, y el comentario del administrador describiendo el fallo. Debe:
1. Identificar la causa raíz: PROMPT, EXTERNAL_DATA, WORKFLOW o UNKNOWN
2. Explicar su razonamiento
3. Si la causa es PROMPT, proponer el prompt mejorado completo
Debe responder SOLO en JSON con campos: root_cause, analysis, proposed_prompt
```

**Nota:** La instrucción de responder "SOLO en JSON" fue crítica para poder parsear la respuesta de forma fiable. Se añadió `response_format={"type": "json_object"}` en la llamada a la API como refuerzo adicional.

---

### Prompt 3.3 — Corrección de bug en idempotencia del análisis

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
El endpoint POST /feedback/{id}/analyse debe ser idempotente: si el feedback ya fue analizado, devolver el análisis existente sin llamar a OpenAI de nuevo. El estado ANALYSED indica que ya existe un FeedbackAnalysis relacionado. Muéstrame cómo implementar esta lógica en FastAPI con SQLAlchemy.
```

**Nota:** Este prompt surgió al escribir los tests de integración, donde se detectó que llamar dos veces al endpoint generaba un error de constraint único en la BD. La idempotencia se implementó verificando si `feedback.analysis` ya existe antes de llamar a OpenAI.

---

## 4. Frontend

### Prompt 4.1 — Templates Jinja2 del panel de administración

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Genera los templates Jinja2 para el panel de administración del ChatBot Self-Improvement System. Necesito:
1. base.html con sidebar de navegación (dark theme, JetBrains Mono)
2. admin/conversations.html: listado de sesiones con tabla
3. admin/conversation_detail.html: mensajes con botón "Reportar" y modal de feedback
4. admin/feedback.html: listado de feedbacks con botón "Analizar" y modal para ver análisis del meta-agente con diff de prompts y botones Aplicar/Rechazar
5. admin/prompts.html: historial de versiones con botón de revertir
Todo vanilla JS con fetch/AJAX, sin frameworks externos excepto Google Fonts.
```

**Nota:** El diseño dark theme con JetBrains Mono fue una elección deliberada para dar un aspecto técnico coherente con el dominio del producto (herramienta para desarrolladores). El diff visual de prompts (actual vs. propuesto en dos columnas) fue añadido como ajuste humano tras ver el primer prototipo.

---

## 5. Testing

### Prompt 5.1 — Generación de la suite de tests

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Genera una suite completa de tests para el ChatBot Self-Improvement System con pytest:
- conftest.py con fixtures: DB SQLite en memoria, TestClient de FastAPI, seed de prompt activo, mock de OpenAI
- tests/unit/: tests de lógica del meta-agente (construcción de prompts, enums, modelos)
- tests/integration/: tests de endpoints con OpenAI mockeado (chat, feedback, analyse, apply, reject)
- tests/e2e/: test del flujo completo de 8 pasos desde chat hasta nuevo prompt activo con verificación de trazabilidad
OpenAI debe estar completamente mockeado, sin llamadas reales.
```

**Nota:** El test E2E falló inicialmente porque SQLite no convierte UUIDs automáticamente como PostgreSQL. El fix fue convertir el string a `uuid.UUID()` antes de las queries directas a la BD. Este es un ejemplo claro de ajuste humano necesario tras la generación automática.

---

## 6. CI/CD y Despliegue

### Prompt 6.1 — GitHub Actions pipeline

**Herramienta:** Claude (claude.ai)

**Prompt:**
```
Genera un pipeline de GitHub Actions para el ChatBot Self-Improvement System con dos jobs:
1. test: instala Python 3.11, dependencias, y ejecuta pytest con SQLite (sin PostgreSQL real)
2. build: construye la imagen Docker solo si los tests pasan
El pipeline debe activarse en push y PR a la rama finalproject-VSL, solo cuando hay cambios en la carpeta finalproject-VSL/.
```

**Nota:** Se añadió el filtro `paths: finalproject-VSL/**` manualmente para evitar que el pipeline se ejecute en cambios de otros proyectos del monorepo. La variable `OPENAI_API_KEY: sk-test-key-not-real` es intencional — los tests mockean OpenAI y no necesitan clave real.

---

## 7. Resumen de herramientas utilizadas

| Herramienta | Uso principal |
|-------------|---------------|
| Claude (claude.ai) | Diseño, scaffolding, generación de código, documentación |
| Cursor | IDE con asistencia AI para implementación y debugging |
| ChatGPT | Consultas puntuales de sintaxis |
| GitHub Copilot | Autocompletado durante desarrollo |

## 8. Reflexión sobre el proceso

El uso de IA aceleró significativamente las fases de scaffolding y documentación (estimado: 60-70% del tiempo ahorrado en estas fases). Sin embargo, fue necesaria intervención humana en:

- **Depuración de compatibilidad SQLite/PostgreSQL** en los tests E2E
- **Ajuste de la indentación** del docker-compose.yml
- **Gestión de credenciales** (.env, API Keys, GitHub secrets)
- **Diseño visual** del diff de prompts en el panel admin
- **Decisiones arquitectónicas** como el puerto 5433 para evitar conflictos locales

El ciclo más efectivo fue: *prompt detallado → código generado → ejecución → error → prompt de corrección específico*, iterando hasta conseguir el resultado esperado.
