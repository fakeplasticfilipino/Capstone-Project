// =============================================================
// MACARIO — _dev/tests/test.js
//
// Run:  node _dev/tests/test.js       from the repository root
//
// Serves the repository over http, opens index.html in headless
// Chromium at phone dimensions, and drives the real game.
//
// supabaseClient.js and the Supabase CDN script are intercepted and
// replaced with _dev/tests/sb-stub.js, so the suite exercises the SHIPPING
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

// Block 62. Lets a context's routes see the requests a service worker
// makes, so section BD's worker gets the fake Supabase client like every
// other page. No other section registers a worker, so nothing else moves.
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = "1";
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
let PORT = Number(process.env.PORT) || 0; // 0: any free port, so shards run side by side (Block 115)
const SPEED_FOR_TEST = 5; // game.js SPEED, the walk
const STUB = fs.readFileSync(path.join(__dirname, "sb-stub.js"), "utf8");

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
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
    { id: "entablado", label: "Umarte sa entablado", flag: "naitanghalAngKuwento" },
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
// one priced consumable (Block 22, a stacking heal since Block 25) and
// one quest item (Block 25), same ids, prices and effects the
// assertions check by name. Kept separate from content/items.js on
// purpose (see that file's header).
const FIXTURE_ITEMS_JS = `
window.ITEMS = [
  {
    id: "sibat", name: "Magaan na Sibat", kind: "equipment", slot: "weapon",
    price: 0, img: "assets/Sibat.png", grantedOnAct: 1,
    effect: { projectileSpeedMult: 1.5 },
  },
  {
    id: "agimat", name: "Agimat", kind: "equipment", slot: "accessory",
    price: 0, img: "assets/Agimat.png", grantedOnAct: 1,
    effect: { maxHealthBonus: 1 },
  },
  {
    id: "damit-magsasaka", name: "Damit ng Magsasaka", kind: "cosmetic",
    slot: "outfit", price: 50, img: "assets/Skin_Walk.png",
    sheets: { walk: { src: "assets/Skin_Walk.png", frames: 12, fps: 12, columns: 5 } },
  },
  {
    id: "damit-katipunero", name: "Uniporme ng Katipunero", kind: "cosmetic",
    slot: "outfit", price: 90, img: "assets/Skin_Uniporme_Walk.png",
    sheets: { walk: { src: "assets/Skin_Uniporme_Walk.png", frames: 12, fps: 12, columns: 5 } },
  },
  {
    id: "gatas", name: "Gatas ng Kalabaw", kind: "consumable",
    price: 3, img: "assets/Gatas.png",
    use: { heal: 1 }, maxStack: 3,
  },
  {
    id: "liham", name: "Lihim na Liham", kind: "quest",
    price: 2, img: "assets/Liham.png",
    forQuest: "test_liham", buyFlag: "test_binilhAngLiham",
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

// Block 106. node _dev/tests/test.js --only=BD,BL runs those sections and
// skips the rest, for the sections a change touches while it is being
// built (CLAUDE.md, Testing a push); the whole suite is CI's and a
// release's. Every section is self-contained, so any one runs alone.
// --list prints the sections and runs nothing.
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  return arg ? new Set(arg.slice(7).split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)) : null;
})();
const LIST = process.argv.includes("--list");
// Block 115. The story's own time (game.js, TEST_SPEED) runs this many
// times faster: the pauses, black cards, fades and scripted walks, never
// the world a student plays against. --real runs it at a student's speed.
const STORY_SPEED = process.argv.includes("--real") ? 1 : 10;
let sectionOn = true;
const section = (id, title) => {
  sectionOn = !LIST && !(ONLY && !ONLY.has(id));
  if (LIST) console.log("  " + id.padEnd(3) + title);
  else if (sectionOn) console.log("\n" + id + ". " + title);
  return sectionOn;
};
// A section written as more than one block: the later blocks run when
// their section does.
const still = () => sectionOn;

const visible = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return getComputedStyle(el).display !== "none" && r.width > 0 && r.height > 0;
}, sel);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  PORT = server.address().port;
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
    await page.route("**/js/vendor/supabase.js*", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));

    // Block 68. The game now carries its own questions
    // (content/questions.js). Every section before Block 68 was written
    // against a bank with nothing in it, where a test is one "Walang
    // pagsusulit" tap; that stays the default here, and a section that
    // wants the real questions sets realQuestions in its test state.
    if (!(testState && testState.realQuestions)) {
      await page.route("**/content/questions.js*", (route) =>
        route.fulfill({ body: "window.QUESTIONS = {};", contentType: "text/javascript" }));
    }

    if (block) {
      const specs = Array.isArray(block) ? block : [{ pattern: block, body: "" }];
      for (const spec of specs) {
        await page.route(spec.pattern, (route) =>
          route.fulfill({ body: spec.body || "", contentType: "text/javascript" }));
      }
    }

    await page.addInitScript((s) => { window.__TEST = s.testState; window.__TEST_SPEED = s.speed; },
      { testState, speed: STORY_SPEED });
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

  if (section("A", "Fresh student, no stored session")) {
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
    // Block 52. Act I now opens with a scene script on the street, and the
    // world is held still while it plays, so the pause button waits too.
    ok("pause button hidden while Act I's opening plays",
       (await page.evaluate(() => cutscenePlaying)) && !(await visible(page, "#btn-pause")));
    await page.evaluate(() => setCutscene(false));
    await page.waitForTimeout(100);
    ok("pause button visible once playing", await visible(page, "#btn-pause"));
    ok("game_progress row created", (await page.evaluate(() => __DB.game_progress.length)) === 1);
    await ctx.close();
  }

  if (section("B", "Returning student, mid Act I in the misyon scene")) {
    const state = {
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: "misyon",
        save_state: { quests: [], flags: { nalamanAngPinagmulan: true, naitanghalAngKuwento: true, sumapiSaKatipunan: true }, posX: 200 } }],
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

  if (section("C", "Settings persist across a reload")) {
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

  if (section("D", "Backward compatibility")) {
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
    // Block 113: Act II is written; Block 117: Act III; Block 119: Act IV.
    ok("Act III has its fifteen objectives (Block 120), and Act IV its thirteen (Block 119)",
       await page.evaluate(() => Acts.objectivesFor(3).length === 15 && Acts.objectivesFor(4).length === 13));
    await ctx.close();
  }

  if (section("E", "A shell that never gets a world")) {
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
    game_progress: [{ student_id: "u1", current_act: 1, current_room: "misyon",
      save_state: { quests: [], flags: { nalamanAngPinagmulan: true, naitanghalAngKuwento: true, sumapiSaKatipunan: true }, posX: 200 } }],
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

  if (section("F", "Hazards")) {
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

  if (section("G", "Pickups")) {
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

  if (section("H", "Dynamic difficulty and guard reset")) {
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

  if (section("I", "Counters")) {
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

  if (section("J", "Counter persistence")) {
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
  if (still()) { // the section above, continued
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

  if (section("K", "The weighted score")) {
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

  if (section("L", "Sessions")) {
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

  if (section("M", "Feedback")) {
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

  if (section("N", "Completion is written before feedback is offered")) {
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

  if (section("O", "Feedback is optional to the flow")) {
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

  if (section("P", "The item catalogue")) {
    const { ctx, page } = await enterTestRoom();

    const shape = await page.evaluate(() => ({
      count: window.ITEMS.length,
      // Permanent items (equipment, cosmetic) carry a slot; consumables
      // and quest items must not, since there is nothing to wear them in.
      wellFormed: window.ITEMS.every(
        (i) => i.id && i.kind && i.name &&
          (Inventory.isPermanent(i) ? Boolean(i.slot) : !i.slot)
      ),
      slots: window.ITEMS.map((i) => i.slot),
      equipment: window.ITEMS.filter((i) => i.kind === "equipment").length,
      cosmetics: window.ITEMS.filter((i) => i.kind === "cosmetic").length,
      consumables: window.ITEMS.filter((i) => i.kind === "consumable").length,
      quests: window.ITEMS.filter((i) => i.kind === "quest").length,
      // A cosmetic that carries an effect is not a cosmetic.
      cosmeticsAreInert: window.ITEMS
        .filter((i) => i.kind === "cosmetic")
        .every((i) => !i.effect),
      // A consumable does its thing when used, never while carried.
      consumablesArePassiveFree: window.ITEMS
        .filter((i) => i.kind === "consumable")
        .every((i) => !i.effect && i.use),
      granted: window.ITEMS.filter((i) => i.grantedOnAct === 1).length,
      priced: window.ITEMS.filter((i) => (i.price || 0) > 0).length,
    }));
    ok("the catalogue loaded", shape.count >= 6, shape.count);
    ok("every item has an id, kind and name, and a slot only if it is worn",
       shape.wellFormed, shape);
    ok("one weapon and one accessory",
       shape.slots.includes("weapon") && shape.slots.includes("accessory"),
       shape.slots);
    ok("two granted equipment items", shape.equipment === 2 && shape.granted === 2, shape);
    ok("two priced cosmetics, one consumable and one quest item",
       shape.cosmetics === 2 && shape.consumables === 1 && shape.quests === 1 &&
       shape.priced === 4, shape);
    ok("cosmetics carry no effect", shape.cosmeticsAreInert, shape);
    ok("consumables carry a use and no passive effect", shape.consumablesArePassiveFree, shape);

    const words = await page.evaluate(() => ({
      weapon: Inventory.kindLabel(Inventory.item("sibat")),
      accessory: Inventory.kindLabel(Inventory.item("agimat")),
      outfit: Inventory.kindLabel(Inventory.item("damit-magsasaka")),
      consumable: Inventory.kindLabel(Inventory.item("gatas")),
      quest: Inventory.kindLabel(Inventory.item("liham")),
    }));
    ok("the three slots read as Sandata, Anting-anting and Damit",
       words.weapon === "Sandata" && words.accessory === "Anting-anting" &&
       words.outfit === "Damit", words);
    ok("a consumable reads as Gamit and a quest item as Pang-misyon",
       words.consumable === "Gamit" && words.quest === "Pang-misyon", words);

    await ctx.close();
  }

  if (section("Q", "Granting")) {
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

  if (section("R", "Equipping")) {
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
      Inventory.counts["sibat-2"] = 1;
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

  if (section("S", "Equipment effects")) {
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

  if (section("T", "The inventory screen")) {
    // Block 25: one way in, its own main-UI button. Selecting a tile and
    // acting on it are two taps, so a student finding out what something
    // is never wears it, eats it or spends it by accident.
    const { ctx, page } = await enterTestRoom();

    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    ok("the pause menu no longer offers Imbentaryo",
       await page.evaluate(() => !document.getElementById("shell-inventory-open") &&
         ![...document.querySelectorAll("#shell-pause .lbl")]
           .some((l) => l.textContent.includes("Imbentaryo"))));
    await page.click("#shell-resume");
    await page.waitForTimeout(100);

    await page.click("#btn-inventory");
    await page.waitForTimeout(150);
    ok("the inventory panel opens", await visible(page, "#shell-inventory"));
    ok("shell state is inventory",
       (await page.evaluate(() => Shell.state)) === "inventory");
    ok("the world paused itself for the visit",
       await page.evaluate(() => Game.isPaused()));
    ok("the inventory no longer offers Tindahan",
       await page.evaluate(() => !document.getElementById("shell-shop-open") &&
         ![...document.querySelectorAll("#shell-inventory button .lbl")]
           .some((l) => l.textContent.trim() === "Tindahan")));
    ok("the box widens for the two-column layout",
       await page.evaluate(() =>
         document.getElementById("shell-box").classList.contains("shell-box-wide")));

    const slots = await page.evaluate(() =>
      [...document.querySelectorAll("#shell-slots .inv-slot-label")].map((e) => e.textContent));
    ok("three slots, named Sandata, Anting-anting and Damit",
       JSON.stringify(slots) === JSON.stringify(["Sandata", "Anting-anting", "Damit"]), slots);
    ok("both owned items are tiles",
       (await page.evaluate(() =>
         document.querySelectorAll("#shell-items .inv-tile").length)) === 2);
    ok("something is selected on open, so the detail pane is never blank",
       (await page.textContent("#shell-inv-detail")).trim().length > 0);

    await page.click('#shell-items [data-item-id="agimat"]');
    await page.waitForTimeout(120);
    ok("tapping a tile selects it without wearing it",
       (await page.evaluate(() => Inventory.equipped("accessory"))) === null);
    ok("the detail pane shows what it is and what it does",
       (await page.textContent("#shell-inv-detail")).includes("Agimat") &&
       (await page.textContent("#shell-inv-detail")).includes("Anting-anting") &&
       (await page.textContent("#shell-inv-detail")).includes("+1 puso"));
    ok("the action offers Isuot",
       (await page.textContent("#shell-inv-action")).includes("Isuot"));

    await page.click("#shell-inv-action");
    await page.waitForTimeout(150);
    ok("Isuot equips it",
       (await page.evaluate(() => Inventory.equipped("accessory"))) === "agimat");
    ok("the Anting-anting slot shows the item name",
       (await page.textContent('#shell-slots [data-slot="accessory"]')).includes("Agimat"));
    ok("the tile is badged as worn",
       (await page.textContent('#shell-items [data-item-id="agimat"]')).includes("Nakasuot"));
    ok("the action now offers Tanggalin",
       (await page.textContent("#shell-inv-action")).includes("Tanggalin"));
    ok("no failure note on a good write",
       (await page.textContent("#shell-inventory-note")).trim() === "");

    await page.click("#shell-inv-action");
    await page.waitForTimeout(150);
    ok("Tanggalin takes it off",
       (await page.evaluate(() => Inventory.equipped("accessory"))) === null);

    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    ok("back returns straight to the world",
       (await page.evaluate(() => Shell.state)) === "playing" &&
       !(await page.evaluate(() => Game.isPaused())));
    ok("the shell overlay is hidden again",
       await page.evaluate(() =>
         document.getElementById("shell").classList.contains("hidden")));

    await ctx.close();
  }

  if (section("T2", "Consumables and quest items on the inventory screen")) {
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    await page.evaluate(async () => {
      Game.addCurrency(20);
      await Inventory.buy("gatas");
      await Inventory.buy("gatas");
      addQuest("test_liham", "Test");
      await Inventory.buy("liham");
      health = 2;
      renderHearts();
    });

    await page.click("#btn-inventory");
    await page.waitForTimeout(150);

    ok("a stack shows its count on the tile",
       (await page.textContent('#shell-items [data-item-id="gatas"]')).includes("×2"));
    ok("a quest item is badged Misyon",
       (await page.textContent('#shell-items [data-item-id="liham"]')).includes("Misyon"));

    const order = await page.evaluate(() =>
      [...document.querySelectorAll("#shell-items .inv-tile")].map((t) => t.dataset.itemId));
    ok("tiles run permanent, then consumable, then quest",
       order.indexOf("sibat") < order.indexOf("gatas") &&
       order.indexOf("gatas") < order.indexOf("liham"), order);

    await page.click('#shell-items [data-item-id="gatas"]');
    await page.waitForTimeout(120);
    ok("a consumable's action is Gamitin",
       (await page.textContent("#shell-inv-action")).includes("Gamitin"));
    ok("its detail says what it does and how many are carried",
       (await page.textContent("#shell-inv-detail")).includes("Nagbabalik ng 1 puso") &&
       (await page.textContent("#shell-inv-detail")).includes("2 / 3"));

    await page.click("#shell-inv-action");
    await page.waitForTimeout(150);
    const ate = await page.evaluate(() => ({ health, count: Inventory.count("gatas") }));
    ok("Gamitin heals one heart", ate.health === 3, ate);
    ok("and spends one of the stack", ate.count === 1, ate);
    ok("the screen says what happened",
       (await page.textContent("#shell-inventory-note")).includes("Nagbalik ng 1 puso"));
    ok("at full health Gamitin is refused, with the reason on the button",
       (await page.isDisabled("#shell-inv-action")) &&
       (await page.textContent("#shell-inv-action")).includes("Buo ang iyong puso"));

    await page.click('#shell-items [data-item-id="liham"]');
    await page.waitForTimeout(120);
    ok("a quest item offers no action at all",
       !(await page.evaluate(() => document.getElementById("shell-inv-action"))));
    ok("and says it is for a quest",
       (await page.textContent("#shell-inv-detail")).includes("Pang-misyon"));

    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);
    await ctx.close();
  }

  if (section("U", "Inventory is optional to the flow")) {
    const { ctx, page } = await enterTestRoom("**/inventory.js*");

    ok("the module really is absent",
       await page.evaluate(() => !window.Inventory));
    ok("nothing threw during the act flow",
       (await page.evaluate(() => Acts.current)) === 1);
    ok("the engine keeps its three hearts",
       (await page.evaluate(() => maxHealth)) === 3);

    ok("no inventory button without the module",
       !(await visible(page, "#btn-inventory")));
    ok("and no shop button either",
       !(await visible(page, "#btn-shop")));

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

  if (section("V", "The currency award")) {
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

  if (section("W", "The award sums to the score")) {
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

  if (section("X", "Spending")) {
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

  if (section("Y", "Outfits")) {
    const { ctx, page } = await enterTestRoom();

    // Walk.png is the one sprite sheet that actually exists, so it stands
    // in for an outfit here. When the artist delivers, the only thing
    // that changes is the src in content/items.js.
    // Deliberately a src that is NOT the base sheet, or the assertion
    // passes just as well when the outfit is ignored entirely.
    const swapped = await page.evaluate(async () => {
      await Game.setOutfit({
        walk: { src: "assets/Skin_Test_Walk.png", frames: 12, fps: 12, columns: 5 },
      });
      return { src: SPRITE_SHEETS.walk.src, idle: SPRITE_SHEETS.idle.src };
    });
    ok("an outfit replaces the sheet it declares",
       swapped.src === "assets/Skin_Test_Walk.png", swapped);
    ok("and leaves the sheets it does not declare alone",
       swapped.idle === "assets/sprites/player/macario-idle.png", swapped);

    // A harness-owned fixture stands in for "an outfit whose art has been
    // drawn" — deliberately NOT the base walk sheet. This section only
    // needs to prove an outfit with real, loadable art actually repaints
    // the player; it should not care whether the base walk cycle currently
    // ships for real or not, and _dev/tests/fixtures/test-outfit-walk.png
    // stays put either way.
    const painted = await page.evaluate(async () => {
      await Game.setOutfit({
        walk: { src: "_dev/tests/fixtures/test-outfit-walk.png", frames: 12, fps: 12, columns: 5 },
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
       restored === "assets/sprites/player/macario-walk.png", restored);

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
       off.src === "assets/sprites/player/macario-walk.png" && !off.failed, off);

    await ctx.close();
  }

  if (section("Z", "The shop screen")) {
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => Game.addCurrency(60));

    await page.click("#btn-shop");
    await page.waitForTimeout(150);
    ok("the shop opens from its own button", await visible(page, "#shell-shop"));
    ok("shell state is shop",
       (await page.evaluate(() => Shell.state)) === "shop");
    ok("the world paused itself for the visit",
       await page.evaluate(() => Game.isPaused()));
    ok("the balance shows on the shop screen",
       (await page.textContent("#shell-shop-balance")).trim() === "60");

    const listed = await page.evaluate(() =>
      [...document.querySelectorAll("#shell-shop-list .inv-tile")].map((t) => t.dataset.shopId));
    ok("both cosmetics and the consumable are listed",
       listed.includes("damit-magsasaka") && listed.includes("damit-katipunero") &&
       listed.includes("gatas"), listed);
    ok("a quest item is not on the shelf while its quest is not open",
       !listed.includes("liham"), listed);

    await page.click('#shell-shop-list [data-shop-id="damit-katipunero"]');
    await page.waitForTimeout(100);
    ok("the one you cannot afford is disabled, and says why",
       (await page.isDisabled("#shell-shop-action")) &&
       (await page.textContent("#shell-shop-action")).includes("Kulang na barya"));

    await page.click('#shell-shop-list [data-shop-id="damit-magsasaka"]');
    await page.waitForTimeout(100);
    ok("tapping a tile selects it without buying it",
       !(await page.evaluate(() => Inventory.owns("damit-magsasaka"))) &&
       (await page.textContent("#shell-shop-balance")).trim() === "60");
    ok("the one you can afford offers Bilhin with its price",
       !(await page.isDisabled("#shell-shop-action")) &&
       (await page.textContent("#shell-shop-action")).includes("Bilhin: 50"));

    await page.click("#shell-shop-action");
    await page.waitForTimeout(200);
    ok("buying deducts from the shown balance",
       (await page.textContent("#shell-shop-balance")).trim() === "10");
    ok("the bought tile reads as owned",
       (await page.textContent('#shell-shop-list [data-shop-id="damit-magsasaka"]')).includes("Nasa iyo"));
    ok("and cannot be bought twice",
       (await page.isDisabled("#shell-shop-action")) &&
       (await page.textContent("#shell-shop-action")).includes("Nasa iyo na"));
    ok("the screen confirms the purchase",
       (await page.textContent("#shell-shop-note")).includes("Binili"));

    // A consumable stacks up to its maxStack, then the button says the
    // bag is full.
    await page.click('#shell-shop-list [data-shop-id="gatas"]');
    await page.waitForTimeout(100);
    await page.evaluate(() => Game.addCurrency(20));
    for (let i = 0; i < 3; i++) {
      await page.click("#shell-shop-action");
      await page.waitForTimeout(120);
    }
    const stack = await page.evaluate(() => ({
      count: Inventory.count("gatas"),
      row: __DB.player_inventory.find((r) => r.item_id === "gatas"),
      rows: __DB.player_inventory.filter((r) => r.item_id === "gatas").length,
    }));
    ok("a consumable can be bought more than once", stack.count === 3, stack);
    ok("as one row holding the quantity, not three rows",
       stack.rows === 1 && stack.row.quantity === 3, stack);
    ok("a full stack refuses another, with the reason on the button",
       (await page.isDisabled("#shell-shop-action")) &&
       (await page.textContent("#shell-shop-action")).includes("Puno ang supot"));

    // The quest item appears once its quest is open.
    await page.click("#shell-shop-back");
    await page.waitForTimeout(100);
    await page.evaluate(() => addQuest("test_liham", "Test"));
    await page.click("#btn-shop");
    await page.waitForTimeout(150);
    ok("a quest item is on the shelf while its quest is open",
       await page.evaluate(() => !!document.querySelector('#shell-shop-list [data-shop-id="liham"]')));

    await page.click("#shell-shop-back");
    await page.waitForTimeout(100);
    ok("back returns straight to the world",
       (await page.evaluate(() => Shell.state)) === "playing" &&
       !(await page.evaluate(() => Game.isPaused())));

    // What was bought is waiting in the inventory.
    await page.click("#btn-inventory");
    await page.waitForTimeout(150);
    ok("the new outfit is among the owned tiles",
       await page.evaluate(() => !!document.querySelector('#shell-items [data-item-id="damit-magsasaka"]')));
    ok("the inventory balance kept up",
       (await page.textContent("#shell-balance")).trim() !== "60");
    await page.click("#shell-inventory-back");
    await page.waitForTimeout(100);

    await ctx.close();
  }

  // -----------------------------------------------------------------
  // Block 12. The device pass findings.
  // -----------------------------------------------------------------

  if (section("AA", "The touch controls")) {
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
      .then(() => page.waitForTimeout(450)) // Block 71: the hit lands with the fist
      .then(() => page.evaluate(() => GUARDS[0].disabled));
    ok("tapping Atake swings", swung === true, swung);

    await ctx.close();
  }

  if (section("AB", "Camera and control fit")) {
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

  if (section("AC", "Portrait is a prompt, not a layout")) {
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

  if (section("AD", "Every button carries an icon")) {
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
        "shell-resume", "shell-pause-settings",
        "shell-logout", "shell-settings-back", "shell-reset",
        "shell-reset-yes", "shell-reset-no",
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

  if (section("AE", "Sizes on the target device, with icons in")) {
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

  if (section("AF", "The full reset is offered only to accounts that may use it")) {
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

  if (still()) { // the section above, continued
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

  if (still()) { // the section above, continued
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

  if (section("AG", "A wiped student starts the game from the beginning")) {
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

  if (section("AH", "Play-as-guest, no save")) {
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

    // Block 25. A guest has a working inventory in memory, so a quest
    // that needs a purchase can be finished without an account, and
    // still nothing is written.
    const guestShop = await page.evaluate(async () => {
      Game.addCurrency(10);
      const bought = await Inventory.buy("gatas");
      const worn = await Inventory.equip("gatas");
      health = 1;
      const used = await Inventory.use("gatas");
      return { bought, worn, used, health, count: Inventory.count("gatas"),
               rows: __DB.player_inventory.length };
    });
    ok("a guest can buy", guestShop.bought === true, guestShop);
    ok("and use what they bought", guestShop.used === true && guestShop.health === 2, guestShop);
    ok("without a single inventory row written", guestShop.rows === 0, guestShop);

    await page.waitForTimeout(1200);
    ok("still nothing written after time passes (no autosave for a guest)",
       (await page.evaluate(() => __DB.game_progress.length)) === 0);

    // Scan S4. A guest who finishes the act sees its end, with no test.
    const guestEnd = await page.evaluate(async () => {
      currentActData.objectives.forEach((o) => { state.flags[o.flag] = true; });
      markDirty();
      await new Promise((r) => setTimeout(r, 1800));
      return { shown: !document.getElementById("act-screen").classList.contains("hidden"),
        title: document.getElementById("act-screen-title").textContent,
        btn: document.querySelector("#act-screen-btn .lbl").textContent,
        quiz: !document.getElementById("quiz").classList.contains("hidden"),
        rows: __DB.act_progress.length + __DB.assessment_scores.length };
    });
    // Block 116: with Act II written, the end offers it, not the title.
    ok("a guest who finishes the act sees its end, no test, nothing written, and is offered the next act (S4, Block 116)",
       guestEnd.shown && guestEnd.title === "Magaling!" && guestEnd.btn === "Magpatuloy sa Ikalawang Yugto" &&
       !guestEnd.quiz && guestEnd.rows === 0, guestEnd);

    await page.reload();
    await page.waitForTimeout(300);
    ok("reload lands back on the title screen, not resumed as a guest",
       await visible(page, "#shell-title"));
    ok("and offers a start, not a resume, since nothing was ever saved",
       (await page.textContent("#shell-start")).trim() === "Magsimula",
       (await page.textContent("#shell-start")).trim());

    await ctx.close();
  }

  if (section("AI", "Aim-and-fire shooting animation")) {
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
    ok("shootAim covers frames 0-2", sheets.aim.startFrame === 0 && sheets.aim.endFrame === 2, sheets.aim);
    ok("shootFire covers frames 3-11, starting on the muzzle flash", sheets.fire.startFrame === 3 && sheets.fire.endFrame === 11, sheets.fire);
    ok("the sheet is read as a 5 by 3 grid of 12 frames",
       sheets.fire.columns === 5 && sheets.fire.frames === 12 && sheets.fire.rows === 3, sheets.fire);

    // Block 27: the aim pose waits AIM_POSE_DELAY_MS before showing, so
    // a tap goes straight into the punch without a flash of the aiming
    // arm first. Held past the delay, the aim pose shows as before.
    const pressed = await page.evaluate(() => {
      startAttackHold();
      return { anim: currentAnim, shooting };
    });
    ok("pressing attack does not show the aim pose on the first frame",
       pressed.shooting === null && pressed.anim !== "shootAim", pressed);
    await page.waitForTimeout(250);
    const aiming = await page.evaluate(() => ({ anim: currentAnim, frame: currentFrame, shooting }));
    ok("held past the delay, it switches to the aim pose",
       aiming.anim === "shootAim" && aiming.shooting === "aim", aiming);
    ok("the aim pose starts at the beginning of its own range, not past it",
       aiming.frame >= 0 && aiming.frame <= 3, aiming);

    // Held well past the aim clip's own length (3 frames at 8fps =
    // 375ms): it must have climbed to frame 2 and stayed there,
    // proven by sampling twice a tick apart, rather than looped back to
    // frame 0 or run past the sub-range into shootFire's frames.
    await page.waitForTimeout(2000);
    const held = await page.evaluate(() => new Promise((resolve) => {
      const first = currentFrame;
      requestAnimationFrame(() => requestAnimationFrame(() =>
        resolve({ first, second: currentFrame, anim: currentAnim })));
    }));
    ok("a long hold settles on the aim clip's last frame (2) and holds there",
       held.first === 2 && held.second === 2 && held.anim === "shootAim", held);

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
    ok("releasing early plays the melee punch instead of the aim pose",
       tapped.shooting === "melee" && tapped.anim === "melee", tapped);
    ok("and throws nothing", tapped.projectile === false, tapped);

    // The punch: its sheet loaded, and it hands the pose back on its own
    // once its 12 frames at 24fps (500ms) have played.
    const melee = await page.evaluate(() => SPRITE_SHEETS.melee);
    ok("the melee sheet loaded without falling back to a placeholder",
       melee && melee.failed === false, melee);
    ok("and is read as a 4 by 3 grid of 12 frames",
       melee.columns === 4 && melee.frames === 12 && melee.rows === 3, melee);
    await page.waitForTimeout(700);
    const punched = await page.evaluate(() => ({ shooting, anim: currentAnim, frame: currentFrame }));
    ok("the punch hands the pose back afterwards",
       punched.shooting === null && (punched.anim === "idle" || punched.anim === "walk"), punched);

    // Block 71. The hit lands on the frame the fist reaches out, not on
    // release. meleeAttack is wrapped to record the frame it ran on.
    const contact = await page.evaluate(() => new Promise((resolve) => {
      const real = meleeAttack;
      const hits = [];
      meleeAttack = () => { hits.push({ frame: currentFrame, anim: currentAnim }); real(); };
      startAttackHold();
      endAttackHold();
      const onRelease = hits.length;
      // A second tap while the fist is still on its way must not restart
      // the punch or add a second hit.
      startAttackHold();
      endAttackHold();
      const afterSecondTap = { hits: hits.length, frame: currentFrame };
      setTimeout(() => {
        meleeAttack = real;
        resolve({ onRelease, afterSecondTap, hits, contact: SPRITE_SHEETS.melee.contact,
                  shooting, anim: currentAnim });
      }, 700);
    }));
    ok("releasing a tap does not land the hit before the fist is out",
       contact.onRelease === 0 && contact.afterSecondTap.hits === 0, contact);
    ok("the hit lands once, on the punch's contact frame",
       contact.contact === 6 && contact.hits.length === 1 &&
       contact.hits[0].frame === 6 && contact.hits[0].anim === "melee", contact);
    ok("and the pose is handed back after the clip",
       contact.shooting === null && contact.anim !== "melee", contact);

    // A punch cut off before contact (a respawn, a cutscene) never lands.
    const cut = await page.evaluate(() => new Promise((resolve) => {
      const real = meleeAttack;
      let hits = 0;
      meleeAttack = () => { hits++; real(); };
      startAttackHold();
      endAttackHold();
      shooting = null; // what respawnInScene does
      setTimeout(() => { meleeAttack = real; resolve({ hits, pending: meleePending }); }, 500);
    }));
    ok("a punch interrupted before its fist lands does not hit",
       cut.hits === 0 && cut.pending === false, cut);

    // A tap that is quick enough never shows the aim pose at all, even
    // for a frame: sampled every animation frame from press to release.
    const flash = await page.evaluate(() => new Promise((resolve) => {
      let sawAim = false;
      startAttackHold();
      const t0 = performance.now();
      const tick = () => {
        if (currentAnim === "shootAim") sawAim = true;
        if (performance.now() - t0 < 90) requestAnimationFrame(tick);
        else { endAttackHold(); resolve({ sawAim, anim: currentAnim }); }
      };
      requestAnimationFrame(tick);
    }));
    ok("a quick tap never flashes the aim pose first", !flash.sawAim && flash.anim === "melee", flash);
    await page.waitForTimeout(700);

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
    ok("starting on the fire clip's own first frame, the flash (3)", fired.frame === 3, fired);
    ok("and the projectile appears at the same moment", fired.projectile === true, fired);

    // The shot starts at the drawn pistol's tip: in front of the body and
    // at the gun's height rather than at the old fixed chest height.
    const muzzle = await page.evaluate(() => {
      destroyProjectile();
      posX = 400; posY = floorHeightAt(400); facing = 1;
      throwProjectile();
      const right = { x: projectile.x, y: projectile.y - posY };
      destroyProjectile();
      facing = -1;
      throwProjectile();
      const left = { x: projectile.x + PROJECTILE_SIZE, y: projectile.y - posY };
      destroyProjectile();
      return { centre: posX + PLAYER_WIDTH / 2, right, left };
    });
    ok("facing right, the shot starts at the muzzle, well in front of him",
       muzzle.right.x - muzzle.centre > 55 && muzzle.right.x - muzzle.centre < 80, muzzle);
    ok("facing left, the same distance on the other side",
       Math.abs((muzzle.centre - muzzle.left.x) - (muzzle.right.x - muzzle.centre)) <= 1, muzzle);
    ok("at the pistol's height, not the old chest height",
       muzzle.right.y > 85 && muzzle.right.y < 115 && muzzle.left.y === muzzle.right.y, muzzle);

    // The fire clip is 9 frames at 18fps (500ms). Comfortably after that,
    // the pose must have been handed back to the ordinary idle/walk
    // switch on its own, with no button press or gameplay code required.
    await page.waitForTimeout(800);
    const settled = await page.evaluate(() => ({ shooting, anim: currentAnim }));
    ok("the fire clip hands the pose back afterwards",
       settled.shooting === null && (settled.anim === "idle" || settled.anim === "walk"), settled);

    // A guard catch or hazard can respawn the player mid-hold. The pose
    // must not stay stuck on the aim frame for the rest of the visit to
    // the scene once that happens.
    const stuck = await page.evaluate(() => {
      startAttackHold();
      attackHoldStart = performance.now() - 300;
      updateAttackHoldPose(performance.now());
      respawnInScene();
      return { shooting, attackHoldStart };
    });
    ok("a respawn clears a held aim pose rather than leaving it stuck",
       stuck.shooting === null && stuck.attackHoldStart === 0, stuck);

    await page.evaluate(() => destroyProjectile());
    await ctx.close();
  }

  if (section("AJ", "A seamless backdrop and player stacking")) {
    // #player must out-stack every NPC/guard/decoration, which are all
    // appended into #world after #player already exists in the static
    // HTML (see loadScene's build*() calls). Without a positive z-index,
    // plain DOM-order stacking would put Macario behind anything added
    // after him, such as Nanay.
    const { ctx, page } = await enterTestRoom();
    const playerZ = await page.evaluate(() =>
      getComputedStyle(document.getElementById("player")).zIndex);
    ok("Macario sits in a positive stacking tier above DOM-later NPCs",
       Number(playerZ) > 0, playerZ);

    await page.waitForTimeout(200);
    const skylineText = await page.evaluate(() =>
      document.getElementById("skyline").textContent);
    ok("the skyline backdrop loads without falling back to a placeholder",
       skylineText === "", skylineText);

    // Block 26: the backdrop is tiles, every other one mirrored, instead
    // of a repeat-x background with a dark band over each seam.
    const tiles = await page.evaluate(() => {
      const els = [...document.querySelectorAll("#skyline .skyline-tile")];
      const last = els[els.length - 1];
      return {
        count: els.length,
        mirrored: els.map((el) => el.classList.contains("skyline-tile-mirrored")),
        covers: last ? parseFloat(last.style.left) + parseFloat(last.style.width) >= world.clientWidth : false,
        layerBackground: getComputedStyle(document.getElementById("skyline")).backgroundImage,
        shadows: document.querySelectorAll(".tree-shadow").length,
      };
    });
    ok("the backdrop is laid out as more than one tile", tiles.count > 1, tiles);
    ok("every other tile is mirrored, starting with the second",
       tiles.mirrored.every((m, i) => m === (i % 2 === 1)), tiles.mirrored);
    ok("the tiles cover the whole world", tiles.covers, tiles);
    ok("the layer's own repeat is switched off once tiled",
       tiles.layerBackground === "none", tiles.layerBackground);
    ok("no seam-covering shadow band is drawn any more", tiles.shadows === 0, tiles);

    // The seam, in pixels. Everything in front of the backdrop is hidden,
    // the camera is put on the first seam, and the columns either side
    // of it are compared with columns either side of an ordinary point
    // nearby. A seam that jumps differs far more than neighbouring
    // columns of the same painting do.
    await page.evaluate(() => {
      GUARDS.forEach((g) => { g.disabled = true; });
      const style = document.createElement("style");
      style.id = "seam-test";
      style.textContent = "#world > :not(#skyline), #hud, #quest-log, #mobile-controls, " +
        "#btn-pause, #btn-inventory, #btn-shop, #toast { visibility: hidden !important; } " +
        "*, *::before { animation-play-state: paused !important; }";
      document.head.appendChild(style);
      const seam = parseFloat(document.querySelectorAll("#skyline .skyline-tile")[1].style.left);
      posX = seam - PLAYER_WIDTH / 2;
    });
    await page.waitForTimeout(300);
    const shot = (await page.screenshot()).toString("base64");
    const seam = await page.evaluate(async (b64) => {
      const img = await createImageBitmap(await (await fetch("data:image/png;base64," + b64)).blob());
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, img.width, img.height).data;
      const w = world.getBoundingClientRect();
      const z = w.width / world.offsetWidth;
      const seamWorld = parseFloat(document.querySelectorAll("#skyline .skyline-tile")[1].style.left);
      const sx = Math.round(w.left + seamWorld * z);
      // Columns 2px either side of x, over the top two thirds of the
      // screen, where there is sky, trees and water but no ground tiles.
      const jump = (x) => {
        let sum = 0, n = 0;
        for (let y = 0; y < Math.floor(img.height * 0.66); y++) {
          const i = (y * img.width + (x - 2)) * 4;
          const j = (y * img.width + (x + 2)) * 4;
          sum += Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]);
          n++;
        }
        return sum / n;
      };
      const nearby = [-60, -40, 40, 60].map((o) => jump(sx + o));
      return { sx, atSeam: jump(sx), nearby: nearby.reduce((a, b) => a + b, 0) / nearby.length };
    }, shot);
    ok("the join between two tiles is as continuous as the painting either side of it",
       seam.sx > 10 && seam.atSeam <= seam.nearby * 1.5 + 4, seam);

    await page.evaluate(() => document.getElementById("seam-test").remove());

    // Leaving the scene removes the tiles with everything else loadScene
    // created, and loading one builds exactly one fresh set.
    await page.evaluate(() => unloadScene());
    const afterUnload = await page.evaluate(() => document.querySelectorAll(".skyline-tile").length);
    ok("unloading the scene removes the tiles", afterUnload === 0, afterUnload);
    const rebuilt = await page.evaluate(() => {
      loadScene("misyon");
      return document.querySelectorAll("#skyline .skyline-tile").length;
    });
    ok("reloading a scene builds one set, not a second set on top",
       rebuilt === tiles.count, { rebuilt, before: tiles.count });

    await ctx.close();
  }

  if (section("AK", "Shop-opening NPCs, a gift's onComplete, and an item's buyFlag")) {
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
        slot: "accessory", price: 0, img: "assets/Test.png",
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

  if (section("AL", "Interaction reach, a clean throw, and a consumable item")) {
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

    // Gatas: a consumable (kind: "consumable", no slot). Since Block 25
    // it does nothing while carried, heals when used, stacks, refuses to
    // be worn, and puts a unit back on a failed write.
    const bought = await page.evaluate(async () => {
      health = 3;
      Game.addCurrency(10);
      const ok1 = await Inventory.buy("gatas");
      return { ok1, max: maxHealth, health, count: Inventory.count("gatas") };
    });
    ok("buying the consumable works", bought.ok1 === true, bought);
    ok("carrying it changes nothing about health",
       bought.max === 3 && bought.health === 3, bought);

    const notWearable = await page.evaluate(async () => {
      const equipped = await Inventory.equip("gatas");
      const toggled = await Inventory.toggle("gatas");
      return { equipped, toggled };
    });
    ok("a consumable refuses to be equipped", notWearable.equipped === false, notWearable);
    ok("and refuses toggle() too", notWearable.toggled === false, notWearable);

    const refusedFull = await page.evaluate(async () => {
      health = maxHealth;
      const used = await Inventory.use("gatas");
      return { used, count: Inventory.count("gatas") };
    });
    ok("using a heal at full health is refused", refusedFull.used === false, refusedFull);
    ok("and does not spend it", refusedFull.count === 1, refusedFull);

    const used = await page.evaluate(async () => {
      health = 1;
      const ok2 = await Inventory.use("gatas");
      return {
        ok2, health, owns: Inventory.owns("gatas"),
        rows: __DB.player_inventory.filter((r) => r.item_id === "gatas").length,
      };
    });
    ok("using it succeeds", used.ok2 === true, used);
    ok("it heals one heart", used.health === 2, used);
    ok("the last one is no longer owned", !used.owns, used);
    ok("and its row is gone from the database, not left at zero", used.rows === 0, used);

    // A failed write must not lose the unit.
    const rolledBack = await page.evaluate(async () => {
      Game.addCurrency(10);
      await Inventory.buy("gatas");
      const realFrom = sb.from;
      sb.from = function (table) {
        if (table !== "player_inventory") return realFrom.call(sb, table);
        return { delete: () => ({ eq: () => ({ eq: () =>
          Promise.resolve({ error: { message: "simulated" } }) }) }) };
      };
      health = 1;
      const failed = await Inventory.use("gatas");
      sb.from = realFrom;
      return { failed, count: Inventory.count("gatas") };
    });
    ok("a failed use reports failure", rolledBack.failed === false, rolledBack);
    ok("and puts the unit back", rolledBack.count === 1, rolledBack);

    // A quest item: consumed by the story, never used or worn.
    const quest = await page.evaluate(async () => {
      Game.addCurrency(10);
      addQuest("test_liham", "Test");
      const bought = await Inventory.buy("liham");
      const second = await Inventory.buy("liham");
      const used = await Inventory.use("liham");
      const worn = await Inventory.equip("liham");
      const flag = state.flags.test_binilhAngLiham === true;
      const consumed = await Inventory.consume("liham");
      return { bought, second, used, worn, flag, consumed, owns: Inventory.owns("liham") };
    });
    ok("a quest item can be bought while its quest is open", quest.bought === true, quest);
    ok("but only one of it", quest.second === false, quest);
    ok("it cannot be used or worn", quest.used === false && quest.worn === false, quest);
    ok("its buyFlag is set", quest.flag, quest);
    ok("the story can consume it", quest.consumed === true && !quest.owns, quest);

    await ctx.close();
  }

  if (section("AM", "Bodies: the drawn character stands where the logic does")) {
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
      NPCS.push({ id: "body-npc", x: 900, label: "Test", img: "assets/Missing_Body_Test.png" });
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

  if (section("AN", "The pixel theme")) {
    // Block 29. The fonts are self-hosted, so they must actually load
    // from assets/fonts rather than silently falling back to Courier,
    // which is the plain look the block replaced. And the chrome is flat:
    // square corners and no soft shadows on the windows and buttons.
    const { ctx, page } = await enterTestRoom();
    await page.waitForTimeout(300);
    const theme = await page.evaluate(async () => {
      await document.fonts.ready;
      const loaded = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, ""));
      const cs = (sel) => getComputedStyle(document.querySelector(sel));
      return {
        loaded,
        bodyFont: cs("body").fontFamily,
        headingFont: cs(".shell-heading").fontFamily,
        radii: ["#shell-box", ".shell-btn", "#quest-log", "#btn-pause", ".touch-btn", "#quiz-box"]
          .map((sel) => [sel, cs(sel).borderTopLeftRadius]),
        buttonImage: cs(".shell-btn-primary").backgroundImage,
      };
    });
    ok("VT323 loads from the repository", theme.loaded.includes("VT323"), theme.loaded);
    ok("Press Start 2P loads from the repository", theme.loaded.includes("Press Start 2P"), theme.loaded);
    ok("body text uses VT323", theme.bodyFont.includes("VT323"), theme.bodyFont);
    ok("headings use Press Start 2P", theme.headingFont.includes("Press Start 2P"), theme.headingFont);
    ok("windows and buttons have square corners",
       theme.radii.every(([, r]) => r === "0px"), theme.radii);
    ok("the primary button is a flat fill, not a gradient",
       theme.buttonImage === "none", theme.buttonImage);
    await ctx.close();
  }

  if (section("AO", "Sound: music, the gunshot, NPC ambience, and the two switches")) {
    // Block 30. The sounds are real files played by the real engine; what
    // is checked is which element or buffer the engine asked to play and
    // when, since a headless browser has no ears. The two spies below
    // count every Web Audio buffer started and every <audio> play() call,
    // so a check cannot pass by the fallback path doing the work quietly.
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));
    const spy = () => page.evaluate(() => {
      window.__SOUND = { buffers: 0, plays: [] };
      if (window.AudioContext && !AudioContext.prototype.__spied) {
        const make = AudioContext.prototype.createBufferSource;
        AudioContext.prototype.createBufferSource = function () {
          const node = make.call(this);
          const start = node.start.bind(node);
          node.start = (...a) => { window.__SOUND.buffers++; return start(...a); };
          return node;
        };
        const play = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
          window.__SOUND.plays.push(this.src);
          return play.call(this);
        };
        AudioContext.prototype.__spied = true;
      }
    });
    await spy();

    const music = await page.evaluate(() => ({
      exists: !!musicEl, src: musicEl && musicEl.src, loop: musicEl && musicEl.loop,
      paused: musicEl ? musicEl.paused : null, wanted: musicWanted,
    }));
    ok("entering the world starts the background music", music.exists && music.wanted, music);
    ok("and it is Calm.mp3, looping", /calm\.mp3/.test(music.src) && music.loop, music);
    ok("and it is actually playing", music.paused === false, music);

    // The gunshot is decoded ahead of time, so the first shot does not
    // wait on the network. Allowed a moment: the fetch starts at parse.
    await page.waitForFunction(() => !!sfxBuffers.gunShot, null, { timeout: 5000 }).catch(() => {});
    ok("Gun_Shot.mp3 is decoded before the first shot", await page.evaluate(() => !!sfxBuffers.gunShot));

    // Block 60. A punch now swings (swing.wav), so the check is on which
    // effect is asked for, not on whether any sound plays at all.
    // Since Block 71 the swing is heard with the fist, on the contact
    // frame, so the spy stays on until the punch has played out.
    const tap = await page.evaluate(() => new Promise((resolve) => {
      destroyProjectile();
      const asked = [];
      const real = playSfx;
      window.playSfx = (name) => { asked.push(name); return real(name); };
      startAttackHold();
      endAttackHold();
      const shot = shooting;
      setTimeout(() => { window.playSfx = real; resolve({ asked, shooting: shot }); }, 450);
    }));
    ok("a tap (the punch) makes no gunshot, only the swing",
       !tap.asked.includes("gunShot") && tap.asked.includes("swing"), tap);
    await page.waitForTimeout(700);

    const shot = await page.evaluate(() => {
      destroyProjectile();
      __SOUND.buffers = 0; __SOUND.plays = [];
      startAttackHold();
      attackHoldStart = performance.now() - ATTACK_HOLD_MS - 50;
      endAttackHold();
      return { buffers: __SOUND.buffers, plays: __SOUND.plays, projectile: projectile !== null, shooting };
    });
    ok("a hold released into a shot plays the gunshot in the same step",
       shot.projectile && shot.shooting === "fire" && shot.buffers === 1, shot);

    const second = await page.evaluate(() => {
      __SOUND.buffers = 0;
      startAttackHold();
      attackHoldStart = performance.now() - ATTACK_HOLD_MS - 50;
      endAttackHold(); // the first shot is still in flight
      return { buffers: __SOUND.buffers };
    });
    ok("a release while the last shot is still flying makes no second bang",
       second.buffers === 0, second);
    await page.waitForTimeout(700);

    // NPC ambience, against a test NPC added to the fixture scene at run
    // time, so the mechanism is checked apart from whatever Act I ships.
    const near = await page.evaluate(() => new Promise((resolve) => {
      destroyProjectile();
      NPCS.push({ id: "test-kalabaw", x: 1200, label: "Kalabaw", nearSound: "assets/audio/sfx/horse.mp3" });
      posX = 200;
      const far = nearSoundEls.size;
      posX = 1200 - 40 - 50; // a 50px gap, inside INTERACT_DISTANCE
      setTimeout(() => {
        const e = nearSoundEls.get("assets/audio/sfx/horse.mp3");
        resolve({ far, has: !!e, loop: e && e.el.loop, paused: e ? e.el.paused : null, volume: e && e.el.volume });
      }, 800);
    }));
    ok("nothing plays while far from a nearSound NPC", near.far === 0, near);
    ok("walking into talking range starts its sound, looping", near.has && near.loop && near.paused === false, near);
    ok("and it has faded all the way in", Math.abs(near.volume - 0.7) < 0.01, near);

    const band = await page.evaluate(() => new Promise((resolve) => {
      posX = 1200 - 40 - (INTERACT_DISTANCE + 30); // past reach, inside the release band
      // Longer than a whole fade (NEAR_SOUND_FADE_MS), and at full volume
      // rather than merely present: a sound that had started fading out
      // is still in the map for half a second, which is how this check
      // once passed with the band removed entirely.
      setTimeout(() => {
        const e = nearSoundEls.get("assets/audio/sfx/horse.mp3");
        resolve({ has: !!e, volume: e && e.el.volume });
      }, NEAR_SOUND_FADE_MS + 300);
    }));
    ok("stepping just past reach does not cut it (the release band)",
       band.has && Math.abs(band.volume - 0.7) < 0.01, band);

    // Block 118: watched until it has gone, up to three seconds, not
    // read after a fixed 900 ms: the fade runs on the game's frames, and
    // a busy machine (CI, two suites side by side) gives fewer of them.
    const left = await page.evaluate(() => new Promise((resolve) => {
      const e = nearSoundEls.get("assets/audio/sfx/horse.mp3");
      posX = 200;
      const t0 = performance.now();
      const check = () => {
        const gone = !nearSoundEls.has("assets/audio/sfx/horse.mp3");
        if ((gone && e.el.paused) || performance.now() - t0 > 3000) {
          resolve({ gone, paused: e.el.paused, rewound: e.el.currentTime === 0 });
          return;
        }
        setTimeout(check, 50);
      };
      setTimeout(check, 300);
    }));
    ok("walking away fades it out and stops it", left.gone && left.paused, left);
    ok("rewound, so the next approach starts from the top", left.rewound, left);

    const pausedNear = await page.evaluate(() => new Promise((resolve) => {
      posX = 1200 - 40 - 50;
      setTimeout(() => {
        const started = nearSoundEls.has("assets/audio/sfx/horse.mp3");
        setPaused(true);
        setTimeout(() => {
          const r = { started, gone: !nearSoundEls.has("assets/audio/sfx/horse.mp3"),
                      musicPaused: musicEl.paused };
          setPaused(false);
          resolve(r);
        }, 900);
      }, 700);
    }));
    ok("pausing the world fades the ambience out while standing still",
       pausedNear.started && pausedNear.gone, pausedNear);
    ok("but the music keeps playing behind the pause screen",
       pausedNear.musicPaused === false, pausedNear);

    // The switches, driven through the real settings screen.
    await page.click("#btn-pause");
    await page.waitForTimeout(150);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(250);
    ok("settings shows Musika and Mga tunog both on by default",
       await page.evaluate(() =>
         document.querySelector('#shell-music [data-music="on"]').classList.contains("active") &&
         document.querySelector('#shell-sfx [data-sfx="on"]').classList.contains("active")));
    const choiceHeight = await page.evaluate(() =>
      Math.round(document.querySelector('#shell-sfx [data-sfx="off"]').getBoundingClientRect().height));
    ok("a sound switch clears 44px on screen", choiceHeight >= 44, choiceHeight);

    await page.click('#shell-music [data-music="off"]');
    await page.click('#shell-sfx [data-sfx="off"]');
    await page.waitForTimeout(100);
    const off = await page.evaluate(() => ({
      audio: Game.audio(), musicPaused: musicEl.paused,
      stored: JSON.parse(localStorage.getItem("macario:settings")),
      offActive: document.querySelector('#shell-music [data-music="off"]').classList.contains("active"),
    }));
    ok("Patay on Musika stops the music", off.audio.music === false && off.musicPaused, off);
    ok("and the switch shows it", off.offActive, off);
    ok("both switches are saved on the device",
       off.stored.music === false && off.stored.sfx === false, off.stored);
    await page.click("#shell-settings-back");
    await page.waitForTimeout(100);
    await page.click("#shell-resume");
    await page.waitForTimeout(150);

    const silent = await page.evaluate(() => new Promise((resolve) => {
      destroyProjectile();
      __SOUND.buffers = 0; __SOUND.plays = [];
      startAttackHold();
      attackHoldStart = performance.now() - ATTACK_HOLD_MS - 50;
      endAttackHold();
      posX = 1200 - 40 - 50;
      setTimeout(() => resolve({ buffers: __SOUND.buffers, plays: __SOUND.plays.length,
                                 near: nearSoundEls.size }), 700);
    }));
    ok("with Mga tunog off, a shot is silent", silent.buffers === 0, silent);
    ok("and a nearSound NPC stays silent", silent.near === 0 && silent.plays === 0, silent);

    // A hidden tab goes quiet even with music on.
    const hidden = await page.evaluate(() => {
      Game.setAudio({ music: true, sfx: true });
      const wasPlaying = !musicEl.paused;
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
      const r = { wasPlaying, pausedWhenHidden: musicEl.paused };
      delete document.hidden;
      document.dispatchEvent(new Event("visibilitychange"));
      r.back = !musicEl.paused;
      return r;
    });
    ok("hiding the tab pauses the music", hidden.pausedWhenHidden, hidden);
    ok("and showing it again resumes", hidden.back, hidden);
    await ctx.close();

    // A reload restores the switches, and a settings value from before
    // Block 30 (no music or sfx key) keeps sound on rather than off.
    const { ctx: c2, page: p2 } = await newPage({ session: null });
    await p2.evaluate(() => localStorage.setItem("macario:settings", JSON.stringify({ textSize: "lg", music: false, sfx: true })));
    await p2.reload();
    await p2.waitForTimeout(300);
    ok("a reload restores Musika off", (await p2.evaluate(() => Game.audio())).music === false);
    await p2.evaluate(() => localStorage.setItem("macario:settings", JSON.stringify({ textSize: "lg" })));
    await p2.reload();
    await p2.waitForTimeout(300);
    const legacy = await p2.evaluate(() => Game.audio());
    ok("an older saved setting keeps both on", legacy.music && legacy.sfx, legacy);
    await c2.close();
  }

  if (section("AP", "Arrival dialogues and skipped dialogue sets")) {
    // Block 31, against scenes and an NPC added to the fixture at run time,
    // so the mechanism is checked apart from what Act I ships.
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => {
      GUARDS.forEach((g) => { g.disabled = true; });
      const tondo = SCENES.find((sc) => sc.id === "tondo");
      tondo.arrivalDialogues = [
        { requiresFlag: "test_bumalik", doneFlag: "test_narinig", x: 900, facing: -1,
          lines: [{ speaker: "A", text: "una" }, { speaker: "B", text: "ikalawa" }],
          onComplete: () => { window.__arrivalDone = (window.__arrivalDone || 0) + 1; } },
      ];
      tondo.npcs = [{ id: "test-ina", x: 300, label: "Ina", stage: 0, dialogueSets: [
        { skipIfFlag: "test_umalis", lines: [{ speaker: "Ina", text: "unang bilin" }], onComplete: () => {} },
        { lines: [{ speaker: "Ina", text: "paalam" }], onComplete: () => {} },
      ] }];
    });

    const gated = await page.evaluate(async () => {
      await fadeToScene("tondo");
      return { open: inDialogue, room: currentRoom };
    });
    ok("an arrival whose requiresFlag is unset does not open", gated.room === "tondo" && !gated.open, gated);

    const midFade = await page.evaluate(() => new Promise((resolve) => {
      state.flags.test_bumalik = true;
      const done = fadeToScene("tondo");
      // Block 115: the story runs __TEST_SPEED times faster here.
      setTimeout(() => resolve({ open: inDialogue, posX, facing, black: blackout.classList.contains("visible") }), 1100 / (window.__TEST_SPEED || 1));
      window.__fade = done;
    }));
    ok("under the blackout Macario is already placed, with nothing open yet",
       !midFade.open && midFade.black && midFade.posX === 900 && midFade.facing === -1, midFade);
    const arrived = await page.evaluate(async () => {
      await window.__fade;
      return { open: inDialogue, text: dialogueText.textContent, playing: !cutscenePlaying };
    });
    ok("once the fade-in ends, its first line is open", arrived.open && arrived.text === "una" && arrived.playing, arrived);

    await page.keyboard.press("e");
    await page.waitForTimeout(80);
    ok("E advances it like any conversation", (await page.evaluate(() => dialogueText.textContent)) === "ikalawa");
    await page.keyboard.press("e");
    await page.waitForTimeout(80);
    const closed = await page.evaluate(() => ({ open: inDialogue, flag: state.flags.test_narinig, done: window.__arrivalDone }));
    ok("closing it sets its doneFlag and runs onComplete once", !closed.open && closed.flag === true && closed.done === 1, closed);

    const again = await page.evaluate(async () => {
      await fadeToScene("tondo");
      return { open: inDialogue, done: window.__arrivalDone };
    });
    ok("it does not play a second time", !again.open && again.done === 1, again);

    const talks = await page.evaluate(() => {
      const ina = NPCS.find((n) => n.id === "test-ina");
      posX = 230;
      startDialogue(ina);
      const first = dialogueText.textContent;
      advanceDialogue();
      state.flags.test_umalis = true;
      loadScene("tondo"); // stage back to 0, as any return to a scene does
      const ina2 = NPCS.find((n) => n.id === "test-ina");
      startDialogue(ina2);
      const second = dialogueText.textContent;
      advanceDialogue();
      return { first, second };
    });
    ok("a set is played normally while its skipIfFlag is unset", talks.first === "unang bilin", talks);
    ok("and skipped once it is set, even after stage resets to 0", talks.second === "paalam", talks);
    await ctx.close();
  }

  if (section("AQ", "Standing-still detection, seller stock, and a shop after talking")) {
    // Block 32, against the fixture guard and catalogue plus an item and
    // NPC added at run time, so none of it depends on Act I's content.
    const { ctx, page } = await enterTestRoom();

    // The meter is driven by calling updateGuards directly with the loop
    // paused, so frame timing cannot blur a factor of two.
    const fill = (effects, still) => page.evaluate(({ effects, still }) => {
      setPaused(true);
      setEffects(effects);
      const g = GUARDS[0];
      g.disabled = false;
      g.patrolFrom = g.patrolTo = g.pos; // a sentry, so it keeps facing
      g.facing = 1;
      posX = g.pos + GUARD_WIDTH + 100; // in front, inside detectRadius
      posY = floorHeightAt(posX);
      invulnUntil = 0;
      g.alert = 0;
      playerStill = still;
      for (let i = 0; i < 20; i++) updateGuards(1);
      const alert = g.alert;
      g.alert = 0;
      setPaused(false);
      return alert;
    }, { effects, still });

    const base = await fill({}, true);
    const worn = await fill({ stillDetectionMult: 0.5 }, true);
    const moving = await fill({ stillDetectionMult: 0.5 }, false);
    ok("a guard's meter fills while Macario stands in view", base > 0, base);
    ok("wearing stillDetectionMult 0.5, standing still fills it half as fast",
       Math.abs(worn - base / 2) < 1e-9, { base, worn });
    ok("moving fills it at the normal rate, effect or not", Math.abs(moving - base) < 1e-9, { base, moving });
    const rejected = await page.evaluate(() => {
      setEffects({ stillDetectionMult: 2 });
      const r = equipEffects.stillDetectionMult;
      setEffects({});
      return r;
    });
    ok("an effect that would make him easier to see is refused", rejected === 1, rejected);
    ok("the loop marks him still when idle on the ground",
       await page.evaluate(() => new Promise((r) => { keysPressed["d"] = false; setTimeout(() => r(playerStill), 200); })));

    // Inventory reduces worn items to the number.
    const summed = await page.evaluate(() => {
      ITEMS.push({ id: "test-damit", name: "Test", kind: "equipment", slot: "outfit", price: 7,
                   soldBy: "test-mananahi", effect: { stillDetectionMult: 0.5 } });
      return { effects: Inventory.effects(), lines: Inventory.effectLines(Inventory.item("test-damit")) };
    });
    ok("Inventory.effects starts from a neutral multiplier", summed.effects.stillDetectionMult === 1, summed.effects);
    ok("and effectLines describes the effect in Tagalog",
       summed.lines.some((l) => l.includes("2× na mas mabagal kang mapapansin ng mga bantay")), summed.lines);

    const stock = await page.evaluate(() => ({
      corner: Inventory.forSale(null).map((i) => i.id),
      seller: Inventory.forSale("test-mananahi").map((i) => i.id),
      other: Inventory.forSale("tindero").map((i) => i.id),
    }));
    ok("a seller with its own stock lists only that", stock.seller.length === 1 && stock.seller[0] === "test-damit", stock);
    ok("the corner button never lists a seller's item", !stock.corner.includes("test-damit") && stock.corner.length > 0, stock);
    ok("a seller with no stock of its own lists the general stock", JSON.stringify(stock.other) === JSON.stringify(stock.corner), stock);

    // An NPC that talks first and sells afterwards.
    await page.evaluate(() => {
      GUARDS.forEach((g) => { g.disabled = true; });
      NPCS.push({ id: "test-mananahi", x: 700, label: "Mananahi", stage: 0, opensShopAfter: "test_nakausap",
        dialogueSets: [{ lines: [{ speaker: "M", text: "bayad muna" }],
                         onComplete: () => { state.flags.test_nakausap = true; } }] });
      posX = 700 - 40 - 30;
      posY = floorHeightAt(posX);
    });
    await page.waitForTimeout(150);
    ok("before the flag, E talks", await page.evaluate(() => {
      handleInteractPress();
      return inDialogue && dialogueText.textContent === "bayad muna";
    }));
    await page.keyboard.press("e");
    await page.waitForTimeout(200);
    const shopAfter = await page.evaluate(() => ({
      state: Shell.state, seller: Shell.shopSeller,
      shelf: [...document.querySelectorAll("#shell-shop-list [data-shop-id]")].map((t) => t.dataset.shopId),
    }));
    ok("the conversation that sets the flag ends in that seller's shop",
       shopAfter.state === "shop" && shopAfter.seller === "test-mananahi", shopAfter);
    ok("showing only that seller's stock", JSON.stringify(shopAfter.shelf) === '["test-damit"]', shopAfter.shelf);
    await page.click("#shell-shop-back");
    await page.waitForTimeout(150);
    const direct = await page.evaluate(() => {
      const label = document.querySelector("#btn-interact .lbl").textContent;
      handleInteractPress();
      return { label, state: Shell.state, talking: inDialogue };
    });
    ok("after it, the prompt reads Tindahan and E opens the shop directly",
       direct.label === "Tindahan" && direct.state === "shop" && !direct.talking, direct);
    await page.click("#shell-shop-back");
    await page.waitForTimeout(150);
    await page.click("#btn-shop");
    await page.waitForTimeout(150);
    ok("the corner button opens the general stock", await page.evaluate(() => Shell.shopSeller === null));
    await ctx.close();
  }

  if (section("AR", "Scene backdrops, a hidden ground, and doorways between scenes")) {
    // Block 34, against scenes added to the fixture at run time.
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => {
      GUARDS.forEach((g) => { g.disabled = true; });
      SCENES.push({ id: "test-silid", worldWidth: 1176, startX: 300, npcs: [],
        backdrop: { src: "assets/sprites/characters/nanay.png" }, ground: false,
        exits: [{ id: "test-labas", x: 0, width: 80, label: "Lumabas", toScene: "tondo", toX: 700, toFacing: -1 }] });
      const tondo = SCENES.find((sc) => sc.id === "tondo");
      tondo.exits = [{ id: "test-pasok", x: 500, width: 100, label: "Pasok", toScene: "test-silid" }];
    });
    await page.evaluate(() => fadeToScene("tondo"));
    await page.waitForTimeout(2400);

    const near = await page.evaluate(() => new Promise((resolve) => {
      posX = 400; // a 60px gap to the door
      setTimeout(() => resolve({ type: nearby.type, label: document.querySelector("#btn-interact .lbl").textContent }), 200);
    }));
    ok("standing at a doorway reaches it, labelled from content", near.type === "exit" && near.label === "Pasok", near);
    const far = await page.evaluate(() => new Promise((resolve) => {
      posX = 250;
      setTimeout(() => resolve(nearby.type), 200);
    }));
    ok("and out of reach it does not", far !== "exit", far);

    await page.evaluate(() => { posX = 400; });
    await page.waitForTimeout(150);
    await page.keyboard.press("e");
    await page.waitForTimeout(2600);
    const inside = await page.evaluate(() => {
      const sky = document.getElementById("skyline");
      const tiles = sky.querySelectorAll(".skyline-tile");
      return {
        room: currentRoom, posX,
        src: sky.style.getPropertyValue("--skyline-src"),
        tiles: tiles.length, mirrored: sky.querySelectorAll(".skyline-tile-mirrored").length,
        size: tiles[0] && tiles[0].style.backgroundSize,
        tileWidth: tiles[0] && parseFloat(tiles[0].style.width),
        ground: getComputedStyle(document.getElementById("ground-tiles")).display,
      };
    });
    ok("E at the doorway fades to its scene, at that scene's startX", inside.room === "test-silid" && inside.posX === 300, inside);
    ok("a scene's backdrop replaces the shared picture", /nanay\.png/.test(inside.src), inside);
    ok("drawn once, covering, not tiled or mirrored",
       inside.tiles === 1 && inside.mirrored === 0 && inside.size === "cover" && inside.tileWidth >= 1176, inside);
    ok("ground: false hides the dirt strip", inside.ground === "none", inside);

    await page.evaluate(() => { posX = 60; });
    await page.waitForTimeout(150);
    await page.keyboard.press("e");
    await page.waitForTimeout(2600);
    const back = await page.evaluate(() => {
      const sky = document.getElementById("skyline");
      return { room: currentRoom, posX, facing,
               src: sky.style.getPropertyValue("--skyline-src"),
               tiles: sky.querySelectorAll(".skyline-tile").length,
               ground: getComputedStyle(document.getElementById("ground-tiles")).display };
    });
    ok("a doorway with toX and toFacing lands there, not at startX",
       back.room === "tondo" && back.posX === 700 && back.facing === -1, back);
    // Block 105: the shared picture is set, versioned, rather than left
    // to the stylesheet's unversioned url().
    ok("leaving restores the shared backdrop, tiled again",
       /street-01\.jpg\?v=\d+/.test(back.src) && back.tiles > 1, back);
    ok("and the ground", back.ground !== "none", back);
    await ctx.close();
  }

  if (section("AS", "The jump poses, scripted scenes, and combat")) {
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    // ---- The jump sheet, three views of one image, chosen by velocity.
    const sheets = await page.evaluate(() => ({
      rise: SPRITE_SHEETS.jumpRise, fall: SPRITE_SHEETS.jumpFall, land: SPRITE_SHEETS.jumpLand,
    }));
    ok("the jump sheet loads without falling back to a placeholder",
       sheets.rise.failed === false && sheets.rise.columns === 4 && sheets.rise.frames === 9, sheets.rise);
    ok("its three clips cover push-off, falling and landing",
       sheets.rise.startFrame === 3 && sheets.rise.endFrame === 6 &&
       sheets.fall.startFrame === 7 && sheets.land.startFrame === 8, sheets);

    const jumped = await page.evaluate(() => new Promise((resolve) => {
      posX = 300; posY = floorHeightAt(posX); velY = 0; onGround = true;
      handleJumpPress();
      requestAnimationFrame(() => requestAnimationFrame(() => resolve({ anim: currentAnim, frame: currentFrame, velY })));
    }));
    ok("jumping switches to the rising pose at once", jumped.anim === "jumpRise" && jumped.velY > 0, jumped);
    ok("and starts on its own first frame, not frame 0", jumped.frame >= 3, jumped);

    const falling = await page.evaluate(() => new Promise((resolve) => {
      const tick = () => {
        if (velY > 0) return requestAnimationFrame(tick);
        requestAnimationFrame(() => resolve({ anim: currentAnim, velY }));
      };
      tick();
    }));
    ok("coming down switches to the falling pose", falling.anim === "jumpFall" && falling.velY <= 0, falling);

    const landed = await page.evaluate(() => new Promise((resolve) => {
      const tick = () => {
        if (!onGround) return requestAnimationFrame(tick);
        requestAnimationFrame(() => resolve({ anim: currentAnim, onGround }));
      };
      tick();
    }));
    ok("landing holds the landing pose for a moment", landed.anim === "jumpLand", landed);
    await page.waitForTimeout(400);
    ok("then hands the pose back", (await page.evaluate(() => currentAnim)) === "idle");

    // Each frame is grounded by its own feet, so the tucked poses are not
    // drawn floating above the body as well as being moved up by physics.
    const grounded = await page.evaluate(() => {
      const sheet = SPRITE_SHEETS.jumpRise;
      const fit = spriteFit(sheet, DISPLAY_HEIGHT);
      const offsetFor = (frame) => (sheet.frameBottoms[frame] + 1 - sheet.contentHeight) * fit.scale;
      return { standing: offsetFor(3), tucked: offsetFor(5), plain: fit.topOffset };
    });
    ok("frameBottoms shifts a tucked frame differently from a standing one",
       Math.abs(grounded.standing - grounded.tucked) > 20, grounded);

    // ---- A scripted conversation nobody walked up to.
    const script = await page.evaluate(() => {
      window.__scriptDone = false;
      playDialogue([{ speaker: "A", text: "una" }, { speaker: "B", text: "huli" }])
        .then(() => { window.__scriptDone = true; });
      return { open: inDialogue, text: dialogueText.textContent };
    });
    ok("playDialogue opens the dialogue box from a script", script.open && script.text === "una", script);
    await page.keyboard.press("e");
    await page.waitForTimeout(80);
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    ok("and resolves when the last line is closed",
       await page.evaluate(() => window.__scriptDone === true && !inDialogue));

    // ---- A character who walks on.
    const walked = await page.evaluate(async () => {
      const scene = SCENES.find((s) => s.id === "misyon");
      scene.decorations = [{ id: "test-tao", x: 900, hidden: true,
        animation: { src: "assets/Missing_Actor.png", frames: 1, fps: 1 } }];
      loadScene("misyon");
      const el = () => document.getElementById("dec-test-tao");
      const hidden = getComputedStyle(el()).display === "none";
      showDecoration("test-tao", true);
      const shown = getComputedStyle(el()).display !== "none";
      await moveDecoration("test-tao", 700, 600);
      return { hidden, shown, left: bodyX(el()), placeholder: el().textContent.includes("Missing_Actor.png") };
    });
    ok("a decoration can start hidden and be shown by a script", walked.hidden && walked.shown, walked);
    ok("and walks to where the script sends it", walked.left === 700, walked);
    ok("drawing as the placeholder naming its missing file", walked.placeholder, walked);

    // ---- Combat, in the fixture's safe scene, so the hearts and the
    // doorway below mean the fight rather than the outpost's own guards.
    const fight = await page.evaluate(() => {
      window.__fightWon = false;
      loadScene("tondo");
      posX = 300; posY = floorHeightAt(posX); onGround = true; health = maxHealth;
      const heartsBefore = document.getElementById("hud").classList.contains("hidden");
      spawnEnemies([
        { id: "t1", x: 520, hp: 2, img: "assets/Kaaway.png" },
        { id: "t2", x: 620, hp: 2, img: "assets/Kaaway.png" },
      ]).then(() => { window.__fightWon = true; });
      return { count: ENEMIES.length, alive: enemiesAlive(), heartsBefore,
               hearts: !document.getElementById("hud").classList.contains("hidden"),
               speed: ENEMIES[0].speed, playerSpeed: SPEED };
    });
    ok("spawnEnemies puts them in the world", fight.count === 2 && fight.alive, fight);
    ok("a safe scene shows no hearts until they arrive",
       fight.heartsBefore === true && fight.hearts === true, fight);
    ok("and they are slower than Macario, like a guard", fight.speed < fight.playerSpeed, fight);

    // Long enough to cross the 180px between them at their own speed.
    const closed = await page.evaluate(() => new Promise((resolve) => {
      setTimeout(() => resolve({ gap: ENEMIES[0].pos - (posX + PLAYER_WIDTH),
                                 spaced: Math.abs(ENEMIES[0].pos - ENEMIES[1].pos) }), 2500);
    }));
    ok("they close to dash range and dash at him, well before arm's length (Block 92)",
       closed.gap > -300 && closed.gap < 260, closed);
    ok("and are not stacked on one spot (they dash on their own timing)", closed.spaced > 5, closed);

    const swing = await page.evaluate(() => new Promise((resolve) => {
      // From a clean slate: the walk above already cost him hearts, and a
      // fight that runs long enough to lose restarts itself, which would
      // make "health went down" read backwards.
      health = maxHealth;
      invulnUntil = 0;
      ENEMIES.forEach((e) => { e.nextSwingAt = 0; e.cooldownUntil = 0; });
      const before = health;
      window.__sawWindup = false;
      // Block 115: every class change seen, not a 30 ms poll that a busy
      // machine (several suites side by side) can starve past the tell.
      const watch = new MutationObserver(() => {
        if (document.querySelector(".enemy-windup")) window.__sawWindup = true;
      });
      watch.observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
      setTimeout(() => {
        watch.disconnect();
        resolve({ before, after: health, telegraphed: window.__sawWindup });
      }, ATTACK_TELL_MS + 400);
    }));
    ok("an enemy in reach takes a heart", swing.after === swing.before - 1, swing);
    ok("after lighting up first, so the swing is readable", swing.telegraphed, swing);

    const punched = await page.evaluate(() => {
      const e = ENEMIES[0];
      e.pos = posX + PLAYER_WIDTH + 10;
      facing = 1;
      const hpBefore = e.hp;
      meleeAttack();
      return { hpBefore, hp: e.hp, knocked: e.pos > posX + PLAYER_WIDTH + 10, width: e.fillEl.style.width };
    });
    ok("a punch takes a point and knocks him back", punched.hp === punched.hpBefore - 1 && punched.knocked, punched);
    ok("and his bar drains", punched.width === "50%", punched);

    const shot = await page.evaluate(() => {
      const e = ENEMIES[0];
      e.hp = 2;
      e.pos = posX + PLAYER_WIDTH + 200;
      // Clear the line of fire: whichever enemy the ball reaches first is
      // the one it hits, which is correct behaviour and a flaky check.
      ENEMIES.forEach((other) => { if (other !== e) other.pos = posX - 600; });
      destroyProjectile();
      throwProjectile();
      return new Promise((resolve) => setTimeout(() => resolve({ dead: e.dead, down: e.el.classList.contains("enemy-down") }), 900));
    });
    ok("a shot is worth two, so it drops a two-point enemy", shot.dead && shot.down, shot);

    const lost = await page.evaluate(() => {
      const alive = ENEMIES.find((e) => !e.dead);
      alive.hp = 1;
      alive.pos = 1500;
      health = 1;
      invulnUntil = 0;
      damagePlayer("test", false); // the losing hit
      return { health, max: maxHealth, enemyBack: alive.pos === alive.x, hp: alive.hp,
               deadStayDead: ENEMIES.filter((e) => e.dead).length };
    });
    ok("running out of health restarts the fight rather than ending it",
       lost.health === lost.max && lost.enemyBack && lost.hp === 2, lost);
    ok("and the ones already beaten stay beaten", lost.deadStayDead === 1, lost);

    const exitBlocked = await page.evaluate(() => new Promise((resolve) => {
      currentScene.exits = [{ id: "t-exit", x: posX, width: 100, label: "Lumabas", toScene: "misyon" }];
      setTimeout(() => resolve({ during: nearby.type }), 200);
    }));
    ok("no doorway is offered while the fight is on", exitBlocked.during !== "exit", exitBlocked);

    const won = await page.evaluate(() => new Promise((resolve) => {
      ENEMIES.forEach((e) => { if (!e.dead) hitEnemy(e, 99); });
      // Block 60: the fight ends a beat (FIGHT_END_BEAT_MS) after the
      // last one falls, so he is seen to fall first.
      setTimeout(() => resolve({ won: window.__fightWon, hearts: document.getElementById("hud").classList.contains("hidden"),
                                 exitAgain: nearby.type }), FIGHT_END_BEAT_MS + 400);
    }));
    ok("beating the last one resolves what the script is waiting on", won.won === true, won);
    ok("the hearts go away with them", won.hearts, won);
    ok("and the doorway is offered again", won.exitAgain === "exit", won);

    // ---- The attack is a movement: a dash through the enemy.
    const runDash = (gap, live) => page.evaluate(({ gap, live }) => new Promise((resolve) => {
      ENEMIES.forEach((e) => { e.dead = true; });
      loadScene("tondo");
      posX = 300; posY = floorHeightAt(posX); onGround = true; facing = 1;
      health = maxHealth; invulnUntil = 0; dash = null; dashReadyAt = 0; dashStumbleUntil = 0;
      spawnEnemies([{ id: "d" + Math.random(), x: 300 + PLAYER_WIDTH / 2 + gap - ENEMY_WIDTH / 2, hp: 2, img: "assets/Kaaway.png" }]);
      const e = ENEMIES[ENEMIES.length - 1];
      if (!live) e.staggerUntil = performance.now() + 1e9;
      const samples = [];
      const t0 = performance.now();
      const start = posX;
      playMelee();
      const timer = setInterval(() => {
        samples.push({ t: performance.now() - t0, x: posX });
        if (!dash) {
          clearInterval(timer);
          let maxSpeed = 0, maxJump = 0;
          for (let i = 1; i < samples.length; i++) {
            const dx = Math.abs(samples[i].x - samples[i - 1].x);
            maxJump = Math.max(maxJump, dx);
            maxSpeed = Math.max(maxSpeed, dx / Math.max(1, samples[i].t - samples[i - 1].t));
          }
          const result = { pw: PLAYER_WIDTH, start, end: posX, centre: 300 + PLAYER_WIDTH / 2 + gap, hp: e.hp, max: maxHealth,
                    ms: samples[samples.length - 1].t, maxSpeed, maxJump, firstStep: Math.abs(samples[0].x - start),
                    stumble: dashStumbleUntil > performance.now(), ready: dashReadyAt > performance.now(),
                    facingAtEnd: e.facing };
          // A live enemy gets time to decide and strike before we count.
          setTimeout(() => resolve(Object.assign(result, { health, facingLater: e.facing })), live ? 500 : 0);
        }
      }, 8);
    }), { gap, live });

    const near = await runDash(120);
    ok("a tap with an enemy ahead moves him: his position really changes", Math.abs(near.end - near.start) > 100, near);
    ok("the dash carries him through to the far side of the enemy", near.end + near.pw / 2 > near.centre + 60, near);
    ok("and the enemy took the blow on the way", near.hp === 1, near);
    ok("it takes a visible moment, not a snap", near.ms >= 150 && near.ms <= 500, near);
    ok("it is faster than walking (0.3 px/ms) at its peak", near.maxSpeed > 0.45, near);
    ok("but never a teleport: no frame moves him more than 60px", near.maxJump < 60, near);
    ok("and it eases in rather than starting at full speed", near.firstStep < 25, near);
    ok("a landed dash leaves no stumble", !near.stumble, near);

    const far = await runDash(300);
    ok("from too far off the dash stops short of the enemy", far.end + far.pw / 2 < far.centre - 30, far);
    ok("and hits nothing", far.hp === 2, far);
    ok("and leaves him stumbling with a wait before the next", far.stumble && far.ready, far);

    // Live enemies: they decide by themselves, before Macario is anywhere near.
    const idle = await page.evaluate(() => new Promise((resolve) => {
      ENEMIES.forEach((e) => { e.dead = true; });
      loadScene("tondo");
      posX = 300; posY = floorHeightAt(posX); onGround = true; facing = 1;
      health = maxHealth; invulnUntil = 0;
      spawnEnemies([{ id: "i1", x: 300 + 110, hp: 2, img: "assets/Kaaway.png" }]);
      const e = ENEMIES[ENEMIES.length - 1];
      const t0 = performance.now();
      let tellAt = 0;
      const watch = setInterval(() => {
        if (!tellAt && e.nextSwingAt) tellAt = performance.now() - t0;
        if (health < maxHealth || performance.now() - t0 > 1500) {
          clearInterval(watch);
          resolve({ tellAt, struckAt: performance.now() - t0, health, max: maxHealth });
        }
      }, 10);
    }));
    ok("a fast enemy decides before Macario acts, and standing in front of it costs a heart",
       idle.health === idle.max - 1 && idle.tellAt < 150 && idle.struckAt < 700, idle);

    const through = await runDash(100, true);
    ok("sliding through an enemy who has decided to strike leaves the blow in the air",
       through.hp === 1 && through.health === through.max, through);
    ok("and he takes a beat to turn to Macario's new side", through.facingAtEnd === -1 && through.facingLater === 1, through);

    const short = await runDash(250, true);
    ok("a dash begun too far away ends in front of the blow, and it lands",
       short.hp === 2 && short.health === short.max - 1, short);

    const spread = await page.evaluate(() => {
      ENEMIES.forEach((e) => { e.dead = true; });
      spawnEnemies(Array.from({ length: 12 }, (_, i) => ({ id: "r" + i, x: 900 + i, hp: 2, img: "assets/Kaaway.png" })));
      const speeds = ENEMIES.filter((e) => !e.dead).map((e) => e.speed);
      const base = ENEMY_BASE_SPEED * difficultyMultiplier(currentActData && currentActData.number);
      const windups = Array.from({ length: 50 }, () => jitter(ATTACK_TELL_MS, ATTACK_TELL_SPREAD));
      return { min: Math.min(...speeds), max: Math.max(...speeds), base,
               wMin: Math.min(...windups), wMax: Math.max(...windups),
               windup: ATTACK_TELL_MS, spreadMs: ATTACK_TELL_SPREAD, tell: ATTACK_TELL_MS };
    });
    ok("enemies do not all walk at one speed", spread.max > spread.min, spread);
    ok("and the spread stays within a tenth either way", spread.min >= spread.base * 0.89 && spread.max <= spread.base * 1.11, spread);
    ok("swing timing varies but stays bounded", spread.wMax > spread.wMin && spread.wMin >= spread.windup && spread.wMax <= spread.windup + spread.spreadMs, spread);
    ok("the tell is short", spread.tell <= 350, spread);

    // ---- The speaker stands on the dialogue box.
    const portraits = await page.evaluate(async () => {
      ENEMIES.forEach((e) => { e.dead = true; });
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const npc = { id: "px", label: "Testtao", animation: Object.assign({}, BASE_SPRITE_SHEETS.idle) };
      NPCS.push(npc);
      inDialogue = true;
      activeSet = { lines: [{ speaker: "Macario", text: "a" }, { speaker: "Macario (sa isip)", text: "b" },
                            { speaker: npc ? npc.label : "Nobody", text: "c" }, { speaker: "Nobody", text: "d" }] };
      dialogueBox.classList.remove("hidden");
      const seen = [];
      for (let i = 0; i < 4; i++) {
        dialogueStep = i;
        showDialogueStep();
        await wait(200);
        seen.push({ left: portraitLeft.classList.contains("shown"), right: portraitRight.classList.contains("shown") });
      }
      inDialogue = false;
      dialogueBox.classList.add("hidden");
      return { seen, npcLabel: npc && npc.label };
    });
    ok("Macario speaking shows him on the left only", portraits.seen[0].left && !portraits.seen[0].right, portraits);
    ok("and so does his thought", portraits.seen[1].left && !portraits.seen[1].right, portraits);
    ok("an NPC with art shows on the right only", portraits.seen[2].right && !portraits.seen[2].left, portraits);
    ok("a speaker with no art has no portrait", !portraits.seen[3].left && !portraits.seen[3].right, portraits);
    await ctx.close();
  }

  if (section("AT", "The frame does no work it does not have to (Block 36)")) {
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));

    // Standing still, the loop must not write to the DOM at all: every
    // write here costs a style recalculation and a layout on the phone
    // this is built for, sixty times a second, for nothing.
    const idle = await page.evaluate(() => new Promise((resolve) => {
      const counts = { label: 0, playerLeft: 0, playerBottom: 0, camera: 0, layoutReads: 0 };
      const lbl = document.querySelector("#btn-interact .lbl");
      const text = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
      Object.defineProperty(lbl, "textContent", {
        configurable: true, get: text.get,
        set(v) { counts.label++; text.set.call(this, v); },
      });
      const styleOf = (el) => {
        const decl = el.style;
        ["left", "bottom", "transform", "translate"].forEach((prop) => {
          // Block 107: the player moves by translate (placeBody); any of
          // these written while he stands is a needless write.
          const key = el.id === "player" ? (prop === "bottom" ? "playerBottom" : "playerLeft") : "camera";
          const original = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, prop);
          if (!original) return;
          Object.defineProperty(decl, prop, {
            configurable: true,
            get() { return original.get.call(this); },
            set(v) { counts[key]++; original.set.call(this, v); },
          });
        });
      };
      styleOf(document.getElementById("player"));
      styleOf(document.getElementById("world"));
      const cw = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth");
      Object.defineProperty(Element.prototype, "clientWidth", {
        configurable: true,
        get() { counts.layoutReads++; return cw.get.call(this); },
      });

      keysPressed["a"] = false; keysPressed["d"] = false;
      posX = 300; posY = floorHeightAt(posX); velY = 0;
      let frames = 0;
      const tick = () => {
        if (++frames < 90) return requestAnimationFrame(tick);
        Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, get: cw.get });
        resolve({ counts, frames });
      };
      requestAnimationFrame(tick);
    }));
    ok("standing still writes no button label", idle.counts.label === 0, idle.counts);
    ok("and does not move the player element", idle.counts.playerLeft === 0 && idle.counts.playerBottom === 0, idle.counts);
    ok("and does not rewrite the camera", idle.counts.camera === 0, idle.counts);
    ok("and never reads the layout back mid-frame", idle.counts.layoutReads === 0, idle.counts);

    // Block 107. Walking, and a guard on patrol, move their bodies with
    // the translate property, never with left: a left that changes lays
    // out the whole street every frame.
    const moving = await page.evaluate(() => new Promise((resolve) => {
      const g = GUARDS[0];
      g.disabled = false; g.patrolFrom = g.pos - 200; g.patrolTo = g.pos + 200;
      // Sampled each frame: the translate property has no setter on
      // CSSStyleDeclaration.prototype to spy on in every Chromium.
      const seen = { playerLeft: new Set(), guardLeft: new Set(), playerT: new Set(), guardT: new Set() };
      posX = 300; keysPressed["d"] = true;
      let frames = 0;
      const tick = () => {
        seen.playerLeft.add(player.style.left); seen.guardLeft.add(g.el.style.left);
        seen.playerT.add(player.style.translate); seen.guardT.add(g.el.style.translate);
        if (++frames < 40) return requestAnimationFrame(tick);
        keysPressed["d"] = false;
        g.disabled = true;
        resolve({ supported: BODY_TRANSLATE, walked: posX - 300,
          playerLeft: [...seen.playerLeft], guardLeft: [...seen.guardLeft],
          playerMoves: seen.playerT.size, guardMoves: seen.guardT.size });
      };
      requestAnimationFrame(tick);
    }));
    ok("walking and patrolling move bodies by translate, never by left",
       moving.supported && moving.walked > 0 && moving.playerMoves > 1 && moving.guardMoves > 5 &&
       moving.playerLeft.join() === "0px" && moving.guardLeft.join() === "0px", moving);

    // The world element is the scene's width, not a fixed 4400: everything
    // layered on it is painted and held at that width.
    const widths = await page.evaluate(() => {
      loadScene("tondo");
      const tondo = { world: world.style.width, scene: WORLD_WIDTH };
      loadScene("misyon");
      return { tondo, misyon: { world: world.style.width, scene: WORLD_WIDTH },
               tiles: document.getElementById("skyline").querySelectorAll(".skyline-tile").length };
    });
    ok("the world is exactly as wide as the scene",
       widths.tondo.world === widths.tondo.scene + "px" && widths.misyon.world === widths.misyon.scene + "px", widths);
    ok("the backdrop is tiled across that width", widths.tiles > 0, widths);

    // One element per track, kept across a swap, so coming back to Calm
    // does not download it again.
    const music = await page.evaluate(async () => {
      startMusic();
      const first = musicEl;
      setMusic("assets/audio/music/intense.mp3");
      const second = musicEl;
      setMusic(null);
      return { calmKept: musicEl === first, swapped: second !== first,
               tracks: musicEls.size, src: musicEl && musicEl.src };
    });
    ok("swapping the track swaps the element", music.swapped, music);
    ok("and swapping back reuses the one already fetched",
       music.calmKept && music.tracks === 2 && /calm\.mp3/.test(music.src), music);
    await ctx.close();
  }

  if (section("AU", "Hostile guards, sight from a platform, no gun, gated exits, checkpoints (Blocks 37 and 38)")) {
    // Against the fixture guard with fields switched on at run time, and
    // driven with the loop paused, so none of it depends on Act I's
    // content or on frame timing.
    const { ctx, page } = await enterTestRoom();

    const band = await page.evaluate(() => {
      const g = GUARDS[0];
      const sight = g.el.querySelector(".guard-sight");
      setPaused(true);
      g.patrolFrom = g.patrolTo = g.pos;
      g.facing = 1; updateGuards(0);
      const right = g.el.classList.contains("guard-facing-left");
      g.facing = -1; updateGuards(0);
      const left = g.el.classList.contains("guard-facing-left");
      setPaused(false);
      return { exists: Boolean(sight), width: sight && sight.style.width,
               radius: g.detectRadius || 240, right, left };
    });
    ok("every guard draws his sight on the road, detectRadius long",
       band.exists && band.width === band.radius + "px", band);
    ok("and it turns with him", band.right === false && band.left === true, band);

    // A shooter in front of Macario: the full meter turns him hostile
    // (Block 38), and a hostile guard fires, chases and does not calm down.
    const fired = await page.evaluate(() => {
      setPaused(true);
      setEffects({});
      const g = GUARDS[0];
      g.disabled = false; g.shoots = true; g.facing = 1; g.alert = 0; g.nextShotAt = 0;
      g.hostile = false; g.hp = 2;
      g.patrolFrom = g.patrolTo = g.pos;
      posX = g.pos + GUARD_WIDTH + 100; posY = floorHeightAt(posX); onGround = true;
      health = maxHealth; invulnUntil = 0;
      const startX = posX;
      const detections = Game.stats().detections;
      let frames = 0;
      while (!g.hostile && frames < 400) { updateGuards(1); frames++; }
      const turned = { frames, hostile: g.hostile, bulletsAtTurn: GUARD_BULLETS.length,
                       marked: g.el.classList.contains("guard-hostile") };
      g.nextShotAt = 0; // skip the aim delay, which is measured in real time
      updateGuards(1);
      const r = Object.assign(turned, {
        bullets: GUARD_BULLETS.length, dom: document.querySelectorAll(".guard-bullet").length,
        cooling: g.nextShotAt > performance.now(),
        detections: Game.stats().detections - detections, posX, startX, health });
      setPaused(false);
      return r;
    });
    ok("a shooting guard turns hostile when his meter fills, marked with a !",
       fired.hostile && fired.marked && fired.frames > 50 && fired.bulletsAtTurn === 0, fired);
    ok("and then fires, and cools down before the next", fired.bullets === 1 && fired.dom === 1 && fired.cooling, fired);
    ok("being seen counts one detection and does not catch him",
       fired.detections === 1 && fired.posX === fired.startX && fired.health === 3, fired);

    const hit = await page.evaluate(() => {
      setPaused(true);
      const x0 = posX;
      let frames = 0;
      while (GUARD_BULLETS.length && frames < 200) { updateGuardBullets(1); frames++; }
      const r = { health, max: maxHealth, moved: posX - x0, room: currentRoom,
                  dom: document.querySelectorAll(".guard-bullet").length };
      setPaused(false);
      return r;
    });
    ok("the bullet costs one heart and knocks him on, not back to the start",
       hit.health === hit.max - 1 && hit.moved === 50 && hit.dom === 0, hit);

    const jumped = await page.evaluate(() => {
      setPaused(true);
      const g = GUARDS[0];
      g.hostile = true; g.nextShotAt = 0; invulnUntil = 0;
      const before = health;
      updateGuards(0);
      posY = floorHeightAt(posX) + 110; onGround = false; // in the air over it
      let frames = 0;
      while (GUARD_BULLETS.length && frames < 200) { updateGuardBullets(1); frames++; }
      const r = { before, after: health };
      posY = floorHeightAt(posX); onGround = true;
      setPaused(false);
      return r;
    });
    ok("a bullet can be jumped", jumped.after === jumped.before, jumped);

    const chase = await page.evaluate(async () => {
      setPaused(true);
      const g = GUARDS[0];
      g.nextShotAt = performance.now() + 60000; // no shots during the chase
      posX = g.pos + GUARD_WIDTH + 600; posY = floorHeightAt(posX); onGround = true;
      const from = g.pos;
      for (let i = 0; i < 60; i++) updateGuards(1);
      const closed = g.pos - from;
      // Out of his sight entirely, behind him and far: he stays hostile.
      posX = Math.max(0, g.pos - 900);
      updateGuards(1);
      await new Promise((r) => setTimeout(r, ATTACK_TURN_MS + 60)); // he takes a beat to turn (Block 88)
      for (let i = 0; i < 300; i++) updateGuards(1);
      const r = { closed, hostile: g.hostile, facing: g.facing, alert: g.alert,
                  speedPerFrame: closed / 60 };
      setPaused(false);
      return r;
    });
    ok("a hostile guard runs at Macario, slower than Macario can run",
       chase.closed > 100 && chase.speedPerFrame < 5, chase);
    ok("and does not go back to looking when Macario gets away",
       chase.hostile && chase.facing === -1 && chase.alert === 1, chase);

    const punches = await page.evaluate(() => {
      setPaused(true);
      const g = GUARDS[0];
      health = maxHealth; invulnUntil = 0;
      posX = g.pos - 60; facing = 1; posY = floorHeightAt(posX);
      meleeAttack();
      const after1 = { disabled: g.disabled, hp: g.hp, health };
      posX = g.pos - 60;
      meleeAttack();
      const after2 = { disabled: g.disabled, sight: getComputedStyle(g.el.querySelector(".guard-sight")).display };
      setPaused(false);
      return { after1, after2 };
    });
    ok("punching a hostile guard hurts him instead of Macario",
       !punches.after1.disabled && punches.after1.hp === 1 && punches.after1.health === 3, punches);
    ok("and a second punch puts him down", punches.after2.disabled && punches.after2.sight === "none", punches);

    const reset = await page.evaluate(() => {
      const g = GUARDS[0];
      g.disabled = false; g.drawnDown = false; g.el.classList.remove("guard-down");
      g.hostile = true;
      respawnInScene();
      updateGuards(0);
      return { hostile: g.hostile, hp: g.hp, marked: g.el.classList.contains("guard-hostile") };
    });
    ok("running out of hearts sends every guard back to his post, calm",
       !reset.hostile && reset.hp === 2 && !reset.marked, reset);

    const sight = await page.evaluate(() => {
      setPaused(true);
      const g = GUARDS[0];
      g.shoots = false; g.hostile = false; g.nextShotAt = 0; g.facing = 1;
      g.disabled = false;
      posX = g.pos + GUARD_WIDTH + 100;
      const floor = floorHeightAt(posX);
      const fillAt = (height, grounded) => {
        g.alert = 0; posY = floor + height; onGround = grounded; playerStill = true;
        for (let i = 0; i < 20; i++) updateGuards(1);
        const a = g.alert; g.alert = 0; return a;
      };
      const r = { floor: fillAt(0, true), onPlatform: fillAt(75, true),
                  low: fillAt(40, true), midJump: fillAt(75, false) };
      posY = floor; onGround = true;
      setPaused(false);
      return r;
    });
    ok("standing on a platform 60 or more above the floor is out of sight",
       sight.floor > 0 && sight.onPlatform === 0, sight);
    ok("a low step is not, and neither is the middle of a jump",
       sight.low > 0 && sight.midJump > 0, sight);

    const tint = await page.evaluate(() => {
      setPaused(true);
      const g = GUARDS[0];
      g.alert = 0; posY = floorHeightAt(posX); onGround = true;
      setEffects({ stillDetectionMult: 0.2 });
      playerStill = true; updateGuards(1);
      const still = g.el.classList.contains("guard-disguised");
      playerStill = false; updateGuards(1);
      const moving = g.el.classList.contains("guard-disguised");
      setEffects({});
      playerStill = true; updateGuards(1);
      const without = g.el.classList.contains("guard-disguised");
      g.alert = 0;
      setPaused(false);
      return { still, moving, without };
    });
    ok("the meter turns blue while the clothes are what is slowing it, and only then",
       tint.still && !tint.moving && !tint.without, tint);

    const gun = await page.evaluate(() => {
      destroyProjectile();
      currentScene.noRanged = true;
      attackHoldStart = performance.now() - 600;
      endAttackHold();
      const blocked = { projectile: Boolean(projectile), shooting };
      currentScene.noRanged = false;
      attackHoldStart = performance.now() - 600;
      endAttackHold();
      const allowed = Boolean(projectile);
      destroyProjectile();
      return { blocked, allowed };
    });
    ok("a scene with noRanged turns a long hold into a punch, with no shot",
       !gun.blocked.projectile && gun.blocked.shooting === "melee", gun);
    ok("and a scene without it still throws", gun.allowed, gun);

    const gated = await page.evaluate(() => {
      GUARDS.forEach((g) => { g.disabled = true; });
      currentScene.exits = (currentScene.exits || []).concat([
        { id: "test-gate", x: 900, width: 80, label: "Tumuloy", toScene: "tondo", requiresFlag: "test_bukas" }]);
      posX = 900 - 40 - 20;
      const closed = findNearby().type;
      state.flags.test_bukas = true;
      const open = findNearby();
      return { closed, open: open.type, id: open.ref && open.ref.id };
    });
    ok("an exit with requiresFlag stays shut until the flag is set",
       gated.closed !== "exit" && gated.open === "exit" && gated.id === "test-gate", gated);

    const respawn = await page.evaluate(() => {
      currentScene.checkpoints = [{ x: 900, flag: "test_cp" }, { x: 1400, flag: "test_cp_later" }];
      respawnInScene();
      const before = posX;
      state.flags.test_cp = true;
      respawnInScene();
      const after = posX;
      return { start: currentScene.startX, before, after };
    });
    ok("a respawn uses the furthest checkpoint whose flag is set",
       respawn.before === respawn.start && respawn.after === 900, respawn);

    const quest = await page.evaluate(() => {
      addQuest("test_bilang", "Bilang (0/3)");
      setQuestText("test_bilang", "Bilang (1/3)");
      setQuestText("wala_ito", "x");
      return { text: quests.find((q) => q.id === "test_bilang").text,
               stray: quests.some((q) => q.id === "wala_ito"),
               shown: [...document.querySelectorAll("#quest-list li")].some((li) => li.textContent === "Bilang (1/3)") };
    });
    ok("setQuestText rewrites a logged quest and adds nothing",
       quest.text === "Bilang (1/3)" && !quest.stray && quest.shown, quest);
    await ctx.close();
  }

  if (section("AV", "The teacher dashboard")) {
    // teacher.html had no coverage before its restyle. Seeded with one
    // class of four students at different points, against the stub, which
    // understands .in() for the dashboard's scoped queries.
    const seed = {
      session: { user: { id: "t1" } },
      profiles: [
        { id: "t1", role: "teacher", full_name: "Gng. Cruz" },
        { id: "s1", role: "student", full_name: "mag-aaral01", class_id: "c1" },
        { id: "s2", role: "student", full_name: "mag-aaral02", class_id: "c1" },
        { id: "s3", role: "student", full_name: "mag-aaral03", class_id: "c1" },
        { id: "s4", role: "student", full_name: "mag-aaral04", class_id: "c1" },
        { id: "x9", role: "student", full_name: "ibang-klase", class_id: "c2" },
      ],
      classes: [{ id: "c1", class_name: "MAC8-RIZAL", join_code: "R1", teacher_id: "t1" }],
      game_progress: [
        { student_id: "s1", current_act: 2, updated_at: "2026-09-18T08:00:00Z" },
        { student_id: "s2", current_act: 1, updated_at: "2026-09-18T09:00:00Z" },
        { student_id: "s3", current_act: 1, updated_at: "2026-09-18T07:00:00Z" },
      ],
      act_progress: [
        { student_id: "s1", act_number: 1, status: "completed", performance_score: 82.5,
          objectives_done: 7, objectives_total: 7, elapsed_ms: 38 * 60000 },
        { student_id: "s2", act_number: 1, status: "playing", performance_score: null,
          objectives_done: 3, objectives_total: 7, elapsed_ms: 12 * 60000 },
        { student_id: "s3", act_number: 1, status: "completed", performance_score: 64,
          objectives_done: 7, objectives_total: 7, elapsed_ms: 75 * 60000 },
        // Scan S1: going on to a stub act makes a row worth 0, which must
        // not pull the student's performance down.
        { student_id: "s1", act_number: 2, status: "playing", performance_score: 0,
          objectives_done: 0, objectives_total: 0, elapsed_ms: 0 },
      ],
      assessment_scores: [
        { student_id: "s1", act_number: 1, test_type: "pre", score: 4, max_score: 10 },
        { student_id: "s1", act_number: 1, test_type: "post", score: 9, max_score: 10 },
        { student_id: "s2", act_number: 1, test_type: "pre", score: 6, max_score: 10 },
        { student_id: "s3", act_number: 1, test_type: "pre", score: 5, max_score: 10 },
        { student_id: "s3", act_number: 1, test_type: "post", score: 7, max_score: 10, attempt: 1 },
        // Scan S13: a retake. The gain is the first post-test's.
        { student_id: "s3", act_number: 1, test_type: "post", score: 10, max_score: 10, attempt: 2 },
      ],
    };
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });
    await page.route("**/supabaseClient.js*", (route) =>
      route.fulfill({ body: STUB, contentType: "text/javascript" }));
    await page.route("**/js/vendor/supabase.js*", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));
    await page.addInitScript((st) => { window.__TEST = st; }, seed);
    await page.goto("http://localhost:" + PORT + "/teacher.html");
    await page.waitForTimeout(500);

    const first = await page.evaluate(() => ({
      gate: document.getElementById("gate").classList.contains("hidden"),
      cls: document.getElementById("class-name").textContent,
      teacher: document.getElementById("dash-teacher-name").textContent,
      rows: [...document.querySelectorAll("#roster-body tr")].map((tr) =>
        [...tr.children].map((td) => td.textContent)),
      students: document.getElementById("stat-students").textContent,
      started: document.getElementById("stat-started").textContent,
      done: document.getElementById("stat-done").textContent,
      pre: document.getElementById("stat-pre").textContent,
      post: document.getElementById("stat-post").textContent,
      gain: document.getElementById("stat-gain").textContent,
      gainSub: document.getElementById("stat-gain-sub").textContent,
    }));
    ok("a teacher gets past the gate to the class",
       first.gate && first.cls === "MAC8-RIZAL" && first.teacher === "Gng. Cruz", first);
    ok("the roster lists only that class's students, by name",
       first.rows.length === 4 && first.rows[0][0] === "mag-aaral01" &&
       !first.rows.some((r) => r[0] === "ibang-klase"), first.rows);
    ok("the summary counts the class: 4 students, 3 started, 2 finished Act I",
       first.students === "4" && first.started === "3" && first.done === "2", first);
    ok("and averages only who has sat each test, with the n shown",
       first.pre === "50%" && first.post === "95%" && first.gain === "+35%" &&
       /n = 2, pre to first post-test/.test(first.gainSub), first);
    ok("a retake: the post-test shows the latest, the gain the first, the latest under it (S13)",
       first.rows[2][5].startsWith("100%") && /2 attempts/.test(first.rows[2][5]) &&
       first.rows[2][6] === "+20%latest +50%", first.rows[2]);
    ok("performance counts completed acts only, not a stub act's 0 (S1)",
       first.rows[0][7] === "82.5", first.rows[0]);
    ok("each row shows status, objectives, scores, gain and play time",
       first.rows[0][1] === "Completed" && first.rows[0][3] === "7/7" &&
       first.rows[0][4].startsWith("40%") && first.rows[0][5].startsWith("90%") &&
       first.rows[0][6] === "+50%" && first.rows[0][7] === "82.5" && first.rows[0][8] === "38m" &&
       first.rows[2][8] === "1h 15m", first.rows);
    ok("a student who never played reads as not started, with dashes",
       first.rows[3][1] === "Not started" && first.rows[3][4] === "—", first.rows[3]);

    await page.fill("#roster-search", "03");
    await page.waitForTimeout(100);
    const searched = await page.evaluate(() => ({
      rows: [...document.querySelectorAll("#roster-body tr")].map((tr) => tr.children[0].textContent),
      count: document.getElementById("roster-count").textContent,
    }));
    ok("searching narrows the roster and says how many matched",
       searched.rows.length === 1 && searched.rows[0] === "mag-aaral03" && /1 of 4/.test(searched.count), searched);
    await page.fill("#roster-search", "");

    await page.click('#roster th[data-sort="gain"] button');
    await page.waitForTimeout(100);
    const sorted = await page.evaluate(() => ({
      order: [...document.querySelectorAll("#roster-body tr")].map((tr) => tr.children[0].textContent),
      aria: document.querySelector('#roster th[data-sort="gain"]').getAttribute("aria-sort"),
    }));
    ok("sorting by gain puts the highest first and the missing last",
       sorted.aria === "descending" && sorted.order[0] === "mag-aaral01" &&
       sorted.order[1] === "mag-aaral03", sorted);

    const [download] = await Promise.all([page.waitForEvent("download"), page.click("#export-btn")]);
    const csv = require("fs").readFileSync(await download.path(), "utf8").replace(/^\ufeff/, "").split(/\r\n/);
    ok("Download CSV saves the roster, a header and a line per student (S15)",
       /\.csv$/.test(download.suggestedFilename()) && csv.length === 5 && /^student,act,status/.test(csv[0]) &&
       csv.some((l) => /^mag-aaral03,1,completed,.*,20\.0,50\.0,64\.0,/.test(l)), csv);
    const cells = await page.evaluate(() => ["=1+1", "+63", "-x", "@a", "-12.5", "12", "Ana"].map(csvField));
    ok("a cell a spreadsheet would run as a formula is written as text; numbers stay numbers (Block 121)",
       JSON.stringify(cells) === JSON.stringify(["'=1+1", "'+63", "'-x", "'@a", "-12.5", "12", "Ana"]), cells);

    // Polish list #1. The roster describes one act, chosen above it. It
    // opens on the furthest act with objectives (Act I here: s1's Act II
    // row is a stub's, with none), and Act II can be chosen.
    const acts = await page.evaluate(async () => {
      const read = () => {
        const s1 = [...document.querySelectorAll("#roster-body tr")].find((tr) => tr.children[0].textContent === "mag-aaral01");
        return { act: document.getElementById("act-picker").value,
          names: [...document.querySelectorAll(".act-name")].map((e) => e.textContent),
          s1: s1 ? [...s1.children].map((td) => td.textContent) : null };
      };
      const opened = read();
      const picker = document.getElementById("act-picker");
      picker.value = "2";
      picker.dispatchEvent(new Event("change"));
      await new Promise((r) => setTimeout(r, 50));
      const two = read();
      picker.value = "1";
      picker.dispatchEvent(new Event("change"));
      return { opened, two };
    });
    ok("the roster opens on the furthest act with objectives, and says which (Polish #1)",
       acts.opened.act === "1" && acts.opened.names.length === 2 &&
       acts.opened.names.every((n) => n === "Act I"), acts.opened);
    ok("choosing Act II shows Act II's status and no Act I scores",
       acts.two.names.every((n) => n === "Act II") && acts.two.s1[1] === "Playing" &&
       acts.two.s1[4] === "—" && acts.two.s1[7] === "—", acts.two);

    await page.click("#refresh-btn");
    await page.waitForTimeout(300);
    ok("refresh reloads the roster in place",
       await page.evaluate(() => document.querySelectorAll("#roster-body tr").length === 4 &&
         /Updated/.test(document.getElementById("updated-at").textContent)));
    await ctx.close();

    // A student who opens the page is sent back to the game.
    const sctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const spage = await sctx.newPage();
    await spage.route("**/supabaseClient.js*", (route) =>
      route.fulfill({ body: STUB, contentType: "text/javascript" }));
    await spage.route("**/js/vendor/supabase.js*", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));
    await spage.addInitScript((st) => { window.__TEST = st; },
      Object.assign({}, seed, { session: { user: { id: "s1" } } }));
    await spage.goto("http://localhost:" + PORT + "/teacher.html");
    await spage.waitForTimeout(300);
    ok("a student account is refused at the gate",
       await spage.evaluate(() => document.getElementById("gate-msg").textContent === "This is not a teacher account." &&
         document.getElementById("dash").classList.contains("hidden")));
    await sctx.close();
  }

  if (section("AW", "No guide, and the vision cone (Blocks 42, 69)")) {
    // Block 69. The guide is gone at the proponent's direction: students
    // find their own way. Nothing of it is left on the page or in the
    // engine.
    const { ctx, page } = await enterTestRoom();
    const gone = await page.evaluate(() => ({
      marker: document.getElementById("guide-marker"),
      edge: document.getElementById("guide-edge"),
      engine: typeof window.updateGuide + typeof window.guideTarget,
    }));
    ok("there is no guide: no arrow, no edge tab, nothing in the engine",
       gone.marker === null && gone.edge === null && gone.engine === "undefinedundefined", gone);

    // The cone. Measured on screen and converted back to world pixels, so
    // it checks what is drawn rather than a style value.
    const cone = await page.evaluate(() => {
      const g = GUARDS[0];
      setPaused(true);
      g.patrolFrom = g.patrolTo = g.pos;
      const measure = (dir) => {
        g.facing = dir; updateGuards(0);
        const el = g.el.querySelector(".guard-sight");
        const r = el.getBoundingClientRect();
        const body = g.el.getBoundingClientRect();
        const scale = el.offsetHeight / r.height;
        const centre = body.left + body.width / 2;
        const top = (body.bottom - r.top) * scale;
        // Where the cone's point sits and whether it opens evenly: the
        // polygon's y values, in percent of the element's height.
        const m = getComputedStyle(el).clipPath.match(/polygon\(([^)]+)\)/);
        const ys = m ? m[1].split(",").map((p) => parseFloat(p.trim().split(/\s+/)[1]) || 0) : [];
        const eye = top - ((ys[0] + ys[3]) / 200) * el.offsetHeight;
        return { top, eye, ys, near: dir > 0 ? r.left : r.right,
                 far: dir > 0 ? r.right : r.left, centre, reach: r.width * scale,
                 clip: getComputedStyle(el).clipPath };
      };
      const right = measure(1);
      const leftC = measure(-1);
      setPaused(false);
      return { right, left: leftC, radius: g.detectRadius || 240, clearance: GUARD_SIGHT_CLEARANCE };
    });
    ok("a guard's sight is a cone, clipped to a wedge", /^polygon/.test(cone.right.clip), cone.right.clip);
    ok("its point is at eye height, about 118 above the road (Block 46)",
       cone.right.eye > 110 && cone.right.eye < 126 && Math.abs(cone.left.eye - cone.right.eye) < 1, cone);
    ok("and it looks straight ahead, opening evenly above and below his eye line (Block 47)",
       cone.right.ys.length === 4 && Math.abs((cone.right.ys[0] + cone.right.ys[3]) / 2 - 50) < 0.5 &&
       Math.abs((cone.right.ys[1] + cone.right.ys[2]) / 2 - 50) < 0.5, cone.right.ys);
    ok("it starts at the middle of his body and runs detectRadius, facing right",
       Math.abs(cone.right.near - cone.right.centre) < 2 && Math.abs(cone.right.reach - cone.radius) < 2, cone.right);
    ok("and mirrors about his middle facing left",
       Math.abs(cone.left.near - cone.left.centre) < 2 && cone.left.far < cone.left.centre &&
       Math.abs(cone.left.reach - cone.radius) < 2, cone.left);
    await ctx.close();
  }

  if (section("AX", "Painted panels and shadow trees (Block 43)")) {
    // The fixture scene given panels at run time, from two pictures that
    // exist, so the engine is tested apart from whatever Act I ships.
    const { ctx, page } = await enterTestRoom();
    const built = await page.evaluate(() => {
      const scene = SCENES.find((sc) => sc.id === "misyon");
      scene.panels = ["assets/backgrounds/act1/street-01.jpg", "assets/backgrounds/act1/street-02.jpg"];
      loadScene("misyon");
      const tiles = [...document.querySelectorAll("#skyline .skyline-panel")];
      const trees = [...document.querySelectorAll(".shadow-tree")];
      return {
        world: WORLD_WIDTH,
        tiles: tiles.map((t) => ({ left: t.style.left, src: t.style.backgroundImage })),
        trees: trees.map((t) => parseFloat(t.style.left) + SHADOW_TREE_WIDTH / 2),
        shades: document.querySelectorAll("#skyline .panel-join-shade").length,
        tondoTiles: document.querySelectorAll("#skyline .skyline-tile:not(.skyline-panel)").length,
        treeZ: trees.length && +getComputedStyle(trees[0]).zIndex,
        playerZ: +getComputedStyle(document.getElementById("player")).zIndex,
        treeBg: trees.length && getComputedStyle(trees[0]).backgroundImage.slice(0, 30),
        models: SHADOW_TREE_URLS.length,
        distinct: new Set(SHADOW_TREE_URLS).size,
        pictures: trees.map((t) => SHADOW_TREE_URLS.indexOf(t.style.backgroundImage)),
      };
    });
    ok("panels are laid a fixed width apart and repeat in order past the end of the list",
       built.tiles.length === 3 && built.tiles[1].left === "1450px" &&
       /street-01\.jpg/.test(built.tiles[0].src) && /street-02\.jpg/.test(built.tiles[1].src) &&
       /street-01\.jpg/.test(built.tiles[2].src), built);
    ok("a tree and its shade stand at every join, and none at the end of the world",
       JSON.stringify(built.trees) === "[1450,2900]" && built.shades === 2 && built.world === 2940, built);
    ok("no Tondo.png tile is laid under a panelled scene", built.tondoTiles === 0, built);
    ok("the tree is drawn from its inline picture, in front of Macario",
       /^url\("data:image\/svg\+xml/.test(built.treeBg) && built.treeZ > built.playerZ, built);
    ok("there are four models and neighbouring joins get different ones (Block 50)",
       built.models === 4 && built.distinct === 4 &&
       JSON.stringify(built.pictures) === "[0,1]", built);

    // Macario standing on a join is covered by the trunk: the pixel on
    // his chest, which is his light camisa when nothing is in front of
    // him (his trousers are nearly as dark as the tree, so they would
    // pass either way), is the tree's colour.
    const standAt = (join, which) => page.evaluate(async (a) => {
      posX = a.join - PLAYER_WIDTH / 2; posY = floorHeightAt(posX); velY = 0; facing = 1;
      await new Promise((r) => setTimeout(r, 250));
      const r = document.getElementById("player").getBoundingClientRect();
      const t = document.querySelectorAll(".shadow-tree")[a.which].getBoundingClientRect();
      return {
        x: Math.round(r.left + r.width / 2), y: Math.round(r.bottom - r.height * 0.62),
        // The whole tree's box at that height, and how many screen pixels
        // a world pixel is, so the trunk can be measured in world px.
        strip: { x: Math.round(t.left), width: Math.round(t.width) },
        scale: t.width / SHADOW_TREE_WIDTH, box: SHADOW_TREE_WIDTH,
      };
    }, { join, which });
    const pixels = await standAt(1450, 0);
    const readPixels = async (clip) => {
      const shot = await page.screenshot({ clip });
      const { PNG } = (() => { try { return require("pngjs"); } catch (e) { return {}; } })();
      if (PNG) { const png = PNG.sync.read(shot); return [...png.data]; }
      // No PNG decoder installed: read the pixels in the page instead.
      return await page.evaluate(async (a) => {
        const img = new Image(); img.src = "data:image/png;base64," + a.b64;
        await img.decode();
        const c = document.createElement("canvas"); c.width = a.w; c.height = a.h;
        const g = c.getContext("2d"); g.drawImage(img, 0, 0);
        return [...g.getImageData(0, 0, a.w, a.h).data];
      }, { b64: shot.toString("base64"), w: clip.width, h: clip.height });
    };
    const rgb = (await readPixels({ x: pixels.x, y: pixels.y, width: 1, height: 1 })).slice(0, 3);
    ok("standing at a join, Macario is behind the trunk", rgb.every((v) => v < 40), { at: pixels, rgb });

    // Block 50: the trunk is what hides the join, so it is measured, in
    // world pixels, at the height of a person's chest, for each model in
    // turn. The tree is one flat near-black green (the green channel
    // highest and every channel low), which nothing in the painting
    // behind it is: with the tree hidden the same row measures about one
    // pixel rather than 124.
    const trunkAt = async (p) => {
      const row = await readPixels({ x: p.strip.x, y: p.y, width: p.strip.width, height: 1 });
      let cols = 0;
      for (let i = 0; i < row.length; i += 4) {
        if (row[i] < 34 && row[i + 2] < 42 && row[i + 1] > row[i] && row[i + 1] < 62) cols++;
      }
      return cols / p.scale;
    };
    // Each model in turn on the same tree, rather than walking to the
    // second join, whose tree runs past the end of this short world and
    // so is partly off screen.
    const trunks = [];
    for (let i = 0; i < built.models; i++) {
      await page.evaluate((n) => {
        document.querySelector(".shadow-tree").style.backgroundImage = SHADOW_TREE_URLS[n];
      }, i);
      await page.waitForTimeout(120);
      trunks.push(await trunkAt(pixels));
    }
    ok("and every model's trunk is thick: about 130 world px of it, centred on the join",
       trunks.length === 4 && trunks.every((t) => t > 100 && t < pixels.box * 0.5),
       { trunks, box: pixels.box });

    const gone = await page.evaluate(() => {
      const scene = SCENES.find((sc) => sc.id === "misyon");
      delete scene.panels;
      loadScene("misyon");
      return { trees: document.querySelectorAll(".shadow-tree").length,
               panels: document.querySelectorAll(".skyline-panel").length,
               tondoTiles: document.querySelectorAll("#skyline .skyline-tile").length };
    });
    const flipped = await page.evaluate(() => {
      const scene = SCENES.find((sc) => sc.id === "misyon");
      scene.panels = ["assets/backgrounds/act1/street-01.jpg"];
      scene.mirrorPanels = true;
      loadScene("misyon");
      const tiles = [...document.querySelectorAll("#skyline .skyline-panel")];
      const out = tiles.map((t) => t.classList.contains("skyline-tile-mirrored"));
      delete scene.mirrorPanels;
      return { out, transform: tiles[1] && getComputedStyle(tiles[1]).transform };
    });
    ok("mirrorPanels flips every second panel and only those (Block 45)",
       JSON.stringify(flipped.out) === "[false,true,false]" && /matrix\(-1/.test(flipped.transform), flipped);

    ok("a scene without panels gets Tondo.png's tiles back and no trees",
       gone.trees === 0 && gone.panels === 0 && gone.tondoTiles > 0, gone);
    await ctx.close();
  }

  if (section("AY", "The quest log: the task in hand; done ones in settings (Blocks 48, 57)")) {
    const { ctx, page } = await enterTestRoom();

    // Old behaviour, for an act without linearObjectives: open quests on
    // the log. Since Block 57 the done ones are not under it at all; they
    // are listed in the settings panel.
    const plain = await page.evaluate(() => {
      clearQuests();
      addQuest("t_a", "Una");
      addQuest("t_b", "Ikalawa");
      completeQuest("t_a");
      const cur = [...document.querySelectorAll("#quest-list li")].map((li) => li.textContent);
      return { cur, toggle: !!document.getElementById("quest-done-toggle"),
               list: !!document.getElementById("quest-done-list"), done: Game.doneQuests() };
    });
    ok("done quests leave the log, and nothing under it lists them",
       JSON.stringify(plain.cur) === '["Ikalawa"]' && !plain.toggle && !plain.list, plain);
    ok("Game.doneQuests gives the finished lines", JSON.stringify(plain.done) === '["Una"]', plain.done);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(120);
    const inSettings = await page.evaluate(() =>
      [...document.querySelectorAll("#shell-done-quests li")].map((li) => li.textContent));
    ok("the settings panel lists them (Block 57)", JSON.stringify(inSettings) === '["Una"]', inSettings);
    await page.click("#shell-settings-back");
    await page.waitForTimeout(80);
    await page.click("#shell-resume");
    await page.waitForTimeout(120);
    const none = await page.evaluate(() => { clearQuests(); return true; });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(120);
    const empty = await page.evaluate(() =>
      [...document.querySelectorAll("#shell-done-quests li")].map((li) => li.textContent));
    ok("and says Wala pa when nothing is done", none && JSON.stringify(empty) === '["Wala pa."]', empty);
    await page.click("#shell-settings-back");
    await page.waitForTimeout(80);
    await page.click("#shell-resume");
    await page.waitForTimeout(120);

    // A linear chain: the first unset step is the task, a later flag
    // backfills the earlier ones, and a counted step shows its count.
    const chain = await page.evaluate(() => {
      const act = currentActData;
      const saved = { objectives: act.objectives, linear: act.linearObjectives, flags: Object.assign({}, state.flags) };
      act.linearObjectives = true;
      act.objectives = [
        { id: "c1", label: "Isa", flag: "t_c1" },
        { id: "c2", label: "Dalawa", flag: "t_c2" },
        { id: "c3", label: "Tatlo", flag: "t_c3", countFlags: ["t_k1", "t_k2"] },
      ];
      const read = () => ({
        cur: [...document.querySelectorAll("#quest-list li")].map((li) => li.textContent),
        done: Game.doneQuests().length,
        ids: quests.map((q) => q.id + (q.done ? "+" : "")),
      });
      renderQuests();
      const a = read();
      state.flags.t_c2 = true; markDirty();
      const b = Object.assign(read(), { backfilled: state.flags.t_c1 === true });
      state.flags.t_k1 = true; markDirty();
      const c = read();
      state.flags.t_c3 = true; markDirty();
      const d = read();
      act.objectives = saved.objectives; act.linearObjectives = saved.linear;
      Object.keys(state.flags).forEach((k) => { if (!(k in saved.flags)) delete state.flags[k]; });
      clearQuests();
      return { a, b, c, d };
    });
    ok("the task is the first step whose flag is not set",
       JSON.stringify(chain.a.cur) === '["Isa"]' && JSON.stringify(chain.a.ids) === '["c1"]', chain.a);
    ok("a later step's flag marks the earlier ones done and moves the task on",
       chain.b.backfilled && JSON.stringify(chain.b.cur) === '["Tatlo (0/2)"]' && chain.b.done === 2, chain.b);
    ok("a counted step shows its count from the flags", JSON.stringify(chain.c.cur) === '["Tatlo (1/2)"]', chain.c);
    ok("with every step done, the top says so and all three are done",
       JSON.stringify(chain.d.cur) === '["Wala nang gawain."]' && chain.d.done === 3, chain.d);

    // A dialogue set may wait on a flag: picked from the flags each time.
    const sets = await page.evaluate(() => {
      const npc = { id: "t_npc", x: 400, label: "T", stage: 0, dialogueSets: [
        { skipIfFlag: "t_seen", lines: [{ speaker: "T", text: "bago" }], onComplete: () => {} },
        { requiresFlag: "t_seen", skipIfFlag: "t_paid", lines: [{ speaker: "T", text: "habang" }], onComplete: () => {} },
        { lines: [{ speaker: "T", text: "pagkatapos" }], onComplete: () => {} },
      ] };
      const pick = () => { startDialogue(npc); const t = dialogueText.textContent; endDialogue(); return t; };
      const out = [pick(), pick()];
      state.flags.t_seen = true; out.push(pick());
      state.flags.t_paid = true; out.push(pick());
      delete state.flags.t_seen; delete state.flags.t_paid;
      return out;
    });
    ok("a set that waits on a flag is skipped until it is set, however often he is asked",
       JSON.stringify(sets) === '["bago","bago","habang","pagkatapos"]', sets);
    await ctx.close();
  }

  if (section("AZ", "Scene scripts, a step that counts barya, and an act without the drip (Block 52)")) {
    const { ctx, page } = await enterTestRoom();

    // A scene script plays once: placed first, its doneFlag set only when
    // it ends, never twice at once, and not again once done.
    const script = await page.evaluate(async () => {
      const scene = currentScene;
      const saved = scene.scripts;
      let runs = 0, flagDuring = null, release;
      scene.scripts = [
        { requiresFlag: "t_ready", doneFlag: "t_watched", x: 333, facing: -1,
          run: () => { runs++; flagDuring = Boolean(state.flags.t_watched);
                       return new Promise((r) => { release = r; }); } },
      ];
      const before = pendingSceneScript(scene);
      state.flags.t_ready = true;
      runSceneScript();
      const placed = { x: posX, facing };
      runSceneScript(); // a second call while the first is still running
      release();
      await new Promise((r) => setTimeout(r, 20));
      const done = Boolean(state.flags.t_watched);
      runSceneScript();
      await new Promise((r) => setTimeout(r, 20));
      scene.scripts = saved;
      delete state.flags.t_ready; delete state.flags.t_watched;
      return { before: before === null, placed, runs, flagDuring, done };
    });
    ok("a script waits for its requiresFlag", script.before, script);
    ok("it places Macario before it starts", script.placed.x === 333 && script.placed.facing === -1, script.placed);
    ok("its doneFlag is set when it ends, not when it starts", script.flagDuring === false && script.done, script);
    ok("and it plays once, however often it is asked", script.runs === 1, script);

    // countCurrency, and the Bagong gawain toast when the step moves.
    const money = await page.evaluate(() => {
      const act = currentActData;
      const saved = { objectives: act.objectives, linear: act.linearObjectives, c: Game.currency() };
      act.linearObjectives = true;
      act.objectives = [
        { id: "m1", label: "Isa", flag: "t_m1" },
        { id: "m2", label: "Mag-ipon", flag: "t_m2", countCurrency: 50 },
      ];
      Game.spendCurrency(Game.currency());
      renderQuests();
      state.flags.t_m1 = true; markDirty();
      const toast = document.getElementById("toast").textContent;
      const cur = () => [...document.querySelectorAll("#quest-list li")].map((li) => li.textContent)[0];
      const a = cur();
      Game.addCurrency(20); const b = cur();
      Game.addCurrency(100); const c = cur();
      act.objectives = saved.objectives; act.linearObjectives = saved.linear;
      delete state.flags.t_m1;
      Game.spendCurrency(Game.currency()); Game.addCurrency(saved.c);
      clearQuests();
      return { toast, a, b, c };
    });
    ok("a step that counts barya reads the balance", money.a === "Mag-ipon (0/50)" && money.b === "Mag-ipon (20/50)", money);
    ok("capped at its target", money.c === "Mag-ipon (50/50)", money);
    ok("a new step in hand is announced", money.toast === "Bagong gawain: Mag-ipon (0/50)", money);

    // objectiveCurrency: false switches the drip off for that act only.
    const drip = await page.evaluate(() => {
      const act = Acts.getAct(Acts.current);
      const on = Acts.perObjective(5);
      act.objectiveCurrency = false;
      const off = Acts.perObjective(5);
      delete act.objectiveCurrency;
      return { on, off };
    });
    ok("an act may switch the per-step barya off", drip.on === 10 && drip.off === 0, drip);
    await ctx.close();
  }

  if (section("BA", "The apple mini-game, the black card, a scripted walk, and an act held open (Blocks 56, 57)")) {
    const { ctx, page } = await enterTestRoom();

    const catchState = () => page.evaluate(() => {
      const f = document.getElementById("catch-field").getBoundingClientRect();
      const a = document.getElementById("catch-apple");
      const ar = a.getBoundingClientRect();
      const b = document.getElementById("catch-basket").getBoundingClientRect();
      return { up: !document.getElementById("catch-screen").classList.contains("hidden"),
        apple: a.classList.contains("hidden") ? null : ar.left + ar.width / 2,
        basket: b.left + b.width / 2, bw: b.width, fl: f.left, fw: f.width,
        result: document.getElementById("catch-result").textContent,
        stop: document.querySelector("#catch-stop .lbl").textContent };
    });
    // Steers the basket with the real keys, under the apple or away from
    // it, until that apple has been caught or has fallen.
    const playApple = async (wantCatch) => {
      let st;
      for (let i = 0; i < 100; i++) { st = await catchState(); if (st.apple !== null) break; await page.waitForTimeout(40); }
      let held = null;
      const hold = async (k) => {
        if (held === k) return;
        if (held) await page.keyboard.up(held);
        if (k) await page.keyboard.down(k);
        held = k;
      };
      for (let i = 0; i < 300; i++) {
        st = await catchState();
        if (st.apple === null) break;
        const target = wantCatch ? st.apple
          : (st.apple < st.fl + st.fw / 2 ? st.fl + st.fw - st.bw / 2 : st.fl + st.bw / 2);
        const diff = target - st.basket;
        await hold(Math.abs(diff) <= 5 ? null : diff > 0 ? "d" : "a");
        await page.waitForTimeout(25);
      }
      await hold(null);
      await page.waitForTimeout(60);
      return catchState();
    };

    const opened = await page.evaluate(() => {
      window.__catch = { caught: [], result: null, x: posX };
      playCatchGame({
        title: "Puno", hint: "Saluhin", goal: 2,
        onCatch: (n) => { __catch.caught.push(n); return "Huli " + n; },
        doneText: "Tapos!",
      }).then((n) => { __catch.result = n; });
      return { shown: !document.getElementById("catch-screen").classList.contains("hidden"),
        blocked: uiBlocked, title: document.getElementById("catch-title").textContent,
        stop: document.querySelector("#catch-stop .lbl").textContent };
    });
    ok("it opens over the world and blocks it", opened.shown && opened.blocked &&
       opened.title === "Puno" && opened.stop === "Bumalik", opened);
    const second = await page.evaluate(async () => {
      let got = null;
      await Promise.race([playCatchGame({}).then((n) => { got = n; }), new Promise((r) => setTimeout(r, 30))]);
      return got;
    });
    ok("a second one while it is up resolves at once with nothing", second === 0, second);

    const hang = await page.evaluate(async () => {
      for (let i = 0; i < 60; i++) {
        const a = document.getElementById("catch-apple");
        if (!a.classList.contains("hidden")) return a.classList.contains("catch-apple-hanging");
        await new Promise((r) => setTimeout(r, 30));
      }
      return null;
    });
    ok("an apple shakes in the leaves before it falls", hang === true, hang);
    const miss = await playApple(false);
    ok("an apple past the basket falls, says so, and counts nothing",
       miss.result === "Nahulog sa lupa! May isa pa." && await page.evaluate(() => __catch.caught.length === 0), miss);
    ok("A and D move the basket, not Macario", await page.evaluate(() => posX === __catch.x && velY === 0));
    const hit = await playApple(true);
    ok("an apple in the basket is caught, shown with onCatch's line", hit.result === "Huli 1" &&
       await page.evaluate(() => JSON.stringify(__catch.caught) === "[1]"), hit);
    const done = await playApple(true);
    ok("at the goal it says doneText and Bumalik becomes Tapos na", done.result === "Tapos!" && done.stop === "Tapos na", done);
    await page.waitForTimeout(700);
    ok("and drops no more apples", (await catchState()).apple === null);
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    const closed = await page.evaluate(() => ({ result: __catch.result, blocked: uiBlocked,
      hidden: document.getElementById("catch-screen").classList.contains("hidden"), shell: Shell.state }));
    ok("E closes it at the goal and resolves with the count", closed.result === 2 && !closed.blocked && closed.hidden &&
       closed.shell === "playing", closed);

    const resumed = await page.evaluate(() => {
      window.__catch2 = null;
      playCatchGame({ goal: 3, start: 2 }).then((n) => { __catch2 = n; });
      return document.getElementById("catch-result").textContent;
    });
    ok("start carries apples already held", resumed === "Hawak mo: 2/3", resumed);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    ok("Escape closes it early, resolving with what is held, and does not open pause",
       await page.evaluate(() => __catch2 === 2 && !uiBlocked && Shell.state === "playing"));
    const tap = await page.evaluate(() => {
      const b = document.getElementById("catch-stop");
      window.__c3 = null;
      playCatchGame({ goal: 3 }).then((n) => { __c3 = n; });
      const r = b.getBoundingClientRect();
      return { h: r.height };
    });
    ok("its buttons are at least 44px tall on the screen", tap.h >= 44, tap);
    await page.click("#catch-left");
    await page.click("#catch-stop");
    await page.waitForTimeout(100);
    ok("and they take a click", await page.evaluate(() => __c3 === 0));

    // The black card.
    const card = await page.evaluate(async () => {
      const seen = { black: false, lines: null, duringBlack: null, afterText: null };
      const p = playIntertitle(["Una", "Ikalawa"], { holdMs: 150, whileBlack: () => {
        const el = document.getElementById("intertitle");
        seen.duringBlack = el.classList.contains("visible");
        seen.afterText = document.querySelectorAll("#intertitle .intertitle-line.shown").length;
      } });
      await new Promise((r) => setTimeout(r, 1400 / (window.__TEST_SPEED || 1))); // Block 115
      const el = document.getElementById("intertitle");
      seen.black = el.classList.contains("visible") && !el.classList.contains("hidden");
      seen.lines = [...document.querySelectorAll("#intertitle .intertitle-line")].map((x) => x.textContent);
      seen.first = document.querySelector("#intertitle .intertitle-line").classList.contains("shown");
      await p;
      seen.hiddenAfter = el.classList.contains("hidden") && !el.classList.contains("visible");
      return seen;
    });
    ok("an intertitle fades to black and brings its lines up", card.black && card.first &&
       JSON.stringify(card.lines) === '["Una","Ikalawa"]', card);
    ok("whileBlack runs once the text has gone and before the black lifts",
       card.duringBlack === true && card.afterText === 0, card);
    ok("and it ends hidden", card.hiddenAfter, card);
    const instant = await page.evaluate(() => {
      playIntertitle(["X"], { startBlack: true, holdMs: 50 });
      const el = document.getElementById("intertitle");
      return { visible: el.classList.contains("visible"), opacity: getComputedStyle(el).opacity };
    });
    ok("startBlack is black at once, with no fade in", instant.visible && instant.opacity === "1", instant);
    await page.waitForTimeout(3500);

    // A scripted walk, and a placement.
    const walked = await page.evaluate(async () => {
      setCutscene(true);
      const x0 = posX;
      const seen = new Set();
      let during = false;
      const p = movePlayer(x0 + 150, 500);
      for (let i = 0; i < 30 && scriptWalking; i++) {
        during = true;
        seen.add(currentAnim);
        await new Promise((r) => setTimeout(r, 40));
      }
      await p;
      await new Promise((r) => requestAnimationFrame(r));
      const out = { during, anims: [...seen], moved: posX - x0, facing, after: currentAnim, walking: scriptWalking };
      placePlayer(x0, -1);
      out.placed = { x: posX, facing };
      setCutscene(false);
      out.back = x0;
      return out;
    });
    ok("movePlayer walks him there with his walk cycle, in a cutscene", walked.during &&
       JSON.stringify(walked.anims) === '["walk"]' && walked.moved === 150 && walked.facing === 1, walked);
    ok("and stands him idle when he arrives", walked.after === "idle" && !walked.walking, walked);
    ok("placePlayer puts him somewhere at once", walked.placed.x === walked.back && walked.placed.facing === -1, walked);

    // An NPC that is used rather than talked to, drawn at its own height.
    const used = await page.evaluate(async () => {
      window.__used = 0;
      const scene = currentScene;
      scene.npcs = scene.npcs || [];
      scene.npcs.push({ id: "t_puno", x: 0, label: "Puno", interactLabel: "Pumitas", displayHeight: 220,
        img: "assets/nothing-here.png", dialogueSets: [], onInteract: () => { __used++; } });
      const id = currentSceneId;
      loadScene(id);
      const npc = NPCS.find((n) => n.id === "t_puno");
      npc.x = posX + 60;
      placeBody(document.getElementById("npc-t_puno"), npc.x);
      await new Promise((r) => setTimeout(r, 120));
      return { label: document.querySelector("#btn-interact .lbl").textContent,
               h: document.getElementById("npc-t_puno").style.height };
    });
    ok("an NPC may name its own button and height", used.label === "Pumitas" && used.h === "220px", used);
    await page.keyboard.press("e");
    await page.waitForTimeout(100);
    ok("E runs its onInteract and opens no conversation", await page.evaluate(() =>
      __used === 1 && dialogueBox.classList.contains("hidden")));
    await page.evaluate(() => {
      currentScene.npcs = currentScene.npcs.filter((n) => n.id !== "t_puno");
      loadScene(currentSceneId);
    });

    // holdOpen: every objective done, the act still playing.
    const held = await page.evaluate(async () => {
      const act = Acts.getAct(Acts.current);
      const saved = act.objectives;
      act.objectives = [{ id: "h1", label: "Isa", flag: "t_h1" }];
      act.holdOpen = true;
      state.flags.t_h1 = true;
      Acts._lastDone = -1;
      await Acts.checkObjectives();
      const out = { status: Acts.status, done: Acts.countDone(Acts.current), total: Acts.objectivesFor(Acts.current).length };
      act.objectives = saved;
      delete act.holdOpen;
      delete state.flags.t_h1;
      return out;
    });
    ok("an act with holdOpen does not finish when every step is done",
       held.status === "playing" && held.done === 1 && held.total === 1, held);
    await ctx.close();
  }

  if (section("BB", "Sound effects, and people who leave the story (Block 58)")) {
    const { ctx, page } = await enterTestRoom();
    // Every effect decoded ahead of time, like the gunshot.
    await page.waitForFunction(() => Object.keys(SFX_SOURCES).every((n) => !!sfxBuffers[n]),
      null, { timeout: 8000 }).catch(() => {});
    const loaded = await page.evaluate(() => Object.keys(SFX_SOURCES).filter((n) => !sfxBuffers[n]));
    ok("every sound effect file loads and decodes", loaded.length === 0, loaded);

    // Which effect the engine asked for, per event, by wrapping playSfx.
    await page.evaluate(() => {
      window.__sfx = [];
      const real = playSfx;
      window.playSfx = (name) => { __sfx.push(name); return real(name); };
    });
    const heard = async (fn) => page.evaluate(async (src) => {
      __sfx = [];
      await (0, eval)(src)();
      await new Promise((r) => setTimeout(r, 60));
      return __sfx.slice();
    }, fn.toString());
    ok("a line of dialogue blips", (await heard(() => { playDialogue([{ speaker: "A", text: "b" }]); })).includes("blip"));
    await page.keyboard.press("e");
    await page.waitForTimeout(100);
    ok("a jump makes a sound", (await heard(() => { handleJumpPress(); })).includes("jump"));
    await page.waitForTimeout(900);
    ok("barya earned rings the coin", (await heard(() => { Game.addCurrency(1); })).includes("coin"));
    ok("barya spent does not", !(await heard(() => { Game.spendCurrency(1); })).includes("coin"));
    const gift = await heard(() => {
      const npc = { id: "t_g", x: 0, label: "G", dialogueSets: [],
        gift: { buttonLabel: "x", requiresFlag: "t_r", givenFlag: "t_given", responseLines: [{ speaker: "G", text: "salamat" }] } };
      startGift(npc); endDialogue();
    });
    ok("a gift handed over plays give", gift.includes("give"), gift);
    const quest = await heard(() => {
      const act = currentActData;
      window.__saved = { o: act.objectives, l: act.linearObjectives };
      act.linearObjectives = true;
      act.objectives = [{ id: "q1", label: "Isa", flag: "t_q1" }, { id: "q2", label: "Dalawa", flag: "t_q2" }];
      renderQuests();
      state.flags.t_q1 = true; markDirty();
    });
    ok("a new task plays the quest chime", quest.includes("quest"), quest);
    await page.evaluate(() => {
      currentActData.objectives = __saved.o; currentActData.linearObjectives = __saved.l;
      delete state.flags.t_q1; clearQuests();
    });
    // Block 84. A black card is silent unless it names a sound, and a
    // scene's fade to black is silent.
    const card = await heard(() => playIntertitle(["X"], { startBlack: true, holdMs: 10 }));
    ok("a black card is silent unless it names a sound (Block 84)", !card.includes("intertitle") && !card.includes("door"), card);
    const named = await heard(() => playIntertitle(["Y"], { startBlack: true, holdMs: 10, sfx: "applause" }));
    ok("and one that names applause plays it", named.includes("applause"), named);
    ok("sounds follow the Mga tunog switch", await page.evaluate(() => {
      Game.setAudio({ music: true, sfx: false });
      window.__SB = 0;
      const make = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function () { __SB++; return make.call(this); };
      playSfx("coin");
      AudioContext.prototype.createBufferSource = make;
      Game.setAudio({ music: true, sfx: true });
      return __SB === 0;
    }));

    // hiddenByFlag: built hidden once its flag is set, and hidden in place
    // by refreshNpcVisibility; revealedByFlag still works beside it.
    const gone = await page.evaluate(async () => {
      const scene = currentScene;
      scene.npcs = scene.npcs || [];
      scene.npcs.push({ id: "t_leaves", x: 600, label: "L", img: "x.png", hiddenByFlag: "t_after",
        dialogueSets: [{ lines: [{ speaker: "L", text: "a" }] }] });
      scene.npcs.push({ id: "t_comes", x: 800, label: "C", img: "x.png", startsHidden: true,
        revealedByFlag: "t_after", dialogueSets: [{ lines: [{ speaker: "C", text: "a" }] }] });
      loadScene(currentSceneId);
      const shown = (id) => document.getElementById("npc-" + id).style.display !== "none";
      const before = { leaves: shown("t_leaves"), comes: shown("t_comes") };
      state.flags.t_after = true;
      const unchanged = shown("t_leaves");
      refreshNpcVisibility();
      const after = { leaves: shown("t_leaves"), comes: shown("t_comes"),
        hidden: NPCS.find((n) => n.id === "t_leaves").hidden };
      loadScene(currentSceneId);
      const rebuilt = { leaves: shown("t_leaves"), comes: shown("t_comes") };
      scene.npcs = scene.npcs.filter((n) => !/^t_(leaves|comes)$/.test(n.id));
      delete state.flags.t_after;
      loadScene(currentSceneId);
      return { before, unchanged, after, rebuilt };
    });
    ok("an NPC with hiddenByFlag is there until the flag", gone.before.leaves && !gone.before.comes, gone);
    ok("the flag alone does not move anyone: refreshNpcVisibility does", gone.unchanged, gone);
    ok("then he is gone and the revealed one is there", !gone.after.leaves && gone.after.hidden && gone.after.comes, gone);
    ok("and a rebuilt scene keeps it that way", !gone.rebuilt.leaves && gone.rebuilt.comes, gone);
    await ctx.close();
  }

  if (section("BC", "The weight of a blow (Block 60)")) {
    const { ctx, page } = await enterTestRoom();
    await page.evaluate(() => {
      window.__asked = [];
      const real = playSfx;
      window.playSfx = (name) => { __asked.push(name); return real(name); };
      loadScene("tondo");
      posX = 300; posY = floorHeightAt(posX); onGround = true; facing = 1;
      health = maxHealth; invulnUntil = 0;
      window.__won = false;
      spawnEnemies([
        { id: "w1", x: 360, hp: 2, img: "assets/Kaaway.png" },
        { id: "w2", x: 1400, hp: 2, img: "assets/Kaaway.png" },
      ]).then(() => { window.__won = true; });
    });

    const miss = await page.evaluate(() => {
      __asked = [];
      facing = -1; // away from both
      meleeAttack();
      facing = 1;
      return { asked: __asked.slice(), stopped: hitStopUntil > performance.now() };
    });
    ok("a punch at nothing swings, and nothing more", JSON.stringify(miss.asked) === '["swing"]' && !miss.stopped, miss);

    const hit = await page.evaluate(async () => {
      __asked = [];
      const e = ENEMIES[0];
      e.pos = posX + PLAYER_WIDTH + 10;
      const start = e.pos;
      meleeAttack();
      const at = performance.now();
      const now = { pos: e.pos, stopped: hitStopUntil - at, shaking: shakeUntil > at, asked: __asked.slice() };
      // Every frame's transform while the shake runs, since it eases to
      // nothing; the slide is read inside the stagger (350ms), before he
      // walks back in.
      const seen = new Set();
      while (performance.now() - at < 280) {
        seen.add(world.style.transform);
        await new Promise((r) => requestAnimationFrame(r));
      }
      const later = e.pos;
      await new Promise((r) => setTimeout(r, 300));
      return { start, now, later, shook: [...seen].find((t) => t.startsWith("translate(")) || [...seen].join(" | "),
               after: world.style.transform, hp: e.hp };
    });
    ok("a punch that lands swings and thumps", JSON.stringify(hit.now.asked) === '["swing","punch"]', hit);
    ok("and freezes the world for a moment, and shakes the camera",
       hit.now.stopped > 30 && hit.now.stopped <= 60 && hit.now.shaking, hit);
    ok("the shake moves the camera off its line, then lets it go",
       /translate\(/.test(hit.shook) && /^translateX\(/.test(hit.after), hit);
    ok("the enemy is knocked back at once, then slides on",
       hit.now.pos > hit.start && hit.later > hit.now.pos + 20, hit);
    ok("coming to rest about as far as the old knockback (45)",
       Math.abs(hit.later - hit.start - 45) < 8, hit);

    const frozen = await page.evaluate(async () => {
      const x0 = posX;
      keysPressed["d"] = true;
      hitStop(250);
      await new Promise((r) => setTimeout(r, 180));
      const during = posX;
      await new Promise((r) => setTimeout(r, 250));
      keysPressed["d"] = false;
      return { x0, during, after: posX };
    });
    ok("nothing moves during a hit-stop, and the world carries on after it",
       frozen.during === frozen.x0 && frozen.after > frozen.x0, frozen);

    const ko = await page.evaluate(async () => {
      __asked = [];
      const e = ENEMIES[0];
      e.pos = posX + PLAYER_WIDTH + 10;
      invulnUntil = performance.now() + 5000;
      meleeAttack();
      const at = performance.now();
      const now = { pos: e.pos, stopped: hitStopUntil - at, asked: __asked.slice(),
        cls: e.el.className };
      await new Promise((r) => setTimeout(r, 700));
      return { now, later: e.pos, fall: getComputedStyle(e.el).animationName };
    });
    ok("the blow that drops him plays the knockout, with a longer freeze",
       JSON.stringify(ko.now.asked) === '["swing","knockout"]' && ko.now.stopped > 90, ko);
    ok("and he topples away from it as he slides",
       /enemy-down/.test(ko.now.cls) && /enemy-fall-right/.test(ko.now.cls) &&
       ko.fall === "enemy-fall-right" && ko.later > ko.now.pos + 30, ko);

    const hurt = await page.evaluate(() => {
      __asked = [];
      invulnUntil = 0;
      damagePlayer("t", false);
      return { asked: __asked.slice(), shaking: shakeUntil > performance.now() };
    });
    ok("Macario being hit buzzes and shakes the camera", hurt.asked.includes("hurt") && hurt.shaking, hurt);

    const end = await page.evaluate(async () => {
      invulnUntil = performance.now() + 5000;
      hitEnemy(ENEMIES[1], 99);
      const right = window.__won;
      await new Promise((r) => setTimeout(r, FIGHT_END_BEAT_MS + 300));
      return { right, later: window.__won };
    });
    ok("the fight ends a beat after the last one falls, not on the blow",
       end.right === false && end.later === true, end);
    await ctx.close();
  }

  if (section("BE", "Takbo, a forgiving jump, and dust (Block 63)")) {
    const { ctx, page } = await enterTestRoom();
    const walk = await page.evaluate(async () => {
      loadScene("tondo"); // the fixture's tondo has no guard
      posX = 200; posY = floorHeightAt(posX); velY = 0; onGround = true;
      const x0 = posX;
      keysPressed["d"] = true;
      await new Promise((r) => setTimeout(r, 300));
      const early = { dx: posX - x0, running: (runBlend > 0) };
      await new Promise((r) => setTimeout(r, 900));
      const x1 = posX;
      await new Promise((r) => setTimeout(r, 300));
      const late = { dx: posX - x1, running: (runBlend > 0), blend: runBlend };
      keysPressed["d"] = false;
      await new Promise((r) => setTimeout(r, 60));
      return { early, late, after: (runBlend > 0),
        dust: [...document.querySelectorAll(".dust")].map((d) => d.className) };
    });
    ok("a short hold is a walk", !walk.early.running && walk.early.dx > 0, walk.early);
    ok("held longer, he breaks into a run, faster than a walk",
       walk.late.running && walk.late.blend === 1 && walk.late.dx > 300 / 16.67 * SPEED_FOR_TEST * 1.3, walk.late);
    ok("letting go drops the run at once", walk.after === false);
    ok("running raises dust behind him from a small reused pool",
       walk.dust.length === 6 && walk.dust.some((c) => /dust-(start|stride)/.test(c)), walk.dust);

    // Block 82. The rule is near a guard, not in a scene that has one:
    // far down the road he runs, beside a guard he does not.
    const guarded = await page.evaluate(async () => {
      loadScene("misyon"); // the fixture guard's scene
      const g = GUARDS[0];
      posX = Math.max(0, g.patrolFrom - 900); posY = floorHeightAt(posX); onGround = true;
      keysPressed["a"] = true;
      await new Promise((r) => setTimeout(r, 900));
      const farRunning = (runBlend > 0);
      keysPressed["a"] = false;
      posX = g.pos + GUARD_WIDTH / 2 - PLAYER_WIDTH / 2 - 150; posY = floorHeightAt(posX);
      const nearAllowed = runAllowed();
      return { farRunning, nearAllowed, guards: GUARDS.length };
    });
    ok("a run far from a guard, and none where a guard is watching",
       guarded.guards > 0 && guarded.farRunning === true && guarded.nearAllowed === false, guarded);

    const coyote = await page.evaluate(() => {
      loadScene("tondo");
      posX = 200; posY = floorHeightAt(posX) + 5; onGround = false; velY = -1;
      lastGroundedAt = performance.now() - 60;
      handleJumpPress();
      const late = velY;
      velY = -1; onGround = false; lastGroundedAt = performance.now() - 400; jumpBufferedAt = 0;
      handleJumpPress();
      return { late, tooLate: velY, buffered: jumpBufferedAt > 0 };
    });
    ok("a jump a moment after leaving the ground still jumps", coyote.late === 14, coyote);
    ok("a jump well after leaving it does not, but is remembered", coyote.tooLate === -1 && coyote.buffered, coyote);

    const buffer = await page.evaluate(async () => {
      posX = 200; posY = floorHeightAt(posX) + 40; velY = -6; onGround = false;
      lastGroundedAt = 0;
      handleJumpPress(); // in the air: remembered, not a double jump
      const inAir = velY;
      await new Promise((r) => setTimeout(r, 120));
      return { inAir, afterLanding: velY > 5 || posY > floorHeightAt(posX) + 20,
        land: [...document.querySelectorAll(".dust")].some((d) => /dust-(land|jump)/.test(d.className)) };
    });
    ok("a jump pressed just before landing happens on the landing", buffer.inAir <= 0 && buffer.afterLanding, buffer);
    ok("landing and taking off raise dust", buffer.land, buffer);

    const noDouble = await page.evaluate(async () => {
      posX = 200; posY = floorHeightAt(posX); velY = 0; onGround = true;
      handleJumpPress();
      await new Promise((r) => setTimeout(r, 50));
      const first = velY;
      handleJumpPress();
      return { first, second: velY };
    });
    ok("still no double jump", noDouble.second <= noDouble.first, noDouble);
    await ctx.close();
  }

  if (section("BF", "The apple game, with feeling: a timed round, golden apples, streaks (Block 65)")) {
    const { ctx, page } = await enterTestRoom();
    const round = await page.evaluate(async () => {
      window.__asked = [];
      const real = playSfx;
      window.playSfx = (name) => { __asked.push(name); return real(name); };
      // Every apple drops over the middle, where the basket starts, so
      // each one is caught without touching the controls.
      const rnd = Math.random;
      Math.random = () => 0.5;
      const seen = { golden: false, pop: false, squash: false, streak: false, clock: "" };
      let doneWith = null;
      const p = playCatchGame({ timeLimitMs: 9500, doneText: (n) => { doneWith = n; return "done " + n; } });
      const t0 = performance.now();
      while (performance.now() - t0 < 10200) {
        await new Promise((r) => setTimeout(r, 40));
        seen.golden = seen.golden || document.getElementById("catch-apple").classList.contains("catch-apple-golden");
        seen.pop = seen.pop || /catch-anim/.test(document.getElementById("catch-pop").className);
        seen.squash = seen.squash || /catch-anim/.test(document.getElementById("catch-basket").className);
        seen.streak = seen.streak || /Sunod-sunod! x3/.test(document.getElementById("catch-result").textContent);
        if (!seen.clock) seen.clock = document.getElementById("catch-hint").textContent;
      }
      Math.random = rnd;
      const result = document.getElementById("catch-result").textContent;
      const hint = document.getElementById("catch-hint").textContent;
      document.getElementById("catch-stop").click();
      const count = await p;
      return { seen, result, hint, count, doneWith, asked: __asked.slice() };
    });
    ok("a timed round shows its clock and count", /^Oras: \d+  ·  Nasalo: \d+$/.test(round.seen.clock), round.seen);
    ok("apples keep coming until the time is up, then it says so",
       round.hint === "Tapos na ang oras!" && round.result === "done " + round.count && round.doneWith === round.count, round);
    ok("a catch squashes the basket and raises a +1", round.seen.pop && round.seen.squash, round.seen);
    ok("three in a row is a streak, with its own sound",
       round.seen.streak && round.asked.includes("streak"), { seen: round.seen, asked: round.asked });
    ok("every fifth apple of a timed round is golden and counts three",
       round.seen.golden && round.count >= 7, round);

    const miss = await page.evaluate(async () => {
      const rnd = Math.random;
      Math.random = () => 0; // far left, away from the basket
      const p = playCatchGame({ goal: 3 });
      let splat = false;
      const t0 = performance.now();
      while (performance.now() - t0 < 2600 && !splat) {
        await new Promise((r) => setTimeout(r, 40));
        splat = /catch-anim/.test(document.getElementById("catch-splat").className);
      }
      Math.random = rnd;
      const result = document.getElementById("catch-result").textContent;
      document.getElementById("catch-stop").click();
      return { splat, result, count: await p };
    });
    ok("a missed apple splats where it lands, and costs nothing",
       miss.splat && miss.count === 0 && /Nahulog/.test(miss.result), miss);
    await ctx.close();
  }

  if (section("BG", "The reward pop (Block 67)")) {
    const { ctx, page } = await enterTestRoom();
    const pop = await page.evaluate(async () => {
      posX = 300;
      Game.addCurrency(12);
      const el = [...document.querySelectorAll(".float-text")].find((e) => e.textContent === "+12");
      const first = el && { cls: el.className, left: parseFloat(el.style.left) };
      Game.addCurrency(3);
      Game.spendCurrency(1);
      const all = [...document.querySelectorAll(".float-text")].map((e) => e.textContent);
      await new Promise((r) => setTimeout(r, 1500));
      return { first, all, faded: getComputedStyle(el).opacity };
    });
    ok("being paid raises +N with a coin over Macario's head",
       pop.first && /float-coin/.test(pop.first.cls) && pop.first.left === 300 + 20, pop);
    ok("from a pool of two, and spending raises nothing",
       pop.all.length === 2 && pop.all.includes("+3") && !pop.all.some((t) => t.startsWith("-")), pop.all);
    ok("and it fades away by itself", pop.faded === "0", pop.faded);
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BH. Block 68. The questions are in the game: graded here, the
  // teacher's from the database first, the built-in bank otherwise; a
  // failed post-test offers a replay; a student can change the password.
  // -------------------------------------------------------------
  if (section("BH", "Questions in the game, a replay after a failed post-test, and the password (Block 68)")) {
    // In the page: sits the test on screen, choosing by answer(question,
    // index) the choice to tap, and taps through every message after.
    const DRIVE = `window.__drive = async (pending, answer) => {
      const seen = { questions: [], screens: [], backs: [] };
      let done = false; pending.then(() => { done = true; });
      for (let i = 0; i < 80 && !done; i++) {
        await new Promise((r) => setTimeout(r, 40));
        if (document.getElementById("quiz").classList.contains("hidden")) continue;
        const q = document.getElementById("quiz-question").textContent;
        const choices = [...document.querySelectorAll(".quiz-choice")];
        if (choices.length) {
          if (seen.questions[seen.questions.length - 1] !== q) seen.questions.push(q);
          const back = document.getElementById("quiz-back");
          if (!back.classList.contains("hidden")) seen.backs.push(back.querySelector(".lbl").textContent);
          choices[answer(q, seen.questions.length - 1)].click();
          await new Promise((r) => setTimeout(r, 20));
        } else {
          seen.screens.push(document.getElementById("quiz-title").textContent);
          if (/Subukan ulit/.test(document.getElementById("quiz-title").textContent)) return seen;
        }
        document.getElementById("quiz-btn").click();
      }
      return seen;
    };`;
    const state0 = Object.assign(atTestRoom(), { realQuestions: true });
    const { ctx, page } = await newPage(state0, fixtureRoutes());
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(400);
    await page.evaluate(DRIVE);

    const pre = await page.evaluate(async () => {
      const bank = QUESTIONS[1].pre;
      const key = new Map(bank.map((q) => [q.question, q.correct]));
      const p = Assessment.runTest(1, "pre");
      const seen = await __drive(p, (q) => key.get(q));
      const result = await p;
      return { seen, result, rows: __DB.assessment_scores.filter((r) => r.test_type === "pre") };
    });
    ok("with nothing in the database, the pre-test is the game's own ten questions",
       pre.seen.questions.length === 10, pre.seen);
    ok("the game grades it itself: every right answer counted, the score recorded",
       pre.result.score === 10 && pre.result.max === 10 && pre.rows.length === 1 &&
       pre.rows[0].score === 10 && pre.rows[0].attempt === undefined, pre);
    const again = await page.evaluate(async () => {
      const p = Assessment.runTest(1, "pre");
      const seen = await __drive(p, () => 0);
      return { seen, n: __DB.assessment_scores.filter((r) => r.test_type === "pre").length };
    });
    ok("the pre-test is still sat once", again.seen.questions.length === 0 &&
       again.seen.screens[0] === "Naipasa na" && again.n === 1, again);

    const db = await page.evaluate(async () => {
      __DB.assessment_items.push(
        { id: "i1", act_number: 1, test_type: "post", item_order: 1, question: "Tanong ng guro 1", choices: ["a", "b", "c"], correct_index: 1 },
        { id: "i2", act_number: 1, test_type: "post", item_order: 2, question: "Tanong ng guro 2", choices: ["a", "b"], correct_index: 0 });
      const p = Assessment.runTest(1, "post");
      const seen = await __drive(p, (q) => q === "Tanong ng guro 1" ? 1 : 1); // one right, one wrong
      return { seen, result: await p, row: __DB.assessment_scores.find((r) => r.test_type === "post") };
    });
    ok("the teacher's questions in the database are used in place of the built-in ones",
       JSON.stringify(db.seen.questions) === '["Tanong ng guro 1","Tanong ng guro 2"]', db.seen);
    ok("half right is below the 75% pass mark, and says so",
       db.result.score === 1 && db.result.passed === false && db.seen.screens.includes("Hindi pumasa") &&
       db.row && db.row.score === 1 && db.row.max_score === 2, db);

    // The whole end of the act: fail, replay, pass.
    const replay = await page.evaluate(async () => {
      Acts.showTransition = function () {};
      Assessment.runFeedback = async function () {};
      __DB.assessment_scores = __DB.assessment_scores.filter((r) => r.test_type !== "post");
      window.__DB.assessment_scores.length; // keep the stub's array reference
      Object.keys(state.flags).forEach((k) => delete state.flags[k]);
      Object.assign(state.flags, { nalamanAngPinagmulan: true, salita_tondo: true, pahiwatig_2: true,
        __startCurrency_1: 5, __hintSeed: 42 });
      Game.addCurrency(35 - Game.currency() + 0);
      // Scan S7: an item the story handed over, worn, is taken back.
      ITEMS.push({ id: "kostyum-pagsubok", name: "K", kind: "equipment", slot: "outfit", price: 0,
        description: "", effect: {}, replayRemoves: true });
      await Inventory.grant("kostyum-pagsubok");
      await Inventory.equip("kostyum-pagsubok");
      const wornBefore = Inventory.isWorn("kostyum-pagsubok");
      const before = Game.currency();
      const p = Acts.finishAct();
      const seen = await __drive(p, () => 1); // "a","b","c": b right for 1, wrong for 2
      const offered = document.getElementById("quiz-title").textContent;
      document.getElementById("quiz-btn").click(); // Ulitin ang Yugto
      // The act's title card waits for its tap, as on entering an act.
      for (let i = 0; i < 60 && document.getElementById("act-screen").classList.contains("hidden"); i++) {
        await new Promise((r) => setTimeout(r, 50));
      }
      const titleCard = document.getElementById("act-screen-title").textContent;
      document.getElementById("act-screen-btn").click();
      await p;
      await new Promise((r) => setTimeout(r, 300));
      const ap = __DB.act_progress.find((r) => r.act_number === 1);
      return { seen, offered, before, titleCard, status: Acts.status, dbStatus: ap && ap.status,
        wornBefore, ownsAfter: Inventory.owns("kostyum-pagsubok"), wornAfter: Inventory.isWorn("kostyum-pagsubok"),
        rowAfter: __DB.player_inventory.some((r) => r.item_id === "kostyum-pagsubok"),
        flags: Object.assign({}, state.flags), currency: Game.currency(),
        posts: __DB.assessment_scores.filter((r) => r.test_type === "post").length };
    });
    ok("a failed post-test offers to replay the act", replay.offered === "Subukan ulit?" && replay.posts === 1, replay);
    ok("replaying shows the act's title card and puts the act back to playing, here and in act_progress",
       replay.titleCard.length > 0 && replay.status === "playing" && replay.dbStatus === "playing", replay);
    ok("the story starts again, keeping words, hints and the engine's own flags",
       !replay.flags.nalamanAngPinagmulan && replay.flags.salita_tondo && replay.flags.pahiwatig_2 &&
       replay.flags.__hintSeed === 42 && replay.flags.__retakePost_1 === true, replay.flags);
    ok("and the barya go back to what the act began with", replay.before === 35 && replay.currency === 5, replay);
    ok("and what the story handed over is taken back, off and out of the bag (S7)",
       replay.wornBefore && !replay.ownsAfter && !replay.wornAfter && !replay.rowAfter, replay);

    const pass = await page.evaluate(async () => {
      const p = Acts.finishAct();
      const seen = await __drive(p, (q) => q === "Tanong ng guro 1" ? 1 : 0); // both right
      await p;
      const posts = __DB.assessment_scores.filter((r) => r.test_type === "post");
      return { seen, status: Acts.status, posts, retake: state.flags.__retakePost_1 };
    });
    ok("at the end of the replay the post-test is sat again, as attempt 2",
       pass.seen.questions.length === 2 && pass.posts.length === 2 && pass.posts[1].attempt === 2 &&
       pass.posts[1].score === 2, pass);
    ok("passing completes the act and spends the retake", pass.status === "completed" &&
       pass.seen.screens.includes("Pumasa!") && pass.retake === undefined, pass);
    ok("after the replay's Tapusin na, the questions' Back reads Bumalik again (Scan S2)",
       pass.seen.backs.length > 0 && pass.seen.backs.every((b) => b === "Bumalik"), pass.seen.backs);
    await ctx.close();
  }
  if (still()) { // the section above, continued
    // Scan S3. A score that cannot be written (no internet) no longer
    // holds the student: Ituloy muna keeps it on the phone, it counts as
    // sat, and the next login sends it.
    const { ctx, page } = await newPage(Object.assign(atTestRoom(), { realQuestions: true }), fixtureRoutes());
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(400);
    const off = await page.evaluate(async () => {
      try { localStorage.removeItem(Assessment.PENDING_KEY); } catch (e) {}
      __TEST.insertError = { assessment_scores: "Failed to fetch" };
      const p = Assessment.runTest(1, "pre");
      const screens = [];
      let done = false; p.then(() => { done = true; });
      let leftOnce = false;
      for (let i = 0; i < 120 && !done; i++) {
        await new Promise((r) => setTimeout(r, 40));
        if (document.getElementById("quiz").classList.contains("hidden")) continue;
        const choices = [...document.querySelectorAll(".quiz-choice")];
        if (choices.length) { choices[0].click(); await new Promise((r) => setTimeout(r, 20)); }
        else {
          const title = document.getElementById("quiz-title").textContent;
          screens.push(title);
          if (title === "Hindi naipasa" && !leftOnce) {
            const back = document.querySelector("#quiz-back .lbl").textContent;
            screens.push("back:" + back);
            if (screens.filter((s) => s === "Hindi naipasa").length >= 2) {
              leftOnce = true;
              document.getElementById("quiz-back").click();
              continue;
            }
          }
        }
        document.getElementById("quiz-btn").click();
      }
      const result = await p;
      const kept = JSON.parse(localStorage.getItem(Assessment.PENDING_KEY) || "[]");
      const again = await Assessment._existingScores(1, "pre");
      delete __TEST.insertError;
      await Assessment.flushPending();
      return { screens, result, kept: kept.length, againN: again.length,
        rows: __DB.assessment_scores.filter((r) => r.test_type === "pre").length,
        left: localStorage.getItem(Assessment.PENDING_KEY) };
    });
    ok("a score that cannot be saved offers Subukan Ulit and a way on, Ituloy muna (S3)",
       off.screens.includes("Hindi naipasa") && off.screens.includes("back:Ituloy muna") && off.result.max === 10, off);
    ok("going on keeps the score on the phone, and it counts as sat", off.kept === 1 && off.againN === 1, off);
    ok("with the internet back it is sent and no longer kept", off.rows === 1 && off.left === null, off);
    await ctx.close();
  }
  if (still()) { // the section above, continued
    // A student who fails and reloads on the result is offered the
    // choice again, not a free second try.
    const seedFail = Object.assign(atTestRoom(), { realQuestions: true,
      act_progress: [{ student_id: "u1", act_number: 1, status: "posttest", objectives_done: 5 }],
      assessment_scores: [
        { student_id: "u1", act_number: 1, test_type: "pre", score: 3, max_score: 10 },
        { student_id: "u1", act_number: 1, test_type: "post", score: 4, max_score: 10 },
      ] });
    const { ctx, page } = await newPage(seedFail, fixtureRoutes());
    await page.waitForTimeout(700);
    await page.click("#shell-start");
    await page.waitForTimeout(900);
    const re = await page.evaluate(() => ({
      title: document.getElementById("quiz-title").textContent,
      choices: document.querySelectorAll(".quiz-choice").length,
      back: document.querySelector("#quiz-back .lbl").textContent,
    }));
    ok("a reload after a failed post-test offers the replay again, without a new try",
       re.title === "Subukan ulit?" && re.choices === 0 && re.back === "Tapusin na", re);
    await page.evaluate(() => { Acts.showTransition = function () {}; Assessment.runFeedback = async function () {}; });
    await page.click("#quiz-back");
    await page.waitForTimeout(400);
    ok("Tapusin na finishes the act with the score it has",
       await page.evaluate(() => Acts.status === "completed" &&
         __DB.assessment_scores.filter((r) => r.test_type === "post").length === 1));

    // The password, from settings.
    await page.evaluate(() => { document.getElementById("act-screen").classList.add("hidden"); Shell.state = "playing"; });
    await page.evaluate(() => Shell.openPause());
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(200);
    // Block 121. Only a test account (the reset's list) may change it: a
    // study student could lock a coded account on a shared phone.
    const studyOffered = await visible(page, "#shell-password");
    await page.evaluate(() => { __TEST.canReset = true; Shell._closeSettings(); Shell.openPause(); });
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(200);
    ok("a study student is not offered Palitan ang password (Block 121)", !studyOffered);
    ok("a test account is", await visible(page, "#shell-password"));
    await page.click("#shell-password");
    await page.fill("#shell-password-new", "abc");
    await page.fill("#shell-password-again", "abc");
    await page.click("#shell-password-save");
    const short = await page.textContent("#shell-password-note");
    await page.fill("#shell-password-new", "bagongpass");
    await page.fill("#shell-password-again", "bagongpasS");
    await page.click("#shell-password-save");
    const differ = await page.textContent("#shell-password-note");
    await page.fill("#shell-password-again", "bagongpass");
    await page.click("#shell-password-save");
    await page.waitForTimeout(200);
    const saved = await page.evaluate(() => ({
      note: document.getElementById("shell-password-note").textContent,
      call: __CALLS.find((c) => c.auth === "updateUser"),
    }));
    ok("a short password and two that differ are refused before anything is sent",
       /6/.test(short) && /Hindi magkapareho/.test(differ), { short, differ });
    ok("a good one is sent to Supabase as the new password",
       saved.call && saved.call.attrs.password === "bagongpass" && /Napalitan na/.test(saved.note), saved);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    ok("Escape goes back to settings", await page.evaluate(() => Shell.state === "settings"));
    await ctx.close();
  }
  if (still()) { // the section above, continued
    const { ctx, page } = await newPage({ session: null });
    await page.waitForTimeout(300);
    await page.click("#shell-title-settings");
    await page.waitForTimeout(150);
    ok("nobody signed in is offered a password change", !(await visible(page, "#shell-password")));
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BI. Block 68. The teacher edits the questions and answers.
  // -------------------------------------------------------------
  if (section("BI", "The teacher's question editor (Block 68)")) {
    const seed = {
      session: { user: { id: "t1" } },
      profiles: [
        { id: "t1", role: "teacher", full_name: "Gng. Cruz" },
        { id: "s1", role: "student", full_name: "mag-aaral01", class_id: "c1" },
      ],
      classes: [{ id: "c1", class_name: "MAC8-RIZAL", join_code: "R1", teacher_id: "t1" }],
      assessment_scores: [
        { student_id: "s1", act_number: 1, test_type: "pre", score: 4, max_score: 10 },
        { student_id: "s1", act_number: 1, test_type: "post", score: 5, max_score: 10 },
        { student_id: "s1", act_number: 1, test_type: "post", score: 9, max_score: 10, attempt: 2 },
      ],
    };
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });
    await page.route("**/supabaseClient.js*", (route) =>
      route.fulfill({ body: STUB, contentType: "text/javascript" }));
    await page.route("**/js/vendor/supabase.js*", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));
    await page.addInitScript((st) => { window.__TEST = st; }, seed);
    await page.goto("http://localhost:" + PORT + "/teacher.html");
    await page.waitForTimeout(600);

    const post = await page.evaluate(() => [...document.querySelectorAll("#roster-body tr")][0].children[5].textContent);
    ok("the roster shows the latest post-test try and how many there were", /^90%9\/10 · 2 attempts$/.test(post), post);

    const start = await page.evaluate(() => ({
      items: document.querySelectorAll("#qe-list .qe-item").length,
      source: document.getElementById("qe-source").textContent,
      first: document.querySelector("#qe-list .qe-question").value,
      correct: [...document.querySelectorAll("#qe-list .qe-item")][0]
        .querySelectorAll("input[type=radio]")[0].checked,
    }));
    ok("with nothing saved, the editor starts from the game's own pre-test",
       start.items === 10 && /Nothing saved in the database yet/.test(start.source) &&
       /Saan sa Maynila/.test(start.first) && start.correct === true, start);

    // Scan S14: the pre-test has a score against it, so saving asks first.
    // Refused, nothing is written; accepted, the save goes ahead.
    const dialogs = [];
    let acceptDialog = false;
    page.on("dialog", (d) => { dialogs.push(d.message()); acceptDialog ? d.accept() : d.dismiss(); });
    const refused = await page.evaluate(async () => {
      document.getElementById("qe-save").click();
      await new Promise((r) => setTimeout(r, 300));
      return { n: __DB.assessment_items.length, status: document.getElementById("qe-status").textContent };
    });
    ok("saving a test students have sat asks first, and a no writes nothing (S14)",
       dialogs.length === 1 && /1 test result has already been recorded/.test(dialogs[0]) &&
       refused.n === 0 && refused.status === "Not saved.", { dialogs, refused });
    acceptDialog = true;

    const saved = await page.evaluate(async () => {
      const first = document.querySelector("#qe-list .qe-item");
      first.querySelector(".qe-question").value = "Binagong tanong?";
      first.querySelectorAll("input[type=radio]")[2].checked = true;
      document.querySelectorAll("#qe-list .qe-item")[9].querySelector(".qe-delete").click();
      document.getElementById("qe-save").click();
      await new Promise((r) => setTimeout(r, 300));
      const rows = __DB.assessment_items.filter((r) => r.act_number === 1 && r.test_type === "pre");
      return { n: rows.length, first: rows[0], orders: rows.map((r) => r.item_order),
        status: document.getElementById("qe-status").textContent,
        source: document.getElementById("qe-source").textContent };
    });
    ok("saving writes the edited test, in order, with the new right answer",
       saved.n === 9 && saved.first.question === "Binagong tanong?" && saved.first.correct_index === 2 &&
       JSON.stringify(saved.orders) === "[1,2,3,4,5,6,7,8,9]" && /^Saved/.test(saved.status) &&
       /matched pairs/.test(saved.status) && /From the database/.test(saved.source), saved);

    const invalid = await page.evaluate(async () => {
      document.querySelector("#qe-list .qe-question").value = "  ";
      document.getElementById("qe-save").click();
      await new Promise((r) => setTimeout(r, 200));
      return { status: document.getElementById("qe-status").textContent,
        still: __DB.assessment_items.filter((r) => r.test_type === "pre")[0].question };
    });
    ok("a question left empty is refused and nothing is written",
       /Question 1/.test(invalid.status) && invalid.still === "Binagong tanong?", invalid);

    await page.selectOption("#qe-type", "trivia");
    await page.waitForTimeout(300);
    const trivia = await page.evaluate(async () => {
      const box = document.querySelector("#qe-list .qe-trivia");
      const had = box.value;
      box.value = "Bagong trivia.";
      document.getElementById("qe-save").click();
      await new Promise((r) => setTimeout(r, 300));
      return { had, row: __DB.act_trivia.find((r) => r.act_number === 1) };
    });
    ok("the trivia card is edited the same way",
       /Macario Sakay/.test(trivia.had) && trivia.row && trivia.row.fact === "Bagong trivia.", trivia);
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BJ. The Talaan's engine (Blocks 68, 69). Act I declares no words
  // and no hints since Block 69, so a glossary and hints are put on the
  // fixture act at run time; and a scenery NPC, the apple tree's kind.
  // -------------------------------------------------------------
  if (section("BJ", "The Talaan's engine, and a scenery NPC (Blocks 68, 69)")) {
    const { ctx, page } = await enterTestRoom();
    const t0 = await page.evaluate(() => {
      loadScene("tondo");
      currentActData.glossary = { title: "Talaan", hint: "h",
        entries: [{ id: "a", term: "Alpha", text: "Ang una." }, { id: "b", term: "Beta", text: "Ang ikalawa." }] };
      currentActData.hints = { count: 3, label: "Pahiwatig", foundText: "found", completeText: "complete",
        pool: [1, 2, 3, 4, 5].map((n) => ({ title: "H" + n, text: "Hint " + n })) };
      currentScene.hintSpots = [300, 700, { x: 1100, y: 155 }, 1500, 1900];
      state.flags.__hintSeed = 12345;
      buildHints();
      const hints = PICKUPS.filter((p) => p.type === "hint");
      const again = (buildHints(), PICKUPS.filter((p) => p.type === "hint"));
      return { hints: hints.map((h) => [h.x, h.hint]), again: again.map((h) => [h.x, h.hint]),
        drawn: document.querySelectorAll(".pickup-page").length, book: Game.glossary() };
    });
    ok("three of the scene's spots and three of the pool's hints are laid, from the seed",
       t0.hints.length === 3 && t0.drawn === 3 && new Set(t0.hints.map((h) => h[1])).size === 3 &&
       JSON.stringify(t0.again) === JSON.stringify(t0.hints), t0);
    ok("the Talaan starts empty", t0.book.found === 0 && t0.book.total === 2 && t0.book.hints.total === 3, t0.book);

    const t1 = await page.evaluate(async () => {
      window.__asked = [];
      const real = playSfx;
      window.playSfx = (name) => { __asked.push(name); return real(name); };
      const first = unlockGlossary("a");
      const twice = unlockGlossary("a");
      const unknown = unlockGlossary("zzz");
      await new Promise((r) => setTimeout(r, 100));
      return { first, twice, unknown, flag: state.flags.salita_a, asked: __asked.slice(),
        toast: document.getElementById("toast").textContent };
    });
    ok("unlockGlossary earns a word once, with a sound and a toast",
       t1.first === true && t1.twice === false && t1.unknown === false && t1.flag === true &&
       t1.asked.join() === "page" && /Alpha/.test(t1.toast), t1);

    const t2 = await page.evaluate(async () => {
      const h = PICKUPS.find((p) => p.type === "hint");
      posX = h.x + PICKUP_SIZE / 2 - PLAYER_WIDTH / 2;
      posY = typeof h.y === "number" ? h.y : floorHeightAt(posX); velY = 0; onGround = typeof h.y !== "number";
      for (let i = 0; i < 40 && document.getElementById("page-card").classList.contains("hidden"); i++) {
        await new Promise((r) => setTimeout(r, 40));
      }
      const card = { eyebrow: document.getElementById("page-card-eyebrow").textContent,
        title: document.getElementById("page-card-title").textContent,
        blocked: uiBlocked, flag: state.flags["pahiwatig_" + h.hint] === true };
      document.getElementById("page-card-close").click();
      return { card, book: Game.glossary() };
    });
    ok("reaching a hint opens its card over a stopped world, and it is saved",
       t2.card.eyebrow === "Pahiwatig 1 / 3" && /^H\d$/.test(t2.card.title) && t2.card.blocked && t2.card.flag, t2.card);
    ok("the Talaan lists what has been found",
       t2.book.found === 1 && t2.book.entries[0].term === "Alpha" && t2.book.entries[1].term === "" &&
       t2.book.hints.found === 1 && t2.book.hints.entries[0].text.startsWith("Hint"), t2.book);

    await page.evaluate(() => Shell.openPause());
    await page.waitForTimeout(150);
    ok("the pause screen offers the Talaan with its count",
       await page.evaluate(() => !document.getElementById("shell-notebook").classList.contains("hidden") &&
         document.querySelector("#shell-notebook .lbl").textContent === "Talaan 1/2"));
    await page.evaluate(() => Shell.closePause());

    const t3 = await page.evaluate(() => {
      currentActData.glossary = undefined;
      currentActData.hints = undefined;
      return Game.glossary();
    });
    ok("an act with neither words nor hints has no Talaan", t3 === null, t3);

    const sc = await page.evaluate(async () => {
      currentScene.npcs = [{ id: "puno-test", x: 600, label: "Puno", scenery: true, interactLabel: "Pumitas",
        dialogueSets: [], onInteract() { window.__used = true; } }];
      loadScene("tondo");
      const el = document.getElementById("npc-puno-test");
      posX = 600; posY = floorHeightAt(posX); onGround = true;
      await new Promise((r) => setTimeout(r, 120));
      const label = document.querySelector("#btn-interact .lbl").textContent;
      handleInteractPress();
      return { children: el.children.length, text: el.textContent, label, used: window.__used === true };
    });
    ok("a scenery NPC has a body to reach and no picture or placeholder box, and E uses it",
       sc.children === 0 && sc.text === "" && sc.label === "Pumitas" && sc.used, sc);
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BK. Block 70. The teacher's Talaan papers: an act whose hints are
  // fixed lays paper n at the scene's hintSpots[n - 1], and takes what
  // the papers say from talaan_entries through Game.setHintPool. Put on
  // the fixture act at run time, then the dashboard's editor.
  // -------------------------------------------------------------
  if (section("BK", "The teacher's Talaan papers (Block 70)")) {
    const { ctx, page } = await enterTestRoom();
    const k0 = await page.evaluate(() => {
      loadScene("tondo");
      currentActData.glossary = undefined;
      currentActData.hints = { count: 3, fixed: true, label: "Papel", listLabel: "Mga Papel",
        foundText: "found", completeText: "complete", pool: [] };
      currentScene.hintSpots = [300, { x: 700, y: 155 }, 1100];
      buildHints();
      const none = { laid: PICKUPS.filter((p) => p.type === "hint").length, book: Game.glossary() };
      Game.setHintPool(currentActData.number, [
        { slot: 3, title: "Ikatlo", text: "Ang ikatlong papel." },
        { slot: 1, title: "", text: "Ang unang papel." },
        { slot: 5, title: "Lampas", text: "Walang lugar ito." },
        { slot: 2, title: "", text: "" },
      ]);
      const laid = PICKUPS.filter((p) => p.type === "hint").map((p) => [p.x, p.hint, p.n]);
      Game.setHintPool(currentActData.number + 1, [{ slot: 2, title: "Iba", text: "Ibang yugto." }]);
      const other = PICKUPS.filter((p) => p.type === "hint").length;
      return { none, laid, other, drawn: document.querySelectorAll(".pickup-page").length,
        book: Game.glossary() };
    });
    ok("with no papers written nothing is laid and there is no Talaan",
       k0.none.laid === 0 && k0.none.book === null, k0.none);
    ok("each paper lies at its own slot's place; an empty slot and a slot past three lay nothing",
       JSON.stringify(k0.laid) === "[[300,0,1],[1100,2,2]]" && k0.drawn === 2, k0.laid);
    ok("another act's papers are not laid here", k0.other === 2, k0.other);
    ok("the Talaan counts the papers written", k0.book.hints.total === 2 && k0.book.hints.label === "Mga Papel" &&
       k0.book.total === 0, k0.book);

    await page.evaluate(() => Shell.openPause());
    await page.waitForTimeout(150);
    ok("with papers and no words, the pause button counts the papers",
       await page.evaluate(() => !document.getElementById("shell-notebook").classList.contains("hidden") &&
         document.querySelector("#shell-notebook .lbl").textContent === "Talaan 0/2"));
    await page.evaluate(() => Shell.closePause());
    await page.waitForTimeout(100);

    const k1 = await page.evaluate(async () => {
      const h = PICKUPS.find((p) => p.type === "hint" && p.x === 1100);
      posX = h.x + PICKUP_SIZE / 2 - PLAYER_WIDTH / 2;
      posY = floorHeightAt(posX); velY = 0; onGround = true;
      for (let i = 0; i < 40 && document.getElementById("page-card").classList.contains("hidden"); i++) {
        await new Promise((r) => setTimeout(r, 40));
      }
      const card = { eyebrow: document.getElementById("page-card-eyebrow").textContent,
        title: document.getElementById("page-card-title").textContent,
        text: document.getElementById("page-card-text").textContent, flag: state.flags.pahiwatig_2 === true };
      document.getElementById("page-card-close").click();
      posX = 1600;
      return card;
    });
    ok("reaching a paper opens it and saves it by its slot",
       k1.eyebrow === "Papel 2 / 2" && k1.title === "Ikatlo" && k1.text === "Ang ikatlong papel." && k1.flag, k1);

    const k2 = await page.evaluate(() => {
      Game.setHintPool(currentActData.number, [
        { slot: 1, title: "", text: "Ang unang papel." },
        { slot: 3, title: "Ikatlo", text: "Binago ng guro." },
      ]);
      return { drawn: [...document.querySelectorAll(".pickup-page")].map((e) => parseInt(e.style.left, 10)),
        book: Game.glossary() };
    });
    ok("a paper the teacher rewrites stays found, and the Talaan shows the new words",
       JSON.stringify(k2.drawn) === "[300]" && k2.book.hints.found === 1 &&
       k2.book.hints.entries[0].text === "Binago ng guro.", k2);

    const k3 = await page.evaluate(async () => {
      __DB.talaan_entries.push({ act_number: currentActData.number, slot: 2, title: "Mula sa guro", body: "Nasa itaas." });
      await Acts.loadTalaan(currentActData.number);
      return PICKUPS.filter((p) => p.type === "hint").map((p) => [p.x, p.y, p.hint]);
    });
    ok("Acts.loadTalaan reads the papers from talaan_entries and lays them",
       JSON.stringify(k3) === "[[700,155,1]]", k3);
    await ctx.close();
  }

  if (still()) { // the section above, continued
    const seed = {
      session: { user: { id: "t1" } },
      profiles: [{ id: "t1", role: "teacher", full_name: "Gng. Cruz" }],
      classes: [{ id: "c1", class_name: "MAC8-RIZAL", join_code: "R1", teacher_id: "t1" }],
      talaan_entries: [{ act_number: 1, slot: 2, title: "Luma", body: "Lumang papel." }],
    };
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });
    await page.route("**/supabaseClient.js*", (route) =>
      route.fulfill({ body: STUB, contentType: "text/javascript" }));
    await page.route("**/js/vendor/supabase.js*", (route) =>
      route.fulfill({ body: "", contentType: "text/javascript" }));
    await page.addInitScript((st) => { window.__TEST = st; }, seed);
    await page.goto("http://localhost:" + PORT + "/teacher.html");
    await page.waitForTimeout(600);

    const e0 = await page.evaluate(() => ({
      acts: [...document.querySelectorAll("#tl-act option")].map((o) => o.textContent),
      papers: [...document.querySelectorAll("#tl-list .tl-paper")].map((c) => ({
        where: c.querySelector(".tl-where").textContent,
        title: c.querySelector(".tl-title").value, text: c.querySelector(".tl-text").value })),
    }));
    ok("the dashboard offers three papers, says where each lies, and shows what is saved",
       // Block 113: Act II declares fixed papers with places, so it is offered too; Block 117: Act III;
       // Block 119: Act IV.
       e0.acts.join() === "Act I,Act II,Act III,Act IV" && e0.papers.length === 3 && e0.papers.every((p) => p.where.length > 10) &&
       e0.papers[1].title === "Luma" && e0.papers[1].text === "Lumang papel." && e0.papers[0].text === "", e0);

    const e1 = await page.evaluate(async () => {
      const cards = document.querySelectorAll("#tl-list .tl-paper");
      cards[0].querySelector(".tl-title").value = "Walang laman";
      document.getElementById("tl-save").click();
      await new Promise((r) => setTimeout(r, 200));
      const refused = { status: document.getElementById("tl-status").textContent, rows: __DB.talaan_entries.length };
      cards[0].querySelector(".tl-text").value = "Ang unang papel ng guro.";
      cards[1].querySelector(".tl-title").value = "";
      cards[1].querySelector(".tl-text").value = "";
      cards[2].querySelector(".tl-text").value = "Ang ikatlo.";
      document.getElementById("tl-save").click();
      await new Promise((r) => setTimeout(r, 300));
      return { refused, rows: __DB.talaan_entries.map((r) => [r.act_number, r.slot, r.title, r.body]).sort(),
        status: document.getElementById("tl-status").textContent };
    });
    ok("a paper with a title and no text is refused and nothing is written",
       /Paper 1/.test(e1.refused.status) && e1.refused.rows === 1, e1.refused);
    ok("saving writes the filled slots and deletes the emptied one",
       JSON.stringify(e1.rows) === JSON.stringify([[1, 1, "Walang laman", "Ang unang papel ng guro."], [1, 3, "", "Ang ikatlo."]]) &&
       /^Saved\. 2 of 3/.test(e1.status), e1);
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BD. Block 62. Pictures are asked for through one loader that
  // retries a failure that is not a 404, counts what has arrived for
  // the title screen's bar, and holds the world (and every scene change)
  // closed until the art is in. And the service worker keeps it all.
  // -------------------------------------------------------------
  if (section("BD", "Pictures that wait, retry and stay (Block 62)")) {
    // Its own context, because each check needs its routes in place
    // before the page's first request, which newPage() does not allow.
    const rawPage = async (routes, init, useCtxRoutes) => {
      const ctx = await browser.newContext({ viewport: { width: 823, height: 412 } });
      const page = await ctx.newPage();
      page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });
      const target = useCtxRoutes ? ctx : page;
      await target.route("**/supabaseClient.js*", (r) => r.fulfill({ body: STUB, contentType: "text/javascript" }));
      await target.route("**/js/vendor/supabase.js*", (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
      for (const [pattern, handler] of routes || []) await target.route(pattern, handler);
      await page.addInitScript((s) => { Object.assign(window, s); }, Object.assign({ __TEST: { session: null } }, init || {}));
      // Not "load", which waits for every picture: the checks below have
      // to look at the page while pictures are still arriving.
      await page.goto("http://localhost:" + PORT + "/index.html", { waitUntil: "domcontentloaded" });
      return { ctx, page };
    };

    // A picture that fails once, the way a bad connection drops one.
    let nanayGets = 0;
    const retry = await rawPage([["**/nanay.png*", (route) => {
      if (route.request().method() !== "GET") return route.continue();
      nanayGets++;
      return nanayGets === 1 ? route.abort("failed") : route.continue();
    }]]);
    await retry.page.waitForTimeout(2500);
    const r1 = await retry.page.evaluate(() => {
      const entry = [...assetLoads.entries()].find(([u]) => /nanay\.png/.test(u));
      return { state: entry && entry[1].state,
        boxes: [...document.querySelectorAll(".sprite-placeholder")].map((el) => el.textContent)
          .filter((t) => /nanay\.png/.test(t)).length };
    });
    // Block 78: the retry fetches the file afresh and then shows it, two
    // requests here, because Playwright's routing turns the browser's
    // cache off; on a phone the second is served from the cache.
    ok("a picture whose first download fails is asked for again and drawn",
       nanayGets >= 2 && r1.state === "ok" && r1.boxes === 0, { nanayGets, r1 });

    const r2 = await retry.page.evaluate(async () => {
      const t0 = performance.now();
      const img = await loadImage("assets/sprites/characters/nobody-drew-this.png");
      return { img, ms: performance.now() - t0 };
    });
    ok("a picture that is really missing is given up on at once, not retried",
       r2.img === null && r2.ms < 1000, r2);

    const r3 = await retry.page.evaluate(async () => {
      const a = loadImage("assets/backgrounds/act1/street-01.jpg");
      const b = loadImage("assets/backgrounds/act1/street-01.jpg");
      return a === b;
    });
    ok("the same picture asked for twice is one download", r3);
    await retry.ctx.close();

    // A slow painting: the title's bar shows it, and a student who taps
    // in early waits on a screen that says so, not on an empty road.
    const slow = await rawPage([["**/street-02.jpg*", async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      await new Promise((r) => setTimeout(r, 2500));
      return route.continue();
    }]]);
    await slow.page.waitForTimeout(500);
    const s1 = await slow.page.evaluate(() => ({
      note: document.querySelector("#shell-title .shell-loadbar-note").textContent,
      width: document.querySelector("#shell-title .shell-loadbar-fill").style.width,
      progress: Game.assetProgress(),
    }));
    ok("the title screen shows how much of the art has arrived",
       /Inihahanda ang mga larawan\.\.\. \d+%/.test(s1.note) && s1.progress.done < s1.progress.total &&
       parseFloat(s1.width) > 0 && parseFloat(s1.width) < 100, s1);
    await slow.page.click("#shell-guest");
    await slow.page.waitForTimeout(300);
    const s2 = await slow.page.evaluate(() => ({
      loading: !document.getElementById("shell-loading").classList.contains("hidden"),
      overlay: !document.getElementById("shell").classList.contains("hidden"),
      state: Shell.state,
      card: !document.getElementById("intertitle").classList.contains("hidden"),
    }));
    ok("tapping in before the art is ready waits on Sandali lang, with nothing started behind it",
       s2.loading && s2.overlay && s2.state === "loading" && !s2.card, s2);
    await slow.page.waitForTimeout(3000);
    const s3 = await slow.page.evaluate(() => ({
      overlay: !document.getElementById("shell").classList.contains("hidden"),
      state: Shell.state,
      card: !document.getElementById("intertitle").classList.contains("hidden"),
      titleFull: document.querySelector("#shell-title .shell-loadbar").classList.contains("shell-loadbar-full"),
    }));
    ok("and goes in by itself once the art is in, straight into the opening",
       !s3.overlay && s3.state === "playing" && s3.card && s3.titleFull, s3);
    await slow.ctx.close();

    // Block 78. The whole act is asked for with the act, before anyone
    // is in: the inside of the entablado, and every enemy type's sheets,
    // are loading on the title screen, so a scene change and the play's
    // fight do not wait on a download. Art that is owed is never asked
    // for at all (the sewing table's; the Mananahi's was the example until
    // Block 98, the Barbero's until 101, the karpintero's until 102).
    let owedAsks = 0;
    const whole = await rawPage([["**/tahian.png*", (route) => { owedAsks++; return route.continue(); }]]);
    await whole.page.waitForTimeout(400);
    const w1 = await whole.page.evaluate(() => {
      const state = (re) => { const e = [...assetLoads.entries()].find(([u]) => re.test(u)); return e ? e[1].state : null; };
      return { inside: state(/entablado-inside\.jpg/), sword: state(/kawal-attack\.png/),
        shot: state(/bantay-shoot\.png/), owed: state(/tahian\.png/), manifest: Array.isArray(window.ASSET_MANIFEST) };
    });
    ok("the whole act's art is asked for before the street opens: the entablado, the enemies' sheets",
       w1.manifest && w1.inside !== null && w1.sword !== null && w1.shot !== null, w1);
    ok("and art that is owed is the placeholder at once, never asked for", w1.owed === "missing" && owedAsks === 0, { w1, owedAsks });
    // Not awaited: enterAsGuest resolves only after the title's tap.
    await whole.page.evaluate(() => { Game.enterAsGuest(); });
    for (let i = 0; i < 100; i++) {
      const p = await whole.page.evaluate(() => Game.assetProgress());
      if (p.done === p.total) break;
      await whole.page.waitForTimeout(100);
    }
    await whole.page.waitForTimeout(400);
    await whole.page.evaluate(() => { Acts.gotoScene("entablado"); });
    await whole.page.waitForTimeout(2600);
    const w2 = await whole.page.evaluate(() => ({
      black: document.getElementById("blackout").classList.contains("visible"), scene: currentSceneId,
      note: document.getElementById("blackout-note").classList.contains("shown") }));
    ok("so a scene change finds its art already there, with nothing to wait on",
       !w2.black && w2.scene === "entablado" && !w2.note, w2);
    await whole.ctx.close();

    // Block 78. A picture that exists and answers 404 for a while, the
    // way GitHub Pages does while a push deploys. Before, one 404 made it
    // a box for the visit and the world opened without it. Now it is
    // waited for, however long, the loading screen says the connection is
    // slow, and Subukan ulit lets it through the moment it is back.
    let deploying = true;
    let lagAsks = 0;
    const lag = await rawPage([["**/street-02.jpg*", (route) => {
      if (route.request().method() !== "GET") return route.continue();
      lagAsks++;
      return deploying ? route.fulfill({ status: 404, body: "Not Found" }) : route.continue();
    }]]);
    await lag.page.waitForTimeout(300);
    await lag.page.evaluate(() => { Shell.ASSET_STALL_MS = 600; });
    await lag.page.click("#shell-guest");
    await lag.page.waitForTimeout(2600);
    const g1 = await lag.page.evaluate(() => {
      const e = [...assetLoads.entries()].find(([u]) => /street-02\.jpg/.test(u));
      return { state: e && e[1].state, shell: Shell.state,
        slow: !document.getElementById("shell-loading-slow").classList.contains("hidden"),
        retry: !document.getElementById("shell-loading-retry").classList.contains("hidden"),
        card: !document.getElementById("intertitle").classList.contains("hidden") };
    });
    ok("a picture that exists and answers 404 is waited for, not given up on, and nobody goes in",
       g1.state === "pending" && g1.shell === "loading" && !g1.card && lagAsks >= 2, { g1, lagAsks });
    ok("when nothing arrives for a while, the screen says the connection is slow and offers Subukan ulit",
       g1.slow && g1.retry, g1);
    deploying = false;
    await lag.page.click("#shell-loading-retry");
    for (let i = 0; i < 40 && (await lag.page.evaluate(() => Shell.state)) !== "playing"; i++) await lag.page.waitForTimeout(100);
    const g2 = await lag.page.evaluate(() => {
      const e = [...assetLoads.entries()].find(([u]) => /street-02\.jpg/.test(u));
      return { state: e && e[1].state, shell: Shell.state, pending: Game.assetProgress() };
    });
    ok("Subukan ulit tries at once, and once it is back he goes in with every picture there",
       g2.state === "ok" && g2.shell === "playing" && g2.pending.done === g2.pending.total, g2);
    await lag.ctx.close();

    // The service worker, allowed on localhost for this check only.
    const sw = await rawPage([], { __SW_TEST: true }, true);
    const reg = await sw.page.evaluate(async () => {
      const r = await Promise.race([navigator.serviceWorker.ready.then(() => true),
        new Promise((res) => setTimeout(() => res(false), 5000))]);
      return r;
    });
    ok("the service worker registers", reg);
    await sw.page.reload();
    await sw.page.waitForTimeout(1500);
    const c1 = await sw.page.evaluate(async () => {
      const keys = (await (await caches.open("macario-v1")).keys()).map((r) => r.url.replace(location.origin, ""));
      return {
        controlled: Boolean(navigator.serviceWorker.controller),
        street: keys.some((k) => /street-01\.jpg\?v=\d+$/.test(k)),
        game: keys.some((k) => /js\/game\.js\?v=\d+$/.test(k)),
        page: keys.some((k) => /index\.html$/.test(k)),
        stub: keys.filter((k) => /cdn\.jsdelivr/.test(k)).length,
      };
    });
    ok("once it controls the page, the versioned files and the page itself are kept",
       c1.controlled && c1.street && c1.game && c1.page, c1);
    const c2 = await sw.page.evaluate(async () => {
      const cache = await caches.open("macario-v1");
      await cache.put("/assets/backgrounds/act1/street-01.jpg?v=1",
        new Response("old", { headers: { "Content-Type": "image/jpeg" } }));
      await cache.delete(new Request(location.origin + "/" + assetUrl("assets/backgrounds/act1/street-01.jpg")));
      await fetch(assetUrl("assets/backgrounds/act1/street-01.jpg"));
      await new Promise((r) => setTimeout(r, 300));
      const keys = (await cache.keys()).map((r) => r.url).filter((u) => /street-01\.jpg/.test(u));
      return keys.map((u) => u.replace(location.origin, ""));
    });
    ok("storing a new version of a file drops the older one",
       c2.length === 1 && /v=\d\d+$/.test(c2[0]), c2);

    // Block 105. The whole game kept after one visit, and said so.
    for (let i = 0; i < 600 && !(await sw.page.evaluate(() => Game.offlineStatus().ready)); i++) {
      await sw.page.waitForTimeout(100);
    }
    const k1 = await sw.page.evaluate(async () => {
      const keys = new Set((await (await caches.open("macario-v1")).keys()).map((r) => r.url));
      const want = (window.ASSET_MANIFEST || []).filter((f) => /\.(png|jpe?g|mp3|wav)$/i.test(f) && !/-still\.png$/.test(f))
        .map((f) => new URL(assetUrl(f), document.baseURI).href);
      const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src);
      const line = document.getElementById("shell-offline");
      return {
        status: Game.offlineStatus(),
        missing: want.concat(scripts).filter((u) => !keys.has(u)).map((u) => u.replace(location.origin, "")),
        pictures: want.length,
        vendor: [...keys].some((u) => /js\/vendor\/supabase\.js\?v=\d+$/.test(u)),
        fonts: [...keys].filter((u) => /\.woff2\?v=\d+$/.test(u)).length,
        page: keys.has(new URL("./", location.href).href),
        line: line && !line.classList.contains("hidden") && line.classList.contains("ok") ? line.textContent : null,
      };
    });
    ok("after one visit every picture, sound, script, font and the page itself are kept on the phone",
       k1.status.ready && k1.missing.length === 0 && k1.pictures > 50 && k1.vendor && k1.fonts === 2 && k1.page,
       Object.assign({}, k1, { missing: k1.missing.slice(0, 8) }));
    ok("the title screen says the game is ready with no internet",
       k1.line === "Nakahanda na ang laro kahit walang internet.", k1.line);

    // The road and the default backdrop are drawn from the very URL the
    // loader waited for and the worker kept; the stylesheet names none.
    const road = await sw.page.evaluate(async () => {
      const css = await (await fetch(document.querySelector('link[rel="stylesheet"]').href)).text();
      return {
        ground: getComputedStyle(document.getElementById("ground-tiles")).backgroundImage,
        cssPictures: (css.match(/url\(["']?\.\.\/assets\/[^)]*\.(png|jpe?g)/g) || []),
      };
    });
    ok("the road is drawn from the versioned picture, and the stylesheet names no picture of its own",
       /ground-lupa\.jpg\?v=\d+/.test(road.ground) && road.cssPictures.length === 0, road);

    // Block 106. Each file carries its own fingerprint, so a phone asks
    // again only for what changed; a file the manifest does not list
    // falls back to ASSET_VERSION.
    const prints = await sw.page.evaluate(() => {
      const v = (u) => assetUrl(u).split("v=")[1];
      return { a: v("assets/backgrounds/act1/street-01.jpg"), b: v("assets/backgrounds/act1/street-02.jpg"),
               listed: ASSET_VERSIONS["assets/backgrounds/act1/street-01.jpg"],
               other: v("assets/nobody-drew-this.png"), fallback: String(ASSET_VERSION) };
    });
    ok("every file is asked for by its own fingerprint from the manifest",
       prints.a === prints.listed && prints.a !== prints.b && prints.other === prints.fallback, prints);

    // A connection that is up but crawling: the page waits about three
    // seconds for the network and then opens from the phone.
    await sw.ctx.route("**/index.html*", async (route) => {
      await new Promise((r) => setTimeout(r, 20000));
      route.continue().catch(() => {});
    });
    const t0 = Date.now();
    await sw.page.reload({ waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
    const crawl = { ms: Date.now() - t0, game: await sw.page.evaluate(() => typeof window.Game === "object").catch(() => false) };
    ok("on a crawling connection the page opens from the phone after a few seconds, not a minute",
       crawl.game && crawl.ms < 8000, crawl);
    await sw.ctx.unroute("**/index.html*");

    await sw.ctx.setOffline(true);
    await sw.page.reload();
    await sw.page.waitForTimeout(1500);
    const off = await sw.page.evaluate(async () => ({
      game: typeof window.Game === "object",
      title: !document.getElementById("shell-title").classList.contains("hidden"),
      street: await loadImage("assets/backgrounds/act1/street-02.jpg").then((i) => Boolean(i)),
    }));
    ok("with the connection gone, the page, the engine and its pictures still open from the phone",
       off.game && off.title && off.street, off);

    // Music and sounds are played in parts (Range); with the connection
    // gone, the parts are cut from the kept file.
    const part = await sw.page.evaluate(async () => {
      const url = assetUrl("assets/audio/music/calm.mp3");
      const res = await fetch(url, { headers: { Range: "bytes=100-199" } });
      const tail = await fetch(url, { headers: { Range: "bytes=-10" } });
      return { status: res.status, bytes: (await res.arrayBuffer()).byteLength,
               range: res.headers.get("Content-Range"), tail: tail.status,
               tailBytes: (await tail.arrayBuffer()).byteLength };
    });
    ok("a part of a kept sound is answered from the phone, the part asked for",
       part.status === 206 && part.bytes === 100 && /^bytes 100-199\/\d+$/.test(part.range) &&
       part.tail === 206 && part.tailBytes === 10, part);

    // A presentation with no internet: play as a guest, into the world,
    // every picture there and the road drawn.
    await sw.page.click("#shell-guest");
    for (let i = 0; i < 100 && (await sw.page.evaluate(() => Shell.state)) !== "playing"; i++) await sw.page.waitForTimeout(100);
    const guest = await sw.page.evaluate(() => ({
      shell: Shell.state,
      progress: Game.assetProgress(),
      failed: [...assetLoads.entries()].filter(([, e]) => e.state !== "ok").map(([u, e]) => u + " " + e.state)
        .filter((s) => !/ missing$/.test(s)),
      boxes: [...document.querySelectorAll(".sprite-placeholder")].map((el) => el.textContent)
        .filter((t) => !/silya-barbero|tahian|pulungan/.test(t)),
      line: document.getElementById("shell-offline").textContent,
    }));
    ok("with no internet a guest goes into the world with every picture there",
       guest.shell === "playing" && guest.progress.done === guest.progress.total &&
       guest.failed.length === 0 && guest.boxes.length === 0, guest);
    await sw.ctx.close();

    // Block 105. Nothing the game loads comes from another site but
    // Supabase itself: the library is the site's own file now.
    const hosts = new Set();
    const far = await rawPage([]);
    far.page.on("request", (req) => {
      const u = new URL(req.url());
      if (u.hostname !== "localhost" && !/\.supabase\.co$/.test(u.hostname)) hosts.add(u.hostname);
    });
    await far.page.reload();
    await far.page.waitForTimeout(2500);
    ok("the game asks nothing of any other site", hosts.size === 0, [...hosts]);
    await far.ctx.close();
  }

  if (section("BL", "Guards take blows the way the enemies do (Block 75)")) {
    // Against the fixture guard (no sheets of his own), with the loop
    // paused and every step driven by hand.
    const { ctx, page } = await enterTestRoom();
    const r = await page.evaluate(() => {
      setPaused(true);
      destroyProjectile();
      const g = GUARDS[0];
      const stand = () => {
        g.disabled = false; g.shoots = true; g.hostile = true; g.hp = 2; g.alert = 1;
        g.knockVel = 0; g.staggerUntil = 0; g.facing = -1; g.patrolFrom = g.patrolTo = g.pos;
        drawGuard(g);
      };
      stand();
      posX = g.pos - 60; facing = 1; posY = floorHeightAt(posX); onGround = true;
      health = maxHealth; invulnUntil = 0;

      // A punch: a slide, not a jump; a flash; a stagger.
      const x0 = g.pos;
      meleeAttack();
      const first = g.pos - x0;
      const flashed = g.el.classList.contains("guard-hit");
      const staggered = g.staggerUntil > performance.now() && g.hp === 1;
      const kept = g.knockVel;
      g.knockVel = 0; g.nextShotAt = 0;
      const before = { pos: g.pos, bullets: GUARD_BULLETS.length };
      updateHostileGuard(g, 1, performance.now());
      const held = g.pos === before.pos && GUARD_BULLETS.length === before.bullets;
      g.knockVel = kept;
      for (let i = 0; i < 90; i++) updateKnockback(1);
      const slid = g.pos - x0;

      // A real shot, travelling right, drops him: he slides and topples
      // that way, then fades.
      stand();
      const x1 = g.pos;
      posX = g.pos - 220; facing = 1;
      throwProjectile();
      for (let i = 0; i < 120 && projectile; i++) updateProjectile(1);
      const shot = { disabled: g.disabled, down: g.el.classList.contains("guard-down"),
        right: g.el.classList.contains("guard-fall-right"), left: g.el.classList.contains("guard-fall-left"),
        forward: g.fellForward };
      for (let i = 0; i < 90; i++) updateKnockback(1);
      const koSlide = g.pos - x1;
      const fades = getComputedStyle(g.el).transitionProperty.includes("opacity");

      // A takedown from behind topples him away from Macario too.
      stand();
      g.hostile = false; g.alert = 0; g.facing = 1;
      posX = g.pos - 40; facing = 1;
      meleeAttack();
      const takedown = { disabled: g.disabled, right: g.el.classList.contains("guard-fall-right"), forward: g.fellForward };

      // Stood up again, the fall is gone.
      stand();
      const revived = !["guard-down", "guard-fall-right", "guard-fall-left"].some((c) => g.el.classList.contains(c));
      setPaused(false);
      return { first, flashed, staggered, held, slid, shot, koSlide, fades, takedown, revived };
    });
    ok("a punch sends a hostile guard sliding, not jumping: 10px at the blow",
       Math.abs(r.first - 10) < 0.01, r);
    ok("and about the enemies' 45px in all", r.slid > 40 && r.slid < 48, r);
    ok("he flashes, and reels: neither walking nor firing while he staggers",
       r.flashed && r.staggered && r.held, r);
    ok("a shot drops him, toppling the way it travelled",
       r.shot.disabled && r.shot.down && r.shot.right && !r.shot.left && !r.shot.forward, r.shot);
    ok("he slides further as he falls, and fades", r.koSlide > 55 && r.fades, r);
    ok("a takedown from behind topples him forward, away from Macario, as he stood",
       r.takedown.disabled && r.takedown.right && r.takedown.forward, r.takedown);
    ok("a guard stood up again loses the fall", r.revived, r);
    await ctx.close();
  }

  if (section("BM", "The enemy catalogue, and one way of taking a blow (Block 76)")) {
    const { ctx, page } = await enterTestRoom();
    const r = await page.evaluate(() => {
      setPaused(true);
      const warned = [];
      const warn = console.warn;
      console.warn = (m) => warned.push(String(m));
      window.ENEMY_TYPES = Object.assign({}, window.ENEMY_TYPES, {
        // Made up here, with no art: a new kind of fighter nobody wrote
        // any code for, and a guard type.
        tulisan: { kind: "enemy", hp: 3, speed: 1 },
        sentinel: { kind: "guard", shoots: true, hp: 2, detectRadius: 222 },
      });
      const merged = withEnemyType({ type: "sentinel", id: "s", x: 10, detectRadius: 300 }, "guard");
      const plain = { id: "p", x: 5 };
      const untyped = withEnemyType(plain, "guard");
      const unknown = withEnemyType({ type: "nowhere", id: "u", x: 5 }, "enemy");
      const wrongKind = withEnemyType({ type: "sentinel", id: "w", x: 5 }, "enemy");
      console.warn = warn;

      // The made-up fighter, placed by type, takes a blow like any enemy.
      destroyProjectile();
      spawnEnemies([{ type: "tulisan", id: "t1", x: posX + 200 }]);
      const e = ENEMIES.find((x) => x.id === "t1");
      const built = { kind: e.kind, hp: e.hp, placeholder: e.spriteEl.classList.contains("sprite-placeholder") };
      const x0 = e.pos;
      takeBlow(e, 1, 1);
      const first = e.pos - x0;
      const flashed = e.el.classList.contains("enemy-hit");
      for (let i = 0; i < 90; i++) updateKnockback(1);
      const slid = e.pos - x0;
      takeBlow(e, 2, 1);
      const down = { dead: e.dead, cls: e.el.className };
      const guard = GUARDS[0].kind;
      setPaused(false);
      return { merged: { hp: merged.hp, radius: merged.detectRadius, shoots: merged.shoots, id: merged.id },
        untypedSame: untyped === plain, unknownSame: unknown.type === "nowhere" && !unknown.hp,
        wrongKindSame: !wrongKind.detectRadius, warned, built, first, flashed, slid, down, guard };
    });
    ok("a placed enemy takes its type's fields, its own winning",
       r.merged.hp === 2 && r.merged.shoots === true && r.merged.radius === 300 && r.merged.id === "s", r.merged);
    ok("a placement with no type is used as it stands", r.untypedSame);
    ok("an unknown type, or one of the other kind, is said in the console and not merged",
       r.unknownSame && r.wrongKindSame && r.warned.length === 2 &&
       /Unknown enemy type: nowhere/.test(r.warned[0]) && /is a guard, placed as a enemy/.test(r.warned[1]), r);
    ok("a new type with no art is built as an enemy with its hp, as a placeholder box",
       r.built.kind === "enemy" && r.built.hp === 3 && r.built.placeholder, r.built);
    ok("and takes a blow with no code of its own: the flash and the slide",
       r.flashed && Math.abs(r.first - 10) < 0.01 && r.slid > 40 && r.slid < 48, r);
    ok("and at no hp topples the way the blow went, and fades",
       r.down.dead && /enemy-down/.test(r.down.cls) && /enemy-fall-right/.test(r.down.cls), r.down);
    ok("guards and enemies are told apart by kind", r.guard === "guard");
    await ctx.close();
  }

  if (section("BN", "The dash reaches the Test Room's guards (Block 87)")) {
    const { ctx, page } = await enterTestRoom();
    const r = await page.evaluate(() => new Promise((resolve) => {
      GUARDS.forEach((g) => { g.disabled = true; });
      const g = GUARDS[0];
      g.disabled = false; g.hp = 2; g.maxHp = 2;
      posX = 400; posY = floorHeightAt(posX); onGround = true; facing = 1;
      g.pos = 400 + PLAYER_WIDTH / 2 + 120 - GUARD_WIDTH / 2;
      g.staggerUntil = 0;
      becomeHostile(g, performance.now());
      g.nextShotAt = performance.now() + 1e9;
      invulnUntil = performance.now() + 1e9;
      const start = posX;
      playMelee();
      const timer = setInterval(() => {
        if (dash) return;
        clearInterval(timer);
        resolve({ start, end: posX, hp: g.hp, gc: g.pos + GUARD_WIDTH / 2, pw: PLAYER_WIDTH });
      }, 10);
    }));
    ok("a hostile guard ahead is dashed through, and takes the blow", r.hp === 1 && r.end - r.start > 100, r);
    ok("and Macario ends on the far side of him", r.end + r.pw / 2 > r.gc + 40, r);

    // A scripted fight with a guard-kind body: aware from the start, and
    // the fight is over when he is down.
    const fight = await page.evaluate(async () => {
      GUARDS.forEach((g) => { g.disabled = true; });
      let over = false;
      posX = 400; facing = 1;
      spawnEnemies([{ type: "bantay", id: "fight-1", x: 700 }]).then(() => { over = true; });
      const g = GUARDS.find((x) => x.id === "fight-1");
      const state = { hostile: g.hostile, fight: g.fight, alive: enemiesAlive(), facing: g.facing };
      knockOut(g, 1);
      await new Promise((r) => setTimeout(r, FIGHT_END_BEAT_MS + 300));
      return Object.assign(state, { over, aliveAfter: enemiesAlive() });
    });
    ok("a guard-kind type spawned in a fight is hostile at once, no meter to fill",
       fight.hostile && fight.fight && fight.alive, fight);
    ok("and beating him ends the fight like any other", fight.over && !fight.aliveAfter, fight);
    await ctx.close();
  }

  if (section("BO", "The work game and a gift that costs (Block 89)")) {
    const { ctx, page } = await enterTestRoom();
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));
      const out = {};
      // Leaving early pays nothing: -1, and the world is his again.
      let result = null;
      playWorkGame({ title: "Pagsubok", hint: "x", verb: "Sige", rounds: 3 }).then((n) => { result = n; });
      await wait(100);
      out.up = !document.getElementById("work-screen").classList.contains("hidden");
      out.blocked = uiBlocked;
      out.title = document.getElementById("work-title").textContent;
      document.getElementById("work-stop").click();
      await wait(60);
      out.early = result;
      out.free = !uiBlocked;
      // Three strokes end it, and it resolves with the good ones.
      result = null;
      playWorkGame({ title: "Pagsubok", hint: "x", verb: "Sige", rounds: 3 }).then((n) => { result = n; });
      await wait(100);
      for (let i = 0; i < 3; i++) document.getElementById("work-hit").click();
      out.label = document.querySelector("#work-hit .lbl").textContent;
      document.getElementById("work-hit").click();
      await wait(60);
      out.done = result;
      // A gift that asks for money is not offered until he has it.
      const npc = { gift: { requiresFlag: "f", givenFlag: "g", requiresCurrency: 100 } };
      state.flags.f = true; state.flags.g = false;
      currency = 99;
      out.poor = canGiveGift(npc);
      currency = 100;
      out.rich = canGiveGift(npc);
      return out;
    });
    ok("the work game opens, blocks the world and takes its title", r.up && r.blocked && r.title === "Pagsubok", r);
    ok("leaving before the last stroke resolves -1 and frees him", r.early === -1 && r.free, r);
    ok("the last stroke turns the button to Tapos na, and closing resolves with the good ones", r.label === "Tapos na" && r.done >= 0 && r.done <= 3, r);
    ok("a gift that asks for barya waits until he holds them", r.poor === false && r.rich === true, r);
    await ctx.close();
  }

  if (section("BP", "The dash is plain to see, and warned (Block 92)")) {
    const { ctx, page } = await enterTestRoom();
    const r = await page.evaluate(() => new Promise((resolve) => {
      GUARDS.forEach((g) => { g.disabled = true; });
      posX = 400; posY = floorHeightAt(posX); onGround = true; facing = 1;
      health = maxHealth; invulnUntil = performance.now() + 1e9;
      spawnEnemies([{ id: "w1", x: 400 + PLAYER_WIDTH / 2 + 200 - ENEMY_WIDTH / 2, hp: 2, img: "assets/Kaaway.png" }]);
      const e = ENEMIES[ENEMIES.length - 1];
      const t0 = performance.now();
      let tellAt = 0, moveAt = 0, sign = null, p0 = null, maxMove = 0, lastMoveAt = 0;
      const timer = setInterval(() => {
        const now = performance.now() - t0;
        if (e.nextSwingAt && !tellAt) {
          tellAt = now; p0 = e.pos;
          sign = getComputedStyle(e.el, "::after").content;
        }
        // Block 93. Measured while the dash is under way only: after it
        // he moves again (backing off, shuffling), which is not the dash.
        if (p0 !== null && (e.dash || !moveAt)) {
          const moved = Math.abs(e.pos - p0);
          if (moved > 3 && !moveAt) moveAt = now;
          if (moved > maxMove) { maxMove = moved; lastMoveAt = now; }
        }
        if (now > 1500) {
          clearInterval(timer);
          resolve({ tellAt, moveAt, sign, maxMove, dashMs: lastMoveAt - moveAt, tellMs: moveAt - tellAt, range: ENEMY_COMMIT_RANGE, dist: ENEMY_DASH_DISTANCE });
        }
      }, 8);
    }));
    ok("an enemy 200px off already decides (the commit range is longer than it was)", r.tellAt > 0 && r.range >= 230, r);
    ok("with a red ! over its head while it winds up", r.sign === '"!"', r);
    ok("then dashes most of its length in a fifth of a second: nobody can miss it", r.maxMove >= 190 && r.dashMs <= 320, r);
    ok("after a tell of about a quarter of a second", r.tellMs >= 200 && r.tellMs <= 500, r);
    await ctx.close();
  }

  if (section("BQ", "Enemies move between blows, and hop over him (Block 93)")) {
    const { ctx, page } = await enterTestRoom();
    const r = await page.evaluate(() => new Promise((resolve) => {
      GUARDS.forEach((g) => { g.disabled = true; });
      posX = 1400; posY = floorHeightAt(posX); onGround = true; facing = 1;
      health = maxHealth; invulnUntil = performance.now() + 1e9;
      spawnEnemies([{ id: "m1", x: 1400 + PLAYER_WIDTH / 2 + 200 - ENEMY_WIDTH / 2, hp: 2, img: "assets/Kaaway.png" }]);
      const e = ENEMIES[ENEMIES.length - 1];
      const out = { coolMoves: 0, coolSamples: 0, hop: null, lift: 0 };
      const random = Math.random;
      const t0 = performance.now();
      const timer = setInterval(() => {
        const now = performance.now();
        const dist = Math.abs(posX + PLAYER_WIDTH / 2 - (e.pos + ENEMY_WIDTH / 2));
        // Cooling down after the first dash, he is not a statue.
        if (e.swings === 1 && !e.dash && !e.hop && now < e.cooldownUntil && !e.nextSwingAt && e.facing === Math.sign(posX - e.pos)) {
          out.coolSamples++;
          if (e.walking) out.coolMoves++;
          if (out.firstDist === undefined) out.firstDist = dist;
          out.maxDist = Math.max(out.maxDist || 0, dist);
        }
        // After that first strike every decision is a hop, to see one.
        if (e.swings >= 1 && !out.hop) Math.random = () => 0;
        if (e.hop && !out.hop) out.hop = { from: e.pos, player: posX + PLAYER_WIDTH / 2, side0: Math.sign(e.pos + ENEMY_WIDTH / 2 - (posX + PLAYER_WIDTH / 2)) };
        if (e.hop) out.lift = Math.max(out.lift, parseFloat(e.el.style.marginBottom) || 0);
        if (out.hop && !e.hop && out.side1 === undefined) {
          out.side1 = Math.sign(e.pos + ENEMY_WIDTH / 2 - (posX + PLAYER_WIDTH / 2));
          out.landGap = Math.abs(e.pos + ENEMY_WIDTH / 2 - (posX + PLAYER_WIDTH / 2));
          out.healthAfterHop = health;
        }
        if (out.side1 !== undefined && e.nextSwingAt) out.struckAfter = true;
        if (now - t0 > 6000 || out.struckAfter) {
          clearInterval(timer);
          Math.random = random;
          resolve(out);
        }
      }, 16);
    }));
    ok("cooling down within reach, he keeps moving: he backs off from Macario rather than standing",
       r.coolSamples > 5 && r.coolMoves / r.coolSamples > 0.5 && r.maxDist > r.firstDist + 40, r);
    ok("after his first strike he may hop over Macario instead, high over his head",
       r.hop && r.lift > 100, r);
    ok("he lands on Macario's other side, about 90px beyond him, having hurt nobody",
       r.hop && r.side1 === -r.hop.side0 && Math.abs(r.landGap - 90) < 25 && r.healthAfterHop === 3, r);
    ok("and then strikes from there, with the usual red !", r.struckAfter === true, r);
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BS. Block 120: decoys an enemy goes for when one is nearer than
  // Macario (the scarecrows, the flag), a decoy that holds and loses the
  // wave when it falls, a fight that moves (advanceTo), and the guards on
  // duty roused into a fight.
  // -------------------------------------------------------------
  if (section("BS", "Decoys, a fight that moves, and guards roused (Block 120)")) {
    const { ctx, page } = await enterTestRoom();
    const d = await page.evaluate(() => new Promise((resolve) => {
      GUARDS.forEach((g) => { g.disabled = true; });
      // The test room has nobody in it: a body of straw, as a scene would
      // build one (buildNpcs), to be the decoy.
      const el = document.createElement("div");
      el.className = "entity";
      el.id = "npc-straw";
      mountBody(el, 400, NPC_WIDTH);
      world.appendChild(el);
      actElements.push(el);
      NPCS.push({ id: "straw", x: 400, label: "Straw", scenery: true, hidden: false, dialogueSets: [] });
      const npc = NPCS.find((n) => n.id === "straw");
      const side = npc.x + 900 < WORLD_WIDTH - 100 ? 1 : -1;
      const centre = npc.x + NPC_WIDTH / 2;
      posX = npc.x + side * 900; posY = floorHeightAt(posX); onGround = true;
      health = maxHealth; invulnUntil = performance.now() + 1e9;
      setDecoys([{ id: npc.id, hp: 2 }]);
      spawnEnemies([{ id: "dc1", x: centre + side * 300 - ENEMY_WIDTH / 2, hp: 2, img: "assets/Kaaway.png" }]);
      const e = ENEMIES[ENEMIES.length - 1];
      const out = { npc: npc.id, target: null, hits: 0 };
      const t0 = performance.now();
      const timer = setInterval(() => {
        if (e.target && !out.target) out.target = e.target.id;
        out.hits = DECOYS[0].maxHp - DECOYS[0].hp;
        if (DECOYS[0].down && !out.downAt) out.downAt = performance.now();
        // A frame or two after it falls, so he has chosen again.
        if ((out.downAt && performance.now() - out.downAt > 150) || performance.now() - t0 > 8000) {
          clearInterval(timer);
          out.down = DECOYS[0].down;
          out.drawnDown = DECOYS[0].el.classList.contains("decoy-down");
          out.health = health;
          out.after = e.target ? e.target.id : null;
          hitEnemy(e, 99);
          setDecoys(null);
          resolve(out);
        }
      }, 16);
    }));
    ok("an enemy nearer a decoy than Macario goes for it", d.target === d.npc, d);
    ok("his dash hits it; two blows and it topples, and stays drawn down", d.down && d.hits === 2 && d.drawnDown, d);
    ok("Macario, far off, was never touched; a fallen decoy is passed over", d.health === 3 && d.after === null, d);

    const h = await page.evaluate(() => new Promise((resolve) => {
      const npc = NPCS.find((n) => n.id === "straw");
      const side = npc.x + 900 < WORLD_WIDTH - 100 ? 1 : -1;
      const centre = npc.x + NPC_WIDTH / 2;
      posX = npc.x + side * 900; posY = floorHeightAt(posX); onGround = true;
      document.getElementById("npc-straw").classList.remove("decoy-down");
      setDecoys([{ id: npc.id, hp: 1, holds: true, fallText: "Bumagsak!" }]);
      let respawns = 0;
      const real = window.respawnInScene;
      window.respawnInScene = () => { respawns++; real(); };
      spawnEnemies([{ id: "dc2", x: centre + side * 300 - ENEMY_WIDTH / 2, hp: 2, img: "assets/Kaaway.png" }]);
      const e = ENEMIES[ENEMIES.length - 1];
      const t0 = performance.now();
      const timer = setInterval(() => {
        if (respawns || performance.now() - t0 > 6000) {
          clearInterval(timer);
          window.respawnInScene = real;
          const out = { respawns, standing: !DECOYS[0].down && DECOYS[0].hp === 1,
            drawnUp: !DECOYS[0].el.classList.contains("decoy-down"),
            enemyBack: Math.round(e.pos) === Math.round(e.x), x: Math.round(posX), want: respawnX(currentScene) };
          hitEnemy(e, 99);
          setDecoys(null);
          resolve(out);
        }
      }, 16);
    }));
    ok("a decoy that holds and falls loses the wave: Macario back, the enemy back, the decoy standing again",
       h.respawns === 1 && h.standing && h.drawnUp && h.enemyBack && h.x === h.want, h);

    const a = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 700)); // the fight's end beat
      posX = 600; posY = floorHeightAt(posX); onGround = true;
      let done = false;
      advanceTo(900, "Sumulong: pumunta sa kanan").then(() => { done = true; });
      await new Promise((r) => setTimeout(r, 200));
      const shown = document.querySelector("#quest-list li.quest-way");
      const out = { line: shown && shown.textContent, waiting: !done };
      posX = 900;
      await new Promise((r) => setTimeout(r, 200));
      out.done = done;
      out.gone = !document.querySelector("#quest-list li.quest-way");
      return out;
    });
    ok("a fight that moves says where to at the top of the log, and goes on once he is there",
       a.line === "Sumulong: pumunta sa kanan" && a.waiting && a.done && a.gone, a);

    // Block 121. The direction is the content's, not read from where he
    // stands: past the point already, it goes on at once; past it the
    // other way, it waits for him to come right, however far left he goes.
    const past = await page.evaluate(async () => {
      posX = 1100; posY = floorHeightAt(posX); onGround = true;
      let done = false;
      advanceTo(900, "Sumulong: pumunta sa kanan", 1).then(() => { done = true; });
      await new Promise((r) => setTimeout(r, 50));
      const out = { pastDone: done, noLine: !document.querySelector("#quest-list li.quest-way") };
      posX = 600;
      let right = false;
      advanceTo(900, "Sumulong: pumunta sa kanan", 1).then(() => { right = true; });
      posX = 100; // further from it, to the left
      await new Promise((r) => setTimeout(r, 200));
      out.waitsLeft = !right;
      out.line = (document.querySelector("#quest-list li.quest-way") || {}).textContent;
      posX = 950;
      await new Promise((r) => setTimeout(r, 200));
      out.rightDone = right;
      return out;
    });
    ok("advanceTo with him already past the point goes on at once, with no line (Block 121)",
       past.pastDone && past.noLine, past);
    ok("and one he is behind waits for him to go right, not back, even as he goes further left",
       past.waitsLeft && past.line === "Sumulong: pumunta sa kanan" && past.rightDone, past);

    const g = await page.evaluate(() => {
      const guard = GUARDS[0];
      guard.disabled = false; guard.hostile = false; guard.fight = false; guard.alert = 0;
      const before = enemiesAlive();
      rouseGuards();
      const out = { before, fight: guard.fight, hostile: guard.hostile, shoots: guard.shoots, alert: guard.alert,
        alive: enemiesAlive() };
      guard.disabled = true;
      return out;
    });
    ok("the guards on duty roused: hostile, firing, and counted in the fight",
       !g.before && g.fight && g.hostile && g.shoots && g.alert === 1 && g.alive, g);
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BR. The Scan list's engine fixes (TRACKER.md, 2 Oct 2026): one save
  // at a time (S9), a script that throws (S8), the shop button only with
  // something for sale (S6), and ?dev=1 with a student signed in (S5).
  // -------------------------------------------------------------
  if (section("BR", "Scan fixes: saves in order, a failed script, the shop button, ?dev=1")) {
    const { ctx, page } = await enterTestRoom();
    const saves = await page.evaluate(async () => {
      const count = () => __CALLS.filter((c) => c.table === "game_progress" && c.op === "upsert").length;
      await saveProgress();
      const before = count();
      const p1 = saveProgress();
      await Promise.resolve(); // p1 has started and is in flight
      const p2 = saveProgress();
      const p3 = saveProgress();
      state.flags.__scanS9 = true; // changed while the first is in flight
      await p3;
      const row = __DB.game_progress.find((r) => r.student_id === "u1");
      return { shared: p2 === p3, first: p1 !== p2, writes: count() - before,
        latest: Boolean(row && row.save_state.flags.__scanS9) };
    });
    ok("saves asked for while one is in flight wait, and share one save after it (S9)",
       saves.shared && saves.first && saves.writes === 2 && saves.latest, saves);

    // Block 121. A save that fails (the classroom's wifi) is still owed,
    // and the ten second autosave sends it; the first version cleared the
    // flag before the write and never tried again.
    const retry = await page.evaluate(async () => {
      const orig = console.error;
      console.error = () => {};
      const realFrom = sb.from;
      let fails = 1;
      sb.from = function (table) {
        if (table === "game_progress" && fails > 0) {
          fails--;
          return { upsert: () => Promise.resolve({ error: { message: "simulated" } }) };
        }
        return realFrom.call(sb, table);
      };
      // The stub keeps the payload by reference, so a write is counted by
      // the calls that reached it, not read back from the row.
      const writes = () => __CALLS.filter((c) => c.table === "game_progress" && c.op === "upsert").length;
      const before = writes();
      saveDirty = true;
      await saveProgress();
      const out = { dirtyAfterFail: saveDirty, failedWrites: writes() - before };
      const t0 = performance.now();
      while (writes() === before && performance.now() - t0 < 11500) {
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 50));
      sb.from = realFrom;
      console.error = orig;
      return Object.assign(out, { sent: writes() - before, dirtyNow: saveDirty,
        waitedMs: Math.round(performance.now() - t0) });
    });
    ok("a failed save stays owed, and the autosave sends it (Block 121)",
       retry.dirtyAfterFail && retry.failedWrites === 0 && retry.sent === 1 && !retry.dirtyNow, retry);
    const stopped = await page.evaluate(async () => {
      const realFrom = sb.from;
      const realReady = saveReady;
      sb.from = function (table) {
        if (table === "game_progress") {
          return { upsert: () => { stopSaving(); return Promise.resolve({ error: { message: "simulated" } }); } };
        }
        return realFrom.call(sb, table);
      };
      const orig = console.error;
      console.error = () => {};
      saveDirty = true;
      await saveProgress();
      const out = { dirty: saveDirty };
      sb.from = realFrom;
      console.error = orig;
      // The room goes on being tested: saving back on, as the login left it.
      saveReady = realReady;
      autosaveTimer = setInterval(() => { if (saveDirty) saveProgress(); }, 10000);
      return out;
    });
    ok("but a save that fails after the reset has stopped saving stays stopped",
       stopped.dirty === false, stopped);

    const script = await page.evaluate(async () => {
      const orig = console.error;
      console.error = () => {};
      currentScene.scripts = [{ doneFlag: "__scanS8", run: async () => {
        setCutscene(true);
        await playDialogue([{ speaker: "Pagsubok", text: "Isa." }]).catch(() => {});
      } }];
      const p = runSceneScript();
      await new Promise((r) => setTimeout(r, 100));
      const frozen = cutscenePlaying && inDialogue;
      currentScene.scripts[0].run = async () => { setCutscene(true); throw new Error("sinadya"); };
      inDialogue = false; dialogueBox.classList.add("hidden"); setCutscene(false);
      await runSceneScript();
      console.error = orig;
      return { frozen, cut: cutscenePlaying, open: inDialogue, done: Boolean(state.flags.__scanS8) };
    });
    ok("a scene script that throws hands the world back, the beat not counted (S8)",
       !script.cut && !script.open && !script.done, script);

    const shop = await page.evaluate(async () => {
      const shown = () => !document.getElementById("btn-shop").classList.contains("hidden");
      await new Promise((r) => setTimeout(r, 100));
      const withStock = shown();
      const prices = ITEMS.map((it) => it.price);
      ITEMS.forEach((it) => { it.price = 0; });
      await new Promise((r) => setTimeout(r, 150));
      const without = shown();
      ITEMS.forEach((it, i) => { it.price = prices[i]; });
      await new Promise((r) => setTimeout(r, 150));
      return { withStock, without, back: shown() };
    });
    ok("the shop button shows only while something is for sale (S6)",
       shop.withStock && !shop.without && shop.back, shop);

    // Polish #6: a scene's own road; #8: a speaker name declared in content.
    const own = await page.evaluate(() => {
      const ground = () => document.getElementById("ground-tiles").style.getPropertyValue("--ground-src");
      const scene = SCENES.find((s) => s.id === currentSceneId);
      const before = ground();
      scene.ground = { src: "assets/backgrounds/act1/street-02.jpg" };
      loadScene(scene.id);
      const mine = ground();
      scene.ground = { src: "assets/backgrounds/act9/wala.jpg" }; // owed: not asked for
      loadScene(scene.id);
      const owed = ground();
      // Block 114: a floor the engine draws, kept sharp; an unknown one
      // is the dirt.
      const tiles = document.getElementById("ground-tiles");
      scene.ground = { floor: "kahoy" };
      loadScene(scene.id);
      const floor = { src: ground(), sharp: tiles.classList.contains("ground-floor"), size: tiles.style.getPropertyValue("--ground-size") };
      scene.ground = { floor: "wala" };
      loadScene(scene.id);
      const noFloor = { src: ground(), sharp: tiles.classList.contains("ground-floor") };
      delete scene.ground;
      loadScene(scene.id);
      const back = ground();
      const backSharp = tiles.classList.contains("ground-floor");
      const sheet = { src: "assets/sprites/characters/kutsero.png", frames: 1, fps: 1 };
      currentScene.decorations = (currentScene.decorations || []).concat([{ id: "pinuno", animation: sheet, speakers: ["Siga", "Mga Siga"] }]);
      return { before, mine, owed, back, floor, noFloor, backSharp,
        siga: portraitSheetFor("Mga Siga (pabulong)").sheet === sheet,
        none: portraitSheetFor("Wala").sheet === null };
    });
    ok("a scene may lay its own road, an owed one falls back, and leaving restores the dirt (Polish #6)",
       /ground-lupa/.test(own.before) && /street-02/.test(own.mine) && /ground-lupa/.test(own.owed) &&
       /ground-lupa/.test(own.back), own);
    ok("a scene may name a floor the engine draws, sharp and twice its size; an unknown one is the dirt (Block 114)",
       /^url\("data:image\/svg\+xml,/.test(own.floor.src) && own.floor.sharp && own.floor.size === "128px 64px" &&
       /ground-lupa/.test(own.noFloor.src) && !own.noFloor.sharp && !own.backSharp, own);
    ok("a speaker name in content finds its portrait, with no name known to the engine (Polish #8)",
       own.siga && own.none, own);
    const heartIcon = await page.evaluate(() => ({
      heal: Shell._itemIcon({ id: "x", kind: "consumable", use: { heal: 1 } }),
      plain: Shell._itemIcon({ id: "y", kind: "consumable" }),
      symbol: Boolean(document.getElementById("i-heart")) }));
    ok("an item that heals shows the heart symbol on its tile, any other consumable the bag",
       heartIcon.heal === "i-heart" && heartIcon.plain === "i-bag" && heartIcon.symbol, heartIcon);
    await ctx.close();
  }
  if (still()) { // the section above, continued
    const { ctx, page } = await newPage({ session: { user: { id: "u1" } } });
    await page.goto("http://localhost:" + PORT + "/index.html?dev=1");
    await page.waitForTimeout(2500);
    const dev = await page.evaluate(() => ({
      signedIn: Game.isSignedIn(),
      shown: !document.getElementById("shell-dev").classList.contains("hidden"),
    }));
    ok("with a student signed in, ?dev=1 offers no story points (S5)", dev.signedIn && !dev.shown, dev);
    await ctx.close();
  }
  if (still()) { // the section above, continued
    // Polish list #2. A later act's story points are offered too, grouped
    // by act, and start the guest in that act.
    const ACT2 = `window.ACT_2 = { number: 2, title: "Two", titleTagalog: "Ikalawa", objectives: [],
      startingQuests: [], scenes: [{ id: "daan", worldWidth: 2400, startX: 100, npcs: [], decorations: [] }],
      devJumps: [{ id: "gitna", label: "Sa gitna ng daan", scene: "daan", x: 900, facing: -1,
        flags: { pagsubok_ikalawa: true } }] };`;
    const { ctx, page } = await newPage({ session: null }, [{ pattern: "**/content/act2.js*", body: ACT2 }]);
    await page.goto("http://localhost:" + PORT + "/index.html?dev=1");
    await page.waitForTimeout(500);
    const list = await page.evaluate(() => [...document.querySelectorAll("#shell-dev-jump optgroup")].map((g) =>
      ({ label: g.label, values: [...g.querySelectorAll("option")].map((o) => o.value) })));
    ok("?dev=1 lists every act's story points, grouped by act (Polish #2)",
       // Block 117: and Act III's; Block 119: and Act IV's.
       list.length === 4 && list[1].label === "Ikalawa" && list[1].values[0] === "2:gitna" &&
       list[0].values.every((v) => v.startsWith("1:")) && list[2].label === "Ang Republika sa Lilim" &&
       list[2].values.length === 15 && list[2].values.every((v) => v.startsWith("3:")) &&
       list[3].label === "Ang Mapait na Ani" && list[3].values.length === 13 && list[3].values.every((v) => v.startsWith("4:")), list);
    await page.selectOption("#shell-dev-jump", "2:gitna");
    await page.click("#shell-dev-go");
    await page.waitForTimeout(800);
    const at = await page.evaluate(() => ({ act: Acts.current, scene: currentSceneId, x: Math.round(posX),
      flag: state.flags.pagsubok_ikalawa === true, guest: Game.isGuest(), written: __DB.game_progress.length }));
    ok("and one starts a guest in that act, at its scene and place",
       at.act === 2 && at.scene === "daan" && at.x === 900 && at.flag && at.guest && at.written === 0, at);
    await ctx.close();
  }
  if (still()) { // the section above, continued
    // S17, S18, S21: the page's name and language, the login in Tagalog,
    // and a way back from the login box.
    const { ctx, page } = await newPage({ session: null });
    await page.waitForTimeout(400);
    const head = await page.evaluate(() => ({ title: document.title, lang: document.documentElement.lang }));
    ok("the page is MACARIO, in Tagalog (S17)", head.title === "MACARIO" && head.lang === "tl", head);
    await page.click("#shell-start");
    await page.waitForTimeout(200);
    ok("the login button reads Mag-log in (S18)",
       (await page.textContent("#auth-submit")).trim() === "Mag-log in" && await visible(page, "#auth-overlay"));
    const said = await page.evaluate(() => authErrorText({ message: "Invalid login credentials" }));
    ok("a wrong password is said in Tagalog (S18)", /Mali ang email o password/.test(said), said);
    await page.click("#auth-back");
    await page.waitForTimeout(200);
    ok("Bumalik in the login box goes back to the title screen (S21)",
       await visible(page, "#shell-title") && await visible(page, "#shell-guest") &&
       (await page.evaluate(() => Shell.state)) === "title");
    await page.click("#shell-guest");
    await page.waitForTimeout(400);
    ok("and from there a guest can still go in",
       await page.evaluate(() => Game.isGuest() && Shell.state === "playing"));
    await ctx.close();
  }

  // -------------------------------------------------------------
  // BT. Block 121, the audit of 5 Oct 2026: an act entered with no
  // act_progress row, a replay that takes only its own act's items, a
  // catch inside the grace window, the shop shut while an act saves
  // toward a sum, one "Walang pagsusulit" for an act with no questions,
  // and the reset's kept scores.
  // -------------------------------------------------------------
  if (section("BT", "Block 121: a missing row, replays, catches, the shop, no questions, the reset")) {
    const { ctx, page } = await enterTestRoom();
    const entered = await page.evaluate(async () => {
      window.__runTest = Assessment.runTest; // the real one, for the questions below
      Assessment.runTest = async function () {};
      Assessment.runTrivia = async function () {};
      Acts.showActTitle = async function () {};
      Acts.progress[1] = { status: "completed", objectives_done: 5 };
      delete Acts.progress[2];
      const inserts = () => __CALLS.filter((c) => c.table === "act_progress" && c.op === "insert").length;
      const before = inserts();
      __TEST.insertError = { act_progress: "Failed to fetch" };
      const orig = console.error;
      console.error = () => {};
      let threw = null;
      try { await Acts.enterAct(2); } catch (e) { threw = String(e); }
      console.error = orig;
      delete __TEST.insertError;
      return { threw, tries: inserts() - before, current: Acts.current, status: Acts.status };
    });
    ok("an act entered with its row's insert failing tries once more, then plays on, never throwing",
       entered.threw === null && entered.tries === 2 && entered.current === 2 && entered.status === "playing", entered);

    const replay = await page.evaluate(async () => {
      ITEMS.push({ id: "bigay-1", name: "Isa", kind: "equipment", slot: "outfit", price: 0, description: "",
        effect: {}, replayRemoves: true, givenInAct: 1 });
      ITEMS.push({ id: "bigay-2", name: "Dalawa", kind: "equipment", slot: "accessory", price: 0, description: "",
        effect: {}, replayRemoves: true, givenInAct: 2 });
      await Inventory.grant("bigay-1");
      await Inventory.grant("bigay-2");
      state.flags.__startCurrency_2 = 40;
      Game.spendCurrency(Game.currency());
      Game.addCurrency(10); // spent in the shop: below the act's start
      await Acts.replayAct(2);
      return { kept: Inventory.owns("bigay-1"), taken: !Inventory.owns("bigay-2"), currency: Game.currency() };
    });
    ok("a replay of Act II takes back what Act II gave, and keeps what Act I gave (givenInAct)",
       replay.kept && replay.taken, replay);
    ok("and gives back no barya spent in the shop", replay.currency === 10, replay);

    const caught = await page.evaluate(() => {
      const guard = { alert: 1 }; // a guard whose meter just filled (Act II's room has none)
      health = maxHealth;
      invulnUntil = performance.now() + 1e9;
      const d0 = Game.stats().detections;
      caughtBy(guard);
      const inGrace = { detections: Game.stats().detections - d0, health };
      invulnUntil = 0;
      caughtBy(guard);
      const out = { inGrace, landed: Game.stats().detections - d0, health };
      invulnUntil = performance.now() + 1e9;
      return out;
    });
    ok("a catch inside the grace window counts no detection; one that lands counts one",
       caught.inGrace.detections === 0 && caught.inGrace.health === 3 && caught.landed === 1 && caught.health === 2, caught);

    const shop = await page.evaluate(() => {
      const act = currentActData;
      const saved = act.objectives;
      act.objectives = [{ id: "ipon", label: "Mag-ipon", flag: "t_ipon", countCurrency: 50 }];
      const id = Inventory.forSale(null).length ? null : ITEMS.find((it) => it.price > 0).id;
      const out = { during: Inventory.forSale(null).length, why: Inventory.buyBlocker(id) };
      state.flags.t_ipon = true;
      out.after = Inventory.forSale(null).length;
      act.objectives = saved;
      delete state.flags.t_ipon;
      return out;
    });
    ok("nothing is sold while the act saves toward a sum, and the shop opens once it is given",
       shop.during === 0 && shop.why === "Nag-iipon ka pa" && shop.after > 0, shop);

    const tests = await page.evaluate(async () => {
      const open = () => !document.getElementById("quiz").classList.contains("hidden");
      const title = () => document.getElementById("quiz-title").textContent;
      const real = window.QUESTIONS[9];
      const run = (n, t) => window.__runTest.call(Assessment, n, t);
      const p = run(9, "pre");
      for (let i = 0; i < 40 && !open(); i++) await new Promise((r) => setTimeout(r, 50));
      const pre = { open: open(), title: title() };
      document.getElementById("quiz-btn").click();
      await p;
      const q = run(9, "post");
      let postOpen = false;
      for (let i = 0; i < 10; i++) { if (open()) postOpen = true; await new Promise((r) => setTimeout(r, 30)); }
      const post = await q;
      window.QUESTIONS[9] = { pre: [{ question: "Q?", choices: ["a", "b"], correct: 0 }] };
      const r = run(9, "post");
      let gapOpen = false;
      for (let i = 0; i < 40 && !gapOpen; i++) { if (open() && title() === "Walang pagsusulit") gapOpen = true; await new Promise((res) => setTimeout(res, 50)); }
      if (gapOpen) document.getElementById("quiz-btn").click();
      await r;
      if (real === undefined) delete window.QUESTIONS[9]; else window.QUESTIONS[9] = real;
      return { pre, postOpen, post, gapOpen };
    });
    ok("an act with no questions says \"Walang pagsusulit\" once, at the pre-test, and skips the post-test silently",
       tests.pre.open && tests.pre.title === "Walang pagsusulit" && !tests.postOpen && tests.post === null, tests);
    ok("an act with pre-test questions and no post-test ones still says so",
       tests.gapOpen, tests);

    const kept = await page.evaluate(() => {
      Assessment._writePending([
        { student_id: "u1", act_number: 1, test_type: "pre", score: 1, max_score: 2 },
        { student_id: "iba", act_number: 1, test_type: "pre", score: 2, max_score: 2 },
      ]);
      __TEST.canReset = true;
      Shell._resetData();
      return true;
    });
    await page.waitForTimeout(1500); // the reset reloads the page
    const left = await page.evaluate(() => JSON.parse(localStorage.getItem("macario_pending_scores") || "[]"));
    ok("the full reset drops this student's kept scores and leaves another's",
       kept && left.length === 1 && left[0].student_id === "iba", left);
    await ctx.close();
  }

  await browser.close();
  server.close();
  if (ONLY && !pass && !fail) {
    console.log("\nno section matched --only=" + [...ONLY].join(",") + "; node _dev/tests/test.js --list names them");
    process.exit(1);
  }
  if (LIST) process.exit(0);
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
