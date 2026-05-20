# ADR-009: Centralized Compose MaterialTheme in :common:ui-resources

**Date:** 2026-03-25
**Status:** Accepted

## Context

Dividox targets Android, iOS, and Desktop (JVM) using Compose Multiplatform. The app currently wraps its entire UI in a bare `MaterialTheme { }` call inside `App.kt` with no customization — all colors, typography, and shapes fall back to Material3 defaults. This means the UI carries no product identity and there is no single place where the visual design system is codified in code.

The project has an official design system defined in Stitch (https://stitch.withgoogle.com), which is the source of truth for the product's color palette, typographic scale, and corner geometry. Without a code-side counterpart that maps those design tokens into Compose, every screen risks drifting from the intended visual language — especially as more features are added by different contributors.

The `:common:ui-resources` module already exists with the right convention plugins (`dividox.kmp.library`, `dividox.compose.multiplatform`, `dividox.kmp.ios`) and an empty Kotlin package at `com.akole.dividox.common.ui.resources`. It is the correct architectural home for shared UI infrastructure: accessible to all `:feature` modules without creating circular dependencies, and isolated from business logic.

## Decision

Define a `DividoxTheme` composable in `:common:ui-resources` that wraps `MaterialTheme` with a fully customized `ColorScheme`, `Typography`, and `Shapes` derived from the Stitch design system. This composable becomes the **single entry point** for all theming in the app.

**File structure** inside `com.akole.dividox.common.ui.resources.theme/`:

```
:common:ui-resources
└── src/commonMain/kotlin/com/akole/dividox/common/ui/resources/
    └── theme/
        ├── Color.kt    — lightColorScheme() and darkColorScheme() with Stitch tokens
        ├── Type.kt     — Typography mapping the full Material3 scale (displayLarge…labelSmall)
        ├── Shape.kt    — Shapes for all five size tiers (extraSmall…extraLarge)
        └── Theme.kt    — DividoxTheme composable (public API)
```

`Theme.kt` detects the current mode via `isSystemInDarkTheme()` and selects the appropriate color scheme. Because `Font(Res.font.*)` is a `@Composable` invocation in Compose Multiplatform, the font family must be created inside the composable — it cannot be a top-level `val`:

```kotlin
@Composable
fun DividoxTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DividoxDarkColorScheme else DividoxLightColorScheme
    val typography = buildDividoxTypography(rememberInterFontFamily())
    MaterialTheme(
        colorScheme = colorScheme,
        typography = typography,
        shapes = DividoxShapes,
        content = content,
    )
}
```

`rememberInterFontFamily()` loads **Inter Variable** (`InterVariable.ttf` / `InterVariable-Italic.ttf`, Inter v4.1) from `composeResources/font/` inside `:common:ui-resources`. `buildDividoxTypography(fontFamily)` constructs the full M3 scale from the provided family. Both are `@Composable` functions internal to the `theme` package.

`App.kt` replaces the current `MaterialTheme { }` with `DividoxTheme { }`. No other call site should reference `MaterialTheme` directly as a wrapper — only as a consumer (`MaterialTheme.colorScheme`, `MaterialTheme.typography`, `MaterialTheme.shapes`).

**Design token source of truth**: Concrete hex values, font families, and corner radii are defined in `DESIGN.md` (generated from the Stitch project). `Color.kt`, `Type.kt`, and `Shape.kt` must be kept in sync with `DESIGN.md`. Any visual change starts in Stitch → is reflected in `DESIGN.md` → is applied in these files.

**Dark/light mode**: Both schemes are defined from day one. Dynamic Color (Material You) is explicitly excluded from MVP (see Alternatives).

**Enforcement rule**: No `:feature` screen or composable may hardcode color values, font sizes, or corner radii. All visual tokens are consumed exclusively via `MaterialTheme.colorScheme`, `MaterialTheme.typography`, and `MaterialTheme.shapes`.

## Alternatives Considered

### Keep the bare `MaterialTheme` with no customization
- **Pros:** Zero implementation effort; no decisions to make about specific values.
- **Cons:** The UI carries no product identity. As screens multiply, each contributor makes ad-hoc visual decisions (hardcoded hex values, magic numbers for font sizes), leading to an inconsistent UI that is expensive to redesign later.

### Define the theme inside `:composeApp`
- **Pros:** Collocated with `App.kt`; simple to set up initially.
- **Cons:** `:feature` modules cannot depend on `:composeApp` (it sits at the top of the dependency graph). Any `:feature` composable that needs a theme-aware preview would be unable to access `DividoxTheme`. This breaks the module architecture established in ADR-002.

### Dynamic Color — Material You (`dynamicColorScheme`)
- **Pros:** Adapts to the user's wallpaper on Android 12+; modern Android experience.
- **Cons:** Only available on Android 12+ (API 31); not supported by Compose Multiplatform on iOS or Desktop JVM. Enabling it would mean Android users see a different color palette than iOS/Desktop users, undermining cross-platform consistency. Deferred to a post-MVP decision.

### External theming library (e.g., Aesthetic, Calf)
- **Pros:** May offer additional features like runtime theme switching.
- **Cons:** Adds an external dependency for functionality that Material3 already provides natively. Introduces an abstraction layer over `MaterialTheme` that complicates integration with the Compose ecosystem (tooling, Previews, accessibility).

## Consequences

### Positive
- A single file change in `Color.kt`, `Type.kt`, or `Shape.kt` propagates the update to every screen across all three platforms simultaneously.
- Composable Previews in `:feature` modules can wrap their content in `DividoxTheme { }` for accurate, on-brand previews.
- Dark mode is supported from the first user-visible screen with no per-screen conditional logic.
- The Stitch → `DESIGN.md` → `Color.kt/Type.kt/Shape.kt` pipeline creates a traceable, auditable link between design decisions and code.
- Unit and UI tests for composables can inject a known `DividoxTheme` to assert visual behavior without relying on system defaults.

### Negative
- All `:feature` modules and `:composeApp` must declare `implementation(projects.common.uiResources)` as a dependency. This is expected and consistent with project conventions, but it is a mandatory coupling.
- The concrete token values (hex codes, font family names) cannot be finalized until the Stitch project is accessible via the Stitch MCP and `DESIGN.md` is generated. Until then, placeholder values must be used.
- A global theme change (e.g., rebranding a primary color) affects every screen at once — intentional by design, but requires visual QA across all platforms after each change.

## Implementation Notes
- `Color.kt` must define tokens for **all** roles in `ColorScheme` (26 color slots in Material3), not just `primary`/`secondary`. Unset slots inherit from the Material3 baseline, which may not match the design.
- `Type.kt` should specify `fontFamily` for each text style. If a custom font is used, the font files live in `composeResources/font/` inside `:common:ui-resources`.
- `Shape.kt` corner values must be consistent with the Stitch design system's border-radius scale.
- `DESIGN.md` must exist and be reviewed before `Color.kt` is written. Do not invent token values.

## Related ADRs

- [ADR-002](ADR-002-clean-architecture-auth-module-split.md): Establishes `:common` vs `:feature` module boundaries that make `:common:ui-resources` the correct home for `DividoxTheme`
- [ADR-005](ADR-005-component-architecture-portfolio-data.md): Component architecture that all `:feature` modules follow, reinforcing the no-hardcoded-values rule
