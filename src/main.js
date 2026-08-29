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


// (async () => {
//    const app = new Application();

//    await app.init({ background: "#0c0c0c", resizeTo: window });

//    var mousePositionX = app.screen.width / 2
//    var mousePositionY = app.screen.height / 2

//    var score = 0

//    const rbTexture = await Assets.load('assets/rb.png')
//    const bbTexture = await Assets.load('assets/bb.png')
//    const ybTexture = await Assets.load('assets/yb.png')
//    const gbTexture = await Assets.load('assets/gb.png')
//    const blockTextures = [rbTexture, bbTexture, ybTexture, gbTexture]

//    var speedMultiplier = 1
//    var speedGrow = 0.001

//   //  const backgroundImg = await Assets.load('/assets/spacezanindevs.png')
//   //  const backgroundSprite = new TilingSprite({texture: backgroundImg, width: app.screen.width, height: app.screen.height})
//   //  backgroundSprite.tileScale.set(0.5,0.5)
//   //  app.stage.addChild(backgroundSprite)

//    const gapBetweenBricks = 10
//    const blocksList = []
//    const rows = 5
//    const columns = 12
//    var brickLenght = app.screen.width / columns - gapBetweenBricks
//    var brickHeight = 40


//    var ballCurrentVx = 3
//    var ballCurrentVy = -10


//    var isInStartPosition = true


//    const platformContainer = new Container()
//    app.stage.addChild(platformContainer)

//    const platformImg = await Assets.load("/assets/platform_sprite.png")
//    const platformSprite = new Sprite(platformImg)
//    platformSprite.anchor.set(0.25)
//    platformContainer.addChild(platformSprite)

//   //  const scoreText = new Graphics()
//   //  scoreText.Text = score.toString()
//   //  app.stage.addChild(scoreText)

  


//   const scoreTextBg = new Graphics()
//   scoreTextBg.rect(0,0,250,60)
//   scoreTextBg.x = 20
//   scoreTextBg.y = 800
//   scoreTextBg.fill("#faf6f6")
//   app.stage.addChild(scoreTextBg)

//   const scoreText = new Text("Score: 0", {
//     fill: "#3b1dc2",
//     fontSize: 50
//   })
//   scoreText.x = 20
//   scoreText.y = 800
//   app.stage.addChild(scoreText)





//    const bricksContainer = new Container()
//    app.stage.addChild(bricksContainer)
//    for (var row = 0; row < rows; row ++){
//     for (var column = 0; column < columns; column ++){

//       const random = Math.floor(Math.random() * blockTextures.length)
//       const randomColor = blockTextures[random]
//       const brick = new Sprite(randomColor)
//       // brick.fill(randomColor)
//       // brick.stroke(0xffffff, 2)
//       brick.x = gapBetweenBricks + column * (brickLenght + gapBetweenBricks)
//       brick.y = gapBetweenBricks + row * brickHeight

//       brick.width = brickLenght
//       brick.height = brickHeight

//       bricksContainer.addChild(brick)
//     }
//    }


//    const container = document.getElementById('pixi-container').appendChild(app.canvas);

//    const bunnyTexture = await Assets.load('/assets/bunny.png');
//    const bunnySprite = new Sprite(bunnyTexture);

//    bunnySprite.anchor.set(0.5);
//    bunnySprite.x = 40;
//    bunnySprite.y = 40;

//    //app.stage.addChild(bunnySprite)

//   //  const platform = new Graphics();
//   //  platform.rect(0,0,100,20)
//   //  platform.fill(0xff0000)
//   //  platform.stroke(0xfffff)
//   //  platformContainer.addChild(platform)

//    var ball = new Graphics()
   
//    ball.circle(0,0,10)
//    ball.fill("#ebe6e6")
//    ball.x = 50
//    ball.y = -10
//    platformContainer.addChild(ball)
   

//    function checkCollision(obj1, obj2){
//     if (obj2.x > obj1.x + obj1.width || obj2.x + obj2.width < obj1.x || obj2.y > obj1.y + obj1.height || obj2.y + obj2.height < obj1.y){
//       return false
//     }
//     return true
//    }

//    window.addEventListener('keydown', (event) => {
//     if (event.code == 'Space' && isInStartPosition == true){
//       ballCurrentVx = 3
//       ballCurrentVy = -10
//       isInStartPosition = false

//       var currentBallCoordinateX = ball.getGlobalPosition().x
//       var currentBallCoordinateY = ball.getGlobalPosition().y



//       platformContainer.removeChild(ball)
//       app.stage.addChild(ball)

//       ball.x = currentBallCoordinateX
//       ball.y = currentBallCoordinateY -20
//     }
//    })

//    app.canvas.addEventListener('mousemove', (event) => {
//     const react = app.canvas.getBoundingClientRect();
//     const x = event.clientX - react.left;
//     const y = event.clientY - react.top;
//     mousePositionX = x;
//     mousePositionY = y;
//    })

//    app.ticker.add((time) => {
//     platformContainer.x = mousePositionX - 50
//     platformContainer.y = app.canvas.getBoundingClientRect().bottom - 50;


//     scoreText.text = ("Score: " + score.toString())

//     if (isInStartPosition){
//       ball.x = 50
//       ball.y = -10
//     }
//     else{
//       ball.x += ballCurrentVx
//       ball.y += ballCurrentVy

//       ballCurrentVx *= (1 + speedGrow)
//       ballCurrentVy *= (1 + speedGrow)

//     }

//     if (bricksContainer.children.length == 0){
//       const scoreText = new Text("Score: 0", {
//       fill: "#e4e3eb",
//       fontSize: 100
//       })        
//         scoreText.width = 600
//         scoreText.height = 300
//         scoreText.anchor = 0.5
//         scoreText.x = app.screen.width / 2
//         scoreText.y = app.screen.height / 2
//         app.stage.addChild(scoreText)
//         scoreText.text = ("You win! Your score is " + score) 

//     }


//     if (ball.x < 0 || ball.x > app.screen.width){
//       ballCurrentVx = ballCurrentVx * (-1)
//     }

//     for (var i = 0; i < bricksContainer.children.length; i ++){
//       const brick = bricksContainer.children[i]

//       const ballBounds = ball.getBounds()
//       const brickBounds = brick.getBounds()

//       ball.width = ballBounds.width
//       ball.height = ballBounds.height

//       brick.width = brickBounds.width
//       brick.height = brickBounds.height

//       if (checkCollision(ballBounds, brickBounds)){
//         bricksContainer.removeChild(brick)
//         ballCurrentVy = ballCurrentVy * -1
//         score ++
//       }

//     }

//     if (checkCollision(platformSprite.getBounds(), ball.getBounds()) && isInStartPosition == false){
//       ballCurrentVy = ballCurrentVy * -1
//     }


//     if (ball.y > app.screen.height){
//       isInStartPosition = true
//       platformContainer.addChild(ball)
//       ball.x = 50
//       ball.y = -10
//       ballCurrentVx = 0
//       ballCurrentVy = 0
//       score -= 5
//     }

//     if (ball.y < 0){
//       ballCurrentVy = ballCurrentVy * -1
//         }



//    })

// })();
