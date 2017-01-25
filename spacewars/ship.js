function Ship(id, colour, style) {
	this.id = id;
	this.colour = colour;
	this.style = style;

	this.bearing = 0;
	this.pos_x = 0;
	this.pos_y = 0;
	this.vel_x = 0;
	this.vel_y = 0;
	this.ACCEL_RATE = 5;
	this.SHIP_RADIUS = 10;

	this.rightPressed = false;
	this.upPressed = false;
	this.leftPressed = false;
}

function drawShip(ship) {
	// draw ship
	ctx.beginPath();
	ctx.moveTo(ship.pos_x,ship.pos_y);
	ctx.lineTo(ship.pos_x + 30*Math.cos(degToRad(ship.bearing)), ship.pos_y + 30*Math.sin(degToRad(ship.bearing)));
	ctx.strokeStyle = "rgba(220,220,220,1)";
	ctx.stroke();
	ctx.fillStyle = ship.colour;
	ctx.arc(ship.pos_x, ship.pos_y, 15, 0, Math.PI*2, false);
	ctx.fill();
	ctx.closePath();
}

function calculateShipDelta(ship) {
  	// TODO: check and reset flags eventually with preset increments?
	if (ship.rightPressed) {
		ship.bearing += 5;
	}
	if (ship.leftPressed) {
		ship.bearing -= 5;
	}
	if (ship.upPressed) {
		ship.vel_y += ship.ACCEL_RATE*Math.sin(degToRad(ship.bearing));
		ship.vel_x += ship.ACCEL_RATE*Math.cos(degToRad(ship.bearing));
	}
		ship.vel_x *= Math.log10(8.5);
		ship.vel_x = (Math.abs(ship.vel_x) > 0.5) ? ship.vel_x : 0;
		ship.vel_y *= Math.log10(8.5);
		ship.vel_y = (Math.abs(ship.vel_y) > 0.5) ? ship.vel_y : 0;

	ship.pos_x += ship.vel_x;
	if (ship.pos_x < 0) {
		ship.pos_x += ctx.canvas.width;
	}
	if (ship.pos_x > ctx.canvas.width) {
		ship.pos_x -= ctx.canvas.width;
	}
	ship.pos_y += ship.vel_y;
	if (ship.pos_y < 0) {
		ship.pos_y += ctx.canvas.height;
	}
	if (ship.pos_y > ctx.canvas.height) {
		ship.pos_y -= ctx.canvas.height;
	}
}

function detectShipCollision(ship1,ship2) {
	return Math.sqrt(Math.pow(2,ship1.pos_x-ship2.pos_x) + Math.pow(ship1.pos_y-ship2.pos_y,2)) < ship1.SHIP_RADIUS + ship2.SHIP_RADIUS ? 1 : 0;
}

function randomizePosition(ship) {
	ship.pos_x = ctx.canvas.width * Math.random();
	ship.pos_y = ctx.canvas.height * Math.random();
}