var canvas = document.getElementById("mCanvas");
var ctx = canvas.getContext("2d");

// common lib funcs
function degToRad(angle) {
	return angle/180*Math.PI;
}

function calcDistance(obj1, obj2) {
	return Math.sqrt(Math.pow(obj1.pos_x - obj2.pos_x,2) 	
		+ Math.pow(obj1.pos_y - obj2.pos_y,2));
}

function calcBearing(obj1, obj2) {
	var bearing = Math.atan((obj2.pos_y-obj1.pos_y)/(obj2.pos_x-obj1.pos_x));
	if (bearing > 0)
	{
		if (obj2.pos_x < obj1.pos_x)
		{
			bearing += Math.PI;
		}
	}
	else
	{
		if (obj2.pos_x < obj1.pos_x)
		{
			bearing += Math.PI;
		}

	}
	return bearing;
}
	// var imgdata = [255,255,255,255];
	// ctx.putImageData(imgdata,this.pos_x,this.pos_y);