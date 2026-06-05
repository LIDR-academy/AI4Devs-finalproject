# 📑 Documento de Visión y Estrategia: Aura Planning

## 1. Resumen de Proyecto
**Aura Planning** es una plataforma SaaS (Software as a Service) diseñada para la gestión de invitaciones digitales y la narrativa en tiempo real de eventos. Aunque el mercado inicial son las bodas, la marca está construida para escalar a cualquier celebración (cumpleaños, eventos corporativos, bautizos).

* **Nombre:** Aura Planning.
* **Eslogan:** *"Diseña la narrativa de tu evento, gestiona la logística sin esfuerzo."*
* **Propósito:** Sustituir la invitación de papel por un ecosistema digital interactivo que elimine el estrés logístico y genere expectativa (hype) en los invitados.

---

## 2. Funcionalidades del Producto (MVP)

### A. Panel de Gestión (Anfitrión)
* **Editor de Plantillas:** Herramienta visual para personalizar colores, tipografía y fotos.
* **Gestor de Invitados:** Importación masiva (CSV/Excel) y segmentación por categorías (familia, amigos, etc.).
* **Dashboard de Control:** Seguimiento de confirmaciones (RSVP), inasistencias y gestión de alérgenos o necesidades de transporte.

### B. Micrositio del Invitado (Experiencia Mobile-First)
* **Sitios Estáticos:** Navegación ultra-rápida y ligera desde el navegador del móvil (sin descarga de apps).
* **Formulario RSVP Inteligente:** Captura de datos críticos (dietas, asistencia a autobús).
* **Logística Dinámica:** Mapas integrados (Google Maps/Waze) y sincronización con calendarios personales.

### C. Sistema de Comunicación
* **Invitaciones Multicanal:** Envío mediante Email diseñado o enlace directo de WhatsApp.
* **Recordatorios:** Automatización de avisos para invitados que aún no han confirmado.
* **Agradecimientos Post-Evento:** Automatización para enviar tarjetas de "Gracias" digitales (vía Email o WhatsApp) a los asistentes, con opción de incluir enlaces a galerías de fotos externas (Drive, Pixieset) ya que la plataforma no aloja imágenes en esta fase. Sirve como punto de contacto final y refuerzo de marca.

---

## 3. La "Killer Feature": Live Guest Journey
Experiencia narrativa en directo mediante notificaciones durante el día del evento.

* **Canal Principal:** WhatsApp (vía API oficial).
* **El "Modo Cómplice":** Acceso seguro mediante **Magic Link** (sin contraseña) para una persona de confianza (padrino o dama de honor).
* **Panel de Control Remoto:** Interfaz simplificada con botones pre-configurados que requieren un **"Swipe" (deslizar)** para evitar envíos accidentales.
* **Mensajes en Vivo:** "La novia ya sale del hotel", "¡Han dicho que sí!", "¡Empieza el baile!".

> **💡 Justificación Estratégica:** Esta funcionalidad nos diferencia de los gigantes (Zankyou, Bodas.net) al enfocarnos en el **hype** y la inmediatez que demanda el público joven (Millennials/Gen Z). El uso de un "cómplice" asegura que los novios disfruten su día sin distracciones técnicas.

---

## 4. Estrategia de Negocio y Monetización

### Modelo: "Try-Before-You-Buy" (Efecto IKEA)
El usuario tiene acceso total a la herramienta de diseño de forma gratuita, pero el evento permanece en **"Modo Borrador"**.

* **Muro de Pago (Publishing Paywall):** Se debe realizar un pago único para obtener la URL pública y activar el sistema de recepción de confirmaciones (RSVP).
* **Limitación Técnica:** El modo gratuito permite añadir hasta 5 invitados para pruebas internas.

> **💡 Justificación Estratégica:** Al permitir que el usuario configure todos los detalles de su boda gratis, generamos una **fricción de cambio** altísima. Una vez invertido el tiempo en nuestra plataforma, el usuario preferirá pagar que empezar de cero en otra. Además, eliminamos el coste de dar servicio gratuito a usuarios que no tienen intención de convertir.

### Propuesta en Evaluación: Lista de Regalos / Fondo en Efectivo (Fintech)
*Actualmente bajo consideración para añadir una nueva vía de ingresos.*
Permitir a los invitados enviar regalos en efectivo directamente desde el formulario RSVP.
* **Modelo Operativo:** Integración con **Stripe Connect** para que el dinero vaya directamente del invitado a la cuenta bancaria del anfitrión (los novios). 
* **Ventaja Legal:** Aura **nunca** retiene ni toca los fondos principales, evitando convertirse legalmente en un banco o transmisor de dinero, eliminando responsabilidades de cumplimiento (KYC/AML) complejas para la plataforma.
* **Monetización Adicional:** Aura cobra una pequeña "tarifa de plataforma" (ej. 1.5% - 2%) por cada transacción, deducida automáticamente por Stripe antes de enviar el dinero al anfitrión.
* **Costes de Infraestructura:** Stripe cobra una tarifa mensual por "cuenta conectada activa" (el anfitrión), que se cubre fácilmente con la comisión retenida por la plataforma.

---

## 5. Arquitectura Técnica y Optimización de Costes

* **Generación de Sitios Estáticos (JAMstack):** El sitio del invitado no consume recursos de base de datos en cada visita; es un recurso estático (HTML/JS/CSS) servido vía CDN.
* **Backend Transaccional:** El servidor solo trabaja para el panel de administración y el envío/recepción de datos.
* **Exclusión de Álbum de Fotos (V1):** No se permite la subida de fotos por parte de los invitados en esta fase.

> **💡 Justificación Estratégica:** Esta arquitectura reduce drásticamente los costes de ancho de banda y almacenamiento. Al no permitir fotos en la V1, evitamos el gasto más crítico (Egress de datos y storage) y simplificamos el cumplimiento legal (RGPD).

---

## 6. Estructura de Gastos Previstos

| Categoría | Concepto | Impacto en Coste |
| :--- | :--- | :--- |
| **Infraestructura** | Hosting para Admin y Base de Datos (PostgreSQL/Node). | Bajo/Medio |
| **APIs de Envío** | WhatsApp Business API (pago por conversación) y Email (AWS SES). | Variable (según volumen) |
| **Financiero** | Comisiones de Pasarela de Pago (Stripe/PayPal ~3%). | Proporcional a ventas |
| **Mapas** | Google Maps API (cargas de mapas). | Bajo (con cuota gratuita) |
| **Operaciones** | Soporte al cliente y mantenimiento de certificados SSL. | Medio (Tiempo humano) |

---

## 7. Roadmap de Crecimiento
1.  **V1 (MVP):** Foco en bodas, pago por publicación, notificaciones básicas de RSVP.
2.  **V2 (Live):** Integración de WhatsApp API y despliegue del "Modo Cómplice".
3.  **V3 (Diversificación):** Apertura a eventos corporativos, cumpleaños y bautizos bajo la marca "Aura".

---

**Notas Adicionales:**
* **Borrado de Datos:** Para optimizar costes y cumplir con privacidad, todos los datos sensibles se eliminarán automáticamente 30 días después de la fecha del evento.
* **Diseño:** La interfaz debe ser minimalista, elegante y transmitir la paz que sugiere el nombre "Aura".