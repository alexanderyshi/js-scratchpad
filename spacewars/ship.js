var SHIP_RADIUS = 10;
var SHOOT_COOLDOWN = 250; // ms
var BULLETS_PER_SHIP = 5;
var SHIP_CANNON_LENGTH = 10;
var SHIP_ACCEL_RATE = 2;

function Ship(id, colour, style) {
	baseType.call(this);
	this.id = id;
	this.colour = colour;
	this.style = style;

	this.points = 0;

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
		this.bulletContainer[i] = new Bullet(this.id, this.colour, this.style, this.pos_x, this.pos_y, this.bearing, false);
	}
	var cannon_ready = true;
	this.shoot = function()
	{
		if (cannon_ready === true)
		{
			var bulletNum = -1;
			for (i = 0; i < 5; i++) { 
				if (this.bulletContainer[i].active === false)
				{
					bulletNum = i;
					break;
				}
			}
			if (bulletNum === -1) {/* no bullets */}
			else
			{
				cannon_ready = false;
				this.bulletContainer[bulletNum] = new Bullet(this.id, this.colour, this.style, this.pos_x, this.pos_y, this.bearing, true);
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
}

// ! this will eventually be part of the overloaded ship method only
function handleUserInput(ship){
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
	return baseType.prototype.detectCollision.call(this, obj);
}