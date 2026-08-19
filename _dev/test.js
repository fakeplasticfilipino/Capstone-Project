// =============================================================
// MACARIO — _dev/test.js
//
// Run:  node _dev/test.js       from the repository root
//
// Serves the repository over http, opens index.html in headless
// Chromium at phone dimensions, and drives the real game.
//
// supabaseClient.js and the Supabase CDN script are intercepted and
// replaced with _dev/sb-stub.js, so the suite exercises the SHIPPING
// index.html in its real script order and cannot drift away from it.
// Nothing here touches the live Supabase project.
//
// Requires: npm install -D playwright     (dev only, not shipped)
// =============================================================

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8099;
const STUB = fs.readFileSync(path.join(__dirname, "sb-stub.js"), "utf8");

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg",
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
  const file = path.join(ROOT, rel || "index.html");
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "text/plain" });
    res.end(data);
  });
});

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (extra !== undefined ? "  -> " + JSON.stringify(extra) : "")); }
};

const visible = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return getComputedStyle(el).display !== "none" && r.width > 0 && r.height > 0;
}, sel);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();

  async function newPage(testState) {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 823 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });

    // The whole reason this suite tests the real index.html: swap the
    // client and neutralise the CDN at the network layer rather than
    // maintaining a parallel copy of the page.
    await page.route("**/supabaseClient.js*", (route) =>
      route.fulfill({ body: STUB, contentType: "text/javascript" }));
    await page.route("**/cdn.jsdelivr.net/**", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));

    await page.addInitScript((s) => { window.__TEST = s; }, testState);
    await page.goto("http://localhost:" + PORT + "/index.html");
    return { ctx, page };
  }

  console.log("\nA. Fresh student, no stored session");
  {
    const { ctx, page } = await newPage({ session: null });
    await page.waitForTimeout(300);
    ok("title screen visible", await visible(page, "#shell"));
    ok("title panel is the one showing", await visible(page, "#shell-title"));
    ok("start button reads Magsimula", (await page.textContent("#shell-start")).trim() === "Magsimula",
       (await page.textContent("#shell-start")).trim());
    ok("start button enabled", !(await page.isDisabled("#shell-start")));
    ok("pause button hidden at title", !(await visible(page, "#btn-pause")));

    await page.click("#shell-start");
    await page.waitForTimeout(150);
    ok("shell hidden after Magsimula", !(await visible(page, "#shell")));
    ok("login box now reachable", await visible(page, "#auth-overlay"));

    await page.fill("#auth-email", "hi@example.com");
    await page.fill("#auth-password", "x");
    await page.click("#auth-submit");
    await page.waitForTimeout(600);
    ok("auth overlay gone after login", !(await visible(page, "#auth-overlay")));
    ok("shell still hidden, no second title", !(await visible(page, "#shell")));
    ok("shell state is playing", (await page.evaluate(() => Shell.state)) === "playing");
    ok("uiBlocked cleared", (await page.evaluate(() => Shell.state === "playing")) === true);
    await page.waitForTimeout(200);

    ok("pre-act flow ran for a new student", await visible(page, "#quiz"));
    ok("pause button hidden behind a test", !(await visible(page, "#btn-pause")));
    await page.click("#quiz-btn");
    await page.waitForTimeout(400);
    ok("test dismissed", !(await visible(page, "#quiz")));
    ok("act status advanced to playing", (await page.evaluate(() => Acts.status)) === "playing");
    ok("pause button visible once playing", await visible(page, "#btn-pause"));
    ok("game_progress row created", (await page.evaluate(() => __DB.game_progress.length)) === 1);
    await ctx.close();
  }

  console.log("\nB. Returning student, mid Act I at the outpost");
  {
    const state = {
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: "kuta", is_night: true,
        save_state: { quests: [], flags: { hasBuko: true, bukoGiven: true, deathSequenceDone: true, metKatipunero: true }, posX: 300 } }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 4 }],
    };
    const { ctx, page } = await newPage(state);
    await page.waitForTimeout(700);
    ok("title screen visible on resume", await visible(page, "#shell"));
    ok("start button reads Magpatuloy", (await page.textContent("#shell-start")).trim() === "Magpatuloy",
       (await page.textContent("#shell-start")).trim());
    ok("still gated, not yet playing", (await page.evaluate(() => Shell.state)) === "title");
    ok("resumed into the outpost scene, not the road",
       (await page.evaluate(() => currentRoom)) === "kuta", await page.evaluate(() => currentRoom));

    await page.click("#shell-start");
    await page.waitForTimeout(400);
    ok("entered the world", (await page.evaluate(() => Shell.state)) === "playing");
    ok("still in kuta after entry", (await page.evaluate(() => currentRoom)) === "kuta");
    ok("act is still 1", (await page.evaluate(() => Acts.current)) === 1);
    ok("hearts shown in a dangerous scene", await visible(page, "#hud"));
    ok("guards were built", (await page.evaluate(() => GUARDS.length)) > 0);

    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    ok("pause screen opens", await visible(page, "#shell-pause"));
    ok("engine reports paused", await page.evaluate(() => Game.isPaused()));

    await page.evaluate(() => { GUARDS[0].alert = 0.5; window.__pos = GUARDS[0].pos; });
    await page.waitForTimeout(900);
    const frozen = await page.evaluate(() => ({ alert: GUARDS[0].alert, moved: Math.abs(GUARDS[0].pos - window.__pos) }));
    ok("guard patrol frozen while paused", frozen.moved === 0, frozen);
    ok("detection meter frozen while paused", frozen.alert === 0.5, frozen);

    await page.evaluate(() => { invulnUntil = performance.now() + 1000; });
    await page.waitForTimeout(1400);
    await page.click("#shell-resume");
    await page.waitForTimeout(60);
    const iv = await page.evaluate(() => invulnUntil - performance.now());
    ok("invuln window not eaten by a 1.4s pause", iv > 300, Math.round(iv));

    ok("resumed to playing", (await page.evaluate(() => Shell.state)) === "playing");
    ok("engine unpaused", !(await page.evaluate(() => Game.isPaused())));
    await page.waitForTimeout(200);
    const moved = await page.evaluate(() => { const a = GUARDS[0].pos; return new Promise(r => setTimeout(() => r(Math.abs(GUARDS[0].pos - a)), 400)); });
    ok("guards patrol again after resume", moved > 0, moved);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
    ok("Escape opens pause", await visible(page, "#shell-pause"));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
    ok("Escape closes pause", !(await visible(page, "#shell")));

    await page.click("#btn-pause");
    await page.waitForTimeout(100);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(100);
    ok("settings open from pause", await visible(page, "#shell-settings"));
    await page.click('[data-size="lg"]');
    await page.waitForTimeout(100);
    ok("large text applied", await page.evaluate(() => document.body.classList.contains("text-lg")));
    ok("setting persisted", (await page.evaluate(() => JSON.parse(localStorage.getItem("macario:settings")).textSize)) === "lg");
    await page.click("#shell-settings-back");
    await page.waitForTimeout(100);
    ok("back returns to pause, not title", await visible(page, "#shell-pause"));
    ok("still paused after settings", await page.evaluate(() => Game.isPaused()));
    await page.click("#shell-resume");
    await page.waitForTimeout(100);

    await page.evaluate(() => { state.flags.messageDelivered = true; markDirty(); });
    await page.click("#btn-pause");
    await page.waitForTimeout(100);
    await page.click("#shell-logout");
    await page.waitForTimeout(100);
    ok("logout asks for confirmation", await visible(page, "#shell-logout-confirm"));
    await page.click("#shell-logout-no");
    await page.waitForTimeout(100);
    ok("cancel returns to pause", await visible(page, "#shell-pause"));
    await ctx.close();
  }

  console.log("\nC. Settings persist across a reload");
  {
    const { ctx, page } = await newPage({ session: null });
    await page.waitForTimeout(200);
    await page.click("#shell-title-settings");
    await page.waitForTimeout(100);
    ok("settings reachable from the title screen", await visible(page, "#shell-settings"));
    await page.click('[data-size="sm"]');
    await page.click("#shell-settings-back");
    await page.waitForTimeout(100);
    ok("back returns to title, not pause", await visible(page, "#shell-title"));
    await page.reload();
    await page.waitForTimeout(300);
    ok("small text restored after reload", await page.evaluate(() => document.body.classList.contains("text-sm")));
    ok("the chosen size is marked active", await page.evaluate(() => document.querySelector('[data-size="sm"]').classList.contains("active")));
    await ctx.close();
  }

  console.log("\nD. Backward compatibility");
  {
    const state = {
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: "empty", save_state: {} }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 0 }],
    };
    const { ctx, page } = await newPage(state);
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(300);
    ok("legacy 'empty' room falls back to the first scene",
       (await page.evaluate(() => currentRoom)) === "road", await page.evaluate(() => currentRoom));
    ok("acts II-IV still registered", await page.evaluate(() => [2,3,4].every(n => !!Acts.getAct(n))));
    ok("act II still has no objectives", (await page.evaluate(() => Acts.objectivesFor(2).length)) === 0);
    await ctx.close();
  }

  console.log("\nE. A shell that never gets a world");
  {
    const { ctx, page } = await newPage({ session: { user: { id: "u1" } }, profileError: true });
    await page.waitForTimeout(600);
    ok("title screen still up", await visible(page, "#shell"));
    ok("start button disabled while it waits", await page.isDisabled("#shell-start"));
    ok("shell has not marked itself ready", !(await page.evaluate(() => Shell.ready)));
    await page.evaluate(() => { clearTimeout(Shell.loadTimer); Shell._setStart("Subukan Ulit", true); Shell.el.startBtn.dataset.action = "reload"; });
    ok("a stalled load offers a way out", !(await page.isDisabled("#shell-start")));
    ok("that way out is a reload", (await page.evaluate(() => Shell.el.startBtn.dataset.action)) === "reload");
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
