/*
	WebGL is based on OpenGL ES2.0 (embedded systems) with limited support for ES3.0
	This platform is supported by a variety of embedded devices and web/mobile platforms
	It offers GPU level hooks alongside full DOM level support

	This was implemented from:
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

	with a focus on using the WebGL API and without scope on how the underlying OpenGL works
*/
// configs
{
	var UPDATE_COLORS = false;
	var MOVE_CUBE = false;
}
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
	var cubeVerticesTextureCoordBuffer;
	var cubeVerticesNormalBuffer;

	var colorShaderProgram;
	var textureShaderProgram;
	var fragmentShaderSolidColor;
	var vertexShaderSolidColor;
	var fragmentShaderTexture;
	var vertexShaderTexture;

	var textureCoordAttribute;
	var vertexPositionAttributeColor;
	var vertexPositionAttributeTexture;
	var vertexNormalAttributeColor; // why must these be seperate but not vertices?
	var vertexNormalAttributeTexture;

}

// textures
{
	var cubeTexture;
	var cubeCanvasTexture;
	var cubeImage;
	var cubeCanvasImage;
}

// assets
{
	// !! vertices and textureCoordinates must be full length in order for indexing arrays to work
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
	// normalized to [0,1] due to uv coord format
	var textureCoordinates = [
   // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
	0.0, 1.0
	];

	var vertexNormals = [
		// Front
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,

		// Back
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,

		// Top
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,

		// Bottom
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,

		// Right
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,

		// Left
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0
	];

	var cubeColorVertexIndices = [
		0,  1,  2,      0,  2,  3,    // front
		4,  5,  6,      4,  6,  7,    // back
		// 8,  9,  10,     8,  10, 11,   // top
		// 12, 13, 14,     12, 14, 15,   // bottom
		// 16, 17, 18,     16, 18, 19,   // right
		// 20, 21, 22,     20, 22, 23    // left
	];
	
	var cubeTextureVertexIndices = [
		// 0,  1,  2,      0,  2,  3,    // front
		// 4,  5,  6,      4,  6,  7,    // back
		8,  9,  10,     8,  10, 11,   // top
		12, 13, 14,     12, 14, 15,   // bottom
		// 16, 17, 18,     16, 18, 19,   // right
		// 20, 21, 22,     20, 22, 23    // left
	];

	var cubeCanvasTextureVertexIndices = [
		// 0,  1,  2,      0,  2,  3,    // front
		// 4,  5,  6,      4,  6,  7,    // back
		// 8,  9,  10,     8,  10, 11,   // top
		// 12, 13, 14,     12, 14, 15,   // bottom
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
	updateColors(); 
    initTextures();

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
	fragmentShaderSolidColor = getShader(gl, 'shader-fs-solid-color'); // each pixel in a polygon is a FRAGMENT - this handles the colours of said fragments
	vertexShaderSolidColor = getShader(gl, 'shader-vs-solid-color'); // handles positions of vertexs
	fragmentShaderTexture = getShader(gl, 'shader-fs-texture');
	vertexShaderTexture = getShader(gl, 'shader-vs-texture');

	initColorShaders();
	initTextureShaders();
}

function initColorShaders() {
	// Create the shader program
	colorShaderProgram = gl.createProgram();
	gl.attachShader(colorShaderProgram, vertexShaderSolidColor);
	gl.attachShader(colorShaderProgram, fragmentShaderSolidColor);
	gl.linkProgram(colorShaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(colorShaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(colorShaderProgram));
	}
	vertexColorAttribute = gl.getAttribLocation(colorShaderProgram, 'aVertexColor');
  	gl.enableVertexAttribArray(vertexColorAttribute);
	vertexPositionAttributeColor = gl.getAttribLocation(colorShaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPositionAttributeColor);
	vertexNormalAttributeColor = gl.getAttribLocation(colorShaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(vertexNormalAttributeColor);
}

function initTextureShaders() {
	// Create the shader program
	textureShaderProgram = gl.createProgram();
	gl.attachShader(textureShaderProgram, vertexShaderTexture);
	gl.attachShader(textureShaderProgram, fragmentShaderTexture);
	gl.linkProgram(textureShaderProgram);
	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(textureShaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(textureShaderProgram));
	}
	textureCoordAttribute = gl.getAttribLocation(textureShaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(textureCoordAttribute);
	vertexPositionAttributeTexture = gl.getAttribLocation(textureShaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(vertexPositionAttributeTexture);
	vertexNormalAttributeTexture = gl.getAttribLocation(textureShaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(vertexNormalAttributeTexture);
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

function initBuffers() { // why is it OK that I set these just the one time but I have to keep setting the index buffers, texture buffers? colors seem okay if set only once too, but will obviously not change colours as a result
	// create buffer storage objects
	cubeVerticesBuffer = gl.createBuffer(); // coords (x,y,z) -> since z is constant 0, we have a 2d element
	cubeVerticesColorBuffer = gl.createBuffer(); // stores vertices in the cube to be later referred to by the indexbuffer
	cubeVerticesIndexBuffer = gl.createBuffer(); // sets of triangles that possess the values of the corresponding index of cubeVerticesBuffer
	cubeVerticesTextureCoordBuffer = gl.createBuffer();
	cubeVerticesNormalBuffer = gl.createBuffer(); // normals needed for the lighting model

	// set of vertices for the cube is shared between both texture and color frag shaders
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	// void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
	// gl.vertexAttribPointer(always 0, 3 dimensions, float type storage in vertices array, fixed point values instead of normalized, no offset between vertices in storage, no offset to start storage of array);
	gl.vertexAttribPointer(vertexPositionAttributeColor, 3, gl.FLOAT, false, 0, 0);

}

function initTextures() {
	cubeTexture = gl.createTexture();
	cubeCanvasTexture = gl.createTexture();
	cubeImage = new Image();
	cubeCanvasImage = new Image();
	cubeCanvasImage.onload = function() {handleTextureLoaded(gl.canvas, cubeCanvasTexture, 1);};
	cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture, 0); };
	// !! AYS may get complaints about image not loaded yet at draw call time
	// !! will require a simple web server to satisfy CORS - disable web page caching!
	cubeImage.src = 'cubetexture.png';
	cubeCanvasImage.src = 'cubetexture.png'; // placeholder until it gets updated
}

function handleTextureLoaded(image, texture, textureNum) {
	if (textureNum === 0)
	{
		gl.activeTexture(gl.TEXTURE0);
	}
	else if (textureNum === 1)
	{
		gl.activeTexture(gl.TEXTURE1);
	}
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	// // NPOT textures enabled by disabling mipmapping, UV tiling
	// // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// // Prevents s-coordinate wrapping (repeating).
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// // Prevents t-coordinate wrapping (repeating).
	// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.generateMipmap(gl.TEXTURE_2D);
	// clear texture buffer?
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function updateColors()  // updates generatedColors array to allow colors to change
{
	var valA = Math.pow(Math.cos(tick/90),4);
	var valB = Math.pow(Math.sin(tick/90),4);
	var faceColor = [valA/valB,  valB/valA,  (valA+valB)/2,  .8];
	var faceColorInverse = [1 - faceColor[0], 1 - faceColor[1],  1 - faceColor[2],  .8];
	// these are 4 attribute arrays
	colors = [
		faceColor,    // Front face: wildcard
		faceColorInverse,    // Back face: red
		// [valB,  valA,  valB,  .8],    // Top face: green
		// [valB,  valB,  valA,  1],    // Bottom face: blue
		// [valA,  valA,  valB,  1],    // Right face: yellow
		// [valA,  valB,  valA,  1]     // Left face: purple
		// [0,0,0,  .8],    
		// [1,1,1,  .8],    
		// [0.5,0.5,0.5, .8]
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
	if (UPDATE_COLORS) { updateColors(); }
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    	new Uint16Array(cubeColorVertexIndices), gl.STATIC_DRAW);
	// NORMAL ARRAYS
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexNormalAttributeColor, 3, gl.FLOAT, false, 0, 0);
}

function loadTextureBuffers()
{
	// TEXTURE
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
              gl.STATIC_DRAW);
	gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    	new Uint16Array(cubeTextureVertexIndices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexNormalAttributeTexture, 3, gl.FLOAT, false, 0, 0);
}

function loadCanvasTextureBuffers()
{
	// TEXTURE
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
              gl.STATIC_DRAW);
	gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    	new Uint16Array(cubeCanvasTextureVertexIndices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexNormalAttributeTexture, 3, gl.FLOAT, false, 0, 0);
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
	if (MOVE_CUBE) 
	{
		mvTranslate([-0.0, 0.0, -12.0]); // move back 12 units to get object in view
	}
	else
	{
		mvTranslate([-0.0, 0.0, -6.0]); // move back 12 units to get object in view
	}

	// done after translation
	mvPushMatrix();
	mvRotate(cubeRotation, [1, -1, 1]);
	if (MOVE_CUBE){	mvTranslate([mXOffset, mYOffset, mZOffset]); }

	gl.useProgram(colorShaderProgram);
	loadColorBuffers();
	setMatrixUniforms(colorShaderProgram);
	gl.drawElements(gl.TRIANGLES, cubeColorVertexIndices.length, gl.UNSIGNED_SHORT, 0);

	// Texture shaders
	gl.useProgram(textureShaderProgram);
	gl.activeTexture(gl.TEXTURE0); // !! AYS not sure how this works but switching the activeTexture() call positions results in flipped assets
	// !! AYS not sure how this works but switching the uniform1i() call positions results in flipped assets
	gl.uniform1i(gl.getUniformLocation(textureShaderProgram, 'uSampler'), 0);

	// local texture
	gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
	setMatrixUniforms(textureShaderProgram);
	loadTextureBuffers();
	gl.drawElements(gl.TRIANGLES, cubeTextureVertexIndices.length, gl.UNSIGNED_SHORT, 0);

	// canvas texture
	gl.activeTexture(gl.TEXTURE1);
	gl.uniform1i(gl.getUniformLocation(textureShaderProgram, 'uSampler'), 1);
	gl.bindTexture(gl.TEXTURE_2D, cubeCanvasTexture);
	setMatrixUniforms(textureShaderProgram);
	loadCanvasTextureBuffers();
	gl.drawElements(gl.TRIANGLES, cubeCanvasTextureVertexIndices.length, gl.UNSIGNED_SHORT, 0);

	// update canvas texture
	handleTextureLoaded(gl.canvas, cubeCanvasTexture, 1);
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

function setMatrixUniforms(shaderProgram) { // uniforms are def'd in shaders, loaded
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	// how is perspectivematrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	// how is mvmatrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));

	// lighting
	var normalMatrix = mvMatrix.inverse();
	normalMatrix = normalMatrix.transpose();
	var nUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
	gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
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