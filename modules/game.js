// All units should be base on p2 
// p2 (0,0) is the center 
// canvas (0,0) top left

const EventEmitter = require("events"),
  p2 = require('p2'),
  Player = require("./player"),
  Bullet = require("./bullet.js"),
  Coin = require("./coin.js"),
  Brick = require("./brick.js"),
  Bomb = require("./bomb.js"),
  Wall = require("./wall.js"),
  playerResolver = require("./resolvers/player"),
  bulletResolver = require("./resolvers/bullet"),
  coinResolver = require("./resolvers/coin"),
  brickResolver = require("./resolvers/brick"),
  bombResolver = require("./resolvers/bomb"),
  { WALL_PADDING, WALL_THICKNESS, PLAYER, BALL, GOAL, HEIGHT, WIDTH } = require("./consts");
const bullet = require("./coin");

class Game extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.world = new p2.World({ gravity: [0, 0] });
    this.players = {};
    this.sockets = [];
    this.started = false;
    this.bullets = new Set();
    this.bombs = new Set();
    this.coins = new Set();
    this.bricks = new Set();
    this.walls = new Set();
    this.intervals = {};
    this.initializeGameLoop()
    console.log('Game created');
  }

  initializeGameLoop() {
    this.initializeIntervals();
    this.initializeCollisionChecking();
    console.log("Game loop initialized.");
  }

  initializeIntervals(){
    // Main game interval
    this.intervals.main = setInterval(() => {
      this.updateGameState();
      this.world.step(1);
    }, 1e3 / 25); // 1000 / 25 = 40

    // Coin generation interval
    this.intervals.coins = setInterval(() => {
      this.generateCoins();
    }, 13e3);

    this.generateBricks();

  }

  updateGameState(){
    let playerPack = [], bulletsPack = [], bombsPack = [], coinsPack = [], bricksPack = [];
    for (let i in this.players) {
      this.players[i].socket_id = this.players[i].socket.id;
      const player = this.players[i], p = playerResolver(player);
      playerPack.push(p);

      player.update()
      /*
      if (player.addedMaterial) {
        console.log("it already has a materal")
        continue;
      }
      for (let j in this.players) {
        const player2 = this.players[j];
        this.bouceOjbects(player.material, player2.material);
        player.addedMaterial = true;
        console.log("Material added")
      }
      */

    }

    /*
    for (let brick of this.bricks) {
      if(brick.addedMaterial) return;

      for (let bullet of this.bullets) {
        this.bouceOjbects(brick.material, bullet.material);
        brick.addedMaterial = true;
        bullet.addedMaterial = true;
      }
    }
    */


    this.updateBullets(bulletsPack);
    this.updateCoins(coinsPack);
    this.updateBricks(bricksPack);

    this.emitAll("playerPositions", playerPack);
    this.emitAll("bulletPositions", bulletsPack)
    this.emitAll("brickPositions", bricksPack);
    //this.emitAll("bombPositions", bombsPack);
    this.emitAll("coinPositions", coinsPack);

  }

  updateBullets(bulletsPack) {
    for (const bullet of this.bullets) {
      const resolvedBullet = bulletResolver(bullet);
      bulletsPack.push(resolvedBullet);

      if (bullet.toRemove || Math.abs(bullet.x) > 5000 || Math.abs(bullet.y) > 5000) {
        this.removeBullet(bullet);
      }
      bullet.update();
    }
  }
  updateCoins(coinsPack) {
    for (const coin of this.coins) {
      coinsPack.push(coinResolver(coin));
      coin.update();
    }
  }
  updateBricks(bricksPack) {
    for (const brick of this.bricks) {
      bricksPack.push(brickResolver(brick));
    }
  }


  generateCoins() {
    if (this.coins.size >= 1500) return;

    for (let i = 0; i < 200; i++) {
      const coin = new Coin();
      this.addToWorld(coin, "object");
      this.coins.add(coin);
    }
  }
  generateBricks() {
    // creates 24 x 4 bricks (96 total)
    for (var i = 0; i < 24; i++) {
      let spaceInBetween = .5
      let x = Math.floor(Math.random() * 2950);
      let y = Math.floor(Math.random() * 2450);
      const isTooClose = (x, y) => {
        for (const brick of this.bricks) {
          if (Math.sqrt((brick.x - x) ** 2 + (brick.y - y) ** 2) < 400) {
            return true;
          }
        }
        return false;
      }
      while (isTooClose(x, y)) {
        x = Math.floor(Math.random() * 2950);
        y = Math.floor(Math.random() * 2450);
      }
      let direction = 0;
      for (let i = 0; i < 4; i++) {
        // create brick
        this.bricks.add(this.createBrick(x, y));
        const way = Math.random();
        if (way <= 0.33) {
          // turn left
          direction--;
          if (direction < 0) {
            direction = 3;
          }
        } else if (way <= 0.66) {
          // turn right
          direction++;
          if (direction > 3) {
            direction = 0;
          }
        }
        // moving blocks
        switch (direction) {
          case 0: { // right
            x += 50 + spaceInBetween;
            break;
          }
          case 1: {
            // down
            y += 50 + spaceInBetween;
            break;
          }
          case 2: {
            // left
            x -= 50 + spaceInBetween;
            break;
          }
          case 3: {
            // up
            y -= 50 + spaceInBetween;
          }
        }
        if (x > 2950) {
          x = 2950;
        }
        if (y > 2450) {
          y = 2450;
        }
        if (y < 0) {
          y = 0;
        }
        if (x < 0) {
          x = 0;
        }
      }
    }
  }

  removeBullet(bullet) {
    let player = Object.values(this.players).find((player) => player.bullets.has(bullet));
    this.bullets.delete(bullet);
    this.world.removeBody(bullet.body);
    player.removeBullet(bullet)
  }

  initializeCollisionChecking(){
    this.world.on("beginContact", function(evt) {
      //console.log("Collision detected");

      // Destructure to get bodies involved in the collision
      const { bodyA, bodyB } = evt;

      // Log positions for debugging
      //console.log(`Shape A Position: ${bodyA.parent.body.position}`);
      //console.log(`Shape B Position: ${bodyB.parent.body.position}`);

      // Determine the types of objects involved in the collision
      const isPlayerA = bodyA.parent instanceof Player;
      const isPlayerB = bodyB.parent instanceof Player;
      const isBulletA = bodyA.parent instanceof Bullet;
      const isBulletB = bodyB.parent instanceof Bullet;
      const isCoinA = bodyA.parent instanceof Coin;
      const isCoinB = bodyB.parent instanceof Coin;
      const isBrickA = bodyA.parent instanceof Brick;
      const isBrickB = bodyB.parent instanceof Brick;
      //const isBombA = bodyA.parent instanceof Bomb;
      //const isBombB = bodyB.parent instanceof Bomb;

      // Helper function to get the instance of a particular type
      function getEntity(typeA, typeB, EntityClass) {
        return typeA ? bodyA.parent : typeB ? bodyB.parent : null;
      }

      // Player-Player Collision
      if (isPlayerA && isPlayerB) {
        bodyA.parent.collision("player");
        bodyB.parent.collision("player");
        return;
      }

      // Player-Bullet Collision
      if ((isPlayerA && isBulletB) || (isPlayerB && isBulletA)) {
        const player = getEntity(isPlayerA, isPlayerB, Player);
        const bullet = getEntity(isBulletA, isBulletB, Bullet);

        // Pass the bullet instance to the player's collision method
        player.collision(bullet);
        return;
      }

      // Player-Coin Collision
      if ((isPlayerA && isCoinB) || (isPlayerB && isCoinA)) {
        //console.log("Player colliding with coin");

        const player = getEntity(isPlayerA, isPlayerB, Player);
        const coin = getEntity(isCoinA, isCoinB, Coin);

        if (player && coin) {
          player.collision(coin); // Pass coin instance for handling
          this.coins.delete(coin); // Remove coin from game state
          this.world.removeBody(coin.body);
        }
        return;
      }


      // Player-Brick Collision
      if ((isPlayerA && isBrickB) || (isPlayerB && isBrickA)) {
        const player = getEntity(isPlayerA, isPlayerB, Player);
        player.collision("brick");
        return;
      }

      /*
      // Player-Bomb Collision
      if ((isPlayerA && isBombB) || (isPlayerB && isBombA)) {
        const player = getEntity(isPlayerA, isPlayerB, Player);
        player.collision("bomb");
        return;
      }
      */
      // Bullet-Brick Collision
      if ((isBulletA && isBrickB) || (isBulletB && isBrickA)) {
        const bullet = getEntity(isBulletA, isBulletB, Bullet);
        const brick = getEntity(isBrickA, isBrickB, Brick);
        console.log(`Collision between bullet ${bullet.id} and brick ${brick.id}`);
        return;
      }

    }.bind(this)); // Bind `this` to access `this.coins` in the callback
  }

  createBullet(angle, x, y, spd, range, damage) {
    //console.log("game create bullet")
    const bullet = new Bullet(angle, x, y, spd, range, damage);
    this.addToWorld(bullet, "object")
    return bullet;
  }

  createBrick(x,y){
    const brick = new Brick(x,y);
    this.addToWorld(brick, "object");
    return brick;
  }


  addToWorld(thing, type) {
    if (type === "object") {
      this.world.addBody(thing.body);
    }
    if (type === "material") {
      this.world.addContactMaterial(thing);
    }
  }

  bouceOjbects(object1, object2) {
    //console.log("bouceOjbects")
    var objectVsObject = new p2.ContactMaterial(object1, object2, {
      friction: 1,
      restitution: 1.5
    });
    this.addToWorld(objectVsObject, "material");
  }

  createBoundaries() {
    this.leftWall = new Wall("vertical", -WALL_THICKNESS / 2, (HEIGHT + WALL_PADDING) / 2);
    this.rightWall = new Wall("vertical", WIDTH + WALL_THICKNESS / 2, (HEIGHT + WALL_PADDING) / 2);
    this.topWall = new Wall("horizontal", (WIDTH + WALL_PADDING) / 2, -WALL_THICKNESS / 2);
    this.bottomWall = new Wall("horizontal", (WIDTH + WALL_PADDING) / 2, HEIGHT + WALL_THICKNESS / 2);
    this.walls.add(this.leftWall)
    this.walls.add(this.rightWall)
    this.walls.add(this.topWall)
    this.walls.add(this.bottomWall)
    /*this.addToWorld(this.leftWall, "object");
    this.addToWorld(this.rightWall, "object");
    this.addToWorld(this.topWall, "object");
    this.addToWorld(this.bottomWall, "object");
    */

    for (let wall of this.walls) {
      this.addToWorld(wall, "object");
      //this.bouceOjbects(wall.material, this.ball.material);
    }
  }

  updateWalls() {
    this.leftWall.update();
    this.rightWall.update();
    this.topWall.update();
    this.bottomWall.update();
  }

  /*

  update() {
    this.updateItems(this.players);
    this.updateItems(this.bullets);
    this.updateItems(this.coins);
    //this.updateWalls();
    // this.ball.update();
    //this.updateItems(this.ball);
  }

  updateItems(object) {
    if (object === this.players) {
      for (const key in object) {
        const item = object[key];
        item.update();
      }
    } else if (object instanceof Set) {
      for (const bullet of this.bullets) {
        bullet.update();
      }
    } else {
      object.update()
    }
  }

  playerHas(item) {
    for (let j in this.players) {
      if (this.players[j].bullets.has(item)) {
        this.players[j].bullets.delete(item);
      }
    }
  }

  */

  addPlayer(player, socket) {
    this.players[player.id] = player;
    this.sockets.push(socket);
    this.addToWorld(player, "object")

    console.log(`player ${player.id} was added to the game ${this.id}`)

    //this.bouceOjbects(player.material, this.ball.material);
    /* NO NEED FOR THIS 
    // set the first player to red
    if (Object.keys(this.players).length > 1) {
      player.color = "red";
    }
    */
    // room code
    socket.emit("GameID", this.id);

    socket.on("keyPress", (data) => {
      const {
        inputId,
        state,
        angle
      } = data;
      switch (inputId) {
        case "right": {
          player.pressingRight = state;
          //player.angle = angle;
          break;
        }
        case "left": {
          player.pressingLeft = state;
          //player.angle = angle;
          break;
        }
        case "down": {
          player.pressingDown = state;
          //player.angle = angle;
          break;
        }
        case "up": {
          player.pressingUp = state;
          //player.angle = angle;
          break;
        }
        case "attack": {
          player.pressingAttack = state;
          break;
        }
        case "mouseAngle": {
          player.mouseAngle = state;
          break;
        }
        case "drop": {
          player.pressingDrop = state;
          break;
        }
      }
    });

    socket.on("upgrade", (data) => {
      const {
        num,
        id
      } = data;
      for (let i in this.players) {
        const player = this.players[i];
        if (player.id !== id) {
          continue;
        }
        // check player coins to see if upgrade is ok
        if (player.upPoints >= 1 && player.stats[num] < 8) {
          // Upgrade it!
          player.upPoints--;
          player.stats[num]++;
          socket.emit("upgradeConfirmation", {
            num,
            level: player.stats[num]
          });
        }
      }
    });
  }

  removePlayer(player, lost, socket) {
    console.log(`player ${player.id} was removed`)
    this.world.removeBody(player.body);
    if (socket) {
      socket.dead = true;
    }

    if (Object.values(this.players).filter((player) => { return player.dead; }).length === 1) {
      // last player, begin emitting successes and fails
      console.log("the last player is dead")
    }

    player.dead = true;
    // socket disconnect
    if (lost === 1) {
      console.log("socket disconnect");
      delete this.players[player.id];
      this.sockets = this.sockets.filter((sock) => {
        return sock !== socket;
      });
    }
    // stop the game, nobody is playing anymore.
    if (Object.keys(this.players).length === 0 || Object.values(this.players).every((player) => {
      return player.dead;
    })) {
      this.emit("GameEnd");
      for (let i in this.intervals) {
        clearInterval(this.intervals[i]);
      }
      console.log("nobody is playing anymore")
    }
  }

  emitAll() {
    for (let i = 0; i < this.sockets.length; i++) {
      this.sockets[i].emit(...arguments);
    }
  }
}



module.exports = Game;