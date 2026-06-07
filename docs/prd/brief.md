# Brief del Producto: SplitEat (Divisor de Cuentas de Restaurantes)

## Visión del Producto
SplitEat es una aplicación móvil diseñada bajo la filosofía **mobile & offline first** para simplificar el proceso de dividir cuentas y tickets de restaurantes en comidas grupales. Permite a los usuarios escanear un ticket físico (mediante foto) o ingresar los consumos para desglosar y asignar lo que cada comensal o subgrupo ("familia") ha consumido, ofreciendo una experiencia rápida y fluida directamente en mesa, sin necesidad obligatoria de registro ni conexión activa a internet para el flujo básico.

## Problema Clave
Cuando grupos numerosos asisten a un restaurante, la división del pago suele convertirse en una tarea caótica:
1. **Pérdida de tiempo y estrés**: Se realizan cálculos manuales complejos en la mesa.
2. **Inconveniencia para el personal del restaurante**: Los camareros pierden tiempo procesando múltiples cobros individuales desorganizados.
3. **Falta de flexibilidad y cobertura**: Las herramientas existentes a menudo obligan a estar online o registrarse, fallando en interiores o sótanos sin cobertura. Tampoco permiten agrupar parejas/familias fácilmente dentro de un ticket común.

## Público Objetivo (Target Audience)
- **Grupos de amigos y compañeros de trabajo**: Personas que comparten almuerzos o cenas de manera frecuente y prefieren pagar exactamente lo que consumieron.
- **Familias y subgrupos**: Parejas o padres con hijos que pagan de forma agrupada dentro de una única cuenta general.

## Métricas de Éxito Comercial
- **Tiempo de Resolución del Pago**: Reducir el tiempo medio necesario para calcular y acordar el pago individual de un grupo de 6+ personas a menos de 90 segundos.
- **Tasa de Completitud del Proceso**: Lograr que el 90% de los escaneos terminen en una cuenta dividida con éxito de forma offline sin requerir reintroducción manual total de los datos.
- **NPS (Net Promoter Score)**: Mantener un NPS superior a 55 entre los usuarios activos.

## Necesidades y Casos de Uso Clave (Filosofía Offline-First)

### 1. Funciones 100% Locales (Sin Cuenta / Sin Conexión)
- **Cálculo y Asignación Interactiva**: Interfaz fluida para arrastrar platos y dividir importes de forma visual, almacenada en memoria local (IndexedDB/localStorage).
- **Detección de Impuestos e IVA**: Identificación automática de subtotales, IVA aplicado, nombre del local y fecha para el desglose.
- **Alerta de Platos Huérfanos**: Notificación visual si quedan platos sin asignar o si el total no cuadra por decimales, ofreciendo auto-ajuste de céntimos.
- **Asignador Rápido de Entrantes**: Selección múltiple de platos comunes (entrantes, bebidas) para dividirlos equitativamente en un solo toque.
- **Gamificación Local ("La Ruleta del Pagador")**: Mini-juego interactivo de azar para decidir quién asume un plato o la propina acumulada de la mesa.
- **Edición Manual de Fallback**: Interfaz optimizada para corregir a mano errores del OCR rápidamente de forma offline.
- **Historial Local Temporal y Backups JSON**: Acceso a las últimas sesiones del navegador y exportación de backups manuales en archivos `.json`.

### 2. Funciones Premium con Registro (Requieren Infraestructura Nube)
- **Bizum QR y Mensajería Dinámica**: Generación automatizada de códigos QR de pago Bizum y plantillas de cobro personalizadas con el teléfono del usuario que requiere API/infraestructura backend.
- **Sincronización Cloud de Amigos y Grupos**: Sincronización en la nube de listas de contactos frecuentes y subgrupos familiares para que estén disponibles multidispositivo.
- **Respaldo e Historial Cloud Completo**: Almacenamiento persistente en la nube de tickets pasados, mapa de visitas a restaurantes (metadatos EXIF) y analíticas privadas de gasto grupal.

## Políticas de Priorización
1. **Prioridad 1 (Core - Offline)**: Escaneo del ticket, asignación visual de ítems, alerta de platos huérfanos, validación matemática de cuadre offline y edición manual de fallback.
2. **Prioridad 2 (Alta - Offline/Online)**: Asignación compartida de platos, visualización clara de redondeos/propinas individuales y registro opcional de usuario.
3. **Prioridad 3 (Media - Registro/Nube)**: Generador de QR Bizum personalizado, sincronización de amigos y grupos frecuentes en la nube, y ruleta del pagador.
4. **Prioridad 4 (Baja - Nube)**: Mapa de visitas geolocalizadas, exportación analítica privada del histórico y backups automáticos en la nube.

## Viabilidad Comercial y Valor Diferencial
SplitEat se enfoca en la **resolución inmediata en tiempo real del pago en mesa**, ofreciendo un desglose optimizado y veloz que se puede dictar directamente al camarero sin fricción. La aplicación es puramente informativa, B2C (para clientes) y mantiene el registro como una capa opcional.

## Excluido del Alcance (Out of Scope)
- **Pasarelas de Pago**: No se integrará procesamiento de cobros nativos (Stripe, Bizum Directo, etc.) en esta versión; el pago se realiza físicamente en mesa.
- **Backend de Restaurante / POS**: Sin sincronización con el terminal del local.

## Restricciones y Aspectos Legales
- **Privacidad y Explotación de Datos**: Procesamiento de imágenes respetuoso con el RGPD. Dado que se extraerán metadatos de la imagen (geolocalización EXIF), la app procesará estos datos localmente de forma anónima, reservando la sincronización en la nube para usuarios registrados de manera consentida y privada.
- **Sin Integración POS Requerida**: La solución debe funcionar de manera 100% independiente del software del restaurante.
- **Acceso a Cámara**: Permisos nativos o de navegador requeridos.
