# Frontend

Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para implementar el frontent desde cero, ya que este no existe.
En cuanto al todo el proyecto, ya se cuenta con un backend funcional.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el modelo ChatGPT 4.1 que me ayude a implementar los tickets y tener una estructura inicial para iniciar con la implementación del frontend del proyecto.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo

# Consideraciones
- El modelo tendrá acceso a la documentación descrita en el contexto
- El modelo tendra que revisar la documentación para ejectuar el prompt resultante

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.









# Prompt para ChatGPT 4.1: Implementación Inicial del Frontend Buscadoc

## Rol
Actúa como **Frontend Developer experto en Vue.js, SSR, internacionalización y arquitectura hexagonal**. Debes seguir las mejores prácticas de seguridad, internacionalización y documentación técnica, consultando siempre el Product Requirement Document (PRD) y la documentación relevante antes de ejecutar cualquier instrucción.

---

## Contexto y Documentación

- El backend ya está funcional y expone una API REST documentada.
- La documentación relevante incluye:
  - `docs/product_requirement_document.md` (PRD)
  - Diagramas de arquitectura y modelo de datos en `docs/planificacion_y_documentacion/diagramas/`
  - Tickets de implementación en `frontend/docs/tickets/tickets_12-14.md`

---

## Objetivo

Implementar los tickets 12, 13 y 14 para crear la estructura inicial del frontend, instalar dependencias y configurar el entorno de desarrollo, siguiendo los lineamientos del PRD y las convenciones del proyecto.

---

## Instrucciones

1. **Consulta el PRD y la documentación antes de cada paso. Si no encuentras información específica, usa las siguientes tecnologías y convenciones por defecto:**
   - **Vue.js 3** y **Vuetify 3**
   - **SSR base con Vue** (sin Nuxt)
   - **Internacionalización con vue-i18n** (idioma por defecto: español, soporte inglés)
   - **CSS** para estilos
   - **Axios** para consumo de API
   - **Vue Router** para rutas
   - **dotenv** para variables de entorno
   - **ESLint** y **Prettier** para calidad de código

2. **Estructura inicial recomendada:**
   - `frontend/`
     - `src/`
       - `components/`
       - `views/`
       - `services/`
       - `router/`
       - `locales/` (i18n)
     - `.env`
     - `README.md`
     - Configuración de ESLint y Prettier

3. **Internacionalización:**
   - Incluye archivos de localización básicos: `es.json` y `en.json` en `src/locales/`
   - Configura español como idioma por defecto

4. **Variables de entorno (.env):**
   - Incluye ejemplos de valores:
     - `VUE_APP_API_URL=http://localhost:3000`
     - `VUE_APP_I18N_LOCALE=es`
   - Agrega variables adicionales si el PRD lo indica (ej. Firebase)

5. **README.md:**
   - Documenta la estructura del proyecto
   - Explica las variables de entorno y su uso
   - Incluye instrucciones para desarrollo (`npm run dev`), despliegue (`npm run build`) y pruebas end-to-end (Cypress)
   - Documenta convenciones de arquitectura hexagonal y seguridad (LFPDPPP)

6. **Pruebas:**
   - No incluyas pruebas unitarias en esta fase, pero sí la configuración básica para pruebas end-to-end (Cypress)

7. **Estilo y calidad de código:**
   - Configura ESLint y Prettier según las convenciones del PRD o, en su defecto, con reglas estándar para Vue 3

8. **SSR:**
   - Implementa la base para SSR con Vue (sin frameworks adicionales)
   - No incluyas página de inicio por el momento

9. **Integración continua:**
   - Incluye configuración básica para CI/CD si el PRD lo indica

10. **Licencias y seguridad:**
    - No hay restricciones de licencias
    - Sigue buenas prácticas de seguridad y protección de datos personales (LFPDPPP)

---

## Tickets a implementar

- **Ticket 12:** Crear carpeta `frontend` e inicializar proyecto con npm
- **Ticket 13:** Instalar dependencias necesarias (Vue.js, Vuetify, vue-i18n, etc.)
- **Ticket 14:** Configurar entorno de desarrollo (variables de entorno, archivo `.env`)

---

**Recuerda:** Consulta siempre el PRD y la documentación antes de tomar decisiones. Si alguna instrucción contradice las convenciones del sistema, prioriza las instrucciones del usuario.

## Mejores Practicas
1. Seguir las convenciones establecidas en el Product Requeriment Document (PRD)


## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.


#  TODO: Probar este prompt en V0
Eres un experto en Ingenieria de Prompts, en VueJS 3, Vuetify y con amplia experiencia como Frontend Developer
# Contexto Inicial
Tenemos una serie de tickets documentados para la historia de usuario denomidada "Buscar especialistas por especialidad y ubicación", empezaremos con la maquetación del frontend.
En cuanto al proyecto, tenemos un backend funcional, ademas de que ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.

# Intrucciones generales
Tu tarea es generar un prompt para el modelo `V0` que me ayude a maquetar la interfaz de acuerdo a la descripción de la historia de usuario y del ticket correspondiente

# Historia de usuario
```markdown
## 15. Buscar especialistas por especialidad y ubicación [US-1]

**Historia de usuario relacionada:**  
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.
```

## Ticket
```markdown
### 15.1 [Frontend] Maquetar el layout base de la aplicación (header, menú, footer, contenedor principal)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar el layout base de la aplicación Buscadoc en Vue.js, asegurando una estructura visual consistente para todas las vistas principales.
- **Detalle específico:**  
Crear los componentes base:
  - Header con logo y navegación principal.
  - Menú lateral o superior para navegación entre vistas.
  - Footer con información legal y enlaces útiles.
  - Contenedor principal para renderizar las vistas.
Utilizar Vuetify para el diseño responsivo y asegurar compatibilidad con futuras vistas.

**Criterios de aceptación:**  
- El layout base está implementado y disponible en el frontend.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El layout permite renderizar correctamente las vistas principales.
- **Pruebas de validación:**  
  - Visualizar el layout en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los componentes base se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Vuetify para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [17/08/2025] [GitHub Copilot] Ticket creado para maquetado de layout base de la aplicación.
```

## Fuentes y paleta de colores

### Colores CSS

```css
--federal-blue: #03045eff;
--honolulu-blue: #0077b6ff;
--pacific-cyan: #00b4d8ff;
--non-photo-blue: #90e0efff;
--light-cyan: #caf0f8ff;
```

[URL Paleta](https://coolors.co/palette/03045e-0077b6-00b4d8-90e0ef-caf0f8)

### Fuente

**Roboto**
[URL Fuente](https://fonts.google.com/specimen/Roboto)

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo

# Consideraciones
- El modelo tendrá acceso al diseño a partir de una imagen y debera consultarlo para detalles de UI/UX
- No hay lineamientos especidicos de accesibilidad (a11)
- Sin soporte para modo oscuro/claro, solo la paleta de colores designada
- Usar componentes desacoplados y reutilizables
- Incluir placeholders adecuados
- El modelo debe documentar desiciones de diseño si la imagen no cubre algun aspecto

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.


--- REACT ---
Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para implementar el frontent desde cero, ya que este no existe.
En cuanto al todo el proyecto, ya se cuenta con un backend funcional.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar los tickets y tener una estructura inicial donde realizar la maquetación del frontend del proyecto.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo

# Consideraciones
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto)
   * PRD: (ARCHIVO)
   * Diagrama de arquitectura: (ARCHIVO)

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para agente Vercel v0: Inicialización y estructura base del frontend Buscadoc

## Rol
Actúa como un **Frontend Engineer experto en React, Tailwind CSS, Headless UI e internacionalización (react-i18next)**, con experiencia en proyectos web y cumplimiento normativo en México (LFPDPPP).

## Objetivo
Tu tarea es implementar los tickets 12-14 para crear la estructura inicial y la configuración base del frontend del sistema Buscadoc. El backend ya está implementado y expone una API REST con formato de respuesta estándar.

---

## Contexto y requisitos clave

- **Stack:** React, Tailwind CSS, Headless UI, react-i18next, axios, react-router-dom, dotenv.
- **Internacionalización:** Soporte multilenguaje desde el inicio (español e inglés).
- **Consumo de API:** Usar axios y variables de entorno para la URL base.
- **Formateo y calidad:** Configurar Prettier y ESLint.
- **Documentación:** Incluir README en español con instrucciones de uso y variables de entorno.
- **No incluir archivos sensibles (.env) en el control de versiones.**

---

## Estructura recomendada de carpetas y archivos

Crea la siguiente estructura:
```
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   │   └── api.js
│   ├── i18n/
│   │   ├── index.js
│   │   ├── es.json
│   │   └── en.json
│   ├── styles/
│   │   └── tailwind.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── prettier.config.js
├── .eslintrc.js
└── README.md
```

## Fuentes y paleta de colores

### Colores CSS

```css
--federal-blue: #03045eff;
--honolulu-blue: #0077b6ff;
--pacific-cyan: #00b4d8ff;
--non-photo-blue: #90e0efff;
--light-cyan: #caf0f8ff;
```

[URL Paleta](https://coolors.co/palette/03045e-0077b6-00b4d8-90e0ef-caf0f8)

### Fuente

**Roboto**
[URL Fuente](https://fonts.google.com/specimen/Roboto)

---

## Instrucciones detalladas para el agente

1. **Inicializa el proyecto:**
   - Inicializa el proyecto ejecutando `npm init -y`.
2. **Instala las dependencias principales:**
   - `react`, `react-dom`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `@headlessui/react`, `react-i18next`, `i18next`, `axios`, `dotenv`.
   - Instala Prettier y ESLint para formateo y calidad de código.
3. **Configura Tailwind CSS:**
   - Genera los archivos de configuración (`tailwind.config.js`, `postcss.config.js`).
   - Crea el archivo base de estilos en `src/styles/tailwind.css` e inclúyelo en el entrypoint.
   - Usa la paleta de colores y fuente Roboto del PRD.
4. **Configura internacionalización:**
   - Implementa `react-i18next` en `src/i18n/` con archivos de traducción `es.json` y `en.json`.
   - Usa `APP_I18N_LOCALE` como idioma por defecto desde variables de entorno.
5. **Configura consumo de API:**
   - Crea `src/services/api.js` usando axios y la variable `APP_API_URL` del `.env`.
6. **Configura variables de entorno:**
   - Crea `.env.example` con:
     ```
     APP_API_URL=https://localhost:3000
     APP_I18N_LOCALE=es
     ```
   - Asegúrate de que `.env` esté en `.gitignore`.
7. **Configura Prettier y ESLint:**
   - Añade reglas recomendadas para React y Tailwind.
8. **Crea un ejemplo base funcional:**
   - Implementa un componente `App.jsx` que muestre un texto traducido y realice una petición de prueba a la API usando axios.
   - Incluye rutas básicas con `react-router-dom`.
9. **Documenta en español:**
   - El README debe explicar cómo instalar dependencias, configurar variables de entorno, iniciar el proyecto y estructura de carpetas.
   - Explica cómo agregar nuevos idiomas y consumir la API.

---

## Consideraciones adicionales

- El backend responde con el siguiente formato estándar:
  ```json
  {
    "code": 200,
    "message": "success",
    "payload": { ... }
  }
  ```
- El frontend debe estar preparado para manejar mensajes y errores en inglés y mostrar traducciones al usuario.
- El sistema debe ser escalable y fácil de mantener, siguiendo las mejores prácticas de React moderno.

## Salida esperada
- Entrega la estructura de carpetas y archivos iniciales, los archivos de configuración y un ejemplo funcional mínimo, todo documentado en español y listo para comenzar la maquetación del frontend de Buscadoc.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.




Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado ma maquetación del frontend, actualmente ya tenemos un proyecto base basado en React donde podemos trabajar para realizar la maquetación de las vistas del proyecto.
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar en la maquetación el layout que usaran los visitantes no autenticados y los pacientes logueados en el proyecto de frontend.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usurio lo indique
- Se deberan crear componentes para que puedan ser reutilizados.
- Debe ser responsivo para ajustarse a dispositivos moviles.

# Consideraciones
- El angente tendrá acceso a la imagen del layout en el contexto
- El layout maquetado servirá como base para maquetar las otras vistes del proyecto.
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que no tendrá acceso a ellos al ejecutar la tarea:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para agente Vercel v0: Maquetación del Layout para Visitantes y Pacientes en Buscadoc

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura actual. Sigue las convenciones de nombres en PascalCase y documenta tus decisiones de diseño.

---

## Contexto

- El proyecto ya cuenta con una base en React, Vite y Tailwind CSS, con internacionalización y estructura modular.
- Dispones de la imagen del layout a maquetar en el contexto.

---

## Objetivo

Maqueta el layout base que será utilizado por:
- Visitantes no autenticados
- Pacientes autenticados

Este layout servirá como base para el resto de las vistas del proyecto. No generes otras vistas a menos que el usuario lo indique explícitamente.

---

## Requisitos y mejores prácticas

1. **Responsive Design:**  
   El layout debe ser completamente responsive, adaptándose a dispositivos móviles, tablets y desktop. Utiliza los breakpoints recomendados por Tailwind CSS.

2. **Componentización y reutilización:**  
   - Divide el layout en componentes reutilizables (Navbar, Footer, Sidebar, etc.).
   - Usa PascalCase para nombres de componentes y carpetas.
   - Incluye placeholders (`children` o similares) para contenido dinámico.

3. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

4. **Enlaces y navegación:**  
   - Incluye enlaces reales a las rutas principales (ejemplo: Home, Buscar especialistas, Mi perfil, Cerrar sesión).
   - Usa `react-router-dom` para la navegación.

5. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que el layout sea navegable con teclado.

6. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen del layout no cubre algún aspecto.
   - Si tomas decisiones de diseño por falta de información, documenta el razonamiento en comentarios.

7. **Placeholders y slots:**  
   - Incluye áreas claramente marcadas para contenido dinámico (por ejemplo, `{children}` en React).

8. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No incluyas lógica de negocio ni llamadas a la API en el layout.

---

## Salida esperada

- Archivos de componentes React en PascalCase, siguiendo la estructura del proyecto.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Layout funcional y responsive, listo para ser extendido en futuras vistas.

---

## Ejemplo de estructura esperada
```
src/
├── components/
│   ├── Navbar/
│   │   └── Navbar.jsx
│   ├── Footer/
│   │   └── Footer.jsx
│   ├── Sidebar/
│   │   └── Sidebar.jsx
│   └── Layout/
│       └── MainLayout.jsx
├── pages/
│   └── (placeholders para futuras vistas)
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
├── App.jsx
├── main.jsx
└── index.html
```

---

## Notas adicionales

- No generes otras vistas ni lógica adicional.
- Si la imagen del layout no especifica algún comportamiento (por ejemplo, menú móvil), aplica buenas prácticas y documenta tu decisión.
- No incluyas pruebas visuales/manuales en esta entrega.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.



Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado la maquetación del frontend, actualmente contamos con lo siguiente:
- Un proyecto base funcional basado en React
- Se ha implementado un Layout para visitante no autenticas y pacientes logueados
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar la maquetación de la vista de Login para los usuarios.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usuario lo indique
- Se deberan crear componentes para que puedan ser reutilizados.
- Si es posible reutilizar los layouts y componentes existentes en el proyecto
- Respetar la paleta de colores y fuentes iniciales del proyecto
- Debe ser responsivo para ajustarse a dispositivos moviles.
- Utilizar convención de nombre con Pascal Case

# Consideraciones
- El agente tendrá acceso a la imagen del diseño en el contexto
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que no tendrá acceso a ellos al ejecutar la tarea:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





# Prompt para agente Vercel v0: Maquetación de la Vista de Login en Buscadoc

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura hexagonal. Usa PascalCase para nombres de componentes y carpetas. Documenta tus decisiones de diseño y estructura el código con comentarios claros.

---

## Contexto

- El proyecto base ya está implementado en React y cuenta con layouts y componentes reutilizables.
- El diseño de la vista de Login está disponible como imagen en el contexto.

---

## Objetivo

Maquetar la vista de Login para usuarios, siguiendo el diseño proporcionado y reutilizando los layouts y componentes existentes en el proyecto siempre que sea posible. No generes otras vistas a menos que el usuario lo indique explícitamente.

---

## Requisitos y mejores prácticas

1. **Componentización y reutilización:**  
   - Divide la vista de Login en componentes reutilizables (por ejemplo, LoginForm, Input, Button, etc.).
   - Usa PascalCase para nombres de componentes y carpetas.
   - Reutiliza layouts y componentes existentes del proyecto cuando sea posible.

2. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

3. **Responsive Design:**  
   - El diseño debe ser completamente responsive, adaptándose a dispositivos móviles, tablets y desktop. Utiliza los breakpoints recomendados por Tailwind CSS.

4. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que el formulario sea navegable con teclado.

5. **Estados y validaciones:**  
   - Si la imagen del diseño no cubre algún estado (errores de validación, loading, mensajes de error), documenta las decisiones de diseño en comentarios y aplica buenas prácticas.

6. **Enlaces y navegación:**  
   - Si el diseño incluye enlaces como “¿Olvidaste tu contraseña?” o “Crear cuenta”, respétalos según la imagen. Usa `react-router-dom` para la navegación si corresponde.

7. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen no cubre algún aspecto.

8. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No incluyas lógica de negocio ni llamadas a la API en la maquetación.

---

## Salida esperada

- Archivos de componentes React en PascalCase, siguiendo la estructura del proyecto.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Vista de Login funcional y responsive, lista para ser conectada a la lógica de autenticación.

---

## Ejemplo de estructura esperada
```
src/
├── components/
│   ├── LoginForm/
│   │   └── LoginForm.jsx
├── pages/
│   └── Login.jsx
├── layouts/
│   └── MainLayout.jsx
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
├── App.jsx
├── main.jsx
└── index.html
```

---

## Notas adicionales

- No generes otras vistas ni lógica adicional.
- Si la imagen del diseño no especifica algún comportamiento, aplica buenas prácticas y documenta tu decisión.
- Reutiliza layouts y componentes existentes siempre que sea posible.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.








Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado la maquetación del frontend, actualmente contamos con lo siguiente:
- Un proyecto base funcional basado en React
- Se ha implementado un Layout para visitante no autenticas y pacientes logueados
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar la maquetación de la vista de Registro para los usuarios.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usuario lo indique
- Se deberan crear componentes para que puedan ser reutilizados.
- Si es posible reutilizar los layouts y componentes existentes en el proyecto
- Respetar la paleta de colores y fuentes iniciales del proyecto
- Debe ser responsivo para ajustarse a dispositivos moviles.
- Utilizar convención de nombre con Pascal Case

# Consideraciones
- El agente tendrá acceso a la imagen del diseño en el contexto
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que no tendrá acceso a ellos al ejecutar la tarea:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





# Prompt para agente Vercel v0: Maquetación de la Vista de Registro en Buscadoc

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura. Usa PascalCase para nombres de componentes y carpetas. Documenta tus decisiones de diseño y estructura el código con comentarios claros.

---

## Contexto

- El proyecto base ya está implementado en React y cuenta con layouts y componentes reutilizables.
- El diseño de la vista de Registro está disponible como imagen en el contexto.

---

## Objetivo

Maquetar la vista de Registro para usuarios, siguiendo el diseño proporcionado y reutilizando los layouts y componentes existentes en el proyecto siempre que sea posible. No generes otras vistas a menos que el usuario lo indique explícitamente.

---

## Requisitos y mejores prácticas

1. **Guíate del diseño en la imagen adjunta al contexto:**  
   - Todos los campos, enlaces y elementos visuales deben apegarse al diseño proporcionado.
   - Si el diseño no cubre algún estado (errores de validación, loading, mensajes de éxito/error), documenta las decisiones de diseño en comentarios y aplica buenas prácticas.

2. **Componentización y reutilización:**  
   - Divide la vista de Registro en componentes reutilizables (por ejemplo, RegisterForm, etc.).
   - Usa PascalCase para nombres de componentes y carpetas.
   - Reutiliza layouts y componentes existentes del proyecto cuando sea posible.

3. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

4. **Responsive Design:**  
   - El diseño debe ser completamente responsive, adaptándose a dispositivos móviles, tablets y desktop. Utiliza los breakpoints recomendados por Tailwind CSS.

5. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que el formulario sea navegable con teclado.

6. **Enlaces y navegación:**  
   - Si el diseño incluye enlaces como “¿Ya tienes cuenta? Inicia sesión” o términos y condiciones, respétalos según la imagen. Usa `react-router-dom` para la navegación si corresponde.

7. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen no cubre algún aspecto.

8. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No incluyas lógica de negocio ni llamadas a la API en la maquetación.
   - Respeta la paleta de colores y fuentes iniciales del proyecto.

---

## Salida esperada

- Archivos de componentes React en PascalCase, siguiendo la estructura del proyecto.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Vista de Registro funcional y responsive, lista para ser conectada a la lógica de registro.

---

## Ejemplo de estructura esperada
```
src/
├── components/
│   ├── RegisterForm/
│   │   └── RegisterForm.jsx
├── pages/
│   └── Register.jsx
├── layouts/
│   └── MainLayout.jsx
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
├── App.jsx
├── main.jsx
└── index.html
```
---

## Notas adicionales
- No generes otras vistas ni lógica adicional.
- Si la imagen del diseño no especifica algún comportamiento, aplica buenas prácticas y documenta tu decisión.
- Reutiliza layouts y componentes existentes siempre que sea posible.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.





Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado la maquetación del frontend, actualmente contamos con lo siguiente:
- Un proyecto base funcional basado en React
- Se ha implementado un Layout para visitante no autenticadas y pacientes logueados
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar la maquetación de la vista de busqueda de especialistas médicos.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usuario lo indique
- Se deberan crear componentes para que puedan ser reutilizados.
- Si es posible reutilizar los layouts y componentes existentes en el proyecto
- Respetar la paleta de colores y fuentes iniciales del proyecto
- Debe ser responsivo para ajustarse a dispositivos moviles.
- Utilizar convención de nombre con Pascal Case

# Consideraciones
- El agente tendrá acceso a la imagen del diseño en el contexto
- Esta vista funcionará como Home del sitio
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que no tendrá acceso a ellos al ejecutar la tarea:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



# Prompt para agente Vercel v0: Maquetación de la Vista de Búsqueda de Especialistas Médicos (Home) en Buscadoc

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura. Usa PascalCase para nombres de componentes y carpetas. Documenta tus decisiones de diseño y estructura el código con comentarios claros.

---

## Contexto

- El proyecto base ya está implementado en React y cuenta con layouts y componentes reutilizables.
- El diseño de la vista de búsqueda de especialistas médicos (Home) está disponible como imagen en el contexto.

---

## Objetivo

Maquetar la vista de búsqueda de especialistas médicos, que funcionará como Home del sitio, siguiendo el diseño proporcionado y reutilizando los layouts y componentes existentes en el proyecto siempre que sea posible. No generes otras vistas a menos que el usuario lo indique explícitamente.

---

## Requisitos y mejores prácticas

1. **Guíate del diseño en la imagen adjunta al contexto:**  
   - El campo de búsqueda por texto debe ser solo para el nombre del médico.
   - La valoración debe implementarse como un control personalizado, el cual consta de 5 iconos de estrellas que al darle clic asignan una valoracion del 1 al 5.
   - Los demás filtros deben ser dropdowns.
   - Si el diseño no cubre algún estado (sin resultados, loading, errores), documenta las decisiones de diseño en comentarios y aplica buenas prácticas.

2. **Componentización y reutilización:**  
   - Divide la vista en componentes reutilizables (por ejemplo, SearchBar, DoctorCard, StarRating, DropdownFilter, etc.).
   - Usa PascalCase para nombres de componentes y carpetas.
   - Reutiliza layouts y componentes existentes del proyecto cuando sea posible.

3. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

4. **Responsive Design:**  
   - El diseño debe ser completamente responsive, adaptándose a dispositivos móviles, tablets y desktop. Utiliza los breakpoints recomendados por Tailwind CSS.

5. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que todos los controles sean navegables con teclado.

6. **Paginación:**  
   - La carga de la siguiente página de elementos debe realizarse mediante un botón "Ver más médicos", no scroll infinito.

7. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen no cubre algún aspecto.

8. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No incluyas lógica de negocio ni llamadas a la API en la maquetación.
   - Respeta la paleta de colores y fuentes iniciales del proyecto.

---

## Salida esperada

- Archivos de componentes React en PascalCase, siguiendo la estructura del proyecto.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Vista de búsqueda funcional y responsive, lista para ser conectada a la lógica de búsqueda.

---

## Ejemplo de estructura esperada
```
src/
├── components/
│   ├── SearchBar/
│   │   └── SearchBar.jsx
│   ├── DoctorCard/
│   │   └── DoctorCard.jsx
│   ├── StarRating/
│   │   └── StarRating.jsx
│   ├── DropdownFilter/
│   │   └── DropdownFilter.jsx
├── pages/
│   └── Home.jsx
├── layouts/
│   └── MainLayout.jsx
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
├── App.jsx
├── main.jsx
└── index.html
```
---

## Notas adicionales

- No generes otras vistas ni lógica adicional.
- Si la imagen del diseño no especifica algún comportamiento, aplica buenas prácticas y documenta tu decisión.
- Reutiliza layouts y componentes existentes siempre que sea posible.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.



Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado la maquetación del frontend, actualmente contamos con lo siguiente:
- Un proyecto base funcional basado en React
- Se ha implementado un Layout para visitante no autenticadas y pacientes logueados
- Varias vistas funcionales
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar la maquetación de la vista de para que un medico gestione su agenda medica.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usuario lo indique
- Se deberan crear componentes para que puedan ser reutilizados.
- Si es posible reutilizar los layouts y componentes existentes en el proyecto
- Respetar la paleta de colores y fuentes iniciales del proyecto
- Debe ser responsivo para ajustarse a dispositivos moviles.
- Utilizar convención de nombre con Pascal Case

# Consideraciones
- El agente tendrá acceso a la imagen del diseño en el contexto
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que el agente no tendrá acceso y el prompt debe contener la información necesaria de ellos:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.






# Prompt para agente Vercel v0: Maquetación de la Vista de Gestión de Agenda Médica para Médicos en Buscadoc

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura. Usa PascalCase para nombres de componentes y carpetas. Documenta tus decisiones de diseño y estructura el código con comentarios claros.

---

## Contexto

- El proyecto base ya está implementado en React y cuenta con layouts y componentes reutilizables.
- El diseño de la vista de gestión de agenda médica está disponible como imagen en el contexto.

---

## Objetivo

Maquetar la vista para que un médico gestione su agenda médica, siguiendo el diseño proporcionado y reutilizando los layouts y componentes existentes en el proyecto siempre que sea posible. No generes otras vistas a menos que el usuario lo indique explícitamente.

---

## Requisitos y mejores prácticas

1. **Guíate del diseño en la imagen adjunta al contexto:**  
   - La vista debe permitir visualizar citas y realizar acciones como confirmar, rechazar y cancelar citas, según lo mostrado en el diseño.
   - Si el diseño no cubre algún estado (sin citas, loading, errores), documenta las decisiones de diseño en comentarios y aplica buenas prácticas.

2. **Componentización y reutilización:**  
   - Divide la vista en componentes reutilizables (por ejemplo, AppointmentTable, AppointmentRow, ActionButton, Modal, etc.).
   - Usa PascalCase para nombres de componentes y carpetas.
   - Reutiliza layouts y componentes existentes del proyecto cuando sea posible.

3. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

4. **Responsive Design:**  
   - El diseño debe ser completamente responsive, adaptándose a dispositivos móviles, tablets y desktop. Utiliza los breakpoints recomendados por Tailwind CSS.

5. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que todos los controles sean navegables con teclado.

6. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen no cubre algún aspecto.

7. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No incluyas lógica de negocio ni llamadas a la API en la maquetación.
   - Respeta la paleta de colores y fuentes iniciales del proyecto.

---

## Salida esperada

- Archivos de componentes React en PascalCase, siguiendo la estructura del proyecto.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Vista de gestión de agenda funcional y responsive, lista para ser conectada a la lógica de negocio.

---

## Ejemplo de estructura esperada
```
src/
├── components/
│   ├── AppointmentTable/
│   │   └── AppointmentTable.jsx
│   ├── AppointmentRow/
│   │   └── AppointmentRow.jsx
│   ├── ActionButton/
│   │   └── ActionButton.jsx
│   └── Modal/
│       └── Modal.jsx
├── pages/
│   └── Agenda.jsx
├── layouts/
│   └── MainLayout.jsx
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
├── App.jsx
├── main.jsx
└── index.html
```
---

## Notas adicionales

- No generes otras vistas ni lógica adicional.
- Si la imagen del diseño no especifica algún comportamiento, aplica buenas prácticas y documenta tu decisión.
- Reutiliza layouts y componentes existentes siempre que sea posible.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.





Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado la maquetación del frontend, actualmente contamos con lo siguiente:
- Un proyecto base funcional basado en React
- Se ha implementado un Layout para visitante no autenticadas y pacientes logueados
- Varias vistas funcionales
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a implementar la maquetación de la vista de para que un medico edite su horario de disponibilidad.

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usuario lo indique
- Se deberan crear componentes para que puedan ser reutilizados.
- Si es posible reutilizar los layouts y componentes existentes en el proyecto
- Respetar la paleta de colores y fuentes iniciales del proyecto
- Debe ser responsivo para ajustarse a dispositivos moviles.
- Utilizar convención de nombre con Pascal Case

# Consideraciones
- El agente tendrá acceso a la imagen del diseño en el contexto
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que el agente no tendrá acceso y el prompt debe contener la información necesaria de ellos:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.








# Prompt para agente Vercel v0: Maquetación de la Vista de Edición de Horario de Disponibilidad para Médicos en Buscadoc

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura. Usa PascalCase para nombres de componentes y carpetas. Documenta tus decisiones de diseño y estructura el código con comentarios claros.

---

## Contexto

- El proyecto base ya está implementado en React y cuenta con layouts y componentes reutilizables.
- El diseño de la vista de edición de horario de disponibilidad está disponible como imagen en el contexto.

---

## Objetivo

Maquetar la vista para que un médico edite su horario de disponibilidad, siguiendo el diseño proporcionado y reutilizando los layouts y componentes existentes en el proyecto siempre que sea posible. No generes otras vistas a menos que el usuario lo indique explícitamente.

---

## Requisitos y mejores prácticas

1. **Guíate del diseño en la imagen adjunta al contexto:**  
   - La edición de horario debe contemplar solo días de la semana y horas, según lo mostrado en el diseño.
   - Si el diseño no cubre algún estado (sin horarios, errores, loading, etc.), documenta las decisiones de diseño en comentarios y aplica buenas prácticas.

2. **Componentización y reutilización:**  
   - Divide la vista en componentes reutilizables (por ejemplo, ScheduleForm, etc.).
   - Usa PascalCase para nombres de componentes y carpetas.
   - Reutiliza layouts y componentes existentes del proyecto cuando sea posible.

3. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

4. **Responsive Design:**  
   - El diseño debe ser completamente responsive, adaptándose a dispositivos móviles, tablets y desktop. Utiliza los breakpoints recomendados por Tailwind CSS.

5. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que todos los controles sean navegables con teclado.

6. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen no cubre algún aspecto.

7. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No incluyas lógica de negocio ni llamadas a la API en la maquetación.
   - Respeta la paleta de colores y fuentes iniciales del proyecto.

---

## Salida esperada

- Archivos de componentes React en PascalCase, siguiendo la estructura del proyecto.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Vista de edición de horario funcional y responsive, lista para ser conectada a la lógica de negocio.

---

## Ejemplo de estructura esperada
```
src/
├── components/
│   ├── ScheduleForm/
│   │   └── ScheduleForm.jsx
├── pages/
│   └── EditSchedule.jsx
├── layouts/
│   └── MainLayout.jsx
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.js
├── services/
│   └── api.js
├── styles/
│   └── tailwind.css
├── App.jsx
├── main.jsx
└── index.html
```

---

## Notas adicionales

- No generes otras vistas ni lógica adicional.
- Si la imagen del diseño no especifica algún comportamiento, aplica buenas prácticas y documenta tu decisión.
- Reutiliza layouts y componentes existentes siempre que sea posible.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.







Eres un experto en Ingenieria de Prompts y con experiencia como Frontend Developer
# Contexto Inicial
Nos encontramos implementado la maquetación del frontend, actualmente contamos con lo siguiente:
- Un proyecto base funcional basado en React
- Se ha implementado un Layout para visitante no autenticadas y pacientes logueados
- Varias vistas funcionales
Como parte de la documentación se cuenta con un product requirement document (PRD), el diagrama de arquitectura y la documentación del API que se va consumir.

# Intrucciones generales
Tu tarea es generar un prompt para el agente Vercel `v0` que me ayude a mejorar la maquetación de la vista "DoctorProfile.tsx"

# Requerimientos visuales
- Integrar los elementos faltantes del layout: NavBar, Footer, etc
- Conservar los elementos y la funcionalidad existentes de la vista mencionada

# Mejores practicas
- Incluye el rol en el que debe actuar el modelo
- El agente no realizará otras vistas a menos que el usuario lo indique
- Reutilizar los layouts y componentes existentes en el proyecto
- Respetar la paleta de colores y fuentes iniciales del proyecto
- Debe ser responsivo para ajustarse a dispositivos moviles.
- Utilizar convención de nombre con Pascal Case

# Consideraciones
- Para crear este prompt consulta los siguientes documentos (mencionados en el contexto) ya que el agente no tendrá acceso y el prompt debe contener la información necesaria de ellos:
   * PRD: #file:product_requirement_document.md 
   * Diagrama de arquitectura: #file:diagrama_visual_arquitectura.md 
   * README del proyecto: #file:README.md 
   * Package.json del proyecto: #file:package.json 

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.





# Prompt para agente Vercel v0: Mejora de la Maquetación en la Vista DoctorProfile.tsx

## Rol
Actúa como **Frontend Developer experto en React, Tailwind CSS, Headless UI, internacionalización (react-i18next) y patrones de componentes reutilizables**. Aplica las mejores prácticas de accesibilidad, seguridad, internacionalización y arquitectura. Usa PascalCase para nombres de componentes y carpetas. Documenta tus decisiones de diseño y estructura el código con comentarios claros.

---

## Contexto

- El proyecto base ya está implementado en React y cuenta con layouts y componentes reutilizables.
- La vista `DoctorProfile.tsx` ya existe y contiene elementos y funcionalidad que deben conservarse.
- El diseño actualizado incluye elementos faltantes como NavBar y Footer.

---

## Objetivo

Mejorar la maquetación de la vista `DoctorProfile.tsx` integrando los elementos faltantes del layout (NavBar, Footer, etc.), conservando todos los elementos y la funcionalidad existentes de la vista.

---

## Requisitos y mejores prácticas

1. **Integración de elementos de layout:**  
   - Añade los elementos faltantes del layout (NavBar, Footer, etc.) según el diseño y reutiliza los componentes existentes del proyecto.
   - Asegúrate de que la vista sea completamente responsive y se adapte a dispositivos móviles, tablets y desktop.

2. **Internacionalización:**  
   - Usa `react-i18next` para todos los textos visibles.
   - Los textos deben estar en los archivos de localización (`es.json`, `en.json`).

3. **Accesibilidad y buenas prácticas:**  
   - Usa etiquetas semánticas y atributos ARIA donde corresponda.
   - Asegúrate de que todos los controles sean navegables con teclado.

4. **Documentación y comentarios:**  
   - Comenta el código explicando la estructura, puntos de personalización y decisiones de diseño, especialmente si la imagen del layout no cubre algún estado o comportamiento (por ejemplo, responsive, loading, errores).

5. **Convenciones y estructura:**  
   - Sigue la estructura de carpetas y convenciones del proyecto (ver README).
   - No modifiques la lógica de negocio ni las llamadas a la API ya existentes en `DoctorProfile.tsx`.
   - Respeta la paleta de colores y fuentes iniciales del proyecto.

---

## Salida esperada

- Código de la vista `DoctorProfile.tsx` mejorado, integrando los elementos de layout faltantes y conservando la funcionalidad existente.
- Código comentado y documentado en español.
- Todos los textos internacionalizados.
- Vista completamente responsive y alineada al diseño.

---

## Notas adicionales

- No generes otras vistas ni lógica adicional.
- Reutiliza layouts y componentes existentes siempre que sea posible.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.




Eres un experto en Ingenieria de Prompts y en desarrollo de Frontend con React y Next
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para las historias de usuario tituladas "Registro de paciente" y "Registro de médico especialista", vamos a conectar la vista correspondiente con el backend mediante el API y dotarla de funcionalidad.
La vista ya se encuentra maquetada con los componentes visuales necesarios definidos en el diseño, así mismo el proyecto ya cuenta con las carpetas y estructura para modificar los arhivos necesarios.
Como parte de la documentación se cuenta con un product requirement document (PRD), la documentación del API y la documentación del proyecto de frontend.

# Intrucciones generales
Tu tarea es generar un prompt para el modelo (ChatGPT 4.1) que me ayude a implementar la historias de usuario y sus series de tickets para ver el registro de usuarios.

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones

## Para generar el prompt
- Inicialmente tendrás acceso a la documentación descrita en el contexto y debera consultarla para generar el prompt que se pide

## Al ejecutar el prompt resultante
- El modelo tendrá acceso a la documentación descrita en el contexto
- El modelo tendra que revisar la documentación para ejectuar el prompt resultante
- Incluir una tarea de internacionalización en caso de agregar o modificar textos
- El modelo deberá utilizar y modificar las propiedades de los componentes visuales para cumplir con los requerimientos, esto sin modificarlos visualmente, es decir, solo agregar la funcionalidad faltante
- El modelo debera pedirle al usuario que agregue arhivos falantes al contexto si lo requiere para finalizar la tarea

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.




# Prompt para ChatGPT 4.1: Implementación de Registro de Usuarios en Buscadoc

## Descripción

Actúa como **desarrollador frontend experto en React y Next.js**. Tu tarea es implementar la funcionalidad de registro de usuarios (paciente y médico especialista) en la plataforma Buscadoc, conectando los formularios ya maquetados con el backend mediante los endpoints definidos en la documentación. Debes cumplir con los criterios de aceptación de los tickets, las mejores prácticas de validación, internacionalización y arquitectura, y respetar el formato estándar de respuesta de la API.

## Instrucciones

1. **Revisa la documentación adjunta**:
   - Tickets de registro de usuario y médico especialista.
   - Product Requirement Document (PRD).
   - Documentación del API (Swagger).
   - README del frontend.

2. **Validaciones en frontend**:
   - Implementa validaciones para todos los campos requeridos (nombre, apellido, email, teléfono, contraseña, confirmación de contraseña, tipo de usuario, Cédula profesional (license_number) para médicos).
   - Valida fuerza de contraseña, coincidencia de contraseñas, formato de email y obligatoriedad de Cédula profesional (license_number) para médicos.
   - El botón de registro debe estar deshabilitado hasta que todos los campos sean válidos.

3. **Internacionalización**:
   - Antes de agregar nuevos textos, revisa los archivos de internacionalización existentes.
   - Si faltan claves, agrégalas en los archivos correspondientes siguiendo el patrón actual.
   - Todos los mensajes de validación y respuesta deben ser traducibles usando react-i18next.

4. **Consumo de API**:
   - Conecta el formulario con el endpoint correspondiente (`/api/auth/register/patient` o `/api/auth/register/doctor`).
   - Envía los datos en el formato esperado por el backend.
   - Maneja las respuestas siguiendo el formato estándar de la API (`code`, `message`, `payload`).
   - Muestra mensajes claros y traducibles al usuario según el resultado (éxito o error).

5. **Manejo de respuestas**:
   - Si el registro es exitoso, muestra un mensaje de éxito y redirige automáticamente a la vista de login (`/login`).
   - Si hay errores (validación, duplicados, etc.), muestra los mensajes de error proporcionados por el backend, asegurando que sean traducibles.

6. **Componentes visuales**:
   - Utiliza y modifica únicamente las propiedades de los componentes visuales existentes para agregar la funcionalidad requerida, sin alterar el diseño visual.
   - Si existe un componente global de notificaciones, úsalo para mostrar mensajes.

7. **Cumplimiento de arquitectura y seguridad**:
   - Respeta la arquitectura y las convenciones de seguridad e internacionalización descritas en la documentación.
   - Asegúrate de que los datos personales se manejen conforme a la LFPDPPP.

8. **Solicita archivos faltantes**:
   - Si necesitas archivos adicionales para completar la tarea (servicios, componentes, archivos de i18n, etc.), pídele al usuario que los agregue al contexto.

## Checklist final

- [ ] Validaciones de frontend implementadas y botón deshabilitado hasta que sean válidas.
- [ ] Mensajes y textos internacionalizados y revisados en los archivos de i18n.
- [ ] Consumo correcto del endpoint y manejo del formato estándar de respuesta.
- [ ] Mensajes de éxito y error claros, traducibles y mostrados al usuario.
- [ ] Redirección automática a `/login` tras registro exitoso.
- [ ] Uso de componentes visuales y de notificaciones existentes.
- [ ] Cumplimiento de arquitectura y normativas de seguridad.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Revisa si tienes todos los archivos necesarios en el contexto, de lo contrario pide al usuario que los agregue
- En cada paso de la lista menciona el archivo que se va a crear o modificar e incluye el código que se va agregar

Antes de realizar la tarea revisa mis requisitos ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.







Eres un experto en Ingenieria de Prompts, con gran experiencia como Frontend developer y con conocimientos en React, Next y Tailwind CSS
# Contexto Inicial
Se ha realizado la maquetación del frontend para un sistema de búsqueda de especialidades médicas y profesionales de la salud denominado "Buscadoc".
Así mismo se tiene el API de un backend funcional, del cual ya se tiene una definición.
Finalmente se tiene una serie de tickets de trabajo para el frontend.

# Intrucciones generales
Tu tarea es generar un prompt inicial para el modelo (ChatGPT 4.1) que revise si la vista o vistas, así como sus componentes, cumplen con los requerimientos del ticket, para ello debe seguir las siguientes instrucciones

# Instrucciones
1. El modelo deberá revisar el ticket, la documentación del contexto, así como el código de la vista y su componente para determinar si se cumplen con los criterios del ticket
   - Deberá pedir al usuario los archivos faltantes si no estan en el contexto
2. Si el código de la vista y sus componentes cumple con los criterios del ticket el modelo deberá ir al paso 1
3. En dado caso que la vista y sus componentes no cumplan con el ticket 
   * El modelo debe generar una lista de criterios que faltan por completar
   * Posteriormente el modelo debe generar una lista de pasos para implementar los criterios faltantes del ticket
   * Al final el modelo debe corroborar que se hayan cumplido los criterios
4. Despues de implementar los criterios del ticket anterior debe pedir un nuevo ticket

# Mejores practicas
- Para el prompt incluye el rol en el que debe actual el chatbot
- El modelo deberá concentrarse implementar lo faltante sin modificar la parte visual de los componentes
- El prompt resultante deberá ser reutilizable

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.



----
# Prompt Inicial para Revisión de Tickets en Buscadoc

## Rol del modelo
Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown

```
## Ticket
```markdown

```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.


# Confirmación
<Respuesta preguntas>

Revisa mi información, muestrame el analisis de criterios y dudas, así como el plan para implementar lo faltante.

# Implementar puntos
Muestrame solo la implementación del punto <numero>: <titulo>, dime que archivos se tienen que modificar y en donde se debe realizar la modificación

----



Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** REG-PAC-01  
**Título:** Registro de paciente  
**Descripción:**  
Como visitante, quiero registrarme como paciente proporcionando mi nombre, correo electrónico y contraseña segura, para poder agendar citas y gestionar mi perfil en la plataforma.
```
## Ticket
```markdown
##### 1.1.5 [Frontend] Crear formulario de registro de paciente

**Descripción detallada:**  
Diseñar el formulario de registro de paciente en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: nombre, apellido, email, contraseña, confirmación de contraseña y selección de tipo de usuario (paciente).

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye todos los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "Paciente".
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de registro está deshabilitado hasta que todos los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.
- [ ] El Toogle de registro como medico se encuentra en estado "No" 
- [ ] El Toogle de registro como medico al estar desactivado oculta el campo de "Cedula profesional"
- [ ] Los titulos y labels de la vista se encuentran internacionalizados

**Estimación de tiempo:**  
2 horas
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.








Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** REG-PAC-01  
**Título:** Registro de paciente  
**Descripción:**  
Como visitante, quiero registrarme como paciente proporcionando mi nombre, correo electrónico y contraseña segura, para poder agendar citas y gestionar mi perfil en la plataforma.
```
## Ticket
```markdown
##### 1.1.6 [Frontend] Integrar consumo del endpoint de registro y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de registro, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de registro y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**  
- [ ] El endpoint para el registro de un paciente es `POST /api/auth/register/patient`
- [ ] Para que un paciente se pueda registrar el Toggle "Registrarme como médico" debe estar desactivado
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito al usuario tras registro exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El usuario es redirigido al login tras registro exitoso.
- [ ] Los campos obligatorios y opcionales en el formulario deben coincidir con los definidos en el API del endpoint

**Estimación de tiempo:**  
1 hora
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.





Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** REG-MED-01  
**Título:** Registro de médico especialista  
**Descripción:**  
Como visitante, quiero registrarme como médico especialista proporcionando mi nombre, correo electrónico, contraseña segura y número de cédula profesional, para poder ofrecer mis servicios y gestionar mi agenda en la plataforma.
```
## Ticket
```markdown
##### 1.2.5 [Frontend] Crear formulario de registro de médico especialista

**Descripción detallada:**  
Diseñar el formulario de registro de médico especialista en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: nombre, apellido, email, contraseña, confirmación de contraseña, selección de tipo de usuario (médico) y license_number.

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El label `registerFormTitle` debe contener el texto de acuerdo al tipo de usuario que se va a registrar
- [ ] El formulario incluye todos los campos requeridos.
- [ ] El Toogle de tipo de usuario está presente y desactivado para "Registrarme como médico".
- [ ] El Toogle es visualmente atractivo y tiene una separación correcta
- [ ] El campo de Cédula Profesional se muestra hasta que se active el toogle para "Registrarme como médico".
- [ ] El campo license_number es obligatorio para registro como médico y validado en frontend.
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de registro está deshabilitado hasta que todos los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.

**Estimación de tiempo:**  
2 horas
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.






Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** REG-MED-01  
**Título:** Registro de médico especialista  
**Descripción:**  
Como visitante, quiero registrarme como médico especialista proporcionando mi nombre, correo electrónico, contraseña segura y número de cédula profesional, para poder ofrecer mis servicios y gestionar mi agenda en la plataforma.
```
## Ticket
```markdown

```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.







Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** LOGIN-PAC-01  
**Título:** Login de paciente  
**Descripción:**  
Como paciente registrado, quiero iniciar sesión con mi correo electrónico y contraseña, para acceder a mi perfil, agendar citas y recibir notificaciones.
```
## Ticket
```markdown
##### 2.1.5 [Frontend] Crear formulario de login de paciente

**Descripción detallada:**  
Diseñar el formulario de login de paciente en React + Tailwind CSS + Headless UI, siguiendo el diseño y paleta de colores definidos. Debe incluir campos: email, contraseña y selección de tipo de usuario (paciente).

**Dependencias:**  
- Depende de la definición del endpoint en backend.

**Etiquetas:**  
Frontend, UI, Validación, Internacionalización

**Criterios de aceptación:**  
- [ ] El formulario incluye los campos requeridos.
- [ ] La selección de tipo de usuario está presente y por defecto en "No" para la opción "Soy un médico".
- [ ] Las validaciones de frontend muestran mensajes claros y traducibles (i18n).
- [ ] El botón de login está deshabilitado hasta que los campos sean válidos.
- [ ] El diseño sigue la paleta de colores y fuente definida.
- [ ] Se muestran mensajes de error del backend en el idioma seleccionado.

**Estimación de tiempo:**  
1 hora
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.








Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** LOGIN-PAC-01  
**Título:** Login de paciente  
**Descripción:**  
Como paciente registrado, quiero iniciar sesión con mi correo electrónico y contraseña, para acceder a mi perfil, agendar citas y recibir notificaciones.
```
## Ticket
```markdown
##### 2.1.6 [Frontend] Integrar consumo del endpoint de login y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de login, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de login y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**
- [ ] El endpoint para realizar el login del paciente es `POST /api/auth/login/patient`
- [ ] Se envia la información al endpoint de pacientes cuando el toogle de "Soy un médico" se encuentra en "no"  
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito y el usuario es redirigido al portal de inicio tras login exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El JWT se almacena de forma segura en el frontend.

**Estimación de tiempo:**  
1 hora
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.








Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
**ID:** LOGIN-MED-01  
**Título:** Login de médico especialista  
**Descripción:**  
Como médico especialista registrado, quiero iniciar sesión con mi correo electrónico y contraseña, para gestionar mi perfil, agenda y recibir notificaciones.

```
## Ticket
```markdown
##### 2.2.6 [Frontend] Integrar consumo del endpoint de login y manejo de respuestas

**Descripción detallada:**  
Implementar la lógica para enviar los datos del formulario al endpoint de login, manejar respuestas exitosas y errores, y mostrar mensajes al usuario según el resultado.

**Dependencias:**  
- Depende del formulario de login y del endpoint en backend.

**Etiquetas:**  
Frontend, API REST, Internacionalización, Validación

**Criterios de aceptación:**  
- [ ] El endpoint para el inición de sesión como medico es `POST /api/auth/login/doctor`
- [ ] Se envian los datos de formulario al endpoint indicado cuando el toggle "Soy un médico" se encuentra en valor "Si"
- [ ] El formulario envía los datos correctamente al endpoint.
- [ ] Se muestra mensaje de éxito y el usuario es redirigido a "/agenda" tras un login exitoso.
- [ ] Se muestran mensajes de error claros y traducibles en caso de fallo.
- [ ] El JWT se almacena de forma segura en frontend.

**Estimación de tiempo:**  
1 hora

```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.




Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.
```
## Ticket
```markdown
### 15.2 [Frontend] Maquetar la vista de búsqueda de especialistas (formulario de filtros: especialidad, ciudad, estado)

**Descripción detallada:**  
- **Propósito:**  
Diseñar y maquetar la vista principal de búsqueda en React, permitiendo al usuario filtrar especialistas por especialidad, ciudad y estado.
- **Detalle específico:**  
Crear un formulario con los siguientes campos:
  - Input para busqueda por nombre del médico especialista
  - Select de especialidad (con datos del catálogo).
  - Select de estado (con datos del catálogo).
  - Select de ciudad (con datos del catálogo).
  - Rango de valoración minima se encuentra oculto hasta iniciar sesión
  - Select de dispinibilidad se encuentra oculto hasta iniciar sesión
  - Botón para ejecutar la búsqueda.
Maquetar el área de resultados para mostrar la lista de especialistas filtrados. Utilizar Tailwind CSS + Headless UI para el diseño responsivo y asegurar accesibilidad.

**Criterios de aceptación:**  
- La vista de búsqueda está implementada y disponible en el frontend.
- El formulario permite seleccionar filtros y ejecutar la búsqueda.
- El diseño es responsivo y cumple con las pautas de UI/UX del PRD.
- El área de resultados está lista para integrar la lógica de consumo de API.
- **Pruebas de validación:**  
  - Visualizar la vista en diferentes dispositivos y tamaños de pantalla.
  - Verificar que los campos de filtro y el área de resultados se muestran correctamente.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, UI/UX, Maquetado

**Comentarios y Notas:**  
Utilizar Tailwind CSS + Headless UI para componentes visuales y seguir la guía de estilos del PRD. Este ticket no incluye lógica de consumo de API ni internacionalización.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para maquetado de vista de búsqueda de especialistas.
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.







Actúa como **Frontend Developer experto en React, Next, Tailwind CSS e internacionalización con react-i18next**, siguiendo la arquitectura y convenciones del proyecto.

## Objetivo
Revisar si la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket proporcionado, considerando la documentación del contexto, el Product Requirement Document, el README y los archivos de código y configuración del proyecto.

## Instrucciones

1. **Revisión de contexto y archivos**
   - Analiza el ticket en formato Markdown y reconoce su estructura.
   - Consulta la documentación relevante (`docs/product_requirement_document.md`, README, diagramas, etc.).
   - Revisa los archivos de la vista y sus componentes, así como archivos de configuración relacionados.
   - Si falta algún archivo necesario para la revisión, solicita al usuario que lo proporcione.

2. **Validación de criterios**
   - Verifica que la vista y sus componentes cumplen con los criterios funcionales y visuales del ticket.
   - Revisa permisos y roles de usuario según lo indicado en el ticket.
   - Valida la configuración de internacionalización y multilenguaje.
   - Asegúrate de seguir las convenciones de nombres: PascalCase para componentes, camelCase para variables y funciones.
   - Confirma que la lógica de negocio esté desacoplada y ubicada en servicios de dominio, no en los controladores.
   - Menciona el cumplimiento de la LFPDPPP solo si el ticket lo solicita.

3. **Identificación de faltantes**
   - Si la vista y sus componentes no cumplen con el ticket, genera una lista de criterios faltantes.
   - Propón una lista de pasos para implementar los criterios faltantes, siguiendo patrones y convenciones del proyecto.
   - Indica cómo documentar los cambios realizados (comentarios en el código).

4. **Confirmación y flujo**
   - Corrobora que se hayan cumplido todos los criterios del ticket.
   - Espera confirmación del usuario antes de pasar al siguiente ticket.
   - Solicita el siguiente ticket una vez confirmada la implementación.

## Consideraciones adicionales
- No modificar la parte visual de los componentes, solo implementar lo funcional.
- Omite sugerencias de pruebas unitarias.
- Si tienes dudas sobre la estructura, consulta los diagramas y documentación del contexto.
- Mantén el idioma de la documentación generado acorde al archivo complementado (generalmente español).

## Historia de usuario
```markdown
- **ID:** 1  
- **Título:** Buscar especialistas por especialidad y ubicación  
- **Descripción:** Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.
```
## Ticket
```markdown
### 15.3 [Frontend] Implementar la lógica de consumo de API para búsqueda de especialistas y mostrar resultados

**Descripción detallada:**  
- **Propósito:**  
Conectar el formulario de búsqueda con el backend, consumir el endpoint de búsqueda y mostrar los resultados en la vista correspondiente.
- **Detalle específico:**  
- Implementar la llamada al endpoint `GET /api/doctors/search` usando Axios.
- Enviar los filtros seleccionados (nombre, especialidad, estado) como parámetros de consulta.
- Renderizar la lista de especialistas en el área de resultados, mostrando nombre, especialidad, ciudad, estado, foto y valoración.
- Manejar estados de carga, error y resultados vacíos.
- Asegurar que la búsqueda responde en menos de 2 segundos.

**Criterios de aceptación:**  
- El formulario ejecuta la búsqueda y muestra los resultados correctamente.
- Los datos se obtienen del backend y se renderizan en la vista.
- Se manejan estados de carga, error y resultados vacíos.
- El tiempo de respuesta es menor a 2 segundos.
- **Pruebas de validación:**  
  - Probar la búsqueda con diferentes filtros y verificar los resultados.
  - Simular errores y estados vacíos.

**Prioridad:**  
Muy alta

**Estimación de tiempo:**  
2 horas

**Etiquetas o Tags:**  
- Tipo: Feature  
- Característica del producto: Frontend, Consumo de API, UI/UX

**Comentarios y Notas:**  
Utilizar Axios para las llamadas a la API y seguir la estructura de datos definida en el backend. Validar que los datos mostrados cumplen con los criterios del PRD.

**Enlaces o Referencias:**  
- [Product Requirement Document](docs/product_requirement_document.md)
- [Product Backlog](docs/product_backlog.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)

**Historial de cambios:**  
- [18/08/2025] [GitHub Copilot] Ticket creado para lógica de consumo de API y renderizado de resultados en búsqueda de especialistas.
```

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.