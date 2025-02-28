// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// See LICENSE for details.
//
/// <reference path="./GTE.ts" />

/**
 * @class Vector3
 */
class Vector3 {
    get r(): number { return this.x; }
    get g(): number { return this.y; }
    get b(): number { return this.z; }
    set r(r: number) { this.x = r; }
    set g(g: number) { this.g = g; }
    set b(b: number) { this.z = b; }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(public x: number = 0.0, public y: number = 0.0, public z = 0.0) {
    }

    /**
     * 
     * @param {Vector3} v Copies the components of v into this vector
     */
    copy(v: Vector3): Vector3 {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    reset(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    bitOR(mask: number): Vector3 {
        return new Vector3(this.x | mask, this.y | mask, this.z | mask);
    }

    bitAND(mask: number): Vector3 {
        return new Vector3(this.x & mask, this.y & mask, this.z & mask);
    }

    bitXOR(mask: number): Vector3 {
        return new Vector3(this.x ^ mask, this.y ^ mask, this.z ^ mask);
    }

    bitNEG(): Vector3 {
        return new Vector3(~this.x, ~this.y, ~this.z);
    }

    static makeFromSpherical(theta: number, phi: number): Vector3 {
        return new Vector3(
            Math.cos(phi) * Math.cos(theta),
            Math.sin(phi),
            -Math.cos(phi) * Math.sin(theta)
        );
    }

    // Converts (rho, theta, phi) so that rho is distance from origin,
    // theta is inclination away from positive y-axis, and phi is azimuth
    // from positive z-axis towards the positive x-axis.
    static makeFromSphericalISO(rho: number, thetaInRadians: number, phiInRadians: number): Vector3 {
        return new Vector3(
            rho * Math.sin(thetaInRadians) * Math.cos(phiInRadians),
            rho * Math.cos(thetaInRadians),
            rho * Math.sin(thetaInRadians) * Math.sin(phiInRadians)
        );
    }

    // Converts (rho, theta, phi) so that rho is distance from origin,
    // phi is inclination away from positive y-axis, and theta is azimuth
    // from positive z-axis towards the positive x-axis.
    static makeFromSphericalMath(rho: number, thetaInRadians: number, phiInRadians: number): Vector3 {
        return new Vector3(
            rho * Math.sin(phiInRadians) * Math.sin(thetaInRadians),
            rho * Math.cos(phiInRadians),
            rho * Math.sin(phiInRadians) * Math.cos(thetaInRadians)
        );
    }

    static makeZero() {
        return new Vector3(0.0, 0.0, 0.0);
    }

    static makeOne() {
        return new Vector3(1.0, 1.0, 1.0);
    }

    static makeRandom(a: number, b: number) {
        return new Vector3(
            Math.random() * (b - a) + a,
            Math.random() * (b - a) + a,
            Math.random() * (b - a) + a
        );
    }

    static makeOrbit(azimuthInDegrees: number, pitchInDegrees: number, distance: number) {
        return Vector3.makeFromSpherical(GTE.radians(azimuthInDegrees), GTE.radians(pitchInDegrees)).scale(distance);
    }

    // theta represents angle from +x axis on xz plane going counterclockwise
    // phi represents angle from xz plane going towards +y axis
    setFromSpherical(theta: number, phi: number): Vector3 {
        this.x = Math.cos(theta) * Math.cos(phi);
        this.y = Math.sin(phi);
        this.z = -Math.sin(theta) * Math.cos(phi);
        return this;
    }

    get theta(): number {
        return Math.atan2(this.x, -this.z) + ((this.z <= 0.0) ? 0.0 : 2.0 * Math.PI);
    }

    get phi(): number {
        return Math.asin(this.y);
    }

    static make(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        return new Vector3(x, y, z);
    }

    static makeUnit(x: number, y: number, z: number): Vector3 {
        return (new Vector3(x, y, z)).norm();
    }

    add(v: Vector3): Vector3 {
        return new Vector3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    }

    sub(v: Vector3): Vector3 {
        return new Vector3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    }

    mul(multiplicand: number): Vector3 {
        return new Vector3(
            this.x * multiplicand,
            this.y * multiplicand,
            this.z * multiplicand
        );
    }

    scale(scalar: number): Vector3 {
        return new Vector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        );
    }

    accum(b: Vector3, bscale: number): Vector3 {
        this.x += b.x * bscale;
        this.y += b.y * bscale;
        this.z += b.z * bscale;
        return this;
    }

    compMul(b: Vector3): Vector3 {
        return new Vector3(
            this.x * b.x,
            this.y * b.y,
            this.z * b.z
        );
    }

    compDiv(b: Vector3): Vector3 {
        return new Vector3(
            this.x / b.x,
            this.y / b.y,
            this.z / b.z
        )
    }

    // returns 0 if denominator is 0
    div(divisor: number): Vector3 {
        if (divisor == 0.0)
            return new Vector3();
        return new Vector3(
            this.x / divisor,
            this.y / divisor,
            this.z / divisor
        )
    }

    // neg(): Vector3 {
    //     return new Vector3(-this.x, -this.y, -this.z);
    // }

    negate(): Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    // multiplicative inverse (1/x)
    reciprocal(): Vector3 {
        return new Vector3(1.0 / this.x, 1.0 / this.y, 1.0 / this.z);
    }

    pow(power: number): Vector3 {
        return new Vector3(
            Math.pow(this.x, power),
            Math.pow(this.y, power),
            Math.pow(this.z, power)
        );
    }

    compdiv(divisor: Vector3): Vector3 {
        return new Vector3(
            this.x / divisor.x,
            this.y / divisor.y,
            this.z / divisor.z
        );
    }

    compmul(multiplicand: Vector3): Vector3 {
        return new Vector3(
            this.x * multiplicand.x,
            this.y * multiplicand.y,
            this.z * multiplicand.z
        );
    }

    toArray(): number[] {
        return [this.x, this.y, this.z];
    }

    toFloat32Array(): Float32Array {
        return new Float32Array([this.x, this.y, this.z]);
    }

    toVector4(w: number): Vector4 {
        return new Vector4(this.x, this.y, this.z, w);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    norm(): Vector3 {
        let len = this.lengthSquared();
        if (len == 0.0)
            return new Vector3();
        else
            len = Math.sqrt(len);
        return new Vector3(this.x / len, this.y / len, this.z / len);
    }

    normalize(): Vector3 {
        let len = this.lengthSquared();
        if (len == 0.0)
            return new Vector3();
        else
            len = Math.sqrt(len);
        this.x /= len;
        this.y /= len;
        this.z /= len;
        return this;
    }

    distance(v: Vector3): number {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    distanceSquared(v: Vector3): number {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return (dx * dx + dy * dy + dz * dz);
    }

    distanceManhattan(v: Vector3): number {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
    }

    abs(): Vector3 {
        return new Vector3(
            Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)
        );
    }

    get(index: number): number {
        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
        }
        return 0.0;
    }

    set(index: number, value: number) {
        switch (index) {
            case 0: this.x = value; return;
            case 1: this.y = value; return;
            case 2: this.z = value; return;
        }
    }

    clamp(a: number, b: number): Vector3 {
        return new Vector3(
            GTE.clamp(this.x, a, b),
            GTE.clamp(this.y, a, b),
            GTE.clamp(this.z, a, b)
        );
    }

    clamp3(a: Vector3, b: Vector3): Vector3 {
        this.x = GTE.clamp(this.x, a.x, b.x);
        this.y = GTE.clamp(this.y, a.y, b.y);
        this.z = GTE.clamp(this.z, a.z, b.z);
        return this;
    }

    dirTo(v: Vector3): Vector3 {
        return Vector3.makeUnit(
            v.x - this.x,
            v.y - this.y,
            v.z - this.z
        );
    }

    static clamp3(v: Vector3, a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            GTE.clamp(v.x, a.x, b.x),
            GTE.clamp(v.y, a.y, b.y),
            GTE.clamp(v.z, a.z, b.z)
        );
    }

    static dot(v1: Vector3, v2: Vector3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            a.y * b.z - b.y * a.z,
            a.z * b.x - b.z * a.x,
            a.x * b.y - b.x * a.y
        );
    }

    static add(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static sub(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    static mul(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x * b.x, a.y * b.y, a.z * b.z);
    }

    static div(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x / b.x, a.y / b.y, a.z / b.z);
    }

    static min(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.min(a.z, b.z)
        );
    }

    static max(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            Math.max(a.x, b.x),
            Math.max(a.y, b.y),
            Math.max(a.z, b.z)
        );
    }
}
