# UI/UX Audit Report - TravelSplit Frontend

**Fecha:** 2026-01-05  
**Auditor:** Architect UI/X  
**Alcance:** Auditoría completa de componentes frontend, estilos Tailwind y consistencia visual según DESIGN_SYSTEM_GUIDE.md

## Resumen

- 🔴 **Críticos:** 2 issues
- 🟠 **Altos:** 4 issues
- 🟡 **Medios:** 6 issues
- 🟢 **Bajos:** 2 issues

**Total:** 14 issues encontrados

---

## 🔴 Issues Críticos

### 1. Router Duplicado y Potencial Conflicto

> 🔴 **Architecture Issue:** Router definido en dos lugares diferentes (`App.tsx` y `routes/index.tsx`), creando confusión y potencial conflicto

**Location:** `Frontend/src/routes/index.tsx` (archivo completo) y `Frontend/src/App.tsx` alrededor de línea 46

**Description:**
El router está definido en dos lugares:
1. `routes/index.tsx` - Router exportado a nivel de módulo (líneas 11-44)
2. `App.tsx` - Router creado dentro del componente usando `useMemo` (líneas 46-88)

El router en `routes/index.tsx` nunca se usa porque `App.tsx` crea su propio router. Esto crea confusión y código muerto. Además, si alguien importa el router de `routes/index.tsx` en el futuro, podría causar problemas porque se crea antes de que el AuthProvider esté disponible.

**Impact:**
- Código duplicado y confuso
- Mantenimiento difícil (dos lugares para actualizar rutas)
- Riesgo de usar el router incorrecto que no tiene acceso al Context
- Archivo innecesario que puede causar errores si se importa accidentalmente

**Fix Prompt:**
Eliminar el archivo `Frontend/src/routes/index.tsx` completamente ya que no se está usando. El router correcto está en `App.tsx` y se crea correctamente dentro del componente con `useMemo`, después de que el AuthProvider esté disponible. Verificar que no haya imports de este archivo en ningún lugar del código y eliminarlo.

---

### 2. Header No Sigue Design System Guide

> 🔴 **UI Issue:** Header usa colores y estilos que no coinciden con el Design System Guide (gray en lugar de slate, max-w-7xl en lugar de max-w-md, estructura desktop en lugar de mobile-first)

**Location:** `Frontend/src/components/organisms/Header.tsx` alrededor de líneas 10-30

**Description:**
El componente Header usa:
- `bg-gray-200` y `text-gray-900` en lugar de `slate-*` según el Design System
- `max-w-7xl` (desktop) en lugar de `max-w-md` (mobile-first)
- Estructura de navegación desktop con `space-x-4` en lugar de diseño mobile-first
- No sigue el patrón de "Modern Friendly" con bordes redondeados generosos

**Impact:**
Inconsistencia visual con el resto de la aplicación. El Header se ve como un componente de escritorio en una aplicación mobile-first, rompiendo la coherencia del diseño. Los usuarios verán una interfaz inconsistente.

**Fix Prompt:**
En `Frontend/src/components/organisms/Header.tsx`, reemplazar:
- `bg-gray-200` por `bg-white` o `bg-slate-50`
- `text-gray-900` por `text-slate-900`
- `text-gray-700` por `text-slate-700`
- `max-w-7xl` por `max-w-md` para mobile-first
- `space-x-4` por estructura mobile-friendly
- Agregar `rounded-xl` o `rounded-2xl` a elementos según Design System Guide
- Asegurar que el header sea mobile-first y consistente con el resto de la aplicación

---

## 🟠 Issues de Alta Prioridad

### 3. HomePage No Sigue Design System Guide

> 🟠 **UI Issue:** HomePage usa `bg-gray-50` y `text-gray-900` en lugar de tokens del Design System (`slate-50`, `slate-900`)

**Location:** `Frontend/src/pages/HomePage.tsx` alrededor de líneas 8-16

**Description:**
La página HomePage usa colores `gray-*` en lugar de `slate-*` definidos en el Design System Guide. También usa `text-4xl` sin la fuente `font-heading` especificada en el Design System.

**Impact:**
Inconsistencia visual con el resto de la aplicación. Los usuarios verán colores diferentes que no coinciden con el sistema de diseño establecido.

**Fix Prompt:**
En `Frontend/src/pages/HomePage.tsx` línea 8, cambiar `bg-gray-50` por `bg-slate-50`. En línea 12, cambiar `text-gray-900` por `text-slate-900` y agregar `font-heading`. En línea 13, cambiar `text-gray-600` por `text-slate-600`. Asegurar que todos los colores usen los tokens del Design System (`slate-*`, `violet-*`, `emerald-*`, `red-*`).

---

### 4. GET Request con Content-Type Header Innecesario

> 🟠 **Architecture Issue:** GET requests incluyen header `Content-Type: application/json` innecesario, ya que GET no tiene request body

**Location:** `Frontend/src/services/trip.service.ts` alrededor de líneas 20-26 y 53-59

**Description:**
Las funciones `getTripById` y `getUserTrips` incluyen el header `'Content-Type': 'application/json'` en requests GET. Los requests GET no tienen body, por lo que este header es innecesario y agrega overhead.

**Impact:**
Aunque no rompe funcionalidad, viola las mejores prácticas HTTP y agrega overhead innecesario. Hace el código menos mantenible y puede confundir a desarrolladores que esperan headers mínimos y apropiados para cada método HTTP.

**Fix Prompt:**
En `Frontend/src/services/trip.service.ts`, eliminar la línea `'Content-Type': 'application/json'` de los headers en:
- Función `getTripById` (línea 23)
- Función `getUserTrips` (línea 56)
Mantener solo el header `Authorization` en ambos casos. Los headers deben quedar como: `{ Authorization: \`Bearer ${token}\` }`.

---

### 5. Falta Estado Disabled Explícito en PayerSelector

> 🟠 **Architecture Issue:** El select de PayerSelector no tiene estado `:disabled` explícito definido, solo `active:bg-slate-50`

**Location:** `Frontend/src/components/molecules/PayerSelector.tsx` alrededor de línea 30

**Description:**
El componente `PayerSelector` usa un `<select>` nativo que tiene estados `hover`, `focus`, y `active`, pero no tiene un estado `:disabled` explícito definido. Aunque el elemento puede estar deshabilitado mediante el atributo `disabled`, no hay estilos visuales específicos para ese estado.

**Impact:**
Si el selector se deshabilita en el futuro (por ejemplo, durante la carga o cuando no hay participantes), los usuarios no tendrán feedback visual claro de que el elemento está deshabilitado. Esto afecta la accesibilidad y la experiencia de usuario.

**Fix Prompt:**
En `Frontend/src/components/molecules/PayerSelector.tsx` alrededor de línea 30, agregar estilos para el estado `disabled` en la clase del select. Agregar `disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100` a la lista de clases. El className completo debe incluir: `... disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100` después de `transition-colors`.

---

### 6. BeneficiariesSelector Falta Prop onAddByEmail en Interface

> 🟠 **Architecture Issue:** La interface `BeneficiariesSelectorProps` no incluye las props `onAddByEmail` y `onInviteByEmail` que se usan en el componente

**Location:** `Frontend/src/components/molecules/BeneficiariesSelector.tsx` alrededor de líneas 5-12

**Description:**
La interface `BeneficiariesSelectorProps` define `onToggle`, `onSelectAll`, `onDeselectAll`, y `error`, pero el componente usa `onAddByEmail` y `onInviteByEmail` en las líneas 26-27 y 63-70 sin que estén definidas en la interface. TypeScript no detectará errores si estas props no se pasan.

**Impact:**
Falta de type safety. Si alguien usa el componente sin pasar `onAddByEmail` o `onInviteByEmail`, TypeScript no mostrará un error, pero el componente podría fallar en runtime. Esto hace el código menos seguro y más propenso a errores.

**Fix Prompt:**
En `Frontend/src/components/molecules/BeneficiariesSelector.tsx` alrededor de líneas 5-12, agregar a la interface `BeneficiariesSelectorProps`:
```typescript
onAddByEmail?: (userId: string) => void;
onInviteByEmail?: (email: string) => void;
```
Estas props deben ser opcionales (`?`) ya que el componente las usa condicionalmente (línea 63 verifica `onAddByEmail || onInviteByEmail`).

---

## 🟡 Issues de Prioridad Media

### 7. HomePage Texto No Usa Font-Heading

> 🟡 **UI Issue:** El título en HomePage no usa `font-heading` especificado en el Design System Guide

**Location:** `Frontend/src/pages/HomePage.tsx` alrededor de línea 12

**Description:**
El `<h1>` en HomePage usa `text-4xl font-bold` pero no incluye `font-heading` que está definido en el Design System Guide para headings. El Design System especifica que los headings deben usar 'Plus Jakarta Sans'.

**Impact:**
Inconsistencia tipográfica. Los headings no seguirán la fuente especificada en el Design System, rompiendo la coherencia visual del proyecto.

**Fix Prompt:**
En `Frontend/src/pages/HomePage.tsx` línea 12, agregar `font-heading` a la clase del `<h1>`. Cambiar de `text-4xl font-bold text-gray-900` a `text-4xl font-heading font-bold text-slate-900` (también corregir el color a `slate-900`).

---

### 8. Input Falta Estado Hover Explícito

> 🟡 **Architecture Issue:** El componente Input tiene `hover:border-slate-400` pero no tiene estados `:active` y `:disabled` explícitos para todos los casos

**Location:** `Frontend/src/components/atoms/Input.tsx` alrededor de línea 25

**Description:**
El componente Input tiene estados `focus`, `focus-visible`, y `hover`, pero el estado `:active` no está explícitamente definido (aunque puede heredar comportamiento del navegador). El estado `:disabled` tampoco está explícitamente definido en la clase.

**Impact:**
Falta de feedback visual completo para todos los estados de interacción. Aunque no es crítico, afecta la consistencia y la experiencia de usuario, especialmente en dispositivos táctiles donde el estado `:active` es importante.

**Fix Prompt:**
En `Frontend/src/components/atoms/Input.tsx` alrededor de línea 25, agregar `active:bg-slate-50` y `disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100` a la lista de clases del input. Estos estados deben aplicarse tanto para el estado normal como para el estado de error.

---

### 9. Button Falta Estado Active Explícito para Variant Secondary

> 🟡 **Architecture Issue:** El componente Button tiene `active:bg-violet-800` para variant primary pero no tiene `active:` explícito para variant secondary y danger

**Location:** `Frontend/src/components/atoms/Button.tsx` alrededor de líneas 26-29

**Description:**
El variant `primary` tiene `active:bg-violet-800` definido, pero los variants `secondary` y `danger` no tienen estados `:active` explícitos. Solo tienen `hover:` definido.

**Impact:**
Inconsistencia en los estados de interacción. Los botones secundarios y de peligro no proporcionan feedback visual cuando se presionan, especialmente importante en dispositivos táctiles.

**Fix Prompt:**
En `Frontend/src/components/atoms/Button.tsx` alrededor de líneas 26-29, agregar estados `active:` para los variants:
- `secondary`: agregar `active:bg-slate-400`
- `danger`: agregar `active:bg-red-700`
Esto asegura feedback visual consistente en todos los variants del botón.

---

### 10. EmailSearchInput Falta Validación de Duplicados en Tiempo Real

> 🟡 **Architecture Issue:** EmailSearchInput valida duplicados solo al hacer clic en buscar, no mientras el usuario escribe

**Location:** `Frontend/src/components/molecules/EmailSearchInput.tsx` alrededor de líneas 51-54

**Description:**
La validación de emails duplicados (`existingEmails.includes(trimmedEmail)`) solo se ejecuta cuando el usuario hace clic en el botón de búsqueda o presiona Enter. No hay validación en tiempo real mientras el usuario escribe, lo que podría mostrar feedback más temprano.

**Impact:**
Experiencia de usuario subóptima. Los usuarios deben escribir el email completo y hacer clic en buscar para saber si el email ya está en la lista. El feedback podría ser más inmediato.

**Fix Prompt:**
En `Frontend/src/components/molecules/EmailSearchInput.tsx`, agregar validación en tiempo real en el `onChange` del Input (alrededor de línea 125). Cuando el email cambie, verificar si `existingEmails.includes(email.trim().toLowerCase())` y mostrar un error inmediatamente si es duplicado. Esto proporciona feedback más rápido al usuario.

---

### 11. ExpenseForm Falta Manejo de Error Más Específico

> 🟡 **Architecture Issue:** El componente ExpenseForm muestra el error genérico sin limpiar mensajes técnicos del backend

**Location:** `Frontend/src/components/molecules/ExpenseForm.tsx` alrededor de líneas 202-206

**Description:**
El componente ExpenseForm recibe un `error` como string y lo muestra directamente sin limpiar mensajes técnicos del backend. A diferencia de `LoginPage` y `RegisterPage` que limpian los mensajes, este componente no lo hace.

**Impact:**
Los usuarios podrían ver mensajes técnicos del backend como "Validation failed" o "must be a string" en lugar de mensajes amigables. Esto rompe la consistencia con el resto de la aplicación.

**Fix Prompt:**
En `Frontend/src/components/molecules/ExpenseForm.tsx` alrededor de líneas 202-206, antes de mostrar el error, limpiar el mensaje eliminando partes técnicas. Crear una función helper o usar la misma lógica que en `LoginPage.tsx` (líneas 67-69) para limpiar mensajes: `error.split('must be')[0].split('should not be')[0].trim()`. Si el error está vacío después de limpiar, usar un mensaje por defecto amigable como "Ocurrió un error al guardar el gasto. Por favor verifica los datos e intenta nuevamente."

---

### 12. HomePage Estructura No Sigue Patrón Mobile-First

> 🟡 **UI Issue:** HomePage usa estructura centrada con `min-h-[calc(100vh-4rem)]` que asume un header de 4rem, pero el Header real puede tener altura diferente

**Location:** `Frontend/src/pages/HomePage.tsx` alrededor de línea 10

**Description:**
La HomePage calcula la altura mínima restando `4rem` (64px) del viewport, asumiendo que el Header tiene esa altura. Sin embargo, esto crea un acoplamiento frágil entre componentes. Además, la estructura no sigue completamente el patrón mobile-first del Design System.

**Impact:**
Si el Header cambia de altura, la HomePage se verá desalineada. La estructura no es flexible y no sigue completamente el patrón mobile-first establecido en el Design System Guide.

**Fix Prompt:**
En `Frontend/src/pages/HomePage.tsx`, simplificar la estructura para que sea más flexible. En lugar de `min-h-[calc(100vh-4rem)]`, usar `min-h-screen` y dejar que el layout natural maneje el espaciado. Asegurar que el contenedor principal use `max-w-md mx-auto` para mobile-first según el Design System Guide. Considerar usar `pb-24` para espacio del BottomTabBar si es necesario.

---

## 🟢 Issues de Prioridad Baja

### 13. BeneficiariesSelector Texto de Error Usa Color Diferente

> 🟢 **UI Issue:** El mensaje de error en BeneficiariesSelector usa `text-red-500` mientras otros componentes usan `text-red-600` para consistencia

**Location:** `Frontend/src/components/molecules/BeneficiariesSelector.tsx` alrededor de línea 99

**Description:**
El componente muestra errores con `text-red-500`, mientras que otros componentes como `Input.tsx` (línea 33) y `PayerSelector.tsx` (línea 43) usan `text-red-500` también, pero algunos usan `text-red-600`. Hay una pequeña inconsistencia en los tonos de rojo usados para errores.

**Impact:**
Inconsistencia visual menor. Los mensajes de error no usan exactamente el mismo tono de rojo en todos los componentes, aunque la diferencia es sutil.

**Fix Prompt:**
Revisar todos los componentes y estandarizar el color de error. Recomendación: usar `text-red-600` para mensajes de error en todos los componentes para mayor consistencia. Actualizar `BeneficiariesSelector.tsx` línea 99, `Input.tsx` línea 33, `PayerSelector.tsx` línea 43, y cualquier otro componente que muestre errores para usar `text-red-600` consistentemente.

---

### 14. CategorySelector Comentarios Excesivos en Código

> 🟢 **Architecture Issue:** CategorySelector tiene comentarios muy detallados en el código que podrían estar en documentación externa

**Location:** `Frontend/src/components/molecules/CategorySelector.tsx` alrededor de líneas 43-50

**Description:**
El componente tiene comentarios muy extensos explicando el comportamiento del scroll (líneas 43-50). Aunque son informativos, estos comentarios hacen el código más largo y podrían estar mejor en la documentación del componente o en el Design System Guide.

**Impact:**
Código más largo y difícil de leer. Los comentarios son útiles pero podrían estar mejor organizados en documentación externa o en comentarios JSDoc más concisos.

**Fix Prompt:**
En `Frontend/src/components/molecules/CategorySelector.tsx`, simplificar los comentarios en línea (líneas 43-50) a comentarios más concisos. Mover la explicación detallada del comportamiento de scroll a un comentario JSDoc en la parte superior del componente o a la documentación del Design System Guide. Mantener solo comentarios esenciales que expliquen decisiones no obvias.

---

## Recomendaciones Adicionales

### Mejoras Sugeridas (No Críticas)

1. **Consistencia de Colores:** Revisar todos los componentes para asegurar que usen los tokens del Design System (`slate-*`, `violet-*`, `emerald-*`, `red-*`) en lugar de `gray-*`.

2. **Tipografía:** Asegurar que todos los headings usen `font-heading` y todos los textos de cuerpo usen `font-body` (o la fuente por defecto que es Inter).

3. **Estados de Interacción:** Crear una guía de estados estándar para todos los componentes interactivos (hover, active, focus-visible, disabled) y aplicarla consistentemente.

4. **Mensajes de Error:** Centralizar la lógica de limpieza de mensajes de error del backend en una función utility compartida para evitar duplicación.

5. **Type Safety:** Revisar todas las interfaces para asegurar que todas las props usadas estén definidas, especialmente props opcionales.

---

## Conclusión

La aplicación tiene una base sólida con buena estructura de componentes y uso correcto de React Context. Los principales problemas encontrados son:

1. **Inconsistencias de diseño:** Uso de colores `gray-*` en lugar de `slate-*` del Design System
2. **Código duplicado:** Router definido en dos lugares
3. **Headers HTTP:** Uso innecesario de `Content-Type` en requests GET
4. **Estados de interacción:** Falta de estados explícitos en algunos componentes
5. **Type safety:** Props faltantes en algunas interfaces

Se recomienda priorizar la corrección de los issues críticos (🔴) y de alta prioridad (🟠) antes de continuar con el desarrollo de nuevas features.

---

**Fin del Reporte**


