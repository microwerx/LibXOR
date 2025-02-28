#version 300 es
precision highp float;

uniform float ZNear;
uniform float ZFar;

// Texture Maps
uniform sampler2D MapKd;
uniform sampler2D MapKs;
uniform sampler2D MapNormal;

// Mix
uniform float MapKdMix;
uniform float MapKsMix;
uniform float MapNormalMix;
uniform float MapKdRoughnessMix;
uniform float MapKsRoughnessMix;

// Material Properties
uniform vec3 Kd;
uniform vec3 Ks;

uniform float KdRoughness;
uniform float KsRoughness;
uniform float GGX_gamma;

uniform int GBufferOutputType;
uniform float GBufferZFar;
const int Unitize = 0;

const float n1 = 1.0001;
const float n2 = 1.333;
uniform float F0;

const float one_over_pi = 1.0 / 3.14159265;
const float pi = 3.14159265;
const float two_pi = 6.28318531;
const float one_over_two_pi = 1.0 / 6.28318531;

const int GBUFFER_FACE_NORMALS = 0;
const int GBUFFER_BUMP_NORMALS = 1;
const int GBUFFER_TEXCOORD = 2;
const int GBUFFER_VERTEX_COLOR = 3;
const int GBUFFER_VIEWDIR = 4;
const int GBUFFER_REFLDIR = 5;
const int GBUFFER_HALFDIR = 6;
const int GBUFFER_NDOTL = 7;
const int GBUFFER_NDOTV = 8;
const int GBUFFER_NDOTH = 9;
const int GBUFFER_RDOTV = 10;
const int GBUFFER_DEPTH = 11;
const int GBUFFER_DIFFUSE_COLOR = 12;
const int GBUFFER_DIFFUSE_ROUGHNESS = 13;
const int GBUFFER_SPECULAR_COLOR = 14;
const int GBUFFER_SPECULAR_ROUGHNESS = 15;
const int GBUFFER_REFLECTION_COLOR = 16;
const int GBUFFER_DIFFUSE_ORENNAYAR = 17;
const int GBUFFER_DIFFUSE_DISNEY = 18;
const int GBUFFER_DIFFUSE_BIMODAL = 19;
const int GBUFFER_SPECULAR_BLINN = 20;
const int GBUFFER_SPECULAR_GGX = 21;
const int GBUFFER_SPECULAR_BIMODAL = 22;
const int GBUFFER_GOOCH = 23;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// INPUTS: These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;
in vec3 vViewDir;

// OUTPUTS: This replaces gl_FragColor
out vec4 oFragColor;

//////////////////////////////////////////////////
// D A T A   S T R U C T U R E S /////////////////
//////////////////////////////////////////////////

struct FragmentInfo {
    vec3 FaceNormal;
    vec3 N;
    vec3 V;
    vec3 R; // V reflected around N
    float NdotV;
    float NdotR;
};

struct MaterialInfo {
    vec3 c_d;
    vec3 c_s;
    float s_m;
    float s_e;
    float d_m;
    float n2;
    float F0;
    float e;
    float md_alpha;
    float ms_alpha;
};

struct LightInfo {
    vec3 L;
    vec3 E0;
    vec3 H;
    vec3 R;
    float NdotL;
    float NdotH;
    float RdotV;
    float LdotD; // dot(L, H)
};

FragmentInfo Fragment;
LightInfo Lights[16];
MaterialInfo Material;

const int SunIndex = 0;
const int MoonIndex = 1;
const int EnviroIndex = 2;

void PrepareForShading() {
    vec3 N = normalize(vNormal);
    vec3 dp1 = dFdx(vPosition);
    vec3 dp2 = dFdy(vPosition);
    Fragment.FaceNormal = normalize(cross(dp1, dp2));
    if (length(N) < 0.01) {
        N = Fragment.FaceNormal;
    }
    Fragment.N = N;
    Fragment.V = normalize(vViewDir);
    Fragment.R = normalize(reflect(Fragment.V, Fragment.N));
    Fragment.NdotV = max(0.0, dot(Fragment.N, Fragment.V));
    Fragment.NdotR = max(0.0, dot(Fragment.N, Fragment.R));
}

vec3 ReadColor3(float mixAmount, sampler2D tex, vec3 color) {
    if (mixAmount > 0.0) {
        return (1.0 - mixAmount) * color + mixAmount * texture(tex, vTexcoord.st).rgb;
    }
    return color;
}

float ReadScalar(float mixAmount, sampler2D tex, float x) {
    if (mixAmount > 0.0) {
        return (1.0 - mixAmount) * x + mixAmount * texture(tex, vTexcoord.st).a;
    }
    return x;
}

vec4 ReadColor4(float rgbmix, float amix, sampler2D tex, vec3 rgb, vec3 a)
{
    vec4 texel = texture(tex, vTexcoord.st);
    vec4 inv = vec4(1.0 - rgbmix, 1.0 - rgbmix, 1.0 - rgbmix, 1.0 - amix);
    return vec4(rgbmix, rgbmix, rgbmix, amix) * texel + inv * vec4(rgb, a);
}

vec3 CalcCubeColor(vec3 v) {
    vec3 absv = abs(v);
    vec3 signv = sign(v);
    if (absv.x > absv.y && absv.x > absv.z) {
        return signv.x < 0.0 ? vec3(0.0, 1.0, 1.0) : vec3(1.0, 0.0, 0.0);
    }
    if (absv.y > absv.x && absv.y > absv.z) {
        return signv.y < 0.0 ? vec3(1.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
    }
    return signv.z < 0.0 ? vec3(1.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0);
}

vec3 unitf(float x) {
    if (Unitize > 0)
        return vec3(0.5 * x + 0.5);
    return vec3(x);
}

vec3 unitv(vec3 v) {
    if (Unitize > 0)
        return 0.5 * v + 0.5;
    return v;
}

vec3 Li;

vec3 Lambertian(float NdotL) {
    return 1.0 / 3.14159265 * NdotL * Li;
}

vec3 Phong(float RdotV, float power) {
    return (power + 1.0) / (2.0 * 3.14159) * Li * pow(RdotV, power / 4.0);
}

vec3 Blinn(float NdotH, float power) {
    return (power + 1.0) / (2.0 * 3.14159) * Li * pow(NdotH, power);
}

vec3 BlinnNormalized(float NdotH, float power) {
    return (power + 1.0) / (2.0 * 3.14159) * Li * pow(NdotH, power);
}

float D_Blinn(float NdotH, float power) {
    return (power + 1.0) / (2.0 * 3.14159) * pow(NdotH, power);
}

float D_GGX(float NdotH) {
    float a2 = Material.ms_alpha * Material.ms_alpha;
    float a2minus1 = a2 - 1.0;
    float denom = (a2minus1) * NdotH*NdotH + 1.0;
    float numer = (GGX_gamma - 1.0) * a2minus1 / (1.0 - pow(a2, 1.0 - GGX_gamma));
    if (Material.ms_alpha >= 1.0) numer = 1.0;
    else if (GGX_gamma <= 1.0) numer = a2minus1 / log(a2);
    return one_over_pi * numer * pow(1.0 / denom, GGX_gamma);
}

float Fresnel(float cos_theta) {
    return F0 + (1.0 - F0) * (1.0 - pow(cos_theta, 5.0));
}

float lerp(float a, float b, float s) {
    return a * (1.0 - s) + b * s;
}

vec3 Specular(float roughness, float NdotL, float NdotH, float LdotH) {
    if (NdotL <= 0.0) return vec3(0.0);
    float brdf = 0.0;
    if (roughness >= 0.0) {
        float el1 = NdotH * Fragment.NdotV / LdotH;
        float el2 = NdotH * NdotL / LdotH;
        float G2 = min(1.0, min(el1, el2));
        brdf = Fresnel(LdotH) * D_Blinn(NdotH, Material.e) * G2 / (4.0 * NdotL + Fragment.NdotV);
    } else {
        // Hammon version
        float G2 = 0.5 / lerp(
            2.0 * NdotL * Fragment.NdotV,
            NdotL + Fragment.NdotV,
            abs(roughness)
        );
        G2 = clamp(G2, 0.0, 1.0);
        float D = clamp(D_GGX(NdotH), 0.0, 1.0);
        brdf = Fresnel(LdotH) * D * G2;
    }
    return brdf * Li * NdotL;
}

vec3 OrenNayar(float roughness, float LdotV, float NdotL, float NdotV) {
    float sigma2 = roughness * roughness;
    float A = 1.0 - 0.5 * sigma2 / (sigma2 + 0.33);
    float B = 0.45 * sigma2 / (sigma2 + 0.09);
    float s = LdotV - NdotL * NdotV;
    float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));
    return 1.0 / 3.14159265 * Li * max(0.0, NdotL) * (A + B * s / t);
}

vec3 Disney(float roughness, float LdotV, float NdotL, float NdotV) {
    float LdotD2 = Lights[SunIndex].LdotD * Lights[SunIndex].LdotD;
    float FD90 = 0.5 + 2.0 * roughness * LdotD2;
    float t = FD90 - 1.0;
    float c1 = pow(1.0 - NdotL, 5.0);
    float c2 = pow(1.0 - NdotV, 5.0);
    return one_over_pi * NdotL * Li * (1.0 - t * c1) * (1.0 - t * c2);
}

vec3 Gooch(vec3 N, vec3 L) {
    vec3 c_cool = vec3(0.0, 0.0, 0.55) + 0.25 * Material.c_d;
    vec3 c_warm = vec3(0.3, 0.3, 0.0) + 0.25 * Material.c_d;
    float NdotL = dot(N, L);
    float t = 0.5 + 0.5 * NdotL;
    // return c_warm * t + (1.0 - t) * c_cool;
    vec3 R = 2.0 * NdotL * N - L;
    float RdotV = dot(R, Fragment.V);
    float s = clamp(100.0 * RdotV - 97.0, 0.0, 1.0);
    return s * vec3(1.0) + (1.0 - s) * (t * c_warm + (1.0 - t) * c_cool);
}

vec3 Toon(vec3 N, vec3 L) {
    float NdotL = max(0.0, dot(N, L));
    
    float t = 0.2;
    if (NdotL < 0.1) t = 0.2;
    else if (NdotL < 0.5) t = 0.4;
    else if (NdotL < 0.7) t = 0.7;
    else t = 1.0;

    return Material.c_d * t * Gooch(N, L);
}

void main() {
    PrepareForShading();

    vec3 L = normalize(SunDirTo);
    float NdotL = max(0.0, dot(Fragment.N, L));
    vec3 R = reflect(-L, Fragment.N);
    float RdotV = max(0.0, dot(R, Fragment.V));
    vec3 H = normalize(Fragment.V + L);
    float NdotH = max(0.0, dot(Fragment.N, H));
    float LdotH = max(0.0, dot(L, H));

    Li = vec3(L.y);

    Lights[SunIndex].E0 = vec3(L.y);
    Lights[SunIndex].L = normalize(SunDirTo);
    Lights[SunIndex].R = R;
    Lights[SunIndex].NdotL = NdotL;
    Lights[SunIndex].RdotV = RdotV;
    Lights[SunIndex].NdotH = NdotH;
    Lights[SunIndex].LdotD = LdotH;

    float Z = length(vViewDir);

    Material.c_d = ReadColor3(MapKdMix, MapKd, Kd);
    Material.c_s = ReadColor3(MapKsMix, MapKs, Ks);

    float diffuseRoughness = ReadScalar(MapKdRoughnessMix, MapKd, KdRoughness);
    float specularRoughness = ReadScalar(MapKsRoughnessMix, MapKs, KsRoughness);

    Material.md_alpha = diffuseRoughness * diffuseRoughness;
    Material.ms_alpha = specularRoughness * specularRoughness;
    Material.e = 2.0 / max(Material.ms_alpha, 0.0001) - 2.0;

    float LdotV = dot(L, Fragment.V);

    float m = abs(KdRoughness);
    vec3 dcolor1 = Material.c_d * Disney(m, LdotV, NdotL, Fragment.NdotV);
    vec3 dcolor2 = Material.c_d * OrenNayar(m, LdotV, NdotL, Fragment.NdotV);
    vec3 dcolor = (KdRoughness >= 0.0) ? dcolor1 : dcolor2;

    vec3 scolor1 = Material.c_s * Specular(Material.ms_alpha, NdotL, NdotH, LdotH);
    vec3 scolor2 = Material.c_s * Specular(-Material.ms_alpha, NdotL, NdotH, LdotH);
    vec3 scolor = specularRoughness >= 0.0 ? scolor1 : scolor2;

    vec3 RL = Fragment.R;
    vec3 refl_color = CalcCubeColor(Fragment.R);
    vec3 RH = Fragment.N;
    float RNdotL = Fragment.NdotV;
    float RNdotH = 1.0;
    float RLdotH = Fragment.NdotV;
    vec3 refl_ggx = Material.c_s * refl_color * Specular(-Material.ms_alpha, RNdotL, RNdotH, RLdotH);

    vec3 color;
    switch (GBufferOutputType) {
    case GBUFFER_FACE_NORMALS:
        color = 0.5 * Fragment.FaceNormal + 0.5;
        break;
    case GBUFFER_BUMP_NORMALS:
        color = 0.5 * Fragment.N + 0.5;
        break;
    case GBUFFER_TEXCOORD:
        color = vTexcoord;
        break;
    case GBUFFER_VERTEX_COLOR:
        color = vColor;
        break;
    case GBUFFER_VIEWDIR:
        color = 0.5 * Fragment.V + 0.5;
        break;
    case GBUFFER_REFLDIR:
        color = 0.5 * Fragment.R + 0.5;
        break;
    case GBUFFER_HALFDIR:
        color = 0.5 * H + 0.5;
        break;
    case GBUFFER_NDOTL:
        color = unitf(NdotL);
        break;
    case GBUFFER_NDOTV:
        color = unitf(Fragment.NdotV);
        break;        
    case GBUFFER_NDOTH:
        color = unitf(NdotH);
        break;
    case GBUFFER_RDOTV:
        color = unitf(RdotV);
        break;
    case GBUFFER_DEPTH:
        color = vec3(Z / GBufferZFar);
        break;
    case GBUFFER_DIFFUSE_COLOR:
        color = Material.c_d;
        break;
    case GBUFFER_DIFFUSE_ROUGHNESS:
        color = vec3(Material.md_alpha);
        break;
    case GBUFFER_SPECULAR_COLOR:
        color = Material.c_s;
        break;
    case GBUFFER_SPECULAR_ROUGHNESS:
        color = vec3(Material.ms_alpha);
        break;
    case GBUFFER_REFLECTION_COLOR:
        color = NdotL * Fresnel(LdotH) * CalcCubeColor(Fragment.R);
        break;
    case GBUFFER_DIFFUSE_ORENNAYAR:
        color = dcolor1;
        break;
    case GBUFFER_DIFFUSE_DISNEY:
        color = dcolor2;
        break;
    case GBUFFER_DIFFUSE_BIMODAL:
        color = dcolor;
        break;
    case GBUFFER_SPECULAR_BLINN:
        color = scolor1;
        break;
    case GBUFFER_SPECULAR_GGX:
        color = scolor2 + clamp(refl_ggx, 0.0, 1.0);
        break;
    case GBUFFER_SPECULAR_BIMODAL:
        color = dcolor + scolor;
        break;
    case GBUFFER_GOOCH:
        color = Gooch(Fragment.N, L);
        break;
    case GBUFFER_GOOCH + 1:
        color = Toon(Fragment.N, L);
        break;
    default:
        color = vec3(1.0);
        break;
    }
    if (GBufferOutputType >= GBUFFER_DIFFUSE_ORENNAYAR) {
        const float gamma = 2.2;
        color = pow(color, vec3(1.0/gamma));
    }
    oFragColor = vec4(color, 1.0);
}
