# Sistema de Gamificación — App Parkings de Moto

> Documento de referencia del sistema de puntos, niveles, insignias y rankings.
> Forma parte del PRD del proyecto y sirve como input para Spec Driven Development con Claude Code.

---

## 1. Visión general

La gamificación de la app se estructura en **tres capas independientes**:

| Capa | Tipo | Función |
|---|---|---|
| **Octanos** | Numérico, acumulativo | Moneda interna que mide la contribución del usuario |
| **Niveles** | Rango (1–7) | Identidad pública del usuario, sube según Octanos acumulados |
| **Insignias** | Logros desbloqueables | Hitos específicos no ligados al nivel |

Esta separación permite que un usuario de nivel medio pueda destacar por insignias específicas, y que las temáticas (eventos, ciudades, especialidades) se lancen de forma incremental sin tocar el core del sistema.

**Regla fundamental: los niveles solo suben.** Los Octanos se acumulan de forma permanente y el nivel del usuario nunca degrada. Esto prioriza motivación y retención sobre presión.

---

## 2. Octanos (moneda interna)

### 2.1 Tabla de acciones puntuables

| Acción | Octanos | Notas |
|---|---|---|
| Proponer un parking nuevo | **+50** | Se acreditan al pasar verificación de la comunidad |
| Tu parking propuesto queda verificado | **+30** | Bonus diferido. Refuerza retorno a la app |
| Verificar un parking (con foto in situ) | **+25** | Acción más valiosa para la calidad del dato |
| Ser el 1er verificador de un parking | **+15** | Bonus encima de los +25. Incentiva rapidez |
| Reportar parking erróneo (confirmado) | **+20** | Mantiene el dataset limpio |
| Subir foto a un parking existente | **+10** | Máx. 3 fotos puntuables por parking |
| Comentario útil | **+5** | Solo cuenta si recibe ≥2 votos positivos |
| Proponer taller/POI secundario | **+30** | Feature secundario, peso menor que parking |
| Racha semanal (abrir app 7 días seguidos) | **+15** | Refuerza hábito |
| Invitar amigo que se registra y verifica algo | **+40** | Crecimiento orgánico |

### 2.2 Reglas anti-abuso

Estas reglas son **obligatorias** desde el día 1 para evitar farmeo:

1. **Cap diario**: máximo **200 Octanos/día** por usuario.
2. **Verificación geolocalizada**: para puntuar una verificación, el usuario debe estar en un radio ≤ 100 m del parking, y la foto debe llevar timestamp reciente (≤ 5 min).
3. **Acreditación tras moderación**: las acciones solo suman Octanos cuando pasan moderación (ver §6).
4. **Cooldown por parking**: un usuario no puede verificar dos veces el mismo parking, ni proponer y autoverificar el suyo propio.
5. **Detección de patrones**: marcar para revisión cuentas con >5 propuestas rechazadas en 7 días.

---

## 3. Niveles

7 niveles. La curva es exponencial suave: rápida en los primeros (engancha desde el día 1) y aspiracional en los últimos (objetivo a largo plazo).

| Nivel | Nombre | Octanos requeridos | Octanos para alcanzar | Estimación de actividad |
|---|---|---|---|---|
| 1 | **Pipiolo** | 0 | — | Registro |
| 2 | **Rodador** | 101 | 101 | ~2 verificaciones + 1 propuesta |
| 3 | **Buscaplazas** | 501 | 501 | ~5 propuestas verificadas |
| 4 | **Cartógrafo** | 1.501 | 1.501 | ~15 propuestas o equivalente mixto |
| 5 | **Centinela** | 4.001 | 4.001 | Usuario muy activo, varios meses |
| 6 | **Maestro Motero** | 10.001 | 10.001 | Top contributor de su ciudad |
| 7 | **Leyenda del Asfalto** | 25.001 | 25.001 | Élite global |

### 3.1 Beneficios por nivel

| Nivel | Beneficios desbloqueados |
|---|---|
| Pipiolo | Acceso básico: ver, proponer, comentar |
| Rodador | Puede verificar parkings de otros |
| Buscaplazas | Sus propuestas se auto-publican (bypass moderación manual)¹ |
| Cartógrafo | Puede reportar parkings erróneos con peso doble |
| Centinela | Su voto en moderación comunitaria pesa x2 |
| Maestro Motero | Puede crear/editar metadatos de POI (horarios, capacidad) |
| Leyenda del Asfalto | Badge especial visible. Acceso a beta de nuevas features |

¹ Sujeto a la decisión de modelo de moderación (ver §6).

### 3.2 Notificaciones de nivel

- Push notification al subir de nivel, con animación celebratoria al volver a abrir la app.
- Mostrar progreso al siguiente nivel en perfil (barra + "X Octanos para Rodador").
- **No mostrar** distancia al nivel +2 (evita desmotivación).

---

## 4. Insignias

Las insignias son **ortogonales** a los niveles: un Rodador puede tener insignias raras, y un Maestro Motero puede no tenerlas. Esto evita la sensación de progresión lineal aburrida.

Total estimado de insignias en lanzamiento: **~20**, agrupadas en 4 familias.

### 4.1 Familia: Descubrimiento (proponer)

| Insignia | Condición |
|---|---|
| **Primer Hallazgo** | Tu primer parking aprobado |
| **Cartógrafo Local** | 10 parkings aprobados en la misma ciudad |
| **Trotamundos** | Parkings aprobados en 5+ ciudades distintas |
| **Pionero** | Proponer el primer parking en una ciudad sin registros previos |

### 4.2 Familia: Verificación (custodiar)

| Insignia | Condición |
|---|---|
| **Ojo de Águila** | 25 verificaciones realizadas |
| **Madrugador** | Primero en verificar 10 parkings distintos |
| **Detector de Fakes** | 5 reportes de error confirmados |

### 4.3 Familia: Comunidad (ayudar)

| Insignia | Condición |
|---|---|
| **Comentarista** | 50 comentarios con upvotes |
| **Embajador** | 5 amigos invitados que se registran y aportan |
| **Mentor** | Primer comentario útil en parkings de usuarios Pipiolo |

### 4.4 Familia: Especialistas / temáticas

| Insignia | Condición |
|---|---|
| **Domingo de Ruta** | Actividad en 4 fines de semana consecutivos |
| **Mecánico de Confianza** | 5 talleres propuestos y verificados |
| **Centro Histórico** | 10 parkings aprobados en cascos antiguos |
| **\<Ciudad\>** | Insignias por ciudad con X parkings (Madrid, Barcelona, Sevilla, Valencia, Málaga…) |

Las insignias temáticas son la palanca para lanzar **contenido recurrente postlanzamiento**: eventos, retos estacionales, colaboraciones, sin tocar código del core.

---

## 5. Rankings

### 5.1 Tipos de ranking

| Ranking | Alcance | Visibilidad |
|---|---|---|
| **Global** | Todos los usuarios | Pública |
| **Por ciudad** | Usuarios con actividad en esa ciudad | Pública |
| **Entre amigos** | Solo contactos del usuario | Privada |

### 5.2 Métricas del ranking

Cada ranking se ofrece en **dos vistas**:

- **Octanos totales** (acumulado histórico): premia trayectoria.
- **Octanos del mes** (ventana móvil 30 días): premia actividad reciente y mantiene rankings dinámicos.

Esto resuelve el problema clásico de los rankings acumulativos: que los top usuarios queden congelados arriba y los nuevos pierdan motivación.

### 5.3 Reglas de privacidad

- El usuario puede **ocultar su perfil del ranking público** desde ajustes (sigue acumulando Octanos, no aparece listado).
- En ranking de amigos: opt-in mutuo (ambos deben aceptar la conexión).
- Nunca mostrar geolocalización exacta del usuario, solo ciudad de actividad.

---

## 6. Moderación de aportes

> Pendiente de decisión final del producto. Las opciones afectan al flujo de acreditación de Octanos.

| Modelo | Pros | Contras |
|---|---|---|
| Auto-publicar + verificación posterior | Crecimiento rápido del dataset | Riesgo de spam/datos falsos |
| Cola manual (admin aprueba) | Calidad alta | No escala, dependes del admin |
| **Híbrido por nivel (≥3 auto, resto cola)** | Escala y protege calidad | Requiere implementar lógica condicional |
| N verificaciones antes de mostrar | Validación distribuida | Latencia alta hasta visibilidad |

**Recomendación**: modelo híbrido por nivel. Hasta que el usuario alcance nivel 3 (Buscaplazas), sus propuestas pasan por cola; a partir de ahí, se auto-publican y se moderan a posteriori si reciben reportes.

---

## 7. Modelo de datos propuesto

Tablas mínimas para soportar todo lo anterior. Pensado para PostgreSQL (compatible con Supabase / Laravel).

### 7.1 `octano_events`

Cada acción puntuable es un evento inmutable. La suma de eventos = Octanos del usuario. Esto da auditabilidad completa.

```sql
octano_events
├── id              (uuid, pk)
├── user_id         (uuid, fk → users)
├── action_type     (enum: propose_parking, verify_parking, first_verifier,
│                          parking_verified_bonus, report_error, upload_photo,
│                          useful_comment, propose_poi, weekly_streak, invite_friend)
├── points          (int)
├── reference_id    (uuid, nullable — id del parking/comentario/etc.)
├── reference_type  (enum: parking, comment, poi, user, none)
├── status          (enum: pending, confirmed, reverted)
├── created_at      (timestamp)
└── confirmed_at    (timestamp, nullable)
```

Los Octanos del usuario se calculan como:
```sql
SELECT SUM(points) FROM octano_events
WHERE user_id = ? AND status = 'confirmed';
```

### 7.2 `user_levels`

Catálogo estático de niveles. Se carga al deploy.

```sql
user_levels
├── level           (int, pk)            -- 1 a 7
├── name            (varchar)            -- "Pipiolo", "Rodador", ...
├── min_octanos     (int)                -- umbral inferior
├── benefits        (jsonb)              -- lista de capacidades desbloqueadas
└── icon_url        (varchar)
```

### 7.3 `users` (campos relacionados)

```sql
users
├── ...
├── current_level       (int, fk → user_levels.level, default 1)
├── total_octanos       (int, default 0)        -- caché derivado
├── octanos_this_month  (int, default 0)        -- caché para ranking
├── city_primary        (varchar, nullable)     -- ciudad principal de actividad
└── ranking_visible     (bool, default true)
```

> **Nota**: `total_octanos` y `octanos_this_month` son cachés derivados. La fuente de verdad es `octano_events`. Recalcular vía trigger o job programado.

### 7.4 `badges`

```sql
badges
├── id              (uuid, pk)
├── code            (varchar, unique)    -- "first_finding", "eagle_eye", ...
├── family          (enum: discovery, verification, community, thematic)
├── name            (varchar)
├── description     (text)
├── icon_url        (varchar)
├── condition       (jsonb)              -- regla evaluable
└── is_active       (bool)               -- permite desactivar temporadas
```

### 7.5 `user_badges`

```sql
user_badges
├── user_id         (uuid, fk → users)
├── badge_id        (uuid, fk → badges)
├── earned_at       (timestamp)
└── PRIMARY KEY (user_id, badge_id)
```

---

## 8. Eventos a trackear

Lista de eventos del dominio que deben emitir un `octano_event`:

```
EVENT: parking.proposed              → action_type = propose_parking (status: pending)
EVENT: parking.verified_by_community → action_type = parking_verified_bonus (al proponente)
                                      → si es 1er verificador: first_verifier (al verificador)
                                      → action_type = verify_parking (al verificador)
EVENT: parking.error_confirmed       → action_type = report_error (al reportante)
EVENT: photo.uploaded                → action_type = upload_photo (con cap de 3 por parking)
EVENT: comment.received_2_upvotes    → action_type = useful_comment
EVENT: poi.proposed                  → action_type = propose_poi
EVENT: user.weekly_streak_completed  → action_type = weekly_streak
EVENT: invite.completed              → action_type = invite_friend
```

Cada evento debe pasar por un **servicio de validación anti-abuso** antes de confirmarse (ver §2.2).

---

## 9. Non-goals (fuera de alcance)

Para evitar scope creep y confundir a agentes de IA durante la implementación:

- ❌ **Octanos canjeables por dinero/regalos físicos**: no es una app de fidelización comercial.
- ❌ **Compras in-app de Octanos**: rompería la integridad del sistema.
- ❌ **Niveles que degradan por inactividad**: regla §1 cerrada.
- ❌ **Insignias secretas/ocultas**: todas las insignias son visibles y descubribles.
- ❌ **Sistema de monedas múltiples**: solo Octanos. Nada de "gemas premium" o similar.
- ❌ **Apuestas o competiciones con dinero real**: descartado.
- ❌ **PvP / penalizaciones entre usuarios**: la app es colaborativa, no competitiva en sentido agresivo.

---

## 10. Métricas de éxito

KPIs para validar que el sistema de gamificación funciona:

| Métrica | Objetivo a 3 meses |
|---|---|
| % de usuarios que alcanzan nivel 2 (Rodador) | > 60% |
| % de usuarios que alcanzan nivel 3 (Buscaplazas) | > 25% |
| Octanos medios ganados por usuario activo / semana | > 50 |
| % de propuestas que reciben al menos 1 verificación en 48h | > 70% |
| % de usuarios con al menos 1 insignia | > 80% |
| Retención D30 de usuarios que han subido al menos 1 nivel | +15% vs. baseline |

---

## 11. Decisiones cerradas

- ✅ Moneda: **Octanos**
- ✅ Set de nombres de nivel: **principal recomendado** (Pipiolo → Leyenda del Asfalto)
- ✅ Niveles solo suben, sin degradación
- ✅ Rankings: **global + filtros por ciudad y amigos**, con dos métricas (totales y mensuales)

## 12. Decisiones pendientes

- ⏳ Modelo final de moderación (§6) — recomendación: híbrido por nivel
- ⏳ Cap diario exacto (200 propuesto, ajustar tras lanzamiento con datos reales)
- ⏳ Insignias temáticas iniciales: ¿qué ciudades incluir en lanzamiento?
- ⏳ ¿Notificación push al subir de nivel también para amigos del usuario? (opcional, postlanzamiento)
