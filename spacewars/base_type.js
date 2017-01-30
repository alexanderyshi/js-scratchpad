// AYS: This is my personal link dump for tutorials
// ! INHERITANCE BASICS: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/create
// ! INHERITING METHODS http://stackoverflow.com/questions/7785955/inherit-parent-constructor-arguments
// ! CALLING ON SUPER http://www.salsify.com/blog/engineering/super-methods-in-javascript

// TODO: are the (this.active === false) checks reasonable to implement for child class ease of use?

function baseType()
{
	this.bearing = 0;
	this.pos_x = 10.0;
	this.pos_y = 10.0;
	this.vel_x = 0;
	this.vel_y = 0;
	this.radius = 1;
	this.DAMPING_FACTOR = Math.log10(8.5);
	this.persistOnEdge = true;
	this.active = true;
}

baseType.prototype.draw = function() {
	// console.info('ERR: should not be using baseType.prototype.draw, define your own func');
	// if (this.active === false)
	// {
	// 	return;
	// }
}

baseType.prototype.calcDelta = function() {
	// if (!this.active)
	// {
	// 	return;
	// }
	this.vel_x *= this.DAMPING_FACTOR;
	this.vel_x = (Math.abs(this.vel_x) > 0.5) ? this.vel_x : 0;
	this.vel_y *= this.DAMPING_FACTOR;
	this.vel_y = (Math.abs(this.vel_y) > 0.5) ? this.vel_y : 0;

	this.pos_x += this.vel_x;
	this.pos_y += this.vel_y;

	if (this.persistOnEdge){
		if (this.pos_x < 0) {
			this.pos_x += ctx.canvas.width;
		}
		if (this.pos_x > ctx.canvas.width) {
			this.pos_x -= ctx.canvas.width;
		}
		if (this.pos_y < 0) {
			this.pos_y += ctx.canvas.height;
		}
		if (this.pos_y > ctx.canvas.height) {
			this.pos_y -= ctx.canvas.height;
		}	
	}
	else
	{
		if (this.pos_x < 0 || this.pos_x > ctx.canvas.width || this.pos_y > ctx.canvas.height || this.pos_y < 0) 
		{
			this.active = false;
			console.log('an object went inactive')
		}
	}
}

// passed someother baseType inherited class to collide with
// perform special actions i.e. points allotment in child class handlers
baseType.prototype.detectCollision = function(obj) {
	// if (!this.active)
	// {
	// 	return;
	// }
	return Math.sqrt(Math.pow(this.pos_x - obj.pos_x,2) 	
		+ Math.pow(this.pos_y - obj.pos_y,2)) < this.radius + obj.radius ? 1 : 0;
}

baseType.prototype.randomizePosition = function() {
	// if (!this.active)
	// {
	// 	return;
	// }
	this.pos_x = ctx.canvas.width * Math.random();
	this.pos_y = ctx.canvas.height * Math.random();
}
