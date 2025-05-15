// Game variables
const bird = document.getElementById("bird");
const gameContainer = document.getElementById("game-container");
const gameBg = document.getElementById("game-bg");
const scoreElement = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const changeNameBtn = document.getElementById("change-name-btn");
const playerNameInput = document.getElementById("player-name");
const leaderboardList = document.getElementById("leaderboard-list");
const sunMoon = document.getElementById("sun-moon");

// Audio elements
const bgMusic = document.getElementById("bg-music");
const jumpSound = document.getElementById("jump-sound");
const scoreSound = document.getElementById("score-sound");
const crashSound = document.getElementById("crash-sound");

// Game settings
birdY = 100;
birdVelocity = 0.5;
gravity = 0.15;
jumpForce = -7;
gameRunning = false;
score = 0;
buildings = [];
buildingGap = 600;
buildingFrequency = 5000;
lastBuildingTime = 0;
gameSpeed = 2;
isDay = true;
playerName = "";

// Leaderboard settings
const maxLeaderboardEntries = 10;

// Load leaderboard from localStorage
function loadLeaderboard() {
  const leaderboard = JSON.parse(
    localStorage.getItem("leaderboard") || "[]"
  );
  return leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLeaderboardEntries);
}

// Save score to leaderboard
function saveScore(name, score) {
  if (!name || score === 0) return;
  const leaderboard = loadLeaderboard();
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem(
    "leaderboard",
    JSON.stringify(leaderboard.slice(0, maxLeaderboardEntries))
  );
}

// Display leaderboard
function displayLeaderboard() {
  leaderboardList.innerHTML = "";
  const leaderboard = loadLeaderboard();
  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

// Initialize game
function init() {
  playerName = localStorage.getItem("playerName") || "";
  createClouds(5);
  sunMoon.style.background = "#F1C40F";
  sunMoon.style.boxShadow = "0 0 30px #F1C40F";
  if (playerName) {
    startScreen.style.display = "none";
    startGame();
  } else {
    startScreen.style.display = "block";
    playerNameInput.focus();
  }
}

// Start game
function startGame() {
  bgMusic.volume = 0.3;
  bgMusic.play().catch((e) => console.log("Audio play failed:", e));
  buildings = [];

  gameContainer.querySelectorAll('.building').forEach((building) => {
    gameContainer.removeChild(building);
  });

 
   

  birdY = 100;
  birdVelocity = 0;
  score = 0;
  scoreElement.textContent = score;
  bird.style.top = birdY + "px";

  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp) {
  if (!gameRunning) return;

  updateBird();
  updateBuildings();
  checkCollisions();
  spawnBuildings(timestamp);

  requestAnimationFrame(gameLoop);
}

// Update bird
function updateBird() {
  birdVelocity += gravity;
  birdY += birdVelocity;
  bird.style.top = birdY + "px";

  // Rotate bird based on velocity
  bird.style.transform = `rotate(${birdVelocity * 3}deg)`;
}

// Make the bird jump
function jump() {
  if (!gameRunning) return;
  birdVelocity = jumpForce;
  jumpSound.currentTime = 0;
  jumpSound.play().catch((e) => console.log("Jump sound failed:", e));
}

// Create buildings
function createBuilding() {
  const buildingHeight = Math.floor(Math.random() * 250) + 100;
  const buildingWidth = Math.floor(Math.random() * 50) + 80;
  const building = document.createElement("div");
  building.className = "building";
  building.style.height = buildingHeight + "px";
  building.style.width = buildingWidth + "px";

  // Random building color
  const colors = [
    "var(--building-color-1)",
    "var(--building-color-2)",
    "var(--building-color-3)",
  ];
  building.style.background =
    colors[Math.floor(Math.random() * colors.length)];

  // Add windows
  const windowCount =
    Math.floor(buildingWidth / 15) * Math.floor(buildingHeight / 15);
  for (i = 0; i < windowCount; i++) {
    const window = document.createElement("div");
    window.className = "window";
    window.style.left = Math.random() * (buildingWidth - 10) + 5 + "px";
    window.style.top = Math.random() * (buildingHeight - 10) + 5 + "px";
    // Randomly light some windows at night
    if (!isDay && Math.random() > 0.7) {
      window.style.background = "#F39C12";
    }
    building.appendChild(window);
  }

  gameContainer.appendChild(building);

  buildings.push({
    element: building,
    x: gameContainer.offsetWidth,
    passed: false,
    width: buildingWidth,
  });
}

// Update building positions
function updateBuildings() {
  for (i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    building.x -= gameSpeed;
    building.element.style.left = building.x + "px";

    // Check if bird passed the building
    if (!building.passed && building.x + building.width < 80) {
      building.passed = true;
      score++;
      scoreElement.textContent = score;
      scoreSound.currentTime = 0;
      scoreSound
        .play()
        .catch((e) => console.log("Score sound failed:", e));
    }

    // Remove buildings that are off screen
    if (building.x < -building.width) {
      gameContainer.removeChild(building.element);
      buildings.splice(i, 1);
      i--;
    }
  }
}

// Spawn new buildings
function spawnBuildings(timestamp) {
  if (timestamp - lastBuildingTime > buildingFrequency) {
    createBuilding();
    lastBuildingTime = timestamp;

    // Increase difficulty
    if (score > 0 && score % 5 === 0) {
      gameSpeed += 0.2;
      buildingFrequency = Math.max(1500, buildingFrequency - 50);
    }
  }
}

// Create clouds
function createClouds(count) {
  for (i = 0; i < count; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    cloud.style.width = Math.random() * 100 + 50 + "px";
    cloud.style.height = Math.random() * 30 + 20 + "px";
    cloud.style.left = Math.random() * gameContainer.offsetWidth + "px";
    cloud.style.top = Math.random() * 200 + 50 + "px";
    gameContainer.appendChild(cloud);

    // Animate clouds
    animateCloud(cloud);
  }
}

// Animate clouds
function animateCloud(cloud) {
  pos = parseInt(cloud.style.left);
  const speed = Math.random() * 0.5 + 0.2;

  function move() {
    pos -= speed;
    cloud.style.left = pos + "px";

    if (pos < -parseInt(cloud.style.width)) {
      pos = gameContainer.offsetWidth;
    }

    if (gameRunning) {
      requestAnimationFrame(move);
    }
  }

  move();
}



// Check for collisions
function checkCollisions() {
  // Check if bird hits the ground or ceiling
  if (birdY > gameContainer.offsetHeight - 80 || birdY < 0) {
    endGame();
    return;
  }

  // Check if bird hits any buildings
  const birdRect = bird.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  for (const building of buildings) {
    const buildingRect = building.element.getBoundingClientRect();

    if (
      birdRect.right > buildingRect.left &&
      birdRect.left < buildingRect.right &&
      birdRect.bottom > buildingRect.top
    ) {
      endGame();
      return;
    }
  }
}

// End the game
function endGame() {
  gameRunning = false;
  finalScoreElement.textContent = score;
  saveScore(playerName, score);
  displayLeaderboard();
  gameOverElement.style.display = "block";
  bgMusic.pause();
  crashSound.play().catch((e) => console.log("Crash sound failed:", e));
}

// Restart the game
function restartGame() {
  // Clear all buildings
  for (const building of buildings) {
    gameContainer.removeChild(building.element);
  }
  buildings = [];

  // Reset game state
  birdY = 300;
  birdVelocity = 0;
  bird.style.top = birdY + "px";
  bird.style.transform = "rotate(0deg)";
  score = 0;
  scoreElement.textContent = score;
  gameSpeed = 2;
  buildingFrequency = 2000;
  lastBuildingTime = 0;
  isDay = true;

  // Hide game over screen
  gameOverElement.style.display = "none";

  // Start game
  gameRunning = true;
  bgMusic.currentTime = 0;
  bgMusic.play().catch((e) => console.log("Music restart failed:", e));
  requestAnimationFrame(gameLoop);
}

function updateBackground(name) {
  if (name.toLowerCase()   == "pookie") {
    gameBg.style.backgroundImage = "url('./assets/images/bg-pookiee.png')";
    bgMusic.src = "./assets/sounds/pookiee.mp3";
    bird.style.backgroundImage = "url('assets/images/bird-pookiee.png')";
  } else {
    gameBg.style.backgroundImage = "url('./assets/images/bg-normal.png')";
    bird.style.backgroundImage = "url('./assets/images/bird-normal.png')";
  }
}

// Event listeners
startBtn.addEventListener("click", (e) => {
  playerName = playerNameInput.value.trim();

  e.stopPropagation();

  updateBackground(playerName);

  if (playerName) {
    localStorage.setItem("playerName", playerName);
    startScreen.style.display = "none";
    startGame();
  } else {
    alert("Please enter a name!");
  }
});

changeNameBtn.addEventListener("click", () => {
  localStorage.removeItem("playerName");
  gameOverElement.style.display = "none";
  playerNameInput.value = "";
  startScreen.style.display = "block";
  playerNameInput.focus();
});

document.addEventListener("keydown", (e) => {
  e.stopPropagation();
  if (e.code === "Space" && gameRunning) {
    jump();
  }
});

gameContainer.addEventListener("click", (e) => {
  e.stopPropagation();

  if (gameRunning) jump();
});

restartBtn.addEventListener("click", restartGame);

// Start the game
init();
