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

uniform sampler2D lb1Color;
uniform float lb1Enabled;
uniform sampler2D lb2Color;
uniform float lb2Enabled;
uniform int iFluidType;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;

const int FLAMES = 0;
const int LGA = 1;
const vec3 BLUE = vec3(1.0, 0.2, 0.8);

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
    oFragColor = vec4(color, 1.0);
}
