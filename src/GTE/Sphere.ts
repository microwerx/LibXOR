// Fluxions WebGL Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// See LICENSE for details.
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
