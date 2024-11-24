// getting WebGL rendering context
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

// vertex shader. The vertex shader provides definition on how each vertex is transformed, then passed to fragment shader.
const vertexShaderSource = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    varying lowp vec4 vColor;

    void main(void) {
        gl_Position = aPosition;
        vColor = aColor;
    }
`;

// the fragment shader defines color for all pixels in the rendering.
// the fragment shader also receives interpolated data from the vertex shader as to each fragment (a/k/a pixel).
const fragmentShaderSource = `
    varying lowp vec4 vColor;

    void main(void) {
        gl_FragColor = vColor;
    }
`;

// this is to compile shaders
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// initializing shaders
function initShaderProgram(gl) {
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Error linking shader program:", gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

const shaderProgram = initShaderProgram(gl);
gl.useProgram(shaderProgram);

const programInfo = {
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
        vertexColor: gl.getAttribLocation(shaderProgram, 'aColor'),
    },
};

// defining rectangles with the overlapping positions--sizes
const rectangles = [
    {   // farthest (z = -0.6, red)
        vertices: [
            -0.8, -0.8, -0.6, 1.0, 0.0, 0.0, 1.0, // Bottom left
            0.8, -0.8, -0.6, 1.0, 0.0, 0.0, 1.0, // Bottom right
            0.8,  0.8, -0.6, 1.0, 0.0, 0.0, 1.0, // Top right
            -0.8,  0.8, -0.6, 1.0, 0.0, 0.0, 1.0, // Top left
        ]
    },
    {   // middle (z = -0.3, green)
        vertices: [
            -0.6, -0.6, -0.3, 0.0, 1.0, 0.0, 1.0, // Bottom left
            0.6, -0.6, -0.3, 0.0, 1.0, 0.0, 1.0, // Bottom right
            0.6,  0.6, -0.3, 0.0, 1.0, 0.0, 1.0, // Top right
            -0.6,  0.6, -0.3, 0.0, 1.0, 0.0, 1.0, // Top left
        ]
    },
    {   // closer (z = 0.0, blue)
        vertices: [
            -0.4, -0.4, 0.0, 0.0, 0.0, 1.0, 1.0, // bottom left
            0.4, -0.4, 0.0, 0.0, 0.0, 1.0, 1.0, // bottom right
            0.4,  0.4, 0.0, 0.0, 0.0, 1.0, 1.0, // top right
            -0.4,  0.4, 0.0, 0.0, 0.0, 1.0, 1.0, // top left
        ]
    },
    {   // closest (z = 0.3, pink)
        vertices: [
            -0.2, -0.2, 0.3, 1.0, 0.0, 1.0, 1.0, // bottom left
            0.2, -0.2, 0.3, 1.0, 0.0, 1.0, 1.0, // bottom right
            0.2,  0.2, 0.3, 1.0, 0.0, 1.0, 1.0, // top right
            -0.2,  0.2, 0.3, 1.0, 0.0, 1.0, 1.0, // top left
        ]
    }
];

// Painter's Algorithm for sorting rectangles by depth
// the Painter's Algorithm is used to sort objects that are based on depth from the viewer perspective
rectangles.sort((a, b) => a.vertices[2] - b.vertices[2]);

// buffer and draw each rectangle
function drawRectangle(rect) {
    // this creates a new buffer to store the vertex data of rectangle
    const vertexBuffer = gl.createBuffer();
    // this binds the buffer to the array_buffer target-->which makes it the active buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // transfers the the vertex data of the rectangle to the GPU
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rect.vertices), gl.STATIC_DRAW);

    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

// clearing the canvas and drawing rectangles
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

rectangles.forEach(drawRectangle);