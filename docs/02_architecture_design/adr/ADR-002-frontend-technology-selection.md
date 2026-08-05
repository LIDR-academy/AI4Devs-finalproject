# ADR-002: Selección de Framework Frontend, Estilos y Estrategia de Resiliencia Offline

- **ID:** ADR-002
- **Título:** Selección de Framework Frontend, Estilos y Estrategia de Resiliencia Offline
- **Estado:** Approved
- **Fecha:** 2026-08-05
- **Autor:** Antigravity (AI Pair Programmer)

---

## 1. Contexto (Context)

Para completar el MVP de RestoStock, se requiere el desarrollo del cliente frontend de cocina (**Tactile Kitchen Client**). Este cliente está orientado a ser operado desde una tablet táctil instalada en la cocina del restaurante, y sus responsabilidades clave incluyen:
1. Visualización interactiva en tiempo real del feed semafórico de alertas críticas y advertencias de vencimiento de remanentes (FEFO).
2. Operación de consumos parciales, recetas y registros de descarte mediante una interfaz táctil ergonómica y de alta legibilidad.
3. Resiliencia total ante desconexiones de red, permitiendo a los operarios seguir registrando consumos y descartes de forma local, encolándolos en almacenamiento offline y sincronizándolos automáticamente al recuperar la conexión.

Dado que la tablet operará en un entorno físico de cocina propenso a interrupciones de red inalámbrica, necesitamos seleccionar un stack técnico y una estrategia de persistencia offline optimizados para una SPA (Single Page Application) resiliente.

---

## 2. Decisión (Decision)

Se propone el siguiente stack de frontend y arquitectura técnica:

### 1. Framework Base: Vite + React + TypeScript
* **Decisión:** Usar **Vite** para estructurar una Single Page Application (SPA) pura, en lugar de frameworks orientados a servidor como Next.js.
* **Justificación:** 
  * La aplicación es una pantalla de control/dashboard que corre localmente en una tablet cliente. No requiere SEO ni Server-Side Rendering (SSR).
  * Vite produce un *bundle* estático ligero que puede ser cacheado al 100% en el cliente, permitiendo que la aplicación se cargue instantáneamente incluso si no hay conexión de internet al encender el dispositivo.
  * TypeScript garantiza la consistencia de tipos compartidos con los contratos DTO del backend.

### 2. Estilos: Vanilla CSS con Diseño HSL Variable (Industrial Dark Mode)
* **Decisión:** Diseñar la interfaz utilizando **Vanilla CSS puro** y CSS Custom Properties (Design Tokens), evitando frameworks de utilidades como Tailwind CSS o librerías pesadas de componentes.
* **Justificación:**
  * Cumple estrictamente con la guía del stack del proyecto ("Vanilla CSS para máxima flexibilidad y control").
  * Permite un control preciso de la ergonomía táctil (botones interactivos de mínimo `48px x 48px`, márgenes de seguridad de `8px`).
  * Estructuración del tema semafórico con variables HSL (fondos oscuros contrastantes, semáforos rojo/amarillo/verde de alta visibilidad).

### 3. Almacenamiento Local y Resiliencia: IndexedDB (vía Dexie.js)
* **Decisión:** Implementar una cola de transacciones locales utilizando **IndexedDB** a través de la librería ligera **Dexie.js**, complementada con un Service Worker.
* **Justificación:**
  * A diferencia de `LocalStorage` (que tiene un límite estricto de 5MB y es síncrono, bloqueando el hilo principal), `IndexedDB` es asíncrono y ofrece capacidad de almacenamiento prácticamente ilimitada para encolar transacciones físicas sin degradar la UI.
  * Dexie.js proporciona una API limpia con soporte para promesas y tipado TypeScript, reduciendo el código boilerplate de IndexedDB.
  * Un Service Worker cacheará el bundle del cliente para habilitar el acceso al software 100% offline.

### 4. Estrategia de Testing y Mocking: Vitest + Testing Library + MSW (Mock Service Worker)
* **Decisión:** Utilizar **Mock Service Worker (MSW)** para interceptar y simular llamadas de red HTTP en las pruebas y el desarrollo local.
* **Justificación:**
  * MSW intercepta peticiones a nivel del navegador, lo que permite alternar dinámicamente entre el modo online (peticiones reales al backend) y el modo offline (simulando errores de conexión `503` o fallos de red) sin alterar el código de la aplicación.
  * Nos permite cumplir el flujo de desarrollo TDD escribiendo pruebas unitarias y de comportamiento en React para el banner offline y la sincronización de la cola.

---

## 3. Consecuencias (Consequences)

- **Pros (Beneficios):**
  * **Carga Instantánea y 100% Offline:** El cliente puede iniciarse y operar completamente aislado del servidor de base de datos gracias al Service Worker y a la persistencia local.
  * **Rendimiento UI Fluido:** El uso de IndexedDB asíncrono y la ausencia de frameworks pesados garantizan que la pantalla táctil responda instantáneamente a los toques (:active scale 0.97).
  * **Cero Dependencia de Terceros para el Diseño:** Vanilla CSS garantiza consistencia total con los tokens de diseño táctiles sin acoplar el proyecto a frameworks CSS externos propensos a cambiar de versión.

- **Contras (Compromisos):**
  * **Esfuerzo de Sincronización:** Se debe diseñar una lógica robusta de reconciliación en segundo plano que procese la cola local en orden cronológico estricto (FIFO) para evitar conflictos al recuperar la red.
