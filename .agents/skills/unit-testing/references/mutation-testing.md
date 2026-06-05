# Guía de Referencia: Mutation Testing (Pruebas de Mutación)

Este documento define el estándar para configurar, ejecutar e interpretar pruebas de mutación dentro del flujo de desarrollo del proyecto.

## 1. ¿Qué es Mutation Testing?

Las pruebas de mutación evalúan la calidad de las pruebas existentes introduciendo pequeños cambios defectuosos (mutantes) en el código fuente de producción. Si las pruebas fallan tras introducir un mutante, el mutante ha sido **eliminado (killed)** (comportamiento correcto). Si las pruebas siguen pasando, el mutante ha **sobrevivido (survived)** (comportamiento incorrecto; indica que falta una aserción o un caso de prueba).

### Conceptos Clave:
- **Mutante (Mutant):** Copia modificada del código (ej. cambiar un `>` por `>=` o `+` por `-`).
- **Mutante Eliminado (Killed):** Las pruebas detectaron el fallo (¡Bien!).
- **Mutante Sobrevivido (Survived):** Las pruebas no detectaron el fallo (¡Alerta!).
- **Mutation Score (Tasa de Mutación):** `(Mutantes Eliminados / Total de Mutantes) * 100`. El umbral mínimo requerido es **70%**.

---

## 2. Configuración por Tecnologías

### JavaScript / TypeScript (Stryker Mutator)

Instalación:
```bash
pnpm add -D @stryker-mutator/core @stryker-mutator/vitest-runner
```

Configuración básica (`stryker.config.json`):
```json
{
  "$schema": "https://schema.stryker-mutator.io/stryker-config.schema.json",
  "packageManager": "pnpm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "thresholds": { "high": 80, "low": 70, "break": 70 },
  "mutate": [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts"
  ]
}
```

Ejecución:
```bash
pnpm stryker run
```

---

### Python (mutmut)

Instalación:
```bash
pip install mutmut
```

Configuración básica (`setup.cfg`):
```ini
[mutmut]
paths_to_mutate=src/
backup=false
runner=python -m pytest
tests_dir=tests/
```

Ejecución:
```bash
mutmut run
mutmut results
```

---

### Go (go-mutesting)

Instalación:
```bash
go install github.com/zimmski/go-mutesting/...@latest
```

Ejecución:
```bash
go-mutesting ./...
```

---

## 3. Eliminación de Mutantes Sobrevivientes

Cuando un mutante sobrevive:
1. **Identifica el cambio realizado:** Stryker o mutmut mostrarán la línea exacta y la mutación aplicada (ej. `if (x > y)` mutado a `if (x >= y)` o `if (true)`).
2. **Analiza por qué no falló:** Busca el caso de prueba límite. Si `x === y` no está cubierto por una prueba con una aserción estricta, la prueba no fallará.
3. **Corrige escribiendo una nueva aserción:** Agrega el caso límite específico (edge case) en tu archivo de prueba unitaria para validar que el comportamiento mutado cause un fallo.
