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
//   content    every act's content holds together (Polish list #4):
//              doors and scene changes lead to scenes that exist, story
//              points stand in real scenes, enemy types are in the
//              catalogue, ids are unique, objective flags are set by
//              something, and nobody to reach stands behind a tree
//
// Since Polish list #3 the story check reads every act, not only Act I.
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
    lines.forEach((l, i) => {
      if (CONTROL.test(l)) errors.push(rel + ":" + (i + 1) + ": a control character");
      // An invisible byte order mark typed into the middle of a file
      // (an editor turning "\uFEFF" into the character itself, Polish
      // list): it is there, unseen, in every diff after.
      if (l.slice(i === 0 ? 1 : 0).includes("\uFEFF")) errors.push(rel + ":" + (i + 1) + ": a byte order mark");
    });
  }
  return { name: "every script compiles, and no text file holds a control character", ok: errors.length === 0, detail: errors };
}

const ACT_FILES = ["content/act1.js", "content/act2.js", "content/act3.js", "content/act4.js"];

// STORY.md is the script of the acts' content, changed with it. Read
// from the source rather than from the running game, so lines no test
// walks to (a repeat visit, a reload branch) are held to it too. Every
// act since Polish list #3: an act without lines passes, and Act II's
// are held to it the day they are written.
function story() {
  const text = read("STORY.md");
  const lines = [];
  let act1 = 0;
  for (const rel of ACT_FILES) {
    if (!fs.existsSync(path.join(ROOT, rel))) continue;
    const src = read(rel);
    const before = lines.length;
    for (const m of src.matchAll(/\b(?:text|waiting|thanks|after):\s*("(?:[^"\\]|\\.)*")/g)) lines.push(JSON.parse(m[1]));
    for (const m of src.matchAll(/playIntertitle\(\[([^\]]*)\]/g)) {
      for (const s of m[1].matchAll(/"(?:[^"\\]|\\.)*"/g)) lines.push(JSON.parse(s[0]));
    }
    if (rel === "content/act1.js") act1 = lines.length - before;
  }
  const missing = lines.filter((l) => !text.includes(l));
  return { name: "every line and black card of every act is in STORY.md (" + lines.length + ")",
           ok: act1 > 100 && missing.length === 0, detail: missing, count: lines.length };
}

// Polish list #4. The acts' content, loaded the way the page loads it
// (one shared global scope, script after script), and checked for the
// mistakes that otherwise only show when someone plays: a door to a
// scene that does not exist, a story point in one, an enemy type the
// catalogue lacks, a repeated id, an objective nothing completes, and
// someone the student must reach standing behind a shadow tree.
const PANEL_WIDTH = 1450;  // game.js, PANEL_WIDTH
const NPC_WIDTH = 80;      // game.js, NPC_WIDTH
const PLAYER_WIDTH = 40;   // game.js, PLAYER_WIDTH
const TRUNK = 90;          // half a trunk at head height, and a margin (Block 50)

function content() {
  const ctx = vm.createContext({ console });
  ctx.window = ctx;
  for (const rel of ["content/enemies.js", "content/items.js"].concat(ACT_FILES)) {
    if (fs.existsSync(path.join(ROOT, rel))) vm.runInContext(read(rel), ctx, { filename: rel });
  }
  const types = ctx.ENEMY_TYPES || {};
  const problems = [];
  ACT_FILES.forEach((rel, i) => {
    const act = ctx["ACT_" + (i + 1)];
    if (!act) return;
    const src = read(rel);
    const tag = "Act " + (i + 1);
    const scenes = Array.isArray(act.scenes) && act.scenes.length ? act.scenes : [];
    const ids = new Set(scenes.map((s) => s.id));
    if (ids.size !== scenes.length) problems.push(tag + ": two scenes share an id");

    for (const s of scenes) {
      const at = tag + ", " + s.id;
      for (const e of s.exits || []) {
        if (e.toScene && !ids.has(e.toScene)) problems.push(at + ": exit " + e.id + " leads to no scene \"" + e.toScene + "\"");
      }
      for (const kind of ["npcs", "decorations", "exits", "guards"]) {
        const seen = new Set();
        for (const x of s[kind] || []) {
          if (!x.id) continue;
          if (seen.has(x.id)) problems.push(at + ": two " + kind + " share the id " + x.id);
          seen.add(x.id);
        }
      }
      for (const g of s.guards || []) {
        if (g.type && !(types[g.type] && types[g.type].kind === "guard")) problems.push(at + ": guard type \"" + g.type + "\" is not a guard in content/enemies.js");
      }
      // Shadow trees stand at every multiple of the panel width.
      if (Array.isArray(s.panels) && s.panels.length) {
        const w = s.panelWidth || PANEL_WIDTH;
        for (let x = w; x < (s.worldWidth || 0); x += w) {
          for (const n of s.npcs || []) {
            if (n.scenery) continue;
            if (n.x < x + TRUNK && n.x + NPC_WIDTH > x - TRUNK) problems.push(at + ": " + n.id + " stands behind the tree at " + x);
          }
          for (const e of s.exits || []) {
            if (e.x < x + TRUNK && e.x + (e.width || 80) > x - TRUNK) problems.push(at + ": exit " + e.id + " is behind the tree at " + x);
          }
          for (const c of s.checkpoints || []) {
            if (Math.abs(c.x + PLAYER_WIDTH / 2 - x) < TRUNK + PLAYER_WIDTH / 2) problems.push(at + ": checkpoint " + c.x + " is behind the tree at " + x);
          }
        }
      }
    }
    // Scene changes in scripts name scenes by string.
    for (const m of src.matchAll(/gotoScene\(\s*["']([^"']+)["']/g)) {
      if (!ids.has(m[1])) problems.push(tag + ": gotoScene(\"" + m[1] + "\") names no scene");
    }
    // spawnEnemies({ type }) in scripts.
    for (const m of src.matchAll(/type:\s*["']([\w-]+)["']/g)) {
      if (!(m[1] in types) && !/^(heart|hint)$/.test(m[1])) problems.push(tag + ": type \"" + m[1] + "\" is not in content/enemies.js");
    }
    for (const j of act.devJumps || []) {
      const scene = scenes.find((s) => s.id === j.scene);
      if (!scene) problems.push(tag + ": story point " + j.id + " is in no scene \"" + j.scene + "\"");
      else if (typeof j.x === "number" && (j.x < 0 || j.x > (scene.worldWidth || 0))) problems.push(tag + ": story point " + j.id + " stands off the road");
    }
    const objIds = new Set();
    for (const o of act.objectives || []) {
      if (objIds.has(o.id)) problems.push(tag + ": two objectives share the id " + o.id);
      objIds.add(o.id);
      // Set by something: the flag's name appears in the source besides
      // the objective itself, or through a constant that holds it.
      const quoted = (src.match(new RegExp("[\"'`]" + o.flag + "[\"'`]", "g")) || []).length;
      const dotted = (src.match(new RegExp("flags\\." + o.flag + "\\b", "g")) || []).length;
      const viaConst = [...src.matchAll(new RegExp("const\\s+([A-Z_][\\w]*)\\s*=\\s*[\"']" + o.flag + "[\"']", "g"))]
        .some((c) => (src.match(new RegExp("\\b" + c[1] + "\\b", "g")) || []).length > 1);
      // A flag named as a gift's givenFlag, a script's doneFlag, an item's
      // buyFlag or a job's first round (first, full, earned) is set by the
      // code that reads that field.
      const bySetter = new RegExp("\\b(?:givenFlag|doneFlag|buyFlag|first|full|earned)\\s*:\\s*[\"']" + o.flag + "[\"']").test(src);
      if (quoted < 2 && dotted === 0 && !viaConst && !bySetter) problems.push(tag + ": nothing sets objective " + o.id + "'s flag " + o.flag);
    }
  });
  return { name: "every act's content holds together: doors, story points, types, ids, objectives, trees",
           ok: problems.length === 0, detail: problems };
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

const ALL = { syntax, story, content, art, manifest, stamps, shrunk };

function runAll() {
  return Object.keys(ALL).map((k) => {
    try { return ALL[k](); } catch (err) { return { name: k, ok: false, detail: String(err && err.stack || err) }; }
  });
}

module.exports = Object.assign({ runAll }, ALL);
