// Verifica cada ejercicio en los dos sentidos:
//   1. El código inicial compila y falla al menos uno de sus tests
//      (un ejercicio que ya pasa no enseña nada).
//   2. La solución de referencia pasa todos los tests.
//
// Uso: node scripts/verify-exercises.mjs [backend|frontend]
// Sin argumento verifica las dos áreas.
// Backend requiere JDK 25 (Maven lo descarga el Maven Wrapper).
// Frontend requiere las dependencias instaladas (`pnpm install`).

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const isWindows = process.platform === "win32";
const areas = process.argv.slice(2);
const problems = [];

// --- Backend: Maven ---------------------------------------------------------

const backendDir = join(root, "exercises", "backend");
// Ruta absoluta: cmd.exe puede no buscar comandos en el directorio actual.
const mvnw = isWindows ? `"${join(backendDir, "mvnw.cmd")}"` : "./mvnw";

function runMaven(args) {
  const result = spawnSync(mvnw, ["-B", "-ntp", ...args], {
    cwd: backendDir,
    stdio: "inherit",
    shell: isWindows,
  });
  if (result.error) throw result.error;
  return result.status;
}

function listMavenModules() {
  const pom = readFileSync(join(backendDir, "pom.xml"), "utf8");
  return [...pom.matchAll(/<module>([^<]+)<\/module>/g)].map((m) =>
    m[1].trim(),
  );
}

function readSurefireTotals(moduleDir) {
  const reportsDir = join(backendDir, moduleDir, "target", "surefire-reports");
  const totals = { tests: 0, failed: 0 };
  if (!existsSync(reportsDir)) return totals;
  for (const file of readdirSync(reportsDir)) {
    if (!/^TEST-.*\.xml$/.test(file)) continue;
    const xml = readFileSync(join(reportsDir, file), "utf8");
    const suite = xml.match(/<testsuite\b[^>]*>/)?.[0] ?? "";
    const attr = (name) =>
      Number(suite.match(new RegExp(`\\b${name}="(\\d+)"`))?.[1] ?? 0);
    totals.tests += attr("tests");
    totals.failed += attr("failures") + attr("errors");
  }
  return totals;
}

function verifyBackend() {
  const modules = listMavenModules();
  requireStatements(backendDir, modules);

  console.log(
    `\n== Backend: el código inicial debe compilar y fallar (${modules.length} ejercicios)\n`,
  );
  if (runMaven(["-Dmaven.test.failure.ignore=true", "clean", "test"]) !== 0) {
    problems.push("backend: el código inicial no compila");
  } else {
    for (const module of modules) {
      const { tests, failed } = readSurefireTotals(module);
      if (tests === 0) problems.push(`${module}: no se ejecutó ningún test`);
      else if (failed === 0)
        problems.push(
          `${module}: el código inicial ya pasa los ${tests} tests`,
        );
    }
  }

  console.log("\n== Backend: las soluciones de referencia deben pasar\n");
  if (runMaven(["-Psolution", "clean", "test"]) !== 0) {
    problems.push(
      "backend: una solución de referencia falla sus tests (ver la salida de Maven arriba)",
    );
  }
  return modules.length;
}

// --- Frontend: Vitest -------------------------------------------------------

const frontendDir = join(root, "exercises", "frontend");
const vitestBin = join(root, "node_modules", "vitest", "vitest.mjs");

// Every folder at exercises/frontend/<group>/<slug>/ is an exercise.
function listFrontendExercises() {
  if (!existsSync(frontendDir)) return [];
  return readdirSync(frontendDir, { withFileTypes: true })
    .filter((group) => group.isDirectory())
    .flatMap((group) =>
      readdirSync(join(frontendDir, group.name), { withFileTypes: true })
        .filter((slug) => slug.isDirectory())
        .map((slug) => `${group.name}/${slug.name}`),
    );
}

function requireStatements(dir, exercises) {
  for (const exercise of exercises) {
    if (!existsSync(join(dir, exercise, "statement.md")))
      problems.push(`${exercise}: falta statement.md`);
  }
}

// Runs every frontend exercise once and returns per-exercise totals.
function runVitest(mode) {
  const outDir = mkdtempSync(join(tmpdir(), "verify-exercises-"));
  const outputFile = join(outDir, "results.json");
  try {
    const args = [
      vitestBin,
      "run",
      "--config",
      "vitest.exercises.config.ts",
      "--reporter=default",
      "--reporter=json",
      `--outputFile.json=${outputFile}`,
    ];
    if (mode === "solution") args.push("--mode", "solution");
    const result = spawnSync(process.execPath, args, {
      cwd: root,
      stdio: "inherit",
    });
    if (result.error) throw result.error;

    const totals = new Map();
    if (!existsSync(outputFile)) return { status: result.status, totals };
    const report = JSON.parse(readFileSync(outputFile, "utf8"));
    for (const file of report.testResults ?? []) {
      const name = file.name.replaceAll("\\", "/");
      const exercise = /\/exercises\/frontend\/([^/]+\/[^/]+)\//.exec(
        name,
      )?.[1];
      if (!exercise) continue;
      const entry = totals.get(exercise) ?? { tests: 0, failed: 0, broken: 0 };
      const assertions = file.assertionResults ?? [];
      entry.tests += assertions.length;
      entry.failed += assertions.filter((a) => a.status === "failed").length;
      // A test file that cannot load reports no assertions.
      if (file.status === "failed" && assertions.length === 0) entry.broken++;
      totals.set(exercise, entry);
    }
    return { status: result.status, totals };
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

function verifyFrontend() {
  const exercises = listFrontendExercises();
  requireStatements(frontendDir, exercises);

  console.log(
    `\n== Frontend: el código inicial debe cargar y fallar (${exercises.length} ejercicios)\n`,
  );
  const starter = runVitest("starter");
  for (const exercise of exercises) {
    const totals = starter.totals.get(exercise);
    if (!totals || totals.tests + totals.broken === 0)
      problems.push(`${exercise}: no se ejecutó ningún test`);
    else if (totals.broken > 0)
      problems.push(`${exercise}: un archivo de tests no carga`);
    else if (totals.failed === 0)
      problems.push(
        `${exercise}: el código inicial ya pasa los ${totals.tests} tests`,
      );
  }

  console.log("\n== Frontend: las soluciones de referencia deben pasar\n");
  const solution = runVitest("solution");
  if (solution.status !== 0) {
    problems.push(
      "frontend: una solución de referencia falla sus tests (ver la salida de Vitest arriba)",
    );
  }
  return exercises.length;
}

// --- Main -------------------------------------------------------------------

const runAll = areas.length === 0;
const unknown = areas.filter((a) => a !== "backend" && a !== "frontend");
if (unknown.length > 0) {
  console.error(
    `Área desconocida: ${unknown.join(", ")}. Usa backend o frontend.`,
  );
  process.exit(2);
}

const verified = [];
if (runAll || areas.includes("backend"))
  verified.push(`backend: ${verifyBackend()}`);
if (runAll || areas.includes("frontend"))
  verified.push(`frontend: ${verifyFrontend()}`);

if (problems.length > 0) {
  console.error("\nFalló la verificación de ejercicios:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`\nEjercicios verificados (${verified.join(", ")}).`);
