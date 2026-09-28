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
// horse, 50 barya) and the Mananahi's (two customers, then the
// direktor last). Since Block 59: the direktor's missing actor, the
// play inside the entablado (backstage, the curtain, the fight, the
// pay), the Mananahi's pay, Nanay's gift with no jump in time, the act
// held open, and the finished tasks listed in settings.
// It also checks that a reload in the middle of a script replays it,
// that saves from Blocks 52 to 57 land somewhere sensible, and that a
// guest gets the same opening.
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
    NPCS.forEach((n) => { if (!n.hidden && !n.scenery && n.x < x + TRUNK && n.x + NPC_WIDTH > x - TRUNK) blocked.push(n.id + " at " + x); });
    (scene.exits || []).forEach((e) => { if (e.x < x + TRUNK && e.x + (e.width || 80) > x - TRUNK) blocked.push(e.id + " at " + x); });
    (scene.checkpoints || []).forEach((c) => { if (Math.abs(c.x + PLAYER_WIDTH / 2 - x) < TRUNK + PLAYER_WIDTH / 2) blocked.push("checkpoint " + c.x); });
    (scene.hintSpots || []).forEach((h) => { const hx = typeof h === "number" ? h : h.x;
      if (Math.abs(hx + PICKUP_SIZE / 2 - x) < TRUNK + PICKUP_SIZE / 2) blocked.push("paper " + hx); });
  });
  return {
    tiles: tiles.length, expectedTiles: Math.ceil(WORLD_WIDTH / (scene.panelWidth || PANEL_WIDTH)),
    joins, treesAt: trees.map((t) => parseFloat(t.style.left) + SHADOW_TREE_WIDTH / 2),
    treeZ: trees.length ? +getComputedStyle(trees[0]).zIndex : null,
    playerZ: +getComputedStyle(document.getElementById("player")).zIndex,
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


// Block 68. Sits whatever the quiz overlay puts up (the trivia card,
// then the pre-test's questions), always answering the first choice.
const sitTests = async (page) => {
  const seen = { trivia: false, triviaText: "", questions: 0 };
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => ({
      up: !document.getElementById("quiz").classList.contains("hidden"),
      eyebrow: document.getElementById("quiz-eyebrow").textContent,
      body: document.getElementById("quiz-question").textContent,
      choices: document.querySelectorAll(".quiz-choice").length,
    }));
    if (!st.up) { if (i > 2) break; await page.waitForTimeout(200); continue; }
    if (/Alam mo ba/.test(st.eyebrow)) { seen.trivia = true; seen.triviaText = st.body; }
    if (st.choices) { seen.questions++; await page.click(".quiz-choice"); }
    await page.click("#quiz-btn");
    await page.waitForTimeout(150);
  }
  return seen;
};

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
// The proponents' five lines. Block 59 tells the play between the third
// and the fourth.
const NANAY_THANKS_OWN = [
  "Macario: Nay, nakapag-ipon na ako ng pera para makatulong",
  "Nanay: Maraming salamat anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?",
  "Macario: Opo Nay, nagtrabaho ako para sa Kutsero at mananahi",
  "Nanay: Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay",
  "Macario: Maraming salamat nay!",
];
const STEP = {
  kutsero: "Maghanap ng trabaho: kausapin ang Kutsero",
  apples: "Kumuha ng tatlong mansanas at ipakain sa kabayo",
  payK: "Kunin ang bayad sa Kutsero",
  mananahi: "Kausapin ang Mananahi",
  clothes: "Ihatid ang mga tinahing damit",
  play: "Gumanap bilang Don Rodrigo sa dula",
  payM: "Kunin ang bayad sa Mananahi",
  nanay: "Ibigay kay Nanay ang naipon",
};
const PANIC_FIRST = "Direktor: Teka... nasaan na ba si Julian?";
const PANIC_YES = "Macario: Sige po. Susubukan ko.";
const BACKSTAGE_FIRST = "Maryam: Ikaw ba 'yung papalit kay Julian?";

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

// STORY.md is the script of content/act1.js, changed with it. Every line
// of dialogue (text, and a customer's waiting, thanks and after) and
// every black card in the content must appear there word for word. Read
// from the source rather than from the running game, so lines no test
// walks to (a repeat visit, a reload branch) are held to it too.
const storyDrift = () => {
  const src = fs.readFileSync(path.join(ROOT, "content", "act1.js"), "utf8");
  const story = fs.readFileSync(path.join(ROOT, "STORY.md"), "utf8");
  const lines = [];
  for (const m of src.matchAll(/\b(?:text|waiting|thanks|after):\s*("(?:[^"\\]|\\.)*")/g)) lines.push(JSON.parse(m[1]));
  for (const m of src.matchAll(/playIntertitle\(\[([^\]]*)\]/g)) {
    for (const s of m[1].matchAll(/"(?:[^"\\]|\\.)*"/g)) lines.push(JSON.parse(s[0]));
  }
  return { count: lines.length, missing: lines.filter((l) => !story.includes(l)) };
};

// Block 77. ART.md's Owed list is every picture the game asks for that
// is not on disk: nothing missing and unlisted, nothing listed and
// already arrived. The search is _dev/tools/missing-art.js's own.
const artDrift = () => {
  const { findArt } = require(path.join(ROOT, "_dev", "tools", "missing-art.js"));
  const missing = findArt().filter((a) => !a.exists).map((a) => a.file);
  const md = fs.readFileSync(path.join(ROOT, "ART.md"), "utf8").replace(/\r\n/g, "\n");
  const owed = (md.split("\n## Owed")[1] || "").split("\n## ")[0];
  const listed = [...new Set([...owed.matchAll(/assets\/\S+\.(?:png|jpe?g)/gi)].map((m) => m[0]))];
  return { missing, listed,
    unlisted: missing.filter((f) => !listed.includes(f)),
    arrived: listed.filter((f) => !missing.includes(f)) };
};

(async () => {
  console.log("\nART.md");
  const art = artDrift();
  ok("ART.md lists every picture the game asks for that is missing (" + art.missing.length + ")",
     art.missing.length > 0 && art.unlisted.length === 0, art.unlisted);
  ok("and nothing in its Owed list has already arrived", art.arrived.length === 0, art.arrived);

  console.log("\nSTORY.md");
  const drift = storyDrift();
  ok("every line and black card in content/act1.js is in STORY.md (" + drift.count + ")",
     drift.count > 100 && drift.missing.length === 0, drift.missing);

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
  const sat = await sitTests(page);
  ok("a new student meets the built-in trivia card and the ten-question pre-test (Block 68)",
     sat.trivia && /Macario Sakay/.test(sat.triviaText) && sat.questions === 10, sat);
  const pre = await page.evaluate(() => __DB.assessment_scores.map((r) => ({ t: r.test_type, s: r.score, m: r.max_score })));
  ok("the game grades the pre-test itself and records the score",
     pre.length === 1 && pre[0].t === "pre" && pre[0].m === 10, pre);
  ok("act status is playing", (await page.evaluate(() => Acts.status)) === "playing");
  ok("Act I has nine objectives, pays no barya per step, and is held open",
     await page.evaluate(() => Acts.objectivesFor(1).length === 9 && Acts.perObjective(2) === 0 &&
       ACT_1.holdOpen === true));
  ok("one street, the entablado and the guards' room (Block 73), and no other scene", await page.evaluate(() =>
    JSON.stringify(SCENES.map((s) => s.id)) === '["tondo","entablado","bantayan"]' &&
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

  // Block 72. The siga have art of their own: an idle and a walk each,
  // loaded rather than boxes, and three sizes.
  const siga = await page.evaluate(() => ["siga-1", "siga-2", "siga-3"].map((id) => {
    const d = currentScene.decorations.find((x) => x.id === id);
    return {
      idle: !!d.spriteEl && !d.spriteEl.classList.contains("sprite-placeholder") && !d.animation.failed,
      walk: !!d.walkSpriteEl && !d.walkSpriteEl.classList.contains("sprite-placeholder") && !d.walkAnimation.failed,
      height: d.displayHeight,
    };
  }));
  ok("the three siga have their own idle and walk sheets, not placeholder boxes",
     siga.every((g) => g.idle && g.walk), siga);
  ok("and stand at three heights, the big one tallest",
     siga[1].height > siga[0].height && siga[0].height > siga[2].height, siga);

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
    cut: cutscenePlaying, barya: Game.currency(), scene: currentSceneId,
    card: !document.getElementById("intertitle").classList.contains("hidden") }));
  const l1 = await log(page);
  ok("the next task is the Kutsero, announced as Bagong gawain",
     JSON.stringify(l1.current) === JSON.stringify([STEP.kutsero]) && after.toast === "Bagong gawain: " + STEP.kutsero, { l1, after });
  ok("the opening ends on the street, with no card and no test room (Block 74)",
     after.scene === "tondo" && !after.card, after);
  ok("no Tapos na button under the log any more (Block 57)", !l1.toggle);
  ok("the world is his again, no barya yet", !after.cut && after.barya === 0, after);
  const settingsList = await doneInSettings(page);
  ok("the finished task is listed in settings", JSON.stringify(settingsList) === '["Umuwi kasama si Nanay"]', settingsList);
  await page.waitForTimeout(1200);
  ok("the first step is saved and counted", await page.evaluate(() =>
    __DB.game_progress[0].save_state.flags.nagpasyangMagtrabaho === true && Acts.countDone(1) === 1));

  // ---------------------------------------------------------------
  // Block 74. The test room, outside the story: the Test Room button in
  // settings, a "<WIP>" card, the guards' room (Block 73), and its door
  // back to wherever he was.
  // ---------------------------------------------------------------
  console.log("\nThe Test Room, from settings (Blocks 73 and 74)");
  await walkTo(page, 2600);
  await page.evaluate(() => { facing = -1; });
  await page.waitForTimeout(100);
  const storyBefore = await page.evaluate(() =>
    JSON.stringify(Object.keys(state.flags).filter((k) => !k.startsWith("__")).sort().map((k) => [k, state.flags[k]])));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.click("#shell-pause-settings");
  await page.waitForTimeout(150);
  ok("settings, from pause, offers the Test Room", await visible(page, "#shell-testroom") &&
     (await page.evaluate(() => document.querySelector("#shell-testroom .lbl").textContent)) === "Test Room");
  await page.click("#shell-testroom");
  ok("it closes the screens and a black card reads <WIP>", await waitIntertitle(page, true, 4000) &&
     JSON.stringify((await intertitle(page)).lines) === '["<WIP>"]' &&
     await page.evaluate(() => document.getElementById("shell").classList.contains("hidden") && Shell.state === "playing"));
  // Until the room is on screen, whenever the card is not black the
  // scene fade's own black is: the street is never seen between them.
  const between = await page.evaluate(async () => {
    const card = document.getElementById("intertitle");
    const seen = { gaps: 0, reached: false };
    for (let i = 0; i < 300; i++) {
      if (currentSceneId === "bantayan") { seen.reached = true; break; }
      const cardBlack = !card.classList.contains("hidden") && card.classList.contains("visible");
      if (!cardBlack && !blackout.classList.contains("visible")) seen.gaps += 1;
      await new Promise((r) => setTimeout(r, 40));
    }
    return { gaps: seen.gaps, reached: seen.reached };
  });
  ok("the card lifts onto black and the fade takes him to the guards' room, with no street between",
     between.reached && between.gaps === 0, between);
  ok("the card lifts onto black and the fade takes him to the guards' room, with no street between",
     between.reached && between.gaps === 0, between);
  ok("the room is on screen", await waitForScene(page, "bantayan"));
  await settle(page);
  const room = await page.evaluate(() => ({
    x: posX, facing, cut: cutscenePlaying, hearts: !document.getElementById("hud").classList.contains("hidden"),
    guards: GUARDS.map((g) => ({
      id: g.id, shoots: !!g.shoots,
      art: [g.spriteEl, g.walkSpriteEl, g.shootSpriteEl].every((el) => el && !el.classList.contains("sprite-placeholder")) &&
        ![g.animation, g.walkAnimation, g.shootAnimation].some((s) => s.failed),
    })),
    door: (currentScene.exits || []).map((e) => e.label + ">" + e.toScene),
    platforms: PLATFORMS.length, hide: HIDE_SPOTS.length, music: currentScene.music,
  }));
  ok("he stands at the room's start, free to move, with his hearts showing",
     room.x === 150 && room.facing === 1 && !room.cut && room.hearts, room);
  const typed = await page.evaluate(() => GUARDS.map((g) => ({ type: g.type, kind: g.kind,
    radius: g.detectRadius, src: g.animation.src })));
  ok("the room's guards are the catalogue's bantay, a placement's own numbers winning (Block 76)",
     typed.every((g) => g.type === "bantay" && g.kind === "guard" && /bantay.png$/.test(g.src)) &&
     JSON.stringify(typed.map((g) => g.radius)) === "[260,280,300]", typed);
  ok("three guards who shoot, each with his own standing, walking and shooting sheets loaded",
     room.guards.length === 3 && room.guards.every((g) => g.shoots && g.art), room.guards);
  ok("a platform, a crate to hide behind, and a door back to the street",
     room.platforms === 1 && room.hide === 1 && JSON.stringify(room.door) === '["Lumabas>tondo"]', room);

  const poses = await page.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 300));
    const byId = (id) => GUARDS.find((g) => g.id === id);
    const walker = byId("bantay-1"), sentry = byId("bantay-2");
    const frames = new Set();
    const bg = () => walker.walkSpriteEl.style.backgroundPosition;
    for (let i = 0; i < 20; i++) { frames.add(bg()); await new Promise((r) => setTimeout(r, 50)); }
    return {
      walker: walker.drawnPose, walkShown: walker.walkSpriteEl.style.display !== "none" &&
        walker.spriteEl.style.display === "none", walkFrames: frames.size,
      sentry: sentry.drawnPose, sentryShown: sentry.spriteEl.style.display !== "none",
    };
  });
  ok("a guard on patrol shows his walk, stepping through its frames; the sentry stands",
     poses.walker === "walk" && poses.walkShown && poses.walkFrames >= 4 &&
     poses.sentry === "idle" && poses.sentryShown, poses);

  // In front of the sentry, who faces right: he fills his meter, turns
  // hostile, stops, levels his rifle and fires from its muzzle.
  const shot = await page.evaluate(async () => {
    const sentry = GUARDS.find((g) => g.id === "bantay-2");
    posX = sentry.pos + GUARD_WIDTH + 120;
    const real = window.guardFire;
    let fired = null;
    window.guardFire = (g, now) => {
      const aimedFor = now - g.aimSince;
      real(g, now);
      const b = GUARD_BULLETS[GUARD_BULLETS.length - 1];
      fired = fired || { id: g.id, aiming: g.aiming, aimedFor, raise: guardRaiseMs(g),
        frame: guardShootFrame(g, now), x: b.x, y: b.y, centre: g.pos + GUARD_WIDTH / 2,
        floor: floorHeightAt(g.pos), pose: g.drawnPose };
    };
    let hostileAt = null, moved = false;
    const start = sentry.pos;
    for (let i = 0; i < 120 && !fired; i++) {
      if (sentry.hostile && hostileAt === null) hostileAt = i;
      if (sentry.pos !== start) moved = true;
      await new Promise((r) => setTimeout(r, 50));
    }
    window.guardFire = real;
    return { hostile: sentry.hostile, hostileAt, moved, fired, x: posX };
  });
  const s = shot.fired || {};
  const scale = 134 / 394;
  const muzzleAhead = (367 - 88) * scale, muzzleUp = (20 + 394 - 226) * scale;
  ok("seen, the sentry turns hostile and fires without walking, the rifle levelled first",
     shot.hostile && shot.hostileAt !== null && !shot.moved && s.aiming && s.aimedFor >= s.raise &&
     s.pose === "shoot", shot);
  ok("the flash frame is the frame the bullet leaves on", s.frame === 3, s);
  ok("and the bullet leaves from his muzzle",
     Math.abs(s.x - (s.centre + muzzleAhead)) < 1 && Math.abs(s.y - (s.floor + muzzleUp - 5)) < 1, s);

  // Block 75. Punched, the sentry reels in his hit sheet and slides away;
  // shot, he topples the way the shot went.
  const blows = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-2");
    const shown = (el) => el && el.style.display !== "none";
    posX = g.pos + GUARD_WIDTH + 20; facing = -1; invulnUntil = performance.now() + 5000;
    const x0 = g.pos;
    meleeAttack();
    drawGuard(g);
    const punched = { hp: g.hp, pose: g.drawnPose, hitShown: shown(g.hitSpriteEl), leftward: g.pos < x0 };
    await new Promise((r) => setTimeout(r, 600));
    posX = g.pos + 220; facing = -1; destroyProjectile();
    throwProjectile();
    for (let i = 0; i < 60 && !g.disabled; i++) await new Promise((r) => setTimeout(r, 25));
    return { punched, down: g.disabled, left: g.el.classList.contains("guard-fall-left"),
      pose: g.drawnPose, frame: guardHitFrame(g, performance.now()),
      art: !g.hitSpriteEl.classList.contains("sprite-placeholder") && !g.hitAnimation.failed };
  });
  ok("punched, a bantay reels in his own hit sheet and slides away (Block 75)",
     blows.punched.hp === 1 && blows.punched.pose === "hit" && blows.punched.hitShown &&
     blows.punched.leftward && blows.art, blows);
  ok("shot, he falls the way the shot went, leaning back as he goes",
     blows.down && blows.left && blows.pose === "hit" && blows.frame === 1, blows);

  ok("settings does not offer the Test Room inside it", await (async () => {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await page.click("#shell-pause-settings");
    await page.waitForTimeout(150);
    const shown = await visible(page, "#shell-testroom");
    await page.click("#shell-settings-back");
    await page.waitForTimeout(100);
    await page.click("#shell-resume");
    await page.waitForTimeout(200);
    return !shown;
  })());

  // Out through the door, back to where he was. The guards are put down
  // first so the harness is not shot on the way.
  await page.evaluate(() => { GUARDS.forEach((g) => { g.disabled = true; drawGuard(g); }); clearGuardBullets(); });
  await walkTo(page, 4350 - 100);
  await page.waitForTimeout(300);
  await page.keyboard.press("e");
  ok("Lumabas leads back to the street", await waitForScene(page, "tondo"));
  await settle(page);
  const back = await page.evaluate(() => ({ x: posX, facing, scene: currentSceneId, ret: state.flags.__returnTo,
    story: JSON.stringify(Object.keys(state.flags).filter((k) => !k.startsWith("__")).sort().map((k) => [k, state.flags[k]])) }));
  ok("to the very spot he left, facing the same way", back.x === 2600 && back.facing === -1 && back.ret === undefined, back);
  ok("and the story is untouched: the same flags, the Kutsero still the task, one step counted",
     back.story === storyBefore && JSON.stringify((await log(page)).current) === JSON.stringify([STEP.kutsero]) &&
     await page.evaluate(() => Acts.countDone(1) === 1), { before: storyBefore, after: back.story });

  // ---------------------------------------------------------------
  console.log("\nThe Kutsero's job: apples, the horse, the pay");
  await walkTo(page, 3200);
  await page.keyboard.press("e");
  const k1 = await readConversation(page, 5);
  ok("the Kutsero's lines as written, then what the job is",
     JSON.stringify(k1.lines.slice(0, 4)) === JSON.stringify(KUTSERO) && /mansanas/.test(k1.lines[4] || ""), k1.lines);
  await page.waitForTimeout(200);
  ok("the task counts the apples (0/3)", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.apples + " (0/3)"]));
  ok("the horse is too early to feed", await page.evaluate(() => !canGiveGift(NPCS.find((n) => n.id === "kabayo"))));

  await walkTo(page, 5740);
  const treeBtn = await page.evaluate(() => ({ label: document.querySelector("#btn-interact .lbl").textContent,
    picture: document.getElementById("npc-puno").children.length,
    join: panelJoins(currentScene).includes(NPCS.find((n) => n.id === "puno").x + NPC_WIDTH / 2),
    broadleaf: document.querySelectorAll(".shadow-tree")[3].style.backgroundImage === SHADOW_TREE_URLS[3] }));
  ok("the apple tree is the silhouette tree at 5800, with no picture of its own, and reads Pumitas (Block 69)",
     treeBtn.label === "Pumitas" && treeBtn.picture === 0 && treeBtn.join && treeBtn.broadleaf, treeBtn);
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
  ok("(3/3)", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.apples + " (3/3)"]));

  await walkTo(page, 3480);
  ok("beside the horse, the button reads Ipakain ang mansanas", (await gift(page)) === "Ipakain ang mansanas");
  const h1 = await readConversation(page, 2);
  ok("Macario feeds him", h1.lines.length === 2 && /^Macario:/.test(h1.lines[0]), h1.lines);
  await page.waitForTimeout(200);
  ok("the task moves to the Kutsero's pay", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.payK]));
  await walkTo(page, 3200);
  ok("beside the Kutsero, Kunin ang bayad", (await gift(page)) === "Kunin ang bayad");
  await readConversation(page, 2);
  ok("he is paid exactly 50", (await page.evaluate(() => Game.currency())) === 50);


  // ---------------------------------------------------------------
  console.log("\nThe Mananahi's job: two customers, then the direktor");
  ok("the next task is the Mananahi", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.mananahi]));
  await walkTo(page, 6300);
  await page.keyboard.press("e");
  const m1 = await readConversation(page, 8);
  ok("the Mananahi's lines as written, then the three orders, the direktor's last",
     JSON.stringify(m1.lines.slice(0, 4)) === JSON.stringify(MANANAHI) && /Aling Rosa/.test(m1.lines[4] || "") &&
     /direktor/.test(m1.lines[4] || "") && /huling/.test(m1.lines[5] || "") && m1.lines.length === 7, m1.lines);
  await page.waitForTimeout(200);
  ok("the task counts the deliveries (0/3)", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.clothes + " (0/3)"]));

  await walkTo(page, 13480);
  ok("the direktor will not take his before the other two", (await gift(page)) === null);
  await page.keyboard.press("e");
  const early = await readConversation(page, 2);
  ok("and says so", early.lines.length === 1 && /Ihatid mo muna/.test(early.lines[0]), early.lines);
  await walkTo(page, 6300);

  const customers = [["Aling Rosa", 7700], ["Mang Tomas", 9200]];
  for (let i = 0; i < customers.length; i++) {
    const [name, x] = customers[i];
    await walkTo(page, x);
    ok(name + ": Iabot ang damit", (await gift(page)) === "Iabot ang damit");
    const cl = await readConversation(page, 2);
    await page.waitForTimeout(150);
    const cur = (await log(page)).current[0];
    ok(name + " thanks him, and the count moves",
       cl.lines.length === 2 && cl.lines[1].startsWith(name + ":") &&
       cur === STEP.clothes + " (" + (i + 1) + "/3)", { cl: cl.lines, cur });
  }

  // ---------------------------------------------------------------
  console.log("\nThe direktor's missing actor");
  await walkTo(page, 13480);
  ok("beside him: Iabot ang damit", (await gift(page)) === "Iabot ang damit");
  const d0 = await readConversation(page, 2);
  ok("Macario hands over the costumes", d0.lines.length === 2 && /^Macario:/.test(d0.lines[0]), d0.lines);
  const panic = await readConversation(page, 30);
  ok("the direktor finds his lead actor missing and asks Macario to take the part",
     panic.lines[0] === PANIC_FIRST && panic.lines.includes(PANIC_YES) && panic.lines.length === 18, panic.lines);
  ok("the delivery step is done only once Macario says yes", await page.evaluate(() =>
    state.flags.naihatidKay_direktor === true && state.flags.naihatidAngMgaDamit === true));
  ok("the fade into the entablado", await waitForScene(page, "entablado"));
  const ent = await page.evaluate(() => ({ x: posX,
    ids: NPCS.map((n) => n.id).sort().join(","),
    bg: getComputedStyle(document.getElementById("skyline")).getPropertyValue("--skyline-src") }));
  ok("inside, on its own painting, with the direktor and Maryam", ent.x === 560 && ent.ids === "direktor,maryam" &&
     /entablado-inside/.test(ent.bg), ent);
  ok("the task is the play", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.play]));

  // ---------------------------------------------------------------
  console.log("\nThe play");
  const b1 = await readConversation(page, 12);
  ok("backstage, Maryam walks him through it", b1.lines[0] === BACKSTAGE_FIRST && b1.lines.length === 10 &&
     /telon/.test(b1.lines[9]), b1.lines);
  ok("the curtain opens on black", await waitIntertitle(page, true, 3000) &&
     (await intertitle(page)).lines[0] === "Bumukas ang telon.");
  await waitIntertitle(page, false, 12000);
  const s1 = await readConversation(page, 8);
  ok("the first scene: a forgotten line, a whisper from the wings, a line of his own",
     s1.lines.length === 8 && s1.lines[1] === "Macario: ..." && /^Direktor \(pabulong\):/.test(s1.lines[2]) &&
     /mawalay/.test(s1.lines[4]), s1.lines);
  ok("he is on his mark beside Maryam", await page.evaluate(() => posX === 440));
  const s2 = await readConversation(page, 4);
  const sultan = await page.evaluate(() => ({ shown: document.getElementById("dec-sultan").style.display !== "none" }));
  ok("the Sultan walks on and calls his soldiers", s2.lines.length === 4 && /^Sultan:/.test(s2.lines[0]) &&
     /Dakpin/.test(s2.lines[2]) && sultan.shown, { s2: s2.lines, sultan });

  let fight;
  for (let i = 0; i < 40; i++) {
    fight = await page.evaluate(() => ({ n: ENEMIES.length, alive: ENEMIES.filter((e) => !e.dead).length,
      hearts: !document.getElementById("hud").classList.contains("hidden"), cut: cutscenePlaying,
      noRanged: Boolean(currentScene.noRanged) }));
    if (fight.n) break;
    await page.waitForTimeout(100);
  }
  ok("four soldiers come on, the hearts show, and he is free to fight with no gun",
     fight.n === 4 && fight.alive === 4 && fight.hearts && !fight.cut && fight.noRanged, fight);
  const kawal = await page.evaluate(() => ENEMIES.map((e) => ({ type: e.type, kind: e.kind, hp: e.hp,
    walk: e.animation.src, sword: e.attackAnimation && e.attackAnimation.src })));
  ok("they are the catalogue's kawal: its sheets and its hp (Block 76)",
     kawal.every((e) => e.type === "kawal" && e.kind === "enemy" && e.hp === 2 &&
       /muslim-walk.png$/.test(e.walk) && /muslim-attack.png$/.test(e.sword)), kawal);
  await page.evaluate(() => ENEMIES.forEach((e) => hitEnemy(e, 99)));
  const s3 = await readConversation(page, 5);
  ok("the Sultan comes back and gives his blessing, and the crowd cheers",
     s3.lines.length === 5 && /basbas/.test(s3.lines[3]) && /^Mga Manonood:/.test(s3.lines[4]), s3.lines);
  ok("the curtain closes", await waitIntertitle(page, true, 3000) &&
     (await intertitle(page)).lines[0] === "Nagsara ang telon.");
  await waitIntertitle(page, false, 12000);
  const before = await page.evaluate(() => Game.currency());
  const s4 = await readConversation(page, 7);
  await page.waitForTimeout(200);
  const s5 = await readConversation(page, 2);
  const afterPay = await page.evaluate(() => Game.currency());
  ok("in the wings, the direktor is overjoyed and pays him 79 to 110",
     s4.lines.length === 7 && /Nakatayo/.test(s4.lines[0]) && s5.lines.length === 2 &&
     afterPay - before >= 79 && afterPay - before <= 110 && before === 50, { s4: s4.lines, s5: s5.lines, before, afterPay });
  await page.waitForTimeout(400);
  ok("the play is done, and the world is his", await page.evaluate(() =>
    state.flags.naitanghalAngDula === true && !cutscenePlaying));
  await walkTo(page, 1080);
  await page.keyboard.press("e");
  ok("Lumabas: back on the street by the direktor", await waitForScene(page, "tondo") && (await settle(page), true) &&
     await page.evaluate(() => posX === 13480));

  // ---------------------------------------------------------------
  console.log("\nThe Mananahi's pay, and Nanay");
  ok("the next task is the Mananahi's pay", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.payM]));
  await walkTo(page, 6300);
  await page.keyboard.press("e");
  const m2 = await readConversation(page, 6);
  ok("she has heard about the play", m2.lines.length === 5 && /bumida/.test(m2.lines[0]), m2.lines);
  ok("Kunin ang bayad", (await gift(page)) === "Kunin ang bayad");
  await readConversation(page, 2);
  await page.waitForTimeout(200);
  ok("paid 50 more", (await page.evaluate(() => Game.currency())) === afterPay + 50);
  ok("the task is to give Nanay the savings (100/100)",
     JSON.stringify((await log(page)).current) === JSON.stringify([STEP.nanay + " (100/100)"]));

  await walkTo(page, 1880);
  ok("beside Nanay: Ibigay ang ipon", (await gift(page)) === "Ibigay ang ipon");
  const n1 = await readConversation(page, 10);
  ok("Nanay's lines as written, with the play told in the middle",
     n1.lines.length === 9 && JSON.stringify([...n1.lines.slice(0, 3), ...n1.lines.slice(7)]) === JSON.stringify(NANAY_THANKS_OWN) &&
     /entablado/.test(n1.lines[3]), n1.lines);
  ok("the savings are spent, and he keeps the rest", (await page.evaluate(() => Game.currency())) === afterPay + 50 - 100);
  await page.waitForTimeout(1500);
  ok("no jump in time: no black card after Nanay", !(await intertitle(page)).up);
  ok("every step is done and Act I stays open: no post-test (holdOpen)", await page.evaluate(() =>
    Acts.countDone(1) === 9 && Acts.status === "playing" &&
    document.getElementById("act-screen").classList.contains("hidden")));
  const all = await doneInSettings(page);
  ok("settings lists all nine finished tasks", all.length === 9 && all[0] === "Umuwi kasama si Nanay", all);
  const street = await page.evaluate(() => NPCS.filter((n) => !n.hidden).map((n) => n.id).join(","));
  ok("the street keeps everyone (no clearing any more)",
     street === "nanay,kutsero,kabayo,puno,mananahi,aling-rosa,mang-tomas,direktor", street);
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
  const resume = async (room, flags, currency, extra) => {
    const r = await newPage(browser, Object.assign({
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: room, currency: currency || 0,
        save_state: { quests: [], flags, posX: 300 } }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 0 }],
    }, extra || {}));
    await r.page.click("#shell-start");
    await r.page.waitForTimeout(700);
    return r;
  };
  const upToMananahi = { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true,
    nakausapAngKutsero: true, napakainAngKabayo: true, nabayaranNgKutsero: true, nakausapAngMananahi: true };
  const delivered = Object.assign({}, upToMananahi,
    { naihatidKay_aling_rosa: true, naihatidKay_mang_tomas: true, naihatidSaDalawangSuki: true, naihatidKay_direktor: true });

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

  r = await resume("tondo", delivered, 50);
  const rpX = await r.page.evaluate(() => posX);
  c = await readConversation(r.page, 30);
  ok("a reload after handing the direktor his costumes plays his scene again, beside him",
     c.lines[0] === PANIC_FIRST && c.lines.includes(PANIC_YES) && rpX === 13480, { lines: c.lines, rpX });
  ok("and takes him inside", await waitForScene(r.page, "entablado"));
  await r.ctx.close();

  r = await resume("entablado", Object.assign({}, delivered, { naihatidAngMgaDamit: true }), 50);
  c = await readConversation(r.page, 1);
  ok("a reload inside before the play is over plays it again from backstage",
     c.lines[0] === BACKSTAGE_FIRST && await r.page.evaluate(() => currentSceneId === "entablado"), c.lines);
  await r.ctx.close();

  r = await resume("tondo", Object.assign({}, upToMananahi, { naihatidAngMgaDamit: true }), 50);
  await r.page.waitForTimeout(300);
  ok("a Block 57 save with every delivery done is on the play step",
     JSON.stringify((await log(r.page)).current) === JSON.stringify([STEP.play]));
  await walkTo(r.page, 13480);
  await r.page.keyboard.press("e");
  c = await readConversation(r.page, 2);
  ok("who takes him inside", c.lines.length === 1 && /sa loob/.test(c.lines[0]) && await waitForScene(r.page, "entablado"), c.lines);
  await r.ctx.close();

  r = await resume("patahian", Object.assign({}, upToMananahi,
    { naihatidAngMgaDamit: true, nabayaranNgMananahi: true, naibigayAngIponKayNanay: true, natanggapAngPadala: true }));
  await r.page.waitForTimeout(400);
  ok("a Block 56 or 57 save past the savings lands on the street with every step done, and no 1884",
     await r.page.evaluate(() => currentSceneId === "tondo" && Acts.countDone(1) === 9) && !(await intertitle(r.page)).up);
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
  // Block 69. Act I declares no words and there is no guide. Block 70:
  // the Talaan's papers are the teacher's, three at fixed places; with
  // none written there is no Talaan at all.
  // ---------------------------------------------------------------
  console.log("\nThe teacher's Talaan papers, no guide");
  const afterThought = { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true };
  r = await resume("tondo", afterThought);
  await r.page.waitForTimeout(400);
  const bare = await r.page.evaluate(() => ({
    book: Game.glossary(), hints: PICKUPS.filter((p) => p.type === "hint").length,
    button: !document.getElementById("shell-notebook").classList.contains("hidden"),
    guide: ACT_1.guide, marker: document.getElementById("guide-marker"),
    spots: JSON.stringify(currentScene.hintSpots), fixed: ACT_1.hints.fixed, count: ACT_1.hints.count }));
  ok("Act I has three fixed places for papers, no words and no guide",
     bare.spots === '[2500,{"x":8200,"y":155},{"x":12200,"y":155}]' && bare.fixed === true && bare.count === 3 &&
     bare.guide === undefined && bare.marker === null, bare);
  ok("with no papers written, nothing lies on the road and there is no Talaan",
     bare.book === null && bare.hints === 0 && !bare.button, bare);
  await r.ctx.close();

  const PAPERS = { talaan_entries: [
    { act_number: 1, slot: 1, title: "Unang papel", body: "Isinulat ng guro." },
    { act_number: 1, slot: 3, title: "", body: "Ang ikatlo." },
  ] };
  r = await resume("tondo", afterThought, 0, PAPERS);
  await r.page.waitForTimeout(500);
  const laid = await r.page.evaluate(() => PICKUPS.filter((p) => p.type === "hint").map((p) => [p.x, p.y === undefined ? null : p.y]));
  ok("the teacher's papers lie at their slots' places, and an empty slot lays nothing",
     JSON.stringify(laid) === "[[2500,null],[12200,155]]", laid);
  const found = await r.page.evaluate(async () => {
    posX = 2500 + PICKUP_SIZE / 2 - PLAYER_WIDTH / 2; posY = floorHeightAt(posX); velY = 0; onGround = true;
    for (let i = 0; i < 50 && document.getElementById("page-card").classList.contains("hidden"); i++) {
      await new Promise((res) => setTimeout(res, 40));
    }
    const card = { eyebrow: document.getElementById("page-card-eyebrow").textContent,
      title: document.getElementById("page-card-title").textContent,
      note: document.getElementById("page-card-note").textContent };
    document.getElementById("page-card-close").click();
    await new Promise((res) => setTimeout(res, 100));
    posX = 2200;
    await saveProgress();
    return { card, saved: __DB.game_progress[0].save_state.flags.pahiwatig_0 };
  });
  ok("walking into the first opens it, and it is saved",
     found.card.eyebrow === "Papel 1 / 2" && found.card.title === "Unang papel" && found.card.note.length > 0 &&
     found.saved === true, found);
  await r.page.evaluate(() => Shell.openPause());
  await r.page.waitForTimeout(150);
  ok("the pause screen offers the Talaan, counting the papers",
     await r.page.evaluate(() => document.querySelector("#shell-notebook .lbl").textContent === "Talaan 1/2"));
  await r.ctx.close();

  r = await resume("tondo", Object.assign({ pahiwatig_0: true }, afterThought), 0, PAPERS);
  await r.page.waitForTimeout(500);
  const kept = await r.page.evaluate(() => ({
    laid: [...document.querySelectorAll(".pickup-page")].map((e) => parseInt(e.style.left, 10)),
    book: Game.glossary().hints }));
  ok("a reload keeps a found paper found, and lays only the other",
     JSON.stringify(kept.laid) === "[12200]" && kept.book.found === 1 && kept.book.total === 2, kept);
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

  const gp = await newPage(browser, Object.assign({ session: null }, PAPERS));
  await gp.page.click("#shell-guest");
  await gp.page.waitForTimeout(900);
  ok("a guest gets the teacher's papers too",
     await gp.page.evaluate(() => PICKUPS.filter((p) => p.type === "hint").length === 2 &&
       !__DB.game_progress.length));
  await gp.ctx.close();

  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
