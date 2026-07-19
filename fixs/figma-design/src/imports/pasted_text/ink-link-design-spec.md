# INK·LINK — Especificación de Diseño del Sitio (Visión Completa)

> Documento de referencia para prototipado en Figma u otro editor de diseño.
> Describe todas las páginas, funcionalidades y flujos del producto completo (sin restricciones del MVP).

---

## 1. Visión General del Producto

**INK·LINK** es un marketplace web responsive para la industria del tatuaje en Chile. Conecta a clientes que buscan tatuarse con artistas/estudios que ofrecen sus servicios, brindando transparencia de precios, reserva directa, y un sistema de reseñas verificadas.

### 1.1 Actores del Sistema

| Actor | Descripción |
|---|---|
| **Cliente** | Persona 18+ que busca tatuarse. Puede explorar sin cuenta, pero necesita login para cotizar, reservar y calificar. |
| **Tatuador/Estudio** | Profesional del tatuaje que gestiona su perfil, portafolio, tarifas y agenda. |
| **Admin** | Operador interno que gestiona la plataforma (verificaciones, moderación, métricas). |
| **Marca/Auspiciador** | Empresa del rubro (tintas, equipos, aftercare) que patrocina artistas o anuncia en la plataforma. |

### 1.2 Propuesta de Valor

- Cotización instantánea vía chatbot (sin esperar DMs)
- Reserva directa con pago de depósito (sin aprobación del artista)
- Reseñas verificadas en 4 dimensiones + foto de curación a 90 días
- Certificación sanitaria verificable
- Protección económica para ambas partes (depósito + política anti no-show)

---

## 2. Mapa de Navegación (Sitemap)

```
INK·LINK
├── / (Home / Vitrina)
├── /artistas (Listado con filtros)
├── /mapa (Mapa interactivo)
├── /artista/:slug (Perfil público del artista)
│   └── Chatbot cotizador (modal/panel)
├── /login
├── /registro
├── /mi-cuenta (Panel del cliente)
│   ├── Datos personales
│   ├── Mis reservas
│   └── Mis reseñas
├── /reserva (Resumen y pago)
├── /reservas/:id/calificar (Formulario de reseña)
│
├── /artista-panel (Panel del tatuador) ★
│   ├── Dashboard
│   ├── Mi perfil (edición)
│   ├── Portafolio (gestión de fotos)
│   ├── Tarifas y políticas
│   ├── Agenda y disponibilidad
│   ├── Mis reservas (entrantes)
│   ├── Mis reseñas (responder)
│   ├── Estadísticas
│   └── Auspicios y certificaciones
│
└── /admin (Panel de administración) ★
    ├── Dashboard de métricas
    ├── Gestión de artistas (verificación)
    ├── Gestión de usuarios
    ├── Moderación de reseñas
    └── Gestión de marcas/auspicios
```

> ★ = Vistas que no existen en el MVP actual pero deben diseñarse.

---

## 3. Páginas y Componentes — Detalle

### 3.1 Home / Vitrina (`/`)

**Propósito:** Landing principal. Captar la atención del visitante y facilitar el descubrimiento de artistas.

**Secciones:**

1. **Hero Banner**
   - Título principal con propuesta de valor
   - CTA primario: "Encuentra tu tatuador"
   - Buscador rápido (por estilo, nombre o comuna)

2. **Sección "Cerca de Ti"**
   - Carrusel horizontal de tarjetas de artistas basado en geolocalización
   - Si el usuario no permite geolocalización: muestra artistas de Santiago

3. **Sección "Mejor Calificados"**
   - Carrusel de artistas con mayor rating promedio
   - Badge de certificación sanitaria visible

4. **Sección "Estilos Populares"**
   - Grid de estilos de tatuaje con icono y nombre
   - Click lleva a `/artistas?estilo=X`

5. **Sección "Artistas Premiados"**
   - Destacado de artistas con premios/reconocimientos
   - Badges de premios visibles

6. **Footer**
   - Links informativos, redes sociales, términos y condiciones

**Componente clave: Tarjeta de Artista (ArtistCard)**
- Foto de portafolio destacada (thumbnail)
- Nombre del artista
- Rating (estrellas + número)
- Estilos principales (chips/tags)
- Ubicación (comuna)
- Badges: ✅ Certificación sanitaria, 🏆 Premiado, ⭐ Auspiciado
- CTA: "Ver perfil"

---

### 3.2 Listado de Artistas (`/artistas`)

**Propósito:** Búsqueda y filtrado avanzado de artistas.

**Layout:** Grid de tarjetas de artistas + panel lateral/superior de filtros.

**Filtros disponibles:**

| Filtro | Tipo | Opciones |
|---|---|---|
| Estilo | Multi-select chips | realismo, tradicional, blackwork, fine-line, japonés, lettering, neotradicional, acuarela, geométrico, minimalista, dotwork, tribal |
| Rango de precio | Range slider | $20.000 – $500.000 CLP |
| Calificación mínima | Rating stars | 1–5 estrellas |
| Certificación sanitaria | Toggle | Solo certificados |
| Tipo de artista | Select | Independiente / Estudio |
| Disponibilidad | Date picker | Fecha deseada |
| Ubicación/Comuna | Select/Autocomplete | Comunas de Santiago |
| Distancia | Range slider | 1km – 30km (si hay geolocalización) |
| Premios | Toggle | Solo premiados |

**Funcionalidades:**
- Búsqueda por texto (nombre, estilo, comuna)
- Ordenar por: Relevancia, Rating, Precio (menor/mayor), Distancia
- Paginación o scroll infinito
- Vista grid / vista lista toggle
- Contador de resultados

---

### 3.3 Mapa Interactivo (`/mapa`)

**Propósito:** Descubrir artistas geográficamente.

**Componentes:**

1. **Mapa (Leaflet + OpenStreetMap)**
   - Centrado en ubicación del usuario o Santiago por defecto
   - Marcadores de artistas/estudios con clustering automático
   - Zoom y drag
   - Marcadores diferenciados: independiente vs. estudio

2. **Preview Card (al tocar marcador)**
   - Foto miniatura del portafolio
   - Nombre del artista
   - Rating
   - Estilos principales
   - Botones: "Ver perfil" / "Cotizar"

3. **Controles laterales**
   - Selector de radio de búsqueda (1km, 5km, 10km, toda la ciudad)
   - Filtros rápidos (estilo, certificación)
   - Toggle: vista mapa ↔ vista lista

4. **Barra de búsqueda**
   - Buscar por dirección o comuna

---

### 3.4 Perfil del Artista (`/artista/:slug`)

**Propósito:** Mostrar toda la información profesional del artista para que el cliente tome una decisión informada.

**Secciones:**

1. **Header del perfil**
   - Avatar / foto del artista
   - Nombre completo
   - Tipo: "Tatuador Independiente" / "Estudio"
   - Ubicación (dirección + comuna)
   - Años de experiencia
   - Rating promedio (estrellas + número de reseñas)
   - Badges: ✅ Certificado, 🏆 Premiado, ⭐ Auspiciado
   - CTA principal: "Cotizar" (abre chatbot)
   - CTA secundario: "Reservar"

2. **Bio / Descripción**
   - Texto libre del artista (hasta 2000 caracteres)

3. **Estilos**
   - Chips/tags de los estilos que domina

4. **Portafolio**
   - Galería de fotos (grid masonry o slider)
   - Filtro por estilo dentro del portafolio
   - Lightbox para ampliar imagen
   - Hasta 100 fotos

5. **Tarifas**
   - Precio mínimo por sesión
   - Precio por hora
   - Porcentaje de depósito requerido
   - Política de cancelación (24h / 48h / 72h)

6. **Disponibilidad**
   - Calendario visual con días disponibles/bloqueados
   - Slots disponibles al seleccionar un día

7. **Certificaciones**
   - Listado con tipo, emisor, vigencia
   - Badge visual verificado

8. **Premios y Reconocimientos**
   - Evento, categoría, año
   - Badge/icono del premio

9. **Auspicios**
   - Logo de la marca + tipo de relación (embajador, auspiciado, certificado)

10. **Reseñas**
    - Listado paginado de reseñas
    - Cada reseña muestra: rating en 4 dimensiones, comentario, foto del tatuaje, foto de curación (si existe), respuesta del artista
    - Filtros: por rating, con foto de curación
    - Badge "✅ Reseña Completa" si incluye foto de curación

11. **Ubicación**
    - Mini-mapa con pin del estudio/ubicación

---

### 3.5 Chatbot Cotizador (Modal/Panel en perfil del artista)

**Propósito:** Estimar el precio del tatuaje de forma conversacional e inmediata.

**Flujo de preguntas:**

| Paso | Pregunta | Input del usuario |
|---|---|---|
| 1 | ¿En qué zona del cuerpo? | Selector visual (silueta corporal interactiva) |
| 2 | ¿Qué tamaño aproximado? | Referencias visuales: moneda → palma → mano → medio brazo → brazo completo |
| 3 | ¿Qué estilo te interesa? | Galería de estilos con ejemplos visuales |
| 4 | ¿Tienes imágenes de referencia? | Upload de 1-3 fotos (opcional) |
| 5 | ¿Color o B&N? ¿Es cover-up? | Toggles / radio buttons |

**Resultado:**
- Rango de precio estimado: "$X.000 – $Y.000 CLP"
- Desglose: tiempo estimado × tarifa por hora
- Monto del depósito calculado
- CTA: "Reservar ahora" → flujo de selección de slot

**Interfaz:**
- Panel lateral o modal flotante
- Diseño conversacional (burbujas de chat)
- Progreso visual (5 pasos)
- Posibilidad de volver atrás y ajustar respuestas

---

### 3.6 Flujo de Reserva

#### 3.6.1 Selección de Slot

**Se accede desde:** Chatbot (tras cotización) o directamente desde perfil del artista.

**Componentes:**
- Calendario mensual con días disponibles destacados
- Al seleccionar día: lista de slots horarios disponibles
- Indicador de duración del slot
- Resumen lateral con datos de la cotización

#### 3.6.2 Resumen de Reserva (`/reserva`)

**Componentes:**
- Datos del artista (foto, nombre, dirección)
- Fecha y hora seleccionada
- Detalle del tatuaje (zona, tamaño, estilo, color, cover-up)
- Precio estimado (rango)
- Monto del depósito a pagar
- Política de cancelación
- Checkbox de términos y condiciones
- CTA: "Pagar depósito" → redirige a Flow

#### 3.6.3 Retorno de Pago

**Estados posibles:**
- ✅ Pago exitoso: confirmación con detalles de la reserva, opción de agregar al calendario
- ❌ Pago rechazado: mensaje de error + opción de reintentar
- ⏳ Pago pendiente: mensaje de espera

---

### 3.7 Autenticación

#### 3.7.1 Login (`/login`)

- Email + contraseña
- Link "¿Olvidaste tu contraseña?"
- Link "Crear cuenta"
- Opción de login social (Google) — futuro

#### 3.7.2 Registro (`/registro`)

- Formulario: nombre, apellido, email, teléfono, contraseña
- Selector de rol: "Quiero tatuar" / "Quiero tatuarme"
- Verificación de email (link enviado)
- Términos y condiciones

---

### 3.8 Panel del Cliente (`/mi-cuenta`)

**Propósito:** Centro de control del usuario cliente.

**Secciones:**

1. **Datos personales**
   - Editar nombre, email, teléfono, avatar
   - Cambiar contraseña

2. **Mis Reservas** (`/mis-reservas`)
   - Listado de bookings con estado (confirmada, completada, cancelada)
   - Cada booking muestra: artista, fecha, hora, monto, estado
   - Acciones por estado:
     - Confirmada: "Cancelar reserva", "Confirmar asistencia"
     - Completada: "Escribir reseña" (si no hay reseña aún)
     - Completada + 90 días: "Subir foto de curación"

3. **Mis Reseñas**
   - Historial de reseñas escritas
   - Estado de foto de curación (pendiente / subida)

4. **Notificaciones** (futuro)
   - Recordatorios de citas
   - Solicitud de foto de curación a los 90 días
   - Confirmación de pagos

---

### 3.9 Panel del Tatuador (`/artista-panel`) ★

**Propósito:** Gestión completa del negocio del artista.

#### 3.9.1 Dashboard

- Métricas rápidas: reservas del mes, ingresos, rating actual, reseñas nuevas
- Próximas citas (lista de hoy y mañana)
- Notificaciones pendientes (reservas nuevas, reseñas por responder)

#### 3.9.2 Mi Perfil (Edición)

- Formulario completo de datos del perfil:
  - Bio, años de experiencia, tipo (independiente/estudio)
  - Dirección con mapa para posicionar pin
  - Selección de comuna
  - Estilos que domina (multi-select)
- Preview en tiempo real de cómo se ve el perfil público
- Estado: borrador / publicado
- Validación: campos requeridos para publicar (bio, al menos 1 foto, tarifas, al menos 1 slot)

#### 3.9.3 Portafolio

- Grid de fotos del portafolio
- Upload drag & drop (JPEG, PNG, WebP, max 10MB)
- Editar: descripción, estilo, marcar como destacada
- Reordenar con drag & drop
- Eliminar fotos
- Hasta 100 fotos

#### 3.9.4 Tarifas y Políticas

- Precio mínimo por sesión (CLP)
- Precio por hora (CLP)
- Porcentaje de depósito (20%–50%, slider)
- Política de cancelación (24h / 48h / 72h)
- Preview del cálculo: "Para un tatuaje de 3 horas, el depósito será de $X"

#### 3.9.5 Agenda y Disponibilidad

- **Horario semanal recurrente:**
  - Por cada día de la semana: hora inicio, hora fin, duración del slot
  - Activar/desactivar días
- **Bloqueo de fechas:**
  - Calendario visual para bloquear días específicos
  - Motivo opcional (vacaciones, convención, etc.)
- **Vista de reservas en calendario:**
  - Calendario mensual con slots ocupados/disponibles
  - Color coding: disponible (verde), reservado (azul), bloqueado (rojo)

#### 3.9.6 Mis Reservas (Entrantes)

- Listado de reservas por estado:
  - Confirmadas (próximas)
  - Completadas
  - Canceladas
  - No-show
- Detalle de cada reserva: cliente, fecha, hora, detalle del tatuaje, imágenes de referencia, monto
- Acciones:
  - Marcar como "completada" (cliente se presentó)
  - Marcar como "no-show" (cliente no se presentó)
  - Cancelar (con reembolso automático al cliente)

#### 3.9.7 Mis Reseñas

- Listado de reseñas recibidas
- Responder públicamente a una reseña
- Métricas agregadas por dimensión (higiene, dolor, trato, resultado)
- Gráfico de evolución del rating en el tiempo

#### 3.9.8 Estadísticas

- Reservas por mes (gráfico de barras)
- Ingresos por mes (gráfico de línea)
- Tasa de cancelación / no-show
- Rating promedio y evolución
- Estilos más solicitados
- Fuente de tráfico (búsqueda, mapa, directo)

#### 3.9.9 Certificaciones y Auspicios

- Subir certificaciones (PDF/imagen del certificado)
- Estado: pendiente de verificación / verificada / expirada
- Gestionar auspicios de marcas
- Solicitar verificación de premios

---

### 3.10 Panel de Administración (`/admin`) ★

#### 3.10.1 Dashboard

- KPIs: usuarios activos, artistas publicados, reservas/mes, GMV, tasa de conversión
- Alertas: certificaciones por expirar, reseñas reportadas, artistas pendientes de verificación

#### 3.10.2 Gestión de Artistas

- Listado de artistas con estado (pendiente, verificado, suspendido)
- Verificar/rechazar solicitudes de artistas nuevos
- Revisar y aprobar certificaciones subidas
- Suspender perfiles problemáticos

#### 3.10.3 Gestión de Usuarios

- Listado de clientes
- Detalle: reservas, reseñas, reportes
- Suspender/banear usuarios

#### 3.10.4 Moderación de Reseñas

- Cola de reseñas reportadas
- Acciones: aprobar, ocultar, eliminar
- Historial de moderación

#### 3.10.5 Gestión de Marcas/Auspicios

- CRUD de marcas patrocinadoras
- Asignar auspicios a artistas
- Gestionar banners publicitarios

---

## 4. Flujos de Usuario Principales

### 4.1 Flujo del Cliente: Descubrir → Cotizar → Reservar → Calificar

```
[Home/Vitrina] → [Filtrar/Buscar] → [Perfil del Artista] → [Chatbot Cotizador]
     ↓                                                             ↓
[Mapa Interactivo] ─────────────────────────────────→ [Seleccionar Slot]
                                                             ↓
                                                    [Resumen de Reserva]
                                                             ↓
                                                    [Pago vía Flow]
                                                             ↓
                                                    [Confirmación]
                                                             ↓
                                              [Confirmar Asistencia] (post-cita)
                                                             ↓
                                                    [Escribir Reseña]
                                                             ↓
                                              [Subir Foto Curación] (90 días después)
```

### 4.2 Flujo del Tatuador: Configurar → Recibir Reservas → Gestionar

```
[Registro como Artista] → [Completar Perfil] → [Subir Portafolio]
            ↓                                          ↓
[Configurar Tarifas] → [Configurar Agenda] → [Publicar Perfil]
                                                       ↓
                                            [Recibir Reservas Automáticas]
                                                       ↓
                                            [Gestionar Citas (marcar completada/no-show)]
                                                       ↓
                                            [Responder Reseñas]
                                                       ↓
                                            [Revisar Estadísticas]
```

### 4.3 Flujo de Cancelación y Protección

```
[Cliente solicita cancelar]
         ↓
    ¿Dentro del plazo? ──Sí──→ [Reembolso completo] → [Slot liberado]
         ↓ No
    [Depósito va al artista] → [Booking cancelado]

[Artista cancela]
         ↓
    [Reembolso completo al cliente] → [Booking cancelado]

[Cliente no se presenta]
         ↓
    [Artista marca no-show] → [Depósito va al artista]
```

---

## 5. Componentes Compartidos (Design System)

### 5.1 Componentes Reutilizables

| Componente | Uso | Variantes |
|---|---|---|
| **ArtistCard** | Tarjeta del artista en grids/carruseles | Compacta, extendida, mapa-preview |
| **StarRating** | Mostrar ratings | Solo lectura, interactivo (para reviews) |
| **CertificationBadge** | Badge de certificación | Sanitaria, bioseguridad, municipal |
| **SponsorBadges** | Logos de marcas auspiciadoras | Inline, grid |
| **ShowcaseSection** | Sección carrusel de la vitrina | Título + subtítulo + carrusel |
| **StyleChip** | Tag de estilo de tatuaje | Seleccionable, solo lectura |
| **SlotPicker** | Selector de horario | Calendario + lista de slots |
| **PriceRange** | Mostrar rango de precio | Con/sin depósito |
| **ReviewCard** | Tarjeta de reseña | Con/sin foto curación |
| **BookingStatusBadge** | Estado de la reserva | confirmed, completed, cancelled, no-show |
| **ChatMessage** | Burbuja del chatbot | Usuario, sistema, con input |

### 5.2 Patrones de Navegación

- **Header global:** Logo, navegación principal (Vitrina, Artistas, Mapa), buscador, botón login/avatar
- **Mobile:** Bottom navigation bar con iconos (Home, Buscar, Mapa, Cuenta)
- **Breadcrumbs:** En páginas de detalle (Artistas > [Nombre del Artista])
- **Back navigation:** Botón "volver" en flujos lineales (cotización, reserva)

### 5.3 Responsive Breakpoints

| Breakpoint | Dispositivo | Consideraciones |
|---|---|---|
| < 576px | Mobile | Bottom nav, tarjetas full-width, chatbot fullscreen |
| 576–768px | Tablet portrait | 2 columnas de tarjetas |
| 768–1024px | Tablet landscape | Filtros laterales colapsables |
| > 1024px | Desktop | Layout completo, filtros siempre visibles |

---

## 6. Estados y Notificaciones

### 6.1 Estados de una Reserva (State Machine)

```
[pending_payment] ──pago OK──→ [confirmed] ──cliente confirma asistencia──→ [completed]
       │                             │                                            │
       │ (TTL 5min expira)           │ (cancelación)                             │
       ↓                             ↓                                            ↓
  [expired]                    [cancelled]                                   [review]
                                     │
                              [no_show] (artista marca)
```

### 6.2 Notificaciones (por canal)

| Evento | Email | Push/In-app | SMS |
|---|---|---|---|
| Reserva confirmada | ✅ | ✅ | ✅ |
| Recordatorio 24h antes | ✅ | ✅ | — |
| Cancelación | ✅ | ✅ | — |
| Pago procesado/reembolsado | ✅ | ✅ | — |
| Nueva reseña recibida (artista) | ✅ | ✅ | — |
| Solicitud foto curación (90 días) | ✅ | ✅ | — |
| Certificación por expirar | ✅ | ✅ | — |

---

## 7. Información Adicional para Diseño

### 7.1 Paleta de Contenido

- **12 estilos de tatuaje:** Realismo, Tradicional, Blackwork, Fine-line, Japonés, Lettering, Neotradicional, Acuarela, Geométrico, Minimalista, Dotwork, Tribal
- **4 dimensiones de reseña:** Higiene, Manejo del dolor, Trato al cliente, Resultado
- **3 tipos de certificación:** Sanitaria, Bioseguridad, Municipal
- **3 tipos de relación con marcas:** Embajador, Auspiciado, Certificado
- **3 políticas de cancelación:** 24h, 48h, 72h antes de la cita
- **Moneda:** CLP (Peso chileno) — sin decimales

### 7.2 Localización

- **Idioma:** Español (Chile)
- **Zona horaria:** America/Santiago
- **Formato de teléfono:** +56 9 XXXX XXXX
- **Formato de precio:** $XX.XXX (separador de miles con punto)
- **Comunas:** Santiago y alrededores (expansible)

### 7.3 Tono de la Marca

- Moderno, directo, confiable
- Visual: oscuro/elegante con acentos de color
- Fotografía real de tatuajes como protagonista
- Lenguaje cercano pero profesional (tuteo chileno)

---

## 8. Páginas Secundarias / Informativas

| Página | Contenido |
|---|---|
| `/nosotros` | Qué es INK·LINK, equipo, misión |
| `/como-funciona` | Explicación paso a paso para clientes y artistas |
| `/terminos` | Términos y condiciones |
| `/privacidad` | Política de privacidad |
| `/faq` | Preguntas frecuentes (clientes + artistas) |
| `/contacto` | Formulario de contacto / soporte |
| `/para-artistas` | Landing de captación de artistas con beneficios |
| `/para-marcas` | Landing de oportunidades publicitarias para marcas |

---

## 9. Resumen de Pantallas a Diseñar

### Cliente (público / logueado)
1. Home / Vitrina
2. Listado de artistas (con filtros)
3. Mapa interactivo
4. Perfil del artista
5. Chatbot cotizador
6. Selección de slot (calendario)
7. Resumen de reserva
8. Retorno de pago (éxito/error)
9. Login
10. Registro
11. Mi cuenta (datos personales)
12. Mis reservas (listado)
13. Detalle de reserva
14. Formulario de reseña
15. Subida de foto de curación

### Tatuador
16. Dashboard del artista
17. Edición de perfil
18. Gestión de portafolio
19. Configuración de tarifas
20. Configuración de agenda/disponibilidad
21. Bloqueo de fechas
22. Listado de reservas entrantes
23. Detalle de reserva (con acciones)
24. Mis reseñas + responder
25. Estadísticas / Analytics
26. Gestión de certificaciones

### Admin
27. Dashboard de métricas
28. Gestión de artistas
29. Gestión de usuarios
30. Moderación de reseñas
31. Gestión de marcas/auspicios

### Informativas
32. Cómo funciona
33. Para artistas (landing captación)
34. Para marcas (landing comercial)
35. FAQ
36. Contacto

---

*Documento generado el 2026-07-17 como base para prototipado de diseño.*
