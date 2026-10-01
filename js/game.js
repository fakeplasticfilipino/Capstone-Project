// =============================================================
// MACARIO — game.js
//
// Blocks applied:
//   Block 1   role routing (teachers redirect to teacher.html)
//   Block 2.1 Act I content extracted to content/act1.js
//   Block 2.2 world building wrapped in loadAct() / unloadAct()
//   Block 2.4 act transition replaces the empty-room ending
//   Block 2.5 resume into the act recorded in game_progress
//   Block 6   scenes, jump, health, stealth, combat
//   Block 7   pause state and the shell facade
//
// game.js is now the ENGINE only. It knows how to render a world,
// run dialogue, and animate sprites. It does not know what is in
// any particular act. Act content lives in content/actN.js.
//
// REQUIRES: content/act1.js must load BEFORE this file.
// =============================================================

const world = document.getElementById("world");
const viewport = document.getElementById("viewport");

// Block 36. The camera needs the viewport's width every frame, and reading
// it back from the layout after the frame's own writes forced the browser
// to lay the whole world out again, every frame, to answer. It changes
// only when the window or the phone's orientation does, so it is measured
// then and remembered.
let viewportWidth = 0;

function measureViewport() {
  viewportWidth = viewport.clientWidth || viewportWidth;
  return viewportWidth;
}

window.addEventListener("resize", () => {
  measureViewport();
});
window.addEventListener("orientationchange", () => {
  setTimeout(measureViewport, 200); // after the browser has settled the new size
});
const player = document.getElementById("player");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnInteract = document.getElementById("btn-interact");

// Every button in the game is now an icon plus a label, so writing a
// button's text means writing the label SPAN rather than the button.
// This one runs every frame on #btn-interact, and setting textContent
// there wiped the icon on the first frame after the screen was drawn.
//
// A button that carries an icon but no span gets one built for it
// rather than being written over. That case is a mistake in the
// markup, and the old fallback of writing the button directly turned
// it into an icon that vanished the first time the label changed --
// which is exactly what happened to the quiz button, whose label has
// never been in index.html. A button with no icon at all is written
// directly, which is the honest fallback.
function setLabel(el, text) {
  if (!el) return;
  let span = el.querySelector(".lbl");
  if (!span && el.querySelector(".ico")) {
    span = document.createElement("span");
    span.className = "lbl";
    el.appendChild(span);
  }
  const target = span || el;
  // Only when it actually changes (Block 36). The game loop writes the
  // interact button every frame, and writing the same word back still
  // dirties the element, which cost a style recalculation and a layout
  // sixty times a second on a phone that has neither to spare.
  if (target.textContent === text) return;
  target.textContent = text;
}

// Points an existing button's icon at a different symbol. Used where
// one button means two things depending on the screen, such as the
// quiz button, which is an arrow on every question but the last and a
// tick on that one.
function setIcon(el, symbolId) {
  if (!el || !symbolId) return;
  const use = el.querySelector(".ico use");
  // Only on a change, like setLabel: the game loop now sets the interact
  // button's icon every frame (Block 93).
  if (use && use.getAttribute("href") !== "#" + symbolId) use.setAttribute("href", "#" + symbolId);
}

// Builds one for a button that is created in JavaScript rather than
// declared in index.html. SVG elements need the namespace; created
// with createElement they parse as unknown HTML and draw nothing,
// which is a blank square rather than an error.
function makeIcon(symbolId) {
  const NS = "http://www.w3.org/2000/svg";
  const box = document.createElement("span");
  box.className = "ico";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(NS, "use");
  use.setAttribute("href", "#" + symbolId);
  svg.appendChild(use);
  box.appendChild(svg);
  return box;
}
const mobileControls = document.getElementById("mobile-controls");
const btnPause = document.getElementById("btn-pause");
// Shop and inventory buttons added in Block 13. They ride the same
// visibility branch as btnPause below, further gated on window.Inventory
// so they never appear if that module fails to load. Since Block 25
// they are the only way into either screen from play.
const btnInventoryMain = document.getElementById("btn-inventory");
const btnShopMain = document.getElementById("btn-shop");

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

// --- Bodies ----------------------------------------------------------------
// Every character in the world is a BODY first and a picture second. A
// body is a box on the ground: its left edge is the character's x (posX
// for Macario, npc.x for an NPC, guard.pos for a guard) and its width is
// one of the constants below. Every rule that asks "is he touching it"
// reads the body and nothing else, and every sprite is drawn so that the
// feet of the character in the art stand on the centre of that body (see
// bodySprite, above loadSpriteSheet). The picture follows the body; the
// body never follows the picture.
//
// This replaced a model in which the logic box and the picture only
// shared a left edge. The picture is a whole sprite-sheet CELL scaled up
// (over 300px wide for the idle sheet) with the character drawn in the
// middle of it, so Macario's drawn feet stood roughly 140px to the right
// of the 40px box every collision actually used. A hazard therefore hurt
// him when he was drawn well past it and never when he was drawn standing
// on it, and a thrown spear, an NPC's reach and a guard's catch were all
// measured from a point on screen where nobody was standing. Patching
// each consumer with its own offset (Blocks 22 and 23 did that for the
// throw) could not converge, because there was no single place where the
// picture and the body were made to agree. There is now.
//
// Two rules, used consistently, are the whole collision model:
//   harm is by OVERLAP: any part of the body inside a hazard band hurts.
//   support and cover are by CENTRE: a platform holds him and a hide spot
//   hides him while the middle of his body is over it, so standing half
//   off a ledge or half out of a crate behaves the way it looks.
const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
// An NPC's body is wider than Macario's on purpose. It is only ever used
// for reach (findNearby's edgeGap), never for harm, and a generous box is
// what makes talking to someone forgiving on a touch screen. Exact
// per-NPC widths are not tracked in content and do not need to be.
const NPC_WIDTH = 80;
// Block 99. A free-running loop's speed, spread this far either side of
// its fps (setupNpcAnimation), so people standing together drift apart.
// Up here because loadAct reaches setupNpcAnimation at parse time.
const NPC_RATE_SPREAD = 0.1;
// A guard's body is the same size as Macario's: guards catch, get hit and
// get taken down, which are the same kind of contact his body has.
const GUARD_WIDTH = PLAYER_WIDTH;
// Block 38. Read by buildGuards, which loadAct can reach at parse time, so
// they sit up here rather than with the rest of the hostile-guard numbers
// (the temporal dead zone pitfall in CLAUDE.md).
const GUARD_HP = 2;
const GUARD_CHASE_SPEED = 2.6; // per 60fps frame; SPEED is 5
// Block 35. A fighting enemy has the same body as a guard, for the same
// reason: it hits, gets hit and gets knocked back like Macario does.
const ENEMY_WIDTH = PLAYER_WIDTH;
const GROUND_LEVEL = 60; // must match --ground-level in style.css
const DISPLAY_HEIGHT = 134; // shared sprite height (player + animated NPCs)

// --- Physics -------------------------------------------------------------
// Tuned per 60fps frame, then scaled by the real frame delta in the loop.
// The target device is a low-end Android phone that will not hold 60fps,
// and a frame-counted jump would reach half its height at 30fps.
const GRAVITY = 0.8;
const JUMP_VELOCITY = 14;
const TERMINAL_VELOCITY = -22; // clamp the descent so a long fall stays readable

// --- Health --------------------------------------------------------------
// The floor, before equipment. Everything that reads a maximum reads
// maxHealth, which an accessory can raise; this constant is only ever
// the starting point that setEffects adds a bonus to.
const BASE_MAX_HEALTH = 3;
let maxHealth = BASE_MAX_HEALTH;
const INVULN_MS = 1000;

// --- Equipment effects ---------------------------------------------------
// Plain numbers, handed in by inventory.js through Game.setEffects. The
// engine never learns that an item exists: it is told a maximum health
// bonus and a projectile speed multiplier, and applies them. That is what
// keeps equipment out of this file the way acts are.
//
// Declared here rather than beside the other mutable state further down,
// because loadAct() runs at parse time and reaches into the HUD, and
// anything it can touch has to be initialised above it.
let equipEffects = { maxHealthBonus: 0, projectileSpeedMult: 1, stillDetectionMult: 1 };

// Block 32. Whether Macario is standing still on the ground this frame,
// set by the game loop just before guards are updated, and read by
// detection for stillDetectionMult. Declared up here beside the effects
// it serves, for the same parse-time reason.
let playerStill = true;

// The little hop that comes with a hazard shove. Without being moved
// clear the player is left standing in the band, the invulnerability
// lapses, and all three hearts go while they are holding still.
const HAZARD_RECOIL_VELOCITY = 7;

// --- Pickups -------------------------------------------------------------
// Drawn at PICKUP_SIZE square. PICKUP_REACH is generous on both axes
// because the target device is a phone and a pixel-exact collectible on a
// 412px screen is a collectible nobody collects.
const PICKUP_SIZE = 22;
const PICKUP_REACH = 46;

// --- Difficulty ----------------------------------------------------------
// Guard speed scaled by act number, and nothing else. One lever moves the
// whole curve: speed sets the detection window, the cost of a mistimed
// run, and how much ground a patrol covers. A system with more knobs
// would need tuning data this project will never collect.
//
// alertRate is deliberately NOT scaled. It is the per-guard lever the
// content uses to make one sentry harder than the one beside it, and
// scaling both would make the two indistinguishable.
//
//   Act I 1.00   Act II 1.15   Act III 1.30   Act IV 1.45
//
// The ceiling matters. Act I's faster guard is 1.4, which reaches 2.03 in
// Act IV against a player SPEED of 5. Scaled guard speed must stay well
// under SPEED or a corridor stops being solvable by running, which is the
// one route a struggling student reliably finds.
const DIFFICULTY_STEP = 0.15;

function difficultyMultiplier(actNumber) {
  const n = Number(actNumber) || 1;
  return 1 + (n - 1) * DIFFICULTY_STEP;
}

// There is no game over. Reaching zero returns Macario to the start of the
// scene at full health. A fail state that ejects a Grade 8 student from the
// lesson serves nobody, and being caught already costs them the walk back.

// Bump this whenever ANY file in assets/ is replaced.
//
// The v=N strings in index.html only cover scripts and stylesheets.
// Images had no version at all, so browsers and the GitHub Pages CDN
// kept serving stale sprites indefinitely after a file was swapped.
// Every image load goes through assetUrl() so one number refreshes them all.
const ASSET_VERSION = 34;

function assetUrl(path) {
  if (!path) return path;
  return path + (path.includes("?") ? "&" : "?") + "v=" + ASSET_VERSION;
}

// --- Asset loader (Block 62) ------------------------------------------
// Every picture the world draws is asked for through loadImage, which
// does three things a bare new Image() did not.
//
// It retries, and since Block 78 it knows which pictures exist. The list
// of every file under assets/ is js/asset-manifest.js, written by
// _dev/tools/make-asset-manifest.js and checked against the disk by the
// harness, and it splits every picture into two:
//
//   Not in the list: art the artist still owes (ART.md). It is not asked
//   for at all and is the placeholder box at once.
//
//   In the list: it exists, so any failure is the connection or the
//   host, never "not there". GitHub Pages answers 404 for a minute or so
//   while a push is deploying, and before Block 78 one such answer made a
//   picture a box for the rest of the visit; a test student walked into
//   the world with sprites missing that way. Now it is tried again, after
//   0.8, 2 and 5 seconds and then every 8, for as long as it takes, and
//   it stays pending (counted as not arrived) until it arrives. A retry
//   fetches the file afresh past the browser's own cache, which may be
//   holding the failed answer, and shows the picture from that copy.
//   retryAssets() tries every waiting picture again at once, for the
//   loading screen's Subukan ulit.
//
// A picture outside assets/, or a page without the manifest, is judged
// the old way: a failure is checked with a HEAD request, a 404 is given
// up on at once, and anything else is tried three more times.
//
// It shares. The same URL asked for twice is one download and one
// promise, so the title screen's bar and the sprite that needs the
// picture wait on the same thing.
//
// It counts. assetProgress() is what the loading bars draw and
// whenAssetsSettled() is what entering the world and every scene change
// wait on. Since Block 78 neither is capped: nobody goes in, or through a
// scene change, with a picture that exists still on its way (TRACKER.md,
// Known problems).
//
// Declared here, near the top, because loadAct reaches it at parse time
// (the temporal dead zone pitfall in CLAUDE.md).
const ASSET_RETRY_DELAYS_MS = [800, 2000, 5000, 8000]; // then every 8000
const ASSET_GUESS_TRIES = 3; // for a picture the manifest does not cover
const assetLoads = new Map(); // url -> { state, promise, retry }
const assetProgressListeners = [];

function assetProgress() {
  let done = 0;
  let total = 0;
  assetLoads.forEach((entry) => {
    total++;
    if (entry.state !== "pending") done++;
  });
  return { done, total };
}

function notifyAssetProgress() {
  const progress = assetProgress();
  assetProgressListeners.forEach((fn) => {
    try { fn(progress); } catch (err) { console.error(err); }
  });
}

// Block 78. true: the file is in js/asset-manifest.js. false: it is under
// assets/ and not there, so it does not exist. null: the manifest cannot
// say (no manifest, or a path outside assets/). The set is built once and
// hung off the function, since this runs at parse time.
function assetExpected(src) {
  const list = window.ASSET_MANIFEST;
  const file = String(src).split("?")[0];
  if (!Array.isArray(list) || !file.startsWith("assets/")) return null;
  if (!assetExpected.set) assetExpected.set = new Set(list);
  return assetExpected.set.has(file);
}

// True when the file is really not there, false when the failure was the
// connection. A probe that itself fails is the connection too.
function assetIsMissing(url) {
  if (typeof fetch !== "function") return Promise.resolve(true);
  return fetch(url, { method: "HEAD", cache: "no-store" })
    .then((res) => res.status === 404 || res.status === 410)
    .catch(() => false);
}

function loadImage(src) {
  const url = assetUrl(src);
  const known = assetLoads.get(url);
  // A picture the connection failed on (one the manifest does not cover)
  // is asked for again the next time something needs it. One that does
  // not exist ("missing") is not, and one that exists never fails: it
  // stays pending until it arrives.
  if (known && known.state !== "failed") return known.promise;

  const expected = assetExpected(src);
  const entry = { state: "pending", promise: null, retry: null };
  entry.promise = new Promise((resolve) => {
    // Owed art: no request, the box at once.
    if (expected === false) {
      entry.state = "missing";
      resolve(null);
      return;
    }
    let attempt = 0;
    let timer = null;
    let busy = false;
    const arrived = (img) => {
      busy = false;
      clearTimeout(timer);
      entry.state = "ok";
      entry.retry = null;
      notifyAssetProgress();
      resolve(img);
    };
    const giveUp = (missing) => {
      busy = false;
      entry.state = missing ? "missing" : "failed";
      entry.retry = null;
      notifyAssetProgress();
      resolve(null); // resolve, not reject, so Promise.all never hangs
    };
    const show = () => {
      busy = true;
      const img = new Image();
      img.onload = () => arrived(img);
      img.onerror = () => failed(0);
      img.src = url;
    };
    const later = () => {
      busy = false;
      const delay = ASSET_RETRY_DELAYS_MS[Math.min(attempt, ASSET_RETRY_DELAYS_MS.length - 1)];
      attempt++;
      clearTimeout(timer);
      timer = setTimeout(again, delay);
    };
    // A try after a failure: the file fetched afresh, past the browser's
    // cache, then shown from the copy that fetch left behind.
    const again = () => {
      if (busy || entry.state !== "pending") return;
      clearTimeout(timer);
      if (typeof fetch !== "function") { show(); return; }
      busy = true;
      fetch(url, { cache: "reload" })
        .then((res) => (res.ok ? show() : failed(res.status)))
        .catch(() => failed(0));
    };
    const failed = (status) => {
      if (expected === true) { later(); return; }
      // Not covered by the manifest: the Block 62 rules.
      if (status === 404 || status === 410) { giveUp(true); return; }
      if (attempt >= ASSET_GUESS_TRIES) { giveUp(false); return; }
      if (status) { later(); return; }
      assetIsMissing(url).then((missing) => (missing ? giveUp(true) : later()));
    };
    entry.retry = again;
    show();
  });
  assetLoads.set(url, entry);
  notifyAssetProgress();
  return entry.promise;
}

// Block 78. Every picture still on its way, tried again now rather than
// at its next scheduled try: the loading screen's Subukan ulit.
function retryAssets() {
  let n = 0;
  assetLoads.forEach((entry) => {
    if (entry.state === "pending" && entry.retry) { entry.retry(); n++; }
  });
  return n;
}

// Block 78. Every picture an act names, and every enemy type's, asked for
// the moment the act is loaded rather than when a scene or a fight first
// needs it. The title screen's bar and the entry wait then cover the
// whole act, and a scene change or the play's soldiers never wait on a
// download. Walks the act's data for strings under assets/ ending .png or
// .jpg; the scripts are functions and are not walked, which is why the
// enemy catalogue is walked whole (spawnEnemies names its types there).
// Skips the page's own elements, which content objects carry once built.
function preloadActArt(actData) {
  const seen = new Set();
  const walk = (v) => {
    if (typeof v === "string") {
      if (/^assets\/.+\.(png|jpe?g)$/i.test(v)) loadImage(v);
      return;
    }
    if (!v || typeof v !== "object" || seen.has(v)) return;
    if (typeof Node !== "undefined" && v instanceof Node) return;
    seen.add(v);
    Object.keys(v).forEach((k) => walk(v[k]));
  };
  walk(actData);
  walk(window.ENEMY_TYPES);
}

// Resolves once nothing is pending, or after timeoutMs if one is given.
// Since Block 78 neither caller gives one: a picture that exists is
// waited for until it arrives.
function whenAssetsSettled(timeoutMs) {
  return new Promise((resolve) => {
    const check = () => {
      const p = assetProgress();
      return p.done >= p.total;
    };
    if (check()) { resolve(true); return; }
    let timer = null;
    const listener = () => {
      if (!check()) return;
      finish(true);
    };
    const finish = (settled) => {
      clearTimeout(timer);
      const i = assetProgressListeners.indexOf(listener);
      if (i !== -1) assetProgressListeners.splice(i, 1);
      resolve(settled);
    };
    assetProgressListeners.push(listener);
    if (timeoutMs) timer = setTimeout(() => finish(false), timeoutMs);
  });
}

function onAssetProgress(fn) {
  if (typeof fn === "function") assetProgressListeners.push(fn);
}

// --- Game state ----------------------------------------------------------
const state = {
  flags: {}, // arbitrary story flags, named by whatever content is loaded
};

// --- Quest system ----------------------------------------------------------
const quests = []; // { id, text, done }
let saveDirty = false;
let saveDebounceTimer = null;

// Saves are refused until the login sequence has finished resolving
// which act the student is in.
//
// loadAct() runs once at parse time to draw the backdrop behind the
// login box, and it adds that act's starting quests, which calls
// markDirty(). The resulting debounced save would then fire partway
// through login, while Acts.current is still its initial 1, and
// write current_act = 1 over a student who was in Act III. The
// slower the connection, the more reliably it happened, which is the
// wrong way round for a phone on school wifi.
let saveReady = false;

function addQuest(id, text) {
  if (quests.some((q) => q.id === id)) return;
  quests.push({ id, text, done: false });
  renderQuests();
  markDirty();
}

function completeQuest(id) {
  const q = quests.find((q) => q.id === id);
  if (q) q.done = true;
  renderQuests();
  markDirty();
}

// Block 37. Rewrites a logged quest's line, for a task that counts
// ("Ipamahagi ang mga polyeto (1/3)"). Does nothing for a quest not
// logged, so content cannot add one by accident through here.
function setQuestText(id, text) {
  const q = quests.find((q) => q.id === id);
  if (!q || q.text === text) return;
  q.text = text;
  renderQuests();
  markDirty();
}

// Emptied on an act change. The log is the tasks of the act in hand,
// not a permanent record of every act.
function clearQuests() {
  quests.length = 0;
  renderQuests();
  markDirty();
}

// =============================================================
// THE QUEST LOG (Block 48; Block 57)
//
// The log on screen is "Gawain": what to do now, and nothing else. The
// tasks already done are not on the world's screen at all since Block
// 57: they are listed in the settings panel (shell.js, reading
// Game.doneQuests), at the proponent's direction, so the corner of the
// screen a student glances at never grows with history.
//
// An act that declares linearObjectives drives the log from its
// objectives instead of from addQuest calls scattered through content.
// Its objectives are one chain, in the order the story plays them; the
// current task is the first whose flag is not set, and everything
// before it is done. That rule is also applied to the flags themselves
// (syncObjectiveChain): a set flag marks every earlier step done, so a
// save from before a step existed, or a step passed some other way,
// never leaves the chain stuck on something already behind the student,
// and the act can still complete. The quests array is rebuilt from the
// chain, so everything that reads it (a shop item that waits on a quest
// with forQuest) sees the current step as the
// one open quest.
//
// An objective may declare countFlags, and its line then ends with the
// count of those set, "(3/10)", worked out here rather than rewritten
// by content.
//
// Acts without linearObjectives keep the old behaviour: addQuest,
// completeQuest and setQuestText, with open quests shown and done ones
// in the settings list.
// =============================================================

let questDrawnKey = null;

// Block 52. "Bagong gawain" is announced when the step in hand changes
// while the student is playing, and never for the step a login or a
// reload lands on. questAnnounceReady is switched on once the world is
// handed over (enterWorldScripts), and questAnnouncedId is the step the
// last render showed, reset on every act load so a new act starts quiet.
let questAnnounceReady = false;
let questAnnouncedId = null;

// Block 93. A room the story leads into says, at the top of the log, how
// to leave it (scene.wayOut), once the student is free there: no script
// of the scene waiting or playing. Read only once the world has been
// handed over (questAnnounceReady), because loadAct reaches here at parse
// time and the running-scripts set is declared further down (the TDZ).
function wayOutLine() {
  const scene = currentScene;
  if (!scene || !scene.wayOut || !questAnnounceReady) return null;
  if (sceneScriptsRunning.size || pendingSceneScript(scene)) return null;
  return scene.wayOut;
}

function objectiveLine(o) {
  // Block 52. A step that is a sum of money rather than a list of people
  // reads the barya balance, capped at the target so a student who has
  // more does not read "(140/100)". The line only shows the count: the
  // step's flag is still set by content, because what finishing it means
  // (handing it over, say) is the story's to decide, not the engine's.
  if (typeof o.countCurrency === "number" && o.countCurrency > 0) {
    const have = Math.min(currency, o.countCurrency);
    return o.label + " (" + have + "/" + o.countCurrency + ")";
  }
  if (!Array.isArray(o.countFlags)) return o.label;
  const n = o.countFlags.filter((f) => state.flags[f]).length;
  return o.label + " (" + n + "/" + o.countFlags.length + ")";
}

// Backfills the chain and rebuilds the quests array from it. Returns
// nothing; renderQuests draws. Safe to call as often as markDirty is.
function syncObjectiveChain() {
  const act = currentActData;
  if (!act || !act.linearObjectives) return;
  const list = act.objectives || [];
  let last = -1;
  list.forEach((o, i) => { if (state.flags[o.flag]) last = i; });
  for (let i = 0; i < last; i++) state.flags[list[i].flag] = true;

  const next = [];
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    const done = Boolean(state.flags[o.flag]);
    next.push({ id: o.id, text: objectiveLine(o), done });
    if (!done) break;
  }
  // Block 92. A step may be pinned: once its flag "from" is set it stays
  // in the log beside the step in hand until it is done itself, so a
  // student sees a running count (the barya) while doing something else.
  list.forEach((o) => {
    if (!o.pinned || state.flags[o.flag] || !state.flags[o.pinned.from]) return;
    if (next.some((q) => q.id === o.id)) return;
    next.push({ id: o.id, text: objectiveLine(o), done: false });
  });
  quests.length = 0;
  quests.push(...next);
}

function renderQuests() {
  syncObjectiveChain();
  const current = quests.filter((q) => !q.done);
  const doneCount = quests.length - current.length;

  const act = currentActData;
  if (act && act.linearObjectives) {
    const id = current.length ? current[0].id : null;
    if (id !== questAnnouncedId) {
      if (questAnnounceReady && id && questAnnouncedId !== null) {
        showToast("Bagong gawain: " + current[0].text, 3200);
        playSfx("quest"); // Block 58; never reached at parse time
      }
      questAnnouncedId = id;
    }
  }

  // Written only when something shown changed: markDirty calls this
  // from the loop's own paths, and rebuilding an identical list would
  // dirty the page for nothing (Block 36).
  const way = wayOutLine();
  const key = JSON.stringify([current.map((q) => q.text), doneCount > 0, way]);
  if (key === questDrawnKey) return;
  questDrawnKey = key;

  questListEl.innerHTML = "";
  if (way) {
    const li = document.createElement("li");
    li.className = "quest-way";
    li.textContent = way;
    questListEl.appendChild(li);
  }
  current.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = q.text;
    questListEl.appendChild(li);
  });
  if (!current.length) {
    const li = document.createElement("li");
    li.className = "quest-none";
    li.textContent = doneCount ? "Wala nang gawain." : "Walang gawain.";
    questListEl.appendChild(li);
  }
}

// Block 57. The lines of the tasks already done, in the order they were
// done, for the settings panel. A copy, like every other facade read.
function doneQuestTexts() {
  syncObjectiveChain();
  return quests.filter((q) => q.done).map((q) => q.text);
}

// =============================================================
// ACT LOADING
//
// Everything below is populated by loadAct() from an act data
// file. These were previously hardcoded constants built once at
// script load. Making them reloadable is what allows moving
// between acts without a page refresh.
// =============================================================

let currentActData = null;
let SCENES = []; // every scene in the current act
let currentScene = null; // the scene data currently built
let currentSceneId = null;

let NPCS = []; // the current SCENE's NPCs
let WORLD_WIDTH = 4400; // overwritten per scene
let PLATFORMS = []; // one-way platforms, jumped up through and landed on
let GUARDS = []; // patrolling guards, empty outside stealth scenes
// Block 35. Enemies that fight rather than patrol, spawned by content at
// run time (spawnEnemies). Declared up here because unloadScene and
// updateHudVisibility, both reached at parse time, read it.
let ENEMIES = [];
// Block 37. Shots from guards in flight. Declared up here with the other
// scene lists, not beside the code that fires them, because unloadScene
// clears them and loadAct reaches unloadScene at parse time (the temporal
// dead zone pitfall in CLAUDE.md).
let GUARD_BULLETS = [];
let enemiesDone = null; // resolves the spawnEnemies promise
let HIDE_SPOTS = []; // regions that suppress guard detection
let HAZARDS = []; // ground regions that cost one health on contact
let PICKUPS = []; // collectibles; currently only hearts

// Native pixel dimensions of the fallback backdrop,
// assets/backgrounds/act1/street-01.jpg since Block 54 (tondo.jpg was
// removed as old). A backdrop tile is
// drawn at the full height of the skyline, so at any rendered height it
// is exactly this ratio times as wide. buildSkylineTiles() uses it to lay
// the tiles out without hardcoding a width that would only be right at
// one screen size or --zoom.
const SKYLINE_ASPECT = 1952 / 736;

// Ids collected during this visit to the scene. Created by loadScene and
// cleared only by loadScene, never by respawnInScene, so a heart already
// spent cannot be farmed by dying on purpose. Leaving the scene and
// coming back does restore them, which matches health not being
// persisted either.
let collectedPickups = new Set();

let actElements = []; // every DOM node loadAct created, for cleanup
let decorationEls = [];
let npcAnimators = []; // animated sprites needing an .update(now) each frame

// Incremented on every load. setupNpcAnimation captures the value
// and refuses to register itself if the act changed while its image
// was still downloading, which would otherwise leave an animator
// pointing at a removed element.
let actLoadToken = 0;

// An act is a list of scenes. Acts that predate scenes, which is every
// act except Act I, declare their world directly on the act object; those
// are wrapped in a single implicit scene here rather than being rewritten.
// content/act2.js through act4.js therefore need no changes at all.
function scenesFor(actData) {
  if (Array.isArray(actData.scenes) && actData.scenes.length) {
    return actData.scenes;
  }
  return [
    {
      id: "road",
      worldWidth: actData.worldWidth,
      startX: actData.startX,
      npcs: actData.npcs,
      decorations: actData.decorations,
    },
  ];
}

function loadAct(actData, sceneId) {
  unloadAct();

  currentActData = actData;
  SCENES = scenesFor(actData);
  preloadActArt(actData); // Block 78
  questAnnouncedId = null;

  // Quests belong to the act, not the scene, so they are added once here
  // rather than being re-added every time the player changes room.
  (actData.startingQuests || []).forEach((q) => addQuest(q.id, q.text));

  loadScene(sceneId);
}

// Builds one scene. Everything that used to be per-act is now per-scene;
// the act above it only decides which scene is current.
function loadScene(sceneId) {
  unloadScene();

  actLoadToken++;
  const token = actLoadToken;

  const scene =
    SCENES.find((candidate) => candidate.id === sceneId) || SCENES[0];

  currentScene = scene;
  currentSceneId = scene.id;
  currentRoom = scene.id; // persisted through game_progress.current_room

  NPCS = scene.npcs || [];
  WORLD_WIDTH = scene.worldWidth || 4400;
  PLATFORMS = scene.platforms || [];
  // Block 81. A crate, like a guard, may be there for one stretch only.
  HIDE_SPOTS = (scene.hideSpots || []).filter(guardOnDuty);
  HAZARDS = scene.hazards || [];
  PICKUPS = (scene.pickups || []).slice(); // Block 68: hints are added per student
  collectedPickups = new Set();

  // Same Tondo.png backdrop, desaturated. Lets content reuse the one
  // backdrop for a flashback or memory beat instead of needing a second
  // background asset; see CLAUDE.md, Act data format. Toggled rather than
  // only ever added, so leaving the scene (gotoScene back to a scene
  // without the flag) clears it instead of leaving the world permanently
  // grey.
  document
    .getElementById("skyline")
    .classList.toggle("grey-filter", Boolean(scene.greyFilter));
  // The ground is part of the backdrop too. It was a missing-file
  // placeholder until Lupa.jpg (Block 33), so nobody saw a brown road
  // under a grey memory until then. Characters stay in colour, as before.
  document
    .getElementById("ground-tiles")
    .classList.toggle("grey-filter", Boolean(scene.greyFilter));
  applyNight(scene); // Block 85
  // Block 93. A scene whose people stand low in the picture (the stage)
  // reads its dialogue at the top of the screen, so the box does not
  // cover the very actors who are speaking. Toggled on every load.
  document.body.classList.toggle("dialogue-top", Boolean(scene.dialogueAtTop));

  // Block 34. A scene may bring its own backdrop picture (the inside of
  // the entablado) instead of the shared Tondo.png, and may hide the dirt
  // strip when the picture already has a floor. Both are set or cleared
  // on every load, like greyFilter, so leaving the scene restores Tondo.
  const skylineEl = document.getElementById("skyline");
  // Block 80. A backdrop that is owed art (not in the manifest) is not
  // put into the stylesheet at all, where the browser would ask for it
  // and 404; buildSkylineTiles draws its placeholder instead.
  if (scene.backdrop && scene.backdrop.src && assetExpected(scene.backdrop.src) !== false) {
    loadImage(scene.backdrop.src); // Block 62, as the panels are
    // Absolute, because a url() inside a custom property is resolved
    // against the stylesheet that reads it (css/style.css, one folder
    // down since Block 44), not against this page.
    skylineEl.style.setProperty("--skyline-src",
      `url("${new URL(assetUrl(scene.backdrop.src), document.baseURI).href}")`);
  } else {
    skylineEl.style.removeProperty("--skyline-src");
  }
  document
    .getElementById("ground-tiles")
    .classList.toggle("ground-hidden", scene.ground === false);

  // Block 36. The world element was a fixed 4400px whatever the scene
  // actually was, so the backdrop, the ground strip and every layer over
  // them were painted and held in memory at that width even in a room one
  // screen wide. Sized to the scene instead, which is the same number the
  // camera already clamps to. Set BEFORE the backdrop is built, because
  // that reads the world's width to know how many tiles to lay.
  world.style.width = WORLD_WIDTH + "px";
  measureViewport();

  buildSkylineTiles();
  buildNpcs(token);
  buildDecorations(token);
  buildPlatforms();
  buildHideSpots();
  buildHazards();
  buildPickups();
  buildHints(); // Block 68
  buildGuards(token);

  posX = typeof scene.startX === "number" ? scene.startX : 0;
  posY = groundHeightAt(posX);
  velY = 0;

  updateHudVisibility();
  renderQuests();
}

function unloadScene() {
  actElements.forEach((el) => el.remove());
  actElements = [];
  decorationEls = [];
  npcAnimators = [];

  NPCS = [];
  PLATFORMS = [];
  GUARDS = [];
  HIDE_SPOTS = [];
  HAZARDS = [];
  PICKUPS = [];
  ENEMIES = []; // their elements are in actElements, removed above
  GUARD_BULLETS = []; // likewise
  enemiesDone = null;
  currentScene = null;
  currentSceneId = null;
}

function unloadAct() {
  unloadScene();
  SCENES = [];
  currentActData = null;
}

// Lays the backdrop out as tiles, every other one mirrored (Block 26).
//
// Tondo.png is a painted scene, not a texture drawn to repeat, so plain
// repeat-x put the image's right edge against its own left edge and left
// a visible jump in the clouds and the water. Blocks 18 to 25 covered each
// seam with a dark "tree shadow" band, which hid the jump by putting a
// black post in the middle of the scene instead.
//
// Mirroring removes the seam rather than hiding it. When the second copy
// is flipped, the pixels on both sides of the join are the SAME column of
// the image, so nothing jumps; the third copy is unflipped again and meets
// the second at the image's other edge, which is equally continuous. The
// cost is a symmetry a careful eye can find, which in a painting of stilt
// houses and palms reads as more village rather than as a mistake. It
// needs no new art and no image editing, which is the constraint the
// backdrop has always had.
//
// Tiles are absolutely positioned divs inside #skyline, each taking its
// picture from the layer's --skyline-src, so greyFilter (a filter on
// #skyline) still applies to everything inside it. Widths are whole pixels and each tile
// overlaps the next by one, because two fractional edges can leave a
// hairline of the sky showing through; the overlap is invisible exactly
// because the mirrored columns match. background-size is the tile's own
// box, so the rounding stretches the image by under a pixel rather than
// cropping it.
//
// Rebuilt on every scene load from the skyline's rendered height (there is
// no resize handling anywhere in this engine; see CLAUDE.md) and pushed to
// actElements, so unloadScene removes them with everything else the scene
// made.
function buildSkylineTiles() {
  const backdrop = currentScene && currentScene.backdrop;

  // Block 43. A street drawn as a row of different paintings, each one
  // panel, with a shadow tree in front of every join.
  if (currentScene && Array.isArray(currentScene.panels) && currentScene.panels.length) {
    buildPanelBackdrop(currentScene);
    return;
  }

  // Block 34. A scene's own backdrop is one painting of one room, not a
  // street, so it is drawn once rather than tiled: a mirrored second
  // copy of a stage would put a second set of curtains beside the first.
  // It covers the whole visible world, anchored at the bottom so the
  // painted floor stays under the characters' feet; on a screen wider
  // than the picture's own shape the top edge is what gets cropped.
  if (backdrop && backdrop.src) {
    const layer = document.getElementById("skyline");
    if (!layer) return;
    layer.classList.add("skyline-tiled");
    const tile = document.createElement("div");
    tile.className = "skyline-tile";
    tile.style.left = "0px";
    tile.style.width = Math.max(WORLD_WIDTH, viewport.clientWidth) + "px";
    tile.style.backgroundSize = "cover";
    tile.style.backgroundPosition = "center bottom";
    // Block 80. Owed art: the placeholder rule every missing sprite
    // follows, as a room. A dark wall with the file name on it, so the
    // scene reads as indoors and the artist can see what is wanted.
    if (assetExpected(backdrop.src) === false) {
      tile.classList.add("backdrop-owed");
      tile.textContent = backdrop.src;
    }
    layer.appendChild(tile);
    actElements.push(tile);
    return;
  }

  const layer = document.getElementById("skyline");
  if (!layer) return;
  const height = layer.clientHeight;
  if (!height) return; // not laid out yet; skip rather than divide by 0

  const tileWidth = Math.max(1, Math.round(height * SKYLINE_ASPECT));
  const totalWidth = world.clientWidth;
  layer.classList.add("skyline-tiled");

  for (let i = 0, x = 0; x < totalWidth; i++, x += tileWidth) {
    const tile = document.createElement("div");
    tile.className = "skyline-tile" + (i % 2 ? " skyline-tile-mirrored" : "");
    tile.style.left = x + "px";
    tile.style.width = tileWidth + 1 + "px";
    layer.appendChild(tile);
    actElements.push(tile);
  }
}

// =============================================================
// PANEL BACKDROPS AND SHADOW TREES (Block 43)
//
// A scene may declare panels: a list of paintings laid side by side along
// the road, repeated in order if the road is longer than the list. Unlike
// Tondo.png's mirrored tiles, these are different pictures, and two
// different paintings never meet cleanly at an edge: a hut is cut in half,
// the path jumps. So every join gets a shadow tree, a dark silhouette in
// the foreground that Macario, the NPCs and the guards all pass behind.
// It hides the join and reads as the nearest tree on the street rather
// than as a seam.
//
// Each panel is a fixed PANEL_WIDTH of the world, not "one image wide at
// the layer's height" the way Tondo's tiles are. The layer's height is
// the screen's height over --zoom, so it differs by phone; a width that
// followed it would put every join, and so every tree, somewhere
// different on each phone, and a tree could land on the Mananahi on one
// device and nowhere near her on another. With a fixed width the trees
// are at the same x on every screen, which is what lets content keep its
// people clear of them (verify_new_scene.js checks that). The painting
// covers its panel (background-size: cover), anchored at the bottom so
// the road stays under the characters' feet: on a short screen a little
// sky is cropped, on a wide one a little of each side, and the side is
// under the tree anyway.
// =============================================================

const PANEL_WIDTH = 1450;       // world px; about one phone screen and a bit
const SHADOW_TREE_WIDTH = 440;  // must match .shadow-tree's CSS width

// Where the trees stand: every join between two panels, and never at the
// very end of the world, where there is nothing to join.
function panelJoins(scene) {
  const width = scene.panelWidth || PANEL_WIDTH;
  const joins = [];
  for (let x = width; x < (scene.worldWidth || WORLD_WIDTH) - 1; x += width) joins.push(x);
  return joins;
}

function buildPanelBackdrop(scene) {
  const layer = document.getElementById("skyline");
  if (!layer) return;
  layer.classList.add("skyline-tiled");
  const width = scene.panelWidth || PANEL_WIDTH;

  for (let i = 0, x = 0; x < WORLD_WIDTH; i++, x += width) {
    const tile = document.createElement("div");
    // Block 45. mirrorPanels flips every second panel, as Block 26 did
    // for Tondo's tiles: a flipped copy meets its neighbour at the same
    // column of the painting, so even under the tree nothing jumps. Safe
    // with cover, because it crops both edges of every panel alike.
    const mirrored = scene.mirrorPanels && i % 2 === 1;
    tile.className = "skyline-tile skyline-panel" + (mirrored ? " skyline-tile-mirrored" : "");
    tile.style.left = x + "px";
    // One pixel of overlap, as with Tondo's tiles, so two fractional
    // edges never leave a hairline of the layer showing through.
    tile.style.width = width + 1 + "px";
    const panelSrc = scene.panels[i % scene.panels.length];
    // Block 62. Asked for through the loader too, so the painting is
    // retried on a bad connection and a scene change waits for it. The
    // background below is the same URL, so it is drawn from that one
    // download.
    loadImage(panelSrc);
    tile.style.backgroundImage = `url("${assetUrl(panelSrc)}")`;
    // Block 46. The whole picture stands on the floor (.skyline-panel):
    // anything above its top edge is panelSky, so the sky carries on up
    // a tall screen instead of ending in the page's own colour.
    if (scene.panelSky) tile.style.backgroundColor = scene.panelSky;
    layer.appendChild(tile);
    actElements.push(tile);
  }

  panelJoins(scene).forEach((x, i) => {
    // The tree's shade on the painting, behind everyone: it softens the
    // two paintings into each other either side of the trunk. In the
    // backdrop layer, so greyFilter greys it with the paintings.
    const shade = document.createElement("div");
    shade.className = "panel-join-shade";
    shade.style.left = x + "px";
    layer.appendChild(shade);
    actElements.push(shade);

    // The tree itself, in front of everyone. Its own element in #world,
    // above #player (style.css, .shadow-tree).
    const tree = document.createElement("div");
    tree.className = "shadow-tree";
    tree.style.left = x - SHADOW_TREE_WIDTH / 2 + "px";
    // Which of the four models stands here is the join's own number, so
    // a road is palm, tree, palm, tree rather than one shape repeated,
    // and the same tree stands at the same place on every phone and on
    // every visit. Picking at random would put a different tree at the
    // same join on a reload, which is not what a street does.
    tree.style.backgroundImage = SHADOW_TREE_URLS[i % SHADOW_TREE_URLS.length];
    // Characters stay in colour in a memory, but the tree is scenery,
    // so it greys with the paintings behind it.
    if (scene.greyFilter) tree.classList.add("grey-filter");
    world.appendChild(tree);
    actElements.push(tree);
  });
}

// Four trees in silhouette (Block 50; one coconut palm before that, and
// a broad leafy tree before that again), each drawn in a box
// SHADOW_TREE_WIDTH by 1200 and set as a tree element's background,
// anchored at the bottom, so the trunk stands on the road.
//
// The trunk is what hides the join, so it is thick, about 130 world px
// where a student is walking. Two are coconut palms, leaning opposite
// ways, with drooping fronds and a cluster of coconuts; two are
// ordinary broadleaf trees with a wide canopy on a couple of limbs.
// Every one of them stands its base centred on the join, whatever way
// it leans above, because the road is where the two paintings actually
// meet in front of the student.
//
// Block 70 brought the crowns down. Block 50 had hung them so high that
// a sideways phone, which shows only the lowest 590 or so of the 1200,
// held nothing but trunk, and the four models looked like one. The
// crowns now sit between about 450 and 600 above the road, over every
// head and inside the screen, each at its own height, so a palm reads
// as a palm and a broadleaf as a broadleaf.
//
// Generated once (_dev/tools/make-shadow-tree.py) and pasted in as SVG
// data URLs rather than shipped as files: they cost no download, so a
// slow connection cannot leave a join bare, and one URL per model means
// the browser decodes each one once however many stand on the road.
//
// Block 93: the right-hand roots rewound to match the trunk (see the
// generator); wound against it, they cut holes in every tree's base.
//
// Consts, not functions: loadAct reaches buildPanelBackdrop at parse time
// (the TDZ pitfall), and that first call is further down this file than
// these lines, so the values already exist when they are read.
const SHADOW_TREE_SVGS = [
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M131 1200 L135 1188 L138 1176 L141 1164 L144 1153 L146 1141 L148 1129 L150 1118 L152 1106 L153 1095 L155 1083 L156 1072 L158 1061 L159 1049 L161 1038 L162 1027 L164 1016 L165 1005 L167 994 L169 983 L171 972 L172 961 L174 951 L176 940 L178 929 L180 919 L182 908 L184 898 L186 887 L188 877 L190 866 L192 856 L192 846 L192 836 L191 826 L191 816 L192 805 L196 796 L201 786 L207 776 L212 766 L285 766 L286 776 L287 786 L288 796 L288 805 L285 816 L281 826 L276 836 L272 846 L269 856 L267 866 L266 877 L265 887 L264 898 L264 908 L263 919 L263 929 L263 940 L263 951 L263 961 L263 972 L263 983 L264 994 L265 1005 L265 1016 L266 1027 L268 1038 L269 1049 L270 1061 L272 1072 L274 1083 L276 1095 L278 1106 L281 1118 L284 1129 L287 1141 L291 1153 L295 1164 L299 1176 L304 1188 L309 1200 Z M123 1200 L156 1170 L198 1190 L220 1200 Z M220 1200 L242 1192 L277 1176 L306 1200 Z M220 1200 L242 1194 L293 1184 L330 1200 Z\"/><path d=\"M246 720 L233 703 L216 697 L199 685 L180 687 L161 679 L144 690 L122 688 L108 704 L88 709 L77 729 L59 741 L50 764 L37 783 L30 808 L16 830 L3 853 L3 853 L16 830 L30 808 L52 795 L67 779 L88 771 L99 756 L119 754 L128 740 L145 742 L155 730 L169 734 L181 723 L194 727 L210 720 L226 723 L246 720 Z\"/><path d=\"M246 720 L237 696 L221 682 L209 661 L189 657 L174 640 L153 645 L133 634 L115 648 L93 647 L80 666 L61 674 L53 696 L39 713 L34 738 L20 757 L7 779 L7 779 L20 757 L34 738 L57 729 L72 716 L92 714 L102 702 L118 707 L126 696 L138 705 L149 694 L159 704 L174 696 L186 706 L206 705 L222 715 L246 720 Z\"/><path d=\"M246 720 L246 693 L236 674 L234 650 L218 639 L212 618 L193 616 L180 599 L160 608 L141 603 L130 621 L114 628 L111 648 L102 663 L102 685 L93 704 L84 725 L84 725 L93 704 L102 685 L122 676 L132 666 L148 666 L152 658 L161 667 L162 659 L163 670 L170 661 L171 672 L187 670 L193 683 L212 690 L224 706 L246 720 Z\"/><path d=\"M246 720 L254 695 L252 675 L259 655 L251 641 L257 624 L245 616 L244 598 L220 597 L194 597 L193 616 L185 625 L191 640 L190 655 L198 673 L194 692 L191 715 L191 715 L194 692 L198 673 L212 659 L217 647 L230 642 L228 636 L234 647 L215 645 L197 647 L203 639 L198 647 L212 652 L211 666 L225 680 L230 699 L246 720 Z\"/><path d=\"M246 720 L261 698 L266 679 L280 664 L279 649 L292 643 L287 634 L295 640 L279 639 L257 644 L260 631 L258 635 L270 639 L275 651 L289 664 L292 682 L294 703 L294 703 L292 682 L289 664 L297 646 L296 633 L303 618 L295 610 L291 590 L263 594 L241 599 L243 615 L232 624 L239 640 L232 654 L239 674 L237 695 L246 720 Z\"/><path d=\"M246 720 L267 704 L278 686 L298 677 L302 662 L319 662 L319 650 L329 657 L327 646 L328 654 L332 643 L334 649 L348 645 L357 653 L375 659 L383 674 L391 692 L391 692 L383 674 L375 659 L376 639 L368 626 L364 607 L348 603 L335 587 L318 596 L298 591 L289 610 L270 615 L268 636 L253 649 L253 672 L244 693 L246 720 Z\"/><path d=\"M246 720 L270 713 L286 701 L306 699 L317 688 L333 693 L342 682 L354 691 L364 681 L372 691 L386 684 L396 693 L414 693 L428 703 L449 709 L462 726 L475 745 L475 745 L462 726 L449 709 L443 687 L430 672 L421 652 L403 647 L389 630 L369 634 L350 623 L332 636 L311 634 L298 652 L279 659 L269 680 L253 695 L246 720 Z\"/><path d=\"M246 720 L267 721 L282 716 L299 721 L313 716 L326 725 L339 719 L350 731 L365 727 L375 739 L393 739 L405 752 L424 758 L439 772 L461 783 L475 802 L488 823 L488 823 L475 802 L461 783 L454 759 L440 742 L431 721 L413 712 L401 693 L381 690 L366 676 L346 680 L328 671 L310 681 L291 681 L275 695 L258 703 L246 720 Z\"/><path d=\"M246 720 L231 710 L215 709 L197 704 L182 712 L162 711 L149 725 L129 730 L119 749 L100 759 L93 781 L76 796 L70 821 L58 842 L54 869 L41 893 L29 918 L29 918 L41 893 L54 869 L74 852 L88 832 L108 820 L118 802 L137 794 L145 777 L162 773 L170 758 L185 757 L193 743 L207 742 L218 731 L231 729 L246 720 Z\"/><path d=\"M246 720 L241 704 L232 694 L224 682 L211 680 L198 673 L185 681 L171 683 L163 697 L150 707 L146 725 L135 741 L132 763 L125 785 L123 812 L115 840 L107 870 L107 870 L115 840 L123 812 L137 790 L146 768 L159 752 L165 736 L178 727 L183 715 L193 713 L196 705 L202 708 L207 702 L212 706 L223 706 L232 713 L246 720 Z\"/><path d=\"M246 720 L259 712 L267 705 L277 704 L282 700 L287 705 L291 702 L294 709 L303 711 L306 721 L318 729 L323 744 L335 759 L344 778 L356 799 L363 824 L370 852 L370 852 L363 824 L356 799 L354 774 L347 754 L345 734 L335 719 L331 703 L319 695 L313 682 L300 681 L288 674 L277 681 L265 684 L259 695 L250 705 L246 720 Z\"/><circle cx=\"246\" cy=\"726\" r=\"44\"/><circle cx=\"246\" cy=\"694\" r=\"32\"/><circle cx=\"246\" cy=\"664\" r=\"24\"/><circle cx=\"246\" cy=\"636\" r=\"16\"/><circle cx=\"226\" cy=\"762\" r=\"12\"/><circle cx=\"246\" cy=\"770\" r=\"12\"/><circle cx=\"266\" cy=\"758\" r=\"11\"/></g></svg>",
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M119 1200 L124 1186 L128 1172 L132 1157 L135 1143 L138 1129 L140 1115 L142 1101 L145 1088 L146 1074 L148 1060 L150 1047 L152 1033 L153 1020 L155 1006 L156 993 L158 980 L159 966 L161 953 L162 940 L164 927 L165 914 L167 901 L168 888 L170 876 L172 863 L173 850 L175 838 L177 825 L179 813 L181 800 L182 788 L184 776 L186 763 L188 751 L190 739 L192 727 L194 715 L196 704 L198 692 L199 680 L281 680 L279 692 L278 704 L277 715 L276 727 L275 739 L274 751 L273 763 L272 776 L271 788 L271 800 L270 813 L270 825 L269 838 L269 850 L269 863 L269 876 L269 888 L269 901 L269 914 L269 927 L270 940 L270 953 L271 966 L272 980 L273 993 L274 1006 L275 1020 L277 1033 L278 1047 L280 1060 L282 1074 L285 1088 L287 1101 L290 1115 L293 1129 L297 1143 L301 1157 L306 1172 L311 1186 L317 1200 Z M114 1200 L150 1170 L196 1190 L220 1200 Z M220 1200 L244 1192 L282 1176 L314 1200 Z M220 1200 L244 1194 L299 1184 L340 1200 Z\"/><path d=\"M180 820 L107 640 L141 640 L224 790 Z\"/><path d=\"M216 780 L294 610 L326 610 L256 750 Z\"/><path d=\"M-5 575 L13 569 L29 570 L47 566 L60 579 L75 585 L70 607 L54 605 L36 609 L23 596 L8 590 Z\"/><path d=\"M83 454 L107 460 L121 473 L143 481 L146 503 L157 520 L134 538 L120 525 L98 517 L95 495 L84 478 Z\"/><path d=\"M258 394 L272 416 L274 437 L284 458 L270 478 L265 499 L234 496 L233 475 L222 453 L236 434 L241 413 Z\"/><path d=\"M418 483 L413 505 L401 519 L394 540 L373 544 L357 554 L339 534 L351 519 L358 499 L379 495 L395 485 Z\"/><path d=\"M485 593 L472 606 L457 611 L443 622 L427 617 L411 617 L407 597 L422 592 L435 581 L452 586 L468 585 Z\"/><path d=\"M101 606 L120 598 L137 600 L155 595 L169 608 L185 615 L179 637 L162 636 L144 641 L130 628 L114 621 Z\"/><path d=\"M379 622 L365 635 L349 639 L335 650 L318 643 L301 643 L298 621 L314 617 L329 606 L346 612 L362 613 Z\"/><circle cx=\"238\" cy=\"714\" r=\"92\"/><circle cx=\"88\" cy=\"600\" r=\"74\"/><circle cx=\"158\" cy=\"544\" r=\"96\"/><circle cx=\"248\" cy=\"518\" r=\"104\"/><circle cx=\"334\" cy=\"556\" r=\"90\"/><circle cx=\"394\" cy=\"610\" r=\"70\"/><circle cx=\"198\" cy=\"630\" r=\"78\"/><circle cx=\"284\" cy=\"634\" r=\"74\"/><circle cx=\"128\" cy=\"662\" r=\"56\"/><circle cx=\"348\" cy=\"666\" r=\"54\"/><circle cx=\"238\" cy=\"464\" r=\"70\"/><circle cx=\"168\" cy=\"482\" r=\"56\"/><circle cx=\"312\" cy=\"486\" r=\"54\"/><circle cx=\"114\" cy=\"694\" r=\"38\"/><circle cx=\"192\" cy=\"710\" r=\"44\"/><circle cx=\"274\" cy=\"712\" r=\"40\"/><circle cx=\"354\" cy=\"690\" r=\"36\"/><circle cx=\"234\" cy=\"670\" r=\"48\"/></g></svg>",
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M131 1200 L137 1189 L142 1179 L146 1169 L150 1158 L153 1148 L156 1138 L159 1127 L162 1117 L164 1107 L166 1097 L168 1087 L169 1077 L171 1067 L172 1057 L173 1047 L174 1037 L175 1027 L175 1018 L176 1008 L176 998 L176 989 L176 979 L176 970 L176 960 L175 951 L175 942 L174 932 L173 923 L172 914 L171 905 L169 896 L166 887 L162 878 L157 869 L153 860 L150 851 L149 842 L150 833 L151 825 L152 816 L227 816 L233 825 L239 833 L245 842 L249 851 L250 860 L250 869 L250 878 L250 887 L250 896 L252 905 L253 914 L255 923 L257 932 L259 942 L261 951 L262 960 L264 970 L265 979 L266 989 L268 998 L269 1008 L270 1018 L271 1027 L272 1037 L273 1047 L274 1057 L275 1067 L276 1077 L277 1087 L278 1097 L280 1107 L281 1117 L283 1127 L285 1138 L287 1148 L289 1158 L292 1169 L295 1179 L299 1189 L303 1200 Z M123 1200 L156 1170 L198 1190 L220 1200 Z M220 1200 L242 1192 L277 1176 L306 1200 Z M220 1200 L242 1194 L293 1184 L330 1200 Z\"/><path d=\"M190 770 L210 773 L225 770 L241 777 L254 773 L266 784 L280 780 L289 793 L306 790 L315 804 L334 806 L345 821 L365 829 L380 844 L402 857 L416 878 L429 901 L429 901 L416 878 L402 857 L396 832 L383 813 L374 791 L357 779 L346 759 L326 754 L312 738 L291 740 L274 729 L255 738 L236 735 L220 747 L203 754 L190 770 Z\"/><path d=\"M190 770 L214 765 L230 755 L250 757 L261 747 L276 754 L286 745 L296 755 L308 746 L316 758 L332 753 L342 764 L362 767 L376 779 L399 788 L412 807 L425 829 L425 829 L412 807 L399 788 L394 764 L380 747 L372 725 L353 717 L341 698 L320 699 L302 685 L282 696 L261 690 L246 707 L226 712 L214 732 L198 746 L190 770 Z\"/><path d=\"M190 770 L212 756 L224 740 L243 733 L249 720 L264 723 L265 712 L273 721 L274 709 L275 718 L283 709 L287 717 L303 716 L313 727 L332 735 L342 754 L351 774 L351 774 L342 754 L332 735 L333 713 L324 698 L321 678 L305 672 L294 654 L275 659 L256 650 L243 667 L223 669 L218 690 L202 701 L200 724 L190 743 L190 770 Z\"/><path d=\"M190 770 L205 749 L211 730 L225 717 L224 703 L238 698 L232 691 L238 699 L220 696 L201 698 L207 688 L205 694 L219 699 L223 711 L238 725 L241 744 L244 767 L244 767 L241 744 L238 725 L245 707 L244 692 L251 677 L242 668 L242 650 L217 649 L191 650 L191 668 L178 676 L185 692 L177 706 L184 725 L182 745 L190 770 Z\"/><path d=\"M190 770 L199 745 L197 725 L204 705 L197 691 L204 675 L193 667 L195 650 L172 646 L144 643 L142 662 L134 671 L141 685 L140 698 L148 716 L145 734 L143 755 L143 755 L145 734 L148 716 L162 703 L166 692 L179 687 L177 683 L180 695 L158 691 L141 692 L149 686 L144 694 L157 701 L156 715 L170 729 L175 749 L190 770 Z\"/><path d=\"M190 770 L192 743 L183 723 L183 700 L169 687 L166 666 L148 661 L139 643 L119 648 L102 639 L89 655 L73 659 L70 677 L62 690 L63 710 L55 726 L47 744 L47 744 L55 726 L63 710 L81 704 L90 697 L104 700 L105 694 L110 706 L110 697 L108 708 L118 701 L118 713 L134 713 L139 728 L158 737 L169 754 L190 770 Z\"/><path d=\"M190 770 L183 746 L168 730 L158 709 L139 703 L126 684 L105 687 L88 674 L69 685 L49 681 L35 698 L17 703 L8 723 L-5 737 L-10 760 L-23 776 L-36 795 L-36 795 L-23 776 L-10 760 L11 753 L25 743 L43 744 L52 735 L66 742 L74 732 L84 742 L95 733 L104 744 L120 739 L131 750 L151 751 L166 763 L190 770 Z\"/><path d=\"M190 770 L178 753 L161 745 L146 731 L127 732 L109 722 L92 730 L72 726 L57 740 L37 743 L26 762 L8 771 L-1 792 L-14 809 L-21 832 L-35 851 L-48 872 L-48 872 L-35 851 L-21 832 L-0 821 L15 808 L34 802 L45 789 L63 789 L73 777 L88 781 L98 770 L111 775 L124 766 L137 771 L154 766 L170 771 L190 770 Z\"/><path d=\"M190 770 L205 779 L218 781 L228 792 L242 793 L250 806 L265 807 L272 823 L289 826 L297 843 L316 850 L326 868 L345 881 L359 899 L379 917 L391 940 L403 965 L403 965 L391 940 L379 917 L374 890 L363 869 L357 845 L341 830 L334 808 L315 798 L305 779 L285 775 L273 761 L253 762 L238 754 L220 759 L205 760 L190 770 Z\"/><path d=\"M190 770 L204 763 L213 756 L223 757 L228 752 L233 758 L239 755 L241 764 L251 765 L255 777 L268 786 L274 802 L287 818 L296 839 L310 861 L318 888 L325 917 L325 917 L318 888 L310 861 L308 835 L301 812 L298 791 L287 775 L284 757 L271 748 L264 734 L249 732 L237 724 L224 730 L211 732 L204 744 L194 754 L190 770 Z\"/><path d=\"M190 770 L186 755 L178 746 L172 734 L160 732 L149 725 L138 731 L125 733 L118 745 L107 754 L103 770 L94 784 L91 804 L85 824 L83 848 L76 872 L70 899 L70 899 L76 872 L83 848 L95 827 L103 808 L115 794 L120 779 L132 771 L135 761 L144 760 L146 753 L151 756 L155 751 L160 755 L169 755 L177 763 L190 770 Z\"/><circle cx=\"190\" cy=\"776\" r=\"44\"/><circle cx=\"190\" cy=\"744\" r=\"32\"/><circle cx=\"190\" cy=\"714\" r=\"24\"/><circle cx=\"190\" cy=\"686\" r=\"16\"/><circle cx=\"208\" cy=\"814\" r=\"12\"/><circle cx=\"188\" cy=\"820\" r=\"12\"/><circle cx=\"170\" cy=\"806\" r=\"11\"/></g></svg>",
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 440 1200\"><g fill=\"#0c1a0e\"><path d=\"M123 1200 L128 1187 L133 1174 L137 1161 L140 1149 L143 1136 L146 1124 L148 1111 L150 1098 L152 1086 L153 1074 L155 1061 L156 1049 L157 1037 L158 1025 L159 1013 L160 1001 L160 989 L161 977 L161 965 L162 953 L162 942 L163 930 L163 918 L163 907 L163 895 L164 884 L164 872 L164 861 L164 850 L164 839 L164 828 L164 816 L163 805 L163 795 L163 784 L162 773 L161 762 L161 751 L160 741 L159 730 L242 730 L243 741 L244 751 L246 762 L247 773 L249 784 L250 795 L251 805 L253 816 L254 828 L255 839 L257 850 L258 861 L259 872 L261 884 L262 895 L264 907 L265 918 L267 930 L268 942 L270 953 L271 965 L273 977 L274 989 L276 1001 L278 1013 L279 1025 L281 1037 L283 1049 L285 1061 L287 1074 L289 1086 L292 1098 L294 1111 L297 1124 L300 1136 L303 1149 L307 1161 L311 1174 L315 1187 L320 1200 Z M114 1200 L150 1170 L196 1190 L220 1200 Z M220 1200 L244 1192 L282 1176 L314 1200 Z M220 1200 L244 1194 L299 1184 L340 1200 Z\"/><path d=\"M214 870 L297 680 L331 680 L258 840 Z\"/><path d=\"M182 830 L116 650 L148 650 L222 800 Z\"/><path d=\"M430 634 L417 648 L402 654 L389 666 L372 661 L356 663 L351 642 L365 636 L379 624 L396 628 L412 627 Z\"/><path d=\"M344 508 L343 532 L333 549 L330 571 L309 579 L295 592 L273 574 L283 557 L286 535 L307 527 L321 514 Z\"/><path d=\"M166 448 L184 466 L190 486 L204 505 L195 527 L194 548 L164 552 L158 532 L144 513 L153 491 L153 471 Z\"/><path d=\"M10 542 L32 543 L48 552 L69 555 L77 575 L90 588 L73 609 L57 600 L37 597 L29 578 L16 564 Z\"/><path d=\"M-49 649 L-33 642 L-18 642 L-1 637 L12 647 L27 651 L23 672 L8 671 L-8 677 L-22 666 L-36 662 Z\"/><path d=\"M328 660 L314 674 L299 680 L285 693 L267 688 L251 689 L245 667 L261 661 L275 649 L293 654 L309 652 Z\"/><path d=\"M52 679 L68 669 L84 668 L101 661 L116 671 L131 674 L129 696 L114 697 L97 704 L82 694 L67 691 Z\"/><circle cx=\"198\" cy=\"764\" r=\"92\"/><circle cx=\"338\" cy=\"656\" r=\"72\"/><circle cx=\"272\" cy=\"598\" r=\"94\"/><circle cx=\"182\" cy=\"570\" r=\"102\"/><circle cx=\"96\" cy=\"610\" r=\"88\"/><circle cx=\"40\" cy=\"664\" r=\"68\"/><circle cx=\"232\" cy=\"682\" r=\"76\"/><circle cx=\"146\" cy=\"686\" r=\"72\"/><circle cx=\"302\" cy=\"714\" r=\"54\"/><circle cx=\"82\" cy=\"718\" r=\"52\"/><circle cx=\"192\" cy=\"520\" r=\"68\"/><circle cx=\"262\" cy=\"540\" r=\"56\"/><circle cx=\"118\" cy=\"542\" r=\"52\"/><circle cx=\"316\" cy=\"742\" r=\"36\"/><circle cx=\"238\" cy=\"758\" r=\"42\"/><circle cx=\"156\" cy=\"760\" r=\"38\"/><circle cx=\"78\" cy=\"738\" r=\"34\"/><circle cx=\"200\" cy=\"718\" r=\"46\"/></g></svg>",
];

const SHADOW_TREE_URLS = SHADOW_TREE_SVGS.map(
  (svg) => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');





function buildNpcs(token) {
  NPCS.forEach((npc) => {
    // Reset per-load runtime state so replaying an act starts clean.
    npc.stage = 0;
    npc.nearSoundOn = false;

    // An NPC that starts hidden stays hidden until its flag is set.
    // Checking the flag here rather than only on reveal means a
    // reloaded save rebuilds the world in the right state without
    // the engine knowing which NPC belongs to which act.
    npc.hidden = npcShouldHide(npc);

    const el = document.createElement("div");
    el.className = "entity";
    el.id = "npc-" + npc.id;
    // Block 57. An NPC may be drawn at its own height (the horse, the
    // apple tree), like a decoration's displayHeight. Its body is still
    // NPC_WIDTH wide; only the picture changes size.
    const npcHeight = npc.displayHeight || DISPLAY_HEIGHT;
    mountBody(el, npc.x, NPC_WIDTH, npcHeight);
    if (npc.hidden) el.style.display = "none";

    if (npc.scenery) {
      // Block 69. Something in the backdrop that can be used (the apple
      // tree, which is one of the shadow trees): a body to reach and a
      // label, and no picture, so no placeholder box either.
      world.appendChild(el);
    } else if (npc.animation) {
      // Animated sprite sheet, same system and display size as the player.
      const spriteEl = document.createElement("div");
      spriteEl.className = "sprite npc-sprite npc-anim-sprite";
      el.appendChild(spriteEl);
      world.appendChild(el);
      setupNpcAnimation(npc.animation, spriteEl, npcHeight, token, NPC_WIDTH);
      // Block 99. Kept for updateNpcFacing; the art faces right.
      npc.spriteEl = spriteEl;
      npc.drawnFacing = 1;
    } else {
      // Static image, falling back to a placeholder box showing the
      // expected filename if the file is missing. An <img> cannot
      // display text, so on error it is swapped for a real div.
      const img = document.createElement("img");
      img.className = "sprite npc-sprite";
      img.src = assetUrl(npc.img);
      img.alt = npc.label;
      // A static image has no measured feet, so it is centred on the
      // body, the same assumption an unmeasured sheet gets.
      img.style.left = "0px"; // .npc-sprite is NPC_WIDTH wide until it loads
      img.onload = () => {
        img.style.left = (NPC_WIDTH - img.offsetWidth) / 2 + "px";
      };
      img.onerror = () => {
        const placeholder = document.createElement("div");
        placeholder.className = "sprite npc-sprite";
        // Same box every other character gets. 80 by 112 was written
        // here before anything else used a placeholder, and it left
        // Macario a head taller than every NPC and guard on screen.
        bodyPlaceholder(placeholder, npc.img, DISPLAY_HEIGHT, NPC_WIDTH);
        img.replaceWith(placeholder);
      };
      el.appendChild(img);
      world.appendChild(el);
    }

    actElements.push(el);
  });
}

function buildDecorations(token) {
  ((currentScene && currentScene.decorations) || []).forEach((dec) => {
    const el = document.createElement("div");
    el.className = "entity";
    el.id = "dec-" + dec.id;
    // A decoration has no body, so its x is simply where it stands: a
    // zero-width box, with the art's feet on it.
    mountBody(el, dec.x, 0, dec.displayHeight || DISPLAY_HEIGHT);
    // Block 35. A decoration may start hidden, for a character who walks on
    // later in a scripted scene (showDecoration), and may be mirrored.
    dec.currentX = dec.x;
    if (dec.hidden) el.style.display = "none";

    const spriteEl = document.createElement("div");
    spriteEl.className = "sprite npc-sprite npc-anim-sprite";
    if (dec.facing === -1) spriteEl.style.transform = "scaleX(-1)";
    el.appendChild(spriteEl);
    world.appendChild(el);

    // Block 40. A decoration with walkOnly steps its sheet only while
    // moveDecoration is carrying it, so a walk cycle stands still when he
    // does instead of walking on the spot.
    dec.moving = false;
    dec.spriteEl = spriteEl;
    setupNpcAnimation(
      dec.animation,
      spriteEl,
      dec.displayHeight || DISPLAY_HEIGHT,
      token,
      0,
      dec.walkOnly ? { playing: () => dec.moving } : undefined
    );

    // Block 53. A decoration with both an idle sheet (animation) and a
    // walk sheet (walkAnimation) shows the walk only while moveDecoration
    // is carrying it, the same two-sprites-in-one-body swap an enemy's
    // attack sheet uses: both are built once, and a walk only changes
    // which one is displayed.
    dec.walkSpriteEl = null;
    if (dec.walkAnimation) {
      const walkEl = document.createElement("div");
      walkEl.className = "sprite npc-sprite npc-anim-sprite";
      walkEl.style.display = "none";
      if (dec.facing === -1) walkEl.style.transform = "scaleX(-1)";
      el.appendChild(walkEl);
      dec.walkSpriteEl = walkEl;
      setupNpcAnimation(dec.walkAnimation, walkEl, dec.displayHeight || DISPLAY_HEIGHT,
        token, 0, { playing: () => dec.moving });
    }

    actElements.push(el);
    decorationEls.push(el);
  });
}

// --- Fallback checks for CSS-only background images -----------------------
// The skyline and ground tiles are set purely in CSS and
// are not act-specific, so they are checked once here rather than inside
// loadAct. Each is preloaded only to detect a 404 and substitute a
// labelled placeholder fill.
function checkBackgroundImage(el, src, label) {
  // Block 62. Through loadImage, so it is retried and counted too.
  loadImage(src).then((img) => {
    if (img) return;
    el.style.backgroundImage = "none";
    el.style.backgroundColor = "#333";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.color = "#ffd54f";
    el.style.fontSize = "14px";
    el.style.border = "2px dashed #ffd54f";
    el.textContent = label;
  });
}

checkBackgroundImage(
  document.getElementById("skyline"),
  "assets/backgrounds/act1/street-01.jpg",
  "assets/backgrounds/act1/street-01.jpg"
);
checkBackgroundImage(
  document.getElementById("ground-tiles"),
  "assets/backgrounds/act1/ground-lupa.jpg",
  "assets/backgrounds/act1/ground-lupa.jpg"
);

// opts (Block 40), all optional:
//   playing()  the animation steps only while this returns true, and is
//              held on its first frame otherwise, restarting from it each
//              time it turns true again. A walk cycle for someone who is
//              standing still, or an attack played once per swing.
//   loop       false holds the last frame instead of wrapping.
//   frameAt()  (Block 73) the caller picks the frame, given the time,
//              and the sheet's own clock is not used: a guard's shot,
//              whose flash has to land on the frame the bullet leaves.
function setupNpcAnimation(sheet, el, displayHeight, token, bodyWidth, opts) {
  displayHeight = displayHeight || DISPLAY_HEIGHT;
  bodyWidth = bodyWidth || 0;
  opts = opts || {};
  let frame = 0;
  let lastTime = 0;
  let wasPlaying = true;
  // Block 99. A loop that runs by itself (an idle, a breath) starts on a
  // random frame and runs a little faster or slower than its fps, so
  // people standing together do not move in step. A sheet whose frame
  // means something (a walk that starts with the step, a swing, a shot,
  // a flinch) keeps its exact timing.
  const free = !opts.frameAt && !opts.playing && opts.loop !== false;
  const rate = free ? 1 - NPC_RATE_SPREAD + Math.random() * 2 * NPC_RATE_SPREAD : 1;

  loadSpriteSheet(sheet).then(() => {
    // The act may have changed while this image was loading.
    if (token !== undefined && token !== actLoadToken) return;

    if (sheet.failed) {
      bodyPlaceholder(el, sheet.src, displayHeight, bodyWidth);
      return;
    }

    // Grid aware, matching the player. The first multi-row sheet
    // delivered would otherwise render at the wrong scale and walk off
    // the right edge of the image.
    const columns = sheet.columns || sheet.frames;
    const fit = bodySprite(el, sheet, displayHeight, bodyWidth);

    const draw = () => {
      const column = frame % columns;
      const row = Math.floor(frame / columns);
      el.style.backgroundPositionX = -(column * fit.displayFrameWidth) + "px";
      el.style.backgroundPositionY = -(row * fit.rowStep + fit.topOffset) + "px";
    };
    if (free && sheet.frames > 1) {
      frame = Math.floor(Math.random() * sheet.frames);
      draw();
    }

    npcAnimators.push({
      update(now) {
        if (opts.frameAt) {
          const next = Math.max(0, Math.min(sheet.frames - 1, opts.frameAt(now) | 0));
          if (next !== frame) { frame = next; draw(); }
          return;
        }
        if (opts.playing) {
          const playing = Boolean(opts.playing(now));
          if (!playing) {
            // Written once on the change, not every frame (Block 36).
            if (wasPlaying || frame !== 0) { frame = 0; draw(); }
            wasPlaying = false;
            return;
          }
          if (!wasPlaying) {
            wasPlaying = true;
            frame = 0;
            lastTime = now;
            draw();
            return;
          }
        }
        const frameDuration = 1000 / (sheet.fps * rate);
        if (now - lastTime >= frameDuration) {
          lastTime = now;
          if (opts.loop === false && frame === sheet.frames - 1) return;
          frame = (frame + 1) % sheet.frames;
          draw();
        }
      },
    });
  });
}

// Reveals every hidden NPC whose revealedByFlag is now set. Called
// after a story beat fires and again after a save is restored.
//
// This replaced two hardcoded checks for npc.id === "katipunan",
// which put Act I content knowledge inside the engine and meant
// every later act would need its own copy of the same three lines.
function revealNpcsByFlag() {
  refreshNpcVisibility();
}

// Block 58. Whether an NPC is hidden, from the flags alone: one that
// startsHidden until its revealedByFlag is set, or one that leaves the
// story once its hiddenByFlag is set (the people of the jobs, gone after
// the years pass). Read by buildNpcs, so a reload rebuilds the street in
// the right state, and by refreshNpcVisibility, which content calls when
// the change should happen in front of the student (under a black card).
function npcShouldHide(npc) {
  if (npc.hiddenByFlag && state.flags[npc.hiddenByFlag]) return true;
  // Block 85. Away for a stretch of the story and back after it
  // ({ requiresFlag, unlessFlag }, read as a guard's duty is): the
  // Mananahi at the play, away from her shop until the years pass.
  if (npc.hiddenWhile && guardOnDuty(npc.hiddenWhile)) return true;
  return Boolean(npc.startsHidden) && !state.flags[npc.revealedByFlag];
}

function refreshNpcVisibility() {
  NPCS.forEach((npc) => {
    const hide = npcShouldHide(npc);
    if (hide === Boolean(npc.hidden)) return;
    npc.hidden = hide;
    const el = document.getElementById("npc-" + npc.id);
    if (el) el.style.display = hide ? "none" : "";
  });
}

// =============================================================
// TERRAIN
//
// Two surfaces exist. The stage ramp, which predates all of this and
// is a continuous height function of x, and scene platforms, which are
// discrete rectangles. floorHeightAt covers the first; platforms are
// resolved separately because landing on one depends on falling onto
// it rather than merely standing at that x.
// =============================================================

function floorHeightAt() {
  return GROUND_LEVEL;
}

// The highest platform top at x that the player is at or above. Only
// consulted while descending, which is what makes platforms one-way:
// a jump from below passes through and lands on top.
function platformTopUnder(x, fromY) {
  let best = null;
  const centre = x + PLAYER_WIDTH / 2;

  PLATFORMS.forEach((plat) => {
    if (centre < plat.x || centre > plat.x + plat.width) return;
    const top = plat.y;
    if (fromY < top - 1) return; // still below it, keep rising through
    if (best === null || top > best) best = top;
  });

  return best;
}

// The surface the player should rest on at x, given where they are now.
function groundHeightAt(x, fromY) {
  const floor = floorHeightAt(x);
  if (fromY === undefined) return floor;

  const plat = platformTopUnder(x, fromY);
  return plat !== null && plat > floor ? plat : floor;
}

// --- Player sprite animation ---------------------------------------------
const playerSpriteEl = player.querySelector(".player-sprite");
// #player's box is his body. Its left is written every frame in the game
// loop; its size never changes.
mountBody(player, 0, PLAYER_WIDTH);

// columns is how many frames sit across one row of the sheet. Omit it
// for a plain single-row strip and it defaults to the frame count.
// Macario_Walking.png is a full 5 by 4 grid, 20 frames across 5 columns.
// Macario_Idle.png is a 5 + 5 + 5 + 1 grid, 16 frames across 5 columns.
// Both are real commissioned art, delivered this session, and live in
// assets/sprites/player (not assets/ directly) alongside any other sprite that
// is not specific to one act; see CLAUDE.md, Decisions on record.
// fps is carried over unchanged from the placeholder sheets these
// replace; it has not been checked against a phone yet.
//
// contentTop and contentHeight are measured from each sheet's own alpha
// channel (the union of every frame's non-transparent bounding box, in
// native pixels within the 256px cell), not eyeballed — see spriteFit,
// above loadSpriteSheet. Without them Macario's idle pose rendered
// visibly smaller than his walk cycle, both floated well above the
// ground, and neither matched an animated NPC like Nanay, because all
// of them were being scaled and grounded by the empty space in their
// frame rather than by the character actually drawn in it.
// The sheets Macario wears with nothing equipped. An outfit replaces
// whichever of the three it declares and leaves the rest alone, so a
// cosmetic that only redraws the walk cycle is a complete outfit.
const BASE_SPRITE_SHEETS = {
  idle: {
    src: "assets/sprites/player/macario-idle.png", frames: 16, fps: 6, columns: 5,
    contentTop: 73, contentHeight: 106, footX: 130,
  },
  walk: {
    src: "assets/sprites/player/macario-walk.png", frames: 20, fps: 12, columns: 5,
    contentTop: 60, contentHeight: 127, footX: 126,
  },

  // Block 28. The redrawn shooting sheet: 5 by 3, 12 of its 15 cells,
  // played as two named views of the one image through startFrame and
  // endFrame (see Sprite sheets in CLAUDE.md). Frames 0-2 are the aim,
  // held on frame 2 while the button stays down. Frames 3-11 are the shot:
  // the muzzle flash is frame 3, then the recoil lifts the pistol and
  // brings it back down, played once at the instant the projectile
  // leaves. The fire clip starts ON the flash frame, so the flash and the
  // projectile appear together.
  //
  // contentTop/contentHeight are the union across all twelve frames, which
  // includes the pistol raised in recoil; a tighter pair would crop the
  // gun off the top of the box in frames 5-7. footX is from the feet, as
  // always. muzzle is the pistol's tip in frame 2, in the same native cell
  // pixels, and is where throwProjectile starts the shot.
  shootAim: {
    src: "assets/sprites/player/macario-shoot.png", frames: 12, fps: 8, columns: 5,
    startFrame: 0, endFrame: 2, loop: false,
    contentTop: 63, contentHeight: 126, footX: 117,
  },
  shootFire: {
    src: "assets/sprites/player/macario-shoot.png", frames: 12, fps: 18, columns: 5,
    startFrame: 3, endFrame: 11, loop: false,
    contentTop: 63, contentHeight: 126, footX: 117,
    muzzle: { x: 178, y: 87 },
  },

  // Block 27. The one-tap melee swing: a 4 by 3 sheet, 12 frames, played
  // once per tap (playMelee). 24fps puts the whole punch at half a second,
  // quick enough that a second tap never feels ignored. The file is a PNG
  // with transparency that happens to carry a .jpg name; browsers read the
  // bytes, not the extension, so it is referenced as delivered. The punch
  // dips about ten native pixels at full extension (frames 5 to 10), which
  // is the lunge in the art rather than a size error, so one
  // contentTop/contentHeight pair is right for it.
  //
  // Block 71. contact is the frame the fist lands on, and the hit is
  // resolved there rather than on release (updateMeleeContact). Measured
  // with measure-sprite.js: the drawing's right edge is 116 at frame 3,
  // then 134, 147, 160 and 161, so frame 6 is the first at full reach.
  melee: {
    src: "assets/sprites/player/macario-melee.png", frames: 12, fps: 24, columns: 4,
    loop: false, contact: 6,
    contentTop: 47, contentHeight: 109, footX: 96,
  },

  // Block 35. The jump: a 4 by 3 sheet, 9 frames. 0-2 crouch, 3 pushes
  // off, 4-6 are in the air, 7 comes down, 8 lands. The crouch is not
  // played: waiting for it before leaving the ground would put a delay
  // on a jump the student expects the instant they press. Three views of
  // the one image, chosen in the game loop from his vertical speed rather
  // than from time, so a short hop and a long fall both look right.
  //
  // This artist drew the jump's height INTO the cell: the tucked frames sit
  // 40 to 50 native pixels above the feet of the standing ones. The engine
  // already moves Macario up and down, so drawing that offset as well
  // would put him twice as high as his body. frameBottoms, one per frame
  // and measured with measure-sprite.js, puts each frame's own feet on the
  // ground of his body instead. contentHeight is the push-off frame's
  // height (3), which is a standing figure, so he is the same size in the
  // air as on the ground.
  jumpRise: {
    src: "assets/sprites/player/macario-jump.png", frames: 9, fps: 14, columns: 4,
    startFrame: 3, endFrame: 6, loop: false,
    contentTop: 44, contentHeight: 102, footX: 106,
    frameBottoms: [146, 146, 146, 145, 108, 95, 96, 120, 145],
  },
  jumpFall: {
    src: "assets/sprites/player/macario-jump.png", frames: 9, fps: 14, columns: 4,
    startFrame: 7, endFrame: 7, loop: false,
    contentTop: 44, contentHeight: 102, footX: 106,
    frameBottoms: [146, 146, 146, 145, 108, 95, 96, 120, 145],
  },
  jumpLand: {
    src: "assets/sprites/player/macario-jump.png", frames: 9, fps: 14, columns: 4,
    startFrame: 8, endFrame: 8, loop: false,
    contentTop: 44, contentHeight: 102, footX: 106,
    frameBottoms: [146, 146, 146, 145, 108, 95, 96, 120, 145],
  },
};

// The set actually in use. Reassigned by setOutfit, which is why this is
// a let; everything that draws the player reads it rather than the base.
let SPRITE_SHEETS = BASE_SPRITE_SHEETS;

// Sprite art does not fill its frame edge to edge. Every sheet in this
// project sits in a 256px-tall cell, but how much of that cell the artist
// actually drew the character into varies a lot sheet to sheet — Nanay's
// drawing fills about two thirds of hers, Macario's idle pose barely
// two fifths of his. Scaling every sheet so its FULL FRAME is
// DISPLAY_HEIGHT tall (what this used to do unconditionally) therefore
// rendered a different apparent character height per sheet, and left
// every one of them floating above the ground by however much empty
// space sits below the feet, because the box's bottom edge is the
// bottom of the FRAME, not the bottom of the drawing.
//
// A sheet may declare contentTop and contentHeight, in the sheet's own
// native pixels, to say where the drawn character actually sits inside
// its frame. These are measured from the real art's alpha channel
// (union of the non-transparent bounding box across every frame, so no
// pose gets clipped), not eyeballed, and are not something this engine
// derives on its own — a new sheet needs them measured the same way
// before it will line up with the others. spriteFit turns those two
// numbers into a scale that makes the CHARACTER, not the frame,
// DISPLAY_HEIGHT tall, plus the background-position shift that puts its
// feet at the box's bottom edge. A sheet with neither field falls back
// to the old behaviour exactly (contentTop 0, contentHeight the full
// frameHeight), which is what keeps every sheet nobody has measured yet
// — cosmetics with no art, the test harness's own fixtures — rendering
// exactly as it always has.
function spriteFit(sheet, displayHeight) {
  const contentHeight = sheet.contentHeight || sheet.frameHeight;
  // Block 40. headroom is native pixels ABOVE contentTop still to be
  // shown, for a pose that reaches over the head (a raised sword). The
  // character is still sized by contentHeight, so he stays the height of
  // everyone else; the element just grows upward to show the reach.
  const headroom = Math.min(sheet.headroom || 0, sheet.contentTop || 0);
  const contentTop = (sheet.contentTop || 0) - headroom;
  const scale = displayHeight / contentHeight;
  return {
    scale,
    boxHeight: displayHeight + headroom * scale,
    displayFrameWidth: sheet.frameWidth * scale,
    // The scaled distance from one row to the next in the background
    // image. Equal to displayHeight only in the no-correction case
    // (contentHeight === frameHeight); otherwise the scaled frame is
    // taller than the box it is cropped into, and stepping by
    // displayHeight instead of this would land on the wrong row.
    rowStep: sheet.frameHeight * scale,
    topOffset: contentTop * scale,
    // Where the character's feet stand, in rendered px from the sprite
    // element's own left edge. footX is measured the same way as
    // contentTop (_dev/tools/measure-sprite.js), from the feet rather than the
    // whole drawing, because an extended arm widens a drawing on one side
    // only. Absent, the middle of the cell, which is where an artist
    // centres a character by default and where every unmeasured sheet
    // (outfits with no art, the harness fixtures) is assumed to stand.
    footOffset: (typeof sheet.footX === "number" ? sheet.footX : sheet.frameWidth / 2) * scale,
  };
}

// Sizes a sprite element for a sheet and stands it on a body. The element
// is absolutely positioned inside its .entity, whose own box IS the body
// (left = x, width = the body width, see mountBody), so putting the feet
// at bodyWidth / 2 is all it takes for the art to stand where the logic
// stands. transform-origin is set to the same point so that facing left,
// a scaleX(-1), mirrors the character about his own feet instead of
// about the middle of a 300px cell, which would throw him sideways by
// however far the feet sit from that middle every time he turned.
//
// The one function every animated character goes through: the player
// (applyAnim), NPCs, guards and decorations (setupNpcAnimation). A
// second copy of this arithmetic anywhere is how the two drifted apart
// in the first place.
function bodySprite(el, sheet, displayHeight, bodyWidth) {
  const fit = spriteFit(sheet, displayHeight);
  el.style.width = fit.displayFrameWidth + "px";
  el.style.height = fit.boxHeight + "px";
  el.style.left = bodyWidth / 2 - fit.footOffset + "px";
  el.style.transformOrigin = fit.footOffset + "px 100%";
  // Quoted: an unquoted CSS url() breaks on the first space in the path,
  // and assets/sprites/characters/nanay.png has one. Without the quotes this silently
  // no-ops (backgroundImage stays "none") even though the preload
  // already succeeded and computed real frame geometry.
  el.style.backgroundImage = `url("${assetUrl(sheet.src)}")`;
  el.style.backgroundSize =
    sheet.naturalWidth * fit.scale + "px " + sheet.naturalHeight * fit.scale + "px";
  el.style.backgroundPositionY = -fit.topOffset + "px";
  el.style.backgroundPositionX = "0px";
  // Small pixel art scaled up several times is smeared into a blur by
  // the browser's default smoothing. Horse.png is a 32px cell drawn at
  // about four and a half times that. Every other sheet in this project
  // is painted at 256px and scaled DOWN or barely up (Macario's idle is
  // 1.26), where nearest-neighbour would only add jagged edges, so the
  // switch is made on the scale itself rather than declared per sheet:
  // a new sheet gets the right treatment without anyone remembering a
  // field. 2 is the point where a source pixel is at least two screen
  // pixels wide and smoothing starts to show as blur.
  el.style.imageRendering = fit.scale >= 2 ? "pixelated" : "";
  return fit;
}

// The placeholder box, stood on a body the same way: centred on it, and
// flipped about its own middle.
function bodyPlaceholder(el, filename, displayHeight, bodyWidth) {
  const width = Math.round(displayHeight * 0.7);
  showPlaceholder(el, filename, width, displayHeight);
  el.style.left = (bodyWidth - width) / 2 + "px";
  el.style.transformOrigin = "50% 100%";
}

// Makes an .entity element's box the body itself. Its children are drawn
// relative to this box and may overhang it freely; the box is what the
// camera, the debugging eye and the harness can trust to be where the
// logic thinks the character is.
function mountBody(el, x, bodyWidth, height) {
  el.style.left = x + "px";
  el.style.width = bodyWidth + "px";
  el.style.height = (height || DISPLAY_HEIGHT) + "px";
}

function loadSpriteSheet(def) {
  // Block 62. Through loadImage, so a sheet is retried on a bad
  // connection and counted by the title screen's bar. Still resolves,
  // never rejects, so Promise.all never hangs on a missing sheet.
  return loadImage(def.src).then((img) => {
    if (!img) {
      def.failed = true;
      return def;
    }
    def.naturalWidth = img.naturalWidth;
    def.naturalHeight = img.naturalHeight;

    // Grid geometry. A single-row strip is just the case where
    // columns equals frames and rows works out to 1, so this stays
    // backward compatible with every existing sheet.
    const columns = def.columns || def.frames;
    def.frameWidth = img.naturalWidth / columns;
    def.rows = Math.ceil(def.frames / columns);
    def.frameHeight = img.naturalHeight / def.rows;

    def.failed = false;
    return def;
  });
}

// Turns any element into a dashed placeholder box showing the missing
// filename. Used whenever an expected image or sprite sheet fails to load.
function showPlaceholder(el, filename, width, height) {
  el.style.backgroundImage = "none";
  el.style.width = width + "px";
  el.style.height = height + "px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.textAlign = "center";
  el.style.padding = "4px";
  el.style.boxSizing = "border-box";
  el.style.border = "2px dashed #ffd54f";
  el.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  el.style.color = "#ffd54f";
  el.style.fontSize = "11px";
  el.style.lineHeight = "1.3";
  el.style.overflowWrap = "break-word";
  el.textContent = filename;
  // Block 37. Marked so a rule that mirrors real art for facing (a guard
  // turning, style.css) can leave a box of text readable.
  el.classList.add("sprite-placeholder");
}

// Undo showPlaceholder's inline styles so a real sprite renders cleanly.
function clearPlaceholder(el) {
  el.classList.remove("sprite-placeholder");
  el.textContent = "";
  el.style.display = "";
  el.style.border = "";
  el.style.backgroundColor = "";
  el.style.color = "";
  el.style.fontSize = "";
  el.style.padding = "";
}

let spritesReady = false;
let currentAnim = "idle";
let currentFrame = 0;
let lastFrameTime = 0;
let facing = 1; // 1 = facing right, -1 = facing left

Promise.all([
  loadSpriteSheet(SPRITE_SHEETS.idle),
  loadSpriteSheet(SPRITE_SHEETS.walk),
  loadSpriteSheet(SPRITE_SHEETS.shootAim),
  loadSpriteSheet(SPRITE_SHEETS.shootFire),
  loadSpriteSheet(SPRITE_SHEETS.melee),
  loadSpriteSheet(SPRITE_SHEETS.jumpRise),
  loadSpriteSheet(SPRITE_SHEETS.jumpFall),
  loadSpriteSheet(SPRITE_SHEETS.jumpLand),
]).then(() => {
  spritesReady = true;
  applyAnim(currentAnim, true);
});

// Swaps the player's sheets for an outfit's, or back to the base set when
// passed nothing. inventory.js is the only caller.
//
// A sheet that fails to load is NOT special-cased. It goes through the same
// dashed placeholder every other missing image in this project goes
// through, showing the filename it wanted, which is how the artist finds
// out what to draw. Hiding an outfit until its art exists would mean two
// behaviours for one situation.
async function setOutfit(sheets) {
  const next = Object.assign({}, BASE_SPRITE_SHEETS);

  if (sheets) {
    ["idle", "walk"].forEach((name) => {
      if (sheets[name] && sheets[name].src) next[name] = sheets[name];
    });
  }

  SPRITE_SHEETS = next;

  // loadSpriteSheet caches its geometry onto the def, so re-loading the
  // base sheets costs a cache hit and nothing else. It resolves rather
  // than rejects on a missing file, so this never hangs.
  await Promise.all([
    loadSpriteSheet(next.idle),
    loadSpriteSheet(next.walk),
  ]);

  spritesReady = true;
  applyAnim(currentAnim, true);
}

// Block 85. A worn outfit with no art of its own (the stage clothes) may
// name a stand-in tint, a CSS filter on Macario's sprite, so a student
// can see he is wearing something. null clears it. One element, set when
// the outfit changes, never in the loop. inventory.js is the only caller.
function setOutfitTint(filter) {
  if (!playerSpriteEl) return;
  playerSpriteEl.style.filter = filter || "";
  player.classList.toggle("outfit-tinted", Boolean(filter));
}

function applyAnim(name, force) {
  if (!spritesReady) return;
  if (currentAnim === name && !force) return;
  currentAnim = name;

  const sheet = SPRITE_SHEETS[name];
  // startFrame lets a sheet declare it plays a sub-range of a larger
  // image (see shootAim/shootFire above) rather than always starting at
  // frame 0. Absent, this is exactly frame 0, as every sheet before them
  // behaved.
  currentFrame = sheet.startFrame || 0;
  lastFrameTime = 0;

  if (sheet.failed) {
    bodyPlaceholder(playerSpriteEl, sheet.src, DISPLAY_HEIGHT, PLAYER_WIDTH);
    return;
  }

  clearPlaceholder(playerSpriteEl);

  // The character, not the frame, is DISPLAY_HEIGHT tall with its feet on
  // the ground (spriteFit), and those feet stand on the middle of his body
  // (bodySprite). Each sheet carries its own footX, so switching from idle
  // to walk to the shooting pose never slides him sideways.
  bodySprite(playerSpriteEl, sheet, DISPLAY_HEIGHT, PLAYER_WIDTH);
  // Draw the clip's own first frame now. bodySprite leaves the picture on
  // frame 0, which for a clip that starts later in its sheet (the fire
  // clip at 3, the jump at 3) showed the wrong pose for one frame tick,
  // long enough to see on a jump.
  drawPlayerFrame(sheet);
}

// Positions the background on currentFrame. frameBottoms, when a sheet
// has it, grounds each frame by its own feet (see jumpRise, above).
function drawPlayerFrame(sheet) {
  const columns = sheet.columns || sheet.frames;
  const column = currentFrame % columns;
  const row = Math.floor(currentFrame / columns);
  const fit = spriteFit(sheet, DISPLAY_HEIGHT);
  let topOffset = fit.topOffset;
  if (Array.isArray(sheet.frameBottoms) && typeof sheet.frameBottoms[currentFrame] === "number") {
    const contentHeight = sheet.contentHeight || sheet.frameHeight;
    topOffset = (sheet.frameBottoms[currentFrame] + 1 - contentHeight) * fit.scale;
  }
  playerSpriteEl.style.backgroundPositionX = -(column * fit.displayFrameWidth) + "px";
  playerSpriteEl.style.backgroundPositionY = -(row * fit.rowStep + topOffset) + "px";
}

function updateAnimFrame(now) {
  if (!spritesReady) return;
  const sheet = SPRITE_SHEETS[currentAnim];

  // A missing sheet has no frames to step, but the placeholder box
  // should still face the right way, so the flip below is not skipped.
  if (!sheet.failed) {
    // Block 63. A run steps the walk cycle faster, in step with the feet.
    const rate = currentAnim === "walk" ? 1 + (RUN_SPEED / SPEED - 1) * runBlend : 1;
    const frameDuration = 1000 / (sheet.fps * rate);

    if (now - lastFrameTime >= frameDuration) {
      lastFrameTime = now;

      // A sheet may declare startFrame/endFrame to play only part of
      // itself (see shootAim/shootFire, above BASE_SPRITE_SHEETS).
      // Absent, this is 0 and frames - 1, exactly the old behaviour.
      const startFrame = sheet.startFrame || 0;
      const endFrame = sheet.endFrame != null ? sheet.endFrame : sheet.frames - 1;

      if (sheet.loop === false) {
        if (currentFrame < endFrame) currentFrame++;
        // else hold on endFrame
      } else {
        currentFrame = currentFrame + 1 > endFrame ? startFrame : currentFrame + 1;
      }

      // Frame index to grid position. For a 5-column Walk sheet,
      // frame 5 wraps to column 0 of row 1 rather than running off
      // the right edge of the image.
      drawPlayerFrame(sheet);
    }
  }

  // Flip to face the direction of travel. Written only when it changes:
  // an inline style set to the value it already has still marks the
  // element for a style recalculation, every frame (Block 66).
  if (facing !== lastDrawnFacing) {
    playerSpriteEl.style.transform = `scaleX(${facing})`;
    lastDrawnFacing = facing;
  }
}

let lastDrawnFacing = null;

let posX = 0;
let posY = GROUND_LEVEL; // distance from the bottom of the world, in px
let velY = 0;
let onGround = true;

let health = maxHealth;
let invulnUntil = 0; // timestamp; damage before this is ignored

// --- Measurement ---------------------------------------------------------
// Per-act counters. The engine counts; acts.js reads them through
// Game.stats() and writes them to act_progress. game.js still knows
// nothing about what an act is, which is the point.
//
// Unlike health, these are PERSISTED, inside game_progress.save_state.
// Health is a moment-to-moment resource and restoring it on load is a
// kindness. These are a record, and a student who closes the tab halfway
// through an act and resumes later would otherwise restart both counters
// at zero, making their survival and stealth terms read perfect for the
// half they replayed. On a shared classroom phone that is not an edge
// case, and the whole point of these numbers is that they are trusted.
let damageTaken = 0;
let detections = 0;
let playMs = 0; // unpaused, unblocked play time

// --- Currency ------------------------------------------------------------
// Lives here because game.js is the only writer of game_progress, and
// currency is save state exactly like quests, flags and position. acts.js
// awards it and inventory.js spends it, both through the facade; neither
// touches the column.
//
// Client written, per the decision on record. A student with the console
// open can set it to anything, which is acceptable because it buys
// cosmetics only and touches nothing the teacher dashboard reports. That
// belongs in the documentation rather than in a defence nobody asked for.
let currency = 0;

let currentRoom = "road"; // the current scene id, persisted as-is
let authGated = true; // true until the player is logged in
let inDialogue = false;
let cutscenePlaying = false; // locks movement for the whole stage sequence
let scriptWalking = false; // Block 57: movePlayer is carrying him
// What was last written to the player element, so an unmoved frame writes
// nothing (Block 36).
let lastDrawnX = null;
let lastDrawnY = null;
let lastCameraX = null;
// Block 60. A blow shakes the camera for a moment (shakeCamera) and can
// freeze the world for a few frames first (hitStop). Up here with the
// camera's own state, since the loop reads both every frame.
let shakeUntil = 0;
let shakeMs = 0;
let shakeMag = 0;
let lastShakeX = 0;
let lastShakeY = 0;
let hitStopUntil = 0;

// Raised while acts.js or assessment.js has a full-screen overlay up.
// Kept separate from cutscenePlaying so a trivia card or a test does
// not read as a cutscene to the animation code, which deliberately
// leaves the current sprite alone during one.
let uiBlocked = false;

function setUiBlocked(value) {
  uiBlocked = Boolean(value);
}
let dialogueStep = 0;
let activeNpc = null;
let activeSet = null;
let activeMode = null; // "npc" | "gift" | "arrival"
let nearby = { type: null, ref: null };

const blackout = document.getElementById("blackout");

// The pre-login backdrop. enterGameAsUser() reloads whichever act
// game_progress.current_act names once the student is known; until
// then the auth overlay covers this entirely.
loadAct(window.ACT_1);

const keysPressed = {};

document.addEventListener("keydown", (e) => {
  const key = (e.key || "").toLowerCase();
  const wasDown = keysPressed[key];
  keysPressed[key] = true;

  // Block 85. Not on autorepeat: holding E used to fire it thirty times a
  // second and skip every line, read or not. A hold now fast-forwards
  // only through lines already read (updateFastForward).
  if (key === "e" && !wasDown) handleInteractPress();

  // Guarded on wasDown so holding a key does not re-fire on autorepeat.
  if (!wasDown && (key === " " || key === "w" || key === "arrowup")) {
    e.preventDefault();
    handleJumpPress();
  }

  if (!wasDown && key === "j") startAttackHold();
});

document.addEventListener("keyup", (e) => {
  if ((e.key || "").toLowerCase() === "j") endAttackHold();
});

function handleJumpPress() {
  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;
  // Single jump, no double jump by decision. Block 63: "on the ground"
  // includes the moment just after walking off a ledge (coyote time),
  // and a press in the air is remembered briefly and taken on landing
  // (the jump buffer). Neither lets a jump start from a jump.
  const now = performance.now();
  const coyote = velY <= 0 && lastGroundedAt && now - lastGroundedAt <= COYOTE_MS;
  if (!onGround && !coyote) {
    jumpBufferedAt = now;
    return;
  }
  jumpBufferedAt = 0;
  lastGroundedAt = 0; // spent: the coyote window cannot give a second jump
  velY = JUMP_VELOCITY;
  onGround = false;
  noteTask("jump");
  playSfx("jump"); // Block 58
  spawnDust(posX + PLAYER_WIDTH / 2, posY, facing, "jump"); // Block 63
}

document.addEventListener("keyup", (e) => {
  keysPressed[(e.key || "").toLowerCase()] = false;
});

// --- Mobile controls ---
function bindHold(button, key) {
  const start = (e) => {
    e.preventDefault();
    keysPressed[key] = true;
  };
  const end = (e) => {
    e.preventDefault();
    keysPressed[key] = false;
  };
  button.addEventListener("touchstart", start);
  button.addEventListener("touchend", end);
  button.addEventListener("touchcancel", end);
  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", end);
  button.addEventListener("mouseleave", end);
}

bindHold(btnLeft, "a");
bindHold(btnRight, "d");

const btnJump = document.getElementById("btn-jump");
const btnAttack = document.getElementById("btn-attack");

if (btnJump) {
  const jump = (e) => {
    e.preventDefault();
    handleJumpPress();
  };
  btnJump.addEventListener("touchstart", jump, { passive: false });
  btnJump.addEventListener("mousedown", jump);
}

// Attack is press-and-release rather than click, because the hold
// duration is what chooses between a swing and a throw.
if (btnAttack) {
  const down = (e) => {
    e.preventDefault();
    startAttackHold();
  };
  const up = (e) => {
    e.preventDefault();
    endAttackHold();
  };
  btnAttack.addEventListener("touchstart", down, { passive: false });
  btnAttack.addEventListener("touchend", up);
  btnAttack.addEventListener("touchcancel", up);
  btnAttack.addEventListener("mousedown", down);
  btnAttack.addEventListener("mouseup", up);
  btnAttack.addEventListener("mouseleave", up);
}

btnInteract.addEventListener("click", (e) => {
  e.preventDefault();
  handleInteractPress();
});
btnInteract.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    interactTouchHeld = true; // Block 85, for a held fast-forward
    handleInteractPress();
  },
  { passive: false }
);

giftBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (nearby.type === "npc" && nearby.ref.gift && canGiveGift(nearby.ref)) {
    startGift(nearby.ref);
  }
});

// --- Interaction / dialogue ---
// The empty space between two entities' own bounding boxes, given each
// one's left-edge anchor and width, rather than the raw distance
// between the anchors themselves — 0 once they overlap, never
// negative. Comparing anchors directly (the player's posX against an
// NPC's npc.x) used to be what findNearby did, and since the player
// is 40px wide (PLAYER_WIDTH) and an NPC is roughly 80 (NPC_WIDTH),
// that quietly needed a different amount of walking depending on
// which side Macario approached from: from the left, npc.x is past
// the NPC's own far edge, so the anchor-to-anchor distance undercounts
// how close he already is and the prompt appears early, well before
// contact; from the right, npc.x is the NPC's NEAR edge, so the same
// math overcounts the gap and nothing happens until Macario's own body
// has all but swallowed the NPC's — which is what made it feel like
// interaction only worked "from the far right" of a thing. Measuring
// the gap between the boxes themselves removes the direction from the
// answer entirely.
function edgeGap(aX, aWidth, bX, bWidth) {
  const aCentre = aX + aWidth / 2;
  const bCentre = bX + bWidth / 2;
  return Math.max(0, Math.abs(aCentre - bCentre) - (aWidth + bWidth) / 2);
}

function findNearby() {
  let closest = null;
  let closestType = null;
  let closestDist = Infinity;

  // Block 48. Nobody to talk to mid-fight: the moro-moro's Maryam is an
  // NPC now, standing in the middle of it.
  const talkable = enemiesAlive() ? [] : NPCS;
  for (const npc of talkable) {
    if (npc.hidden) continue;
    const dist = edgeGap(posX, PLAYER_WIDTH, npc.x, NPC_WIDTH);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = npc;
      closestType = "npc";
      closestDist = dist;
    }
  }

  // Block 34. Doorways to another scene. An exit is a zone on the road,
  // x and width like a hazard, reached the same edge-to-edge way an NPC
  // is, so standing at the stairs of the entablado is enough.
  // No way out mid-fight (Block 35): walking out would unload the enemies
  // and the fight with them.
  const exits = enemiesAlive() ? [] : (currentScene && currentScene.exits) || [];
  for (const exit of exits) {
    // Block 37. An exit may wait on a story flag: the road out of tondo
    // opens only once the Katipunan has given Macario somewhere to go.
    if (exit.requiresFlag && !state.flags[exit.requiresFlag]) continue;
    const dist = edgeGap(posX, PLAYER_WIDTH, exit.x, exit.width || 80);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = exit;
      closestType = "exit";
      closestDist = dist;
    }
  }

  return { type: closestType, ref: closest };
}

function canGiveGift(npc) {
  const gift = npc.gift;
  if (!gift) return false;
  if (!state.flags[gift.requiresFlag]) return false;
  if (state.flags[gift.givenFlag]) return false;
  // Block 89. A gift that is money waits until he has it.
  if (gift.requiresCurrency && currency < gift.requiresCurrency) return false;
  return true;
}

// Set by shell.js, the only thing that knows how to open the shop
// screen (Shell._openShop). Content marks an NPC opensShop: true (a
// Tindero, say) to skip dialogue entirely and ask for the shop
// instead; the engine does not know what a shop is, only that
// something wants to hear about this, the same shape Inventory.onChange
// already uses in the other direction.
let shopRequestListener = null;

// sellerId is the NPC's id, so a shop can stock only what that seller
// sells (Inventory.forSale). The corner button passes none.
function requestShop(sellerId) {
  if (shopRequestListener) shopRequestListener(sellerId || null);
}

// Block 32. An NPC may open the shop from the start (opensShop: true,
// Tindero) or only once a flag is set (opensShopAfter, the Mananahi,
// who talks first and sells afterwards).
function npcOpensShop(npc) {
  if (!npc) return false;
  if (npc.opensShop) return true;
  return Boolean(npc.opensShopAfter && state.flags[npc.opensShopAfter]);
}

function handleInteractPress() {
  if (authGated || uiBlocked) return;
  if (!inDialogue && !cutscenePlaying && nearby.type) noteTask("interact");
  if (inDialogue) {
    advanceDialogue();
  } else if (cutscenePlaying) {
    // ignore E while the performance or blackout sequence runs
  } else if (nearby.type === "npc" && npcOpensShop(nearby.ref)) {
    requestShop(nearby.ref.id);
  } else if (nearby.type === "npc" && typeof nearby.ref.onInteract === "function") {
    // Block 57. Something to use rather than someone to talk to (the
    // apple tree): content decides what pressing E does, the way a
    // gift's onComplete does. No dialogue box is opened for it here.
    nearby.ref.onInteract();
  } else if (nearby.type === "npc") {
    startDialogue(nearby.ref);
  } else if (nearby.type === "exit" && window.Acts) {
    const exit = nearby.ref;
    // Block 95: the test room and its exits back (Block 74) are gone.
    Acts.gotoScene(exit.toScene, { x: exit.toX, facing: exit.toFacing });
  }
}

function startDialogue(npc) {
  activeNpc = npc;
  activeMode = "npc";
  let setIndex = Math.min(npc.stage, npc.dialogueSets.length - 1);
  // Block 31. buildNpcs resets stage to 0 on every scene load, which is
  // right for a scene seen once and wrong for one the story comes back
  // to: returning to tondo after the flashback replayed Nanay's opening
  // errand. A set whose skipIfFlag is already true is a beat that has
  // happened, so conversation starts past it. Read from the flags rather
  // than stored on the NPC, so a reload lands on the same set.
  while (
    setIndex < npc.dialogueSets.length - 1 &&
    npc.dialogueSets[setIndex].skipIfFlag &&
    state.flags[npc.dialogueSets[setIndex].skipIfFlag]
  ) {
    setIndex++;
  }
  // Block 48. A set may also wait on a flag (requiresFlag). An NPC that
  // declares one picks its set from the flags alone, each time: the first
  // set that is neither passed (skipIfFlag) nor still waiting
  // (requiresFlag), else the last. That lets someone say one thing
  // before a step of the story and another after it, whichever order
  // the student meets them in, without a conversation moving him on.
  if (npc.dialogueSets.some((d) => d.requiresFlag)) {
    const i = npc.dialogueSets.findIndex((d) =>
      !(d.skipIfFlag && state.flags[d.skipIfFlag]) &&
      !(d.requiresFlag && !state.flags[d.requiresFlag]));
    setIndex = i === -1 ? npc.dialogueSets.length - 1 : i;
  }
  npc.stage = setIndex;
  activeSet = npc.dialogueSets[setIndex];
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function startGift(npc) {
  activeNpc = npc;
  activeMode = "gift";
  activeSet = { lines: npc.gift.responseLines };
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

// The speaker stands on the box: Macario on the left, anyone else on
// the right, head to chest with no frame. The picture is the first frame of a sheet the scene already
// has (an NPC's or decoration's own, else the player's idle), drawn by
// bodySprite like everything else; a speaker with no art, or art still
// owed, simply has no portrait.
const PORTRAIT_HEIGHT = 400; // the whole figure, of which the frame shows the head and chest
const PORTRAIT_WIDTH = 170;  // the frame
const PORTRAIT_MIN_SOURCE = 90; // native px tall; below this, no bust (Block 93)
const portraitLeft = document.getElementById("dialogue-portrait-left");
const portraitRight = document.getElementById("dialogue-portrait-right");
let drawnPortrait = { sheet: null, side: null };

function portraitSheetFor(speaker) {
  const name = String(speaker || "").replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase();
  if (name === "macario") return { side: "left", sheet: SPRITE_SHEETS.idle };
  const npc = NPCS.find((n) => n.animation && n.label && n.label.toLowerCase() === name);
  if (npc) return { side: "right", sheet: npc.animation };
  const decorations = (currentScene && currentScene.decorations) || [];
  const id = name === "siga" || name === "mga siga" ? "siga-1" : name;
  const dec = decorations.find((d) => d.animation && d.id === id);
  return { side: "right", sheet: dec ? dec.animation : null };
}

function drawDialoguePortrait(speaker) {
  const { side, sheet } = portraitSheetFor(speaker);
  if (sheet === drawnPortrait.sheet && side === drawnPortrait.side) return;
  drawnPortrait = { sheet, side };
  portraitLeft.classList.remove("shown");
  portraitRight.classList.remove("shown");
  if (!sheet) return;
  const box = side === "left" ? portraitLeft : portraitRight;
  loadSpriteSheet(sheet).then(() => {
    if (drawnPortrait.sheet !== sheet || sheet.failed) return;
    // Block 93. A sheet drawn small (the soldiers' walk, which the Sultan
    // borrows, 70 native pixels tall) is blown up nearly six times for a
    // bust and reads as a smear; better no portrait than that.
    if ((sheet.contentHeight || sheet.frameHeight) < PORTRAIT_MIN_SOURCE) return;
    const sprite = document.createElement("div");
    sprite.className = "portrait-sprite";
    bodySprite(sprite, sheet, PORTRAIT_HEIGHT, PORTRAIT_WIDTH);
    if (side === "right") sprite.style.transform = "scaleX(-1)";
    box.replaceChildren(sprite);
    box.classList.add("shown");
  });
}

function showDialogueStep() {
  const line = activeSet.lines[dialogueStep];
  drawDialoguePortrait(line.speaker);
  dialogueSpeaker.textContent = line.speaker;
  dialogueText.textContent = line.text;
  // Block 58, the blip. Block 85: a line may name its own sound instead
  // (line.sfx, one of SFX_SOURCES), for a crowd that cheers.
  playSfx(line.sfx && SFX_SOURCES[line.sfx] ? line.sfx : "blip");
  dialogueLineWasRead = noteLineRead(line);
}

// =============================================================
// Block 85. Lines already read, for fast-forwarding. Holding E, the
// interact button or the dialogue box moves through lines this save has
// shown before, one every FAST_FORWARD_STEP_MS, after FAST_FORWARD_AFTER_MS
// of holding; it stops at the first line never read. A replay after a
// failed post-test, or a reload mid-scene, is where it helps; a first
// reading is still one tap a line, since the dialogue is the lesson.
// Kept as short hashes in state.flags.__nabasa, an "__" flag so a replay
// keeps it (acts.js, replayAct).
// =============================================================
const FAST_FORWARD_AFTER_MS = 450;
const FAST_FORWARD_STEP_MS = 140;
let dialogueLineWasRead = false;
let advanceHeldSince = 0;
let lastFastAdvance = 0;
let interactTouchHeld = false;
let dialoguePointerHeld = false;

function lineKey(line) {
  const s = (line.speaker || "") + "|" + (line.text || "");
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// Records the line and says whether it had been read before.
function noteLineRead(line) {
  if (!Array.isArray(state.flags.__nabasa)) state.flags.__nabasa = [];
  if (!noteLineRead.set || noteLineRead.list !== state.flags.__nabasa) {
    noteLineRead.list = state.flags.__nabasa;
    noteLineRead.set = new Set(noteLineRead.list);
  }
  const key = lineKey(line);
  if (noteLineRead.set.has(key)) return true;
  noteLineRead.set.add(key);
  noteLineRead.list.push(key);
  saveDirty = true; // the next save carries it; no redraw needed
  return false;
}

function updateFastForward(now) {
  const held = inDialogue && (keysPressed["e"] || interactTouchHeld || dialoguePointerHeld);
  if (!held) {
    advanceHeldSince = 0;
    return;
  }
  if (!advanceHeldSince) advanceHeldSince = now;
  if (now - advanceHeldSince < FAST_FORWARD_AFTER_MS) return;
  if (!dialogueLineWasRead || now - lastFastAdvance < FAST_FORWARD_STEP_MS) return;
  lastFastAdvance = now;
  advanceDialogue();
}

function advanceDialogue() {
  dialogueStep++;
  if (dialogueStep >= activeSet.lines.length) {
    endDialogue();
  } else {
    showDialogueStep();
  }
}

function endDialogue() {
  const finishedMode = activeMode;
  const finishedNpc = activeNpc;
  const finishedSet = activeSet;

  inDialogue = false;
  dialogueBox.classList.add("hidden");
  drawnPortrait = { sheet: null, side: null };

  if (finishedMode === "gift") {
    const gift = finishedNpc.gift;
    playSfx("give"); // Block 58
    state.flags[gift.givenFlag] = true;
    markDirty();
    if (gift.completesQuest) completeQuest(gift.completesQuest);
    // Same shape as a dialogueSet's onComplete, one step later: a gift
    // can end an errand (a scene change, say) exactly the way finishing
    // a conversation already can. Optional — most gifts so far have had
    // nothing further to do once the flag and the quest were set.
    if (gift.onComplete) gift.onComplete();
  } else if (finishedMode === "npc") {
    if (finishedSet.onComplete) {
      finishedSet.onComplete();
      if (finishedNpc.stage < finishedNpc.dialogueSets.length - 1) {
        finishedNpc.stage++;
      }
    }
    // The conversation that sets an opensShopAfter flag ends straight
    // into the shop, so "pay me first" is followed by somewhere to pay
    // rather than by a second press of E.
    if (finishedNpc.opensShopAfter && state.flags[finishedNpc.opensShopAfter]) {
      requestShop(finishedNpc.id);
    }
  } else if (finishedMode === "script") {
    const resolve = finishedSet.resolve;
    if (resolve) setTimeout(resolve, 0); // after the state below is cleared
  } else if (finishedMode === "arrival") {
    // Set on the way OUT, not in: a reload mid-conversation should hear
    // it again rather than lose it.
    if (finishedSet.doneFlag) state.flags[finishedSet.doneFlag] = true;
    markDirty();
    if (finishedSet.onComplete) finishedSet.onComplete();
  }

  activeNpc = null;
  activeSet = null;
  activeMode = null;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// teleportToNewRoom() and hideActWorld() lived here. Both existed
// only to serve the placeholder Act I ending, which faded to black
// and left the player in an empty room with no interactables and no
// way out. Acts.showTransition() replaces that, so both are gone
// rather than kept as dead code. Saves written by the old ending are
// migrated in applyLoadedState().

// A plain scene-to-scene move under cover of black, for content that
// wants the fade without the stage's poem/death machinery around it.
// Reuses the one #blackout element rather than inventing a second
// blackout mechanism. Acts.gotoScene calls this rather than
// loadScene directly.
//
// cutscenePlaying is set for the duration so movement, jumping,
// attacking and interacting are all suppressed the same way they
// already are for the stage sequence (see handleInteractPress,
// handleJumpPress, canAct in the game loop, and playerIsSafe) — a
// scene swap mid-stride would otherwise be visible for a frame on
// either side of the blackout, and an interact press during the fade
// could fire against a scene that is no longer the one on screen. The
// same defensive clear respawnInScene already does
// is repeated here, since a fade can just as easily start with the
// attack button held down as either of those can.
// Block 78. How long a scene change's black holds before it says what it
// is waiting for. It no longer gives up (SCENE_ART_WAIT_MS, 8 seconds,
// until Block 78); with the whole act asked for up front it rarely waits
// at all.
const SCENE_ART_NOTE_MS = 2000;

// Block 78. A line on the scene change's black while it waits for art,
// with how much has arrived, and every waiting picture tried again at
// once when it first shows.
function blackoutProgress(on) {
  const note = document.getElementById("blackout-note");
  if (!note) return;
  const draw = (p) => {
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 100;
    note.textContent = "Inihahanda ang mga larawan... " + pct + "%";
  };
  if (on) {
    retryAssets();
    draw(assetProgress());
    blackoutProgress.listener = draw;
    assetProgressListeners.push(draw);
    note.classList.add("shown");
  } else {
    const i = assetProgressListeners.indexOf(blackoutProgress.listener);
    if (i !== -1) assetProgressListeners.splice(i, 1);
    blackoutProgress.listener = null;
    note.classList.remove("shown");
  }
}

async function fadeToScene(sceneId, placement) {
  cutscenePlaying = true;
  attackHoldStart = 0;
  shooting = null;
  dash = null;
  clearTimeout(shootFireTimer);

  blackout.classList.add("visible");
  // Block 84. Silent, at the proponent's direction: the swoosh (Block
  // 58's "door") did not fit a fade to black. The file stays for now.
  await wait(900); // fade to black

  loadScene(sceneId); // swap while hidden behind black

  // Block 62. The black holds until the new scene's pictures are in, so
  // a student never walks into a room whose backdrop and people are
  // still downloading. Since Block 78 it is not capped (it gave up after
  // 8 seconds before): a picture that exists is waited for, and after
  // SCENE_ART_NOTE_MS the black says so (blackoutProgress).
  const noteTimer = setTimeout(() => blackoutProgress(true), SCENE_ART_NOTE_MS);
  await whenAssetsSettled();
  clearTimeout(noteTimer);
  blackoutProgress(false);

  // Block 34. Where to stand in the new scene when it is not its startX:
  // coming back out of the entablado lands at its door, not at the far
  // end of the road. An arrival dialogue's own x, below, still wins.
  if (placement && typeof placement.x === "number") {
    posX = Math.max(0, Math.min(placement.x, WORLD_WIDTH - PLAYER_WIDTH));
    posY = groundHeightAt(posX);
    velY = 0;
  }
  if (placement && (placement.facing === 1 || placement.facing === -1)) {
    facing = placement.facing;
  }

  // Block 31. Chosen and placed while the screen is still black, so a
  // student never sees Macario jump from the scene's startX to where the
  // conversation needs him.
  const arrival = pendingArrival(currentScene);
  if (!arrival) placeForSceneScript(pendingSceneScript(currentScene));
  if (arrival && typeof arrival.x === "number") {
    posX = Math.max(0, Math.min(arrival.x, WORLD_WIDTH - PLAYER_WIDTH));
    posY = groundHeightAt(posX);
    velY = 0;
    if (arrival.facing === 1 || arrival.facing === -1) facing = arrival.facing;
  }

  await wait(400); // hold black briefly
  blackout.classList.remove("visible");

  // Each scene's own music, or Calm (Block 35), so a fight's track never
  // follows him out of the room it was fought in.
  setMusic(sceneTrack(currentScene)); // Block 85: a night may have its own

  await wait(900); // fade back in
  cutscenePlaying = false;

  // After the fade-in rather than during it, so the first line is read
  // against the scene it belongs to and not against black.
  if (arrival) startArrivalDialogue(arrival);
  // Block 52. A scene script plays through a fade too, when no arrival
  // conversation has claimed the moment.
  else runSceneScript();
}

// A scene's arrivalDialogues are conversations that open by themselves
// when the scene is entered through a fade, with nobody to talk to: a
// voice in a memory, or a reply the moment the memory ends. The first
// entry whose requiresFlag is set (or that has none) and whose doneFlag
// is not yet set is the one that plays. doneFlag is what makes it once
// only, and it lives in state.flags, so it survives a reload the way an
// objective does.
function pendingArrival(scene) {
  const list = (scene && scene.arrivalDialogues) || [];
  return list.find((a) =>
    (!a.requiresFlag || state.flags[a.requiresFlag]) &&
    !(a.doneFlag && state.flags[a.doneFlag]) &&
    !(a.unlessFlag && state.flags[a.unlessFlag]) &&
    Array.isArray(a.lines) && a.lines.length
  ) || null;
}

// =============================================================
// SCENE SCRIPTS (Block 52)
//
// A scene's scripts are cutscenes that play by themselves, written in
// content as an async function out of the Block 35 calls (playDialogue,
// setCutscene, moveDecoration and the rest). They differ from
// arrivalDialogues in one way that matters: they also play on a login or
// reload into the scene, once the title, trivia and pre-test are out of
// the way, because an act's opening is a script and a student meeting
// the act for the first time arrives by logging in, not through a fade.
//
//   scripts: [{ requiresFlag, unlessFlag, doneFlag, x, facing, run }]
//
// The first entry whose requiresFlag is set (or that has none), whose
// unlessFlag and doneFlag are not, is the one that plays. doneFlag is set
// when run() resolves, not when it starts, so a student who reloads in
// the middle watches it again from the top rather than landing past a
// scene they never saw. x and facing place Macario before it starts
// (under the blackout, through a fade). A script that changes scene
// should call Acts.gotoScene without awaiting it as its last step, or
// its doneFlag lands only after the next scene has already begun.
// =============================================================

const sceneScriptsRunning = new Set();

function pendingSceneScript(scene) {
  const list = (scene && scene.scripts) || [];
  return list.find((s) =>
    typeof s.run === "function" &&
    !sceneScriptsRunning.has(s) &&
    (!s.requiresFlag || state.flags[s.requiresFlag]) &&
    !(s.doneFlag && state.flags[s.doneFlag]) &&
    !(s.unlessFlag && state.flags[s.unlessFlag])
  ) || null;
}

function placeForSceneScript(entry) {
  if (!entry) return;
  if (typeof entry.x === "number") {
    posX = Math.max(0, Math.min(entry.x, WORLD_WIDTH - PLAYER_WIDTH));
    posY = groundHeightAt(posX);
    velY = 0;
  }
  if (entry.facing === 1 || entry.facing === -1) facing = entry.facing;
}

async function runSceneScript() {
  const entry = pendingSceneScript(currentScene);
  if (!entry) return;
  placeForSceneScript(entry);
  sceneScriptsRunning.add(entry);
  // The script owns setCutscene. It is not cleared here on the way out,
  // because a script that ends by starting a fade has already handed the
  // flag to fadeToScene, and clearing it would free Macario mid-fade.
  try {
    await entry.run();
    // Set even when the script ended by leaving the scene: the beat
    // has happened either way.
    if (entry.doneFlag) {
      state.flags[entry.doneFlag] = true;
      markDirty();
    }
  } catch (err) {
    console.error("Scene script failed:", err);
  } finally {
    sceneScriptsRunning.delete(entry);
    renderQuests(); // Block 93: the way out, once the student is free
  }
}

// Called once from each entry path, after the world has been handed to
// the student: from here on a change of step is news worth announcing,
// and the scene the student landed in may have a script waiting.
function enterWorldScripts() {
  questAnnounceReady = true;
  if (currentActData && currentActData.linearObjectives) renderQuests();
  runSceneScript();
}

function startArrivalDialogue(arrival) {
  activeNpc = null;
  activeMode = "arrival";
  activeSet = arrival;
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

// =============================================================
// SCENE FURNITURE
// =============================================================

function buildPlatforms() {
  PLATFORMS.forEach((plat, i) => {
    const el = document.createElement("div");
    el.className = "platform";
    el.id = "plat-" + i;
    el.style.left = plat.x + "px";
    el.style.width = plat.width + "px";
    el.style.bottom = plat.y + "px";
    el.style.height = "14px";
    world.appendChild(el);
    actElements.push(el);
  });
}

function buildHideSpots() {
  HIDE_SPOTS.forEach((spot, i) => {
    const el = document.createElement("div");
    el.className = "hide-spot";
    el.id = "hide-" + i;
    el.style.left = spot.x + "px";
    el.style.width = spot.width + "px";
    world.appendChild(el);
    actElements.push(el);
  });
}

// Block 76. A placed enemy may name a type from the enemy catalogue
// (window.ENEMY_TYPES, content/enemies.js): the type's fields come
// first and the placement's own win over them. A placement with no type
// is used as it stands, which is how every act before Block 76 still
// works. An unknown type, or a type of the other kind (a fighter put in
// a guards list), is said in the console and the placement used as it
// is, a placeholder box if it names no art. A hoisted declaration,
// because loadAct reaches buildGuards at parse time.
function withEnemyType(placed, kind) {
  if (!placed || !placed.type) return placed;
  const type = (window.ENEMY_TYPES || {})[placed.type];
  if (!type) {
    console.warn("Unknown enemy type: " + placed.type);
    return placed;
  }
  if (type.kind && type.kind !== kind) {
    console.warn("Enemy type " + placed.type + " is a " + type.kind + ", placed as a " + kind);
    return placed;
  }
  return Object.assign({}, type, placed);
}

// Guards carry their own runtime state, reset on every scene load so a
// respawn starts them where the level designer put them rather than
// wherever they happened to be standing.
// Block 85. A scene may turn to night for a stretch of its story:
// night: true, or night: { requiresFlag, unlessFlag, music }. The
// paintings and the road are darkened toward blue (style.css,
// .night-tint), the characters are not, so they stay readable; music,
// when given, is the scene's track while it is night. Read on every
// scene load and again when a save's flags arrive (refreshOnDuty).
function sceneNight(scene) {
  const n = scene && scene.night;
  if (!n) return null;
  if (n === true) return {};
  return guardOnDuty(n) ? n : null;
}

function sceneTrack(scene) {
  const night = sceneNight(scene);
  return (night && night.music) || (scene && scene.music) || null;
}

function applyNight(scene) {
  const on = Boolean(sceneNight(scene));
  document.getElementById("skyline").classList.toggle("night-tint", on);
  document.getElementById("ground-tiles").classList.toggle("night-tint", on);
}

// Also read for hide spots, which the same stretch of story brings.
function guardOnDuty(placed) {
  return (!placed.requiresFlag || Boolean(state.flags[placed.requiresFlag])) &&
    !(placed.unlessFlag && state.flags[placed.unlessFlag]);
}

// Block 81. The scene is built before a login's save arrives, so guards
// and crates placed for one stretch of the story are built again from
// the restored flags when the set on duty has changed (applyLoadedState).
// A scene change needs none of this: loadScene reads the flags as they
// are.
function refreshOnDuty() {
  const scene = currentScene;
  if (!scene) return;
  const want = (scene.guards || []).filter(guardOnDuty);
  const placed = GUARDS.filter((g) => !g.fight);
  if (want.map((g) => g.id).join(",") !== placed.map((g) => g.id).join(",")) {
    GUARDS.forEach((g) => { if (g.el) g.el.remove(); });
    buildGuards(actLoadToken);
  }
  const spots = (scene.hideSpots || []).filter(guardOnDuty);
  if (spots.length !== HIDE_SPOTS.length) {
    document.querySelectorAll("#world .hide-spot").forEach((el) => el.remove());
    HIDE_SPOTS = spots;
    buildHideSpots();
  }
  // Block 85. And the night, and its music, which a login into the
  // scene never reaches through a fade.
  applyNight(scene);
  if (sceneNight(scene) && sceneNight(scene).music) setMusic(sceneTrack(scene));
}

function buildGuards(token) {
  // The act number comes from the act data in hand, NOT from window.Acts.
  // loadAct runs at parse time to draw the backdrop behind the login box,
  // and acts.js has not executed yet at that point, so Acts.current would
  // be undefined on the first build and every guard would be created
  // unscaled.
  const speedScale = difficultyMultiplier(
    currentActData && currentActData.number
  );

  // Block 81. A guard may be placed for one stretch of the story only
  // (requiresFlag, unlessFlag), read when the scene is built, as an
  // exit's requiresFlag is read when it is reached: the pamphlet run
  // puts guardia civil on a street that has none the rest of the act.
  GUARDS = ((currentScene && currentScene.guards) || []).filter(guardOnDuty)
    .map((placed) => makeGuard(placed, speedScale));
  GUARDS.forEach((guard) => mountGuard(guard, token));
}

// One guard's state, from his placement: a scene's guards list, or a
// scripted fight (Block 88).
function makeGuard(placed, speedScale) {
  // Block 76. A guard placed by type takes the catalogue's fields
  // under his own (content/enemies.js).
  const def = withEnemyType(placed, "guard");
  return Object.assign({}, def, {
    kind: "guard",
    pos: def.x,
    baseSpeed: def.speed || 1.4,
    speed: (def.speed || 1.4) * speedScale,
    facing: def.facing || 1,
    // Kept separately because respawnInScene needs the facing the level
    // gave this guard, not the one it happened to be walking in. Without
    // it every guard resets to facing right, including the outpost
    // sentry the content deliberately faces left.
    facingStart: def.facing || 1,
    alert: 0,
    disabled: false,
    // Block 37. A guard that shoots fires once its meter fills instead
    // of catching, and then waits this long before it can fire again.
    nextShotAt: 0,
    // Block 38. A shooting guard who has seen Macario stays on him.
    hostile: false,
    hp: def.hp || GUARD_HP,
    maxHp: def.hp || GUARD_HP,
    chaseSpeed: GUARD_CHASE_SPEED * speedScale,
    // Block 73. Whether he moved this frame, and his aim (see
    // guardShootFrame): when he began bringing the rifle down, when he
    // last fired, and when he began raising it again.
    moving: false,
    aiming: false,
    aimSince: 0,
    shotAt: 0,
    lowerSince: 0,
    // Block 75. The slide after a blow, and the stagger.
    knockVel: 0,
    hitAt: 0,
    staggerUntil: 0,
    // What was last written to the page, so the loop writes only on a
    // change (Block 36).
    drawnFill: -1,
    drawnFacing: 0,
    drawnAlerted: null,
    drawnPose: "idle",
  });
}

// His body in the world, from his state.
function mountGuard(guard, token) {
  const el = document.createElement("div");
  el.className = "entity guard";
  el.id = "guard-" + guard.id;
  mountBody(el, guard.pos, GUARD_WIDTH);

  const meter = document.createElement("div");
  meter.className = "guard-meter";
  const fill = document.createElement("div");
  fill.className = "guard-meter-fill";
  meter.appendChild(fill);
  el.appendChild(meter);

  // Block 37. The ground he can see, drawn. Which way a guard faces and
  // how far he sees are the whole of the stealth rule, and neither was
  // visible before: a placeholder box has no front. The band starts at
  // the middle of his body and runs detectRadius, the same centre to
  // centre distance updateGuards measures, so the picture and the rule
  // are one number. It lies on the floor, so standing on a platform
  // above it reads as being out of his sight, which is what it is.
  const sight = document.createElement("div");
  sight.className = "guard-sight";
  sight.style.width = (guard.detectRadius || 240) + "px";
  el.appendChild(sight);

  if (guard.animation) {
    const sprite = document.createElement("div");
    sprite.className = "sprite npc-sprite npc-anim-sprite";
    el.appendChild(sprite);
    guard.spriteEl = sprite;
    // Block 73. A guard may bring a walk sheet, shown while he moves,
    // and a shoot sheet, shown while he aims and fires, beside his
    // standing one: three sprites in one body, only one displayed,
    // the way an enemy carries his attack sheet (Block 40). The shoot
    // sheet's frame is chosen by the shot itself (guardShootFrame),
    // not by a clock, so its flash lands on the frame the bullet
    // leaves.
    const extra = (sheet, opts) => {
      const extraEl = document.createElement("div");
      extraEl.className = "sprite npc-sprite npc-anim-sprite";
      extraEl.style.display = "none";
      el.appendChild(extraEl);
      setupNpcAnimation(sheet, extraEl, DISPLAY_HEIGHT, token, GUARD_WIDTH, opts);
      return extraEl;
    };
    world.appendChild(el);
    setupNpcAnimation(guard.animation, sprite, DISPLAY_HEIGHT, token, GUARD_WIDTH);
    guard.walkSpriteEl = guard.walkAnimation
      ? extra(guard.walkAnimation, { playing: () => guard.drawnPose === "walk" })
      : null;
    guard.shootSpriteEl = guard.shootAnimation
      ? extra(guard.shootAnimation, { frameAt: (now) => guardShootFrame(guard, now) })
      : null;
    // Block 75. His hit sheet, while he reels and as he falls.
    guard.hitSpriteEl = guard.hitAnimation
      ? extra(guard.hitAnimation, { frameAt: (now) => hitFrame(guard, now) })
      : null;
  } else {
    const sprite = document.createElement("div");
    sprite.className = "sprite npc-sprite";
    bodyPlaceholder(sprite, guard.img || "Guard", DISPLAY_HEIGHT, GUARD_WIDTH);
    el.appendChild(sprite);
    world.appendChild(el);
  }

  guard.el = el;
  guard.fillEl = fill;
  actElements.push(el);
}

// Hazards are drawn rather than invisible, for the same reason the hide
// spots are drawn as crates: a mechanic that has to be learned without a
// tutorial has to be visible before it is felt.
function buildHazards() {
  HAZARDS.forEach((hazard, i) => {
    const el = document.createElement("div");
    el.className = "hazard";
    el.id = "hazard-" + i;
    el.style.left = hazard.x + "px";
    el.style.width = hazard.width + "px";
    world.appendChild(el);
    actElements.push(el);
  });
}

// Pickups reuse the HUD heart shape rather than an image. Art is an
// external blocker on this project, and a pickup that renders as a
// dashed placeholder box teaches nothing.
function buildPickups() {
  PICKUPS.forEach((pickup) => {
    // A heart is per visit. Hints are laid by buildHints (Block 68).
    if (pickup.type === "hint") return;
    const el = document.createElement("div");
    el.className = "pickup pickup-" + (pickup.type || "heart");
    el.id = "pickup-" + pickup.id;
    el.style.left = pickup.x + "px";
    // y is optional and defaults to the floor, so a heart can be put on a
    // platform to make the jump worth using.
    el.style.bottom =
      (typeof pickup.y === "number" ? pickup.y : GROUND_LEVEL) + "px";
    world.appendChild(el);
    actElements.push(el);
    pickup.el = el;
    pickup.moving = undefined; // Block 64: updatePickupMotion decides
  });
}

function inHideSpot(x) {
  const centre = x + PLAYER_WIDTH / 2;
  return HIDE_SPOTS.some(
    (spot) => centre >= spot.x && centre <= spot.x + spot.width
  );
}

// =============================================================
// STEALTH
//
// Detection is a meter rather than a switch. A bar that is visibly
// filling is what teaches the mechanic; an instant catch teaches only
// that the level is unfair. No line of sight calculation, per the
// decision already on record: being in front and within radius is the
// whole test.
// =============================================================

// Block 37. Standing on a platform at least this high above the floor is
// out of a guard's sight. A guard watches the road, and a student who has
// climbed onto a roof or a stack of crates has left it. Only while standing
// there: in the middle of a jump he is still in view, or every hop would be
// a way through.
const GUARD_SIGHT_CLEARANCE = 60;

function aboveGuardSight() {
  return onGround && posY - floorHeightAt(posX) >= GUARD_SIGHT_CLEARANCE;
}

function updateGuards(step) {
  if (!GUARDS.length) return;

  const hidden = inHideSpot(posX) || aboveGuardSight();
  const now = performance.now();

  GUARDS.forEach((guard) => {
    guard.moving = false;
    if (guard.disabled) {
      guard.alert = 0;
      guard.aiming = false;
      drawGuard(guard);
      return;
    }

    // Block 38. Once he has seen Macario he no longer patrols or looks:
    // he hunts. See updateHostileGuard.
    if (guard.hostile) {
      updateHostileGuard(guard, step, now);
      drawGuard(guard);
      return;
    }

    // Patrol. A guard whose bounds collapse to a point is a stationary
    // sentry and keeps the facing the level gave it. Without this it
    // reaches its limit every frame and flips constantly, which reads as
    // a twitching guard that can never actually catch anyone.
    const route = (guard.patrolTo || 0) - (guard.patrolFrom || 0);
    if (route >= 1) {
      const speed = (guard.speed || 1.4) * step;
      guard.pos += speed * guard.facing;
      if (guard.pos <= guard.patrolFrom) {
        guard.pos = guard.patrolFrom;
        guard.facing = 1;
      } else if (guard.pos >= guard.patrolTo) {
        guard.pos = guard.patrolTo;
        guard.facing = -1;
      }
      guard.el.style.left = guard.pos + "px";
      guard.moving = true;
    }

    // Detection.
    // Centre to centre, so "in front" means in front of the body the
    // student can see rather than of either character's left edge.
    const dx = posX + PLAYER_WIDTH / 2 - (guard.pos + GUARD_WIDTH / 2);
    const inFront = Math.sign(dx) === guard.facing || dx === 0;
    const inRange = Math.abs(dx) <= (guard.detectRadius || 240);
    const seen = inFront && inRange && !hidden && !playerIsSafe();

    if (seen) {
      // Worn equipment can slow the fill while Macario keeps still
      // (Block 32). It never touches decay, so moving out of sight
      // still clears the meter at the same rate, and it never stops the
      // fill outright: standing in plain view is still a way to be
      // caught, only a slower one.
      const stillMult = playerStill ? equipEffects.stillDetectionMult : 1;
      guard.disguised = stillMult < 1;
      // Block 85. Heard as well as seen: a rising note the moment a
      // guard starts to notice, from an empty meter, not more often than
      // NOTICE_SFX_GAP_MS for the same guard. The first time in a save,
      // a hint says what to do about it; there is no guide, so this is
      // the one line of teaching stealth gets.
      if (guard.alert === 0 && now - (guard.noticedAt || 0) > NOTICE_SFX_GAP_MS) {
        guard.noticedAt = now;
        playSfx("notice");
        if (!state.flags.__turoSaBantay) {
          state.flags.__turoSaBantay = true;
          markDirty();
          showToast(HIDE_SPOTS.length
            ? "May nakapansin! Magtago sa likod ng kahon, o lumayo sa tingin niya."
            : "May nakapansin! Lumayo sa tingin niya.", 3600);
        }
      }
      guard.alert = Math.min(1, guard.alert + (guard.alertRate || 0.012) * stillMult * step);
      // Block 38. The first time the clothes are what is holding a guard
      // back in a scene, say so. The meter turning blue (drawGuard) says
      // it every time after.
      if (guard.disguised && currentScene && !currentScene._disguiseNoted) {
        currentScene._disguiseNoted = true;
        showToast("Artista lang ang tingin niya sa iyo. Huwag kang gagalaw.");
      }
    } else {
      guard.disguised = false;
      guard.alert = Math.max(0, guard.alert - (guard.decayRate || 0.02) * step);
    }

    if (guard.alert >= 1) {
      if (guard.shoots) becomeHostile(guard, now);
      else caughtBy(guard);
    }

    drawGuard(guard);
  });
}

// Writes a guard's meter and facing only when they change (Block 36): a
// scene with several guards on a long road would otherwise dirty every
// one of them every frame.
function drawGuard(guard) {
  if (!guard.el) return;
  const fill = guard.disabled ? 0 : Math.round(guard.alert * 100);
  if (fill !== guard.drawnFill) {
    guard.fillEl.style.width = fill + "%";
    guard.drawnFill = fill;
  }
  const alerted = !guard.disabled && (guard.alert >= 1 || guard.hostile);
  if (alerted !== guard.drawnAlerted) {
    guard.el.classList.toggle("guard-alerted", alerted);
    guard.drawnAlerted = alerted;
  }
  const hostile = !guard.disabled && guard.hostile;
  if (hostile !== guard.drawnHostile) {
    guard.el.classList.toggle("guard-hostile", hostile);
    guard.drawnHostile = hostile;
  }
  const disguised = !guard.disabled && !guard.hostile && Boolean(guard.disguised);
  if (disguised !== guard.drawnDisguised) {
    guard.el.classList.toggle("guard-disguised", disguised);
    guard.drawnDisguised = disguised;
  }
  if (guard.facing !== guard.drawnFacing) {
    guard.el.classList.toggle("guard-facing-left", guard.facing === -1);
    guard.drawnFacing = guard.facing;
  }
  if (guard.disabled && !guard.drawnDown) {
    guard.el.classList.add("guard-down");
    guard.drawnDown = true;
  } else if (!guard.disabled && guard.drawnDown) {
    // Up again (a replayed scene, or the harness): the fall undone.
    guard.el.classList.remove("guard-down", "guard-fall-right", "guard-fall-left");
    guard.drawnDown = false;
  }
  // Block 73. Which of his sheets shows: the shot while the rifle is
  // down or coming back up, the walk while he moves, else standing.
  // Block 75: the hit sheet while he reels from a blow and as he falls.
  const now = performance.now();
  const lowering = guard.shootSpriteEl && !guard.aiming &&
    now < guard.lowerSince + guardRaiseMs(guard);
  const reeling = guard.disabled ? !guard.fellForward : now < (guard.staggerUntil || 0);
  const pose = guard.hitSpriteEl && reeling ? "hit"
    : guard.disabled ? "idle"
    : guard.shootSpriteEl && (guard.aiming || lowering) ? "shoot"
    : guard.walkSpriteEl && guard.moving ? "walk"
    : "idle";
  if (pose !== guard.drawnPose) {
    if (guard.spriteEl) guard.spriteEl.style.display = pose === "idle" ? "" : "none";
    if (guard.walkSpriteEl) guard.walkSpriteEl.style.display = pose === "walk" ? "" : "none";
    if (guard.shootSpriteEl) guard.shootSpriteEl.style.display = pose === "shoot" ? "" : "none";
    if (guard.hitSpriteEl) guard.hitSpriteEl.style.display = pose === "hit" ? "" : "none";
    guard.drawnPose = pose;
  }
}

// =============================================================
// HOSTILE GUARDS AND THEIR SHOTS (Blocks 37 and 38)
//
// A guard declared shoots: true does not catch. When his meter fills he
// turns hostile and stays that way, the way an enemy in most games does
// once it has spotted the player: he stops patrolling, turns to face
// Macario wherever he goes, closes to GUARD_HOLD_DISTANCE at a run and
// fires every GUARD_SHOT_COOLDOWN_MS while in range. Block 37 had him fire
// once and go back to watching, which read as a guard who forgot what he
// had just seen.
//
// Hostility ends only two ways: the guard goes down (two punches, or a
// takedown before he turned), or Macario runs out of hearts, which resets
// every guard to his post (respawnInScene). Being seen is counted once,
// on the turn, not per shot. The chase speed is well under Macario's, so
// running is always a way out of range, and his bullets fly at chest
// height, so a jump or a platform still gets over them.
//
// Each bullet is visible and travels the way he faces. A hit costs one
// heart and knocks Macario on the way the bullet was going, like the
// glass on the road; it does not send him to the start of the scene.
// =============================================================

const GUARD_HOLD_DISTANCE = 170;    // centre to centre; he shoots from here
const GUARD_FIRE_RANGE_EXTRA = 160; // past detectRadius, he still fires
const GUARD_AIM_MS = 450;           // from turning hostile to the first shot
// Block 75. A guard takes a blow the way an enemy does (Block 60): he
// is sent sliding (ENEMY_KNOCK_SPEED, slowing by ENEMY_KNOCK_DECAY, so
// about 45px), flashes, and for GUARD_STAGGER_MS neither walks, aims nor
// fires, showing his hit sheet if he has one; his next shot waits
// GUARD_HIT_STAGGER_MS. The blow that drops him sends him further and he
// topples away from it, then fades, as the enemies do.
const GUARD_STAGGER_MS = 450;
const GUARD_HIT_STAGGER_MS = 600;

function becomeHostile(guard, now) {
  if (guard.hostile || guard.disabled) return;
  guard.hostile = true;
  guard.alert = 1;
  guard.nextShotAt = now + GUARD_AIM_MS;
  detections += 1;
  showToast("Nakita ka! Hinahabol ka ng bantay!");
}

function updateHostileGuard(guard, step, now) {
  // Block 75. Reeling from a blow: no walking, no aim, no shot.
  if (now < (guard.staggerUntil || 0)) {
    setTell(guard, false);
    return;
  }
  const dx = posX + PLAYER_WIDTH / 2 - (guard.pos + GUARD_WIDTH / 2);
  const dist = Math.abs(dx);
  // Block 88. The template of the enemies: once a shot is coming he holds
  // the way he faced, and otherwise takes a beat to turn.
  const deciding = guard.aiming || now >= guard.nextShotAt - GUARD_AIM_LEAD_MS;
  if (!deciding) turnToward(guard, Math.sign(dx), now);
  const range = (guard.detectRadius || 240) + GUARD_FIRE_RANGE_EXTRA;
  // The same sign an enemy shows, whether or not he has a rifle sheet.
  setTell(guard, dist <= range && now < guard.nextShotAt && guard.nextShotAt - now <= ATTACK_TELL_MS);

  // Block 73. A guard with a shoot sheet stops to shoot: he brings the
  // rifle down GUARD_AIM_LEAD_MS before each shot, holds it through the
  // shot's kick, and keeps it levelled for as long as Macario is close
  // enough that he has no need to walk. He does not walk while the rifle
  // is down or coming back up, since a rifle levelled at the hip on a
  // man walking reads as sliding. A guard without one moves and fires
  // at once, as he always has.
  if (guard.shootAnimation) {
    const due = now >= guard.nextShotAt - GUARD_AIM_LEAD_MS;
    const recoiling = guard.shotAt && now < guard.shotAt + guardFireClipMs(guard);
    const wantAim = dist <= range && (due || recoiling || dist <= GUARD_HOLD_DISTANCE);
    if (wantAim && !guard.aiming) {
      guard.aiming = true;
      guard.aimSince = now;
    } else if (!wantAim && guard.aiming) {
      guard.aiming = false;
      guard.lowerSince = now;
    }
  }
  const busy = guard.shootAnimation && (guard.aiming || now < guard.lowerSince + guardRaiseMs(guard));

  if (dist > GUARD_HOLD_DISTANCE && !busy) {
    const move = Math.min(guard.chaseSpeed * step, dist - GUARD_HOLD_DISTANCE);
    guard.pos += move * guard.facing;
    guard.pos = Math.max(0, Math.min(guard.pos, WORLD_WIDTH - GUARD_WIDTH));
    guard.el.style.left = guard.pos + "px";
    guard.moving = move > 0;
  }

  // With the art, never before the rifle is actually levelled.
  const levelled = !guard.shootAnimation ||
    (guard.aiming && now - guard.aimSince >= guardRaiseMs(guard));
  if (now >= guard.nextShotAt && dist <= range && levelled) guardFire(guard, now);
}

// Block 73. The shoot sheet's timing. aimFrame is the levelled pose; the
// frames before it bring the rifle down (played backwards to raise it
// again), and fireFrame to the last are the shot: the flash, the kick
// and the smoke, played once from the moment the bullet leaves.
const GUARD_AIM_LEAD_MS = 320;

function guardRaiseMs(guard) {
  const s = guard.shootAnimation;
  return s ? ((s.aimFrame || 0) * 1000) / (s.fps || 12) : 0;
}

function guardFireClipMs(guard) {
  const s = guard.shootAnimation;
  return s ? ((s.frames - (s.fireFrame || 0)) * 1000) / (s.fps || 12) : 0;
}

function guardShootFrame(guard, now) {
  const s = guard.shootAnimation;
  const ms = 1000 / (s.fps || 12);
  const aimFrame = s.aimFrame || 0;
  const fireFrame = s.fireFrame || aimFrame;
  if (guard.aiming) {
    const sinceShot = now - guard.shotAt;
    if (guard.shotAt && sinceShot >= 0 && sinceShot < guardFireClipMs(guard)) {
      return Math.min(s.frames - 1, fireFrame + Math.floor(sinceShot / ms));
    }
    return Math.min(aimFrame, Math.floor((now - guard.aimSince) / ms));
  }
  return Math.max(0, aimFrame - 1 - Math.floor((now - guard.lowerSince) / ms));
}

// A blow on a guard who is already fighting, a punch (damage 1) or a
// shot (damage 2, ENEMY_SHOT_DAMAGE): he takes it rather than dropping
// at once, the same way the moro-moro's soldiers do. dir is the way the
// blow travels; message is the toast if it drops him. Since Block 76 a
// door into takeBlow (BLOWS, below), which every body shares.
function hitGuard(guard, damage, dir, message) {
  takeBlow(guard, damage, dir, message || "Napatumba mo ang bantay.");
}

// Block 75. The hit sheet's frame: played once through the stagger from
// the blow and held on its last; while he topples, held on the frame he
// leans furthest back (knockoutFrame, else the second). Since Block 96
// for any body that brings a hit sheet, a guard or an enemy.
function hitFrame(body, now) {
  const s = body.hitAnimation;
  if (bodyKindOf(body).isDown(body)) return Math.min(s.frames - 1, s.knockoutFrame != null ? s.knockoutFrame : 1);
  return Math.min(s.frames - 1, Math.floor((now - (body.hitAt || 0)) / (1000 / (s.fps || 8))));
}

const GUARD_BULLET_SPEED = 9;       // per 60fps frame; well under a dodge
const GUARD_BULLET_SIZE = 10;       // must match .guard-bullet's CSS width
const GUARD_BULLET_HEIGHT = 70;     // above the guard's floor: chest height
const GUARD_BULLET_RANGE_EXTRA = 120; // past his detectRadius, then gone
const GUARD_SHOT_COOLDOWN_MS = 1300;
const GUARD_BULLET_RECOIL = 50;
const PLAYER_HIT_HEIGHT = 110;      // how tall the body is for a bullet


function guardFire(guard, now) {
  guard.nextShotAt = now + jitter(GUARD_SHOT_COOLDOWN_MS - ATTACK_TELL_SPREAD * 3, ATTACK_TELL_SPREAD * 6);
  guard.shotAt = now;
  playSfx("gunShot");

  const el = document.createElement("div");
  el.className = "guard-bullet";
  world.appendChild(el);
  actElements.push(el);

  const dir = guard.facing;
  let x = dir >= 0
    ? guard.pos + GUARD_WIDTH
    : guard.pos - GUARD_BULLET_SIZE;
  let y = floorHeightAt(guard.pos) + GUARD_BULLET_HEIGHT;

  // Block 73. With a shoot sheet that says where its muzzle is (native
  // pixels, like Macario's own, Block 28), the bullet leaves from there,
  // where the flash is drawn. Never past Macario, though: a rifle long
  // enough to reach beyond him is a shot at point-blank, not a miss.
  const sheet = guard.shootAnimation;
  if (sheet && sheet.muzzle && sheet.contentHeight && typeof sheet.footX === "number") {
    const scale = spriteFit(sheet, DISPLAY_HEIGHT).scale;
    const forward = (sheet.muzzle.x - sheet.footX) * scale;
    const up = (sheet.contentTop + sheet.contentHeight - sheet.muzzle.y) * scale;
    const centre = guard.pos + GUARD_WIDTH / 2;
    x = centre + dir * forward - (dir < 0 ? GUARD_BULLET_SIZE : 0);
    y = floorHeightAt(guard.pos) + up - GUARD_BULLET_SIZE / 2;
    const ahead = Math.sign(posX + PLAYER_WIDTH / 2 - centre) === dir;
    if (ahead) {
      x = dir > 0 ? Math.min(x, posX) : Math.max(x, posX + PLAYER_WIDTH - GUARD_BULLET_SIZE);
    }
  }
  el.style.left = x + "px";
  el.style.bottom = y + "px";

  GUARD_BULLETS.push({
    el, x, y, dir,
    left: (guard.detectRadius || 240) + GUARD_BULLET_RANGE_EXTRA,
  });

  // The flash is in the art when there is art for it; otherwise the
  // whole guard lights up for a moment, as before.
  if (!sheet) {
    guard.el.classList.add("guard-firing");
    setTimeout(() => guard.el && guard.el.classList.remove("guard-firing"), 180);
  }
}

function updateGuardBullets(step) {
  if (!GUARD_BULLETS.length) return;

  GUARD_BULLETS = GUARD_BULLETS.filter((bullet) => {
    const distance = GUARD_BULLET_SPEED * step;
    bullet.x += distance * bullet.dir;
    bullet.left -= distance;
    bullet.el.style.left = bullet.x + "px";

    const overlapsX =
      bullet.x + GUARD_BULLET_SIZE > posX && bullet.x < posX + PLAYER_WIDTH;
    const overlapsY =
      bullet.y + GUARD_BULLET_SIZE > posY && bullet.y < posY + PLAYER_HIT_HEIGHT;

    if (overlapsX && overlapsY && !inHideSpot(posX)) {
      bullet.el.remove();
      const hit = damagePlayer("Tinamaan ka ng bala!", false);
      if (hit && health > 0) {
        posX += bullet.dir * GUARD_BULLET_RECOIL;
        posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
        velY = HAZARD_RECOIL_VELOCITY;
      }
      return false;
    }

    if (bullet.left <= 0 || bullet.x < 0 || bullet.x > WORLD_WIDTH) {
      bullet.el.remove();
      return false;
    }
    return true;
  });
}

function clearGuardBullets() {
  GUARD_BULLETS.forEach((bullet) => bullet.el.remove());
  GUARD_BULLETS = [];
}

// Dialogue, cutscenes and overlays all suspend detection. Being spotted
// while unable to move is not a mechanic, it is a bug report.
function playerIsSafe() {
  return inDialogue || cutscenePlaying || uiBlocked || authGated;
}

// A catch increments BOTH counters, and that is intended rather than an
// oversight. Being seen is a stealth failure and it costs a health point,
// so it is counted in both terms. The two are correlated by design; the
// documentation says so rather than leaving a panel to notice.
function caughtBy(guard) {
  guard.alert = 0;
  detections += 1;
  playSfx("caught"); // Block 85, a sting over the hurt
  damagePlayer("Nakita ka ng bantay!", true);
}

// Block 85. How long one guard waits before his notice note can sound
// again: a student stepping in and out of his sight should not hear it
// on every step.
const NOTICE_SFX_GAP_MS = 2500;

// =============================================================
// HEALTH
// =============================================================

// Looked up lazily rather than held in consts at this point in the file.
// loadAct() runs at parse time, above here, and reaches updateHudVisibility
// on its way through loadScene; a const declared below would still be in
// its temporal dead zone and throw before the login box ever appeared.
// Cached on the function itself rather than in a module-level const.
// Function declarations hoist; a const at this point in the file would
// still be in its temporal dead zone when loadAct() runs at parse time
// several hundred lines above, and would throw before the login box ever
// rendered.
function hudEls() {
  if (!hudEls.cache) {
    hudEls.cache = {
      root: document.getElementById("hud"),
      hearts: document.getElementById("hud-hearts"),
      toast: document.getElementById("toast"),
    };
  }
  return hudEls.cache;
}

function updateHudVisibility() {
  const hudEl = hudEls().root;
  if (!hudEl) return;
  // Hearts only appear where something can take them. Derived rather than
  // read straight off the flag, because a scene that declares a hazard and
  // forgets the flag would take a heart the student cannot see, and that
  // failure is silent. The explicit flag still works and still wins.
  const dangerous = Boolean(
    currentScene &&
      (currentScene.dangerous ||
        // Block 81. The guards on duty, not every one the scene names:
        // a guard placed for a later beat is no reason for hearts now.
        GUARDS.length ||
        (currentScene.hazards && currentScene.hazards.length) ||
        ENEMIES.some((e) => !e.dead))
  );
  hudEl.classList.toggle("hidden", !dangerous);
  if (dangerous) renderHearts();
}

function renderHearts() {
  const heartsEl = hudEls().hearts;
  if (!heartsEl) return;
  heartsEl.innerHTML = "";
  for (let i = 0; i < maxHealth; i++) {
    const heart = document.createElement("div");
    heart.className = "heart" + (i < health ? "" : " heart-empty");
    heartsEl.appendChild(heart);
  }
}

// The whole of what equipment does to the engine. Called by inventory.js
// on sync and on every equip or unequip, including the optimistic one it
// reverts a moment later if the write fails.
//
// Defensive about its input on purpose: it is the boundary between a file
// that may be absent and one that must never throw. A missing or nonsense
// multiplier falls back to 1 rather than making the projectile stand still.
function setEffects(next) {
  const e = next || {};

  const mult = Number(e.projectileSpeedMult);
  equipEffects.projectileSpeedMult = isFinite(mult) && mult > 0 ? mult : 1;

  // Block 32. How fast a guard's meter fills while Macario stands still,
  // as a multiplier: 0.5 is half as fast. Only a slowing is accepted.
  // Worn clothes that made a student easier to see would be a trap
  // bought with barya.
  const still = Number(e.stillDetectionMult);
  equipEffects.stillDetectionMult = isFinite(still) && still > 0 && still < 1 ? still : 1;

  const bonus = Number(e.maxHealthBonus);
  equipEffects.maxHealthBonus =
    isFinite(bonus) && bonus > 0 ? Math.floor(bonus) : 0;

  setMaxHealth(BASE_MAX_HEALTH + equipEffects.maxHealthBonus);
}

// A raised maximum arrives FULL. A fourth heart that renders empty until
// the student happens to find a pickup reads as a broken item rather than
// a reward, and the amulet is the reward for reaching the outpost.
//
// Lowering it clamps, which is the taking-it-off case: a student wearing
// four hearts who unequips at full health drops to three rather than
// keeping a heart the HUD can no longer draw.
function setMaxHealth(next) {
  const previous = maxHealth;
  maxHealth = Math.max(1, next);

  if (maxHealth > previous) health += maxHealth - previous;
  if (health > maxHealth) health = maxHealth;

  renderHearts();
}

function showToast(text, ms) {
  const toastEl = hudEls().toast;
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastEl.classList.add("hidden"), ms || 1600);
}

// respawn says whether surviving the hit also sends the player back to
// the start of the scene. A guard catch does; the walk back is the cost
// of being seen. A hazard does not, because being returned to the
// entrance for one heart turns a small mistake into a two minute one,
// and a Grade 8 student meeting that twice simply stops trying.
//
// Running out of health always respawns regardless, since that path
// restores health and there is nowhere else to put the player.
function damagePlayer(reason, respawn) {
  const now = performance.now();
  if (now < invulnUntil) return false; // still in the grace window
  invulnUntil = now + INVULN_MS;

  // Counted here rather than at each call site, so the grace window
  // that stops the damage also stops the count.
  damageTaken += 1;

  health -= 1;
  renderHearts();
  impact("hurt"); // Block 60
  player.classList.add("player-hurt");
  setTimeout(() => player.classList.remove("player-hurt"), 400);

  if (health <= 0) {
    showToast(reason ? reason + " Ulitin natin." : "Ulitin natin.");
    respawnInScene();
  } else {
    if (reason) showToast(reason);
    if (respawn) respawnInScene();
  }

  return true; // the hit landed, so the caller may knock the player back
}

// Back to the start of the scene, guards reset to their posts. Health is
// only restored when it ran out, so a player on one heart still feels it.
function respawnInScene() {
  const scene = currentScene;
  posX = respawnX(scene);
  posY = floorHeightAt(posX);
  velY = 0;
  facing = 1;

  // A guard catch or a hazard can respawn the player while the attack
  // button happens to be down. Without this, shooting would stay stuck
  // and suppress the idle/walk switch (see gameLoop) for the rest of
  // the visit to this scene, since nothing else clears it once the
  // press that started it is gone.
  attackHoldStart = 0;
  shooting = null;
  clearTimeout(shootFireTimer);

  if (health <= 0) {
    health = maxHealth;
    renderHearts();
  }

  // Block 35. A lost fight starts over rather than ending: every enemy
  // still standing goes back to where it came from at full strength, and
  // the ones already beaten stay beaten, so a struggling student's second
  // try is shorter than their first.
  resetEnemies();

  clearGuardBullets();

  GUARDS.forEach((guard) => {
    if (guard.disabled) return;
    guard.pos = guard.x;
    guard.facing = guard.facingStart || 1;
    guard.alert = 0;
    guard.nextShotAt = 0;
    guard.hostile = false;
    guard.disguised = false;
    guard.turnAt = 0;
    setTell(guard, false);
    if (guard.fight) {
      guard.hostile = true;
      guard.alert = 1;
      guard.nextShotAt = performance.now() + GUARD_AIM_MS;
    }
    guard.aiming = false;
    guard.moving = false;
    guard.shotAt = 0;
    guard.lowerSince = 0;
    guard.knockVel = 0;
    guard.staggerUntil = 0;
    guard.hp = guard.maxHp || GUARD_HP;
    if (guard.el) guard.el.style.left = guard.pos + "px";
    drawGuard(guard);
  });
}

// Block 37. Where a respawn puts Macario: the furthest checkpoint whose
// flag is set, else the scene's startX. A scene declares checkpoints as
// [{ x, flag }], and the flags are story flags already being set for
// another reason (a pamphlet handed over), so a long road does not send a
// student who ran out of hearts all the way back for work already done.
function respawnX(scene) {
  let x = scene && typeof scene.startX === "number" ? scene.startX : 0;
  ((scene && scene.checkpoints) || []).forEach((cp) => {
    if (cp.flag && state.flags[cp.flag] && cp.x > x) x = cp.x;
  });
  return x;
}

// =============================================================
// HAZARDS AND PICKUPS
// =============================================================

// Contact is tested against the base floor rather than onGround, because
// onGround is also true on a platform, and the outpost has platforms
// above and beside the hazards. Using onGround would take a heart from a
// player standing safely on a crate, which is the exact case the
// platforms were placed to reward.
function updateHazards() {
  if (!HAZARDS.length) return;
  if (playerIsSafe()) return; // dialogue, cutscene, overlay, or not logged in

  const onFloor = posY <= floorHeightAt(posX) + 1;
  if (!onFloor) return; // jumped it

  // Harm is by overlap (see Bodies, at the top of this file): any part
  // of the body over the band hurts, which is what a student standing
  // with one foot on broken glass expects. It used to be the centre of
  // the body, and that was only survivable while nobody could see where
  // the body was.
  const hazard = HAZARDS.find(
    (h) => posX + PLAYER_WIDTH > h.x && posX < h.x + h.width
  );
  if (!hazard) return;

  const hit = damagePlayer(hazard.reason || "Nasugatan ka!", false);

  // Only shove when the hit actually landed. Knocking the player back
  // during the invulnerability window would push them across the level a
  // frame at a time while they stood still.
  if (!hit) return;
  if (health <= 0) return; // damagePlayer already respawned them

  const goingRight = facing >= 0;
  posX = goingRight
    ? hazard.x - PLAYER_WIDTH - 2
    : hazard.x + hazard.width + 2;
  posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  velY = HAZARD_RECOIL_VELOCITY;
}

// Collected by walking into them. No button: the interact button already
// means NPC and stage, and a third meaning would be a worse tutorial than
// no pickup at all.
function updatePickups() {
  if (!PICKUPS.length) return;
  if (playerIsSafe()) return;

  const centre = posX + PLAYER_WIDTH / 2;
  const footY = posY;

  PICKUPS.forEach((pickup) => {
    if (collectedPickups.has(pickup.id) || pickupTaken(pickup)) return;

    const px = pickup.x;
    const py = typeof pickup.y === "number" ? pickup.y : GROUND_LEVEL;
    if (Math.abs(centre - (px + PICKUP_SIZE / 2)) > PICKUP_REACH) return;
    if (Math.abs(footY - py) > PICKUP_REACH) return;

    // Block 68. A hint is always taken, whatever his health.
    if (pickup.type === "hint") {
      collectPage(pickup);
      return;
    }

    // A pickup is refused at full health rather than consumed. A student
    // who walks over the last heart before the corridor should not lose it
    // for having been careful, and a pickup that vanishes with no effect
    // teaches that pickups are worthless.
    if (health >= maxHealth) return;

    collectedPickups.add(pickup.id);
    if (pickup.el) pickup.el.remove();

    health = Math.min(maxHealth, health + 1);
    renderHearts();
    showToast("Nakakuha ka ng puso!");
  });
}

// =============================================================
// THE TALAAN: A GLOSSARY AND THREE HINTS (Block 68)
//
// Replaces Block 64's ten pages of facts, which the proponents did not
// want. Two things a student collects, listed together on the pause
// screen (Game.glossary, shell.js):
//
//   Words. The act declares glossary.entries ({ id, term, text }), and
//   content calls unlockGlossary(id) when the student does the thing
//   the word belongs to (meets the Kutsero, is paid in barya, acts on
//   the entablado). The entry's flag is "salita_" + id, so it survives
//   a reload, and a replay of the act keeps it (acts.js, replayAct).
//
//   Hints, for the post-test. The act declares hints ({ count, pool }),
//   and a scene lists the places one may lie (hintSpots, x or { x, y }).
//   count of the spots, and count of the pool's hints, are picked at
//   random for each student, from a seed kept in the save
//   ("__hintSeed"), so they are different from one student to the next
//   but stay put across reloads. A hint is a scroll on the road
//   (pickup type "hint"); walking or jumping into it opens its card.
//   Its flag is "pahiwatig_" + its index in the pool.
//
//   Or, since Block 70, the teacher's papers. An act whose hints declare
//   fixed: true lays paper n at the scene's hintSpots[n - 1], always the
//   same place, and takes what the papers say from the teacher
//   (talaan_entries, read by acts.js and handed over through
//   Game.setHintPool) instead of from content. At most hints.count of
//   them (3); a slot the teacher left empty lays nothing, and a paper's
//   flag is "pahiwatig_" + its slot less one, so a found paper stays
//   found when the teacher rewrites it.
//
// The engine never reads what an entry or a hint says; content does.
// =============================================================

function glossaryDef() {
  return (currentActData && currentActData.glossary) || null;
}

function hintsDef() {
  const def = (currentActData && currentActData.hints) || null;
  const pools = setHintPool.pools;
  const n = currentActData && currentActData.number;
  if (!def || !def.fixed || !pools || !pools[n]) return def;
  // Block 94. The content's own papers are the defaults: a slot the
  // teacher has written replaces that slot alone, and a slot she has not
  // keeps the content's paper.
  const bySlot = new Map();
  (def.pool || []).forEach((h) => bySlot.set(Number(h.slot), h));
  pools[n].forEach((h) => { if (h.title || h.text) bySlot.set(Number(h.slot), h); });
  return Object.assign({}, def, { pool: [...bySlot.values()] });
}

// Block 70. The teacher's papers for an act ([{ slot, title, text }]),
// from acts.js. Kept on the function itself rather than in a module
// variable, because loadAct reaches hintsDef at parse time (the TDZ
// pitfall). Used only by an act whose hints are fixed; the scrolls are
// laid again at once if that act is the one on screen.
function setHintPool(actNumber, pool) {
  if (!setHintPool.pools) setHintPool.pools = {};
  setHintPool.pools[actNumber] = (Array.isArray(pool) ? pool : []).map((h) => ({
    slot: Number(h.slot), title: String(h.title || ""), text: String(h.text || ""),
  }));
  if (currentActData && currentActData.number === actNumber && currentScene && world) refreshPickups();
}

// The hints that exist, each with the key its flag and its pickup use:
// the pool index, or for fixed hints the slot less one. A hint with
// neither a title nor a text is left out, which is what an empty
// teacher's slot is.
function hintList() {
  const def = hintsDef();
  if (!def) return [];
  const cap = def.count || 3;
  return (def.pool || [])
    .map((h, i) => ({ key: def.fixed ? Number(h.slot) - 1 : i, title: h.title || "", text: h.text || "" }))
    .filter((h) => (h.title || h.text) && (!def.fixed || (h.key >= 0 && h.key < cap)))
    .sort((a, b) => a.key - b.key);
}

// Content calls this when the student has done the thing a word belongs
// to. Once only; a word already in the Talaan says nothing.
function unlockGlossary(id) {
  const def = glossaryDef();
  const entry = def && (def.entries || []).find((e) => e.id === id);
  if (!entry || state.flags["salita_" + id]) return false;
  state.flags["salita_" + id] = true;
  markDirty();
  playSfx("page");
  queueToast((def.toastPrefix || "Bagong salita sa Talaan: ") + entry.term, 2600);
  return true;
}

// A toast that waits its turn: a word earned as a conversation ends
// would otherwise wipe the "Bagong gawain" toast the same moment set.
function queueToast(text, ms) {
  let tries = 0;
  const attempt = () => {
    const toastEl = hudEls().toast;
    if (toastEl && !toastEl.classList.contains("hidden") && tries++ < 12) {
      setTimeout(attempt, 400);
      return;
    }
    showToast(text, ms);
  };
  attempt();
}

// A small seeded generator (mulberry32), so a student's hints are the
// same on every visit and a different student's are not.
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rand) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

// Which spots and which hints this student has: [{ n, spot, hint }].
function hintPlan(scene) {
  const def = hintsDef();
  const spots = (scene && scene.hintSpots) || [];
  const list = hintList();
  if (!def || !list.length || !spots.length) return [];
  if (def.fixed) {
    return list.filter((h) => spots[h.key] !== undefined)
      .map((h, i) => ({ n: i + 1, spot: spots[h.key], hint: h.key }));
  }
  if (typeof state.flags.__hintSeed !== "number") {
    state.flags.__hintSeed = Math.floor(Math.random() * 2147483647);
  }
  const rand = seededRandom(state.flags.__hintSeed);
  const count = Math.min(def.count || 3, spots.length, list.length);
  const chosenSpots = shuffled(spots, rand).slice(0, count)
    .sort((a, b) => (a.x !== undefined ? a.x : a) - (b.x !== undefined ? b.x : b));
  const chosenHints = shuffled(list.map((h) => h.key), rand).slice(0, count);
  return chosenSpots.map((spot, i) => ({ n: i + 1, spot, hint: chosenHints[i] }));
}

// Lays this student's hint scrolls on the road. Called when a scene is
// built and again when a save is restored, because the seed that says
// where they lie may arrive with the save.
function buildHints() {
  PICKUPS = PICKUPS.filter((p) => {
    if (p.type !== "hint") return true;
    if (p.el) p.el.remove();
    return false;
  });
  hintPlan(currentScene).forEach((h) => {
    const x = typeof h.spot === "number" ? h.spot : h.spot.x;
    const y = typeof h.spot === "number" ? undefined : h.spot.y;
    const pickup = { id: "pahiwatig-" + h.n, type: "hint", hint: h.hint, n: h.n, x, y };
    PICKUPS.push(pickup);
    if (pickupTaken(pickup)) return;
    const el = document.createElement("div");
    el.className = "pickup pickup-page";
    el.id = "pickup-" + pickup.id;
    el.style.left = x + "px";
    el.style.bottom = (typeof y === "number" ? y : GROUND_LEVEL) + "px";
    world.appendChild(el);
    actElements.push(el);
    pickup.el = el;
  });
}

function pickupTaken(pickup) {
  return pickup.type === "hint" && Boolean(state.flags["pahiwatig_" + pickup.hint]);
}

// What the pause screen lists: every word, found or not (a word not yet
// earned shows no text), and the hints found so far out of how many
// this student has.
function glossaryState() {
  const g = glossaryDef();
  const h = hintsDef();
  const list = hintList();
  if (!(g && (g.entries || []).length) && !list.length) return null;
  const words = ((g && g.entries) || []).map((e, i) => {
    const found = Boolean(state.flags["salita_" + e.id]);
    return { n: i + 1, id: e.id, found, term: found ? e.term : "", text: found ? e.text : "" };
  });
  const hintTotal = h && h.fixed ? list.length : Math.min((h && h.count) || 3, list.length);
  const hints = list.filter((x) => state.flags["pahiwatig_" + x.key])
    .map((x, n) => ({ n: n + 1, title: x.title, text: x.text }));
  return {
    title: (g && g.title) || "Talaan",
    hint: (g && g.hint) || "",
    found: words.filter((w) => w.found).length,
    total: words.length,
    entries: words,
    hints: { found: hints.length, total: hintTotal, entries: hints, label: (h && (h.listLabel || h.label)) || "Mga Pahiwatig" },
  };
}

// A pickup bobs (CSS, pickup-bob) only while it is near the screen. Ten
// pages bobbing along a 14500px road were measured costing the browser
// style work every frame whether or not any was in view, so the ones out
// of view are held still (.pickup-still), and a class is written only
// when a pickup crosses the edge.
const PICKUP_MOTION_MARGIN = 300;

function updatePickupMotion(cameraX) {
  const from = cameraX - PICKUP_MOTION_MARGIN;
  const to = cameraX + (viewportWidth || 0) + PICKUP_MOTION_MARGIN;
  for (let i = 0; i < PICKUPS.length; i++) {
    const pickup = PICKUPS[i];
    if (!pickup.el) continue;
    const near = pickup.x >= from && pickup.x <= to;
    if (near === pickup.moving) continue;
    pickup.moving = near;
    pickup.el.classList.toggle("pickup-still", !near);
  }
}

// A hint found since the scene was built (a save restored after
// loadScene, the order enterGameAsUser has to use) is taken away again.
function refreshPickups() {
  buildHints();
  PICKUPS.forEach((pickup) => {
    if (pickupTaken(pickup) && pickup.el) {
      pickup.el.remove();
      pickup.el = null;
    }
  });
}

function collectPage(pickup) {
  collectedPickups.add(pickup.id);
  if (pickup.el) pickup.el.remove();
  const def = hintsDef();
  const hint = hintList().find((h) => h.key === pickup.hint);
  if (!hint) return;
  state.flags["pahiwatig_" + pickup.hint] = true;
  markDirty();
  const book = glossaryState();
  const done = book && book.hints.found >= book.hints.total;
  playSfx(done ? "fanfare" : "page");
  showPageCard((def.label || "Pahiwatig") + " " + pickup.n + " / " + (book ? book.hints.total : 1),
    hint.title, hint.text, done ? (def.completeText || "") : (def.foundText || ""), done);
}

// The card a hint opens: which hint of how many, its title and text, and
// one button. Stops the world like the apple game does (uiBlocked) and
// takes its keys in the capture phase for the same reasons: Space must
// not also jump, Escape must not also open pause. The key that closes it
// has to be pressed after it opened, so a student running into a page
// with a finger on a key does not close it unread.
function showPageCard(eyebrow, title, text, noteText, complete) {
  const screen = document.getElementById("page-card");
  if (!screen) return Promise.resolve();
  document.getElementById("page-card-eyebrow").textContent = eyebrow || "";
  document.getElementById("page-card-title").textContent = title || "";
  document.getElementById("page-card-text").textContent = text || "";
  const note = document.getElementById("page-card-note");
  note.textContent = noteText || "";
  note.classList.toggle("page-card-complete", Boolean(complete));
  const btn = document.getElementById("page-card-close");

  return new Promise((resolve) => {
    const openedAt = performance.now();
    const close = () => {
      window.removeEventListener("keydown", onKey, true);
      btn.onclick = null;
      screen.classList.add("hidden");
      setUiBlocked(false);
      resolve();
    };
    const onKey = (e) => {
      const key = (e.key || "").toLowerCase();
      if (key === "e" || key === " " || key === "enter" || key === "escape") {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat && e.timeStamp >= openedAt + 250) close();
      } else if (key === "a" || key === "d" || key === "arrowleft" || key === "arrowright") {
        e.stopPropagation();
      }
    };
    btn.onclick = close;
    window.addEventListener("keydown", onKey, true);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
    setUiBlocked(true);
    screen.classList.remove("hidden");
  });
}

// =============================================================
// COMBAT
//
// Deliberately minimal, per the decision on record: tap to attack,
// hold for ranged, no combos.
//
// The interesting part is not the swing, it is that melee reads the
// guard's facing. From behind an unalerted guard it is a takedown;
// from the front it gets Macario seen and costs him a health point.
// That is what makes stealth and combat interlock rather than sit
// beside each other, and it means the corridor can be solved two
// ways, which is worth more than either route alone.
// =============================================================

const MELEE_RANGE = 70;
const ATTACK_HOLD_MS = 400; // beyond this, release throws instead of swings
const PROJECTILE_SPEED = 12;
const PROJECTILE_RANGE = 520;

let attackHoldStart = 0;
let projectile = null; // at most one in flight

// Which attack clip currently owns the player's pose: "aim" while the
// button is held, "fire" for the brief flourish right after a throw, and
// "melee" for the punch a tap plays (Block 27). The main loop's own
// idle/walk switch (see gameLoop) is suppressed while this is set, the
// same way cutscenePlaying already suppresses it during a cutscene.
// The name predates melee having a clip of its own; it is kept because
// every reset path already clears it (respawnInScene,
// loadScene) and a rename would be churn through all of them.
let shooting = null; // null | "aim" | "fire" | "melee"
let shootFireTimer = null; // hands the pose back after fire

// Block 71. True from a punch starting until its fist reaches the contact
// frame, when updateMeleeContact resolves the hit and clears it.
let meleePending = false;
let meleeEndAt = 0; // when the clip's last frame has been shown long enough

// How long the button must be down before the aim pose shows (Block 27).
// Before melee had its own clip, the aim pose appeared the instant the
// button went down, which was harmless. With a punch to play on release,
// every tap would flash the aiming arm for a frame or two first. A tap is
// well under this; a hold that becomes a throw is well over it, and
// ATTACK_HOLD_MS still alone decides which one a release is.
const AIM_POSE_DELAY_MS = 150;

// Block 37. A scene that declares noRanged: true has no shot: a courier
// carrying pamphlets past the guardia is not there to start a gunfight.
function rangedDisabled() {
  return Boolean(currentScene && currentScene.noRanged);
}

function startAttackHold() {
  if (authGated || uiBlocked || inDialogue || cutscenePlaying) return;
  attackHoldStart = performance.now();
}

// Called every frame from the game loop. Switches to the aim pose once
// the button has been held past AIM_POSE_DELAY_MS, and not before, so a
// tap goes straight from idle or walk into the punch.
function updateAttackHoldPose(now) {
  if (!attackHoldStart || shooting === "aim") return;
  if (rangedDisabled()) return; // nothing to aim
  if (now - attackHoldStart < AIM_POSE_DELAY_MS) return;
  shooting = "aim";
  applyAnim("shootAim", true);
}

function endAttackHold() {
  if (!attackHoldStart) return;
  const held = performance.now() - attackHoldStart;
  attackHoldStart = 0;

  if (authGated || uiBlocked || inDialogue || cutscenePlaying) {
    shooting = null;
    return;
  }

  if (held >= ATTACK_HOLD_MS && rangedDisabled()) {
    // Block 37. A scene can take the gun away (noRanged). A hold still
    // does something, a punch, so the button never feels dead, and says
    // why it was not a shot.
    showToast("Hindi puwedeng bumaril dito.");
    playMelee();
  } else if (held >= ATTACK_HOLD_MS) {
    // Fire the instant the throw happens, not before, so the muzzle
    // flash frame lands with the projectile actually appearing.
    throwProjectile();
    playShootFire();
  } else {
    // A short tap was never a throw: drop any aim pose and swing.
    playMelee();
  }
}

// The attack is also a movement. A tap with an enemy ahead sends Macario
// sliding through him and out the other side, so where a swing leaves him
// is the decision: a hit ends him behind the enemy, a dash begun too far
// away stops short of him, misses, and leaves him standing in front of
// the enemy's sword with his feet planted for a moment. He cannot be hurt
// by an enemy while the dash itself is under way.
const DASH_SEEK = 340;        // farthest enemy a tap will go for, centre to centre
const DASH_HIT_RANGE = 170;   // farthest one it reaches
const DASH_PASS = 110;        // how far past his centre a hit carries him
const DASH_MISS_TRAVEL = 140; // how far a dash from beyond that gets
const DASH_SPEED = 0.75;      // px per ms on average; walking is 0.3
const DASH_MIN_MS = 200;
const DASH_MAX_MS = 400;
const DASH_RECOVER_HIT_MS = 120;
const DASH_RECOVER_MISS_MS = 520;
const DASH_STUMBLE_MS = 250;  // no walking after a miss

let dash = null;
let dashReadyAt = 0;
let dashStumbleUntil = 0;

// Enemies, and guards worth going for: one already hostile, or one
// facing away, who can be taken down from behind. An unaware guard
// looking his way is left to the stealth rules, not lunged at.
function findDashTarget() {
  const centre = posX + PLAYER_WIDTH / 2;
  const guards = GUARDS.filter((g) => !g.disabled && (g.hostile || (g.facing === facing && g.alert < 1)));
  return ENEMIES.filter((e) => !e.dead).concat(guards)
    .map((e) => ({ e, gap: (e.pos + bodyKindOf(e).width / 2 - centre) * facing }))
    .filter(({ gap }) => gap > -20 && gap <= DASH_SEEK)
    .sort((a, b) => a.gap - b.gap)[0];
}

function startDash(target) {
  const hits = target.gap <= DASH_HIT_RANGE;
  const travel = hits ? Math.max(target.gap, 0) + DASH_PASS : DASH_MISS_TRAVEL;
  const to = Math.max(0, Math.min(posX + facing * travel, WORLD_WIDTH - PLAYER_WIDTH));
  dash = {
    from: posX,
    to,
    dir: facing,
    target: hits ? target.e : null,
    hitDone: false,
    t: 0,
    ms: Math.max(DASH_MIN_MS, Math.min(DASH_MAX_MS, Math.abs(to - posX) / DASH_SPEED)),
  };
  clearTimeout(shootFireTimer);
  shooting = "melee";
  meleePending = false;
  meleeEndAt = 0;
  applyAnim("melee", true);
  flashAttack();
  playSfx("swing");
  spawnDust(posX + PLAYER_WIDTH / 2, posY, facing, "land");
}

// Eased in and out (smoothstep) so he gathers speed and settles rather
// than snapping. Time is the frame delta, which a hit-stop does not
// deliver, so a freeze on the blow holds the dash with it. True while
// the dash is under way.
function updateDash(deltaMs, now) {
  dash.t += deltaMs;
  const u = Math.min(1, dash.t / dash.ms);
  posX = dash.from + (dash.to - dash.from) * u * u * (3 - 2 * u);
  facing = dash.dir;

  const target = dash.target;
  if (target && !dash.hitDone && !bodyKindOf(target).isDown(target)) {
    const gap = (target.pos + bodyKindOf(target).width / 2 - (posX + PLAYER_WIDTH / 2)) * dash.dir;
    if (gap <= 0 || (u >= 1 && gap <= 45)) {
      dash.hitDone = true;
      if (target.kind === "guard") strikeGuard(target, dash.dir);
      else takeBlow(target, ENEMY_PUNCH_DAMAGE, dash.dir);
    }
  }
  if (u < 1) return true;

  dashReadyAt = now + (dash.hitDone ? DASH_RECOVER_HIT_MS : DASH_RECOVER_MISS_MS);
  if (!dash.hitDone) dashStumbleUntil = now + DASH_STUMBLE_MS;
  dash = null;
  return false;
}

// Plays the punch once. The hit is not resolved here: it lands when the
// clip reaches the frame where his arm is fully out (the sheet's
// contact), so the swing, the thump and the enemy's stagger all happen
// on the picture of the fist arriving. Until Block 71 the hit landed on
// release and the arm reached out a quarter second after the enemy had
// already reacted, which is what read as disconnected.
//
// A tap while the fist is still on its way is ignored, so the punch
// already thrown lands rather than being restarted before it can
// connect; a tap after contact starts the next punch. The pose is handed
// back from the animation too (updateMeleeContact), not from a timer, so
// a pause or a hit-stop mid-punch holds the whole punch, contact
// included. clearTimeout stops a fire clip's pending hand-back from
// ending this clip early.
function playMelee() {
  if (dash || performance.now() < dashReadyAt) return;
  noteTask("attack");
  const target = findDashTarget();
  if (target) {
    startDash(target);
    return;
  }
  if (meleePending && shooting === "melee" && currentAnim === "melee") return;
  const sheet = SPRITE_SHEETS.melee;
  clearTimeout(shootFireTimer);
  shooting = "melee";
  applyAnim("melee", true);
  meleePending = true;
  meleeEndAt = 0;
  // Without art there is no fist to wait for and no frame will advance:
  // resolve at once and hand the pose back on a timer, as before.
  if (!spritesReady || !sheet || sheet.failed || sheet.contact == null) {
    meleePending = false;
    meleeAttack();
    shootFireTimer = setTimeout(() => {
      if (shooting === "melee") shooting = null;
    }, sheet ? sheet.frames * (1000 / sheet.fps) : 500);
  }
}

// Called every frame from the game loop, after the sprite has stepped.
// Lands a pending punch on its contact frame, and ends the clip once its
// last frame has been shown for a frame's length. Anything that took the
// pose away (a respawn, a cutscene, a throw) has already changed
// currentAnim or shooting, and then the punch simply never lands.
function updateMeleeContact(now, canAct) {
  if (shooting !== "melee" || currentAnim !== "melee") {
    meleePending = false;
    return;
  }
  const sheet = SPRITE_SHEETS.melee;
  if (sheet.failed || sheet.contact == null) return; // playMelee's timer
  if (meleePending && currentFrame >= (sheet.contact || 0)) {
    meleePending = false;
    if (canAct) meleeAttack();
  }
  // Not lastFrameTime: the animator keeps resetting it while it holds
  // a loop: false clip on its last frame.
  if (!meleePending && currentFrame >= sheet.frames - 1) {
    if (!meleeEndAt) meleeEndAt = now + 1000 / sheet.fps;
    else if (now >= meleeEndAt) shooting = null;
  }
}

// Plays shootFire's three frames once, then hands the pose back to the
// normal idle/walk switch. There is no general "animation finished"
// callback in this engine (see applyAnim/updateAnimFrame) — a plain
// timer sized to the clip's own frame count and fps is the same
// approach flashAttack already uses for the melee brightness flash.
function playShootFire() {
  shooting = "fire";
  applyAnim("shootFire", true);

  const sheet = SPRITE_SHEETS.shootFire;
  const frameCount = sheet.endFrame - sheet.startFrame + 1;
  const duration = frameCount * (1000 / sheet.fps);

  clearTimeout(shootFireTimer);
  shootFireTimer = setTimeout(() => {
    shooting = null;
  }, duration);
}

function flashAttack() {
  player.classList.add("player-attack");
  setTimeout(() => player.classList.remove("player-attack"), 180);
}

function meleeAttack() {
  flashAttack();
  // Block 60. Every punch swings; one that lands also thumps (impact).
  playSfx("swing");

  // Measured centre to centre, the same way detection is.
  const centre = posX + PLAYER_WIDTH / 2;
  const reach = centre + facing * MELEE_RANGE;
  const lo = Math.min(centre, reach);
  const hi = Math.max(centre, reach);

  // Block 35. A fighting enemy is hit from any side: there is no stealth
  // to reward. The nearest one in front takes it, one target per swing.
  const target = ENEMIES
    .filter((e) => !e.dead)
    .map((e) => ({ e, c: e.pos + ENEMY_WIDTH / 2 }))
    .filter(({ c }) => c >= lo - ENEMY_WIDTH / 2 && c <= hi)
    .sort((a, b) => Math.abs(a.c - centre) - Math.abs(b.c - centre))[0];
  if (target) {
    hitEnemy(target.e, ENEMY_PUNCH_DAMAGE);
    return;
  }

  for (const guard of GUARDS) {
    if (guard.disabled) continue;
    const guardCentre = guard.pos + GUARD_WIDTH / 2;
    if (guardCentre < lo || guardCentre > hi) continue;
    strikeGuard(guard, Math.sign(guardCentre - centre) || facing);
    return; // one target per swing
  }
}

// What a blow does to a guard, whichever way it came (a punch, or the
// dash through him). away is the way the blow travelled. Behind means
// the guard is facing the way it went, so away from Macario.
function strikeGuard(guard, away) {
  const behind = away === guard.facing;
  if (guard.hostile) {
    // Block 38. Already fighting: a punch is a hit, not a mistake.
    hitGuard(guard, ENEMY_PUNCH_DAMAGE, away);
  } else if (behind && guard.alert < 1) {
    disableGuard(guard, "Natumba ang bantay.", away);
  } else if (guard.shoots) {
    // From the front he sees it coming, turns on Macario, and it costs
    // a heart, the same price the stealth rule always charged.
    becomeHostile(guard, performance.now());
    damagePlayer("Nakita ka ng bantay!");
  } else {
    guard.alert = 1;
    damagePlayer("Nakita ka ng bantay!");
  }
}

// A guard put down at once, by a takedown (or by takeBlow at no hp):
// he slides and topples the way the blow travelled (dir), then fades.
// Since Block 76 a door into knockOut (BLOWS, below).
function disableGuard(guard, message, dir) {
  if (!guard || guard.disabled) return;
  knockOut(guard, dir || awayFromPlayer(guard), message);
}

// The spear leaves from the front of his BODY, plus a gap. Blocks 22 and
// 23 tried to clear the rendered sprite element instead, first with the
// body width and then with the element's offsetWidth, and both were wrong
// for the same underlying reason: the element was a whole scaled cell
// hanging off to the right of the body, so "past its edge" was over 300px
// ahead of him facing right and inside him facing left. With the art now
// standing on the body (bodySprite), the body's own leading edge is where
// his front actually is, in both directions, whatever sheet is loaded.
const PROJECTILE_SPAWN_GAP = 30;
const PROJECTILE_SIZE = 14; // must match .projectile's CSS width

function throwProjectile() {
  if (projectile) return; // one at a time
  flashAttack();
  // Here rather than in playShootFire, which runs whether or not a shot
  // actually left: a release while the last shot is still in flight
  // plays the fire pose but throws nothing, and must not bang either.
  // endAttackHold calls this and playShootFire in the same step, so the
  // sound still lands with the muzzle flash.
  playSfx("gunShot");

  const el = document.createElement("div");
  el.className = "projectile";
  world.appendChild(el);
  actElements.push(el);

  // projectile.x is the ball's left edge, so a leftward throw also steps
  // back by the ball's own width to keep the whole ball clear.
  let x = facing >= 0
    ? posX + PLAYER_WIDTH + PROJECTILE_SPAWN_GAP
    : posX - PROJECTILE_SPAWN_GAP - PROJECTILE_SIZE;
  let y = posY + 60;

  // Block 28. When the fire sheet names its muzzle, the shot starts at the
  // pistol's tip instead: measured from the feet, the same point bodySprite
  // stands on the middle of the body, so it lands on the drawn gun in
  // either facing. Never nearer the body than the plain spawn point above,
  // so a sheet with a short arm cannot put the shot inside Macario.
  const sheet = SPRITE_SHEETS.shootFire;
  if (sheet && sheet.muzzle && sheet.frameHeight && !sheet.failed) {
    const fit = spriteFit(sheet, DISPLAY_HEIGHT);
    const forward = (sheet.muzzle.x - (sheet.footX != null ? sheet.footX : sheet.frameWidth / 2)) * fit.scale;
    const up = (sheet.contentTop + sheet.contentHeight - sheet.muzzle.y) * fit.scale;
    const centre = posX + PLAYER_WIDTH / 2;
    const tip = centre + facing * forward;
    x = facing >= 0
      ? Math.max(x, tip)
      : Math.min(x, tip - PROJECTILE_SIZE);
    y = posY + up - PROJECTILE_SIZE / 2;
  }

  projectile = {
    el: el,
    x: x,
    y: y,
    dir: facing,
    travelled: 0,
  };

  el.style.left = projectile.x + "px";
  el.style.bottom = projectile.y + "px";
}

function updateProjectile(step) {
  if (!projectile) return;

  // The multiplier is the whole of the weapon slot. A faster spear also
  // clears the one-in-flight limiter sooner, so the same lever makes the
  // throw both quicker and more frequent.
  const distance = PROJECTILE_SPEED * equipEffects.projectileSpeedMult * step;
  projectile.x += distance * projectile.dir;
  projectile.travelled += distance;
  projectile.el.style.left = projectile.x + "px";

  for (const enemy of ENEMIES) {
    if (enemy.dead) continue;
    const enemyCentre = enemy.pos + ENEMY_WIDTH / 2;
    if (Math.abs(enemyCentre - (projectile.x + PROJECTILE_SIZE / 2)) > 30) continue;
    hitEnemy(enemy, ENEMY_SHOT_DAMAGE);
    destroyProjectile();
    return;
  }

  for (const guard of GUARDS) {
    if (guard.disabled) continue;
    const guardCentre = guard.pos + GUARD_WIDTH / 2;
    if (Math.abs(guardCentre - (projectile.x + PROJECTILE_SIZE / 2)) > 40) continue;
    // Block 75. A shot is a blow like a punch, only harder: the same
    // damage it does an enemy, the same slide and fall. One who
    // survives it knows he is being shot at.
    const dir = projectile.dir;
    destroyProjectile();
    hitGuard(guard, ENEMY_SHOT_DAMAGE, dir, "Tinamaan ang bantay.");
    if (!guard.disabled && guard.shoots) becomeHostile(guard, performance.now());
    return;
  }

  if (
    projectile.travelled >= PROJECTILE_RANGE ||
    projectile.x < 0 ||
    projectile.x > WORLD_WIDTH
  ) {
    destroyProjectile();
  }
}

function destroyProjectile() {
  if (!projectile) return;
  projectile.el.remove();
  projectile = null;
}

// Tapping the dialogue box advances it, which is easier on mobile.
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// Block 85. Holding the box or the interact button fast-forwards through
// lines already read (updateFastForward).
dialogueBox.addEventListener("pointerdown", () => { dialoguePointerHeld = true; });
["pointerup", "pointercancel", "pointerleave"].forEach((type) =>
  dialogueBox.addEventListener(type, () => { dialoguePointerHeld = false; }));
["touchend", "touchcancel"].forEach((type) =>
  btnInteract.addEventListener(type, () => { interactTouchHeld = false; }));

// =============================================================
// SCRIPTED SCENES AND COMBAT (Block 35)
//
// The moro-moro on the entablado is the first scene where things happen
// to Macario rather than because he walked up to someone: Maryam's lines,
// a man walking on from the wings, guards pouring in. Content writes that
// sequence as an ordinary async function (content/act1.js) out of the
// small calls below, the same way it already calls addQuest or
// Acts.gotoScene. The engine still knows nothing about the play.
// =============================================================

// =============================================================
// MOVEMENT FEEL (Block 63)
//
// Act I is one road 14500 px long, and walking it end to end at SPEED
// took about 45 seconds of holding a button past nothing (TRACKER.md,
// the device pass). Three small things make moving feel like a game:
//
//   Takbo. Holding one way for RUN_AFTER_MS breaks into a run at
//   RUN_SPEED, ramped in over a few frames so it reads as speeding up
//   rather than a jump in speed, with the walk cycle stepped faster to
//   match. Letting go or turning drops back to a walk at once. There is
//   no button for it, on purpose: the control cluster is full, and a
//   Grade 8 student who is walking somewhere is already holding the one
//   control that says so. It is off wherever a guard or an enemy is up,
//   because there being seen or hit is decided by speed and distance,
//   and those were tuned against SPEED (Blocks 37, 38, 42).
//
//   A forgiving jump. A jump pressed up to COYOTE_MS after walking off a
//   ledge still jumps, and one pressed up to JUMP_BUFFER_MS before
//   landing jumps on the landing. Both are the standard fixes for a
//   jump that feels ignored on a touch screen, where a thumb is a few
//   frames late or early. Neither is a double jump: the first needs the
//   ground to have been under him a moment ago, the second waits for it.
//
//   Dust. A puff where he breaks into a run, on each stride while he
//   runs, where he takes off and where he lands. A small pool of
//   elements reused, moved only when a puff starts, and animated in CSS
//   by transform and opacity alone, so it costs the game loop nothing
//   between puffs (the lesson of Blocks 36 and 54).
// =============================================================

const RUN_AFTER_MS = 450;       // held this long, a walk becomes a run
const RUN_SPEED = 6.8;          // per 60fps frame; SPEED is 5 (8.5 was too fast; Block 68)
const RUN_RAMP_FRAMES = 12;     // from walk to full run
const RUN_STRIDE_MS = 240;      // one puff of dust per stride
const COYOTE_MS = 110;
const JUMP_BUFFER_MS = 130;
const DUST_POOL_SIZE = 6;

let walkHeldDir = 0;            // -1, 0 or 1: the one way being held
let walkHeldSince = 0;
let runBlend = 0;               // 0 walking, 1 running
let lastStrideDust = 0;
let lastGroundedAt = 0;
let jumpBufferedAt = 0;
let dustPool = null;
let dustNext = 0;

// Block 82. Off only near a guard, not wherever one exists: the pamphlet
// run put three on a 14500px street, and "no running anywhere on it" was
// reported as a bug. Near means inside his sight plus RUN_GUARD_MARGIN,
// measured the way updateGuards measures sight (middle to middle), or
// any guard who has turned hostile. A guard taken down does not count.
const RUN_GUARD_MARGIN = 150;
function runAllowed() {
  if (enemiesAlive()) return false;
  const mid = posX + PLAYER_WIDTH / 2;
  return !GUARDS.some((g) => !g.disabled && (g.hostile ||
    Math.abs(g.pos + GUARD_WIDTH / 2 - mid) < (g.detectRadius || 240) + RUN_GUARD_MARGIN));
}

// Called every frame by the game loop with the way being held (or 0) and
// whether the student can act. Returns the speed to move at this frame.
function updateRun(heldDir, canAct, now, step) {
  if (!canAct || heldDir === 0 || heldDir !== walkHeldDir) {
    walkHeldDir = canAct ? heldDir : 0;
    walkHeldSince = now;
    runBlend = 0;
    return SPEED;
  }
  if (now - walkHeldSince < RUN_AFTER_MS || !runAllowed()) {
    runBlend = 0;
    return SPEED;
  }
  if (runBlend === 0 && onGround) spawnDust(posX + PLAYER_WIDTH / 2 - heldDir * 14, posY, heldDir, "start");
  runBlend = Math.min(1, runBlend + step / RUN_RAMP_FRAMES);
  if (onGround && runBlend === 1 && now - lastStrideDust >= RUN_STRIDE_MS) {
    lastStrideDust = now;
    spawnDust(posX + PLAYER_WIDTH / 2 - heldDir * 16, posY, heldDir, "stride");
  }
  return SPEED + (RUN_SPEED - SPEED) * runBlend;
}

// Block 67. A few words rising from over Macario's head and fading: the
// barya he has just been paid, with a coin beside it. Two elements
// reused in turn, placed when one starts and animated in CSS by
// transform and opacity only, like the dust.
let floatPool = null;
let floatNext = 0;

function floatOverPlayer(text, kind) {
  if (!world) return;
  if (!floatPool) {
    floatPool = [0, 1].map(() => {
      const el = document.createElement("div");
      world.appendChild(el);
      return el;
    });
  }
  const el = floatPool[floatNext];
  floatNext = (floatNext + 1) % floatPool.length;
  el.textContent = text;
  el.style.left = Math.round(posX + PLAYER_WIDTH / 2) + "px";
  el.style.bottom = Math.round(posY + DISPLAY_HEIGHT + 8) + "px";
  el.dataset.flip = el.dataset.flip === "a" ? "b" : "a";
  el.className = "float-text float-" + (kind || "plain") + " float-" + el.dataset.flip;
}

function isRunning() {
  return runBlend > 0;
}

// A puff of dust at a point on the ground. kind is start, stride, jump or
// land, which only chooses its size in CSS; dir is the way he is moving,
// so the puff trails behind him.
function spawnDust(x, y, dir, kind) {
  if (!world) return;
  if (!dustPool) {
    dustPool = [];
    for (let i = 0; i < DUST_POOL_SIZE; i++) {
      const el = document.createElement("div");
      el.className = "dust";
      world.appendChild(el);
      dustPool.push(el);
    }
  }
  const el = dustPool[dustNext];
  dustNext = (dustNext + 1) % DUST_POOL_SIZE;
  el.className = "dust";
  el.style.left = Math.round(x) + "px";
  el.style.bottom = Math.round(y) + "px";
  // Reading offsetWidth here would restart the animation but force a
  // layout (the pitfall in CLAUDE.md), so the restart is done by
  // swapping between two identical animations instead.
  el.dataset.flip = el.dataset.flip === "a" ? "b" : "a";
  el.className = "dust dust-" + kind + " dust-" + el.dataset.flip + (dir < 0 ? " dust-left" : "");
}

// A real landing holds the landing frame this long. Short, because it is
// a pose on a character who can already move again.
const LAND_POSE_MS = 140;
// Below this height off the ground he is walking down a slope, not jumping.
const AIRBORNE_MIN_HEIGHT = 8;
let landPoseUntil = 0;

// Block 57. The apple mini-game, replacing Block 56's timing bar, which
// the proponent found dishonest: a press on a moving marker has nothing
// to do with the work Macario is paid for, and the pay was a random
// number. Here the task is the work. Apples hang in the tree and fall
// one at a time; Macario moves a basket left and right under them, and
// every apple caught is an apple he has. A miss costs nothing: another
// apple drops. Nothing here pays: content hears about each catch
// (onCatch) and decides what it means.
//
//   playCatchGame({ title, hint, goal, start,
//                   onCatch(n) -> string, doneText })
//
// Block 65 added a timed round for play after the errand, and the
// small things that make catching feel like catching:
//
//   timeLimitMs   a round against the clock instead of a goal: apples
//                 keep coming, a little faster with each one, until the
//                 time is up. goal is ignored. doneText may be a
//                 function of the count, for the line at the end.
//   golden        every CATCH_GOLDEN_EVERY-th apple of a timed round is
//                 golden, falls faster, and counts CATCH_GOLDEN_VALUE.
//
// In either mode: the basket squashes on a catch and a "+1" rises from
// it, an apple that is missed splats where it lands, and three or more
// in a row is a streak with its own sound. All of it is CSS on a few
// fixed elements, moved only when something happens.
//
// Resolves with how many he holds when the window closes, so a student
// who stops at two and comes back later starts at two (content passes
// start). Controls: the two buttons (held), A and D or the arrow keys,
// or a finger dragged across the field. Elements are looked up on each
// call rather than at load, so nothing here is reached while loadAct
// runs (the TDZ note in CLAUDE.md). The field's size is read once, on
// opening, and never again while it runs (Block 36).
const CATCH_BASKET_WIDTH = 72;   // must match #catch-basket's CSS width
const CATCH_APPLE_SIZE = 24;     // must match #catch-apple's CSS size
const CATCH_CANOPY_HEIGHT = 46;  // must match #catch-canopy's CSS height
const CATCH_BASKET_SPEED = 330;  // px a second
const CATCH_FALL_SPEED = 120;    // px a second at the start
const CATCH_FALL_STEP = 14;      // a little faster with each apple held
const CATCH_HANG_MS = 650;       // the apple shakes before it lets go
const CATCH_GOLDEN_EVERY = 5;    // Block 65, a timed round only
const CATCH_GOLDEN_VALUE = 3;
const CATCH_STREAK = 3;          // this many in a row is a streak
const CATCH_SPEED_CAP = 16;      // a timed round stops speeding up here

function playCatchGame(opts) {
  const o = opts || {};
  const screen = document.getElementById("catch-screen");
  if (!screen || !screen.classList.contains("hidden")) return Promise.resolve(0);
  const titleEl = document.getElementById("catch-title");
  const hintEl = document.getElementById("catch-hint");
  const fieldEl = document.getElementById("catch-field");
  const appleEl = document.getElementById("catch-apple");
  const basketEl = document.getElementById("catch-basket");
  const resultEl = document.getElementById("catch-result");
  const leftBtn = document.getElementById("catch-left");
  const rightBtn = document.getElementById("catch-right");
  const stopBtn = document.getElementById("catch-stop");
  const popEl = document.getElementById("catch-pop");
  const splatEl = document.getElementById("catch-splat");

  return new Promise((resolve) => {
    const timed = Number(o.timeLimitMs) > 0;
    const goal = timed ? Infinity : Math.max(1, Math.floor(Number(o.goal) || 3));
    let count = timed ? 0 : Math.max(0, Math.min(goal, Math.floor(Number(o.start) || 0)));
    const openedAt = performance.now();
    const endsAt = timed ? openedAt + Number(o.timeLimitMs) : 0;
    let shownSeconds = -1;
    let dropped = 0;  // apples that have started to fall, for golden ones
    let caught = 0;   // apples caught this time, for the speed-up
    let streak = 0;
    let flip = false; // swaps between two identical animations to restart
    let fieldW = 0;
    let fieldH = 0;
    let basketX = 0;
    let dragX = null;
    const held = { left: false, right: false };
    // The apple: hanging (waiting to drop), falling, or none.
    let apple = null;
    let nextAppleAt = 0;
    let last = 0;
    let raf = 0;
    let closed = false;
    let roundOver = false;

    function setResult(text, cls) {
      resultEl.textContent = text || "";
      resultEl.className = "shell-sub" + (cls ? " " + cls : "");
    }

    function drawBasket() {
      basketEl.style.transform = "translateX(" + Math.round(basketX) + "px)";
    }

    function drawApple() {
      if (!apple) { appleEl.classList.add("hidden"); return; }
      appleEl.classList.remove("hidden");
      appleEl.classList.toggle("catch-apple-hanging", apple.hanging);
      appleEl.style.transform =
        "translate(" + Math.round(apple.x) + "px," + Math.round(apple.y) + "px)";
    }

    function finished(now) {
      if (timed) return (now || performance.now()) >= endsAt;
      return count >= goal;
    }

    // Restarts a CSS animation on a reused element by swapping between
    // two identical ones, rather than reading offsetWidth (a layout).
    function replay(el, base) {
      flip = !flip;
      el.className = base + (flip ? " catch-anim-a" : " catch-anim-b");
    }

    function pop(text, x, golden) {
      if (!popEl) return;
      popEl.textContent = text;
      popEl.style.transform = "translateX(" + Math.round(x) + "px)";
      replay(popEl, golden ? "catch-pop-golden" : "");
    }

    function splat(x) {
      if (!splatEl) return;
      splatEl.style.transform = "translateX(" + Math.round(x) + "px)";
      replay(splatEl, "");
    }

    function drawClock(now) {
      if (!timed || roundOver) return;
      const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
      if (left === shownSeconds) return;
      shownSeconds = left;
      hintEl.textContent = "Oras: " + left + "  ·  Nasalo: " + count;
      hintEl.classList.toggle("catch-hurry", left <= 5);
    }

    function showDone() {
      const text = typeof o.doneText === "function" ? o.doneText(count) : o.doneText;
      if (timed) {
        apple = null;
        drawApple();
        hintEl.textContent = "Tapos na ang oras!";
        hintEl.classList.remove("catch-hurry");
      }
      setResult(text || "Sapat na!", "catch-hit");
      setLabel(stopBtn, "Tapos na");
      stopBtn.classList.add("shell-btn-primary");
      stopBtn.classList.remove("shell-btn-ghost");
    }

    function spawnApple(now) {
      const margin = 10;
      const x = margin + Math.random() * Math.max(0, fieldW - CATCH_APPLE_SIZE - margin * 2);
      dropped++;
      const golden = timed && o.golden !== false && dropped % CATCH_GOLDEN_EVERY === 0;
      // A timed round hangs each apple a little less as it goes on.
      const hang = timed ? Math.max(260, CATCH_HANG_MS - caught * 30) : CATCH_HANG_MS;
      apple = { x, y: CATCH_CANOPY_HEIGHT - CATCH_APPLE_SIZE / 2, hanging: true,
                dropAt: now + hang, golden, value: golden ? CATCH_GOLDEN_VALUE : 1 };
      appleEl.classList.toggle("catch-apple-golden", golden);
      drawApple();
    }

    function tick(now) {
      if (closed) return;
      const dt = last ? Math.min(now - last, 50) / 1000 : 0.016;
      last = now;

      // The basket: a finger's position wins, then the held buttons.
      let dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (dragX !== null) {
        const want = dragX - CATCH_BASKET_WIDTH / 2;
        const gap = want - basketX;
        dir = Math.abs(gap) < 2 ? 0 : Math.sign(gap);
        const stepPx = Math.min(Math.abs(gap), CATCH_BASKET_SPEED * 1.6 * dt);
        basketX += dir * stepPx;
      } else if (dir) {
        basketX += dir * CATCH_BASKET_SPEED * dt;
      }
      const before = basketX;
      basketX = Math.max(0, Math.min(basketX, fieldW - CATCH_BASKET_WIDTH));
      if (dir || before !== basketX) drawBasket();

      if (timed && !roundOver && finished(now)) {
        roundOver = true;
        showDone();
      }
      drawClock(now);
      if (!finished(now)) {
        if (!apple && now >= nextAppleAt) spawnApple(now);
        if (apple && apple.hanging && now >= apple.dropAt) {
          apple.hanging = false;
          drawApple();
        }
        if (apple && !apple.hanging) {
          // In a timed round every catch speeds the next apple up, to a
          // cap; with a goal of three it is the old "one per apple held".
          const steps = timed ? Math.min(caught, CATCH_SPEED_CAP) : count;
          apple.y += (CATCH_FALL_SPEED + CATCH_FALL_STEP * steps) * (apple.golden ? 1.35 : 1) * dt;
          const basketTop = fieldH - 34;
          const appleBottom = apple.y + CATCH_APPLE_SIZE;
          const centre = apple.x + CATCH_APPLE_SIZE / 2;
          const inBasket = centre >= basketX - 6 && centre <= basketX + CATCH_BASKET_WIDTH + 6;
          if (appleBottom >= basketTop && appleBottom <= basketTop + 16 && inBasket) {
            const value = apple.value;
            const golden = apple.golden;
            count += timed ? value : 1;
            caught++;
            streak++;
            apple = null;
            drawApple();
            playSfx(streak >= CATCH_STREAK ? "streak" : "catch"); // Blocks 58, 65
            replay(basketEl, "");
            pop("+" + (timed ? value : 1), basketX + CATCH_BASKET_WIDTH / 2, golden);
            const line = typeof o.onCatch === "function" ? o.onCatch(count, value) : "";
            if (!timed && finished()) showDone();
            else if (streak >= CATCH_STREAK) setResult("Sunod-sunod! x" + streak, "catch-hit catch-streak");
            else if (golden) setResult("Ginintuang mansanas! +" + value, "catch-hit catch-streak");
            else setResult(line || (timed ? "Nasalo mo!" : "Nasalo mo! (" + count + "/" + goal + ")"), "catch-hit");
            shownSeconds = -1; // the clock line carries the count: redraw it
            nextAppleAt = now + (timed ? 320 : 500);
          } else if (apple.y >= fieldH - CATCH_APPLE_SIZE) {
            splat(apple.x);
            apple = null;
            drawApple();
            playSfx("miss"); // Block 58
            streak = 0;
            setResult(o.missText || "Nahulog sa lupa! May isa pa.", "catch-miss");
            nextAppleAt = now + (timed ? 420 : 600);
          } else {
            drawApple();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    function close() {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("pointerup", onPointerUp);
      fieldEl.onpointerdown = null;
      fieldEl.onpointermove = null;
      stopBtn.onclick = null;
      [leftBtn, rightBtn].forEach((b) => {
        b.onpointerdown = null; b.onpointerup = null;
        b.onpointerleave = null; b.onpointercancel = null;
      });
      screen.classList.add("hidden");
      setUiBlocked(false);
      resolve(count);
    }

    function keySide(key) {
      if (key === "a" || key === "arrowleft") return "left";
      if (key === "d" || key === "arrowright") return "right";
      return null;
    }

    // Taken in the capture phase on window and stopped there, so neither
    // the world (a jump, a walk) nor the shell (Escape opens pause) also
    // acts on a key while the window is up. The E that closed the
    // conversation opening it is older than openedAt and is ignored.
    function onKeyDown(e) {
      const key = (e.key || "").toLowerCase();
      const side = keySide(key);
      if (side) {
        e.preventDefault(); e.stopPropagation();
        held[side] = true;
        dragX = null;
      } else if (key === "escape") {
        e.preventDefault(); e.stopPropagation();
        close();
      } else if (key === "e" || key === " " || key === "enter") {
        e.preventDefault(); e.stopPropagation();
        if (!e.repeat && e.timeStamp >= openedAt && finished()) close();
      }
    }

    function onKeyUp(e) {
      const side = keySide((e.key || "").toLowerCase());
      if (side) { e.stopPropagation(); held[side] = false; }
    }

    function fieldX(e) {
      const r = fieldEl.getBoundingClientRect();
      // The field is inside #app-scale, which is scaled by --zoom; its
      // rendered width over its layout width is that scale.
      const scale = r.width / (fieldW || r.width || 1);
      return (e.clientX - r.left) / (scale || 1);
    }

    function onPointerUp() { dragX = null; }

    function holdButton(btn, side) {
      btn.onpointerdown = (e) => { e.preventDefault(); held[side] = true; dragX = null; };
      btn.onpointerup = () => { held[side] = false; };
      btn.onpointerleave = () => { held[side] = false; };
      btn.onpointercancel = () => { held[side] = false; };
    }

    titleEl.textContent = o.title || "";
    hintEl.textContent = o.hint || "";
    hintEl.classList.remove("catch-hurry");
    if (popEl) popEl.className = "";
    if (splatEl) splatEl.className = "";
    basketEl.className = "";
    setResult(timed ? (o.hint || "") : count ? "Hawak mo: " + count + "/" + goal : "", "");
    setLabel(stopBtn, "Bumalik");
    stopBtn.classList.remove("shell-btn-primary");
    stopBtn.classList.add("shell-btn-ghost");
    stopBtn.onclick = close;
    holdButton(leftBtn, "left");
    holdButton(rightBtn, "right");
    fieldEl.onpointerdown = (e) => { dragX = fieldX(e); };
    fieldEl.onpointermove = (e) => { if (dragX !== null || e.buttons) dragX = fieldX(e); };
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    setUiBlocked(true);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
    screen.classList.remove("hidden");
    fieldW = fieldEl.clientWidth;
    fieldH = fieldEl.clientHeight;
    basketX = (fieldW - CATCH_BASKET_WIDTH) / 2;
    apple = null;
    nextAppleAt = performance.now() + 500;
    drawBasket();
    drawApple();
    if (finished()) showDone();
    raf = requestAnimationFrame(tick);
  });
}

// Block 57. A black card with a few lines of text, faded in and out:
// the place and year before a part of the story ("Tondo, 1890"), or a
// jump in time. The screen goes black, the lines come up one after the
// other, hold long enough to read, fade, and the black lifts.
//
//   await playIntertitle(lines, { startBlack, whileBlack, holdMs, keepBlack })
//
// startBlack puts the black up at once rather than fading it in, for an
// opening where the world must not be seen first. whileBlack runs after
// the text has gone and before the black lifts, which is where a jump in
// time moves Macario (placePlayer) without anyone seeing him move. A tap
// or E, once the first line has been up a moment, skips the rest of the
// reading time, never the fades. The script that
// calls this owns setCutscene, so the world is still behind it.
const INTERTITLE_FADE_MS = 900;
const INTERTITLE_LINE_MS = 900;
const INTERTITLE_TEXT_OUT_MS = 800;
const INTERTITLE_SKIP_AFTER_MS = 1200;

function playIntertitle(lines, opts) {
  const o = opts || {};
  const el = document.getElementById("intertitle");
  const box = document.getElementById("intertitle-text");
  if (!el || !box) return Promise.resolve();
  const list = (Array.isArray(lines) ? lines : [lines]).filter(Boolean).map(String);
  const words = list.join(" ").split(/\s+/).length;
  const hold = typeof o.holdMs === "number" ? o.holdMs : 1600 + words * 260;

  // A tap skips the rest of the reading time at once, not one line of
  // it: the lines still to come appear together and the text fades.
  let skip = null;
  let skipped = false;
  const skippable = (ms) => new Promise((resolve) => {
    if (skipped) { resolve(); return; }
    const t = setTimeout(done, ms);
    function done() { clearTimeout(t); skip = null; resolve(); }
    skip = () => { skipped = true; done(); };
  });
  // Not in the first moments, so a tap meant for whatever came before
  // (the last line of a conversation) does not throw the card away
  // unread.
  let skipFrom = Infinity;
  const onKey = (e) => {
    const key = (e.key || "").toLowerCase();
    if (key !== "e" && key !== " " && key !== "enter") return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat && skip && performance.now() >= skipFrom) skip();
  };
  const onTap = () => { if (skip && performance.now() >= skipFrom) skip(); };

  return (async () => {
    box.innerHTML = "";
    list.forEach((text, i) => {
      const p = document.createElement("p");
      p.className = "intertitle-line" + (i === 0 ? " intertitle-head" : "");
      p.textContent = text;
      box.appendChild(p);
    });
    el.classList.remove("hidden");
    if (o.startBlack) {
      el.classList.add("instant", "visible");
      void el.offsetWidth; // commit the instant black before transitions return
      el.classList.remove("instant");
    } else {
      void el.offsetWidth;
      el.classList.add("visible");
      await wait(INTERTITLE_FADE_MS);
    }
    skipFrom = performance.now() + INTERTITLE_SKIP_AFTER_MS;
    window.addEventListener("keydown", onKey, true);
    el.addEventListener("pointerdown", onTap);
    // Block 84. A card is silent unless it names a sound (opts.sfx, one of
    // SFX_SOURCES; Block 81), which only the curtain calls' applause
    // does. Its own sound, a bell (Block 58) and then a drum (Block 81),
    // did not fit either time, at the proponent's direction.
    if (o.sfx && SFX_SOURCES[o.sfx]) playSfx(o.sfx);
    try {
      for (const p of box.children) {
        p.classList.add("shown");
        await skippable(INTERTITLE_LINE_MS);
      }
      await skippable(hold);
    } finally {
      window.removeEventListener("keydown", onKey, true);
      el.removeEventListener("pointerdown", onTap);
      skip = null;
    }
    [...box.children].forEach((p) => p.classList.remove("shown"));
    await wait(INTERTITLE_TEXT_OUT_MS);
    if (typeof o.whileBlack === "function") await o.whileBlack();
    // Block 73. A card that leads straight into a scene change leaves
    // the scene fade's own black up behind it, at once, so the card
    // lifts onto black and the street is never seen between the two.
    // The caller then starts the change (Acts.gotoScene), whose fade
    // finds the screen already black.
    if (o.keepBlack) {
      blackout.style.transition = "none";
      blackout.classList.add("visible");
      void blackout.offsetWidth;
      blackout.style.transition = "";
    }
    el.classList.remove("visible");
    await wait(INTERTITLE_FADE_MS);
    el.classList.add("hidden");
    box.innerHTML = "";
  })();
}

// Block 57. Walks Macario to x at pxPerSecond and resolves on arrival:
// the player's own moveDecoration, for a script in which he leaves with
// someone rather than being cut away from. He faces the way he walks and
// shows the walk cycle while he goes (scriptWalking, read by the loop);
// the camera follows him as it always does. A scene change mid-walk
// ends the walk where it is.
function movePlayer(toX, pxPerSecond) {
  const target = Math.max(0, Math.min(Number(toX) || 0, WORLD_WIDTH - PLAYER_WIDTH));
  const speed = Math.max(1, pxPerSecond || 170);
  const token = actLoadToken;
  if (target !== posX) facing = target < posX ? -1 : 1;
  scriptWalking = true;
  applyAnim("walk"); // at once, not on the loop's next frame
  return new Promise((resolve) => {
    let last = 0;
    const done = () => {
      scriptWalking = false;
      applyAnim("idle");
      resolve();
    };
    const tick = (now) => {
      if (token !== actLoadToken) return done();
      if (paused) { last = now; requestAnimationFrame(tick); return; }
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const stepPx = (speed * dt) / 1000;
      posX = Math.abs(target - posX) <= stepPx ? target : posX + Math.sign(target - posX) * stepPx;
      posY = groundHeightAt(posX);
      if (posX === target) return done();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Block 82. A script's jump: Macario leaps, forward by dx if given, with
// the jump's own sound, pose and dust, and the promise resolves when he
// lands. The loop's physics carries him up and down (it runs through a
// cutscene); this only carries him across, over the time a jump takes.
// For something the story says he does that the game can show (the
// leap over the fire) rather than a black card saying it.
const JUMP_FLIGHT_MS = (2 * JUMP_VELOCITY / GRAVITY) * (1000 / 60);
function jumpPlayer(dx) {
  const token = actLoadToken;
  const fromX = posX;
  const toX = Math.max(0, Math.min(posX + (Number(dx) || 0), WORLD_WIDTH - PLAYER_WIDTH));
  if (toX !== fromX) facing = toX < fromX ? -1 : 1;
  velY = JUMP_VELOCITY;
  onGround = false;
  lastGroundedAt = 0;
  playSfx("jump");
  spawnDust(posX + PLAYER_WIDTH / 2, posY, facing, "jump");
  return new Promise((resolve) => {
    let flown = 0;
    let last = 0;
    const tick = (now) => {
      if (token !== actLoadToken) return resolve();
      if (!paused) flown += last ? Math.min(now - last, 50) : 0;
      last = now;
      posX = fromX + (toX - fromX) * Math.min(1, flown / JUMP_FLIGHT_MS);
      if ((onGround && flown > 100) || flown > 3000) {
        posX = toX;
        return resolve();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Block 57. Puts Macario at x, facing 1 or -1, at once: for a script
// that has hidden the move (under an intertitle's black).
function placePlayer(x, dir) {
  placeForSceneScript({ x, facing: dir });
}

// Opens a conversation from a script and resolves when it is closed. It
// uses the dialogue box exactly as talking to an NPC does, so E and a tap
// advance it the same way.
function playDialogue(lines) {
  return new Promise((resolve) => {
    activeNpc = null;
    activeMode = "script";
    activeSet = { lines, resolve };
    inDialogue = true;
    dialogueStep = 0;
    dialogueBox.classList.remove("hidden");
    showDialogueStep();
  });
}

// Holds the world still for the parts of a script with no dialogue box on
// screen (someone walking on). Same flag the stage cutscene and the scene
// fade use, so controls hide and nothing can hurt him meanwhile.
function setCutscene(on) {
  cutscenePlaying = Boolean(on);
  if (on) {
    attackHoldStart = 0;
    shooting = null;
    clearTimeout(shootFireTimer);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
  }
}

function turnPlayer(dir) {
  if (dir === 1 || dir === -1) facing = dir;
}

function decorationEl(id) {
  return document.getElementById("dec-" + id);
}

function showDecoration(id, visible) {
  const el = decorationEl(id);
  if (el) el.style.display = visible ? "" : "none";
}

// Walks a decoration to x at pxPerSecond and resolves on arrival. A scene
// change mid-walk removes the element, and the walk simply stops there.
function moveDecoration(id, toX, pxPerSecond) {
  const dec = ((currentScene && currentScene.decorations) || []).find((d) => d.id === id);
  const el = decorationEl(id);
  if (!dec || !el) return Promise.resolve();
  const speed = Math.max(1, pxPerSecond || 160);
  // Block 40. faceMovement turns the art toward where he is walking, and
  // leaves it that way when he stops. The art is assumed to face right.
  const from0 = typeof dec.currentX === "number" ? dec.currentX : dec.x;
  if (dec.faceMovement && dec.spriteEl && toX !== from0) {
    const flip = toX < from0 ? "scaleX(-1)" : "";
    dec.spriteEl.style.transform = flip;
    if (dec.walkSpriteEl) dec.walkSpriteEl.style.transform = flip;
  }
  dec.moving = true;
  // Block 53. The walk sheet in, the idle sheet out, for the length of
  // the walk; back again on arrival.
  const swap = (walking) => {
    if (!dec.walkSpriteEl) return;
    dec.walkSpriteEl.style.display = walking ? "" : "none";
    if (dec.spriteEl) dec.spriteEl.style.display = walking ? "none" : "";
  };
  if (toX !== from0) swap(true);
  return new Promise((resolve) => {
    let last = 0;
    const done = () => { dec.moving = false; swap(false); resolve(); };
    const tick = (now) => {
      if (!el.isConnected) return done();
      if (paused) { last = now; requestAnimationFrame(tick); return; }
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const from = typeof dec.currentX === "number" ? dec.currentX : dec.x;
      const stepPx = (speed * dt) / 1000;
      const next = Math.abs(toX - from) <= stepPx ? toX : from + Math.sign(toX - from) * stepPx;
      dec.currentX = next;
      el.style.left = next + "px";
      if (next === toX) return done();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Block 93. For a script that brings someone on relative to where
// Macario actually is, rather than to a fixed spot a fight may have left
// him far from: where he stands, the edges of what the screen shows, and
// a decoration put somewhere at once (under the edge, before it walks on).
function playerX() {
  return posX;
}

function viewEdges() {
  const left = lastCameraX === null ? 0 : lastCameraX;
  return { left, right: left + (viewportWidth || measureViewport()) };
}

function placeDecoration(id, x) {
  const dec = ((currentScene && currentScene.decorations) || []).find((d) => d.id === id);
  const el = decorationEl(id);
  if (!dec || !el) return;
  dec.currentX = x;
  el.style.left = x + "px";
}

// ---- Tutorials ----------------------------------------------------
//
// Block 92. Teaching a control the moment it matters: teach(id) shows a
// card, pulses the control it asks for, and STOPS THE WORLD (enemies,
// guards, bullets and their timers) until the student does the task,
// then carries on, with every timer carried forward (shiftTimers). The
// student's own controls still work, or the task could not be done.
// Content calls teach(id) where it wants one and awaits it; the engine
// calls it itself for what is always true (the first warning sign, the
// first person within reach). Each is taught once per save
// (the flag "__turo_" + id, kept by a replay) and can be switched off
// on a device with localStorage.macarioTutorials = "off".
//
// A task is a plain name that the code where it happens reports with
// noteTask: "move" (walked 60px), "jump", "attack" (a tap on Atake),
// "interact" (E at someone), "inventory" (shell.js, on opening it), and
// "react", which any of move, jump or attack answers.
const TUTORIALS = {
  lakad: { task: "move", target: ["btn-left", "btn-right"],
    text: "Lumakad gamit ang A at D, o ang mga pindutan sa kaliwa." },
  talon: { task: "jump", target: ["btn-jump"],
    text: "Tumalon gamit ang Space, o ang pindutang Talon." },
  usap: { task: "interact", target: ["btn-interact"],
    text: "Pindutin ang E, o ang pindutang Usap, para kausapin siya." },
  atake: { task: "attack", target: ["btn-attack"],
    text: "Pindutin ang J, o ang Atake, para sumugod sa kalaban. Sa kabila niya ka dadaan." },
  tanda: { task: "react", target: [],
    text: "Ang pulang ! ay babala: susugod siya! Sumugod sa likod niya, tumalon, o umatras." },
  bag: { task: "inventory", target: ["btn-inventory"],
    text: "Buksan ang Bag para makita ang mga suot mo." },
};

let tutorial = null; // the one being taught, or null

function tutorialsOn() {
  // The harness (window.__TEST, which nothing else defines) has them off
  // unless a test asks (__TEST.tutorials), so a fight under test does not
  // wait for a keypress nobody is making.
  if (window.__TEST) return Boolean(window.__TEST.tutorials);
  try { return localStorage.getItem("macarioTutorials") !== "off"; } catch (e) { return true; }
}

let tutorialEndedAt = 0;
const TUTORIAL_GAP_MS = 500;

// auto is the engine's own asking (the first sign, the first person); it
// leaves a beat after a lesson so that a lesson content is about to ask
// for next is not pre-empted by it.
function teach(id, auto) {
  const def = TUTORIALS[id];
  if (!def || state.flags["__turo_" + id] || !tutorialsOn()) return Promise.resolve(false);
  if (auto && performance.now() - tutorialEndedAt < TUTORIAL_GAP_MS) return Promise.resolve(false);
  // One at a time: another asked for while one is up waits its turn.
  if (tutorial) return tutorial.promise.then(() => teach(id));
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  tutorial = { id, def, resolve, promise, startX: posX, startedAt: performance.now() };
  document.getElementById("tutorial-text").textContent = def.text;
  document.getElementById("tutorial-card").classList.remove("hidden");
  def.target.forEach((name) => {
    const el = document.getElementById(name);
    if (el) el.classList.add("tutorial-pulse");
  });
  return promise;
}

// Puts the card away and lets the world go on. learned is false when it
// is being taken down because the reason for it is gone, so it is not
// remembered as taught.
function endTutorial(learned) {
  const done = tutorial;
  tutorial = null;
  tutorialEndedAt = performance.now();
  if (learned) {
    state.flags["__turo_" + done.id] = true;
    markDirty();
    playSfx("catch");
  }
  document.getElementById("tutorial-card").classList.add("hidden");
  done.def.target.forEach((n) => {
    const el = document.getElementById(n);
    if (el) el.classList.remove("tutorial-pulse");
  });
  shiftTimers(performance.now() - done.startedAt);
  done.resolve(learned);
}

// A card is up for at least this long before a task answers it, so what
// was already in motion (a dash begun a frame before) cannot dismiss a
// lesson nobody has read.
const TUTORIAL_MIN_MS = 600;

function noteTask(name) {
  if (!tutorial || performance.now() - tutorial.startedAt < TUTORIAL_MIN_MS) return;
  const task = tutorial.def.task;
  const react = task === "react" && (name === "move" || name === "jump" || name === "attack");
  if (task === name || react) endTutorial(true);
}

// A lesson about a fight ends with the fight (finishFight).
function cancelTutorial(...ids) {
  if (tutorial && ids.includes(tutorial.id)) endTutorial(false);
}

// ---- Work ---------------------------------------------------------
//
// Block 89. The one mini-game for every job a student can do again and
// again (grooming the horse, sewing), in two ways to play it: "tap"
// (default), where a marker sweeps a bar and a stroke is pressing the
// button, E, Space, Enter or the bar itself while it is over the green
// patch; and "hold" (Block 90), where holding fills the bar and a stroke
// is letting go inside the patch, the bar snapping if it is held to the
// end. The patch is thinner with every stroke, and the marker quicker.
// Above the bar a small picture shows the work: the horse and a brush
// that sweeps over it on a good stroke, or a cloth that is stitched.
// Resolves with how many strokes were good out of opts.rounds, or -1 if
// he walked away before the last. Content names the words (title, hint,
// verb, hitText, missText, doneText), the mode and the picture
// (opts.scene "horse" or "cloth", opts.art the horse's sheet), and
// decides what the strokes are worth; this only plays them.
const WORK_ROUNDS = 5;
const WORK_ZONE_FIRST = 0.34;  // the good part of the bar at the first stroke, as a fraction of it
const WORK_ZONE_LAST = 0.11;   // and at the last: it thins with every stroke
const WORK_SWEEP_MS = 1000;    // tap: one pass across, at the start
const WORK_SWEEP_STEP = 90;    // and quicker by this much with each stroke
const WORK_SWEEP_MIN_MS = 560;
const WORK_HOLD_MS = 1500;     // hold: the time to fill the bar, at the start
const WORK_HOLD_STEP = 150;
const WORK_HOLD_MIN_MS = 800;
const WORK_HORSE_HEIGHT = 120; // the horse in the picture, as drawn tall

function playWorkGame(opts) {
  const o = opts || {};
  const screen = document.getElementById("work-screen");
  if (!screen || !screen.classList.contains("hidden")) return Promise.resolve(-1);
  const titleEl = document.getElementById("work-title");
  const hintEl = document.getElementById("work-hint");
  const stageEl = document.getElementById("work-stage");
  const propEl = document.getElementById("work-prop");
  const toolEl = document.getElementById("work-tool");
  const marksEl = document.getElementById("work-marks");
  const barEl = document.getElementById("work-bar");
  const zoneEl = document.getElementById("work-zone");
  const markerEl = document.getElementById("work-marker");
  const resultEl = document.getElementById("work-result");
  const hitBtn = document.getElementById("work-hit");
  const stopBtn = document.getElementById("work-stop");

  return new Promise((resolve) => {
    const rounds = Math.max(1, Math.floor(Number(o.rounds) || WORK_ROUNDS));
    const hold = o.mode === "hold";
    const openedAt = performance.now();
    let stroke = 0;
    let good = 0;
    let pos = 0;
    let dir = 1;
    let zoneAt = 0;
    let zoneWidth = WORK_ZONE_FIRST;
    let last = 0;
    let raf = 0;
    let closed = false;
    let over = false;
    let holding = false;
    let holdStart = 0;
    let spent = false; // hold: the bar snapped, so nothing until he lets go
    let flip = false;
    let taken = false; // a stroke key went down here, so its release is ours

    function setResult(text, cls) {
      resultEl.textContent = text || "";
      resultEl.className = "shell-sub" + (cls ? " " + cls : "");
    }

    // Restarts a CSS animation on a reused element by swapping between two
    // identical ones, as the catch game does, without reading a layout.
    function replay(el, base) {
      flip = !flip;
      el.className = base + (flip ? " work-anim-a" : " work-anim-b");
    }

    function newZone() {
      zoneWidth = WORK_ZONE_FIRST +
        (WORK_ZONE_LAST - WORK_ZONE_FIRST) * Math.min(1, stroke / Math.max(1, rounds - 1));
      zoneAt = hold
        ? 0.28 + Math.random() * (0.68 - zoneWidth)
        : 0.06 + Math.random() * (0.88 - zoneWidth);
      zoneEl.style.left = zoneAt * 100 + "%";
      zoneEl.style.width = zoneWidth * 100 + "%";
    }

    function sweepMs() {
      return hold
        ? Math.max(WORK_HOLD_MIN_MS, WORK_HOLD_MS - stroke * WORK_HOLD_STEP)
        : Math.max(WORK_SWEEP_MIN_MS, WORK_SWEEP_MS - stroke * WORK_SWEEP_STEP);
    }

    function draw() {
      if (hold) markerEl.style.width = pos * 100 + "%";
      else markerEl.style.left = pos * 100 + "%";
    }

    // The picture of the work. A good stroke does the work in it; a bad
    // one is the horse shying or a crooked stitch.
    const scene = buildWorkScene();

    function buildWorkScene() {
      const kind = o.scene === "cloth" ? "cloth" : "horse";
      stageEl.className = "work-stage-" + kind;
      propEl.className = "";
      propEl.removeAttribute("style");
      propEl.textContent = "";
      toolEl.className = "";
      toolEl.removeAttribute("style");
      marksEl.textContent = "";
      stageEl.appendChild(toolEl);
      if (kind === "horse") {
        toolEl.className = "work-brush";
        if (o.art) {
          loadSpriteSheet(o.art).then(() => {
            if (closed || o.art.failed) return;
            bodySprite(propEl, o.art, WORK_HORSE_HEIGHT, stageEl.clientWidth || 220);
          });
        }
        return {
          stroke(hit, n) {
            if (hit) {
              replay(toolEl, "work-brush");
              propEl.style.filter = "brightness(" + (1 + 0.07 * n) + ") saturate(" + (1 + 0.05 * n) + ")";
            } else {
              replay(propEl, "work-shy");
            }
          },
        };
      }
      for (let i = 0; i < rounds; i++) {
        const mark = document.createElement("i");
        mark.style.left = (12 + (76 * i) / Math.max(1, rounds - 1)) + "%";
        marksEl.appendChild(mark);
      }
      marksEl.appendChild(toolEl);
      toolEl.className = "work-needle";
      toolEl.style.left = "12%";
      return {
        stroke(hit, n, k) {
          const mark = marksEl.children[k];
          if (mark) mark.className = hit ? "work-stitch-ok" : "work-stitch-bad";
          replay(toolEl, "work-needle");
          const next = Math.min(rounds - 1, k + 1);
          toolEl.style.left = (12 + (76 * next) / Math.max(1, rounds - 1)) + "%";
        },
      };
    }

    function tick(now) {
      if (closed) return;
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      if (!over) {
        if (hold) {
          pos = holding ? Math.min(1, (now - holdStart) / sweepMs()) : 0;
          if (holding && pos >= 1) {
            // Held to the end: the thread snaps.
            holding = false;
            spent = true;
            strike(false, o.snapText || "Napatid!");
            pos = 0;
          }
        } else {
          pos += dir * dt / sweepMs();
          if (pos >= 1) { pos = 1; dir = -1; }
          if (pos <= 0) { pos = 0; dir = 1; }
        }
        draw();
      }
      raf = requestAnimationFrame(tick);
    }

    function strike(hit, text) {
      if (over) return;
      const k = stroke;
      stroke++;
      if (hit) good++;
      playSfx(hit ? "catch" : "miss");
      scene.stroke(hit, good, k);
      setResult(hit ? (o.hitText || "Magaling!") : (text || o.missText || "Sablay!"), hit ? "work-hit" : "work-miss");
      if (stroke >= rounds) {
        over = true;
        const done = typeof o.doneText === "function" ? o.doneText(good, rounds) : o.doneText;
        hintEl.textContent = done || "Tapos na!";
        setLabel(hitBtn, "Tapos na");
        setIcon(hitBtn, "i-check");
      } else {
        hintEl.textContent = (o.hint || "") + "  ·  " + stroke + "/" + rounds;
        newZone();
      }
    }

    function inZone() {
      return pos >= zoneAt && pos <= zoneAt + zoneWidth;
    }

    function down() {
      if (over) { close(); return; }
      if (!hold) { strike(inZone()); return; }
      if (holding || spent) return;
      holding = true;
      holdStart = performance.now();
    }

    function up() {
      spent = false;
      if (!hold || !holding || over) return;
      holding = false;
      strike(inZone());
      pos = 0;
      draw();
    }

    function close() {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      barEl.onpointerdown = null;
      barEl.onpointerup = null;
      hitBtn.onclick = null;
      hitBtn.onpointerdown = null;
      hitBtn.onpointerup = null;
      hitBtn.onpointerleave = null;
      hitBtn.onpointercancel = null;
      stopBtn.onclick = null;
      screen.classList.add("hidden");
      setUiBlocked(false);
      resolve(over ? good : -1);
    }

    // In the capture phase and stopped there, as the catch game does, so
    // the world does not also act on the key. The E that closed the
    // conversation opening this is older than openedAt and is ignored.
    function isStroke(key) {
      return key === "e" || key === " " || key === "enter";
    }

    function onKeyDown(e) {
      const key = (e.key || "").toLowerCase();
      if (key === "escape") {
        e.preventDefault(); e.stopPropagation();
        close();
      } else if (isStroke(key)) {
        e.preventDefault(); e.stopPropagation();
        if (!e.repeat && e.timeStamp >= openedAt) { taken = true; down(); }
      } else if (key === "a" || key === "d" || key === "arrowleft" || key === "arrowright") {
        e.stopPropagation();
      }
    }

    // Only the release of a key it took: the E that opened the game went
    // down in the world, and the world has to see it come up.
    function onKeyUp(e) {
      if (!taken || !isStroke((e.key || "").toLowerCase())) return;
      e.stopPropagation();
      taken = false;
      up();
    }

    titleEl.textContent = o.title || "";
    hintEl.textContent = (o.hint || "") + "  ·  0/" + rounds;
    setResult("", "");
    setLabel(hitBtn, o.verb || "Sige");
    // Block 93. The job's own tool (opts.icon), not the sword it always
    // showed: grooming is not a fight.
    setIcon(hitBtn, o.icon || "i-hand");
    setLabel(stopBtn, "Bumalik");
    barEl.className = hold ? "work-fill" : "";
    if (hold) {
      hitBtn.onpointerdown = (e) => { e.preventDefault(); down(); };
      hitBtn.onpointerup = up;
      hitBtn.onpointerleave = up;
      hitBtn.onpointercancel = up;
      barEl.onpointerdown = (e) => { e.preventDefault(); down(); };
      barEl.onpointerup = up;
    } else {
      hitBtn.onclick = down;
      barEl.onpointerdown = (e) => { e.preventDefault(); down(); };
    }
    stopBtn.onclick = close;
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);

    setUiBlocked(true);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
    newZone();
    markerEl.style.left = "0%";
    markerEl.style.width = "";
    screen.classList.remove("hidden");
    raf = requestAnimationFrame(tick);
  });
}

// Block 94. The barber's own game, at the proponent's request: a memory
// game rather than a second timing one. Each round the customer asks for
// the cut as a list of tools (opts.tools, [{ label, icon }]), said one
// word at a time and then taken away; the student presses the tools in
// that order (the buttons, or the keys 1 to 3). A wrong press ends the
// round. The lists grow (opts.lengths, default 2 to 5). Resolves with the
// rounds done right, or -1 if he left before the last. Content names the
// words and decides what they are worth, as with playWorkGame.
const ORDER_LENGTHS = [2, 3, 4, 5];
const ORDER_WORD_MS = 900;   // each word of the request on screen
const ORDER_HOLD_MS = 700;   // the whole request, before it is taken away
const ORDER_NEXT_MS = 1300;  // after a round, before the next request

function playOrderGame(opts) {
  const o = opts || {};
  const screen = document.getElementById("order-screen");
  if (!screen || !screen.classList.contains("hidden")) return Promise.resolve(-1);
  const titleEl = document.getElementById("order-title");
  const hintEl = document.getElementById("order-hint");
  const askEl = document.getElementById("order-ask");
  const marksEl = document.getElementById("order-marks");
  const toolsEl = document.getElementById("order-tools");
  const resultEl = document.getElementById("order-result");
  const stopBtn = document.getElementById("order-stop");
  const tools = (o.tools || []).slice(0, 3);
  const lengths = Array.isArray(o.lengths) && o.lengths.length ? o.lengths : ORDER_LENGTHS;
  const rounds = lengths.length;
  const who = o.speaker ? o.speaker + ": " : "";

  return new Promise((resolve) => {
    const openedAt = performance.now();
    const timers = [];
    const marks = [];
    let round = 0;
    let good = 0;
    let want = [];
    let at = 0;
    let listening = false;
    let over = false;
    let closed = false;

    function later(fn, ms) { timers.push(setTimeout(() => { if (!closed) fn(); }, ms)); }

    function setResult(text, cls) {
      resultEl.textContent = text || "";
      resultEl.className = "shell-sub" + (cls ? " " + cls : "");
    }

    function drawMarks() {
      marksEl.textContent = "";
      for (let i = 0; i < rounds; i++) {
        const m = document.createElement("i");
        m.className = i < marks.length ? (marks[i] ? "order-ok" : "order-bad") : "";
        marksEl.appendChild(m);
      }
    }

    // The tool buttons, built once per game from what content asked for.
    toolsEl.textContent = "";
    const buttons = tools.map((t, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "shell-btn order-tool";
      b.appendChild(makeIcon(t.icon || "i-hand"));
      const lbl = document.createElement("span");
      lbl.className = "lbl";
      b.appendChild(lbl);
      setLabel(b, (i + 1) + " " + t.label);
      b.onclick = () => press(i);
      toolsEl.appendChild(b);
      return b;
    });

    function setListening(on) {
      listening = on;
      screen.dataset.listening = on ? "1" : "";
      buttons.forEach((b) => { b.disabled = !on; });
    }

    // A new request, never the same tool three times in a row.
    function ask() {
      setListening(false);
      setResult("", "");
      const n = lengths[round];
      want = [];
      for (let k = 0; k < n; k++) {
        let pick = Math.floor(Math.random() * tools.length);
        if (k >= 2 && pick === want[k - 1] && pick === want[k - 2]) pick = (pick + 1) % tools.length;
        want.push(pick);
      }
      at = 0;
      screen.dataset.want = want.join(",");
      hintEl.textContent = (o.hint || "") + "  ·  " + (round + 1) + "/" + rounds;
      askEl.className = "";
      askEl.textContent = who + "...";
      want.forEach((w, k) => later(() => {
        askEl.textContent = who + want.slice(0, k + 1).map((x) => tools[x].label).join(", ") +
          (k === n - 1 ? "." : "...");
        playSfx("blip");
      }, 400 + k * ORDER_WORD_MS));
      later(() => {
        askEl.className = "order-your-turn";
        askEl.textContent = o.yourTurn || "Ikaw na!";
        setListening(true);
      }, 400 + n * ORDER_WORD_MS + ORDER_HOLD_MS);
    }

    function press(i) {
      if (!listening || over) return;
      if (i === want[at]) {
        at++;
        playSfx("catch");
        setResult(tools[i].label + " " + "✓".repeat(at), "work-hit");
        if (at >= want.length) endRound(true);
      } else {
        playSfx("miss");
        endRound(false);
      }
    }

    function endRound(ok) {
      setListening(false);
      if (ok) good++;
      marks.push(ok);
      drawMarks();
      askEl.className = "";
      askEl.textContent = who + want.map((x) => tools[x].label).join(", ") + ".";
      setResult(ok ? (o.hitText || "Tama!") : (o.missText || "Mali!"), ok ? "work-hit" : "work-miss");
      round++;
      if (round >= rounds) {
        over = true;
        const done = typeof o.doneText === "function" ? o.doneText(good, rounds) : o.doneText;
        hintEl.textContent = done || "Tapos na!";
        setLabel(stopBtn, "Tapos na");
        setIcon(stopBtn, "i-check");
        stopBtn.className = "shell-btn shell-btn-primary";
        return;
      }
      later(ask, ORDER_NEXT_MS);
    }

    function close() {
      if (closed) return;
      closed = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKeyDown, true);
      stopBtn.onclick = null;
      buttons.forEach((b) => { b.onclick = null; });
      screen.classList.add("hidden");
      screen.dataset.want = "";
      screen.dataset.listening = "";
      setUiBlocked(false);
      resolve(over ? good : -1);
    }

    // Captured and stopped, as the work game's keys are. The E that
    // opened the game is older than openedAt; once it is over, E, Space
    // or Enter closes it.
    function onKeyDown(e) {
      const key = (e.key || "").toLowerCase();
      if (key === "escape") {
        e.preventDefault(); e.stopPropagation();
        close();
        return;
      }
      if (e.repeat || e.timeStamp < openedAt) { e.stopPropagation(); return; }
      const n = Number(key);
      if (n >= 1 && n <= tools.length) {
        e.preventDefault(); e.stopPropagation();
        press(n - 1);
      } else if (key === "e" || key === " " || key === "enter") {
        e.preventDefault(); e.stopPropagation();
        if (over) close();
      } else if (key === "a" || key === "d" || key === "arrowleft" || key === "arrowright") {
        e.stopPropagation();
      }
    }

    titleEl.textContent = o.title || "";
    setLabel(stopBtn, "Bumalik");
    setIcon(stopBtn, "i-back");
    stopBtn.className = "shell-btn shell-btn-ghost";
    stopBtn.onclick = close;
    window.addEventListener("keydown", onKeyDown, true);
    setUiBlocked(true);
    keysPressed["a"] = false;
    keysPressed["d"] = false;
    drawMarks();
    screen.classList.remove("hidden");
    ask();
  });
}

// ---- Combat -------------------------------------------------------
//
// Deliberately small, like stealth. An enemy walks at Macario and, once
// he is within ENEMY_COMMIT_RANGE, decides: a red "!" over his head,
// then a dash of ENEMY_DASH_DISTANCE in front of him a quarter of a
// second later, before Macario need be anywhere near. Standing in front of it is what costs a heart;
// sliding through to the far side, or jumping it, is what answers it. A
// punch takes one point, a shot two; being hit knocks an enemy back and
// cancels what he decided, so punching the one in front is always a way
// through. Speed
// is scaled by act exactly as guard speed is (difficultyMultiplier), which
// keeps dynamic difficulty the one lever it was.

const ENEMY_BASE_SPEED = 2.2;   // per 60fps frame; well under SPEED (5)
const ENEMY_SPACING = 50;       // enemies queue rather than stack
const ENEMY_COMMIT_RANGE = 230; // he decides to strike once Macario is this close
const ENEMY_DASH_DISTANCE = 220; // and dashes this far in front of him, whatever Macario does
const ENEMY_DASH_MS = 200;       // in this long, quick and plain to see
const ENEMY_STRIKE_REACH = 45;  // the dash hits whoever it touches this far in front of him
const ENEMY_STRIKE_BEHIND = 10; // and this far behind (a shoulder's width)
const ENEMY_STRIKE_HEIGHT = 70; // a jump or a platform above this is out of reach
const ENEMY_PACE_SPREAD = 0.2;  // each enemy walks 0.9 to 1.1 of his kind's speed

// Block 93. Between blows an enemy no longer stands still. While he cools
// down he keeps his distance, backing off if Macario is closer than
// ENEMY_KEEP and otherwise shuffling to and fro, so a fight moves. And now
// and then, once he has struck at least once, instead of dashing he hops
// clean over Macario and lands ENEMY_HOP_PAST beyond him, to turn (the
// usual beat) and strike from behind. The hop is movement, not a blow: it
// hurts nobody, a punch knocks him out of it, and his strike after it is
// the same red ! and dash as any other.
const ENEMY_KEEP = 150;          // centre to centre; closer than this, he backs off
const ENEMY_BACK_PACE = 0.7;     // of his walking speed, backing off
const ENEMY_SHUFFLE_PACE = 0.35; // of his walking speed, shuffling
const ENEMY_SHUFFLE_MS = 350;    // each shuffle one way lasts this, and a little
const ENEMY_SHUFFLE_SPREAD = 350;
const ENEMY_HOP_CHANCE = 0.3;    // of a decision to strike, once he has struck once
const ENEMY_HOP_REACH = 200;     // only over a Macario this close
const ENEMY_HOP_PAST = 90;       // lands this far past Macario's centre
const ENEMY_HOP_MS = 520;
const ENEMY_HOP_HEIGHT = 150;    // over Macario's head
const ENEMY_HOP_SETTLE_MS = 250; // after landing, before he may decide again

// One template for every body that fights, guard or enemy (Block 88):
// it decides, shows it, then strikes fast, in the way it chose. The tell
// is the whole of the wind-up (a lit-up body, or a levelled rifle), a
// quarter of a second and a little, and the blow goes where he faced when
// he decided, so sliding through to his back is the answer to it. Turning
// takes a beat, and staggering cancels a decision. Times are bounded
// random, so the player reads the body rather than a clock.
const ATTACK_TELL_MS = 250;
const ATTACK_TELL_SPREAD = 100;
const ATTACK_COOLDOWN_MS = 900;
const ATTACK_COOLDOWN_SPREAD = 700;
const ATTACK_TURN_MS = 250;

function jitter(base, spread) {
  return base + Math.random() * spread;
}

// Faces dir after ATTACK_TURN_MS of looking that way, not at once.
function turnToward(body, dir, now) {
  if (!dir || dir === body.facing) {
    body.turnAt = 0;
  } else if (!body.turnAt) {
    body.turnAt = now + ATTACK_TURN_MS;
  } else if (now >= body.turnAt) {
    body.facing = dir;
    body.turnAt = 0;
  }
}

// The lit-up body that says a blow is coming, for either kind.
function setTell(body, on) {
  if (Boolean(on) === Boolean(body.drawnWindup)) return;
  if (on) teach("tanda", true); // the first warning sign ever seen (Block 92)
  body.el.classList.toggle("enemy-windup", Boolean(on));
  body.drawnWindup = Boolean(on);
}
const ENEMY_ATTACK_FOLLOW_MS = 280; // the attack clip's follow-through
const ENEMY_STAGGER_MS = 350;
// Block 60. A hit no longer moves an enemy 45px in one frame: he is sent
// sliding at ENEMY_KNOCK_SPEED, slowing by ENEMY_KNOCK_DECAY a frame,
// which comes to rest about the same 45px away (10 / (1 - 0.78)), so
// every distance tuned against the old jump still holds. The blow that
// drops him sends him further, and he topples as he goes.
const ENEMY_KNOCK_SPEED = 10;   // per 60fps frame, at the moment of the hit
const ENEMY_KNOCK_DECAY = 0.78; // what is left of it a frame later
const ENEMY_KO_KNOCK_SPEED = 16;
// A beat after the last one falls before the fight is over, so the
// scene does not cut in on him mid-fall.
const FIGHT_END_BEAT_MS = 600;
const ENEMY_HIT_RECOIL = 40;    // how far a hit pushes Macario back
const ENEMY_PUNCH_DAMAGE = 1;
const ENEMY_SHOT_DAMAGE = 2;

function enemiesAlive() {
  return ENEMIES.some((e) => !e.dead) || GUARDS.some((g) => g.fight && !g.disabled);
}

// defs: [{ id, x, hp, speed, img | animation }]. Resolves once every one
// of them is down. Content awaits it to carry the scene on after the fight.
function spawnEnemies(defs) {
  const token = actLoadToken;
  const speedScale = difficultyMultiplier(currentActData && currentActData.number);

  // Block 88. A type from the guard half of the catalogue fights the same
  // way it does on patrol, but already hostile: a scripted fight needs no
  // meter to fill, the body is simply aware of Macario.
  const enemyDefs = [];
  (defs || []).forEach((placed) => {
    const type = placed.type && (window.ENEMY_TYPES || {})[placed.type];
    if (type && type.kind === "guard") {
      const guard = makeGuard(placed, speedScale);
      Object.assign(guard, {
        hostile: true,
        alert: 1,
        fight: true,
        nextShotAt: performance.now() + GUARD_AIM_MS,
        facing: posX + PLAYER_WIDTH / 2 < guard.pos + GUARD_WIDTH / 2 ? -1 : 1,
      });
      mountGuard(guard, token);
      GUARDS.push(guard);
    } else {
      enemyDefs.push(placed);
    }
  });

  const spawned = enemyDefs.map((placed) => {
    // Block 76. An enemy placed by type takes the catalogue's fields
    // under its own (content/enemies.js).
    const def = withEnemyType(placed, "enemy");
    const hp = Math.max(1, def.hp || 2);
    const enemy = Object.assign({}, def, {
      kind: "enemy",
      pos: def.x,
      hp,
      maxHp: hp,
      speed: (def.speed || ENEMY_BASE_SPEED) * speedScale * (1 - ENEMY_PACE_SPREAD / 2 + Math.random() * ENEMY_PACE_SPREAD),
      facing: posX + PLAYER_WIDTH / 2 < def.x + ENEMY_WIDTH / 2 ? -1 : 1,
      dead: false,
      nextSwingAt: 0,
      cooldownUntil: 0,
      turnAt: 0,
      staggerUntil: 0,
    });

    const el = document.createElement("div");
    el.className = "entity enemy";
    el.id = "enemy-" + def.id;
    mountBody(el, enemy.pos, ENEMY_WIDTH);
    const height = def.displayHeight || DISPLAY_HEIGHT;

    const meter = document.createElement("div");
    meter.className = "guard-meter enemy-meter";
    const fill = document.createElement("div");
    fill.className = "guard-meter-fill enemy-meter-fill";
    fill.style.width = "100%";
    meter.appendChild(fill);
    el.appendChild(meter);

    const sprite = document.createElement("div");
    sprite.className = "sprite npc-sprite" + (def.animation ? " npc-anim-sprite" : "");
    el.appendChild(sprite);

    // Block 40. An enemy may bring an attack sheet beside its walk sheet.
    // The walk steps only while he is walking; the attack is a second
    // sprite, shown and played once from its first frame for each swing,
    // starting with the telegraph so the wind-up IS the warning.
    let attackSprite = null;
    if (def.animation && def.attackAnimation) {
      attackSprite = document.createElement("div");
      attackSprite.className = "sprite npc-sprite npc-anim-sprite enemy-attack-sprite";
      attackSprite.style.display = "none";
      el.appendChild(attackSprite);
    }
    // Block 96. And a hit sheet, shown while he reels and as he falls,
    // its frame chosen the way a guard's is (hitFrame).
    let hitSprite = null;
    if (def.animation && def.hitAnimation) {
      hitSprite = document.createElement("div");
      hitSprite.className = "sprite npc-sprite npc-anim-sprite enemy-hit-sprite";
      hitSprite.style.display = "none";
      el.appendChild(hitSprite);
    }
    world.appendChild(el);
    if (def.animation) {
      setupNpcAnimation(def.animation, sprite, height, token, ENEMY_WIDTH,
        { playing: () => enemy.walking && !enemy.attacking });
      if (attackSprite) {
        setupNpcAnimation(def.attackAnimation, attackSprite, height, token, ENEMY_WIDTH,
          { playing: () => enemy.attacking, loop: false });
      }
      if (hitSprite) {
        setupNpcAnimation(def.hitAnimation, hitSprite, height, token, ENEMY_WIDTH,
          { frameAt: (now) => hitFrame(enemy, now) });
      }
    } else {
      bodyPlaceholder(sprite, def.img || "Kaaway", height, ENEMY_WIDTH);
    }

    enemy.el = el;
    enemy.fillEl = fill;
    enemy.spriteEl = sprite;
    enemy.attackSpriteEl = attackSprite;
    enemy.hitSpriteEl = hitSprite;
    enemy.drawnPose = "walk";
    enemy.walking = false;
    enemy.attacking = false;
    enemy.attackEnd = 0;
    actElements.push(el);
    return enemy;
  });

  ENEMIES = ENEMIES.filter((e) => !e.dead).concat(spawned);
  updateHudVisibility();

  return new Promise((resolve) => {
    enemiesDone = resolve;
    if (!enemiesAlive()) finishFight();
  });
}

function finishFight() {
  updateHudVisibility();
  cancelTutorial("atake", "tanda");
  const resolve = enemiesDone;
  enemiesDone = null;
  if (resolve) setTimeout(resolve, FIGHT_END_BEAT_MS);
}

// Block 60. The weight of a blow: a sound, a freeze of a few frames
// (hitStop) and a shake of the camera (shakeCamera). One place, so a
// punch on a guard and a punch on an enemy land the same way.
//
//   "punch"    a punch that lands
//   "knockout" the blow that drops someone
//   "hurt"     Macario hit
const IMPACTS = {
  punch:    { sfx: "punch",    stopMs: 55,  shake: 3, shakeMs: 140 },
  knockout: { sfx: "knockout", stopMs: 110, shake: 7, shakeMs: 280 },
  hurt:     { sfx: "hurt",     stopMs: 0,   shake: 6, shakeMs: 220 },
};

function impact(kind) {
  const def = IMPACTS[kind];
  if (!def) return;
  playSfx(def.sfx);
  if (def.stopMs) hitStop(def.stopMs);
  shakeCamera(def.shake, def.shakeMs);
}

// The world holds still for ms: the game loop skips its update and its
// animation step, so every sprite freezes on the frame of the hit. Timers
// measured against performance.now() (a swing's wind-up, the grace after
// a hit) run on through it; at a tenth of a second nobody can tell.
function hitStop(ms) {
  hitStopUntil = Math.max(hitStopUntil, performance.now() + ms);
}

// Magnitude in world pixels, easing to nothing over ms. A stronger shake
// replaces a weaker one still running, never the other way round. Off for
// a student whose device asks for reduced motion.
function shakeCamera(mag, ms) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const now = performance.now();
  const remaining = now < shakeUntil ? shakeMag * (shakeUntil - now) / shakeMs : 0;
  if (mag < remaining) return;
  shakeMag = mag;
  shakeMs = ms;
  shakeUntil = now + ms;
}

// Where the shake has the camera this frame, in whole pixels so the
// pixel art stays crisp. Two sines at unrelated rates, so it reads as a
// jolt rather than a sway, and no randomness to make a frame expensive.
function cameraShake(now) {
  if (now >= shakeUntil) return { x: 0, y: 0 };
  const k = (shakeUntil - now) / shakeMs;
  return {
    x: Math.round(shakeMag * k * Math.sin(now * 0.09)),
    y: Math.round(shakeMag * k * 0.5 * Math.sin(now * 0.13 + 1)),
  };
}

// Written only when the camera or the shake moved (Block 36).
function drawCamera(cameraX, now) {
  const s = cameraShake(now);
  if (cameraX === lastCameraX && s.x === lastShakeX && s.y === lastShakeY) return;
  world.style.transform = s.x || s.y
    ? `translate(${-cameraX + s.x}px, ${s.y}px)`
    : `translateX(${-cameraX}px)`;
  lastCameraX = cameraX;
  lastShakeX = s.x;
  lastShakeY = s.y;
}

// The slide after a hit, for the standing and the fallen alike. Called
// every running frame, not only while the student can act, so a fall
// that ends the fight finishes even as the scene takes the world back.
function updateKnockback(step) {
  // Block 76. Guards and enemies alike, standing or fallen.
  const slide = (body) => {
    if (!body.knockVel || !body.el) return;
    moveBody(body, body.knockVel * step);
    body.knockVel *= Math.pow(ENEMY_KNOCK_DECAY, step);
    if (Math.abs(body.knockVel) < 0.3) body.knockVel = 0;
  };
  GUARDS.forEach(slide);
  ENEMIES.forEach(slide);
}

function updateEnemies(step, now) {
  if (!ENEMIES.length) return;
  const playerCentre = posX + PLAYER_WIDTH / 2;

  ENEMIES.forEach((enemy) => {
    if (enemy.dead) return;
    const centre = enemy.pos + ENEMY_WIDTH / 2;
    const dx = playerCentre - centre;
    const dir = Math.sign(dx) || enemy.facing;
    const dist = Math.abs(dx);

    if (now >= enemy.staggerUntil) {
      enemy.walking = false;
      if (enemy.hop) {
        enemyHop(enemy, now);
      } else if (enemy.dash) {
        enemyDash(enemy, now);
      } else if (enemy.nextSwingAt) {
        // Decided: he holds the way he faced and dashes when the tell
        // is over.
        if (now >= enemy.nextSwingAt) startEnemyDash(enemy, now);
      } else if (dir !== enemy.facing) {
        turnToward(enemy, dir, now);
      } else {
        enemy.turnAt = 0;
        const blocked = comradeAhead(enemy, dir, centre, playerCentre);
        if (dist > ENEMY_COMMIT_RANGE) {
          if (!blocked) {
            enemy.pos += dir * Math.min(enemy.speed * step, dist - ENEMY_COMMIT_RANGE);
          }
          enemy.walking = !blocked;
        } else if (now < enemy.cooldownUntil) {
          enemy.walking = repositionEnemy(enemy, dir, dist, step, now);
        } else if (!blocked) {
          if (canHop(enemy, dir, dist, playerCentre)) startEnemyHop(enemy, dir, playerCentre, now);
          else enemy.nextSwingAt = now + jitter(ATTACK_TELL_MS, ATTACK_TELL_SPREAD);
        }
      }
    }

    setTell(enemy, enemy.nextSwingAt);

    // Block 40. The attack clip runs from the start of the telegraph to
    // ENEMY_ATTACK_FOLLOW_MS after the blow, so the lunge lands on the hit.
    // A stagger cancels it.
    if (enemy.nextSwingAt && !enemy.attacking && now >= enemy.staggerUntil) {
      enemy.attacking = true;
      enemy.attackEnd = enemy.nextSwingAt + ENEMY_DASH_MS + ENEMY_ATTACK_FOLLOW_MS;
    }
    if (enemy.attacking && (now >= enemy.attackEnd || now < enemy.staggerUntil)) {
      enemy.attacking = false;
    }
    if (enemy.pos !== enemy.drawnPos) {
      enemy.el.style.left = enemy.pos + "px";
      enemy.drawnPos = enemy.pos;
    }
    drawEnemy(enemy, now);
  });
}

// Which of his sheets shows, and which way he faces, written only on a
// change (Block 36): the hit sheet while he reels and once he is down
// (Block 96), the attack sheet through a swing (Block 40), else the
// walk. The art faces right. Called by the fall too, since the loop
// passes over a body that is down.
function drawEnemy(enemy, now) {
  const pose = enemy.hitSpriteEl && (enemy.dead || now < enemy.staggerUntil) ? "hit"
    : enemy.attackSpriteEl && enemy.attacking ? "attack"
    : "walk";
  if (pose !== enemy.drawnPose) {
    enemy.spriteEl.style.visibility = pose === "walk" ? "" : "hidden";
    if (enemy.attackSpriteEl) enemy.attackSpriteEl.style.display = pose === "attack" ? "" : "none";
    if (enemy.hitSpriteEl) enemy.hitSpriteEl.style.display = pose === "hit" ? "" : "none";
    enemy.drawnPose = pose;
  }
  if (enemy.animation && enemy.facing !== enemy.drawnFacing) {
    const flip = enemy.facing < 0 ? "scaleX(-1)" : "";
    enemy.spriteEl.style.transform = flip;
    if (enemy.attackSpriteEl) enemy.attackSpriteEl.style.transform = flip;
    if (enemy.hitSpriteEl) enemy.hitSpriteEl.style.transform = flip;
    enemy.drawnFacing = enemy.facing;
  }
}

// Whether a comrade is nearer Macario and right in front of him: he waits
// behind him, instead of walking or lunging through him.
function comradeAhead(enemy, dir, centre, playerCentre) {
  const dist = Math.abs(playerCentre - centre);
  return ENEMIES.some((other) => {
    if (other === enemy || other.dead) return false;
    const oc = other.pos + ENEMY_WIDTH / 2;
    return Math.sign(oc - centre) === dir &&
      Math.abs(oc - centre) < ENEMY_SPACING &&
      Math.abs(playerCentre - oc) < dist;
  });
}

// The dash, when the tell ends: a fixed distance the way he faced,
// eased, with dust and a swing, so it cannot be missed. It hits whoever
// it touches on the way, low enough; Macario behind him, out of its
// length, or up on a jump, is missed.
// Block 93. While cooling down: back off to ENEMY_KEEP, facing Macario,
// or shuffle a little either way. True while he moves.
function repositionEnemy(enemy, dir, dist, step, now) {
  let move = 0;
  if (dist < ENEMY_KEEP) {
    move = -dir * enemy.speed * ENEMY_BACK_PACE * step;
  } else {
    if (!enemy.shuffleUntil || now >= enemy.shuffleUntil) {
      enemy.shuffleDir = Math.random() < 0.5 ? -1 : 1;
      enemy.shuffleUntil = now + jitter(ENEMY_SHUFFLE_MS, ENEMY_SHUFFLE_SPREAD);
    }
    // Never shuffled back inside ENEMY_KEEP, or out of range.
    const toward = enemy.shuffleDir === dir;
    if (toward ? dist - ENEMY_KEEP > 10 : ENEMY_COMMIT_RANGE - dist > 10) {
      move = enemy.shuffleDir * enemy.speed * ENEMY_SHUFFLE_PACE * step;
    }
  }
  const next = Math.max(0, Math.min(enemy.pos + move, WORLD_WIDTH - ENEMY_WIDTH));
  const moved = next !== enemy.pos;
  enemy.pos = next;
  return moved;
}

// Whether this decision is a hop over him instead of a dash: only after a
// first strike (the first is always the plain, taught one), only one of
// them in the air at a time, and only where there is road to land on.
function canHop(enemy, dir, dist, playerCentre) {
  // A hop is always followed by a strike: it is what he hopped for.
  if (!enemy.swings || enemy.hopped || dist > ENEMY_HOP_REACH) return false;
  if (ENEMIES.some((e) => e.hop && !e.dead)) return false;
  const land = playerCentre + dir * ENEMY_HOP_PAST;
  if (land < ENEMY_WIDTH || land > WORLD_WIDTH - ENEMY_WIDTH) return false;
  return Math.random() < ENEMY_HOP_CHANCE;
}

function startEnemyHop(enemy, dir, playerCentre, now) {
  const to = playerCentre + dir * ENEMY_HOP_PAST - ENEMY_WIDTH / 2;
  enemy.hop = { from: enemy.pos, to, t0: now };
  playSfx("jump");
  spawnDust(enemy.pos + ENEMY_WIDTH / 2, GROUND_LEVEL, dir, "jump");
}

// An arc over him, lifted with the body's bottom margin (the element's
// transform is the fall's), landing with dust; he then turns round the
// usual way and decides again.
function enemyHop(enemy, now) {
  const h = enemy.hop;
  const u = Math.min(1, (now - h.t0) / ENEMY_HOP_MS);
  enemy.pos = h.from + (h.to - h.from) * u;
  enemy.walking = false;
  const lift = Math.round(4 * ENEMY_HOP_HEIGHT * u * (1 - u));
  if (lift !== enemy.drawnLift) {
    enemy.el.style.marginBottom = lift ? lift + "px" : "";
    enemy.drawnLift = lift;
  }
  if (u >= 1) {
    endEnemyHop(enemy);
    enemy.hopped = true;
    spawnDust(enemy.pos + ENEMY_WIDTH / 2, GROUND_LEVEL, enemy.facing, "land");
    enemy.cooldownUntil = now + ENEMY_HOP_SETTLE_MS;
  }
}

function endEnemyHop(enemy) {
  enemy.hop = null;
  if (enemy.drawnLift) {
    enemy.el.style.marginBottom = "";
    enemy.drawnLift = 0;
  }
}

function startEnemyDash(enemy, now) {
  enemy.nextSwingAt = 0;
  enemy.swings = (enemy.swings || 0) + 1;
  enemy.hopped = false;
  enemy.dash = { from: enemy.pos, to: enemy.pos + enemy.facing * ENEMY_DASH_DISTANCE, t0: now, hit: false };
  playSfx("swing");
  spawnDust(enemy.pos + ENEMY_WIDTH / 2, GROUND_LEVEL, enemy.facing, "land");
}

function enemyDash(enemy, now) {
  const d = enemy.dash;
  const u = Math.min(1, (now - d.t0) / ENEMY_DASH_MS);
  enemy.pos = d.from + (d.to - d.from) * u * u * (3 - 2 * u);
  if (!d.hit) {
    const ahead = (posX + PLAYER_WIDTH / 2 - (enemy.pos + ENEMY_WIDTH / 2)) * enemy.facing;
    const reached = ahead >= -ENEMY_STRIKE_BEHIND && ahead <= ENEMY_STRIKE_REACH;
    if (reached && posY - floorHeightAt(posX) <= ENEMY_STRIKE_HEIGHT) {
      d.hit = true;
      if (damagePlayer("Nasugatan ka!", false) && health > 0) {
        posX = Math.max(0, Math.min(posX + enemy.facing * ENEMY_HIT_RECOIL, WORLD_WIDTH - PLAYER_WIDTH));
        velY = HAZARD_RECOIL_VELOCITY;
      }
    }
  }
  if (u >= 1) {
    enemy.dash = null;
    enemy.cooldownUntil = now + jitter(ATTACK_COOLDOWN_MS, ATTACK_COOLDOWN_SPREAD);
  }
}

// =============================================================
// BLOWS (Block 76)
//
// How every body that can be hurt takes a blow, guard or enemy, from a
// punch or a shot: the enemies' reaction of Block 60, which Block 75
// copied onto guards, kept in one place so no kind can drift from the
// others and a new kind of enemy (content/enemies.js) gets it without
// being written for.
//
//   takeBlow(body, damage, dir, message)   a punch (1) or a shot (2)
//   knockOut(body, dir, message)           down at once: a takedown, or
//                                          a blow at no hp
//
// A blow flashes him and takes his hp. Standing, he slides back (10px at
// the blow, about 45 in all), and staggers. At no hp he slides further,
// topples the way the blow went and fades (style.css, <cls>-down and
// <cls>-fall-right / -left, the same keyframes for every kind). dir is
// the way the blow travelled, else away from Macario.
//
// What differs by kind is only what BODY_KINDS says: the body's width,
// the class prefix, how long a stagger is, what a stagger delays (a
// guard's shot, an enemy's swing), and what "down" means for him.
// =============================================================

const BODY_KINDS = {
  guard: {
    width: GUARD_WIDTH, cls: "guard", staggerMs: GUARD_STAGGER_MS, clamp: true,
    isDown: (g) => g.disabled,
    // He turns on whoever hit him, so he reels back from the blow, not
    // into it: a hostile guard already faces Macario, and this is for a
    // shot in the back (Block 75).
    hit(g, away) { g.facing = -away; },
    staggered(g, now) {
      g.aiming = false;
      g.nextShotAt = Math.max(g.nextShotAt, now + GUARD_HIT_STAGGER_MS);
    },
    down(g, away) {
      g.disabled = true;
      g.alert = 0;
      g.aiming = false;
      setTell(g, false);
      if (g.fight && !enemiesAlive()) finishFight();
      // Dropped from behind (a takedown), he falls forward as he stood;
      // otherwise backward, leaning back in his hit sheet (drawGuard).
      g.fellForward = away === g.facing;
      drawGuard(g);
    },
  },
  enemy: {
    width: ENEMY_WIDTH, cls: "enemy", staggerMs: ENEMY_STAGGER_MS, clamp: false,
    isDown: (e) => e.dead,
    hit(e, away) {
      e.fillEl.style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";
      // Block 96. One with a hit sheet turns on whoever hit him, as a
      // guard does, so he reels back from the blow and not into it.
      if (e.hitSpriteEl) e.facing = -away;
    },
    staggered(e, now) {
      e.nextSwingAt = 0;
      e.dash = null;
      endEnemyHop(e); // Block 93: a punch knocks him out of a hop
      e.cooldownUntil = Math.max(e.cooldownUntil || 0, now + ENEMY_STAGGER_MS + jitter(ATTACK_TELL_MS, ATTACK_TELL_SPREAD));
      // Block 96. Drawn now, not by the next frame, so the hit-stop that
      // follows (impact) freezes him in his flinch.
      drawEnemy(e, now);
    },
    down(e) {
      e.dead = true;
      e.dash = null;
      endEnemyHop(e);
      setTell(e, false);
      // A swing cut off by the blow is put away, or he would fall with
      // his sword still raised (Block 60); one with a hit sheet falls in
      // it, leaning back (Block 96).
      e.attacking = false;
      drawEnemy(e, performance.now());
      e.el.classList.add("enemy-down");
      if (!enemiesAlive()) finishFight();
    },
  },
};

function bodyKindOf(body) {
  return BODY_KINDS[body.kind] || BODY_KINDS.enemy;
}

function awayFromPlayer(body) {
  const centre = body.pos + bodyKindOf(body).width / 2;
  return Math.sign(centre - (posX + PLAYER_WIDTH / 2)) || 1;
}

// Moves a body along the road and draws it there. A guard is kept on
// the road; an enemy is not, since the play's soldiers wait in the wing
// beyond the stage's edge.
function moveBody(body, dx) {
  const kind = bodyKindOf(body);
  body.pos += dx;
  if (kind.clamp) body.pos = Math.max(0, Math.min(body.pos, WORLD_WIDTH - kind.width));
  body.el.style.left = body.pos + "px";
  body.drawnPos = body.pos;
}

function takeBlow(body, damage, dir, message) {
  if (!body || !body.el) return;
  const kind = bodyKindOf(body);
  if (kind.isDown(body)) return;
  const away = dir || awayFromPlayer(body);
  body.hp -= damage || 1;
  body.el.classList.add(kind.cls + "-hit");
  setTimeout(() => body.el && body.el.classList.remove(kind.cls + "-hit"), 150);
  kind.hit(body, away);
  if (body.hp <= 0) {
    knockOut(body, away, message);
    return;
  }
  // The first frame of the slide lands with the blow, so it reads
  // through the hit-stop; updateKnockback carries the rest.
  const now = performance.now();
  body.knockVel = away * ENEMY_KNOCK_SPEED;
  moveBody(body, body.knockVel);
  body.knockVel *= ENEMY_KNOCK_DECAY;
  body.hitAt = now;
  body.staggerUntil = now + kind.staggerMs;
  kind.staggered(body, now);
  impact("punch");
}

function knockOut(body, dir, message) {
  const kind = bodyKindOf(body);
  if (kind.isDown(body)) return;
  const away = dir || awayFromPlayer(body);
  body.hitAt = performance.now();
  body.el.classList.add(kind.cls + (away > 0 ? "-fall-right" : "-fall-left"));
  kind.down(body, away);
  body.knockVel = away * ENEMY_KO_KNOCK_SPEED;
  moveBody(body, body.knockVel);
  if (message) showToast(message);
  impact("knockout");
}

// An enemy takes a punch or a shot (Block 35). Since Block 76 a door
// into takeBlow, above.
function hitEnemy(enemy, damage) {
  takeBlow(enemy, damage);
}

function resetEnemies() {
  ENEMIES.forEach((enemy) => {
    if (enemy.dead) return;
    enemy.pos = enemy.x;
    enemy.hp = enemy.maxHp;
    enemy.knockVel = 0;
    enemy.nextSwingAt = 0;
    enemy.dash = null;
    endEnemyHop(enemy);
    enemy.swings = 0;
    enemy.hopped = false;
    enemy.cooldownUntil = 0;
    enemy.turnAt = 0;
    enemy.staggerUntil = 0;
    enemy.fillEl.style.width = "100%";
    setTell(enemy, false);
    enemy.attacking = false;
    enemy.walking = false;
    enemy.el.style.left = enemy.pos + "px";
    enemy.drawnPos = enemy.pos;
  });
}

// =============================================================
// AUDIO (Block 30)
//
// Three kinds of sound, and three mechanisms, because each one has a
// different cost on a low-end phone.
//
// Music is one long file (Calm.mp3, two minutes) played through a
// single <audio> element. The browser streams and decodes it as it
// plays. Decoding it up front through Web Audio would hold the whole
// track as raw samples, about 40MB, on a phone chosen for being short
// of memory.
//
// One-shot effects (the gunshot) go through Web Audio instead. An
// <audio> element on Android Chrome can start a noticeable fraction of
// a second late, which is exactly the gap between the muzzle flash and
// the bang a student would notice. A decoded two second clip is small,
// and a buffer source starts on the next audio frame. If Web Audio is
// missing or the decode fails, a plain <audio> is the fallback, late
// rather than silent.
//
// Ambience that belongs to a character (Kabayo's Horse.mp3) is an NPC's
// nearSound. It loops on its own <audio> element while Macario is in
// talking range, fades in and out rather than cutting, and starts from
// the top on each new approach so the first thing heard is a neigh
// rather than the middle of a silence.
//
// Nothing here is touched by loadAct, which runs at parse time. Every
// call site is either the game loop (first run on a later frame) or a
// function called after the page has finished parsing, so the lets
// below are always initialised before anything reads them.
// =============================================================

const MUSIC_SRC = "assets/audio/music/calm.mp3";
// Block 35. The track now playing. A scene may name its own (music) and a
// script may change it for a moment (setMusic, the fight). null is Calm.
let musicSrc = MUSIC_SRC;
// Block 58. The small effects, made by _dev/tools/make-sfx.py with their
// loudness baked into each file, so every one plays at SFX_VOLUME. All
// are events the engine already knows about (a line of dialogue, a jump,
// barya earned, a gift, a new task, a catch, a fade, a black card), so
// content names none of them and every act gets them.
const SFX_SOURCES = {
  gunShot: "assets/audio/sfx/gunshot.mp3",
  blip: "assets/audio/sfx/blip.wav",
  coin: "assets/audio/sfx/coin.wav",
  give: "assets/audio/sfx/give.wav",
  quest: "assets/audio/sfx/quest.wav",
  catch: "assets/audio/sfx/catch.wav",
  miss: "assets/audio/sfx/miss.wav",
  jump: "assets/audio/sfx/jump.wav",
  door: "assets/audio/sfx/door.wav",
  intertitle: "assets/audio/sfx/intertitle.wav",
  // Block 60. Combat (_dev/tools/make-combat-sfx.js): every punch
  // swings, a punch that lands thumps, the blow that drops someone
  // thumps harder, and Macario being hit buzzes.
  swing: "assets/audio/sfx/swing.wav",
  punch: "assets/audio/sfx/punch.wav",
  knockout: "assets/audio/sfx/knockout.wav",
  hurt: "assets/audio/sfx/hurt.wav",
  // Block 64 (_dev/tools/make-fun-sfx.js): a page found, the last page
  // found, and a streak in the apple game.
  page: "assets/audio/sfx/page.wav",
  fanfare: "assets/audio/sfx/fanfare.wav",
  streak: "assets/audio/sfx/streak.wav",
  // Block 81 (_dev/tools/make-scene-sfx.js, which also remade
  // intertitle): a crowd clapping, for the black card a content file
  // names it on (playIntertitle's sfx).
  applause: "assets/audio/sfx/applause.wav",
  // Block 85 (make-scene-sfx.js): a guard starting to notice, a guard's
  // catch, and a crowd's cheer for a dialogue line that names it.
  notice: "assets/audio/sfx/notice.wav",
  caught: "assets/audio/sfx/caught.wav",
  cheer: "assets/audio/sfx/cheer.wav",
};

// Music sits under everything else. It is the one sound that never
// stops, and a classroom of phones all playing it at full volume is
// the complaint this number exists to prevent.
const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.8;
const NEAR_SOUND_VOLUME = 0.7;
const NEAR_SOUND_FADE_MS = 500;

// Ambience starts at the same reach as the Usap prompt and stops a
// little further out. Without the gap, standing on the boundary starts
// and stops it every few frames.
const NEAR_SOUND_RELEASE = 60;

// Both on by default. shell.js hands in the stored setting at start-up,
// before any sound could have played.
let audioPrefs = { music: true, sfx: true };

let musicEl = null;
let musicWanted = false; // the world has been entered; music belongs on
// Block 36. One element per track, kept. Dropping the old one on every
// swap meant coming back to Calm downloaded two megabytes again, on a
// phone, in the middle of play.
const musicEls = new Map();

let audioCtx = null;
const sfxBuffers = {}; // name -> AudioBuffer, once decoded

const nearSoundEls = new Map(); // src -> { el, volume }
let lastNearSoundNow = 0;

function assetAudio(src, loop) {
  const el = new Audio(assetUrl(src));
  el.loop = Boolean(loop);
  el.preload = "auto";
  return el;
}

// A rejected play() is the browser refusing sound before a gesture. It
// is not an error worth a console line, and the unlock listener below
// retries on the next tap.
function tryPlay(el) {
  try {
    const p = el.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (err) {
    // Some older engines throw synchronously instead.
  }
}

function musicElementFor(src) {
  let el = musicEls.get(src);
  if (!el) {
    el = assetAudio(src, true);
    el.volume = MUSIC_VOLUME;
    musicEls.set(src, el);
  }
  return el;
}

// Fetches a track without playing it, so a swap at a dramatic moment is
// not the moment the phone starts downloading two megabytes. Content calls
// this when a scene that will need the track is entered.
function prepareMusic(src) {
  if (!src) return;
  musicElementFor(src);
}

// Swaps the track. The one playing is paused and kept, so switching back
// is instant and costs no network.
function setMusic(src) {
  const next = src || MUSIC_SRC;
  if (next === musicSrc) return;
  if (musicEl) musicEl.pause();
  musicSrc = next;
  musicEl = null;
  syncMusic();
}

function startMusic() {
  musicWanted = true;
  syncMusic();
}

function syncMusic() {
  const shouldPlay = musicWanted && audioPrefs.music && !document.hidden;
  if (!shouldPlay) {
    if (musicEl && !musicEl.paused) musicEl.pause();
    return;
  }
  musicEl = musicElementFor(musicSrc);
  if (musicEl.paused) tryPlay(musicEl);
}

function ensureAudioContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    audioCtx = new Ctx();
  } catch (err) {
    return null;
  }
  return audioCtx;
}

// Fetched and decoded once, as soon as the page has parsed, so the
// first shot is not the one that waits for the network. A context made
// before a gesture starts suspended; decoding still works in that state.
function preloadSfx() {
  const ctx = ensureAudioContext();
  if (!ctx || !window.fetch) return;
  Object.keys(SFX_SOURCES).forEach((name) => {
    fetch(assetUrl(SFX_SOURCES[name]))
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(res.status)))
      .then((data) => new Promise((resolve, reject) => {
        // The callback form, because older Android WebViews never
        // returned a promise from decodeAudioData.
        ctx.decodeAudioData(data, resolve, reject);
      }))
      .then((buffer) => { sfxBuffers[name] = buffer; })
      .catch(() => {}); // the <audio> fallback in playSfx covers it
  });
}

function playSfx(name) {
  if (!audioPrefs.sfx || document.hidden) return;
  const src = SFX_SOURCES[name];
  if (!src) return;

  const ctx = audioCtx;
  const buffer = sfxBuffers[name];
  if (ctx && buffer) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = SFX_VOLUME;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    return;
  }

  const el = assetAudio(src, false);
  el.volume = SFX_VOLUME;
  tryPlay(el);
}

// Block 99. A person drawn side on (facesPlayer, in content) looks at
// Macario: whichever side of him Macario stands on, turning as he walks
// past. Before this an NPC only ever faced the way his art was drawn,
// so the direktor on the street looked away from a Macario arriving
// from the left, and in the wings, where Macario stands to his right,
// a fixed facing would have been wrong the other way. NPC_TURN_DEADBAND
// keeps him from flickering while Macario stands right in front of
// him. Written only when the side changes (Block 36), and never to a
// placeholder box, whose file name would read backwards: only once the
// sheet has loaded (naturalWidth) does a sprite turn.
const NPC_TURN_DEADBAND = 12;

function updateNpcFacing() {
  const centre = posX + PLAYER_WIDTH / 2;
  for (const npc of NPCS) {
    if (!npc.facesPlayer || npc.hidden || !npc.spriteEl) continue;
    if (!npc.animation || npc.animation.failed || !npc.animation.naturalWidth) continue;
    const off = centre - (npc.x + NPC_WIDTH / 2);
    if (Math.abs(off) < NPC_TURN_DEADBAND) continue;
    const dir = off < 0 ? -1 : 1;
    if (dir === npc.drawnFacing) continue;
    npc.spriteEl.style.transform = dir < 0 ? "scaleX(-1)" : "";
    npc.drawnFacing = dir;
  }
}

// Called every frame from the top of gameLoop, paused or not. Decides
// which NPC ambience should be audible and eases each element's volume
// toward that, so walking away fades Kabayo out rather than cutting him
// off mid-neigh. A paused world, an open screen or a hidden tab counts
// as nobody being near.
function updateNearSounds(now) {
  const dt = lastNearSoundNow ? Math.min(now - lastNearSoundNow, 100) : 16;
  lastNearSoundNow = now;

  const live = !paused && !uiBlocked && !authGated && !document.hidden &&
    audioPrefs.sfx;
  const wanted = new Set();

  for (const npc of NPCS) {
    if (!npc.nearSound) continue;
    let on = false;
    if (live && !npc.hidden) {
      const gap = edgeGap(posX, PLAYER_WIDTH, npc.x, NPC_WIDTH);
      on = gap < INTERACT_DISTANCE ||
        (npc.nearSoundOn && gap < INTERACT_DISTANCE + NEAR_SOUND_RELEASE);
    }
    npc.nearSoundOn = on;
    if (on) wanted.add(npc.nearSound);
  }

  // A scene with nothing to say, and nothing still fading: done.
  if (!wanted.size && !nearSoundEls.size) return;

  wanted.forEach((src) => {
    if (!nearSoundEls.has(src)) {
      nearSoundEls.set(src, { el: assetAudio(src, true), volume: 0 });
    }
  });

  const stepAmount = (NEAR_SOUND_VOLUME / NEAR_SOUND_FADE_MS) * dt;
  nearSoundEls.forEach((entry, src) => {
    const target = wanted.has(src) ? NEAR_SOUND_VOLUME : 0;
    if (entry.volume < target) {
      entry.volume = Math.min(target, entry.volume + stepAmount);
    } else if (entry.volume > target) {
      entry.volume = Math.max(target, entry.volume - stepAmount);
    }
    entry.el.volume = entry.volume;

    if (target > 0 && entry.el.paused) {
      tryPlay(entry.el);
    } else if (target === 0 && entry.volume === 0) {
      // Faded all the way out: stop, rewind for the next approach, and
      // forget it, so a scene left behind costs nothing per frame.
      entry.el.pause();
      try { entry.el.currentTime = 0; } catch (err) {}
      nearSoundEls.delete(src);
    }
  });
}

function setAudio(prefs) {
  if (prefs && typeof prefs.music === "boolean") audioPrefs.music = prefs.music;
  if (prefs && typeof prefs.sfx === "boolean") audioPrefs.sfx = prefs.sfx;
  syncMusic();
  // updateNearSounds reads audioPrefs.sfx on the next frame and fades
  // any ambience out on its own; nothing to do for it here.
}

// A phone locked or switched away from Chrome should go quiet. Chrome
// usually silences a hidden tab itself, but not reliably on every
// Android build, and a phone in a pocket playing music through a
// lesson is the one audio failure a teacher would hear about.
document.addEventListener("visibilitychange", () => {
  syncMusic();
  if (audioCtx) {
    if (document.hidden) audioCtx.suspend().catch(() => {});
    else audioCtx.resume().catch(() => {});
  }
});

// The browser will not start sound until the page has had a gesture.
// The title tap normally counts, so music starts straight after it, but
// if play() was refused anyway this retries on the next touch or key,
// which is also when a suspended Web Audio context is allowed to resume.
["pointerdown", "keydown", "touchend"].forEach((type) => {
  document.addEventListener(type, () => {
    if (audioCtx && audioCtx.state === "suspended" && !document.hidden) {
      audioCtx.resume().catch(() => {});
    }
    if (musicWanted) syncMusic();
  }, { capture: true, passive: true });
});

preloadSfx();

// =============================================================
// PAUSE
//
// shell.js owns the pause SCREEN. This owns the pause STATE,
// because everything that has to stop lives in this file.
//
// Drawing a panel over the world is not enough. Guards keep
// patrolling behind it and a detection meter keeps filling, which
// is exactly the unfairness the meter was introduced to prevent.
// So the loop stops doing work at all rather than being hidden.
//
// The subtler half is the timers. Invulnerability and the attack
// hold are both measured against performance.now(), which does not
// stop for a pause screen. Left alone, a ten second pause silently
// eats the one second invulnerability window, and a student who
// paused mid-hold releases into a throw they never asked for. Both
// are pushed forward by however long the pause actually lasted.
// =============================================================

let paused = false;
let pausedAt = 0;

function isPaused() {
  return paused;
}

// Every timer measured against performance.now() that the world's
// stopping would otherwise let run out: carried forward by the time it
// stood still, for a pause and for a tutorial alike (Block 92).
function shiftTimers(elapsed) {
  if (invulnUntil) invulnUntil += elapsed;
  if (attackHoldStart) attackHoldStart += elapsed;
  if (landPoseUntil) landPoseUntil += elapsed;
  if (dashReadyAt) dashReadyAt += elapsed;
  if (dashStumbleUntil) dashStumbleUntil += elapsed;
  ENEMIES.forEach((e) => {
    ["nextSwingAt", "staggerUntil", "cooldownUntil", "turnAt", "hitAt", "shuffleUntil"].forEach((k) => { if (e[k]) e[k] += elapsed; });
    if (e.dash) e.dash.t0 += elapsed;
    if (e.hop) e.hop.t0 += elapsed; // Block 93
  });
  GUARDS.forEach((g) => {
    ["nextShotAt", "staggerUntil", "turnAt", "aimSince", "lowerSince", "shotAt", "noticedAt", "hitAt"]
      .forEach((k) => { if (g[k]) g[k] += elapsed; });
  });
}

function setPaused(value) {
  const next = Boolean(value);
  if (next === paused) return next;

  // Pausing mid-cutscene is refused rather than handled. The stage
  // sequence is driven by awaited wait() promises, and no flag in
  // here can suspend a setTimeout that has already been scheduled;
  // allowing it would desynchronise the poem from the night
  // transition. A cutscene is short and tapped through, so refusing
  // costs little. The caller is told, so it can leave its screen
  // closed rather than opening one over a game that never stopped.
  if (next && cutscenePlaying) return false;

  paused = next;

  if (paused) {
    pausedAt = performance.now();
  } else {
    shiftTimers(performance.now() - pausedAt);

    // Resume on a fresh delta. Without this, the first frame back
    // integrates the entire pause in one step. It is clamped to
    // three frames, so nothing falls through the floor, but it is
    // still a visible jolt.
    lastFrameNow = 0;
    lastFrameTime = 0;
  }

  return paused;
}

// --- Game loop ---
let lastFrameNow = 0;

// Block 66. Adds or removes a class only when it is not already so. The
// game loop sets the HUD's buttons shown or hidden every frame, and a
// classList.add of a class already there is still an attribute write:
// measured, six of them a frame were a mutation and a style
// invalidation sixty times a second while standing still.
function setClass(el, cls, on) {
  if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on);
}

function gameLoop(now) {
  now = now || 0;

  // Before the pause check, on purpose: a paused world has to be able
  // to fade its ambience OUT, and the paused branch below does nothing
  // else.
  updateNearSounds(now);

  // A paused game does no work whatsoever. The next frame is still
  // requested, so resuming is a flag flip rather than a restart.
  if (paused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  updateNpcFacing();

  // Block 60. A hit-stop: nothing moves and no sprite steps a frame, but
  // the camera still shakes, so the blow lands on a held picture. The
  // frame clock is kept current, so the frame after is an ordinary one
  // rather than one big step.
  if (now < hitStopUntil) {
    lastFrameNow = now;
    if (lastCameraX !== null) drawCamera(lastCameraX, now);
    requestAnimationFrame(gameLoop);
    return;
  }

  // Frame delta expressed in 60fps frames, clamped so a tab returning from
  // the background does not integrate one huge step and drop the player
  // through the floor. The target device will not hold 60fps, and a
  // frame-counted jump would reach half its height at 30.
  const step = lastFrameNow ? Math.min((now - lastFrameNow) / 16.67, 3) : 1;

  // Play time in real milliseconds, from the same delta the physics uses
  // and clamped the same way. Paused frames never reach here because the
  // loop returns early above, so pause is excluded for free; the login
  // screen and any open overlay are excluded explicitly.
  //
  // This is deliberately not the difference between two wall-clock
  // timestamps, which would count the minutes a student spent with the
  // tab in their pocket.
  const deltaMs = lastFrameNow ? Math.min(now - lastFrameNow, 50) : 0;
  if (!authGated && !uiBlocked) playMs += deltaMs;

  lastFrameNow = now;

  let isWalking = false;
  const canAct = !inDialogue && !cutscenePlaying && !authGated && !uiBlocked;
  if (!uiBlocked) updateFastForward(now); // Block 85

  // Block 63. The way being held, and a run once it has been held long
  // enough; both keys together is no way at all, and stays a walk.
  const heldDir = keysPressed["d"] && !keysPressed["a"] ? 1 :
                  keysPressed["a"] && !keysPressed["d"] ? -1 : 0;
  const moveSpeed = updateRun(heldDir, canAct, now, step);

  if (!canAct) dash = null;
  const dashing = dash ? updateDash(deltaMs, now) : false;
  if (dashing) isWalking = true;
  if (canAct && !dashing && now >= dashStumbleUntil) {
    if (keysPressed["a"]) {
      posX -= moveSpeed * step;
      facing = -1;
      isWalking = true;
    }
    if (keysPressed["d"]) {
      posX += moveSpeed * step;
      facing = 1;
      isWalking = true;
    }
    posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  }

  // Vertical motion resolves every frame regardless of canAct, so a player
  // who triggers dialogue mid-air still lands rather than hanging there.
  velY -= GRAVITY * step;
  if (velY < TERMINAL_VELOCITY) velY = TERMINAL_VELOCITY;

  const previousY = posY;
  posY += velY * step;

  const surface = groundHeightAt(posX, previousY);
  if (posY <= surface) {
    // Block 35. Touching down from a real fall holds the landing frame
    // for a moment. Measured by the speed he lands at, so stepping down
    // a ramp does not count as a landing.
    if (!onGround && velY < -4) {
      landPoseUntil = now + LAND_POSE_MS;
      spawnDust(posX + PLAYER_WIDTH / 2, surface, facing, "land"); // Block 63
    }
    posY = surface;
    velY = 0;
    onGround = true;
    lastGroundedAt = now;
    // Block 63. A jump pressed just before touching down happens now.
    if (jumpBufferedAt && now - jumpBufferedAt <= JUMP_BUFFER_MS) {
      jumpBufferedAt = 0;
      handleJumpPress();
    }
  } else {
    onGround = false;
  }
  const airborne = !onGround && (velY > 0 || posY - surface > AIRBORNE_MIN_HEIGHT);

  // Walking or in the air is moving; anything else, including talking
  // or holding the attack button, is standing still.
  playerStill = !isWalking && onGround;
  // Block 92. A tutorial stops these and only these; Macario's own
  // controls, gravity and the camera go on.
  if (tutorial && (tutorial.def.task === "move" || tutorial.def.task === "react") &&
      Math.abs(posX - tutorial.startX) > 60) noteTask("move");
  // Block 93. Hidden behind a crate is shown: the crate stands in front
  // of him (style.css) and he is dimmed while it covers him.
  setClass(player, "player-hiding", HIDE_SPOTS.length > 0 && onGround && inHideSpot(posX));
  if (canAct && !tutorial) updateGuards(step);
  if (canAct && !tutorial) updateGuardBullets(step);
  if (canAct && !tutorial) updateEnemies(step, now);
  updateKnockback(step);

  // After the vertical resolution, so the ground test sees where the
  // player actually ended up this frame rather than where they were
  // mid-fall.
  updateHazards();
  updatePickups();

  updateProjectile(step);

  // While an attack clip owns the pose (aiming, firing or punching) it is
  // left alone — see updateAttackHoldPose, playShootFire and playMelee.
  // Block 93. A cutscene no longer freezes whatever pose was showing when
  // it began: a walk caught mid-step stayed a walk in place for the whole
  // scene. It picks the pose the same way, with nothing held (isWalking is
  // false under a cutscene), so he stands, and a script's jump shows the
  // jump.
  if (canAct) updateAttackHoldPose(now);
  // Block 57. A script walking him (movePlayer) shows the walk even
  // though the cutscene holds everything else still.
  if (scriptWalking && !shooting) {
    applyAnim("walk");
  } else if (!shooting) {
    if (airborne) {
      applyAnim(velY > 0 ? "jumpRise" : "jumpFall");
    } else if (!isWalking && now < landPoseUntil) {
      applyAnim("jumpLand");
    } else {
      applyAnim(isWalking && onGround ? "walk" : "idle");
    }
  }
  updateAnimFrame(now);
  updateMeleeContact(now, canAct); // Block 71
  npcAnimators.forEach((animator) => animator.update(now));

  // Writing the same pixel back still invalidates the element, so both
  // are written only when they move (Block 36). Standing still, reading
  // dialogue or in a shop, this is the difference between a frame that
  // lays out and one that does not.
  if (posX !== lastDrawnX) {
    player.style.left = posX + "px";
    lastDrawnX = posX;
  }
  if (posY !== lastDrawnY) {
    player.style.bottom = posY + "px";
    lastDrawnY = posY;
  }

  // Camera: centre the player, clamped to world bounds.
  let cameraX = posX - (viewportWidth || measureViewport()) / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  drawCamera(cameraX, now);
  updatePickupMotion(cameraX); // Block 64


  // Interact and gift buttons follow whichever NPC or stage is nearby.
  if (!inDialogue && !cutscenePlaying && !authGated && !uiBlocked) {
    setClass(mobileControls, "hidden", false);
    // The pause button rides along with the movement controls rather
    // than tracking its own condition. The branch this sits in is
    // already the exact definition of "the student is playing", and a
    // second copy of it would be a second thing to keep in step.
    if (btnPause) setClass(btnPause, "hidden", false);
    if (btnInventoryMain && window.Inventory) {
      setClass(btnInventoryMain, "hidden", false);
    }
    if (btnShopMain && window.Inventory) {
      setClass(btnShopMain, "hidden", false);
    }
    nearby = findNearby();
    // Block 92. The first person within reach is taught to be talked to.
    if (nearby.type === "npc" && !nearby.ref.scenery && !nearby.ref.interactLabel && !tutorial) teach("usap", true);
    if (nearby.type === "npc" && npcOpensShop(nearby.ref)) {
      setLabel(btnInteract, "Tindahan");
      setClass(btnInteract, "active", true);
    } else if (nearby.type === "npc") {
      setLabel(btnInteract, nearby.ref.interactLabel || "Usap");
      // Block 93. The icon says what E will do: an NPC used rather than
      // talked to names its own (interactIcon), a door is a door.
      setIcon(btnInteract, nearby.ref.interactLabel ? (nearby.ref.interactIcon || "i-hand") : "i-talk");
      setClass(btnInteract, "active", true);
    } else if (nearby.type === "exit") {
      setLabel(btnInteract, nearby.ref.label || "Pasok");
      setIcon(btnInteract, "i-out");
      setClass(btnInteract, "active", true);
    } else {
      setLabel(btnInteract, "E");
      setIcon(btnInteract, "i-talk");
      setClass(btnInteract, "active", false);
    }

    if (nearby.type === "npc" && canGiveGift(nearby.ref)) {
      setLabel(giftBtn, nearby.ref.gift.buttonLabel);
      setClass(giftBtn, "hidden", false);
    } else {
      setClass(giftBtn, "hidden", true);
    }
  } else {
    // Dialogue or cutscene is showing. Tapping the dialogue box
    // advances it, so tuck the movement controls away.
    setClass(mobileControls, "hidden", true);
    if (btnPause) setClass(btnPause, "hidden", true);
    if (btnInventoryMain) setClass(btnInventoryMain, "hidden", true);
    if (btnShopMain) setClass(btnShopMain, "hidden", true);
    setClass(giftBtn, "hidden", true);
    setLabel(btnInteract, "E");
    setClass(btnInteract, "active", false);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// =============================================================
// AUTH + SAVE/LOAD (Supabase)
// Login only. Accounts are pre-created by the developer via the
// admin script, not by self-signup.
// =============================================================

const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authStatus = document.getElementById("auth-status");
const authOverlay = document.getElementById("auth-overlay");

let currentUserId = null;
let currentProfile = null; // the logged-in student's profiles row
let isGuest = false; // see enterGameAsGuest, Block 14
let autosaveTimer = null; // guards against stacking a second interval

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authSubmit.disabled = true;
  authStatus.textContent = "Loading...";
  authStatus.className = "";

  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // On success, onAuthStateChange takes over.
  } catch (err) {
    authStatus.textContent = err.message || "May error, subukan ulit.";
    authStatus.className = "";
  } finally {
    authSubmit.disabled = false;
  }
});

// AUTH BOOTSTRAP RUNS AFTER EVERY SCRIPT TAG HAS PARSED.
//
// This used to run at parse time, and that was a real bug rather
// than a style point. acts.js and assessment.js load AFTER this
// file, by design, but enterGameAsUser needs both. When a session
// is already in storage, getSession() resolves on a microtask,
// which runs before the browser reaches the next script tag. The
// act lookup was therefore skipped on every single reload, the
// window.Acts guards silently swallowed it, and the student was
// dropped into Act I no matter what current_act said.
//
// DOMContentLoaded fires after all synchronous scripts at the end
// of body have executed, so by here the whole page is assembled.
// The listener is registered rather than called directly because
// this file is not last in the document.
document.addEventListener("DOMContentLoaded", startAuth);

function startAuth() {
  sb.auth.onAuthStateChange((_event, session) => {
    if (session) enterGameAsUser(session.user.id);
  });

  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) enterGameAsUser(session.user.id);
  });
}

async function enterGameAsUser(userId) {
  if (currentUserId === userId) return; // already entered

  // Look up the role before doing anything student-specific. A teacher
  // reaching this point would otherwise be dropped into the game and
  // given a game_progress row, polluting their own class averages.
  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("id, role, full_name, class_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch failed:", profileError);
    authStatus.textContent = "May error sa account. Subukan ulit.";
    return;
  }

  if (profile && profile.role === "teacher") {
    authStatus.textContent = "Teacher account, inililipat sa dashboard...";
    authStatus.className = "success";
    window.location.replace("teacher.html");
    return;
  }

  // --- Student path ---
  currentUserId = userId;
  currentProfile = profile || null;
  authOverlay.classList.add("hidden");
  authGated = false;

  // ORDER HERE IS LOAD BEARING, in three separate ways.
  //
  // The act_progress map has to be read before the act is chosen,
  // because Acts.resolveAct cannot tell a locked act from an open
  // one without it.
  //
  // The act has to be loaded before the save is applied, because
  // loadAct() resets posX to that act's startX and would otherwise
  // throw away the restored position.
  //
  // And syncStart has to run last, because its catch-up objective
  // count reads the flags the save restores, and because it is what
  // resumes the pre-test, which must not begin until the shell has
  // handed the screen over.
  const row = await loadProgress(userId);
  if (!row) return;

  let actNumber = 1;
  if (window.Acts) {
    await Acts.loadProgressMap();
    actNumber = Acts.resolveAct(row.current_act);

    // Set before saves are unblocked, so nothing can write a stale
    // current_act in the window before syncStart runs.
    Acts.current = actNumber;

    // Always reload, even for Act I, because the stored scene may not be
    // the one the parse-time load built. An unknown scene id, including
    // the "empty" that old saves hold, falls back to the act's first
    // scene inside loadScene, which is the whole legacy migration.
    loadAct(Acts.getAct(actNumber), row.current_room);
  }

  applyLoadedState(row);

  saveReady = true;

  // The world is built and the save is restored. Hand the screen to
  // the shell and WAIT there for the student to tap Magpatuloy.
  //
  // This call is the only signal the shell gets, deliberately. An
  // event was tried first and is the wrong mechanism: shell.js
  // registers its listener inside its own DOMContentLoaded handler,
  // which runs after this file's, and the browser drains microtasks
  // between the two. A stored session can therefore have this function
  // already running before the shell is listening at all. That is the
  // same microtask hazard recorded in the pitfalls below, and calling
  // the shell directly is immune to it.
  //
  // Waiting here, rather than letting syncStart run underneath, is the
  // whole point. syncStart resumes the trivia card and the pre-test,
  // and those open an overlay of their own. Started now, they would
  // run behind the title screen, where a student can neither see them
  // nor answer them, and the first thing they would meet on tapping
  // Magpatuloy is a test already in progress.
  //
  // THIS IS THE ONE PLACE ANYTHING GUARDS ON window.Shell. Everywhere
  // else a missing shell should fail loudly and immediately, because
  // it is not optional the way assessment.js is. Here it would instead
  // hang the login on a promise that nothing left on the page can ever
  // resolve, and a student staring at a frozen screen cannot report
  // what went wrong.
  if (window.Shell) await Shell.awaitEntry();

  // The title tap that resolved awaitEntry is the user gesture a
  // browser wants before it will play sound; see startMusic.
  startMusic();

  if (window.Acts) await Acts.syncStart(actNumber);

  // Block 52. Only while the act is actually being played: a student who
  // lands on the completed screen, or in a locked act, has no scene to
  // watch.
  if (!window.Acts || Acts.status === "playing") enterWorldScripts();

  // Safety-net save, in case something set saveDirty without going
  // through markDirty's own debounce.
  if (autosaveTimer === null) {
    autosaveTimer = setInterval(() => {
      if (saveDirty) saveProgress();
    }, 10000);
  }
}

// Block 14. Play-as-guest: skips Supabase entirely rather than
// authenticating as a real, disposable account. currentUserId is
// deliberately never set for a guest, which is what makes this safe
// to add without touching every write site by hand: saveProgress,
// Acts.syncStart, Acts._ensureRow, Acts.setStatus and
// Acts.checkObjectives all already refuse to run without a
// currentUserId (see acts.js), because that guard was written for
// "nothing to write yet" rather than "guest", and it already covers
// this case for free. A guest therefore gets exactly Act I's world —
// movement, dialogue, combat, health — and nothing that touches the
// database: no game_progress row, no act_progress row, no trivia, no
// pre-test or post-test, no currency, no equipment grant. Closing the
// tab loses everything, which is the point.
//
// See CLAUDE.md, Decisions on record, Guest mode, for why
// Acts.syncStart is skipped outright rather than called and trusted
// to no-op.
async function enterGameAsGuest() {
  if (currentUserId || isGuest) return; // a real login, or already a guest

  isGuest = true;
  authOverlay.classList.add("hidden");
  authGated = false;

  if (window.Acts) {
    Acts.current = 1;
    loadAct(Acts.getAct(1), "tondo");
    // The teacher's Talaan papers are for guests too (Block 70): a read
    // of public content, nothing written.
    if (Acts.loadTalaan) Acts.loadTalaan(1);
  }

  if (window.Shell) await Shell.awaitEntry();
  startMusic();
  enterWorldScripts();
}

async function loadProgress(userId) {
  let { data: row, error } = await sb
    .from("game_progress")
    .select("*")
    .eq("student_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Load error:", error);
    return null;
  }

  if (!row) {
    // First time playing. Create a default save row.
    const { data: inserted, error: insertError } = await sb
      .from("game_progress")
      .insert({ student_id: userId })
      .select()
      .single();
    if (insertError) {
      console.error("Insert error:", insertError);
      return null;
    }
    row = inserted;
  }

  // Returns rather than applying. The caller has to load the right
  // act in between reading this row and restoring it.
  return row;
}

function applyLoadedState(row) {
  const saved = row.save_state || {};

  if (Array.isArray(saved.quests)) {
    quests.length = 0;
    quests.push(...saved.quests);
    renderQuests();
  }

  if (saved.flags) {
    Object.assign(state.flags, saved.flags);
  }

  // Absent on any save written before Block 9, which is why each field is
  // checked rather than the object being assigned wholesale. An older
  // save resumes with zeroed counters, which is the best that can be done
  // for data that was never recorded.
  if (saved.stats) {
    if (typeof saved.stats.damageTaken === "number") {
      damageTaken = saved.stats.damageTaken;
    }
    if (typeof saved.stats.detections === "number") {
      detections = saved.stats.detections;
    }
    if (typeof saved.stats.playMs === "number") {
      playMs = saved.stats.playMs;
    }
  }

  if (typeof row.currency === "number") currency = row.currency;
  // Block 52. A step that counts barya was drawn before the balance was
  // restored; draw it again with the real number.
  renderQuests();

  if (typeof saved.posX === "number") {
    posX = saved.posX;
    // Drop to whatever surface is under the restored position, rather
    // than resuming at the height the previous scene happened to use.
    posY = floorHeightAt(posX);
    velY = 0;
  }

  // currentRoom is set by loadScene, which has already run and has
  // already resolved an unknown or legacy scene id to a real one.

  // Any NPC whose reveal flag is already set in the restored save.
  revealNpcsByFlag();
  // Block 81. And any guard or crate the restored story puts on duty.
  refreshOnDuty();
  // Block 68. The scene was built before these flags arrived: the hints
  // are laid again from the save's seed, and any already found are gone.
  refreshPickups();

  // Health is deliberately not restored. A student who closed the tab on
  // one heart resumes at full, because punishing them for a bus arriving
  // is not a mechanic worth having.
  health = maxHealth;
  updateHudVisibility();
}

function markDirty() {
  // Block 48. Flags are set by content directly and then markDirty is
  // called, so this is the one place a change of step is always seen.
  if (currentActData && currentActData.linearObjectives) renderQuests();
  saveDirty = true;
  clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    if (saveDirty) saveProgress();
  }, 800);
}

async function saveProgress() {
  if (!currentUserId || !saveReady) return;
  saveDirty = false;

  const payload = {
    student_id: currentUserId,
    current_room: currentRoom,
    // Without this the column keeps its default of 1 forever, the
    // dashboard's Act column is meaningless, and there is nothing
    // for the next login to resume into.
    current_act: window.Acts ? Acts.current : 1,
    currency,
    save_state: {
      quests,
      flags: state.flags,
      posX,
      stats: { damageTaken, detections, playMs },
    },
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("game_progress").upsert(payload);
  if (error) console.error("Save error:", error);

  // Recount objectives on the same cadence as the save rather than
  // after every flag mutation. This early-returns when the count has
  // not moved, so most calls cost nothing.
  if (window.Acts) Acts.checkObjectives();
}

window.addEventListener("beforeunload", () => {
  if (saveDirty) saveProgress();
});

// Logout has to await this. saveProgress is debounced by 800ms, so
// signing out in the second after an objective registers would drop
// it, and a shared classroom phone is exactly where logout gets used
// one second after something happened.
async function flushSave() {
  clearTimeout(saveDebounceTimer);
  if (saveDirty) await saveProgress();
}

// The opposite of flushSave, and the only caller is the full reset.
//
// After reset_my_play_data() has run there is no game_progress row,
// and every piece of state this file is holding describes a student
// who no longer exists in the database. Anything that writes between
// the wipe and the reload puts some of it straight back, which is
// the difference between a fresh start and a half-wiped account that
// looks fine and is not.
//
// All four write paths have to stop, not just the debounce: the
// pending timer, the ten second autosave, the beforeunload flush
// (which reads saveDirty), and saveProgress itself (which is gated
// on saveReady). Clearing only the timer was the first version of
// this and the autosave rewrote the row two seconds later.
function stopSaving() {
  saveReady = false;
  saveDirty = false;
  clearTimeout(saveDebounceTimer);
  if (autosaveTimer !== null) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
}

// =============================================================
// SHELL FACADE
//
// The whole of what shell.js is allowed to touch. Everything else
// in this file stays private to it.
//
// Unlike window.Assessment, this is NOT optional, and nothing
// should guard on its presence. assessment.js can be absent and the
// act flow degrades honestly to playing then completed; a missing
// shell means no way into the game at all. A guard there would turn
// a load failure into a blank screen with nothing in the console.
// =============================================================

window.Game = {
  // Block 92. shell.js reports the tasks only it can see (opening the bag).
  noteTask,
  setPaused,
  isPaused,
  flushSave,

  // Silences every save path. Called by shell.js immediately before
  // the full reset, so nothing writes the wiped student back.
  stopSaving,
  setUiBlocked,
  isSignedIn: () => Boolean(currentUserId),

  // Block 14. See enterGameAsGuest above for what a guest does and,
  // more importantly, does not do.
  enterAsGuest: enterGameAsGuest,
  isGuest: () => isGuest,

  // Read by acts.js, which is the only thing that writes them anywhere.
  // Returned as a copy so a caller cannot mutate the engine's counters by
  // holding onto the object.
  stats: () => ({ damageTaken, detections, playMs }),

  // Set by inventory.js from the student's equipped items, and by nothing
  // else. Takes numbers rather than items deliberately: the engine applies
  // a bonus and a multiplier and never learns what produced them, which is
  // the same line game.js holds against acts.js.
  setEffects,

  // Block 25. Health as the inventory screen needs it: what the student
  // has, to decide whether an apple would do anything, and a heal, which
  // is the whole of what a consumable does to the engine. heal refuses at
  // full health and reports it, so a use is never spent for nothing, the
  // same rule a heart pickup follows. Numbers in, numbers out: the engine
  // still never learns that the heal was an apple.
  health: () => ({ health, max: maxHealth }),

  heal(amount) {
    const n = Math.max(0, Math.floor(Number(amount) || 0));
    if (!n || health >= maxHealth) return false;
    health = Math.min(maxHealth, health + n);
    renderHearts();
    return true;
  },

  // Block 30. The two sound switches, as plain booleans. shell.js owns
  // the setting and where it is stored; this owns what it silences.
  setAudio,
  audio: () => ({ music: audioPrefs.music, sfx: audioPrefs.sfx }),

  // Block 57. The tasks already done, for the settings panel, which is
  // where they are listed now rather than under the log. Lines only.
  doneQuests: doneQuestTexts,

  // Block 68. The Talaan as the pause screen lists it: the glossary's
  // words and the hints found, or null for an act with neither.
  glossary: glossaryState,
  setHintPool,

  // Block 62. The picture loader, for the title screen's bar and for
  // holding the world closed until its art is in. Counts only; the
  // shell draws them.
  assetProgress,
  onAssetProgress,
  whenAssetsSettled,
  retryAssets, // Block 78

  // Swaps the player's sprite sheets for an outfit's. Awaitable, because
  // the sheets have to load before the swap is visible.
  setOutfit,
  setOutfitTint, // Block 85

  // Currency. acts.js awards it, inventory.js spends it, and the column
  // itself is written by saveProgress along with everything else, so an
  // award costs no extra round trip.
  currency: () => currency,

  addCurrency(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0));
    if (!n) return currency;
    currency += n;
    markDirty();
    playSfx("coin"); // Block 58
    floatOverPlayer("+" + n, "coin"); // Block 67
    return currency;
  },

  // Returns false and changes nothing when the student is short, so a
  // caller can treat it as the whole of the affordability check.
  spendCurrency(amount) {
    const n = Math.max(0, Math.round(Number(amount) || 0));
    if (n > currency) return false;
    currency -= n;
    markDirty();
    return true;
  },

  // Called from Acts.enterAct, so the counters are per act. NOT called on
  // respawn, on a scene change, or on death: being sent back to the start
  // of the outpost is the cost of being caught, and wiping the record of
  // it would make the score measure the last attempt rather than the act.
  resetStats() {
    damageTaken = 0;
    detections = 0;
    playMs = 0;
  },

  // shell.js is the only thing that knows how to open the shop screen,
  // and game.js is the only thing that knows an NPC just asked for it
  // (opensShop: true, handled in handleInteractPress). Registered once,
  // from shell.js's own init, the same direction Inventory.onChange
  // already runs in.
  onShopRequest(fn) {
    shopRequestListener = typeof fn === "function" ? fn : null;
  },
};

// Block 62. The service worker (sw.js, at the root so its scope is the
// whole game). https only, which is GitHub Pages and never the harness
// on localhost, where it would sit between the page and the routes that
// swap in the fake Supabase client; a check that wants it sets
// window.__SW_TEST first. Registered after load so it never competes
// with the first scene's pictures for the connection.
if ("serviceWorker" in navigator &&
    (window.__SW_TEST || (location.protocol === "https:" && !window.__TEST))) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker not registered:", err);
    });
  });
}
