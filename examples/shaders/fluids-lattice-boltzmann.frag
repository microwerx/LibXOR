#version 300 es

precision highp float;

uniform sampler2D MapKd;
uniform sampler2D MapKs;
uniform sampler2D MapNormal;
uniform float MapKdMix;
uniform float MapKsMix;
uniform float MapNormalMix;
uniform vec3 Kd;
uniform vec3 Ks;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;


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
uniform float fLgaTurbulence;
uniform float fLgaDamping;
uniform float fLgaDiffusion;
uniform float fLgaUVTurbulence;
uniform float iTime;
uniform int iFluidType;
uniform int iSourceBuffer;

const int STREAMING = 0;
const int COLLIDING = 1;
const int FLAMES = 0;
const int LGA = 1;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 getLattice(vec2 st) {
    st /= vec2(width, height);
    if (lb1Enabled > 0.0) {
        return texture2D(lb1Color, st);
    } else if (lb2Enabled > 0.0) {
        return texture2D(lb2Color, st);
    }
    return vec4(0.0);
}

vec4 flickerEffect(vec2 uv) {
    float x = uv.s;
    float y = uv.t;
    float turb = turbulence * rand(uv + vec2(iTime, 0.0));
    float data = 0.0;
    float r2 = radius * radius;
    if (1>0 || x >= 1.0 && x < width - 1.0 && y >= 3.0 && y < height - 1.0) {
        if (1>0 || x >= a - radius && x < a + radius && y >= b - radius && y < b + radius) {
            float f = (x-a) * (x-a) + (y-b) * (y-b);
            if (f < r2) {
                data = getLattice(vec2(x, y)).a;
                float h = heat + turb;
                data += h * (1.0 - f / r2);
            }
        }
        data+=0.25*getLattice(vec2(x    , y-1.0)).a;
        data+=0.25*getLattice(vec2(x-1.0, y-1.0)).a;
        data+=0.25*getLattice(vec2(x+1.0, y-1.0)).a;
        data+=0.25*getLattice(vec2(x    , y-2.0)).a;
        data+=0.25*getLattice(vec2(x    , y-4.0)).a;
        data = clamp(data * life, 0.0, 4.0);
    } else {
        data = 0.0;
    }
    // data += y < 4.0 ? y * turb * 0.5 : 0.0;
    data = clamp(data * life, 0.0, 4.0);
    vec3 color2 = texture2D(RadianceCLUT, vec2(data, 0.0)).rgb;
    return vec4(color2, data);
}

vec4 lgaEffect(vec2 uv, int step) {
    float x = floor(uv.s);
    float y = floor(uv.t);
    vec4 outCell = vec4(0.0);
    float left = 4.0;
    float right = width - 4.0;
    float top = height - 4.0;
    float bottom = 4.0;
    if (x >= left && x <= right && y >= bottom && y <= top) {
        vec4 inCell = getLattice(vec2(x, y));
        vec4 nCell = getLattice(vec2(x, y + 1.0));
        vec4 sCell = getLattice(vec2(x, y - 1.0));
        vec4 eCell = getLattice(vec2(x + 1.0, y));
        vec4 wCell = getLattice(vec2(x - 1.0, y));

        vec4 nwCell = getLattice(vec2(x - 1.0, y + 1.0));
        vec4 neCell = getLattice(vec2(x + 1.0, y + 1.0));
        vec4 swCell = getLattice(vec2(x - 1.0, y - 1.0));
        vec4 seCell = getLattice(vec2(x + 1.0, y - 1.0));

        // cell contents
        // r = particles moving North
        // g = particles moving South
        // b = particles moving East
        // a = particles moving West

        if (step == STREAMING) {
            float turb = fLgaTurbulence * rand(uv + vec2(iTime, 0.0));

            // streaming in
            float movingN = sCell.r + turb;
            float movingS = nCell.g + turb;
            float movingE = wCell.b + turb;
            float movingW = eCell.a + turb;

            //movingN = fLgaDiffusion * movingN + (1.0 - fLgaDiffusion) * length(nwCell + neCell + swCell + seCell);
            
            outCell = fLgaDamping * vec4(movingN, movingS, movingE, movingW);
        }
        else if (step == COLLIDING) {
            // find out the number of head on collisions
            float movingN = inCell.r;
            float movingS = inCell.g;
            float movingE = inCell.b;
            float movingW = inCell.a;

            // If at bounds, reverse direction
            if (x == left) { movingE += movingW; movingW = 0.0; }
            if (x == right){ movingW += movingE; movingE = 0.0; }
            if (y == top) { movingS += movingN; movingN = 0.0; }
            if (y == bottom) { movingN += movingS; movingS = 0.0; }

            float leavingN = 0.0;
            float leavingS = 0.0;
            float leavingE = 0.0;
            float leavingW = 0.0;

            // divide collisions from east-west particles to move north south
            float changingEW = min(movingN, movingS);
            leavingE += changingEW;
            leavingW += changingEW;

            // divide collisions from north-south particles to move east-west
            float changingNS = min(movingE, movingW);
            leavingN += changingNS;
            leavingS += changingNS;

            // preserve the remaining particle paths
            if (movingN >= movingS) {
                leavingN += movingN - movingS;
            } else if (movingS > movingN) {
                leavingS += movingS - movingN;
            }

            if (movingE >= movingW) {
                leavingE += movingE - movingW;
            } else if (movingW > movingE) {
                leavingW += movingW - movingE;
            }

            // mingle the particles
            float a = fLgaDiffusion;
            float b = 1.0 - fLgaDiffusion;
            float avg = 0.25 * (b*leavingN + b*leavingS + b*leavingE + b*leavingW);
            leavingN = a * leavingN + avg;
            leavingS = a * leavingS + avg;
            leavingE = a * leavingE + avg;
            leavingW = a * leavingW + avg;

            // // If at bounds, reverse direction
            if (x == left) { leavingE += leavingW; leavingW = 0.0; }
            if (x == right){ leavingW += leavingE; leavingE = 0.0; }
            if (y == top) { leavingS += leavingN; leavingN = 0.0; }
            if (y == bottom) { leavingN += leavingS; leavingS = 0.0; }

            outCell = vec4(leavingN, leavingS, leavingE, leavingW);
        }
    }
    return outCell;
}

void main() {
    vec2 uv = vTexcoord.st * vec2(width, height);//floor(vTexcoord.st * vec2(width+1.0, height+1.0));
    vec2 turb2 = turbulence * 0.5 * (vec2(rand(uv + vec2(iTime, 0.0)),
        rand(uv + vec2(iTime, 0.0))) - 0.5);

    if (iFluidType == FLAMES) oFragColor = flickerEffect(uv + turb2);
    else if (iFluidType == LGA) oFragColor = lgaEffect(uv + fLgaUVTurbulence * turb2, iSourceBuffer);
    else oFragColor = vec4(uv / vec2(width, height), 0.0, 1.0);
}
