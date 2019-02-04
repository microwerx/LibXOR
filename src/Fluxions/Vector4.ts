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
/// <reference path="GTE.ts" />


class Vector4 {
    constructor(public x: number = 0.0, public y: number = 0.0, public z = 0.0, public w = 1.0) {
    }

    copy(v: Vector4): Vector4 {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
        return this;
    }

    clone(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    reset(x: number = 0.0, y: number = 0.0, z: number = 0.0, w: number = 1.0): Vector4 {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    add(v: Vector4): Vector4 {
        return new Vector4(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
            this.w + v.w
        );
    }

    sub(v: Vector4): Vector4 {
        return new Vector4(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z,
            this.w - v.w
        );
    }

    mul(multiplicand: number): Vector4 {
        return new Vector4(
            this.x * multiplicand,
            this.y * multiplicand,
            this.z * multiplicand,
            this.w * multiplicand
        );
    }

    // returns 0 if denominator is 0
    div(divisor: number): Vector4 {
        if (divisor == 0.0)
            return new Vector4();
        return new Vector4(
            this.x / divisor,
            this.y / divisor,
            this.z / divisor,
            this.w / divisor
        )
    }

    accum(b: Vector4, bscale: number): Vector4 {
        this.x += b.x * bscale;
        this.y += b.y * bscale;
        this.z += b.z * bscale;
        this.w += b.w * bscale;
        return this;
    }    

    negate(): Vector4 {
        return new Vector4(-this.x, -this.y, -this.z, -this.w);
    }

    toFloat32Array(): Float32Array {
        return new Float32Array([this.x, this.y, this.z, this.w]);
    }

    toArray(): number[] {
        return [this.x, this.y, this.z, this.w];
    }

    toVector3(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    project(): Vector3 {
        return new Vector3(this.x / this.w, this.y / this.w, this.z / this.w);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    norm(): Vector4 {
        let len = this.lengthSquared();
        if (len == 0.0)
            return new Vector4();
        else
            len = Math.sqrt(len);
        return new Vector4(this.x / len, this.y / len, this.z / len, this.w / len);
    }

    static dot(v1: Vector4, v2: Vector4): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
    }

    static normalize(v: Vector4): Vector4 {
        let len = v.length();
        if (len == 0.0) {
            v.reset(0.0, 0.0, 0.0, 0.0);
        } else {
            v.x /= len;
            v.y /= len;
            v.z /= len;
            v.w /= len;
        }
        return v;
    }

    static make(x: number, y: number, z: number, w:number): Vector4 {
        return new Vector4(x, y, z, w);
    }

    static makeUnit(x: number, y: number, z: number, w:number): Vector4 {
        return (new Vector4(x, y, z, w)).norm();
    }    
}