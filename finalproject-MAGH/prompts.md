# Prompt 1

Diseña la primera versión de un sistema llamado **"Web de Reserva de Apartamentos Familiares"** y entrega los siguientes artefactos:

## 1. Descripción breve del software
- Explica en qué consiste el sistema.
- Menciona su valor añadido y ventajas competitivas frente a otras plataformas similares.
- Destaca qué lo hace único en el mercado.

## 2. Explicación de funciones principales
- Enumera y describe las funcionalidades clave que tendrá el sistema.
- Incluye ejemplos prácticos del uso de la plataforma.

## 3. Lean Canvas del modelo de negocio
- Presenta un diagrama Lean Canvas que refleje la propuesta de valor, segmentos de clientes, canales, estructura de costos, fuentes de ingresos, etc.

## 4. Casos de uso principales (3 casos)
- Define los tres casos de uso más importantes.
- Proporciona un diagrama UML de casos de uso para cada uno.

## 5. Modelo de datos
- Define las entidades principales, sus atributos (nombre y tipo de dato) y sus relaciones.
- Presenta un diagrama de base de datos que refleje estas relaciones.

## 6. Diseño del sistema a alto nivel
- Explica la arquitectura general del sistema.
- Incluye un diagrama de arquitectura (por ejemplo, basado en microservicios, monolítico, etc.).

## 7. Diagrama C4 (en profundidad en un componente específico)
- Escoge un componente clave del sistema y detállalo usando el modelo C4.
- Presenta un diagrama que muestre su estructura interna y relaciones con otros elementos.

Entrega la documentación en un formato claro y estructurado, con diagramas legibles y explicaciones detalladas.

# Prompt 2

Eres un product manager y business Analyst. Usando el documento README.md quiero que generes las user stories para entregar un mvp utilizando la siguiente plantilla:
Formato estándar: "Como [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]".
Descripción: Una descripción concisa y en lenguaje natural de la funcionalidad que el usuario desea.
Criterios de Aceptación: Condiciones específicas que deben cumplirse para considerar la User Story como "terminada", éstos deberian de seguir un formato similar a "Dado que" [contexto inicial], "cuando" [acción realizada], "entonces" [resultado esperado].
Notas adicionales:  Notas que puedan ayudar al desarrollo de la historia
Tareas: Lista de tareas y subtareas para que esta historia pueda ser completada

genera los tickets de trabajo de la creacion y estima el esfuerzo de los tickets en dias de trabajo.

# Prompt 3

basado en el @README.md y en @TASKS.md, ademas de la estructura y del conocimiento que tienes del proyecto, quiero que me rellenes la siguiente plantilla en formado md

0. Ficha del proyecto
0.1. Tu nombre completo:
0.2. Nombre del proyecto:
0.3. Descripción breve del proyecto:
0.4. URL del proyecto:
Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a alvaro@lidr.co usando algún servicio como onetimesecret.

0.5. URL o archivo comprimido del repositorio
Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a alvaro@lidr.co usando algún servicio como onetimesecret. También puedes compartir por correo un archivo zip con el contenido

1. Descripción general del producto
Describe en detalle los siguientes aspectos del producto:

1.1. Objetivo:
Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

1.2. Características y funcionalidades principales:
Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

1.3. Diseño y experiencia de usuario:
Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

1.4. Instrucciones de instalación:
Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

2. Arquitectura del Sistema
2.1. Diagrama de arquitectura:
Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

2.2. Descripción de componentes principales:
Describe los componentes más importantes, incluyendo la tecnología utilizada

2.3. Descripción de alto nivel del proyecto y estructura de ficheros
Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

2.4. Infraestructura y despliegue
Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

2.5. Seguridad
Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

2.6. Tests
Describe brevemente algunos de los tests realizados

3. Modelo de Datos
3.1. Diagrama del modelo de datos:
Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

3.2. Descripción de entidades principales:
Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

4. Especificación de la API
Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

5. Historias de Usuario
Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

Historia de Usuario 1

Historia de Usuario 2

Historia de Usuario 3

6. Tickets de Trabajo
Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

Ticket 1

Ticket 2

Ticket 3

7. Pull Requests
Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

Pull Request 1

Pull Request 2

Pull Request 3