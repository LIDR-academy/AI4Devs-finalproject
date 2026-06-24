# 3. Personas de Usuario

> [Volver al Índice PRD](../PRD.md) | [Anterior: Declaración del Problema](02-problem-opportunity.md) | [Siguiente: Visión y Estrategia](04-vision-strategy.md)

---

## 3.1 Persona 1: María y Juan — La Pareja (Host)

| Atributo | Detalle |
|-----------|--------|
| **Edad** | 29 y 31 |
| **Ubicación** | Madrid, España |
| **Ocupación** | María: Marketing Manager; Juan: Software Engineer |
| **Habilidad Tecnológica** | Alta — ambos usan smartphones diariamente, cómodos con SaaS |
| **Presupuesto de Boda** | 28.000 EUR |
| **Número de Invitados** | 120 |

### Trabajos a Realizar (Jobs-to-be-Done)
1. *"Ayúdanos a crear invitaciones hermosas sin contratar a un diseñador"*
2. *"Permítenos hacer seguimiento de quién viene para poder organizar los asientos y el catering"*
3. *"Mantén a nuestros invitados informados el día de la boda sin que nosotros tengamos que gestionarlo"*
4. *"Ahorrar dinero en comparación con las invitaciones de papel"*

### Puntos de Dolor (Pain Points)
- Las invitaciones de papel cuestan 800-1.200 EUR para 120 invitados (diseño + impresión + franqueo)
- El seguimiento de RSVPs vía WhatsApp/teléfono es caótico y propenso a errores
- Los invitados preguntan constantemente por las indicaciones del lugar y los detalles del horario
- La pareja quiere disfrutar de su día, no gestionar la logística

### Criterios de Éxito
- Invitaciones diseñadas y enviadas en menos de 2 horas
- Todos los RSVPs rastreados en un solo dashboard
- Cero preguntas de los invitados sobre logística el día de la boda
- Coste total por debajo de 50 EUR (frente a 1.000+ EUR por papel)
- Los invitados se sienten emocionados e informados durante toda la experiencia

### Historias de Usuario

| ID | Historia | Prioridad |
|----|-------|----------|
| US-H-01 | Como anfitrión, quiero seleccionar y personalizar una plantilla de invitación para poder crear una invitación hermosa sin habilidades de diseño | Must |
| US-H-02 | Como anfitrión, quiero importar invitados desde un archivo CSV para poder añadir mi lista de invitados rápidamente | Must |
| US-H-03 | Como anfitrión, quiero ver estadísticas de RSVP en tiempo real para poder planificar el catering y los asientos | Must |
| US-H-04 | Como anfitrión, quiero enviar invitaciones por email y WhatsApp para que los invitados las reciban en su canal preferido | Should |
| US-H-05 | Como anfitrión, quiero designar a un cómplice que pueda enviar actualizaciones en vivo el día de la boda para poder disfrutar de mi día | Should |
| US-H-06 | Como anfitrión, quiero ver qué invitados tienen restricciones dietéticas para poder coordinar con el servicio de catering | Must |
| US-H-07 | Como anfitrión, quiero enviar recordatorios automatizados a los invitados que no han hecho RSVP para no tener que hacer seguimiento manualmente | Should |

---

## 3.2 Persona 2: Carlos — El Invitado

| Atributo | Detalle |
|-----------|--------|
| **Edad** | 30 |
| **Ubicación** | Barcelona, España |
| **Ocupación** | Arquitecto |
| **Habilidad Tecnológica** | Media-Alta — usa WhatsApp diariamente, cómodo con formularios web |
| **Relación con la Pareja** | Amigo de universidad de Juan |

### Trabajos a Realizar (Jobs-to-be-Done)
1. *"Déjame hacer RSVP rápidamente sin crear una cuenta"*
2. *"Muéstrame la ubicación del evento y cómo llegar allí"*
3. *"Déjame añadir el evento a mi calendario con un clic"*
4. *"Mantenme actualizado el día de la boda para no perderme nada"*

### Puntos de Dolor (Pain Points)
- Odia crear cuentas para interacciones de una sola vez
- A menudo olvida los detalles del evento después de hacer RSVP
- Se pierde actualizaciones en tiempo real (ej., "la ceremonia empieza ahora")
- No quiere descargar una aplicación para un solo evento

### Criterios de Éxito
- RSVP completado en menos de 60 segundos en el móvil
- Indicaciones del lugar accesibles con un solo toque
- Evento añadido al calendario automáticamente
- Recibe actualizaciones puntuales por WhatsApp el día del evento
- No se requiere descargar ninguna aplicación

### Historias de Usuario

| ID | Historia | Prioridad |
|----|-------|----------|
| US-G-01 | Como invitado, quiero hacer RSVP a través de un formulario adaptado a móviles sin crear una cuenta para poder responder rápidamente | Must |
| US-G-02 | Como invitado, quiero ver el lugar en un mapa con indicaciones para saber cómo llegar | Must |
| US-G-03 | Como invitado, quiero añadir el evento a mi calendario con un clic para no olvidarlo | Should |
| US-G-04 | Como invitado, quiero recibir actualizaciones en vivo por WhatsApp el día del evento para no perderme momentos clave | Should |
| US-G-05 | Como invitado, quiero indicar mis restricciones dietéticas para que los anfitriones puedan acomodarme | Must |
| US-G-06 | Como invitado, quiero indicar si necesito transporte para que los anfitriones puedan organizarlo | Must |

---

## 3.3 Persona 3: Laura — El Cómplice (Accomplice)

| Atributo | Detalle |
|-----------|--------|
| **Edad** | 28 |
| **Ubicación** | Madrid, España |
| **Ocupación** | Diseñadora Gráfica |
| **Habilidad Tecnológica** | Alta — usuaria pionera, cómoda con nuevas herramientas |
| **Relación con la Pareja** | Dama de honor de María |

### Trabajos a Realizar (Jobs-to-be-Done)
1. *"Déjame enviar actualizaciones en vivo a los invitados en nombre de la pareja"*
2. *"Haz que sea imposible enviar accidentalmente el mensaje equivocado"*
3. *"Dame una interfaz sencilla que pueda usar mientras estoy en la boda"*
4. *"Déjame acceder a todo sin recordar una contraseña"*

### Puntos de Dolor (Pain Points)
- La pareja está ocupada; los invitados no paran de pedirle actualizaciones a Laura
- Enviar accidentalmente mensajes equivocados sería vergonzoso
- Necesita que funcione en el móvil mientras se mueve por el lugar
- No quiere gestionar otra contraseña

### Criterios de Éxito
- Accede al panel de cómplice vía enlace mágico (sin contraseña)
- Envía mensajes preconfigurados con un solo deslizamiento (swipe)
- Cero envíos accidentales
- Funciona perfectamente en el móvil en cualquier condición de iluminación
- Puede ver qué mensajes han sido entregados

### Historias de Usuario

| ID | Historia | Prioridad |
|----|-------|----------|
| US-A-01 | Como cómplice, quiero acceder a mi panel mediante un enlace mágico para no necesitar crear una contraseña | Must |
| US-A-02 | Como cómplice, quiero enviar mensajes en vivo preconfigurados con un gesto de deslizamiento para no poder enviarlos accidentalmente | Must |
| US-A-03 | Como cómplice, quiero ver qué mensajes han sido entregados para saber si los invitados recibieron las actualizaciones | Should |
| US-A-04 | Como cómplice, quiero ver el resumen de RSVP para poder responder a las preguntas de los invitados | Should |

---

## 3.4 Persona 4: Elena — La Wedding Planner (Futuro V3)

| Atributo | Detalle |
|-----------|--------|
| **Edad** | 35 |
| **Ubicación** | Valencia, España |
| **Ocupación** | Wedding Planner Independiente |
| **Habilidad Tecnológica** | Media — usa software de planificación pero prefiere la simplicidad |
| **Carga de Clientes** | 15-20 bodas por año |

### Trabajos a Realizar (Jobs-to-be-Done)
1. *"Déjame gestionar las invitaciones de múltiples parejas desde un solo dashboard"*
2. *"Dale a mis clientes una invitación de aspecto profesional sin que yo tenga que diseñarla"*
3. *"Rastrea los RSVPs de todos mis eventos en un solo lugar"*
4. *"Cobrar a mis clientes por el servicio de invitación como parte de mi paquete"*

### Puntos de Dolor (Pain Points)
- Actualmente usa herramientas diferentes para cada pareja
- Pasa 5-10 horas por pareja en logística de invitaciones
- Los clientes esperan soluciones digitales pero ella carece de las herramientas
- Sin vista unificada de todos sus eventos

### Criterios de Éxito (V3)
- Dashboard multi-evento
- Opción de marca blanca (branding del planner)
- Operaciones en lote entre eventos
- Integración de facturación a clientes
- Ahorro de tiempo: 50% de reducción en el tiempo de gestión de invitaciones

> **Nota:** Esta persona está fuera del alcance para el MVP. La arquitectura debe diseñarse para soportar la gestión de múltiples eventos en el futuro.

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Declaración del Problema](02-problem-opportunity.md) | [Siguiente: Visión y Estrategia](04-vision-strategy.md)
