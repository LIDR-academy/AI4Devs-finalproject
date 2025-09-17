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
A partir de la documentación técnica y funcional del sistema Zonmatch, diseña una propuesta detallada de arquitectura de software.
	1.	Utiliza el formato visual y/o textual más adecuado (por ejemplo: diagramas en PlantUML, Mermaid, tablas o descripciones) para representar los componentes principales de la aplicación, incluyendo:
	•	Frontend
	•	Backend
	•	Base de datos
	•	Módulo de Matcheo
	•	Servicios de notificaciones
	•	Infraestructura y despliegue
	2.	Especifica las tecnologías utilizadas en cada capa o componente (por ejemplo: React, Node.js, MySQL, etc.) y su interacción.
	3.	Indica si la arquitectura sigue algún patrón predefinido (ej. MVC, hexagonal, microservicios) y justifica su elección en relación al contexto de Zonmatch (tipo de usuarios, funcionalidades clave, escalabilidad esperada, etc.).
	4.	Expón de forma clara:
	•	Los beneficios técnicos y de negocio que esta arquitectura aporta.
	•	Los sacrificios o limitaciones que se han asumido (por ejemplo, acoplamientos, costos, complejidad).
	•	Alternativas consideradas, si aplica, y por qué se descartaron.
	5.	Incluye una breve explicación de la estructura de carpetas del proyecto si sigue un patrón organizativo (por dominios, por capas, etc.).
	6.	Finalmente, resume las prácticas de seguridad aplicadas en los distintos niveles del sistema (autenticación, roles, cifrado, protección de endpoints, etc.).

no realices nada aun, primero haz las preguntas necesarias para aclarar tus dudas e iremos avanzando por puntos

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Continuemos con la segunda sección: Descripción de componentes principales.

Detalla cada uno de los componentes fundamentales que conforman la arquitectura del sistema. Para cada componente:
	1.	Describe su propósito funcional dentro del sistema (qué responsabilidad tiene).
	2.	Especifica la tecnología utilizada (frameworks, lenguajes, librerías relevantes).
	3.	Indica cómo se comunica o interactúa con otros componentes (por ejemplo, APIs REST, colas de mensajes, bases de datos, eventos, etc.).
	4.	Si aplica, menciona buenas prácticas, patrones o principios que se hayan seguido (ej. separación de responsabilidades, uso de servicios desacoplados, etc.).

Organiza la descripción por capas o bloques lógicos, tales como:
	•	Frontend (cliente)
	•	Backend (servidor de negocio)
	•	Base de datos
	•	Sistema de notificaciones
	•	Módulo de Matcheo para coincidencias
	•	Servicios externos / integraciones
	•	Middleware y seguridad
	•	Infraestructura / orquestación

no crees nada aun primero validaremos la infromacion


### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Continuamos con el paso 3: Descripción de alto nivel del proyecto y estructura de carpetas.

Se debe presentar una visión técnica general del sistema, incluyendo su propósito, naturaleza (por ejemplo, aplicación web full stack) y tecnologías predominantes.

A continuación, se debe representar la estructura del repositorio en formato de árbol o bloque de carpetas. Esta estructura debe reflejar las principales áreas funcionales del proyecto.

Para cada carpeta o archivo relevante, se debe explicar de manera concisa su función dentro del sistema y el tipo de contenido que alberga (por ejemplo: controladores, modelos, vistas, hooks, servicios, middleware, assets, pruebas, configuraciones).

Finalmente, se debe indicar si la organización del proyecto sigue un patrón arquitectónico reconocido (como MVC, Clean Architecture, DDD o separación por capas), justificando brevemente cómo esta estructura apoya los objetivos de mantenibilidad, escalabilidad y claridad del código.

no crees nada aun primero validaremos la infromacion


### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Continuamos con la sección de Infraestructura y Despliegue.

Se debe describir con claridad la infraestructura tecnológica que soporta el sistema, incluyendo servicios utilizados (por ejemplo, servidores, bases de datos, almacenamiento, balanceadores de carga, CDN, etc.), herramientas de orquestación o automatización (como Docker, Kubernetes, CI/CD), y entornos configurados (desarrollo, staging, producción).

Acompañar esta descripción con un diagrama arquitectónico en el formato que se considere más adecuado (por ejemplo: PlantUML, Mermaid, draw.io), representando visualmente los componentes desplegados, su relación e interacción.

A continuación, se debe explicar paso a paso el proceso de despliegue, detallando:
	•	Herramientas y scripts utilizados.
	•	Repositorios implicados.
	•	Automatismos de integración o entrega continua.
	•	Flujo de publicación desde desarrollo hasta producción.

Si existen políticas de rollback, redundancia o escalado automático, también deben ser mencionadas.

### **2.5. Seguridad**

**Prompt 1:**
Actúa como un experto en seguridad de aplicaciones web. Implementa un sistema de seguridad robusto para Zonmatch, la plataforma de matchmaking inmobiliario.

Contexto de Zonmatch:
- Backend Node.js + Express + TypeScript con MySQL y Redis
- Frontend React 18 con Material-UI y Zustand
- Sistema de roles: user, agent, admin
- Gestión de imágenes con Cloudinary
- APIs REST para búsquedas, propiedades y favoritos

Implementa las mejores prácticas de seguridad para Zonmatch incluyendo:
- Autenticación JWT con verificación de estado
- Sistema de roles y permisos granular
- Protección contra ataques de fuerza bruta
- Cifrado de contraseñas con bcrypt
- Headers de seguridad con Helmet.js
- Rate limiting diferenciado por operación
- Validación exhaustiva de datos de entrada

**Prompt 2:**
Actúa como un especialista en seguridad de bases de datos. Implementa medidas de seguridad específicas para la base de datos MySQL de Zonmatch.

Contexto de Zonmatch:
- MySQL 8.0 con Sequelize ORM
- Datos sensibles: usuarios, propiedades, búsquedas guardadas, favoritos
- Operaciones críticas: matchmaking, geolocalización, imágenes
- Entidades principales: User, Property, Search, Match, Favorite

Implementa las mejores prácticas de seguridad para la base de datos de Zonmatch

**Prompt 3:**
Actúa como un experto en seguridad de aplicaciones React. Implementa medidas de seguridad frontend para Zonmatch.

Contexto de Zonmatch:
- React 18 + TypeScript + Material-UI
- Estado global con Zustand
- Integración con Google Maps API y Cloudinary
- Componentes: ImageUpload, GoogleMapComponent, SearchFilters
- Autenticación JWT con roles

Implementa las mejores prácticas de seguridad frontend para Zonmatch

### **2.6. Tests**

**Prompt 1:**
Necesito que actúes como un desarrollador senior especializado en testing y utilidades geográficas.

CONTEXTO:
Estoy desarrollando un sistema de matching inmobiliario llamado Zonmatch que utiliza utilidades geográficas para:
- Verificar si propiedades están dentro de zonas de interés (polígonos)
- Calcular distancias entre puntos geográficos
- Generar scores de ubicación para el sistema de matching
- Validar coordenadas y polígonos

ARCHIVO A TESTEAR:
Tengo un archivo `geoUtils.ts` con las funciones auxiliares

REQUISITOS ESPECÍFICOS:

1. Cobertura Completa:
   - Crear tests para TODAS las funciones públicas
   - Incluir casos de uso normales y casos edge
   - Validar tanto éxito como fallos esperados

2. Datos de Prueba Geográficos:
   - Usar coordenadas reales de México (CDMX, Guadalajara, Monterrey, etc.)
   - Crear polígonos de prueba representativos
   - Incluir casos con coordenadas válidas e inválidas

3. Casos de Prueba Específicos:
   - Puntos dentro y fuera de polígonos
   - Distancias entre ciudades conocidas (verificar precisión)
   - Coordenadas en límites (-90° a 90°, -180° a 180°)
   - Polígonos con diferentes números de puntos
   - Scores de ubicación en diferentes escenarios

4. Validaciones de Precisión:
   - Verificar que las distancias calculadas sean correctas
   - Validar que los scores estén en el rango 0-1

5. Manejo de Errores:
   - Coordenadas inválidas (NaN, fuera de rango)
   - Polígonos inválidos (menos de 3 puntos, coordenadas malformadas)
   - Arrays vacíos
   - Datos nulos o undefined

6. Estructura de Tests:
   - Usar Jest como framework
   - Organizar en describe() por funcionalidad
   - Nombres descriptivos en español
   - Incluir setup y teardown si es necesario

7. Configuración:
   - Crear archivo jest.config.js para TypeScript
   - Configurar timeout apropiado para cálculos geográficos
   - Incluir setup de tests

RESULTADO ESPERADO:
- Archivo de tests completo con 20+ casos de prueba
- Configuración de Jest para TypeScript
- Setup de tests
- Cobertura del 100% de funciones críticas
- Tests que pasen y validen la funcionalidad correcta

¿Puedes crear estos tests siguiendo estas especificaciones?

**Prompt 2:**
Necesito que actúes como un desarrollador senior especializado en testing y servicios de matching inmobiliario.

CONTEXTO:
Estoy desarrollando un sistema de matching inmobiliario llamado Zonmatch que utiliza un algoritmo basado en reglas para:
- Hacer matching entre propiedades y búsquedas de usuarios
- Calcular scores de compatibilidad basados en criterios múltiples
- Validar propiedades y búsquedas antes del matching
- Gestionar matches automáticos e inversos

ARCHIVO A TESTEAR:
Tengo un `MatchingService` con métodos complejos que incluyen:
- Cálculo de scores de precio, características, ubicación y preferencias
- Validación de propiedades y búsquedas
- Algoritmo de matching con pesos configurables
- Integración con base de datos mediante consultas SQL directas

REQUISITOS ESPECÍFICOS:

1. Cobertura Completa:
   - Crear tests para TODOS los métodos públicos del MatchingService
   - Incluir casos de uso normales y casos edge
   - Validar tanto éxito como fallos esperados

2. Casos de Prueba Críticos:
   - Propiedades válidas e inválidas
   - Búsquedas con diferentes criterios
   - Cálculos de scores con datos reales
   - Validaciones de campos requeridos
   - Manejo de errores de base de datos

3. Mocks Necesarios:
   - Mock de sequelize.query para consultas SQL
   - Mock de modelos de Sequelize
   - Mock de configuraciones de matching
   - Mock de utilidades geográficas

4. Datos de Prueba:
   - Propiedades con diferentes características
   - Búsquedas con criterios variados
   - Casos de matching exitoso y fallido
   - Datos de prueba realistas para México

5. Casos Edge:
   - Propiedades sin coordenadas
   - Búsquedas sin criterios
   - Rangos de precio inválidos
   - Datos nulos o undefined

6. Estructura de Tests:
   - Usar Jest como framework
   - Organizar en describe() por funcionalidad
   - Nombres descriptivos en español
   - Setup y teardown apropiados

7. Configuración:
   - Mock de dependencias externas
   - Configurar timeout apropiado
   - Incluir setup de tests

RESULTADO ESPERADO:
- Archivo de tests completo con 20+ casos de prueba
- Tests que validen la lógica de matching
- Cobertura del 100% de métodos críticos
- Tests que pasen y validen la funcionalidad correcta
- Mocks apropiados para evitar dependencias externas

¿Puedes crear estos tests siguiendo estas especificaciones?

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**
Continuamos con la sección del Modelo de Datos.

A partir de la documentación del sistema, se debe representar el modelo de datos utilizando sintaxis Mermaid, incorporando todos los parámetros que ofrece este lenguaje para reflejar con máximo detalle la estructura y relaciones entre entidades.

El diagrama debe incluir:
	•	Nombres de entidades.
	•	Atributos por entidad con su tipo de dato.
	•	Indicadores de claves primarias (PK) y claves foráneas (FK).
	•	Relaciones entre tablas con cardinalidades claras (1--*, 1--1, *--*).
	•	Restricciones relevantes (NOT NULL, UNIQUE, etc.).

El objetivo es ofrecer una representación completa y legible de la estructura relacional del sistema, útil tanto para desarrollo como para validación de integridad de datos.

no realices ningun cambio aun vamos a analizar primero y despues avanzamos paso a paso

**Prompt 2:**
te puedes basar en algo como arb&b para los atributos tambien hacen falta cosas como amenidades, hay que agregar todo lo que pueda ser relevante para el sistema

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**
muy bien en base a nuestra documentacion y nuestro backend @readme.md  @backend/ necesito que me ayudes con el punto que te indico, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

**Prompt 2:**
analiza mejor nustro @backend ya que siento que falta mas informacion y mas detalle en los endopoints que acabas de describir

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**
Quiero que actúes como un analista de producto.
En base a nuestra documentación, flujos y casos de uso:
 1.	Redacta 5 historias de usuario siguiendo el formato recomendado:
	- Como [rol], quiero [objetivo] para [beneficio].
 2.	Selecciona las 3 historias de usuario principales que fueron más relevantes durante el desarrollo.
 3.	Documenta estas 3 historias principales de manera más detallada, incluyendo:
	- Rol del usuario.
	- Objetivo.
	- Beneficio esperado.
	- Criterios de aceptación (en formato claro y verificable).
	- Dependencias o notas relevantes.

Aplica buenas prácticas de producto:
- Mantén las historias simples y enfocadas en el valor para el usuario.
- Evita tecnicismos excesivos, enfócate en la experiencia del usuario final.
- Asegúrate de que los criterios de aceptación sean medibles.

**Prompt 2:**

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**
Quiero que actúes como un documentador técnico experto en desarrollo de software.
Tienes acceso a la documentación en el archivo @readme.md.

Tu tarea es:
	1.	Seleccionar tres tickets de trabajo principales del proyecto:
	 - Uno relacionado con backend.
	 - Uno relacionado con frontend.
	 - Uno relacionado con base de datos.
	2.	Documentar cada ticket de manera completa, clara y estructurada, incluyendo:
	 - Título del ticket.
	 - Descripción general del problema o necesidad.
	 - Objetivo del ticket.
	 - Alcance y entregables esperados.
	 - Pasos de desarrollo de inicio a fin (incluyendo buenas prácticas de programación y arquitectura).
	 - Requisitos técnicos (lenguajes, frameworks, dependencias, configuraciones).
	 - Criterios de aceptación (cómo saber que está terminado).
	 - Riesgos o dependencias a considerar.
	 - Ejemplo de implementación (fragmentos de código o pseudocódigo si es necesario).
	3.	Asegúrate de que el estilo de la documentación sea profesional, claro y fácil de seguir, siguiendo buenas prácticas de documentación técnica.

	vamos por partes, primero empecemos con el backend

**Prompt 2:**
	avanza con el frontend

**Prompt 3:**
	avanza con el el de la base de datos

---

### 7. Pull Requests

**Prompt 1:**
Quiero que actúes como un documentador técnico experto en control de versiones y flujos de trabajo con Git/GitHub.
Tu tarea es documentar 3 pull requests que se han hecho desde la rama dev hacia la rama main.

Para cada pull request, documenta con la siguiente estructura:
	1.	Título del PR (descriptivo y conciso).
	2.	Descripción general (qué cambios introduce y por qué son necesarios).
	3.	Alcance de los cambios (qué módulos, componentes o servicios se ven afectados).
	4.	Detalle de modificaciones técnicas (resumen de commits, funciones, clases o archivos modificados).
	5.	Buenas prácticas aplicadas (ejemplo: uso de clean code, patrones de diseño, validación de datos, etc.).
	6.	Impacto en el proyecto (mejoras que aporta y riesgos potenciales).
	7.	Revisiones o pruebas realizadas (tests unitarios, integraciones, QA, etc.).
	8.	Checklist de aprobación (condiciones que deben cumplirse para aceptar el PR).
	9.	Notas adicionales o dependencias (si afecta a otros PR, servicios o librerías externas).

El estilo de la documentación debe ser:
	•	Claro y profesional.
	•	Orientado a desarrolladores y revisores.
	•	Siguiendo buenas prácticas de documentación en equipos de desarrollo colaborativos.

vamos por pasos 1 pull request ala vez para documentar

**Prompt 2:**
vamos con el segundo pull request

**Prompt 3:**
vamos con el tercer pull request
