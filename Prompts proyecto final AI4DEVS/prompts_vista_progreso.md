# Prompts - Sprint 3: Proximidad y Gamificación

· Prompt 1 (Claude Opus 4.5):

@workspace
## Rol

Eres un desarrollador senior de aplicaciones móviles, experto en React Native, Expo Router, TypeScript, Zustand, Google Maps y Geolocalización.

## Objetivo

Implementar el **sistema completo de detección de proximidad, desbloqueo de medallas, pantalla de progreso y galería de colección** para Salmantour (TFG de aplicación móvil gamificada para descubrimiento de lugares en Salamanca), siguiendo las especificaciones técnicas documentadas en `docs/sprint_tasks/SPRINT_3_TASKS.md` y las User Stories en `docs/USER_STORIES.md`.

Este sprint implementa las **mecánicas core de gamificación** de la aplicación: detección automática de proximidad a lugares, desbloqueo de medallas, visualización de progreso personal y galería de colección.

## Contexto del Proyecto

**Stack:** React Native + Expo (SDK 53), TypeScript, Zustand, Supabase (Auth + PostgreSQL), Expo Router, Google Maps, expo-location

**Estado actual (Sprint 1 + Sprint 2 completados):**

### Sprint 1 (TASK-001 a TASK-027):
- Setup completo de Supabase con cliente configurado
- Base de datos implementada con tablas: `public.users`, `public.categories`, `public.medals`, `public.user_medals`, `public.favorites`, `public.friendships`
- Sistema de autenticación completo (login, signup, logout)
- AuthStore con Zustand implementado
- Protección de rutas y persistencia de sesión
- Navegación con Expo Router (tabs: map, favorites, friends, profile, progress)
- Row Level Security configurado, tipos TypeScript generados
- 8 categorías insertadas en BD ('Monumentos y Cultura', 'Bibliotecas', 'Gastronomía', 'Bares y Pubs', 'Discotecas', 'Deporte', 'Ocio Alternativo', 'Naturaleza')

### Sprint 2 (TASK-028 a TASK-042):
- **Google Maps integrado:** react-native-maps configurado con API Key
- **Seed data:** 40 medallas reales de Salamanca con coordenadas GPS precisas
- **medalService:** Funciones para obtener medallas, filtrar por categoría, verificar estado
- **Geolocalización completa:**
  - Permisos configurados (Android/iOS)
  - `locationService.ts` con tracking en tiempo real y algoritmo de Haversine
  - `locationStore.ts` (Zustand) para estado global de ubicación
  - Hook `useLocation` para consumir ubicación en componentes
- **Componentes de mapa:**
  - `MapView.tsx` centrado en Salamanca con ubicación del usuario (punto azul)
  - `MapMarker.tsx` (CustomMarker) con iconos por categoría y estados visuales
  - `CategoryFilter.tsx` para filtrar marcadores por categoría
  - `MedalSearch.tsx` para búsqueda de medallas
- **Pantalla de mapa funcional:** `app/(tabs)/map.tsx` con marcadores integrados
- **UI de lugares:**
  - `PlaceInfoCard` se muestra al tocar marcador (nombre, categoría, distancia, estado)
  - `MedalStatusBadge` muestra estado de medalla (locked/unlocked)
  - `CategoryBadge` muestra categoría con icono y color
- **Hooks de datos:**
  - `useMedals.ts` - cargar medallas desde Supabase
  - `useNearbyMedals.ts` - detectar medallas cercanas (placeholder, desarrollo en Sprint 3)
  - `useUserStats.ts` - estadísticas básicas del usuario (placeholder, desarrollo en Sprint 3)
- **Stores:**
  - `locationStore.ts` - estado global de ubicación
- **Componentes de medallas existentes (pero vacíos, placeholders):**
  - `MedalCard.tsx`, `MedalList.tsx`, `MedalGrid.tsx`, `MedalCategory.tsx`, `MedalStatusBadge.tsx`
- **Constantes configuradas en `config/constants.ts`:**
  - `MEDAL_PROXIMITY_RADIUS = 10` (metros, actualmente en 120km para pruebas)
  - Configuraciones de precisión GPS (alta/baja)

### Estructura actual del proyecto:

```
frontend/
├── app/
│   ├── (auth)/           # login.tsx, signup.tsx, forgot-password.tsx
│   ├── (modals)/         # camera.tsx, edit-profile.tsx, friend-profile.tsx
│   ├── (tabs)/           # map.tsx, favorites.tsx, friends.tsx, profile.tsx, progress.tsx (placeholder)
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── map/          # MapView, MapMarker, CategoryFilter, MedalSearch
│   │   ├── medals/       # MedalCard, MedalList, MedalGrid, MedalStatusBadge
│   │   ├── ui/           # Button, Input, Card, etc.
│   │   └── forms/        # LoginForm, SignupForm, etc.
│   ├── hooks/
│   │   ├── data/         # useMedals, useUserStats, useFriends, useUser
│   │   ├── location/     # useLocation, useNearbyMedals, useGeofencing
│   │   └── auth/         # useAuth, useSession
│   ├── services/
│   │   ├── database/     # medalService, userService, etc.
│   │   ├── location/     # locationService.ts
│   │   └── auth/         # authService.ts
│   ├── store/            # authStore, locationStore, medalsStore, userStore
│   ├── config/           # constants.ts, env.ts, permissions.ts
│   ├── types/            # TypeScript types para toda la app
│   └── styles/           # theme, colors, typography
```

**Arquitectura:** Patrón por capas
```
UI (Screens) → Hooks → State (Zustand) → Services → Supabase Client / expo-location
```

## Tareas a Implementar (Sprint 3)

### FASE 1: Detección de Proximidad
- **TASK-043:** Implementar lógica de detección de proximidad - `proximityService.ts` con throttling, filtro de medallas no obtenidas
- **TASK-044:** Crear hook useProximityDetection - Monitoreo continuo, callbacks `onMedalNearby`/`onMedalLeft`, debounce
- **TASK-045:** Implementar animación de marcador cercano - Modificar `CustomMarker` con prop `isNearby`, animación pulso/brillo con Animated API

### FASE 2: Desbloqueo de Medallas
- **TASK-046:** Implementar servicio de desbloqueo de medallas - Función `unlockMedal(userId, medalId)`, inserción en `user_medals`, manejo de duplicados
- **TASK-047:** Crear pantalla/modal de obtención de medalla - UI de celebración con confeti, placeholder para foto, navegación de vuelta al mapa

### FASE 3: Componentes y Hooks de Progreso
- **TASK-048:** Crear servicio de estadísticas de usuario - `getUserStats()`: total medallas, porcentaje, desglose por categoría
- **TASK-049:** Crear componentes de visualización de progreso - `CategoryProgressBar`, `MedalCard` con modo compacto/expandido, `ProgressCircle` (opcional)
- **TASK-050:** Crear hook useMedalCollection - Filtros por estado y categoría, ordenación

### FASE 4: Pantallas de Progreso y Galería
- **TASK-051:** Implementar pantalla de Progreso - Tab "Progreso" con estadísticas globales, desglose por categoría, MedalCards expandibles
- **TASK-052:** Crear componente MedalThumbnail - Thumbnail para grid de galería con foto
- **TASK-053:** Implementar subvista de Galería de Fotos - Grid de MedalThumbnail, filtros, accesible desde Progreso

### FASE 5: Integración y Testing
- **TASK-054:** Testing de integración del sistema - Tests de proximidad, desbloqueo, progreso
- **TASK-055:** Documentación técnica del Sprint 3 - Actualizar ARCHITECTURE.md, diagramas de flujo y los archivos de documentación afectados

**Total:** 13 tareas, 35 Story Points

## User Stories Relacionadas (Sprint 3)

### US-010: Obtención de medalla por proximidad (8 pts)
- Sistema monitorea distancia usuario-lugares continuamente
- Al acercarse a <10m: marcador cambia a color amarillo/activo con animación
- Al tocar marcador activo: se abre pantalla de captura (placeholder sin cámara por ahora)
- No permite obtener medalla si no está dentro del radio
- Evita duplicados en base de datos

### US-011: Visualización de progreso personal (3 pts)
- Pantalla "Progreso" accesible desde tab inferior
- Resumen visual: barra/círculo con porcentaje, "X/Y medallas"
- Desglose por categoría con barras de progreso
- Fecha de última medalla obtenida
- Se actualiza automáticamente

### US-012: Visualización de colección de medallas (3 pts)
- Galería en formato grid con foto/icono, nombre, fecha
- Medallas no obtenidas en gris/bloqueadas
- Detalle al tocar: foto, descripción, fecha, categoría
- Filtros: todas, obtenidas, no obtenidas, por categoría

Criterios de aceptación detallados en `docs/USER_STORIES.md` (líneas 310-406) y `docs/sprint_tasks/SPRINT_3_TASKS.md`

## Componentes y Código Existente Relevante

**Ya implementados (reutilizar/extender):**
- `useNearbyMedals.ts` - Base para `useProximityDetection`
- `MapMarker.tsx` - Extender con prop `isNearby` y animaciones
- `MedalStatusBadge.tsx` - Ya muestra estados locked/unlocked
- `CategoryFilter.tsx` - Reutilizar en pantalla de progreso
- `locationStore.ts` - Suscribirse para detección de proximidad

**Constantes importantes (`config/constants.ts`):**
- `MEDAL_PROXIMITY_RADIUS = 10` metros (cambiar de 120km a 10m para producción)
- `HIGH_ACCURACY_LOCATION` - Configuración para detección de proximidad
- `ANIMATION_DURATION` - Tiempos de animación

## Instrucciones Inmediatas

**NO escribas código todavía.** Primero:

1. Explora el repositorio completo para entender la estructura actual y el código existente
2. Lee los archivos de documentación:
   - `docs/sprint_tasks/SPRINT_3_TASKS.md` (tareas detalladas)
   - `docs/USER_STORIES.md` (criterios de aceptación US-010, US-011, US-012)
   - `docs/ARCHITECTURE.md` (arquitectura y patrones)
   - `docs/frontend/` (documentación del desarrollo frontend que llevamos hasta ahora)
3. Revisa el código existente relevante:
   - `frontend/src/hooks/location/useNearbyMedals.ts`
   - `frontend/src/components/map/MapMarker.tsx`
   - `frontend/src/components/medals/MedalCard.tsx`
   - `frontend/src/store/medalsStore.ts`
   - `frontend/src/services/database/medalService.ts`
4. Identifica qué existe, qué se puede reutilizar y qué hay que crear desde cero. Hay algunas Tareas de este Sprint 3 que ya están implementadas, o que tienen alguna parte empezada. Identifica el estado actual en el que nos encontramos, qué Tareas del Sprint 3 podemos cerrar y qué Tareas faltan por desarrollar.

Genera un resumen ejecutivo que incluya:
- Comprensión del contexto y arquitectura actual
- Análisis del código existente que se puede reutilizar o extender
- Tareas del Sprint 3 ya terminadas o avanzadas
- Plan de implementación propuesto para las tareas faltantes
- Puntos críticos, decisiones de diseño importantes y riesgos identificados
- Preguntas o aclaraciones necesarias antes de comenzar

Una vez confirmes tu comprensión completa, procederemos con la implementación incremental fase por fase, con testing continuo y code review de mi parte. Durante el desarrollo deberás consultarme antes de tomar decisiones importantes, explicando tu opinión en cada caso, pero esperando a mi confirmación antes de continuar.

## Principios de Trabajo

- Desarrollo incremental con verificación antes de continuar
- Seguir convenciones TypeScript y patrones establecidos en el proyecto
- Reutilizar código existente siempre que sea posible (hooks, componentes, stores)
- Utilizar las buenas prácticas definidas en los archivos de documentación base (`docs/`)
- Comentar código complejo, pero sin añadir comentarios excesivos, únicamente los esenciales
- Manejo de errores y de casos extremos
- Testing manual de cada funcionalidad antes de pasar a la siguiente
- Animaciones fluidas y UX cuidada (es una app de gamificación, debe ser atractiva)


---

· Prompt 2:

Excelente análisis. Voy a responder a tus preguntas y a indicarte mis decisiones de diseño en las cuestiones que planteas para que puedas empezar el desarrollo de las Tareas del Sprint 3 según tu planificación:

## Decisiones de Diseño
1. Throttling de proximidad: Opción A, Throttle global cada 2 segundos.
2. Momento del desbloqueo: En el caso final real, esto será después de haber tomado una foto y haberla confirmado en la app en el modal `camera.tsx` que falta por implementar (la funcionalidad de la cámara la haremos en el Sprint 4). Al acercarse a una medalla por obtener, el usuario selecciona la medalla en el mapa y pulsa sobre el botón "Capturar medalla", lo que abre el modal de cámara. Cuando el usuario tome una foto y la confirme, pulsará un botón "Aceptar" en esa vista modal que hará que se cree la tupla en la tabla 'user_medals', y mostrará el modal de celebración. Para este Sprint, crea un código simple y funcional para `camera.tsx` sin el módulo de cámara, que permita pulsar sobre el botón de confirmar foto "Aceptar" y que tenga la lógica que te he descrito. (Parecido a la Opción B que propones)
3. Estructura de navegación de Galería: Todavía no sé qué opción se verá mejor y será mejor para la UI/UX. Por este motivo, sigo tu recomendación de implementar la Opción B, pero me tienes que explicar mejor en qué consistirá, cómo se mostrará y por qué lo prefieres para que entienda la decisión.
4. Animación de marcador cercano: Opción A, animación de pulso/giro.
5. `proximityService`: Opción A, mejor crear un nuevo servicio separado para separar responsabilidades. Para el desarrollo de este proyecto debemos asegurar que el código es profesional y que sigue las mejores prácticas de desarrollo. Como experto desarrollador que eres, avísame si encuentras en algún momento un fallo en el diseño actual o algún caso en el que se pueda mejorar e implementar las buenas prácticas.

## Respuestas y Aclaraciones
1. Radio de proximidad: No cambies el radio de proximidad todavía, lo tengo muy alto para realizar pruebas, lo cambiaré cuando llevemos el proyecto a producción (entrega del TFG y despliegue de la app). Ahora mismo me encuentro lejos de Salamanca y necesito aumentar el rango de detección para probar esta funcionalidad. ¿Hay alguna posibilidad de mockear mi ubicación como usuario para ponerme en algún punto de Salamanca y probar así esta funcionalidad sin necesidad de aumentar el radio de proximidad? Si es así, explícame cómo hacerlo y me parecerá bien establecer el radio a 10m.
2. Foto en `user_medals`: Aunque este sprint tenga las fotos a null, debemos implementar las vistas y modales de este Sprint al completo, no debemos omitir ninguna sección. En este caso, implementa la lógica completa del modal para que muestre la imagen de la `user_medal`. Si la imagen es "null", que se muestre en su lugar la imagen `frontend/src/assets/images/logos/logo_completo_salmantour.png` como valor por defecto. Esta lógica nos servirá por si en la aplicación final ocurre algún error extraño y no tiene ninguna imagen que cargar, que muestre el logo de la app por defecto, que no quedaría mal. De todos modos, no deberíamos tener ningún error y la medalla siempre debería tener una imagen guardada en la versión final.
3. Actualización de marcadores: Analiza cómo está hecha la lógica del re-render automático del estado. Si consideras que es fiable y que funcionará en todos los casos, lo podemos dejar así. Si no, me parece bien forzar el refresh, ya que en el uso de la app no se estarán consiguiendo medallas continuamente, así que no sería un problema de optimización que en esos casos específicos se fuerce un refresh. Implementa lo que mejor consideres.
4. Animación de confeti: No tengo preferencia por ninguna librería específica, ni si usar un efecto de confeti u otro de celebración cualquiera. Implementa el que se vea mejor y sea más fácil de implementar.
5. Galería de fotos: Esto deberá funcionar igual que en la respuesta 2 que te he explicado antes, deberás hacer la lógica completa de esos componentes en este Sprint, poniendo el logo como imagen por defecto si no se encuentra ninguna en la medalla.

Ahora que está todo aclarado, empieza el desarrollo de tu planificación. Explica todo lo que hagas en cada Fase para que entienda tu razonamiento en cada punto.

---

· Prompt 3:

Has realizado un muy buen trabajo, están todas las funcionalidades y vistas del Sprint 3 implementadas y funcionales. He probado la app en profundidad con Expo Go para testear las nuevas implementaciones y he encontrado varias cosas que necesitan arreglo o solución. Analiza y soluciona cada una de 1 en 1, explicando tu razonamiento en cada una de ellas:

## Errores funcionales

- Hay un error en la línea 65 de `camera.tsx`. Soluciónalo:
```
Property 'error' does not exist on type 'MedalServiceResult<UserMedalWithDetails>'.
  Property 'error' does not exist on type 'MedalServiceSuccess<UserMedalWithDetails>'.ts(2339)
```

- Al capturar una medalla me devuelve a la vista del mapa y la medalla sigue mostrándose como "Disponible para conseguir", con la animación y el estado de la tarjeta de info todavía sin cambiar. Tampoco se actualiza el estado de la medalla en la vista "Progreso", al volver a entrar en ella después de conseguir la medalla sigue apareciendo como "Por obtener". Esto indica que no se está actualizando correctamente el estado local de las medallas obtenidas y por obtener. Debemos forzar un refresh del estado de la medalla obtenida, para que se actualice en todos los sitios de la app como "Conseguida". Únicamente necesitamos forzar el refresh del estado de esta medalla, no de todas, ya que se entiende que la única que ha cambiado su estado al registrarse la nueva tupla ha sido esa medalla.

- Hay algo no optimizado que provoca que la app se realentice cada vez más y más. Me ha llegado a saltar un error que me ha echado de la app, al llevar un tiempo navegando la vista 'progress' y la vista 'gallery.tsx'. Analiza el error que me ha aparecido por terminal y realiza una investigación en el código que has creado para encontrar la lógica mal optimizada que causa el problema. Te detallo a continuación los logs del error: 
```
 ERROR  Warning: RangeError: java.lang.OutOfMemoryError: Failed to allocate a 3440 byte allocation with 333344 free bytes and 325KB until OOM, target footprint 268435456, growth limit 268435456; giving up on allocation because <1% of heap free after GC.
        at android.icu.util.LocaleMatcher.<init>(LocaleMatcher.java:654)
        at android.icu.util.LocaleMatcher.<init>(Unknown Source:0)
        at android.icu.util.LocaleMatcher$Builder.build(LocaleMatcher.java:581)
        at android.icu.util.ULocale.acceptLanguage(ULocale.java:2509)
        at com.facebook.hermes.intl.LocaleMatcher.bestFitBestAvailableLocale(SourceFile:18)
        at com.facebook.hermes.intl.LocaleMatcher.bestFitMatch(SourceFile:16)
        at com.facebook.hermes.intl.LocaleResolver.resolveLocale(SourceFile:53)
        at com.facebook.hermes.intl.Collator.initializeCollator(SourceFile:110)
        at com.facebook.hermes.intl.Collator.<init>(SourceFile:15)
        at com.facebook.jni.NativeRunnable.run(Native Method)
        at android.os.Handler.handleCallback(Handler.java:959)
        at android.os.Handler.dispatchMessage(Handler.java:100)
        at com.facebook.react.bridge.queue.MessageQueueThreadHandler.dispatchMessage(SourceFile:6)
        at android.os.Looper.loopOnce(Looper.java:257)
        at android.os.Looper.loop(Looper.java:342)
        at com.facebook.react.bridge.queue.MessageQueueThreadImpl$Companion.startNewBackgroundThread$lambda$1(SourceFile:39)
        at com.facebook.react.bridge.queue.MessageQueueThreadImpl$Companion.a(SourceFile:1)
        at com.facebook.react.bridge.queue.c.run(SourceFile:1)
        at java.lang.Thread.run(Thread.java:1119)


This error is located at:

Call Stack
  RNSScreenContainer (<anonymous>)
  ScreenContentWrapper (<anonymous>)
  RNSScreenStack (<anonymous>)
  RNCSafeAreaProvider (<anonymous>)
  App (<anonymous>)
  ErrorOverlay (<anonymous>)
```
Contexto extra de este error: El problema de la ralentización de la app hasta que se bloquease y no poder interactuar con ella (y más tarde saltar el error), ocurre con el tiempo, no con las iteracciones con las vistas. Por las pruebas que he hecho, parece que esto solo ocurre si hay alguna medalla disponible para conseguir al alcance, aunque esté en otra vista que no sea el mapa, que muestra las animaciones. Cuantas más medallas haya al alcance, menos tarda en "petarse" la app y empezar a ir muy lenta. En un contexto real, no me preocupa porque sé que no estarán todas las medallas al alcance a la vez, como me ocurre con mi radio de prueba de 120km. Sin embargo, sí que es posible que pueda haber 2 o 3 medallas a la vez y, si no se canjean y se dejan sin tocar un tiempo, pueden llegar a provocar la ralentización de la app y este error extraño. Debemos solucionar esto, analiza la situación, comprende el error y optimiza lo que sea necesario.

## Errores visuales

- Cuando estoy cerca de una medalla disponible para conseguir, esta realiza correctamente la animación de pulsación. En este estado, hay veces que parpadea o "titilea" muy brevemente en repetidas ocasiones. Esto creo que ocurre por la repetición de comprobación del estado y re-renderizado de los marcadores. Para evitar este problema que nos surgió anteriormente, implementamos una lógica en `MapMarker.tsx` que seteaba 'shouldTrackChanges' a true durante los primeros 300ms para que se efectuase el primer render de las medallas y luego se seteaba automáticamente a false para evitar este bug visual. Sin embargo, has cambiado esta lógica al implementar la animación, así que ha vuelto a surgir el parpadeo de los marcadores. ¿Hay alguna manera de solucionarlo sin romper la lógica necesaria para la nueva funcionalidad de animación?

- En la tarjeta MedalCard de una medalla seleccionada, el botón "Ver en el mapa" redirige correctamente al mapa, pero se muestra en el último estado que lo dejó el usuario (mantiene la posición y zoom que estaba). Necesito que este botón redirija a la vista del mapa, que centre la vista en las coordenadas de la medalla seleccionada y que ajuste el zoom a 18, cerca de la medalla.

## Sugerencias de mejora

- Las vistas que has creado no utilizan el componente de vista base 'ScreenContainer', importado de `@/components/ui`. Este componente base lo importan todas las vistas (profile, login, signup…) excepto 'map.tsx' porque esa vista es la única que funciona diferente porque necesita mostrar un mapa que ocupa la vista entera. Para el resto de vistas, incluyendo las que has creado, considero que es importante que utilicen el componente 'ScreenContainer' como base para la vista para no repetir código ya creado en este componente, respetando la norma DRY de las buenas prácticas de desarrollo. Analiza este componente y las vistas que has creado, y razona si sería recomendable que las cambies para hacer uso de este componente. Si consideras necesario editar o añadir algo en `ScreenContainer.tsx` para mejorarlo, hazlo explicando tus implementaciones. Si consideras que no es necesario ni "mejor opción" utilizar 'ScreenContainer' para estas vistas nuevas, explica por qué.

- En las tarjetas de la vista "Gallery", necesito que se permita seleccionar la imagen para consultarla en pantalla completa. La idea de esta vista de galería es poder consultar todas las fotos guardadas en la app, y no tanto consultar las medallas obtenidas, así que debe centrarse en mostrar bien la foto de cada medalla. Considero que implementar la funcionalidad de poder "ampliar" la imagen de la tarjeta para verla en pantalla completa (en vertical) es algo importante para conseguir este efecto de galería que queremos. También quiero que se salga de la tarjeta desplegada al pulsar fuera de ella, no solo utilizando la cruz de "salir".

---

· Prompt 4:

Me parece bien tu decisión de indicar el estado "disponible" de las medallas con un cambio visual en el color del borde de los marcadores en vez de una animación que causaba problemas. He ajustado algunas cosas del MapMarker.tsx manualmente, ahora el estado "disponible" se indica haciendo el grosor del borde un poco más grande (+1) y poniéndolo del color principal de la app. El tamaño y el resto de cosas del Marker lo dejo igual que antes, únicamente indicamos el estado "disponible" mediante el color y borde. Con esto y con los demás cambios que has hecho, hemos arreglado los errores que teníamos antes, pero todavía faltan varias cosas por arreglar/revisar:

## Error funcional
- Hay un error en la funcionalidad de redirigir al mapa y centrar la vista en la medalla con el botón "Ver en el mapa" de las MedalCard de la vista 'progress' y de la vista 'gallery'. Ambos botones redirigen a la vista del mapa introduciendo como parámetros 'medalId', 'lat' y 'lng':
```
// Navegar al mapa y centrar en esta medalla
router.push({
    pathname: '/(tabs)/map',
    params: {
        medalId: medal.id,
        lat: medal.latitude,
        lng: medal.longitude,
    },
});
```
Esto hace que se active el 'useEffect' de las líneas 171-193 de `map.tsx`, lo que centra la vista en las coordenadas de la medalla, le aplica un zoom de 18 y despliega la tarjeta de información de la medalla. Esta lógica sí que está bien hecha, he realizado pruebas y sí que redirige bien a la vista 'map', centrando la vista en la medalla seleccionada. Sin embargo, hay un error con esta lógica que hace que ese useEffect se repita en bucle infinitamente cada varios segundos. En las pruebas que he realizado, después de pulsar en el botón "Ver en mapa" de alguna medalla, me ha llevado a la vista mapa centrada en la medalla y con la tarjeta desplegada. Si continuaba en la vista 'map' con la tarjeta cerrada y movía la vista del mapa (cambiaba el zoom o me desplazaba), al cabo de unos segundos me volvía a redirigir a la medalla, seteando las coordenadas y el zoom y desplegando la tarjeta de información de esa medalla. Si cambiaba de pantalla (me volvía a la de 'progress' o me iba a la de 'profile', por ejemplo) al cabo de unos segundos ocurría lo mismo, se mostraba la tarjeta de información de la medalla. En este caso no me redirigía a la vista de 'map' pero, si volvía al mapa manualmente, sí que podía comprobar que también se me redirige a las coordenadas. Imagino que este error está provocado por algo que hace que se ejecute el useEffect en bucle con unos segundos de margen entre iteraciones. He descubierto que también existe un useEffect en las líneas 76-94 de `MapView.tsx` que realiza lo mismo que el useEffect de `map.tsx` (o parecido), así que puede ser que esté interfiriendo también en lo de redirigir al usuario a la medalla y que tenga algo que ver con el error (no estoy seguro, pero sé que esa lógica deberíamos tenerla únicamente en 1 lugar). Analiza el código y averigua qué es lo que provoca este comportamiento. Explícame el causante del problema y arréglalo.

## Revisiones necesarias del código actual
- He visto que has creado un servicio específico para el cálculo de distancias llamado 'proximityService.ts' a pesar de que ya la lógica de cálculo de distancia ya existía en useMedals (bien hecho, es una buena práctica para separación de responsabilidades y reutilización). Sin embargo, no tengo claro si has cambiado también la lógica del resto de la app para que utilice este servicio y el hook nuevo `useProximityDetection.ts`.Tampoco has actualizado nada del `locationStore.ts`, aunque no sé si deberías haber cambiado algo de él o no. Revisa los flujos actuales de la app para el cálculo de distancia, y localiza si se está utilizando la nueva lógica "mejorada" o si se sigue usando la anterior que no tiene separación de responsabilidades. Si hay algo que debas cambiar para mejorarlo, hazlo explicando tu razonamiento.

- He estado revisando el código del modal de felicitación `MedalUnlockModal.tsx` y veo que también tiene un botón "Ver en el mapa" además del botón "¡Genial!", pero en la app no me aparece. Te adjunto una captura de pantalla de esta vista para que veas cómo es. ¿Por qué no aparece el botón "Ver en el mapa"? De todos modos, no me parece un botón importante, prefiero tener solo el botón de "¡Genial!", que cierra los modales y te devuelve a la vista del mapa como estaba (ya estaría centrada en la medalla, ya que la hemos seleccionado para conseguirla). Elimina el botón "Ver en el mapa" de este componente, y explícame por qué no se veía a pesar de aparecer definido en el código, que me interesa conocer por qué ocurría este caso para aprenderlo.

- Como viene indicado en `ARCHITECTURE.md`, en este proyecto utilizamos la biblioteca Zustand para la gestión de estado global. He visto que una de las cosas que has cambiado para arreglar un error ha sido implementar un medalsStore que utiliza Zustand. Que no lo hubieses implementado con Zustand desde el principio me hace dudar si el resto del programa está usando Zustand en todos los sitios que debería o si únicamente se está gestionando el estado de manera local. No es necesario que todo en la app utilice Zustand de manera forzada, únicamente quiero que revises los casos que consideres necesario o "mejor práctica" utilizar Zustand para gestión de estado global. Revisa el repositorio y localiza los casos en los que la lógica se podría mejorar con Zustand.


## Otras mejoras
- La vista Progreso y la vista Galería tardan 1-2 segundos cada una en cargar todos los datos de medalla. Una vez cargados, se mantiene bien el estado y no vuelve a tardar esto ni aunque cambies de vista. Sin embargo, me gustaría que tampoco tardase tanto al cargar los datos la primera vez (o cuando se hace refresh). ¿Hay alguna forma de optimizar esto para que la experiencia del usuario sea fluida?

- Me has explicado que se puede mockear la ubicación del usuario mediante código para probar en Expo Go la app con mi ubicación donde quiera. Quiero probar a poner mi ubicación en las coordenadas [40.971275,-5.664079] para hacer testing real con la app. Implementa esta lógica y explícame cómo funciona. Quiero saber cómo activarlo y cómo desactivarlo cuando quiera (para quitarlo cuando vaya a entregar la versión final).

---

# Promtp 5:

Genial, has hecho buenos cambios y se han solucionado varios errores. Ya quedan pocas cosas por revisar para dar por finalizado el desarrollo de este Sprint. Revisa los siguientes puntos de 1 en 1, investigando en profundidad cada uno y explicando tu razonamiento en el proceso:

- Si añadimos la lógica de limpiar los params de `map.tsx` después de setear las coordenadas y el zoom, no tiene sentido añadir la otra lógica de guardar una referencia del ref. Con saber que esto se ejecutará 1 vez y que luego se limpiará, nos basta. Además, la lógica de guardar una clave única para comprobar si ya se han procesado los params es errónea. Puede ocurrir que se pulse en "Ver en el mapa" para la medalla "Rana Universidad", por ejemplo, que redirija y funcione bien, guardando la clave única para esa medalla para evitar que redirija de nuevo, y que el usuario vuelva a pulsar sobre "Ver en el mapa" para esa misma medalla. Eso crearía la misma clave y no redirigiría al usuario esta vez, de manera errónea. Elimina toda la lógica sobrante de "Ref" y quédate con la única necesaria, la limpieza de los params al terminar de redirigir.

- Me ha gustado tu mejora sobre cachear todas las medallas para evitar cargas innecesarias. Sin embargo, no entiendo por qué has renombrado en `useMedals.ts` todas las variables "allMedals" por "cachedMedals". Entiendo que con este cambio de nombre se de a entender mejor que esas medallas están cacheadas, pero prefiero seguir utilizando el nombre "allMedals" para la mayoría de métodos de este archivo en los que se utiliza. Si quieres, define la variable "allMedals" como " = cachedMedals", o hazlo como mejor consideres, pero cambia los nombres de las variables para volver a usar "allMedals", que es más correcto.

- El mock de ubicación funciona correctamente y estoy pudiendo probar el sistema de detección con ello, pero no es cómodo de utilizar porque no se muestra el círculo azul de ubicación del usuario en el punto mockeado. El círculo del usuario sigue apareciendo en el sitio de mi ubicación real, no donde la falsificamos, solo lo falsificamos a nivel de lógica de la app, pero no visualmente. Investiga si se puede poner el círculo del usuario también manualmente en el punto en el que queramos, para que esté sincronizado con la ubicación mockeada (y mejorar el testing).

- No entiendo por qué no pueden usar 'ScreenContainer' como base las vistas `progress.tsx` y `gallery.tsx`. Si esas vistas necesitan cosas extras, como indicas, podrían implementarlas manualmente, pero usando la base que hemos definido en 'ScreenContainer' para todas las vistas, sin repetir la misma configuración base en todas las vistas (principio DRY).

- Hemos confirmado que el nuevo servicio `proximityService.ts` no lo estamos utilizando para nada porque `useMedals.ts` calcula la proximidad con 'useMemo' y se considera más eficiente. Debes revisar si utilizar este servicio en algún sitio de la app supone una mejora o si no es útil en ningún caso. Si no es útil y se prefiere seguir usando la lógica anterior (que solo necesita el locationService), deberíamos eliminar el nuevo servicio por "no servir para nada". Necesito que esta app sea lo más profesional posible; esto incluye realizar el código de manera modular y de la mejor forma posible, siguiendo las buenas prácticas de desarrollo en todo momento, pero también incluye tener una buena estructura, sin código "extra" que sobre. Por estos 2 motivos, debemos decidir si este archivo supone una mejora en la implementación actual por incluir "mejores prácticas de desarrollo" que la que hay con la lógica actual, o si es inútil y debemos eliminarlo. Razona y argumenta tu decisión según tu análisis.

---

# Prompt 6:

Genial! Todas las vistas implementadas se ven bien y funcionan perfectamente, doy por terminado el desarrollo del Sprint 3. Ahora debes revisar todos los archivos de documentación que te he adjuntado, y analizar todas las partes que no estén actualizadas. Implementa cambios en todos los archivos que consideres necesario para que quede bien documentadas las cosas nuevas que hemos implementado en este Sprint. Estos archivos de documentación componen la documentación oficial final del proyecto, así que asegúrate de que todos sean correctos y que reflejen de manera completa el estado actual del proyecto.

---

# Prompt 7:

Genial, ya tenemos todas las Tareas del Sprint 3 terminadas. Ahora voy a realizar todos los commits de lo que hemos implementado en este Sprint y realizar el Pull Request. Necesito que revises todos los archivos de #changes y que me indiques qué commits hacer. Debes decirme cuántos commits hacer, qué archivos meter en cada uno y qué descripción breve le pongo a cada commit. No es necesario que hagas los comandos para ejecutar en terminal, únicamente debes razonar cómo distribuir los archivos de #changes en commits y los comentarios.

Archivos a commitear:
```
$ git status
On branch feature/progress-view
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   ../backend/docs/API.md
        modified:   ../docs/ARCHITECTURE.md
        modified:   app/(modals)/camera.tsx
        modified:   app/(tabs)/map.tsx
        modified:   app/(tabs)/progress.tsx
        modified:   docs/COMPONENTS.md
        modified:   docs/HOOKS.md
        modified:   docs/NAVIGATION.md
        modified:   package.json
        modified:   src/components/map/MapMarker.tsx
        modified:   src/components/map/MapView.tsx
        modified:   src/components/medals/MedalCard.tsx
        modified:   src/components/medals/index.ts
        modified:   src/components/ui/ScreenContainer.tsx
        modified:   src/components/ui/index.ts
        modified:   src/config/constants.ts
        modified:   src/hooks/data/index.ts
        modified:   src/hooks/data/useMedals.ts
        modified:   src/services/database/MedalService.ts
        modified:   src/store/index.ts
        modified:   src/store/locationStore.ts
        modified:   src/store/medalsStore.ts
        modified:   src/styles/theme.ts
        modified:   ../package-lock.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        app/(modals)/gallery.tsx
        src/components/medals/MedalThumbnail.tsx
        src/components/medals/MedalUnlockModal.tsx
        src/components/ui/CategoryProgressBar.tsx
        src/config/devConfig.ts
        src/hooks/data/useMedalCollection.ts

no changes added to commit (use "git add" and/or "git commit -a")
```

---

# Promtps Sprint 4: Implementación de cámara

# Prompt 1:

Ahora vamos a realizar la implementación completa de las Tareas del Sprint 4. Te he adjuntado un nuevo archivo que define las tareas de este sprint, que consisten en implementar el módulo de cámara, la lógica para guardar las imágenes en supabase y la vista de editar el perfil. De estas tareas, hay varias completadas parcialmenteS y varias que ya están implementadas de manera completa. Por ejemplo, ya tenemos implementado un bucket 'avatars' en Supabase y tenemos la lógica para editar la foto de perfil (con fotos guardadas en el dispositivo con 'expo-image-picker', no con fotos tomadas con el módulo de cámara dentro de la app). También tenemos implementada la lógica base de mostrar las imágenes en las tarjetas de medallas y una vista base `camera.tsx`, entre otras cosas. Debemos identificado todo lo realizado, lo que falta por realizar y lo que está pero se puede mejorar.

## Tu objetivo actual
Debes revisar el archivo adjunto `SPRINT_4_TASKS.md` task a task, investigando en el repositorio completo para encontrar qué partes están ya realizadas y qué falta por implementar. También debes evaluar lo que indican las Tareas del archivo de documentación, ya que se trata de una guía básica para realizar este Sprint pero no es necesario seguirlo a rajatabla, ya qque puede ser que el archivo `SPRINT_4_TASKS.md` tenga alguna cosa errónea o que no indique el mejor diseño posible en todas las tareas. Es mejor que tú, como desarrollador senior experto que eres, definas cómo implementar cada cosa de la manera más profesional y que respete las buenas prácticas de desarrollo. Modifica la descripción de las tareas que consideres que definen una forma "no óptima" de implementar las nuevas funcionalidades y define un plan de implementación final para este Sprint. Necesito que comprendas de manera perfecta lo que debemos implementar en este Sprint, así que investiga bien en profundidad el código y trata cada Tarea de 1 en 1. Si tienes alguna duda sobre alguna cosa a implementar de este Sprint que no puedas decidir tú directamente, pregúntame lo que necesites.

Espera a mi confirmación de tu plan de implementación y mis respuestas a tus dudas (si las hay) antes de empezar a desarrollar este Sprint.

---

# Prompt 2:

Genial, confirmo que tu plan de implementación del Sprint 4 y tu revisión sobre este son correctos. Debes saber que he renumerado las Tareas de `SPRINT_4_TASKS.md` para seguir con la enumeración de Tareas que teníamos hasta ahora, pero el contenido de ellas no ha cambiado. Respondo a tus preguntas par que puedas empezar a implementar el Sprint completo, Fase a Fase.

## Respuestas a tus dudas
1. Genera un archivo de migración sql en `backend/supabase/migrations/` que incluya la creación de los 2 buckets necesarios. Yo copiaré y ejecutaré en una consola sql de Supabase únicamente la creación del bucket 'medal-photos' (ya tengo la de 'avatars'), pero me parece importante tener el archivo de migración para ambos buckets por si otro desarrollador tiene que configurar el proyecto desde 0.
2. Para la edición de la foto de perfil, me gustaría que hubiesen 2 botones para cambiar la foto: el que utiliza ImagePicker que tenemos ahora y otro que utiliza la cámara modal de las medallas para tomar una foto en ese mismo momento. De esta manera, el usuario podrá decidir si actualizar su foto de perfil capturando una nueva foto o usando una de su dispositivo (comportamiento usual en la mayoría de aplicaciones móviles).
3. Elige la opción más moderna y que mejor aspecto visual le de a los componentes de filtro. Explícame también si vas a realizar componentes reutilizables en archivos aparte o si los vas a implementar directamente en la vista de galería, sin que sean reutilizables. Explica tu razonamiento de por qué la decisión que tomas es la mejor para nuestra app.
4. Los test no son bloqueantes para nada, y prefiero que no los implementes por ahora. Cuando termines el desarrollo completo del Sprint probaré yo la app manualmente para verificar que las cosas estén bien. Todavía no hemos creado ningún archivo de testing, los crearemos al final de todo el desarrollo del proyecto para poder documentar que hemos implementado test unitarios en el TFG.

## Tu objetivo
Desarrolla el Sprint 4 Fase a Fase, decidiendo si seguir todos los pasos que indica `SPRINT_4_TASKS.md` para esa tarea o si consideras que puedes diseñar una mejor implementación. Asegúrate de seguir las buenas prácticas de desarrollo que hemos definido y seguido hasta ahora. Explica todo lo que vayas haciendo. 

---

# Prompt 3:

Excelente trabajo, está prácticamente todo bien. Debemos hacer unos pocos retoques y revisiones para completar el desarrollo del Sprint. Revisa las dudas y correcciones que te indico a continuación de 1 en 1, razonando y explicando tu opinión como experto en cada uno de ellos. Implementa los cambios necesarios para mejorar la app:

- Al pulsar sobre "Capturar medalla" en `map.tsx` se me redirige bien a la vista de la cámara (expo-camera), tomar la foto y consultarla en `PhotoPreview.tsx`. Sin embargo, esta última vista tiene un problema al redirigir a la siguiente al pulsar el botón "Usar foto". El botón "Repetir" funciona bien, y el botón "Usar foto" sí que guarda bien la foto y la medalla, pero no redirige al usuario a la siguiente vista (la de camera.tsx o la de felicitación de la medalla, no estoy seguro cuál debería ir ahí). Al pulsar el botón, aparece el mensaje de "Procesando imagen, Subiendo imagen y Completado" pero te mantiene en la vista al acabar. La única manera de salir es dándole a atrás en el dispositivo, lo cual muestra la vista de mapa con la medalla conseguida, pero sin haber mostrado la vista de felicitación. Arregla esto para que redirija bien al usuario y la UX sea fluida.

- La vista de cámara ocupa la pantalla completa, haciendo parecer que se está guardando una imagen en formato 9:16. Sin embargo, se guarda una imagen con formato 4:3. Lo que pasa es que la vista de cámara intenta mostrar la cámara en pantalla completa, haciendo "zoom" visual en la pantalla sobre lo que ve la cámara. Necesito que esa vista no ocupe la pantalla completa, que la parte de cámara ocupe únicamente una sección 4:3 de la pantalla para ver bien la imagen completa que se va a tomar (sin el zoom ese visual). También necesito que esta vista permita ponerse en horizontal para tomar fotos en 4:3 horizontales también. Implementa ambas mejoras.

- He probado a registrar la medalla "Piso del Desarrollador con una imagen", comprobando que se ha quedado bien guardada y mostrada bien en la vista de galería y de progreso. Luego, para repetir la prueba, he eliminado manualmente desde Supabase la foto y la tupla de la medalla conseguida, lo que me ha dejado sacar una nueva y volver a conseguir la medalla con esta nueva foto. Al volver a las vistas de Progreso y Galería, se sigue mostrando la imagen anterior, a pesar de que ya no existe en Supabase y que he registrado una nueva. Esto sigue ocurriendo aunque refresque la app o la cierre y la vuelva a cargar desde el principio. Necesito que, en los refrescos, se obtenga los datos de la medalla de la base de datos, asegurándose de obtener también la imagen actual de nuevo (por si acaso se ha cambiado). Voy a querer implementar una lógica de "Retomar imagen" si el usuario está cerca de una medalla ya conseguida, así que esto va a ser muy importante para cuando implementemos la lógica de eliminar la imagen anterior de la medalla y guardemos la nueva. Analiza el código, indentifica qué parte no tiene bien implementado la lógica de refresco y haz que las vistas se actualicen bien con la información real.

- He ejecutado todos los comandos de la migración que has creado. Tengo una duda sobre la política de que todos los usuarios puedan consultar las fotos de medallas de otros usuarios. Hay que introducir una política que permita consultar las medallas de un usuario a él y a todos sus amigos, pero no al resto de usuarios. No sé si la mejor opción es dejar la política como está (visible para todos), ya que en la lógica de la app ya vamos a gestionar que no se pueda consultar el perfil de otros usuarios si no son amigos, o si es importante cambiar también la política para el RLS en Supabase. Razona esta decisión y explica cuál es la opción más correcta de las 2.

- Los tipos de Typescript de `@/types/database.ts` están generados automáticamente por supabase-cli mediante un comando de terminal. Veo que has estado realizando algunas pruebas para comprobar que todos los tipos estuviesen bien, pero es posible que sea necesario actualizar los tipos 'typescript' que están definidos para el proyecto para implementar funcionalidades nuevas. ¿Qué crees sobre esto? ¿Crees que es necesario actualizar los tipos de `database.ts` mediante un comando para que todo funcione bien?

---

# Prompt 4:

Genial, has arreglado y mejorado la aplicación con las cosas que te indiqué. Ahora revisa estas últimas cosas que quedan pendientes por resolver para dejar el Sprint terminado:

- He verificado la opción de hacer fotos en horizontal y sí que se puede, se detecta que el dispositivo está en horizontal y la imagen se guarda bien. Sin embargo, la vista `CameraView.tsx` no muestra girados los iconos de fotografía de `CameraControls.tsx` al detectar el cambio de orientación del dispositivos. Esto puede causar confusión al usuario que, si no ve girados los iconos de esta vista, puede pensar que no se pueden tomar fotos en horizontal. Arregla esto para que la vista se vea bien en horizontal.

- Has arreglado la vista `CameraView.tsx` para que la imagen de la cámara no ocupe la pantalla completa y que aparezca en el formato 3:4. Sin embargo, no has arreglado la vista `PhotoPreview.tsx`, que sigue mostrando la imagen ampliada y estirada a pantalla completa. Debes arreglar esta vista para que muestre bien la imagen tomada en formato 3:4 vertical o formato 3:4 horizontal, según se haya tomado la imagen.

- Con tus arreglos, ahora sí que se actualizan bien las imágenes de las medallas (se muestra la verdadera que esté en la base de datos, no se queda guardada la "anterior" en el estado local de manera indefinida). Esta lógica está bien arreglada para las imágenes mostradas en MedalCard y en la vista galería, pero no para la imagen mostrada en la vista de "Felicitaciones". Esta vista sigue mostrando una imagen antigua de la base de datos que ya no existe. La imagen mostrada debe ser la que se acaba de capturar y guardar en 'user_medals'. Corrige la lógica de esta vista también.

- Si la foto se toma en vertical, la vista expandida a pantalla completa (desde las tarjetas de galería) de la foto no se coloca de verdad a pantalla completa. Por alguna razón, se muestra la foto en formato 4:3 vertical, pero sin llegar a los bordes laterales de la pantalla, quedando bastante alejados de estos. Para las fotos tomadas en horizontal esto no ocurre y sí que llega bien al borde de la pantalla. Necesito que soluciones esto para las fotos en formato vertical: reescalado hasta ocupar "la pantalla completa" pero sin cambiar el formato de la imagen estirándola, que se muestre en formato 3:4 vertical pero ocupando todo lo que pueda. También me gustaría implementar el poder hacer zoom en esta vista expandida de la imagen, para que el usuario pueda consultar mejor los detalles de la imagen. ¿Es posible implementar funcionalidad de zoom en esta imagen de manera sencilla?

- Al tomar la foto, la pantalla entera se pone de color blanco durante unos milisegundos (para indicar el efecto de captura) y se reproduce un sonido muy fuerte de "cámara". Me gustaría que ese sonido fuese más bajo o quitarlo por completo. El efecto de poner la pantalla en blanco tampoco me gusta, creo que quedaría mejor si se cambiase el color a negro en vez de a blanco. ¿Cómo lo pruebo? Cambia el volumen del sonido y el efecto visual de captura.

- Implementa que también se puedan consultar las imágenes en pantalla completa desde la vista 'progress' en las MedalCard, que si se pulsa sobre la foto de una medalla se muestre en pantalla completa, como ocurre con las tarjetas de la vista 'gallery'.

---

# Prompt 5:

Bien, has mejorado algunas cosas, pero hay varias que todavía debes arreglar:

- A pesar que indicas que se pellizque sobre la pantalla para hacer zoom en la vista de la imagen ampliada, no funciona. Revisa el código actual para entender por qué no funciona esta funcionalidad de zoom en esta vista y arréglalo. Además, tus últimos cambios han provocado que ahora no se salga del modal de "imagen en pantalla completa" al pulsar sobre el layout fuera de la imagen. Ahora, la única manera de salir de esta vista es pulsando al botón de la cruz. Investiga si se pueden tener simultáneamente las funcionalidades de zoom y de salir fuera de la vista pulsando fuera de la imagen. Si no se puede porque son incompatibles, elige la que consideres mejor.

- Has mejorado la vista `PhotoPreview.tsx`. Ahora, si la imagen fue tomada en vertical, la foto se ve perfectamente en formato 4:3 vertical, ocupando lo que debe ocupar. Sin embargo, si la imagen fue tomada en horizontal, en la vista de preview se muestra también en formato 4:3 vertical, estirando la imagen para que ocupe ese tamaño en ese formato. Necesito que hagas que el contenedor de la imagen se muestre en horizontal (en formato 4:3) si esta se tomó en horizontal.

- No ha cambiado nada respecto a la rotación de los CameraControls en la vista CameraView. Cuando giro el dispositivo (-90º o +90º) la vista se queda estática, con los elementos de control de 'flash' y de 'rotar cámara' sin girar adecuadamente esos -90º o +90º. Revisa tus cambios y la implementación actual para detectar por qué no se muestran visualmente bien girados. ¿Hay que configurar 'rotateEnable={true}' para estos elementos o se debe configurar de otra manera?

- El efecto negro que has añadido al capturar una imagen se ve muy bien, pero sigue apareciendo un "flash" blanco en la pantalla, igual que el sonido de captura. Entiendo que estas 2 cosas vienen integradas con 'expo-camera' pero me gustaría investigar para eliminarlas por completo. Me has indicado que el sonido del obturador en iOS no se puede desactivar, pero en mi caso estoy usando un Android (Samsung). Investiga cómo hacer para quitar lo del pantallazo en blanco y lo del sonido del obturador al tomar una foto.

- Añade la funcionalidad de "Retomar foto" en las tarjetas de información de medallas de la vista `map.tsx` si el usuario se encuentra en el rango de una medalla que ya ha conseguido. Este debe ser un botón nuevo que aparezca solo en este caso, que abre la función de cámara y que te permite tomar una nueva foto para eliminar la anterior y guardar la actual. Este proceso de eliminar la anterior y guardar la nueva se realiza al pulsar sobre el botón "Usar foto" de la vista preview. Debes ajustar la lógica para que se detecte que esa medalla ya está conseguida y que no es necesario crear una nueva, únicamente debe cambiar la foto de la base de datos, que tendrá el mismo nombre: '{user_id}/{medal_id}.jpg'.

---

# Prompt 6:

Debes realizar algunos ajustes más para arreglar los errores:

- Has arreglado el error visual de las imágenes horizontales mostradas en PhotoReview y ahora se ven bien, pero has creado un nuevo error visual al mostrar una foto 3:4 vertical en PhotoPreview: Se muestra cortada por arriba y por abajo, no se muestra con formato 3:4, sino 1:1, a pesar de que sí que se guarda como 3:4 (lo he comprobado en las imágenes de MedalCard y Gallery). Las fotos verticales antes se mostraban perfectas, ajústalo para que se vean bien tanto si se han tomado en vertical como en horizontal.

- Hay un error de código al mostrar la foto en pantalla completa desde las tarjetas de Gallery:
```
 ERROR  Warning: Invariant Violation: zoomToRect is not implemented

This error is located at:

Call Stack
  RCTModalHostView (<anonymous>)
  ScreenContentWrapper (<anonymous>)
  RNSScreenStack (<anonymous>)
  RNCSafeAreaProvider (<anonymous>)
  App (<anonymous>)
  ErrorOverlay (<anonymous>)
```

- No has implementado bien la lógica de implementar zoom en la vista completa de las imágenes de MedalCard. Ahora me permite hacer un scroll vertical leve, pero no hacer zoom.

- Te adjunto una imagen de la vista `map.tsx` con una tarjeta de información de medalla desplegada de una medalla que tengo al alcance. Es una medalla obtenida, como se indica en verde, pero no me muestra el botón de "Retomar foto" que has implementado. No he podido probar esta nueva funcionalidad, arregla esto para que aparezca bien el botón y pueda probar a cambiar las fotos de medallas conseguidas previamente.

- Has conseguido eliminar el flash blanco y el obturador, pero no has conseguido que los iconos roten según la orientación del dispositivo. Investiga qué está fallando en la implementación que has hecho y arréglalo para que los iconos de CameraControls giren si gira el dispositivo.