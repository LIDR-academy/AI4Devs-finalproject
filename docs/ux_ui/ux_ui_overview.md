# Documentación de Diseño UX/UI - Proyecto TalentIA (Fase 1)

Este documento resume los aspectos clave del diseño UX/UI para el proyecto TalentIA en su Fase 1 (ATS MVP + Core AI), basándose en la documentación del proyecto proporcionada y en las mejores prácticas y tendencias de diseño web para 2025. Incluye principios de diseño, perfiles de usuario, flujos clave y una sección dedicada a la guía de estilos visuales y de componentes.

## 1. Usuarios y sus Necesidades Clave

La aplicación está diseñada principalmente para los siguientes usuarios internos del ATS MVP:

* **Reclutadores:** Necesitan crear y gestionar vacantes, recibir y evaluar candidaturas de manera eficiente con asistencia de IA, gestionar el pipeline de selección, y proporcionar feedback a la IA para su mejora. Buscan optimizar tiempo en tareas repetitivas y contratar al mejor talento de forma eficiente.
* **Hiring Managers:** Revisan perfiles de candidatos, validan decisiones clave y pueden dar feedback específico. Buscan seleccionar al mejor talento de forma eficiente.
* **Administradores:** Gestionan usuarios y configuraciones básicas del sistema, como las etapas del pipeline. Buscan asegurar el correcto funcionamiento del ATS MVP.

También existe un usuario externo clave:

* **Candidatos:** Interactúan con el Portal de Empleo público para visualizar vacantes y aplicar a ellas. Buscan un proceso de aplicación sencillo y claro.

## 2. Funcionalidades Clave desde la Perspectiva del Usuario

La Fase 1 del ATS MVP se centra en las siguientes áreas funcionales principales:

* **Gestión de Vacantes:** Creación, edición, publicación y despublicación de ofertas de empleo. Con asistencia de IA, los reclutadores pueden solicitar la generación de la descripción del puesto (JD) y configurar parámetros de evaluación IA específicos por vacante.
* **Portal de Empleo y Proceso de Aplicación:** Un sitio público simple para listar vacantes publicadas y un formulario para que los candidatos apliquen y suban su CV.
* **Gestión de Candidaturas:** Recepción y almacenamiento seguro de las aplicaciones y CVs. El sistema orquesta la evaluación IA de estas candidaturas.
* **Visualización y Gestión del Pipeline:** Los usuarios internos pueden visualizar a los candidatos de una vacante en una lista o un tablero Kanban, viendo su etapa actual, el score de IA y la etapa sugerida por la IA. Pueden mover candidatos manualmente entre etapas.
* **Evaluación Inteligente (Resultados en UI):** Mostrar de forma clara el score de idoneidad calculado por la IA y la etapa del pipeline sugerida. Opcionalmente, mostrar un resumen generado por IA y el historial de aplicaciones anteriores del candidato.
* **Sistema de Feedback para IA:** Permitir a los usuarios proporcionar feedback sobre la evaluación IA (básico o detallado) para contribuir a la mejora continua de los modelos.
* **Administración y Configuración:** Gestión de usuarios y roles, y configuración de las etapas del pipeline.

## 3. Flujos de Usuario Principales (Casos de Uso)

Los flujos de usuario definen las interacciones clave con el sistema:

* **UC1: Gestionar Vacante y Generar Descripción con IA:** El Reclutador crea/edita una vacante, define parámetros IA y, opcionalmente, solicita y edita una JD generada por IA.
* **UC2: Aplicar a Vacante:** El Candidato visualiza una vacante publicada en el portal y envía su solicitud a través del formulario.
* **UC3: Recepcionar y Evaluar Candidatura con IA:** (Sistema) El ATS MVP recibe una candidatura, gestiona el perfil unificado en Core AI, invoca la evaluación IA (parsing, scoring, comparación, sugerencia de etapa) y recibe los resultados.
* **UC4: Revisar Candidatos y Gestionar Pipeline:** Reclutador/Manager revisa candidatos en lista/Kanban, visualiza la evaluación IA (score, sugerencia, resumen opcional, historial opcional) y mueve candidatos entre etapas.
* **UC5: Proporcionar Feedback a IA:** Reclutador/Manager da feedback sobre la evaluación IA a través de la interfaz.
* **UC6: Administrar Usuarios y Configuración Básica:** El Administrador gestiona usuarios y configura etapas del pipeline.

## 4. Principios de Diseño UX/UI y Mejores Prácticas

Aplicando las mejores prácticas y tendencias para 2025, el diseño del ATS MVP debe enfocarse en:

* **Simplicidad y Claridad:** La interfaz debe ser intuitiva y fácil de aprender, evitando elementos innecesarios y utilizando etiquetas claras. La navegación debe ser sencilla y coherente en todas las páginas.
* **Consistencia:** Mantener patrones de diseño uniformes para elementos interactivos (botones, formularios, estados), espaciado y navegación en toda la aplicación para una experiencia predecible. Un sistema de diseño con elementos estandarizados (tipografía, colores, componentes) es clave para esto.
* **Usabilidad y Eficiencia:** Diseñar flujos de trabajo que reduzcan el esfuerzo del usuario, especialmente en tareas frecuentes como la revisión de candidatos y la gestión del pipeline. La visualización Kanban (RF-16) es un ejemplo de interfaz eficiente para la gestión del flujo.
* **Feedback y Orientación al Usuario:** Proporcionar indicaciones visuales claras e inmediatas sobre el estado de las operaciones iniciadas por el usuario (ej. confirmaciones de guardado, indicadores de carga/procesamiento para acciones de IA, mensajes de error comprensibles).
* **Diseño Adaptable (Responsive Básico):** Asegurar que la interfaz principal sea funcional y visualmente correcta en las resoluciones de pantalla de escritorio más comunes. Aunque la optimización móvil no es primaria en Fase 1, los elementos táctiles deben ser lo suficientemente grandes (ej. 44x44 píxeles).
* **Accesibilidad:** Considerar pautas básicas de accesibilidad (contraste de color, navegación por teclado, uso correcto de etiquetas semánticas y textos alternativos para imágenes significativas) para garantizar la inclusión. La accesibilidad es una piedra angular en las tendencias de diseño.
* **Transparencia de la IA:** Indicar claramente qué información o sugerencias provienen de la inteligencia artificial y, si es posible, ofrecer una justificación concisa del resultado de la IA. Esto genera confianza y permite al usuario mantener el control ("Human in the loop").
* **Visualización de Datos:** Presentar los resultados de la evaluación IA (score, resumen, historial) de forma clara y destacada en el perfil del candidato. Utilizar elementos visuales (barras, iconos) para facilitar la comprensión rápida.
* **Interacción:** Implementar interacciones fluidas, como el arrastrar y soltar en el tablero Kanban para mover candidatos entre etapas. Las microinteracciones pueden mejorar la experiencia y proporcionar feedback sutil.

## 5. Aplicación de Tendencias UX/UI para 2025

Además de las mejores prácticas atemporales, se pueden incorporar tendencias relevantes:

* **Personalización impulsada por IA:** Si bien la personalización avanzada está fuera del alcance de la Fase 1, el sistema ya utiliza IA para proporcionar una evaluación *contextualizada* a cada vacante, lo cual es una forma de personalización del proceso de criba. Futuras iteraciones podrían explorar interfaces adaptadas al rol o preferencias del usuario.
* **Accesibilidad como base:** Integrar la accesibilidad desde las primeras etapas del diseño (RNF-19).
* **Animaciones funcionales:** Utilizar animaciones sutiles para indicar estados (carga, éxito), guiar al usuario o mejorar la retroalimentación en interacciones como el drag-and-drop en Kanban.
* **Diseño centrado en el comportamiento:** Si bien complejo, entender cómo los usuarios interactúan con los scores y sugerencias de IA y diseñar la interfaz para fomentar la acción deseada (ej. revisar candidatos mejor puntuados) es una aplicación de diseño conductual.
* **Experiencias fluidas entre plataformas:** Asegurar que, incluso en el MVP básico, la transición entre la lista y el detalle de candidatos, o la interacción con el Kanban, sea fluida.

## 6. Guía de Estilos Visuales y Componentes de UI

Esta sección define las convenciones visuales y el uso de componentes para asegurar una interfaz de usuario consistente y cohesiva en todo el ATS MVP, haciendo uso de Tailwind CSS y Headless UI.

* **Principios de Diseño Visual:**
    * **Minimalismo y Enfoque:** Priorizar un diseño limpio y despejado que guíe al usuario hacia las acciones e información importante.
    * **Jerarquía Visual Clara:** Utilizar el tamaño, peso, color y espaciado para diferenciar la importancia de los elementos en la pantalla.
    * **Uso Estratégico del Color:** Definir una paleta de colores limitada y utilizar los colores primarios, secundarios y de estado de forma consistente para acciones y feedback (éxito, error, advertencia).
* **Tipografía:**
    * Definir las familias de fuentes para encabezados y cuerpo de texto.
    * Establecer una escala de tamaños de fuente y pesos (utilizando las clases de Tailwind como `text-sm`, `text-base`, `font-bold`, etc.) y documentar su uso para diferentes elementos de UI (títulos de página, encabezados de sección, texto de párrafo, etiquetas de formulario).
* **Paleta de Colores:**
    * Definir los colores de la marca principal y colores secundarios en el archivo de configuración de Tailwind (`tailwind.config.js`).
    * Especificar el uso de los colores de estado (ej. `text-red-500` para errores, `text-green-500` para éxito, `bg-blue-500` para botones primarios). Documentar el propósito de cada color definido en la paleta.
* **Espaciado y Layout:**
    * Utilizar la escala de espaciado de Tailwind CSS de forma consistente para márgenes (`m-`), paddings (`p-`), gaps (`gap-`) y tamaños (`w-`, `h-`). Documentar las convenciones de espaciado para elementos comunes (ej. espaciado entre campos de formulario, padding de secciones).
    * Aplicar un sistema de layout basado en Flexbox (`flex`) y Grid (`grid`) de Tailwind para crear estructuras responsivas y bien alineadas.
* **Componentes de UI (Estilizados con Tailwind):**
    * Documentar los estilos visuales (aplicando clases de Tailwind) y los estados de los componentes interactivos comunes, muchos de los cuales se construirán usando Headless UI como base funcional:
        * **Botones:** Definir estilos para botones primarios, secundarios, terciarios (ej. con bordes, solo icono), y sus estados (normal, `:hover`, `:focus`, `:active`, `:disabled`). Utilizar las clases de Tailwind para color de fondo, texto, bordes, padding, sombra, etc.
        * **Campos de Formulario:** Definir la apariencia de inputs de texto, textareas, selectores (construidos con Headless UI `Listbox` o `Combobox`), checkboxes (`Checkbox` de Headless UI) y radio buttons (`RadioGroup` de Headless UI). Especificar estilos para estados normal, `:focus` (anillo de foco accesible), error (ej. borde rojo), y `:disabled`.
        * **Notificaciones/Alertas:** Definir estilos para mensajes de notificación (utilizando `Transition` de Headless UI si es necesario) con diferentes colores de fondo/texto para indicar éxito, error o información.
        * **Modales y Diálogos:** Definir la apariencia visual de modales y diálogos (utilizando `Dialog` de Headless UI), incluyendo fondos oscurecidos, padding, y la disposición de botones de acción.
        * **Tablas y Listas:** Definir estilos para tablas (bordes, colores de filas alternas) y listas de elementos.
        * **Indicadores de Carga:** Utilizar spinners o barras de progreso consistentes.
* **Iconografía:** Especificar qué biblioteca de iconos se utilizará (ej. Font Awesome, Material Icons) y cómo se insertarán en la interfaz. Definir tamaños y colores para los iconos.
* **Feedback Visual de Interacción:** Documentar animaciones o transiciones sutiles (muchas facilitadas por Headless UI `Transition` o clases de animación de Tailwind) para proporcionar feedback al usuario (ej. al abrir/cerrar modales, al hacer clic en botones).
* **Tratamiento Visual de Datos de IA:** Definir cómo se presentan visualmente los resultados de IA:
    * **Score IA:** Utilizar un formato numérico claro y opcionalmente una representación visual (barra, círculo) con colores que indiquen el rango (ej. verde para alto, amarillo para medio, rojo para bajo).
    * **Etapa Sugerida:** Mostrarla de forma destacada pero distinta de la etapa actual (ej. con un color de texto diferente, un icono).
    * **Resumen IA:** Presentar el texto del resumen de forma legible, quizás en un bloque separado con un encabezado claro.
    * **Historial Unificado:** Presentar el historial de aplicaciones previas de forma concisa, quizás en una lista o línea de tiempo simple dentro del perfil del candidato.
    * **Feedback IA Controles:** Diseñar los controles de feedback (👍/👎, validación de skills) para que sean intuitivos y visualmente respondan a la interacción del usuario.

Esta sección adicional proporcionará una guía más concreta sobre cómo aplicar los principios de diseño en la práctica utilizando las tecnologías frontend seleccionadas, lo cual es fundamental para la consistencia visual y la eficiencia del desarrollo.


*Este resumen proporciona una visión general de la documentación de diseño UX/UI del proyecto TalentIA.*