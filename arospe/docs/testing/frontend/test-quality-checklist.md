# Browser Test Quality Checklist

The general reasoning about **what** to test and **why** already lives in the shared testing docs and applies as-is to browser/frontend tests — read these first, they are not repeated here:

- [../philosophy.md](../philosophy.md) — coverage is not quality; the "revert the fix, does a test go red?" litmus.
- [../qa/risk-based-testing.md](../qa/risk-based-testing.md) — the "what can fail here?" checklist for designing cases.
- [../qa/what-not-to-test.md](../qa/what-not-to-test.md) — what's reasonable to skip and why.

This file adds only the browser-specific deltas.

## Table of Contents

- [The six-question checklist](#the-six-question-checklist)
- [Tests detect risk, not coverage](#tests-detect-risk-not-coverage)
- [Browser-specific deltas](#browser-specific-deltas)
- [Correct vs. incorrect examples](#correct-vs-incorrect-examples)

## The six-question checklist

Before writing or keeping a browser test, answer these. If a test can't survive them, it's decoration:

1. **What business behavior breaks if this test fails?**
2. **Does a test already exist covering this same risk?**
3. **Does this scenario represent a real business rule, or does it just mirror the UI implementation?**
4. **Would this test's failure be actionable for someone on the team (dev or business)?**
5. **Am I testing behavior observable by the user, or implementation details?**
6. **If this test always passed (a structural false positive), would anyone notice?**

Question 6 is the sharpest for browser tests specifically: a test that navigates a page but never asserts a meaningful outcome (or asserts something that is true by construction) is a *structural false positive* — it stays green whether or not the feature works. See the [philosophy anti-patterns](../philosophy.md#anti-patterns-to-avoid).

## Tests detect risk, not coverage

Tests are **not** written to move a coverage number. They are written to detect a real risk of a real behavior breaking. A browser test earns its place only if a plausible regression in this app's real flows (sign-in, 2FA challenge, passkey management, registration, settings) would make it fail. If you can't name that regression, don't write the test — and if you're adding it purely to raise a percentage, that's the exact anti-pattern [../qa/what-not-to-test.md](../qa/what-not-to-test.md) and [coverage-policy.md](coverage-policy.md) warn against.

Prefer **fewer, high-value critical-journey tests** over many redundant ones. Ten browser tests that each re-drive the sign-in form to reach the page they actually care about are ten slow, flaky ways to test one thing badly; one sign-in test plus nine `actingAs()`-seeded tests are faster and more precise.

## Browser-specific deltas

Things that matter for browser tests but not (or less) for backend Feature/Unit tests:

- **Flakiness from real network/DOM timing.** A browser test drives a real browser: elements render asynchronously, Livewire round-trips are network calls. A test that passes locally but fails intermittently in CI is worse than no test — it trains the team to ignore red. Assert on user-visible outcomes that the framework waits for (`assertSee`) rather than racing raw timing. If a test is flaky, fix or delete it; never leave it retried-until-green.
- **`assertNoJavaScriptErrors()` is a cheap, high-value check.** It costs one chained call and catches an entire class of regressions (a broken Alpine/Livewire interaction, a JS exception on load) that pure backend tests can't see. Include it in **every** browser test, and use [smoke tests](playwright-setup.md#real-syntax) (`visit([...])->assertNoJavaScriptErrors()`) as a fast first sweep across many pages.
- **Visual regression only where it earns its keep.** Pest 4 supports screenshot comparison, but pixel-diffing is high-maintenance (fonts, themes, and viewport shift break it). Reserve it for pages where *visual* correctness is the actual requirement — not as a default assertion. For most flows, asserting the right text/state is more robust than comparing screenshots.
- **State setup via Laravel, not the UI.** Reaching `security.edit` requires an authenticated, password-confirmed user (see [../../architecture/authentication.md](../../architecture/authentication.md)). Seed that with `actingAs()` + session helpers, not by driving login → password-confirm through the browser for every test — that's slower and adds unrelated failure surface.

## Correct vs. incorrect examples

❌ Incorrect — a structural false positive: it navigates but asserts nothing that would fail if the feature broke (question 6):

```php
it('shows the security page', function () {
    $this->actingAs(User::factory()->create());

    visit('/settings/security'); // no assertion at all — always "passes"
});
```

✅ Correct — asserts an observable, business-meaningful outcome that a regression would turn red, and checks for JS errors:

```php
// Real labels from resources/views/livewire/settings/security.blade.php
it('shows the passkeys section on the security settings page', function () {
    $this->actingAs(User::factory()->create())
        ->withSession(['auth.password_confirmed_at' => time()]);

    visit('/settings/security')
        ->assertNoJavaScriptErrors()
        ->assertSee('Passkeys')
        ->assertSee('No passkeys yet');
});
```

_Last updated: 2026-07-19 — New frontend/browser testing guide added by the docs-maintainer skill._
