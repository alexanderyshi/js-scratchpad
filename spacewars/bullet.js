var BULLET_RADIUS = 4;
var BULLET_SPEED = 7;

function Bullet(id, colour, style, pos_x, pos_y, bearing, active) {
	baseType.call(this);
	// bullets get the same id as the shooter to verify ownership
	this.id = id;
	this.colour = colour;
	this.style = style;

	this.persistOnEdge = false;
	this.active = active;
	this.bearing = bearing;
	this.pos_x = pos_x;
	this.pos_y = pos_y;
	this.vel_x = BULLET_SPEED * Math.cos(degToRad(this.bearing));
	this.vel_y = BULLET_SPEED * Math.sin(degToRad(this.bearing));
	this.DAMPING_FACTOR = 1;

	// this is not mathematically correct but w/e
	this.radius = BULLET_RADIUS;
	this.SIDE_LENGTH = this.radius*2;
}

Bullet.prototype = Object.create(baseType.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.draw = function() {
	if (this.active === false)
	{
		return;
	}	
	// draw Bullet
	ctx.beginPath();
	ctx.rect(this.pos_x-this.radius, this.pos_y-this.radius, this.SIDE_LENGTH, this.SIDE_LENGTH);
	ctx.fillStyle = this.colour;
	ctx.fill();
	ctx.closePath();
}

Bullet.prototype.calcDelta = function() {
	if (this.active === false)
	{
		return;
	}
	return baseType.prototype.calcDelta.call(this);
}

Bullet.prototype.detectCollision = function(obj) {
	if (this.active === false)
	{
		return;
	}
	return baseType.prototype.detectCollision.call(obj);
}