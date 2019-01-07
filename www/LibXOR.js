"use strict";
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
        }
    }
    writeToLog(prefix, message, ...optionalParams) {
        let text = prefix + ": " + message;
        for (let op of optionalParams) {
            if (op.toString) {
                text += " " + op.toString();
            }
            else {
                text += " <unknown>";
            }
        }
        if (this._logElement) {
            let newHTML = "<br/>" + text + this._logElement.innerHTML;
            this._logElement.innerHTML = newHTML;
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
class Vector3 {
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
    static makeFromSphericalISO(rho, thetaInRadians, phiInRadians) {
        return new Vector3(rho * Math.sin(thetaInRadians) * Math.cos(phiInRadians), rho * Math.cos(thetaInRadians), rho * Math.sin(thetaInRadians) * Math.sin(phiInRadians));
    }
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
    div(divisor) {
        if (divisor == 0.0)
            return new Vector3();
        return new Vector3(this.x / divisor, this.y / divisor, this.z / divisor);
    }
    neg() {
        return new Vector3(-this.x, -this.y, -this.z);
    }
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
    div(divisor) {
        if (divisor == 0.0)
            return new Vector4();
        return new Vector4(this.x / divisor, this.y / divisor, this.z / divisor, this.w / divisor);
    }
    neg() {
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
        if (face == 0)
            return Matrix3.makeRotation(90.0, 0.0, 1.0, 0.0);
        if (face == 1)
            return Matrix3.makeRotation(270.0, 0.0, 1.0, 0.0);
        if (face == 2)
            return Matrix3.makeRotation(90.0, 1.0, 0.0, 0.0);
        if (face == 3)
            return Matrix3.makeRotation(270.0, 1.0, 0.0, 0.0);
        if (face == 4)
            return Matrix3.makeIdentity();
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
}
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
        return this.LoadMatrix(m);
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
    LoadRowMajor(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
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
    LoadColMajor(m11, m21, m31, m41, m12, m22, m32, m42, m13, m23, m33, m43, m14, m24, m34, m44) {
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
    LoadIdentity() {
        return this.LoadMatrix(Matrix4.makeIdentity());
    }
    Translate(x, y, z) {
        return this.MultMatrix(Matrix4.makeTranslation(x, y, z));
    }
    Rotate(angleInDegrees, x, y, z) {
        return this.MultMatrix(Matrix4.makeRotation(angleInDegrees, x, y, z));
    }
    Scale(sx, sy, sz) {
        return this.MultMatrix(Matrix4.makeScale(sx, sy, sz));
    }
    LookAt(eye, center, up) {
        return this.MultMatrix(Matrix4.makeLookAt2(eye, center, up));
    }
    Frustum(left, right, bottom, top, near, far) {
        return this.MultMatrix(Matrix4.makeFrustum(left, right, bottom, top, near, far));
    }
    Ortho(left, right, bottom, top, near, far) {
        return this.MultMatrix(Matrix4.makeOrtho(left, right, bottom, top, near, far));
    }
    Ortho2D(left, right, bottom, top) {
        return this.MultMatrix(Matrix4.makeOrtho2D(left, right, bottom, top));
    }
    PerspectiveX(fovx, aspect, near, far) {
        return this.MultMatrix(Matrix4.makePerspectiveX(fovx, aspect, near, far));
    }
    PerspectiveY(fovy, aspect, near, far) {
        return this.MultMatrix(Matrix4.makePerspectiveY(fovy, aspect, near, far));
    }
    ShadowBias() {
        return this.MultMatrix(Matrix4.makeShadowBias());
    }
    CubeFaceMatrix(face) {
        return this.MultMatrix(Matrix4.makeCubeFaceMatrix(face));
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
        if (face == 0)
            return Matrix4.makeRotation(90.0, 0.0, 1.0, 0.0);
        if (face == 1)
            return Matrix4.makeRotation(270.0, 0.0, 1.0, 0.0);
        if (face == 2)
            return Matrix4.makeRotation(90.0, 1.0, 0.0, 0.0);
        if (face == 3)
            return Matrix4.makeRotation(270.0, 1.0, 0.0, 0.0);
        if (face == 4)
            return Matrix4.makeIdentity();
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
    LoadMatrix(m) {
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
    MultMatrix(m) {
        this.LoadMatrix(Matrix4.multiply(this, m));
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
}
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
        sdf(p) {
            return (p.sub(this.center)).length() - this.radius;
        }
        support(n) {
            return n.mul(this.radius).add(this.center);
        }
        distance(s) {
            return this.center.distance(s.center);
        }
        intersectsSphere(s) {
            return this.distance(s) < this.radius + s.radius;
        }
    }
    GTE.Sphere = Sphere;
})(GTE || (GTE = {}));
var GTE;
(function (GTE) {
    function clamp(x, a, b) {
        return x < a ? a : x > b ? b : x;
    }
    GTE.clamp = clamp;
    function lerp(a, b, mix) {
        return mix * a + (1 - mix) * b;
    }
    GTE.lerp = lerp;
    function sigmoid(x) {
        let ex = Math.exp(x);
        return ex / (ex + 1);
    }
    GTE.sigmoid = sigmoid;
    function signzero(x) {
        if (x >= 0.0)
            return 1.0;
        return -1.0;
    }
    GTE.signzero = signzero;
    function sign(x, epsilon = 1e-5) {
        if (x < -epsilon)
            return -1.0;
        if (x > epsilon)
            return 1.0;
        return 0.0;
    }
    GTE.sign = sign;
    function gaussian(x, center, sigma) {
        let t = (x - center) / sigma;
        return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * t * t);
    }
    GTE.gaussian = gaussian;
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
    function vec3(x, y, z) {
        return new Vector3(x, y, z);
    }
    GTE.vec3 = vec3;
    function vec4(x, y, z, w) {
        return new Vector4(x, y, z, w);
    }
    GTE.vec4 = vec4;
})(GTE || (GTE = {}));
var GTE;
(function (GTE) {
    class BoundingBox {
        constructor() {
            this.minBounds = Vector3.make(1e6, 1e6, 1e6);
            this.maxBounds = Vector3.make(-1e6, -1e6, -1e6);
        }
        copy(b) {
            this.minBounds.copy(b.minBounds);
            this.maxBounds.copy(b.maxBounds);
            return this;
        }
        clone() {
            let b = new BoundingBox();
            return b.copy(this);
        }
        get width() { return this.maxBounds.x - this.minBounds.x; }
        get height() { return this.maxBounds.y - this.minBounds.y; }
        get depth() { return this.maxBounds.z - this.minBounds.z; }
        get maxSize() { return GTE.max3(this.width, this.height, this.depth); }
        get minSize() { return GTE.min3(this.width, this.height, this.depth); }
        get x() { return 0.5 * (this.minBounds.x + this.maxBounds.x); }
        get y() { return 0.5 * (this.minBounds.y + this.maxBounds.y); }
        get z() { return 0.5 * (this.minBounds.z + this.maxBounds.z); }
        get left() { return this.minBounds.x; }
        get right() { return this.maxBounds.x; }
        get top() { return this.maxBounds.y; }
        get bottom() { return this.minBounds.y; }
        get front() { return this.minBounds.z; }
        get back() { return this.maxBounds.z; }
        get outsideSphere() {
            let d = (0.5 * this.maxSize);
            let r = Math.sqrt(d * d + d * d);
            return new GTE.Sphere(r, this.center);
        }
        get insideSphere() {
            let r = 0.5 * this.maxSize;
            return new GTE.Sphere(r, this.center);
        }
        get size() {
            return Vector3.make(this.maxBounds.x - this.minBounds.x, this.maxBounds.y - this.minBounds.y, this.maxBounds.z - this.minBounds.z);
        }
        get center() {
            return Vector3.make(0.5 * (this.minBounds.x + this.maxBounds.x), 0.5 * (this.minBounds.y + this.maxBounds.y), 0.5 * (this.minBounds.z + this.maxBounds.z));
        }
        add(p) {
            this.minBounds = Vector3.min(this.minBounds, p);
            this.maxBounds = Vector3.max(this.maxBounds, p);
        }
        reset() {
            this.minBounds = Vector3.make(1e6, 1e6, 1e6);
            this.maxBounds = Vector3.make(-1e6, -1e6, -1e6);
        }
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
        sdf(p) {
            let c = this.center;
            return GTE.max3(Math.abs(p.x - c.x) - this.width * 0.5, Math.abs(p.y - c.y) - this.height * 0.5, Math.abs(p.z - c.z) - this.depth * 0.5);
        }
        support(n) {
            let c = this.center;
            return new Vector3(c.x + 0.5 * this.width * GTE.sign(n.x), c.y + 0.5 * this.height * GTE.sign(n.y), c.z + 0.5 * this.depth * GTE.sign(n.z));
        }
    }
    GTE.BoundingBox = BoundingBox;
})(GTE || (GTE = {}));
function randomUint8() {
    return (Math.random() * 255.99) | 0;
}
function randomUint16() {
    return (Math.random() * 65535.99) | 0;
}
class GraphicsSystem {
    constructor(xor) {
        this.xor = xor;
        this.gl = null;
        this.canvas = null;
        this.glcontextid = "GraphicsSystem" + randomUint8().toString();
        this.sprites = [];
        this.tileLayers = [];
        this.spriteImage = new Uint8Array(128 * 128 * 4);
        this.layer1width = 0;
        this.layer1height = 0;
        this.layer2width = 0;
        this.layer2height = 0;
        this.layer3width = 0;
        this.layer3height = 0;
        this.layer4width = 0;
        this.layer4height = 0;
        this.worldMatrix = Matrix4.makeIdentity();
        this.cameraMatrix = Matrix4.makeIdentity();
        this.projectionMatrix = Matrix4.makeOrtho(0, 256, 0, 256, -100.0, 100.0);
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
    }
    init() {
        this.sprites = [];
        for (let i = 0; i < this.MaxSprites; i++) {
            this.sprites.push(new GraphicsSprite());
        }
        this.tileLayers = [];
        for (let i = 0; i < this.MaxTileLayers; i++) {
            this.tileLayers.push(new GraphicsTileLayer());
        }
    }
    setVideoMode(width, height) {
        let p = this.xor.parentElement;
        while (p.firstChild) {
            p.removeChild(p.firstChild);
        }
        let canvas = document.createElement("canvas");
        canvas.id = this.glcontextid;
        canvas.width = width;
        canvas.height = height;
        this.gl = canvas.getContext("webgl");
        this.canvas = canvas;
        p.appendChild(canvas);
    }
    readFromMemory() {
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
        for (let i = 0; i < this.MaxSprites; i++) {
            this.sprites[i].readFromMemory(this.xor.memory, this.SpriteInfoMemoryStart + i * this.SpriteSize);
        }
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
    }
    createBuffers() {
        if (!this.gl)
            return;
        let gl = this.gl;
        let vertices = [];
        this.drawList = [];
        this.drawList.push(gl.TRIANGLES);
        this.drawList.push(vertices.length / 16);
        for (let i = 0; i < this.MaxSprites; i++) {
            let spr = this.sprites[i];
            let r = 1;
            let g = 1;
            let b = 1;
            let a = spr.alpha;
            let u1 = spr.fliph ? 1.0 : 0.0;
            let u2 = spr.fliph ? 0.0 : 1.0;
            let v1 = spr.flipv ? 1.0 : 0.0;
            let v2 = spr.flipv ? 0.0 : 1.0;
            let w = 0.0;
            let scale = 1.0;
            let x1 = spr.position.x;
            let y1 = spr.position.y;
            let x2 = spr.position.x + 8;
            let y2 = spr.position.y + 8;
            let z = 0.0;
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
        }
        this.drawList.push(this.MaxSprites * 6);
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
            if (!this.spriteTexture) {
                this.spriteTexture = gl.createTexture();
            }
            if (this.spriteTexture) {
                gl.bindTexture(gl.TEXTURE_2D, this.spriteTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.spriteImage);
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
        let s = Math.sin(xor.t1);
        gl.clearColor(0.3 * s, 0.1 * s, 0.2 * s, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.projectionMatrix = Matrix4.makeOrtho2D(0, this.canvas.width, this.canvas.height, 0);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.drawABO);
        this.enableVertexAttrib(gl, this.aPosition, 3, gl.FLOAT, 64, 0);
        this.enableVertexAttrib(gl, this.aNormal, 3, gl.FLOAT, 64, 12);
        this.enableVertexAttrib(gl, this.aTexcoord, 3, gl.FLOAT, 64, 24);
        this.enableVertexAttrib(gl, this.aColor, 4, gl.FLOAT, 64, 36);
        this.enableVertexAttrib(gl, this.aGeneric, 3, gl.FLOAT, 64, 52);
        gl.useProgram(this.shaderProgram);
        if (this.uTexture0)
            gl.uniform1i(this.uTexture0, 0);
        if (this.uWorldMatrix)
            gl.uniformMatrix4fv(this.uWorldMatrix, false, this.worldMatrix.toColMajorArray());
        if (this.uCameraMatrix)
            gl.uniformMatrix4fv(this.uCameraMatrix, false, this.cameraMatrix.toColMajorArray());
        if (this.uProjectionMatrix)
            gl.uniformMatrix4fv(this.uProjectionMatrix, false, this.projectionMatrix.toColMajorArray());
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.spriteTexture);
        gl.drawArrays(gl.TRIANGLES, 0, this.MaxSprites * 6);
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
}
class SoundSystem {
    constructor(xor) {
        this.xor = xor;
    }
    init() {
    }
}
class InputSystem {
    constructor(xor) {
        this.xor = xor;
        this.keys = new Map();
        this.codes = new Map();
        this.modifiers = 0;
    }
    init() {
        let self = this;
        window.onkeydown = (e) => {
            self.onkeydown(e);
        };
        window.onkeyup = (e) => {
            self.onkeyup(e);
        };
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
        e.preventDefault();
    }
}
class LibXOR {
    constructor(parentId) {
        this.parentId = parentId;
        this.memory = new MemorySystem(this);
        this.graphics = new GraphicsSystem(this);
        this.sound = new SoundSystem(this);
        this.input = new InputSystem(this);
        this.palette = new PaletteSystem(this);
        this.t1 = 0.0;
        this.t0 = 0.0;
        this.dt = 0.0;
        this.oninit = () => { };
        this.onupdate = (dt) => { };
        this.frameCount = 0;
        let n = document.getElementById(parentId);
        if (!n)
            throw "Unable to initialize LibXOR due to bad parentId '" + parentId.toString() + "'";
        this.parentElement = n;
    }
    start() {
        this.memory.init();
        this.graphics.init();
        this.sound.init();
        this.input.init();
        this.oninit();
        this.mainloop();
    }
    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.t0 = this.t1;
            self.t1 = t / 1000.0;
            self.dt = this.t1 - this.t0;
            self.onupdate(this.dt);
            self.graphics.readFromMemory();
            self.graphics.render();
            self.mainloop();
        });
    }
}
class MemorySystem {
    constructor(xor) {
        this.xor = xor;
        this.mem = new Int32Array(65536);
    }
    init() {
        for (let i = 0; i < 65536; i++) {
            this.mem[i] = 0;
        }
    }
    PEEK(location) {
        if (location < 0 || location > 65536) {
            return 0;
        }
        return this.mem[location];
    }
    POKE(location, value) {
        if (location < 0 || location > 65535) {
            return;
        }
        this.mem[location] = value | 0;
    }
}
class GraphicsSprite {
    constructor() {
        this.position = GTE.vec3(0, 0, 0);
        this.pivot = GTE.vec3(0, 0, 0);
        this.palette = 0;
        this.index = 0;
        this.plane = 0;
        this.enabled = true;
        this.alpha = 1.0;
        this.fliph = false;
        this.flipv = false;
        this.rotate90 = 0;
        this.matrix = Matrix4.makeIdentity();
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
        this.matrix.LoadRowMajor(M11, M12, 0, M13, M21, M22, 0, M23, 0, 0, 1, 0, 0, 0, 0, 1);
    }
}
class GraphicsTileLayer {
    constructor() {
        this.tiles = [];
        this.layer = 0;
    }
    readFromMemory(mem, offset) {
    }
}
class PaletteSystem {
    constructor(xor) {
        this.xor = xor;
    }
    getColor(index) {
        if (index == 0)
            return GTE.vec3(0.000, 0.000, 0.000);
        if (index == 1)
            return GTE.vec3(0.333, 0.333, 0.333);
        if (index == 2)
            return GTE.vec3(0.667, 0.667, 0.667);
        if (index == 3)
            return GTE.vec3(1.000, 1.000, 1.000);
        if (index == 4)
            return GTE.vec3(1.000, 0.000, 0.000);
        if (index == 5)
            return GTE.vec3(0.894, 0.447, 0.000);
        if (index == 6)
            return GTE.vec3(0.894, 0.894, 0.000);
        if (index == 7)
            return GTE.vec3(0.000, 1.000, 0.000);
        if (index == 8)
            return GTE.vec3(0.000, 0.707, 0.707);
        if (index == 9)
            return GTE.vec3(0.000, 0.447, 0.894);
        if (index == 10)
            return GTE.vec3(0.000, 0.000, 1.000);
        if (index == 11)
            return GTE.vec3(0.447, 0.000, 0.894);
        if (index == 12)
            return GTE.vec3(0.894, 0.000, 0.447);
        if (index == 13)
            return GTE.vec3(0.500, 0.250, 0.000);
        if (index == 14)
            return GTE.vec3(0.830, 0.670, 0.220);
        if (index == 15)
            return GTE.vec3(0.250, 0.500, 0.250);
        return GTE.vec3(0.0, 0.0, 0.0);
    }
    mixColors(color1, color2, mix) {
        let t = GTE.clamp(1.0 - mix / 7.0, 0.0, 1.0);
        return GTE.vec3(GTE.lerp(color1.x, color2.x, t), GTE.lerp(color1.y, color2.y, t), GTE.lerp(color1.z, color2.z, t));
    }
    hueshiftColor(color, shift) {
        let hue = 0;
        if (shift == 1)
            hue = 7.5 / 360;
        if (shift == 2)
            hue = 15 / 360;
        if (shift == 3)
            hue = 0.5;
        let hsl = PaletteSystem.rgb2hsl(color);
        hsl.x += hue;
        return PaletteSystem.hsl2rgb(hsl);
    }
    negativeColor(color) {
        return GTE.vec3(1.0 - color.x, 1.0 - color.y, 1.0 - color.z);
    }
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
            return GTE.vec3(hsl.z, hsl.z, hsl.z);
        }
        else {
            let f2;
            if (hsl.z < 0.5)
                f2 = hsl.z * (1.0 + hsl.y);
            else
                f2 = hsl.z + hsl.y - hsl.y * hsl.z;
            let f1 = 2.0 * hsl.z - f2;
            return GTE.vec3(PaletteSystem.hue2rgb(f1, f2, hsl.x + (1.0 / 3.0)), PaletteSystem.hue2rgb(f1, f2, hsl.x), PaletteSystem.hue2rgb(f1, f2, hsl.x - (1.0 / 3.0)));
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
//# sourceMappingURL=LibXOR.js.map