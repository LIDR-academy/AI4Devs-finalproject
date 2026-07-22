> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

> **Nota:** cuando un mismo prompt aplica a varias secciones, se muestra completo una sola vez y se referencia desde el resto para no duplicar contenido.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
```
Actúa como PMO y Arquitecto de Soluciones de IA experto en FinTech y SaaS.
Quiero hacer un brainstorming para un nuevo proyecto de "Ticketing/Facturación Inteligente".

La idea base del flujo es:
1. Un usuario registrado sube una foto de un ticket, recibo o factura a la plataforma.
2. El sistema procesa la imagen para extraer los datos clave (OCR/LLM).
3. El sistema clasifica el documento y detecta/activa ciertas "acciones" automáticas
   basándose en el contenido del ticket.

Para iniciar este brainstorming, propónme ideas divididas en las siguientes 4 categorías:
- Casos de Uso y "Acciones" Clave
- Arquitectura Tecnológica Recomendada
- Desafíos Técnicos y UX
- Modelos de Monetización

Preséntame de 3 a 4 ideas potentes por cada categoría para empezar a debatir.
```
*(Brainstorming inicial de producto, previo a la redacción del RFP.)*

**Prompt 2:**
> "vamos a crear un paso a paso para implementar el proyecto cuyo contexto se encuentra en el RFP [...]. NO GENERES DOCUMENTACION, solo quiero el paso a paso para implementarlo siguiendo los requerimientos"

*(Usado para obtener una hoja de ruta cruzando el RFP, las instrucciones del curso y buenas prácticas 80/20, sin generar todavía el README.)*

**Prompt 3:**
> "Alcance quiero ponerlo todo y aclarar que solo implementare 'Gastos Generales' y solo 3 historias, es decir se documenta todo y se especifica lo que se implementará."

*(Corrigió el alcance por defecto que había propuesto la IA y exigió separar explícitamente "documentado" de "implementado"; resultado: cada sección del README lleva etiqueta de estado **[MVP]** / **[DOCUMENTADO]**. Este mismo prompt es determinante también en la sección 5, Historias de Usuario.)*

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:** *No hubo un prompt dedicado en exclusiva a pedir el diagrama. Se obtuvo como parte de la respuesta al prompt de especificación técnica (ver Prompt 2 en 2.2), que solicitaba explícitamente la "arquitectura general del sistema (componentes y relaciones)".*

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
> "vamos a centrarnos en la fase 1, pero antes elijamos el stack tecnológico [...]. En el backend si podemos utilizar nodeJs incluso NestJs, ya seria un stack conocido. Planteame opciones que cubran las especificaciones del proyecto y sus PROS y Contras"

*(Se pidió expresamente una comparativa con pros/contras en vez de una recomendación cerrada, para decidir con criterio propio. La IA propuso 4 alternativas de backend y 4 de frontend evaluadas contra los requisitos concretos del RFP —OCR, LLM propio, SSO Entra ID, auditoría, exportación a Excel, AWS—. Decisión final: **NestJS (Node/TS)** en backend, **React + TypeScript** en frontend.)*

**Prompt 2:**
```
Actúa como Arquitecto de Software senior con experiencia en AWS y sistemas de procesamiento
de documentos con OCR y LLM.

A partir del siguiente PRD, genera la especificación técnica del MVP con:
- Arquitectura general del sistema (componentes y relaciones)
- Diseño de la capa OCR: tecnología, configuración, manejo de errores
- Diseño de la capa LLM: modelo, prompts base, manejo de baja confianza
- Diseño del flujo HITL: puntos de intervención humana, interfaz mínima
- Modelo de datos (entidades, relaciones, campos clave)
- Diseño del log de auditoría (estructura, inmutabilidad, retención)
- Estrategia de almacenamiento de ficheros adjuntos en AWS S3
- Integración SSO con Microsoft Entra ID
- Entornos: separación pre-producción / producción en AWS
- Estimación de costes de infraestructura (orden de magnitud)

PRD de referencia:
[ADJUNTAR O PEGAR EL PRD]
```
*(Este prompt cubre varias subsecciones de arquitectura a la vez; se referencia también desde 2.4, 2.5 y desde el Modelo de Datos en la sección 3.)*

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:** *Sin prompt dedicado todavía. La estructura de ficheros del repositorio se definirá en la Entrega 2, al generar el código con el coding agent (NestJS backend / React frontend).*

### **2.4. Infraestructura y despliegue**

**Prompt 1:** *Mismo prompt que en 2.2 (Prompt 2). Cubre la estrategia de almacenamiento de ficheros adjuntos en AWS S3, la separación de entornos pre-producción/producción y la estimación de costes de infraestructura.*

### **2.5. Seguridad**

**Prompt 1:** *Mismo prompt que en 2.2 (Prompt 2). Cubre la integración SSO con Microsoft Entra ID y el diseño del log de auditoría (estructura, inmutabilidad, retención).*

*(Nota: el prompt pide únicamente el diseño de la integración; no incluye credenciales ni secretos reales.)*

### **2.6. Tests**

**Prompt 1:** *Sin prompt dedicado todavía. Los prompts usados para generar tests se documentarán en la Entrega 2, junto con el código.*

---

### 3. Modelo de Datos

**Prompt 1:**
> "para la primera entrega cumplimenta el 'template readme.md'. con el contexto que tenemos." 

*(No hubo un prompt dedicado solo al modelo de datos; se derivó del contexto acumulado —RFP + decisión de alcance—. Ajuste humano: exigir que el modelo cubriera el dominio completo —incluyendo Combustible— aunque el MVP use solo un subconjunto, marcando qué entidades participan realmente en las 3 historias implementadas. Resultado: diagrama ER completo en Mermaid, con las entidades del MVP diferenciadas de las solo documentadas.)*

**Prompt 2:** *Mismo prompt que en 2.2 (Prompt 2), que solicita explícitamente el "Modelo de datos (entidades, relaciones, campos clave)" como parte de la especificación técnica.*

---

### 4. Especificación de la API

**Prompt 1:** *Mismo prompt que en la sección 3 ("cumplimenta el 'template readme.md'..."). No hubo un prompt dedicado en exclusiva a la API; se derivó directamente de las 3 historias MVP confirmadas y de la lista de funcionalidades documentadas, manteniendo trazabilidad historia → endpoint.*

**Pendiente de ajuste humano:** validar en la Entrega 2, con código real, que los endpoints propuestos coinciden con la implementación.

---

### 5. Historias de Usuario

**Prompt 1:**
> "Ayúdame a redactar el Alcance del Proyecto de manera clara y profesional. Necesito documentar todo el sistema a nivel general, pero dejando perfectamente estipulado que la implementación de esta fase se limitará únicamente al módulo de 'Gastos Generales' y a 3 Historias de Usuario. Asegúrate de marcar bien la frontera entre lo que se documenta y lo que se construye"

*(Mismo prompt de la sección 1; determinante para acotar el alcance a 3 historias del módulo Gastos Generales.)*

**Prompt 2:**
> "Sí, esas 3"

*(Confirmación explícita del usuario ante la propuesta de 3 historias Must-Have generada por la IA, que cubrían el flujo end-to-end completo: captura → HITL → aprobación. El humano validó la propuesta mediante selección expresa, en lugar de dejarla pasar sin revisión.)*


---

### 6. Tickets de Trabajo

*Nota: el MVP solo implementa el módulo "Gastos Generales" (ver alcance en la sección 1), por lo que los tickets siguientes se acotan a ese módulo.*

**Prompt 1:**
```
Eres un sistema de extracción de datos de documentos financieros.
El usuario ha indicado que este documento pertenece al módulo: [COMBUSTIBLE / GASTOS GENERALES].

Analiza la imagen adjunta y extrae los siguientes campos en formato JSON estricto.
Si un campo no está presente en el documento, devuelve null para ese campo.
Indica el nivel de confianza de cada campo extraído: alto / medio / bajo.

Para el módulo GASTOS GENERALES, extrae:
{
  "fecha": "",
  "concepto": "",
  "importe_total": "",
  "base_imponible": "",
  "iva_porcentaje": "",
  "iva_importe": "",
  "forma_pago": "",          // "visa" | "efectivo" | null
  "proveedor": "",
  "nif_proveedor": "",
  "area_sugerida": "",       // "comida" | "estancia" | "vuelo" | "parking" | "otros" | null
  "confianza": {
    "fecha": "",
    "importe_total": "",
    "area_sugerida": ""
  }
}

Devuelve únicamente el JSON. Sin texto adicional, sin bloques de código markdown.
```
*(Extracción de datos de ticket con LLM multimodal; ticket de la historia de "captura".)*

**Prompt 2:**
```
Valida el siguiente JSON extraído de un ticket financiero.
Aplica las siguientes reglas de negocio y devuelve un JSON con el resultado:

Reglas de validación:
1. base_imponible + iva_importe debe ser igual a importe_total (tolerancia: ±0.02 €).
2. La fecha no puede ser futura ni anterior a 5 años desde hoy.
3. El importe_total debe ser un número positivo mayor que 0.
4. Si forma_pago es null, marca el campo como pendiente de revisión humana.
5. Si area_sugerida es null, marca el campo como pendiente de selección por el usuario.

Devuelve:
{
  "valido": true | false,
  "errores": [],             // lista de errores bloqueantes
  "advertencias": [],        // lista de avisos no bloqueantes
  "campos_pendientes": []    // campos que requieren revisión o completado por el usuario
}
```
*(Validación de datos extraídos; ticket de la historia de "revisión/HITL".)*

**Prompt 3:**
```
Compara el siguiente ticket recién procesado con el historial de tickets del mismo usuario.
Determina si existe un posible duplicado basándote en estos criterios:
- Mismo importe total (±0.01 €)
- Misma fecha de gasto
- Mismo proveedor o NIF de proveedor

Devuelve:
{
  "es_duplicado_probable": true | false,
  "confianza": "alta" | "media" | "baja",
  "registro_coincidente_id": "",    // null si no hay coincidencia
  "motivo": ""
}
```
*(Detección de duplicados; ticket de la historia de "aprobación".)*

---

### 7. Pull Requests

**Prompt 1:** *Sin prompts todavía. La Entrega 1 no incluye generación de código: este apartado se completará en la Entrega 2, cuando se generen las pull requests con el coding agent (Claude Code / GitHub Copilot, a definir) y se documenten los ajustes humanos aplicados al código generado antes de cada PR.*
