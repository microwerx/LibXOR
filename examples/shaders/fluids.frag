precision highp float;

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform sampler2D FluidColor;
uniform float FluidEnabled;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    // set to white
    vec3 color = vec3(0.0, 1.0, 0.0);
    if (FluidEnabled > 0.0) {
    	color = texture2D(FluidColor, vTexcoord.st).rgb;
    }
    gl_FragColor = vec4(color, 1.0);
}
