# 🏗️ Reglas del Dominio (Domain Rules) - Deducción de Especificaciones

Esta directiva rige la implementación de las entidades, Value Objects y excepciones del núcleo de negocio en `domain/`, deducidas del PRD, las especificaciones de arquitectura y las habilidades del proyecto.

---

## 🛠️ Pila Tecnológica Detectada
* **Core & Paradigma:** TypeScript Puro (Clean Architecture / Hexagonal / SOLID)
* **Precisión Matemática:** `decimal.js` (Mandatorio para toda cantidad física, peso, porción o remanente)
* **Aislamiento Absoluto:** Cero dependencias externas (Sin Prisma, Sin Express, Sin I/O)

---

## 🚫 1. Pureza Tecnológica y Aislamiento
* **TypeScript Puro:** La capa de dominio debe ser TypeScript puro y compilar sin dependencias de red, frameworks web (Express) u ORM (Prisma).
* **Cero Inyecciones de Infraestructura:** Las entidades y Value Objects no pueden importar clientes de base de datos ni librerías externas de transporte HTTP.

---

## 🔢 2. Aritmética e Invariantes de Negocio
* **Uso de `decimal.js`:** Toda cantidad física, porción, merma o peso en inventario debe utilizar la librería `decimal.js` para prevenir errores de coma flotante IEEE 754.
* **Invariantes de Cantidad:** Ninguna cantidad de stock o remanente puede ser negativa. Debe validarse en el constructor del Value Object o Entidad.

---

## 🎯 3. Value Objects y Entidades
* **Value Objects Inmutables:** Los datos sin identidad propia (ej. `PIN`, `Email`, `DecimalQuantity`) deben ser Value Objects inmutables con métodos internos de validación.
* **Entidades con Identidad:** Las entidades deben poseer identificador único (UUID v4) y encapsular mutaciones de estado mediante métodos de negocio explícitos (ej. `consume()`, `discard()`), no setters directos.

---

## ⚠️ 4. Manejo de Errores de Negocio
* **Excepciones de Dominio:** Los errores de regla de negocio deben derivarse de una clase base `DomainError` (ej. `InvalidPinError`, `RemanentExpiredError`).
* **Aislamiento de Transporte:** Los errores de dominio no deben contener estados HTTP o detalles de infraestructura.

---

## 📐 5. Aplicación Estricta de Principios SOLID
* **Single Responsibility (SRP):** Cada entidad o caso de uso encapsula una única responsabilidad de negocio.
* **Dependency Inversion (DIP):** El dominio define las interfaces de acceso a datos (Puertos), la infraestructura las implementa (Adapters).
* **Interface Segregation (ISP):** Puertos pequeños y específicos por módulo (`IUserRepository`, `IStockMovementRepository`), evitando interfaces monolíticas.
* **Liskov Substitution (LSP):** Los repositorios en memoria (`InMemory Fakes`) e infraestructura (`Prisma Repositories`) son 100% intercambiables en los casos de uso.
