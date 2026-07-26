## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
jesus Fredy Vizcarra Garcia

### **0.2. Nombre del proyecto:**
Lexio

### **0.3. Descripción breve del proyecto:**
Lexio es tu diccionario personal inteligente. Guarda cualquier palabra o frase que encuentres en películas, libros o videos, y la convierte en una tarjeta con imagen, definición y contexto. Con ejercicios diarios generados por IA y un sistema de rachas, Lexio transforma esos momentos de "¿qué significa esto?" en vocabulario que realmente se queda contigo.
### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

Lexio es una aplicación móvil de vocabulario personalizado diseñada para hispanohablantes con un nivel intermedio o superior de inglés. Resuelve un problema cotidiano: cuando un usuario encuentra una palabra desconocida en una película, libro, video o cualquier contexto del día a día, la busca en el navegador o en un traductor y la olvida en cuestión de semanas.
Lexio captura esa palabra, construye una tarjeta visual con una definición generada por IA (editable por el usuario) y una imagen sugerida, y la convierte en aprendizaje activo mediante ejercicios diarios generados con inteligencia artificial. El valor no está solo en saber qué significa una palabra, sino en recordarla de verdad.


### **1.2. Características y funcionalidades principales:**

1. Captura inteligente de palabras
El usuario escribe cualquier palabra o frase en inglés y la app genera automáticamente una definición en español mediante IA. El usuario puede editar la definición para agregar contexto personal, haciendo cada tarjeta única.
2. Tarjetas visuales
Cada palabra obtiene una tarjeta visual con una imagen sugerida automáticamente (vía API de imágenes), la palabra y su definición. El usuario elige la imagen que mejor representa la palabra para él.
3. Diccionario de vocabulario personal
Cada usuario tiene su propia colección de palabras almacenada en la nube, accesible desde cualquier dispositivo tras iniciar sesión.
4. Ejercicios diarios generados con IA
La app genera dos tipos de ejercicios diarios basados en el vocabulario propio del usuario: identificación por imágenes (relacionar la imagen con la palabra) y quiz de opción múltiple generado con IA.
5. Sistema de rachas
Los usuarios construyen una racha diaria completando sus ejercicios. Perder un día reinicia la racha, fomentando la constancia y la formación de hábitos.
6. Autenticación de usuarios
Registro e inicio de sesión seguros para que el diccionario de cada usuario sea privado y persistente.


### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

---

**Historia de Usuario 1 — Captura de vocabulario** `LEX-7`

**Como** estudiante de inglés,  
**quiero** escribir una palabra o frase en inglés para que la app genere automáticamente una definición con IA y me sugiera imágenes,  
**para** guardar esa palabra con contexto visual y significado en mi diccionario personal.

*Criterios de aceptación principales:*
- Dado que escribo "serendipity" y pulso "Generate", cuando la app responde, entonces veo la definición generada por IA y al menos 3 imágenes sugeridas de Unsplash.
- Dado que el campo de término está vacío, cuando pulso "Generate", entonces veo el mensaje "Please enter a word or phrase" y no se realiza ninguna llamada al backend.
- Dado que "serendipity" ya existe en mi diccionario, cuando intento añadirla de nuevo, entonces la app lo detecta (normaliza el término) y me ofrece editar la tarjeta existente.

---

**Historia de Usuario 2 — Sesión diaria de práctica** `LEX-12`

**Como** estudiante de inglés,  
**quiero** iniciar una sesión diaria de 10 ejercicios basados en mi propio vocabulario,  
**para** practicar las palabras que yo he capturado en contextos reales y reforzar su retención.

*Criterios de aceptación principales:*
- Dado que tengo 6 tarjetas guardadas, cuando pulso "Practice Today", entonces el backend genera una sesión con exactamente 10 ejercicios usando palabras aleatorias de mi diccionario.
- Dado que tengo 3 o menos palabras, cuando accedo a la pantalla principal, entonces el botón de práctica está desactivado y veo "Add at least 1 more word to start practicing".
- Dado que ya completé la sesión de hoy, cuando intento iniciar otra, entonces veo "You've already completed today's practice. Come back tomorrow!".

---

**Historia de Usuario 3 — Resultados de sesión y racha** `LEX-15`

**Como** estudiante de inglés,  
**quiero** ver un resumen al terminar mis 10 ejercicios con mis aciertos y mi racha actualizada,  
**para** sentir recompensa por el esfuerzo diario y mantener el hábito de estudio.

*Criterios de aceptación principales:*
- Dado que completé los 10 ejercicios, cuando termina el último, entonces veo una pantalla de resumen con mi puntuación (ej. "8/10 correct") y mi racha actualizada.
- Dado que es mi primer día con sesión completada, cuando termino los 10 ejercicios, entonces mi racha pasa de 0 a 1.
- Dado que completé la sesión, cuando regreso a la pantalla principal, entonces el botón muestra "Completed ✓" y no puedo iniciar otra sesión hasta el día siguiente.

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

---

**Ticket 1 — Base de datos** `DB-01`

**Diseño e implementación de colecciones Firestore, índices y Security Rules**

Crear la estructura de datos en Cloud Firestore para las colecciones `wordCards`, `dailySessions`, `streaks` y `users`. Incluye el esquema de documentos, índices compuestos para consultas críticas (`userId + normalizedTerm`, `userId + sessionDate`) y Security Rules que garantizan que cada usuario solo accede a sus propios datos.

*Tareas principales:* definir esquemas JSON de cada colección · crear `firestore.indexes.json` · implementar `firestore.rules` con reglas por `userId` · desplegar con `firebase deploy --only firestore` · script de seed para desarrollo.

*Criterio de done:* reglas desplegadas en Firebase, índices en estado READY, tests de acceso cruzado entre usuarios fallando correctamente.

---

**Ticket 2 — Backend** `BE-01`

**Implementar endpoint `POST /words` — captura de vocabulario con IA e imágenes**

Endpoint del BFF Express que orquesta: validación de entrada + normalización del término + verificación de unicidad en Firestore + llamada a Claude para generar la definición (ES/EN) + llamada a Unsplash para sugerir imágenes + persistencia del borrador en Firestore. Devuelve la tarjeta creada y las imágenes sugeridas al cliente.

*Tareas principales:* `WordController` → `WordService` → `WordRepository` · `AIService.generateDefinition()` con Claude Haiku · `ImageService.searchImages()` con Unsplash API · manejo de errores `400/401/409/500` · tests unitarios con mocks + tests de integración con Supertest y Firestore emulator.

*Criterio de done:* endpoint responde 201 con definición e imágenes, gestiona duplicados con 409, todos los tests pasan.

---

**Ticket 3 — Frontend** `FE-01`

**Implementar pantalla "Add Word" — flujo completo de captura de vocabulario**

Pantalla React Native (Expo Router) con el flujo: input de término → selector de idioma (ES/EN) → botón Generate → loading → preview de definición editable → grid de imágenes Unsplash seleccionables → botón Save Card. Incluye todos los estados visuales (loading, error genérico, duplicado, sin imagen) y textos i18n en español e inglés.

*Tareas principales:* `AddWordScreen` con gestión de estado local · componente `ImagePickerGrid` reutilizable · función `handleGenerate` (POST /words) · función `handleSave` (PUT /words/:id) · claves i18n en `es.json` y `en.json` · tests de componente con React Native Testing Library.

*Criterio de done:* flujo completo funcional en Expo Go (captura → guardar → ver en diccionario), textos bilingües, tests pasan.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

Documentación completa en [7-pull-requests.md](./7-pull-requests.md).

---

**Pull Request 1 — Entrega 1: Documentación y planificación** `feature-entrega1-jfvg` → `main`

PR de la primera entrega con toda la planificación del producto Lexio: Master PRD, arquitectura del sistema, modelo de datos Firestore, especificaciones OpenAPI, historias de usuario (LEX-7, LEX-12, LEX-15), tickets de trabajo (DB-01, BE-01, FE-01) y registro de prompts.

*Archivos principales:* `master-prd.md`, `1-descripcion-general-del-producto.md`, `2-arquitectura-del-sistema.md`, `3-modelo-de-datos.md`, `4-especificaciones-de-la-api.md`, `5-historias-de-usuario.md`, `6-tickets-de-trabajo.md`

*Estado:* ✅ Merged · Commit: `f3761df`

---

**Pull Request 2 — Entrega 2: MVP completo Backend + Mobile** `feature-entrega2-jfvg` → `main`

Implementación del MVP de extremo a extremo: backend Express + TypeScript con Claude Haiku 4.5 y Unsplash, app móvil React Native + Expo (auth, captura de vocabulario, práctica diaria, racha, i18n ES/EN), Firebase (rules + índices), 29 tests unitarios y documentación de despliegue/testing.

*Archivos principales:* `backend/`, `mobile/`, `firestore.rules`, `firestore.indexes.json`, `7-desarrollo.md`, `DEPLOYMENT.md`, `TESTING.md`, `MUESTRA_DEL_PRODUCTO.md`

*Flujo E2E verificado:* Captura de palabra → Sesión diaria (10 ejercicios) → Resultados + racha

*Estado:* 🔄 Entrega final

---

**Pull Request 3 — Hotfix: Modelo Claude e índices Firestore** `hotfix/claude-model-and-indexes`

Corrección de errores críticos detectados en pruebas E2E: actualización del modelo deprecado `claude-3-5-haiku-20241022` → `claude-haiku-4-5`, y despliegue de índices compuestos Firestore para consultas de sesiones y palabras.

*Archivos modificados:* `backend/src/integrations/claudeClient.ts`, `firestore.indexes.json`

*Estado:* ✅ Integrado en rama de desarrollo

