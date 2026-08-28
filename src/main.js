import { Application, Assets, Graphics, Sprite } from "pixi.js";

(async () => {
   const app = new Application();

   await app.init({ background: "#1099bb", resizeTo: window });

   const container = document.getElementById('pixi-container').appendChild(app.canvas);

   const bunnyTexture = await Assets.load('/assets/bunny.png');
   const bunnySprite = new Sprite(bunnyTexture);

   bunnySprite.anchor.set(0.5);
   bunnySprite.x = 40;
   bunnySprite.y = 40;

   app.stage.addChild(bunnySprite)

   var scale = 1
   var scaleDirection = 1;

   app.canvas.addEventListener('mousemove', (event) => {
    const react = app.canvas.getBoundingClientRect();
    const x = event.clientX - react.left;
    const y = event.clientY - react.top;
    bunnySprite.x = x;
    bunnySprite.y = y;
   })

   app.ticker.add((time) => {
    bunnySprite.rotation += 0.01 * time.deltaTime;
    scale += 0.01 * scaleDirection * time.deltaTime;


    if (scale > 3){
      scaleDirection = -1
    }
    else if (scale < 1){
      scaleDirection = 1
    }



    bunnySprite.scale.set(scale)
   })
  // // Create a new application
  // const app = new Application();

  // // Initialize the application
  // await app.init({ background: "#1099bb", resizeTo: window });

  // // Append the application canvas to the document body
  // document.getElementById("pixi-container").appendChild(app.canvas);

  // // Load the bunny texture
  // const texture = await Assets.load("/assets/bunny.png");

  // // Create a bunny Sprite
  // const bunny = new Sprite(texture);
  

  // // Center the sprite's anchor point
  // bunny.anchor.set(0.5);

  // // Move the sprite to the center of the screen
  // bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // // Add the bunny to the stage
  // app.stage.addChild(bunny);

  // // Listen for animate update
  // app.ticker.add((time) => {
  //   // Just for fun, let's rotate mr rabbit a little.
  //   // * Delta is 1 if running at 100% performance *
  //   // * Creates frame-independent transformation *
  //   bunny.rotation += 0.1 * time.deltaTime;
  // });
})();
