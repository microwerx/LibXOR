declare class Hatchetfish {
    private _logElementId;
    private _logElement;
    private _numLines;
    constructor(logElementId?: string);
    logElement: string;
    clear(): void;
    private writeToLog;
    log(message: string, ...optionalParams: any[]): void;
    info(message: string, ...optionalParams: any[]): void;
    error(message: string, ...optionalParams: any[]): void;
    warn(message: string, ...optionalParams: any[]): void;
    debug(message: string, ...optionalParams: any[]): void;
}
declare var hflog: Hatchetfish;
declare class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    copy(v: Vector2): Vector2;
    clone(): Vector2;
    reset(x: number, y: number): Vector2;
    add(v: Vector2): Vector2;
    sub(v: Vector2): Vector2;
    mul(multiplicand: number): Vector2;
    div(divisor: number): Vector2;
    negate(): Vector2;
    accum(b: Vector2, bscale: number): Vector2;
    toFloat32Array(): Float32Array;
    toVector2(): Vector2;
    toVector3(): Vector3;
    toVector4(): Vector4;
    project(): number;
    length(): number;
    lengthSquared(): number;
    norm(): Vector2;
    clamp(a: number, b: number): Vector2;
    static make(x: number, y: number): Vector2;
    static makeRandom(minValue: number, maxValue: number): Vector2;
    static dot(v1: Vector2, v2: Vector2): number;
    static cross(a: Vector2, b: Vector2): number;
    static normalize(v: Vector2): Vector2;
}
/**
 * @class Vector3
 */
declare class Vector3 {
    x: number;
    y: number;
    z: number;
    r: number;
    g: number;
    b: number;
    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x?: number, y?: number, z?: number);
    /**
     *
     * @param {Vector3} v Copies the components of v into this vector
     */
    copy(v: Vector3): Vector3;
    clone(): Vector3;
    reset(x?: number, y?: number, z?: number): Vector3;
    bitOR(mask: number): Vector3;
    bitAND(mask: number): Vector3;
    bitXOR(mask: number): Vector3;
    bitNEG(): Vector3;
    static makeFromSpherical(theta: number, phi: number): Vector3;
    static makeFromSphericalISO(rho: number, thetaInRadians: number, phiInRadians: number): Vector3;
    static makeFromSphericalMath(rho: number, thetaInRadians: number, phiInRadians: number): Vector3;
    static makeZero(): Vector3;
    static makeOne(): Vector3;
    static makeRandom(a: number, b: number): Vector3;
    setFromSpherical(theta: number, phi: number): Vector3;
    readonly theta: number;
    readonly phi: number;
    static make(x?: number, y?: number, z?: number): Vector3;
    static makeUnit(x: number, y: number, z: number): Vector3;
    add(v: Vector3): Vector3;
    sub(v: Vector3): Vector3;
    mul(multiplicand: number): Vector3;
    scale(scalar: number): Vector3;
    accum(b: Vector3, bscale: number): Vector3;
    compMul(b: Vector3): Vector3;
    compDiv(b: Vector3): Vector3;
    div(divisor: number): Vector3;
    negate(): Vector3;
    reciprocal(): Vector3;
    pow(power: number): Vector3;
    compdiv(divisor: Vector3): Vector3;
    compmul(multiplicand: Vector3): Vector3;
    toArray(): number[];
    toFloat32Array(): Float32Array;
    toVector4(w: number): Vector4;
    length(): number;
    lengthSquared(): number;
    norm(): Vector3;
    normalize(): Vector3;
    distance(v: Vector3): number;
    distanceSquared(v: Vector3): number;
    distanceManhattan(v: Vector3): number;
    abs(): Vector3;
    get(index: number): number;
    set(index: number, value: number): void;
    clamp(a: number, b: number): Vector3;
    clamp3(a: Vector3, b: Vector3): Vector3;
    static clamp3(v: Vector3, a: Vector3, b: Vector3): Vector3;
    static dot(v1: Vector3, v2: Vector3): number;
    static cross(a: Vector3, b: Vector3): Vector3;
    static add(a: Vector3, b: Vector3): Vector3;
    static sub(a: Vector3, b: Vector3): Vector3;
    static mul(a: Vector3, b: Vector3): Vector3;
    static div(a: Vector3, b: Vector3): Vector3;
    static min(a: Vector3, b: Vector3): Vector3;
    static max(a: Vector3, b: Vector3): Vector3;
}
declare class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    copy(v: Vector4): Vector4;
    clone(): Vector4;
    reset(x?: number, y?: number, z?: number, w?: number): Vector4;
    add(v: Vector4): Vector4;
    sub(v: Vector4): Vector4;
    mul(multiplicand: number): Vector4;
    div(divisor: number): Vector4;
    accum(b: Vector4, bscale: number): Vector4;
    negate(): Vector4;
    toFloat32Array(): Float32Array;
    toArray(): number[];
    toVector3(): Vector3;
    project(): Vector3;
    length(): number;
    lengthSquared(): number;
    norm(): Vector4;
    clamp(a: number, b: number): Vector4;
    static dot(v1: Vector4, v2: Vector4): number;
    static normalize(v: Vector4): Vector4;
    static make(x: number, y: number, z: number, w: number): Vector4;
    static makeUnit(x: number, y: number, z: number, w: number): Vector4;
}
declare class Matrix3 {
    m11: number;
    m21: number;
    m31: number;
    m12: number;
    m22: number;
    m32: number;
    m13: number;
    m23: number;
    m33: number;
    constructor(m11: number, m21: number, m31: number, m12: number, m22: number, m32: number, m13: number, m23: number, m33: number);
    static makeIdentity(): Matrix3;
    static makeZero(): Matrix3;
    static makeColMajor(m11: number, m21: number, m31: number, m12: number, m22: number, m32: number, m13: number, m23: number, m33: number): Matrix3;
    static makeRowMajor(m11: number, m12: number, m13: number, m21: number, m22: number, m23: number, m31: number, m32: number, m33: number): Matrix3;
    static fromRowMajorArray(v: number[]): Matrix3;
    static fromColMajorArray(v: number[]): Matrix3;
    static makeScale(x: number, y: number, z: number): Matrix3;
    static makeRotation(angleInDegrees: number, x: number, y: number, z: number): Matrix3;
    static makeCubeFaceMatrix(face: number): Matrix3;
    asColMajorArray(): number[];
    asRowMajorArray(): number[];
    static multiply(m1: Matrix3, m2: Matrix3): Matrix3;
    LoadIdentity(): Matrix3;
    MultMatrix(m: Matrix3): Matrix3;
    LoadColMajor(m11: number, m21: number, m31: number, m12: number, m22: number, m32: number, m13: number, m23: number, m33: number): Matrix3;
    LoadRowMajor(m11: number, m12: number, m13: number, m21: number, m22: number, m23: number, m31: number, m32: number, m33: number): Matrix3;
    toMatrix4(): Matrix4;
    copy(m: Matrix3): Matrix3;
    clone(): Matrix3;
    concat(m: Matrix3): Matrix3;
    transform(v: Vector3): Vector3;
    asInverse(): Matrix3;
    asTranspose(): Matrix3;
}
declare class Matrix4 {
    m11: number;
    m21: number;
    m31: number;
    m41: number;
    m12: number;
    m22: number;
    m32: number;
    m42: number;
    m13: number;
    m23: number;
    m33: number;
    m43: number;
    m14: number;
    m24: number;
    m34: number;
    m44: number;
    constructor(m11?: number, m21?: number, m31?: number, m41?: number, m12?: number, m22?: number, m32?: number, m42?: number, m13?: number, m23?: number, m33?: number, m43?: number, m14?: number, m24?: number, m34?: number, m44?: number);
    copy(m: Matrix4): Matrix4;
    clone(): Matrix4;
    at(row: number, col: number): number;
    row(i: number): Vector4;
    col(i: number): Vector4;
    row3(i: number): Vector3;
    col3(i: number): Vector3;
    diag3(): Vector3;
    loadRowMajor(m11: number, m12: number, m13: number, m14: number, m21: number, m22: number, m23: number, m24: number, m31: number, m32: number, m33: number, m34: number, m41: number, m42: number, m43: number, m44: number): Matrix4;
    loadColMajor(m11: number, m21: number, m31: number, m41: number, m12: number, m22: number, m32: number, m42: number, m13: number, m23: number, m33: number, m43: number, m14: number, m24: number, m34: number, m44: number): Matrix4;
    loadIdentity(): Matrix4;
    translate(x: number, y: number, z: number): Matrix4;
    translate3(v: Vector3): Matrix4;
    rotate(angleInDegrees: number, x: number, y: number, z: number): Matrix4;
    scale(sx: number, sy: number, sz: number): Matrix4;
    lookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4;
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    ortho2D(left: number, right: number, bottom: number, top: number): Matrix4;
    perspectiveX(fovx: number, aspect: number, near: number, far: number): Matrix4;
    perspectiveY(fovy: number, aspect: number, near: number, far: number): Matrix4;
    shadowBias(): Matrix4;
    cubeFaceMatrix(face: number): Matrix4;
    static makeIdentity(): Matrix4;
    static makeZero(): Matrix4;
    static makeColMajor(m11: number, m21: number, m31: number, m41: number, m12: number, m22: number, m32: number, m42: number, m13: number, m23: number, m33: number, m43: number, m14: number, m24: number, m34: number, m44: number): Matrix4;
    static makeRowMajor(m11: number, m12: number, m13: number, m14: number, m21: number, m22: number, m23: number, m24: number, m31: number, m32: number, m33: number, m34: number, m41: number, m42: number, m43: number, m44: number): Matrix4;
    static fromRowMajorArray(v: number[]): Matrix4;
    static fromColMajorArray(v: number[]): Matrix4;
    static makeTranslation(x: number, y: number, z: number): Matrix4;
    static makeTranslation3(v: Vector3): Matrix4;
    static makeScale(x: number, y: number, z: number): Matrix4;
    static makeRotation(angleInDegrees: number, x: number, y: number, z: number): Matrix4;
    static makeOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    static makeOrtho2D(left: number, right: number, bottom: number, top: number): Matrix4;
    static makeFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4;
    static makePerspectiveY(fovy: number, aspect: number, near: number, far: number): Matrix4;
    static makePerspectiveX(fovx: number, aspect: number, near: number, far: number): Matrix4;
    static makeLookAt(eye: Vector3, center: Vector3, up: Vector3): Matrix4;
    static makeOrbit(azimuthInDegrees: number, pitchInDegrees: number, distance: number): Matrix4;
    static makeLookAt2(eye: Vector3, center: Vector3, up: Vector3): Matrix4;
    static makeShadowBias(): Matrix4;
    static makeCubeFaceMatrix(face: number): Matrix4;
    toColMajorArray(): number[];
    toRowMajorArray(): number[];
    static multiply3(a: Matrix4, b: Matrix4, c: Matrix4): Matrix4;
    static multiply(a: Matrix4, b: Matrix4): Matrix4;
    loadMatrix(m: Matrix4): Matrix4;
    multMatrix(m: Matrix4): Matrix4;
    transform(v: Vector4): Vector4;
    transform3(v: Vector3): Vector3;
    asInverse(): Matrix4;
    asTranspose(): Matrix4;
    asTopLeft3x3(): Matrix3;
}
declare namespace GTE {
    class Sphere {
        radius: number;
        center: Vector3;
        constructor(radius: number, center: Vector3);
        clone(): Sphere;
        copy(s: Sphere): Sphere;
        sdf(p: Vector3): number;
        support(n: Vector3): Vector3;
        distance(s: Sphere): number;
        intersectsSphere(s: Sphere): boolean;
    }
}
declare namespace GTE {
    /**
     * @class
     */
    class BoundingBox {
        minBounds: Vector3;
        maxBounds: Vector3;
        /**
         * @constructor
         */
        constructor();
        /**
         * Copy b into this
         * @param {BoundingBox} b bounding box to copy from
         * @returns {BoundingBox}
         */
        copy(b: BoundingBox): BoundingBox;
        /**
         * Clone this bounding box
         * @returns {BoundingBox}
         */
        clone(): BoundingBox;
        /**
         * Returns true if bbox is the same as this
         * @param {BoundingBox} bbox bounding box to compare against
         */
        sameAs(bbox: BoundingBox): boolean;
        /**
         * @returns {string}
         */
        readonly whdString: string;
        /**
         * @returns {string}
         */
        readonly minString: string;
        /**
         * @returns {string}
         */
        readonly maxString: string;
        /**
         * @returns {number}
         */
        readonly width: number;
        /**
         * @returns {number}
         */
        readonly height: number;
        /**
         * @returns {number}
         */
        readonly depth: number;
        /**
         * @returns {number}
         */
        readonly maxSize: number;
        /**
         * @returns {number}
         */
        readonly minSize: number;
        /**
         * @returns {number}
         */
        readonly x: number;
        /**
         * @returns {number}
         */
        readonly y: number;
        /**
         * @returns {number}
         */
        readonly z: number;
        /**
         * @returns {number}
         */
        readonly left: number;
        /**
         * @returns {number}
         */
        readonly right: number;
        /**
         * @returns {number}
         */
        readonly top: number;
        /**
         * @returns {number}
         */
        readonly bottom: number;
        /**
         * @returns {number}
         */
        readonly front: number;
        /**
         * @returns {number}
         */
        readonly back: number;
        /**
         * Returns bounding sphere
         * @returns {Sphere}
         */
        readonly outsideSphere: Sphere;
        /**
         * Returns smallest sphere inside bounding box
         * @returns {Sphere}
         */
        readonly insideSphere: Sphere;
        /**
         * @returns {Vector3} (width, height, length) of bounding box
         */
        readonly size: Vector3;
        /**
         * Returns center of AABB
         * @returns {Vector3} (x, y, z) of center of AABB
         */
        readonly center: Vector3;
        /**
         * Adds a point to the AABB
         * @param {Vector3} p point to add to AABB
         * @returns {BoundingBox} returns this pointer
         */
        add(p: Vector3): BoundingBox;
        /**
         * Resets bounding box to inverted box
         * @returns {BoundingBox} returns this pointer
         */
        reset(): BoundingBox;
        /**
         *
         * @param {BoundingBox} aabb bounding box to compare with
         * @returns {boolean}
         */
        intersectsAABB(aabb: BoundingBox): boolean;
        /**
         * Returns signed distance between this box and p
         * @param {Vector3} p Test point
         */
        sdf(p: Vector3): number;
        /**
         * Returns support mapping
         * @param {Vector3} n Check against support vector
         * @returns {Vector3}
         */
        support(n: Vector3): Vector3;
    }
}
/**
 * @namespace
 */
declare namespace GTE {
    /**
     * @returns {number} Returns a number between 0 and 255
     */
    function randomUint8(): number;
    /**
     * @returns {number} Returns a number between 0 and 65535
     */
    function randomUint16(): number;
    /**
     * Returns (x) < (a) ? (a) : (x) > (b) ? (b) : (x)
     * @param x number
     * @param a number
     * @param b number
     * @returns number
     */
    function clamp(x: number, a: number, b: number): number;
    /**
     * Wraps x in the range [a, b]
     * @param x The number to wrap
     * @param a The low end of the range
     * @param b The high end of the range
     */
    function wrap(x: number, a: number, b: number): number;
    function lerp(a: number, b: number, mix: number): number;
    function sigmoid(x: number): number;
    function signzero(x: number): number;
    function sign(x: number, epsilon?: number): number;
    function gaussian(x: number, center: number, sigma: number): number;
    function degrees(x: number): number;
    function radians(x: number): number;
    function min3(a: number, b: number, c: number): number;
    function max3(a: number, b: number, c: number): number;
    function transformRT(vertex: Vector3, R: Matrix3, T: Vector3): Vector3;
    function length2(dx: number, dy: number): number;
    function length3(dx: number, dy: number, dz: number): number;
    function dirTo3(p1: Vector3, p2: Vector3): Vector3;
    function vec3(x?: number, y?: number, z?: number): Vector3;
    function vec4(x?: number, y?: number, z?: number, w?: number): Vector4;
}
declare namespace XOR {
    export function GetURLResource(url: string): string;
    export function GetURLPath(url: string): string;
    export function IsExtension(sourceString: string, extensionWithDot: string): boolean;
    export function GetExtension(sourceString: string): string;
    export class ShaderLoader {
        vertShaderUrl: string;
        fragShaderUrl: string;
        private callbackfn;
        private vertLoaded;
        private fragLoaded;
        private vertFailed;
        private fragFailed;
        vertShaderSource: string;
        fragShaderSource: string;
        readonly failed: boolean;
        readonly loaded: boolean;
        constructor(vertShaderUrl: string, fragShaderUrl: string, callbackfn: (vertShaderSource: string, fragShaderSource: string) => void);
    }
    export class TextFileLoader {
        private callbackfn;
        private _loaded;
        private _failed;
        data: string;
        name: string;
        readonly loaded: boolean;
        readonly failed: boolean;
        constructor(url: string, callbackfn: (data: string, name: string, parameter: number) => void, parameter?: number);
    }
    export class ImageFileLoader {
        private callbackfn;
        private _loaded;
        private _failed;
        image: HTMLImageElement;
        name: string;
        readonly loaded: boolean;
        readonly failed: boolean;
        constructor(url: string, callbackfn: (data: HTMLImageElement, name: string, parameter: number) => void, parameter?: number);
    }
    export function SeparateCubeMapImages(image: HTMLImageElement, images: null[] | ImageData[]): void;
    export function niceTimestamp(timestamp: number): string;
    export function niceFramesPerSecond(t0: number, t1: number): string;
    export function niceDuration(t0: number, t1: number): string;
    export function round3(x: number): number;
    export function round3str(x: number): string;
    export function niceVector(v: Vector3): string;
    export function niceNumber(x: number, digits: number): string;
    export function niceMatrix4(m: Matrix4): string;
    class GLTypeInfo {
        type: number;
        baseType: number;
        components: number;
        sizeOfType: number;
        constructor(type: number, baseType: number, components: number, sizeOfType: number);
        CreateArray(size: number): Float32Array | Int32Array | Int16Array | Uint32Array | Uint16Array | Uint8ClampedArray | null;
    }
    export var WebGLTypeInfo: Map<number, GLTypeInfo>;
    export {};
}
declare namespace XOR {
    class MemorySystem {
        private xor;
        private intmem;
        private fltmem;
        private vecmem;
        private colmem;
        readonly VICSTART = 4096;
        readonly VICCOUNT = 256;
        readonly PALETTESTART = 4352;
        readonly PALETTECOUNT: number;
        readonly SPRITESHEETSTART = 8192;
        readonly SPRITESHEETCOUNT = 4096;
        constructor(xor: LibXOR);
        init(): void;
        PEEK(location: number): number;
        POKE(location: number, value: number): void;
        IPEEK(location: number): number;
        FPEEK(location: number): number;
        VPEEK(location: number): Vector4;
        CPEEK(location: number): Vector4;
        IPOKE(location: number, value: number): void;
        FPOKE(location: number, value: number): void;
        VPOKE(location: number, value: Vector4): void;
        CPOKE(location: number, value: Vector4): void;
    }
}
declare namespace XOR {
    class GraphicsSprite {
        position: Vector3;
        pivot: Vector3;
        bbox: GTE.BoundingBox;
        palette: number;
        index: number;
        plane: number;
        enabled: boolean;
        alpha: number;
        fliph: boolean;
        flipv: boolean;
        rotate90: number;
        matrix: Matrix4;
        constructor();
        readFromMemory(mem: XOR.MemorySystem, offset: number): void;
    }
}
declare namespace XOR {
    class GraphicsTileLayer {
        tiles: number[];
        layer: number;
        constructor();
        readFromMemory(mem: MemorySystem, offset: number): void;
    }
}
declare namespace XOR {
    class GraphicsSystem {
        private xor;
        gl: WebGLRenderingContext | WebGL2RenderingContext | null;
        hasWebGL2: boolean;
        canvas: HTMLCanvasElement | null;
        private glcontextid;
        sprites: GraphicsSprite[];
        tileLayers: GraphicsTileLayer[];
        spriteImage: Uint8Array;
        layer1width: number;
        layer1height: number;
        layer2width: number;
        layer2height: number;
        layer3width: number;
        layer3height: number;
        layer4width: number;
        layer4height: number;
        offsetX: number;
        offsetY: number;
        zoomX: number;
        zoomY: number;
        worldMatrix: Matrix4;
        cameraMatrix: Matrix4;
        projectionMatrix: Matrix4;
        readonly MaxSprites = 128;
        readonly MaxTileLayers = 4;
        readonly SpriteSize = 16;
        readonly VICMemoryStart = 24576;
        readonly CharMatrixMemoryStart = 28672;
        readonly CharColorsMemoryStart = 32768;
        readonly CharBitmapMemoryStart = 36864;
        readonly SpriteInfoMemoryStart = 40960;
        readonly SpriteBitmapMemoryStart = 45056;
        readonly TileBitmapMemoryStart = 53248;
        readonly TileMatrixMemoryStart = 61440;
        readonly width: number;
        readonly height: number;
        constructor(xor: LibXOR);
        init(): void;
        setVideoMode(width: number, height: number, version?: number): void;
        clear(color1?: XOR.Color, color2?: XOR.Color, mix?: number, hue1?: XOR.HueShift, hue2?: XOR.HueShift, neg?: number): void;
        clear3(color: Vector3): void;
        clearrgba(r: number, g: number, b: number, a: number): void;
        readFromMemory(): void;
        drawABO: WebGLBuffer | null;
        shaderProgram: WebGLProgram | null;
        vertShader: WebGLShader | null;
        fragShader: WebGLShader | null;
        spriteTexture: WebGLTexture | null;
        charTexture: WebGLTexture | null;
        tileTexture: WebGLTexture | null;
        drawList: number[];
        aPosition: number;
        aNormal: number;
        aTexcoord: number;
        aColor: number;
        aGeneric: number;
        uTexture0: WebGLUniformLocation | null;
        uProjectionMatrix: WebGLUniformLocation | null;
        uCameraMatrix: WebGLUniformLocation | null;
        uWorldMatrix: WebGLUniformLocation | null;
        createBuffers(): void;
        enableVertexAttrib(gl: WebGLRenderingContext, location: number, size: number, type: number, stride: number, offset: number): void;
        disableVertexAttrib(gl: WebGLRenderingContext, location: number): void;
        render(): void;
        setOffset(x: number, y: number): void;
        setZoom(x: number, y: number): void;
    }
}
declare namespace TF {
    class DAHDSREnvelope {
        delay: number;
        delayCV: number;
        attack: number;
        attackCV: number;
        hold: number;
        decay: number;
        sustainCV: number;
        release: number;
        releaseCV: number;
        constructor(delay?: number, // delay to start
        delayCV?: number, // level at start
        attack?: number, // how long to ramp from 0 to 1
        attackCV?: number, // Highest level (normally 1)
        hold?: number, // how long to hold signal at highest amplitude
        decay?: number, // how long to ramp from 1 to sustain
        sustainCV?: number, // level of the sustain
        release?: number, // how long to ramp from sustain to 0
        releaseCV?: number);
    }
    class AttackReleaseEnvelope {
        delay: number;
        attack: number;
        attackCV: number;
        hold: number;
        release: number;
        releaseCV: number;
        constructor(delay?: number, attack?: number, attackCV?: number, hold?: number, release?: number, releaseCV?: number);
    }
    class SimpleSamplerPlaySettings {
        VCFfrequency1: number;
        VCFfrequency2: number;
        VCFsweepTime: number;
        VCFresonance: number;
        VCAattack: number;
        VCAhold: number;
        VCArelease: number;
        sampleLoop: boolean;
        constructor(VCFfrequency1?: number, VCFfrequency2?: number, VCFsweepTime?: number, VCFresonance?: number, VCAattack?: number, VCAhold?: number, VCArelease?: number, sampleLoop?: boolean);
    }
    class Sample {
        url: string;
        buffer: AudioBuffer | null;
        loaded: boolean;
        haderror: boolean;
        private VCF;
        private VCA;
        VCAenvelope: DAHDSREnvelope;
        VCOenvelope: DAHDSREnvelope;
        VCFenvelope: DAHDSREnvelope;
        VCFresonance: number;
        private source;
        private stopped_;
        loop: boolean;
        constructor(url: string, buffer?: AudioBuffer | null, loaded?: boolean, haderror?: boolean);
        play(ss: XOR.SoundSystem, time?: number): void;
        readonly stopped: boolean;
        readonly playing: boolean;
        stop(): void;
        playOld(ss: XOR.SoundSystem, time?: number): void;
    }
    class Sampler {
        private ss;
        samples: Map<number, Sample>;
        private samplesRequested;
        private samplesLoaded;
        constructor(ss: XOR.SoundSystem);
        readonly loaded: boolean;
        isPlaying(id: number): boolean;
        isStopped(id: number): boolean;
        update(timeInSeconds: number): void;
        stopSample(id: number): void;
        loadSample(id: number, url: string, logErrors?: boolean): void;
        playSample(id: number, loop?: boolean, time?: number): void;
    }
}
declare namespace TF {
    class Jukebox {
        ss: XOR.SoundSystem;
        tracks: Map<number, HTMLAudioElement>;
        playTrack: number;
        constructor(ss: XOR.SoundSystem);
        add(index: number, url: string, looping: boolean): boolean;
        stop(): void;
        play(index: number): void;
        update(timeInSeconds: number): void;
    }
}
interface Window {
    AudioContext: AudioContext;
    webkitAudioContext: AudioContext;
}
declare namespace XOR {
    class SoundSystem {
        private xor;
        sampler: TF.Sampler;
        jukebox: TF.Jukebox;
        private context_;
        private masterVolume;
        private enabled_;
        constructor(xor: LibXOR);
        readonly enabled: boolean;
        readonly disabled: boolean;
        readonly context: AudioContext | null;
        init(): void;
        volume: number;
        readonly gainNode: GainNode;
        update(): void;
    }
}
declare class XORMouseEvent {
    button: number;
    clicks: number;
    buttons: number;
    position: Vector2;
    screen: Vector2;
    delta: Vector2;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    constructor(button?: number, clicks?: number, buttons?: number, position?: Vector2, screen?: Vector2, delta?: Vector2, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean, metaKey?: boolean);
    copyMouseEvent(e: MouseEvent): void;
}
declare namespace XOR {
    /**
     * @member buttons Map<number, number>
     * @member axes Map<number, number>
     * @member enabled boolean
     */
    class XORGamepadState {
        buttons: Map<number, number>;
        axes: Map<number, number>;
        lastButtons: number;
        currentButtons: number;
        anyButtonPressed: boolean;
        numButtons: number;
        numAxes: number;
        enabled: boolean;
        id: any;
        constructor();
        copyInfo(state: Gamepad): void;
        button(i: number): number;
        axe(i: number): number;
        readonly left: boolean;
        readonly right: boolean;
        readonly up: boolean;
        readonly down: boolean;
        readonly b0: boolean;
        readonly b1: boolean;
        readonly b2: boolean;
        readonly b3: boolean;
        readonly leftright: number;
        readonly updown: number;
    }
}
declare namespace XOR {
    class TouchState {
        x: number;
        y: number;
        dx: number;
        dy: number;
        private ox;
        private oy;
        pressed: boolean;
        constructor(x?: number, y?: number, dx?: number, dy?: number);
        readonly position: Vector3;
        readonly reldelta: Vector3;
        readonly touchDelta: Vector3;
        handleTouch(t: Touch, down: boolean, reset?: boolean): void;
    }
}
declare namespace XOR {
    class InputSystem {
        xor: LibXOR;
        keys: Map<string, number>;
        codes: Map<string, number>;
        modifiers: number;
        canvas: HTMLCanvasElement | null;
        mouseXY: Vector2;
        mouse: XORMouseEvent;
        /** @type {Map<number, XORMouseEvent>} */
        mouseButtons: Map<number, XORMouseEvent>;
        mouseOver: boolean;
        /** @type {Map<number, XORGamepadState>} */
        gamepads: Map<number, XORGamepadState>;
        gamepadAPI: boolean;
        touches: TouchState[];
        constructor(xor: LibXOR);
        init(): void;
        poll(): void;
        captureMouse(e: HTMLCanvasElement): void;
        captureTouches(): void;
        checkKeys(keys: string[]): number;
        readonly mousecurpos: Vector2;
        readonly mouseclick: Vector2;
        readonly mouseshadertoy: Vector4;
        readonly mouseButton1: boolean;
        readonly mouseButton2: boolean;
        readonly mouseButton3: boolean;
        private changeModifier;
        private translateKeyToCode;
        onkeydown(e: KeyboardEvent): void;
        onkeyup(e: KeyboardEvent): void;
    }
}
declare namespace XOR {
    enum Color {
        BLACK = 0,
        GRAY33 = 1,
        GRAY67 = 2,
        WHITE = 3,
        RED = 4,
        ORANGE = 5,
        YELLOW = 6,
        GREEN = 7,
        CYAN = 8,
        AZURE = 9,
        BLUE = 10,
        VIOLET = 11,
        ROSE = 12,
        BROWN = 13,
        GOLD = 14,
        FORESTGREEN = 15
    }
    enum HueShift {
        Zero = 0,
        SevenHalf = 1,
        Fifteen = 2,
        OneEighty = 3
    }
    class PaletteSystem {
        xor: LibXOR;
        readonly BLACK = 0;
        readonly GRAY33 = 1;
        readonly GRAY67 = 2;
        readonly WHITE = 3;
        readonly RED = 4;
        readonly ORANGE = 5;
        readonly YELLOW = 6;
        readonly GREEN = 7;
        readonly CYAN = 8;
        readonly AZURE = 9;
        readonly BLUE = 10;
        readonly VIOLET = 11;
        readonly ROSE = 12;
        readonly BROWN = 13;
        readonly GOLD = 14;
        readonly FORESTGREEN = 15;
        constructor(xor: LibXOR);
        /**
         *
         * @param index (0 = BLACK, 1 = GRAY33, 2 = GRAY67, 3 = WHITE, 4 = RED, 5 = ORANGE, 6 = YELLOW, 7 = GREEN, 8 = CYAN, 9 = AZURE, 10 = BLUE, 11 = VIOLET, 12 = ROSE, 13 = BROWN, 14 = GOLD, 15 = FORESTGREEN)
         * @returns Vector3 color with RGB values 0 to 1
         */
        getColor(index: number): Vector3;
        /**
         * calcColor(color1, color2, colormix, color1hue, color2hue, negative)
         * @param color1 0 to 15
         * @param color2 0 to 15
         * @param colormix 0 to 7
         * @param color1hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param color2hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param negative 0 = none, 1 = 1 - RGB
         * @returns Vector3 color with RGB values 0 to 1
         */
        calcColor(color1: number, color2: number, colormix: number, color1hue: number, color2hue: number, negative: number): Vector3;
        /**
         * calcColorBits(bits)
         * @param bits 16 bit number (0-3: color1, 4-7: color2, 8-10: mix, 9-11: color1 hue shift, 12-14: color2 hue shift, 15: negative)
         * @returns Vector3 color with RGB values 0 to 1
         */
        calcColorBits(bits: number): Vector3;
        /**
         * calcBits(color1, color2, colormix, color1hue, color2hue, negative)
         * @param color1 0 to 15
         * @param color2 0 to 15
         * @param colormix 0 to 7
         * @param color1hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param color2hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param negative 0 = none, 1 = 1 - RGB
         * @returns number representing 16-bit XOR color model
         */
        calcBits(color1: number, color2: number, colormix: number, color1hue: number, color2hue: number, negative: number): number;
        /**
         * mixColors(color1, color2, mix)
         * @param color1 RGB color with values 0 to 1
         * @param color2 RGB color with values 0 to 1
         * @param mix 0 to 7 representing lerp mix
         * @returns Vector3 color with RGB values 0 to 1
         */
        mixColors(color1: Vector3, color2: Vector3, mix: number): Vector3;
        /**
         * hueshiftcolor(color, shift)
         * @param color RGB color with values 0 to 1
         * @param shift 0 = no shift, 1 = 7.5 degrees, 2 = 15 degrees, 3 = 180 degrees
         * @returns Vector3 color with RGB values 0 to 1
         */
        hueshiftColor(color: Vector3, shift: number): Vector3;
        /**
         * negativeColor(color3)
         * @param color RGB color with values 0 to 1
         * @returns Vector3 representing 1 - color
         */
        negativeColor(color: Vector3): Vector3;
        /**
         * getHtmlColor(color: Vector3)
         * @param color RGB color with values 0 to 1
         * @returns string valid html color
         */
        getHtmlColor(color: Vector3): string;
        /**
         * setpalette(paletteIndex, colorIndex, color1, color2, colormix, color1hue, color2hue, negative)
         * @param paletteIndex 0 to 15
         * @param colorIndex 0 to 15
         * @param color1 0 to 15
         * @param color2 0 to 15
         * @param colormix 0 to 7
         * @param color1hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param color2hue 0 to 3 (0 = no shift, 1 = +7.5 degrees, 2 = +15 degrees, 3 = +180 degrees)
         * @param negative 0 = none, 1 = 1 - RGB
         * @returns nothing
         */
        setpalette(paletteIndex: number, colorIndex: number, color1: number, color2: number, colormix: number, color1hue: number, color2hue: number, negative: number): void;
        /**
         * setpalettebits(paletteIndex, colorIndex, bits)
         * @param paletteIndex 0 to 15
         * @param colorIndex 0 to 15
         * @param bits 16 bit number (0-3: color1, 4-7: color2, 8-10: mix, 9-11: color1 hue shift, 12-14: color2 hue shift, 15: negative)
         * @returns nothing
         */
        setpalettebits(paletteIndex: number, colorIndex: number, bits: number): void;
        /**
         * getpalette(paletteIndex, colorIndex)
         * @param paletteIndex 0 - 15
         * @param colorIndex 0 - 15
         * @returns Vector3 color with RGB values 0 to 1
         */
        getpalette(paletteIndex: number, colorIndex: number): Vector3;
        /**
         * getpalettebits(paletteIndex, colorIndex)
         * @param paletteIndex 0 - 15
         * @param colorIndex 0 - 15
         * @returns integer representing 16-bit LibXOR color model
         */
        getpalettebits(paletteIndex: number, colorIndex: number): number;
        private static hue2rgb;
        private static hsl2rgb;
        private static rgb2hsl;
    }
}
declare namespace Fluxions {
    class FxFboSystem {
        fx: FxRenderingContext;
        private _fbo;
        private currentFBO;
        constructor(fx: FxRenderingContext);
        /**
         * Returns null or the FBO referred to by name
         * @param name The name of the FBO
         */
        get(name: string): FxFBO | null;
        /**
         * Creates a new FBO and adds it to the scene graph
         * @param name The name of the FBO
         * @param hasDepth Does the FBO have a depth attachment
         * @param hasColor Does the FBO have a color attachment
         * @param width The width of the FBO (should be power of two)
         * @param height The height of the FBO (should be power of two)
         * @param colorType 0 for gl.UNSIGNED_BYTE or 1 for gl.FLOAT
         */
        add(name: string, hasColor: boolean, hasDepth: boolean, width: number, height: number, colorType: number, depthType: number): FxFBO | null;
        /**
         * autoresize
         */
        autoresize(): void;
        restore(): void;
        configure(rc: FxRenderConfig, startUnit?: number): void;
        configureFBO(rc: FxRenderConfig, name: string, colorUnit: number, depthUnit: number): void;
    }
}
declare namespace Fluxions {
    class FxTextureSystem {
        fx: FxRenderingContext;
        private _textures;
        private _default2D;
        private _defaultCube;
        private imagefiles;
        /**
         *
         * @param {FxRenderingContext} fx The rendering context
         */
        constructor(fx: FxRenderingContext);
        has(name: string): boolean;
        get(name: string): FxTexture | null;
        /**
         *
         * @param {string} name name of the texture
         * @param {FxTexture} value
         */
        set(name: string, value: FxTexture): void;
        readonly loaded: boolean;
        readonly failed: boolean;
        readonly length: number;
        readonly percentLoaded: number;
        /**
         * @param {string} name the key to find this texture
         * @param {string} url  the url to load this texture
         */
        load(name: string, url: string): void;
        wasRequested(name: string): boolean;
        private processTextureMap;
    }
}
declare namespace Fluxions {
    class FxTextureUniform {
        textureName: string;
        uniformName: string;
        samplerName: string;
        private texture;
        private sampler;
        private unit;
        /**
         *
         * @param {string} textureName The name of the textures from the fx.textures[] array
         * @param {string} uniformName The name of the uniform to apply this texture to
         * @param {string} samplerName The name of the sampler params to apply (default "")
         */
        constructor(textureName: string, uniformName: string, samplerName?: string);
        getTexture(fx: FxRenderingContext): WebGLTexture | null;
    }
}
declare namespace Fluxions {
    class FxRenderConfig {
        fx: FxRenderingContext;
        name: string;
        vshaderUrl: string;
        fshaderUrl: string;
        private _isCompiled;
        private _isLinked;
        private _vertShader;
        private _fragShader;
        private _program;
        private _vertShaderSource;
        private _fragShaderSource;
        private _vertShaderInfoLog;
        private _fragShaderInfoLog;
        private _vertShaderCompileStatus;
        private _fragShaderCompileStatus;
        private _programInfoLog;
        private _programLinkStatus;
        uniforms: Map<string, WebGLUniformLocation | null>;
        uniformInfo: Map<string, WebGLActiveInfo | null>;
        private uniformUnits;
        useDepthTest: boolean;
        depthTest: number;
        depthMask: boolean;
        useBlending: boolean;
        blendSrcFactor: number;
        blendDstFactor: number;
        useStencilTest: boolean;
        stencilFunc: number;
        stencilFuncRef: number;
        stencilMask: number;
        renderShadowMap: boolean;
        renderGBuffer: boolean;
        renderImage: boolean;
        renderEdges: boolean;
        writesToFBO: boolean;
        writeToFBO: string;
        clearWriteToFBO: boolean;
        disableWriteToFBOColorWrites: boolean;
        readFromFBOs: string[];
        textures: FxTextureUniform[];
        private _texturesBound;
        private _warnings;
        constructor(fx: FxRenderingContext);
        readonly usable: boolean;
        isCompiledAndLinked(): boolean;
        use(): void;
        /**
         *
         * @param uniform name of the uniform
         * @param texture name of the texture
         * @param unit >= 0 the unit, or if unit < 0 the last unit bound by this texture
         */
        bindTextureUniform(uniform: string, texture: string, unit: number): void;
        restore(): void;
        uniformMatrix4f(uniformName: string, m: Matrix4): void;
        uniform1i(uniformName: string, x: number): void;
        uniform1f(uniformName: string, x: number): void;
        uniform2f(uniformName: string, v: Vector2): void;
        uniform3f(uniformName: string, v: Vector3): void;
        uniform4f(uniformName: string, v: Vector4): void;
        getAttribLocation(name: string): number;
        getUniformLocation(name: string): WebGLUniformLocation | null;
        compile(vertShaderSource: string, fragShaderSource: string): boolean;
        private updateActiveUniforms;
        addTexture(textureName: string, uniformName: string): void;
        clearTextures(): void;
    }
}
declare namespace Fluxions {
    class FxRenderConfigSystem {
        fx: FxRenderingContext;
        renderconfigs: Map<string, FxRenderConfig>;
        private shaderLoaders;
        constructor(fx: FxRenderingContext);
        readonly loaded: boolean;
        readonly failed: boolean;
        readonly length: number;
        readonly percentLoaded: number;
        create(name: string): FxRenderConfig;
        load(name: string, vshaderUrl: string, fshaderUrl: string): FxRenderConfig;
        use(name: string | null): FxRenderConfig | null;
    }
}
declare namespace Fluxions {
    class FxRenderingContext {
        xor: LibXOR;
        gl: WebGLRenderingContext | WebGL2RenderingContext;
        scenegraph: FxScenegraph;
        textures: FxTextureSystem;
        fbos: FxFboSystem;
        renderconfigs: FxRenderConfigSystem;
        readonly width: number;
        readonly height: number;
        readonly aspectRatio: number;
        constructor(xor: LibXOR);
        private enabledExtensions;
        private _visible;
        private _resized;
        enableExtensions(names: string[]): boolean;
        getExtension(name: string): any;
        update(): void;
        verifyFBO(name: string): boolean;
    }
}
declare class FxFBO {
    private _renderingContext;
    readonly color: boolean;
    readonly depth: boolean;
    width: number;
    height: number;
    private _colorType;
    private _depthType;
    colorUnit: number;
    depthUnit: number;
    readonly shouldAutoResize: boolean;
    private _fbo;
    private _colorTexture;
    private _depthTexture;
    private _complete;
    private _colorUnit;
    private _depthUnit;
    private _savedViewport;
    private _depthTypeDesc;
    private _colorTypeDesc;
    clearColor: Vector3;
    readonly complete: boolean;
    readonly dimensions: Vector2;
    fboStatusString(fboStatus: number): string;
    constructor(_renderingContext: FxRenderingContext, color: boolean, depth: boolean, width?: number, height?: number, _colorType?: number, _depthType?: number, colorUnit?: number, depthUnit?: number, shouldAutoResize?: boolean);
    autoResize(width: number, height: number): void;
    make(): void;
    use(clearScreen?: boolean, disableColorWrites?: boolean): void;
    restore(): void;
    bindTextures(colorUnit?: number, depthUnit?: number): void;
    unbindTextures(): void;
    static statusToText(status: number): string;
}
declare namespace Fluxions {
    class FxCamera {
        _transform: Matrix4;
        private _center;
        private _eye;
        private _angleOfView;
        private _aspectRatio;
        private _znear;
        private _zfar;
        projection: Matrix4;
        pretransform: Matrix4;
        posttransform: Matrix4;
        constructor();
        readonly transform: Matrix4;
        readonly rotatetransform: Matrix4;
        aspectRatio: number;
        angleOfView: number;
        zfar: number;
        znear: number;
        readonly position: Vector3;
        readonly right: Vector3;
        readonly left: Vector3;
        readonly up: Vector3;
        readonly down: Vector3;
        readonly forward: Vector3;
        readonly backward: Vector3;
        eye: Vector3;
        center: Vector3;
        moveTo(position: Vector3): void;
        move(delta: Vector3): Vector3;
        turn(delta: Vector3): void;
        setOrbit(azimuthInDegrees: number, pitchInDegrees: number, distance: number): Matrix4;
    }
}
declare namespace Fluxions {
    class FxTexture {
        private fx;
        name: string;
        url: string;
        target: number;
        texture: WebGLTexture;
        id: string;
        minFilter: number;
        magFilter: number;
        wrapS: number;
        wrapT: number;
        lastUnitBound: number;
        constructor(fx: FxRenderingContext, name: string, url: string, target: number, texture: WebGLTexture);
        setMinMagFilter(minFilter: number, magFilter: number): void;
        setWrapST(wrapS: number, wrapT: number): void;
        bindUnit(unit: number): void;
        bind(): void;
    }
}
declare namespace Fluxions {
    class FxMaterial {
        name: string;
        Kd: Vector3;
        Ka: Vector3;
        Ks: Vector3;
        Tf: Vector3;
        MapKdMix: number;
        MapKd: string;
        MapKsMix: number;
        MapKs: string;
        MapNormalMix: number;
        MapNormal: string;
        MapTfMix: number;
        MapTf: string;
        SpecularRoughness: number;
        DiffuseRoughness: number;
        Ni: number;
        Ns: number;
        PBn2: number;
        PBk2: number;
        Dissolve: number;
        minFilter: number;
        magFilter: number;
        constructor(name: string);
    }
}
declare namespace Fluxions {
    class DirectionalLight {
        private _direction;
        private _center;
        private _eye;
        private _distance;
        private _zfar;
        private _znear;
        private _E0;
        private _transform;
        private _isOrbit;
        private _zoom;
        private _offset;
        constructor();
        distance: number;
        direction: Vector3;
        center: Vector3;
        E0: Vector3;
        setOrbit(azimuthInDegrees: number, pitchInDegrees: number, distance: number): Matrix4;
        readonly lightMatrix: Matrix4;
        readonly projectionMatrix: Matrix4;
    }
}
declare class FxTextParser {
    readonly lines: Array<string[]>;
    constructor(data: string);
    static MakeIdentifier(token: string): string;
    static ParseIdentifier(tokens: string[]): string;
    static ParseVector(tokens: string[]): Vector3;
    static ParseVector4(tokens: string[]): Vector4;
    static ParseMatrix(tokens: string[]): Matrix4;
    static ParseFaceIndices(_token: string): Array<number>;
    static ParseFace(tokens: string[]): number[];
}
declare namespace Fluxions {
    class FxScenegraphNode {
        name: string;
        sceneName: string;
        parent: string;
        geometryGroup: string;
        private transform_;
        private pretransform_;
        private posttransform_;
        worldMatrix: Matrix4;
        readonly pretransform: Matrix4;
        readonly posttransform: Matrix4;
        readonly transform: Matrix4;
        constructor(name?: string, sceneName?: string, parent?: string);
    }
}
declare namespace Fluxions {
    enum FxSGAssetType {
        Scene = 0,
        GeometryGroup = 1,
        MaterialLibrary = 2,
        ShaderProgram = 3,
        Image = 4,
        Text = 5
    }
    class FxScenegraph {
        private fx;
        private _scenegraphs;
        private _deferredMesh;
        private _materials;
        private _sceneResources;
        private _nodes;
        private _meshes;
        private _tempNode;
        textFiles: Map<string, string[][]>;
        camera: FxCamera;
        sunlight: DirectionalLight;
        currentrc: FxRenderConfig | null;
        currentmtllib: string | null;
        currentmtl: string | null;
        currentobj: string | null;
        currentscn: string | null;
        private _defaultRenderConfig;
        readonly width: number;
        readonly height: number;
        readonly aspectRatio: number;
        constructor(fx: FxRenderingContext);
        readonly loaded: boolean;
        readonly failed: boolean;
        readonly percentLoaded: number;
        load(url: string): void;
        isSceneGraph(name: string): boolean;
        wasRequested(name: string): boolean;
        areMeshes(names: string[]): boolean;
        getMaterial(mtllib: string, mtl: string): FxMaterial | null;
        usemtl(mtllib: string, mtl: string): void;
        RenderMesh(name: string, rc: FxRenderConfig): void;
        useTexture(textureName: string, unit: number, enable?: boolean): boolean;
        GetNode(sceneName: string, objectName: string): FxScenegraphNode | null;
        GetChildren(parentName: string): FxScenegraphNode[];
        UpdateChildTransforms(parentName?: string): void;
        AddNode(sceneName: string, objectName: string, parentNode?: string): FxScenegraphNode;
        RemoveNode(sceneName: string, objectName: string): boolean;
        GetMesh(meshName: string): FxIndexedGeometryMesh | null;
        SetGlobalParameters(rc: Fluxions.FxRenderConfig): void;
        RenderScene(renderConfigName: string, sceneName?: string): void;
        RenderDeferred(renderConfigName: string): void;
        private processTextFile;
        private loadScene;
        private loadOBJ;
        private loadMTL;
    }
}
declare class FxVertex {
    position: Vector3;
    normal: Vector3;
    color: Vector3;
    texcoord: Vector3;
    constructor(position?: Vector3, normal?: Vector3, color?: Vector3, texcoord?: Vector3);
    asFloat32Array(): Float32Array;
    asArray(): Array<number>;
}
declare class FxSurface {
    readonly mode: number;
    readonly offset: number;
    mtllib: string;
    mtl: string;
    count: number;
    constructor(mode: number, offset: number, mtllib: string, mtl: string);
    Add(): void;
}
declare namespace Fluxions {
    class FxEdge {
        v1: number;
        v2: number;
        leftFaceIndex: number;
        rightFaceIndex: number;
        leftNormal: Vector3;
        rightNormal: Vector3;
        N: Vector3;
        static makeIndex(v1: number, v2: number): number;
    }
    class FxEdgeMeshFace {
        vertices: number[];
        centerPoint: Vector3;
        normalPoint: Vector3;
        N: Vector3;
    }
    export class FxEdgeMesh {
        vertices: Vector3[];
        edges: Map<number, FxEdge>;
        faces: FxEdgeMeshFace[];
        constructor();
        readonly length: number;
        addVertex(v: Vector3): void;
        private calcNormal;
        addFace(v: number[]): void;
        addEdge(v1: number, v2: number, faceIndex: number): void;
        private _ebo;
        private _dirty;
        private _edgeData;
        eboCount: number;
        buildBuffers(gl: WebGLRenderingContext, isStatic?: boolean): WebGLBuffer | null;
    }
    export {};
}
declare namespace Fluxions {
    class FxIndexedGeometryMesh {
        private fx;
        vertices: number[];
        indices: number[];
        surfaces: FxSurface[];
        edgeMesh: FxEdgeMesh;
        private _mtllib;
        private _mtl;
        private _vertex;
        private _dirty;
        private _vbo;
        private _ibo;
        private _ebo;
        private _vboData;
        private _iboData;
        aabb: GTE.BoundingBox;
        rescaleBBox: GTE.BoundingBox | null;
        rescaleCenter: Vector3;
        constructor(fx: FxRenderingContext);
        reset(): void;
        mtllib(mtllib: string): void;
        usemtl(mtl: string): void;
        rect(x1: number, y1: number, x2: number, y2: number): void;
        circle(ox: number, oy: number, radius?: number, segments?: number): void;
        spiral(radius: number, spirality?: number, segments?: number): void;
        begin(mode: number): void;
        addIndex(i: number): void;
        readonly currentIndexCount: number;
        normal3(n: Vector3): void;
        normal(x: number, y: number, z: number): void;
        color3(c: Vector3): void;
        color(r: number, g: number, b: number): void;
        texcoord3(t: Vector3): void;
        texcoord(x: number, y: number, z: number): void;
        vertex3(v: Vector3): void;
        vertex(x: number, y: number, z: number): void;
        position(x: number, y: number, z: number): void;
        rescale(): void;
        build(): void;
        render(rc: FxRenderConfig, sg: FxScenegraph): void;
        renderplain(rc: FxRenderConfig): void;
        renderEdges(rc: FxRenderConfig): void;
        loadOBJ(lines: string[][], scenegraph?: FxScenegraph | null, path?: string | null): void;
    }
}
declare namespace XOR {
    type FxIndexedGeometryMesh = Fluxions.FxIndexedGeometryMesh;
    type FxRenderConfig = Fluxions.FxRenderConfig;
    export class MeshSystem {
        xor: LibXOR;
        meshes: Map<string, Fluxions.FxIndexedGeometryMesh>;
        constructor(xor: LibXOR);
        create(name: string): FxIndexedGeometryMesh;
        /**
         *
         * @param {string} name name of the object
         * @param {string} url location of the OBJ file
         * @returns {FxIndexedGeometryMesh}
         */
        load(name: string, url: string, rescaleBBox: GTE.BoundingBox | null | undefined, rescaleCenter: Vector3 | null): FxIndexedGeometryMesh;
        render(name: string | null, rc: FxRenderConfig): FxIndexedGeometryMesh | null;
    }
    export {};
}
declare namespace XOR {
    type TextFileLoaderCallback = (data: string, name: string, parameter: number) => void;
    export class TextFileLoaderSystem {
        private textfiles;
        constructor();
        readonly failed: boolean;
        readonly loaded: boolean;
        readonly percentLoaded: number;
        wasRequested(name: string): boolean;
        load(name: string, url: string, callbackfn: TextFileLoaderCallback, data: number): void;
    }
    export {};
}
declare namespace XOR {
    class Trigger {
        resetTime: number;
        triggerTime: number;
        triggered_: boolean;
        /**
         * TriggerTool(resetTime)
         * @param {number} resetTime How often the timer should be allowed to trigger
         */
        constructor(resetTime?: number);
        /**
         * triggered() returns 1 if trigger went off and resets it
         */
        readonly triggered: boolean;
        /**
         * wait(t1) sets the new trigger time. It does not reset the trigger
         * @param {number} t1 Sets the new trigger time
         */
        wait(t1: number): void;
        /**
         * tick(t1) returns true if the trigger went off and resets the timer
         * @param {number} t1 Time in seconds
         */
        tick(t1: number): boolean;
        /**
         * update(t1)
         * @param {number} t1 Time in seconds
         */
        update(t1: number): void;
    }
}
declare namespace XOR {
    class TriggerSystem {
        triggers: Map<string, Trigger>;
        constructor();
        set(name: string, time: number): void;
        get(name: string): Trigger;
    }
}
declare type FxIndexedGeometryMesh = Fluxions.FxIndexedGeometryMesh;
declare type FxRenderConfig = Fluxions.FxRenderConfig;
declare type FxRenderingContext = Fluxions.FxRenderingContext;
/**
 * @class LibXOR
 * @member {FxRenderingContext} fluxions
 */
declare class LibXOR {
    parentId: string;
    t1: number;
    t0: number;
    dt: number;
    frameCount: number;
    parentElement: HTMLElement;
    graphics: XOR.GraphicsSystem;
    fluxions: FxRenderingContext;
    memory: XOR.MemorySystem;
    sound: XOR.SoundSystem;
    input: XOR.InputSystem;
    palette: XOR.PaletteSystem;
    meshes: XOR.MeshSystem;
    textfiles: XOR.TextFileLoaderSystem;
    triggers: XOR.TriggerSystem;
    oninit: () => void;
    onupdate: (dt: number) => void;
    constructor(parentId: string);
    readonly renderconfigs: Fluxions.FxRenderConfigSystem;
    readonly fx: FxRenderingContext;
    start(): void;
    startFrame(t: number): void;
    mainloop(): void;
}
