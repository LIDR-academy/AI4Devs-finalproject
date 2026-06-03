---
name: generate-readme
description: >-
  Generar automáticamente un archivo `README.md` en español. Claro, completo y siguiendo buenas prácticas de documentación técnica. No requiere de ningún parámetro.
  Usar cuando el usuario pida generar o actualizar un README, o invoque la skill generate-readme o /generate-readme.

---

# generate-readme — Generación de README

# Skill: Generar README profesional

## Objetivo
Generar automáticamente un archivo `README.md` claro, completo y siguiendo buenas prácticas de documentación técnica.  
La salida SIEMPRE debe estar en español.
El fichero se debe de guardar o actualizar en la raíz del proyecto.

---

## Instrucciones

Actúa como un experto en documentación técnica y desarrollo de software.

A partir del contexto del repositorio (archivos, estructura, dependencias, código), genera o actualiza un `README.md` en la raíz del proyecto que:

- Sea claro, conciso y estructurado
- Siga estándares de proyectos profesionales (open source / enterprise)
- Use Markdown correctamente
- Esté completamente en español
- No invente información que no pueda inferirse del código

Si falta información relevante, indícalo explícitamente en el README.

---

## Estructura obligatoria

El README debe incluir SIEMPRE las siguientes secciones:

### 1. Título y descripción
- Nombre del proyecto
- Descripción breve (qué hace y para qué sirve)

### 2. Tabla de contenidos
- Navegación interna con anchors

### 3. Instalación
- Requisitos previos
- Pasos de instalación

### 4. Uso
- Cómo ejecutar el proyecto
- Ejemplos básicos

### 5. Estructura del proyecto
- Explicación de carpetas y archivos clave

### 6. Configuración
- Variables de entorno (si aplica)
- Configuraciones importantes

### 7. Scripts disponibles
- Lista de comandos (npm, make, etc.)

### 8. Tecnologías utilizadas
- Stack principal

### 9. Contribución
- Cómo contribuir (si aplica)

### 10. Licencia
- Tipo de licencia o nota si no está definida

---

## Reglas de formato

- Usar encabezados Markdown (`#`, `##`, `###`)
- Usar listas con bullet points siempre que sea posible
- Usar bloques de código para comandos
- Mantener frases cortas y precisas
- Evitar texto redundante

---

## Comportamiento ante información incompleta

Si no puedes inferir algo:
- Añade una nota como:
  > ⚠️ Información no disponible: [explica qué falta]

Nunca inventes configuraciones, endpoints o comandos.