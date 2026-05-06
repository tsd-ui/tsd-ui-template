#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

const inputDir = process.argv[2] || ".";
const outputDir = resolve(process.argv[3] || "report-site");

function loadReports(dir) {
  const files = readdirSync(resolve(dir)).filter(
    (f) => f.startsWith("conformance-report-") && f.endsWith(".json"),
  );
  return files.map((f) => JSON.parse(readFileSync(resolve(dir, f), "utf-8")));
}

function statusIcon(status) {
  switch (status) {
    case "match":
      return "✅";
    case "version-drift":
      return "⚠️";
    case "alternative":
      return "🔄";
    case "missing":
      return "❌";
    default:
      return "❓";
  }
}

function statusClass(status) {
  switch (status) {
    case "match":
      return "match";
    case "version-drift":
      return "drift";
    case "alternative":
      return "alt";
    case "missing":
      return "missing";
    default:
      return "";
  }
}

function resultDescription(r) {
  switch (r.status) {
    case "match":
      return `${r.actual}`;
    case "version-drift":
      return `${r.actual} (template: ${r.expected})`;
    case "alternative":
      return `${r.alternative.name} ${r.alternative.version} (template uses ${r.tool} ${r.expected})`;
    case "missing":
      return `not found (template: ${r.expected})`;
    default:
      return "unknown";
  }
}

function generateHtml(reports) {
  const timestamp = reports[0]?.timestamp
    ? new Date(reports[0].timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : new Date().toISOString();

  const repoSections = reports
    .map((report) => {
      const rows = report.results
        .map(
          (r) => `
        <tr class="${statusClass(r.status)}">
          <td>${statusIcon(r.status)}</td>
          <td><code>${r.tool}</code></td>
          <td>${r.category}</td>
          <td>${resultDescription(r)}</td>
        </tr>`,
        )
        .join("\n");

      const { summary } = report;

      return `
      <section class="repo">
        <h2>
          ${report.repo}
          <span class="badge badge-match">${summary.matches} match</span>
          <span class="badge badge-drift">${summary.drifted} drift</span>
          <span class="badge badge-alt">${summary.alternatives} alt</span>
          <span class="badge badge-missing">${summary.missing} missing</span>
        </h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Tool</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tooling Conformance Report</title>
  <style>
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --text-muted: #8b949e;
      --green: #3fb950;
      --yellow: #d29922;
      --blue: #58a6ff;
      --red: #f85149;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 2rem;
      max-width: 960px;
      margin: 0 auto;
    }
    h1 { margin-bottom: 0.25rem; }
    .subtitle { color: var(--text-muted); margin-bottom: 2rem; }
    .repo { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .repo h2 { margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; font-weight: 500; }
    .badge-match { background: #23863620; color: var(--green); }
    .badge-drift { background: #d2992220; color: var(--yellow); }
    .badge-alt { background: #58a6ff20; color: var(--blue); }
    .badge-missing { background: #f8514920; color: var(--red); }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem; }
    td { padding: 0.5rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    td:first-child { width: 2rem; text-align: center; }
    tr:last-child td { border-bottom: none; }
    tr.match td { color: var(--green); }
    tr.drift td { color: var(--yellow); }
    tr.alt td { color: var(--blue); }
    tr.missing td { color: var(--red); }
    code { background: #ffffff10; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <h1>Tooling Conformance Report</h1>
  <p class="subtitle">Last updated: ${timestamp}</p>
  ${repoSections}
</body>
</html>`;
}

function main() {
  const reports = loadReports(inputDir);

  if (reports.length === 0) {
    console.error(
      `No conformance-report-*.json files found in ${resolve(inputDir)}`,
    );
    process.exit(1);
  }

  mkdirSync(outputDir, { recursive: true });

  const html = generateHtml(reports);
  const outputFile = join(outputDir, "index.html");
  writeFileSync(outputFile, html);

  const dataFile = join(outputDir, "data.json");
  writeFileSync(dataFile, JSON.stringify(reports, null, 2));

  console.log(`Report generated: ${outputFile}`);
  console.log(`Data file: ${dataFile}`);
  console.log(`${reports.length} repo(s) included`);
}

main();
