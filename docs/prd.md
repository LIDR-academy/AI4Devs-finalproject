# PRD — MotoCiudad

> Documento de Requisitos del Producto (Product Requirements Document).
> Fuente principal de verdad sobre **qué** se construye y **por qué**.
> Para detalles técnicos, ver `arquitectura.md`, `modelo-datos.md`, `infraestructura.md`.

**Versión**: 0.1 (PRD inicial)
**Estado**: Borrador — pendiente de validación con stakeholder
**Última actualización**: Mayo 2026

---

## 1. Resumen ejecutivo

**MotoCiudad** es una app móvil colaborativa para motoristas urbanos que les permite **encontrar, proponer y verificar parkings de moto** (públicos y privados) en su ciudad o cuando viajan. Resuelve un problema real: Google Maps no documenta la mayoría de zonas de aparcamiento de moto, y el conocimiento sobre dónde aparcar vive disperso en grupos de WhatsApp, foros y la cabeza de los moteros locales.

El sistema se sostiene en una **comunidad gamificada** (Octanos, niveles, insignias, rankings) que premia las contribuciones de calidad y mantiene el dataset vivo y actualizado. Como elemento secundario, los usuarios también pueden añadir POIs de interés motero (talleres, ITV, tiendas especializadas).

**Diferencial clave**: el dato lo aporta y verifica la propia comunidad, con mecanismos anti-abuso (geofencing, fotos con timestamp, moderación por nivel), no es ni un scraping de Google ni una base de datos comercial.

---

## 2. Problema y oportunidad

### 2.1 Problema

Aparcar la moto en ciudad es un dolor diario para millones de motoristas:

- Google Maps muestra parkings de coche, no zonas habilitadas para moto.
- Las plazas oficiales de moto en muchas ciudades están mal señalizadas o no aparecen en ningún mapa público.
- Los parkings privados con tarifa mensual para moto no se anuncian online.
- Cuando viajas a otra ciudad, no sabes dónde dejar la moto sin riesgo de multa o robo.
- El conocimiento existe en la comunidad pero está fragmentado y sin estructura.

### 2.2 Oportunidad

No hay competencia directa consolidada en España. Las apps de parking generalistas (ElParking, Parkimeter, EasyPark) están enfocadas en coche y servicios concertados, no en el mapeo abierto de plazas urbanas para moto. Existe espacio para una **app vertical, comunitaria y gratuita** que se convierta en el "Waze de los parkings de moto".

### 2.3 Por qué ahora

- Las ventas de motos urbanas (125cc, scooters eléctricos) crecen en grandes ciudades.
- Las restricciones a coches en centros urbanos (ZBE) empujan a más usuarios a la moto.
- La cultura de apps colaborativas está madura (Wikiloc, Waze, eBird como referentes).
- Stack técnico (Supabase, Expo, mapas embebidos) permite construir el MVP rápido y barato.

---

## 3. Visión y objetivos

### 3.1 Visión a largo plazo

> Convertirnos en la base de datos de referencia de parkings de moto en España, mantenida por la comunidad motera y útil tanto para el motorista del día a día como para el que viaja entre ciudades.

### 3.2 Objetivos del MVP (primeros 6 meses)

1. **Validar el modelo colaborativo**: ¿la gente aporta y verifica plazas sin recompensa monetaria?
2. **Cobertura inicial en Madrid + Barcelona**: alcanzar 1.000 parkings verificados en cada ciudad.
3. **Núcleo de usuarios activos**: 500 usuarios mensuales recurrentes.
4. **Base de datos limpia**: < 5% de plazas reportadas como erróneas.

### 3.3 Objetivos a 12 meses

- Cobertura en 5 ciudades españolas.
- 5.000 parkings verificados.
- 5.000 usuarios mensuales activos.
- Decisión informada sobre modelo de negocio (publicidad de talleres, premium, API B2B).

---

## 4. Stakeholders

| Stakeholder | Interés | Prioridad |
|---|---|---|
| Motoristas urbanos (usuario final) | Encontrar parking rápido y fiable | Alta |
| Motoristas viajeros | Saber dónde aparcar fuera de su ciudad | Alta |
| Talleres / negocios moteros | Visibilidad ante público objetivo | Media (post-MVP) |
| Promotor (tú) | Validar negocio, aprender stack móvil | Alta |
| Equipo de moderación (futuro) | Mantener calidad del dataset | Media |

---

## 5. Personas de usuario

### 5.1 Javi — el commuter urbano

- 32 años, vive en Madrid, va al trabajo en Z900.
- Conoce los parkings de su barrio, pero cuando se mueve por reuniones o quedadas pierde tiempo dando vueltas.
- Le motiva ser "Top Madrid" en la app, le gusta el componente de juego.
- **Frustración principal**: no fiarse de plazas no verificadas, llegar y que estén cortadas.

### 5.2 Marta — la viajera

- 28 años, vive en Barcelona, viaja con frecuencia a otras ciudades por trabajo.
- Necesita saber dónde aparcar antes de llegar, prefiere plazas privadas con cámaras.
- **Frustración principal**: en ciudades nuevas no sabe a quién preguntar.

### 5.3 Luis — el contribuidor mapeador

- 45 años, motero veterano, conoce su ciudad como la palma de su mano.
- Le motiva el reconocimiento de la comunidad, le encantan las insignias.
- Será top contributor de Sevilla en 6 meses.
- **Frustración principal**: que su trabajo de mapear no se reconozca y la app la "tomen" usuarios que solo consumen.

---

## 6. Naming y branding

- **Nombre tentativo**: MotoCiudad. *(Por confirmar — los mocks muestran "MOTOCIUDAD". Verificar disponibilidad de dominio y App Store antes de cierre.)*
- **Tagline**: *"Aparcar la moto. Sin volverse loco."*
- **Tono de marca**: directo, motero, sin paja corporativa. Castellano coloquial pero correcto.
- **Estética**:
  - Modo oscuro siempre (mejor lectura en mapa, ahorro de batería).
  - Acento amarillo neón (#D4FF00 aprox) para acciones primarias, marca y verificados.
  - Acento naranja para POIs secundarios (talleres).
  - Tipografía sans-serif moderna; fuente monoespaciada para datos técnicos (coordenadas, distancias, IDs).
  - Iconografía minimal estilo "tactical" / cuadrícula de cinta de obra.

---

## 7. Alcance del MVP

### 7.1 Features incluidas (MUST HAVE)

| ID | Feature | Justificación |
|---|---|---|
| F1 | Registro y login (email + Apple + Google) | Necesario para identificar contribuciones |
| F2 | Mapa interactivo con pins de parkings | Pantalla principal de la app |
| F3 | Lista filtrable de parkings cercanos | Alternativa al mapa, mejor para escanear opciones |
| F4 | Detalle de parking (fotos, características, comentarios) | Información que el usuario necesita antes de ir |
| F5 | Proponer un parking nuevo (formulario + foto) | Core del modelo colaborativo |
| F6 | Verificar un parking existente (foto in situ + geofence) | Garantiza que el dato sigue siendo cierto |
| F7 | Navegación a Apple Maps / Google Maps | Llevar al usuario al destino sin reinventar la rueda |
| F8 | Sistema de Octanos (gamificación) | Ver `gamificacion.md` — completo |
| F9 | Niveles de usuario (1–7) | Ver `gamificacion.md` |
| F10 | Insignias | Ver `gamificacion.md` |
| F11 | Ranking (Madrid / Global / Amigos) | Ver `gamificacion.md` |
| F12 | Perfil de usuario | Vitrina de progreso, motivación |
| F13 | Reportar parking erróneo | Mantener dataset limpio |
| F14 | POIs secundarios (talleres) | Diferencial competitivo y palanca de monetización futura |

### 7.2 Features fuera del MVP (NON-GOALS)

Lista explícita para que ningún agente de IA las infiera como necesarias:

- ❌ Sistema de reservas de plazas privadas (no somos Parkimeter).
- ❌ Pago in-app a parkings privados.
- ❌ Mensajería privada entre usuarios.
- ❌ Foros / hilos de discusión.
- ❌ Integración con sistemas de pago de zona azul / SARE.
- ❌ Edición de parkings ya verificados por usuarios de bajo nivel.
- ❌ Modo claro (light theme).
- ❌ Versión web / dashboard de admin público.
- ❌ Soporte multi-idioma en MVP (solo castellano; inglés post-launch).
- ❌ Notificaciones push de marketing (solo transaccionales: nivel, insignia, verificación).
- ❌ Importación masiva desde CSV o APIs externas.
- ❌ Gamificación con dinero / canjeables / NFTs.

### 7.3 Roadmap post-MVP (orientativo, no comprometido)

- **v1.1**: Multi-idioma (EN), insignias temáticas estacionales.
- **v1.2**: Sistema de amigos completo (invitaciones, ranking entre amigos).
- **v1.3**: Panel de admin web (para moderar la cola).
- **v2.0**: Monetización — destacados de talleres, plan premium con notificaciones avanzadas.

---

## 8. User stories principales

Formato: *Como [rol], quiero [acción] para [beneficio]*. Cada una se desglosará en tickets durante implementación.

### 8.1 Descubrimiento

- Como motorista, quiero ver en un mapa los parkings cercanos a mi ubicación para decidir a cuál ir.
- Como motorista, quiero filtrar la lista por tipo (público / privado / taller) para ver solo lo que me interesa.
- Como motorista, quiero ordenar por distancia para llegar lo antes posible.
- Como motorista, quiero ver fotos reales del parking para saber si es lo que busco antes de ir.

### 8.2 Contribución

- Como motorista, quiero proponer un parking nuevo desde mi ubicación actual para aportar a la comunidad.
- Como motorista, quiero verificar un parking propuesto por otro usuario haciendo una foto in situ para confirmar que existe.
- Como motorista, quiero reportar un parking que ya no existe o ha cambiado para que el dataset esté actualizado.
- Como motorista, quiero subir fotos a parkings existentes para enriquecer la información.

### 8.3 Gamificación

- Como motorista, quiero ver mis Octanos acumulados para saber cuánto he aportado.
- Como motorista, quiero saber cuántos Octanos me faltan para subir de nivel para tener un objetivo a corto plazo.
- Como motorista, quiero ver el ranking de mi ciudad para saber dónde estoy respecto a otros.
- Como motorista, quiero ver mis insignias desbloqueadas y las pendientes para tener objetivos a medio plazo.

### 8.4 Navegación

- Como motorista, quiero abrir el parking elegido en mi app de mapas habitual para que me guíe hasta allí.

### 8.5 Configuración

- Como motorista, quiero poder ocultar mi perfil del ranking público para mantener mi privacidad.
- Como motorista, quiero poder eliminar mi cuenta y mis datos para cumplir con mi derecho RGPD.

---

## 9. Sitemap y flujos principales

### 9.1 Estructura de navegación (5 tabs)

```
[ MAPA ]    [ LISTA ]    [ + APORTAR ]    [ RANKING ]    [ PERFIL ]
```

Tab central destacado (botón flotante amarillo) para la acción de aportar — es la conversión clave del producto.

### 9.2 Flujos críticos

**Flujo A — Onboarding (primera apertura)**

```
Splash → Pantalla de bienvenida con tagline → [EMPEZAR] → Permiso de ubicación
  → Registro (email / Apple / Google) → Tutorial breve (3 slides)
  → Mapa centrado en su ubicación
```

**Flujo B — Buscar y navegar**

```
Mapa o Lista → Tap en parking → Detalle → [LLÉVAME EN APPLE MAPS]
  → Se abre app nativa de mapas con la ruta
```

**Flujo C — Proponer parking**

```
Tab Aportar → Tipo de aporte (Parking / Taller) → Confirmar ubicación en mapa
  → Datos básicos (nombre, tipo, características) → Foto recomendada (+3 ★)
  → Enviar → Confirmación con +50 Octanos pendientes (acreditados al verificar)
```

**Flujo D — Verificar parking**

```
Detalle de parking sin verificar → [¿Has aparcado aquí? Verifica] → Cámara
  → Foto in situ (geofence ≤100m, timestamp ≤5min) → Enviar
  → Confirmación con +25 Octanos (+15 si primer verificador)
```

**Flujo E — Subida de nivel**

```
Acción que confirma Octanos → Detección de cruce de umbral → Push notification
  → Al abrir app: animación celebratoria → Update perfil con nuevo nivel
```

---

## 10. Requisitos de UX/UI

### 10.1 Principios de diseño

- **Mobile first y solo móvil** en MVP (no responsive web).
- **Dark mode obligatorio** (no light mode en MVP, simplifica diseño).
- **Mapa siempre disponible** en máximo 2 taps desde cualquier pantalla.
- **Acción primaria visible** (botón aportar destacado en la barra inferior).
- **Datos verificables**: cada parking muestra "verificado x N veces", "última verificación hace X días".
- **Privacidad por defecto**: la ubicación exacta del usuario nunca es pública.

### 10.2 Componentes clave (en mocks)

Los diseños de referencia están en `/mnt/project/`:

- `iOS_entrada.png` y `Android_entrada.png`: pantalla de bienvenida.
- `iOS_Mapa.png` y `Android_Mapa.png`: vista mapa con bottom sheet.
- `iOS_Lista_filtrable.png` y `Android_Lista_filtrable.png`: vista lista con filtros.
- `iOS_Detalle.png`: detalle de parking.
- `iOS__Taller_POI_secundario_.png`: detalle de taller (POI secundario).
- `iOS_Perfil.png` y `Android_Perfil.png`: perfil con Octanos, niveles, insignias.
- `iOS_Ranking.png`: ranking con podio + lista.
- `iOS_Proponer_parking.png`: formulario de propuesta.
- `iOS_Verificar_parking.png`: cámara de verificación.

### 10.3 Accesibilidad

- Tamaño mínimo de tap: 44×44pt (iOS) / 48×48dp (Android).
- Contraste de texto: mínimo WCAG AA en superficies oscuras.
- Soporte para Dynamic Type / Font Scale del sistema.
- Etiquetas accesibles (VoiceOver / TalkBack) en todos los botones de iconos.

---

## 11. Requisitos no funcionales

### 11.1 Rendimiento

- Tiempo de arranque (cold start) < 3 segundos en gama media.
- Carga inicial del mapa < 2 segundos con 100 pins visibles.
- Búsqueda de parkings cercanos (radio 5km) < 500ms.

### 11.2 Disponibilidad

- Uptime backend > 99.5% mensual.
- Modo lectura offline básico: últimos parkings vistos accesibles sin conexión.

### 11.3 Privacidad y seguridad

- Cumplimiento RGPD: política de privacidad clara, derecho al borrado funcional.
- Geolocalización exacta del usuario nunca persistida en backend (solo se usa puntualmente para validar verificaciones).
- Fotos de verificación se guardan sin EXIF de geo (se valida en cliente, no se almacena).
- Cumplimiento con políticas de App Store / Play Store sobre tracking y permisos.

### 11.4 Plataformas soportadas

- iOS 16+ (cubre ~95% de iPhones activos en 2026).
- Android 10+ (API 29+, cubre ~90% de Android activos).

---

## 12. Métricas de éxito (KPIs)

| Métrica | Definición | Objetivo a 3 meses | Objetivo a 6 meses |
|---|---|---|---|
| Usuarios registrados | Total cuentas creadas | 1.000 | 3.000 |
| MAU (Monthly Active Users) | Usuarios que abren la app ≥1 vez/mes | 500 | 1.500 |
| Parkings verificados | Total parkings con ≥1 verificación | 500 | 2.000 |
| % parkings verificados | Verificados / propuestos | > 70% | > 80% |
| Verificaciones / mes | Volumen de actividad core | 300 | 1.000 |
| Retención D7 | % usuarios que vuelven al 7º día | > 30% | > 35% |
| Retención D30 | % usuarios que vuelven al 30º día | > 15% | > 20% |
| Tiempo medio a 1ª contribución | Desde registro a 1ª acción puntuable | < 48h | < 24h |
| Crash-free sessions | iOS y Android | > 99.5% | > 99.7% |

KPIs de gamificación: ver `gamificacion.md` §10.

---

## 13. Criterios de aceptación globales

El MVP se considera **listo para release** cuando:

1. Todos los flujos críticos (A–E del §9.2) están implementados y testeados E2E.
2. Sistema de Octanos / niveles / insignias funcionando según `gamificacion.md`.
3. Las 14 features MUST HAVE del §7.1 son funcionales.
4. Tests automatizados con cobertura mínima del 70% en lógica de dominio (octanos, geofencing, validaciones).
5. Crash-free rate > 99% en builds internas durante 2 semanas.
6. Política de privacidad y términos publicados.
7. Apps aceptadas en App Store y Play Store.
8. Backend desplegado en Supabase con monitoring activo.

---

## 14. Decisiones cerradas

- ✅ Stack: React Native (Expo) + Supabase + TypeScript (ver `arquitectura.md`).
- ✅ Modelo colaborativo + gamificación (ver `gamificacion.md`).
- ✅ MVP solo para España, solo en castellano.
- ✅ Dark mode único.
- ✅ Sin monetización en MVP.
- ✅ Parkings y talleres como entidades de primer nivel; otros POIs (gasolineras, ITV, etc.) descartados para MVP.

## 15. Decisiones pendientes

- ⏳ Confirmar nombre final de marca y disponibilidad de dominio / handles.
- ⏳ Modelo final de moderación (`gamificacion.md` §6, recomendación: híbrido por nivel).
- ⏳ ¿Mapbox o react-native-maps nativo? (ver `arquitectura.md` §3.4).
- ⏳ ¿Insignias temáticas iniciales — qué ciudades incluir en lanzamiento?
- ⏳ Política de retención de fotos antiguas (¿comprimir / borrar tras N meses?).

---

## 16. Glosario

- **Octanos**: moneda interna no monetaria que mide la contribución del usuario.
- **Nivel**: rango público del usuario (1=Pipiolo, 7=Leyenda del Asfalto).
- **Insignia**: logro desbloqueable, ortogonal al nivel.
- **POI (Point of Interest)**: punto en el mapa que no es un parking (taller, ITV).
- **Parking público**: zona habilitada en vía pública, gratuita.
- **Parking privado**: garaje o instalación con tarifa (mensual o por horas).
- **Verificación**: confirmación con foto in situ de que un parking propuesto existe.
- **Geofence**: validación de que la ubicación del usuario está dentro de un radio del punto.
- **Cap diario**: límite de Octanos ganables por día (anti-abuso).
- **PRD**: Product Requirements Document. Este documento.
- **SDD**: Spec Driven Development. Metodología de trabajo con agentes de IA basada en specs precisas.

---

## 17. Documentos relacionados

- `gamificacion.md` — Sistema de Octanos, niveles, insignias, rankings.
- `arquitectura.md` — Decisiones técnicas, stack, diagramas.
- `modelo-datos.md` — Schema de base de datos.
- `testing.md` — Estrategia y herramientas de testing.
- `infraestructura.md` — Hosting, deployment, costes.
- `CLAUDE.md` — Instrucciones para Claude Code.
- `AGENTS.md` — Subagentes especializados del proyecto.
