let canvas;
var pg, click;


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
        click.textSize(130);
    else
        click.textSize(200);
    click.text('Click', width/2, height/2);

    pg.colorMode(HSB, 100);
}

var mx, my;

function draw(){

    if(frameCount == 2)
        reset();

    mx = mouseX-width/2;
    my = mouseY-height/2;

    pg.clear();
    pg.background(90);
    pg.noFill();
    pg.strokeWeight(4);
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
            if(shapes[s][0][0] > width/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][0] -= width;
                }
            }
            if(shapes[s][0][0] < -width/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][0] += width;
                }
            }
            if(shapes[s][0][1] > height/2){
                for(v = 0; v < shapes[s].length; v++){
                    shapes[s][v][1] -= height;
                }
            }
            if(shapes[s][0][1] < -height/2){
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

    blurShader.setUniform('texelSize', [1 / width, 1 / height]);
    blurShader.setUniform('grunge', random(1.6));
    blurShader.setUniform('grunge2', random(0.3, 0.6));
    blurShader.setUniform('frq1', random(0.003, 0.008));
    blurShader.setUniform('frq2', random(0, 1));
    blurShader.setUniform('frq3', random(0, 1));
    blurShader.setUniform('frq4', random(0, 1));
    blurShader.setUniform('frq5', random(0, 1));
    blurShader.setUniform('frq6', random(0, 1));
}



function shaderOnCanvas(tex){
    blurShader.setUniform('tex0', tex);
    shader(blurShader);
    fill(255);
    rect(-width/2, -height/2, width, height);
}



var shapes = [];
var vels = [];
var isdrawing = false;

function handleMoved(){
    if(!isdrawing){
        isdrawing = true;
        shapes.push([]);
        vels.push([]);
    }
    else{
        shapes[shapes.length-1].push([mouseX-width/2, mouseY-height/2]);
        vels[vels.length-1].push([mouseX-width/2, mouseY-height/2]);
    }
}

function handleEnd(){
    isdrawing = false;

    var ver0 = vels[vels.length-1][0];
    for(var i = 0; i < vels[vels.length-1].length; i++){
        var x = vels[vels.length-1][0];
        var y = vels[vels.length-1][1];
        vels[vels.length-1][0] = x;
        vels[vels.length-1][0] = y;
    }
}

function touchMoved() {
    handleMoved();
}

function mouseDragged() {
    handleMoved();
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