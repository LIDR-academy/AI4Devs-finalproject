# PRD — Plataforma de división de gastos con OCR e itemización

## 1. Resumen del producto

Este documento define los requisitos de producto para un MVP de una plataforma mobile-first de división de gastos orientada inicialmente al mercado español. El núcleo del producto es la digitalización de tickets de hostelería mediante captura con cámara y extracción ítem por ítem con OCR/IA para permitir asignaciones precisas entre personas o subgrupos, con una experiencia de uso rápida, gratuita y sin registro obligatorio en la fase inicial [cite:11][cite:20].

La decisión estratégica es construir primero un producto de utilidad B2C con fricción mínima y orientar la captura de valor futura hacia un modelo freemium y B2B/SaaS, dejando la monetización de datos agregados como línea secundaria y no como dependencia principal del negocio. Esta orientación reduce riesgo regulatorio y mejora la defendibilidad comercial del producto frente a un enfoque centrado exclusivamente en la venta de datos [cite:22][cite:27][cite:28].

## 2. Objetivo del documento

El PRD está diseñado para uso interno de producto y desarrollo, con suficiente nivel de detalle para servir como base de diseño funcional, priorización técnica y validación de alcance. También incorpora una visión de escalabilidad futura para ordenar decisiones que, aunque no formen parte del MVP, condicionan arquitectura, consentimiento, almacenamiento y modelo de cuenta [cite:61][cite:64].

## 3. Problema

En grupos de amigos que comparten consumos de hostelería, el pago de la cuenta genera fricción por tres razones principales: reparto desigual de ítems, complejidad al calcular importes individuales y tiempo invertido en acordar quién debe cuánto. Las soluciones actuales resuelven razonablemente el reparto simple, pero la itemización desde ticket escaneado está limitada, no siempre está disponible en todos los competidores y, cuando existe, suele estar asociada a planes de pago [cite:11][cite:13][cite:15][cite:18].

El problema prioritario no es mover dinero, sino calcular de forma rápida y fiable una deuda justa entre varias personas. Por ello, el MVP no incluirá pagos integrados y se posicionará como una calculadora avanzada de deudas con capacidad de escanear tickets reales de restauración [cite:11][cite:17].

## 4. Contexto de mercado

La restauración en España muestra suficiente volumen y dinamismo como para justificar un producto especializado en tickets de hostelería; el sector facturó cerca de 100.000 millones de euros en 2023, con crecimiento interanual del 9,2 por ciento frente a 2022, según CaixaBank Research [cite:23]. Además, existen agentes públicos y privados que analizan consumo extradoméstico, lo que confirma que el dato de restauración y ocio tiene utilidad analítica real, aunque no resuelve por sí mismo la viabilidad de vender microdatos procedentes de usuarios finales [cite:23][cite:26][cite:29].

## 5. Usuario objetivo

### 5.1 Segmento prioritario

El primer segmento objetivo son grupos de amigos que comparten tickets de hostelería en bares, restaurantes, terrazas o contextos similares. Se prioriza este segmento porque combina alta frecuencia de uso potencial, dolor claro en el reparto itemizado y un contexto de uso móvil en el momento del pago.

### 5.2 Segmentos secundarios

- Parejas y convivientes con gastos puntuales compartidos.
- Grupos de viaje.
- Eventos informales y celebraciones.
- Pisos compartidos, aunque este caso encaja mejor en fases posteriores por necesitar historial y recurrencia.

### 5.3 Jobs to Be Done

- “Cuando llega la cuenta en grupo, quiero repartir exactamente lo que consumió cada persona para evitar discusiones y perder el mínimo tiempo posible.”
- “Cuando pago yo una cuenta grande, quiero saber al instante cuánto me debe cada uno.”
- “Cuando no quiero crearme una cuenta ni instalar nada complejo, quiero resolver el reparto en el momento desde el móvil.”

## 6. Propuesta de valor

La propuesta de valor del MVP es permitir que un usuario capture un ticket de hostelería desde el móvil, obtenga una lista editable de ítems y asigne esos conceptos a personas o grupos para calcular automáticamente el saldo final de cada participante. El producto debe ser notablemente más rápido y justo que el reparto manual, con una experiencia anónima y sin fricción de registro [cite:11][cite:20].

## 7. Principios de producto

- Velocidad antes que complejidad.
- Sin registro obligatorio en primera interacción.
- Mobile-first y optimizado para uso con una mano.
- Control manual siempre disponible cuando el OCR falle.
- Transparencia del cálculo.
- Privacidad por defecto.
- Arquitectura preparada para migrar de modo anónimo a modo con cuenta.

## 8. Diferencias de PRD según objetivo

Cuando un PRD se orienta solo a desarrollo interno, el foco principal está en alcance, requisitos, flujos, dependencias y criterios de aceptación. Cuando también debe servir para socios o validación estratégica, conviene ampliar secciones de oportunidad, posicionamiento, riesgos regulatorios, competencia, supuestos de negocio y roadmap [cite:61][cite:64][cite:67].

En este caso, el documento abarca ambas necesidades: define el producto con precisión operativa, pero también incluye decisiones de negocio, riesgos legales, restricciones tecnológicas y visión futura de escalabilidad. Eso hace que el PRD sea más útil para tomar decisiones ahora y evita rehacer fundamentos cuando el producto evolucione.

## 9. Alcance MVP

### 9.1 Incluido en MVP

- Webapp responsive, mobile-first.
- Acceso a cámara del navegador para capturar tickets, sujeto a contexto seguro y permisos del usuario [cite:63][cite:69].
- Posibilidad de adjuntar imagen desde galería.
- OCR/IA para extraer texto e intentar estructurar ítems, cantidades y precios.
- Revisión y edición manual del ticket.
- Creación rápida de participantes sin cuenta.
- Asignación de ítems a personas o subgrupos.
- Reparto proporcional o compartido de productos cuando aplique.
- Cálculo final de balances y resumen de quién debe cuánto a quién.
- Persistencia local en navegador para sesiones recientes.
- Exportación e importación local de datos del usuario para futura migración.

### 9.2 Fuera de alcance en MVP

- Integraciones de pago como Bizum, tarjeta o PSD2.
- Registro obligatorio.
- Sincronización cloud entre dispositivos.
- Perfiles persistentes avanzados.
- Históricos avanzados multiusuario.
- Programa de fidelización o cupones.
- Venta operativa de datos o paneles B2B desde el día uno.
- Automatizaciones contables o fiscales.

## 10. Plataforma y restricciones técnicas

La plataforma inicial será una webapp responsive optimizada para móvil, con especial atención a navegadores móviles modernos. El acceso a cámara mediante `mediaDevices` y a ubicación mediante Geolocation requiere contexto seguro, normalmente HTTPS o localhost en entornos de prueba, y consentimiento explícito del usuario para permisos sensibles [cite:63][cite:66][cite:69].

La elección de webapp sobre nativa reduce coste inicial, acelera validación y mantiene suficiente acceso a capacidades clave del dispositivo para el caso de uso principal. La UX debe asumir posibles rechazos de permisos y ofrecer rutas alternativas, como subida de imagen desde galería y uso sin geolocalización [cite:63][cite:69].

## 11. Gestión de identidad y datos locales

El producto priorizará uso sin registro para maximizar velocidad de entrada. Los datos de sesiones recientes podrán mantenerse localmente en el navegador para permitir continuidad mínima, con capacidad futura de importar ese estado a una cuenta registrada [cite:68][cite:62][cite:65].

La persistencia local es útil para rapidez, pero no debe considerarse fuente definitiva ni garantía de disponibilidad entre dispositivos. El PRD debe contemplar desde el inicio un esquema de exportación e importación en JSON con validaciones básicas, timestamps y compatibilidad de versiones para facilitar migración posterior a cuenta [cite:62][cite:65].

## 12. Funcionalidades clave

### 12.1 Captura de ticket

El usuario puede abrir la cámara o seleccionar una imagen ya tomada. La interfaz debe guiar sobre encuadre, iluminación y legibilidad del ticket para mejorar precisión OCR.

### 12.2 Extracción OCR e itemización

El sistema procesa la imagen y devuelve una lista estructurada de líneas del ticket. Dado que el OCR no será perfecto, cada resultado debe presentarse como sugerencia editable, no como verdad cerrada [cite:31][cite:32][cite:33].

### 12.3 Edición manual

El usuario podrá corregir nombres de productos, importes, cantidades y errores de segmentación. Esta capa es obligatoria porque la precisión real en tickets de hostelería depende de calidad de foto, formato del comercio y complejidad del recibo.

### 12.4 Creación de participantes

El usuario añade participantes con nombre libre o alias temporal. No se requerirá cuenta ni validación externa.

### 12.5 Asignación de ítems

Cada ítem puede asignarse a una persona, varias personas o a todo el grupo. Debe existir reparto equitativo automático y edición fina cuando varios consumieron el mismo concepto.

### 12.6 Cálculo de balances

El sistema genera un resumen final con total por persona y deudas netas. La lógica debe minimizar transacciones innecesarias y mostrar con claridad quién paga a quién.

### 12.7 Persistencia local y recuperación

La app guardará los últimos tickets y divisiones recientes en el dispositivo del usuario para reabrir una sesión si la cierra accidentalmente. El usuario podrá borrar todo el estado local desde ajustes.

### 12.8 Exportación e importación

El usuario podrá exportar sus datos locales a archivo y reimportarlos posteriormente. Esta función sirve como puente hacia futuras cuentas y como mecanismo de backup local [cite:62][cite:65].

## 13. Historias de usuario prioritarias

- Como pagador de una cuenta grupal, quiero escanear un ticket y repartir productos por persona para saber al instante cuánto me debe cada uno.
- Como participante, quiero ver con claridad qué ítems se me han asignado antes de aceptar el reparto.
- Como usuario sin cuenta, quiero usar la app en menos de un minuto desde abrirla.
- Como usuario, quiero corregir errores del ticket sin volver a empezar.
- Como usuario recurrente, quiero conservar divisiones recientes en mi navegador para reutilizarlas más tarde.
- Como futuro usuario registrado, quiero importar mis tickets locales al crear una cuenta.

## 14. Flujos principales

### 14.1 Flujo A — reparto rápido desde ticket

1. Abrir la webapp.
2. Elegir “Escanear ticket”.
3. Conceder permiso de cámara o subir foto.
4. Capturar o seleccionar imagen.
5. Procesamiento OCR.
6. Revisar líneas detectadas.
7. Añadir participantes.
8. Asignar ítems.
9. Confirmar reparto.
10. Ver balances finales.
11. Compartir resumen o conservarlo localmente.

### 14.2 Flujo B — corrección manual

1. El OCR detecta líneas erróneas o incompletas.
2. El usuario edita campos clave.
3. Recalcula el resultado.
4. Guarda o comparte.

### 14.3 Flujo C — recuperación local

1. El usuario vuelve a la app.
2. La app detecta sesiones recientes locales.
3. El usuario reabre una división anterior o la elimina.

### 14.4 Flujo D — migración futura a cuenta

1. El usuario decide registrarse en una fase posterior.
2. Se le propone importar sus datos locales.
3. El sistema valida formato, conflictos y duplicados.
4. La cuenta conserva historial previo.

## 15. Requisitos funcionales

### 15.1 Requisitos de experiencia inicial

- RF-01: La app debe poder utilizarse sin registro obligatorio.
- RF-02: La landing inicial debe permitir iniciar un reparto en un máximo de una acción principal visible.
- RF-03: La app debe funcionar correctamente en navegador móvil moderno.

### 15.2 Requisitos de captura

- RF-04: La app debe solicitar permiso de cámara solo cuando el usuario inicie el escaneo [cite:63].
- RF-05: La app debe ofrecer alternativa de subida desde galería si no hay permiso o no hay cámara disponible.
- RF-06: La app debe informar al usuario de cómo tomar mejor la foto.

### 15.3 Requisitos de OCR

- RF-07: El sistema debe extraer texto del ticket y proponer una estructura de ítems.
- RF-08: El sistema debe identificar, siempre que sea posible, descripción, cantidad, precio unitario y total por línea.
- RF-09: El sistema debe permitir marcar confianza baja o líneas dudosas para revisión manual.
- RF-10: El sistema debe recalcular importes en tiempo real tras edición.

### 15.4 Requisitos de reparto

- RF-11: El usuario debe poder añadir, renombrar y eliminar participantes.
- RF-12: El usuario debe poder asignar cada ítem a una o varias personas.
- RF-13: El sistema debe soportar reparto equitativo entre varios participantes.
- RF-14: El sistema debe mostrar total individual y saldo neto.

### 15.5 Requisitos de persistencia

- RF-15: La app debe guardar localmente sesiones recientes del usuario.
- RF-16: La app debe permitir borrar datos locales.
- RF-17: La app debe permitir exportar el estado local en formato legible por la aplicación [cite:62][cite:65].
- RF-18: La app debe permitir importar un archivo válido y restaurar sesiones [cite:62].

### 15.6 Requisitos de compartición

- RF-19: La app debe generar un resumen claro y compartible del reparto.
- RF-20: El resumen debe mostrar cuánto debe cada persona y a quién.

## 16. Requisitos no funcionales

### 16.1 Rendimiento

- RNF-01: El tiempo hasta poder iniciar un escaneo debe ser mínimo en móvil.
- RNF-02: El procesamiento debe devolver un primer resultado en tiempo percibido razonable para no romper el momento de uso.
- RNF-03: La app debe degradar con elegancia ante conexiones lentas.

### 16.2 Usabilidad

- RNF-04: La interfaz debe ser mobile-first y usable con una mano.
- RNF-05: El número de pasos visibles debe ser el mínimo posible.
- RNF-06: El usuario debe entender siempre el estado del cálculo.

### 16.3 Privacidad y seguridad

- RNF-07: La app debe aplicar minimización de datos desde diseño.
- RNF-08: No se debe exigir crear cuenta para el caso de uso principal.
- RNF-09: El consentimiento para cualquier uso secundario de datos deberá estar separado del uso funcional principal, ser claro y revocable [cite:24][cite:30].
- RNF-10: Los permisos de cámara y ubicación deben ser just-in-time y explicados al usuario [cite:66][cite:69].

### 16.4 Fiabilidad

- RNF-11: El producto debe seguir siendo utilizable aunque el OCR falle parcialmente, gracias a edición manual.
- RNF-12: El producto no debe depender de una sola ruta crítica sin alternativa.

## 17. Consideraciones tecnológicas

Las opciones tecnológicas para OCR incluyen OCR de imagen clásico y extracción estructurada adicional mediante modelos multimodales o parsers posteriores. Google Cloud Vision y AWS Textract ofrecen costes relativamente bajos para OCR/document processing en volúmenes iniciales, mientras que el uso de modelos multimodales por tokens puede elevar el coste por ticket si se emplean de forma intensiva [cite:32][cite:33][cite:37][cite:40].

Para el MVP, la arquitectura recomendada es híbrida: OCR base barato, heurísticas específicas para tickets y un fallback más costoso solo para casos de baja confianza. Este enfoque mejora la sostenibilidad económica en ausencia de ingresos directos del usuario y protege el margen de aprendizaje durante validación [cite:32][cite:33].

## 18. Modelo de negocio reflejado en producto

El producto se diseña inicialmente como utilidad gratuita para acelerar adopción. La monetización prioritaria futura será freemium B2C y B2B/SaaS, dejando los datos agregados y anonimizados como línea secundaria [cite:45][cite:49][cite:52].

Esto implica que el PRD debe preparar, pero no activar en MVP, componentes como cuenta, historial persistente, exportaciones avanzadas, equipos, API y paneles. También implica que no debe condicionarse la experiencia principal a la recolección agresiva de datos de usuario.

## 19. Riesgos legales y de cumplimiento

Los datos verdaderamente anonimizados quedan fuera del ámbito del RGPD, pero los datos seudonimizados siguen considerándose datos personales si existe posibilidad razonable de reidentificación [cite:27][cite:28]. Por tanto, cualquier estrategia futura de analítica comercial debe diseñarse con fuerte disciplina de anonimización, agregación y evaluación de riesgo, especialmente en entornos hiperlocales donde combinaciones de fecha, local, importe y grupo pueden aumentar la identificabilidad [cite:22][cite:25][cite:27].

Si se plantean finalidades secundarias de monetización de datos, el consentimiento debe ser específico, informado, inequívoco y separado del servicio principal. Un uso anónimo y sin registro no elimina por sí mismo las obligaciones si la información tratada puede vincularse a personas físicas de forma directa o indirecta [cite:24][cite:30][cite:27].

## 20. Riesgos de producto

- Precisión insuficiente en tickets complejos o de baja calidad.
- Fricción si el OCR tarda demasiado.
- Desconfianza del usuario si el cálculo no es transparente.
- Limitaciones de almacenamiento local o pérdida de datos del navegador [cite:62][cite:68].
- Baja recurrencia si el caso de uso se percibe como ocasional.
- Dependencia de proveedor OCR con coste variable.
- Confusión legal si se comunica mal el uso futuro de datos.

## 21. Supuestos críticos a validar

- Los grupos de amigos aceptan usar una webapp sin descarga para repartir cuentas en mesa.
- El ahorro de tiempo frente a repartir manualmente compensa abrir cámara y revisar ítems.
- La precisión del OCR más corrección manual produce una experiencia netamente mejor que un reparto manual o por porcentajes.
- El uso sin registro mejora la conversión inicial.
- Una parte de los usuarios aceptará registrarse más adelante si eso aporta valor tangible.

## 22. Métricas de éxito

### 22.1 North Star inicial

- Número de tickets completados con reparto finalizado.

### 22.2 Métricas de activación

- Ratio de usuarios que pasan de abrir la app a iniciar escaneo.
- Ratio de tickets escaneados que llegan a resultado final.
- Tiempo medio desde apertura hasta balance final.

### 22.3 Métricas de calidad de producto

- Porcentaje de líneas del ticket corregidas manualmente.
- Tasa de abandono durante revisión OCR.
- Precisión percibida por el usuario.

### 22.4 Métricas de retención temprana

- Usuarios que vuelven a usar la app en 30 días.
- Reapertura de sesiones locales guardadas.
- Exportaciones e importaciones realizadas.

### 22.5 Métricas de negocio futuro

- Conversión de usuario anónimo a cuenta registrada.
- Conversión a funciones premium.
- Leads B2B cualificados.

## 23. Dependencias

- Proveedor de OCR/visión.
- Infraestructura backend mínima para procesamiento, si no se ejecuta enteramente del lado servidor controlado.
- Asesoría legal RGPD/LOPDGDD antes de activar cualquier uso secundario de datos [cite:27][cite:28].
- Diseño UX mobile-first.

## 24. Roadmap por fases

### Fase 0 — Validación MVP

Objetivo: comprobar que la gente usa la app para dividir tickets reales de hostelería y que la combinación OCR + edición manual aporta valor.

Capacidades:
- escaneo,
- corrección,
- participantes,
- reparto,
- balances,
- almacenamiento local básico.

### Fase 1 — Retención ligera

Objetivo: mejorar recurrencia sin romper el modelo sin registro.

Capacidades:
- histórico local mejorado,
- exportación/importación,
- recuperación de grupos frecuentes,
- compartir resultados,
- mejoras de precisión por feedback.

### Fase 2 — Cuenta opcional

Objetivo: introducir registro por valor añadido, no por obligación.

Capacidades:
- sincronización entre dispositivos,
- importación de datos locales,
- historial persistente,
- preferencias,
- grupos guardados.

### Fase 3 — Premium B2C

Objetivo: capturar valor de usuarios intensivos.

Capacidades:
- históricos avanzados,
- exportaciones avanzadas,
- estadísticas,
- reglas automáticas,
- categorías,
- multimoneda,
- OCR prioritario o de mayor calidad.

### Fase 4 — B2B/SaaS

Objetivo: monetización más robusta y menos dependiente del consumidor final.

Capacidades:
- API/SDK de itemización,
- white-label,
- paneles agregados,
- acuerdos con restauración, travel, fintech o research, siempre bajo marco jurídico adecuado [cite:23][cite:29][cite:27].

## 25. Decisiones abiertas

- Nivel de detalle que se mostrará de impuestos, propinas y suplementos del ticket.
- Política exacta de geolocalización: opcional, puntual y con qué propósito concreto [cite:69].
- Estrategia técnica final de OCR híbrido.
- Límite de sesiones almacenadas localmente.
- Formato exacto del resumen compartible.
- Umbral de calidad mínimo para considerar un ticket “procesado correctamente”.

## 26. Criterios de aceptación del MVP

El MVP se considerará listo para validación si permite completar el flujo principal de un ticket de hostelería real desde móvil, sin registro, con captura de imagen, revisión editable, asignación por persona y cálculo final claro. También debe funcionar en contexto seguro para permisos sensibles y ofrecer persistencia local básica con opción de exportación/importación futura [cite:63][cite:66][cite:69][cite:62].

## 27. Recomendación ejecutiva

La recomendación es desarrollar este producto como webapp B2C de alta velocidad de uso, con foco exclusivo en resolver el reparto itemizado de tickets de hostelería para grupos de amigos. El diseño del producto debe preservar el anonimato funcional en la primera experiencia, incorporar persistencia local con futura migración a cuenta y mantener la monetización de datos como opción secundaria, no estructural, debido a su mayor complejidad regulatoria y comercial [cite:22][cite:27][cite:28][cite:32][cite:33].
