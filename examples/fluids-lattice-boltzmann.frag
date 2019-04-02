precision highp float;

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;


// #version 140
uniform sampler2D FireLattice;
uniform sampler2D radianceCLUT;
uniform float a, b, radius;
uniform float width, height;
uniform float heat;
uniform float life;
uniform float turbulence;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 flickerEffect(vec2 uv) {
    float x = uv.s, y = uv.t;
    float data = 0.0;
    float r2 = radius * radius;
    if (x >= 1.0 && x < width - 2.0 && y >= 3.0 && y < height - 1.0) {
        if (x >= a - radius && x < a + radius && y >= b - radius && y < b + radius) {
            float f = (x-a) * (x-a) + (y-b) * (y-b);
            if (f < r2) {
                data = texture2D(FireLattice, vec2(x, y)).a;
                data += heat * (1.0 - f / r2);
            }
        }
        data+=texture2D(FireLattice, vec2(x  , y+1.0)).a;
        data+=texture2D(FireLattice, vec2(x-1.0, y-1.0)).a;
        data+=texture2D(FireLattice, vec2(x+1.0, y-1.0)).a;
        data+=texture2D(FireLattice, vec2(x  , y-2.0)).a;
        data = clamp(data * life / 4.0, 0.0, 1.0);
    } else {
        data = 0.0;
    }
    vec3 color2 = texture2D(radianceCLUT, vec2(0.0, data)).rgb;
    return vec4(color2, data);
}

void main() {
    // set to white
    gl_FragColor = flickerEffect(vTexcoord.st);
}
