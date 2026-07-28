# Proposal: KAN-80 User theme palettes

## What

Let users pick one of nine preset color palettes in Profile / Settings. The choice persists per user and applies app-wide via semantic CSS variables.

## Why

PRD *Perfil / Ajustes* includes visual themes. KAN-18 centralized tokens; this change exposes user-selectable palettes without custom hex editing.

## Scope

- `user_profiles.preferences.theme_palette_id`
- `GET/PATCH /v1/me/preferences`
- Settings swatch picker + `ThemeProvider`
- CSS audit: remove hardcoded hex outside `theme/tokens.css`

## Out of scope

Custom palette editor, dark mode, admin CRUD for palettes.
