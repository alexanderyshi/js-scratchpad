var DEFAULT_BULLET_RADIUS = 4;
var DEFAULT_BULLET_SPEED = 8;

function Bullet(colour, style, pos_x, pos_y, bearing, active, id) {
	baseType.call(this);
	// bullets get the same id as the shooter to verify ownership
	this.id = id;
	// console.log("bullet" + this.id);
	this.colour = colour;
	this.style = style;

	this.persistOnEdge = false;
	this.active = active;
	this.bearing = bearing;
	this.pos_x = pos_x;
	this.pos_y = pos_y;
	this.DAMPING_FACTOR = 1;

	// this is not mathematically correct but w/e
	this.assignSpeed = function(bulletSpeed) {
		this.vel_x = bulletSpeed * Math.cos(degToRad(this.bearing));
		this.vel_y = bulletSpeed * Math.sin(degToRad(this.bearing));
	}
	this.assignRadius = function(bulletRadius) {
		this.radius = bulletRadius;
		this.sideLength = this.radius*2;
	}
	this.assignSpeed(DEFAULT_BULLET_SPEED);
	this.assignRadius(DEFAULT_BULLET_RADIUS);
}

Bullet.prototype = Object.create(baseType.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.draw = function() {
	if (this.active === TYPE_INACTIVE)
	{
		return;
	}	
	// draw Bullet
	ctx.beginPath();
	ctx.rect(this.pos_x-this.radius, this.pos_y-this.radius, this.sideLength, this.sideLength);
	ctx.fillStyle = this.colour;
	ctx.fill();
	ctx.closePath();
}

Bullet.prototype.calcDelta = function() {
	if (this.active === TYPE_INACTIVE)
	{
		return;
	}
	return baseType.prototype.calcDelta.call(this);
}

Bullet.prototype.detectCollision = function(obj) {
	if (this.active === TYPE_INACTIVE)
	{
		return;
	}
	return baseType.prototype.detectCollision.call(this, obj);
}