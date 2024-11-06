
module.exports = function resolve(player) {
  return {
    //x: player.x,
    //y: player.y,
    x: player.body.position[0],
    y: player.body.position[1],
    id: player.id,
    color: player.color,
    name: player.name,
    socket_id: player.socket_id,
    hitbox: player.hitbox,
    //spdx: player.spdx,
    //spdy: player.spdy,
    spdx: player.body.velocity[0],
    spdy: player.body.velocity[1],
    mouseAngle: player.mouseAngle,
    angle: player.angle,
    now: player.now,
    health: player.health,
    upPoints: player.upPoints,
    level: player.level,
    score: player.score,
    stats: player.stats,
    maxHealth: player.maxHealth,
    bulletLoaded: player.bulletLoaded,
    bulletLoadTime: player.bulletLoadTime
  };
}