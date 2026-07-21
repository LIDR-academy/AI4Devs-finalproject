# Backend Testing (Pest 4)

Technical, Pest-specific implementation guidance for this Laravel 13 + Livewire 4 app. For basic Pest syntax (`test()`/`it()`/`expect()`, `make:test`, browser/smoke/architecture testing), see [`.claude/skills/pest-testing/SKILL.md`](../../../.claude/skills/pest-testing/SKILL.md) first — these files assume that and go one layer deeper: *this codebase's* conventions and judgment calls.

## Which file do I need?

| I'm about to... | Read |
| --- | --- |
| Write a new test file and I'm not sure what to name it or how to structure it | [pest-conventions.md](pest-conventions.md) |
| Test an isolated class/method with no DB or HTTP (a trait, a pure model method) | [unit-tests.md](unit-tests.md) |
| Test a route, a Livewire component, or anything hitting the real database | [feature-integration-tests.md](feature-integration-tests.md) |
| Write near-identical tests for several inputs (validation rules, boundary values) | [datasets-and-factories.md](datasets-and-factories.md) |
| Decide whether to fake `Mail`/`Notification`/`Queue`/HTTP, or use the real thing | [mocking-and-fakes.md](mocking-and-fakes.md) |
| Wonder why my test sees stale data, or whether to use `RefreshDatabase` | [database-strategy.md](database-strategy.md) |

For *what* to test rather than *how*, back up to [../qa/risk-based-testing.md](../qa/risk-based-testing.md).
