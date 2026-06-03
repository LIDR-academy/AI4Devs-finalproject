# Reglas de Validación — Product Owner

## INVEST (User Stories)

Toda user story generada DEBE pasar estas 6 validaciones. Si alguna falla, corregir antes de presentar al usuario.

| Criterio | Pregunta de Validación | Señal de Fallo |
|----------|----------------------|----------------|
| **I**ndependiente | ¿Se puede implementar sin completar otra story primero? | Referencia directa a otra US como prerrequisito |
| **N**egociable | ¿Los detalles permiten flexibilidad de implementación? | Prescribe solución técnica específica |
| **V**aliosa | ¿El usuario o negocio obtiene valor medible? | No hay beneficio claro en el "Para..." |
| **E**stimable | ¿Un equipo podría estimar el esfuerzo? | Alcance ambiguo o dependencias desconocidas |
| **S**mall | ¿Es completable en un sprint? | Más de 3 criterios de aceptación complejos |
| **T**esteable | ¿Se puede verificar objetivamente? | AC vagos sin Given/When/Then concretos |

### Acciones por Fallo
- **I falla** → dividir en stories independientes o documentar dependencia explícita
- **N falla** → reformular sin prescribir implementación técnica
- **V falla** → reescribir el "Para..." con beneficio concreto
- **E falla** → añadir contexto, dividir si es demasiado grande
- **S falla** → dividir en stories más pequeñas
- **T falla** → reescribir AC con datos concretos en Given/When/Then

---

## Criterios de Aceptación

### Reglas Obligatorias
1. Toda story DEBE tener **al menos 2 escenarios** Given/When/Then
2. Los escenarios DEBEN cubrir: **happy path + al menos 1 caso alternativo o de error**
3. Usar **datos concretos** en los escenarios, nunca genéricos
4. Cada "Entonces" debe ser **observable y verificable**

### Formato
```
Dado {estado/contexto concreto del sistema}
Cuando {acción específica del usuario}
Entonces {resultado observable y verificable}
```

### Anti-patrones a Evitar
- ❌ "Entonces el sistema funciona correctamente" → demasiado vago
- ❌ "Dado que el usuario está autenticado" sin especificar cómo
- ❌ Mezclar múltiples acciones en un solo "Cuando"
- ❌ Criterios que requieren juicio subjetivo para verificar

---

## Trazabilidad

### Reglas
1. Toda story referencia su **épica padre** (EP-X)
2. Toda story referencia su **feature** (FT-X-Y)
3. Todo AC referencia su **story** (US-X-Y)
4. El índice README mantiene el **mapa completo de trazabilidad**

### Diagrama de Trazabilidad Esperado
```
PRD
├── Objetivo de Negocio 1
│   ├── EP-1: Épica 1
│   │   ├── FT-1-1: Feature 1
│   │   │   ├── US-1-1: Story 1 → AC-1, AC-2
│   │   │   └── US-1-2: Story 2 → AC-1, AC-2, AC-3
│   │   └── FT-1-2: Feature 2
│   │       └── US-1-3: Story 3 → AC-1, AC-2
│   └── EP-2: Épica 2
│       └── ...
└── Objetivo de Negocio 2
    └── ...
```

### Validación de Trazabilidad
- No deben existir stories **huérfanas** (sin épica)
- No deben existir features **vacías** (sin stories)
- Toda épica debe tener al menos **1 criterio de éxito** vinculado a un KPI del PRD

---

## Dependencias

### Clasificación
| Tipo | Significado | Acción |
|------|-------------|--------|
| **Bloqueante** | Story B no puede empezar hasta que A esté completa | Ordenar en backlog, documentar en ambas stories |
| **Preferente** | B se beneficia de A completada, pero puede empezar sin ella | Notar la preferencia, no bloquear |
| **Informativa** | B tiene relación con A pero son independientes | Documentar referencia cruzada |

### Reglas
1. Identificar dependencias **entre stories de la misma épica** y **entre épicas**
2. Marcar dependencias bloqueantes en la **sección de dependencias** de cada story
3. Si hay ciclos de dependencias → **error**: reestructurar las stories

---

## Priorización

### MoSCoW (Clasificación Rápida)
| Categoría | Significado | Criterio |
|-----------|-------------|----------|
| **Must** | Imprescindible para el MVP | Sin esto el producto no tiene sentido |
| **Should** | Importante, pero no bloquea el lanzamiento | Alto valor pero viable sin ello |
| **Could** | Deseable si hay tiempo/recursos | Mejora la experiencia pero no es esencial |
| **Won't** | No en este ciclo | Documentado para futuro |

### RICE (Análisis Cuantitativo — usar cuando hay >10 stories)
| Factor | Escala | Descripción |
|--------|--------|-------------|
| **R**each | 1-10 | Cuántos usuarios impacta |
| **I**mpact | 0.25, 0.5, 1, 2, 3 | Nivel de impacto por usuario |
| **C**onfidence | 50%, 80%, 100% | Confianza en las estimaciones |
| **E**ffort | Persona-sprint | Esfuerzo estimado |
| **Score** | (R × I × C) / E | Mayor score = mayor prioridad |

### Reglas de Priorización
1. Toda story DEBE tener prioridad MoSCoW asignada
2. RICE es opcional pero recomendado cuando hay más de 10 stories
3. Documentar la **justificación** de la prioridad, no solo el valor

---

## Estimación de Esfuerzo

### Tabla de Referencia Talla ↔ Tiempo

| Talla | Rango de Tiempo | Puntos de Historia | Complejidad Típica |
|-------|----------------|--------------------|--------------------|
| **XS** | 0.5 – 1 día | 1 – 2 | Cambio trivial, config, copy, ajuste visual |
| **S** | 1 – 2 días | 3 – 5 | Feature simple, un componente, sin integraciones |
| **M** | 3 – 5 días | 8 – 13 | Feature con lógica, 2-3 componentes, alguna integración |
| **L** | 1 – 2 semanas | 13 – 21 | Feature compleja, múltiples componentes, integraciones |
| **XL** | 2 – 4 semanas | 21 – 40 | Épica mal dividida — considerar split obligatorio |

### Reglas de Estimación
1. Toda story DEBE tener **talla + rango de tiempo + puntos** asignados
2. La talla y el tiempo DEBEN ser **coherentes** con la tabla de referencia
3. Si la talla es **XL** → señal de que la story debe dividirse. Documentar como ⚠️
4. Toda estimación DEBE incluir **justificación** (complejidad técnica, incertidumbre, integraciones, dependencias)
5. Incluir **nivel de confianza**: Alta (>80%), Media (50-80%), Baja (<50%)

### Agregación por Épica
Al completar las stories de una épica, generar un **resumen de esfuerzo**:

| Métrica | Valor |
|---------|-------|
| Total stories | {n} |
| Distribución de tallas | XS: _ · S: _ · M: _ · L: _ · XL: _ |
| Tiempo total estimado | {min} – {max} días |
| Puntos totales | {min} – {max} |

### Agregación MVP/MLP
Al completar la definición del MVP, generar un **resumen global**:

| Fase | Épicas | Stories | Tiempo Estimado | Puntos |
|------|--------|---------|-----------------|--------|
| MVP | {n} | {n} | {min} – {max} semanas | {total} |
| MLP | {n} | {n} | {min} – {max} semanas | {total} |

### Señales de Alerta
- ⚠️ Story con talla XL → dividir obligatoriamente
- ⚠️ Confianza Baja en >30% de stories → necesita más investigación/spike
- ⚠️ Épica con >80 puntos totales → revisar alcance de la épica
- ⚠️ Incoherencia talla/tiempo → recalibrar estimación
