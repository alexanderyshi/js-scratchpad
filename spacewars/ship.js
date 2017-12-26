var SHIP_RADIUS = 10;
var SHOOT_COOLDOWN = 250; // ms
var BULLETS_PER_SHIP = 15;
var SHIP_CANNON_LENGTH = 10;
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
	this.CANNON_LENGTH = SHIP_CANNON_LENGTH;

	this.rightPressed = false;
	this.upPressed = false;
	this.leftPressed = false;
	this.downPressed = false;

	// TODO: preassign a number of bullets and search for a non-active one in the shoot() function
	// TODO: turn the following into a "gun" type object/var? - can then be applied to other types of ships, enemies
	this.bulletContainer = [];
	// TODO: make a set of functions for preset Bullet configs?
	for (i = 0; i < BULLETS_PER_SHIP; i++) 
	{ 
		this.bulletContainer[i] = new Bullet(this.colour, this.style, this.pos_x, this.pos_y, this.bearing, TYPE_INACTIVE, this.id);
	}
	var cannon_ready = true;
	this.shoot = function()
	{
		if (cannon_ready === true)
		{
			var bulletNum = -1;
			for (i = 0; i < BULLETS_PER_SHIP; i++) { 
				if (this.bulletContainer[i].active === TYPE_INACTIVE)
				{
					bulletNum = i;
					break;
				}
			}
			if (bulletNum === -1) {/* no bullets */}
			else
			{
				cannon_ready = false;
				this.bulletContainer[bulletNum] = new Bullet(this.colour, this.style, this.pos_x, this.pos_y, this.bearing, TYPE_ACTIVE, this.id);
				// ! adding paranthesis causes the return value to be scheduled instead of the function call (resulting in immediate call), therefore use anon func
				setTimeout(
					function() 
						{	
							cannon_ready = true;		
							this.cnt++;
						}, SHOOT_COOLDOWN);
			}
		}

	};
}

Ship.prototype = Object.create(baseType.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.draw = function() {
	baseType.prototype.draw.call();
	var i;
	for (i = 0; i < BULLETS_PER_SHIP; i++) { 
		this.bulletContainer[i].draw();
	}

	// draw ship
	ctx.beginPath();
	ctx.moveTo(this.pos_x,this.pos_y);
	ctx.lineTo(this.pos_x + this.CANNON_LENGTH*Math.cos(degToRad(this.bearing)), this.pos_y + this.CANNON_LENGTH*Math.sin(degToRad(this.bearing)));
	ctx.strokeStyle = "rgba(220,220,220,1)";
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = this.colour;
	ctx.arc(this.pos_x, this.pos_y, this.radius, 0, Math.PI*2, false);
	ctx.fill();
	ctx.closePath();
	// !! AYS brighten beam then darken screen

	// draw illumination beams
	var beamColor = "rgba(150,150,100,0.5)";
	var debugColor = "rgba(255,255,255,0.2)";
	// debug bearing quadrants 
	{
		ctx.beginPath();
		var angle = this.bearing;
		var bearingCos = Math.cos(degToRad(angle));
		var bearingSin = Math.sin(degToRad(angle));
		var bearingTan = Math.tan(degToRad(angle));
		var flashLightBase_X = this.pos_x + this.CANNON_LENGTH*bearingCos;
		var flashLightBase_Y = this.pos_y + this.CANNON_LENGTH*bearingSin;

		var flashLightEnd_X;
		var flashLightEnd_Y;
		if (angle < 90 && angle > -90) {  // looking right
			flashLightEnd_X = canvas.width;
			flashLightEnd_Y = flashLightBase_Y + bearingTan*(canvas.width - this.pos_x);
		} else { // looking left
			flashLightEnd_X = 0;
			flashLightEnd_Y = flashLightBase_Y - bearingTan*(this.pos_x);
		}

		ctx.moveTo(flashLightBase_X, flashLightBase_Y);
		ctx.lineTo(flashLightEnd_X, flashLightEnd_Y);
		
		ctx.strokeStyle = debugColor;
		ctx.stroke();
		ctx.closePath();
	}
	// debug front arcs
	{
		ctx.beginPath();
		ctx.fillStyle = beamColor;
		ctx.arc(this.pos_x, this.pos_y, 100, degToRad(this.bearing-30), degToRad(this.bearing+30), false);
		ctx.fill();
		ctx.closePath();
	}
	//darken other regions
	{

	// ctx.beginPath();
	// ctx.fillStyle = beamColor;
	// ctx.arc(this.pos_x, this.pos_y, 1000, degToRad(this.bearing+30), degToRad(this.bearing+210), false);
	// ctx.fill();
	// ctx.closePath();

	// ctx.beginPath();
	// ctx.fillStyle = beamColor;
	// ctx.arc(this.pos_x, this.pos_y, 1000, degToRad(this.bearing+150), degToRad(this.bearing-30), false);
	// ctx.fill();
	// ctx.closePath();
	}
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
		ship.shoot();
	}
}

Ship.prototype.calcDelta = function() {
	baseType.prototype.calcDelta.call(this);
	handleUserInput(this);
	// Object.getPrototypeOf(Ship.prototype).calcDelta(this); // ! this looks it does a call on a new, seperate instance
	// call on the super
	for (i = 0; i < BULLETS_PER_SHIP; i++) { 
		this.bulletContainer[i].calcDelta();
	}
}

Ship.prototype.detectCollision = function(obj) {
	if (!obj) console.log(obj);
	for (var i = 0; i < BULLETS_PER_SHIP; i++)
	{
		if (this.bulletContainer[i].active == true)
		{
			if (obj.detectCollision(this.bulletContainer[i]))
			{
				this.bulletContainer[i].active = false;
				// !! AYS need to detect if shooting a ship, then award points
				// maybe retrieve the "value" of all destroyed objects and award it to the shooter
				this.points += obj.value;
			}
		}
	}
	var shipDestroyed = baseType.prototype.detectCollision.call(this, obj);
	if (shipDestroyed)
	{
		this.onDestroyed();
		obj.onDestroyed();
	}
	return shipDestroyed;
}