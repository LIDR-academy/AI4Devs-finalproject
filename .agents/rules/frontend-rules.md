# 🎨 Reglas de Desarrollo Frontend y UX/UI (Tactile Kitchen Client)

Esta regla define los estándares de diseño y desarrollo para las interfaces táctiles de RestoStock utilizadas por los operarios en la cocina.

---

## 📱 1. Interfaz Táctil y Ergonomía (Cocina)
*   **Tamaño de Botones:** Todo elemento interactivo (botones, inputs, selectores) debe tener un área táctil mínima de **48px x 48px** con un espaciado mínimo de **8px** para evitar pulsaciones erróneas en tablets.
*   **Legibilidad:** La tipografía principal debe ser legible a una distancia mínima de **1.5 metros** (tamaño de fuente base mínimo de `16px`, recomendado `18px` o `20px` para títulos e ingredientes).

---

## 🎨 2. Paleta de Colores y Código Semafórico (FEFO)
*   **Alerta Roja (Crítica):** Utilizada para remanentes con **menos de 6 horas** de vida útil restante. Color de contraste llamativo con icono de peligro.
*   **Alerta Amarilla (Advertencia):** Utilizada para remanentes con **entre 6 y 24 horas** de vida útil restante.
*   **Alerta Verde (Segura):** Utilizada para remanentes con **más de 24 horas** de vida útil restante.
*   **Fondo y Contraste:** Modo oscuro por defecto o interfaz de alto contraste para mitigar la fatiga visual bajo la iluminación de la cocina.

---

## 🔌 3. Resiliencia y Estado Offline
*   **Banner Persistente:** Si la conexión a Internet se interrumpe (`navigator.onLine` es falso), el cliente debe mostrar inmediatamente un banner persistente en la parte superior indicando el estado offline.
*   **Persistencia Local:** Los datos táctiles de consumo rápido deben guardarse temporalmente en memoria local (`LocalStorage` o `IndexedDB`) para evitar pérdida de datos del cocinero durante caídas de red, sincronizándose en segundo plano al restablecer la conexión.
