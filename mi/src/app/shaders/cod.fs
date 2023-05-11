#ifdef GL_ES
precision mediump float;
#endif

in vec3 pos;

uniform vec2 u_resolution;
uniform float u_time;

vec3 color = vec3(255.0, 0.0, 0.0);
float smoothness = 30.0;
float offset = 0.0;


//  Function from Iñigo Quiles
//  www.iquilezles.org/www/articles/functions/functions.htm
float expStep( float x, float k, float n ){
    return exp( -k*pow(x,n) );
}

void main() {
    float aboveY = float(pos.y > 0.0);
    float mappedPos = (pos.y - offset)/smoothness;
    float y = expStep(mappedPos,5.,1.0);
    
    float q = clamp(y, 0.0, 1.0);
    // gl_FragColor = vec4(q, q, q, 1.0);
    gl_FragColor = mix(vec4(color, 0.0), vec4(color, aboveY), q);
}
