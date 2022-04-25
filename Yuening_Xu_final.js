var canvas;
var gl;

var NumVertices  = 0;
var NumV_art = 0;
var NumV_fans = 0;

var points = [];
var normalsArray = [];


var near = 0.2;
var far = 3.0;

var  fovy = 50.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix, normalMatrix_v, normalMatrixLoc;
var modelViewMatrixLoc, projectionMatrixLoc, lightpositionLoc;
var eye;
const at = vec3(0.5, 0.0, 0.0);
const up = vec3(0.0, 0.5, 0.0);

//I'll assume the building's color(material) and light color doesn't change, only the light sources' position will change.
var lightPosition = vec4(0.7, 6.0, -0.5, 1.0);
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.22, 0.6, 0.87, 1.0 );
var materialDiffuse = vec4( 0.58, 0.91, 0.94, 1.0);
var materialSpecular = vec4( 0.58, 0.91, 0.94, 1.0 );
var materialShininess = 100.0;
var ambientColor, diffuseColor, specularColor;

var theta = 0;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
    colorPyramid();
    articulate();
    fans();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    lightpositionLoc = gl.getUniformLocation(program, "lightPosition");
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    //document.getElementById("ButtonAM").onclick = function(){lightPosition = vec4(2.0, 1.0, 2.0, 0.0);};
    //document.getElementById("ButtonPM").onclick = function(){lightPosition = vec4(-0.8, 2.0, -1.0, 0.0);};


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct) );
    //console.debug(lightPosition);


    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    render(); 
}

// SEH Building dimention 300ft * 200 ft * 90ft
// ratio is 1 : 200 ft
function colorCube()
{
   quad( 1, 0, 3, 2 );
   quad( 2, 3, 7, 6 );
   quad( 3, 0, 4, 7 );
   quad( 6, 5, 1, 2 );
   quad( 4, 5, 6, 7 );
   quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.4, -0.8,  1.0, 1.0),
        vec4(-0.4,  0.4,  1.0, 1.0),
        vec4(0.5,  0.4,  1.0, 1.0),
        vec4(0.5, -0.8,  1.0, 1.0),
        vec4(-0.4, -0.8, 0.2, 1.0),
        vec4(-0.4,  0.4, 0.2, 1.0),
        vec4(0.5,  0.4, 0.2, 1.0),
        vec4( 0.5, -0.8, 0.2, 1.0)
    ];
    
     
    var indices = [ a, b, c, a, c, d ];

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    t1 = normalize(vec3(t1));
    t2 = normalize(vec3(t2));
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push(normal);
        NumVertices++;

        //calculate numof vertices here!
    }
}

function colorPyramid(){
    tri(0, 1, 2);
    tri(0, 2, 3);
    tri(0, 3, 4);
    //tri(0, 4, 1);
    tri(4, 3, 5);
    tri(4, 5, 0);
    tri(0, 5, 1)
}
function tri(a, b, c){
    var vertices = [
        vec4(0.05, 0.9,  1.0, 1.0),
        vec4(-0.4, 0.4,  1.0, 1.0),
        vec4(0.5, 0.4,  1.0, 1.0),
        vec4(0.5,  0.4, 0.2, 1.0),
        vec4(0.05, 0.9, 0.2, 1.0),
        vec4(-0.4,  0.4, 0.2, 1.0),
        
    ]

    var indices = [a, b, c];
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    t1 = normalize(vec3(t1));
    t2 = normalize(vec3(t2));
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push(normal);
        //calculate numof vertices here!
        NumVertices++;
    }

}
function articulate()
{
    quad_a( 1, 0, 3, 2 );
    quad_a( 2, 3, 7, 6 );
    quad_a( 3, 0, 4, 7 );
    quad_a( 6, 5, 1, 2 );
    quad_a( 4, 5, 6, 7 );
    quad_a( 5, 4, 0, 1 );
}

function quad_a(a, b, c, d) {
    var vertices = [
        vec4(-0.05, 0.0,  1.2, 1.0),
        vec4(-0.05,  0.05,  1.2, 1.0),
        vec4(0.0,  0.05,  1.2, 1.0),
        vec4(0.0, 0.0,  1.2, 1.0),
        vec4(-0.05, 0.0, 1.0, 1.0),
        vec4(-0.05,  0.05, 1.0, 1.0),
        vec4(0.0,  0.05, 1.0, 1.0),
        vec4( 0.0, 0.0, 1.0, 1.0)
    ];
    
     
    var indices = [ a, b, c, a, c, d ];

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    //normalize t1, t2
    t1 = normalize(vec3(t1));
    t2 = normalize(vec3(t2));
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push(normal);
        NumV_art++;

        //calculate numof vertices here!
    }
}

function fans()
{
    quad_f( 1, 0, 3, 2 );
    quad_f( 2, 3, 7, 6 );
    quad_f( 3, 0, 4, 7 );
    quad_f( 6, 5, 1, 2 );
    quad_f( 4, 5, 6, 7 );
    quad_f( 5, 4, 0, 1 );
}

function quad_f(a, b, c, d) {
    var vertices = [
        vec4(-0.5, -0.05,  1.4, 1.0),
        vec4(-0.5,  0.1,  1.4, 1.0),
        vec4(0.0,  0.05,  1.4, 1.0),
        vec4(0.0, 0.0,  1.4, 1.0),
        vec4(-0.5, -0.05, 1.2, 1.0),
        vec4(-0.5,  0.1, 1.2, 1.0),
        vec4(0.0,  0.05, 1.2, 1.0),
        vec4( 0.0, 0.0, 1.2, 1.0)
    ];
    
     
    var indices = [ a, b, c, a, c, d ];

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    //normalize t1, t2
    t1 = normalize(vec3(t1));
    t2 = normalize(vec3(t2));
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push(normal);
        NumV_fans++;

        //calculate numof vertices here!
    }
}

function calcnormalM(modelViewMatrix){
    //console.debug(modelViewMatrix);
    normalMatrix_v = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
}

function drawarticulate(){
    var baseMVM = modelViewMatrix;
    //theta += 0.4;
    for(var i = 0; i < 4; i++){
        modelViewMatrix = mult(baseMVM, translate(0.0, 0.5, 0.0));
        
        modelViewMatrix = mult(modelViewMatrix, rotate(theta + i * 90, 0, 0, 1 ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        //calcnormalM(modelViewMatrix);
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, NumVertices, NumV_art);
    }
    modelViewMatrix = mult(modelViewMatrix, rotate(theta + 90, 0, 0, 1 ));
}

function drawfans(){
    for(var i = 0; i < 4; i++){        
        modelViewMatrix = mult(modelViewMatrix, rotate(i * 90, 0, 0, 1 ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, NumVertices + NumV_art, NumV_fans);
    }
}

var render = function(){
    setTimeout(function(){
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform4fv(lightpositionLoc, flatten(lightPosition) );   
        //eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        //    radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
        eye = vec3(-1.6, 0, 3);

        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = perspective(fovy, aspect, near, far);

        //calcnormalM(modelViewMatrix);
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices);

        drawarticulate();
        drawfans();
        requestAnimFrame(render);
    }, 10);

}
