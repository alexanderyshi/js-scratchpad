var SHIP_RADIUS = 10;
var SHIP_ACCEL_RATE = 2;
var ROTATION_TICK = 8;

function Ship(colour, style, value) {
	baseType.call(this);
	this.id = this.getEntityId();
	// console.log("ship" + this.id);
	this.colour = colour;
	this.style = style;

	this.points = 0;
	this.value = value;

	this.ACCEL_RATE = SHIP_ACCEL_RATE;
	this.radius = SHIP_RADIUS;
	this.cannon = new Cannon(this.id, this.colour, this.style);

	this.rightPressed = false;
	this.upPressed = false;
	this.leftPressed = false;
	this.downPressed = false;
}

Ship.prototype = Object.create(baseType.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.draw = function() {
	baseType.prototype.draw.call();

	// draw ship
	ctx.beginPath();
	ctx.fillStyle = this.colour;
	ctx.arc(this.pos_x, this.pos_y, this.radius, 0, Math.PI*2, false);
	ctx.fill();
	ctx.closePath();

	// draw cannon and bullets
	this.cannon.draw(this.pos_x, this.pos_y, this.bearing);

	// !! AYS simulate beam by darkening rest of screen
	{
		var beamColor = "rgba(150,150,100,0.5)";
		var debugColor = "rgba(255,255,255,0.1)";

		var angle = this.bearing;
		var BEAMANGLEDEG = 30;
		// fixing the angle not be necessary for Math lib functionality
		var angleA = angle + BEAMANGLEDEG/2;
		var angleB = angle - BEAMANGLEDEG/2;

		var bearingCos = Math.cos(degToRad(angle));
		var bearingSin = Math.sin(degToRad(angle));
		var bearingTanA = Math.tan(degToRad(angleA));
		var bearingTanB = Math.tan(degToRad(angleB));
		var flashLightBase_X = this.pos_x + this.cannon.cannonLength*bearingCos;
		var flashLightBase_Y = this.pos_y + this.cannon.cannonLength*bearingSin;

		var flashLightEndA_X;
		var flashLightEndA_Y;
		var flashLightEndB_X;
		var flashLightEndB_Y;
		if (angleA < 90 && angleA > -90) {  // looking right
			flashLightEndA_X = canvas.width;
			flashLightEndA_Y = flashLightBase_Y + bearingTanA*(canvas.width - this.pos_x);
		} else { // looking left
			flashLightEndA_X = 0;
			flashLightEndA_Y = flashLightBase_Y - bearingTanA*(this.pos_x);
		}

		if (angleB < 90 && angleB > -90) {  // looking right
			flashLightEndB_X = canvas.width;
			flashLightEndB_Y = flashLightBase_Y + bearingTanB*(canvas.width - this.pos_x);
		} else { // looking left
			flashLightEndB_X = 0;
			flashLightEndB_Y = flashLightBase_Y - bearingTanB*(this.pos_x);
		}

		ctx.beginPath();
		ctx.fillStyle = debugColor;
		ctx.moveTo(flashLightBase_X, flashLightBase_Y);
		ctx.lineTo(flashLightEndA_X, flashLightEndA_Y);
	    ctx.lineTo(flashLightEndB_X, flashLightEndB_Y);
	    ctx.fill();
		
		// ctx.strokeStyle = debugColor;
		// ctx.stroke();
		ctx.closePath();
	}
	// debug front arcs
	// {
	// 	ctx.beginPath();
	// 	ctx.fillStyle = beamColor;
	// 	ctx.arc(this.pos_x, this.pos_y, 100, degToRad(this.bearing-30), degToRad(this.bearing+30), false);
	// 	ctx.fill();
	// 	ctx.closePath();
	// }
}

// ! this will eventually be part of the overloaded ship method only
function handleUserInput(ship){
 	// TODO: check and reset flags eventually with preset increments?
	if (ship.rightPressed) {
		ship.bearing += ROTATION_TICK;
		if (ship.bearing > 180) {
			ship.bearing -= 360;
		}
	}
	if (ship.leftPressed) {
		ship.bearing -= ROTATION_TICK;
		if (ship.bearing < -180) {
			ship.bearing += 360;
		}
	}
	if (ship.upPressed) {
		ship.vel_y += ship.ACCEL_RATE*Math.sin(degToRad(ship.bearing));
		ship.vel_x += ship.ACCEL_RATE*Math.cos(degToRad(ship.bearing));
	}
	if(ship.downPressed) {
		ship.cannon.shoot(ship.pos_x, ship.pos_y, ship.bearing);
	}
}

Ship.prototype.calcDelta = function() {
	baseType.prototype.calcDelta.call(this);
	handleUserInput(this);
	this.cannon.calcDelta();
}

Ship.prototype.detectCollision = function(obj) {
	if (!obj) console.log(obj);
	this.cannon.detectCollision(obj);
	
	var shipDestroyed = baseType.prototype.detectCollision.call(this, obj);
	if (shipDestroyed)
	{
		this.onDestroyed();
		obj.onDestroyed();
	}
	return shipDestroyed;
}