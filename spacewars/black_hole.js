// ! ORIGINAL SPACEWARS BLACKHOLE https://www.youtube.com/watch?v=UP2OaKHaDxM
var BLACK_HOLE_RADIUS = 3;
var BLACK_HOLE_STRENGTH = 3000;

function BlackHole(id, colour, style, pos_x, pos_y, active) {
	baseType.call(this);
	// BlackHoles get the same id as the shooter to verify ownership
	this.id = id;
	this.colour = colour;
	this.style = style;

	this.persistOnEdge = false;
	this.active = active;
	this.pos_x = pos_x;
	this.pos_y = pos_y;
	this.radius = BLACK_HOLE_RADIUS;
	this.gravitation_constant = BLACK_HOLE_STRENGTH;
}

BlackHole.prototype = Object.create(baseType.prototype);
BlackHole.prototype.constructor = BlackHole;

BlackHole.prototype.draw = function() {
	if (this.active === false)
	{
		return;
	}	
	// draw BlackHole
	ctx.beginPath();
	ctx.strokeStyle = this.colour;
	ctx.moveTo(this.pos_x - BLACK_HOLE_RADIUS,this.pos_y);
	ctx.lineTo(this.pos_x + BLACK_HOLE_RADIUS,this.pos_y);
	ctx.moveTo(this.pos_x,this.pos_y - BLACK_HOLE_RADIUS);
	ctx.lineTo(this.pos_x,this.pos_y + BLACK_HOLE_RADIUS);
	ctx.stroke();
	ctx.closePath();
}

BlackHole.prototype.calcDelta = function() {
	if (this.active === false)
	{
		return;
	}
	this.pos_x = canvas.width/2;
	this.pos_y = canvas.height/2;
	return;
}

BlackHole.prototype.detectCollision = function(obj) {
	if (this.active === false)
	{
		return;
	}
	return baseType.prototype.detectCollision.call(obj);
}