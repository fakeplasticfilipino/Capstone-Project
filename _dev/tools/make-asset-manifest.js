// =============================================================
// MACARIO — _dev/tools/make-asset-manifest.js
//
// Writes js/asset-manifest.js: the list of every file under assets/
// (Block 78), and since Block 106 each file's fingerprint. The picture
// loader (js/game.js, loadImage) reads the list to tell two failures
// apart that look the same from the browser:
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
// and assetUrl reads the fingerprints (window.ASSET_VERSIONS) as each
// file's ?v=, so a phone downloads again only the files whose bytes
// changed (lib/stamp.js says why).
//
// Run after adding, renaming, deleting or replacing anything under
// assets/, or let prepare.js do it, which does this and the rest:
//
//   node _dev/tools/make-asset-manifest.js
//
// It also stamps every page and stylesheet (lib/stamp.js), since the
// manifest's own fingerprint changes with it. prepare.js --check, and
// verify_new_scene.js, fail if the manifest and assets/ disagree.
//
// Depends on nothing outside Node.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const { fingerprint, stampAll } = require("./lib/stamp.js");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(ROOT, "js", "asset-manifest.js");

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
    "// (Block 78), with its fingerprint (Block 106). Do not edit by hand:",
    "// rerun the tool, or prepare.js. The picture loader (js/game.js,",
    "// loadImage) never gives up on a file listed here, and never asks for",
    "// a picture that is not; assetUrl puts a file's fingerprint in its ?v=.",
    "// =============================================================",
    "",
    "window.ASSET_MANIFEST = [",
    ...files.map((f) => "  " + JSON.stringify(f) + ","),
    "];",
    "",
    "window.ASSET_VERSIONS = {",
    ...files.map((f) => "  " + JSON.stringify(f) + ": " + JSON.stringify(fingerprint(f)) + ","),
    "};",
    "",
  ].join("\n");
}

function readWindow() {
  if (!fs.existsSync(OUT)) return {};
  const window = {};
  new Function("window", fs.readFileSync(OUT, "utf8"))(window);
  return window;
}

// The files listed in the manifest as it is on disk now.
function readManifest() {
  return readWindow().ASSET_MANIFEST || null;
}

// What is wrong with the manifest on disk: files not listed, files
// listed and gone, and files whose fingerprint is out of date.
function manifestDrift() {
  const onDisk = listAssets();
  const w = readWindow();
  const listed = w.ASSET_MANIFEST || [];
  const versions = w.ASSET_VERSIONS || {};
  return {
    count: onDisk.length,
    notListed: onDisk.filter((f) => !listed.includes(f)),
    gone: listed.filter((f) => !onDisk.includes(f)),
    stale: onDisk.filter((f) => listed.includes(f) && versions[f] !== fingerprint(f)),
  };
}

// Writes the manifest when it is out of date. Returns true if written.
function writeManifest() {
  const source = manifestSource(listAssets());
  const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (before === source) return false;
  fs.writeFileSync(OUT, source);
  return true;
}

module.exports = { listAssets, readManifest, manifestDrift, writeManifest };

if (require.main === module) {
  const wrote = writeManifest();
  const stamped = stampAll(true);
  console.log((wrote ? "wrote" : "kept") + " js/asset-manifest.js (" + listAssets().length + " files)" +
    (stamped.changed.length ? "; stamped " + stamped.changed.join(", ") : "; every page already stamped"));
  stamped.misses.forEach((m) => console.log("  not found: " + m));
}
