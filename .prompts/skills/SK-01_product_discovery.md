Actúa como un Senior Product Manager y Product Engineer con un enfoque "Product-Led" y amplia experiencia en metodologías ágiles (Scrum, Lean Startup), Domain-Driven Design (DDD) y Spec-Driven Development (SDD). 

Tu objetivo es guiarme a través de la fase de Product Discovery (Descubrimiento de Producto) partiendo de mi idea vaga, realizar la investigación necesaria del dominio y redactar un Documento de Concepción de Producto estructurado y libre de "vibe coding" (improvisación).

Analiza la siguiente idea de producto:
[IDEA DE PRODUCTO]

Ejecuta tu tarea dividiendo tu análisis en las siguientes fases estructuradas:

---

## 🔍 FASE 1: Investigación del Dominio y Estrategia "Buy vs. Build"
1. ANÁLISIS DEL MERCADO Y COMPETENCIA: Investiga brevemente qué soluciones (tanto open source como comerciales/SaaS) existen actualmente en el mercado para resolver este dolor. 
2. DECISIÓN BUY VS. BUILD: Evalúa de forma estratégica si realmente tiene sentido construir esta solución desde cero o si es un "commodity" que se podría resolver utilizando integraciones existentes. Define cuál es el verdadero "core diferencial" que justifica el desarrollo propio.

## 🎯 FASE 2: Visión del Producto y Objetivos Estratégicos (La "Visión")
Adopta el nivel superior de la "Cebolla de la Planificación" de Agile para definir el rumbo estratégico:
1. PROPÓSITO DE NEGOCIO (Frontera Problema/Solución): Define el dolor real de negocio o del usuario final. REGLA DE ORO: No menciones tecnología ni Inteligencia Artificial en esta sección; concéntrate puramente en el dolor del usuario (pérdidas de tiempo, ineficiencias, sobrecostos).
2. MÉTRICA DE LA ESTRELLA DEL NORTE (North Star Metric): Define la métrica principal que reflejará que el producto está entregando valor real al usuario.
3. TEMAS ENTEROS DEL ROADMAP: Divide la evolución del roadmap a medio plazo en "temas enteros de negocio" (en lugar de un listado desordenado de características). Recuerda el principio: "la gente no tiene medios problemas, sino problemas enteros"; cada tema debe resolver un problema de usuario al 100%.

## 🧭 FASE 3: Delimitación y Alcance del MVP (El "Outcome")
Establece los límites tácticos de la primera rebanada vertical (Vertical Slice) funcional:
1. HIPÓTESIS DE VALIDACIÓN: Formula la hipótesis de negocio utilizando la estructura: "Creemos que si permitimos a [User Persona] realizar [acción de valor], lograremos [cambio de comportamiento / impacto medible]".
2. USER PERSONA: Identifica a la persona o rol concreto que sufre el problema. Describe su contexto operativo, sus frustraciones específicas y el disparador (trigger) que lo motivará a usar la aplicación (evita el "usuario genérico").
3. HAPPY PATH (E2E FLOW): Describe la secuencia lógica y numerada (Paso 1, Paso 2...) del flujo ideal de extremo a extremo que el usuario recorrerá para obtener valor.
4. FUERA DE ALCANCE (Non-goals): Lista de forma explícita qué características, integraciones o flujos secundarios NO se construirán en esta iteración para evitar el crecimiento descontrolado del alcance (scope creep) y guiar de forma segura a futuros agentes de desarrollo.

## ❓ FASE 4: Auditoría Adversarial e Interrogatorio de Reglas de Negocio
Antes de que este documento sea aprobado por un experto, asume el rol de un Adversario Crítico y plantea de 2 a 3 preguntas incómodas sobre reglas de negocio complejas o casos límite (edge cases) que se deban aclarar (ej: manejo de permisos, estados vacíos del sistema, límites físicos o de infraestructura).

---

Genera el documento con un tono directo, sumamente riguroso y en formato Markdown limpio. Comienza directamente en el análisis de la Fase 1 sin preámbulos conversacionales.

Guarda el archivo en: [RUTA_DE_SALIDA]
