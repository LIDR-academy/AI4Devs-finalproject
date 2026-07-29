# Hook: post-merge

## Intent

After merging a branch into the current local branch, regenerate the evidence index and any auto-generated catalogues. Used to keep `docs/evidence/INDEX.md` current.

## Trigger

`git pull` or `git merge` completes.

## Scope

Documentation catalogues and indices only.

## Actions

```bash
#!/usr/bin/env bash
# .opencode/hooks/post-merge.sh
set -e

echo "→ regenerating evidence index"
node .opencode/hooks/scripts/regenerate-evidence-index.js

echo "→ regenerating ADR catalogue in readme.md"
node .opencode/hooks/scripts/regenerate-adr-catalogue.js
```

## Index regeneration logic

```javascript
// .opencode/hooks/scripts/regenerate-evidence-index.js
const fs = require('fs');
const path = require('path');

const evidenceDir = path.join(__dirname, '../../../docs/evidence');
const files = fs.readdirSync(evidenceDir)
  .filter(f => f.endsWith('.md') && f !== 'INDEX.md')
  .sort()
  .reverse();

const grouped = files.reduce((acc, file) => {
  const date = file.slice(0, 10);
  acc[date] = acc[date] || [];
  acc[date].push(file);
  return acc;
}, {});

let content = '# Evidence Index\n\n';
for (const [date, files] of Object.entries(grouped)) {
  content += `## ${date}\n`;
  for (const file of files) {
    const title = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
    content += `- [${title}](${file})\n`;
  }
  content += '\n';
}

fs.writeFileSync(path.join(evidenceDir, 'INDEX.md'), content);
console.log(`Indexed ${files.length} evidence files.`);
```

## Manual trigger

If the hook didn't run (e.g., merge done from GitHub UI), run:

```bash
node .opencode/hooks/scripts/regenerate-evidence-index.js
```
