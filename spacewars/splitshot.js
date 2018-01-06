var SPLITSHOT_CANNON_LENGTH = 12;
var SPLITSHOT_BULLETS_PER_SHIP = 10;
var SPLITSHOT_SHOOT_COOLDOWN = 450; // ms
var SPLITSHOT_CANNON_COLOUR = "rgba(200,200,180,1)";
var SPLITSHOT_BULLET_SPEED = 5;
var SPLITSHOT_BULLET_RADIUS = 6;

function Splitshot(id, colour, style) {
	baseType.call(this);

	this.id = id;
	this.colour = colour;
	this.style = style;

	this.cannonLength = SPLITSHOT_CANNON_LENGTH;
	this.maxBulletCount = SPLITSHOT_BULLETS_PER_SHIP;
	this.shotCooldown = SPLITSHOT_SHOOT_COOLDOWN;

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
			for (i = 0; i < this.maxBulletCount; i+=2) { 
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
				this.bulletContainer[bulletNum] = new Bullet(this.colour, this.style, pos_x, pos_y, bearing+5, TYPE_ACTIVE, this.id);
				this.bulletContainer[bulletNum + 1] = new Bullet(this.colour, this.style, pos_x, pos_y, bearing-5, TYPE_ACTIVE, this.id);
				this.bulletContainer[bulletNum].assignSpeed(SPLITSHOT_BULLET_SPEED);
				this.bulletContainer[bulletNum + 1].assignSpeed(SPLITSHOT_BULLET_SPEED);
				this.bulletContainer[bulletNum].assignRadius(SPLITSHOT_BULLET_RADIUS);
				this.bulletContainer[bulletNum + 1].assignRadius(SPLITSHOT_BULLET_RADIUS);
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

Splitshot.prototype = Object.create(Cannon.prototype);
Splitshot.prototype.constructor = Splitshot;