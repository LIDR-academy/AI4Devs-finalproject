# Repo Configuration

## Purpose
TBD

## Requirements

### Requirement: Root .gitignore covers all project layers
The repository SHALL have a `.gitignore` at the root that covers .NET 10, Node.js/Angular, Docker, Kubernetes, IDE (VS Code, Visual Studio, Rider), and operating system patterns.

#### Scenario: .NET build artifacts are ignored
- **WHEN** `dotnet build` produces `bin/` and `obj/` directories
- **THEN** they are not tracked by git

#### Scenario: Node modules are ignored
- **WHEN** `npm install` creates `node_modules/`
- **THEN** it is not tracked by git

#### Scenario: IDE files are ignored
- **WHEN** VS Code creates `.vscode/` or Rider creates `.idea/`
- **THEN** they are not tracked by git

### Requirement: .editorconfig enforces C# 14 and TypeScript strict conventions
The repository SHALL have an `.editorconfig` at the root that enforces:
- C# 14: file-scoped namespaces, nullable reference types enabled, 4-space indent
- TypeScript: strict mode, no implicit any, 2-space indent
- Both: UTF-8 encoding, trim trailing whitespace, final newline

#### Scenario: IDE picks up C# formatting rules
- **WHEN** a developer opens a `.cs` file in an editorconfig-compatible IDE
- **THEN** the editor applies C# 14 formatting rules (file-scoped namespaces, nullable enabled, 4-space indent)

#### Scenario: IDE picks up TypeScript formatting rules
- **WHEN** a developer opens a `.ts` file in an editorconfig-compatible IDE
- **THEN** the editor applies TypeScript formatting rules (strict mode, 2-space indent)
