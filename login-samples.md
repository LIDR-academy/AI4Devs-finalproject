# INK·LINK — Credenciales de ejemplo (seed)

> Todos los usuarios del seed usan la misma contraseña: **`Test1234!`**
> Endpoint de login: `POST /api/auth/login` · body `{ "email": "...", "password": "..." }`

---

## Clientes

| Nombre | Email | Rol |
|---|---|---|
| Camila Rojas | `camila.rojas@example.cl` | Client |
| Diego Fuentes | `diego.fuentes@example.cl` | Client |
| Valentina Soto | `valentina.soto@example.cl` | Client |

---

## Artistas

| Nombre | Email | Slug | Estilos | Comuna |
|---|---|---|---|---|
| Matías Herrera | `matias.ink@example.cl` | `matias-herrera` | Realismo, Blackwork | Providencia |
| Fernanda Muñoz | `fernanda.tattoo@example.cl` | `fernanda-munoz` | Fine Line, Minimalista | Ñuñoa |
| Cristóbal Vidal | `cristobal.art@example.cl` | `cristobal-vidal` | Japonés, Neotradicional | Santiago |
| Antonia Reyes | `antonia.lines@example.cl` | `antonia-reyes` | Acuarela, Geométrico | Las Condes |
| Javier Castro | `javier.dotwork@example.cl` | `javier-castro` | Dotwork, Tribal, Lettering | Vitacura |

---

## Admin

| Nombre | Email | Rol |
|---|---|---|
| Admin InkLink | `admin@inklink.cl` | Admin |

---

## Notas

- Las credenciales del seed **solo existen en entorno local** (`docker-compose up`).
- Para acceder al perfil público de un artista: `/artista/{slug}` (ej. `/artista/matias-herrera`).
- Artistas con **certificación sanitaria**: Matías Herrera, Fernanda Muñoz, Cristóbal Vidal.
- Artistas con **auspicio**: Matías Herrera (Eternal Ink), Fernanda Muñoz (Eternal Ink).
