"use strict";

const GRAVITY = 0.05;
const VX = 1.25 ;

let autoPilot = flase;

/*
Learn how to make a ship bounce around the canvas
with gravity, friction and mass.
*/

//Create a new Hexi instance, and start it.
var g = hexi(1280, 768, setup, ["images/star.png"]);

//Set the background color and scale the canvas
g.backgroundColor = 0x142a4f;
g.scaleToWindow();

//Declare variables used in more than one function
var ship = undefined;
var blocks = undefined;
var graph = undefined;
var targetAltitudeGraph = undefined;
var speedGraph = undefined;
var targetAltitude = undefined;
var prevX = undefined;
var prevY = undefined;
var prevVy = undefined;
var message = undefined;
var particleStream = undefined;

let pauseDone = false;

//If you 're not loading any files, start Hexi after
//you've decalred your global variables
g.start();

//The `setup` function to initialize your application
function setup() {



  // ======================================
  // initialize the line graph
  	graph = g.line();
  	graph.lineStyle(1.5, 0xffffff, 1); 

  	targetAltitudeGraph = g.line();
 	targetAltitudeGraph.lineStyle(1, 0xffff00, 1);

 	speedGraph = g.line();
 	speedGraph.lineStyle(2, 0xdb7b1c, 1);

  // =========================================
    // create the tiles 

    var tileHeight = 0;
    blocks = g.group();
    blocks.x = 0;
    blocks.y = 0;

    var holePos = (g.randomInt(1,10)*64);
    while (tileHeight < g.canvas.height) {
      var block = g.sprite(["images/tile.png"]);

      if (tileHeight == holePos) { tileHeight += 64}  // create a hole 
      block.x = g.canvas.width - 128;
      block.y = tileHeight;
      blocks.addChild(block);

      tileHeight+=64;
    } 

    targetAltitude = holePos+32;
    targetAltitudeGraph.drawPolygon(0, targetAltitude, g.canvas.width, targetAltitude);


  //Make a ship sprite.
  //circle arguments: diameter, fillStyle, strokeStyle, lineWidth, x, y
  //ship = g.circle(18, "powderBlue", "black", 2, 192, 256);
  ship = g.sprite(["images/lander.png"]);

  ship.x = 0;

  //Set the ship's velocity to 0
  //ship.vx = g.randomInt(5, 15);
  ship.vx = VX;
  ship.vy = 0;
  prevVy = 0;
  //ship.vy = g.randomInt(5, 15);

  //Physics properties
  ship.gravity = GRAVITY;


  // used to track the lines segments
  prevX = ship.x+ship.halfWidth;
  prevY = ship.y+ship.halfHeight;


  //Add the winning text
  message = g.text("Mission Complete", "48px Futura", "white", (g.canvas.width/2)-200, 100);
  message.visible = false;




  //When the pointer is tapped, center the ship
  //over the pointer and give it a new random velocity
  g.pointer.tap = function () {

  
    // check reset conditions
    if (!ship.visible || message.visible) {
      if (pauseDone) {
        reset();
        pauseDone = false;
      }      
    } else {
    }

  };

  g.pointer.press = function () {
      // play rocket gas animation
      return particleStream.play();

  }

  //Stop creating particles when the pointer is released
  g.pointer.release = function () {
    return particleStream.stop();
  };

  //Change the game state to `play`.
  g.state = play;

// ==============================

  particleStream = g.particleEmitter(100, //The interval, in milliseconds
  function () {
    return g.createParticles( //The `createParticles` method
    //ship.x+(ship.width/2), ship.y+ship.height, 
    (ship.width/2), ship.height,
    function () {
      return g.sprite("images/star.png");
    }, 
    ship,       //The container to add the particles to
    40,               //Number of particles
    0.1,              //Gravity
    true,             //Random spacing
    1,2);             //Min/max angle
  });







  


 


}


function shipExplode() {

      //Slow the ship down if it hits the bottom of the stage.
      ship.frictionX = 0.98;
      ship.visible = false;


      g.wait(1000, doPause);

      g.createParticles( //The `createParticles` method
      //ship.x+(ship.width/2), ship.y+ship.height, 
      (ship.x+ship.width/2), ship.y+ship.height/2,
      function () {
        return g.sprite("images/star.png");
      }, 
      g.stage,       //The container to add the particles to
      100,               //Number of particles
      0.0,              //Gravity
      true,             //Random spacing
      0,6.3,              //Min/max angle
      5,48,              // min/max size
      1,5                // min/max speed

      );    



}


let go = true;

//The `play` function will run in a loop
function play() {



  if (!ship.visible) { return}



  if (g.pointer.isDown) {
  	  ship.vy = ship.vy - 0.1 ; 
  }


  /////////////////////////////////////////////////////
  // Auto pilot 
  /////////////////////////////////////////////////////
  
  if (autoPilot) {

    var kv = 25;
    var ks = 1;

    var s = targetAltitude - (ship.y+ship.halfHeight);
    var control = -ship.vy*kv + (s*ks) 
    //console.log(control);

    if ( control<0) { 
      ship.vy = ship.vy - 0.11;

      g.createParticles( //The `createParticles` method
      //ship.x+(ship.width/2), ship.y+ship.height, 
      (ship.width/2), ship.height,
      function () {
        return g.sprite("images/star.png");
      }, 
      ship,       //The container to add the particles to
      5,               //Number of particles
      0.1,              //Gravity
      true,             //Random spacing
      1,2); 

    } else {
      // particleStream.stop();
    }
  }
  /////////////////////////////////////////////////////

  //Apply gravity to the vertical velocity
  ship.vy += ship.gravity;


  ship.x += ship.vx;
  ship.y += ship.vy;


  // Draw the trailing line
  if ((prevX != ship.x) || (prevY != ship.y))  {
    graph.drawPolygon(prevX, prevY, ship.x+ship.halfWidth, ship.y+ship.halfHeight);

    prevX = ship.x+ship.halfWidth;
    prevY = ship.y+ship.halfHeight;

  }

  var factor = 20;

  // Draw the velocity trailing line
  if (prevVy != ship.vy)  {
    speedGraph.drawPolygon(prevX, targetAltitude+(prevVy*factor), ship.x+ship.halfWidth, targetAltitude+(ship.vy*factor));
    prevVy = ship.vy;

  }


  // win condition
  if (ship.x > g.canvas.width - 64) {
    message.visible = true;
    ship.vx = 0;
    ship.vy = 0;
    ship.gravity = 0;
    g.wait(3000, doPause);
  }



  //graph.moveTo(ship.x, ship.y);


  //graph.drawPolygon(graphPoints);


  //Use Ga's custom `contain` method to bounce the ship
  //off the canvas edges and slow it to a stop:

  //1. Use the `contain` method to create a `collision` object
  //that checks for a collision between the ship and the
  //rectangular area of the stage. Setting `contain`'s 3rd
  //argument to `true` will make the ship bounce off the
  //stage's edges.
  var collision = g.contain(ship, g.stage, true);

  //2. If the collision object has a value of "bottom" and "top"
  if (collision) {
    if (collision.has("bottom") || collision.has("top")) {
        shipExplode();




    } 

  }

  // check collision with the tiles
  let shipVsBlock = blocks.children.some(block => {
    return g.hitTestRectangle(ship, block, true);  
  });

  if (shipVsBlock) {
      shipExplode();

  }



  //You can optionally write the bounce code manually using the following 4 if
  //statements.
  //These if statements all work in the same way:
  //If the ship crosses the canvas boundaries:
  //1. It's repositioned inside the canvas.
  //2. Its velocity is reversed to make it bounce, with
  //the mass subtracted so that it looses force over time.
  //3. If it's on the ground, friction is added to slow it down
  /*
  //Left
  if (ship.x < 0) {
    ship.x = 0;
    ship.vx = -ship.vx / ship.mass;
  }
  //Right
  if (ship.x + ship.diameter > canvas.width) {
    ship.x = canvas.width - ship.diameter;
    ship.vx = -ship.vx / ship.mass;
  }
  //Top
  if (ship.y < 0) {
    ship.y = 0;
    ship.vy = -ship.vy / ship.mass;
  }
  //Bottom
  if(ship.y + ship.diameter > canvas.height) {
     //Position the ship inside the canvas
    ship.y = canvas.height - ship.diameter;
     //Reverse its velocity to make it bounce, and dampen the effect with mass
    ship.vy = -ship.vy / ship.mass;
     //Add some friction if it's on the ground
    ship.frictionX = 0.96;
  } else {
     //Remove friction if it's not on the ground
    ship.frictionX = 1;
  }
  */

  //Add any extra optional game loop code here.
}
//# sourceMappingURL=bouncingship.js.map


function reset() {

  //Reset the game if the fairy hits a block
  ship.visible = true;
  ship.y = 100;
  ship.vy = 0;
  ship.x = 0;
  ship.vx = VX;

  ship.gravity = GRAVITY;
  prevX = ship.x;
  prevY = ship.y;
  prevVy = 0;

  g.remove(graph);
  graph = g.line();
  graph.lineStyle(1.5, 0xffffff, 1); 

  g.remove(speedGraph);
  speedGraph = g.line();
  speedGraph.lineStyle(2, 0xdb7b1c, 1);

  message.visible = false;

  //g.reset();
}

function doPause() {

  pauseDone = true;
}
