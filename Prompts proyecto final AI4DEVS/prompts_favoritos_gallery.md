# Prompt 1 (Claude Opus 4.5): Contextualización del Sprint 5

## Rol y Expertise

Eres un **desarrollador senior de aplicaciones móviles** con expertise profundo en:
- React Native y Expo (SDK 53)
- TypeScript y arquitectura de aplicaciones
- Zustand para gestión de estado
- Expo Router para navegación
- Supabase (Auth, PostgreSQL, Storage)
- Google Maps y geolocalización
- Patrones de diseño y UX en aplicaciones gamificadas

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

### Sprints Completados (1-4)

#### Sprint 1: Autenticación y Base de Datos
- Supabase configurado con cliente y tipos TypeScript generados
- Tablas implementadas: `users`, `categories`, `medals`, `user_medals`, `user_favorites`, `friendships`
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
- Vista de Galería implementada como modal (`(modals)/gallery.tsx`)
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
- Galería muestra fotos reales con ordenamiento

### Estructura Actual del Proyecto

```
frontend/
├── app/
│   ├── (auth)/              # login.tsx, signup.tsx, forgot-password.tsx
│   ├── (modals)/            # camera.tsx, edit-profile.tsx, friend-profile.tsx, gallery.tsx
│   ├── (tabs)/              # map.tsx, favorites.tsx (placeholder), friends.tsx, profile.tsx, progress.tsx
│   │   └── _layout.tsx      # Configuración de tabs (5 tabs actuales)
│   ├── _layout.tsx          # Layout raíz
│   └── index.tsx            # Pantalla inicial
│
├── src/
│   ├── components/
│   │   ├── base/            # Componentes base
│   │   ├── camera/          # CameraPreview, CameraControls, PhotoPreview
│   │   ├── forms/           # LoginForm, SignupForm, etc.
│   │   ├── map/             # MapView, MapMarker, CategoryFilter, PlaceInfoCard
│   │   ├── medals/          # MedalCard, MedalThumbnail, MedalGrid, CategoryProgressBar
│   │   ├── social/          # Componentes sociales
│   │   └── ui/              # Button, Input, Card, SortChips, ScreenContainer, etc.
│   │
│   ├── hooks/
│   │   ├── auth/            # useAuth, useSession
│   │   ├── camera/          # useCamera
│   │   ├── common/          # Hooks comunes
│   │   ├── data/            # useMedals, useMedalCollection, useUserStats
│   │   ├── location/        # useLocation, useProximityDetection
│   │   └── ui/              # Hooks de UI
│   │
│   ├── services/
│   │   ├── auth/            # authService.ts
│   │   ├── camera/          # cameraService.ts
│   │   ├── database/        # medalService.ts, userService.ts
│   │   ├── location/        # locationService.ts, proximityService.ts
│   │   ├── maps/            # Servicios de mapas
│   │   ├── notifications/   # Servicios de notificaciones
│   │   └── storage/         # StorageService.ts, ImageService.ts
│   │
│   ├── store/
│   │   ├── authStore.ts     # Estado de autenticación
│   │   ├── locationStore.ts # Estado de ubicación
│   │   ├── medalsStore.ts   # Estado de medallas del usuario
│   │   ├── userStore.ts     # Estado del perfil de usuario
│   │   └── index.ts         # Exports
│   │
│   ├── config/              # constants.ts, env.ts, permissions.ts
│   ├── types/               # Tipos TypeScript
│   ├── styles/              # theme.ts, colors.ts, typography.ts
│   ├── utils/               # Utilidades y helpers
│   └── assets/              # Imágenes, fuentes, sonidos
```

### Navegación Actual (Tabs)
```
┌─────────┬──────────┬────────┬───────────┬─────────┐
│ Amigos  │ Progreso │  Mapa  │ Favoritos │ Perfil  │
│ (users) │ (award)  │ (map)  │  (heart)  │ (user)  │
└─────────┴──────────┴────────┴───────────┴─────────┘
```
> **Nota:** La tab "Favoritos" es actualmente un placeholder sin funcionalidad.

---

## Objetivo del Sprint 5

### Cambio Arquitectónico Principal

Este sprint implementa una **reestructuración importante de la navegación**:

1. **Eliminar** la tab "Favoritos" (placeholder actual)
2. **Promover** la vista "Galería" de modal a tab principal
3. **Implementar** favoritos como sistema de filtros transversal

### Nueva Estructura de Tabs
```
┌─────────┬──────────┬────────┬──────────┬─────────┐
│ Amigos  │ Progreso │  Mapa  │ Galería  │ Perfil  │
│ (users) │ (award)  │ (map)  │ (image)  │ (user)  │
└─────────┴──────────┴────────┴──────────┴─────────┘
```

### Funcionalidades a Implementar

| Área | Descripción |
|------|-------------|
| **Navegación** | Mover `gallery.tsx` de modals a tabs, actualizar TabBar |
| **FavoritesStore** | Store Zustand para gestión de favoritos sincronizado con BD |
| **FavoriteButton** | Componente botón corazón reutilizable con animación |
| **Integración** | Añadir FavoriteButton en MedalCard, Gallery y Map |
| **FilterChip** | Componente chip toggle para filtros |
| **Filtros en vistas** | Implementar filtro por favoritos en Gallery, Map y Progress |
| **Nuevos filtros Progress** | Reemplazar filtro de categorías por: Favoritos, Obtenidas, No obtenidas |
| **Documentación** | Actualizar todos los archivos .md con los cambios |

---

## Tareas del Sprint 5 (TASK-069 a TASK-081)

### Fase 1: Reestructuración de Navegación (4 pts)
| Task | Descripción | Puntos |
|------|-------------|--------|
| TASK-069 | Mover gallery.tsx de modals a tabs | 2 |
| TASK-070 | Actualizar configuración del TabBar | 1 |
| TASK-071 | Actualizar navegación Progress → Gallery | 1 |

### Fase 2: Sistema de Favoritos (7 pts)
| Task | Descripción | Puntos |
|------|-------------|--------|
| TASK-072 | Crear FavoritesStore con Zustand | 2 |
| TASK-073 | Crear componente FavoriteButton | 2 |
| TASK-074 | Integrar FavoriteButton en MedalCard | 1 |
| TASK-075 | Integrar FavoriteButton en Gallery | 1 |
| TASK-076 | Integrar FavoriteButton en Map | 1 |

### Fase 3: Filtros Reutilizables (5 pts)
| Task | Descripción | Puntos |
|------|-------------|--------|
| TASK-077 | Crear componente FilterChip toggle | 1 |
| TASK-078 | Implementar filtro favoritos en Gallery | 1 |
| TASK-079 | Implementar filtro favoritos en Map | 1 |
| TASK-080 | Reemplazar filtros en Progress | 2 |

### Fase 4: Documentación (2 pts)
| Task | Descripción | Puntos |
|------|-------------|--------|
| TASK-081 | Actualizar documentación del proyecto | 2 |

**Total: 13 tareas, 18 Task Points**

---

## User Story Relacionada

### US-017: Marcado de lugares favoritos (Adaptada)

**Como** usuario autenticado  
**Quiero** marcar medallas como favoritas y filtrar por ellas  
**Para** crear una lista personalizada de lugares que me interesan especialmente

**Criterios de Aceptación:**
1. Botón corazón visible en tarjetas de medalla (Progress, Gallery, Map)
2. Toggle de favorito sincronizado entre todas las vistas
3. Estado guardado en tabla `user_favorites` de Supabase
4. Chip de filtro "Favoritos" disponible en Progress, Gallery y Map
5. Los filtros son combinables con otros filtros existentes
6. Galería accesible como tab principal (no modal)

---

## Documentación de Referencia

Archivos clave para consultar:
- `docs/sprint_tasks/SPRINT_5_TASKS.md` — Detalle completo de tareas
- `docs/USER_STORIES.md` — US-017 y criterios de aceptación
- `docs/ARCHITECTURE.md` — Arquitectura y patrones del proyecto
- `frontend/docs/NAVIGATION.md` — Sistema de navegación actual
- `frontend/docs/COMPONENTS.md` — Documentación de componentes
- `frontend/docs/HOOKS.md` — Documentación de hooks

---

## Código Existente Relevante

### Para reutilizar/extender:
| Archivo | Uso en Sprint 5 |
|---------|-----------------|
| `(modals)/gallery.tsx` | Base para nueva tab Gallery |
| `(tabs)/_layout.tsx` | Modificar TAB_CONFIG |
| `components/ui/SortChips.tsx` | Referencia para FilterChip |
| `components/medals/MedalCard.tsx` | Añadir FavoriteButton |
| `store/medalsStore.ts` | Patrón para FavoritesStore |
| `services/database/medalService.ts` | Patrón para favoritesService |

### Tabla existente en BD:
```sql
-- user_favorites ya existe con políticas RLS configuradas
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    medal_id UUID REFERENCES medals(id),
    created_at TIMESTAMP
);
```

---

## Instrucciones

**No implementes nada todavía.** Tu tarea ahora es:

1. **Explorar el repositorio** para comprender la estructura actual
2. **Leer la documentación** referenciada arriba
3. **Analizar el código existente** que se puede reutilizar
4. **Identificar** qué existe, qué se puede extender y qué hay que crear

### Entregables esperados

Genera un **resumen ejecutivo** que incluya:

1. **Confirmación de comprensión** del contexto y objetivos del Sprint 5
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

---

# Prompt 2

Excelente análisis. Voy a responder a tus preguntas para que puedas empezar el desarrollo de las Tareas del Sprint 5 según tu planificación:

## Aclaraciones funcionales
1. El botón favorito debe mostrarse en TODAS las medallas. Se deben poder marcar las medallas obtenidas favoritas (para un fácil acceso a las imágenes, por ejemplo) y a las medallas por obtener (como "whishlist", para que el usuario marque los lugares que quiere completar a corto plazo).
2. Filtros en Progress: El filtro "Favoritos" es siempre combinable con todos los demás filtros en todas las vistas. Respecto a los otros filtros, se puede tener "Medallas obtenidas", "Medallas no obtenidas" o ninguno de los 2 filtros (todas las medallas) activados. Esto es excluyente, si activas el filtro "Medallas obtenidas" se desactiva el de "Medallas no obtenidas" y viceversa. Si se vuelve a pulsar sobre el botón de un filtro activo, se desactiva (esto es así para todos los filtros de la app).
3. Renombra el archivo modal de gallery a "gallery_modal.tsx" con el código sin cambiar como posible backup. Cuando yo verifique al final del Sprint que la nueva estructura está bien implementada y que todo funciona bien sin utilizar `gallery_modal.tsx`, eliminaré yo el archivo manualmente antes de hacer los commits del Sprint.

## Aclaraciones técnicas
4. Como experto desarrollador móvil que eres, prefiero que la decisión para la animación del FavoriteButton la tomes tú. Analiza el proyecto actual y toma la mejor decisión para este, consiguiendo un proyecto profesional con buena UX/UI.
5. Quiero quitar el filtro de categorías de la vista 'Progress' porque la vista se estructura en tarjetas desplegables separadas por categorías, lo cual facilita mucho el acceso a medallas por categoría y el filtro queda como redundante en esta vista. En su posición de la pantalla, implementaremos los 3 filtros nuevos que te he descrito. En el resto de vistas, hay que implementar los filtros nuevos ADEMÁS de los filtros ya existentes. En la vista 'Gallery' ya existen filtros para medallas conseguidas y medallas por conseguir, que están implementados en el código de la propia vista. Cuando crees los componentes reutilizables de estos filtros, cambia la lógica de la vista 'Gallery' para que utilice los componentes reutilizables para mostrar los filtros, en lugar de tenerlos "hardcodeados".

## Tu objetivo
Comprende la nueva información que te doy con mis respuestas y comienza con la implementación de todas las Tareas a desarrollar del Sprint 5. Realízalo Fase a Fase, explicando las decisiones que tomes y cómo desarrollas cada parte, para que yo entienda el código que implementes.

---

# Prompt 3

Excelente trabajo, todo funciona bien y la mayoría de cosas han quedado bien visualmente. Sin embargo, necesito que revises varios casos de mejora que he encontrado. Debes analizarlos de 1 en 1, razonar cuál es la mejor decisión para cada caso, implementarla y explicarme por qué has tomado cada decisión:

- Confirmo que sí se actualiza el estado de las medallas de todas las vistas cuando se marca una como favorito en una vista. He probado a marcar una medalla como favorita en la vista 'Gallery' y he ido a 'Map', donde he visto que la medalla sí que aparece marcada como favorita y, si filtro por favoritos, aparece. Sin embargo, el filtro de favoritos indica "Favoritos (0)" todavía. En el filtro se indica el número de favoritos que tiene guardado el usuario (y que concuerdan con el resto de filtros activos), y no se actualiza a tiempo real al marcar un nuevo favorito. Este número también debe actualizar su estado en tiempo real cuando se añade o se elimina un favorito de la tabla 'favorites'.

- Rediseño en el filtro de favoritos: En vez de 'Icono de corazón + "Favoritos" + Contador', quiero que se muestre únicamente el Icono de corazón y el Contador, siendo un "chip" con una forma más circular y algo más grande, que se distinga del resto de filtros y que se vea bien visualmente. Creo que quitar el texto "favoritos" para conseguir una forma más circular y "alta" va a mejorar bastante el UI, teniendo en cuenta que el icono de corazón ya da a entender que se trata del filtro de "favoritos", sin necesidad de que lo explique el texto.

- Ajustar la posición de los filtros "Favoritos" en todas las vistas. En todas las vistas quiero que se muestre al lado de los filtros de medallas obtenidas/no obtenidas. Debemos mostrar "Obtenidas" y "No obtenidas" en la misma fila en la parte de la izquierda de la pantalla. A la derecha de estos filtros, se debe mostrar una fina línea pequeña vertical que "separa" esos filtros del filtro "Favoritos". Los 2 filtros de la izquierda son excluyentes, si se activa uno, se desactiva el otro (se pueden desactivar los 2) y el de la derecha (favoritos), separado por la fina línea vertical, funciona completamente aparte, complementario al resto de filtros. Creo que si lo colocamos así, en la misma fila pero separados visualmente, sí que puede ser fácil de entender para el usuario que el filtro de favoritos funciona aparte y mejoraría bastante la UI/UX esta colocación nueva.

- Debemos mostrar estos 3 filtros (Obtenidos/No obtenidos/Favoritos) también en 'Map', en la fila siguiente a la del filtro por categorías, y encima de los contadores de estadísticas. A lo mejor deberíamos eliminar estas estadísticas, ya que hay un contador de "Obtenidas" en esas estadísticas que muestra el número de medallas obtenidas según los filtros activos que haya. Esto cumple la misma función que el chip del filtro "Obtenidas", que también muestra el contador. A lo mejor tenemos que eliminar esos 2 chips de estadísticas (totales y obtenidas mostradas). Puede ser que sean redundantes y que la vista ya esté lo suficientemente bien con: Fila1 con filtros por categoría y Fila2 con filtros por "Obtenidas" y "No obtenidas" y "Favoritos". ¿Qué opinas sobre esto? Implementa los cambios que decidas hacer sobre este caso.

- Si activo algún filtro en el Mapa (categoría o favoritos), este se queda activo en esa vista aunque me vaya a otra (se queda en el estado donde lo deje, filtros, posición y zoom). Esto normalmente no es un problema, pero sí que lo es por la interacción que tiene con el botón "Ver en el mapa" de otras vistas. Este botón redirige a la vista del mapa y centra la vista en la medalla seleccionada (posición y zoom quedan bien ajustados) pero, si hay un filtro activo, puede ser que la medalla no se muestre a pesar de que se haya centrado la vista en ella. Por ejemplo, si tenemos el filtro de categorías para mostrar solo las Discotecas y damos a "Ver en el mapa" a un restaurante, se redirige la vista a la coordenada correcta y se despliega la InfoCard, pero el marcador de la medalla del restaurante no se muestra. Debes implementar la lógica que haga que, al mostrar el Mapa desde un botón "Ver en el mapa", compruebe si la medalla seleccionada se puede mostrar con los filtros actuales (por ejemplo, se está filtrando por favoritos y la medalla seleccionada está en favoritos, sí que se muestra con ese filtro activo). Si sí que se muestra la medalla, no es necesario hacer nada, mantenemos todos los filtros. Si no se muestra la medalla con los filtros activos, la lógica los desactivará todos. Así nos aseguramos que se muestra el marcador de la medalla seleccionada al redirigir desde un "Ver en el mapa".

- Me gustaría que los filtros de "Todas", "Obtenidas" y "Bloqueadas" de la vista 'Gallery' se muestren algo más parecidos a como estaban antes. En esta vista específica, considero que los filtros deberían ser más grandes (y bonitos). En vez de ser unos chips alargados y "aplastados", me gustaría que fuesen algo más altos y grandes. Antes teníamos 3 filtros excluyentes: "Todas", "Obtenidas" y "Bloqueadas"; y ahora tenemos 2: "Obtenidas" y "Bloqueadas". Decide si volvemos a tomar el diseño con 3 botones excluyentes grandes o si mantenemos solo estos 2 botones (más grandes). El filtro favoritos también deberemos colocarlo en algún sitio intuitivo y bueno visualmente:
  - Si decides implementar los 3 filtros (todas, obtenidas y bloqueadas): Propongo ponerlo a la derecha de los chips de ordenación "Fecha", "Categoría" y "Nombre", un poco más separado pero en la misma fila. Al igual que te he explicado antes, si lo separamos visualmente se entenderá que es un filtro aparte.
  - Si decides implementar solo 2 filtros (obtenidas y bloqueadas, pueden estar los 2 desmarcados): Ponlo a la derecha de estos, algo separado. Esto es igual a como te he explicado que lo quiero en el resto de vistas.

Analiza este caso de mejora de UX/UI, toma las decisiones que consideres mejor para la app e impleméntalas.

---

# Prompt 4

Bien, has mejorado varias cosas pero todavía hay algunas que te faltan por terminar de ajustar para que queden perfecto:

- El contador de los filtros de "favoritos" de la app siguen sin reflejar el estado en tiempo real. En una situación, tenía 20 favoritos en la app (todos los contadores lo indicaban). He añadido una medalla como favorita desde la vista "Gallery", pero todos los filtros de "favoritos" han seguido mostrando el contador '20' en todas las vistas. Este valor no se actualiza hasta que refresco manualmente una de las vistas que cargan de nuevo las medallas (Progress o Gallery), que esto sí que hace que se actualice el valor a 21 en todas las vistas. Necesito mejorar esta lógica, que se actualicen los filtros al pulsar sobre los botones de favoritos. Cada vez que se marque una medalla nueva como favorita, se debe actualizar el estado de los filtros para que les sume +1 al contador. Cada vez que se quite una medalla de favoritos, se debe restar 1 al contador también. Debe estar sincronizado con el caso real, cambiarse cada vez que se pulsa un botón de favorito (para añadir o para eliminar de favoritos).

- He revisado el proyecto y creo que no se utiliza 'FilterChips' en ningún lado (únicamente se menciona en archivos de documentación y en el index). Revisa esto y analiza si debe ser eliminado o si se puede llegar a utilizar.

---

# Prompt 5

Excelente trabajo, has arreglado los 2 problemas que faltaban y ahora sí que puedo concluir que hemos terminado todas las Tareas del Sprint 5. Únicamente necesito que hagas algunas revisiones finales del estado actual del código antes de realizar todos los commits y el Pull Request:

- Veo que has definido un FavoriteFilterChip para el filtro de favoritos, pero que solo lo utilizas en la vista 'Gallery'. Las vistas 'Progress' y 'Map' también tienen este filtro, pero no utilizan este componente reutilizable. ¿Por qué está así? Necesito saber si es mejor que utilicen el componente reutilizable todas las vistas. Si decides cambiarlo para que lo usen, asegúrate de que cada vista mantenga el mismo tamaño y estilos que tienen ahora mismo para su FavoriteFilterChip (crea nuevos estilos específicos para cada vista en el componente si lo consideras necesario).

- Haz una revisión en profundidad del estado actual del proyecto para encontrar más archivos que estén bien definidos pero que no se usen nunca. Verifica que esta versión final del Sprint 5 está perfecta, que sigue los principios de buenas prácticas del desarrollo en todo momento (no hay cosas redundantes), que no tiene fallos de lógica y que sigue una estructura bien definida. Verifica que es un código profesional, bien desarrollado. Cuando termines tu revisión del código, analiza de nuevo todos los archivos de documentación que te he adjuntado para que encuentres todas las cosas que no están actualizadas de ellos. Al final de esta tarea que te mando, toda la documentación debe reflejar el estado actual del proyecto, que es un proyecto profesional terminado y listo para producción (faltando únicamente la vista y la lógica de "Conexión con amigos", del Sprint 6).

- Cuando verifiques que el proyecto ya se encuentra en un estado final correcto para concluir este Sprint, realizaré los commits y el Pull Request de esta rama. Cuando hayas terminado con el resto de tareas, analiza los #changes realizados en esta rama para indicarme qué commits hacer. Debes decirme cuántos commits hacer, qué archivos meter en cada uno y qué descripción breve le pongo a cada commit. No es necesario que hagas los comandos para ejecutar en terminal, únicamente debes razonar cómo distribuir los archivos de #changes en commits y los comentarios de cada commit (sigue las convenciones típicas de comentarios de commits, hazlos breves y en inglés). Finalmente, escribe un comentario para añadir al Pull Request como resumen de lo realizado en este Sprint 5.

Archivos a commitear (antes de tus últimos cambios):
```
$ git status
On branch feature/fav_filter
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   backend/README.md
        modified:   backend/docs/API.md
        modified:   frontend/README.md
        modified:   frontend/app/(modals)/camera.tsx
        modified:   frontend/app/(modals)/edit-profile.tsx
        deleted:    frontend/app/(modals)/gallery.tsx
        modified:   frontend/app/(tabs)/_layout.tsx
        deleted:    frontend/app/(tabs)/favorites.tsx
        modified:   frontend/app/(tabs)/map.tsx
        modified:   frontend/app/(tabs)/profile.tsx
        modified:   frontend/app/(tabs)/progress.tsx
        modified:   frontend/docs/COMPONENTS.md
        modified:   frontend/docs/HOOKS.md
        modified:   frontend/docs/NAVIGATION.md
        modified:   frontend/package.json
        modified:   frontend/src/components/camera/CameraControls.tsx
        modified:   frontend/src/components/camera/CameraView.tsx
        modified:   frontend/src/components/camera/PhotoPreview.tsx
        modified:   frontend/src/components/camera/index.ts
        modified:   frontend/src/components/map/CategoryFilter.tsx
        modified:   frontend/src/components/medals/MedalCard.tsx
        deleted:    frontend/src/components/medals/MedalCategory.tsx
        deleted:    frontend/src/components/medals/MedalGrid.tsx
        deleted:    frontend/src/components/medals/MedalList.tsx
        modified:   frontend/src/components/medals/MedalThumbnail.tsx
        modified:   frontend/src/components/medals/MedalUnlockModal.tsx
        modified:   frontend/src/components/ui/ScreenContainer.tsx
        modified:   frontend/src/components/ui/SortChips.tsx
        modified:   frontend/src/components/ui/index.ts
        modified:   frontend/src/config/devConfig.ts
        modified:   frontend/src/hooks/camera/index.ts
        modified:   frontend/src/hooks/camera/useCamera.ts
        modified:   frontend/src/hooks/data/index.ts
        modified:   frontend/src/hooks/data/useMedals.ts
        modified:   frontend/src/services/camera/ImageProcessor.ts
        modified:   frontend/src/services/camera/index.ts
        modified:   frontend/src/services/database/index.ts
        modified:   frontend/src/services/storage/StorageService.ts
        modified:   frontend/src/services/storage/index.ts
        modified:   frontend/src/store/index.ts
        modified:   frontend/src/store/medalsStore.ts
        modified:   frontend/src/styles/theme.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        frontend/app/(modals)/gallery_modal.tsx
        frontend/app/(tabs)/gallery.tsx
        frontend/src/components/ui/FavoriteButton.tsx
        frontend/src/components/ui/FavoriteFilterChip.tsx
        frontend/src/components/ui/StatusFilterRow.tsx
        frontend/src/hooks/data/useFavorites.ts
        frontend/src/services/database/FavoritesService.ts
        frontend/src/store/favoritesStore.ts
```