# Prompt: PRD — Web Corporativa B2B de Captación · Ingeniería Geotécnica

---

## ROL Y CONTEXTO

Eres un Product Manager senior con más de 10 años de experiencia en productos digitales B2B de servicios técnico-profesionales, y especialista en Technical SEO para mercados con alta intención local. Has trabajado en proyectos de captación digital para ingenierías, constructoras y despachos técnicos en España. Conoces en profundidad el ciclo de compra en servicios geotécnicos: plazos de licitación, solvencia técnica exigida, normativa CTE DB-SE-C, y la dinámica de decisión entre arquitectos, promotoras e ingenierías civiles.

---

## OBJETIVO DE LA TAREA

Genera un **PRD completo y accionable** para la web corporativa B2B de captación de una empresa de ingeniería de servicios geotécnicos en España. La web tiene como único objetivo de negocio la **generación de leads cualificados**: solicitudes de presupuesto, contactos técnicos y oportunidades de licitación.

Basa **todo el contenido del PRD** en el documento de referencia adjunto:
@docs/mvp-web-b2b-geoteknia.md

Ese documento es la fuente de verdad sobre funcionalidades priorizadas, arquitectura web, errores comunes y estrategia de captación. Extrae de él los datos, las funcionalidades y la lógica de negocio. No inventes funcionalidades que no estén allí; si necesitas completar algo que el documento no cubre explícitamente, indícalo como asunción.

---

## AUDIENCIA / BUYER PERSONAS

El PRD debe contemplar tres perfiles de usuario distintos, con caminos de conversión diferenciados:

| Persona | Rol | Motivación principal | Criterio de decisión | Conversión esperada |
|---|---|---|---|---|
| **P1 – Técnico de proyecto** | Arquitecto, arquitecto técnico, ingeniero de edificación | Cumplir el CTE y entregar el anejo geotécnico en plazo | Plazo de entrega del informe, claridad del alcance, precio orientativo | Formulario multi-paso con datos de parcela |
| **P2 – Promotor / Director de obra** | Promotora inmobiliaria, constructora, jefe de obra | Proveedor fiable con cobertura en su zona y capacidad de movilización rápida | Experiencia demostrada en tipología similar, disponibilidad de maquinaria, respuesta en <48h | Click-to-call, WhatsApp Business, formulario exprés |
| **P3 – Técnico de licitaciones** | Ingeniería civil, consultora, administración pública | Subcontratista cualificado con clasificación de contratista, solvencia técnica acreditada | Certificaciones (ENAC, ISO), equipo técnico colegiado, historial en obra pública | Descarga de ficha de empresa PDF, contacto institucional |

---

## ESTRUCTURA REQUERIDA DEL PRD

Genera el PRD siguiendo **exactamente** estas secciones, en este orden:

### 1. Resumen Ejecutivo (máx. 200 palabras)
- Problema de negocio que resuelve la web
- Propuesta de valor digital diferencial frente a la competencia del sector
- Una frase de visión del producto

### 2. Problema a Resolver
- Describe el problema desde la perspectiva del negocio (por qué la web actual o su ausencia frena la captación)
- Describe el problema desde la perspectiva del usuario (por qué los visitantes no convierten en leads)
- Cuantifica el impacto cuando sea posible (tasa de rebote estimada, leads por mes actuales vs. objetivo, coste de oportunidad)

### 3. Objetivos Medibles (OKRs / KPIs)
Define mínimo **6 métricas de éxito** con valores objetivo realistas a 6 y 12 meses desde el lanzamiento. Usa el formato:

> **[Métrica]** — Baseline estimado: [X] → Objetivo 6M: [Y] → Objetivo 12M: [Z] — [Herramienta de medición]

Las métricas deben cubrir: volumen de leads, tasa de conversión, tráfico orgánico, coste por lead (SEM), Core Web Vitals, y cobertura de indexación.

### 4. Buyer Personas y Flujos de Conversión
Para cada uno de los tres perfiles definidos arriba, describe:
- Job-to-be-done principal
- Pain points específicos que la web debe resolver
- Recorrido de conversión ideal (máx. 3 pasos desde entrada hasta CTA)
- Señales de cualificación que deben capturarse en ese recorrido

### 5. User Stories Principales (mínimo 12)
Formato estricto:
> **Como** [persona], **quiero** [acción en la web], **para** [resultado de negocio o tarea profesional].
> **Criterios de aceptación:** [lista de condiciones verificables]

Distribuye las user stories entre los tres perfiles (al menos 3 por perfil) y cubre las funcionalidades de mayor prioridad del documento de referencia.

### 6. Requisitos Funcionales
Organiza por módulo funcional (no por orden de implementación). Para cada funcionalidad usa:

```
ID: RF-[nn]
Módulo: [nombre del módulo]
Descripción: [qué hace, cómo se comporta]
Prioridad: [Must Have / Should Have / Nice to Have]
Dependencias: [otros RF que deben existir antes]
Impacto en conversión: [cómo afecta directamente a la generación de leads]
Impacto en SEO: [relevancia para posicionamiento orgánico]
```

Incluye **todos los módulos del documento de referencia** con su prioridad original, más los Quick Wins identificados. No omitas ningún módulo del documento fuente.

### 7. Requisitos No Funcionales
Cubre obligatoriamente:
- **Rendimiento:** umbrales de Core Web Vitals (LCP, INP, CLS) con valores numéricos
- **SEO técnico:** indexabilidad, estructura de URLs, canonical tags, schema markup requerido
- **Accesibilidad:** nivel WCAG mínimo
- **Seguridad:** HTTPS, protección de formularios, cumplimiento RGPD en tracking
- **Escalabilidad:** número estimado de URLs en 12 meses (servicios × zonas × casos × blog)
- **Medición:** requisitos de capa de datos GTM/GA4

### 8. Arquitectura de Información y Estructura de URLs
- Reproduce y amplía la estructura de silos del documento de referencia
- Define la estrategia de linking interno entre silos (servicio ↔ zona ↔ casos ↔ blog)
- Especifica para qué combinaciones servicio+zona se crean páginas de intersección dedicadas y por qué
- Indica las reglas de canonical y paginación SEO-friendly

### 9. Criterios de Éxito del MVP (Definition of Done)
Define qué condiciones deben cumplirse para considerar el MVP lanzado. Usa una checklist verificable:

```
[ ] Funcionalidad / requisito — Verificación: [cómo se comprueba] — Responsable: [PM / Dev / SEO / QA]
```

Incluye criterios técnicos (CWV en verde, GSC sin errores críticos), de contenido (mínimo de páginas de servicio, casos de estudio y artículos de blog), de conversión (formulario testeado end-to-end, eventos GA4 disparando correctamente) y de negocio (GBP configurado, NAP consistente).

### 10. Fuera de Alcance (MVP)
Lista explícita de lo que NO forma parte del MVP pero podría incluirse en versiones posteriores. Esto evita scope creep durante el desarrollo.

---

## RESTRICCIONES DE CALIDAD

- **Prohibido el contenido genérico.** Cada requisito, user story y criterio de éxito debe contener terminología real del sector: CTE DB-SE-C, SPT, DPSH, presiómetro Ménard, columnas litológicas, ENAC, schema markup de tipo específico (Service, LocalBusiness, Person, FAQPage), etc.
- **Prohibidas las métricas sin valor numérico.** "Aumentar el tráfico" no es un objetivo medible. "Alcanzar 3.000 sesiones orgánicas/mes a los 12 meses desde el lanzamiento, medido en GA4" sí lo es.
- **Prohibido mezclar el camino de conversión de diferentes personas.** Cada flujo debe ser coherente con las necesidades y el nivel de urgencia del perfil.
- **No repitas el documento fuente literalmente.** Sintetiza, estructura y añade la capa de razonamiento de producto (por qué priorizar esto, qué riesgo implica no tenerlo, qué dependencia técnica tiene).
- **Si algo del documento fuente es ambiguo o incompleto,** indica la asunción que haces y justifícala con una nota `[ASUNCIÓN: ...]`.

---

## FORMATO DE SALIDA

- Markdown con encabezados jerárquicos (H2 para secciones, H3 para subsecciones)
- Tablas para comparativas, métricas y buyer personas
- Bloques de código para IDs de requisitos y checklists
- Sin emojis decorativos
- Longitud estimada: 3.000–5.000 palabras (exhaustivo pero sin relleno)
