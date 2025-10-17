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
Eres un experto en producto, con experiencia en sistemas de busqueda de especialidades medicas y profesionales de la salud.
¿Qué funcionalidades básicas tiene un sistema de busqueda especialistas medicos y profesionales de la salud?
Descríbemelas en un listado, ordenado de mayor a menor prioridad

**Prompt 2:**
¿Cómo es el customer journey normal de un cliente que usa un sistema de busqueda de especialidades medicas y profesionales de la salud? Descríbeme paso a paso todas las interacciones

**Prompt 3:**
¿Qué sistemas de busqueda de especialidades medicas y profesionales de la salud comerciales son más conocidos en México y Latino America? Compáralos en función de reputación, precio, popularidad, accesibilidad y valora cuál sería mejor opción

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
Eres un analista de software experto. Estoy construyendo un sistema de busqueda de especialidades medicas y profesionales de la salud. Enumera y describe brevemente los casos de uso más importantes a implementar para lograr una funcionalidad básica.
Representa estos casos de uso en el tipo de diagrama más adecuado usando el formato mermaid. Diferencia entre los diferentes usuarios que podría haber, de momento se identifican los siguientes: Medico Especialista, Paciente, Administrador del sistema. Acorde a la sintaxis y buenas prácticas UML, define y describe lo que sea necesario.
Antes de realizar la tarea ¿tienes alguna pregunta?
De lo contrario ejecuta la tarea.

**Prompt 2:**
Eres un arquitecto de software experto. ¿Cuáles son las entidades minimas necesarias de modelo de datos en un sistema de busqueda de especialidades medicas y profesionales de la salud? Dame los campos esenciales de cada una y cómo se relacionan entre si

**Prompt 3:**
```markdown
Actúa como **arquitecto de software y consultor técnico** experto en sistemas de búsqueda y gestión de especialidades médicas y profesionales de la salud. Utiliza la documentación proporcionada en el contexto inicial para fundamentar tus recomendaciones.

## Objetivo

Ayudar a definir el diseño del sistema y la arquitectura de alto nivel para una plataforma de búsqueda y gestión de especialidades médicas y profesionales de la salud, considerando autenticación de usuarios, despliegue en la nube, soporte multilenguaje, búsqueda avanzada (texto, ubicación, filtros), y priorizando tecnologías open source con comunidades activas.

---

## Instrucciones

1. **Backend**  
   Proporciona una tabla comparativa de tecnologías backend que cumplan con los siguientes criterios:
   - Rápidas de implementar
   - Curva de aprendizaje baja
   - Buena documentación
   - Buenas prácticas de seguridad
   - Patrón de arquitectura definido (Hexagonal, SOA, MVC)
   - Compatibles con diferentes ORMs
   - Licencia open source y comunidad activa
   - Compatibles con despliegue en la nube
   - Lenguajes a considerar: Javascript, PHP, Python

2. **Frontend**  
   Proporciona una tabla comparativa de frameworks frontend que cumplan con los siguientes criterios:
   - Rápidos de implementar
   - Curva de aprendizaje baja
   - Buena documentación
   - Buenas prácticas de seguridad
   - Patrón de arquitectura definido
   - Disponibilidad de plantillas y/o UI Kits para acelerar el desarrollo
   - Soporte multilenguaje
   - Licencia open source y comunidad activa

3. **Base de Datos**  
   Proporciona una tabla comparativa de tecnologías de bases de datos que cumplan con los siguientes criterios:
   - Sin costo
   - Fácil de instalar y configurar
   - Curva de aprendizaje baja
   - Buena documentación
   - Compatibles con múltiples ORMs
   - Soporte para UUID o Hashes como PKs y FKs
   - Licencia open source y comunidad activa

4. **Patrones de Arquitectura**  
   Explica brevemente cómo se pueden aplicar los patrones Hexagonal, SOA y MVC en el contexto de este sistema, indicando ventajas y posibles retos de cada uno.

5. **Recomendaciones**  
   Basado en el análisis anterior, sugiere una combinación de tecnologías para backend, frontend y base de datos que maximicen la rapidez de desarrollo, seguridad, escalabilidad y facilidad de mantenimiento.

---

## Formato de Respuesta

- Utiliza tablas comparativas para los puntos 1, 2 y 3.
- Usa listas y texto conciso para los puntos 4 y 5.
- Justifica brevemente cada recomendación.
- Cita fuentes o documentación oficial cuando sea relevante.

---

## Consideraciones Adicionales

- El sistema debe ser escalable y fácil de mantener.
- Prioriza tecnologías con soporte prolongado.
- No incluyas tecnologías propietarias o de licencia restrictiva.
- Si existen alternativas relevantes no mencionadas en el contexto, inclúyelas y justifica

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
```

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
```markdown
Actúa como **arquitecto de software y analista de negocio** experto en sistemas de salud, arquitectura hexagonal y cumplimiento normativo mexicano. Utiliza la documentación proporcionada en el contexto inicial para fundamentar tus recomendaciones.

---

## Objetivo

Ayudar a determinar el diseño de un sistema y arquitectura de alto nivel para un MVP de una plataforma de búsqueda y gestión de especialidades médicas y profesionales de la salud, considerando las tecnologías seleccionadas (Express.js + Prisma, Vue.js 3 + Vuetify, PostgreSQL, arquitectura hexagonal), el cumplimiento de la LFPDPPP, soporte multilenguaje (Español Latinoamericano e Inglés), y un tiempo de desarrollo limitado (30-50 horas).

---

## Instrucciones

1. **Arquitectura de alto nivel**
    - Detalla los principales componentes/módulos del sistema necesarios para un MVP, considerando la documentación de las etapas 1, 2 y 3.
    - Explica cómo interactúan entre sí, siguiendo el enfoque de arquitectura hexagonal (Ports & Adapters).

2. **Diagrama de la arquitectura**
    - Proporciona un diagrama visual en formato Mermaid que muestre los componentes y sus relaciones.
    - Identifica los límites y responsabilidades de cada componente.

3. **Patrones de diseño y buenas prácticas**
    - Indica qué patrones de diseño se recomiendan aplicar y por qué, considerando las tecnologías y arquitectura seleccionadas.
    - Especifica convenciones de codificación y buenas prácticas a seguir, incluyendo recomendaciones para pruebas automatizadas (unitarias, integración, e2e) y su integración en CI/CD.

4. **Riesgos**
    - Enumera los principales riesgos o desafíos que se anticipan para el desarrollo y operación del MVP.

5. **Consideraciones de despliegue y operación**
    - Sugiere opciones para desplegar el sistema en la nube.
    - Propón herramientas para CI/CD acordes a las tecnologías seleccionadas.
    - Recomienda soluciones para monitoreo y logging.
    - Incluye recomendaciones para la gestión de configuración y secretos.

6. **Seguridad**
    - Detalla las medidas de seguridad que se deben implementar para un sistema de este tipo, considerando la LFPDPPP.
    - Explica cómo se gestionará la autenticación y autorización, tomando en cuenta la arquitectura y tecnologías propuestas.

---

## Formato de Respuesta

- Usa listas, tablas y texto conciso para cada sección.
- El diagrama debe estar en formato Mermaid.
- Justifica brevemente cada recomendación.
- Cita fuentes o documentación oficial cuando sea relevante.

---

## Consideraciones Adicionales

- El sistema debe ser escalable y fácil de mantener.
- Prioriza el cumplimiento normativo mexicano (LFPDPPP).
- Limítate a los módulos mínimos necesarios para un MVP, considerando el tiempo de 30 a 50 hrs de trabajo.
- El sistema debe estar preparado para integraciones futuras.
- Si existen alternativas relevantes no mencionadas en el contexto, inclúyelas y justifica su inclusión.

---

# Pautas para generar el contenido:
- Genera una lista de pasos para ejecutar la tarea
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente despues de mostrar la información

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.

```

**Prompt 2:**
```markdown
Genera un resumen de la información recompilada hasta el momento y ademas aborde los siguientes temas:
* Tablas comparativas
* Patrones de arquitectura investigados
* Recomendaciones
* Las tecnologias y aquitectura seleccionada
* Arquitectura de alto nivel
* Diagrama de la arquitectura
    * No incluyas el diagrama, genera una sección donde yo pueda agregarlo manualmente
* Patrones de diseño y buenas prácticas
* Riesgos
* Consideraciones de despliegue y operación
* Seguridad
* Información que hayamos abordado en la conversación pero que este olvidando


Tus pautas para generar el contenido son:
* Generar un archivo llamado "etapa4_diseño_del_sistema_y_arquitectura.md" dentro de la carpeta [[]]
* Generar el contenido del archivo en formato Markdown para archivos .md

Revisa mis instrucciones, ¿tienes alguna pregunta antes de ejecutar la tarea?
Realiza preguntas si es necesario.
```

**Prompt 3:**
```markdown
Actúa como **experto en diseño de sistemas y proyectos web**. Utiliza únicamente la información proporcionada en la documentación del contexto inicial. **No inventes información ni completes secciones con supuestos; si falta información, indícalo explícitamente en el sitemap.**

---

## Objetivo

Generar un sitemap detallado en formato de tabla para el sistema de búsqueda de especialidades médicas y profesionales de la salud, basado exclusivamente en la información de la documentación de las etapas de análisis del producto.

---

## Instrucciones

- El sitemap debe incluir páginas principales, subpáginas/secciones internas y los enlaces entre ellas.
- Presenta el sitemap en una tabla con las siguientes columnas:
  - **Página Principal**
  - **Subpáginas / Secciones**
  - **Enlaces Relacionados**
- Si falta información en la documentación para completar alguna sección, indícalo explícitamente en la tabla con el texto:  
  _"Falta información en la documentación para completar esta sección."_
- No agregues información de fuentes externas ni inventes contenido.

---

## Formato de Respuesta

- Utiliza una tabla Markdown para presentar el sitemap.
- Sé claro y conciso en cada sección.
- No omitas ninguna página principal o subpágina relevante según la documentación.

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
```markdown
Eres un experto en ingenieria de prompts, diseño de sistemas y arquitectura de software
# Contexto inicial
Me encuentro diseñando un sistema de busqueda de especialidades medicas y profesionales de la salud, actualmente cuanto con 3 etapas de analisis:
- Investigación del producto, donde se han analizado los siguientes puntos: Funcionalidades básicas, Beneficios para el cliente, Alternativas al uso de estos sistemas, Customer Journey típico, Plataformas comerciales más conocidas en México y Latinoamérica, analisis y recomendaciones
- Casos de uso, donde se detallan los principales casos de uso y los diagramas de casos de uso
- Modelado de datos, con las entidades principales, el diagrama entidad relación, las relaciones principaes y extensiones futuras

# Instrucciones Generales
El objetivo es crear un prompt para Copilot (ChatGPT 4.1) que ayude a definir el diseño del sistema y la arquitectura de alto nivel cumpliendo los siguientes requerimientos

# Requerimientos 
1. Un listado de posibles tecnologias para implementar el backend que cumplan los siguientes criterios:
    * Rapido de implementar
    * Curva de aprendizaje baja
    * Buena documentación
    * Buenas practicas de seguridad 
    * Que tengan un patron de arquitectura definido
    * Compatible con diferentes ORMs
2. Un listado de posibles frameworks para implementar el frontend
    * Rapido de implementar
    * Curva de aprendizaje baja
    * Buena documentación
    * Buenas practicas de seguridad 
    * Que tengan un patron de arquitectura definido
    * Que cuenten con plantillas para acelerar el desarrollo
3. Un listado de posibles de tecnologias para la BBDD
    * Sin costo
    * Facil de instalar y configurar
    * Curva de aprendizaje baja
    * Buena documentación
    * Compatible con multiples ORMs
    * Soporte para el uso de UUID o Hashes para los PKs y FKs en lugar de indices basados en numeros enteros
3. Considerar los siguientes patrones de arquitectura: Hexagonal, SOA, MVC
4. Tomar en cuenta los siguientes lenguajes: Javascript, PHP y Python

# Mejores Practicas
1. Considerar tecnologias con soporte prolongado
2. Que incluye el rol con el que el chatbot deberá ejecutar la tarea

# Consideraciones adicionales
1. Para ejecutar el prompt el asistente dispondrá de la documentación que se detalla en el contexto inicial

# Pautas para generar el contenido
1. El prompt resultante deberá estar en formato Markdown para archivos .md

Antes de generar el prompt revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
```

**Prompt 2:**
```markdown
Actúa como **arquitecto de software y consultor técnico** experto en sistemas de búsqueda y gestión de especialidades médicas y profesionales de la salud. Utiliza la documentación proporcionada en el contexto inicial para fundamentar tus recomendaciones.

## Objetivo

Ayudar a definir el diseño del sistema y la arquitectura de alto nivel para una plataforma de búsqueda y gestión de especialidades médicas y profesionales de la salud, considerando autenticación de usuarios, despliegue en la nube, soporte multilenguaje, búsqueda avanzada (texto, ubicación, filtros), y priorizando tecnologías open source con comunidades activas.

---

## Instrucciones

1. **Backend**  
   Proporciona una tabla comparativa de tecnologías backend que cumplan con los siguientes criterios:
   - Rápidas de implementar
   - Curva de aprendizaje baja
   - Buena documentación
   - Buenas prácticas de seguridad
   - Patrón de arquitectura definido (Hexagonal, SOA, MVC)
   - Compatibles con diferentes ORMs
   - Licencia open source y comunidad activa
   - Compatibles con despliegue en la nube
   - Lenguajes a considerar: Javascript, PHP, Python

2. **Frontend**  
   Proporciona una tabla comparativa de frameworks frontend que cumplan con los siguientes criterios:
   - Rápidos de implementar
   - Curva de aprendizaje baja
   - Buena documentación
   - Buenas prácticas de seguridad
   - Patrón de arquitectura definido
   - Disponibilidad de plantillas y/o UI Kits para acelerar el desarrollo
   - Soporte multilenguaje
   - Licencia open source y comunidad activa

3. **Base de Datos**  
   Proporciona una tabla comparativa de tecnologías de bases de datos que cumplan con los siguientes criterios:
   - Sin costo
   - Fácil de instalar y configurar
   - Curva de aprendizaje baja
   - Buena documentación
   - Compatibles con múltiples ORMs
   - Soporte para UUID o Hashes como PKs y FKs
   - Licencia open source y comunidad activa

4. **Patrones de Arquitectura**  
   Explica brevemente cómo se pueden aplicar los patrones Hexagonal, SOA y MVC en el contexto de este sistema, indicando ventajas y posibles retos de cada uno.

5. **Recomendaciones**  
   Basado en el análisis anterior, sugiere una combinación de tecnologías para backend, frontend y base de datos que maximicen la rapidez de desarrollo, seguridad, escalabilidad y facilidad de mantenimiento.

---

## Formato de Respuesta

- Utiliza tablas comparativas para los puntos 1, 2 y 3.
- Usa listas y texto conciso para los puntos 4 y 5.
- Justifica brevemente cada recomendación.
- Cita fuentes o documentación oficial cuando sea relevante.

---

## Consideraciones Adicionales

- El sistema debe ser escalable y fácil de mantener.
- Prioriza tecnologías con soporte prolongado.
- No incluyas tecnologías propietarias o de licencia restrictiva.
- Si existen alternativas relevantes no mencionadas en el contexto, inclúyelas y justifica

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
``` 

**Prompt 3:**
```markdown
Actúa como **arquitecto de software y analista de negocio** experto en sistemas de salud, arquitectura hexagonal y cumplimiento normativo mexicano. Utiliza la documentación proporcionada en el contexto inicial para fundamentar tus recomendaciones.

---

## Objetivo

Ayudar a determinar el diseño de un sistema y arquitectura de alto nivel para un MVP de una plataforma de búsqueda y gestión de especialidades médicas y profesionales de la salud, considerando las tecnologías seleccionadas (Express.js + Prisma, Vue.js 3 + Vuetify, PostgreSQL, arquitectura hexagonal), el cumplimiento de la LFPDPPP, soporte multilenguaje (Español Latinoamericano e Inglés), y un tiempo de desarrollo limitado (30-50 horas).

---

## Instrucciones

1. **Arquitectura de alto nivel**
    - Detalla los principales componentes/módulos del sistema necesarios para un MVP, considerando la documentación de las etapas 1, 2 y 3.
    - Explica cómo interactúan entre sí, siguiendo el enfoque de arquitectura hexagonal (Ports & Adapters).

2. **Diagrama de la arquitectura**
    - Proporciona un diagrama visual en formato Mermaid que muestre los componentes y sus relaciones.
    - Identifica los límites y responsabilidades de cada componente.

3. **Patrones de diseño y buenas prácticas**
    - Indica qué patrones de diseño se recomiendan aplicar y por qué, considerando las tecnologías y arquitectura seleccionadas.
    - Especifica convenciones de codificación y buenas prácticas a seguir, incluyendo recomendaciones para pruebas automatizadas (unitarias, integración, e2e) y su integración en CI/CD.

4. **Riesgos**
    - Enumera los principales riesgos o desafíos que se anticipan para el desarrollo y operación del MVP.

5. **Consideraciones de despliegue y operación**
    - Sugiere opciones para desplegar el sistema en la nube.
    - Propón herramientas para CI/CD acordes a las tecnologías seleccionadas.
    - Recomienda soluciones para monitoreo y logging.
    - Incluye recomendaciones para la gestión de configuración y secretos.

6. **Seguridad**
    - Detalla las medidas de seguridad que se deben implementar para un sistema de este tipo, considerando la LFPDPPP.
    - Explica cómo se gestionará la autenticación y autorización, tomando en cuenta la arquitectura y tecnologías propuestas.

---

## Formato de Respuesta

- Usa listas, tablas y texto conciso para cada sección.
- El diagrama debe estar en formato Mermaid.
- Justifica brevemente cada recomendación.
- Cita fuentes o documentación oficial cuando sea relevante.

---

## Consideraciones Adicionales

- El sistema debe ser escalable y fácil de mantener.
- Prioriza el cumplimiento normativo mexicano (LFPDPPP).
- Limítate a los módulos mínimos necesarios para un MVP, considerando el tiempo de 30 a 50 hrs de trabajo.
- El sistema debe estar preparado para integraciones futuras.
- Si existen alternativas relevantes no mencionadas en el contexto, inclúyelas y justifica su inclusión.

---

# Pautas para generar el contenido:
- Genera una lista de pasos para ejecutar la tarea
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente despues de mostrar la información

Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
```markdown
Eres un experto en Terraform y en DevSecOps. Dime los requisitos minimos para desplegar un proyecto en una instancia de AWS mediante Terraform. El objetivo es saber que necesito y como preparar mi entorno local para desplegar mi proyecto en la nube utilizando la herramienta mencionada. El contenido es para un ingeniero de software que nunca ha utilizado terraform para desplegar un proyecto en la nube. Tus pautas para generar el contenido son:
1. Que las instrucciones sean claras y mediante una lista de pasos
2. Que incluya ejemplos y los comandos necesarios

Antes de realizar esta tarea ¿tienes alguna pregunta? 
```

**Prompt 2:**
```markdown
Eres un experto en Ingenieria de Prompts y en DevSecOps
# Contexto Inicial
Tenemos un proyecto que consta de una base de datos, backend y frontend, los cuales estan empaquetados en contenedores de Docker y se levantan en conjunto con Docker-Compose, ahora buscamos desplegarlo en la nube de AWS

# Intrucciones generales
Tu tarea es generar un prompt para el modelo (ChatGPT 4.1) que me ayude a desplegar de mi proyecto completo en AWS mediante terraform cumpliendo con las siguientes instrucciones

# Instrucciones
- La infraestructura consta de una instancias EC2 del tipo t3.micro
- Tendras que hacer checkout del proyecto mediante git desde la siguiente url del proyecto: `https://github.com/rockeroicantonidev/AI4Devs-finalproject.git`, no requieres crendiales ya que el repositorio es publico
    * Deberás ubicar el proyecto en el branch `JAPM-Implementación-Frontend`
- el backend debe ser accesible por medio del puerto 3010
- el frontend debe ser accesible por medio del puerto 3000
- No es necesario solicitar nombres de keys ya que ya se encuentran configuradas con aws configure
- Utiliza terraform en la carpeta [[tf]]

# Mejores practicas
- Incluye el rol en el que debe actual el modelo

# Consideraciones adicionales
- El modelo tendrá acceso a la documentaación del proyecto y los achivos de Docker para implementar la configuracion correctamente.

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```

**Prompt 3:**
```markdown
Actúa como **DevSecOps experto en despliegue cloud y automatización con Terraform**. Tu objetivo es generar los archivos y comandos necesarios para desplegar el proyecto Buscadoc (base de datos, backend y frontend) en AWS, siguiendo las mejores prácticas de seguridad, documentación y arquitectura hexagonal.

## Instrucciones

1. **Infraestructura en AWS:**
   - Despliega una instancia EC2 tipo `t3.micro` en la región `us-west-1` con sistema operativo Ubuntu 22.04.
   - Configura el grupo de seguridad para permitir acceso a los puertos `22` (SSH), `3000` (frontend) y `3010` (backend) desde cualquier IP.
   - Asigna una IP pública a la instancia.

2. **Provisionamiento del proyecto:**
   - Realiza el checkout del repositorio público:  
     `https://github.com/rockeroicantonidev/AI4Devs-finalproject.git`  
     usando el branch `JAPM-Implementación-Frontend`.
   - Ubica el proyecto en la instancia EC2 y asegúrate de que los archivos `.env` y `docker-compose.yml` estén presentes.
   - Instala Docker y Docker Compose en la instancia.
   - Levanta los servicios usando el archivo `docker-compose.yml` existente.

3. **Configuración y acceso:**
   - El backend debe ser accesible por el puerto `3010`.
   - El frontend debe ser accesible por el puerto `3000`.
   - Documenta que el puerto `22` está abierto para acceso SSH.
   - Explica cómo conectarse por SSH a la instancia y cómo actualizar el código desde el repositorio en caso de futuros cambios.

4. **Terraform:**
   - Genera los archivos de configuración de Terraform en la carpeta `tf` para crear y provisionar la instancia EC2 con los parámetros indicados.
   - Incluye instrucciones para inicializar, aplicar y destruir la infraestructura.

5. **Documentación en formato Markdown:**
   - Explica cada paso del proceso de despliegue y configuración.
   - Detalla cómo acceder a los servicios desplegados y cómo realizar actualizaciones.
   - Resalta las mejores prácticas de seguridad y cumplimiento con la LFPDPPP.

## Ejemplo de estructura esperada en el archivo Markdown resultante

# Despliegue de Buscadoc en AWS con Terraform

## 1. Infraestructura en AWS

### Configuración de la instancia EC2
...explicación y código Terraform...

### Grupo de seguridad
...puertos abiertos y justificación...

## 2. Provisionamiento del proyecto

### Clonación del repositorio y preparación
...comandos y pasos...

### Instalación de Docker y Docker Compose
...comandos y explicación...

### Levantar los servicios con Docker Compose
...comandos y verificación...

## 3. Acceso y administración

### Acceso SSH
...cómo conectarse y recomendaciones...

### Actualización del código
...comandos para actualizar desde git...

## 4. Buenas prácticas y cumplimiento

...seguridad, exclusión de archivos sensibles, LFPDPPP...

## 5. Destrucción de la infraestructura

...comandos para eliminar recursos con Terraform...

## Consideraciones adicionales

- Mantén la lógica de negocio fuera de los scripts de provisionamiento.
- Documenta todo en español y sigue las convenciones del proyecto.

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```


### **2.5. Seguridad**

**Prompt 1:**
```markdown
Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para las historias de usuario denomidadas "Registro de paciente" y "Registro de médico especialista", empezaremos con su implementación.
En cuanto el proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Adicionalmente se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a configurar JWT (`jsonwebtoken`) en el proyecto e implementar las historia de usuario y sus series de tickets

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```

**Prompt 2:**
```markdown
> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest (usar mocks)  
> **Manejo de errores:** Middleware global + clases customizadas  
> **JWT:** Usar jsonwebtoken, configuración en servicio y variables en `.env`  
> **Swagger:** Documentar ambos endpoints y el esquema de autenticación

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Revisa el modelo de datos y el código fuente para ubicar la ruta y controlador correctos.
   - Sigue la arquitectura hexagonal:  
     - Lógica de negocio en servicios de dominio  
     - Controladores gestionan entrada/salida  
     - Adaptadores de entrada (API REST) invocan casos de uso  
     - Adaptadores de salida gestionan persistencia con Prisma

2. **Configuración de JWT**
   - Crea un servicio de dominio para la gestión de JWT
   - Usa la librería `jsonwebtoken`.
   - Configura el secreto y expiración en el archivo `.env`:
     ```
     JWT_SECRET=your_secret_key
     JWT_EXPIRES_IN=1d
     ```
   - El servicio debe incluir funciones para generar y validar tokens.
   - Documenta el esquema de autenticación en el README.

3. **Implementación del servicio de registro compartido**
   - Crea un servicio de dominio (por ejemplo, `backend/services/registerService.js`) que gestione el registro tanto de pacientes como de médicos especialistas.
   - El servicio debe:
     - Validar los datos de entrada con Yup.
     - Verificar unicidad de email y, para médicos, de `license_number`.
     - Validar la fortaleza de la contraseña.
     - Hashear la contraseña con bcryptjs.
     - Crear los registros en las tablas de acuerdo al modelo de datos
     - Retornar una respuesta estándar de éxito o error.
     - No generar JWT en el registro, solo crear el usuario.

4. **Endpoints REST**
   - Implementa los endpoints:
     - `POST /api/auth/register/patient`
     - `POST /api/auth/register/doctor`
   - Los controladores deben delegar la lógica al servicio de registro.
   - Los mensajes de error deben estar en inglés y seguir el formato estándar de la API.

5. **Validaciones y manejo de errores**
   - Usa Yup para validaciones de datos.
   - Devuelve mensajes claros y específicos (ejemplo: "Email already exists", "Password too weak", "License number required").
   - Implementa manejo de errores con middleware global y clases customizadas.

6. **Documentación Swagger**
   - Documenta ambos endpoints en Swagger:
     - Descripción de funcionalidad.
     - Campos requeridos y ejemplos de petición/respuesta.
     - Estructura de datos retornados.
     - Posibles errores y mensajes de validación.
     - Esquema de autenticación JWT.

7. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para ambos endpoints usando Jest y Supertest.
   - Usa mocks para dependencias externas.
   - Casos a cubrir:
     - Registro exitoso con datos válidos.
     - Error por email duplicado.
     - Error por license_number faltante o duplicado (médico).
     - Error por contraseña débil.
     - Error por campos faltantes o inválidos.
     - Validación de almacenamiento seguro de la contraseña (hash).
     - Validación de JWT (generación y verificación).

---

## Ejemplo de estructura base para el servicio y endpoints

```js
// filepath: backend/services/registerService.js
const bcrypt = require('bcryptjs');
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerPatient = async (data) => {
  // Validación con Yup
  // Verificar email único
  // Validar contraseña
  // Hashear contraseña
  // Crear USER y PATIENT
  // Retornar respuesta estándar
};

const registerDoctor = async (data) => {
  // Validación con Yup
  // Verificar email y license_number únicos
  // Validar contraseña
  // Hashear contraseña
  // Crear USER y DOCTOR
  // Retornar respuesta estándar
};

module.exports = { registerPatient, registerDoctor };
```

```js
// filepath: backend/services/jwtService.js
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
```

---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de los requerimientos
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- En cada paso dime que archivo se a modificar o agregar, muestrame el codigo a agregar o reemplazar y dime en donde lo debo colocar
- Muestrame la lista de pasos a ejecutar antes de realizar la implementación

Antes de comenzar con la implementación revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```

**Prompt 3:**
```markdown

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
```


### **2.6. Tests**
**Prompt 1: **
```markdown
Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para las historias de usuario denomidadas "Registro de paciente" y "Registro de médico especialista", empezaremos con su implementación.
En cuanto el proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Adicionalmente se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a configurar JWT (`jsonwebtoken`) en el proyecto e implementar las historia de usuario y sus series de tickets

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```


**Prompt 2:**
```markdown
> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest  
> **Manejo de errores:** Middleware global + clases customizadas  
> **Internacionalización:** Omitida, respuestas en inglés  
> **Swagger:** Actualizar documentación del endpoint

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Antes de implementar, revisa el modelo de datos y el código fuente para ubicar la ruta y controlador correctos.
   - Asegúrate de seguir la arquitectura hexagonal:  
     - Lógica de negocio en servicios de dominio  
     - Controladores gestionan entrada/salida  
     - Adaptadores de entrada (API REST) invocan casos de uso  
     - Adaptadores de salida gestionan persistencia con Prisma

2. **Diseño del endpoint para consultar el perfil de especialista**
   - Implementa el endpoint REST `GET /api/doctors/:id` para consultar el perfil profesional y ubicación general de un especialista.
   - El endpoint debe recibir el identificador del especialista y retornar:
     - Información profesional: nombre, especialidad, biografía, foto, cédula profesional, título
     - Ubicación general: ciudad y estado
     - Oculta datos personales sensibles (correo, teléfono, dirección exacta) si el usuario no está autenticado
   - Valida que el especialista esté activo antes de mostrar el perfil.
   - Actualiza la documentación en Swagger.

3. **Implementación de la lógica de consulta**
   - Consulta las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE usando Prisma.
   - Aplica validaciones de entrada con Yup.
   - Si el usuario no está autenticado, excluye los datos sensibles de la respuesta.
   - Maneja errores con middleware global y clases customizadas.

4. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para el endpoint usando Jest y Supertest.
   - Prueba los siguientes casos:
     - Acceso con usuario no autenticado (verifica que no se muestran datos sensibles)
     - Acceso a perfil de especialista activo
     - Acceso a perfil de especialista inactivo (no debe mostrarse)

5. **Convenciones y patrones**
   - Mantén la lógica de negocio fuera de los controladores y adáptala en servicios de dominio.
   - Usa camelCase en todo el código.
   - Cumple con la LFPDPPP y buenas prácticas de seguridad.
   - Documenta el endpoint en Swagger.

---

## Ejemplo de estructura base para el endpoint

```js
// ...existing code...
// backend/routes/doctors.js
router.get('/:id', doctorsController.getDoctorProfile);
// ...existing code...

// backend/controllers/doctorsController.js
const getDoctorProfile = async (req, res, next) => {
  // Validación con Yup
  // Consulta de datos con Prisma
  // Ocultación de datos sensibles si no hay autenticación
  // Manejo de errores con clases customizadas
  // Respuesta en inglés
};
// ...existing code...
```

**Prompt 3:**
Muestrame solo la implementación del punto 4: Pruebas unitarias, dime que archivos se tienen que modificar y en donde se debe realizar la modificación


---

## Referencias

- [Product Requirement Document](docs/product_requirement_document.md)
- [Modelo de Datos](docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Diagrama de arquitectura](docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Diagrama de casos de uso](docs/planificacion_y_documentacion/diagramas/diagrama_casos_de_uso.md)

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas y tickets
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```

---

### 3. Modelo de Datos

**Prompt 1:**
```markdown
Genera el diagrama entidad relación del modelo de datos del sistema de busqueda de especialidades medicas y profesionales de la salud.
Tus pautas para generar el contenido son:
* Incluye los campos esenciales
* Incluye las relaciones
* Genera el contenido del diagrama en formato mermaid

Revisa mis instrucciones, ¿hay algo que me este faltando por cosiderar?
Realiza preguntas si tienes dudas.
```

**Prompt 2:**
```markdown
Qué otras entidades del modelo de datos se pueden considerar en un sistema de busqueda de especialidades medicas y profesionales de la salu? Dame los campos más importantes de cada una y cómo se relacionan entre entidades.
```

**Prompt 3:**
```markdown
Genera un resumen de la información recompilada hasta el momento.
Tus pautas para generar el contenido son:
* Generar un archivo llamado "etapa3_modelado_datos.md" dentro de la carpeta [[]]
* Generar el contenido del archivo en formato Markdown para archivos .md
* No incluyas ningun diagrama en este archivo generado, ese lo incluiré manualmente, para ello incluye una sección para que yo pueda agregarlo

Revisa mis instrucciones, ¿tienes alguna pregunta antes de ejecutar la tarea?
Realiza pregunta si es necesario.
```

---

### 4. Especificación de la API

**Prompt 1: **
```markdown
Eres un experto en Ingenieria de Prompts, en NodeJS, Express.js, JWT (`jsonwebtoken`) y Prisma ORM
# Contexto Inicial
Tenemos una serie de tickets documentados (ARCHIVO) para las historias de usuario denomidadas "Registro de paciente" y "Registro de médico especialista", empezaremos con su implementación.
En cuanto el proyecto, ya se cuenta con las carpetas y estructura base para empezar a crear archivos de código.
Adicionalmente se cuenta con un product requirement document (PRD), el diagrama de arquitectura y el modelo de datos de la aplicación.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que me ayude a configurar JWT (`jsonwebtoken`) en el proyecto e implementar las historia de usuario y sus series de tickets

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto
- El chatbot tendra que revisar la documentación para ejectuar el prompt resultante
- Omitir Internacionalización, las respuestan se manejaran en Inglés
- usar Yup para la validación de datos
- usar Jest y Supertest para las pruebas unitarias
- Para el manejo de errores utilizar middleware global + clases customizadas

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```


**Prompt 2:**
```markdown
> **Rol:** Ingeniero Backend y Arquitecto de Software  
> **Referencia:** PRD, modelo de datos, arquitectura hexagonal, convenciones del repositorio  
> **Convenciones:** camelCase para variables, funciones y clases  
> **Validaciones:** Yup  
> **Pruebas:** Jest y Supertest  
> **Manejo de errores:** Middleware global + clases customizadas  
> **Internacionalización:** Omitida, respuestas en inglés  
> **Swagger:** Actualizar documentación del endpoint

---

## Instrucciones Generales

1. **Consulta la documentación y el código fuente**
   - Antes de implementar, revisa el modelo de datos y el código fuente para ubicar la ruta y controlador correctos.
   - Asegúrate de seguir la arquitectura hexagonal:  
     - Lógica de negocio en servicios de dominio  
     - Controladores gestionan entrada/salida  
     - Adaptadores de entrada (API REST) invocan casos de uso  
     - Adaptadores de salida gestionan persistencia con Prisma

2. **Diseño del endpoint para consultar el perfil de especialista**
   - Implementa el endpoint REST `GET /api/doctors/:id` para consultar el perfil profesional y ubicación general de un especialista.
   - El endpoint debe recibir el identificador del especialista y retornar:
     - Información profesional: nombre, especialidad, biografía, foto, cédula profesional, título
     - Ubicación general: ciudad y estado
     - Oculta datos personales sensibles (correo, teléfono, dirección exacta) si el usuario no está autenticado
   - Valida que el especialista esté activo antes de mostrar el perfil.
   - Actualiza la documentación en Swagger.

3. **Implementación de la lógica de consulta**
   - Consulta las entidades DOCTOR, USER, DOCTOR_SPECIALTY, SPECIALTY, LOCATION, CITY y STATE usando Prisma.
   - Aplica validaciones de entrada con Yup.
   - Si el usuario no está autenticado, excluye los datos sensibles de la respuesta.
   - Maneja errores con middleware global y clases customizadas.

4. **Pruebas unitarias**
   - Implementa pruebas unitarias y de integración para el endpoint usando Jest y Supertest.
   - Prueba los siguientes casos:
     - Acceso con usuario no autenticado (verifica que no se muestran datos sensibles)
     - Acceso a perfil de especialista activo
     - Acceso a perfil de especialista inactivo (no debe mostrarse)

5. **Convenciones y patrones**
   - Mantén la lógica de negocio fuera de los controladores y adáptala en servicios de dominio.
   - Usa camelCase en todo el código.
   - Cumple con la LFPDPPP y buenas prácticas de seguridad.
   - Documenta el endpoint en Swagger.

---

## Ejemplo de estructura base para el endpoint

```js
// ...existing code...
// backend/routes/doctors.js
router.get('/:id', doctorsController.getDoctorProfile);
// ...existing code...

// backend/controllers/doctorsController.js
const getDoctorProfile = async (req, res, next) => {
  // Validación con Yup
  // Consulta de datos con Prisma
  // Ocultación de datos sensibles si no hay autenticación
  // Manejo de errores con clases customizadas
  // Respuesta en inglés
};
// ...existing code...
```

**Prompt 3:**
Muestrame solo la implementación del punto 5: Documenta el endpoint, dime que archivos se tienen que modificar y en donde se debe realizar la modificación

---

### 5. Historias de Usuario

**Prompt 1:**
```markdown
Eres un experto en ingenieria de prompts, en levantamiento de requerimientos y analista de negocio
# Contexto inicial
Me encuentro diseñando un sistema de busqueda de especialidades medicas y profesionales de la salud y cuento con 4 etapas de analisis del producto:
- Investigación del producto, donde se han analizado los siguientes puntos: Funcionalidades básicas, Beneficios para el cliente, Alternativas al uso de estos sistemas, Customer Journey típico, Plataformas comerciales más conocidas en México y Latinoamérica, analisis y recomendaciones
- Casos de uso, donde se detallan los principales casos de uso y los diagramas de casos de uso
- Modelado de datos, con las entidades principales, el diagrama entidad relación, las relaciones principaes y extensiones futuras
- Diseño del sistema y arquitectura, en donde se detallan las tecnologias a usar, así como la arquitectura y diagrama de alto nivel del sistema

# Instrucciones Generales
El objetivo es crear un prompt para Copilot (ChatGPT 4.1) que ayude a generar un PRD (Product Requiremente Documento) inicial que cumpla con los siguientes requisitos

# Requerimientos
1. Introducción y objetivos: resumen del producto, propósito, objetivos y metas que se esperan alcanzar
2. Stakeholders: Identifica a todas las partes interesadas, usuarios, compradores e instancias reguladoras
3. Historias de usuario: describe como los usuarios interactuan con el producto para entender sus necesidades.
4. Componentes principales y sitemaps: estructura y organizacion del producto, sus componentes principales y como se realacionan entre si.
5. Características y funcionalidades: de manera enumerada y descrita para satisfacer las necesidades identificadas.
6. Una sección sin contenido para diseño y experiencia de usuario, esta información será agregada manualmente
7. Requisitos técnicos: especificaciones tecnicas para el desarrollo, incluye hardware, software, interactividad, personalizacion y normativas
8. Planificación del proyecto: proporciona plazos, hitos y dependencias, para planificar y gestionar el proyecto.
9. Criterios de aceptación: estandares y condiciones para que el producto sea acceptable
10. Apendices y Recursos adicionales: glosarios, recursos extenros y documentos que apoyen el desarrollo

# Consideraciones adicionales
1. Considerar que hay un tiempo limitado de 30 a 50hrs de trabajo para presentar un MVP
2. Para ejecutar el prompt el asistente dispondrá de la documentación que se detalla en el contexto inicial

# Mejores Practicas
1. Que incluya el rol con el que el chatbot deberá ejecutar la tarea
2. Que no agregue información fuera de la documentación del contexto o invente información, si falta información indicarlo en el documento

# Pautas para generar el contenido
1. El prompt resultante deberá estar en formato Markdown para archivos .md

Antes de generar el prompt revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
```

**Prompt 2:**
```markdown
Actúa como **analista de negocio y experto en levantamiento de requerimientos**. Utiliza únicamente la información proporcionada en la documentación del contexto inicial. **No inventes información ni completes secciones con supuestos; si falta información, indícalo explícitamente en el documento.**

---

## Objetivo

Generar un PRD (Product Requirement Document) inicial para el MVP de un sistema de búsqueda de especialidades médicas y profesionales de la salud, siguiendo las mejores prácticas y considerando la documentación de las etapas de análisis del producto.

---

## Instrucciones

El PRD debe estar estructurado en las siguientes secciones:

1. **Introducción y objetivos**  
   - Resume el producto, su propósito, los objetivos y metas que se esperan alcanzar.

2. **Stakeholders**  
   - Identifica todas las partes interesadas, usuarios, compradores e instancias reguladoras relevantes.

3. **Historias de usuario**  
   - Describe cómo los usuarios interactúan con el producto usando el formato:  
     _Como [rol], quiero [acción], para [beneficio]._  
   - Incluye solo historias respaldadas por la documentación.

4. **Componentes principales y sitemaps**  
   - Expón la estructura y organización del producto, sus componentes principales y cómo se relacionan entre sí.

5. **Características y funcionalidades**  
   - Enumera y describe las características y funcionalidades necesarias para satisfacer las necesidades identificadas.

6. **Diseño y experiencia de usuario**  
   - **Deja esta sección sin contenido** para ser completada manualmente posteriormente.

7. **Requisitos técnicos**  
   - Especifica los requisitos técnicos para el desarrollo, incluyendo software, interactividad, personalización y normativas aplicables (incluyendo LFPDPPP).

8. **Planificación del proyecto**  
   - Proporciona los plazos, hitos principales y dependencias para planificar y gestionar el proyecto, considerando el límite de 30 a 50 horas para el MVP.

9. **Criterios de aceptación**  
   - Define los estándares y condiciones que debe cumplir el producto para ser aceptable.

10. **Apéndices y recursos adicionales**  
    - Incluye glosarios, recursos externos y documentos de apoyo, cada uno con una breve descripción así como referencias cuando sea posible.

---

## Consideraciones adicionales

- El PRD debe enfocarse en el MVP, pero no debe omitir información importante.
- Si alguna sección carece de información suficiente en la documentación, **indícalo explícitamente** en el documento.
- El documento debe estar redactado en español.
- No agregues información fuera de la documentación del contexto.

---

## Formato de Respuesta

- Utiliza encabezados y listas para estructurar el documento.
- Sé claro y conciso en cada sección.
- Si falta información, escribe:  
  _"Falta información en la documentación para completar esta sección."_

---

# Pautas para generar el contenido:
- Genera una lista de pasos para ejecutar la tarea
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente despues de mostrar la información


Antes de realizar la tarea revisa mis instrucciones ¿hay algo que me este faltando considerar?
Hazme preguntas si necesitas más información.
```

---

### 6. Tickets de Trabajo

**Prompt 1:**
```markdown
Actua como un project manager con experiencia y experto en diseño de product backlogs. 
Actualmente tengo lo siguiente:
- 3 etapas de analisis del producto: casos de uso, modelado de datos, arquitectura y diseño del sistema a alto nivel 
- El product requeriment document (PRD)
Dime los pasos a seguir crear un product backlog a partir del analisis de producto y un product requerement document (PRD) cubriendo los siguientes aspectos:
- Orden y priorización de historias de usuario tomando en cuenta la urgencia, impacto y recursos disponibles
   - Considerar aquellas historias de usuario que aportan mayor valor al negocio y usuarios finales
- Definir las funcionalidades principales para un MVP
   - Dando prioridad a quellas caracteristicas más urgentes en terminos de necesidades de los stakeholders y el tiempo disponible
- Reconocer y priorizar tareas que dependen de otras
- Costo de la implementación: esfuerzo, recursos y tiempo para cada tarea, priorizando la mejor relación costo-beneficio
- La evaluación de cada historia de usuario y su impacto del proyecto.

El objetivo es saber como empezar y que debo de hacer para generar un product backlog efectivo para posteriormente generar los tickets de trabajo.
El contenido es para un ingeniero de software.
Tus pautas para generar el contenido son:
- Genera el contenido en forma de lista

Antes de realizar esta tarea revisa mis indicaciones, ¿hay algo que me este faltando considerar?
Realiza preguntas si lo consideras necesario.
```

**Prompt 2:**
```markdown
Eres un experto en Ingenieria de Prompts con experiencia como Project Manager
# Contexto Inicial
Me encuentro diseñando un sistema de búsqueda de especialidades médicas y profesionales de la salud, hasta el momento se tiene un product requirement documento (PRD) definido, así como un Product Backlog con todas las historias de usuario y aquellas caracterteristicas del producto que van a formar parte de un MVP.
Actualmente el proyecto solo cuenta con la documentación, por lo que aún no se ha programado nada y no hay una base en la que se pueda realizar la implementación, hay que crear el proyecto desde cero.

# Intrucciones generales
Tu tarea es generar un prompt para el chatboot (ChatGPT 4.1) que genere los tickets de trabajo para implementar aquellas historias de usuario que formaran parte del MVP y cumpla con los siguientes requerimientos

# Requerimientos
1. Ademas del trabajo designado por las historias de usuario del MVP agregar las siguientes tareas para inicar el proyecto:
   * crear las carpetas de backend y frontend
   * inicializar el proyecto de cada carpeta utilizando npm
   * instalar las dependencias necesarias en cada carpeta
   * montar la base de datos
   * generar la migración de la base de datos para su ejecución
2. Los tickets de trabajo deben cumplir con las siguientes caracteristicas
   - Un título claro y conciso*: resumen breve que refleja la esencia de la tarea, cualquier miembro del equipo la entiende al leerla
   - Descripción detallada*: 
      - Propósito: por qué es necesaria la tarea y el problema que resuelve
      - Detalle específico: Información adicional sobre requerimientos específicos, restricciones, o condiciones necesarias para la realización de la tarea.
   - Criterios de aceptación: 
      - Expectativas claras: lista detallada de condiciones a cumplirse
      - Pruebas de validación: pruebas específicas que verifican que las tareas se han completado
   - Prioridad*: nivel de urgencia, detalla la importancia y urgencia de la tarea, ayuda a determinar el orden que las tareas deben ser abordadas
   - Estimación de tiempo o esfuerzo requerido*: mediante puntos de historia o tiempo estimado determina cuánto se requiere para completar el ticket. esencial en la planificación y gestión del tiempo del equipo.
   - Etiquetas o Tags: categorización mediante etiquetas que ayudan a clasificar el ticket
      - Tipo: Feature, Tarea Técnica, Bug/Error, Mejora o Investigación (Spike)
      - Caracteristica del producto: UI/UX, Backend, Frontend, Documentación, Configuración
   - Comentarios y Notas: el equipo agregan información relevante, hacen preguntas o proporcionan actualizaciones en la ejecución de la tarea
   - Enlaces o Referencias: documentación, diseños, especificaciones o tickets relacionados para contexto adicional que ayuda a completar la tarea
   - Historial de cambios: trazabilidad de modificaciónes, cambios, actualizaciones de estado, reasignación o prioridades
3. Debe haber un orden logico en los tickets 

# Mejores practicas
- Incluye el rol en el que debe actual el chatbot

# Consideraciones
- El chatbot tendrá acceso a la documentación descrita en el contexto inicial.

# Pautas para generar el contenido
1. El formato de salida va ser un archivo con extensión .md y el contenido en formato Markdown

Antes de generar el prompt revisa mis requerimientos ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```

**Prompt 3:**
```markdown
Actúa como **Project Manager** bajo la metodología **Scrum**.

## Contexto
Estás gestionando el proyecto **Buscadoc**, un sistema de búsqueda de especialidades médicas y profesionales de la salud. Tienes acceso al **Product Requirement Document (PRD)**, al **Product Backlog** y al **Modelo de Datos**, donde se encuentran todas las historias de usuario y características del MVP, así como detalles técnicos (stack, base de datos, dependencias, restricciones, etc.).

## Instrucción

Genera una **lista de tickets de trabajo** en formato **Markdown (.md)** para implementar las historias de usuario del MVP y las tareas iniciales del proyecto.  
Los tickets deben estar **ordenados por prioridad y dependencia lógica**.

### Tareas iniciales obligatorias (agrega antes de las historias de usuario):
- Crear las carpetas de backend y frontend.
- Inicializar el proyecto en cada carpeta utilizando npm.
- Instalar las dependencias necesarias en cada carpeta (según stack definido en el PRD).
- Montar la base de datos (según lo definido en el PRD).
- Generar la migración de la base de datos para su ejecución.

### Formato de cada ticket

Cada ticket debe incluir las siguientes secciones:

- **Título claro y conciso**  
  Breve resumen que refleje la esencia de la tarea.

- **Descripción detallada**  
  - Propósito: Explica por qué es necesaria la tarea y el problema que resuelve.  
  - Detalle específico: Información adicional sobre requerimientos, restricciones o condiciones necesarias.

- **Criterios de aceptación**  
  - Expectativas claras: Lista detallada de condiciones a cumplirse.  
  - Pruebas de validación: Pruebas específicas para verificar la tarea.

- **Prioridad**  
  Indica el nivel de urgencia e importancia.

- **Estimación de tiempo**  
  Tiempo estimado en horas para completar la tarea.

- **Etiquetas o Tags**  
  - Tipo: Feature, Tarea Técnica, Bug/Error, Mejora, Investigación (Spike)  
  - Característica del producto: UI/UX, Backend, Frontend, Documentación, Configuración

- **Comentarios y Notas**  
  Espacio para que el equipo agregue información relevante, preguntas o actualizaciones.

- **Enlaces o Referencias**  
  Documentación, diseños, especificaciones o tickets relacionados.

- **Historial de cambios**  
  Sección editable para registrar fecha, autor y descripción de modificaciones, actualizaciones de estado, reasignación o cambios de prioridad.

---

## Ejemplo de estructura de ticket en Markdown

```markdown
### [Título del ticket]

**Descripción detallada:**  
- **Propósito:**  
- **Detalle específico:**  

**Criterios de aceptación:**  
-  
-  
- **Pruebas de validación:**  
-  

**Prioridad:**  
**Estimación de tiempo:**  
**Etiquetas o Tags:**  
- Tipo:  
- Característica del producto:  

**Comentarios y Notas:**  

**Enlaces o Referencias:**  

**Historial de cambios:**  
- [Fecha] [Autor] [Descripción del cambio]
```

---

## Consideraciones

- Utiliza la información del PRD y Product Backlog para detallar los tickets.
- Mantén el orden lógico y de prioridad en la lista.
- El archivo debe ser legible y útil para cualquier miembro del equipo.

---

**Genera la lista de tickets siguiendo estas instrucciones y estructura.**

## Pautas para generar el contenido:
- Genera una lista de pasos para realizar la implementación de las tareas
- Cada paso se va ejecutar de manera individual por lo que me tienes que preguntar si podemos pasar al siguiente
- Antes de iniciar muestrame la lista de pasos a ejecutar

Antes de generar el prompt revisa mis instrucciones ¿me esta faltando algo por considerar?
Realiza preguntas si necesitas mas información.
```

---

### 7. Pull Requests

**Prompt 1:**
Eres un experto en documentación técnica. Genera el contenido del Pull Request de lo realizado hasta el momento. El objetivo es detallar lo realizado en el proyecto. El contenido va dirigido a publico en general. Tus pautas para generar el contenido es que ademas del contenido del pull request, generes un titulo y el comentario del ultimo commit, tomando en cuenta que es la entrega final de un proyecto, todo esto en formato Markdown para archivos .md. Antes de realizar esta tarea ¿tienes alguna pregunta?

**Prompt 2:**

**Prompt 3:**
