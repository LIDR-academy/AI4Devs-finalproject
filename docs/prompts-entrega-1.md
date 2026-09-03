> Esta sección detalla los prompts principales utilizados durante la creación del proyecto y justifica el uso de asistentes de código en las distintas fases del ciclo de vida del desarrollo. Se recomienda incluir un máximo de tres por sección, principalmente los utilizados para la creación inicial o para la corrección y ampliación de funcionalidades relevantes.

También puede añadirse la conversación completa como enlace o archivo adjunto, si se considera oportuno.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Solicitudes de cambio](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1: Definición de las capacidades críticas del sistema**

*Contexto: Fase inicial - Definición del MVP*

"A partir de tus conocimientos sobre digitalización de SMB, generación de contenido asistida por IA y tendencias actuales de diseño de producto, describe las capacidades críticas que debe tener AI Business Presence Builder. Explica cómo el descubrimiento guiado del negocio, la normalización del perfil y la generación de activos mediante IA pueden crear diferenciación. Describe cómo cada capacidad reduce la fricción para el usuario."

*Resultado:* Identificación de ocho capacidades críticas, entre ellas: flujo guiado, validación inteligente, normalización de perfiles, generación de personas, narrativa de marca mediante IA, generación multiformato, recomendaciones de identidad y preparación para SEO local.

**Prompt 2: Oportunidades de diferenciación**

*Contexto: Estrategia de producto - Análisis competitivo*

"A partir de tu experiencia en digitalización de SMB, generación de contenido asistida por IA y tendencias actuales de diseño de producto, identifica oportunidades de diferenciación. En concreto, identifica nuevas capacidades que puedan mejorar significativamente una plataforma de presencia digital basada en IA respecto a los estándares actuales, así como capacidades existentes en productos similares que deberían replantearse, especialmente teniendo en cuenta el cambio desde la generación basada en prompts hacia la creación basada en perfiles empresariales estructurados."

*Resultado:* Identificación de ocho oportunidades: Business Identity Graph dinámica, generación sin prompts basada en datos, plantillas verticales, paquetes de contenido orientados a la intención, analizadores de diferenciación, motores de coherencia, ajuste interactivo de la voz de marca, entre otras.

**Prompt 3: Validación de la propuesta de valor con el cliente final**

*Contexto: Fase inicial - Alineación comercial*

"Formula la propuesta de valor principal de AI Business Presence Builder para pequeños propietarios de negocios. Considera las barreras para la adopción digital, las limitaciones presupuestarias, el nivel técnico y la disponibilidad de tiempo. ¿En qué se diferencia la solución de los servicios de agencia costosos y de las herramientas genéricas de contenido basadas en IA? ¿Qué problemas principales resolvemos?"

*Resultado:* Clarificación de una propuesta de valor centrada en la asequibilidad, la facilidad de uso, la coherencia de marca y la rapidez de puesta en marcha.

---

## 2. Arquitectura del sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1: Diseño de arquitectura de alto nivel**

*Contexto: Arquitectura - Estructura base*

"A partir de todo lo definido hasta ahora, describe una arquitectura de alto nivel para esta plataforma. Explica cómo debe organizarse el sistema de extremo a extremo, incluyendo los componentes principales, el flujo de datos y la integración de la capa de IA con el proceso estructurado de creación del perfil empresarial. Refleja claramente la separación entre el descubrimiento guiado del negocio, el perfil normalizado y la generación de activos mediante IA. Destaca los límites y las decisiones arquitectónicas principales."

*Resultado:* Arquitectura modular con capas de experiencia, aplicación, datos e IA, además de servicios desacoplados para evaluación de IA y notificaciones. Se definieron límites claros entre el descubrimiento, el perfil normalizado y la generación asistida.

**Prompt 2: Representación gráfica con Mermaid**

*Contexto: Visualización - Diagramas técnicos*

"Representa la arquitectura descrita mediante un diagrama Mermaid. Estructúralo para mostrar claramente los componentes principales, sus relaciones y el flujo de datos desde el descubrimiento del negocio hasta el perfil normalizado y, finalmente, la generación de activos mediante IA. Mantén el diagrama limpio y centrado en los límites generales del sistema, sin incluir detalles de implementación innecesarios."

*Resultado:* Diagrama `flowchart LR` que visualiza el flujo completo entre las distintas capas y componentes.

**Prompt 3: Comparación de opciones arquitectónicas**

*Contexto: Decisiones técnicas - Trade-offs*

"Propón tres enfoques arquitectónicos viables para esta plataforma y descríbelos con el detalle suficiente para comprender cómo resuelven el descubrimiento del negocio, la normalización del perfil y la generación de activos mediante IA. Compáralos en escalabilidad, mantenibilidad, complejidad y adecuación para un sistema basado en IA. Recomienda la opción más apropiada con una justificación clara, incluyendo sus ventajas y compromisos."

*Resultado:* Evaluación de un monolito modular, una SOA con orquestador dedicado y una arquitectura Serverless orientada a eventos. Se recomendó el monolito modular con servicios desacoplados para evaluación de IA y notificaciones, por equilibrar simplicidad y capacidad de iteración rápida durante el MVP.

### **2.2. Descripción de los componentes principales**

**Prompt 1: Desglose de responsabilidades**

*Contexto: Detalles técnicos - Interfaces*

"Describe los componentes de backend más importantes: Discovery Orchestration Service, Profile Normalization Service, Business Identity Graph, Asset Generation Service y Quality & Consistency Service. Para cada uno, explica su función, entradas y salidas, dependencias y contribución al flujo principal. Incluye las decisiones tecnológicas relevantes."

*Resultado:* Descripción detallada de cada servicio, con límites de responsabilidad claros.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1: Organización de un proyecto modular**

*Contexto: Estructura - Carpetas y convenciones*

"Representa la estructura del proyecto y explica la finalidad de sus carpetas principales. Asegúrate de que la organización cubra la experiencia frontend, la lógica backend, los datos y la persistencia, y la documentación. Explica cómo esta estructura favorece la modularidad, la separación de responsabilidades y la colaboración en un equipo multidisciplinar."

*Resultado:* Carpetas por capas: `frontend/`, `backend/`, `models/`, `docs/` y `config/`, con la justificación de cada una.

---

## 3. Modelo de datos

**Prompt 1: Diseño entidad-relación**

*Contexto: Datos - Estructura base*

"A partir del sistema definido hasta ahora, genera un diagrama entidad-relación utilizando Mermaid. Representa las entidades principales del dominio, sus atributos y relaciones, especialmente en torno al perfil empresarial, los datos estructurados del descubrimiento y los activos digitales generados. Incluye claves primarias, claves foráneas y restricciones. Asegúrate de que el modelo soporte todos los casos de uso definidos anteriormente."

*Resultado:* Diagrama ER con nueve entidades: Organization, User, BusinessProfile, AssetPackage, GeneratedAsset, AssetVariation, QualityCheck, AIRecommendation y PublicationTask.

**Prompt 2: Descripción de entidades y cardinalidades**

*Contexto: Documentación - Catálogo de datos*

"Para cada entidad principal del modelo, describe su finalidad, claves primarias, claves foráneas, atributos relevantes y tipos de datos, restricciones, relaciones, cardinalidades y significado de negocio. Asegura la coherencia con la arquitectura y los casos de uso, y céntrate en que el diseño sea implementable en PostgreSQL."

*Resultado:* Documentación detallada de cada entidad, con cardinalidades, restricciones y ejemplos.

---

## 4. Especificación de la API

**Prompt 1: Diseño de endpoints OpenAPI**

*Contexto: API - Contrato técnico*

"Describe los tres endpoints principales de backend en formato OpenAPI 3.0 para soportar el flujo de descubrimiento, la gestión del perfil y la generación de activos. Para cada endpoint incluye esquemas de solicitudes y respuestas, métodos HTTP, códigos de estado, gestión de errores y ejemplos realistas. Los endpoints son: POST /api/discovery/sessions, GET /api/profiles/{profileId} y POST /api/assets/generate."

*Resultado:* Especificación completa con esquemas de solicitudes y respuestas, ejemplos y documentación de los endpoints.

**Prompt 2: Gestión de errores y códigos de estado**

*Contexto: API - Robustez operativa*

"Amplía el diseño de la API para incluir una gestión detallada de errores. Relaciona las condiciones específicas del PRD, como profile_not_normalized, gdpr_consent_required, quota_exceeded, invalid_format e insufficient_permissions, con códigos HTTP y cuerpos de respuesta. Asegúrate de que cada endpoint defina las respuestas 400/401/403/404/500 esperadas y utilice un esquema de error coherente."

*Resultado:* Descripción de errores y códigos de estado alineada con el PRD, con cuerpos de error reutilizables.

**Prompt 3: Validación de solicitudes/respuestas y restricciones**

*Contexto: API - Contratos de datos*

"Describe las reglas de validación y las restricciones de los esquemas de solicitudes y respuestas de la API. Incluye campos obligatorios, formatos, restricciones de enums, límites de arrays y su relación con reglas de dominio como el estado de BusinessProfile y el consentimiento GDPR. Indica cómo las peticiones inválidas deben fallar rápidamente con mensajes significativos."

*Resultado:* Reglas de validación claras para los esquemas de solicitudes y respuestas y criterios de rechazo temprano.

**Prompt 4: Aspectos transversales de la API**

*Contexto: API - Operaciones y seguridad*

"Describe cómo deben gestionarse los aspectos transversales de la capa API: autenticación, autorización, limitación de solicitudes, paginación y propagación de errores. Utiliza el comportamiento del PRD para explicar cuándo deben autenticarse las peticiones, qué endpoints requieren comprobaciones de roles y cómo se comunica la limitación de tráfico a los clientes."

*Resultado:* Recomendaciones sobre autenticación, autorización y operación de la API.

---

## 5. Historias de usuario

**Prompt 1: Generación de historias de usuario del MVP**

*Contexto: Requisitos - Backlog priorizado*

"Genera cinco historias de usuario imprescindibles para el MVP con el formato 'Como [rol], quiero [acción], para que [beneficio]'. Cada historia debe incluir criterios de aceptación en formato Dado/Cuando/Entonces, casos límite y resultados medibles. Cubre el descubrimiento del negocio, la normalización del perfil, la generación de activos y el control de calidad. Alinea el resultado con el Lean Canvas y la arquitectura."

*Resultado:* Cinco historias con criterios de aceptación detallados y casos límite.

**Prompt 2: Historias recomendadas para después del MVP**

*Contexto: Backlog futuro - Roadmap*

"Genera dos historias de usuario recomendadas para fases posteriores al MVP que amplíen la plataforma sin añadir complejidad al MVP. Céntrate en un panel de métricas y en el uso compartido de activos para revisión colaborativa. Incluye el mismo nivel de detalle que en las historias imprescindibles."

*Resultado:* Dos historias adicionales para fases posteriores, con criterios claros.

---

## 6. Tickets de trabajo

**Prompt 1: Descomposición en tareas técnicas**

*Contexto: Planificación - Desglose del sprint*

"A partir de las cinco historias imprescindibles, descompón el trabajo en tres tareas técnicas que cubran las capas de backend, frontend y de base de datos. Cada tarea debe incluir ID, nombre, descripción, objetivo, dependencias y alcance para una sola persona desarrolladora. Asegura la cobertura de la captura del descubrimiento, la lógica de backend de normalización del perfil y la infraestructura de generación de activos."

*Resultado:* Tres tareas (BE-101, FE-102 y DB-103) con descripción técnica completa.

**Prompt 2: Estimación con puntos de historia**

*Contexto: Estimación - Planificación Fibonacci*

"Estima los tres tickets técnicos utilizando la escala de Fibonacci (1, 2, 3, 5, 8, 13). Proporciona para cada uno el valor de puntos de historia y una breve justificación considerando la complejidad, las dependencias, la curva de aprendizaje y la experiencia del equipo. Asegúrate de que las estimaciones reflejen un esfuerzo realista para un MVP de una startup."

*Resultado:* BE-101 (5 puntos), FE-102 (3 puntos) y DB-103 (8 puntos), con su justificación.

---

## 7. Solicitudes de cambio

**Prompt 1: Descripción profesional de una PR**

*Contexto: Control de cambios - Documentación*

"Crea una descripción completa de una PR que explique la incorporación de siete historias de usuario completas con criterios de aceptación, la descomposición en tres tareas técnicas con estimación en puntos de historia y la justificación de las decisiones arquitectónicas. Incluye título, cambios realizados, motivación, impacto de negocio e impacto técnico. Dirige el documento a responsables de producto y de ingeniería."

*Resultado:* Descripción profesional de PR para comunicar el valor y los cambios a las partes interesadas.

---

## Notas finales

Todos los prompts se diseñaron para:

- Traducirse directamente en artefactos concretos y medibles.
- Mantener la coherencia arquitectónica y de dominio durante todo el proyecto.
- Justificar las decisiones técnicas y de producto ante las partes interesadas.
- Documentar los supuestos y las restricciones del MVP.

Los prompts ponen el énfasis en:

- Restricciones realistas de startup: presupuesto, tiempo y complejidad.
- Enfoque en usuarios finales no técnicos, especialmente pequeñas PYMEs.
- Calidad, coherencia y explicabilidad como elementos diferenciadores.
- Human-in-the-loop y validación humana en los flujos de IA.
