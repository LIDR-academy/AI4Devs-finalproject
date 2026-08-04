# 🎨 Reglas de Desarrollo Frontend y UX/UI (Tactile Kitchen Client)

Esta regla define los estándares visuales, de diseño táctil, comportamiento de modales y resiliencia offline para la interfaz de usuario de RestoStock.

---

## 🎨 1. Temas y Paleta de Colores (Industrial Dark Mode)
Para garantizar la legibilidad en condiciones de luz variables y fatiga operativa, se debe utilizar el tema oscuro inspirado en la referencia de tablero táctil de alto contraste.

### Variables CSS (Design Tokens):
```css
:root {
  /* Fondos */
  --bg-main: hsl(222, 47%, 7%);        /* Fondo de pantalla ultra oscuro */
  --bg-card: hsl(223, 33%, 12%);       /* Fondo de tarjetas y paneles */
  --bg-overlay: rgba(10, 15, 30, 0.85); /* Fondo de modales y veladuras */

  /* Colores de Acento y Estado */
  --accent-teal: hsl(174, 100%, 39%);  /* Color primario (acciones, gráficos) */
  --accent-blue: hsl(217, 91%, 60%);  /* Enlaces y elementos secundarios */
  --accent-red: hsl(0, 84%, 60%);     /* Alertas críticas (< 6h) y descartes */
  --accent-yellow: hsl(38, 92%, 50%);  /* Advertencias (6h a 24h) y offline */
  --accent-green: hsl(142, 71%, 45%);  /* Estado seguro (>= 24h) y éxitos */

  /* Texto */
  --text-primary: hsl(0, 0%, 100%);    /* Valores grandes, títulos y botones */
  --text-secondary: hsl(215, 15%, 70%);/* Etiquetas y textos secundarios */
  
  /* Bordes y Sombras */
  --border-card: 1px solid hsl(220, 20%, 20%);
  --radius-card: 12px;
  --radius-button: 8px;
}
```

---

## 📱 2. Ergonomía Táctil y Layout
*   **Zona Táctil Activa:** Todo botón, selector o input interactivo debe medir un mínimo de **48px x 48px** con un margen mínimo de **8px** a su alrededor para evitar errores táctiles con manos mojadas o con guantes.
*   **Legibilidad a 1.5 Metros:** El tamaño de fuente base de los ingredientes en el panel principal debe ser de al menos **18px / 20px** en negrita.
*   **Estructura de Tarjetas (Cards):**
    *   Bordes redondeados a `12px` y borde fino de separación (`--border-card`).
    *   **Cabeceras Consistentes:** Un icono circular pequeño en color `--accent-teal` en la esquina superior izquierda, seguido del título descriptivo al lado en `--text-primary`.

---

## 🕹️ 3. Feedback Visual e Interacciones (Micro-animaciones)
*   **Efecto de Presión (:active):** Los botones táctiles deben reducir su escala ligeramente a `transform: scale(0.97)` al ser presionados, dando respuesta inmediata al tacto.
*   **Transición Estándar:** Todos los cambios de estado (`hover`, `focus`, `active`) deben utilizar una transición suave de **0.2 segundos** (`transition: all 0.2s ease-in-out`).

---

## 🪟 4. Ventanas Emergentes y Mensajes (Modales & Toasts)
*   **Modal de Descarte (`US-005`):**
    *   Opciones grandes para motivos: *Vencido*, *Contaminado*, *Caída/Derrame*, *Fallo de Frío*.
    *   Botón de confirmación destructiva en `--accent-red`.
*   **Modal de Consumo Parcial (`US-004`):**
    *   Muestra el stock actual y calcula dinámicamente en pantalla el remanente futuro restante en tiempo real antes de enviar la confirmación.
*   **Modal de Receta (`US-007`):**
    *   Desglose de ingredientes. Si hay stock insuficiente de algún ingrediente, este se mostrará en color `--accent-red` y se deshabilitará el botón de confirmación.
*   **Diálogos de Confirmación:** Los procesos críticos como el Cierre de Turno (`US-008`) deben mostrar un diálogo modal de pantalla completa requiriendo el PIN de confirmación del Chef.
*   **Toasts de Feedback Rápido:** Notificaciones flotantes que desaparecen a los 3 segundos en verde (Éxito) o cian (Sincronización).

---

## 🔌 5. Resiliencia y Estado Offline
*   **Banner Superior Persistente:** En cuanto el navegador pierda conexión (`navigator.onLine === false`), un banner de ancho completo con color `--accent-yellow` y texto en `--text-primary` debe aparecer arriba de todo.
*   **Persistencia Local:** Los datos de consumo y descarte deben almacenarse temporalmente en `LocalStorage` o `IndexedDB` y sincronizarse automáticamente al detectar la reconexión.
