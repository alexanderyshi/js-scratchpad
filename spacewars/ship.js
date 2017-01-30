var SHIP_RADIUS = 20;

function Ship(id, colour, style) {
	baseType.call(this);
	this.id = id;
	this.colour = colour;
	this.style = style;

	this.points = 0;

	this.ACCEL_RATE = 5;
	this.radius = SHIP_RADIUS;
	this.CANNON_LENGTH = 30;

	this.rightPressed = false;
	this.upPressed = false;
	this.leftPressed = false;
	this.downPressed = false;

	// TODO: preassign a number of bullets and search for a non-active one in the shoot() function
	this.bulletContainer = {};
	this.cannon_ready = true;
	this.shoot = function()
	{
		console.log('pew', this.cannon_ready);
		if (this.cannon_ready === true)
		{
			this.cannon_ready = false;
			this.bulletContainer[0] = new Bullet(this.id, this.colour, this.style, this.pos_x, this.pos_y, this.bearing);
			// ! adding paranthesis causes the return value to be scheduled instead of the function call (resulting in immediate call), therefore use anon func
			
			// setTimeout(function() {readyCannon(this)}, 3000);
			
			// setTimeout(readyCannon(this), 3000);

			setTimeout(
				function() 
					{	
						this.cannon_ready = true;		
						console.log('GUN READY', this.cnt);
						this.cnt++;
					}, 2000);
		}

	};
}

// function readyCannon(ship)
// {
// 	ship.cannon_ready = true;
// 		console.log('GUN READY', ship.cnt);
// 		ship.cnt++;
// }

Ship.prototype = Object.create(baseType.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.draw = function() {
	baseType.prototype.draw.call();
	if (this.bulletContainer[0])
	{
		this.bulletContainer[0].draw();
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
	if  (this.bulletContainer[0])
	{
		this.bulletContainer[0].calcDelta();
	}
}

Ship.prototype.detectCollision = function(obj) {
	return baseType.prototype.detectCollision.call(this, obj);
}