var Shake = require('shake.js');
var myShakeEvent = new Shake({
    threshold: 15, // optional shake strength threshold
    timeout: 1000 // optional, determines the frequency of event generation
});

var startText;
var count = 100;
var lifeTime = 5;
var lifeTimeMult = 10;
var speed = 1;
var speedMult = 10;
var size = 10;
var sizeMult = 10;
var x_fire = 0;
var y_fire = 0;
var rotation = 0;

function initalizer(a, b) {
    return a+b*Math.random();
}

function createFire() {
    startText.style.visibility = "hidden";
    myShakeEvent.start();
    fires = [];
    for(var a = 0; a < count; a++){
        fires.push({"x":initalizer(x_fire +(count/2),(-count)), "y":y_fire, "r":initalizer(size,sizeMult), "vy":initalizer(speed,speedMult),"life":initalizer(lifeTime,lifeTimeMult)})
    }
}

function smaller(){
    count -= 20;
    sizeMult -= 2;
    for(var i = 0; i < 20; i++){
        fires.pop();
    }
}

function bigger(){
    count += 20;
    sizeMult += 2;
    for(var i = 0; i < 20; i++){
        fires.push({"x":initalizer(x_fire +(count/2),(-count)), "y":y_fire, "r":initalizer(size,sizeMult), "vy":initalizer(speed,speedMult),"life":initalizer(lifeTime,lifeTimeMult)})
    }
}

function moveFire(x,y) {
    x_fire = x;
    y_fire = y;
    count = 100;
    sizeMult = 10;
    createFire();
}

function rotate(){}

function display() {
    ctx.fillStyle="black";
    ctx.clearRect(0,0,w,h);
    ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation="lighter";
    for(var b = 0; b < count; b++){
        var renk = ctx.createRadialGradient(fires[b].x,fires[b].y,2,fires[b].x,fires[b].y,fires[b].r);
        renk.addColorStop(0, "white");
        renk.addColorStop(0.4, "yellow");
        renk.addColorStop(0.6, "orange");
        renk.addColorStop(1, "red");
        ctx.fillStyle = renk;

        ctx.beginPath();
        ctx.arc(fires[b].x,fires[b].y,fires[b].r,0*Math.PI,2*Math.PI);
        ctx.fill();
        fires[b].x -= fires[b].vy*rotation/90;
        fires[b].y -= fires[b].vy*(1 - Math.abs(rotation/90));
        fires[b].r -= Math.max(fires[b].r * 0.025, 0.5);
        fires[b].life-=0.2;

        if(fires[b].life<0 || fires[b].r <0){
            fires[b].x = initalizer(x_fire +(count/2),(-count))
            fires[b].y = y_fire;
            fires[b].r = initalizer(size,sizeMult);
            fires[b].life = initalizer(lifeTime, lifeTimeMult);
            fires[b].vy = initalizer(speed,speedMult);
        }
    }
}

window.onload=function(){
    canvas= document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    h = window.innerHeight;
    w = window.innerWidth;
    canvas.height = h;
    canvas.width = w;

    startText = document.querySelector("#startText");
    startText.style.left = w/3 + "px";
    startText.style.top = h/2  + "px";

    setInterval(display ,100);
}

window.onclick = function (ev) { var x_Mouse = event.clientX;     // Get the horizontal coordinate
    var y_Mouse = event.clientY;     // Get the vertical coordinate
    console.log(x_Mouse + " " + y_Mouse);
    if(Math.abs(x_Mouse - x_fire) < 50 && Math.abs(y_Mouse - y_fire) < 50){
        bigger();
    } else { moveFire(x_Mouse, y_Mouse);}
}

/**window.ondeviceorientation = function (ev) {
    if (ev.absolute) {
        startText.innerHTML = ev.gamma;
        rotation = ev.gamma;
    }
}

/**window.ondevicemotion = function(event) {
    var rates = event.rotationRate;
    if (rates.alpha != null){
        startText.innerHTML = rates.alpha + "kdsljn";
    } else {startText.innerHTML = "PDAOJV K"}
}*/

window.addEventListener("deviceorientation", function(event) {
    rotation = event.gamma;
}, true);

window.addEventListener('shake', shakeEventDidOccur, false);

//function to call when shake occurs
function shakeEventDidOccur () {
    fires = [];
    count = 80;
    sizeMult = 8;
    myShakeEvent.stop();
    alert('shake!');
}


