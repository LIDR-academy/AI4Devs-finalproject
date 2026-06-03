# User Story: {título}

> Identificador: US-{épica}-{número}
> Épica: EP-{número} — {nombre-épica}
> Feature: FT-{épica}-{número} — {nombre-feature}
> Estado: Pendiente | En Progreso | Completada
> Prioridad: Must | Should | Could | Won't

---

## Historia

**Como** {rol/persona del PRD}
**Quiero** {acción o funcionalidad deseada}
**Para** {beneficio o valor que obtiene}

---

## Criterios de Aceptación

### Escenario 1: {nombre — happy path}
**Dado** {contexto inicial / precondiciones}
**Cuando** {acción que realiza el usuario}
**Entonces** {resultado esperado observable}

### Escenario 2: {nombre — caso alternativo}
**Dado** {contexto}
**Cuando** {acción}
**Entonces** {resultado}

### Escenario 3: {nombre — caso de error}
**Dado** {contexto}
**Cuando** {acción incorrecta o inesperada}
**Entonces** {manejo del error / mensaje al usuario}

---

## Priorización

| Método | Valor |
|--------|-------|
| MoSCoW | Must / Should / Could / Won't |
| RICE (opcional) | Reach: _ · Impact: _ · Confidence: _ · Effort: _ = **Score: _** |

**Justificación**: {por qué esta prioridad}

---

## Estimación de Esfuerzo

### Talla y Tiempo

| Talla | Rango de Tiempo | Puntos de Historia |
|-------|----------------|--------------------|
| XS | 0.5 – 1 día | 1 – 2 |
| S | 1 – 2 días | 3 – 5 |
| M | 3 – 5 días | 8 – 13 |
| L | 1 – 2 semanas | 13 – 21 |
| XL | 2 – 4 semanas | 21 – 40 |

> ⚠️ Si la talla es **XL**, considerar dividir la story en stories más pequeñas.

**Talla asignada**: {talla}
**Tiempo estimado**: {rango_tiempo}
**Puntos de Historia**: {puntos}
**Confianza**: Alta / Media / Baja

**Justificación del esfuerzo**: {por qué esta estimación — complejidad técnica, integraciones, incertidumbre, etc.}

---

## Dependencias

| Story | Tipo | Descripción |
|-------|------|-------------|
| US-{x}-{y} | Bloqueante / Preferente / Informativa | {descripción} |

---

## Notas Técnicas
<!-- Consideraciones para el equipo de desarrollo. No prescribir solución, orientar contexto -->

---

## Validación INVEST

| Criterio | ¿Cumple? | Observación |
|----------|----------|-------------|
| **I**ndependiente | ✅ / ⚠️ / ❌ | {la story puede implementarse sin depender de otra} |
| **N**egociable | ✅ / ⚠️ / ❌ | {los detalles son negociables, no prescriptivos} |
| **V**aliosa | ✅ / ⚠️ / ❌ | {aporta valor medible al usuario o negocio} |
| **E**stimable | ✅ / ⚠️ / ❌ | {el equipo puede estimar el esfuerzo} |
| **S**mall | ✅ / ⚠️ / ❌ | {completable en un sprint} |
| **T**esteable | ✅ / ⚠️ / ❌ | {tiene criterios de aceptación verificables} |

---

## Trazabilidad

```mermaid
graph LR
    PRD[PRD] --> EP[EP-{n}]
    EP --> FT[FT-{ep}-{n}]
    FT --> US[US-{ep}-{n}]
    US --> AC1[AC: Escenario 1]
    US --> AC2[AC: Escenario 2]
    US --> AC3[AC: Escenario 3]
```
