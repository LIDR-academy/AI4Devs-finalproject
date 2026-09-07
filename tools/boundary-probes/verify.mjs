/**
 * Proves that `@nx/enforce-module-boundaries` actually bites.
 *
 * A green `nx lint` over legal code does not demonstrate that an illegal import
 * would be caught — those are two different claims, and only a deliberate
 * violation settles the second one. This script therefore scaffolds throwaway
 * projects under `libs/__boundary-probe/`, each carrying exactly one illegal
 * edge, asserts that lint fails for those and passes for the legal controls,
 * and then removes every trace of them again.
 *
 * Run it after any change to the tag vocabulary, the type matrix or the
 * `depConstraints` block of `eslint.config.mjs`.
 *
 *   pnpm verify:boundaries
 *
 * Exit code 0 means every probe behaved as the matrix of ARCHITECTURE.md §5.3
 * requires. Anything else is a boundary regression.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const PREFIX = '__boundary-probe';
const probeDir = path.join(repoRoot, 'libs', PREFIX);
const tsconfigPath = path.join(repoRoot, 'tsconfig.base.json');

/**
 * The exact bytes of `tsconfig.base.json` before anything is scaffolded.
 * Teardown writes these back verbatim rather than re-serialising the parsed
 * object: `JSON.stringify` would expand short arrays that Prettier keeps on one
 * line, leaving a spurious diff behind every run.
 */
const originalTsconfig = fs.readFileSync(tsconfigPath, 'utf8');

/** Libraries the probes import. They carry tags only; they import nothing. */
const TARGETS = {
  util: ['platform:shared', 'scope:shared', 'type:util'],
  infra: ['platform:backend', 'scope:incident', 'type:infrastructure'],
  beutil: ['platform:backend', 'scope:incident', 'type:util'],
  sladomain: ['platform:backend', 'scope:sla', 'type:domain'],
  app: ['platform:backend', 'scope:shared', 'type:app'],
  sharedui: ['platform:frontend', 'scope:shared', 'type:ui'],
};

/**
 * Each source probe isolates a single violation: the other two axes are legal,
 * so a failure can only come from the rule under test.
 */
const SOURCES = [
  // -- legal: these must pass, or the configuration forbids too much --------
  {
    id: 'ok',
    tags: ['platform:backend', 'scope:incident', 'type:domain'],
    imports: 'util',
    expect: 'pass',
    rule: 'domain may use the shared kernel',
  },
  {
    id: 'appsrc',
    tags: ['platform:backend', 'scope:shared', 'type:app'],
    imports: 'infra',
    expect: 'pass',
    rule: 'the composition root is the one type that crosses contexts (ADR-003)',
  },
  {
    id: 'feat2',
    tags: ['platform:frontend', 'scope:incident', 'type:feature'],
    imports: 'sharedui',
    expect: 'pass',
    rule: 'a context feature may use the shared design system (ADR-010)',
  },

  // -- illegal: these must fail --------------------------------------------
  {
    id: 'p1',
    tags: ['platform:backend', 'scope:incident', 'type:domain'],
    imports: 'infra',
    expect: 'fail',
    rule: 'type matrix: domain may not reach infrastructure',
  },
  {
    id: 'p2',
    tags: ['platform:frontend', 'scope:incident', 'type:feature'],
    imports: 'beutil',
    expect: 'fail',
    rule: 'platform rule: frontend may not reach backend',
  },
  {
    id: 'p3',
    tags: ['platform:backend', 'scope:incident', 'type:domain'],
    imports: 'sladomain',
    expect: 'fail',
    rule: 'scope rule: no context-to-context edge',
  },
  {
    id: 'p4',
    tags: ['platform:backend', 'scope:incident'],
    imports: 'util',
    expect: 'fail',
    rule: 'exactly three tags, no exceptions (§5.2)',
  },
  {
    id: 'p5',
    tags: ['platform:backend', 'scope:incident', 'type:infrastructure'],
    imports: 'app',
    expect: 'fail',
    rule: 'nothing may depend on a type:app — the composition root is a sink',
  },
  {
    id: 'p6',
    tags: ['platform:backend', 'scope:incident', 'type:e2e'],
    imports: 'infra',
    expect: 'fail',
    rule: 'type:e2e may depend only on contracts and util',
  },
];

const projectName = (id) => `${PREFIX}-${id}`;
const aliasOf = (id) => `@${PREFIX}/${id}`;

function writeProject(id, tags, importsFrom) {
  const root = path.join(probeDir, id);
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'project.json'),
    JSON.stringify(
      {
        name: projectName(id),
        sourceRoot: `libs/${PREFIX}/${id}/src`,
        projectType: 'library',
        tags,
      },
      null,
      2,
    ) + '\n',
  );
  fs.writeFileSync(
    path.join(root, 'src', 'index.ts'),
    importsFrom
      ? `import { value } from '${aliasOf(importsFrom)}';\nexport const probe = value;\n`
      : `export const value = '${id}';\n`,
  );
  return [aliasOf(id), [`libs/${PREFIX}/${id}/src/index.ts`]];
}

function scaffold() {
  if (fs.existsSync(probeDir)) {
    throw new Error(
      `${probeDir} already exists — a previous run did not clean up. Remove it first.`,
    );
  }
  const aliases = [
    ...Object.entries(TARGETS).map(([id, tags]) =>
      writeProject(id, tags, null),
    ),
    ...SOURCES.map((s) => writeProject(s.id, s.tags, s.imports)),
  ];
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  tsconfig.compilerOptions.paths = {
    ...(tsconfig.compilerOptions.paths ?? {}),
    ...Object.fromEntries(aliases),
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
}

/** Removes only what this script created; never touches a real library. */
function teardown() {
  fs.rmSync(probeDir, { recursive: true, force: true });
  const libs = path.join(repoRoot, 'libs');
  if (fs.existsSync(libs) && fs.readdirSync(libs).length === 0) {
    fs.rmdirSync(libs);
  }
  fs.writeFileSync(tsconfigPath, originalTsconfig);
}

function lintPasses(project) {
  try {
    execFileSync(
      process.execPath,
      [
        path.join(repoRoot, 'node_modules', 'nx', 'bin', 'nx.js'),
        'lint',
        project,
        '--skip-nx-cache',
      ],
      {
        cwd: repoRoot,
        stdio: 'pipe',
        env: { ...process.env, NX_DAEMON: 'false' },
      },
    );
    return true;
  } catch {
    return false;
  }
}

let failures = 0;
try {
  scaffold();
  for (const probe of SOURCES) {
    const passed = lintPasses(projectName(probe.id));
    const asRequired = passed === (probe.expect === 'pass');
    if (!asRequired) failures++;
    console.log(
      [
        asRequired ? 'OK  ' : 'BAD ',
        probe.id.padEnd(9),
        `expected ${probe.expect.padEnd(4)}`,
        `-> lint ${(passed ? 'passed' : 'failed').padEnd(6)}`,
        probe.rule,
      ].join(' '),
    );
  }
} finally {
  teardown();
}

console.log(
  failures === 0
    ? `\nAll ${SOURCES.length} boundary probes behaved as ARCHITECTURE.md §5.3 requires. Scaffolding removed.`
    : `\n${failures} of ${SOURCES.length} probes did NOT behave as required — the boundary configuration has regressed. Scaffolding removed.`,
);
process.exit(failures === 0 ? 0 : 1);
