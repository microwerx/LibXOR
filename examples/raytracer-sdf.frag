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

uniform float fSigma2;

// LibXOR Standard Uniforms

uniform sampler2D map_kd;
uniform sampler2D map_ks;
uniform sampler2D map_normal;
uniform float map_kd_mix;
uniform float map_ks_mix;
uniform float map_normal_mix;
uniform vec3 kd;
uniform vec3 ks;

uniform vec3 uSunDirTo;
uniform vec3 uSunE0;

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
const vec3 UglyMagenta = vec3(1.0, 0.0, 1.0); // Ugly Magenta

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
const int SKY_CIECLEAR = 4;
const int SKY_CIEOVERCAST = 5;
const int SKY_NONE = 6;
// const int iSkyMode = SKY_CIECLEAR;
uniform int iSkyMode;

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
    float t;  // Ray = O + tD
    vec3 P;   // Point where ray intersects object
    vec3 N;   // Geometric normal
    vec3 UVW; // Texture Coordinates
    vec3 Kd;  // Object color
    int isEmissive;
};

struct Payload {
    int count;
    int anyhit;
    Ray rays[MAX_PATH_DEPTH];
    HitRecord hitRecords[MAX_PATH_DEPTH];
};

Hitable Hitables[MAX_HITABLES];
Light Lights[MAX_LIGHTS];
Payload payload;
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
    m.Kd = ArneBlack;
    m.Ks = ArneBlack;
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


Hitable sfCreateDisk(vec3 position, vec3 normal, float radius, Material material)
{
    Hitable h;
    h.type = HITABLE_DISK;
    h.position = position;
    h.normal = normalize(normal);
    h.radius = radius;
    h.material = material;
    return h;
}


Hitable sfCreateCylinder(vec3 position, float radius, float height, Material material)
{
    Hitable h;
    h.type = HITABLE_CYLINDER;
    h.position = position;
    h.radius = radius;
    h.height = height;
    h.material = material;
    return h;
}


Hitable sfCreateCone(vec3 position, float radius, float height, Material material)
{
    Hitable h;
    h.type = HITABLE_CONE;
    h.position = position;
    h.radius = radius;
    h.height = height;
    h.material = material;
    return h;
}


Hitable sfCreateTorus(vec3 position, float radiusA, float radiusB, Material material)
{
    Hitable h;
    h.type = HITABLE_TORUS;
    h.position = position;
    h.a = radiusA; // theoretically, we could support ellipses
    h.b = radiusB; // and a is x-axis, b is y-axis
    h.material = material;
    return h;
}


Hitable sfCreateSuperquadric(vec3 position, float radius, float n, float e, Material material)
{
    Hitable h;
    h.type = HITABLE_SQUADRIC;
    h.position = position;
    h.radius = radius;
    h.n = 2.0/n;
    h.e = 2.0/e;
    h.material = material;
    return h;
}


Hitable sfCreateBox(vec3 position, vec3 p1, vec3 p2, Material material)
{
    Hitable h;
    h.type = HITABLE_BOX;
    h.position = position;
    h.box0 = min(p1, p2);
    h.box1 = max(p1, p2);
    h.material = material;
    return h;
}


Hitable sfCreateRect(int type, vec3 position, vec3 p1, vec3 p2, Material material)
{
    Hitable h;
    h.type = type;
    h.position = position;
    h.box0 = min(p1, p2);
    h.box1 = max(p1, p2);
    h.material = material;
    return h;
}


Hitable sfCreateMesh(vec3 position, Material material)
{
    Hitable h;
    h.type = HITABLE_MESH;
    h.position = position;
    h.material = material;
    return h;
}


//////////////////////////////////////////////////////////////////////
// I N T E R S E C T I O N S /////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


bool sfAnyHitSphere(Ray r, vec3 position, float radius, float thickness)
{
    vec3 O = r.origin - position;
    vec3 D = r.direction;
    float a = dot(D,D);
    float b = dot(O,D);
    float c = dot(O,O) - radius*radius;
    float t1, t2;
    if (!sfSolveQuadratic(a, b, c, t1, t2)) return false;
    // DEBUG: ignore the slabs for now...
    return true;
    if (t1 > 0.0) {
        vec3 p = sfRayOffset(r, t1);
        if (p.y > position.y + thickness) return false;
        if (p.y < position.y - thickness) return false;
    }
    if (t2 > 0.0) {
        vec3 p = sfRayOffset(r, t2);
        if (p.y > position.y + thickness) return false;
        if (p.y < position.y - thickness) return false;
    }
    return true;
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


bool sfRayIntersectBox(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{    
    // s.box0 and s.box1 are the minimum and maximum coordinates
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    vec3 diff = 0.5 * (s.box0 + s.box1);
    vec3 planesN[6];
    vec3 planesP[6];
    planesN[0] = Left;
    planesN[1] = Right;
    planesN[2] = Up;
    planesN[3] = Down;
    planesN[4] = Backward;
    planesN[5] = Forward;
    planesP[0] = vec3(s.box0.x, diff.y, diff.z);
    planesP[1] = vec3(s.box1.x, diff.y, diff.z);
    planesP[2] = vec3(diff.x, s.box0.y, diff.z);
    planesP[3] = vec3(diff.x, s.box1.y, diff.z);
    planesP[4] = vec3(diff.x, diff.y, s.box0.z);
    planesP[5] = vec3(diff.x, diff.y, s.box1.z);
    vec3 Nmin;
    vec3 Nmax;
    float t0 = 1e6;
    float t1 = 0.0;
    float t = -1.0;
    for (int i = 0; i < 6; i++) {
        float cos_theta = dot(D, -planesN[i]);
        if (cos_theta >= EPSILON) {
            vec3 diff = planesP[i] - O;
            float t = dot(diff, -planesN[i]) / cos_theta;
            if (t < t0) {
                Nmin = planesN[i];
                t0 = t;
            }
            if (t > t1) {
                Nmax = planesN[i];
                t1 = t;
            }
        } else if (-cos_theta >= EPSILON) {
            vec3 diff = planesP[i] - O;
            float t = dot(diff, planesN[i]) / -cos_theta;
            if (t < t0) {
                Nmin = -planesN[i];
                t0 = t;
            }
            if (t > t1) {
                Nmax = -planesN[i];
                t1 = t;
            }
        }
    }
    if (t0 > t1) return false;
    if (t0 > tMin && t0 < tMax) {
        h.t = t0;
        h.P = sfRayOffset(r, t0);
        h.N = Nmin;
        return true;
    }
    if (t1 > tMin && t1 < tMax) {
        h.t = t0;
        h.P = sfRayOffset(r, t0);
        h.N = Nmax;
        return true;
    }
    return false;
}


bool sfRayIntersectPlane(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    float cos_theta = dot(r.direction, -s.normal);
    if (abs(cos_theta) >= EPSILON) {
        vec3 diff = s.position - r.origin;
        float t = dot(diff, -s.normal) / cos_theta;
        if (t > tMin && t < tMax) {
            h.t = t;
            h.P = sfRayOffset(r, t);
            h.N = cos_theta > 0.0 ? s.normal : -s.normal;
            return true;
        }        
    }
    return false;
}


bool sfRayIntersectDisk(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    float cos_theta = dot(r.direction, -s.normal);
    if (cos_theta >= EPSILON) {
        vec3 diff = s.position - r.origin;
        float t = dot(diff, -s.normal) / cos_theta;
        vec3 p = sfRayOffset(r, t);
        bool inside = sqrt(dot(p, p)) <= s.radius;
        if (t > tMin && t < tMax && inside) {
            h.t = t;
            h.P = sfRayOffset(r, t);
            h.N = cos_theta > 0.0 ? -s.normal : s.normal;
            return true;
        }        
    }
    return false;
}


bool sfRayIntersectCone(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    float root1 = -1.0;
    float root2 = -1.0;
    vec3 D = r.direction;
    vec3 E = r.origin - s.position;
    E.y -= s.height;
    float a = D.x*D.x/s.radius + D.z*D.z/s.radius - D.y*D.y;
    float b = 2.0 * (D.x*E.x/s.radius + D.z*E.z/s.radius - D.y*E.y);
    float c = E.x*E.x/s.radius + E.z*E.z/s.radius - E.y*E.y;
    if (!sfSolveQuadratic(a, b, c, root1, root2)) {
        return false;
    }
    float t;
    if (root1 > 0.0)
        t = root1;
    else
        t = root2;
    if (t < EPSILON)
        return false;
    if (t > tMin && t < tMax) {
        vec3 P = sfRayOffset(r, t);
        if (P.y < s.position.y) return false;
        if (P.y > s.position.y + s.height) return false;
        vec3 N = vec3(P.x - s.position.x, 0.0, P.z - s.position.z);
        h.t = t;
        h.P = P;
        h.N = N;
        return true;
    }
    
    return false;
}


bool sfRayIntersectCylinder(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    float root1 = -1.0;
    float root2 = -1.0;
    vec2 rdir = r.direction.xz;
    vec2 rpos = r.origin.xz - s.position.xz;
    float a = dot(rdir, rdir);
    float b = 2.0 * dot(rpos, rdir);
    float c = dot(rpos, rpos) - s.radius*s.radius;
    if (!sfSolveQuadratic(a, b, c, root1, root2)) {
        return false;
    }
    float t;
    if (root1 > 0.0)
        t = root1;
    else
        t = root2;
    if (t < EPSILON)
        return false;
    if (t > tMin && t < tMax) {
        vec3 P = sfRayOffset(r, t);
        if (P.y < s.position.y) return false;
        if (P.y > s.position.y + s.height) return false;
        vec3 N = vec3(P.x - s.position.x, 0.0, P.z - s.position.z);
        h.t = t;
        h.P = P;
        h.N = N;
        return true;
    }
    
    return false;
}


bool sfRayIntersectXYRect(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    float t = -O.z / D.z;
    if (t < tMin || t > tMax)
        return false;
    
    vec3 P = O + t * D;
    if (P.x < s.box0.x || P.x > s.box1.x ||
        P.y < s.box0.y || P.y > s.box1.y)
        return false;
    
    h.t = t;
    h.P = sfRayOffset(r, t);
    h.N = D.z > 0.0 ? Forward : Backward;
    h.UVW = vec3((P.xy - s.box0.xy) / (s.box1.xy - s.box0.xy), 0.0);
    return true;
}


bool sfRayIntersectXZRect(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    float t = -O.y / D.y;
    if (t < tMin || t > tMax)
        return false;
    
    vec3 P = O + t * D;
    if (P.x < s.box0.x || P.x > s.box1.x ||
        P.z < s.box0.z || P.z > s.box1.z)
        return false;
    
    h.t = t;
    h.P = sfRayOffset(r, t);
    h.N = D.y > 0.0 ? Up : Down;
    h.UVW = vec3((P.xz - s.box0.xz) / (s.box1.xz - s.box0.xz), 0.0);
    return true;
}


bool sfRayIntersectYZRect(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    float t = -O.x / D.x;
    if (t < tMin || t > tMax)
        return false;
    
    vec3 P = O + t * D;
    if (P.y < s.box0.y || P.y > s.box1.y ||
        P.z < s.box0.z || P.z > s.box1.z)
        return false;
    
    h.t = t;
    h.P = sfRayOffset(r, t);
    h.N = D.x > 0.0 ? Left : Right;
    h.UVW = vec3((P.yz - s.box0.yz) / (s.box1.yz - s.box0.yz), 0.0);
    return true;
}


float sdfSphere(vec3 p, float s) {
    return length(p) - s;
}


vec3 sdfSphereNormal(vec3 p, float s) {
    return normalize(vec3(
        sdfSphere(vec3(p.x + EPSILON, p.y, p.z), s) - sdfSphere(vec3(p.x - EPSILON, p.y, p.z), s),
        sdfSphere(vec3(p.x, p.y + EPSILON, p.z), s) - sdfSphere(vec3(p.x, p.y - EPSILON, p.z), s),
        sdfSphere(vec3(p.x, p.y, p.z + EPSILON), s) - sdfSphere(vec3(p.x, p.y, p.z - EPSILON), s)));
}

float sphSDF(vec3 p, Hitable s) {
    float r = length(p);
    float phi = acos(p.y / r);
    float theta = atan(p.z, p.x);
    vec3 d = vec3(pow(abs(cos(phi)), s.n) * pow(abs(cos(theta)), s.e),
	              pow(abs(sin(phi)), s.n),
    	          pow(abs(cos(phi)), s.n) * pow(abs(sin(theta)), s.e));
    return r - length(d);
    //float m = s.n;//max(s.e, s.n);
    //float a = pow(abs(p.x), m);
    //float b = pow(abs(p.y), m);
    //float c = pow(abs(p.z), m);
    //return (pow(a + b + c, 1.0/m) - 1.0);    
}


vec3 sphNormalSDF(vec3 p, Hitable s) {
    float base = sphSDF(p, s);
    return normalize(vec3(
        sphSDF(p + XEPSILON, s) - base,
        sphSDF(p + YEPSILON, s) - base,
        sphSDF(p + ZEPSILON, s) - base));
}


bool sfRayIntersectSuperquadric(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    float t = tMin;
    const int MAX_RAY_STEPS = 64;
    for (int i = 0; i < MAX_RAY_STEPS; i++) {
        vec3 P = O + t * D;
        //float d = sphereSDF(P / s.radius) * s.radius;
        float d = sphSDF(P/s.radius, s)*s.radius;
        if (d < EPSILON) {
            h.t = t;
            h.P = sfRayOffset(r, t);
            h.N = -sphNormalSDF(P, s);
            return true;
        }
        t += d;
        if (t > tMax) {
            return false;
        }
    }
    return false;
}


float sdfTorus(in vec3 p, in Hitable s)
{
    vec2 q = vec2(length(p.xy) - s.a, p.z);
    return length(q) - s.b;
}


vec3 sdfTorusNormal(vec3 p, Hitable s) {
    float base = sdfTorus(p, s);
    return normalize(vec3(
        sdfTorus(p + XEPSILON, s) - base,
        sdfTorus(p + YEPSILON, s) - base,
        sdfTorus(p + ZEPSILON, s) - base));
}


bool sfRayIntersectTorus(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{    
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    
    float t = tMin;
    const int MAX_RAY_STEPS = 64;
    for (int i = 0; i < MAX_RAY_STEPS; i++) {
        vec3 P = O + t * D;
        float d = sdfTorus(P, s);
        if (d < EPSILON) {
            h.t = t;
            h.P = sfRayOffset(r, t);
            h.N = -sdfTorusNormal(P, s);
            return true;
        }
        t += d;
        if (t > tMax) {
            return false;
        }
    }
    return false;
}


// from http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
float dot2(vec3 v) { return dot(v,v); }

float sdfTriangle(in vec3 p,
                  in vec3 a,
                  in vec3 b,
                  in vec3 c,
                  out vec3 N)
{
    vec3 ba = b - a; vec3 pa = p - a;
    vec3 cb = c - b; vec3 pb = p - b;
    vec3 ac = a - c; vec3 pc = p - c;
    N = cross( ba, ac );

    return sqrt(
    (sign(dot(cross(ba,N),pa)) +
     sign(dot(cross(cb,N),pb)) +
     sign(dot(cross(ac,N),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(N,pa)*dot(N,pa)/dot2(N) );
}


bool sfRayIntersectMesh(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    const int NUM_VERTICES = 11;
    const int NUM_TRIANGLES = 10;
    const int MAX_ITERATIONS = 64;
    vec3 vertices[NUM_VERTICES];
    vertices[0] = 0.25 * vec3( 0.0,  4.0, 0.0);
    vertices[1] = 0.25 * vec3(-2.0, -1.0, 0.0);
    vertices[2] = 0.25 * vec3( 0.0, -2.0, 0.0);
    vertices[3] = 0.25 * vec3( 2.0, -1.0, 0.0);
    vertices[4] = 0.25 * vec3( 0.0,  0.0, 1.0);
    vertices[5] = 0.25 * vec3( 3.0,  0.0, 0.0);
    vertices[6] = 0.25 * vec3( 4.0, -1.0, 0.0);
    vertices[7] = 0.25 * vec3( 3.0, -4.0, 0.0);
    vertices[8] = 0.25 * vec3(-3.0,  0.0, 0.0);
    vertices[9] = 0.25 * vec3(-4.0, -1.0, 0.0);
    vertices[10]= 0.25 * vec3(-3.0, -4.0, 0.0);
    int indices[NUM_TRIANGLES * 3];
    indices[0] = 0; // 0
    indices[1] = 1;
    indices[2] = 2;
    indices[3] = 2; // 1
    indices[4] = 3;
    indices[5] = 0;
    indices[6] = 0; // 2
    indices[7] = 1;
    indices[8] = 4;
    indices[9] = 4; // 3
    indices[10] = 3;
    indices[11] = 0;
    indices[12] = 2; // 4
    indices[13] = 4;
    indices[14] = 1;
    indices[15] = 2; // 5
    indices[16] = 3;
    indices[17] = 4;
    indices[18] = 6; // 6
    indices[19] = 5;
    indices[20] = 3;
    indices[21] = 7; // 7
    indices[22] = 6;
    indices[23] = 3;
    indices[24] = 1;
    indices[25] = 8;
    indices[26] = 9;
    indices[27] = 1;
    indices[28] = 9;
    indices[29] = 10;
    float bestT = tMax;
    vec3 bestN;
    vec3 O = r.origin - s.position;
    vec3 D = r.direction;
    mat3 R = mat3(cos(iTime), 0.0, -sin(iTime),
                  0.0, 1.0, 0.0,
                  sin(iTime), 0.0, cos(iTime)
                  );
    O = R * O;
    D = R * D;
    int idx = 0;
    for (int i = 0; i < NUM_TRIANGLES; i++, idx += 3)
    {
        float t = tMin;
        float lastD = 1e6;
        for (int j = 0; j < MAX_ITERATIONS; j++)
        {
            vec3 testN;
            float d = sdfTriangle(O + t * D,
                                  vertices[indices[idx+0]],
                                  vertices[indices[idx+1]],
                                  vertices[indices[idx+2]],
                                  testN);
            if (d < EPSILON) {
                if (bestT > t) {
                    bestT = t;
                    bestN = testN;
                    break;
                }
            }
            if (lastD > d) { lastD = d; }
            else if (j != 0) {
                break;
            }
            t += d;
            if (t > bestT) break;
        }
    }
    if (bestT > tMin && bestT < tMax) {
        h.t = bestT;
        h.P = sfRayOffset(r, bestT);
        h.N = -normalize(bestN);
        return true;
    }
    return false;
}


bool sfRayIntersect(Hitable s, Ray r, float tMin, float tMax, out HitRecord h)
{
    if (s.type == HITABLE_MESH) {
        return sfRayIntersectMesh(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_SPHERE) {
        return sfRayIntersectSphere(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_BOX) {
        return sfRayIntersectBox(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_PLANE) {
        return sfRayIntersectPlane(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_SQUADRIC) {
        return sfRayIntersectSuperquadric(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_DISK) {
        return sfRayIntersectDisk(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_CONE) {
        return sfRayIntersectCone(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_CYLINDER) {
        return sfRayIntersectCylinder(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_TORUS) {
        return sfRayIntersectTorus(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_XYRECT) {
        return sfRayIntersectXYRect(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_XZRECT) {
        return sfRayIntersectXZRect(s, r, tMin, tMax, h);
    }
    if (s.type == HITABLE_YZRECT) {
        return sfRayIntersectYZRect(s, r, tMin, tMax, h);
    }
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

vec3 sfShadeCIEClearSky(Ray r)
{
    return vec3(0.0, 0.0, 1.0);
}

vec3 sfShadeCIEOvercastSky(Ray r)
{
    return vec3(0.5, 0.5, 0.5);
}

vec3 sfMissShader(Ray r)
{
    if (iSkyMode == SKY_SHIRLEY) return sfShadeSkyShirley(r);
    if (iSkyMode == SKY_DAWN)    return sfShadeSkyDawn(r);
    if (iSkyMode == SKY_CIECLEAR) return sfShadeCIEClearSky(r);
    if (iSkyMode == SKY_CIEOVERCAST) return sfShadeCIEOvercastSky(r);

    // if (iSkyMode == SKY_CUBEMAP) return sfShadeSkyCubeMap(r);
    // if (iSkyMode == SKY_CUBEMAPBLUR) return sfShadeSkyCubeMapBlur(r);
    return Black;
}

bool sfTraverseRay(in Ray r, out HitRecord h);

float ComputeOrenNayer2(vec3 N, vec3 V, vec3 L, float NdotL, float s)
{
	// According to Disney BRDF, some models use double Fresnel in this way
	// float cos_theta_d = dot(Lights[i].L, Lights[i].H);
	// float Fl = F_Schlick(Material.F0, Lights[i].NdotL);
	// float Fd = F_Schlick(Material.F0, cos_theta_d);
	// Oren-Nayer BRDF

    float NdotV = dot(N, V);

	// (vec3 N, vec3 L, vec3 V, float m
	float theta_NL = acos(NdotL);
	float theta_NV = acos(NdotV);

	float alpha = max(theta_NV, theta_NL);
	float beta = min(theta_NV, theta_NL);

	float gamma = max(dot(V - N * NdotV, L -N * NdotV), 0.0);
	float m2 = s;

	float A = 1.0 - 0.5 * m2 / (m2 + 0.57);
	float B = 0.45 * m2 / (m2 + 0.09);
	float C = sin(alpha) * tan(beta);
	float L1 = (A + B * gamma * C) / 3.14159;
	return L1;
}

vec3 sfClosestHitShader(Hitable object, HitRecord h)
{
    if (object.material.type == MATERIAL_EMISSION) {
        return object.material.Ke;
    }

    vec3 N = normalize(h.N);

    vec3 finalColor = vec3(0.0);

    // diffuse ray
    Ray sunRay = sfCreateRay(h.P, uSunDirTo);
    if (!sfTraverseRay(sunRay, h)) {
        vec3 L = normalize(uSunDirTo);
        vec3 V = payload.rays[0].direction;
        float NdotL = dot(N, L);
        float Li = 10.0;
        float s = fSigma2;
        float on = ComputeOrenNayer2(N, V, L, NdotL, s);
        finalColor += object.material.Kd * on * Li * NdotL * uSunDirTo.y;
    }

    // reflection ray
    vec3 R = reflect(payload.rays[0].direction, N);
    Ray reflectRay = sfCreateRay(h.P, R);
    if (!sfTraverseRay(reflectRay, h)) {
        vec3 sky = sfMissShader(reflectRay);
        float NdotL = dot(N, R);
        finalColor += sky * NdotL;//0.5 + (0.25 * N + 0.25);// + NdotL * color;// * NdotL * color;
    }

    return finalColor;
}

void sfAnyHitShader(Hitable object, HitRecord h)
{
    payload.anyhit++;
}

void sfCopyMaterialHitRecord(in Hitable object, inout HitRecord h)
{
    if (object.material.type == MATERIAL_EMISSION)
    {
        h.Kd = object.material.Ke;
        h.isEmissive = 1;
    }
    else
    {
        h.Kd = object.material.Kd;
        h.isEmissive = 0;
    }
}

bool sfTraverseRay(in Ray r, out HitRecord h)
{		
    int hit = -1;
    float t_min = 0.0;
    float t_max = 1e6;
	for (int i = 0; i < MAX_HITABLES; i++)
	{
		if (i >= HitableCount) break;

        // sfRayIntersect acts like the Intersection Shader in the DXR pipeline
		if (sfRayIntersect(Hitables[i], r, t_min, t_max, h))
		{
            hit = i;
			t_max = h.t;
            sfCopyMaterialHitRecord(Hitables[i], h);
            sfAnyHitShader(Hitables[i], h);
		}
	}
    h.i = hit;
    return (hit < 0) ? false : true;
}

vec3 sfRayCast(Ray r)
{
    HitRecord h = sfCreateHitRecord(1e6, vec3(0.0), vec3(0.0));
    int hit = -1;
    float t_min = 0.0;
    float t_max = 1e6;
    vec3 Kd;

    payload.anyhit = 0;
    payload.rays[0] = r;

    // If this is not the closest hit, then call the miss shader
    if (!sfTraverseRay(r, h))
        return sfMissShader(r);
    
    // In GLSL, we can't just call sfClosestHitShader(Hitables[h.i]) because
    // indices have to be determined at compile time. So, we cheat here because
    // the loop creates this case to be true        
    for (int i = 0; i < MAX_HITABLES; i++)
    {
        if (h.i == i)
        {
            return sfClosestHitShader(Hitables[i], h);
        }
    }

    // Uh oh, we should not get to this point, so return ugly magenta
    return UglyMagenta;
}

void sfCreateScene() {
    sfAddHitable(sfCreateSphere(vec3(1.0, sin(iTime) + 0.0, 0.0), 0.5,
                                sfCreateMaterial(Blue, White, 0.0)));
    sfAddHitable(sfCreateSphere(vec3(-1.0, 0.0, 0.0), 0.5,
                                sfCreateMaterial(Gray67, White, 0.0)));
    sfAddHitable(sfCreateSphere(vec3(0.0, -1001.0, 0.0), 1000.5,
                                sfCreateMaterial(Brown, White, 0.0)));
}

vec3 Sunfish(in Ray r)
{
    if (RenderMode == RAY_CAST) return sfRayCast(r);
    //if (RenderMode == RAY_TRACE) return sfRayTrace(r);
    //if (RenderMode == PATH_TRACE) return sfPathTrace(r);
    return sfMissShader(r);
}

// END SUNFISH RAY TRACER ////////////////////////////////////////////

// These MUST match the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vTexcoord;
varying vec3 vColor;

void main() {
    sfCreateScene();
    vec2 uv = vTexcoord.xy;
    Ray cameraRay = sfCreateCameraRay(uv);
   	gl_FragColor = vec4(Sunfish(cameraRay), 1.0);
}
