/*
	WebGL is based on OpenGL ES2.0 (embedded systems) with limited support for ES3.0
	This platform is supported by a variety of embedded devices and web/mobile platforms
	It offers GPU level hooks alongside full DOM level support

	This was implemented from:
	https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

	with a focus on using the WebGL API and without scope on how the underlying OpenGL works
*/

var gl; // global
var horizAspect = 1.0; // usually width/height
var squareRotation = 0.0;
var squareXOffset = 0.0;
var squareYOffset = 0.0;
var squareZOffset = 0.0;
var xIncValue = 0.2;
var yIncValue = -0.4;
var zIncValue = 0.3;

var lastSquareUpdateTime;

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

	setInterval(drawScene, 15);
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
	var fragmentShader = getShader(gl, 'shader-fs'); // each pixel in a polygon is a FRAGMENT - this handles the colours of said fragments
	var vertexShader = getShader(gl, 'shader-vs'); // handles positions of vertexs

	// Create the shader program
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
	}

	gl.useProgram(shaderProgram);

	vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
  	gl.enableVertexAttribArray(vertexColorAttribute);
	vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
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
	// create buffer storage object 
	squareVerticesBuffer = gl.createBuffer();
	// bind created buffer object in GL framework
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
	// coords (x,y,z) -> since z is constant 0, we have a 2d element
  	var vertices = [
		 1,   1,  0,
		 -1,   1,  0,
		1,   -1,  0,
		-1,   -1,  0
	];
	
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	// these are 4 attribute arrays
	var colors = [
    	1.0,  1.0,  1.0,  1.0,    // white
    	1.0,  0.0,  0.0,  1.0,    // red
    	0.0,  1.0,  0.0,  1.0,    // green
    	0.0,  0.0,  1.0,  1.0     // blue
 	];
  	squareVerticesColorBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// makePerspective (FOV angle in deg, width:height, min depth, max depth)
	perspectiveMatrix = makePerspective(45, horizAspect, 0.1, 100.0);

	loadIdentity(); // default camera position
	mvTranslate([-0.0, 0.0, -12.0]); // move back 12 units to get object in view

	// done after translation
	mvPushMatrix();
	mvRotate(squareRotation, [1, 0, 1]);
	mvTranslate([squareXOffset, squareYOffset, squareZOffset]);

	// void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
	// gl.vertexAttribPointer(always 0, 3 dimensions, float type storage in vertices array, fixed point values instead of normalized, no offset between vertices in storage, no offset to start storage of array);
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	// repeat for colour vertices
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// restore original matrix after drawing - AYS who is using this?!?
	mvPopMatrix();

	var currentTime = Date.now();
	if (lastSquareUpdateTime) {
	  	var delta = currentTime - lastSquareUpdateTime;
	  	
		squareRotation += (30 * delta) / 1000.0;
		squareXOffset += xIncValue * ((3 * delta) / 1000.0);
	    squareYOffset += yIncValue * ((3 * delta) / 1000.0);
	    squareZOffset += zIncValue * ((3 * delta) / 1000.0);
	    
	    var offsetBounds = 2.5;
	    if (Math.abs(squareXOffset) > offsetBounds) {
		    xIncValue = -xIncValue;
		    squareXOffset = squareXOffset > 0 ? offsetBounds : -offsetBounds;
	    }
	    if (Math.abs(squareYOffset) > offsetBounds) {
	        yIncValue = -yIncValue;
		    squareYOffset = squareYOffset > 0 ? offsetBounds : -offsetBounds;
	    }
	    if (Math.abs(squareZOffset) > offsetBounds) {
	        zIncValue = -zIncValue;
		    squareZOffset = squareZOffset > 0 ? offsetBounds : -offsetBounds;
	    }
	}
  	
  	lastSquareUpdateTime = currentTime;
  
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

function setMatrixUniforms() {
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	// how is perspectivematrix still in scope? shouldn't it be passed in?
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
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