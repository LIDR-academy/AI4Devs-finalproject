import { afterEach, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { resolveRequest } from "./server";

let dir: string;
let distDir: URL;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "qc-portal-"));
  distDir = new URL(`${pathToFileURL(dir).href}/`);
  await Bun.write(new URL("index.html", distDir), "INDEX");
  await Bun.write(new URL("assets/app.js", distDir), "APP");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

test("resolves an existing asset to that file", async () => {
  const resolution = await resolveRequest("/assets/app.js", distDir);
  expect(resolution.kind).toBe("file");
  if (resolution.kind === "file") {
    expect(resolution.path.endsWith("/assets/app.js")).toBe(true);
  }
});

test("falls back for a client-side route with no file", async () => {
  expect(await resolveRequest("/stream/abc", distDir)).toEqual({ kind: "fallback" });
});

test("falls back at the root", async () => {
  expect(await resolveRequest("/", distDir)).toEqual({ kind: "fallback" });
});

test("reports the health check", async () => {
  expect(await resolveRequest("/healthz", distDir)).toEqual({ kind: "health" });
});

test("blocks path traversal and falls back", async () => {
  expect(await resolveRequest("/%2e%2e/%2e%2e/etc/passwd", distDir)).toEqual({ kind: "fallback" });
});
