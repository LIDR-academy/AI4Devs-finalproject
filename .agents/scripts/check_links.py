#!/usr/bin/env python3
import os
import re
import sys
from collections import defaultdict

link_regex = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
frontmatter_regex = re.compile(r'^---\n(.*?)\n---\n', re.S)
skill_id_regex = re.compile(r'SK-(\d+)')


def run_checks(agents_dir, project_root):
    """Audita .agents/: enlaces markdown rotos, required_rules huérfanos e IDs de skill duplicados.

    Devuelve (checked_count, broken_count, messages) sin imprimir ni salir del proceso,
    para que pueda invocarse tanto desde CLI como desde tests.

    Los enlaces/required_rules que apuntan a docs/ son referencias a artefactos que
    .agents/ genera en tiempo de ejecución (PRD, stack manifest, reglas...), no archivos
    que deban existir de antemano — y distintas subcarpetas de docs/ maduran en fases
    distintas del ciclo VSDD (ej. docs/01_product_definition/ existe tras el bootstrap,
    pero docs/04_governance_and_quality/rules/ no existe hasta que SK-27 corre más
    adelante en el ciclo normal, incluso en un proyecto ya bootstrapeado). Por eso el
    criterio es por-carpeta, no un flag global de "proyecto bootstrapeado": si la carpeta
    contenedora del target todavía no tiene ningún .md real, se asume que ese target es
    una referencia a futuro y se omite; si la carpeta ya tiene contenido, se valida en
    serio — así una regresión real (un archivo que debería estar y no está, en una
    carpeta que el framework ya pobló) sigue detectándose. Los enlaces internos de
    .agents/ (skills, workflows, rules) sí deben resolver siempre, en cualquier fase.
    """
    broken_count = 0
    checked_count = 0
    messages = []
    skill_ids = defaultdict(list)

    def is_docs_target(path):
        return os.path.normpath(path).replace(os.sep, '/').startswith('docs/')

    def docs_parent_has_content(target_rel_path):
        parent_abs = os.path.join(project_root, os.path.dirname(target_rel_path))
        if not os.path.isdir(parent_abs):
            return False
        return any(fn.endswith('.md') for fn in os.listdir(parent_abs))

    def is_dynamic_governance_rule(target_rel_path):
        normalized = os.path.normpath(target_rel_path).replace(os.sep, '/')
        return normalized.startswith('docs/04_governance_and_quality/rules/')

    skills_dir = os.path.join(agents_dir, "skills")
    if os.path.isdir(skills_dir):
        for root, dirs, files in os.walk(skills_dir):
            for f in files:
                if not f.endswith('.md'):
                    continue
                file_path = os.path.join(root, f)
                rel_path = os.path.relpath(file_path, agents_dir)
                m = skill_id_regex.match(f)
                if m:
                    skill_ids[m.group(1)].append(rel_path)

                with open(file_path, encoding='utf-8', errors='ignore') as skill_file:
                    text = skill_file.read()
                fm_match = frontmatter_regex.match(text)
                if not fm_match:
                    continue
                in_block = False
                for line in fm_match.group(1).splitlines():
                    if line.strip().startswith('required_rules'):
                        in_block = True
                        continue
                    if in_block:
                        if line.strip().startswith('- '):
                            val = line.split('- ', 1)[1].strip().strip('"').strip("'")
                            if val.startswith('docs/') or val.startswith('.agents/'):
                                if is_docs_target(val) and not docs_parent_has_content(val):
                                    continue
                                checked_count += 1
                                if not os.path.exists(os.path.join(project_root, val)):
                                    if is_dynamic_governance_rule(val):
                                        # docs/04_governance_and_quality/rules/*.md lo genera SK-27
                                        # dinámicamente según lo que el proyecto realmente necesita
                                        # (ej. un backend-only nunca genera frontend_rules.md, porque
                                        # SK-17 tampoco se invoca ahí) — un archivo puntual ausente en
                                        # esa carpeta no distingue "nunca aplicó" de "se rompió", así
                                        # que se reporta visible pero no bloqueante, igual que los
                                        # huecos de numeración de skills.
                                        messages.append(f"⚠️  required_rules no encontrado (puede no aplicar a este proyecto) en {rel_path}: '{val}'")
                                    else:
                                        messages.append(f"❌ required_rules roto en {rel_path}: '{val}' -> No existe")
                                        broken_count += 1
                        else:
                            in_block = False

    for sid, paths in sorted(skill_ids.items(), key=lambda kv: int(kv[0])):
        if len(paths) > 1:
            messages.append(f"❌ ID de skill SK-{sid} duplicado en: {', '.join(paths)}")
            broken_count += 1

    declared_ids = sorted(int(sid) for sid in skill_ids)
    if declared_ids:
        expected = list(range(declared_ids[0], declared_ids[-1] + 1))
        missing = sorted(set(expected) - set(declared_ids))
        if missing:
            gaps = ', '.join(f"SK-{n:02d}" for n in missing)
            messages.append(f"⚠️  Huecos en la numeración de skills (no bloqueante): {gaps}")

    for root, dirs, files in os.walk(agents_dir):
        for f in files:
            if f.endswith('.md'):
                file_path = os.path.join(root, f)
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as md_file:
                    lines = md_file.readlines()
                    in_code_block = False
                    for line_idx, line in enumerate(lines, 1):
                        if line.strip().startswith('```'):
                            in_code_block = not in_code_block
                            continue

                        # Ignore template blockquotes & template code blocks meant for generated docs navigation headers
                        if in_code_block or line.strip().startswith('>') or '{modulo}' in line or '{ticket_id}' in line or 'US-XXX' in line or '00_research_human_notes' in line:
                            continue

                        matches = link_regex.findall(line)
                        for text, target in matches:
                            if target.startswith('http://') or target.startswith('https://') or target.startswith('#') or target.startswith('mailto:'):
                                continue
                            target_path_clean = target.split('#')[0]
                            if not target_path_clean:
                                continue
                            resolved = os.path.normpath(os.path.join(root, target_path_clean))
                            resolved_rel_to_project = os.path.relpath(resolved, project_root)
                            if is_docs_target(resolved_rel_to_project) and not docs_parent_has_content(resolved_rel_to_project):
                                continue
                            checked_count += 1
                            if not os.path.exists(resolved):
                                messages.append(f"❌ Enlace roto en {os.path.relpath(file_path, agents_dir)} L{line_idx}: [{text}]({target}) -> No existe: {resolved}")
                                broken_count += 1

    return checked_count, broken_count, messages, len(skill_ids)


def main():
    agents_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
    project_root = os.path.normpath(os.path.join(agents_dir, ".."))

    checked_count, broken_count, messages, skill_count = run_checks(agents_dir, project_root)

    for msg in messages:
        print(msg)

    print(f"\n📊 Total de enlaces + required_rules verificados: {checked_count}")
    print(f"📊 Total de skills con ID único auditadas: {skill_count}")
    print(f"🚨 Total de problemas de integridad encontrados: {broken_count}")

    if broken_count > 0:
        sys.exit(1)
    else:
        print("✨ Enlaces, required_rules e IDs de skills en .agents/ están 100% correctos y verificados.")


if __name__ == "__main__":
    main()
