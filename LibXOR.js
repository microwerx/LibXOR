"use strict";
/* eslint-disable */
/// <reference path="LibXOR.ts" />
class Hatchetfish {
    constructor(logElementId = "") {
        this._logElementId = "";
        this._logElement = null;
        this._numLines = 0;
        this.logElement = logElementId;
    }
    set logElement(id) {
        let el = document.getElementById(id);
        if (el instanceof HTMLDivElement) {
            this._logElement = el;
            this._logElementId = id;
            el.innerHTML = "";
        }
    }
    clear() {
        this._numLines = 0;
        if (this._logElement) {
            this._logElement.innerHTML = "";
        }
        let errorElement = document.getElementById("errors");
        if (errorElement) {
            errorElement.remove();
            //errorElement.innerHTML = "";
        }
    }
    writeToLog(prefix, message, ...optionalParams) {
        let text = prefix + ": " + message;
        for (let op of optionalParams) {
            if (op && op.hasOwnProperty('toString')) {
                text += " " + op.toString();
            }
            else {
                text += " <unknown>";
            }
        }
        if (this._logElement) {
            let newHTML = "<br/>" + text + this._logElement.innerHTML;
            this._logElement.innerHTML = newHTML;
            //this._logElement.appendChild(document.createElement("br"));
            //this._logElement.appendChild(document.createTextNode(text));
        }
    }
    log(message, ...optionalParams) {
        this.writeToLog("[LOG]", message, ...optionalParams);
        console.log(message, ...optionalParams);
    }
    info(message, ...optionalParams) {
        this.writeToLog("[INF]", message, ...optionalParams);
        console.info(message, ...optionalParams);
    }
    error(message, ...optionalParams) {
        this.writeToLog("[ERR]", message, ...optionalParams);
        console.error(message, ...optionalParams);
    }
    warn(message, ...optionalParams) {
        this.writeToLog("[WRN]", message, ...optionalParams);
        console.warn(message, optionalParams);
    }
    debug(message, ...optionalParams) {
        console.log(message, ...optionalParams);
    }
}
var hflog = new Hatchetfish();
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
class Vector2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    reset(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    mul(multiplicand) {
        return new Vector2(this.x * multiplicand, this.y * multiplicand);
    }
    // returns 0 if denominator is 0
    div(divisor) {
        if (divisor == 0.0)
            return new Vector2();
        return new Vector2(this.x / divisor, this.y / divisor);
    }
    negate() {
        return new Vector2(-this.x, -this.y);
    }
    accum(b, bscale) {
        this.x += b.x * bscale;
        this.y += b.y * bscale;
        return this;
    }
    toFloat32Array() {
        return new Float32Array([this.x, this.y]);
    }
    toVector2() {
        return new Vector2(this.x, this.y);
    }
    toVector3() {
        return new Vector3(this.x, this.y, 0.0);
    }
    toVector4() {
        return new Vector4(this.x, this.y, 0.0, 0.0);
    }
    project() {
        return this.x / this.y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    norm() {
        let len = this.lengthSquared();
        if (len == 0.0)
            return new Vector2();
        else
            len = Math.sqrt(len);
        return new Vector2(this.x / len, this.y / len);
    }
    clamp(a, b) {
        return new Vector2(GTE.clamp(this.x, a, b), GTE.clamp(this.y, a, b));
    }
    static make(x, y) {
        return new Vector2(x, y);
    }
    static makeRandom(minValue, maxValue) {
        return new Vector2(Math.random() * (maxValue - minValue) + minValue, Math.random() * (maxValue - minValue) + minValue);
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static cross(a, b) {
        return a.x * b.y - a.y * b.x;
    }
    static normalize(v) {
        let len = v.length();
        if (len == 0.0) {
            v.reset(0.0, 0.0);
        }
        else {
            v.x /= len;
            v.y /= len;
        }
        return v;
    }
}
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
/// <reference path="./GTE.ts" />
/**
 * @class Vector3
 */
class Vector3 {
    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    get r() { return this.x; }
    get g() { return this.y; }
    get b() { return this.z; }
    set r(r) { this.x = r; }
    set g(g) { this.g = g; }
    set b(b) { this.z = b; }
    /**
     *
     * @param {Vector3} v Copies the components of v into this vector
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    reset(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    bitOR(mask) {
        return new Vector3(this.x | mask, this.y | mask, this.z | mask);
    }
    bitAND(mask) {
        return new Vector3(this.x & mask, this.y & mask, this.z & mask);
    }
    bitXOR(mask) {
        return new Vector3(this.x ^ mask, this.y ^ mask, this.z ^ mask);
    }
    bitNEG() {
        return new Vector3(~this.x, ~this.y, ~this.z);
    }
    static makeFromSpherical(theta, phi) {
        return new Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi), -Math.cos(phi) * Math.sin(theta));
    }
    // Converts (rho, theta, phi) so that rho is distance from origin,
    // theta is inclination away from positive y-axis, and phi is azimuth
    // from positive z-axis towards the positive x-axis.
    static makeFromSphericalISO(rho, thetaInRadians, phiInRadians) {
        return new Vector3(rho * Math.sin(thetaInRadians) * Math.cos(phiInRadians), rho * Math.cos(thetaInRadians), rho * Math.sin(thetaInRadians) * Math.sin(phiInRadians));
    }
    // Converts (rho, theta, phi) so that rho is distance from origin,
    // phi is inclination away from positive y-axis, and theta is azimuth
    // from positive z-axis towards the positive x-axis.
    static makeFromSphericalMath(rho, thetaInRadians, phiInRadians) {
        return new Vector3(rho * Math.sin(phiInRadians) * Math.sin(thetaInRadians), rho * Math.cos(phiInRadians), rho * Math.sin(phiInRadians) * Math.cos(thetaInRadians));
    }
    static makeZero() {
        return new Vector3(0.0, 0.0, 0.0);
    }
    static makeOne() {
        return new Vector3(1.0, 1.0, 1.0);
    }
    static makeRandom(a, b) {
        return new Vector3(Math.random() * (b - a) + a, Math.random() * (b - a) + a, Math.random() * (b - a) + a);
    }
    // theta represents angle from +x axis on xz plane going counterclockwise
    // phi represents angle from xz plane going towards +y axis
    setFromSpherical(theta, phi) {
        this.x = Math.cos(theta) * Math.cos(phi);
        this.y = Math.sin(phi);
        this.z = -Math.sin(theta) * Math.cos(phi);
        return this;
    }
    get theta() {
        return Math.atan2(this.x, -this.z) + ((this.z <= 0.0) ? 0.0 : 2.0 * Math.PI);
    }
    get phi() {
        return Math.asin(this.y);
    }
    static make(x = 0, y = 0, z = 0) {
        return new Vector3(x, y, z);
    }
    static makeUnit(x, y, z) {
        return (new Vector3(x, y, z)).norm();
    }
    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(multiplicand) {
        return new Vector3(this.x * multiplicand, this.y * multiplicand, this.z * multiplicand);
    }
    scale(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    accum(b, bscale) {
        this.x += b.x * bscale;
        this.y += b.y * bscale;
        this.z += b.z * bscale;
        return this;
    }
    compMul(b) {
        return new Vector3(this.x * b.x, this.y * b.y, this.z * b.z);
    }
    compDiv(b) {
        return new Vector3(this.x / b.x, this.y / b.y, this.z / b.z);
    }
    // returns 0 if denominator is 0
    div(divisor) {
        if (divisor == 0.0)
            return new Vector3();
        return new Vector3(this.x / divisor, this.y / divisor, this.z / divisor);
    }
    // neg(): Vector3 {
    //     return new Vector3(-this.x, -this.y, -this.z);
    // }
    negate() {
        return new Vector3(-this.x, -this.y, -this.z);
    }
    // multiplicative inverse (1/x)
    reciprocal() {
        return new Vector3(1.0 / this.x, 1.0 / this.y, 1.0 / this.z);
    }
    pow(power) {
        return new Vector3(Math.pow(this.x, power), Math.pow(this.y, power), Math.pow(this.z, power));
    }
    compdiv(divisor) {
        return new Vector3(this.x / divisor.x, this.y / divisor.y, this.z / divisor.z);
    }
    compmul(multiplicand) {
        return new Vector3(this.x * multiplicand.x, this.y * multiplicand.y, this.z * multiplicand.z);
    }
    toArray() {
        return [this.x, this.y, this.z];
    }
    toFloat32Array() {
        return new Float32Array([this.x, this.y, this.z]);
    }
    toVector4(w) {
        return new Vector4(this.x, this.y, this.z, w);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    norm() {
        let len = this.lengthSquared();
        if (len == 0.0)
            return new Vector3();
        else
            len = Math.sqrt(len);
        return new Vector3(this.x / len, this.y / len, this.z / len);
    }
    normalize() {
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
    distance(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    distanceSquared(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return (dx * dx + dy * dy + dz * dz);
    }
    distanceManhattan(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
    }
    abs() {
        return new Vector3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }
    get(index) {
        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
        }
        return 0.0;
    }
    set(index, value) {
        switch (index) {
            case 0:
                this.x = value;
                return;
            case 1:
                this.y = value;
                return;
            case 2:
                this.z = value;
                return;
        }
    }
    clamp(a, b) {
        return new Vector3(GTE.clamp(this.x, a, b), GTE.clamp(this.y, a, b), GTE.clamp(this.z, a, b));
    }
    clamp3(a, b) {
        this.x = GTE.clamp(this.x, a.x, b.x);
        this.y = GTE.clamp(this.y, a.y, b.y);
        this.z = GTE.clamp(this.z, a.z, b.z);
        return this;
    }
    dirTo(v) {
        return Vector3.makeUnit(v.x - this.x, v.y - this.y, v.z - this.z);
    }
    static clamp3(v, a, b) {
        return new Vector3(GTE.clamp(v.x, a.x, b.x), GTE.clamp(v.y, a.y, b.y), GTE.clamp(v.z, a.z, b.z));
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static cross(a, b) {
        return new Vector3(a.y * b.z - b.y * a.z, a.z * b.x - b.z * a.x, a.x * b.y - b.x * a.y);
    }
    static add(a, b) {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }
    static sub(a, b) {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }
    static mul(a, b) {
        return new Vector3(a.x * b.x, a.y * b.y, a.z * b.z);
    }
    static div(a, b) {
        return new Vector3(a.x / b.x, a.y / b.y, a.z / b.z);
    }
    static min(a, b) {
        return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }
    static max(a, b) {
        return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }
}
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
    constructor(x = 0.0, y = 0.0, z = 0.0, w = 1.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = v.w;
        return this;
    }
    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }
    reset(x = 0.0, y = 0.0, z = 0.0, w = 1.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    add(v) {
        return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }
    sub(v) {
        return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }
    mul(multiplicand) {
        return new Vector4(this.x * multiplicand, this.y * multiplicand, this.z * multiplicand, this.w * multiplicand);
    }
    // returns 0 if denominator is 0
    div(divisor) {
        if (divisor == 0.0)
            return new Vector4();
        return new Vector4(this.x / divisor, this.y / divisor, this.z / divisor, this.w / divisor);
    }
    accum(b, bscale) {
        this.x += b.x * bscale;
        this.y += b.y * bscale;
        this.z += b.z * bscale;
        this.w += b.w * bscale;
        return this;
    }
    negate() {
        return new Vector4(-this.x, -this.y, -this.z, -this.w);
    }
    toFloat32Array() {
        return new Float32Array([this.x, this.y, this.z, this.w]);
    }
    toArray() {
        return [this.x, this.y, this.z, this.w];
    }
    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
    project() {
        return new Vector3(this.x / this.w, this.y / this.w, this.z / this.w);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    norm() {
        let len = this.lengthSquared();
        if (len == 0.0)
            return new Vector4();
        else
            len = Math.sqrt(len);
        return new Vector4(this.x / len, this.y / len, this.z / len, this.w / len);
    }
    clamp(a, b) {
        return new Vector4(GTE.clamp(this.x, a, b), GTE.clamp(this.y, a, b), GTE.clamp(this.z, a, b), GTE.clamp(this.w, a, b));
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w;
    }
    static normalize(v) {
        let len = v.length();
        if (len == 0.0) {
            v.reset(0.0, 0.0, 0.0, 0.0);
        }
        else {
            v.x /= len;
            v.y /= len;
            v.z /= len;
            v.w /= len;
        }
        return v;
    }
    static make(x, y, z, w) {
        return new Vector4(x, y, z, w);
    }
    static makeUnit(x, y, z, w) {
        return (new Vector4(x, y, z, w)).norm();
    }
}
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
/// <reference path="GTE.ts"/>
class Matrix3 {
    constructor(m11, m21, m31, m12, m22, m32, m13, m23, m33) {
        this.m11 = m11;
        this.m21 = m21;
        this.m31 = m31;
        this.m12 = m12;
        this.m22 = m22;
        this.m32 = m32;
        this.m13 = m13;
        this.m23 = m23;
        this.m33 = m33;
    }
    static makeIdentity() {
        return new Matrix3(1, 0, 0, 0, 1, 0, 0, 0, 1);
    }
    static makeZero() {
        return new Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    static makeColMajor(m11, m21, m31, m12, m22, m32, m13, m23, m33) {
        return new Matrix3(m11, m21, m31, m12, m22, m32, m13, m23, m33);
    }
    static makeRowMajor(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
        return new Matrix3(m11, m21, m31, m12, m22, m32, m13, m23, m33);
    }
    static fromRowMajorArray(v) {
        if (v.length >= 9)
            return new Matrix3(v[0], v[3], v[6], v[1], v[4], v[7], v[2], v[5], v[8]);
        return new Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    static fromColMajorArray(v) {
        if (v.length >= 9)
            return new Matrix3(v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8]);
        return new Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    static makeScale(x, y, z) {
        return Matrix3.makeRowMajor(x, 0, 0, 0, y, 0, 0, 0, z);
    }
    static makeRotation(angleInDegrees, x, y, z) {
        var c = Math.cos(angleInDegrees * Math.PI / 180.0);
        var s = Math.sin(angleInDegrees * Math.PI / 180.0);
        var invLength = 1.0 / Math.sqrt(x * x + y * y + z * z);
        x *= invLength;
        y *= invLength;
        z *= invLength;
        return Matrix3.makeRowMajor(x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s, x * z * (1 - c) - y * s, y * z * (1 - c) + x * s, z * z * (1 - c) + c);
    }
    static makeCubeFaceMatrix(face) {
        // +X
        if (face == 0)
            return Matrix3.makeRotation(90.0, 0.0, 1.0, 0.0);
        // -X
        if (face == 1)
            return Matrix3.makeRotation(270.0, 0.0, 1.0, 0.0);
        // +Y
        if (face == 2)
            return Matrix3.makeRotation(90.0, 1.0, 0.0, 0.0);
        // -Y
        if (face == 3)
            return Matrix3.makeRotation(270.0, 1.0, 0.0, 0.0);
        // +Z
        if (face == 4)
            return Matrix3.makeIdentity();
        // -Z
        if (face == 5)
            return Matrix3.makeRotation(180.0, 0.0, 1.0, 0.0);
        return new Matrix3(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    asColMajorArray() {
        return [
            this.m11, this.m21, this.m31,
            this.m12, this.m22, this.m32,
            this.m13, this.m23, this.m33
        ];
    }
    asRowMajorArray() {
        return [
            this.m11, this.m12, this.m13,
            this.m21, this.m22, this.m23,
            this.m31, this.m32, this.m33
        ];
    }
    static multiply(m1, m2) {
        return new Matrix3(m1.m11 * m2.m11 + m1.m21 * m2.m12 + m1.m31 * m2.m13, m1.m11 * m2.m21 + m1.m21 * m2.m22 + m1.m31 * m2.m23, m1.m11 * m2.m31 + m1.m21 * m2.m32 + m1.m31 * m2.m33, m1.m12 * m2.m11 + m1.m22 * m2.m12 + m1.m32 * m2.m13, m1.m12 * m2.m21 + m1.m22 * m2.m22 + m1.m32 * m2.m23, m1.m12 * m2.m31 + m1.m22 * m2.m32 + m1.m32 * m2.m33, m1.m13 * m2.m11 + m1.m23 * m2.m12 + m1.m33 * m2.m13, m1.m13 * m2.m21 + m1.m23 * m2.m22 + m1.m33 * m2.m23, m1.m13 * m2.m31 + m1.m23 * m2.m32 + m1.m33 * m2.m33);
    }
    LoadIdentity() {
        return this.copy(Matrix3.makeIdentity());
    }
    MultMatrix(m) {
        return this.copy(Matrix3.multiply(this, m));
    }
    LoadColMajor(m11, m21, m31, m12, m22, m32, m13, m23, m33) {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
        return this;
    }
    LoadRowMajor(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
        return this;
    }
    toMatrix4() {
        return Matrix4.makeRowMajor(this.m11, this.m12, this.m13, 0.0, this.m21, this.m22, this.m23, 0.0, this.m31, this.m32, this.m33, 0.0, 0.0, 0.0, 0.0, 1.0);
    }
    copy(m) {
        this.m11 = m.m11;
        this.m21 = m.m21;
        this.m31 = m.m31;
        this.m12 = m.m12;
        this.m22 = m.m22;
        this.m32 = m.m32;
        this.m13 = m.m13;
        this.m23 = m.m23;
        this.m33 = m.m33;
        return this;
    }
    clone() {
        return Matrix3.makeRowMajor(this.m11, this.m12, this.m13, this.m21, this.m22, this.m23, this.m31, this.m32, this.m33);
    }
    concat(m) {
        this.copy(Matrix3.multiply(this, m));
        return this;
    }
    transform(v) {
        return new Vector3(this.m11 * v.x + this.m12 * v.y + this.m13 * v.z, this.m21 * v.x + this.m22 * v.y + this.m23 * v.z, this.m31 * v.x + this.m32 * v.y + this.m33 * v.z);
    }
    asInverse() {
        var tmpA = this.m22 * this.m33 - this.m23 * this.m32;
        var tmpB = this.m21 * this.m32 - this.m22 * this.m31;
        var tmpC = this.m23 * this.m31 - this.m21 * this.m33;
        var tmpD = 1.0 / (this.m11 * tmpA + this.m12 * tmpC + this.m13 * tmpB);
        return new Matrix3(tmpA * tmpD, (this.m13 * this.m32 - this.m12 * this.m33) * tmpD, (this.m12 * this.m23 - this.m13 * this.m22) * tmpD, tmpC * tmpD, (this.m11 * this.m33 - this.m13 * this.m31) * tmpD, (this.m13 * this.m21 - this.m11 * this.m23) * tmpD, tmpB * tmpD, (this.m12 * this.m31 - this.m11 * this.m32) * tmpD, (this.m11 * this.m22 - this.m12 * this.m21) * tmpD);
    }
    asTranspose() {
        return new Matrix3(this.m11, this.m12, this.m13, this.m21, this.m22, this.m23, this.m31, this.m32, this.m33);
    }
} // class Matrix3
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
///<reference path="GTE.ts"/>
class Matrix4 {
    constructor(m11 = 1, m21 = 0, m31 = 0, m41 = 0, m12 = 0, m22 = 1, m32 = 0, m42 = 0, m13 = 0, m23 = 0, m33 = 1, m43 = 0, m14 = 0, m24 = 0, m34 = 0, m44 = 1) {
        this.m11 = m11;
        this.m21 = m21;
        this.m31 = m31;
        this.m41 = m41;
        this.m12 = m12;
        this.m22 = m22;
        this.m32 = m32;
        this.m42 = m42;
        this.m13 = m13;
        this.m23 = m23;
        this.m33 = m33;
        this.m43 = m43;
        this.m14 = m14;
        this.m24 = m24;
        this.m34 = m34;
        this.m44 = m44;
    }
    copy(m) {
        return this.loadMatrix(m);
    }
    clone() {
        return new Matrix4(this.m11, this.m21, this.m31, this.m41, this.m12, this.m22, this.m32, this.m42, this.m13, this.m23, this.m33, this.m43, this.m14, this.m24, this.m34, this.m44);
    }
    at(row, col) {
        if (row == 0) {
            if (col == 0)
                return this.m11;
            if (col == 1)
                return this.m12;
            if (col == 2)
                return this.m13;
            if (col == 3)
                return this.m14;
        }
        if (row == 1) {
            if (col == 0)
                return this.m21;
            if (col == 1)
                return this.m22;
            if (col == 2)
                return this.m23;
            if (col == 3)
                return this.m24;
        }
        if (row == 2) {
            if (col == 0)
                return this.m31;
            if (col == 1)
                return this.m32;
            if (col == 2)
                return this.m33;
            if (col == 3)
                return this.m34;
        }
        if (row == 3) {
            if (col == 0)
                return this.m41;
            if (col == 1)
                return this.m42;
            if (col == 2)
                return this.m43;
            if (col == 3)
                return this.m44;
        }
        return 0;
    }
    row(i) {
        switch (i) {
            case 0: return new Vector4(this.m11, this.m12, this.m13, this.m14);
            case 1: return new Vector4(this.m21, this.m22, this.m23, this.m24);
            case 2: return new Vector4(this.m31, this.m32, this.m33, this.m34);
            case 3: return new Vector4(this.m41, this.m42, this.m43, this.m44);
        }
        return new Vector4(0, 0, 0, 0);
    }
    col(i) {
        switch (i) {
            case 0: return new Vector4(this.m11, this.m21, this.m31, this.m41);
            case 1: return new Vector4(this.m12, this.m22, this.m32, this.m42);
            case 2: return new Vector4(this.m13, this.m23, this.m33, this.m43);
            case 3: return new Vector4(this.m14, this.m24, this.m34, this.m44);
        }
        return new Vector4(0, 0, 0, 0);
    }
    row3(i) {
        switch (i) {
            case 0: return new Vector3(this.m11, this.m12, this.m13);
            case 1: return new Vector3(this.m21, this.m22, this.m23);
            case 2: return new Vector3(this.m31, this.m32, this.m33);
            case 3: return new Vector3(this.m41, this.m42, this.m43);
        }
        return new Vector3(0, 0, 0);
    }
    col3(i) {
        switch (i) {
            case 0: return new Vector3(this.m11, this.m21, this.m31);
            case 1: return new Vector3(this.m12, this.m22, this.m32);
            case 2: return new Vector3(this.m13, this.m23, this.m33);
            case 3: return new Vector3(this.m14, this.m24, this.m34);
        }
        return new Vector3(0, 0, 0);
    }
    diag3() {
        return new Vector3(this.m11, this.m22, this.m33);
    }
    loadRowMajor(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m14 = m14;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m24 = m24;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
        this.m34 = m34;
        this.m41 = m41;
        this.m42 = m42;
        this.m43 = m43;
        this.m44 = m44;
        return this;
    }
    loadColMajor(m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44) {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m14 = m14;
        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m24 = m24;
        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
        this.m34 = m34;
        this.m41 = m41;
        this.m42 = m42;
        this.m43 = m43;
        this.m44 = m44;
        return this;
    }
    loadIdentity() {
        return this.loadMatrix(Matrix4.makeIdentity());
    }
    translate(x, y, z) {
        return this.multMatrix(Matrix4.makeTranslation(x, y, z));
    }
    translate3(v) {
        return this.multMatrix(Matrix4.makeTranslation(v.x, v.y, v.z));
    }
    rotate(angleInDegrees, x, y, z) {
        return this.multMatrix(Matrix4.makeRotation(angleInDegrees, x, y, z));
    }
    scale(sx, sy, sz) {
        return this.multMatrix(Matrix4.makeScale(sx, sy, sz));
    }
    lookAt(eye, center, up) {
        return this.multMatrix(Matrix4.makeLookAt2(eye, center, up));
    }
    frustum(left, right, bottom, top, near, far) {
        return this.multMatrix(Matrix4.makeFrustum(left, right, bottom, top, near, far));
    }
    ortho(left, right, bottom, top, near, far) {
        return this.multMatrix(Matrix4.makeOrtho(left, right, bottom, top, near, far));
    }
    ortho2D(left, right, bottom, top) {
        return this.multMatrix(Matrix4.makeOrtho2D(left, right, bottom, top));
    }
    perspectiveX(fovx, aspect, near, far) {
        return this.multMatrix(Matrix4.makePerspectiveX(fovx, aspect, near, far));
    }
    perspectiveY(fovy, aspect, near, far) {
        return this.multMatrix(Matrix4.makePerspectiveY(fovy, aspect, near, far));
    }
    shadowBias() {
        return this.multMatrix(Matrix4.makeShadowBias());
    }
    cubeFaceMatrix(face) {
        return this.multMatrix(Matrix4.makeCubeFaceMatrix(face));
    }
    static makeIdentity() {
        return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    static makeZero() {
        return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    static makeColMajor(m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44) {
        return new Matrix4(m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44);
    }
    static makeRowMajor(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
        return new Matrix4(m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44);
    }
    static fromRowMajorArray(v) {
        if (v.length >= 16)
            return new Matrix4(v[0], v[4], v[8], v[12], v[1], v[5], v[9], v[13], v[2], v[6], v[10], v[14], v[3], v[7], v[11], v[15]);
        return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    static fromColMajorArray(v) {
        if (v.length >= 16)
            return new Matrix4(v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9], v[10], v[11], v[12], v[13], v[14], v[15]);
        return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    static makeTranslation(x, y, z) {
        return Matrix4.makeRowMajor(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
    }
    static makeTranslation3(v) {
        return Matrix4.makeRowMajor(1, 0, 0, v.x, 0, 1, 0, v.y, 0, 0, 1, v.z, 0, 0, 0, 1);
    }
    static makeScale(x, y, z) {
        return Matrix4.makeRowMajor(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
    }
    static makeRotation(angleInDegrees, x, y, z) {
        var c = Math.cos(angleInDegrees * Math.PI / 180.0);
        var s = Math.sin(angleInDegrees * Math.PI / 180.0);
        var invLength = 1.0 / Math.sqrt(x * x + y * y + z * z);
        x *= invLength;
        y *= invLength;
        z *= invLength;
        return Matrix4.makeRowMajor(x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, 0.0, y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s, 0.0, x * z * (1 - c) - y * s, y * z * (1 - c) + x * s, z * z * (1 - c) + c, 0.0, 0.0, 0.0, 0.0, 1.0);
    }
    static makeOrtho(left, right, bottom, top, near, far) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(far + near) / (far - near);
        return Matrix4.makeRowMajor(2 / (right - left), 0, 0, tx, 0, 2 / (top - bottom), 0, ty, 0, 0, -2 / (far - near), tz, 0, 0, 0, 1);
    }
    static makeOrtho2D(left, right, bottom, top) {
        return Matrix4.makeOrtho(left, right, bottom, top, -1, 1);
    }
    static makeFrustum(left, right, bottom, top, near, far) {
        var A = (right + left) / (right - left);
        var B = (top + bottom) / (top - bottom);
        var C = -(far + near) / (far - near);
        var D = -2 * far * near / (far - near);
        return Matrix4.makeRowMajor(2 * near / (right - left), 0, A, 0, 0, 2 * near / (top - bottom), B, 0, 0, 0, C, D, 0, 0, -1, 0);
    }
    static makePerspectiveY(fovy, aspect, near, far) {
        let f = 1.0 / Math.tan(Math.PI * fovy / 360.0);
        return Matrix4.makeRowMajor(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), 2 * far * near / (near - far), 0, 0, -1, 0);
    }
    static makePerspectiveX(fovx, aspect, near, far) {
        var f = 1.0 / Math.tan(Math.PI * fovx / 360.0);
        return Matrix4.makeRowMajor(f, 0, 0, 0, 0, f * aspect, 0, 0, 0, 0, (far + near) / (near - far), 2 * far * near / (near - far), 0, 0, -1, 0);
    }
    static makeLookAt(eye, center, up) {
        let F = Vector3.sub(center, eye).norm();
        let UP = up.norm();
        let S = (Vector3.cross(F, UP)).norm();
        let U = (Vector3.cross(S, F)).norm();
        return Matrix4.multiply(Matrix4.makeRowMajor(S.x, S.y, S.z, 0, U.x, U.y, U.z, 0, -F.x, -F.y, -F.z, 0, 0, 0, 0, 1), Matrix4.makeTranslation(-eye.x, -eye.y, -eye.z));
    }
    static makeOrbit(azimuthInDegrees, pitchInDegrees, distance) {
        let center = Vector3.make();
        let eye = Vector3.makeFromSpherical(GTE.radians(azimuthInDegrees), GTE.radians(pitchInDegrees));
        eye = eye.scale(distance);
        let up = Vector3.make(0, 1, 0);
        return Matrix4.makeLookAt(eye, center, up);
    }
    static makeLookAt2(eye, center, up) {
        let F = Vector3.sub(center, eye).norm();
        let UP = up.norm();
        let S = (Vector3.cross(F, UP)).norm();
        let U = (Vector3.cross(S, F)).norm();
        return Matrix4.multiply(Matrix4.makeTranslation(-eye.x, -eye.y, -eye.z), Matrix4.makeRowMajor(S.x, S.y, S.z, 0, U.x, U.y, U.z, 0, -F.x, -F.y, -F.z, 0, 0, 0, 0, 1));
    }
    static makeShadowBias() {
        return Matrix4.makeRowMajor(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
    }
    static makeCubeFaceMatrix(face) {
        // +X
        if (face == 0)
            return Matrix4.makeRotation(90.0, 0.0, 1.0, 0.0);
        // -X
        if (face == 1)
            return Matrix4.makeRotation(270.0, 0.0, 1.0, 0.0);
        // +Y
        if (face == 2)
            return Matrix4.makeRotation(90.0, 1.0, 0.0, 0.0);
        // -Y
        if (face == 3)
            return Matrix4.makeRotation(270.0, 1.0, 0.0, 0.0);
        // +Z
        if (face == 4)
            return Matrix4.makeIdentity();
        // -Z
        if (face == 5)
            return Matrix4.makeRotation(180.0, 0.0, 1.0, 0.0);
        return new Matrix4(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    toColMajorArray() {
        return [
            this.m11, this.m21, this.m31, this.m41,
            this.m12, this.m22, this.m32, this.m42,
            this.m13, this.m23, this.m33, this.m43,
            this.m14, this.m24, this.m34, this.m44
        ];
    }
    toRowMajorArray() {
        return [
            this.m11, this.m12, this.m13, this.m14,
            this.m21, this.m22, this.m23, this.m24,
            this.m31, this.m32, this.m33, this.m34,
            this.m41, this.m42, this.m43, this.m44
        ];
    }
    static multiply3(a, b, c) {
        return Matrix4.multiply(a, Matrix4.multiply(b, c));
    }
    static multiply(a, b) {
        return Matrix4.makeRowMajor(a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41, a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42, a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43, a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44, a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41, a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42, a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43, a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44, a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41, a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42, a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43, a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44, a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41, a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42, a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43, a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44);
        return new Matrix4(a.m11 * b.m11 + a.m21 * b.m12 + a.m31 * b.m13 + a.m41 * b.m14, a.m11 * b.m21 + a.m21 * b.m22 + a.m31 * b.m23 + a.m41 * b.m24, a.m11 * b.m31 + a.m21 * b.m32 + a.m31 * b.m33 + a.m41 * b.m34, a.m11 * b.m41 + a.m21 * b.m42 + a.m31 * b.m43 + a.m41 * b.m44, a.m12 * b.m11 + a.m22 * b.m12 + a.m32 * b.m13 + a.m42 * b.m14, a.m12 * b.m21 + a.m22 * b.m22 + a.m32 * b.m23 + a.m42 * b.m24, a.m12 * b.m31 + a.m22 * b.m32 + a.m32 * b.m33 + a.m42 * b.m34, a.m12 * b.m41 + a.m22 * b.m42 + a.m32 * b.m43 + a.m42 * b.m44, a.m13 * b.m11 + a.m23 * b.m12 + a.m33 * b.m13 + a.m43 * b.m14, a.m13 * b.m21 + a.m23 * b.m22 + a.m33 * b.m23 + a.m43 * b.m24, a.m13 * b.m31 + a.m23 * b.m32 + a.m33 * b.m33 + a.m43 * b.m34, a.m13 * b.m41 + a.m23 * b.m42 + a.m33 * b.m43 + a.m43 * b.m44, a.m14 * b.m11 + a.m24 * b.m12 + a.m34 * b.m13 + a.m44 * b.m14, a.m14 * b.m21 + a.m24 * b.m22 + a.m34 * b.m23 + a.m44 * b.m24, a.m14 * b.m31 + a.m24 * b.m32 + a.m34 * b.m33 + a.m44 * b.m34, a.m14 * b.m41 + a.m24 * b.m42 + a.m34 * b.m43 + a.m44 * b.m44);
    }
    loadMatrix(m) {
        this.m11 = m.m11;
        this.m21 = m.m21;
        this.m31 = m.m31;
        this.m41 = m.m41;
        this.m12 = m.m12;
        this.m22 = m.m22;
        this.m32 = m.m32;
        this.m42 = m.m42;
        this.m13 = m.m13;
        this.m23 = m.m23;
        this.m33 = m.m33;
        this.m43 = m.m43;
        this.m14 = m.m14;
        this.m24 = m.m24;
        this.m34 = m.m34;
        this.m44 = m.m44;
        return this;
    }
    multMatrix(m) {
        this.loadMatrix(Matrix4.multiply(this, m));
        return this;
    }
    transform(v) {
        return new Vector4(this.m11 * v.x + this.m12 * v.y + this.m13 * v.z + this.m14 * v.w, this.m21 * v.x + this.m22 * v.y + this.m23 * v.z + this.m24 * v.w, this.m31 * v.x + this.m32 * v.y + this.m33 * v.z + this.m34 * v.w, this.m41 * v.x + this.m42 * v.y + this.m43 * v.z + this.m44 * v.w);
    }
    transform3(v) {
        return new Vector3(this.m11 * v.x + this.m12 * v.y + this.m13 * v.z + this.m14, this.m21 * v.x + this.m22 * v.y + this.m23 * v.z + this.m24, this.m31 * v.x + this.m32 * v.y + this.m33 * v.z + this.m34);
    }
    asInverse() {
        var tmp1 = this.m32 * this.m43 - this.m33 * this.m42;
        var tmp2 = this.m32 * this.m44 - this.m34 * this.m42;
        var tmp3 = this.m33 * this.m44 - this.m34 * this.m43;
        var tmp4 = this.m22 * tmp3 - this.m23 * tmp2 + this.m24 * tmp1;
        var tmp5 = this.m31 * this.m42 - this.m32 * this.m41;
        var tmp6 = this.m31 * this.m43 - this.m33 * this.m41;
        var tmp7 = -this.m21 * tmp1 + this.m22 * tmp6 - this.m23 * tmp5;
        var tmp8 = this.m31 * this.m44 - this.m34 * this.m41;
        var tmp9 = this.m21 * tmp2 - this.m22 * tmp8 + this.m24 * tmp5;
        var tmp10 = -this.m21 * tmp3 + this.m23 * tmp8 - this.m24 * tmp6;
        var tmp11 = 1 / (this.m11 * tmp4 + this.m12 * tmp10 + this.m13 * tmp9 + this.m14 * tmp7);
        var tmp12 = this.m22 * this.m43 - this.m23 * this.m42;
        var tmp13 = this.m22 * this.m44 - this.m24 * this.m42;
        var tmp14 = this.m23 * this.m44 - this.m24 * this.m43;
        var tmp15 = this.m22 * this.m33 - this.m23 * this.m32;
        var tmp16 = this.m22 * this.m34 - this.m24 * this.m32;
        var tmp17 = this.m23 * this.m34 - this.m24 * this.m33;
        var tmp18 = this.m21 * this.m43 - this.m23 * this.m41;
        var tmp19 = this.m21 * this.m44 - this.m24 * this.m41;
        var tmp20 = this.m21 * this.m33 - this.m23 * this.m31;
        var tmp21 = this.m21 * this.m34 - this.m24 * this.m31;
        var tmp22 = this.m21 * this.m42 - this.m22 * this.m41;
        var tmp23 = this.m21 * this.m32 - this.m22 * this.m31;
        return Matrix4.makeRowMajor(tmp4 * tmp11, (-this.m12 * tmp3 + this.m13 * tmp2 - this.m14 * tmp1) * tmp11, (this.m12 * tmp14 - this.m13 * tmp13 + this.m14 * tmp12) * tmp11, (-this.m12 * tmp17 + this.m13 * tmp16 - this.m14 * tmp15) * tmp11, tmp10 * tmp11, (this.m11 * tmp3 - this.m13 * tmp8 + this.m14 * tmp6) * tmp11, (-this.m11 * tmp14 + this.m13 * tmp19 - this.m14 * tmp18) * tmp11, (this.m11 * tmp17 - this.m13 * tmp21 + this.m14 * tmp20) * tmp11, tmp9 * tmp11, (-this.m11 * tmp2 + this.m12 * tmp8 - this.m14 * tmp5) * tmp11, (this.m11 * tmp13 - this.m12 * tmp19 + this.m14 * tmp22) * tmp11, (-this.m11 * tmp16 + this.m12 * tmp21 - this.m14 * tmp23) * tmp11, tmp7 * tmp11, (this.m11 * tmp1 - this.m12 * tmp6 + this.m13 * tmp5) * tmp11, (-this.m11 * tmp12 + this.m12 * tmp18 - this.m13 * tmp22) * tmp11, (this.m11 * tmp15 - this.m12 * tmp20 + this.m13 * tmp23) * tmp11);
    }
    asTranspose() {
        return new Matrix4(this.m11, this.m12, this.m13, this.m14, this.m21, this.m22, this.m23, this.m24, this.m31, this.m32, this.m33, this.m34, this.m41, this.m42, this.m43, this.m44);
    }
    asTopLeft3x3() {
        return new Matrix3(this.m11, this.m21, this.m31, this.m12, this.m22, this.m32, this.m13, this.m23, this.m33);
    }
} // class Matrix4
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
/// <reference path="GTE.ts"/>
var GTE;
(function (GTE) {
    class Sphere {
        constructor(radius, center) {
            this.radius = 1.0;
            this.center = Vector3.makeZero();
            this.radius = radius;
            this.center = center.clone();
        }
        clone() {
            return new Sphere(this.radius, this.center);
        }
        copy(s) {
            this.radius = s.radius;
            this.center.copy(s.center);
            return this;
        }
        // signed distance function
        sdf(p) {
            return (p.sub(this.center)).length() - this.radius;
        }
        // support mapping
        support(n) {
            return n.mul(this.radius).add(this.center);
        }
        // return shortest distance between another sphere
        distance(s) {
            return this.center.distance(s.center);
        }
        intersectsSphere(s) {
            return this.distance(s) < this.radius + s.radius;
        }
    }
    GTE.Sphere = Sphere;
})(GTE || (GTE = {}));
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
/// <reference path="GTE.ts"/>
var GTE;
(function (GTE) {
    /**
     * @class
     */
    class BoundingBox {
        /**
         * @constructor
         */
        constructor() {
            this.minBounds = Vector3.make(1e6, 1e6, 1e6);
            this.maxBounds = Vector3.make(-1e6, -1e6, -1e6);
        }
        /**
         * Copy b into this
         * @param {BoundingBox} b bounding box to copy from
         * @returns {BoundingBox}
         */
        copy(b) {
            this.minBounds.copy(b.minBounds);
            this.maxBounds.copy(b.maxBounds);
            return this;
        }
        /**
         * Clone this bounding box
         * @returns {BoundingBox}
         */
        clone() {
            let b = new BoundingBox();
            return b.copy(this);
        }
        /**
         * Returns true if bbox is the same as this
         * @param {BoundingBox} bbox bounding box to compare against
         */
        sameAs(bbox) {
            if (this.maxBounds.distanceSquared(bbox.maxBounds) >= 0.0001)
                return false;
            if (this.minBounds.distanceSquared(bbox.minBounds) >= 0.0001)
                return false;
            return true;
        }
        /**
         * @returns {string}
         */
        get whdString() { return this.width.toFixed(2) + "x" + this.height.toFixed(2) + "x" + this.depth.toFixed(2); }
        /**
         * @returns {string}
         */
        get minString() { return "(" + this.minBounds.x.toFixed(2) + ", " + this.minBounds.y.toFixed(2) + ", " + this.minBounds.z.toFixed(2) + ")"; }
        /**
         * @returns {string}
         */
        get maxString() { return "(" + this.maxBounds.x.toFixed(2) + ", " + this.maxBounds.y.toFixed(2) + ", " + this.maxBounds.z.toFixed(2) + ")"; }
        /**
         * @returns {number}
         */
        get width() { return this.maxBounds.x - this.minBounds.x; }
        /**
         * @returns {number}
         */
        get height() { return this.maxBounds.y - this.minBounds.y; }
        /**
         * @returns {number}
         */
        get depth() { return this.maxBounds.z - this.minBounds.z; }
        /**
         * @returns {number}
         */
        get maxSize() { return GTE.max3(this.width, this.height, this.depth); }
        /**
         * @returns {number}
         */
        get minSize() { return GTE.min3(this.width, this.height, this.depth); }
        /**
         * @returns {number}
         */
        get x() { return 0.5 * (this.minBounds.x + this.maxBounds.x); }
        /**
         * @returns {number}
         */
        get y() { return 0.5 * (this.minBounds.y + this.maxBounds.y); }
        /**
         * @returns {number}
         */
        get z() { return 0.5 * (this.minBounds.z + this.maxBounds.z); }
        /**
         * @returns {number}
         */
        get left() { return this.minBounds.x; }
        /**
         * @returns {number}
         */
        get right() { return this.maxBounds.x; }
        /**
         * @returns {number}
         */
        get top() { return this.maxBounds.y; }
        /**
         * @returns {number}
         */
        get bottom() { return this.minBounds.y; }
        /**
         * @returns {number}
         */
        get front() { return this.minBounds.z; }
        /**
         * @returns {number}
         */
        get back() { return this.maxBounds.z; }
        /**
         * Returns bounding sphere
         * @returns {Sphere}
         */
        get outsideSphere() {
            let d = (0.5 * this.maxSize); // distance from center to largest diagonal
            let r = Math.sqrt(d * d + d * d);
            return new GTE.Sphere(r, this.center);
        }
        /**
         * Returns smallest sphere inside bounding box
         * @returns {Sphere}
         */
        get insideSphere() {
            let r = 0.5 * this.maxSize;
            return new GTE.Sphere(r, this.center);
        }
        /**
         * @returns {Vector3} (width, height, length) of bounding box
         */
        get size() {
            return Vector3.make(this.maxBounds.x - this.minBounds.x, this.maxBounds.y - this.minBounds.y, this.maxBounds.z - this.minBounds.z);
        }
        /**
         * Returns center of AABB
         * @returns {Vector3} (x, y, z) of center of AABB
         */
        get center() {
            return Vector3.make(0.5 * (this.minBounds.x + this.maxBounds.x), 0.5 * (this.minBounds.y + this.maxBounds.y), 0.5 * (this.minBounds.z + this.maxBounds.z));
        }
        /**
         * Adds a point to the AABB
         * @param {Vector3} p point to add to AABB
         * @returns {BoundingBox} returns this pointer
         */
        add(p) {
            this.minBounds = Vector3.min(this.minBounds, p);
            this.maxBounds = Vector3.max(this.maxBounds, p);
            return this;
        }
        /**
         * Resets bounding box to inverted box
         * @returns {BoundingBox} returns this pointer
         */
        reset() {
            this.minBounds = Vector3.make(1e6, 1e6, 1e6);
            this.maxBounds = Vector3.make(-1e6, -1e6, -1e6);
            return this;
        }
        /**
         *
         * @param {BoundingBox} aabb bounding box to compare with
         * @returns {boolean}
         */
        intersectsAABB(aabb) {
            let Xoverlap = true;
            let Yoverlap = true;
            let Zoverlap = true;
            let a = this;
            let b = aabb;
            if (a.left > b.right || a.right < b.left)
                Xoverlap = false;
            if (a.bottom > b.top || a.top < b.bottom)
                Yoverlap = false;
            if (a.front > b.back || b.back < b.front)
                Zoverlap = false;
            return Xoverlap || Yoverlap || Zoverlap;
        }
        /**
         * Returns signed distance between this box and p
         * @param {Vector3} p Test point
         */
        sdf(p) {
            let c = this.center;
            return GTE.max3(Math.abs(p.x - c.x) - this.width * 0.5, Math.abs(p.y - c.y) - this.height * 0.5, Math.abs(p.z - c.z) - this.depth * 0.5);
        }
        /**
         * Returns support mapping
         * @param {Vector3} n Check against support vector
         * @returns {Vector3}
         */
        support(n) {
            let c = this.center;
            return new Vector3(c.x + 0.5 * this.width * GTE.sign(n.x), c.y + 0.5 * this.height * GTE.sign(n.y), c.z + 0.5 * this.depth * GTE.sign(n.z));
        }
    }
    GTE.BoundingBox = BoundingBox;
})(GTE || (GTE = {}));
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
/**
 * @namespace
 */
var GTE;
(function (GTE) {
    /**
     * @returns {number} Returns a number between 0 and 255
     */
    function randomUint8() {
        return (Math.random() * 255.99) | 0;
    }
    GTE.randomUint8 = randomUint8;
    /**
     * @returns {number} Returns a number between 0 and 65535
     */
    function randomUint16() {
        return (Math.random() * 65535.99) | 0;
    }
    GTE.randomUint16 = randomUint16;
    /**
     * Returns (x) < (a) ? (a) : (x) > (b) ? (b) : (x)
     * @param x number
     * @param a number
     * @param b number
     * @returns number
     */
    function clamp(x, a, b) {
        return x < a ? a : x > b ? b : x;
    }
    GTE.clamp = clamp;
    /**
     * Wraps x in the range [a, b]
     * @param x The number to wrap
     * @param a The low end of the range
     * @param b The high end of the range
     */
    function wrap(x, a, b) {
        let x1 = Math.min(a, b);
        let x2 = Math.max(a, b);
        if (x < x1)
            return x2 - (x1 - x) % (x2 - x1);
        return x1 + (x - x1) % (x2 - x1);
    }
    GTE.wrap = wrap;
    // 0 <= mix <= 1
    function lerp(a, b, mix) {
        return mix * a + (1 - mix) * b;
    }
    GTE.lerp = lerp;
    function sigmoid(x) {
        let ex = Math.exp(x);
        return ex / (ex + 1);
    }
    GTE.sigmoid = sigmoid;
    // signzero(x) returns 1 if x >= 0 and -1 if x < 0
    function signzero(x) {
        if (x >= 0.0)
            return 1.0;
        return -1.0;
    }
    GTE.signzero = signzero;
    // sign(x, epsilon) returns 1 if x > epsilon, -1 if x < -epsilon, and 0 otherwise
    function sign(x, epsilon = 1e-5) {
        if (x < -epsilon)
            return -1.0;
        if (x > epsilon)
            return 1.0;
        return 0.0;
    }
    GTE.sign = sign;
    // export function distancePointLine2(point: Vector2, linePoint1: Vector2, linePoint2: Vector2): number {
    //     let v = linePoint2.sub(linePoint1);
    //     let d = v.length();
    //     let n = Math.abs(v.y * point.x - v.x * point.y + linePoint2.x * linePoint1.y - linePoint2.y * linePoint1.x);
    //     if (d != 0.0) return n / d;
    //     return 1e30;
    // }
    function gaussian(x, center, sigma) {
        let t = (x - center) / sigma;
        return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * t * t);
        //return 1 / (Math.sqrt(2.0 * sigma * sigma * Math.PI)) * Math.exp(-Math.pow(x - center, 2) / (2 * sigma * sigma));
    }
    GTE.gaussian = gaussian;
    function degrees(x) {
        return 180.0 / Math.PI * x;
    }
    GTE.degrees = degrees;
    function radians(x) {
        return Math.PI / 180.0 * x;
    }
    GTE.radians = radians;
    function min3(a, b, c) {
        return Math.min(Math.min(a, b), c);
    }
    GTE.min3 = min3;
    function max3(a, b, c) {
        return Math.max(Math.max(a, b), c);
    }
    GTE.max3 = max3;
    function transformRT(vertex, R, T) {
        return new Vector3(R.m11 * vertex.x + R.m12 * vertex.y + R.m13 * vertex.z + T.x, R.m21 * vertex.x + R.m22 * vertex.y + R.m23 * vertex.z + T.y, R.m31 * vertex.x + R.m32 * vertex.y + R.m33 * vertex.z + T.z);
    }
    GTE.transformRT = transformRT;
    function length2(dx, dy) {
        return Math.sqrt(dx * dx + dy * dy);
    }
    GTE.length2 = length2;
    function length3(dx, dy, dz) {
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    GTE.length3 = length3;
    function dirTo3(p1, p2) {
        return p2.sub(p1).norm();
    }
    GTE.dirTo3 = dirTo3;
    function vec3(x = 0, y = 0, z = 0) {
        return new Vector3(x, y, z);
    }
    GTE.vec3 = vec3;
    function vec4(x = 0, y = 0, z = 0, w = 1) {
        return new Vector4(x, y, z, w);
    }
    GTE.vec4 = vec4;
})(GTE || (GTE = {}));
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
///- <reference path="FxRenderingContext.ts" />
///- <reference path="RenderConfig.ts" />
///- <reference path="TextParser.ts" />
var XOR;
(function (XOR) {
    // return last part of the url name ignoring possible ending slash
    function GetURLResource(url) {
        let parts = url.split('/');
        let lastSection = parts.pop() || parts.pop();
        if (lastSection) {
            return lastSection;
        }
        else {
            return "unknown";
        }
    }
    XOR.GetURLResource = GetURLResource;
    function GetURLPath(url) {
        let parts = url.split('/');
        if (!parts.pop())
            parts.pop();
        let path = parts.join("/") + "/";
        if (path) {
            return path;
        }
        else {
            return "";
        }
    }
    XOR.GetURLPath = GetURLPath;
    function IsExtension(sourceString, extensionWithDot) {
        let start = sourceString.length - extensionWithDot.length - 1;
        if (start >= 0 && sourceString.substr(start, extensionWithDot.length) == extensionWithDot) {
            return true;
        }
        return false;
    }
    XOR.IsExtension = IsExtension;
    function GetExtension(sourceString) {
        let position = sourceString.lastIndexOf(".");
        if (position >= 0) {
            return sourceString.substr(position + 1).toLowerCase();
        }
        return "";
    }
    XOR.GetExtension = GetExtension;
    class ShaderLoader {
        constructor(vertShaderUrl, fragShaderUrl, callbackfn) {
            this.vertShaderUrl = vertShaderUrl;
            this.fragShaderUrl = fragShaderUrl;
            this.callbackfn = callbackfn;
            this.vertLoaded = false;
            this.fragLoaded = false;
            this.vertFailed = false;
            this.fragFailed = false;
            this.vertShaderSource = "";
            this.fragShaderSource = "";
            let self = this;
            let vertXHR = new XMLHttpRequest();
            vertXHR.addEventListener("load", (e) => {
                self.vertShaderSource = vertXHR.responseText;
                self.vertLoaded = true;
                if (this.loaded) {
                    self.callbackfn(self.vertShaderSource, self.fragShaderSource);
                }
            });
            vertXHR.addEventListener("abort", (e) => {
                self.vertFailed = true;
                console.error("unable to GET " + vertShaderUrl);
            });
            vertXHR.addEventListener("error", (e) => {
                self.vertFailed = true;
                console.error("unable to GET " + vertShaderUrl);
            });
            vertXHR.open("GET", vertShaderUrl);
            vertXHR.send();
            let fragXHR = new XMLHttpRequest();
            fragXHR.addEventListener("load", (e) => {
                self.fragShaderSource = fragXHR.responseText;
                self.fragLoaded = true;
                if (this.loaded) {
                    self.callbackfn(self.vertShaderSource, self.fragShaderSource);
                }
            });
            fragXHR.addEventListener("abort", (e) => {
                self.fragFailed = true;
                console.error("unable to GET " + fragShaderUrl);
            });
            fragXHR.addEventListener("error", (e) => {
                self.vertFailed = true;
                console.error("unable to GET " + fragShaderUrl);
            });
            fragXHR.open("GET", fragShaderUrl);
            fragXHR.send();
        }
        get failed() { return this.vertFailed || this.fragFailed; }
        get loaded() { return this.vertLoaded && this.fragLoaded; }
    }
    XOR.ShaderLoader = ShaderLoader;
    class TextFileLoader {
        constructor(url, callbackfn, parameter = 0) {
            this.callbackfn = callbackfn;
            this._loaded = false;
            this._failed = false;
            this.data = "";
            this.name = GetURLResource(url);
            let self = this;
            let xhr = new XMLHttpRequest();
            xhr.addEventListener("load", (e) => {
                if (!xhr.responseText) {
                    self._failed = true;
                    self.data = "unknown";
                }
                else {
                    self.data = xhr.responseText;
                }
                self._loaded = true;
                callbackfn(self.data, self.name, parameter);
                hflog.log("Loaded " + url);
            });
            xhr.addEventListener("abort", (e) => {
                self._failed = true;
                hflog.error("[abort] unable to GET " + url);
            });
            xhr.addEventListener("error", (e) => {
                self._failed = true;
                hflog.error("[error] unable to GET " + url);
            });
            xhr.open("GET", url);
            xhr.send();
        }
        get loaded() { return this._loaded; }
        get failed() { return this._failed; }
    }
    XOR.TextFileLoader = TextFileLoader;
    class ImageFileLoader {
        constructor(url, callbackfn, parameter = 0) {
            this.callbackfn = callbackfn;
            this._loaded = false;
            this._failed = false;
            this.image = new Image();
            this.name = GetURLResource(url);
            let self = this;
            this.image.addEventListener("load", (e) => {
                self._loaded = true;
                callbackfn(self.image, this.name, parameter);
            });
            this.image.addEventListener("error", (e) => {
                self._failed = true;
                console.error("unable to GET " + url);
            });
            this.image.addEventListener("abort", (e) => {
                self._failed = true;
                console.error("unable to GET " + url);
            });
            this.image.src = url;
        }
        get loaded() { return this._loaded; }
        get failed() { return this._failed; }
    }
    XOR.ImageFileLoader = ImageFileLoader;
    function SeparateCubeMapImages(image, images) {
        if (image.width != 6 * image.height) {
            return;
        }
        // images are laid out: +X, -X, +Y, -Y, +Z, -Z
        let canvas = document.createElement("canvas");
        if (canvas) {
            canvas.width = image.width;
            canvas.height = image.height;
            let ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(image, 0, 0);
                for (let i = 0; i < 6; i++) {
                    images[i] = ctx.getImageData(i * image.height, 0, image.height, image.height);
                }
            }
        }
    }
    XOR.SeparateCubeMapImages = SeparateCubeMapImages;
    function niceTimestamp(timestamp) {
        return (Math.round(1000.0 * timestamp) / 1000.0).toString() + "ms";
    }
    XOR.niceTimestamp = niceTimestamp;
    function niceFramesPerSecond(t0, t1) {
        let s = (t1 - t0);
        return Math.round(1.0 / s).toString() + "fps";
    }
    XOR.niceFramesPerSecond = niceFramesPerSecond;
    function niceDuration(t0, t1) {
        return ((Math.round(1000.0 * (t1 - t0))) / 1000.0).toString() + "ms";
    }
    XOR.niceDuration = niceDuration;
    function round3(x) {
        return Math.round(x * 1000.0) / 1000.0;
    }
    XOR.round3 = round3;
    function round3str(x) {
        return (Math.round(x * 1000.0) / 1000.0).toString();
    }
    XOR.round3str = round3str;
    function niceVector(v) {
        return "(" + round3str(v.x) + ", " + round3str(v.y) + ", " + round3str(v.z) + ")";
    }
    XOR.niceVector = niceVector;
    function niceNumber(x, digits) {
        let t = Math.pow(10.0, digits);
        return (Math.round(x * t) / t).toString();
    }
    XOR.niceNumber = niceNumber;
    function niceMatrix4(m) {
        return "("
            + round3str(m.m11) + ", " + round3str(m.m12) + ", " + round3str(m.m13) + ", " + round3str(m.m14) + ", "
            + round3str(m.m21) + ", " + round3str(m.m22) + ", " + round3str(m.m23) + ", " + round3str(m.m24) + ", "
            + round3str(m.m31) + ", " + round3str(m.m32) + ", " + round3str(m.m33) + ", " + round3str(m.m34) + ", "
            + round3str(m.m41) + ", " + round3str(m.m42) + ", " + round3str(m.m43) + ", " + round3str(m.m44)
            + ")";
    }
    XOR.niceMatrix4 = niceMatrix4;
    class GLTypeInfo {
        constructor(type, baseType, components, sizeOfType) {
            this.type = type;
            this.baseType = baseType;
            this.components = components;
            this.sizeOfType = sizeOfType;
        }
        CreateArray(size) {
            switch (this.type) {
                case WebGLRenderingContext.FLOAT:
                case WebGLRenderingContext.FLOAT_VEC2:
                case WebGLRenderingContext.FLOAT_VEC3:
                case WebGLRenderingContext.FLOAT_VEC4:
                case WebGLRenderingContext.FLOAT_MAT2:
                case WebGLRenderingContext.FLOAT_MAT3:
                case WebGLRenderingContext.FLOAT_MAT4:
                    return new Float32Array(size);
                case WebGLRenderingContext.INT:
                case WebGLRenderingContext.INT_VEC2:
                case WebGLRenderingContext.INT_VEC3:
                case WebGLRenderingContext.INT_VEC4:
                    return new Int32Array(size);
                case WebGLRenderingContext.SHORT:
                    return new Int16Array(size);
                case WebGLRenderingContext.UNSIGNED_INT:
                    return new Uint32Array(size);
                case WebGLRenderingContext.UNSIGNED_SHORT:
                    return new Uint16Array(size);
                case WebGLRenderingContext.UNSIGNED_BYTE:
                    return new Uint8ClampedArray(size);
                case WebGLRenderingContext.BOOL:
                    return new Uint32Array(size);
            }
            return null;
        }
    }
    XOR.WebGLTypeInfo = new Map([
        [WebGLRenderingContext.BYTE, new GLTypeInfo(WebGLRenderingContext.BYTE, WebGLRenderingContext.BYTE, 1, 1)],
        [WebGLRenderingContext.UNSIGNED_BYTE, new GLTypeInfo(WebGLRenderingContext.UNSIGNED_BYTE, WebGLRenderingContext.UNSIGNED_BYTE, 1, 1)],
        [WebGLRenderingContext.SHORT, new GLTypeInfo(WebGLRenderingContext.SHORT, WebGLRenderingContext.SHORT, 1, 2)],
        [WebGLRenderingContext.UNSIGNED_SHORT, new GLTypeInfo(WebGLRenderingContext.UNSIGNED_SHORT, WebGLRenderingContext.UNSIGNED_SHORT, 1, 2)],
        [WebGLRenderingContext.INT, new GLTypeInfo(WebGLRenderingContext.INT, WebGLRenderingContext.INT, 1, 4)],
        [WebGLRenderingContext.UNSIGNED_INT, new GLTypeInfo(WebGLRenderingContext.UNSIGNED_INT, WebGLRenderingContext.UNSIGNED_INT, 1, 4)],
        [WebGLRenderingContext.BOOL, new GLTypeInfo(WebGLRenderingContext.BOOL, WebGLRenderingContext.INT, 1, 4)],
        [WebGLRenderingContext.FLOAT, new GLTypeInfo(WebGLRenderingContext.FLOAT, WebGLRenderingContext.FLOAT, 1, 4)],
        [WebGLRenderingContext.FLOAT_VEC2, new GLTypeInfo(WebGLRenderingContext.FLOAT_VEC2, WebGLRenderingContext.FLOAT, 2, 4)],
        [WebGLRenderingContext.FLOAT_VEC3, new GLTypeInfo(WebGLRenderingContext.FLOAT_VEC3, WebGLRenderingContext.FLOAT, 3, 4)],
        [WebGLRenderingContext.FLOAT_VEC4, new GLTypeInfo(WebGLRenderingContext.FLOAT_VEC4, WebGLRenderingContext.FLOAT, 4, 4)],
        [WebGLRenderingContext.FLOAT_MAT2, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT2, WebGLRenderingContext.FLOAT, 4, 4)],
        [WebGLRenderingContext.FLOAT_MAT3, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT3, WebGLRenderingContext.FLOAT, 9, 4)],
        [WebGLRenderingContext.FLOAT_MAT4, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT4, WebGLRenderingContext.FLOAT, 16, 4)],
        // [WebGLRenderingContext.FLOAT_MAT2x3, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT2x3, WebGLRenderingContext.FLOAT, 6, 4)],
        // [WebGLRenderingContext.FLOAT_MAT2x4, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT2x4, WebGLRenderingContext.FLOAT, 8, 4)],
        // [WebGLRenderingContext.FLOAT_MAT3x2, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT3x2, WebGLRenderingContext.FLOAT, 6, 4)],
        // [WebGLRenderingContext.FLOAT_MAT3x4, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT3x4, WebGLRenderingContext.FLOAT, 12, 4)],
        // [WebGLRenderingContext.FLOAT_MAT4x2, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT4x2, WebGLRenderingContext.FLOAT, 8, 4)],
        // [WebGLRenderingContext.FLOAT_MAT4x3, new GLTypeInfo(WebGLRenderingContext.FLOAT_MAT4x3, WebGLRenderingContext.FLOAT, 12, 4)],
        // [WebGLRenderingContext.SAMPLER_1D, new GLTypeInfo(WebGLRenderingContext.SAMPLER_1D, WebGLRenderingContext.FLOAT, 1, 4)],
        [WebGLRenderingContext.SAMPLER_2D, new GLTypeInfo(WebGLRenderingContext.SAMPLER_2D, WebGLRenderingContext.FLOAT, 1, 4)],
        // [WebGLRenderingContext.SAMPLER_3D, new GLTypeInfo(WebGLRenderingContext.SAMPLER_3D, WebGLRenderingContext.FLOAT, 1, 4)],
        [WebGLRenderingContext.SAMPLER_CUBE, new GLTypeInfo(WebGLRenderingContext.SAMPLER_CUBE, WebGLRenderingContext.FLOAT, 1, 4)],
    ]);
})(XOR || (XOR = {}));
/// <reference path="LibXOR.ts" />
var XOR;
(function (XOR) {
    class MemorySystem {
        constructor(xor) {
            this.xor = xor;
            this.intmem = new Int32Array(65536);
            this.fltmem = new Float32Array(65536);
            this.vecmem = new Array(65536);
            this.colmem = new Array(65536);
            // handy reminders
            // 0x1000 = 4096
            // 0x100 = 256
            // 0x10 = 16
            // Start of VIC memory
            this.VICSTART = 0x1000;
            this.VICCOUNT = 256;
            this.PALETTESTART = 0x1100;
            this.PALETTECOUNT = 16 * 16;
            this.SPRITESHEETSTART = 0x2000;
            this.SPRITESHEETCOUNT = 0x1000;
        }
        init() {
            for (let i = 0; i < 65536; i++) {
                this.intmem[i] = 0;
            }
        }
        PEEK(location) {
            if (location < 0 || location > 65536) {
                return 0;
            }
            return this.intmem[location];
        }
        POKE(location, value) {
            if (location < 0 || location > 65535) {
                return;
            }
            this.intmem[location] = value | 0;
        }
        IPEEK(location) {
            return this.intmem[location & 0xFFFF];
        }
        FPEEK(location) {
            return this.fltmem[location & 0xFFFF];
        }
        VPEEK(location) {
            return this.vecmem[location & 0xFFFF];
        }
        CPEEK(location) {
            return this.colmem[location & 0xFFFF];
        }
        IPOKE(location, value) {
            this.intmem[location & 0xFFFF] = value & ~0;
        }
        FPOKE(location, value) {
            this.fltmem[location & 0xFFFF] = value;
        }
        VPOKE(location, value) {
            this.vecmem[location & 0xFFFF] = value;
        }
        CPOKE(location, value) {
            this.colmem[location & 0xFFFF] = value.clamp(0, 255);
        }
    }
    XOR.MemorySystem = MemorySystem;
})(XOR || (XOR = {}));
/// <reference path="../GTE/GTE.ts" />
/// <reference path="LibXOR.ts" />
/// <reference path="XorMemorySystem.ts" />
var XOR;
(function (XOR) {
    class GraphicsSprite {
        constructor() {
            this.position = GTE.vec3(0, 0, 0);
            this.pivot = GTE.vec3(0, 0, 0);
            this.bbox = new GTE.BoundingBox();
            this.palette = 0;
            this.index = 0;
            this.plane = 0;
            this.enabled = true;
            this.alpha = 1.0;
            this.fliph = false;
            this.flipv = false;
            this.rotate90 = 0;
            this.matrix = Matrix4.makeIdentity();
            this.bbox.add(Vector3.make(-4, -4, -4));
            this.bbox.add(Vector3.make(4, 4, 4));
        }
        readFromMemory(mem, offset) {
            this.position.x = mem.PEEK(offset + 0);
            this.position.y = mem.PEEK(offset + 1);
            this.pivot.x = mem.PEEK(offset + 2);
            this.pivot.y = mem.PEEK(offset + 3);
            this.palette = mem.PEEK(offset + 4);
            this.index = mem.PEEK(offset + 5);
            this.plane = mem.PEEK(offset + 6);
            this.enabled = mem.PEEK(offset + 7) > 0.0 ? true : false;
            this.alpha = mem.PEEK(offset + 8);
            let rvh = mem.PEEK(offset + 9);
            this.fliph = (rvh & 1) ? true : false;
            this.flipv = (rvh & 2) ? true : false;
            this.rotate90 = (rvh >> 2) & 3;
            let M11 = mem.PEEK(offset + 10);
            let M12 = mem.PEEK(offset + 11);
            let M13 = mem.PEEK(offset + 12);
            let M21 = mem.PEEK(offset + 13);
            let M22 = mem.PEEK(offset + 14);
            let M23 = mem.PEEK(offset + 15);
            this.matrix.loadRowMajor(M11, M12, 0, M13, M21, M22, 0, M23, 0, 0, 1, 0, 0, 0, 0, 1);
        }
    }
    XOR.GraphicsSprite = GraphicsSprite;
})(XOR || (XOR = {}));
/// <reference path="XorMemorySystem.ts" />
var XOR;
(function (XOR) {
    class GraphicsTileLayer {
        constructor() {
            this.tiles = [];
            this.layer = 0;
        }
        readFromMemory(mem, offset) {
        }
    }
    XOR.GraphicsTileLayer = GraphicsTileLayer;
})(XOR || (XOR = {}));
/// <reference path="../GTE/GTE.ts" />
/// <reference path="LibXOR.ts" />
/// <reference path="XorGraphicsSprite.ts" />
/// <reference path="XorGraphicsTileLayer.ts" />
var XOR;
(function (XOR) {
    class GraphicsSystem {
        constructor(xor) {
            this.xor = xor;
            this.gl = null;
            this.hasWebGL2 = false;
            this.canvas = null;
            this.glcontextid = "GraphicsSystem" + GTE.randomUint8().toString();
            this.sprites = [];
            this.tileLayers = [];
            this.spriteImage = new Uint8Array(128 * 128 * 4);
            // VIC memory
            this.layer1width = 0;
            this.layer1height = 0;
            this.layer2width = 0;
            this.layer2height = 0;
            this.layer3width = 0;
            this.layer3height = 0;
            this.layer4width = 0;
            this.layer4height = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.zoomX = 1;
            this.zoomY = 1;
            this.worldMatrix = Matrix4.makeIdentity();
            this.cameraMatrix = Matrix4.makeIdentity(); //Matrix4.makeTranslation(0, 0, Math.sin(this.xor.t1) - 10);
            this.projectionMatrix = Matrix4.makeOrtho(0, 256, 0, 256, -100.0, 100.0);
            //perspectiveMatrix = Matrix4.makePerspectiveX(45.0, 1.0, 0.01, 100.0);
            this.MaxSprites = 128;
            this.MaxTileLayers = 4;
            this.SpriteSize = 16;
            this.VICMemoryStart = 0x6000;
            this.CharMatrixMemoryStart = 0x7000;
            this.CharColorsMemoryStart = 0x8000;
            this.CharBitmapMemoryStart = 0x9000;
            this.SpriteInfoMemoryStart = 0xA000;
            this.SpriteBitmapMemoryStart = 0xB000;
            this.TileBitmapMemoryStart = 0xD000;
            this.TileMatrixMemoryStart = 0xF000;
            this.drawABO = null;
            this.shaderProgram = null;
            this.vertShader = null;
            this.fragShader = null;
            this.spriteTexture = null;
            this.charTexture = null;
            this.tileTexture = null;
            this.drawList = [];
            this.aPosition = -1;
            this.aNormal = -1;
            this.aTexcoord = -1;
            this.aColor = -1;
            this.aGeneric = -1;
            this.uTexture0 = null;
            this.uProjectionMatrix = null;
            this.uCameraMatrix = null;
            this.uWorldMatrix = null;
            this.setVideoMode(320, 200);
        }
        get width() { return this.canvas ? this.canvas.width : 0; }
        get height() { return this.canvas ? this.canvas.height : 0; }
        init() {
            this.sprites = [];
            for (let i = 0; i < this.MaxSprites; i++) {
                this.sprites.push(new XOR.GraphicsSprite());
            }
            this.tileLayers = [];
            for (let i = 0; i < this.MaxTileLayers; i++) {
                this.tileLayers.push(new XOR.GraphicsTileLayer());
            }
        }
        setVideoMode(width, height, version = 2) {
            let p = this.xor.parentElement;
            while (p.firstChild) {
                p.removeChild(p.firstChild);
            }
            let canvas = document.createElement("canvas");
            canvas.id = this.glcontextid;
            canvas.width = width;
            canvas.height = height;
            canvas.style.borderRadius = "4px";
            if (version == 1) {
                this.gl = canvas.getContext("webgl");
                if (this.gl)
                    hflog.info("Using WebGL 1.0");
                else
                    hflog.error("WebGL 1.0 failed");
                this.hasWebGL2 = false;
            }
            else if (version == 2) {
                this.gl = canvas.getContext("webgl2");
                if (this.gl) {
                    hflog.info("Using WebGL 2.0");
                    this.hasWebGL2 = true;
                }
                else
                    hflog.error("WebGL 2.0 failed");
            }
            this.canvas = canvas;
            p.appendChild(canvas);
            // If this.xor.graphics is null, then LibXOR is in the constructor
            if (this.xor.graphics && this.gl) {
                this.xor.fluxions = new Fluxions.FxRenderingContext(this.xor);
                this.xor.input.captureMouse(canvas);
                hflog.info("Capturing mouse");
            }
        }
        clear(color1 = XOR.Color.BLACK, color2 = XOR.Color.BLACK, mix = 0, hue1 = XOR.HueShift.Zero, hue2 = XOR.HueShift.Zero, neg = 0) {
            let c = this.xor.palette.calcColor(color1, color2, mix, hue1, hue2, neg);
            this.clearrgba(c.r, c.g, c.b, 1.0);
        }
        clear3(color) {
            this.clearrgba(color.x, color.y, color.z, 1.0);
        }
        clearrgba(r, g, b, a) {
            if (!this.gl)
                return;
            let gl = this.gl;
            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
        readFromMemory() {
            // Read VIC information
            let mem = this.xor.memory;
            let pos = this.VICMemoryStart;
            this.layer1width = mem.PEEK(pos++);
            this.layer1height = mem.PEEK(pos++);
            this.layer2width = mem.PEEK(pos++);
            this.layer2height = mem.PEEK(pos++);
            this.layer3width = mem.PEEK(pos++);
            this.layer3height = mem.PEEK(pos++);
            this.layer4width = mem.PEEK(pos++);
            this.layer4height = mem.PEEK(pos++);
            // Read Sprite Info
            for (let i = 0; i < this.MaxSprites; i++) {
                this.sprites[i].readFromMemory(this.xor.memory, this.SpriteInfoMemoryStart + i * this.SpriteSize);
            }
            // Read Sprite Imagery        
            let pixels = this.spriteImage;
            let offset = this.SpriteBitmapMemoryStart;
            let p = 0;
            for (let spr = 0; spr < 256; spr++) {
                for (let j = 0; j < 8; j++) {
                    let pixel1 = mem.PEEK(offset++);
                    let pixel2 = mem.PEEK(offset++);
                    let pixel = (pixel1 & 0xFF) << 8 + (pixel2 & 0xFF);
                    for (let i = 0; i < 8; i++) {
                        let r = (pixel & 3) * 85;
                        pixels[p++] = r;
                        pixels[p++] = r;
                        pixels[p++] = r;
                        pixels[p++] = 255;
                        pixel >>= 2;
                    }
                }
            }
            // for (let i = 0; i < this.MaxTileLayers; i++) {
            //     this.tileLayers[i].readFromMemory(this.xor.memory, this.TileMatrixMemoryStart + i * this.TileLayerMemorySize)
            // }
        }
        createBuffers() {
            if (!this.gl)
                return;
            let GL = WebGL2RenderingContext;
            let gl = this.gl;
            let vertices = [];
            this.drawList = [];
            this.drawList.push(gl.TRIANGLES);
            this.drawList.push(vertices.length / 16);
            // sprites ...
            for (let i = 0; i < this.MaxSprites; i++) {
                let spr = this.sprites[i];
                if (!spr)
                    continue;
                let r = 1;
                let g = 1;
                let b = 1;
                let a = spr.alpha;
                let u1 = spr.fliph ? 1.0 : 0.0;
                let u2 = spr.fliph ? 0.0 : 1.0;
                let v1 = spr.flipv ? 1.0 : 0.0;
                let v2 = spr.flipv ? 0.0 : 1.0;
                let w = 0.0;
                let scale = 1.0; // / this.canvas.width;
                let wOver2 = spr.bbox.width >> 1;
                let hOver2 = spr.bbox.height >> 1;
                let x1 = spr.position.x - wOver2;
                let y1 = spr.position.y - hOver2;
                let x2 = spr.position.x + wOver2;
                let y2 = spr.position.y + hOver2;
                let z = 0.0; //spr.plane + 4;
                let nx = 0.0;
                let ny = 0.0;
                let nz = 1.0;
                let p1 = 0;
                let p2 = 0;
                let p3 = 0;
                let ll = [scale * x1, scale * y1, z, nx, ny, nz, u1, v1, w, r, g, b, a, p1, p2, p3];
                let lr = [scale * x2, scale * y1, z, nx, ny, nz, u2, v1, w, r, g, b, a, p1, p2, p3];
                let ul = [scale * x1, scale * y2, z, nx, ny, nz, u1, v2, w, r, g, b, a, p1, p2, p3];
                let ur = [scale * x2, scale * y2, z, nx, ny, nz, u2, v2, w, r, g, b, a, p1, p2, p3];
                vertices.push(...ll);
                vertices.push(...lr);
                vertices.push(...ur);
                vertices.push(...ur);
                vertices.push(...ul);
                vertices.push(...ll);
                // vertices.push(...ll);
                // vertices.push(...ul);
                // vertices.push(...ur);
            }
            this.drawList.push(this.MaxSprites * 6);
            // tiles ...
            // characters ...
            if (!this.drawABO) {
                this.drawABO = gl.createBuffer();
            }
            if (this.drawABO) {
                let data = new Float32Array(vertices);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.drawABO);
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            if (!this.shaderProgram) {
                let vshader = `#version 100
                uniform mat4 WorldMatrix;
                uniform mat4 ProjectionMatrix;
                uniform mat4 CameraMatrix;
    
                attribute vec3 aPosition;
                attribute vec3 aNormal;
                attribute vec3 aTexcoord;
                attribute vec4 aColor;
                attribute vec3 aGeneric;
    
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vTexcoord;
                varying vec4 vColor;
                varying vec3 vGeneric;
    
                mat3 getNormalMatrix(mat4 m) {
                    return mat3(
                        m[0][0], m[0][1], m[0][2],
                        m[1][0], m[1][1], m[1][2],
                        m[2][0], m[2][1], m[2][2]);
                }
    
                void main() {
                    vPosition = (WorldMatrix * vec4(aPosition, 1.0)).xyz;
                    vNormal = getNormalMatrix(WorldMatrix) * aNormal;
                    vTexcoord = aTexcoord;
                    vColor = aColor;
                    gl_Position = ProjectionMatrix * CameraMatrix * WorldMatrix * vec4(aPosition, 1.0);
                }
                `;
                let fshader = `#version 100
                
                precision highp float;
    
                uniform sampler2D Texture0;
                uniform sampler2D Palette;
    
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vTexcoord;
                varying vec4 vColor;
                varying vec3 vGeneric;
    
                vec3 getColor(int index) {
                    if (index == 0) return vec3(0.000, 0.000, 0.000); //Black
                    if (index == 1) return vec3(0.333, 0.333, 0.333); //Gray33
                    if (index == 2) return vec3(0.667, 0.667, 0.667); //Gray67
                    if (index == 3) return vec3(1.000, 1.000, 1.000); //White
                    if (index == 4) return vec3(1.000, 0.000, 0.000); //Red
                    if (index == 5) return vec3(0.894, 0.447, 0.000); //Orange
                    if (index == 6) return vec3(0.894, 0.894, 0.000); //Yellow
                    if (index == 7) return vec3(0.000, 1.000, 0.000); //Green
                    if (index == 8) return vec3(0.000, 0.707, 0.707); //Cyan
                    if (index == 9) return vec3(0.000, 0.447, 0.894); //Azure
                    if (index == 10) return vec3(0.000, 0.000, 1.000); //Blue
                    if (index == 11) return vec3(0.447, 0.000, 0.894); //Violet
                    if (index == 12) return vec3(0.894, 0.000, 0.447); //Rose
                    if (index == 13) return vec3(0.500, 0.250, 0.000); //Brown
                    if (index == 14) return vec3(0.830, 0.670, 0.220); //Gold
                    if (index == 15) return vec3(0.250, 0.500, 0.250); //ForestGreen
                    return vec3(0.0);
                }
                            
                void main() {
                    gl_FragColor = vec4(vTexcoord.rg, 1.0, 1.0);
                }
                `;
                let vs = gl.createShader(gl.VERTEX_SHADER);
                if (vs) {
                    gl.shaderSource(vs, vshader);
                    gl.compileShader(vs);
                    let status = gl.getShaderParameter(vs, gl.COMPILE_STATUS);
                    let infoLog = gl.getShaderInfoLog(vs);
                    if (!status && infoLog) {
                        hflog.error("LibXOR Vertex Shader did not compile");
                        hflog.error(infoLog);
                        gl.deleteShader(vs);
                        vs = null;
                    }
                }
                let fs = gl.createShader(gl.FRAGMENT_SHADER);
                if (fs) {
                    gl.shaderSource(fs, fshader);
                    gl.compileShader(fs);
                    let status = gl.getShaderParameter(fs, gl.COMPILE_STATUS);
                    let infoLog = gl.getShaderInfoLog(fs);
                    if (!status && infoLog) {
                        hflog.error("LibXOR Fragment Shader did not compile");
                        hflog.error(infoLog);
                        gl.deleteShader(fs);
                        fs = null;
                    }
                }
                let p = gl.createProgram();
                if (p && fs && vs) {
                    gl.attachShader(p, vs);
                    gl.attachShader(p, fs);
                    gl.linkProgram(p);
                    let status = gl.getProgramParameter(p, gl.LINK_STATUS);
                    let infoLog = gl.getProgramInfoLog(p);
                    if (infoLog) {
                        hflog.error("LibXOR Program did not link");
                        hflog.error(infoLog);
                        gl.deleteProgram(p);
                        p = null;
                    }
                }
                if (p) {
                    this.shaderProgram = p;
                    this.vertShader = vs;
                    this.fragShader = fs;
                    this.aPosition = gl.getAttribLocation(p, "aPosition");
                    this.aNormal = gl.getAttribLocation(p, "aNormal");
                    this.aTexcoord = gl.getAttribLocation(p, "aTexcoord");
                    this.aColor = gl.getAttribLocation(p, "aColor");
                    this.aGeneric = gl.getAttribLocation(p, "aGeneric");
                    this.uTexture0 = gl.getUniformLocation(p, "Texture0");
                    this.uProjectionMatrix = gl.getUniformLocation(p, "ProjectionMatrix");
                    this.uCameraMatrix = gl.getUniformLocation(p, "CameraMatrix");
                    this.uWorldMatrix = gl.getUniformLocation(p, "WorldMatrix");
                }
                // Textures
                if (!this.spriteTexture) {
                    this.spriteTexture = gl.createTexture();
                }
                if (this.spriteTexture) {
                    gl.bindTexture(gl.TEXTURE_2D, this.spriteTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, GL.SRGB8_ALPHA8, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.spriteImage);
                    gl.generateMipmap(gl.TEXTURE_2D);
                }
                if (!this.charTexture) {
                }
                if (!this.tileTexture) {
                }
            }
        }
        enableVertexAttrib(gl, location, size, type, stride, offset) {
            if (location < 0)
                return;
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, type, false, stride, offset);
        }
        disableVertexAttrib(gl, location) {
            if (location < 0)
                return;
            gl.disableVertexAttribArray(location);
        }
        render() {
            if (!this.canvas || !this.gl)
                return;
            let gl = this.gl;
            let xor = this.xor;
            this.createBuffers();
            // let s = Math.sin(xor.t1);
            // gl.clearColor(0.3 * s, 0.1 * s, 0.2 * s, 1.0);
            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this.projectionMatrix = Matrix4.makeOrtho2D(0, this.canvas.width, this.canvas.height, 0);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            // General Order of Drawing
            // 1. Upload Palette ROM Textures
            // 2. Upload Character ROM Textures
            // 3. Upload Sprite ROM Textures
            // 4. Upload 3D Geometry
            // 5. Draw Tile Layer 0
            // 6. Draw Sprites
            // 7. Draw Tile Layer 1
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            // bind ABO and configure vertex array
            gl.bindBuffer(gl.ARRAY_BUFFER, this.drawABO);
            this.enableVertexAttrib(gl, this.aPosition, 3, gl.FLOAT, 64, 0);
            this.enableVertexAttrib(gl, this.aNormal, 3, gl.FLOAT, 64, 12);
            this.enableVertexAttrib(gl, this.aTexcoord, 3, gl.FLOAT, 64, 24);
            this.enableVertexAttrib(gl, this.aColor, 4, gl.FLOAT, 64, 36);
            this.enableVertexAttrib(gl, this.aGeneric, 3, gl.FLOAT, 64, 52);
            gl.useProgram(this.shaderProgram);
            let m = this.cameraMatrix.clone();
            m.scale(this.zoomX, this.zoomY, 1.0);
            m.translate(this.offsetX, this.offsetY, 0.0);
            // set uniforms
            if (this.uTexture0)
                gl.uniform1i(this.uTexture0, 0);
            if (this.uWorldMatrix)
                gl.uniformMatrix4fv(this.uWorldMatrix, false, this.worldMatrix.toColMajorArray());
            if (this.uCameraMatrix)
                gl.uniformMatrix4fv(this.uCameraMatrix, false, m.toColMajorArray());
            if (this.uProjectionMatrix)
                gl.uniformMatrix4fv(this.uProjectionMatrix, false, this.projectionMatrix.toColMajorArray());
            // draw sprites
            // bind textures
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.spriteTexture);
            gl.drawArrays(gl.TRIANGLES, 0, this.MaxSprites * 6);
            // gl.activeTexture(gl.TEXTURE1);
            // gl.bindTexture(gl.TEXTURE_2D, this.tileTexture);
            // gl.activeTexture(gl.TEXTURE1);
            // gl.bindTexture(gl.TEXTURE_2D, this.charTexture);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.useProgram(null);
            this.disableVertexAttrib(gl, this.aPosition);
            this.disableVertexAttrib(gl, this.aNormal);
            this.disableVertexAttrib(gl, this.aTexcoord);
            this.disableVertexAttrib(gl, this.aColor);
            this.disableVertexAttrib(gl, this.aGeneric);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        setOffset(x, y) {
            this.offsetX = x;
            this.offsetY = y;
        }
        setZoom(x, y) {
            this.zoomX = x;
            this.zoomY = y;
        }
    } // class XorGraphicSystem
    XOR.GraphicsSystem = GraphicsSystem;
})(XOR || (XOR = {})); // namespace XOR
/// <reference path="../XOR/XorSoundSystem.ts" />
var TF;
(function (TF) {
    class DAHDSREnvelope {
        constructor(delay = 0.0, // delay to start
        delayCV = 0.0, // level at start
        attack = 0.0, // how long to ramp from 0 to 1
        attackCV = 1.0, // Highest level (normally 1)
        hold = 10.0, // how long to hold signal at highest amplitude
        decay = 0.0, // how long to ramp from 1 to sustain
        sustainCV = 1.0, // level of the sustain
        release = 0.0, // how long to ramp from sustain to 0
        releaseCV = 0.0 // lowest level of ramp (normally 0)
        ) {
            this.delay = delay;
            this.delayCV = delayCV;
            this.attack = attack;
            this.attackCV = attackCV;
            this.hold = hold;
            this.decay = decay;
            this.sustainCV = sustainCV;
            this.release = release;
            this.releaseCV = releaseCV;
        }
    }
    TF.DAHDSREnvelope = DAHDSREnvelope;
    class AttackReleaseEnvelope {
        constructor(delay = 0.0, attack = 0.0, attackCV = 1.0, hold = 0.0, release = 0.0, releaseCV = 0.0) {
            this.delay = delay;
            this.attack = attack;
            this.attackCV = attackCV;
            this.hold = hold;
            this.release = release;
            this.releaseCV = releaseCV;
        }
    }
    TF.AttackReleaseEnvelope = AttackReleaseEnvelope;
    class SimpleSamplerPlaySettings {
        constructor(VCFfrequency1 = 1000.0, VCFfrequency2 = 1000.0, VCFsweepTime = 1.0, VCFresonance = 500.0, VCAattack = 0.0, VCAhold = 1.0, VCArelease = 1.0, sampleLoop = true) {
            this.VCFfrequency1 = VCFfrequency1;
            this.VCFfrequency2 = VCFfrequency2;
            this.VCFsweepTime = VCFsweepTime;
            this.VCFresonance = VCFresonance;
            this.VCAattack = VCAattack;
            this.VCAhold = VCAhold;
            this.VCArelease = VCArelease;
            this.sampleLoop = sampleLoop;
        }
    }
    TF.SimpleSamplerPlaySettings = SimpleSamplerPlaySettings;
    class Sample {
        constructor(url, buffer = null, loaded = false, haderror = false) {
            this.url = url;
            this.buffer = buffer;
            this.loaded = loaded;
            this.haderror = haderror;
            this.VCF = null;
            this.VCA = null;
            this.VCAenvelope = new DAHDSREnvelope();
            this.VCOenvelope = new DAHDSREnvelope();
            this.VCFenvelope = new DAHDSREnvelope();
            this.VCFresonance = 1.0;
            this.source = null;
            this.stopped_ = false;
            this.loop = false;
            this.VCFenvelope.attack = 1;
            this.VCFenvelope.decay = 1;
            this.VCFenvelope.release = 1;
            this.VCFenvelope.sustainCV = 0.5;
        }
        play(ss, time = 0) {
            if (!ss.enabled)
                return;
            let ctx = ss.context;
            if (!ctx)
                return;
            let t = ctx.currentTime;
            let source = ctx.createBufferSource();
            source.buffer = this.buffer;
            source.loop = this.loop;
            source.connect(ss.gainNode);
            source.start(time);
            let self = this;
            self.stopped_ = false;
            source.onended = (ev) => {
                self.stopped_ = true;
            };
            this.source = source;
            // hflog.info("playing " + this.url);
        }
        get stopped() { return this.stopped_; }
        get playing() { return !this.stopped_; }
        stop() {
            if (this.source) {
                this.source.stop();
                this.source.disconnect();
                this.source = null;
            }
        }
        playOld(ss, time = 0) {
            if (!ss.enabled)
                return;
            let ctx = ss.context;
            if (!ctx)
                return;
            let t = ctx.currentTime;
            let source = ctx.createBufferSource();
            let VCF = ctx.createBiquadFilter();
            let VCA = ctx.createGain();
            source.buffer = this.buffer;
            source.loop = true;
            source.connect(VCF);
            VCF.connect(ss.gainNode);
            // source.connect(ss.gainNode);
            // source.connect(VCF);
            // VCF.connect(VCA);
            // VCA.connect(ss.gainNode);
            let detune1 = 8;
            let detune2 = 1;
            let detuneTime = 2;
            source.playbackRate.setValueAtTime(detune1, t);
            source.playbackRate.linearRampToValueAtTime(detune2, t + detuneTime);
            let to = setTimeout(() => {
                source.stop();
            }, detuneTime * 1000);
            VCF.type = 'lowpass';
            VCF.frequency.value = 1440.0;
            VCF.Q.value = 10.0; //100.0;//this.VCFresonance;
            let vcfEnv = this.VCFenvelope;
            vcfEnv.delayCV = 0.0;
            vcfEnv.attack = 1.0;
            vcfEnv.attackCV = 1200.0;
            vcfEnv.hold = 0.0;
            vcfEnv.release = 1.0;
            vcfEnv.releaseCV = 0.0;
            VCF.frequency.setValueAtTime(vcfEnv.delayCV, t);
            t += vcfEnv.delay;
            VCF.frequency.setValueAtTime(vcfEnv.delayCV, t);
            t += vcfEnv.attack;
            VCF.frequency.linearRampToValueAtTime(vcfEnv.attackCV, t);
            t += vcfEnv.hold;
            VCF.frequency.linearRampToValueAtTime(vcfEnv.attackCV, t);
            t += vcfEnv.release;
            VCF.frequency.linearRampToValueAtTime(vcfEnv.releaseCV, t);
            let vcaEnv = this.VCAenvelope;
            t = ctx.currentTime;
            VCA.gain.setValueAtTime(this.VCAenvelope.delayCV, t);
            t += vcaEnv.delay;
            VCA.gain.setValueAtTime(this.VCAenvelope.delayCV, t);
            t += vcaEnv.attack;
            VCA.gain.linearRampToValueAtTime(vcaEnv.attackCV, t);
            t += vcaEnv.hold;
            VCA.gain.setValueAtTime(vcaEnv.attackCV, t);
            t += vcaEnv.decay;
            VCA.gain.linearRampToValueAtTime(vcaEnv.sustainCV, t);
            t += vcaEnv.release;
            VCA.gain.linearRampToValueAtTime(vcaEnv.releaseCV, t);
            // configure envelopes
            source.start(time);
            this.VCA = VCA;
            this.VCF = VCF;
        }
    }
    TF.Sample = Sample;
    class Sampler {
        constructor(ss) {
            this.ss = ss;
            this.samples = new Map();
            this.samplesRequested = 0;
            this.samplesLoaded = 0;
        }
        get loaded() {
            return this.samplesRequested == this.samplesLoaded;
        }
        isPlaying(id) {
            if (id < 0)
                return false;
            let s = this.samples.get(id);
            if (s) {
                return s.playing;
            }
            return false;
        }
        isStopped(id) {
            if (id < 0)
                return false;
            let s = this.samples.get(id);
            if (s) {
                return s.stopped;
            }
            return true;
        }
        stopAll() {
            for (let s of this.samples) {
                s[1].stop();
            }
        }
        update(timeInSeconds) { }
        stopSample(id) {
            let s = this.samples.get(id);
            if (s) {
                s.stop();
            }
        }
        loadSample(id, url, logErrors = false) {
            if (id < 0)
                return false;
            let ctx = this.ss.context;
            if (!ctx)
                return;
            let self = this;
            let soundUrl = url;
            this.samplesRequested++;
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
                if (!ctx)
                    return;
                ctx.decodeAudioData(xhr.response, (buffer) => {
                    // on success
                    let s = new Sample(soundUrl, buffer, true, false);
                    self.samples.set(id, s);
                    if (logErrors)
                        hflog.info('loaded ', soundUrl);
                    self.samplesLoaded++;
                }, () => {
                    // on error
                    let s = new Sample(soundUrl, null, false, true);
                    self.samples.set(id, s);
                    if (logErrors)
                        hflog.info('failed to load ', soundUrl);
                    self.samplesLoaded++;
                });
            };
            xhr.onabort = () => {
                if (logErrors)
                    hflog.error('Could not load ', soundUrl);
                self.samples.set(id, new Sample(soundUrl, null, false, true));
                this.samplesLoaded++;
            };
            xhr.onerror = () => {
                if (logErrors)
                    hflog.error('Could not load ', soundUrl);
                self.samples.set(id, new Sample(soundUrl, null, false, true));
                this.samplesLoaded++;
            };
            this.samples.set(id, new Sample(url));
            xhr.send();
        }
        playSample(id, loop = false, time = 0) {
            if (id < 0)
                return;
            let s = this.samples.get(id);
            if (!s)
                return;
            s.loop = loop;
            s.play(this.ss, time);
        }
    }
    TF.Sampler = Sampler;
})(TF || (TF = {}));
/// <reference path="../XOR/XorSoundSystem.ts" />
var TF;
(function (TF) {
    class Jukebox {
        constructor(ss) {
            this.ss = ss;
            this.tracks = new Map();
            this.playTrack = -1;
        }
        add(index, url, looping, logErrors = false) {
            if (index < 0)
                return false;
            let el = new Audio();
            el.preload = "auto";
            el.src = url;
            if (logErrors) {
                hflog.info("loading " + url);
            }
            el.loop = looping;
            this.tracks.set(index, el);
            return true;
        }
        stop() {
            if (this.playTrack < 0)
                return;
            let el = this.tracks.get(this.playTrack);
            if (!el)
                return;
            el.pause();
            this.playTrack = -1;
        }
        play(index) {
            this.stop();
            if (index < 0) {
                this.playTrack = -1;
                return;
            }
            let el = this.tracks.get(index);
            if (!el)
                return;
            el.currentTime = 0;
            el.play();
            this.playTrack = index;
        }
        update(timeInSeconds) { }
    }
    TF.Jukebox = Jukebox;
})(TF || (TF = {}));
/// <reference path="LibXOR.ts" />
/// <reference path="../Toadfish/TfSampler.ts" />
/// <reference path="../Toadfish/TfJukebox.ts" />
var XOR;
(function (XOR) {
    class SoundSystem {
        constructor(xor) {
            this.xor = xor;
            this.sampler = new TF.Sampler(this);
            this.jukebox = new TF.Jukebox(this);
            this.enabled_ = false;
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.context_ = new AudioContext();
                this.masterVolume = this.context_.createGain();
                this.enabled_ = true;
            }
            catch (e) {
                hflog.error('Web Audio API not supported');
            }
        }
        get enabled() { return this.enabled_; }
        get disabled() { return !this.enabled_; }
        get context() { return this.context_; }
        init() {
            if (!this.enabled)
                return;
            this.masterVolume = this.context_.createGain();
            this.masterVolume.connect(this.context_.destination);
            this.masterVolume.gain.value = 0.5;
            hflog.info("audio initted");
        }
        get volume() { if (!this.enabled)
            return 0; return this.masterVolume.gain.value; }
        set volume(v) { if (!this.enabled)
            return; this.masterVolume.gain.value = GTE.clamp(v, 0.0, 1.0); }
        get gainNode() { return this.masterVolume; }
        update() {
            this.sampler.update(this.xor.t1);
            this.jukebox.update(this.xor.t1);
        }
    }
    XOR.SoundSystem = SoundSystem;
})(XOR || (XOR = {}));
/// <reference path="../GTE/GTE.ts" />
class XORMouseEvent {
    constructor(button = 0, clicks = 0, buttons = 0, position = Vector2.make(0, 0), screen = Vector2.make(0, 0), delta = Vector2.make(0, 0), ctrlKey = false, altKey = false, shiftKey = false, metaKey = false) {
        this.button = button;
        this.clicks = clicks;
        this.buttons = buttons;
        this.position = position;
        this.screen = screen;
        this.delta = delta;
        this.ctrlKey = ctrlKey;
        this.altKey = altKey;
        this.shiftKey = shiftKey;
        this.metaKey = metaKey;
    }
    copyMouseEvent(e) {
        this.delta.x = e.offsetX - this.position.x;
        this.delta.y = e.offsetY - this.position.y;
        this.position.x = e.offsetX;
        this.position.y = e.offsetY;
        this.screen.x = e.screenX;
        this.screen.y = e.screenY;
        this.buttons = e.buttons;
        this.button = e.button;
        this.clicks = e.detail;
        this.ctrlKey = e.ctrlKey;
        this.altKey = e.altKey;
        this.shiftKey = e.shiftKey;
        this.metaKey = e.metaKey;
    }
}
/// <reference path="../GTE/GTE.ts" />
/// <reference path="LibXOR.ts" />
var XOR;
(function (XOR) {
    /**
     * @member buttons Map<number, number>
     * @member axes Map<number, number>
     * @member enabled boolean
     */
    class XORGamepadState {
        constructor() {
            this.buttons = new Map();
            this.axes = new Map();
            this.lastButtons = 0;
            this.currentButtons = 0;
            this.anyButtonPressed = true;
            this.numButtons = 0;
            this.numAxes = 0;
            this.enabled = false;
            this.id = null;
            for (let i = 0; i < 17; i++) {
                this.buttons.set(i, 0.0);
            }
        }
        copyInfo(state) {
            this.lastButtons = this.currentButtons;
            this.currentButtons = 0;
            let bit = 1;
            for (let i = 0; i < state.buttons.length; i++) {
                this.buttons.set(i, state.buttons[i].value);
                if (state.buttons[i].value != 0.0)
                    this.currentButtons |= bit;
                bit <<= 1;
            }
            if (this.currentButtons > 0 && this.currentButtons != this.lastButtons) {
                this.anyButtonPressed = true;
            }
            for (let i = 0; i < state.axes.length; i++) {
                this.axes.set(i, state.axes[i]);
            }
        }
        button(i) {
            let v = this.buttons.get(i);
            if (v)
                return v;
            return 0.0;
        }
        axe(i) {
            let v = this.axes.get(i);
            if (v)
                return v;
            return 0.0;
        }
        get left() { return this.button(14) > 0.5 || this.axe(0) < -0.5; }
        get right() { return this.button(15) > 0.5 || this.axe(0) > 0.5; }
        get up() { return this.button(12) > 0.5 || this.axe(1) < -0.5; }
        get down() { return this.button(13) > 0.5 || this.axe(1) > 0.5; }
        get b0() { return this.button(0) > 0.5; }
        get b1() { return this.button(1) > 0.5; }
        get b2() { return this.button(2) > 0.5; }
        get b3() { return this.button(3) > 0.5; }
        get leftright() { return (this.left ? -1.0 : 0.0) + (this.right ? 1.0 : 0.0); }
        get updown() { return (this.down ? -1.0 : 0.0) + (this.up ? 1.0 : 0.0); }
    }
    XOR.XORGamepadState = XORGamepadState;
})(XOR || (XOR = {}));
var XOR;
(function (XOR) {
    class TouchState {
        constructor(x = 0, y = 0, dx = 0, dy = 0) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.ox = 0;
            this.oy = 0;
            this.pressed = false;
        }
        get position() {
            return new Vector3(this.x, this.y);
        }
        get reldelta() {
            return new Vector3(this.dx, this.dy);
        }
        get touchDelta() {
            return new Vector3(this.x - this.ox, this.y - this.oy);
        }
        handleTouch(t, down, reset = false) {
            if (!t)
                return;
            if (reset) {
                this.dx = 0;
                this.dy = 0;
                this.ox = t.clientX;
                this.oy = t.clientY;
            }
            else {
                this.dx = t.clientX - this.x;
                this.dy = t.clientY - this.y;
            }
            this.x = t.clientX;
            this.y = t.clientY;
            this.pressed = down;
        }
    }
    XOR.TouchState = TouchState;
})(XOR || (XOR = {}));
/// <reference path="LibXOR.ts" />
/// <reference path="XorMouseEvent.ts" />
/// <reference path="XorGamepadState.ts" />
/// <reference path="XorTouchState.ts" />
var XOR;
(function (XOR) {
    class InputSystem {
        constructor(xor) {
            this.xor = xor;
            this.keys = new Map();
            this.codes = new Map();
            this.modifiers = 0;
            this.canvas = null;
            this.mouseXY = Vector2.make(0, 0);
            this.mouse = new XORMouseEvent();
            /** @type {Map<number, XORMouseEvent>} */
            this.mouseButtons = new Map();
            this.mouseOver = false;
            /** @type {Map<number, XORGamepadState>} */
            this.gamepads = new Map();
            this.gamepadAPI = false;
            this.touches = [
                new XOR.TouchState(),
                new XOR.TouchState(),
                new XOR.TouchState(),
                new XOR.TouchState(),
                new XOR.TouchState()
            ];
        }
        init() {
            let self = this;
            window.onkeydown = (e) => {
                self.onkeydown(e);
            };
            window.onkeyup = (e) => {
                self.onkeyup(e);
            };
            for (let i = 0; i < 5; i++) {
                this.mouseButtons.set(i, new XORMouseEvent());
            }
            for (let i = 0; i < 5; i++) {
                this.gamepads.set(i, new XOR.XORGamepadState());
            }
            window.addEventListener("gamepadconnected", (ev) => {
                let e = (ev);
                let gp = new XOR.XORGamepadState();
                gp.enabled = true;
                gp.id = e.gamepad.id;
                gp.numButtons = e.gamepad.buttons.length;
                gp.numAxes = e.gamepad.buttons.length;
                gp.copyInfo(e.gamepad);
                self.gamepads.set(e.gamepad.index, gp);
                hflog.info("Gamepad " + e.gamepad.index + " connected");
            });
            window.addEventListener("gamepaddisconnected", (ev) => {
                let e = (ev);
                let gp = self.gamepads.get(e.gamepad.index);
                if (gp) {
                    gp.enabled = false;
                }
                hflog.info("Gamepad " + e.gamepad.index + " disconnected");
            });
            this.gamepadAPI = true;
            hflog.info("capturing gamepads");
        }
        poll() {
            let gamepads = navigator.getGamepads();
            if (gamepads) {
                for (let i = 0; i < gamepads.length; i++) {
                    let gp = this.gamepads.get(i);
                    let gamepad = gamepads[i];
                    if (gamepad && gp) {
                        gp.copyInfo(gamepad);
                    }
                }
            }
        }
        captureMouse(e) {
            this.canvas = e;
            let self = this;
            this.canvas.onmousedown = (e) => {
                self.mouse.copyMouseEvent(e);
                let button = self.mouseButtons.get(e.button);
                if (button) {
                    button.copyMouseEvent(e);
                }
            };
            this.canvas.onmouseup = (e) => {
                self.mouse.copyMouseEvent(e);
                let button = self.mouseButtons.get(e.button);
                if (button) {
                    button.copyMouseEvent(e);
                }
            };
            this.canvas.onmousemove = (e) => {
                self.mouse.copyMouseEvent(e);
            };
            this.canvas.onmouseenter = (e) => {
                self.mouseOver = true;
            };
            this.canvas.onmouseleave = (e) => {
                self.mouseOver = false;
            };
            this.captureTouches();
        }
        captureTouches() {
            if (!this.canvas) {
                hflog.error("Cannot register touches");
                return;
            }
            let self = this;
            this.canvas.addEventListener('touchstart', (ev) => {
                if (ev.targetTouches.length > 0) {
                    ev.preventDefault();
                }
                else {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }
                for (let i = 0; i < self.touches.length; i++) {
                    if (i < ev.targetTouches.length)
                        self.touches[i].handleTouch(ev.targetTouches[i], true, true);
                    else
                        self.touches[i].handleTouch(ev.targetTouches[i], false, true);
                }
            });
            this.canvas.addEventListener('touchend', (ev) => {
                if (ev.targetTouches.length > 0) {
                    ev.preventDefault();
                }
                else {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }
                if (ev.touches.length == 0) {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }
                for (let i = 0; i < self.touches.length; i++) {
                    if (i < ev.targetTouches.length)
                        self.touches[i].handleTouch(ev.targetTouches[i], true, false);
                    else
                        self.touches[i].handleTouch(ev.targetTouches[i], false, false);
                }
            });
            this.canvas.addEventListener('touchmove', (ev) => {
                if (ev.targetTouches.length > 0) {
                    ev.preventDefault();
                }
                else {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }
                for (let i = 0; i < self.touches.length; i++) {
                    if (i < ev.targetTouches.length)
                        self.touches[i].handleTouch(ev.targetTouches[i], true, false);
                    else
                        self.touches[i].handleTouch(ev.targetTouches[i], false, false);
                }
            });
        }
        checkKeys(keys) {
            for (let key of keys) {
                if (this.codes.has(key)) {
                    if (this.codes.get(key) != 0.0) {
                        return 1.0;
                    }
                }
                if (this.keys.has(key)) {
                    if (this.keys.get(key) != 0.0) {
                        return 1.0;
                    }
                }
            }
            return 0.0;
        }
        get mousecurpos() { return this.mouse.position; }
        get mouseclick() { let b = this.mouseButtons.get(0); if (!b)
            return Vector2.make(0, 0); return b.position; }
        get mouseshadertoy() { return Vector4.make(this.mousecurpos.x, this.mousecurpos.y, this.mouseclick.x, this.mouseclick.y); }
        get mouseButton1() { return (this.mouse.buttons & 1) > 0; }
        get mouseButton2() { return (this.mouse.buttons & 2) > 0; }
        get mouseButton3() { return (this.mouse.buttons & 4) > 0; }
        changeModifier(bit, state) {
            bit = bit | 0;
            if (bit > 8)
                return;
            if (state) {
                this.modifiers |= bit;
            }
            else {
                this.modifiers &= ~bit;
            }
        }
        translateKeyToCode(key) {
            if (key.length == 1) {
                let s = key.toUpperCase();
                if (s[0] >= 'A' && s[0] <= 'Z')
                    return 'Key' + s[0];
                if (s[0] >= '0' && s[0] <= '9')
                    return 'Digit' + s[0];
                if (s[0] == ' ')
                    return "Space";
            }
            if (key == "Left" || key == "ArrowLeft")
                return "ArrowLeft";
            if (key == "Right" || key == "ArrowRight")
                return "ArrowRight";
            if (key == "Up" || key == "ArrowUp")
                return "ArrowUp";
            if (key == "Down" || key == "ArrowDown")
                return "ArrowDown";
            if (key == "Esc" || key == "Escape")
                return "Escape";
            if (key == "Enter" || key == "Return")
                return "Enter";
            return "Unidentified";
        }
        onkeydown(e) {
            if (e.key == "Shift")
                this.changeModifier(1, true);
            if (e.key == "Ctrl")
                this.changeModifier(2, true);
            if (e.key == "Alt")
                this.changeModifier(4, true);
            this.keys.set(e.key, 1);
            if (e.code != undefined) {
                this.codes.set(e.code, 1);
            }
            else {
                this.codes.set(this.translateKeyToCode(e.key), 1);
            }
            if (e.key == "F12")
                return;
            if (e.key == "i" && this.modifiers == 3)
                return;
            e.preventDefault();
        }
        onkeyup(e) {
            if (e.key == "Shift")
                this.changeModifier(1, false);
            if (e.key == "Ctrl")
                this.changeModifier(2, false);
            if (e.key == "Alt")
                this.changeModifier(4, false);
            this.keys.set(e.key, 0);
            if (e.code != undefined) {
                this.codes.set(e.code, 0);
            }
            else {
                this.codes.set(this.translateKeyToCode(e.key), 0);
            }
            if (e.key == "F12")
                return;
            if (e.key == "i" && this.modifiers == 3)
                return;
            e.preventDefault();
        }
    }
    XOR.InputSystem = InputSystem;
})(XOR || (XOR = {}));
/// <reference path="LibXOR.ts" />
var XOR;
(function (XOR) {
    let Color;
    (function (Color) {
        Color[Color["BLACK"] = 0] = "BLACK";
        Color[Color["GRAY33"] = 1] = "GRAY33";
        Color[Color["GRAY67"] = 2] = "GRAY67";
        Color[Color["WHITE"] = 3] = "WHITE";
        Color[Color["RED"] = 4] = "RED";
        Color[Color["ORANGE"] = 5] = "ORANGE";
        Color[Color["YELLOW"] = 6] = "YELLOW";
        Color[Color["GREEN"] = 7] = "GREEN";
        Color[Color["CYAN"] = 8] = "CYAN";
        Color[Color["AZURE"] = 9] = "AZURE";
        Color[Color["BLUE"] = 10] = "BLUE";
        Color[Color["VIOLET"] = 11] = "VIOLET";
        Color[Color["ROSE"] = 12] = "ROSE";
        Color[Color["BROWN"] = 13] = "BROWN";
        Color[Color["GOLD"] = 14] = "GOLD";
        Color[Color["FORESTGREEN"] = 15] = "FORESTGREEN";
    })(Color = XOR.Color || (XOR.Color = {}));
    let HueShift;
    (function (HueShift) {
        HueShift[HueShift["Zero"] = 0] = "Zero";
        HueShift[HueShift["SevenHalf"] = 1] = "SevenHalf";
        HueShift[HueShift["Fifteen"] = 2] = "Fifteen";
        HueShift[HueShift["OneEighty"] = 3] = "OneEighty";
    })(HueShift = XOR.HueShift || (XOR.HueShift = {}));
    class PaletteSystem {
        constructor(xor) {
            this.xor = xor;
            this.BLACK = 0;
            this.GRAY33 = 1;
            this.GRAY67 = 2;
            this.WHITE = 3;
            this.RED = 4;
            this.ORANGE = 5;
            this.YELLOW = 6;
            this.GREEN = 7;
            this.CYAN = 8;
            this.AZURE = 9;
            this.BLUE = 10;
            this.VIOLET = 11;
            this.ROSE = 12;
            this.BROWN = 13;
            this.GOLD = 14;
            this.FORESTGREEN = 15;
        }
        /**
         *
         * @param index (0 = BLACK, 1 = GRAY33, 2 = GRAY67, 3 = WHITE, 4 = RED, 5 = ORANGE, 6 = YELLOW, 7 = GREEN, 8 = CYAN, 9 = AZURE, 10 = BLUE, 11 = VIOLET, 12 = ROSE, 13 = BROWN, 14 = GOLD, 15 = FORESTGREEN)
         * @returns Vector3 color with RGB values 0 to 1
         */
        getColor(index) {
            if (index == 0)
                return GTE.vec3(0.000, 0.000, 0.000); //Black
            if (index == 1)
                return GTE.vec3(0.333, 0.333, 0.333); //Gray33
            if (index == 2)
                return GTE.vec3(0.667, 0.667, 0.667); //Gray67
            if (index == 3)
                return GTE.vec3(1.000, 1.000, 1.000); //White
            if (index == 4)
                return GTE.vec3(1.000, 0.000, 0.000); //Red
            if (index == 5)
                return GTE.vec3(0.894, 0.447, 0.000); //Orange
            if (index == 6)
                return GTE.vec3(0.894, 0.894, 0.000); //Yellow
            if (index == 7)
                return GTE.vec3(0.000, 1.000, 0.000); //Green
            if (index == 8)
                return GTE.vec3(0.000, 0.707, 0.707); //Cyan
            if (index == 9)
                return GTE.vec3(0.000, 0.447, 0.894); //Azure
            if (index == 10)
                return GTE.vec3(0.000, 0.000, 1.000); //Blue
            if (index == 11)
                return GTE.vec3(0.447, 0.000, 0.894); //Violet
            if (index == 12)
                return GTE.vec3(0.894, 0.000, 0.447); //Rose
            if (index == 13)
                return GTE.vec3(0.500, 0.250, 0.000); //Brown
            if (index == 14)
                return GTE.vec3(0.830, 0.670, 0.220); //Gold
            if (index == 15)
                return GTE.vec3(0.250, 0.500, 0.250); //ForestGreen
            return GTE.vec3(0.0, 0.0, 0.0); // Black
        }
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
        calcColor(color1, color2, colormix, color1hue, color2hue, negative) {
            let c1 = this.getColor(color1);
            let c2 = this.getColor(color2);
            let ch1 = this.hueshiftColor(c1, color1hue);
            let ch2 = this.hueshiftColor(c2, color2hue);
            let cmix = this.mixColors(ch1, ch2, colormix);
            let cneg = negative ? this.negativeColor(cmix) : cmix;
            return cneg;
        }
        /**
         * calcColorBits(bits)
         * @param bits 16 bit number (0-3: color1, 4-7: color2, 8-10: mix, 9-11: color1 hue shift, 12-14: color2 hue shift, 15: negative)
         * @returns Vector3 color with RGB values 0 to 1
         */
        calcColorBits(bits) {
            let color1 = (bits | 0) & 0xF;
            let color2 = (bits >> 4) & 0xF;
            let colormix = (bits >> 8) & 0x7;
            let color1hue = (bits >> 11) & 0x3;
            let color2hue = (bits >> 14) & 0x3;
            let negative = (bits >> 15) & 0x1;
            return this.calcColor(color1, color2, colormix, color1hue, color2hue, negative);
        }
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
        calcBits(color1, color2, colormix, color1hue, color2hue, negative) {
            let bits = 0;
            bits |= (color1 & 0xF);
            bits |= (color2 & 0xF) << 4;
            bits |= (colormix & 0x7) << 8;
            bits |= (color1hue & 0x3) << 11;
            bits |= (color2hue & 0x3) << 14;
            bits |= (negative & 0x1) << 15;
            return bits;
        }
        /**
         * mixColors(color1, color2, mix)
         * @param color1 RGB color with values 0 to 1
         * @param color2 RGB color with values 0 to 1
         * @param mix 0 to 7 representing lerp mix
         * @returns Vector3 color with RGB values 0 to 1
         */
        mixColors(color1, color2, mix) {
            let t = GTE.clamp(1.0 - mix / 7.0, 0.0, 1.0);
            return GTE.vec3(GTE.lerp(color1.x, color2.x, t), GTE.lerp(color1.y, color2.y, t), GTE.lerp(color1.z, color2.z, t));
        }
        /**
         * hueshiftcolor(color, shift)
         * @param color RGB color with values 0 to 1
         * @param shift 0 = no shift, 1 = 7.5 degrees, 2 = 15 degrees, 3 = 180 degrees
         * @returns Vector3 color with RGB values 0 to 1
         */
        hueshiftColor(color, shift) {
            let hue = 0;
            if (shift == 1)
                hue = 7.5 / 360;
            if (shift == 2)
                hue = 15 / 360;
            if (shift == 3)
                hue = 0.5;
            let hsl = XOR.PaletteSystem.rgb2hsl(color);
            hsl.x += hue;
            return XOR.PaletteSystem.hsl2rgb(hsl);
        }
        /**
         * negativeColor(color3)
         * @param color RGB color with values 0 to 1
         * @returns Vector3 representing 1 - color
         */
        negativeColor(color) {
            return GTE.vec3(1.0 - color.x, 1.0 - color.y, 1.0 - color.z);
        }
        /**
         * getHtmlColor(color: Vector3)
         * @param color RGB color with values 0 to 1
         * @returns string valid html color
         */
        getHtmlColor(color) {
            let r = (GTE.clamp(color.x * 255.99, 0, 255) | 0).toString(16);
            let g = (GTE.clamp(color.y * 255.99, 0, 255) | 0).toString(16);
            let b = (GTE.clamp(color.z * 255.99, 0, 255) | 0).toString(16);
            if (r.length % 2)
                r = '0' + r;
            if (g.length % 2)
                g = '0' + g;
            if (b.length % 2)
                b = '0' + b;
            return '#' + r + g + b;
        }
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
        setpalette(paletteIndex, colorIndex, color1, color2, colormix, color1hue, color2hue, negative) {
            let bits = this.calcBits(color1, color2, colormix, color1hue, color2hue, negative);
            this.setpalettebits(paletteIndex, colorIndex, bits);
        }
        /**
         * setpalettebits(paletteIndex, colorIndex, bits)
         * @param paletteIndex 0 to 15
         * @param colorIndex 0 to 15
         * @param bits 16 bit number (0-3: color1, 4-7: color2, 8-10: mix, 9-11: color1 hue shift, 12-14: color2 hue shift, 15: negative)
         * @returns nothing
         */
        setpalettebits(paletteIndex, colorIndex, bits) {
            if (!isFinite(paletteIndex) || paletteIndex < 0 || paletteIndex > 15)
                return;
            if (!isFinite(colorIndex) || colorIndex < 0 || colorIndex > 15)
                return;
            this.xor.memory.POKE(this.xor.memory.PALETTESTART + paletteIndex * 16 + colorIndex, bits);
        }
        /**
         * getpalette(paletteIndex, colorIndex)
         * @param paletteIndex 0 - 15
         * @param colorIndex 0 - 15
         * @returns Vector3 color with RGB values 0 to 1
         */
        getpalette(paletteIndex, colorIndex) {
            let bits = this.getpalettebits(paletteIndex, colorIndex);
            return this.calcColorBits(bits);
        }
        /**
         * getpalettebits(paletteIndex, colorIndex)
         * @param paletteIndex 0 - 15
         * @param colorIndex 0 - 15
         * @returns integer representing 16-bit LibXOR color model
         */
        getpalettebits(paletteIndex, colorIndex) {
            if (!isFinite(paletteIndex) || paletteIndex < 0 || paletteIndex > 15)
                return 0;
            if (!isFinite(colorIndex) || colorIndex < 0 || colorIndex > 15)
                return 0;
            return this.xor.memory.PEEK(this.xor.memory.PALETTESTART + paletteIndex * 16 + colorIndex);
        }
        static hue2rgb(f1, f2, hue) {
            if (hue < 0.0)
                hue += 1.0;
            else if (hue > 1.0)
                hue -= 1.0;
            let res = 0.0;
            if ((6.0 * hue) < 1.0)
                res = f1 + (f2 - f1) * 6.0 * hue;
            else if ((2.0 * hue) < 1.0)
                res = f2;
            else if ((3.0 * hue) < 2.0)
                res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
            else
                res = f1;
            return res;
        }
        static hsl2rgb(hsl) {
            if (hsl.y == 0.0) {
                return GTE.vec3(hsl.z, hsl.z, hsl.z); // Luminance
            }
            else {
                let f2;
                if (hsl.z < 0.5)
                    f2 = hsl.z * (1.0 + hsl.y);
                else
                    f2 = hsl.z + hsl.y - hsl.y * hsl.z;
                let f1 = 2.0 * hsl.z - f2;
                return GTE.vec3(XOR.PaletteSystem.hue2rgb(f1, f2, hsl.x + (1.0 / 3.0)), XOR.PaletteSystem.hue2rgb(f1, f2, hsl.x), XOR.PaletteSystem.hue2rgb(f1, f2, hsl.x - (1.0 / 3.0)));
            }
        }
        static rgb2hsl(rgb) {
            let cmin = Math.min(rgb.x, Math.min(rgb.y, rgb.z));
            let cmax = Math.max(rgb.x, Math.max(rgb.y, rgb.z));
            let diff = cmax - cmin;
            let l = 0.5 * (cmin + cmax);
            let s = 0.0;
            let h = 0.0;
            let r = rgb.x;
            let g = rgb.y;
            let b = rgb.z;
            if (diff < 1.0 / 255.0) {
                return GTE.vec3(h, s, l);
            }
            else {
                if (l < 0.5) {
                    s = diff / (cmax + cmin);
                }
                else {
                    s = diff / (2.0 - cmax - cmin);
                }
                let r2 = (cmax - r) / diff;
                let g2 = (cmax - g) / diff;
                let b2 = (cmax - b) / diff;
                if (r == cmax) {
                    h = (g == cmin ? 5.0 + b2 : 1.0 - g2);
                }
                else if (g == cmax) {
                    h = (b == cmin ? 1.0 + r2 : 3.0 - b2);
                }
                else {
                    h = (r == cmin ? 3.0 + g2 : 5.0 - r2);
                }
                h /= 6.0;
                if (h < 0.0)
                    h += 1.0;
                else if (h > 1.0)
                    h -= 1.0;
            }
            return GTE.vec3(h, s, l);
        }
    }
    XOR.PaletteSystem = PaletteSystem;
})(XOR || (XOR = {}));
/// <reference path="FxFBO.ts" />
/// <reference path="FxRenderingContext.ts" />
var Fluxions;
(function (Fluxions) {
    class FxFboSystem {
        constructor(fx) {
            this.fx = fx;
            this._fbo = new Map();
            this.currentFBO = null;
        }
        /**
         * Returns null or the FBO referred to by name
         * @param name The name of the FBO
         */
        get(name) {
            return this._fbo.get(name) || null;
        }
        /**
         * Creates a new FBO and adds it to the scene graph
         * @param name The name of the FBO
         * @param hasDepth Does the FBO have a depth attachment
         * @param hasColor Does the FBO have a color attachment
         * @param width The width of the FBO (should be power of two)
         * @param height The height of the FBO (should be power of two)
         * @param colorType 0 for gl.UNSIGNED_BYTE or 1 for gl.FLOAT
         */
        add(name, hasColor, hasDepth, width, height, colorType, depthType) {
            this._fbo.set(name, new FxFBO(this.fx, hasColor, hasDepth, width, height, colorType, depthType));
            return this.get(name);
        }
        /**
         * autoresize
         */
        autoresize() {
            let fx = this.fx;
            this._fbo.forEach((fbo) => {
                if (fbo.width != fx.width || fbo.height != fx.height) {
                    fbo.autoResize(fx.width, fx.height);
                }
            });
        }
        restore() {
            if (this.currentFBO) {
                this.currentFBO.restore();
                this.currentFBO = null;
            }
            else {
                for (let fbo of this._fbo) {
                    if (fbo[1].complete)
                        fbo[1].unbindTextures();
                }
            }
        }
        configure(rc, startUnit = 11) {
            if (rc.writeToFBO != "") {
                let fbo = this.get(rc.writeToFBO);
                if (fbo) {
                    fbo.use(rc.clearWriteToFBO, rc.disableWriteToFBOColorWrites);
                    this.currentFBO = fbo;
                }
            }
            let unit = startUnit;
            for (let fbo of rc.readFromFBOs) {
                this.configureFBO(rc, fbo, unit, unit + 1);
                unit += 2;
            }
        }
        configureFBO(rc, name, colorUnit, depthUnit) {
            const colorUniform = name + "Color";
            const depthUniform = name + "Depth";
            const resolutionUnifom = name + "Resolution";
            const usingUniform = name + "Enabled";
            let fbo = this._fbo.get(name) || null;
            if (!fbo)
                return;
            if (!rc.writesToFBO && fbo.complete) {
                rc.uniform2f(resolutionUnifom, fbo.dimensions);
                rc.uniform1f(usingUniform, rc.writesToFBO ? 0 : 1);
                fbo.bindTextures(colorUnit, depthUnit);
                if (fbo.color)
                    rc.uniform1i(colorUniform, colorUnit);
                if (fbo.depth)
                    rc.uniform1i(depthUniform, depthUnit);
            }
            else {
                rc.uniform1i(colorUniform, 0);
                rc.uniform1i(depthUniform, 0);
            }
        }
    }
    Fluxions.FxFboSystem = FxFboSystem;
})(Fluxions || (Fluxions = {}));
/// <reference path="./FxRenderingContext.ts" />
/// <reference path="../LibXOR.ts" />
var Fluxions;
(function (Fluxions) {
    class FxTextureSystem {
        /**
         *
         * @param {FxRenderingContext} fx The rendering context
         */
        constructor(fx) {
            this.fx = fx;
            this._textures = new Map();
            this.imagefiles = [];
            let GL = WebGL2RenderingContext;
            let gl = fx.gl;
            let tex2D = gl.createTexture();
            let texCube = gl.createTexture();
            if (!texCube || !tex2D) {
                throw TypeError("texCube or tex2D is not valid");
            }
            let pixels = new ImageData(new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255]), 2, 2);
            gl.bindTexture(gl.TEXTURE_2D, tex2D);
            gl.texImage2D(gl.TEXTURE_2D, 0, GL.SRGB8_ALPHA8, GL.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            let xppixels = new ImageData(new Uint8ClampedArray([127, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 127, 0, 0, 255]), 2, 2);
            let xnpixels = new ImageData(new Uint8ClampedArray([0, 127, 127, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 127, 127, 255]), 2, 2);
            let yppixels = new ImageData(new Uint8ClampedArray([0, 127, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 127, 0, 255]), 2, 2);
            let ynpixels = new ImageData(new Uint8ClampedArray([127, 0, 127, 255, 255, 0, 255, 255, 255, 0, 255, 255, 127, 0, 127, 255]), 2, 2);
            let zppixels = new ImageData(new Uint8ClampedArray([0, 0, 127, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 127, 255]), 2, 2);
            let znpixels = new ImageData(new Uint8ClampedArray([127, 127, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 127, 127, 0, 255]), 2, 2);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texCube);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, xnpixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, ynpixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, znpixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, xppixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, yppixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, zppixels);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            this._default2D = new Fluxions.FxTexture(this.fx, "__texture2D__", "", WebGLRenderingContext.TEXTURE_2D, tex2D);
            this._defaultCube = new Fluxions.FxTexture(this.fx, "__textureCube__", "", gl.TEXTURE_CUBE_MAP, texCube);
            this._textures.set("__texture2D__", this._default2D);
            this._textures.set("__textureCube__", this._defaultCube);
        }
        has(name) {
            if (this._textures.has(name))
                return true;
            return false;
        }
        get(name) {
            let t = this._textures.get(name);
            if (t)
                return t;
            return null;
        }
        /**
         *
         * @param {string} name name of the texture
         * @param {FxTexture} value
         */
        set(name, value) {
            this._textures.set(name, value);
        }
        get loaded() {
            for (let i of this.imagefiles) {
                if (!i.loaded)
                    return false;
            }
            return true;
        }
        get failed() {
            for (let i of this.imagefiles) {
                if (i.failed)
                    return true;
            }
            return false;
        }
        get length() {
            return this.imagefiles.length;
        }
        get percentLoaded() {
            let a = 0;
            for (let i of this.imagefiles) {
                if (i.loaded)
                    a++;
            }
            return 100.0 * a / this.imagefiles.length;
        }
        /**
         * @param {string} name the key to find this texture
         * @param {string} url  the url to load this texture
         */
        load(name, url) {
            if (this._textures.has(name))
                return;
            let self = this;
            let tname = name;
            this.imagefiles.push(new XOR.ImageFileLoader(url, (data, name) => {
                self.processTextureMap(data, tname);
                hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + tname);
            }));
        }
        wasRequested(name) {
            for (let img of this.imagefiles) {
                if (img.name == name)
                    return true;
            }
            return false;
        }
        processTextureMap(image, name) {
            let GL = WebGL2RenderingContext;
            let gl = this.fx.gl;
            let minFilter = gl.NEAREST;
            let magFilter = gl.NEAREST;
            let maxAnisotropy = 1.0;
            let ext = this.fx.getExtension("EXT_texture_filter_anisotropic");
            if (ext) {
                maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            }
            else {
                hflog.debug("cannot use anisotropic filtering");
            }
            if (image.width == 6 * image.height) {
                let images = new Array(6);
                XOR.SeparateCubeMapImages(image, images);
                let texture = gl.createTexture();
                if (texture) {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    for (let i = 0; i < 6; i++) {
                        if (!images[i]) {
                            continue;
                        }
                        else {
                            hflog.debug("image " + i + " w:" + images[i].width + "/h:" + images[i].height);
                        }
                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL.SRGB8_ALPHA8, GL.RGBA, gl.UNSIGNED_BYTE, images[i]);
                    }
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    let t = new Fluxions.FxTexture(this.fx, name, name, gl.TEXTURE_CUBE_MAP, texture);
                    this.fx.textures.set(name, t);
                }
            }
            else {
                let texture = gl.createTexture();
                if (texture) {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    // gl.texImage2D(gl.TEXTURE_2D, 0, GL.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
                    if (ext) {
                        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
                    }
                    let t = new Fluxions.FxTexture(this.fx, name, name, gl.TEXTURE_2D, texture);
                    this.fx.textures.set(name, t);
                }
            }
        }
    }
    Fluxions.FxTextureSystem = FxTextureSystem;
})(Fluxions || (Fluxions = {}));
/// <reference path="FxRenderingContext.ts" />
var Fluxions;
(function (Fluxions) {
    class FxTextureUniform {
        /**
         *
         * @param {string} textureName The name of the textures from the fx.textures[] array
         * @param {string} uniformName The name of the uniform to apply this texture to
         * @param {string} samplerName The name of the sampler params to apply (default "")
         */
        constructor(textureName, uniformName, samplerName = "") {
            this.textureName = textureName;
            this.uniformName = uniformName;
            this.samplerName = samplerName;
            this.texture = null;
            this.sampler = null;
            this.unit = 0;
        }
        getTexture(fx) {
            if (this.texture)
                return this.texture;
            let t = fx.textures.get(this.textureName);
            if (t) {
                this.texture = t.texture;
            }
            return this.texture;
        }
    }
    Fluxions.FxTextureUniform = FxTextureUniform;
})(Fluxions || (Fluxions = {}));
// LibXOR Library
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
/// <reference path="Fluxions.ts"/>
/// <reference path="FxTextureUniform.ts" />
var Fluxions;
(function (Fluxions) {
    class FxRenderConfig {
        constructor(fx) {
            this.fx = fx;
            this.name = "unknown";
            this.vshaderUrl = "unknown.vert";
            this.fshaderUrl = "unknown.frag";
            this._isCompiled = false;
            this._isLinked = false;
            this._vertShader = null;
            this._fragShader = null;
            this._program = null;
            this._vertShaderSource = "";
            this._fragShaderSource = "";
            this._vertShaderInfoLog = "";
            this._fragShaderInfoLog = "";
            this._vertShaderCompileStatus = false;
            this._fragShaderCompileStatus = false;
            this._programInfoLog = "";
            this._programLinkStatus = false;
            this.uniforms = new Map();
            this.uniformInfo = new Map();
            this.uniformUnits = new Map();
            this.useDepthTest = true;
            this.depthTest = WebGLRenderingContext.LESS;
            this.depthMask = true;
            this.useCullFace = false;
            this.cullFaceMode = WebGL2RenderingContext.BACK;
            this.useBlending = false;
            this.blendSrcFactor = WebGLRenderingContext.ONE;
            this.blendDstFactor = WebGLRenderingContext.ZERO;
            this.useStencilTest = false;
            this.stencilFunc = WebGLRenderingContext.ALWAYS;
            this.stencilFuncRef = 0.0;
            this.stencilMask = 1;
            this.renderShadowMap = false;
            this.renderGBuffer = false;
            this.renderImage = false;
            this.renderEdges = false;
            this.writesToFBO = false;
            this.writeToFBO = "";
            this.clearWriteToFBO = true;
            this.disableWriteToFBOColorWrites = false;
            this.readFromFBOs = [];
            this.textures = [];
            this._texturesBound = 0;
            this._warnings = 10;
        }
        get usable() {
            if (this.writesToFBO && !this.fx.verifyFBO(this.writeToFBO))
                return false;
            return this.isCompiledAndLinked();
        }
        isCompiledAndLinked() {
            if (this._isCompiled && this._isLinked)
                return true;
            return false;
        }
        use() {
            let fx = this.fx;
            let gl = this.fx.gl;
            gl.useProgram(this._program);
            if (this.useDepthTest) {
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(this.depthTest);
            }
            if (this.useBlending) {
                gl.enable(gl.BLEND);
                gl.blendFunc(this.blendSrcFactor, this.blendDstFactor);
            }
            if (this.useCullFace) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(this.cullFaceMode);
            }
            if (this.useStencilTest) {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(this.stencilFunc, this.stencilFuncRef, this.stencilMask);
            }
            gl.depthMask(this.depthMask);
            let unit = 0;
            for (let texture of this.textures) {
                this.bindTextureUniform(texture.uniformName, texture.textureName, unit);
                unit++;
            }
            this._texturesBound = unit;
            this.fx.fbos.configure(this, unit);
        }
        /**
         *
         * @param uniform name of the uniform
         * @param texture name of the texture
         * @param unit >= 0 the unit, or if unit < 0 the last unit bound by this texture
         */
        bindTextureUniform(uniform, texture, unit) {
            let u = this.uniforms.get(uniform);
            if (!u)
                return;
            if (unit >= 0)
                this.uniformUnits.set(uniform, unit);
            let t = this.fx.textures.get(texture);
            if (!t)
                return;
            if (unit < 0) {
                let lastUnit = this.uniformUnits.get(uniform) || 0;
                t.bindUnit(lastUnit);
                this.fx.gl.uniform1i(u, lastUnit);
            }
            else {
                t.bindUnit(unit);
                this.fx.gl.uniform1i(u, unit);
            }
        }
        restore() {
            let gl = this.fx.gl;
            gl.useProgram(null);
            if (this.useDepthTest) {
                gl.disable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LESS);
            }
            if (this.useBlending) {
                gl.disable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ZERO);
            }
            if (this.useCullFace) {
                gl.disable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
            }
            if (this.useStencilTest) {
                gl.disable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 0, 1);
            }
            gl.depthMask(true);
            for (let i = 0; i < this._texturesBound; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }
            this.fx.fbos.restore();
        }
        uniformMatrix4f(uniformName, m) {
            let gl = this.fx.gl;
            if (!this._program)
                return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniformMatrix4fv(location, false, m.toColMajorArray());
            }
        }
        uniform1i(uniformName, x) {
            let gl = this.fx.gl;
            if (!this._program)
                return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform1i(location, x);
            }
        }
        uniform1f(uniformName, x) {
            let gl = this.fx.gl;
            if (!this._program)
                return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform1f(location, x);
            }
            else if (this._warnings > 0) {
                this._warnings--;
                hflog.warn(uniformName + " is not a uniform for rc " + this.name);
            }
        }
        uniform2f(uniformName, v) {
            let gl = this.fx.gl;
            if (!this._program)
                return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform2fv(location, v.toFloat32Array());
            }
        }
        uniform3f(uniformName, v) {
            let gl = this.fx.gl;
            if (!this._program)
                return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform3fv(location, v.toFloat32Array());
            }
        }
        uniform4f(uniformName, v) {
            let gl = this.fx.gl;
            if (!this._program)
                return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location) {
                gl.uniform4fv(location, v.toFloat32Array());
            }
        }
        getAttribLocation(name) {
            let gl = this.fx.gl;
            if (!gl)
                return -1;
            if (!this._program)
                return -1;
            return gl.getAttribLocation(this._program, name);
        }
        getUniformLocation(name) {
            let gl = this.fx.gl;
            if (!gl)
                return null;
            if (!this._program)
                return null;
            let uloc = gl.getUniformLocation(this._program, name);
            if (!uloc)
                return null;
            return uloc;
        }
        compile(vertShaderSource, fragShaderSource) {
            let gl = this.fx.gl;
            let vertShader = gl.createShader(gl.VERTEX_SHADER);
            if (vertShader) {
                gl.shaderSource(vertShader, vertShaderSource);
                gl.compileShader(vertShader);
                let status = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
                let infoLog = null;
                if (!status) {
                    infoLog = gl.getShaderInfoLog(vertShader);
                    hflog.error("VERTEX SHADER COMPILE ERROR:");
                    hflog.error(infoLog ? infoLog : "");
                    hflog.error("--------------------------------------------");
                    // let errorElement: HTMLElement | null = document.getElementById("errors");
                    // if (!errorElement && infoLog) {
                    //     let newDiv: HTMLDivElement = document.createElement("div");
                    //     newDiv.appendChild(document.createTextNode("Vertex shader info log"));
                    //     newDiv.appendChild(document.createElement("br"));
                    //     newDiv.appendChild(document.createTextNode(infoLog));
                    //     let pre = document.createElement("pre");
                    //     pre.textContent = this._vertShaderSource;
                    //     pre.style.width = "50%";
                    //     newDiv.appendChild(pre);
                    //     document.body.appendChild(newDiv);
                    // }
                }
                if (status)
                    this._vertShaderCompileStatus = true;
                if (infoLog)
                    this._vertShaderInfoLog = infoLog;
                this._vertShader = vertShader;
            }
            else {
                return false;
            }
            let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
            if (fragShader) {
                gl.shaderSource(fragShader, fragShaderSource);
                gl.compileShader(fragShader);
                let status = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
                let infoLog = null;
                if (!status) {
                    infoLog = gl.getShaderInfoLog(fragShader);
                    hflog.error("FRAGMENT SHADER COMPILE ERROR:");
                    hflog.error(infoLog ? infoLog : "");
                    hflog.error("--------------------------------------------");
                    // let errorElement: HTMLElement | null = document.getElementById("errors");
                    // if (!errorElement && infoLog) {
                    //     let newDiv: HTMLDivElement = document.createElement("div");
                    //     newDiv.appendChild(document.createTextNode("Fragment shader info log"));
                    //     newDiv.appendChild(document.createElement("br"));
                    //     newDiv.appendChild(document.createTextNode(infoLog));
                    //     let pre = document.createElement("pre");
                    //     pre.textContent = this._fragShaderSource;
                    //     pre.style.width = "50%";
                    //     newDiv.appendChild(pre);
                    //     document.body.appendChild(newDiv);
                    // }
                }
                if (status)
                    this._fragShaderCompileStatus = true;
                if (infoLog)
                    this._fragShaderInfoLog = infoLog;
                this._fragShader = fragShader;
            }
            else {
                return false;
            }
            if (this._vertShaderCompileStatus && this._fragShaderCompileStatus) {
                this._isCompiled = true;
                this._program = gl.createProgram();
                if (this._program) {
                    gl.attachShader(this._program, this._vertShader);
                    gl.attachShader(this._program, this._fragShader);
                    gl.linkProgram(this._program);
                    if (gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
                        this._programLinkStatus = true;
                        this._isLinked = true;
                    }
                    else {
                        this._programLinkStatus = false;
                        let infoLog = gl.getProgramInfoLog(this._program);
                        console.error("PROGRAM LINK ERROR:");
                        console.error(infoLog ? infoLog : "");
                        console.error("--------------------------------------------");
                        // if (infoLog) {
                        //     this._programInfoLog = infoLog;
                        //     let errorElement: HTMLElement | null = document.getElementById("errors");
                        //     if (!errorElement && infoLog) {
                        //         let newDiv: HTMLDivElement = document.createElement("div");
                        //         newDiv.appendChild(document.createTextNode("PROGRAM INFO LOG"));
                        //         newDiv.appendChild(document.createElement("br"));
                        //         newDiv.appendChild(document.createTextNode(infoLog));
                        //         document.body.appendChild(newDiv);
                        //     }
                        // }
                    }
                }
            }
            else {
                return false;
            }
            this.updateActiveUniforms();
            return true;
        }
        updateActiveUniforms() {
            let gl = this.fx.gl;
            if (!this._program)
                return false;
            let numUniforms = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
            this.uniforms.clear();
            this.uniformInfo.clear();
            for (let i = 0; i < numUniforms; i++) {
                let uniform = gl.getActiveUniform(this._program, i);
                if (!uniform)
                    continue;
                this.uniformInfo.set(uniform.name, uniform);
                this.uniforms.set(uniform.name, gl.getUniformLocation(this._program, uniform.name));
            }
            return true;
        }
        addTexture(textureName, uniformName) {
            this.textures.push(new Fluxions.FxTextureUniform(textureName, uniformName));
        }
        clearTextures() {
            this.textures = [];
        }
    }
    Fluxions.FxRenderConfig = FxRenderConfig;
})(Fluxions || (Fluxions = {}));
/// <reference path="FxRenderConfig.ts" />
var Fluxions;
(function (Fluxions) {
    class FxRenderConfigSystem {
        constructor(fx) {
            this.fx = fx;
            this.renderconfigs = new Map();
            this.shaderLoaders = [];
        }
        get loaded() {
            for (let i of this.shaderLoaders) {
                if (!i.loaded)
                    return false;
            }
            return true;
        }
        get failed() {
            for (let i of this.shaderLoaders) {
                if (i.failed)
                    return true;
            }
            return false;
        }
        get length() {
            return this.shaderLoaders.length;
        }
        get percentLoaded() {
            let a = 0;
            for (let i of this.shaderLoaders) {
                if (i.loaded)
                    a++;
            }
            return 100.0 * a / this.shaderLoaders.length;
        }
        create(name) {
            if (!this.fx)
                throw "Fluxions is not initialized";
            let rc = new Fluxions.FxRenderConfig(this.fx);
            this.renderconfigs.set(name, rc);
            rc.name = name;
            return rc;
        }
        load(name, vshaderUrl, fshaderUrl) {
            let rc = new Fluxions.FxRenderConfig(this.fx);
            rc.name = name;
            rc.vshaderUrl = vshaderUrl;
            rc.fshaderUrl = fshaderUrl;
            this.renderconfigs.set(name, rc);
            let sl = new XOR.ShaderLoader(vshaderUrl, fshaderUrl, (vsource, fsource) => {
                rc.compile(vsource, fsource);
                hflog.log("Loaded " + vshaderUrl + " and " + fshaderUrl);
            });
            this.shaderLoaders.push(sl);
            return rc;
        }
        use(name) {
            if (!this.fx)
                throw "Fluxions is not initialized";
            if (!name) {
                this.fx.gl.useProgram(null);
            }
            else if (this.renderconfigs.has(name)) {
                let rc = this.renderconfigs.get(name);
                if (rc && rc.usable) {
                    rc.use();
                    return rc;
                }
            }
            return null;
        }
    }
    Fluxions.FxRenderConfigSystem = FxRenderConfigSystem;
})(Fluxions || (Fluxions = {}));
/// <reference path="Fluxions.ts" />
/// <reference path="FxFboSystem.ts" />
/// <reference path="FxTextureSystem.ts" />
/// <reference path="FxRenderConfigSystem.ts" />
var Fluxions;
(function (Fluxions) {
    class FxRenderingContext {
        constructor(xor) {
            this.xor = xor;
            this.enabledExtensions = new Map();
            this._visible = false;
            this._resized = true;
            if (!xor.graphics.gl) {
                hflog.error("Unable to start Fluxions without valid gl context");
                throw "Unable to start Fluxions without valid gl context";
            }
            /** @property {WebGLRenderingContext} gl */
            this.gl = xor.graphics.gl;
            this.textures = new Fluxions.FxTextureSystem(this);
            this.fbos = new Fluxions.FxFboSystem(this);
            let debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                let vendor = this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                let renderer = this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                hflog.log(vendor);
                hflog.log(renderer);
            }
            if (xor.graphics.hasWebGL2) {
                this.enableExtensions([
                    "EXT_texture_filter_anisotropic",
                    "EXT_color_buffer_float",
                    "WEBGL_debug_renderer_info",
                    "OES_texture_float_linear",
                ]);
            }
            else {
                this.enableExtensions([
                    "EXT_texture_filter_anisotropic",
                    "EXT_color_buffer_float",
                    "WEBGL_depth_texture",
                    "WEBGL_debug_renderer_info",
                    "OES_element_index_uint",
                    "OES_standard_derivatives",
                    "OES_texture_float_linear",
                    "OES_texture_float",
                ]);
            }
            if (xor.graphics.hasWebGL2) {
                let GL = WebGL2RenderingContext;
                this.gl.hint(WebGL2RenderingContext.FRAGMENT_SHADER_DERIVATIVE_HINT, GL.NICEST);
            }
            else {
                let standardDerivatives = this.gl.getExtension('OES_standard_derivatives');
                if (standardDerivatives) {
                    this.gl.hint(standardDerivatives.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, this.gl.NICEST);
                }
            }
            this.scenegraph = new Fluxions.FxScenegraph(this);
            this.renderconfigs = new Fluxions.FxRenderConfigSystem(this);
        }
        get width() { return this.xor.graphics.width; }
        get height() { return this.xor.graphics.height; }
        get aspectRatio() { return this.width / this.height; }
        // get visible(): boolean {
        //     return this._visible;
        // }
        // get canvas(): HTMLCanvasElement {
        //     if (!this.canvasElement_)
        //         return new HTMLCanvasElement();
        //     return this.canvasElement_;
        // }
        // ...
        enableExtensions(names) {
            let supportedExtensions = this.gl.getSupportedExtensions();
            if (!supportedExtensions)
                return false;
            let allFound = true;
            for (let name of names) {
                let found = false;
                for (let ext of supportedExtensions) {
                    if (name == ext) {
                        this.enabledExtensions.set(name, this.gl.getExtension(name));
                        hflog.log("Extension " + name + " enabled");
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    hflog.log("Extension " + name + " not enabled");
                    allFound = false;
                }
            }
            return allFound;
        }
        getExtension(name) {
            if (this.enabledExtensions.has(name)) {
                return this.enabledExtensions.get(name);
            }
            return null;
        }
        update() {
            return;
            // if (this._resized) {
            //     this._resized = false;
            //     let w = (window.innerWidth) | 0;
            //     let h = (w / this.aspectRatio) | 0;
            //     this.canvas.width = w;
            //     this.canvas.height = h;
            //     this.width = w;
            //     this.height = h;
            // }
        }
        verifyFBO(name) {
            let fbo = this.fbos.get(name);
            if (fbo) {
                if (fbo.complete)
                    return true;
            }
            return false;
        }
    }
    Fluxions.FxRenderingContext = FxRenderingContext;
})(Fluxions || (Fluxions = {}));
/// <reference path="../GTE/GTE.ts" />
/// <reference path="FxRenderingContext.ts" />
class FxFBO {
    constructor(_renderingContext, color, depth, width = 512, height = 512, _colorType = 0, _depthType = 0, colorUnit = 11, depthUnit = 12, shouldAutoResize = false) {
        this._renderingContext = _renderingContext;
        this.color = color;
        this.depth = depth;
        this.width = width;
        this.height = height;
        this._colorType = _colorType;
        this._depthType = _depthType;
        this.colorUnit = colorUnit;
        this.depthUnit = depthUnit;
        this.shouldAutoResize = shouldAutoResize;
        this._colorTexture = null;
        this._depthTexture = null;
        this._complete = false;
        this._colorUnit = -1;
        this._depthUnit = -1;
        this._depthTypeDesc = "NODEPTH";
        this._colorTypeDesc = "NOCOLOR";
        this.clearColor = Vector3.make(0.2, 0.2, 0.2);
        let gl = _renderingContext.gl;
        let fbo = gl.createFramebuffer();
        if (fbo) {
            this._fbo = fbo;
        }
        else {
            throw "Unable to create FBO";
        }
        this.make();
    }
    // private _powerOfTwoDimensions: Vector2;
    get complete() { return this._complete; }
    get dimensions() { return Vector2.make(this.width, this.height); }
    fboStatusString(fboStatus) {
        switch (fboStatus) {
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
                return "Incomplete Multisample";
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                return "Incomplete Dimensions";
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                return "Incomplete Missing Attachment";
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                return "Incomplete Attachment";
        }
        return "Complete";
    }
    autoResize(width, height) {
        if (!this.shouldAutoResize)
            return;
        if (this.width == width && this.height == height)
            return;
        let gl = this._renderingContext.gl;
        this.width = width;
        this.height = height;
        if (this._colorTexture)
            gl.deleteTexture(this._colorTexture);
        if (this._depthTexture)
            gl.deleteTexture(this._depthTexture);
        this._colorTexture = null;
        this._depthTexture = null;
        this.make();
    }
    make() {
        let GL = WebGL2RenderingContext;
        let gl = this._renderingContext.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.activeTexture(gl.TEXTURE0);
        if (this.color && !this._colorTexture) {
            this._colorTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._colorTexture);
            let internalformat = GL.RGBA32F;
            let format = GL.RGBA;
            let type = GL.FLOAT;
            this._colorTypeDesc = "RGBA32F";
            switch (this._colorType) {
                case GL.RGBA32F:
                case GL.FLOAT:
                    internalformat = GL.RGBA32F;
                    format = GL.RGBA;
                    type = GL.FLOAT;
                    this._colorTypeDesc = "RGBA32F";
                    break;
                case GL.RGBA16F:
                case GL.HALF_FLOAT:
                    internalformat = GL.RGBA16F;
                    format = GL.RGBA;
                    type = GL.HALF_FLOAT;
                    this._colorTypeDesc = "RGBA16F";
                    break;
                case GL.UNSIGNED_BYTE:
                case GL.RGBA8UI:
                case GL.RGBA8:
                    internalformat = GL.RGBA8;
                    format = GL.RGBA;
                    type = GL.UNSIGNED_BYTE;
                    this._colorTypeDesc = "RGBA8";
                    break;
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, this.width, this.height, 0, format, type, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._colorTexture, 0);
        }
        if (this.depth && !this._depthTexture) {
            this._depthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
            let format = GL.DEPTH_STENCIL;
            let internalformat = GL.DEPTH24_STENCIL8;
            let type = GL.UNSIGNED_INT_24_8;
            this._depthTypeDesc = "DEPTH24_STENCIL8";
            switch (this._depthType) {
                case GL.DEPTH_COMPONENT16:
                case GL.UNSIGNED_SHORT:
                    format = GL.DEPTH_COMPONENT;
                    internalformat = GL.DEPTH_COMPONENT16;
                    type = GL.UNSIGNED_SHORT;
                    this._depthTypeDesc = "DEPTH_COMPONENT16";
                    break;
                case GL.DEPTH_COMPONENT24:
                case GL.UNSIGNED_INT:
                    format = GL.DEPTH_COMPONENT;
                    internalformat = GL.DEPTH_COMPONENT24;
                    type = GL.UNSIGNED_INT;
                    this._depthTypeDesc = "DEPTH_COMPONENT24";
                    break;
                case GL.DEPTH_COMPONENT32F:
                case GL.FLOAT:
                    format = GL.DEPTH_COMPONENT;
                    internalformat = GL.DEPTH_COMPONENT32F;
                    type = GL.FLOAT;
                    this._depthTypeDesc = "DEPTH_COMPONENT32F";
                    break;
                case GL.DEPTH24_STENCIL8:
                case GL.UNSIGNED_INT_24_8:
                    format = GL.DEPTH_STENCIL;
                    internalformat = GL.DEPTH24_STENCIL8;
                    type = GL.UNSIGNED_INT_24_8;
                    this._depthTypeDesc = "DEPTH24_STENCIL8";
                    break;
                case GL.DEPTH32F_STENCIL8:
                case GL.FLOAT_32_UNSIGNED_INT_24_8_REV:
                    format = GL.DEPTH_STENCIL;
                    internalformat = GL.DEPTH32F_STENCIL8;
                    type = GL.FLOAT_32_UNSIGNED_INT_24_8_REV;
                    this._depthTypeDesc = "DEPTH32F_STENCIL8";
                    break;
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, this.width, this.height, 0, format, type, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthTexture, 0);
        }
        let resolutionSizeText = this.width + "x" + this.height;
        let fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (fboStatus != gl.FRAMEBUFFER_COMPLETE) {
            if (this._colorType == gl.FLOAT) {
                this._colorType = gl.UNSIGNED_BYTE;
                gl.deleteTexture(this._colorTexture);
                this._colorTexture = null;
                hflog.warn("FBO::make() --> " + FxFBO.statusToText(fboStatus) + " --> Can't create FLOAT texture, trying UNSIGNED_BYTE");
                this.make();
                return;
            }
            this._complete = false;
            hflog.error("Unable to create a complete framebuffer " + resolutionSizeText + " | status: " + FxFBO.statusToText(fboStatus));
        }
        else {
            this._complete = true;
            hflog.log("Framebuffer is okay! size is " + resolutionSizeText + " with " +
                this._colorTypeDesc +
                "/" + this._depthTypeDesc);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    use(clearScreen = true, disableColorWrites = false) {
        if (!this.complete)
            return;
        let gl = this._renderingContext.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        if (disableColorWrites)
            gl.colorMask(false, false, false, false);
        this._savedViewport = gl.getParameter(gl.VIEWPORT);
        gl.viewport(0, 0, this.width, this.height);
        if (clearScreen) {
            gl.clearColor(this.clearColor.x, this.clearColor.y, this.clearColor.z, 1.0);
            let bits = 0;
            if (this.color)
                bits |= gl.COLOR_BUFFER_BIT;
            if (this.depth)
                bits |= gl.DEPTH_BUFFER_BIT;
            gl.clear(bits);
        }
    }
    restore() {
        if (!this.complete)
            return;
        let gl = this._renderingContext.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (this.color && this._colorTexture) {
            gl.bindTexture(gl.TEXTURE_2D, this._colorTexture);
            // gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        gl.colorMask(true, true, true, true);
        if (this._savedViewport) {
            gl.viewport(this._savedViewport[0], this._savedViewport[1], this._savedViewport[2], this._savedViewport[3]);
            this._savedViewport = undefined;
        }
    }
    bindTextures(colorUnit = 15, depthUnit = 16) {
        let gl = this._renderingContext.gl;
        this._colorUnit = colorUnit;
        this._depthUnit = depthUnit;
        if (this._colorUnit >= 0) {
            gl.activeTexture(this._colorUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._colorTexture);
        }
        if (this._depthUnit >= 0) {
            gl.activeTexture(this._depthUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
        }
        gl.activeTexture(gl.TEXTURE0);
    }
    unbindTextures() {
        let gl = this._renderingContext.gl;
        if (this._colorUnit >= 0) {
            gl.activeTexture(this._colorUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this._colorUnit = -1;
        }
        if (this._depthUnit >= 0) {
            gl.activeTexture(this._depthUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this._depthUnit = -1;
        }
        gl.activeTexture(gl.TEXTURE0);
    }
    static statusToText(status) {
        let gl = WebGL2RenderingContext;
        switch (status) {
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                return "Incomplete attachment";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                return "Incomplete dimensions";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                return "Missing attachment";
                break;
            case gl.FRAMEBUFFER_UNSUPPORTED:
                return "Unsupported";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
                return "Incomplete multisample";
                break;
        }
        return "Unknown error: " + status;
    }
}
/// <reference path="../GTE/GTE.ts" />
var Fluxions;
(function (Fluxions) {
    class FxCamera {
        constructor() {
            this._transform = Matrix4.makeIdentity();
            this._center = new Vector3();
            this._eye = new Vector3(0.0, 0.0, 10.0);
            this._angleOfView = 45.0;
            this._aspectRatio = 1.0;
            this._znear = 1.0;
            this._zfar = 100.0;
            this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
            this.pretransform = Matrix4.makeIdentity();
            this.posttransform = Matrix4.makeIdentity();
        }
        get transform() { return Matrix4.multiply3(this.pretransform, this._transform, this.posttransform); }
        get rotatetransform() {
            let M = this.transform;
            M.m14 = 0.0;
            M.m24 = 0.0;
            M.m34 = 0.0;
            return M;
        }
        set aspectRatio(ar) {
            this._aspectRatio = Math.max(0.001, ar);
            this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
        }
        set angleOfView(angleInDegrees) {
            this._angleOfView = Math.max(1.0, angleInDegrees);
            this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
        }
        set zfar(z) {
            this._zfar = Math.max(z, 0.001);
            let znear = Math.min(this._znear, this._zfar);
            let zfar = Math.max(this._znear, this._zfar);
            this._znear = znear;
            this._zfar = zfar;
            this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
        }
        set znear(z) {
            this._znear = Math.max(z, 0.001);
            let znear = Math.min(this._znear, this._zfar);
            let zfar = Math.max(this._znear, this._zfar);
            this._znear = znear;
            this._zfar = zfar;
            this.projection = Matrix4.makePerspectiveY(this._angleOfView, this._aspectRatio, this._znear, this._zfar);
        }
        get position() {
            return this._transform.col3(3);
        }
        get right() {
            return this._transform.col3(0);
        }
        get left() {
            return this._transform.col3(0).negate();
        }
        get up() {
            return this._transform.col3(1);
        }
        get down() {
            return this._transform.col3(1).negate();
        }
        get forward() {
            return this._transform.col3(2);
        }
        get backward() {
            return this._transform.col3(2).negate();
        }
        get eye() {
            return this._transform.asInverse().row3(3);
        }
        set eye(p) {
            this._eye = p.clone();
            this._transform = Matrix4.makeLookAt(this._eye, this._center, this.up);
            this._eye = this._transform.col3(3);
        }
        set center(p) {
            this._center = p;
            this._transform.lookAt(this._eye, this._center, this.up);
        }
        moveTo(position) {
            this._transform.m14 = position.x;
            this._transform.m24 = position.y;
            this._transform.m34 = position.z;
        }
        move(delta) {
            let tx = this.right.mul(delta.x);
            let ty = this.up.mul(delta.y);
            let tz = this.forward.mul(delta.z);
            this._transform.translate(tx.x, tx.y, tx.z);
            this._transform.translate(ty.x, ty.y, ty.z);
            this._transform.translate(tz.x, tz.y, tz.z);
            return this.position;
        }
        turn(delta) {
            let m = Matrix4.makeIdentity();
            m.rotate(delta.x, 1, 0, 0);
            m.rotate(delta.y, 0, 1, 0);
            m.rotate(delta.z, 0, 0, 1);
            this._transform.multMatrix(m);
        }
        setOrbit(azimuthInDegrees, pitchInDegrees, distance) {
            this._transform.loadIdentity();
            this._transform.rotate(azimuthInDegrees, 0.0, 1.0, 0.0);
            this._transform.rotate(pitchInDegrees, 1.0, 0.0, 0.0);
            this._transform.translate(0.0, 0.0, -distance);
            return this._transform.clone();
        }
    }
    Fluxions.FxCamera = FxCamera;
})(Fluxions || (Fluxions = {}));
/// <reference path="Fluxions.ts" />
var Fluxions;
(function (Fluxions) {
    class FxTexture {
        constructor(fx, name, url, target, texture) {
            this.fx = fx;
            this.name = name;
            this.url = url;
            this.target = target;
            this.texture = texture;
            this.id = "";
            this.minFilter = WebGLRenderingContext.NEAREST;
            this.magFilter = WebGLRenderingContext.NEAREST;
            this.wrapS = WebGLRenderingContext.REPEAT;
            this.wrapT = WebGLRenderingContext.REPEAT;
            this.lastUnitBound = 0;
        }
        setMinMagFilter(minFilter, magFilter) {
            switch (minFilter) {
                case WebGLRenderingContext.NEAREST:
                case WebGLRenderingContext.LINEAR:
                case WebGLRenderingContext.NEAREST_MIPMAP_NEAREST:
                case WebGLRenderingContext.NEAREST_MIPMAP_LINEAR:
                case WebGLRenderingContext.LINEAR_MIPMAP_NEAREST:
                case WebGLRenderingContext.LINEAR_MIPMAP_LINEAR:
                    this.minFilter = minFilter;
                    break;
            }
            switch (magFilter) {
                case WebGLRenderingContext.NEAREST:
                case WebGLRenderingContext.LINEAR:
                    this.magFilter = magFilter;
                    break;
            }
        }
        setWrapST(wrapS, wrapT) {
            switch (wrapS) {
                case WebGLRenderingContext.REPEAT:
                case WebGLRenderingContext.CLAMP_TO_EDGE:
                case WebGLRenderingContext.MIRRORED_REPEAT:
                    this.wrapS = wrapS;
                    break;
            }
            switch (wrapT) {
                case WebGLRenderingContext.REPEAT:
                case WebGLRenderingContext.CLAMP_TO_EDGE:
                case WebGLRenderingContext.MIRRORED_REPEAT:
                    this.wrapT = wrapT;
                    break;
            }
        }
        bindUnit(unit) {
            if (unit === undefined)
                return;
            let gl = this.fx.gl;
            this.lastUnitBound = unit;
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(this.target, this.texture);
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, this.minFilter);
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, this.magFilter);
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, this.wrapS);
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, this.wrapT);
        }
        bind() {
            this.fx.gl.bindTexture(this.target, this.texture);
        }
    }
    Fluxions.FxTexture = FxTexture;
})(Fluxions || (Fluxions = {}));
/// <reference path="Fluxions.ts" />
var Fluxions;
(function (Fluxions) {
    class FxMaterial {
        constructor(name) {
            this.name = name;
            this.Kd = Vector3.make(0.8, 0.8, 0.8);
            this.Ka = Vector3.make(0.2, 0.2, 0.2);
            this.Ks = Vector3.make(1.0, 1.0, 1.0);
            this.Tf = Vector3.make(1.0, 1.0, 1.0);
            this.MapKdMix = 0.0;
            this.MapKd = "";
            this.MapKsMix = 0.0;
            this.MapKs = "";
            this.MapNormalMix = 0.0;
            this.MapNormal = "";
            this.MapTfMix = 0.0;
            this.MapTf = "";
            this.SpecularRoughness = 0;
            this.DiffuseRoughness = 0;
            this.Ni = 1.333;
            this.Ns = 0;
            this.PBn2 = 1.333;
            this.PBk2 = 0;
            this.Dissolve = 1;
            this.minFilter = 0;
            this.magFilter = 0;
        }
    }
    Fluxions.FxMaterial = FxMaterial;
})(Fluxions || (Fluxions = {}));
/// <reference path="../GTE/GTE.ts" />
var Fluxions;
(function (Fluxions) {
    class DirectionalLight {
        constructor() {
            this._direction = new Vector3(0.34816, 0.87039, 0.34816);
            this._center = new Vector3();
            this._eye = new Vector3();
            this._distance = 5.0;
            this._zfar = 100.0;
            this._znear = 1.0;
            this._E0 = new Vector3(100000, 100000, 100000);
            this._transform = Matrix4.makeIdentity();
            this._isOrbit = false;
            this._zoom = 1.0;
            this._offset = new Vector2(0.0, 0.0);
        }
        set distance(d) {
            this._distance = d;
            this._znear = -d + 1.0;
            this._zfar = d + 1.0;
        }
        set direction(v) {
            this._direction = v.norm();
            this._eye = this._center.add(this._direction.mul(this._distance));
            this._isOrbit = false;
        }
        get direction() {
            if (this._isOrbit) {
                let v1 = new Vector4(0.0, 0.0, 0.0, 1.0);
                let v1p = this._transform.transform(v1).toVector3();
                return this._transform.asInverse().row3(3);
                let v2 = new Vector4(1.0, 0.0, 0.0, 1.0);
                let v2p = this._transform.transform(v2).toVector3();
                return v2p.sub(v1p);
            }
            return this._direction.clone();
        }
        set center(location) {
            this._center = location.clone();
            this._eye = this._center.add(this._direction.mul(this._distance));
        }
        set E0(color) {
            this._E0.copy(color);
        }
        get E0() {
            return this._E0.clone();
        }
        setOrbit(azimuthInDegrees, pitchInDegrees, distance) {
            this._transform.loadIdentity();
            this._transform.rotate(azimuthInDegrees, 0.0, 1.0, 0.0);
            this._transform.rotate(pitchInDegrees, 1.0, 0.0, 0.0);
            this._transform.translate(0.0, 0.0, -distance);
            this._isOrbit = true;
            return this._transform.clone();
        }
        get lightMatrix() {
            if (this._isOrbit == true)
                return this._transform.clone();
            return Matrix4.makeLookAt2(this._direction.mul(this._distance), new Vector3(0.0), new Vector3(0.0, 1.0, 0.0));
            this._eye = this._center.add(this._direction.mul(this._distance));
            return Matrix4.makeLookAt(this._eye, this._center, new Vector3(0.0, 1.0, 0.0));
        }
        get projectionMatrix() {
            let size = this._distance;
            // this._znear = -50.0;
            // this._zfar = 50.0;
            //return Matrix4.makePerspectiveX(90.0, 1.0, 0.1, 100.0);
            return Matrix4.makeOrtho(-size, size, -size, size, -size * 2, size * 2);
            // return Matrix4.makeOrtho(
            //     this._zoom * (-size + this._offset.x), this._zoom * (size + this._offset.x),
            //     this._zoom * (-size + this._offset.y), this._zoom * (size + this._offset.y),
            //     this._znear, this._zfar);
        }
    }
    Fluxions.DirectionalLight = DirectionalLight;
})(Fluxions || (Fluxions = {}));
class FxTextParser {
    constructor(data) {
        this.lines = [];
        // split using regex any sequence of 1 or more newlines or carriage returns
        let lines = data.split(/[\n\r]+/);
        for (let line of lines) {
            let unfilteredTokens = line.split(/\s+/);
            if (unfilteredTokens.length > 0 && unfilteredTokens[0][0] == '#')
                continue;
            let tokens = [];
            for (let t of unfilteredTokens) {
                if (t.length > 0) {
                    tokens.push(t);
                }
            }
            if (tokens.length == 0) {
                continue;
            }
            this.lines.push(tokens);
        }
    }
    static MakeIdentifier(token) {
        if (token.length == 0)
            return "unknown";
        return token.replace(/[^\w]+/, "_");
    }
    static ParseIdentifier(tokens) {
        if (tokens.length >= 2)
            return tokens[1].replace(/[^\w]+/, "_");
        return "unknown";
    }
    static ParseVector(tokens) {
        let x = (tokens.length >= 2) ? parseFloat(tokens[1]) : 0.0;
        let y = (tokens.length >= 3) ? parseFloat(tokens[2]) : 0.0;
        let z = (tokens.length >= 4) ? parseFloat(tokens[3]) : 0.0;
        return new Vector3(x, y, z);
    }
    static ParseVector4(tokens) {
        let x = (tokens.length >= 2) ? parseFloat(tokens[1]) : 0.0;
        let y = (tokens.length >= 3) ? parseFloat(tokens[2]) : 0.0;
        let z = (tokens.length >= 4) ? parseFloat(tokens[3]) : 0.0;
        let w = (tokens.length >= 5) ? parseFloat(tokens[4]) : 0.0;
        return new Vector4(x, y, z, w);
    }
    static ParseMatrix(tokens) {
        if (tokens.length > 16 && tokens[0] == "transform") {
            let m = new Matrix4(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]), parseFloat(tokens[4]), parseFloat(tokens[5]), parseFloat(tokens[6]), parseFloat(tokens[7]), parseFloat(tokens[8]), parseFloat(tokens[9]), parseFloat(tokens[10]), parseFloat(tokens[11]), parseFloat(tokens[12]), parseFloat(tokens[13]), parseFloat(tokens[14]), parseFloat(tokens[15]), parseFloat(tokens[16])).asTranspose();
            return m;
        }
        return Matrix4.makeZero();
    }
    static ParseFaceIndices(_token) {
        // index 0 is position
        // index 1 is texcoord
        // index 2 is normal
        let indices = [-1, -1, -1];
        let token = _token.replace("//", "/0/");
        let tokens = token.split("/");
        if (tokens.length >= 1) {
            let index = parseInt(tokens[0]);
            indices[0] = index < 0 ? index : index - 1;
        }
        if (tokens.length == 2) {
            let index = parseInt(tokens[1]);
            indices[2] = index < 0 ? index : index - 1;
        }
        else if (tokens.length == 3) {
            let index = parseInt(tokens[1]);
            indices[1] = index < 0 ? index : index - 1;
            index = parseInt(tokens[2]);
            indices[2] = index < 0 ? index : index - 1;
        }
        return indices;
    }
    static ParseFace(tokens) {
        let indices = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (tokens.length < 4) {
            return indices;
        }
        let v1 = FxTextParser.ParseFaceIndices(tokens[1]);
        let v2 = FxTextParser.ParseFaceIndices(tokens[2]);
        let v3 = FxTextParser.ParseFaceIndices(tokens[3]);
        if (tokens.length >= 5) {
            let v4 = FxTextParser.ParseFaceIndices(tokens[4]);
            return [...v1, ...v2, ...v3, ...v4];
        }
        return [...v1, ...v2, ...v3];
    }
}
/// <reference path="Fluxions.ts" />
var Fluxions;
(function (Fluxions) {
    class FxScenegraphNode {
        constructor(name = "unknown", sceneName = "default", parent = "") {
            this.name = name;
            this.sceneName = sceneName;
            this.parent = parent;
            this.geometryGroup = "";
            this.transform_ = Matrix4.makeIdentity();
            this.pretransform_ = Matrix4.makeIdentity();
            this.posttransform_ = Matrix4.makeIdentity();
        }
        set worldMatrix(m) {
            this.pretransform_.loadIdentity();
            this.transform_.copy(m);
            this.posttransform_.loadIdentity();
        }
        get worldMatrix() { return Matrix4.multiply3(this.pretransform_, this.transform_, this.posttransform_); }
        get pretransform() { return this.pretransform_; }
        get posttransform() { return this.posttransform_; }
        get transform() { return this.transform_; }
    }
    Fluxions.FxScenegraphNode = FxScenegraphNode;
})(Fluxions || (Fluxions = {}));
/// <reference path="../XOR/XorUtils.ts" />
/// <reference path="Fluxions.ts" />
/// <reference path="FxFBO.ts" />
/// <reference path="FxCamera.ts" />
/// <reference path="FxTexture.ts" />
/// <reference path="FxMaterial.ts" />
/// <reference path="FxDirectionalLight.ts" />
/// <reference path="FxTextParser.ts" />
/// <reference path="FxIndexedGeometryMesh.ts" />
/// <reference path="FxScenegraphNode.ts" />
var Fluxions;
(function (Fluxions) {
    let FxSGAssetType;
    (function (FxSGAssetType) {
        FxSGAssetType[FxSGAssetType["Scene"] = 0] = "Scene";
        FxSGAssetType[FxSGAssetType["GeometryGroup"] = 1] = "GeometryGroup";
        FxSGAssetType[FxSGAssetType["MaterialLibrary"] = 2] = "MaterialLibrary";
        FxSGAssetType[FxSGAssetType["ShaderProgram"] = 3] = "ShaderProgram";
        FxSGAssetType[FxSGAssetType["Image"] = 4] = "Image";
        FxSGAssetType[FxSGAssetType["Text"] = 5] = "Text";
    })(FxSGAssetType = Fluxions.FxSGAssetType || (Fluxions.FxSGAssetType = {}));
    ;
    class FxScenegraph {
        constructor(fx) {
            this.fx = fx;
            // private shaderSrcFiles: XOR.ShaderLoader[] = [];
            // private _defaultFBO: FBO | null;
            this._scenegraphs = new Map();
            // private _renderConfigs: Map<string, FxRenderConfig> = new Map<string, FxRenderConfig>();
            this._materials = new Map();
            this._sceneResources = new Map();
            this._nodes = [];
            this._meshes = new Map();
            this._tempNode = new Fluxions.FxScenegraphNode("", "");
            this.textFiles = new Map();
            this.camera = new Fluxions.FxCamera();
            this.sunlight = new Fluxions.DirectionalLight();
            this.currentrc = null;
            this.currentmtllib = "";
            this.currentmtl = "";
            this.currentobj = "";
            this.currentscn = "";
            this._defaultRenderConfig = new Fluxions.FxRenderConfig(this.fx);
            this._defaultRenderConfig.compile(`attribute vec4 aPosition;
             void main() {
                 gl_Position = aPosition;
            }`, `void main() {
                gl_FragColor = vec4(0.4, 0.3, 0.2, 1.0);
            }`);
            const width = this.fx.width;
            const height = this.fx.height;
            // this._defaultFBO = new FBO(this.fx, true, true, 1024, 1024, 0, true);
            // this._fbo.set("sunshadow", new FBO(this.fx, true, true, 512, 512, 0));
            // this._fbo.set("gbuffer", new FBO(this.fx, true, true, width, height, 1, true));
            // this._fbo.set("image", new FBO(this.fx, true, true, width, height, 1, true));
            let gl = this.fx.gl;
            this._deferredMesh = new Fluxions.FxIndexedGeometryMesh(this.fx);
            this._deferredMesh.texcoord3(Vector3.make(0.0, 0.0, 0.0));
            this._deferredMesh.vertex3(Vector3.make(-1.0, -1.0, 0.0));
            this._deferredMesh.texcoord3(Vector3.make(1.0, 0.0, 0.0));
            this._deferredMesh.vertex3(Vector3.make(1.0, -1.0, 0.0));
            this._deferredMesh.texcoord3(Vector3.make(1.0, 1.0, 0.0));
            this._deferredMesh.vertex3(Vector3.make(1.0, 1.0, 0.0));
            this._deferredMesh.texcoord3(Vector3.make(0.0, 1.0, 0.0));
            this._deferredMesh.vertex3(Vector3.make(-1.0, 1.0, 0.0));
            this._deferredMesh.mtllib("Floor10x10_mtl");
            this._deferredMesh.usemtl("ConcreteFloor");
            this._deferredMesh.begin(gl.TRIANGLES);
            this._deferredMesh.addIndex(0);
            this._deferredMesh.addIndex(1);
            this._deferredMesh.addIndex(2);
            this._deferredMesh.addIndex(0);
            this._deferredMesh.addIndex(2);
            this._deferredMesh.addIndex(3);
        }
        // get shadowFBO(): FBO { return this.getFBO("sunshadow"); }
        // get gbufferFBO(): FBO { return this.getFBO("gbuffer") }
        // get imageFBO(): FBO { return this.getFBO("image"); }
        get width() { return this.fx.width; }
        get height() { return this.fx.height; }
        get aspectRatio() { return this.width / this.height; }
        get loaded() {
            if (!this.fx.xor.textfiles.loaded) {
                return false;
            }
            if (!this.fx.textures.loaded) {
                return false;
            }
            if (!this.fx.renderconfigs.loaded) {
                return false;
            }
            return true;
        }
        get failed() {
            if (this.fx.xor.textfiles.failed) {
                return true;
            }
            if (this.fx.textures.failed) {
                return true;
            }
            if (this.fx.renderconfigs.failed) {
                return true;
            }
            return false;
        }
        get percentLoaded() {
            return 0.33 * (this.fx.renderconfigs.percentLoaded + this.fx.textures.percentLoaded + this.fx.xor.textfiles.percentLoaded);
        }
        load(url) {
            let fx = this.fx;
            let name = XOR.GetURLResource(url);
            let self = this;
            let assetType;
            let ext = XOR.GetExtension(name);
            let path = XOR.GetURLPath(url);
            if (ext == "scn")
                assetType = FxSGAssetType.Scene;
            else if (ext == "obj")
                assetType = FxSGAssetType.GeometryGroup;
            else if (ext == "mtl")
                assetType = FxSGAssetType.MaterialLibrary;
            else if (ext == "png")
                assetType = FxSGAssetType.Image;
            else if (ext == "jpg")
                assetType = FxSGAssetType.Image;
            else if (ext == "txt")
                assetType = FxSGAssetType.Text;
            else
                return;
            if (this.wasRequested(name))
                return;
            if (assetType == FxSGAssetType.Image) {
                fx.textures.load(name, url);
            }
            else {
                if (assetType == FxSGAssetType.Scene) {
                    this._scenegraphs.set(name, false);
                }
                fx.xor.textfiles.load(name, url, (data, name, assetType) => {
                    self.processTextFile(data, name, path, assetType);
                    hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + name);
                }, assetType);
            }
            hflog.debug("MyScenegraph::Load() => Requesting " + url);
        }
        isSceneGraph(name) {
            let status = this._scenegraphs.get(name);
            if (status)
                return true;
            return false;
        }
        wasRequested(name) {
            if (this.fx.xor.textfiles.wasRequested(name)) {
                return true;
            }
            if (this.fx.textures.wasRequested(name)) {
                return true;
            }
            return false;
        }
        areMeshes(names) {
            for (let name of names) {
                if (!this._meshes.has(name))
                    return false;
            }
            return true;
        }
        getMaterial(mtllib, mtl) {
            let material = this._materials.get(mtllib + mtl) || null;
            return material;
        }
        usemtl(mtllib, mtl) {
            let gl = this.fx.gl;
            if (!this.currentrc)
                return;
            let rc = this.currentrc;
            let m = this.getMaterial(mtllib, mtl);
            if (m) {
                let tnames = ["MapKd", "MapKs", "MapNormal", "MapTf"];
                let textures = [m.MapKd, m.MapKs, m.MapNormal, m.MapTf];
                for (let i = 0; i < textures.length; i++) {
                    if (textures[i].length == 0)
                        continue;
                    let loc = rc.getUniformLocation(tnames[i]);
                    if (loc) {
                        this.useTexture(textures[i], i);
                        rc.uniform1i(tnames[i], i);
                    }
                }
                let v1fnames = [
                    "MapKdMix",
                    "MapKsix",
                    "MapNormalMix",
                    "MapTfMix",
                    "PBKdm",
                    "PBKsm",
                    "PBn2",
                    "PBk2",
                    "SpecularRoughness",
                    "DiffuseRoughness",
                    "Ns",
                    "Ni",
                    "Dissolve"
                ];
                let v1fvalues = [
                    m.MapKdMix,
                    m.MapKsMix,
                    m.MapNormalMix,
                    m.MapTfMix,
                    m.DiffuseRoughness,
                    m.SpecularRoughness,
                    m.PBn2,
                    m.PBk2,
                    m.SpecularRoughness,
                    m.DiffuseRoughness,
                    m.Ns,
                    m.Ni,
                    m.Dissolve
                ];
                for (let i = 0; i < v1fnames.length; i++) {
                    let uloc = rc.getUniformLocation(v1fnames[i]);
                    if (uloc) {
                        rc.uniform1f(v1fnames[i], v1fvalues[i]);
                    }
                }
                let v3fnames = ["Kd", "Ks", "Ka", "Tf"];
                let v3fvalues = [m.Kd, m.Ks, m.Ka, m.Tf];
                for (let i = 0; i < v3fnames.length; i++) {
                    let uloc = rc.getUniformLocation(v3fnames[i]);
                    if (uloc) {
                        rc.uniform3f(v3fnames[i], v3fvalues[i]);
                    }
                }
            }
        }
        RenderMesh(name, rc) {
            if (name.length == 0) {
                for (let mesh of this._meshes) {
                    mesh["1"].render(rc, this);
                }
                return;
            }
            let mesh = this._meshes.get(name);
            if (mesh) {
                mesh.render(rc, this);
            }
        }
        useTexture(textureName, unit, enable = true) {
            let texunit = unit | 0;
            let gl = this.fx.gl;
            let result = false;
            let minFilter = gl.LINEAR_MIPMAP_LINEAR;
            let magFilter = gl.LINEAR;
            if (unit <= 31) {
                unit += gl.TEXTURE0;
            }
            gl.activeTexture(unit);
            let t = this.fx.textures.get(textureName);
            if (!t) {
                let alias = this._sceneResources.get(textureName);
                if (alias) {
                    t = this.fx.textures.get(alias);
                }
            }
            if (t) {
                if (unit <= 31) {
                    unit += gl.TEXTURE0;
                }
                gl.activeTexture(unit);
                if (enable) {
                    gl.bindTexture(t.target, t.texture);
                    gl.texParameteri(t.target, gl.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(t.target, gl.TEXTURE_MAG_FILTER, magFilter);
                    result = true;
                }
                else {
                    gl.bindTexture(t.target, null);
                }
            }
            if (!t) {
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }
            gl.activeTexture(gl.TEXTURE0);
            return result;
        }
        GetNode(sceneName, objectName) {
            for (let node of this._nodes) {
                if (sceneName.length > 0 && node.sceneName != sceneName) {
                    continue;
                }
                if (node.name.length > 0 && node.name == objectName) {
                    return node;
                }
            }
            return null;
        }
        GetChildren(parentName) {
            let children = [];
            for (let node of this._nodes) {
                if (node.parent == parentName)
                    children.push(node);
            }
            return children;
        }
        UpdateChildTransforms(parentName = "") {
            let nodeWorldMatrix;
            let children = [];
            if (parentName.length == 0) {
                nodeWorldMatrix = Matrix4.makeIdentity();
                children = this._nodes;
            }
            else {
                let node = this.GetNode("", parentName);
                if (!node)
                    return;
                nodeWorldMatrix = node.worldMatrix;
                children = this.GetChildren(parentName);
            }
            for (let child of children) {
                child.pretransform.copy(nodeWorldMatrix);
                this.UpdateChildTransforms(child.name);
            }
        }
        AddNode(sceneName, objectName, parentNode = "") {
            let sn = this.GetNode(sceneName, objectName);
            if (!sn) {
                sn = new Fluxions.FxScenegraphNode(objectName, sceneName);
                this._nodes.push(sn);
            }
            return sn;
        }
        RemoveNode(sceneName, objectName) {
            let i = 0;
            for (let node of this._nodes) {
                if (sceneName.length > 0 && node.sceneName != sceneName) {
                    continue;
                }
                if (node.name.length > 0 && node.name == objectName) {
                    this._nodes.splice(i, 1);
                    return true;
                }
                i++;
            }
            return false;
        }
        GetMesh(meshName) {
            let mesh = this._meshes.get(meshName);
            if (!mesh) {
                mesh = new Fluxions.FxIndexedGeometryMesh(this.fx);
                this._meshes.set(meshName, mesh);
            }
            return mesh;
        }
        SetGlobalParameters(rc) {
            if (rc) {
                rc.use();
                rc.uniform1f("uWindowWidth", this.width);
                rc.uniform1f("uWindowHeight", this.height);
                rc.uniform1f("uWindowCenterX", this.width * 0.5);
                rc.uniform1f("uWindowCenterY", this.height * 0.5);
                rc.uniform3f("SunDirTo", this.sunlight.direction);
                rc.uniform3f("SunE0", this.sunlight.E0);
                this.camera.aspectRatio = this.aspectRatio;
                rc.uniformMatrix4f("ProjectionMatrix", this.camera.projection);
                rc.uniformMatrix4f("CameraMatrix", this.camera.transform);
                rc.uniform3f("CameraPosition", this.camera.eye);
                this.useTexture("enviroCube", 10);
                rc.uniform1i("EnviroCube", 10);
                // TODO: Make This Part of a Light Data Structure
                if (!rc.writesToFBO) {
                    rc.uniformMatrix4f("SunShadowBiasMatrix", Matrix4.makeShadowBias());
                    rc.uniformMatrix4f("SunShadowProjectionMatrix", this.sunlight.projectionMatrix);
                    rc.uniformMatrix4f("SunShadowViewMatrix", this.sunlight.lightMatrix);
                }
                this.fx.fbos.configure(rc);
            }
            let gl = this.fx.gl;
            gl.viewport(0, 0, this.width, this.height);
        }
        RenderScene(renderConfigName, sceneName = "") {
            let rc = this.fx.renderconfigs.use(renderConfigName);
            if (!rc || !rc.usable) {
                //hflog.error("MyScenegraph::RenderScene(): \"" + shaderName + "\" is not a render config");
                return;
            }
            for (let node of this._nodes) {
                if (sceneName.length > 0 && node.sceneName != sceneName) {
                    continue;
                }
                rc.uniformMatrix4f("WorldMatrix", node.worldMatrix);
                let mesh = this._meshes.get(node.geometryGroup);
                if (mesh) {
                    if (rc.renderEdges) {
                        mesh.renderEdges(rc);
                    }
                    else {
                        mesh.render(rc, this);
                    }
                }
            }
            rc.restore();
        }
        RenderDeferred(renderConfigName) {
            let rc = this.fx.renderconfigs.use(renderConfigName);
            if (!rc || !rc.usable) {
                //hflog.error("MyScenegraph::RenderDeferred(): \"" + shaderName + "\" is not a render config");
                return;
            }
            let gl = this.fx.gl;
            gl.disable(gl.DEPTH_TEST);
            rc.uniformMatrix4f("ProjectionMatrix", Matrix4.makeOrtho2D(-1.0, 1.0, -1.0, 1.0));
            rc.uniformMatrix4f("CameraMatrix", Matrix4.makeLookAt(Vector3.make(0.0, 0.0, 1.0), Vector3.make(0.0, 0.0, 0.0), Vector3.make(0.0, 1.0, 0.0)));
            rc.uniformMatrix4f("WorldMatrix", Matrix4.makeTranslation(0.0, 0.0, 0.0));
            this._deferredMesh.render(rc, this);
            rc.restore();
        }
        processTextFile(data, name, path, assetType) {
            let textParser = new FxTextParser(data);
            switch (assetType) {
                // ".SCN"
                case FxSGAssetType.Scene:
                    this.loadScene(textParser.lines, name, path);
                    break;
                // ".OBJ"
                case FxSGAssetType.GeometryGroup:
                    this.loadOBJ(textParser.lines, name, path);
                    break;
                // ".MTL"
                case FxSGAssetType.MaterialLibrary:
                    this.loadMTL(textParser.lines, name, path);
                    break;
                case FxSGAssetType.Text:
                    this.textFiles.set(name, textParser.lines);
                    break;
            }
        }
        loadScene(lines, name, path) {
            // sundir <direction: Vector3>
            // camera <eye: Vector3> <center: Vector3> <up: Vector3>
            // transform <worldMatrix: Matrix4>
            // geometryGroup <objUrl: string>
            for (let tokens of lines) {
                if (tokens[0] == "enviroCube") {
                    this._sceneResources.set("enviroCube", XOR.GetURLResource(tokens[1]));
                    this.load(path + tokens[1]);
                }
                else if (tokens[0] == "transform") {
                    this._tempNode.transform.loadMatrix(FxTextParser.ParseMatrix(tokens));
                }
                else if (tokens[0] == "loadIdentity") {
                    this._tempNode.transform.loadIdentity();
                }
                else if (tokens[0] == "translate") {
                    let t = FxTextParser.ParseVector(tokens);
                    this._tempNode.transform.translate(t.x, t.y, t.z);
                }
                else if (tokens[0] == "rotate") {
                    let values = FxTextParser.ParseVector4(tokens);
                    this._tempNode.transform.rotate(values.x, values.y, values.z, values.w);
                }
                else if (tokens[0] == "scale") {
                    let values = FxTextParser.ParseVector4(tokens);
                    this._tempNode.transform.scale(values.x, values.y, values.z);
                }
                else if (tokens[0] == "geometryGroup") {
                    // geometryGroup filename
                    // geometryGroup name filename
                    // geometryGroup name parentNode filename
                    let parentName = "";
                    let filename = (tokens.length >= 2) ? tokens[tokens.length - 1] : "nothing.obj";
                    let nodeName = (tokens.length >= 3) ? tokens[1] : filename;
                    if (tokens.length >= 4) {
                        parentName = tokens[2];
                    }
                    this._tempNode.sceneName = name;
                    this._tempNode.parent = parentName;
                    this._tempNode.name = nodeName;
                    this._tempNode.geometryGroup = filename;
                    if (!this.wasRequested(filename)) {
                        hflog.log("loading geometry group [parent = " + parentName + "]" + path + filename);
                        this.load(path + filename);
                    }
                    this._nodes.push(this._tempNode);
                    this._tempNode = new Fluxions.FxScenegraphNode();
                }
                else if (tokens[0] == "node") {
                    // node name
                    // node name parentNode
                    let nodeName = (tokens.length >= 2) ? tokens[1] : "";
                    let parentName = (tokens.length >= 3) ? tokens[2] : "";
                    this._tempNode.name = nodeName;
                    this._tempNode.parent = parentName;
                    this._tempNode.sceneName = name;
                    this._tempNode.geometryGroup = "";
                    this._nodes.push(this._tempNode);
                    this._tempNode = new Fluxions.FxScenegraphNode();
                }
                else if (tokens[0] == "renderconfig") {
                    let name = tokens[1];
                    let vertShaderUrl = tokens[2];
                    let fragShaderUrl = tokens[3];
                    this.fx.renderconfigs.load(name, vertShaderUrl, fragShaderUrl);
                }
            }
            this._scenegraphs.set(name, true);
        }
        loadOBJ(lines, name, path) {
            let mesh = new Fluxions.FxIndexedGeometryMesh(this.fx);
            mesh.loadOBJ(lines, this, path);
            mesh.build();
            this._meshes.set(name, mesh);
        }
        loadMTL(lines, name, path) {
            // newmtl <name: string>
            // Kd <color: Vector3>
            // Ks <color: Vector3>
            // map_Kd <url: string>
            // map_Ks <url: string>
            // map_normal <url: string>
            let mtl = "";
            let mtllib = FxTextParser.MakeIdentifier(name);
            let curmtl;
            for (let tokens of lines) {
                if (tokens.length >= 2) {
                    if (tokens[0] == "newmtl") {
                        mtl = FxTextParser.MakeIdentifier(tokens[1]);
                        curmtl = new Fluxions.FxMaterial(mtl);
                        this._materials.set(mtllib + mtl, curmtl);
                    }
                    if (!curmtl)
                        continue;
                    if (tokens[0] == "map_Kd") {
                        curmtl.MapKd = XOR.GetURLResource(tokens[1]);
                        curmtl.MapKdMix = 1.0;
                        this.load(path + tokens[1]);
                    }
                    else if (tokens[0] == "map_Ks") {
                        curmtl.MapKs = XOR.GetURLResource(tokens[1]);
                        curmtl.MapKsMix = 1.0;
                        this.load(path + tokens[1]);
                    }
                    else if (tokens[0] == "map_normal") {
                        curmtl.MapNormal = XOR.GetURLResource(tokens[1]);
                        curmtl.MapNormalMix = 1.0;
                        this.load(path + tokens[1]);
                    }
                    else if (tokens[0] == "Kd") {
                        curmtl.Kd = FxTextParser.ParseVector(tokens);
                    }
                    else if (tokens[0] == "Ks") {
                        curmtl.Ks = FxTextParser.ParseVector(tokens);
                    }
                    else if (tokens[0] == "Ka") {
                        curmtl.Ka = FxTextParser.ParseVector(tokens);
                    }
                    else if (tokens[0] == "PBKdm" || tokens[0] == "DiffuseRoughness") {
                        curmtl.DiffuseRoughness = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "PBKsm" || tokens[0] == "SpecularRoughness") {
                        curmtl.SpecularRoughness = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "Ns") {
                        curmtl.SpecularRoughness = Math.sqrt(2.0 / (2.0 + parseFloat(tokens[1])));
                    }
                    else if (tokens[0] == "PBn2" || tokens[0] == "Ni") {
                        curmtl.PBn2 = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "PBk2" || tokens[0] == "Nk") {
                        curmtl.PBk2 = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "MapKdMix") {
                        curmtl.MapKdMix = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "MapKsMix") {
                        curmtl.MapKsMix = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "MapNormalMix") {
                        curmtl.MapNormalMix = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "d") {
                        curmtl.Dissolve = parseFloat(tokens[1]);
                    }
                    else if (tokens[0] == "Tf") {
                        curmtl.Tf = FxTextParser.ParseVector(tokens);
                    }
                }
            }
        }
    } // class Scenegraph
    Fluxions.FxScenegraph = FxScenegraph;
})(Fluxions || (Fluxions = {})); // namespace Fluxions
/// <reference path="../XOR/LibXOR.ts" />
/// <reference path="FxScenegraph.ts" />
/// <reference path="FxRenderingContext.ts" />
/// <reference path="FxRenderConfig.ts" />
/// <reference path="FxIndexedGeometryMesh.ts" />
class FxVertex {
    constructor(position = new Vector3(0, 0, 0), normal = new Vector3(0, 0, 1), color = new Vector3(1, 1, 1), texcoord = new Vector3(0, 0, 0)) {
        this.position = position;
        this.normal = normal;
        this.color = color;
        this.texcoord = texcoord;
    }
    asFloat32Array() {
        return new Float32Array([
            this.position.x, this.position.y, this.position.z,
            this.normal.x, this.normal.y, this.normal.z,
            this.color.x, this.color.y, this.color.z,
            this.texcoord.x, this.texcoord.y, this.texcoord.z
        ]);
    }
    asArray() {
        return [
            this.position.x, this.position.y, this.position.z,
            this.normal.x, this.normal.y, this.normal.z,
            this.color.x, this.color.y, this.color.z,
            this.texcoord.x, this.texcoord.y, this.texcoord.z
        ];
    }
}
;
class FxSurface {
    constructor(mode, offset, mtllib, mtl, worldMatrix) {
        this.mode = mode;
        this.offset = offset;
        this.mtllib = mtllib;
        this.mtl = mtl;
        this.worldMatrix = worldMatrix;
        this.count = 0;
    }
    Add() {
        this.count++;
    }
}
/// <reference path="../GTE/GTE.ts" />
var Fluxions;
(function (Fluxions) {
    class FxEdge {
        constructor() {
            this.v1 = -1;
            this.v2 = -1;
            this.leftFaceIndex = -1;
            this.rightFaceIndex = -1;
            this.leftNormal = Vector3.makeZero();
            this.rightNormal = Vector3.makeZero();
            this.N = Vector3.makeZero();
        }
        static makeIndex(v1, v2) {
            const SEPARATION = 1000000;
            if (v1 < v2)
                return (v1 + 1) * SEPARATION + (v2 + 1);
            else
                return (v2 + 1) * SEPARATION + (v1 + 1);
        }
    }
    class FxEdgeMeshFace {
        constructor() {
            this.vertices = [];
            this.centerPoint = Vector3.makeZero();
            this.normalPoint = Vector3.makeZero();
            this.N = Vector3.makeZero();
        }
    }
    class FxEdgeMesh {
        constructor() {
            this.vertices = [];
            this.edges = new Map();
            this.faces = [];
            this._ebo = null;
            this._dirty = true;
            this._edgeData = [];
            this.eboCount = 0;
        }
        get length() { return (this.edges.size + this.faces.length) * 2; }
        addVertex(v) {
            this.vertices.push(v);
        }
        calcNormal(v1, v2, v3) {
            let v1v2 = this.vertices[v2].sub(this.vertices[v1]);
            let v1v3 = this.vertices[v3].sub(this.vertices[v1]);
            let N = Vector3.cross(v1v2, v1v3);
            return N.norm();
        }
        addFace(v) {
            this._dirty = true;
            if (v.length < 3)
                return;
            let f = new FxEdgeMeshFace();
            for (let i = 0; i < v.length; i++) {
                if (v[i] < 0)
                    v[i] = this.vertices.length + v[i];
            }
            f.vertices.push(...v);
            f.N = this.calcNormal(v[0], v[1], v[2]);
            f.centerPoint = Vector3.makeZero();
            for (let v of f.vertices) {
                f.centerPoint = f.centerPoint.add(this.vertices[v]);
            }
            f.centerPoint = f.centerPoint.div(f.vertices.length);
            f.normalPoint = f.centerPoint.add(f.N.mul(0.1));
            let faceIndex = this.faces.length;
            this.faces.push(f);
            for (let i = 0; i < v.length; i++) {
                let v1 = v[i];
                let v2 = v[(i + 1) % v.length];
                this.addEdge(v1, v2, faceIndex);
            }
        }
        addEdge(v1, v2, faceIndex) {
            let isLeft = true;
            if (v1 > v2) {
                let tmp = v1;
                v1 = v2;
                v2 = tmp;
                isLeft = false;
            }
            let face = this.faces[faceIndex];
            let edgeIndex = FxEdge.makeIndex(v1, v2);
            let edge = this.edges.get(edgeIndex);
            if (!edge) {
                edge = new FxEdge();
                edge.v1 = v1;
                edge.v2 = v2;
                this.edges.set(edgeIndex, edge);
            }
            if (isLeft) {
                edge.leftFaceIndex = faceIndex;
                edge.leftNormal = face.N;
                edge.N = edge.N.add(face.N);
            }
            else {
                edge.rightFaceIndex = faceIndex;
                edge.rightNormal = face.N;
                edge.N = edge.N.add(face.N);
            }
            if (edge.leftFaceIndex >= 0 &&
                edge.rightFaceIndex >= 0) {
                edge.N.normalize();
            }
        }
        buildBuffers(gl, isStatic = true) {
            if (!this._dirty && this._ebo)
                return this._ebo;
            let self = this;
            this._edgeData = [];
            this.edges.forEach((value, index, array) => {
                let v1 = this.vertices[value.v1];
                let v2 = this.vertices[value.v2];
                let N = value.N;
                let N1 = value.leftNormal;
                let N2 = value.rightNormal;
                let v = [
                    v1.x, v1.y, v1.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                    v2.x, v2.y, v2.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                ];
                self._edgeData.push(...v);
                v = [
                    v2.x, v2.y, v2.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                    v1.x, v1.y, v1.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                ];
                self._edgeData.push(...v);
            });
            if (1)
                this.faces.forEach((value, index) => {
                    let f = value;
                    let dir = f.normalPoint.sub(f.centerPoint);
                    let v = [
                        f.centerPoint.x, f.centerPoint.y, f.centerPoint.z,
                        dir.x, dir.y, dir.z,
                        f.N.x, f.N.y, f.N.z,
                        f.N.x, f.N.y, f.N.z,
                        f.normalPoint.x, f.normalPoint.y, f.normalPoint.z,
                        dir.x, dir.y, dir.z,
                        f.N.x, f.N.y, f.N.z,
                        f.N.x, f.N.y, f.N.z,
                    ];
                    self._edgeData.push(...v);
                });
            this.eboCount = self._edgeData.length / 16;
            let eboData = new Float32Array(this._edgeData);
            let ebo = gl.createBuffer();
            if (ebo) {
                gl.bindBuffer(gl.ARRAY_BUFFER, ebo);
                gl.bufferData(gl.ARRAY_BUFFER, eboData, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            this._ebo = ebo;
            this._dirty = false;
            return this._ebo;
        }
    } // FxEdgeMesh
    Fluxions.FxEdgeMesh = FxEdgeMesh;
})(Fluxions || (Fluxions = {}));
/// <reference path="Fluxions.ts" />
/// <reference path="FxVertex.ts" />
/// <reference path="FxSurface.ts" />
/// <reference path="FxRenderConfig.ts" />
/// <reference path="FxScenegraph.ts" />
/// <reference path="FxEdgeMesh.ts" />
var Fluxions;
(function (Fluxions) {
    function docenter(x, centering) {
        if (x > 0.0) {
            if (centering < 0)
                return 0;
            if (centering == 0)
                return 0.5 * x;
            if (centering > 0)
                return x;
        }
        return 0.0;
    }
    class FxIndexedGeometryMesh {
        constructor(fx) {
            this.fx = fx;
            this.vertices = [];
            this.indices = [];
            this.surfaces = [];
            this.edgeMesh = new Fluxions.FxEdgeMesh();
            this._mtllib = "";
            this._mtl = "";
            this._vertex = new FxVertex();
            this._dirty = true;
            this._worldMatrix = Matrix4.makeIdentity();
            this._vboData = new Float32Array(0);
            this._iboData = new Uint32Array(0);
            this.aabb = new GTE.BoundingBox();
            this.rescaleBBox = null;
            this.rescaleCenter = Vector3.make();
            let gl = this.fx.gl;
            let vbo = gl.createBuffer();
            let ibo = gl.createBuffer();
            let ebo = gl.createBuffer();
            if (!vbo || !ibo || !ebo)
                throw "IndexedGeometryMesh::constructor() Unable to create buffer";
            this._vbo = vbo;
            this._ibo = ibo;
            this._ebo = ebo;
        }
        reset() {
            this.vertices = [];
            this.indices = [];
            this.surfaces = [];
            this._dirty = true;
            this._vertex = new FxVertex();
            this._mtllib = "";
            this._mtl = "";
            this._worldMatrix.loadIdentity();
            this.aabb.reset();
        }
        mtllib(mtllib) {
            this._mtllib = mtllib;
        }
        usemtl(mtl) {
            this._mtl = mtl;
        }
        rect(x1, y1, x2, y2) {
            this.begin(WebGLRenderingContext.TRIANGLE_FAN);
            this.normal(0, 0, 1);
            this.texcoord(0, 0, 0);
            this.position(x1, y1, 0);
            this.addIndex(-1);
            this.texcoord(1, 0, 0);
            this.position(x2, y1, 0);
            this.addIndex(-1);
            this.texcoord(1, 1, 0);
            this.position(x2, y2, 0);
            this.addIndex(-1);
            this.texcoord(0, 1, 0);
            this.position(x1, y2, 0);
            this.addIndex(-1);
        }
        circle(ox, oy, radius = 0.5, segments = 32) {
            this.begin(WebGLRenderingContext.TRIANGLE_FAN);
            this.normal(0, 0, 1);
            let theta = 0;
            let dtheta = GTE.radians(360.0 / segments);
            // this.texcoord(0, 0, 0);
            // this.position(ox, oy, 0);
            // this.addIndex(-1);
            for (let i = 0; i < segments; i++) {
                let x = Math.cos(theta);
                let y = Math.sin(theta);
                let u = x * 0.5 + 0.5;
                let v = y * 0.5 + 0.5;
                this.texcoord(u, v, 0);
                this.position(radius * x + ox, radius * y + oy, 0);
                this.addIndex(-1);
                theta += dtheta;
            }
        }
        strokeCircle(ox, oy, radius = 0.5, segments = 32) {
            this.begin(WebGLRenderingContext.LINE_LOOP);
            this.normal(0, 0, 1);
            let theta = 0;
            let dtheta = GTE.radians(360.0 / segments);
            // this.texcoord(0, 0, 0);
            // this.position(ox, oy, 0);
            // this.addIndex(-1);
            for (let i = 0; i < segments; i++) {
                let x = Math.cos(theta);
                let y = Math.sin(theta);
                let u = x * 0.5 + 0.5;
                let v = y * 0.5 + 0.5;
                this.texcoord(u, v, 0);
                this.position(radius * x + ox, radius * y + oy, 0);
                this.addIndex(-1);
                theta += dtheta;
            }
        }
        spiral(radius, spirality = 4.0, segments = 32) {
            this.begin(WebGLRenderingContext.LINE_STRIP);
            this.normal(0, 0, 1);
            let theta = 0;
            let dtheta = GTE.radians(spirality * 360.0 / segments);
            for (let i = 0; i < segments; i++) {
                let x = Math.cos(theta);
                let y = Math.sin(theta);
                let u = x * 0.5 + 0.5;
                let v = y * 0.5 + 0.5;
                this.texcoord(u, v, 0);
                let r = (i / segments) * radius;
                this.position(r * x, r * y, 0);
                this.addIndex(-1);
                theta += dtheta;
            }
        }
        begin(mode) {
            if (this.surfaces.length == 0) {
                // if no surfaces exist, add one
                this.surfaces.push(new FxSurface(mode, this.indices.length, this._mtllib, this._mtl, this._worldMatrix));
            }
            else if (this.currentIndexCount != 0) {
                // do not add a surface if the most recent one is empty
                this.surfaces.push(new FxSurface(mode, this.indices.length, this._mtllib, this._mtl, this._worldMatrix));
            }
            if (this.surfaces.length > 0) {
                // simply update the important details
                let s = this.surfaces[this.surfaces.length - 1];
                s.mtl = this._mtl;
                s.mtllib = this._mtllib;
                s.worldMatrix.copy(this._worldMatrix);
            }
        }
        addIndex(i) {
            if (this.surfaces.length == 0)
                return;
            if (i < 0) {
                this.indices.push((this.vertices.length / 12) + i);
            }
            else {
                this.indices.push(i);
            }
            this.surfaces[this.surfaces.length - 1].Add();
            this._dirty = true;
        }
        get currentIndexCount() {
            if (this.surfaces.length == 0)
                return 0;
            return this.surfaces[this.surfaces.length - 1].count;
        }
        normal3(n) {
            this._vertex.normal.copy(n);
        }
        normal(x, y, z) {
            this._vertex.normal.reset(x, y, z);
        }
        color3(c) {
            this._vertex.color.copy(c);
        }
        color(r, g, b) {
            this._vertex.color.reset(r, g, b);
        }
        texcoord3(t) {
            this._vertex.texcoord.copy(t);
        }
        texcoord(x, y, z) {
            this._vertex.texcoord.reset(x, y, z);
        }
        vertex3(v) {
            this.aabb.add(v);
            this._vertex.position.copy(v);
            this.vertices.push(...this._vertex.asArray());
            // this._vertex = new Vertex();
        }
        vertex(x, y, z) {
            let v = new Vector3(x, y, z);
            this.vertex3(v);
        }
        position(x, y, z) {
            let v = new Vector3(x, y, z);
            this.vertex3(v);
        }
        transform(m) {
            this._worldMatrix.copy(m);
        }
        loadIdentity() {
            this._worldMatrix.loadIdentity();
        }
        translate(x, y, z) {
            this._worldMatrix.translate(x, y, z);
        }
        rotate(angleInDegrees, x, y, z) {
            this._worldMatrix.rotate(angleInDegrees, x, y, z);
        }
        scale(x, y, z) {
            this._worldMatrix.scale(x, y, z);
        }
        // DrawTexturedRect(bottomLeft: Vector3, upperRight: Vector3,
        //     minTexCoord: Vector3, maxTexCoord: Vector3): void {
        // }
        rescale() {
            if (!this.rescaleBBox)
                return;
            if (this.rescaleBBox.sameAs(this.aabb))
                return;
            let centering = GTE.vec3(0, 0, 1);
            let bbox = new GTE.BoundingBox();
            const stride = 12;
            const numVertices = this.vertices.length / stride;
            let M = Matrix4.makeIdentity();
            let t = 1.0 / this.aabb.maxSize;
            let s = t * this.rescaleBBox.maxSize;
            let diffx = 1.0 - t * this.aabb.width;
            let diffy = 1.0 - t * this.aabb.height;
            let diffz = 1.0 - t * this.aabb.depth;
            let tx = docenter(diffx, this.rescaleCenter.x) + this.rescaleBBox.minBounds.x;
            let ty = docenter(diffy, this.rescaleCenter.y) + this.rescaleBBox.minBounds.y;
            let tz = docenter(diffz, this.rescaleCenter.z) + this.rescaleBBox.minBounds.z;
            M.translate(tx, ty, tz);
            M.scale(s, s, s);
            M.translate3(this.aabb.minBounds.negate());
            for (let i = 0; i < numVertices; i++) {
                let v = Vector3.make(this.vertices[i * stride + 0], this.vertices[i * stride + 1], this.vertices[i * stride + 2]);
                v = M.transform3(v);
                bbox.add(v);
                this.vertices[i * stride + 0] = v.x;
                this.vertices[i * stride + 1] = v.y;
                this.vertices[i * stride + 2] = v.z;
            }
            // hflog.info("diff " + diffx.toFixed(3) + ", " + diffy.toFixed(3) + ", " + diffz.toFixed(3))
            // hflog.info("aabb size: " + this.aabb.maxSize.toFixed(3) + " -- " + this.aabb.whdString());
            // hflog.info("rebb size: " + this.rescaleBBox.maxSize.toFixed(3) + " -- " + this.rescaleBBox.whdString());
            // hflog.info("rebb min: " + " -- " + this.rescaleBBox.minString());
            // hflog.info("rebb max: " + " -- " + this.rescaleBBox.maxString());
            // hflog.info("bbox size: " + bbox.maxSize.toFixed(3) + " -- " + bbox.whdString());
            // hflog.info("bbox min: " + " -- " + bbox.minString());
            // hflog.info("bbox max: " + " -- " + bbox.maxString());
            // if (!bbox.sameAs(this.rescaleBBox)) hflog.error('Bounding boxes don\'t match!');
        }
        build() {
            // Building the VBO goes here
            if (!this._dirty)
                return;
            this.rescale();
            this._vboData = new Float32Array(this.vertices);
            this._iboData = new Uint32Array(this.indices);
            let gl = this.fx.gl;
            if (!gl)
                return;
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
            gl.bufferData(gl.ARRAY_BUFFER, this._vboData, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._iboData, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            this._dirty = false;
        }
        render(rc, sg) {
            if (!rc.usable) {
                //hflog.warn("IndexedGeometryMesh Called, but render config is unusable.");
                return;
            }
            // Rendering code goes here
            this.build();
            let gl = this.fx.gl;
            if (!gl)
                return;
            let offsets = [0, 12, 24, 36];
            let locs = [
                rc.getAttribLocation("aPosition"),
                rc.getAttribLocation("aNormal"),
                rc.getAttribLocation("aColor"),
                rc.getAttribLocation("aTexcoord")
            ];
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
            for (let i = 0; i < 4; i++) {
                if (locs[i] >= 0) {
                    gl.enableVertexAttribArray(locs[i]);
                    gl.vertexAttribPointer(locs[i], 3, gl.FLOAT, false, 48, offsets[i]);
                }
            }
            for (let s of this.surfaces) {
                sg.usemtl(s.mtllib, s.mtl);
                gl.drawElements(s.mode, s.count, gl.UNSIGNED_INT, s.offset * 4);
            }
            for (let i = 0; i < 4; i++) {
                if (locs[i] >= 0) {
                    gl.disableVertexAttribArray(locs[i]);
                }
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        renderplain(rc) {
            if (!rc.usable) {
                //hflog.warn("IndexedGeometryMesh Called, but render config is unusable.");
                return;
            }
            // Rendering code goes here
            this.build();
            let gl = this.fx.gl;
            if (!gl)
                return;
            let offsets = [0, 12, 24, 36];
            let locs = [
                rc.getAttribLocation("aPosition"),
                rc.getAttribLocation("aNormal"),
                rc.getAttribLocation("aColor"),
                rc.getAttribLocation("aTexcoord")
            ];
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
            for (let i = 0; i < 4; i++) {
                if (locs[i] >= 0) {
                    gl.enableVertexAttribArray(locs[i]);
                    gl.vertexAttribPointer(locs[i], 3, gl.FLOAT, false, 48, offsets[i]);
                }
            }
            for (let s of this.surfaces) {
                gl.drawElements(s.mode, s.count, gl.UNSIGNED_INT, s.offset * 4);
            }
            for (let i = 0; i < 4; i++) {
                if (locs[i] >= 0) {
                    gl.disableVertexAttribArray(locs[i]);
                }
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        renderEdges(rc) {
            let gl = this.fx.gl;
            if (!gl)
                return;
            let ebo = this.edgeMesh.buildBuffers(gl);
            let offsets = [0, 12, 24, 36];
            let stride = 48;
            let locs = [
                rc.getAttribLocation("aPosition"),
                rc.getAttribLocation("aNormal"),
                rc.getAttribLocation("aFace1Normal"),
                rc.getAttribLocation("aFace2Normal")
            ];
            gl.bindBuffer(gl.ARRAY_BUFFER, ebo);
            for (let i = 0; i < locs.length; i++) {
                if (locs[i] >= 0) {
                    gl.enableVertexAttribArray(locs[i]);
                    gl.vertexAttribPointer(locs[i], 3, gl.FLOAT, false, 48, offsets[i]);
                }
            }
            gl.drawArrays(gl.LINES, 0, this.edgeMesh.eboCount);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            for (let i = 0; i < locs.length; i++) {
                if (locs[i] >= 0) {
                    gl.disableVertexAttribArray(locs[i]);
                }
            }
        }
        loadOBJ(lines, scenegraph = null, path = null) {
            let positions = [];
            let normals = [];
            let colors = [];
            let texcoords = [];
            // in case there are no mtllib's, usemtl's, o's, g's, or s's
            this.begin(WebGLRenderingContext.TRIANGLES);
            for (let tokens of lines) {
                if (tokens.length >= 3) {
                    if (tokens[0] == "v") {
                        let position = FxTextParser.ParseVector(tokens);
                        positions.push(position);
                        this.edgeMesh.addVertex(position);
                    }
                    else if (tokens[0] == "vn") {
                        normals.push(FxTextParser.ParseVector(tokens));
                    }
                    else if (tokens[0] == "vt") {
                        texcoords.push(FxTextParser.ParseVector(tokens));
                    }
                    else if (tokens[0] == "vc") {
                        let color = FxTextParser.ParseVector(tokens);
                        colors.push(color);
                        this.color(color.x, color.y, color.z);
                    }
                    else if (tokens[0] == "f") {
                        let indices = FxTextParser.ParseFace(tokens);
                        let edgeIndices = [];
                        let ncount = normals.length;
                        let tcount = texcoords.length;
                        let pcount = positions.length;
                        let vcount = indices.length / 3;
                        for (let j = 0; j < vcount; j++) {
                            let p = indices[j * 3 + 0];
                            if (p < 0)
                                indices[j * 3] = pcount + p;
                        }
                        for (let j = 1; j < vcount - 1; j++) {
                            let N;
                            try {
                                let p1 = indices[0];
                                let p2 = indices[j * 3];
                                let p3 = indices[(j + 1) * 3];
                                let sidea = positions[p2].sub(positions[p1]);
                                let sideb = positions[p3].sub(positions[p1]);
                                N = Vector3.cross(sidea, sideb).normalize();
                            }
                            catch (e) {
                                hflog.error("something bad happen");
                                break;
                            }
                            for (let k = 0; k < 3; k++) {
                                let i = (k == 0) ? 0 : j + k - 1;
                                let n = indices[i * 3 + 2];
                                if (n >= 0 && n < ncount)
                                    this.normal3(normals[n]);
                                else
                                    this.normal3(N);
                                let t = indices[i * 3 + 1];
                                if (t >= 0 && t < tcount)
                                    this.texcoord3(texcoords[t]);
                                else
                                    this.texcoord3(Vector3.makeZero());
                                let p = indices[i * 3 + 0];
                                if (p >= 0 && p < pcount)
                                    this.vertex3(positions[p]);
                                this.addIndex(-1);
                                edgeIndices.push(indices[i * 3]);
                            }
                        }
                        this.edgeMesh.addFace(edgeIndices);
                    }
                }
                else if (tokens.length >= 2) {
                    if (tokens[0] == "mtllib") {
                        if (scenegraph && path)
                            scenegraph.load(path + tokens[1]);
                        this.mtllib(FxTextParser.ParseIdentifier(tokens));
                        this.begin(WebGLRenderingContext.TRIANGLES);
                    }
                    else if (tokens[0] == "usemtl") {
                        this.usemtl(FxTextParser.ParseIdentifier(tokens));
                        this.begin(WebGLRenderingContext.TRIANGLES);
                    }
                    else if (tokens[0] == "o") {
                        this.begin(WebGLRenderingContext.TRIANGLES);
                    }
                    else if (tokens[0] == "g") {
                        this.begin(WebGLRenderingContext.TRIANGLES);
                    }
                    else if (tokens[0] == "s") {
                        this.begin(WebGLRenderingContext.TRIANGLES);
                    }
                }
            }
            this.build();
        }
    }
    Fluxions.FxIndexedGeometryMesh = FxIndexedGeometryMesh;
})(Fluxions || (Fluxions = {}));
/// <reference path="LibXOR.ts" />
/// <reference path="../Fluxions/FxIndexedGeometryMesh.ts"/>
var XOR;
(function (XOR) {
    class MeshSystem {
        constructor(xor) {
            this.xor = xor;
            this.meshes = new Map();
        }
        create(name) {
            if (!this.xor.fx)
                throw "Fluxions is not initialized";
            let mesh = new Fluxions.FxIndexedGeometryMesh(this.xor.fx);
            this.meshes.set(name, mesh);
            return mesh;
        }
        /**
         *
         * @param {string} name name of the object
         * @param {string} url location of the OBJ file
         * @returns {FxIndexedGeometryMesh}
         */
        load(name, url, rescaleBBox = null, rescaleCenter) {
            if (!this.xor.fx)
                throw "Fluxions is not initialized";
            let mesh = new Fluxions.FxIndexedGeometryMesh(this.xor.fx);
            mesh.rescaleBBox = rescaleBBox;
            if (rescaleCenter)
                mesh.rescaleCenter.copy(rescaleCenter);
            this.meshes.set(name, mesh);
            // let tl = new XOR.TextFileLoader(url, (data: string, name: string, p: number) => {
            //     let textParser = new FxTextParser(data);
            //     mesh.loadOBJ(textParser.lines);
            // });
            this.xor.textfiles.load(name, url, (data, name, p) => {
                let textParser = new FxTextParser(data);
                mesh.loadOBJ(textParser.lines);
            }, 0);
            return mesh;
        }
        render(name, rc) {
            if (!this.xor.fx)
                throw "Fluxions is not initialized";
            if (!name) {
                return null;
            }
            else if (this.meshes.has(name)) {
                let mesh = this.meshes.get(name);
                if (mesh) {
                    mesh.renderplain(rc);
                    return mesh;
                }
            }
            return null;
        }
    }
    XOR.MeshSystem = MeshSystem;
})(XOR || (XOR = {}));
/// <reference path="XorUtils.ts" />
var XOR;
(function (XOR) {
    class TextFileLoaderSystem {
        constructor() {
            this.textfiles = [];
        }
        get failed() {
            for (let t of this.textfiles) {
                if (t.failed)
                    return true;
            }
            return false;
        }
        get loaded() {
            for (let t of this.textfiles) {
                if (!t.loaded)
                    return false;
            }
            return true;
        }
        get percentLoaded() {
            let a = 0;
            for (let t of this.textfiles) {
                if (t.loaded)
                    a++;
            }
            return a / this.textfiles.length;
        }
        wasRequested(name) {
            for (let tf of this.textfiles) {
                if (tf.name == name)
                    return true;
            }
            return false;
        }
        load(name, url, callbackfn, data) {
            this.textfiles.push(new XOR.TextFileLoader(url, callbackfn, data));
        }
    }
    XOR.TextFileLoaderSystem = TextFileLoaderSystem;
})(XOR || (XOR = {}));
/// <reference path="LibXOR.ts" />
var XOR;
(function (XOR) {
    class Trigger {
        /**
         * TriggerTool(resetTime)
         * @param {number} resetTime How often the timer should be allowed to trigger
         */
        constructor(resetTime = 0) {
            this.resetTime = resetTime;
            this.triggerTime = 0;
            this.triggered_ = false;
            this.resetTime = resetTime || 0;
            this.triggerTime = 0;
            this.triggered_ = false;
        }
        /**
         * triggered() returns 1 if trigger went off and resets it
         */
        get triggered() { let t = this.triggered_; this.triggered_ = false; return t; }
        /**
         * wait(t1) sets the new trigger time. It does not reset the trigger
         * @param {number} t1 Sets the new trigger time
         */
        wait(t1) {
            this.triggerTime = t1 + this.resetTime;
        }
        /**
         * tick(t1) returns true if the trigger went off and resets the timer
         * @param {number} t1 Time in seconds
         */
        tick(t1) {
            this.update(t1);
            let result = false;
            if (this.triggered) {
                result = true;
                this.wait(t1);
            }
            return result;
        }
        /**
         * update(t1)
         * @param {number} t1 Time in seconds
         */
        update(t1) {
            this.triggered_ = t1 > this.triggerTime;
        }
    }
    XOR.Trigger = Trigger;
})(XOR || (XOR = {}));
/// <reference path="LibXOR.ts" />
/// <reference path="XorTrigger.ts" />
var XOR;
(function (XOR) {
    class TriggerSystem {
        constructor() {
            this.triggers = new Map();
        }
        set(name, time) {
            this.triggers.set(name, new XOR.Trigger(time));
        }
        get(name) {
            let t = this.triggers.get(name);
            if (!t)
                return new XOR.Trigger(0);
            return t;
        }
    }
    XOR.TriggerSystem = TriggerSystem;
})(XOR || (XOR = {}));
/// <reference path="../Hatchetfish.ts" />
/// <reference path="../GTE/GTE.ts" />
/// <reference path="XorUtils.ts" />
/// <reference path="XorMemorySystem.ts" />
/// <reference path="XorGraphicsSystem.ts" />
/// <reference path="XorSoundSystem.ts" />
/// <reference path="XorInputSystem.ts" />
/// <reference path="XorPaletteSystem.ts" />
/// <reference path="XorMeshSystem.ts" />
/// <reference path="XorTextFileLoaderSystem.ts" />
/// <reference path="XorTriggerSystem.ts" />
/// <reference path="../Fluxions/Fluxions.ts" />
/**
 * @class LibXOR
 * @member {FxRenderingContext} fluxions
 */
class LibXOR {
    constructor(parentId) {
        this.parentId = parentId;
        this.t1 = 0.0;
        this.t0 = 0.0;
        this.dt = 0.0;
        this.frameCount = 0;
        this.memory = new XOR.MemorySystem(this);
        this.sound = new XOR.SoundSystem(this);
        this.input = new XOR.InputSystem(this);
        this.palette = new XOR.PaletteSystem(this);
        this.meshes = new XOR.MeshSystem(this);
        this.textfiles = new XOR.TextFileLoaderSystem();
        this.triggers = new XOR.TriggerSystem();
        this.oninit = () => { };
        this.onupdate = (dt) => { };
        let n = document.getElementById(parentId);
        if (!n)
            throw "Unable to initialize LibXOR due to bad parentId '" + parentId.toString() + "'";
        this.parentElement = n;
        this.graphics = new XOR.GraphicsSystem(this);
        this.fluxions = new Fluxions.FxRenderingContext(this);
    }
    get renderconfigs() { return this.fluxions.renderconfigs; }
    get fx() { return this.fluxions; }
    start() {
        this.t0 = 0;
        this.t1 = 0;
        this.dt = 0;
        this.frameCount = 0;
        this.memory.init();
        this.graphics.init();
        this.sound.init();
        this.input.init();
        this.oninit();
        this.mainloop();
    }
    startFrame(t) {
        this.t0 = this.t1;
        this.t1 = t / 1000.0;
        this.dt = this.t1 - this.t0;
        this.frameCount++;
    }
    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.startFrame(t);
            self.onupdate(this.dt);
            self.graphics.readFromMemory();
            self.graphics.render();
            self.mainloop();
        });
    }
}
/* eslint-disable no-unused-vars, no-unreachable, no-redeclare, no-console, no-empty, no-extra-semi, no-constant-condition */
/// <reference path="XOR/LibXOR.ts" />
//# sourceMappingURL=LibXOR.js.map