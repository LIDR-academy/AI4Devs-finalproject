# Especificación de Funcionalidad: Realista MVP

**Rama**: `001-realista-mvp`

**Creado**: 2026-06-04

**Estado**: Borrador

**Descripción**: Asistente financiero con IA para compradores primerizos de vivienda en España. Tres pilares: transparencia de anuncios (Listing Lens), educación hipotecaria (Mortgage Compass) y seguimiento del proceso (Dashboard). PWA mobile-first, sin autenticación, herramienta educativa.

## Aclaraciones

### Sesión 2026-06-04

- P: ¿Frontera de persistencia de datos — localStorage/IndexedDB en cliente vs PostgreSQL en servidor? → R: Full stack desde el día 1 — todos los datos en PostgreSQL vía API, incluyendo progreso del checklist y estado del dashboard.
- P: ¿Proveedor LLM para análisis de anuncios? → R: OpenRouter — única API key, agnóstico de proveedor, cambio de modelo, más barato para desarrollo.
- P: ¿Mecanismo de rate limiting sin autenticación? → R: UUID de sesión generado por el servidor, almacenado en el navegador, enviado con cada petición. Límite por UUID.
- P: ¿Narrativas educativas del Mortgage Compass — generadas por LLM o basadas en plantillas? → R: Plantillas educativas predefinidas asociadas a combinaciones persona × escenario. Predecibles, sin coste de LLM, siempre educativas.
- P: ¿Estrategia de parseo HTML para la URL del anuncio? → R: Cheerio — parseo HTML ligero en servidor. Fallback a subdominio móvil `.m.` para páginas renderizadas con JS. Sin navegador headless.
- P: ¿Cómo se asocia un análisis de listing con un proceso de compra? → R: Auto-attach — cada sesión tiene como máximo una PurchaseProcess activa. Analizar un listing sin proceso crea uno con `propertyPrice` del listing. Analizar con proceso existente lo adjunta al mismo.
- P: ¿Mortgage Compass conoce el listing que se está analizando? → R: Sí — `PurchaseProcess.propertyPrice` se rellena desde el listing analizado y se bloquea con enlace al listing origen. El usuario solo rellena savings/income/debts.
- P: ¿Cómo se estima la ubicación para el cruce catastral? → R: Cadena de responsabilidad con 3 adaptadores: (1) `DeclaredLocationAdapter` parsea la dirección/barrio declarado del HTML, (2) `GeocodingAdapter` usa Nominatim (OSM, gratis) para convertir a coordenadas, (3) `LLMVisionLocationAdapter` (OpenRouter multimodal, fallback) analiza fotos para anuncios sin dirección clara. Solo después de tener coordenadas se hace el cruce con Catastro.

## Historias de Usuario y Pruebas

### Historia 1 - Listing Lens: Analizar un Anuncio Inmobiliario (P1)

El usuario pega una URL de Idealista o similar. El sistema obtiene el contenido del anuncio en el servidor, ejecuta un análisis con IA (LLM) para detectar lenguaje manipulador, información omitida y banderas rojas. Resuelve la ubicación del anuncio mediante una cadena de adaptadores (dirección declarada → geocoding Nominatim → visión multimodal como fallback) y cruza las coordenadas resultantes con datos catastrales para verificar los metros cuadrados declarados frente a los oficiales y el año de construcción. El resultado es una puntuación de transparencia y un informe detallado de lo que el anuncio revela — y lo que oculta.

Si la sesión no tiene un `PurchaseProcess` activo, el sistema crea uno con `propertyPrice` extraído del listing. Si ya existe un proceso activo, el listing se adjunta automáticamente. La respuesta del endpoint incluye un `processSummary` con el `processId` y el estado actual del proceso, permitiendo que el dashboard refleje inmediatamente el nuevo análisis.

**Por qué esta prioridad**: El punto de entrada. Engancha al usuario con valor inmediato. Demuestra ingeniería de IA (diseño de prompts, parsing de salida estructurada, integración con APIs externas). Cada historia es independiente, pero esta proporciona el mayor impacto para quien llega por primera vez.

**Prueba independiente**: Pegar una URL de anuncio conocida → verificar que se devuelve puntuación, banderas rojas, comparativa catastral y `processSummary` con el proceso asociado. Se puede probar completamente con un endpoint de anuncio simulado.

**Criterios de aceptación**:

1. **Dado** una URL de anuncio válida y sin proceso activo, **Cuando** el usuario la envía, **Entonces** se muestra una puntuación de transparencia (0-100), una lista de banderas rojas y un `processSummary` con el nuevo `processId` y `propertyPrice` del listing.
2. **Dado** una URL válida y un proceso activo, **Cuando** el usuario la envía, **Entonces** el listing se adjunta al proceso existente y el `processSummary` refleja la asociación.
3. **Dado** una URL inválida o inaccesible, **Cuando** el usuario la envía, **Entonces** se muestra un mensaje de error con la opción de pegar el texto del anuncio manualmente.
4. **Dado** un anuncio con dirección declarada, **Cuando** se ejecuta el `DeclaredLocationAdapter`, **Entonces** se extrae la dirección del HTML y el `GeocodingAdapter` la convierte a coordenadas. Se omite el análisis de visión.
5. **Dado** un anuncio sin dirección clara, **Cuando** falla el `GeocodingAdapter`, **Entonces** se invoca el `LLMVisionLocationAdapter` con las fotos del anuncio para estimar la ubicación.
6. **Dado** coordenadas GPS válidas, **Cuando** se consulta el Catastro, **Entonces** se muestra una comparativa de m² declarados vs catastrales y año de construcción.
7. **Dado** un anuncio sin certificado energético mencionado, **Cuando** el análisis termina, **Entonces** aparece "sin certificado energético" como bandera roja.
8. **Durante** el análisis, **Cuando** el usuario espera la respuesta, **Entonces** la UI muestra un estado de carga claro (spinner o skeleton) con un tiempo estimado de 5-12 segundos.

---

### Historia 2 - Mortgage Compass: Comprender Costes Reales y Opciones (P1)

El proceso de compra ya tiene un `propertyPrice` pre-rellenado desde el listing analizado (ver FR-015). El usuario solo tiene que completar `savings` (ahorros disponibles), `monthlyIncome` (ingresos netos mensuales), `existingDebts` (deudas existentes) y `region` (comunidad autónoma, para el cálculo correcto del ITP). El sistema calcula los gastos ocultos de compra (ITP/IVA, notaría, registro, gestoría, tasación) y revela el dinero real necesario — normalmente un 10-12% adicional sobre el precio del anuncio. El usuario responde 2-3 preguntas sobre tolerancia al riesgo para construir un perfil. Basándose en el perfil y los números reales, el sistema muestra escenarios de hipoteca a 30 años con distintos ritmos de amortización voluntaria (sin amortización, ligera, moderada, agresiva) y los compara con una alternativa de inversión. Todos los resultados son narrativas educativas, nunca consejo financiero.

Si el usuario navega directamente a Mortgage Compass sin haber analizado un listing, el sistema crea un `PurchaseProcess` con `propertyPrice = 0` y le pide que introduzca el precio manualmente. En ese caso, el perfil no tiene un listing origen asociado y la UX debe indicarlo.

**Por qué esta prioridad**: El diferenciador principal. Ninguna herramienta existente muestra al comprador español la comparativa amortización-vs-inversión junto con los gastos ocultos en una experiencia basada en su perfil personal. Es la funcionalidad que hace memorable el proyecto.

**Prueba independiente**: Analizar primero un listing con un precio conocido, navegar a Mortgage Compass, completar `savings` + `monthlyIncome` + `existingDebts` → verificar que `propertyPrice` viene pre-rellenado con el listing y que se generan el desglose de gastos ocultos, las preguntas de perfil y la tabla comparativa de estrategias.

**Criterios de aceptación**:

1. **Dado** un proceso con `propertyPrice` pre-rellenado del listing, **Cuando** el usuario introduce `savings` 45.000€, `monthlyIncome` 3.500€ y `existingDebts` 0, **Entonces** se desglosan los gastos ocultos (ITP/IVA, notaría, registro, gestoría, tasación) y se muestra el total necesario (~58.200€) con indicador de diferencia respecto a los ahorros.
2. **Dado** un proceso con listing asociado, **Cuando** Mortgage Compass carga, **Entonces** se muestra un enlace al listing origen del `propertyPrice` con opción de sobrescribir.
3. **Dado** el usuario no ha analizado ningún listing y navega directamente a Mortgage Compass, **Cuando** carga la página, **Entonces** se le pide introducir manualmente el `propertyPrice` y se crea un `PurchaseProcess` sin listing origen.
4. **Dado** que el usuario ha completado el perfil financiero, **Cuando** responde a las preguntas de perfil, **Entonces** se sugiere una duración de hipoteca recomendada (30, 25 o 20 años) según su capacidad de pago.
5. **Dada** una hipoteca a 30 años al 3,5% para 160.000€, **Cuando** se carga el simulador de estrategias, **Entonces** se muestran cuatro escenarios: base (sin amortizar), ligero (100€/mes), moderado (300€/mes), agresivo (500€/mes) — cada uno con años acortados e intereses ahorrados.
6. **Dados** todos los escenarios, **Cuando** se muestra la alternativa de inversión, **Entonces** se muestra el valor estimado de la cartera a 30 años (rentabilidad anual 5-7%) junto a los escenarios de amortización.
7. **Dado** un perfil conservador, **Cuando** se genera la narrativa, **Entonces** el mensaje educativo enfatiza el ahorro garantizado mediante amortización.

---

### Historia 3 - Dashboard: Seguimiento del Proceso (P2)

El usuario ve un panel que resume el `PurchaseProcess` activo: el listing más recientemente analizado con su puntuación de transparencia, el perfil financiero (propertyPrice pre-rellenado, savings, monthlyIncome, debts, persona), el desglose de gastos ocultos calculado, el estado del checklist documental, y un acceso rápido a todas las herramientas. El dashboard persiste los datos por sesión anónima (UUID) sin necesidad de registro. El usuario puede re-analizar el listing actual para ver qué ha cambiado (detección de diferencias con snapshot).

Si la sesión no tiene ningún `PurchaseProcess` activo, el dashboard muestra un estado vacío con llamadas a la acción: "Analiza tu primer anuncio" o "Configura tu perfil financiero manualmente".

**Por qué esta prioridad**: Centro de retención y navegación. Une las dos historias P1 en una experiencia coherente. Demuestra persistencia de datos y gestión de estado.

**Prueba independiente**: Analizar un listing (crea proceso), completar el perfil financiero, recargar el dashboard → verificar que todo el estado del proceso persiste, se muestra correctamente, y los cambios del listing son visibles al re-analizar.

**Criterios de aceptación**:

1. **Dado** una sesión con proceso activo y 1 listing analizado, **Cuando** el usuario visita el dashboard, **Entonces** se muestra el listing con su puntuación y fecha, el propertyPrice bloqueado desde el listing, y un resumen del perfil financiero.
2. **Dado** un proceso activo, **Cuando** el usuario visita el dashboard, **Entonces** se muestra una instantánea de capacidad de compra, gastos ocultos totales y progreso del checklist.
3. **Dado** un listing previamente analizado en el mismo proceso, **Cuando** el usuario pulsa "re-analizar", **Entonces** se ejecuta un nuevo análisis, se crea un nuevo `AnalyzedListing`, y el dashboard destaca las diferencias respecto al snapshot anterior (ej: "Precio: -10.000€ desde el último análisis").
4. **Dada** una sesión nueva sin proceso activo, **Cuando** el usuario visita el dashboard, **Entonces** se muestra un estado vacío con dos CTAs: "Analizar un anuncio" y "Configurar perfil manualmente".

---

### Historia 4 - Cronograma Interactivo: Saber Qué Viene Después (P3)

El usuario visualiza una línea temporal de 60-90 días del proceso de compra de vivienda, desde las arras hasta la escritura. Cada hito muestra qué sucede, qué documentos se necesitan y la duración típica.

**Por qué esta prioridad**: Ayuda contextual que reduce la ansiedad. Los compradores españoles a menudo desconocen la secuencia de eventos. Valiosa por sí sola pero enriquece la experiencia global.

**Prueba independiente**: Abrir la página del cronograma → verificar que se muestran todos los hitos con descripciones y duraciones.

**Criterios de aceptación**:

1. **Dada** la página del cronograma, **Cuando** el usuario la abre, **Entonces** se muestra una línea temporal visual con hitos desde las arras hasta la escritura, con duraciones estimadas.
2. **Dado** el cronograma, **Cuando** el usuario pulsa un hito, **Entonces** se muestra información detallada de esa etapa (documentos necesarios, duración típica, consejos).

---

### Historia 5 - Checklist Documental: Que No Se Te Escape Nada (P3)

El usuario hace seguimiento de qué documentos tiene y cuáles le faltan para cada etapa del proceso de compra. Los ítems del checklist se organizan por hito (pre-arras, post-arras, pre-escritura, post-escritura).

**Por qué esta prioridad**: Herramienta práctica para el laberinto burocrático. Simple de implementar pero muy útil para compradores españoles que se enfrentan a un rastro documental complejo.

**Prueba independiente**: Abrir el checklist → marcar/desmarcar ítems → verificar que el progreso persiste al recargar.

**Criterios de aceptación**:

1. **Dada** la página del checklist, **Cuando** el usuario la abre, **Entonces** los ítems se agrupan por etapa con un porcentaje de progreso por etapa.
2. **Dado** un ítem del checklist, **Cuando** el usuario lo marca como completado, **Entonces** el porcentaje de progreso se actualiza y el estado persiste entre sesiones.

---

### Casos Límite

- ¿Qué pasa cuando el LLM devuelve JSON malformado en el análisis? Fallback al scoring numérico de `@avena/score`.
- ¿Qué pasa cuando la API del Catastro no responde? Se muestra un mensaje indicando que la verificación catastral no está disponible; se muestra igualmente el análisis del LLM.
- ¿Qué pasa cuando una URL devuelve 403 o requiere JavaScript? Se intenta el subdominio móvil `.m.`; si falla, se ofrece pegar el texto manualmente.
- ¿Qué pasa cuando el usuario no introduce ahorros en el Mortgage Compass? Se señala claramente la diferencia y se sugiere ajustar el precio de la vivienda.
- ¿Qué pasa cuando se pierde el UUID de sesión del dashboard (borrado de localStorage)? Los datos no son recuperables por diseño — sin autenticación no hay sincronización entre dispositivos.
- ¿Qué pasa cuando se supera el límite de 20 análisis/día? Se muestra un mensaje amigable sugiriendo volver mañana.

## Requisitos

### Requisitos Funcionales

- **FR-001**: El sistema DEBE aceptar una URL de anuncio, obtener el contenido en servidor usando Cheerio para parseo HTML, y devolver un análisis de transparencia en menos de 10 segundos. Fallback a subdominio móvil (`.m.`) para páginas con renderizado JS.
- **FR-002**: El sistema DEBE usar OpenRouter como puerta de enlace LLM para el análisis de anuncios. El modelo principal utiliza un system prompt estructurado para detectar lenguaje manipulador, omisiones y banderas rojas. Fallback a scoring numérico `@avena/score` si el LLM no está disponible.
- **FR-003**: El sistema DEBE cruzar la ubicación estimada del anuncio con datos de la API del Catastro cuando estén disponibles.
- **FR-004**: El sistema DEBE calcular los gastos ocultos de compra (ITP/IVA, notaría, registro, gestoría, tasación) basándose en el precio de la vivienda y la comunidad autónoma.
- **FR-005**: El sistema DEBE presentar escenarios de amortización hipotecaria (base, ligera, moderada, agresiva) para un plazo de 30 años con amortizaciones anticipadas voluntarias.
- **FR-006**: El sistema DEBE mostrar una alternativa de inversión junto a los escenarios de amortización, con estimaciones de rentabilidad a largo plazo.
- **FR-007**: El sistema DEBE persistir todos los datos del usuario (anuncios analizados, perfiles financieros, progreso del checklist) en PostgreSQL vía API del backend, identificados por UUID de sesión anónima sin requerir autenticación.
- **FR-008**: El sistema DEBE permitir el re-análisis de anuncios previamente analizados con detección de diferencias respecto a la instantánea anterior.
- **FR-009**: El sistema DEBE ser instalable como PWA en dispositivos móviles.
- **FR-010**: El sistema DEBE aplicar un límite de 20 análisis por día por UUID de sesión. El UUID es generado por el servidor en la primera visita, almacenado en el navegador y enviado con cada petición a la API.
- **FR-011**: El sistema NO DEBE almacenar contenido de terceros (HTML de anuncios, texto extraído). Solo se persisten los resultados del análisis.
- **FR-012**: El sistema DEBE usar la cabecera User-Agent `Realista/1.0 (analizador educativo)` en todas las peticiones salientes.
- **FR-013**: El sistema NO DEBE proporcionar consejo financiero. Todos los resultados hipotecarios y de inversión son narrativas educativas generadas a partir de plantillas predefinidas asociadas a combinaciones de perfil y escenario. No se usa LLM para la generación de narrativas en el Mortgage Compass.
- **FR-014**: El sistema DEBE mantener como máximo una `PurchaseProcess` activa por sesión. Si el usuario analiza un listing y no hay proceso activo, el sistema DEBE crear uno con `propertyPrice` extraído del listing. Si ya existe un proceso activo, el nuevo listing DEBE adjuntarse al mismo proceso.
- **FR-015**: El sistema DEBE pre-rellenar `propertyPrice` en el perfil financiero desde el listing analizado. Mortgage Compass DEBE mostrar el precio con un enlace al listing origen y permitir al usuario sobrescribirlo si lo desea.
- **FR-016**: El sistema DEBE resolver la ubicación del anuncio mediante una cadena de responsabilidad: primero extrayendo la dirección declarada del HTML (Cheerio), luego geocodificándola con Nominatim (OSM), y solo como fallback usando análisis multimodal de fotos vía LLM (OpenRouter con capacidad de visión). El cruce con Catastro SOLO se ejecuta cuando se han obtenido coordenadas GPS válidas.
- **FR-017**: El sistema DEBE incluir un disclaimer visible en la UI indicando que el análisis de transparencia es generado por IA y debe verificarse con fuentes oficiales antes de tomar decisiones de compra.
- **FR-018**: La UI DEBE mostrar un estado de carga claro durante el análisis del listing (skeleton/spinner con tiempo estimado) ya que el endpoint puede tardar entre 5 y 12 segundos en completarse.

### Entidades Clave

- **User**: Sesión anónima identificada por UUID. Sin email, contraseña ni datos personales. Campo `userId` nullable para futura autenticación.
- **PurchaseProcess**: Representa el proceso de compra de vivienda del usuario. Contiene el perfil financiero como value object JSON.
- **AnalyzedListing**: Resultado de un análisis de Listing Lens. Contiene puntuación, banderas rojas, confianza de ubicación, comparativa catastral, hash de instantánea y timestamp.
- **Checklist**: Checklist documental organizado por etapa burocrática. Contiene ítems con estado de completado.

## Criterios de Éxito

### Resultados Medibles

- **SC-001**: El análisis de una URL de anuncio se completa y muestra resultados en menos de 10 segundos.
- **SC-002**: El Mortgage Compass genera comparativas de estrategia personalizadas basadas en datos financieros reales.
- **SC-003**: El flujo E2E completo (pegar URL → análisis → perfil financiero → estrategia hipotecaria → dashboard) puede completarse en menos de 5 minutos por un usuario nuevo.
- **SC-004**: Las 5 historias de usuario tienen cobertura de pruebas independiente (unitarias + integración + al menos 1 test E2E del flujo principal).
- **SC-005**: La PWA se instala y funciona en iOS Safari y Android Chrome.
- **SC-006**: El pipeline CI/CD pasa (lint → typecheck → tests unitarios → tests de integración → build → E2E) en cada push a main.

## Suposiciones

- Los usuarios tienen conectividad a internet estable para el análisis de anuncios (requiere fetch en servidor).
- Los portales inmobiliarios españoles (Idealista, Fotocasa, etc.) no bloquean agresivamente nuestro User-Agent.
- La API del Catastro (Sede Electrónica del Catastro) es accesible públicamente y devuelve datos estructurados.
- La API de OpenRouter está disponible con una clave válida. El modelo elegido soporta modo de salida JSON estructurada.
- Los usuarios comprenden conceptos financieros básicos españoles (ITP, IVA, Euríbor) o la interfaz proporciona explicaciones contextuales.
- El paquete `@avena/score` está disponible y es compatible con la versión de Node.js elegida.
- Se usa la media del Euríbor como tipo de interés hipotecario por defecto, modificable por el usuario.
- El diseño mobile-first apunta a anchos de pantalla de 375px en adelante.
- Los datos de sesión anónima se persisten en PostgreSQL vía la API del backend. La caché del cliente solo para resiliencia offline.
- No se espera sincronización entre dispositivos en el MVP (sin autenticación).
