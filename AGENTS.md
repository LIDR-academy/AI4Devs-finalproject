# AI Agents — Project Rules

All AI agents (Cursor, Claude, Codex, Gemini, etc.) must follow the Flutter + Firebase mobile stack defined in this repository.

## Single entry point

**[ai-specs/specs/base-standards.mdc](ai-specs/specs/base-standards.mdc)** — core principles, language rules (English code, Spanish docs/commits/PRs), and links to detailed standards.

## Detailed standards (authoritative)

| Document | Scope |
|----------|--------|
| [mobile-standards.mdc](ai-specs/specs/mobile-standards.mdc) | Flutter UI, BLoC (`flutter_bloc`), Clean Architecture presentation/domain, Android/iOS, mobile testing |
| [firebase-standards.mdc](ai-specs/specs/firebase-standards.mdc) | Firestore, Firebase Authentication, repositories, datasources, Security Rules (no REST API) |
| [documentation-standards.mdc](ai-specs/specs/documentation-standards.mdc) | Technical documentation and AI spec maintenance |
| [development_guide.md](ai-specs/specs/development_guide.md) | Entorno Flutter/Firebase y pruebas (español) |
| [firebase-data-access.yml](ai-specs/specs/firebase-data-access.yml) | Contrato de acceso a datos (Firestore/Auth/Storage) |
| [data-model.md](ai-specs/specs/data-model.md) | Modelo Firestore La Pocha (users, games, players, rounds) |
| [api-spec.yml](ai-specs/specs/api-spec.yml) | **Obsoleto** — solo aviso; usar `firebase-data-access.yml` |

## Commands and agents

- **Commands**: [ai-specs/.commands/](ai-specs/.commands/) — planning and implementation workflows
- **Agents**: [ai-specs/.agents/](ai-specs/.agents/) — role definitions for mobile and Firebase work
- **Skills**: [.agents/skills/](.agents/skills/) — installed Dart/Flutter skills (read `SKILL.md` before use)

## Project skills (required for mobile tasks)

Agents **must** read and follow the relevant skill under `.agents/skills/` when performing these tasks. Combine skill workflows with [mobile-standards.mdc](ai-specs/specs/mobile-standards.mdc) (BLoC + Clean Architecture + Firebase).

| When | Skill | Location |
|------|-------|----------|
| Structuring features, layers, or refactoring `lib/` | `flutter-apply-architecture-best-practices` | `.agents/skills/flutter-apply-architecture-best-practices/SKILL.md` |
| Writing unit tests | `dart-add-unit-test` | `.agents/skills/dart-add-unit-test/SKILL.md` |
| Adding integration / E2E tests | `flutter-add-integration-test` | `.agents/skills/flutter-add-integration-test/SKILL.md` |
| Generating mocks for tests | `dart-generate-test-mocks` | `.agents/skills/dart-generate-test-mocks/SKILL.md` |
| Model serialization (`fromJson` / `toJson`, Firestore maps) | `flutter-implement-json-serialization` | `.agents/skills/flutter-implement-json-serialization/SKILL.md` |
| Routing, `go_router`, deep links | `flutter-setup-declarative-routing` | `.agents/skills/flutter-setup-declarative-routing/SKILL.md` |

Additional skills in `.agents/skills/` (e.g. `flutter-add-widget-test`, `dart-run-static-analysis`) are optional unless the task clearly matches their description. Do **not** use `flutter-use-http-package` for app data — use Firebase SDK per [firebase-standards.mdc](ai-specs/specs/firebase-standards.mdc).

## Deprecated (removed)

`backend-standards.mdc` and `frontend-standards.mdc` described Node.js/Express and React; they are **not** part of this stack. Do not recreate or reference them.

## Before any implementation

1. Read `base-standards.mdc` and the relevant `*-standards.mdc` files for the task.
2. For mobile work, read the **required skill(s)** from `.agents/skills/` (see table above).
3. Follow TDD and Clean Architecture layer boundaries.
4. Use Firebase SDK only for remote data and auth.
5. Run `flutter analyze` and `flutter test` on touched code.
6. Write commit messages and PR descriptions in Spanish; keep Dart code and comments in English.
