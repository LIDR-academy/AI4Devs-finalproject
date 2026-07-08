#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Regenerates docs/evidence/INDEX.md by scanning all evidence files
 * in docs/evidence/ and grouping them by date.
 *
 * Run: node .opencode/hooks/scripts/regenerate-evidence-index.js
 */

const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, '..', '..', '..', 'docs', 'evidence');
const INDEX_FILE = path.join(EVIDENCE_DIR, 'INDEX.md');

function main() {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    console.error(`Evidence directory not found: ${EVIDENCE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(EVIDENCE_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('No evidence files found.');
    return;
  }

  const grouped = files.reduce((acc, file) => {
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : 'undated';
    acc[date] = acc[date] || [];
    acc[date].push(file);
    return acc;
  }, {});

  let content = '# Evidence Index\n\n';
  content += 'This index is auto-generated. Each entry links to a per-task evidence file with prompt, actions, deliverables, and test results.\n\n';

  for (const [date, dateFiles] of Object.entries(grouped)) {
    content += `## ${date}\n`;
    for (const file of dateFiles) {
      const title = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
      content += `- [${title}](./${file})\n`;
    }
    content += '\n';
  }

  fs.writeFileSync(INDEX_FILE, content);
  console.log(`Indexed ${files.length} evidence file(s) into ${path.relative(process.cwd(), INDEX_FILE)}`);
}

main();
