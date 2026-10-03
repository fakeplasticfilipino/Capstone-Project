// =============================================================
// MACARIO — _dev/tools/prepare.js (Block 106)
//
// The one command before every commit:
//
//   node _dev/tools/prepare.js           fix what a tool can fix, then check
//   node _dev/tools/prepare.js --check   check only, change nothing
//
// What it fixes, in this order (each step's output is the next one's
// input): every sheet in assets/ not yet shrunk is shrunk
// (shrink-sprites.js); js/asset-manifest.js is rewritten with every file
// and its fingerprint (make-asset-manifest.js); every stylesheet and page
// is stamped with its files' fingerprints (lib/stamp.js). Then it runs
// the checks that need no browser (lib/checks.js): every script
// compiles, STORY.md has every act's lines, every act's content holds
// together (doors, story points, enemy types, ids, objectives, trees),
// ART.md's Owed list is right, the manifest, the stamps, the sheets. A
// few seconds in all.
//
// So the steps a change used to need by hand (bump a ?v=, bump
// ASSET_VERSION, run the manifest tool, remember to shrink a new sheet)
// are one command, and a forgotten one is caught here, in the pre-commit
// hook (_dev/hooks/pre-commit, which runs --check), and in the first,
// minute-long CI job, before the two suites spend twelve minutes on it.
// What it cannot fix (a line missing from STORY.md, ART.md out of date,
// a syntax error) it names, and exits 1.
// =============================================================

"use strict";

const path = require("path");
const checks = require("./lib/checks.js");

const check = process.argv.includes("--check");

function fix() {
  const { decodePng } = require("./lib/png.js");
  const { shrink } = require("./shrink-sprites.js");
  const { listAssets, writeManifest } = require("./make-asset-manifest.js");
  const { stampAll } = require("./lib/stamp.js");
  const root = path.join(__dirname, "..", "..");
  const sheets = listAssets().filter((f) => /\.png$/i.test(f) && !/-still\.png$/i.test(f))
    .filter((f) => !decodePng(path.join(root, f)).shrunk);
  for (const f of sheets) {
    const r = shrink(path.join(root, f));
    console.log(`  shrunk ${f}: ${Math.round(r.before / 1024)}K -> ${Math.round(r.after / 1024)}K, ${r.kind}`);
  }
  if (writeManifest()) console.log("  wrote js/asset-manifest.js");
  const stamped = stampAll(true);
  if (stamped.changed.length) console.log("  stamped " + stamped.changed.join(", "));
}

if (!check) fix();
const results = checks.runAll();
let failed = 0;
for (const r of results) {
  console.log((r.ok ? "  ok    " : "  FAIL  ") + r.name);
  if (!r.ok) {
    failed++;
    console.log("        " + JSON.stringify(r.detail, null, 1).replace(/\n\s*/g, " ").slice(0, 1200));
  }
}
if (failed && check) console.log("\nnode _dev/tools/prepare.js fixes the manifest, the stamps and the sheets; the rest is by hand.");
process.exit(failed ? 1 : 0);
