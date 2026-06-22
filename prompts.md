# Registro de Prompts Clave — Entrega 1 Manus POS

## 1. Producto

### Prompt 1 — Definición de valor y alcance del MVP
**Prompt usado o planificado:**  
“Actúa como analista de producto SaaS para retail. Define objetivo, problema resuelto, usuarios, alcance MVP y flujo E2E prioritario para un POS llamado Manus POS. Contexto: venta presencial, inventario, caja y roles (cajero, administrador, super admin). Entrega texto en español con historias must-have y should-have.”

**Cómo guié al asistente:**  
Le di contexto del tipo de proyecto, el flujo mínimo evaluable y las reglas de negocio críticas de entrega.

**Ajuste humano hecho o por hacer:**  
Ajusté el lenguaje para que fuera coherente con plantilla del curso y añadí restricciones: no inventar URLs, no inventar PRs ni credenciales.

**Resultado esperado:**  
Borrador de sección de proyecto alineada con Entrega 1, listo para poner en `readme.md`.

### Prompt 2 — Priorización y riesgos del MVP
**Prompt usado o planificado:**  
“Crea prioridades Must-Have y Should-Have con criterios de éxito del flujo E2E de POS, validables por QA. Incluye riesgos operativos y supuestos.”

**Cómo guié al asistente:**  
Le exigí mantener solo 5 Must-Have y 2 Should-Have exactamente, tal como se usará para evaluación.

**Ajuste humano hecho o por hacer:**  
Limité el alcance a flujo E2E, evitando promesas de módulos no contemplados en esta entrega.

**Resultado esperado:**  
Sección de historias de usuario y criterios de aceptación claros para implementación y pruebas.

### Prompt 3 — Ficha de proyecto
**Prompt usado o planificado:**  
“Genera una ficha de proyecto académica para Entrega 1: nombre, objetivo, alcance, riesgos, evidencia documental y pendientes con placeholders."

**Cómo guié al asistente:**  
Le pedí uso de placeholders explícitos y auditables para entregas incompletas.

**Ajuste humano hecho o por hacer:**  
Sustituí cualquier texto ambiguo por placeholders concretos: `[URL pública pendiente]`, `[PR Entrega 1 pendiente]`, `[Repositorio Manus POS pendiente]`.

**Resultado esperado:**  
Fichero `readme.md` preparado para entrega con trazabilidad clara.

---

## 2. Arquitectura

### Prompt 1 — Arquitectura lógica
**Prompt usado o planificado:**  
“Diseña una arquitectura lógica para Manus POS enfocada en flujo POS: frontend web, API backend, PostgreSQL y control de turno/caja. Muestra diagrama en texto y justificación corta.”

**Cómo guié al asistente:**  
Le di un enfoque “sin código funcional”, solo documentación técnica y lógica.

**Ajuste humano hecho o por hacer:**  
Mantener la arquitectura en términos prácticos del curso, sin atar a tecnologías no contempladas.

**Resultado esperado:**  
Bloque de arquitectura lógica entendible por evaluador no técnico y técnico.

### Prompt 2 — Arquitectura técnica por capas
**Prompt usado o planificado:**  
“Propon un esquema técnico de capas para POS + ventas + inventario + caja; detalla responsabilidades de UI, API y base de datos.”

**Cómo guié al asistente:**  
Le pedí que no prescribiera stack fijo, pero sí separación de capas y responsabilidades.

**Ajuste humano hecho o por hacer:**  
Validé que no se propusieran decisiones incompatibles con la plantilla base.

**Resultado esperado:**  
Sección técnica sólida para `readme.md`.

### Prompt 3 — OpenSpec en método de trabajo
**Prompt usado o planificado:**  
“Sugiere cómo aplicar OpenSpec en proyecto académico con cambios documentales y luego de código, manteniendo trazabilidad historia → ticket → artefacto.”

**Cómo guié al asistente:**  
Aclará que hoy no existe estructura OpenSpec y pida mantenerlo como metodología.

**Ajuste humano hecho o por hacer:**  
Confirmé en texto que no se creará estructura compleja sin base previa.

**Resultado esperado:**  
Notas de metodología de cambios sin inventar archivos extra.

---

## 3. Modelo de datos

### Prompt 1 — Entidades núcleo
**Prompt usado o planificado:**  
“Define entidades mínimas para POS MVP: usuario, rol, producto, venta, detalle de venta, pago, movimiento de stock y turno/caja. Incluye campos, PK/FK y cardinalidades.”

**Cómo guié al asistente:**  
Le pedí centrarse en campos mínimos para validar MVP y evitar sobre-modelado.

**Ajuste humano hecho o por hacer:**  
Reduje a entidades ejecutables para flujo E2E; añadí `status` en venta y `cash_closing` obligatorio.

**Resultado esperado:**  
Diagrama Mermaid y descripciones de entidades en `readme.md`.

### Prompt 2 — Reglas de consistencia
**Prompt usado o planificado:**  
“Propón reglas de integridad para stock y ventas: stock no negativo, venta atómica, trazabilidad y auditoría.”

**Cómo guié al asistente:**  
Le pedí reglas de negocio que impacten QA directamente.

**Ajuste humano hecho o por hacer:**  
Añadí explícitamente el criterio de rollback en caso de stock insuficiente.

**Resultado esperado:**  
Criterios de aceptación y estrategia de pruebas con enfoque de riesgo.

### Prompt 3 — Trazabilidad historia→ticket→artefacto
**Prompt usado o planificado:**  
“Genera una matriz de trazabilidad entre historias, tickets y artefactos de documentación para seguimiento de Entrega 1.”

**Cómo guié al asistente:**  
Le pedí incluir relaciones uno a muchos y priorizar los tickets del flujo E2E.

**Ajuste humano hecho o por hacer:**  
Verifiqué que la matriz sea legible sin depender de código real existente.

**Resultado esperado:**  
Tabla final en `readme.md`.

---

## 4. Backend / API

### Prompt 1 — Endpoints principales
**Prompt usado o planificado:**  
“Define endpoints REST mínimos para Login, Productos, Ventas y Turno/Caja de un MVP POS. Deben cubrir flujo E2E sin sobrecarga.”

**Cómo guié al asistente:**  
Limité a endpoints críticos de lectura/escritura y usé nomenclatura REST sencilla.

**Ajuste humano hecho o por hacer:**  
No incluir endpoints no solicitados para no inflar alcance.

**Resultado esperado:**  
Lista de endpoints con propósito y parámetros clave para documentación.

### Prompt 2 — Flujos de pago y venta
**Prompt usado o planificado:**  
“Diseña payloads de venta y pago (checkout) para garantizar trazabilidad por item, método de pago y turno.”

**Cómo guié al asistente:**  
Especificé separar `POST /sales` y `POST /sales/{id}/payments`.

**Ajuste humano hecho o por hacer:**  
Añadí estados sugeridos de venta: `Borrador`, `Pagada`, `Anulada`.

**Resultado esperado:**  
API documentada con transacción de cierre de venta y movimientos de caja.

### Prompt 3 — Seguridad y permisos
**Prompt usado o planificado:**  
“Propón controles de autorización por rol para POS endpoints y operaciones sensibles (inventario y cierre de caja).”

**Cómo guié al asistente:**  
Le di roles concretos: cajero, administrador, super_admin.

**Ajuste humano hecho o por hacer:**  
Confirmé que la acción de consulta de turno/ventas quede sujeta a rol admin/super.

**Resultado esperado:**  
Sección de seguridad funcional en documentación técnica.

---

## 5. Frontend

### Prompt 1 — Estructura de pantallas del MVP
**Prompt usado o planificado:**  
“Especifica pantallas mínimas para un POS web MVP: login, POS/catálogo, carrito y caja/turno; incluye estado vacío, error y éxito.”

**Cómo guié al asistente:**  
Puse como condición que el POS sea responsive y funcional en tablet.

**Ajuste humano hecho o por hacer:**  
Prioricé flujo principal para evaluación y dejé mejoras visuales fuera de alcance.

**Resultado esperado:**  
Wireframe funcional textual y criterios de aceptación UX.

### Prompt 2 — Componentes UI para velocidad de venta
**Prompt usado o planificado:**  
“Diseña componentes UI recomendados para una venta rápida: buscador, filtros, tarjetas de producto, carrito y resumen de pago.”

**Cómo guié al asistente:**  
Le pedí que minimice clics y muestre stock en tiempo real por item.

**Ajuste humano hecho o por hacer:**  
Incluí regla de bloqueo de venta por stock insuficiente antes del cobro.

**Resultado esperado:**  
Guía de componentes reutilizables y reglas de interacción para Entrega 1.

### Prompt 3 — Responsive
**Prompt usado o planificado:**  
“Define criterio técnico para responsive en POS de escritorio y tablet, sin depender de un framework específico.”

**Cómo guié al asistente:**  
Le insistí en layout utilizable con touch y lectura clara de precio/cantidad.

**Ajuste humano hecho o por hacer:**  
Dejé claro que solo se valida como requisito funcional en esta entrega.

**Resultado esperado:**  
Checklist de pruebas responsive en `readme.md` y `prompts.md`.

---

## 6. Tests / QA

### Prompt 1 — Cobertura de pruebas MVP
**Prompt usado o planificado:**  
“Diseña una estrategia de pruebas para MVP: unitarias, integración y al menos un E2E del flujo completo. Prioriza casos de riesgo alto.”

**Cómo guié al asistente:**  
Le pedí que el E2E cubriera login, carrito y venta completa.

**Ajuste humano hecho o por hacer:**  
Añadí casos de stock insuficiente y validación de caja.

**Resultado esperado:**  
Sección de testing priorizada por riesgo y claridad de criterios.

### Prompt 2 — Casos negativos
**Prompt usado o planificado:**  
“Escribe casos negativos para ventas en POS: stock insuficiente, token expirado, venta sin turno, monto insuficiente.”

**Cómo guié al asistente:**  
Le pedí incluir expected behavior visible para usuario y logs.

**Ajuste humano hecho o por hacer:**  
Se validó que el sistema no prometa funcionalidades no implementadas.

**Resultado esperado:**  
Checklist de calidad para QA básica con foco en confiabilidad.

### Prompt 3 — Plan de smoke test
**Prompt usado o planificado:**  
“Crea un smoke test de 10-15 minutos para despliegue QA de Entrega 1.”

**Cómo guié al asistente:**  
Le limité a tareas verificables en una instalación limpia.

**Ajuste humano hecho o por hacer:**  
Incluí revisión de placeholders obligatorios tras despliegue.

**Resultado esperado:**  
Lista de validación rápida para demos y revisión académica.

---

## 7. Infra / despliegue

### Prompt 1 — Estrategia de despliegue QA
**Prompt usado o planificado:**  
“Define una estrategia simple de despliegue para QA/demo de MVP sin inventar proveedores; solo pasos, variables y verificación.”

**Cómo guié al asistente:**  
Le indiqué evitar proveedores concretos y usar placeholders de entorno.

**Ajuste humano hecho o por hacer:**  
Reescribí cualquier URL concreta y dejé `[URL pública pendiente]`.

**Resultado esperado:**  
Plan de despliegue compatible con repositorio de plantilla y revisión.

### Prompt 2 — Variables de entorno y secretos
**Prompt usado o planificado:**  
“Lista variables mínimas para QA: BD, auth, flags, y entorno. Evita inventar secretos reales.”

**Cómo guié al asistente:**  
Especificación no técnica para mantener seguridad en docs.

**Ajuste humano hecho o por hacer:**  
Confirmación explícita: no agregar credenciales reales.

**Resultado esperado:**  
Documentación limpia de configuración con placeholders.

### Prompt 3 — Rollback y validación post-despliegue
**Prompt usado o planificado:**  
“Define qué validar justo después de publicar demo y qué significa rollback si falla.”

**Cómo guié al asistente:**  
Le pedí pasos medibles y ordenados.

**Ajuste humano hecho o por hacer:**  
Enfocó rollback sobre deshacer release y no perder datos demo.

**Resultado esperado:**  
Sección de despliegue con riesgo controlado para Entrega 1.

---

## 8. OpenSpec + Codex

### Prompt 1 — Preparar change documental
**Prompt usado o planificado:**  
“Como si no existe OpenSpec físico en repo, redacta el apartado de Notas OpenSpec para documentación académica y cómo migrar a estructura OpenSpec después sin sobrecargar.”

**Cómo guié al asistente:**  
Le pedí respetar condición explícita de no crear estructura si no existe.

**Ajuste humano hecho o por hacer:**  
Añadí el nombre de change sugerido: `documentar-entrega1-manus-pos` para ejecución posterior.

**Resultado esperado:**  
Consistencia metodológica sin cambios estructurales no solicitados.

### Prompt 2 — Trazabilidad de cambios documentales
**Prompt usado o planificado:**  
“Diseña formato de cambio documental con propósito, alcance, fuera de alcance y criterios de aceptación.”

**Cómo guié al asistente:**  
Le pedí que sea reutilizable en futuras iteraciones de OpenSpec.

**Ajuste humano hecho o por hacer:**  
Dejé campos de propuesta/listado en texto para activar solo si se habilita OpenSpec.

**Resultado esperado:**  
Plantilla de cambio documental para futuras entregas.

### Prompt 3 — Iteración con IA y revisión humana
**Prompt usado o planificado:**  
“Define flujo de trabajo: crear prompt → revisar respuesta → ajustar criterio → registrar evidencia de cambio.”

**Cómo guié al asistente:**  
Le pedí incluir dónde entra revisión técnica humana y dónde entra corrección.

**Ajuste humano hecho o por hacer:**  
Añadí requisito de que cada prompt de IA tenga resultado esperado y ajuste humano.

**Resultado esperado:**  
Cumplimiento explícito de tarea de documentación de prompts con mejora continua.

---

## Resumen de uso de IA en Entrega 1

Las siguientes prácticas se usaron como estándar:
- Prompt corto, con contexto, restricciones y salida esperada.
- Ajuste humano en cada caso para reducir ambigüedad.
- Validación final manual para alinear con requisitos de evaluación.

