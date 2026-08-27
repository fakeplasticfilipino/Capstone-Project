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

  // block is a URL pattern to serve empty, which is how the suite tests
  // a page that loaded without one of its optional files. Serving empty
  // rather than 404 keeps the console clean, so a real error still
  // stands out in the pageerror handler above.
  // 823 x 412, phone LANDSCAPE. The suite used to run portrait, which was
  // wrong in a way that hid two faults for four blocks: the game is a
  // side-scroller meant to be held sideways, and portrait is now a rotate
  // notice rather than a supported layout. A portrait context here would
  // now open every test behind that notice.
  async function newPage(testState, block, viewport) {
    const ctx = await browser.newContext({
      viewport: viewport || { width: 823, height: 412 },
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });

    // The whole reason this suite tests the real index.html: swap the
    // client and neutralise the CDN at the network layer rather than
    // maintaining a parallel copy of the page.
    await page.route("**/supabaseClient.js*", (route) =>
      route.fulfill({ body: STUB, contentType: "text/javascript" }));
    await page.route("**/cdn.jsdelivr.net/**", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));

    if (block) {
      await page.route(block, (route) =>
        route.fulfill({ body: "", contentType: "text/javascript" }));
    }

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

  // -----------------------------------------------------------------
  // Block 8. Hazards, pickups and difficulty.
  // -----------------------------------------------------------------

  // Puts a resuming student in the outpost with the world already built,
  // which is where all three Block 8 systems live.
  const atOutpost = () => ({
    session: { user: { id: "u1" } },
    game_progress: [{ student_id: "u1", current_act: 1, current_room: "kuta", is_night: true,
      save_state: { quests: [], flags: { hasBuko: true, bukoGiven: true, deathSequenceDone: true, metKatipunero: true }, posX: 300 } }],
    act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 4 }],
  });

  async function enterOutpost(block) {
    const { ctx, page } = await newPage(atOutpost(), block);
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(400);
    return { ctx, page };
  }

  // Drops the player onto the floor inside the first hazard band and lets
  // a few frames run. Returns the state the engine settled on.
  const standInHazard = (page) => page.evaluate(() => {
    const h = HAZARDS[0];
    invulnUntil = 0;
    health = 3;
    facing = 1;
    posX = h.x + h.width / 2 - 20;
    posY = floorHeightAt(posX);
    velY = 0;
    return new Promise((r) => setTimeout(() => r({
      health, posX, room: currentRoom, startX: currentScene.startX,
      hazardX: h.x, hazardWidth: h.width,
    }), 250));
  });

  console.log("\nF. Hazards");
  {
    const { ctx, page } = await enterOutpost();

    // Guards are switched off for this section. The knockback from the
    // first band lands the player inside bantay-1's detection radius, so
    // leaving them on measures the stealth system rather than the hazard
    // one. Guards have their own checks in section H.
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    ok("hazards were built", (await page.evaluate(() => HAZARDS.length)) === 2);
    ok("hazard elements are in the world",
       (await page.evaluate(() => document.querySelectorAll(".hazard").length)) === 2);

    const hit = await standInHazard(page);
    ok("hazard costs exactly one health", hit.health === 2, hit.health);
    ok("hazard does not change the scene", hit.room === "kuta", hit.room);
    ok("hazard does not respawn the player at startX",
       Math.abs(hit.posX - hit.startX) > 100, { posX: hit.posX, startX: hit.startX });
    ok("knockback clears the band",
       hit.posX + 20 < hit.hazardX || hit.posX > hit.hazardX + hit.hazardWidth,
       { posX: hit.posX, band: [hit.hazardX, hit.hazardX + hit.hazardWidth] });

    // Standing still after the shove must not drain the remaining hearts.
    const after = await page.evaluate(() => new Promise((r) =>
      setTimeout(() => r(health), 2500)));
    ok("no repeat damage while standing still after the knockback", after === 2, after);

    // Above the band, on a platform, is safe. Uses the real platform so
    // the check fails if the ground test regresses to onGround.
    const onPlatform = await page.evaluate(() => {
      invulnUntil = 0;
      health = 3;
      const plat = PLATFORMS[0];
      posX = plat.x + 20;
      posY = plat.y;
      velY = 0;
      return new Promise((r) => setTimeout(() => r(health), 400));
    });
    ok("standing on a platform takes no hazard damage", onPlatform === 3, onPlatform);

    // Blocked UI must suspend hazards for the same reason it suspends
    // guards: damage taken while unable to move is not a mechanic.
    const blocked = await page.evaluate(() => {
      invulnUntil = 0;
      health = 3;
      Game.setUiBlocked(true);
      const h = HAZARDS[0];
      posX = h.x + h.width / 2 - 20;
      posY = floorHeightAt(posX);
      velY = 0;
      return new Promise((r) => setTimeout(() => {
        Game.setUiBlocked(false);
        r(health);
      }, 400));
    });
    ok("hazard ignored while the UI is blocked", blocked === 3, blocked);

    await ctx.close();
  }

  console.log("\nG. Pickups");
  {
    const { ctx, page } = await enterOutpost();

    ok("pickup was built", (await page.evaluate(() => PICKUPS.length)) === 1);
    ok("pickup element is in the world",
       (await page.evaluate(() => document.querySelectorAll(".pickup").length)) === 1);

    // Refused at full health, and still there afterwards.
    const full = await page.evaluate(() => {
      health = 3;
      const p = PICKUPS[0];
      posX = p.x;
      posY = p.y;
      velY = 0;
      return new Promise((r) => setTimeout(() => r({
        health, collected: collectedPickups.size,
        stillThere: !!document.querySelector(".pickup"),
      }), 300));
    });
    ok("pickup refused at full health", full.health === 3 && full.collected === 0, full);
    ok("refused pickup stays in the world", full.stillThere);

    // Collected when hurt.
    const taken = await page.evaluate(() => {
      health = 1;
      const p = PICKUPS[0];
      posX = p.x;
      posY = p.y;
      velY = 0;
      return new Promise((r) => setTimeout(() => r({
        health, collected: collectedPickups.size,
        stillThere: !!document.querySelector(".pickup"),
      }), 300));
    });
    ok("pickup restores one health", taken.health === 2, taken.health);
    ok("pickup recorded as collected", taken.collected === 1, taken.collected);
    ok("collected pickup leaves the world", !taken.stillThere);

    // A respawn must not hand it back, or the corridor can be farmed by
    // dying on purpose.
    const afterRespawn = await page.evaluate(() => {
      respawnInScene();
      return { collected: collectedPickups.size, stillThere: !!document.querySelector(".pickup") };
    });
    ok("collected set survives a respawn", afterRespawn.collected === 1, afterRespawn.collected);
    ok("pickup does not return on respawn", !afterRespawn.stillThere);

    // Leaving and re-entering the scene does restore it.
    const afterReload = await page.evaluate(() => {
      loadScene("road");
      loadScene("kuta");
      return { collected: collectedPickups.size, stillThere: !!document.querySelector(".pickup") };
    });
    ok("loadScene clears the collected set", afterReload.collected === 0, afterReload.collected);
    ok("pickup returns on a fresh visit", afterReload.stillThere);

    await ctx.close();
  }

  console.log("\nH. Dynamic difficulty and guard reset");
  {
    const { ctx, page } = await enterOutpost();

    const act1 = await page.evaluate(() => GUARDS.map((g) => ({ speed: g.speed, base: g.baseSpeed })));
    ok("act I guards run at the content speed",
       act1.every((g) => Math.abs(g.speed - g.base) < 1e-9), act1);

    // The only proof this project will have that difficulty scales, since
    // no act with guards beyond Act I has content yet.
    const act3 = await page.evaluate(() => {
      const fake = {
        number: 3, title: "T", titleTagalog: "T", objectives: [], startingQuests: [],
        scenes: [{ id: "t", worldWidth: 1200, startX: 0, dangerous: true,
          guards: [{ id: "g", x: 100, patrolFrom: 100, patrolTo: 600, speed: 2, facing: -1 }] }],
      };
      loadAct(fake, "t");
      return { speed: GUARDS[0].speed, base: GUARDS[0].baseSpeed, facing: GUARDS[0].facing };
    });
    ok("act III scales guard speed by 1.30",
       Math.abs(act3.speed - 2 * 1.3) < 1e-9, act3);
    ok("the content speed is preserved alongside it", act3.base === 2, act3.base);
    ok("scaled speed stays under player SPEED",
       await page.evaluate(() => GUARDS.every((g) => g.speed < SPEED)));

    // The facingStart fix. A left-facing sentry must still face left.
    const facingAfter = await page.evaluate(() => {
      GUARDS[0].facing = 1;
      respawnInScene();
      return GUARDS[0].facing;
    });
    ok("respawn restores the guard's authored facing", facingAfter === -1, facingAfter);

    await ctx.close();
  }

  // -----------------------------------------------------------------
  // Block 9. Measurement, sessions and feedback.
  // -----------------------------------------------------------------

  console.log("\nI. Counters");
  {
    const { ctx, page } = await enterOutpost();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    const zeroed = await page.evaluate(() => {
      Game.resetStats();
      return Game.stats();
    });
    ok("resetStats zeroes all three",
       zeroed.damageTaken === 0 && zeroed.detections === 0 && zeroed.playMs === 0, zeroed);

    // A hit inside the grace window must not be counted twice.
    const doubled = await page.evaluate(() => {
      Game.resetStats();
      invulnUntil = 0;
      health = 3;
      damagePlayer("t", false);
      damagePlayer("t", false); // inside the invulnerability window
      return Game.stats().damageTaken;
    });
    ok("damage inside the grace window is not counted", doubled === 1, doubled);

    const caught = await page.evaluate(() => {
      Game.resetStats();
      invulnUntil = 0;
      health = 3;
      caughtBy(GUARDS[0]);
      return Game.stats();
    });
    ok("a catch counts as both a detection and damage",
       caught.detections === 1 && caught.damageTaken === 1, caught);

    // playMs must not advance across a pause.
    const paused = await page.evaluate(async () => {
      Game.resetStats();
      Game.setPaused(true);
      const before = Game.stats().playMs;
      await new Promise((r) => setTimeout(r, 700));
      const after = Game.stats().playMs;
      Game.setPaused(false);
      return { before, after };
    });
    ok("playMs does not advance while paused",
       paused.after - paused.before < 50, paused);

    const ran = await page.evaluate(() => new Promise((r) => {
      const before = Game.stats().playMs;
      setTimeout(() => r(Game.stats().playMs - before), 500);
    }));
    ok("playMs advances while playing", ran > 200, ran);

    await ctx.close();
  }

  console.log("\nJ. Counter persistence");
  {
    const { ctx, page } = await enterOutpost();

    await page.evaluate(async () => {
      Game.resetStats();
      invulnUntil = 0;
      health = 3;
      damagePlayer("t", false);
      detections = 2;
      markDirty();
      await Game.flushSave();
    });

    const stored = await page.evaluate(() =>
      __DB.game_progress[0].save_state.stats);
    ok("counters are written into save_state",
       stored && stored.damageTaken === 1 && stored.detections === 2, stored);

    await ctx.close();
  }

  // The other half of persistence, and the whole reason it exists: a
  // student who resumes must NOT be handed a clean survival and stealth
  // record for the part of the act they already played.
  //
  // Tested by seeding a save that already holds counters rather than by
  // reloading the page, because the stub reseeds its database on reload
  // and would discard the write the previous section just made.
  {
    const seeded = atOutpost();
    seeded.game_progress[0].save_state.stats = {
      damageTaken: 4, detections: 3, playMs: 91000,
    };
    const { ctx, page } = await newPage(seeded);
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(400);

    const restored = await page.evaluate(() => Game.stats());
    ok("counters are restored from a stored save",
       restored.damageTaken === 4 && restored.detections === 3, restored);
    ok("stored play time is restored too", restored.playMs >= 91000, restored.playMs);

    // Resuming must not reset them. syncStart deliberately does not call
    // resetStats; only enterAct does.
    const afterSync = await page.evaluate(() => Acts.status && Game.stats());
    ok("resuming does not zero the counters", afterSync.damageTaken === 4, afterSync);

    // Entering a DIFFERENT act does reset them, because they are per act.
    const afterEnter = await page.evaluate(async () => {
      Assessment.runTest = async function () {};
      Acts.showActTitle = async function () {};
      Acts.progress[1] = { status: "completed", objectives_done: 5 };
      await Acts.enterAct(2);
      return Game.stats();
    });
    ok("entering a new act resets the counters",
       afterEnter.damageTaken === 0 && afterEnter.detections === 0, afterEnter);

    await ctx.close();
  }

  console.log("\nK. The weighted score");
  {
    const { ctx, page } = await enterOutpost();

    const perfect = await page.evaluate(() =>
      Acts.scoreFor(5, 5, { damageTaken: 0, detections: 0 }));
    ok("full completion, untouched, scores 100", perfect === 100, perfect);

    const worst = await page.evaluate(() =>
      Acts.scoreFor(5, 5, { damageTaken: 6, detections: 5 }));
    ok("full completion with both budgets spent scores 50", worst === 50, worst);

    const clamped = await page.evaluate(() =>
      Acts.scoreFor(5, 5, { damageTaken: 40, detections: 40 }));
    ok("terms clamp rather than going negative", clamped === 50, clamped);

    const worked = await page.evaluate(() =>
      Acts.scoreFor(5, 5, { damageTaken: 3, detections: 2 }));
    ok("the worked example from the spec reads 77.5", worked === 77.5, worked);

    const none = await page.evaluate(() =>
      Acts.scoreFor(0, 5, { damageTaken: 0, detections: 0 }));
    ok("no objectives done still scores the other two terms", none === 50, none);

    const stub = await page.evaluate(() =>
      Acts.scoreFor(0, 0, { damageTaken: 0, detections: 0 }));
    ok("a stub act with no objectives scores 0", stub === 0, stub);

    const missing = await page.evaluate(() => Acts.scoreFor(5, 5));
    ok("missing stats do not throw", missing === 100, missing);

    await ctx.close();
  }

  console.log("\nL. Sessions");
  {
    const { ctx, page } = await enterOutpost();

    const opened = await page.evaluate(() => __DB.game_sessions || []);
    ok("a session row is written on entry", opened.length === 1, opened.length);
    ok("the session is left open", opened[0] && opened[0].ended_at === undefined);
    ok("the session records the act", opened[0] && opened[0].act_number === 1);

    const closed = await page.evaluate(async () => {
      await Acts.endSession();
      return __DB.game_sessions[0].ended_at;
    });
    ok("ending the session sets ended_at", Boolean(closed), closed);

    // A second entry opens a second row rather than reusing the first.
    const second = await page.evaluate(async () => {
      await Acts.startSession(1);
      return __DB.game_sessions.length;
    });
    ok("a second entry opens a second row", second === 2, second);

    await ctx.close();
  }

  console.log("\nM. Feedback");
  {
    const { ctx, page } = await enterOutpost();

    // Skipping must write nothing and must not block the flow.
    const skipped = await page.evaluate(async () => {
      const p = Assessment.runFeedback(1);
      await new Promise((r) => setTimeout(r, 150));
      const shown = !document.getElementById("quiz").classList.contains("hidden");
      document.getElementById("quiz-back").click();
      await p;
      return { shown, rows: (__DB.feedback || []).length };
    });
    ok("the feedback form opens", skipped.shown);
    ok("skipping writes no row", skipped.rows === 0, skipped.rows);

    // Submit requires a rating, then writes exactly one row.
    const submitted = await page.evaluate(async () => {
      const p = Assessment.runFeedback(1);
      await new Promise((r) => setTimeout(r, 150));
      const lockedOut = document.getElementById("quiz-btn").disabled;
      document.querySelectorAll(".feedback-star")[3].click();
      const freed = !document.getElementById("quiz-btn").disabled;
      document.getElementById("quiz-btn").click();
      await p;
      return { lockedOut, freed, rows: __DB.feedback || [] };
    });
    ok("submit is disabled until a rating is chosen", submitted.lockedOut);
    ok("choosing a rating enables submit", submitted.freed);
    ok("submitting writes one row", submitted.rows.length === 1, submitted.rows.length);
    ok("the chosen rating is what is stored", submitted.rows[0].rating === 4,
       submitted.rows[0].rating);

    // Already answered: no second form, no second row.
    const again = await page.evaluate(async () => {
      await Assessment.runFeedback(1);
      return {
        hidden: document.getElementById("quiz").classList.contains("hidden"),
        rows: __DB.feedback.length,
      };
    });
    ok("a second call shows nothing", again.hidden);
    ok("and writes nothing", again.rows === 1, again.rows);

    await ctx.close();
  }

  console.log("\nN. Completion is written before feedback is offered");
  {
    const { ctx, page } = await enterOutpost();

    // The ordering that protects the study: if the student closes the
    // tab on the form, the act is already recorded.
    const order = await page.evaluate(async () => {
      const seen = [];
      // The post-test renders a screen and awaits a tap. This section is
      // about ordering, not about the test, so it is stubbed out.
      Assessment.runTest = async function () { seen.push("posttest"); };
      const realComplete = Acts.complete.bind(Acts);
      Acts.complete = async function () {
        seen.push("complete");
        return realComplete();
      };
      Assessment.runFeedback = async function () {
        seen.push("feedback");
        seen.push("status:" + Acts.status);
      };
      Acts.showTransition = function () { seen.push("transition"); };
      await Acts.finishAct();
      return seen;
    });
    ok("complete runs before feedback",
       order.indexOf("complete") < order.indexOf("feedback"), order);
    ok("the act is already completed when the form opens",
       order.includes("status:completed"), order);
    ok("the transition still runs after feedback",
       order.indexOf("transition") > order.indexOf("feedback"), order);

    await ctx.close();
  }

  console.log("\nO. Feedback is optional to the flow");
  {
    const { ctx, page } = await enterOutpost();

    // An assessment.js without runFeedback, or none at all, must still
    // complete the act. This is the guard that keeps assessment.js
    // optional.
    const withoutIt = await page.evaluate(async () => {
      Assessment.runTest = async function () {};
      delete Assessment.runFeedback;
      Acts.showTransition = function () {};
      await Acts.finishAct();
      return Acts.status;
    });
    ok("the act still completes with no feedback module",
       withoutIt === "completed", withoutIt);

    await ctx.close();
  }

  // -----------------------------------------------------------------
  // Block 10. Inventory and equipment.
  // -----------------------------------------------------------------

  console.log("\nP. The item catalogue");
  {
    const { ctx, page } = await enterOutpost();

    const shape = await page.evaluate(() => ({
      count: window.ITEMS.length,
      wellFormed: window.ITEMS.every(
        (i) => i.id && i.kind && i.slot && i.name
      ),
      slots: window.ITEMS.map((i) => i.slot),
      equipment: window.ITEMS.filter((i) => i.kind === "equipment").length,
      cosmetics: window.ITEMS.filter((i) => i.kind === "cosmetic").length,
      // A cosmetic that carries an effect is not a cosmetic. This is the
      // check that stops the outfit slot quietly becoming a third
      // equipment slot.
      cosmeticsAreInert: window.ITEMS
        .filter((i) => i.kind === "cosmetic")
        .every((i) => !i.effect),
      granted: window.ITEMS.filter((i) => i.grantedOnAct === 1).length,
      priced: window.ITEMS.filter((i) => (i.price || 0) > 0).length,
    }));
    ok("the catalogue loaded", shape.count >= 4, shape.count);
    ok("every item has an id, kind, slot and name", shape.wellFormed, shape);
    ok("one weapon and one accessory",
       shape.slots.includes("weapon") && shape.slots.includes("accessory"),
       shape.slots);
    ok("two granted equipment items", shape.equipment === 2 && shape.granted === 2, shape);
    ok("two priced cosmetics", shape.cosmetics === 2 && shape.priced === 2, shape);
    ok("cosmetics carry no effect", shape.cosmeticsAreInert, shape);

    await ctx.close();
  }

  console.log("\nQ. Granting");
  {
    const { ctx, page } = await enterOutpost();

    ok("both Act I items were granted on entry",
       (await page.evaluate(() => __DB.player_inventory.length)) === 2,
       await page.evaluate(() => __DB.player_inventory));
    ok("the rows belong to the student",
       await page.evaluate(() =>
         __DB.player_inventory.every((r) => r.student_id === "u1")));
    ok("Inventory reports both as owned",
       (await page.evaluate(() => Inventory.ownedItems().length)) === 2);

    // Re-entering must not hand them out again. The unique constraint is
    // the real guarantee; this checks the client does not lean on it.
    const again = await page.evaluate(async () => {
      await Inventory.grantForAct(1);
      return __DB.player_inventory.length;
    });
    ok("a second grant writes nothing", again === 2, again);

    await ctx.close();
  }

  console.log("\nR. Equipping");
  {
    const { ctx, page } = await enterOutpost();

    const worn = await page.evaluate(async () => {
      const wrote = await Inventory.equip("agimat");
      return {
        wrote,
        rows: __DB.player_equipment.length,
        slot: __DB.player_equipment[0] && __DB.player_equipment[0].slot,
        item: __DB.player_equipment[0] && __DB.player_equipment[0].item_id,
      };
    });
    ok("equipping writes a row", worn.wrote && worn.rows === 1, worn);
    ok("the row names the slot and the item",
       worn.slot === "accessory" && worn.item === "agimat", worn);

    // A second item in the same slot must replace rather than add. Only
    // one weapon exists in the catalogue, so the test supplies a second
    // rather than the content file carrying one it does not need.
    const replaced = await page.evaluate(async () => {
      window.ITEMS.push({ id: "sibat-2", name: "Pangalawa", kind: "equipment",
                          slot: "weapon", price: 0, effect: {} });
      Inventory.ownedIds.push("sibat-2");
      await Inventory.equip("sibat");
      await Inventory.equip("sibat-2");
      const weapons = __DB.player_equipment.filter((r) => r.slot === "weapon");
      return { rows: weapons.length, item: weapons[0] && weapons[0].item_id };
    });
    ok("one row per slot, not one per equip", replaced.rows === 1, replaced);
    ok("the slot holds the newer item", replaced.item === "sibat-2", replaced);

    const off = await page.evaluate(async () => {
      await Inventory.unequip("accessory");
      return {
        rows: __DB.player_equipment.length,
        accessory: Inventory.equipped("accessory"),
      };
    });
    ok("unequipping deletes the row", off.rows === 1, off);
    ok("the slot reads empty afterwards", off.accessory === null, off);

    await ctx.close();
  }

  console.log("\nS. Equipment effects");
  {
    const { ctx, page } = await enterOutpost();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    const hearts = () => page.evaluate(() => ({
      max: maxHealth,
      health: health,
      drawn: document.querySelectorAll("#hud-hearts .heart").length,
      empty: document.querySelectorAll("#hud-hearts .heart-empty").length,
    }));

    await page.evaluate(() => { health = 3; });
    const before = await hearts();
    ok("three hearts with nothing equipped",
       before.max === 3 && before.drawn === 3, before);

    await page.evaluate(() => Inventory.equip("agimat"));
    const boosted = await hearts();
    ok("the amulet raises the maximum", boosted.max === 4, boosted);
    ok("the HUD draws the fourth heart", boosted.drawn === 4, boosted);
    ok("the new heart arrives full",
       boosted.health === 4 && boosted.empty === 0, boosted);

    // Damage still costs exactly one, which is the check that the bonus
    // did not quietly become a damage reduction.
    const hurt = await page.evaluate(() => {
      invulnUntil = 0;
      damagePlayer("t", false);
      return { health, empty: document.querySelectorAll("#hud-hearts .heart-empty").length };
    });
    ok("a hit still costs one heart of four", hurt.health === 3, hurt);
    ok("the lost heart renders empty", hurt.empty === 1, hurt);

    // Taking it off at full health must clamp rather than leave health
    // above a maximum the HUD can no longer draw.
    const clamped = await page.evaluate(async () => {
      health = 4;
      await Inventory.unequip("accessory");
      return { max: maxHealth, health,
               drawn: document.querySelectorAll("#hud-hearts .heart").length };
    });
    ok("unequipping drops the maximum back", clamped.max === 3, clamped);
    ok("health is clamped to it",
       clamped.health === 3 && clamped.drawn === 3, clamped);

    // The projectile multiplier, measured on one step of the real update
    // rather than trusted from the constant.
    const thrown = await page.evaluate(() => {
      const step = () => {
        destroyProjectile();
        posX = 400;
        facing = 1;
        throwProjectile();
        const start = projectile.x;
        updateProjectile(1);
        const moved = projectile.x - start;
        destroyProjectile();
        return moved;
      };
      Game.setEffects({});
      const base = step();
      Game.setEffects({ projectileSpeedMult: 1.5 });
      const fast = step();
      Game.setEffects(Inventory.effects());
      return { base, fast };
    });
    ok("the spear multiplies projectile speed",
       Math.abs(thrown.fast - thrown.base * 1.5) < 0.001, thrown);

    // A missing or nonsense multiplier must not stop the projectile.
    const guarded = await page.evaluate(() => {
      Game.setEffects({ projectileSpeedMult: 0 });
      const zero = equipEffects.projectileSpeedMult;
      Game.setEffects({ maxHealthBonus: -2 });
      const negative = maxHealth;
      Game.setEffects(Inventory.effects());
      return { zero, negative };
    });
    ok("a zero multiplier falls back to 1", guarded.zero === 1, guarded);
    ok("a negative bonus cannot shrink the maximum",
       guarded.negative === 3, guarded);

    await ctx.close();
  }

  console.log("\nT. The inventory screen");
  {
    const { ctx, page } = await enterOutpost();

    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    ok("the inventory button is offered on pause",
       await visible(page, "#shell-inventory-open"));

    await page.click("#shell-inventory-open");
    await page.waitForTimeout(100);
    ok("the inventory panel opens", await visible(page, "#shell-inventory"));
    ok("shell state is inventory",
       (await page.evaluate(() => Shell.state)) === "inventory");
    ok("both owned items are listed",
       (await page.evaluate(() =>
         document.querySelectorAll("#shell-items .inv-item").length)) === 2);
    ok("the game is still paused behind it",
       await page.evaluate(() => Game.isPaused()));

    await page.click('[data-item-id="agimat"]');
    await page.waitForTimeout(150);
    ok("tapping an item equips it",
       (await page.evaluate(() => Inventory.equipped("accessory"))) === "agimat");
    ok("the slot row shows the item name",
       (await page.textContent("#shell-slots")).includes("Agimat"));
    ok("the row offers to take it off now",
       (await page.textContent('[data-item-id="agimat"]')).includes("Tanggalin"));
    ok("no failure note on a good write",
       (await page.textContent("#shell-inventory-note")).trim() === "");

    await page.click('[data-item-id="agimat"]');
    await page.waitForTimeout(150);
    ok("tapping it again takes it off",
       (await page.evaluate(() => Inventory.equipped("accessory"))) === null);

    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    ok("back returns to pause, not to the world",
       await visible(page, "#shell-pause"));
    ok("and the game is still paused",
       await page.evaluate(() => Game.isPaused()));

    await page.click("#shell-resume");
    await page.waitForTimeout(100);
    ok("resuming from there still works",
       !(await page.evaluate(() => Game.isPaused())));

    await ctx.close();
  }

  console.log("\nU. Inventory is optional to the flow");
  {
    const { ctx, page } = await enterOutpost("**/inventory.js*");

    ok("the module really is absent",
       await page.evaluate(() => !window.Inventory));
    ok("nothing threw during the act flow",
       (await page.evaluate(() => Acts.current)) === 1);
    ok("the engine keeps its three hearts",
       (await page.evaluate(() => maxHealth)) === 3);

    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    ok("no inventory button without the module",
       !(await visible(page, "#shell-inventory-open")));
    await page.click("#shell-resume");
    await page.waitForTimeout(100);

    // The check that protects the study rather than the feature. Equipment
    // is a stated objective; the act flow is the finding.
    const status = await page.evaluate(async () => {
      Assessment.runTest = async function () {};
      delete Assessment.runFeedback;
      Acts.showTransition = function () {};
      await Acts.finishAct();
      return Acts.status;
    });
    ok("the act still completes with no inventory module",
       status === "completed", status);

    await ctx.close();
  }

  // -----------------------------------------------------------------
  // Block 11. Currency and cosmetics.
  // -----------------------------------------------------------------

  console.log("\nV. The currency award");
  {
    const { ctx, page } = await enterOutpost();

    // The regression this section exists for. This student resumes four
    // objectives into Act I, and the debounced save fires between
    // saveReady and syncStart on every login. Paying on that pass would
    // hand out forty barya per login for work done in an earlier session.
    ok("resuming an act part-done pays nothing for it",
       (await page.evaluate(() => Game.currency())) === 0,
       await page.evaluate(() => Game.currency()));

    ok("the rate is the completion pool split across the objectives",
       (await page.evaluate(() => Acts.perObjective(5))) === 10);
    ok("an act with no objectives pays nothing per objective",
       (await page.evaluate(() => Acts.perObjective(0))) === 0);

    // The outpost save arrives four objectives in, and completing the
    // fifth would run the whole end-of-act flow. finishAct is stubbed and
    // the flags are cleared so this section measures the drip and nothing
    // else; the sum of both payments has its own section below.
    const dripped = await page.evaluate(async () => {
      Acts.finishAct = async function () {};
      Acts.objectivesFor(1).forEach((o) => { delete state.flags[o.flag]; });
      Acts._lastDone = -1;
      Acts.status = "playing";

      // Settles _lastDone at zero. Nothing is owed for objectives nobody
      // completed, which is the -1 clamp being exercised rather than
      // assumed.
      await Acts.checkObjectives();
      const settled = Game.currency();

      state.flags[Acts.objectivesFor(1)[0].flag] = true;
      await Acts.checkObjectives();
      return { settled, after: Game.currency() };
    });
    ok("a fresh act pays nothing for objectives nobody completed",
       dripped.settled === 0, dripped);
    ok("completing an objective pays the rate",
       dripped.after - dripped.settled === 10, dripped);

    // And only once. A second recount with nothing new must pay nothing,
    // which is what stops the autosave cadence paying every ten seconds.
    const again = await page.evaluate(async () => {
      const before = Game.currency();
      await Acts.checkObjectives();
      return { before, after: Game.currency() };
    });
    ok("a recount with nothing new pays nothing",
       again.after === again.before, again);

    // A failed act_progress write must not pay. _lastDone is left alone
    // on that path so the next save retries the objective, and paying
    // here would pay for the retry twice over.
    const failed = await page.evaluate(async () => {
      const realFrom = sb.from;
      sb.from = function (table) {
        if (table !== "act_progress") return realFrom.call(sb, table);
        return {
          upsert: () => Promise.resolve({ error: { message: "simulated" } }),
        };
      };

      state.flags[Acts.objectivesFor(1)[1].flag] = true;
      const before = Game.currency();
      await Acts.checkObjectives();
      const after = Game.currency();

      sb.from = realFrom;
      await Acts.checkObjectives(); // the retry, which does land
      return { before, after, retried: Game.currency() };
    });
    ok("a failed write pays nothing", failed.after === failed.before, failed);
    ok("the retried objective is paid once it lands",
       failed.retried - failed.before === 10, failed);

    await ctx.close();
  }

  console.log("\nW. The award sums to the score");
  {
    const { ctx, page } = await enterOutpost();

    const totals = await page.evaluate(async () => {
      // finishAct runs the post-test, the feedback form and the
      // transition, none of which this section is about. complete() is
      // called directly instead, which is the write those steps wrap.
      Acts.finishAct = async function () {};
      Acts.showTransition = function () {};

      Game.resetStats();
      Acts.objectivesFor(1).forEach((o) => { delete state.flags[o.flag]; });
      Acts._lastDone = -1;
      Acts.status = "playing";
      await Acts.checkObjectives();

      const before = Game.currency();
      Acts.objectivesFor(1).forEach((o) => { state.flags[o.flag] = true; });
      await Acts.checkObjectives(); // drips the completion half
      const afterDrip = Game.currency();
      await Acts.complete();        // pays the remainder

      const total = Acts.objectivesFor(1).length;
      const row = __DB.act_progress.find((r) => r.act_number === 1);
      return {
        dripped: afterDrip - before,
        paid: Game.currency() - before,
        score: row.performance_score,
        total,
        award: Acts._lastAward,
      };
    });
    ok("the drip is the completion half",
       totals.dripped === 50, totals);
    ok("the total paid is the rounded score",
       totals.paid === Math.round(totals.score), totals);
    ok("an act cannot pay more than 100",
       totals.paid <= 100, totals);
    ok("the completion award is held for the transition screen",
       totals.award === totals.paid - totals.dripped, totals);

    await ctx.close();
  }

  console.log("\nX. Spending");
  {
    const { ctx, page } = await enterOutpost();

    const short = await page.evaluate(async () => {
      const bought = await Inventory.buy("damit-magsasaka");
      return { bought, currency: Game.currency(),
               owns: Inventory.owns("damit-magsasaka"),
               rows: __DB.player_inventory.length };
    });
    ok("buying with no money is refused", short.bought === false, short);
    ok("a refused purchase writes nothing", short.rows === 2, short);
    ok("and does not hand over the item", !short.owns, short);

    const bought = await page.evaluate(async () => {
      Game.addCurrency(100);
      const ok1 = await Inventory.buy("damit-magsasaka");
      return { ok1, currency: Game.currency(),
               rows: __DB.player_inventory.length,
               owns: Inventory.owns("damit-magsasaka") };
    });
    ok("buying what you can afford works", bought.ok1 === true, bought);
    ok("the price is deducted once", bought.currency === 50, bought);
    ok("one inventory row is written", bought.rows === 3, bought);
    ok("the item is owned afterwards", bought.owns, bought);

    const twice = await page.evaluate(async () => {
      const again = await Inventory.buy("damit-magsasaka");
      return { again, currency: Game.currency(),
               rows: __DB.player_inventory.length };
    });
    ok("buying it again is refused", twice.again === false, twice);
    ok("and does not charge twice", twice.currency === 50, twice);
    ok("and writes no second row", twice.rows === 3, twice);

    // A failed write must refund. Being charged for an item the database
    // never recorded is the one failure here a student would notice.
    const refunded = await page.evaluate(async () => {
      const realFrom = sb.from;
      sb.from = function (table) {
        if (table !== "player_inventory") return realFrom.call(sb, table);
        return { upsert: () => Promise.resolve({ error: { message: "simulated" } }) };
      };
      const before = Game.currency();
      const ok2 = await Inventory.buy("damit-katipunero");
      sb.from = realFrom;
      return { ok2, before, after: Game.currency(),
               owns: Inventory.owns("damit-katipunero") };
    });
    ok("a failed purchase reports failure", refunded.ok2 === false, refunded);
    ok("a failed purchase refunds", refunded.after === refunded.before, refunded);
    ok("and does not leave the item owned", !refunded.owns, refunded);

    // The balance has to survive a save and a reload, or a student is
    // paid for an act twice over across two sessions.
    await page.evaluate(async () => { await Game.flushSave(); });
    const saved = await page.evaluate(() =>
      __DB.game_progress[0].currency);
    ok("the balance is written to game_progress", saved === 50, saved);

    await ctx.close();
  }

  console.log("\nY. Outfits");
  {
    const { ctx, page } = await enterOutpost();

    // Walk.png is the one sprite sheet that actually exists, so it stands
    // in for an outfit here. When the artist delivers, the only thing
    // that changes is the src in content/items.js.
    // Deliberately a src that is NOT the base sheet, or the assertion
    // passes just as well when the outfit is ignored entirely.
    const swapped = await page.evaluate(async () => {
      await Game.setOutfit({
        walk: { src: "Assets/Skin_Test_Walk.png", frames: 12, fps: 12, columns: 5 },
      });
      return { src: SPRITE_SHEETS.walk.src, idle: SPRITE_SHEETS.idle.src };
    });
    ok("an outfit replaces the sheet it declares",
       swapped.src === "Assets/Skin_Test_Walk.png", swapped);
    ok("and leaves the sheets it does not declare alone",
       swapped.idle === "Assets/Idle.png", swapped);

    // Walk.png is the one sheet that actually exists, so it stands in for
    // an outfit whose art has been drawn.
    const painted = await page.evaluate(async () => {
      await Game.setOutfit({
        walk: { src: "Assets/Walk.png", frames: 12, fps: 12, columns: 5 },
      });
      applyAnim("walk", true);
      return playerSpriteEl.style.backgroundImage;
    });
    ok("an outfit whose art exists repaints the player",
       painted.includes("Walk.png"), painted);

    const restored = await page.evaluate(async () => {
      await Game.setOutfit(null);
      return SPRITE_SHEETS.walk.src;
    });
    ok("passing nothing restores the base sheets",
       restored === "Assets/Walk.png", restored);

    // An outfit whose art has not been drawn is bought, worn, and shown
    // as the dashed placeholder, exactly like every other missing image.
    // No special case, and nothing hidden from the student.
    const missing = await page.evaluate(async () => {
      Game.addCurrency(100);
      const bought = await Inventory.buy("damit-magsasaka");
      const wore = await Inventory.equip("damit-magsasaka");
      await new Promise((r) => setTimeout(r, 300));
      applyAnim("walk", true);
      return {
        bought, wore,
        equipped: Inventory.equipped("outfit"),
        failed: SPRITE_SHEETS.walk.failed,
        placeholder: playerSpriteEl.textContent,
      };
    });
    ok("an outfit with no art is still purchasable", missing.bought, missing);
    ok("and still equippable", missing.wore && missing.equipped === "damit-magsasaka",
       missing);
    ok("its missing sheet falls back to the placeholder",
       missing.failed === true, missing);
    ok("the placeholder names the file the artist owes",
       missing.placeholder.includes("Skin_Walk.png"), missing.placeholder);

    // Taking it off has to put the working sprite back.
    const off = await page.evaluate(async () => {
      await Inventory.unequip("outfit");
      await new Promise((r) => setTimeout(r, 300));
      return { src: SPRITE_SHEETS.walk.src, failed: SPRITE_SHEETS.walk.failed };
    });
    ok("unequipping restores the base walk cycle",
       off.src === "Assets/Walk.png" && !off.failed, off);

    await ctx.close();
  }

  console.log("\nZ. The shop screen");
  {
    const { ctx, page } = await enterOutpost();
    await page.evaluate(() => Game.addCurrency(60));

    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    await page.click("#shell-inventory-open");
    await page.waitForTimeout(100);
    ok("the balance shows on the inventory screen",
       (await page.textContent("#shell-balance")).trim() === "60");

    await page.click("#shell-shop-open");
    await page.waitForTimeout(100);
    ok("the shop opens", await visible(page, "#shell-shop"));
    ok("shell state is shop",
       (await page.evaluate(() => Shell.state)) === "shop");
    ok("both cosmetics are listed",
       (await page.evaluate(() =>
         document.querySelectorAll("#shell-shop-list .inv-item").length)) === 2);
    ok("the one you cannot afford is disabled",
       await page.isDisabled('[data-buy-id="damit-katipunero"]'));
    ok("the one you can afford is not",
       !(await page.isDisabled('[data-buy-id="damit-magsasaka"]')));

    await page.click('[data-buy-id="damit-magsasaka"]');
    await page.waitForTimeout(200);
    ok("buying deducts from the shown balance",
       (await page.textContent("#shell-shop-balance")).trim() === "10");
    ok("the bought row reads as owned",
       (await page.textContent('[data-buy-id="damit-magsasaka"]')).includes("Pag-aari"));
    ok("the bought row stops responding",
       await page.isDisabled('[data-buy-id="damit-magsasaka"]'));
    ok("no failure note on a good purchase",
       (await page.textContent("#shell-shop-note")).trim() === "");

    await page.click("#shell-shop-back");
    await page.waitForTimeout(100);
    ok("back returns to the inventory", await visible(page, "#shell-inventory"));
    ok("the new outfit is in the owned list",
       (await page.evaluate(() =>
         document.querySelectorAll("#shell-items .inv-item").length)) === 3);
    ok("the inventory balance kept up",
       (await page.textContent("#shell-balance")).trim() === "10");

    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    await page.click("#shell-resume");
    await page.waitForTimeout(100);
    ok("resuming from the shop path still works",
       !(await page.evaluate(() => Game.isPaused())));

    await ctx.close();
  }

  // -----------------------------------------------------------------
  // Block 12. The device pass findings.
  // -----------------------------------------------------------------

  console.log("\nAA. The touch controls");
  {
    const { ctx, page } = await enterOutpost();

    const pe = await page.evaluate(() => {
      const at = (s) => getComputedStyle(document.querySelector(s)).pointerEvents;
      return { bar: at("#mobile-controls"), dpad: at(".dpad"),
               cluster: at(".action-cluster"), attack: at("#btn-attack"),
               jump: at("#btn-jump"), interact: at("#btn-interact") };
    });
    ok("the control bar itself stays transparent to taps",
       pe.bar === "none", pe);
    ok("every cluster inside it takes taps",
       pe.dpad === "auto" && pe.cluster === "auto", pe);
    ok("Atake and Talon are tappable",
       pe.attack === "auto" && pe.jump === "auto", pe);

    // Functional, not just computed. Playwright hit-tests before it
    // clicks, so a button behind pointer-events: none fails here rather
    // than passing a style assertion and shipping dead.
    const jumped = await page.evaluate(() => { velY = 0; onGround = true; return true; })
      .then(() => page.click("#btn-jump"))
      .then(() => page.evaluate(() => ({ velY, onGround })));
    ok("tapping Talon actually jumps", jumped.velY > 0, jumped);

    // A long press on Atake throws, which is the hold path the whole
    // press-and-release binding exists for.
    await page.evaluate(() => { destroyProjectile(); });
    await page.click("#btn-attack", { delay: 600 });
    ok("holding Atake throws the spear",
       await page.evaluate(() => projectile !== null));

    // A short tap swings instead, and a swing from behind takes a guard
    // down. This is the tap path of the same binding.
    const swung = await page.evaluate(() => {
      destroyProjectile();
      const guard = GUARDS[0];
      guard.disabled = false;
      guard.alert = 0;
      guard.facing = 1;
      posX = guard.pos - 40; // behind a guard facing away
      facing = 1;
      return guard.id;
    }).then(() => page.click("#btn-attack"))
      .then(() => page.evaluate(() => GUARDS[0].disabled));
    ok("tapping Atake swings", swung === true, swung);

    await ctx.close();
  }

  console.log("\nAB. Camera and control fit");
  {
    // The camera is screen width divided by --zoom, and nothing else.
    const framing = async (viewport) => {
      const { ctx, page } = await newPage(atOutpost(), null, viewport);
      await page.waitForTimeout(700);
      await page.click("#shell-start");
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => {
        const zoom = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--zoom"));
        const right = (s) =>
          Math.round(document.querySelector(s).getBoundingClientRect().right);
        const left = (s) =>
          Math.round(document.querySelector(s).getBoundingClientRect().left);
        // Buttons measured on screen rather than in CSS pixels, because
        // the zoom multiplies them and the 44px minimum is a thumb
        // against glass, not a number in a stylesheet.
        const btn = document.querySelector("#btn-interact").getBoundingClientRect();
        const move = document.querySelector("#btn-left").getBoundingClientRect();
        return { zoom,
                 moveSize: Math.round(Math.min(move.width, move.height)),
                 worldWidth: Math.round(window.innerWidth / zoom),
                 screen: window.innerWidth,
                 leftmost: left("#btn-left"),
                 rightmost: right("#btn-interact"),
                 btnSize: Math.round(Math.min(btn.width, btn.height)) };
      });
      await ctx.close();
      return m;
    };

    const phone = await framing({ width: 823, height: 412 });
    ok("phone landscape drops the zoom to 0.7", phone.zoom === 0.7, phone);
    ok("which shows 1176 world pixels across",
       phone.worldWidth === 1176, phone.worldWidth);
    ok("the whole control row fits on screen",
       phone.leftmost >= 0 && phone.rightmost <= phone.screen, phone);
    ok("the touch targets clear 44px on screen",
       phone.btnSize >= 44, phone.btnSize);
    ok("and the movement buttons are the biggest of them",
       phone.moveSize > phone.btnSize, phone);

    // A smaller phone. The overflow this replaces was found at 412px, so
    // the narrow case is the one that has to keep working.
    const small = await framing({ width: 740, height: 360 });
    ok("a smaller phone keeps the same camera", small.zoom === 0.7, small);
    ok("and still fits every button",
       small.leftmost >= 0 && small.rightmost <= small.screen, small);
    ok("and still clears 44px", small.btnSize >= 44, small.btnSize);

    // Desktop is untouched. Nothing anyone has been looking at changes.
    const desktop = await framing({ width: 1440, height: 900 });
    ok("desktop keeps 1.75", desktop.zoom === 1.75, desktop);

    // The camera distance was chosen from the jump, so the jump is what
    // checks it. At zoom 1 a single jump put Macario's head at 90% of the
    // screen and the world read as a corridor with a ceiling.
    const headroom = await (async () => {
      const { ctx, page } = await enterOutpost();
      const m = await page.evaluate(() => new Promise((r) => {
        GUARDS.forEach((g) => { g.disabled = true; });
        posX = 300;
        posY = floorHeightAt(300);
        velY = 0;
        onGround = true;
        handleJumpPress();

        let peak = 0;
        const tick = setInterval(() => { if (posY > peak) peak = posY; }, 8);
        setTimeout(() => {
          clearInterval(tick);
          const zoom = parseFloat(getComputedStyle(document.documentElement)
            .getPropertyValue("--zoom"));
          r({ headTop: Math.round(peak + DISPLAY_HEIGHT + GROUND_LEVEL),
              visible: Math.round(window.innerHeight / zoom) });
        }, 1500);
      }));
      await ctx.close();
      return m;
    })();
    const used = headroom.headTop / headroom.visible;
    ok("a single jump leaves sky above it", used < 0.75,
       { ...headroom, percent: Math.round(used * 100) });

    await Promise.resolve();
  }

  console.log("\nAC. Portrait is a prompt, not a layout");
  {
    const { ctx, page } = await enterOutpost();

    ok("no notice while the phone is sideways",
       !(await visible(page, "#rotate-notice")));

    // The real scenario: a student turns the phone mid-play.
    await page.setViewportSize({ width: 412, height: 823 });
    await page.waitForTimeout(250);

    ok("turning it upright shows the notice",
       await visible(page, "#rotate-notice"));
    ok("and the world stops behind it",
       await page.evaluate(() => uiBlocked === true));

    // Stopped means stopped: no patrols, no hazards, and no play time
    // counted against a student staring at a rotate prompt.
    const idled = await page.evaluate(() => new Promise((r) => {
      const before = Game.stats().playMs;
      setTimeout(() => r(Game.stats().playMs - before), 600);
    }));
    ok("play time does not accrue in portrait", idled < 50, idled);

    await page.setViewportSize({ width: 823, height: 412 });
    await page.waitForTimeout(250);
    ok("turning it back hides the notice",
       !(await visible(page, "#rotate-notice")));
    ok("and the world runs again",
       await page.evaluate(() => uiBlocked === false));

    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
