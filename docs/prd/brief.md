# Brief del Producto: SplitEat (Divisor de Cuentas de Restaurantes)

## Visión del Producto
SplitEat es una aplicación diseñada para simplificar el proceso de dividir cuentas y tickets de restaurantes en comidas grupales. Permite a los usuarios escanear un ticket físico (mediante foto) o ingresar los consumos (a través de texto/voz) para desglosar y asignar fácilmente lo que cada comensal o "familia" ha consumido, reduciendo el estrés tanto para los clientes como para los camareros al momento de pagar.

## Problema Clave
Cuando grupos numerosos asisten a un restaurante, la división del pago suele convertirse en una tarea caótica:
1. **Pérdida de tiempo y estrés**: Se realizan cálculos manuales complejos, a menudo inexactos.
2. **Inconveniencia para el personal del restaurante**: Los camareros pierden tiempo procesando múltiples cobros desorganizados o desglosando manualmente cuentas largas.
3. **Falta de flexibilidad**: Las herramientas existentes a menudo no contemplan que subgrupos (ej. parejas, familias) asuman partes consolidadas de la cuenta común, ni facilitan la selección intuitiva y visual de items compartidos.

## Público Objetivo (Target Audience)
- **Grupos de amigos y compañeros de trabajo**: Personas que comparten almuerzos o cenas de manera frecuente y prefieren pagar exactamente lo que consumieron.
- **Familias y subgrupos**: Grupos de comensales donde ciertas personas (por ejemplo, parejas o padres con hijos) pagan de forma agrupada pero dentro de una única cuenta general.

## Métricas de Éxito Comercial
- **Tiempo de Resolución del Pago**: Reducir el tiempo medio necesario para calcular y acordar el pago individual de un grupo de 6+ personas a menos de 90 segundos.
- **Tasa de Completitud del Proceso**: Lograr que el 90% de los escaneos terminen en una cuenta dividida con éxito sin requerir reintroducción manual total de los datos.
- **NPS (Net Promoter Score)**: Mantener un NPS superior a 55 entre los usuarios activos.

## Necesidades y Casos de Uso Clave (Enfoque en Problemas del Usuario)
1. **Captura Inteligente y Rápida**:
   - El usuario debe poder digitalizar la información del ticket físico (foto) o dictar/escribir lo consumido.
   - Identificación automática de conceptos, cantidades, precio unitario, IVA aplicado, nombre del establecimiento, propinas y día del evento.
   - Extracción de metadatos de la imagen subida (modelo de teléfono, tipo de cámara, geoposicionamiento/coordenadas GPS de la toma) para enriquecer el contexto del evento.
2. **Asignación Intuitiva y Flexible**:
   - Visualización clara de los elementos del ticket para que puedan ser seleccionados y arrastrados/asignados a personas individuales o grupos/familias.
   - Posibilidad de asignar un mismo plato a varias personas (por ejemplo, entrantes compartidos) dividiendo automáticamente su coste.
3. **Agrupación Flexible (Familias/Grupos)**:
   - Crear subgrupos de pago para simplificar la cuenta de aquellos que pagan juntos (ej. "Familia Gómez" o "Pareja A").
4. **Desglose de Pago Inmediato e Interactivo**:
   - Visualización final simplificada que muestre exactamente cuánto debe pagar cada persona o subgrupo, lista para ser mostrada al camarero o compartida.
   - **Modo "Dictado al Camarero"**: Agrupación visual de los productos consumidos por persona/familia para facilitar el dictado directo y secuencial al camarero durante el cobro individual.
   - **Cuadre de Totales estricto**: Al permitir la división de platos (entrantes compartidos), el sistema debe asegurar matemáticamente que la suma de todas las asignaciones individuales cuadre de forma exacta con el total del ticket.
   - **Visualización del Redondeo**: Mostrar visualmente de forma clara el importe del redondeo aplicado a cada comensal de manera individual y el importe acumulado del redondeo total (que se destinará a propina).

## Políticas de Priorización
1. **Prioridad 1 (Core)**: Digitalización del ticket (OCR), detección de líneas de ticket (cantidad, concepto, precio), asignación básica a personas individuales, validación de cuadre con el total del ticket y alerta de platos huérfanos.
2. **Prioridad 2 (Alta)**: Creación de subgrupos ("familias"), asignación compartida de platos con validación matemática, visualización clara del redondeo individual/total y asignador rápido de entrantes comunes.
3. **Prioridad 3 (Media)**: Entrada por voz/texto, Modo "Dictado al Camarero" y mecánicas de gamificación en mesa ("Ruleta del Pagador").
4. **Prioridad 4 (Baja)**: Exportación de analíticas locales y desglose en formato de texto legible para WhatsApp.

## Viabilidad Comercial y Valor Diferencial
A diferencia de calculadoras tradicionales o apps de finanzas compartidas (como Splitwise, que se enfocan en deudas a largo plazo), SplitEat se enfoca en la **resolución inmediata en tiempo real del pago en mesa**, ofreciendo un desglose optimizado y veloz que se puede dictar directamente al camarero sin fricción. 
*Nota importante*: Esta aplicación es de naturaleza **informativa** y está orientada **exclusivamente a clientes y grupos de comensales** (B2C). No está diseñada para el sector de la hostelería (restauradores/camareros) ni requiere integración con sistemas del local.

## Excluido del Alcance (Out of Scope)
- **Pasarelas de Pago**: No se integrarán pasarelas de pago ni cobros integrados (Stripe, Bizum, etc.) en esta versión; el pago se realiza a través de los medios habituales directamente al camarero.
- **Backend de Restaurante / POS**: Sin sincronización con el sistema del punto de venta del restaurante.

## Restricciones y Aspectos Legales
- **Privacidad y Explotación de Datos**: Procesamiento de imágenes respetuoso con el RGPD. La información extraída y los metadatos (como geolocalización y consumo) se mantendrán estrictamente privados dentro de la aplicación, sin compartirse de manera pública, con el fin estratégico de explotar analíticas y datos estadísticos internos de forma agregada para el usuario. Las fotos de los tickets no deben almacenar datos personales de los usuarios ni métodos de pago sensibles en servidores externos sin consentimiento previo.
- **Sin Integración POS Requerida**: La solución debe funcionar de manera 100% independiente del software del restaurante, operando exclusivamente del lado del cliente.
- **Acceso a Cámara y Micrófono**: Requerirá permisos nativos o de navegador para capturar fotos y entrada de voz.

## Integraciones y Dependencias
- **Servicio OCR / LLM para extracción**: Integración con APIs de visión y procesamiento de lenguaje para estructurar el contenido de los tickets digitalizados.
