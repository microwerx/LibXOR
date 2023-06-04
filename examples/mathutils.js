"use strict";
/// <reference path="../LibXOR.d.ts" />
/**
 *
 * @param a
 * @param b
 * @param bscale
 */
function accum(a, b, bscale) {
    a.x += b.x * bscale;
    a.y += b.y * bscale;
    a.z += b.z * bscale;
}
/**
 *
 * @param v
 * @param a
 * @param b
 * @returns A vector that has its components clamped between `a` and `b`.
 */
function clamp3(v, a, b) {
    return Vector3.make(GTE.clamp(v.x, a, b), GTE.clamp(v.y, a, b), GTE.clamp(v.z, a, b));
}
/**
 *
 * @param v
 * @param s
 * @returns The maximum of a vector's components and a scalar.
 */
function max(v, s) {
    return Vector3.make(Math.max(v.x, s), Math.max(v.y, s, Math.max(v.z, s)));
}
/**
 *
 * @param v
 * @returns The absolute value of the components.
 */
function abs(v) {
    return Vector3.make(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
}
/**
 *
 * @param {number} a The start of the range.
 * @param {number} b The end of the range.
 * @returns {number} A random number between `a` and `b`.
 */
function randbetween(a, b) {
    return Math.random() * (b - a) + a;
}
/**
 *
 * @param x
 * @returns 1 if x >= 0 or -1 otherwise.
 */
function sign(x) {
    return x >= 0.0 ? 1.0 : -1.0;
}
//# sourceMappingURL=mathutils.js.map