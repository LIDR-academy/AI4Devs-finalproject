# PRD: SplitEat (Divisor de Cuentas de Restaurantes)

> Version: 1.1.0 | Date: 2026-06-06 | Author: Product Owner & PRD Generator AI
> Status: Under Review

---

## 1. Vision

### 1.1 Purpose
SplitEat es una aplicación móvil e interactiva web diseñada bajo la filosofía **mobile & offline first** que permite a grupos de comensales dividir el ticket de un restaurante de manera equitativa o ponderada. A través del escaneo del ticket por fotografía o la entrada manual, la aplicación identifica automáticamente los conceptos consumidos y permite asignarlos visualmente a personas o subgrupos familiares. Todo el flujo principal es puramente informativo, local y offline, eliminando la fricción de cobertura en mesa y dejando el registro/login de usuarios como una opción secundaria para acceder a funciones en la nube.

### 1.2 Problem Statement
Cuando grupos numerosos asisten a un restaurante, la división del pago suele convertirse en una tarea caótica:
1. **Comensales (Elena y Carlos)**: Experimentan estrés al realizar cálculos manuales rápidos de cabeza o en calculadoras que no permiten asignar platos compartidos ni agrupar pagos de manera fluida.
2. **Falta de Cobertura en Interiores**: Las aplicaciones que requieren conexión obligatoria o registro de cuentas fallan habitualmente en sótanos, terrazas o zonas con baja señal de red de los locales de restauración.
3. **Falta de correspondencia matemática**: Las soluciones improvisadas (como dividir a partes iguales) penalizan a los que consumen menos, mientras que los cálculos detallados suelen terminar con descuadres de céntimos debido a redondeos complejos y entrantes compartidos.

### 1.3 Value Proposition
Para grupos de amigos y familias que salen a cenar juntos y sufren la lentitud y el desorden al dividir la cuenta, SplitEat es una herramienta de desglose y cálculo inmediato en mesa que simplifica el cobro individual estructurando el dictado al camarero de manera **100% offline y móvil**. A diferencia de Splitwise (pensada para deudas diferidas) y de las calculadoras genéricas, SplitEat ofrece asignación visual, alertas de descuadre y mecánicas de gamificación local sin forzar la creación de cuentas.

---

## 2. Target Users

### 2.1 Personas

| Persona | Role | Daily Context | Key Needs | Primary Pain | Success Metric |
|---------|------|---------------|-----------|--------------|----------------|
| Carlos el Organizador | Amigo organizador del grupo | Sale a cenar con grupos de 6-10 personas. Suele hacerse cargo de pedir la cuenta y dictar/repartir los cobros. | 1. Escanear el ticket rápido y offline.<br>2. Ver qué falta por asignar en tiempo real. | El estrés de calcular la cuenta de todos en sótanos sin cobertura y descuadres. | Reducir el tiempo de división de la cuenta a menos de 90 segundos. |
| Elena la Familiar | Madre de familia en cena grupal | Asiste a cenas de amigos con su pareja e hijos, pagando de manera conjunta por su subgrupo familiar. | 1. Agrupar a su familia como un solo bloque pagador.<br>2. Dividir entrantes compartidos de forma rápida. | Sumar individualmente lo de su pareja e hijos en la mesa. | Poder asignar consumos a la "Familia Gómez" con dos toques. |

### 2.2 Market Segments

| Segment | Type | Description | Estimated Size | Strategic Value |
|---------|------|-------------|----------------|-----------------|
| Consumidores Sociales (B2C) | Primary | Jóvenes y adultos de 18 a 45 años que frecuentan comidas en grupo y usan smartphones. | 15M usuarios en España [TO VALIDATE] | Foco central del producto; impulsan la adopción orgánica del boca a boca. |
| Familias y Parejas (B2C) | Secondary | Grupos familiares que asisten a reuniones y requieren pagos consolidados de subgrupos. | 5M usuarios en España [TO VALIDATE] | Aporta diferenciación competitiva clave frente a calculadoras simples. |

---

## 3. Product Scope

### 3.1 Core Features (Clasificadas por Dependencia de Infraestructura)

#### A. Funciones 100% Locales (Sin Cuenta / Sin Conexión - Core MVP)

| ID | Feature | User Capability | Persona(s) | Priority |
|----|---------|----------------|------------|----------|
| F-01 | Escaneo OCR Inteligente | Como usuario, puedo tomar una foto del ticket para extraer automáticamente productos, cantidades, precios unitarios, IVA, nombre del restaurante y la fecha del evento. | Carlos el Organizador | Must |
| F-02 | Entrada por Voz o Texto Offline | Como usuario, puedo dictar o transcribir a mano un fragmento de texto para añadir productos al ticket si el OCR falla o no hay cámara. | Carlos el Organizador | Should |
| F-03 | Extracción Segura de Metadatos EXIF | Como usuario, puedo extraer localmente en mi dispositivo metadatos de la imagen (geoposicionamiento, tipo de cámara y fecha/hora) para su posterior análisis personal. | Carlos el Organizador | Should |
| F-04 | Asignación Visual e Interactiva | Como usuario, puedo arrastrar y asignar productos a personas o subgrupos familiares creados en el momento. | Carlos / Elena | Must |
| F-05 | División Matemática de Platos y Cuadre | Como usuario, puedo dividir el coste de un plato entre varios comensales, asegurando el sistema que la suma individual de todas las partes cuadre exactamente con el total del ticket. | Elena la Familiar | Must |
| F-06 | Vista "Dictado al Camarero" | Como usuario, puedo ver un desglose optimizado y ordenado por comensal/familia para poder dictarle rápidamente al camarero cuánto cobrar a cada tarjeta/persona. | Carlos / Elena | Must |
| F-07 | Redondeo Visual e Individual | Como usuario, puedo ver de forma desglosada el redondeo individual aplicado por comensal al euro más cercano y el total de redondeo acumulado. | Carlos el Organizador | Must |
| F-08 | Gamificación: "La Ruleta del Pagador" | Como usuario, puedo realizar un sorteo interactivo local (ruleta o juego rápido) en mesa para decidir quién paga un plato específico, la propina o el total del ticket. | Carlos el Organizador | Should |
| F-09 | Alerta de Platos Huérfanos y Descuadres | Como usuario, recibo alertas si hay platos sin asignar o descuadres de céntimos, con opciones rápidas de auto-reparto ("dividir huérfanos entre todos"). | Carlos el Organizador | Must |
| F-10 | Asignador Rápido de Entrantes | Como usuario, puedo seleccionar múltiples platos comunes y dividirlos equitativamente entre todo el grupo con un solo toque. | Elena la Familiar | Should |
| F-11 | Historial Local Temporal y Backups JSON | Como usuario, puedo ver mis últimas 5 sesiones guardadas localmente en el navegador y descargar un archivo `.json` de backup offline. | Carlos el Organizador | Should |

#### B. Funciones Premium / Con Registro (Requieren Infraestructura Nube)

| ID | Feature | User Capability | Persona(s) | Priority |
|----|---------|----------------|------------|----------|
| F-12 | QR de Cobro Bizum y Plantillas Dinámicas | Como usuario registrado, puedo configurar mi número de teléfono y generar códigos QR de pago Bizum con importes exactos y plantillas de mensajes automatizados de cobro para enviar por WhatsApp. | Carlos el Organizador | Should |
| F-13 | Sincronización Cloud de Amigos y Grupos | Como usuario registrado, puedo sincronizar con la nube mi lista de contactos frecuentes y subgrupos familiares guardados, evitando tener que escribirlos al cambiar de móvil. | Elena la Familiar | Should |
| F-14 | Respaldo e Historial Cloud Completo | Como usuario registrado, puedo guardar de manera permanente mis tickets en la nube, visualizar mi mapa de restaurantes visitados y obtener analíticas avanzadas de gasto grupal. | Carlos el Organizador | Should |

### 3.2 Out of Scope

| Exclusion | Reason |
|-----------|--------|
| Pasarelas de Pago Integradas (Stripe, Bizum Directo, etc.) | La aplicación es puramente informativa en esta versión para evitar la complejidad regulatoria de manejo de fondos. |
| Integración nativa con sistemas POS de hostelería | El objetivo es funcionar del lado del cliente final de forma universal sin dependencias del software de los restaurantes. |
| Sincronización multi-dispositivo obligatoria en tiempo real | Se asume que una sola persona del grupo gestiona la cuenta en su dispositivo local durante la comida. |

### 3.3 Assumptions

| ID | Assumption | Risk | Validation Method |
|----|-----------|------|-------------------|
| A-01 | La calidad de la cámara es suficiente para extraer texto con un 85% de acierto vía OCR local o API ligera. | MEDIUM | Pruebas de usabilidad con 15 tipos de tickets diferentes. |
| A-02 | El almacenamiento local del navegador (localStorage/IndexedDB) es suficiente y no se limpia agresivamente por el sistema operativo. | LOW | Proporcionar opción de exportar backups JSON manuales para evitar pérdida accidental de datos. |

---

## 4. Business Requirements

### 4.1 Business Objectives

| ID | Objective | Metric | Target | Timeframe | Linked KPIs |
|----|-----------|--------|--------|-----------|-------------|
| O-01 | Reducir la fricción y el tiempo de pago en mesa de grupos grandes de forma offline. | Tiempo de reparto y cálculo | < 90 segundos | 3 meses tras el lanzamiento | K-01 |
| O-02 | Maximizar la precisión de extracción y asignación evitando la entrada manual. | Tasa de acierto del OCR | > 92% | Al lanzamiento | K-02 |
| O-03 | Lograr que los usuarios más activos se registren voluntariamente para funciones en la nube. | Tasa de conversión de anónimo a registrado | > 10% de los usuarios recurrentes | 6 meses tras el lanzamiento | K-03 |

### 4.2 KPIs & Success Metrics

| ID | KPI | Current Baseline | Target | Measurement Method |
|----|-----|-----------------|--------|-------------------|
| K-01 | Tiempo medio del proceso offline | [TO MEASURE] (estimado en 5 min manual) | < 90 segundos | Telemetría integrada local e informes del usuario. |
| K-02 | Tasa de cuadre matemático exitoso al primer intento | [TO MEASURE] | 98.5% | Logs locales de error de redondeo. |
| K-03 | Conversión a perfil registrado | [TO MEASURE] | > 10% | Registro de usuarios en base de datos cloud frente a sesiones únicas estimadas. |

### 4.3 Business Model
SplitEat se lanza inicialmente como una herramienta 100% gratuita y sin publicidad para los usuarios finales.
- **Registro Opcional**: Incentiva el registro al ofrecer utilidades como QR Bizum con plantillas, sincronización de amigos e historial cloud permanente.
- **Futura explotación analítica privada**: Los datos agregados y anónimos de consumo y ubicación en el histórico de los usuarios registrados se procesarán para generar informes de mercado de gran valor para la hostelería, respetando al 100% el RGPD.

---

## 5. Competitive Context

### 5.1 Competitors

| Competitor | Type | Strengths | Weaknesses | Our Differentiator |
|------------|------|-----------|------------|-------------------|
| Splitwise | Indirect | Muy popular, excelente gestión de balances a largo plazo entre compañeros de piso o viajes. | Obliga a registrar cuentas; tedioso para calcular un solo ticket en el acto. | SplitEat se enfoca en resolver el ticket offline al instante y dictárselo al camarero en mesa sin crear cuentas obligatorias. |
| Calculadora del Teléfono | Direct | Instalada por defecto en el 100% de los dispositivos, rápida y offline. | No tiene OCR, no permite dividir platos fácilmente, no gestiona grupos/familias. | SplitEat automatiza la lectura física y proporciona una interfaz visual offline de asignación. |

### 5.2 Key Differentiators

| Differentiator | Description | Moat Type | Linked Persona Need |
|---------------|-------------|-----------|-------------------- |
| Modo "Dictado al Camarero" | Interfaz optimizada para hablar secuencialmente al camarero durante los cobros individuales con tarjeta. | UX / Workflow | Carlos el Organizador |
| Soporte para Familias / Agrupaciones | Posibilidad de consolidar subgrupos de pago dentro de un ticket de forma intuitiva. | UX | Elena la Familiar |
| Cuadre Offline con Redondeo Visual | Garantía matemática de cuadre al céntimo y desglose visual del redondeo acumulado para la propina de forma offline. | Technology / UX | Carlos el Organizador |

---

## 6. Constraints

### 6.1 Technical Constraints

| Constraint | Details | Impact on Product |
|-----------|---------|-------------------|
| Aplicación Web Autocontenida / Mobile | Debe funcionar de forma óptima en navegadores móviles de iOS y Android. | Obliga a optimizar la interfaz para gestos táctiles. |
| Filosofía Offline-First | Todo el proceso de cálculo, edición y persistencia debe funcionar sin internet. | Requiere que el OCR sea ligero o que haya una excelente estrategia de almacenamiento de caché (PWA/Local Storage). |

### 6.2 Business Constraints

| Constraint | Details | Mitigation |
|-----------|---------|------------|
| Presupuesto de Infraestructura de Inicio | Coste de servidor y base de datos mínimo para usuarios anónimos. | Almacenar toda la información de usuarios anónimos en local (cero coste de base de datos para SplitEat). |

### 6.3 Regulatory Constraints

| Regulation | Requirement | Impact | Compliance Strategy |
|-----------|-------------|--------|---------------------|
| RGPD (Reglamento General de Protección de Datos) | Los datos de geolocalización EXIF y fotos de los tiques contienen información privada. | Requiere procesar datos EXIF de forma local y anónima en el dispositivo del cliente. | El envío a la nube de cualquier dato geolocalizado o historial requiere consentimiento explícito e inicio de sesión. |

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-06-06 | 1.0.0 | Creación inicial del PRD para SplitEat. | Product Owner & PRD Generator AI |
| 2026-06-06 | 1.1.0 | Refactorización para filosofía Mobile & Offline First y Registro Opcional de Usuario (Separando funciones locales y cloud). | Product Owner & PRD Generator AI |
