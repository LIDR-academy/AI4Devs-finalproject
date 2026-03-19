## MODIFIED Requirements

### Requirement: Reproductor de conversación tipo burbuja
La página `/conversations/[conversationId]` SHALL obtener los mensajes vía `GET /api/admin/conversations/:id/messages` (Server Component) y renderizarlos como burbujas de chat.

**Header de la página** (`bg-brand-black text-white`):
```
← Pedido #[externalOrderNumber]    [conversationType badge]    [status badge]
Iniciada: [startedAt] · Completada: [completedAt o "En curso"]
```
- El botón `← Pedido` usa `<Link href="/orders">` + clase `text-brand-teal hover:underline`
- `conversationType` valores: `GET_ADDRESS`, `INFORMATION`, `REGISTER`, `GIFT_NOTIFICATION`, `SUPPORT`

**Wireframe del área de mensajes:**
```
┌─────────────────────────────────────────────────────────────┐
│ bg-brand-black text-white px-6 py-4  (header)               │
│ ← Pedido #1001       [GET_ADDRESS]    [● COMPLETED verde]   │
│ Iniciada: 21 Feb 2026, 10:01 · Completada: 10:05            │
├─────────────────────────────────────────────────────────────┤
│ ⚠ [banner #DBFF36] expira el 22 May 2026       (sticky top) │
├─────────────────────────────────────────────────────────────┤
│ bg-white overflow-y-auto flex-1 px-6 py-4 space-y-4         │
│                                                             │
│  🤖│ Hola! Para procesar tu pedido necesito               │
│    │ tu dirección de entrega.                              │
│      10:01                                                  │
│                                                             │
│          Calle Mayor 5, Madrid 28013  │👤                   │
│                              10:02                          │
│                                                             │
│  🤖│ He encontrado la dirección en Google Maps.           │
│    │ ¿Confirmas: **Calle Mayor 5, 28013 Madrid**?         │
│      10:03                                                  │
│                                                             │
│                                   Sí  │👤                   │
│                              10:04                          │
│                                                             │
│  🤖│ Perfecto! Dirección confirmada ✓                     │
│      10:05                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Burbujas por rol:**
- `assistant` → alineado izquierda; `bg-gray-100 rounded-chat rounded-tl-sm border-l-2 border-brand-teal text-gray-900`; avatar `Bot` (`bg-brand-teal/10`); el `content` SHALL renderizarse como Markdown estándar mediante `MarkdownMessage` con `colorScheme="light"`
- `user` → alineado derecha; `bg-brand-teal rounded-chat rounded-tr-sm text-white`; avatar `User` (`bg-gray-100`); el `content` SHALL renderizarse como Markdown estándar mediante `MarkdownMessage` con `colorScheme="dark"`
- `system` → centrado; `text-xs italic text-gray-400`; separadores `<div className="h-px flex-1 bg-gray-200">`; el `content` se renderiza como texto plano sin cambios

Timestamps: `<time dateTime={timestamp}>` — `text-xs text-gray-400` (assistant) / `text-xs text-white/60` (user).

La vista SHALL hacer scroll automático al último mensaje al cargar (`useEffect` + `ref` en el elemento `role="log"`).

#### Scenario: Mensajes renderizados como burbujas
- **WHEN** el usuario accede a `/conversations/conv-uuid` con mensajes disponibles
- **THEN** se muestran burbujas diferenciadas: assistant a la izquierda (gris, borde teal), user a la derecha (teal), system centrado (itálico)

#### Scenario: Contenido Markdown renderizado en burbuja de asistente
- **WHEN** un mensaje `assistant` contiene `**dirección**` en su `content`
- **THEN** la burbuja muestra la dirección en negrita, sin mostrar los asteriscos literales

#### Scenario: Texto plano sin Markdown en burbuja de asistente
- **WHEN** un mensaje `assistant` contiene texto plano sin sintaxis Markdown
- **THEN** la burbuja muestra el texto exactamente como si fuera texto plano (retrocompatibilidad)

#### Scenario: Scroll automático al último mensaje
- **WHEN** la página carga con mensajes
- **THEN** el scroll se posiciona automáticamente en el último mensaje visible

#### Scenario: Banner de expiración cuando TTL < 7 días
- **WHEN** el `expiresAt` del primer mensaje es menor que `Date.now() + 7 días`
- **THEN** se muestra el banner `bg-brand-lime text-brand-black` con icono `Clock` y la fecha exacta de expiración (`formatExpiryDate(expiresAt)`)

#### Scenario: Sin banner cuando TTL > 7 días
- **WHEN** el `expiresAt` del primer mensaje es mayor que `Date.now() + 7 días`
- **THEN** el banner NO se muestra (componente retorna `null`)

#### Scenario: Error 404 al acceder a conversación inexistente
- **WHEN** se accede a `/conversations/id-inexistente` y la API devuelve 404
- **THEN** se muestra el error boundary (`error.tsx`) con mensaje amigable y enlace de vuelta a `/orders`
