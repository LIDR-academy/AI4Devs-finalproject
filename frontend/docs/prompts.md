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