# INKSPIRE — Credenciales de ejemplo (seed)

> Todos los usuarios del seed usan la misma contraseña: **`Test1234!`**
> Login en la app: **http://localhost:4200** · Endpoint directo: `POST /api/auth/login` con body `{ "email": "...", "password": "..." }`
> Fuente de verdad: [`backend/Seed/DatabaseSeeder.cs`](backend/Seed/DatabaseSeeder.cs) — se cargan con `dotnet run --seed`.

---

## Clientes

Rol recomendado para recorrer el producto completo (buscar → comparar → cotizar → reservar → pagar → calificar).

| Nombre | Email | Rol |
|---|---|---|
| Camila Rojas | `camila.rojas@example.cl` | Client |
| Diego Fuentes | `diego.fuentes@example.cl` | Client |
| Valentina Soto | `valentina.soto@example.cl` | Client |
| Sofía Alarcón | `sofia.alarcon@example.cl` | Client |
| Tomás Muñoz | `tomas.munoz@example.cl` | Client |
| Javiera Rojas | `javiera.rojas@example.cl` | Client |
| Camilo Reyes | `camilo.reyes@example.cl` | Client |

**Qué datos trae cada cliente**: reservas completadas **con** reseña (visibles en *Mis reservas*) y **una reserva completada sin reseña**, para probar el flujo de calificación (US0013) sin tener que reservar y pagar primero.

> ℹ️ **Pagos reales contra el sandbox de Flow**: Flow valida el email del pagador y rechaza los dominios `@example.cl` (error 1620), así que esa prueba concreta necesita una cuenta con un correo real. Cambia el email de cualquier cliente del seed por uno propio (en `DatabaseSeeder.cs` antes de sembrar, o con un `UPDATE` sobre la tabla `users`). Ver [docs/flow-sandbox-testing.md](docs/flow-sandbox-testing.md).

---

## Artistas

14 artistas publicados en Santiago. Perfil público en `/artista/{slug}`.

| Nombre | Email | Slug | Estilos | Comuna |
|---|---|---|---|---|
| Matías Herrera | `matias.ink@example.cl` | `matias-herrera` | Realismo, Blackwork | Providencia |
| Fernanda Muñoz | `fernanda.tattoo@example.cl` | `fernanda-munoz` | Fine Line, Minimalista | Ñuñoa |
| Cristóbal Vidal | `cristobal.art@example.cl` | `cristobal-vidal` | Japonés, Neotradicional | Santiago Centro |
| Antonia Reyes | `antonia.lines@example.cl` | `antonia-reyes` | Acuarela, Geométrico | Las Condes |
| Javier Castro | `javier.dotwork@example.cl` | `javier-castro` | Dotwork, Tribal, Lettering | Vitacura |
| Valentina Cortés | `valentina.ink@example.cl` | `valentina-cortes` | Realismo, Fine Line, Minimalista | Providencia |
| Camila Vega | `camila.irezumi@example.cl` | `camila-vega` | Japonés, Neotradicional, Acuarela | Barrio Italia |
| Rodrigo Soto | `rodrigo.letters@example.cl` | `rodrigo-soto` | Lettering, Minimalista, Fine Line | Bellavista |
| Diego Fuenzalida | `diego.tribal@example.cl` | `diego-fuenzalida` | Tribal, Dotwork, Blackwork | Las Condes |
| Isadora Paz | `isadora.acuarela@example.cl` | `isadora-paz` | Acuarela, Neotradicional, Fine Line | Vitacura |
| Benjamín Araya | `benjamin.oldschool@example.cl` | `benjamin-araya` | Tradicional, Neotradicional | Barrio Italia |
| Trinidad Lagos | `trinidad.blackwork@example.cl` | `trinidad-lagos` | Blackwork, Geométrico, Dotwork | Bellavista |
| Ignacio Riquelme | `ignacio.realismo@example.cl` | `ignacio-riquelme` | Realismo, Japonés | La Reina |
| Josefa Contreras | `josefa.oldlines@example.cl` | `josefa-contreras` | Tradicional, Lettering | Macul |

---

## Admin

| Nombre | Email | Rol |
|---|---|---|
| Admin InkLink | `admin@inklink.cl` | Admin |

---

## Datos útiles para probar filtros y badges

- **Sin certificación sanitaria** (para contrastar el filtro "Solo certificados"): Antonia Reyes y Rodrigo Soto. Los otros 12 sí la tienen.
- **Con premios** (filtro "Solo premiados"): Matías Herrera, Cristóbal Vidal, Valentina Cortés (2), Camila Vega (2), Diego Fuenzalida, Isadora Paz, Benjamín Araya, Ignacio Riquelme.
- **Con auspicio de marca**: Matías Herrera (Eternal Ink, Cheyenne), Fernanda Muñoz (Dynamic Color), Camila Vega (Eternal Ink), Diego Fuenzalida (Cheyenne), Benjamín Araya (Dynamic Color), Trinidad Lagos (Eternal Ink).
- **Rango de precios** (para el slider de filtros): desde $30.000 (Rodrigo Soto) hasta $100.000 (Cristóbal Vidal) de sesión mínima.
- **Comunas representadas**: Providencia, Ñuñoa, Santiago Centro, Las Condes, Vitacura, Barrio Italia, Bellavista, La Reina y Macul — útil para el filtro de comuna y el mapa (US0012).

---

## Notas

- Las credenciales del seed **solo existen en entorno local** (`docker-compose up -d` + `dotnet run --seed`). No corresponden a ningún entorno real.
- Tras un reseed de la base de datos, los JWT emitidos antes quedan con user IDs obsoletos → hay que **volver a iniciar sesión**.
