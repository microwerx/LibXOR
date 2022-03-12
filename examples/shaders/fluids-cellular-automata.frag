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

out vec4 oFragColor;

// #version 140
uniform sampler2D lb1Color;
uniform float lb1Enabled;
uniform sampler2D lb2Color;
uniform float lb2Enabled;
uniform sampler2D RadianceCLUT;
uniform float a, b, radius;
uniform float width, height;
uniform int   iCARule;
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
uniform int iMouseButtons;

const int CELLULAR_AUTOMATA = 0;
const int GAME_OF_LIFE = 1;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 getLattice(vec2 st) {
    st /= vec2(width, height);
    st = fract(st);
    if (lb1Enabled > 0.0) {
        return texture(lb1Color, st);
    } else if (lb2Enabled > 0.0) {
        return texture(lb2Color, st);
    }
    return vec4(0.0);
}

vec4 caEffect(vec2 uv) {
    float x = floor(uv.s);
    float y = floor(uv.t);
    vec4 outCell = vec4(0.0);
    float left = 0.0;
    float right = width - 0.0;
    float top = height - 0.0;
    float bottom = 0.0;
    float data = 0.0;
    if (x >= left && x <= right && y >= bottom && y <= top) {
        vec4 cCell = getLattice(vec2(x, y));
        vec4 nCell = getLattice(vec2(x, y + 1.0));
        vec4 sCell = getLattice(vec2(x, y - 1.0));
        vec4 eCell = getLattice(vec2(x + 1.0, y));
        vec4 wCell = getLattice(vec2(x - 1.0, y));

        vec4 nwCell = getLattice(vec2(x - 1.0, y + 1.0));
        vec4 neCell = getLattice(vec2(x + 1.0, y + 1.0));
        vec4 swCell = getLattice(vec2(x - 1.0, y - 1.0));
        vec4 seCell = getLattice(vec2(x + 1.0, y - 1.0));

        data = cCell.x;

        int surround = 0;
        surround += neCell.x != 0.0 ? 1 : 0;
        surround += nCell.x != 0.0 ? 2 : 0;
        surround += nwCell.x != 0.0 ? 4 : 0;
        if (true) {
            surround += eCell.x != 0.0 ? 8 : 0;
            //surround += cCell.x != 0.0 ? 16 : 0;
            surround += wCell.x != 0.0 ? 16 : 0;
            surround += seCell.x != 0.0 ? 32 : 0;
            surround += sCell.x != 0.0 ? 64 : 0;
            surround += swCell.x != 0.0 ? 128 : 0;
        }

        int test = 1 << surround;
        data = (test & iCARule) != 0 ? 1.0 : 0.0;

        if (floor(a) == x && floor(b) == y)
            return vec4(1.0, 0.0, 1.0, 1.0);
    }
    return vec4(data, 1.0, 0.0, 1.0);
}

vec4 gameOfLife(vec2 uv) {
    float x = floor(uv.s);
    float y = floor(uv.t);
    const float padding = 0.0;
    float left = padding;
    float right = width - padding;
    float top = height - padding;
    float bottom = padding;
    float data = 0.0;
    if (x >= left && x <= right && y >= bottom && y <= top) {
        vec4 cCell = getLattice(vec2(x, y));
        vec4 nCell = getLattice(vec2(x, y + 1.0));
        vec4 sCell = getLattice(vec2(x, y - 1.0));
        vec4 eCell = getLattice(vec2(x + 1.0, y));
        vec4 wCell = getLattice(vec2(x - 1.0, y));

        vec4 nwCell = getLattice(vec2(x - 1.0, y + 1.0));
        vec4 neCell = getLattice(vec2(x + 1.0, y + 1.0));
        vec4 swCell = getLattice(vec2(x - 1.0, y - 1.0));
        vec4 seCell = getLattice(vec2(x + 1.0, y - 1.0));

        data = cCell.x;

        int count = 0;
        count += (neCell.x >= life) ? 1 : 0;
        count += (nCell.x  >= life) ? 1 : 0;
        count += (nwCell.x >= life) ? 1 : 0;
        count += (eCell.x  >= life) ? 1 : 0;
        count += (wCell.x  >= life) ? 1 : 0;
        count += (seCell.x >= life) ? 1 : 0;
        count += (sCell.x  >= life) ? 1 : 0;
        count += (swCell.x >= life) ? 1 : 0;

        int me = (cCell.x != 0.0) ? 1 : 0;
        // Death
        if (count < 2 || count > 3)
            data *= heat;
        // Survival
        else if (me==1 && (count == 2 || count == 3)) data = data;
        // Birth
        else if (me==0 && count == 3) data = 1.0;

        if (iMouseButtons > 0)
        {
            if (floor(a) == x && floor(b) == y)
            {
                data = 1.0;
            }

            // Spark of life:
            vec2 l = vec2(a-x, b-y);
            if (length(l) < 5.0)
            {
                data = 1.0;
            }
        }
    }
    return vec4(data, 0.0, 0.0, 1.0);
}

void main() {
    vec2 uv = vTexcoord.st * vec2(width, height);//floor(vTexcoord.st * vec2(width+1.0, height+1.0));
    vec2 turb2 = turbulence * 0.5 * (vec2(rand(uv + vec2(iTime, 0.0)), rand(uv + vec2(iTime, 0.0))) - 0.5);

    if (iFluidType == CELLULAR_AUTOMATA) oFragColor = caEffect(uv);
    else if (iFluidType == GAME_OF_LIFE) oFragColor = gameOfLife(uv);
    else oFragColor = vec4(uv / vec2(width, height), 0.0, 1.0);
}
