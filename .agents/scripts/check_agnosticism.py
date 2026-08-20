#!/usr/bin/env python3
"""TK-038: guarda que .agents/scripts/ nunca vuelva a acoplarse al stack de un proyecto.

install.sh copia .agents/ verbatim (cp -R) a cualquier proyecto nuevo, sin importar su
stack. Un script bajo .agents/scripts/ que asuma un lenguaje, gestor de paquetes, test
runner o layout de directorios específico rompe la portabilidad para el siguiente
proyecto que instale el framework (ver CONTRIBUTING.md). Cualquier lógica de gobernanza
que sí dependa del stack real debe generarse por skill (ej. SK-27) hacia el árbol del
proyecto consumidor (docs/04_governance_and_quality/scripts/), nunca vivir aquí.
"""
import os
import sys

BLOCKED_SUBSTRINGS = [
    ("npx ", "invoca npx (Node) directamente"),
    ("pnpm ", "invoca pnpm (Node) directamente"),
    ("npm ", "invoca npm (Node) directamente"),
    ("yarn ", "invoca yarn (Node) directamente"),
    ("pip install", "invoca pip (Python) directamente"),
    ("pip3 ", "invoca pip3 (Python) directamente"),
    ("cargo ", "invoca cargo (Rust) directamente"),
    ("mvn ", "invoca mvn (Java/Maven) directamente"),
    ("gradle ", "invoca gradle (Java/Kotlin) directamente"),
    ("go test", "invoca go test (Go) directamente"),
    ("go run", "invoca go run (Go) directamente"),
    ("bundle exec", "invoca bundler (Ruby) directamente"),
    ("*.ts", "asume extensión de archivo TypeScript"),
    ("*.tsx", "asume extensión de archivo TSX"),
    ("*.jsx", "asume extensión de archivo JSX"),
    (".controller.", "asume convención de nombres de un proyecto (controller)"),
    (".service.", "asume convención de nombres de un proyecto (service)"),
    (".dto.", "asume convención de nombres de un proyecto (dto)"),
    (".schema.", "asume convención de nombres de un proyecto (schema)"),
    ("apps/backend", "asume el layout de monorepo de un proyecto específico"),
    ("apps/frontend", "asume el layout de monorepo de un proyecto específico"),
]


def run_checks(scripts_dir):
    """Escanea .agents/scripts/*.sh (nivel superior, no tests/) contra BLOCKED_SUBSTRINGS.

    Devuelve (checked_count, violation_count, messages) sin imprimir ni salir del
    proceso, para poder invocarse tanto desde CLI como desde tests.
    """
    checked_count = 0
    violation_count = 0
    messages = []

    if not os.path.isdir(scripts_dir):
        return checked_count, violation_count, messages

    for fname in sorted(os.listdir(scripts_dir)):
        if not fname.endswith(".sh"):
            continue
        file_path = os.path.join(scripts_dir, fname)
        if not os.path.isfile(file_path):
            continue
        checked_count += 1

        with open(file_path, encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        for line_idx, line in enumerate(lines, 1):
            for pattern, reason in BLOCKED_SUBSTRINGS:
                if pattern in line:
                    messages.append(
                        f"❌ Acoplamiento a stack en {fname} L{line_idx}: '{pattern.strip()}' — {reason}. "
                        f"Mueve esta lógica a un script generado por skill (ej. SK-27) en el árbol del proyecto consumidor."
                    )
                    violation_count += 1

    return checked_count, violation_count, messages


def main():
    scripts_dir = os.path.dirname(os.path.abspath(__file__))

    checked_count, violation_count, messages = run_checks(scripts_dir)

    for msg in messages:
        print(msg)

    print(f"\n📊 Total de scripts .sh auditados en .agents/scripts/: {checked_count}")
    print(f"🚨 Total de acoplamientos a stack encontrados: {violation_count}")

    if violation_count > 0:
        sys.exit(1)
    else:
        print("✨ .agents/scripts/ sigue siendo 100% agnóstico de stack.")


if __name__ == "__main__":
    main()
