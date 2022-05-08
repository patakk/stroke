let canvas;
var pg, click;
let osc, fft;


var oscs = []


var N;
var W;
var D;
var CD;

let helvetica;
let blurShader;

var shouldReset = true;

var firstClick = false;

function preload() {
    helvetica = loadFont('assets/HelveticaNeueBd.ttf');
    blurShader = loadShader('assets/blur.vert', 'assets/blur.frag');
}

function setup(){
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    pg = createGraphics(width, height, WEBGL);
    click = createGraphics(width, height);

    reset();

    click.colorMode(HSB, 100);
    click.background(10);
    click.textFont(helvetica);
    click.textAlign(CENTER, CENTER);
    click.fill(90);
    if(width < height)
        click.textSize(40);
    else
        click.textSize(200);
    click.text('NOT WORKING\nON MOBILE', width/2, height/2);

    pg.colorMode(HSB, 100);

}

var mx, my;

function draw(){

    if(width < height){
        shaderOnCanvas(click);
        return;
    }

    mx = mouseX-width/2;
    my = mouseY-height/2;


    if(shapes.length > 0){
        for(var s = 0; s < shapes.length; s++){
            var last = shapes[s];
            if(last.length > 0){
                var lastvx = last[last.length-1][0];
                var lastvy = 200+last[last.length-1][1]/height*500;
                oscs[s].freq(440 - lastvy + 0*sin(lastvx));
            }
        }
    }

    if(shapes.length > 0){
        for(var s = 0; s < shapes.length; s++){
            var amp = map(s, 0, shapes.length-1, 0, 1);
            if(shapes.length == 1){
                amp = .2;
            }
            else{
                amp = pow(amp, 2);
                amp = map(amp, 0, 1, 0.1, .2);
            }
            //if(frameCount%10 == 0)
             //   oscs[s].amp(oscs[s].output.gain.value*.95);
        }
    }

    pg.clear();
    pg.background(90);
    pg.noFill();
    pg.strokeWeight(12);
    for(var dy = -height; dy <= height; dy += height){
        for(var dx = -width; dx <= width; dx += width){
            for(var s = 0; s < shapes.length; s++){
                pg.stroke((power(noise(s*13.313), 2)*1000)%10, 80, 100);
                pg.beginShape();
                for(v = 0; v < shapes[s].length; v++){
                    var x = shapes[s][v][0];
                    var y = shapes[s][v][1];
                    pg.vertex(x-2.2+dx, y+dy);
                }
                pg.endShape();
            }
            for(var s = 0; s < shapes.length; s++){
                pg.stroke(10);
                pg.beginShape();
                for(v = 0; v < shapes[s].length; v++){
                    var x = shapes[s][v][0];
                    var y = shapes[s][v][1];
                    pg.vertex(x+dx, y+dy);
                }
                pg.endShape();
            }
        }
    }

    if(shapes.length > 0){
        var ver0 = shapes[shapes.length-1][0];

        for(var s = 0; s < shapes.length; s++){

            if(shapes[s].length < 3 || (s == shapes.length-1 && isdrawing))
                continue;

            var ver0 = shapes[s][0];
            var ver1 = shapes[s][1];
            for(v = 0; v < shapes[s].length-1; v++){
                shapes[s][v][0] = shapes[s][v+1][0];
                shapes[s][v][1] = shapes[s][v+1][1];
            }
            shapes[s][shapes[s].length-1][0] += ver1[0] - ver0[0];
            shapes[s][shapes[s].length-1][1] += ver1[1] - ver0[1];
        }

        for(var s = 0; s < shapes.length; s++){
            if(shapes[s].length < 3 || (s == shapes.length-1 && isdrawing))
                continue;
            if(shapes[s][shapes[s].length-1][0] > width/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][0] -= width;
                }
            }
            if(shapes[s][shapes[s].length-1][0] < -width/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][0] += width;
                }
            }
            if(shapes[s][shapes[s].length-1][1] > height/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][1] -= height;
                }
            }
            if(shapes[s][shapes[s].length-1][1] < -height/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][1] += height;
                }
            }
        }


    }

    shaderOnCanvas(pg);
    //print(pg)
}

function reset(){
    randomSeed(random(millis()));
    noiseSeed(random(millis()*12.314));

    blurShader.setUniform('grunge', random(1.6));
    blurShader.setUniform('grunge2', random(0.3, 0.6));
    blurShader.setUniform('frq1', random(0.003, 0.008));
    blurShader.setUniform('frq2', random(0, 1));
    blurShader.setUniform('frq3', random(0, 1));
    blurShader.setUniform('frq4', random(0, 1));
    blurShader.setUniform('frq5', random(0, 1));
    blurShader.setUniform('frq6', random(0, 1));


    /*
    for(var k = 0; k < 10; k++){
        shapes.push([]);

        var x0 = random(-width/2, width/2);
        var y0 = random(-height/2, height/2);
        var x = x0;
        var y = y0;
        var vel = createVector(4, 0);
        vel.rotate(random(100));
        var rr1 = random(30, 110);
        var rr2 = random(.5, 2);
        var rr3 = random(0, 1);
        var nn = random(20, 300);
        var frq = .04+random()*random(.1, 30)/nn;
        for(var s = 0; s < nn; s++){

            frq = frq * (1 + 0.4*(-1 + 2*noise(s*0.1, k+313.11)));

            x = x + vel.x;
            y = y + vel.y;

            var ang = radians(rr1*(-.5 + power(noise(s*frq, k), rr2)));
            vel.rotate(ang + radians(random(-5, 5)));

            shapes[shapes.length-1].push([x, y]);
        }
    }*/
}



function shaderOnCanvas(tex){
    blurShader.setUniform('tex0', tex);
    blurShader.setUniform('texelSize', [1 / width, 1 / height]);
    shader(blurShader);
    fill(255);
    rect(-width/2, -height/2, width, height);
}



var shapes = [];
var vels = [];
var isdrawing = false;

function handleMoved(){
    if(width < height){
        return;
    }
    if(width < height){
        return;
    }
    

    if(!isdrawing){
        isdrawing = true;
        if(shapes.length == 5){
            shapes.shift();
            oscs[0].stop();
            oscs.shift();
        }
        oscs.push(new p5.TriOsc());
        oscs[oscs.length-1].amp(0.3);

        var lastvy = 200+(mouseY-height/2)/height*500;
        oscs[oscs.length-1].freq(440 - lastvy);
        oscs[oscs.length-1].start();
    
        shapes.push([]);
        vels.push([]);
        if(shapes.length > 0){
            for(var s = 0; s < shapes.length; s++){
                var amp = map(s, 0, shapes.length-1, 0, 1);
                if(shapes.length == 1){
                    amp = .3;
                }
                else{
                    amp = pow(amp, .5);
                    amp = map(amp, 0, 1, 0.05, .2);
                    amp = 0.3;
                }
                oscs[s].amp(amp);
            }
        }
    }



    if(!isdrawing){
    }
    else{
        shapes[shapes.length-1].push([mouseX-width/2, mouseY-height/2]);
        vels[vels.length-1].push([mouseX-width/2, mouseY-height/2]);
    }


    var actx = getAudioContext();
    actx.resume();
}

function handleStart(){
    
}

function handleEnd(){
    if(width < height){
        return;
    }

    isdrawing = false;

}

function touchStarted() {
  handleStart();
}

function touchMoved() {
    handleMoved();
}

function mouseDragged() {
    handleMoved();
}

function mousePressed() {
    handleStart();
}

function touchEnded(){
    handleEnd();
}

function mouseReleased() {
    handleEnd();
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    pg = createGraphics(width, height);
    reset();
}

function power(p, g) {
    if (p < 0.5)
        return 0.5 * pow(2*p, g);
    else
        return 1 - 0.5 * pow(2*(1 - p), g);
}