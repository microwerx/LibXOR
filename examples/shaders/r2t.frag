precision highp float;

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform sampler2D gbufferColor;
uniform sampler2D gbufferDepth;
uniform int Usinggbuffer;
uniform vec2 gbufferResolution;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;
varying vec3 vCamera;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(sunDirTo);
    float NdotL = max(0.0, dot(N, L));
    vec3 V = normalize(vCamera);
    float NdotV = 0.5 * dot(N, V) + 0.5;

    vec3 gbuf = texture2D(gbufferColor, vTexcoord.st).rgb;
    vec3 map = texture2D(map_kd, vTexcoord.st).rgb;
    // set to white
    gl_FragColor = vec4(gbuf, 1.0);
}
