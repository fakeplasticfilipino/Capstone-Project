// =============================================================
// MACARIO — _dev/tests/verify_new_scene.js
//
// Drives the REAL content/act1.js and content/items.js (no fixture
// routes), the way _dev/tests/test.js Section A does, through the whole
// of Act I as it stands. Rewritten in Block 57 with the act: one street
// ten paintings long; "Tondo, 1880" on black; the siga and Nanay, who
// slides on, and the two of them walking off together to where she
// stays; the talk and the thought on the street; the Kutsero's job
// (apples caught in the mini-game with real key presses, fed to the
// horse, 50 barya) and the Mananahi's (three customers, 50 barya);
// Nanay's gift; "1884" on black and the errand beside the Mananahi; the
// direktor taking him inside the entablado and paying; the act held
// open; and the finished tasks listed in settings.
// It also checks that a reload in the middle of a script replays it,
// that saves from Blocks 52 to 56 (bahay, patahian) land on the street,
// and that a guest gets the same opening.
// =============================================================
// fixture routes) the same way _dev/tests/test.js Section A does.
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PORT = 8096;
const STUB = fs.readFileSync(path.join(__dirname, "sb-stub.js"), "utf8");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".wav": "audio/wav" };

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

// Block 48, Block 57. What the quest log shows: the one task in hand.
// The finished ones are in settings now, read by doneInSettings below.
const log = (page) => page.evaluate(() => ({
  current: [...document.querySelectorAll("#quest-list li")].map((li) => li.textContent),
  toggle: !!document.getElementById("quest-done-toggle"),
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

// The fade's own hold on the world outlasts the blackout by a moment.
const settle = async (page) => {
  for (let i = 0; i < 40 && (await page.evaluate(() => cutscenePlaying)); i++) await page.waitForTimeout(100);
  await page.waitForTimeout(120);
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
const KUTSERO = [
  "Macario: Kutsero, maaari po ba akong magtrabaho dito?",
  "Kutsero: Macario? Buti naman at naisipan mo magtrabaho",
  "Macario: Kailangan na 'ho eh, nangangailangan si Nanay",
  "Kutsero: O sige, magsimula ka na kaagad, alagaan mo yung puting kabayo kuwadra",
];
const MANANAHI = [
  "Macario: Mananahi, tumatanggap ba kayo ng trabahador?",
  "Mananahi: Oo naman Macario, kamusta na ang inay mo?",
  "Macario: Okay lang 'ho, nangangailangan kami ng pera ngayon",
  "Mananahi: O sige sige, tara dito",
];
const NANAY_THANKS = [
  "Macario: Nay, nakapag-ipon na ako ng pera para makatulong",
  "Nanay: Maraming salamat anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?",
  "Macario: Opo Nay, nagtrabaho ako para sa Kutsero at mananahi",
  "Nanay: Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay",
  "Macario: Maraming salamat nay!",
];
const ERRAND = [
  "Mananahi: Oh Macario, padala nga to dun sa direktor, asa dulo siya ng kalye sa loob ng entablado, ingatan mo mahal yang damit na yan",
  "Macario: Sige 'ho",
  "Mananahi: Nasa sakaniya na yung bayad, wag mo kalimutan kolektahin",
];
const STEP = {
  kutsero: "Maghanap ng trabaho: kausapin ang Kutsero",
  apples: "Kumuha ng tatlong mansanas at ipakain sa kabayo",
  payK: "Kunin ang bayad sa Kutsero",
  mananahi: "Kausapin ang Mananahi",
  clothes: "Ihatid ang mga damit sa mga suki",
  payM: "Kunin ang bayad sa Mananahi",
  nanay: "Ibigay kay Nanay ang naipon",
  errand: "Dalhin ang damit sa direktor sa entablado",
};

// Block 57. The black card: whether it is up, and its lines.
const intertitle = (page) => page.evaluate(() => {
  const el = document.getElementById("intertitle");
  return { up: !el.classList.contains("hidden"), black: el.classList.contains("visible"),
    lines: [...document.querySelectorAll("#intertitle .intertitle-line")].map((p) => p.textContent),
    shown: [...document.querySelectorAll("#intertitle .intertitle-line.shown")].length };
});
const waitIntertitle = async (page, want, ms) => {
  for (let t = 0; t < (ms || 15000); t += 100) {
    if ((await intertitle(page)).up === want) return true;
    await page.waitForTimeout(100);
  }
  return false;
};

// Block 57. The apple mini-game as drawn: where the apple and the basket
// are on the screen.
const catchState = (page) => page.evaluate(() => {
  const f = document.getElementById("catch-field").getBoundingClientRect();
  const a = document.getElementById("catch-apple");
  const ar = a.getBoundingClientRect();
  const b = document.getElementById("catch-basket").getBoundingClientRect();
  return { up: !document.getElementById("catch-screen").classList.contains("hidden"),
    apple: a.classList.contains("hidden") ? null : { c: ar.left + ar.width / 2 },
    basket: b.left + b.width / 2, bw: b.width, fl: f.left, fw: f.width,
    result: document.getElementById("catch-result").textContent,
    stop: document.querySelector("#catch-stop .lbl").textContent };
});
// Steers the basket with the real keys, under the apple (catch) or away
// from it (miss), until that apple is gone.
const playApple = async (page, wantCatch) => {
  let s;
  for (let i = 0; i < 100; i++) { s = await catchState(page); if (s.apple) break; await page.waitForTimeout(40); }
  let held = null;
  const hold = async (k) => {
    if (held === k) return;
    if (held) await page.keyboard.up(held);
    if (k) await page.keyboard.down(k);
    held = k;
  };
  for (let i = 0; i < 300; i++) {
    s = await catchState(page);
    if (!s.apple) break;
    const target = wantCatch ? s.apple.c
      : (s.apple.c < s.fl + s.fw / 2 ? s.fl + s.fw - s.bw / 2 : s.fl + s.bw / 2);
    const diff = target - s.basket;
    await hold(Math.abs(diff) <= 5 ? null : diff > 0 ? "d" : "a");
    await page.waitForTimeout(25);
  }
  await hold(null);
  await page.waitForTimeout(60);
  return catchState(page);
};

const gift = async (page) => {
  await page.waitForTimeout(120);
  const label = await page.evaluate(() => giftBtn.classList.contains("hidden") ? null : giftBtn.textContent.trim());
  if (label) await page.click("#gift-btn");
  return label;
};

const doneInSettings = async (page) => {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.click("#shell-pause-settings");
  await page.waitForTimeout(150);
  const items = await page.evaluate(() =>
    [...document.querySelectorAll("#shell-done-quests li")].map((li) => li.textContent));
  await page.click("#shell-settings-back");
  await page.waitForTimeout(100);
  await page.click("#shell-resume");
  await page.waitForTimeout(200);
  return items;
};

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();

  // ---------------------------------------------------------------
  // A fresh student, logging in: the whole of Act I.
  // ---------------------------------------------------------------
  console.log("\nA fresh student: the opening");
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
  ok("Act I has nine objectives, pays no barya per step, and is held open",
     await page.evaluate(() => Acts.objectivesFor(1).length === 9 && Acts.perObjective(2) === 0 &&
       ACT_1.holdOpen === true));
  ok("one street and the entablado, and no other scene", await page.evaluate(() =>
    JSON.stringify(SCENES.map((s) => s.id)) === '["tondo","entablado"]' &&
    !(SCENES[0].exits || []).length));
  ok("the item catalogue is empty", await page.evaluate(() => Array.isArray(window.ITEMS) && ITEMS.length === 0));

  const t0 = await intertitle(page);
  ok("the game opens on black: Tondo, 1880", t0.up && t0.black &&
     JSON.stringify(t0.lines) === '["Tondo, 1880","Kung saan nagsimula ang buhay ni Macario"]', t0);
  ok("the world is held still behind it", await page.evaluate(() => cutscenePlaying && posX === 900));
  await page.waitForTimeout(2200);
  const t1 = await intertitle(page);
  ok("the lines fade in", t1.shown === 2, t1);
  ok("and the card fades away by itself", await waitIntertitle(page, false, 12000));

  const p0 = await panels(page);
  ok("the street is ten paintings long, the four in order and again, a tree over each join",
     p0.tiles === 10 && p0.loaded &&
     JSON.stringify(p0.order) === JSON.stringify(["01", "02", "03", "04", "01", "02", "03", "04", "01", "02"].map((n) => "street-" + n)) &&
     p0.joins.length === 9 && JSON.stringify(p0.treesAt) === JSON.stringify(p0.joins), p0);
  ok("the road is 14500 wide", await page.evaluate(() => WORLD_WIDTH === 14500));

  const c1 = await readConversation(page, 3);
  ok("the siga's lines, as written", JSON.stringify(c1.lines) === JSON.stringify(OPENING), c1.lines);
  ok("Macario faces the siga, behind him on the left", c1.facings.every((f) => f === -1), c1.facings);

  const slide = await page.evaluate(async () => {
    const dec = currentScene.decorations.find((d) => d.id === "nanay");
    for (let i = 0; i < 80 && !dec.moving; i++) await new Promise((r) => setTimeout(r, 50));
    const moving = dec.moving;
    for (let i = 0; i < 80 && dec.moving; i++) await new Promise((r) => setTimeout(r, 50));
    return { moving, walkSheet: dec.walkSpriteEl, src: dec.spriteEl.style.backgroundImage,
             shown: dec.spriteEl.style.display !== "none" };
  });
  ok("Nanay slides on with her own sheet, no walk cycle (Block 57)",
     slide.moving && slide.walkSheet === null && /nanay\.png/.test(slide.src) && slide.shown, slide);

  const c2 = await readConversation(page, 4);
  ok("Nanay's arrival, as written, and Macario's Tsk", JSON.stringify(c2.lines) === JSON.stringify(NANAY_ARRIVES), c2.lines);
  ok("Macario turns to Nanay, on his right", c2.facings.every((f) => f === 1), c2.facings);

  const walk = await page.evaluate(async () => {
    const seen = { walking: false, anim: new Set(), xs: [] };
    for (let i = 0; i < 120; i++) {
      seen.walking = seen.walking || scriptWalking;
      if (scriptWalking) seen.anim.add(currentAnim);
      seen.xs.push(posX);
      if (!scriptWalking && seen.walking) break;
      await new Promise((r) => setTimeout(r, 80));
    }
    const nanay = currentScene.decorations.find((d) => d.id === "nanay");
    return { walking: seen.walking, anim: [...seen.anim], from: seen.xs[0], to: posX, facing,
      nanayAt: nanay.currentX, scene: currentSceneId,
      sigaHidden: ["siga-1", "siga-2", "siga-3"].every((id) => document.getElementById("dec-" + id).style.display === "none") };
  });
  ok("then Macario walks off with Nanay, on the same street, with his walk cycle",
     walk.walking && JSON.stringify(walk.anim) === '["walk"]' && walk.scene === "tondo" &&
     walk.to === 1880 && walk.nanayAt === 2040 && walk.facing === 1, walk);
  const c3 = await readConversation(page, 7);
  ok("the conversation about the cedula, as written, outside", JSON.stringify(c3.lines) === JSON.stringify(AT_HOME) &&
     walk.sigaHidden, c3.lines);
  await page.waitForTimeout(150);
  const nanay = await page.evaluate(() => ({
    npc: NPCS.find((n) => n.id === "nanay"), el: document.getElementById("npc-nanay").style.display,
    dec: document.getElementById("dec-nanay").style.display, scene: currentSceneId }));
  ok("Nanay stays on the street as someone to talk to", !nanay.npc.hidden && nanay.el === "" &&
     nanay.dec === "none" && nanay.scene === "tondo", nanay);

  const c4 = await readConversation(page, 1);
  ok("his thought, as written", c4.lines[0] === THOUGHT, c4.lines);
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({ toast: document.getElementById("toast").textContent,
    cut: cutscenePlaying, barya: Game.currency() }));
  const l1 = await log(page);
  ok("the next task is the Kutsero, announced as Bagong gawain",
     JSON.stringify(l1.current) === JSON.stringify([STEP.kutsero]) && after.toast === "Bagong gawain: " + STEP.kutsero, { l1, after });
  ok("no Tapos na button under the log any more (Block 57)", !l1.toggle);
  ok("the world is his again, no barya yet", !after.cut && after.barya === 0, after);
  const settingsList = await doneInSettings(page);
  ok("the finished task is listed in settings", JSON.stringify(settingsList) === '["Umuwi kasama si Nanay"]', settingsList);
  await page.waitForTimeout(1200);
  ok("the first step is saved and counted", await page.evaluate(() =>
    __DB.game_progress[0].save_state.flags.nagpasyangMagtrabaho === true && Acts.countDone(1) === 1));

  // ---------------------------------------------------------------
  console.log("\nThe Kutsero's job: apples, the horse, the pay");
  ok("the guide points at the Kutsero", (await guide(page)).label === "Kutsero");
  await walkTo(page, 3200);
  await page.keyboard.press("e");
  const k1 = await readConversation(page, 5);
  ok("the Kutsero's lines as written, then what the job is",
     JSON.stringify(k1.lines.slice(0, 4)) === JSON.stringify(KUTSERO) && /tatlong mansanas/.test(k1.lines[4] || ""), k1.lines);
  await page.waitForTimeout(200);
  ok("the task counts the apples (0/3)", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.apples + " (0/3)"]));
  ok("the guide points at the tree", (await guide(page)).label === "Puno ng mansanas");
  ok("the horse is too early to feed", await page.evaluate(() => !canGiveGift(NPCS.find((n) => n.id === "kabayo"))));

  await walkTo(page, 4800);
  const treeBtn = await page.evaluate(() => ({ label: document.querySelector("#btn-interact .lbl").textContent,
    art: /puno-mansanas\.png/.test(document.querySelector("#npc-puno .npc-anim-sprite").style.backgroundImage),
    h: document.getElementById("npc-puno").style.height }));
  ok("at the tree the button reads Pumitas, and the tree is drawn tall", treeBtn.label === "Pumitas" && treeBtn.art &&
     treeBtn.h === "280px", treeBtn);
  await page.keyboard.press("e");
  await page.waitForTimeout(250);
  const cg = await catchState(page);
  ok("E opens the apple mini-game, and the world is blocked", cg.up && await page.evaluate(() =>
    uiBlocked && document.getElementById("catch-title").textContent === "Puno ng mansanas"), cg);
  const x0 = await page.evaluate(() => posX);
  const missed = await playApple(page, false);
  ok("an apple that misses the basket falls, and nothing is lost",
     missed.result === "Nahulog sa lupa! May isa pa." && await page.evaluate(() => !state.flags.nakuhangMansanas1), missed);
  ok("the keys that move the basket do not move Macario", (await page.evaluate(() => posX)) === x0);
  const got1 = await playApple(page, true);
  ok("an apple caught in the basket counts", got1.result === "Nasalo mo! (1/3)" &&
     JSON.stringify((await log(page)).current) === JSON.stringify([STEP.apples + " (1/3)"]), got1);
  await page.click("#catch-stop");
  await page.waitForTimeout(150);
  ok("Bumalik closes it and gives him the world back", await page.evaluate(() =>
    document.getElementById("catch-screen").classList.contains("hidden") && !uiBlocked && Shell.state === "playing"));
  await page.keyboard.press("e");
  await page.waitForTimeout(250);
  ok("coming back, he still holds the one he caught", (await catchState(page)).result === "Hawak mo: 1/3");
  await playApple(page, true);
  const got3 = await playApple(page, true);
  ok("three caught: done, and the button says Tapos na", got3.result === "Tatlo na! Dalhin mo na sa kabayo." &&
     got3.stop === "Tapos na", got3);
  await page.keyboard.press("e");
  await page.waitForTimeout(200);
  ok("E closes it once all three are caught", !(await catchState(page)).up);
  ok("(3/3) and the guide points at the horse", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.apples + " (3/3)"]) &&
     (await guide(page)).label === "Kabayo");

  await walkTo(page, 3480);
  ok("beside the horse, the button reads Ipakain ang mansanas", (await gift(page)) === "Ipakain ang mansanas");
  const h1 = await readConversation(page, 2);
  ok("Macario feeds him", h1.lines.length === 2 && /^Macario:/.test(h1.lines[0]), h1.lines);
  await page.waitForTimeout(200);
  ok("the task moves to the Kutsero's pay", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.payK]) &&
     (await guide(page)).label === "Kutsero");
  await walkTo(page, 3200);
  ok("beside the Kutsero, Kunin ang bayad", (await gift(page)) === "Kunin ang bayad");
  await readConversation(page, 2);
  ok("he is paid exactly 50", (await page.evaluate(() => Game.currency())) === 50);

  // ---------------------------------------------------------------
  console.log("\nThe Mananahi's job: three customers, the pay");
  ok("the next task is the Mananahi", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.mananahi]) &&
     (await guide(page)).label === "Mananahi");
  await walkTo(page, 6300);
  await page.keyboard.press("e");
  const m1 = await readConversation(page, 5);
  ok("the Mananahi's lines as written, then the three customers",
     JSON.stringify(m1.lines.slice(0, 4)) === JSON.stringify(MANANAHI) && /Aling Rosa/.test(m1.lines[4] || ""), m1.lines);
  await page.waitForTimeout(200);
  ok("the task counts the deliveries (0/3)", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.clothes + " (0/3)"]));
  const customers = [["Aling Rosa", 7700], ["Mang Tomas", 9200], ["Ginoong Reyes", 10700]];
  for (let i = 0; i < customers.length; i++) {
    const [name, x] = customers[i];
    ok("the guide points at " + name, (await guide(page)).label === name);
    await walkTo(page, x);
    ok(name + ": Iabot ang damit", (await gift(page)) === "Iabot ang damit");
    const cl = await readConversation(page, 2);
    await page.waitForTimeout(150);
    const cur = (await log(page)).current[0];
    ok(name + " thanks him, and the count moves",
       cl.lines.length === 2 && cl.lines[1].startsWith(name + ":") &&
       (i < 2 ? cur === STEP.clothes + " (" + (i + 1) + "/3)" : cur === STEP.payM), { cl: cl.lines, cur });
  }
  await walkTo(page, 6300);
  ok("back at the Mananahi, Kunin ang bayad", (await gift(page)) === "Kunin ang bayad");
  await readConversation(page, 2);
  await page.waitForTimeout(200);
  ok("paid 50 more: the two jobs make exactly 100", (await page.evaluate(() => Game.currency())) === 100);
  ok("the task is to give Nanay the savings (100/100)",
     JSON.stringify((await log(page)).current) === JSON.stringify([STEP.nanay + " (100/100)"]) &&
     (await guide(page)).label === "Nanay");

  // ---------------------------------------------------------------
  console.log("\nNanay, 1884, the errand and the direktor");
  await walkTo(page, 1880);
  ok("beside Nanay, on the street: Ibigay ang ipon", (await gift(page)) === "Ibigay ang ipon");
  const n1 = await readConversation(page, 5);
  ok("Nanay's lines, as written", JSON.stringify(n1.lines) === JSON.stringify(NANAY_THANKS), n1.lines);
  ok("the savings are spent", (await page.evaluate(() => Game.currency())) === 0);
  ok("then black: 1884", await waitIntertitle(page, true, 3000) &&
     JSON.stringify((await intertitle(page)).lines) ===
       '["1884","Nagtrabaho si Macario bilang isang tagatulong ng kutsero at manananahi"]');
  ok("the scene never changes", await page.evaluate(() => currentSceneId === "tondo"));
  ok("the jobs' people are still there until the black is up", await page.evaluate(() =>
    !NPCS.find((n) => n.id === "puno").hidden));
  // A tap skips the reading time, not the fades, once the first line
  // has been up a moment (fade 900 + INTERTITLE_SKIP_AFTER_MS 1200).
  await page.waitForTimeout(2600);
  const tapAt = Date.now();
  await page.mouse.click(300, 200);
  ok("a tap lifts the card without waiting out the hold", await waitIntertitle(page, false, 6000) &&
     Date.now() - tapAt < 2600, Date.now() - tapAt);
  const e1 = await readConversation(page, 3);
  const at = await page.evaluate(() => ({ x: posX, facing }));
  ok("he is beside the Mananahi, and her errand, as written",
     JSON.stringify(e1.lines) === JSON.stringify(ERRAND) && at.x === 6280 && at.facing === 1, { e1: e1.lines, at });
  const cleared = await page.evaluate(() => NPCS.filter((n) => !n.hidden).map((n) => n.id));
  ok("after 1884 the street is cleared: only Nanay, the Mananahi and the direktor (Block 58)",
     JSON.stringify(cleared) === '["nanay","mananahi","direktor"]', cleared);
  const trees = await page.evaluate(() => document.querySelectorAll(".shadow-tree").length);
  ok("the shadow trees over the joins stay", trees === 9, trees);
  await page.waitForTimeout(300);
  ok("the task is the errand, and the guide points at the direktor on the street",
     JSON.stringify((await log(page)).current) === JSON.stringify([STEP.errand]) &&
     (await guide(page)).label === "Direktor");

  await walkTo(page, 13480);
  await page.keyboard.press("e");
  const d0 = await readConversation(page, 2);
  ok("the direktor, on the street, takes him inside", d0.lines.length === 2 && /sa loob/.test(d0.lines[1]), d0.lines);
  ok("the fade into the entablado", await waitForScene(page, "entablado"));
  await settle(page);
  const ent = await page.evaluate(() => ({ x: posX, dir: NPCS.some((n) => n.id === "direktor"),
    bg: getComputedStyle(document.getElementById("skyline")).getPropertyValue("--skyline-src") }));
  ok("inside, on its own painting, with the direktor", ent.x === 300 && ent.dir && /entablado-inside/.test(ent.bg), ent);
  ok("the guide points at him", (await guide(page)).label === "Direktor");
  await walkTo(page, 380);
  ok("beside him: Iabot ang damit", (await gift(page)) === "Iabot ang damit");
  const d1 = await readConversation(page, 2);
  ok("the direktor's two lines", d1.lines.length === 2 && d1.lines.every((l) => /^Direktor: /.test(l)), d1.lines);
  const pay = await page.evaluate(() => Game.currency());
  ok("he is paid 79 to 110 barya", pay >= 79 && pay <= 110, pay);
  await page.waitForTimeout(1600);
  ok("every step is done and Act I stays open: no post-test (holdOpen)", await page.evaluate(() =>
    Acts.countDone(1) === 9 && Acts.status === "playing" &&
    document.getElementById("act-screen").classList.contains("hidden")));
  const all = await doneInSettings(page);
  ok("settings lists all nine finished tasks", all.length === 9 && all[0] === "Umuwi kasama si Nanay", all);
  await walkTo(page, 40);
  await page.keyboard.press("e");
  ok("Lumabas: back on the street by the direktor", await waitForScene(page, "tondo") && (await settle(page), true) &&
     await page.evaluate(() => posX === 13480));
  const p1 = await panels(page);
  ok("nobody stands behind a tree", p1.blocked.length === 0, p1.blocked);
  const moved = await page.evaluate(async () => {
    const x0 = posX;
    keysPressed["a"] = true;
    await new Promise((r) => setTimeout(r, 400));
    keysPressed["a"] = false;
    return x0 - posX;
  });
  ok("he can walk the street", moved > 20, moved);
  await ctx.close();

  // ---------------------------------------------------------------
  // Reloads, and saves from before this block.
  // ---------------------------------------------------------------
  console.log("\nReloads and old saves");
  const resume = async (room, flags, currency) => {
    const r = await newPage(browser, {
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: room, currency: currency || 0,
        save_state: { quests: [], flags, posX: 300 } }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 0 }],
    });
    await r.page.click("#shell-start");
    await r.page.waitForTimeout(700);
    return r;
  };

  let r = await resume("tondo", { nakitaAngMgaSiga: true });
  ok("a reload mid-opening starts again from Tondo, 1880", (await intertitle(r.page)).lines[0] === "Tondo, 1880");
  await r.page.keyboard.press("e"); await r.page.waitForTimeout(1000); await r.page.keyboard.press("e");
  await waitIntertitle(r.page, false, 8000);
  let c = await readConversation(r.page, 3);
  ok("and plays the siga again", JSON.stringify(c.lines) === JSON.stringify(OPENING), c.lines);
  await r.ctx.close();

  r = await resume("bahay", { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true });
  c = await readConversation(r.page, 1);
  const rb = await r.page.evaluate(() => ({ scene: currentSceneId, x: posX,
    nanay: !NPCS.find((n) => n.id === "nanay").hidden }));
  ok("a Block 52 save at home lands on the street beside Nanay, on the thought",
     c.lines[0] === THOUGHT && rb.scene === "tondo" && rb.x === 1880 && rb.nanay, { c: c.lines, rb });
  await r.ctx.close();

  r = await resume("patahian", { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true,
    nakausapAngKutsero: true, nakausapAngMananahi: true, sapatNaAngIpon: true, naibigayAngIponKayNanay: true });
  const rp = await intertitle(r.page);
  ok("a Block 56 save in the tailor's shop plays 1884 and the errand on the street",
     rp.lines[0] === "1884" && await r.page.evaluate(() => currentSceneId === "tondo"), rp);
  await waitIntertitle(r.page, false, 15000);
  c = await readConversation(r.page, 3);
  ok("the errand, beside the Mananahi", JSON.stringify(c.lines) === JSON.stringify(ERRAND) &&
     await r.page.evaluate(() => posX === 6280));
  ok("and a save from after the years loads the street already cleared", await r.page.evaluate(() =>
    JSON.stringify(NPCS.filter((n) => !n.hidden).map((n) => n.id)) === '["nanay","mananahi","direktor"]'));
  await r.ctx.close();

  r = await resume("tondo", { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true,
    nakausapAngKutsero: true, kinitaSaKutsero: 30 }, 30);
  await r.page.waitForTimeout(400);
  const rj = await r.page.evaluate(() => ({ cut: cutscenePlaying, box: !dialogueBox.classList.contains("hidden"),
    title: !document.getElementById("intertitle").classList.contains("hidden"),
    toast: document.getElementById("toast").classList.contains("hidden") }));
  const rl = await log(r.page);
  ok("a Block 56 save mid-job lands on the apples, with nothing replayed and no toast",
     !rj.cut && !rj.box && !rj.title && rj.toast &&
     JSON.stringify(rl.current) === JSON.stringify([STEP.apples + " (0/3)"]), { rj, rl });
  await r.ctx.close();

  // ---------------------------------------------------------------
  console.log("\nGuest");
  const g = await newPage(browser, { session: null });
  await g.page.click("#shell-guest");
  await g.page.waitForTimeout(700);
  ok("a guest opens on Tondo, 1880 too", (await intertitle(g.page)).lines[0] === "Tondo, 1880");
  await waitIntertitle(g.page, false, 15000);
  c = await readConversation(g.page, 3);
  ok("and watches the same opening", JSON.stringify(c.lines) === JSON.stringify(OPENING), c.lines);
  await g.ctx.close();

  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
