#!/usr/bin/env python3
import os
import re
import sys

agents_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
broken_count = 0
checked_count = 0

link_regex = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')

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
                        checked_count += 1
                        target_path_clean = target.split('#')[0]
                        if not target_path_clean:
                            continue
                        resolved = os.path.normpath(os.path.join(root, target_path_clean))
                        if not os.path.exists(resolved):
                            print(f"❌ Enlace roto en {os.path.relpath(file_path, agents_dir)} L{line_idx}: [{text}]({target}) -> No existe: {resolved}")
                            broken_count += 1

print(f"\n📊 Total de enlaces de archivos reales verificados: {checked_count}")
print(f"🚨 Total de enlaces rotos encontrados: {broken_count}")

if broken_count > 0:
    sys.exit(1)
else:
    print("✨ Todos los enlaces markdown reales en .agents/ están 100% correctos y verificados.")
