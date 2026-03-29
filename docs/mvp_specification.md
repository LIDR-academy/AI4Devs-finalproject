# Especificación del MVP: Plataforma de Colaboración de Planos "TRACÉ"

## 1. Descripción del Producto
**TRACÉ** es una plataforma SaaS web diseñada para centralizar la comunicación visual entre arquitectos/interioristas y sus clientes. Actúa como un visor colaborativo que reemplaza el intercambio de correos y PDFs, permitiendo la revisión de propuestas mediante superposición de imágenes y comentarios contextuales sobre el plano.

## 2. Branding e Identidad Visual
- **Nombre:** TRACÉ
- **Concepto:** Evoca el "trazado" arquitectónico, la precisión y la elegancia del papel cebolla sobre los planos técnicos.
- **Estilo:** Editorial moderna, tipografía limpia, minimalismo premium.
- **Paleta de Colores:**
    - **Principal:** Negro Tinta (#000000) - Elegancia y contraste.
    - **Acento:** Amarillo Ocre "Papel Cebolla" (#F2E8C9) - Calidez y referencia al material clásico.
    - **Secundario:** Gris Cemento (#95A5A6) - Neutralidad estructural.

## 3. Objetivo
Eliminar la fricción y los errores de interpretación en la fase de diseño. Crear una "Fuente Única de Verdad" donde la última versión del plano sea siempre la vigente, y el feedback del cliente esté ordenado, localizado y trazable.

## 4. Modelo de Negocio: Freemium por "Slots Activos"
- **Estrategia:** Suscripción mensual basada en capacidad.
- **Plan Free:** Limitado a X proyectos "activos" simultáneos (ej. 3 slots). Para crear uno nuevo, se debe archivar o borrar uno existente.
- **Plan Pro:** Slots ilimitados (o ampliados) y acceso histórico completo.

## 5. Funcionalidades Core (MVP)

### 4.1. Gestión de Proyectos y Accesos
- **Roles:**
    - **Arquitecto (Admin):** CRUD de proyectos, subida de archivos, gestión de versiones, invitación a clientes, resolución de comentarios.
    - **Cliente (Guest):** Acceso simplificado mediante enlace/invitación. Solo visualización y creación de comentarios.
- **Dashboard:** Listado visual de proyectos activos con indicadores de estado (ej: "3 comentarios pendientes").

### 4.2. Visor Interactivo y Capas (La funcionalidad clave)
- **Soporte de Archivos:** Imágenes (JPG/PNG) y PDF (convertidos a imagen para visualización).
- **Navegación:** Zoom y Panning fluido. Soporte para gestos táctiles (Thinking in Tablet-First para reuniones de obra).
- **Modo Comparativo (Capas):**
    - Capacidad de cargar una "Imagen Base" (ej. Estado actual).
    - Capacidad de cargar una "Imagen Superior" (ej. Propuesta).
    - **Slider de Opacidad:** Control deslizante que permite al usuario variar la transparencia de la capa superior para visualizar las diferencias con la base.

### 4.3. Comunicación Contextual ("Pin & Comment")
- **Pines:** Clic en cualquier coordenada del plano para abrir un hilo de discusión.
- **Hilos:** Chat lineal asociado al pin.
- **Adjuntos:** El cliente puede subir una foto de referencia en el comentario.
- **Estados:**
    - *Pendiente:* El pin es visible y requiere atención.
    - *Resuelto:* El arquitecto marca el pin como solucionado y este se oculta/tenúa para limpiar la visualización.

### 4.4. Control de Versiones Simple
- Carga de nuevas versiones de un mismo plano.
- La versión más reciente se muestra por defecto.
- Selector para viajar al "pasado" y ver versiones antiguas (solo lectura) para auditar cambios.

## 5. Restricciones y Definiciones Técnicas
- **Dispositivos:** Web App Responsive (Desktop + Tablet optimizado).
- **Alineación:** Se asume que el arquitecto sube las imágenes de las capas con el mismo encuadre/resolución (sin herramientas de alineación manual en MVP).
