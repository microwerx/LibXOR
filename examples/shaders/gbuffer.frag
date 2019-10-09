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

uniform int GBufferOutputType;
uniform float GBufferZFar;
const int Unitize = 0;

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
const int GBUFFER_LAMBERTIAN = 17;
const int GBUFFER_OREN_NAYER = 18;
const int GBUFFER_PHONG = 19;
const int GBUFFER_BLINN = 20;

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
    float GGX_gamma;
};

FragmentInfo Fragment;

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

vec3 OrenNayer(float roughness, float LdotV, float NdotL, float NdotV) {
    float sigma2 = roughness * roughness;
    float A = 1.0 - 0.5 * sigma2 / (sigma2 + 0.33);
    float B = 0.45 * sigma2 / (sigma2 + 0.09);
    float s = LdotV - NdotL * NdotV;
    float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));
    return 1.0 / 3.14159265 * Li * max(0.0, NdotL) * (A + B * s / t);
}

void main() {
    PrepareForShading();

    vec3 L = normalize(SunDirTo);
    float NdotL = max(0.0, dot(Fragment.N, L));
    vec3 R = reflect(-L, Fragment.N);
    float RdotV = max(0.0, dot(R, Fragment.V));
    vec3 H = normalize(Fragment.V + L);
    float NdotH = max(0.0, dot(Fragment.N, H));

    Li = vec3(L.y);

    float Z = length(vViewDir);

    vec3 diffuseColor = ReadColor3(MapKdMix, MapKd, Kd);
    vec3 specularColor = ReadColor3(MapKsMix, MapKs, Ks);

    float diffuseRoughness = ReadScalar(MapKdRoughnessMix, MapKd, KdRoughness);
    float specularRoughness = ReadScalar(MapKsRoughnessMix, MapKs, KsRoughness);

    float power = max(0.0, 2.0 / max(specularRoughness * specularRoughness, 0.0001) - 2.0);

    vec3 dcolor = diffuseColor * Lambertian(NdotL);
    float LdotV = dot(L, Fragment.V);
    vec3 oncolor = diffuseColor * OrenNayer(KdRoughness, LdotV, NdotL, Fragment.NdotV);

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
        color = diffuseColor;
        break;
    case GBUFFER_DIFFUSE_ROUGHNESS:
        color = vec3(diffuseRoughness);
        break;
    case GBUFFER_SPECULAR_COLOR:
        color = specularColor;
        break;
    case GBUFFER_SPECULAR_ROUGHNESS:
        color = vec3(specularRoughness);
        break;
    case GBUFFER_REFLECTION_COLOR:
        color = CalcCubeColor(Fragment.R);
        break;
    case GBUFFER_LAMBERTIAN:
        color = dcolor;
        break;
    case GBUFFER_OREN_NAYER:
        color = oncolor;
        break;
    case GBUFFER_PHONG:
        color = oncolor + specularColor * NdotL * Phong(RdotV, power);
        break;
    case GBUFFER_BLINN:
        color = oncolor + specularColor * NdotL * Blinn(NdotH, power);
        break;
    default:
        color = vec3(1.0);
        break;
    }
    if (GBufferOutputType >= GBUFFER_LAMBERTIAN) {
        const float gamma = 2.2;
        color = pow(color, vec3(1.0/gamma));
    }
    oFragColor = vec4(color, 1.0);
}
