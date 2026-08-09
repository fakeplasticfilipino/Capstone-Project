const player = document.getElementById("player");
const road = document.getElementById("road");

let posX = 0;
const speed = 5; // pixels per frame while key is held
const keysPressed = {};

document.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

function gameLoop() {
  const roadWidth = road.clientWidth;
  const playerWidth = player.clientWidth;

  if (keysPressed["a"]) {
    posX -= speed;
  }
  if (keysPressed["d"]) {
    posX += speed;
  }

  // keep the player within the road bounds
  posX = Math.max(0, Math.min(posX, roadWidth - playerWidth));

  player.style.left = posX + "px";

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
