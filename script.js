export {}

const canvas = document.querySelector('canvas')
if(!canvas)
	throw new Error('No canvas found')
canvas.width = window.innerWidth// * devicePixelRatio
canvas.height = window.innerHeight// * devicePixelRatio

const gl = canvas.getContext('webgl2', {
	// failIfMajorPerformanceCaveat: false,
	// antialias: true,
	// powerPreference: 'high-performance',
})
if(!gl)
	throw new Error('No WebGL context found')

// gl.clearColor(0.1, 0.05, 0.1, 1)
// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

const program = gl.createProgram()
if(!program)
	throw new Error('No program found')

await Promise.all([
	linkShaderFromSource(gl, program, gl.VERTEX_SHADER, './shaders/vertex.glsl'),
	linkShaderFromSource(gl, program, gl.FRAGMENT_SHADER, './shaders/fragment.glsl'),
])

gl.linkProgram(program)
if(!gl.getProgramParameter(program, gl.LINK_STATUS))
	throw new Error(gl.getProgramInfoLog(program) || 'Program linking failed')

// gl.validateProgram(program)
// if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
// 	throw new Error(gl.getProgramInfoLog(program) || 'Program validation failed')

const triangleVertices = new Float32Array([
//	i    x,   y,   r,   g,   b,
	0,   0,  .5,   1,  .4,  .4,
	1, -.5,   0,  .4,   1,  .4,
	2,  .5,   0,  .4,  .4,   1,
	3,   0, -.5,  1,   .2,   1,
])
const triangleVertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW)

const addAttribute = getAddAttribute(gl, program)
addAttribute(triangleVertices, 4, 1, 'index')
addAttribute(triangleVertices, 4, 2, 'position')
addAttribute(triangleVertices, 4, 3, 'color')

gl.useProgram(program)

const timeUniformLocation = gl.getUniformLocation(program, 'time')
gl.uniform1f(timeUniformLocation, 0)


gl.drawArrays(
	gl.TRIANGLES, // type of vertices
	0, // skip first n vertices
	3 // draw n vertices
)
gl.drawArrays(
	gl.TRIANGLES, // type of vertices
	1, // skip first n vertices
	3 // draw n vertices
)

void function loop() {
	requestAnimationFrame((time) => {
		gl.uniform1f(timeUniformLocation, time / 1000)
		// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLES, 0, 3)
		gl.drawArrays(gl.TRIANGLES, 1, 3)
		loop()
	})
}()


/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
function getAddAttribute(gl, program) {
	const verticesOffset = Symbol('verticesOffset')
	/**
	 * @param {Float32Array} vertices
	 * @param {number} numberOfVertices
	 * @param {number} length
	 * @param {string} name
	 */
	return function addAttribute(vertices, numberOfVertices, length, name) {
		const offset = vertices[verticesOffset] || 0
		vertices[verticesOffset] = offset + length
		const vertexLength = vertices.length / numberOfVertices
		const attributeLocation = gl.getAttribLocation(program, name)
		gl.vertexAttribPointer(
			attributeLocation, // location
			length, // length of attribute
			gl.FLOAT, // type
			false, // normalized
			vertexLength * Float32Array.BYTES_PER_ELEMENT, // byte length of vertex
			offset * Float32Array.BYTES_PER_ELEMENT // offset from beginning of vertex to attribute
		)
		gl.enableVertexAttribArray(attributeLocation)
	}
}


/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {number} type
 * @param {string} path
 */
async function linkShaderFromSource(gl, program, type, path) {
	const source = await fetch(path).then(r => r.text())
	const shader = /** @type {WebGLShader} */(gl.createShader(type))
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed')
	gl.attachShader(program, shader)
}