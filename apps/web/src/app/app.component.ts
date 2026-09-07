import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * The application shell (`ARCHITECTURE.md` §5.1, §7.1): the single routed host
 * of `apps/web`. It composes — it never holds business logic, never injects a
 * store or `HttpClient`, and never names an ITSM concept; that vocabulary lives
 * in each bounded context's own `type:feature` / `type:ui` libraries.
 *
 * The `<main>` landmark is the routed region: every lazily loaded feature
 * renders inside it, and it is focusable so a future route-change focus manager
 * can move focus here after navigation (NFR-USE-03, WCAG 2.1 AA). No user-facing
 * copy appears in the shell: UI strings are Transloco keys, and Transloco is
 * owned by the `NFR` epic i18n slice.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
