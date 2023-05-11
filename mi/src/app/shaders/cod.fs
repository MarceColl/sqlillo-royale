#ifdef GL_ES
precision mediump float;
#endif

in vec3 pos;

uniform vec2 u_resolution;
uniform float u_time;

vec3 color = vec3(255.0, 0.0, 0.0);
float smoothness = 30.0;
float offset = 0.0;


void main() {
    float visible = float(pos.y > 0.0);
    float mappedPos = (pos.y - offset)/smoothness;
    float q = clamp(mappedPos, 0.0, 1.0);
    // gl_FragColor = vec4(q, q, q, 1.0);
    gl_FragColor = mix(vec4(color, visible), vec4(color, 0.0), q);
}
