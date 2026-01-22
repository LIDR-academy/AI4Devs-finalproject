# Product Requirements Document (PRD) – KinderTrack

---

## Índice

1. [Breve descripción del producto](#breve-descripción-del-producto)  
2. [Valor agregado y ventajas competitivas](#valor-agregado-y-ventajas-competitivas)  
3. [Descripción general de las funcionalidades](#descripción-general-de-las-funcionalidades)  
    1. [Registro de Asistencias (MVP)](#registro-de-asistencias-mvp)  
    2. [Registro de Incidentes (MVP)](#registro-de-incidentes-mvp)
4. [Requisitos clave del MVP](#requisitos-clave-del-mvp)  
5. [Consideraciones de seguridad](#consideraciones-de-seguridad)  
6. [Escalabilidad y visión futura](#escalabilidad-y-visión-futura)  

---

## Breve descripción del producto

**KinderTrack** es una plataforma de software diseñada para instituciones de educación inicial (0–5 años) que permite registrar y dar seguimiento a la asistencia diaria y a los incidentes relevantes de los niños.  

El producto transforma los registros administrativos en **información significativa para docentes, directivos y familias**, construyendo una **historia diaria y evolutiva del desarrollo de cada niño**.  

KinderTrack está diseñado para ser **simple, seguro, escalable y sin costo de infraestructura**, permitiendo que las escuelas adopten la herramienta sin suscripciones ni servidores externos.

---

## Valor agregado y ventajas competitivas

A diferencia de las soluciones actuales en el mercado, que se enfocan únicamente en registros administrativos o incidentes negativos, KinderTrack ofrece:

- **Asistencias contextualizadas**: cada check-in/check-out incluye estado y contexto del niño, proporcionando información relevante para el día pedagógico.  
- **Incidentes positivos y pedagógicos**: no solo registra problemas, sino hechos relevantes y logros, con etiquetas pedagógicas y narrativa estructurada.  
- **Seguridad operacional y de datos**: roles claros, trazabilidad completa, historial inmutable y cifrado local.  
- **Combinación asistencia + incidentes**: genera automáticamente un resumen coherente del día y del desarrollo evolutivo del niño.  
- **Simplicidad y adopción**: interfaces rápidas y minimalistas para que los docentes registren información sin interrumpir la rutina del aula.  
- **Escalabilidad futura**: modularidad y datos portables para integrar múltiples aulas, sedes o sincronización cloud sin rehacer la plataforma.  

En resumen, KinderTrack convierte la asistencia y los incidentes en **una historia diaria clara y confiable**, alineada con la educación infantil y el cuidado de los niños.

---

## Descripción general de las funcionalidades

### Registro de Asistencias (MVP)

- Registrar **check-in y check-out** de cada niño de manera rápida (<15 segundos por niño).  
- Capturar **estado al llegar**: tranquilo, cansado, inquieto, medicación, alimentación, etc.  
- Asociar cada registro con el **educador responsable**.  
- Visualización en tiempo real de niños presentes/ausentes por aula.
- Registro de ausencias justificadas con motivo.  

### Registro de Incidentes (MVP)

- Registrar **hechos relevantes** del día, positivos o negativos.  
- Seleccionar niño, categoría de incidente y agregar breve descripción.  
- Categorías predefinidas: positivo, negativo, pedagógico, salud, comportamiento, logro.
- Etiquetado manual con áreas de desarrollo (motricidad, socialización, lenguaje, autonomía).
- Cada incidente puede:  
  - quedar interno (solo docentes y directivos)  
  - formar parte del resumen diario para las familias  
- Generación de resumen diario por niño para compartir con familias.  

---

## Requisitos clave del MVP

- **Costo de infraestructura 0**: offline-first, datos locales (SQLite o archivos cifrados) con exportación CSV.  
- **Simplicidad**: UX minimalista, interfaz mobile-friendly, campos mínimos.  
- **Seguridad**: roles (docente, directivo, administrativo). 
- **Escalabilidad**: diseño modular, datos portables y preparados para sincronización futura o multi-sede.

---

## Consideraciones de seguridad

- Roles de usuario con permisos diferenciados.  
- Cada registro de asistencia o incidente incluye: usuario, timestamp, aula y dispositivo.   
- Datos cifrados en repositorio local (AES-256).  
- Control de visibilidad para incidentes: internos vs compartidos con familias.  
- Adjuntos opcionales (foto, nota) con acceso restringido.
- Historial inmutable, con posibilidad de corrección solo con justificación (post MVP). 

---

## Escalabilidad y visión futura

### Funcionalidades Post-MVP

**Alertas y notificaciones inteligentes:**
- Alertas automáticas para llegadas tardías recurrentes.
- Detección de ausencias recurrentes con sugerencias de seguimiento.
- Alertas de ratio niño-docente fuera de rango en tiempo real.
- Notificaciones configurables por tipo de evento y rol de usuario.

**Expansión de funcionalidades:**
- Integración con **cloud** para sincronización multi-sede.
- Reportes avanzados y analítica para docentes y directivos.
- Comunicación bidireccional con familias: resúmenes automáticos diarios/semanales.
- Integración con currículos educativos y plataformas externas.
- Sistema de adjuntos multimedia (fotos, videos) para incidentes.
- Permitir **historial de asistencia** y reportes exportables.
- Historial inmutable y trazabilidad completa por usuario y timestamp.  
- Trazabilidad, historial inmutable, cifrado de datos. 

KinderTrack está diseñado para **crecer sin perder simplicidad ni seguridad**, evolucionando desde un MVP eficiente hasta una plataforma completa de seguimiento educativo para primera infancia.