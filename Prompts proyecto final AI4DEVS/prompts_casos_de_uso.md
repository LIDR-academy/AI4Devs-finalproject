# Prompt 1 (Claude Opus 4.5): Redacción de Documentación Entregable - TFG Salmantour

## Rol y Expertise

Eres un **redactor técnico senior y experto en documentación de proyectos de software** con experiencia en:
- Redacción de memorias y anexos de Trabajos de Fin de Grado (TFG)
- Documentación técnica de aplicaciones móviles
- Especificaciones de sistemas, análisis y diseño de software
- Metodologías ágiles (Scrum) y planificación de proyectos
- Casos de uso, historias de usuario y requisitos funcionales
- Arquitectura de software y patrones de diseño

Tu misión es **comprender completamente el proyecto Salmantour** para posteriormente **redactar toda la documentación entregable del TFG** con calidad profesional y académica.

---

## Proyecto: Salmantour

**Salmantour** es una aplicación móvil gamificada desarrollada como Trabajo de Fin de Grado. Su objetivo es motivar a estudiantes universitarios a descubrir lugares de interés en Salamanca mediante un sistema de recolección de medallas geolocalizadas con documentación fotográfica.

### Stack Tecnológico
| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React Native, Expo SDK 53, TypeScript, Expo Router, Zustand |
| **Backend** | Supabase (Auth + PostgreSQL + Storage), Row Level Security |
| **Servicios** | Google Maps API, expo-location, expo-camera |

### Estado del Proyecto
✅ **Desarrollo 100% completado** (6 Sprints finalizados)  
✅ **Código auditado y optimizado** (tests unitarios implementados)  
✅ **Documentación técnica completa**  
⏳ **Pendiente:** Redacción de documentación entregable del TFG

---

## Tu Misión

### Objetivo General
Convertirte en **EXPERTO ABSOLUTO** del proyecto Salmantour para poder redactar la documentación entregable del TFG con total conocimiento del sistema, su desarrollo y su funcionamiento.

### Documentos a Redactar (en fases posteriores)
1. **Memoria del TFG** - Documento principal de la entrega
2. **Anexo I** - Especificaciones del sistema
3. **Anexo II** - Análisis y diseño del sistema
4. **Anexo III** - Estimación del tamaño y esfuerzo
5. **Anexo IV** - Plan de seguridad
6. **Anexo V** - Manual de usuario

---

## Documentación del Proyecto a Analizar

### Documentación Principal (`docs/`)
| Archivo | Contenido |
|---------|-----------|
| `ARCHITECTURE.md` | Arquitectura completa del sistema |
| `DEVELOPMENT.md` | Guía de desarrollo y configuración |
| `DEPLOYMENT.md` | Proceso de despliegue |
| `USER_STORIES.md` | Todas las historias de usuario (23 US) |
| `SETUP.md` | Configuración del entorno |

### Documentación de Sprints (`docs/sprint_tasks/`)
| Archivo | Contenido |
|---------|-----------|
| `SPRINT_1_TASKS.md` | Autenticación y Base de Datos |
| `SPRINT_2_TASKS.md` | Mapa y Geolocalización |
| `SPRINT_3_TASKS.md` | Sistema de Medallas y Proximidad |
| `SPRINT_4_TASKS.md` | Cámara, Fotos y Perfil |
| `SPRINT_5_TASKS.md` | Galería y Favoritos |
| `SPRINT_6_TASKS.md` | Sistema Social Completo |

### Documentación Frontend (`frontend/docs/`)
| Archivo | Contenido |
|---------|-----------|
| `COMPONENTS.md` | Catálogo de componentes |
| `HOOKS.md` | Documentación de hooks |
| `NAVIGATION.md` | Sistema de navegación |
| `STYLING.md` | Guía de estilos |

### Documentación Backend (`backend/docs/`)
| Archivo | Contenido |
|---------|-----------|
| `API.md` | Documentación de servicios |
| `DATABASE.md` | Esquema de base de datos |
| `DEPLOYMENT.md` | Despliegue del backend |

### Esquema de Base de Datos
- `backend/supabase/migrations/001_initial_schema.sql`

---

## Recursos Adicionales (para fases posteriores)

Cuando te pida redactar cada documento entregable, contarás con:

1. **Guías de formato** (`docs/context/guias/`)
   - Instrucciones específicas de cómo desarrollar cada Anexo y la Memoria

2. **Informe de Planteamiento** (`Informe Planteamiento Salmantour.md`)
   - Planteamiento inicial del proyecto muy detallado
   - Útil para introducción (parte de finalidad del proyecto) y conclusiones de la Memoria

3. **Informes de referencia** (de un compañero)
   - Ejemplos de Anexos y Memoria de otro TFG
   - Sirven como guía de estructura (no de contenido, su proyecto es diferente)

---

## Instrucciones de Formato para Documentos

Cuando redactes los documentos entregables:

1. **Formato:** Markdown en archivos de `docs/context/entrega/`
2. **Parseo:** El markdown se convertirá posteriormente a Google Docs para ajustes finales
3. **Portadas:** Yo las añadiré manualmente en Docs
4. **Imágenes/Diagramas/Capturas:** 
   - Deja una nota clara indicando qué imagen va en cada lugar
   - Formato: `[IMAGEN: Descripción de qué imagen incluir aquí]`
   - Yo sustituiré las notas por las imágenes reales (o los diagramas a incluir)

---

## Instrucciones - Paso 1: Comprensión Total

**No redactes ningún documento todavía.**

Tu primera tarea es realizar un **análisis exhaustivo** de toda la documentación del proyecto para convertirte en experto absoluto de Salmantour.

### Qué debes analizar

1. **Toda la documentación técnica** listada arriba
2. **El código fuente** si necesitas aclaraciones (estructura en `frontend/src/`)
3. **Las User Stories** para entender todas las funcionalidades
4. **Los Sprint Tasks** para entender el proceso de desarrollo

### Entregable Requerido

Genera un **informe de comprensión completa** que incluya:

#### 1. Resumen Ejecutivo del Proyecto
- Descripción completa de Salmantour
- Objetivos y finalidad
- Público objetivo
- Propuesta de valor única

#### 2. Resumen de Arquitectura y Tecnologías
- Stack tecnológico y justificación
- Arquitectura del sistema (capas, flujos)
- Patrones de diseño utilizados
- Integraciones externas (Supabase, Google Maps, etc.)

#### 3. Resumen de Funcionalidades
- Módulos principales del sistema
- Funcionalidades implementadas por módulo
- Flujos de usuario principales

#### 4. Resumen del Proceso de Desarrollo
- Metodología utilizada (Scrum)
- Planificación temporal (6 Sprints)
- Resumen de cada Sprint (objetivos, tareas, entregables)
- Historias de usuario implementadas

#### 5. Resumen de Medidas de Seguridad
- Autenticación y autorización
- Row Level Security en Supabase
- Protección de datos de usuario
- Validaciones implementadas

#### 6. Resumen de Base de Datos
- Modelo de datos (tablas principales)
- Relaciones entre entidades
- Políticas de seguridad

#### 7. Lista Completa de Casos de Uso

**IMPORTANTE:** Además del resumen, debes generar una **lista de TODOS los casos de uso** que consideres relevantes para la documentación.

Formato de la lista:
```
CU-XX: [Nombre del caso de uso]
- Actor principal: [Usuario/Sistema]
- Descripción breve: [1-2 líneas]
```

Esta lista la revisaré y confirmaré antes de que desarrolles los casos de uso completos. Incluye casos de uso para:
- Autenticación y gestión de cuenta
- Gestión de perfil
- Interacción con el mapa
- Sistema de medallas y desbloqueo
- Captura de fotos
- Gestión de favoritos
- Sistema social (amigos)
- Comparación de progreso

NO debes desarrollar los casos de uso ahora, únicamente necesito que definas la lista para revisar cuáles has decidido.

#### 8. Preguntas o Dudas
- Cualquier aspecto que necesites aclarar antes de comenzar la redacción

---

## Principios de Trabajo

- **Comprensión primero:** Entender TODO antes de redactar nada
- **Precisión:** La documentación debe reflejar exactamente lo implementado
- **Claridad:** Lenguaje claro y profesional, adecuado para evaluación académica
- **Completitud:** No omitir aspectos relevantes del sistema
- **Coherencia:** Mantener consistencia entre todos los documentos

---

# Prompt 2

Confirmo tu compresión total del proyecto, el informe realizado es correcto. La única corrección que hay es en el caso de uso 'CU-33', que tiene una confusión debido a una cosa que no está muy bien explicada en `USER_STORIES.md`. Ese caso de uso lo habías definido como "Navegar a medalla desde comparación", como aparece en la historia de usuario 'US-028 | Navegación contextual desde comparación al mapa', pero en verdad la opción de 'Ver en el mapa' la he implementado en todas las tarjetas de "detalle de medallas". Este caso de uso (navegar al mapa centrando la vista en una medalla desde una tarjeta de detalle de la medalla de otra vista), se puede hacer desde las tarjetas de la vista 'Progreso', 'Galería', 'Perfil del amigo' y 'Comparación'. He ajustado el nombre del Caso de Uso, también debería ajustar la descripción del User Story para no causar más confusiones. Tenlo en cuenta a la hora de desarrollar ese caso de uso, el resto están bien. Decide si recolocar este caso de uso en otro campo distinto a 'Social', o si dejarlo como el último caso de uso, sin relación con los demás porque engloba varias vistas de la app (afecta a todos los campos como tal). A continuación te detallo qué debes hacer en tu respuesta y te resuelvo las dudas que me has planteado.

## Tu tarea
- Antes de empezar, debes comprender el formato de los CU (en una tabla cada uno), el formato de los Objetivos del sistema, el formato de los Requisitos de información y el formato de la Definición de actores. Todos esos campos son importantes para tu tarea. Te he adjuntado 4 capturas de pantalla de las tablas ejemplo del archivo, para que veas como se tienen que realizar. No te fijes tanto en el contenido de las tablas, ese lo desarrollarás tú desde 0 como experto, de manera profesional y personalizada para nuestro proyecto específico. El archivo de ejemplo y las capturas sirven sobretodo como contexto extra del formato y los campos a desarrollar para cada cosa en `USE_CASES.md`.

- Para poder desarrollar de manera completa todos los casos de usos, necesitas desarrollar antes los 'Objetivos del sistema' (OBJ-XX) y, del apartado de los Requisitos del sistema, deberás tener desarrollados los 'Requisitos de información' (IRQ-XX) y la 'Definición de actores' (ACT-XX), antes de desarrollar los 'Requisitos funcionales (Casos de Uso)'. Deberás desarrollar todos estos apartados al inicio del archivo `USE_CASES.md`, antes de definir los Casos de Uso. Esto es importante porque los casos de uso necesitarán referenciarlos, así que tienen que estar bien definidos.

- Espera a que confirme que esos apartados están desarrollados de manera correcta. Por ahora céntrate en hacer esa parte. Cuando te confirme puedes continuar con el siguiente paso, desarrollar los casos de uso como te describo.

- Desarrolla todos los Casos de Uso (CU) que has definido. Hazlo en formato markdown, dentro del archivo `USE_CASES.md`.

### Campos de las tablas (cada caso de uso)
- **Version**: Siempre es 1.0
- **Autor**: Siempre es 'Pérez Vellarino, Tomás'
- **Fuentes**: Siempre es 'Hernández González, Guillermo'
- **Objetivos asociados**: Listado de los 'OBJ-XX' relacionados. Estos objetivos los deberás haber definido todos previamente.
- **Requisitos asociados**: Listado de los 'IRQ-xx' relacionados. Estos requisitos los deberás haber definido previamente. (Ojo en este campo, en el archivo de ejemplo hay un error. En vez de listar los IRQ relacionados, lista los CU relacionados. Asegúrate de poner los IRQ relacionados que hayas definido).
- **Descripción**: Descripción muy breve del Caso de Uso (sigue el formato de las tablas del ejemplo).
- **Precondición**: Mencionar un caso de precondición. Se puede mencionar un caso de uso anterior si este depende de uno anterior, si no se pone otra frase.
- **Secuencia normal**: Tiene los campos 'Paso' y 'Acción', que explican los pasos que ocurren para completarse el caso de uso. Cada caso de uso tendrá su número de pasos determinado para completarse.
- **Postcondición**: Frase de postcondición si la hay
- **Excepciones**: Campos 'Paso' y 'Acción' para explicar pasos alternativos a los descritos en 'Secuencia normal'. Por ejemplo, si en el Paso 3 de 'Secuencia normal' la Acción se describió como "El usuario confirma la acción", en este apartado de 'Excepciones' se indicará que hay una Acción "El usuario cancela la acción y el sistema vuelve al estado anterior" para el Paso 3, o el mensaje que se quiera poner.
- **Frecuencia Esperada**: Muy baja, Baja, Media, Alta o Muy alta (Normalmente 'Media' para la mayoría de cosas, pero no para todas).
- **Importancia**: Muy baja, Baja, Media, Alta o Muy alta.
- **Urgencia**: Muy baja, Baja, Media, Alta o Muy alta
- **Estado**: Siempre 'Verificado' (creo)
- **Estabilidad**: Normalmente 'Alta' o 'Muy alta'
- **Comentarios**: Siempre 'Ninguno'

## Respuestas a tus preguntas
### Sobre los Casos de Uso

1. La extensión es perfecta, me parece que has incluido todas las funcionalidades relevantes y la lista de UC no ha quedado larga. Como referencia, te voy a adjuntar un archivo del trabajo de un compañero en el que desarrolla 28 casos de uso. Esta es una cifra muy parecida a la nuestra (y nuestro proyecto es más complejo en cuanto a funcionalidades), así que es un planteamiento perfecto el que has hecho para los CU.

2. No, los casos de uso que has definido son exactamente los que necesitamos. El proceso de añadir las medallas a la database que hemos realizado mediante migraciones SQL en el SQL Editor de Supabase lo documentaremos en otras partes de la Memoria, no en los casos de uso.

3. Me parece bien dejar el CU-15 como está, con el Sistema como actor. Así tenemos un ejemplo de un caso diferente, en el que el actor es uno diferente a "usuario".

### Sobre la Documentación

4. Sí tengo preferencia sobre eso. NO incluyas fragmentos de código en la redacción de los informes. No se trata de un archivo de documentación típico markdown que se mete en 'docs' de un repositorio, es un archivo redactado para convertir a pdf que explica detalladamente todos los aspectos relevantes del desarrollo de este TFG. Para despejarte las dudas de cómo realizar cada archivo, te adjuntaré una guía y un archivo de ejemplo para que desarrolles el mío conociendo cada apartado a realizar.

5. Sí, sí que incluiremos un apartado inicial de "Análisis de riesgos y amenazas" para el Anexo IV cuando lo hagamos. De todos modos, no te preocupes de conocer qué apartados realizar para cada Anexo, en el prompt en el que te pida cada archivo seré muy detallado con lo que debes incluir en cada uno. Además, tendrás ejemplos claros que podrás consultar para conocer un índice de ejemplo a seguir.

6. El Manual de Usuario (Anexo V) incluirá capturas de TODAS las pantallas. En este archivo se explica brevemente cómo navegar por toda la aplicación, mostrando todas las vistas que el usuario puede visitar e interactuar.

### Sobre el Proyecto

7. Hay varios apartados principales de la Memoria que puedes completar con el contexto dado con ese informe, el archivo `Informe Planteamiento Salmantour.md` es muy completo. También puedes utilizar contexto extra de tu conocimiento del proyecto y lo detallado en los distintos archivos de documentación (los de carpetas `docs` y los `README.md`) para completar tu redacción. Para los otros apartados de la Memoria será necesaria información realizada en los Anexos, por lo que dejaremos el archivo de la Memoria para el final, después de haber desarrollado todos los demás.

8. No, está todo bien documentado y tienes el contexto suficiente para desarrollar bien todos los archivos de la entrega.

---

# Prompt 3 (A partir de aquí Claude Sonnet 4.5 por problemas con el Opus)

as realizado bien la mayoría de casos de uso, pero hay varios mal. En algunos te has equivocado y has desarrollado casos de uso distintos a los que hemos definido (por ejemplo, has añadido el CU de eliminar una medalla completada, cuando eso no lo puede hacer el usuario en la app). 

Sigue a rajatabla los CU que hemos definido para estos paquetes:
```
### 7.4 Casos de Uso del Sistema de Medallas y Desbloqueo

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-15 | Detectar proximidad a medalla | Sistema | El sistema detecta automáticamente cuando el usuario está a menos de 10 metros de un lugar |
| CU-16 | Capturar foto de medalla | Usuario autenticado | El usuario toma una foto del lugar para desbloquear la medalla (estando en proximidad) |
| CU-17 | Confirmar desbloqueo de medalla | Usuario autenticado | El usuario confirma la foto capturada y la medalla se registra como obtenida |
| CU-18 | Retomar foto de medalla | Usuario autenticado | El usuario actualiza la foto de una medalla ya obtenida al volver a estar cerca del lugar |
| CU-19 | Visualizar progreso general | Usuario autenticado | El usuario consulta su progreso global y por categorías en la pantalla de progreso |
| CU-20 | Visualizar colección de medallas | Usuario autenticado | El usuario revisa todas sus medallas (obtenidas y bloqueadas) con opciones de filtrado |

### 7.5 Casos de Uso de la Galería de Fotos

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-21 | Visualizar galería de fotos | Usuario autenticado | El usuario visualiza todas las fotos de sus medallas obtenidas en formato de cuadrícula |
| CU-22 | Ver detalle de foto | Usuario autenticado | El usuario expande una foto a pantalla completa con información del lugar y fecha |
```

Corrige los casos de uso que has hecho. Hazlos lo mejor posible, que se trata de uno de los documentos principales que se entregan con el TFG

---

# Prompt 4

Genial, has corregido los errores y has aumentado mucho la calidad de los CU. Termina este archivo con los casos de uso que faltan:
```
### 7.6 Casos de Uso del Sistema de Favoritos

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-23 | Marcar medalla como favorita | Usuario autenticado | El usuario marca una medalla como favorita para priorizarla |
| CU-24 | Desmarcar medalla como favorita | Usuario autenticado | El usuario elimina una medalla de sus favoritos |
| CU-25 | Filtrar por favoritos | Usuario autenticado | El usuario filtra las vistas para mostrar solo medallas favoritas |

### 7.7 Casos de Uso del Sistema Social

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-26 | Enviar solicitud de amistad | Usuario autenticado | El usuario busca a otro usuario por código de amistad y envía una solicitud |
| CU-27 | Aceptar solicitud de amistad | Usuario autenticado | El usuario acepta una solicitud de amistad pendiente |
| CU-28 | Rechazar solicitud de amistad | Usuario autenticado | El usuario rechaza una solicitud de amistad pendiente |
| CU-29 | Visualizar lista de amigos | Usuario autenticado | El usuario visualiza su lista de amigos con estadísticas básicas |
| CU-30 | Visualizar perfil de amigo | Usuario autenticado | El usuario consulta el perfil completo de un amigo con sus medallas y estadísticas |
| CU-31 | Comparar progreso con amigo | Usuario autenticado | El usuario compara sus medallas con las de un amigo viendo diferencias y coincidencias |
| CU-32 | Eliminar amigo | Usuario autenticado | El usuario elimina la relación de amistad con otro usuario |
```

Cuando termines, haz una revisión general del archivo `USE_CASES.md` entero y resiva si hay algo que arreglar o mejorar de cualquier parte del archivo

---

# Prompt 5

Has identificado correctamente el error del CU-08, que no corresponde con el que habíamos planteado inicialmente. De hecho, los 14 primeros Casos de Uso tienen algunas variaciones con respecto a los Casos de Uso que hemos planteado inicialmente.

# Tu objetivo
- Analiza los 14 primeros casos de uso y compáralos con los que hemos definido inicialmente. Debes actualizar/arreglar los casos de uso que estén mal desarrollados, para que sean los que hemos definido en nuestro índice.
- Cuando termines de dejar esos CU en su versión final, revisa el resto de CU para verificar si puedes mejorar alguno.
- Cuando confirmes que todos los Casos de Uso están en su mejor versión posible, revisa los Objetivos del Sistema, los Requisitos de Información y la Declaración de Actores. Detecta si todo está hecho de la mejor forma posible y profesional, o si puedes mejorar algunos aspectos.
- Al terminar confirma que el estado final del archivo `USE_CASE.md` es profesional y es el mejor que podemos desarrollar.

# Índice de Casos de Uso a seguir
## 7. Lista Completa de Casos de Uso Propuestos

A continuación se presenta la lista de **todos los casos de uso** que considero relevantes para la documentación del TFG. Esta lista está organizada por módulo funcional y debe ser revisada antes de desarrollar los casos de uso completos.

### 7.1 Casos de Gestión de usuarios

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-01 | Registrar nueva cuenta | Usuario no autenticado | El usuario crea una cuenta proporcionando email, username y contraseña, y recibe un email de verificación |
| CU-02 | Verificar email | Usuario no verificado | El usuario confirma su email mediante el enlace recibido para activar completamente su cuenta |
| CU-03 | Iniciar sesión | Usuario registrado | El usuario accede a la aplicación con sus credenciales (email y contraseña) |
| CU-04 | Cerrar sesión | Usuario autenticado | El usuario cierra su sesión de forma segura, eliminando datos de autenticación del dispositivo |
| CU-05 | Recuperar contraseña | Usuario registrado | El usuario solicita un enlace de recuperación de contraseña a su email |
| CU-06 | Visualizar perfil propio | Usuario autenticado | El usuario visualiza su información de perfil, código de amistad y estadísticas de progreso |
| CU-07 | Editar nombre de usuario | Usuario autenticado | El usuario modifica su nombre de usuario (validando unicidad) |
| CU-08 | Cambiar foto de perfil | Usuario autenticado | El usuario actualiza su avatar tomando una foto o seleccionando del dispositivo |
| CU-09 | Copiar código de amistad | Usuario autenticado | El usuario copia su código de amistad al portapapeles para compartirlo |

### 7.2 Casos de Uso de Gestión del Mapa

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-10 | Explorar mapa de lugares | Usuario autenticado | El usuario navega por el mapa interactivo visualizando los marcadores de lugares de interés |
| CU-11 | Visualizar información de lugar | Usuario autenticado | El usuario consulta información detallada de un lugar al tocar su marcador |
| CU-12 | Filtrar lugares por categoría | Usuario autenticado | El usuario filtra los marcadores del mapa por una o más categorías |
| CU-13 | Buscar lugar por nombre | Usuario autenticado | El usuario busca un lugar específico por su nombre y el mapa se centra en él |
| CU-14 | Centrar mapa en ubicación actual | Usuario autenticado | El usuario centra el mapa en su posición GPS actual |
| CU-33 | Navegar a medalla desde detalle de medalla | Usuario autenticado | El usuario navega directamente al mapa para ver la ubicación de una medalla |

### 7.3 Casos de Uso de Gestión de Medallas

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-15 | Detectar proximidad a medalla | Sistema | El sistema detecta automáticamente cuando el usuario está a menos de 10 metros de un lugar |
| CU-16 | Capturar foto de medalla | Usuario autenticado | El usuario toma una foto del lugar para desbloquear la medalla (estando en proximidad) |
| CU-17 | Confirmar desbloqueo de medalla | Usuario autenticado | El usuario confirma la foto capturada y la medalla se registra como obtenida |
| CU-18 | Retomar foto de medalla | Usuario autenticado | El usuario actualiza la foto de una medalla ya obtenida al volver a estar cerca del lugar |
| CU-19 | Visualizar progreso general | Usuario autenticado | El usuario consulta su progreso global y por categorías en la pantalla de progreso |
| CU-20 | Visualizar colección de medallas | Usuario autenticado | El usuario revisa todas sus medallas (obtenidas y bloqueadas) con opciones de filtrado |

### 7.4 Casos de Uso de Gestión de Galería

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-21 | Visualizar galería de fotos | Usuario autenticado | El usuario visualiza todas las fotos de sus medallas obtenidas en formato de cuadrícula |
| CU-22 | Ver detalle de foto | Usuario autenticado | El usuario expande una foto a pantalla completa con información del lugar y fecha |

### 7.5 Casos de Uso de Gestión de Favoritos

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-23 | Marcar medalla como favorita | Usuario autenticado | El usuario marca una medalla como favorita para priorizarla |
| CU-24 | Desmarcar medalla como favorita | Usuario autenticado | El usuario elimina una medalla de sus favoritos |
| CU-25 | Filtrar por favoritos | Usuario autenticado | El usuario filtra las vistas para mostrar solo medallas favoritas |

### 7.6 Casos de Uso de Gestión Social

| ID | Nombre | Actor | Descripción breve |
|----|--------|-------|-------------------|
| CU-26 | Enviar solicitud de amistad | Usuario autenticado | El usuario busca a otro usuario por código de amistad y envía una solicitud |
| CU-27 | Aceptar solicitud de amistad | Usuario autenticado | El usuario acepta una solicitud de amistad pendiente |
| CU-28 | Rechazar solicitud de amistad | Usuario autenticado | El usuario rechaza una solicitud de amistad pendiente |
| CU-29 | Visualizar lista de amigos | Usuario autenticado | El usuario visualiza su lista de amigos con estadísticas básicas |
| CU-30 | Visualizar perfil de amigo | Usuario autenticado | El usuario consulta el perfil completo de un amigo con sus medallas y estadísticas |
| CU-31 | Comparar progreso con amigo | Usuario autenticado | El usuario compara sus medallas con las de un amigo viendo diferencias y coincidencias |
| CU-32 | Eliminar amigo | Usuario autenticado | El usuario elimina la relación de amistad con otro usuario |

### 7.8 Resumen de Casos de Uso

| Módulo | Cantidad de CU |
|--------|----------------|
| Gestión de Usuarios | 9 |
| Gestión del Mapa | 8 |
| Gestión de Medallas | 6 |
| Gestión de Galería | 2 |
| Gestión de Favoritos | 3 |
| Gestión Social | 7 |
| **TOTAL** | **33** |