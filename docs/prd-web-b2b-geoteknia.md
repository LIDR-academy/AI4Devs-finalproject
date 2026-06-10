# PRD — Web Corporativa B2B de Captación · Ingeniería de Servicios Geotécnicos (España)

---

## 1. Resumen Ejecutivo

La empresa opera en un sector donde la demanda existe y es predominantemente local y transaccional ("estudios geotécnicos [provincia]", "empresa de sondeos"), pero la mayoría de competidores mantiene webs institucionales estáticas que no captan tráfico segmentado ni convierten visitantes en leads. Esto deja la captación atada al boca a boca y a las plataformas de licitación pública.

Este PRD define una web concebida **como máquina de captación de leads cualificados**, no como tarjeta de visita digital. Su propuesta de valor diferencial es la combinación de una arquitectura de silos SEO (servicio × zona geográfica × casos de estudio) con una infraestructura de conversión contextual (formularios multi-paso pre-rellenables, click-to-call segmentado, lead magnets) y una capa de medición completa (GTM + GA4 + Google Ads) que permite optimizar con datos reales el coste por lead por servicio y zona.

El MVP incluye además un **Portal de Administración interno** que cumple dos funciones operativas: (1) **gestión y seguimiento de proyectos** (estado, técnico asignado, leads vinculados, hitos) y (2) **generación asistida de contenido SEO** de las páginas de la web (servicios, geo-landings, casos de estudio, artículos de blog, FAQs) mediante la **API de Claude (Anthropic)**. El portal convierte el contenido —el principal cuello de botella para construir la autoridad temática y escalar los silos servicio × zona— en un proceso semiautomatizado y con un humano técnico siempre en el bucle de revisión.

**Visión del producto:** convertir la web en el canal de adquisición de leads cualificados de menor coste marginal del negocio, capaz de captar y segmentar demanda orgánica y de pago por servicio y por provincia antes de la primera llamada comercial, sostenido por un back-office que permite producir contenido SEO a escala y trazar cada proyecto desde el lead hasta la entrega.

---

## 2. Problema a Resolver

### 2.1 Perspectiva de negocio

La empresa carece de un canal digital de captación predecible y medible. La web actual (o su ausencia funcional) opera como catálogo institucional: pocas páginas estáticas, una única página de "Servicios" con un listado de bullets y un formulario genérico de contacto. Las consecuencias para el negocio:

- **Dependencia total del boca a boca y de las plataformas de licitación pública.** No hay un flujo entrante de leads atribuible al canal digital.
- **Invisibilidad orgánica.** Con 6 páginas indexadas y cero autoridad temática, el dominio solo aparece para búsquedas de marca exacta. Las búsquedas transaccionales del sector (50–500 búsquedas/mes por provincia para los términos principales) las capturan los competidores o se quedan sin atender.
- **Gasto de SEM ineficiente.** Cuando se invierte en Google Ads (CPC de 3–8 € en España), el tráfico aterriza en la home o en la página genérica de servicios, con tasas de conversión por debajo del 1 % y sin tracking granular para distinguir leads cualificados de clics vacíos.
- **Imposibilidad de priorizar.** Sin medición no se sabe qué servicios o zonas generan más valor, pese a que el valor medio de un presupuesto oscila entre 2.000 € y 200.000 € según la tipología (un lead de geotecnia portuaria puede valer 50× uno de vivienda unifamiliar).

> `[ASUNCIÓN: el documento fuente no aporta cifras reales de baseline. Se asume el escenario típico del sector descrito en el documento — web institucional con ~6 páginas indexadas, <1 lead orgánico/mes y conversión SEM <1 % — como punto de partida para dimensionar objetivos. Debe validarse con datos reales de GA4/GSC del dominio actual antes del kickoff.]`

### 2.2 Perspectiva del usuario

Los tres perfiles de decisión (arquitecto técnico, promotor/director de obra, técnico de licitaciones) no encuentran en la web actual respuesta a sus objeciones específicas:

- **No hay segmentación por intención.** Todos los perfiles aterrizan en la misma página genérica y en el mismo formulario, pese a tener necesidades, urgencias y criterios de decisión radicalmente distintos.
- **No hay prueba de solvencia local.** Un promotor no encuentra evidencia de que la empresa haya trabajado en su provincia ni sobre su geología (arcillas expansivas del Keuper en Valencia, arcosas y yesos en Madrid, margas del Guadalquivir en Sevilla…).
- **Fricción de contacto.** El director de obra que necesita un geotécnico en 24–48 h por un terreno inesperado no rellena formularios largos: necesita llamar o enviar la ubicación de la parcela en segundos.
- **Asimetría de información.** El arquitecto que duda si necesita 2 o 4 sondeos según el CTE no pide presupuesto hasta resolver esa duda, y la web no se la resuelve.

### 2.3 Cuantificación del impacto (objetivos de partida)

| Indicador | Situación de partida (estimada) | Coste de oportunidad |
|---|---|---|
| Leads orgánicos/mes | < 1 | Demanda local desatendida capturada por competidores |
| Conversión de tráfico SEM | < 1 % | 1.000–3.000 €/mes en Ads → 2–5 leads, 1 cualificado |
| Páginas indexadas | ~6 | Cero topical authority; invisible fuera de marca |
| Llamadas trackeadas como conversión | 0 | Infravaloración del canal orgánico real |

---

## 3. Objetivos Medibles (OKRs / KPIs)

> Formato: **[Métrica]** — Baseline estimado → Objetivo 6M → Objetivo 12M — Herramienta

1. **Leads cualificados totales/mes (formulario + llamada + WhatsApp + lead magnet)** — Baseline: < 1 → 6M: 12–18 → 12M: 30–40 — GA4 (eventos de conversión) + CRM.
2. **Tasa de conversión visita→lead en páginas de servicio** — Baseline: < 1 % → 6M: 2,5 % → 12M: 4 % — GA4 (conversión por landing).
3. **Sesiones orgánicas/mes** — Baseline: ~200 → 6M: 1.500 → 12M: 3.500 — GA4 + Google Search Console.
4. **Keywords transaccionales servicio+zona en top 10** — Baseline: 0 → 6M: 15 → 12M: 40 — GSC (consultas) / herramienta de rank tracking.
5. **Coste por lead cualificado (SEM)** — Baseline: > 200 € → 6M: 90 € → 12M: 55 € — Google Ads + GA4 (atribución por keyword/landing).
6. **Core Web Vitals en verde en plantillas principales** — Baseline: rojo/naranja → 6M: 100 % plantillas servicio y zona → 12M: 100 % del sitio — GSC (informe CWV) + Lighthouse CI.
7. **Cobertura de indexación (URLs válidas indexadas)** — Baseline: ~6 → 6M: 60+ → 12M: 150+ — GSC (informe de cobertura).
8. **Tiempo medio de primera respuesta al lead** — Baseline: > 48 h / variable → 6M: < 2 h (email automático) + propuesta < 48 h lab. → 12M: idem consolidado — Email transaccional + CRM.

> `[ASUNCIÓN: los baselines y objetivos son estimaciones de producto coherentes con los volúmenes de búsqueda y CPCs citados en el documento fuente. Requieren recalibración tras 30 días de datos reales post-lanzamiento.]`

---

## 4. Buyer Personas y Flujos de Conversión

### P1 — Técnico de proyecto (arquitecto, arquitecto técnico, ingeniero de edificación)

- **Job-to-be-done:** obtener un estudio geotécnico que cumpla el CTE DB-SE-C para entregar el anejo geotécnico del proyecto en plazo, sin sorpresas de precio ni de calendario.
- **Pain points:** opacidad de precio y plazo; duda sobre el alcance necesario (nº de sondeos, profundidad); incertidumbre sobre si la empresa trabaja en su zona.
- **Recorrido de conversión ideal (3 pasos):** landing de servicio (`/servicios/estudios-geotecnicos/`) → Calculadora de Alcance (nº orientativo de sondeos/profundidad según CTE) → Formulario multi-paso con datos de parcela y servicio/provincia pre-rellenados.
- **Señales de cualificación a capturar:** tipo de edificación, nº de plantas, superficie, fase del proyecto, provincia de la obra, rol profesional.

### P2 — Promotor / Director de obra (promotora, constructora, jefe de obra)

- **Job-to-be-done:** contratar un proveedor fiable con cobertura en su zona y capacidad de movilizar maquinaria rápido, a veces con urgencia (terreno inesperado en excavación).
- **Pain points:** necesita prueba de experiencia en tipología y geología similares; necesita capacidad operativa demostrable (profundidad de perforación, sonda sobre orugas para accesos difíciles); plazos críticos.
- **Recorrido de conversión ideal (3 pasos):** geo-landing de su provincia (`/zonas/[provincia]/`) o caso de estudio similar → verificación de maquinaria/experiencia → Click-to-call / WhatsApp Business con mensaje pre-rellenado o microconversión "Enviar ubicación de la parcela".
- **Señales de cualificación a capturar:** provincia/localización, tipo de obra, urgencia, referencia catastral o pin de Maps, teléfono.

### P3 — Técnico de licitaciones (ingeniería civil, consultora, administración pública)

- **Job-to-be-done:** seleccionar/subcontratar un geotécnico que acredite solvencia técnica, clasificación de contratista y experiencia en obra pública para un concurso o licitación.
- **Pain points:** necesita verificar certificaciones (ENAC del laboratorio, ISO), equipo técnico colegiado, clasificación como contratista (grupos/subgrupos) y experiencia con organismos contratantes; plazos de presentación estrictos.
- **Recorrido de conversión ideal (3 pasos):** página de Acreditaciones / Licitaciones → fichas de Equipo Técnico (colegiación) + proyectos de obra pública → Descarga de ficha de empresa/solvencia (PDF) + formulario institucional con campo de expediente.
- **Señales de cualificación a capturar:** organismo/tipo de licitación, referencia de expediente, necesidad de UTE, importe estimado, contacto corporativo.

### P4 — Usuario interno del Portal de Administración (no es buyer persona; es usuario del back-office)

Perfil operativo de la propia empresa que gestiona el sistema. Se distinguen dos roles:

- **P4a — Gestor de proyectos / Comercial.** Job-to-be-done: convertir leads entrantes en proyectos, asignarlos a un técnico y seguir su estado (de "lead nuevo" a "entregado") sin salir del portal. Pain points: hoy los leads llegan por email/teléfono y se gestionan en hojas de cálculo dispersas, sin trazabilidad lead→proyecto ni visibilidad del pipeline.
- **P4b — Editor de contenido / Responsable SEO.** Job-to-be-done: producir y publicar contenido SEO técnicamente riguroso (servicios, geo-landings con geología local, casos de estudio, artículos de blog, FAQs) al ritmo que exige la estrategia de silos, sin redactar cada pieza desde cero. Pain points: el sector tiene déficit de redactores que dominen la terminología geotécnica; redactar manualmente 100+ URLs es inviable en plazo. Necesita un borrador asistido por IA (Claude) que respete normativa, terminología y estructura SEO, y que él revise, edite y apruebe.

---

## 5. User Stories Principales

> **US-01 — P1.** Como **arquitecto técnico**, quiero **estimar el nº orientativo de sondeos y la profundidad según el CTE para mi edificio** introduciendo tipo de obra, plantas, superficie y provincia, para **dimensionar el alcance antes de pedir presupuesto**.
> **Criterios de aceptación:** la calculadora devuelve alcance técnico (nº de sondeos, profundidad estimada, ensayos recomendados) sin dar precio; muestra CTA "Solicitar presupuesto exacto" que pre-rellena el formulario; dispara evento GA4 `calculator_use`.

> **US-02 — P1.** Como **arquitecto**, quiero **una página específica del servicio "estudios geotécnicos para edificación" con normativa, metodología y entregables**, para **comprobar que el servicio cubre exactamente lo que mi proyecto necesita**.
> **Criterios de aceptación:** la página incluye CTE DB-SE-C, metodología paso a paso, entregables (memoria, columnas litológicas, resultados de laboratorio), breadcrumbs, schema `Service` y links internos a casos y geo-landing.

> **US-03 — P1.** Como **ingeniero de edificación**, quiero **un formulario multi-paso que recuerde el servicio y la provincia desde los que llego**, para **pedir presupuesto sin reintroducir datos y con baja fricción**.
> **Criterios de aceptación:** el formulario admite URL params (`?servicio=...&provincia=...`); valida en tiempo real; muestra indicador de progreso; al enviar muestra confirmación en pantalla + email con nº de referencia; dispara conversión en GA4/GTM.

> **US-04 — P1.** Como **arquitecto**, quiero **resolver dudas frecuentes como "¿cuántos sondeos necesita mi edificio?"**, para **decidir si pido presupuesto sin esperar a una llamada**.
> **Criterios de aceptación:** existe FAQ con schema `FAQPage`; cada respuesta enlaza a servicio o artículo relevante; las preguntas aparecen como candidatas a rich snippet.

> **US-05 — P2.** Como **director de obra con un imprevisto en excavación**, quiero **llamar o escribir por WhatsApp en un clic desde la página del servicio**, para **conseguir un geotécnico en 24–48 h sin rellenar formularios**.
> **Criterios de aceptación:** botón `tel:` en cabecera sticky y CTAs; widget WhatsApp con mensaje pre-rellenado que incluye servicio + provincia de la página; cada interacción se registra como evento GA4 (`click_tel`, `click_whatsapp`).

> **US-06 — P2.** Como **promotor**, quiero **ver casos de estudio filtrables por provincia y tipología de obra**, para **comprobar experiencia demostrable en condiciones similares a las de mi proyecto**.
> **Criterios de aceptación:** catálogo filtrable por servicio, tipología, provincia y año; cada caso es URL indexable con problemática, solución, maquinaria, volumen (nº sondeos, metros) y fotos reales; schema `Article`/`CreativeWork`; CTA con servicio y zona pre-seleccionados.

> **US-07 — P2.** Como **jefe de obra en campo con el móvil**, quiero **enviar solo la referencia catastral o un pin de Maps y mi contacto**, para **que me llamen con contexto sin completar el formulario largo**.
> **Criterios de aceptación:** microconversión flotante con Google Maps embed y campo de referencia catastral; envío en ≤ 15 s; genera lead con localización + contacto; evento GA4 `send_location`.

> **US-08 — P2.** Como **constructora**, quiero **una página por provincia que mencione la geología local y los proyectos realizados allí**, para **percibir proximidad y capacidad de ejecución en mi zona**.
> **Criterios de aceptación:** geo-landing con ≥ 800–1.200 palabras originales, geología local específica, casos enlazados, base operativa/maquinaria y CTA con provincia pre-seleccionada; no thin content.

> **US-09 — P3.** Como **técnico de licitaciones de una administración**, quiero **ver la clasificación de contratista, certificaciones ENAC/ISO y registros**, para **verificar la solvencia técnica exigida en el pliego**.
> **Criterios de aceptación:** página de Acreditaciones con logo, nº de registro/acreditación y enlace verificable por credencial; schema `Organization` con `hasCredential`.

> **US-10 — P3.** Como **ingeniería civil que prepara un concurso**, quiero **descargar una ficha técnica/de solvencia en PDF y ver el equipo técnico colegiado**, para **incluir la documentación del subcontratista en mi oferta**.
> **Criterios de aceptación:** lead magnet gated (nombre, email, empresa, rol) con Thank You page de URL única; fichas de equipo con schema `Person` (`jobTitle`, `worksFor`, `alumniOf`) y colegiación.

> **US-11 — P3.** Como **responsable de UTE**, quiero **un formulario de licitaciones con campo de referencia de expediente**, para **que el equipo comercial reaccione rápido dentro del plazo de presentación**.
> **Criterios de aceptación:** página `/licitaciones/` con clasificación (grupos/subgrupos), experiencia por organismo contratante y formulario con campo de expediente/plataforma; evento de conversión diferenciado en GA4 (`lead_type=licitacion`).

> **US-12 — Transversal.** Como **lead que acaba de enviar una solicitud**, quiero **recibir confirmación inmediata con el técnico asignado y el plazo de respuesta**, para **dejar de buscar alternativas en la competencia**.
> **Criterios de aceptación:** email transaccional en < 2 h con nombre del técnico colegiado y plazo (≤ 48 h lab.); Thank You page con URL única medible; reduce solicitudes duplicadas a competidores.

> **US-13 — Marketing/SEO.** Como **responsable de marketing**, quiero **medir qué servicio y provincia genera cada lead y su origen (orgánico/SEM)**, para **optimizar contenido y presupuesto de Ads por valor de lead**.
> **Criterios de aceptación:** dataLayer con `servicio`, `provincia`, `lead_type`; eventos de conversión, audiencias de remarketing por servicio y atribución multi-canal en GA4; tag de conversión de Google Ads activo.

> **US-14 — P4a (Portal).** Como **gestor de proyectos**, quiero **que cada lead entrante (formulario, llamada, WhatsApp, ubicación de parcela) entre automáticamente en el portal como ficha de proyecto**, para **gestionarlo y darle seguimiento sin reintroducir datos**.
> **Criterios de aceptación:** el lead crea una ficha con servicio, provincia, datos de contacto y `lead_type`; queda en estado inicial "Lead nuevo"; trazabilidad del origen (orgánico/SEM/directo); acceso restringido a usuarios autenticados.

> **US-15 — P4a (Portal).** Como **gestor de proyectos**, quiero **asignar cada proyecto a un técnico, cambiar su estado y registrar hitos y plazos**, para **tener visibilidad del pipeline y del cumplimiento del plazo de respuesta (<48 h)**.
> **Criterios de aceptación:** estados configurables (Lead nuevo → Cualificado → Presupuestado → Adjudicado → En ejecución → Entregado → Perdido); asignación a técnico del equipo; campos de fecha de hitos; vista de pipeline filtrable por estado, técnico, servicio y provincia.

> **US-16 — P4b (Portal · Claude AI).** Como **editor de contenido**, quiero **generar un borrador de página de servicio o geo-landing seleccionando servicio, provincia y parámetros clave**, para **producir contenido SEO técnicamente riguroso sin redactarlo desde cero**.
> **Criterios de aceptación:** el portal llama a la API de Claude con un prompt estructurado por tipo de página; el borrador incluye terminología real (CTE DB-SE-C, SPT/DPSH, geología local de la provincia), estructura H1-H2-H3, meta title/description propuestos y sugerencia de schema; el borrador queda en estado "Borrador IA" sin publicarse; nunca se publica sin revisión humana.

> **US-17 — P4b (Portal · Claude AI).** Como **responsable SEO**, quiero **revisar, editar y aprobar el contenido generado por IA antes de su publicación**, para **garantizar rigor técnico, evitar imprecisiones y cumplir E-E-A-T en contenido YMYL**.
> **Criterios de aceptación:** editor con vista previa; flujo de estados Borrador IA → En revisión → Aprobado → Publicado; registro de quién aprueba y cuándo; posibilidad de regenerar secciones concretas; aviso visible de que el contenido debe verificarse técnicamente.

> **US-18 — P4b (Portal).** Como **editor de contenido**, quiero **publicar el contenido aprobado directamente en la página correspondiente de la web**, para **escalar la producción de los silos servicio × zona sin intervención de desarrollo**.
> **Criterios de aceptación:** la publicación crea/actualiza la URL en el silo correcto; aplica el schema correspondiente; añade la URL al sitemap; el contenido del portal nunca es indexable (`/admin` con noindex + robots disallow).

---

## 6. Requisitos Funcionales

> Organizados por módulo. Prioridad MoSCoW alineada con la prioridad del documento fuente (Alta→Must, Media→Should, Baja→Nice). Los Quick Wins se integran como módulos propios.

```
ID: RF-01
Módulo: Páginas de Servicio (Service Landing Pages) con arquitectura de silo
Descripción: Una página por servicio principal (estudios geotécnicos para edificación,
  sondeos mecánicos a rotación/percusión, ensayos de laboratorio de suelos, control de
  calidad de cimentaciones, informes periciales, geotecnia marítima/portuaria,
  instrumentación geotécnica, hidrogeología). Cada página: definición técnica,
  metodología paso a paso, normativa aplicable (CTE DB-SE-C, UNE-EN ISO 22476, Guía de
  Cimentaciones del Ministerio), equipamiento (sonda, penetrómetro), tipología de
  proyectos, entregables (memoria geotécnica, columnas litológicas, resultados de
  laboratorio) y CTA contextual de presupuesto. Breadcrumbs, schema Service, links
  internos a casos y geo-landing correspondiente.
Prioridad: Must Have
Dependencias: RF-08 (formulario), RF-13 (silos/URLs)
Impacto en conversión: landing de entrada específica → menor bounce, segmentación del
  lead por servicio desde el primer contacto.
Impacto en SEO: posiciona long-tails transaccionales ("empresa de sondeos geotécnicos",
  "ensayo SPT Madrid"); concentra autoridad temática por cluster; relevancia semántica
  con terminología real (SPT, DPSH, presiómetro Ménard, corte directo CU/CD).
```

```
ID: RF-02
Módulo: Formulario de Solicitud de Presupuesto Contextual y Multi-paso
Descripción: Formulario principal con campos condicionados al servicio. Paso 1: servicio
  + provincia/localización de obra. Paso 2: datos de proyecto (tipo de obra, nº plantas,
  superficie, fase). Paso 3: contacto (nombre, empresa, email corporativo, teléfono,
  rol). Validación en tiempo real, autocompletado de localidades, indicador de progreso,
  envío asíncrono con confirmación en pantalla + email con nº de referencia.
  Pre-rellenable por URL params (?servicio=sondeos&provincia=madrid). Cada envío dispara
  conversión en GTM/GA4.
Prioridad: Must Have
Dependencias: RF-10 (tracking GTM/GA4), RF-Q3 (email transaccional)
Impacto en conversión: principal punto de conversión; multi-paso reduce fricción y sube
  completion rate; cualificación progresiva para priorización comercial sin llamada previa.
Impacto en SEO: integrado como CTA en cada servicio/caso, reduce clics entrada→conversión
  y mejora señales de engagement/resolución de intent.
```

```
ID: RF-03
Módulo: Catálogo de Proyectos / Casos de Estudio Técnicos
Descripción: Sección filtrable por servicio, tipología de obra, provincia/CCAA y año.
  Cada caso es página individual: localización, cliente (si público o con permiso),
  servicio prestado, problemática geotécnica (nivel freático alto, rellenos antrópicos,
  arcillas expansivas, roca somera), solución técnica, maquinaria, volumen (nº sondeos,
  metros perforados, ensayos) y resultado. Fotografías de campo reales. Schema
  Article/CreativeWork con localización estructurada.
Prioridad: Must Have
Dependencias: RF-13 (silos), RF-01 (servicios), RF-04 (geo-landings)
Impacto en conversión: prueba de solvencia (herramienta de confianza más efectiva en B2B
  técnico); CTA con servicio y zona pre-seleccionados.
Impacto en SEO: URLs indexables con servicio+localización+tipología (long-tails);
  contenido único e irreplicable → ventaja E-E-A-T.
```

```
ID: RF-04
Módulo: Páginas de Cobertura Geográfica (Geo-Landing Pages)
Descripción: Página por provincia/municipio operativo. Contiene: actividad en la zona,
  geología local predominante (ej. Madrid: arcosas, arenas de miga, yesos del Terciario;
  Barcelona: materiales deltaicos, pizarras paleozoicas; Valencia: arcillas expansivas
  del Keuper, gravas cuaternarias), casos en esa zona (enlace filtrado), maquinaria/base
  operativa y CTA con provincia pre-seleccionada. Mínimo 800–1.200 palabras originales
  (no thin content).
Prioridad: Must Have
Dependencias: RF-13 (silos), RF-03 (casos)
Impacto en conversión: capta intención local; percepción de proximidad y capacidad de
  ejecución → mayor conversión.
Impacto en SEO: patrón servicio+localidad dominante (50–500 búsquedas/mes por provincia);
  compite por Local Pack y orgánico geolocalizado.
```

```
ID: RF-05
Módulo: Fichas de Perfil del Equipo Técnico
Descripción: Perfiles de geólogos, ingenieros geotécnicos y directores técnicos. Cada
  ficha: nombre, titulación, colegiación (nº si público), años de experiencia,
  especialización, publicaciones/ponencias, proyectos destacados con enlace al caso.
  Schema Person (jobTitle, worksFor, alumniOf). Directorio técnico que refuerza la firma
  de informes, no un "sobre nosotros".
Prioridad: Must Have
Dependencias: RF-03 (casos)
Impacto en conversión: credibilidad del firmante reduce objeción de confianza; solvencia
  técnica del personal exigida por AAPP.
Impacto en SEO: refuerza E-E-A-T en contenido YMYL; entidades en Knowledge Graph;
  potenciales menciones/backlinks por autoría.
```

```
ID: RF-06
Módulo: Blog Técnico / Centro de Conocimiento Geotécnico
Descripción: Contenido técnico-educativo categorizado (normativa, tipologías de terreno,
  técnicas de investigación, patologías de cimentación, guías). Cada artículo: schema
  Article, autor vinculado a ficha de equipo, tabla de contenidos, links internos a
  servicios, CTA contextual. Paginación SEO-friendly; URLs /blog/[categoria]/[slug].
Prioridad: Must Have
Dependencias: RF-05 (autoría), RF-01 (servicios), RF-13 (silos)
Impacto en conversión: capta top-of-funnel informacional; nurturing (remarketing,
  newsletter); artículos near-transaccionales ("cuánto cuesta/tarda un estudio
  geotécnico") convierten directo.
Impacto en SEO: construye topical authority; long-tails de volumen agregado; alimenta
  links internos a páginas transaccionales.
```

```
ID: RF-07
Módulo: Página de Equipamiento y Maquinaria
Descripción: Parque de maquinaria con ficha por equipo: tipo de sonda (rotación,
  percusión, mixta), modelo, profundidad máx., diámetros, equipos de ensayo in situ
  (SPT, DPSH, Lefranc, Lugeon, presiómetro), laboratorio propio/concertado con
  acreditación ENAC, vehículos especiales (orugas, plataformas para espacios confinados).
  Foto real y vínculo al servicio donde se usa.
Prioridad: Should Have
Dependencias: RF-01 (servicios)
Impacto en conversión: demuestra capacidad operativa; elimina objeciones técnicas antes
  de la llamada.
Impacto en SEO: contenido único con terminología específica; diferenciación indexable.
```

```
ID: RF-08
Módulo: Click-to-Call y Contacto Directo Segmentado
Descripción: Botones tel: en cabecera sticky y en CTAs de servicio (visibles en móvil),
  segmentados por departamento (presupuestos / dirección técnica / email licitaciones).
  Widget WhatsApp Business con mensaje pre-rellenado (servicio + provincia de la página).
  Cada interacción como evento GA4 (click_tel, click_whatsapp, click_email).
Prioridad: Should Have
Dependencias: RF-10 (tracking), RF-09 (NAP/GBP)
Impacto en conversión: muchas conversiones B2B son telefónicas; urgencia 24–48 h;
  segmentación evita colapso de líneas.
Impacto en SEO: señales de comportamiento (CTR, engagement); consistencia NAP con GBP.
```

```
ID: RF-09
Módulo: Integración Google Business Profile + Schema LocalBusiness
Descripción: GBP optimizado (categoría "Empresa de ingeniería geotécnica"/"Geotechnical
  engineer", área de servicio por provincias, horario, fotos, publicaciones de casos).
  En web: schema LocalBusiness/ProfessionalService con areaServed multivalor,
  hasOfferCatalog vinculado a servicios, aggregateRating si hay reseñas verificables.
  Consistencia NAP absoluta entre web, GBP y directorios (Páginas Amarillas, Europages,
  registros colegiales).
Prioridad: Should Have
Dependencias: RF-13 (URLs), RF-04 (zonas)
Impacto en conversión: Local Pack sobre orgánico para intención local; reseñas como prueba
  social.
Impacto en SEO: GBP dominante en local; areaServed comunica cobertura sin oficina física;
  NAP consistente refuerza señales de entidad.
```

```
ID: RF-10
Módulo: Tracking de Conversiones y Capa de Datos (GTM + GA4)
Descripción: GTM con dataLayer estructurado: envíos de formulario (servicio, provincia,
  tipo de usuario), clicks tel/WhatsApp/email, descargas, scroll depth (25/50/75/100 %),
  tiempo de engagement. GA4: eventos de conversión, audiencias de remarketing por servicio,
  atribución multi-canal. Tag de conversión de Google Ads para CPL por servicio y zona.
Prioridad: Should Have
Dependencias: ninguna (infraestructura base; habilita el resto de medición)
Impacto en conversión: habilita optimización; identifica páginas/zonas que mejor convierten.
Impacto en SEO: mide ROI del SEO (keywords→leads, ratio visita/conversión).
```

```
ID: RF-11
Módulo: Descarga de Recursos Técnicos (Lead Magnets)
Descripción: Contenido gated: checklist de documentación para un estudio geotécnico, guía
  de interpretación de informes para arquitectos, tabla de ensayos de laboratorio por
  normativa, modelo de anejo geotécnico para proyecto básico. Formulario breve (nombre,
  email, empresa, rol) con integración a CRM/email marketing. Thank You pages con URL
  única. Recurso vinculado a su categoría de servicio.
Prioridad: Should Have
Dependencias: RF-10 (tracking), RF-Q3 (email)
Impacto en conversión: capta leads en fase de investigación (nurturing a medio plazo);
  posiciona como referente.
Impacto en SEO: backlinks naturales desde blogs de arquitectura, foros y universidades.
```

```
ID: RF-12
Módulo: Acreditaciones, Certificaciones y Registros
Descripción: Página con acreditación ENAC del laboratorio, ISO 9001/14001, inscripción en
  registro del Ministerio, clasificación de contratista (grupos/subgrupos), seguros de RC
  profesional, asociaciones (AETESS, ALGI, colegio profesional). Cada credencial con logo,
  nº de registro/acreditación y documento/enlace verificable. Schema Organization con
  hasCredential.
Prioridad: Should Have
Dependencias: RF-15 (licitaciones)
Impacto en conversión: requisito de solvencia en licitaciones públicas; ENAC como
  diferenciador en privado.
Impacto en SEO: datos estructurados de autoridad/confianza (E-E-A-T); backlinks
  institucionales de organismos acreditadores.
```

```
ID: RF-13
Módulo: Sitemap XML Dinámico + Robots.txt Optimizado
Descripción: Sitemap XML automático con servicios, geo-landings, casos y artículos
  (prioridad/frecuencia diferenciadas). Excluir Thank You, resultados de filtrado y
  duplicados de parámetros. Robots.txt que permite crawl de secciones indexables y bloquea
  recursos internos. Sitemap de imágenes para fotos de obra/maquinaria. Registro en GSC y
  monitorización de cobertura.
Prioridad: Should Have
Dependencias: ninguna (infraestructura SEO base)
Impacto en conversión: indexación rápida del contenido transaccional/informacional (caso
  no indexado en 48 h = oportunidad perdida).
Impacto en SEO: descubrimiento e indexación; protege crawl budget; sitemap de imágenes
  posiciona en Google Images.
```

```
ID: RF-14
Módulo: Velocidad de Carga y Core Web Vitals
Descripción: CWV en verde (LCP < 2,5 s, INP < 200 ms, CLS < 0,1) en plantillas
  principales. Lazy loading en imágenes de casos, WebP/AVIF para fotos de campo, critical
  CSS inline, preload de fuentes, CDN de assets, SSR/SSG para servicios y geo-landings.
  Monitorización con GSC y Lighthouse CI en cada despliegue.
Prioridad: Should Have
Dependencias: RF-01, RF-04 (plantillas a optimizar)
Impacto en conversión: cada segundo de LCP sube bounce y baja conversión; afecta Quality
  Score/CPC en SEM.
Impacto en SEO: CWV es factor de ranking; ventaja frente a competidores con webs lentas.
```

```
ID: RF-15
Módulo: Página de Licitaciones y Obra Pública
Descripción: Clasificación de contratista (grupos/subgrupos con importes), experiencia en
  organismos (Ministerio de Transportes, Confederaciones Hidrográficas, Autoridades
  Portuarias, Ayuntamientos), proyectos públicos enlazados a casos, formulario específico
  con campo de enlace a plataforma de contratación / referencia de expediente. Mención a
  experiencia en UTEs y subcontratación.
Prioridad: Nice to Have
Dependencias: RF-12 (acreditaciones), RF-03 (casos), RF-02 (formulario base)
Impacto en conversión: segmento de alto valor (subcontratación geotécnica); campo de
  expediente acelera la reacción comercial.
Impacto en SEO: términos de bajo volumen y altísima intención ("subcontratista geotécnico
  licitación").
```

```
ID: RF-16
Módulo: FAQs Técnicas con Schema FAQ
Descripción: FAQ por servicio y generales, respuestas concisas y técnicamente rigurosas.
  Schema FAQPage por grupo. Preguntas tipo "¿Es obligatorio el estudio geotécnico?",
  "¿Cuántos sondeos necesita mi edificio?", "¿Qué profundidad para cimentación por
  pilotes?". Cada respuesta con link interno a servicio/artículo.
Prioridad: Nice to Have
Dependencias: RF-01 (servicios), RF-06 (blog)
Impacto en conversión: resuelve dudas que retrasan la solicitud; retiene y dirige al
  formulario.
Impacto en SEO: rich snippets en SERP (mayor CTR); featured snippets / búsqueda por voz.
```

### Quick Wins (alto impacto, infravalorados en el sector)

```
ID: RF-Q1
Módulo: Calculadora de Alcance de Estudio Geotécnico (herramienta interactiva)
Descripción: Widget donde el usuario selecciona tipo de obra, nº de plantas, superficie y
  provincia; devuelve estimación orientativa de alcance (nº de sondeos, profundidad,
  ensayos recomendados según CTE) — NO precio — con CTA "Solicitar presupuesto exacto"
  que pre-rellena el formulario.
Prioridad: Should Have
Dependencias: RF-02 (formulario), RF-01 (servicios)
Impacto en conversión: convierte tráfico informacional en lead cualificado al hacer
  tangible el servicio; motivo para volver y compartir.
Impacto en SEO: linkable asset; capta "cuántos sondeos necesito para mi edificio".
```

```
ID: RF-Q2
Módulo: Microconversión "Enviar ubicación de la parcela"
Descripción: CTA alternativo al formulario largo: enviar solo referencia catastral o pin
  de Google Maps + email/teléfono. Formulario lateral flotante con Google Maps embed y
  campo de referencia catastral. Acción de ~15 s.
Prioridad: Should Have
Dependencias: RF-10 (tracking)
Impacto en conversión: capta al usuario con prisa/en obra con móvil que no completaría el
  multi-paso; lead con info mínima para llamar con contexto.
Impacto en SEO: indirecto (mejora engagement móvil).
```

```
ID: RF-Q3
Módulo: Notificaciones automáticas de estado del lead (post-conversión)
Descripción: Email automático en < 2 h confirmando recepción, indicando el técnico
  asignado (colegiado) y el plazo estimado (≤ 48 h lab.). Implementado con email
  transaccional (SendGrid/Mailgun) vinculado al formulario.
Prioridad: Should Have
Dependencias: RF-02 (formulario), RF-05 (equipo)
Impacto en conversión: reduce solicitudes duplicadas a competidores; el lead deja de
  buscar alternativas.
Impacto en SEO: indirecto (reputación, reseñas).
```

### Portal de Administración (interno, `/admin`)

```
ID: RF-17
Módulo: Autenticación, Roles y Permisos del Portal
Descripción: Acceso al back-office restringido por login (email + contraseña con hash, 2FA
  recomendado). Roles diferenciados: Administrador (gestión total + usuarios),
  Gestor de proyectos (P4a: leads/proyectos), Editor de contenido (P4b: contenido/IA),
  Técnico (vista de sus proyectos asignados). Permisos por rol sobre cada módulo. Sesiones
  con expiración y registro de actividad (audit log) de acciones sensibles (publicar,
  aprobar, eliminar). El portal vive en /admin, fuera del crawl (robots disallow + noindex)
  y separado del frontal público.
Prioridad: Must Have
Dependencias: ninguna (base del portal; habilita RF-18 a RF-21)
Impacto en conversión: indirecto (gobierno y seguridad del sistema que gestiona los leads).
Impacto en SEO: /admin excluido de indexación; no compite ni diluye crawl budget.
```

```
ID: RF-18
Módulo: Gestión y Seguimiento de Proyectos (CRM ligero)
Descripción: Cada lead entrante (RF-02 formulario, RF-08 tel/WhatsApp, RF-Q2 ubicación,
  RF-11 lead magnet, RF-15 licitaciones) crea automáticamente una ficha de proyecto con
  servicio, provincia, datos de contacto, lead_type y origen (orgánico/SEM/directo).
  Estados configurables: Lead nuevo → Cualificado → Presupuestado → Adjudicado → En
  ejecución → Entregado → Perdido. Asignación a técnico del equipo, hitos con fechas,
  notas internas, documentos adjuntos (presupuesto, informe). Vista de pipeline (tablero/
  lista) filtrable por estado, técnico, servicio, provincia y rango de fechas. Métricas
  internas: nº de leads por servicio/zona, tasa de cualificación, tiempo medio de respuesta.
Prioridad: Must Have
Dependencias: RF-17 (auth), RF-02/RF-08/RF-Q2 (entradas de lead), RF-05 (técnicos)
Impacto en conversión: trazabilidad lead→proyecto y control del plazo de primera respuesta
  (<48 h) que reduce fuga de leads; prioriza por valor de proyecto.
Impacto en SEO: alimenta el catálogo de casos (RF-03): un proyecto "Entregado" puede
  convertirse, con permiso, en caso de estudio publicable.
```

```
ID: RF-19
Módulo: Generación Asistida de Contenido SEO con Claude (API de Anthropic)
Descripción: Módulo que genera borradores de contenido para cada tipo de página de la web
  (servicio, geo-landing, caso de estudio, artículo de blog, FAQ, meta title/description)
  invocando la API de Claude. Plantillas de prompt parametrizadas por tipo de página y por
  inputs del editor (servicio, provincia, geología local, datos del proyecto, keyword
  objetivo, normativa aplicable). La salida estructurada incluye: H1, jerarquía H2-H3,
  cuerpo con terminología real del sector, meta title (≤60 car.) y meta description
  (≤155 car.) propuestos, sugerencia de schema y de enlaces internos a otros silos.
  Modelo recomendado: Claude Sonnet (claude-sonnet-4-6) por equilibrio coste/calidad para
  producción a volumen; Claude Opus (claude-opus-4-8) para piezas pillar de máxima calidad.
  El contenido se crea en estado "Borrador IA" y NUNCA se publica automáticamente.
Prioridad: Must Have
Dependencias: RF-17 (auth/rol Editor), RF-20 (flujo de revisión), RF-18 (contexto de
  proyectos para casos de estudio)
Impacto en conversión: contenido específico por servicio/zona que sostiene los recorridos
  de conversión de cada persona.
Impacto en SEO: permite escalar la malla de silos servicio × zona (objetivo 100-160 URLs)
  a un ritmo inviable manualmente, manteniendo rigor terminológico y estructura SEO.
```

```
ID: RF-20
Módulo: Flujo Editorial Humano-en-el-Bucle (revisión y aprobación)
Descripción: Workflow de estados para todo contenido generado: Borrador IA → En revisión →
  Aprobado → Publicado (con posibilidad de Rechazado/Regenerar). Editor WYSIWYG/Markdown con
  vista previa fiel a la plantilla del frontal. Regeneración de secciones concretas con
  reprompt. Registro de autoría y aprobación (quién y cuándo) para reforzar E-E-A-T y
  responsabilidad técnica. Aviso explícito de que el contenido debe verificarse técnicamente
  antes de aprobar (contenido YMYL: un dato normativo erróneo es un riesgo real).
Prioridad: Must Have
Dependencias: RF-19 (generación), RF-17 (roles)
Impacto en conversión: garantiza calidad y credibilidad del contenido que convierte.
Impacto en SEO: revisión humana evita penalizaciones por contenido impreciso/no fiable;
  vincula autoría (RF-05) para E-E-A-T.
```

```
ID: RF-21
Módulo: Publicación de Contenido al Frontal Web
Descripción: Acción que publica el contenido Aprobado en la URL del silo correspondiente
  (servicio/zona/caso/blog), aplica el schema adecuado (Service, Article/CreativeWork,
  FAQPage…), genera breadcrumbs y actualiza el sitemap XML (RF-13). Permite programar
  publicación, editar/despublicar y versionar (historial de cambios). Disparo de
  revalidación/regeneración de la página estática (SSG/ISR) sin despliegue de desarrollo.
Prioridad: Must Have
Dependencias: RF-20 (aprobado), RF-13 (sitemap), RF-14 (plantillas SSG/SSR)
Impacto en conversión: time-to-publish bajo → más rápido se capta tráfico del nuevo contenido.
Impacto en SEO: alta inmediata en sitemap → indexación rápida; consistencia de schema y
  estructura de silos sin intervención técnica.
```

---

## 7. Requisitos No Funcionales

### 7.1 Rendimiento (RNF-PERF)
- **LCP < 2,5 s**, **INP < 200 ms**, **CLS < 0,1** en p75 móvil y desktop para plantillas: home, servicio, geo-landing, caso de estudio, artículo de blog.
- Imágenes en WebP/AVIF, lazy loading bajo el pliegue, critical CSS inline, preload de fuentes, CDN para assets estáticos.
- SSR o SSG para servicios y geo-landings (contenido crítico para SEO renderizado en servidor).
- Lighthouse CI en pipeline de despliegue como gate de calidad.

### 7.2 SEO técnico (RNF-SEO)
- **Indexabilidad:** todas las páginas transaccionales/informacionales indexables; Thank You, resultados de filtrado y duplicados de parámetros con `noindex` o excluidos.
- **Estructura de URLs:** limpia, en minúsculas, con guiones, según el árbol de silos (sección 8).
- **Canonical tags explícitos** en cada URL para evitar canibalización por parámetros de filtrado y query strings de campañas (UTM).
- **Schema markup obligatorio:** `Service` (servicios), `LocalBusiness`/`ProfessionalService` (home/contacto, con `areaServed` y `hasOfferCatalog`), `Article`/`CreativeWork` (casos y blog), `Person` (equipo), `Organization` con `hasCredential` (acreditaciones), `FAQPage` (FAQs), `BreadcrumbList` (navegación).
- **Paginación SEO-friendly** en blog y catálogo de casos.
- Registro y monitorización en Google Search Console.

### 7.3 Accesibilidad (RNF-A11Y)
- **WCAG 2.1 nivel AA** como mínimo: contraste, navegación por teclado, etiquetas ARIA en formularios, textos alternativos en imágenes de obra/maquinaria, foco visible.

### 7.4 Seguridad y cumplimiento (RNF-SEC)
- **HTTPS** en todo el sitio (HSTS).
- Protección de formularios anti-spam (reCAPTCHA v3 o equivalente sin fricción) y validación servidor.
- **Cumplimiento RGPD/LOPDGDD:** banner de consentimiento de cookies con bloqueo previo de tags de marketing hasta consentimiento (Consent Mode v2 en GTM); política de privacidad y aviso legal; base de legitimación para el tratamiento de datos de leads; cifrado en tránsito de los datos del formulario.

### 7.5 Escalabilidad (RNF-SCALE)
- Estimación de URLs a 12 meses:

| Silo | URLs estimadas |
|---|---|
| Servicios | 8–9 |
| Zonas (provincias operativas) | 15–25 |
| Casos de estudio | 30–60 |
| Blog (artículos) | 30–50 |
| Páginas de intersección servicio+zona (top búsqueda) | 5–8 |
| Institucionales (equipo, maquinaria, acreditaciones, licitaciones, recursos, contacto) | ~10 |
| **Total estimado** | **~100–160 URLs** |

- La arquitectura (plantillas + CMS) debe soportar el alta de nuevas zonas/casos/artículos sin intervención de desarrollo.

### 7.6 Medición (RNF-DATA)
- GTM con `dataLayer` que exponga como mínimo: `event`, `servicio`, `provincia`, `lead_type` (P1/P2/P3), `form_step`, `valor_estimado` (si aplica).
- GA4 con eventos de conversión definidos: `generate_lead` (formulario), `click_tel`, `click_whatsapp`, `click_email`, `send_location`, `calculator_use`, `resource_download`.
- Vinculación GA4 ↔ Google Ads para CPL por servicio y zona.
- Audiencias de remarketing por servicio visitado.

### 7.7 Portal de Administración: seguridad y acceso (RNF-ADMIN)
- Back-office en `/admin` **aislado del frontal público**, con `robots.txt` disallow + `noindex` y sin enlaces entrantes desde el frontal indexable.
- Autenticación con contraseñas hasheadas (bcrypt/argon2), **2FA recomendado**, control de acceso basado en roles (RBAC: Administrador, Gestor, Editor, Técnico), sesiones con expiración y **audit log** de acciones sensibles (publicar, aprobar, eliminar).
- Datos de leads/proyectos cifrados en tránsito (HTTPS) y en reposo; cumplimiento RGPD del tratamiento de datos personales de los leads (base de legitimación, plazo de conservación, derecho de supresión).
- Copias de seguridad periódicas de la base de datos de proyectos y contenido.

### 7.8 Integración con la API de Claude (RNF-IA)
- Integración con la **API de Claude (Anthropic)** mediante **clave de API almacenada de forma segura en el servidor** (variable de entorno / gestor de secretos); **nunca expuesta en el cliente/navegador**.
- Modelo por defecto **Claude Sonnet (`claude-sonnet-4-6`)** para producción a volumen; **Claude Opus (`claude-opus-4-8`)** para piezas pillar; opción de configurar el modelo por tipo de contenido.
- **Control de costes:** registro de tokens consumidos por generación, límite/presupuesto mensual configurable y alerta al superar umbral; uso de prompt caching para las partes estáticas de las plantillas de prompt cuando aplique.
- **Robustez:** manejo de errores y reintentos con backoff ante límites de tasa (rate limits) o errores transitorios; timeouts; degradación elegante (el portal sigue operativo aunque la generación IA falle).
- **Gobernanza de contenido IA:** ninguna salida se publica sin pasar por el flujo de revisión humana (RF-20); trazabilidad de qué piezas fueron asistidas por IA.

> `[ASUNCIÓN: se asume el uso de la API de Claude (Anthropic) directamente desde el backend del portal. Si la empresa prefiere acceso vía Amazon Bedrock o Google Vertex AI por motivos de contratación/facturación, los IDs de modelo y la autenticación cambian, pero el diseño funcional del módulo (RF-19/20/21) se mantiene.]`

---

## 8. Arquitectura de Información y Estructura de URLs

### 8.1 Árbol de URLs (silos)

```
/ (Home)
├── /servicios/
│   ├── /servicios/estudios-geotecnicos/
│   ├── /servicios/sondeos-mecanicos/
│   ├── /servicios/ensayos-laboratorio/
│   ├── /servicios/control-calidad-cimentaciones/
│   ├── /servicios/informes-periciales/
│   ├── /servicios/geotecnia-maritima/
│   ├── /servicios/instrumentacion-geotecnica/
│   └── /servicios/hidrogeologia/
├── /zonas/
│   ├── /zonas/madrid/
│   ├── /zonas/barcelona/
│   ├── /zonas/valencia/
│   ├── /zonas/sevilla/
│   ├── /zonas/malaga/
│   └── ... (una por provincia operativa)
├── /proyectos/
│   ├── /proyectos/edificacion-residencial/
│   ├── /proyectos/obra-civil/
│   ├── /proyectos/infraestructura-portuaria/
│   └── /proyectos/[slug-del-caso]/
├── /blog/
│   ├── /blog/normativa/
│   ├── /blog/tecnicas/
│   ├── /blog/geologia/
│   └── /blog/[slug-del-articulo]/
├── /equipo/
├── /maquinaria/
├── /acreditaciones/
├── /licitaciones/
├── /recursos/
├── /presupuesto/
└── /contacto/
```

> El **Portal de Administración** vive en `/admin` (o subdominio dedicado, p. ej. `panel.dominio.com`), **fuera del árbol indexable**: bloqueado en `robots.txt`, con `noindex` y sin enlaces entrantes desde el frontal público. No forma parte de la arquitectura de silos SEO.

### 8.2 Estrategia de linking interno entre silos
- La **página de servicio** enlaza a la **geo-landing** en su sección de cobertura, y viceversa.
- Ambas enlazan a los **casos de estudio** de esa zona/servicio; los casos enlazan de vuelta a su servicio y a su zona.
- Los **artículos de blog** sobre normativa/técnica enlazan a la página de servicio pillar correspondiente.
- Las **fichas de equipo** que firman en una zona enlazan a sus casos y a la geo-landing.
- **Anchor texts descriptivos y variados** (p. ej. "nuestros estudios geotécnicos en la zona centro"), evitando la sobre-optimización repetitiva de "estudios geotécnicos Madrid".
- Las páginas de servicio son las **pillar pages** (máxima autoridad interna); geo-landings, casos y artículos son supporting pages que les transfieren relevancia.

### 8.3 Páginas de intersección servicio+zona dedicadas
- Por defecto **no** se crean páginas `/servicios/[servicio]-[zona]/` para cada combinación (inviable de mantener y genera canibalización); la malla de links internos cubre la combinación.
- **Excepción:** para las **5–8 combinaciones de mayor volumen de búsqueda** (p. ej. "estudios geotécnicos Madrid", "sondeos Barcelona", "estudio geotécnico Valencia") se crea una página intermedia/nodo del cluster con **contenido único** (no la mera intersección): contexto geológico específico para esa combinación (p. ej. geología del área metropolitana de Madrid aplicada a cimentación de edificación).

### 8.4 Canonical y paginación
- **Canonical explícito** en cada URL; las variantes con parámetros de filtrado (catálogo de proyectos) o UTM canonicalizan a la URL limpia.
- Paginación del blog y del catálogo de casos con URLs rastreables y autorreferenciadas, evitando contenido duplicado y thin pages de filtrado (estas últimas con `noindex`).

---

## 9. Criterios de Éxito del MVP (Definition of Done)

```
[ ] CWV en verde (LCP<2,5s / INP<200ms / CLS<0,1) en plantillas servicio, zona, caso y blog — Verificación: Lighthouse CI + GSC informe CWV — Responsable: Dev
[ ] GSC sin errores críticos de cobertura; sitemap enviado y procesado — Verificación: GSC (cobertura + sitemaps) — Responsable: SEO
[ ] 8 páginas de servicio publicadas con schema Service y CTA contextual — Verificación: rich results test + revisión editorial — Responsable: SEO/Contenido
[ ] Mínimo 5 geo-landings prioritarias (≥800 palabras, geología local) publicadas — Verificación: auditoría de contenido — Responsable: Contenido
[ ] Mínimo 8 casos de estudio con fotos reales y schema Article/CreativeWork — Verificación: revisión editorial + rich results test — Responsable: Contenido/SEO
[ ] Mínimo 8 artículos de blog con autor vinculado y links internos — Verificación: auditoría de contenido — Responsable: Contenido
[ ] Formulario multi-paso testeado end-to-end (validación, URL params, confirmación, email) — Verificación: QA funcional + envío de prueba — Responsable: QA/Dev
[ ] Eventos GA4 disparando correctamente (generate_lead, click_tel, click_whatsapp, send_location, calculator_use, resource_download) — Verificación: GA4 DebugView + GTM Preview — Responsable: Dev/SEO
[ ] Tag de conversión de Google Ads activo y vinculado a GA4 — Verificación: Google Ads diagnóstico de etiquetas — Responsable: SEO/SEM
[ ] Email transaccional de confirmación en <2h con técnico asignado y plazo — Verificación: envío de prueba end-to-end — Responsable: Dev
[ ] Calculadora de alcance operativa con CTA que pre-rellena formulario — Verificación: QA funcional — Responsable: Dev/QA
[ ] Microconversión "Enviar ubicación de la parcela" operativa (Maps + catastral) — Verificación: QA funcional + lead de prueba — Responsable: Dev/QA
[ ] Click-to-call segmentado y WhatsApp Business con mensaje pre-rellenado — Verificación: prueba en móvil real — Responsable: QA
[ ] GBP configurado/optimizado (categoría, areaServed, fotos) y NAP consistente web/GBP/directorios — Verificación: auditoría NAP + GBP — Responsable: SEO
[ ] Schemas validados (Service, LocalBusiness, Article, Person, Organization/hasCredential, FAQPage, BreadcrumbList) — Verificación: Schema Markup Validator + GSC mejoras — Responsable: SEO
[ ] Consentimiento RGPD (Consent Mode v2) bloqueando tags hasta consentimiento — Verificación: revisión de red en navegador — Responsable: Dev/Legal
[ ] HTTPS/HSTS y protección anti-spam de formularios activa — Verificación: prueba de seguridad básica — Responsable: Dev
[ ] WCAG 2.1 AA en plantillas principales — Verificación: auditoría axe/Lighthouse a11y — Responsable: QA
[ ] Portal /admin con login, RBAC (Admin/Gestor/Editor/Técnico) y 2FA operativos — Verificación: QA funcional por rol — Responsable: Dev/QA
[ ] Leads entrantes crean ficha de proyecto automáticamente y pipeline filtrable operativo — Verificación: lead de prueba end-to-end + revisión de pipeline — Responsable: QA
[ ] Generación de contenido con API de Claude operativa por tipo de página (borrador IA) — Verificación: generación de prueba de servicio y geo-landing — Responsable: Dev/SEO
[ ] Flujo editorial Borrador IA → Revisión → Aprobado → Publicado funcionando con audit log — Verificación: QA del workflow completo — Responsable: QA
[ ] Publicación desde el portal crea la URL en el silo correcto, aplica schema y actualiza sitemap — Verificación: publicación de prueba + rich results test + GSC — Responsable: Dev/SEO
[ ] /admin excluido de indexación (robots disallow + noindex) y clave de API de Claude solo en servidor — Verificación: revisión de robots/headers + auditoría de secretos — Responsable: Dev/SEO
[ ] Control de coste de IA: registro de tokens y alerta de presupuesto configurada — Verificación: revisión de panel de uso — Responsable: Dev
```

---

## 10. Fuera de Alcance (MVP)

Quedan **fuera del MVP** (candidatos a fases posteriores), para evitar scope creep:

- **Portal/área de cliente externo** (acceso de clientes para descargar informes y seguir el estado de su proyecto). El Portal de Administración del MVP es **interno**; el portal orientado al cliente queda para fase posterior.
- **Integración profunda con ERP/CRM corporativo** (sincronización bidireccional, scoring automático). El MVP incluye un **CRM ligero interno** (RF-18) para gestión de proyectos, pero no se integra con sistemas externos de la empresa en esta fase.
- **Generación de contenido IA totalmente automática (sin revisión humana)** o publicación automática sin aprobación: queda explícitamente fuera; el humano-en-el-bucle (RF-20) es obligatorio en el MVP.
- **Funciones avanzadas de IA** (traducción automática multidioma, generación de imágenes, optimización SEO continua automatizada): fuera del MVP.
- **Multidioma / internacionalización** (catalán, gallego, euskera, inglés); el MVP se lanza en castellano.
- **E-commerce o pago online** de servicios estandarizados.
- **Generación automática de presupuestos** (el MVP da alcance orientativo, no precio).
- **Versiones nativas móviles (apps)**; el MVP es web responsive.
- **Newsletter avanzada / automatizaciones de nurturing** complejas (más allá del email transaccional de confirmación y la captura para email marketing).
- **Páginas de intersección servicio+zona más allá de las 5–8 prioritarias.**
- **Reseñas/valoraciones on-site** con `aggregateRating` si no existen reseñas verificables al lanzamiento.

> `[ASUNCIÓN: el alcance del MVP prioriza los módulos de prioridad Alta (Must Have) del documento fuente más los Quick Wins, dado que son los que habilitan la captación medible. Los módulos de prioridad Baja (RF-15 Licitaciones, RF-16 FAQs) se marcan Nice to Have y pueden entrar en el MVP si la capacidad del equipo lo permite, sin ser bloqueantes para el lanzamiento.]`
