# 🧪 Reglas de Testing y TDD - Deducción de Especificaciones

Esta directiva rige las pruebas automatizadas del proyecto.

---

## 🛠️ Pila Tecnológica Detectada
* **Runner de Pruebas:** Vitest / Jest
* **Metodología:** TDD Estricto (Red-Green-Refactor)
* **Patrón de Prueba:** InMemory Fake Repositories (Sin Mocks pesados de BD)
* **HTTP Supertest:** Pruebas de integración para controllers Express

---

## 🔄 1. Ciclo TDD (Test-Driven Development)
* **Prueba Primero (RED):** Escribir una prueba fallida antes de codificar la lógica del caso de uso.
* **Implementación Mínima (GREEN):** Escribir el código strictly necesario para pasar el test.
* **Limpieza (REFACTOR):** Refactorizar manteniendo los tests en verde y cumpliendo con SOLID.

---

## 📦 2. Repositorios Falsos (InMemory Fakes & LSP)
* **Sin Mocks Frágiles de ORM:** Usar clases `InMemoryRepository` que implementen los puertos del dominio almacenando objetos en arrays en memoria.
* **Principios de Sustitución:** El mismo test de caso de uso debe poder correr contra `InMemoryRepository` o un contenedor efímero de PostgreSQL de forma 100% transparente.
