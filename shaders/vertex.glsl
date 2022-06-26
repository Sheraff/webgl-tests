#define M_PI 3.1415926535897932384626433832795

precision mediump float;

attribute vec2 position;
attribute vec3 color;
attribute float index;
varying vec3 fragColor;

uniform float time;

float normalizeTrig(float x) {
	return (x + 1.0) * 0.5;
}

void main() {
	float offset = index * M_PI / 4.0;
	float r = color[0] * normalizeTrig(sin(time + offset));
	float g = color[1] * normalizeTrig(sin(time - offset + M_PI * 1.0 / 3.0));
	float b = color[2] * normalizeTrig(sin(time + offset + M_PI * 2.0 / 3.0));
	fragColor = vec3(r, g, b);
	gl_Position = vec4(position, 0.0, 1.0);
}