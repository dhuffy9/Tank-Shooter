const p2 = require('p2'), { WALL_PADDING, WALL_THICKNESS, PLAYER, BRICK, BULLET, COIN, BOMB, WIDTH, HEIGHT, COLLIDE_ALL } = require("./consts");

class Bullet {
  constructor(angle,x,y,spd,range,damage){
    const c = Math.cos(angle),s = Math.sin(angle);
    this.type = "Bullet";
    this.hitbox = [10,10];
    // Center the bullet by subtracting half the hitbox dimensions
    this.muzzleOffset = 25;  // Distance from tank's center to the muzzle
    this.x = x + c * this.muzzleOffset - this.hitbox[0] / 2;
    this.y = y + s * this.muzzleOffset - this.hitbox[1] / 2;
    this.id = Math.random();
    this.spdx = c * ((spd*2) + 5);
    this.spdy = s * ((spd*2) + 5);
    this.toRemove = false;
    this.range = (range * 50) + 300;
    this.damage = (damage * 10) + 75;
    // p2.js
    this.shape = new p2.Circle({ radius: (this.hitbox[0]/2) });
    this.body = new p2.Body({ mass: 1, position: [this.x, this.y], collisionResponse : true});
    this.shape.collisionGroup = BULLET; // this is a bullet group
    this.shape.collisionMask = PLAYER | BRICK | COIN // | BOMB | COLLIDE_ALL;
    this.body.addShape(this.shape);
    this.body.parent = this;

    this.originalX = this.body.position[0];
    this.originalY = this.body.position[1];

    //console.log(this.type +" position :" + this.body.position);
  }
  update(){
    this.body.position[0] += this.spdx;
    this.body.position[1] += this.spdy;
    /*
    this.body.velocity[0] = this.spdx;
    
    */
    // check distance traveled.
    if(Math.sqrt((this.originalX - this.body.position[0])**2+(this.originalY-this.body.position[1])**2) > this.range){
      this.toRemove = true;
    }
  }
}


module.exports = Bullet;