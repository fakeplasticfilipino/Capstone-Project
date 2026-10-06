// =============================================================
// MACARIO — _dev/tools/monkey.js (Block 123)
//
// A guest started from every story point of every act (?dev=1), then
// random controls for a while: walk, run, jump, punch, shoot, talk,
// Escape, and now and then any button on a screen that is up. It looks
// for what the scripted suites cannot: a page error or a console error
// on some path nobody wrote a check for, and a game that sits unchanged
// (scene, position, line, screen, health) for a long time.
//
//   node _dev/tools/monkey.js                 30 seconds a point, seed 1
//   node _dev/tools/monkey.js --secs=45 --seed=2
//
// Four points at a time, at a student's speed, with the fake Supabase
// client (nothing touches the live project). Prints one line a point:
// ERR with the errors, and how long the game sat unchanged at the end
// ("idle"); the whole result goes to monkey-<seed>.json in the temp
// folder. A long idle with the bag or the shop open is the monkey, not
// the game. First run, 6 Oct 2026: three seeds, 150 runs, no errors.
// Not part of CI: random input is for looking, not for a red cross.
// =============================================================

"use strict";
const { chromium } = require("playwright");
const http = require("http"); const fs = require("fs"); const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const STUB = fs.readFileSync(path.join(ROOT, "_dev", "tests", "sb-stub.js"), "utf8");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png",
  ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".woff2": "font/woff2" };
const SECS = Number((process.argv.find((a) => a.startsWith("--secs=")) || "--secs=30").split("=")[1]);
const SEED0 = Number((process.argv.find((a) => a.startsWith("--seed=")) || "--seed=1").split("=")[1]);
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  fs.readFile(path.join(ROOT, rel), (err, data) => { if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(rel)] || "text/plain" }); res.end(data); });
});
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const KEYS = ["a", "d", "a", "d", "d", "d", " ", "j", "j", "e", "e", "Shift", "Escape"];
(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  // the jump list
  const probe = await browser.newPage();
  await probe.route("**/supabaseClient.js*", (r) => r.fulfill({ body: STUB, contentType: "text/javascript" }));
  await probe.route("**/js/vendor/supabase.js*", (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
  await probe.addInitScript(() => { window.__TEST = {}; });
  await probe.goto(`http://localhost:${port}/index.html?dev=1`);
  await probe.waitForTimeout(800);
  const jumps = await probe.evaluate(() => [...document.querySelectorAll("#shell-dev-jump option")].map((o) => o.value));
  await probe.close();
  const results = [];
  let next = 0;
  async function worker() {
    while (next < jumps.length) {
      const jump = jumps[next++];
      const ctx = await browser.newContext({ viewport: { width: 823, height: 412 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
      page.on("console", (m) => { if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
      // Block 124. A placement the catalogue cannot merge is only warned
      // about (it draws as the placeholder box), so it counts here.
      page.on("console", (m) => { if (m.type() === "warning" && /enemy type/i.test(m.text())) errors.push("warn: " + m.text().slice(0, 200)); });
      await page.route("**/supabaseClient.js*", (r) => r.fulfill({ body: STUB, contentType: "text/javascript" }));
      await page.route("**/js/vendor/supabase.js*", (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
      await page.addInitScript(() => { window.__TEST = {}; });
      await page.goto(`http://localhost:${port}/index.html?dev=1`);
      await page.waitForTimeout(600);
      await page.selectOption("#shell-dev-jump", jump);
      await page.click("#shell-dev-go");
      for (let i = 0; i < 80 && (await page.evaluate(() => Shell.state)) !== "playing"; i++) await page.waitForTimeout(100);
      const r = rng(SEED0 * 7919 + next * 104729);
      const t0 = Date.now();
      let lastChange = Date.now(), lastSig = "";
      while (Date.now() - t0 < SECS * 1000) {
        const k = KEYS[Math.floor(r() * KEYS.length)];
        const hold = 50 + Math.floor(r() * 700);
        try {
          await page.keyboard.down(k);
          await page.waitForTimeout(hold);
          await page.keyboard.up(k);
          // also tap any button on a screen that is up (work game, cut game, cards)
          if (r() < 0.15) await page.evaluate(() => {
            const vis = (el) => el && !el.closest(".hidden") && el.offsetParent !== null;
            const btns = [...document.querySelectorAll("button")].filter((b) => vis(b) && !b.disabled && !/logout|reset|shell-password|btn-pause/.test(b.id));
            if (btns.length) btns[Math.floor(Math.random() * btns.length)].click();
          });
        } catch (e) { errors.push("driver: " + e.message.slice(0, 120)); break; }
        const sig = await page.evaluate(() => [currentSceneId, Math.round(posX / 50), document.getElementById("dialogue-text").textContent.slice(0, 20), Shell.state, health].join("|")).catch(() => "x");
        if (sig !== lastSig) { lastSig = sig; lastChange = Date.now(); }
      }
      const end = await page.evaluate(() => ({ scene: currentSceneId, shell: Shell.state, task: (document.querySelector("#quest-list") || {}).textContent || "" })).catch(() => ({}));
      const stuck = Date.now() - lastChange;
      results.push({ jump, errors: [...new Set(errors)], stuckMs: stuck, end });
      console.log((errors.length ? "ERR " : "ok  ") + jump.padEnd(16) + " idle " + Math.round(stuck / 1000) + "s  " + (errors.length ? [...new Set(errors)].slice(0, 3).join(" || ") : ""));
      await ctx.close();
    }
  }
  await Promise.all([0, 1, 2, 3].map(() => worker()));
  await browser.close(); server.close();
  fs.writeFileSync(path.join(process.env.TEMP, "monkey-" + SEED0 + ".json"), JSON.stringify(results, null, 1));
})();
