// event listeners and flags
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//TODO: stick these into an array
var ship1 = new Ship(1, 'rgba(220,60,60,0.5)', 0);
var ship2 = new Ship(2, 'rgba(60,60,220,0.5)', 0);

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
    else if(e.keyCode == 40) {
        ship1.downPressed = true;
    }
    else if(e.keyCode == 65) {
        ship2.leftPressed = true;
    }
    else if(e.keyCode == 68) {
        ship2.rightPressed = true;
    }
    else if(e.keyCode == 83) {
        ship2.downPressed = true;
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
    else if(e.keyCode == 40) {
        ship1.downPressed = false;
    }
    else if(e.keyCode == 65) {
        ship2.leftPressed = false;
    }
    else if(e.keyCode == 68) {
        ship2.rightPressed = false;
    }
    else if(e.keyCode == 83) {
        ship2.downPressed = false;
    }
    else if(e.keyCode == 87) {
        ship2.upPressed = false;
    }
}

function drawAll() {
	// update on resize	  	
  	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
  	// clear canvas
	ctx.clearRect(0,0, canvas.width, canvas.height);
	ship1.draw();
	ship2.draw();
} 

function update() {
	ship1.calcDelta();
	ship2.calcDelta();
	// TODO: build more robust algos to look through all items
	if (ship1.detectCollision(ship2))
	{
		ship1.randomizePosition();
		ship2.randomizePosition();
	}
	// TODO: change collision to be based on bullet collision handlers
	if (ship1.bulletContainer[0] && ship1.bulletContainer[0].active === true)
	{
		if (ship2.detectCollision(ship1.bulletContainer[0]))
		{
			document.getElementById("p1_hud").innerHTML = "Player 1 wins!";
			ship2.randomizePosition();
			ship1.bulletContainer[0].active = false;
		}
	}
	if (ship2.bulletContainer[0] && ship2.bulletContainer[0].active === true)
	{
		if (ship1.detectCollision(ship2.bulletContainer[0]))
		{
			document.getElementById("p2_hud").innerHTML = "Player 2 wins!";
			ship1.randomizePosition();
			ship2.bulletContainer[0].active = false;
		}	
	}
	drawAll();
} setInterval(update, 33);