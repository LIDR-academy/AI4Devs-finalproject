# Data Model — US1: Acceso mediante cuenta de Google
**Branch**: `004-google-oauth-login`
**Phase**: 1 — Design
**Bounded Context**: `identity`
**Date**: 2026-02-25

> Todo lo que aparece aquí está derivado directamente de los escenarios BDD de `spec.md`.
> No se incluye ningún campo, entidad o relación que no esté respaldado por el comportamiento observable descrito en el BDD.

---

## Entidades del dominio

### PerfilDeUsuario

Representa la identidad única de un usuario dentro de la aplicación.

| Atributo | Descripción | Obligatorio | Origen |
|---|---|---|---|
| `id` | Identificador único del usuario en la aplicación (UUID generado por el sistema) | ✅ | Sistema |
| `identificadorGoogle` | Identificador único proporcionado por Google para esta cuenta (no cambia nunca) | ✅ | Google |
| `correo` | Dirección de correo electrónico de la cuenta de Gmail | ✅ | Google |
| `nombre` | Nombre visible del usuario obtenido de su cuenta de Google | ✅ | Google |
| `urlFoto` | URL de la foto de perfil de la cuenta de Google | No | Google |
| `creadoEn` | Fecha y hora en que se creó el perfil en la aplicación | ✅ | Sistema |

**Reglas del dominio derivadas del BDD:**

- El `id` es generado por el sistema (UUID), no por Google — garantiza que el identificador interno de usuario es independiente del proveedor de identidad.
- El `identificadorGoogle` es la clave de unicidad para reconocer a un usuario recurrente: si dos solicitudes de login llevan el mismo `identificadorGoogle`, pertenecen al mismo usuario.
- Un `PerfilDeUsuario` se crea exactamente una vez (primer acceso). En accesos posteriores, el perfil existente se recupera sin modificación.
- El `correo` y el `nombre` se leen de Google en el momento del primer acceso y no se modifican posteriormente (fuera de alcance en esta US).

---

## Transiciones de estado

El `PerfilDeUsuario` no tiene estados propios. Su existencia (presente o ausente) es el único estado relevante para el BDD:

```
[Ausente] ──── primer acceso con Gmail ────► [Presente]
[Presente] ──── accesos posteriores ────► [Presente]  (sin cambio)
```

---

## Relación con bounded contexts existentes

El `id` (UUID) del `PerfilDeUsuario` es el mismo identificador de usuario que los bounded contexts `meditationbuilder`, `meditation.generation` y `playback` usan actualmente mediante el header `X-User-Id`. Con esta US, ese UUID se extrae de la sesión autenticada en lugar de venir hardcodeado.

No se crean claves foráneas entre el BC `identity` y los otros BCs — el UUID se propaga por contrato, no por referencia de base de datos.

---

## Capacidades abstractas derivadas del BDD

Las siguientes capacidades son las que el sistema debe ofrecer, derivadas de los `When` de los escenarios. No describen endpoints ni HTTP.

| # | Capacidad | BDD When que la origina |
|---|---|---|
| C1 | Iniciar sesión con una cuenta de Google y obtener acceso a la aplicación | "hace clic en Iniciar sesión con Google" + "selecciona su cuenta de Gmail y autoriza el acceso" |
| C2 | Reconocer a un usuario ya registrado y restaurar su sesión | "vuelve a hacer clic en Iniciar sesión con Google" + "selecciona la misma cuenta de Gmail" |
| C3 | Proteger el acceso a secciones restringidas para usuarios no identificados | "intenta acceder a la biblioteca o a la creación de una meditación" |
| C4 | Cerrar la sesión activa del usuario | "hace clic en Cerrar sesión" |
| C5 | Cancelar el flujo de autorización de Google sin bloquear la navegación | "cancela la pantalla de autorización de Google" |
