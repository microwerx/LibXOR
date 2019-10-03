#version 300 es

uniform mat4 ProjectionMatrix;
uniform mat4 CameraMatrix;
uniform mat4 WorldMatrix;

in vec3 aPosition;
in vec3 aNormal;
in vec3 aTexcoord;
in vec3 aColor;

// These MUST match the fragment shader
out vec3 vPosition;
out vec3 vNormal;
out vec3 vTexcoord;
out vec3 vColor;
out vec3 vCamera;

void main() {
    vNormal = (WorldMatrix * vec4(aPosition, 0.0)).xyz;
    vColor = aColor;
    vTexcoord = aTexcoord;
    vec4 p = WorldMatrix * vec4(aPosition, 1.0);
    vPosition = p.xyz;
    vCamera = CameraMatrix[3].xyz;
    gl_Position = ProjectionMatrix * CameraMatrix * p;
}
