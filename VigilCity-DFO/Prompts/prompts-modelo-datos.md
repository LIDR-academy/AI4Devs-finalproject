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

### 3. Modelo de Datos

> Modelo - ChatGPT

**Prompt 1:**

Ahora actúa como un experto en arquitectura de software y dba en postgres.
Crea el modelo de datos para cada microservicio, dónde:
1. La base de datos se llamará vigilcity
2. Cada microservicio tendrá un esquema en la base de datos postgress.
3. Puede haber un esquema principal o transversal si es necesario, esto para no duplicar entidades con la misma información en diferentes esquemas.
4. Define las llaves primarias y foráneas
5. Genera para las entidades transaccionales una columna de fecha y hora de creación del registro y otra de fecha y hora de actualización del registro.
6. Utiliza buenas prácticas para la creación del modelo de datos, buenas prácticas de nombramiento de campos, entidades, llaves, índices, etc.
7. Las entidades finales deben estar normalizadas en la tercera forma normal
8. Genera el modelo en mermaid

**Prompt 2:**

Para cada entidad, genera la especificación en forma de tabla incluyendo incluir el máximo detalle, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

**Prompt 3:**