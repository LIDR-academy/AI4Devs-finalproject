# Chatbot: Cursor - Claude Sonnet 3.5

## Prompt 1

Haz un análisis de toda la documentación @PRD.md @template.md, avísame cuando hayas terminado.


## Prompt 2

Asume el rol de arquitecto de software y desarrollador frontend experto en Angular, TypeScript, HTML, CSS/SCSS y buenas prácticas de desarrollo.

El proyecto fue generado con Angular CLI siguiendo los principios de Clean Architecture. Actualmente es solo la estructura base sin funcionalidades.

Vamos a generar las carpetas principales y su estructura interna según la sección 2.3 del archivo @template.md sobre la descripción de alto nivel y estructura de ficheros:

- core/
  - guards/
  - interceptors/
  - services/
  - models/
  - constants/
  - enums/
  - interfaces/
  - utils/

- features/
  - reader/
    - pages/
    - components/ 
    - services/
    - models/

- shared/
  - components/
  - directives/
  - pipes/
  - models/
  - services/
  - utils/

Nota: Solo crearemos la estructura de carpetas. La implementación de los archivos se realizará en pasos posteriores.

## Prompt 3

Vamos a proceder a crear el feature de reader, iniciando por la carpeta pages, luego components, services y models.

Vamos a ir pasos a paso, conforme te lo vaya indicando.

## Prompt 4

Vamos a crear el componente de pdf-viewer, el cual se encargará de mostrar y controlar la visualización del archivo PDF en la aplicación. El componente se llamará pdf-viewer.component.ts @pdf-viewer.component.html @pdf-viewer.component.scss.

El componente debe tener las siguientes características:

1. Funcionalidades principales:
   - Visualización del PDF
   - Controles de navegación (siguiente/anterior página)

2. Estructura del componente:
   - pdf-viewer.component.ts: Lógica de manejo del PDF
   - pdf-viewer.component.html: Layout y controles
   - pdf-viewer.component.scss: Estilos del visor

3. Consideraciones técnicas:
   - Responsive design
   - Accesibilidad
   - Manejo de errores

Por ahora nos enfocaremos solo en la funcionalidad básica del visor, sin integración con servicios. Las características marcadas como futuras en @PRD.md y @template.md serán implementadas posteriormente.

Vamos a ir paso a paso, conforme te lo vaya indicando.
## Prompt 5

Vamos a iniciar por pedir el archivo pdf, para esto puse una imagen @upload-pdf.png, apégate a la imagen lo más que puedas, para que se vea lo más similar posible a la imagen.

## Prompt 6

Vamos a separar todo la lógica en pequeños componentes para no tener toda la lógica en un solo componente, dentro de @pdf-viewer únicamente vamos a tener la referencia a los componentes que vamos a crear.

## Prompt 7

Vamos a crear la página web-viewer para mostrar contenido web. Este componente debe tener las siguientes características:

1. Funcionalidades principales:
   - Campo de entrada para la URL con validación
   - Visualización del contenido web en un iframe

2. Estructura del componente:
   - web-viewer.component.ts: Lógica de manejo de URL e iframe
   - web-viewer.component.html: Layout y controles
   - web-viewer.component.scss: Estilos consistentes con pdf-viewer

3. Integración con componentes existentes:
   - Mantener consistencia visual con pdf-viewer
   - Usar los mismos controles de lectura

4. Consideraciones técnicas:
   - Gestión de errores de carga
   - Responsive design
   - Accesibilidad web

Tomar como base la estructura y estilos de pdf-viewer para mantener consistencia en la aplicación.

Vamos a ir paso a paso, conforme te lo vaya indicando.

## Prompt 8

Vamos a crear la página principal dentro de @reader, el objetivo de esta página es darle la opción al usuario de seleccionar entre un pdf o una URL para después redireccionar a @pdf-viewer o @web-viewer.

El contenido de la página será el siguiente:

1. Título de la página "Easy reader" en una fuente que sea facíl de leer y que rasalte, ya sea con algún efecto de sombra o brillo.
2. Un pequeño eslogan de la aplicación, algo como "The easiest way to...."
3. Dos opciones para seleccionar:
   - Leer desde PDF
   - Ingresar un URL Web
4. Un botón para iniciar la lectura.

Todo esto en inglés y recuerda seguir usanndo buenas prácticas, antes de crear código dame la estructura de carpetas que propones y en cuanto a estilos, básate en los componente que ya hicimos dentro de  @reader 

Vamos a ir paso a paso, conforme te lo vaya indicando.

## Prompt 9

Vamos a crear los controles para los modos de lectura, inicaindo por el control general que va a ser relativamente discreto en las vistas @pdf-viewer y @web-viewer, vamos a iniciar por ese componente, el cual se llamará reader-control, este componente se ubicará en la carpeta @reader/components/reader-control.

Este componente tendrá dos objetivos:

1. Mostrar las opciones dependiendo del modo de lectura que se esté utilizando.
2. Permitir al usuario cambiar al modo de lectura que desee.

En cuanto a estilos, básate en los componentes que ya hicimos dentro de  @reader. Pero este tiene que ser discreto. Podemos probar con un botón transparente o con un icono y al pasarle el cursor se vera el botón. 

## Prompt 10

Vamos a crear el componente voice-reader que se encargará de la síntesis de voz para leer el contenido de PDFs. El componente debe tener las siguientes características:

1. Funcionalidades principales:
   - Leer el texto en voz alta usando la Web Speech API
   - Controles para reproducir/pausar/detener la lectura
   - Soporte para múltiples idiomas y voces

2. Estructura del componente:
   - voice-reader.component.ts: Lógica principal y manejo de la síntesis de voz
   - voice-reader.component.html: Controles de reproducción y modal de configuración
   - voice-reader.component.scss: Estilos para los controles y modal

3. Integración:
   - Debe poder recibir texto desde el componente pdf-viewer.
   - Debe detener la lectura al navegar fuera del componente.

4. Consideraciones técnicas:
   - Usar Angular CDK para el modal de configuración
   - Implementar manejo de errores y fallbacks
   - Seguir buenas prácticas de Angular
   - Mantener el código limpio y modular

5. UI/UX:
   - Controles intuitivos y accesibles
   - Feedback visual del estado de lectura
   - Modal de configuración con opciones claras
   - Diseño consistente con el resto de la aplicación

El componente debe ser reutilizable y fácil de mantener, siguiendo los principios SOLID y las mejores prácticas de desarrollo de Angular.

Vamos a ir paso a paso, conforme te lo vaya indicando.

## Prompt 11

Vamos a crear el componente voice-command dentro de @reader/components/voice-command, que se encargará del reconocimiento de voz para controlar la navegación del documento. El componente debe tener las siguientes características:

1. Funcionalidades principales:
   - Reconocimiento de comandos de voz usando la Web Speech API (SpeechRecognition)
   - Soporte para 6 comandos básicos:
     * "next": Avanzar a la siguiente página
     * "back": Retroceder a la página anterior  
     * "down": Desplazarse hacia abajo
     * "up": Desplazarse hacia arriba
     * "top": Ir al inicio del documento
     * "bottom": Ir al final del documento
   - Feedback visual al reconocer comandos
   - Debe tener un icono para indicar que está escuchando y cuando no este escuchando debe tener un icono diferente. Este mismo botón servira para iniciar y detener el reconocimiento de voz.

2. Estructura del componente:
   - voice-command.component.ts: Lógica principal y manejo del reconocimiento de voz
   - voice-command.component.html: Interfaz de usuario y feedback visual
   - voice-command.component.scss: Estilos del componente

3. Integración:
   - Debe integrarse con pdf-viewer y web-viewer
   - Detener el reconocimiento al salir del componente
   - Manejar conflictos con otros modos de lectura
   - Debe integrarse dentro de @reader/components/reader-control

4. Consideraciones técnicas:
   - Detección de navegadores no compatibles
   - Optimizar el consumo de recursos
   - Seguir buenas prácticas de Angular

5. UI/UX:
   - Indicador visual del estado de escucha
   - Feedback claro al reconocer comandos
   - Consistencia con el diseño general
   - Diseño responsivo

Vamos a ir paso a paso, conforme te lo vaya indicando.
