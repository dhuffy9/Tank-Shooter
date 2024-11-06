module.exports = function resolve(brick) {
    return {
        x: brick.body.position[0],
        y: brick.body.position[1],
        hitbox: brick.hitbox
    }
}