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

const int GBUFFER_NORMALS = 0;
const int GBUFFER_DEPTH = 1;
const int GBUFFER_TEXCOORD = 2;
const int GBUFFER_DIFFUSE_COLOR = 3;
const int GBUFFER_DIFFUSE_ROUGHNESS = 4;
const int GBUFFER_SPECULAR_COLOR = 5;
const int GBUFFER_SPECULAR_ROUGHNESS = 6;
const int GBUFFER_VIZ_NORMALS = 7;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;
in vec3 vCamera;

out vec4 oFragColor;

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

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(SunDirTo);
    float NdotL = max(0.0, dot(N, L));
    vec3 V = normalize(vCamera);
    float NdotV = 0.5 * dot(N, V) + 0.5;

    vec3 diffuseColor = ReadColor3(MapKdMix, MapKd, Kd);
    vec3 specularColor = ReadColor3(MapKsMix, MapKs, Ks);

    float diffuseRoughness = ReadScalar(MapKdRoughnessMix, MapKd, KdRoughness);
    float specularRoughness = ReadScalar(MapKsRoughnessMix, MapKs, KsRoughness);

    switch (GBufferOutputType) {
    case GBUFFER_NORMALS:
        oFragColor = vec4(0.5 * N + 0.5, 1.0);
        break;
    case GBUFFER_DEPTH:
        oFragColor = vec4(vec3(vPosition.z / 10.0), 1.0);
        break;
    case GBUFFER_DIFFUSE_COLOR:
        oFragColor = vec4(diffuseColor, 1.0);
        break;
    case GBUFFER_DIFFUSE_ROUGHNESS:
        oFragColor = vec4(vec3(diffuseRoughness), 1.0);
        break;
    case GBUFFER_SPECULAR_COLOR:
        oFragColor = vec4(specularColor, 1.0);
        break;
    case GBUFFER_SPECULAR_ROUGHNESS:
        oFragColor = vec4(vec3(specularRoughness), 1.0);
        break;
    default:
        oFragColor = vec4(1.0);
        break;
    }
}
