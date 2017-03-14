var canvas = document.getElementById("mCanvas");
var ctx = canvas.getContext("2d");
var x=canvas.width/2;
var y=canvas.height/2;  
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

}

function drawPlayer()
{
        ctx.clearRect(0,0, canvas.width,canvas.height);
        ctx.beginPath();
        ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI*2, false);
        // ctx.fillStyle = "rgba(200,123,1,1)";
        ctx.fillStyle = "#416647";
        ctx.fill();
        ctx.closePath();
}

function update()
{

        if (!exploded)
        {
        handlePlayerInput();
        scoop(); //this method moves the icecream 
        exploded = collision();
         draw();
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
                x-=PLAYER_SPEED;
                if(x<PLAYER_RADIUS)
                {
                        x=PLAYER_RADIUS;
                }
        }
        if(rightPressed)
        {
                x+= PLAYER_SPEED;
                if(x>canvas.width-PLAYER_RADIUS)
                {
                        x=canvas.width-PLAYER_RADIUS;
                }
        }
         if(upPressed)
        {
                y-=PLAYER_SPEED;
                if(y<PLAYER_RADIUS)
                {
                        y=PLAYER_RADIUS;
                }
        }
         if(downPressed)
        {
                y+= PLAYER_SPEED;
                if(y>canvas.height-PLAYER_RADIUS-ICE_CREAM_RADIUS-BOTTOM_PADDING)
                {
                        y=canvas.height-PLAYER_RADIUS-ICE_CREAM_RADIUS-BOTTOM_PADDING;

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

setInterval(AddIceCream,500);

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
            (ICE_CREAM_CONTAINER[i].y)-=BASESPEED; 
        }
}

function collision()
{
    //distance between two center is less than r-icecream+r-me
    for(var i=0; i<ICE_CREAM_CONTAINER.length; i++)

    {
        var twoR=ICE_CREAM_RADIUS+PLAYER_RADIUS;
        var distance=Math.sqrt( Math.pow(x-ICE_CREAM_CONTAINER[i].x, 2)+Math.pow(y-ICE_CREAM_CONTAINER[i].y,2) );
        console.log(twoR, distance);
        if(twoR>distance) 
        {
            return true;
        }
    }
    return false; 
}
