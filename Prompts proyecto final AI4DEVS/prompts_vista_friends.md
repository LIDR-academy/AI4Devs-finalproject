# Prompt 1 (Claude Opus 4.5): Contextualización del Sprint 6 - Sistema Social

## Rol y Expertise

Eres un **desarrollador senior de aplicaciones móviles** con expertise profundo en:
- React Native y Expo (SDK 53)
- TypeScript y arquitectura de aplicaciones
- Zustand para gestión de estado
- Expo Router para navegación
- Supabase (Auth, PostgreSQL, Storage)
- Google Maps y geolocalización
- Patrones de diseño y UX en aplicaciones gamificadas
- **Sistemas sociales y gestión de relaciones entre usuarios**

Tu enfoque es metódico: analizas completamente antes de implementar, priorizas la reutilización de código existente y mantienes consistencia con los patrones establecidos en el proyecto.

---

## Proyecto: Salmantour

**Salmantour** es una aplicación móvil gamificada desarrollada como Trabajo de Fin de Grado (TFG). Su objetivo es motivar a estudiantes universitarios a descubrir lugares de interés en Salamanca mediante un sistema de recolección de medallas geolocalizadas con documentación fotográfica.

### Stack Tecnológico
| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React Native, Expo SDK 53, TypeScript, Expo Router, Zustand |
| **Backend** | Supabase (Auth + PostgreSQL + Storage), Row Level Security |
| **Servicios** | Google Maps API, expo-location, expo-camera, expo-image-manipulator |

### Arquitectura
```
UI (Screens/Tabs) → Hooks → State (Zustand Stores) → Services → Supabase Client
```

---

## Estado Actual del Proyecto

### Sprints Completados (1-5)

#### Sprint 1: Autenticación y Base de Datos
- Supabase configurado con cliente y tipos TypeScript generados
- Tablas implementadas: `users`, `categories`, `medals`, `user_medals`, `favorites`, `friendships`
- Sistema de autenticación completo (login, signup, logout, forgot-password)
- AuthStore con Zustand, protección de rutas, persistencia de sesión
- Row Level Security configurado
- 8 categorías de lugares insertadas

#### Sprint 2: Mapa y Geolocalización
- Google Maps integrado con react-native-maps
- 40 medallas reales de Salamanca con coordenadas GPS
- Servicios de geolocalización: `locationService.ts`, `locationStore.ts`
- Componentes de mapa: `MapView`, `MapMarker`, `CategoryFilter`, `PlaceInfoCard`
- Hook `useLocation` para tracking en tiempo real
- Algoritmo de Haversine para cálculo de distancias

#### Sprint 3: Sistema de Medallas y Proximidad
- Detección de proximidad con `proximityService.ts` y `useProximityDetection`
- Desbloqueo de medallas con `unlockMedal()` en `medalService.ts`
- Pantalla de celebración al obtener medalla
- Pantalla de Progreso (`progress.tsx`) con estadísticas por categoría
- Componentes: `MedalCard` expandible, `CategoryProgressBar`, `MedalThumbnail`
- `medalsStore.ts` con estado global de medallas del usuario

#### Sprint 4: Cámara, Fotos y Perfil
- expo-camera integrado con permisos y hook `useCamera`
- Modal de cámara funcional con preview y recaptura
- Supabase Storage configurado (buckets: `medal-photos`, `avatars`)
- `ImageService.ts` para compresión de imágenes
- `StorageService.ts` para subida a Supabase Storage
- Flujo completo: captura → compresión → subida → actualización BD
- Pantalla de edición de perfil (`edit-profile.tsx`)
- Cambio de foto de perfil y nombre de usuario funcional

#### Sprint 5: Galería y Favoritos
- Galería promovida de modal a tab principal (`gallery.tsx`)
- Sistema de favoritos completo con `FavoritesStore` y `FavoritesService`
- Componente `FavoriteButton` reutilizable con animación
- Filtros de estado (Obtenidas/No obtenidas) y favoritos en todas las vistas
- Componente `StatusFilterRow` reutilizable
- Sincronización de favoritos en tiempo real entre vistas

### Estructura Actual del Proyecto

```
frontend/
├── app/
│   ├── (auth)/              # login.tsx, signup.tsx, forgot-password.tsx
│   ├── (modals)/            # camera.tsx, edit-profile.tsx, friend-profile.tsx (placeholder)
│   ├── (tabs)/              # map.tsx, gallery.tsx, friends.tsx (placeholder), profile.tsx, progress.tsx
│   │   └── _layout.tsx      # Configuración de tabs (5 tabs)
│   ├── _layout.tsx          # Layout raíz
│   └── index.tsx            # Pantalla inicial
│
├── src/
│   ├── components/
│   │   ├── base/            # Componentes base
│   │   ├── camera/          # CameraPreview, CameraControls, PhotoPreview
│   │   ├── forms/           # LoginForm, SignupForm, etc.
│   │   ├── map/             # MapView, MapMarker, CategoryFilter, PlaceInfoCard
│   │   ├── medals/          # MedalCard, MedalThumbnail, CategoryProgressBar
│   │   ├── social/          # FriendCard.tsx (placeholder), FriendStats.tsx (placeholder), index.ts
│   │   └── ui/              # Button, Input, Card, SortChips, FavoriteButton, StatusFilterRow, etc.
│   │
│   ├── hooks/
│   │   ├── auth/            # useAuth, useSession
│   │   ├── camera/          # useCamera
│   │   ├── common/          # Hooks comunes
│   │   ├── data/            # useMedals, useMedalCollection, useUserStats, useFavorites
│   │   ├── location/        # useLocation, useProximityDetection
│   │   └── ui/              # Hooks de UI
│   │
│   ├── services/
│   │   ├── auth/            # authService.ts
│   │   ├── camera/          # cameraService.ts
│   │   ├── database/        # medalService.ts, userService.ts, FavoritesService.ts, FriendService.ts (placeholder)
│   │   ├── location/        # locationService.ts, proximityService.ts
│   │   ├── maps/            # Servicios de mapas
│   │   ├── notifications/   # Servicios de notificaciones
│   │   └── storage/         # StorageService.ts, ImageService.ts
│   │
│   ├── store/
│   │   ├── authStore.ts     # Estado de autenticación
│   │   ├── locationStore.ts # Estado de ubicación
│   │   ├── medalsStore.ts   # Estado de medallas del usuario
│   │   ├── favoritesStore.ts # Estado de favoritos
│   │   ├── userStore.ts     # Estado del perfil de usuario
│   │   └── index.ts         # Exports
│   │
│   ├── config/              # constants.ts, env.ts, permissions.ts
│   ├── types/               # api.ts, auth.ts, database.ts, friend.ts, location.ts, medal.ts, etc.
│   ├── styles/              # theme.ts, colors.ts, typography.ts
│   ├── utils/               # Utilidades y helpers
│   └── assets/              # Imágenes, fuentes, sonidos
```

### Navegación Actual (Tabs)
```
┌─────────┬──────────┬────────┬──────────┬─────────┐
│ Amigos  │ Progreso │  Mapa  │ Galería  │ Perfil  │
│ (users) │ (award)  │ (map)  │ (image)  │ (user)  │
└─────────┴──────────┴────────┴──────────┴─────────┘
```
> **Nota:** La tab "Amigos" es actualmente un **placeholder** sin funcionalidad. Este sprint la implementa completamente.

---

## Objetivo del Sprint 6

### Sprint Final de Desarrollo

Este es el **último sprint de desarrollo** de la aplicación. Implementa el **sistema social completo**:

1. **Sistema de amistades**: Conectar usuarios mediante códigos de amistad
2. **Pantalla de amigos**: Lista de amigos con estadísticas y solicitudes pendientes
3. **Perfil de amigo**: Vista detallada con galería de fotos del amigo
4. **Comparación de progreso**: Sistema de comparación lado a lado de medallas
5. **Gestión de amistades**: Añadir, aceptar, rechazar y eliminar amigos

---

## IMPORTANTE: Lógica del Sistema de Amistades

### Tabla `friendships` en Supabase

```sql
CREATE TABLE public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_friendship UNIQUE(user_id, friend_id),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected')),
    CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);
```

### Estados de la Relación

| Estado | Descripción |
|--------|-------------|
| `pending` | Solicitud enviada, esperando respuesta |
| `accepted` | Amistad confirmada, ambos son amigos |
| `rejected` | Solicitud rechazada, emisor bloqueado |

### Roles en la Tupla

| Campo | Rol |
|-------|-----|
| `user_id` | **Emisor** - Usuario que envía la solicitud |
| `friend_id` | **Receptor** - Usuario que recibe la solicitud |

### Flujo de Solicitudes de Amistad

#### 1. Enviar Solicitud (usuarioA → usuarioB)
```
Se crea tupla: { user_id: A, friend_id: B, status: 'pending' }
```
- usuarioA ve: "Solicitud enviada"
- usuarioB ve: Solicitud en "Solicitudes pendientes"

#### 2. Aceptar Solicitud
```
Se actualiza: status = 'accepted'
```
- Ambos usuarios aparecen como amigos del otro
- Query para obtener amigos: tuplas donde `(user_id = miId OR friend_id = miId) AND status = 'accepted'`

#### 3. Rechazar Solicitud
```
Se actualiza: status = 'rejected'
```
- **usuarioA (emisor) queda bloqueado**: No puede volver a enviar solicitudes a usuarioB
- **usuarioB (receptor) puede enviar**: Sí puede crear nueva solicitud a usuarioA

### ⚠️ Caso Especial: Inversión de Solicitud Rechazada

Cuando **usuarioB** (el que rechazó) quiere enviar solicitud a **usuarioA**:

1. **Existe tupla**: `{ user_id: A, friend_id: B, status: 'rejected' }`
2. **Acción**: Eliminar tupla existente
3. **Crear nueva**: `{ user_id: B, friend_id: A, status: 'pending' }`

**Razón**: Esto evita interbloqueos. Siempre habrá al menos 1 de los 2 usuarios que pueda iniciar una nueva relación.

### Validaciones al Enviar Solicitud

| Situación | Mensaje de Error |
|-----------|------------------|
| Código con formato incorrecto | "Código inválido" |
| Código no existe en BD | "Usuario no encontrado" |
| Es mi propio código | "No puedes añadirte a ti mismo" |
| Ya existe tupla con `status='accepted'` | "Ya sois amigos" |
| Soy `user_id` y `status='pending'` o `status='rejected'` | "Solicitud ya enviada" |
| Soy `friend_id` y `status='rejected'` | **Caso especial: invertir tupla** |
| Soy `friend_id` y `status='pending'` | "Este usuario ya te envió una solicitud" |

### Query para Obtener Amigos
```sql
SELECT * FROM friendships 
WHERE (user_id = $myId OR friend_id = $myId) 
  AND status = 'accepted';
```

### Query para Obtener Solicitudes Pendientes (entrantes)
```sql
SELECT * FROM friendships 
WHERE friend_id = $myId 
  AND status = 'pending';
```

---

## Funcionalidades a Implementar

### Pantalla `friends.tsx`

| Sección | Descripción |
|---------|-------------|
| **Header** | Título "Amigos" + botón "Añadir amigo" (lupa/+) |
| **Buscador desplegable** | Input con '#' fijo + campo para código (8 chars) + botón "+" |
| **Solicitudes pendientes** | Lista de solicitudes entrantes con botones Aceptar/Rechazar |
| **Lista de amigos** | FlatList con FriendCard, pull-to-refresh |
| **Empty state** | Mensaje motivador cuando no hay amigos |

### Buscador de Amigos (integrado en `friends.tsx`)

- Botón que despliega/oculta la barra de búsqueda (animación)
- Input con prefijo '#' fijo (no borrable), texto a la derecha
- Botón "+" deshabilitado si no hay exactamente 8 caracteres
- Validaciones según tabla anterior
- Mensaje de éxito/error inline
- Se oculta tras envío exitoso

### Perfil de Amigo (`friend-profile.tsx`)

| Elemento | Descripción |
|----------|-------------|
| Header | Foto grande + nombre del amigo |
| Estadísticas | Medallas obtenidas, % progreso, desglose por categoría |
| Código de amistad | Copiable |
| Galería | Grid 3 columnas con fotos de medallas del amigo |
| Acciones | "Comparar progreso", "Eliminar amigo" |

### Comparación de Progreso (`comparison.tsx`)

| Elemento | Descripción |
|----------|-------------|
| Header | "Yo vs [Amigo]" con fotos lado a lado |
| Resumen | "Tienes X medallas más" / "Tu amigo tiene X más" |
| Filtros | Todas, Solo amigo, Solo yo, En común |
| Lista | Medallas con indicadores de color (verde=ambos, naranja=solo amigo, azul=solo yo) |

---

## User Stories Relacionadas

### US-021: Conexión con amigos (5 pts)
**Como** usuario autenticado  
**Quiero** añadir amigos mediante su código único  
**Para** poder ver su progreso y compartir mi experiencia

### US-022: Comparación de progreso (5 pts)
**Como** usuario con amigos  
**Quiero** comparar mi progreso de medallas con el de un amigo  
**Para** motivarme a descubrir nuevos lugares

### US-023: Visualización de perfil de amigo (3 pts)
**Como** usuario con amigos  
**Quiero** ver el perfil detallado de un amigo  
**Para** conocer su progreso y las fotos que ha tomado

---

## Documentación de Referencia

Archivos clave para consultar:
- `docs/sprint_tasks/SPRINT_6_TASKS.md` — Detalle completo de tareas
- `docs/USER_STORIES.md` — US-021, US-022, US-023 y criterios de aceptación
- `docs/ARCHITECTURE.md` — Arquitectura y patrones del proyecto
- `backend/supabase/migrations/001_initial_schema.sql` — Esquema de BD incluyendo `friendships`
- `frontend/docs/COMPONENTS.md` — Documentación de componentes
- `frontend/docs/HOOKS.md` — Documentación de hooks

---

## Código Existente Relevante

### Placeholders a reemplazar:
| Archivo | Estado |
|---------|--------|
| `(tabs)/friends.tsx` | Placeholder vacío |
| `(modals)/friend-profile.tsx` | Placeholder vacío |
| `services/database/FriendService.ts` | Solo "// Placeholder" |
| `components/social/FriendCard.tsx` | Solo "// Placeholder" |
| `components/social/FriendStats.tsx` | Solo "// Placeholder" |

### Patrones a reutilizar:
| Archivo | Uso en Sprint 6 |
|---------|-----------------|
| `store/favoritesStore.ts` | Patrón para FriendsStore |
| `services/database/FavoritesService.ts` | Patrón para FriendService |
| `components/ui/FavoriteButton.tsx` | Patrón para animaciones |
| `(tabs)/gallery.tsx` | Referencia para grids de medallas |
| `(tabs)/profile.tsx` | Referencia para diseño de perfil |
| `components/medals/MedalCard.tsx` | Referencia para FriendCard |

### Tabla `users` (campos relevantes):
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    friend_code CHAR(8) UNIQUE NOT NULL,  -- Código de 8 caracteres para añadir amigos
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Instrucciones

**No implementes nada todavía.** Tu tarea ahora es:

1. **Explorar el repositorio** para comprender la estructura actual
2. **Leer la documentación** referenciada arriba
3. **Analizar el código existente** que se puede reutilizar
4. **Comprender la lógica de estados** de la tabla `friendships`
5. **Identificar** qué existe, qué se puede extender y qué hay que crear

### Entregables esperados

Genera un **resumen ejecutivo** que incluya:

1. **Confirmación de comprensión** del contexto, objetivos y lógica de amistades del Sprint 6
2. **Análisis del código existente** que se reutilizará o extenderá
3. **Plan de implementación** propuesto (orden de tareas, dependencias)
4. **Decisiones de diseño** importantes a considerar
5. **Riesgos identificados** y cómo mitigarlos
6. **Preguntas o aclaraciones** necesarias antes de comenzar

---

## Principios de Trabajo

- **Desarrollo incremental:** Verificar cada fase antes de continuar
- **Reutilización:** Priorizar código existente sobre crear nuevo
- **Consistencia:** Seguir patrones y convenciones del proyecto
- **Comunicación:** Consultar decisiones importantes antes de implementar
- **Calidad:** Testing manual de cada funcionalidad
- **UX:** Animaciones fluidas y experiencia coherente (app gamificada)
- **Lógica de estados:** Implementar correctamente los 3 estados de `friendships`

---

# Prompt 2

Excelente análisis. Voy a responder a tus preguntas para que puedas empezar el desarrollo de las Tareas del Sprint 6 según tu planificación:

## Aclaraciones de Diseño/UX
1. El contador de solicitudes entrantes solo es necesario que se muestre dentro de la pantalla, los iconos de Tab los quiero dejar sencillos por ahora.
2. El `FriendSearchBar` es una sección fija situada en la parte de arriba de la vista `friends.tsx`. Esta sección se expande y contrae desde un botón con texto "Añadir amigo" o con un icono de lupa, lo que mejor consideres que quedará visualmente. Debajo de esta sección de búsqueda aparecerá la sección de solicitudes entrantes, sección que solo se muestra si hay alguna solicitud entrante (si no la hay, no se muestra nada de eso, solo el buscador y la lista de amigos).
3. Sección de galería de amigo: Solo muestra las medallas obtenidas por el amigo. En la vista de comparación se podrá ver más fácilmente qué medallas le faltan al amigo.
4. Los filtos del modal de comparación no tiene por qué ser persistente, se pueden reiniciar al salir (elige la opción que mejor optimice el rendimiento). Me gustaría que haya 4 filtros (1 más de los que se indicaban): "Solo amigo", "Solo yo", "En común" y "Bloqueados". Este último filtro de bloqueados lo quiero añadir porque ayudaría a los usuarios a consultar qué medallas no tienen ninguno de los 2 para poder planificar ir a por ellas los 2 juntos.

## Aclaraciones Técnicas
5. Sí, los usuarios no pueden consultar perfiles que no sean el suyo o el de sus amigos aceptados, pero se necesita implementar una lógica que permita a todos los usuarios introducir códigos de amistad y que verifique si es válido. Para esto, añade la función RPC a uno de los scripts de migración de la carpeta `backend/supabase` para que lo ejecute manualmente en una terminal SQL de Supabase. Para esta parte, explícame bien qué debo hacer yo manualmente para que todo funcione bien.
6. Para tu pregunta de las estadísticas de amigo, yo no tengo preferencia entre calcular las stats en el frontend o crear una función RPC para ello. Yo no tengo tanta experiencia en desarrollo de aplicaciones móviles como tú, que eres el desarrollador experto. Como tú conoces más sobre casos como este, razona cuál de las 2 opciones es mejor, teniendo en cuenta tanto la optimización del rendimiento de la app como la implementación de buenas prácticas de desarrollo para el proyecto.
7. Todavía no hay push notifications configuradas. Decide si implementarlas ahora o si hacer que solo se actualice al hacer pull-to-refresh, que sería una opción más simple pero funcional.

## Aclaraciones adicionales
8. Hay que gestionar el botón de "favoritos" en las tarjetas desplegables de las medallas de las vistas del amigo. Debemos decidir si mostrar el botón para marcar como favoritos (fácil acceso para guardar medallas según interés compartido o "me falta por hacer esta para igualarte") o no (más limpio). Si decides implementar el botón, la lógica de favoritos será la del propio usuario, no la del amigo. No se puede consultar los favoritos del amigo. Si decides no implementar el botón no habrá que gestionar nada de esto. Mi propuesta es no implementar botón de favoritos en la vista `friend_profile.tsx` para no causar confusión al usuario, y razonar bien si implementarlo en la vista de comparación, que ahí podría tener sentido para facilitar el acceso a "marcar" medallas, pero a lo mejor también causa confusión de si el favorito es del usuario o de su amigo. Razona sobre esto y elige la mejor opción para el UI/UX, explicando por qué.
9. Actualmente tenemos un userStore (y su hook) como placeholder que no hemos necesitado durante el desarrollo de este proyecto. No sé si es útil y si deberíamos desarrollar su lógica e implementarlo en el código actual para mejorar el diseño estructural de esta o no. Lo prioritario es que el proyecto tenga un código profesional y que siga en todo momento las mejores prácticas de desarrollo. Analiza el código para entender si deberíamos utilizar userStore o eliminarlo. Explícame para qué serviría en caso de utilizarse, si tiene sentido su uso en el proyecto actual y tu decisión tomada.

Confirmo tu comprensión del contexto y tu plan de implementación propuesto. Comprende todas las aclaraciones que te he realizado y comienza con el desarrollo completo del Sprint 6 fase a fase, explicando todo lo que hagas.

---

# Prompt 3

Ya he ejecutado la nueva migración y actualizado los tipos de supabase. Has realizado un muy buen trabajo implementando la gran mayoría del Sprint 6. Sin embargo, hay varias cosas que fallan que debes revisar para arreglar, mejorar o resolverme dudas. Como experto desarrollador que eres, analiza cada caso que te presento por separado, de 1 en 1, razona de qué trata cada uno y qué decisión tomar en cada caso, explícandome tu razonamiento en cada uno:

## Errores Funcionales
- Error en `FriendService.ts` en línea 158:
```
Type '{ created_at: string; friend_id: string; id: string; status: string; updated_at: string; user_id: string; }[]' is not assignable to type 'FriendshipRow[]'.
  Type '{ created_at: string; friend_id: string; id: string; status: string; updated_at: string; user_id: string; }' is not assignable to type 'FriendshipRow'.
    Types of property 'status' are incompatible.
      Type 'string' is not assignable to type 'FriendshipStatus'.ts(2322)
friend.ts(132, 5): The expected type comes from property 'data' which is declared here on type 'FriendServiceResult<FriendshipRow[]>'
```

- Las funciones 'deleteFriend' de `friendStore.ts` y 'removeFriend' de `FriendService.ts` están mal definidas:
  - `FriendService.ts`: Su función 'removeFriend' tiene como parámetro único "friendshipId".
  - `friendStore.ts`: Su función 'deleteFriend' tiene como parámetros "friendshipId" y "userId", pero este último no se utiliza nunca (porque la función del servicio no lo necesita).
  - `friend-profile.tsx`: Es el único archivo que utiliza esa función, llamando a 'deleteFriend' únicamente utilizando como argumento 'profile.id', que creo que es el id del amigo. Creo que `fiend-profile.tsx` no tiene acceso directo al 'friendshipId' que necesita 'deleteFriend' y 'removeFriend'.
  - Debes cambiar la lógica de esta función de eliminar para que haga una de estas 2:
    - Si `friend-profile.tsx` puede conocer el 'friendshipId' de manera sencilla, cambia el método 'deleteFriend' de `friendStore.ts` para que solo necesite el 'friendshipId' y que `friend-profile.tsx` llame a esa función con el 'friendshipId' como argumento.
    - Si no es tan sencillo que "conozca" el 'friendshipId' y consideras que la lógica sería más rápido utilizando 'user_id' + 'friend_id' para eliminar una tupla específica, podemos cambiar la lógica de las funciones para que utilicen esos 2 valores para buscar la tupla exacta en vez del 'friendshipId'. En este caso, deberías hacer que `friend-profile.tsx` llame a la función 'deleteFriend' con 'profile.id' y el propio id del usuario, `friendStore.ts` hará lo mismo para llamar a la función 'removeFriend' de `FriendService.ts`. Analiza el contexto entero del archivo `friend-profile.tsx`, determina cómo de sencillo y "óptimo" es que tenga acceso al valor del 'friendshipId' y toma la decisión de diseño a partir de la conclusión que saques. Debes implementar la solución decidida y explicármela.

## Errores Visuales
- No quiero que el avatar por defecto de los amigos sea el logo de la app, sino que sea el icono de usuario básico que se muestra en la vista `profile.tsx` cuando el usuario no tiene una imagen de perfil. Revisa cómo se hace ese icono de usuario "placeholder" en las vistas `profile.tsx` y `edit-profile.tsx` para implementarlo de igual manera a la vista de perfil de amigo, en la `FriendCard.tsx`, en la `FriendRequestCard.tsx` y en todos los componentes en los que se muestre la foto de perfil de un amigo.

## Dudas de diseño estructural
- Has definido los tipos 'UserMedalStats' y 'CategoryStats' en `types/friend.ts` pero creo que sería mejor definir esos tipos en `types/medal.ts`, dejando el archivo de tipos `types/friend.ts` únicamente para los componentes sociales. Respecto al tipo 'FriendMedal', creo que podría ir tanto en `types/friend.ts` como en `types/medal.ts`. ¿Dónde consideras que tiene más sentido definir 'FriendMedal'? Indica dónde consideras que es mejor incluir cada tipo de los que te he mencionado.

- He visto que los archivos de tipos `types/auth.ts`, `types/navigation.ts`, `types/user.ts` y `components/social/FriendList.tsx` son placeholders que no se utilizan para nada en la app. Al igual que has revisado la utilidad de userStore antes, revisa el código actual para determinar si merece la pena desarrollar alguno de estos archivos para mejorar el código o si no es necesario su uso (no mejorarían la lógica ni harían el código "más profesional"). Explica tu razonamiento sobre esto.

- Hay muchos archivos de hooks que siguen siendo placeholders y que no utilizamos. El que creo que más posible deberías desarrollar y utilizar es el de `hooks/data/useFriends.ts`, ya que tienes implementado el Store para amigos, tendría sentido utilizar un hook para controlar mejor su estado, ¿no? Explica qué opinas sobre esto.

- Otros hooks que son placeholders y que no se utilizan: `hooks/camera/useImagePicker.ts`, `hooks/common` (la carpeta entera), `hooks/data/useUser.ts`, `hooks/data/useUserStats.ts`, `hooks/location/useGeofencing.ts`, `hooks/location/useNearbyMedals.ts` y la carpeta `hooks/ui` entera. De todos los archivos que te he mencionado, investiga qué archivos debemos desarrollar e implementar a la app y cuáles no supondría ninguna mejora al proyecto. La aplicación debe ser lo más profesional posible, si algún archivo supone algo de mejora en cuanto a "buenas prácticas", impleméntalo. Si algún archivo no supone ninguna mejora, elimínalo.

- Por alguna razón, 'renderRequest' de `friend.tsx` se declara pero no se utiliza nunca. Revisa qué es, para qué sirve y si necesitamos utilizarlo pero está mal referenciado en algún otro sitio.

---

# Prompt 4

Genial, me parecen muy bien las decisiones y arreglos que has realizado. Necesito que me ayudes con algunas cuestiones más, revísalas y soluciónalas de 1 en 1, explicando tu razonamiento para cada una:

## Cuestiones de diseño estructural
- Has hecho un buen análisis de dónde colocar cada tipo. Me parece bien que muevas 'UserMedalStats' y 'CategoryStats' a `medal.ts`, implementa el cambio.

- Entiendo que, según dices, implementar un hook `useFriends.ts` sería un simple wrapper de 'useFriendsStore' de `friendsStore.ts`, siendo redundante y sin aportar nada más. Pensaba que siempre había que definir un hook para cada Store, como lo he hecho hasta ahora en el desarrollo del proyecto. Revisa si el resto de hooks existentes son útiles de verdad y justifican su existencia o si son solo simples wrappers de los store y recomiendas eliminarlos. Prioriza el uso de las buenas prácticas de desarrollo y el conseguir un código profesional con una buena arquitectura definida para tomar tu decisión.

## Componentes de frontend que hay que añadir
- ¿Por qué no está implementado el detalle de medalla en `friend-profile.tsx` al pulsar sobre una medalla obtenida del amigo? Debería desplegarse y mostrarse de igual manera que se muestran las medallas en la vista `gallery.tsx`, permitiendo ver la imagen de la medalla del amigo en pantalla completa (al pulsar sobre ella), algo de información sobre la medalla yel botón "Ver en el mapa". Consulta las tarjetas desplegadas de medallas de la vista `gallery.tsx` para saber cómo implementar en `friend-profile.tsx` la tarjeta desplegada de amigo.

- `comparison.tsx` tampoco tiene el detalle de medalla. Esta tarjeta que se despliegue al pulsar sobre una medalla debería ser algo distinta a las demás, ya que se trata una vista de comparación entre 2 cuentas. Podríamos mostrar las imágenes de ambas cuentas (una a la izquierda y otra a la derecha) y cuándo la consiguió cada uno, información central de la tarjeta y un botón central en la parte de abajo de "Ver en el mapa". Si uno de los 2 usuarios no tiene conseguida la tarjeta, se debería mostrar en su lado de la tarjeta un mensaje "No ha conseguido esta medalla todavía" o algo parecido, con un icono de 'bloqueado'. ¿Qué opinas sobre esta idea para esta tarjeta desplegada de comparación? ¿Deberíamos implementar el componente de tarjeta dentro de `comparison.tsx` o crear un archivo `ComparisonMedal.tsx` dedicado a este componente? Toma las mejores decisiones de diseño para este componente, créalo e impleméntalo.

- En la vista `friend-profile.tsx`: Debes implementar un botón "Atrás" en la esquina superior izquierda con un icono de flecha hacia la izquierda (convencional) para devolver a la vista principal de Friends. Implementa este botón también en la esquina de arriba a la izquierda de la vista de comparación para que devuelva a la vista de perfil del amigo.

## Cuestiones de gestión de estado actualizado
- Al enviar una solicitud a la cuenta de un amigo con username 'Tomypv' me ha aparecido el mensaje "Solicitud enviada a 'Usuario'", en vez de ponerme el nombre del usuario "Tomypv". En la otra cuenta, se me indica que la solicitud viene de 'Usuario desconocido'. Cuando he aceptado la amistad sí que me ha aparecido el nombre de la otra cuenta 'Tomy2'. Al parecer no está pudiendo obtener el username del otro usuario hasta que no sea amigo porque no estamos utilizando bien la función RPC que hemos añadido para esto. Con esa función podemos obtener los datos básicos de otros usuarios para añadirlos como amigos.

- Al iniciar sesión con la cuenta 'Tomypv' y cargar la vista de amistades, no me aparecía la tarjeta de solicitud pendiente al cargarse la vista. Solo se ha mostrado cuando he hecho refresh manual. Entiendo que, según me indicaste, implementar que el estado de las solicitudes entrantes se actualice automáticamente puede ser algo complejo, pero debería cargarse el estado actualizado AL MENOS al cargar la vista de amigos por primera vez (al hacer login, como he hecho). Luego puede no volverse a actualizar el estado por optimización de recursos, y que solo lo haga si se hace un refresh manual, pero en el primera carga es obligatorio que se cargue bien el estado de las amistades y solicitudes.

- Al actualizar la foto de perfil de mi usuario y meterme en el perfil de otro para compararnos, la vista de comparación no muestra mi foto actual. No se actualiza el estado de esta vista al cargarse ni al hacer refresh. La vista `friend-profile.tsx` y la vista `comparison.tsx` deben refrescar su estado al cargarse y al recargarse, asegurando así que siempre muestran información actualizanda tanto de las medallas como de información de los perfiles (nombre de usuario, imagen de perfil...).

---

# Prompt 5

Muy bien, has corregido y mejorado bastantes cosas, pero todavía te falta por ajustar algunas más. Te las detallo a continuación para que las analices y razones de 1 en 1:

## Aspectos importantes (ARREGLAR)
- Los 2 botones de 'Ver en el mapa' que has implementado no funcionan bien, a diferencia de los de `gallery.tsx` y `MedalCard.tsx`, que son perfectos. Los botones 'Ver en el mapa' de las vistas de `friend-profile.tsx` y `comparison.tsx` redirigen a la vista del mapa y despliegan la tarjeta de información de la medalla, pero no se colocan bien las coordenadas ni el zoom de la vista (cosa que debería hacerse automáticamente si la vista 'mapa' se ha navegado con parámetros, puedes comprobar la lógica de esto en el archivo `map.tsx`). Además, estos 2 botones provocan que se pierdan los estados guardados de las vistas `map.tsx`, `progress.tsx` y `gallery.tsx`, haciendo que se tengan que cargar de nuevo desde 0 al visitarlas. Esto no ocurre con los botones 'Ver en el mapa' que tenemos bien desarrollados en `gallery.tsx` y `MedalCard.tsx`, el estado está siempre cargado y la transición es fluida, sin esperas de carga. Revisa cómo se implementó el botón 'Ver en el mapa' en esos 2 casos y comprende qué está fallando de tu implementación. Utiliza como base el diseño de implementación de los casos buenos. Una cosa que deberías cambiar (entre varias), es que la lógica de redirigir a mapa de las tarjetas de comparación no debería estar en el componente de la vista `comparison.tsx`, sino en el componente de tarjeta `ComparisonMedalDetail.tsx` (donde está el botón). Existe un caso parecido a este con la vista 'Progress' y las tarjetas MedalCard, y en ese caso la lógica de redirigir con 'router.push' está definido en el componente de tarjeta, no en el archivo de la vista. Analiza en profundidad todo esto y haz de nuevo estos componentes basándote en los casos que lo tenemos hecho correctamente.

- Los estados de la vista `friends.tsx` no están tan bien gestionados como lo están los de las otras vistas. Creo que no maneja bien la liberación de los estados guardados al cerrar sesión o cerrar la app. Debido a esto, ocurre un error muy grave: Al entrar iniciar sesión con otra cuenta, todas las vistas cargan su estado al entrar en ellas excepto la de Friends, que mantiene el estado anterior (me muestra los amigos de la cuenta anterior). De hecho, puede ocurrir incluso que, si la cuenta anterior tiene añadido como amigo a 'Tomypv', cierra sesión e inicia sesión la cuenta de 'Tomypv', este se verá a sí mismo en la vista de amigos, pudiendo visitar su propio perfil de amigo y compararse consigo mismo. Te he adjuntado una captura de pantalla sobre este curioso caso. Debes gestionar mucho mejor el estado con Zustand para las 3 vistas nuevas de este Sprint.

- Relacionado con el problema de la mala gestión de estado: No creo que recargar manualmente el estado de profile cada vez que se cargue la vista de comparación sea una buena solución al problema que teníamos antes de que no aparecían actualizados los datos del propio usuario si cambiaba su foto de perfil o nombre de usuario. La solución para esto es que las acciones de cambiar la foto de perfil (tanto desde `profile.tsx` como en `edit-profile.tsx`, que se puede cambiar en ambas vistas) y de cambiar el username (desde `edit-profile.tsx`) deben forzar la actualización el estado global de Auth (profile, user o como se llame, el estado que contiene los datos del usuario). Se debe forzar al provocarse el cambio de alguno de estos valores. La lógica de favoritos es similar, se actualiza el estado global de favoritos para todas las vistas en cuanto se cambie el valor de favorito de una medalla en cualquier vista. Analiza en profundidad el código actual para comprender las grandes fallas de gestión de estado que presentan actualmente las 3 vistas y arréglalas para que utilicen una gestión de estado profesional, optimizando los tiempos de carga y asegurando que todas las vistas mostrarán la información correcta siempre (si el estados globales gestionados por Zustand se actualizan cuando deban, esto estará bien gestionado siempre). Por ejemplo, si realizamos bien una gestión global del estado de las apariciones del usuario en la tabla 'friendships' no sería necesario forzar cargas de peticiones pendientes cada vez que se entra en la vista, con el estado actualizado se mostrarían siempre que se tenga que mostrar, si necesidad de comprobarse constantemente, confiando en que el valor se actualice siempre que ocurra algún cambio (y cuando se cargue la vista por primera vez).

## Aspecto importante (Implementar correctamente)
- Implementa el componente de filtros por categoría en la vista `comparison.tsx`, debajo del ComparisonHeader y encima de los filtros de "Todas", "Solo amigo", "Solo yo"... Creo que puede quedar muy bien ahí este filtro para hacer comparaciones específicas por categorías. Ajusta la lógica para que este filtro se aplique a todo, incluso a las estadísticas del componente de comparación ComparisonHeader, mostrando solo las cantidades de las medallas filtadas. Por ejemplo, si se filtra por "Deporte", se deberá mostrar el número de medallas de deporte que tiene cada user y qué porcentaje del total de medallas de deporte tienen cada uno.

## Aspectos menores (Ajustar)

- Combina las 2 migraciones que has creado para funciones rpc en un único archivo de migración (006_rpc_...)

- Creo que deberíamos cambiar la ubicación de `CategoryFilter.tsx` de `components/map` a `components/ui` (donde están el resto de componentes de filtro). Dime tu opinión sobre esto y ajusta lo que consideres.

---

# Prompt 6

Buen trabajo, has solucionado bien las cuestiones que te indiqué. Sin embargo, uno de los cambios que has realizado en la gestión del estado ha provocado un nuevo error que debes solucionar. A continuación te detallo ese error y algunas cuestiones más que debes analizar, razonar, explicar y resolver:

## Aspectos importantes de la gestión de estado

- Me has indicado que has añadido una limpieza de `friendStore`, `favoriteSotre` y `medalsStore` al cerrar sesión el usuario. Esta limpieza está bien para la mayoría de datos que no se necesitan en la nueva sesión (el otro usuario no tiene esos amigos, favoritos y medallas completadas). Sin embargo, limpiar el medalStore hace que también elimines el caché de TODAS las medallas, algo que es común para todos los usuarios y que no se debería eliminar. Además, la lógica actual no es correcta, ya que no se cargan las medallas automáticamente al iniciar sesión. Al tener estas 2 cosas (se elimina el caché de todas las medallas + no las cargamos al iniciar la app si no están cargadas) ocurre un bug al entrar en la app iniciando sesión, mostrando las vistas sin medallas. Como se muestra en las capturas de pantalla que te he adjuntado, he iniciado sesión con una cuenta y me aparecen todas las vistas vacías, sin medallas cargadas. Debemos hacer que el caché de las medallas totales, que es general para todos los users, no se elimine al cerrar sesión. Además, debemos implementar una lógica que compruebe si existe caché de medallas al entrar en la app. Si existe, utiliza el caché; si no existe, provoca la carga de todas las medallas.

- No sé hasta qué punto es la mejor opción la solución que hemos tomado de limpiar todos los estados al cerrar sesión. Estoy pensando que otra opción sería no eliminarlos al cerrar sesión (por si el mismo usuario vuelve a meterse, ya tiene sus datos cargados), y gestionar el estado añadiendo una lógica al iniciar la app que verifique si los estados están actualizados y corresponden al del usuario activo que ha iniciado sesión. Si algún estado no está actualizado, provoca su carga. De esta manera, ya se quedarían cargados en caché todos los datos del user activo (amigos, favoritos, medallas conseguidas...). Estos estados también están gestionados para actualizarse automáticamente al provocarse un cambio en alguno de ellos: se ha hecho una nueva solicitud, ha llegado una solicitud, se ha obtenido una medalla, se ha guardado una medalla como favorita... ¿Qué opinas de esta propuesta de gestión de estado? Verifica la lógica actual y dime qué partes de lo que he descrito está implementado (qué lógica de gestión de estado tenemos), y qué partes tenemos diferente. Razona si es mejor mantener la lógica actual o cambiarla a esta otra propuesta. Como desarrollador senior experto que eres, toma la decisión que asegure un código más profesional y funcional.

## Ajuste de lógica de comparación

- En el archivo `ComparisonHeader.tsx`: Se muestran estadísticas de cada usuario de la comparación que cambian según la categoría filtrada (el número total de medallas de cada usuario cambia al filtrar por 'Deporte' para mostrar el número de medallas de deporte que tiene cada uno). Todo en esta vista funciona bien excepto las barras de progreso comparativas, que siempre mantienen el máximo (100%) con el número total de medallas. Esto significa que si un usuario tiene 2 medallas de Deporte de las 5 que existen, no se muestra que el usuario lleva un 2/5 -> 40% del progreso de esa Categoría que se ha indicado como filtro, sino se muestra un 2/40 (número total de medallas) -> 5%, indicando que el progreso es mucho menor. Estas barras sí que utilizan bien el número filtrado de medallas OBTENIDAS por cada usuario en esa categoría, pero no ajustan bien el número de medallas TOTAL para esa categoría filtrada. Ajusta esto.

---

# Prompt 7

Genial, excelente trabajo. Vamos a terminar ya lo que falta del Sprint 6. Debes revisar 3 cosas más y actualizar todos los archivos de documentación del programa para dejarlos en su estado final de entrega.

## Primera tarea
Resuelve las siguientes cuestiones de 1 en 1:
- Aunque sí que comprobaste bien que el estado de Auth con la data del usuario se refresca automáticamente al actualizar datos en `edit-profile.tsx`, no ajustaste `profile.tsx` para que haga lo mismo al actualizar la foto de perfil, que también se puede editar desde esa vista. Al confirmarse el cambio de foto de perfil en esta vista, se deberá forzar la actualización del estado, lo cual nos asegurará que el avatar esté actualizado en todas las vistas, incluida la vista de `comparison.tsx`.
- En `comparison.tsx`: Has añadido una sección en la que se extraen las categorías de las medallas, pero esto no es óptimo, teniendo en cuenta que puede utilizar el tipo 'Category' que exporta `types/medal.ts`, obtenidas directamente de la tabla de categorías de la database. Otras vistas que necesitan conocer las categorías, como `progress.tsx`, las obtienen de esta manera. Mejora `comparison.tsx`.
- Has añadido una nueva lógica para que se refresquen los estados si se detectan que los datos del usuario no están cargados. Con esto, ¿es necesario mantener también la limpieza de estados que has puesto en `authStore.ts` al cerrar sesión? Se supone que si gestionamos bien todos los estados para que se mantengan actualizados y coherentes para cada usuario, no haría falta esta limpieza. Además, si el mismo usuario vuelve a iniciar sesión puede aprovecharse de los datos cargados en caché de su sesión anterior. Si es otro usuario el que entra, esto se detectaría rápido y se cargarían los datos actualizados del usuario. ¿Esto que he descrito es como funciona? Analiza si debes quitar las limpiezas de todos los Store en `authStore.ts` o no.

## Segunda tarea
Revisa todos los archivos de documentación que te he adjuntado y verifica su estado con un análisis del proyecto y el código. Debes asegurarte de que, después de tu revisión, todos los archivos de documentación estén actualizados y reflejen el estado final del proyecto, incluyendo todo lo que hemos implementado en este Sprint 6. Son muchos archivos de documentación que debes revisar y dejar en su estado final, explora cada 1 de 1 en 1:
- `./README.md` 
- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/SECURITY.md`
- `docs/SETUP.md`
- `docs/USER_STORIES.md`
- `frontend/README.md`
- `frontend/docs/COMPONENTS.md`
- `frontend/docs/HOOKS.md`
- `frontend/docs/NAVIGATION.md`
- `frontend/docs/STYLING.md`
- `backend/README.md`
- `backend/docs/API.md`
- `backend/docs/DATABASE.md`
- `backend/docs/DEPLOYMENT.md`
- `backend/docs/FUNCTION.md`

---

# Prompt 8

Excelente trabajo, ya estamos en el último paso antes de cerrar el desarrollo completo del proyecto. Analiza y completa paso a paso las siguientes tareas relacionadas con la gestión de estados y caché:

- Si mantenemos finalmente la limpieza de los estados del usuario anterior al cerrar sesión, sabemos que el siguiente usuario que inicie sesión en ese dispositivo no cargará la caché de otro usuario, estará vacía así que cargará sus propios datos. Si mantenemos esta lógica, no tiene sentido que tengamos comprobaciones en los Stores de si el usuario actual es el propietario de los datos del estado (para saber si actualizar o no). Esto es redundante: sabemos que SIEMPRE va a ser propietario de los datos cargados, ya que carga sus datos al iniciar sesión. Debemos quitar esa lógica obsoleta, asegurándonos que carga los datos al iniciar la aplicación y cada vez que ocurre algún cambio importante (cambio de favorito, medalla conseguida, cambio de username/avatar, añadir o eliminar amigo, nueva solicitud de amistad...). Si gestionamos que la aplicación cargue los datos de los estados al arrancar y que se actualicen cuando deban, sabemos que el usuario SIEMPRE verá SUS datos ACTUALIZADOS en todo momento. Revisa la gestión de estados por última vez y modifícala para que siga esta lógica, asegurándote de que no hay comprobaciones redundantes como las que tenemos ahora, y que los datos estarán actualizados en todo momento. Por ahora no hemos necesitado crear un hook 'useFriend', si lo necesitas para implementar esta versión final de gestión de estado, hazlo.

- Documenta en SECURITY.md la buena gestión de estado que hemos implementado según usuario, asegurándonos de limpiar los estados personales al cerrar sesión por si otro usuario inicia sesión en el mismo dispositivo, para que no cargue la caché de otro user.

- Actualiza los archivos de documentación que todavía mencionen la implementación anterior, asegúrate que todo lo documentado refleja la situación final actual del proyecto.

---

# Prompt 9

Tus últimos cambios tienen algunos errores y cosas mal gestionadas que han petado la aplicación. Revisa los logs que te adjunto para entender los problemas, razonar qué pasa y por qué y solucionarlo. Debes explicarme todo para que lo entienda, quiero conocer la causa de los errores y la solución que planteas para cada uno. Al terminar de corregir los errores, revisa todo el resto de archivos que has modificado para la gestión de estado para verificar que no hay más errores o cosas mal tratadas o hechas de manera poco optimizada.

Logs de los errores por consola:
```
 LOG  [LocationStore] 🗺️ Simulando tracking con ubicación mockeada
 LOG  [NavigationGuard] Estado: {"hasUser": true, "inAuthGroup": false, "inModalsGroup": false, "inTabsGroup": true, "isAuthenticated": true, "segments": "(tabs)/progress"}
 LOG  [NavigationGuard] Estado: {"hasUser": true, "inAuthGroup": false, "inModalsGroup": false, "inTabsGroup": true, "isAuthenticated": true, "segments": "(tabs)/gallery"}
 ERROR  Warning: The result of getSnapshot should be cached to avoid an infinite loop

Call Stack
  RNSScreenContainer (<anonymous>)
  ScreenContentWrapper (<anonymous>)
  RNSScreenStack (<anonymous>)
  RNCSafeAreaProvider (<anonymous>)
  App (<anonymous>)
  ErrorOverlay (<anonymous>)
 LOG  [NavigationGuard] Estado: {"hasUser": true, "inAuthGroup": false, "inModalsGroup": false, "inTabsGroup": true, "isAuthenticated": true, "segments": "(tabs)/friends"}
 LOG  [FriendsStore] Solicitudes pendientes: 0
 LOG  [FriendsStore] Amigos cargados: 1
 ERROR  Warning: Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.

This error is located at:

Call Stack
  RNSScreenContainer (<anonymous>)
  ScreenContentWrapper (<anonymous>)
  RNSScreenStack (<anonymous>)
  RNCSafeAreaProvider (<anonymous>)
  App (<anonymous>)
  ErrorOverlay (<anonymous>)
```

---

# Prompt 10

Perfecto, confirmo que el proyecto se encuentra en un estado final correcto y que podemos concluir este Sprint. Únicamente necesito que cambies una cosa más del código sobre la gestión de estados de amigos, para que se actualice cuando debe:

- Aceptar una solicitud de amistad no actualiza el estado de 'friends'. He aceptado una amistad nueva en la vista `friends.tsx`, lo que debería haber hecho que se muestre la tarjeta del nuevo amigo, pero no se ha mostrado nada hasta que he hecho un refresh manual. El estado de las amistades debe actualizarse automáticamente al aceptar o rechazar una solicitud de amistad, al igual que cuando se elimina una amistad. Esta actualización del estado automática es similar a la que ocurre cuando se cambia la foto de perfil, que esa acción activa el refresh manual del estado para actualizar el estado global correctamente. Gestiona esto para el estado de 'friends' en el código y continúa con lo siguiente que te explico.

Cuando termines con esa tarea, realizaré los commits y el Pull Request de esta rama para subir todos los cambios que hemos realizado en el Sprint 6. Analiza los #changes realizados en esta rama para indicarme qué commits hacer. Debes decirme cuántos commits hacer, qué archivos meter en cada uno y qué descripción breve le pongo a cada commit. No es necesario que hagas los comandos para ejecutar en terminal, únicamente debes razonar cómo distribuir los archivos de #changes en commits y los comentarios de cada commit (sigue las convenciones típicas de comentarios de commits, hazlos breves y en inglés). Finalmente, escribe un comentario para añadir al Pull Request como resumen de lo realizado en este Sprint 6.

Archivos a commitear:
```
$ git status
On branch feature/social
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   README.md
        modified:   backend/README.md
        modified:   backend/docs/API.md
        modified:   backend/docs/DATABASE.md
        modified:   backend/docs/DEPLOYMENT.md
        modified:   backend/docs/FUNCTION.md
        modified:   backend/supabase/migrations/003_auth_triggers.sql
        modified:   backend/supabase/migrations/004_rpc_validation_functions.sql
        modified:   backend/supabase/migrations/005_create_storage_buckets.sql
        modified:   docs/ARCHITECTURE.md
        modified:   docs/README.md
        modified:   docs/SECURITY.md
        modified:   frontend/README.md
        modified:   frontend/app/(auth)/forgot-password.tsx
        modified:   frontend/app/(auth)/login.tsx
        modified:   frontend/app/(auth)/signup.tsx
        modified:   frontend/app/(modals)/camera.tsx
        modified:   frontend/app/(modals)/edit-profile.tsx
        modified:   frontend/app/(modals)/friend-profile.tsx
        modified:   frontend/app/(tabs)/friends.tsx
        modified:   frontend/app/(tabs)/gallery.tsx
        modified:   frontend/app/(tabs)/map.tsx
        modified:   frontend/app/(tabs)/profile.tsx
        modified:   frontend/docs/COMPONENTS.md
        modified:   frontend/docs/HOOKS.md
        modified:   frontend/docs/NAVIGATION.md
        deleted:    frontend/src/assets/data/categories.json
        deleted:    frontend/src/assets/data/defaultMedals.json
        deleted:    frontend/src/assets/data/salamancaPoints.json
        deleted:    frontend/src/components/map/CategoryFilter.tsx
        modified:   frontend/src/components/map/index.ts
        modified:   frontend/src/components/medals/MedalCard.tsx
        modified:   frontend/src/components/medals/MedalThumbnail.tsx
        modified:   frontend/src/components/social/FriendCard.tsx
        deleted:    frontend/src/components/social/FriendList.tsx
        modified:   frontend/src/components/social/FriendStats.tsx
        modified:   frontend/src/components/social/index.ts
        modified:   frontend/src/components/ui/StatusFilterRow.tsx
        modified:   frontend/src/components/ui/index.ts
        deleted:    frontend/src/config/env.ts
        deleted:    frontend/src/hooks/camera/useImagePicker.ts
        deleted:    frontend/src/hooks/common/index.ts
        deleted:    frontend/src/hooks/common/useAsyncStorage.ts
        deleted:    frontend/src/hooks/common/useDebounce.ts
        deleted:    frontend/src/hooks/common/usePermissions.ts
        modified:   frontend/src/hooks/data/index.ts
        modified:   frontend/src/hooks/data/useFavorites.ts
        modified:   frontend/src/hooks/data/useFriends.ts
        modified:   frontend/src/hooks/data/useMedals.ts
        deleted:    frontend/src/hooks/data/useUser.ts
        deleted:    frontend/src/hooks/data/useUserStats.ts
        deleted:    frontend/src/hooks/location/useGeofencing.ts
        deleted:    frontend/src/hooks/location/useNearbyMedals.ts
        deleted:    frontend/src/hooks/ui/index.ts
        deleted:    frontend/src/hooks/ui/useModal.ts
        deleted:    frontend/src/hooks/ui/useRefresh.ts
        deleted:    frontend/src/hooks/ui/useToast.ts
        modified:   frontend/src/lib/supabase.ts
        modified:   frontend/src/services/database/FriendService.ts
        modified:   frontend/src/services/database/index.ts
        modified:   frontend/src/store/authStore.ts
        modified:   frontend/src/store/favoritesStore.ts
        modified:   frontend/src/store/index.ts
        modified:   frontend/src/store/medalsStore.ts
        deleted:    frontend/src/store/userStore.ts
        deleted:    frontend/src/types/auth.ts
        modified:   frontend/src/types/database.ts
        modified:   frontend/src/types/friend.ts
        modified:   frontend/src/types/index.ts
        modified:   frontend/src/types/medal.ts
        deleted:    frontend/src/types/navigation.ts
        deleted:    frontend/src/types/user.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        backend/supabase/migrations/006_rpc_friend_functions.sql
        frontend/app/(modals)/comparison.tsx
        frontend/src/components/social/ComparisonCard.tsx
        frontend/src/components/social/ComparisonHeader.tsx
        frontend/src/components/social/ComparisonMedalDetail.tsx
        frontend/src/components/social/FriendRequestCard.tsx
        frontend/src/components/social/FriendSearchBar.tsx
        frontend/src/components/ui/CategoryFilter.tsx
        frontend/src/store/friendsStore.ts
```

---


-- Prompts para solucionar problemas de gestión de estado de amistad...--

---

# Prompt 11

Bien, has solucionado el problema del bucle, pero la gestión de estado de `friend-profile.tsx` sigue siguiendo muy mala, las medallas del amigo no se ven actualizadas. Hay que arreglar la gestión de estado de esta vista:

## Qué debes hacer
- Analizar cómo se gestiona el estado correctamente en otras vistas parecidas, como `comparison.tsx` o `gallery.tsx`
- Identificar todas las malas prácticas que están implementadas ahora mismo en `friend-profile.tsx`, como utilización de useEffect, useFocusEffect y useState en cosas que deberían gestionarse mediante el hook 'useFriend'.
- Razonar cómo implementarás una buena gestión de estado con la utilización del hook 'useFriend' en los sitios que se necesiten, en vez de otros métodos menos óptimos. Puedes basarte en otros archivos bien implementados para saber cómo gestionar el estado en este caso
- Reportar tus cambios: indica qué cosas estaban mal y cómo se gestiona ahora el estado.