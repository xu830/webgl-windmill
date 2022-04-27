var canvas;
var gl;
var program;

var NumVertices  = 0;
var NumV_art = 0;
var NumV_fans = 0;
var NumV_bg = 0;

var points = [];
var normalsArray = [];
var texCoordsArray = [];
var textidexArray = [];
var colors = [];

var near = 0.2;
var far = 7.0;

var  fovy = 50.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix, normalMatrix_v, normalMatrixLoc, textureIndexLocation;
var modelViewMatrixLoc, projectionMatrixLoc, lightpositionLoc, textureLoc;


var eye;
const at = vec3(0.5, 0.0, 0.0);
const up = vec3(0.0, 0.5, 0.0);

//I'll assume the building's color(material) and light color doesn't change, only the light sources' position will change.
var lightPosition = vec4(0.5, 6.0, -0.4, 1.0);
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
// 0.9, 0.6, 0.2, 1.0
var materialAmbient = vec4( 0.988, 0.831, 0.572, 1.0);
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0);
var materialShininess = 100.0;
var ambientColor, diffuseColor, specularColor;

var theta = 0;
var thetaincre = 0;
var texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0),
];

var vertexColors = [
    [ 1.0, 1.0, 1.0, 1.0 ],   // white
    [ 0.956, 0.874, 0.682, 1.0 ],  // base color(orange-brown)
    [ 0.933, 0.666, 0.670, 1.0 ],  // brown
    [ 0.925, 0.898, 0.811, 1.0 ]

];

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
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    bg();
    colorCube();
    colorPyramid();
 

    articulate();
    fans();
    
    var image = new Image();
    image.src = "draw2.png";
    image.onload = function(){
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }
 

    var image2 = new Image();
    image2.src = "white.jpg";
    image2.onload = function(){
        var texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    }

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var textureIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textidexArray), gl.STATIC_DRAW);
  
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

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );

    textureIndexLocation = gl.getAttribLocation(program, "textureIndex");
    gl.bindBuffer(gl.ARRAY_BUFFER, textureIndexBuffer);
    gl.vertexAttribPointer(textureIndexLocation, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureIndexLocation);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    lightpositionLoc = gl.getUniformLocation(program, "lightPosition");
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    textureLoc = gl.getUniformLocation(program, "texture");

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct) );

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    gl.uniform1iv(textureLoc, new Int32Array([0, 1]));

    document.getElementById("slider1").onchange = function(event) {
        //console.log(event.target.value);
        thetaincre = event.target.value;
    };

    render();
}

function bg()
{
   quad2( 1, 0, 3, 2 );
}

function quad2(a, b, c, d) {
    var vertices = [
        vec4(-2, -3.5,  0.0, 1.5),
        vec4(-2,  3.5,  0.0, 1.5),
        vec4(6,  3.5,  0.0, 1.5),
        vec4(6, -3.5,  0.0, 1.5),
    ];
     
    var indices = [ a, b, c, a, c, d ];
    var indices_t = [0, 1, 2, 0, 2, 3]

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    t1 = normalize(vec3(t1));
    t2 = normalize(vec3(t2));
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //console.log(indices_t[i]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[indices_t[i]]);
        textidexArray.push(0.0);
        colors.push(vertexColors[0]);//white
        NumV_bg++;
    }
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
    var indices_t = [0, 1, 2, 0, 2, 3];

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    t1 = normalize(vec3(t1));
    t2 = normalize(vec3(t2));
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[indices_t[i]]);
        textidexArray.push(1.0);
        colors.push(vertexColors[1]);
        NumVertices++;
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
    var indices_t = [0, 1, 2];
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
        texCoordsArray.push(texCoord[indices_t[i]]);
        textidexArray.push(1.0);
        colors.push(vertexColors[2]);
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
    var indices_t = [0, 1, 2, 0, 2, 3];

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
        textidexArray.push(1.0);
        texCoordsArray.push(texCoord[indices_t[i]]);
        colors.push(vertexColors[3])
        NumV_art++;

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
    var indices_t = [0, 1, 2, 0, 2, 3];

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
        textidexArray.push(1.0);
        texCoordsArray.push(texCoord[indices_t[i]]);
        colors.push(vertexColors[3])
        NumV_fans++;
    }
}

// function calcnormalM(modelViewMatrix){
//     //console.debug(modelViewMatrix);
//     normalMatrix_v = [
//         vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
//         vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
//         vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
//     ];
// }

function drawarticulate(){
    var baseMVM = modelViewMatrix;
    theta += thetaincre/10;
    //console.log(thetaincre);
    for(var i = 0; i < 4; i++){
        modelViewMatrix = mult(baseMVM, translate(0.0, 0.5, 0.0));
        
        modelViewMatrix = mult(modelViewMatrix, rotate(theta + i * 90, 0, 0, 1 ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        //calcnormalM(modelViewMatrix);
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, NumVertices + NumV_bg, NumV_art);
    }
    modelViewMatrix = mult(modelViewMatrix, rotate(theta + 90, 0, 0, 1 ));
}

function drawfans(){

    for(var i = 0; i < 4; i++){        
        modelViewMatrix = mult(modelViewMatrix, rotate(i * 90, 0, 0, 1 ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, NumVertices + NumV_art + NumV_bg, NumV_fans);
    }
}



var render = function(){
    setTimeout(function(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform4fv(lightpositionLoc, flatten(lightPosition) );   
        //eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        //    radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));


        eye = vec3(-1.0, 0.0, 3.0);
        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = perspective(fovy, aspect, near, far);
        //calcnormalM(modelViewMatrix);
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, 0, NumVertices);


        //modelViewMatrix = mult(modelViewMatrix, rotate(0, 0, 0, 1 ));
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        normalMatrix_v = normalMatrix(modelViewMatrix, true);
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix_v) );
        gl.drawArrays( gl.TRIANGLES, NumVertices, NumV_bg);



        drawarticulate();
        drawfans();
        requestAnimFrame(render);
    }, 10);

}
