# AGENTS.MD - Reglas Globales del Asistente

Este archivo define el comportamiento obligatorio del AI Assistant para este proyecto.

## 1. SISTEMA DE REGISTRO (LOGGING)
**Regla:** Antes de ejecutar cualquier tarea compleja, debes registrar el prompt en el archivo `prompts.md` ubicado en la raíz.

### A. Verificación de Existencia
Si `prompts.md` **NO** existe, créalo con el siguiente contenido exacto:

# REGISTRO DE PROMPTS UTILIZADOS
**Autor**: [Usuario]
**Proyecto**: [Preguntar si no se extrae por contexto]
**Descripción**: Bitácora de prompts para trazabilidad del proyecto.
---

### B. Lógica de Escritura
Si el archivo ya existe:
1. Lee la última entrada para identificar el último ID (ej. 001).
2. Calcula el siguiente ID incremental (ej. 002).
3. Añade la nueva entrada al final del archivo siguiendo **estrictamente** este formato:

## [ID-INCREMENTAL] - [Título Breve descriptivo]
**Fecha:** YYYY-MM-DD HH:MM
**Prompt Original:**
> [Aquí pega el contenido LITERAL y COMPLETO del prompt del usuario. NO resumir.]

**Resumen de la Respuesta/Acción:**
[Aquí escribirás un resumen muy breve (1-2 líneas) de la solución que vas a plantear]
---

## 2. FLUJO DE TRABAJO (PLANNING PRIMERO)
**Regla:** Nunca escribas código final sin antes presentar un plan y obtener aprobación.

### Pasos Obligatorios:
1. **Análisis:** Lee y entiende el requerimiento.
2. **Logging:** Genera la entrada en `prompts.md` (como se define en la sección 1).
3. **Planificación:** Crea una lista de tareas (To-Do List) detallada de lo que vas a hacer.
4. **Confirmación:** Detente y pregunta: *"¿Procedo con este plan?"*.
5. **Ejecución:** Solo tras recibir un "Sí", procede a generar el código o realizar los cambios.

## 3. TESTING Y VALIDACIÓN
**Regla:** Fomenta la validación constante.
- Al finalizar una implementación, pregunta proactivamente si el usuario desea probar una funcionalidad específica.
- Si es un cambio de base de datos, sugiere verificar con herramientas visuales o scripts de prueba.

## 4. PROTOCOLO DE FINALIZACIÓN (DEFINITION OF DONE)

NO marques una tarea como completada hasta haber verificado estos 3 puntos:

1.  **¿Cambió la Arquitectura?**
    - Si añadiste un nuevo módulo, carpeta o servicio -> Actualiza `memory-bank/systemPatterns.md`.
    - Si añadiste una librería o dependencia -> Actualiza `memory-bank/techContext.md`.

2.  **¿Tomaste una Decisión Técnica?**
    - Si elegiste una herramienta, patrón o descartaste una opción -> Regístralo en `memory-bank/decisions.md`.

3.  **¿Cambió el Alcance (Scope)?**
    - Si lo que construiste difiere de lo planeado originalmente -> Actualiza `memory-bank/projectbrief.md` y `activeContext.md`.

> **Regla:** El código es volátil, el Memory Bank es permanente. Actualiza primero la memoria, luego el código.

---