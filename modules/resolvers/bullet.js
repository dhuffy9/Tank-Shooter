module.exports = function resolve(bullet) {
  return {
    x: bullet.body.position[0],
    y: bullet.body.position[1],
    hitbox: bullet.hitbox
  }
}