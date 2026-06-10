# Funcionalidades CORE (MVP) — Web Corporativa B2B de Ingeniería Geotécnica

**Tipo de proyecto:** Web de captación de leads cualificados (presupuestos, contactos técnicos, licitaciones)
**Sector:** Servicios geotécnicos en España
**Audiencia:** Arquitectos, promotoras inmobiliarias, ingenierías civiles, administraciones públicas
**Canales de adquisición:** SEO orgánico + SEM

---

## 1. Páginas de Servicio con Arquitectura de Silo Local (Service Landing Pages)

- **Prioridad:** Alta
- **Descripción:** Crear una página individual por cada servicio principal (estudios geotécnicos para edificación, sondeos mecánicos a rotación y percusión, ensayos de laboratorio de suelos, control de calidad de cimentaciones, informes periciales geotécnicos, geotecnia marítima y portuaria, instrumentación geotécnica, hidrogeología). Cada página debe contener: definición técnica del servicio, metodología de ejecución paso a paso, normativa aplicable (CTE DB-SE-C, UNE-EN ISO 22476, Guía de Cimentaciones del Ministerio), equipamiento utilizado (tipo de sonda, penetrómetro, etc.), tipología de proyectos donde se aplica, entregables que recibe el cliente (memoria geotécnica, columnas litológicas, resultados de laboratorio) y un CTA contextual de solicitud de presupuesto. Cada página debe tener breadcrumbs, schema markup `Service` y links internos hacia casos de estudio y la página geográfica correspondiente.
- **Objetivo de negocio/captación:** Cada página actúa como landing page de entrada desde búsquedas orgánicas o campañas SEM. Al ser específica del servicio, el visitante encuentra exactamente lo que busca, lo que reduce el bounce rate y aumenta la probabilidad de conversión a formulario. Permite segmentar los leads por tipo de servicio desde el primer contacto.
- **Impacto en SEO B2B:** Permite posicionar long-tails transaccionales del tipo "empresa de sondeos geotécnicos", "estudio geotécnico para vivienda unifamiliar", "ensayo SPT Madrid". Cada página concentra autoridad temática sobre un cluster de keywords. La inclusión de normativa y terminología técnica real (SPT, DPSH, presiómetro Ménard, corte directo CU/CD) genera relevancia semántica que los competidores con páginas genéricas no alcanzan.
- **Relevancia para el sector geotécnico:** Los servicios geotécnicos no son intercambiables. Un arquitecto que necesita un estudio geotécnico para un edificio de 6 plantas tiene necesidades muy distintas a una ingeniería que necesita instrumentación de un talud. Sin páginas dedicadas, la web no puede captar tráfico segmentado ni demostrar competencia técnica específica por servicio.

---

## 2. Formulario de Solicitud de Presupuesto Contextual y Multi-paso

- **Prioridad:** Alta
- **Descripción:** Formulario principal de captación con campos condicionados al servicio seleccionado. Paso 1: tipo de servicio + provincia/localización de la obra. Paso 2: datos del proyecto (tipo de edificación/obra civil, nº de plantas, superficie aproximada, fase del proyecto). Paso 3: datos de contacto (nombre, empresa, email corporativo, teléfono, rol profesional). Implementar validación en tiempo real, autocompletado de localidades, indicador de progreso visual, y envío asíncrono con confirmación en pantalla + email automático con número de referencia. Debe poder pre-rellenarse vía URL params (ej. `?servicio=sondeos&provincia=madrid`) para recibir tráfico cualificado desde landing pages y campañas. Cada envío debe disparar un evento en GTM/GA4 como conversión.
- **Objetivo de negocio/captación:** Es el principal punto de conversión. El formato multi-paso reduce la fricción percibida (cada paso pide poca información) y aumenta el completion rate respecto a un formulario largo de un solo bloque. La cualificación progresiva permite que el equipo comercial reciba leads con contexto suficiente para priorizar y presupuestar sin llamada previa.
- **Impacto en SEO B2B:** El formulario en sí no posiciona, pero al integrarse como CTA en cada página de servicio y caso de estudio, reduce el número de clics entre la entrada orgánica y la conversión. Google valora las páginas que resuelven el intent del usuario; una página de servicio con formulario contextual tiene mejor engagement que una que obliga a buscar la sección "contacto".
- **Relevancia para el sector geotécnico:** Presupuestar un estudio geotécnico requiere datos mínimos del proyecto (ubicación, tipo de obra, dimensiones). Si el formulario captura esto desde el inicio, se elimina el ciclo habitual de email genérico → llamada para cualificación → segundo email con datos → presupuesto. Esto acelera el funnel de venta en un sector donde los plazos de licitación son ajustados.

---

## 3. Catálogo de Proyectos Realizados / Casos de Estudio Técnicos

- **Prioridad:** Alta
- **Descripción:** Sección filtrable por tipo de servicio, tipología de obra (edificación residencial, obra civil, infraestructura portuaria, rehabilitación, etc.), provincia/comunidad autónoma y año. Cada caso de estudio es una página individual que incluye: localización del proyecto, cliente (si es público o con permiso), servicio prestado, problemática geotécnica encontrada (nivel freático alto, rellenos antrópicos, arcillas expansivas, roca a escasa profundidad...), solución técnica adoptada, maquinaria empleada, volumen de trabajo (nº de sondeos, metros perforados, ensayos realizados) y resultado del proyecto. Incluir fotografías de campo reales (sondas en obra, testigos de roca, ensayos in situ). Implementar schema `Article` o `CreativeWork` con datos estructurados de localización.
- **Objetivo de negocio/captación:** Los casos de estudio son la herramienta de confianza más efectiva en B2B técnico. Un promotor que ve que la empresa ha realizado 40 sondeos para un edificio de 12 plantas en su misma provincia tiene la prueba de solvencia que necesita para solicitar presupuesto. Cada caso incluye CTA hacia el formulario con el servicio y zona pre-seleccionados.
- **Impacto en SEO B2B:** Cada caso genera una URL indexable con combinaciones de servicio + localización + tipología de obra que capturan long-tails informacionales ("estudio geotécnico edificio residencial Valencia", "sondeos para cimentación profunda Barcelona"). Es contenido único e irrecuperable que los competidores no pueden copiar, lo que genera ventaja en E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
- **Relevancia para el sector geotécnico:** La geotecnia es un servicio de confianza: un error en la campaña de sondeos puede comprometer la cimentación de un edificio entero. Los decisores (arquitectos, directores de proyecto) necesitan ver experiencia demostrable en condiciones geológicas similares a las de su obra antes de adjudicar.

---

## 4. Páginas de Cobertura Geográfica (Geo-Landing Pages)

- **Prioridad:** Alta
- **Descripción:** Páginas específicas por provincia o municipio donde la empresa opera. Cada página debe contener: descripción de la actividad en esa zona, mención de la geología predominante local (ej. Madrid: arcosas, arenas de miga, yesos del Terciario; Barcelona: materiales deltaicos, pizarras paleozoicas; Valencia: arcillas expansivas del Keuper, gravas cuaternarias), proyectos realizados en esa zona (enlace a casos de estudio filtrados), maquinaria disponible o base operativa, y formulario o CTA con la provincia pre-seleccionada. No deben ser contenido thin: cada página necesita al menos 800-1200 palabras de contenido original y técnicamente relevante para esa zona.
- **Objetivo de negocio/captación:** Capturan directamente las búsquedas con intención local, que representan la mayoría del tráfico transaccional del sector ("estudios geotécnicos Málaga", "sondeos geotécnicos Bilbao"). Al aterrizar en una página que menciona su provincia, el visitante percibe proximidad y capacidad de ejecución, lo que incrementa la conversión.
- **Impacto en SEO B2B:** La combinación servicio + localidad es el patrón de búsqueda dominante en geotecnia (volúmenes de 50-500 búsquedas/mes por provincia para los términos principales). Estas páginas compiten directamente por el Local Pack y los resultados orgánicos geolocalizados. Sin ellas, posicionar en provincias donde no se tiene oficina física es prácticamente imposible.
- **Relevancia para el sector geotécnico:** La geología cambia radicalmente entre provincias. Un arquitecto en Sevilla trabaja sobre margas azules del Guadalquivir; uno en Galicia, sobre granitos y esquistos. Mencionar la geología local no es relleno: es demostración de conocimiento del terreno, que es literalmente el core business.

---

## 5. Ficha de Perfil Profesional del Equipo Técnico

- **Prioridad:** Alta
- **Descripción:** Página con los perfiles de los geólogos, ingenieros geotécnicos y directores técnicos clave. Cada ficha incluye: nombre, titulación, colegiación (nº de colegiado si es público), años de experiencia, especialización (geotecnia marítima, peritaciones, cimentaciones especiales…), publicaciones técnicas o ponencias si las hay, y proyectos destacados con enlace al caso de estudio correspondiente. Implementar schema `Person` con propiedades `jobTitle`, `worksFor`, `alumniOf`. No es un "sobre nosotros" genérico; es un directorio técnico que refuerza la firma de los informes.
- **Objetivo de negocio/captación:** En ingeniería, la credibilidad del firmante del informe es decisiva. Las administraciones públicas exigen solvencia técnica del personal asignado. Mostrar perfiles reales con colegiación y trayectoria reduce la objeción de confianza y acorta el ciclo de decisión.
- **Impacto en SEO B2B:** Refuerza directamente los criterios E-E-A-T que Google aplica a contenido YMYL técnico. Los perfiles generan entidades reconocibles en el Knowledge Graph y permiten vincular publicaciones, proyectos y la empresa en un grafo de autoría. Los firmantes de los informes técnicos son citados en otros documentos, lo que puede generar menciones y backlinks naturales.
- **Relevancia para el sector geotécnico:** Los informes geotécnicos llevan firma de colegiado. Un promotor o una administración que ve al firmante en la web, con su historial y colegiación, tiene un nivel de verificación previo a la contratación que es específico y necesario en este sector regulado.

---

## 6. Blog Técnico / Centro de Conocimiento Geotécnico

- **Prioridad:** Alta
- **Descripción:** Sección de contenido técnico-educativo con artículos categorizados por: normativa y legislación, tipologías de terreno, técnicas de investigación, patologías de cimentación, y guías prácticas para profesionales. Ejemplos de contenido: "¿Cuántos sondeos necesita un edificio según el CTE?", "Diferencias entre DPSH y SPT", "Cómo interpretar una columna litológica", "Qué es un estudio geotécnico y cuándo es obligatorio", "Arcillas expansivas: identificación y soluciones de cimentación". Cada artículo con schema `Article`, autor vinculado a la ficha del equipo técnico, tabla de contenidos, enlaces internos a servicios relacionados, y CTA contextual. Implementar paginación SEO-friendly y URLs con estructura `/blog/[categoria]/[slug]`.
- **Objetivo de negocio/captación:** Captura tráfico informacional top-of-funnel de profesionales que aún no tienen un proyecto definido pero están investigando. Estos visitantes entran en el funnel de nurturing: cookies de remarketing, suscripción a newsletter técnica, y descarga de recursos. Los artículos con intención más cercana a la transacción ("cuánto cuesta un estudio geotécnico", "cuánto tarda un informe geotécnico") convierten directamente.
- **Impacto en SEO B2B:** Es la principal herramienta para construir autoridad temática (topical authority) en el cluster semántico de la geotecnia. Google necesita un volumen crítico de contenido interconectado para considerar un dominio como referente. Los artículos informacionales capturan long-tails con volumen agregado significativo y alimentan de links internos a las páginas transaccionales de servicio.
- **Relevancia para el sector geotécnico:** El sector tiene un déficit crónico de contenido técnico de calidad en español. La mayoría de webs de empresas geotécnicas son estáticas y sin blog. Esto crea una oportunidad de captura de tráfico con barrera de entrada baja respecto a sectores más competidos.

---

## 7. Página de Equipamiento y Maquinaria

- **Prioridad:** Media
- **Descripción:** Listado del parque de maquinaria con ficha técnica por equipo: tipo de sonda (rotación, percusión, mixta), modelo, profundidad máxima de perforación, diámetros de trabajo, equipos de ensayo in situ (SPT, DPSH, Lefranc, Lugeon, presiómetro), laboratorio propio o concertado con acreditación ENAC, y vehículos especiales (orugas para acceso difícil, plataformas para espacios confinados). Cada equipo con fotografía real y vinculación al servicio donde se utiliza.
- **Objetivo de negocio/captación:** Demuestra capacidad operativa real. Un ingeniero que supervisa una obra necesita saber que la empresa puede llegar a 60 metros con rotación en roca, o que tiene sonda sobre orugas para un solar sin acceso para camión. Esta información elimina objeciones técnicas antes de la llamada comercial.
- **Impacto en SEO B2B:** Genera contenido único con terminología técnica específica que refuerza la relevancia semántica del dominio. Las fichas de maquinaria son contenido que los competidores rara vez publican, lo que crea diferenciación de contenido indexable.
- **Relevancia para el sector geotécnico:** La capacidad de perforación (profundidad, diámetro, tipo de terreno) condiciona directamente qué proyectos puede abordar una empresa. Para una promotora con un proyecto de cimentación profunda en roca, saber que la empresa tiene sonda de rotación con corona de diamante no es marketing: es un requisito técnico de adjudicación.

---

## 8. Sistema de Click-to-Call y Contacto Directo Segmentado

- **Prioridad:** Media
- **Descripción:** Implementar botones de llamada directa (`tel:`) en cabecera sticky y en todos los CTAs de páginas de servicio, visibles especialmente en móvil. Segmentar por departamento: teléfono para presupuestos / teléfono para dirección técnica / email para licitaciones. Incluir un widget de WhatsApp Business con mensaje predefinido que incluya el servicio de la página actual (ej. "Hola, necesito presupuesto para [servicio] en [provincia]"). Cada interacción rastreada como evento en GA4 (click en tel, click en WhatsApp, click en email).
- **Objetivo de negocio/captación:** En geotecnia B2B, muchas conversiones son telefónicas. El director de obra que necesita un sondeo urgente no rellena formularios: llama. No capturar llamadas como conversiones infravalora el rendimiento del canal orgánico. La segmentación evita que llamadas de licitación colapsen la línea de presupuestos.
- **Impacto en SEO B2B:** Los datos de interacción (CTR en botones, tiempo en página con engagement) son señales de comportamiento que correlacionan con mejores posiciones. Google Business Profile también puede vincular el número de teléfono para consistencia NAP (Name, Address, Phone), lo que refuerza el SEO local.
- **Relevancia para el sector geotécnico:** Los plazos en obras son críticos. Cuando una excavación encuentra un terreno inesperado, se necesita un geotécnico en 24-48h. La facilidad de contacto directo no es comodidad: es un diferenciador competitivo en un sector donde la urgencia es frecuente.

---

## 9. Integración con Google Business Profile y Schema LocalBusiness

- **Prioridad:** Media
- **Descripción:** Configurar y optimizar la ficha de Google Business Profile con categoría principal "Empresa de ingeniería geotécnica" (o la más cercana disponible: "Geotechnical engineer"), área de servicio por provincias, horario, fotos de maquinaria y obra, y publicaciones periódicas con casos de estudio. En la web, implementar schema `LocalBusiness` (o `ProfessionalService`) con `areaServed` multivalor (listado de provincias), `hasOfferCatalog` vinculado a los servicios, y `aggregateRating` si se dispone de reseñas verificables. Asegurar consistencia NAP absoluta entre web, GBP y directorios del sector (Páginas Amarillas, Europages, registros colegiales).
- **Objetivo de negocio/captación:** El Local Pack de Google aparece por encima de los resultados orgánicos para búsquedas con intención local. Estar en el Pack para "estudios geotécnicos [provincia]" genera visibilidad directa con clics de alta intención. Las reseñas en GBP actúan como prueba social adicional.
- **Impacto en SEO B2B:** GBP es el factor dominante para el posicionamiento local. El schema `LocalBusiness` con `areaServed` permite que Google entienda la cobertura geográfica de la empresa sin necesidad de oficinas físicas en cada provincia. La consistencia NAP en citaciones refuerza las señales de entidad.
- **Relevancia para el sector geotécnico:** Muchas búsquedas geotécnicas son intrínsecamente locales porque el servicio se ejecuta in situ. Una empresa de sondeos necesita desplazar maquinaria a la obra, por lo que la cobertura geográfica no es un dato menor: es un criterio de selección primario.

---

## 10. Tracking de Conversiones y Capa de Datos (GTM + GA4)

- **Prioridad:** Media
- **Descripción:** Implementar Google Tag Manager con dataLayer estructurado para: envíos de formulario (con parámetros de servicio, provincia y tipo de usuario), clics en tel:, clics en WhatsApp, clics en email, descargas de documentos técnicos, scroll depth en páginas de servicio (25/50/75/100%), tiempo de engagement. Configurar en GA4: eventos de conversión, audiencias de remarketing por servicio visitado, informes de atribución multi-canal. Implementar el tag de conversión de Google Ads para medir el coste por lead segmentado por servicio y zona.
- **Objetivo de negocio/captación:** Sin tracking no hay optimización. Permite saber qué páginas de servicio convierten mejor, qué provincias generan más leads, si los leads vienen de orgánico o de pago, y cuál es el coste de adquisición por canal. Es la infraestructura que permite iterar sobre el MVP con datos reales.
- **Impacto en SEO B2B:** Permite medir el ROI real del SEO: qué keywords orgánicas generan leads, qué páginas tienen mejor ratio visita/conversión, y dónde invertir en contenido. Sin esto, el SEO se gestiona a ciegas.
- **Relevancia para el sector geotécnico:** El valor medio de un presupuesto geotécnico varía de 2.000€ a 200.000€ según el tipo de obra. Saber que un lead de geotecnia portuaria vale 50x más que uno de vivienda unifamiliar permite priorizar esfuerzos de posicionamiento y asignación de presupuesto de Ads.

---

## 11. Página de Descarga de Recursos Técnicos (Lead Magnets)

- **Prioridad:** Media
- **Descripción:** Sección con documentos descargables a cambio de datos de contacto (gated content): checklist de documentación para solicitar un estudio geotécnico, guía de interpretación de informes geotécnicos para arquitectos, tabla resumen de ensayos de laboratorio según normativa, modelo tipo de anejo geotécnico para proyecto básico. Formulario breve (nombre, email, empresa, rol) con integración a CRM o herramienta de email marketing. Implementar Thank You pages con URL única para medir conversiones. Cada recurso vinculado a su categoría de servicio.
- **Objetivo de negocio/captación:** Captura leads que están en fase de investigación y aún no preparados para pedir presupuesto. Son leads de nurturing que se convierten en el medio plazo cuando su proyecto avanza. El recurso descargable posiciona a la empresa como referente antes de la necesidad comercial.
- **Impacto en SEO B2B:** Las páginas de recursos generan backlinks naturales desde blogs de arquitectura, foros técnicos y universidades que enlazan al recurso como referencia. Esto incrementa la autoridad del dominio de forma sostenida.
- **Relevancia para el sector geotécnico:** Los arquitectos y directores de obra frecuentemente necesitan entender informes geotécnicos que no son su especialidad. Una guía de interpretación de columnas litológicas o de clasificación de suelos es genuinamente útil y crea una relación de valor antes de la transacción comercial.

---

## 12. Sección de Acreditaciones, Certificaciones y Registros

- **Prioridad:** Media
- **Descripción:** Página dedicada a mostrar: acreditación ENAC del laboratorio (si aplica), certificación ISO 9001/14001, inscripción en el registro de empresas del Ministerio, clasificación como contratista de obras públicas (grupos y subgrupos), seguros de responsabilidad civil profesional, y pertenencia a asociaciones sectoriales (AETESS, ALGI, colegio profesional). Cada certificación con logo, número de registro/acreditación, y documento verificable o enlace al organismo acreditador. Schema `Organization` con propiedades `hasCredential`.
- **Objetivo de negocio/captación:** En licitaciones públicas, la clasificación de contratista y las certificaciones son requisitos de solvencia técnica. Mostrarlas abiertamente ahorra tiempo al cliente público y demuestra transparencia. Para clientes privados, la acreditación ENAC del laboratorio es un diferenciador directo frente a competidores sin ella.
- **Impacto en SEO B2B:** Los datos estructurados de acreditaciones refuerzan las señales de autoridad y confianza (E-E-A-T). Las páginas de organismos acreditadores que enlazan al registro de la empresa generan backlinks institucionales de alta calidad.
- **Relevancia para el sector geotécnico:** El CTE exige que los ensayos de laboratorio se realicen en laboratorios acreditados. La clasificación de contratista determina si la empresa puede participar en licitaciones de determinado importe. No mostrar estas credenciales en la web es perder oportunidades de contratación pública y privada.

---

## 13. Sitemap XML Dinámico + Robots.txt Optimizado

- **Prioridad:** Media
- **Descripción:** Generar sitemap XML automático que incluya las páginas de servicio, geo-landing pages, casos de estudio y artículos del blog con prioridad y frecuencia de cambio diferenciadas. Excluir páginas de Thank You, resultados de filtrado y duplicados de parámetros. Configurar robots.txt para permitir el crawl de todas las secciones indexables y bloquear recursos internos. Implementar sitemap de imágenes para las fotografías de obra y maquinaria. Registrar en Google Search Console y monitorizar la cobertura de indexación.
- **Objetivo de negocio/captación:** Asegura que todo el contenido transaccional e informacional sea descubierto e indexado por Google en el menor tiempo posible. Un caso de estudio publicado que no se indexa en 48h es una oportunidad perdida.
- **Impacto en SEO B2B:** Es infraestructura técnica básica de SEO. Sin un sitemap bien configurado, Google puede tardar semanas en descubrir páginas nuevas, especialmente en dominios con poca autoridad inicial. El sitemap de imágenes permite posicionar en Google Images, que es un canal de tráfico relevante para búsquedas de maquinaria y técnicas de sondeo.
- **Relevancia para el sector geotécnico:** La web generará decenas de URLs combinando servicios × zonas × casos de estudio. Sin un sitemap estructurado, el crawl budget se desperdicia en páginas de bajo valor y las páginas transaccionales tardan en posicionar.

---

## 14. Velocidad de Carga y Core Web Vitals Optimizados

- **Prioridad:** Media
- **Descripción:** Alcanzar puntuaciones de Core Web Vitals en verde (LCP < 2.5s, INP < 200ms, CLS < 0.1) en todas las plantillas principales. Implementar: lazy loading en imágenes de casos de estudio, compresión WebP/AVIF para fotografías de campo, critical CSS inline, preload de fuentes, CDN para assets estáticos, y server-side rendering o static generation para las páginas de servicio y geográficas. Monitorizar con Search Console y Lighthouse CI en cada despliegue.
- **Objetivo de negocio/captación:** Un director de obra que busca desde el móvil en la propia obra no espera 5 segundos de carga. Cada segundo de LCP adicional incrementa el bounce rate y reduce las conversiones. En SEM, la velocidad de carga afecta al Quality Score y al CPC.
- **Impacto en SEO B2B:** Core Web Vitals es un factor de ranking confirmado. En un sector donde muchos competidores tienen webs lentas y no optimizadas, cumplir CWV es una ventaja posicional tangible con esfuerzo relativamente bajo.
- **Relevancia para el sector geotécnico:** Las webs del sector están particularmente rezagadas en rendimiento: suelen ser WordPress sin optimizar, con galerías pesadas de fotos de obra. Superarlas en CWV es viable y genera ventaja competitiva inmediata.

---

## 15. Página de Licitaciones y Obra Pública

- **Prioridad:** Baja
- **Descripción:** Página dedicada a la contratación pública que incluya: clasificación de contratista (grupos y subgrupos con importes), experiencia en organismos contratantes (Ministerio de Transportes, Confederaciones Hidrográficas, Autoridades Portuarias, Ayuntamientos), proyectos públicos realizados con enlace a casos de estudio, y formulario específico de contacto para licitaciones con campo para enlace a la plataforma de contratación o referencia del expediente. Incluir mención a la experiencia en UTEs y subcontratación para grandes ingenierías.
- **Objetivo de negocio/captación:** Captura un segmento de alto valor: las ingenierías y constructoras que buscan subcontratistas geotécnicos para licitaciones. El formulario con campo de expediente permite al equipo comercial reaccionar rápido. Este tipo de lead suele tener un valor medio superior al privado.
- **Impacto en SEO B2B:** Posiciona para búsquedas como "empresa geotécnica clasificada contratista", "sondeos para obra pública" o "subcontratista geotécnico licitación". Son términos de bajo volumen pero altísima intención de contratación.
- **Relevancia para el sector geotécnico:** La obra pública representa un porcentaje significativo de la facturación del sector. Las licitaciones tienen plazos de presentación estrictos; una web que facilita la verificación de solvencia y el contacto rápido para UTEs es una ventaja operativa real.

---

## 16. FAQs Técnicas con Schema FAQ

- **Prioridad:** Baja
- **Descripción:** Sección de preguntas frecuentes por servicio y generales, con respuestas concisas pero técnicamente rigurosas. Implementar schema `FAQPage` para cada grupo de preguntas. Preguntas tipo: "¿Es obligatorio el estudio geotécnico?", "¿Cuántos sondeos necesita mi edificio?", "¿Qué diferencia hay entre un sondeo mecánico y un ensayo de penetración?", "¿Cuánto tarda un informe geotécnico?", "¿Qué profundidad de sondeo se necesita para cimentación por pilotes?". Cada respuesta con enlace interno al servicio o artículo de blog relevante.
- **Objetivo de negocio/captación:** Resuelve dudas comunes que retrasan la solicitud de presupuesto. Un arquitecto que duda si necesita 2 o 4 sondeos no pedirá presupuesto hasta resolver esa duda. La FAQ lo retiene en la web, le da la respuesta y le dirige al formulario.
- **Impacto en SEO B2B:** El schema FAQPage permite que las preguntas aparezcan como rich snippets en SERPs, ocupando más espacio visual y aumentando el CTR orgánico. Las preguntas están alineadas con búsquedas de voz y featured snippets, que capturan posición 0.
- **Relevancia para el sector geotécnico:** La geotecnia es opaca para muchos de sus clientes. Los arquitectos no siempre saben qué incluye un estudio geotécnico ni cuánto debería costar. Las FAQs reducen esa asimetría de información y posicionan a la empresa como referente accesible.

---

# Quick Wins: 3 funcionalidades de alto impacto que se pasan por alto en ingeniería

### QW1. Calculadora de Alcance de Estudio Geotécnico (Herramienta interactiva)

Un widget embebido donde el usuario selecciona: tipo de obra, nº de plantas, superficie, y provincia. El resultado muestra una estimación orientativa del alcance del estudio (nº aproximado de sondeos, profundidad estimada, ensayos recomendados según CTE) y un CTA de "Solicitar presupuesto exacto". No da precio: da alcance técnico. Esto convierte visitantes informacionales en leads cualificados al hacer tangible el servicio antes de pedir presupuesto. Genera un motivo para volver a la web y compartirla entre colegas. Desde SEO, es linkable asset y captura búsquedas tipo "cuántos sondeos necesito para mi edificio".

### QW2. Microconversión: Botón "Enviar ubicación de la parcela"

Un CTA alternativo al formulario largo que permite enviar solo la referencia catastral o un pin en Google Maps + email de contacto. Para el usuario es una acción de 15 segundos; para la empresa es un lead con la información mínima para llamar con contexto. Captura al segmento de usuarios que tiene prisa o está en obra con el móvil y no va a completar un formulario multi-paso. Se implementa como formulario lateral flotante con integración de Google Maps embed y campo de texto para referencia catastral.

### QW3. Notificaciones automáticas de estado del lead (post-conversión)

Implementar un email automático que se envía al lead en las primeras 2 horas confirmando la recepción de su solicitud, indicando el nombre del técnico que la revisará y el plazo estimado de respuesta (ej. "Su solicitud ha sido asignada a [nombre], ingeniero geotécnico colegiado. Recibirá una propuesta en un máximo de 48h laborables"). Esto no es solo atención al cliente: reduce las solicitudes duplicadas a competidores. Un lead que recibe confirmación inmediata con nombre del técnico asignado deja de buscar alternativas. Se implementa con cualquier herramienta de email transaccional (SendGrid, Mailgun) vinculada al formulario.

---

# Los 3 Errores Más Comunes al Plantear una Web de Captación en Ingeniería Geotécnica

### Error 1: Construir la web como un catálogo institucional en lugar de como una máquina de captación

Este es el error fundacional y el más frecuente en el sector. La empresa encarga la web al mismo proveedor que le hizo la anterior (o a una agencia generalista), el briefing consiste en "actualizarla y que quede bien", y el resultado es un sitio con cinco secciones estáticas (Inicio, Empresa, Servicios, Proyectos, Contacto) donde "Servicios" es una única página con un listado de bullets y "Contacto" es un formulario genérico con nombre, email, teléfono y mensaje.

El problema de fondo es que nadie se ha sentado a definir qué tiene que hacer la web como producto. No hay un objetivo de conversión medible, no hay CTAs contextuales por servicio, no hay landing pages por tipo de cliente o por zona geográfica, y no hay capa de datos para saber qué funciona. La web existe como tarjeta de visita digital, no como canal de captación. El equipo comercial sigue dependiendo al 100% del boca a boca, de los contactos personales y de las plataformas de licitación pública, y nadie se pregunta por qué la web no genera ni un lead al mes.

La consecuencia en SEO es igualmente grave: una página de "Servicios" con 8 bullets no posiciona para ninguna búsqueda específica porque Google no puede determinar relevancia cuando todo está comprimido en una sola URL. El sitio tiene 6 páginas indexadas, zero topical authority, y es invisible para cualquier búsqueda que no sea la marca exacta de la empresa.

La corrección no es "mejorar la web", es replantearla como producto digital con KPIs de negocio: número de leads generados por mes, coste por lead por canal, tasa de conversión por página de servicio, y valor del pipeline atribuible al tráfico orgánico. Cada decisión de producto (qué páginas crear, qué formularios implementar, qué contenido publicar) debe responder a uno de estos KPIs.

### Error 2: No diferenciar las necesidades de los distintos buyer personas en la arquitectura de información

La web típica del sector trata a todos los visitantes como si fueran el mismo perfil. Pero un arquitecto que necesita un estudio geotécnico para un edificio de 12 viviendas tiene necesidades, objeciones, presupuesto y urgencia completamente diferentes a las de una dirección facultativa de una administración pública que evalúa proveedores para una licitación de obra portuaria.

El arquitecto quiere saber: precio orientativo, plazo de entrega, qué incluye exactamente el informe, y si la empresa trabaja en su zona. Su camino de conversión ideal es: landing de servicio → calculadora de presupuesto orientativo → formulario de solicitud con datos de parcela. Convierte rápido si la información es clara y el precio no es opaco.

La ingeniería civil que prepara un concurso quiere saber: experiencia en obras similares, equipo técnico propuesto, parque de maquinaria disponible, certificaciones y acreditaciones. Su camino de conversión ideal es: portfolio de proyectos filtrado por tipo de obra → fichas de equipo técnico → descarga de ficha de servicio PDF → contacto con responsable de zona.

La administración pública quiere saber: clasificación empresarial, solvencia técnica y económica, experiencia en contratos públicos, y cobertura geográfica. Su camino es: página de empresa con certificaciones → proyectos de obra pública → contacto institucional.

Cuando la web no diferencia estos recorridos, todos los perfiles llegan a la misma página genérica de servicios y al mismo formulario de contacto, y la tasa de conversión se desploma porque ninguno encuentra respuesta específica a sus objeciones. La solución no es crear tres webs, sino diseñar la arquitectura de información para que cada perfil tenga un recorrido natural de 2-3 clics hasta su punto de conversión: CTAs diferentes según la página ("Solicitar presupuesto" en landings de servicio para arquitectos/promotores, "Descargar ficha técnica" en páginas de maquinaria para ingenierías, "Solicitar documentación de solvencia" en la sección institucional para AAPP). El tracking por dimensión de `lead_type` en GA4 permite después medir qué recorrido convierte mejor y optimizar.

### Error 3: Invertir en SEM sin haber construido antes la infraestructura de conversión y medición

Este error es la consecuencia directa de los dos anteriores, y es especialmente doloroso porque implica quemar presupuesto de forma verificable. El patrón es siempre el mismo: la empresa lanza la web institucional, no genera leads orgánicos porque no está construida para eso, y alguien decide "poner Google Ads para que entre tráfico". Se contratan campañas de SEM apuntando a keywords genéricas ("estudios geotécnicos", "sondeos mecánicos") con un coste por clic de entre 3€ y 8€ en España, y todo ese tráfico aterriza en la home o en la página genérica de servicios.

El resultado es predecible: la tasa de conversión está por debajo del 1% porque la landing no está optimizada para la keyword, el formulario es genérico y largo, no hay propuesta de valor visible (ni precio orientativo, ni plazo, ni trust signals), y no hay tracking granular para saber qué keywords o anuncios generan leads de calidad frente a los que generan clics vacíos. La empresa gasta entre 1.000€ y 3.000€ al mes en Ads, genera 2-5 leads de los cuales 1 es cualificado, y concluye que "el marketing digital no funciona para nuestro sector".

La secuencia correcta es inversa. Primero se construye la infraestructura de conversión: landings de servicio con CTA contextual, formulario multi-paso cualificado, landing locales para las zonas prioritarias, y trust signals visibles. Después se implementa la capa de medición: eventos de conversión en GA4, vinculación con Google Ads, atribución por keyword y por landing page, y definición de qué es un lead cualificado vs. uno basura. Solo entonces se activan las campañas SEM, con landings específicas por grupo de anuncios (no la home), keywords de intención transaccional con concordancia de frase o exacta (no amplia), y un presupuesto diario que permita alcanzar significación estadística en los tests A/B de las landings en un plazo razonable (mínimo 200-300 clics por variante).

En paralelo, el SEO orgánico va construyendo tráfico sostenible a través del blog técnico y las landings locales, de modo que a medio plazo (6-12 meses) el coste de adquisición de leads baje porque el tráfico orgánico cubre la base y el SEM se reserva para picos de demanda, keywords de alta competencia o zonas geográficas donde el posicionamiento orgánico aún no está maduro.

---

# Recomendación de Arquitectura Web: Silos de Información para SEO Local + Servicio

## Estructura de URLs recomendada

```
/ (Home)
│
├── /servicios/
│   ├── /servicios/estudios-geotecnicos/
│   ├── /servicios/sondeos-mecanicos/
│   ├── /servicios/ensayos-laboratorio/
│   ├── /servicios/informes-periciales/
│   ├── /servicios/geotecnia-maritima/
│   ├── /servicios/instrumentacion-geotecnica/
│   └── /servicios/hidrogeologia/
│
├── /zonas/
│   ├── /zonas/madrid/
│   ├── /zonas/barcelona/
│   ├── /zonas/valencia/
│   ├── /zonas/sevilla/
│   ├── /zonas/malaga/
│   └── ... (una por provincia operativa)
|
├── /proyectos/
│   ├── /proyectos/edificacion-residencial/
│   ├── /proyectos/obra-civil/
│   ├── /proyectos/infraestructura-portuaria/
│   └── /proyectos/[slug-del-caso]/
│
├── /blog/
│   ├── /blog/normativa/
│   ├── /blog/tecnicas/
│   ├── /blog/geologia/
│   └── /blog/[slug-del-articulo]/
│
├── /equipo/
├── /maquinaria/
├── /acreditaciones/
├── /licitaciones/
├── /recursos/
├── /presupuesto/
└── /contacto/
```

## Estrategia de linking interno entre silos

La clave para posicionar "estudios geotécnicos Madrid" no es crear una sola página con esas dos palabras, sino construir un cluster de contenido interconectado que Google interprete como autoridad temática combinada:

La **página de servicio** `/servicios/estudios-geotecnicos/` enlaza a la **geo-landing** `/zonas/madrid/` en su sección de cobertura geográfica, y viceversa. Ambas enlazan a **casos de estudio** realizados en Madrid que involucren estudios geotécnicos. Los **artículos de blog** sobre normativa CTE de estudios geotécnicos enlazan a la página de servicio. Las fichas del **equipo técnico** que firman estudios en Madrid enlazan tanto a los casos como a la geo-landing.

Esta malla de links internos crea una estructura donde cada página del silo "estudios geotécnicos" y cada página del silo "Madrid" se refuerzan mutuamente sin necesidad de duplicar contenido en una página `/servicios/estudios-geotecnicos-madrid/` para cada combinación (lo que sería inviable de mantener y generaría canibalización).

Sin embargo, **para las 5-8 combinaciones de mayor volumen de búsqueda** (ej. "estudios geotécnicos Madrid", "sondeos Barcelona", "estudio geotécnico Valencia"), sí se recomienda crear una página intermedia que actúe como nodo del cluster, con contenido único que no sea la mera intersección de la página de servicio y la geográfica, sino que aporte contexto específico (ej. geología del área metropolitana de Madrid para cimentación de edificación).

## Principios clave del silo

1. **Cada URL tiene un keyword objetivo primario** y no compite con otra URL del mismo dominio por el mismo término.
2. **Los links internos fluyen dentro del silo** (servicio → casos de ese servicio → blog sobre ese servicio) y **entre silos** solo en puntos de intersección natural (servicio + zona).
3. **Los anchor texts de los links internos son descriptivos y variados**, no sobre-optimizados. Usar "nuestros estudios geotécnicos en la zona centro" en lugar de repetir "estudios geotécnicos Madrid" en cada enlace.
4. **Las páginas de servicio son las páginas pillar** (mayor autoridad interna); las geo-landings, casos y artículos son supporting pages que les transfieren relevancia.
5. **Canonical tags explícitos** en cada URL para evitar canibalización por parámetros de filtrado en proyectos o query strings de campañas.
