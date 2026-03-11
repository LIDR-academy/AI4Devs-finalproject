> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.
>
> **Nota:** Los prompts completos de todas las fases del desarrollo (los de después de la definición inicial del proyecto, su stack y estructura de carpetas) se encuentran en la carpeta `Prompts proyecto final AI4DEVS/`, organizada en 11 archivos que cubren desde la planificación inicial hasta la auditoría final y testing. A continuación se muestran los prompts más representativos de cada sección.


## Índice

0. [Modelo elegido](#0-modelo-elegido)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Modelo elegido
> Todos los prompts se realizaron en GitHub Copilot, en el apartado de chat integrado en el IDE Visual Studio Code, al contar con una licencia gratuita para ello. La gran mayoría del trabajo se realizó utilizando el modelo Claude Opus 4.5 en modo Agente, el más potente y el que mejores resultados me había dado en pruebas anteriores. Para algunos retoques menores se llegó a utilizar el modelo Claude Sonnet 4.5, pero en mucha menor medida.

## 1. Descripción general del producto

**Prompt 1:**

> Quiero desarrollar una aplicación móvil gamificada para descubrir lugares de interés en Salamanca. La idea es que los usuarios exploren la ciudad y, al acercarse físicamente a un punto de interés, puedan capturar una foto para desbloquear una medalla virtual. Necesito que actúes como un Product Designer y Analista de Sistemas experto en aplicaciones móviles. Tu objetivo es ayudarme a definir desde cero todos los aspectos fundamentales del producto: público objetivo y propuesta de valor, funcionalidades principales organizadas por módulos, stack tecnológico recomendado (teniendo en cuenta que soy principiante y que el desarrollo lo haré asistido por IA), modelo de datos inicial, arquitectura de alto nivel, flujos de usuario principales y riesgos técnicos. Dame una visión completa y estructurada del producto antes de empezar a planificar el desarrollo.

*Justificación:* Este fue el prompt fundacional del proyecto, utilizado antes de escribir ningún código ni planificar ningún sprint. Se le pidió al modelo que actuase como Product Designer para definir toda la base conceptual de Salmantour: qué problema resuelve, para quién, qué funcionalidades tendría, qué tecnologías usar y cómo estructurarlo. De esta conversación surgieron las decisiones clave del producto: el sistema de medallas por proximidad, las 8 categorías de lugares, la arquitectura React Native + Expo + Supabase, el modelo de datos con 6 tablas, y los flujos de usuario principales. Todo el desarrollo posterior se construyó sobre esta definición inicial.

**Prompt 2:**

> Eres un experto Project Manager, especializado en desarrollo con metodologías ágiles como Scrumban. Debes analizar en profundidad el repositorio actual, en especial los archivos de documentación. Debes comprender todo el contexto de la aplicación que estamos desarrollando, el punto actual y los siguientes pasos a desarrollar. Según el archivo `DEVELOPMENT.md`, acabamos de terminar la fase 1 y vamos a empezar la 2, la del desarrollo de un prototipo básico funcional. Una vez comprendido, haz un resumen de la finalidad del proyecto, los componentes básicos de este, la arquitectura elegida, la situación actual y los pasos siguientes. Cuando me confirmes que entiendes el contexto, podremos empezar a planificar el prototipo funcional de manera profesional con tu conocimiento.

*Justificación:* Una vez definida toda la base del producto gracias a la conversación del Prompt 1, se inició una nueva conversación con un modelo al que se le asignó el rol de PM experto. Su misión era encargarse de planificar el alcance y tareas de cada Sprint de desarrollo, además de documentar de forma técnica y detallada lo que había que implementar en cada uno para maximizar el rendimiento de los modelos que se encargarían del desarrollo. El PM analizó toda la documentación existente, confirmó su comprensión del proyecto y formuló preguntas clave sobre equipo, infraestructura y metodología antes de empezar a planificar. Este patrón de "PM planifica → Desarrollador implementa" se mantuvo durante los 6 sprints.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

> Eres un desarrollador senior experto en React Native, Expo Router, TypeScript y Zustand, especializado en arquitecturas de aplicaciones móviles con Supabase Auth. Implementar el sistema completo de autenticación para Salmantour siguiendo las especificaciones técnicas. [...] Tareas: AuthStore con Zustand (estado global: user, session, userProfile, isAuthenticated, isLoading y acciones: login, signup, logout, initialize, updateProfile), authService (signIn, signUp, signOut, resetPassword), pantallas de Login y Signup, hook useAuth, protección de rutas. [...] NO escribas código todavía. Primero explora el repositorio completo, lee la documentación, identifica archivos existentes. Genera un resumen ejecutivo con: comprensión del contexto, estado actual, plan de implementación propuesto con orden de tareas justificado por dependencias, puntos críticos y riesgos identificados, preguntas o aclaraciones necesarias.

*Justificación:* Prompt inicial del Sprint 1 de desarrollo. Se definió la arquitectura por capas completa (`UI → Hooks → State (Zustand) → Services → Supabase Client`) y se forzó al modelo a analizar el repositorio antes de escribir código. Este patrón de "comprensión primero, implementación después" se repitió en todos los sprints siguientes.

**Prompt 2:**

> No creo que sea más beneficioso no utilizar Shopify Restyle y realizar todo de manera manual nativa. Ya tenemos instalado la dependencia de shopify y nos puede llegar a simplificar el desarrollo, por tener herramientas documentadas y estandarizadas. Yo soy principiante en esto, pero tú eres un desarrollador experto que vas a poder acceder a la documentación de shopify en cualquier momento. Necesito que la app cumpla con las funcionalidades previstas, pero también es importante que tenga un aspecto visual profesional, así que debemos utilizar las mejores herramientas para ello. ¿Qué opinas? ¿Sigues recomendando el desarrollo manual o te parece bien que desarrolles tú la parte del diseño visual con shopify-restyle con mi guía sobre mis preferencias?

*Justificación:* Decisión arquitectónica clave sobre el sistema de diseño. El modelo inicialmente recomendó no usar Shopify Restyle por simplicidad, pero este prompt forzó la evaluación informada de ambas opciones. La decisión final de adoptar Restyle con design tokens centralizados definió toda la capa de presentación del proyecto.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

> Eres un desarrollador senior de aplicaciones móviles, experto en React Native, Expo Router, TypeScript, Zustand, Google Maps y Geolocalización. Implementar el sistema completo de mapa interactivo, marcadores de lugares y geolocalización en tiempo real para Salmantour. [...] Estado actual (Sprint 1 completado): Setup completo de Supabase, sistema de autenticación, AuthStore con Zustand, protección de rutas, navegación con Expo Router, RLS configurado, 8 categorías en BD. [...] Tareas: Configurar Google Maps API, instalar react-native-maps, seed data de 28 lugares reales de Salamanca, servicio de medallas, servicio de ubicación con Haversine, locationStore con Zustand, componente MapView, CustomMarker con estados visuales, PlaceInfoCard.

*Justificación:* Prompt de inicio del Sprint 2 (funcionalidad core del mapa). Se proporcionó el contexto completo del Sprint 1 terminado y se detalló cada tarea con sus Story Points. El modelo implementó el mapa interactivo, la geolocalización con Haversine, marcadores personalizados y el sistema de filtrado por categorías.

### **2.3-2.6. Estructura, despliegue, seguridad y tests:**

**Prompt 1:**

> Excelente análisis, has hecho un informe técnico de auditoría muy completo. Confirmo tu comprensión total del proyecto. [...] Tareas: Guardar el informe en TECNIC_AUDIT.md, implementar setup.ts para tests, crear tests unitarios (Fase 1, 2 y 3), implementar dateFormatter.ts si es útil, eliminar los placeholders inútiles, revisar console.logs, revisión final de documentación.

*Justificación:* Prompt del Sprint 7 (auditoría y testing). Tras una auditoría completa del código, se implementaron 156 tests unitarios distribuidos en 7 suites, se eliminaron 15+ archivos placeholder innecesarios y se documentaron las decisiones de testing (no mockear Supabase extensamente por fragilidad de mocks).

**Prompt 2:**

> Al ejecutar el script 'npm run build' de la raíz se realizan las comprobaciones de tipos, el linter y el prettier para todos los workspaces. Lo he probado y me ha aparecido lo siguiente: [...] No entiendo cómo han funcionado los archivos de test, están todos repletos de errores que ha detectado el linter (643 errors in 8 files). [...] Analiza los errores indicados, razona por qué han funcionado algunos tests a pesar de existir estos errores y explícame qué debemos hacer para solucionarlos.

*Justificación:* Prompt de corrección de errores de configuración de testing. Los tests pasaban en runtime pero el type checker encontraba 643 errores porque faltaban los tipos de Jest en el tsconfig. Este prompt ilustra el proceso iterativo de detección y corrección de problemas que se siguió durante todo el desarrollo.

---

## 3. Modelo de Datos

**Prompt 1:**

> Realiza una planificación profesional del Sprint 1, cuya finalidad es: [...] desarrollo de las tablas de la base de datos, conexión entre frontend y backend. [...] Backlog completo de tareas: TASK-004 (Diseñar esquema de BD, 3pts), TASK-005 (Implementar migración inicial, 4pts), TASK-006 (Configurar RLS básico, 4pts), TASK-007 (Seed data categorías, 1pt), TASK-008 (Generar tipos TypeScript desde Supabase, 1pt).

*Justificación:* Del prompt de planificación del Sprint 1, se derivó el diseño completo del esquema de base de datos. El PM propuso las 5 tareas de BD que resultaron en la migración `001_initial_schema.sql` con 6 tablas, funciones helper, triggers y la migración `002_row_level_security.sql` con todas las políticas RLS.

**Prompt 2:**

> Crea el script SQL de seed data para la tabla `medals` con lugares reales de Salamanca. Necesito un mínimo de 40 puntos de interés distribuidos entre las 8 categorías (Monumentos, Gastronomía, Leyendas, Naturaleza, Deporte, Educación, Cultura, Religión). Cada registro debe incluir: nombre real del lugar, descripción informativa, dirección postal, y coordenadas GPS precisas (latitud con DECIMAL(10,8) y longitud con DECIMAL(11,8)). Las coordenadas deben ser exactas, ya que el algoritmo de Haversine las utilizará para calcular la distancia del usuario y activar el desbloqueo de medallas a menos de 10 metros. Genera el archivo `medals.sql` compatible con el esquema definido en `001_initial_schema.sql`.

*Justificación:* Prompt del Sprint 2 donde se pobló el modelo de datos con contenido real. El modelo generó 40 lugares reales de Salamanca con coordenadas GPS verificadas, distribuyéndolos entre las 8 categorías. Este seed data es fundamental para el modelo de datos porque define los registros de la tabla `medals` que el resto de la aplicación consume (mapa, proximidad, progreso, galería). La precisión de las coordenadas era crítica para que el sistema de proximidad con Haversine funcionase correctamente.

**Prompt 3:**

> Excelente análisis. Voy a responder a tus preguntas para que puedas empezar el desarrollo de las Tareas del Sprint 6: [...] Para la función RPC de validación de códigos de amistad, añade la función a uno de los scripts de migración de la carpeta `backend/supabase` para que lo ejecute manualmente en una terminal SQL de Supabase. Explícame bien qué debo hacer yo manualmente para que todo funcione bien. [...] Para tu pregunta de las estadísticas de amigo, yo no tengo preferencia entre calcular las stats en el frontend o crear una función RPC. Tú conoces más sobre casos como este, razona cuál de las 2 opciones es mejor.

*Justificación:* Prompt del Sprint 6 donde se diseñó la migración `006_rpc_friend_functions.sql` con funciones RPC (`find_user_by_friend_code`, `get_user_profiles_by_ids`, `get_pending_friend_requests`) y se añadió la tabla `friendships` al modelo. El modelo razonó la decisión de calcular stats en frontend vs RPC, eligiendo frontend por evitar complejidad innecesaria en BD.

---

## 4. Especificación de la API

**Prompt 1:**

> Realiza la Tarea-030 de la planificación: Implementar el servicio de medallas (`MedalService`) como capa de acceso a datos que encapsule todas las operaciones contra Supabase. Funciones requeridas: `getAllMedals()` para obtener el catálogo completo con JOIN a categorías, `getUserMedals(userId)` para las medallas desbloqueadas por el usuario, `unlockMedal(userId, medalId, photoUrl)` para insertar en `user_medals` y registrar la URL de la foto, `updateMedalPhoto(userId, medalId, newPhotoUrl)` para permitir retomar la foto de una medalla ya obtenida, y `getUserMedalStats(userId)` para estadísticas globales y desglose por categoría. Todas las funciones deben utilizar el SDK de Supabase con tipado TypeScript completo y retornar tipos consistentes con manejo de errores.

*Justificación:* Del Sprint 2 se derivó la especificación completa del `MedalService`, el servicio principal de la capa de datos. El modelo implementó 5 funciones que definen la API interna de la aplicación para medallas, utilizando el SDK de Supabase con JOINs a la tabla de categorías y tipado estricto. Este servicio establece el patrón de diseño (`fetch → transform → return typed result`) que se replicó en el resto de servicios (FriendService, StorageService).

**Prompt 2:**

> Implementa el sistema social completo: TASK-082 (FriendService completo, 3pts) - getFriends, addFriend, removeFriend, validateFriendCode, getFriendProfile, getFriendMedals. TASK-083 (FriendsStore con Zustand, 2pts). [...] Los usuarios no pueden consultar perfiles que no sean el suyo o el de sus amigos aceptados, pero se necesita implementar una lógica que permita a todos los usuarios introducir códigos de amistad y que verifique si es válido. Para esto, añade la función RPC.

*Justificación:* Prompt del Sprint 6 que produjo el `FriendService` con 12 funciones para gestión de amistades, incluyendo la comunicación con funciones RPC de PostgreSQL (`find_user_by_friend_code`) que hacen bypass controlado de RLS con SECURITY DEFINER. Este servicio es el ejemplo más claro de la arquitectura SDK + RPC del proyecto.

**Prompt 3:**

> Al enviar una solicitud a la cuenta de un amigo con username 'Tomypv' me ha aparecido el mensaje "Solicitud enviada a 'Usuario'", en vez de ponerme el nombre del usuario "Tomypv". [...] Al parecer no está pudiendo obtener el username del otro usuario hasta que no sea amigo porque no estamos utilizando bien la función RPC que hemos añadido para esto. Con esa función podemos obtener los datos básicos de otros usuarios para añadirlos como amigos.

*Justificación:* Prompt de debugging de la integración entre el FriendService y las funciones RPC. Ilustra cómo se resolvió el problema de acceso a datos de otros usuarios respetando las políticas RLS: la función RPC `find_user_by_friend_code` permite obtener datos públicos básicos sin violar el aislamiento de datos.

---

## 5. Historias de Usuario

**Prompt 1:**

> Realiza una planificación profesional del Sprint 1. [...] Tu objetivo: Backlog completo de tareas, estimación de complejidad para cada tarea, orden recomendado de desarrollo. [...] Respuestas a tus preguntas: Trabajo solo con ayuda de modelos de GitHub Copilot. Podremos trabajar alrededor de 40 horas semanales. Es mi primera vez trabajando con Supabase y React Native. Para el Sprint 1 no necesitamos ninguna medalla, priorizamos la implementación rápida de funcionalidades importantes.

*Justificación:* Este prompt al PM generó las primeras historias de usuario del proyecto (US-001 a US-006) con criterios de aceptación detallados, priorización y estimación en Story Points. El enfoque de "MVP primero, funcionalidades secundarias después" definió la progresión de los 6 sprints.

**Prompt 2:**

> Revisa el archivo `USER_STORIES.md` y decide si están bien diseñados todos los User Stories o si faltan algunos. Por ejemplo, dijiste que hay algunas funcionalidades relevantes como la de "Retomar foto de medalla" que está implementada en la app pero no está definida como User Story. Complementa el archivo con los User Stories que falten y déjalo en su versión final.

*Justificación:* Prompt del Sprint 7 (auditoría) donde se revisaron y completaron las historias de usuario. Se añadieron 5 nuevas US que faltaban (US-024 a US-028: Verificación de email, Edición de perfil, Retomar foto, Gestión de solicitudes, Navegación contextual) y se renumeraron todas para mantener un orden lógico por sprints.

**Prompt 3:**

> Renumera todas las historias de usuario para que estén en orden. Reajusta un poco los Story Points de los US para que estén un poco más balanceados (que el rango entre el Sprint con menos y el Sprint con más no sea tan grande). Actualiza `DEVELOPMENT.md` para que refleje la situación real. Asegúrate de que `DEVELOPMENT.md` concuerda con `USER_STORIES.md`.

*Justificación:* Prompt final de refinamiento de las historias de usuario. Se balancearon los Story Points entre sprints (de un rango 11-21 a uno más equilibrado), se renumeraron los 28 User Stories en orden cronológico de sprints, y se sincronizó la documentación de desarrollo con las historias definitivas.

---

## 6. Tickets de Trabajo

**Prompt 1:**

> Realiza una planificación profesional del Sprint 1, cuya finalidad es: Obtener un sistema de usuarios y sesiones completo, desarrollo de componentes clave básicos, lógica de navegación entre todas las vistas, desarrollo de las tablas de la base de datos, conexión frontend-backend. [...] Backlog completo de tareas para el Sprint 1, estimación de complejidad para cada tarea, orden recomendado de desarrollo.

*Justificación:* El PM generó 24 tareas detalladas (TASK-001 a TASK-027) con puntos de complejidad, subtareas, criterios de aceptación y dependencias. Cada tarea se diseñó para ser completada en un rango de 2-8 horas, siguiendo la metodología Scrumban.

**Prompt 2:**

> Implementa el sistema completo de mapa interactivo, marcadores de lugares y geolocalización en tiempo real. [...] TASK-034: Crear componente MapView base (5 pts). TASK-035: Crear componente CustomMarker (3 pts). TASK-036: Integrar marcadores de medallas en MapView (4 pts). TASK-037: Crear pantalla de Mapa (tab) (2 pts).

*Justificación:* Tickets del Sprint 2 generados por el PM con estimaciones de complejidad y dependencias encadenadas. Estos tickets definen la funcionalidad core de la aplicación (mapa interactivo) y muestran cómo se descompuso una funcionalidad compleja (16 puntos) en 4 tareas incrementales.

**Prompt 3:**

> Implementa el sistema social completo: TASK-082 (FriendService completo, 3pts), TASK-083 (FriendsStore con Zustand, 2pts), TASK-084 (Definir tipos TypeScript, 1pt), TASK-085 (Pantalla de amigos, 5pts), TASK-086 (Perfil de amigo, 5pts), TASK-087 (Barra de búsqueda, 3pts), TASK-088 (Vista de comparación, 8pts). [...] Total Sprint 6: 36 puntos, 2 semanas.

*Justificación:* Tickets del Sprint 6 (sistema social), el más complejo del proyecto. Muestra cómo se planificaron tareas de diferentes capas (backend RPC + servicio + store + UI) con dependencias claras entre ellas, asegurando que la infraestructura se implementaba antes de las vistas.

---

## 7. Pull Requests

**Prompt 1:**

> Confirmo que el proyecto se encuentra en un estado final correcto. Analiza los #changes realizados en esta rama para indicarme qué commits hacer. Debes decirme cuántos commits hacer, qué archivos meter en cada uno y qué descripción breve le pongo a cada commit. Sigue las convenciones típicas de comentarios de commits, hazlos breves y en inglés. Finalmente, escribe un comentario para añadir al Pull Request como resumen de lo realizado en este Sprint 6.

*Justificación:* Prompt utilizado al final del Sprint 6 para organizar los cambios de la rama `feature/social` en commits lógicos antes del PR #101. El modelo analizó 45+ archivos modificados y propuso 7 commits agrupados por dominio: migración SQL, servicios, store, componentes sociales, vistas, limpieza de placeholders y documentación.

**Prompt 2:**

> [...] Tu tarea: Diseño de commits a realizar para subir los cambios finales que hemos realizado, concluyendo el desarrollo del proyecto. Debes decirme cuántos commits hacer, qué archivos meter en cada uno y qué descripción breve le pongo a cada commit.

*Justificación:* Prompt final del proyecto para organizar los commits del Sprint 7 (auditoría, tests, documentación final). Similar al anterior, el modelo distribuyó los cambios en commits temáticos: configuración de tests, tests unitarios por suite, limpieza de placeholders, documentación actualizada y user stories finales.