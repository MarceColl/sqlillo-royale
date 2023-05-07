#ifdef GL_ES
precision mediump float;
#endif

in vec3 pos;

uniform vec2 u_resolution;
uniform float u_time;

vec3 colorA = vec3(5.0 / 255.0, 10.0 / 255.0, 25.0 / 255.0);
vec3 colorB = vec3(10.0 / 255.0, 90.0 / 255.0, 100.0 / 255.0);

void main() {
    float quantity = (pos.y / 2000.0) + 0.5;
    vec3 color = mix(colorA, colorB, quantity);
    gl_FragColor = vec4(color, 1.0);
}
