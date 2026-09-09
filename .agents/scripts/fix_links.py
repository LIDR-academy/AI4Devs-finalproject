#!/usr/bin/env python3
import os
import re

# Portable: derive project root from script location (.agents/scripts/ -> project root)
project_root = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
agents_dir = os.path.join(project_root, ".agents")

# Replace relative links pointing to docs from inside .agents/skills/specs/
# Example: [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) -> [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md)

def fix_links_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    rel_to_project = os.path.relpath(project_root, os.path.dirname(file_path))

    # Pattern: match markdown links
    def link_replacer(match):
        text = match.group(1)
        target = match.group(2)
        if target.startswith('http://') or target.startswith('https://') or target.startswith('#'):
            return match.group(0)
        
        target_clean = target.split('#')[0]
        curr_dir = os.path.dirname(file_path)
        resolved = os.path.normpath(os.path.join(curr_dir, target_clean))

        if not os.path.exists(resolved):
            # Check if it was trying to reference something in docs/
            # Try appending to docs/
            possible_docs = os.path.normpath(os.path.join(project_root, "docs", target_clean.lstrip('.././')))
            if os.path.exists(possible_docs):
                new_rel = os.path.relpath(possible_docs, curr_dir)
                print(f"Fixing {os.path.basename(file_path)}: {target} -> {new_rel}")
                return f"[{text}]({new_rel})"
        return match.group(0)

    new_content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_replacer, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, dirs, files in os.walk(agents_dir):
    for file in files:
        if file.endswith('.md'):
            fix_links_in_file(os.path.join(root, file))

print("Fix script completed.")
