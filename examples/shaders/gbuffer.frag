#version 300 es
precision highp float;

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform int GBufferOutputType;

const int GBUFFER_NORMALS = 0;
const int GBUFFER_DEPTH = 0;
const int GBUFFER_VIZ_NORMALS = 0;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;
in vec3 vCamera;

out vec4 FragColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(sunDirTo);
    float NdotL = max(0.0, dot(N, L));
    vec3 V = normalize(vCamera);
    float NdotV = 0.5 * dot(N, V) + 0.5;

    vec3 map = texture(map_kd, vTexcoord.st).rgb;
    // set to white

    switch (GBufferOutputType) {
    case GBUFFER_NORMALS:
        FragColor = vec4(0.5 * N + 0.5, 1.0);
        break;
    default:
        FragColor = vec4(1.0);
        break;
    }    
}
