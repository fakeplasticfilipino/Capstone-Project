// =============================================================
// MACARIO — _dev/tools/missing-art.js
//
// Every picture the game asks for, and which of them do not exist yet
// (Block 77). A missing picture is drawn as the dashed placeholder box
// with its file name on it, which is the design, but it means a
// character, a pose or a backdrop is still owed by the artist. ART.md
// is the list of them; this finds them, so the list can be checked
// rather than remembered.
//
// Where it looks:
//
//   content    content/enemies.js, act1.js to act4.js and items.js,
//              run the way the page runs them (they only set window.*),
//              and every string under assets/ ending .png or .jpg found
//              in what they declare, with the id or label of whoever
//              uses it.
//   engine     js/game.js, its code lines only (not comments): Macario's
//              own sheets and the fallback backdrops.
//   styles     css/style.css, its url()s.
//
// Run:  node _dev/tools/missing-art.js
//
// Prints every missing picture and who uses it. verify_new_scene.js
// runs the same search (require("./missing-art.js").findArt) and fails
// if ART.md's "Owed" list and the files on disk disagree.
//
// Depends on nothing outside Node.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "..");
const CONTENT = ["content/enemies.js", "content/act1.js", "content/act2.js",
  "content/act3.js", "content/act4.js", "content/items.js"];
const PICTURE = /^assets\/.+\.(png|jpe?g)$/i;

function findArt() {
  const uses = new Map(); // file -> Set of who
  const add = (file, who) => {
    if (!uses.has(file)) uses.set(file, new Set());
    uses.get(file).add(who);
  };

  // Content, as the page runs it.
  const window = {};
  const context = vm.createContext({ window, console, Math, Object, Array, JSON, Promise, setTimeout });
  for (const rel of CONTENT) {
    const file = path.join(ROOT, rel);
    if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: rel });
  }
  const seen = new Set();
  const walk = (v, who, where) => {
    if (typeof v === "string") {
      if (PICTURE.test(v)) add(v, who + " (" + where + ")");
      return;
    }
    if (!v || typeof v !== "object" || seen.has(v)) return;
    seen.add(v);
    const name = v.label || v.name || v.id;
    const here = name && typeof name === "string" ? name : who;
    for (const k of Object.keys(v)) walk(v[k], here, where);
  };
  for (const key of Object.keys(window)) {
    const where = key === "ENEMY_TYPES" ? "enemy catalogue" : key === "ITEMS" ? "item catalogue"
      : /^ACT_\d$/.test(key) ? "Act " + ["", "I", "II", "III", "IV"][Number(key.slice(4))] : key;
    if (key === "ENEMY_TYPES") {
      for (const [type, def] of Object.entries(window.ENEMY_TYPES)) walk(def, type, where);
    } else {
      walk(window[key], key, where);
    }
  }

  // The engine's own pictures, from its code lines.
  const game = fs.readFileSync(path.join(ROOT, "js/game.js"), "utf8").split("\n");
  game.forEach((line) => {
    if (/^\s*\/\//.test(line)) return;
    for (const m of line.matchAll(/["'`](assets\/[^"'`]+\.(?:png|jpe?g))["'`]/gi)) add(m[1], "the engine (js/game.js)");
  });

  // The stylesheet's pictures.
  const css = fs.readFileSync(path.join(ROOT, "css/style.css"), "utf8");
  for (const m of css.matchAll(/url\(\s*["']?\.\.\/(assets\/[^"')]+)["']?\s*\)/g)) {
    const file = m[1].split("?")[0];
    if (PICTURE.test(file)) add(file, "the stylesheet (css/style.css)");
  }

  return [...uses.entries()]
    .map(([file, who]) => ({ file, exists: fs.existsSync(path.join(ROOT, file)), users: [...who].sort() }))
    .sort((a, b) => a.file.localeCompare(b.file));
}

module.exports = { findArt };

if (require.main === module) {
  const art = findArt();
  const missing = art.filter((a) => !a.exists);
  console.log(art.length + " pictures named, " + missing.length + " missing:\n");
  missing.forEach((a) => {
    console.log("  " + a.file);
    a.users.forEach((u) => console.log("      used by " + u));
  });
}
