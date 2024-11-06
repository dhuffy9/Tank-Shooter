/* global io */
const socket = io(),
  d = document,
  // creating canvas
  canvas = d.getElementById("gameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// resizes the canvas when the window is resized.
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


const ctx = canvas.getContext("2d");
ctx.font = "30px Arial";
// button
const enterButton = d.getElementById("enterGame"),
  playerName = d.getElementById("playerName"),
  joinGame = d.getElementById("joinPriveGame"),
  createGame = d.getElementById("privateGame"),

  mainMenu = d.getElementById("mainMenu"),
  upgrade_block = d.getElementById("upgrade-block"),
  upgrade_points = d.getElementById("upgrade-points"),
  playerCount = d.getElementById("player-count"),
  leaderboardBlock = d.getElementById("leaderboard-block"),
  upgradeBlock = d.getElementById("upgrade-block"),
  lbPlayerScore = d.getElementById("lb-player-points"),
  lbItem = d.getElementsByClassName("lb-item"),
  lbPlayerName = d.getElementById("lb-player-name"),
  lbPlayerRank = d.getElementById("lb-player-rank"),
  playerHealthBack = d.getElementById("player-health-background"),
  playerHealth = d.getElementById("player-health"),
  lbPlayerline = d.getElementById("lb-player-line"),
  skinColorItems = d.getElementsByClassName("skinColorItem");
var playerColor = null || "red";

enterButton.onclick = function() {
  JoinGame("global");
};
createGame.onclick = function() {
  JoinGame("create");
};
joinGame.onclick = function() {
  // here, we should create a prompt or an input to get the code from the user
  const game = prompt("Enter game code");
  JoinGame(game);
};

const skinColorsItems = document.getElementsByClassName("skinColorItem");
function selectSkinColor(num) {
  playerColor = colors[num];
}
for (let i = 0; i < skinColorsItems.length; i++) {
  const skinColorItem = skinColorsItems[i];
  skinColorItem.addEventListener("click", () => {
    let className = skinColorItem.classList.value;
    for (x = 0; x < skinColorsItems.length; x++) {
      const skinColorItemSecond = skinColorsItems[x];
      skinColorItemSecond.classList.remove("activeSkin")
    }
    if (className === "skinColorItem activeSkin") {
      skinColorItem.classList.remove("activeSkin")
    } else {
      skinColorItem.classList.toggle("activeSkin")
    }
    //console.log(skinColorItem.classList.value, i)
  });
}

function JoinGame(game) {
  socket.emit("JoinGame", game, playerName.value, playerColor);
  socket.emit("socket", { id: socket.id });
  mainMenu.style.display = "none";
  leaderboardBlock.style.display = "block";
  playerHealthBack.style.display = "block";
}

function reset() {
  oldPlayer = null;
  mainMenu.style.display = "";
  d.getElementById("code").innerHTML = "";
  const bar = document.querySelectorAll(".full");
  for (let i = 0; i < bar.length; i++) {
    bar[i].className = "";
  }
}

socket.on("disconnect", reset);

socket.on("connect_error", reset);

socket.on("InvalidGame", reset);

socket.on("GameID", (id) => {
  d.getElementById("code").innerHTML = `Room Code: ${id}`;
});

socket.on("starting", (data) => {
  d.getElementById("starts").innerHTML = `Game starting in: ${data.gameStartsI}`;
});

const img = {};
img.background = new Image();
img.background.src = "/img/background.jpg";
img.coin = new Image();
img.coin.src = "/img/coin_.png";
img.bullet = new Image();
img.bullet.src = "/img/bullet.png";
img.brick = new Image();
img.brick.src = "/img/brick.png";
img.bomb = new Image();
img.bomb.src = "/img/bomb.png";
img.explosion = new Image();
img.explosion.src = "/img/explosion.png";

var tankImageURLs =
  ['img/player-tank-red.png',
    'img/player-tank-blue.png',
    'img/player-tank-green.png',
    'img/player-tank-purple.png',
    'img/player-tank-olive.png'];

var shooterImageURLs =
  ['img/player-shooter-red.png',
    'img/player-shooter-blue.png',
    'img/player-shooter-green.png',
    'img/player-shooter-purple.png',
    'img/player-shooter-olive.png'];
var tankImages = []
var shooterImages = []
const colors = [
  "red",
  "blue",
  "green",
  "purple",
  "olive"
],
  objects = {
    players: [],
    bullets: [],
    coins: [],
    bricks: [],
    bombs: []
  };
// display: none; left: -264px;

for (let i = 0; i < shooterImageURLs.length; i++) {
  var imgage = new Image();
  imgage.src = tankImageURLs[i];
  var imgage2 = new Image();
  imgage2.src = shooterImageURLs[i];
  tankImages.push(imgage);
  shooterImages.push(imgage2);
}

socket.on("timer", function(data) {
  objects.timer = "" + data.timer;
});

socket.on("playerPositions", function(data) {
  objects.players = data;
});

socket.on("bulletPositions", function(data) {
  objects.bullets = data;
});

socket.on("coinPositions", function(data) {
  objects.coins = data;
});

socket.on("brickPositions", function(data) {
  objects.bricks = data;
});

socket.on("bombPositions", function(data) {
  objects.bombs = data;
});

socket.on("upgradeConfirmation", (data) => {
  const { num, level } = data;
  const bar = d.getElementById("skill-bar-" + (num).toString()),
    spam = bar.querySelector(":not(.full)");
  for (let player of Object.values(objects.players)) {
    if (spam !== null && player.upPoints >= 1 && player.stats[num] < 8 && (player.stats[num] + 1) === level) {
      spam.className = "full";
    }
  }
})

/*socket.on("playerDead", () =>{
  console.log("player is dead")
  mainMenu.style.display = "block";
  const bar = document.querySelectorAll(".full");
  for (let i = 0; i < bar.length; i++) {
    bar[i].className = "";
  }
});*/

function getPlayer() {
  const currentPlayer = objects.players.find((player) => {
    return player.socket_id === socket.id;
  });
  return currentPlayer || {}; // Returns an empty object if no player is found
}

function upgrade(num) {
  socket.emit("upgrade", { num, id: socket.id });
}


function drawPlayer() {
  const players = objects.players;
  const mainPlayer = getPlayer();
  if (!mainPlayer) return;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    const color = player.color;
    const index = colors.indexOf(color);
    const tankImg = tankImages[index];
    const shooterImg = shooterImages[index];

    const x = canvas.width / 2 + (player.x - mainPlayer.x);
    const y = canvas.height / 2 + (player.y - mainPlayer.y);

    // Draw only if the player is within visible range
    if (x > canvas.width + player.hitbox[0] || y > canvas.height + player.hitbox[1] || x < -player.hitbox[1] || y < -player.hitbox[1]) {
      continue;
    }

    // Draw tank image at calculated position, centered on the player
    ctx.drawImage(tankImg, x - player.hitbox[0] / 2, y - player.hitbox[1] / 2, player.hitbox[0], player.hitbox[1]);

    // Save the context before rotating
    ctx.save();
    ctx.translate(x, y); // Move origin to the player's position
    ctx.rotate(player.mouseAngle + Math.PI / 2); // Rotate to face the mouse

    // Draw the shooter image centered on the player, at a fixed size
    const fixedWidth = 70;
    const fixedHeight = 70;
    ctx.drawImage(shooterImg, -fixedWidth / 2, -fixedHeight / 2, fixedWidth, fixedHeight);

    ctx.restore(); // Restore the context for the next iteration
  }
}

function background() {
  const player = getPlayer(),
    width = 3000,
    height = 2500,
    x = canvas.width / 2 - player.x,
    y = canvas.height / 2 - player.y;

  // in this case, I have set the player's "width" and "height" to custom numbers in modules/player.js
  //ctx.drawImage(img.background, x, y, width, height);
  const  background = d.getElementById("gameCanvas")
  background.style.backgroundPosition = `${x}px ${y}px`;

}

function drawBullet() {
  const player = getPlayer(),
    bullets = objects.bullets;
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i],
        x = bullet.x - player.x + canvas.width / 2,
        y = bullet.y - player.y + canvas.height / 2;

    // if too far away, don't render
    if (x > canvas.width || y > canvas.height || x < 0 || y < 0) {
      continue;
    }

    ctx.drawImage(img.bullet, x, y, bullet.hitbox[0], bullet.hitbox[1]);
  }
}

function drawCoins() {
  /*
  6 coin sprites
  29x30
  6px between each thing
  21px first padding
  */
  const now = new Date,
    milliseconds = now.getMilliseconds();
  function drawCoin(coin, x, y) {
    const { id } = coin,
      startingFrame = Math.floor(id * 6),
      frame = (startingFrame + +(milliseconds / 166).toFixed()) % 6,
      clip = (frame * 35) + 21;
    //console.log(id)
    ctx.drawImage(img.coin, clip, 0, 32, 32, x - 9, y - 9, 18, 18);
  }
  const coin = objects.coins;
  const player = getPlayer();
  for (let i = 0; i < coin.length; i++) {
    const x = coin[i].x - player.x + canvas.width / 2,
      y = coin[i].y - player.y + canvas.height / 2;
    if (x > canvas.width || y > canvas.height || x < 0 || y < 0) {
      continue;
    }
    drawCoin(coin[i], x, y);
  }
}

function drawBrick() {
  const brick = objects.bricks;
  const player = getPlayer();
  for (let i = 0; i < brick.length; i++) {
    const x = brick[i].x - player.x + canvas.width / 2;
    const y = brick[i].y - player.y + canvas.height / 2;
    ctx.drawImage(img.brick, x, y, brick[i].hitbox[0], brick[i].hitbox[1]);
  }
}
var explosionArray = [];
var spriteSheetCopy;
function drawBomb() {
  const spriteSheet = [
    {//1
      x: 0,
      y: 0,
      w: 100,
      h: 278,
    },
    {//2
      x: 169,
      y: 0,
      w: 134,
      h: 278,
    },
    {//3
      x: 335,
      y: 0,
      w: 182,
      h: 278,
    },
    {//4
      x: 517,
      y: 0,
      w: 277,
      h: 278,
    },
    {//5
      x: 794,
      y: 0,
      w: 222,
      h: 278,
    },
    {//6
      x: 1016,
      y: 0,
      w: 182,
      h: 278,
    },
    {//7
      x: 1198,
      y: 0,
      w: 161,
      h: 278,
    },
    {//8
      x: 1416,
      y: 0,
      w: 126,
      h: 278,
    }
  ];
  spriteSheetCopy = spriteSheet.filter(() => true);

  var bomb = objects.bombs;
  const player = getPlayer();
  for (let i = 0; i < bomb.length; i++) {
    const x = bomb[i].x - player.x + canvas.width / 2;
    const y = bomb[i].y - player.y + canvas.height / 2;
    ctx.drawImage(img.bomb, x, y, bomb[i].hitbox[0], bomb[i].hitbox[1]);
    for (let i in bomb) {
      bomb[i].createdExplosionObject = false
      //console.log(bomb[i].toRemove)
      if (bomb[i].exploded) {
        //console.log("explosion")
        if (!bomb[i].createdExplosionObject) {
          if (explosionArray.find((explosion) => {
            return explosion.id === bomb[i].id;
          })) {
            continue;
          }
          var explosion = new Explosion(bomb[i].id, bomb[i].x, bomb[i].y, spriteSheet);
          explosionArray.push(explosion);
          bomb[i].createdExplosionObject = true;
        }
      }
    }
  }
}

socket.on("overBomb", (bomb) => {
  var explosion = new Explosion(bomb.id, bomb.x, bomb.y, spriteSheetCopy);
  explosionArray.push(explosion);
  bomb.createdExplosionObject = true;
})

function drawExplosion() {
  for (let i = explosionArray.length - 1; i >= 0; i--) {
    //console.log(i);
    explosionArray[i].afterDraw(ctx);
    if (!explosionArray[i].playing) {
      explosionArray.splice(i, 1)
    }
  }
}

function animate() { //lerp(min,max,fract)
  /*
  if (oldPlayer) { // smoothly move the camera around
    oldPlayer.x = lerp(oldPlayer.x, getOriginalPlayer().x, 0.03);
    oldPlayer.y = lerp(oldPlayer.y, getOriginalPlayer().y, 0.03);
  } else {
    getOriginalPlayer();
  }
  */
  ctx.clearRect(0, 0, canvas.width, canvas.height); // This deletes the area the timer occupies,
  background();
  drawCoins();
  drawBomb();
  drawBullet();
  drawPlayer();
  drawBrick();
  drawExplosion();
  window.requestAnimationFrame(animate);
}
window.requestAnimationFrame(animate);

document.onkeydown = function(e) {
  if (e.code === "KeyD" || e.code === "ArrowRight") //d
  {
    socket.emit("keyPress", {
      inputId: "right",
      state: true,
      angle: 90
    });
  }
  else if (e.code === "KeyS" || e.code === "ArrowDown") //s
  {
    socket.emit("keyPress", {
      inputId: "down",
      state: true,
      angle: 180
    });
  }
  else if (e.code === "KeyA" || e.code === "ArrowLeft") //a
  {
    socket.emit("keyPress", {
      inputId: "left",
      state: true,
      angle: -90
    });
  }
  else if (e.code === "KeyW" || e.code === "ArrowUp") //w
  {
    socket.emit("keyPress", {
      inputId: "up",
      state: true,
      angle: 0
    });
  }
  else if (e.code === "Space") {
    socket.emit("keyPress", {
      inputId: "drop",
      state: true
    });
  }
};
document.onkeyup = function(e) {
  if (e.code === "KeyD" || e.code === "ArrowRight") //d
  {
    socket.emit("keyPress", {
      inputId: "right",
      state: false,
      angle: 90
    });
  }
  else if (e.code === "KeyS" || e.code === "ArrowDown") //s
  {
    socket.emit("keyPress", {
      inputId: "down",
      state: false,
      angle: 180
    });
  }
  else if (e.code === "KeyA" || e.code === "ArrowLeft") //a
  {
    socket.emit("keyPress", {
      inputId: "left",
      state: false,
      angle: -90
    });
  }
  else if (e.code === "KeyW" || e.code === "ArrowUp") //w
  {
    socket.emit("keyPress", {
      inputId: "up",
      state: false,
      angle: 0
    });
  }
  else if (e.code === "Space") {
    socket.emit("keyPress", {
      inputId: "drop",
      state: false
    });
  }
  else if (e.code === "Digit1") {
    socket.emit("upgrade", { num: 0, id: socket.id });
  }
  else if (e.code === "Digit2") {
    socket.emit("upgrade", { num: 1, id: socket.id });
  }
  else if (e.code === "Digit3") {
    socket.emit("upgrade", { num: 2, id: socket.id });
  }
  else if (e.code === "Digit4") {
    socket.emit("upgrade", { num: 3, id: socket.id });
  }
  else if (e.code === "Digit5") {
    socket.emit("upgrade", { num: 4, id: socket.id });
  }
  else if (e.code === "Digit6") {
    socket.emit("upgrade", { num: 5, id: socket.id });
  }
  else if (e.code === "Digit7") {
    socket.emit("upgrade", { num: 6, id: socket.id });
  }
};

d.onmousedown = function() {
  socket.emit("keyPress", { inputId: "attack", state: true, });
};
d.onmouseup = function() {
  socket.emit("keyPress", { inputId: "attack", state: false });
};

d.onmousemove = function(e) {
  const x = e.clientX - (canvas.width / 2),
    y = e.clientY - (canvas.height / 2),
    angle = Math.atan2(y, x) //* (180 / Math.PI);
  socket.emit("keyPress", { inputId: "mouseAngle", state: angle });
};


// important information
setInterval(() => {
  upgrade_points.innerHTML = getPlayer().upPoints;
  if (getPlayer().upPoints >= 1) {
    upgrade_block.style.display = "block";
  } else {
    upgrade_block.style.display = "none";
  }

  playerCount.innerHTML = objects.players.length;

  lbItem[0].innerHTML = "";
  const players = objects.players.sort((a, b) => {
    return b.score - a.score;
  });
  const rank = players.indexOf(getPlayer()) + 1;
  for (let i = 0; (i < players.length) && (i < 10); i++) {
    if (rank > 10) {
      lbPlayerline.style.display = "block";
      if (players[i] === getPlayer()) {
        lbPlayerScore.innerHTML = players[i].score;
        lbPlayerName.innerHTML = players[i].name;
        lbPlayerRank.innerHTML = i + 1;
      }
    } else {
      lbPlayerline.style.display = "none";
    }
    const div = d.createElement("div");
    div.className = "lb-item";
    div.innerHTML =
      `
    <span class="rank">${i + 1} </span>
    <span class="player-name">${players[i].name}</span>
    <span class="points">${players[i].score}</span
    `;
    lbItem[0].appendChild(div);
  }
  const getPlayerHealth = getPlayer().health,
    playerMaxHealth = getPlayer().maxHealth;
  playerHealth.style.width = `${getPlayerHealth / playerMaxHealth * 100}%`;
  const player = getPlayer();
  if (player.health <= 0 || player.dead) {
    console.log(`player ${player.name} died`)
    reset();
    setTimeout(() => { player.isAlive = false; }, 500);
  }
  //Math.round((health / maxHealth) * 100)
}, 250);
