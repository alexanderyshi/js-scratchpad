var DEFAULT_SHIP_CANNON_LENGTH = 12;
var DEFAULT_BULLETS_PER_SHIP = 4;
var DEFAULT_SHOOT_COOLDOWN = 450; // ms
var DEFAULT_CANNON_COLOUR = "rgba(220,220,220,1)";

function Cannon(id, colour, style) {
	baseType.call(this);

	this.id = id;
	this.colour = colour;
	this.style = style;

	this.cannonLength = DEFAULT_SHIP_CANNON_LENGTH;
	this.maxBulletCount = DEFAULT_BULLETS_PER_SHIP;
	this.shotCooldown = DEFAULT_SHOOT_COOLDOWN;

	this.bulletContainer = [];
	for (i = 0; i < this.maxBulletCount; i++) 
	{ 
		this.bulletContainer[i] = new Bullet(this.colour, this.style, this.pos_x, this.pos_y, this.bearing, TYPE_INACTIVE, this.id);
	}

	var cannon_ready = true;
	this.shoot = function(pos_x, pos_y, bearing)
	{
		if (cannon_ready === true)
		{
			var bulletNum = -1;
			for (i = 0; i < this.maxBulletCount; i++) { 
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
				this.bulletContainer[bulletNum] = new Bullet(this.colour, this.style, pos_x, pos_y, bearing, TYPE_ACTIVE, this.id);
				// console.log("shoot cannon with id:" + this.id);
				// ! adding paranthesis causes the return value to be scheduled instead of the function call (resulting in immediate call), therefore use anon func
				setTimeout(
					function() 
						{	
							cannon_ready = true;		
							this.cnt++;
						}, this.shotCooldown);
			}
		}
	}; // end def shoot()

}

Cannon.prototype = Object.create(baseType.prototype);
Cannon.prototype.constructor = Cannon;

Cannon.prototype.draw = function(pos_x, pos_y, bearing) {
	baseType.prototype.draw.call();
	var i;
	for (i = 0; i < this.maxBulletCount; i++) { 
		this.bulletContainer[i].draw();
	}

	// draw cannon
	ctx.beginPath();
	ctx.moveTo(pos_x, pos_y);
	ctx.lineTo(pos_x + this.cannonLength*Math.cos(degToRad(bearing)), 
				pos_y + this.cannonLength*Math.sin(degToRad(bearing)));
	ctx.strokeStyle = DEFAULT_CANNON_COLOUR;
	ctx.stroke();
	ctx.closePath();
}

Cannon.prototype.calcDelta = function() {
	// baseType.prototype.calcDelta.call(this);
	for (i = 0; i < this.maxBulletCount; i++) { 
		this.bulletContainer[i].calcDelta();
	}
}

Cannon.prototype.detectCollision = function(obj) {
	if (!obj) console.log(obj);
	for (var i = 0; i < this.maxBulletCount; i++)
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
}