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

// Location of the cursor.
uniform float iMouseX, iMouseY, radius;
uniform float width, height;
uniform int iMouseButtons;
uniform vec3 iResolution;

uniform vec3 SunDirTo;
uniform vec3 SunE0;

// These MUST match the vertex shader
in vec3 vPosition;
in vec3 vNormal;
in vec3 vTexcoord;
in vec3 vColor;

out vec4 oFragColor;

const int FLAMES = 0;
const int LGA = 1;
const vec3 BLUE = vec3(1.0, 0.2, 0.8);

void main() {
    // set to light gray
    vec3 color = vec3(0.8, 0.8, 0.8);
	if (lb1Enabled > 0.0) {
		color = texture(lb1Color, vTexcoord.st).rgb;
	} else if (lb2Enabled > 0.0) {
		color = texture(lb2Color, vTexcoord.st).rgb;
	}

	// Mouse cursor
    vec2 uv = vTexcoord.st * iResolution.xy;
    ivec2 xy = ivec2(uv);
    ivec2 ab = ivec2(iMouseX, iMouseY);
    bool sameXY = xy == ab;
    bool mousePressed = iMouseButtons > 0;
    if (mousePressed && sameXY)
        color = vec3(1.0 - color.r, color.g, 1.0 - color.b);
    else if (!mousePressed && sameXY)
        color = vec3(color.r, 1.0 - color.g, color.b);

    oFragColor = vec4(color, 1.0);
}
