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

namespace GTE {
    /**
     * @class
     */
    export class BoundingBox {
        /**
         * @constructor
         */
        constructor(public minBounds = Vector3.make(0, 0, 0), public maxBounds = Vector3.make(0, 0, 0)) { }

        /**
         * Copy b into this
         * @param {BoundingBox} b bounding box to copy from
         * @returns {BoundingBox}
         */
        copy(b: BoundingBox): BoundingBox {
            this.minBounds.copy(b.minBounds);
            this.maxBounds.copy(b.maxBounds);
            return this;
        }

        /**
         * Clone this bounding box
         * @returns {BoundingBox}
         */
        clone(): BoundingBox {
            let b = new BoundingBox();
            return b.copy(this);
        }

        /**
         * Returns true if bbox is the same as this
         * @param {BoundingBox} bbox bounding box to compare against
         */
        sameAs(bbox: BoundingBox): boolean {
            if (this.maxBounds.distanceSquared(bbox.maxBounds) >= 0.0001) return false;
            if (this.minBounds.distanceSquared(bbox.minBounds) >= 0.0001) return false;
            return true;
        }

        /**
         * @returns {string}
         */
        get whdString(): string { return this.width.toFixed(2) + "x" + this.height.toFixed(2) + "x" + this.depth.toFixed(2) }

        /**
         * @returns {string}
         */
        get minString(): string { return "(" + this.minBounds.x.toFixed(2) + ", " + this.minBounds.y.toFixed(2) + ", " + this.minBounds.z.toFixed(2) + ")" }

        /**
         * @returns {string}
         */
        get maxString(): string { return "(" + this.maxBounds.x.toFixed(2) + ", " + this.maxBounds.y.toFixed(2) + ", " + this.maxBounds.z.toFixed(2) + ")" }

        /**
         * @returns {number}
         */
        get width(): number { return this.maxBounds.x - this.minBounds.x; }

        /**
         * @returns {number}
         */
        get height(): number { return this.maxBounds.y - this.minBounds.y; }

        /**
         * @returns {number}
         */
        get depth(): number { return this.maxBounds.z - this.minBounds.z; }

        /**
         * @returns {number}
         */
        get maxSize(): number { return GTE.max3(this.width, this.height, this.depth); }

        /**
         * @returns {number}
         */
        get minSize(): number { return GTE.min3(this.width, this.height, this.depth); }

        /**
         * @returns {number}
         */
        get x(): number { return 0.5 * (this.minBounds.x + this.maxBounds.x); }

        /**
         * @returns {number}
         */
        get y(): number { return 0.5 * (this.minBounds.y + this.maxBounds.y); }

        /**
         * @returns {number}
         */
        get z(): number { return 0.5 * (this.minBounds.z + this.maxBounds.z); }

        /**
         * @returns {number}
         */
        get left(): number { return this.minBounds.x; }

        /**
         * @returns {number}
         */
        get right(): number { return this.maxBounds.x; }

        /**
         * @returns {number}
         */
        get top(): number { return this.maxBounds.y; }

        /**
         * @returns {number}
         */
        get bottom(): number { return this.minBounds.y; }

        /**
         * @returns {number}
         */
        get front(): number { return this.minBounds.z; }

        /**
         * @returns {number}
         */
        get back(): number { return this.maxBounds.z; }

        /**
         * Returns bounding sphere
         * @returns {Sphere}
         */
        get outsideSphere(): Sphere {
            let d = (0.5 * this.maxSize); // distance from center to largest diagonal
            let r = Math.sqrt(d * d + d * d);
            return new Sphere(r, this.center);
        }

        /**
         * Returns smallest sphere inside bounding box
         * @returns {Sphere}
         */
        get insideSphere(): Sphere {
            let r = 0.5 * this.maxSize;
            return new Sphere(r, this.center);
        }

        /**
         * @returns {Vector3} (width, height, length) of bounding box
         */
        get size(): Vector3 {
            return Vector3.make(
                this.maxBounds.x - this.minBounds.x,
                this.maxBounds.y - this.minBounds.y,
                this.maxBounds.z - this.minBounds.z
            );
        }

        /**
         * Returns center of AABB
         * @returns {Vector3} (x, y, z) of center of AABB
         */
        get center(): Vector3 {
            return Vector3.make(
                0.5 * (this.minBounds.x + this.maxBounds.x),
                0.5 * (this.minBounds.y + this.maxBounds.y),
                0.5 * (this.minBounds.z + this.maxBounds.z)
            );
        }

        /**
         * Adds a point to the AABB
         * @param {Vector3} p point to add to AABB
         * @returns {BoundingBox} returns this pointer
         */
        add(p: Vector3): BoundingBox {
            this.minBounds = Vector3.min(this.minBounds, p);
            this.maxBounds = Vector3.max(this.maxBounds, p);
            return this;
        }

        /**
         * Resets bounding box to inverted box
         * @returns {BoundingBox} returns this pointer
         */
        reset(): BoundingBox {
            this.minBounds = Vector3.make(1e6, 1e6, 1e6);
            this.maxBounds = Vector3.make(-1e6, -1e6, -1e6);
            return this;
        }

        /**
         * 
         * @param {BoundingBox} aabb bounding box to compare with
         * @returns {boolean}
         */
        intersectsAABB(aabb: BoundingBox): boolean {
            let Xoverlap = true;
            let Yoverlap = true;
            let Zoverlap = true;

            let a = this;
            let b = aabb;

            if (a.left > b.right || a.right < b.left) Xoverlap = false;
            if (a.bottom > b.top || a.top < b.bottom) Yoverlap = false;
            if (a.front > b.back || b.back < b.front) Zoverlap = false;

            return Xoverlap || Yoverlap || Zoverlap;
        }

        /**
         * Returns signed distance between this box and p
         * @param {Vector3} p Test point
         */
        sdf(p: Vector3): number {
            let c = this.center;
            return max3(
                Math.abs(p.x - c.x) - this.width * 0.5,
                Math.abs(p.y - c.y) - this.height * 0.5,
                Math.abs(p.z - c.z) - this.depth * 0.5
            );
        }

        /**
         * Returns support mapping
         * @param {Vector3} n Check against support vector
         * @returns {Vector3}
         */
        support(n: Vector3): Vector3 {
            let c = this.center;
            return new Vector3(
                c.x + 0.5 * this.width * GTE.sign(n.x),
                c.y + 0.5 * this.height * GTE.sign(n.y),
                c.z + 0.5 * this.depth * GTE.sign(n.z)
            );
        }
    }
}
