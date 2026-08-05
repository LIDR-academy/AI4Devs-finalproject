---
name: SK-16_backend_ticket
description: "Lee un ticket técnico de Backend y genera el código correspondiente respetando los Principios SOLID, la arquitectura Hexagonal, el Bucle de Auto-Reflexión y las reglas de gobernanza del proyecto."
version: "2.2.0"
category: "development/02_backend_development"
inputs:
  - ticket_path: "Ruta del ticket técnico de backend"
outputs:
  - "Código generado e implementado conforme a la especificación del ticket"
  - "Pruebas unitarias/integración verdes assertando los requerimientos"
---

Actúa como un Senior Backend Developer. Tu objetivo es implementar la funcionalidad requerida en el ticket técnico especificado en `ticket_path`, aplicando estrictamente los **Principios SOLID**, la **Arquitectura Hexagonal**, el **Bucle de Auto-Reflexión** y las **Reglas de Gobernanza y Pila Tecnológica** del proyecto.

Sigue strictly este flujo de trabajo secuencial:

---

## 🔍 FASE 1: Descubrimiento de Reglas, SOLID y Arquitectura
1. **Analizar el Ticket:** Lee el ticket en `{ticket_path}` y comprende sus criterios de aceptación y Definition of Done (DoD).
2. **Descubrir Reglas del Proyecto:** Lee las directivas en `docs/03_governance_and_quality/rules/` (`backend_rules.md`, `domain_rules.md`, `database_rules.md`, `security_rules.md`, `testing_rules.md`).
3. **Mapear Ejemplos Few-Shot:** Consulta la carpeta de patrones `.agents/examples/` si requieres una referencia estructural de la arquitectura.

---

## 🧪 FASE 2: Diseño de Pruebas (Test-Driven Development)
1. **InMemory Fakes (LSP):** Utilizar `InMemoryRepository` que implemente la interfaz del puerto en memoria (sin mocks pesados de ORM).
2. **Escribir el Test (Fase RED):** Diseña y escribe la prueba unitaria o de integración correspondiente a la lógica descrita en el ticket antes de escribir la implementación.

---

## 💻 FASE 3: Implementación de Código Clean & SOLID
1. **Dominio (TypeScript Puro):** Escribe las entidades, Value Objects e interfaces/puertos asegurando cero acoplamiento con frameworks (Express/Prisma).
2. **Aplicación (Casos de Uso):** Implementa el caso de uso orquestando entidades y puertos. Pon los tests en **VERDE (GREEN)**.
3. **Infraestructura (Controllers, Zod & Prisma):** Implementa controladores Express validando `req.body/query` con Zod, Mappers y adaptadores Prisma transaccionales.

---

## 🔄 FASE 4: Bucle de Auto-Reflexión y Auto-Corrección (Self-Checklist)
Antes de declarar el ticket como completado, ejecuta esta lista de cotejo interna y corrige inmediatamente cualquier discrepancia:
- [ ] ¿Hay algún tipo `any` en el código? (Si sí $\rightarrow$ sustituir por un tipo explícito o genérico).
- [ ] ¿Los casos de uso inyectan las interfaces por constructor (DIP)? (Si no $\rightarrow$ refactorizar).
- [ ] ¿Todas las cantidades físicas usan la librería de precisión `decimal.js`? (Si no $\rightarrow$ aplicar `Decimal`).
- [ ] ¿Las entradas del controlador están sanitizadas con esquemas Zod? (Si no $\rightarrow$ agregar esquema Zod).

---

## 🚨 FASE 5: Verificación y Calidad
1. **Compilación & Types:** Corre `pnpm run build` para asegurar 0 errores de compilación TypeScript.
2. **Análisis Estático:** Ejecuta `pnpm run lint` para garantizar 0 advertencias.
3. **Resultados:** Presenta los archivos creados/modificados y confirma el estado exitoso de la suite de pruebas.
