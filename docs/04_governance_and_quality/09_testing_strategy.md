---
document: testing_strategy
version: 1.2.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/04_governance_and_quality/08_security_strategy.md
---

# 🧪 Especificación de Estrategia de Pruebas TDD y Calidad

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Estrategia de Seguridad (08_security_strategy.md)](./08_security_strategy.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Pipeline CI/CD (10_cicd_pipeline.md) ➡️](./10_cicd_pipeline.md)

---

## 🚫 1. Directiva Estricta de TDD (AI Mandate)

Para garantizar un código robusto, libre de regresiones y altamente acoplado a las especificaciones del negocio, los agentes de IA y desarrolladores deben seguir obligatoriamente este proceso:

### ⚠️ Reglas Inquebrantables
1.  **Cero Código de Producción sin Test de Fallo previo:** El agente de IA **NUNCA** debe escribir código de producción (entidades, casos de uso, controladores o adaptadores) sin antes haber escrito la suite de pruebas unitarias o de integración correspondiente que falle primero (**Fase RED**). El test debe fallar por una razón legítima (ej. función no implementada o invariante insatisfecha), no por errores de sintaxis o de compilación TypeScript.
2.  **Prohibición de Alteración de Tests Existentes:** El agente de IA **NUNCA** debe modificar, reescribir o relajar las aserciones de un archivo de pruebas existente para hacer pasar una implementación errónea, incompleta o defectuosa en producción. Los archivos de tests existentes son la salvaguarda de regresiones.
    *   *Excepción única:* Que el contrato del negocio o requerimiento funcional haya cambiado por orden explícita y escrita del usuario (humano). En tal caso, primero se adapta el test al nuevo contrato para que falle, y luego se modifica el código de producción.
3.  **Refactorización Controlada:** Una vez que la prueba pasa con el código más simple posible (**Fase GREEN**), se permite refactorizar la lógica (**Fase REFACTOR**) bajo la garantía de que los tests sigan pasando de manera exitosa.

---

## 📐 2. Estructura y Niveles de Testing

El sistema RestoStock adopta la **Pirámide de Testing** adaptada al estilo de *Vertical Slices*:

```text
          / \
         /   \     Pruebas E2E (REST API Contracts & Flows)
        / E2E \    ~10% Cobertura
       /-------\
      / Integr. \  Pruebas de Integración (Use Cases + In-Memory/Prisma DB)
     /-----------\ ~30% Cobertura
    /   Unitary   \ Pruebas Unitarias (Domain Entities, Value Objects, Pure Logic)
   /_______________\ ~60% Cobertura
```

### 2.1. Pruebas Unitarias (Capa de Dominio)
*   **Alcance:** Entidades de dominio, Value Objects, reglas de negocio e invariantes inmutables.
*   **Garantías:** Se ejecutan en milisegundos. Deben estar 100% libres de dependencias de red, Express, Prisma o sistemas de archivos.
*   **Regla:** Se prueban todas las ramas lógicas (happy path, límites y flujos de error).

### 2.2. Pruebas de Integración (Capa de Aplicación e Infraestructura)
*   **Alcance:** Orquestación de Casos de Uso conectando con adaptadores concretos (como repositorios en memoria para velocidad, o Prisma con la base de datos PostgreSQL de pruebas local/CI).
*   **Garantías:** Verifican que la base de datos responde correctamente a las transacciones y que los datos guardados preservan la integridad relacional.

### 2.3. Pruebas End-to-End / API (Capa de Infraestructura Externa)
*   **Alcance:** Rutas HTTP de la API REST completas, validación del middleware de autenticación (PIN/JWT) y mapeo correcto de payloads de respuesta REST.

---

## 🔍 3. Reglas de Diseño de Pruebas

Para mantener la mantenibilidad de la suite de pruebas a lo largo del tiempo, se establecen tres directrices:

### 3.1. Patrón AAA (Arrange, Act, Assert)
Cada bloque de prueba debe dividirse visual y lógicamente en tres pasos claros:
*   **Arrange (Preparar):** Inicializar variables, configurar repositorios del dominio (fakes) y crear entidades iniciales.
*   **Act (Actuar):** Ejecutar el método o caso de uso bajo prueba.
*   **Assert (Verificar):** Validar los resultados obtenidos contra los esperados utilizando aserciones semánticas.

### 3.2. Mocks Mínimos (Favorecer Fakes e In-Memory)
*   **Directiva:** Queda prohibido el abuso de mocks de comportamiento (ej. `jest.spyOn`, mocks de llamadas internas o mocks profundos de Prisma). Los mocks excesivos acoplan los tests a la implementación interna de las funciones, rompiendo los tests ante refactorizaciones menores que no alteran el resultado del negocio.
*   **Solución:** Se exige el uso de **Fakes/In-Memory Repositories** en lugar de mocks para simular las bases de datos en los tests unitarios y de integración de la capa de aplicación. Un repositorio en memoria (ej. `InMemoryStockMovementRepository` que implementa `IStockMovementRepository` usando un Array simple) permite validar el comportamiento real del software sin dependencias físicas y sin mocks acoplados.

### 3.3. Aserciones Semánticas y Descriptivas
Los mensajes de expectativa deben documentar claramente qué regla de negocio está en juego. Evitar aserciones genéricas como `expect(result).toBe(true)`. Usar aserciones específicas del dominio:

```typescript
// ✅ Correcto
expect(remanente.status).toBe('EXPIRED');
expect(action).toThrowError("Quantity must be a positive decimal value");

// ❌ Incorrecto
expect(result.ok).toBe(true);
expect(errorOccurred).toBeTruthy();
```

### 3.4. Evitar Identificadores Mágicos y UUIDs Duros (Brittle Tests)
*   **Directiva:** Queda prohibido declarar IDs/UUIDs literales y sin significado semántico en medio de la configuración (`Arrange`) de las pruebas. Esto hace que los tests sean difíciles de leer y propensos a errores tipográficos.
*   **Solución:** Definir constantes declarativas legibles en la cabecera del archivo de prueba o usar variables semánticas explícitas (ej: `const MOCK_INSUMO_ID = 'insumo-queso-mozzarella-123'`).

### 3.5. Mapeo Directo Gherkin-to-Test (`// Given`, `// When`, `// Then`)
*   **Directiva:** Todo archivo de prueba derivado de una Historia de Usuario debe mantener los comentarios estructurados `// Given`, `// When`, `// Then` mapeando los escenarios BDD exactos redactados en la especificación (`US-XXX.md`).

### 3.6. Aserción de Contratos de Error RFC 7807
*   **Directiva:** En las pruebas de integración y controlador para flujos de error, se debe asertar explícitamente la estructura del estándar RFC 7807 (`type`, `title`, `status`, `detail`, `code`).

### 3.7. Clasificación y Etiquetado (`@critical`, `@smoke`, `@edge`)
*   **Directiva:** Las pruebas se etiquetan en el bloque `describe` según su prioridad BDD:
    *   `@critical`: Flujos indispensables de valor (*Happy Path*).
    *   `@smoke`: Verificación rápida de estado y arranque.
    *   `@edge`: Casos límite, concurrencia o condiciones de carrera.

---

## 🔌 4. Ejemplo Canónico (TypeScript Test Blueprint)

A continuación se presenta el molde estándar para pruebas utilizando **Jest** / **Vitest**, ilustrando las directrices anteriores para el registro de extracción de bodega:

### A. Repositorio Fake en Memoria (Evita Mocks)
```typescript
// src/stock/infrastructure/repositories/in-memory-stock-movement.repository.ts
import { IStockMovementRepository } from '../../domain/ports/stock-movement-repository.port';
import { StockMovement } from '../../domain/entities/stock-movement.entity';

export class InMemoryStockMovementRepository implements IStockMovementRepository {
  // Simulación de base de datos en memoria
  public items: StockMovement[] = [];

  public async save(movement: StockMovement): Promise<void> {
    this.items.push(movement);
  }
}
```

### B. Suite de Pruebas del Caso de Uso (TDD Flow)
```typescript
// src/stock/application/use-cases/record-extraction.use-case.spec.ts
import { RecordExtractionUseCase } from './record-extraction.use-case';
import { InMemoryStockMovementRepository } from '../../infrastructure/repositories/in-memory-stock-movement.repository';

// ✅ Constantes semánticas para evitar UUIDs mágicos y duros en el test
const MOCK_INSUMO_ID = 'insumo-uuid-queso-mozzarella';
const MOCK_USER_ID = 'user-uuid-carlos-gomez';

describe('RecordExtractionUseCase (TDD - Bodega)', () => {
  let repository: InMemoryStockMovementRepository;
  let useCase: RecordExtractionUseCase;

  beforeEach(() => {
    // ARRANGE: Instanciar dependencias fakes libres de base de datos física
    repository = new InMemoryStockMovementRepository();
    useCase = new RecordExtractionUseCase(repository);
  });

  it('should successfully record a stock extraction in the database', async () => {
    // ARRANGE
    const input = {
      insumoId: MOCK_INSUMO_ID,
      userId: MOCK_USER_ID,
      quantity: 15.5,
      unit: 'KG'
    };

    // ACT: Ejecución del flujo de negocio
    await useCase.execute(input);

    // ASSERT: Aserción semántica basada en estado, no en llamadas simuladas
    expect(repository.items).toHaveLength(1);
    
    const savedItem = repository.items[0];
    expect(savedItem.props.insumoId).toBe(input.insumoId);
    expect(savedItem.props.userId).toBe(input.userId);
    expect(savedItem.props.quantity).toBe(input.quantity);
    expect(savedItem.props.unit).toBe(input.unit);
    expect(savedItem.props.type).toBe('EXTRACTION');
  });

  it('should prevent extraction if quantity is zero or negative', async () => {
    // ARRANGE
    const input = {
      insumoId: MOCK_INSUMO_ID,
      userId: MOCK_USER_ID,
      quantity: -5.0, // Cantidad inválida
      unit: 'KG'
    };

    // ACT & ASSERT: El caso de uso debe lanzar un error de dominio sin registrar el movimiento
    await expect(useCase.execute(input))
      .rejects
      .toThrowError("Quantity must be a positive decimal value");

    // Verificar que nada fue persistido
    expect(repository.items).toHaveLength(0);
  });
});
```
