# Modelo de datos — La Pocha (Firestore)

> **Estado:** borrador orientativo. Los campos marcados como *(TBD)* se definirán cuando el modelo de negocio esté cerrado.  
> **Acceso:** app Flutter vía Firebase SDK (Auth + Firestore). Ver [`firebase-data-access.yml`](./firebase-data-access.yml).  
> **Obsoleto:** `api-spec.yml` (REST). Identificadores de colecciones y campos en **inglés** en código y Firestore.

## 1. Convenciones Firestore

| Concepto SQL/Prisma | Equivalente Firestore |
|---------------------|------------------------|
| Tabla | **Colección** de primer nivel (`games`, `users`) |
| Fila | **Documento** (`games/{gameId}`) |
| Clave primaria autoincremental | **ID de documento** (auto-generado o igual al `uid` de Auth en perfiles) |
| Clave foránea | **Referencia** (`DocumentReference`) o **ID denormalizado** (`string userId`) |
| Tabla hija 1:N | **Subcolección** (`games/{gameId}/players/{playerId}`) |
| JOIN | Lecturas múltiples, referencias o **datos denormalizados** para lecturas frecuentes |
| `created_at` / `updated_at` | `Timestamp` (`createdAt`, `updatedAt`; usar `FieldValue.serverTimestamp()` en escrituras) |
| Transacción SQL | **`runTransaction`** o **`WriteBatch`** de Firestore |
| Unicidad global (p. ej. email) | Validación en **reglas de seguridad** + comprobación en use case; no hay `UNIQUE` nativo |

### Rutas de colección (resumen)

```text
users/{userId}
games/{gameId}
games/{gameId}/players/{playerId}
games/{gameId}/rounds/{roundId}
```

### Tipos habituales en documentos

- `string`, `number`, `boolean`, `timestamp`, `array`, `map`
- `DocumentReference` cuando se necesite navegación tipada (p. ej. `hostRef` → `users/{uid}`)
- Enums de dominio como `string` con valores acordados (`status: "lobby" | "in_progress" | "finished"`)

---

## 2. Visión del dominio

**La Pocha** es una app para gestionar partidas del juego de cartas: usuarios autenticados crean o se unen a **partidas** (`games`), participan como **jugadores** (`players`) y registran el progreso por **rondas** (`rounds`).

```mermaid
flowchart TB
    subgraph auth [Firebase Auth]
        AU[uid]
    end

    subgraph users_col [Colección users]
        U[users / userId]
    end

    subgraph games_col [Colección games]
        G[games / gameId]
        P[subcolección players]
        R[subcolección rounds]
    end

    AU --> U
    U -->|hostId / userId| G
    G --> P
    G --> R
    P -->|userId| U
```

---

## 3. Colección `users`

Perfil de aplicación vinculado a **Firebase Authentication**. Se recomienda `userId == Auth.uid`.

**Ruta:** `users/{userId}`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `displayName` | string | sí *(TBD longitud)* | Nombre visible en partidas |
| `email` | string | sí | Copia o reflejo del email de Auth *(solo lectura desde Auth si se prefiere)* |
| `photoUrl` | string | no | URL de avatar |
| `createdAt` | timestamp | sí | Alta del perfil |
| `updatedAt` | timestamp | sí | Última modificación |
| `lastSeenAt` | timestamp | no | Presencia / actividad *(TBD)* |

**Relaciones:**

- Un documento por usuario autenticado.
- Referenciado desde `games.hostId`, `games/{gameId}/players.userId` (ID o `DocumentReference` a `users/{userId}`).

**Reglas de negocio *(borrador)*:**

- Solo el propio `userId` puede crear/actualizar su perfil (salvo admin *(TBD)*).
- `displayName` no vacío.

---

## 4. Colección `games`

Representa una **partida** (sesión de juego): lobby, en curso o finalizada.

**Ruta:** `games/{gameId}`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `title` | string | no | Nombre opcional de la partida *(TBD)* |
| `hostId` | string | sí | `userId` del creador / anfitrión |
| `status` | string | sí | `lobby`, `in_progress`, `finished` *(valores finales TBD)* |
| `maxPlayers` | number | no | Límite de jugadores *(TBD, p. ej. 4–8)* |
| `playerCount` | number | no | Contador denormalizado para listados |
| `currentRoundNumber` | number | no | Última ronda activa o total de rondas jugadas *(TBD)* |
| `settings` | map | no | Reglas variante, puntuación, etc. *(TBD)* |
| `createdAt` | timestamp | sí | Creación |
| `updatedAt` | timestamp | sí | Último cambio |
| `startedAt` | timestamp | no | Inicio de partida |
| `finishedAt` | timestamp | no | Cierre |

**Relaciones:**

- **1:N** → subcolección `players` (participantes en esta partida).
- **1:N** → subcolección `rounds` (manos / rondas de la partida).
- **N:1** → `users` vía `hostId` (y cada `players.userId`).

**Reglas de negocio *(borrador)*:**

- Solo el `hostId` (o reglas acordadas) puede pasar `status` de `lobby` a `in_progress` *(TBD)*.
- Borrado: preferir **soft delete** con `status: "cancelled"` *(TBD)* en lugar de borrar documentos con historial.

---

## 5. Subcolección `players`

Jugador **dentro de una partida concreta**. Puede ser el mismo usuario en varias partidas con documentos distintos.

**Ruta:** `games/{gameId}/players/{playerId}`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `userId` | string | sí | Referencia lógica a `users/{userId}` |
| `displayName` | string | no | Copia denormalizada para UI sin leer `users` |
| `seatOrder` | number | no | Orden en mesa *(TBD)* |
| `totalScore` | number | no | Puntuación acumulada en la partida |
| `isHost` | boolean | no | Si coincide con `games.hostId` |
| `joinedAt` | timestamp | sí | Alta en la partida |
| `leftAt` | timestamp | no | Abandono anticipado *(TBD)* |
| `status` | string | no | `active`, `left` *(TBD)* |

**Relaciones:**

- **N:1** → documento padre `games/{gameId}`.
- **N:1** → `users/{userId}` vía campo `userId`.

**Alternativa de modelado *(TBD)*:** lista embebida `playerIds` en `games` para partidas muy pequeñas; las subcolecciones escalan mejor para puntuaciones y permisos por jugador.

**Reglas de negocio *(borrador)*:**

- Un mismo `userId` no debería aparecer dos veces en la misma partida (validar en use case + reglas).
- Máximo de jugadores según `games.maxPlayers` *(TBD)*.

---

## 6. Subcolección `rounds`

Una **ronda** (mano) dentro de la partida: apuestas, bazas, puntuación parcial, etc. Detalle de reglas del juego *(TBD)*.

**Ruta:** `games/{gameId}/rounds/{roundId}`

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `roundNumber` | number | sí | Orden secuencial (1, 2, 3…) |
| `cardsInRound` | number | sí | Cartas repartidas a cada jugador en esta ronda |
| `dealerPlayerId` | string | sí | `playerId` del repartidor de la ronda |
| `status` | string | sí | `bidding`, `playing`, `closed` (MVP local) |
| `bids` | map\<string, number\> | no | Apuestas por `playerId` (`playerId` → entero 0…`cardsInRound`) |
| `tricks` | map\<string, number\> | no | Bazas reales por `playerId` |
| `scoresDelta` | map\<string, number\> | no | Puntos de la ronda por `playerId` |
| `createdAt` | timestamp | sí | Apertura de ronda |
| `closedAt` | timestamp | no | Cierre y reparto de puntos |

**Ejemplo de `bids` (map):**

```json
{
  "playerId_abc": 3,
  "playerId_def": 2,
  "playerId_ghi": 1,
  "playerId_jkl": 0
}
```

**Persistencia local (Drift):** columna `bids` como `TEXT` serializado con `MapStringIntConverter` (`Map<String, int>`).

**Alineación Firestore:** el campo se documenta como `bids` (map); en borradores anteriores aparecía como `bid` singular — usar `bids` en implementaciones nuevas.

**Ejemplo de `scoresDelta` (map):**

```json
{
  "playerId_abc": 2,
  "playerId_def": -1
}
```

**Relaciones:**

- **N:1** → `games/{gameId}`.
- Referencias opcionales a documentos en `players` mediante `playerId` en mapas (no FK automática).

**Reglas de negocio *(borrador)*:**

- `roundNumber` único por partida (transacción al crear la siguiente ronda).
- No modificar rondas `closed` salvo corrección admin *(TBD)*.
- **Restricción del repartidor (apuestas):** la suma total de `bids` **no puede igualar** `cardsInRound`. El repartidor apuesta siempre el último; al llegar su turno, el **número prohibido** es `cardsInRound - sum(bids de los demás)`. Si intenta apostar ese valor, se bloquea la confirmación.
- Orden de apuestas: jugador siguiente al repartidor en `seatOrder` primero; repartidor último.
- Transición de estado al cerrar apuestas: `bidding` → `playing`.
- Transición al cerrar bazas: `playing` → `closed`; se persisten `tricks`, `scoresDelta` y `closedAt`.
- **Reglas de puntuación por ronda** (calculadas al cerrar, ver LPT-11):
  - Si `tricks[playerId] == bids[playerId]`: `scoresDelta = 10 + (5 × tricks)`.
  - Si difieren: `scoresDelta = -5 × |bids[playerId] - tricks[playerId]|`.
  - `players.totalScore` se incrementa con `scoresDelta` de la ronda (persistencia local Drift; Firestore en sync futuro).

---

## 7. Diagrama de colecciones (Firestore)

```mermaid
erDiagram
    USERS ||--o{ GAMES : "hosts"
    USERS ||--o{ PLAYERS : "plays_as"
    GAMES ||--o{ PLAYERS : "contains"
    GAMES ||--o{ ROUNDS : "contains"

    USERS {
        string userId PK
        string displayName
        string email
        timestamp createdAt
        timestamp updatedAt
    }

    GAMES {
        string gameId PK
        string hostId
        string status
        number playerCount
        timestamp createdAt
        timestamp updatedAt
    }

    PLAYERS {
        string playerId PK
        string userId
        number seatOrder
        number totalScore
        timestamp joinedAt
    }

    ROUNDS {
        string roundId PK
        number roundNumber
        string status
        map scoresDelta
        timestamp createdAt
    }
```

> En Firestore, `PK` = ID del documento. Las líneas indican relación lógica, no integridad referencial automática.

---

## 8. Índices compuestos *(borrador)*

Definir en `firestore.indexes.json` según consultas reales. Candidatos:

| Colección | Campos | Uso |
|-----------|--------|-----|
| `games` | `hostId` + `createdAt` desc | Partidas creadas por un usuario |
| `games` | `status` + `updatedAt` desc | Listar partidas activas |
| `games/{gameId}/rounds` | `roundNumber` asc | Ordenar rondas |
| `games/{gameId}/players` | `userId` | Buscar si un usuario ya está en la partida |

---

## 9. Seguridad *(borrador)*

Alinear `firestore.rules` con:

- `users/{userId}`: lectura autenticada; escritura solo si `request.auth.uid == userId`.
- `games/{gameId}`: lectura para participantes *(TBD: claim o membership en `players`)*; escritura según `hostId` y `status`.
- `players`, `rounds`: acceso limitado a miembros de la misma `gameId`.

Detalle de reglas en implementación; este documento solo fija intención.

---

## 10. Principios de diseño

1. **IDs estables:** Auth `uid` para perfiles; IDs auto-generados para `gameId`, `playerId`, `roundId` salvo decisión contraria.
2. **Subcolecciones para datos acotados a una partida** (`players`, `rounds`) y reglas por ruta.
3. **Denormalización controlada:** `displayName` en `players`, `playerCount` en `games` para listados; actualizar en transacción cuando cambie el origen.
4. **Tiempo real:** `snapshots()` en partida activa para lobby y ronda en curso.
5. **Evolución:** nuevos campos con valores por defecto; evitar renombrar colecciones en producción sin migración.

---

## 11. Checklist al cerrar el modelo definitivo

- [ ] Confirmar valores de `status` en `games`, `players`, `rounds`
- [ ] Definir estructura de `settings`
- [x] Definir estructura de `tricks` y `scoresDelta` (map `playerId` → entero; ver §6 y reglas LPT-11)
- [x] Definir estructura de `bids` (map `playerId` → entero; ver §6)
- [ ] Decidir `DocumentReference` vs `string` para enlaces a `users`
- [ ] Actualizar `firebase-data-access.yml` y `firestore.rules`
- [ ] Añadir índices medidos en consola Firebase
- [ ] Reflejar entidades en capa `domain/` de la app (`User`, `Game`, `Player`, `Round`)

---

## 12. Historial

| Fecha | Cambio |
|-------|--------|
| 2026-06-03 | Reescritura: dominio La Pocha (users, games, players, rounds) en terminología Firestore; eliminado modelo LTI/relacional |
