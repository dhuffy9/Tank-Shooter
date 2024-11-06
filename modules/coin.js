const p2 = require('p2'), { WALL_PADDING, WALL_THICKNESS, PLAYER, BRICK, BULLET, COIN, BOMB, WIDTH, HEIGHT, COLLIDE_ALL } = require("./consts");
class Coin {
  constructor(x,y){
    this.type = "Coin"
    this.x = x || Math.floor(Math.random() * 3000);
    this.y = y || Math.floor(Math.random() * 2500);
    this.id = Math.random();
    this.hitbox = [18,18]
    this.used = false;
    // p2.js
    this.shape = new p2.Circle({ radius: (this.hitbox[0]/2) });
    this.body = new p2.Body({ mass: 1, position: [this.x, this.y], collisionResponse : true});
    this.shape.collisionGroup = COIN; // this is a COIN group
    this.shape.collisionMask = PLAYER | BRICK ; // this can collide with COIN group
    this.body.addShape(this.shape);
    this.body.parent = this;
  }
  update(){
    if(!this.used){
      this.used = true;
    }
  }
}

module.exports = Coin;