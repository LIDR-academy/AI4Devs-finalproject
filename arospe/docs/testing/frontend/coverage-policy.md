# Frontend Coverage Policy

## The backend floor doesn't transfer

The backend suite has a defined (though not-yet-enforced) coverage target: **80% line coverage**, via `php artisan test --coverage --min=80`, driven by Xdebug. See [../ci/commands.md](../ci/commands.md#enforce-a-minimum-coverage-threshold) for the command and [../ci/pipeline-integration.md](../ci/pipeline-integration.md) for its status (proposed, not currently enforced in `.github/workflows/tests.yml`).

**That metric does not transfer to browser/E2E tests.** Line coverage measures which PHP lines executed. A browser test drives a real browser through rendered Blade/Livewire output; Xdebug line coverage of the server code a page render happens to touch is not a meaningful signal of how well the *user journey* is tested. A single browser test that loads a page can incidentally "cover" a lot of Blade/controller lines while asserting almost nothing — high line coverage, near-zero journey confidence. Conversely, the parts most worth testing at the browser level (client-side interactivity, Livewire round-trips, JS errors) aren't captured by PHP line coverage at all.

So: **do not apply an 80% line-coverage floor to browser tests, and do not invent a substitute number.**

## No frontend metric is defined yet

There is no team-agreed equivalent metric for frontend/browser coverage in this repo today. Per the [Uncertainty Handling Rule](../../contracts.md), this is left explicitly open rather than filled with an assumption:

> `TODO (product/QA lead): define what "frontend coverage" means for this project, then record the decision as an ADR in docs/decisions/. Candidate metrics — pick one, don't average them:`
> `  (a) % of identified critical user journeys that have at least one browser test (e.g. sign-in, 2FA challenge, passkey management, registration, profile update);`
> `  (b) % of Livewire components that have at least one interaction (browser or Livewire) test.`
> `Option (a) is likely the better fit because it measures user-facing risk directly rather than component count — but the QA lead owns this decision.`

Until that decision is recorded, judge browser tests by **risk coverage of critical journeys**, not by a percentage: for each critical journey, is there at least one test that would turn red if that journey broke? (See [../qa/risk-based-testing.md](../qa/risk-based-testing.md).)

## When a number is reached with low-value tests

Whatever metric is eventually chosen, the same principle from [../qa/what-not-to-test.md](../qa/what-not-to-test.md) applies: a target reached by padding the suite with redundant or structurally-passing tests is worse than an honestly-lower number.

- Prefer **fewer high-value critical-journey tests** over many redundant ones — ten tests that each re-drive sign-in to reach one page are ten slow ways to test one thing.
- If hitting the target requires trivial or structurally-false-positive tests (see [test-quality-checklist.md](test-quality-checklist.md)), the target is telling you to write a *meaningful* test for an untested journey — not to inflate the count.
- A reviewer who sees coverage padded with low-value browser tests should treat it as a finding to raise, exactly as with the backend gate in [../qa/coverage-review-checklist.md](../qa/coverage-review-checklist.md).

_Last updated: 2026-07-19 — New frontend/browser testing guide added by the docs-maintainer skill._
