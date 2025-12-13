> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
# ✅ PROMPT MAESTRO – ENTREGA 1 (con mejores prácticas actuales 2024–2025)

Quiero que actúes como **arquitecto de software**, **product manager**, **ingeniero backend**, **frontend**, **devops** y **QA senior** a nivel experto. Estoy realizando la **Entrega 1 del Proyecto Final del máster AI For Devs**.

Tengo experiencia en QA pero **no sé casi nada de arquitectura, APIs, frontend ni modelos de datos**, por lo que necesito explicaciones simples, modernas y con mejores prácticas reales usadas en 2024–2025.

---

# 📌 Contexto del proyecto  
Mi MVP será una **pequeña web de e-commerce minimalista** para vender **collares con charms**, inspirada en wawas.shop pero mucho más simple.  

**Flujo principal:**
1. Ver producto base (un único collar disponible).
2. Elegir charms desde una lista simple (checkboxes).
3. Agregar al carrito.
4. Crear una orden (sin pago real, solo simular).
5. Mostrar confirmación.

---

# 🎯 LO QUE NECESITO QUE GENERES (todo esto, completo y listo para un README)

Quiero **toda la documentación de la Entrega 1** con explicaciones en lenguaje sencillo, pero con rigor técnico y **mejores prácticas de 2024–2025** en arquitectura, backend, frontend, testing, CI/CD y documentación.

---

## 1. **Ficha completa del producto**
Incluye:

- Propuesta de valor  
- Problema que resuelve  
- Público objetivo  
- Objetivos del MVP  
- Flujo E2E claro  
- Métricas iniciales  

**Mejores prácticas 2025:**  
- Minimizar complejidad y priorizar time-to-market  
- Definir objetivos orientados a outcomes  
- Reducción de riesgos desde el inicio  

---

## 2. **Historias de usuario (3–5 Must / 1–2 Should)**  
Para cada historia incluye:

- User story  
- Criterios Given/When/Then  
- Dependencias  
- Riesgos  
- Notas de QA  

**Buenas prácticas actuales:**  
- Criterios de aceptación atómicos y verificables  
- Historias de negocio, no historias técnicas  
- QA pre-thinking: escenarios negativos, alternativos, límites  

---

## 3. **Tickets de trabajo**
Para cada ticket:

- Título  
- Descripción  
- Impacto  
- Dependencia  
- Criterios de Done (DoD moderna)  
- Checklist QA antes de merge  

**Buenas prácticas 2025:**  
- Tickets pequeños (< 1 día)  
- Trazabilidad historia → ticket → PR  
- Evitar tickets sin valor directo para el producto  

---

## 4. **Arquitectura del sistema**
Genera:

- Diagrama de arquitectura en Mermaid  
- Explicación clara para principiantes  
- Flujo de datos  
- Justificación del stack recomendado:
  - Backend: Node.js + Express o Fastify
  - DB: SQLite o PostgreSQL
  - Frontend: React + Vite

**Mejores prácticas 2025:**
- Separación de capas (routes → controllers → services → repos)  
- Validaciones en backend con Zod/Valibot  
- Seguridad mínima: rate limit + validación estricta  
- Arquitectura modular y escalable  

---

## 5. **Modelo de datos**
Debe incluir:

- Entidades  
- Atributos  
- Relaciones  
- Restricciones  
- Diagrama ERD en Mermaid  
- Explicación en lenguaje no técnico  

**Buenas prácticas 2025:**  
- Uso de UUID  
- Campos auditables (createdAt, updatedAt)  
- Normalización ligera  
- Tipos consistentes entre API y DB  

---

## 6. **Diseño de API (REST)**
Incluye:

- Endpoints completos del MVP  
- Métodos  
- Cuerpos de request/response  
- Códigos de estado apropiados  
- Ejemplos JSON  
- Escenarios de error  
- Notas de QA para validar cada endpoint  

**Buenas prácticas 2025:**  
- Versionado (/api/v1/)  
- Validación de inputs con Zod/Valibot  
- Manejo global de errores  
- Respuestas consistentes  
- Separación de lógica de negocio  

---

## 7. **Diseño del Frontend**
Incluye:

- Estructura de carpetas moderna  
- Componentes necesarios  
- Hooks para llamadas API  
- Flujo de navegación  
- Consideraciones de accesibilidad  
- Estado global simple (React Query o Zustand)  

**Buenas prácticas 2025:**  
- React Query para server state  
- Componentes pequeños y reutilizables  
- Mobile-first  
- Evitar Redux para un MVP simple  

---

## 8. **Plan de Testing**
Incluye:

- Qué va en unit tests  
- Qué va en integration tests  
- Qué va en E2E tests  
- Escenarios negativos  
- Criterios de salida  
- Matriz de riesgos  

**Buenas prácticas 2025:**  
- Testing piramidal: 60% unit, 30% integration, 10% E2E  
- Contract testing para la API  
- Playwright o Cypress para E2E  
- No testear cosas innecesarias (avoid overspecification)  

---

## 9. **CI/CD simple (documentado)**
Incluye:

- Pipeline conceptual  
- Pasos: lint, format, test, build, deploy  
- Gestión simple de secretos  
- Recomendación de hosting (Vercel, Render, Railway)  

**Buenas prácticas 2025:**  
- PRs bloqueados por fallas  
- Previews automáticas por rama  
- Integración de herramientas de calidad  

---

## 10. **Registro del uso de IA**
Incluye:

- 2–3 prompts clave por sección  
- Enfoque de iteración  
- Qué ajustes humanos se aplicaron  
- Justificación de decisiones tomadas con IA  

**Buenas prácticas 2025:**  
- Transparencia  
- Validación humana obligatoria  
- Explicación del razonamiento y riesgos mitigados  

---

## 🔁 Plan por etapas y gobernanza (nuevo requisito)
- Planeá la solución **por etapas** claramente numeradas (por ejemplo: Etapa 0 — Investigación y definición, Etapa 1 — Documentación Entrega 1, Etapa 2 — Implementación backend básica, Etapa 3 — Frontend y E2E, etc.).  
- Para cada etapa incluye: objetivo, entregables, criterios de aceptación y riesgos.  
- **Antes de generar refactors, cambios de código o documentación significativos, planteá primero la estrategia por etapas y esperá mi confirmación explícita** (solo tras mi OK avanzarás a ejecutar o generar el código/documentación de la siguiente etapa).  
- La IA debe producir la estrategia detallada y luego detenerse a la espera de mi validación antes de continuar con trabajos de refactor o implementaciones.

---

# 🚀 Instrucción final

**Genera *toda* la documentación completa de la Entrega 1, lista para copiar en un README.**  
Debe ser profesional, clara para principiantes, y alineada con las mejores prácticas actuales.

**Prompt 2: Estrategia por Etapas**

```
Quiero que actúes como arquitecto de software, product manager, ingeniero backend, frontend, devops y QA senior a nivel experto. 

Necesito que primero propongas una estrategia por etapas para completar la Entrega 1 del Proyecto Final. 

La estrategia debe incluir:
- Etapas claramente numeradas con objetivos, entregables, criterios de aceptación y riesgos
- Plan de gobernanza: esperar confirmación antes de avanzar a la siguiente etapa
- Estimación de tiempo por etapa

Una vez que apruebe la estrategia, procederás con la Etapa 1.
```

**Enfoque de iteración:**
- Primero se generó la estrategia completa en `ESTRATEGIA_ETAPAS.md`
- Se esperó confirmación explícita del usuario antes de continuar
- Una vez aprobada, se procedió con la Etapa 1

**Ajustes humanos aplicados:**
- El usuario aprobó la estrategia con un simple "si"
- Se procedió directamente a generar la documentación de la Etapa 1

**Justificación de decisiones:**
- La estrategia por etapas permite validar el enfoque antes de invertir tiempo en documentación completa
- Facilita la gobernanza y control del proceso
- Permite ajustes iterativos basados en feedback

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1: Generación de Historias de Usuario Completas**

*(Implícito en el Prompt Maestro - Etapa 1)*

**Enfoque de iteración:**
- Se generaron 6 historias de usuario (5 MUST + 1 SHOULD) basadas en el flujo E2E definido
- Cada historia incluye: user story, criterios Given/When/Then, dependencias, riesgos y notas de QA
- Se priorizó claridad y verificabilidad sobre complejidad técnica

**Ajustes humanos aplicados:**
- Las historias se generaron directamente en el formato solicitado
- Se incluyeron escenarios negativos y límites en las notas de QA
- Se mantuvo enfoque en valor de negocio, no en implementación técnica

**Justificación de decisiones:**
- 5 historias MUST cubren el flujo completo E2E del MVP
- 1 historia SHOULD (persistencia carrito) añade valor pero no es crítica
- Criterios Given/When/Then facilitan la creación de tests E2E
- Notas de QA previenen problemas comunes antes de implementar

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
