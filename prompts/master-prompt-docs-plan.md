# Plan de Ejecución — documentacion.md

## Checklist Verificable

### 1. Descripción del Software
- [ ] 1.1 Descripción breve (2-3 párrafos): qué es, para quién, cómo funciona
- [ ] 1.2 Valor añadido (5-7 bullets diferenciadores vs. buscar en redes sociales)
- [ ] 1.3 Ventajas competitivas (vs. Instagram/WhatsApp/competidores directos)
- [ ] 1.4 Funciones principales (resumen de los 5 momentos con 1-2 líneas cada uno)
- [ ] 1.5 Diagrama Lean Canvas (Mermaid) con los 9 bloques:
  - Problema
  - Segmentos de clientes
  - Propuesta de valor única
  - Solución
  - Canales
  - Flujos de ingresos
  - Estructura de costos
  - Métricas clave
  - Ventaja injusta

### 2. Casos de Uso Principales
- [ ] 2.1 **CU-01: Cliente cotiza y reserva un tatuaje**
  - Actores: Cliente, Sistema (Chatbot), Pasarela Flow
  - Precondiciones: artista con perfil activo y agenda publicada
  - Flujo: descubrir → filtrar → cotizar con chatbot → seleccionar slot → pagar depósito
  - Diagrama Mermaid (sequence o use case)
- [ ] 2.2 **CU-02: Tatuador configura su perfil y agenda**
  - Actores: Tatuador/Estudio
  - Precondiciones: cuenta verificada
  - Flujo: completar perfil → subir portafolio → definir tarifas → configurar disponibilidad
  - Diagrama Mermaid
- [ ] 2.3 **CU-03: Cliente califica un tatuaje con foto de curación**
  - Actores: Cliente, Sistema (notificación a 90 días)
  - Precondiciones: reserva completada, 90 días transcurridos
  - Flujo: recibir notificación → subir foto → calificar en 4 dimensiones → publicar reseña
  - Diagrama Mermaid

### 3. Modelo de Datos
- [ ] 3.1 Entidades identificadas:
  - User (base para cliente y artista)
  - Artist/Studio (perfil profesional)
  - Portfolio (trabajos/fotos)
  - TattooStyle (catálogo de estilos)
  - PricingConfig (tarifas del artista)
  - Availability/TimeSlot (agenda)
  - Booking (reserva)
  - Payment (depósito/transacción)
  - Review (calificación en 4 dimensiones)
  - HealingPhoto (foto de curación)
  - Certification (sanitaria)
  - Award/Badge (premios/reconocimientos)
- [ ] 3.2 Tabla de atributos por entidad (nombre, tipo)
- [ ] 3.3 Relaciones explicadas en texto
- [ ] 3.4 Diagrama ER en Mermaid (erDiagram)

### 4. Diseño del Sistema a Alto Nivel
- [ ] 4.1 Capas de la arquitectura:
  - Presentación (Angular SPA)
  - API Gateway / Backend (.NET Web API)
  - Servicios de dominio (Booking, Pricing, Reviews, Notifications)
  - Persistencia (PostgreSQL)
  - Integraciones externas (Flow pagos, servicio de geolocalización, almacenamiento de imágenes, notificaciones push/email)
- [ ] 4.2 Decisiones arquitectónicas:
  - Monolito modular (v1, pre-seed)
  - API RESTful
  - Autenticación JWT
  - Almacenamiento de imágenes en object storage
  - Cola de mensajes para notificaciones asíncronas (reseña a 90 días)
- [ ] 4.3 Diagrama de arquitectura (Mermaid flowchart)

### 5. Diagrama C4
- [ ] 5.1 Nivel 1 — Contexto: INKSPIRE + actores externos + sistemas externos
- [ ] 5.2 Nivel 2 — Contenedores: Angular SPA, .NET API, PostgreSQL, Object Storage, Flow API, Servicio de notificaciones
- [ ] 5.3 Nivel 3 — Componentes del contenedor **".NET API"** (el más simple):
  - AuthController
  - ArtistProfileController
  - BookingController
  - PricingService (chatbot cotizador)
  - ReviewController
  - NotificationService
- [ ] 5.4 Diagramas Mermaid para cada nivel (C4Context, C4Container, C4Component o flowcharts etiquetados)

---

## Orden de Generación

1. Redactar secciones 1.1–1.4 (texto)
2. Diseñar Lean Canvas (1.5)
3. Detallar casos de uso con diagramas (2.1–2.3)
4. Modelar datos y generar ER (3.1–3.4)
5. Describir arquitectura con diagrama (4.1–4.3)
6. Generar diagramas C4 (5.1–5.4)
7. Revisión final de coherencia cruzada

## Validaciones Cruzadas

- [ ] El modelo de datos soporta los 3 casos de uso
- [ ] La arquitectura expone endpoints para cada caso de uso
- [ ] El C4 nivel 3 es coherente con los servicios mencionados en la arquitectura
- [ ] Los diagramas Mermaid son sintácticamente válidos
- [ ] El Lean Canvas refleja los ingresos (comisión por reserva, suscripción artista, publicidad marcas)
