# Mapa de Seguridad Urbana - Diego Fernando Orozco (DFO)
> Modelo - ChatGPT

## Índice

1. [Descripción general del producto](prompts-descripcion.md#1-descripción-general-del-producto)
2. [Arquitectura del sistema](prompts-arquitectura.md#2-arquitectura-del-sistema)
3. [Modelo de datos](prompts-modelo-datos.md#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

Hola, vas a actuar como un experto de producto especializado en responsabilidad social empresarial (RSE) y para esto vamos a empezar con la investigación del sistema que quiero implementar.

El sistema o producto final será un "Mapa de Seguridad Urbana", el cual será una plataforma en la que los usuarios pueden marcar y comentar sobre la seguridad de diferentes zonas en la ciudad (iluminación, incidencias, puntos peligrosos, etc).

Ahora para la investigación responde las siguientes preguntas:

- ¿Cuál es el propósito u objetivo del producto?
- ¿Qué valor aporta el producto?
- ¿Qué soluciona el producto?
- ¿Para quién está dirigido el producto?
- Enumera ¿Cuáles son las necesidades que cubre el producto?
- Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.
- Enumera los beneficios que ofrece el producto
- Enumera 10 opciones para el nombre del producto, teniendo en cuenta que debe ser un nombre corto, de alto impacto, creativo, de fácil recordación y transmitir el objetivo del producto. 

**Prompt 2:**

Hola, vamos a acotar el proyecto a un producto mínimo viable, en el que se endrán las siguientes funcionalidades:

1. **Autenticación con OAUTH2 con Google:** Permite el registro de usuarios con su cuenta de google en caso de querer realizar algún reporte.
2. **Capacidad de reportar incidencias:** Los usuarios registrados pueden reportar problemas como robos, vandalismo, iluminación deficiente, entre otros.
3. **Sistema de comentarios y valoraciones:** Permite a los usuarios calificar y comentar sobre la seguridad de zonas específicas, creando una base de opiniones comunitaria.
4. **Modo anónimo para consulta:** Culquier persona puede consultar incidentes de manera anónima.

espera hasta que te pregunte sobre lo que vamos a seguir haciendo