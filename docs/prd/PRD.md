# PRD: SplitEat (Divisor de Cuentas de Restaurantes)

> Version: 1.0.0 | Date: 2026-06-06 | Author: Product Owner & PRD Generator AI
> Status: Under Review

---

## 1. Vision

### 1.1 Purpose
SplitEat es una aplicación móvil e interactiva web que permite a grupos de personas dividir de forma equitativa o ponderada el ticket de un restaurante. A través del escaneo del ticket por fotografía o la entrada manual por texto/voz, la aplicación identifica automáticamente los conceptos consumidos y permite asignarlos de forma visual a personas individuales o grupos familiares, resolviendo de manera puramente informativa el cálculo de lo que cada persona debe pagar al camarero.

### 1.2 Problem Statement
Cuando grupos numerosos asisten a un restaurante, la división del pago suele convertirse en una tarea caótica:
1. **Comensales (Persona Elena y Carlos)**: Experimentan estrés al realizar cálculos manuales rápidos de cabeza o en calculadoras genéricas que no permiten asignar platos compartidos ni agrupar pagos en familia de manera fluida.
2. **Camareros y Restaurantes**: Experimentan demoras importantes y colas en el terminal de cobro al tener que cobrar cantidades individuales confusas o desglosar manualmente una sola mesa.
3. **Falta de correspondencia matemática**: Las soluciones improvisadas (como dividir el total a partes iguales) castigan a los que han consumido menos, mientras que los cálculos individuales detallados suelen terminar con descuadres respecto al total del ticket debido a céntimos y platos compartidos.

### 1.3 Value Proposition
Para grupos de amigos y familias que salen a cenar juntos y sufren la lentitud y el desorden al dividir la cuenta, SplitEat es una aplicación de desglose y cálculo inmediato en mesa que simplifica el cobro individual estructurando de forma visual y guiada el dictado de importes para el camarero. A diferencia de Splitwise (pensada para deudas diferidas a largo plazo) y de las calculadoras de móvil, SplitEat calcula instantáneamente el reparto en tiempo real con redondeos visuales y validación de cuadre total en mesa.

---

## 2. Target Users

### 2.1 Personas

| Persona | Role | Daily Context | Key Needs | Primary Pain | Success Metric |
|---------|------|---------------|-----------|--------------|----------------|
| Carlos el Organizador | Amigo organizador del grupo | Sale a cenar con grupos de 6-10 personas los fines de semana. Suele hacerse cargo de pedir la cuenta y coordinar el pago. | 1. Escanear rápidamente el ticket sin introducir platos a mano.<br>2. Ver qué falta por asignar en tiempo real. | El estrés de calcular la cuenta de todos y que le cuadre el dinero. | Reducir el tiempo de división de la cuenta a menos de 90 segundos. |
| Elena la Familiar | Madre de familia en cena grupal | Asiste a cenas de amigos con su pareja y dos hijos, pagando de manera conjunta por su subgrupo familiar. | 1. Agrupar a su familia como un solo bloque pagador dentro de la cuenta general.<br>2. Dividir entrantes compartidos con otros comensales. | Tener que sumar individualmente lo de su pareja e hijos y luego hacer cálculos aparte. | Poder asignar consumos a la "Familia Gómez" con dos clics. |

### 2.2 Market Segments

| Segment | Type | Description | Estimated Size | Strategic Value |
|---------|------|-------------|----------------|-----------------|
| Consumidores Sociales (B2C) | Primary | Jóvenes y adultos de entre 18 y 45 años que frecuentan comidas en grupo y usan el smartphone activamente. | 15M usuarios en España [TO VALIDATE] | Foco central del producto; impulsan la adopción orgánica del boca a boca. |
| Familias y Parejas (B2C) | Secondary | Grupos familiares que asisten a reuniones con más amigos o familiares y requieren pagos consolidados de subgrupos. | 5M usuarios en España [TO VALIDATE] | Aporta diferenciación competitiva clave frente a calculadoras simples. |

---

## 3. Product Scope

### 3.1 Core Features

| ID | Feature | User Capability | Persona(s) | Priority |
|----|---------|----------------|------------|----------|
| F-01 | Escaneo OCR Inteligente | Como usuario, puedo tomar una foto del ticket para extraer automáticamente los nombres de productos, unidades, precios unitarios, IVA aplicado, nombre del restaurante y la fecha del evento. | Carlos el Organizador | Must |
| F-02 | Entrada por Voz o Texto | Como usuario, puedo dictar o transcribir un fragmento de texto para añadir productos al ticket digitalizado si la cámara no está disponible. | Carlos el Organizador | Should |
| F-03 | Extracción Segura de Metadatos de la Imagen | Como usuario, puedo enriquecer el contexto del ticket mediante la extracción local en mi dispositivo de metadatos EXIF de la imagen (geoposicionamiento, tipo de cámara y fecha/hora) para su posterior análisis personal. | Carlos el Organizador | Should |
| F-04 | Asignación Visual e Interactiva | Como usuario, puedo arrastrar y asignar productos a diferentes personas o subgrupos familiares creados en el momento. | Carlos / Elena | Must |
| F-05 | División Matemática de Platos y Cuadre de Cuenta | Como usuario, puedo dividir el coste de un plato entre varios comensales, asegurando el sistema que la suma individual de todas las partes cuadre exactamente con el total del ticket. | Elena la Familiar | Must |
| F-06 | Vista "Dictado al Camarero" | Como usuario, puedo ver un desglose optimizado y ordenado por comensal/familia para poder dictarle rápidamente al camarero cuánto cobrar a cada tarjeta/persona. | Carlos / Elena | Must |
| F-07 | Redondeo Visual e Individual | Como usuario, puedo ver de forma desglosada el redondeo individual aplicado por comensal al euro más cercano y el total de redondeo acumulado. | Carlos el Organizador | Must |
| F-08 | Gamificación: "La Ruleta del Pagador" | Como usuario, puedo realizar un sorteo interactivo (ruleta o juego rápido) en mesa para decidir a quién le toca pagar un plato específico, la propina/redondeo acumulado, o el total del ticket completo. | Carlos el Organizador | Should |
| F-09 | Alerta de Platos Huérfanos y Descuadres | Como usuario, recibo alertas visuales inmediatas si hay platos sin asignar o descuadres de céntimos, con opciones rápidas de auto-reparto ("dividir huérfanos entre todos"). | Carlos el Organizador | Must |
| F-10 | Asignador Rápido de Entrantes Compartidos | Como usuario, puedo seleccionar múltiples platos comunes y dividirlos equitativamente entre todo el grupo con un solo toque. | Elena la Familiar | Should |

### 3.2 Out of Scope

| Exclusion | Reason |
|-----------|--------|
| Pasarelas de Pago Integradas (Stripe, Bizum, etc.) | La aplicación es puramente informativa en esta versión para evitar la complejidad regulatoria de manejo de fondos. |
| Integración nativa con sistemas POS de hostelería | El objetivo es funcionar del lado del cliente final de forma universal sin dependencias del software de los restaurantes. |
| Sincronización multi-dispositivo en tiempo real | Se asume que una sola persona del grupo escanea y gestiona la cuenta en su dispositivo durante la comida (se evalúa para V2). |

### 3.3 Assumptions

| ID | Assumption | Risk | Validation Method |
|----|-----------|------|-------------------|
| A-01 | La calidad de la cámara de los smartphones es suficiente para extraer texto con un 85% de acierto vía OCR local/nube. | MEDIUM | Pruebas de usabilidad con 15 tipos de tickets diferentes y cámaras de gama baja. |
| A-02 | Los usuarios están dispuestos a dar permisos de geolocalización y cámara para fines de registro de historial analítico y escaneo. | LOW | Implementar solicitud contextual de permisos explicando el valor aportado. |

---

## 4. Business Requirements

### 4.1 Business Objectives

| ID | Objective | Metric | Target | Timeframe | Linked KPIs |
|----|-----------|--------|--------|-----------|-------------|
| O-01 | Reducir la fricción y el tiempo de pago en mesa de grupos grandes. | Tiempo de reparto y cálculo | < 90 segundos | 3 meses tras el lanzamiento | K-01 |
| O-02 | Maximizar la precisión de extracción y asignación evitando la entrada manual. | Tasa de acierto del OCR | > 92% | Al lanzamiento | K-02 |
| O-03 | Generar retención y adopción recurrente del producto. | Tasa de usuarios recurrentes mensuales (MAU) | > 25% de retención | 6 meses tras el lanzamiento | K-03 |

### 4.2 KPIs & Success Metrics

| ID | KPI | Current Baseline | Target | Measurement Method |
|----|-----|-----------------|--------|-------------------|
| K-01 | Tiempo medio del proceso (desde foto hasta desglose) | [TO MEASURE] (estimado en 5 min manual) | < 90 segundos | Telemetría integrada y pruebas controladas. |
| K-02 | Tasa de cuadre matemático exitoso al primer intento | [TO MEASURE] | 98.5% | Logs de error locales (descuadre detectado). |
| K-03 | Retención a 30 días (D30 Retention) | [TO MEASURE] | > 15% | Analíticas internas agregadas. |

### 4.3 Business Model
SplitEat se lanza inicialmente como una herramienta 100% gratuita y sin publicidad para los usuarios finales para acelerar la adquisición.
- **Futura explotación analítica privada**: Los datos de geolocalización, tiques promedio y marcas de establecimientos se procesarán internamente de forma agregada para generar informes de mercado de gran valor para la industria de la hostelería (comportamiento de consumo de grupos, ticket medio por zona). Esta información se mantendrá de manera anónima y privada conforme al RGPD.

---

## 5. Competitive Context

### 5.1 Competitors

| Competitor | Type | Strengths | Weaknesses | Our Differentiator |
|------------|------|-----------|------------|-------------------|
| Splitwise | Indirect | Muy popular, excelente gestión de balances a largo plazo entre compañeros de piso o viajes. | Tedioso para calcular un solo ticket en el acto; requiere que todos los usuarios tengan cuenta. | SplitEat se enfoca en resolver el ticket al instante y dictárselo al camarero en mesa sin crear cuentas obligatorias. |
| Calculadora del Teléfono | Direct | Instalada por defecto en el 100% de los dispositivos, rápida de abrir. | No tiene OCR, no permite dividir platos fácilmente, no gestiona grupos/familias. | SplitEat automatiza la lectura física y proporciona una interfaz visual e interactiva de asignación. |

### 5.2 Key Differentiators

| Differentiator | Description | Moat Type | Linked Persona Need |
|---------------|-------------|-----------|-------------------- |
| Modo "Dictado al Camarero" | Interfaz optimizada para hablar secuencialmente al camarero durante los cobros individuales con tarjeta. | UX / Workflow | Carlos el Organizador (Reducción de estrés) |
| Soporte para Familias / Agrupaciones | Posibilidad de consolidar subgrupos de pago dentro de un ticket común de forma intuitiva. | UX | Elena la Familiar (Cuentas agrupadas) |
| Cuadre Matemático con Redondeo Visual | Garantía de que la suma de partes cuadra al céntimo con el total y desglose visual del redondeo acumulado. | Technology / UX | Carlos el Organizador (Evitar descuadres) |

---

## 6. Constraints

### 6.1 Technical Constraints

| Constraint | Details | Impact on Product |
|-----------|---------|-------------------|
| Aplicación Web Autocontenida / Mobile | Debe funcionar en navegadores móviles modernos de iOS y Android. | Obliga a optimizar la interfaz para tamaños de pantalla móviles con gestos táctiles. |
| Procesamiento de Imagen / OCR | Dependencia de un motor OCR/LLM eficiente con baja latencia. | Requiere un procesamiento asíncrono optimizado con feedback visual de carga. |

### 6.2 Business Constraints

| Constraint | Details | Mitigation |
|-----------|---------|------------|
| Presupuesto Inicial | Desarrollo con recursos y tiempo acotados (Proyecto Académico AI4Devs). | Enfocarse en el Core (Must) y reutilizar librerías de interfaz fluidas. |

### 6.3 Regulatory Constraints

| Regulation | Requirement | Impact | Compliance Strategy |
|-----------|-------------|--------|---------------------|
| RGPD (Reglamento General de Protección de Datos) | Los datos de geolocalización EXIF y fotos de los tiques contienen información de hábitos de consumo y localización. | Requiere procesar datos EXIF de forma puramente local en el dispositivo del cliente. | No almacenar datos identificables en servidores; anonimizar y agregar analíticas. |

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-06-06 | 1.0.0 | Creación inicial del PRD para SplitEat. | Product Owner & PRD Generator AI |
