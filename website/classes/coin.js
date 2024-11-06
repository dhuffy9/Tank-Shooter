/*
  6 coin sprites
  29x30
  6px between each thing
  21px first padding
  */
class Coin {
  constructor(id, x, y, ctx) {
    this.frameAmount = 6;

    this.ctx = ctx
    this.x = x;
    this.y = y;
    this.id = id;
    his.index = Math.floor(this.id * this.frameAmount);
    this.now = new Date();
    this.milliseconds = now.getMilliseconds();
    this.draw();
  }

  Draw() {
    const frame = (this.index + +(this.milliseconds / 166).toFixed()) % this.frameAmount;
    clip = (frame * 35) + 21;
    this.ctx.drawImage(img.coin, clip, 0, 32, 32, x, y, 18, 18);
  }
}
//window.Coin = Coin;