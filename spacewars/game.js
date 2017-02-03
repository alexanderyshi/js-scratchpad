// event listeners and flags
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//TODO: stick these into an array
var ships = []
ships[0] = new Ship(0, 'rgba(220,60,60,0.5)', 0);
ships[1] = new Ship(1, 'rgba(60,60,220,0.5)', 0);

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
}

function drawAll() {
	// update on resize	  	
  	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
  	// clear canvas
	ctx.clearRect(0,0, canvas.width, canvas.height);
    var i;
    for (i = 0; i < ships.length; i++)
    {
        ships[i].draw();    
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
                        document.getElementById("hud").innerHTML = "Player " + (j+1).toString() + " loses!";
                        ships[j].randomizePosition();
                        ships[i].bulletContainer[k].active = false;
                        ships[i].points++;
                        ships[j].points--;
                    }
                }

                // second ship hits first
                if (ships[j].bulletContainer[k].active === true)
                {
                    if (ships[i].detectCollision(ships[j].bulletContainer[k]))
                    {
                        document.getElementById("hud").innerHTML = "Player " + (i+1).toString() + " loses!";
                        ships[i].randomizePosition();
                        ships[j].bulletContainer[k].active = false;
                        ships[j].points++;
                        ships[i].points--;
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

    // if (ships[0].detectCollision(ships[1]))
    // {
    //     ships[0].randomizePosition();
    //     ships[1].randomizePosition();
    // }
    // // TODO: change collision to be based on bullet collision handlers
    // if (ships[0].bulletContainer[0] && ships[0].bulletContainer[0].active === true)
    // {
    //     if (ships[1].detectCollision(ships[0].bulletContainer[0]))
    //     {
    //         document.getElementById("p1_hud").innerHTML = "Player 1 wins!";
    //         ships[1].randomizePosition();
    //         ships[0].bulletContainer[0].active = false;
    //     }
    // }
    // if (ships[1].bulletContainer[0] && ships[1].bulletContainer[0].active === true)
    // {
    //     if (ships[0].detectCollision(ships[1].bulletContainer[0]))
    //     {
    //         document.getElementById("p2_hud").innerHTML = "Player 2 wins!";
    //         ships[0].randomizePosition();
    //         ships[1].bulletContainer[0].active = false;
    //     }   
    // }
}

function calcDeltas()
{
    var i;
    for (i = 0; i < ships.length; i++)
    {
        ships[i].calcDelta();    
    }
}

function update() {
    calcDeltas();
    detectCollisions();
	drawAll();
} setInterval(update, 33);