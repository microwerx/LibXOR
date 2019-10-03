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

void main() {
    // set to white
    vec3 color = vec3(0.0);
    if (MapKdMix > 0.0) {
        vec3 map = texture(MapKd, vTexcoord.st).rgb;
        color += map;    
    } else {
        color += vColor;
    }
    oFragColor = vec4(color, 1.0);
}
