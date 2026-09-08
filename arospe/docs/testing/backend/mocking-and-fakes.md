# Mocking and Fakes

For the `use function Pest\Laravel\mock;` import mechanics, see [`.claude/skills/pest-testing/SKILL.md`](../../../.claude/skills/pest-testing/SKILL.md). This file covers the judgment call: *when* faking preserves a test's value, and when it destroys it.

## The rule

Fake the boundary of the system you don't own or can't safely trigger for real in a test (network calls, email delivery, queued jobs, time). Never fake the thing the test exists to verify — see [philosophy.md](../philosophy.md#2-tests-that-mock-everything-and-verify-nothing-real).

## What to fake in this codebase, and why

| Concern | This app's real config in tests | Fake it with | When |
| --- | --- | --- | --- |
| Mail (password reset, etc.) | `MAIL_MAILER=array` (see [`phpunit.xml`](../../../phpunit.xml)) — already captured in memory, not actually sent | `Mail::fake()` / `Notification::fake()` + `Mail::assertSent(...)` | Whenever a test needs to assert *that* an email/notification was triggered, not just that the mailer config is `array`. |
| Queue | `QUEUE_CONNECTION=sync` — jobs run inline, synchronously, during the request | `Queue::fake()` + `Queue::assertPushed(...)` | Only if you need to assert a job was *dispatched* without executing its side effects (e.g. it calls a real third-party API). If the job is cheap and safe to actually run, letting `sync` execute it for real is more valuable — it proves the job itself works, not just that it was queued. |
| HTTP to third-party APIs | None exist in this codebase today | `Http::fake()` | The moment this app makes an outbound HTTP call (there are currently none — this app has no `routes/api.php` and no external API integrations per [api/routes.md](../../api/routes.md)), fake it in tests; never let a test suite depend on a real network call succeeding. |
| Wall-clock time | Real `now()` | `Carbon::setTestNow(...)`/`travel()`/`travelTo()` | Any test whose assertion depends on "now" (e.g. `two_factor_confirmed_at` freshness, token expiry) — without freezing time, the test is non-deterministic by construction (see the [DoD checklist](../README.md)). |

## What NOT to mock

- **This app's own Action classes** (`App\Actions\Fortify\CreateNewUser`, `App\Livewire\Settings\Security`, etc.). Mocking the class under test — or the one collaborator that actually contains the business rule you're verifying — produces a test that passes regardless of whether the real logic is correct. See the Mockery example in [philosophy.md](../philosophy.md#2-tests-that-mock-everything-and-verify-nothing-real).
- **The database**, in `tests/Feature/`. `RefreshDatabase` gives a real, migrated schema per test — that's already fast and isolated (see [database-strategy.md](database-strategy.md)); there's no reason to fake Eloquent here.
- **Validation rules** you're trying to test. Faking `Password::default()` to always pass, in a test that's supposed to verify the password policy, defeats the test's purpose.

## Concrete example: faking Notification for password reset

```php
<?php

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('requesting a password reset sends the reset notification', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});
```

This test would still pass even if the reset *link itself* were broken — `Notification::fake()` intercepts before rendering. If the goal is "the reset flow actually works end-to-end," pair this with a separate test that follows the real (non-faked) flow through to a successful `password.update`, per [risk-based-testing.md #5](../qa/risk-based-testing.md).
