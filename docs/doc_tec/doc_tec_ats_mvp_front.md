# Documentación Técnica Frontend - TalentIA ATS MVP (Fase 1)

Este documento establece las directrices y mejores prácticas para el desarrollo frontend del componente ATS MVP en la Fase 1 del proyecto TalentIA. Se basa en la arquitectura definida, los requisitos del proyecto y las tecnologías seleccionadas.

## 1. Arquitectura Frontend del ATS MVP

El frontend del ATS MVP se implementará como una aplicación Single Page Application (SPA) utilizando **Vue.js**. Actúa como la capa de presentación para los usuarios internos (Reclutadores, Hiring Managers, Administradores) y expone el portal de empleo público para los candidatos. El frontend interactúa con el backend del ATS MVP a través de una API HTTP/REST.

La estructura lógica del frontend se organiza en módulos que corresponden a las áreas funcionales clave, como se detalla en el documento de arquitectura:

* **Módulo de Interfaz de Usuario (UI/Frontend):** La capa de presentación, responsable de las vistas, la interacción del usuario y la visualización de datos.
* **Servicios/Stores de Estado (Frontend Logic):** Contiene la lógica frontend, gestiona el estado de la aplicación, las llamadas a la API y la coordinación de componentes.

## 2. Tecnologías Clave del Frontend

Se han seleccionado las siguientes tecnologías para el desarrollo frontend:

* **Framework:** Vue.js
* **Gestión de Estado:** Pinia
* **Estrategia de Estilado:** Tailwind CSS y una librería de componentes Headless UI.
* **Comunicación API:** Axios
* **Herramienta de Build:** Vite
* **Calidad de Código:** ESLint y Prettier
* **Testing:** Jest o Vitest (con Vue Test Utils) para unitarias/componentes y Cypress para E2E.

## 3. Mejores Prácticas por Área Tecnológica

### 3.1. Desarrollo con Vue.js

* **Componentización:** Dividir la interfaz en componentes Vue pequeños y reutilizables, siguiendo el principio de responsabilidad única. Organizar los componentes en directorios lógicos (ej. `components/common`, `components/forms`, `components/lists`, `components/kanban`).
* **Props y Eventos:** Utilizar `props` para pasar datos de padres a hijos y eventos (`$emit`) para la comunicación inversa. Definir claramente los tipos de props y validar su formato.
* **Composition API:** Favorecer el uso de la Composition API para organizar la lógica del componente de forma más limpia y reutilizable, especialmente para lógica compleja o lógica relacionada con el estado y el ciclo de vida.
* **Routing:** Utilizar Vue Router para gestionar la navegación entre las diferentes vistas de la aplicación. Definir rutas claras y semánticas.
* **Directivas y Renderizado Condicional/de Lista:** Utilizar `v-if`, `v-else-if`, `v-else` para renderizado condicional y `v-for` para renderizado de listas, optimizando su uso para el rendimiento.
* **Ciclo de Vida de Componentes:** Entender y utilizar correctamente los hooks del ciclo de vida para inicializar datos, realizar llamadas a la API al montar, limpiar recursos al desmontar, etc.

### 3.2. Gestión de Estado con Pinia

* **Definición de Stores:** Crear stores de Pinia para cada módulo o dominio de la aplicación (ej. `authStore`, `userStore`, `vacancyStore`, `applicationStore`).
* **Estado, Getters, Actions:** Organizar cada store con su `state` (datos reactivos), `getters` (propiedades computadas derivadas del estado) y `actions` (métodos para modificar el estado y realizar lógica asíncrona, como llamadas a la API).
* **Actions Asíncronas:** Utilizar actions de Pinia para manejar la lógica asíncrona (ej. llamadas a Axios), actualizando el estado (ej. `isLoading`, `error`) antes y después de la operación.
* **Modularidad:** Importar y usar los stores solo donde sean necesarios, evitando dependencias globales innecesarias.
* **Persistencia (Opcional):** Si se requiere persistir parte del estado (ej. token de autenticación), considerar el uso de plugins de persistencia para Pinia.

### 3.3. Estrategia de Estilado con Tailwind CSS y Headless UI

* **Filosofía Utility-First:** Priorizar el uso de las utility classes de Tailwind directamente en el marcado HTML/template de los componentes para un estilado rápido y consistente.
    * **Configuración:** Personalizar el archivo `tailwind.config.js` para alinear los tokens de diseño (colores, espaciado, tipografía) con la guía de estilo del proyecto.
    * **Directivas:** Utilizar las directivas `@apply`, `@layer` y `@screen` en los archivos CSS para organizar y abstraer estilos complejos cuando sea apropiado, manteniendo la legibilidad.
* **Headless UI:** Utilizar los componentes sin estilo de Headless UI (ej. para Dropdowns, Modales, Transiciones) como base para componentes interactivos complejos, y aplicarles estilos utilizando Tailwind CSS. Esto proporciona accesibilidad y comportamiento sin imponer estilos visuales.
* **Consistencia Visual:** A pesar de usar un enfoque utility-first, mantener una consistencia visual aplicando las mismas clases de Tailwind o abstracciones (`@apply`) para elementos similares en toda la aplicación. Crear un sistema de diseño basado en componentes y clases reutilizables.
* **CSS Personalizado Mínimo:** Limitar el CSS personalizado (escrito en archivos `.css` o `.vue` `<style>` tags) a directivas `@apply` para abstracciones de patrones o estilos muy específicos que no se puedan lograr fácilmente con Tailwind. Utilizar `@import` en el CSS principal para incluir los archivos de Tailwind.

### 3.4. Comunicación con la API mediante Axios

* **Cliente Centralizado:** Configurar una instancia configurada de Axios (ej. `services/api.js`) con la URL base del backend, encabezados comunes (ej. `Authorization` con el token JWT) y manejo básico de errores.
* **Interceptors:** Utilizar interceptores de Axios para manejar globalmente la adición del token de autenticación a las peticiones salientes y para gestionar respuestas de error comunes (ej. redirigir a login en caso de 401 Unauthorized).
* **Manejo de Errores:** Gestionar los posibles errores de las llamadas API (códigos 4xx, 5xx) en las actions de Pinia o en los componentes que realizan la llamada, proporcionando feedback visual al usuario.
* **Serialización/Deserialización:** Asegurar que los datos se envíen en formato JSON en las peticiones y se esperen en formato JSON en las respuestas, según la [especificación OpenAPI] del backend. Axios maneja esto por defecto, pero es importante ser consciente.

## 4. Patrones de Diseño de Componentes en Vue.js (Profundización)

Para mantener la base de código escalable y fácil de mantener, se recomienda seguir ciertos patrones al diseñar componentes Vue.js:

* **Componentes de Presentación (Dumb) vs. Contenedores (Smart):**
    * Los **Componentes de Presentación** deben enfocarse en *cómo* se muestran las cosas. Reciben datos a través de `props` y emiten eventos para comunicar acciones del usuario. No tienen lógica de negocio ni interactúan directamente con stores de Pinia o la API. Son reutilizables y fáciles de probar de forma aislada.
    * Los **Contenedores** se enfocan en *qué* se muestra. Manejan la lógica de negocio, obtienen datos de stores de Pinia o llaman a servicios API, y pasan datos y callbacks a los componentes de presentación hijos.
* **Uso de Slots:** Utilizar slots para hacer los componentes más flexibles y reutilizables, permitiendo inyectar contenido dinámico en la plantilla de un componente hijo desde el padre.
* **Validación de Props:** Definir y validar explícitamente las `props` esperadas por cada componente, incluyendo tipos, si son requeridas y validaciones personalizadas si es necesario. Esto mejora la claridad y ayuda a prevenir errores.
* **Emisión de Eventos Claros:** Al emitir eventos (`$emit`), usar nombres descriptivos que indiquen la acción realizada (ej. `update:modelValue`, `item-selected`, `form-submitted`). Documentar los eventos que un componente puede emitir.
* **Composición con Composition API:** Favorecer el uso de la Composition API para organizar la lógica relacionada (estado reactivo, métodos computados, observadores, lógica del ciclo de vida) en bloques lógicos (ej. `useUser`, `useVacancyForm`) dentro de la función `setup` o en Composition Functions reutilizables (`src/composables`). Esto mejora la legibilidad y reutilización de la lógica compleja.

## 5. Patrones de Gestión de Estado con Pinia (Profundización)

* **Organización por Dominio:** Cada store de Pinia debe encapsular el estado y la lógica relacionada con un dominio específico de la aplicación (usuarios, vacantes, candidaturas, autenticación).
* **Actions para Lógica Asíncrona y de Negocio:** Todas las llamadas a la API (Axios) y la lógica de negocio asociada (ej. transformaciones de datos, validaciones complejas antes de enviar) deben residir dentro de las `actions` de Pinia stores, no directamente en los componentes Vue. Esto mantiene los componentes "tontos" y centraliza la lógica.
* **Manejo de Carga y Errores en Stores:** Las actions asíncronas deben actualizar el estado del store para indicar si una operación está en curso (ej. `isLoading: boolean`) o si ha ocurrido un error (ej. `error: string | null`). Los componentes Vue deben observar este estado para mostrar indicadores de carga o mensajes de error en la UI.
* **Getters Derivados:** Utilizar `getters` para obtener datos derivados del estado base o para formatear datos para la UI. Los getters son propiedades computadas eficientes que se actualizan automáticamente cuando cambia el estado del que dependen.
* **Tipado (si se usa TypeScript):** Definir interfaces o tipos claros para el estado, getters y acciones de cada store si se está utilizando TypeScript.

## 6. Convenciones de Estilado con Tailwind CSS y Headless UI (Profundización)

* **Filosofía Utility-First:** Priorizar el uso de las utility classes de Tailwind directamente en el marcado HTML/template de los componentes para un estilado rápido y consistente.
    * **Configuración:** Personalizar el archivo `tailwind.config.js` para alinear los tokens de diseño (colores, espaciado, tipografía) con la guía de estilo del proyecto.
    * **Directivas:** Utilizar las directivas `@apply`, `@layer` y `@screen` en los archivos CSS para organizar y abstraer estilos complejos cuando sea apropiado, manteniendo la legibilidad.
* **Headless UI:** Utilizar los componentes sin estilo de Headless UI (ej. para Dropdowns, Modales, Transiciones) como base para componentes interactivos complejos, y aplicarles estilos utilizando Tailwind CSS. Esto proporciona accesibilidad y comportamiento sin imponer estilos visuales.
* **Consistencia Visual:** A pesar de usar un enfoque utility-first, mantener una consistencia visual aplicando las mismas clases de Tailwind o abstracciones (`@apply`) para elementos similares en toda la aplicación. Crear un sistema de diseño basado en componentes y clases reutilizables.
* **CSS Personalizado Mínimo:** Limitar el CSS personalizado (escrito en archivos `.css` o `.vue` `<style>` tags) a directivas `@apply` para abstracciones de patrones o estilos muy específicos que no se puedan lograr fácilmente con Tailwind. Utilizar `@import` en el CSS principal para incluir los archivos de Tailwind.

## 7. Patrones de Comunicación API con Axios (Profundización)

* **Cliente Centralizado:** Configurar una instancia configurada de Axios (ej. `services/api.js`) con la URL base del backend, encabezados comunes (ej. `Authorization` con el token JWT) y manejo básico de errores.
* **Interceptors:** Utilizar interceptores de Axios para manejar globalmente la adición del token de autenticación a las peticiones salientes y para gestionar respuestas de error comunes (ej. redirigir a login en caso de 401 Unauthorized).
* **Manejo de Errores:** Gestionar los posibles errores de las llamadas API (códigos 4xx, 5xx) en las actions de Pinia o en los componentes que realizan la llamada, proporcionando feedback visual al usuario.
* **Serialización/Deserialización:** Asegurar que los datos se envíen en formato JSON en las peticiones y se esperen en formato JSON en las respuestas, según la [especificación OpenAPI] del backend. Axios maneja esto por defecto, pero es importante ser consciente.

## 8. Manejo de Formularios y Validación

* **Validación:** Implementar validación tanto en el lado del frontend (para feedback rápido al usuario) como en el backend (para seguridad y fiabilidad).
    * **Frontend:** Utilizar librerías de validación (ej. Vuelidate, VeeValidate) o lógica manual en componentes/stores para validar los datos antes de enviarlos a la API. Proporcionar feedback visual claro al usuario sobre los campos inválidos.
    * **Backend:** La validación completa y autoritativa debe realizarse siempre en el backend (como se define en los TKs backend, ej. [TK-017], [TK-022], [TK-042]). El frontend debe manejar los errores de validación devueltos por la API (código 400).
* **Gestión del Estado del Formulario:** Utilizar el estado local del componente o un store de Pinia para gestionar los valores de los campos del formulario, el estado de validación, el estado de envío (en curso, éxito, error).

## 9. Consideraciones de Accesibilidad (WCAG)

Aunque RNF-19 especifica cumplimiento Básico (AA), se deben aplicar activamente las siguientes prácticas:

* **Estructura Semántica:** Utilizar elementos HTML semánticos adecuados (ej. `<nav>`, `<main>`, `<aside>`, `<button>`, `<form>`, `<label>`).
* **Etiquetas Asociadas:** Asociar etiquetas (`<label>`) a los campos de formulario utilizando el atributo `for`.
* **Texto Alternativo:** Proporcionar texto alternativo (`alt` atributo) para las imágenes que transmiten información.
* **Contraste de Color:** Asegurar que haya suficiente contraste entre el texto y los colores de fondo.
* **Navegación por Teclado:** Verificar que todos los elementos interactivos (botones, enlaces, campos de formulario) sean accesibles y operables utilizando solo el teclado. Headless UI ayuda con esto al proporcionar la base funcional.
* **Roles ARIA y Atributos:** Utilizar roles y atributos ARIA cuando sea necesario para mejorar la semántica de los elementos dinámicos o complejos para tecnologías de asistencia. Headless UI a menudo proporciona esto por defecto.

## 10. Estrategias de Rendimiento Frontend

Aunque el MVP no se enfoca en optimización extrema, tener en cuenta:

* **Code Splitting y Lazy Loading:** Configurar Vue Router para lazy loading de vistas y utilizar importaciones dinámicas para reducir el tamaño del bundle inicial y mejorar el tiempo de carga. Vite soporta esto de forma nativa.
* **Optimización de Imágenes:** Utilizar formatos de imagen modernos y optimizar su tamaño.
* **Gestión Eficiente del Estado:** Evitar re-renderizados innecesarios optimizando los getters de Pinia y asegurando que los componentes solo reaccionen a los cambios de estado que les afecten directamente.
* **Virtual Scrolling (Listas Largas):** Para listas muy largas de candidatos, considerar la implementación de virtual scrolling para renderizar solo los elementos visibles en la pantalla y mejorar el rendimiento.

## 11. Documentación y Storybook

* **Documentación en el Código:** Escribir comentarios claros en el código, especialmente para componentes complejos, lógica de stores y funciones de utilidad.
* **Documentación de Componentes:** Considerar la integración de Storybook o una herramienta similar para documentar los componentes de UI de forma interactiva. Esto facilita su reutilización, prueba y colaboración entre desarrolladores y diseñadores.

## 12. Herramientas de Desarrollo y Calidad de Código

* **Vite:** Utilizar Vite para un entorno de desarrollo rápido (Hot Module Replacement) y builds optimizados para producción. Configurar Vite para el proyecto Vue.js.
* **ESLint:** Configurar ESLint con reglas recomendadas para Vue.js y JavaScript para identificar problemas de sintaxis, errores y patrones de codificación inconsistentes.
* **Prettier:** Configurar Prettier para formatear automáticamente el código y asegurar un estilo consistente en todo el proyecto (integrarlo con ESLint).
* **Integración con IDE:** Configurar las extensiones de ESLint y Prettier en el editor de código (ej. VS Code, Cursor) para formatear y linting al guardar.

## 13. Estrategia de Testing Frontend

Una estrategia de testing robusta es crucial para asegurar la calidad del frontend. Se recomienda el siguiente enfoque, alineado con las herramientas mencionadas en el documento de arquitectura:

* **Pruebas Unitarias:**
    * **Herramientas:** Jest o Vitest.
    * **Enfoque:** Probar funciones puras, lógica de stores de Pinia (actions, getters), y lógica simple de componentes (sin renderizado DOM completo). Verificar que las funciones realizan su tarea correctamente y los stores modifican el estado esperado.
* **Pruebas de Componentes:**
    * **Herramientas:** Vue Test Utils con Jest o Vitest.
    * **Enfoque:** Montar componentes Vue de forma aislada o en conjunto limitado. Probar la renderización correcta con diferentes props, la interacción del usuario (eventos de clic, entrada de texto), y cómo el componente actualiza su estado o emite eventos. Mockear llamadas a la API o dependencias externas.
* **Pruebas End-to-End (E2E):**
    * **Herramientas:** Cypress.
    * **Enfoque:** Probar flujos de usuario completos en un navegador real contra el sistema desplegado (frontend + backend). Verificar la integración entre frontend y backend, la navegación entre páginas y la experiencia del usuario de principio a fin. Simular interacciones de usuario complejas (ej. drag-and-drop en Kanban).

## 14. Despliegue en Azure Static Web Apps

La solución frontend del ATS MVP se desplegará como una aplicación estática en Azure Static Web Apps, aprovechando su CDN integrada para una distribución global del contenido.

### 14.1. Preparación para el despliegue
* **Build de producción**: Configurar correctamente `vite.config.js` para optimizar el build de producción:
  ```javascript
  export default defineConfig({
    plugins: [vue()],
    build: {
      // Opciones de optimización
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  });
  ```

* **Variables de entorno**: Gestionar configuraciones específicas por entorno usando el sistema de variables de entorno de Vite:
  ```
  # .env.production
  VITE_API_URL=https://api-production.talentia.com/api/v1
  
  # .env.staging
  VITE_API_URL=https://api-staging.talentia.com/api/v1
  ```

### 14.2. Configuración de Azure Static Web Apps
* **Archivo de configuración**: Crear un archivo `staticwebapp.config.json` en la raíz del proyecto:
  ```json
  {
    "routes": [
      {
        "route": "/assets/*",
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      {
        "route": "/*",
        "serve": "/index.html",
        "headers": {
          "cache-control": "no-cache"
        }
      }
    ],
    "navigationFallback": {
      "rewrite": "/index.html",
      "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
    },
    "responseOverrides": {
      "404": {
        "rewrite": "/index.html",
        "statusCode": 200
      }
    }
  }
  ```

### 14.3. Configuración de CI/CD
* **GitHub Actions**: Configurar el workflow automático para despliegue continuo:
  ```yaml
  name: Azure Static Web Apps CI/CD

  on:
    push:
      branches:
        - main
    pull_request:
      types: [opened, synchronize, reopened, closed]
      branches:
        - main

  jobs:
    build_and_deploy_job:
      if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
      runs-on: ubuntu-latest
      name: Build and Deploy Job
      steps:
        - uses: actions/checkout@v3
        - name: Build And Deploy
          id: builddeploy
          uses: Azure/static-web-apps-deploy@v1
          with:
            azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
            repo_token: ${{ secrets.GITHUB_TOKEN }}
            app_location: "/" 
            api_location: ""
            output_location: "dist"
            app_build_command: "npm run build"
  ```

### 14.4. Comunicación con el backend
* Configurar Axios para comunicarse con el backend desplegado en Azure Container Apps:
  ```javascript
  // src/services/api.js
  import axios from 'axios';

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Interceptor para añadir token de autenticación
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  export default api;
  ```

Al incorporar estas mejores prácticas en su flujo de trabajo de desarrollo frontend, el equipo podrá construir una aplicación más robusta, mantenible, escalable y con una mejor experiencia de usuario.

---
Referencias:
* [Arquitectura de la Aplicación ATS MVP](../arq/ats_mvp_arq.md)
* [Documentación de Vue.js](https://vuejs.org/)
* [Documentación de Pinia](https://pinia.vuejs.org/)
* [Documentación de Tailwind CSS](https://tailwindcss.com/)
* [Documentación de Headless UI](https://headlessui.com/)
* [Documentación de Axios](https://axios-http.com/)
* [Documentación de Vite](https://vitejs.dev/)
* [Documentación de ESLint](https://eslint.org/)
* [Documentación de Prettier](https://prettier.io/)
* [Documentación de Jest](https://jestjs.io/) o [Vitest](https://vitest.dev/)
* [Documentación de Vue Test Utils](https://test-utils.vuejs.org/)
* [Documentación de Cypress](https://www.cypress.io/)
* [Pautas de Accesibilidad WCAG](https://www.w3.org/WAI/WCAG21/quickref/)