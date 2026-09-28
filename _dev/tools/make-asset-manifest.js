// =============================================================
// MACARIO — _dev/tools/make-asset-manifest.js
//
// Writes js/asset-manifest.js: the list of every file under assets/
// (Block 78). The picture loader (js/game.js, loadImage) reads it to
// tell two failures apart that look the same from the browser:
//
//   a picture that is not in the list does not exist yet (art the
//   artist still owes, ART.md). It is not asked for at all and is the
//   placeholder box at once.
//
//   a picture that is in the list exists, so any failure to get it is
//   the connection or the host, never "not there": GitHub Pages answers
//   404 for a minute or so while a push is deploying. The loader keeps
//   trying until it arrives and nobody goes in without it.
//
// Run after adding, renaming or deleting anything under assets/:
//
//   node _dev/tools/make-asset-manifest.js
//
// When the list has changed it rewrites the file and bumps the
// manifest's own ?v= in index.html, so there is no version to forget.
// verify_new_scene.js fails if the manifest and assets/ disagree.
//
// Depends on nothing outside Node.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(ROOT, "js", "asset-manifest.js");
const INDEX = path.join(ROOT, "index.html");

// Every file under assets/, as the game names it: forward slashes,
// relative to the site's root, sorted.
function listAssets() {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir + "/" + entry.name;
      if (entry.isDirectory()) walk(rel);
      else out.push(rel);
    }
  };
  walk("assets");
  return out.sort();
}

function manifestSource(files) {
  return [
    "// =============================================================",
    "// MACARIO — js/asset-manifest.js",
    "//",
    "// Every file under assets/, written by _dev/tools/make-asset-manifest.js",
    "// (Block 78). Do not edit by hand: rerun the tool. The picture loader",
    "// (js/game.js, loadImage) never gives up on a file listed here, and",
    "// never asks for a picture that is not.",
    "// =============================================================",
    "",
    "window.ASSET_MANIFEST = [",
    ...files.map((f) => "  " + JSON.stringify(f) + ","),
    "];",
    "",
  ].join("\n");
}

// The files listed in the manifest as it is on disk now.
function readManifest() {
  if (!fs.existsSync(OUT)) return null;
  const window = {};
  new Function("window", fs.readFileSync(OUT, "utf8"))(window);
  return window.ASSET_MANIFEST || null;
}

module.exports = { listAssets, readManifest };

if (require.main === module) {
  const files = listAssets();
  const before = readManifest();
  if (before && JSON.stringify(before) === JSON.stringify(files)) {
    console.log("js/asset-manifest.js is current (" + files.length + " files); nothing written.");
    process.exit(0);
  }
  fs.writeFileSync(OUT, manifestSource(files));
  const html = fs.readFileSync(INDEX, "utf8");
  const bumped = html.replace(/js\/asset-manifest\.js\?v=(\d+)/, (m, n) => "js/asset-manifest.js?v=" + (Number(n) + 1));
  if (bumped === html) {
    console.log("wrote js/asset-manifest.js (" + files.length + " files). index.html has no " +
      "<script src=\"js/asset-manifest.js?v=1\"> yet: add it before game.js.");
  } else {
    fs.writeFileSync(INDEX, bumped);
    console.log("wrote js/asset-manifest.js (" + files.length + " files) and bumped its ?v= in index.html.");
  }
}
