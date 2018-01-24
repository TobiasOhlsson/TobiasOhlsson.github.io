//Empirically determined values which describe the behaviour of the fire.
const multiplier = 10;
const count_init = 100;
const changeFactor = 20;
const refresh_time = 100;

//These thresholds determine if the specific input value is high enough to take an action.
const sound_threshold = 0.38;
const acceleration_threshold = 50;

//Used to acquire an audio input.
var constraints = { audio: true, video: false };
var meter = null;

//Defines the total amount of fire bubbles and the size of the spawn area.
var count = count_init;

//Defines the maximum life time of each fire bubble. Each value is in [lifeTime, (lifeTime+lifeTimeMult)]
var lifeTime = 5;
var lifeTimeMult = multiplier;

//Defines the speed of each fire bubble. Similar to the life time value.
var speed = 1;
var speedMult = multiplier;

//Defines the size of each fire bubble. Similar to the life time value.
var size = multiplier;
var sizeMult = multiplier;

//The middle point of the spawn area.
var x_fire;
var y_fire;

//The current device orientation.
var rotation = 0;

var fires = [];



window.onload=function(){
    canvas = document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    h = window.innerHeight;
    w = window.innerWidth;
    canvas.height = h;
    canvas.width = w;
    ctx.font ="3vmax Arial";

    setInterval(update ,refresh_time);
}

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

// Tries to acquire a microphone and starts tracking the sound on success.
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
        alert("You won't experience all features without a microphone.");
        /* No further error handling is required because the use of an microphone is not elementary.*/
    });

/**
 * This method is in charge for the behaviour of the light bubbles.
 * It is calculating the new position and size in respect to the speed, rotation and lifetime of an bubble.
 */
function update() {
    // clears the display
    ctx.fillStyle="black";
    ctx.clearRect(0,0,w,h);
    ctx.fillRect(0,0,w,h);

    //color is determined by adding color values of overlapping content.
    ctx.globalCompositeOperation="lighter";


    ctx.fillStyle = "red";
    ctx.fillText("Press anywhere to light up a fire",30,50);

    for(var b = 0; b < fires.length; b++){
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
        fires[b].y -= fires[b].vy;
        fires[b].r -= Math.max(fires[b].r * 0.025, 0.5);
        fires[b].life-=0.2;

        // if a fire bubble goes out a new one is created in the same place of the array.
        if(fires[b].life<0 || fires[b].r <0){
            fires[b].x = initializer(x_fire +(count/2),(-count))
            fires[b].y = y_fire;
            fires[b].r = initializer(size,sizeMult);
            fires[b].life = initializer(lifeTime, lifeTimeMult);
            fires[b].vy = initializer(speed,speedMult);
        }
    }


    /**
     *  If the volume of the sound stream reaches a threshold the fire will become smaller.
     *   This event should only take place when the user blows into the microphone.
     */
    if(meter != null) {
        if(meter.volume > sound_threshold) {
            smaller();
        }
    }
}

/**
 * This function creates a random value in the interval [a,a+b]
 * @param a the lower border of the interval.
 * @param b the size of the interval.
 * @returns {*} The created random value.
 */
function initializer(a, b) {
    return a+b*Math.random();
}

/**
 * This function removes all fire bubbles and creates #count new ones.
 */
function createFire() {
    fires = [];
    for(var a = 0; a < count; a++){
        fires.push({"x":initializer(x_fire +(count/2),(-count)),
            "y":y_fire,
            "r":initializer(size,sizeMult),
            "vy":initializer(speed,speedMult),
            "life":initializer(lifeTime,lifeTimeMult)});
    }
}

/**
 * decreases the amount of fire bubbles of the fire by #changeFactor and the size by (#changeFactor/10).
 */
function smaller(){
    count -= changeFactor;
    sizeMult -= changeFactor/10;
    for(var i = 0; i < changeFactor; i++){
        fires.pop();
    }
}

/**
 * increases the amount of fire bubbles of the fire by #changeFactor and the size by (#changeFactor/10).
 */
function bigger(){
    count += changeFactor;
    sizeMult += changeFactor/10;
    for(var i = 0; i < changeFactor; i++){
        fires.push({"x":initializer(x_fire +(count/2),(-count)),
            "y":y_fire,
            "r":initializer(size,sizeMult),
            "vy":initializer(speed,speedMult),
            "life":initializer(lifeTime,lifeTimeMult)});
    }
}

/**
 * Sets the point where a new fire will be created. This also triggers the old fire to go out.
 * @param x the new x value of the midpoint of the fire.
 * @param y the new y value of the midpoint of the fire.
 */
function moveFire(x,y) {
    x_fire = x;
    y_fire = y;
    count = count_init;
    sizeMult = multiplier;
    createFire();
}

/**
 * If the user clicks near the midpoint of the fire it will get bigger.
 * If he clicks on a remote point the fire will move there.
 * @param ev The click event triggered by the user.
 */
window.onclick = function (ev) { var x_Mouse = event.clientX;     // Get the horizontal coordinate
    var y_Mouse = event.clientY;     // Get the vertical coordinate
    //console.log(x_Mouse + " " + y_Mouse);
    if(Math.abs(x_Mouse - x_fire) < 50 && Math.abs(y_Mouse - y_fire) < 50){
        bigger();
    } else {
        moveFire(x_Mouse, y_Mouse);
    }
}

/**
 * Makes the fire go out if the Acceleration of the device reaches a threshold.
 * @param ev The motion event triggered by the user.
 */
window.ondevicemotion = function (ev) {
    var acc = ev.acceleration;
    var accLength = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
    if(accLength > acceleration_threshold){
       fires = [];
       count = count_init - changeFactor;
       sizeMult = (count_init - changeFactor)/10;
    }
}

/**
 * Listens to a rotation event triggered by the user to set the rotation of the fire to the rotation around the y axis.
 */
window.addEventListener("deviceorientation", function(event) {
    rotation = event.gamma;
}, true);

