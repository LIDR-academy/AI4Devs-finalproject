# 🎨 Reglas de Frontend y UX/UI - Deducción de Especificaciones

Esta directiva rige el desarrollo de la interfaz cliente para terminales táctiles de cocina y backoffice.

---

## 🛠️ Pila Tecnológica Detectada
* **Framework Core:** React / Next.js (TypeScript)
* **Estilos & Sistema de Diseño:** Vanilla CSS con variables HSL centralizadas en `index.css` y exportadas al estándar de raíz [`/DESIGN.md`](../../../DESIGN.md) (Google Labs Spec v1.0.0, auditado con `npx -y @google/design.md lint DESIGN.md`).
* **Persistencia Offline:** Dexie.js (IndexedDB / Cola FIFO local)
* **Testing UI & QA Visual:** Vitest / React Testing Library / SK-21 a11y Auditor

---

## 📱 1. Ergonomía Táctil y Layout
* **Objetivos Táctiles:** Botones e inputs interactivos deben medir mínimo **48px x 48px** con **8px** de margen alrededor. Teclado de PIN: **64px x 64px**.
* **Tokens de Diseño (Dark Petrol Dashboard):** Usar variables CSS del tema oscuro HSL con encabezados de tarjeta con badge circular turquesa a la izquierda y separador de 1px.

---

## ♿ 2. Accesibilidad y Legibilidad (WCAG 2.1)
* **Contraste de Texto:** Exigir una relación de contraste mínima de **4.5:1** (Nivel AA) y objetivo **7:1** (Nivel AAA para entornos industriales de cocina).
* **Independencia del Color:** Notificaciones semafóricas (Rojo/Amarillo/Verde) deben ir acompañadas obligatoriamente de texto o íconos descriptivos.

---

## 🛡️ 3. Arquitectura, SOLID y Estados Defensivos
* **Abstracción por Repositorios (DIP):** Componentes React consumen la API mediante interfaces de repositorio (`IRemanenteRepository`), soportando repositorios HTTP o InMemory (Mock).
* **Custom Hooks (SRP):** Encapsular la lógica de estado o colas de eventos en Custom Hooks dedicados.
* **Estados Obligatorios:** Implementar obligatoriamente Skeletons (Loading), Empty State, Error State con reintento, y Banner Offline.
* **Capa de Reutilización Cross-Cutting (`src/shared/`):** Todo módulo usado por 2+ features vive en `src/shared/`, nunca duplicado dentro de `features/*`. Subcarpetas establecidas:
  - `shared/http/apiClient.ts`: cliente HTTP único (`apiRequest<T>`), maneja el Bearer token y errores (`ApiError`). Ningún servicio de `features/*/services/` debe llamar `fetch()` directamente.
  - `shared/domain/`: Value Objects de dominio compartidos entre features (ej. `DecimalQuantity` para aritmética de cantidades, ver sección 4).
  - `shared/hooks/`: hooks transversales sin relación con un dominio de feature específico (ej. `useOnlineStatus`).
  - `shared/components/`: primitivos de UI reutilizados por 2+ pantallas (ej. `Modal`, `ModalHeader`, `ModalFooterActions`, `ErrorBanner`).
  - Antes de implementar un ticket que necesite HTTP, aritmética decimal, un hook transversal o un primitivo de UI, se debe verificar si ya existe en `shared/` antes de escribir una nueva copia (ver `SK-17` Fase 2, paso 4).

---

## 🔢 4. Formateo y Aritmética de Cantidades
* **Prohibición de `parseFloat` en Cálculos de Inventario:** Queda estrictamente prohibido realizar operaciones aritméticas de punto flotante nativo (`parseFloat`, `+`, `-`, `*`, `/`) en servicios o componentes para modificar cantidades o stocks. Se deben utilizar librerías de precisión arbitraria (`decimal.js`) o manipulaciones de cadenas exactas.
* **Formateador Inteligente (`formatQuantity`):** Los componentes de UI deben usar obligatoriamente helpers de formateo para renderizar valores numéricos.
* **Insumos Contables:** Para unidades discretas (`UNITS`, `UNIDADES`, `PZA`), mostrar enteros simples en español (ej. `12 Ud.`) evitando ceros decimales que se confundan con separadores de miles (`12.000`).
* **Botones Adaptativos:** Adaptar los decrementos rápidos según la unidad (`-1`, `-2`, `-5` para `UNITS` frente a `-0.25`, `-0.5`, `-1.0` para `KG`/`L`).

---

## 🚨 5. Manejo Activo de Errores en Servicios
* **Prohibición de Excepciones Tragadas (*No Swallowed Catches*):** Queda estrictamente prohibido incluir bloques `catch {}` vacíos en servicios o componentes. Todo fallo de comunicación HTTP debe ser registrado con `console.error` o notificado a la interfaz del usuario.

