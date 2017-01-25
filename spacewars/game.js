// event listeners and flags
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

   var ship1 = new Ship(1, 'rgba(220,60,60,0.5', 0);
   var ship2 = new Ship(2, 'rgba(60,60,220,0.5', 0);

function keyDownHandler(e) {
    if(e.keyCode == 39) {
        ship1.rightPressed = true;
    }
    else if(e.keyCode == 37) {
        ship1.leftPressed = true;
    }
    else if(e.keyCode == 38) {
        ship1.upPressed = true;
    }
    else if(e.keyCode == 65) {
        ship2.leftPressed = true;
    }
    else if(e.keyCode == 68) {
        ship2.rightPressed = true;
    }
    else if(e.keyCode == 87) {
        ship2.upPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 39) {
        ship1.rightPressed = false;
    }
    else if(e.keyCode == 37) {
        ship1.leftPressed = false;
    }
    else if(e.keyCode == 38) {
        ship1.upPressed = false;
    }
    else if(e.keyCode == 65) {
        ship2.leftPressed = false;
    }
    else if(e.keyCode == 68) {
        ship2.rightPressed = false;
    }
    else if(e.keyCode == 87) {
        ship2.upPressed = false;
    }
}

function draw() {
	// update on resize	  	
  	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
  	// clear canvas
	ctx.clearRect(0,0, canvas.width, canvas.height);
	drawShip(ship1);
	drawShip(ship2);
} 

function detectAsteroidCollisions()
{
	
}

function update() {
	calculateShipDelta(ship1);
	calculateShipDelta(ship2);
	if (detectShipCollision(ship1,ship2))
	{
		randomizePosition(ship1);
		randomizePosition(ship2);
	}
	detectAsteroidCollisions();
	draw();
} setInterval(update, 33);