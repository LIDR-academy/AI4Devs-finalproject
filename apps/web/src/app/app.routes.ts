import { Route } from '@angular/router';

/**
 * Lazy feature slots — the shell's only coupling to the bounded contexts
 * (`ARCHITECTURE.md` §7.1: "BOOT -- lazy loadChildren --> FEAT").
 *
 * The array is empty because no `type:feature` library exists yet: the frontend
 * slices are scaffolded from `T-C10-07` onwards, and a `loadChildren` pointing
 * at a library that does not exist does not compile. Each context adds exactly
 * one entry of this shape when its feature lib lands, and nothing else in the
 * shell changes:
 *
 * ```ts
 * {
 *   path: 'incidents',
 *   loadChildren: () =>
 *     import('@sport-itsm/incident-feature').then((m) => m.incidentRoutes),
 * }
 * ```
 *
 * Route guards (`authGuard`, `roleGuard` — usability only, never the security
 * boundary) attach to these entries; they are owned by `US-C10-02`.
 */
export const featureRoutes: Route[] = [];

/**
 * The shell's route table.
 *
 * `''` is a real, resolvable default route: it matches, so the router settles on
 * `/` instead of erroring, and the shell renders its `<router-outlet>` with no
 * routed child. It gains a landing target when the first feature slot above is
 * filled.
 *
 * `'**'` is the wildcard not-found route. It sends every unmatched URL back to
 * the default route rather than to a dedicated not-found surface, because such a
 * surface is nothing but user-facing copy and hardcoded UI strings are forbidden
 * (CLAUDE.md §3) — its Transloco-keyed page belongs to the `NFR` epic i18n slice
 * that owns Transloco setup.
 */
export const appRoutes: Route[] = [
  ...featureRoutes,
  { path: '', pathMatch: 'full', children: [] },
  { path: '**', redirectTo: '' },
];
