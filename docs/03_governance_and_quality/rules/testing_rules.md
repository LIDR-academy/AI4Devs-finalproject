# 🧪 Reglas de Testing, TDD y Mutation Testing - Deducción de Especificaciones

Esta directiva rige las pruebas automatizadas del proyecto y el control de calidad antirredundancia.

---

## 🛠️ Pila Tecnológica Detectada
* **Runner de Pruebas:** Vitest / Jest
* **Mutation Testing:** `@stryker-mutator/core` (Exigencia mínima del 70% de Mutation Score)
* **Metodología:** TDD Estricto (Red-Green-Refactor)
* **Patrón de Prueba:** InMemory Fake Repositories (Sin Mocks pesados de BD)
* **HTTP Supertest:** Pruebas de integración para controllers Express

---

## 🔄 1. Ciclo TDD (Test-Driven Development)
* **Prueba Primero (RED):** Escribir una prueba fallida antes de codificar la lógica del caso de uso.
* **Implementación Mínima (GREEN):** Escribir el código estrictamente necesario para pasar el test.
* **Limpieza (REFACTOR):** Refactorizar manteniendo los tests en verde y cumpliendo con SOLID.

---

## 🧬 2. Pruebas de Mutación (Anti-Tautología de Cobertura)
* **Mutation Score $\ge 70\%$:** No basta con tener un 100% de cobertura de líneas. Se debe ejecutar `@stryker-mutator/core` sobre la capa de dominio y casos de uso.
* **Eliminación de Mutantes:** Las pruebas unitarias deben fallar si se introduce un mutante en el código (ej. cambiar `>` por `>=`, invertir booleanos, alterar retornos). Si el mutante sobrevive, la prueba es tautológica y se considera defectuosa.

---

## 📦 3. Repositorios Falsos (InMemory Fakes & LSP)
* **Sin Mocks Frágiles de ORM:** Usar clases `InMemoryRepository` que implementen los puertos del dominio almacenando objetos en arrays en memoria.
* **Principios de Sustitución:** El mismo test de caso de uso debe poder correr contra `InMemoryRepository` o un contenedor efímero de PostgreSQL de forma 100% transparente.
