# 🏗️ Reglas de Codificación del Dominio (Domain Rules)

Esta regla se aplica de forma estricta a todos los archivos ubicados en las carpetas de dominio (`domain/`) del backend. Su objetivo es mantener el corazón del negocio libre de contaminación técnica.

---

## 🚫 1. Independencia Tecnológica Absoluta
*   **Sin Dependencias Externas:** Queda terminantemente prohibido importar librerías de infraestructura como `express`, `@prisma/client`, o adaptadores de bases de datos.
*   **TypeScript Puro:** La capa de dominio debe ser TypeScript puro y compilar sin dependencias de red o persistencia.

---

## 🔢 2. Aritmética y Precisión Física
*   **Uso Mandatorio de `decimal.js`:** Para evitar errores de punto flotante de JavaScript en cantidades físicas, porciones, mermas o inventario, se debe utilizar `Decimal` de la librería `decimal.js`.
*   **Invariantes de Cantidad:** Ninguna cantidad física o de stock puede ser negativa en el dominio. Debe validarse en el constructor del Value Object correspondiente.

---

## 🎯 3. Value Objects y Entidades
*   **Value Objects Inmutables:** Los datos que no poseen identidad y representan medidas o atributos (como un `PIN` de 4 dígitos, un `Email`, o una `DecimalQuantity`) deben modelarse como Value Objects inmutables con métodos de validación internos en su creación.
*   **Entidades con Identidad:** Las entidades (como `ActiveRemanent` o `User`) deben tener un identificador único (generalmente UUID v4) y encapsular los cambios de estado a través de métodos de negocio explícitos (ej: `consume(amount)`, `discard(reason)`), nunca a través de setters directos de propiedades.

---

## ⚠️ 4. Manejo de Errores de Negocio
*   **Excepciones de Dominio:** Los errores de regla de negocio deben lanzarse mediante clases de error personalizadas que hereden de una clase base `DomainError` (ej: `InvalidPinError`, `RemanentExpiredError`).
*   **Sin Códigos HTTP:** Los errores del dominio no deben contener códigos de estado HTTP ni detalles de transporte.
