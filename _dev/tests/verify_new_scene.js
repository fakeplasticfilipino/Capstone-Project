// =============================================================
// MACARIO — _dev/tests/verify_new_scene.js
//
// Drives the REAL content/act1.js and content/items.js (no fixture
// routes), the way _dev/tests/test.js Section A does, through the whole
// of Act I as it stands. Rewritten in Block 52 with the act: the opening
// on the street (the siga, then Nanay), the conversation at home, the
// thought back on the street and the savings quest that counts barya.
// It also checks that each scene script replays from the top after a
// reload in the middle of it, that a save from the old Act I lands on
// the street without replaying anything, and that a guest gets the
// same opening. The old Act I's checks (Blocks 19 to 51) are in git
// history with the content they checked.
// =============================================================
// fixture routes) the same way _dev/tests/test.js Section A does.
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PORT = 8096;
const STUB = fs.readFileSync(path.join(__dirname, "sb-stub.js"), "utf8");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg" };

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

const INTERACT_DISTANCE_FOR_TEST = 90; // game.js INTERACT_DISTANCE

const walkTo = async (page, x) => {
  await page.evaluate((tx) => { posX = tx; }, x);
  await page.waitForTimeout(80); // let the game loop fold the new posX into `nearby`
};

const talk = async (page, times) => {
  await page.keyboard.press("e");
  await page.waitForTimeout(120);
  for (let i = 0; i < times; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
  }
};

// Block 48. What the quest log shows: the one task in hand, and the
// closed "Tapos na" list with its count.
const log = (page) => page.evaluate(() => ({
  current: [...document.querySelectorAll("#quest-list li")].map((li) => li.textContent),
  toggle: (document.querySelector("#quest-done-toggle .lbl") || {}).textContent,
  toggleShown: !document.getElementById("quest-done-toggle").classList.contains("hidden"),
  open: !document.getElementById("quest-done-list").classList.contains("hidden"),
  done: [...document.querySelectorAll("#quest-done-list li")].map((li) => li.textContent),
}));

// Block 42. What the guide points at right now: its label, and whether it
// is drawn over the target or as a tab at the screen's edge.
const guide = (page) => page.evaluate(() => {
  const t = guideTarget();
  const marker = !document.getElementById("guide-marker").classList.contains("hidden");
  const edge = document.getElementById("guide-edge");
  return {
    label: t && t.label, x: t && t.x, marker,
    edge: !edge.classList.contains("hidden") ? (edge.classList.contains("guide-edge-left") ? "left" : "right") : null,
    text: marker ? document.querySelector("#guide-marker .guide-label").textContent
                 : document.querySelector("#guide-edge .guide-label").textContent,
  };
});

// Block 43. The painted backdrop of the scene in hand: its panels, the
// shadow trees over the joins, whether every painting really loads, and
// whether anyone the student has to reach stands behind a trunk.
const panels = (page) => page.evaluate(async () => {
  const scene = currentScene;
  const tiles = [...document.querySelectorAll("#skyline .skyline-panel")];
  const trees = [...document.querySelectorAll(".shadow-tree")];
  const joins = panelJoins(scene);
  const srcs = [...new Set(scene.panels)];
  const widths = await Promise.all(srcs.map((src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth);
    img.onerror = () => resolve(0);
    img.src = assetUrl(src);
  })));
  // Half the widest trunk at head height plus a margin, either side of a
  // join. It grew with the trees in Block 50: they are thicker now, so
  // the ground a person must stay off is wider than it was.
  const TRUNK = 90;
  const blocked = [];
  joins.forEach((x) => {
    NPCS.forEach((n) => { if (!n.hidden && n.x < x + TRUNK && n.x + NPC_WIDTH > x - TRUNK) blocked.push(n.id + " at " + x); });
    (scene.exits || []).forEach((e) => { if (e.x < x + TRUNK && e.x + (e.width || 80) > x - TRUNK) blocked.push(e.id + " at " + x); });
    (scene.checkpoints || []).forEach((c) => { if (Math.abs(c.x + PLAYER_WIDTH / 2 - x) < TRUNK + PLAYER_WIDTH / 2) blocked.push("checkpoint " + c.x); });
  });
  return {
    tiles: tiles.length, expectedTiles: Math.ceil(WORLD_WIDTH / (scene.panelWidth || PANEL_WIDTH)),
    joins, treesAt: trees.map((t) => parseFloat(t.style.left) + SHADOW_TREE_WIDTH / 2),
    treeZ: trees.length ? +getComputedStyle(trees[0]).zIndex : null,
    playerZ: +getComputedStyle(document.getElementById("player")).zIndex,
    markerZ: +getComputedStyle(document.getElementById("guide-marker")).zIndex,
    grey: trees.length ? getComputedStyle(trees[0]).filter : null,
    loaded: widths.every((w) => w > 0), widths, blocked,
    tondoTiles: document.querySelectorAll("#skyline .skyline-tile:not(.skyline-panel)").length,
    srcs, order: tiles.map((t) => (t.style.backgroundImage.match(/street-\d+|tondo/) || ["?"])[0]),
    noneMirrored: tiles.every((t) => !t.classList.contains("skyline-tile-mirrored")),
    // Block 46: the picture stands on the floor, whole, with sky above it.
    onFloor: tiles.every((t) => getComputedStyle(t).bottom === GROUND_LEVEL + "px" &&
      /^100%( auto)?$/.test(getComputedStyle(t).backgroundSize)),
    sky: tiles.length ? getComputedStyle(tiles[0]).backgroundColor : null,
  };
});


const line = (page) => page.evaluate(() =>
  dialogueBox.classList.contains("hidden") ? null : dialogueSpeaker.textContent + ": " + dialogueText.textContent);

// Waits for the dialogue box to open, then reads every line of the
// conversation in hand, pressing E between them. Also records which way
// Macario faces on each line.
const readConversation = async (page, max) => {
  for (let i = 0; i < 60 && !(await line(page)); i++) await page.waitForTimeout(100);
  const lines = [], facings = [];
  for (let i = 0; i < max; i++) {
    const l = await line(page);
    if (!l) break;
    lines.push(l);
    facings.push(await page.evaluate(() => facing));
    await page.keyboard.press("e");
    await page.waitForTimeout(140);
  }
  return { lines, facings };
};

const waitForScene = async (page, id) => {
  for (let i = 0; i < 60; i++) {
    const s = await page.evaluate(() => ({ id: currentSceneId, fading: document.getElementById("blackout").classList.contains("visible") }));
    if (s.id === id && !s.fading) return true;
    await page.waitForTimeout(100);
  }
  return false;
};

const newPage = async (browser, test) => {
  const ctx = await browser.newContext({ viewport: { width: 823, height: 412 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });
  page.on("console", (m) => { if (m.type() === "error") console.log("  console.error: " + m.text()); });
  page.on("response", (res) => { if (res.status() === 404) console.log("  404: " + res.url()); });
  await page.route("**/supabaseClient.js*", (route) =>
    route.fulfill({ body: STUB, contentType: "text/javascript" }));
  await page.route("**/cdn.jsdelivr.net/**", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }));
  await page.addInitScript((s) => { window.__TEST = s; }, test);
  await page.goto("http://localhost:" + PORT + "/index.html");
  await page.waitForTimeout(300);
  return { ctx, page };
};

const OPENING = [
  "Siga: Ano Macario, inaantay mo pa din tatay mo?",
  "Mga Siga: BAHAHAHAHAHAHA!",
  "Macario: Isarado mo 'yang bunganga mo!",
];
const NANAY_ARRIVES = [
  "Nanay: Macario, uwi na, may kailangan akong sabihin sayo",
  "Mga Siga: HAHAHAHHHHA! NAGSUMBONG SA NANAY!",
  "Nanay: Wag mo pansinin yung mga yan",
  "Macario: Tsk",
];
const AT_HOME = [
  "Macario: Nay, ano po ba yung sasabihin niyo?",
  "Nanay: Macario, anak, naubos na yung pera natin sa pagbili ko ng Cedula...",
  "Nanay: Wala na tayong pambili ng bigas, humingi ako ng ulam sa kapitbahay para sa hapunan natin ngayon...",
  "Nanay: Pasensya ka na anak ha?",
  "Macario: Okay lang 'Nay, magta-trabaho na po ako para makatulong sainyo",
  "Nanay: Sigurado ka ba diyan 'nak?",
  "Macario: Opo inay, ako na po ang bahala",
];
const THOUGHT = "Macario (sa isip): Kailangan ko ng pera para matulungan si Nanay, saan kaya ako makakahanap ng trabaho?";
const QUEST = "Mag-ipon ng pera na mai-bibigay kay Nanay";

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();

  // ---------------------------------------------------------------
  // A fresh student, logging in: the whole of the new Act I.
  // ---------------------------------------------------------------
  console.log("\nA fresh student, from the title to the savings quest");
  const { ctx, page } = await newPage(browser, { session: null });
  await page.click("#shell-start");
  await page.waitForTimeout(150);
  await page.fill("#auth-email", "hi@example.com");
  await page.fill("#auth-password", "x");
  await page.click("#auth-submit");
  await page.waitForTimeout(600);
  if (await page.locator("#quiz").isVisible().catch(() => false)) {
    await page.click("#quiz-btn");
    await page.waitForTimeout(400);
  }
  ok("act status is playing", (await page.evaluate(() => Acts.status)) === "playing");
  ok("Act I has two objectives, and pays no barya per step",
     await page.evaluate(() => Acts.objectivesFor(1).length === 2 && Acts.perObjective(2) === 0));
  ok("the item catalogue is empty", await page.evaluate(() => Array.isArray(window.ITEMS) && ITEMS.length === 0));

  const p0 = await panels(page);
  ok("the street shows all five backgrounds end to end, a tree over each join (Block 53)",
     p0.tiles === 5 && p0.loaded &&
     JSON.stringify(p0.order) === '["street-01","street-02","street-03","street-04","tondo"]' &&
     p0.joins.length === 4 && JSON.stringify(p0.treesAt) === JSON.stringify(p0.joins), p0);
  const road = await page.evaluate(() => ({ w: WORLD_WIDTH,
    shapes: [...document.querySelectorAll("#skyline .skyline-panel")].map((t) =>
      [parseFloat(t.style.left), parseFloat(t.style.width || getComputedStyle(t).width)]) }));
  ok("the road is exactly five panels long, none repeated or cut at the end",
     road.w === 7250 && road.shapes.every(([l, w], i) => l === i * 1450 && Math.abs(w - 1450) < 2), road);
  ok("nobody stands behind the tree", p0.blocked.length === 0, p0.blocked);

  const start = await page.evaluate(() => ({ scene: currentSceneId, x: posX, cut: cutscenePlaying,
    sigaHidden: ["siga-1", "siga-2", "siga-3"].every((id) => document.getElementById("dec-" + id).style.display === "none"),
    npcs: NPCS.length, hearts: !document.getElementById("hud").classList.contains("hidden") }));
  ok("the opening plays by itself on the street, Macario at 900, world held still",
     start.scene === "tondo" && start.x === 900 && start.cut === true, start);
  ok("nobody to talk to and no hearts on the street", start.npcs === 0 && !start.hearts, start);
  const l0 = await log(page);
  ok("the quest log's first task is Umuwi kasama si Nanay",
     JSON.stringify(l0.current) === '["Umuwi kasama si Nanay"]' && !l0.toggleShown, l0);

  const c1 = await readConversation(page, 3);
  ok("the siga's lines, as written", JSON.stringify(c1.lines) === JSON.stringify(OPENING), c1.lines);
  ok("Macario faces the siga, behind him on the left", c1.facings.every((f) => f === -1), c1.facings);
  const drawn = await page.evaluate(() => ["siga-1", "siga-2", "siga-3"].map((id) => {
    const el = document.getElementById("dec-" + id);
    return { shown: el.style.display !== "none", x: parseFloat(el.style.left),
      box: !!el.querySelector(".placeholder") || !!el.querySelector(".placeholder-box") };
  }));
  ok("all three siga walked up and stand left of him", drawn.every((d) => d.shown && d.x < 900 && d.x > 500), drawn);
  const sigaArt = await page.evaluate(() => ["siga-1", "siga-2", "siga-3"].every((id) => {
    const sp = document.querySelector("#dec-" + id + " .npc-anim-sprite");
    return sp && /siga-\d\.png/.test(sp.style.backgroundImage);
  }));
  ok("the siga draw their stand-in pictures, not dashed boxes", sigaArt);

  // Block 53. Nanay walks on with her own walk cycle, then stands with
  // her idle sheet. Caught mid-walk by polling while she moves.
  const walkSeen = await page.evaluate(async () => {
    const dec = currentScene.decorations.find((d) => d.id === "nanay");
    const seen = { walking: false, walkFrames: new Set(), idleHidden: false, flipped: false };
    for (let i = 0; i < 80 && !(dec.moving); i++) await new Promise((r) => setTimeout(r, 50));
    for (let i = 0; i < 40 && dec.moving; i++) {
      seen.walking = seen.walking || dec.walkSpriteEl.style.display !== "none";
      seen.idleHidden = seen.idleHidden || dec.spriteEl.style.display === "none";
      seen.flipped = seen.flipped || dec.walkSpriteEl.style.transform === "scaleX(-1)";
      seen.walkFrames.add(dec.walkSpriteEl.style.backgroundPosition);
      await new Promise((r) => setTimeout(r, 60));
    }
    for (let i = 0; i < 60 && dec.moving; i++) await new Promise((r) => setTimeout(r, 50));
    return { walking: seen.walking, idleHidden: seen.idleHidden, flipped: seen.flipped,
      frames: seen.walkFrames.size, src: dec.walkSpriteEl.style.backgroundImage,
      after: { walk: dec.walkSpriteEl.style.display, idle: dec.spriteEl.style.display } };
  });
  ok("Nanay walks on with her walk sheet, stepping through its frames, turned the way she walks",
     walkSeen.walking && walkSeen.idleHidden && walkSeen.flipped && walkSeen.frames >= 4 &&
     /nanay-walk\.png/.test(walkSeen.src), walkSeen);
  ok("and stands with her idle sheet once she arrives",
     walkSeen.after.walk === "none" && walkSeen.after.idle === "", walkSeen.after);

  const c2 = await readConversation(page, 4);
  ok("Nanay's arrival, as written, and Macario's Tsk", JSON.stringify(c2.lines) === JSON.stringify(NANAY_ARRIVES), c2.lines);
  ok("Macario turns to Nanay, on his right", c2.facings.every((f) => f === 1), c2.facings);

  ok("then the fade home", await waitForScene(page, "bahay"));
  const home = await page.evaluate(() => ({ x: posX, facing, nanay: !!document.getElementById("dec-nanay-bahay"),
    tiles: document.querySelectorAll("#skyline .skyline-panel").length,
    src: (document.querySelector("#skyline .skyline-panel") || {}).style.backgroundImage }));
  ok("at home: the same street painting, Macario beside Nanay facing her",
     home.x === 560 && home.facing === 1 && home.nanay && home.tiles === 1 && /street-01/.test(home.src), home);
  const c3 = await readConversation(page, 7);
  ok("the conversation at home, as written", JSON.stringify(c3.lines) === JSON.stringify(AT_HOME), c3.lines);

  ok("then back out to the street", await waitForScene(page, "tondo"));
  const back = await page.evaluate(() => ({ x: posX,
    sigaGone: ["siga-1", "siga-2", "siga-3", "nanay"].every((id) => document.getElementById("dec-" + id).style.display === "none") }));
  ok("alone on the street, the siga and Nanay gone", back.x === 900 && back.sigaGone, back);
  const c4 = await readConversation(page, 1);
  ok("his thought, as written", c4.lines[0] === THOUGHT, c4.lines);
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ toast: document.getElementById("toast") ? document.getElementById("toast").textContent : null,
    toastShown: document.getElementById("toast") && !document.getElementById("toast").classList.contains("hidden"),
    cut: cutscenePlaying, barya: Game.currency() }));
  const l1 = await log(page);
  ok("the new quest is the task in hand, counting barya (0/100)",
     JSON.stringify(l1.current) === JSON.stringify([QUEST + " (0/100)"]) && l1.toggle === "Tapos na (1)", l1);
  ok("and it is announced as Bagong gawain", after.toastShown && after.toast === "Bagong gawain: " + QUEST + " (0/100)", after);
  ok("the world is his again, and finishing the first step paid no barya", after.cut === false && after.barya === 0, after);

  await page.waitForTimeout(1200);
  ok("the first step is saved and counted", await page.evaluate(() =>
    __DB.game_progress[0].save_state.flags.nagpasyangMagtrabaho === true && Acts.countDone(1) === 1 &&
    __DB.game_progress[0].current_room === "tondo"));

  await page.evaluate(() => Game.addCurrency(30));
  await page.waitForTimeout(100);
  ok("barya earned moves the count", JSON.stringify((await log(page)).current) === JSON.stringify([QUEST + " (30/100)"]));
  await page.evaluate(() => Game.addCurrency(200));
  await page.waitForTimeout(100);
  ok("and it stops at the target", JSON.stringify((await log(page)).current) === JSON.stringify([QUEST + " (100/100)"]));
  await page.waitForTimeout(1500);
  ok("having the money does not finish Act I: handing it over is still to be written",
     await page.evaluate(() => Acts.status === "playing" && Acts.countDone(1) === 1));
  const moved = await page.evaluate(async () => {
    const x0 = posX;
    keysPressed["d"] = true;
    await new Promise((r) => setTimeout(r, 400));
    keysPressed["d"] = false;
    return posX - x0;
  });
  ok("he can walk the street", moved > 20, moved);
  await ctx.close();

  // ---------------------------------------------------------------
  // Reloads, and saves from before the rewrite.
  // ---------------------------------------------------------------
  console.log("\nReloads and old saves");
  const resume = async (room, flags, extra) => {
    const r = await newPage(browser, Object.assign({
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: room, currency: 0,
        save_state: { quests: [], flags, posX: 300 } }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 0 }],
    }, extra || {}));
    await r.page.click("#shell-start");
    await r.page.waitForTimeout(700);
    return r;
  };

  let r = await resume("bahay", { nakitaAngMgaSiga: true });
  let c = await readConversation(r.page, 7);
  ok("a reload at home plays the conversation at home again, from the top",
     JSON.stringify(c.lines) === JSON.stringify(AT_HOME), c.lines);
  await r.ctx.close();

  r = await resume("tondo", { nakitaAngMgaSiga: false });
  c = await readConversation(r.page, 3);
  ok("a reload mid-opening watches the opening again", JSON.stringify(c.lines) === JSON.stringify(OPENING), c.lines);
  await r.ctx.close();

  r = await resume("tondo", { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true });
  c = await readConversation(r.page, 1);
  ok("a reload between home and the thought lands on the thought", c.lines[0] === THOUGHT, c.lines);
  await r.ctx.close();

  r = await resume("lansangan", { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true,
    naipamahagiAngPolyeto: true, nasaEntablado: true });
  await r.page.waitForTimeout(500);
  const old = await r.page.evaluate(() => ({ scene: currentSceneId, cut: cutscenePlaying,
    box: !dialogueBox.classList.contains("hidden"), status: Acts.status }));
  ok("a save from the old Act I lands on the street, playing, with nothing replayed",
     old.scene === "tondo" && !old.cut && !old.box && old.status === "playing", old);
  ok("and no toast announces the step it landed on", await r.page.evaluate(() =>
    document.getElementById("toast").classList.contains("hidden")));
  await r.ctx.close();

  // ---------------------------------------------------------------
  // A guest gets the same opening.
  // ---------------------------------------------------------------
  console.log("\nGuest");
  const g = await newPage(browser, { session: null });
  await g.page.click("#shell-guest");
  await g.page.waitForTimeout(700);
  c = await readConversation(g.page, 3);
  ok("a guest watches the same opening", JSON.stringify(c.lines) === JSON.stringify(OPENING), c.lines);
  await g.ctx.close();

  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
