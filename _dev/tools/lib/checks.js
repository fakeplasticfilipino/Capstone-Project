// =============================================================
// MACARIO — _dev/tools/lib/checks.js (Block 106)
//
// The checks that need no browser, in one place: they take seconds,
// so prepare.js runs them before every commit (and the pre-commit hook
// and the first CI job run prepare.js --check), and verify_new_scene.js
// runs the same functions, so the two can never disagree about what
// "right" is. Each returns { name, ok, detail }.
//
//   syntax     every script the site or the tools load compiles
//   story      every line and black card of content/act1.js is in
//              STORY.md (Block 61)
//   art        ART.md's Owed list is exactly the art that is missing
//              (Block 77)
//   manifest   js/asset-manifest.js lists exactly assets/, each file
//              with its current fingerprint (Blocks 78, 106)
//   stamps     every page and stylesheet names its files with their
//              current fingerprints (Block 106)
//   shrunk     every sheet has been through shrink-sprites.js (Block 105)
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "..", "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

function jsFiles() {
  const out = ["sw.js"];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir + "/" + e.name;
      if (e.isDirectory()) walk(rel);
      else if (/\.js$/.test(e.name)) out.push(rel);
    }
  };
  ["js", "content", "_dev/tools", "_dev/tests", "_dev/rigs"].forEach((d) => {
    if (fs.existsSync(path.join(ROOT, d))) walk(d);
  });
  return out;
}

// A control character (a backspace, an escape) in source compiles and
// does something nobody wrote: a regex with a backspace in it matched
// nothing in Block 108, and nothing failed. Tab, CR and LF are allowed.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

function syntax() {
  const errors = [];
  const text = jsFiles().concat(["index.html", "teacher.html"],
    fs.readdirSync(path.join(ROOT, "css")).map((f) => "css/" + f),
    fs.readdirSync(ROOT).filter((f) => /\.md$/.test(f)));
  for (const rel of jsFiles()) {
    try {
      new vm.Script(read(rel), { filename: rel });
    } catch (err) {
      errors.push(rel + ": " + err.message);
    }
  }
  for (const rel of text) {
    if (rel.startsWith("js/vendor/")) continue; // another project's minified code
    const lines = read(rel).split("\n");
    lines.forEach((l, i) => { if (CONTROL.test(l)) errors.push(rel + ":" + (i + 1) + ": a control character"); });
  }
  return { name: "every script compiles, and no text file holds a control character", ok: errors.length === 0, detail: errors };
}

// STORY.md is the script of content/act1.js, changed with it. Read from
// the source rather than from the running game, so lines no test walks
// to (a repeat visit, a reload branch) are held to it too.
function story() {
  const src = read("content/act1.js");
  const text = read("STORY.md");
  const lines = [];
  for (const m of src.matchAll(/\b(?:text|waiting|thanks|after):\s*("(?:[^"\\]|\\.)*")/g)) lines.push(JSON.parse(m[1]));
  for (const m of src.matchAll(/playIntertitle\(\[([^\]]*)\]/g)) {
    for (const s of m[1].matchAll(/"(?:[^"\\]|\\.)*"/g)) lines.push(JSON.parse(s[0]));
  }
  const missing = lines.filter((l) => !text.includes(l));
  return { name: "every line and black card in content/act1.js is in STORY.md (" + lines.length + ")",
           ok: lines.length > 100 && missing.length === 0, detail: missing, count: lines.length };
}

// ART.md's Owed list is every picture the game asks for that is not on
// disk: nothing missing and unlisted, nothing listed and already arrived.
function art() {
  const { findArt } = require(path.join(ROOT, "_dev", "tools", "missing-art.js"));
  const missing = findArt().filter((a) => !a.exists).map((a) => a.file);
  const md = read("ART.md").replace(/\r\n/g, "\n");
  const owed = (md.split("\n## Owed")[1] || "").split("\n## ")[0];
  const listed = [...new Set([...owed.matchAll(/assets\/\S+\.(?:png|jpe?g)/gi)].map((m) => m[0]))];
  const unlisted = missing.filter((f) => !listed.includes(f));
  const arrived = listed.filter((f) => !missing.includes(f));
  return { name: "ART.md's Owed list is exactly the art still missing (" + missing.length + ")",
           ok: unlisted.length === 0 && arrived.length === 0, detail: { unlisted, arrived }, missing };
}

function manifest() {
  const { manifestDrift } = require(path.join(ROOT, "_dev", "tools", "make-asset-manifest.js"));
  const d = manifestDrift();
  return { name: "js/asset-manifest.js lists exactly the files in assets/, fingerprinted (" + d.count + ")",
           ok: !d.notListed.length && !d.gone.length && !d.stale.length,
           detail: { notListed: d.notListed, gone: d.gone, stale: d.stale } };
}

function stamps() {
  const { stampAll } = require("./stamp.js");
  const r = stampAll(false);
  return { name: "every page and stylesheet names its files by their current fingerprint",
           ok: r.changed.length === 0 && r.misses.length === 0, detail: { stale: r.changed, notFound: r.misses } };
}

function shrunk() {
  const { decodePng } = require("./png.js");
  const { listAssets } = require(path.join(ROOT, "_dev", "tools", "make-asset-manifest.js"));
  const left = listAssets().filter((f) => /\.png$/i.test(f) && !/-still\.png$/i.test(f))
    .filter((f) => !decodePng(path.join(ROOT, f)).shrunk);
  return { name: "every sheet in assets/ has been through shrink-sprites.js", ok: left.length === 0, detail: left };
}

const ALL = { syntax, story, art, manifest, stamps, shrunk };

function runAll() {
  return Object.keys(ALL).map((k) => {
    try { return ALL[k](); } catch (err) { return { name: k, ok: false, detail: String(err && err.stack || err) }; }
  });
}

module.exports = Object.assign({ runAll }, ALL);
