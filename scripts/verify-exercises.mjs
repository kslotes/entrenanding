// Verifica cada ejercicio de backend en los dos sentidos:
//   1. El código inicial compila y falla al menos uno de sus tests
//      (un ejercicio que ya pasa no enseña nada).
//   2. La solución de referencia pasa todos los tests.
//
// Uso: node scripts/verify-exercises.mjs
// Requiere JDK 25. Maven lo descarga el Maven Wrapper.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const backendDir = join(import.meta.dirname, "..", "exercises", "backend");
const isWindows = process.platform === "win32";
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

function listModules() {
  const pom = readFileSync(join(backendDir, "pom.xml"), "utf8");
  return [...pom.matchAll(/<module>([^<]+)<\/module>/g)].map((m) =>
    m[1].trim(),
  );
}

function readTestTotals(moduleDir) {
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

const problems = [];
const modules = listModules();

console.log(
  `\n== El código inicial debe compilar y fallar (${modules.length} ejercicios)\n`,
);
if (runMaven(["-Dmaven.test.failure.ignore=true", "clean", "test"]) !== 0) {
  problems.push("el código inicial no compila");
} else {
  for (const module of modules) {
    const { tests, failed } = readTestTotals(module);
    if (tests === 0) problems.push(`${module}: no se ejecutó ningún test`);
    else if (failed === 0)
      problems.push(`${module}: el código inicial ya pasa los ${tests} tests`);
  }
}

console.log("\n== Las soluciones de referencia deben pasar\n");
if (runMaven(["-Psolution", "clean", "test"]) !== 0) {
  problems.push(
    "una solución de referencia falla sus tests (ver la salida de Maven arriba)",
  );
}

if (problems.length > 0) {
  console.error("\nFalló la verificación de ejercicios:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`\nEjercicios de backend verificados: ${modules.length}.`);
