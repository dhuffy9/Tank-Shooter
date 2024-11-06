module.exports = function resolve(coin) {
  return {
    x: coin.body.position[0],
    y: coin.body.position[1],
    id: coin.id,
    x1: coin.x,
    y1: coin.y
  }
}