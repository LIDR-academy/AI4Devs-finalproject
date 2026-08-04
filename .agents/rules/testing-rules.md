# 🧪 Reglas de Pruebas Unitarias y TDD (Testing Rules)

Esta regla define el flujo de calidad y pruebas automatizadas obligatorio para el desarrollo del backend de RestoStock.

---

## 🔄 1. Ciclo de Desarrollo TDD
*   **Prueba Primero (RED):** Antes de implementar cualquier lógica en un caso de uso o entidad, se debe escribir una prueba unitaria que falle (aserción de los requerimientos del ticket).
*   **Implementación Mínima (GREEN):** Escribir el código mínimo necesario para que la prueba pase a estado exitoso.
*   **Limpieza y Diseño (REFACTOR):** Refactorizar el código para mejorar la legibilidad y la estructura, garantizando que todas las pruebas sigan pasando.

---

## 📦 2. Aislamiento y Repositorios Falsos (InMemory Fakes)
*   **Sin Mocks de Base de Datos:** Queda estrictamente prohibido utilizar librerías de simulación complejas para simular a Prisma o la base de datos (evitar `jest.mock('@prisma/client')` o similares).
*   **InMemory Repositories:** Para cada interfaz de repositorio (puerto), se debe implementar un "Fake" en memoria (ej: `InMemoryUserRepository`) que almacene los datos en un array simple en memoria. Esto permite ejecutar pruebas unitarias ultra rápidas (milisegundos) y sin dependencias externas.

---

## 🚦 3. Cobertura y Ejecución
*   **Comandos de Ejecución:** Las pruebas deben poder correrse mediante `pnpm run test` (o `pnpm run test:watch`).
*   **Criterio de Aceptación:** Para dar por terminado un ticket técnico, se debe garantizar que el 100% de las pruebas unitarias y de integración asociadas al slice estén en verde.
