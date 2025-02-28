// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// See LICENSE for details.
//
/// <reference path="./Vector2.ts" />
/// <reference path="./Vector3.ts" />
/// <reference path="./Vector4.ts" />
/// <reference path="./Matrix3.ts" />
/// <reference path="./Matrix4.ts" />
/// <reference path="./Sphere.ts" />
/// <reference path="./BoundingBox.ts" />

/**
 * @namespace
 */
namespace GTE {
    /**
     * @returns {number} Returns a number between 0 and 255
     */
    export function randomUint8() {
        return (Math.random() * 255.99) | 0;
    }
    
    /**
     * @returns {number} Returns a number between 0 and 65535
     */
    export function randomUint16() {
        return (Math.random() * 65535.99) | 0;
    }    
    
    /**
     * Returns (x) < (a) ? (a) : (x) > (b) ? (b) : (x)
     * @param x number
     * @param a number
     * @param b number
     * @returns number
     */
    export function clamp(x: number, a: number, b: number) {
        return x < a ? a : x > b ? b : x;
    }

    /**
     * Wraps x in the range [a, b]
     * @param x The number to wrap
     * @param a The low end of the range
     * @param b The high end of the range
     */
    export function wrap(x: number, a: number, b: number) {
        let x1 = Math.min(a, b);
        let x2 = Math.max(a, b);
        if (x < x1) return x2 - (x1 - x) % (x2 - x1);
        return x1 + (x - x1) % (x2 - x1);
    }

    // 0 <= mix <= 1
    export function lerp(a: number, b: number, mix: number) {
        return mix * a + (1 - mix) * b;
    }

    export function sigmoid(x: number): number {
        let ex = Math.exp(x);
        return ex / (ex + 1);
    }

    // signzero(x) returns 1 if x >= 0 and -1 if x < 0
    export function signzero(x: number): number {
        if (x >= 0.0) return 1.0;
        return -1.0;
    }

    // sign(x, epsilon) returns 1 if x > epsilon, -1 if x < -epsilon, and 0 otherwise
    export function sign(x: number, epsilon: number = 1e-5): number {
        if (x < -epsilon) return -1.0;
        if (x > epsilon) return 1.0;
        return 0.0;
    }

    // export function distancePointLine2(point: Vector2, linePoint1: Vector2, linePoint2: Vector2): number {
    //     let v = linePoint2.sub(linePoint1);
    //     let d = v.length();
    //     let n = Math.abs(v.y * point.x - v.x * point.y + linePoint2.x * linePoint1.y - linePoint2.y * linePoint1.x);
    //     if (d != 0.0) return n / d;
    //     return 1e30;
    // }

    export function gaussian(x: number, center: number, sigma: number): number {
        let t = (x - center) / sigma;
        return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * t * t);
        //return 1 / (Math.sqrt(2.0 * sigma * sigma * Math.PI)) * Math.exp(-Math.pow(x - center, 2) / (2 * sigma * sigma));
    }

    export function degrees(x: number): number {
        return 180.0 / Math.PI * x;
    }

    export function radians(x: number): number {
        return Math.PI / 180.0 * x;
    }

    export function min3(a: number, b: number, c: number): number {
        return Math.min(Math.min(a, b), c);
    }

    export function max3(a: number, b: number, c: number): number {
        return Math.max(Math.max(a, b), c);
    }

    export function transformRT(vertex: Vector3, R: Matrix3, T: Vector3): Vector3 {
        return new Vector3(
            R.m11 * vertex.x + R.m12 * vertex.y + R.m13 * vertex.z + T.x,
            R.m21 * vertex.x + R.m22 * vertex.y + R.m23 * vertex.z + T.y,
            R.m31 * vertex.x + R.m32 * vertex.y + R.m33 * vertex.z + T.z
        );
    }

    export function length2(dx: number, dy: number): number {
        return Math.sqrt(dx * dx + dy * dy);
    }

    export function length3(dx: number, dy: number, dz: number): number {
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    export function dirTo3(p1: Vector3, p2: Vector3): Vector3 {
        return p2.sub(p1).norm();
    }

    export function vec3(x: number = 0, y: number = 0, z: number = 0): Vector3 {
        return new Vector3(x, y, z);
    }

    export function vec4(x: number = 0, y: number = 0, z: number = 0, w: number = 1): Vector4 {
        return new Vector4(x, y, z, w);
    }
}