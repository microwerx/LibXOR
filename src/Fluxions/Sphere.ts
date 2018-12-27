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
    export class Sphere {
        public radius = 1.0;
        public center = Vector3.makeZero();

        constructor(radius: number, center: Vector3) {
            this.radius = radius;
            this.center = center.clone();
        }

        clone(): Sphere {
            return new Sphere(this.radius, this.center);
        }

        copy(s: Sphere): Sphere {
            this.radius = s.radius;
            this.center.copy(s.center);
            return this;
        }

        // signed distance function
        sdf(p: Vector3): number {
            return (p.sub(this.center)).length() - this.radius;
        }

        // support mapping
        support(n: Vector3): Vector3 {
            return n.mul(this.radius).add(this.center);
        }

        // return shortest distance between another sphere
        distance(s: Sphere): number {
            return this.center.distance(s.center);
        }

        intersectsSphere(s: Sphere): boolean {
            return this.distance(s) < this.radius + s.radius;
        }
    }
}
