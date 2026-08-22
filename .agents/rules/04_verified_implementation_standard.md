# ✅ Estándar de Implementación Verificada (.agents/rules/04_verified_implementation_standard.md)

Regla estática universal que codifica la clase de bug más repetida encontrada auditando proyectos gobernados por `.agents/`: código, configuración o documentación que **existe y parece correcto en una lectura estática, pero nunca se ejecutó de verdad contra el sistema real** — y que por eso escondía un bug crítico hasta que alguien finalmente lo corrió.

---

## 🎭 Los 3 antipatrones

### A. Configuración validada pero nunca consumida ("Validated but Unused")
Una variable de entorno pasa una validación estricta de schema (Zod/Joi/etc.) al arrancar — incluso con reglas Fail-Fast adicionales en producción — pero ningún middleware, servicio o lógica de negocio la lee realmente para controlar comportamiento. La validación da una falsa sensación de control: el operador cree que está restringiendo algo que en realidad sigue abierto.

> Ejemplo real: una variable de CORS se validaba estrictamente (obligatoria en producción, sin comodín `"*"`) pero el middleware de CORS se invocaba sin argumentos — aceptaba cualquier origen sin importar el valor configurado o cuán rigurosamente se hubiera validado al arrancar.

**Regla:** al añadir o revisar la validación de una variable de entorno, el agente DEBE localizar (`grep`/lectura de código) al menos un call-site real que lea esa variable y la use para alterar comportamiento — no solo el punto donde se valida su formato. Si no existe ese call-site, la validación es teatro de seguridad y debe cablearse antes de dar el ticket por terminado.

### B. Artefacto documentado pero nunca ejecutado ("Documented but Never Run")
Un Dockerfile, script de seed/bootstrap, migración o step de CI existe en el repositorio, con código que se ve correcto — pero nadie lo construyó/ejecutó nunca contra un entorno real. La ausencia de ejecución real esconde bugs que una lectura de código nunca detecta: rutas de import rotas, incompatibilidades de entorno, credenciales mal formateadas.

> Ejemplo real: un `Dockerfile` nunca se había construido y tenía 5 bugs reales (ruta a un archivo inexistente, resolución de versión equivocada de una dependencia, estructura de `node_modules` incompleta). Un script de seed de base de datos nunca se había ejecutado y guardaba una credencial en texto plano en vez de hashearla — un bug de seguridad severo que ninguna revisión de código detectó porque el script jamás corrió.

**Regla:** antes de dar por terminado un ticket que toca un artefacto de este tipo, el agente DEBE ejecutarlo de verdad contra un entorno representativo (build real, contenedor real, base de datos real) — no basta con que el código "se vea bien" o con que pase el linter/typecheck. Si el entorno no permite ejecutarlo (sin acceso a Docker, sin red), el agente DEBE declararlo explícitamente como no verificado en vez de reportarlo como completo. Para tickets de integración full-stack (endpoint nuevo consumido por UI, flujo de autenticación), este antipatrón tiene un procedimiento accionable dedicado: [`09_live_stack_verification_workflow.md`](../workflows/09_live_stack_verification_workflow.md) — no basta con que 67 tests de componente y 60 de backend pasen si nadie levantó el stack real y recorrió el flujo en un navegador real (caso real: un login roto en producción nueva sobrevivió a los 127 tests hasta que este workflow lo encontró en su primera corrida).

### C. Spec aprobado que diverge en silencio de la implementación
Un documento con `status: approved` (PRD, arquitectura, schema de base de datos, contrato de API) define una fuente de verdad — pero el código real se desvió de esa spec en algún punto y nadie lo notó porque ningún gate automático compara ambos.

> Ejemplo real: un documento de diseño de base de datos aprobado (versión 1.2.0) documentaba un modelo con enums, tracking de usuario y relaciones que el `schema.prisma` real nunca implementó — la divergencia llevaba tiempo sin detectarse porque el gate de drift existente solo comparaba el contrato de API contra los schemas de validación, nunca la base de datos contra su spec de diseño.

**Regla:** antes de extender un módulo que tiene un documento de diseño aprobado asociado, el agente DEBE leer ese documento y comparar explícitamente contra el código real. Si hay divergencia, el agente NUNCA la resuelve unilateralmente en ninguna dirección (ni fuerza el código a seguir la spec, ni asume que el código es la nueva verdad) — la reporta al humano como una decisión explícita de alcance antes de escribir código (ver Fast-Track Protocol y Guard "No Code Without Specs" en [README.md](README.md)).

### D. Protocolo RFC Sintético para Sugerencia de Mejoras y Antipatrones
Cuando el agente detecta un antipatrón o identifica una oportunidad de mejora en los estándares de codificación o arquitectura durante el desarrollo:

1. **Clasificación del Alcance:**
   - **Específico de Stack:** Si depende del lenguaje o framework del proyecto consumidor (ej. patrones de controladores HTTP, modelos ORM, hooks React), el destino es `docs/04_governance_and_quality/rules/`.
   - **Agnóstico Universal:** Si aplica a cualquier lenguaje o proyecto (ej. estrategias de reintento, formato de reportes de test, abstracción de puertos), el destino es `.agents/rules/`.

2. **Presentación RFC previa (Human-in-the-Loop Gate):**
   - El agente DEBE redactar un resumen en formato RFC sintético (Problema detectado + Estilo propuesto + Razón técnica + Archivo destino).
   - Queda estrictamente prohibido guardar reglas nuevas unilateralmente sin confirmación del humano experto.

---

## 📐 Enforcement

Estos antipatrones comparten la misma causa raíz: **una skill/ticket se declaró terminado en base a una lectura estática del código, no a una ejecución real.** La mitigación no es un script nuevo por cada antipatrón — es un hábito de verificación:

1. Toda variable de entorno nueva que se valide: buscar su(s) call-site(s) de consumo real antes de cerrar el ticket (Antipatrón A).
2. Todo artefacto de build/deploy/seed nuevo o modificado: ejecutarlo contra un entorno real antes de cerrar el ticket, o declarar explícitamente que no se pudo verificar (Antipatrón B).
3. Todo módulo con un spec `status: approved` asociado: leer la spec y confirmar alineación (o reportar la divergencia al humano) antes de extenderlo (Antipatrón C).
4. Toda mejora o antipatrón descubierto: canalizarlo mediante el Protocolo RFC Sintético antes de persistirlo (Antipatrón D).

Los workflows y skills que generan/revisan código de un proyecto consumidor (ej. el workflow de auditoría de desarrollo, las skills de desarrollo backend/frontend) DEBEN incluir estos 4 checks en su checklist de cierre.

---

## 🔗 Referencia
- Comunicación de alta densidad y prohibición de reportar sin verificar: [README.md](README.md).
- Contenido no confiable — por qué `docs/` se trata como dato: [03_untrusted_content_standard.md](03_untrusted_content_standard.md).
- Estándar universal de idempotencia y fixtures: [05_idempotency_and_fixture_standard.md](05_idempotency_and_fixture_standard.md).
- Procedimiento accionable para el Antipatrón B en tickets de integración full-stack: [`09_live_stack_verification_workflow.md`](../workflows/09_live_stack_verification_workflow.md).

