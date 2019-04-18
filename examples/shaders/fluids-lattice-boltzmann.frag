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
uniform sampler2D lb1Color;
uniform float lb1Enabled;
uniform sampler2D lb2Color;
uniform float lb2Enabled;
uniform sampler2D RadianceCLUT;
uniform float a, b, radius;
uniform float width, height;
uniform float heat;
uniform float life;
uniform float turbulence;
uniform float iTime;
uniform sampler2D SourcePattern;
uniform float renderSourcePattern;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 getL(vec2 st) {
    st /= vec2(width,height);// * 4.0;
    if (lb1Enabled > 0.0) {
        return texture2D(lb1Color, st);
    } else if (lb2Enabled > 0.0) {
        return texture2D(lb2Color, st);
    }
    return vec4(0.0);
}

vec4 flickerEffect(vec2 uv) {
    float x = uv.s, y = uv.t;
    float turb = turbulence * rand(uv + vec2(iTime, 0.0));
    float data = 0.0;
    float r2 = radius * radius;
    if (x >= 1.0 && x < width - 1.0 && y >= 3.0 && y < height - 1.0) {
        if (x >= a - radius && x < a + radius && y >= b - radius && y < b + radius) {
            float f = (x-a) * (x-a) + (y-b) * (y-b);
            if (f < r2) {
                data = getL(vec2(x, y)).a;
                float h = heat + turb;
                data += h * (1.0 - f / r2);
            }
        }
        data+=0.25*getL(vec2(x    , y+1.0)).a;
        data+=0.25*getL(vec2(x-1.0, y-1.0)).a;
        data+=0.25*getL(vec2(x+1.0, y-1.0)).a;
        data+=0.25*getL(vec2(x    , y-2.0)).a;
        data+=0.25*getL(vec2(x    , y-4.0)).a;
        data = clamp(data * life, 0.0, 4.0);
    } else {
        data = 0.0;
    }
    // data += y < 4.0 ? y * turb * 0.5 : 0.0;
    data = clamp(data * life, 0.0, 4.0);
    vec3 color2 = texture2D(RadianceCLUT, vec2(data, 0.0)).rgb;
    return vec4(color2, data);
}

void main() {
    vec2 uv = vTexcoord.st * vec2(width, height);
    vec2 turb2 = turbulence * 0.5 * (vec2(rand(uv + vec2(iTime, 0.0)),
        rand(uv + vec2(iTime, 0.0))) - 0.5);
    // set to white
    gl_FragColor = flickerEffect(uv + turb2);
    //gl_FragColor = vec4(vTexcoord.st, 0.0, 1.0);
}
