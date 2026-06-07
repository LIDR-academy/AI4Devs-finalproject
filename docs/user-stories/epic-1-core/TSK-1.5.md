# TSK-1.5: Componente UI de Captura de Ticket y Procesamiento Visual (OCR View)

- **Historia de Usuario Relacionada:** [US-01: Escaneo OCR Inteligente de Tickets](US-01.md)
- **Épica:** Epic 1: Core Digitalization & Basic Assignment Flow
- **Capa:** Frontend (UI Component)
- **Complejidad:** 4 SP
- **Dependencias:** TSK-1.1, TSK-1.3, TSK-1.4

## 1. Descripción de la Tarea
Crear la interfaz táctil de captura del ticket. Debe permitir al usuario tomar una foto utilizando la cámara nativa del dispositivo móvil (a través de `<input type="file" accept="image/*" capture="environment">`) o arrastrar un archivo. Mostrará una animación de progreso durante el escaneo y un control de fallback de red.

## 2. Detalles de Implementación
1. **Formulario / Input de Cámara:**
   * Crear `src/components/ocr/TicketScanner.tsx`.
   * Estilizar el botón de captura con diseño premium, simulando el obturador de una cámara, centrado para acceso con el pulgar.
2. **Control de Conectividad:**
   * Implementar hook en `src/hooks/useNetworkStatus.ts` para vigilar `navigator.onLine`.
   * Si no hay conexión, redirigir automáticamente la imagen al flujo local `TesseractService` (TSK-1.3). Si hay conexión, enviar por defecto a la API de Firebase Functions (siempre que la Fase 2 esté activa; en Fase 1, usar Tesseract local por defecto).
3. **Spinner y Pantalla de Carga:**
   * Mostrar un efecto de escaneado lineal animado sobre una miniatura de la imagen cargada y una barra con el porcentaje de progreso (`0-100%`).

## 3. Criterios de Aceptación y Pruebas (DoD)
* Validar que el componente cumple con accesibilidad (WCAG 2.1 AA):
  * Todos los botones táctiles tienen un tamaño de click/touch mínimo de 44x44px.
  * Contraste superior a 4.5:1 para el texto de carga.
  * El elemento `<input>` está oculto visualmente pero asociado correctamente a un `<label>` accesible mediante teclado.
* Test de integración en `src/components/ocr/TicketScanner.test.tsx` que simule la selección de un archivo de imagen y compruebe que se dispara el flujo de procesamiento.
