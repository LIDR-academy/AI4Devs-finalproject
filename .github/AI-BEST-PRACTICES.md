# AI Assistant - Best Practices

## 🤖 Guía para Trabajo Eficiente con GitHub Copilot

### 1. Uso de Snippets de Espanso

#### ❌ Problema
Cuando usas snippets de espanso (ej. `:audit-master`), el AI puede:
- Registrar solo el trigger en prompts.md (`:audit-master`) en lugar del texto completo
- Perder contexto del prompt real que escribiste

#### ✅ Solución

**Opción A - Incluir Nota Explícita** (Recomendado para prompts complejos):
```markdown
:audit-master

# NOTA: Esto es un snippet de espanso.
# El AI debe registrar el texto expandido completo arriba ↑
```

**Opción B - Verificar Registro**:
Después de una tarea compleja, verifica en `prompts.md` que el prompt se registró correctamente:
```bash
tail -20 prompts.md  # Ver última entrada
```

Si detectas que solo se registró el trigger, informa al AI:
> "El último prompt registraste solo `:trigger` en lugar del texto completo. Por favor corrígelo."

### 2. Prompts Multi-Paso

#### ❌ Evitar
```markdown
Haz A, B, C, D y E

(Sin detalles, sin priorización)
```

#### ✅ Mejor
```markdown
Realizar las siguientes tareas en orden:

1. **PRIORIDAD ALTA**: Tarea A
   - Detalle específico
   - Archivo esperado: src/...

2. **PRIORIDAD MEDIA**: Tarea B
   - Condición: Solo si A pasa tests

3. **PRIORIDAD BAJA**: Tarea C (opcional)

Detente después de cada prioridad y confirma antes de continuar.
```

### 3. Registro en prompts.md

El AI DEBE registrar prompts complejos en `prompts.md`. Si no lo hace automáticamente:

```markdown
# Tu prompt
Implementa X, Y, Z...

# Al final del prompt, añade:
NOTA: Registra este prompt en prompts.md antes de ejecutar.
```

### 4. Validación de Cambios

Siempre que el AI realice cambios en múltiples archivos:

**Checklist Manual**:
```bash
# 1. Verificar que tests pasan
make test
make test-front

# 2. Verificar documentación actualizada
git status  # ¿Se actualizó memory-bank/?

# 3. Verificar prompts.md
tail -30 prompts.md  # ¿Está el último prompt?
```

### 5. Trabajar con TDD

#### ✅ Flujo Óptimo
```markdown
# Paso 1: Solicitar FASE ROJA
Implementa T-XXX-BACK FASE ROJA:
- Crear tests que fallen
- NO implementes la solución aún
- DETENTE después de crear tests

# Paso 2: Revisar tests (manual)
# Usuario verifica que tests fallen correctamente

# Paso 3: Solicitar FASE VERDE
Implementa T-XXX-BACK FASE VERDE:
- Hacer pasar los tests
- NO refactorices aún
- DETENTE cuando tests pasen

# Paso 4: Solicitar FASE REFACTOR
Implementa T-XXX-BACK FASE REFACTOR:
- Mejora código manteniendo tests passing
- Aplica Clean Architecture
- Actualiza documentación
```

### 6. Trabajo con Memory Bank

El Memory Bank es el **cerebro persistente** del proyecto.

#### ❌ Error Común
Hacer cambios en código sin actualizar:
- `memory-bank/systemPatterns.md` (arquitectura)
- `memory-bank/techContext.md` (dependencias)
- `memory-bank/decisions.md` (decisiones técnicas)
- `memory-bank/progress.md` (historial)

#### ✅ Workflow Correcto
```markdown
# Al final de cada sesión significativa, pide:
Actualiza el Memory Bank con los cambios de hoy:
- systemPatterns.md: [indicar cambio arquitectónico]
- techContext.md: [indicar nueva dependencia]
- decisions.md: [indicar decisión técnica]
- progress.md: [indicar milestone completado]
```

### 7. Auditorías Periódicas

Cada vez que completes un sprint o milestone importante:

```markdown
:audit-master

# O manualmente:
Ejecuta auditoría completa del codebase:
1. Contratos API alineados
2. Clean Architecture enforced
3. Dead code eliminado
4. Dependencies sin vulnerabilidades
5. Docker hardened
6. Memory Bank sincronizado
7. Tests passing
8. Documentación actualizada
9. Seguridad básica OK
10. Code quality metrics

Genera reporte con score y plan de remediación.
```

### 8. Comunicación con el AI

#### ✅ Comandos Efectivos

**Investigación**:
```markdown
Busca en el codebase: [concepto]
# El AI usará semantic_search, grep_search, list_code_usages
```

**Implementación**:
```markdown
Implementa [feature]:
1. Presenta plan detallado
2. DETENTE y espera aprobación
3. Ejecuta plan
4. Verifica tests
5. Actualiza documentación
```

**Depuración**:
```markdown
Debuggea [error]:
1. Lee logs completos
2. Identifica root cause
3. Propón solución
4. DETENTE antes de aplicar fix
```

### 9. Uso de TODO Lists

El AI puede crear TODO lists para tareas complejas. Aprovecha esto:

```markdown
# El AI creará automáticamente:
[ ] Tarea 1 (not-started)
[→] Tarea 2 (in-progress)
[✓] Tarea 3 (completed)

# Monitorea progreso con:
# El AI actualizará el estado en tiempo real
```

### 10. Manejo de Errores

Si el AI comete un error (como registrar mal un prompt):

#### ✅ Feedback Constructivo
```markdown
# ❌ Evitar:
"Está mal"

# ✅ Mejor:
"En el prompt #048 registraste solo ':audit-master' en lugar del 
texto expandido completo. ¿Puedes corregirlo y explicar cómo 
evitar esto en el futuro?"
```

Esto permite al AI:
1. Corregir el error específico
2. Aprender el patrón
3. Actualizar `AGENTS.md` si es necesario
4. Documentar la solución

---

## 📋 Checklist de Sesión

Al final de cada sesión de trabajo:

- [ ] Tests passing (backend + frontend)
- [ ] Cambios documentados en Memory Bank
- [ ] Prompts complejos registrados en prompts.md
- [ ] Git staging area limpio (sin archivos no deseados)
- [ ] README actualizado si cambió estructura
- [ ] Docker compose functionality verificada

---

## 🆘 Si Algo Sale Mal

```bash
# 1. Verificar estado del proyecto
make test  # ¿Tests verdes?
git status  # ¿Cambios esperados?

# 2. Revisar últimos prompts
tail -50 prompts.md

# 3. Consultar Memory Bank
cat memory-bank/activeContext.md  # ¿Qué debería estar pasando?

# 4. Pedir ayuda al AI
"Algo salió mal con [X]. Estado esperado: [Y]. Estado actual: [Z]. 
¿Puedes diagnosticar?"
```

---

**Última actualización**: 2026-02-09  
**Mantenedor**: Pedro Cortes  
**Proyecto**: Sagrada Família Parts Manager (ai4devs TFM)
