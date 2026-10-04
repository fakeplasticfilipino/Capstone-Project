// =============================================================
// MACARIO — _dev/tests/verify_new_scene.js
//
// Drives the REAL content/act1.js and content/items.js (no fixture
// routes), the way _dev/tests/test.js Section A does, through the whole
// of Act I as it stands. Rewritten in Block 57 with the act: one street
// ten paintings long; "Tondo, 1890" on black; the siga and Nanay, who
// slides on, and the two of them walking off together to where she
// stays; the talk and the thought on the street; the Kutsero's job
// (apples caught in the mini-game with real key presses, fed to the
// horse, 50 barya) and the Mananahi's (two customers, then the
// direktor last). Since Block 59: the direktor's missing actor, the
// play inside the entablado (backstage, the curtain, the fight, the
// pay), the Mananahi's pay, and Nanay's gift. Since Block 80, the end of
// the act: four years on, Principe Baldovino, the Katipunan in the
// wings, the word to the Kasama, the oath in the pulungan, the three
// pamphlets, and the post-test opening; the finished tasks listed in
// settings. Since Block 113, Act II end to end as a guest, and a reload
// in the middle of its charge.
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
let PORT = Number(process.env.PORT) || 0; // 0: any free port (Block 115)
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

// Block 115. The suite in parts, each starting a browser page of its own
// and depending on no other part, so one can run alone while it is being
// worked on, and several at once (_dev/tests/run.js, and CI):
//   node _dev/tests/verify_new_scene.js --only=act1,act2   those parts
//   node _dev/tests/verify_new_scene.js --list             names them
// The story's own time runs SPEED times faster (game.js, TEST_SPEED):
// the pauses, black cards, fades and scripted walks, never the world a
// student plays against. --real runs it at a student's speed.
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  return arg ? new Set(arg.slice(7).split(",").map((x) => x.trim().toLowerCase()).filter(Boolean)) : null;
})();
const LIST = process.argv.includes("--list");
const SPEED = process.argv.includes("--real") ? 1 : 10;
const part = (id, title) => {
  const on = !LIST && !(ONLY && !ONLY.has(id));
  if (LIST) console.log("  " + id.padEnd(10) + title);
  return on;
};

const visible = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return getComputedStyle(el).display !== "none" && r.width > 0 && r.height > 0;
}, sel);

const INTERACT_DISTANCE_FOR_TEST = 90; // game.js INTERACT_DISTANCE

// Block 113. Act II's flags up to the charge at San Juan del Monte, for
// the reload check (content/act2.js, DEV_CHARGE).
const ACT2_CHARGE_FLAGS = { a2_simula: true, a2_nakalimbag: true, a2_umuwiNa: true,
  a2_nangako: true, a2_paghuli: true, a2_napansin: true, a2_nakitaAngRonda: true,
  a2_nakuhaAngListahan: true, a2_gabiNa: true, a2_nakita: true, a2_hinabol: true, a2_nakatakas: true,
  a2_nagtalumpati: true, a2_pinunit: true, a2_papuntangSanJuan: true };

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
// Block 92. The running count of the savings sits beside the step in
// hand (pinned), so "current" is the step and "pinned" the count; when the
// savings ARE the step in hand there is one line and current has it.
// Block 93. The way out of a room, when there is one, is its own line at
// the top (way), not a step.
const log = (page) => page.evaluate(() => {
  const all = [...document.querySelectorAll("#quest-list li:not(.quest-way)")].map((li) => li.textContent);
  const wayEl = document.querySelector("#quest-list li.quest-way");
  const isPin = (x) => /^Mag-ipon para kay Nanay/.test(x);
  const rest = all.filter((x) => !isPin(x));
  return {
    current: rest.length ? rest : all,
    pinned: all.filter(isPin),
    lines: all.length,
    way: wayEl ? wayEl.textContent : null,
    toggle: !!document.getElementById("quest-done-toggle"),
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
    const pressedAt = await page.evaluate(() => performance.now());
    await page.keyboard.press("e");
    // Block 115: until the line changes or the box closes, not a fixed
    // 140 ms a line (a next line that repeats this one waits it out).
    for (let t = 0; t < 1500 && (await line(page)) === l; t += 20) await page.waitForTimeout(20);
    // The box shut: the conversation is over unless the next opens
    // within READ_GAP of story time, as it did when this read 140 ms
    // after every press.
    const READ_GAP = 140;
    for (let t = 0; t < 2000; t += 10) {
      const d = await page.evaluate((at) => ({ shut: window.__dlg.closedAt > at, open: !dialogueBox.classList.contains("hidden"),
        gap: window.__dlg.openedAt > window.__dlg.closedAt ? window.__dlg.openedAt - window.__dlg.closedAt
          : performance.now() - window.__dlg.closedAt }), pressedAt);
      if (!d.shut) break;
      if (d.gap * SPEED > READ_GAP) return { lines, facings };
      if (d.open) break;
      await page.waitForTimeout(10);
    }
  }
  return { lines, facings };
};

// A black card before the fade (Block 80's) can hold the screen longer
// than the default six seconds; ms says how long to wait.
const waitForScene = async (page, id, ms) => {
  for (let i = 0; i < (ms || 6000) / 100; i++) {
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
  await page.route("**/js/vendor/supabase.js*", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }));
  await page.addInitScript((s) => { window.__TEST = s.test; window.__TEST_SPEED = s.speed; }, { test, speed: SPEED });
  // Block 115. When the dialogue box last closed and opened, so a reading
  // can tell one conversation from the next by the story time between
  // them (readConversation), whatever the speed.
  await page.addInitScript(() => {
    window.__dlg = { closedAt: 0, openedAt: 0 };
    document.addEventListener("DOMContentLoaded", () => {
      const box = document.getElementById("dialogue-box");
      if (!box) return;
      let shut = box.classList.contains("hidden");
      new MutationObserver(() => {
        const now = box.classList.contains("hidden");
        if (now === shut) return;
        shut = now;
        window.__dlg[now ? "closedAt" : "openedAt"] = performance.now();
      }).observe(box, { attributes: true, attributeFilter: ["class"] });
    });
  });
  await page.goto("http://localhost:" + PORT + "/index.html");
  await page.waitForTimeout(300);
  return { ctx, page };
};

const OPENING = [
  "Siga: Ano, Macario? Hinihintay mo pa rin ang tatay mo?",
  "Mga Siga: BAHAHAHAHAHAHA!",
  "Macario: Isara mo 'yang bunganga mo!",
];
const NANAY_ARRIVES = [
  "Nanay: Macario, umuwi na tayo. May kailangan akong sabihin sa'yo.",
  "Nanay: Tama na 'yan, anak. Huwag mo na silang pansinin.",
  "Macario: Tsk.",
];
// Block 87. The insult ends in a fight with the three siga. Waits for
// them, says what they are, and knocks them all down.
const winOpeningFight = (page) => page.evaluate(async () => {
  for (let i = 0; i < 100 && !(ENEMIES.length && enemiesAlive()); i++) await new Promise((r) => setTimeout(r, 50));
  await new Promise((r) => setTimeout(r, 400));
  const info = {
    count: ENEMIES.filter((e) => !e.dead).length,
    art: ENEMIES.every((e) => e.spriteEl && !e.spriteEl.classList.contains("sprite-placeholder")),
    hearts: !document.getElementById("hud").classList.contains("hidden"),
    cutscene: cutscenePlaying,
  };
  // Block 96. The big one is the artist's, with a punch and a flinch of
  // his own: hit once (of two) he shows the flinch, turned on Macario,
  // and the blow that drops him leaves him falling in it. The lesson
  // that holds the world for the first strike is put away first, or the
  // loop would not draw him.
  const big = ENEMIES.find((e) => e.id === "siga-away-2");
  const loaded = (el, sheet) => !!el && !!sheet && !sheet.failed && !el.classList.contains("sprite-placeholder");
  info.bigSheets = loaded(big.spriteEl, big.animation) && loaded(big.attackSpriteEl, big.attackAnimation) &&
    loaded(big.hitSpriteEl, big.hitAnimation);
  // Block 98. And so do the other two, the artist's too.
  info.allSheets = ENEMIES.length === 3 && ENEMIES.every((e) => loaded(e.spriteEl, e.animation) &&
    loaded(e.attackSpriteEl, e.attackAnimation) && loaded(e.hitSpriteEl, e.hitAnimation));
  cancelTutorial("atake", "tanda");
  hitEnemy(big, 1);
  for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(r));
  info.bigReels = big.hitSpriteEl.style.display !== "none" && big.spriteEl.style.visibility === "hidden" && !big.dead;
  info.bigFacesHim = big.facing === (Math.sign(posX + PLAYER_WIDTH / 2 - (big.pos + ENEMY_WIDTH / 2)) || big.facing);
  ENEMIES.forEach((e) => { if (!e.dead) hitEnemy(e, 99); });
  info.bigFallsInIt = big.dead && big.hitSpriteEl.style.display !== "none" && big.spriteEl.style.visibility === "hidden";
  return info;
});
const AT_HOME = [
  "Macario: 'Nay, ano po ba 'yung sasabihin n'yo?",
  "Nanay: Macario, anak, naubos na 'yung pera natin sa pagbili ko ng cedula...",
  "Nanay: Wala na tayong pambili ng bigas. Humingi na lang ako ng ulam sa kapitbahay para sa hapunan natin ngayon...",
  "Nanay: Pasensya ka na, anak, ha?",
  "Macario: Ayos lang po, 'Nay. Magtatrabaho na po ako para makatulong sa inyo.",
  "Nanay: Sigurado ka ba diyan, 'nak?",
  "Macario: Opo, 'Nay. Ako na po ang bahala.",
];
const THOUGHT = "Macario (sa isip): Kailangan ko ng pera para matulungan si Nanay. Saan kaya ako makakahanap ng trabaho?";
const KUTSERO = [
  "Macario: Kutsero, maaari po ba akong magtrabaho rito?",
  "Kutsero: Macario? Mabuti naman at naisipan mong magtrabaho.",
  "Macario: Kailangan na po, e. Nangangailangan po si Nanay.",
  "Kutsero: O sige, magsimula ka na agad. Alagaan mo 'yung kabayo sa kuwadra.",
];
const MANANAHI = [
  "Macario: Mananahi, tumatanggap po ba kayo ng trabahador?",
  "Mananahi: Oo naman, Macario. Kumusta na ang inay mo?",
  "Macario: Ayos lang po. Nangangailangan lang po kami ng pera ngayon.",
  "Mananahi: O, sige, sige. Tara rito.",
];
// The proponents' five lines. Block 59 tells the play between the third
// and the fourth.
const NANAY_THANKS_OWN = [
  "Macario: 'Nay, nakapag-ipon na po ako ng pera para makatulong.",
  "Nanay: Maraming salamat, anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?",
  "Macario: Opo, 'Nay. Nagtrabaho po ako sa Kutsero at sa Mananahi.",
  "Nanay: Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay.",
  "Macario: Maraming salamat po, 'Nay!",
];
const STEP = {
  kutsero: "Maghanap ng trabaho: kausapin ang Kutsero",
  groom: "Alagaan ang kabayo ng Kutsero",
  barber: "Magtrabaho sa barberya", // Block 94
  mananahi: "Kausapin ang Mananahi",
  sew: "Tulungan ang Mananahi sa pananahi",
  clothes: "Ihatid ang mga damit sa direktor",
  play: "Gumanap bilang Don Rodrigo sa dula",
  nanay: "Mag-ipon para kay Nanay",
  // Block 80.
  baldovino: "Gumanap bilang Principe Baldovino",
  kasama: "Hanapin ang naghihintay sa kalye",
  join: "Sumapi sa Katipunan",
  pamphlets: "Ipamigay ang mga polyeto",
  report: "Bumalik sa pulungan at mag-ulat", // Block 94
};
// Block 80. The end of Act I.
const FOUR_YEARS = ["Pagkalipas ng apat na taon", "Tondo, 1894", "Ngayong gabi sa entablado: Principe Baldovino"];
const BALDOVINO_LINE = "Macario: Walang bayang mananatiling alipin, kung ang mga anak nito ay handang lumaban!";
const SURE_Q = "Katipunero: Minsan ko lang itatanong. Sigurado ka bang gusto mong sumali?";
const PAMPHLET_LINE = "Macario: Para po sa inyo. Itago n'yo po, at basahin nang palihim.";
// Block 94. The end is a year on, in the pulungan.
const THE_END = ["Isang taon pa lamang mula nang sumapi siya,",
  "pinuno na si Macario ng kanyang balangay sa Katipunan.", "Wakas ng Unang Yugto"];
const ROUNDS_OVER = ["Natapos ang ronda ng mga guardia civil."];
const BROUGHT_BACK = ["Ibinalik siya ng Kasama sa lihim na silid."];
const A_YEAR_ON = ["Pagkalipas ng isang taon", "Tondo, 1895"];
const THE_LIE = "Macario: Hindi po, 'Nay. Nag-eensayo lang po kami ng bagong komedya.";

// Block 114. The barber's game as drawn, and cutting with the real
// mouse: along the rows of hair past the line (a clean cut, that only
// ever puts the point on the extra), or straight across whole rows,
// line and all (a rough one).
const cutState = (page) => page.evaluate(() => {
  const s = document.getElementById("cut-screen");
  const c = document.getElementById("cut-canvas");
  return { up: !s.classList.contains("hidden"),
    title: document.getElementById("cut-title").textContent,
    hint: document.getElementById("cut-hint").textContent,
    ask: document.getElementById("cut-ask").textContent,
    result: document.getElementById("cut-result").textContent,
    stop: document.querySelector("#cut-stop .lbl").textContent,
    size: c.width + "x" + c.height, pixelated: getComputedStyle(c).imageRendering === "pixelated",
    left: Number(s.dataset.left), short: Number(s.dataset.short), over: s.dataset.over === "1",
    clean: s.dataset.clean };
});
const cutDrag = async (page, runs) => {
  const r = await page.evaluate(() => {
    const b = document.getElementById("cut-canvas").getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  });
  const at = (gx, gy) => [r.x + ((gx + 0.5) / 64) * r.w, r.y + ((gy + 0.5) / 56) * r.h];
  for (const [y, x0, x1] of runs) {
    await page.mouse.move(...at(x0, y));
    await page.mouse.down();
    await page.mouse.move(...at(x1, y), { steps: Math.max(1, x1 - x0) });
    await page.mouse.up();
  }
  await page.waitForTimeout(150);
};
// Each row's runs of extra hair, from the picture's own model.
const extraRuns = (page) => page.evaluate(() => {
  const m = cutModel();
  const runs = [];
  for (let y = 0; y < 56; y++) {
    let start = -1;
    for (let x = 0; x <= 64; x++) {
      const extra = x < 64 && m.hair[y * 64 + x] === 2;
      if (extra && start < 0) start = x;
      if (!extra && start >= 0) { runs.push([y, start, x - 1]); start = -1; }
    }
  }
  return runs;
});
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
// Block 89. The work game as drawn, and one stroke of it: waits, inside
// the page, for the marker to be over the green patch (or clear of it)
// and presses E at that moment, so the timing is the game's own.
const workState = (page) => page.evaluate(() => ({
  up: !document.getElementById("work-screen").classList.contains("hidden"),
  title: document.getElementById("work-title").textContent,
  hint: document.getElementById("work-hint").textContent,
  result: document.getElementById("work-result").textContent,
  hitLabel: document.querySelector("#work-hit .lbl").textContent,
}));
const workStroke = (page, wantHit) => page.evaluate((wantHit) => new Promise((resolve) => {
  const zone = document.getElementById("work-zone");
  const marker = document.getElementById("work-marker");
  const tick = () => {
    const z0 = parseFloat(zone.style.left);
    const z1 = z0 + parseFloat(zone.style.width);
    const m = parseFloat(marker.style.left);
    const inside = m >= z0 + 3 && m <= z1 - 3;
    const outside = m < z0 - 3 || m > z1 + 3;
    if (wantHit ? inside : outside) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "e", bubbles: true }));
      resolve(true);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
}), wantHit);
// The hold-to-fill way (the sewing): hold E, let go over the patch, or early.
const workStrokeHold = (page, wantHit) => page.evaluate((wantHit) => new Promise((resolve) => {
  const zone = document.getElementById("work-zone");
  const marker = document.getElementById("work-marker");
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "e", bubbles: true }));
  const tick = () => {
    const z0 = parseFloat(zone.style.left);
    const z1 = z0 + parseFloat(zone.style.width);
    const m = parseFloat(marker.style.width) || 0;
    const inside = m >= z0 + 1.5 && m <= z1 - 1.5;
    const early = m > 1 && m < z0 - 3;
    if (wantHit ? inside : early) {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "e", bubbles: true }));
      resolve(true);
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), wantHit);
// A round of five, noting how wide the patch was before each stroke.
const workRound = async (page, wantHit, hold) => {
  const widths = [];
  for (let i = 0; i < 5; i++) {
    widths.push(await page.evaluate(() => parseFloat(document.getElementById("work-zone").style.width)));
    await (hold ? workStrokeHold : workStroke)(page, wantHit);
  }
  const done = await workState(page);
  done.widths = widths;
  await page.click("#work-hit");
  await page.waitForTimeout(200);
  return done;
};

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

// The checks that need no browser (STORY.md, ART.md, the manifest and
// its fingerprints, the stamps, the shrunk sheets) live in
// _dev/tools/lib/checks.js since Block 106, shared with prepare.js, so
// the commit-time check and this suite cannot disagree.
const fastChecks = require(path.join(ROOT, "_dev", "tools", "lib", "checks.js"));

(async () => {
  // Shared by the parts below (Block 115): the reloads and the Talaan
  // resume a save, and a guest is given the teacher's papers.
  let r, c;
  const resume = async (room, flags, currency, extra) => {
    const r = await newPage(browser, Object.assign({
      session: { user: { id: "u1" } },
      game_progress: [{ student_id: "u1", current_act: 1, current_room: room, currency: currency || 0,
        save_state: { quests: [], flags, posX: 300 } }],
      act_progress: [{ student_id: "u1", act_number: 1, status: "playing", objectives_done: 0 }],
    }, extra || {}));
    await r.page.click("#shell-start");
    // Block 115: until the world is his, not a fixed 700 ms.
    for (let t = 0; t < 4000 && (await r.page.evaluate(() => Shell.state)) !== "playing"; t += 50) await r.page.waitForTimeout(50);
    await r.page.waitForTimeout(250);
    return r;
  };
  const PAPERS = { talaan_entries: [
    { act_number: 1, slot: 1, title: "Unang papel", body: "Isinulat ng guro." },
    { act_number: 1, slot: 3, title: "", body: "Ang ikatlo." },
  ] };

  // Block 117. Playing a stretch of story, as a guest from a story point:
  // shared by the parts for Acts II and III (moved out of Act II's).
  const jumpTo = async (p, key) => {
    await p.goto("http://localhost:" + PORT + "/index.html?dev=1");
    await p.waitForTimeout(400);
    await p.selectOption("#shell-dev-jump", key);
    await p.click("#shell-dev-go");
    for (let i = 0; i < 80 && (await p.evaluate(() => Shell.state)) !== "playing"; i++) await p.waitForTimeout(100);
  };
  // A line on screen while the scene's black is up is a line nobody
  // can read: counted for the whole act (window.__unseen).
  const watchBlack = (p) => p.evaluate(() => {
    window.__unseen = [];
    setInterval(() => {
      if (!dialogueBox.classList.contains("hidden") && blackout.classList.contains("visible")) {
        const l = dialogueSpeaker.textContent + ": " + dialogueText.textContent;
        if (!window.__unseen.includes(l)) window.__unseen.push(l);
      }
    }, 100);
  });
  // Plays on until cond() is true in the page: lines are pressed
  // through, black cards waited out, and anyone fighting is knocked
  // down; every body that fought is counted (window.__fought).
  const playOn = async (p, cond, ms) => {
    await p.evaluate(() => { window.__fought = window.__fought || new Set(); });
    for (let t = 0; t < (ms || 30000); t += 150) {
      const s = await p.evaluate((c) => {
        ENEMIES.forEach((e) => { window.__fought.add(e.id); if (!e.dead) hitEnemy(e, 99); });
        GUARDS.forEach((g) => { if (g.fight) { window.__fought.add(g.id); if (!g.disabled) hitGuard(g, 99); } });
        return { done: Boolean(new Function("return " + c)()), talking: !dialogueBox.classList.contains("hidden") };
      }, cond);
      if (s.done) return true;
      if (s.talking) await p.keyboard.press("e");
      await p.waitForTimeout(150);
    }
    return false;
  };
  // Every line said until the box has stayed shut for gapMs: a beat
  // with a pause in it (a knock, someone walking on) is one reading.
  const readLines = async (p, max, gapMs) => {
    const lines = [];
    for (let i = 0; i < 80 && !(await line(p)); i++) await p.waitForTimeout(100);
    // Block 115: the silence that ends a reading is story time, so
    // a third of it when the story runs fast; and each line is
    // waited out until it changes, not for a fixed 140 ms.
    const gap = (gapMs || 2500) / (SPEED > 1 ? 3 : 1);
    for (let quiet = 0; lines.length < max && quiet < gap; ) {
      const l = await line(p);
      if (!l) { quiet += 50; await p.waitForTimeout(50); continue; }
      quiet = 0;
      lines.push(l);
      await p.keyboard.press("e");
      for (let t = 0; t < 1500 && (await line(p)) === l; t += 20) await p.waitForTimeout(20);
    }
    return { lines };
  };
  const stepIs = async (p, text) => (await log(p)).current.join(" | ").includes(text);
  const press = async (p, x) => { await walkTo(p, x); await p.keyboard.press("e"); await p.waitForTimeout(200); };
  const quiet = (p) => p.evaluate(() => GUARDS.forEach((g) => { g.disabled = true; }));
  const on = (p, prefix) => p.evaluate((pre) => GUARDS.filter((g) => g.id.startsWith(pre) && !g.disabled).length, prefix);

  if (part("files", "the checks that need no browser")) {
    console.log("\nWithout a browser (prepare.js --check)");
    for (const r of fastChecks.runAll()) ok(r.name, r.ok, r.detail);
  }

  await new Promise((res) => server.listen(PORT, res));
  PORT = server.address().port;
  const browser = await chromium.launch();

  if (part("act1", "a fresh student plays the whole of Act I")) {
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
    // Block 78. Every picture the manifest lists opens in the browser: one
    // that could not (a broken file) would hold the loading screen forever.
    const opened = await page.evaluate(async () => {
      const pics = window.ASSET_MANIFEST.filter((f) => /\.(png|jpe?g)$/i.test(f));
      const got = await Promise.all(pics.map((f) => loadImage(f).then((img) => ({ f, ok: Boolean(img && img.naturalWidth) }))));
      return { count: pics.length, bad: got.filter((g) => !g.ok).map((g) => g.f) };
    });
    ok("every picture in the manifest opens in the browser (" + opened.count + ")",
       opened.count > 20 && opened.bad.length === 0, opened.bad);
    ok("Act I has fourteen objectives (Block 94), pays no barya per step, and is no longer held open (Block 80)",
       await page.evaluate(() => Acts.objectivesFor(1).length === 14 && Acts.perObjective(2) === 0 &&
         !ACT_1.holdOpen));
    ok("one street, the entablado and the pulungan (Block 80), no guards' room (Block 95), no door on the street, and no test room",
       await page.evaluate(() =>
      JSON.stringify(SCENES.map((s) => s.id)) === '["tondo","entablado","pulungan"]' &&
      !(SCENES[0].exits || []).length && !ACT_1.testRoom && !Game.enterTestRoom &&
      !document.getElementById("shell-testroom")));
    // Block 117: and Act III's disguise, the story's too, neither for sale.
    ok("the item catalogue is the stage clothes (Block 82) and the disguise (Block 117), not for sale, still-detection effects",
       await page.evaluate(() => Array.isArray(window.ITEMS) && ITEMS.length === 2 && ITEMS[0].id === "damit-entablado" &&
         ITEMS[0].price === 0 && ITEMS[0].slot === "outfit" && ITEMS[0].effect.stillDetectionMult === 0.2 &&
         ITEMS[1].id === "balatkayo" && ITEMS[1].price === 0 && ITEMS[1].slot === "outfit" &&
         ITEMS[1].effect.stillDetectionMult === 0.1 && !Inventory.owns("damit-entablado")));

    const t0 = await intertitle(page);
    ok("the game opens on black: Tondo, 1890", t0.up && t0.black &&
       JSON.stringify(t0.lines) === '["Tondo, 1890","Kung saan nagsimula ang buhay ni Macario"]', t0);
    ok("the world is held still behind it", await page.evaluate(() => cutscenePlaying && posX === 900));
    // Block 115: watched until both are in, not read after a fixed wait,
    // so the check holds at any speed.
    let t1 = await intertitle(page);
    for (let t = 0; t < 3000 && t1.up && t1.shown < 2; t += 20) {
      await page.waitForTimeout(20);
      t1 = await intertitle(page);
    }
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
    ok("the big one is the artist's, animated from the still, at the height he had (Block 96)",
       await page.evaluate(() => {
         const d = currentScene.decorations.find((x) => x.id === "siga-2");
         return d.animation.src === "assets/sprites/characters/siga-2.png" && d.animation.frames === 8 &&
           d.animation.contentHeight === 405 && d.displayHeight === Math.round(134 * 137 / 127);
       }));

    // Block 98. The direktor, the Mananahi, the Katipunero and the Kasama
    // are the artist's: every sheet opens, and the two who walk on have a
    // walk sheet wherever they are placed, turned the way they walk.
    const people = await page.evaluate(async () => {
      const sheets = [DIREKTOR, MANANAHI, KATIPUNERO_SHEETS.idle, KATIPUNERO_SHEETS.walk,
        KASAMA_SHEETS.idle, KASAMA_SHEETS.walk];
      await Promise.all(sheets.map((s) => loadSpriteSheet(s)));
      const walkers = window.ACT_1.scenes.flatMap((s) => s.decorations || [])
        .filter((d) => /^(katipunero|kasama)/.test(d.id));
      return {
        open: sheets.map((s) => !s.failed && s.frameHeight > 0),
        walkers: walkers.length,
        walk: walkers.every((d) => d.walkAnimation && d.faceMovement),
      };
    });
    ok("the direktor, the Mananahi, the Katipunero and the Kasama are the artist's, every sheet opening (Block 98)",
       people.open.every(Boolean), people);
    ok("and the Katipunero and the Kasama walk on their walk sheets, facing the way they go (Block 98)",
       people.walkers === 5 && people.walk, people);

    // Block 100. Kabayo is the proponent's saddled bay, animated from the
    // still: the sheet opens and plays its twelve frames on the street.
    const kabayo = await page.evaluate(async () => {
      await loadSpriteSheet(KABAYO);
      const npc = window.ACT_1.scenes.flatMap((s) => s.npcs || []).find((n) => n.id === "kabayo");
      return { open: !KABAYO.failed && KABAYO.frameHeight > 0, frames: KABAYO.frames,
               same: npc && npc.animation === KABAYO };
    });
    ok("Kabayo is the proponent's horse, its twelve-frame sheet opening (Block 100)",
       kabayo.open && kabayo.frames === 12 && kabayo.same, kabayo);

    // Block 101. The proponent's seven stills: the side-on ones animated
    // (Nanay, the Mabalasig), the three-quarter ones marching (the Sultan,
    // the kawal), the front ones still (the Kutsero, the Barbero, Maryam).
    const cast = await page.evaluate(async () => {
      const k = window.ENEMY_TYPES.kawal;
      const sheets = { NANAY, NANAY_WALK, MABALASIG, sultan: SULTAN.idle, sultanWalk: SULTAN.walk,
        KUTSERO, BARBERO, MARYAM, kawalWalk: k.animation, kawalAttack: k.attackAnimation, kawalHit: k.hitAnimation };
      await Promise.all(Object.values(sheets).map((s) => loadSpriteSheet(s)));
      return Object.fromEntries(Object.entries(sheets).map(([n, s]) => [n, !s.failed && s.frameHeight > 0 && s.frames]));
    });
    ok("the proponent's seven new characters, every sheet opening, side-on ones animated, front ones still (Block 101)",
       Object.values(cast).every(Boolean) && cast.NANAY === 8 && cast.NANAY_WALK === 8 && cast.MABALASIG === 8 &&
         cast.sultanWalk === 8 && cast.KUTSERO === 1 && cast.BARBERO === 1 && cast.MARYAM === 1, cast);

    const c1 = await readConversation(page, 3);
    ok("the siga's lines, as written", JSON.stringify(c1.lines) === JSON.stringify(OPENING), c1.lines);
    ok("Macario faces the siga, behind him on the left", c1.facings.every((f) => f === -1), c1.facings);

    const brawl = await winOpeningFight(page);
    ok("the insult becomes a fight with the three siga, on their own art, hearts showing, Macario free to act",
       brawl.count === 3 && brawl.art && brawl.hearts && !brawl.cutscene, brawl);
    ok("the big siga fights on the artist's walk, punch and flinch, none of them a box (Block 96)", brawl.bigSheets, brawl);
    ok("all three siga fight on the artist's walk, punch and flinch (Block 98)", brawl.allSheets, brawl);
    ok("a punch that does not drop him shows his flinch, turned on Macario (Block 96)",
       brawl.bigReels && brawl.bigFacesHim, brawl);
    ok("and the blow that drops him leaves him falling in it (Block 96)", brawl.bigFallsInIt, brawl);

    // Block 93. She comes from just past the right edge of the screen to a
    // step in front of him, wherever the fight left him, walking on her
    // walk sheet (Block 101: the proponent's, no longer a placeholder),
    // and stands on her own sheet.
    const slide = await page.evaluate(async () => {
      const dec = currentScene.decorations.find((d) => d.id === "nanay");
      for (let i = 0; i < 80 && !dec.moving; i++) await new Promise((r) => setTimeout(r, 50));
      const moving = dec.moving;
      const from = dec.currentX, edge = viewEdges().right;
      const walkShown = Boolean(dec.walkSpriteEl) && dec.walkSpriteEl.style.display !== "none" &&
        /nanay-walk\.png/.test(dec.walkSpriteEl.style.backgroundImage);
      for (let i = 0; i < 120 && dec.moving; i++) await new Promise((r) => setTimeout(r, 50));
      const view = viewEdges();
      return { moving, walkShown, from, edge, gap: dec.currentX - posX, at: dec.currentX, view,
               src: dec.spriteEl.style.backgroundImage, shown: dec.spriteEl.style.display !== "none" };
    });
    ok("Nanay walks on from off the screen on her walk sheet, and stops a step in front of him (Blocks 93, 101)",
       slide.moving && slide.walkShown && slide.from >= slide.edge - 30 && Math.round(slide.gap) === 190 &&
       slide.at > slide.view.left && slide.at < slide.view.right &&
       /nanay\.png/.test(slide.src) && slide.shown, slide);

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
      // He may arrive first: where the fight left him decides who has the longer walk.
      await new Promise((r) => setTimeout(r, 600));
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
    console.log("\nThe Kutsero's job: a horse to groom, once (Blocks 89, 114)");
    await walkTo(page, 3200);
    await page.keyboard.press("e");
    const k1 = await readConversation(page, 5);
    ok("the Kutsero's lines as written, then what the job is",
       JSON.stringify(k1.lines.slice(0, 4)) === JSON.stringify(KUTSERO) &&
       k1.lines[4] === "Kutsero: Suklayin mo siya, at may bayad ka sa akin.", k1.lines);
    await page.waitForTimeout(200);
    ok("the task is the horse", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.groom]));
    const twoLines = await log(page);
    ok("and a second line stays beside it: the savings, counted as he earns (Block 92)",
       twoLines.lines === 2 && twoLines.pinned[0] === "Mag-ipon para kay Nanay (0/100)", twoLines);
    ok("there is no apple tree to use any more", await page.evaluate(() => !NPCS.some((n) => n.id === "puno")));

    await walkTo(page, 3480);
    ok("beside the horse, the button reads Suklayin, with a brush (Block 93)", await page.evaluate(() =>
      document.querySelector("#btn-interact .lbl").textContent === "Suklayin" &&
      document.querySelector("#btn-interact .ico use").getAttribute("href") === "#i-brush"));
    await page.keyboard.press("e");
    await page.waitForTimeout(250);
    const wOpen = await workState(page);
    ok("E opens the work game, with the world blocked", wOpen.up && wOpen.title === "Kabayo" &&
       await page.evaluate(() => uiBlocked), wOpen);
    // Block 93. The grooming's buttons show a brush, never the sword.
    const icons = await page.evaluate(() => document.querySelector("#work-hit .ico use").getAttribute("href"));
    ok("the grooming button shows a brush, not the sword (Block 93)", icons === "#i-brush", icons);
    await workStroke(page, true);
    await page.click("#work-stop");
    await page.waitForTimeout(200);
    ok("leaving before the last stroke pays nothing, and the job waits", await page.evaluate(() =>
      Game.currency() === 0 && !uiBlocked && !state.flags.naalagaanAngKabayo));
    await page.keyboard.press("e");
    await page.waitForTimeout(250);
    const x0 = await page.evaluate(() => posX);
    const w2 = await workRound(page, true);
    ok("five good strokes pay the most, 12 barya, and the button said Tapos na (Block 114)",
       /5\/5 ang maayos\. \+12 barya/.test(w2.hint) && w2.hitLabel === "Tapos na", w2);
    ok("the patch gets thinner with every stroke (Block 90)",
       w2.widths.every((w, i) => i === 0 || w < w2.widths[i - 1]) && w2.widths[0] >= 30 && w2.widths[4] <= 14, w2.widths);
    const horse = await page.evaluate(() => ({
      sprite: /kabayo\.png/.test(document.getElementById("work-prop").style.backgroundImage),
      brush: document.getElementById("work-tool").className,
      stage: document.getElementById("work-stage").className }));
    ok("the picture is the horse from his own sheet, and the brush swept over him on a good stroke",
       horse.sprite && /work-brush/.test(horse.brush) && /work-anim/.test(horse.brush) && horse.stage === "work-stage-horse", horse);
    ok("closing gives him the world back and the pay", await page.evaluate(() =>
      !uiBlocked && Game.currency() === 12 && state.flags.naalagaanAngKabayo === true));
    ok("the keys the game takes do not move Macario", (await page.evaluate(() => posX)) === x0);
    ok("the round finishes the step, and the log moves on to the barber (Block 94)",
       JSON.stringify((await log(page)).current) === JSON.stringify([STEP.barber]));
    ok("and the savings line counts the 12 he earned", (await log(page)).pinned[0] === "Mag-ipon para kay Nanay (12/100)");
    ok("a round of five bad strokes would pay 8, the least (Block 114)", await page.evaluate(() =>
      jobPay(0) === 8 && jobPay(1) === 12 && jobPay(0.6) === 10));
    await page.keyboard.press("e");
    const again = await readConversation(page, 1);
    ok("done once: the horse gives a thought, not a second game (Block 114)",
       again.lines[0] === "Macario (sa isip): Malinis na si Kabayo. Wala na akong gagawin dito." &&
       !(await workState(page)).up && (await page.evaluate(() => Game.currency())) === 12, again.lines);
    await walkTo(page, 3200);
    await page.keyboard.press("e");
    const full = await readConversation(page, 1);
    ok("afterwards the Kutsero says that is enough, and there is no game",
       /^Kutsero: Sapat na/.test(full.lines[0] || "") && !(await workState(page)).up, full.lines);

    // ---------------------------------------------------------------
    console.log("\nThe Barbero's job: a haircut (Blocks 94, 114)");
    await walkTo(page, 6300);
    await page.keyboard.press("e");
    const gate = await readConversation(page, 2);
    ok("before the barber, the Mananahi sends Macario to him",
       gate.lines.length === 1 && /Barbero/.test(gate.lines[0]) &&
       !(await page.evaluate(() => state.flags.nakausapAngMananahi)), gate.lines);
    await walkTo(page, 5480);
    await page.keyboard.press("e");
    await page.waitForTimeout(200);
    ok("his chair waits until he has been spoken to", /^Macario \(sa isip\): Silya/.test(await line(page) || "") &&
       !(await cutState(page)).up);
    await readConversation(page, 1);
    await walkTo(page, 5200);
    await page.keyboard.press("e");
    const br1 = await readConversation(page, 10);
    ok("the Barbero's first talk, with the horse remembered, sending him to the customer (Block 114)",
       br1.lines.length === 9 && /kabayo/.test(br1.lines[2]) && br1.lines[4] === "Barbero: Hindi kabayo ang mga suki ko, iho." &&
       br1.lines[6] === "Barbero: Sundan mo lang ang guhit. Huwag mong lalampasan." &&
       await page.evaluate(() => state.flags.nakausapAngBarbero === true), br1.lines);
    await walkTo(page, 5480);
    ok("beside the chair, the button reads Gupitin, with scissors", await page.evaluate(() =>
      document.querySelector("#btn-interact .lbl").textContent === "Gupitin" &&
      document.querySelector("#btn-interact .ico use").getAttribute("href") === "#i-scissors" &&
      /silya-barbero.png/.test(document.getElementById("npc-silya").textContent)));
    await page.keyboard.press("e");
    await page.waitForTimeout(250);
    const cut0 = await cutState(page);
    ok("E opens the barber's own game, not the work game: the customer in pixels, the world blocked",
       cut0.up && cut0.title === "Barberya" && !(await workState(page)).up && cut0.size === "64x56" && cut0.pixelated &&
       cut0.ask === "Suki: Maikli sa gilid, iho. Huwag mong uubusin sa ibabaw." && /0%$/.test(cut0.hint) &&
       cut0.left > 300 && cut0.stop === "Bumalik" && await page.evaluate(() => uiBlocked), cut0);
    const drawn = await page.evaluate(() => {
      const c = document.getElementById("cut-canvas").getContext("2d").getImageData(0, 0, 64, 56).data;
      const at = (x, y) => [c[(y * 64 + x) * 4], c[(y * 64 + x) * 4 + 1], c[(y * 64 + x) * 4 + 2]].join(",");
      return { hair: at(32, 4), face: at(32, 28), cape: at(32, 50) };
    });
    ok("drawn: hair on top, the face below it, the cape at his neck", drawn.hair !== drawn.face && drawn.face !== drawn.cape &&
       drawn.face.split(",").map(Number)[0] > 150, drawn);
    const runs = await extraRuns(page);
    await cutDrag(page, runs.slice(0, 6));
    const cut1 = await cutState(page);
    ok("the scissors cut the hair past the line, and the count goes up", cut1.left < cut0.left && cut1.short === 0 &&
       !/ 0%$/.test(cut1.hint), cut1);
    await page.click("#cut-stop");
    await page.waitForTimeout(200);
    ok("leaving before it is done pays nothing, and the chair waits", await page.evaluate(() =>
      Game.currency() === 12 && !uiBlocked && !state.flags.nakapaggupit &&
      document.getElementById("cut-screen").classList.contains("hidden")));
    await page.keyboard.press("e");
    await page.waitForTimeout(250);
    ok("opened again, he starts with all his hair", (await cutState(page)).left === cut0.left);
    await cutDrag(page, runs);
    const cut2 = await cutState(page);
    ok("cut along the outside of the line: the rest falls by itself, a clean cut, 12 barya, and Tapos na",
       cut2.over && cut2.left === 0 && cut2.short === 0 && cut2.clean === "1.00" &&
       cut2.ask === "Suki: Aba, parang bagong tao ako! +12 barya" && cut2.stop === "Tapos na", cut2);
    ok("the keys and the mouse the game takes do not move Macario", (await page.evaluate(() => posX)) === 5480);
    await page.click("#cut-stop");
    const paid = await readConversation(page, 2);
    ok("closing: the Barbero pays him, with the horse remembered",
       paid.lines[0] === "Barbero: Hindi masama para sa tagasuklay ng kabayo. Heto ang bayad mo.", paid.lines);
    ok("the world back and the pay", await page.evaluate(() =>
      !uiBlocked && Game.currency() === 24 && state.flags.nakapaggupit === true));
    ok("the haircut finishes the step, and the log moves on to the Mananahi",
       JSON.stringify((await log(page)).current) === JSON.stringify([STEP.mananahi]));
    await page.keyboard.press("e");
    const chair = await readConversation(page, 1);
    ok("done once: the chair gives a thought, not a second haircut",
       chair.lines[0] === "Macario (sa isip): Wala nang nakaupo. Tapos na ako rito." && !(await cutState(page)).up, chair.lines);
    await walkTo(page, 5200);
    await page.keyboard.press("e");
    const brAfter = await readConversation(page, 1);
    ok("and the Barbero has no more customers", brAfter.lines[0] === "Barbero: Wala nang suki ngayon, iho. Salamat sa tulong mo.", brAfter.lines);
    // A rough cut, on a game opened straight from the page (it pays
    // nothing by itself): straight across the rows, line and all.
    await page.evaluate(() => {
      window.__rough = playCutGame({ title: "Barberya", speaker: "Suki", tooShortText: "Aray! Ang ikli!",
        doneText: (c) => (c >= 0.8 ? "malinis" : "magaspang") });
    });
    await page.waitForTimeout(250);
    await cutDrag(page, Array.from({ length: 42 }, (_, i) => [i, 0, 63]));
    const rough = await cutState(page);
    ok("cut across the line: Aray!, and a rough cut is worth 0",
       rough.over && rough.short > 0 && rough.clean === "0.00" && rough.ask === "Suki: magaspang" &&
       await page.evaluate(() => /Aray/.test(document.getElementById("cut-result").textContent) ||
         Number(document.getElementById("cut-screen").dataset.short) > 0), rough);
    await page.click("#cut-stop");
    ok("its promise resolves with the cleanness", (await page.evaluate(() => window.__rough)) === 0);
    await page.waitForTimeout(200);

    // ---------------------------------------------------------------
    console.log("\nThe Mananahi's job: sewing once, and being stopped (Blocks 89, 114)");
    ok("the next task is the Mananahi", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.mananahi]));
    await walkTo(page, 6300);
    await page.keyboard.press("e");
    const m1 = await readConversation(page, 5);
    ok("the Mananahi's lines as written, then the sewing, which pays",
       JSON.stringify(m1.lines.slice(0, 4)) === JSON.stringify(MANANAHI) &&
       m1.lines[4] === "Mananahi: Nariyan ang tahian. Tulungan mo akong magtahi, may bayad ka pagkatapos." &&
       m1.lines.length === 5, m1.lines);
    await page.waitForTimeout(200);
    ok("the task is the sewing, with no count (Block 114)", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.sew]));
    ok("the direktor cannot take a delivery yet", await page.evaluate(() =>
      !canGiveGift(NPCS.find((n) => n.id === "direktor"))));

    await walkTo(page, 6540);
    ok("beside the sewing, the button reads Manahi, with a needle, and the table is seen (Block 93)", await page.evaluate(() =>
      document.querySelector("#btn-interact .lbl").textContent === "Manahi" &&
      document.querySelector("#btn-interact .ico use").getAttribute("href") === "#i-needle" &&
      /tahian.png/.test(document.getElementById("npc-tahian").textContent)));
    await page.keyboard.press("e");
    await page.waitForTimeout(250);
    ok("E opens the same game with the sewing's words, played by holding instead", await page.evaluate(() =>
      document.getElementById("work-title").textContent === "Pananahi" &&
      document.getElementById("work-bar").classList.contains("work-fill") &&
      document.getElementById("work-stage").className === "work-stage-cloth"));
    const sew1 = await workRound(page, true, true);
    ok("letting go over the patch five times pays 12, and the seam is five stitches", /\+12 barya/.test(sew1.hint) &&
       await page.evaluate(() => document.querySelectorAll("#work-marks i.work-stitch-ok").length === 5), sew1);
    ok("its patch thins too", sew1.widths.every((w, i) => i === 0 || w < sew1.widths[i - 1]), sew1.widths);
    const stop = await readConversation(page, 7);
    ok("after the one round she stops him: the costumes for the direktor, forgotten",
       stop.lines.length === 7 && stop.lines[0] === "Mananahi: Macario, teka! Ihinto mo muna 'yan." &&
       /direktor/.test(stop.lines[3]), stop.lines);
    await page.waitForTimeout(300);
    ok("the task is to take them to the direktor, and the world is his", await page.evaluate(() =>
      state.flags.mayDalangDamit === true && !cutscenePlaying) &&
       JSON.stringify((await log(page)).current) === JSON.stringify([STEP.clothes]));
    await page.keyboard.press("e");
    const held = await readConversation(page, 1);
    ok("with the costumes on him the sewing waits", /^Macario \(sa isip\):/.test(held.lines[0] || "") &&
       !(await workState(page)).up, held.lines);
    const jobMoney = await page.evaluate(() => Game.currency());
    ok("the three jobs have paid 36 in all", jobMoney === 36, jobMoney);

    // ---------------------------------------------------------------
    console.log("\nThe direktor's missing actor");
    await walkTo(page, 13480);
    // Block 99. He looks at Macario, who comes from the left.
    const dkFace = await page.evaluate(() => {
      const n = NPCS.find((x) => x.id === "direktor" && !x.hidden);
      const side = Math.sign(posX + PLAYER_WIDTH / 2 - (n.x + NPC_WIDTH / 2));
      return { side, drawn: n.drawnFacing, transform: n.spriteEl.style.transform };
    });
    ok("the direktor turns to look at Macario, come from the left (Block 99)",
       dkFace.side === -1 && dkFace.drawn === -1 && dkFace.transform === "scaleX(-1)", dkFace);
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
         /kawal-walk.png$/.test(e.walk) && /kawal-attack.png$/.test(e.sword)), kawal);
    // Block 93. The fight leaves him at the stage's edge; he walks back to
    // his mark before the Sultan returns, and stands (not stuck in the walk)
    // while they talk. The box is at the top on the stage. The Sultan's
    // bust, missing while he borrowed the soldiers' small sheet, is his own
    // art since Block 101.
    await page.evaluate(() => { posX = 1000; ENEMIES.forEach((e) => hitEnemy(e, 99)); });
    for (let i = 0; i < 100 && !(await line(page)); i++) await page.waitForTimeout(100);
    await page.waitForTimeout(300);
    const markBack = await page.evaluate(() => ({ x: posX, anim: currentAnim, facing,
      top: document.body.classList.contains("dialogue-top") && dialogueBox.getBoundingClientRect().top < 5,
      bust: document.getElementById("dialogue-portrait-right").classList.contains("shown") }));
    ok("after the fight he walks back to his mark, faces the Sultan and stands; the box is at the top; the Sultan's own bust (Blocks 93, 101)",
       markBack.x === 440 && markBack.anim === "idle" && markBack.facing === 1 && markBack.top && markBack.bust, markBack);
    // Block 113: the kingdom falls (the moro-moro's own ending), in two
    // parts with the kampilan dropped between them.
    const s3a = await readConversation(page, 3);
    const s3b = await readConversation(page, 5);
    const s3 = { lines: s3a.lines.concat(s3b.lines) };
    ok("the Sultan comes back to his fallen soldiers, his kingdom falls, Maryam leaves him, and the crowd cheers (Block 113)",
       s3.lines.length === 8 && /Bumagsak na ang iyong kaharian/.test(s3.lines[1]) &&
       /tatanggapin ko ang kanyang pananampalataya/.test(s3.lines[5]) && /^Mga Manonood:/.test(s3.lines[7]), s3.lines);
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
       afterPay - before >= 79 && afterPay - before <= 110 && before === jobMoney, { s4: s4.lines, s5: s5.lines, before, afterPay });
    await page.waitForTimeout(400);
    ok("the play is done, and the world is his", await page.evaluate(() =>
      state.flags.naitanghalAngDula === true && !cutscenePlaying));
    const lgPlay = await log(page);
    ok("and the log says the way out, at the top (Block 93)",
       lgPlay.way === "Lumabas ng entablado: pumunta sa kanan", lgPlay);
    await walkTo(page, 1080);
    const doorIcon = await page.evaluate(() => document.querySelector("#btn-interact .ico use").getAttribute("href"));
    ok("the door's button shows the door, not the talk bubble (Block 93)", doorIcon === "#i-out", doorIcon);
    await page.keyboard.press("e");
    ok("Lumabas: back on the street by the direktor", await waitForScene(page, "tondo") && (await settle(page), true) &&
       await page.evaluate(() => posX === 13480));

    // ---------------------------------------------------------------
    console.log("\nThe Mananahi at the play, and Nanay");
    ok("the next task is to give Nanay the savings", /^Mag-ipon para kay Nanay/.test((await log(page)).current[0] || "") &&
       (await log(page)).lines === 1);
    // Block 85. She came to watch, and waits outside, not at her shop.
    const mAt = await page.evaluate(() => NPCS.filter((n) => /^mananahi/.test(n.id)).map((n) => [n.id, n.x, Boolean(n.hidden)]));
    ok("the Mananahi waits outside the entablado, and not at her shop (Block 85)",
       JSON.stringify(mAt) === JSON.stringify([["mananahi", 6400, true], ["mananahi-sa-entablado", 13250, false]]), mAt);
    await walkTo(page, 13130);
    await page.keyboard.press("e");
    const m2 = await readConversation(page, 6);
    ok("she watched the play herself", m2.lines.length === 5 && /Nanood ako/.test(m2.lines[0]), m2.lines);
    ok("and pays nothing: the work paid each time (Block 89)", (await gift(page)) === null);

    await page.evaluate(() => { Game.spendCurrency(Game.currency()); Game.addCurrency(99); });
    await walkTo(page, 1880);
    ok("with 99 barya, Nanay's savings are not yet offered", (await gift(page)) === null);
    await page.evaluate(() => Game.addCurrency(31));
    ok("with 130 they are: Ibigay ang ipon", (await gift(page)) === "Ibigay ang ipon");
    const n1 = await readConversation(page, 10);
    ok("Nanay's lines as written, with the play told in the middle",
       n1.lines.length === 10 && JSON.stringify([...n1.lines.slice(0, 3), ...n1.lines.slice(8)]) === JSON.stringify(NANAY_THANKS_OWN) &&
       n1.lines[3] === "Macario: Pati po sa Barbero." && /entablado/.test(n1.lines[4]), n1.lines);
    ok("the savings are spent, and he keeps the rest", (await page.evaluate(() => Game.currency())) === 30);

    // ---------------------------------------------------------------
    // Block 80. The end of Act I.
    console.log("\nFour years on: Principe Baldovino");
    ok("straight after Nanay, a black card: four years on, and the play",
       await waitIntertitle(page, true, 5000) &&
       JSON.stringify((await intertitle(page)).lines) === JSON.stringify(FOUR_YEARS), await intertitle(page));
    ok("and the step in hand is the new play", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.baldovino]));
    // Until the stage is on screen, whenever the card is not black the
    // screen behind it must be: the street is never seen between the two.
    let streetSeen = false;
    for (let i = 0; i < 150; i++) {
      const st = await page.evaluate(() => ({ scene: currentSceneId,
        card: document.getElementById("intertitle").classList.contains("visible"),
        black: document.getElementById("blackout").classList.contains("visible") }));
      if (st.scene === "entablado") break;
      if (!st.card && !st.black) streetSeen = true;
      await page.waitForTimeout(100);
    }
    ok("the card lifts onto black and the fade takes him onto the stage, with no street between", !streetSeen);
    ok("the entablado, in the middle of the play", await waitForScene(page, "entablado"));
    const bp = await page.evaluate(() => ({ x: posX, facing, ids: NPCS.map((n) => n.id).sort().join(",") }));
    ok("on his mark beside Maryam, facing her, with the direktor in the wings",
       bp.x === 440 && bp.facing === -1 && bp.ids === "direktor,maryam", bp);
    const pb1 = await readConversation(page, 5);
    ok("Principe Baldovino: the prince comes for the captive princess (Block 81)",
       pb1.lines.length === 3 && /^Maryam: Principe Baldovino!/.test(pb1.lines[0]) && /Bihag/.test(pb1.lines[0]) &&
       /kawal/.test(pb1.lines[2]), pb1.lines);
    let bfight;
    for (let i = 0; i < 40; i++) {
      bfight = await page.evaluate(() => ({ n: ENEMIES.length, alive: ENEMIES.filter((e) => !e.dead).length,
        type: ENEMIES.map((e) => e.type).join(","), cut: cutscenePlaying, noRanged: Boolean(currentScene.noRanged),
        hearts: !document.getElementById("hud").classList.contains("hidden") }));
      if (bfight.n) break;
      await page.waitForTimeout(100);
    }
    ok("the komedya's battle: two kawal from the wing, fought for real, no gun",
       bfight.n === 2 && bfight.alive === 2 && bfight.type === "kawal,kawal" && !bfight.cut && bfight.noRanged && bfight.hearts, bfight);
    // Every effect asked for from here on, to hear the applause.
    await page.evaluate(() => {
      window.__sfx = [];
      const real = window.playSfx;
      window.playSfx = (name) => { window.__sfx.push(name); return real(name); };
      ENEMIES.forEach((e) => hitEnemy(e, 99));
    });
    const pb1b = await readConversation(page, 8);
    ok("after the battle, a line of his own that is not in the script, and a silence before the cheer",
       pb1b.lines.length === 6 && pb1b.lines[2] === BALDOVINO_LINE && /iskrip/.test(pb1b.lines[3]) &&
       pb1b.lines[4] === "Mga Manonood: ..." && /Mabuhay si Baldovino/.test(pb1b.lines[5]), pb1b.lines);
    ok("the crowd is heard cheering with its line (Block 85)", await page.evaluate(() => __sfx.includes("cheer")));
    ok("the curtain closes", await waitIntertitle(page, true, 3000) &&
       (await intertitle(page)).lines[0] === "Nagsara ang telon.");
    // The card's sound comes with its first line, after the fade in.
    for (let i = 0; i < 30 && !(await page.evaluate(() => __sfx.includes("applause"))); i++) await page.waitForTimeout(100);
    ok("to applause, not the card's own drum", await page.evaluate(() =>
      __sfx.includes("applause") && !__sfx.includes("intertitle")), await page.evaluate(() => __sfx));
    await waitIntertitle(page, false, 12000);
    const pb2 = await readConversation(page, 8);
    ok("in the wings, the direktor warns him about the added line and tells him to go home in costume",
       pb2.lines.length === 6 && /idinagdag/.test(pb2.lines[0]) && /guardia civil/.test(pb2.lines[2]) &&
       /hubarin/.test(pb2.lines[3]) && pb2.lines[4] === "Macario: Po?" && /tahimik/.test(pb2.lines[5]), pb2.lines);
    const suit = await page.evaluate(() => ({ worn: Inventory.isWorn("damit-entablado"),
      still: Inventory.effects().stillDetectionMult,
      toast: document.getElementById("toast").textContent }));
    ok("the stage clothes are his, worn, with their effect, and a toast says so (Block 82)",
       suit.worn && suit.still === 0.2 && /Damit-Pangteatro/.test(suit.toast), suit);
    ok("and he looks different in them: a stand-in tint on his sprite (Block 85)", await page.evaluate(() =>
      /sepia/.test(document.querySelector("#player .player-sprite").style.filter) &&
      document.getElementById("player").classList.contains("outfit-tinted")));
    const pb2b = await readConversation(page, 2);
    ok("and Maryam teases", pb2b.lines.length === 1 && /iskrip/.test(pb2b.lines[0]), pb2b.lines);
    ok("the play is saved before anyone comes", await page.evaluate(() => state.flags.naitanghalAngBaldovino === true));

    console.log("\nThe Katipunan asks");
    const kk = await readConversation(page, 20);
    const kk2 = await readConversation(page, 6);
    // Block 98: the two are the artist's now, no placeholder box.
    const kkPlace = await page.evaluate(() => ({ x: posX, facing,
      men: ["katipunero", "kasama"].map((id) => {
        const d = currentScene.decorations.find((x) => x.id === id);
        return { box: d.spriteEl.textContent, art: d.spriteEl.style.backgroundImage };
      }) }));
    ok("two men come out of the right wing to him at stage right, on the artist's art (Block 98)",
       kkPlace.x === 700 && kkPlace.facing === 1 && kkPlace.men.every((m) => m.box === "") &&
       /katipunero\.png/.test(kkPlace.men[0].art) && /kasama\.png/.test(kkPlace.men[1].art), kkPlace);
    ok("they ask whether he is sure, he gives his reason, says yes, and is given the word",
       kk.lines.length === 13 && kk.lines[0] === "Katipunero: Principe Baldovino." &&
       /Wala 'yon sa komedya/.test(kk.lines[2]) &&
       kk.lines.includes(SURE_Q) && kk.lines[12] === "Macario: Sigurado po ako." &&
       kk.lines.some((l) => /^Macario \(sa isip\):.*cedula/.test(l)) &&
       kk2.lines.length === 4 && kk2.lines[2] === "Macario: Anak ng Bayan." && kk2.lines[3] === "Kasama: Hindi rito. Sa labas.",
       { kk: kk.lines, kk2: kk2.lines });
    await settle(page);
    await page.waitForTimeout(1500);
    ok("they leave, the play step is done, and the world is his",
       await page.evaluate(() => state.flags.nilapitanNgKatipunan === true && !cutscenePlaying &&
         document.getElementById("dec-katipunero").style.display === "none"));
    const lg4 = await log(page);
    ok("the next task is the one waiting on the street, and the log says the way out of the entablado (Block 93)",
       JSON.stringify(lg4.current) === JSON.stringify([STEP.kasama]) &&
       lg4.way === "Lumabas ng entablado: pumunta sa kanan", lg4);
    const lines4 = await page.evaluate(() => ["direktor", "maryam"].map((id) => {
      const n = NPCS.find((x) => x.id === id);
      startDialogue(n);
      const l = dialogueText.textContent;
      endDialogue();
      return l;
    }));
    ok("the direktor and Maryam have their four-years-on lines, and Maryam saw the men",
       /Sabado/.test(lines4[0]) && /dalawang lalaki/.test(lines4[1]), lines4);
    await walkTo(page, 1080);
    await page.keyboard.press("e");
    ok("Lumabas: back on the street by the direktor", await waitForScene(page, "tondo") && (await settle(page), true) &&
       await page.evaluate(() => posX === 13480));

    console.log("\nThe word, and the oath");
    const kasamaSt = await page.evaluate(() => {
      const n = NPCS.find((x) => x.id === "kasama");
      return { shown: n && !n.hidden, x: n && n.x };
    });
    ok("the Kasama waits on the street, left of the direktor", kasamaSt.shown && kasamaSt.x === 12500, kasamaSt);
    ok("and no guardia civil walks the street yet, and no hearts show (Block 81)", await page.evaluate(() =>
      GUARDS.length === 0 && document.getElementById("hud").classList.contains("hidden")));
    await walkTo(page, 12380);
    await page.keyboard.press("e");
    const w1 = await readConversation(page, 6);
    ok("Macario says the word, and the Kasama leads him off",
       w1.lines.length === 5 && w1.lines[0] === "Macario: Anak ng Bayan." && /lilingon/.test(w1.lines[4]), w1.lines);
    ok("a black card: he is blindfolded and taken to a secret room", await waitIntertitle(page, true, 3000) &&
       (await intertitle(page)).lines[0] === "Piniringan ang mga mata ni Macario,");
    ok("and the fade takes him to the pulungan", await waitForScene(page, "pulungan", 15000));
    const pulungan = await page.evaluate(() => {
      const tile = document.querySelector("#skyline .skyline-tile");
      return { ids: NPCS.map((n) => n.id).join(","), x: posX,
        owed: tile && tile.classList.contains("backdrop-owed") && /pulungan\.jpg/.test(tile.textContent),
        src: document.getElementById("skyline").style.getPropertyValue("--skyline-src") };
    });
    ok("the room: the Kasama, the Mabalasig and the Katipunero, its owed painting drawn as a dark wall named for the file",
       pulungan.ids === "kasama,mabalasig,katipunero" && pulungan.x === 120 && pulungan.owed && pulungan.src === "", pulungan);
    ok("the task is to join", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.join]));
    // Block 81. The rite, in the histories' order.
    const o1 = await readConversation(page, 10);
    const o1b = await readConversation(page, 10);
    ok("the blindfold off, he looks around, the warning on the wall, and the Mabalasig's challenge to turn back",
       o1.lines.length === 2 && o1.lines[0] === "Mabalasig: Alisin ang kanyang piring." &&
       o1b.lines.length === 5 && /pag-uusisa/.test(o1b.lines[1]) && /umatras/.test(o1b.lines[2]) &&
       o1b.lines[3] === "Macario: Hindi po ako aatras.", { o1: o1.lines, o1b: o1b.lines });
    const o2 = await readConversation(page, 10);
    ok("the three questions, answered: when the Spaniards came, now, and the future",
       o2.lines.length === 9 && /dumating ang mga Kastila/.test(o2.lines[1]) && /ngayon/.test(o2.lines[3]) &&
       /darating/.test(o2.lines[5]) && /Piringan/.test(o2.lines[8]), o2.lines);
    ok("he walked up to the Mabalasig", await page.evaluate(() => posX === 640 && facing === 1));
    ok("blindfolded again, on a black card", await waitIntertitle(page, true, 3000) &&
       (await intertitle(page)).lines[0] === "Muling piniringan si Macario.");
    await waitIntertitle(page, false, 12000);
    const o3 = await readConversation(page, 4);
    ok("the ordeal: leap the fire", o3.lines.length === 3 && /apoy/.test(o3.lines[0]), o3.lines);
    // Block 82. The leap is played, not carded: he leaves the ground and
    // lands forward.
    let leap = { up: false };
    for (let i = 0; i < 40; i++) {
      const s = await page.evaluate(() => ({ y: posY - floorHeightAt(posX), x: posX, card:!document.getElementById("intertitle").classList.contains("hidden") }));
      if (s.y > 30) leap.up = true;
      leap.card = leap.card || s.card;
      if (leap.up && s.y === 0) { leap.x = s.x; break; }
      await page.waitForTimeout(40);
    }
    ok("he jumps, seen, with no card, and lands forward", leap.up && leap.x === 690 && !leap.card &&
       await page.evaluate(() => __sfx.includes("jump")), leap);
    const o3b = await readConversation(page, 3);
    ok("and the Mabalasig says there was no fire", o3b.lines.length === 2 && /Walang apoy/.test(o3b.lines[1]), o3b.lines);
    const o4 = await readConversation(page, 4);
    ok("the oath", o4.lines.length === 3 && /Katipunan/.test(o4.lines[1]) && o4.lines[2] === "Macario: Isinusumpa ko po.", o4.lines);
    // Block 99. The Katipunero in the pulungan looks at Macario too.
    const kpFace = await page.evaluate(() => {
      const n = NPCS.find((x) => x.id === "katipunero" && !x.hidden);
      const side = Math.sign(posX + PLAYER_WIDTH / 2 - (n.x + NPC_WIDTH / 2));
      return { side, drawn: n.drawnFacing, transform: n.spriteEl.style.transform };
    });
    ok("the Katipunero in the pulungan looks at Macario (Block 99)",
       kpFace.side !== 0 && kpFace.drawn === kpFace.side &&
       kpFace.transform === (kpFace.side < 0 ? "scaleX(-1)" : ""), kpFace);
    ok("signed in blood from his arm, on a black card", await waitIntertitle(page, true, 3000) &&
       /braso/.test((await intertitle(page)).lines[0]));
    await waitIntertitle(page, false, 12000);
    const o5 = await readConversation(page, 10);
    const o5b = await readConversation(page, 10);
    ok("a Katipon now, which is why his word was Anak ng Bayan; at the door, sent out the back with the pamphlets, warned of the guardia civil",
       o5.lines.length === 4 && /Katipon/.test(o5.lines[0]) && /Anak ng Bayan/.test(o5.lines[1]) && /polyeto/.test(o5.lines[3]) &&
       o5b.lines.length === 4 && /mangingisda.*tabakera.*karpintero/.test(o5b.lines[0]) && /guardia civil/.test(o5b.lines[1]) &&
       /damit-teatro/.test(o5b.lines[2]) && o5b.lines[3] === "Macario: Opo. Ako na po ang bahala." &&
       await page.evaluate(() => posX === 420 && facing === -1), { o5: o5.lines, o5b: o5b.lines });
    await settle(page);
    await page.waitForTimeout(300);
    const lg5 = await log(page);
    ok("sworn in; the task is the pamphlets (0/3), and the way out the back is said (Block 93)",
       await page.evaluate(() => state.flags.tinanggapSaKatipunan === true) &&
       JSON.stringify(lg5.current) === JSON.stringify([STEP.pamphlets + " (0/3)"]) &&
       lg5.way === "Lumabas sa likod: pumunta sa kaliwa", lg5);
    await walkTo(page, 100);
    await page.keyboard.press("e");
    ok("Lumabas sa likod: onto the street by the back way, short of the mangingisda, facing him",
       await waitForScene(page, "tondo") && (await settle(page), true) &&
       await page.evaluate(() => posX === 4100 && facing === 1));

    console.log("\nThe pamphlets, past the guardia civil");
    const street = await page.evaluate(() => NPCS.filter((n) => !n.hidden).map((n) => n.id).join(","));
    // Block 102. The night is theirs and the guards': nobody else is out.
    ok("the three are on the street now, and the people of the day are gone for the night, the horse and the table too (Blocks 102, 103)",
       street === "mangingisda,tabakera,karpintero", street);
    const p1 = await panels(page);
    ok("nobody stands behind a tree", p1.blocked.length === 0, p1.blocked);
    const night = await page.evaluate(() => ({
      sky: document.getElementById("skyline").classList.contains("night-tint"),
      road: document.getElementById("ground-tiles").classList.contains("night-tint"),
      music: musicSrc }));
    ok("night on the run: the street and road darkened, crickets for music (Block 85)",
       night.sky && night.road && /gabi\.wav$/.test(night.music), night);
    const gd = await page.evaluate(() => ({
      guards: GUARDS.map((g) => [g.type, g.shoots, g.patrolFrom, g.patrolTo, Boolean(g.animation && /bantay\.png$/.test(g.animation.src))]),
      hides: HIDE_SPOTS.length, hearts: !document.getElementById("hud").classList.contains("hidden"),
      noRanged: Boolean(currentScene.noRanged) }));
    ok("three guardia civil on their beats, the catalogue's bantay, not shooting, a crate each, hearts shown, no gun",
       JSON.stringify(gd.guards) === JSON.stringify([["bantay", false, 5000, 5600, true], ["bantay", false, 7400, 8000, true],
         ["bantay", false, 9700, 10150, true]]) && gd.hides === 3 && gd.hearts && gd.noRanged, gd);
    // Seen: stood in front of the first, who faces him, until he catches.
    // Block 82. He can run where no guard is near, and not beside one.
    const run = await page.evaluate(() => {
      const far = runAllowed();
      posX = 4700; posY = floorHeightAt(posX);
      const near = runAllowed();
      posX = 4100; posY = floorHeightAt(posX);
      return { far, near };
    });
    ok("he can run on the street, away from the guards, and not beside one (Block 82)", run.far && !run.near, run);
    const caught = await page.evaluate(async () => {
      const g = GUARDS[0];
      // Block 93. From full health: health is carried through the whole
      // act, and a blow landed in an earlier fight before the harness
      // knocked everyone down (their timing is random) left him on one
      // heart here now and then, so the catch emptied the hearts and read
      // as a respawn instead of one heart lost.
      health = maxHealth; renderHearts();
      const hp0 = Game.health().health, seen0 = Game.stats().detections;
      g.pos = 5300; g.facing = -1; g.patrolFrom = g.patrolTo = 5300;
      posX = 5150; posY = floorHeightAt(posX); velY = 0; onGround = true;
      const t0 = performance.now();
      let slowed = false;
      for (let i = 0; i < 400 && posX !== 4100; i++) {
        slowed = slowed || Boolean(g.disguised);
        await new Promise((r) => setTimeout(r, 50));
      }
      g.patrolFrom = 5000; g.patrolTo = 5600;
      return { x: posX, hp: Game.health().health, hp0, seen: Game.stats().detections - seen0,
        slowed, secs: Math.round((performance.now() - t0) / 100) / 10 };
    });
    ok("a guard starting to notice is heard, the first time with a hint, and a catch stings (Block 85)",
       await page.evaluate(() => __sfx.includes("notice") && __sfx.includes("caught") && state.flags.__turoSaBantay === true));
    ok("seen by one, he is caught: a heart, a detection, and back to the back door",
       caught.x === 4100 && caught.hp === caught.hp0 - 1 && caught.seen === 1, caught);
    ok("standing still in the stage clothes, the guard's meter is slowed and drawn so, and takes seconds to fill",
       // Block 113: the meter fills twice as fast as it did, so about 3.5 s
       // in the clothes standing still (about 0.7 s without them).
       caught.slowed && caught.secs >= 2.5, caught);
    // The rest of the walk is about the hand-overs, not the stealth: the
    // guards are made short-sighted.
    await page.evaluate(() => GUARDS.forEach((g) => { g.detectRadius = 1; g.alert = 0; }));
    const handOver = async (x, name, n) => {
      await walkTo(page, x - 120);
      await page.keyboard.press("e");
      const before = await readConversation(page, 2);
      ok(name + " talks first, and nothing is given by talking", before.lines.length === 1 &&
         !(await page.evaluate((id) => state.flags["naibigayAngPolyetoKay_" + id], name.toLowerCase())), before.lines);
      ok(name + ": Iabot ang polyeto", (await gift(page)) === "Iabot ang polyeto");
      const t = await readConversation(page, 3);
      ok(name + " takes it, and the count moves",
         t.lines.length === 2 && t.lines[0] === PAMPHLET_LINE && t.lines[1].startsWith(name + ":") &&
         (n === 3 || JSON.stringify((await log(page)).current) === JSON.stringify([STEP.pamphlets + " (" + n + "/3)"])), t.lines);
    };
    await handOver(4800, "Mangingisda", 1);
    await handOver(6900, "Tabakera", 2);
    ok("a catch now puts him at the tabakera, the furthest of the three reached", await page.evaluate(() =>
      respawnX(currentScene) === 6780));
    const all = await doneInSettings(page);
    ok("settings lists the twelve finished tasks", all.length === 12 && all[0] === "Umuwi kasama si Nanay" &&
       all[3] === STEP.barber && all[11] === STEP.join, all);
    // Block 102. Nanay is home for the night, with the rest of the day's
    // people: the street is the three's and the guards'.
    const away = await page.evaluate(() => ["nanay", "kutsero", "mananahi", "direktor", "kasama"]
      .map((id) => NPCS.find((x) => x.id === id)).every((n) => n.hidden));
    ok("Nanay and the day's people stay off the street all night (Block 102)", away);
    await handOver(10600, "Karpintero", 3);

    ok("a line shown is remembered as read, for fast-forwarding (Block 85)", await page.evaluate(() => {
      const line = { speaker: "Pagsubok", text: "Isang linya " + Date.now() };
      return noteLineRead(line) === false && noteLineRead(line) === true && state.flags.__nabasa.length > 50;
    }));
    console.log("\nThe rounds end, and the way back (Block 94)");
    const end = await readConversation(page, 4);
    ok("his thought after the third", end.lines.length === 3 && /tatlo/.test(end.lines[0]) && /Nanay/.test(end.lines[1]), end.lines);
    ok("a card: the guardia civil's rounds are over", await waitIntertitle(page, true, 3000) &&
       JSON.stringify((await intertitle(page)).lines) === JSON.stringify(ROUNDS_OVER), await intertitle(page));
    await waitIntertitle(page, false, 15000);
    // Block 95. No door to find: the Kasama comes to him, wherever he is.
    const after3 = await page.evaluate(async () => {
      const dec = currentScene.decorations.find((d) => d.id === "kasama-kalye");
      for (let i = 0; i < 80 && !dec.moving; i++) await new Promise((r) => setTimeout(r, 50));
      const from = dec.currentX, edge = viewEdges().right;
      return { guards: GUARDS.length, crates: document.querySelectorAll("#world .hide-spot").length,
        night: document.getElementById("skyline").classList.contains("night-tint"),
        npcHidden: NPCS.find((n) => n.id === "kasama").hidden, coming: dec.moving, from, edge,
        exits: (currentScene.exits || []).length };
    });
    ok("the guards and their crates are gone, it is still night, and the Kasama walks up from the edge of the screen",
       after3.guards === 0 && after3.crates === 0 && after3.night && after3.npcHidden && after3.coming &&
       after3.from >= after3.edge - 30 && after3.exits === 0, after3);
    const fetch = await readConversation(page, 4);
    ok("he asks whether the three are done, and takes him back",
       fetch.lines.length === 3 && /^Kasama: Tapos na ang tatlo/.test(fetch.lines[0]) && /pulungan/.test(fetch.lines[2]), fetch.lines);
    ok("a card: the Kasama brings him back", await waitIntertitle(page, true, 4000) &&
       JSON.stringify((await intertitle(page)).lines) === JSON.stringify(BROUGHT_BACK), await intertitle(page));
    ok("and the fade into the pulungan", await waitForScene(page, "pulungan", 15000));
    ok("the task is to report", JSON.stringify((await log(page)).current) === JSON.stringify([STEP.report]),
       await log(page));

    console.log("\nThe report, and a year on (Block 94)");
    const r1 = await readConversation(page, 3);
    ok("the Kasama brings him in, and he says it is done", r1.lines.length === 2 && /^Kasama: Narito na siya/.test(r1.lines[0]), r1.lines);
    const r2 = await readConversation(page, 6);
    ok("he reports to the Mabalasig", r2.lines.length === 5 && /^Mabalasig: Lahat\?/.test(r2.lines[0]) &&
       /^Katipunero:/.test(r2.lines[2]), r2.lines);
    ok("a card: a year on, Tondo, 1895", await waitIntertitle(page, true, 4000) &&
       JSON.stringify((await intertitle(page)).lines) === JSON.stringify(A_YEAR_ON), await intertitle(page));
    await waitIntertitle(page, false, 15000);
    const y1 = await readConversation(page, 5);
    const head = await page.evaluate(() => ({ x: posX, facing, npcs: NPCS.filter((n) => !n.hidden).length,
      decs: ["katipunero-1895", "mabalasig-1895"].map((id) => document.getElementById("dec-" + id).style.display !== "none"),
      saved: state.flags.nakapagUlat === true }));
    ok("he stands at the head of the room, and the Katipunero takes his orders, calling him Pangulo",
       y1.lines.length === 4 && /^Katipunero: Pangulo/.test(y1.lines[0]) && /^Macario:/.test(y1.lines[1]) &&
       head.x === 760 && head.facing === -1 && head.npcs === 0 && head.decs.every(Boolean) && head.saved, { y1: y1.lines, head });
    const y2 = await readConversation(page, 9);
    ok("the Kasama brings recruits, and then: his mother is at the door",
       y2.lines.length === 8 && /sumapi/.test(y2.lines[0]) && /nanay mo/.test(y2.lines[6]), y2.lines);
    const y3 = await readConversation(page, 9);
    const door = await page.evaluate(() => ({ nanay: document.getElementById("dec-nanay-1895").style.display !== "none", x: posX }));
    ok("Nanay at the door asks, and he lies to her",
       y3.lines.length === 8 && /kasali/.test(y3.lines[2]) && y3.lines[4] === THE_LIE && door.nanay && door.x < 400, { y3: y3.lines, door });
    const y4 = await readConversation(page, 3);
    ok("back at his place, the new brothers are ready", y4.lines.length === 2 && /Pangulo/.test(y4.lines[0]) &&
       await page.evaluate(() => posX === 760), y4.lines);
    const y5 = await readConversation(page, 2);
    ok("the Kasama, at the door: Pangulo", y5.lines.length === 1 && y5.lines[0] === "Kasama: Pangulo.", y5.lines);
    await page.waitForTimeout(300);
    ok("and the door is shut on her, with its sound", await page.evaluate(() =>
      document.getElementById("dec-nanay-1895").style.display === "none" &&
      __sfx.filter((n) => n === "door").length >= 2));
    ok("the last black card", await waitIntertitle(page, true, 4000) &&
       JSON.stringify((await intertitle(page)).lines) === JSON.stringify(THE_END), await intertitle(page));
    let post = null;
    for (let i = 0; i < 150; i++) {
      post = await page.evaluate(() => ({ status: Acts.status, done: Acts.countDone(1),
        quiz: !document.getElementById("quiz").classList.contains("hidden"),
        eyebrow: document.getElementById("quiz-eyebrow").textContent }));
      if (post.quiz && /Panapos/.test(post.eyebrow)) break;
      await page.waitForTimeout(100);
    }
    ok("and it opens on a calm card, not a question (Block 85)", await page.evaluate(() =>
      document.getElementById("quiz-title").textContent === "Handa ka na ba?" &&
      document.querySelectorAll(".quiz-choice").length === 0));
    ok("every step is done, Act I finishes, and the post-test opens",
       post.done === 14 && post.status === "posttest" && post.quiz && /Panapos/.test(post.eyebrow), post);
    await ctx.close();
  }

  if (part("reloads", "reloads, and saves from before")) {
    // ---------------------------------------------------------------
    // Reloads, and saves from before this block.
    // ---------------------------------------------------------------
    console.log("\nReloads and old saves");

    const upToMananahi = { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true,
      nakausapAngKutsero: true, naalagaanAngKabayo: true, nakausapAngMananahi: true };
    const delivered = Object.assign({}, upToMananahi,
      { tinawagAngMananahi: true, mayDalangDamit: true, naihatidKay_direktor: true });

    r = await resume("tondo", { nakitaAngMgaSiga: true });
    ok("a reload mid-opening starts again from Tondo, 1890", (await intertitle(r.page)).lines[0] === "Tondo, 1890");
    // A student's speed taps through the card; fast-forwarded, it is gone
    // before a tap and the taps would skip the siga's first line.
    if (SPEED === 1) { await r.page.keyboard.press("e"); await r.page.waitForTimeout(1000); await r.page.keyboard.press("e"); }
    await waitIntertitle(r.page, false, 8000);
    c = await readConversation(r.page, 3);
    ok("and plays the siga again", JSON.stringify(c.lines) === JSON.stringify(OPENING), c.lines);
    await winOpeningFight(r.page);
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
    ok("a Block 56 or 57 save past the savings, which never saw the first play, gets the four years (Block 80)",
       await waitIntertitle(r.page, true, 5000) &&
       JSON.stringify((await intertitle(r.page)).lines) === JSON.stringify(FOUR_YEARS));
    ok("and goes on to Principe Baldovino, not the first play",
       await waitForScene(r.page, "entablado", 20000) &&
       /^Maryam: Principe Baldovino!/.test((await readConversation(r.page, 1)).lines[0] || ""));
    await r.ctx.close();

    // Block 80. Reloads through the end of the act.
    const savingsGiven = Object.assign({}, delivered, { naihatidAngMgaDamit: true, naitanghalAngDula: true,
      nabayaranNgMananahi: true, naibigayAngIponKayNanay: true, lumipasAngApatNaTaon: true });
    r = await resume("entablado", Object.assign({}, savingsGiven, { naitanghalAngBaldovino: true }));
    c = await readConversation(r.page, 20);
    ok("a reload after Principe Baldovino and before the men have gone plays only the men",
       c.lines[0] === "Katipunero: Principe Baldovino." && c.lines.length === 13 &&
       await r.page.evaluate(() => posX === 700), c.lines);
    await r.ctx.close();

    const worded = Object.assign({}, savingsGiven, { naitanghalAngBaldovino: true, nilapitanNgKatipunan: true,
      nakausapAngKasama: true });
    r = await resume("pulungan", worded);
    for (let i = 0; i < 60 && !(await line(r.page)); i++) await r.page.waitForTimeout(100);
    const rp = await r.page.evaluate(() => ({ scene: currentSceneId, x: posX }));
    c = await readConversation(r.page, 4);
    ok("a reload in the pulungan before the oath is over plays it again from the top",
       c.lines[0] === "Mabalasig: Alisin ang kanyang piring." && rp.scene === "pulungan" && rp.x === 120, { lines: c.lines, rp });
    await r.ctx.close();

    r = await resume("tondo", worded);
    await r.page.waitForTimeout(300);
    await walkTo(r.page, 12380);
    await r.page.keyboard.press("e");
    c = await readConversation(r.page, 2);
    ok("the word said but the oath not taken: the Kasama takes him in again, in one line",
       c.lines.length === 1 && /Sumunod ka na/.test(c.lines[0]) && await waitForScene(r.page, "pulungan", 15000), c.lines);
    await r.ctx.close();

    // Block 81. The street is built before the save arrives: a reload in
    // the middle of the run must still put the guardia civil and their
    // crates on it, and one before the run must not.
    r = await resume("tondo", Object.assign({}, worded, { tinanggapSaKatipunan: true }));
    await r.page.waitForTimeout(400);
    const onRun = await r.page.evaluate(() => ({ guards: GUARDS.length,
      els: document.querySelectorAll("#world .guard").length, crates: document.querySelectorAll("#world .hide-spot").length,
      hearts: !document.getElementById("hud").classList.contains("hidden") }));
    ok("a reload mid-run puts the three guardia civil and their crates back, with the hearts",
       onRun.guards === 3 && onRun.els === 3 && onRun.crates === 3 && onRun.hearts, onRun);
    await r.ctx.close();
    r = await resume("tondo", worded);
    await r.page.waitForTimeout(400);
    const offRun = await r.page.evaluate(() => ({ guards: GUARDS.length,
      crates: document.querySelectorAll("#world .hide-spot").length,
      hearts: !document.getElementById("hud").classList.contains("hidden") }));
    ok("and one before the oath has no guards, no crates and no hearts",
       offRun.guards === 0 && offRun.crates === 0 && !offRun.hearts, offRun);
    await r.ctx.close();

    const pamphletsDone = Object.assign({}, worded, { tinanggapSaKatipunan: true,
      naibigayAngPolyetoKay_karpintero: true, naibigayAngPolyetoKay_tabakera: true,
      naibigayAngPolyetoKay_mangingisda: true, naipamigayAngTatlongPolyeto: true });
    r = await resume("tondo", pamphletsDone);
    c = await readConversation(r.page, 4);
    ok("a reload after the third pamphlet and before the rounds end plays that beat again",
       c.lines.length === 3 && /tatlo/.test(c.lines[0]), c.lines);
    await r.ctx.close();

    // Block 94. The way back and the end, reloaded.
    const roundsOver = Object.assign({}, pamphletsDone, { nataposAngRonda: true, naipamigayAngMgaPolyeto: true });
    r = await resume("tondo", roundsOver);
    await r.page.waitForTimeout(500);
    const wayBack = await r.page.evaluate(() => ({ guards: GUARDS.length,
      night: document.getElementById("skyline").classList.contains("night-tint"),
      kasama: NPCS.find((n) => n.id === "kasama").hidden, cut: cutscenePlaying }));
    const wl = await log(r.page);
    ok("a reload on the street before the report: no guards, still night, the Kasama at his spot, the task the report",
       wayBack.guards === 0 && wayBack.night && !wayBack.kasama && !wayBack.cut &&
       JSON.stringify(wl.current) === JSON.stringify([STEP.report]), { wayBack, wl });
    await walkTo(r.page, 12380);
    await r.page.keyboard.press("e");
    c = await readConversation(r.page, 2);
    ok("and talking to him takes Macario back to the pulungan (Block 95)",
       c.lines.length === 1 && /pulungan/.test(c.lines[0]) && await waitForScene(r.page, "pulungan", 15000), c.lines);
    await r.ctx.close();
    r = await resume("pulungan", roundsOver);
    c = await readConversation(r.page, 3);
    ok("a reload in the pulungan before the report plays the report",
       /^Kasama: Narito na siya/.test(c.lines[0] || ""), c.lines);
    await r.ctx.close();
    r = await resume("pulungan", Object.assign({}, roundsOver, { nakapagUlat: true }));
    ok("a reload after the report plays only the year after, from its card",
       await waitIntertitle(r.page, true, 6000) &&
       JSON.stringify((await intertitle(r.page)).lines) === JSON.stringify(A_YEAR_ON));
    await r.ctx.close();

    r = await resume("tondo", { nakitaAngMgaSiga: true, nakausapSiNanaySaBahay: true, nagpasyangMagtrabaho: true,
      nakausapAngKutsero: true }, 12);
    await r.page.waitForTimeout(400);
    const rj = await r.page.evaluate(() => ({ cut: cutscenePlaying, box: !dialogueBox.classList.contains("hidden"),
      title: !document.getElementById("intertitle").classList.contains("hidden"),
      toast: document.getElementById("toast").classList.contains("hidden") }));
    const rl = await log(r.page);
    ok("a save with the Kutsero spoken to lands on the horse, with nothing replayed and no toast",
       !rj.cut && !rj.box && !rj.title && rj.toast &&
       JSON.stringify(rl.current) === JSON.stringify([STEP.groom]), { rj, rl });
    await r.ctx.close();
  }

  if (part("talaan", "the teacher's Talaan papers, no guide")) {
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
    ok("with no papers written, the game's own three lie on the road (Block 94)",
       bare.book && bare.book.hints.total === 3 && bare.hints === 3, bare);
    const own = await r.page.evaluate(() => hintList().map((h) => h.title));
    ok("and they are its papers of facts", JSON.stringify(own) === '["Si Macario Sakay","Ang komedya","Ang Katipunan"]', own);
    await r.ctx.close();

    r = await resume("tondo", afterThought, 0, PAPERS);
    await r.page.waitForTimeout(500);
    const laid = await r.page.evaluate(() => PICKUPS.filter((p) => p.type === "hint").map((p) => [p.x, p.y === undefined ? null : p.y]));
    ok("the teacher's papers lie at their slots' places, and an empty slot keeps the game's own (Block 94)",
       JSON.stringify(laid) === "[[2500,null],[8200,155],[12200,155]]", laid);
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
       found.card.eyebrow === "Papel 1 / 3" && found.card.title === "Unang papel" && found.card.note.length > 0 &&
       found.saved === true, found);
    await r.page.evaluate(() => Shell.openPause());
    await r.page.waitForTimeout(150);
    ok("the pause screen offers the Talaan, counting the papers",
       await r.page.evaluate(() => document.querySelector("#shell-notebook .lbl").textContent === "Talaan 1/3"));
    await r.ctx.close();

    r = await resume("tondo", Object.assign({ pahiwatig_0: true }, afterThought), 0, PAPERS);
    await r.page.waitForTimeout(500);
    const kept = await r.page.evaluate(() => ({
      laid: [...document.querySelectorAll(".pickup-page")].map((e) => parseInt(e.style.left, 10)),
      book: Game.glossary().hints }));
    ok("a reload keeps a found paper found, and lays only the other",
       JSON.stringify(kept.laid) === "[8200,12200]" && kept.book.found === 1 && kept.book.total === 3, kept);
    await r.ctx.close();
  }

  if (part("tutorials", "tutorials: the world waits for the task")) {
    // ---------------------------------------------------------------
    console.log("\nTutorials: the world waits for the task (Block 92)");
    {
      const tt = await newPage(browser, { session: null, tutorials: true });
      const p = tt.page;
      await p.click("#shell-guest");
      await p.waitForTimeout(700);
      await waitIntertitle(p, false, 15000);
      await readConversation(p, 3);
      const cardOf = () => p.evaluate(() => ({
        shown: !document.getElementById("tutorial-card").classList.contains("hidden"),
        text: document.getElementById("tutorial-text").textContent,
        pulsing: [...document.querySelectorAll(".tutorial-pulse")].map((b) => b.id),
      }));
      const waitCard = async (re) => {
        for (let i = 0; i < 80; i++) {
          const c = await cardOf();
          if (c.shown && re.test(c.text)) return c;
          await p.waitForTimeout(100);
        }
        return cardOf();
      };
      const atake = await waitCard(/Atake/);
      ok("as the fight opens a card asks for Atake, and the button pulses",
         atake.shown && atake.pulsing.join() === "btn-attack", atake);
      const hold1 = await p.evaluate(() => ({ pos: ENEMIES.map((e) => Math.round(e.pos)).join(), n: ENEMIES.length, hp: health }));
      await p.waitForTimeout(1800);
      const hold2 = await p.evaluate(() => ({ pos: ENEMIES.map((e) => Math.round(e.pos)).join(), n: ENEMIES.length, hp: health,
        tells: document.querySelectorAll(".enemy-windup").length }));
      ok("and the world waits: three enemies, and none has moved, lit up or struck", hold1.n === 3 &&
         hold1.pos === hold2.pos && hold2.hp === hold1.hp && hold2.tells === 0, { hold1, hold2 });
      await p.keyboard.press("j");
      await p.waitForTimeout(150);
      const went = await p.evaluate(() => ({ hidden: document.getElementById("tutorial-card").classList.contains("hidden"),
        flag: state.flags.__turo_atake === true, pulse: document.querySelectorAll(".tutorial-pulse").length }));
      ok("one strike lets it go on: it is remembered, and the Atake card is gone (the first red ! may follow)",
         went.flag && went.pulse === 0 && !/Atake/.test((await cardOf()).text && (await cardOf()).shown ? (await cardOf()).text : ""), went);
      await p.evaluate(() => ENEMIES.forEach((e) => { if (!e.dead) hitEnemy(e, 99); }));

      // Presses E through everything he is told until the walking card is up.
      for (let i = 0; i < 400; i++) {
        const c = await cardOf();
        if (c.shown && /Lumakad/.test(c.text)) break;
        if (await line(p)) await p.keyboard.press("e");
        await p.waitForTimeout(150);
      }
      const lakad = await waitCard(/Lumakad/);
      ok("after the thought, a card asks him to walk, the arrows pulsing",
         lakad.shown && lakad.pulsing.sort().join() === "btn-left,btn-right", lakad);
      await p.keyboard.down("d");
      await p.waitForTimeout(500);
      await p.keyboard.up("d");
      await p.waitForTimeout(150);
      const talon = await waitCard(/Tumalon/);
      ok("walking is learned, and the next card asks him to jump",
         await p.evaluate(() => state.flags.__turo_lakad === true) && talon.shown && talon.pulsing.join() === "btn-jump", talon);
      await p.waitForTimeout(700);
      await p.keyboard.press(" ");
      const usap = await waitCard(/kausapin/);
      ok("jumping is learned, and beside Nanay, the first person within reach, the next is to talk",
         await p.evaluate(() => state.flags.__turo_talon === true) && usap.shown && usap.pulsing.join() === "btn-interact", usap);
      await p.waitForTimeout(700);
      await p.keyboard.press("e");
      await p.waitForTimeout(200);
      ok("talking clears it, and nothing else waits", await p.evaluate(() => state.flags.__turo_usap === true) && !(await cardOf()).shown);
      await readConversation(p, 2);

      // The first warning sign ever seen: the world stops on it.
      await p.evaluate(() => { spawnEnemies([{ type: "siga1", id: "tanda-1", x: posX + 200 }]); });
      const tanda = await waitCard(/babala/);
      const sign = await p.evaluate(() => {
        const el = document.querySelector(".enemy-windup");
        return { has: Boolean(el), content: el ? getComputedStyle(el, "::after").content : null };
      });
      ok("the first red ! stops the world with a card about it", tanda.shown && sign.has && sign.content === '"!"', { tanda, sign });
      await p.waitForTimeout(700);
      await p.keyboard.press("j");
      await p.waitForTimeout(200);
      ok("and any answer, here an attack, lets it go", !(await cardOf()).shown &&
         await p.evaluate(() => state.flags.__turo_tanda === true));
      await tt.ctx.close();
    }
  }

  if (part("guest", "a guest: the same opening, and on into Act II")) {
    // ---------------------------------------------------------------
    console.log("\nGuest");
    const g = await newPage(browser, { session: null });
    await g.page.click("#shell-guest");
    await g.page.waitForTimeout(700);
    ok("a guest opens on Tondo, 1890 too", (await intertitle(g.page)).lines[0] === "Tondo, 1890");
    await waitIntertitle(g.page, false, 15000);
    c = await readConversation(g.page, 3);
    ok("and watches the same opening", JSON.stringify(c.lines) === JSON.stringify(OPENING), c.lines);
    await g.ctx.close();

    const gp = await newPage(browser, Object.assign({ session: null }, PAPERS));
    await gp.page.click("#shell-guest");
    await gp.page.waitForTimeout(900);
    ok("a guest gets the teacher's papers too, with the game's own in the empty slot (Block 94)",
       await gp.page.evaluate(() => PICKUPS.filter((p) => p.type === "hint").length === 3 && hintList()[0].title === "Unang papel" &&
         !__DB.game_progress.length));
    await gp.ctx.close();

    // Block 116. A guest who finishes Act I goes on into Act II: no
    // trivia card, no tests, nothing written. From the last story point
    // (the report), played out to the act's end.
    console.log("\nA guest plays on into Act II (Block 116)");
    const ga = await newPage(browser, { session: null });
    const gpage = ga.page;
    await gpage.goto("http://localhost:" + PORT + "/index.html?dev=1");
    await gpage.waitForTimeout(400);
    await gpage.selectOption("#shell-dev-jump", "1:ulat");
    await gpage.click("#shell-dev-go");
    const actScreen = () => gpage.evaluate(() => {
      const up = !document.getElementById("act-screen").classList.contains("hidden");
      return up ? { title: document.getElementById("act-screen-title").textContent,
        body: document.getElementById("act-screen-body").textContent,
        btn: document.querySelector("#act-screen-btn .lbl").textContent } : null;
    });
    // Through the report, the year after and its cards, pressing on
    // through every line, until the act's end is on screen.
    let end = null;
    for (let t = 0; t < 60000 && !(end = await actScreen()); t += 60) {
      if (await line(gpage)) await gpage.keyboard.press("e");
      await gpage.waitForTimeout(60);
    }
    ok("at Act I's end the guest is offered Act II, with no test and nothing written",
       end && end.title === "Magaling!" && end.btn === "Magpatuloy sa Ikalawang Yugto" && /Susunod:/.test(end.body) &&
       await gpage.evaluate(() => !(__DB.game_progress || []).length && !(__DB.act_progress || []).length &&
         !(__DB.assessment_scores || []).length && document.getElementById("quiz").classList.contains("hidden")), end);
    await gpage.click("#act-screen-btn");
    await gpage.waitForTimeout(200);
    const title2 = await actScreen();
    ok("Act II's title card", title2 && title2.title === "Ang Mahabang Anino ng Digmaan" && title2.btn === "Simulan", title2);
    await gpage.click("#act-screen-btn");
    for (let t = 0; t < 8000 && !(await line(gpage)); t += 100) await gpage.waitForTimeout(100);
    const into = await gpage.evaluate(() => ({ act: Acts.current, scene: currentSceneId, guest: Game.isGuest(),
      clothes: Inventory.owns("damit-entablado"), quiz: !document.getElementById("quiz").classList.contains("hidden"),
      trivia: !document.getElementById("act-screen").classList.contains("hidden"),
      written: ["game_progress", "act_progress", "assessment_scores", "game_sessions"].reduce((a, t) => a + (__DB[t] || []).length, 0) }));
    ok("then straight into Act II's opening at the press, still a guest, the stage clothes kept, no test, nothing written",
       into.act === 2 && into.scene === "imprenta" && into.guest && into.clothes && !into.quiz && !into.trivia &&
       into.written === 0 && Boolean(await line(gpage)), into);
    await ga.ctx.close();
  }

  if (part("act2", "Act II end to end, and a reload mid-charge")) {
    // ---------------------------------------------------------------
    // Block 113. Act II, end to end, as a guest from its first story
    // point: the press, home and the knock, the sweep, the raid and the
    // list, the night run, the shout and the chase to the mountains, the cedula, San Juan del Monte
    // (fifteen soldiers, the Kasama), the retreat, the scarecrows, Balara,
    // Laguna and the end. Throughout, no line is ever said behind black
    // (the bug that froze the end). Then a reload in the middle of a beat.
    // ---------------------------------------------------------------
    console.log("\nAct II (Block 113)");
    {
      const startAt = (p, id) => jumpTo(p, "2:" + id);

      const { ctx, page } = await newPage(browser, { session: null });
      await startAt(page, "simula");
      await watchBlack(page);
      ok("Act II opens at the press on Tondo, Agosto 1896", await waitIntertitle(page, true, 5000) &&
         (await intertitle(page)).lines[0] === "Tondo, Agosto 1896" && await page.evaluate(() => currentSceneId === "imprenta"));
      await waitIntertitle(page, false, 15000);
      let c = await readLines(page, 3);
      await settle(page);
      ok("Jacinto, and the first thing to do is print",
         c.lines[0] === "Jacinto: Dahan-dahan sa diin, Macario. Hinihintay ng bayan ang ikalawang labas." &&
         await stepIs(page, "Maglimbag ng Kalayaan"), c.lines);
      await press(page, 330);
      const pw = await workState(page);
      const stage = await page.evaluate(() => ({ cls: document.getElementById("work-stage").className,
        lines: document.querySelectorAll("#work-marks i").length,
        platen: document.getElementById("work-tool").className }));
      ok("the press is the work game with a sheet and a platen (Block 113)",
         pw.up && pw.title === "Palimbagan" && pw.hitLabel === "Diinan" && stage.cls === "work-stage-press" &&
         stage.lines === 5 && /work-platen/.test(stage.platen), { pw, stage });
      for (let i = 0; i < 5; i++) await workStroke(page, i % 2 === 0);
      const printed = await page.evaluate(() => [...document.querySelectorAll("#work-marks i")].map((i) => i.className));
      ok("each stroke prints a line, clean or smudged",
         JSON.stringify(printed) === JSON.stringify(["work-print-ok", "work-print-bad", "work-print-ok", "work-print-bad", "work-print-ok"]), printed);
      await page.click("#work-hit");
      c = await readLines(page, 12);
      ok("the second Kalayaan \"from Yokohama\", a rumour of the priest, and the list kept with where everyone lives",
         c.lines.includes("Macario: \"Inilimbag sa Yokohama\" pa rin po?") &&
         c.lines.some((x) => /nagpunta sa kura/.test(x)) &&
         c.lines.includes("Macario (sa isip): Pati ang pangalan ko. Pati ang bahay namin."), c.lines);
      await settle(page);
      ok("the task: home", await stepIs(page, "Umuwi sa bahay"));

      await press(page, 2520);
      ok("the press door leads onto the street", await waitForScene(page, "tondo"));
      await settle(page);
      await walkTo(page, 3220);
      await page.waitForTimeout(150);
      await page.keyboard.press("e");
      let l = await line(page);
      await page.keyboard.press("e");
      ok("on the walk home the Kutsero will not know him (before the sweep)", l === "Kutsero: Hindi kita kilala, iho. Umalis ka na." &&
         (await page.evaluate(() => GUARDS.length)) === 0, l);
      await page.waitForTimeout(300);
      await press(page, 1990);
      ok("Nanay's door leads home", await waitForScene(page, "bahay"));
      c = await readLines(page, 50, 6000); // he walks the room to her mid-beat, Isko runs in
      const promise = c.lines.indexOf("Macario: Babalik po ako. Pangako.");
      const cut = c.lines.indexOf("Macario: Opo, 'Nay. Uuwi p—");
      const knock = c.lines.indexOf("Isko: Pangulo! Pangulo!");
      ok("the ink, Pangulo, the father, the promise, and the knock breaks in on his answer",
         c.lines[0] === "Nanay: Anak! Akala ko kung napaano ka na." && c.lines.includes("Nanay: Ano 'to? Tinta?") &&
         promise > 0 && cut === promise + 3 && knock === cut + 1, c.lines);
      ok("Isko brings a problem at the press and nothing more: nobody knows it is the sweep",
         c.lines.includes("Isko: Pasensya na po sa abala. May problema po sa imprenta.") &&
         !c.lines.some((x) => /paghuli|nagtapat|Paano po si Nanay|Bantayan/.test(x)), c.lines);
      const goes = c.lines.indexOf("Macario: Sandali lang po ito, 'Nay. Babalik po ako agad.");
      ok("she says it, and he goes for an hour",
         goes > 0 && c.lines[goes - 1] === "Nanay: Kapapangako mo lang.", c.lines);
      ok("straight out onto the street, no card between, and the street is wrong",
         c.lines[goes + 1] === "Macario (sa isip): Bakit ang daming guardia sa kalye?" &&
         await page.evaluate(() => currentSceneId === "tondo" && state.flags.a2_paghuli === true), c.lines);
      await settle(page);
      ok("the task: back to the press", await stepIs(page, "Bumalik sa imprenta"));
      ok("the neighbours are indoors now", await page.evaluate(() =>
        NPCS.filter((n) => !n.hidden && !n.scenery).length === 0));
      ok("four guards walk between home and the press in the sweep", (await on(page, "guardia-araw-")) === 4);
      await quiet(page);
      // A catch on the way puts him back at the last point he passed
      // (reached checkpoints, Block 113).
      const back = await page.evaluate(async () => {
        posX = 4620; await new Promise((r) => setTimeout(r, 300));
        const reached = state.flags.a2_araw2 === true;
        const g = GUARDS.find((x) => x.id === "guardia-araw-3");
        g.disabled = false;
        g.patrolFrom = g.patrolTo = g.pos = 6200; g.facing = -1; g.alert = 0;
        posX = 6000; posY = floorHeightAt(posX); velY = 0; onGround = true;
        for (let i = 0; i < 80 && posX > 5500; i++) await new Promise((r) => setTimeout(r, 50));
        return { reached, x: Math.round(posX) };
      });
      ok("a catch on the way to the press puts him back at the last point he passed", back.reached && back.x === 4600, back);
      await quiet(page);
      await press(page, 7910);
      ok("inside, the raid", await waitForScene(page, "imprenta"));
      c = await readLines(page, 10);
      ok("the guards got there first, and a printer says why",
         c.lines[0] === "Macario (sa isip): Bukas ang pinto..." && c.lines.includes("Manlilimbag: Daan-daang pangalan, Pangulo. Pati ang sa inyo."), c.lines);
      await settle(page);
      ok("three guards search the press, with two shelves above their sight",
         (await on(page, "guardia-loob-")) === 3 && await page.evaluate(() => PLATFORMS.length === 2));
      // The meter at twice its old speed (Block 113): a guard who sees him
      // on the move fills it in well under a second and a half. Standing
      // still in the stage clothes (worn since Act I) still slows it
      // fivefold. Measured with the guard held still and the catch itself
      // kept from happening (the meter is read, then emptied).
      const meter = (still) => page.evaluate((still) => new Promise((resolve) => {
        const g = GUARDS.find((x) => x.id === "guardia-loob-1");
        g.patrolFrom = g.patrolTo = g.pos; g.facing = -1; g.alert = 0;
        const keep = equipEffects.stillDetectionMult;
        if (!still) equipEffects.stillDetectionMult = 1;
        posX = g.pos - 160;
        const start = performance.now();
        const tick = () => {
          if (g.alert >= 0.95 || performance.now() - start > 1300) {
            const r = { ms: Math.round(performance.now() - start), alert: Math.round(g.alert * 100) / 100, rate: GUARD_ALERT_RATE };
            g.alert = 0;
            equipEffects.stillDetectionMult = keep;
            posX = 2450;
            resolve(r);
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }), still);
      const seen = await meter(false);
      ok("one who sees him fills his meter in about 0.7 s (Block 113)",
         seen.rate === 0.024 && seen.alert >= 0.95 && seen.ms < 1100, seen);
      const disguised = await meter(true);
      ok("standing still in the stage clothes he is still noticed far more slowly",
         disguised.alert < 0.5 && disguised.ms >= 1300, disguised);
      await settle(page);
      await quiet(page);
      ok("the task: the list", await stepIs(page, "Kunin ang talaan ng mga kasapi"));
      await press(page, 330);
      c = await readLines(page, 7);
      await settle(page);
      ok("his own name in the list, and the receipts have Nanay's door",
         c.lines.includes("Macario (sa isip): \"Macario Sakay. Tondo. Kasama ang ina.\"") &&
         c.lines.includes("Macario (sa isip): Si Nanay!") &&
         c.lines[c.lines.length - 1] === "Macario (sa isip): Iniwan ko siyang mag-isa." && await stepIs(page, "Balikan si Nanay"), c.lines);
      ok("the front door is shut to him now", await page.evaluate(() => { posX = 2500; return true; }) &&
         await page.evaluate(() => new Promise((r) => setTimeout(() => r(btnInteract.classList.contains("hidden") ||
           !/Lumabas/.test(btnInteract.textContent)), 200))));
      await press(page, 100);
      ok("out of the window, into the night street", await playOn(page, "currentSceneId === 'tondo' && inDialogue", 30000));
      c = await readLines(page, 3);
      const night = await page.evaluate(() => ({ night: document.getElementById("skyline").classList.contains("night-tint"),
        x: Math.round(posX), out: NPCS.filter((n) => !n.hidden && !n.scenery).map((n) => n.id) }));
      ok("he left nobody with her; the street is dark and nobody is out",
         c.lines[1] === "Macario (sa isip): Wala akong pinabantay sa kanya. Wala ni isa." && night.night && night.out.length === 0 && night.x === 8050,
         { lines: c.lines, night });
      await settle(page);
      ok("two night patrols on the way home", (await on(page, "guardia-gabi-")) === 2);
      await quiet(page);
      await walkTo(page, 6100);
      await walkTo(page, 4530);
      c = await readLines(page, 6);
      ok("short of home, a guard: \"Hoy, sino ka?! Bumalik ka dito!\", started where he stands",
         c.lines.includes("Bantay: Hoy, sino ka?!") && c.lines[c.lines.length - 1] === "Bantay: Bumalik ka dito!" &&
         await page.evaluate(() => currentSceneId === "tondo" && posX > 4000), c.lines);
      await settle(page);
      const chase = await page.evaluate(() => ({
        after: GUARDS.filter((g) => /^guardia-habol-/.test(g.id)).map((g) => g.hostile),
        ahead: GUARDS.filter((g) => /^guardia-daan-/.test(g.id)).length,
        facing, road: NPCS.some((n) => n.id === "bundok" && !n.hidden) }));
      ok("he turns and runs from her; two come after him firing, two more ahead; the road to the mountains open",
         JSON.stringify(chase.after) === "[true,true]" && chase.ahead === 2 && chase.facing === 1 && chase.road &&
         await stepIs(page, "Tumakas papunta sa bundok"), chase);
      await quiet(page);
      await walkTo(page, 6000);
      await walkTo(page, 8000);
      await walkTo(page, 10000);
      ok("the chase's points are reached as he passes them",
         await page.evaluate(() => state.flags.a2_habol1 && state.flags.a2_habol2 && state.flags.a2_habol3));
      await press(page, 11240);
      ok("to the mountains; he never gets back to her; on black to Pugad Lawin",
         await playOn(page, "currentSceneId === 'pugad-lawin' && inDialogue", 50000));
      c = await readLines(page, 16);
      ok("Isko went to the house: empty, the door broken, nobody knows",
         c.lines.includes("Isko: Walang nakakaalam kung saan siya dinala. O kung... dinala man.") &&
         c.lines.includes("Macario: Hindi ko siya pinabantayan.") && c.lines.includes("Bonifacio: Ilabas ang inyong mga sedula!"), c.lines);
      await settle(page);
      await walkTo(page, 690);
      ok("the cedula is his to tear: Punitin ang sedula", (await gift(page)) === "Punitin ang sedula");
      c = await readLines(page, 12);
      ok("for her, wherever she is; and Bonifacio heard his line from the stage",
         c.lines[1] === "Macario (sa isip): Kung nasaan ka man ngayon, 'Nay... para sa'yo ito." &&
         c.lines.includes("Bonifacio: Napanood kita bilang Baldovino. \"Walang bayang mananatiling alipin...\""), c.lines);

      ok("on black to San Juan del Monte", await playOn(page, "currentSceneId === 'san-juan' && inDialogue", 40000));
      await page.evaluate(() => { window.__fought = new Set(); });
      const kasama = [];
      for (let t = 0; t < 600 && !(await page.evaluate(() => state.flags.a2_lumusob === true)); t++) {
        const l2 = await line(page);
        if (l2 && /^Kasama:/.test(l2) && !kasama.includes(l2)) kasama.push(l2);
        await playOn(page, "!dialogueBox.classList.contains('hidden') || state.flags.a2_lumusob === true", 3000);
        const l3 = await line(page);
        if (l3 && /^Kasama:/.test(l3) && !kasama.includes(l3)) kasama.push(l3);
        if (l3) await page.keyboard.press("e");
        await page.waitForTimeout(120);
      }
      await playOn(page, "!cutscenePlaying && document.getElementById('intertitle').classList.contains('hidden')", 20000);
      const sj = await page.evaluate(() => ({ fought: window.__fought.size, x: Math.round(posX),
        rifles: GUARDS.filter((g) => /^riple-/.test(g.id) && !g.disabled).length,
        river: NPCS.some((n) => n.id === "ilog" && !n.hidden), kasama: decorationEl("kasama-sj").style.display !== "none" }));
      ok("fifteen fought at San Juan del Monte; five rifles stand between him and the river",
         sj.fought === 15 && sj.rifles === 5 && sj.river && sj.x === 3600 && !sj.kasama, sj);
      ok("the Kasama falls: \"Huwag kang lilingon\", as on the night he led him in",
         kasama.includes("Kasama: Gaya ng una nating lakad. Huwag kang lilingon.") && kasama.includes("Kasama: Tumakbo ka na!"), kasama);
      ok("the task: back to the river", await stepIs(page, "Umatras sa ilog"));
      await quiet(page);
      await press(page, 110);
      const cards = [];
      for (let t = 0; t < 300 && !(await page.evaluate(() => currentSceneId === "nangka" && inDialogue)); t++) {
        const it = await intertitle(page);
        if (it.up && it.lines.length && !cards.includes(it.lines.join(" | "))) cards.push(it.lines.join(" | "));
        await page.waitForTimeout(150);
      }
      ok("across the river: a hundred and fifty dead at San Juan del Monte, the Kasama among them",
         cards.some((x) => /Isa sa kanila ang Kasama\./.test(x)), cards);
      c = await readLines(page, 9);
      ok("Bonifacio's plan of straw", c.lines.includes("Bonifacio: Dayami, Sakay. Dayami at sombrero."), c.lines);
      await settle(page);
      ok("the task counts the scarecrows", await stepIs(page, "Itayo ang mga panakot (0/3)"), await log(page));
      ok("the Kasama is gone from the camp", await page.evaluate(() => !NPCS.some((n) => n.id === "kasama")));
      for (const x of [1000, 1400, 1800]) await press(page, x - 60);
      const raised = await page.evaluate(() => ({ up: NPCS.filter((n) => /^panakot-/.test(n.id) && !n.hidden).length,
        straw: NPCS.filter((n) => /^dayami-/.test(n.id) && !n.hidden).length }));
      ok("each bundle becomes a scarecrow", raised.up === 3 && raised.straw === 0, raised);
      await page.evaluate(() => { window.__fought = new Set(); });
      ok("the Spanish shoot at straw, a fight, and the retreat to Balara",
         await playOn(page, "currentSceneId === 'balara' && inDialogue", 60000));
      ok("six fought at the river", await page.evaluate(() => window.__fought.size === 6));
      c = await readLines(page, 6);
      ok("at Balara, the news from Cavite", c.lines[0] === "Tagapagbalita: Supremo! Balita mula sa Cavite!", c.lines);
      await settle(page);
      ok("the task: talk to the Supremo", await stepIs(page, "Kausapin ang Supremo"));
      await walkTo(page, 520);
      await page.keyboard.press("e");
      c = await readLines(page, 14);
      ok("by the fire: he acted too, and everyone left someone",
         c.lines.includes("Bonifacio: Ako rin, alam mo ba? Umarte rin ako sa mga komedya noon.") &&
         c.lines.includes("Macario: Ang nanay ko po. Hindi ko alam kung buhay pa siya."), c.lines);
      ok("1897 on black, and Laguna", await playOn(page, "currentSceneId === 'laguna' && inDialogue", 40000));
      c = await readLines(page, 10);
      ok("Jacinto: the Supremo is dead", c.lines.includes("Jacinto: Nilitis siya ng mga taga-Cavite, at ipinapatay."), c.lines);
      await settle(page);
      ok("the task: talk to Jacinto", await stepIs(page, "Kausapin si Jacinto"));
      await walkTo(page, 700);
      await page.keyboard.press("e");
      c = await readLines(page, 5);
      ok("he stays", c.lines.includes("Macario: Hindi po ako aalis."), c.lines);
      // The end: the years on black, then his thoughts on the camp, seen.
      for (let t = 0; t < 400 && !(await line(page)); t++) await page.waitForTimeout(150);
      const endSeen = await page.evaluate(() => ({ black: blackout.classList.contains("visible"),
        line: dialogueText.textContent }));
      c = await readLines(page, 8);
      ok("after the years on black, his last thoughts are said on the camp, not behind black (the frozen end)",
         !endSeen.black && c.lines.includes("Macario (sa isip): At si Nanay... hindi ko pa rin alam kung nasaan siya."), { endSeen, lines: c.lines });
      ok("then Wakas ng Ikalawang Yugto, and every step of Act II is done",
         await playOn(page, "state.flags.a2_wakas === true", 20000) &&
         await page.evaluate(() => Acts.countDone(2) === ACT_2.objectives.length));
      const unseen = await page.evaluate(() => window.__unseen);
      ok("no line of Act II was ever said behind black", unseen.length === 0, unseen);
      await ctx.close();

      // A reload in the middle of the charge plays it again from the top.
      const a2 = await newPage(browser, {
        session: { user: { id: "u1" } },
        game_progress: [{ student_id: "u1", current_act: 2, current_room: "san-juan", currency: 0,
          save_state: { quests: [], flags: Object.assign({}, ACT2_CHARGE_FLAGS), posX: 1500 } }],
        act_progress: [
          { student_id: "u1", act_number: 1, status: "completed", objectives_done: 14 },
          { student_id: "u1", act_number: 2, status: "playing", objectives_done: 7 },
        ],
      });
      await a2.page.click("#shell-start");
      await a2.page.waitForTimeout(900);
      c = await readLines(a2.page, 2);
      ok("a reload mid-charge at San Juan del Monte plays the charge again",
         c.lines[0] === "Bonifacio: Ang polvorin. Doon nakatago ang pulbura at mga armas ng mga Kastila." &&
         await a2.page.evaluate(() => Acts.current === 2 && currentSceneId === "san-juan" && Math.round(posX) === 600), c.lines);
      await a2.ctx.close();
    }
  }

  if (part("act3", "Act III end to end")) {
    // ---------------------------------------------------------------
    // Block 117. Act III, end to end, as a guest from its first story
    // point (Block 118: revised against the proponent's labelled
    // sources; Macario is never at a [CONTEXT] event): the news of Santa
    // Mesa and a patrol in the hills, Tondo under guard (the letter,
    // Maryam's trunk, the sentries), the haircut on the American, the
    // creed, the proclamation and Isko, the petition and the Sedition
    // Law, three doors at night, the oath broken in on, Morong, the vow,
    // and the Constabulary. No line is ever said behind black.
    // ---------------------------------------------------------------
    console.log("\nAct III (Block 117)");
    const { ctx, page } = await newPage(browser, { session: null });
    const sceneIs = (id) => page.evaluate((s) => currentSceneId === s, id);
    await jumpTo(page, "3:simula");
    await watchBlack(page);
    ok("Act III opens in the hills outside Manila, not at Santa Mesa (Block 118)",
       await waitIntertitle(page, true, 5000) &&
       JSON.stringify((await intertitle(page)).lines) === '["Pebrero 5, 1899","Sa kabundukan, sa labas ng Maynila"]' &&
       await page.evaluate(() => currentSceneId === "burol"));
    await waitIntertitle(page, false, 15000);
    let c = await readLines(page, 10, 3000);
    await settle(page);
    ok("Santa Mesa reaches him as news from a runner; the twenty million remembered; the camp to watch",
       c.lines[0] === "Tagapagbalita: Pangulo! Balita mula sa Maynila!" &&
       c.lines.some((x) => /Santa Mesa/.test(x) && /^Tagapagbalita:/.test(x)) &&
       c.lines.includes("Macario: Kakampi na bumili sa atin ng dalawampung milyong dolyar.") &&
       await stepIs(page, "Bantayan ang kampo"), c.lines);
    await press(page, 2230);
    c = await readLines(page, 6, 3000);
    ok("at the lookout, an American patrol coming up the hill",
       c.lines.includes("Macario (sa isip): Mga Amerikano. Paakyat dito.") &&
       c.lines.includes("Macario: Hindi tayo tatakbo nang hindi lumalaban."), c.lines);
    ok("the battle in the hills", await playOn(page, "state.flags.a3_lumaban === true && currentSceneId === 'tondo'", 90000));
    const sm = await page.evaluate(() => ({ fought: [...window.__fought].filter((id) => id.startsWith("sm-")).length }));
    ok("fifteen Americans in four waves (Block 117)", sm.fought === 15, sm);

    // Tondo under American guard.
    c = await readLines(page, 2);
    await settle(page);
    ok("on arrival: Americans on every corner", c.lines[0] === "Macario (sa isip): Mga Amerikano sa bawat kanto.", c.lines);
    ok("Tondo, May 1899: the task is Isko's letter, and four American sentries walk the street",
       await stepIs(page, "Basahin ang sulat ni Isko") && (await on(page, "sentinela-araw-")) === 4 &&
       // Block 118: their picture is owed, so each is the placeholder box
       // naming it; no art borrowed.
       await page.evaluate(() => {
         const g = GUARDS.find((x) => x.id === "sentinela-araw-1");
         return Boolean(g && /amerikano\.png/.test(g.el.textContent) && !g.el.style.getPropertyValue("--body-tint"));
       }));
    await quiet(page);
    await walkTo(page, 12320);
    ok("Isko's button reads Basahin ang sulat", (await gift(page)) === "Basahin ang sulat");
    c = await readLines(page, 8);
    ok("Jacinto dead at Majayjay, of malaria, at twenty-three; \"Hanggang dulo\"",
       c.lines.includes("Macario (sa isip): \"Pumanaw si Ginoong Emilio Jacinto. Malarya ang kumuha sa kanya.\"") &&
       c.lines.includes("Macario: Hindi pa tapos, Isko. Hindi pa.") && await stepIs(page, "Humingi ng tulong kay Maryam"), c.lines);
    await press(page, 13180);
    c = await readLines(page, 14);
    await page.waitForTimeout(300);
    const dressed = await page.evaluate(() => ({ owns: Inventory.owns("balatkayo"), worn: Inventory.equipped("outfit") }));
    ok("Maryam knows now who the two men were, and dresses him from the trunk: the disguise worn",
       c.lines.includes("Maryam: Alam ko na ngayon kung sino 'yung dalawang lalaki noon.") &&
       c.lines.includes("Maryam: Artista ka, 'di ba?") && dressed.owns && dressed.worn === "balatkayo", { c: c.lines, dressed });
    await walkTo(page, 6330);
    await page.keyboard.press("e");
    c = await readLines(page, 6);
    ok("the Mananahi: Nanay waited at the door every day, and was gone", c.lines.includes(
      "Mananahi: Isang umaga, wala na siya. Bukas ang pinto. Walang nakakita."), c.lines);
    await press(page, 5300);
    ok("the barbershop's door", await waitForScene(page, "barberya"));
    c = await readLines(page, 14, 3000);
    ok("the Barbero hides him behind the scissors; an American in the chair; his own line remembered",
       c.lines.includes("Sundalong Amerikano: Hey, old man. I've been waiting.") &&
       c.lines.includes("Macario: Hindi kabayo ang mga suki n'yo, 'di po ba?") &&
       await stepIs(page, "Gupitan ang suki"), c.lines);
    await settle(page);
    await walkTo(page, 560);
    await page.keyboard.press("e");
    c = await readLines(page, 2, 800);
    for (let t = 0; t < 4000 && !(await cutState(page)).up; t += 100) await page.waitForTimeout(100);
    const cut0 = await cutState(page);
    const sandy = await page.evaluate(() => {
      const d = document.getElementById("cut-canvas").getContext("2d").getImageData(0, 0, 64, 56).data;
      const k = (4 * 64 + 32) * 4;
      const moustache = (31 * 64 + 32) * 4;
      return { hair: [d[k], d[k + 1], d[k + 2]], lip: [d[moustache], d[moustache + 1], d[moustache + 2]] };
    });
    ok("the haircut, once more, on the American: sandy hair, clean-shaven, in English",
       cut0.up && cut0.ask === "Sundalong Amerikano: Just a trim. Short on the sides." &&
       sandy.hair[0] > 120 && sandy.lip[0] > 150 && c.lines[1] === "Macario (sa isip): Maikli raw sa gilid.", { cut0, sandy, c: c.lines });
    await cutDrag(page, await extraRuns(page));
    const cut1 = await cutState(page);
    ok("a clean cut: \"Not bad, kid\"", cut1.over && cut1.ask === "Sundalong Amerikano: Not bad, kid. Not bad at all.", cut1);
    await page.click("#cut-stop");
    c = await readLines(page, 12, 3000);
    ok("\"Bandits, all of 'em\", given in Tagalog; he leaves; that night, the three",
       c.lines.includes("Macario (sa isip): Mga bandido raw kaming lahat.") &&
       c.lines.includes("Macario (sa isip): Tatlong mukhang kilala ko.") &&
       await page.evaluate(() => state.flags.a3_gabiSaBarberya === true &&
         NPCS.filter((n) => ["mangingisda", "tabakera", "karpintero"].includes(n.id) && !n.hidden).length === 3), c.lines);
    await settle(page);
    const taught = [];
    for (const x of [770, 920, 1070]) {
      await walkTo(page, x);
      const label = await gift(page);
      const read = await readLines(page, 6, 1200);
      taught.push({ label, lines: read.lines });
    }
    ok("each of the three is taught a precept of Bonifacio's creed (n/3)",
       taught.every((t) => t.label === "Ituro ang aral") &&
       taught[2].lines.some((x) => /Pag-asa/.test(x)), taught);
    ok("their oath, the years on the move, Aguinaldo taken, and a town in April 1901",
       await playOn(page, "currentSceneId === 'bayan'", 30000));
    // Block 118: each arrival's script is played out (pressed through)
    // before anything is used, however slow the machine (CI).
    await playOn(page, "state.flags.a3_saBayan === true && !cutscenePlaying", 20000);
    await settle(page);
    await press(page, 420);
    // Exactly the wall (4) and Isko (17): not on into the next scene.
    c = await readLines(page, 21, 6000);
    ok("the proclamation, and Isko goes home to a child he has never seen",
       c.lines.includes("Isko: May anak na po ako, Pangulo. Dalawang taon na. Hindi pa niya ako nakikilala.") &&
       c.lines.includes("Macario: Huwag kang mangako, Isko. Mabigat dalhin.") &&
       c.lines.includes("Opisyal: Raise your right hand."), c.lines);
    ok("Calle Gunao, Quiapo", await waitForScene(page, "calle-gunao", 20000));
    c = await readLines(page, 12, 6000);
    await playOn(page, "state.flags.a3_saGunao === true && !cutscenePlaying", 20000);
    await settle(page);
    ok("the founding: Álvarez and Poblete, and Macario its Secretary-General (Block 118)",
       c.lines.includes("Macario: Papel laban sa riple.") && c.lines.includes("Álvarez: Ikaw, Sakay.") &&
       c.lines.includes("Macario: Tinatanggap ko.") && await stepIs(page, "Papirmahin ang petisyon"), c.lines);
    for (const x of [420, 870, 1070]) { // just right of each signer
      await walkTo(page, x);
      await gift(page);
      await readLines(page, 5, 1200);
    }
    c = await readLines(page, 16, 4000);
    ok("three sign; the Sedition Law reaches him as a notice Poblete brings, its English then the Tagalog",
       c.lines[0] === "Poblete: Sakay. Heneral. Basahin ninyo ito. Nakapaskil na sa buong Maynila." &&
       c.lines.includes("Macario (sa isip): At krimen na rin ang pagsapi sa lihim na samahan.") &&
       !c.lines.some((x) => /^(Opisyal|Tagasalin):/.test(x)), c.lines);
    ok("January 1902: Tondo at night", await waitForScene(page, "tondo", 20000) &&
       await page.evaluate(() => document.getElementById("skyline").classList.contains("night-tint")));
    await readLines(page, 2);
    await playOn(page, "state.flags.a3_saGabi === true && !cutscenePlaying", 20000);
    await settle(page);
    ok("four patrols at night, and the task: three houses", (await on(page, "sentinela-gabi-")) === 4 &&
       await stepIs(page, "Ipaalam sa tatlong bahay"));
    await quiet(page);
    for (const x of [10900, 8300, 6700]) {
      await press(page, x);
      await readLines(page, 4, 1200);
    }
    ok("word to all three", await page.evaluate(() => state.flags.a3_naipaalam === true));
    await press(page, 5300);
    ok("back to the barbershop", await waitForScene(page, "barberya"));
    await readLines(page, 2);
    await playOn(page, "state.flags.a3_handaNa === true && !cutscenePlaying", 20000);
    await settle(page);
    await press(page, 560); // just left of the table
    c = await readLines(page, 30, 4000);
    const cutOff = c.lines.indexOf("Macario: Isinusumpa ba ninyong—");
    ok("the oath, and at its height the door broken in; someone informed",
       cutOff > 0 && c.lines[cutOff + 1] === "Sundalong Amerikano: Open up! U.S. Army!" &&
       c.lines.includes("Macario (sa isip): May nagturo."), c.lines);
    ok("prison, the amnesty, and the mountains of Morong", await waitForScene(page, "morong", 30000));
    c = await readLines(page, 5);
    await playOn(page, "state.flags.a3_saMorong === true && !cutscenePlaying", 20000);
    await settle(page);
    await press(page, 1190); // just right of Carreón
    c = await readLines(page, 20, 4000);
    ok("the Republika ng Katagalugan, Macario its President and Generalissimo (Block 118)",
       c.lines.includes("Macario: Republika ng Katagalugan.") &&
       c.lines.includes("Carreón: Kung gayon, ikaw ang Pangulo at Heneralisimo. Ako ang Ikalawang Pangulo."), c.lines);
    await settle(page);
    await walkTo(page, 1590); // just right of the flag
    await page.keyboard.press("e");
    c = await readLines(page, 20, 4000);
    ok("its own flag raised, then the vow not to cut their hair",
       c.lines.includes("Mga Kawal: Mabuhay ang Republika ng Katagalugan!") &&
       c.lines.includes("Macario: Hindi tayo magpapagupit hangga't hindi malaya ang bayan."), c.lines);
    const ownClothes = await page.evaluate(() => Inventory.equipped("outfit"));
    ok("the disguise off: his own clothes again", ownClothes === "damit-entablado", ownClothes);
    ok("the Brigandage Act and the Constabulary's attack, to the end",
       await playOn(page, "state.flags.a3_wakas === true", 90000) &&
       await page.evaluate(() => Acts.countDone(3) === ACT_3.objectives.length));
    const mr = await page.evaluate(() => [...window.__fought].filter((id) => id.startsWith("mr-")).length);
    ok("fifteen of the Constabulary in four waves", mr === 15, mr);
    const unseen = await page.evaluate(() => window.__unseen);
    ok("no line of Act III was ever said behind black", unseen.length === 0, unseen);
    await ctx.close();
  }

  if (part("jumps", "every story point of ?dev=1, and its floor")) {
    // ---------------------------------------------------------------
    // Block 108. The story points a tester can start from (?dev=1).
    // ---------------------------------------------------------------
    console.log("\nStarting from a point in the story (?dev=1)");
    const plain = await newPage(browser, { session: null });
    ok("without ?dev=1 the title screen offers no story points",
       await plain.page.evaluate(() => document.getElementById("shell-dev").classList.contains("hidden")));
    await plain.ctx.close();
    const jumps = await (async () => {
      const p = await newPage(browser, { session: null });
      // Polish list #2: every act's points, so Act II's are checked the day
      // it declares them. The option's value is "act:id".
      const list = await p.page.evaluate(() => [1, 2, 3, 4].flatMap((n) =>
        ((window["ACT_" + n] || {}).devJumps || []).map((j) => ({ n, id: j.id, scene: j.scene, task: j.task }))));
      await p.ctx.close();
      return list;
    })();
    ok("Act I offers its story points (" + jumps.filter((j) => j.n === 1).length + ")",
       jumps.filter((j) => j.n === 1).length >= 8, jumps);
    for (const j of jumps) {
      const p = await newPage(browser, { session: null });
      await p.page.goto("http://localhost:" + PORT + "/index.html?dev=1");
      await p.page.waitForTimeout(400);
      await p.page.selectOption("#shell-dev-jump", j.n + ":" + j.id);
      await p.page.click("#shell-dev-go");
      for (let i = 0; i < 80 && (await p.page.evaluate(() => Shell.state)) !== "playing"; i++) await p.page.waitForTimeout(100);
      await p.page.waitForTimeout(600);
      const at = await p.page.evaluate(() => ({
        scene: currentSceneId,
        act: Acts.current,
        guest: Game.isGuest(),
        log: document.getElementById("quest-list").textContent,
        written: __DB.game_progress.length,
        // Block 114: the floor the scene names, drawn, or the dirt.
        floorWanted: (currentScene.ground && currentScene.ground.floor) || "",
        floor: document.getElementById("ground-tiles").dataset.floor || "",
        floorDrawn: /^url\("data:image\/svg/.test(document.getElementById("ground-tiles").style.getPropertyValue("--ground-src")),
      }));
      ok("starting at " + j.id + " opens " + j.scene + " with \"" + j.task + "\" in hand, writing nothing",
         at.scene === j.scene && at.act === j.n && at.guest && at.log.includes(j.task) && at.written === 0, at);
      ok("  and its ground is " + (at.floorWanted || "the dirt") + " (Block 114)",
         at.floor === at.floorWanted && at.floorDrawn === Boolean(at.floorWanted), at);
      await p.ctx.close();
    }
  }

  await browser.close();
  server.close();

  if (LIST) process.exit(0);
  if (ONLY && !pass && !fail) {
    console.log("\nno part matched --only=" + [...ONLY].join(",") + "; --list names them");
    process.exit(1);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
