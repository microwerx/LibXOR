"use strict";
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
class MemorySystem {
    constructor(xor) {
        this.xor = xor;
        this.mem = new Int32Array(65536);
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
class SoundSystem {
    constructor(xor) {
        this.xor = xor;
    }
}
class InputSystem {
    constructor(xor) {
        this.xor = xor;
    }
}
class LibXOR {
    constructor(parentId) {
        this.parentId = parentId;
        this.memory = new MemorySystem(this);
        this.graphics = new GraphicsSystem(this);
        this.sound = new SoundSystem(this);
        this.input = new InputSystem(this);
        this.t1 = 0.0;
        this.t0 = 0.0;
        this.dt = 0.0;
        this.oninit = () => { };
        this.onupdate = (dt) => { };
        let n = document.getElementById(parentId);
        if (!n)
            throw "Unable to initialize LibXOR due to bad parentId '" + parentId.toString() + "'";
        this.parentElement = n;
    }
    start() {
        this.oninit();
        this.mainloop();
    }
    mainloop() {
        window.requestAnimationFrame((t) => {
            this.t0 = this.t1;
            this.t1 = t;
            this.dt = this.t1 - this.t0;
            this.onupdate(this.dt);
            this.graphics.render();
        });
    }
}
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
        this.glcontextid = "GraphicsSystem" + randomUint8().toString();
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
        p.appendChild(canvas);
    }
    render() {
        if (!this.gl)
            return;
        let gl = this.gl;
        let xor = this.xor;
        let s = Math.sin(xor.t1);
        gl.clearColor(0.3 * s, 0.1 * s, 0.2 * s, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}
//# sourceMappingURL=LibXOR.js.map