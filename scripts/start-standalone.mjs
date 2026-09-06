/**
 * Arranca el **artefacto de despliegue real**: el servidor autónomo que produce
 * `output: "standalone"` (ADR-0001 §5, VM única + systemd).
 *
 * `next start` también sirve un build de producción, pero avisa —con razón— de que no
 * es lo que se despliega: el servidor autónomo trae su propio `node_modules` mínimo y
 * **no copia los assets estáticos**, que es trabajo del despliegue. Si esa copia falta,
 * las páginas responden 200 y el navegador se queda sin CSS ni JS. Vale más que eso
 * salga en el E2E que en la VM.
 *
 * Uso: `node scripts/start-standalone.mjs [--port 3100]`.
 */
import { cp, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const ROOT = process.cwd();
const STANDALONE = resolve(ROOT, ".next/standalone");

const portFlag = process.argv.indexOf("--port");
const port = portFlag === -1 ? (process.env.PORT ?? "3000") : process.argv[portFlag + 1];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(resolve(STANDALONE, "server.js")))) {
  console.error(
    "No hay build autónomo en .next/standalone. Ejecuta `npm run build` antes."
  );
  process.exit(1);
}

// Los dos directorios que `next build` deja fuera del paquete autónomo a propósito.
await cp(resolve(ROOT, ".next/static"), resolve(STANDALONE, ".next/static"), {
  recursive: true,
});
if (await exists(resolve(ROOT, "public"))) {
  await cp(resolve(ROOT, "public"), resolve(STANDALONE, "public"), { recursive: true });
}

const server = spawn(process.execPath, [resolve(STANDALONE, "server.js")], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port), HOSTNAME: "127.0.0.1" },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
server.on("exit", (code) => process.exit(code ?? 0));
