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
uniform float fRDDA;
uniform float fRDDB;
uniform float fRDFeedRate;
uniform float fRDKillRate;
uniform float iTime;
uniform int iFluidType;
uniform int iSourceBuffer;
uniform int iMouseButtons;

const int CELLULAR_AUTOMATA = 0;
const int GAME_OF_LIFE = 1;
const int REACTION_DIFFUSION = 2;
const int SQUARE_CELLULAR_AUTOMATA = 3;
const int INTERGALACTIC_LIFE = 4;
const int REACTION_DIFFUSION2 = 5;
const int CLEAR_TO_ONE = 6;
const int CLEAR_TO_ZERO = 7;
const int CLEAR_TO_TURB = 8;

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

// Ordered by 3x3 matrix order.
const int NW = 0;
const int W = 1;
const int SW = 2;
const int N = 3;
const int C = 4;
const int S = 5;
const int NE = 6;
const int E = 7;
const int SE = 8;
const int NUM_DIRS = 9;

vec4 fetch(in ivec2 st, ivec2 offset) {
    vec2 uv = fract(vec2(st + offset) / vec2(width, height));
    if (lb1Enabled > 0.0) {
        return texture(lb1Color, uv);
    } else if (lb2Enabled > 0.0) {
        return texture(lb2Color, uv);
    }
}

vec4 fetch2(in ivec2 st, ivec2 offset, ivec2 origin, ivec2 size) {
    ivec2 st2 = st + offset;
    st2 %= size;
    st2 += origin;
    if (lb1Enabled > 0.0) {
        return texelFetch(lb1Color, st2, 0);
    } else if (lb2Enabled > 0.0) {
        return texelFetch(lb2Color, st2, 0);
    }
}

void getLatticeCellsClamp(in ivec2 st, out vec4 cells[9]) {
    if (lb1Enabled > 0.0) {
        cells[C]  = texelFetchOffset(lb1Color, st, 0, ivec2( 0,  0));
        cells[E]  = texelFetchOffset(lb1Color, st, 0, ivec2( 1,  0));
        cells[W]  = texelFetchOffset(lb1Color, st, 0, ivec2(-1,  0));
        cells[N]  = texelFetchOffset(lb1Color, st, 0, ivec2( 0,  1));
        cells[S]  = texelFetchOffset(lb1Color, st, 0, ivec2( 0, -1));
        cells[NE] = texelFetchOffset(lb1Color, st, 0, ivec2( 1,  1));
        cells[NW] = texelFetchOffset(lb1Color, st, 0, ivec2(-1,  1));
        cells[SE] = texelFetchOffset(lb1Color, st, 0, ivec2( 1, -1));
        cells[SW] = texelFetchOffset(lb1Color, st, 0, ivec2(-1, -1));
    } else if (lb2Enabled > 0.0) {
        cells[C]  = texelFetchOffset(lb2Color, st, 0, ivec2( 0,  0));
        cells[E]  = texelFetchOffset(lb2Color, st, 0, ivec2( 1,  0));
        cells[W]  = texelFetchOffset(lb2Color, st, 0, ivec2(-1,  0));
        cells[N]  = texelFetchOffset(lb2Color, st, 0, ivec2( 0,  1));
        cells[S]  = texelFetchOffset(lb2Color, st, 0, ivec2( 0, -1));
        cells[NE] = texelFetchOffset(lb2Color, st, 0, ivec2( 1,  1));
        cells[NW] = texelFetchOffset(lb2Color, st, 0, ivec2(-1,  1));
        cells[SE] = texelFetchOffset(lb2Color, st, 0, ivec2( 1, -1));
        cells[SW] = texelFetchOffset(lb2Color, st, 0, ivec2(-1, -1));
    }
}

void getLatticeCells(in ivec2 st, out vec4 cells[9]) {
    cells[NW] = fetch(st, ivec2(-1,  1));
    cells[W]  = fetch(st, ivec2(-1,  0));
    cells[SW] = fetch(st, ivec2(-1, -1));
    cells[N]  = fetch(st, ivec2( 0,  1));
    cells[C]  = fetch(st, ivec2( 0,  0));
    cells[S]  = fetch(st, ivec2( 0, -1));
    cells[NE] = fetch(st, ivec2( 1,  1));
    cells[E]  = fetch(st, ivec2( 1,  0));
    cells[SE] = fetch(st, ivec2( 1, -1));
}

void getLatticeCells2(in ivec2 st, out vec4 cells[9], ivec2 origin, ivec2 size) {
    cells[NW] = fetch2(st, ivec2(-1,  1), origin, size);
    cells[W]  = fetch2(st, ivec2(-1,  0), origin, size);
    cells[SW] = fetch2(st, ivec2(-1, -1), origin, size);
    cells[N]  = fetch2(st, ivec2( 0,  1), origin, size);
    cells[C]  = fetch2(st, ivec2( 0,  0), origin, size);
    cells[S]  = fetch2(st, ivec2( 0, -1), origin, size);
    cells[NE] = fetch2(st, ivec2( 1,  1), origin, size);
    cells[E]  = fetch2(st, ivec2( 1,  0), origin, size);
    cells[SE] = fetch2(st, ivec2( 1, -1), origin, size);
}

const vec2 padding0 = vec2(0.0, 0.0);
const vec2 padding4 = vec2(4.0, 4.0);

bool inside(vec2 xy, vec2 padding) {
    float left = padding.x;
    float right = width - padding.x;
    float top = height - padding.y;
    float bottom = padding.y;
    if (xy.x >= left && xy.x <= right && xy.y >= bottom && xy.y <= top) {
        return true;
    }
    return false;
}

vec4 caEffect(vec2 uv, ivec2 xy) {
    vec4 outCell = vec4(0.0);
    float data = 0.0;
    if (inside(uv, padding0)) {
        vec4 cells[NUM_DIRS];
        getLatticeCells(xy, cells);

        data = cells[C].x;

        int surround = 0;
        surround += cells[NE].x != 0.0 ? 1 : 0;
        surround += cells[N].x != 0.0 ? 2 : 0;
        surround += cells[NW].x != 0.0 ? 4 : 0;
        // surround += cells[E].x != 0.0 ? 8 : 0;
        // //surround += cCell.x != 0.0 ? 16 : 0;
        // surround += cells[W].x != 0.0 ? 16 : 0;
        // surround += cells[SE].x != 0.0 ? 32 : 0;
        // surround += cells[S].x != 0.0 ? 64 : 0;
        // surround += cells[SW].x != 0.0 ? 128 : 0;

        int test = 1 << surround;
        data = (test & iCARule) != 0 ? 1.0 : 0.0;
    }
    return vec4(data, 0.0, data, 1.0);
}

vec4 caEffectFlip(vec2 uv, ivec2 xy) {
    vec4 outCell = vec4(0.0);
    float data = 0.0;
    int heightOverTwo = int(height)/2;
    ivec2 size = ivec2(width, heightOverTwo);
    ivec2 origin = ivec2(0, 0);
    if (xy.y > 1) {
        // Scroll
        data = fetch2(xy, ivec2(0, -1), origin, size).r;
    }
    else
    {
        // Calc new numbers
        float cell1 = fetch2(xy, ivec2(-1, 0), origin, size).x;
        float cell2 = fetch2(xy, ivec2( 0, 0), origin, size).x;
        float cell3 = fetch2(xy, ivec2( 1, 0), origin, size).x;

        int surround = 0;
        surround += cell1 != 0.0 ? 1 : 0;
        surround += cell2 != 0.0 ? 2 : 0;
        surround += cell3 != 0.0 ? 4 : 0;

        int test = 1 << surround;
        data = (test & iCARule) != 0 ? 1.0 : 0.0;
    }
    return vec4(data, 0.0, data, 1.0);
}

float hasbit(int bit) {
    int bitmask = 1 << (bit-1);
    if ((iCARule & bitmask) != 0) return 1.0;
    return 0.0;
}

vec4 caEffect2D(vec2 uv, ivec2 xy) {
    vec4 outCell = vec4(0.0);
    float data = 0.0;
    if (inside(uv, padding0)) {
        vec4 cells[NUM_DIRS];
        getLatticeCells(xy, cells);

        data = cells[C].x;

        int count = 0;
        // count += cells[NE].x != 0.0 ? 1 : 0;
        count += cells[N].x != 0.0 ? 1 : 0;
        // count += cells[NW].x != 0.0 ? 1 : 0;
        count += cells[E].x != 0.0 ? 1 : 0;
        count += cells[W].x != 0.0 ? 1 : 0;
        // count += cells[SE].x != 0.0 ? 1 : 0;
        count += cells[S].x != 0.0 ? 1 : 0;
        // count += cells[SW].x != 0.0 ? 1 : 0;


        float Avalues[5] = float[](hasbit(5), hasbit(4), hasbit(3), hasbit(2), hasbit(1));
        float Bvalues[5] = float[](hasbit(10), hasbit(9), hasbit(8), hasbit(7), hasbit(6));
        if (data == 0.0) {
            data = Avalues[count];
        }
        else {
            data = Bvalues[count];
        }
    }
    return vec4(data, 0.0, data, 1.0);
}

vec4 gameOfLife(vec2 uv, ivec2 xy) {
    float data = 0.0;
    float alive = 0.0;
    float blue = 0.0;
    if (inside(uv, padding0)) {
        vec4 cells[NUM_DIRS];
        getLatticeCells(xy, cells);

        data = cells[C].x;
        alive = cells[C].y;
        blue = cells[C].z;

        int count = 0;
        count += (cells[NE].x >= life) ? 1 : 0;
        count += (cells[N].x  >= life) ? 1 : 0;
        count += (cells[NW].x >= life) ? 1 : 0;
        count += (cells[E].x  >= life) ? 1 : 0;
        count += (cells[W].x  >= life) ? 1 : 0;
        count += (cells[SE].x >= life) ? 1 : 0;
        count += (cells[S].x  >= life) ? 1 : 0;
        count += (cells[SW].x >= life) ? 1 : 0;

        int me = (cells[C].x >= life) ? 1 : 0;
        alive *= heat;

        // Death
        if (count < 2 || count > 3)
        {
            data = 0.0;
            alive = 0.0;
        }
        // Survival
        else if (me==1 && (count == 2 || count == 3))
        {
            data = data;
        }
        // Birth
        else if (me==0 && count == 3)
        {
            data = 1.0;
            alive = 1.0;
        }

        if (iMouseButtons > 0)
        {
            float x = float(xy.x);
            float y = float(xy.y);
            if (floor(a) == x && floor(b) == y)
            {
                data = 1.0;
                alive = 1.0;
            }

            // Spark of life:
            vec2 l = vec2(a-x, b-y);
            if (length(l) < 5.0)
            {
                data = 1.0;
                alive = 1.0;
            }
        }
    }
    return vec4(data, alive, blue, 1.0);
}

float laplacian(mat3 X) {
    const mat3 laplacianKernel = mat3(0.05, 0.2, 0.05, 0.2, -1.0, 0.2, 0.05, 0.2, 0.05);
    //const mat3 laplacianKernel = mat3(0.00, 0.25, 0.0, 0.25, -1.0, 0.25, 0.0, 0.25, 0.0);
    mat3 prodX = matrixCompMult(laplacianKernel, X);
    float sum = 0.0;
    for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++)
        sum += prodX[i][j];
    return sum;
}

vec4 reactionDiffusion(vec2 uv, ivec2 xy) {
    float alive = 0.0;
    float A = 0.0;
    float B = 0.0;
    if (inside(uv, padding0)) {
        vec4 cells[NUM_DIRS];
        getLatticeCells(xy, cells);

        // Pixels are stored in the matrix as follows:
        // [ C[0] C[3] C[6] ]   [ C[NW] C[N] C[NE] ]
        // [ C[1] C[4] C[7] ] = [ C[W]  C[C] C[W]  ]
        // [ C[2] C[5] C[8] ]   [ C[SW] C[S] C[SW] ]
        mat3 pixelsA = mat3(cells[0].x, cells[1].x, cells[2].x, cells[3].x, cells[4].x, cells[5].x, cells[6].x, cells[7].x, cells[8].x);
        mat3 pixelsB = mat3(cells[0].y, cells[1].y, cells[2].y, cells[3].y, cells[4].y, cells[5].y, cells[6].y, cells[7].y, cells[8].y);

        // A is the concentration of substance A.
        A = cells[4].x;
        // B is the concentration of substance B.
        B = cells[4].y;
        // Gray-Scott method:
        // f = feed rate
        // k = kill rate
        // pA/pt = D_a laplacian(A) - AB^2 + f(1 - A)
        // pB/pt = D_b laplacian(B) + AB^2 - (k + f) B
        float laplacianA = laplacian(pixelsA);
        float laplacianB = laplacian(pixelsB);
        // Calculate partial derivatives.
        float pA_pt = fRDDA * laplacianA - A*B*B + fRDFeedRate * (1.0 - A);
        float pB_pt = fRDDB * laplacianB + A*B*B - (fRDKillRate + fRDFeedRate) * B;
        // Update concentrations for A and B with a timestep of dt = 1.0.
        A += pA_pt;
        B += pB_pt;

        A = clamp(A, 0.0, 1.0);
        B = clamp(B, 0.0, 1.0);

        if (iMouseButtons > 0)
        {
            float x = float(xy.x);
            float y = float(xy.y);
            if (floor(a) == x && floor(b) == y)
            {
                A = 0.0;
                B = 1.0;
            }

            // Spark of life:
            vec2 l = vec2(a-x, b-y);
            if (length(l) < radius)
            {
                A = 0.0;
                B = 1.0;
            }
        }
    }
    return vec4(A, B, C, 1.0);
}

vec4 reactionDiffusion2(vec2 uv, ivec2 xy) {
    float alive = 0.0;
    float A = 0.0;
    float B = 0.0;
    float C = 0.0;
    if (inside(uv, padding0)) {
        vec4 cells[NUM_DIRS];
        getLatticeCells(xy, cells);

        // Pixels are stored in the matrix as follows:
        // [ C[0] C[3] C[6] ]   [ C[NW] C[N] C[NE] ]
        // [ C[1] C[4] C[7] ] = [ C[W]  C[C] C[W]  ]
        // [ C[2] C[5] C[8] ]   [ C[SW] C[S] C[SW] ]
        mat3 pixelsA = mat3(cells[0].x, cells[1].x, cells[2].x, cells[3].x, cells[4].x, cells[5].x, cells[6].x, cells[7].x, cells[8].x);
        mat3 pixelsB = mat3(cells[0].y, cells[1].y, cells[2].y, cells[3].y, cells[4].y, cells[5].y, cells[6].y, cells[7].y, cells[8].y);

        vec3 ch = vec3(0.0);
        ch.xy = vec2(cells[1].z, cells[3].z) - cells[4].z;
        ch += (cells[1] + cells[3] + cells[5] + cells[7] - 4.0 * cells[4]).xyz * 0.01;

        // A is the concentration of substance A.
        A = cells[4].x;
        // B is the concentration of substance B.
        B = cells[4].y;
        // Gray-Scott method:
        // f = feed rate
        // k = kill rate
        // pA/pt = D_a laplacian(A) - AB^2 + f(1 - A)
        // pB/pt = D_b laplacian(B) + AB^2 - (k + f) B
        float laplacianA = laplacian(pixelsA);
        float laplacianB = laplacian(pixelsB);
        // Calculate partial derivatives.
        float pA_pt = 0.01*fRDDA * laplacianA;// + fRDFeedRate * (1.0 - A);
        float pB_pt = 0.01*fRDDB * laplacianB;// - (fRDKillRate + fRDFeedRate) * B;
        // Update concentrations for A and B with a timestep of dt = 1.0.
        A += pA_pt + ch.x;
        B += pB_pt + ch.y;
        C += ch.z;

        A = clamp(A, 0.0, 1.0);
        B = clamp(B, 0.0, 1.0);

        if (iMouseButtons > 0)
        {
            float x = float(xy.x);
            float y = float(xy.y);
            if (floor(a) == x && floor(b) == y)
            {
                A = 0.0;
                B = 1.0;
            }

            // Spark of life:
            vec2 l = vec2(a-x, b-y);
            if (length(l) < radius)
            {
                A = 0.0;
                B = 1.0;
            }
        }
    }
    return vec4(A, B, C, 1.0);
}

void main() {
    vec2 uv = vTexcoord.st * vec2(width, height);//floor(vTexcoord.st * vec2(width+1.0, height+1.0));
    vec2 turb2 = turbulence * 0.5 * (vec2(rand(uv + vec2(iTime, 0.0)), rand(uv + vec2(iTime, 0.0))) - 0.5);
    ivec2 xy = ivec2(floor(uv));
    ivec2 ab = ivec2(floor(vec2(a, b)));

    if (iFluidType == CELLULAR_AUTOMATA) oFragColor = caEffect(uv, xy);
    else if (iFluidType == GAME_OF_LIFE) oFragColor = gameOfLife(uv, xy);
    else if (iFluidType == REACTION_DIFFUSION) oFragColor = reactionDiffusion(uv, xy);
    else if (iFluidType == REACTION_DIFFUSION2) oFragColor = reactionDiffusion2(uv, xy);
    else if (iFluidType == SQUARE_CELLULAR_AUTOMATA) oFragColor = caEffect2D(uv, xy);
    else if (iFluidType == INTERGALACTIC_LIFE) {
        //uv = vec2(vTexcoord.s, 1.0 - vTexcoord.t) * vec2(width, height);
        int heightOverTwo = int(height)/2;
        if (xy.y < int(height-1.0) && xy.y > heightOverTwo) oFragColor = gameOfLife(uv, xy);
        if (xy.y <= heightOverTwo) oFragColor = caEffectFlip(uv, xy);
        //float oldcell = fetch(xy, ivec2(0, 0)).x;
        //if (oldcell != oFragColor.x)
        if (oFragColor.x == 1.0) {
            oFragColor.z = 1.0;
        } else {
            oFragColor.z *= heat;
        }
    }
    // else if (iFluidType == CLEAR_TO_ZERO) oFragColor = vec4(0.0, 0.0, 0.0, 1.0);
    // else if (iFluidType == CLEAR_TO_ONE) oFragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // else if (iFluidType == CLEAR_TO_TURB) oFragColor = vec4(turb2.x, uv / vec2(width, height), 1.0);
    else oFragColor = vec4(turb2.x, uv / vec2(width, height), 1.0);

    bool sameXY = xy == ab;
    bool mousePressed = iMouseButtons > 0;
    if (mousePressed && sameXY)
        oFragColor = vec4(1.0, 0.0, 1.0, 1.0);
    if (sameXY)
        oFragColor.z = 1.0;
}
