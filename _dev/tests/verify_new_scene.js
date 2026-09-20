// Block 42 rebuilt the street's end (ten citizens, eight guards, 11000px)
// and follows the guide from Nanay to the last pamphlet: at every step the
// arrow names the place the story sends Macario next.
// Block 37 extended this past the entablado to the end of Act I: the
// play ending, the Katipunan meeting, the lansangan street (shooting
// guards, platform cover, no gun, the stage clothes against a real
// guard) and the third pamphlet running the post-test.
// One-off verification script for the extended kutsero scene: Kabayo,
// Kutsero (+10 barya), the road hazard, Tindero's Tindahan (Mansanas,
// 5 barya), and giving the apple back to Kabayo to end the memory —
// without ending Act I, since the memory is a flashback within the
// act, not the act's own ending (a fourth objective, pumunta_entablado,
// is what actually keeps Act I open — see content/act1.js's header).
// Not part of the shipped suite; drives the REAL content/act1.js (no
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
  const TRUNK = 40; // half the trunk plus a margin, either side of a join
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
    srcs, noneMirrored: tiles.every((t) => !t.classList.contains("skyline-tile-mirrored")),
    // Block 46: the picture stands on the floor, whole, with sky above it.
    onFloor: tiles.every((t) => getComputedStyle(t).bottom === GROUND_LEVEL + "px" &&
      /^100%( auto)?$/.test(getComputedStyle(t).backgroundSize)),
    sky: tiles.length ? getComputedStyle(tiles[0]).backgroundColor : null,
  };
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 823, height: 412 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => { fail++; console.log("  FAIL  pageerror: " + e.message); });
  page.on("console", (m) => { if (m.type() === "error") console.log("  console.error: " + m.text()); });

  await page.route("**/supabaseClient.js*", (route) =>
    route.fulfill({ body: STUB, contentType: "text/javascript" }));
  await page.route("**/cdn.jsdelivr.net/**", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }));

  await page.addInitScript((s) => { window.__TEST = s; }, { session: null });
  await page.goto("http://localhost:" + PORT + "/index.html");
  await page.waitForTimeout(300);

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

  // --- Nanay, then the fade into kutsero (covered fully in Block 19's
  // own verification; just enough here to land in the memory). ---
  const p0 = await panels(page);
  ok("tondo is Tondo.png, as two panels, neither mirrored (Block 46)",
     p0.tiles === p0.expectedTiles && p0.tiles === 2 && p0.tondoTiles === 0 && p0.loaded &&
     p0.srcs.length === 1 && /tondo\.png$/.test(p0.srcs[0]) && p0.noneMirrored, p0);
  ok("each picture stands whole on the floor, with its own sky colour above",
     p0.onFloor && p0.sky === "rgb(114, 168, 208)", p0);
  ok("a shadow tree stands over the join", p0.joins.length === 1 &&
     JSON.stringify(p0.treesAt) === JSON.stringify(p0.joins), p0);
  ok("in front of Macario, and behind the guide's arrow",
     p0.treeZ > p0.playerZ && p0.markerZ > p0.treeZ, p0);
  ok("and nobody he has to reach stands behind it", p0.blocked.length === 0, p0.blocked);
  const g0 = await guide(page);
  ok("the guide stands over Nanay from the first frame", g0.label === "Nanay" && g0.marker && g0.text === "Nanay", g0);
  ok("the Mananahi is not on the road before the memory",
     await page.evaluate(() => document.getElementById("npc-mananahi").style.display === "none"));
  await walkTo(page, 280);
  await page.keyboard.press("e");
  await page.waitForTimeout(120);
  const nanayOpening = [];
  const barya0 = await page.evaluate(() => Game.currency());
  for (let i = 0; i < 6; i++) {
    nanayOpening.push(await page.evaluate(() => dialogueSpeaker.textContent + ": " + dialogueText.textContent));
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
  }
  ok("Nanay's opening plays as scripted in Block 32",
     nanayOpening[0] === "Nanay: Macario, anak, 'yung pera mo." &&
     nanayOpening[1] === "Macario: Salamat, Nay." &&
     nanayOpening[4] === "Nanay: Naaalala mo ba nung nagtrabaho ka sa kaniya?" &&
     nanayOpening[5] === "Macario: Nay, huli na 'ho ak-", nanayOpening);
  const barya1 = await page.evaluate(() => Game.currency());
  // 200 from Nanay. The act's own drip for the two objectives this
  // conversation completes (10 each) rides the next save, so it may or
  // may not have landed yet at this instant.
  ok("she hands him 200 barya", barya1 - barya0 === 200 || barya1 - barya0 === 220, { barya0, barya1 });

  // During the fade nothing is open yet; the memory's first line waits
  // for the fade-in to finish.
  await page.waitForTimeout(1500);
  ok("no dialogue opens while the screen is still fading",
     await page.evaluate(() => !inDialogue && cutscenePlaying));
  await page.waitForTimeout(900);
  const inKutsero = await page.evaluate(() => ({ room: currentRoom, grey: document.getElementById("skyline").classList.contains("grey-filter") }));
  ok("landed in the kutsero scene, greyed out", inKutsero.room === "kutsero" && inKutsero.grey, inKutsero);
  const pK = await panels(page);
  ok("the memory is the same Tondo, one tree, greyed with it",
     pK.tiles === 2 && pK.treesAt.length === 1 && pK.loaded && pK.grey === "grayscale(1)" &&
     pK.noneMirrored && pK.onFloor && /tondo\.png$/.test(pK.srcs[0]) && pK.blocked.length === 0, pK);
  ok("the ground is greyed with it (Block 33)",
     await page.evaluate(() => getComputedStyle(document.getElementById("ground-tiles")).filter === "grayscale(1)"));
  const memoryLine = await page.evaluate(() => ({ open: inDialogue, speaker: dialogueSpeaker.textContent, text: dialogueText.textContent }));
  ok("the memory opens with Nanay's voice after the fade-in",
     memoryLine.open && memoryLine.speaker === "Nanay" && memoryLine.text === "Ilang taon ka nga noon?...", memoryLine);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);
  ok("E closes it and play goes on", await page.evaluate(() => !inDialogue && state.flags.nagsimulaAngAlaala === true));

  // --- Kabayo: unchanged from Block 19, still adds the quest. ---
  await walkTo(page, 280); // Kabayo sits at x=300
  await talk(page, 2); // 2 lines, 3 presses to fully close the box
  const questsAfterKabayo = await page.evaluate(() => quests.map((q) => q.id));
  ok("the apple quest is logged after meeting Kabayo", questsAfterKabayo.includes("bilhan_mansanas"), questsAfterKabayo);
  const gK = await guide(page);
  ok("and the guide moves on to the Kutsero", gK.label === "Kutsero", gK);

  // --- Kutsero's art (Block 27): a real animated sheet, not a placeholder. ---
  await page.waitForTimeout(300);
  const kutseroArt = await page.evaluate(() => {
    const el = document.querySelector("#npc-kutsero .sprite");
    return { bg: el.style.backgroundImage, text: el.textContent, height: el.style.height };
  });
  ok("Kutsero draws his sprite sheet, not the placeholder box",
     kutseroArt.bg.includes("kutsero.png") && kutseroArt.text === "", kutseroArt);
  // Block 33: the Tindero and the ground have real art too.
  const moreArt = await page.evaluate(() => {
    const t = document.querySelector("#npc-tindero .sprite");
    const g = document.getElementById("ground-tiles");
    return { tindero: t.style.backgroundImage, tText: t.textContent,
             ground: getComputedStyle(g).backgroundImage, gText: g.textContent };
  });
  ok("Tindero draws tindero.png, not the placeholder box",
     moreArt.tindero.includes("tindero.png") && moreArt.tText === "", moreArt);
  ok("the ground is ground-lupa.jpg, not the missing-file placeholder",
     moreArt.ground.includes("ground-lupa.jpg") && moreArt.gText === "", moreArt);

  // --- Kabayo's art and sound (Block 30). ---
  const kabayoArt = await page.evaluate(() => {
    const el = document.querySelector("#npc-kabayo .sprite");
    return { bg: el.style.backgroundImage, text: el.textContent, rendering: el.style.imageRendering,
             height: el.style.height };
  });
  ok("Kabayo draws kabayo.png, not the placeholder box",
     kabayoArt.bg.includes("kabayo.png") && kabayoArt.text === "", kabayoArt);
  ok("his 32px sheet is scaled up pixelated rather than smoothed",
     kabayoArt.rendering === "pixelated", kabayoArt);
  const nearKabayo = await page.evaluate(() => {
    const e = nearSoundEls.get("assets/audio/sfx/horse.mp3");
    return { playing: !!e && !e.el.paused, music: !!musicEl && !musicEl.paused && /calm\.mp3/.test(musicEl.src) };
  });
  ok("horse.mp3 is playing while Macario stands at Kabayo", nearKabayo.playing, nearKabayo);
  ok("over calm.mp3", nearKabayo.music, nearKabayo);

  // --- Kutsero: +10 barya, and the exact script. ---
  const balanceBefore = await page.evaluate(() => Game.currency());
  await walkTo(page, 730); // Kutsero sits at x=750
  await page.waitForTimeout(900); // the fade-out
  ok("walking on to Kutsero leaves Kabayo's sound behind",
     await page.evaluate(() => !nearSoundEls.has("assets/audio/sfx/horse.mp3")));
  await page.keyboard.press("e");
  await page.waitForTimeout(120);
  const kutseroLines = [];
  for (let i = 0; i < 2; i++) {
    kutseroLines.push(await page.evaluate(() => ({ speaker: dialogueSpeaker.textContent, text: dialogueText.textContent })));
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
  }
  console.log("  kutsero lines: " + JSON.stringify(kutseroLines));
  ok("Macario asks for barya", kutseroLines[0].speaker === "Macario" &&
     kutseroLines[0].text === "Kutsero, pahingi po ng barya. Ibibili ko lang ng mansanas si Kabayo.", kutseroLines[0]);
  ok("Kutsero points him to Tindero", kutseroLines[1].speaker === "Kutsero" &&
     kutseroLines[1].text === "O, heto, Macario. 'Yung malaking mansanas, doon sa Tindero sa dulo ng daan.", kutseroLines[1]);
  const balanceAfter = await page.evaluate(() => Game.currency());
  ok("Kutsero pays 10 barya", balanceAfter === balanceBefore + 10, { balanceBefore, balanceAfter });
  const gT = await guide(page);
  ok("then the guide points on to the Tindero, off screen to the right, with the distance",
     gT.label === "Tindero" && gT.edge === "right" && /^Tindero \d+m$/.test(gT.text), gT);

  // Talking to Kutsero again must not pay out a second time. 1 line, 2
  // presses to fully close the box (left open by a bare 1-press talk(0),
  // which then ate the very first 'e' meant for whatever came next).
  await talk(page, 1);
  await page.waitForTimeout(120);
  const balanceAfterRevisit = await page.evaluate(() => Game.currency());
  ok("a repeat visit to Kutsero does not pay again", balanceAfterRevisit === balanceAfter, balanceAfterRevisit);
  // Block 42. Nor does rebuilding the scene, which is what a reload into
  // the memory does: the barya is paid once per save, not once per visit.
  await page.evaluate(() => { loadScene("kutsero"); posX = 730; });
  await page.waitForTimeout(150);
  await talk(page, 1);
  await page.waitForTimeout(120);
  ok("nor does a reload into the memory", (await page.evaluate(() => Game.currency())) === balanceAfter,
     await page.evaluate(() => Game.currency()));

  // --- The hazard between Kutsero and Tindero. ---
  const hazardInfo = await page.evaluate(() => ({
    dangerous: !document.getElementById("hud").classList.contains("hidden"),
    hazard: HAZARDS[0],
  }));
  ok("the scene is dangerous (a hazard is declared) and hearts show", hazardInfo.dangerous, hazardInfo);
  const hpBefore = await page.evaluate(() => health);
  await page.evaluate((h) => {
    invulnUntil = 0;
    posX = h.x + h.width / 2;
    posY = floorHeightAt(posX);
    velY = 0;
  }, hazardInfo.hazard);
  await page.waitForTimeout(300);
  const hpAfter = await page.evaluate(() => health);
  ok("standing in the hazard costs a heart", hpAfter === hpBefore - 1, { hpBefore, hpAfter });

  // --- Tindero, at the edge of the widened map: opens Tindahan directly. ---
  await walkTo(page, 1930); // Tindero sits at x=1950
  await page.keyboard.press("e");
  await page.waitForTimeout(200);
  ok("Tindero opens the shop directly, no dialogue", await visible(page, "#shell-shop"));
  ok("and no dialogue box was opened along the way", !(await visible(page, "#dialogue-box")));

  // Block 25: two apples on the shelf. The plain Mansanas is food; the
  // one the quest needs is its own quest item, and only on the shelf
  // because bilhan_mansanas is open.
  const shelf = await page.evaluate(() =>
    [...document.querySelectorAll("#shell-shop-list .inv-tile")].map((t) => ({
      id: t.dataset.shopId, text: t.textContent })));
  console.log("  shelf: " + JSON.stringify(shelf));
  ok("Mansanas is on the shelf at 5 barya",
     shelf.some((t) => t.id === "mansanas" && t.text.includes("5")), shelf);
  ok("so is Mansanas para sa kabayo, at 5 barya",
     shelf.some((t) => t.id === "mansanas-kabayo" && t.text.includes("para sa kabayo") && t.text.includes("5")), shelf);

  await page.click('#shell-shop-list [data-shop-id="mansanas-kabayo"]');
  await page.waitForTimeout(120);
  ok("its detail marks it as a quest item",
     (await page.textContent("#shell-shop-detail")).includes("Pang-misyon"));
  await page.click("#shell-shop-action");
  await page.waitForTimeout(200);
  const afterBuy = await page.evaluate(() => ({
    owns: Inventory.owns("mansanas-kabayo"),
    ownsFood: Inventory.owns("mansanas"),
    flag: state.flags.binilhAngMansanas,
    balance: Game.currency(),
  }));
  ok("Mansanas para sa kabayo is now owned", afterBuy.owns, afterBuy);
  ok("buying it did not also buy the plain Mansanas", !afterBuy.ownsFood, afterBuy);
  ok("buyFlag set binilhAngMansanas", afterBuy.flag === true, afterBuy);
  ok("5 barya were spent", afterBuy.balance === balanceAfter - 5, afterBuy);

  // And the plain one, with what is left, to prove it can be eaten
  // without touching the quest item.
  await page.click('#shell-shop-list [data-shop-id="mansanas"]');
  await page.waitForTimeout(120);
  await page.click("#shell-shop-action");
  await page.waitForTimeout(200);
  ok("the plain Mansanas can be bought too",
     await page.evaluate(() => Inventory.count("mansanas") === 1));

  await page.click("#shell-shop-back");
  await page.waitForTimeout(150);
  ok("closing the shop resumes play", (await page.evaluate(() => Shell.state)) === "playing");
  const gB = await guide(page);
  ok("with the apple bought, the guide points back to Kabayo, to the left", gB.label === "Kabayo" && gB.edge === "left", gB);

  // --- Eat the plain apple from the inventory, hurt from the hazard. ---
  await page.evaluate(() => { health = Math.max(1, maxHealth - 1); renderHearts(); });
  await page.click("#btn-inventory");
  await page.waitForTimeout(150);
  await page.click('#shell-items [data-item-id="mansanas"]');
  await page.waitForTimeout(100);
  await page.click("#shell-inv-action");
  await page.waitForTimeout(150);
  const ate = await page.evaluate(() => ({ health, max: maxHealth,
    food: Inventory.count("mansanas"), quest: Inventory.owns("mansanas-kabayo") }));
  ok("eating Mansanas heals a heart", ate.health === ate.max, ate);
  ok("and leaves the horse's apple alone", ate.food === 0 && ate.quest === true, ate);
  ok("the quest item offers nothing to do from the inventory",
     await page.evaluate(() => {
       document.querySelector('#shell-items [data-item-id="mansanas-kabayo"]').click();
       return !document.getElementById("shell-inv-action");
     }));
  await page.click("#shell-inventory-back");
  await page.waitForTimeout(150);

  // --- Back to Kabayo: the gift button, then the memory ends. ---
  await walkTo(page, 280);
  await page.waitForTimeout(150);
  const giftBtnState = await page.evaluate(() => ({
    hidden: document.getElementById("gift-btn") ? document.getElementById("gift-btn").classList.contains("hidden") : null,
    label: document.getElementById("gift-btn") ? document.getElementById("gift-btn").textContent : null,
  }));
  ok("the gift button appears near Kabayo, no longer hidden", giftBtnState.hidden === false, giftBtnState);

  await page.click("#gift-btn");
  await page.waitForTimeout(120);
  const giftLines = [];
  for (let i = 0; i < 2; i++) {
    giftLines.push(await page.evaluate(() => dialogueText.textContent));
    await page.keyboard.press("e");
    await page.waitForTimeout(150);
  }
  console.log("  gift lines: " + JSON.stringify(giftLines));

  await page.waitForTimeout(2400); // the fade back to tondo
  // Block 31. Back in the present, beside Nanay, and she answers.
  const returnScene = await page.evaluate(() => ({
    open: inDialogue, first: dialogueSpeaker.textContent + ": " + dialogueText.textContent,
    posX, facing, gap: edgeGap(posX, PLAYER_WIDTH, 300, NPC_WIDTH),
  }));
  ok("the return opens a conversation by itself",
     returnScene.open && returnScene.first === "Macario: Naaalala mo pa pala 'yon, Nay?", returnScene);
  ok("with Macario standing beside his mother, facing her",
     returnScene.gap < INTERACT_DISTANCE_FOR_TEST && returnScene.facing === 1, returnScene);
  const returnLines = [returnScene.first];
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    returnLines.push(await page.evaluate(() => dialogueSpeaker.textContent + ": " + dialogueText.textContent));
  }
  ok("all eight lines play in order, ending on the errand to the tailor",
     returnLines.length === 8 && returnLines[5] === "Nanay: O sige, mag-ingat ka ha!" &&
     returnLines[6] === "Nanay: 'Wag mong kalimutang dumaan sa mananahi para sa damit mo." &&
     returnLines[7] === "Macario: Opo, Nay.", returnLines);
  ok("the guide stays hidden while anyone is talking", !(await guide(page)).marker && !(await guide(page)).edge);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);
  ok("and it closes", await page.evaluate(() => !inDialogue && state.flags.nakabalikMulaSaAlaala === true));
  const tailorQuest = await page.evaluate(() => quests.find((q) => q.id === "kausapin_mananahi"));
  ok("closing it logs the quest to talk to the tailor", tailorQuest && tailorQuest.done === false, tailorQuest);
  const gM = await guide(page);
  ok("and the guide points down the road to her", gM.label === "Mananahi" && gM.edge === "right", gM);
  const afterGift = await page.evaluate(() => ({
    room: currentRoom,
    grey: document.getElementById("skyline").classList.contains("grey-filter"),
    flag: state.flags.binilhanNgMansanasAngKabayo,
    questDone: quests.find((q) => q.id === "bilhan_mansanas"),
    entabladoQuest: quests.find((q) => q.id === "pumunta_entablado"),
    entabladoFlag: state.flags.nasaEntablado,
    objTotal: Acts.objectivesFor(1).length,
    objDone: Acts.countDone(1),
    ownsMansanas: Inventory.owns("mansanas-kabayo"),
    maxHealth: maxHealth,
  }));
  ok("the memory ends back in tondo", afterGift.room === "tondo", afterGift);
  ok("no longer greyed out", afterGift.grey === false, afterGift);
  ok("and neither is the ground",
     await page.evaluate(() => getComputedStyle(document.getElementById("ground-tiles")).filter === "none"));
  ok("the third objective's flag is set", afterGift.flag === true, afterGift);
  ok("the apple quest is marked done in the log", afterGift.questDone && afterGift.questDone.done === true, afterGift.questDone);
  ok("a new, open quest to reach the entablado is logged", afterGift.entabladoQuest && afterGift.entabladoQuest.done === false, afterGift.entabladoQuest);
  ok("its objective's flag is not set — nothing completes it yet", afterGift.entabladoFlag !== true, afterGift.entabladoFlag);
  ok("Act I now has seven objectives, three of them done", afterGift.objTotal === 7 && afterGift.objDone === 3, afterGift);
  ok("Mansanas is consumed, not kept, once it is actually given away", afterGift.ownsMansanas === false, afterGift);
  ok("and max health is still its base three, since no apple ever raised it", afterGift.maxHealth === 3, afterGift);

  // The flashback resolving must NOT end Act I — it is a memory within
  // the act, not the act's own ending. Confirmed two ways: status stays
  // "playing" (finishAct/posttest never runs) and the transition screen
  // never appears, given a beat past the fade to be sure nothing async
  // sneaks it in late.
  await page.waitForTimeout(2000);
  const afterFlashback = await page.evaluate(() => ({
    status: Acts.status,
    transitionVisible: !document.getElementById("act-screen").classList.contains("hidden"),
  }));
  console.log("  after the flashback resolves: " + JSON.stringify(afterFlashback));
  ok("Act I is still playing — the flashback ending did not finish the act", afterFlashback.status === "playing", afterFlashback);
  ok("no transition screen appeared", afterFlashback.transitionVisible === false, afterFlashback);

  // --- Block 31: Nanay does not replay her errand, and the Mananahi. ---
  await walkTo(page, 210);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);
  const nanayAgain = await page.evaluate(() => ({ text: dialogueText.textContent, room: currentRoom }));
  ok("talking to Nanay again skips the errand she already gave",
     nanayAgain.text === "Mag-ingat ka lagi, anak.", nanayAgain);
  await talk(page, 1);
  await page.waitForTimeout(300);
  ok("and does not send him back into the memory",
     await page.evaluate(() => currentRoom === "tondo" && !cutscenePlaying));

  const mana = await page.evaluate(() => {
    const el = document.getElementById("npc-mananahi");
    return { exists: !!el, shown: el && el.style.display !== "none", width: WORLD_WIDTH,
             art: el && el.querySelector(".sprite").style.backgroundImage,
             text: el && el.textContent };
  });
  ok("the road is longer and the Mananahi is on it", mana.exists && mana.shown && mana.width === 2900, mana);
  ok("drawn from her stand-in still, mananahi.png, not a box (Block 41)",
     /mananahi\.png/.test(mana.art || "") && mana.text === "", mana);
  await walkTo(page, 1420);
  await page.keyboard.press("e");
  await page.waitForTimeout(120);
  const manaLines = [];
  for (let i = 0; i < 6; i++) {
    manaLines.push(await page.evaluate(() => dialogueSpeaker.textContent + ": " + dialogueText.textContent));
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
  }
  ok("her conversation plays as written",
     manaLines[0] === "Mananahi: O, kumusta ka na, Macario? Ang laki-laki mo na!" &&
     manaLines[4] === "Macario: Nandiyan na ba 'yung damit ko para sa entablado?" &&
     manaLines[5] === "Mananahi: Oo, pero bayad muna, hehe...", manaLines);
  await page.waitForTimeout(200);

  // --- Block 32: the tailor quest, her shop, and the first equipment. ---
  const afterMana = await page.evaluate(() => ({
    open: inDialogue, shop: Shell.state,
    quest: quests.find((q) => q.id === "kausapin_mananahi"),
    done: Acts.countDone(1),
    shelf: [...document.querySelectorAll("#shell-shop-list [data-shop-id]")].map((t) => t.dataset.shopId),
    balance: Game.currency(),
  }));
  ok("the conversation completes the tailor quest", afterMana.quest && afterMana.quest.done === true, afterMana.quest);
  ok("and its objective, four of seven done", afterMana.done === 4, afterMana);
  ok("it ends straight into her shop", !afterMana.open && afterMana.shop === "shop", afterMana);
  ok("which sells the stage clothes and nothing else", afterMana.shelf.length === 1 && afterMana.shelf[0] === "damit-entablado", afterMana.shelf);

  const detail = await page.evaluate(() => document.getElementById("shell-shop-detail").textContent);
  ok("priced at 100 barya, with its effect in the description",
     detail.includes("100") && detail.includes("5× na mas mabagal kang mapapansin ng mga bantay"), detail);
  await page.click("#shell-shop-action");
  await page.waitForTimeout(250);
  const bought = await page.evaluate(() => ({ owns: Inventory.owns("damit-entablado"), balance: Game.currency() }));
  ok("buying it takes 100 barya", bought.owns && bought.balance === afterMana.balance - 100, { afterMana: afterMana.balance, bought });
  await page.click("#shell-shop-back");
  await page.waitForTimeout(150);

  await page.click("#btn-inventory");
  await page.waitForTimeout(150);
  await page.click('#shell-items [data-item-id="damit-entablado"]');
  await page.waitForTimeout(100);
  await page.click("#shell-inv-action");
  await page.waitForTimeout(250);
  const worn = await page.evaluate(() => ({
    worn: Inventory.isWorn("damit-entablado"), slot: Inventory.equipped("outfit"),
    mult: equipEffects.stillDetectionMult, sheet: SPRITE_SHEETS.idle.src,
  }));
  ok("it is worn in the Damit slot", worn.worn && worn.slot === "damit-entablado", worn);
  ok("and wearing it makes detection five times slower while standing still", worn.mult === 0.2, worn);
  ok("with no outfit art, Macario keeps his own sprites", /macario-idle/.test(worn.sheet), worn);
  await page.click("#shell-inventory-back");
  await page.waitForTimeout(150);

  await page.keyboard.press("e");
  await page.waitForTimeout(200);
  ok("E at the Mananahi now opens her shop directly",
     await page.evaluate(() => Shell.state === "shop" && !inDialogue));
  await page.click("#shell-shop-back");
  await page.waitForTimeout(150);
  await page.click("#btn-shop");
  await page.waitForTimeout(200);
  const corner = await page.evaluate(() => [...document.querySelectorAll("#shell-shop-list [data-shop-id]")].map((t) => t.dataset.shopId));
  ok("the corner shop button does not sell her clothes", !corner.includes("damit-entablado"), corner);
  await page.click("#shell-shop-back");
  await page.waitForTimeout(150);

  // --- Block 34: the entablado, outside and in. ---
  const gE = await guide(page);
  ok("with the tailor done, the guide sends him on to the Entablado", gE.label === "Entablado", gE);
  const outside = await page.evaluate(() => {
    const d = document.querySelector("#dec-entablado-labas .sprite");
    return { bg: d && d.style.backgroundImage, text: d && d.textContent, height: d && d.style.height, width: WORLD_WIDTH };
  });
  ok("the road is 2900px and the entablado stands at its end, drawn from entablado-outside.png",
     outside.width === 2900 && /entablado-outside\.png/.test(outside.bg) && outside.text === "" && outside.height === "400px", outside);
  await walkTo(page, 2360);
  await page.waitForTimeout(120);
  ok("at its stairs the prompt reads Pasok",
     (await page.evaluate(() => document.querySelector("#btn-interact .lbl").textContent)) === "Pasok");
  await page.keyboard.press("e");
  await page.waitForTimeout(2600);
  const stage = await page.evaluate(() => ({
    room: currentRoom,
    src: document.getElementById("skyline").style.getPropertyValue("--skyline-src"),
    ground: getComputedStyle(document.getElementById("ground-tiles")).display,
    status: Acts.status, entabladoFlag: state.flags.nasaEntablado,
  }));
  ok("going in fades to the entablado scene", stage.room === "entablado", stage);
  ok("with entablado-inside.png as its backdrop and no dirt strip",
     /entablado-inside\.png/.test(stage.src) && !/outside/.test(stage.src) && stage.ground === "none", stage);
  ok("which does not finish Act I", stage.status === "playing" && stage.entabladoFlag !== true, stage);
  // Block 35: the moro-moro plays as soon as the fade-in ends.
  const loveScene = await page.evaluate(() => ({
    open: inDialogue, line: dialogueSpeaker.textContent + ": " + dialogueText.textContent,
    posX, facing,
    maryam: (document.querySelector("#dec-maryam .sprite") || {}).style &&
      document.querySelector("#dec-maryam .sprite").style.backgroundImage,
    muslimHidden: document.getElementById("dec-muslim").style.display === "none",
  }));
  ok("Maryam opens the scene herself, with Macario placed beside her",
     loveScene.open && loveScene.line === "Maryam: O Macario, bagama't iniibig kita, hindi tayo puwedeng magsama." &&
     loveScene.posX === 440 && loveScene.facing === -1, loveScene);
  ok("she is drawn from maryam.png", /maryam\.png/.test(loveScene.maryam || ""), loveScene);
  ok("and the man is still off stage", loveScene.muslimHidden, loveScene);

  const loveLines = [loveScene.line];
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    loveLines.push(await page.evaluate(() => dialogueSpeaker.textContent + ": " + dialogueText.textContent));
  }
  ok("all six lines play, ending on Ano iyon?",
     loveLines.length === 6 && loveLines[5] === "Maryam: Ano iyon?", loveLines);
  await page.keyboard.press("e");
  await page.waitForTimeout(400);

  // He walks on from the right wing while the world is held still.
  const walkOn = await page.evaluate(() => ({
    cutscene: cutscenePlaying, shown: document.getElementById("dec-muslim").style.display !== "none",
    facing, art: document.querySelector("#dec-muslim .sprite").style.backgroundImage,
    text: document.querySelector("#dec-muslim .sprite").textContent,
    flip: document.querySelector("#dec-muslim .sprite").style.transform,
    moving: currentScene.decorations.find((d) => d.id === "muslim").moving,
  }));
  ok("the man walks on and Macario turns to look",
     walkOn.cutscene && walkOn.shown && walkOn.facing === 1, walkOn);
  ok("he is drawn from the real walk sheet, muslim-walk.png (Block 40)",
     /muslim-walk\.png/.test(walkOn.art) && walkOn.text === "", walkOn);
  ok("walking, and facing the way he walks, toward Macario", walkOn.moving && walkOn.flip === "scaleX(-1)", walkOn);
  const stepping = await page.evaluate(() => new Promise((resolve) => {
    const el = document.querySelector("#dec-muslim .sprite");
    const seen = new Set();
    const t = setInterval(() => seen.add(el.style.backgroundPosition), 30);
    setTimeout(() => { clearInterval(t); resolve(seen.size); }, 600);
  }));
  ok("his walk cycle steps while he walks", stepping >= 3, stepping);
  await page.waitForTimeout(2600); // his walk on, then the confrontation opens
  const confront = await page.evaluate(() => ({ open: inDialogue,
    line: dialogueSpeaker.textContent + ": " + dialogueText.textContent,
    left: document.getElementById("dec-muslim").style.left }));
  const standing = await page.evaluate(() => new Promise((resolve) => {
    const el = document.querySelector("#dec-muslim .sprite");
    const seen = new Set();
    const t = setInterval(() => seen.add(el.style.backgroundPosition), 30);
    setTimeout(() => { clearInterval(t); resolve({ frames: seen.size,
      moving: currentScene.decorations.find((d) => d.id === "muslim").moving }); }, 500);
  }));
  ok("and stands still, not walking on the spot, while he talks",
     standing.frames === 1 && !standing.moving, standing);
  ok("he arrives and speaks", confront.open &&
     confront.line === "Muslim: Anong ginagawa mo dito, Maryam? Bakit kasama mo ang Kafir na ito?!" &&
     confront.left === "800px", confront);
  const confrontLines = [confront.line];
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    confrontLines.push(await page.evaluate(() => dialogueSpeaker.textContent + ": " + dialogueText.textContent));
  }
  ok("Maryam answers him and he calls the guards",
     confrontLines[1].startsWith("Maryam: Hindi ikaw ang tunay") &&
     confrontLines[2].startsWith("Muslim: Mga guwardiya"), confrontLines);
  await page.keyboard.press("e");
  await page.waitForTimeout(600);

  const fight = await page.evaluate(() => ({
    enemies: ENEMIES.length, alive: ENEMIES.filter((e) => !e.dead).length,
    cutscene: cutscenePlaying, hearts: !document.getElementById("hud").classList.contains("hidden"),
    music: musicEl && musicEl.src,
    walk: document.querySelector("#enemy-guwardiya-1 .sprite").style.backgroundImage,
    attack: (document.querySelector("#enemy-guwardiya-1 .enemy-attack-sprite") || { style: {} }).style.backgroundImage,
  }));
  ok("five guards come in and the fight starts", fight.enemies === 5 && fight.alive === 5 && !fight.cutscene, fight);
  ok("the hearts show for it", fight.hearts, fight);
  ok("intense.mp3 plays while it lasts", /intense\.mp3/.test(fight.music || ""), fight);
  ok("each guard shares the man's walk and attack sheets (Block 40)",
     /muslim-walk\.png/.test(fight.walk || "") && /muslim-attack\.png/.test(fight.attack || ""), fight);

  // A swing: the attack sprite replaces the walk from the telegraph on,
  // and hands back afterwards.
  const swing = await page.evaluate(async () => {
    invulnUntil = performance.now() + 60000;
    const e = ENEMIES[0];
    const start = performance.now();
    while (!e.attacking && performance.now() - start < 6000) await new Promise((r) => setTimeout(r, 16));
    const atk = e.attackSpriteEl;
    const during = { attacking: e.attacking, shown: atk.style.display !== "none",
      walkHidden: e.spriteEl.style.visibility === "hidden",
      flip: atk.style.transform };
    while (e.attacking && performance.now() - start < 9000) await new Promise((r) => setTimeout(r, 16));
    const after = { shown: atk.style.display !== "none", walkHidden: e.spriteEl.style.visibility === "hidden" };
    invulnUntil = 0;
    return { during, after };
  });
  ok("a guard's swing plays the attack sheet in place of his walk, facing Macario",
     swing.during.attacking && swing.during.shown && swing.during.walkHidden &&
     swing.during.flip === "scaleX(-1)", swing);
  ok("and goes back to the walk sheet after the blow", !swing.after.shown && !swing.after.walkHidden, swing);

  await walkTo(page, 40);
  await page.waitForTimeout(150);
  ok("the way out is closed while they are up",
     (await page.evaluate(() => document.querySelector("#btn-interact .lbl").textContent)) !== "Lumabas");

  // Beaten here rather than fought, since what is being checked is what
  // winning does, not whether a headless browser can punch five guards.
  await page.evaluate(() => ENEMIES.forEach((e) => hitEnemy(e, 99)));
  await page.waitForTimeout(500);
  const afterFight = await page.evaluate(() => ({
    flag: state.flags.nagapiAngMgaGuwardiya, music: musicEl && musicEl.src,
    hearts: document.getElementById("hud").classList.contains("hidden"),
    status: Acts.status, entablado: state.flags.nasaEntablado,
  }));
  ok("winning sets its flag", afterFight.flag === true, afterFight);
  ok("the music goes back to Calm", /calm\.mp3/.test(afterFight.music || ""), afterFight);
  ok("and the hearts go away", afterFight.hearts, afterFight);
  ok("the fight does not finish Act I either",
     afterFight.status === "playing" && afterFight.entablado !== true, afterFight);

  // Block 37. Maryam's announcement follows the fight, then the audience.
  const endingLines = [];
  for (let i = 0; i < 6; i++) {
    endingLines.push(await page.evaluate(() => inDialogue && dialogueSpeaker.textContent + ": " + dialogueText.textContent));
    await page.keyboard.press("e");
    await page.waitForTimeout(140);
  }
  ok("Maryam announces the Christian kingdom won",
     endingLines[0] === "Maryam: Mga manonood! Nagwagi ang kaharian ng mga Kristiyano!", endingLines);
  ok("that she will convert and marry Macario",
     /magpapabinyag/.test(endingLines[1] || "") && /pakakasal kay Macario/.test(endingLines[2] || ""), endingLines);
  ok("and the audience cheers, in dialogue only",
     endingLines[4] === "Mga Manonood: Mabuhay! Mabuhay ang magkasintahan!" &&
     endingLines[5] === "Mga Manonood: (Hiyawan at palakpakan)", endingLines);
  const afterPlay = await page.evaluate(() => ({ open: inDialogue, flag: state.flags.nasaEntablado,
    quest: quests.find((q) => q.id === "pumunta_entablado"), done: Acts.countDone(1), status: Acts.status }));
  ok("the end of the play completes Pumunta sa entablado, five of seven",
     !afterPlay.open && afterPlay.flag === true && afterPlay.quest.done && afterPlay.done === 5 &&
     afterPlay.status === "playing", afterPlay);

  // The URL the backdrop tile actually computes to, not the one the
  // content names: Block 44 moved the stylesheet into css/, and a url()
  // in a custom property resolves against the stylesheet that reads it,
  // so the right name can still point at the wrong folder.
  const stagePic = await page.evaluate(() => new Promise((resolve) => {
    const tile = document.querySelector("#skyline .skyline-tile");
    const url = (getComputedStyle(tile).backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1];
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, url });
    img.onerror = () => resolve({ w: 0, url });
    img.src = url;
  }));
  ok("and the picture the backdrop draws actually loads", stagePic.w === 1672, stagePic);
  const gL = await guide(page);
  ok("after the play, the guide shows the way out", gL.label === "Labas", gL);
  await walkTo(page, 40);
  await page.waitForTimeout(120);
  ok("at the left edge the prompt reads Lumabas",
     (await page.evaluate(() => document.querySelector("#btn-interact .lbl").textContent)) === "Lumabas");
  await page.keyboard.press("e");
  await page.waitForTimeout(2600);
  const out = await page.evaluate(() => ({ room: currentRoom, posX, facing,
    src: document.getElementById("skyline").style.getPropertyValue("--skyline-src") }));
  ok("leaving lands back outside at the stairs, facing the road",
     out.room === "tondo" && out.posX === 2180 && out.facing === -1 && out.src === "", out);

  // --- Block 37. The Katipunan at the stairs. ---
  const meet = await page.evaluate(() => ({
    open: inDialogue, line: dialogueSpeaker.textContent + ": " + dialogueText.textContent,
    bonifacio: document.getElementById("npc-bonifacio").style.display !== "none",
    katipunero: document.getElementById("npc-katipunero").style.display !== "none",
    bArt: document.querySelector("#npc-bonifacio .sprite").style.backgroundImage,
    kArt: document.querySelector("#npc-katipunero .sprite").style.backgroundImage,
  }));
  ok("Bonifacio and a Katipunero are waiting outside", meet.bonifacio && meet.katipunero, meet);
  ok("both drawn from their stand-in stills (Block 41)",
     /bonifacio\.png/.test(meet.bArt || "") && /katipunero\.png/.test(meet.kArt || ""), meet);
  ok("the meeting opens by itself with Bonifacio's greeting",
     meet.open && meet.line === "Bonifacio: Macario! Mahusay ang pagganap mo kanina.", meet);
  ok("the road out is closed before the task is given",
     await page.evaluate(() => { const saved = posX; posX = 2800; const n = findNearby(); posX = saved; return n.type !== "exit"; }));
  const meetLines = [meet.line];
  for (let i = 0; i < 11; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    meetLines.push(await page.evaluate(() => inDialogue && dialogueSpeaker.textContent + ": " + dialogueText.textContent));
  }
  ok("they exchange the password", meetLines.includes("Macario: Sa liwanag. Anak ng Bayan."), meetLines);
  ok("and he is told to leave the gun and trust the stage clothes",
     meetLines.some((l) => /Iwan mo ang baril/.test(l || "")) &&
     meetLines.some((l) => /damit pang-entablado/.test(l || "")), meetLines);
  await page.keyboard.press("e");
  await page.waitForTimeout(200);
  const task = await page.evaluate(() => ({ open: inDialogue, flag: state.flags.nakausapAngKatipunan,
    quest: quests.find((q) => q.id === "ipamahagi_polyeto"), done: Acts.countDone(1) }));
  ok("closing it gives the pamphlet task, 0 of 10", !task.open && task.flag === true &&
     task.quest && task.quest.text === "Ipamahagi ang mga polyeto (0/10)" && !task.quest.done, task);
  ok("and completes the meeting objective, six of seven", task.done === 6, task);
  const gS = await guide(page);
  ok("and the guide points to the road out, the Lansangan", gS.label === "Lansangan" && gS.edge === "right", gS);
  await talk(page, 1);
  await walkTo(page, 1830);
  await talk(page, 2);
  ok("Bonifacio repeats the direction afterwards rather than the meeting",
     await page.evaluate(() => !inDialogue && NPCS.find((n) => n.id === "bonifacio").stage === 1));

  await walkTo(page, 2720);
  await page.waitForTimeout(100);
  ok("at the end of the road the prompt reads Tumuloy",
     (await page.evaluate(() => document.querySelector("#btn-interact .lbl").textContent)) === "Tumuloy");
  await page.keyboard.press("e");
  await page.waitForTimeout(2600);

  // --- The street. ---
  const street = await page.evaluate(() => ({
    room: currentRoom, width: WORLD_WIDTH, guards: GUARDS.length, shooters: GUARDS.filter((g) => g.shoots).length,
    platforms: PLATFORMS.length, heights: PLATFORMS.map((p) => p.y - GROUND_LEVEL),
    citizens: NPCS.length, grey: document.getElementById("skyline").classList.contains("grey-filter"),
    src: document.getElementById("skyline").style.getPropertyValue("--skyline-src"),
    hearts: !document.getElementById("hud").classList.contains("hidden"),
    open: inDialogue, line: dialogueSpeaker.textContent + ": " + dialogueText.textContent,
    guardArt: document.querySelector("#guard-bantay-1 .sprite").style.backgroundImage,
    citizenArt: document.querySelector("#npc-mangingisda .sprite").style.backgroundImage,
  }));
  const pS = await panels(page);
  ok("the street is eight Tondo panels, a tree over each of its seven joins",
     pS.tiles === 8 && pS.noneMirrored && pS.onFloor && pS.srcs.length === 1 && pS.loaded &&
     pS.treesAt.length === 7 && JSON.stringify(pS.treesAt) === JSON.stringify(pS.joins) && pS.grey === "none", pS);
  ok("no citizen, doorway or checkpoint stands behind a tree", pS.blocked.length === 0, pS.blocked);
  ok("Tumuloy fades to the street, in colour",
     street.room === "lansangan" && street.src === "" && !street.grey, street);
  ok("the road is long: 11000px", street.width === 11000, street);
  ok("eight guards, all of whom shoot, drawn from the bantay.png still, and citizens from mamamayan.png",
     street.guards === 8 && street.shooters === 8 && /bantay\.png/.test(street.guardArt || "") &&
     /mamamayan\.png/.test(street.citizenArt || ""), street);
  ok("seven platforms of at least five heights, all above a guard's sight",
     street.platforms === 7 && new Set(street.heights).size >= 5 && street.heights.every((h) => h >= 60), street.heights);
  ok("ten citizens and the hearts showing", street.citizens === 10 && street.hearts, street);
  ok("Macario says how many he is looking for on the way in",
     street.open && /Sampung kapatid/.test(street.line), street.line);

  // Block 42. The street is laid out so nobody waiting for a pamphlet, and
  // no checkpoint, stands where a guard can see at the start of his beat
  // or the end of it, and every platform stands over the cones.
  const layout = await page.evaluate(() => {
    const clash = [];
    const sightOf = (g, pos, dir) => {
      const c = pos + GUARD_WIDTH / 2;
      const r = g.detectRadius || 240;
      return dir > 0 ? [c, c + r] : [c - r, c];
    };
    const ends = (g) => (g.patrolTo - g.patrolFrom >= 1)
      ? [[g.patrolFrom, -1], [g.patrolTo, 1]] : [[g.x, g.facing || 1]];
    NPCS.forEach((n) => {
      const c = n.x + NPC_WIDTH / 2;
      GUARDS.forEach((g) => ends(g).forEach(([pos, dir]) => {
        const [a, b] = sightOf(g, pos, dir);
        if (c >= a && c <= b) clash.push(n.id + " in " + g.id);
      }));
    });
    currentScene.checkpoints.forEach((cp) => {
      const c = cp.x + PLAYER_WIDTH / 2;
      GUARDS.forEach((g) => {
        if (c >= g.patrolFrom - 20 && c <= g.patrolTo + GUARD_WIDTH + 20) clash.push("checkpoint " + cp.x + " on " + g.id + "'s beat");
        ends(g).forEach(([pos, dir]) => {
          const [a, b] = sightOf(g, pos, dir);
          if (c >= a && c <= b) clash.push("checkpoint " + cp.x + " in " + g.id);
        });
      });
    });
    return clash;
  });
  ok("no citizen or checkpoint stands in a guard's sight at either end of his beat", layout.length === 0, layout);
  const cone = await page.evaluate(() => {
    const g = GUARDS[0];
    const el = g.el.querySelector(".guard-sight");
    const r = el.getBoundingClientRect();
    const body = g.el.getBoundingClientRect();
    const scale = el.offsetHeight / r.height; // world px per screen px
    // His drawn head, from the sprite inside his body: the cone should
    // leave from its lower half, where his eyes are, not from his waist.
    const art = g.el.querySelector(".sprite").getBoundingClientRect();
    const top = (body.bottom - r.top) * scale;
    const drawn = art.height * scale;
    const m = getComputedStyle(el).clipPath.match(/polygon\(([^)]+)\)/);
    const ys = m ? m[1].split(",").map((p) => parseFloat(p.trim().split(/\s+/)[1]) || 0) : [];
    const eye = top - ((ys[0] + ys[3]) / 200) * el.offsetHeight;
    return { top, drawn, eye, eyeShare: eye / drawn, ys, clip: getComputedStyle(el).clipPath };
  });
  ok("each guard's cone leaves from his eyes (Block 46)",
     /^polygon/.test(cone.clip) && cone.eyeShare > 0.8 && cone.eyeShare < 0.95, cone);
  ok("and looks straight ahead rather than down at the road (Block 47)",
     Math.abs((cone.ys[1] + cone.ys[2]) / 2 - 50) < 0.5 && Math.abs((cone.ys[0] + cone.ys[3]) / 2 - 50) < 0.5, cone);
  const gC = await guide(page);
  ok("the guide points at the first citizen, the Mangingisda", gC.label === "Mangingisda", gC);
  await page.keyboard.press("e");
  await page.waitForTimeout(120);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);

  // No gun: a long hold punches and throws nothing.
  await page.evaluate(() => { posX = 300; });
  await page.keyboard.down("j");
  await page.waitForTimeout(550);
  const aiming = await page.evaluate(() => shooting);
  await page.keyboard.up("j");
  await page.waitForTimeout(60);
  const noGun = await page.evaluate(() => ({ projectile: Boolean(projectile), shooting,
    toast: document.getElementById("toast").textContent }));
  ok("the gun is disabled here: no aim pose and no shot on a hold",
     aiming !== "aim" && !noGun.projectile && noGun.shooting === "melee" && noGun.toast === "Hindi puwedeng bumaril dito.", { aiming, noGun });

  // Block 38. In the stage clothes, standing still in a guard's sight: the
  // meter crawls, and is blue while the clothes are what is holding it.
  const disguise = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    g.pos = 1000; g.facing = -1; g.alert = 0; g.nextShotAt = 0;
    g.patrolFrom = g.patrolTo = 1000; // hold him still for the measurement
    posX = 900; posY = GROUND_LEVEL; velY = 0;
    health = maxHealth; renderHearts(); invulnUntil = 0;
    await new Promise((r) => setTimeout(r, 3000));
    return { alert: g.alert, hostile: g.hostile, blue: g.el.classList.contains("guard-disguised"),
             fill: getComputedStyle(g.fillEl).backgroundColor,
             toast: document.getElementById("toast").textContent };
  });
  ok("in the stage clothes, three seconds in plain sight standing still barely fills his meter",
     !disguise.hostile && disguise.alert > 0.1 && disguise.alert < 0.6, disguise);
  ok("the meter is blue while the clothes hold him, and the first time says why",
     disguise.blue && disguise.fill === "rgb(127, 200, 248)" && /Artista lang/.test(disguise.toast), disguise);

  // Without them, the same spot: he turns hostile, then shoots, and the
  // bullet costs a heart without sending Macario back to the start.
  const shot = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    const worn = equipEffects.stillDetectionMult;
    setEffects({ stillDetectionMult: 1 });
    g.alert = 0; invulnUntil = 0; health = maxHealth; renderHearts();
    const detections0 = Game.stats().detections;
    const start = performance.now();
    let turnedAt = null;
    await new Promise((r) => { const t = setInterval(() => {
      if (g.hostile && turnedAt === null) turnedAt = performance.now() - start;
      if (GUARD_BULLETS.length || performance.now() - start > 5000) { clearInterval(t); r(); } }, 16); });
    const firedAt = performance.now() - start;
    const marked = g.el.classList.contains("guard-hostile");
    const bulletShown = document.querySelectorAll(".guard-bullet").length;
    await new Promise((r) => setTimeout(r, 600));
    setEffects({ stillDetectionMult: worn });
    return { turnedAt, firedAt, marked, bulletShown, health, max: maxHealth, posX,
             detections: Game.stats().detections - detections0 };
  });
  ok("without the clothes his meter fills in under two seconds and he turns hostile, marked !",
     shot.turnedAt > 900 && shot.turnedAt < 2000 && shot.marked, shot);
  ok("then fires a visible bullet", shot.bulletShown === 1 && shot.firedAt > shot.turnedAt, shot);
  ok("the bullet takes one heart and knocks him back, not to the start",
     shot.health === shot.max - 1 && shot.posX < 900 && shot.posX > 600, shot);
  ok("being seen counts once", shot.detections === 1, shot);

  // Hostile means hostile: he comes after Macario and keeps shooting.
  const hunt = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    GUARD_BULLETS.forEach((b) => b.el.remove()); GUARD_BULLETS.length = 0;
    health = maxHealth; renderHearts(); invulnUntil = 0;
    const from = g.pos;
    posX = 250; posY = GROUND_LEVEL; velY = 0; // well out of the sight he had
    let shots = 0;
    const t0 = performance.now();
    await new Promise((r) => { const t = setInterval(() => {
      shots = Math.max(shots, document.querySelectorAll(".guard-bullet").length);
      if (performance.now() - t0 > 3500) { clearInterval(t); r(); } }, 16); });
    return { from, pos: g.pos, hostile: g.hostile, facing: g.facing, shots };
  });
  ok("a hostile guard chases Macario out of the sight he started with",
     hunt.hostile && hunt.facing === -1 && hunt.pos < hunt.from - 300, hunt);
  ok("and keeps shooting at him rather than going back to looking", hunt.shots >= 1, hunt);

  // Two punches put a hostile guard down.
  const fought = await page.evaluate(() => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    GUARD_BULLETS.forEach((b) => b.el.remove()); GUARD_BULLETS.length = 0;
    posX = g.pos - 60; facing = 1; posY = GROUND_LEVEL; invulnUntil = 0; health = maxHealth;
    meleeAttack();
    posX = g.pos - 60; facing = 1;
    meleeAttack();
    return { disabled: g.disabled, health };
  });
  ok("two punches put a hostile guard down", fought.disabled && fought.health === 3, fought);
  await page.evaluate(() => { respawnInScene(); });
  ok("a guard put down stays down through a respawn",
     await page.evaluate(() => { const g = GUARDS.find((x) => x.id === "bantay-1"); return g.disabled; }));
  await page.evaluate(() => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    g.disabled = false; g.drawnDown = false; g.el.classList.remove("guard-down");
    g.hostile = false; g.alert = 0; g.hp = 2;
  });

  // Standing on a platform is out of sight.
  const onPlat = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    g.alert = 0; g.pos = 1000; g.facing = -1; g.hostile = false;
    GUARD_BULLETS.forEach((b) => b.el.remove()); GUARD_BULLETS.length = 0;
    posX = 1050; posY = 200; velY = 0; // over the low platform, falling onto it
    await new Promise((r) => setTimeout(r, 1500));
    return { alert: g.alert, onGround, height: posY - GROUND_LEVEL, bullets: GUARD_BULLETS.length };
  });
  ok("standing on a platform over a guard, he does not see Macario",
     onPlat.onGround && onPlat.height === 75 && onPlat.alert === 0 && onPlat.bullets === 0, onPlat);

  // The stage clothes (Block 32, 0.2 since Block 38) slow the fill while standing still, here
  // in shipped content, against a real guard.
  const fillRate = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-1");
    const measure = async () => {
      g.alert = 0; g.pos = 1000; g.facing = -1; g.nextShotAt = performance.now() + 60000;
      posX = 850; posY = GROUND_LEVEL; velY = 0;
      await new Promise((r) => setTimeout(r, 50));
      g.alert = 0;
      await new Promise((r) => setTimeout(r, 500));
      return g.alert;
    };
    const worn = equipEffects.stillDetectionMult;
    const withClothes = await measure();
    setEffects({ stillDetectionMult: 1 });
    const without = await measure();
    setEffects({ stillDetectionMult: worn });
    g.nextShotAt = 0;
    return { worn, withClothes, without, ratio: withClothes / without };
  });
  ok("wearing the stage clothes, a guard's meter fills at a fifth of the speed while Macario stands still",
     fillRate.worn === 0.2 && fillRate.ratio > 0.1 && fillRate.ratio < 0.3, fillRate);

  // Guard 2's stretch is built for the clothes: freeze as he walks toward
  // Macario and he passes before the meter fills.
  const freeze = await page.evaluate(async () => {
    const g = GUARDS.find((x) => x.id === "bantay-2");
    GUARD_BULLETS.forEach((b) => b.el.remove()); GUARD_BULLETS.length = 0;
    health = maxHealth; renderHearts(); invulnUntil = 0;
    g.pos = 3150; g.facing = -1; g.alert = 0; g.nextShotAt = 0;
    posX = 2890; posY = GROUND_LEVEL; velY = 0; // just past his sight
    const start = health;
    await new Promise((r) => setTimeout(r, 4200));
    return { start, health, peak: g.alert, passed: g.pos + 20 < posX + 20 };
  });
  ok("freezing in the stage clothes lets guard 2 walk past without a shot",
     freeze.health === freeze.start && freeze.passed, freeze);

  // The ten pamphlets, in order along the road. Guards are switched off
  // for this part; the stealth itself is checked above.
  const give = async (x) => {
    await page.evaluate(() => { GUARD_BULLETS.forEach((b) => b.el.remove()); GUARD_BULLETS.length = 0; GUARDS.forEach((g) => { g.disabled = true; }); });
    await walkTo(page, x);
    await page.waitForTimeout(80);
    const button = await visible(page, "#gift-btn");
    const label = await page.evaluate(() => document.querySelector("#gift-btn .lbl") ? document.querySelector("#gift-btn .lbl").textContent : document.getElementById("gift-btn").textContent);
    await page.click("#gift-btn");
    await page.waitForTimeout(120);
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    await page.keyboard.press("e");
    await page.waitForTimeout(250);
    return { button, label, quest: await page.evaluate(() => quests.find((q) => q.id === "ipamahagi_polyeto")),
             next: (await guide(page)).label };
  };
  const people = await page.evaluate(() => NPCS.map((n) => ({ id: n.id, x: n.x, label: n.label })));
  const given = [];
  for (let i = 0; i < people.length; i++) {
    const g = await give(people[i].x - 80);
    given.push(g);
    if (i === 0) {
      ok("at the Mangingisda, Iabot ang polyeto", g.button && g.label === "Iabot ang polyeto", g);
      ok("and the count goes to 1/10", g.quest.text === "Ipamahagi ang mga polyeto (1/10)", g.quest);
      ok("and the guide moves on to the Labandera", g.next === "Labandera", g.next);
    }
    if (i === 1) {
      await page.evaluate(() => { health = 1; });
      await page.evaluate(() => { invulnUntil = 0; damagePlayer("test", false); });
      await page.waitForTimeout(100);
      ok("running out of hearts after the Labandera restarts there, not at the road's start",
         await page.evaluate(() => currentRoom === "lansangan" && posX === 1900 && health === maxHealth));
    }
    if (i === 8) ok("and Act I is still playing with one left", await page.evaluate(() => Acts.status === "playing"));
  }
  ok("every citizen takes one, and the count climbs one at a time to 10/10",
     given.every((g, i) => g.button && g.quest.text === "Ipamahagi ang mga polyeto (" + (i + 1) + "/10)"),
     given.map((g) => g.quest.text));
  ok("after each, the guide names the next one down the road",
     given.slice(0, -1).every((g, i) => g.next === people[i + 1].label), given.map((g) => g.next));
  ok("the Karpintero's is the last, and completes the task", given[9].quest.done === true, given[9].quest);
  await page.waitForTimeout(1500);
  const end = await page.evaluate(() => ({ flag: state.flags.naipamahagiAngPolyeto, done: Acts.countDone(1),
    status: Acts.status, quiz: !document.getElementById("quiz").classList.contains("hidden") }));
  ok("the tenth pamphlet finishes Act I: seven of seven, and the post-test opens",
     end.flag === true && end.done === 7 && end.status === "posttest" && end.quiz, end);

  await ctx.close();
  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
