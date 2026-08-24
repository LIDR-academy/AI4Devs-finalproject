---
name: 09_live_stack_verification_workflow
description: "Workflow de verificación en vivo del stack completo: levanta la infraestructura real declarada por el proyecto (nunca asumida), conduce un flujo de usuario real con el motor E2E declarado, y limpia el entorno de prueba por completo al terminar. Automatiza el Antipatrón B de rules/04_verified_implementation_standard.md como procedimiento accionable, no solo como prosa."
version: "1.0.0"
category: "workflows/verification"
---

# 🔬 Workflow 09: Verificación en Vivo del Stack Completo (v1.0.0)

> **DIRECTIVA PARA EL AGENTE:**
> Actúa como un **QA Engineer de Integración** ejecutando la última línea de defensa antes de cerrar un ticket o responder "sí, funciona": correr la aplicación real, de punta a punta, con datos reales — no releer el código ni confiar en que los tests unitarios/de componente ya cubrieron el camino de integración completo.
>
> **Por qué existe:** un login roto en producción nueva (`TK-051`) sobrevivió a 67 tests de frontend, 60 de backend, build y lint — porque ninguno de esos mecanismos levanta el stack real y hace clic en un navegador real. Solo lo hizo este procedimiento, ejecutado ad-hoc, y encontró el bug en la primera corrida.
>
> **FASE 0 OBLIGATORIA (Guard 24):** este workflow no asume Docker, Playwright, ni ningún comando específico. Todo sale de `docs/00_stack_manifest.md`. Si un dato que este workflow necesita no está declarado ahí, DETENTE y pregunta al humano — nunca inventes un comando ni un puerto "razonable".

---

## 🧭 Cuándo se dispara

- El humano pide explícitamente "prueba la app" / "levanta el proyecto" / equivalente.
- Al cerrar un ticket que toca **integración full-stack real**: un endpoint nuevo consumido por UI, un flujo de autenticación, un cambio en el arranque/seed/migraciones del backend, o cualquier ticket marcado como tal en `02_cascading_dev_workflow.md` FASE 5.
- Nunca reemplaza al TDD (`05_test_runner_workflow.md`) ni al QA visual de componente (`SK-20`/`SK-21`) — es la capa adicional que verifica que las piezas ya probadas por separado funcionan juntas, con infraestructura real.

---

## ⚡ FASE 0 — Descubrimiento del Stack Real (Guard 24)

Lee `docs/00_stack_manifest.md` **antes de ejecutar cualquier comando**:

1. **Comando de arranque del stack completo:** busca en §7 (Comandos Canónicos) un comando que levante toda la infraestructura necesaria (ej. `docker compose up -d --build`, o el equivalente declarado — podría ser un `Makefile`, un manifiesto de Kubernetes, un script propio). Si no existe un comando de "stack completo" pero sí existen comandos de servidor de desarrollo individuales (backend/frontend) declarados por separado, úsalos en su lugar y documenta en el reporte final que la verificación corrió en modo dev, no contra las imágenes de producción.
2. **URLs de los servicios:** lee la sección "URLs de Desarrollo Local" (o equivalente) de §7 para el Backend y el Frontend. Si no existe, DETENTE y pregunta al humano antes de asumir un puerto.
3. **Motor de automatización E2E:** lee §5 (Testing) para el navegador/framework E2E declarado (ej. Playwright, Cypress, Selenium — lo que el proyecto haya aprobado bajo Guard 24). Si el proyecto no declaró ninguno, DETENTE y pregunta al humano si debe aprobarse uno antes de continuar (no lo instales en silencio).
4. **Variables de entorno requeridas:** identifica, vía `docs/04_governance_and_quality/rules/security_rules.md` o el validador de entorno real del proyecto, qué variables son obligatorias para arrancar (ej. `SEED_ADMIN_PIN`, `JWT_SECRET`). Genera valores de prueba **sintéticos y evidentemente no productivos** (Guard 6/9) para un `.env` temporal — nunca reutilices secretos reales del humano.

---

## 🚀 FASE 1 — Arranque Real del Stack

1. Levanta la infraestructura con el comando descubierto en FASE 0. Espera a que los healthchecks reales confirmen que cada servicio está listo (nunca un `sleep` fijo arbitrario — Guard 4, No Flaky Tests) — sondea el estado real del contenedor/proceso o el endpoint de salud declarado.
2. Si el arranque falla, **ese es el hallazgo** — repórtalo tal cual (con el error real del comando), no lo enmascares reintentando en silencio ni cayendo a un modo degradado sin decirlo.

---

## 🕹️ FASE 2 — Flujo de Usuario Real con el Motor E2E Declarado

1. Determina el flujo de usuario relevante al ticket en curso (ej. "login con el usuario sembrado", "crear un registro nuevo desde el panel X y confirmar que aparece").
2. Conduce ese flujo con el motor E2E descubierto en FASE 0, interactuando con los selectores/controles reales de la UI — nunca inyectando estado directamente (`localStorage`, mocks) salvo como paso intermedio explícito y declarado para poder alcanzar una pantalla posterior (ej. ya se verificó el login real por separado y se quiere ahorrar tiempo llegando a la pantalla siguiente); el camino crítico del ticket SIEMPRE debe recorrerse por la UI real al menos una vez.
3. Captura evidencia: capturas de pantalla en los puntos clave, y todo error de consola del navegador (`console.error`, `pageerror`) — un flujo "exitoso" con errores de consola silenciosos no cuenta como verificado.

---

## 📋 FASE 3 — Reporte de Hallazgos

Presenta los resultados estructurados según la plantilla universal en `.agents/rules/00_output_reporting_standard.md`, incluyendo explícitamente:
- Qué comando/URL/motor se descubrieron en FASE 0 y de dónde (cita la sección exacta de `docs/00_stack_manifest.md`).
- El flujo de usuario recorrido y las capturas de pantalla obtenidas.
- Cualquier error de consola, aunque el flujo visual haya "funcionado".
- Si se encontró un defecto real, repórtalo con la misma severidad que un fallo de test — este workflow no es opcional/informativo, es una verificación de cierre de ticket.

---

## 🧹 FASE 4 OBLIGATORIA — Limpieza Total del Entorno de Prueba

Ningún artefacto de esta verificación debe sobrevivir a la corrida, salvo el propio fix de código si se encontró y corrigió un defecto:

1. **Detener e infraestructura:** baja el stack con el comando simétrico al de arranque (ej. `docker compose down`) — confirma con `docker ps`/proceso real que no quedó nada corriendo, no asumas que el comando funcionó.
2. **Archivos temporales:** borra cualquier `.env`/script/fixture creado solo para esta verificación. Nunca commitees un `.env` con secretos, aunque sean sintéticos.
3. **Tooling instalado ad-hoc:** si este workflow instaló una dependencia (ej. el motor E2E, si no era ya una dependencia permanente del proyecto) solo para poder ejecutar la prueba, desinstálala al terminar — a menos que el hallazgo de la verificación sea justamente que esa herramienta debería quedar instalada de forma permanente, en cuyo caso se lo propones al humano explícitamente en vez de decidirlo en silencio.
4. **Verificación final de limpieza:** corre `git status` — debe quedar idéntico a como estaba antes de este workflow, salvo los archivos de un fix real que se haya commiteado deliberadamente. Si algo quedó residual, elimínalo antes de reportar el workflow como terminado.

---

## 🔗 Relación con Otros Mecanismos

- Automatiza en procedimiento el **Antipatrón B** de [`rules/04_verified_implementation_standard.md`](../rules/04_verified_implementation_standard.md) ("artefacto documentado pero nunca ejecutado de verdad") — deja de ser solo una instrucción en prosa para el reviewer.
- Complementa, no reemplaza, a [`08_smoke_test_deploy_validation.md`](08_smoke_test_deploy_validation.md) (smoke HTTP post-deploy, sin navegador) y a `SK-20`/`SK-21` (QA visual de componente, sin orquestar infraestructura completa).
- Se invoca desde [`02_cascading_dev_workflow.md`](02_cascading_dev_workflow.md) FASE 5 en tickets de integración full-stack.
