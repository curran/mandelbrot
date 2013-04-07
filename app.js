var webGLStart = (function(){
  var gl, 
      time = 0, 
      timeInc = 0.05, 
      shader, 
      projection = mat4.create(), 
      unitSquareVertices;

  function webGLStart() {
    var canvas = document.getElementById("canvas");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    (function animloop(){
      requestAnimFrame(animloop);
      resizeIfNecessary();
      drawScene();
      incrementSimulation();
    })();
  }

  function initGL(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl");
    } catch (e) {
    } if (!gl) { alert("Could not initialise WebGL"); }
  }

  function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shader = gl.createProgram();
    gl.attachShader(shader, vertexShader);
    gl.attachShader(shader, fragmentShader);
    gl.linkProgram(shader);

    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(shader);

    gl.enableVertexAttribArray(shader.projection);

    shader.projection = gl.getUniformLocation(shader, "projection");
    shader.time = gl.getUniformLocation(shader, "time");
  }

  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  function initBuffers() {
    unitSquareVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, unitSquareVertices);
    var vertices = [
       1,  1,  0,
      -1,  1,  0,
       1, -1,  0,
      -1, -1,  0
    ];
    gl.bufferData(
      gl.ARRAY_BUFFER, 
      new Float32Array(vertices), 
      gl.STATIC_DRAW
    );
    unitSquareVertices.itemSize = 3;
    unitSquareVertices.numItems = 4;
  }

  function resizeIfNecessary(){
    widthChanged = canvas.width != window.innerWidth;
    heightChanged = canvas.height != window.innerHeight;
    if(widthChanged || heightChanged){
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function drawScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.ortho(projection, -1, 1, -1, 1, -1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, unitSquareVertices);
    gl.vertexAttribPointer(
      shader.projection, 
      unitSquareVertices.itemSize, 
      gl.FLOAT, false, 0, 0
    );
    gl.uniformMatrix4fv(shader.projection, false, projection);
    gl.uniform1f(shader.time, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, unitSquareVertices.numItems);
  }

  function incrementSimulation(){ time += timeInc; }

  return webGLStart;
})();
