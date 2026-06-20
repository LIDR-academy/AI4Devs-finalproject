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
Rol: Actúa como un Senior Product Manager con especialidad en aplicaciones de EdTech (tecnología educativa) y aprendizaje de idiomas.
Objetivo: Ayúdame a definir el Master PRD y la visión inicial para un nuevo producto llamado "Lexio".
Descripción del Proyecto: Es una aplicación móvil diseñada para estudiantes de inglés. El problema que resuelve es que los usuarios olvidan las palabras nuevas que encuentran en videos, libros o películas. La app permitirá capturar estas palabras en el momento y guardarlas con su contexto real.
Especificaciones clave:
Captura de Contexto: El usuario introduce la palabra y la app guarda automáticamente (o permite añadir) una imagen descriptiva, una descripción y la frase original donde se encontró.
Base de Datos: Cada usuario tiene su propio set de palabras guardadas.
Práctica con IA: La app generará ejercicios diarios personalizados utilizando IA, basándose exclusivamente en las palabras que el usuario ha recolectado.
Gamificación: Incluirá sistemas de "racha" (streaks) y recordatorios para fomentar el hábito diario.
Restricciones Técnicas Iniciales:
El MVP debe centrarse en un flujo E2E prioritario: Captura de palabra -> Generación de ejercicio -> Validación de aprendizaje
.
Stack sugerido: React Native + Expo, Node.js + Express , Firebase para auth y  db y claude api para integración con APIs de LLM.
Antes de empezar, como product owner, pregúntame qué más necesitas saber para definir el proyecto

**Prompt 2:**
1. que el usuario realmente aprenda las palabras, no solo busque el significado en un navegador y despues se olvida.
2.Cualquier persona interesada en mejorar su vocabulario en ingles.
3.las dos
4.racha media
5.solo entrada manual palabra o frase.
6.la palabra o frase inicial es pbligatoria, la descripcion la puede sugerir la ai pero el user la puede modificar.
7.API de imágenes (Unsplash)
8.que el user seleccione si lo quiere en espa;ol o en ingles
9.una tarjeta por palabra
10. marcada manualmente por el usuario.
11.los dos
12.10 para que sea rapido
13.aliatorias
14.bloqueo hasta tener mas de 3 palabras
15.un ejerciocio al dia basta
16.sin recordatorios
17.solo racha
18.no
19.por el momento solo sera de muestra no pongas limite
20.solo es academico
21.con expo
22.bilingue
23.solo con conexion
24.email y pass
25.para esta version omitamos esto
26.para esta version omitamos esto
27.cualquier palabra que el usuario elija
28.google translate
29.Contexto real + IA + hábito diario
30.solo full-stack
31.si prd
32.No, solo busco que sea claro

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Actua como Arquitecto de software sr,
Genera un Diagrama de arquitectura, en mermaid.
Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

---

### 3. Modelo de Datos

**Prompt 1:**
Ahora en @3-modelo-de-datos.md de acuerdo a @readme.md (98-108) 
puedes generar el diagrama y toda la informacion correspondiente

---

### 4. Especificación de la API

**Prompt 1:**
Ahora en @4-especificaciones-de-la-api.md de acuerdo a @readme.md (111-113) podrias ayudarme

---

### 5. Historias de Usuario

**Prompt 1:**

Rol: Actúa como un Senior Product Owner experto en metodologías ágiles y Spec-Driven Development.
Contexto: Usa como referencia mi @master-prd.md @1-descripcion-general-del-producto.md @2-arquitectura-del-sistema.md @3-modelo-de-datos.md @4-especificaciones-de-la-api.md 
Tarea: Genera un conjunto de User Stories para el flujo de [NOMBRE DEL FLUJO, ej: Captura de palabras y generación de ejercicios].
Requisitos de las historias:
Calidad INVEST: Cada historia debe ser Independiente, Negociable, Valiosa, Estimable, Pequeña (Small) y Testeable
.
Formato Estándar: "Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]"
.
Criterios de Aceptación (AC): Redacta de 3 a 5 escenarios por historia en formato BDD (Given/When/Then)
.
Acción con MCP: Una vez redactadas y que yo las apruebe, utiliza el MCP de Jira para:
Crearlas en el proyecto [NOMBRE_DEL_PROYECTO_EN_JIRA].
Crea Epicas necesarias donde separes bien las user story
Incluir los Criterios de Aceptación detallados en la descripción del ticket.

si tienes alguna duda, preguntame antes de hacerlo

---

### 6. Tickets de Trabajo

"A partir de las historias de usuario creadas, crea los tickets de trabajo en un nuevo documento según estas especificaciones:

@readme.md (162-171) 
> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto."
A;ade a @6-tickets-de-trabajo.md 

---

### 7. Pull Requests

Rol: DevOps Engineer con experiencia en Git workflows y proyectos mobile full-stack.

Objetivo: Documenta 3 Pull Requests representativas del proyecto Lexio.

Contexto del proyecto:
- Monorepo con backend/ (Node.js + Express + TypeScript + Firebase Admin) y mobile/ (React Native + Expo SDK 56 + expo-router)
- Rama de desarrollo: feature-entrega2-jfvg → main
- Flujo E2E implementado: Captura de vocabulario → Sesión diaria con IA → Racha

Define para cada PR:
- Título y rama de origen/destino
- Descripción de los cambios incluidos
- Archivos modificados más relevantes
- Tipo de cambio (feature / bugfix / docs)
- Checklist de testing y calidad (TypeScript sin errores, flujo E2E verificado, reglas Firestore desplegadas)
- Problemas encontrados y cómo se resolvieron

Las 3 PRs deben cubrir:
1. Entrega 1: documentación y planificación (feature-entrega1-jfvg → main)
2. Entrega 2: implementación completa backend + mobile MVP (feature-entrega2-jfvg → main)
3. Hotfix: corrección del modelo Claude deprecado y despliegue de índices Firestore faltantes

Incluye también un template estándar de PR reutilizable para el proyecto.
Documenta en @7-pull-requests.md
