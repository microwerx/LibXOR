precision highp float;

const float FX_DEGREES_TO_RADIANS = 0.01745329;
const float FX_RADIANS_TO_DEGREES = 57.2957795;

// inspired by shadertoy
uniform vec3 iResolution; // viewport resolution
uniform float iTime; // total program time elapsed
uniform float iTimeDelta; // time since last frame
uniform int iFrame; // playback frame
uniform float iChannelTime[4]; // TODO for textures
uniform vec3 iChannelResolution[4]; // TODO for textures
uniform vec4 iMouse; // (xy: current (where Left Mouse Button is), zw: (last click))
uniform vec4 iDate; // (year, month, day, time in seconds)

// SUNFISH CONSTANTS /////////////////////////////////////////////////
const int SOLVER_MAX_ITERATIONS = 10;
const float SOLVER_MAX_ERROR = 0.01;

const int MAX_PATH_DEPTH = 10;
const int MAX_HITABLES = 16;
const int MAX_LIGHTS = 4;

const float EPSILON = 1e-6;
const vec3 XEPSILON = vec3(EPSILON, 0.0, 0.0);
const vec3 YEPSILON = vec3(0.0, EPSILON, 0.0);
const vec3 ZEPSILON = vec3(0.0, 0.0, EPSILON);

//////////////////////////////////////////////////////////////////////
// COLORS ////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

const vec3 Black = vec3(0.000, 0.000, 0.000); //Black
const vec3 Gray33 = vec3(0.333, 0.333, 0.333); //Gray33
const vec3 Gray67 = vec3(0.667, 0.667, 0.667); //Gray67
const vec3 White = vec3(1.000, 1.000, 1.000); //White
const vec3 Red = vec3(1.000, 0.000, 0.000); //Red
const vec3 Orange = vec3(0.894, 0.447, 0.000); //Orange
const vec3 Yellow = vec3(0.894, 0.894, 0.000); //Yellow
const vec3 Green = vec3(0.000, 1.000, 0.000); //Green
const vec3 Cyan = vec3(0.000, 0.707, 0.707); //Cyan
const vec3 Azure = vec3(0.000, 0.447, 0.894); //Azure
const vec3 Blue = vec3(0.000, 0.000, 1.000); //Blue
const vec3 Violet = vec3(0.447, 0.000, 0.894); //Violet
const vec3 Rose = vec3(0.894, 0.000, 0.447); //Rose
const vec3 Brown = vec3(0.500, 0.250, 0.000); //Brown
const vec3 Gold = vec3(0.830, 0.670, 0.220); //Gold
const vec3 ForestGreen = vec3(0.250, 0.500, 0.250); //ForestGreen

const int RAY_CAST = 0;
const int RAY_TRACE = 1;
const int PATH_TRACE = 2;
const int RenderMode = 0;

const int HITABLE_SPHERE = 0;
const int HITABLE_CYLINDER = 1;
const int HITABLE_PLANE = 2;
const int HITABLE_CONE = 3;
const int HITABLE_DISK = 4;
const int HITABLE_TORUS = 5;
const int HITABLE_BOX = 6;
const int HITABLE_XYRECT = 7;
const int HITABLE_XZRECT = 8;
const int HITABLE_YZRECT = 9;
const int HITABLE_SQUADRIC = 10;
const int HITABLE_MESH = 11;

const int LIGHT_POINT = 0;
const int LIGHT_DIRECTION = 1;
const int LIGHT_SPHERE = 2;

const int MATERIAL_DIFFUSE = 0;
const int MATERIAL_SPECULAR = 1;
const int MATERIAL_DIELECTRIC = 2;
const int MATERIAL_EMISSION = 3;

const int SKY_SHIRLEY = 0;
const int SKY_CUBEMAP = 1;
const int SKY_CUBEMAPBLUR = 2;
const int SKY_DAWN = 3;
const int SKY_NONE = 4;
const int iSkyMode = SKY_DAWN;

const vec3 Left = vec3(-1.0, 0.0, 0.0);
const vec3 Right = vec3(1.0, 0.0, 0.0);
const vec3 Up = vec3(0.0, 1.0, 0.0);
const vec3 Down = vec3(0.0, -1.0, 0.0);
const vec3 Forward = vec3(0.0, 0.0, 1.0);
const vec3 Backward = vec3(0.0, 0.0, -1.0);
const vec3 One = vec3(1.0, 1.0, 0.0);
const vec3 Zero = vec3(0.0, 0.0, 0.0);
const vec3 OneHalf = vec3(0.5, 0.5, 0.5);
const vec3 OneThird = vec3(1.0/3.0, 1.0/3.0, 1.0/3.0);
const vec3 OneFourth = vec3(0.25, 0.25, 0.25);
const vec3 OneFifth = vec3(1.0/5.0, 1.0/5.0, 1.0/5.0);
const vec3 TwoThirds = vec3(2.0/3.0, 2.0/3.0, 2.0/3.0);
const vec3 TwoFifths = vec3(2.0/5.0, 2.0/5.0, 2.0/5.0);
const vec3 ThreeFourths = vec3(0.75, 0.75, 0.75);
const vec3 ThreeFifths = vec3(3.0/5.0, 3.0/5.0, 3.0/5.0);
const vec3 FourFifths = vec3(4.0/5.0, 4.0/5.0, 4.0/5.0);

struct Material {
    vec3 Kd;
    vec3 Ks;
    vec3 Ke;
    float indexOfRefraction;
    float roughness;
    int type;
};

struct Hitable {
    int type;      // see HITABLE_ constants at top of file
    vec3 position; // for spheres, cylinders, and cones
    float radius;  // for spheres, cylinders, and cones
    float width;   // for rects
    float height;  // for rects, cylinders and cones
    float a;       // for torus
    float b;       // for torus
    float n;       // for superquadric ellipsoid/toroid
    float e;       // for superquadric ellipsoid/toroid
    vec3 box0;     // 
    vec3 box1;
    vec3 normal;   // for planes
    Material material;
};
    
struct Light {
    int type;
    vec3 position;
    vec3 direction;
    vec3 color;
};

struct Ray {
    vec3 origin;
    vec3 direction;
};
    
struct HitRecord {
    int i;    // which Hitable object
    float t;  // Ray = x0 + t*x1
    vec3 P;   // Point where ray intersects object
    vec3 N;   // Geometric normal
    vec3 UVW; // Texture Coordinates
    vec3 Kd;  // Object color
    int isEmissive;
};

Hitable Hitables[MAX_HITABLES];
Light Lights[MAX_LIGHTS];
int HitableCount = 0;    
int LightCount = 0;

void sfAddHitable(Hitable hitable)
{
    if (HitableCount >= MAX_HITABLES)
        return;
    for (int i = 0; i < MAX_HITABLES; i++)
    {
        if (i == HitableCount)
        {
            Hitables[i] = hitable;
            HitableCount++;
            break;
        }
    }
}

void sfAddLight(Light light)
{
    if (LightCount >= MAX_LIGHTS)
        return;
    for (int i = 0; i < MAX_LIGHTS; i++)
    {
        if (i == LightCount)
        {
            Lights[i] = light;
            LightCount++;
            break;
        }
    }
}

//////////////////////////////////////////////////////////////////////
// M A T H E M A T I C S /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


float seed = 0.0;

void srand(vec2 fragCoord) {
    seed = dot(fragCoord, vec2(12.9898,78.233));
}

float rand() {
    seed = fract(sin(seed) * 43758.5453);
    return seed;
}

    
vec3 sfRayOffset(Ray r, float t)
{
    return r.origin + t * r.direction;
}


vec3 sfRandomDirection(vec3 N)
{
    return normalize(vec3(rand(), rand(), rand()) * N);
}


bool sfSolveQuadratic(in float a, in float b, in float c, out float t1, out float t2)
{
    float discriminant = b * b - 4.0 * a * c;
    float denom = 2.0 * a;
    if (denom != 0.0 && discriminant > 0.0) {
        float s = sqrt(discriminant);
        float r1 = (-b - s) / denom;
        float r2 = (-b + s) / denom;
        if (r1 < r2) {
            t1 = r1;
            t2 = r2;
        }
        else
        {
            t1 = r2;
            t2 = r1;
        }
        return true;
    }
    return false;
}

bool sfRayIntersectSphere(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    vec3 originToCenter = r.origin - s.position;
    // solve quadratic equation
    float a = dot (r.direction, r.direction);
    float b = dot(originToCenter, r.direction);
    float c = dot(originToCenter, originToCenter) - s.radius*s.radius;
    float discriminant = b*b - a*c;
    if (discriminant > 0.0) {
        float t = (-b - sqrt(discriminant)) / a;
        if (t < tMax && t > tMin) {
            h.t = t;
            h.P = sfRayOffset(r, t);
            h.N = (h.P - s.position) / s.radius;
            return true;
        }
        t = (-b - sqrt(discriminant)) / a;
        if (t < tMax && t > tMin) {
            h.t = t;
            h.P = sfRayOffset(r, t);
            h.N = (h.P - s.position) / s.radius;
            return true;
        }
    }
    return false;
}

bool sfRayIntersect(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    // if (s.type == HITABLE_MESH) {
    //     return sfRayIntersectMesh(s, r, tMin, tMax, h);
    // }
    if (s.type == HITABLE_SPHERE) {
        return sfRayIntersectSphere(s, r, tMin, tMax, h);
    }
    // if (s.type == HITABLE_BOX) {
    //     return sfRayIntersectBox(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_PLANE) {
    //     return sfRayIntersectPlane(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_SQUADRIC) {
    //     return sfRayIntersectSuperquadric(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_DISK) {
    //     return sfRayIntersectDisk(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_CONE) {
    //     return sfRayIntersectCone(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_CYLINDER) {
    //     return sfRayIntersectCylinder(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_TORUS) {
    //     return sfRayIntersectTorus(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_XYRECT) {
    //     return sfRayIntersectXYRect(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_XZRECT) {
    //     return sfRayIntersectXZRect(s, r, tMin, tMax, h);
    // }
    // if (s.type == HITABLE_YZRECT) {
    //     return sfRayIntersectYZRect(s, r, tMin, tMax, h);
    // }
    return false;
}

//////////////////////////////////////////////////////////////////////
// F A C T O R Y /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
    

Material sfCreateMaterial(vec3 Kd, vec3 Ks, float roughness)
{
    Material m;
    m.Kd = Kd;
    m.Ks = Ks;
    m.Ke = Black;
    m.roughness = roughness;
    m.indexOfRefraction = 1.333;
    m.type = MATERIAL_DIFFUSE;
    return m;
}


Material sfCreateDiffuseMaterial(vec3 Kd, float roughness)
{
    Material m;
    m.Kd = Kd;
    m.Ks = White;
    m.Ke = Black;
    m.roughness = roughness;
    m.indexOfRefraction = 1.0;
    m.type = MATERIAL_DIFFUSE;
    return m;
}


Material sfCreateSpecularMaterial(vec3 Ks, float roughness)
{
    Material m;
    m.Kd = Black;
    m.Ks = Ks;
    m.Ke = Black;
    m.roughness = roughness;
    m.indexOfRefraction = 1.0;
    m.type = MATERIAL_SPECULAR;
    return m;
}


Material sfCreateDielectricMaterial(vec3 Kd, float indexOfRefraction)
{
    Material m;
    m.Kd = Kd;
    m.Ks = White;
    m.Ke = Black;
    m.roughness = 0.0;
    m.indexOfRefraction = indexOfRefraction;
    m.type = MATERIAL_DIELECTRIC;
    return m;
}


Material sfCreateEmissionMaterial(vec3 Ke)
{
    Material m;
    m.Kd = Black;
    m.Ks = Black;
    m.Ke = Ke;
    m.roughness = 0.0;
    m.indexOfRefraction = 1.0;
    m.type = MATERIAL_EMISSION;
    return m;
}


Ray sfCreateRay(vec3 origin, vec3 dir)
{
    Ray r;
    r.origin = origin;
    r.direction = normalize(dir);
    return r;
}


Light sfCreateLight(int type, vec3 position, vec3 direction, vec3 color)
{
    Light l;
    l.type = type;
    l.position = position;
    l.direction = direction;
    l.color = color;
    return l;
}


HitRecord sfCreateHitRecord(float t, vec3 P, vec3 N)
{
    HitRecord h;
    h.t = t;
    h.P = P;
    h.N = N;
    return h;
}


Hitable sfCreateSphere(vec3 position, float radius, Material material)
{
    Hitable h;
    h.type = HITABLE_SPHERE;
    h.position = position;
    h.radius = radius;
    h.material = material;
    return h;
}


Hitable sfCreatePlane(vec3 position, vec3 normal, Material material)
{
    Hitable h;
    h.type = HITABLE_PLANE;
    h.position = position;
    h.normal = normalize(normal);
    h.material = material;
    return h;
}

Ray sfCreateCameraRay(vec2 uv) {
    vec3 eye = vec3(0.0, 0.0, 5.0);
    vec3 center = vec3(0.0, 0.0, 0.0);
    vec3 up = vec3(0.0, 1.0, 0.0);
    float aspectRatio = iResolution.x / iResolution.y;
    float fovy = 45.0;
    
    float theta = fovy * FX_DEGREES_TO_RADIANS;
    float halfHeight = tan(theta / 2.0);
    float halfWidth = aspectRatio * halfHeight;
    float distanceToFocus = length(eye - center);
    vec3 w = normalize(eye - center);
    vec3 u = cross(up, w);
    vec3 v = cross(w, u);
    vec3 horizontal = 2.0 * distanceToFocus * halfWidth * u;
    vec3 vertical = 2.0 * distanceToFocus * halfHeight * v;
    vec3 lowerLeftCorner = eye
        - (distanceToFocus*halfWidth) * u
        - (distanceToFocus*halfHeight) * v
        - distanceToFocus * w;
    vec3 window = uv.s * horizontal + uv.t * vertical;
    return sfCreateRay(eye, lowerLeftCorner + window - eye);
}

//////////////////////////////////////////////////////////////////////
// S H A D E R S /////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

bool sfClosestHit(in Ray r, out HitRecord h)
{		
    int hit = -1;
    float t_min = 0.0;
    float t_max = 1e6;
	for (int i = 0; i < MAX_HITABLES; i++)
	{
		if (i >= HitableCount) break;
		if (sfRayIntersect(Hitables[i], r, t_min, t_max, h))
		{
            hit = i;
			t_max = h.t;
            if (Hitables[i].material.type == MATERIAL_EMISSION)
            {
                h.Kd = Hitables[i].material.Ke;
                h.isEmissive = 1;
            }
            else
            {
                h.Kd = Hitables[i].material.Kd;
                h.isEmissive = 0;
            }
		}
	}
    h.i = hit;
    if (hit < 0) return false;
    return true;
}

vec3 sfShadeSkyShirley(Ray r)
{
	float t = 0.5 * (r.direction.y + 1.0);
	return (1.0 - t) * White + t * Azure;
}


vec3 sfShadeSkyDawn(Ray r)
{
	float t = 0.5 * (r.direction.y + 1.0);
	return (1.0 - t) * Orange + t * Azure;
}


vec3 sfMissShader(Ray r)
{
    if (iSkyMode == SKY_SHIRLEY) return sfShadeSkyShirley(r);
    if (iSkyMode == SKY_DAWN)    return sfShadeSkyDawn(r);
    // if (iSkyMode == SKY_CUBEMAP) return sfShadeSkyCubeMap(r);
    // if (iSkyMode == SKY_CUBEMAPBLUR) return sfShadeSkyCubeMapBlur(r);
    return Black;
}

vec3 sfRayCast(Ray r)
{
	HitRecord h = sfCreateHitRecord(1e6, vec3(0.0), vec3(0.0));
	int hit = -1;
	float t_min = 0.0;
	float t_max = 1e6;
	vec3 Kd;
    if (!sfClosestHit(r, h))
        return sfMissShader(r);    
	for (int i = 0; i < MAX_HITABLES; i++)
	{
		if (h.i == i)
		{
            if (Hitables[i].material.type == MATERIAL_EMISSION) {
                return Hitables[i].material.Ke;
            }
            
            vec3 N = normalize(h.N);
            return Hitables[i].material.Kd * 0.5 + (0.25 * N + 0.25);// + NdotL * color;// * NdotL * color;
		}
	}
	return sfMissShader(r);
}


void sfCreateScene() {
    sfAddHitable(sfCreateSphere(vec3(0.0, 0.0, 0.0), 0.5,
                                sfCreateMaterial(Blue, White, 0.0)));
}

vec3 Sunfish(in Ray r)
{
    if (RenderMode == RAY_CAST) return sfRayCast(r);
    //if (RenderMode == RAY_TRACE) return sfRayTrace(r);
    //if (RenderMode == PATH_TRACE) return sfPathTrace(r);
    return sfMissShader(r);
}


// END SUNFISH RAY TRACER ////////////////////////////////////////////

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform vec3 sunDirTo;
uniform vec3 sunE0;

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    sfCreateScene();
    vec2 uv = vTexcoord.xy;//0.5 * vTexcoord.xy / iResolution.xy + 0.25;
    Ray cameraRay = sfCreateCameraRay(uv);
   	gl_FragColor = vec4(Sunfish(cameraRay), 1.0);
    //gl_FragColor = vec4(uv, 0.0, 1.0);

    // set to white
    //gl_FragColor = vec4(vTexcoord, 1.0);
}
