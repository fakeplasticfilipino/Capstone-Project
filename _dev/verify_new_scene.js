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
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png" };

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
  await walkTo(page, 280);
  await talk(page, 4); // 5 lines total
  await page.waitForTimeout(2200); // the fade (900+400+900ms)
  const inKutsero = await page.evaluate(() => ({ room: currentRoom, grey: document.getElementById("skyline").classList.contains("grey-filter") }));
  ok("landed in the kutsero scene, greyed out", inKutsero.room === "kutsero" && inKutsero.grey, inKutsero);

  // --- Kabayo: unchanged from Block 19, still adds the quest. ---
  await walkTo(page, 280); // Kabayo sits at x=300
  await talk(page, 2); // 2 lines, 3 presses to fully close the box
  const questsAfterKabayo = await page.evaluate(() => quests.map((q) => q.id));
  ok("the apple quest is logged after meeting Kabayo", questsAfterKabayo.includes("bilhan_mansanas"), questsAfterKabayo);

  // --- Kutsero: +10 barya, and the exact script. ---
  const balanceBefore = await page.evaluate(() => Game.currency());
  await walkTo(page, 730); // Kutsero sits at x=750
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

  await page.waitForTimeout(2200); // the fade back to tondo
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
  ok("the third objective's flag is set", afterGift.flag === true, afterGift);
  ok("the apple quest is marked done in the log", afterGift.questDone && afterGift.questDone.done === true, afterGift.questDone);
  ok("a new, open quest to reach the entablado is logged", afterGift.entabladoQuest && afterGift.entabladoQuest.done === false, afterGift.entabladoQuest);
  ok("its objective's flag is not set — nothing completes it yet", afterGift.entabladoFlag !== true, afterGift.entabladoFlag);
  ok("Act I now has four objectives, three of them done", afterGift.objTotal === 4 && afterGift.objDone === 3, afterGift);
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

  await ctx.close();
  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
