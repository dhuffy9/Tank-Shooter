const p2 = require('p2'), { WALL_PADDING, WALL_THICKNESS, PLAYER, BRICK, BULLET, COIN, BOMB, WIDTH, HEIGHT, COLLIDE_ALL } = require("./consts");

class Player {
  constructor(id, name, socket, color, game) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.socket = socket;
    this.type = "Player";
    this.game = game;
    this.init();
  }
  init() {
    this.hitbox = [60, 60];
    this.x = Math.floor(Math.random() * (WIDTH - this.hitbox[0])); // Random x from 0 to 2950
    this.y = Math.floor(Math.random() * (HEIGHT - this.hitbox[1])); // Random y from 0 to 2450
    this.spdx = 0;
    this.spdy = 0;
    this.maxspd = 10;
    this.pressingLeft = false;
    this.pressingRight = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressedStart = false;
    this.pressingAttack = false;
    this.pressingDrop = false;
    this.mouseAngle = 0;
    this.isAlive = true;
    this.bullets = new Set();
    this.bombs = new Set()
    this.angle = 0;
    this.bulletLoaded = false;
    this.bombLoaded = false;
    this.bulletLoadTime = 0;
    this.bombLoadTime = 0;
    this.coins = 0;
    this.now = Date.now();
    this.health = 300;
    this.upPoints = 0;
    this.level = 1;
    this.score = 0;
    this.stats = [
      0, // 0 - player spd
      0, // 1 - bullet spd
      0, // 2 - bullet range
      0, // 3 - reload spd
      0, // 4 - bullet damage
      0, // 5 - player health
      0  // 6 - player heal
    ];
    this.maxHealth = 300;
    this.oldspdx = 0;
    this.oldspdy = 0;
    this.dead = false;
    this.waitRespawn = null;
    this.fricion = 0.3;
    // p2.js
    this.shape = new p2.Box({ width: this.hitbox[0], height: this.hitbox[1] });
    this.body = new p2.Body({ mass: 60, position: [this.x, this.y], collisionResponse :true, damping: this.fricion, angularDamping: this.fricion});
    this.shape.collisionGroup = PLAYER; // this is a player group
    this.shape.collisionMask = COIN | PLAYER | BULLET //PLAYER | BULLET | BRICK | COIN | BOMB | COLLIDE_ALL; // this can collide with player group
    this.body.addShape(this.shape);
    this.material = new p2.Material();
    this.shape.material = this.material;
    this.addedMaterial = false;
    this.body.parent = this;
  }

  update() {
    if (this.dead || this.health <= 0) {
      this.dead = true;
      //this.x = -500;
      //this.y = -500;
      /*if(this.waitRespawn === null){
        this.waitRespawn = setTimeout(()=>{
          this.init();
        }, 1000);
      }*/
      return;
    }
    this.now = Date.now();
    this.maxHealth = 300 + (this.stats[5] * 25);

    if (this.pressingLeft) {
      //this.spdx = -(this.maxspd + this.stats[0] / 4);
      this.body.velocity[0] = -(this.maxspd + this.stats[0] / 3);
    } else if (this.pressingRight) {
      //this.spdx = (this.maxspd + this.stats[0] / 4);
      this.body.velocity[0] = (this.maxspd + this.stats[0] / 3);
    }

    if (this.pressingDown) {
      //this.spdy = (this.maxspd + this.stats[0] / 4);
      this.body.velocity[1] = (this.maxspd + this.stats[0] / 3);
    } else if (this.pressingUp) {
      //this.spdy = -(this.maxspd + this.stats[0] / 4);
      this.body.velocity[1] = -(this.maxspd + this.stats[0] / 3);
    }
    this.accessories()
  }

  accessories() {
    if (this.pressingAttack && this.bulletLoaded) {
      let bullet = this.game.createBullet(this.mouseAngle, this.body.position[0], this.body.position[1], this.stats[1], this.stats[2], this.stats[4]);
      this.game.bullets.add(bullet);
      this.bullets.add(bullet);
      this.bulletLoaded = false;
      this.bulletLoadTime = Date.now();
      this.time = null;
    } else if (!this.bulletLoaded && Date.now() - this.bulletLoadTime >= 1500 - (this.stats[3] * 100)) {
      this.bulletLoaded = true;
    }

    // levels and coins count
    this.coinNeeded = Math.floor((this.level - 1) ** 2.5 + 5);
    if (this.coins >= this.coinNeeded) {
      this.coins -= this.coinNeeded;
      this.upPoints++;
      this.level++;
    }

    if (this.health <= this.maxHealth) {
      this.health += this.stats[6] * 0.05 + 0.025;
    }
  }

  collision(object) {
    //console.log("player collided with " + object);
    if (typeof(object) === "string") {
      object = { type: object, }
    }
    switch (object.type) {
      case "Coin":
          object.used = true;
          this.coins += 1;
          this.score += 1;
        break;
      case "Bullet":

          if(this.bullets.has(object)) break; // make sure that it is not the bullet of the same player

          this.health -= object.damage;
          this.removeBullet(object)
          break;
    }
  }

  removeBullet(bullet) {
    if (this.bullets.has(bullet)) { // make sure the player has the bullet
      this.bullets.delete(bullet);
    }
  }
}

module.exports = Player;