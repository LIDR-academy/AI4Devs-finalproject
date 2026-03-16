# Chatbot: ChatGPT-4.0

## Prompt 1

Hola ChatGPT, voy a comenzar un proyecto, en este poryecto debo pasar por todas las fases del desarrollo, desde el diseño del PRD, modelos de datos, arquitectura, historias de usurario, ticket, desarrollo (back, front, BD) y despliegue.

El nombre del proyecto es easy reader y te voy a contar de manera muy general de qué va:

El objetivo es desarrollar una aplicación web para dispositivos móviles en la que el usuario pueda cargar un PDF o ingresar un link (URL de alguna página), posterior a eso la aplicación pedira que modo de lectura quiere, a modo de lectura me refiero a cómo es que se va a comportar el scroll, vamos a tener el modo con acelerémetro y el modo con detección de rostro, ambos harán lo mismo, que es: BAJAR EL SCROLL DE MANERA AUTOMÁTICA.


## Respuesta ChatGPT

¡Suena como un proyecto muy interesante! "Easy Reader" parece apuntar a mejorar la accesibilidad y comodidad para la lectura de PDFs y páginas web en dispositivos móviles.

Algunas preguntas para clarificar detalles antes de comenzar:  

1. **Usuarios y contexto de uso**  
   - ¿Está pensado para un público en general o algún nicho en particular (personas con discapacidades visuales, estudiantes, etc.)?  
   - ¿Se enfocará en una experiencia sin anuncios o consideras incluir monetización?  

2. **Modos de lectura**  
   - **Acelerómetro:** ¿Se basará en la inclinación del dispositivo para ajustar la velocidad del scroll?  
   - **Detección de rostro:** ¿La idea es detectar el movimiento de los ojos o simplemente si el usuario sigue mirando la pantalla?  

3. **Alcance y funcionalidad inicial**  
   - ¿El scroll será configurable en velocidad o tendrá ajustes predefinidos?  
   - ¿Debería permitir funciones como resaltado de texto o notas?  

4. **Tecnologías**  
   - ¿Planeas que sea una **PWA (Progressive Web App)** o considerarías una app nativa más adelante?  
   - ¿Tienes alguna preferencia en stack tecnológico (Angular, React, Vue para el front; Node, Python, etc., para el back)?  

5. **Infraestructura y almacenamiento**  
   - ¿Los PDFs se guardarán en un servidor o se procesarán solo en el cliente?  
   - ¿Necesitas autenticación de usuarios o será de acceso libre?  

Si tienes ya algo en mente sobre estos puntos, podemos empezar con la documentación, definiendo el **PRD (Product Requirements Document)** y los modelos de datos. 🚀


## Prompt 2

1. Estoy pensando en un público en general, pero me gusta eso de ayudar a las personas con discapacidades, por ejemplo, podemos implementar algo con gestos de las manos, con acelerómetro y con detección de rostro para cubrir todo.

2. Sí, se basara en la inclinación del dispositivo para bajar el scroll y lo mejor sería detectar los ojos, pero probé una librería y no funciona muy bien, entonces sería más detectar el rostro y ver sacar patrónes para identificar cuando está viendo hacia arria o hacia abajo.

3. Será configurable pero tendrá un default, no, por ahora no para el resaltado de textos y notas. Pero puede ser una buena mejora.

4. Solamente será un página web, pero en un futuro estaría bien que sea una PWA y la técnología será Angula y node, de base de datos, prisma.

5. Será de acceso libre en primera instancia, ahí se guardaran de manera local en el lado del cliente, si se registra, ahí si podremos guardar los PDF y link de cada usuario.

## Respuesta ChatGPT

¡Excelente! Con esta información, podemos estructurar el PRD y definir la arquitectura inicial del proyecto Easy Reader.

¡Excelente! Con esta información, podemos estructurar el **PRD** y definir la arquitectura inicial del proyecto **Easy Reader**.  

---

### **Resumen del Proyecto**  
**Easy Reader** es una aplicación web que permite a los usuarios cargar un PDF o ingresar una URL para visualizar contenido con un desplazamiento automático basado en distintos modos de lectura:  
- **Acelerómetro:** Control del scroll mediante la inclinación del dispositivo.  
- **Detección de rostro:** Reconocimiento de patrones para identificar si el usuario está mirando hacia arriba o hacia abajo.  
- **Gestos de manos (futuro):** Implementación para mejorar la accesibilidad.  

**Público objetivo:**  
- Personas que desean una experiencia de lectura más cómoda.  
- Usuarios con discapacidades que dificultan la navegación manual.  

---

## **Estructura del Proyecto**  
### **Fase 1 - PRD (Product Requirements Document)**  
El **PRD** incluirá:  
1. Objetivo del producto.  
2. Requisitos funcionales y no funcionales.  
3. Casos de uso principales.  
4. Tecnologías y arquitectura inicial.  

### **Fase 2 - Modelos de Datos**  
- **Usuarios** (opcional en modo libre, requerido en modo registrado).  
- **Archivos PDF y enlaces guardados** (solo para usuarios registrados).  

### **Fase 3 - Arquitectura**  
- **Frontend:** Angular.  
- **Backend:** Node.js con Prisma ORM.  
- **Base de datos:** PostgreSQL (o alguna alternativa en Prisma).  
- **Almacenamiento de PDFs:** Solo local en el cliente en modo libre, con opción de guardado en el backend para usuarios registrados.  

### **Fase 4 - Historias de Usuario & Tickets**  
- Implementación de cada modo de lectura.  
- Configuración del scroll automático.  
- Registro y autenticación de usuarios.  
- Guardado de archivos y enlaces (solo para usuarios registrados).  

---

### **Próximos pasos**  
💡 Si estás de acuerdo con esta estructura, podemos comenzar documentando el **PRD**. ¿Te gustaría que lo genere en un archivo Markdown (.md) para llevar un seguimiento más ordenado? 🚀

## Prompt 3

Me gusta, solamente vamos agregar este punto en la FASE 1, después de Objetivo del Producto:

2. Alcance del Producto

# Respuesta ChatGPT

¡Perfecto! Voy a generar el **PRD** en un archivo Markdown (.md) con la estructura que definimos, incluyendo el nuevo apartado **"Alcance del Producto"** en la Fase 1.  

Voy a crear el documento ahora. 🚀

El **PRD** de Easy Reader ya está listo en formato Markdown. 🚀  

Revísalo y dime si deseas agregar o modificar algún detalle antes de continuar con la siguiente fase (modelos de datos y arquitectura). 😊

## Prompt 4

Me gusta, solamente que en el apartado 2. Alcance del Producto, vamos a agregar 3 funcionalidades con la leyendas de (futuras), te cuento:

1. El usuario podrá configurar el tema, es decir Dark o light

2. El usuario podrá ajustar el brillo para una mejor lectura

3. El usuario podrá agregar nota y subrayar palabras (esa notas se van a persistir de manera local y posteriormente se van a poder almacenar en BD para usuarios regristrados). 


