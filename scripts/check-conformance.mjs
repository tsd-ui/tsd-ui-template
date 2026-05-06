#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import semver from "semver";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const ALTERNATIVE_MAPPINGS = {
  "@biomejs/biome": { replaces: ["eslint", "prettier"] },
  biome: { replaces: ["eslint", "prettier"] },
  "@rsbuild/core": { replaces: ["vite"] },
  rsbuild: { replaces: ["vite"] },
  jest: { replaces: ["vitest", "@vitest/coverage-v8"] },
  "ts-jest": { replaces: ["vitest", "@vitest/coverage-v8"] },
};

const TRACKED_TOOLS = [
  { name: "eslint", category: "linting" },
  { name: "prettier", category: "formatting" },
  { name: "vite", category: "bundler" },
  { name: "vitest", category: "testing" },
  { name: "@vitest/coverage-v8", category: "testing" },
  { name: "typescript", category: "language" },
  { name: "react", category: "framework" },
  { name: "react-dom", category: "framework" },
  { name: "@tanstack/react-query", category: "data-fetching" },
  { name: "@patternfly/react-core", category: "ui" },
];

function npmPkgGet(fields, baseDir, workspaces) {
  const args = ["npm", "pkg", "get", ...fields, "--json"];
  if (workspaces) args.push("--workspaces");
  try {
    return JSON.parse(
      execSync(args.join(" "), { cwd: baseDir, encoding: "utf-8" }),
    );
  } catch {
    return {};
  }
}

function collectDepsFromDir(baseDir) {
  const fields = ["dependencies", "devDependencies", "peerDependencies", "engines"];
  const deps = {};
  let engines = {};

  const root = npmPkgGet(fields, baseDir, false);
  Object.assign(deps, root.dependencies, root.devDependencies, root.peerDependencies);
  engines = { ...engines, ...root.engines };

  const workspaces = npmPkgGet(fields, baseDir, true);
  for (const ws of Object.values(workspaces)) {
    Object.assign(deps, ws.dependencies, ws.devDependencies, ws.peerDependencies);
    engines = { ...engines, ...ws.engines };
  }

  return { deps, engines };
}

function findAlternative(toolName, deps) {
  for (const [name, { replaces }] of Object.entries(ALTERNATIVE_MAPPINGS)) {
    if (replaces.includes(toolName) && deps[name]) {
      return { name, version: deps[name] };
    }
  }
  return null;
}

function versionsCompatible(templateRange, downstreamRange) {
  const templateMin = semver.minVersion(templateRange);
  const downstreamMin = semver.minVersion(downstreamRange);
  if (!templateMin || !downstreamMin) return false;
  return semver.major(templateMin) === semver.major(downstreamMin);
}

function compareDeps(template, downstream) {
  const results = [];

  for (const { name, category } of TRACKED_TOOLS) {
    const expected = template.deps[name];
    if (!expected) continue;

    const actual = downstream.deps[name];
    if (actual) {
      const compatible =
        actual === expected || versionsCompatible(expected, actual);
      results.push({
        tool: name,
        category,
        status: compatible ? "match" : "version-drift",
        expected,
        actual,
      });
    } else {
      const alt = findAlternative(name, downstream.deps);
      results.push(
        alt
          ? { tool: name, category, status: "alternative", expected, actual: null, alternative: alt }
          : { tool: name, category, status: "missing", expected, actual: null },
      );
    }
  }

  if (template.engines.node) {
    const actual = downstream.engines.node;
    results.push({
      tool: "node",
      category: "engine",
      status: actual ? (actual === template.engines.node ? "match" : "version-drift") : "missing",
      expected: template.engines.node,
      actual: actual || null,
    });
  }

  return results;
}

function printReport(repo, results) {
  console.log(`\n## ${repo}\n`);
  for (const r of results) {
    if (r.status === "match") {
      console.log(`  ✅ ${r.tool}: ${r.actual} (matches template)`);
    } else if (r.status === "version-drift") {
      console.log(`  ⚠️  ${r.tool}: ${r.actual} (template: ${r.expected})`);
    } else if (r.status === "alternative") {
      console.log(
        `  ⚠️  ${r.tool}: using ${r.alternative.name} ${r.alternative.version} instead (template uses ${r.tool} ${r.expected})`,
      );
    } else if (r.status === "missing") {
      console.log(`  ❌ ${r.tool}: not found (template: ${r.expected})`);
    }
  }
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: check-conformance.mjs <directory>");
    console.error("Example:");
    console.error("  check-conformance.mjs /path/to/trustify-ui");
    process.exit(1);
  }

  const dir = resolve(target);
  const repositoryName = basename(dir);

  console.log(`Checking conformance for ${repositoryName} (${dir})...`);

  const template = collectDepsFromDir(rootDir);
  const repository = collectDepsFromDir(dir);

  if (Object.keys(repository.deps).length === 0) {
    console.error(`Error: Could not read any package.json from ${target}`);
    process.exit(1);
  }

  const results = compareDeps(template, repository);

  printReport(repositoryName, results);

  const report = {
    repo: repositoryName,
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      matches: results.filter((r) => r.status === "match").length,
      drifted: results.filter((r) => r.status === "version-drift").length,
      alternatives: results.filter((r) => r.status === "alternative").length,
      missing: results.filter((r) => r.status === "missing").length,
    },
  };

  const safeRepoName = repositoryName.replace(/\//g, "-");
  const outputFile = `conformance-report-${safeRepoName}.json`;
  writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${outputFile}`);
}

main();
