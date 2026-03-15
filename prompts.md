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
Toma el rol de un ingeniero informático senior. Quiero hacer un proyecto web con asistencia IA que ayude en todos los pasos del proceso. Desde el análisis y diseño inicial hasta el despliegue final. La temática ha de ser relacionada con deportes, me gustaría que la aplicación tuviera algún chat para preguntar a la IA. Dame opciones, de momento ideas a modo brainstorming.


**Prompt 2:**
De todas esas opciones me gusta mucho la opción 3, quiero una idea de negocio que hoy en día no esté extendida y que pueda dar algún beneficio futuro, dame más detalles acerca de esa opción y qué existe actualmente en el mercado.

**Prompt 3:**
Profundizando en esta idea, ¿cuál podría ser un MVP viable? La idea aquí sería tener ese producto mínimo para luego ir iterando y mejorando el proyecto en las diferentes áreas que lo compongan.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Necesito que tomes el rol de un arquitecto senior en software, dado el @Codebase , vamos a documentar la arquitectura del sistema, primero de todo, dime que estilos existen actualmente y cual casa mas con la idea de LIGENIA

**Prompt 2:**
Una vez que sabemos que vamos a seguir el modelo MVC, nombra las tecnologias involucradas en la arquitectura de LIGENIA

**Prompt 3:**
de cara a LIGENIA, cual de esos patrones crees que encaja mejor teniendo en cuenta rendimiento, robustez, escalabilidad y mantenibilidad de la plataforma?

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Usa este archivo como contexto de lo que te voy a ir pidiendo más adelante (vision general del proyecto.md), dime lo que has entendido resumido brevemente, no hagas nada más.

**Prompt 2:**
Muy bien, ahora toma el rol de un Product Manager, vamos a comenzar a esbozar el diseño del sistema, para ello comienza por generar el diagrama Lean Canvas para así entender mejor el modelo de negocio.

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Toma el rol de un experto analista en proyectos web. Antes de comenzar la fase de análisis y diseño de LIGENIA, busca qué competidores similares existen en la actualidad, con focalizarte en 3 es suficiente. Extrae los puntos fuertes y débiles de cada uno. En base a ello busca el valor añadido que supone LIGENIA como solución de cara a la fase de diseño posterior que haremos.

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Eres un ingeniero senior Devops, estamos estudiando como va a ser la infraestructura para LIGENIA, necesito que me respondas a las siguientes cuestiones:

1) Estrategia de testing y suite de tests a realizar (tests unitarios y de integracion) con las tecnologias involucradas para ello
2) Tecnologias involucradas en el pipeline a la hora integrar todo y desplegar en la nube:
   - Tests
   - Check de codigo/scan de seguridad
3) Diferencia entre el despliegue de la infraestructura en local al entorno de produccion dando detalle del mismo en cada caso
4) Estructura de directorio del proyecto LIGENIA
5) Guia de instalacion paso a paso para desplegar el proyecto en local y en la nube

**Prompt 2:**
ahora teniendo en cuenta todo @Codebase , haz las elecciones adecuadas en cada caso del punto anterior

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1: Implementación de middleware de autorización JWT**
```
Necesito implementar un middleware de autorización con JWT para Node.js (Express) que valide tokens, extraiga roles de usuario y aplique control de acceso basado en roles. El middleware debe:
1. Verificar la validez y expiración del token JWT
2. Extraer la información de usuario (id, role)
3. Rechazar peticiones a rutas protegidas si no hay token válido
4. Validar si el rol del usuario tiene permisos para acceder al recurso
5. Integrarse con Supabase como proveedor de autenticación

Por favor, proporciona el código completo con manejo de errores y casos borde.
```

**Prompt 2: Implementación de validación de datos de entrada**
```
Necesito crear validadores para la API de LIGENIA usando Zod que verifiquen y saniticen los datos de entrada. Específicamente necesito validadores para:
1. Creación/actualización de torneos
2. Registro de usuarios
3. Creación de partidos
4. Actualización de resultados

Cada validador debe prevenir inyecciones SQL, XSS y asegurar tipos correctos. Muestra también cómo integrar estos validadores como middlewares en rutas Express.
```

**Prompt 3: Configuración de seguridad para producción**
```
Necesito configurar medidas de seguridad adicionales para el despliegue en producción de mi API Node.js/Express:
1. Configuración de Helmet para encabezados de seguridad
2. Implementación de rate limiting para prevenir ataques de fuerza bruta
3. Configuración de CORS para permitir solo orígenes específicos
4. Sanitización de parámetros de consulta y cuerpo de peticiones
5. Configuración de timeouts de conexión
6. Prevención de exposición de información sensible en errores

Proporciona el código completo para implementar estas medidas.
```

### **2.6. Tests**

**Prompt 1: Tests unitarios para servicios de la aplicación**
```
Necesito implementar tests unitarios con Jest para los siguientes servicios de LIGENIA:
1. TournamentService (creación, actualización, consulta de torneos)
2. MatchService (registro de partidos, actualización de resultados)
3. StatisticsService (cálculo de estadísticas de jugador)
4. RankingService (generación de rankings)

Para cada servicio, necesito tests que:
- Cubran casos exitosos y de error
- Utilicen mocks para dependencias externas
- Verifiquen que se lancen las excepciones correctas
- Confirmen que los datos se formatean según lo esperado

Proporciona el código completo para estos tests incluyendo configuración de Jest.
```

**Prompt 2: Tests de integración para endpoints de la API**
```
Necesito implementar tests de integración para los siguientes endpoints de la API de LIGENIA:
1. POST /api/tournaments (creación de torneo)
2. POST /api/tournaments/:id/register (registro en torneo)
3. GET /api/rankings (obtención de rankings)
4. POST /api/matches (creación de partido)
5. PATCH /api/matches/:id/score (actualización de resultado)

Cada test debe:
- Configurar un entorno de test con una base de datos de prueba
- Crear datos iniciales necesarios
- Realizar la petición HTTP al endpoint
- Verificar la respuesta y los cambios en la base de datos
- Limpiar los datos después de cada test

Usa supertest con Jest y proporciona el código completo.
```

**Prompt 3: Configuración de pruebas automatizadas en CI/CD**
```
Necesito configurar pruebas automatizadas en un pipeline de CI/CD para LIGENIA, usando GitHub Actions. El workflow debe:
1. Configurar un entorno Node.js y PostgreSQL para pruebas
2. Ejecutar migraciones de Prisma en una base de datos de prueba
3. Ejecutar pruebas unitarias
4. Ejecutar pruebas de integración
5. Realizar análisis de cobertura de código
6. Fallar si la cobertura está por debajo del 80%
7. Correr pruebas end-to-end con Cypress (opcional)

Proporciona el archivo de configuración completo de GitHub Actions y cualquier script adicional necesario para configurar el entorno de prueba.
```

---

### 3. Modelo de Datos

**Prompt 1:**
Ahora toma el rol de nuevo de analista experto en software. Vamos a comenzar con la fase de diseño, comienza a diagnosticar los diferentes casos de uso más relevantes de cara a este MVP, genera tanto en formato texto como gráficamente en un diagrama.

**Prompt 2:**
vamos a comenzar con la base de datos, teniendo en cuenta que queremos usar PostgreSQL, haz un primer boceto, genera un diagrama de clases en formato plantUML, usa el contexto del proyecto para ello

**Prompt 3:**
que optimizaciones se pueden hacer a esta base de datos? buscamos:

- normalizar la base de datos
- recomendaciones de indices adecuados de cara a tener en cuenta aquellas queries que mas se vayan a utilizar mejorando asi el rendimiento de las mismas y de la aplicacion
- sugerencias de mas optimizaciones

---

### 4. Especificación de la API

**Prompt 1:**
Dado el @Codebase actual del proyecto que es solo documentación del proyecto, toma el rol como arquitecto de software experto. Necesito que te centres en el diseño del sistema, queremos diseñar lo siguiente:
1) diseño de la base de datos
2) diseño de la interfaz de usuario
3) especificación de servicios y APIs necesarios (endpoints, métodos HTTP y formatos de respuesta)
Antes que hagas nada, quiero estudies el contexto del proyecto y me digas si lo tienes claro, luego iremos paso a paso según te diga.

**Prompt 2:**
ahora vamos a centrarnos en el punto 2: Especificación de Servicios y APIs, diseña los servicios del sistema y genera un diagrama de componentes que escenifique la interaccion de los modulos del sistema

**Prompt 3:**
ten en cuenta que el servicio de autenticacon vamos a aprovechar el modulo que viene incorporado en Supabase

---

### 5. Historias de Usuario

**Prompt 1:**
Dado el documento de análisis que te indico como contexto, toma el rol de un analista experto, necesito que identifiques las historias de usuario del sistema, siguiendo el siguiente formato...

**Prompt 2:**
No quiero que tengas en cuenta los casos del inicio de sesión ni registro de usuarios en las historias de usuario, profundiza más en otras historias de usuario dentro de la propia plataforma.

**Prompt 3:**
Ahora necesito que consideres el backlog de producto creado anteriormente acorde a las historias de usuario identificadas, estima por cada ítem en el backlog...

---

### 6. Tickets de Trabajo

**Prompt 1:**
Utiliza alguna técnica de priorización del backlog, puedes usar la más conveniente según el contexto del proyecto, RICE podría ser una opción...

**Prompt 2:**
Ahora como experto de planificador de proyectos, debes generar los tickets de trabajo asociados al backlog anterior priorizado...

**Prompt 3:**
Eres un experto planificador de proyectos, toma como referencia el documento @backlog.md , teniendo en cuenta @analisis del proyecto.md y @vision general del proyecto.md , mejora el backlog:

- Añade un titulo al documento que sea "Backlog del proyecto"
- Añade una pequeña introduccion como apartado
- Añade una tabla de contenidos
- Mejora las historias de usuarios siguiendo el mismo formato, faltan historias de usuario relativo al chatbot IA
- Añade un apartado que sea la priorizacion de las user stories que identifiques siguiendo alguna tecnica representativa (RICE es una buena opcion)
- En base a esa priorizacion, identifica al menos 10 tickets de trabajo siguiendo el formato que ves ahi

---

### 7. Pull Requests

```
