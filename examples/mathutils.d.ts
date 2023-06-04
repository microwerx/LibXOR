/// <reference path="../LibXOR.d.ts" />
/**
 *
 * @param a
 * @param b
 * @param bscale
 */
declare function accum(a: Vector3, b: Vector3, bscale: number): void;
/**
 *
 * @param v
 * @param a
 * @param b
 * @returns A vector that has its components clamped between `a` and `b`.
 */
declare function clamp3(v: Vector3, a: number, b: number): Vector3;
/**
 *
 * @param v
 * @param s
 * @returns The maximum of a vector's components and a scalar.
 */
declare function max(v: Vector3, s: number): Vector3;
/**
 *
 * @param v
 * @returns The absolute value of the components.
 */
declare function abs(v: Vector3): Vector3;
/**
 *
 * @param {number} a The start of the range.
 * @param {number} b The end of the range.
 * @returns {number} A random number between `a` and `b`.
 */
declare function randbetween(a: number, b: number): number;
/**
 *
 * @param x
 * @returns 1 if x >= 0 or -1 otherwise.
 */
declare function sign(x: number): number;
