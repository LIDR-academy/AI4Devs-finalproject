---
document: ai_transparency_manifest
version: 1.0.0
status: approved
inputs:
  - AGENTS.md
  - docs/04_governance_and_quality/08_security_strategy.md
---

# 🤖 Manifesto de Transparencia de IA y Gobernanza Ética (EU AI Act 2024/1689 & GDPR)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a CI/CD Pipeline (10_cicd_pipeline.md)](./10_cicd_pipeline.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Historias de Usuario (11_user_stories) ➡️](../05_agile_planning/11_user_stories/)

---

## 🏛️ 1. Declaración de Cumplimiento Regulatorio (EU AI Act - Artículos 50 & 52)

En cumplimiento con el **Reglamento Europeo de Inteligencia Artificial (EU AI Act 2024/1689)** y las directivas de la FTC/GDPR de 2026:

1. **Clasificación de Riesgo:** El sistema **RestoStock** opera bajo la categoría de **Riesgo Limitado** (Asistentes de Código y Agentes Autónomos de Desarrollo).
2. **Supervisión Humana Obligatoria (Human-in-the-Loop - Art. 14):** Ninguna especificación, migración de base de datos o cambio arquitectónico se aplica de forma puramente automatizada. Se exige autorización explícita del humano en la consola antes de guardar en disco.
3. **Etiquetado y Transparencia Sintética (Art. 50):** Todo código y artefacto generado asistido por IA contiene metadatos trazables vinculados a la historia de usuario (`US-XXX`) y al ticket técnico (`TK-XXX`).

---

## 🛡️ 2. Protocolo de Privacidad y Tokenización PII (GDPR Art. 25 - Privacy by Design)

Para prevenir la filtración accidental de Datos de Identificación Personal (PII) en los modelos de IA:

* **Tokenización Pre-Prompt:** Queda prohibido pasar nombres de operarios, correos reales, teléfonos o credenciales a los modelos de lenguaje.
* **Tokens Sintéticos Homologados:**
  * Nombres: `USER_SYNTHETIC_001`, `COOK_SYNTHETIC_002`
  * Emails: `user_001_synthetic@restostock.internal`
  * PINs de prueba: Hashed con Bcrypt + Salt en memoria.

---

## ♿ 3. Matriz de Ética, Inclusión y Accesibilidad Universal (WCAG 2.1 AAA)

Para evitar discriminación o sesgos algorítmicos en las interfaces táctiles de cocina:

1. **Objetivos Táctiles Mínimos:** Todas las áreas interactivas mantienen dimensiones mínimas de $48\text{px} \times 48\text{px}$.
2. **Contraste Dinámico HSL:** Ratio de contraste de color $\ge 7:1$ para lectura clara en entornos de cocina con alta luminosidad.
3. **Soporte para Lectores de Pantalla:** Atributos `aria-label` y roles ARIA obligatorios en componentes táctiles.

---

## 🍃 4. Gobernanza de Eficiencia Energética (Green Code Guard)

Para reducir el consumo computacional y la huella de carbono en la inferencia de IA y CI/CD:

* **Optimización de Complejidad:** Prohibidos algoritmos con complejidad temporal $O(N^2)$ en el cálculo de remanentes FEFO.
* **Pruebas Deterministas sin Mutantes Fantasma:** Cobertura de mutación $\ge 70\%$ con Stryker para evitar ejecuciones superfluas en el runner de CI/CD.

---

## 🔒 5. Ciberseguridad Agéntica, MCP & Soberanía de IP (OWASP LLM 2026)

1. **Tratamiento de Contexto No Confiable (Untrusted Context Guard):** Todo input externo, respuesta de API o issue importado se trata como texto no confiable. Se prohíbe ejecutar llamadas MCP o terminales derivadas directamente de texto no validado por Zod.
2. **Soberanía de Propiedad Intelectual & Parámetros Deterministas:** Queda prohibido el uso de licencias Copyleft (GPL-3.0). Se exige el uso de licencias permisivas (MIT / Apache 2.0), configuración *Zero Data Retention* (ZDR) en los canales API y parámetros de inferencia deterministas (**Temperatura 0.0** y **Top-p $\le 0.2$**) en la generación de código y especificaciones.
3. **Inference Circuit Breaker:** Límite máximo de 3 iteraciones de autorreparación TDD por ticket técnico para evitar consumo excesivo de tokens e ineficiencia energética.

---

## 🎭 6. Mitigación del "Test Theater" y Prevención de Code Churn (AI4Devs 2026)

Para neutralizar el antipatrón de pruebas tautológicas ("Test Theater") e impedir el aumento de *code churn* (código duplicado o revertido en 2 semanas):

1. **La Regla de Oro de Autoría de Criterios (Human-in-the-Loop):** Los criterios de aceptación (especificaciones BDD Gherkin) deben ser creados o aprobados explícitamente por el humano en la Fase 1 (`specs/`) antes de redactar cualquier código de producción. La IA implementa; el humano supervisa la intención del test.
2. **Método Científico TDD (Test visto fallar):** Todo test unitario/integración debe ser ejecutado y **visto fallar (Estado Rojo)** en la consola antes de escribir la solución mínima que lo ponga en verde.
3. **Audit de Mutación Adversarial (Stryker Score $\ge 70\%$):** Elimina la "ceremonia" de tests ficticios validando que cada test reaccione y destruya mutantes sintéticos inyectados en el código.

---

## ⚡ 7. Paradigma de Agentic Engineering vs. Vibe Coding (Política AI4Devs 2026)

Este proyecto rechaza categóricamente el antipatrón de **Vibe Coding** (*"entregarse ciegamente al output del LLM olvidando el diseño y el código"*):

* **Declaración Institucional:** RestoStock se construye mediante **Agentic Engineering (Augmented Coding + Spec-Driven Development)**.
* **Spec-Driven Development (SDD):** La especificación viva en `docs/` es el **artefacto primario de verdad**; la IA únicamente ejecuta la implementación bajo supervisión.
* **Augmented Coding (Kent Beck):** La IA incrementa la velocidad del desarrollador, pero el ingeniero humano mantiene el control riguroso de la arquitectura Hexagonal, la cobertura de pruebas y la complejidad ciclomática.




