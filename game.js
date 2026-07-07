const STORAGE_KEY = "shadowClubRunnerSave";
const TOTAL_LEVELS = 35;
const TOUCH_ACTIONS = ["left", "right", "jump", "roll", "interact", "pause"];

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
  {
    id: "volt",
    name: "Volt Runner",
    colors: ["#ffe676", "#ff9f1a"],
    cost: 80,
    unlockedByDefault: false,
  },
  {
    id: "frost",
    name: "Frost Jumper",
    colors: ["#b6f0ff", "#4ea4ff"],
    cost: 110,
    unlockedByDefault: false,
  },
  {
    id: "shadow",
    name: "Shadow Glider",
    colors: ["#95a0b8", "#28354d"],
    cost: 140,
    unlockedByDefault: false,
  },
  {
    id: "nova",
    name: "Nova Hero",
    colors: ["#ff9ad4", "#9f46ff"],
    cost: 175,
    unlockedByDefault: false,
  },
];

const upgrades = [
  { id: "speed", name: "Turbo Shoes", cost: 25, maxLevel: 5, note: "+Run speed" },
  { id: "jump", name: "Spring Boots", cost: 30, maxLevel: 5, note: "+Jump height" },
  { id: "shield", name: "Shield Coat", cost: 35, maxLevel: 3, note: "-Trap key loss" },
  { id: "dash", name: "Dash Core", cost: 40, maxLevel: 4, note: "+Roll boost" },
  { id: "magnet", name: "Magnet Core", cost: 32, maxLevel: 5, note: "+Key pull radius" },
  { id: "nitro", name: "Nitro Tank", cost: 45, maxLevel: 4, note: "+Bike speed" },
  { id: "gyro", name: "Gyro Rig", cost: 42, maxLevel: 4, note: "+Bike stability" },
  { id: "air", name: "Aero Threads", cost: 36, maxLevel: 5, note: "+Air control" },
  { id: "grip", name: "Climber Gloves", cost: 39, maxLevel: 4, note: "+Wall cling" },
  { id: "recover", name: "Reflex Chip", cost: 34, maxLevel: 5, note: "+Jump timing" },
];

const defaultSave = {
  keys: 0,
  selectedSkin: "rookie",
  partySize: 1,
  selectedLevel: 1,
  unlockedLevel: 1,
  upgrades: {
    speed: 0,
    jump: 0,
    shield: 0,
    dash: 0,
    magnet: 0,
    nitro: 0,
    gyro: 0,
    air: 0,
    grip: 0,
    recover: 0,
  },
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
      selectedLevel:
        Number.isInteger(parsed.selectedLevel) && parsed.selectedLevel >= 1 && parsed.selectedLevel <= TOTAL_LEVELS
          ? parsed.selectedLevel
          : 1,
      unlockedLevel:
        Number.isInteger(parsed.unlockedLevel) && parsed.unlockedLevel >= 1 && parsed.unlockedLevel <= TOTAL_LEVELS
          ? parsed.unlockedLevel
          : 1,
      unlockedSkins: Array.isArray(parsed.unlockedSkins)
        ? parsed.unlockedSkins.filter((id) => skins.some((skin) => skin.id === id))
        : defaultSave.unlockedSkins,
      upgrades: {
        speed: Number.isInteger(parsed?.upgrades?.speed) ? Math.max(0, Math.min(5, parsed.upgrades.speed)) : 0,
        jump: Number.isInteger(parsed?.upgrades?.jump) ? Math.max(0, Math.min(5, parsed.upgrades.jump)) : 0,
        shield: Number.isInteger(parsed?.upgrades?.shield) ? Math.max(0, Math.min(3, parsed.upgrades.shield)) : 0,
        dash: Number.isInteger(parsed?.upgrades?.dash) ? Math.max(0, Math.min(4, parsed.upgrades.dash)) : 0,
        magnet: Number.isInteger(parsed?.upgrades?.magnet) ? Math.max(0, Math.min(5, parsed.upgrades.magnet)) : 0,
        nitro: Number.isInteger(parsed?.upgrades?.nitro) ? Math.max(0, Math.min(4, parsed.upgrades.nitro)) : 0,
        gyro: Number.isInteger(parsed?.upgrades?.gyro) ? Math.max(0, Math.min(4, parsed.upgrades.gyro)) : 0,
        air: Number.isInteger(parsed?.upgrades?.air) ? Math.max(0, Math.min(5, parsed.upgrades.air)) : 0,
        grip: Number.isInteger(parsed?.upgrades?.grip) ? Math.max(0, Math.min(4, parsed.upgrades.grip)) : 0,
        recover: Number.isInteger(parsed?.upgrades?.recover) ? Math.max(0, Math.min(5, parsed.upgrades.recover)) : 0,
      },
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
  levelSelect: document.getElementById("levelSelect"),
  upgradeList: document.getElementById("upgradeList"),
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
  touchButtons: [],
  players: [],
  ctx: null,
  gravity: 0.68,
  worldWidth: 7000,
  groundY: 440,
  platforms: [],
  ramps: [],
  keysInLevel: [],
  hazards: [],
  enemies: [],
  checkpoints: [],
  doors: [],
  clueMarkers: [],
  bikePortals: [],
  motoChallenge: {
    active: false,
    finishX: 0,
    startedFromLevel: 1,
  },
  respawnX: 100,
  discoveredKeyIds: new Set(),
  currentLevel: 1,
  totalLevels: TOTAL_LEVELS,
  rushTimer: 0,
};

const touchPointers = new Map();

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
    maxRunSpeed: 9.4,
    accelGround: 1.35,
    accelAir: 0.82,
    friction: 0.84,
    jumpPower: 16.2,
    jumpCutFactor: 0.58,
    coyoteFrames: 10,
    jumpBufferFrames: 12,
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
    wallClingFrames: 0,
    onBike: false,
    bikeAngle: 0,
    bikeAngularVelocity: 0,
    bikeAirborne: false,
    bikeSpin: 0,
    bikeAccelBonus: 0,
    bikeTopSpeedBonus: 0,
    bikeStability: 0,
    wallGrip: 0,
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

function applyPlayerUpgrades(player) {
  const speedLevel = game.save.upgrades.speed || 0;
  const jumpLevel = game.save.upgrades.jump || 0;
  const dashLevel = game.save.upgrades.dash || 0;
  const nitroLevel = game.save.upgrades.nitro || 0;
  const gyroLevel = game.save.upgrades.gyro || 0;
  const airLevel = game.save.upgrades.air || 0;
  const gripLevel = game.save.upgrades.grip || 0;
  const recoverLevel = game.save.upgrades.recover || 0;

  player.maxRunSpeed += speedLevel * 0.5;
  player.accelGround += speedLevel * 0.08;
  player.accelAir += speedLevel * 0.04;
  player.jumpPower += jumpLevel * 0.9;
  player.accelAir += airLevel * 0.08;
  player.jumpCutFactor += airLevel * 0.025;
  if (player.jumpCutFactor > 0.78) player.jumpCutFactor = 0.78;
  player.rollBoost = 3 + dashLevel * 0.55;
  player.wallGrip = gripLevel;
  player.coyoteFrames += recoverLevel * 2;
  player.jumpBufferFrames += recoverLevel * 2;
  player.bikeAccelBonus = nitroLevel * 0.05;
  player.bikeTopSpeedBonus = nitroLevel * 0.75;
  player.bikeStability = gyroLevel * 0.12;
}

function setupBikePortals(levelNumber) {
  const baseX = Math.floor(1500 + levelNumber * 180);
  const portalX = Math.max(900, Math.min(game.worldWidth - 260, baseX));
  game.bikePortals = [
    {
      id: `bike-${levelNumber}`,
      x: portalX,
      y: game.groundY - 128,
      width: 48,
      height: 120,
      used: false,
    },
  ];
}

function buildMotoChallengeCourse() {
  return {
    worldWidth: 9220,
    platforms: [
      { x: 0, y: 440, width: 420, height: 20 },
      { x: 860, y: 348, width: 170, height: 20 },
      { x: 1360, y: 420, width: 260, height: 20 },
      { x: 1880, y: 320, width: 230, height: 20 },
      { x: 2470, y: 392, width: 220, height: 20 },
      { x: 3080, y: 332, width: 420, height: 20 },
      { x: 3650, y: 286, width: 220, height: 20 },
      { x: 4170, y: 402, width: 180, height: 20 },
      { x: 4660, y: 328, width: 240, height: 20 },
      { x: 5290, y: 376, width: 210, height: 20 },
      { x: 5750, y: 300, width: 230, height: 20 },
      { x: 6310, y: 354, width: 210, height: 20 },
      { x: 6760, y: 286, width: 220, height: 20 },
      { x: 7260, y: 334, width: 240, height: 20 },
      { x: 7770, y: 268, width: 220, height: 20 },
      { x: 8240, y: 336, width: 260, height: 20 },
      { x: 8700, y: 286, width: 260, height: 20 },
      { x: 9040, y: 320, width: 240, height: 20 },
    ],
    ramps: [
      { x: 420, y1: 440, y2: 348, width: 440 },
      { x: 1030, y1: 348, y2: 420, width: 330 },
      { x: 1620, y1: 420, y2: 320, width: 260 },
      { x: 2110, y1: 320, y2: 392, width: 360 },
      { x: 2690, y1: 392, y2: 332, width: 390 },
      { x: 3500, y1: 332, y2: 286, width: 150 },
      { x: 3870, y1: 286, y2: 402, width: 300 },
      { x: 4350, y1: 402, y2: 328, width: 310 },
      { x: 4900, y1: 328, y2: 376, width: 390 },
      { x: 5500, y1: 376, y2: 300, width: 250 },
      { x: 5980, y1: 300, y2: 354, width: 330 },
      { x: 6520, y1: 354, y2: 286, width: 240 },
      { x: 6980, y1: 286, y2: 334, width: 280 },
      { x: 7500, y1: 334, y2: 268, width: 270 },
      { x: 7990, y1: 268, y2: 336, width: 250 },
      { x: 8500, y1: 336, y2: 286, width: 200 },
      { x: 8960, y1: 286, y2: 320, width: 80 },
    ],
    hazards: [
      { type: "spike", x: 760, y: 420, width: 40, height: 20 },
      { type: "spike", x: 980, y: 328, width: 40, height: 20 },
      { type: "spike", x: 1460, y: 400, width: 40, height: 20 },
      { type: "spike", x: 1970, y: 300, width: 40, height: 20 },
      { type: "spike", x: 2590, y: 372, width: 40, height: 20 },
      { type: "spike", x: 3320, y: 312, width: 40, height: 20 },
      { type: "spike", x: 3730, y: 266, width: 40, height: 20 },
      { type: "spike", x: 4260, y: 382, width: 40, height: 20 },
      { type: "spike", x: 4750, y: 308, width: 40, height: 20 },
      { type: "spike", x: 5360, y: 356, width: 40, height: 20 },
      { type: "spike", x: 5850, y: 280, width: 40, height: 20 },
      { type: "spike", x: 6410, y: 334, width: 40, height: 20 },
      { type: "spike", x: 6850, y: 266, width: 40, height: 20 },
      { type: "spike", x: 7350, y: 314, width: 40, height: 20 },
      { type: "spike", x: 7860, y: 248, width: 40, height: 20 },
      { type: "spike", x: 8330, y: 316, width: 40, height: 20 },
      { type: "spike", x: 8810, y: 266, width: 40, height: 20 },
    ],
  };
}

function beginMotoChallenge(triggerPlayer) {
  const course = buildMotoChallengeCourse();
  game.motoChallenge.active = true;
  game.motoChallenge.finishX = course.worldWidth - 90;
  game.motoChallenge.startedFromLevel = game.currentLevel;

  game.worldWidth = course.worldWidth;
  game.platforms = course.platforms;
  game.ramps = course.ramps;
  game.hazards = course.hazards;
  game.enemies = [];
  game.keysInLevel = [];
  game.checkpoints = [
    { x: 1120, active: false },
    { x: 2360, active: false },
    { x: 3580, active: false },
    { x: 4860, active: false },
    { x: 6140, active: false },
    { x: 7420, active: false },
    { x: 8580, active: false },
  ];
  game.doors = [];
  game.clueMarkers = [];
  game.bikePortals = [];
  game.respawnX = 120;

  for (const player of game.players) {
    player.x = 120 + player.id * 36;
    player.y = 320;
    player.vx = 5.8;
    player.vy = 0;
    player.onBike = true;
    player.bikeAngle = 0;
    player.bikeAngularVelocity = 0;
    player.bikeAirborne = false;
    player.bikeSpin = 0;
    player.input.upHeld = player.id === triggerPlayer.id || player.id === 0;
  }

  game.cameraX = 0;
  setMessage("Teleported to Moto Trial X. Longer track, tougher landings, bigger jumps.", 220);
}

function setupWorld(levelNumber = 1) {
  const basePlatforms = [
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

  const baseKeys = [
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

  const baseHazards = [
    { type: "lowLaser", x: 560, y: 329, width: 80, height: 16 },
    { type: "spike", x: 1710, y: 420, width: 40, height: 20 },
    { type: "lowLaser", x: 2300, y: 274, width: 90, height: 16 },
    { type: "spike", x: 3510, y: 420, width: 40, height: 20 },
    { type: "lowLaser", x: 4070, y: 344, width: 90, height: 16 },
    { type: "spike", x: 4820, y: 420, width: 40, height: 20 },
    { type: "lowLaser", x: 5590, y: 219, width: 90, height: 16 },
    { type: "spike", x: 6480, y: 420, width: 40, height: 20 },
  ];

  const baseEnemies = [
    { id: "e1", type: "sentry", x: 880, y: 390, width: 44, height: 50, vx: 1.45, minX: 820, maxX: 1100, active: true },
    { id: "e2", type: "drone", x: 2100, y: 230, width: 40, height: 34, vx: 1.68, minX: 2000, maxX: 2320, active: true },
    { id: "e3", type: "sentry", x: 3560, y: 280, width: 44, height: 50, vx: 1.78, minX: 3500, maxX: 3880, active: true },
    { id: "e4", type: "drone", x: 4700, y: 250, width: 40, height: 34, vx: 1.98, minX: 4540, maxX: 5000, active: true },
    { id: "e5", type: "sentry", x: 6150, y: 320, width: 44, height: 50, vx: 2.08, minX: 6040, maxX: 6400, active: true },
  ];

  const baseCheckpoints = [
    { x: 1050, active: false },
    { x: 2800, active: false },
    { x: 4500, active: false },
    { x: 6200, active: false },
  ];

  const baseDoors = [
    { id: "d1", x: 1660, y: 250, width: 34, height: 190, code: "431", solved: false, hint: "Door-1 code: 4 _ 1" },
    { id: "d2", x: 3980, y: 220, width: 34, height: 220, code: "872", solved: false, hint: "Door-2 code: 8 7 _" },
    { id: "d3", x: 6200, y: 210, width: 34, height: 230, code: "590", solved: false, hint: "Door-3 code: 5 _ 0" },
  ];

  const baseClues = [
    { id: "c1", doorId: "d1", x: 1510, y: 140, text: "Door-1 clue: middle digit is 3. Drop down and backtrack.", shown: false, cooldownFrames: 0 },
    { id: "c2", doorId: "d2", x: 4470, y: 140, text: "Door-2 clue: last digit is 2. Head back to the lock.", shown: false, cooldownFrames: 0 },
    { id: "c3", doorId: "d3", x: 5880, y: 160, text: "Door-3 clue: middle digit is 9. Return to unlock.", shown: false, cooldownFrames: 0 },
  ];

  if (levelNumber === 1) {
    game.worldWidth = 7000;
    game.platforms = basePlatforms;
    game.ramps = [];
    game.keysInLevel = baseKeys;
    game.hazards = baseHazards;
    game.enemies = baseEnemies;
    game.checkpoints = baseCheckpoints;
    game.doors = baseDoors;
    game.clueMarkers = baseClues;
    setupBikePortals(levelNumber);
    return;
  }

  if (levelNumber === 2) {
    game.worldWidth = 7600;
    game.platforms = basePlatforms
      .map((platform, i) => ({
        ...platform,
        x: platform.x + (i % 4) * 18,
        y: Math.max(115, platform.y - 50 + ((i % 3) - 1) * 14),
      }))
      .concat([
        { x: 6900, y: 350, width: 210, height: 20 },
        { x: 7160, y: 300, width: 170, height: 20 },
        { x: 7400, y: 255, width: 150, height: 20 },
      ]);
    game.ramps = [];

    game.keysInLevel = baseKeys.map((key, i) => ({
      ...key,
      x: key.x + (i % 2 === 0 ? 120 : -80),
      y: Math.max(110, key.y - (i % 4) * 16),
      collected: false,
    }));

    game.hazards = baseHazards.map((hazard, i) => ({
      ...hazard,
      x: hazard.x + (i % 2 ? 140 : 60),
      y: hazard.type === "lowLaser" ? Math.max(130, hazard.y - 25) : hazard.y,
    }));

    game.enemies = baseEnemies.map((enemy, i) => ({
      ...enemy,
      x: enemy.x + i * 120,
      minX: enemy.minX + i * 120,
      maxX: enemy.maxX + i * 120,
      active: true,
    }));

    game.checkpoints = [
      { x: 1180, active: false },
      { x: 3200, active: false },
      { x: 5200, active: false },
      { x: 7000, active: false },
    ];

    game.doors = [
      { id: "d1", x: 2120, y: 220, width: 34, height: 220, code: "642", solved: false, hint: "Door-1 code: 6 _ 2" },
      { id: "d2", x: 4620, y: 170, width: 34, height: 270, code: "958", solved: false, hint: "Door-2 code: 9 5 _" },
      { id: "d3", x: 7140, y: 190, width: 34, height: 250, code: "307", solved: false, hint: "Door-3 code: 3 _ 7" },
    ];

    game.clueMarkers = [
      { id: "c1", doorId: "d1", x: 1860, y: 130, text: "Door-1 clue: middle digit is 4. Climb, then return.", shown: false, cooldownFrames: 0 },
      { id: "c2", doorId: "d2", x: 5080, y: 120, text: "Door-2 clue: last digit is 8. Backtrack to the lock.", shown: false, cooldownFrames: 0 },
      { id: "c3", doorId: "d3", x: 7420, y: 150, text: "Door-3 clue: middle digit is 0. Drop down and unlock.", shown: false, cooldownFrames: 0 },
    ];
    setupBikePortals(levelNumber);
    return;
  }

  const difficulty = levelNumber - 2;
  const levelShiftX = 220 + difficulty * 95;
  const levelLift = Math.min(170, 70 + difficulty * 5);

  game.worldWidth = 8200 + difficulty * 140;
  game.platforms = basePlatforms
    .map((platform, i) => ({
      ...platform,
      x: platform.x + levelShiftX + (i % 5) * (18 + difficulty),
      y: Math.max(90, platform.y - levelLift + ((i + difficulty) % 4 - 1) * 14),
    }))
    .concat([
      { x: game.worldWidth - 1150, y: 260, width: 180, height: 20 },
      { x: game.worldWidth - 910, y: 210, width: 180, height: 20 },
      { x: game.worldWidth - 670, y: 170, width: 180, height: 20 },
      { x: game.worldWidth - 430, y: 220, width: 180, height: 20 },
      { x: game.worldWidth - 190, y: 300, width: 220, height: 22 },
    ]);
  game.ramps = [];

  game.keysInLevel = baseKeys.map((key, i) => ({
    ...key,
    x: key.x + levelShiftX + (i % 3) * (30 + difficulty * 2),
    y: Math.max(86, key.y - levelLift + (i % 5) * 8),
    collected: false,
  }));

  game.hazards = baseHazards.map((hazard, i) => ({
    ...hazard,
    x: hazard.x + levelShiftX + (i % 3) * 26,
    y: hazard.type === "lowLaser" ? Math.max(118, hazard.y - Math.floor(levelLift * 0.75)) : hazard.y,
  }));

  const extraHazards = [];
  if (difficulty >= 2) {
    extraHazards.push(
      {
        type: "spike",
        x: Math.floor(game.worldWidth * 0.26),
        y: game.groundY - 20,
        width: 40,
        height: 20,
      },
      {
        type: "lowLaser",
        x: Math.floor(game.worldWidth * 0.52),
        y: Math.max(120, game.groundY - 118),
        width: 96,
        height: 16,
      }
    );
  }
  if (difficulty >= 6) {
    extraHazards.push(
      {
        type: "spike",
        x: Math.floor(game.worldWidth * 0.74),
        y: game.groundY - 20,
        width: 40,
        height: 20,
      },
      {
        type: "lowLaser",
        x: Math.floor(game.worldWidth * 0.84),
        y: Math.max(112, game.groundY - 138),
        width: 104,
        height: 16,
      }
    );
  }

  game.hazards = game.hazards.concat(extraHazards);

  game.enemies = baseEnemies.map((enemy, i) => {
    const enemyShift = levelShiftX + i * 90;
    const velocityBoost = Math.min(1.4, difficulty * 0.08);
    return {
      ...enemy,
      x: enemy.x + enemyShift,
      minX: enemy.minX + enemyShift,
      maxX: enemy.maxX + enemyShift,
      vx: enemy.vx + velocityBoost,
      active: true,
    };
  });

  const extraEnemies = [];
  if (difficulty >= 1) {
    extraEnemies.push({
      id: `e${game.enemies.length + 1}`,
      type: "drone",
      x: Math.floor(game.worldWidth * 0.42),
      y: 210,
      width: 40,
      height: 34,
      vx: 1.65 + difficulty * 0.06,
      minX: Math.floor(game.worldWidth * 0.39),
      maxX: Math.floor(game.worldWidth * 0.48),
      active: true,
    });
  }
  if (difficulty >= 4) {
    extraEnemies.push({
      id: `e${game.enemies.length + extraEnemies.length + 1}`,
      type: "sentry",
      x: Math.floor(game.worldWidth * 0.66),
      y: 320,
      width: 44,
      height: 50,
      vx: 1.75 + difficulty * 0.07,
      minX: Math.floor(game.worldWidth * 0.62),
      maxX: Math.floor(game.worldWidth * 0.71),
      active: true,
    });
  }
  if (difficulty >= 8) {
    extraEnemies.push({
      id: `e${game.enemies.length + extraEnemies.length + 1}`,
      type: "drone",
      x: Math.floor(game.worldWidth * 0.8),
      y: 240,
      width: 40,
      height: 34,
      vx: 2 + difficulty * 0.08,
      minX: Math.floor(game.worldWidth * 0.77),
      maxX: Math.floor(game.worldWidth * 0.87),
      active: true,
    });
  }

  game.enemies = game.enemies.concat(extraEnemies);

  const cp1 = Math.floor(game.worldWidth * 0.2);
  const cp2 = Math.floor(game.worldWidth * 0.45);
  const cp3 = Math.floor(game.worldWidth * 0.68);
  const cp4 = Math.floor(game.worldWidth * 0.9);
  game.checkpoints = [
    { x: cp1, active: false },
    { x: cp2, active: false },
    { x: cp3, active: false },
    { x: cp4, active: false },
  ];

  const d1Code = String(200 + levelNumber * 7).padStart(3, "0");
  const d2Code = String(500 + levelNumber * 9).padStart(3, "0");
  const d3Code = String(700 + levelNumber * 5).padStart(3, "0");

  const d1X = Math.floor(game.worldWidth * 0.31);
  const d2X = Math.floor(game.worldWidth * 0.6);
  const d3X = Math.floor(game.worldWidth * 0.88);

  game.doors = [
    {
      id: "d1",
      x: d1X,
      y: 150,
      width: 34,
      height: 290,
      code: d1Code,
      solved: false,
      hint: `Door-1 code: ${d1Code[0]} _ ${d1Code[2]}`,
    },
    {
      id: "d2",
      x: d2X,
      y: 130,
      width: 34,
      height: 310,
      code: d2Code,
      solved: false,
      hint: `Door-2 code: ${d2Code[0]} ${d2Code[1]} _`,
    },
    {
      id: "d3",
      x: d3X,
      y: 140,
      width: 34,
      height: 300,
      code: d3Code,
      solved: false,
      hint: `Door-3 code: ${d3Code[0]} _ ${d3Code[2]}`,
    },
  ];

  game.clueMarkers = [
    {
      id: "c1",
      doorId: "d1",
      x: d1X - 180,
      y: 110,
      text: `Door-1 clue: middle digit is ${d1Code[1]}. Climb up then backtrack.`,
      shown: false,
      cooldownFrames: 0,
    },
    {
      id: "c2",
      doorId: "d2",
      x: d2X + 260,
      y: 100,
      text: `Door-2 clue: last digit is ${d2Code[2]}. Return to unlock.`,
      shown: false,
      cooldownFrames: 0,
    },
    {
      id: "c3",
      doorId: "d3",
      x: d3X + 170,
      y: 120,
      text: `Door-3 clue: middle digit is ${d3Code[1]}. Final backtrack lock.`,
      shown: false,
      cooldownFrames: 0,
    },
  ];

  setupBikePortals(levelNumber);
}

function isCluePinned(clue) {
  if (!clue?.shown) return false;
  const door = game.doors.find((item) => item.id === clue.doorId);
  return !door || !door.solved;
}

function renderLevelOptions() {
  const maxUnlocked = Math.max(1, Math.min(game.totalLevels, game.save.unlockedLevel || 1));
  game.levelSelect.innerHTML = "";

  for (let level = 1; level <= game.totalLevels; level += 1) {
    const option = document.createElement("option");
    option.value = String(level);
    option.textContent = level <= maxUnlocked ? `Level ${level}` : `Level ${level} (Locked)`;
    option.disabled = level > maxUnlocked;
    game.levelSelect.appendChild(option);
  }

  const selected = maxUnlocked;
  game.save.selectedLevel = selected;
  game.levelSelect.value = String(selected);
}

function renderUpgradeShop() {
  game.upgradeList.innerHTML = "";

  for (const upgrade of upgrades) {
    const level = game.save.upgrades[upgrade.id] || 0;
    const maxed = level >= upgrade.maxLevel;
    const cost = upgrade.cost + level * 10;

    const card = document.createElement("article");
    card.className = "skin-card";

    const name = document.createElement("div");
    name.className = "skin-name";
    name.textContent = upgrade.name;

    const state = document.createElement("div");
    state.className = "skin-state";
    state.textContent = `${upgrade.note} • Lv ${level}/${upgrade.maxLevel}`;

    const button = document.createElement("button");
    button.className = "skin-btn";

    if (maxed) {
      button.classList.add("select");
      button.textContent = "Maxed";
      button.disabled = true;
    } else if (game.save.keys >= cost) {
      button.classList.add("unlock");
      button.textContent = `Buy (${cost})`;
      button.addEventListener("click", () => {
        game.save.keys -= cost;
        game.save.upgrades[upgrade.id] = level + 1;
        saveProgress();
        renderSkinMenu();
        renderUpgradeShop();
      });
    } else {
      button.classList.add("locked");
      button.textContent = `Need ${cost - game.save.keys} more`;
      button.disabled = true;
    }

    card.append(name, state, button);
    game.upgradeList.appendChild(card);
  }
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

function resetTouchInput() {
  touchPointers.clear();
}

function getPrimaryPlayer() {
  return game.players[0] || null;
}

function setTouchPlayerInput(action, pressed) {
  const player = getPrimaryPlayer();
  if (!player) return;

  if (action === "left") player.input.left = pressed;
  if (action === "right") player.input.right = pressed;
  if (action === "jump") {
    player.input.upHeld = pressed;
    if (pressed) player.input.upPressed = true;
  }
  if (action === "roll") player.input.down = pressed;
}

function handleTouchAction(action, pressed) {
  if (action === "pause") {
    if (pressed && game.running) {
      game.paused = !game.paused;
      game.overlay.classList.toggle("hidden", !game.paused);
      game.overlay.textContent = game.paused ? "Paused" : "";
    }
    return;
  }

  if (action === "interact") {
    if (pressed) game.interactPressed = true;
    return;
  }

  setTouchPlayerInput(action, pressed);
}

function updateTouchAction(action, pointerId, pressed) {
  let pointers = touchPointers.get(action);
  if (!pointers) {
    pointers = new Set();
    touchPointers.set(action, pointers);
  }

  if (pressed) {
    const wasEmpty = pointers.size === 0;
    pointers.add(pointerId);
    if (wasEmpty) handleTouchAction(action, true);
    return;
  }

  if (!pointers.has(pointerId)) return;
  pointers.delete(pointerId);
  if (pointers.size === 0) handleTouchAction(action, false);
}

function bindTouchControls() {
  game.touchButtons = Array.from(document.querySelectorAll("[data-touch-action]"));

  for (const button of game.touchButtons) {
    const action = button.dataset.touchAction;
    if (!TOUCH_ACTIONS.includes(action)) continue;

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      updateTouchAction(action, event.pointerId, true);
    });

    const release = (event) => {
      updateTouchAction(action, event.pointerId, false);
    };

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }
}

function startGame() {
  const selectedParty = Math.max(1, Math.min(4, Number(game.partySizeSelect.value) || 1));
  const selectedLevel = Math.max(1, Math.min(game.save.unlockedLevel || 1, Number(game.levelSelect.value) || 1));
  game.save.partySize = selectedParty;
  game.save.selectedLevel = selectedLevel;
  game.currentLevel = selectedLevel;
  game.players = Array.from({ length: selectedParty }, (_, index) => {
    const player = createPlayer(index);
    applyPlayerUpgrades(player);
    return player;
  });
  game.score = 0;
  game.distance = 0;
  game.cameraX = 0;
  game.elapsedFrames = 0;
  game.combo = 0;
  game.comboTimer = 0;
  game.rushTimer = 0;
  game.autosaveTick = 0;
  game.respawnX = 100;
  game.paused = false;
  game.interactPressed = false;
  resetTouchInput();
  game.motoChallenge.active = false;
  game.motoChallenge.finishX = 0;
  game.motoChallenge.startedFromLevel = selectedLevel;
  game.discoveredKeyIds = new Set();
  setupWorld(selectedLevel);
  game.running = true;
  game.menu.classList.add("hidden");
  game.overlay.classList.add("hidden");
  setMessage(`Level ${selectedLevel} started. Team size: ${selectedParty}.`);
  saveProgress();
}

function finishRun() {
  game.running = false;
  game.menu.classList.remove("hidden");
  const bonus = 2 + Math.floor(game.discoveredKeyIds.size / 3) + game.doors.filter((door) => door.solved).length;
  game.save.keys += bonus;
  if (game.currentLevel < game.totalLevels && game.save.unlockedLevel < game.currentLevel + 1) {
    game.save.unlockedLevel = game.currentLevel + 1;
    game.save.selectedLevel = game.currentLevel + 1;
    game.missionNote.textContent = `Level ${game.currentLevel} clear! Bonus keys: ${bonus}. Level ${game.currentLevel + 1} unlocked.`;
  } else {
    game.missionNote.textContent = `Level ${game.currentLevel} clear! Bonus keys earned: ${bonus}.`;
  }
  renderLevelOptions();
  saveProgress();
  renderSkinMenu();
  renderUpgradeShop();
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
  if (player.onBike) {
    return {
      x: player.x - 8,
      y: player.y + 24,
      width: player.width + 20,
      height: 44,
    };
  }

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
  player.wallClingFrames = 0;
  player.onBike = game.motoChallenge.active || game.bikePortals.some((portal) => portal.used);
  player.bikeAngle = 0;
  player.bikeAngularVelocity = 0;
  player.bikeAirborne = false;
  player.bikeSpin = 0;
  player.input.upPressed = false;
  player.invulnerableFrames = 75;
  game.combo = 0;
  game.comboTimer = 0;

  if (reason === "trap") {
    const penalty = Math.max(0, 2 - (game.save.upgrades.shield || 0));
    game.save.keys = Math.max(0, game.save.keys - penalty);
    setMessage(`${player.label} hit a trap! Lost ${penalty} keys.`);
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

function activateBikeMode(player) {
  if (!game.motoChallenge.active) {
    beginMotoChallenge(player);
    return;
  }

  player.onBike = true;
  player.rolling = false;
  player.rollTimer = 0;
  player.bikeAngle = 0;
  player.bikeAngularVelocity = 0;
  player.bikeAirborne = false;
  player.bikeSpin = 0;
  player.vx = Math.max(player.vx, 6.2);
  player.vy = 0;
  setMessage(`${player.label} entered Bike Zone! Moto controls active.`, 160);
}

function updateBikePlayer(player) {
  const p = player;
  const prevX = p.x;
  const prevY = p.y;
  const bikeAccel = (p.input.upHeld ? 0.52 : 0.05) + (p.bikeAccelBonus || 0);
  const bikeMaxSpeed = p.maxRunSpeed + 6.4 + (p.bikeTopSpeedBonus || 0);

  if (p.input.upHeld) p.vx += bikeAccel;
  if (p.input.down) {
    p.vx *= 0.9;
    if (p.vx > 0.4) p.vx -= 0.22;
  }

  if (!p.input.upHeld && !p.input.down) {
    p.vx *= 0.995;
  }

  if (p.vx > bikeMaxSpeed) p.vx = bikeMaxSpeed;
  if (p.vx < -4.5) p.vx = -4.5;

  const tiltInput = (p.input.right ? 1 : 0) - (p.input.left ? 1 : 0);
  const stability = p.bikeStability || 0;
  p.bikeAngularVelocity += tiltInput * (p.onGround ? 0.01 : 0.018) * (1 - stability * 0.25);
  p.bikeAngularVelocity *= (p.onGround ? 0.88 : 0.988) + stability * 0.04;
  p.bikeAngle += p.bikeAngularVelocity;

  if (p.onGround) {
    p.bikeAngle *= 0.86 + stability * 0.05;
  }

  if (p.bikeAngle > 1.95) p.bikeAngle = 1.95;
  if (p.bikeAngle < -1.95) p.bikeAngle = -1.95;

  p.vy += game.gravity * 0.9;
  if (p.vy > p.maxFallSpeed + 3) p.vy = p.maxFallSpeed + 3;

  p.x += p.vx;
  p.y += p.vy;
  p.onGround = false;
  p.onWall = false;

  if (p.y + p.height >= game.groundY) {
    const landingVY = p.vy;
    const landingAngle = Math.abs(p.bikeAngle);
    p.y = game.groundY - p.height;
    if (p.vy > 2.5 && Math.abs(p.bikeSpin) > Math.PI * 1.7) {
      game.save.keys += 2;
      setMessage(`${p.label} landed a stunt! +2 keys`, 130);
      saveProgress();
    }
    if (landingVY > 8.4 && landingAngle > 0.7 && p.invulnerableFrames <= 0) {
      triggerRespawn(p, "trap");
      return;
    }
    p.vy = 0;
    p.onGround = true;
    p.bikeAirborne = false;
    p.bikeSpin = 0;
  }

  for (const platform of game.platforms) {
    const hitbox = playerHitbox(p);
    if (!rectsOverlap(hitbox, platform)) continue;

    const comingFromTop = p.vy >= 0 && p.y + p.height - p.vy <= platform.y + 10;
    if (comingFromTop) {
      const landingVY = p.vy;
      const landingAngle = Math.abs(p.bikeAngle);
      if (!p.onGround && p.vy > 1.8 && Math.abs(p.bikeSpin) > Math.PI * 1.7) {
        game.save.keys += 2;
        setMessage(`${p.label} rooftop stunt! +2 keys`, 130);
        saveProgress();
      }
      if (landingVY > 8.2 && landingAngle > 0.68 && p.invulnerableFrames <= 0) {
        triggerRespawn(p, "trap");
        return;
      }
      p.y = platform.y - p.height;
      p.vy = 0;
      p.onGround = true;
      p.bikeAirborne = false;
      p.bikeSpin = 0;
    } else if (prevX + p.width <= platform.x && p.x + p.width > platform.x) {
      const climbDelta = platform.y - (p.y + p.height);
      if (p.vx > 1.4 && climbDelta <= 42 && climbDelta >= -14) {
        p.y = platform.y - p.height;
        p.vy = 0;
        p.onGround = true;
        p.x += 2;
      } else {
        p.x = platform.x - p.width;
        p.vx *= 0.35;
      }
    } else if (prevX >= platform.x + platform.width && p.x < platform.x + platform.width) {
      p.x = platform.x + platform.width;
      p.vx *= 0.35;
    }
  }

  // Ride along sloped ramps in the Moto trial.
  const bikeAnchorX = p.x + p.width * 0.55;
  for (const ramp of game.ramps) {
    const rampEnd = ramp.x + ramp.width;
    if (bikeAnchorX < ramp.x || bikeAnchorX > rampEnd) continue;

    const t = (bikeAnchorX - ramp.x) / ramp.width;
    const surfaceY = ramp.y1 + (ramp.y2 - ramp.y1) * t;
    const wheelY = p.y + p.height;
    const prevWheelY = prevY + p.height;

    if (wheelY >= surfaceY - 2 && prevWheelY <= surfaceY + 20 && p.vy >= -2) {
      p.y = surfaceY - p.height;
      p.vy = 0;
      p.onGround = true;
      p.bikeAirborne = false;
      p.bikeSpin = 0;

      const slopeAngle = Math.atan2(ramp.y2 - ramp.y1, ramp.width);
      p.bikeAngle = p.bikeAngle * 0.78 + slopeAngle * 0.22;
      break;
    }
  }

  const crashAngle = 1.42 + stability * 0.2;
  const crashSpeed = 5.4 + stability * 0.55;
  if (p.onGround && Math.abs(p.bikeAngle) > crashAngle && Math.abs(p.vx) > crashSpeed && p.invulnerableFrames <= 0) {
    triggerRespawn(p, "trap");
    return;
  }

  if (!p.onGround) {
    p.bikeAirborne = true;
    p.bikeSpin += p.bikeAngularVelocity;
  }

  for (const checkpoint of game.checkpoints) {
    if (!checkpoint.active && p.x >= checkpoint.x) {
      checkpoint.active = true;
      game.respawnX = checkpoint.x + 30;
      setMessage(`Checkpoint reached: ${checkpoint.x}m`);
    }
  }

  const hitbox = playerHitbox(p);
  for (const portal of game.bikePortals) {
    if (portal.used) continue;
    if (!rectsOverlap(hitbox, portal)) continue;
    portal.used = true;
  }

  for (const key of game.keysInLevel) {
    if (key.collected) continue;
    const keyHitbox = { x: key.x - 10, y: key.y - 10, width: 20, height: 20 };
    if (!rectsOverlap(hitbox, keyHitbox)) continue;
    key.collected = true;
    if (!game.discoveredKeyIds.has(key.id)) {
      game.discoveredKeyIds.add(key.id);
      game.save.keys += 1;
      game.score += 10;
    }
  }

  for (const hazard of game.hazards) {
    if (!rectsOverlap(hitbox, hazard)) continue;
    if (p.invulnerableFrames <= 0) {
      triggerRespawn(p, "trap");
    }
    break;
  }

  for (const enemy of game.enemies) {
    if (!enemy.active) continue;
    const enemyBox = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
    if (!rectsOverlap(hitbox, enemyBox)) continue;
    if (p.invulnerableFrames <= 0) triggerRespawn(p, "trap");
    break;
  }

  applyDoorBlock(p, prevX);
  p.x = Math.max(0, Math.min(game.worldWidth - p.width, p.x));

  if (p.y > game.canvas.height + 240) {
    triggerRespawn(p, "fall");
  }
}

function updatePlayer(player) {
  const p = player;
  const prevX = p.x;
  const prevY = p.y;
  const rushActive = game.rushTimer > 0;

  if (p.onBike) {
    updateBikePlayer(p);
    return;
  }

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
  const accel = (p.onGround ? p.accelGround : p.accelAir) * (rushActive ? 1.12 : 1);
  const maxSpeed = p.maxRunSpeed * (rushActive ? 1.07 : 1);

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
    p.vx += (p.rollBoost || 2.3) * p.facing;
  }

  const wallGripBonus = p.wallGrip || 0;
  if (!p.onGround && p.onWall) {
    p.wallClingFrames = Math.min(18 + wallGripBonus * 5, p.wallClingFrames + 1);
    p.vy = Math.min(p.vy, 1.6 - wallGripBonus * 0.15);
    if ((movingLeft && p.wallDir === -1) || (movingRight && p.wallDir === 1)) {
      p.vy = Math.min(p.vy, 0.8 - wallGripBonus * 0.1);
    }
  } else if (p.wallClingFrames > 0) {
    p.wallClingFrames -= 1 + wallGripBonus * 0.25;
  }

  if (p.rolling) p.vx *= 1.04;

  if (p.vx > maxSpeed) p.vx = maxSpeed;
  if (p.vx < -maxSpeed) p.vx = -maxSpeed;

  if (p.onGround) p.coyoteLeft = p.coyoteFrames;
  else if (p.coyoteLeft > 0) p.coyoteLeft -= 1;

  if (p.jumpBufferLeft > 0 && p.onWall && !p.onGround) {
    p.vy = -(p.jumpPower * 1.02 * (rushActive ? 1.05 : 1));
    p.vx = -p.wallDir * (p.maxRunSpeed * 1.05);
    p.facing = -p.wallDir;
    p.onWall = false;
    p.wallClingFrames = 0;
    p.coyoteLeft = 0;
    p.jumpBufferLeft = 0;
  } else if (p.jumpBufferLeft > 0 && p.coyoteLeft > 0) {
    p.vy = -(p.jumpPower * 1.02 * (rushActive ? 1.05 : 1));
    p.onGround = false;
    p.coyoteLeft = 0;
    p.jumpBufferLeft = 0;
  }

  if (!p.input.upHeld && p.vy < -2.5) p.vy *= p.jumpCutFactor;

  p.vy += game.gravity * (p.wallClingFrames > 0 ? 0.84 - wallGripBonus * 0.03 : 1);
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

  if (p.onGround) p.wallClingFrames = 0;

  for (const checkpoint of game.checkpoints) {
    if (!checkpoint.active && p.x >= checkpoint.x) {
      checkpoint.active = true;
      game.respawnX = checkpoint.x + 30;
      setMessage(`Checkpoint reached: ${checkpoint.x}m`);
    }
  }

  const pHitbox = playerHitbox(p);
  for (const portal of game.bikePortals) {
    if (portal.used) continue;
    if (!rectsOverlap(pHitbox, portal)) continue;
    portal.used = true;
    activateBikeMode(p);
    break;
  }

  for (const clue of game.clueMarkers) {
    const nearClue = Math.abs(p.x - clue.x) < 80;
    const cooldownFrames = clue.cooldownFrames || 0;
    if (!nearClue || cooldownFrames > 0) continue;

    const isFirstDiscovery = !clue.shown;
    clue.shown = true;
    clue.cooldownFrames = 80;
    setMessage(isFirstDiscovery ? `Hint pinned: ${clue.text}` : `Clue reminder: ${clue.text}`, 180);
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

      game.rushTimer = Math.max(game.rushTimer, game.combo >= 3 ? 120 : 75);
      if (game.combo >= 3 && game.combo % 3 === 0) {
        setMessage("Momentum Rush! Keep moving.");
      }

      if (!game.discoveredKeyIds.has(key.id)) {
        game.discoveredKeyIds.add(key.id);
        game.save.keys += 1;
      }

      const magnetRadius = 14 + (game.save.upgrades.magnet || 0) * 6 + (game.save.upgrades.speed || 0) * 2;
      for (const nearby of game.keysInLevel) {
        if (nearby.collected || nearby.id === key.id) continue;
        if (Math.abs(nearby.x - p.x) < magnetRadius && Math.abs(nearby.y - p.y) < magnetRadius) {
          nearby.collected = true;
          if (!game.discoveredKeyIds.has(nearby.id)) {
            game.discoveredKeyIds.add(nearby.id);
            game.save.keys += 1;
          }
        }
      }
    }
  }

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
      const playerBox = playerHitbox(player);
      const doorZone = {
        x: door.x - 56,
        y: door.y,
        width: door.width + 112,
        height: door.height,
      };
      if (!rectsOverlap(playerBox, doorZone)) continue;

      const playerCenterX = player.x + player.width / 2;
      const doorCenterX = door.x + door.width / 2;
      const dist = Math.abs(playerCenterX - doorCenterX);
      if (!candidate || dist < candidate.distance) {
        candidate = { door, player, distance: dist };
      }
    }
  }

  if (!candidate) {
    setMessage("No locked door nearby. Stand by a door and press E.");
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

function drawStickman(ctx, player, color1, color2 = color1) {
  const isBlinking = player.invulnerableFrames > 0 && player.invulnerableFrames % 6 < 3;
  if (isBlinking) return;

  const cx = Math.round(player.x + player.width / 2);
  const bot = Math.round(player.y + player.height);
  const f = player.facing;
  const rollGlow = player.rolling ? 0.28 : 0;

  ctx.save();
  ctx.shadowColor = `rgba(255, 255, 255, ${0.14 + rollGlow})`;
  ctx.shadowBlur = 8 + rollGlow * 10;
  const bodyGradient = ctx.createLinearGradient(cx - 26, player.y, cx + 26, bot);
  bodyGradient.addColorStop(0, color1);
  bodyGradient.addColorStop(1, color2);
  ctx.strokeStyle = bodyGradient;
  ctx.fillStyle = bodyGradient;
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

function drawBikeRider(ctx, player, color1, color2 = color1) {
  const cx = player.x + player.width / 2;
  const wheelY = player.y + player.height - 8;
  const wheelGap = 26;

  ctx.save();
  ctx.translate(cx, wheelY - 6);
  ctx.rotate(player.bikeAngle);

  const frameGradient = ctx.createLinearGradient(-28, -10, 28, 10);
  frameGradient.addColorStop(0, color1);
  frameGradient.addColorStop(1, color2);
  ctx.strokeStyle = frameGradient;
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-wheelGap, 6);
  ctx.lineTo(-3, -8);
  ctx.lineTo(wheelGap, 6);
  ctx.lineTo(10, 6);
  ctx.lineTo(-3, -8);
  ctx.stroke();

  ctx.fillStyle = "#111a27";
  ctx.beginPath();
  ctx.arc(-wheelGap, 6, 11, 0, Math.PI * 2);
  ctx.arc(wheelGap, 6, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#dce8ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-wheelGap, 6, 6, 0, Math.PI * 2);
  ctx.arc(wheelGap, 6, 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = color1;
  ctx.beginPath();
  ctx.arc(0, -24, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = frameGradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(-2, -7);
  ctx.lineTo(-8, 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-2, -7);
  ctx.lineTo(12, -2);
  ctx.lineTo(wheelGap - 1, 6);
  ctx.stroke();

  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle = null, lineWidth = 1) {
  const corner = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + corner, y);
  ctx.lineTo(x + width - corner, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
  ctx.lineTo(x + width, y + height - corner);
  ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
  ctx.lineTo(x + corner, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
  ctx.lineTo(x, y + corner);
  ctx.quadraticCurveTo(x, y, x + corner, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawBackground(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
  sky.addColorStop(0, "#041018");
  sky.addColorStop(0.42, "#0e2440");
  sky.addColorStop(1, "#234365");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  const moonX = game.canvas.width * 0.82;
  const moonY = game.canvas.height * 0.18;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 90);
  moonGlow.addColorStop(0, "rgba(255, 244, 208, 0.95)");
  moonGlow.addColorStop(0.45, "rgba(255, 236, 178, 0.34)");
  moonGlow.addColorStop(1, "rgba(255, 236, 178, 0)");
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fef4cf";
  ctx.beginPath();
  ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#fff8d8";
  const stars = [
    [0.08, 0.12, 2], [0.17, 0.08, 1], [0.28, 0.2, 2], [0.39, 0.1, 1], [0.48, 0.16, 2],
    [0.62, 0.07, 1], [0.71, 0.18, 2], [0.84, 0.09, 1], [0.93, 0.14, 2], [0.58, 0.25, 1],
  ];
  for (const [sx, sy, size] of stars) {
    const x = sx * game.canvas.width + Math.sin(game.elapsedFrames * 0.01 + sx * 10) * 4;
    const y = sy * game.canvas.height;
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-game.cameraX * 0.1, 0);
  ctx.fillStyle = "rgba(44, 70, 99, 0.45)";
  for (let i = 0; i < 14; i += 1) {
    const x = i * 220;
    const towerHeight = 110 + (i % 4) * 18;
    ctx.fillRect(x, game.groundY - towerHeight - 36, 82, towerHeight);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(x + 14, game.groundY - towerHeight - 22, 8, towerHeight - 20);
    ctx.fillStyle = "rgba(44, 70, 99, 0.45)";
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-game.cameraX * 0.24, 0);
  ctx.fillStyle = "rgba(43, 91, 133, 0.42)";
  for (let i = 0; i < 22; i += 1) {
    const x = i * 340;
    const h = 90 + (i % 4) * 25;
    ctx.fillRect(x, game.groundY - h - 20, 220, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fillRect(x + 36, game.groundY - h + 4, 10, h - 24);
    ctx.fillStyle = "rgba(43, 91, 133, 0.42)";
  }
  ctx.restore();

  ctx.save();
  ctx.translate(-game.cameraX * 0.18, 0);
  ctx.fillStyle = "rgba(23, 40, 58, 0.8)";
  for (let i = 0; i < 18; i += 1) {
    const x = i * 420 + 40;
    const roofY = game.groundY - 30 - (i % 3) * 18;
    ctx.fillRect(x, roofY, 260, 8);
    ctx.fillRect(x + 24, roofY - 52, 14, 52);
    ctx.fillRect(x + 180, roofY - 34, 12, 34);
    ctx.fillStyle = i % 2 === 0 ? "rgba(255, 190, 61, 0.22)" : "rgba(74, 215, 209, 0.18)";
    ctx.fillRect(x + 72, roofY - 26, 26, 14);
    ctx.fillRect(x + 118, roofY - 26, 26, 14);
    ctx.fillStyle = "rgba(23, 40, 58, 0.8)";
  }
  ctx.restore();

  const mist = ctx.createLinearGradient(0, game.groundY - 140, 0, game.canvas.height);
  mist.addColorStop(0, "rgba(125, 178, 226, 0)");
  mist.addColorStop(0.5, "rgba(125, 178, 226, 0.12)");
  mist.addColorStop(1, "rgba(11, 20, 35, 0.28)");
  ctx.fillStyle = mist;
  ctx.fillRect(0, game.groundY - 140, game.canvas.width, game.canvas.height - (game.groundY - 140));
}

function drawWorld(ctx) {
  ctx.save();
  ctx.translate(-game.cameraX, 0);

  const ground = ctx.createLinearGradient(0, game.groundY, 0, game.canvas.height);
  ground.addColorStop(0, "#1e364f");
  ground.addColorStop(1, "#132335");
  ctx.fillStyle = ground;
  ctx.fillRect(0, game.groundY, game.worldWidth, game.canvas.height - game.groundY);

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let x = 0; x < game.worldWidth; x += 44) {
    ctx.fillRect(x, game.groundY + ((x / 44) % 3 === 0 ? 2 : 12), 22, 2);
  }

  ctx.fillStyle = "#3d6388";
  for (const platform of game.platforms) {
    const platformShade = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
    platformShade.addColorStop(0, "#8ea8bf");
    platformShade.addColorStop(0.4, "#4d6c86");
    platformShade.addColorStop(1, "#233e57");
    ctx.fillStyle = platformShade;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(platform.x, platform.y, platform.width, 3);
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(platform.x, platform.y + platform.height - 3, platform.width, 3);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeRect(platform.x + 1, platform.y + 1, platform.width - 2, platform.height - 2);
  }

  for (const ramp of game.ramps) {
    const rampGradient = ctx.createLinearGradient(ramp.x, ramp.y1, ramp.x + ramp.width, ramp.y2);
    rampGradient.addColorStop(0, "#9cb4ca");
    rampGradient.addColorStop(1, "#2b4763");
    ctx.fillStyle = rampGradient;
    ctx.beginPath();
    ctx.moveTo(ramp.x, ramp.y1);
    ctx.lineTo(ramp.x + ramp.width, ramp.y2);
    ctx.lineTo(ramp.x + ramp.width, ramp.y2 + 20);
    ctx.lineTo(ramp.x, ramp.y1 + 20);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ramp.x, ramp.y1 + 1);
    ctx.lineTo(ramp.x + ramp.width, ramp.y2 + 1);
    ctx.stroke();
  }

  for (const key of game.keysInLevel) {
    if (key.collected) continue;
    const keyGlow = ctx.createRadialGradient(key.x, key.y, 2, key.x, key.y, 18);
    keyGlow.addColorStop(0, "rgba(255, 245, 190, 0.95)");
    keyGlow.addColorStop(1, "rgba(255, 189, 61, 0)");
    ctx.fillStyle = keyGlow;
    ctx.beginPath();
    ctx.arc(key.x, key.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8be3d";
    ctx.beginPath();
    ctx.arc(key.x, key.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 247, 205, 0.95)";
    ctx.fillRect(key.x - 3, key.y - 2, 12, 4);
  }

  for (const hazard of game.hazards) {
    if (hazard.type === "lowLaser") {
      ctx.fillStyle = "rgba(255, 83, 112, 0.95)";
      ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
      const laserGlow = ctx.createLinearGradient(hazard.x, 0, hazard.x + hazard.width, 0);
      laserGlow.addColorStop(0, "rgba(255, 83, 112, 0)");
      laserGlow.addColorStop(0.5, "rgba(255, 145, 166, 0.9)");
      laserGlow.addColorStop(1, "rgba(255, 83, 112, 0)");
      ctx.fillStyle = laserGlow;
      ctx.fillRect(hazard.x - 8, hazard.y - 7, hazard.width + 16, hazard.height + 14);
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.fillRect(hazard.x, hazard.y + 2, hazard.width, 2);
    } else {
      ctx.fillStyle = "#9db2cc";
      ctx.beginPath();
      ctx.moveTo(hazard.x, hazard.y + hazard.height);
      ctx.lineTo(hazard.x + hazard.width / 2, hazard.y);
      ctx.lineTo(hazard.x + hazard.width, hazard.y + hazard.height);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(hazard.x + 3, hazard.y + hazard.height - 2);
      ctx.lineTo(hazard.x + hazard.width / 2, hazard.y + 4);
      ctx.lineTo(hazard.x + hazard.width - 3, hazard.y + hazard.height - 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  for (const checkpoint of game.checkpoints) {
    const poleColor = checkpoint.active ? "#4ad7d1" : "#7f94ab";
    ctx.strokeStyle = poleColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(checkpoint.x, game.groundY - 82);
    ctx.lineTo(checkpoint.x, game.groundY);
    ctx.stroke();

    ctx.fillStyle = checkpoint.active ? "#4ad7d1" : "#7f94ab";
    ctx.fillRect(checkpoint.x, game.groundY - 82, 28, 18);
    ctx.fillStyle = checkpoint.active ? "rgba(74, 215, 209, 0.35)" : "rgba(127, 148, 171, 0.25)";
    ctx.fillRect(checkpoint.x - 10, game.groundY - 92, 48, 36);
    ctx.beginPath();
    ctx.moveTo(checkpoint.x + 28, game.groundY - 73);
    ctx.lineTo(checkpoint.x + 40 + Math.sin(game.elapsedFrames * 0.12) * 2, game.groundY - 66);
    ctx.lineTo(checkpoint.x + 28, game.groundY - 59);
    ctx.closePath();
    ctx.fillStyle = checkpoint.active ? "#dffcf9" : "#d0d9e5";
    ctx.fill();
  }

  for (const clue of game.clueMarkers) {
    const clueGlow = ctx.createRadialGradient(clue.x + 9, clue.y + 7, 2, clue.x + 9, clue.y + 7, 22);
    clueGlow.addColorStop(0, clue.shown ? "rgba(255, 235, 170, 0.95)" : "rgba(176, 195, 219, 0.8)");
    clueGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = clueGlow;
    ctx.fillRect(clue.x - 5, clue.y - 4, 28, 24);
    ctx.fillStyle = clue.shown ? "#ffd98c" : "#b0c3db";
    ctx.fillRect(clue.x, clue.y, 18, 14);
    ctx.strokeStyle = "rgba(12, 20, 32, 0.45)";
    ctx.strokeRect(clue.x, clue.y, 18, 14);
  }

  for (const portal of game.bikePortals) {
    const glow = ctx.createRadialGradient(
      portal.x + portal.width / 2,
      portal.y + portal.height / 2,
      8,
      portal.x + portal.width / 2,
      portal.y + portal.height / 2,
      48
    );
    if (portal.used) {
      glow.addColorStop(0, "rgba(74, 215, 209, 0.26)");
      glow.addColorStop(1, "rgba(74, 215, 209, 0)");
    } else {
      glow.addColorStop(0, "rgba(255, 142, 62, 0.62)");
      glow.addColorStop(1, "rgba(255, 142, 62, 0)");
    }
    ctx.fillStyle = glow;
    ctx.fillRect(portal.x - 30, portal.y - 22, portal.width + 60, portal.height + 44);

    const frame = ctx.createLinearGradient(portal.x, portal.y, portal.x + portal.width, portal.y + portal.height);
    frame.addColorStop(0, portal.used ? "rgba(99, 195, 191, 0.9)" : "rgba(255, 198, 122, 0.95)");
    frame.addColorStop(1, portal.used ? "rgba(74, 215, 209, 0.86)" : "rgba(255, 113, 61, 0.95)");
    ctx.fillStyle = frame;
    drawRoundedRect(ctx, portal.x, portal.y, portal.width, portal.height, 20, frame, "rgba(255,255,255,0.4)", 2);
  }

  for (const door of game.doors) {
    const solved = door.solved;
    const frameColor = solved ? "#4ad7d1" : "#7f4a59";
    const innerColor = solved ? "rgba(74, 215, 209, 0.35)" : "#5d3144";
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(door.x - 6, door.y + 10, door.width + 18, door.height + 6);
    ctx.fillStyle = frameColor;
    ctx.fillRect(door.x - 2, door.y - 2, door.width + 4, door.height + 4);
    if (door.solved) {
      const solvedGlow = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y + door.height);
      solvedGlow.addColorStop(0, "rgba(112, 255, 235, 0.6)");
      solvedGlow.addColorStop(1, "rgba(74, 215, 209, 0.45)");
      ctx.fillStyle = solvedGlow;
      ctx.fillRect(door.x, door.y, door.width, door.height);
      continue;
    }

    const doorFill = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y + door.height);
    doorFill.addColorStop(0, "#7a4056");
    doorFill.addColorStop(0.5, innerColor);
    doorFill.addColorStop(1, "#402231");
    ctx.fillStyle = doorFill;
    ctx.fillRect(door.x, door.y, door.width, door.height);
    ctx.fillStyle = "#f8be3d";
    ctx.fillRect(door.x + 6, door.y + 44, door.width - 12, 14);
    ctx.fillStyle = "rgba(255, 243, 194, 0.8)";
    ctx.fillRect(door.x + 9, door.y + 48, door.width - 18, 4);
    ctx.strokeStyle = "rgba(7, 10, 16, 0.35)";
    ctx.strokeRect(door.x + 2, door.y + 2, door.width - 4, door.height - 4);
  }

  for (const enemy of game.enemies) {
    if (!enemy.active) continue;

    if (enemy.type === "drone") {
      const droneGlow = ctx.createRadialGradient(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        2,
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        30
      );
      droneGlow.addColorStop(0, "rgba(255, 134, 179, 0.92)");
      droneGlow.addColorStop(1, "rgba(255, 134, 179, 0)");
      ctx.fillStyle = droneGlow;
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f687b3";
      ctx.beginPath();
      ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 20, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#182330";
      ctx.fillRect(enemy.x + 7, enemy.y + 10, enemy.width - 14, 6);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.strokeRect(enemy.x + 3, enemy.y + 4, enemy.width - 6, enemy.height - 8);
    } else {
      const sentryGlow = ctx.createRadialGradient(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        4,
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        34
      );
      sentryGlow.addColorStop(0, "rgba(159, 122, 234, 0.9)");
      sentryGlow.addColorStop(1, "rgba(159, 122, 234, 0)");
      ctx.fillStyle = sentryGlow;
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9f7aea";
      ctx.fillRect(enemy.x, enemy.y + 8, enemy.width, enemy.height - 8);
      ctx.fillStyle = "#e2d7ff";
      ctx.fillRect(enemy.x + 10, enemy.y + 14, enemy.width - 20, 8);
      ctx.fillStyle = "#1d2438";
      ctx.fillRect(enemy.x + 10, enemy.y + 22, enemy.width - 20, 8);
    }
  }

  const currentSkin = skins.find((skin) => skin.id === game.save.selectedSkin) || skins[0];
  for (const player of game.players) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, game.groundY - 4, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (player.onBike) {
      drawBikeRider(ctx, player, currentSkin.colors[0], currentSkin.colors[1]);
    } else {
      drawStickman(ctx, player, currentSkin.colors[0], currentSkin.colors[1]);
    }
    ctx.fillStyle = "#ecf5ff";
    ctx.font = "700 12px Nunito";
    ctx.fillText(player.label, player.x + 10, player.y - 8);
  }

  ctx.restore();
}

function drawHud(ctx) {
  drawRoundedRect(
    ctx,
    12,
    12,
    330,
    160,
    16,
    "rgba(6, 17, 31, 0.72)",
    "rgba(255, 255, 255, 0.18)",
    2
  );
  ctx.fillStyle = "rgba(248, 190, 61, 0.14)";
  ctx.fillRect(12, 12, 330, 6);

  const solvedDoors = game.doors.filter((door) => door.solved).length;

  ctx.fillStyle = "#e9f4ff";
  ctx.font = "700 18px Nunito";
  ctx.fillText(`Keys this run: ${game.discoveredKeyIds.size}`, 24, 40);
  ctx.fillText(`Total Keys: ${game.save.keys}`, 24, 64);
  ctx.fillText(`Distance: ${Math.floor(game.distance)}m`, 24, 88);
  ctx.fillText(`Team: ${game.players.length}  Combo: x${game.combo}`, 24, 112);
  ctx.fillText(`Doors solved: ${solvedDoors}/${game.doors.length}`, 24, 136);
  ctx.fillText(`Level: ${game.currentLevel}/${game.totalLevels}`, 24, 160);

  ctx.fillStyle = "#f8be3d";
  ctx.font = "700 16px Nunito";
  ctx.fillText("Parkour flow: run, wall-jump, roll, and keep momentum", 470, 34);

  const bikeActive = game.players.some((player) => player.onBike);
  const bikePortalRemaining = game.bikePortals.some((portal) => !portal.used);
  ctx.font = "700 14px Nunito";
  if (game.motoChallenge.active) {
    ctx.fillStyle = "#9df7ff";
    ctx.fillText("Moto Trial: finish line clears this level instantly", 470, 56);
    ctx.fillText("Controls: Up accelerate, Down brake, Left/Right tilt and flip", 470, 76);
  } else if (bikeActive) {
    ctx.fillStyle = "#9df7ff";
    ctx.fillText("Bike mode: Up accelerate, Down brake, Left/Right tilt for flips", 470, 56);
  } else if (bikePortalRemaining) {
    ctx.fillStyle = "#ffd9a8";
    ctx.fillText("Hit the glowing portal to teleport into the Moto Trial", 470, 56);
  }

  if (game.message) {
    ctx.fillStyle = "rgba(7, 18, 32, 0.72)";
    ctx.fillRect(360, 52, 560, 32);
    ctx.strokeStyle = "rgba(248, 190, 61, 0.6)";
    ctx.strokeRect(360, 52, 560, 32);
    ctx.fillStyle = "#ffe8ad";
    ctx.fillText(game.message, 376, 74);
  }

  const pinnedClues = game.clueMarkers.filter((clue) => isCluePinned(clue));
  if (!pinnedClues.length) return;

  const boxWidth = 560;
  const boxHeight = 28;
  const startX = 360;
  const startY = 12;

  ctx.font = "700 14px Nunito";
  for (let i = 0; i < pinnedClues.length; i += 1) {
    const y = startY + i * (boxHeight + 6);
    const clue = pinnedClues[i];

    drawRoundedRect(
      ctx,
      startX,
      y,
      boxWidth,
      boxHeight,
      10,
      "rgba(20, 36, 55, 0.86)",
      "rgba(74, 215, 209, 0.72)",
      1.5
    );
    ctx.fillStyle = "#d9fff9";
    ctx.fillText(clue.text, startX + 12, y + 19);
  }
}

function update() {
  if (!game.running || game.paused) {
    requestAnimationFrame(update);
    return;
  }

  for (const clue of game.clueMarkers) {
    if ((clue.cooldownFrames || 0) > 0) {
      clue.cooldownFrames -= 1;
    }
  }

  updateEnemies();

  for (const player of game.players) {
    updatePlayer(player);
  }

  handleDoorInteraction();

  if (game.rushTimer > 0) game.rushTimer -= 1;

  if (!game.players.length) {
    requestAnimationFrame(update);
    return;
  }

  const anchorPlayer =
    game.players.length === 1
      ? game.players[0]
      : game.players.reduce((best, player) => (player.x > best.x ? player : best), game.players[0]);
  const anchorCenterX =
    game.players.length === 1
      ? game.players[0].x + game.players[0].width / 2
      : game.players.reduce((sum, player) => sum + player.x + player.width / 2, 0) /
        game.players.length;
  const targetCamera = Math.max(
    0,
    Math.min(game.worldWidth - game.canvas.width, anchorCenterX - game.canvas.width / 2)
  );
  game.cameraX = targetCamera;

  game.distance = Math.max(
    game.distance,
    Math.floor(Math.max(...game.players.map((player) => player.x)))
  );
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

  if (game.motoChallenge.active && anchorPlayer.x >= game.motoChallenge.finishX) {
    game.save.keys += 6;
    game.missionNote.textContent = `Moto Trial cleared! Level ${game.currentLevel} completed.`;
    finishRun();
    requestAnimationFrame(update);
    return;
  }

  if (anchorPlayer.x >= game.worldWidth - 80) {
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
  renderLevelOptions();
  renderUpgradeShop();
  game.partySizeSelect.addEventListener("change", () => {
    setPartySize(Number(game.partySizeSelect.value) || 1);
  });
  game.levelSelect.addEventListener("change", () => {
    game.save.selectedLevel = Math.max(1, Math.min(game.save.unlockedLevel || 1, Number(game.levelSelect.value) || 1));
    game.levelSelect.value = String(game.save.selectedLevel);
    saveProgress();
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
  window.addEventListener("blur", () => {
    resetPlayersInput();
    resetTouchInput();
  });
}

function init() {
  bindEvents();
  bindTouchControls();
  renderSkinMenu();
  renderUpgradeShop();
  render();
  update();
}

init();
