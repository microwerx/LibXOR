// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// See LICENSE for details.
//
/// <reference path="GTE.ts"/>

class Matrix3 {
	constructor(
		public m11: number, public m21: number, public m31: number,
		public m12: number, public m22: number, public m32: number,
		public m13: number, public m23: number, public m33: number
	) { }

	static makeIdentity(): Matrix3 {
		return new Matrix3(
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		)
	}

	static makeZero(): Matrix3 {
		return new Matrix3(
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		)
	}

	static makeColMajor(
		m11: number, m21: number, m31: number,
		m12: number, m22: number, m32: number,
		m13: number, m23: number, m33: number
	) {
		return new Matrix3(
			m11, m21, m31,
			m12, m22, m32,
			m13, m23, m33
		);
	}

	static makeRowMajor(
		m11: number, m12: number, m13: number,
		m21: number, m22: number, m23: number,
		m31: number, m32: number, m33: number): Matrix3 {
		return new Matrix3(
			m11, m21, m31,
			m12, m22, m32,
			m13, m23, m33
		);
	}

	static fromRowMajorArray(v: number[]): Matrix3 {
		if (v.length >= 9)
			return new Matrix3(
				v[0], v[3], v[6],
				v[1], v[4], v[7],
				v[2], v[5], v[8]
			);
		return new Matrix3(
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		);
	}

	static fromColMajorArray(v: number[]): Matrix3 {
		if (v.length >= 9)
			return new Matrix3(
				v[0], v[1], v[2],
				v[3], v[4], v[5],
				v[6], v[7], v[8]
			);
		return new Matrix3(
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		);
	}

	static makeScale(x: number, y: number, z: number): Matrix3 {
		return Matrix3.makeRowMajor(
			x, 0, 0,
			0, y, 0,
			0, 0, z
		);
	}

	static makeRotation(angleInDegrees: number, x: number, y: number, z: number): Matrix3 {
		var c = Math.cos(angleInDegrees * Math.PI / 180.0);
		var s = Math.sin(angleInDegrees * Math.PI / 180.0);
		var invLength = 1.0 / Math.sqrt(x * x + y * y + z * z);
		x *= invLength;
		y *= invLength;
		z *= invLength;

		return Matrix3.makeRowMajor(
			x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s,
			y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s,
			x * z * (1 - c) - y * s, y * z * (1 - c) + x * s, z * z * (1 - c) + c
		);
	}

	static makeCubeFaceMatrix(face: number): Matrix3 {
		// +X
		if (face == 0) return Matrix3.makeRotation(90.0, 0.0, 1.0, 0.0);
		// -X
		if (face == 1) return Matrix3.makeRotation(270.0, 0.0, 1.0, 0.0);
		// +Y
		if (face == 2) return Matrix3.makeRotation(90.0, 1.0, 0.0, 0.0);
		// -Y
		if (face == 3) return Matrix3.makeRotation(270.0, 1.0, 0.0, 0.0);
		// +Z
		if (face == 4) return Matrix3.makeIdentity();
		// -Z
		if (face == 5) return Matrix3.makeRotation(180.0, 0.0, 1.0, 0.0);
		return new Matrix3(
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		);
	}

	asColMajorArray(): number[] {
		return [
			this.m11, this.m21, this.m31,
			this.m12, this.m22, this.m32,
			this.m13, this.m23, this.m33
		];
	}

	asRowMajorArray(): number[] {
		return [
			this.m11, this.m12, this.m13,
			this.m21, this.m22, this.m23,
			this.m31, this.m32, this.m33
		];
	}

	static multiply(m1: Matrix3, m2: Matrix3): Matrix3 {
		return new Matrix3(
			m1.m11 * m2.m11 + m1.m21 * m2.m12 + m1.m31 * m2.m13,
			m1.m11 * m2.m21 + m1.m21 * m2.m22 + m1.m31 * m2.m23,
			m1.m11 * m2.m31 + m1.m21 * m2.m32 + m1.m31 * m2.m33,

			m1.m12 * m2.m11 + m1.m22 * m2.m12 + m1.m32 * m2.m13,
			m1.m12 * m2.m21 + m1.m22 * m2.m22 + m1.m32 * m2.m23,
			m1.m12 * m2.m31 + m1.m22 * m2.m32 + m1.m32 * m2.m33,

			m1.m13 * m2.m11 + m1.m23 * m2.m12 + m1.m33 * m2.m13,
			m1.m13 * m2.m21 + m1.m23 * m2.m22 + m1.m33 * m2.m23,
			m1.m13 * m2.m31 + m1.m23 * m2.m32 + m1.m33 * m2.m33
		);
	}

	LoadIdentity(): Matrix3 {
		return this.copy(Matrix3.makeIdentity());
	}

	MultMatrix(m: Matrix3): Matrix3 {
		return this.copy(Matrix3.multiply(this, m));
	}

	LoadColMajor(
		m11: number, m21: number, m31: number,
		m12: number, m22: number, m32: number,
		m13: number, m23: number, m33: number): Matrix3 {
		this.m11 = m11; this.m12 = m12; this.m13 = m13;
		this.m21 = m21; this.m22 = m22; this.m23 = m23;
		this.m31 = m31; this.m32 = m32; this.m33 = m33;
		return this;
	}

	LoadRowMajor(
		m11: number, m12: number, m13: number,
		m21: number, m22: number, m23: number,
		m31: number, m32: number, m33: number): Matrix3 {
		this.m11 = m11; this.m12 = m12; this.m13 = m13;
		this.m21 = m21; this.m22 = m22; this.m23 = m23;
		this.m31 = m31; this.m32 = m32; this.m33 = m33;
		return this;
	}

	toMatrix4(): Matrix4 {
		return Matrix4.makeRowMajor(
			this.m11, this.m12, this.m13, 0.0,
			this.m21, this.m22, this.m23, 0.0,
			this.m31, this.m32, this.m33, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
	}

	copy(m: Matrix3): Matrix3 {
		this.m11 = m.m11; this.m21 = m.m21; this.m31 = m.m31;
		this.m12 = m.m12; this.m22 = m.m22; this.m32 = m.m32;
		this.m13 = m.m13; this.m23 = m.m23; this.m33 = m.m33;
		return this;
	}

	clone(): Matrix3 {
		return Matrix3.makeRowMajor(
			this.m11, this.m12, this.m13,
			this.m21, this.m22, this.m23,
			this.m31, this.m32, this.m33
		);
	}

	concat(m: Matrix3): Matrix3 {
		this.copy(Matrix3.multiply(this, m));
		return this;
	}

	transform(v: Vector3): Vector3 {
		return new Vector3(
			this.m11 * v.x + this.m12 * v.y + this.m13 * v.z,
			this.m21 * v.x + this.m22 * v.y + this.m23 * v.z,
			this.m31 * v.x + this.m32 * v.y + this.m33 * v.z
		);
	}

	asInverse(): Matrix3 {
		var tmpA = this.m22 * this.m33 - this.m23 * this.m32;
		var tmpB = this.m21 * this.m32 - this.m22 * this.m31;
		var tmpC = this.m23 * this.m31 - this.m21 * this.m33;
		var tmpD = 1.0 / (this.m11 * tmpA + this.m12 * tmpC + this.m13 * tmpB);

		return new Matrix3(
			tmpA * tmpD,
			(this.m13 * this.m32 - this.m12 * this.m33) * tmpD,
			(this.m12 * this.m23 - this.m13 * this.m22) * tmpD,
			tmpC * tmpD,
			(this.m11 * this.m33 - this.m13 * this.m31) * tmpD,
			(this.m13 * this.m21 - this.m11 * this.m23) * tmpD,
			tmpB * tmpD,
			(this.m12 * this.m31 - this.m11 * this.m32) * tmpD,
			(this.m11 * this.m22 - this.m12 * this.m21) * tmpD
		);
	}

	asTranspose(): Matrix3 {
		return new Matrix3(
			this.m11, this.m12, this.m13,
			this.m21, this.m22, this.m23,
			this.m31, this.m32, this.m33
		);
	}
} // class Matrix3
