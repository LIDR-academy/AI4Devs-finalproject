# 🏗️ Estándar Profesional de Organización de Arquitectura de Tests (.agents/rules/02_testing_architecture_standard.md)

Este documento instruye la estructura de carpetas, distribución de capas, patrones de diseño y convenciones de nomenclatura para la **Arquitectura de Pruebas** en proyectos mantenidos por el arnés `.agents`.

---

## 🏛️ 1. Estructura de Carpetas y Ubicación de Pruebas

El marco `.agents` adopta un modelo híbrido basado en **Co-localización de Pruebas de Dominio/Componentes** y **Directorios Dedicados para Integración y E2E**:

```text
[raíz-del-proyecto]/
├── src/                                # CÓDIGO FUENTE & PRUEBAS CO-LOCALIZADAS
│   ├── domain/                         # 🟢 1. Unit Tests de Dominio (Co-localizados)
│   │   └── [modulo]/
│   │       ├── [Entity].ts
│   │       └── [Entity].test.ts        # Pure TypeScript. Zero dependencias DB/HTTP. Execution < 5ms.
│   ├── application/                    # 🟡 2. Tests de Casos de Uso (Co-localizados)
│   │   └── use-cases/
│   │       ├── [UseCase].ts
│   │       └── [UseCase].test.ts       # Test de lógica de negocio usando InMemory Fakes.
│   └── infrastructure/                 # 🔵 3. Tests de Componentes / Handlers
│       └── http/routes/
│           └── [route].test.ts         # Invocación HTTP Supertest / MSW.
│
├── tests/                              # PRUEBAS DE INTEGRACIÓN DE SERVICIOS (Cross-slice)
│   ├── auth/
│   ├── kitchen/
│   └── fixtures/                       # Constructores Object Mother (SK-32)
│
└── e2e/                                # 🟣 4. PRUEBAS E2E / BROWSER (Playwright)
    ├── pages/                          # Page Object Models (Encapsulación de Selectores - Guard 20)
    │   └── [Page]Page.ts
    └── specs/                          # Pruebas de Flujo Completo (RBT / MBT - SK-34)
        └── [feature].spec.ts
```

---

## 🏆 2. Distribución por Capas de Valor (Testing Trophy)

```mermaid
pyramid
    title Distribución Profesional de Cobertura y Esfuerzo
    "E2E (Playwright POM)" : 10% (Flujos Críticos de Alto Riesgo)
    "Integración (HTTP / DB)" : 30% (Contratos API & Persistencia)
    "Casos de Uso (Application + Fakes)" : 40% (Reglas de Negocio)
    "Unidad pura (Domain & VO)" : 20% (Invariantes & Math Precision)
```

---

## ✍️ 3. Anatomía Estándar de un Archivo de Pruebas (AAA + BDD + 3 Oráculos)

Todo test generado o mantenido por `.agents` DEBE cumplir con la anatomía de **3 bloques explícitos**:

```typescript
import { describe, it, expect } from 'vitest';
import { StockMother } from '../fixtures/StockMother';

describe('TK-008: Feature Consumo de Receta con Cascada FEFO', () => {
  it('debe descontar primero del lote con vencimiento más cercano (FEFO estricto)', async () => {
    // 1. ARRANGE (Dado): Configuración de datos deterministas con Object Mother (SK-32)
    const stockCercano = StockMother.createBatch({ expiresAt: '2026-08-18T10:00:00Z', qty: '5.000' });
    const stockLejano  = StockMother.createBatch({ expiresAt: '2026-08-20T10:00:00Z', qty: '10.000' });
    const fakeStockRepo = new InMemoryStockRepository([stockLejano, stockCercano]);
    const useCase = new ConsumeRecipeUseCase(fakeStockRepo);

    // 2. ACT (Cuando): Invocación de la acción
    const result = await useCase.execute({ recipeId: 'REC-001', servings: 1 });

    // 3. ASSERT (Entonces): Verificación con los 3 Oráculos (Guard 20)
    // ORACULO ESTADO: El lote cercano debe haberse consumido primero (FEFO)
    const updatedCercano = await fakeStockRepo.findById(stockCercano.id);
    expect(updatedCercano.quantity.toString()).toBe('0.000');

    // ORACULO RED / RESPUESTA: Retorna la confirmación de la transacción exitosa
    expect(result.isSuccess).toBe(true);
  });
});
```

---

## 📋 4. Convenciones de Nomenclatura Estándar

| Tipo de Prueba | Ubicación | Extensión | Patrón de Nombre |
|---|---|---|---|
| **Dominio / VO** | Co-localizado en `src/domain/` | `.test.ts` | `[Entity].test.ts` |
| **Caso de Uso** | Co-localizado en `src/application/` | `.test.ts` | `[UseCase].test.ts` |
| **Integración HTTP**| `tests/` | `.test.ts` | `[Feature]Integration.test.ts` |
| **E2E Browser** | `e2e/specs/` | `.spec.ts` | `[feature].spec.ts` |
