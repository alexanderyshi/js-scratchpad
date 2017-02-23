/*
	WebGL is based on OpenGL ES2.0 (embedded systems) with limited support for ES3.0
	This platform is supported by a variety of embedded devices and web/mobile platforms
	It offers GPU level hooks alongside full DOM level support

	This was implemented from:
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

	with a focus on using the WebGL API and without scope on how the underlying OpenGL works
*/

// gl globals
{	
	var gl; // global gl context var
	var horizAspect = 1000.0/1000.0; // usually width/height
}

//motion
{		
	var cubeRotation = 0.0;
	var tick = 0;
	var mXOffset = 0.0;
	var mYOffset = 0.0;
	var mZOffset = 0.0;
	var xIncValue = 0.2;
	var yIncValue = -0.4;
	var zIncValue = 0.3;
	var lastCubeUpdateTime;
}

// buffers
{
	var colors;
	var generatedColors;
	var cubeVerticesBuffer;
	var cubeVerticesColorBuffer;
	var cubeVerticesIndexBuffer;

	var colorShaderProgram;
	var textureShaderProgram;
	var fragmentShader;
	var vertexShader;
}

// assets
{
	var	vertices = [ // vertices are shared by multiple shaders for the single entity on screen
		// Front face
		-1.0, -1.0,  1.0,
		1.0, -1.0,  1.0,
		1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		1.0,  1.0,  1.0,
		1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0,  1.0,  1.0,
		1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0
	];

	var cubeColorVertexIndices = [
		0,  1,  2,      0,  2,  3,    // front
		4,  5,  6,      4,  6,  7,    // back
		8,  9,  10,     8,  10, 11,   // top
		// 12, 13, 14,     12, 14, 15,   // bottom
		// 16, 17, 18,     16, 18, 19,   // right
		// 20, 21, 22,     20, 22, 23    // left
	];
	
	var cubeTextureVertexIndices = [
		// 0,  1,  2,      0,  2,  3,    // front
		// 4,  5,  6,      4,  6,  7,    // back
		// 8,  9,  10,     8,  10, 11,   // top
		12, 13, 14,     12, 14, 15,   // bottom
		16, 17, 18,     16, 18, 19,   // right
		20, 21, 22,     20, 22, 23    // left
	];
}

function start() {
	// makes sense to not need this to be global - does it get GC?
	var canvas = document.getElementById('glCanvas');

	// Initialize the GL context
	gl = initWebGL(canvas);
	
	// Only continue if this browser supports webgl2
	if (!gl) {
		return;
	}
	
	/* 
		Render resolution determined by the dimm. of the canvas when context obtained
		Changing CSS from beginning or canvas dimm after context obtained only changes upscale/downscale by "zooming" and "panning" across the whole canvas
		This can be done by changing viewport

		DOWN SAMPLING FOR IMPROVED IMAGE QUALITY
		(SSAA - removed jaggedness, FSAA - downsample oversized, MSAA - oversize only portions of image) :
		https://en.wikipedia.org/wiki/Supersampling
		https://en.wikipedia.org/wiki/Multisample_anti-aliasing

		gl.viewport(x_starting_coord,y_starting_coord,width,height);
	*/
	gl.viewport(0,0 , canvas.width, canvas.height);
	
	gl.clearColor(.5,.5,1, 1.0); // bg colour after clear inR GBA (0-1)
	gl.enable(gl.DEPTH_TEST); // depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.

    initShaders();

    // Here's where we call the routine that builds all the objects
    // we'll be drawing.

    initBuffers();

    // Set up to draw the scene periodically.

	setInterval(drawScene, 33);
}

function initWebGL(canvas) {
  	gl = null;
  
  	// forget your disillusions of compatibility and support this is the bleeding edge evidently
  	gl = canvas.getContext('webgl2');

  	// I did leave in this line for future reference though because I find the OR comparison nifty what does this even mean in JS
  	// gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
	if (!gl) {
		alert('WEBGL2 ONLY BAYBEE');
	}	
	  
	return gl;
}

function initShaders() {
	// shaders are in html, provided by tut.
	fragmentShader = getShader(gl, 'shader-fs'); // each pixel in a polygon is a FRAGMENT - this handles the colours of said fragments
	vertexShader = getShader(gl, 'shader-vs'); // handles positions of vertexs

	initColorShaders();
	initTextureShaders();
}

function initColorShaders() {
	// Create the shader program
	colorShaderProgram = gl.createProgram();
	gl.attachShader(colorShaderProgram, vertexShader);
	gl.attachShader(colorShaderProgram, fragmentShader);
	gl.linkProgram(colorShaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(colorShaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(colorShaderProgram));
	}

	vertexColorAttribute = gl.getAttribLocation(colorShaderProgram, 'aVertexColor');
  	gl.enableVertexAttribArray(vertexColorAttribute);
	vertexPositionAttribute = gl.getAttribLocation(colorShaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPositionAttribute);
}

function initTextureShaders() {
	// Create the shader program
	textureShaderProgram = gl.createProgram();
	gl.attachShader(textureShaderProgram, vertexShader);
	gl.attachShader(textureShaderProgram, fragmentShader);
	gl.linkProgram(textureShaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(textureShaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(textureShaderProgram));
	}

	vertexColorAttribute = gl.getAttribLocation(textureShaderProgram, 'aVertexColor');
  	gl.enableVertexAttribArray(vertexColorAttribute);
	vertexPositionAttribute = gl.getAttribLocation(textureShaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPositionAttribute);
}

// load shaders from HTML instead of building in js
function getShader(gl, id, type) {
	var shaderScript, theSource, currentChild, shader;

	shaderScript = document.getElementById(id);

	if (!shaderScript) {
		return null;
	}

	theSource = shaderScript.text;

	// default action if only two args
	if (!type) {
		if (shaderScript.type == 'x-shader/x-fragment') {
		  	type = gl.FRAGMENT_SHADER;
		} else if (shaderScript.type == 'x-shader/x-vertex') {
		  	type = gl.VERTEX_SHADER;
		} else {
			// Unknown shader type
			return null;
		}
	}
	shader = gl.createShader(type);

	gl.shaderSource(shader, theSource);
    
	// Compile the shader program
	gl.compileShader(shader);  

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
		console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));  
		gl.deleteShader(shader);
		return null;  
	}

 	 return shader;
}

function initBuffers() {
	// create buffer storage objects
	cubeVerticesBuffer = gl.createBuffer(); // coords (x,y,z) -> since z is constant 0, we have a 2d element
	cubeVerticesColorBuffer = gl.createBuffer(); // stores vertices in the cube to be later referred to by the indexbuffer
	cubeVerticesIndexBuffer = gl.createBuffer(); // sets of triangles that possess the values of the corresponding index of cubeVerticesBuffer

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

}

function updateColors()
{
	var valA = Math.pow(Math.cos(tick/90),4);
	var valB = Math.pow(Math.sin(tick/90),4);
	// these are 4 attribute arrays
	colors = [
		[valA/valB,  valB/valA,  (valA+valB)/2,  .8],    // Front face: wildcard
		[valA,  valB,  valB,  .8],    // Back face: red
		[valB,  valA,  valB,  .8],    // Top face: green
		// [valB,  valB,  valA,  1],    // Bottom face: blue
		// [valA,  valA,  valB,  1],    // Right face: yellow
		// [valA,  valB,  valA,  1]     // Left face: purple
		[0,0,0,  .8],    // Bottom face: blue
		[1,1,1,  .8],    // Right face: yellow
		[0.5,0.5,0.5,  .8]     // Left face: purple
	];

	generatedColors = [];
	// !AYS array has elements : 6 faces x 4 values (RGBA) x 4 ??? -> how does this turn into 78 vals at runtime?
	for (var j = 0; j < 6; j++) {
		var c = colors[j];

		for (var i = 0; i < 4; i++) {
			generatedColors = generatedColors.concat(c);
		}
	}
  	tick++;
}

function loadColorBuffers()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
	updateColors(); // updates generatedColors array
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	// void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
	// gl.vertexAttribPointer(always 0, 3 dimensions, float type storage in vertices array, fixed point values instead of normalized, no offset between vertices in storage, no offset to start storage of array);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    	new Uint16Array(cubeColorVertexIndices), gl.STATIC_DRAW);
}

function loadTextureBuffers()
{
	// repeat for colour vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
	updateColors(); // updates generatedColors array
	// var mArray = [];
	// Object.assign(mArray, generatedColors);
    // console.log(mArray);
	// mArray = mArray.splice(generatedColors.length/2,generatedColors.length/2);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mArray), gl.STATIC_DRAW);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    // console.log(mArray);
    // console.log(generatedColors.length);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    	new Uint16Array(cubeTextureVertexIndices), gl.STATIC_DRAW);
}

function updatePosition() {

	var currentTime = Date.now();
	if (lastCubeUpdateTime) {
	  	var delta = currentTime - lastCubeUpdateTime;
	  	
		cubeRotation += (30 * delta) / 1000.0;
		mXOffset += xIncValue * ((3 * delta) / 1000.0);
	    mYOffset += yIncValue * ((3 * delta) / 1000.0);
	    mZOffset += zIncValue * ((3 * delta) / 1000.0);
	    
	    var offsetBounds = 2.5;
	    if (Math.abs(mXOffset) > offsetBounds) {
		    xIncValue = -xIncValue;
		    mXOffset = mXOffset > 0 ? offsetBounds : -offsetBounds;
	    }
	    if (Math.abs(mYOffset) > offsetBounds) {
	        yIncValue = -yIncValue;
		    mYOffset = mYOffset > 0 ? offsetBounds : -offsetBounds;
	    }
	    if (Math.abs(mZOffset) > offsetBounds) {
	        zIncValue = -zIncValue;
		    mZOffset = mZOffset > 0 ? offsetBounds : -offsetBounds;
	    }
	}
  	
  	lastCubeUpdateTime = currentTime;
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// makePerspective (FOV angle in deg, width:height, min depth, max depth)
	perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0);

	loadIdentity(); // default camera position
	mvTranslate([-0.0, 0.0, -12.0]); // move back 12 units to get object in view

	// done after translation
	mvPushMatrix();
	mvRotate(cubeRotation, [1, 0, 1]);
	mvTranslate([mXOffset, mYOffset, mZOffset]);

	gl.useProgram(colorShaderProgram);
	loadColorBuffers();
	setColorMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);

	gl.useProgram(textureShaderProgram);
	loadTextureBuffers();
	setTextureMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);

	// restore original matrix after drawing - AYS who is using this?!?
	mvPopMatrix();

	updatePosition();
}

// Matrix library helpers from sylvester, glutils

function loadIdentity() {
	mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  	mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  	multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setColorMatrixUniforms() {
	var pUniform = gl.getUniformLocation(colorShaderProgram, "uPMatrix");
	// how is perspectivematrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(colorShaderProgram, "uMVMatrix");
	// how is mvmatrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

function setTextureMatrixUniforms() {
	var pUniform = gl.getUniformLocation(textureShaderProgram, "uPMatrix");
	// how is perspectivematrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(textureShaderProgram, "uMVMatrix");
	// how is mvmatrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw('Can\'t pop from an empty matrix stack.');
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}