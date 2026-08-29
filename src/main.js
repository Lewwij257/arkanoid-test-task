import { Application, Assets, Text, Container, Graphics, Sprite, Circle } from "pixi.js";

(async () => {
   const app = new Application();

   await app.init({ background: "#1099bb", resizeTo: window });

   var mousePositionX
   var mousePositionY

   const blocksList = []
   const rows = 5
   const columns = 6
   var brickLenght = app.screen.width / columns
   var brickHeight = 40


   var ballCurrentVx = 3
   var ballCurrentVy = -5

   var isInStartPosition = true


   const platformContainer = new Container()
   app.stage.addChild(platformContainer)





   const bricksContainer = new Container()
   app.stage.addChild(bricksContainer)
   for (var row = 0; row < rows; row ++){
    for (var column = 0; column < columns; column ++){
      const brick = new Graphics();
      brick.rect(0,0,brickLenght,brickHeight)
      brick.fill(0xffffff)
      brick.stroke(0x00000)
      brick.x = column * brickLenght
      brick.y = row * brickHeight
      bricksContainer.addChild(brick)
    }
   }


   const container = document.getElementById('pixi-container').appendChild(app.canvas);

   const bunnyTexture = await Assets.load('/assets/bunny.png');
   const bunnySprite = new Sprite(bunnyTexture);

   bunnySprite.anchor.set(0.5);
   bunnySprite.x = 40;
   bunnySprite.y = 40;

   //app.stage.addChild(bunnySprite)

   const platform = new Graphics();
   platform.rect(0,0,100,20)
   platform.fill(0xff0000)
   platform.stroke(0xfffff)
   platformContainer.addChild(platform)

   var ball = new Graphics()
   
   ball.circle(0,0,10)
   ball.fill(0x00000)
   ball.x = 50
   ball.y = -10
   platformContainer.addChild(ball)
   

   function checkCollision(obj1, obj2){
    if (obj2.x > obj1.x + obj1.width || obj2.x + obj2.width < obj1.x || obj2.y > obj1.y + obj1.height || obj2.y + obj2.height < obj1.y){
      return false
    }
    return true
   }

   window.addEventListener('keydown', (event) => {
    if (event.code == 'Space' && isInStartPosition == true){
      ballCurrentVx = 3
      ballCurrentVy = -5
      isInStartPosition = false

      var currentBallCoordinateX = ball.getGlobalPosition().x
      var currentBallCoordinateY = ball.getGlobalPosition().y



      platformContainer.removeChild(ball)
      app.stage.addChild(ball)

      ball.x = currentBallCoordinateX
      ball.y = currentBallCoordinateY -20
    }
   })

   app.canvas.addEventListener('mousemove', (event) => {
    const react = app.canvas.getBoundingClientRect();
    const x = event.clientX - react.left;
    const y = event.clientY - react.top;
    mousePositionX = x;
    mousePositionY = y;
   })

   app.ticker.add((time) => {
    platformContainer.x = mousePositionX - 50
    platformContainer.y = app.canvas.getBoundingClientRect().bottom - 50;

    if (isInStartPosition){
      ball.x = 50
      ball.y = -10
    }
    else{
      ball.x += ballCurrentVx
      ball.y += ballCurrentVy
    }


    if (ball.x < 0 || ball.x > app.screen.width){
      ballCurrentVx = ballCurrentVx * (-1)
    }

    for (var i = 0; i < bricksContainer.children.length; i ++){
      const brick = bricksContainer.children[i]

      const ballBounds = ball.getBounds()
      const brickBounds = brick.getBounds()

      ball.width = ballBounds.width
      ball.height = ballBounds.height

      brick.width = brickBounds.width
      brick.height = brickBounds.height

      if (checkCollision(ballBounds, brickBounds)){
        bricksContainer.removeChild(brick)
        ballCurrentVy = ballCurrentVy * -1

      }

    }

    if (checkCollision(platform.getBounds(), ball.getBounds()) && isInStartPosition == false){
      ballCurrentVy = ballCurrentVy * -1
    }


    if (ball.y > app.screen.height){
      isInStartPosition = true
      platformContainer.addChild(ball)
      ball.x = 50
      ball.y = -10
      ballCurrentVx = 0
      ballCurrentVy = 0
    }



   })

})();
