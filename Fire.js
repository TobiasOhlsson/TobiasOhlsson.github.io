var constraints = { audio: true, video: false };
var meter = null;

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

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var audioContext = new AudioContext();

        // Create an AudioNode from the stream.
        mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // Create a new volume meter and connect it.
        meter = createAudioMeter(audioContext);
        mediaStreamSource.connect(meter);

    })
    .catch(function(err) {
        /* handle the error */
    });

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
            fires[b].x = initializer(x_fire +(count/2),(-count))
            fires[b].y = y_fire;
            fires[b].r = initializer(size,sizeMult);
            fires[b].life = initializer(lifeTime, lifeTimeMult);
            fires[b].vy = initializer(speed,speedMult);
        }
    }


    if(meter != null) {
        if(meter.volume > 0.35) {
            smaller();
        }
    }
}

function initializer(a, b) {
    return a+b*Math.random();
}

function createFire() {
    //startText.style.visibility = "hidden";
    //myShakeEvent.start();
    fires = [];
    for(var a = 0; a < count; a++){
        fires.push({"x":initializer(x_fire +(count/2),(-count)), "y":y_fire, "r":initializer(size,sizeMult), "vy":initializer(speed,speedMult),"life":initializer(lifeTime,lifeTimeMult)})
    }
}

function smaller(){
    count -= 10;
    sizeMult -= 1;
    for(var i = 0; i < 10; i++){
        fires.pop();
    }
}

function bigger(){
    count += 20;
    sizeMult += 2;
    for(var i = 0; i < 20; i++){
        fires.push({"x":initializer(x_fire +(count/2),(-count)), "y":y_fire, "r":initializer(size,sizeMult), "vy":initializer(speed,speedMult),"life":initializer(lifeTime,lifeTimeMult)})
    }
}

function moveFire(x,y) {
    x_fire = x;
    y_fire = y;
    count = 100;
    sizeMult = 10;
    createFire();
}

window.onclick = function (ev) { var x_Mouse = event.clientX;     // Get the horizontal coordinate
    var y_Mouse = event.clientY;     // Get the vertical coordinate
    //console.log(x_Mouse + " " + y_Mouse);
    if(Math.abs(x_Mouse - x_fire) < 50 && Math.abs(y_Mouse - y_fire) < 50){
        bigger();
    } else { moveFire(x_Mouse, y_Mouse);}
}

window.ondevicemotion = function (ev) {
    var maxAcceleration = Math.max(Math.abs(ev.acceleration.x), Math.abs(ev.acceleration.y), Math.abs(ev.acceleration.z));
    startText.innerHTML = maxAcceleration;
    if(maxAcceleration > 30){
       fires = [];
       count = 80;
       sizeMult = 8;
    }
}

window.addEventListener("deviceorientation", function(event) {
    rotation = event.gamma;
}, true);

