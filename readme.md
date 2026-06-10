<p align="center">
  <img src="https://img.shields.io/badge/🖋️_INK·LINK-La_Vitrina_Digital_del_Tatuaje-E8521A?style=for-the-badge&labelColor=0A0A0F" alt="INK·LINK"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Etapa-Pre--Seed-E8521A?style=flat-square&labelColor=1A1F2E" />
  <img src="https://img.shields.io/badge/Plataforma-Sitio_Web_Responsive-1D6FA4?style=flat-square&labelColor=1A1F2E" />
  <img src="https://img.shields.io/badge/Mercado-Santiago,_Chile_🇨🇱-4A9B5E?style=flat-square&labelColor=1A1F2E" />
  <img src="https://img.shields.io/badge/Stack-Angular_·_.NET_·_PostgreSQL-A8B2C3?style=flat-square&labelColor=1A1F2E" />
</p>
---

## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---
## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Rodrigo Antonio Chamy Cruz

### **0.2. Nombre del proyecto:**

> 🖋️ **INK·LINK** — La vitrina digital del tatuaje en Chile

### **0.3. Descripción breve del proyecto:**

> **INK·LINK** es un sitio web responsive que funciona como **vitrina digital y marketplace transaccional** para la industria del tatuaje en Chile. Nace para resolver un problema concreto: hoy, quien quiere tatuarse depende de redes sociales (Instagram, TikTok, Facebook, WhatsApp) para descubrir artistas, pedir precios y coordinar citas — un proceso lento, opaco y sin garantías para ninguna de las partes.
>
> INK·LINK estructura ese flujo en **5 momentos clave**: el usuario **descubre** tatuajes y tatuadores cercanos desde que abre la plataforma, **compara** artistas por calificaciones, certificaciones y premios, **cotiza** a través de un chatbot que estima precio según las tarifas publicadas del artista, **reserva** un slot y paga depósito de forma directa (sin esperar aprobación del artista), y **califica** con reseñas verificadas en 4 dimensiones incluyendo foto de curación a los 90 días.
>

### **0.4. URL del proyecto:**

> https://github.com/rchamycruz/AI4Devs-finalproject

### **0.5. URL o archivo comprimido del repositorio**

> https://github.com/rchamycruz/AI4Devs-finalproject

---

## 1. Descripción general del producto

### **1.1. Objetivo:**

#### 🎯 Propósito

Reemplazar el sistema informal y fragmentado de reservas a través de redes sociales con una plataforma profesional que digitaliza y estructura todo el ciclo del tatuaje en un flujo directo y sin fricción:

<p align="center">
  <img src="https://img.shields.io/badge/1-🔍_DESCUBRIR-1D6FA4?style=for-the-badge&labelColor=0A0A0F" />
  <img src="https://img.shields.io/badge/2-⚖️_COMPARAR-1D6FA4?style=for-the-badge&labelColor=0A0A0F" />
  <img src="https://img.shields.io/badge/3-💬_COTIZAR-E8521A?style=for-the-badge&labelColor=0A0A0F" />
  <img src="https://img.shields.io/badge/4-📅_RESERVAR-E8521A?style=for-the-badge&labelColor=0A0A0F" />
  <img src="https://img.shields.io/badge/5-⭐_CALIFICAR-4A9B5E?style=for-the-badge&labelColor=0A0A0F" />
</p>

#### 💡 Qué valor aporta y qué soluciona

<table>
<tr>
<th width="50%">😤 Problema actual</th>
<th width="50%">✅ Cómo lo resuelve INK·LINK</th>
</tr>
<tr>
<td>Los clientes buscan tatuadores en redes sociales <strong>sin filtros reales</strong> de estilo, precio o calidad</td>
<td>🔍 <strong>Vitrina visual</strong> con mapa interactivo, geolocalización y filtros por estilo, precio, rating y certificación</td>
</tr>
<tr>
<td>No se sabe <strong>cuánto cuesta</strong> un tatuaje hasta que se pregunta por DM y se espera días por respuesta</td>
<td>💬 <strong>Chatbot cotizador</strong> que estima el precio en el momento usando las tarifas publicadas del artista — sin esperar respuesta de nadie</td>
</tr>
<tr>
<td>Coordinar fecha y hora requiere <strong>múltiples mensajes</strong> entre cliente y artista</td>
<td>📅 <strong>Reserva directa</strong> sobre la agenda publicada del artista — el cliente elige slot y paga sin intermediación</td>
</tr>
<tr>
<td>Los pagos son en efectivo o transferencia, <strong>sin protección</strong> ante cancelaciones</td>
<td>💳 <strong>Depósito de reserva</strong> con Flow y protección anti no-show</td>
</tr>
<tr>
<td>No se puede verificar la <strong>higiene ni la reputación</strong> real del artista más allá de fotos en redes</td>
<td>⭐ <strong>Calificaciones verificadas</strong> en 4 dimensiones + certificación sanitaria + foto de curación a 90 días</td>
</tr>
<tr>
<td>Los <strong>premios y trayectoria</strong> del artista están dispersos en posts y stories que desaparecen</td>
<td>🏆 <strong>Badges de reconocimientos</strong> verificados, permanentes y visibles en el perfil</td>
</tr>
<tr>
<td>Los tatuadores pierden <strong>2+ horas/día</strong> respondiendo las mismas preguntas por DM</td>
<td>🤖 El chatbot <strong>recopila los requisitos</strong> del cliente y le entrega un precio basado en las tarifas del artista — cero intervención manual</td>
</tr>
</table>

#### 👥 Para quién

<table>
<tr>
<td align="center" width="33%">
<h4>👤 Clientes</h4>
<em>Personas de 18+ años que buscan tatuarse</em><br/><br/>
Quieren transparencia en precios, reseñas confiables, poder comparar artistas y un proceso de reserva directo con pago protegido.
</td>
<td align="center" width="33%">
<h4>🎨 Tatuadores y Estudios</h4>
<em>Independientes y estudios con múltiples artistas</em><br/><br/>
Necesitan visibilidad fuera de redes sociales, dejar de responder preguntas repetitivas, y cobrar con garantía anti no-show.
</td>
<td align="center" width="33%">
<h4>🏷️ Marcas del rubro</h4>
<em>Proveedores de tintas, agujas, máquinas, aftercare, indumentaria</em><br/><br/>
Buscan un canal de publicidad dirigido a la comunidad activa de tatuaje y auspiciar artistas destacados.
</td>
</tr>
</table>

---

### **1.2. Características y funcionalidades principales:**

> El sistema se organiza en **5 funcionalidades core** que corresponden a los 5 momentos del ciclo del tatuaje. El flujo es **completamente directo**: el cliente descubre, compara, cotiza, reserva y califica sin que el artista tenga que intervenir en tiempo real — su participación se limita a configurar su perfil, tarifas y agenda una vez.

<br/>

<table>
<tr>
<td colspan="3">

#### 🔍 Funcionalidad 1 — DESCUBRIR

</td>
</tr>
<tr>
<th width="5%">#</th>
<th width="25%">Componente</th>
<th width="70%">Descripción</th>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/1.1-1D6FA4?style=flat-square"/></td>
<td>🖼️ <strong>Vitrina de tatuajes (Must-Have)</strong></td>
<td>Al abrir INK·LINK el usuario <strong>ya está viendo tatuajes</strong>. Feed visual de trabajos destacados mostrando el artista que los hizo, su ubicación y su calificación. Secciones dinámicas personalizadas según geolocalización: <em>"Cerca de ti"</em>, <em>"Mejor calificados"</em>, <em>"Estilos populares"</em>, <em>"Artistas premiados"</em>. Sin login obligatorio — la vitrina está abierta desde el segundo 0.</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/1.2-1D6FA4?style=flat-square"/></td>
<td>🗺️ <strong>Mapa interactivo (Should-Have)</strong></td>
<td>Mapa con geolocalización que muestra tatuadores y estudios como marcadores. Cada marcador despliega foto de portafolio, nombre, rating y estilo principal. Al tocar se abre un preview card con CTA <em>"Ver perfil"</em> y <em>"Cotizar"</em>. Radio configurable (1km, 5km, 10km, toda la ciudad). Vista alternativa en formato lista. Clustering automático en zonas con alta densidad de artistas.</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/1.3-1D6FA4?style=flat-square"/></td>
<td>🔎 <strong>Filtros avanzados (Must-Have)</strong></td>
<td>Búsqueda por texto (nombre del artista, estilo, comuna) combinada con filtros: estilo (realismo, tradicional, blackwork, fine line, japonés, lettering, etc.), rango de precio (slider doble min-max), calificación mínima, certificación sanitaria vigente, reconocimientos/premios, disponibilidad esta semana, tipo (estudio vs. independiente).</td>
</tr>
</table>

<br/>

<table>
<tr>
<td colspan="3">

#### ⚖️ Funcionalidad 2 — COMPARAR

</td>
</tr>
<tr>
<th width="5%">#</th>
<th width="25%">Componente</th>
<th width="70%">Descripción</th>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/2.1-1D6FA4?style=flat-square"/></td>
<td>🎨 <strong>Perfil profesional (Must-Have)</strong></td>
<td>Cada artista tiene un perfil público con URL compartible (<code>inklink.cl/artista/nombre</code>). Incluye portafolio de fotos HD (hasta 100) y foto destacada. Bio, estilos que maneja, años de experiencia, ubicación en mapa y calendario de disponibilidad embebido. Distinción visible: <em>"Estudio Consolidado"</em> vs <em>"Tatuador Independiente"</em>. <strong>Tarifas publicadas</strong> (precio mínimo por sesión + precio por hora) que alimentan directamente al chatbot cotizador. <em>📌 Videos cortos (30s) y pares antes/después son <strong>Won't-Have</strong> en el MVP.</em></td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/2.2-1D6FA4?style=flat-square"/></td>
<td>🏆 <strong>Reconocimientos y premios (Must-Have)</strong></td>
<td>Badges verificados de premios en convenciones (ej: <em>"🥇 Mejor Realismo — Expo Tattoo Santiago 2025"</em>), menciones en publicaciones especializadas, certificaciones de academias. Visible en perfil y en resultados de búsqueda. Filtrable por los clientes. <em>📌 En el MVP, los reconocimientos son <strong>datos pre-cargados</strong> (seed) — no existe pantalla de upload para el artista.</em></td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/2.3-1D6FA4?style=flat-square"/></td>
<td>🛡️ <strong>Certificación sanitaria (Must-Have)</strong></td>
<td>Insignia <em>"✅ Certificado Sanitario"</em> visible en perfil, mapa y resultados de búsqueda. Indica que el artista cuenta con resolución SEREMI, certificados de bioseguridad o permisos municipales vigentes. Los clientes pueden filtrar <strong>exclusivamente</strong> artistas con certificación vigente. <em>📌 En el MVP, las certificaciones son <strong>datos pre-cargados</strong> (seed) — no existe flujo de upload ni validación de documentos.</em></td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/2.4-1D6FA4?style=flat-square"/></td>
<td>🤝 <strong>Auspicios de marcas (Should-Have)</strong></td>
<td>Marcas de tintas, máquinas, gorros, poleras, piercings y aftercare pueden auspiciar artistas. Se muestra <em>"Auspiciado por [Marca]"</em> con logo en el perfil. Señal adicional de credibilidad y confianza para el cliente que compara opciones. <em>📌 En el MVP, los auspicios son <strong>datos pre-cargados</strong> (seed) — no existe panel de gestión marca-artista.</em></td>
</tr>
</table>

<br/>

<table>
<tr>
<td colspan="3">

#### 💬 Funcionalidad 3 — COTIZAR

</td>
</tr>
<tr>
<th width="5%">#</th>
<th width="25%">Componente</th>
<th width="70%">Descripción</th>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/3.1-E8521A?style=flat-square"/></td>
<td>🤖 <strong>Chatbot cotizador (Should-Have)</strong></td>
<td>

Un chatbot conversacional que **reemplaza las preguntas repetitivas por DM**. El cliente inicia una conversación y el chatbot le guía paso a paso:

| Paso | El chatbot pregunta | El cliente responde |
|---|---|---|
| 1️⃣ | *"¿En qué zona del cuerpo?"* | Selecciona sobre silueta interactiva o escribe |
| 2️⃣ | *"¿Qué tamaño aproximado?"* | Elige referencia visual: moneda → palma → mano → brazo |
| 3️⃣ | *"¿Qué estilo te interesa?"* | Selecciona de galería de estilos |
| 4️⃣ | *"¿Tienes imágenes de referencia?"* | Sube 1-3 fotos (opcional) |
| 5️⃣ | *"¿Color o B&N? ¿Es cover-up?"* | Responde con toggles o texto |

**Al completar**, el chatbot calcula un **rango de precio estimado** (ej: *"$80.000 – $150.000 CLP"*) usando directamente las **tarifas publicadas del artista** (precio mínimo, precio por hora, complejidad por estilo/zona). No hay negociación ni espera: el precio se genera en el momento.

**Flujo directo a reserva**: si el cliente acepta el rango, el chatbot le muestra los slots disponibles del artista y le permite reservar inmediatamente.

</td>
</tr>
</table>

<br/>

<table>
<tr>
<td colspan="3">

#### 📅 Funcionalidad 4 — RESERVAR

</td>
</tr>
<tr>
<th width="5%">#</th>
<th width="25%">Componente</th>
<th width="70%">Descripción</th>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/4.1-E8521A?style=flat-square"/></td>
<td>📅 <strong>Reserva directa (Must-Have)</strong></td>
<td>Desde el chatbot (o desde el perfil del artista), el cliente ve el calendario con slots disponibles (vista semanal). Selecciona un horario y ve el resumen: artista, fecha, hora, precio estimado, monto del depósito. <strong>Sin aprobación del artista</strong> — si el slot está abierto y el artista publicó sus tarifas, la reserva se concreta al pagar.</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/4.2-E8521A?style=flat-square"/></td>
<td>💳 <strong>Pago de depósito (Must-Have)</strong></td>
<td>Pago del depósito (20-50% del precio, configurable por el artista, default 30%) a través de <strong>Flow</strong>. Confirmación instantánea para ambas partes (email + notificación). Split payment automático: la plataforma retiene comisión (5-10%) y libera el resto. Política de cancelación visible antes del pago (24h, 48h o 72h).</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/4.3-E8521A?style=flat-square"/></td>
<td>🛡️ <strong>Protección anti no-show (Won't-Have)</strong></td>
<td>Cliente no se presenta → depósito se transfiere al artista. Artista cancela → reembolso completo al cliente. Principal argumento de adopción para artistas: por primera vez tienen garantía económica ante cancelaciones, algo que las redes sociales nunca ofrecen. 📌 <strong>Won't-Have MVP</strong> — funcionalidad documentada para versiones futuras.</td>
</tr>
</table>

<br/>

<table>
<tr>
<td colspan="3">

#### ⭐ Funcionalidad 5 — CALIFICAR

</td>
</tr>
<tr>
<th width="5%">#</th>
<th width="25%">Componente</th>
<th width="70%">Descripción</th>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/5.1-4A9B5E?style=flat-square"/></td>
<td>⭐ <strong>Reseñas en 4 dimensiones (Should-Have)</strong></td>
<td>

Solo clientes con booking completado pueden reseñar. La calificación se divide en **4 ejes independientes** (1-5 estrellas cada uno):

| Dimensión | Qué evalúa |
|---|---|
| 🧼 **Higiene** | Limpieza del espacio, materiales descartables, esterilización |
| 💪 **Manejo del dolor** | Comunicación durante la sesión, pausas, empatía |
| 🤝 **Trato al cliente** | Puntualidad, profesionalismo, respeto del diseño |
| 🎨 **Resultado** | Calidad del tatuaje terminado (se pide foto) |

Texto opcional + foto del tatuaje. El artista puede responder cada reseña. Rating agregado visible en mapa, vitrina y perfil. Anti-fraude: 1 reseña por booking, rate limiting, moderación.

</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/5.2-4A9B5E?style=flat-square"/></td>
<td>📸 <strong>Foto de curación (90 días) (Should-Have)</strong></td>
<td>A los 90 días de la sesión, el sistema envía recordatorio para subir una <strong>foto de curación</strong> y actualizar el rating de "Resultado". Las reseñas con foto de curación se marcan con badge <em>"✅ Reseña Completa"</em>. <strong>Diferenciador único</strong>: ninguna otra plataforma evalúa cómo queda el tatuaje después de sanar.</td>
</tr>
</table>

---

#### 🔗 Flujo completo del sistema

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │    🔍    │     │    ⚖️    │     │    💬    │     │    📅    │     │    ⭐    │
  │DESCUBRIR │────▶│ COMPARAR │────▶│ COTIZAR  │────▶│ RESERVAR │────▶│CALIFICAR │
  │          │     │          │     │          │     │          │     │          │
  │ Vitrina  │     │ Perfil   │     │ Chatbot  │     │ Slot +   │     │ 4 ejes + │
  │ + Mapa   │     │ + Badges │     │ estima   │     │ depósito │     │ foto 90d │
  │ + Filtros│     │ + Certif.│     │ precio   │     │ directo  │     │          │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                         │
                                    ┌────┴─────┐
                                    │ Tarifas  │
                                    │ del      │
                                    │ artista  │
                                    └──────────┘
                                  (configuradas 1 vez)
```

> 💡 **Principio clave del MVP**: el artista configura su perfil, tarifas y agenda **una sola vez**. A partir de ahí, todo el flujo del cliente (descubrir → cotizar → reservar → calificar) ocurre **sin intervención del artista en tiempo real**. Esto elimina la lógica de negociación, estados de cotización pendientes y notificaciones bidireccionales. Los datos de reconocimientos, certificaciones sanitarias y auspicios de marcas son **pre-cargados vía seed** — se visualizan y filtran en el frontend, pero no existe backoffice de gestión en el MVP.

---

#### 📋 Resumen de funcionalidades

<table>
<tr>
<th align="center">Nº</th>
<th align="center">Funcionalidad</th>
<th align="center">Componentes</th>
<th align="center">Rol en el flujo</th>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/1-1D6FA4?style=flat-square"/></td>
<td>🔍 <strong>Descubrir</strong></td>
<td>Vitrina de tatuajes · Mapa interactivo · Filtros avanzados</td>
<td><em>El usuario encuentra artistas cercanos</em></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/2-1D6FA4?style=flat-square"/></td>
<td>⚖️ <strong>Comparar</strong></td>
<td>Perfil con portafolio y tarifas · Premios <sup>seed</sup> · Certificación sanitaria <sup>seed</sup> · Auspicios <sup>seed</sup></td>
<td><em>El usuario elige con confianza</em></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/3-E8521A?style=flat-square"/></td>
<td>💬 <strong>Cotizar</strong></td>
<td>Chatbot que estima precio con tarifas del artista</td>
<td><em>El usuario sabe cuánto cuesta — sin esperar</em></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/4-E8521A?style=flat-square"/></td>
<td>📅 <strong>Reservar</strong></td>
<td>Reserva directa · Pago depósito (Flow) · Anti no-show</td>
<td><em>El usuario asegura su cita con pago protegido</em></td>
</tr>
<tr>
<td align="center"><img src="https://img.shields.io/badge/5-4A9B5E?style=flat-square"/></td>
<td>⭐ <strong>Calificar</strong></td>
<td>Reseñas 4 dimensiones · Foto de curación 90 días</td>
<td><em>El usuario contribuye a la reputación verificable</em></td>
</tr>
</table>

---

<p align="center">
  <img src="https://img.shields.io/badge/INK·LINK-Documento_Confidencial-1D3A5E?style=flat-square&labelColor=0A0A0F" />
  <img src="https://img.shields.io/badge/©_2026-Fuente_de_verdad_del_proyecto-1D3A5E?style=flat-square&labelColor=0A0A0F" />
</p>
