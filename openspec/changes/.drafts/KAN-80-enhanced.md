# KAN-80 — Theme palette settings (Enhanced User Story)

**Jira:** KAN-80 — Theme palette settings  
**Status:** Tareas por hacer  
**OpenSpec change (suggested):** `kan-80-user-theme-palettes`

## Original

Quiero que el tema visual de la aplicación pueda editarse. Para ello, en ajustes debe aparecer una opción nueva en la que se muestre la paleta de colores (por ahora no se podrá modificar a mano, solo elegir entre las existentes). Al seleccionar, se guardará esa selección a nivel de usuario y se mostrará *toda* la web con esos colores. Para ello hay que asegurar que los CSS estén centralizados y que en ninguna vista se apliquen colores por separado que no salgan del punto central.

**Paleta actual (opción por defecto — Veranda):**

| Nombre | Hex |
|--------|-----|
| Veranda blue | `#6BB1AD` |
| Sky cloud | `#A7BCBD` |
| Lychee | `#ECECDB` |
| Melon | `#E5A9A9` |
| Cupid pink | `#E6748E` |

Además, el usuario adjunta 8 paletas adicionales (imágenes) para ofrecer como presets.

## Enhanced

### Summary

Add a **Theme** section under **Profile / Settings** where the user picks one of **9 preset color palettes**. The choice is **persisted per authenticated user** (server-side) and applied **app-wide** by swapping semantic CSS custom properties at runtime. Custom hex editing is **out of scope** for this story.

Builds on KAN-18 (`design-tokens` spec): semantic tokens in `frontend/src/theme/tokens.css` remain the single source of truth; palettes only remap the five raw palette slots (plus derived semantic values).

---

### Functional requirements

#### Settings UI

- New card **“Tema visual”** on `ProfilePage` (`/profile`), alongside existing Audience / Format / Genre sections.
- Show a **radio group or selectable swatch grid** with:
  - Palette display name (localized label in Spanish for UI copy).
  - Five color chips previewing the raw palette slots.
  - Selected state clearly indicated (border + check).
- On selection:
  - Apply theme **immediately** in the UI (optimistic).
  - Persist via API; on failure, revert selection and show error.
- No manual color picker, no per-token editing.

#### App-wide theming

- **Every** screen (including login, modals, stats charts, import flows) MUST use semantic tokens (`var(--color-*)`) or shared UI components that already do.
- Runtime theme switch updates `:root` / `document.documentElement` CSS variables without full page reload.
- Default palette for new users and missing preference: **`veranda`** (current PRD palette).

#### Persistence

- Store `preferences.theme_palette_id` (string enum slug) per user.
- Load preference after login / on app bootstrap; apply before first paint when possible (see technical notes on flash).

---

### Preset palettes (9 total)

Each palette defines **five slots** mapped to the existing semantic model:

| Slot | Semantic role |
|------|----------------|
| `primary` | Primary actions, nav accents, focus ring |
| `secondary` | Secondary controls, strong borders |
| `surfaceCard` | Cards, modals, soft panels |
| `highlight` | Soft highlights, secondary accents |
| `accentKpi` | KPIs, star ratings, strong accent |

Derived tokens (`--color-text`, `--color-text-heading`, `--color-border`, `--color-primary-hover`, `--color-surface-muted`, status colors) are computed **per palette** in the theme registry (not user-editable). Algorithm: keep shared dark text neutrals for light surfaces unless contrast audit fails for a palette; then use palette-specific derived values documented in the registry.

#### 1. `veranda` (default — current)

| Slot | Hex |
|------|-----|
| primary | `#6BB1AD` |
| secondary | `#A7BCBD` |
| surfaceCard | `#ECECDB` |
| highlight | `#E5A9A9` |
| accentKpi | `#E6748E` |

#### 2. `primavera`

| Slot | Hex |
|------|-----|
| primary | `#E2889F` (Dusty Rose) |
| secondary | `#DEECF5` (Powder Blue Mist) |
| surfaceCard | `#FFDFB6` (Peach Cream) |
| highlight | `#FFCFE4` (Soft Rose) |
| accentKpi | `#F8AA80` (Warm Apricot) |

#### 3. `strawberry`

| Slot | Hex |
|------|-----|
| primary | `#E24B5A` (Strawberry Red) |
| secondary | `#8E9A5A` (Leaf Olive Green) |
| surfaceCard | `#F6E7B8` (Seed Cream) |
| highlight | `#F9C3CB` (Blush Pink) |
| accentKpi | `#F06C78` (Berry Rose) |

#### 4. `lotus-pond`

| Slot | Hex |
|------|-----|
| primary | `#105666` (Midnight green / teal) |
| secondary | `#839958` (Moss green) |
| surfaceCard | `#F7F4D5` (Beige) |
| highlight | `#D3968C` (Rosy brown) |
| accentKpi | `#0A3323` (Dark green — use for KPI accent with light text on chips only; primary actions use `#105666`) |

#### 5. `ocean-deep`

| Slot | Hex |
|------|-----|
| primary | `#206ABC` (Atlantis) |
| secondary | `#7997E6` (Periwinkle) |
| surfaceCard | `#CAA9F3` (Phlox) |
| highlight | `#B37AD4` (Verbena) |
| accentKpi | `#0E155E` (Phthalo Blue — accent only; buttons use Atlantis) |

#### 6. `pool-party`

| Slot | Hex |
|------|-----|
| primary | `#227E9D` (Pool Bottom) |
| secondary | `#96D0D2` (Lifeboat Blue) |
| surfaceCard | `#FDF9FA` (Abalone) |
| highlight | `#FDA5CC` (Cotton Candy) |
| accentKpi | `#FD50A4` (Barbie Pink) |

*Dragonfly `#51ACC5` maps to `--color-primary-hover` derived value.*

#### 7. `sunset`

| Slot | Hex |
|------|-----|
| primary | `#6B5FA4` (Scampi) |
| secondary | `#8787CE` (Faraway Sky) |
| surfaceCard | `#FDD2A3` (Sunset Cloud) |
| highlight | `#FDB5A5` (Warm Undertone) |
| accentKpi | `#BF93D0` (Statice) |

*Portage `#9995E8` → secondary border / chart slice fallback.*

#### 8. `pastel-dream`

| Slot | Hex |
|------|-----|
| primary | `#A1E3FA` (Heavenly) |
| secondary | `#C4C3F3` (Perano) |
| surfaceCard | `#FCF0B9` (Sun Beam) |
| highlight | `#EDC3F1` (Lovecloud) |
| accentKpi | `#FDC2C9` (Crystal Rose) |

*Mint Gloss `#B7F8D3` → surface-muted / success-soft derivative.*

#### 9. `fresh-green`

| Slot | Hex |
|------|-----|
| primary | `#9ABF17` (Green Jujube) |
| secondary | `#84BF93` (Delltone) |
| surfaceCard | `#F3EEB6` (Perfect Pear) |
| highlight | `#AED9C5` (Peppermint) |
| accentKpi | `#D4DB74` (Avocado Cream) |

*Sparkling Frost `#DDECF1` → surface-muted / info-soft derivative.*

---

### Backend

#### Data model

`readme.md` documents `user_profiles.preferences` JSONB; **`user_profiles` is not implemented yet** — add it in this change:

**Table `user_profiles`**

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID PK, FK → `users.id` | 1:1 |
| `preferences` | JSONB NOT NULL DEFAULT `'{}'` | |
| `created_at` / `updated_at` | timestamptz | |

**`preferences` shape (MVP):**

```json
{
  "theme_palette_id": "veranda"
}
```

- Create profile row on user registration / first login if missing (lazy upsert).
- Validate `theme_palette_id` against allowed enum list server-side.

#### API (`docs/api-spec.yml`)

| Method | Path | Auth | Body / response |
|--------|------|------|-----------------|
| `GET` | `/v1/me/preferences` | JWT | `{ theme_palette_id: string }` |
| `PATCH` | `/v1/me/preferences` | JWT | `{ theme_palette_id?: string }` → updated preferences |

- `404` only if user not found; missing profile returns defaults (`veranda`).
- `400` for unknown `theme_palette_id`.

**NestJS modules:** `users` or new `preferences` module — `PreferencesController`, `PreferencesService`, `UserProfile` entity, DTO with `class-validator` enum.

#### Tests

- Unit: validation rejects unknown palette id.
- Integration: GET default, PATCH persists, subsequent GET returns new value, user isolation.

---

### Frontend

#### Theme system

| File | Purpose |
|------|---------|
| `frontend/src/theme/palettes.ts` | Registry: id, label, 5 slots, derived token map |
| `frontend/src/theme/applyTheme.ts` | `applyTheme(paletteId)` sets CSS vars on `document.documentElement` |
| `frontend/src/theme/ThemeProvider.tsx` | React context: load on auth, expose `paletteId` + `setPaletteId` |
| `frontend/src/theme/tokens.css` | Keep structure; default `:root` = `veranda` values |
| `frontend/src/components/settings/ThemeSettingsSection.tsx` | Settings UI |
| `frontend/src/components/settings/ThemeSettingsSection.css` | Swatch grid styles |

Wire `ThemeProvider` in `App.tsx` (inside `AuthProvider`).

**Client API** (`frontend/src/api/client.ts`, `types.ts`):

- `getPreferences()`, `updatePreferences({ theme_palette_id })`

**Flash prevention:** cache last `theme_palette_id` in `localStorage` keyed by `user_id`; apply synchronously in `ThemeProvider` before children render when cache hit; reconcile with GET `/v1/me/preferences`.

#### CSS centralization audit (mandatory)

Replace hardcoded hex in component CSS with semantic tokens. Known offenders (grep `#` in `frontend/src`):

| File | Action |
|------|--------|
| `AddBookModal.css` | Replace ~26 hex values with `var(--color-*)` |
| `CoverPicker.css` | Replace all hex with tokens |
| `CompletionModal.css` | Use shared `Modal` + tokens |
| `AddToTbrModal.css` | Use tokens / shared UI |
| `LoginPage.css` | Use tokens |
| `BookFormModal.css` | Use `--color-danger` |
| `import/*.css`, `ImportExportPage.css` | Promote success/info/danger soft tokens to `tokens.css` (remove inline fallbacks where possible) |

**Acceptance rule:** CI-style grep check — no `#` hex in `frontend/src/**/*.css` except `theme/palettes.ts` (if any) and `theme/tokens.css` default block. Optional script in `package.json` `lint:colors`.

Charts (`PieChart.css`) already map slices to semantic tokens — they will follow theme automatically once palette swaps vars.

---

### Documentation

- Update `docs/design-system-palette.md` — multi-palette registry and selection UX.
- Update `docs/data-model.md` — `user_profiles` + `preferences.theme_palette_id`.
- Update `docs/api-spec.yml` — preferences endpoints.
- OpenSpec delta: extend `design-tokens` capability or new `user-theme-preferences` capability.

---

### Definition of done

- [ ] `user_profiles` migration + entity; preferences GET/PATCH API with tests
- [ ] 9 palettes registered; `veranda` default
- [ ] Theme section in Settings with swatch preview and persistence
- [ ] Theme applies on login and immediately on change across all routes
- [ ] CSS audit complete — no stray hex outside theme module
- [ ] `docs/` and OpenSpec updated
- [ ] Manual test: switch palette → verify home, tracker, stats charts, modals, login reflect new colors
- [ ] Contrast spot-check: primary buttons readable on each palette (document exceptions if any palette fails AA for small text)

---

### Out of scope

- Custom palette builder / per-color editing
- Dark mode
- Per-device theme without account (guest/local-only)
- UI density preference (`preferences.ui_density` from PRD)
- Admin-managed palette CRUD

---

### Non-functional requirements

- **Security:** preferences endpoints scoped to authenticated user only; no cross-user reads.
- **Performance:** theme apply is synchronous DOM variable update (<16ms); no extra network on navigation.
- **Accessibility:** keyboard-selectable swatches; `aria-pressed` / radio semantics; focus ring uses themed `--color-focus-ring`.
- **i18n:** palette names can stay Spanish in UI; ids remain English slugs.

---

### OpenSpec change name

`kan-80-user-theme-palettes`

### Dependencies

- KAN-18 design tokens (done)
- Profile / Settings page shell (done — `ProfilePage`)

### Related PRD

- *Perfil / Ajustes* → temas visuales
- PRD §6 palette (Veranda default)
