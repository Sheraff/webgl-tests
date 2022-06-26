export {}

const canvas = document.querySelector('canvas')
if(!canvas)
	throw new Error('No canvas found')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const gl = canvas.getContext('webgl2', {
	failIfMajorPerformanceCaveat: false,
	antialias: true,
	powerPreference: 'high-performance',
})
if(!gl)
	throw new Error('No WebGL context found')

gl.clearColor(0.1, 0.05, 0.1, 1)
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

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

gl.validateProgram(program)
if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
	throw new Error(gl.getProgramInfoLog(program) || 'Program validation failed')

const triangleVertices = new Float32Array([
//	  x,   y, r, g, b,
	  0,  .5, 1, 0, 0,
	-.5, -.5, 0, 1, 0,
	 .5, -.5, 0, 0, 1,
])
const triangleVertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.DYNAMIC_DRAW)

const positionAttributeLocation = gl.getAttribLocation(program, 'position')
gl.vertexAttribPointer(
	positionAttributeLocation, // location
	2, // length of attribute
	gl.FLOAT, // type
	false, // normalized
	5 * Float32Array.BYTES_PER_ELEMENT, // byte length of vertex
	0 * Float32Array.BYTES_PER_ELEMENT // offset from beginning of vertex to attribute
)
gl.enableVertexAttribArray(positionAttributeLocation)

const colorAttributeLocation = gl.getAttribLocation(program, 'color')
gl.vertexAttribPointer(
	colorAttributeLocation, // location
	3, // length of attribute
	gl.FLOAT, // type
	false, // normalized
	5 * Float32Array.BYTES_PER_ELEMENT, // byte length of vertex
	2 * Float32Array.BYTES_PER_ELEMENT // offset from beginning of vertex to attribute
)
gl.enableVertexAttribArray(colorAttributeLocation)

gl.useProgram(program)
gl.drawArrays(
	gl.TRIANGLES, // type of vertices
	0, // skip first n vertices
	3 // draw n vertices
)

// void function loop() {
// 	requestAnimationFrame(() => {
// 		const colorAttributeLocation = gl.getAttribLocation(program, 'color')
// 		gl.vertexAttrib3fv(colorAttributeLocation, [0.1, 0.7, 0.2])
// 		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
// 		gl.drawArrays(gl.TRIANGLES, 0, 3)
// 		loop()
// 	})
// }()










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