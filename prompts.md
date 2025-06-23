> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


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
Rol asignado:
Actúa como un experto en desarrollo web, UX/UI y gestión de proyectos tecnológicos.

Objetivo:
Completar la ficha de un proyecto tecnológico con una descripción profesional y clara que comunique de forma efectiva el alcance, valor e innovación de un sistema tipo “Tinder” orientado al sector inmobiliario.

Criterios y estructura esperada del resultado:
	1.	Nombre del proyecto:
Sugiere un nombre profesional, atractivo y descriptivo que represente un sistema tipo “Tinder” aplicado a bienes raíces.
	2.	Descripción del proyecto (2-4 párrafos):
Redacta un texto conciso y convincente que incluya:
	•	El problema de mercado que resuelve.
	•	La solución tecnológica propuesta (ReactJS, MySQL, uso de IA para matchmaking).
	•	El valor diferencial frente a plataformas tradicionales del sector.
	•	El enfoque hacia un público diverso: usuarios individuales, agentes inmobiliarios, inmobiliarias y constructoras.
	3.	URL sugerida:
Proporciona una estructura adecuada y profesional para la URL del proyecto (por ejemplo, tipo nombreproyecto.app o similar).
	4.	Estructura del repositorio:
Describe cómo debe organizarse el repositorio (frontend, backend, documentación, base de datos, scripts de IA, etc.) para facilitar la colaboración, la escalabilidad y el mantenimiento profesional del proyecto.

Contexto funcional adicional del sistema:
El sistema debe permitir que:
	•	Los publicadores (usuarios, agentes, empresas) indiquen la ubicación del inmueble y sus características.
	•	Los buscadores utilicen filtros (tipo de propiedad, características) y dibujen polígonos sobre el mapa para definir zonas de interés.
	•	Se genere un “match” automático si una propiedad publicada se encuentra dentro del polígono y cumple con al menos el 50% de los filtros definidos por el buscador.
	•	El sistema también detecte coincidencias inversas: si alguien publica un inmueble que coincide con los filtros de algún buscador activo, se debe notificar un match automático inverso.

**Prompt 2:**

Actúa como un experto en branding y marketing digital con experiencia en naming de productos tecnológicos disruptivos. Tu tarea es hacer un benchmark y luego proponer una lista corta de nombres para un sistema digital inspirado en la mecánica de “Tinder”, pero aplicado al sector de bienes raíces (compra, venta o alquiler de propiedades).

Descripcion del proyecto:
revoluciona la forma en que se descubren propiedades inmobiliarias, resolviendo una de las principales fricciones del mercado: la ineficiencia en el emparejamiento entre oferta y demanda. En un entorno donde los portales tradicionales requieren búsquedas manuales extensas y carecen de retroalimentación proactiva, los usuarios se enfrentan a una experiencia fragmentada y poco personalizada.

Este sistema propone una solución tecnológica basada en una arquitectura moderna compuesta por ReactJS para una interfaz responsiva e intuitiva, Node.js y MySQL para una gestión robusta de datos, y un módulo de IA personalizado para matchmaking que analiza criterios y comportamientos para generar coincidencias automáticas entre inmuebles y buscadores. Los usuarios pueden definir zonas de interés mediante polígonos interactivos sobre el mapa, aplicar múltiples filtros (tipo de propiedad, amenidades, precio, etc.) y recibir notificaciones en tiempo real cuando una propiedad relevante aparece o se publica.

A diferencia de los portales tradicionales, MatchEstate no es solo una vitrina de propiedades, sino un sistema inteligente de conexión inmediata entre intereses complementarios, replicando la lógica de apps de emparejamiento social. Este enfoque dinámico y centrado en el usuario transforma el descubrimiento inmobiliario en una experiencia ágil, proactiva y placentera.

Diseñado para un público amplio y diverso, MatchEstate ofrece funcionalidades especializadas tanto para usuarios individuales que buscan su nuevo hogar, como para agentes, inmobiliarias y constructoras que desean posicionar sus propiedades de forma más eficiente. Todos los actores pueden beneficiarse de algoritmos de coincidencia inversa, sugerencias automatizadas y analíticas en tiempo real para tomar decisiones más rápidas y precisas.

Criterios clave del nombre propuesto:
	•	Debe ser original y revolucionario dentro del sector inmobiliario.
	•	Atractivo a nivel de marketing y fácil de recordar.
	•	Corto y pegajoso, idealmente de una o dos palabras.
	•	Puede ser en inglés, español o híbrido si mejora su impacto global.
	•	El benchmark debe considerar al menos 5 plataformas tecnológicas exitosas en real estate o apps de tipo matchmaking, y explicar brevemente por qué sus nombres funcionan.

Resultado esperado:
Una tabla comparativa con ejemplos de nombres de referencia + 5 nuevas propuestas de nombres para tu sistema, cada una con una breve justificación de por qué funciona.

**Prompt 3:**
Basándote exclusivamente en la documentación del PRD proporcionado, actúa como un experto en desarrollo web y diseño UX/UI. Tu tarea consiste en:
	1.	Describir de forma detallada la experiencia completa del usuario, desde que accede por primera vez a la aplicación hasta el uso de sus funcionalidades principales.
	2.	Para cada etapa del flujo de usuario (onboarding, navegación, búsqueda de propiedades, interacción con el sistema de recomendaciones, contacto con agentes, etc.), incluye:

	•	Las pantallas involucradas
	•	Los componentes visuales clave y su disposición (layout)
	•	Principales interacciones e inputs del usuario
	•	Cómo interviene la inteligencia artificial en la interfaz (matchmaking, recomendaciones, etc.)

	3.	Asegúrate de integrar principios de diseño centrado en el usuario (usabilidad, jerarquía visual, accesibilidad) y plantea una experiencia óptima en dispositivos móviles y escritorio.

El objetivo es producir un desglose completo de la experiencia de usuario ideal que podría implementarse, respetando las funcionalidades y arquitectura propuestas en el PRD.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
