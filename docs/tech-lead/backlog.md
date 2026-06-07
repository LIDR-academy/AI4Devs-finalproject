# Product Backlog: SplitEat

Este backlog contiene las historias de usuario y criterios de aceptación del producto. Las tareas técnicas de desarrollo específicas se encuentran detalladas en archivos independientes dentro de la documentación de historias de usuario:

### [Épica 1: Core & Offline](../user-stories/epic-1-core/)
* **TSK-1.1:** [Inicialización del Proyecto y CSS](../user-stories/epic-1-core/TSK-1.1.md)
* **TSK-1.2:** [Inicialización de Dexie.js (IndexedDB) y Repository](../user-stories/epic-1-core/TSK-1.2.md)
* **TSK-1.3:** [Servicio de OCR Offline (Tesseract.js)](../user-stories/epic-1-core/TSK-1.3.md)
* **TSK-1.4:** [Motor de Expresiones Regulares (Regex)](../user-stories/epic-1-core/TSK-1.4.md)
* **TSK-1.5:** [Componente UI de Captura de Ticket (OCR View)](../user-stories/epic-1-core/TSK-1.5.md)
* **TSK-1.6:** [React Hook de Estado Global (useTicketState)](../user-stories/epic-1-core/TSK-1.6.md)
* **TSK-1.7:** [Pantalla de Edición y Corrección Manual](../user-stories/epic-1-core/TSK-1.7.md)
* **TSK-1.8:** [Mesa de Asignación Interactiva (Split Board)](../user-stories/epic-1-core/TSK-1.8.md)

### [Épica 2: Advanced & Gamification](../user-stories/epic-2-advanced/)
* **TSK-2.1:** [Algoritmo de Ajuste de Céntimos (Penny Adjustment)](../user-stories/epic-2-advanced/TSK-2.1.md)
* **TSK-2.2:** [Reparto Rápido de Entrantes](../user-stories/epic-2-advanced/TSK-2.2.md)
* **TSK-2.3:** [Barra de Estado de Cuadre y Alertas](../user-stories/epic-2-advanced/TSK-2.3.md)
* **TSK-2.4:** [Redondeo Individual y Propina Común](../user-stories/epic-2-advanced/TSK-2.4.md)
* **TSK-2.5:** [Componente de Ruleta de Sorteo](../user-stories/epic-2-advanced/TSK-2.5.md)
* **TSK-2.6:** [Vista de Dictado al Camarero](../user-stories/epic-2-advanced/TSK-2.6.md)
* **TSK-2.7:** [Recuperación de Sesión y Borrado local](../user-stories/epic-2-advanced/TSK-2.7.md)

### [Épica 3: Cloud & Sync](../user-stories/epic-3-cloud/)
* **TSK-3.1:** [Configuración del SDK de Firebase y Env](../user-stories/epic-3-cloud/TSK-3.1.md)
* **TSK-3.2:** [Flujo de Autenticación Opcional](../user-stories/epic-3-cloud/TSK-3.2.md)
* **TSK-3.3:** [Sincronización Cloud de Contactos](../user-stories/epic-3-cloud/TSK-3.3.md)
* **TSK-3.4:** [Sync Manager (IndexedDB -> Firestore)](../user-stories/epic-3-cloud/TSK-3.4.md)
* **TSK-3.5:** [Cloud Function de OCR Nube (Vision API)](../user-stories/epic-3-cloud/TSK-3.5.md)
* **TSK-3.6:** [Generador QR Bizum y Plantillas WhatsApp](../user-stories/epic-3-cloud/TSK-3.6.md)
* **TSK-3.7:** [Reglas de Seguridad y Despliegue](../user-stories/epic-3-cloud/TSK-3.7.md)

### [Épica 4: Analytics & Exports](../user-stories/epic-4-analytics/)
* **TSK-4.1:** [Exportación a PDF Corporativo](../user-stories/epic-4-analytics/TSK-4.1.md)
* **TSK-4.2:** [Exportador a Excel (.xlsx)](../user-stories/epic-4-analytics/TSK-4.2.md)
* **TSK-4.3:** [Filtro de Geolocalización EXIF (Privacidad)](../user-stories/epic-4-analytics/TSK-4.3.md)
* **TSK-4.4:** [Vista de Mapa Interactivo de Restaurantes](../user-stories/epic-4-analytics/TSK-4.4.md)
* **TSK-4.5:** [Panel de Analíticas y Gráficos](../user-stories/epic-4-analytics/TSK-4.5.md)

---

## Epic 1: Core Digitalization & Basic Assignment Flow (Offline & No Registration)

### US-01: Intelligent OCR Scanning of Tickets
- **ID**: US-01
- **PRD Reference**: F-01
- **Priority**: Must (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** tomar una foto del ticket físico de restauración
  - **Para** que el sistema extraiga automáticamente de forma local los productos, cantidades, precios unitarios, IVA y total de la cuenta.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Escaneo exitoso de ticket legible
- **Dado que** estoy en la pantalla principal de la aplicación sin conexión
- **Cuando** tomo una foto nítida de un ticket de restaurante
- **Entonces** el sistema procesa la imagen y me muestra la lista estructurada de productos con su cantidad, precio unitario e IVA correspondiente.

##### Scenario 2: Error por imagen ilegible
- **Dado que** he abierto la cámara del dispositivo dentro de la aplicación
- **Cuando** capturo una imagen borrosa o con mala iluminación
- **Entonces** el sistema me muestra una alerta de "Baja confianza en la lectura" y me sugiere reintentar o pasar a la edición manual.

##### Scenario 3: Extracción de metadatos básicos
- **Dado que** he capturado la imagen de un ticket
- **Cuando** se completa el procesamiento OCR
- **Entonces** el sistema debe extraer e identificar correctamente el nombre del restaurante, la fecha y el total general de la cuenta.

#### Definition of Done (DoD):
- Unit tests cover the OCR parsing logic with at least 85% coverage.
- Integration test validates the image selection and uploading flow.
- Accessibility audit passes WCAG 2.1 AA contrast requirements for the processing view.
- Offline behavior verified (proper error message when OCR service is unavailable).

---

### US-02: Manual Editing and OCR Fallback
- **ID**: US-02
- **PRD Reference**: F-01 / F-02
- **Priority**: Must (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** corregir y editar manualmente cualquier línea del ticket digitalizado
  - **Para** asegurar que la lista de conceptos y precios sea 100% correcta antes de realizar el reparto.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Modificación de producto existente
- **Dado que** estoy en la pantalla de revisión de ticket tras el escaneo
- **Cuando** selecciono una línea de producto y modifico el precio o nombre
- **Entonces** el sistema actualiza la línea en tiempo real y recalcula el subtotal local.

##### Scenario 2: Añadir nuevo producto a mano
- **Dado que** estoy revisando el ticket digitalizado
- **Cuando** pulso el botón "Añadir concepto" e introduzco cantidad, nombre y precio
- **Entonces** el producto se suma a la lista y se recalcula el total acumulado.

##### Scenario 3: Eliminar concepto incorrecto
- **Dado que** el OCR ha leído una línea basura del pie del ticket
- **Cuando** pulso el botón de eliminar sobre esa línea
- **Entonces** el concepto desaparece de la lista y se recalculan los totales de forma inmediata.

#### Definition of Done (DoD):
- Unit tests verify all CRUD operations on the local ticket state.
- Form inputs validated against negative numbers and invalid characters.
- Keyboard navigation (Tab, Enter) fully functional for rapid editing.

---

### US-03: Visual Unitary Assignment
- **ID**: US-03
- **PRD Reference**: F-04
- **Priority**: Must (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** arrastrar o asignar productos del ticket a comensales individuales (anónimos)
  - **Para** obtener el desglose básico de lo que ha consumido cada persona de forma rápida.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Crear comensal rápido
- **Dado que** estoy en la pantalla de asignación
- **Cuando** pulso en "Añadir participante" y escribo un nombre/alias
- **Entonces** se crea un avatar/bloque para esa persona en la mesa interactiva.

##### Scenario 2: Asignación simple de plato
- **Dado que** tengo la lista de productos y he creado a "Juan" en la mesa
- **Cuando** selecciono el producto "Hamburguesa" y lo asigno a "Juan"
- **Entonces** el total de "Juan" sube en la cantidad del precio del producto y el producto se marca como asignado.

##### Scenario 3: Desasignación de plato
- **Dado que** le he asignado por error un refresco a "Juan"
- **Cuando** pulso en desvincular el refresco de su avatar
- **Entonces** el refresco vuelve a la lista de "pendientes" y el total de "Juan" disminuye correspondientemente.

#### Definition of Done (DoD):
- Unit tests cover the state manager for item-to-participant mapping.
- CSS transitions and drag-and-drop actions tested for mobile web touch events.
- ARIA live regions announce assignments for screen readers.

---

## Epic 2: Advanced Reparto, Rounding & Gamification Flow (Offline & No Registration)

### US-04: Split Shared Items with Exact Math Alignment
- **ID**: US-04
- **PRD Reference**: F-05
- **Priority**: Must (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Elena la Familiar
  - **Quiero** dividir el coste de un plato común (entrante) entre varios comensales
  - **Para** prorratear su coste equitativamente asegurando que la suma de las partes cuadre al céntimo con el total.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Dividir plato entre dos personas
- **Dado que** el ticket contiene un plato "Nachos" de 10.00€
- **Cuando** selecciono el plato y elijo dividirlo entre "Juan" y "Elena"
- **Entonces** a cada uno se le asigna 5.00€ del plato y el total general de la cuenta sigue cuadrando de forma exacta.

##### Scenario 2: División asimétrica con céntimos flotantes
- **Dado que** un plato "Ración Bravas" cuesta 9.99€ y se divide entre 3 personas
- **Cuando** confirmo la división equitativa
- **Entonces** el sistema calcula 3.33€ para cada uno y asegura que no queden decimales huérfanos que descuadren el total del ticket original.

##### Scenario 3: Modificar participantes de un plato compartido
- **Dado que** "Nachos" estaba dividido entre "Juan" y "Elena"
- **Cuando** añado a "Carlos" a la división del mismo plato
- **Entonces** el sistema recalculó el desglose (3.33€ cada uno) y actualiza sus totales.

#### Definition of Done (DoD):
- Arithmetic validation function covered with extensive unit tests addressing edge cases of rounding fractions.
- UI displays fraction markers (e.g., "1/3") next to shared items.
- Integration tests confirm ticket total strictly equals sum of all participants' shares.

---

### US-05: Fast Assignment of Common Items
- **ID**: US-05
- **PRD Reference**: F-10
- **Priority**: Should (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Elena la Familiar
  - **Quiero** seleccionar múltiples productos comunes (bebidas de mesa, pan) y dividirlos entre todos
  - **Para** evitar la asignación manual repetitiva de cada item individual.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Selección múltiple y reparto general
- **Dado que** hay 4 refrescos y 2 raciones de pan sin asignar
- **Cuando** los selecciono en grupo y pulso "Dividir entre todos"
- **Entonces** el coste combinado se divide equitativamente entre todos los comensales creados en la mesa.

##### Scenario 2: Deshacer reparto rápido
- **Dado que** he repartido de forma rápida las bebidas entre todos
- **Cuando** pulso el botón "Deshacer" en la barra de acciones rápidas
- **Entonces** los productos vuelven al estado de "sin asignar" original de forma instantánea.

##### Scenario 3: Asignar a un subgrupo familiar
- **Dado que** he creado el subgrupo "Familia Gómez" con 3 miembros
- **Cuando** selecciono múltiples postres y elijo "Asignar a subgrupo"
- **Entonces** el coste de esos postres se asigna en bloque a la Familia Gómez.

#### Definition of Done (DoD):
- Multi-select gesture/checkboxes verified on mobile touch devices.
- State history (Undo/Redo stack) implemented and tested.

---

### US-06: Unassigned Items and Balance Discrepancy Alerts
- **ID**: US-06
- **PRD Reference**: F-09
- **Priority**: Must (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** recibir una alerta visual inmediata si quedan productos sin comensal o si hay descuadres de decimales
  - **Para** solucionarlo rápidamente antes de dictar la cuenta al camarero.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Alerta de platos huérfanos activos
- **Dado que** estoy en la pantalla de revisión de balances finales
- **Cuando** quedan 2 cervezas del ticket original sin asignar a nadie
- **Entonces** el sistema me muestra un banner de advertencia destacando "Quedan 2 platos sin asignar" y bloquea temporalmente el paso final.

##### Scenario 2: Auto-reparto de céntimos sobrantes
- **Dado que** hay una diferencia de 0.02€ por redondeo matemático de platos compartidos
- **Cuando** pulso sobre el botón "Ajustar céntimos automáticamente" de la alerta
- **Entonces** el sistema añade esos céntimos al comensal con mayor consumo o los prorratea para cuadrar la cuenta.

##### Scenario 3: Cuenta completamente cuadrada
- **Dado que** todos los ítems han sido asignados y los importes suman exactamente el total del ticket
- **Cuando** accedo a la pantalla de resumen
- **Entonces** el sistema me muestra un indicador verde de "Cuenta Cuadrada Exitosamente".

#### Definition of Done (DoD):
- Error and warning notification system implemented with clear, high-contrast banner styles.
- State checks run on every assignment change (validation helper).
- Screen readers read the status update when the warning banner appears.

---

### US-07: Visual Rounding and Tips
- **ID**: US-07
- **PRD Reference**: F-07
- **Priority**: Must (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** aplicar propina o redondear individualmente el total de cada comensal al euro más cercano
  - **Para** facilitar el pago en efectivo/tarjeta y ver cuánto propina acumulada dejamos.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Redondear al euro más cercano
- **Dado que** el total individual de "Juan" es de 14.30€
- **Cuando** activo la opción de "Redondear cuenta al euro más cercano"
- **Entonces** el total a pagar de "Juan" sube a 15.00€ y se indica que 0.70€ se destinan a la propina.

##### Scenario 2: Visualización del total acumulado de redondeo
- **Dado que** 4 comensales han aplicado el redondeo al alza
- **Cuando** visualizo el resumen de pago de la mesa
- **Entonces** la app me muestra claramente: "Total ticket: 50.00€ | Total redondeos (Propina): 3.20€ | Total a cobrar: 53.20€".

##### Scenario 3: Desactivar redondeo individual
- **Dado que** "Elena" no desea redondear su cuenta de 12.10€
- **Cuando** desmarca la casilla de redondeo individual en su perfil de la mesa
- **Entonces** su importe vuelve a ser 12.10€ y se descuenta su parte del redondeo acumulado.

#### Definition of Done (DoD):
- Unit tests verify the rounding mathematics and aggregate calculations.
- UI elements (toggle switches, checkboxes) are accessible with clear focus indicators.

---

### US-08: Gamification: "La Ruleta del Pagador"
- **ID**: US-08
- **PRD Reference**: F-08
- **Priority**: Should (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** realizar un sorteo rápido y visual entre los participantes creados
  - **Para** decidir al azar quién paga un plato común "huérfano", la propina total o el ticket completo.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Iniciar ruleta para pagar el ticket completo
- **Dado que** estamos 5 comensales en la mesa interactiva
- **Cuando** selecciono "Sorteo del Pagador" y elijo la opción "Paga la cuenta entera"
- **Entonces** la app muestra una ruleta visual animada con los nombres de todos los participantes.

##### Scenario 2: Selección del ganador del sorteo
- **Dado que** la animación de la ruleta ha terminado de girar localmente
- **Cuando** se detiene en el nombre de "Juan"
- **Entonces** la app muestra a "Juan" destacado como el pagador y ofrece asignar el total de la cuenta a su balance con un clic.

##### Scenario 3: Sorteo de plato específico
- **Dado que** la ración de tarta de chocolate de 6.00€ no tiene dueño
- **Cuando** selecciono el plato y pulso "Sorteo del plato"
- **Entonces** la ruleta gira entre los comensales elegibles y asigna el coste al que resulte seleccionado por azar.

#### Definition of Done (DoD):
- UI component is fully self-contained (working offline via Canvas/CSS transitions).
- Sound effects or vibration feedbacks (Haptics) integrated for mobile devices.
- Escape hatch button allows canceling the raffle at any time without losing ticket state.

---

### US-09: Waiter Dictation Screen and Local Session History
- **ID**: US-09
- **PRD Reference**: F-06 / F-11
- **Priority**: Must (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** ver el desglose agrupado por comensal/familia listo para dictar al camarero y guardar las sesiones de forma local
  - **Para** pagar rápidamente de forma secuencial y recuperar la cuenta si se cierra la pestaña por accidente.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Interfaz de dictado al camarero
- **Dado que** he terminado la división de la cuenta
- **Cuando** pulso en "Vista Camarero"
- **Entonces** la pantalla muestra una lista vertical limpia y con texto grande: "Cobrar a Juan: 15.00€ | Cobrar a Elena: 20.30€" con botones de check para marcarlos como pagados.

##### Scenario 2: Recuperación de sesión tras cierre
- **Dado que** he cerrado el navegador en mitad de una división de ticket
- **Cuando** vuelvo a abrir la aplicación móvil
- **Entonces** se me muestra un mensaje emergente local indicando "Tienes una cuenta sin terminar del Restaurante X. ¿Deseas reabrirla?".

##### Scenario 3: Borrado de datos locales
- **Dado que** quiero limpiar mi móvil de registros antiguos
- **Cuando** accedo a configuración y pulso "Borrar historial local"
- **Entonces** todas las sesiones temporales y participantes se eliminan de IndexedDB/localStorage.

#### Definition of Done (DoD):
- CSS styled for high contrast and outdoor visibility (outdoor dictation check).
- State persistence verified across browser restarts and tab closures.
- Clear data trigger complies with local GDPR cleanup guidelines.

---

## Epic 3: Cloud Convenience & Connectivity Flow (Online & Optional Registration)

### US-10: Personalized Bizum QR & Dynamic Messaging Templates
- **ID**: US-10
- **PRD Reference**: F-12
- **Priority**: Should (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Carlos el Organizador (registrado)
  - **Quiero** configurar mi número de teléfono y generar códigos QR de pago Bizum y mensajes dinámicos de WhatsApp
  - **Para** cobrar de forma ágil y remota a mis amigos el importe exacto.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Configurar teléfono de cobro
- **Dado que** he iniciado sesión en mi cuenta y estoy en "Mi Perfil"
- **Cuando** introduzco y verifico mi número de teléfono
- **Entonces** queda guardado como mi método de cobro por Bizum por defecto.

##### Scenario 2: Compartir desglose por WhatsApp
- **Dado que** he terminado el desglose de la cena y estoy registrado
- **Cuando** pulso "Compartir parte de Juan"
- **Entonces** la app abre WhatsApp con un mensaje pre-redactado: *"Hola Juan, tu parte de la cena en Restaurante X es de 15.30€. Puedes hacerme Bizum en el link: https://spliteat.app/b/..."*.

##### Scenario 3: QR de pago en mesa
- **Dado que** "Juan" quiere pagarme en el acto pero no tengo cobertura móvil
- **Cuando** abro el detalle de su cuenta registrada en mi pantalla
- **Entonces** la app muestra un código QR dinámico de Bizum que "Juan" puede escanear con su móvil para rellenar los datos de pago al instante.

#### Definition of Done (DoD):
- Integration tests mock the backend SMS/auth and Bizum deep link formatting.
- QR generator is cross-platform compliant (tested on iOS/Android default cameras).
- User data (phone number) is encrypted in the database.

---

### US-11: Cloud Sync of Friends and Frequent Groups
- **ID**: US-11
- **PRD Reference**: F-13
- **Priority**: Should (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Elena la Familiar (registrada)
  - **Quiero** guardar mi lista de amigos frecuentes y subgrupos familiares en la nube
  - **Para** no tener que volver a escribir sus nombres al cambiar de móvil o iniciar sesión.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Guardar subgrupo en la nube
- **Dado que** he creado a "Elena", "Pedro" y "Sofía" como el subgrupo "Familia Gómez" localmente
- **Cuando** pulso en "Guardar grupo en mi cuenta"
- **Entonces** el subgrupo se sincroniza con el servidor cloud y se añade a mi libreta de grupos frecuentes.

##### Scenario 2: Cargar grupo frecuente en ticket nuevo
- **Dado que** he iniciado un escaneo de un nuevo ticket
- **Cuando** pulso "Cargar participantes" y elijo "Familia Gómez"
- **Entonces** los avatares correspondientes se añaden automáticamente a la mesa interactiva.

##### Scenario 3: Modificar lista de amigos cloud
- **Dado que** he iniciado sesión
- **Cuando** accedo a mi libreta de direcciones y elimino un contacto guardado
- **Entonces** el cambio se propaga a la nube y deja de aparecer en las sugerencias de la app.

#### Definition of Done (DoD):
- API endpoints for contact CRUD operations fully tested.
- Sync logic handles conflict resolution (local changes vs cloud state).

---

### US-12: Cloud Ticket Backup and Event History
- **ID**: US-12
- **PRD Reference**: F-14
- **Priority**: Should (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Carlos el Organizador (registrado)
  - **Quiero** sincronizar y almacenar permanentemente mis tickets y eventos en la nube
  - **Para** tener un respaldo seguro y evitar pérdidas de datos al limpiar la caché del navegador.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Respaldo automático al finalizar división
- **Dado que** he iniciado sesión y completado el reparto de un ticket
- **Cuando** pulso "Guardar y finalizar"
- **Entonces** el ticket, las asignaciones y metadatos se guardan en la base de datos de la nube.

##### Scenario 2: Consultar histórico cloud
- **Dado que** estoy en mi cuenta de SplitEat en un nuevo dispositivo
- **Cuando** accedo a la pestaña "Historial de Cenas"
- **Entonces** el sistema me lista de forma cronológica todas mis cuentas calculadas en el pasado.

##### Scenario 3: Eliminar ticket respaldado
- **Dado que** deseo borrar un ticket del historial cloud por privacidad
- **Cuando** selecciono el ticket y pulso "Eliminar permanentemente"
- **Entonces** el registro se borra del servidor de base de datos de forma irreversible.

#### Definition of Done (DoD):
- Database schema optimized for ticket records and query latency.
- API tests cover authorization rules (users can only access their own history).

---

## Epic 4: Analytics and Paid Features (Future Monetization)

### US-13: Advanced Financial Export (Excel/PDF)
- **ID**: US-13
- **PRD Reference**: F-11 / F-14 (Premium)
- **Priority**: Could (MoSCoW)
- **Complexity**: 3 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** descargar reportes detallados del desglose en PDF o Excel
  - **Para** presentarlo como justificante de gastos de empresa de forma corporativa.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Exportar a PDF detallado
- **Dado que** he terminado la división de un almuerzo corporativo
- **Cuando** pulso en "Exportar Reporte PDF"
- **Entonces** el sistema genera y descarga un PDF estructurado con la imagen del ticket, desglose por comensal, desglose de IVA y fecha del evento.

##### Scenario 2: Exportar histórico mensual a Excel
- **Dado que** tengo una suscripción premium activa
- **Cuando** elijo un rango de fechas en mi historial y pulso "Exportar a Excel"
- **Entonces** se descarga un archivo `.xlsx` con todas las transacciones, restaurantes y propinas repartidas.

#### Definition of Done (DoD):
- PDF and Excel export libraries integrated with proper memory management.
- PDF design matches official brand styling guidelines.

---

### US-14: Restaurant Map and Consumption Analytics (EXIF Geo-location)
- **ID**: US-14
- **PRD Reference**: F-03 / F-14 (Premium)
- **Priority**: Could (MoSCoW)
- **Complexity**: 5 Story Points
- **User Story**:
  - **Como** Carlos el Organizador
  - **Quiero** ver mis estadísticas agregadas de consumo y un mapa interactivo con los restaurantes visitados
  - **Para** explorar mis hábitos de ocio grupales a partir de la geolocalización de las fotos de los tickets.

#### Acceptance Criteria (Gherkin):
##### Scenario 1: Mapa interactivo de visitas
- **Dado que** he subido tickets de 10 restaurantes diferentes con metadatos de geolocalización EXIF
- **Cuando** abro el "Mapa de SplitEat"
- **Entonces** se muestran marcadores interactivos en las coordenadas correspondientes donde se capturaron las fotos.

##### Scenario 2: Estadísticas de gasto por tipo de comida
- **Dado que** tengo tickets acumulados en mi historial
- **Cuando** accedo a la sección "Mis Analíticas"
- **Entonces** el sistema me muestra gráficos interactivos (gasto promedio por persona, marcas de refrescos más consumidas, ticket medio por zona).

#### Definition of Done (DoD):
- Map integration tested for responsive rendering and marker clustering.
- EXIF metadata parser tested against various smartphone camera models (strips personal metadata before uploading).
