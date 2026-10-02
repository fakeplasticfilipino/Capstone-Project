// =============================================================
// MACARIO — _dev/tools/lib/stamp.js (Block 106)
//
// Every file the game loads carries ?v=, and since Block 106 the number
// is the file's own fingerprint, written here, never typed by hand:
//
//   assets/       each file's fingerprint goes into js/asset-manifest.js
//                 (window.ASSET_VERSIONS), where assetUrl reads it
//   css/*.css     each url() of a local file (the fonts) is stamped
//   *.html        each local script src and stylesheet href is stamped
//
// A fingerprint changes when, and only when, the file's bytes do, so a
// phone downloads again exactly what changed (before, one ASSET_VERSION
// for every picture sent all 11 MB again for one new sprite), and a
// forgotten bump cannot happen. The stylesheets are stamped before the
// pages, since a page names a stylesheet whose bytes include its stamps.
//
// A text file is fingerprinted with Windows line endings read as Unix
// ones: Git checks text out with CRLF on the proponent's computer and LF
// on GitHub's, and the fingerprint has to be the same on both. A
// picture, a sound or a font is read as it is.
//
// The number is decimal (eight hex digits of SHA-1, read as a number),
// so a check that matches ?v=\d+ keeps working.
// =============================================================

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..", "..", "..");
const TEXT = /\.(js|css|html|md|txt|json|svg)$/i;
const PAGES = ["index.html", "teacher.html"];

function fingerprint(rel) {
  let bytes = fs.readFileSync(path.join(ROOT, rel));
  if (TEXT.test(rel)) bytes = Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
  return String(parseInt(crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 8), 16));
}

// A local path as the site names it, or null for another site, a data:
// URL or a fragment.
function localPath(ref, fromDir) {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(ref)) return null;
  const rel = path.posix.normalize(path.posix.join(fromDir, ref.split(/[?#]/)[0]));
  if (rel.startsWith("..")) return null;
  return fs.existsSync(path.join(ROOT, rel)) ? rel : null;
}

// One file's text with every reference stamped. find matches the whole
// reference with the path in group 2 (group 1 and 3 are kept).
function stampText(text, fromDir, find) {
  const misses = [];
  const out = text.replace(find, (whole, before, ref, after) => {
    const rel = localPath(ref, fromDir);
    if (!rel) { if (!/^(?:[a-z]+:|\/\/|#|data:)/i.test(ref)) misses.push(ref); return whole; }
    return before + ref.split("?")[0] + "?v=" + fingerprint(rel) + after;
  });
  return { out, misses };
}

const CSS_URL = /(url\(\s*["']?)([^"')]+)(["']?\s*\))/g;
const HTML_REF = /(<(?:script[^>]*\bsrc|link[^>]*\bhref)=")([^"]+)(")/g;

function stylesheets() {
  return fs.readdirSync(path.join(ROOT, "css")).filter((f) => /\.css$/.test(f)).map((f) => "css/" + f);
}

// Stamps every stylesheet and page. write false only reports what would
// change. Returns { changed: [rel], misses: [ref] } (a miss is a local
// reference to a file that does not exist).
function stampAll(write) {
  const changed = [];
  const misses = [];
  const run = (rel, find) => {
    const file = path.join(ROOT, rel);
    const text = fs.readFileSync(file, "utf8");
    const r = stampText(text, path.posix.dirname(rel), find);
    misses.push(...r.misses.map((m) => rel + ": " + m));
    // Compared with line endings set aside, as the fingerprints are.
    if (r.out.replace(/\r\n/g, "\n") !== text.replace(/\r\n/g, "\n")) {
      changed.push(rel);
      if (write) fs.writeFileSync(file, r.out);
    }
  };
  stylesheets().forEach((rel) => run(rel, CSS_URL));
  if (write || !changed.length) PAGES.forEach((rel) => run(rel, HTML_REF));
  else PAGES.forEach((rel) => changed.push(rel)); // a stale stylesheet stales its page too
  return { changed, misses };
}

module.exports = { fingerprint, stampAll, ROOT };
