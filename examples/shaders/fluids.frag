precision highp float;

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform sampler2D lb1Color;
uniform float lb1Enabled;
uniform sampler2D lb2Color;
uniform float lb2Enabled;
uniform int iFluidType;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

const int FLAMES = 0;
const int LGA = 1;
const vec3 BLUE = vec3(0.0, 0.2, 0.8);

void main() {
    // set to white
    vec3 color = vec3(0.0, 1.0, 0.0);
    if (iFluidType == FLAMES) {
	    if (lb1Enabled > 0.0) {
	    	color = texture2D(lb1Color, vTexcoord.st).rgb;
	    } else if (lb2Enabled > 0.0) {
	    	color = texture2D(lb2Color, vTexcoord.st).rgb;
	    }
	} else if (iFluidType == LGA) {
	    // if (lb1Enabled > 0.0) {
	    // 	color = texture2D(lb1Color, vTexcoord.st).rgb;
	    // } else if (lb2Enabled > 0.0) {
	    // 	color = texture2D(lb2Color, vTexcoord.st).rgb;
	    // }

	    if (lb1Enabled > 0.0) {	    	
	    	color = BLUE * length(texture2D(lb1Color, vTexcoord.st));
	    } else if (lb2Enabled > 0.0) {
	    	color = BLUE * length(texture2D(lb2Color, vTexcoord.st));
	    }
	}
    gl_FragColor = vec4(color, 1.0);
}
