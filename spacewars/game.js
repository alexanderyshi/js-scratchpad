// UI constants
var UI_PADDING = 10;

// pause variables
var paused = false;
var pause_button_lifted = true;
var pause_overlay_colour = "rgba(200,200,200,0.3)";

// game variables
var BLACK_HOLE_ENABLED = true;
var WINNING_POINTS = 5;

// event listeners and flags
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// game entities
var ships = []
ships[0] = new Ship(0, 'rgba(220,60,60,0.5)', 0);
ships[1] = new Ship(1, 'rgba(60,60,220,0.5)', 0);
ships[0].randomizePosition();
ships[1].randomizePosition();
if (BLACK_HOLE_ENABLED === true)
{
   var blackHole = new BlackHole(2, "rgba(220,220,220,1)", 0, canvas.width/2, canvas.height/2, true); 
}

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
} 

function detectCollisions() 
{
    var i, j, k;
    for (i = 0; i < ships.length - 1; i++)
    {
        for (j = i + 1; j < ships.length; j++)
        {
            // bullet collisions
            for (k = 0; k < BULLETS_PER_SHIP; k++)
            {
                // TODO: this is begging for a helper?
                // first ship hits first
                if (ships[i].bulletContainer[k].active === true)
                {
                    if (ships[j].detectCollision(ships[i].bulletContainer[k]))
                    {
                        // document.getElementById("hud").innerHTML = "Player " + (j+1).toString() + " loses!";
                        ships[j].randomizePosition();
                        ships[i].bulletContainer[k].active = false;
                        ships[i].points++;
                    }
                }

                // second ship hits first
                if (ships[j].bulletContainer[k].active === true)
                {
                    if (ships[i].detectCollision(ships[j].bulletContainer[k]))
                    {
                        ships[i].randomizePosition();
                        ships[j].bulletContainer[k].active = false;
                        ships[j].points++;
                    }
                }
            }
            // ship to ship
            if (ships[i].detectCollision(ships[j]))
            {
                ships[i].randomizePosition();
                ships[j].randomizePosition();
                ships[i].points--;
                ships[j].points--;
            }
        }
    }
    // blackhole
    if (ships[0].detectCollision(blackHole))
    {
        ships[0].randomizePosition();
    }
    if (ships[1].detectCollision(blackHole))
    {
        ships[1].randomizePosition();
    }
}

function calcDeltas()
{
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
}

function pauseHandler()
{
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

function victoryHandler()
{
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

function update() {
    drawAll();
    // TODO: move check to detectCollisions to prevent wasteful checks
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
        calcBearing(ships[0],blackHole);
    }
} setInterval(update, 33);