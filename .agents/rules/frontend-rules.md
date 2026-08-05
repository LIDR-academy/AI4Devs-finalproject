# 🎨 Reglas de Desarrollo Frontend y UX/UI (Tactile Kitchen Client)

Esta regla define los estándares visuales, de diseño táctil, comportamiento de modales, arquitectura de desacoplamiento e integración, y la estrategia de resiliencia offline para la interfaz de usuario de RestoStock.

---

## 🎨 1. Temas y Paleta de Colores (Industrial Dark Mode)
Para garantizar la legibilidad en condiciones de luz variables y fatiga operativa en cocina, se debe utilizar el tema oscuro de alto contraste.

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
*   **Zona Táctil Activa:** Todo botón, selector o input interactivo debe medir un mínimo de **48px x 48px** con un margen mínimo de **8px** a su alrededor para evitar errores táctiles con manos húmedas o con guantes.
*   **Legibilidad a 1.5 Metros:** El tamaño de fuente base de los ingredientes en el panel principal debe ser de al menos **18px / 20px** en negrita.
*   **Estructura de Tarjetas (Cards):**
    *   Bordes redondeados a `12px` y borde fino de separación (`--border-card`).
    *   **Cabeceras Consistentes:** Un icono circular pequeño en color `--accent-teal` en la esquina superior izquierda, seguido del título descriptivo al lado en `--text-primary`.

---

## 🕹️ 3. Feedback Visual e Interacciones (Micro-animaciones)
*   **Efecto de Presión (:active):** Los botones táctiles deben reducir su escala ligeramente a `transform: scale(0.97)` al ser presionados, dando respuesta inmediata al tacto.
*   **Transición Estándar:** Todos los cambios de estado (`hover`, `focus`, `active`) deben utilizar una transición suave de **0.2 segundos** (`transition: all 0.2s ease-in-out`).

---

## 🏗️ 4. Arquitectura del Frontend (Ports & Adapters)
Para garantizar el desacoplamiento de la infraestructura de red y facilitar el desarrollo offline/mock:
*   **Aislamiento de la UI:** Ningún componente visual de React debe usar `fetch`, `axios` o URLs de endpoints de backend directamente.
*   **Uso de Repositorios:** La comunicación con la API debe estar mediada por interfaces (puertos) como `IRemanenteRepository`.
*   **Inyección de Dependencias:** El componente debe consumir el puerto inyectado, permitiendo alternar dinámicamente entre `HttpRemanenteRepository` y `InMemoryRemanenteRepository` (Mock/Offline) según el estado de conexión del sistema.

---

## ⚡ 5. Actualizaciones de UI Optimistas (Optimistic UI)
*   **Comportamiento:** Al registrar consumos o descartes rápidos, la UI debe actualizar inmediatamente el stock restante en pantalla asumiendo éxito en la operación.
*   **Manejo de Rollbacks:** La petición HTTP se procesa en segundo plano. Si el servidor devuelve un error o la conexión falla definitivamente, el estado de la UI debe revertirse suavemente y se debe disparar una alerta flotante (Toast) informando el fallo del registro.

---

## 🛡️ 6. Estados Defensivos Obligatorios
Toda vista interactiva debe implementar obligatoriamente los siguientes cuatro estados:
1.  **Loading State (Skeletons):** Contenedores animados con la misma forma y tamaño físico que los botones/datos finales para evitar saltos bruscos en el layout.
2.  **Empty State:** Pantalla limpia e informativa en caso de que no existan datos (ej. sin alertas en ese instante).
3.  **Error State:** Interfaz de recuperación amigable con un botón táctil claro para reintentar la llamada de red fallida.
4.  **Offline State:** Banner superior persistente `--accent-yellow` que deshabilita visualmente los controles que requieren conexión síncrona en tiempo real con el servidor de base de datos.

---

## 🔌 7. Resiliencia y Estado Offline
*   **Banner Superior Persistente:** En cuanto el navegador pierda conexión (`navigator.onLine === false`), un banner de ancho completo con color `--accent-yellow` y texto en `--text-primary` debe aparecer arriba de todo.
*   **Persistencia Local y Sincronización:** Los datos de consumo y descarte deben almacenarse temporalmente en `LocalStorage` o `IndexedDB` y sincronizarse automáticamente al detectar la reconexión de red de forma secuencial (FIFO).
*   **Ciclo de Actualización del Service Worker:** Al detectar actualizaciones del bundle de frontend, mostrar un toast interactivo que pregunte al operario antes de aplicar la recarga (no forzar recargas bruscas durante la preparación activa de platos).

---

## 🧪 8. Estrategia de Testing en Frontend
*   **Simulación de Fallos de Red:** Utilizar Mock Service Worker (MSW) para inyectar errores de red (`500`, `503`, offline) y validar la respuesta visual de los componentes.
*   **Zona Horaria e Integridad:** Todas las pruebas de visualización del temporizador FEFO deben validar la coherencia temporal frente a diferencias horarias de huso horario del cliente respecto del servidor UTC.

---

## 👁️ 9. Protocolo de Aseguramiento de Calidad Visual (Visual QA)
Para evitar "diseños ciegos" o comportamientos inesperados en las interfaces, todo desarrollo de frontend debe regirse por los siguientes controles interactivos:

1.  **Fase de Mockup Previo (Opcional pero Recomendado):**
    *   Antes de codificar interfaces complejas (ej. wizards de conciliación, paneles semafóricos), el agente debe proponer y generar un mockup visual en imagen usando la herramienta `generate_image`.
    *   Este mockup servirá para acordar la distribución espacial y la concordancia de la paleta HSL con el Specialist antes de tocar el código.
2.  **Verificación Visual Automatizada:**
    *   Una vez terminada la codificación del componente, el agente debe levantar el servidor local (`npm run dev`) y usar el subagente de navegación (`browser_subagent`) para renderizar y validar la página.
    *   **Lista de Chequeo de Visual QA:**
        *   **Objetivos táctiles:** Verificar que los botones e inputs tengan el tamaño adecuado (≥48px) y no se solapen.
        *   **Contraste e Industrial Dark Mode:** Validar que los textos tengan suficiente contraste sobre los fondos oscuros.
        *   **Estabilidad del Layout (CLS):** Asegurar la ausencia de saltos bruscos al cargar skeletons de loading.
        *   **Comportamiento Responsivo:** Probar el comportamiento visual de la terminal táctil en la resolución de destino del restaurante (Tablet en modo horizontal, resolución recomendada de 1024x768).

---

## 🖼️ 10. Procesamiento de Insumos Visuales del Usuario (User Mockups & References)
Cuando el Specialist proporcione un boceto, dibujo, captura de pantalla o diseño en imagen (ej: guardado en `docs/01_product_definition/assets/` o similar):

1.  **Inspección Obligatoria:** El agente debe abrir y analizar la imagen utilizando la herramienta `view_file` para extraer:
    *   La distribución espacial (layout) de las tarjetas, botones y formularios.
    *   Los campos de entrada requeridos y los elementos informativos (labels, contadores).
    *   Los flujos de interacción sugeridos visualmente.
2.  **Adaptación de Diseño (Fidelidad de Tokens):**
    *   La estructura visual de la imagen debe respetarse en su distribución general, pero **debe adaptarse obligatoriamente** a los tokens de diseño de RestoStock (colores HSL del modo oscuro industrial, bordes `radius-card` de 12px y botones interactivos táctiles ≥48px con margen de 8px).
    *   El agente no debe replicar colores, fuentes o estilos externos que violen el sistema de tokens establecido en la Sección 1.


