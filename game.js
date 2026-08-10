const world = document.getElementById("world");
const viewport = document.getElementById("viewport");
const player = document.getElementById("player");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnInteract = document.getElementById("btn-interact");
const mobileControls = document.getElementById("mobile-controls");

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

const WORLD_WIDTH = 4400;
const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;
const PLATFORM_HEIGHT = 40; // must match #stage-platform's CSS height
const GROUND_LEVEL = 60; // must match --ground-level in style.css
const DISPLAY_HEIGHT = 134; // shared on-screen sprite height (player + animated NPCs)

// --- Game state ----------------------------------------------------------
const state = {
  flags: {}, // arbitrary story flags, e.g. hasBuko, bukoGiven
};

// --- Quest system ----------------------------------------------------------
const quests = []; // { id, text, done }

function addQuest(id, text) {
  if (quests.some((q) => q.id === id)) return;
  quests.push({ id, text, done: false });
  renderQuests();
}

function completeQuest(id) {
  const q = quests.find((q) => q.id === id);
  if (q) q.done = true;
  renderQuests();
}

function renderQuests() {
  questListEl.innerHTML = "";
  quests.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = q.text;
    if (q.done) li.classList.add("completed");
    questListEl.appendChild(li);
  });
}

// Starting quest
addQuest("go-to-work", "Pumunta sa trabaho");

// --- NPC configuration -------------------------------------------------
// Images are expected to live in the same folder as index.html.
// Positions (x) are left to right along the road.
// Each NPC has one or more "dialogueSets" — the first time you talk you get
// set 0, the next time set 1, and so on; it stays on the last set after that.
// A set can define onComplete(), run once, right when that conversation ends.
const NPCS = [
  {
    id: "nanay",
    x: 700,
    animation: { src: "Nanay.png", frames: 7, fps: 6 },
    label: "Nanay Sakay",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Nanay Sakay", text: "Kamusta trabaho nak?" },
          { speaker: "Ikaw", text: "Late na ko 'ma" },
          {
            speaker: "Nanay Sakay",
            text: "Paki-bigay itong buko sa barbero, nanghihingi siya kahapon",
          },
          { speaker: "Ikaw", text: "Sige Inay, ingat ka" },
        ],
        onComplete: () => {
          state.flags.hasBuko = true;
          addQuest("give-buko", "Ibigay ang buko sa barbero");
        },
      },
    ],
  },
  {
    id: "stablehand",
    x: 1100,
    animation: { src: "Stablehand.png", frames: 14, fps: 6 },
    label: "Stablehand",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Stablehand", text: "Magandang umaga Macario" },
          { speaker: "Ikaw", text: "Magandang umaga kaibigan, kamusta ang mga kabayo?" },
          { speaker: "Stablehand", text: "Ayos lang, hinahanap ka na" },
          { speaker: "Kabayo", text: "*neigh*" },
          { speaker: "Ikaw", text: "*Hinaplos ni Macario*" },
          { speaker: "Stablehand", text: "Sige na una na ko, mag ingat kayo!" },
        ],
      },
    ],
  },
  {
    id: "tailor",
    x: 1900,
    img: "Tailor.png",
    label: "Tailor",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Tailor", text: "Macario toy, Macario!" },
          {
            speaker: "Tailor",
            text: "Hinahanap ka na ng mga suki ko, magta-trabaho ka ulit?",
          },
          { speaker: "Ikaw", text: "Di na muna kuya, masaya na ko sa trabaho ko" },
        ],
      },
    ],
  },
  {
    id: "barber",
    x: 2700,
    img: "Barber.jpg",
    label: "Barber",
    stage: 0,
    dialogueSets: [
      {
        lines: [
          { speaker: "Barber", text: "Papagupit ka ba Sakay? Haba na ng buhok mo!" },
          { speaker: "Ikaw", text: "Hahaha, sa susunod" },
          { speaker: "Barber", text: "Balak mo ba mag-trabaho ulit dito?" },
          { speaker: "Ikaw", text: "Hindi eh, maya na lang late na ko sa trabaho!" },
          { speaker: "Barber", text: "Ingat ka Bingkul" },
        ],
      },
    ],
    // A giveable-item interaction, separate from normal E-to-talk dialogue.
    gift: {
      buttonLabel: "Ibigay ang buko",
      // shown only when this flag is true and it hasn't been given yet
      requiresFlag: "hasBuko",
      givenFlag: "bukoGiven",
      responseLines: [
        {
          speaker: "Barber",
          text: "Maraming salamat Sakay, ingat ka paakyat ng entablado",
        },
      ],
      completesQuest: "give-buko",
    },
  },
];

// --- Build NPC elements dynamically -------------------------------------
const npcAnimators = []; // animated NPC sprites get an .update(now) pushed here

NPCS.forEach((npc) => {
  const el = document.createElement("div");
  el.className = "entity";
  el.id = "npc-" + npc.id;
  el.style.left = npc.x + "px";

  if (npc.animation) {
    // Animated sprite sheet, same system as the player, same display size.
    const spriteEl = document.createElement("div");
    spriteEl.className = "sprite npc-sprite npc-anim-sprite";
    el.appendChild(spriteEl);
    world.appendChild(el);
    setupNpcAnimation(npc.animation, spriteEl);
  } else {
    // Static image
    el.innerHTML = `<img class="sprite npc-sprite" src="${npc.img}" alt="${npc.label}" />`;
    world.appendChild(el);
  }
});

function setupNpcAnimation(sheet, el, displayHeight) {
  displayHeight = displayHeight || DISPLAY_HEIGHT;
  let currentFrame = 0;
  let lastFrameTime = 0;

  loadSpriteSheet(sheet).then(() => {
    const scale = displayHeight / sheet.naturalHeight;
    const displayFrameWidth = sheet.frameWidth * scale;

    el.style.width = displayFrameWidth + "px";
    el.style.height = displayHeight + "px";
    el.style.backgroundImage = `url(${sheet.src})`;
    el.style.backgroundSize =
      sheet.naturalWidth * scale + "px " + displayHeight + "px";
    el.style.backgroundPositionY = "0px";
    el.style.backgroundPositionX = "0px";

    npcAnimators.push({
      update(now) {
        const frameDuration = 1000 / sheet.fps;
        if (now - lastFrameTime >= frameDuration) {
          lastFrameTime = now;
          currentFrame = (currentFrame + 1) % sheet.frames;
          el.style.backgroundPositionX = -(currentFrame * displayFrameWidth) + "px";
        }
      },
    });
  });
}

// --- Decorations (animated, but not interactable) -------------------------
// The Horse.png sheet (22 frames) stands beside the Stablehand. Slightly
// taller than the player/NPCs since horses are bigger than people.
const horseEl = document.createElement("div");
horseEl.className = "entity";
horseEl.id = "horse";
horseEl.style.left = "1220px"; // just to the right of the Stablehand (x: 1100)
const horseSpriteEl = document.createElement("div");
horseSpriteEl.className = "sprite npc-sprite npc-anim-sprite";
horseEl.appendChild(horseSpriteEl);
world.appendChild(horseEl);
setupNpcAnimation({ src: "Horse.png", frames: 22, fps: 10 }, horseSpriteEl, 70);

// --- The stage (entablado) -----------------------------------------------
// Walk to the middle of the platform and press E to perform: Macario
// recites a few lines, then the Dead.png animation plays, then a
// blackout, then control returns to the player.
// NOTE: the lines below are placeholder poetry — swap in your own
// text (or a verified historical quote) whenever you're ready.
const STAGE = {
  x: 3900,
  width: 260,
  rampWidth: 50,
  label: "Entablado",
  poemLines: [
    { speaker: "Macario", text: "Hindi ako magnanakaw, hindi ako tulisan." },
    { speaker: "Macario", text: "Ipinaglaban ko lamang ang bayan kong sinilangan." },
    { speaker: "Macario", text: "Kung ito ang wakas, tanggap ko nang buong puso." },
    { speaker: "Macario", text: "Mabuhay ang Pilipinas, mabuhay ang bayan ko." },
  ],
};

const stageEl = document.createElement("div");
stageEl.id = "stage-platform";
stageEl.style.left = STAGE.x - STAGE.width / 2 + "px";
stageEl.style.width = STAGE.width + "px";
world.appendChild(stageEl);

// Sloped ramps on both sides so Macario can visually walk up onto the stage
const slopeLeft = document.createElement("div");
slopeLeft.className = "stage-slope stage-slope-left";
slopeLeft.style.left = STAGE.x - STAGE.width / 2 - STAGE.rampWidth + "px";
slopeLeft.style.width = STAGE.rampWidth + "px";
world.appendChild(slopeLeft);

const slopeRight = document.createElement("div");
slopeRight.className = "stage-slope stage-slope-right";
slopeRight.style.left = STAGE.x + STAGE.width / 2 + "px";
slopeRight.style.width = STAGE.rampWidth + "px";
world.appendChild(slopeRight);

// How high (0 to PLATFORM_HEIGHT) the player should be lifted at world-x
function getPlatformOffset(x) {
  const half = STAGE.width / 2;
  const left = STAGE.x - half;
  const right = STAGE.x + half;
  const rampLeftStart = left - STAGE.rampWidth;
  const rampRightEnd = right + STAGE.rampWidth;

  if (x >= left && x <= right) return PLATFORM_HEIGHT;
  if (x >= rampLeftStart && x < left) {
    const t = (x - rampLeftStart) / STAGE.rampWidth;
    return t * PLATFORM_HEIGHT;
  }
  if (x > right && x <= rampRightEnd) {
    const t = (rampRightEnd - x) / STAGE.rampWidth;
    return t * PLATFORM_HEIGHT;
  }
  return 0;
}

// --- Player sprite animation ---------------------------------------------
// Idle.png: 6 frames, Walk.png: 10 frames — both spritesheets laid out
// horizontally, expected to live in the same folder as index.html.
const playerSpriteEl = player.querySelector(".player-sprite");

const SPRITE_SHEETS = {
  idle: { src: "Idle.png", frames: 6, fps: 6 },
  walk: { src: "Walk.png", frames: 10, fps: 12 },
  dead: { src: "Dead.png", frames: 5, fps: 6, loop: false },
};

function loadSpriteSheet(def) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      def.naturalWidth = img.naturalWidth;
      def.naturalHeight = img.naturalHeight;
      def.frameWidth = img.naturalWidth / def.frames;
      resolve(def);
    };
    img.src = def.src;
  });
}

let spritesReady = false;
let currentAnim = "idle";
let currentFrame = 0;
let lastFrameTime = 0;
let facing = 1; // 1 = facing right, -1 = facing left

Promise.all([
  loadSpriteSheet(SPRITE_SHEETS.idle),
  loadSpriteSheet(SPRITE_SHEETS.walk),
  loadSpriteSheet(SPRITE_SHEETS.dead),
]).then(() => {
  spritesReady = true;
  applyAnim(currentAnim, true);
});

function applyAnim(name, force) {
  if (!spritesReady) return;
  if (currentAnim === name && !force) return;
  currentAnim = name;
  currentFrame = 0;
  lastFrameTime = 0;

  const sheet = SPRITE_SHEETS[name];
  const scale = DISPLAY_HEIGHT / sheet.naturalHeight;
  const displayFrameWidth = sheet.frameWidth * scale;

  playerSpriteEl.style.width = displayFrameWidth + "px";
  playerSpriteEl.style.height = DISPLAY_HEIGHT + "px";
  playerSpriteEl.style.backgroundImage = `url(${sheet.src})`;
  playerSpriteEl.style.backgroundSize =
    sheet.naturalWidth * scale + "px " + DISPLAY_HEIGHT + "px";
  playerSpriteEl.style.backgroundPositionY = "0px";
  playerSpriteEl.style.backgroundPositionX = "0px";
}

function updateAnimFrame(now) {
  if (!spritesReady) return;
  const sheet = SPRITE_SHEETS[currentAnim];
  const frameDuration = 1000 / sheet.fps;

  if (now - lastFrameTime >= frameDuration) {
    lastFrameTime = now;
    if (sheet.loop === false) {
      if (currentFrame < sheet.frames - 1) currentFrame++;
      // else: hold on the last frame
    } else {
      currentFrame = (currentFrame + 1) % sheet.frames;
    }
    const scale = DISPLAY_HEIGHT / sheet.naturalHeight;
    const displayFrameWidth = sheet.frameWidth * scale;
    playerSpriteEl.style.backgroundPositionX =
      -(currentFrame * displayFrameWidth) + "px";
  }

  // Flip to face the direction of travel
  playerSpriteEl.style.transform = `scaleX(${facing})`;
}


let posX = 0;
let inDialogue = false;
let cutscenePlaying = false; // locks movement through the whole stage performance
let dialogueStep = 0;
let activeNpc = null; // the NPC currently in conversation
let activeSet = null; // the dialogue set currently playing
let activeMode = null; // "npc" | "gift" | "cutscene"
let nearby = { type: null, ref: null }; // whichever NPC or the stage is in range

const blackout = document.getElementById("blackout");

const keysPressed = {};

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keysPressed[key] = true;
  if (key === "e") handleInteractPress();
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
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

btnInteract.addEventListener("click", (e) => {
  e.preventDefault();
  handleInteractPress();
});
btnInteract.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
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
function findNearby() {
  let closest = null;
  let closestType = null;
  let closestDist = Infinity;

  for (const npc of NPCS) {
    const dist = Math.abs(posX - npc.x);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = npc;
      closestType = "npc";
      closestDist = dist;
    }
  }

  const stageDist = Math.abs(posX - STAGE.x);
  if (stageDist < INTERACT_DISTANCE && stageDist < closestDist) {
    closest = STAGE;
    closestType = "stage";
    closestDist = stageDist;
  }

  return { type: closestType, ref: closest };
}

function canGiveGift(npc) {
  const gift = npc.gift;
  if (!gift) return false;
  if (!state.flags[gift.requiresFlag]) return false;
  if (state.flags[gift.givenFlag]) return false;
  return true;
}

function handleInteractPress() {
  if (inDialogue) {
    advanceDialogue();
  } else if (cutscenePlaying) {
    // ignore E while the performance/blackout sequence is running
  } else if (nearby.type === "npc") {
    startDialogue(nearby.ref);
  } else if (nearby.type === "stage") {
    startPerformance();
  }
}

function startDialogue(npc) {
  activeNpc = npc;
  activeMode = "npc";
  const setIndex = Math.min(npc.stage, npc.dialogueSets.length - 1);
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

function startPerformance() {
  if (cutscenePlaying) return;
  cutscenePlaying = true;
  activeNpc = null;
  activeMode = "cutscene";
  activeSet = { lines: STAGE.poemLines };
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function showDialogueStep() {
  const line = activeSet.lines[dialogueStep];
  dialogueSpeaker.textContent = line.speaker;
  dialogueText.textContent = line.text;
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

  if (finishedMode === "gift") {
    const gift = finishedNpc.gift;
    state.flags[gift.givenFlag] = true;
    if (gift.completesQuest) completeQuest(gift.completesQuest);
  } else if (finishedMode === "npc") {
    if (finishedSet.onComplete) {
      finishedSet.onComplete();
      if (finishedNpc.stage < finishedNpc.dialogueSets.length - 1) {
        finishedNpc.stage++;
      }
    }
  } else if (finishedMode === "cutscene") {
    // dialogue box is closed; now play the death animation + blackout
    runDeathSequence();
  }

  activeNpc = null;
  activeSet = null;
  activeMode = null;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runDeathSequence() {
  applyAnim("dead", true);
  const deadSheet = SPRITE_SHEETS.dead;
  const animMs = (deadSheet.frames / deadSheet.fps) * 1000;

  await wait(animMs + 400); // let the animation finish and hold briefly
  blackout.classList.add("visible");

  await wait(900); // fade to black + hold
  blackout.classList.remove("visible");

  await wait(900); // fade back in
  applyAnim("idle", true);
  cutscenePlaying = false;
}

// Allow tapping the dialogue box itself to advance (nice for mobile)
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// --- Game loop ---
function gameLoop(now) {
  let isWalking = false;

  if (!inDialogue && !cutscenePlaying) {
    if (keysPressed["a"]) {
      posX -= SPEED;
      facing = -1;
      isWalking = true;
    }
    if (keysPressed["d"]) {
      posX += SPEED;
      facing = 1;
      isWalking = true;
    }
    posX = Math.max(0, Math.min(posX, WORLD_WIDTH - PLAYER_WIDTH));
  }

  // While the stage cutscene is running, leave whatever animation is
  // already set (e.g. "dead") alone instead of switching to idle/walk.
  if (!cutscenePlaying) {
    applyAnim(isWalking ? "walk" : "idle");
  }
  updateAnimFrame(now || 0);
  npcAnimators.forEach((animator) => animator.update(now || 0));

  player.style.left = posX + "px";
  player.style.bottom = GROUND_LEVEL + getPlatformOffset(posX) + "px";

  // Camera: keep player centered in the viewport, clamped to world bounds
  const viewportWidth = viewport.clientWidth;
  let cameraX = posX - viewportWidth / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  world.style.transform = `translateX(${-cameraX}px)`;

  // Interact button + gift button follow whichever NPC/stage is nearby
  if (!inDialogue && !cutscenePlaying) {
    mobileControls.classList.remove("hidden");
    nearby = findNearby();
    if (nearby.type === "npc") {
      btnInteract.textContent = "Usap";
      btnInteract.classList.add("active");
    } else if (nearby.type === "stage") {
      btnInteract.textContent = "Ganap";
      btnInteract.classList.add("active");
    } else {
      btnInteract.textContent = "E";
      btnInteract.classList.remove("active");
    }

    if (nearby.type === "npc" && canGiveGift(nearby.ref)) {
      giftBtn.textContent = nearby.ref.gift.buttonLabel;
      giftBtn.classList.remove("hidden");
    } else {
      giftBtn.classList.add("hidden");
    }
  } else {
    // Dialogue is showing (or the cutscene is running) — tapping the
    // dialogue box itself advances it, so tuck the controls away.
    mobileControls.classList.add("hidden");
    giftBtn.classList.add("hidden");
    btnInteract.textContent = "E";
    btnInteract.classList.remove("active");
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
