# Sistema de Notificaciones - Documentación

## Configuración General

- **Gestor de paquetes**: yarn (no npm)
- **Librería de notificaciones**: Notivue v2.4.5
- **Comandos importantes**:
  - `yarn dev`: Iniciar servidor de desarrollo
  - `yarn add [paquete]`: Instalar nuevas dependencias

## Componentes Principales

### 1. Notification.vue
Componente personalizado para renderizar notificaciones con estilo Material Design.

**Características**:
- Validación robusta para prevenir errores con `item` undefined
- Propiedades computadas para acceso seguro a los datos
- Soporte para contenido HTML
- Estilos adaptados a Material Design

### 2. notivue.client.ts
Plugin que configura Notivue y expone la interfaz de notificaciones.

**Características**:
- Configuración centralizada de Notivue
- Funciones seguras para personalizar mensajes
- Obtención del nombre de usuario desde localStorage
- Prevención de errores de redefinición de propiedades

### 3. NotivueWrapper.vue
Componente wrapper para renderizar notificaciones solo en el cliente.

**Características**:
- Renderizado condicional para evitar errores de hidratación
- Soporte para gestos de deslizamiento con NotivueSwipe
- Aplicación del tema Material Design

## Problemas Resueltos

1. **Error de acceso a propiedades de `item` undefined**
   - Se implementó validación con `isValidItem` y propiedades computadas

2. **Error "Cannot redefine property: $toast"**
   - Se eliminó la duplicación en la definición del proveedor toast
   - Se mantuvo solo `nuxtApp.provide('toast', toast)` y se comentó el método alternativo

3. **Errores de hidratación en SSR**
   - Se implementó renderizado condicional con `v-if="isClient"`

4. **Inconsistencia en la interfaz ToastInterface**
   - Se actualizó la firma de los métodos para usar `(message, options)` en lugar de `(title, message)`

## Uso del Sistema de Notificaciones

```typescript
// Desde un componente Vue
const toast = useToast();
toast.success('Operación completada');
toast.error('Ha ocurrido un error');
toast.info('Información importante');
toast.warning('Advertencia');
toast.clear(); // Limpiar todas las notificaciones
```

## Personalización de Mensajes

El sistema personaliza automáticamente los mensajes de bienvenida añadiendo el nombre del usuario si está disponible en localStorage.
