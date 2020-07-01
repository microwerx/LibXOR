#version 300 es

precision highp float;

uniform float iTime;
uniform float iTimeDelta;
uniform float iFrame;
uniform vec3  iResolution;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;

out vec4 oFragColor;

const float MaxIterations = 512.0;

vec3 getColor(int index) {
    if (index == 0) return vec3(0.000, 0.000, 0.000); //Black
    if (index == 1) return vec3(0.333, 0.333, 0.333); //Gray33
    if (index == 2) return vec3(0.667, 0.667, 0.667); //Gray67
    if (index == 3) return vec3(1.000, 1.000, 1.000); //White
    if (index == 4) return vec3(1.000, 0.000, 0.000); //Red
    if (index == 5) return vec3(0.894, 0.447, 0.000); //Orange
    if (index == 6) return vec3(0.894, 0.894, 0.000); //Yellow
    if (index == 7) return vec3(0.000, 1.000, 0.000); //Green
    if (index == 8) return vec3(0.000, 0.707, 0.707); //Cyan
    if (index == 9) return vec3(0.000, 0.447, 0.894); //Azure
    if (index == 10) return vec3(0.000, 0.000, 1.000); //Blue
    if (index == 11) return vec3(0.447, 0.000, 0.894); //Violet
    if (index == 12) return vec3(0.894, 0.000, 0.447); //Rose
    if (index == 13) return vec3(0.500, 0.250, 0.000); //Brown
    if (index == 14) return vec3(0.830, 0.670, 0.220); //Gold
    if (index == 15) return vec3(0.250, 0.500, 0.250); //ForestGreen
    return vec3(0.0);
}

float mandelbrot( in vec2 c )
{
    const float TwoB = MaxIterations * 2.0;
    const float TwoBminus1 = TwoB - 1.0;
    const float B = float(TwoB) * 0.5;
    const float Bsquared = B*B;
    float iterations = 0.0;
    vec2 z  = vec2(0.0);
    for (float i = 0.0; i < TwoB; i += 1.0)
    {
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if (dot(z,z) > Bsquared)
            break;
        iterations += 1.0;
    }

    if (iterations > TwoBminus1) return 0.0;
    return iterations;
}


vec4 shader(float iTime, float iTimeDelta, float iFrame, vec3 iResolution) {
    float aspectRatio = iResolution.x / iResolution.y;
    vec2 p = (-vec2(1.0, 1.0) + 2.0 * vTexcoord.xy * vec2(aspectRatio, 1.0));
    float time = iTime + 0.5 * (1.0 / 24.0);
    float zoo = 0.62 + 0.38*cos(.07*time);
    float coa = cos(0.15*(1.0-zoo)*time);
    float sia = sin(0.15*(1.0-zoo)*time);
    zoo = pow( zoo,8.0);
    vec2 xy = vec2(p.x * coa - p.y * sia, p.x * sia + p.y * coa);
    // vec2 c = vec2(-.745, .186) + xy*zoo;    
    vec2 c = vec2(-1.5, 0.0) + xy*zoo;    
    float M = mandelbrot(c);
    if (M == 0.0) return vec4(0.0,0.0,0.0,1.0);
    float t = clamp(0.5 + 0.5*sin(0.15*M), 0.0, 1.0);
    float ft = 1.0 - fract(M/8.0);
    int color1 = int(4.0 + 8.0 * t);
    int color2 = color1 + 1;
    return vec4(vec3(ft), 1.0);
    return vec4(mix(getColor(color1), getColor(color2), ft), 1.0);
}

void main() {
    oFragColor = shader(iTime, iTimeDelta, iFrame, iResolution);
}