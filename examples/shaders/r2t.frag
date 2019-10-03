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

uniform sampler2D gbufferColor;
uniform sampler2D gbufferDepth;
uniform float gbufferEnabled;
uniform vec2 gbufferResolution;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;
in vec3 vCamera;

out vec4 oFragColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(SunDirTo);
    float NdotL = max(0.0, dot(N, L));
    vec3 V = normalize(vCamera);
    float NdotV = 0.5 * dot(N, V) + 0.5;

    vec2 st = vec2(vTexcoord.s, 1.0 - vTexcoord.t);

    vec3 gbuf = texture(gbufferColor, st).rgb;
    vec3 map = texture(MapKd, st).rgb;
    
    // set to white
    oFragColor = vec4(gbufferEnabled > 0.0 ? gbuf : map, 1.0);
    // oFragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
