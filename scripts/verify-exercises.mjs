// Checks every backend exercise in both directions:
//   1. The starter code compiles and at least one of its tests fails
//      (an exercise that already passes teaches nothing).
//   2. The reference solution passes every test.
//
// Usage: node scripts/verify-exercises.mjs
// Requires JDK 25. Maven is downloaded by the Maven Wrapper.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const backendDir = join(import.meta.dirname, "..", "exercises", "backend");
const isWindows = process.platform === "win32";
// Absolute path: cmd.exe may skip the current directory when resolving commands.
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
  `\n== Starter code must compile and fail (${modules.length} exercises)\n`,
);
if (runMaven(["-Dmaven.test.failure.ignore=true", "clean", "test"]) !== 0) {
  problems.push("starter code does not build (compilation error?)");
} else {
  for (const module of modules) {
    const { tests, failed } = readTestTotals(module);
    if (tests === 0) problems.push(`${module}: no tests ran`);
    else if (failed === 0)
      problems.push(
        `${module}: starter code already passes all ${tests} tests`,
      );
  }
}

console.log("\n== Reference solutions must pass\n");
if (runMaven(["-Psolution", "clean", "test"]) !== 0) {
  problems.push(
    "a reference solution fails its tests (see the Maven output above)",
  );
}

if (problems.length > 0) {
  console.error("\nExercise verification failed:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`\nAll ${modules.length} backend exercises verified.`);
