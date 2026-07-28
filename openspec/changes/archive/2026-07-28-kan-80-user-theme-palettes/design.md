# Design: KAN-80 User theme palettes

## Backend

- New `user_profiles` table (1:1 `users`), `preferences` JSONB.
- `PreferencesModule` with lazy profile upsert on read/write.
- `theme_palette_id` validated against a server-side allowlist mirroring frontend registry.

## Frontend

- `theme/palettes.ts` — nine presets with five preview slots + semantic CSS var map.
- `applyTheme(paletteId)` sets `document.documentElement` custom properties.
- `ThemeProvider` inside `AuthProvider`: cache in `localStorage` keyed by `user_id`, sync with API after login.
- `ThemeSettingsSection` on `ProfilePage` — radio swatch grid, optimistic PATCH.

## CSS migration

Replace component-level hex with `var(--color-*)`. Promote status soft tokens to `tokens.css`.
