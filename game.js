const STORAGE_KEY = "shadowClubRunnerSave";

const CONTROL_SCHEMES = [
  { label: "P1", left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown" },
  { label: "P2", left: "KeyA", right: "KeyD", up: "KeyW", down: "KeyS" },
  { label: "P3", left: "KeyJ", right: "KeyL", up: "KeyI", down: "KeyK" },
  { label: "P4", left: "KeyF", right: "KeyH", up: "KeyT", down: "KeyG" },
];

const skins = [
  {
    id: "rookie",
    name: "Rookie Scout",
    colors: ["#6ae3ff", "#2085d1"],
    cost: 0,
    unlockedByDefault: true,
  },
  {
    id: "ember",
    name: "Ember Coder",
    colors: ["#ffb347", "#ff5a36"],
    cost: 15,
    unlockedByDefault: false,
  },
  {
    id: "neon",
    name: "Neon Phantom",
    colors: ["#7af759", "#2bb673"],
    cost: 30,
    unlockedByDefault: false,
  },
  {
    id: "lunar",
    name: "Lunar Agent",
    colors: ["#d9c6ff", "#7a57ff"],
    cost: 50,
    unlockedByDefault: false,
  },
];

const defaultSave = {
  keys: 0,
  selectedSkin: "rookie",
  partySize: 1,
  unlockedSkins: skins.filter((skin) => skin.unlockedByDefault).map((skin) => skin.id),
};

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSave };
    const parsed = JSON.parse(raw);

    return {
      keys: Number.isFinite(parsed.keys) ? parsed.keys : 0,
      selectedSkin:
        skins.some((skin) => skin.id === parsed.selectedSkin) ? parsed.selectedSkin : "rookie",
      partySize:
        Number.isInteger(parsed.partySize) && parsed.partySize >= 1 && parsed.partySize <= 4
          ? parsed.partySize
          : 1,
      unlockedSkins: Array.isArray(parsed.unlockedSkins)
        ? parsed.unlockedSkins.filter((id) => skins.some((skin) => skin.id === id))
        : defaultSave.unlockedSkins,
    };
  } catch {
    return { ...defaultSave };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game.save));
}

const game = {
  canvas: document.getElementById("game"),
  menu: document.getElementById("menu"),
  skinList: document.getElementById("skinList"),
  keyCount: document.getElementById("keyCount"),
  missionNote: document.getElementById("missionNote"),
  partySizeSelect: document.getElementById("partySize"),
  addPlayerBtn: document.getElementById("addPlayerBtn"),
  removePlayerBtn: document.getElementById("removePlayerBtn"),
  startBtn: document.getElementById("startBtn"),
  overlay: document.getElementById("overlay"),
  save: loadSave(),
  running: false,
  paused: false,
  score: 0,
  distance: 0,
  cameraX: 0,
  elapsedFrames: 0,
  autosaveTick: 0,
  combo: 0,
  comboTimer: 0,
  message: "",
  messageTimer: 0,
  interactPressed: false,
  players: [],
  ctx: null,
  gravity: 0.68,
  worldWidth: 7000,
  groundY: 440,
  platforms: [],
  keysInLevel: [],
  hazards: [],
  enemies: [],
  checkpoints: [],
  doors: [],
  clueMarkers: [],
  respawnX: 100,
  discoveredKeyIds: new Set(),
};

game.ctx = game.canvas.getContext("2d");

function createPlayer(index) {
  return {
    id: index,
    label: CONTROL_SCHEMES[index].label,
    controls: CONTROL_SCHEMES[index],
    x: 100 + index * 36,
    y: 320,
    width: 46,
    height: 74,
    vx: 0,
    vy: 0,
    maxRunSpeed: 8.4,
    accelGround: 1.1,
    accelAir: 0.62,
    friction: 0.78,
    jumpPower: 15,
    jumpCutFactor: 0.5,
    coyoteFrames: 8,
    jumpBufferFrames: 10,
    onGround: false,
    onWall: false,
    wallDir: 0,
    coyoteLeft: 0,
    jumpBufferLeft: 0,
    facing: 1,
    rolling: false,
    rollTimer: 0,
    rollCooldown: 0,
    maxFallSpeed: 18,
    invulnerableFrames: 0,
    stepFrame: 0,
    input: {
      left: false,
      right: false,
      upHeld: false,
      upPressed: false,
      down: false,
    },
  };
}

function setupWorld() {
  game.platforms = [
    { x: 260, y: 390, width: 200, height: 22 },
    { x: 520, y: 345, width: 150, height: 20 },
    { x: 760, y: 300, width: 140, height: 20 },
    { x: 980, y: 250, width: 160, height: 20 },
    { x: 1220, y: 210, width: 180, height: 20 },
    { x: 1460, y: 170, width: 180, height: 20 },
    { x: 1230, y: 270, width: 120, height: 20 },
    { x: 1000, y: 320, width: 120, height: 20 },
    { x: 1720, y: 390, width: 240, height: 22 },
    { x: 2040, y: 340, width: 170, height: 20 },
    { x: 2290, y: 290, width: 170, height: 20 },
    { x: 2520, y: 240, width: 180, height: 20 },
    { x: 2760, y: 190, width: 200, height: 20 },
    { x: 3010, y: 250, width: 160, height: 20 },
    { x: 3260, y: 315, width: 170, height: 20 },
    { x: 3520, y: 380, width: 240, height: 22 },
    { x: 3820, y: 330, width: 180, height: 20 },
    { x: 4070, y: 270, width: 170, height: 20 },
    { x: 4310, y: 220, width: 170, height: 20 },
    { x: 4540, y: 170, width: 170, height: 20 },
    { x: 4320, y: 320, width: 140, height: 20 },
    { x: 4100, y: 365, width: 150, height: 20 },
    { x: 4820, y: 390, width: 220, height: 22 },
    { x: 5110, y: 350, width: 190, height: 20 },
    { x: 5360, y: 300, width: 190, height: 20 },
    { x: 5600, y: 245, width: 190, height: 20 },
    { x: 5840, y: 195, width: 190, height: 20 },
    { x: 6070, y: 250, width: 160, height: 20 },
    { x: 6300, y: 315, width: 170, height: 20 },
    { x: 6540, y: 380, width: 250, height: 22 },
    { x: 845, y: 220, width: 22, height: 220 },
    { x: 2460, y: 160, width: 22, height: 210 },
    { x: 4465, y: 130, width: 22, height: 260 },
    { x: 6140, y: 165, width: 22, height: 245 },
  ];

  game.keysInLevel = [
    { id: "k1", x: 360, y: 350, collected: false },
    { id: "k2", x: 830, y: 255, collected: false },
    { id: "k3", x: 1280, y: 165, collected: false },
    { id: "k4", x: 1510, y: 125, collected: false },
    { id: "k5", x: 1870, y: 350, collected: false },
    { id: "k6", x: 2360, y: 250, collected: false },
    { id: "k7", x: 2860, y: 150, collected: false },
    { id: "k8", x: 3330, y: 275, collected: false },
    { id: "k9", x: 3880, y: 285, collected: false },
    { id: "k10", x: 4470, y: 125, collected: false },
    { id: "k11", x: 5200, y: 310, collected: false },
    { id: "k12", x: 5880, y: 150, collected: false },
    { id: "k13", x: 6370, y: 270, collected: false },
  ];

  game.hazards = [
    { type: "lowLaser", x: 560, y: 329, width: 80, height: 16 },
    { type: "spike", x: 1710, y: 420, width: 40, height: 20 },
    { type: "lowLaser", x: 2300, y: 274, width: 90, height: 16 },
    { type: "spike", x: 3510, y: 420, width: 40, height: 20 },
    { type: "lowLaser", x: 4070, y: 344, width: 90, height: 16 },
    { type: "spike", x: 4820, y: 420, width: 40, height: 20 },
    { type: "lowLaser", x: 5590, y: 219, width: 90, height: 16 },
    { type: "spike", x: 6480, y: 420, width: 40, height: 20 },
  ];

  game.enemies = [
    { id: "e1", type: "sentry", x: 880, y: 390, width: 44, height: 50, vx: 1.3, minX: 820, maxX: 1100, active: true },
    { id: "e2", type: "drone", x: 2100, y: 230, width: 40, height: 34, vx: 1.5, minX: 2000, maxX: 2320, active: true },
    { id: "e3", type: "sentry", x: 3560, y: 280, width: 44, height: 50, vx: 1.6, minX: 3500, maxX: 3880, active: true },
    { id: "e4", type: "drone", x: 4700, y: 250, width: 40, height: 34, vx: 1.8, minX: 4540, maxX: 5000, active: true },
    { id: "e5", type: "sentry", x: 6150, y: 320, width: 44, height: 50, vx: 1.9, minX: 6040, maxX: 6400, active: true },
  ];

  game.checkpoints = [
    { x: 1050, active: false },
    { x: 2800, active: false },
    { x: 4500, active: false },
    { x: 6200, active: false },
  ];

  game.doors = [
    { id: "d1", x: 1660, y: 250, width: 34, height: 190, code: "431", solved: false, hint: "Door-1 code: 4 _ 1" },
    { id: "d2", x: 3980, y: 220, width: 34, height: 220, code: "872", solved: false, hint: "Door-2 code: 8 7 _" },
    { id: "d3", x: 6200, y: 210, width: 34, height: 230, code: "590", solved: false, hint: "Door-3 code: 5 _ 0" },
  ];

  game.clueMarkers = [
    { x: 1510, y: 140, text: "Door-1 clue: middle digit is 3. Drop down and backtrack.", shown: false },
    { x: 4470, y: 140, text: "Door-2 clue: last digit is 2. Head back to the lock.", shown: false },
    { x: 5880, y: 160, text: "Door-3 clue: middle digit is 9. Return to unlock.", shown: false },
  ];
}

function setMessage(text, frames = 120) {
  game.message = text;
  game.messageTimer = frames;
}

function isSkinUnlocked(id) {
  return game.save.unlockedSkins.includes(id);
}

function ensureSelectedSkinValid() {
  if (!isSkinUnlocked(game.save.selectedSkin)) {
    game.save.selectedSkin = game.save.unlockedSkins[0] || "rookie";
  }
}

function renderSkinMenu() {
  ensureSelectedSkinValid();
  game.skinList.innerHTML = "";

  for (const skin of skins) {
    const unlocked = isSkinUnlocked(skin.id);
    const selected = game.save.selectedSkin === skin.id;

    const card = document.createElement("article");
    card.className = `skin-card${selected ? " active" : ""}`;

    const preview = document.createElement("div");
    preview.className = "skin-preview";
    preview.style.background = `linear-gradient(135deg, ${skin.colors[0]}, ${skin.colors[1]})`;

    const name = document.createElement("div");
    name.className = "skin-name";
    name.textContent = skin.name;

    const state = document.createElement("div");
    state.className = "skin-state";
    state.textContent = unlocked ? "Unlocked" : `Locked • ${skin.cost} keys`;

    const button = document.createElement("button");
    button.className = "skin-btn";

    if (unlocked) {
      button.classList.add("select");
      button.textContent = selected ? "Selected" : "Use Skin";
      button.disabled = selected;
      button.addEventListener("click", () => {
        game.save.selectedSkin = skin.id;
        saveProgress();
        renderSkinMenu();
      });
    } else if (game.save.keys >= skin.cost) {
      button.classList.add("unlock");
      button.textContent = `Unlock (${skin.cost})`;
      button.addEventListener("click", () => {
        game.save.keys -= skin.cost;
        game.save.unlockedSkins.push(skin.id);
        game.save.selectedSkin = skin.id;
        saveProgress();
        renderSkinMenu();
      });
    } else {
      button.classList.add("locked");
      button.textContent = `Need ${skin.cost - game.save.keys} more`;
      button.disabled = true;
    }

    card.append(preview, name, state, button);
    game.skinList.appendChild(card);
  }

  game.keyCount.textContent = String(game.save.keys);
}

function resetPlayersInput() {
  for (const player of game.players) {
    player.input.left = false;
    player.input.right = false;
    player.input.upHeld = false;
    player.input.upPressed = false;
    player.input.down = false;
  }
}

function startGame() {
  const selectedParty = Math.max(1, Math.min(4, Number(game.partySizeSelect.value) || 1));
  game.save.partySize = selectedParty;
  game.players = Array.from({ length: selectedParty }, (_, index) => createPlayer(index));
  game.score = 0;
  game.distance = 0;
  game.cameraX = 0;
  game.elapsedFrames = 0;
  game.combo = 0;
  game.comboTimer = 0;
  game.autosaveTick = 0;
  game.respawnX = 100;
  game.paused = false;
  game.interactPressed = false;
  game.discoveredKeyIds = new Set();
  setupWorld();
  game.running = true;
  game.menu.classList.add("hidden");
  game.overlay.classList.add("hidden");
  setMessage(`Case started. Team size: ${selectedParty}. Find clues and solve doors.`);
  saveProgress();
}

function finishRun() {
  game.running = false;
  game.menu.classList.remove("hidden");
  const bonus = 2 + Math.floor(game.discoveredKeyIds.size / 3) + game.doors.filter((door) => door.solved).length;
  game.save.keys += bonus;
  game.missionNote.textContent = `Mission clear! Bonus keys earned: ${bonus}.`;
  saveProgress();
  renderSkinMenu();
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function playerHitbox(player) {
  const bodyHeight = player.rolling ? player.height * 0.56 : player.height;
  const yOffset = player.height - bodyHeight;
  return {
    x: player.x + 2,
    y: player.y + yOffset,
    width: player.width - 4,
    height: bodyHeight,
  };
}

function triggerRespawn(player, reason) {
  player.x = game.respawnX + player.id * 28;
  player.y = 200;
  player.vx = 0;
  player.vy = 0;
  player.rollTimer = 0;
  player.onWall = false;
  player.wallDir = 0;
  player.input.upPressed = false;
  player.invulnerableFrames = 75;
  game.combo = 0;
  game.comboTimer = 0;

  if (reason === "trap") {
    game.save.keys = Math.max(0, game.save.keys - 2);
    setMessage(`${player.label} hit a trap! Lost 2 keys.`);
  } else {
    setMessage(`${player.label} fell. Respawned at checkpoint.`);
  }

  saveProgress();
}

function updateEnemies() {
  for (const enemy of game.enemies) {
    if (!enemy.active) continue;

    enemy.x += enemy.vx;
    if (enemy.x < enemy.minX || enemy.x + enemy.width > enemy.maxX) {
      enemy.vx *= -1;
      enemy.x += enemy.vx;
    }

    if (enemy.type === "drone") {
      enemy.y += Math.sin((game.elapsedFrames + enemy.x) * 0.02) * 0.35;
    }
  }
}

function applyDoorBlock(player, prevX) {
  const hitbox = playerHitbox(player);
  for (const door of game.doors) {
    if (door.solved) continue;
    if (!rectsOverlap(hitbox, door)) continue;

    if (prevX + player.width <= door.x && player.x + player.width > door.x) {
      player.x = door.x - player.width;
      player.vx = 0;
    } else if (prevX >= door.x + door.width && player.x < door.x + door.width) {
      player.x = door.x + door.width;
      player.vx = 0;
    }
  }
}

function updatePlayer(player) {
  const p = player;
  const prevX = p.x;
  const prevY = p.y;

  if (p.invulnerableFrames > 0) p.invulnerableFrames -= 1;
  if (p.rollCooldown > 0) p.rollCooldown -= 1;
  if (p.rollTimer > 0) {
    p.rollTimer -= 1;
    p.rolling = true;
  } else {
    p.rolling = false;
  }

  if (p.input.upPressed) {
    p.jumpBufferLeft = p.jumpBufferFrames;
    p.input.upPressed = false;
  } else if (p.jumpBufferLeft > 0) {
    p.jumpBufferLeft -= 1;
  }

  const movingLeft = p.input.left && !p.input.right;
  const movingRight = p.input.right && !p.input.left;
  const accel = p.onGround ? p.accelGround : p.accelAir;

  if (movingLeft) {
    p.vx -= accel;
    p.facing = -1;
  } else if (movingRight) {
    p.vx += accel;
    p.facing = 1;
  } else {
    p.vx *= p.friction;
  }

  if (p.input.down && p.onGround && p.rollCooldown <= 0 && !p.rolling) {
    p.rollTimer = 16;
    p.rollCooldown = 28;
    p.vx += 2.3 * p.facing;
  }

  if (p.rolling) p.vx *= 1.04;

  if (p.vx > p.maxRunSpeed) p.vx = p.maxRunSpeed;
  if (p.vx < -p.maxRunSpeed) p.vx = -p.maxRunSpeed;

  if (p.onGround) p.coyoteLeft = p.coyoteFrames;
  else if (p.coyoteLeft > 0) p.coyoteLeft -= 1;

  if (p.jumpBufferLeft > 0 && p.onWall && !p.onGround) {
    p.vy = -p.jumpPower;
    p.vx = -p.wallDir * p.maxRunSpeed;
    p.facing = -p.wallDir;
    p.onWall = false;
    p.coyoteLeft = 0;
    p.jumpBufferLeft = 0;
  } else if (p.jumpBufferLeft > 0 && p.coyoteLeft > 0) {
    p.vy = -p.jumpPower;
    p.onGround = false;
    p.coyoteLeft = 0;
    p.jumpBufferLeft = 0;
  }

  if (!p.input.upHeld && p.vy < -2.5) p.vy *= p.jumpCutFactor;

  p.vy += game.gravity;
  if (p.vy > p.maxFallSpeed) p.vy = p.maxFallSpeed;

  p.x += p.vx;
  p.y += p.vy;

  p.onGround = false;
  p.onWall = false;

  if (p.y + p.height >= game.groundY) {
    p.y = game.groundY - p.height;
    p.vy = 0;
    p.onGround = true;
  }

  for (const platform of game.platforms) {
    const hitbox = { x: p.x, y: p.y, width: p.width, height: p.height };
    if (!rectsOverlap(hitbox, platform)) continue;

    const comingFromTop = p.vy >= 0 && p.y + p.height - p.vy <= platform.y + 10;
    if (comingFromTop) {
      p.y = platform.y - p.height;
      p.vy = 0;
      p.onGround = true;
    } else if (prevX + p.width <= platform.x && p.x + p.width > platform.x) {
      p.x = platform.x - p.width;
      p.vx = 0;
      if (!p.onGround) { p.onWall = true; p.wallDir = 1; }
    } else if (prevX >= platform.x + platform.width && p.x < platform.x + platform.width) {
      p.x = platform.x + platform.width;
      p.vx = 0;
      if (!p.onGround) { p.onWall = true; p.wallDir = -1; }
    }
  }

  if (p.onWall && !p.onGround && p.vy > 3) p.vy = 3;

  for (const checkpoint of game.checkpoints) {
    if (!checkpoint.active && p.x >= checkpoint.x) {
      checkpoint.active = true;
      game.respawnX = checkpoint.x + 30;
      setMessage(`Checkpoint reached: ${checkpoint.x}m`);
    }
  }

  for (const clue of game.clueMarkers) {
    if (!clue.shown && Math.abs(p.x - clue.x) < 80) {
      clue.shown = true;
      setMessage(clue.text, 200);
    }
  }

  for (const key of game.keysInLevel) {
    if (key.collected) continue;
    const keyHitbox = { x: key.x - 10, y: key.y - 10, width: 20, height: 20 };
    const pHitbox = playerHitbox(p);

    if (rectsOverlap(pHitbox, keyHitbox)) {
      key.collected = true;
      game.score += 10;
      game.combo = game.comboTimer > 0 ? game.combo + 1 : 1;
      game.comboTimer = 105;

      if (game.combo % 5 === 0) {
        game.save.keys += 1;
        setMessage("Combo bonus: +1 key!");
      }

      if (!game.discoveredKeyIds.has(key.id)) {
        game.discoveredKeyIds.add(key.id);
        game.save.keys += 1;
      }
    }
  }

  const pHitbox = playerHitbox(p);
  for (const hazard of game.hazards) {
    if (!rectsOverlap(pHitbox, hazard)) continue;
    if (hazard.type === "lowLaser" && p.rolling) continue;
    if (p.invulnerableFrames <= 0) {
      triggerRespawn(p, "trap");
    }
    break;
  }

  for (const enemy of game.enemies) {
    if (!enemy.active) continue;
    const enemyBox = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
    if (!rectsOverlap(pHitbox, enemyBox)) continue;

    const stomped = prevY + p.height <= enemy.y + 8 && p.vy > 0;
    if (stomped) {
      enemy.active = false;
      p.vy = -9.4;
      game.save.keys += 1;
      game.score += 25;
      setMessage(`${p.label} disabled an enemy bot! +1 key.`);
    } else if (p.invulnerableFrames <= 0) {
      triggerRespawn(p, "trap");
    }
  }

  applyDoorBlock(p, prevX);

  p.x = Math.max(0, Math.min(game.worldWidth - p.width, p.x));

  if (p.onGround && Math.abs(p.vx) > 0.5) p.stepFrame += 1;

  if (p.y > game.canvas.height + 200) {
    triggerRespawn(p, "fall");
  }
}

function handleDoorInteraction() {
  if (!game.interactPressed) return;
  game.interactPressed = false;

  let candidate = null;

  for (const door of game.doors) {
    if (door.solved) continue;

    for (const player of game.players) {
      const nearX = Math.abs(player.x - door.x) < 72;
      const nearY = Math.abs(player.y - door.y) < 190;
      if (!nearX || !nearY) continue;

      const dist = Math.abs(player.x - door.x);
      if (!candidate || dist < candidate.distance) {
        candidate = { door, player, distance: dist };
      }
    }
  }

  if (!candidate) {
    setMessage("No locked door nearby. Move closer and press E.");
    return;
  }

  const guess = window.prompt(`${candidate.player.label}: ${candidate.door.hint} Enter 3-digit code:`);
  if (guess === null) {
    setMessage("Door puzzle canceled.");
    return;
  }

  if (guess.trim() === candidate.door.code) {
    candidate.door.solved = true;
    game.save.keys += 3;
    game.score += 100;
    setMessage(`Door unlocked by ${candidate.player.label}! +3 keys.`, 180);
    saveProgress();
  } else {
    game.save.keys = Math.max(0, game.save.keys - 1);
    setMessage("Wrong code. -1 key. Search for clues.");
    saveProgress();
  }
}

function drawStickman(ctx, player, color1) {
  const isBlinking = player.invulnerableFrames > 0 && player.invulnerableFrames % 6 < 3;
  if (isBlinking) return;

  const cx = Math.round(player.x + player.width / 2);
  const bot = Math.round(player.y + player.height);
  const f = player.facing;

  ctx.save();
  ctx.strokeStyle = color1;
  ctx.fillStyle = color1;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (player.rolling) {
    const cy = bot - 20;
    ctx.beginPath();
    ctx.arc(cx + f * 6, cy - 14, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + f * 4, cy - 6);
    ctx.lineTo(cx - f * 4, cy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + f * 2, cy - 2);
    ctx.lineTo(cx + f * 18, cy + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + f * 2, cy - 2);
    ctx.lineTo(cx - f * 8, cy + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - f * 4, cy + 8);
    ctx.lineTo(cx + f * 10, cy + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - f * 4, cy + 8);
    ctx.lineTo(cx - f * 10, cy + 16);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (player.onWall && !player.onGround) {
    const headY = bot - 68;
    const neckY = bot - 54;
    const hipY = bot - 34;
    ctx.beginPath();
    ctx.arc(cx + f * 5, headY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + f * 3, headY + 9);
    ctx.lineTo(cx, hipY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + f * 2, neckY);
    ctx.lineTo(cx + f * 20, neckY + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + f * 2, neckY);
    ctx.lineTo(cx - f * 12, neckY + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, hipY);
    ctx.lineTo(cx + f * 12, hipY + 18);
    ctx.lineTo(cx + f * 8, bot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, hipY);
    ctx.lineTo(cx - f * 6, hipY + 18);
    ctx.lineTo(cx - f * 10, bot);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (!player.onGround) {
    const rising = player.vy < 0;
    const headY = bot - 68;
    const neckY = bot - 54;
    const hipY = bot - 34;
    ctx.beginPath();
    ctx.arc(cx, headY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, headY + 9);
    ctx.lineTo(cx, hipY);
    ctx.stroke();
    if (rising) {
      ctx.beginPath();
      ctx.moveTo(cx, neckY);
      ctx.lineTo(cx - f * 18, neckY + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, neckY);
      ctx.lineTo(cx - f * 12, neckY + 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx + 12, hipY + 12);
      ctx.lineTo(cx + 8, hipY + 26);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx - 10, hipY + 10);
      ctx.lineTo(cx - 6, hipY + 24);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, neckY);
      ctx.lineTo(cx + 20, neckY - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, neckY);
      ctx.lineTo(cx - 20, neckY - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx + 18, hipY + 22);
      ctx.lineTo(cx + 14, bot);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, hipY);
      ctx.lineTo(cx - 18, hipY + 22);
      ctx.lineTo(cx - 14, bot);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  const headY = bot - 68;
  const neckY = bot - 54;
  const hipY = bot - 36;
  const speed = Math.abs(player.vx);
  const swing = speed > 0.4 ? Math.sin(player.stepFrame * 0.28) * 0.65 : 0;
  const leanX = speed > 0.4 ? f * 4 : 0;

  ctx.beginPath();
  ctx.arc(cx + leanX * 0.6, headY, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + leanX * 0.4, headY + 9);
  ctx.lineTo(cx, hipY);
  ctx.stroke();

  const armOff = -swing;
  ctx.beginPath();
  ctx.moveTo(cx + leanX * 0.3, neckY);
  ctx.lineTo(
    cx + leanX * 0.3 + f * 16 * Math.cos(armOff + 0.5),
    neckY + 12 + Math.sin(armOff) * 10
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + leanX * 0.3, neckY);
  ctx.lineTo(
    cx + leanX * 0.3 - f * 16 * Math.cos(armOff - 0.5),
    neckY + 12 - Math.sin(armOff) * 10
  );
  ctx.stroke();

  const fa = swing + 0.4;
  const fkx = cx + Math.sin(fa) * f * 18;
  const fky = hipY + Math.cos(Math.abs(fa)) * 18;
  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(fkx, fky);
  ctx.lineTo(fkx + f * Math.sin(fa * 0.6) * 14, fky + 14);
  ctx.stroke();

  const ba = -swing + 0.4;
  const bkx = cx - Math.sin(ba) * f * 18;
  const bky = hipY + Math.cos(Math.abs(ba)) * 18;
  ctx.beginPath();
  ctx.moveTo(cx, hipY);
  ctx.lineTo(bkx, bky);
  ctx.lineTo(bkx - f * Math.sin(ba * 0.6) * 14, bky + 14);
  ctx.stroke();

  ctx.restore();
}

function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
  gradient.addColorStop(0, "#102036");
  gradient.addColorStop(1, "#2a4a72");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  ctx.save();
  ctx.translate(-game.cameraX * 0.25, 0);
  ctx.fillStyle = "rgba(43, 91, 133, 0.5)";
  for (let i = 0; i < 22; i += 1) {
    const x = i * 340;
    const h = 90 + (i % 4) * 25;
    ctx.fillRect(x, game.groundY - h - 20, 220, h);
  }
  ctx.restore();
}

function drawWorld(ctx) {
  ctx.save();
  ctx.translate(-game.cameraX, 0);

  ctx.fillStyle = "#1e364f";
  ctx.fillRect(0, game.groundY, game.worldWidth, game.canvas.height - game.groundY);

  ctx.fillStyle = "#3d6388";
  for (const platform of game.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  }

  for (const key of game.keysInLevel) {
    if (key.collected) continue;
    ctx.fillStyle = "#f8be3d";
    ctx.beginPath();
    ctx.arc(key.x, key.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 235, 150, 0.9)";
    ctx.fillRect(key.x - 3, key.y - 2, 12, 4);
  }

  for (const hazard of game.hazards) {
    if (hazard.type === "lowLaser") {
      ctx.fillStyle = "#ff5370";
      ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
      ctx.fillStyle = "rgba(255, 83, 112, 0.3)";
      ctx.fillRect(hazard.x, hazard.y - 8, hazard.width, 8);
    } else {
      ctx.fillStyle = "#9db2cc";
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y + hazard.height);
      ctx.lineTo(hazard.x + hazard.width / 2, hazard.y);
      ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
      ctx.closePath();
      ctx.fill();
    }
  }

  for (const checkpoint of game.checkpoints) {
    ctx.strokeStyle = checkpoint.active ? "#4ad7d1" : "#7f94ab";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(checkpoint.x, game.groundY - 82);
    ctx.lineTo(checkpoint.x, game.groundY);
    ctx.stroke();

    ctx.fillStyle = checkpoint.active ? "#4ad7d1" : "#7f94ab";
    ctx.fillRect(checkpoint.x, game.groundY - 82, 28, 18);
  }

  for (const clue of game.clueMarkers) {
    ctx.fillStyle = clue.shown ? "#ffd98c" : "#b0c3db";
    ctx.fillRect(clue.x, clue.y, 18, 14);
  }

  for (const door of game.doors) {
    if (door.solved) {
      ctx.fillStyle = "rgba(74, 215, 209, 0.5)";
      ctx.fillRect(door.x, door.y, door.width, door.height);
      continue;
    }

    ctx.fillStyle = "#5d3144";
    ctx.fillRect(door.x, door.y, door.width, door.height);
    ctx.fillStyle = "#f8be3d";
    ctx.fillRect(door.x + 6, door.y + 44, door.width - 12, 14);
  }

  for (const enemy of game.enemies) {
    if (!enemy.active) continue;

    if (enemy.type === "drone") {
      ctx.fillStyle = "#f687b3";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = "#182330";
      ctx.fillRect(enemy.x + 8, enemy.y + 10, enemy.width - 16, 6);
    } else {
      ctx.fillStyle = "#9f7aea";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.fillStyle = "#1d2438";
      ctx.fillRect(enemy.x + 10, enemy.y + 15, enemy.width - 20, 8);
    }
  }

  const currentSkin = skins.find((skin) => skin.id === game.save.selectedSkin) || skins[0];
  for (const player of game.players) {
    drawStickman(ctx, player, currentSkin.colors[0]);
    ctx.fillStyle = "#ecf5ff";
    ctx.font = "700 12px Nunito";
    ctx.fillText(player.label, player.x + 10, player.y - 8);
  }

  ctx.restore();
}

function drawHud(ctx) {
  ctx.fillStyle = "rgba(6, 17, 31, 0.6)";
  ctx.fillRect(12, 12, 330, 132);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.strokeRect(12, 12, 330, 132);

  const solvedDoors = game.doors.filter((door) => door.solved).length;

  ctx.fillStyle = "#e9f4ff";
  ctx.font = "700 18px Nunito";
  ctx.fillText(`Keys this run: ${game.discoveredKeyIds.size}`, 24, 40);
  ctx.fillText(`Total Keys: ${game.save.keys}`, 24, 64);
  ctx.fillText(`Distance: ${Math.floor(game.distance)}m`, 24, 88);
  ctx.fillText(`Team: ${game.players.length}  Combo: x${game.combo}`, 24, 112);
  ctx.fillText(`Doors solved: ${solvedDoors}/${game.doors.length}`, 24, 136);

  ctx.fillStyle = "#f8be3d";
  ctx.font = "700 16px Nunito";
  ctx.fillText("E = interact with nearest door", 470, 34);

  if (game.message) {
    ctx.fillStyle = "rgba(7, 18, 32, 0.72)";
    ctx.fillRect(360, 52, 560, 32);
    ctx.strokeStyle = "rgba(248, 190, 61, 0.6)";
    ctx.strokeRect(360, 52, 560, 32);
    ctx.fillStyle = "#ffe8ad";
    ctx.fillText(game.message, 376, 74);
  }
}

function update() {
  if (!game.running || game.paused) {
    requestAnimationFrame(update);
    return;
  }

  updateEnemies();

  for (const player of game.players) {
    updatePlayer(player);
  }

  handleDoorInteraction();

  const leaderX = Math.max(...game.players.map((player) => player.x));
  const targetCamera = Math.max(0, Math.min(game.worldWidth - game.canvas.width, leaderX - 260));
  game.cameraX += (targetCamera - game.cameraX) * 0.14;

  game.distance = Math.max(game.distance, Math.floor(leaderX));
  game.elapsedFrames += 1;

  if (game.comboTimer > 0) game.comboTimer -= 1;
  else game.combo = 0;

  if (game.messageTimer > 0) {
    game.messageTimer -= 1;
    if (game.messageTimer === 0) game.message = "";
  }

  game.autosaveTick += 1;
  if (game.autosaveTick >= 45) {
    saveProgress();
    game.autosaveTick = 0;
  }

  const allDoorsSolved = game.doors.every((door) => door.solved);
  if (leaderX >= game.worldWidth - 80) {
    if (allDoorsSolved) {
      finishRun();
    } else {
      setMessage("Extraction locked. Solve all doors first.");
    }
  }

  requestAnimationFrame(update);
}

function render() {
  const ctx = game.ctx;
  drawBackground(ctx);

  if (game.running) {
    drawWorld(ctx);
    drawHud(ctx);
  }

  requestAnimationFrame(render);
}

function onKeyDown(event) {
  const reservedKeys = new Set([
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Escape",
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyI",
    "KeyJ",
    "KeyK",
    "KeyL",
    "KeyT",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyE",
  ]);

  if (reservedKeys.has(event.code)) {
    event.preventDefault();
  }

  for (const player of game.players) {
    if (event.code === player.controls.left) player.input.left = true;
    if (event.code === player.controls.right) player.input.right = true;
    if (event.code === player.controls.up) {
      player.input.upHeld = true;
      player.input.upPressed = true;
    }
    if (event.code === player.controls.down) player.input.down = true;
  }

  if (event.code === "KeyE") game.interactPressed = true;

  if (event.code === "Escape" && game.running) {
    game.paused = !game.paused;
    game.overlay.classList.toggle("hidden", !game.paused);
    game.overlay.textContent = game.paused ? "Paused" : "";
  }
}

function onKeyUp(event) {
  for (const player of game.players) {
    if (event.code === player.controls.left) player.input.left = false;
    if (event.code === player.controls.right) player.input.right = false;
    if (event.code === player.controls.up) player.input.upHeld = false;
    if (event.code === player.controls.down) player.input.down = false;
  }
}

function bindEvents() {
  function setPartySize(size) {
    const clamped = Math.max(1, Math.min(4, size));
    game.save.partySize = clamped;
    game.partySizeSelect.value = String(clamped);
    saveProgress();
  }

  game.startBtn.addEventListener("click", startGame);
  game.partySizeSelect.value = String(game.save.partySize || 1);
  game.partySizeSelect.addEventListener("change", () => {
    setPartySize(Number(game.partySizeSelect.value) || 1);
  });
  game.addPlayerBtn.addEventListener("click", () => {
    setPartySize((Number(game.partySizeSelect.value) || 1) + 1);
    setMessage(`Players ready: ${game.partySizeSelect.value}`);
  });
  game.removePlayerBtn.addEventListener("click", () => {
    setPartySize((Number(game.partySizeSelect.value) || 1) - 1);
    setMessage(`Players ready: ${game.partySizeSelect.value}`);
  });

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", resetPlayersInput);
}

function init() {
  bindEvents();
  renderSkinMenu();
  render();
  update();
}

init();
