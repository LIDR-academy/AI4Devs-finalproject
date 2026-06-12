# PRD — La Pocha

## 1. Visión del producto y problema que resuelve

La Pocha es una app móvil que digitaliza el marcador del juego de cartas 
español homónimo, eliminando la dependencia del papel y lápiz. El problema 
central es que llevar la puntuación de una partida de La Pocha en papel es 
lento, propenso a errores de cálculo y no deja rastro útil de partidas 
pasadas. La app automatiza el cálculo de puntos, gestiona la restricción 
del repartidor y mantiene un historial consultable, manteniendo la agilidad 
que caracteriza al juego.

## 2. Usuarios objetivo

**Persona 1 — El organizador habitual**
Juan, 38 años. Organiza partidas de La Pocha con su grupo de amigos cada 
pocas semanas. Siempre acaba siendo él quien lleva el marcador en papel. 
Le frustra tener que recalcular puntos manualmente y que al final de la 
partida no recuerde bien cómo fue evolucionando. Quiere algo rápido de 
usar, que no interrumpa el ritmo del juego.

**Persona 2 — El jugador ocasional**
María, 34 años. Juega cuando la invitan. No lleva nunca el marcador pero 
le gustaría poder consultar cómo quedó la última partida o saber cuántas 
veces ha ganado en las partidas con su grupo.

**Persona 3 — El jugador en familia**
Carlos, 55 años. Juega en reuniones familiares. No es especialmente 
tecnológico. Necesita una interfaz clara e intuitiva que no requiera 
explicación para entender el estado de la partida de un vistazo.

## 3. Propuesta de valor

- **Para el organizador:** elimina el cálculo manual y la restricción del 
  repartidor se valida automáticamente, reduciendo conflictos y errores.
- **Para todos los jugadores:** el estado de la partida es siempre visible 
  y claro, sin necesidad de interpretar un papel lleno de tachones.
- **Para los jugadores registrados:** historial de partidas compartido 
  automáticamente entre participantes, sin fricción.

## 4. Alcance del MVP

### Incluye
- Creación y configuración de partida (3-8 jugadores)
- Secuencia de rondas calculada automáticamente según número de jugadores
- Flujo completo de ronda: apuestas → juego → bazas reales → resultado
- Validación de restricción del repartidor en tiempo real
- Corrección de apuestas y bazas en ronda actual
- Repetición de ronda completa
- Lista de favoritos local con gestión (añadir y eliminar)
- Historial de partidas con detalle ronda a ronda
- Eliminación de partidas del historial propio
- Función "repetir partida" desde el historial
- Registro opcional y sincronización automática en la nube
- Historial compartido entre jugadores registrados

### No incluye (post-MVP)
- Subida manual de partidas locales anteriores al registro
- Campeonatos, ligas y gamificación
- Estadísticas sociales entre jugadores
- Variantes random durante la partida
- Soporte para 2 jugadores
- Límite de partidas o favoritos almacenados
- Política de retención configurable

## 5. Flujo E2E prioritario

El organizador abre la app y crea una nueva partida. Selecciona 4 
jugadores — dos por nombre libre y dos buscando usuarios registrados — 
y elige el primer repartidor aleatoriamente. La app genera automáticamente 
la secuencia de 19 rondas para 4 jugadores con 40 cartas.

En cada ronda, la app solicita las apuestas en orden, dejando al 
repartidor para el final y mostrando en tiempo real cuántas bazas quedan 
disponibles y cuál es el número prohibido. Una vez cerradas las apuestas, 
la pantalla de juego muestra el estado completo mientras se juega 
físicamente. Al terminar, se introducen las bazas reales y la app calcula 
y muestra el resultado de la ronda con el ranking actualizado.

Al finalizar la última ronda, se muestra el resultado final. Si el 
organizador tiene cuenta, la partida se sube automáticamente a la nube 
y los jugadores registrados vinculados la reciben en su historial sin 
ninguna acción adicional.

## 6. Funcionalidades principales

### Gestión de partida
- Crear partida con 3-8 jugadores
- Número de cartas determinado automáticamente por número de jugadores:
  - 3 jugadores: 30 cartas, máximo 10 por ronda, 21 rondas
  - 4 jugadores: 40 cartas, máximo 10 por ronda, 22 rondas
  - 5 jugadores: 40 cartas, máximo 8 por ronda, 19 rondas
  - 6 jugadores: 48 cartas, máximo 8 por ronda, 21 rondas
  - 7 jugadores: 49 cartas (+ comodín), máximo 7 por ronda, 19 rondas
  - 8 jugadores: 48 cartas, máximo 6 por ronda, 18 rondas
- Secuencia de rondas: patrón ascendente, plateau y descendente.
  Al llegar al máximo de cartas por ronda (M), se juegan tantas rondas
  con ese máximo como número de jugadores haya en la partida, antes de
  iniciar el descenso. Ejemplo con 4 jugadores (M=10):
  1,2,3,4,5,6,7,8,9,10,10,10,10,9,8,7,6,5,4,3,2,1 (22 rondas)
- Orden de jugadores editable antes de empezar
- Primer repartidor: por defecto el primero, con opción aleatoria
- Repetir partida desde el historial (crea nueva partida editable 
  con misma configuración)

### Flujo de ronda
- Introducción de apuestas en orden rotativo; repartidor siempre el último
- Validación en tiempo real de la restricción del repartidor
- Bloqueo si se intenta cerrar apuestas con restricción incumplida
- Pantalla de juego con apuestas, puntuación acumulada y balance de bazas
- Introducción de bazas reales y cálculo automático de puntos
- Corrección de datos en ronda actual únicamente
- Si una corrección viola la restricción, se bloquea hasta que el 
  repartidor corrija sus bazas
- Opción de repetir la ronda completa

### Jugadores y favoritos
- Añadir jugador por nombre libre, búsqueda de usuario registrado, 
  o selección de favoritos
- Marcar cualquier jugador como favorito para uso futuro
- Gestión de favoritos: añadir y eliminar
- Lista de favoritos almacenada en local

### Historial
- Listado unificado de partidas locales y en nube con icono diferenciador
- Detalle de partida: puntuaciones ronda a ronda
- Eliminación de partidas del historial propio (no afecta a otros 
  participantes)
- Función repetir partida

### Cuenta y sincronización
- Registro y login con email y contraseña
- Subida automática al finalizar si el usuario está registrado
- Distribución automática a jugadores registrados participantes
- Sin funcionalidad offline degradada: la app funciona igual con 
  o sin cuenta

## 7. Restricciones técnicas

- Plataforma: Android e iOS (Flutter)
- Funciona completamente offline; la conectividad solo es necesaria 
  para la sincronización en la nube
- Base de datos local en el dispositivo para partidas y favoritos
- Backend: Firebase (Firestore + Authentication)
- Un único dispositivo actúa como host durante la partida
- No se requiere conectividad durante el juego, solo al finalizar 
  para la subida

## 8. Métricas de éxito para el MVP

- Flujo E2E completo ejecutable sin errores en un dispositivo 
  Android o iOS
- Partida de 4 jugadores completada de principio a fin con 
  puntuaciones correctas
- Partida subida correctamente a Firestore al finalizar
- Jugador registrado vinculado a la partida la ve en su historial 
  sin acción adicional
- Historial local funcional sin conexión a internet