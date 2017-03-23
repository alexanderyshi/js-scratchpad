var canvas = document.getElementById("mCanvas");
var ctx = canvas.getContext("2d");
var player={};
player.x=canvas.width/2;
player.y=canvas.height/2;  
player.lives=3;
player.score=0;
var PLAYER_RADIUS = 5;
var PLAYER_SPEED =10;
var ICE_CREAM_RADIUS=5; 
var BOTTOM_PADDING=10;
var downPressed;
var leftPressed;
var rightPressed;
var upPressed;
var ICE_CREAM_CONTAINER = [];
var BASESPEED = 1;
var exploded =false;
var UI_PADDING =10;
function draw()
{
        drawPlayer();
        DrawIceCream();  
        drawLives();
        drawScore(); 

}

function drawPlayer()
{
        ctx.clearRect(0,0, canvas.width,canvas.height);
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI*2, false);
        // ctx.fillStyle = "rgba(200,123,1,1)";
        ctx.fillStyle = "#416647";
        ctx.fill();
        ctx.closePath();
}

function update()
{
		console.log (ICE_CREAM_CONTAINER.length); 
        if (player.lives>0)
        {
	        handlePlayerInput();
	        scoop(); //this method moves the icecream 
	        if(collision())
	        {
	        	player.lives--;
	        	clearIC();
	        }
	        draw();
	        if (Math.random()*100 < 5+player.score/20)
	        {
	        	AddIceCream();
	        }

        }

        else
        {
        ctx.beginPath();
        ctx.rect(UI_PADDING, UI_PADDING, canvas.width - UI_PADDING * 2, canvas.height - UI_PADDING * 2);
        ctx.fillStyle = "rgba(200,200,200,0.3)";
        ctx.fill();
        // draw overlay text
        var ui_string = 'You have been scooped';
        ctx.font = '20px sans-serif';
        ctx.textBaseline = 'middle';
        var text_measurement = ctx.measureText(ui_string);
        ctx.strokeText(ui_string, canvas.width/2 - text_measurement.width/2, canvas.height/2);
        ctx.closePath();
        }

}
setInterval(update,33); 
document.addEventListener("keydown", keyDownHandler, false);

function keyDownHandler(e) {
            if(e.keyCode == 39) {
                rightPressed = true;
            }
            else if(e.keyCode == 37) {
                leftPressed= true;
            }
            else if(e.keyCode == 38) {
                upPressed=true; 
            }
            else if(e.keyCode == 40) {
                downPressed=true;
            }
    }
document.addEventListener("keyup", keyUpHandler, false);
    function keyUpHandler(e) {
            if(e.keyCode == 39) {
                rightPressed = false;
            }
            else if(e.keyCode == 37) {
                leftPressed= false;
            }
            else if(e.keyCode == 38) {
                upPressed=false; 
            }
            else if(e.keyCode == 40) {
                downPressed=false;
            }
    }

function handlePlayerInput(){
        if (leftPressed)
        {
                player.x-=PLAYER_SPEED;
                if(player.x<PLAYER_RADIUS)
                {
                        player.x=PLAYER_RADIUS;
                }
        }
        if(rightPressed)
        {
                player.x+= PLAYER_SPEED;
                if(player.x>canvas.width-PLAYER_RADIUS)
                {
                        player.x=canvas.width-PLAYER_RADIUS;
                }
        }
         if(upPressed)
        {
                player.y-=PLAYER_SPEED;
                if(player.y<PLAYER_RADIUS)
                {
                        player.y=PLAYER_RADIUS;
                }
        }
         if(downPressed)
        {
                player.y+= PLAYER_SPEED;
                if(player.y>canvas.height-PLAYER_RADIUS-ICE_CREAM_RADIUS-BOTTOM_PADDING)
                {
                        player.y=canvas.height-PLAYER_RADIUS-ICE_CREAM_RADIUS-BOTTOM_PADDING;

                }
        }
        
}

function AddIceCream()
{
        var iceCream={};
        iceCream.x = Math.random()*canvas.width;
        iceCream.y= canvas.height-ICE_CREAM_RADIUS;
        //console.log(iceCream.x, iceCream.y);
        ICE_CREAM_CONTAINER.push(iceCream);
}

//setInterval(AddIceCream,500);

function DrawIceCream()
{
        for(var i=0; i<ICE_CREAM_CONTAINER.length; i++)
        {
                ctx.beginPath();
                ctx.arc(ICE_CREAM_CONTAINER[i].x, ICE_CREAM_CONTAINER[i].y, ICE_CREAM_RADIUS, 0, Math.PI*2, false);
                ctx.fillStyle = "#0300a1";
                ctx.fill();
                ctx.closePath();
        }
}

function scoop()
{

        for(var i=0; i<ICE_CREAM_CONTAINER.length; i++)
        {
            (ICE_CREAM_CONTAINER[i].y)-=BASESPEED+player.score/100; 
            if (ICE_CREAM_CONTAINER[i].y<0)
            {
            	ICE_CREAM_CONTAINER.splice(i,1);
            	player.score=player.score+10;
            }



        }
}

function collision()
{
    //distance between two center is less than r-icecream+r-me
    for(var i=0; i<ICE_CREAM_CONTAINER.length; i++)

    {
        var twoR=ICE_CREAM_RADIUS+PLAYER_RADIUS;
        var distance=Math.sqrt( Math.pow(player.x-ICE_CREAM_CONTAINER[i].x, 2)+Math.pow(player.y-ICE_CREAM_CONTAINER[i].y,2) );
        //console.log(twoR, distance);
        if(twoR>distance) 
        {
            return true;
        }
    }
    return false; 
}

function clearIC()
{
	ICE_CREAM_CONTAINER=[];

}

function drawLives()
{
    ctx.beginPath();
    for(var i=0; i<player.lives;i++)
    {

    ctx.arc(canvas.width - UI_PADDING - (UI_PADDING+PLAYER_RADIUS)*i, UI_PADDING, PLAYER_RADIUS, 0, Math.PI*2, false);
    ctx.fillStyle = "rgba(60,120,60,0.3)"; 
    //ctx.fillStyle = "#41664700";
    ctx.fill(); // filled multiple times
	}
    ctx.closePath();
}

function drawScore()
	  {
        ctx.beginPath();
        var ui_string = player.score;
        ctx.font = '12px sans-serif';
        ctx.textBaseline = 'middle';
        var text_measurement = ctx.measureText(ui_string);
        ctx.strokeText(ui_string, canvas.width-UI_PADDING - text_measurement.width/2, canvas.height-UI_PADDING);
        ctx.closePath();
        }
