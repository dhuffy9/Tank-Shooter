const p2 = require('p2'), { WALL_PADDING, WALL_THICKNESS, PLAYER, BRICK, BULLET, COIN, BOMB, WIDTH, HEIGHT, COLLIDE_ALL } = require("./consts");

class Brick {
    constructor(x,y){
        this.type = "Brick";
        this.x = x;
        this.y = y;
        this.id = Math.random();
        this.hitbox = [50,50];

        this.shape = new p2.Box({ width: this.hitbox[0], height: this.hitbox[1]});
        this.body = new p2.Body({ mass: 0, position: [this.x, this.y], collisionResponse : true});
        this.shape.collisionGroup = BRICK;
        this.shape.collisionMask = PLAYER | BULLET | COIN ;
        this.body.addShape(this.shape);
        this.body.parent = this;
    }
}

module.exports = Brick;