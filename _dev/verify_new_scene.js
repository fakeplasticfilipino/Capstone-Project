// One-off verification script for the extended kutsero scene: Kabayo,
// Kutsero (+10 barya), the road hazard, Tindero's Tindahan (Mansanas,
// 5 barya), and giving the apple back to Kabayo to end the memory —
// without ending Act I, since the memory is a flashback within the
// act, not the act's own ending (a fourth objective, pumunta_entablado,
// is what actually keeps Act I open — see content/act1.js's header).
// Not part of the shipped suite; drives the REAL content/act1.js (no
// fixture routes) the same way _dev/test.js Section A does.
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
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
     nanayOpening[0] === "Nanay: Macario anak, yung pera mo." &&
     nanayOpening[1] === "Macario: Salamat Nay." &&
     nanayOpening[4] === "Nanay: Naaalala mo ba nung nagtrabaho ka sakaniya?" &&
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

  // --- Kutsero's art (Block 27): a real animated sheet, not a placeholder. ---
  await page.waitForTimeout(300);
  const kutseroArt = await page.evaluate(() => {
    const el = document.querySelector("#npc-kutsero .sprite");
    return { bg: el.style.backgroundImage, text: el.textContent, height: el.style.height };
  });
  ok("Kutsero draws his sprite sheet, not the placeholder box",
     kutseroArt.bg.includes("Kutsero.png") && kutseroArt.text === "", kutseroArt);
  // Block 33: the Tindero and the ground have real art too.
  const moreArt = await page.evaluate(() => {
    const t = document.querySelector("#npc-tindero .sprite");
    const g = document.getElementById("ground-tiles");
    return { tindero: t.style.backgroundImage, tText: t.textContent,
             ground: getComputedStyle(g).backgroundImage, gText: g.textContent };
  });
  ok("Tindero draws Tindero.png, not the placeholder box",
     moreArt.tindero.includes("Tindero.png") && moreArt.tText === "", moreArt);
  ok("the ground is Lupa.jpg, not the missing-file placeholder",
     moreArt.ground.includes("Lupa.jpg") && moreArt.gText === "", moreArt);

  // --- Kabayo's art and sound (Block 30). ---
  const kabayoArt = await page.evaluate(() => {
    const el = document.querySelector("#npc-kabayo .sprite");
    return { bg: el.style.backgroundImage, text: el.textContent, rendering: el.style.imageRendering,
             height: el.style.height };
  });
  ok("Kabayo draws Horse.png, not the placeholder box",
     kabayoArt.bg.includes("Horse.png") && kabayoArt.text === "", kabayoArt);
  ok("his 32px sheet is scaled up pixelated rather than smoothed",
     kabayoArt.rendering === "pixelated", kabayoArt);
  const nearKabayo = await page.evaluate(() => {
    const e = nearSoundEls.get("Assets/Act 1/Horse.mp3");
    return { playing: !!e && !e.el.paused, music: !!musicEl && !musicEl.paused && /Calm\.mp3/.test(musicEl.src) };
  });
  ok("Horse.mp3 is playing while Macario stands at Kabayo", nearKabayo.playing, nearKabayo);
  ok("over Calm.mp3", nearKabayo.music, nearKabayo);

  // --- Kutsero: +10 barya, and the exact script. ---
  const balanceBefore = await page.evaluate(() => Game.currency());
  await walkTo(page, 730); // Kutsero sits at x=750
  await page.waitForTimeout(900); // the fade-out
  ok("walking on to Kutsero leaves Kabayo's sound behind",
     await page.evaluate(() => !nearSoundEls.has("Assets/Act 1/Horse.mp3")));
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
     kutseroLines[0].text === "Kutsero, pahingi akong barya, bili lang akong mansanas", kutseroLines[0]);
  ok("Kutsero points him to Tindero", kutseroLines[1].speaker === "Kutsero" &&
     kutseroLines[1].text === "O eto Macario, yung malaking mansanas dun sa Tindero sa may dulo.", kutseroLines[1]);
  const balanceAfter = await page.evaluate(() => Game.currency());
  ok("Kutsero pays 10 barya", balanceAfter === balanceBefore + 10, { balanceBefore, balanceAfter });

  // Talking to Kutsero again must not pay out a second time. 1 line, 2
  // presses to fully close the box (left open by a bare 1-press talk(0),
  // which then ate the very first 'e' meant for whatever came next).
  await talk(page, 1);
  await page.waitForTimeout(120);
  const balanceAfterRevisit = await page.evaluate(() => Game.currency());
  ok("a repeat visit to Kutsero does not pay again", balanceAfterRevisit === balanceAfter, balanceAfterRevisit);

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
     returnScene.open && returnScene.first === "Macario: Naaalala mo pa pala yon ma?", returnScene);
  ok("with Macario standing beside his mother, facing her",
     returnScene.gap < INTERACT_DISTANCE_FOR_TEST && returnScene.facing === 1, returnScene);
  const returnLines = [returnScene.first];
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
    returnLines.push(await page.evaluate(() => dialogueSpeaker.textContent + ": " + dialogueText.textContent));
  }
  ok("all eight lines play in order, ending on the errand to the tailor",
     returnLines.length === 8 && returnLines[5] === "Nanay: Okay sige, mag ingat ka ha!" &&
     returnLines[6] === "Nanay: Wag mo kalimutang dumaan sa mananahi para sa kadamitan mo" &&
     returnLines[7] === "Macario: Opo nay", returnLines);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);
  ok("and it closes", await page.evaluate(() => !inDialogue && state.flags.nakabalikMulaSaAlaala === true));
  const tailorQuest = await page.evaluate(() => quests.find((q) => q.id === "kausapin_mananahi"));
  ok("closing it logs the quest to talk to the tailor", tailorQuest && tailorQuest.done === false, tailorQuest);
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
  ok("Act I now has five objectives, three of them done", afterGift.objTotal === 5 && afterGift.objDone === 3, afterGift);
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
             placeholder: el && el.textContent.includes("Mananahi.png") };
  });
  ok("the road is longer and the Mananahi is on it", mana.exists && mana.shown && mana.width === 2900, mana);
  ok("drawn as the placeholder naming Mananahi.png until the art exists", mana.placeholder, mana);
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
     manaLines[0] === "Mana: Oh, kamusta ka na Macario? Ang laki laki mo na" &&
     manaLines[4] === "Macario: Andiyan na ba yung damit ko para sa entablado?" &&
     manaLines[5] === "Mana: Oo, pero bayad muna hehe...", manaLines);
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
  ok("and its objective, four of five done", afterMana.done === 4, afterMana);
  ok("it ends straight into her shop", !afterMana.open && afterMana.shop === "shop", afterMana);
  ok("which sells the stage clothes and nothing else", afterMana.shelf.length === 1 && afterMana.shelf[0] === "damit-entablado", afterMana.shelf);

  const detail = await page.evaluate(() => document.getElementById("shell-shop-detail").textContent);
  ok("priced at 100 barya, with its effect in the description",
     detail.includes("100") && detail.includes("mabagal ka lang mapapansin ng mga gwardya"), detail);
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
  ok("and wearing it halves detection while standing still", worn.mult === 0.5, worn);
  ok("with no outfit art, Macario keeps his own sprites", /Macario_Idle/.test(worn.sheet), worn);
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
  const outside = await page.evaluate(() => {
    const d = document.querySelector("#dec-entablado-labas .sprite");
    return { bg: d && d.style.backgroundImage, text: d && d.textContent, height: d && d.style.height, width: WORLD_WIDTH };
  });
  ok("the road is 2900px and the entablado stands at its end, drawn from Entablado_Labas.png",
     outside.width === 2900 && /Entablado_Labas\.png/.test(outside.bg) && outside.text === "" && outside.height === "400px", outside);
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
  ok("with Entablado.png as its backdrop and no dirt strip",
     /Entablado\.png/.test(stage.src) && !/Labas/.test(stage.src) && stage.ground === "none", stage);
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
     loveScene.open && loveScene.line === "Maryam: Oh Macario, bagamat iniibig kita, hindi tayo pwede magsama." &&
     loveScene.posX === 440 && loveScene.facing === -1, loveScene);
  ok("she is drawn from Muslim_Girl.png", /Muslim_Girl\.png/.test(loveScene.maryam || ""), loveScene);
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
    facing, placeholder: document.querySelector("#dec-muslim .sprite").textContent.includes("Muslim.png"),
  }));
  ok("the man walks on and Macario turns to look",
     walkOn.cutscene && walkOn.shown && walkOn.facing === 1, walkOn);
  ok("drawn as the placeholder naming Muslim.png, which has no art yet", walkOn.placeholder, walkOn);
  await page.waitForTimeout(3200); // his walk on, then the confrontation opens
  const confront = await page.evaluate(() => ({ open: inDialogue,
    line: dialogueSpeaker.textContent + ": " + dialogueText.textContent,
    left: document.getElementById("dec-muslim").style.left }));
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
    music: musicEl && musicEl.src, placeholder: document.querySelector("#enemy-guwardiya-1 .sprite").textContent,
  }));
  ok("five guards come in and the fight starts", fight.enemies === 5 && fight.alive === 5 && !fight.cutscene, fight);
  ok("the hearts show for it", fight.hearts, fight);
  ok("Intense.mp3 plays while it lasts", /Intense\.mp3/.test(fight.music || ""), fight);
  ok("each guard is the placeholder naming Guwardiya.png",
     fight.placeholder.includes("Guwardiya.png"), fight.placeholder);

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
  ok("the music goes back to Calm", /Calm\.mp3/.test(afterFight.music || ""), afterFight);
  ok("and the hearts go away", afterFight.hearts, afterFight);
  ok("the fight does not finish Act I either",
     afterFight.status === "playing" && afterFight.entablado !== true, afterFight);

  const stagePic = await page.evaluate(() => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth);
    img.onerror = () => resolve(0);
    img.src = assetUrl("Assets/Act 1/Entablado.png");
  }));
  ok("and that picture actually loads", stagePic === 1672, stagePic);
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

  await ctx.close();
  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
