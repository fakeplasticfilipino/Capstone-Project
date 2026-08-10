const world = document.getElementById("world");
const viewport = document.getElementById("viewport");
const player = document.getElementById("player");
const interactHint = document.getElementById("interact-hint");

const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueText = document.getElementById("dialogue-text");

const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnInteract = document.getElementById("btn-interact");

const questListEl = document.getElementById("quest-list");
const giftBtn = document.getElementById("gift-btn");

const WORLD_WIDTH = 3600;
const PLAYER_WIDTH = 40;
const SPEED = 5;
const INTERACT_DISTANCE = 90;

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
    img: "Nanay Sakay.jpg",
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
    img: "Stablehand.jpg",
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
NPCS.forEach((npc) => {
  const el = document.createElement("div");
  el.className = "entity";
  el.id = "npc-" + npc.id;
  el.style.left = npc.x + "px";
  el.innerHTML = `
    <div class="label">${npc.label}</div>
    <img class="sprite npc-sprite" src="${npc.img}" alt="${npc.label}" />
  `;
  world.appendChild(el);
});

// --- Player sprite animation ---------------------------------------------
// Idle.png: 6 frames, Walk.png: 10 frames — both spritesheets laid out
// horizontally, expected to live in the same folder as index.html.
const playerSpriteEl = player.querySelector(".player-sprite");
const DISPLAY_HEIGHT = 134; // on-screen sprite height in px, width follows aspect ratio

const SPRITE_SHEETS = {
  idle: { src: "Idle.png", frames: 6, fps: 6 },
  walk: { src: "Walk.png", frames: 10, fps: 12 },
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
    currentFrame = (currentFrame + 1) % sheet.frames;
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
let dialogueStep = 0;
let activeNpc = null; // the NPC currently in conversation
let activeSet = null; // the dialogue set currently playing
let activeIsGift = false; // whether the current dialogue is the gift-response line
let nearbyNpc = null; // the NPC currently in interact range

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
  if (nearbyNpc && nearbyNpc.gift && canGiveGift(nearbyNpc)) {
    startGift(nearbyNpc);
  }
});

// --- Interaction / dialogue ---
function findNearbyNpc() {
  let closest = null;
  let closestDist = Infinity;
  for (const npc of NPCS) {
    const dist = Math.abs(posX - npc.x);
    if (dist < INTERACT_DISTANCE && dist < closestDist) {
      closest = npc;
      closestDist = dist;
    }
  }
  return closest;
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
  } else if (nearbyNpc) {
    startDialogue(nearbyNpc);
  }
}

function startDialogue(npc) {
  activeNpc = npc;
  activeIsGift = false;
  const setIndex = Math.min(npc.stage, npc.dialogueSets.length - 1);
  activeSet = npc.dialogueSets[setIndex];
  inDialogue = true;
  dialogueStep = 0;
  dialogueBox.classList.remove("hidden");
  showDialogueStep();
}

function startGift(npc) {
  activeNpc = npc;
  activeIsGift = true;
  activeSet = { lines: npc.gift.responseLines };
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
  if (activeIsGift) {
    const gift = activeNpc.gift;
    state.flags[gift.givenFlag] = true;
    if (gift.completesQuest) completeQuest(gift.completesQuest);
  } else if (activeSet.onComplete) {
    activeSet.onComplete();
    const setIndex = Math.min(activeNpc.stage, activeNpc.dialogueSets.length - 1);
    if (activeNpc.stage < activeNpc.dialogueSets.length - 1) {
      activeNpc.stage++;
    }
  }

  inDialogue = false;
  activeNpc = null;
  activeSet = null;
  activeIsGift = false;
  dialogueBox.classList.add("hidden");
}

// Allow tapping the dialogue box itself to advance (nice for mobile)
dialogueBox.addEventListener("click", () => {
  if (inDialogue) advanceDialogue();
});

// --- Game loop ---
function gameLoop(now) {
  let isWalking = false;

  if (!inDialogue) {
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

  applyAnim(isWalking ? "walk" : "idle");
  updateAnimFrame(now || 0);

  player.style.left = posX + "px";

  // Camera: keep player centered in the viewport, clamped to world bounds
  const viewportWidth = viewport.clientWidth;
  let cameraX = posX - viewportWidth / 2 + PLAYER_WIDTH / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - viewportWidth));
  world.style.transform = `translateX(${-cameraX}px)`;

  // Interact hint + gift button follow whichever NPC is nearby
  if (!inDialogue) {
    nearbyNpc = findNearbyNpc();
    if (nearbyNpc) {
      interactHint.textContent = `Press E to talk to ${nearbyNpc.label}`;
      interactHint.style.left = nearbyNpc.x + PLAYER_WIDTH / 2 + "px";
      interactHint.classList.remove("hidden");
    } else {
      interactHint.classList.add("hidden");
    }

    if (nearbyNpc && canGiveGift(nearbyNpc)) {
      giftBtn.textContent = nearbyNpc.gift.buttonLabel;
      giftBtn.classList.remove("hidden");
    } else {
      giftBtn.classList.add("hidden");
    }
  } else {
    interactHint.classList.add("hidden");
    giftBtn.classList.add("hidden");
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
