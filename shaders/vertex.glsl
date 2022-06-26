#define M_PI 3.1415926535897932384626433832795

precision mediump float;

attribute vec2 position;
attribute vec3 color;
varying vec3 fragColor;

uniform float time;

float normalizeTrig(float x) {
	return (x + 1.0) * 0.5;
}

void main() {
	float r = color[0] * normalizeTrig(sin(time));
	float g = color[1] * normalizeTrig(sin(time + M_PI / 1.5));
	float b = color[2] * normalizeTrig(sin(time + M_PI / 0.75));
	fragColor = vec3(r, g, b);
	gl_Position = vec4(position, 0.0, 1.0);
}