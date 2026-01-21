# MS-AUTH - Scripts y Notas de BD

## Script extraído
- `text.sql` (copiado desde 3. desarrollo/backend/ms-auth/text.sql)
  - Inserta un registro de persona (`rrfperso`) y un usuario (`rrfusuar`).
  - Incluye comentario con CREATE TABLE de ejemplo para `rrfusuar` (referencia a `rrfperso`).

## Uso típico
- Seed mínimo para pruebas locales de login.
- Asegura que las tablas `rrfperso` y `rrfusuar` existan antes de ejecutar el insert.

## Referencias
- Modelo de datos: ../ms-auth/.prompts/06-modelo-datos.md