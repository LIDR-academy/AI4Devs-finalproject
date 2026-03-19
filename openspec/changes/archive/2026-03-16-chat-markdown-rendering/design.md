## Context

El Dashboard Admin (`apps/web-admin/`) muestra mensajes de conversaciones en el componente `ChatBubble` (`src/components/chat/chat-bubble.tsx`). Actualmente renderiza `message.content` como texto plano en JSX (`{message.content}`), lo que hace que la sintaxis Markdown sea visible como texto literal en lugar de formateada.

El Worker (`apps/worker/`) ya emite Markdown estándar en algunos builders (p. ej. `buildAddressProposalMessage` usa `**${addressText}**`), pero otros builders como `processInformationJourney`, `buildConfirmationRequest` o `buildSyncSuccessMessage` aún no usan Markdown. El resultado es inconsistencia: algunos mensajes en DynamoDB tienen formato enriquecido y otros no.

El campo `content: string` de DynamoDB no cambia de esquema. Solo cambia el contenido que el Worker escribe — pasa a ser Markdown estándar consistente — y la forma en que el frontend lo lee y renderiza.

Stakeholders afectados: el administrador que usa el Dashboard Admin para revisar conversaciones y el usuario final que ve las burbujas en la pantalla de simulación.

## Goals / Non-Goals

**Goals:**
- Renderizar Markdown estándar (`**bold**`, `_italic_`, `~~del~~`, listas, blockquotes, `\n` como `<br>`) en las burbujas `assistant` y `user` del `ChatBubble`
- Garantizar que todos los messages builders del Worker emitan Markdown consistente para que `content` en DynamoDB quede en el formato correcto desde el momento de escritura
- Mantener retrocompatibilidad total con mensajes ya almacenados (texto plano o Markdown parcial)
- Mantener los mensajes `system` con su tratamiento visual actual (centrados, cursiva) sin cambios

**Non-Goals:**
- Soporte de sintaxis Markdown específica de WhatsApp (`*bold*` con asterisco simple) — se usa Markdown estándar que es compatible con el campo `content` tal como está
- Añadir un editor de texto enriquecido en el textarea de simulación — el usuario escribe texto plano o Markdown libremente
- Sanitización HTML extra — `react-markdown` usa JSX puro, no `dangerouslySetInnerHTML`, por lo que no hay riesgo XSS
- Cambios en la API NestJS, Redis, esquema Prisma o `packages/shared-types`
- Migración de mensajes existentes en DynamoDB — la retrocompatibilidad lo hace innecesario

## Decisions

### D1: `react-markdown` + `remark-gfm` + `remark-breaks` en lugar de un parser manual

**Decisión**: usar `react-markdown` con los plugins `remark-gfm` y `remark-breaks`.

**Alternativas consideradas**:
- **Parser manual** (regex sobre el string): ~50 líneas, cero dependencias, pero frágil ante casos borde (asteriscos en medio de palabras, anidamiento, caracteres especiales). El Worker usa `**bold**` y también emite respuestas del LLM (`gpt-4o-mini`) que pueden incluir Markdown variado.
- **`react-markdown` sin plugins**: No convierte `\n` simple en `<br>`. El Worker usa `\n` en varios builders; sin `remark-breaks` estos saltos de línea desaparecerían.
- **`dangerouslySetInnerHTML` con `marked`**: Introduce vector XSS. Descartado.

**Por qué `react-markdown`**: librería madura (>12M descargas/semana), produce JSX nativo, no usa `dangerouslySetInnerHTML`, funciona correctamente con React 19 y Next.js 16. `remark-breaks` es esencial porque el Worker usa `\n` (salto simple) además de `\n\n` (párrafos).

**Por qué `remark-gfm`**: el Worker usa `~~tachado~~` en el futuro potencial; el LLM puede emitir tablas o listas de tarea. Añade < 10 KB y es estándar en cualquier stack que renderiza Markdown.

### D2: Componente `MarkdownMessage` separado con `React.memo`

**Decisión**: crear `src/components/chat/markdown-message.tsx` como componente independiente, no modificar `ChatBubble` directamente con la lógica de `react-markdown`.

**Por qué**: `ChatBubble` ya tiene lógica de presentación (colores, avatar, timestamp). Mezclar la configuración de plugins y `components` de Markdown haría el componente difícil de mantener. `MarkdownMessage` es reutilizable y testeable de forma aislada. `React.memo` evita re-renders innecesarios en listas largas.

### D3: `components` personalizados — sin headings visualmente grandes

**Decisión**: redirigir `h1`, `h2`, `h3` a `<p className="font-semibold">` en lugar de renderizarlos con el tamaño por defecto.

**Por qué**: el LLM puede responder con headings (`# Título`) que en una burbuja de chat resultan visualmente desproporcionados. En contexto conversacional no tienen semántica de sección de documento.

Mapeo de componentes:
- `p` → `<span className="block mb-2 last:mb-0">` (no `<p>` para evitar doble margin en Markdown que ya envuelve en párrafos)
- `strong` → `<strong className="font-semibold">`
- `em` → `<em className="italic">`
- `del` → `<del className="line-through opacity-70">`
- `code` (inline) → `<code className="font-mono text-xs bg-black/10 rounded px-1 py-0.5">`
- `ul` → `<ul className="list-disc pl-4 space-y-0.5 mb-2">`
- `ol` → `<ol className="list-decimal pl-4 space-y-0.5 mb-2">`
- `blockquote` → `<blockquote className="border-l-2 border-current pl-2 opacity-60 italic mb-2">`
- `h1`, `h2`, `h3` → `<p className="font-semibold mb-1">`
- `a` → `<a className="underline" target="_blank" rel="noopener noreferrer">`

### D4: `colorScheme` prop para adaptar estilos al fondo del bubble

**Decisión**: `MarkdownMessage` recibe `colorScheme: 'light' | 'dark'`. El bubble `assistant` usa `colorScheme="light"` (fondo `bg-gray-100`); el bubble `user` usa `colorScheme="dark"` (fondo `bg-brand-teal`).

**Por qué**: el `code` inline usa `bg-black/10` como fondo, que funciona sobre gris claro y sobre teal; no se necesita lógica adicional. Si en el futuro se necesita diferenciación mayor, la prop ya está en la interfaz.

### D5: Markdown consistente en el Worker — solo los builders que producen mensajes estructurados

**Decisión**: actualizar únicamente los builders que presentan datos clave al usuario y que actualmente no usan Markdown. No reformatear los builders de mensajes cortos o de error que son texto plano.

Builders a actualizar:
- `processInformationJourney`: añadir `**#${orderNumber}**`, `**${order.store.name}**`, `📍 **Dirección de entrega:**` con el valor en la línea siguiente
- `buildConfirmationRequest`: `📍 **${addr}**` en lugar de `📍 ${addr}`
- `buildSyncSuccessMessage`: `📍 **${addr}**`, `**${storeName}**`
- `buildBuildingDetailsRequest`: `📍 **${addr}**`
- `buildRegistrationOfferMessage`: sin cambios estructurales — es texto narrativo continuo; Markdown no aporta valor

**Por qué no `buildRegistrationOfferMessage`**: es un párrafo de texto natural. Añadir negrita en partes ("registrarte en Adresles") sería arbitrario y no mejora la experiencia.

### D6: Tests del Worker — actualizar strings, no la lógica

**Decisión**: actualizar los strings esperados en `conversation.processor.spec.ts` para que incluyan la sintaxis Markdown añadida. No cambiar la lógica de mock ni la estructura de los tests.

**Por qué**: los tests verifican el contenido de los mensajes enviados a DynamoDB y publicados en Redis. Si los builders cambian el formato del string, los tests deben reflejar el nuevo valor. Esto es un ajuste de datos de prueba, no un cambio de comportamiento.

## Risks / Trade-offs

- **[Riesgo] Mensajes del LLM con Markdown no anticipado** → `react-markdown` lo renderizará tal cual (tablas, listas, etc.). Esto es deseable, no un bug. El único caso problemático sería Markdown malformado, pero `react-markdown` es tolerante a fallos y lo renderiza como texto.

- **[Riesgo] Tests del Worker que verifican strings exactos fallan tras el cambio** → Mitigación: los tests se actualizan en la misma tarea de implementación. El patrón `conversation-message-single-writer` (memory-bank) no se ve afectado — la regla de "quién escribe el mensaje" no cambia.

- **[Trade-off] +3 dependencias en `apps/web-admin/`** → `react-markdown` (~30 KB), `remark-gfm` (~10 KB) y `remark-breaks` (~2 KB) tree-shaken. Impacto mínimo en bundle. La alternativa (parser manual) tiene mayor riesgo de regresión con las respuestas del LLM.

- **[Riesgo] Mensajes históricos en DynamoDB con texto plano** → Retrocompatibilidad garantizada: texto plano sin Markdown se renderiza idéntico a través de `react-markdown`.

## Migration Plan

No hay migración de datos en DynamoDB. El despliegue es en dos pasos independientes que pueden desplegarse en cualquier orden:

1. **Frontend** (`apps/web-admin/`): instalar dependencias + crear `MarkdownMessage` + actualizar `ChatBubble`. El componente renderiza Markdown si existe y texto plano si no — compatible con mensajes históricos sin Markdown. Despliegue en Vercel (rama `main`).

2. **Worker** (`apps/worker/`): actualizar builders + tests. Los nuevos mensajes se almacenan en DynamoDB con Markdown. El Frontend ya los renderiza correctamente. Despliegue vía Docker + ECR + GitHub Actions.

**Rollback**: independiente por app. Si el frontend presenta problemas visuales, se revierte el commit del frontend sin afectar al Worker. Si el Worker presenta problemas en los builders, se revierte el commit del Worker; el frontend degradaría a mostrar los asteriscos literales (estado anterior).

## Open Questions

- ¿Se quiere añadir Markdown a `buildRegistrationOfferMessage` y `buildRegistrationDeclinedMessage`? Actualmente son texto narrativo; se han excluido por ser mensajes conversacionales cortos.
- ¿Debe el componente `MarkdownMessage` aplicarse también a los mensajes `system` en el futuro? Actualmente se mantiene el tratamiento existente (texto centrado en cursiva).
