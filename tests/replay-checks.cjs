#!/usr/bin/env node
// Runs the lab's own content checks outside a browser.
// Usage: node tests/replay-checks.cjs   (exits with code 1 if anything fails)

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const start = html.lastIndexOf("<script>");
const end = html.lastIndexOf("</script>");
if (start < 0 || end < 0) { console.error("Could not find the app script in index.html"); process.exit(1); }

// Drop the final render() call: these checks need the logic, not the page.
const code = html.slice(start + "<script>".length, end).replace(/\nrender\(\);\s*$/, "\n");

const memory = {};
const sandbox = {
  console,
  localStorage: { getItem: k => (k in memory ? memory[k] : null), setItem: (k, v) => { memory[k] = String(v); }, removeItem: k => { delete memory[k]; } },
  CSS: { escape: s => String(s) },
  document: { documentElement: {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, activeElement: null },
  window: { scrollY: 0, scrollTo() {}, innerWidth: 1280 },
  navigator: {},
  setTimeout() {}
};
vm.createContext(sandbox);

const exported = "\n;globalThis.__lab = { CASES, VALIDATION, LAB, LAB_ERRORS, MODEL_CHECKS, engineChecks, simulate, ALL_CFGS };";
vm.runInContext(code + exported, sandbox, { filename: "index.html" });
const { CASES, VALIDATION, LAB, LAB_ERRORS, MODEL_CHECKS, engineChecks, simulate, ALL_CFGS } = sandbox.__lab;

let failures = 0;
const report = (ok, label) => { console.log(`${ok ? "PASS" : "FAIL"}  ${label}`); if (!ok) failures++; };

CASES.forEach(c => report(VALIDATION[c.id].length === 0, `Case content: ${c.id} v${c.version}${VALIDATION[c.id].length ? " (" + VALIDATION[c.id].join("; ") + ")" : ""}`));
report(LAB_ERRORS.length === 0, `Workflow lab content: ${LAB.id} v${LAB.version}${LAB_ERRORS.length ? " (" + LAB_ERRORS.join("; ") + ")" : ""}`);
MODEL_CHECKS.forEach(c => report(c.pass, `Model check: ${c.q}`));
engineChecks().forEach(([name, ok]) => report(ok, `Engine check: ${name}`));

const tally = { base: {}, stress: {} };
let crashed = 0;
ALL_CFGS.forEach(cfg => [false, true].forEach(stress => {
  try {
    const r = simulate(cfg, stress);
    const k = stress ? "stress" : "base";
    tally[k][r.outcome.kind] = (tally[k][r.outcome.kind] || 0) + 1;
  } catch (e) { crashed++; console.log("FAIL  Replay crashed: " + JSON.stringify(cfg) + (stress ? " (stress)" : "") + ": " + e.message); }
}));
report(crashed === 0, `All ${ALL_CFGS.length * 2} replays run (${ALL_CFGS.length} designs, base and stress)`);
console.log("\nOutcome counts (authored model, not real-world rates):");
console.log("  base:  ", JSON.stringify(tally.base));
console.log("  stress:", JSON.stringify(tally.stress));

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
