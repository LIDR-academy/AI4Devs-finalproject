#!/usr/bin/env python3
import os
import sys
import shutil
import tempfile
import unittest

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), "..")))
from check_links import run_checks  # noqa: E402

SKILL_TEMPLATE = """---
name: {name}
description: "fixture"
version: "1.0.0"
category: "fixture"
required_rules:
{required_rules}
---

# Fixture skill

[valid link](../rules/dummy_rule.md)
"""


class CheckLinksTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.agents_dir = os.path.join(self.tmp, ".agents")
        self.project_root = self.tmp
        os.makedirs(os.path.join(self.agents_dir, "skills"))
        os.makedirs(os.path.join(self.agents_dir, "rules"))
        with open(os.path.join(self.agents_dir, "rules", "dummy_rule.md"), "w") as f:
            f.write("# dummy\n")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _write_skill(self, filename, required_rule_path):
        path = os.path.join(self.agents_dir, "skills", filename)
        content = SKILL_TEMPLATE.format(
            name=filename,
            required_rules=f'  - "{required_rule_path}"',
        )
        with open(path, "w") as f:
            f.write(content)
        return path

    def test_clean_fixture_reports_zero_broken(self):
        self._write_skill("SK-01_a.md", "docs/exists.md")
        os.makedirs(os.path.join(self.project_root, "docs"))
        open(os.path.join(self.project_root, "docs", "exists.md"), "w").close()

        checked, broken, messages, skill_count = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 0, msg=messages)
        self.assertEqual(skill_count, 1)

    def test_missing_required_rule_is_detected_when_bootstrapped(self):
        self._write_skill("SK-01_a.md", "docs/does_not_exist.md")
        os.makedirs(os.path.join(self.project_root, "docs"))
        open(os.path.join(self.project_root, "docs", "00_stack_manifest.md"), "w").close()

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 1)
        self.assertTrue(any("required_rules roto" in m for m in messages))

    def test_missing_docs_target_is_ignored_pre_bootstrap(self):
        # Sin docs/00_stack_manifest.md, docs/ está vacío por diseño (proyecto recién
        # instalado, todavía no pasó por 00_greenfield_bootstrap_workflow.md) — un
        # required_rules apuntando ahí no debe reportarse como roto.
        self._write_skill("SK-01_a.md", "docs/does_not_exist.md")

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 0, msg=messages)

    def test_docs_subfolder_maturity_is_independent(self):
        # Escenario real encontrado probando el bootstrap E2E: docs/01_product_definition/
        # ya tiene contenido (post-bootstrap), pero docs/04_governance_and_quality/rules/
        # todavía no (SK-27 corre más adelante en el ciclo). Una referencia rota hacia la
        # carpeta poblada debe reportarse; una hacia la carpeta vacía debe omitirse — en
        # el mismo proyecto, al mismo tiempo.
        self._write_skill("SK-01_a.md", "docs/01_product_definition/02_prd.md")
        os.makedirs(os.path.join(self.project_root, "docs", "01_product_definition"))
        open(os.path.join(self.project_root, "docs", "01_product_definition", "02_prd.md"), "w").close()

        path = os.path.join(self.agents_dir, "skills", "SK-16_b.md")
        content = SKILL_TEMPLATE.format(
            name="SK-16_b.md",
            required_rules='  - "docs/04_governance_and_quality/rules/backend_rules.md"',
        )
        with open(path, "w") as f:
            f.write(content)

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 0, msg=messages)

    def test_dynamic_governance_rule_missing_file_is_warning_not_broken(self):
        # Escenario real encontrado probando el bootstrap brownfield E2E: SK-27 generó
        # docs/04_governance_and_quality/rules/ con backend_rules.md pero SIN
        # frontend_rules.md, porque el proyecto adoptado no tiene frontend (SK-17 nunca
        # se invoca ahí). Un required_rules apuntando a un archivo puntual ausente
        # DENTRO de rules/ no debe bloquear — no hay forma estática de distinguir "nunca
        # aplicó a este proyecto" de "se rompió por accidente" una vez que SK-27 ya corrió.
        os.makedirs(os.path.join(self.project_root, "docs", "04_governance_and_quality", "rules"))
        open(os.path.join(self.project_root, "docs", "04_governance_and_quality", "rules", "backend_rules.md"), "w").close()

        self._write_skill("SK-17_a.md", "docs/04_governance_and_quality/rules/frontend_rules.md")

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 0, msg=messages)
        self.assertTrue(any("no encontrado (puede no aplicar" in m for m in messages))

    def test_missing_agents_internal_target_is_never_ignored(self):
        # required_rules apuntando dentro de .agents/ (no docs/) SIEMPRE debe validarse,
        # sin importar la fase de bootstrap del proyecto — el framework en sí es
        # autocontenido independientemente de si el proyecto consumidor ya arrancó.
        self._write_skill("SK-01_a.md", ".agents/rules/does_not_exist.md")

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 1)
        self.assertTrue(any("required_rules roto" in m for m in messages))

    def test_duplicate_skill_id_is_detected(self):
        self._write_skill("SK-01_a.md", "docs/exists.md")
        self._write_skill("SK-01_b.md", "docs/exists.md")
        os.makedirs(os.path.join(self.project_root, "docs"))
        open(os.path.join(self.project_root, "docs", "exists.md"), "w").close()

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertGreaterEqual(broken, 1)
        self.assertTrue(any("duplicado" in m for m in messages))

    def test_broken_markdown_link_in_body_is_detected(self):
        path = os.path.join(self.agents_dir, "skills", "SK-02_broken_link.md")
        with open(path, "w") as f:
            f.write("---\nname: x\n---\n\n[dead link](./nowhere.md)\n")

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 1)
        self.assertTrue(any("Enlace roto" in m for m in messages))

    def test_gap_in_skill_numbering_is_warned_not_broken(self):
        self._write_skill("SK-01_a.md", "docs/exists.md")
        self._write_skill("SK-03_b.md", "docs/exists.md")
        os.makedirs(os.path.join(self.project_root, "docs"))
        open(os.path.join(self.project_root, "docs", "exists.md"), "w").close()

        checked, broken, messages, _ = run_checks(self.agents_dir, self.project_root)

        self.assertEqual(broken, 0)
        self.assertTrue(any("Huecos" in m for m in messages))

    def test_real_repo_has_zero_broken(self):
        real_agents_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
        real_agents_dir = os.path.normpath(os.path.join(real_agents_dir, ".."))
        real_project_root = os.path.normpath(os.path.join(real_agents_dir, ".."))

        checked, broken, messages, skill_count = run_checks(real_agents_dir, real_project_root)

        self.assertEqual(broken, 0, msg="\n".join(messages))
        self.assertEqual(skill_count, 36)


if __name__ == "__main__":
    unittest.main()
