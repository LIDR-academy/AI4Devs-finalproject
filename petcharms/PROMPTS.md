> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 2 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Diseño Frontend](#7-diseño-frontend)
8. [Plan de Testing](#8-plan-de-testing)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Registro del Uso de IA](#10-registro-del-uso-de-ia)

---

## 1. Descripción general del producto

### Prompt 1

```
Necesito una ficha completa del producto para mi MVP de e-commerce de collares personalizados. 
Incluye propuesta de valor, problema que resuelve, público objetivo, objetivos del MVP con métricas, 
flujo E2E y métricas iniciales. Es un MVP simple, sin pagos reales.
```

### Prompt 2

```
Refina la ficha del producto. Agrega más detalles sobre las características principales que 
quiero incluir: personalización de collares (tamaño, color, letras, formas), sistema de autenticación, 
y las páginas que necesito. También mejora el flujo E2E con más detalle.
```

---

## 2. Arquitectura del sistema

### Prompt 1

```
Hazme un diagrama de arquitectura en Mermaid para PetCharms. Muestra React + Vite en frontend, 
Express como middleware, las rutas API, almacenamiento en memoria, y Supabase para auth.
```

### Prompt 2

```
Documenta el stack tecnológico que usé: React, Vite, Express, TanStack Query, Supabase, etc. 
Explica por qué elegí cada uno y qué alternativas consideré. También documenta las diferencias 
con el plan original.
```

---

## 3. Modelo de datos

### Prompt 1

```
Diseña el modelo de datos para mi MVP. Necesito entidades para productos, charms, órdenes y 
las relaciones entre ellas. Las órdenes deben incluir personalización (tamaño, color, letras, formas). 
Haz un diagrama ERD en Mermaid y explica cada entidad.
```

### Prompt 2

```
Refina el modelo de datos. Para el MVP voy a usar almacenamiento en memoria en lugar de base de datos. 
Simplifica la estructura y explica qué campos necesita cada entidad. También documenta las limitaciones 
de usar memoria.
```

---

## 4. Especificación de la API

### Prompt 1

```
Diseña los endpoints API REST para PetCharms. Necesito GET /products, GET /charms, GET /shapes, 
GET /colors, POST /orders, GET /orders y GET /orders/:id. Documenta cada uno con método, 
descripción, request, response y códigos de error. Sin código, solo descripciones.
```

### Prompt 2

```
Documenta cómo valido las órdenes con Zod. Explica qué campos valido y qué errores puede retornar. 
Sin código, solo descripción del schema y validaciones.
```

---

## 5. Historias de usuario

### Prompt 1

```
Genera 7 historias de usuario para el MVP: 5 MUST y 2 SHOULD. Cada una debe tener formato user story, 
criterios Given/When/Then, dependencias, riesgos y notas de QA. Enfócate en historias de negocio.
```

### Prompt 2

```
Mejora las historias de usuario. Agrega más detalles a los criterios de aceptación y expande 
las notas de QA con casos específicos que debo considerar al testear.
```

---

## 6. Tickets de trabajo

### Prompt 1

```
Convierte las 7 historias de usuario en tickets técnicos. Sepáralos en Backend, Frontend y DevOps. 
Cada ticket debe tener ID, título, tipo, historia asociada, módulo/impacto, estimación, 
descripción, criterios de Done y checklist QA. Necesito exactamente 13 tickets.
```

### Prompt 2

```
Actualiza los tickets con lo que realmente implementé. Revisa el código y actualiza las descripciones. 
Nota las diferencias con el plan original (TanStack Query en lugar de Zustand, datos en memoria, etc.).
```

---

## 7. Diseño Frontend

### Prompt 1

```
Documenta la estructura frontend de PetCharms. Incluye las carpetas (pages, components, hooks, lib), 
las tecnologías que usé (React Router, TanStack Query, shadcn/ui, TailwindCSS) y explica 
por qué está organizado así.
```

### Prompt 2

```
Diseña cómo voy a manejar el estado en el frontend. Necesito decidir qué usar para server state, 
cómo persistir el carrito, y cómo integrar la autenticación. Explica las opciones y recomienda 
la mejor estrategia para un MVP.
```

---

## 8. Plan de Testing

### Prompt 1

```
Define la estrategia de testing usando la pirámide: 60% unit, 30% integration, 10% E2E. 
Explica qué testear en cada nivel, qué herramientas usar y por qué esta distribución.
```

### Prompt 2

```
Documenta los escenarios negativos que debo testear (validaciones, límites, concurrencia, errores) 
y los criterios de salida para considerar que el testing está completo.
```

---

## 9. CI/CD Pipeline

### Prompt 1

```
Diseña el pipeline CI/CD conceptual. Muestra el flujo desde push hasta deployment: lint, test, build, 
preview deploy, code review, merge y production deploy. Haz un diagrama ASCII y explica qué bloquea 
el PR si algo falla.
```

---

## 10. Registro del Uso de IA

### Prompt 1

```
Documenta cómo usé IA en el proyecto. Para cada sección del README, explica qué prompts usé, 
cómo refiné la documentación, qué ajustes hice y por qué tomé ciertas decisiones técnicas.
```

---
