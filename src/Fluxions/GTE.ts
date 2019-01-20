// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
/// <reference path="./Vector2.ts" />
/// <reference path="./Vector3.ts" />
/// <reference path="./Vector4.ts" />
/// <reference path="./Matrix3.ts" />
/// <reference path="./Matrix4.ts" />
/// <reference path="./Sphere.ts" />
/// <reference path="./BoundingBox.ts" />

namespace GTE {
    export function clamp(x: number, a: number, b: number) {
        return x < a ? a : x > b ? b : x;
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

    export function vec3(x: number, y: number, z: number): Vector3 {
        return new Vector3(x, y, z);
    }

    export function vec4(x: number, y: number, z: number, w: number): Vector4 {
        return new Vector4(x, y, z, w);
    }
}