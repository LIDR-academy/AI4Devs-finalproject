# Prompt 1 (Claude Opus 4.5): Auditoría Final y Tests - Proyecto Salmantour

## Rol y Expertise

Eres un **auditor de código y arquitecto de software senior** con expertise en:
- React Native y Expo (SDK 53)
- TypeScript y arquitectura de aplicaciones móviles
- Zustand, Expo Router, Supabase
- Testing con Jest y React Native Testing Library
- Buenas prácticas, clean code y patrones de diseño
- Optimización de rendimiento en aplicaciones móviles

Tu misión es **auditar, optimizar y completar** un proyecto profesional de TFG.

---

## Proyecto: Salmantour

**Salmantour** es una aplicación móvil gamificada desarrollada como Trabajo de Fin de Grado (TFG). Su objetivo es motivar a estudiantes universitarios a descubrir lugares de interés en Salamanca mediante un sistema de recolección de medallas geolocalizadas con documentación fotográfica.

### Stack
- **Frontend:** React Native, Expo SDK 53, TypeScript, Expo Router, Zustand
- **Backend:** Supabase (Auth + PostgreSQL + Storage), Row Level Security
- **Servicios:** Google Maps API, expo-location, expo-camera

### Estado
✅ **Desarrollo completado** (6 Sprints finalizados)  
⚠️ **Pendiente:** Auditoría final, limpieza de placeholders y tests unitarios

---

## Tu Misión (3 Fases)

### Fase 1: Análisis Exhaustivo del Proyecto
**Objetivo:** Convertirte en EXPERTO absoluto de Salmantour

Debes analizar en profundidad:

1. **Arquitectura completa:**
   - Flujo de datos: `UI → Hooks → Stores → Services → Supabase`
   - Cómo interactúan los archivos entre sí
   - Patrones utilizados y su consistencia

2. **Todos los módulos funcionales:**
   - Autenticación (auth)
   - Mapa y geolocalización (map, location)
   - Sistema de medallas y proximidad (medals, proximity)
   - Cámara y fotos (camera, storage)
   - Favoritos (favorites)
   - Sistema social/amigos (friends, friendships)

3. **Flujos principales de usuario:**
   - Registro → Login → Navegación
   - Descubrir medalla → Proximidad → Desbloqueo → Foto → Celebración
   - Gestión de favoritos y filtros
   - Añadir amigo → Solicitud → Aceptar/Rechazar
   - Comparación de progreso entre amigos

4. **Documentación existente:**
   - `docs/` — Arquitectura, deployment, desarrollo
   - `frontend/docs/` — Componentes, hooks, navegación, estilos
   - `backend/docs/` — API, database, funciones

### Fase 2: Auditoría y Optimización
**Objetivo:** Código profesional, limpio y óptimo

1. **Identificar y gestionar placeholders:**
   - Localizar TODOS los archivos placeholder/stub restantes
   - Para cada uno: ¿Implementar o eliminar?
   - Criterio: Solo implementar si mejora estructura o rendimiento
   - La app ya funciona sin ellos

2. **Revisión de código:**
   - Detectar redundancias y código muerto
   - Verificar consistencia de patrones
   - Optimizar imports y dependencias
   - Validar manejo de errores
   - Revisar tipos TypeScript

3. **Verificar documentación:**
   - ¿Refleja el estado actual del código?
   - ¿Hay inconsistencias o información desactualizada?

### Fase 3: Implementación de Tests Unitarios
**Objetivo:** Cobertura de testing profesional

Los tests NO se han implementado durante el desarrollo. Debes crearlos en `frontend/__tests__/`:

**Prioridad Alta:**
- Services (database, auth, storage, location)
- Stores (Zustand: auth, medals, favorites, friends)
- Hooks críticos (useAuth, useMedals, useFavorites, useFriends)

**Prioridad Media:**
- Componentes de UI reutilizables
- Utilidades y helpers
- Validaciones y lógica de negocio

**Consideraciones:**
- Usar Jest + React Native Testing Library
- Mockear Supabase y servicios externos
- Tests unitarios, no de integración completa
- Seguir estructura existente en `__tests__/`

---

## Documentación de Referencia

| Área | Archivos |
|------|----------|
| Arquitectura | `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md` |
| Base de datos | `backend/docs/DATABASE.md`, `backend/supabase/migrations/` |
| Componentes | `frontend/docs/COMPONENTS.md` |
| Hooks | `frontend/docs/HOOKS.md` |
| Navegación | `frontend/docs/NAVIGATION.md` |
| User Stories | `docs/USER_STORIES.md` |
| Tareas Sprint | `docs/sprint_tasks/SPRINT_*_TASKS.md` |

---

## Instrucciones - Paso 1

**No implementes ni modifiques nada todavía.**

Tu primera tarea es realizar un **análisis exhaustivo** del proyecto completo. Explora todos los archivos, comprende todos los flujos, lee toda la documentación.

### Entregable Requerido

Genera un **informe técnico completo** que incluya:

1. **Resumen de arquitectura:**
   - Diagrama de flujo de datos
   - Módulos principales y sus responsabilidades
   - Dependencias entre capas

2. **Mapa de funcionalidades:**
   - Cada feature implementada
   - Archivos involucrados en cada flujo
   - Cómo interactúan entre sí

3. **Inventario de código:**
   - Stores y su estado
   - Services y sus métodos
   - Hooks y su propósito
   - Componentes principales

4. **Análisis de placeholders:**
   - Lista completa de archivos placeholder encontrados
   - Ubicación y propósito teórico de cada uno
   - Recomendación inicial: implementar vs eliminar

5. **Estado de la documentación:**
   - ¿Está actualizada?
   - Inconsistencias detectadas

6. **Plan preliminar de tests:**
   - Qué testear por orden de prioridad
   - Estructura propuesta para `__tests__/`

7. **Observaciones iniciales:**
   - Posibles mejoras detectadas
   - Redundancias o código muerto
   - Preguntas o dudas

---

## Principios de Trabajo

- **Análisis primero:** Comprender TODO antes de modificar nada
- **Profesionalidad:** El código final debe ser de calidad producción
- **Minimalismo:** No añadir complejidad innecesaria
- **Documentación:** Todo cambio debe quedar documentado
- **Testing:** Cobertura significativa de funcionalidades críticas

---

# Prompt 2

Excelente análisis, has hecho un informe técnico de auditoría muy completo. Confirmo tu comprensión total del proyecto, puedes continuar con las tareas que te he asignado.

## Aclaraciones
1. **Notificaciones (US-020)**: No van a ser implementadas estas notificaciones, en su lugar se ajustó un diseño de marcador de medalla con un borde de otro color para representar que la medalla está disponible, pero no aparece ninguna notificación (ni tenemos configuración de la app, como indica el US). Este User Story debe ser modificado para describir otra funcionalidad que sí que esté implementada en la app pero no aparezca referenciada en `USER_STORIES.md`. Revisa el proyecto y el archivo `USER_STORIES.md` para decidir qué historia de usuario añadir.
2. **Limpieza de stores al logout**: El comportamiento deseado es que se limpien los estados que tienen información específica del usuario anterior de la app en el dispositivo. Si no limpiamos las cachés de los favoritos, amigos y medallas conseguidas del usuario1 cuando cierra sesión, podría ocurrir que iniciase sesión usuario2 y que tuviese acceso a los datos del otro usuario mediante la caché. El caché de allMedals no es necesario eliminarlo porque esa información es común a todos los usuarios, se muestra en el mapa de todos (y mantener su caché hace que se cargue más rápido). Analiza este diseño propuesto e indica si te parece óptimo y buena idea o si cambiarías algo de este. Confirma también si el diseño descrito es el que refleja el proyecto actualmente.
3. **devConfig con mock location**: Deberá mantenerse como feature de desarrollo por si es necesario utilizarlo en algún momento en el futuro, pero deberá desactivarse antes de entregar el proyecto final (MOCK_LOCATION_ENABLED: true).

### Aclaraciones extra
- He desactivado 'MOCK_LOCATION_ENABLED' de `devConfig.ts` y he puesto el valor de proximidad a 15 metros de nuevo para que estos mocks no interfieran con los tests que vas a implementar.
- Esta app todavía no está desplegada, se está utilizando mediante la app Expo Go de Android para probarla. En un futuro (después de la entrega de código) vamos a desplegar la aplicación para poder utilizarse como una app normal, utilizando Google Maps API y Google Places API para el mapa y la navegación. Ten en cuenta esto para las decisiones que tomes respecto a archivos a eliminar y a la documentación técnica del proyecto.
- El proyecto debe quedar lo más profesional posible, con una documentación bien hecha y actualizada. Si durante el desarrollo de tus tareas consideras que debes añadir algo o cambiar algo en los archivos de documentación, hazlo explicándome tu razonamiento. Si consideras necesario crear algún archivo nuevo de documentación para documentar de manera profesional algún aspecto importante que no se pueda recoger en los archivos ya existentes, tienes mi aprobación para hacerlo.
- Debes realizar tus tareas de 1 en 1, explicando tu razonamiento en las tareas de desarrollo y de toma de decisiones.

## Tareas que debes realizar
Completa las siguientes tareas paso a paso, en el orden que te indico:
- Guardar el informe completo que has realizado en formato Markdown en el archivo que te he adjuntado, `TECNIC_AUDIT.md`.
- Leer mis aclaraciones y resolver sus cuestiones.
- Implementar `setup.ts` para tests.
- Crear tests unitarios (Fase 1)
- Crear tests unitarios (Fase 2-3)
- Implementar `dateFormatter.ts` si lo consideras útil para el proyecto (revisa en qué partes del código se puede implementar y supondría una mejoría)
- Eliminar los placeholders inútiles
- Revisar console.logs (no los elimines, solo quiero que me des más información de qué logs consideras mejor quitar y cuáles podemos dejar para la versión de producción)
- Revisión final de documentación + actualizarla si es necesario

---

# Prompt 3

Has hecho un buen trabajo. Vamos a seguir con los siguientes pasos, pero primero debes revisar algunas cuestiones:

## Cuestiones a revisar
- No entiendo cómo han funcionado los archivos de test, están todos repletos de errores que ha detectado el linter que he ejecutado:
```
Found 643 errors in 8 files.

Errors  Files
    97  __tests__/services/AuthValidator.test.ts:19
    72  __tests__/setup.ts:18
    85  __tests__/stores/authStore.test.ts:12
    62  __tests__/stores/favoritesStore.test.ts:9
    91  __tests__/stores/friendsStore.test.ts:9
    91  __tests__/stores/locationStore.test.ts:9
    87  __tests__/stores/medalsStore.test.ts:15
    58  __tests__/utils/distanceCalculator.test.ts:13
npm error Lifecycle script `type-check` failed with error:
npm error code 2
npm error path C:\Users\tpv88\Desktop\Salmantour\Salmantour\frontend
npm error workspace salmantour-frontend@1.0.0
npm error location C:\Users\tpv88\Desktop\Salmantour\Salmantour\frontend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c tsc --noEmit


> salmantour-backend@1.0.0 type-check
> tsc --noEmit

```
La mayoría de esos errores se repiten. Algunos de los más comunes son:
```
Cannot use namespace 'jest' as a value.ts(2708)
Cannot find name 'afterEach'.ts(2304)
Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.ts(2582)
Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.ts(2582)
Cannot find name 'expect'.ts(2304)
Cannot find name 'beforeEach'.ts(2304)
Property 'isLoading' does not exist on type 'object'.ts(2339)
```

Analiza los errores indicados, razona por qué han funcionado algunos tests a pesar de existir estos errores y explícame qué debemos hacer para solucionarlos. También quiero entender por qué has configurado como preset 'react-native' en vez de 'jest-expo', que era lo que estaba antes. ¿Por qué fallaba? ¿Por qué la solución es cambiar ese valor a 'react-native'?

- Has actualizado el archivo de documentación `TECNIC_AUDIT.md`, pero no has revisado todos los demás. Este archivo está "oculto", no forma parte de la documentación técnica oficial del proyecto, únicamente me sirve a mí para desarrollar la Memoria del proyecto. Los archivos de documentación que debes revisar y asegurarte que están actualizados son los demás de `docs`, los de `frontend/docs`, los de `backend/docs` y los `README.md` de todos los workspaces. Te he adjuntado todos los archivos para que los revises por separado y verifiques si están todos en su versión final o si recomendarías cambiar o añadir alguna cosa a alguno de ellos.

- Por ahora no es necesario que configuremos CI/CD para este proyecto. Dejaremos los tests unitarios para que sean ejecutados manualmente siempre que se quieran probar las funcionalidades, pero no es necesario la configuración de CI/CD en este proyecto (que prácticamente está en su versión final).

## Tu objetivo de ahora
- Confirmar que ya has revisado y resuelto las cuestiones que te he planteado.
- Cambiar el US-020 por el que indicaste "Indicador visual de proximidad"
- Revisar el archivo `USER_STORIES.md` y decidir si están bien diseñados todos los User Stories o si faltan algunos. Por ejemplo, dijiste que hay algunas funcionalidades relevantes como la de "Retomar foto de medalla" que está implementada en la app pero no está definida como User Story.
- Complementa el archivo `USER_STORIES.md` con los User Stories que hayas diseñado que consideres que faltan. Deja este archivo en su versión final, con todas las User Stories profesionales y bien definidas.
- Actualizar los archivos de documentación que lo necesiten.
- Decide si documentar la implementación de tests en los archivos existentes de documentación o si es mejor crear un archivo de documentación específico para ello.

## Próximos objetivos (para el prompt siguiente)
- Añadir el resto de tests que consideres relevantes e importantes. Analiza en profundidad los componentes implicados para cada test antes de añadirlo, para asegurarte que haces todos los mocks bien y que no te aparezcan errores como los que te han aparecido antes, y que te han hecho descartar algunos tests interesantes.
- Revisión final de los archivos de documentación por si hay que cambiar algo más.
- Diseño de commits a realizar para subir los cambios finales que hemos realizado, concluyendo el desarrollo del proyecto.

---

# Prompt 4

Perfecto, gran trabajo. Continúa ahora con el resto de tareas pendientes:

## Tus objetivos
- Ajusta `USER_STORIES.md`: Como has añadido US nuevos, ahora están desordenados y en los últimos números aparecen algunos US del Sprint 1, 4 y 6. Reenumera los User Stories para que todos sigan un orden de sprints.
- Reajusta la estimación de coste de algunos US para que todos los Sprints tengan una carga algo más parecida entre ellos, no de 11 a 21 puntos, como está ahora.
- Verifica que `USER_STORIES.md` y `DEVELOPMENT.md` sean coherentes entre ellos y que reflejen el mismo desarrollo. Puede ser que `DEVELOPMENT.md` esté ligeramente desactualizado y que necesite algunos retoques. Haz cambios menores en este archivo (los que se necesite) para que refleje una planificación profesional de un proyecto de ingeniería con estimaciones reales, que tengan sentido según el proyecto que hemos realizado.
- Añadir el resto de tests que consideres relevantes e importantes. Analiza en profundidad los componentes implicados para cada test antes de añadirlo, para asegurarte que haces todos los mocks bien y que no te aparezcan errores como los que te han aparecido antes, y que te han hecho descartar algunos tests interesantes.
- Revisión final de los archivos de documentación por si hay que cambiar algo más.
- Diseño de commits a realizar para subir los cambios finales que hemos realizado, concluyendo el desarrollo del proyecto. Debes decirme cuántos commits hacer, qué archivos meter en cada uno y qué descripción breve le pongo a cada commit. No es necesario que hagas los comandos para ejecutar en terminal, únicamente debes razonar cómo distribuir los archivos de #changes en commits y los comentarios de cada commit (sigue las convenciones típicas de comentarios de commits, hazlos breves y en inglés).

---

Entiendo tu decisión de no añadir más tests porque las funcionalidades no testeadas están muy acopladas a Supabase y ya hemos comprobado manualmente que funcionan bien. Debes detallar esta decisión y explicar bien qué aspectos de la app están abarcados con los 156 test implementados. Además de esto, necesito que termines la tarea que te encomendé de las historias de usuario.

## Tu objetivo
- Renumerar todas las historias de usuario para que estén en orden
- Reajustar un poco los Story Points de los US para que estén un poco más balanceados (que el rango entre el Sprint con menos y el Sprint con más no sea tan grande)
- Actualizar `DEVELOPMENT.md` para que refleje la situación real. En el archivo `USER_STORIES.md` se detalla qué tareas se hicieron en cada Sprint. Asegúrate de que `DEVELOPMENT.md` concuerda en su explicación de cada Sprint con lo que se dice en `USER_STORIES.md`. Además, en `DEVELOPMENT.md` se detalla una estimación de puntos para cada Sprint que está desactualizado, cámbialo para que refleje la misma cantidad de puntos y velocidad que `USER_STORIES.md` (la velocidad y la cantidad de puntos completados de los prometidos pueden ser estimados, estímalos de manera realista, que quede como un trabajo real)
- Además de la estimación de coste y tiempo y la planificación temporal en `DEVELOPMENT.md`, hay varios apartados más que están desactualizados y que debes corregir para que reflejen la situación real del proyecto. Por ejemplo, el apartado 'Convenciones de Código' tiene varias cosas erróneas que se han hecho de manera diferente en el proyecto. Tú, como experto en nuestro proyecto "Salmantour", conoces en profundidad cómo está hecha cada cosa de la app, la estructura de carpetas definida y las convenciones de código que se han utilizado; analiza en profundidad el repositorio para corregir el archivo `DEVELOPMENT.md` de manera completa.
- Revisar la documentación actual sobre los tests unitarios añadidos. Detallar más esta documentación, explicando mejor qué funcionalidades abarcan estos 156 tests y qué funcionalidades no recogemos en los tests unitarios por estar muy conectadas a Supabase.

## Plan de renumeración (propuesto por ti)
- Sprint 1: US-001 a US-007 (añadiendo US-024 como US-007)
- Sprint 2: US-008 a US-010
- Sprint 3: US-011 a US-013
- Sprint 4: US-014 a US-019 (añadiendo US-025 y US-026)
- Sprint 5: US-020 a US-023
- Sprint 6: US-024 a US-028 (renumerando las actuales US-021 a US-023 + US-027 y US-028)

---

# Prompt 5

Excelente trabajo. Vamos a continuar con la revisión final del proyecto y poder concluir su entrega:

## Tus tareas
- Revisa en profunidad el archivo `ARCHITECTURE.md`, que es uno de los archivos más importantes de documentación. Asegúrate de que todo lo que dice es correcto y que está actualizado. Además, debes mejorar la parte de 'Testing', que ahora es poco detallada y se podría integrar mejor, explicando las decisiones tomadas para los tests unitarios (algunas las explicas en `DEVELOPMENT.md`, pero es necesario que lo expliques en profundidad aquí también)
- Tengo algunas dudas sobre `DEVELOPMENT.md` que debes resolver:
    - No tengo realizado ningún ADR, mencionados en el apartado '### ADRs (Architecture Decision Records)'. Decide si desarrollarlos e incluirlos en ese apartado del archivo `DEVELOPMENT.md` o si consideras mejor eliminar esa sección.
    - La sección de '## Lecciones aprendidas (Ejemplo)' está desactualizada, las cuestiones planteadas para cada Sprint mencionado no concuerdan con lo realizado en esos Sprints. Genera otras 3 lecciones que sean realistas según el contexto del proyecto realizado y nuestros sprints definidos en el desarrollo. Utiliza el formato existente para crear esas 3 lecciones.
- Ya realizaste la auditoría completa de `frontend` y los archivos de documentación de `docs`. Realiza ahora la auditoría de `backend`, te he adjuntado la carpeta completa. Esta carpeta tiene definidos varios placeholders y carpetas que al final no fueron utilizados. Realiza un review similar al que hiciste antes, determinando qué placeholders eliminar y cuáles podrían servir en un futuro (a lo mejor para la parte de despliegue, que desplegar la app es lo único pendiente del desarrollo). Revisa todos los archivos 1 a 1 y genera el review de este, indicando si hay cosas que cambiar o mejorar, y tu decisión sobre los placeholders.
- Revisa la documentación de backend, explica qué documenta cada archivo y revisa si alguno necesita alguna corrección, actualización o mejoría.

---

# Prompt 6

Muy bien, estoy muy satisfecho con tu revisión y tus cambios realizados. Tienes una última tarea de revisión y de documentación para dejar el proyecto en su estado final entregable.

## Última tarea
Revisa todos los archivos que te he adjuntado de 1 en 1, verificando que todos están bien desarrollados y en un estado perfecto para la entrega final:
- Todos los archivos de configuración del programa: Comprueba que todos están bien, si son necesarios y si alguno necesita un reajuste o no.
- Los archivos de documentación `README.md` de todos los workspaces: Revisa la redacción, la veracidad y la coherencia con el estado final del proyecto de todos estos archivos. Implementa todas las mejoras que detectes que necesiten (si lo necesitan) 
- El archivo adjunto `Informe Planteamiento Salmandour.md` detalla muy bien la parte de la finalidad y alcance del proyecto necesaria en la memoria. Sin embargo, se encuentra muy desactualizado en algunas partes. Revisa el archivo en profundidad y compáralo con tu conocimiento completo del proyecto final. Actualiza las partes necesarias y añade las mejoras que consideres.

---

# Prompt 7

Genial, has realizado una buena revisión y cambios. Ya solo falta que revises y mejores la documentación específica del frontend, que he detectado varios fallos y cosas que me gustaría que dejases perfectas para la entrega. Revisa los archivos que te detallo a continuación, verifica si todos se encuentran completamente actualizados y completa la revisión específica que te indico para cada archivo:

- `COMPONENTS.md`: Este archivo tiene partes que están desactualizadas, se mencionan componentes que ya no existen y ubicaciones de archivos distintas a las reales. Revísalo en profundidad y compáralo con tu conocimiento completo del repositorio para detectar qué cosas tienes que eliminar, editar y añadir en este archivo.
- `SETUP.md`: Considero que este archivo de documentación es demasiado "técnico". Creo que tiene demasiados bloques de códigos y poca explicación de cada cosa. En mi opinión, preferiría que los archivos de documentación como este explicasen mejor cada cosa con palabras (y un poco más de redacción), acompañado con algunos bloques de código de ejemplo para complementar la explicación, pero no que el archivo consista en indicar bloques de código uno tras otro. ¿Qué opinas sobre esto? Tú eres el experto, así que sabrás tomar la mejor decisión para dejar el archivo `SETUP.md` de la manera más profesional y mejor posible. Explica tu razonamiento e implementa los cambios que consideres.
- `NAVIGATION.md`: Asegúrate de que toda la información está actualizada. Además, creo que le pasa un poco parecido al caso anterior, y tiene varias partes que no están explicadas con palabras (redactadas). En su lugar, tiene varias secciones compuestas únicamente por bloques de código de ejemplo. Analiza en este caso también si le vendría bien documentar cada cosa mejor con palabras y explicaciones, utilizando algunos bloques de código de ejemplo para apoyar a la explicación escrita.
- `STYLING.md`: Este archivo está muy desactualizado, con información que no es cierta en varios puntos. Revísalo en profundidad y asegúrate que la versión final representa la realidad de la técnica de styling que hemos utilizado para este proyecto.

---

# Prompt 8

Debes hacer 2 correcciones más de archivos de documentación:

- `SECURITY.md`: También ocurre algo parecido con este archivo sobre la redacción, es muy técnico, con muy poca explicación y mucho código. Se centra mucho en flujos, mencionando pocas cosas de "medidas de seguridad tomadas" como tal. Este archivo es crucial, ya que supone la base de un Anexo que debo entregar con la memoria del TFG, "Anexo IV: Plan de Seguridad". Este archivo debe detallar todas las medidas de seguridad que aplica nuestro proyecto (Como el RLS controlado con políticas y funciones RPC, por ejemplo) y todas las medidas de seguridad tomadas durante el desarrollo del proyecto (buenas prácticas de desarrollo que aseguren un código robusto, seguro y protegido). Redacta mejor este archivo, que es muy importante.

- `HOOKS.md`: Me equivoqué antes diciéndote "SETUP.md" en vez de "HOOKS.md". Este es el archivo que debías revisar de `docs/frontend`. Te repito la explicación sobre lo que quiero que corrijas de este archivo:
Considero que este archivo de documentación es demasiado "técnico". Creo que tiene demasiados bloques de códigos y poca explicación de cada cosa. En mi opinión, preferiría que los archivos de documentación como este explicasen mejor cada cosa con palabras (y un poco más de redacción), acompañado con algunos bloques de código de ejemplo para complementar la explicación, pero no que el archivo consista en indicar bloques de código uno tras otro. ¿Qué opinas sobre esto? Tú eres el experto, así que sabrás tomar la mejor decisión para dejar el archivo `HOOK.md` de la manera más profesional y mejor posible. Explica tu razonamiento e implementa los cambios que consideres.

---

# Prompt 9

Al ejecutar el script 'npm run build' de la raiz se realizan las comprobaciones de tipos, el linter y el prettier para todos los workspaces. Esto sirve para comprobar de manera rápida si hay algún error en el código. Lo he probado y me ha aparecido lo siguiente:
```
$ npm run build

> salmantour@1.0.0 build
> npm run format && npm run validate && npm run build --workspaces --if-present


> salmantour@1.0.0 format
> npm run format --workspaces --if-present


> salmantour-frontend@1.0.0 format
> prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

__tests__/services/AuthValidator.test.ts 169ms (unchanged)
__tests__/setup.ts 112ms (unchanged)
__tests__/stores/authStore.test.ts 47ms (unchanged)
__tests__/stores/favoritesStore.test.ts 46ms (unchanged)
__tests__/stores/friendsStore.test.ts 58ms (unchanged)
__tests__/stores/locationStore.test.ts 56ms (unchanged)
__tests__/stores/medalsStore.test.ts 53ms (unchanged)
__tests__/utils/distanceCalculator.test.ts 38ms (unchanged)
app.json 46ms (unchanged)
app/_layout.tsx 34ms (unchanged)
app/(auth)/_layout.tsx 8ms (unchanged)
app/(auth)/forgot-password.tsx 34ms (unchanged)
app/(auth)/login.tsx 27ms (unchanged)
app/(auth)/signup.tsx 33ms (unchanged)
app/(auth)/verify-email.tsx 49ms (unchanged)
app/(modals)/camera.tsx 53ms (unchanged)
app/(modals)/comparison.tsx 109ms (unchanged)
app/(modals)/edit-profile.tsx 82ms (unchanged)
app/(modals)/friend-profile.tsx 110ms (unchanged)
app/(tabs)/_layout.tsx 11ms (unchanged)
app/(tabs)/friends.tsx 29ms (unchanged)
app/(tabs)/gallery.tsx 97ms (unchanged)
app/(tabs)/map.tsx 70ms (unchanged)
app/(tabs)/profile.tsx 64ms (unchanged)
app/(tabs)/progress.tsx 59ms (unchanged)
app/+not-found.tsx 9ms (unchanged)
app/index.tsx 5ms (unchanged)
babel.config.js 11ms (unchanged)
docs/COMPONENTS.md 163ms (unchanged)
docs/HOOKS.md 90ms (unchanged)
docs/NAVIGATION.md 82ms (unchanged)
docs/STYLING.md 82ms (unchanged)
eas.json 3ms (unchanged)
index.js 2ms (unchanged)
jest.config.js 5ms (unchanged)
metro.config.js 6ms (unchanged)
package.json 5ms (unchanged)
README.md 28ms (unchanged)
src/components/base/Button.tsx 25ms (unchanged)
src/components/base/index.ts 3ms (unchanged)
src/components/camera/CameraControls.tsx 24ms (unchanged)
src/components/camera/CameraView.tsx 27ms (unchanged)
src/components/camera/index.ts 2ms (unchanged)
src/components/camera/PhotoPreview.tsx 26ms (unchanged)
src/components/forms/index.ts 2ms (unchanged)
src/components/forms/InputField.tsx 19ms (unchanged)
src/components/map/index.ts 2ms (unchanged)
src/components/map/MapMarker.tsx 36ms (unchanged)
src/components/map/MapView.tsx 33ms (unchanged)
src/components/map/MedalSearch.tsx 9ms (unchanged)
src/components/medals/index.ts 2ms (unchanged)
src/components/medals/MedalCard.tsx 53ms (unchanged)
src/components/medals/MedalStatusBadge.tsx 16ms (unchanged)
src/components/medals/MedalThumbnail.tsx 24ms (unchanged)
src/components/medals/MedalUnlockModal.tsx 31ms (unchanged)
src/components/social/ComparisonCard.tsx 35ms (unchanged)
src/components/social/ComparisonHeader.tsx 37ms (unchanged)
src/components/social/ComparisonMedalDetail.tsx 36ms (unchanged)
src/components/social/FriendCard.tsx 13ms (unchanged)
src/components/social/FriendRequestCard.tsx 16ms (unchanged)
src/components/social/FriendSearchBar.tsx 36ms (unchanged)
src/components/social/FriendStats.tsx 24ms (unchanged)
src/components/social/index.ts 2ms (unchanged)
src/components/ui/CategoryFilter.tsx 13ms (unchanged)
src/components/ui/CategoryProgressBar.tsx 15ms (unchanged)
src/components/ui/FavoriteButton.tsx 12ms (unchanged)
src/components/ui/FavoriteFilterChip.tsx 9ms (unchanged)
src/components/ui/index.ts 3ms (unchanged)
src/components/ui/LoadingSpinner.tsx 7ms (unchanged)
src/components/ui/ScreenContainer.tsx 11ms (unchanged)
src/components/ui/SortChips.tsx 13ms (unchanged)
src/components/ui/StatusFilterRow.tsx 17ms (unchanged)
src/config/constants.ts 5ms (unchanged)
src/config/devConfig.ts 6ms (unchanged)
src/config/index.ts 2ms (unchanged)
src/config/permissions.ts 3ms (unchanged)
src/hooks/auth/index.ts 2ms (unchanged)
src/hooks/auth/useAuth.ts 13ms (unchanged)
src/hooks/auth/useAuthState.ts 4ms (unchanged)
src/hooks/camera/index.ts 2ms (unchanged)
src/hooks/camera/useCamera.ts 21ms (unchanged)
src/hooks/data/index.ts 2ms (unchanged)
src/hooks/data/useFavorites.ts 9ms (unchanged)
src/hooks/data/useFriends.ts 19ms (unchanged)
src/hooks/data/useMedalCollection.ts 34ms (unchanged)
src/hooks/data/useMedals.ts 24ms (unchanged)
src/hooks/location/index.ts 2ms (unchanged)
src/hooks/location/useLocation.ts 12ms (unchanged)
src/lib/index.ts 2ms (unchanged)
src/lib/supabase.ts 11ms (unchanged)
src/services/auth/AuthService.ts 44ms (unchanged)
src/services/auth/AuthValidator.ts 14ms (unchanged)
src/services/auth/index.ts 3ms (unchanged)
src/services/camera/ImageProcessor.ts 21ms (unchanged)
src/services/camera/index.ts 3ms (unchanged)
src/services/database/FavoritesService.ts 14ms (unchanged)
src/services/database/FriendService.ts 82ms (unchanged)
src/services/database/index.ts 2ms (unchanged)
src/services/database/MedalService.ts 77ms (unchanged)
src/services/location/index.ts 2ms (unchanged)
src/services/location/LocationService.ts 29ms (unchanged)
src/services/storage/index.ts 4ms (unchanged)
src/services/storage/StorageService.ts 36ms (unchanged)
src/store/authStore.ts 34ms (unchanged)
src/store/favoritesStore.ts 15ms (unchanged)
src/store/friendsStore.ts 79ms (unchanged)
src/store/index.ts 6ms (unchanged)
src/store/locationStore.ts 33ms (unchanged)
src/store/medalsStore.ts 20ms (unchanged)
src/styles/index.ts 4ms (unchanged)
src/styles/theme.ts 22ms (unchanged)
src/types/database.ts 117ms (unchanged)
src/types/friend.ts 9ms (unchanged)
src/types/index.ts 2ms (unchanged)
src/types/location.ts 5ms (unchanged)
src/types/medal.ts 6ms (unchanged)
src/utils/algorithms/distanceCalculator.ts 9ms (unchanged)
src/utils/algorithms/index.ts 2ms (unchanged)
tsconfig.json 5ms (unchanged)

> salmantour-backend@1.0.0 format
> prettier --write "**/*.{ts,js,json,md}"

docs/API.md 232ms (unchanged)
docs/DATABASE.md 146ms (unchanged)
docs/DEPLOYMENT.md 18ms (unchanged)
docs/FUNCTION.md 39ms (unchanged)
package.json 40ms (unchanged)
README.md 54ms (unchanged)
tsconfig.json 5ms (unchanged)

> salmantour@1.0.0 validate
> npm run lint && npm run type-check


> salmantour@1.0.0 lint
> npm run lint --workspaces --if-present


> salmantour-frontend@1.0.0 lint
> cd .. && eslint frontend --ext .js,.jsx --ignore-pattern '**/*.ts' --ignore-pattern '**/*.tsx'


> salmantour-backend@1.0.0 lint
> cd .. && eslint backend --ext .ts,.js


Oops! Something went wrong! :(

ESLint: 8.57.1

No files matching the pattern "backend" were found.
Please check for typing mistakes in the pattern.

npm error Lifecycle script `lint` failed with error:
npm error code 2
npm error path C:\Users\tpv88\Desktop\Salmantour\Salmantour\backend
npm error workspace salmantour-backend@1.0.0
npm error location C:\Users\tpv88\Desktop\Salmantour\Salmantour\backend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c cd .. && eslint backend --ext .ts,.js
```
¿Qué provoca el error? Investígalo, explícamelo y solucionalo.

También necesito que vuelvas a revisar el archivo `SETUP.md`. Te dije por error que quería que fuese más redactado, con más palabras y menos código, no tan técnico; pero tienes toda la razón en lo de que este debe ser un archivo técnico con instrucciones claras que seguir, no tantas explicaciones. Yo quería que hicieses los cambios en otro archivo (HOOKS.md, que luego lo cambiaste bien), pero te indiqué por error 'SETUP.md' y ahora es demasiado verboso. Vuelve a revisar el archivo y mejóralo todo lo que puedas. Debes hacer que sea un archivo profesional de orientación inicial para configurar y ejecutar el proyecto para nuevos desarrolladores. Puede tener algunas explicaciones que aclaren cosas importante, que siempre vienen bien, pero no debe ser tan redactado como lo es ahora. Arréglalo.