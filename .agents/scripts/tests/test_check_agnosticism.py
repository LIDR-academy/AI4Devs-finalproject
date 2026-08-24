#!/usr/bin/env python3
import os
import sys
import shutil
import tempfile
import unittest

sys.path.insert(0, os.path.normpath(os.path.join(os.path.dirname(__file__), "..")))
from check_agnosticism import run_checks  # noqa: E402


class CheckAgnosticismTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.scripts_dir = os.path.join(self.tmp, "scripts")
        os.makedirs(self.scripts_dir)

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _write_script(self, filename, content):
        path = os.path.join(self.scripts_dir, filename)
        with open(path, "w") as f:
            f.write(content)
        return path

    def test_agnostic_script_reports_zero_violations(self):
        self._write_script(
            "check_rules_freshness.sh",
            "#!/usr/bin/env bash\ngit log -1 --format=%ct -- \"docs/02_architecture_design/03_domain_model.md\"\n",
        )

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(checked, 1)
        self.assertEqual(violations, 0, msg=messages)

    def test_stack_specific_binary_is_detected(self):
        self._write_script(
            "check_something.sh",
            "#!/usr/bin/env bash\nnpx eslint . --max-warnings 0\n",
        )

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(violations, 1)
        self.assertIn("npx", messages[0])

    def test_hardcoded_monorepo_layout_is_detected(self):
        self._write_script(
            "check_something.sh",
            "#!/usr/bin/env bash\nfind apps/backend/src -name '*.ts'\n",
        )

        checked, violations, messages = run_checks(self.scripts_dir)

        # apps/backend AND *.ts both match on the same line
        self.assertEqual(violations, 2, msg=messages)

    def test_markdown_files_are_not_pattern_scanned(self):
        self._write_script("README.md", "run `npx eslint` in a code fence, purely documentation\n")

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(checked, 0)
        self.assertEqual(violations, 0, msg=messages)

    def test_py_file_with_blocked_pattern_is_detected(self):
        self._write_script(
            "check_something.py",
            "import subprocess\nsubprocess.run(['npx ', 'eslint', '.'])\n",
        )

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(violations, 1)
        self.assertIn("npx", messages[0])

    def test_unexpected_extension_is_flagged(self):
        self._write_script("check_something.js", "// clean content, but the wrong language entirely\n")

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(violations, 1)
        self.assertIn("Extensión no permitida", messages[0])

    def test_dotfiles_are_not_flagged_as_unexpected_extension(self):
        self._write_script(".gitignore", "__pycache__/\n")

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(checked, 0)
        self.assertEqual(violations, 0, msg=messages)

    def test_own_module_is_exempt_from_pattern_scan(self):
        # check_agnosticism.py define BLOCKED_SUBSTRINGS como literales — escanearse a sí
        # mismo con sus propios patrones produciría falsos positivos garantizados.
        self._write_script("check_agnosticism.py", 'BLOCKED_SUBSTRINGS = [("npx ", "x"), ("apps/backend", "y")]\n')

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(checked, 0)
        self.assertEqual(violations, 0, msg=messages)

    def test_nested_subdirectory_sh_file_is_detected(self):
        nested_dir = os.path.join(self.scripts_dir, "helpers")
        os.makedirs(nested_dir)
        with open(os.path.join(nested_dir, "check_nested.sh"), "w") as f:
            f.write("#!/usr/bin/env bash\nnpx eslint .\n")

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(violations, 1)
        self.assertIn(os.path.join("helpers", "check_nested.sh"), messages[0])

    def test_tests_subdirectory_is_not_scanned(self):
        tests_dir = os.path.join(self.scripts_dir, "tests")
        os.makedirs(tests_dir)
        with open(os.path.join(tests_dir, "fixture.sh"), "w") as f:
            f.write("npx should-not-be-scanned\n")

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(checked, 0)
        self.assertEqual(violations, 0, msg=messages)

    def test_nested_tests_subdirectory_is_not_scanned(self):
        nested_tests_dir = os.path.join(self.scripts_dir, "helpers", "tests")
        os.makedirs(nested_tests_dir)
        with open(os.path.join(nested_tests_dir, "fixture.sh"), "w") as f:
            f.write("npx should-not-be-scanned-either\n")

        checked, violations, messages = run_checks(self.scripts_dir)

        self.assertEqual(checked, 0)
        self.assertEqual(violations, 0, msg=messages)

    def test_missing_scripts_dir_reports_zero(self):
        checked, violations, messages = run_checks(os.path.join(self.tmp, "does_not_exist"))

        self.assertEqual(checked, 0)
        self.assertEqual(violations, 0)
        self.assertEqual(messages, [])


if __name__ == "__main__":
    unittest.main()
