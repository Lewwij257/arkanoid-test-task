import { Application, Assets, Text, Container, Graphics, Sprite, TilingSprite } from "pixi.js";


class Arkanoid{
  constructor(){
    this.init()
  }

  async init() {
    this.app = new Application()
    await this.app.init({background: "#0c0c0c", resizeTo: window})


    this.score = 0
    this.ballCurrentVx = 3
    this.ballCurrentVy = -10
    this.isInStartPosition = true
    this.mousePositionX = this.app.screen.width / 2
    this.mousePositionY = this.app.screen.height / 2
    this.speedGrow = 0.001

    this.rbTexture = await Assets.load('assets/rb.png')
    this.bbTexture = await Assets.load('assets/bb.png')
    this.ybTexture = await Assets.load('assets/yb.png')
    this.gbTexture = await Assets.load('assets/gb.png')

    this.blockTextures = [this.rbTexture, this.bbTexture, this.ybTexture, this.gbTexture]

    this.createBackground()
    this.createBricks()
    this.createPlatform()
    this.createBall()
    this.createUi()
    this.setupControlls()

    document.getElementById('pixi-container').appendChild(this.app.canvas)

    this.app.ticker.add((time) => this.update(time))

  }


  createBackground(){

  }

  createBricks(){
    const gapBetweenBricks = 10
    const rows = 5
    const columns = 12
    const brickHeight = 40
    const brickLenght = (this.app.screen.width - gapBetweenBricks * (columns + 1)) / columns
    this.bricksContainer = new Container()
    this.app.stage.addChild(this.bricksContainer)

    for (var row = 0; row < rows; row ++){
      for (var column = 0; column < columns; column ++){

        const random = Math.floor(Math.random() * this.blockTextures.length)
        const randomColor = this.blockTextures[random]
        const brick = new Sprite(randomColor)
        brick.x = gapBetweenBricks + column * (brickLenght + gapBetweenBricks)
        brick.y = gapBetweenBricks + row * brickHeight

        brick.width = brickLenght
        brick.height = brickHeight

        this.bricksContainer.addChild(brick)
    }
   }
  }

  async createPlatform(){
    this.platformContainer = new Container()
    this.app.stage.addChild(this.platformContainer)
    const platformImg = await Assets.load("/assets/platform_sprite.png")
    this.platformSprite = new Sprite(platformImg)
    this.platformSprite.anchor.set(0.25)
    this.platformContainer.addChild(this.platformSprite)
   }
  

  createBall(){
    this.ball = new Graphics()
    this.ball.circle(0,0,10)
    this.ball.fill("#eeebeb")
    this.ball.x = 50
    this.ball.y = -10
    this.platformContainer.addChild(this.ball)
  }

  createUi(){

    this.scoreTextBg = new Graphics()
    this.scoreTextBg.rect(0,0,250,60)
    this.scoreTextBg.x = 20
    this.scoreTextBg.y = 800
    this.scoreTextBg.fill("#faf6f6")
    this.app.stage.addChild(this.scoreTextBg)

    this.scoreText = new Text("Score: 0", {fill: "#0a0a0a", fontSize: 50} )
    this.scoreText.x = 100
    this.scoreText.y = 30
    this.scoreText.anchor.set(0.5)
    this.scoreTextBg.addChild(this.scoreText)

  }

  setupControlls(){
    window.addEventListener('keydown', (event) => {
    if (event.code == 'Space' && this.isInStartPosition == true){
      this.ballCurrentVx = 3
      this.ballCurrentVy = -10
      this.isInStartPosition = false


      const pos = this.ball.getGlobalPosition()
      this.platformContainer.removeChild(this.ball)
      this.app.stage.addChild(this.ball)

      this.ball.x = pos.x
      this.ball.y = pos.y -20
    }
   }
  )

   this.app.canvas.addEventListener('mousemove', (event) => {
    const rect = this.app.canvas.getBoundingClientRect()
    this.mousePositionX = event.clientX - rect.left
    this.mousePositionY = event.clientY - rect.top
   })
  }

  checkCollision(obj1, obj2){
    if (obj2.x > obj1.x + obj1.width || obj2.x + obj2.width < obj1.x || obj2.y > obj1.y + obj1.height || obj2.y + obj2.height < obj1.y){
      return false
    }
    return true
  }

    update(time) {

        this.platformContainer.x = this.mousePositionX - 50;
        this.platformContainer.y = this.app.canvas.getBoundingClientRect().bottom - 50;

        this.scoreText.text = "Score: " + this.score;

        if (this.isInStartPosition) {
            this.ball.x = 50;
            this.ball.y = -10;
        } else {
            this.ball.x += this.ballCurrentVx;
            this.ball.y += this.ballCurrentVy;
            this.ballCurrentVx *= (1 + this.speedGrow);
            this.ballCurrentVy *= (1 + this.speedGrow);
        }

        if (this.bricksContainer.children.length === 0) {
            const winText = new Text("You win! Score: " + this.score, {
                fill: "#e4e3eb",
                fontSize: 80
            });
            winText.anchor.set(0.5);
            winText.x = this.app.screen.width / 2;
            winText.y = this.app.screen.height / 2;
            this.app.stage.addChild(winText);
            return;
        }

        if (this.ball.x < 0 || this.ball.x > this.app.screen.width) {
            this.ballCurrentVx = -this.ballCurrentVx;
        }
        if (this.ball.y < 0) {
            this.ballCurrentVy = -this.ballCurrentVy;
        }

        for (let i = 0; i < this.bricksContainer.children.length; i++) {
            const brick = this.bricksContainer.children[i];
            const ballBounds = this.ball.getBounds();
            const brickBounds = brick.getBounds();

            if (this.checkCollision(ballBounds, brickBounds)) {
                this.bricksContainer.removeChild(brick);
                this.ballCurrentVy = -this.ballCurrentVy;
                this.score++;
                break;
            }
        }

        if (this.platformSprite && this.checkCollision(this.platformSprite.getBounds(), this.ball.getBounds()) && !this.isInStartPosition) {
            this.ballCurrentVy = -this.ballCurrentVy;
        }

        if (this.ball.y > this.app.screen.height) {
            this.isInStartPosition = true;
            this.platformContainer.addChild(this.ball);
            this.ball.x = 50;
            this.ball.y = -10;
            this.ballCurrentVx = 3;
            this.ballCurrentVy = -10;
            this.score -= 5;
        }
    }


}

const game = new Arkanoid()

