uniform mat4 ProjectionMatrix;
uniform mat4 CameraMatrix;
uniform mat4 WorldMatrix;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTexcoord;
attribute vec3 aColor;

// These MUST match the fragment shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    vNormal = (WorldMatrix * vec4(aPosition, 0.0)).xyz;
    vColor = aColor;
    vTexcoord = aTexcoord;
    vec4 p = WorldMatrix * vec4(aPosition, 1.0);
    vPosition = p.xyz;
    gl_Position = ProjectionMatrix * CameraMatrix * p;
}
