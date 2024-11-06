/*
  Used internally as the world boundaries
*/

const p2 = require("p2"),
  { WALL_PADDING, WALL_THICKNESS, PLAYER ,WIDTH, HEIGHT,COLLIDE_ALL } = require("./consts");

class Wall {
  constructor(type, x, y) {
    this.body = new p2.Body({
      mass: 100
    });
    this.body.fixedX = x;
    this.body.fixedY = y;
    this.originalX = x;
    this.originalY = y;
    this.body.fixedRotation = true;
    this.body.parent = this;
    this.shape = new p2.Box(type === "horizontal" ? {
      width: WIDTH + WALL_PADDING,
      height: WALL_THICKNESS
    } : {
      width: WALL_THICKNESS,
      height: HEIGHT + WALL_PADDING
    });
    this.shape.collisionGroup = COLLIDE_ALL;
    this.shape.collisionMask = PLAYER;
    this.body.addShape(this.shape);
    this.material = new p2.Material();
    this.shape.material = this.material;
  }

  update() {
    this.body.position = [this.originalX, this.originalY];
  }
}

module.exports = Wall;