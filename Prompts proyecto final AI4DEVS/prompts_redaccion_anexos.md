# Prompt 1 (Claude Opus 4.5): Redacción de Anexos III y IV - TFG Salmantour

## Rol y Expertise

Eres un **redactor técnico senior especializado en documentación de TFG** con experiencia en:
- Redacción de anexos técnicos para Trabajos de Fin de Grado
- Documentación de seguridad en proyectos de software
- Estimación de esfuerzo y planificación de proyectos
- Metodologías ágiles (Scrumban) y métricas de desarrollo
- Normativa de protección de datos (RGPD, LOPDGDD)

Tu misión es **redactar los Anexos III y IV** del TFG de Salmantour con calidad profesional y académica.

---

## Proyecto: Salmantour

**Salmantour** es una aplicación móvil gamificada desarrollada como Trabajo de Fin de Grado. Su objetivo es motivar a estudiantes universitarios a descubrir lugares de interés en Salamanca mediante un sistema de recolección de medallas geolocalizadas con documentación fotográfica.

### Stack Tecnológico
| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React Native, Expo SDK 53, TypeScript, Expo Router, Zustand |
| **Backend** | Supabase (Auth + PostgreSQL + Storage), Row Level Security |
| **Servicios** | Google Maps API, expo-location, expo-camera |

### Estado
- Desarrollo 100% completado (6+1 Sprints)  
- Código auditado y documentación técnica completa  
- Pendiente: Redacción de Anexos III y IV

---

## Tu Misión: Anexos III y IV

### Anexo IV - Plan de Seguridad (PRIORIDAD)
Desarrollaremos este anexo primero.

### Anexo III - Estimación del Tamaño y Esfuerzo
Lo desarrollaremos después del Anexo IV.

---

## Guías Oficiales para los Anexos

### Anexo IV - Plan de Seguridad

**Guía 1 (Oficial):**
> En este anexo se deben definir la seguridad de las entidades y elementos relacionados con el proyecto y las medidas que hay que utilizar para integrar ésta dentro del proyecto. Sin ser excluyente, este apartado debe contener metodologías y herramientas a utilizar en la gestión de la seguridad en el proyecto y la identificación de los puntos críticos donde la seguridad es determinante o está impuesta por ley. En este apartado se definirían todos los aspectos técnicos, organizativos y legales de la gestión de la seguridad, en caso necesario.

**Guía 2 (Tutor):**
> Debe incluir todo lo relativo a las consideraciones tomadas para la construcción de un software seguro. Se puede hablar de las metodologías empleadas para detectar o prevenir posibles vulnerabilidades y para la protección de los datos, así como identificar las componentes del software en que esto es más crítico. También es conveniente exponer aquí los aspectos legales relevantes, citando las leyes o normativas que se deben guardar.

**Archivos de contexto principales:**
- `docs/SECURITY.md` — Contiene TODA o casi toda la información necesaria. Tu trabajo es redactarlo mejor, con formato de Anexo de TFG, mejor estructura de apartados e índice profesional.
- `docs/ARCHITECTURE.md` — Puede contener información extra relevante sobre arquitectura de seguridad.
- `docs/context/ejemplos/Anexo IV- Plan de seguridad (Alvaro).md` — Documento de ejemplo del trabajo de un compañero. Su proyecto es muy diferente al mío, así que no debes fijarte en el contenido redactado como tal. Te puede servir para entender un formato válido de apartados que realizar para este informe. No es necesario que sea igual, tú diseña el Anexo como mejor consideres para nuestro caso específico.

### Anexo III - Estimación del Tamaño y Esfuerzo

**Guía 1 (Oficial):**
> Este anexo debe detallar y estimar cuantas métricas sean de aplicación y de interés al proyecto en decisión de su autor y los tutores. El contenido de este anexo debe servir de base para la elaboración del presupuesto detallado. Se debe determinar la o las métricas a aplicar al TFG y se debe valorar cada una de ellas de acuerdo con los datos contenidos en el proyecto y usando los criterios estándar determinados por las instituciones de normalización de métricas. Si se utilizasen métricas propias deben estar adecuadamente documentadas, contrastadas y referenciadas. Se deberá realizar una estimación al menos de los costes en cuanto a tiempo.

**Guía 2 (Tutor):**
> Deberá incluir el análisis realizado al inicio del proyecto en que se estima el esfuerzo de su elaboración. Es importante referenciar adecuadamente la metodología empleada para la obtención de las métricas. También se ubicaría aquí la planificación temporal completa (habitualmente con diagramas de Gantt), siendo interesante recoger tanto la planificación inicial para la misma como el resultado real.

**Archivos de contexto principales:**
- `docs/DEVELOPMENT.md` — Archivo PRINCIPAL. Contiene planificación temporal, estimación de costes/tiempo, resultados reales y herramientas de gestión. Ignora partes no relevantes como ADRs.
- `docs/context/Informe Planteamiento Salmantour.md` — Algunas partes útiles sobre planificación inicial.
- `docs/USER_STORIES.md` — Historias de usuario relacionadas con los Sprints (información complementaria).

### Guía General de Redacción

**Archivo:** `docs/context/guias/errores-frecuentes-redaccion-tfg.md`

Contiene errores típicos a evitar en la redacción de TFG. Aplica estas recomendaciones a ambos anexos.

---

## Instrucciones de Formato

Cuando redactes los anexos:

1. **Formato:** Markdown en `docs/context/entrega/`
2. **Destino:** Se convertirá a Google Docs para ajustes finales
3. **Portadas:** Las añadiré yo manualmente
4. **Imágenes/Diagramas:** 
   - Deja notas claras donde irían: `[IMAGEN: Descripción de qué incluir]` (Si hay imágenes)
   - Yo sustituiré las notas por las imágenes/diagramas reales

---

## Instrucciones - Paso 1: Comprensión y Planificación

**No redactes ningún anexo todavía.**

### Qué debes hacer ahora:

1. **Analizar los archivos de contexto** listados arriba para cada anexo
2. **Leer la guía de errores frecuentes** para tenerla presente
3. **Centrarte especialmente en el Anexo IV** (lo haremos primero)
4. **Analizar el ejemplo de Anexo IV** de un compañero que te adjunto (como referencia de estructura, no de contenido, su proyecto es muy distinto)

### Entregable Requerido:

#### 1. Confirmación de Comprensión
- Confirma que has entendido el objetivo de cada anexo
- Confirma qué información tienes disponible para cada uno
- Indica si falta alguna información crítica

#### 2. Índice Propuesto para Anexo IV (Plan de Seguridad)
Basándote en:
- Las guías oficiales
- El contenido de `SECURITY.md`
- El ejemplo del compañero (estructura, no contenido)

Propón un **índice detallado** con los apartados que incluiremos en nuestro Anexo IV específico para Salmantour. Formato:

```
1. [Título del apartado]
   - Breve descripción de qué incluirá
   1.1. [Subapartado si aplica]
   ...
```

#### 3. Preguntas o Dudas
- Cualquier aspecto que necesites aclarar antes de comenzar la redacción
- Información adicional que puedas necesitar

---

## Siguiente Paso

Una vez confirmes tu comprensión y yo valide el índice propuesto para el Anexo IV, procederemos a la **redacción completa** del archivo `Anexo IV- Plan de seguridad.md`.

---

## Principios de Trabajo

- **Comprensión primero:** Entender bien el alcance antes de redactar
- **Precisión:** Reflejar exactamente lo implementado en el proyecto
- **Claridad:** Lenguaje profesional y académico
- **Estructura:** Índice claro y apartados bien organizados
- **Evitar errores:** Aplicar las recomendaciones de la guía del tutor

---

# Prompt 2

Confirmo tu comprensión total del contexto de nuestro proyecto "Salmantour" y de lo que debes desarrollar en los Anexos que te he pedido. A continuación, te doy más indicaciones para tu redacción del `Anexo IV- Plan de seguridad.md` y te respondo a tus dudas sobre este. Todavía no te respondo a las dudas del Anexo III, ni te doy más indicaciones sobre ese porque ahora te debes centrar en el Anexo IV, te daré más contexto sobre el otro archivo más adelante.

## Indidaciones del Anexo IV Plan de seguridad
- Has realizado una comprensión perfecta de la información disponible, y el índice propuesto es perfecto. Tiene más apartados que el de nuestro compañero porque el nuestro es más completo, tenemos más medidas de seguridad implementadas y documentadas.
- Por ese motivo, considero que la extensión de nuestro documento debería ser algo más grande que la de mi compañero. Como bien indicas, nuestro proyecto tiene medidas de seguridad más detalladas, así que es lógico que ocupe más. No trates de forzar ninguna extensión específica, no tenemos mínimo ni máximo de extensión para estos informes. No intentes acortar el contenido por pensar que es demasiado, ni intentes rellenar más por ocupar lo máximo posible. Céntrate en hacer una redacción PERFECTA de todos los aspectos de la aplicación que se explican en cada apartado.
- Debes saber que la aplicación SÍ que pide consentimiento explícito al usuario para que de los permisos necesarios para su funcionamiento. Tenemos configurado en el frontend mensajes que piden permisos de ubicación y de cámara cuando se necesitan, y las funcionalidades no se usan si el usuario no consiente los permisos en su sistema operativo. Esto puede ser relevante para la parte de redacción de las medidas legales tomadas, ya que no tengo casi nada de información recopilada para esta parte.
- La parte de seguridad legal debes realizarla de la mejor manera que puedas con la información actual que tenemos y con la que puedas desarrollar tú del contexto. Puede estar bien que incluyas referencias específicas a los artículos si así lo consideras mejor para tu redacción. Aunque esta parte no sea muy extensa, intenta plasmar información real sobre nuestro proyecto y sobre su desarrollo, mencionando todas las medidas legales que hayamos seguido que puedas recopilar del contexto.
- Sobre el diagrama del modelo de seguridad, puedes hacer tú el diagrama en formato markdown en la sección donde lo quieras meter (detallando de todas maneras el mensaje de "Diagrama 1: Diagrama de modelo de seguridad"). Cuando pase este informe a limpio en Docs, me aseguraré de meter una imagen del diagrama desarrollado de mejor manera en otra app. Tu ejemplo en markdown me ayudará bastante a hacerlo, así que inclúyelo.
- Te he adjuntado el archivo `Anexo IV- Plan de seguridad.md`, que está vacío. Ahí es donde debes desarrollar toda la redacción según lo planeado.

---

# Prompt 3

Excelente trabajo, el informe que has realizado era practicamente perfecto, ha necesitado pocos retoques. De ahora en adelante, cuando tengas que definir un diagrama, hazlo en código Mermaid. Esto me permite copiar el código y pegarlo directamente en un conversor de Mermaid a diagrama, para hacerle una captura y adjuntarlo en el lugar del documento que me indicas.