# prompts.md

# Registro de uso de IA

## 1. Producto

### Prompt 1

Actúa como Product Manager y diseña un MVP para una aplicación de healthcare patient timeline inspirada en Statewave.

### Prompt 2

Identifica el flujo E2E mínimo que aporte valor completo al usuario.

### Prompt 3

Define historias Must-Have y Should-Have usando criterios de aceptación claros.

### Nota de guía

Se guió al asistente para priorizar un flujo clínico sencillo: paciente, encuentro, extracción de eventos y timeline auditado.

---

## 2. Arquitectura

### Prompt 1

Propón una arquitectura para una aplicación healthcare timeline con Next.js, FastAPI, PostgreSQL, OpenAI y Statewave.

### Prompt 2

Separa responsabilidades entre frontend, backend, persistencia, memoria contextual e IA.

### Prompt 3

Identifica riesgos de seguridad y mitigaciones para un MVP educativo con datos sintéticos.

### Nota de guía

Se decidió una arquitectura simple por capas para evitar complejidad innecesaria en la primera entrega.

---

## 3. Modelo de datos

### Prompt 1

Diseña un modelo relacional para pacientes, encuentros clínicos, eventos y auditoría.

### Prompt 2

Añade trazabilidad de fuente, confidence score y estado de revisión humana.

### Prompt 3

Genera un diagrama ER Mermaid para documentación.

### Nota de guía

Se priorizó provenance y auditabilidad sobre funcionalidades clínicas avanzadas.

---

## 4. API

### Prompt 1

Define endpoints REST para gestionar pacientes, encuentros, extracción IA y timeline.

### Prompt 2

Propón contratos request/response mínimos para el MVP.

### Prompt 3

Añade un endpoint /health para validar despliegue y CI.

### Nota de guía

Se mantuvo una API pequeña para poder implementarla de forma progresiva.

---

## 5. Backend

### Prompt 1

Crea un backend FastAPI mínimo con endpoint /health.

### Prompt 2

Estructura el backend por carpetas: api, core, models, schemas, repositories y services.

### Prompt 3

Prepara servicios placeholder para OpenAI y Statewave.

### Nota de guía

La primera entrega prioriza estructura y ejecutabilidad antes que integración completa.

---

## 6. Frontend

### Prompt 1

Crea una página inicial en Next.js para presentar el producto AuditCare Timeline.

### Prompt 2

Diseña componentes futuros para pacientes, encuentros y timeline.

### Prompt 3

Prepara una estructura escalable de carpetas en TypeScript.

### Nota de guía

El frontend inicial sirve como landing técnica y será ampliado en siguientes entregas.

---

## 7. Testing

### Prompt 1

Genera un test unitario para validar el endpoint /health.

### Prompt 2

Prepara una estructura para tests unitarios, integración y E2E.

### Prompt 3

Define un flujo E2E futuro: crear paciente, crear encuentro, extraer eventos y visualizar timeline.

### Nota de guía

Se dejó preparado el camino para ampliar tests en la segunda y tercera entrega.

---

## 8. Ajustes humanos

- Se limitó el uso a datos sintéticos.
- Se priorizó trazabilidad y auditabilidad.
- Se simplificó el MVP para poder entregarlo progresivamente.
