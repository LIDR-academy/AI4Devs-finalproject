# 🎨 Reglas de Frontend y UX/UI - Deducción de Especificaciones

Esta directiva rige el desarrollo de la interfaz cliente para terminales táctiles de cocina y backoffice.

---

## 🛠️ Pila Tecnológica Detectada
* **Framework Core:** React / Next.js (TypeScript)
* **Estilos & Diseño:** Vanilla CSS con variables HSL (Industrial Dark Mode + Glassmorphism)
* **Persistencia Offline:** Dexie.js (IndexedDB / Cola FIFO local)
* **Testing UI & QA Visual:** Vitest / React Testing Library / SK-21 a11y Auditor

---

## 📱 1. Ergonomía Táctil y Layout
* **Objetivos Táctiles:** Botones e inputs interactivos deben medir mínimo **48px x 48px** con **8px** de margen alrededor.
* **Tokens de Diseño (Industrial Dark Mode):** Usar variables CSS del tema oscuro HSL de alto contraste definidas en el sistema de diseño.

---

## ♿ 2. Accesibilidad y Legibilidad (WCAG 2.1)
* **Contraste de Texto:** Exigir una relación de contraste mínima de **4.5:1** (Nivel AA) y objetivo **7:1** (Nivel AAA para entornos industriales de cocina).
* **Independencia del Color:** Notificaciones semafóricas (Rojo/Amarillo/Verde) deben ir acompañadas obligatoriamente de texto o íconos descriptivos.

---

## 🛡️ 3. Arquitectura, SOLID y Estados Defensivos
* **Abstracción por Repositorios (DIP):** Componentes React consumen la API mediante interfaces de repositorio (`IRemanenteRepository`), soportando repositorios HTTP o InMemory (Mock).
* **Custom Hooks (SRP):** Encapsular la lógica de estado o colas de eventos en Custom Hooks dedicados.
* **Estados Obligatorios:** Implementar obligatoriamente Skeletons (Loading), Empty State, Error State con reintento, y Banner Offline.
