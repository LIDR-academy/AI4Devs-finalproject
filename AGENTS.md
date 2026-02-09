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
   - **IMPORTANTE:** Este método es vulnerable a condiciones de carrera en entornos multi-agente.
   - **SOLUCIÓN RECOMENDADA:** Implementar bloqueo de archivos (file-locking) o usar un mecanismo de asignación centralizada de IDs.
   - **FORMATO ALTERNATIVO:** Usa un ID monotónico único basado en fecha/hora para evitar colisiones: `YYYYMMDD-HHMM-SS`.


## [ID-INCREMENTAL] - [Título Breve descriptivo]
**Fecha:** YYYY-MM-DD HH:MM
**Prompt Original:**
> [Aquí pega el contenido LITERAL y COMPLETO del prompt del usuario. NO resumir.]
> 
> **IMPORTANTE - Snippets de Espanso:**
> Si detectas un trigger como `:comando`, debes registrar el TEXTO EXPANDIDO COMPLETO que ves en el userRequest.
> Nunca registres solo el trigger (ej. `:audit-master`) sin el contenido real.
> Formato preferido cuando detectes snippet:
> ```
> **Prompt Original (Snippet expandido):**
> > :trigger-name
> >
> > [Texto completo expandido del snippet]
> ```

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
   - **Checklist de Revisión:**
     - [ ] ¿Están identificados todos los archivos afectados?
     - [ ] ¿Son claras las dependencias/prerrequisitos?
     - [ ] ¿El alcance es adecuado para una sola sesión?

5. **Ejecución:** Solo tras recibir un "Sí", procede a generar el código o realizar los cambios.

## 3. TESTING Y VALIDACIÓN
**Regla:** Fomenta la validación constante.
- Al finalizar una implementación, pregunta proactivamente si el usuario desea probar una funcionalidad específica.
- Si es un cambio de base de datos, sugiere verificar con herramientas visuales o scripts de prueba.

## 4. PROTOCOLO DE FINALIZACIÓN (DEFINITION OF DONE)
 
NO marques una tarea como completada hasta haber ejecutado este checklist de verificación:
 
### 1. Verificación Documental (Crucial)
Antes de cerrar, verifica que los artifacts reflejan la realidad del código:
- [ ] **memory-bank/systemPatterns.md**: Actualizado si hubo cambios de arquitectura/módulos.
- [ ] **memory-bank/techContext.md**: Actualizado si hubo nuevas dependencias.
- [ ] **memory-bank/decisions.md**: Registro de decisiones técnicas importantes (ADRs).
- [ ] **memory-bank/projectbrief.md**: Actualizado si cambió el alcance/scope.
- [ ] **prompts.md**: Todos los prompts complejos registrados.
 
### 2. Proceso de Aprobación
- **Reviewer Requerido**: Usuario (BIM Manager / Tech Lead).
- **Flujo**:
    1. Presentar resumen de cambios (changelog).
    2. Demostrar cumplimiento de requisitos (screenshots, logs, tests).
    3. Solicitar confirmación explícita: "¿Das por cerrada esta tarea?".
 
### 3. Consecuencias
- **Skipping Steps**: Si saltas estos pasos, el PR será rechazado automáticamente por el sistema de CI/CD 
 o por la revisión humana, requiriendo un rework costoso.
- **Inconsistencias**: La deuda de documentación se acumula exponencialmente. Limpia antes de salir.
 
> **Regla de Oro:** El código es volátil, el Memory Bank acumulativo y permanente. Actualiza primero la memoria, luego el código.

---