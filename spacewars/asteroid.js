var ASTEROID_RADIUS = 10;
var ASTEROID_MAX_SPEED

function Asteroid(colour, style, pos_x, pos_y, active, value) {
	baseType.call(this);
	this.id = this.getEntityId();
	// console.log("ast" + this.id);
	this.colour = colour;
	this.style = style;

	this.persistOnEdge = false;
	this.active = active;
	this.pos_x = pos_x;
	this.pos_y = pos_y;
	this.radius = ASTEROID_RADIUS;
	this.bearing = 315;
	this.vel_x = 1;
	this.vel_y = 1;
	this.DAMPING_FACTOR = 1;
	this.value = value;
}

Asteroid.prototype = Object.create(baseType.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.draw = function() {
	if (this.active === TYPE_INACTIVE)
	{
		return;
	}	
	// draw Asteroid
	ctx.beginPath();
	ctx.strokeStyle = this.colour;
	ctx.moveTo(this.pos_x - ASTEROID_RADIUS,this.pos_y);
	ctx.lineTo(this.pos_x + ASTEROID_RADIUS,this.pos_y);
	ctx.moveTo(this.pos_x,this.pos_y - ASTEROID_RADIUS);
	ctx.lineTo(this.pos_x,this.pos_y + ASTEROID_RADIUS);
	ctx.stroke();
	ctx.closePath();
}

Asteroid.prototype.calcDelta = function() {
	if (this.active === TYPE_INACTIVE)
	{
		return;
	}
	return baseType.prototype.calcDelta.call(this);
}

Asteroid.prototype.detectCollision = function(obj) {
	if (this.active === TYPE_INACTIVE)
	{
		return;
	}
	var collision = baseType.prototype.detectCollision.call(this, obj);
	if (collision) {
		this.onDestroyed();
		this.active = TYPE_INACTIVE;
	}
	return collision;
}

Asteroid.prototype.respawn = function(pos_x, pos_y) {
	this.pos_x = pos_x;
	this.pos_y = pos_y;
	this.active = TYPE_ACTIVE;
}
