## 1. Repository Configuration

- [x] 1.1 Create `.gitignore` at repo root covering .NET 10 (bin/, obj/), Node.js (node_modules/, dist/), Docker, K8s, IDE (VS Code, Visual Studio, Rider), and OS patterns
- [x] 1.2 Create `.editorconfig` at repo root with C# 14 rules (file-scoped namespaces, nullable enabled, 4-space indent) and TypeScript strict rules (2-space indent, no implicit any)

## 2. CI Pipeline Skeleton

- [x] 2.1 Create `.github/workflows/ci.yml` with push/PR triggers on main
- [x] 2.2 Add `validate` job that runs on ubuntu-latest with a passing step (echo "CI pipeline is alive")
- [x] 2.3 Verify CI passes on a test push
