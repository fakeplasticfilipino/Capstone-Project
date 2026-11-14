// MACARIO: the four act covers on the menu's Mga Kabanata (15 Nov 2026).
// Each is a screenshot of the game itself at one of the act's story
// points, with everything but the world hidden, so a cover is the
// artist's own scene as the game draws it and nothing made for it.
// Retake one after its scene's art changes, then run prepare.js:
//   node _dev/tools/make-covers.js list
//   node _dev/tools/make-covers.js shot 1:trabaho assets/backgrounds/menu/yugto-1.jpg "" 0.98 3500
//   (2:gabi, 3:labanan and 4:tanay are the other three)
const path = require("path");
const fs = require("fs");
const http = require("http");
const { chromium } = require(path.join(process.cwd(), "node_modules/playwright"));

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png",
  ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".json": "application/json", ".svg": "image/svg+xml" };

(async () => {
  const root = process.cwd();
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
    fs.readFile(p.endsWith(path.sep) ? p + "index.html" : p, (err, data) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
      res.end(data);
    });
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const [mode, jump, out, x, zoom, waitMs] = process.argv.slice(2);
  const ctx = await browser.newContext({ viewport: { width: 960, height: 540 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.goto("http://localhost:" + port + "/index.html?dev=1");
  await page.waitForFunction(() => window.Acts && document.querySelectorAll("#shell-dev-jump option").length > 0, null, { timeout: 60000 });
  if (mode === "list") {
    const list = await page.evaluate(() => [1, 2, 3, 4].map((n) => {
      const a = Acts.getAct(n);
      return "ACT " + n + "\n" + (a.devJumps || []).map((j) => "  " + n + ":" + j.id + " | " + j.scene + " | x " + j.x + " | " + j.label).join("\n");
    }).join("\n"));
    console.log(list);
    console.log(await page.evaluate(() => [...document.querySelectorAll("#shell-dev-jump option")].slice(0, 3).map((o) => o.value).join(" ")));
  } else {
    await page.selectOption("#shell-dev-jump", jump);
    await page.click("#shell-dev-go");
    await page.waitForFunction(() => window.Shell && Shell.state === "playing", null, { timeout: 60000 });
    await page.waitForTimeout(Number(waitMs) || 2500);
    await page.evaluate(({ x, zoom }) => {
      if (zoom) document.documentElement.style.setProperty("--zoom", zoom);
      if (x) { posX = Number(x); }
      window.dispatchEvent(new Event("resize"));
    }, { x, zoom });
    await page.waitForTimeout(900);
    await page.evaluate(() => Game.whenAssetsSettled());
    // Only the world: no hearts, log, controls, guide, buttons or boxes.
    await page.addStyleTag({ content: "#hud, #quest-log, #mobile-controls, #btn-pause, #btn-inventory, #btn-shop, #btn-help, " +
      "#tutorial-card, #toast, #dialogue-box, .dialogue-portrait, .guide, [class*='guide-'], #interact-prompt, #review-banner, #blackout-note, " +
      ".tutorial-card, #tutorial, .guard-sight, .alert-meter, #shell { display: none !important; }" });
    await page.waitForTimeout(300);
    await page.screenshot({ path: out, type: "jpeg", quality: 84 });
    console.log("wrote", out, await page.evaluate(() => ({ room: currentRoom, x: Math.round(posX), cut: cutscenePlaying })));
  }
  await browser.close();
  server.close();
})().catch((e) => { console.error(e); process.exit(1); });
