---
name: SK-17_develop_frontend_ticket
description: "Guía el desarrollo atómico de un ticket de Frontend aplicando Clean Architecture en cliente, SOLID, accesibilidad WCAG, ergonomía de interfaz y estados defensivos según las reglas del proyecto."
version: "3.0.0"
category: "development/03_frontend_development"
inputs:
  - ticket_id: "ID o ruta del ticket técnico de frontend (ej. TK-007 o docs/05_agile_planning/12_tickets/...)"
required_rules:
  - "docs/04_governance_and_quality/rules/frontend_rules.md"
  - "docs/04_governance_and_quality/rules/domain_rules.md"
  - "docs/04_governance_and_quality/rules/security_rules.md"
  - "docs/04_governance_and_quality/rules/testing_rules.md"
outputs:
  - "Componentes UI y lógica de interfaz creados e integrados"
  - "Módulos de estado y adaptadores de repositorio UI desacoplados"
  - "Verificación de compilación y análisis estático aprobada sin errores"
---

# 🎨 SK-17: Desarrollador de Tickets Frontend (v3.0.0)

Actúa como un **Senior Frontend Engineer** y **UI/UX Clean Architecture Advocate**. Tu objetivo es implementar de forma atómica el ticket técnico especificado en `ticket_id`, respetando la arquitectura de cliente desacoplada, los principios SOLID y las directivas de la gobernanza del proyecto.

Sigue estrictamente este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Pila Tecnológica, UI y Comandos
1. **Analizar Especificación del Ticket:** Lee el ticket en `docs/05_agile_planning/12_tickets/{ticket_id}` y comprende los criterios de aceptación.
2. **Consultar Comandos Oficiales:** Lee `AGENTS.md` para extraer los comandos declarados del proyecto para compilación (`build`), linter (`lint`) y runner de pruebas UI.
3. **Descubrir Reglas de UX/UI y Pila Cliente:** Consulta las directivas declaradas en `required_rules` (especialmente `docs/04_governance_and_quality/rules/frontend_rules.md` y `docs/02_architecture_design/05_ui_ux_design_system.md`) para identificar:
   - Framework visual y lenguaje del cliente (React, Vue, Svelte, Angular, TypeScript/JavaScript).
   - Sistema de diseño, tokens de color (variables HSL/CSS, clases de utilidad) y diseño responsive.
   - Especificaciones de ergonomía táctil (dimensiones físicas mínimas y márgenes interactivos).
   - Requisitos de accesibilidad (WCAG 2.1 AA/AAA, contraste e independencia de color).
   - Los 4 estados defensivos obligatorios de UI (Carga/Loading, Estado Vacío/Empty, Manejo de Errores con reintento y Banner de Desconexión/Offline).

---

## 📱 FASE 2: Diseños Hexagonales & Desacoplamiento (SOLID)
1. **Inversión de Dependencias (DIP):** Abstraer el consumo de servicios web o API mediante interfaces o puertos de repositorio (soporte transparente para adaptadores HTTP o InMemory/Mocks).
2. **Responsabilidad Única (SRP):**
   - Separar la gestión de estado o almacenamiento local/offline (IndexedDB, Stores, Hooks, Services) del componente puramente visual.
   - Encapsular la lógica de negocio del cliente en modelos o servicios de aplicación del frontend.

---

## 💻 FASE 3: Implementación del Código
1. **Modelos & DTOs:** Crear o extender DTOs e interfaces del cliente con tipado estricto (evitando casting inseguro o `any`), respetando los estándares de sintaxis declarados en las reglas.
2. **Desarrollo de Interfaz y Ergonomía:** Aplicar la paleta de tokens, layout responsive y estilos según el sistema de diseño del proyecto.
3. **Navegación & Enrutamiento:** Registrar y conectar las vistas dentro del sistema de ruteo del proyecto.

---

## 🔄 FASE 4: Bucle de Auto-Reflexión y Auto-Corrección (Self-Checklist)
Antes de entregar el ticket, ejecuta esta lista de cotejo interna contra las directivas descubiertas en la Fase 1:
- [ ] ¿Los componentes interactivos cumplen con las dimensiones táctiles mínimas especificadas en `frontend_rules.md`?
- [ ] ¿El texto y componentes cumplen con el estándar de contraste WCAG y la independencia del color?
- [ ] ¿Están implementados los 4 estados defensivos (Loading, Empty, Error, Offline)?
- [ ] ¿La lógica de estado y llamadas a API fue extraída a servicios/stores/hooks desacoplados?
- [ ] ¿El código cumple con el tipado estricto del proyecto sin usar tipos inseguros?

---

## 🚨 FASE 5: Verificación, Auditoría Visual y Quality Gate
1. **Compilación del Proyecto:** Corre el comando de build oficial declarado en `AGENTS.md` para asegurar 0 errores de compilación.
2. **Análisis Estático:** Corre el linter oficial de `AGENTS.md` verificando 0 errores y 0 advertencias.
3. **Auditoría de Accesibilidad Opcional:** Ejecutar la verificación a11y mediante `.agents/skills/development/06_visual_qa/SK-21_audit_ui_accessibility.md`.
4. **Reporte al Humano:** Presentar los componentes creados/modificados y los resultados del pase de calidad estructurados estrictamente según la **Plantilla A** universal en `.agents/rules/00_output_reporting_standard.md`.
