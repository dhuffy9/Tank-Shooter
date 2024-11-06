class Explosion {
  constructor(id, x, y, frames) {
    this.frameAmount = 8;

    this.playing = true;

    this.interval = null;
    this.frames = frames;
    this.index = 0;
    this.x = x;
    this.y = y;
    this.id = id;
    this.init();
  }

  init() {
    this.interval = setInterval(() => this.index++, 1000 / 25);
    //console.log(this.index)
  }

  afterDraw(ctx) {
    //console.log(this.index, this.frameAmount);
    const player = getPlayer(),
      y = this.y - player.y + canvas.height / 2,
      x = this.x - player.x + canvas.width / 2 - 68;

    if (this.index >= this.frameAmount) {
      clearInterval(this.interval);
      this.playing = false;
      //console.log("Skip drawing");
      return false;
    }
    //console.log('a')
    if (!this.playing) return;
    //console.log('Drawing');
    const sprite = this.frames[this.index];
    ctx.drawImage(img.explosion, sprite.x, sprite.y, sprite.w, sprite.h, x - (sprite.w / 2), y - (sprite.h / 2), 300, 300);
    return true;
  }
}
window.Explosion = Explosion;