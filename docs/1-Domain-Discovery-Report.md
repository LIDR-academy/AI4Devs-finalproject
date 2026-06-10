# EventFlow — Domain Discovery Report

> Plataforma de planificación de eventos y gestión de proveedores asistida por IA
> Versión: 1.0 — Reporte de Discovery
> Idioma: Español LATAM
> Audiencia: Product Owner, equipo de desarrollo asistido por IA, comité académico, evaluadores de portafolio

---

## 1. Resumen Ejecutivo

EventFlow es una plataforma digital que combina **planificación de eventos asistida por IA** y un **directorio simplificado de proveedores** para personas que organizan eventos sociales y personales (bodas, XV años, bautizos, baby showers, graduaciones, cumpleaños y reuniones corporativas pequeñas).

El problema central es que organizar un evento es un proceso **fragmentado, estresante y caro**: el cliente usa hojas de cálculo, grupos de WhatsApp, Pinterest, Instagram y Google para coordinar entre 5 y 15 proveedores, sin una vista única de tareas, presupuesto y cotizaciones. Los proveedores, por su lado, manejan leads en DM, mensajes y llamadas, sin un CRM ligero y con dificultad para responder cotizaciones de forma estructurada.

Existen actores globales muy fuertes en el segmento bodas (The Knot, WeddingWire, Zola en EE.UU.; Bodas.net y Matrimonio.com en mercados hispanohablantes), pero **ninguno es nativo de IA** ni cubre todos los tipos de evento social que importan en LATAM (XV años, bautizos, baby showers). El mercado de Event Management Software crece a ~17% CAGR ([MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/event-management-software-market-136859992.html)) y proyecta llegar a USD 10.5B en 2030 ([IMARC Group](https://www.imarcgroup.com/event-management-software-market)), con la IA generativa como vector de innovación dominante.

**Recomendación estratégica:** `Build with constraints`. Se valida la hipótesis de iniciar como **workspace de planificación asistido por IA** con un **directorio simplificado de proveedores y flujo de cotizaciones**, evitando construir un marketplace transaccional completo en v1. Esto es lo que hace al proyecto:

- **Viable** como proyecto académico de fin de Máster (alcance acotado, cobertura del ciclo completo de software con apoyo de IA).
- **Atractivo** como portafolio (demuestra integración con LLMs, arquitectura full-stack, decisiones de producto).
- **Realista** como semilla de un producto comercial futuro (la planificación con IA es la cuña; el marketplace es la expansión).

Diferenciador principal: **un workspace conversacional que convierte “quiero organizar un evento” en un plan estructurado (checklist + presupuesto + categorías de proveedor) en minutos**, en español LATAM y para tipos de evento que los gigantes globales no priorizan.

---

## 2. Descripción del Dominio

### 2.1. Cómo funciona la planificación de eventos sociales

La organización de un evento social sigue un ciclo predecible pero altamente manual:

1. **Decisión y visión.** El cliente decide celebrar (motivo, fecha tentativa, número aproximado de invitados, presupuesto global mental).
2. **Definición de estilo.** Se inspira en redes (Pinterest, Instagram, TikTok) y define paleta, temática y “feeling” del evento.
3. **Presupuesto inicial.** Usualmente subestimado: el cliente promedio descubre durante el proceso que muchos rubros estaban olvidados (mobiliario, propinas, hora extra, transporte).
4. **Descubrimiento de proveedores.** Recomendaciones de familia/amigos, búsqueda en Instagram, grupos de Facebook, ferias locales y, en menor medida, directorios online.
5. **Cotización.** El cliente contacta entre 3 y 6 proveedores por categoría vía WhatsApp, DM o formularios web. Cada uno responde con tiempos y formatos distintos.
6. **Comparación y negociación.** Comparación informal (mental o en hojas de cálculo). Pocas veces hay paridad real entre cotizaciones porque cada proveedor incluye cosas distintas.
7. **Reserva.** Se paga un anticipo (típicamente 30–50%) y se firma (o no) un acuerdo informal.
8. **Coordinación previa.** Confirmación de detalles, ajustes de menú, prueba de maquillaje, visita al salón, timeline del día.
9. **Día del evento.** Ejecución. La mayoría de problemas se resuelven en vivo y de forma improvisada.
10. **Post-evento.** Pago final, propinas, devolución de cristalería/mobiliario, reseñas (usualmente en Instagram, rara vez en una plataforma).

### 2.2. Actores principales

- **Anfitriones / organizadores informales.** Novios, padres de quinceañera, padres del bautizado, anfitrión del baby shower. Suelen ser primerizos en ese tipo específico de evento.
- **Wedding/event planners profesionales.** Coordinan todo o por etapas. En LATAM son aún un segmento aspiracional para clase media-alta.
- **Proveedores (vendors).** Banqueteros, fotógrafos, DJs, decoradores, salones, mobiliario, repostería, makeup, transporte, animación infantil, etc. Mayoritariamente pymes y freelancers.
- **Asesores informales.** Familiares, madrinas, suegras, amigas con experiencia previa.
- **Plataformas y directorios.** The Knot, WeddingWire, Bodas.net, Matrimonio.com, Zola (bodas); Thumbtack y similares (servicios generales).
- **Plataformas adyacentes.** Pinterest, Instagram, TikTok (inspiración); Canva (papelería); Excel/Google Sheets (presupuesto); WhatsApp (comunicación).

### 2.3. Servicios típicos requeridos

Catering, salón/venue, decoración y mobiliario, fotografía, video, música (DJ, mariachi, marimba, banda, hora loca), pastel y mesa de dulces, makeup y peinado, animación infantil, transporte, papelería e invitaciones, vestimenta, florería, iluminación, hielo seco/efectos, seguridad, valet parking, hospedaje para invitados (en bodas destino), planner.

### 2.4. Cómo los clientes encuentran y contratan proveedores

- Referencias personales (canal #1 en LATAM).
- Instagram y TikTok (canal #2, especialmente <35 años).
- Grupos de Facebook locales (“Novias Guatemala 2026”, “Eventos en CDMX”, etc.).
- Ferias de novios y expos.
- Directorios como Bodas.net o Matrimonio.com (canal creciente pero no dominante en LATAM).
- Google Maps y reseñas.

La conversión ocurre casi siempre **fuera del directorio**: el cliente encuentra al proveedor, luego se mueve a WhatsApp/DM para cotizar y cerrar.

### 2.5. Cómo los proveedores gestionan su operación

- Leads en WhatsApp, DM de Instagram y formularios web.
- Cotizaciones en PDF, Word, imagen o texto plano de WhatsApp.
- Agenda en Google Calendar, libreta o memoria.
- Cobros en transferencia, depósito o efectivo.
- Reseñas en Google, Instagram, Facebook o boca a boca.
- Muy baja adopción de CRMs especializados; en LATAM, el cuello de botella es organizativo, no tecnológico per se.

### 2.6. Pain points del cliente

1. **Saber por dónde empezar** (especialmente eventos primerizos: bodas, XV, baby shower).
2. **Estimar presupuesto realista** (siempre subestiman el costo total).
3. **No olvidar rubros** (mobiliario extra, propinas, hora extra del DJ).
4. **Comparar cotizaciones desiguales** (cada proveedor incluye cosas distintas).
5. **Manejar el estrés emocional** (especialmente bodas y XV).
6. **Coordinar a la familia** (madres, suegras, padrinos opinando).
7. **Riesgo de proveedores poco confiables** (anticipo perdido, no aparecen, calidad pobre).
8. **Falta de transparencia en precios** (“te paso info por WhatsApp”).

### 2.7. Pain points del proveedor

1. **Leads de baja calidad** (gente que pregunta precio y desaparece).
2. **Cotizaciones repetitivas** (responder 20 veces la misma pregunta).
3. **Sin CRM ligero**, todo en WhatsApp y libreta.
4. **Doble booking** y conflictos de agenda.
5. **Reputación dispersa** (Google + IG + Facebook + recomendaciones).
6. **Comisiones altas** o paquetes caros en directorios globales como The Knot, con poca claridad de ROI ([Boda Bliss](https://bodabliss.com/zola-vs-the-knot-vendor-comparison/)).
7. **Falta de visibilidad** de pequeños proveedores frente a marcas consolidadas.

### 2.8. Diferencia entre planificación informal y profesional

| Dimensión | Planificación informal (caso EventFlow) | Planificación profesional |
|---|---|---|
| Quién planifica | Anfitrión + familia | Wedding/event planner contratado |
| Herramientas | WhatsApp, Excel, Pinterest | Software (Aisle Planner, HoneyBook, Planning Pod) |
| Presupuesto típico (LATAM) | USD 2,000–25,000 | USD 15,000–100,000+ |
| Necesidad principal | Estructura y guía | Eficiencia operativa |
| Apertura a IA | Alta (busca atajos) | Media (ya tiene procesos) |

EventFlow apunta primero al **segmento informal**, donde la fricción y el dolor son mayores.

---

## 3. Contexto de Mercado y Competidores

### 3.1. Tamaño y tendencias del mercado

- **Hecho confirmado:** El mercado global de Event Management Software crece a un CAGR estimado de ~17.4% (2024–2029) según [MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/event-management-software-market-136859992.html).
- **Hecho confirmado:** Se proyecta que el mercado de EMS alcance USD 10.5B en 2030, con Norteamérica liderando con ~42.8% de participación en 2025 ([IMARC Group](https://www.imarcgroup.com/event-management-software-market)).
- **Hecho confirmado:** IA generativa, automatización y analítica predictiva son los principales drivers de innovación; aparecen casos como el Joy Index de Bishop-McCann (2024) para medición de engagement en tiempo real ([IMARC Group](https://www.imarcgroup.com/event-management-software-market)).
- **Hecho confirmado:** The Knot Worldwide opera marcas locales en mercados hispanohablantes (**Bodas.net** y **Matrimonio.com**), confirmando que LATAM y España son mercados estratégicos para el segmento bodas ([The Knot Worldwide](https://www.theknotww.com/press-releases/the-knot-worldwide-announces-new-platform-features-to-drive-wedding-vendor-success)).
- **Asunción razonable:** La mayoría de estos datos cubren el segmento **corporativo y bodas**; el mercado de eventos sociales no-boda en LATAM (XV años, bautizos, baby showers) está sub-medido pero es culturalmente relevante y de alto gasto unitario.
- **Hipótesis:** En LATAM, la digitalización del descubrimiento de proveedores está aún en fase temprana fuera de bodas; la mayoría de proveedores opera en Instagram + WhatsApp.

### 3.2. Mapa competitivo

| Competidor | Modelo | Fortaleza | Limitación frente a EventFlow |
|---|---|---|---|
| [The Knot](https://www.theknot.com) | Marketplace + planning tools (bodas) | Reach masivo, reseñas, SEO ([The Knot Worldwide](https://www.theknotww.com/press-releases/the-knot-worldwide-announces-new-platform-features-to-drive-wedding-vendor-success)) | Sólo bodas; planes caros para proveedores; modelo legacy, no nativo de IA |
| [Zola](https://www.zola.com) | Marketplace + registry + planning (bodas) | UX moderna, listado gratis con upsell ([Boda Bliss](https://bodabliss.com/zola-vs-the-knot-vendor-comparison/)) | Sólo bodas; foco EE.UU.; no nativo IA |
| [Bodas.net](https://www.bodas.net) / [Matrimonio.com](https://www.matrimonio.com) | Marketplace de bodas (TKWW) | Líder en mercados hispanohablantes | Sólo bodas; UX tradicional; planificación limitada |
| [Aisle Planner](https://www.aisleplanner.com) / [HoneyBook](https://www.honeybook.com) | SaaS para planners profesionales | Workflows ricos, contratos, pagos | B2B; no para el organizador final |
| [Cvent](https://www.cvent.com), [Whova](https://whova.com), [Bizzabo](https://www.bizzabo.com) | EMS corporativo | Robustos, con AI Copilot ([Whova](https://whova.com/blog/chatgpt-alternatives-event-planning/)) | Eventos corporativos, no sociales |
| [Thumbtack](https://www.thumbtack.com) | Marketplace de servicios | Pay-per-lead | No especializado en eventos; no LATAM nativo |
| ChatGPT/Gemini/Claude genéricos | LLM general | Acceso libre, flexibles | Sin estructura, sin checklist persistente, sin proveedores, sin presupuesto vivo ([Whova](https://whova.com/blog/ai-event-planning/)) |

### 3.3. Oportunidades de digitalización y de IA

1. **Workspace conversacional nativo IA** para eventos sociales (hueco claro frente a los legacy).
2. **Cobertura multi-evento** (no sólo bodas): XV años, bautizos, baby showers — fuerte gancho cultural LATAM.
3. **Español LATAM y modismos locales** (mariachi, marimba, hora loca, candy bar, recuerdos), donde los productos globales fallan.
4. **Plantillas inteligentes por tipo de evento** que generan plan + checklist + presupuesto en minutos.
5. **Comparador estructurado de cotizaciones** (alinear lo que cada proveedor incluye).
6. **Microherramientas para proveedores** (perfil + bandeja de cotizaciones), ligeras y gratuitas en v1.

### 3.4. Gaps en soluciones existentes

- Ninguna plataforma combina **IA generativa real + multi-evento + español LATAM + cotización estructurada**.
- The Knot/Zola/Bodas.net son **directorios pesados** con planning tools básicos, no copilotos.
- Los EMS corporativos no son aptos para una pareja organizando su boda o unos padres organizando los XV.
- Los LLM generales (ChatGPT) no persisten estado del evento, no integran proveedores, no manejan presupuesto vivo.

---

## 4. Usuarios Objetivo

### 4.1. Event Organizer / Cliente (segmento primario)

**Perfil:** Persona de 22–45 años, urbana, clase media a media-alta en LATAM, organizando un evento social que importa emocionalmente. Smartphone-first, usuaria intensiva de WhatsApp e Instagram. Suele organizar este tipo de evento por primera o segunda vez.

| Dimensión | Detalle |
|---|---|
| Metas | Tener un evento memorable sin estrés, ajustado a presupuesto, sin sorpresas, sin olvidos. |
| Necesidades | Estructura, guía paso a paso, control de presupuesto, descubrimiento de proveedores confiables. |
| Frustraciones | No saber por dónde empezar, presupuesto que se desborda, proveedores que no responden, comparar cotizaciones distintas, opinión cruzada de la familia. |
| Sensibilidad al presupuesto | Alta. El presupuesto es la métrica emocional dominante. |
| Confianza | Crítica: anticipo significa riesgo financiero. Reseñas y recomendaciones pesan más que precio. |
| Estrés emocional | Alto, especialmente en bodas y XV; el evento es percibido como “una sola oportunidad”. |
| Decisión | Mezcla de razón (precio, disponibilidad) y emoción (estilo, conexión con el proveedor). |
| Comportamiento digital | Pinterest e Instagram para inspirarse, Google para buscar, WhatsApp para cerrar, hojas de cálculo para presupuesto. |

### 4.2. Vendor / Proveedor (segmento secundario, habilitador)

**Perfil:** Pyme o freelancer (catering, fotógrafo, DJ, decorador, salón, makeup). 1–15 personas. Operación informal a semi-formal. Instagram como principal vitrina.

| Dimensión | Detalle |
|---|---|
| Metas | Llenar agenda, leads cualificados, reducir tiempo cotizando, construir reputación. |
| Necesidades | Vitrina con portafolio, bandeja de solicitudes, plantillas de cotización, gestión simple de agenda. |
| Frustraciones | Leads frívolos (“solo precio”), cotizaciones repetitivas, ghosting, doble booking, comisiones altas en directorios. |
| Retos comerciales | Diferenciarse de competidores grandes; conseguir reseñas verificables. |
| Retos operativos | Gestionar simultáneamente 10–40 conversaciones activas en WhatsApp. |
| Necesidad de reputación | Crítica: el negocio depende del boca a boca y de reseñas. |
| Lead management | Hoy: WhatsApp + DM + memoria. Falta CRM ligero. |
| Respuesta a cotizaciones | Manual, no estructurada, formato variable. |
| Gestión de disponibilidad | Calendario propio o memoria; alto riesgo de doble booking. |

### 4.3. Platform Admin

**Perfil:** Equipo interno (1–3 personas en MVP, escalable después). Responsable de curaduría y confianza.

| Dimensión | Detalle |
|---|---|
| Metas | Mantener un catálogo curado y útil; evitar fraude y contenido de baja calidad. |
| Responsabilidades | Aprobar proveedores, gestionar categorías, moderar reseñas, monitorear métricas. |
| Necesidades operativas | Panel admin sencillo, filtros, búsqueda, acciones masivas básicas. |
| Preocupaciones de moderación | Cuentas falsas, proveedores que dejan de operar, reseñas falsas, datos sensibles del cliente. |
| Preocupaciones de integridad | Que la IA no proponga cosas peligrosas, ilegales o sesgadas; que los datos del usuario estén protegidos. |

---

## 5. Jobs To Be Done

### 5.1. Event Organizer (6 JTBD)

1. Cuando me entero de que voy a organizar un evento importante (boda, XV, baby shower), quiero entender qué pasos seguir y en qué orden, para no sentirme perdida y empezar con confianza.
2. Cuando defino el monto que puedo gastar, quiero un presupuesto realista por categoría, para evitar sorpresas y poder priorizar.
3. Cuando estoy planificando, quiero una checklist viva y con recordatorios, para no olvidar tareas críticas a 3 meses, 1 mes y 1 semana del evento.
4. Cuando necesito un proveedor (DJ, fotógrafo, salón), quiero encontrar opciones confiables filtradas por mi ciudad y presupuesto, para no perder horas en Instagram.
5. Cuando contacto varios proveedores, quiero pedir cotizaciones de manera uniforme y compararlas lado a lado, para tomar una decisión informada.
6. Cuando estoy a pocas semanas del evento, quiero ver el estado general del plan en una sola pantalla, para saber qué falta y dormir tranquila.

### 5.2. Vendor (6 JTBD)

1. Cuando un cliente nuevo quiere cotizarme, quiero recibir un brief estructurado (fecha, lugar, invitados, presupuesto), para responder solo a leads serios.
2. Cuando llegan varias solicitudes, quiero verlas en una sola bandeja con su estado, para no perder ninguna ni mezclar conversaciones.
3. Cuando respondo cotizaciones, quiero partir de una plantilla con mis paquetes, para responder en minutos y no en horas.
4. Cuando alguien me pregunta disponibilidad, quiero que la plataforma muestre mis fechas ocupadas, para evitar doble booking.
5. Cuando termino un evento, quiero pedir reseñas verificadas, para construir reputación que se traduzca en más leads.
6. Cuando alguien busca mi categoría en mi ciudad, quiero aparecer con un perfil bien presentado y portafolio, para ganar leads sin pagar comisiones altas.

### 5.3. Platform Admin (4 JTBD)

1. Cuando un nuevo proveedor se registra, quiero revisar su perfil y aprobarlo o rechazarlo, para mantener la calidad del catálogo.
2. Cuando aparecen reseñas o reportes sospechosos, quiero moderarlos rápido, para proteger la confianza de la plataforma.
3. Cuando el catálogo crece, quiero gestionar categorías y subcategorías, para que clientes y proveedores encuentren coincidencias relevantes.
4. Cuando reviso métricas semanales, quiero ver activación de usuarios, tasa de respuesta de proveedores y aceptación de sugerencias IA, para detectar problemas y oportunidades.

---

## 6. Procesos de Negocio

### 6.1. Creación de evento

- **Disparador:** Usuario decide planificar un evento y crea cuenta o inicia sesión.
- **Actores:** Event Organizer.
- **Input:** Tipo de evento, fecha tentativa, número de invitados, ciudad, presupuesto estimado.
- **Pasos:** Login → Nuevo evento → Wizard de datos básicos → Confirmar.
- **Output:** Evento creado en estado `draft`.
- **Reglas clave:** Un usuario puede tener múltiples eventos; sólo el creador puede modificarlo en MVP.
- **MVP:** Sí.

### 6.2. Planificación asistida por IA

- **Disparador:** Evento recién creado o usuario solicita regenerar plan.
- **Actores:** Event Organizer, motor IA.
- **Input:** Datos del evento + preferencias opcionales (estilo, restricciones).
- **Pasos:** Usuario pulsa “Generar plan” → IA produce timeline macro y categorías sugeridas → Usuario revisa y acepta o edita.
- **Output:** Plan base validado por el usuario.
- **Reglas clave:** El output IA es **sugerencia**, no se aplica sin confirmación humana.
- **MVP:** Sí.

### 6.3. Generación de checklist

- **Disparador:** Plan aprobado o solicitud explícita.
- **Actores:** Event Organizer, motor IA.
- **Input:** Tipo de evento, fecha, tamaño.
- **Pasos:** IA genera tareas con fechas relativas (T-90, T-30, T-7, T-1) → Usuario edita o aprueba en bloque.
- **Output:** Lista de `EventTask` ligadas al evento.
- **Reglas clave:** Cada tarea tiene estado (`pending`, `in_progress`, `done`, `skipped`).
- **MVP:** Sí.

### 6.4. Planificación de presupuesto

- **Disparador:** Usuario crea evento o entra a sección de presupuesto.
- **Actores:** Event Organizer, motor IA.
- **Input:** Presupuesto total, tipo de evento, invitados, ciudad.
- **Pasos:** IA sugiere distribución por categorías (con porcentajes) → Usuario ajusta → Sistema calcula totales y % gastado vivo conforme se aceptan cotizaciones.
- **Output:** `Budget` con `BudgetItems`.
- **Reglas clave:** El total comprometido nunca debe exceder el presupuesto sin warning explícito.
- **MVP:** Sí.

### 6.5. Descubrimiento de proveedores

- **Disparador:** Usuario busca o IA recomienda por categoría.
- **Actores:** Event Organizer.
- **Input:** Categoría, ciudad, rango de precio, fecha.
- **Pasos:** Filtrar directorio → Ver perfil → Guardar favoritos.
- **Output:** Lista priorizada de proveedores.
- **Reglas clave:** Sólo se muestran proveedores con estado `approved`.
- **MVP:** Sí.

### 6.6. Solicitud de cotización

- **Disparador:** Usuario selecciona un proveedor.
- **Actores:** Event Organizer.
- **Input:** Brief estructurado autocompletado desde el evento.
- **Pasos:** Confirmar/editar brief → Enviar → Sistema notifica al proveedor.
- **Output:** `QuoteRequest` en estado `sent`.
- **Reglas clave:** Un mismo usuario puede solicitar a varios proveedores; el proveedor sólo ve sus propias solicitudes.
- **MVP:** Sí.

### 6.7. Respuesta a cotización

- **Disparador:** Proveedor recibe notificación.
- **Actores:** Vendor.
- **Input:** Detalle del paquete, precio, condiciones, validez.
- **Pasos:** Abrir solicitud → Llenar plantilla → Enviar.
- **Output:** `Quote` ligada a la `QuoteRequest`.
- **Reglas clave:** Una solicitud puede tener máximo una cotización vigente por proveedor; una cotización tiene `valid_until`.
- **MVP:** Sí.

### 6.8. Comparación de cotizaciones

- **Disparador:** Usuario recibe 2+ cotizaciones para misma categoría.
- **Actores:** Event Organizer (apoyo IA).
- **Input:** Set de cotizaciones.
- **Pasos:** Ver vista comparativa lado a lado → IA resume diferencias clave → Usuario selecciona favorita.
- **Output:** Cotización marcada como `preferred`.
- **MVP:** Sí (vista simple; IA summary opcional).

### 6.9. Intención de reserva (booking intent)

- **Disparador:** Usuario acepta una cotización.
- **Actores:** Event Organizer, Vendor.
- **Input:** Cotización seleccionada.
- **Pasos:** Usuario marca “Quiero reservar” → Sistema notifica al proveedor → Ambos confirman intención.
- **Output:** `BookingIntent` en estado `confirmed_intent` (sin pago real en MVP).
- **Reglas clave:** El acuerdo final ocurre fuera de la plataforma en v1; EventFlow sólo registra intención.
- **MVP:** Sí (simulado).

### 6.10. Seguimiento del progreso

- **Disparador:** Entrada al dashboard.
- **Actores:** Event Organizer.
- **Input:** Estado de tareas, presupuesto, cotizaciones, bookings.
- **Pasos:** Dashboard agrega métricas → Muestra % progreso, próximas tareas, alertas.
- **Output:** Vista única del evento.
- **MVP:** Sí.

### 6.11. Onboarding de proveedor

- **Disparador:** Registro de proveedor.
- **Actores:** Vendor, Admin.
- **Input:** Datos de negocio, categoría, portafolio, paquetes.
- **Pasos:** Vendor llena formulario → Admin revisa → Aprobación o rechazo.
- **Output:** Perfil en estado `approved` o `rejected`.
- **MVP:** Sí.

### 6.12. Gestión admin de categorías y proveedores

- **Disparador:** Acción del admin.
- **Actores:** Admin.
- **MVP:** Sí (CRUD básico).

---

## 7. Entidades del Dominio

| Entidad | Descripción | Atributos clave | Relaciones principales | MVP / Futuro | Razón |
|---|---|---|---|---|---|
| **User** | Persona registrada en la plataforma | id, email, name, phone, role, created_at | 1:N con Event, VendorProfile | MVP | Núcleo |
| **Role** | Tipo de usuario | name (organizer, vendor, admin) | 1:N con User | MVP | Necesario para permisos |
| **Event** | Evento que se planifica | id, owner_id, type, date, guests, city, budget, status | N:1 con User, 1:N con EventTask, Budget, QuoteRequest | MVP | Núcleo |
| **EventType** | Catálogo de tipos | code (wedding, xv, baby_shower, ...), default_categories | 1:N con Event | MVP | Necesario para plantillas IA |
| **EventTask** | Tarea del checklist | id, event_id, title, due_date, status, ai_generated | N:1 con Event | MVP | Núcleo de planificación |
| **Budget** | Presupuesto del evento | id, event_id, total | 1:1 con Event, 1:N con BudgetItem | MVP | Núcleo |
| **BudgetItem** | Línea de presupuesto | id, budget_id, category, planned, committed, paid | N:1 con Budget | MVP | Detalle por categoría |
| **VendorProfile** | Perfil del proveedor | id, user_id, business_name, city, bio, portfolio, status | 1:N con VendorService, QuoteRequest | MVP | Núcleo del lado proveedor |
| **VendorService** | Servicio ofrecido por proveedor | id, vendor_id, category_id, package_name, base_price | N:1 con VendorProfile, N:1 con ServiceCategory | MVP | Necesario para ofertas |
| **ServiceCategory** | Categoría (catering, foto, DJ...) | id, name, slug, parent_id | 1:N con VendorService | MVP | Núcleo |
| **QuoteRequest** | Solicitud de cotización | id, event_id, vendor_id, brief, status, created_at | N:1 con Event, N:1 con VendorProfile, 1:N con Quote | MVP | Núcleo |
| **Quote** | Respuesta del proveedor | id, request_id, total_price, breakdown, valid_until, status | N:1 con QuoteRequest | MVP | Núcleo |
| **BookingIntent** | Intención de reserva | id, quote_id, status, confirmed_at | N:1 con Quote | MVP (simulado) | Cierra ciclo sin pago real |
| **Review** | Reseña de un proveedor | id, vendor_id, author_id, rating, comment | N:1 con VendorProfile, N:1 con User | MVP (básico) | Confianza |
| **Notification** | Aviso al usuario | id, user_id, type, payload, read_at | N:1 con User | MVP (básico) | UX |
| **AIRecommendation** | Sugerencia generada por IA | id, event_id, type, payload, accepted | N:1 con Event | MVP | Trazabilidad de IA |
| **Location** | Ubicación normalizada | id, country, city | N:1 con VendorProfile, Event | MVP (simple) | Filtro de búsqueda |
| **Availability** | Disponibilidad del proveedor | id, vendor_id, date, status | N:1 con VendorProfile | Futuro | Calendario real |
| **Attachment** | Archivo adjunto | id, owner_type, owner_id, url, mime | Polimórfica | MVP (mínimo) | Portafolio, briefs |
| **AdminAction** | Log de acciones admin | id, admin_id, target_type, target_id, action, at | N:1 con User | MVP (log simple) | Auditoría |
| **Conversation / Message** | Hilo entre cliente y proveedor | — | — | Futuro | Evitar chat real en v1 |
| **Payment / Invoice** | Pago real | — | — | Futuro | No es MVP |

**Entidad propuesta adicional:** `EventCollaborator` (futuro) — para permitir que pareja, mamá, suegra colaboren con permisos. Se difiere para no complicar permisos en MVP.

---

## 8. Reglas de Negocio

### 8.1. Propiedad y permisos del evento

- Cada `Event` pertenece a un único `User` (owner) en MVP.
- Sólo el owner puede editar, eliminar o solicitar cotizaciones.
- Colaboración multi-usuario es **futuro**.

### 8.2. Estados del evento

- `draft` → `active` → `completed` | `cancelled`.
- Sólo eventos `active` pueden enviar `QuoteRequest`.

### 8.3. Estados de tareas

- `pending` → `in_progress` → `done` | `skipped`.
- Las tareas generadas por IA arrancan en `pending` y deben ser confirmadas por el usuario para activarse.

### 8.4. Presupuesto

- `total = SUM(BudgetItem.planned)`.
- `committed = SUM(BudgetItem.committed)` (suma de cotizaciones aceptadas / booking intents).
- Si `committed > total`, el sistema muestra warning, no bloquea.

### 8.5. Visibilidad del proveedor

- Sólo `VendorProfile.status = approved` aparece en búsqueda pública.
- Los proveedores `pending` o `rejected` no son visibles para clientes.

### 8.6. Solicitudes y cotizaciones

- Un mismo `Event` puede enviar `QuoteRequest` al mismo proveedor sólo una vez activa a la vez.
- Cada `Quote` tiene `valid_until`. Vencida, no puede pasar a `BookingIntent`.
- El proveedor sólo puede ver `QuoteRequest` dirigidas a él.

### 8.7. Booking intent

- Sólo se crea desde una `Quote` no vencida y aceptada por el cliente.
- Requiere confirmación del proveedor para pasar a `confirmed_intent`.
- En MVP **no implica pago real**.

### 8.8. Reseñas

- Sólo un `User` con `BookingIntent.confirmed_intent` con un proveedor puede dejar `Review` para ese proveedor.
- Una reseña por evento por proveedor.

### 8.9. Notificaciones

- Eventos que disparan notificación: nueva solicitud al proveedor, nueva cotización al cliente, próxima tarea (T-7), confirmación de booking.
- Canal MVP: in-app + email simulado.

### 8.10. Administración

- Sólo `role = admin` puede aprobar proveedores, gestionar categorías y moderar.
- Toda acción admin queda en `AdminAction` para auditoría.

### 8.11. Permisos

- `organizer`: gestiona sus propios eventos.
- `vendor`: gestiona su perfil, servicios y cotizaciones.
- `admin`: gestiona catálogo y moderación.
- Un mismo `User` puede tener múltiples roles (futuro).

### 8.12. IA generativa (regla transversal crítica)

> **Toda sugerencia generada por IA debe ser validada explícitamente por el usuario antes de convertirse en dato oficial del evento (tarea, presupuesto, recomendación de proveedor).** El sistema debe distinguir visualmente entre “sugerido por IA” y “confirmado por el usuario”.

---

## 9. Alcance Recomendado del MVP

### 9.1. Lo que SÍ entra al MVP

1. **Autenticación** (email + password; OAuth opcional con Google).
2. **Creación de evento** (wizard de datos básicos).
3. **Generación de plan IA** (timeline macro + categorías sugeridas).
4. **Generación de checklist IA** (tareas con fechas relativas).
5. **Presupuesto con categorías** (sugerido por IA, editable).
6. **Directorio de proveedores** (búsqueda, filtros, perfil).
7. **Perfil de proveedor** (portafolio simple, paquetes, ciudad, categorías).
8. **Solicitud de cotización** (brief estructurado).
9. **Respuesta del proveedor** (plantilla simple).
10. **Comparador de cotizaciones** (vista lado a lado).
11. **Booking intent simulado**.
12. **Dashboard de progreso del evento**.
13. **Panel admin** (aprobar proveedores, gestionar categorías).
14. **Reseñas básicas**.
15. **Notificaciones in-app**.

### 9.2. Lo que NO entra al MVP

- Pagos reales y comisiones.
- Contratos digitales con firma electrónica.
- Chat en tiempo real con presencia.
- App móvil nativa (la web responsive basta).
- Geolocalización avanzada / mapas interactivos.
- Logística compleja (rutas, multi-venue).
- Verificación automática de proveedores (KYC).
- Manejo de impuestos, facturación electrónica.
- Multi-colaboradores por evento.
- Listas de invitados, RSVP, mesas.

### 9.3. Lo que se puede SIMULAR en MVP

- Notificaciones por email (in-app + log de “se habría enviado a X”).
- Confirmación de booking (sin pago real).
- Verificación de proveedor (admin manual).
- Disponibilidad de proveedor (campo simple, no calendario completo).
- Datos seed de 20–40 proveedores ficticios para demo.

### 9.4. Stack sugerido (referencia, no parte del discovery)

- Frontend web responsive (Next.js / React).
- Backend (Node.js o Python).
- DB relacional (PostgreSQL).
- LLM vía API (OpenAI / Anthropic / similar) con prompts versionados.
- Hosting cloud (Vercel + Render/Railway/Supabase).
- Auth gestionada (Clerk / Auth.js / Supabase Auth).

---

## 10. Oportunidades de IA

| # | Caso de uso | Problema | Input | Output | Valor | MVP / Futuro | Validación humana |
|---|---|---|---|---|---|---|---|
| 1 | **Generación de plan** | “No sé por dónde empezar” | Tipo, fecha, invitados, presupuesto, ciudad | Timeline macro + categorías recomendadas | Alto: cuña principal | MVP | Sí (aceptar/editar) |
| 2 | **Generación de checklist** | Olvido de tareas | Plan aprobado | Lista tareas con fechas relativas | Alto | MVP | Sí (aceptar bloque/individual) |
| 3 | **Sugerencia de presupuesto** | Subestimación | Total, tipo, invitados | Distribución por categoría | Alto | MVP | Sí (editable) |
| 4 | **Recomendación de categorías de proveedor** | No sabe qué buscar | Tipo, presupuesto | Categorías priorizadas | Medio | MVP | Sí |
| 5 | **Resumen comparativo de cotizaciones** | Cotizaciones desiguales | Set de quotes | Tabla normalizada + insights | Alto | MVP (versión simple) | Sí |
| 6 | **Generación de brief para cotizar** | Mensajes ambiguos | Datos del evento | Brief estructurado | Medio | MVP | Sí |
| 7 | **Generación de perfil del proveedor** | Vendors no saben describirse | Inputs básicos | Bio + descripción de paquetes | Medio | MVP (opcional) | Sí |
| 8 | **Priorización de tareas** | Estrés a 2 semanas | Estado de tareas | Top 3 acciones urgentes | Medio | MVP | Sí |
| 9 | **Resumen del evento** | Visión global | Datos agregados | Insight ejecutivo | Bajo–Medio | Futuro | Sí |
| 10 | **Detección de inconsistencias** | Presupuesto vs cotizaciones | Estado | Warnings | Medio | Futuro | Sí |
| 11 | **Recomendaciones de proveedores específicos** | Coincidencia | Evento + catálogo | Top 3 vendors | Alto | Futuro (requiere data) | Sí |

> **Regla transversal:** La IA **asiste decisiones**, no las automatiza. Decisiones de alto riesgo (contratar, pagar, comprometer presupuesto) siempre las toma el humano.

---

## 11. Riesgos y Mitigaciones

### Riesgo 1 — Alcance MVP desbordado

- **Descripción:** Tentación de construir un marketplace completo con pagos y chat.
- **Impacto:** Alto.
- **Probabilidad:** Alta.
- **Mitigación:** Definir scope MVP por escrito y validarlo con el comité académico; congelar features fuera del MVP.
- **Impacto MVP/Futuro:** Es el riesgo más relevante para un proyecto académico.

### Riesgo 2 — Calidad de la salida de IA

- **Descripción:** El LLM puede alucinar precios, categorías o tareas irrelevantes.
- **Impacto:** Medio–Alto.
- **Probabilidad:** Alta.
- **Mitigación:** Prompts versionados, plantillas por tipo de evento, validación humana obligatoria, evaluación con dataset de prueba.
- **Impacto:** Crítico para credibilidad.

### Riesgo 3 — Adopción de proveedores

- **Descripción:** Sin proveedores reales, el flujo de cotizaciones no es demostrable.
- **Impacto:** Medio.
- **Probabilidad:** Alta.
- **Mitigación:** Cargar 20–40 proveedores seed ficticios o reales con permiso, para demo.

### Riesgo 4 — Confianza y fraude

- **Descripción:** Proveedores falsos podrían captar anticipos fuera de la plataforma.
- **Impacto:** Alto (a futuro).
- **Probabilidad:** Media.
- **Mitigación MVP:** Aprobación manual del admin + reseñas + disclaimer claro.
- **Impacto:** Manejable en MVP, crítico en escala.

### Riesgo 5 — Privacidad y datos personales

- **Descripción:** Se manejan datos del evento, contactos, presupuesto.
- **Impacto:** Alto.
- **Probabilidad:** Media.
- **Mitigación:** Cifrado en tránsito y en reposo, política de privacidad clara, mínima recolección.

### Riesgo 6 — Costos de IA

- **Descripción:** Llamadas a LLM tienen costo por token.
- **Impacto:** Medio.
- **Probabilidad:** Media.
- **Mitigación:** Cachear salidas por plantilla, limitar regeneraciones, usar modelos económicos para tareas simples.

### Riesgo 7 — Dependencia de un único proveedor de LLM

- **Descripción:** Cambios de pricing o de API.
- **Impacto:** Medio.
- **Probabilidad:** Media.
- **Mitigación:** Capa de abstracción que permita cambiar proveedor.

### Riesgo 8 — Competidores con marca consolidada

- **Descripción:** The Knot / Bodas.net dominan SEO en bodas.
- **Impacto:** Medio (a futuro comercial).
- **Probabilidad:** Alta.
- **Mitigación:** Posicionar EventFlow como **copiloto IA multi-evento LATAM**, no como directorio de bodas.

### Riesgo 9 — Calidad de UX y rendimiento

- **Descripción:** Latencia de IA puede frustrar.
- **Impacto:** Medio.
- **Probabilidad:** Media.
- **Mitigación:** Streaming de respuestas, skeleton loaders, fallback a plantillas estáticas.

### Riesgo 10 — Validación académica vs. realismo comercial

- **Descripción:** El proyecto puede quedar académico pero no demostrable comercialmente.
- **Impacto:** Medio.
- **Probabilidad:** Media.
- **Mitigación:** Demo guiada con datos seed realistas y métricas de IA visibles.

---

## 12. Métricas de Éxito

### 12.1. Producto

- # de eventos creados.
- # de checklists generados por IA.
- # de QuoteRequests creadas.
- # de cotizaciones recibidas.
- % de progreso promedio del evento al cierre.
- Tasa de activación (usuarios que llegan a tener checklist + presupuesto + 1 quote request).

### 12.2. Proveedor

- # proveedores activos (con perfil aprobado).
- Tasa de respuesta a cotizaciones.
- Tiempo medio de respuesta.
- % de perfiles completos (>80% de campos).

### 12.3. IA

- Tasa de aceptación del plan generado (sin edición).
- Tasa de edición del checklist.
- Tasa de aceptación de distribución de presupuesto.
- # de regeneraciones por usuario por sesión.
- Satisfacción cualitativa (encuesta corta post-uso).

### 12.4. Técnicas

- Disponibilidad (target 99% en demo).
- Tiempo de respuesta P95 < 1.5s en endpoints no-IA.
- Latencia P95 de IA < 8s (con streaming).
- Cobertura de pruebas > 60% en lógica de negocio.
- Tasa de error < 1%.

---

## 13. Priorización de Features

| Feature | Prioridad |
|---|---|
| Autenticación | **Must Have** |
| Creación de evento (wizard) | **Must Have** |
| Generación de plan IA | **Must Have** |
| Generación de checklist IA | **Must Have** |
| Presupuesto con categorías + IA | **Must Have** |
| Directorio y perfil de proveedor | **Must Have** |
| Solicitud de cotización (brief) | **Must Have** |
| Respuesta de cotización | **Must Have** |
| Comparador de cotizaciones (vista simple) | **Must Have** |
| Dashboard de progreso | **Must Have** |
| Panel admin (categorías + aprobar vendors) | **Must Have** |
| Notificaciones in-app + email simulado | **Should Have** |
| Reseñas básicas | **Should Have** |
| Resumen comparativo IA | **Should Have** |
| Generación IA de perfil del proveedor | **Could Have** |
| Recomendaciones IA de proveedores específicos | **Could Have** |
| Chat real-time | **Won’t Have (MVP)** |
| Pagos reales y comisiones | **Won’t Have (MVP)** |
| App móvil nativa | **Won’t Have (MVP)** |
| Calendario completo de disponibilidad | **Won’t Have (MVP)** |
| Multi-colaboradores por evento | **Won’t Have (MVP)** |
| Lista de invitados / RSVP / mesas | **Won’t Have (MVP)** |

---

## 14. Recomendación Estratégica

**Recomendación: `Build with constraints`.**

**Posicionamiento recomendado del MVP:**

> EventFlow debe iniciar como un **workspace de planificación asistido por IA** para **anfitriones primerizos de eventos sociales en LATAM** que necesitan **convertir una idea de evento en un plan accionable** (checklist + presupuesto + cotizaciones), usando IA para **eliminar la fricción de empezar y de comparar proveedores**, mientras se mantienen **las decisiones críticas (contratar, pagar) bajo control del usuario**.

### 14.1. Respuestas a las preguntas estratégicas

1. **¿Es EventFlow viable?** Sí, con alcance acotado.
2. **¿Es adecuado como proyecto académico final?** Sí, permite cubrir ciclo completo de software con IA en todas las fases (discovery, requisitos, arquitectura, código, pruebas, deploy).
3. **¿Es adecuado como portafolio?** Sí. Demuestra UX con IA conversacional, modelado de dominio no trivial, dos perfiles de usuario, lógica de negocio real y diseño de prompts.
4. **¿Es realista como futuro MVP comercial?** Sí. La cuña de “copiloto IA para eventos sociales LATAM” tiene hueco frente a The Knot/Bodas.net y frente a LLMs genéricos.
5. **¿Iniciar como workspace IA o como marketplace completo?** **Workspace IA primero.** Construir marketplace completo con pagos en v1 es inviable académica y operativamente.
6. **¿Qué evitar en v1?** Pagos reales, chat real-time, app nativa, calendario completo, KYC automático, multi-colaboradores, lista de invitados.
7. **¿Cuál es el diferenciador más fuerte?** Workspace conversacional IA multi-evento en español LATAM, con cotización estructurada.
8. **¿Cómo usar IA sin sobre-complicar?** Mantener IA como **asistente**, con outputs validados por el usuario y prompts versionados; cachear cuando se pueda; un solo proveedor LLM detrás de una capa de abstracción.
9. **¿Posicionamiento recomendado?** “El copiloto IA para organizar tu evento sin perder la cabeza.”
10. **¿Siguiente paso después del discovery?** Definir requisitos funcionales y no funcionales, user stories priorizadas, wireframes de las 8–10 pantallas core, y prompt design del módulo IA.

### 14.2. Validación de la hipótesis

> **Hipótesis original:** EventFlow es más viable si inicia como workspace de planificación asistido por IA antes de convertirse en marketplace.

**Resultado:** **Hipótesis validada.** Las razones:

- **Time-to-value mucho más corto** desde el lado del cliente (no requiere masa crítica de proveedores para entregar valor: el plan + checklist + presupuesto ya valen por sí solos).
- **Riesgo regulatorio y financiero bajo** (sin pagos, sin contratos, sin comisiones en v1).
- **Diferenciación clara frente a directorios legacy** (The Knot, Bodas.net) que tienen marketplace pero no IA nativa.
- **Realismo académico:** el marketplace completo añadiría meses de trabajo en pagos, KYC, disputas y comisiones, irrelevantes para demostrar dominio de AI-assisted software development.
- **Camino de expansión claro:** una vez validada la cuña, agregar reservas reales, pagos y comisiones es una expansión natural en v2/v3.

---

## 15. Preguntas Abiertas para el Product Owner

1. ¿Cuál es el **mercado piloto** prioritario: Guatemala, México, Colombia, España, regional?
2. ¿Cuáles son los **3 tipos de evento** prioritarios para el MVP (sugerencia: boda, XV años, baby shower)?
3. ¿Habrá **proveedores reales** desde el día uno o sólo datos seed para la demo?
4. ¿El modelo de negocio futuro será **suscripción de proveedor**, **pay-per-lead**, **comisión por reserva**, o **freemium para el organizador**?
5. ¿Qué **proveedor LLM** se usará por defecto (OpenAI / Anthropic / open source) y bajo qué presupuesto?
6. ¿El equipo construirá **app móvil nativa** o se quedará en web responsive en v1?
7. ¿Qué nivel de **personalización por país** (moneda, idioma local, modismos) requiere el MVP?
8. ¿Habrá **integración con WhatsApp** desde el MVP o queda como futuro?
9. ¿Qué **branding** queremos: serio/profesional, juvenil/cercano, premium/aspiracional?
10. ¿Quién será el **admin** en la demo y cómo se demostrará la moderación?
11. ¿Habrá **reseñas reales o simuladas** en la demo?
12. ¿Qué **métricas** son críticas para la evaluación académica vs. para el pitch de portafolio?
13. ¿Se contempla **análisis de sentimiento o moderación con IA** sobre reseñas en v1 o se difiere?
14. ¿La plataforma debe cumplir con alguna **normativa específica** (LFPDPPP México, LOPD España, etc.) o sólo buenas prácticas en MVP?
15. ¿Qué **idiomas** se soportan en MVP (sólo español LATAM, o también español de España y portugués)?

---

## 16. Glosario del Dominio

- **Anfitrión / Organizador:** Persona usuaria que planifica un evento. Sinónimos: cliente, host, organizer.
- **Vendor / Proveedor:** Persona o negocio que ofrece un servicio de evento.
- **Admin:** Usuario interno responsable de curaduría y moderación.
- **Event:** Evento social planificado en la plataforma (boda, XV, baby shower, etc.).
- **EventType:** Tipo de evento que determina plantilla IA por defecto.
- **Plan:** Conjunto de tareas, presupuesto y categorías generado para un evento.
- **Checklist:** Lista de tareas accionables con fechas relativas al evento.
- **EventTask:** Tarea individual de la checklist.
- **Budget:** Presupuesto total del evento.
- **BudgetItem:** Categoría dentro del presupuesto (catering, foto, etc.).
- **ServiceCategory:** Categoría de servicio que un proveedor puede ofrecer.
- **VendorProfile:** Perfil público de un proveedor.
- **VendorService:** Servicio específico o paquete ofrecido por un proveedor.
- **QuoteRequest / Solicitud de cotización:** Pedido estructurado del organizador a un proveedor.
- **Quote / Cotización:** Respuesta formal de un proveedor con precio y condiciones.
- **BookingIntent / Intención de reserva:** Acuerdo confirmado en plataforma de avanzar con un proveedor, sin pago real en MVP.
- **Review / Reseña:** Calificación + comentario sobre un proveedor.
- **AIRecommendation:** Sugerencia generada por IA (plan, checklist, presupuesto, etc.).
- **Hora loca:** Animación intensa típica en bodas, XV y eventos sociales LATAM, usualmente al final de la fiesta. Modismo cultural relevante para plantillas.
- **Candy bar / Mesa de dulces:** Estación de dulces decorada. Modismo cultural relevante para presupuesto.
- **Padrinos:** Patrocinadores tradicionales de partes del evento (anillos, lazo, ramos). Modismo cultural relevante para checklist.
- **MVP:** Producto Mínimo Viable.
- **JTBD:** Jobs To Be Done.
- **LLM:** Large Language Model.

---

## 17. Fuentes Consultadas

- [MarketsandMarkets — Event Management Software Market Report](https://www.marketsandmarkets.com/Market-Reports/event-management-software-market-136859992.html) — Tamaño y CAGR del mercado EMS, impacto de IA generativa.
- [IMARC Group — Event Management Software Market](https://www.imarcgroup.com/event-management-software-market) — Proyección USD 10.5B al 2030, participación regional, vendors líderes.
- [The Knot Worldwide — Press Release 2024](https://www.theknotww.com/press-releases/the-knot-worldwide-announces-new-platform-features-to-drive-wedding-vendor-success) — Actualizaciones del marketplace de bodas, marcas globales (Bodas.net, Matrimonio.com), modelo híbrido de pricing.
- [Boda Bliss — Zola vs. The Knot for Vendors (2025)](https://bodabliss.com/zola-vs-the-knot-vendor-comparison/) — Comparativa de modelos de monetización, pain points de vendors con directorios legacy.
- [Whova — Best ChatGPT Alternatives for Event Planning (2025)](https://whova.com/blog/chatgpt-alternatives-event-planning/) — Panorama de herramientas IA en event planning corporativo.
- [Whova — How to Use AI for Event Planning in 2026](https://whova.com/blog/ai-event-planning/) — Patrones de uso de IA con prompts estructurados.
- [Lensmor — Best AI Tool for Event Planning in 2026](https://www.lensmor.com/blog/ai-tool-for-event-planning) — Stack típico de AI tools para planners.
- [EventMobi — Complete Event Budget Guide 2026](https://www.eventmobi.com/blog/event-budget-basics/) — Estructura de categorías y patrones de presupuesto.
- [JDC Events — Pain Points in Venue Sourcing (2025)](https://jdc-events.com/6-common-pain-points-in-venue-sourcing-solutions/) — Pain points de venue sourcing.

---

> **Notas finales sobre rigor:**
>
> - Los **hechos confirmados** provienen de fuentes citadas con enlace directo.
> - Las **asunciones razonables** están marcadas en el texto y se basan en patrones observables del dominio LATAM.
> - Las **hipótesis** (especialmente sobre adopción y diferenciación) requieren validación con entrevistas de usuario y pruebas con datos reales.
> - Las **preguntas abiertas** de la sección 15 deben resolverse antes de pasar a la fase de requisitos detallados.
