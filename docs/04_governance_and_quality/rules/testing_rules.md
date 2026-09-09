# 🧪 Decálogo y Herramientas Avanzadas de Testing & TDD (AI4Devs 2026)

Esta directiva rige las pruebas automatizadas de **RestoStock** y el control de calidad agéntico, integrando las 10 Buenas Prácticas de Testing y el modelo dual Greenfield (TDD) vs Legacy (Caracterización).

---

## 🔄 Dualidad de Modos de Operación en `.agents/`

1. **🟢 Modo Greenfield (App / Código Desde Cero — `SK-16`):**
   * **Estrategia:** Strict TDD (Spec-First).
   * **Flujo:** Spec BDD Gherkin $\rightarrow$ Test en **ROJO (RED)** comprobado en consola $\rightarrow$ Código Mínimo **VERDE (GREEN)** $\rightarrow$ Refactor.
   * **Objetivo:** Construir software nuevo con cero deuda técnica.

2. **🟡 Modo Legacy / Brownfield (Código Existente a Refactorizar — `SK-24` & `SK-25`):**
   * **Estrategia:** Characterization Testing (Michael Feathers) & Contract Diff Audit.
   * **Flujo:** Código Legacy $\rightarrow$ Auditoría de Contrato `SK-25` $\rightarrow$ Suite `@characterization` en **VERDE (GREEN)** $\rightarrow$ Refactorización Hexagonal.
   * **Objetivo:** Congelar y documentar el comportamiento actual para refactorizar con cero regresiones.

3. **🔁 Workflow Interactivo QA (`06_full_qa_pipeline.md`):**
   * Pipeline interactivo en 3 pasos con pausas de confirmación humana (HitL Gates):  
     **Paso 1: Análisis de Riesgo** $\rightarrow$ **Paso 2: Diseño de Tests** $\rightarrow$ **Paso 3: TDD & Stryker Mutation Score $\ge 70\%$**.

---

## 🛠️ Pila Tecnológica y Arquitectura de Pruebas
* **Runner de Pruebas:** Vitest (Nativo ESM/TypeScript con Vite)
* **Mutation Testing:** `@stryker-mutator/core` (Mutation Score $\ge 70\%$ obligatorio; referencia Meta FSE 2024: 100% coverage con 4% mutation score es rechazado por tautológico)
* **Property-Based Testing:** `fast-check` (Pruebas estocásticas de invariantes de dominio y validadores Zod)
* **E2E & Accessibility:** Playwright con `@playwright/mcp` (Pruebas de UI táctil $\ge 48\text{px}$ sobre el árbol de accesibilidad WCAG 2.1 AAA)
* **Testing Trophy (Kent C. Dodds):** Static (TS/ESLint) $\rightarrow$ Integration (Vitest/MSW/Supertest) $\rightarrow$ Unit (Lógica pura) $\rightarrow$ E2E (Playwright)
* **Patrón Mocks Frontera:** `InMemoryRepository` (Domain) / MSW (Frontend HTTP) / Supertest (Backend HTTP) / Testcontainers (Postgres efímero)

---

## 📋 Decálogo de Reglas Innegociables de Testing

### 1. Convención Naming BDD / 3 Partes
* Nombres explicativos centrados en el comportamiento observable: `<unidad>_<escenario>_<resultadoEsperado>` o estilo BDD `describe` + `it` (`it('should return empty string when input is empty')`).

### 2. Patrón AAA / Given-When-Then (Un Test = Un Comportamiento)
* Todos los tests deben dividirse explícitamente en 3 bloques: `// Given` (Arrange), `// When` (Act), `// Then` (Assert).
* **Regla:** Un solo bloque `Act` por test. Si hay múltiples llamadas secuenciales, dividir en varios tests.

### 3. Parametrización de Tests (`test.each` & `fast-check`)
* Evitar duplicación de estructura. Usar `test.each` para matrices de casos de prueba y `fast-check` para invariantes (ej. verificar que `DecimalQuantity` o los validadores Zod nunca acepten valores nulos/negativos para cualquier `number/string` generado).

### 4. Aserciones Ricas y Mensajes Descriptivos
* Incluir etiquetas descriptivas en aserciones complejas: `expect(result, label).toBe(expected)`.
* Preferir matchers ricos (`toHaveLength`, `toMatchObject`, `toThrow(RFC7807Error)`) sobre comparaciones booleanas genéricas `toBe(true)`.
* **Aserciones de Clase CSS con Scope Obligatorio (Discovered in `TK-079-FE`):** Prohibido usar `document.querySelector('.clase')` (o `screen`/`container` sin acotar) para verificar la presencia de una clase CSS cuando esa clase puede repetirse en múltiples elementos hermanos (ej. varias `.card-dashboard` compartiendo `.card-badge-icon--danger`/`--success`). La aserción DEBE acotarse primero al contenedor específico bajo prueba (`elemento.closest('.card-dashboard')` o `within(container)`) antes de buscar la clase — de lo contrario el test puede pasar en falso al matchear un elemento no relacionado que siempre porta esa clase, en vez de verificar el elemento realmente bajo prueba.

### 5. Descubrimiento de Edge Cases con IA (Contexto de Negocio Humano)
* Usar la IA para explorar casos límite de formato (Unicode, caracteres de escape, nulos).
* **Regla:** Las reglas de negocio excepcionales (ej: prohibición de duplicidad de aperturas o saldos negativos) son responsabilidad humana y deben ser supervisadas en la especificación.

### 6. Mockea en las Fronteras, NO en las Entrañas
* Mocks únicamente en los bordes arquitectónicos (llamadas HTTP salientes, BD, servicios cloud).
* Usar **InMemory Fakes** para casos de uso y repositorios, **Supertest** para endpoints Express y **MSW** para el cliente React. Prohibido sobre-mockear el código interno.

### 7. Inversión por Valor: Testing Trophy
* **Static First:** TypeScript estricto + ESLint + Prettier eliminan una categoría entera de bugs.
* **Integración (Vitest + MSW + Supertest):** Es donde se obtiene el mayor retorno de inversión y confianza.

### 8. Cobertura Real vs Meta FSE 2024 (Stryker Score $\ge 70\%$)
* Cita FSE 2024: Cobertura de 100% de líneas con assertions vacías/tautológicas da solo 4% de mutation score.
* El objetivo obligatorio es **Mutation Score ($\ge 70\%$)** sobre la capa de dominio y casos de uso. Excluir DTOs y barrel files.

### 9. Tests como Contrato y Catalizador (TDD DORA 2025)
* Conforme al estudio **DORA 2025 de Google**, el ciclo TDD en 7 Pasos amplifica los beneficios de la IA. El test visto fallar (RED) en consola rige el criterio de salida objetivo.

### 10. Subagentes Especializados de Pruebas (`05_test_runner_workflow` y `06_full_qa_pipeline`)
* En ejecuciones complejas, se invoca el subagente `.agents/workflows/05_test_runner_workflow.md` (TDD Greenfield) o el workflow interactivo `.agents/workflows/06_full_qa_pipeline.md` (QA Pipeline) para controlar el bucle con pausas de confirmación humana.
