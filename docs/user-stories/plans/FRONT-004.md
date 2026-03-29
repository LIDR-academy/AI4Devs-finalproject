# Plan de Implementación - FRONT-004: Actualización de Capas en Tiempo Real

Este plan detalla la implementación del sistema de feedback en tiempo real para el procesamiento de capas en el frontend, utilizando WebSockets y Pinia. Cumple con los criterios de aceptación relacionados con la notificación visual de éxito/error sin recargar la página.

## 📋 Fase 1: Configuración de Dependencias y Auth
El cliente Socket.IO debe autenticarse usando el JWT del usuario.

1.  **Mejorar `plugins/socket.client.ts`**:
    - [x] Modificar el plugin para obtener el token desde `useAuthStore` o `useCookie('token')`.
    - [x] Pasar el token en `auth: { token }` al inicializar la conexión.
    - [x] Manejar reconexiones si el token cambia o expira (opcional para MVP, pero recomendado).

## 🔔 Fase 2: Sistema de Notificaciones (Toasts)
Necesitamos un mecanismo para mostrar alertas flotantes al usuario.

1.  **Crear Store de Notificaciones (`stores/toast.ts`)**:
    - [x] Estado: `items: ToastItem[]`. Interfaz: `{ id, type: 'success'|'error', message, duration }`.
    - [x] Acciones: `show(type, message)`, `remove(id)`.
2.  **Crear Componente `UiToast.vue`**:
    - [x] Ubicación: `components/common/UiToast.vue`.
    - [x] Comportamiento: Renderiza la lista de notificaciones del store. Desaparecen automáticamente tras `duration`.
    - [x] Estilos: Usar Tailwind para posicionamiento (ej. bottom-right) y colores.
3.  **Integrar en Layout**:
    - [x] Añadir `<UiToast />` en `layouts/dashboard.vue` (o `app.vue`) para que esté disponible globalmente.

## 🔄 Fase 3: Integración de Eventos Real-time
Conectar los eventos del socket con el estado de la aplicación.

1.  **Actualizar Store de Planes (`stores/plans.ts`)**:
    - [x] Acción `updateLayerStatus(planId, layerId, status, imageUrl?)`:
        - Buscar el plano actual en el estado.
        - Buscar la capa por `layerId`.
        - Actualizar sus propiedades reactivamente.
        - Si el status es `READY`, actualizar `imageUrl` para mostrar la vista previa procesada.
    - [x] Acción `removeLayer(planId, layerId)`: En caso de error fatal que requiera eliminar la capa de la lista (opcional, según UX deseada, si falla se suele dejar marcada como error).

2.  **Crear Composable `composables/useRealtimeLayers.ts`**:
    - [x] Propósito: Encapsular la lógica de suscripción a eventos.
    - [x] Lógica:
        - Obtener instancia `$socket` de Nuxt.
        - `onMounted`: Suscribirse a `layer:processed` y `layer:error`.
        - `onUnmounted`: Desuscribirse (`off`).
        - **Manejo de Eventos**:
            - `layer:processed`:
                - Llamar a `plansStore.updateLayerStatus(..., 'READY', ...)`.
                - Llamar a `toastStore.show('success', 'Capa procesada correctamente')`.
            - `layer:error`:
                - Llamar a `plansStore.updateLayerStatus(..., 'ERROR')`.
                - Llamar a `toastStore.show('error', 'Error al procesar capa: ' + reason)`.

3.  **Integrar en Vista de Detalle (`pages/dashboard/project/[id]/plan/[planId].vue`)**:
    - [x] Usar `useRealtimeLayers()` en el setup del componente.
    - [x] Asegurar que la lista de capas (`v-for`) reaccione a los cambios del store.

## ✅ Validación
1.  **Prueba Manual**:
    - [x] Subir un archivo PDF/Imagen.
    - [x] Verificar que aparece en estado "PROCESSING".
    - [x] Esperar a que el worker termine.
    - [x] Verificar que el estado cambia a "READY" automáticamente.
    - [x] Verificar que aparece el Toast de éxito.
2.  **Prueba de Error**:
    - [ ] Simular un fallo en el backend (o subir archivo corrupto si es posible).
    - [ ] Verificar Toast de error y estado "ERROR" en la lista.

## 🧪 Tests Unitarios
1.  **`stores/toast.spec.ts`**:
    - [x] Verificar que se añaden y eliminan notificaciones.
    - [x] Verificar temporizador (usando fake timers).
2.  **`composables/useRealtimeLayers.spec.ts`**:
    - [x] Mockear socket y store.
    - [x] Simular evento `layer:processed` y verificar llamada al store.
