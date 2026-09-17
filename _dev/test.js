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
// content/act1.js and content/items.js are ALSO intercepted, for tests
// that need a populated gameplay scene or item catalogue. Shipped
// content is a deliberate blank slate (see the header comments in
// those two files); the guard, hazard, hideSpot, platform, pickup and
// shop/equip mechanics they used to exercise are still real, finished
// engine code and still deserve full coverage, so FIXTURE_ACT1_JS and
// FIXTURE_ITEMS_JS below stand in for that content ONLY inside this
// harness. They are not a second copy of production content to keep
// in sync — they exist purely to give the engine something to chew on
// and are free to diverge from whatever content/act1.js and
// content/items.js actually ship. enterTestRoom() is the one place
// that wires this substitution in; a test that wants the REAL shipped
// content instead (Blocks A, C, D, E) calls newPage() directly and
// never sees the fixtures.
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

// A gameplay skeleton equivalent to the misyon scene an earlier pass of
// content/act1.js shipped: same guard, hazard, hideSpot, platform and
// pickup tuning, so every downstream assertion built against those exact
// numbers keeps meaning what it always meant. tondo is present only so
// loadScene("tondo") (Block G) has somewhere to go; nothing here needs it
// to carry an NPC. Five objectives, not one, because Acts.perObjective and
// the drip math below are tuned against 50 dividing evenly across them.
const FIXTURE_ACT1_JS = `
window.ACT_1 = {
  number: 1,
  title: "Origins",
  titleTagalog: "Ang Pinagmulan ni Macario",
  objectives: [
    { id: "pinagmulan", label: "Alamin ang pinagmulan", flag: "nalamanAngPinagmulan" },
    { id: "entablado", label: "Umarte sa entablado", flag: "deathSequenceDone" },
    { id: "katipunan", label: "Sumapi sa Katipunan", flag: "sumapiSaKatipunan" },
    { id: "mensahe", label: "Ihatid ang lihim na mensahe", flag: "naihatidAngMensahe" },
    { id: "pag-alis", label: "Magpaalam sa dating buhay", flag: "nagpaalam" },
  ],
  startingQuests: [{ id: "pinagmulan", text: "Test" }],
  scenes: [
    { id: "tondo", worldWidth: 2352, startX: 80, npcs: [] },
    {
      id: "misyon",
      worldWidth: 2940,
      startX: 80,
      dangerous: true,
      npcs: [],
      platforms: [{ x: 650, y: 150, width: 220 }],
      pickups: [{ id: "misyon-puso", x: 730, y: 150, type: "heart" }],
      guards: [{
        id: "guwardiya", x: 1800, patrolFrom: 1400, patrolTo: 2200,
        speed: 1.4, facing: 1, detectRadius: 300, alertRate: 0.01, decayRate: 0.02,
      }],
      hideSpots: [{ x: 1650, width: 110 }],
      hazards: [{ x: 2500, width: 90, reason: "Test hazard" }],
    },
  ],
};
`;

// The item catalogue the shop/equip/effect sections (Block 10, P-Z) were
// written against: two granted equipment items, two priced outfits and
// one priced consumable (Block 22), same ids, prices and effects the
// assertions check by name. Kept separate from content/items.js on
// purpose (see that file's header).
const FIXTURE_ITEMS_JS = `
window.ITEMS = [
  {
    id: "sibat", name: "Magaan na Sibat", kind: "equipment", slot: "weapon",
    price: 0, img: "Assets/Sibat.png", grantedOnAct: 1,
    effect: { projectileSpeedMult: 1.5 },
  },
  {
    id: "agimat", name: "Agimat", kind: "equipment", slot: "accessory",
    price: 0, img: "Assets/Agimat.png", grantedOnAct: 1,
    effect: { maxHealthBonus: 1 },
  },
  {
    id: "damit-magsasaka", name: "Damit ng Magsasaka", kind: "cosmetic",
    slot: "outfit", price: 50, img: "Assets/Skin_Walk.png",
    sheets: { walk: { src: "Assets/Skin_Walk.png", frames: 12, fps: 12, columns: 5 } },
  },
  {
    id: "damit-katipunero", name: "Uniporme ng Katipunero", kind: "cosmetic",
    slot: "outfit", price: 90, img: "Assets/Skin_Uniporme_Walk.png",
    sheets: { walk: { src: "Assets/Skin_Uniporme_Walk.png", frames: 12, fps: 12, columns: 5 } },
  },
  {
    id: "gatas", name: "Gatas ng Kalabaw", kind: "consumable",
    price: 3, img: "Assets/Gatas.png",
    effect: { maxHealthBonus: 1 },
  },
];
`;

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

  // block is either a URL pattern to serve empty (the original use: testing
  // a page that loaded without one of its optional files, with empty rather
  // than a 404 to keep the console clean so a real error still stands out
  // in the pageerror handler above), or an array of { pattern, body }
  // route specs for substituting real content — how enterTestRoom() below
  // wires in the fixture scene and item catalogue.
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
      const specs = Array.isArray(block) ? block : [{ pattern: block, body: "" }];
      for (const spec of specs) {
        await page.route(spec.pattern, (route) =>
          route.fulfill({ body: spec.body || "", contentType: "text/javascript" }));
      }
    }

    await page.addInitScript((s) => { window.__TEST = s; }, testState);
    await page.goto("http://localhost:" + PORT + "/index.html");
    return { ctx, page };
  }

  // The two fixture routes enterTestRoom() always installs, so every
  // section that resumes into a populated act gets the same gameplay
  // skeleton and item catalogue regardless of what content/act1.js and
  // content/items.js actually ship. extra appends further routes (Block
  // U passes one to blackhole inventory.js itself) without replacing these.
  function fixtureRoutes(extra) {
    const routes = [
      { pattern: "**/content/act1.js*", body: FIXTURE_ACT1_JS },
      { pattern: "**/content/items.js*", body: FIXTURE_ITEMS_JS },
    ];
    if (extra) {
      if (Array.isArray(extra)) routes.push(...extra);
      else routes.push({ pattern: extra, body: "" });
    }
    return routes;
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

  console.log("\nB. Returning student, mid Act I in the misyon scene");
  {
    const state = {
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: "misyon", is_night: true,
        save_state: { quests: [], flags: { nalamanAngPinagmulan: true, deathSequenceDone: true, sumapiSaKatipunan: true }, posX: 200 } }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 3 }],
    };
    const { ctx, page } = await newPage(state, fixtureRoutes());
    await page.waitForTimeout(700);
    ok("title screen visible on resume", await visible(page, "#shell"));
    ok("start button reads Magpatuloy", (await page.textContent("#shell-start")).trim() === "Magpatuloy",
       (await page.textContent("#shell-start")).trim());
    ok("still gated, not yet playing", (await page.evaluate(() => Shell.state)) === "title");
    ok("resumed into the stored scene rather than the first one",
       (await page.evaluate(() => currentRoom)) === "misyon", await page.evaluate(() => currentRoom));

    await page.click("#shell-start");
    await page.waitForTimeout(400);
    ok("entered the world", (await page.evaluate(() => Shell.state)) === "playing");
    ok("still in misyon after entry", (await page.evaluate(() => currentRoom)) === "misyon");
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

    // Marks the save dirty so logout has something to flush. A flag that
    // is deliberately NOT an objective: setting a real one here would
    // complete the act and run the entire end-of-act flow mid-test.
    await page.evaluate(() => { state.flags.__dirtyProbe = true; markDirty(); });
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
       (await page.evaluate(() => currentRoom)) === "tondo", await page.evaluate(() => currentRoom));
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

  // Puts a resuming student in the "misyon" scene with the world
  // already built — the dangerous scene, which is where the FIXTURE's
  // guard, hazard, hide spot and platform live (see FIXTURE_ACT1_JS
  // above; content/act1.js itself ships none of this right now). The
  // flags seeded here are the three fixture objectives that come
  // before it (origins, the stage, joining the Katipunan), so the
  // student arrives with the fourth objective, the message run, in
  // front of them.
  const atTestRoom = () => ({
    session: { user: { id: "u1" } },
    game_progress: [{ student_id: "u1", current_act: 1, current_room: "misyon", is_night: true,
      save_state: { quests: [], flags: { nalamanAngPinagmulan: true, deathSequenceDone: true, sumapiSaKatipunan: true }, posX: 200 } }],
    act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 3 }],
  });

  // Always installs the fixture routes (see FIXTURE_ACT1_JS /
  // FIXTURE_ITEMS_JS at the top of this file), so this fixture stays
  // independent of whatever content/act1.js and content/items.js
  // actually ship. extra is an additional block spec (Block U passes
  // one to blackhole inventory.js) layered on top of the fixture
  // routes rather than replacing them.
  async function enterTestRoom(extra) {
    const { ctx, page } = await newPage(atTestRoom(), fixtureRoutes(extra));
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
    const { ctx, page } = await enterTestRoom();

    // Guards are switched off for this section. The knockback from the
    // first band lands the player inside bantay-1's detection radius, so
    // leaving them on measures the stealth system rather than the hazard
    // one. Guards have their own checks in section H.
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    ok("hazards were built", (await page.evaluate(() => HAZARDS.length)) === 1);
    ok("hazard elements are in the world",
       (await page.evaluate(() => document.querySelectorAll(".hazard").length)) === 1);

    const hit = await standInHazard(page);
    ok("hazard costs exactly one health", hit.health === 2, hit.health);
    ok("hazard does not change the scene", hit.room === "misyon", hit.room);
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
    const { ctx, page } = await enterTestRoom();

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
      loadScene("tondo");
      loadScene("misyon");
      return { collected: collectedPickups.size, stillThere: !!document.querySelector(".pickup") };
    });
    ok("loadScene clears the collected set", afterReload.collected === 0, afterReload.collected);
    ok("pickup returns on a fresh visit", afterReload.stillThere);

    await ctx.close();
  }

  console.log("\nH. Dynamic difficulty and guard reset");
  {
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();
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
    const { ctx, page } = await enterTestRoom();

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
    const seeded = atTestRoom();
    seeded.game_progress[0].save_state.stats = {
      damageTaken: 4, detections: 3, playMs: 91000,
    };
    const { ctx, page } = await newPage(seeded, fixtureRoutes());
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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

    const shape = await page.evaluate(() => ({
      count: window.ITEMS.length,
      // A consumable is the one kind that must NOT carry a slot — there
      // is nothing to equip it into (see CLAUDE.md, Item data format) —
      // so wellFormed checks for a slot everywhere except there, rather
      // than requiring one unconditionally.
      wellFormed: window.ITEMS.every(
        (i) => i.id && i.kind && i.name &&
          (i.kind === "consumable" ? !i.slot : Boolean(i.slot))
      ),
      slots: window.ITEMS.map((i) => i.slot),
      equipment: window.ITEMS.filter((i) => i.kind === "equipment").length,
      cosmetics: window.ITEMS.filter((i) => i.kind === "cosmetic").length,
      consumables: window.ITEMS.filter((i) => i.kind === "consumable").length,
      // A cosmetic that carries an effect is not a cosmetic. This is the
      // check that stops the outfit slot quietly becoming a third
      // equipment slot.
      cosmeticsAreInert: window.ITEMS
        .filter((i) => i.kind === "cosmetic")
        .every((i) => !i.effect),
      granted: window.ITEMS.filter((i) => i.grantedOnAct === 1).length,
      priced: window.ITEMS.filter((i) => (i.price || 0) > 0).length,
    }));
    ok("the catalogue loaded", shape.count >= 5, shape.count);
    ok("every item has an id, kind and name, and a slot unless it is a consumable",
       shape.wellFormed, shape);
    ok("one weapon and one accessory",
       shape.slots.includes("weapon") && shape.slots.includes("accessory"),
       shape.slots);
    ok("two granted equipment items", shape.equipment === 2 && shape.granted === 2, shape);
    ok("two priced cosmetics and one priced consumable",
       shape.cosmetics === 2 && shape.consumables === 1 && shape.priced === 3, shape);
    ok("cosmetics carry no effect", shape.cosmeticsAreInert, shape);

    await ctx.close();
  }

  console.log("\nQ. Granting");
  {
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();
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
    const { ctx, page } = await enterTestRoom();

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

  console.log("\nT2. Shop and inventory reached directly, without pausing first");
  {
    // Block 13: #btn-inventory and #btn-shop sit next to #btn-pause in
    // the main UI, so a student can reach either screen in one tap
    // instead of pausing first. Opening either one still pauses the
    // world underneath, exactly as the pause-menu path always has;
    // what changes is only where "back" goes afterward.
    const { ctx, page } = await enterTestRoom();

    ok("the inventory button is offered in the main UI",
       await visible(page, "#btn-inventory"));
    ok("the shop button is offered in the main UI",
       await visible(page, "#btn-shop"));
    ok("neither is inside the pause overlay",
       await page.evaluate(() =>
         !document.getElementById("shell").contains(
           document.getElementById("btn-inventory")) &&
         !document.getElementById("shell").contains(
           document.getElementById("btn-shop"))));

    await page.click("#btn-inventory");
    await page.waitForTimeout(100);
    ok("tapping it opens the inventory panel directly",
       await visible(page, "#shell-inventory"));
    ok("shell state is inventory", (await page.evaluate(() => Shell.state)) === "inventory");
    ok("the world paused itself for the visit",
       await page.evaluate(() => Game.isPaused()));

    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    ok("back skips pause entirely",
       !(await visible(page, "#shell-pause")));
    ok("the shell overlay is hidden again",
       await page.evaluate(() =>
         document.getElementById("shell").classList.contains("hidden")));
    ok("shell state is back to playing",
       (await page.evaluate(() => Shell.state)) === "playing");
    ok("and the world is actually running again",
       !(await page.evaluate(() => Game.isPaused())));

    await page.click("#btn-shop");
    await page.waitForTimeout(100);
    ok("tapping the shop button opens the shop panel directly, skipping inventory",
       await visible(page, "#shell-shop"));
    ok("shell state is shop", (await page.evaluate(() => Shell.state)) === "shop");
    ok("the world paused itself for this visit too",
       await page.evaluate(() => Game.isPaused()));

    await page.click("#shell-shop-back");
    await page.waitForTimeout(100);
    ok("back from a direct shop visit also resumes the world, not inventory",
       (await page.evaluate(() => Shell.state)) === "playing" &&
       !(await page.evaluate(() => Game.isPaused())));

    // Chained: direct inventory, then into shop from inside it, then
    // back out through both. Each hop should land where it came from.
    await page.click("#btn-inventory");
    await page.waitForTimeout(100);
    await page.click("#shell-shop-open");
    await page.waitForTimeout(100);
    ok("shop reached from a direct inventory visit still opens",
       await visible(page, "#shell-shop"));
    await page.click("#shell-shop-back");
    await page.waitForTimeout(100);
    ok("backing out of that shop returns to inventory, not the world",
       await visible(page, "#shell-inventory") &&
       (await page.evaluate(() => Shell.state)) === "inventory");
    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    ok("and backing out of that inventory finally resumes the world",
       (await page.evaluate(() => Shell.state)) === "playing" &&
       !(await page.evaluate(() => Game.isPaused())));

    // The pause-menu path is untouched by any of the above: pause,
    // then inventory, still returns to pause rather than the world.
    await page.click("#btn-pause");
    await page.waitForTimeout(100);
    await page.click("#shell-inventory-open");
    await page.waitForTimeout(100);
    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    ok("the pause-menu route into inventory still returns to pause",
       await visible(page, "#shell-pause"));
    await page.click("#shell-resume");
    await page.waitForTimeout(100);

    await ctx.close();
  }

  console.log("\nU. Inventory is optional to the flow");
  {
    const { ctx, page } = await enterTestRoom("**/inventory.js*");

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
    const { ctx, page } = await enterTestRoom();

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
       swapped.idle === "Assets/Prefab/Macario_Idle.png", swapped);

    // A harness-owned fixture stands in for "an outfit whose art has been
    // drawn" — deliberately NOT the base walk sheet. This section only
    // needs to prove an outfit with real, loadable art actually repaints
    // the player; it should not care whether the base walk cycle currently
    // ships for real or not, and _dev/fixtures/test-outfit-walk.png
    // stays put either way.
    const painted = await page.evaluate(async () => {
      await Game.setOutfit({
        walk: { src: "_dev/fixtures/test-outfit-walk.png", frames: 12, fps: 12, columns: 5 },
      });
      applyAnim("walk", true);
      return playerSpriteEl.style.backgroundImage;
    });
    ok("an outfit whose art exists repaints the player",
       painted.includes("test-outfit-walk.png"), painted);

    const restored = await page.evaluate(async () => {
      await Game.setOutfit(null);
      return SPRITE_SHEETS.walk.src;
    });
    ok("passing nothing restores the base sheets",
       restored === "Assets/Prefab/Macario_Walking.png", restored);

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
       off.src === "Assets/Prefab/Macario_Walking.png" && !off.failed, off);

    await ctx.close();
  }

  console.log("\nZ. The shop screen");
  {
    const { ctx, page } = await enterTestRoom();
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
    ok("both cosmetics and the consumable are listed",
       (await page.evaluate(() =>
         document.querySelectorAll("#shell-shop-list .inv-item").length)) === 3);
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
    const { ctx, page } = await enterTestRoom();

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
      const { ctx, page } = await newPage(atTestRoom(), fixtureRoutes(), viewport);
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
      const { ctx, page } = await enterTestRoom();
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
    const { ctx, page } = await enterTestRoom();

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

  console.log("\nAD. Every button carries an icon");
  {
    const { ctx, page } = await enterTestRoom();

    // The sprite has to be in the document, or every <use> in the page
    // resolves to nothing and draws a blank square rather than erroring.
    ok("the icon sprite is in the page",
       (await page.evaluate(() => {
         const s = document.getElementById("icon-sprite");
         return !!s && s.querySelectorAll("symbol").length;
       })) > 0);

    // Walked as a list rather than asserted one at a time, so a button
    // added later without an icon fails here instead of being noticed
    // on a phone. A missing symbol id fails too: an href pointing at a
    // symbol the sprite does not define renders nothing at all.
    const audit = await page.evaluate(() => {
      const ids = ["btn-left", "btn-right", "btn-attack", "btn-jump",
        "btn-interact", "btn-pause", "btn-inventory", "btn-shop",
        "gift-btn", "act-screen-btn",
        "quiz-btn", "quiz-back", "shell-start", "shell-title-settings",
        "shell-resume", "shell-inventory-open", "shell-pause-settings",
        "shell-logout", "shell-settings-back", "shell-reset",
        "shell-reset-yes", "shell-reset-no", "shell-shop-open",
        "shell-inventory-back", "shell-shop-back", "shell-logout-yes",
        "shell-logout-no", "auth-submit"];
      const missing = [];
      const dangling = [];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) { missing.push(id + " (no such button)"); return; }
        const use = el.querySelector(".ico use");
        if (!use) { missing.push(id); return; }
        const href = use.getAttribute("href") || "";
        if (!document.querySelector(href)) dangling.push(id + " -> " + href);
      });
      return { missing, dangling, counted: ids.length };
    });
    ok("every button in the shipping page has one", audit.missing.length === 0, audit.missing);
    ok("and every icon points at a symbol that exists",
       audit.dangling.length === 0, audit.dangling);

    // Icons go WITH labels. A pictogram alone is a guess, and the
    // audience gets one attempt each.
    const labelled = await page.evaluate(() =>
      ["btn-attack", "btn-jump", "shell-resume", "shell-logout", "shell-reset"]
        .filter((id) => {
          const l = document.getElementById(id).querySelector(".lbl");
          return !l || !l.textContent.trim();
        }));
    ok("the labels are still there beside them", labelled.length === 0, labelled);

    // THE BUTTON IS THE HIT TARGET, not the icon inside it. This is the
    // same fault class as the dead Atake button: the listeners are on
    // the buttons, so a tap on the icon still bubbles and the game
    // still works, which is exactly how it would have shipped.
    const hits = await page.evaluate(() => {
      const at = (id) => {
        const b = document.getElementById(id);
        const r = b.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return hit === b;
      };
      return { left: at("btn-left"), attack: at("btn-attack"),
               jump: at("btn-jump"), pause: at("btn-pause"),
               inventory: at("btn-inventory"), shop: at("btn-shop") };
    });
    ok("a tap in the middle of a button lands on the button",
       hits.left && hits.attack && hits.jump && hits.pause &&
       hits.inventory && hits.shop, hits);

    // And functionally, because a hit test is still a reading. AA
    // already clicks Atake and Talon; this is the pause button, which
    // now carries an icon and nothing else.
    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    ok("the pause button still opens pause with an icon in it",
       await visible(page, "#shell-pause"));
    await page.click("#shell-resume");
    await page.waitForTimeout(150);

    // Same reading for the two buttons added in Block 13.
    await page.click("#btn-inventory");
    await page.waitForTimeout(150);
    ok("the inventory button opens inventory with an icon in it",
       await visible(page, "#shell-inventory"));
    await page.click("#shell-inventory-back");
    await page.waitForTimeout(150);

    await page.click("#btn-shop");
    await page.waitForTimeout(150);
    ok("the shop button opens the shop with an icon in it",
       await visible(page, "#shell-shop"));
    await page.click("#shell-shop-back");
    await page.waitForTimeout(150);

    // The one the game loop rewrites every frame. Writing textContent
    // there wiped the icon on the first frame after the world was
    // drawn, which is how this check came to exist.
    const interact = await page.evaluate(() => new Promise((r) => {
      setTimeout(() => {
        const b = document.getElementById("btn-interact");
        r({ icon: !!b.querySelector(".ico use"),
            label: (b.querySelector(".lbl") || {}).textContent });
      }, 400);
    }));
    ok("the interact button keeps its icon through the game loop",
       interact.icon === true, interact);
    ok("and still says what it does", !!interact.label, interact);

    // The quiz button means two things, so its icon follows its label.
    const swapped = await page.evaluate(() => {
      Assessment._cache();
      Assessment._onButton("Susunod", () => {}, "i-right");
      const a = document.querySelector("#quiz-btn .ico use").getAttribute("href");
      Assessment._onButton("Ipasa ang sagot", () => {}, "i-check");
      const b = document.querySelector("#quiz-btn .ico use").getAttribute("href");
      return { a, b, label: document.querySelector("#quiz-btn .lbl").textContent };
    });
    ok("the quiz button's icon follows its label",
       swapped.a === "#i-right" && swapped.b === "#i-check", swapped);
    ok("and the label survives the button being replaced",
       swapped.label === "Ipasa ang sagot", swapped);

    // The answers themselves. There is no icon for an arbitrary
    // sentence, so a choice gets a lettered badge instead, which is
    // also what lets a teacher say "pindutin ang B" out loud. Driven
    // through the real render rather than a painted screen, because
    // the badge is written by assessment.js and not by index.html.
    const badges = await page.evaluate(() => {
      Assessment._cache();
      Assessment._askAll(
        [{ id: 1, question: "Saan isinilang si Sakay?",
           choices: ["Tondo", "Cavite", "Bulacan", "Batangas"] }],
        "Pagsusulit"
      );
      const els = [...document.querySelectorAll(".quiz-choice")];
      return {
        count: els.length,
        letters: els.map((e) => (e.querySelector(".qbadge") || {}).textContent),
        labels: els.map((e) => (e.querySelector(".lbl") || {}).textContent),
        hit: (() => {
          const b = els[1];
          const r = b.getBoundingClientRect();
          return document.elementFromPoint(r.left + 20, r.top + r.height / 2) === b;
        })(),
      };
    });
    ok("every answer gets a letter", badges.letters.join("") === "ABCD", badges);
    ok("and the answer text is still there",
       badges.labels[0] === "Tondo", badges);
    ok("a tap on an answer lands on the answer, not the badge",
       badges.hit === true, badges);

    await ctx.close();
  }

  console.log("\nAE. Sizes on the target device, with icons in");
  {
    const { ctx, page } = await enterTestRoom();

    // The diameters must not have moved. These are the same numbers
    // section AB measures; repeated here because stacking an icon over
    // a label inside a circle is exactly the change that would shrink
    // one without anyone noticing.
    const size = await page.evaluate(() => {
      const r = (s) => {
        const b = document.querySelector(s).getBoundingClientRect();
        return Math.round(Math.min(b.width, b.height));
      };
      return { move: r("#btn-left"), action: r("#btn-attack"),
               interact: r("#btn-interact"), pause: r("#btn-pause") };
    });
    ok("movement still clears 44px on screen", size.move >= 44, size);
    ok("the action buttons still do", size.action >= 44, size);
    ok("and so does the interact button", size.interact >= 44, size);

    // This one did NOT clear it before this block. 44 CSS pixels is 31
    // on glass once --zoom is applied, and the checks that measure a
    // rendered target only ever looked at the control cluster.
    ok("the pause button now clears it too", size.pause >= 44, size);

    // Labels shrank to make room for the icons, so they get a floor of
    // their own rather than being left to whatever fits.
    const type = await page.evaluate(() => {
      const z = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue("--zoom")) || 1;
      const f = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize) * z;
      return { move: f("#btn-left .lbl"), action: f("#btn-attack .lbl"), zoom: z };
    });
    ok("the movement label is still legible", type.move >= 12, type);
    ok("the action labels are still legible", type.action >= 10, type);

    // The icons have to survive the zoom too. Below about 12 on glass
    // a stroked pictogram stops reading as anything.
    const icons = await page.evaluate(() => {
      const z = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue("--zoom")) || 1;
      const w = (s) => document.querySelector(s).getBoundingClientRect().width;
      return { move: w("#btn-left .ico svg"), action: w("#btn-attack .ico svg"),
               shell: z };
    });
    ok("the movement icon is big enough to read", icons.move >= 18, icons);
    ok("and the action icon is", icons.action >= 14, icons);

    // The row still has to fit, which is the check the extra content
    // inside each button could have broken.
    const fits = await page.evaluate(() => {
      const bar = document.getElementById("mobile-controls");
      const kids = [...bar.querySelectorAll("button")];
      const left = Math.min(...kids.map((k) => k.getBoundingClientRect().left));
      const right = Math.max(...kids.map((k) => k.getBoundingClientRect().right));
      const top = Math.min(...kids.map((k) => k.getBoundingClientRect().top));
      const bottom = Math.max(...kids.map((k) => k.getBoundingClientRect().bottom));
      return { left, right, top, bottom, w: window.innerWidth, h: window.innerHeight };
    });
    ok("the whole control row still fits on screen",
       fits.left >= 0 && fits.right <= fits.w + 1 &&
       fits.top >= 0 && fits.bottom <= fits.h + 1, fits);

    // EVERY TAPPABLE THING ON A SCREEN, measured rendered rather than
    // read off the stylesheet. The four answers to a test item are the
    // most important targets in the study and were stated as 44 CSS
    // pixels, which is 30.8 once --zoom is applied. Nothing caught it
    // because the checks that measure a rendered target only ever
    // looked at the control cluster.
    const screens = await page.evaluate(async () => {
      const z = parseFloat(getComputedStyle(document.documentElement)
        .getPropertyValue("--zoom")) || 1;
      const h = (s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        return Math.round(el.getBoundingClientRect().height);
      };
      // Painted rather than driven: this is a measurement of the real
      // stylesheet on the real elements, and the flow that fills them
      // needs an item bank the stub does not carry.
      const c = document.getElementById("quiz-choices");
      c.innerHTML = "";
      const b = document.createElement("button");
      b.className = "quiz-choice";
      b.textContent = "Sa Tondo";
      c.appendChild(b);

      // Shown one at a time in the running game, so each overlay is
      // uncovered just long enough to be measured and put back.
      const shown = ["quiz", "act-screen", "shell"].map((id) => {
        const el = document.getElementById(id);
        const was = el.classList.contains("hidden");
        el.classList.remove("hidden");
        return [el, was];
      });
      const settings = document.getElementById("shell-settings");
      const wasSettings = settings.classList.contains("hidden");
      settings.classList.remove("hidden");
      await new Promise((r) => requestAnimationFrame(r));

      const out = { zoom: z, answer: h(".quiz-choice"), quizBtn: h("#quiz-btn"),
                    actBtn: h("#act-screen-btn"), choice: h(".shell-choice"),
                    shellBtn: h("#shell-settings-back") };

      if (wasSettings) settings.classList.add("hidden");
      shown.forEach(([el, was]) => { if (was) el.classList.add("hidden"); });
      c.innerHTML = "";
      return out;
    });
    ok("a test answer clears 44px on screen", screens.answer >= 44, screens);
    ok("the quiz button does", screens.quizBtn >= 44, screens);
    ok("the act screen button does", screens.actBtn >= 44, screens);
    ok("a text size choice does", screens.choice >= 44, screens);
    ok("and a menu button does", screens.shellBtn >= 44, screens);

    // The hearts were moved with the pause button, then again in
    // Block 13 when inventory and shop joined it. They must not end up
    // underneath any of the three; shop sits leftmost, so its left
    // edge is the one that actually constrains the hearts.
    const clear = await page.evaluate(() => {
      const h = document.getElementById("hud").getBoundingClientRect();
      const p = document.getElementById("btn-pause").getBoundingClientRect();
      const s = document.getElementById("btn-shop").getBoundingClientRect();
      return { hudRight: h.right, pauseLeft: p.left, shopLeft: s.left };
    });
    ok("the hearts still clear the pause button",
       clear.hudRight <= clear.pauseLeft + 1, clear);
    ok("and clear the shop button, the leftmost of the three",
       clear.hudRight <= clear.shopLeft + 1, clear);

    await ctx.close();
  }

  console.log("\nAF. The full reset is offered only to accounts that may use it");
  {
    // A study account. can_reset_my_data() answers false, so the
    // offer is never drawn. This is the check that matters most on
    // this screen: a student in the study who wipes their own row has
    // destroyed the finding for that student and it cannot be re-run.
    const { ctx, page } = await enterTestRoom();
    await page.click("#btn-pause");
    await page.waitForTimeout(120);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(300);
    ok("a student who may not reset is never offered it",
       !(await visible(page, "#shell-reset")));
    ok("and the settings screen is otherwise intact",
       await visible(page, "#shell-settings-back"));

    // Even reached directly, the database refuses. shell.js hiding the
    // button is a courtesy; this is the guarantee.
    const refused = await page.evaluate(async () => {
      const before = __DB.act_progress.length;
      const { error } = await sb.rpc("reset_my_play_data");
      return { message: error && error.message, rows: __DB.act_progress.length, before };
    });
    ok("calling it anyway is refused", refused.message === "NOT_ALLOWED", refused);
    ok("and nothing is deleted by the refusal",
       refused.rows === refused.before, refused);

    await ctx.close();
  }

  {
    // An allowlisted account. The offer appears and the wipe runs.
    const seed = atTestRoom();
    seed.canReset = true;
    const { ctx, page } = await newPage(seed, fixtureRoutes());
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(400);

    await page.click("#btn-pause");
    await page.waitForTimeout(120);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(300);
    ok("an allowed account is offered the reset",
       await visible(page, "#shell-reset"));

    await page.click("#shell-reset");
    await page.waitForTimeout(150);
    ok("it asks before wiping", await visible(page, "#shell-reset-confirm"));
    ok("and the confirmation names the test scores",
       /pagsusulit/i.test(await page.textContent("#shell-reset-confirm")));

    // Hindi must leave everything alone.
    await page.click("#shell-reset-no");
    await page.waitForTimeout(150);
    const kept = await page.evaluate(() => __DB.act_progress.length);
    ok("Hindi backs out without deleting anything",
       (await visible(page, "#shell-settings")) && kept === 1, kept);

    // Everything a student owns, across all seven tables.
    await page.evaluate(() => {
      __DB.assessment_scores = [
        { student_id: "u1", act_number: 1, test_type: "pretest", score: 4 },
        { student_id: "u1", act_number: 1, test_type: "posttest", score: 8 },
      ];
      __DB.game_sessions = [{ student_id: "u1", act_number: 1 }];
      __DB.feedback = [{ student_id: "u1", act_number: 1, rating: 4 }];
      __DB.player_equipment = [{ student_id: "u1", slot: "weapon", item_id: "sibat" }];
      __DB.player_inventory = [{ student_id: "u1", item_id: "sibat", quantity: 1 }];
      Shell.settings.textSize = "lg";
      Shell._saveSettings();
      // window.location.reload cannot be stubbed -- it is read only on
      // Location, and assigning to it fails silently, which is how this
      // check first "passed" against a page that had actually reloaded
      // and rebuilt the stub database from its seed. So the reload is
      // allowed to happen and detected by this mark going missing.
      window.__MARK = "before";
    });

    await page.click("#shell-reset");
    await page.waitForTimeout(120);
    await page.click("#shell-reset-yes");
    // Inside the 600ms shell.js waits before reloading. The rpc has
    // resolved and localStorage is cleared well before this.
    await page.waitForTimeout(250);

    const after = await page.evaluate(() => ({
      scores: __DB.assessment_scores.length,
      acts: __DB.act_progress.length,
      progress: __DB.game_progress.length,
      sessions: __DB.game_sessions.length,
      feedback: __DB.feedback.length,
      equipment: __DB.player_equipment.length,
      inventory: __DB.player_inventory.length,
      profiles: __DB.profiles.length,
      stored: window.localStorage.getItem("macario:settings"),
      signedIn: Game.isSignedIn(),
    }));

    ok("the assessment scores are gone", after.scores === 0, after);
    ok("the act progress is gone", after.acts === 0, after);
    ok("the save row is gone", after.progress === 0, after);
    ok("the session rows are gone", after.sessions === 0, after);
    ok("the feedback is gone", after.feedback === 0, after);
    ok("the equipment is gone", after.equipment === 0, after);
    ok("the inventory is gone", after.inventory === 0, after);
    ok("the device settings are cleared", after.stored === null, after);

    // The account survives. This is the whole difference between
    // starting over and deleting yourself, and it is what lets the
    // student play again without the teacher reissuing a password.
    ok("the account itself survives", after.profiles === 1, after);
    ok("and the student is still signed in", after.signedIn === true, after);

    // And then it reloads, which is what turns an empty database into
    // a student sitting at the start of Act I.
    await page.waitForTimeout(900);
    const reloaded = await page.evaluate(() => window.__MARK === undefined);
    ok("the page reloads into a fresh start", reloaded === true);

    await ctx.close();
  }

  {
    // A failed call must say so and must leave saving off, because a
    // retry is about to delete whatever a write would have put back.
    const seed = atTestRoom();
    seed.canReset = true;
    seed.resetError = "simulated network failure";
    const { ctx, page } = await newPage(seed, fixtureRoutes());
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(400);
    await page.click("#btn-pause");
    await page.waitForTimeout(120);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(300);
    await page.click("#shell-reset");
    await page.waitForTimeout(120);
    await page.click("#shell-reset-yes");
    await page.waitForTimeout(700);

    const failed = await page.evaluate(() => ({
      note: document.getElementById("shell-reset-note").textContent,
      stillThere: !document.getElementById("shell-reset-confirm").classList.contains("hidden"),
      enabled: !document.getElementById("shell-reset-yes").disabled,
      rows: __DB.act_progress.length,
    }));
    ok("a failed wipe says so in Tagalog", /koneksyon/.test(failed.note), failed);
    ok("and stays on the confirmation to be retried",
       failed.stillThere && failed.enabled, failed);
    ok("and nothing was half deleted", failed.rows === 1, failed);

    // Saving is stopped BEFORE the call and stays stopped on failure,
    // because the retry the student is being invited to make is about
    // to delete whatever a write would have put back. All four paths
    // have to be off, not just the debounce: the ten second autosave
    // alone would rewrite the row on its own.
    const quiet = await page.evaluate(async () => {
      __DB.game_progress.length = 0;
      // Everything that could still write: the debounce, the call
      // beforeunload makes directly, and the autosave interval.
      // Marking it dirty first is what one frame of play would do.
      markDirty();
      await saveProgress();
      await flushSave();
      await new Promise((r) => setTimeout(r, 1400));
      return { rows: __DB.game_progress.length, ready: saveReady,
               timer: autosaveTimer };
    });
    ok("a direct save writes nothing after the reset", quiet.rows === 0, quiet);
    ok("the beforeunload flush writes nothing either", quiet.rows === 0, quiet);
    ok("the autosave interval is cancelled", quiet.timer === null, quiet);
    ok("and saveReady stays down so nothing can re-arm it",
       quiet.ready === false, quiet);

    await ctx.close();
  }

  console.log("\nAG. A wiped student starts the game from the beginning");
  {
    // What the reload lands on: no rows anywhere, which is exactly the
    // state a student who has never played is in. Driven as a fresh
    // login rather than asserted about, because "starts over" means
    // the real entry sequence runs, not that seven tables are empty.
    const { ctx, page } = await newPage({ session: null, canReset: true });
    await page.waitForTimeout(300);
    ok("the title screen offers a start, not a resume",
       (await page.textContent("#shell-start")).trim() === "Magsimula",
       (await page.textContent("#shell-start")).trim());

    await page.click("#shell-start");
    await page.waitForTimeout(150);
    await page.fill("#auth-email", "hi@example.com");
    await page.fill("#auth-password", "x");
    await page.click("#auth-submit");
    await page.waitForTimeout(900);

    ok("the pre-act flow runs again for a wiped student",
       await visible(page, "#quiz"));
    await page.click("#quiz-btn");
    await page.waitForTimeout(400);
    ok("and the act starts from the beginning",
       (await page.evaluate(() => Acts.current)) === 1);
    ok("with a fresh save row",
       (await page.evaluate(() => __DB.game_progress.length)) === 1);
    ok("and nothing owned",
       (await page.evaluate(() => __DB.player_inventory.length)) === 0 ||
       (await page.evaluate(() => __DB.player_inventory.every((r) => r.student_id === "u1"))));

    await ctx.close();
  }

  console.log("\nAH. Play-as-guest, no save");
  {
    // Block 14. A guest never authenticates, so this drives the title
    // screen's second button rather than the auth form, and the whole
    // point of the section is to prove nothing lands in __DB anywhere
    // along the way.
    const { ctx, page } = await newPage({ session: null }, fixtureRoutes());
    await page.waitForTimeout(300);
    ok("guest button visible at title", await visible(page, "#shell-guest"));
    ok("guest button reads Maglaro bilang Bisita",
       (await page.textContent("#shell-guest")).trim() === "Maglaro bilang Bisita",
       (await page.textContent("#shell-guest")).trim());

    await page.click("#shell-guest");
    await page.waitForTimeout(400);
    ok("shell hidden, straight into the world", !(await visible(page, "#shell")));
    ok("no login box was ever shown", !(await visible(page, "#auth-overlay")));
    ok("shell state is playing", (await page.evaluate(() => Shell.state)) === "playing");
    ok("Game reports guest", await page.evaluate(() => Game.isGuest()));
    ok("not signed in", !(await page.evaluate(() => Game.isSignedIn())));
    ok("act I loaded", (await page.evaluate(() => Acts.current)) === 1);
    ok("starting scene is tondo", (await page.evaluate(() => currentRoom)) === "tondo");
    ok("the starting quest still loaded", (await page.evaluate(() =>
      typeof quests !== "undefined" && quests.some((q) => q.id === "pinagmulan"))));
    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    ok("pause screen opens for a guest", await visible(page, "#shell-pause"));
    await page.click("#shell-resume");
    await page.waitForTimeout(100);

    ok("no game_progress row written for a guest",
       (await page.evaluate(() => __DB.game_progress.length)) === 0);
    ok("no act_progress row written for a guest",
       (await page.evaluate(() => __DB.act_progress.length)) === 0);
    ok("no session rows written for a guest",
       (await page.evaluate(() => (__DB.play_sessions || []).length)) === 0);

    await page.waitForTimeout(1200);
    ok("still nothing written after time passes (no autosave for a guest)",
       (await page.evaluate(() => __DB.game_progress.length)) === 0);

    await page.reload();
    await page.waitForTimeout(300);
    ok("reload lands back on the title screen, not resumed as a guest",
       await visible(page, "#shell-title"));
    ok("and offers a start, not a resume, since nothing was ever saved",
       (await page.textContent("#shell-start")).trim() === "Magsimula",
       (await page.textContent("#shell-start")).trim());

    await ctx.close();
  }

  console.log("\nAI. Aim-and-fire shooting animation");
  {
    // The shooting sheet (25 frames) is played as two named views of the
    // one image rather than two files: shootAim (0-12, held while the
    // button is down) and shootFire (13-15, played once at the instant
    // the throw actually happens). See game.js, BASE_SPRITE_SHEETS.
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    const sheets = await page.evaluate(() => ({
      aim: SPRITE_SHEETS.shootAim,
      fire: SPRITE_SHEETS.shootFire,
    }));
    ok("shootAim loaded without falling back to a placeholder",
       sheets.aim && sheets.aim.failed === false, sheets.aim);
    ok("shootFire loaded without falling back to a placeholder",
       sheets.fire && sheets.fire.failed === false, sheets.fire);
    ok("shootAim covers frames 0-12", sheets.aim.startFrame === 0 && sheets.aim.endFrame === 12, sheets.aim);
    ok("shootFire covers frames 13-15", sheets.fire.startFrame === 13 && sheets.fire.endFrame === 15, sheets.fire);

    // Holding the attack button should switch the pose to the aim view
    // immediately, before anyone knows yet whether this will end up a
    // melee swing or a throw.
    const pressed = await page.evaluate(() => {
      startAttackHold();
      return { anim: currentAnim, frame: currentFrame, shooting };
    });
    ok("pressing attack switches to the aim pose",
       pressed.anim === "shootAim" && pressed.shooting === "aim", pressed);
    ok("the aim pose starts on its own first frame (0), not frame 0 of the sheet's neighbour",
       pressed.frame === 0, pressed);

    // Held well past the aim clip's own length (13 frames at 8fps =
    // 1625ms): it must have climbed to frame 12 and stayed there,
    // proven by sampling twice a tick apart, rather than looped back to
    // frame 0 or run past the sub-range into shootFire's frames.
    await page.waitForTimeout(2000);
    const held = await page.evaluate(() => new Promise((resolve) => {
      const first = currentFrame;
      requestAnimationFrame(() => requestAnimationFrame(() =>
        resolve({ first, second: currentFrame, anim: currentAnim })));
    }));
    ok("a long hold settles on the aim clip's last frame (12) and holds there",
       held.first === 12 && held.second === 12 && held.anim === "shootAim", held);

    // A quick tap (released under ATTACK_HOLD_MS) is a melee swing, not
    // a throw, and must drop the aim pose rather than carry it into a
    // pose that implies a shot was fired. Fresh press-and-release pair,
    // since the previous press has been held for the last two seconds.
    const tapped = await page.evaluate(() => {
      destroyProjectile();
      startAttackHold();
      endAttackHold();
      return { shooting, anim: currentAnim, projectile: projectile !== null };
    });
    ok("releasing early cancels the aim pose", tapped.shooting === null, tapped);
    ok("and throws nothing", tapped.projectile === false, tapped);

    // A held-and-released throw fires the projectile and the muzzle
    // flash clip at the same instant, not one before the other.
    const fired = await page.evaluate(() => {
      destroyProjectile();
      posX = 400;
      facing = 1;
      startAttackHold();
      attackHoldStart = performance.now() - (ATTACK_HOLD_MS + 10);
      endAttackHold();
      return {
        anim: currentAnim, frame: currentFrame, shooting,
        projectile: projectile !== null,
      };
    });
    ok("a qualifying hold plays the fire clip", fired.anim === "shootFire" && fired.shooting === "fire", fired);
    ok("starting on the fire clip's own first frame (13)", fired.frame === 13, fired);
    ok("and the projectile appears at the same moment", fired.projectile === true, fired);

    // The fire clip is 3 frames at 12fps (250ms). Comfortably after that,
    // the pose must have been handed back to the ordinary idle/walk
    // switch on its own, with no button press or gameplay code required.
    await page.waitForTimeout(500);
    const settled = await page.evaluate(() => ({ shooting, anim: currentAnim }));
    ok("the fire clip hands the pose back afterwards",
       settled.shooting === null && (settled.anim === "idle" || settled.anim === "walk"), settled);

    // A guard catch or hazard can respawn the player mid-hold. The pose
    // must not stay stuck on the aim frame for the rest of the visit to
    // the scene once that happens.
    const stuck = await page.evaluate(() => {
      startAttackHold();
      respawnInScene();
      return { shooting, attackHoldStart };
    });
    ok("a respawn clears a held aim pose rather than leaving it stuck",
       stuck.shooting === null && stuck.attackHoldStart === 0, stuck);

    await page.evaluate(() => destroyProjectile());
    await ctx.close();
  }

  console.log("\nAJ. Skyline seam shadows and player stacking");
  {
    // #player must out-stack every NPC/guard/decoration, which are all
    // appended into #world after #player already exists in the static
    // HTML (see loadScene's build*() calls) — without a positive
    // z-index here, plain DOM-order stacking would put Macario behind
    // anything added after him, such as Nanay.
    const { ctx, page } = await enterTestRoom();
    const playerZ = await page.evaluate(() =>
      getComputedStyle(document.getElementById("player")).zIndex);
    ok("Macario sits in a positive stacking tier above DOM-later NPCs",
       Number(playerZ) > 0, playerZ);

    // Assets/Act 1/Tondo.png is real now (see CLAUDE.md, Decisions on
    // record) — the skyline must load it rather than falling back to
    // the dashed placeholder checkBackgroundImage() draws for a
    // missing file.
    await page.waitForTimeout(200);
    const skylineText = await page.evaluate(() =>
      document.getElementById("skyline").textContent);
    ok("the skyline backdrop loads without falling back to a placeholder",
       skylineText === "", skylineText);

    // buildSkylineShadows() should have placed at least one .tree-shadow
    // div — #world is comfortably wider than one tile of the real
    // 1983x793 art at this viewport height — each sized and positioned
    // explicitly rather than left at the browser's defaults.
    const shadows = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".tree-shadow")).map((el) => ({
        left: el.style.left, width: el.style.width,
      })));
    ok("at least one seam-masking shadow band was placed", shadows.length > 0, shadows);
    ok("each shadow band has an explicit width and position, not browser defaults",
       shadows.length > 0 && shadows.every((s) => s.width !== "" && s.left !== ""), shadows);

    // Leaving the scene must clean the shadow bands up along with
    // everything else loadScene created, via the existing actElements
    // lifecycle — not leave stale ones behind for the next scene to
    // pile more on top of.
    await page.evaluate(() => unloadScene());
    const afterUnload = await page.evaluate(() => document.querySelectorAll(".tree-shadow").length);
    ok("unloading the scene removes the shadow bands", afterUnload === 0, afterUnload);

    await ctx.close();
  }

  console.log("\nAK. Shop-opening NPCs, a gift's onComplete, and an item's buyFlag");
  {
    const { ctx, page } = await enterTestRoom();

    // opensShop: true skips dialogue entirely and opens the same
    // #shell-shop screen #btn-shop already does (Shell._openShop,
    // reached through Game.onShopRequest — see game.js,
    // handleInteractPress, and shell.js's init). Pushed straight into
    // the live NPCS array rather than through a scene reload: findNearby
    // is pure position math against that array, so this is enough to
    // drive the interaction without rebuilding the DOM for an NPC this
    // test never needs to see rendered.
    await page.evaluate(() => {
      NPCS.push({ id: "test-tindero", x: posX, label: "Test Tindero", opensShop: true });
    });
    // A beat for the game loop to fold the pushed NPC into its own
    // module-scope `nearby` (recomputed once per animation frame, not
    // synchronously on push) before E is pressed against it.
    await page.waitForTimeout(80);
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
    ok("an opensShop NPC opens the shop screen directly", await visible(page, "#shell-shop"));
    ok("no dialogue box was opened along the way", !(await visible(page, "#dialogue-box")));
    await page.click("#shell-shop-back");
    await page.waitForTimeout(100);
    ok("closing it resumes play", (await page.evaluate(() => Shell.state)) === "playing");

    // buyFlag: a story flag an item can ask to have set in state.flags
    // the instant it is bought, optimistically, alongside the ownership
    // row inventory.js already writes optimistically. Exists because a
    // gift's requiresFlag can only ever read state.flags, never
    // Inventory.owns() directly, and nothing before this item needed a
    // bridge between the two.
    const bought = await page.evaluate(async () => {
      window.ITEMS.push({
        id: "test-mansanas", name: "Test Mansanas", kind: "equipment",
        slot: "accessory", price: 0, img: "Assets/Test.png",
        buyFlag: "test_boughtMansanas",
      });
      const before = Boolean(state.flags.test_boughtMansanas);
      const purchased = await Inventory.buy("test-mansanas");
      return { before, purchased, after: Boolean(state.flags.test_boughtMansanas) };
    });
    ok("the flag is unset before the purchase", bought.before === false, bought);
    ok("the purchase itself succeeded", bought.purchased === true, bought);
    ok("buyFlag is set in state.flags the moment it is bought", bought.after === true, bought);

    // A gift may declare onComplete, the same shape a dialogueSet's
    // already has, called after the gift's own flag and quest are set —
    // so a gift can end something (a scene change, for Kabayo) rather
    // than only ever marking itself given.
    const gifted = await page.evaluate(() => {
      let fired = false;
      state.flags.test_giftRequires = true;
      const npc = {
        id: "test-giftnpc", x: posX, label: "Test",
        gift: {
          buttonLabel: "Test",
          requiresFlag: "test_giftRequires",
          givenFlag: "test_giftGiven",
          responseLines: [{ speaker: "A", text: "salamat" }],
          onComplete: () => { fired = true; },
        },
      };
      startGift(npc);
      advanceDialogue(); // one line, so this ends it
      return { fired, given: state.flags.test_giftGiven };
    });
    ok("a gift's onComplete runs", gifted.fired === true, gifted);
    ok("after its own flag was set", gifted.given === true, gifted);

    await ctx.close();
  }

  console.log("\nAL. Interaction reach, a clean throw, and a consumable item");
  {
    const { ctx, page } = await enterTestRoom();

    // Interaction reach: the gap between the two bounding boxes, not
    // between their left-edge anchors (findNearby's edgeGap, game.js).
    // Before this fix, comparing posX (Macario's own left edge, his
    // 40px-wide body — PLAYER_WIDTH) straight against npc.x (an NPC's
    // left edge, but a roughly 80px-wide sprite — NPC_WIDTH) gave a
    // different answer depending on which side carried that width
    // difference: the same real gap reached from one side and did not
    // from the other. Proven here as a symmetry check rather than by
    // asserting one particular threshold: the SAME real gap (50px, well
    // inside INTERACT_DISTANCE's 90) must reach from both sides, and
    // the SAME larger gap (100px, past it) must reach from neither.
    const reach = await page.evaluate(() => {
      NPCS.push({ id: "test-reach", x: 1000, label: "Test" }); // spans 1000-1080
      const at = (x) => { posX = x; return findNearby().type === "npc"; };
      const r = {
        gap50FromLeft: at(910), // right edge at 950, 50px short of 1000
        gap50FromRight: at(1130), // left edge at 1130, 50px past 1080
        gap100FromLeft: at(860),
        gap100FromRight: at(1180),
      };
      NPCS.pop();
      return r;
    });
    ok("a 50px gap reaches from the left", reach.gap50FromLeft, reach);
    ok("the same 50px gap reaches from the right", reach.gap50FromRight, reach);
    ok("a 100px gap does not reach, from the left", !reach.gap100FromLeft, reach);
    ok("nor from the right — the same gap either way", !reach.gap100FromRight, reach);

    // The throw leaves from the front of his body, in both directions.
    // Blocks 22 and 23 checked this against the sprite element's width,
    // which was only ever meaningful while that element hung a whole
    // scaled cell off one side of the body; section AM now proves the
    // drawn character stands on the body, so the body's leading edge IS
    // his visible front, and this is checked against that.
    const thrown = await page.evaluate(() => {
      posX = 400;
      facing = 1;
      throwProjectile();
      const right = {
        x: projectile.x,
        clearsRight: projectile.x >= posX + PLAYER_WIDTH + PROJECTILE_SPAWN_GAP,
      };
      const zIndex = getComputedStyle(projectile.el).zIndex;
      destroyProjectile();

      facing = -1;
      throwProjectile();
      const left = {
        x: projectile.x,
        clearsLeft: projectile.x + PROJECTILE_SIZE <= posX - PROJECTILE_SPAWN_GAP,
      };
      destroyProjectile();

      return { right, left, zIndex };
    });
    ok("a rightward throw spawns clear of the front of his body",
       thrown.right.clearsRight, thrown.right);
    ok("a leftward throw spawns clear of the front of his body, ball and all",
       thrown.left.clearsLeft, thrown.left);
    ok("the projectile also carries its own z-index, above #player's",
       Number(thrown.zIndex) > 1, thrown.zIndex);

    // Gatas: a consumable (kind: "consumable", no slot — see
    // content/items.js's Mansanas for the real one this fixture stands
    // in for). Owning it applies its effect immediately, with no equip
    // step to speak of, and both the ownership and the effect end the
    // moment it is actually consumed.
    const bought = await page.evaluate(async () => {
      health = 3;
      Game.addCurrency(10);
      const ok1 = await Inventory.buy("gatas");
      return { ok1, max: maxHealth, health, owns: Inventory.owns("gatas") };
    });
    ok("buying the consumable works", bought.ok1 === true, bought);
    ok("its effect applies the instant it is owned, no equip step",
       bought.max === 4 && bought.health === 4, bought);

    const notWearable = await page.evaluate(async () => {
      const equipped = await Inventory.equip("gatas");
      const toggled = await Inventory.toggle("gatas");
      return { equipped, toggled };
    });
    ok("a consumable refuses to be equipped", notWearable.equipped === false, notWearable);
    ok("and refuses toggle() too", notWearable.toggled === false, notWearable);

    const consumed = await page.evaluate(async () => {
      const ok2 = await Inventory.consume("gatas");
      return {
        ok2, max: maxHealth, health, owns: Inventory.owns("gatas"),
        rows: __DB.player_inventory.filter((r) => r.item_id === "gatas").length,
      };
    });
    ok("consuming it succeeds", consumed.ok2 === true, consumed);
    ok("its effect ends with it", consumed.max === 3 && consumed.health === 3, consumed);
    ok("it is no longer owned", !consumed.owns, consumed);
    ok("and its row is gone from the database", consumed.rows === 0, consumed);

    // A failed write must not lose the item — same rollback shape as
    // buy()'s own failure test (Section X).
    const rolledBack = await page.evaluate(async () => {
      Game.addCurrency(10);
      await Inventory.buy("gatas");
      const realFrom = sb.from;
      sb.from = function (table) {
        if (table !== "player_inventory") return realFrom.call(sb, table);
        return { delete: () => ({ eq: () => ({ eq: () =>
          Promise.resolve({ error: { message: "simulated" } }) }) }) };
      };
      const failed = await Inventory.consume("gatas");
      sb.from = realFrom;
      return { failed, owns: Inventory.owns("gatas"), max: maxHealth };
    });
    ok("a failed consume reports failure", rolledBack.failed === false, rolledBack);
    ok("and rolls the item — and its effect — back",
       rolledBack.owns && rolledBack.max === 4, rolledBack);

    await ctx.close();
  }

  console.log("\nAM. Bodies: the drawn character stands where the logic does");
  {
    // Every check here reads PIXELS, not style properties. Two earlier
    // fixes to the throw passed checks written against numbers the code
    // itself produced and still looked wrong on screen; the only thing
    // that cannot agree with a wrong model is a screenshot. The player is
    // screenshotted shown and hidden, and the columns that change are
    // where he is drawn. Decoded in the page with a canvas, so this needs
    // nothing beyond Playwright.
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));
    // Anything else that moves between the two screenshots reads as part
    // of him. The misyon fixture's heart pickup bobs on a CSS animation,
    // and sat inside the span on the first run of this section, so every
    // animation is frozen while these checks run.
    await page.addStyleTag({ content: "*, *::before { animation-play-state: paused !important; }" });

    const drawnSpan = async () => {
      const shown = (await page.screenshot()).toString("base64");
      await page.evaluate(() => { player.style.visibility = "hidden"; });
      const hidden = (await page.screenshot()).toString("base64");
      await page.evaluate(() => { player.style.visibility = ""; });
      return page.evaluate(async ([a, b]) => {
        const load = async (b64) => {
          const img = await createImageBitmap(await (await fetch("data:image/png;base64," + b64)).blob());
          const c = document.createElement("canvas");
          c.width = img.width; c.height = img.height;
          const g = c.getContext("2d");
          g.drawImage(img, 0, 0);
          return g.getImageData(0, 0, img.width, img.height);
        };
        const A = await load(a), B = await load(b);
        let lo = Infinity, hi = -Infinity;
        for (let y = 0; y < A.height; y++) {
          for (let x = 0; x < A.width; x++) {
            const i = (y * A.width + x) * 4;
            const d = Math.abs(A.data[i] - B.data[i]) +
              Math.abs(A.data[i + 1] - B.data[i + 1]) +
              Math.abs(A.data[i + 2] - B.data[i + 2]);
            if (d > 30) { if (x < lo) lo = x; if (x > hi) hi = x; }
          }
        }
        // Screen columns back to world x, through the camera and --zoom.
        const w = world.getBoundingClientRect();
        const z = w.width / world.offsetWidth;
        return { left: (lo - w.left) / z, right: (hi - w.left) / z,
                 bodyCentre: posX + PLAYER_WIDTH / 2 };
      }, [shown, hidden]);
    };

    // Stand him somewhere empty, with whatever pose, and let it render.
    const pose = async (anim, face) => {
      await page.evaluate(([anim, face]) => {
        destroyProjectile();
        posX = 300; posY = floorHeightAt(300); velY = 0; facing = face;
        if (anim === "shootAim") { shooting = "aim"; } else { shooting = null; }
        applyAnim(anim, true);
      }, [anim, face]);
      await page.waitForTimeout(250);
      return drawnSpan();
    };

    for (const [anim, face] of [["idle", 1], ["idle", -1], ["walk", 1], ["walk", -1], ["shootAim", 1], ["shootAim", -1]]) {
      const span = await pose(anim, face);
      const drawnCentre = (span.left + span.right) / 2;
      // The shooting pose reaches forward with an arm, so its drawing is
      // not centred on the body even though its feet are; it is held to
      // "his body is inside the drawing" rather than to a centre.
      if (anim === "shootAim") {
        ok(`${anim} facing ${face > 0 ? "right" : "left"}: the drawing covers the body`,
           span.left <= span.bodyCentre && span.right >= span.bodyCentre, span);
      } else {
        ok(`${anim} facing ${face > 0 ? "right" : "left"}: drawn centred on the body (within 12px)`,
           Math.abs(drawnCentre - span.bodyCentre) <= 12, { ...span, drawnCentre });
      }
    }
    await page.evaluate(() => { shooting = null; applyAnim("idle", true); });

    // Turning around must not move him. A flip about the middle of a
    // wide cell instead of about his feet throws him sideways.
    const r = await pose("walk", 1);
    const l = await pose("walk", -1);
    const shift = Math.abs((r.left + r.right) / 2 - (l.left + l.right) / 2);
    ok("turning around does not slide him sideways (within 12px)", shift <= 12, { r, l, shift });

    // The hazard, at both of its edges, from both directions. A body
    // just touching the band hurts; a body just short of it does not.
    const hazardAt = (x) => page.evaluate((x) => new Promise((res) => {
      health = 3; invulnUntil = 0; velY = 0;
      posX = x; posY = floorHeightAt(x);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const hurt = health < 3;
        health = 3; invulnUntil = 0;
        posX = 300; posY = floorHeightAt(300);
        res(hurt);
      }));
    }), x);
    const h = await page.evaluate(() => HAZARDS[0]);
    ok("5px short of the band's left edge is safe",
       !(await hazardAt(h.x - 40 - 5)));
    ok("5px over the band's left edge hurts",
       await hazardAt(h.x - 40 + 5));
    ok("5px over the band's right edge hurts",
       await hazardAt(h.x + h.width - 5));
    ok("5px past the band's right edge is safe",
       !(await hazardAt(h.x + h.width + 5)));

    // The same test the bug report was made with, in pixels: when he is
    // hurt, he is drawn over the band.
    const drawnWhenHurt = await (async () => {
      await page.evaluate((h) => {
        health = 3; invulnUntil = 0; facing = 1;
        posX = h.x + 10; posY = floorHeightAt(posX); velY = 0;
      }, h);
      await page.waitForTimeout(60);
      const hurt = await page.evaluate(() => health < 3);
      await page.evaluate((h) => {
        invulnUntil = performance.now() + 60000;
        posX = h.x + 10; posY = floorHeightAt(posX); velY = 0;
      }, h);
      await page.waitForTimeout(250);
      const span = await drawnSpan();
      return { hurt, span };
    })();
    ok("when the hazard hurts him, he is drawn over it",
       drawnWhenHurt.hurt &&
       drawnWhenHurt.span.right > h.x && drawnWhenHurt.span.left < h.x + h.width,
       { ...drawnWhenHurt, band: [h.x, h.x + h.width] });

    // NPCs and guards stand on their bodies too: the .entity box is the
    // body, and the placeholder or sprite inside it is centred on it.
    const npc = await page.evaluate(() => {
      NPCS.push({ id: "body-npc", x: 900, label: "Test", img: "Assets/Missing_Body_Test.png" });
      buildNpcs(actLoadToken);
      return new Promise((res) => setTimeout(() => {
        const el = document.getElementById("npc-body-npc");
        const box = el.getBoundingClientRect();
        const art = el.firstElementChild.getBoundingClientRect();
        res({ boxWidth: el.offsetWidth, NPC_WIDTH,
              boxCentre: box.left + box.width / 2, artCentre: art.left + art.width / 2 });
      }, 400));
    });
    ok("an NPC's box is its body", npc.boxWidth === npc.NPC_WIDTH, npc);
    ok("an NPC's art is centred on its body", Math.abs(npc.boxCentre - npc.artCentre) <= 1, npc);

    const guard = await page.evaluate(() => {
      const g = GUARDS[0];
      const box = g.el.getBoundingClientRect();
      const art = g.el.querySelector(".sprite").getBoundingClientRect();
      return { boxWidth: g.el.offsetWidth, GUARD_WIDTH,
               boxCentre: box.left + box.width / 2, artCentre: art.left + art.width / 2 };
    });
    ok("a guard's box is its body", guard.boxWidth === guard.GUARD_WIDTH, guard);
    ok("a guard's art is centred on its body", Math.abs(guard.boxCentre - guard.artCentre) <= 1, guard);

    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
