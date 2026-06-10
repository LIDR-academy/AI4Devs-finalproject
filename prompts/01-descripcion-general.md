# Breve nota de cómo guié al agente
```
Primero, esto lo realicé en Claude Desktop (Windows).
Creé un proyecto para iterar sobre la idea, y luego, ya teniendo la idea clara, la pasé a la IA de Claude para iterar sobre el proyecto y las funcionalidades principales, que me ayudaron a completar el formulario del readme.md.
```
---
# Prompts usados para iterar el README de INK·LINK

> Sesión de trabajo · Junio 2026 · Iteraciones sobre `INKLINK_README_v4.md`

---

## 01 — Kick-off del proyecto

```
Generar documentación técnica con IA. Para ello necesito un PRD o un draft PRD.
Ese PRD dividirlo en historias de usuario, sacar 5 historias de usuario priorizadas
por MoSCoW y esas hacerlas en un software. En realidad son funcionalidades clave
del sistema que puedan ser historias de usuario.
Además el software lo quiero mejorar, puede ser con una búsqueda por el mapa que
te aparezcan los tatuadores más cercanos o cotizar. Con un chatbot.
Ayúdame a organizar la idea que necesito para un proyecto.
```

---

## 02 — Funcionalidades faltantes + solicitud de fuente de verdad

```
Faltan las siguientes funcionalidades (confirmame si me equivoco en alguna):

* El sistema es una vitrina de tatuadores, por lo que al ingresar ya se ven
  tatuajes y sus ejecutores
* Los tatuadores además de ser calificados, muestran si han sido reconocidos
  en algún evento o competencia, o entidad de tatuajes.
* Los tatuadores pueden ser auspiciados por marcas de tintas, poleras, gorros,
  piercings,
* El sistema puede mostrar eventos de tatuajes próximos, como competencias o
  eventos importantes de la comunidad de tatuajes
* Los tatuadores pueden estar certificados por alguna entidad reguladora de
  sanidad, esto por el uso de agujas y tintas
* Pueden existir marcas que quieran hacer publicidad en el sitio, de tintas,
  agujas, maquinas, gorros, poleras, etc

De todo lo anterior, considerar que lo más importante del sistema es que sea una
vitrina donde se puedan ver los tatuajes y tatuadores cercanos a uno o buscarlos
en el mapa, y que éstos sean calificados.

Ahora, escribe todas las funcionalidades principales del sistema, además de lo
siguiente:

0.2. Nombre del proyecto:
0.3. Descripción breve del proyecto:
1. Descripción general del producto
1.1. Objetivo:
1.2. Características y funcionalidades principales:

Por último, necesito que escribas una descripción COMPLETA de este proyecto,
para poder utilizarlo como fuente de verdad del proyecto.
```

---

## 03 — Formato README con color

```
Dámelo en formato Markdown, pensando que será un README del proyecto,
así que ponle COLOR!
```

---

## 04 — Estructura exacta del README

```
Lo que necesito es que hagas un formato markdown estiloso, pero respondiendo
solo esto:

### **0.3. Descripción breve del proyecto:**
### **0.4. URL del proyecto:**
### 0.5. URL o archivo comprimido del repositorio
## 1. Descripción general del producto
### **1.1. Objetivo:**
### **1.2. Características y funcionalidades principales:**
### **1.3. Diseño y experiencia de usuario:**
```

---

## 05 — Cambio de stack: Angular + .NET + SQL Server

```
Ojo que no quiero que sea PWA, solo sitio web.
Será en angular con .net y bbdd sql server.
```

---

## 06 — Actualizar todos los documentos con el nuevo stack

```
Sí, actualiza todo.
```

---

## 07 — Cambios de contenido + estructura final solicitada

```
Cambiemos lo siguiente:

1. Modifica Instagram por Redes sociales, no se usa solo IG para cotizar,
   sino varias redes sociales.
2. El cotizador que sea solo chatbot, y que en este el chatbot realice preguntas
   para "bajar la carga" al tatuador y reducir los tiempos de cotización.
3. Deja como funcionalidades principales lo que tenga que ver con: Descubrir,
   comparar, cotizar, reservar, calificar.
4. Utiliza Emojis, tablas, fuentes, para mejorar el aspecto del markdown.
5. Aferrate a responder solo los items que se detallan a continuación:

### **0.2. Nombre del proyecto:**
### **0.3. Descripción breve del proyecto:**
## 1. Descripción general del producto
### **1.1. Objetivo:**
### **1.2. Características y funcionalidades principales:**
```

---

## 08 — Simplificación del flujo cotizar → reservar (sin negociación)

```
Como quiero hacer un MVP de esto, un desarrollo ligero funcional, ¿cómo puedo
hacerlo con el método de pago? Estas funcionalidades las probarán en un taller
de un curso que estoy haciendo.
```

*(derivó en la decisión de eliminar el paso de negociación artista-cliente)*

---

## 09 — Selección de 5 funcionalidades para el taller

```
P: ¿Con cuántas funcionalidades te sientes cómodo para el taller?
R: 5 funcionalidades (más completo)
```

---

## 10 — Actualizar README con flujo simplificado de 5 funcionalidades

```
Actualiza el Readme.
```

---

## 11 — Aclarar datos pre-cargados (seed) para certificaciones y auspicios

```
Este punto: "El artista sube documentación oficial..."
Y este punto: "Marcas de tintas, máquinas, gorros..."
Indican que mi sistema "debería" permitir la funcionalidad de subir por parte
del tatuador esto... ¿lo consideraste como funcionalidad adicional?
Esto me crearía historias de usuario.
```

---

## 12 — Confirmar aclaración en el README

```
Sí, deja claro que son datos pre-cargados en el MVP.
```

---

## 13 — Este prompt

```
Dame todos los prompts que utilicé para iterar contigo en README en esta
sesión de chat en un archivo markdown.
```

---

## Resumen de versiones generadas

| Versión | Cambio principal |
|---|---|
| `INKLINK_README_Final.md` | Primera versión con estructura 0.3 → 1.3, stack Angular/.NET/SQL Server |
| `INKLINK_README_v3.md` | Chatbot cotizador, redes sociales, 5 momentos del ciclo |
| `INKLINK_README_v4.md` | Flujo directo sin negociación, 5 funcionalidades del taller, seed data |

---

*INK·LINK © 2026 · Historial de iteraciones del README*