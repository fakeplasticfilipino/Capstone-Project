// One-off verification script for the new Kausapin-si-Nanay /
// Pumunta-sa-Trabaho / Bilhan-ng-mansanas-ang-kabayo scene. Not part
// of the shipped suite; drives the REAL content/act1.js (no fixture
// routes) the same way _dev/test.js Section A does, then exercises
// the new dialogue, fade transition and second scene.
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8098;
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

  // No assessment items are seeded in the stub, so the pre-act flow
  // collapses to just the trivia card (see sb-stub.js, get_assessment_items).
  if (await page.locator("#quiz").isVisible().catch(() => false)) {
    await page.click("#quiz-btn");
    await page.waitForTimeout(400);
  }
  ok("act status is playing", (await page.evaluate(() => Acts.status)) === "playing");
  ok("starting scene is tondo", (await page.evaluate(() => currentRoom)) === "tondo");

  const questsAtStart = await page.evaluate(() => quests.map((q) => q.id));
  ok("both starting quests are logged",
     questsAtStart.includes("kausapin_nanay") && questsAtStart.includes("pumunta_trabaho"),
     questsAtStart);
  ok("the apple quest is not logged yet",
     !questsAtStart.includes("bilhan_mansanas"), questsAtStart);

  // Walk to Nanay (x=300, start at x=80) and talk.
  await page.evaluate(() => { posX = 280; });
  await page.waitForTimeout(50);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);
  ok("dialogue opened", await page.evaluate(() => inDialogue));

  const lines = [];
  for (let i = 0; i < 5; i++) {
    lines.push(await page.evaluate(() => dialogueText.textContent));
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
  }
  console.log("  lines seen: " + JSON.stringify(lines));
  ok("first line matches the script",
     lines[0] === "Macario, anak, saan ka pupunta?", lines[0]);
  ok("second line matches the script",
     lines[1] === "Sa entablado nay, huli na ‘ho ako", lines[1]);
  ok("fourth line matches the script (cut off)",
     lines[3] === "Nay, mahuhuli na po a-", lines[3]);

  // The 5th press ended the dialogue and fired the fade. Mid-fade the
  // world should be under blackout and non-interactive.
  await page.waitForTimeout(300);
  const midFade = await page.evaluate(() => ({
    blackoutVisible: document.getElementById("blackout").classList.contains("visible"),
    cutscenePlaying: typeof cutscenePlaying !== "undefined" ? cutscenePlaying : null,
  }));
  ok("blackout is up mid-transition", midFade.blackoutVisible, midFade);
  ok("cutscenePlaying suppresses input mid-transition", midFade.cutscenePlaying === true, midFade);

  await page.waitForTimeout(2200); // let the full fade (900+400+900ms) finish

  const afterFade = await page.evaluate(() => ({
    room: currentRoom,
    grey: document.getElementById("skyline").classList.contains("grey-filter"),
    cutscenePlaying: cutscenePlaying,
    flags: { kausapin: state.flags.nakausapKayNanay, trabaho: state.flags.nasaDaanPatungoSaTrabaho },
  }));
  ok("landed in the kutsero scene", afterFade.room === "kutsero", afterFade);
  ok("skyline carries the grey filter", afterFade.grey === true, afterFade);
  ok("cutscenePlaying released after the fade", afterFade.cutscenePlaying === false, afterFade);
  ok("both flags were set", afterFade.flags.kausapin === true && afterFade.flags.trabaho === true, afterFade);

  const questsAfterFade = await page.evaluate(() => quests.map((q) => ({ id: q.id, done: q.done })));
  ok("both starting quests are marked done",
     questsAfterFade.every((q) => q.id !== "kausapin_nanay" && q.id !== "pumunta_trabaho" ? true : q.done),
     questsAfterFade);
  ok("the apple quest still isn't logged (not met Kabayo yet)",
     !questsAfterFade.some((q) => q.id === "bilhan_mansanas"), questsAfterFade);

  // Kabayo sits at x=300 in the new scene too.
  await page.evaluate(() => { posX = 280; });
  await page.waitForTimeout(50);
  await page.keyboard.press("e");
  await page.waitForTimeout(150);
  ok("dialogue with Kabayo opened", await page.evaluate(() => inDialogue));

  const kabayoLines = [];
  for (let i = 0; i < 3; i++) {
    kabayoLines.push(await page.evaluate(() => ({
      speaker: dialogueSpeaker.textContent, text: dialogueText.textContent,
    })));
    await page.keyboard.press("e");
    await page.waitForTimeout(120);
  }
  console.log("  kabayo lines seen: " + JSON.stringify(kabayoLines));
  ok("Kabayo neighs", kabayoLines[0].speaker === "Kabayo" && kabayoLines[0].text === "Neighh", kabayoLines[0]);
  ok("Macario replies", kabayoLines[1].speaker === "Macario" &&
     kabayoLines[1].text === "Gutom ka na ba? Saglit lang ha, bili muna akong mansanas", kabayoLines[1]);

  await page.waitForTimeout(150);
  const questsAfterKabayo = await page.evaluate(() => quests.map((q) => q.id));
  ok("the apple quest is now logged", questsAfterKabayo.includes("bilhan_mansanas"), questsAfterKabayo);

  // Kabayo has no real art yet: falls back to the dashed placeholder
  // naming Assets/Horse.png, same as every other missing image.
  const horsePlaceholder = await page.evaluate(() => {
    const el = document.getElementById("npc-kabayo");
    return el ? el.textContent : null;
  });
  ok("Kabayo falls back to the placeholder naming Assets/Horse.png",
     (horsePlaceholder || "").includes("Assets/Horse.png"), horsePlaceholder);

  // Objectives: 3 total, 2 done (act must NOT auto-complete).
  const objState = await page.evaluate(() => ({
    total: Acts.objectivesFor(1).length,
    done: Acts.countDone(1),
    status: Acts.status,
  }));
  ok("three objectives declared for Act I", objState.total === 3, objState);
  ok("exactly two are done", objState.done === 2, objState);
  ok("act has not auto-completed", objState.status === "playing", objState);

  await ctx.close();
  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
