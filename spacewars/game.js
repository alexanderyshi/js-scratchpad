// UI constants
var UI_PADDING = 10;

// pause variables
var paused = false;
var pause_button_lifted = true;
var pause_overlay_colour = "rgba(200,200,200,0.3)";

// game variables
var BLACK_HOLE_ENABLED = true;
var WINNING_POINTS = 5;
var NUM_ASTEROIDS = 8;

// event listeners and flags
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// game entities
var ships = []
var asteroids = [];
var blackHole;

function gameInit() {
    ships[0] = new Ship('rgba(220,60,60,0.5)', 0, 1);
    ships[1] = new Ship('rgba(60,60,220,0.5)', 0, 1);
    ships[0].randomizePosition();
    ships[1].randomizePosition();
    if (BLACK_HOLE_ENABLED === true)
    {
        blackHole = new BlackHole("rgba(220,220,220,1)", 0, canvas.width/2, canvas.height/2, TYPE_ACTIVE, 10); 
        // TODO: add a late init method that will be called after player passes a "start game" screen
        //          else, should investigate into why the canvas.width property is not accurate upon init
    }
    for (var i = 0; i < NUM_ASTEROIDS;++i)
    {
        asteroids[i] = new Asteroid("rgba(220,220,120,1)", 0, 0, 0, TYPE_INACTIVE, 0); 
    }
}
gameInit();

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        ships[0].rightPressed = true;
    }
    else if(e.keyCode == 37) {
        ships[0].leftPressed = true;
    }
    else if(e.keyCode == 38) {
        ships[0].upPressed = true;
    }
    else if(e.keyCode == 40) {
        ships[0].downPressed = true;
    }
    else if(e.keyCode == 65) {
        ships[1].leftPressed = true;
    }
    else if(e.keyCode == 68) {
        ships[1].rightPressed = true;
    }
    else if(e.keyCode == 83) {
        ships[1].downPressed = true;
    }
    else if(e.keyCode == 87) {
        ships[1].upPressed = true;
    }
    else if(e.keyCode == 80) { // p
        if (pause_button_lifted)
        {
            paused = !paused;
            pause_button_lifted = false;
        }
    }
    else if(e.keyCode == 32) { // space
        if (pause_button_lifted && paused)
        {
            paused = !paused;
            pause_button_lifted = false;
        }
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        ships[0].rightPressed = false;
    }
    else if(e.keyCode == 37) {
        ships[0].leftPressed = false;
    }
    else if(e.keyCode == 38) {
        ships[0].upPressed = false;
    }
    else if(e.keyCode == 40) {
        ships[0].downPressed = false;
    }
    else if(e.keyCode == 65) {
        ships[1].leftPressed = false;
    }
    else if(e.keyCode == 68) {
        ships[1].rightPressed = false;
    }
    else if(e.keyCode == 83) {
        ships[1].downPressed = false;
    }
    else if(e.keyCode == 87) {
        ships[1].upPressed = false;
    }
    else if(e.keyCode == 80) { //p
        pause_button_lifted = true;
    }
}

function drawAll() {
	// update on resize	  	
  	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
  	// clear canvas
	ctx.clearRect(0,0, canvas.width, canvas.height);
    // draw ships and their spawned bullets
    var i;
    for (i = 0; i < ships.length; i++)
    {
        ships[i].draw();    
    }
    // draw scores from ships
    var ui_string = 'Player 1: ' + ships[0].points.toString() + ' Player 2: ' + ships[1].points.toString();
    ctx.font = '14px sans-serif';
    ctx.textBaseline = 'hanging';
    var text_measurement = ctx.measureText(ui_string);
    ctx.strokeText(ui_string, canvas.width - text_measurement.width - UI_PADDING, UI_PADDING);
    // draw BlackHole
    if (BLACK_HOLE_ENABLED === true)
    {
        blackHole.draw();
    }
    for (i=0; i< asteroids.length; i++)
    {
        asteroids[i].draw();
    }
} 

function detectCollisions() {
    var i, j, k;
    for (i = 0; i < ships.length; i++)
    {
        for (j = i + 1; j < ships.length; j++)
        {
            ships[i].detectCollision(ships[j]);
            // TODO: decouple the loss of points from destruction of the ship (being shot should not result in the player losing points)
            // ships[j].detectCollision(ships[i]);
        }   
        for (j = 0; j < asteroids.length; j++) {
            ships[i].detectCollision(asteroids[j]);
        }
        ships[i].detectCollision(blackHole);
    }
}

function calcDeltas() {
    var i;
    for (i = 0; i < ships.length; i++)
    {
        ships[i].calcDelta();    
    }
    if (BLACK_HOLE_ENABLED === true)
    {
        blackHole.calcDelta();
        //gravitate
        ships[0].gravitate(blackHole);
        ships[1].gravitate(blackHole);
        // TODO: gravitation for bullets
    }
    for (i = 0; i < asteroids.length; ++i)
    {
        asteroids[i].calcDelta();
    }
}

function pauseHandler() {
    drawAll();
    // draw overlay base layer
    ctx.beginPath();
    ctx.rect(UI_PADDING, UI_PADDING, canvas.width - UI_PADDING * 2, canvas.height - UI_PADDING * 2);
    ctx.fillStyle = pause_overlay_colour;
    ctx.fill();
    // draw paused screen
    var ui_string = 'PAUSED';
    ctx.font = '140px sans-serif';
    ctx.textBaseline = 'hanging';
    var text_measurement = ctx.measureText(ui_string);
    ctx.strokeText(ui_string, canvas.width/2 - text_measurement.width/2, canvas.height/2 - 140/2);
}

function victoryHandler() {
    drawAll();
    // draw overlay base layer
    ctx.beginPath();
    ctx.rect(UI_PADDING, UI_PADDING, canvas.width - UI_PADDING * 2, canvas.height - UI_PADDING * 2);
    ctx.fillStyle = pause_overlay_colour;
    ctx.fill();
    // draw overlay text
    var ui_string = 'VICTORY';
    ctx.font = '140px sans-serif';
    ctx.textBaseline = 'hanging';
    var text_measurement = ctx.measureText(ui_string);
    ctx.strokeText(ui_string, canvas.width/2 - text_measurement.width/2, canvas.height/2 - 140/2);
}

function generateRandoms() {
    var randEvent = Math.random();
    var asteroid_prob = 0.02;
    // generate asteroids
    if (randEvent < asteroid_prob)
    {
        for (var i = 0; i < asteroids.length; ++i)
        {
            if (asteroids[i].active == TYPE_INACTIVE)
            {
                var newX = 0;
                var newY = 0;
                if (randEvent < asteroid_prob/2)
                {
                    newX = Math.random()*canvas.width;
                }
                else 
                {
                    newY = Math.random()*canvas.height;
                }
                asteroids[i].respawn(newX, newY); 
                break;
            }
        }
    }
}

function update() {
    drawAll();
    if (ships[0].points >= WINNING_POINTS || ships[1].points >= WINNING_POINTS)
    {
        victoryHandler();
    }
    else if (paused)
    {
        pauseHandler();
    }
    else 
    {
        calcDeltas();
        detectCollisions();
        generateRandoms();
    }
} setInterval(update, 33);