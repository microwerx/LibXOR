/* global XOR Vector3 createButtonRow createRangeRow createCheckRow createDivRow setDivRowContents getCheckValue */
/// <reference path="LibXOR.js" />
/// <reference path="htmlutils.js" />

function accum(a, b, bscale) {
    a.x += b.x * bscale;
    a.y += b.y * bscale;
    a.z += b.z * bscale;
}

/**
 * Set speed limit on velocity vector
 * @param {Vector3} u 
 * @param {number} umagmax 
 */
function clampSpeed(u, umagmax) {
    let umag = u.length();
    if (umag > umagmax) {
        u.normalize();
        u.accum(u, umagmax);
    }
    return u;
}

let maxErrors = 100;
/**
 * 
 * @param {string} variable name of variable
 * @param {number} x value to check
 */
function checkFinite(variable, x) {
    if (!isFinite(x) && maxErrors-- >= 0) {
        hflog.error(variable, x);
    }
}

/**
 * 
 * @param {number} x 
 */
function makeFinite(x, msg) {
    if (!isFinite(x)) x = 0;
    if (maxErrors > 0) {
        hflog.error("makeFinite3: " + msg);
        maxErrors--;
    }
}

/**
 * 
 * @param {Vector3} v 
 */
function makeFinite3(v, msg) {
    if (!isFinite(v.x) || !isFinite(v.y) || !isFinite(v.z)) {
        v.reset();
        if (maxErrors > 0) {
            hflog.error("makeFinite3: ", msg);
            maxErrors--;
        }
        return false;
    }
    return true;
}

/**
 * 
 * @param {StateVector} o1 
 * @param {StateVector} o2 
 * @param {number} s 
 */
function sphW(o1, o2, s) {
    if (s == 0.0) {
        if (o1 === o2) return 1.0;
        else return 0.0;
    }
    let h = s * 1000.0;
    let r = o1.x.distance(o2.x);
    let q = r / s;
    let C = 1.0 / (Math.PI * Math.pow(h, 3));
    if (q <= 1) {
        let q2 = q * q;
        let q3 = q * q * q;
        return C * (1.0 - 1.5 * q2 + 0.75 * q3);
    }
    else if (q <= 2) {
        return C * (0.25 * Math.pow(2 - q, 3.0));
    }
    return 0;
}

/**
 * 
 * @param {StateVector} o1 object 1
 * @param {StateVector} o2 object 2
 * @param {number} s Support Radius
 */
function sphdW(o1, o2, s) {
    if (s == 0.0) {
        if (o1 === o2) return 1.0;
        else return 0.0;
    }
    let h = s * 1000.0;
    let r = o1.x.distance(o2.x);
    let q = r / s;
    let C = 1.0 / (Math.PI * Math.pow(h, 4));
    if (q <= 1.0) {
        return C * 3.0 * q * (0.75 * q - 1.0);
    }
    else if (q <= 2) {
        return C * 1.5 * Math.pow(2.0 - q, 2.0);
    }
    return 0.0;
}

/**
 * 
 * @param {StateVector} o1 object 1
 * @param {StateVector} o2 object 2
 * @param {number} s Support Radius
 */
function sphddW(o1, o2, s) {
    if (s == 0.0) {
        if (o1 === o2) return 1.0;
        else return 0.0;
    }
    let h = s * 1000;
    let r = o1.x.distance(o2.x);
    let q = r / s;
    let C = 1.0 / (Math.PI * Math.pow(h, 5.0));
    if (q <= 1.0) {
        return C * 3.0 * (1.5 * q - 1.0);
    }
    else if (q <= 2) {
        return C * 1.5 * (2.0 - q);
    }
    return 0.0;
}

/**
 * 
 * @param {number} mu
 * @param {number} sigma
 * @returns {number}
 */
function randomg(mu, sigma) {
    let u1 = 0.0;
    let u2 = 0.0;
    let epsilon = 1e-6;
    do {
        u1 = Math.random();
        u2 = Math.random();
    } while (u1 <= epsilon);
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    //let z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0*Math.PI * u2);
    return z0 * sigma + mu;
}

/**
 * 
 * @param {number} fmean 
 * @param {number} fsigma 
 * @returns {number} A uniform variable between mean - sigma and mean + sigma
 */
function randomu(fmean, fsigma) {
    return Math.random() * (2 * fsigma) + fmean;
}
/**
 * 
 * @param {Vector3} v 
 * @param {number} minValue 
 * @param {number} maxValue 
 */
function clamp3(v, minValue, maxValue) {
    return Vector3.make(
        GTE.clamp(v.x, minValue, maxValue),
        GTE.clamp(v.y, minValue, maxValue),
        GTE.clamp(v.z, minValue, maxValue)
    );
}

function randbetween(a, b) {
    return Math.random() * (b - a) + a;
}

function S() {
    return Vector3.makeUnit(Math.random() - 0.5, Math.random() - 0.5, 0); //Math.random() - 0.5);
}

class StateVector {
    constructor() {
        this.x = Vector3.make();
        this.v = Vector3.make();
        this.a = Vector3.make();
        this.density = 5;
        this.radius = randbetween(0.15, 0.35);
        this.m = 0.5 * this.radius * this.radius * this.density;
        this.d = 0.0;
        this.p = 0.0;   // pressure
        this.u = Vector3.make();    // fluid velocity
        this.pgrad = 0.0;           // pressure gradient
        this.ugrad = Vector3.make();
        this.uviz = 0.0;
        this.pviz = 0.0;
        this.oldx = Vector3.make();
    }

    /**
     * Detects whether the otherSV intersects our object
     * @param {StateVector} otherSV 
     */
    detectCollision(otherSV) {
        let totalRadius = this.radius + otherSV.radius;
        if (this.x.distance(otherSV.x) < totalRadius) {
            return true;
        }
        return false;
    }

    /**
     * Detects whether the otherSV intersects our object
     * @param {StateVector} otherSV 
     */
    softDetectCollision(otherSV) {
        let totalRadius = 0.1 * this.radius + otherSV.radius;
        if (this.x.distance(otherSV.x) < totalRadius) {
            return true;
        }
        return false;
    }

    /**
     * Moves this state vector object in a direction amount units.
     * @param {Vector3} dir 
     * @param {number} amount 
     */
    moveBy(dir, amount) {
        accum(this.x, dir, amount);
    }

    /**
     * Returns the direction from this object to another object
     * @param {StateVector} otherSV 
     * @returns {Vector3} returns the direction from this object
     */
    dirTo(otherSV) {
        return otherSV.x.sub(this.x).normalize();
    }

    /**
     * distanceTo returns the signed distance from this object to the other objects center point.
     * @param {StateVector} otherSV 
     * @returns {number} distance from the other objects center point
     */
    distanceTo(otherSV) {
        let totalRadius = this.radius + otherSV.radius;
        return this.x.distance(otherSV.x) - totalRadius;
    }
}

class Simulation {
    constructor() {
        /**
         * @type {StateVector[]} objects
         */
        this.objects = [];
        this.drag = 0.0;
        this.wind = Vector3.make();
        this.numObjects = 100;
        this.G = 0.0;
        this.sphgravity = false;
        this.p = 2;
        this.useCollisions = false;
        this.randoma = 0.0;
        this.randomP = 0.0;
        this.windspeed = 0.0;
        this.supportRadius = 0.5;
        this.fMassMean = 5.0;
        this.fMassSigma = 1.0;
        this.fInitialP = 0.75;
        this.density = 1.0;     // water, basaltic 2.65
        this.pMin = 0.0;
        this.pMax = 0.0;
        this.uMin = 0.0;
        this.uMax = 0.0;
        this.Ks = 2.2e9;          // bulk modulus (normally measured in GPa)
        this.c2 = this.Ks / this.density;
        this.nu = 1.0;
        this.minBoundValue = -2;
        this.maxBoundValue = 2;
        this.vizGradients = false;
    }

    syncControls() {
        setDivRowContents("U", "Min: " + this.uMin.toExponential(5) + " -- " + "Max: " + this.uMax.toExponential(5));
        setDivRowContents("p", "Min: " + this.pMin.toExponential(5) + " -- " + "Max: " + this.pMax.toExponential(5));
        this.vizGradients = getCheckValue("bGradients");

        this.supportRadius = getRangeValue("fSupportRadius");
        this.density = Math.exp(getRangeValue("fDensity"));
        this.Ks = 1e9 * (Math.max(0.000142, getRangeValue("fKs")));
        this.c2 = this.Ks / this.density;
        this.nu = Math.pow(10.0, getRangeValue("fnu"));
        let G = getRangeValue("G");
        let sign = G >= 0.0 ? 1.0 : -1.0;
        let mag = Math.abs(G);
        this.sphgravity = G > 0.0;
        this.G = sign * Math.pow(10.0, mag - 5.0) * 6.6740831e-11;
        this.useCollisions = getRangeValue("collisions");
        this.numObjects = getRangeValue("objects");
        this.randoma = getRangeValue("randoma");
        this.randomP = getRangeValue("randomP");
        this.drag = getRangeValue("fDrag");
        let wtheta = GTE.radians(getRangeValue("fWindAngle"));
        this.wind = GTE.vec3(Math.cos(wtheta), Math.sin(wtheta), 0.0);
        this.windspeed = getRangeValue("fWindSpeed");
        this.fMassMean = getRangeValue("fMassMean");
        this.fMassSigma = getRangeValue("fMassSigma");
        this.fInitialP = getRangeValue("fInitialP");
    }

    reset() {
        this.syncControls();

        this.objects = [];
        this.sphW = new Array(this.numObjects);
        this.sphdW = new Array(this.numObjects);
        this.sphddW = new Array(this.numObjects);
        for (let i = 0; i < this.numObjects; i++) {
            this.sphW[i] = new Array(this.numObjects);
            this.sphdW[i] = new Array(this.numObjects);
            this.sphddW[i] = new Array(this.numObjects);

            let sv = new StateVector();
            let dice = Math.random();
            sv.x = S().scale(dice);
            sv.v = Vector3.make();
            let eta;
            if (this.fMassSigma < 0) {
                eta = randomu(this.fMassMean, this.fMassSigma);
            } else {
                eta = randomg(this.fMassMean, this.fMassSigma);
            }
            sv.radius = eta / 1000.0;
            sv.m = sv.radius * sv.radius * Math.PI * this.density;
            sv.a = Vector3.make();
            this.objects.push(sv);
        }
        this.detectCollisions();
    }

    /**
     * 
     * @param {number} dt 
     */
    calcSystemDynamics(dt) {
        for (let sv of this.objects) {
            sv.a.reset();
            if (this.randomP > 0.0 && Math.random() < this.randomP) {
                sv.a = S().scale(Math.random() * this.randoma);
            }

            // drag
            if (this.drag != 0.0) {
                accum(sv.a, sv.v, -this.drag);
            }

            if (this.windspeed > 0.0) {
                accum(sv.a, (this.wind.sub(sv.v)), this.windspeed * this.drag / sv.m);
            }

            let v_before = sv.v.clone();
            accum(sv.v, sv.a, dt);
            let v_after = sv.v.clone();
            let v = (v_after.add(v_before)).scale(0.5);
            v.x = GTE.clamp(v.x, -10, 10);
            v.y = GTE.clamp(v.y, -10, 10);
            v.z = GTE.clamp(v.z, -10, 10);
            accum(sv.x, v, dt);
        }
    }

    /**
     * 
     * @param {number} G_a Gravitational constant = 6.6740831e-11
     * @param {number} p   Distance Falloff Exponent = 2
     */
    acceleratorOperators(G_a = 6.6740831e-11, p = 2) {
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            o1.a.reset();
            for (let j = 0; j < this.objects.length; j++) {
                if (i == j) continue;
                let o2 = this.objects[j];

                let w = this.sphW[i][j];
                if (w <= 0.0) continue;

                let r = o1.distanceTo(o2);
                let x = o2.dirTo(o1);
                let a = -G_a * o1.m * o2.m / Math.pow(Math.max(r, 1.0), p);
                accum(o1.a, x, a);
            }
        }
    }

    detectCollisions() {
        let recheck = false;
        do {
            recheck = false;
            for (let i = 0; !recheck && i < this.objects.length; i++) {
                for (let j = i + 1; !recheck && j < this.objects.length; j++) {
                    if (i == j) continue;
                    let o1 = this.objects[i];
                    let o2 = this.objects[j];

                    if (o1.detectCollision(o2)) {
                        this.respondToCollision(o1, o2);
                    }
                }
            }
        } while (recheck);
    }

    sphInit() {
        this.pMin = 1e12;
        this.pMax = -1e12;
        this.uMin = 1e12;
        this.uMax = -1e12;
        let bbox = new GTE.BoundingBox();
        let i = 0;
        for (let sv of this.objects) {
            sv.d = 0.0;
            sv.oldx.copy(sv.x);
            // sv.m = sv.radius * sv.radius * Math.PI * this.density;
            sv.m = 4.1887902 * Math.pow(sv.radius, 3) * this.density;
            sv.density = this.density;
            sv.pgrad = Vector3.make();
            sv.ugrad = Vector3.make();
            bbox.add(this.objects[i].x);
            i++;
        }
        this.c2 = this.Ks / this.density;
    }

    sphDensitiesPressures() {
        let w = 0;
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            for (let j = 0; j < this.objects.length; j++) {
                let o2 = this.objects[j];

                w = sphW(o1, o2, o1.radius + this.supportRadius);
                let dw = sphdW(o1, o2, o1.radius + this.supportRadius);
                let ddw = sphddW(o1, o2, o1.radius + this.supportRadius);
                this.sphW[i][j] = w;
                this.sphdW[i][j] = dw;
                this.sphddW[i][j] = ddw;

                // calculate density
                // if (i == j) continue;
                o1.density += o2.m * w;
            }
            // Density is measured kg/m**3
            // calculate reference density
            let rho_0 = this.density;
            // m**2/s**2 * (kg/m**3 - kg/m**3) is kg / (m s**2) (Pa)
            o1.p = this.c2 * (o1.density - rho_0);
        }
    }

    sphPressureGradient() {
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            for (let j = 0; j < this.objects.length; j++) {
                let dw = this.sphdW[i][j];
                if (dw == 0.0) continue;
                let o2 = this.objects[j];
                let rhoSquared1 = o1.density * o1.density;
                let rhoSquared2 = o2.density * o2.density;
                let ximinusxj = Vector3.sub(o1.x, o2.x);
                o1.pgrad.accum(ximinusxj, -o2.m * (o1.p / rhoSquared1 + o2.p / rhoSquared2) * dw);
                makeFinite3(o1.pgrad, "pgrad");
            }
        }
    }

    sphDiffusion() {
        // if (this.nu <= 100.0) return;
        let nu_over_density = this.nu / this.density;
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            for (let j = 0; j < this.objects.length; j++) {
                let ddw = this.sphddW[i][j];
                if (ddw == 0.0) continue;
                let o2 = this.objects[j];
                let ujminusui = Vector3.sub(o2.u, o1.u);
                // o1.ugrad.accum(ujminusui, this.nu * ddw * o2.m / this.density);
                o1.ugrad.accum(ujminusui, nu_over_density * ddw * o2.m);
                // makeFinite3(o1.ugrad, "ugrad");
            }
        }
    }

    /**
     * 
     * @param {number} dt 
     */
    sphApplyForces(dt) {
        // this.objects.sort(function (a, b) {
        //     return a.x.y < b.x.y;
        // });
        let halfdt = 0.5 * dt;
        let c = Math.sqrt(this.c2);
        let i = 0;
        for (let sv of this.objects) {
            let oldU = sv.u.clone();
            let oldA = sv.a.clone();
            let oldX = sv.x.clone();

            // makeFinite3(sv.u, "ubefore");

            let forces = sv.pgrad.add(sv.ugrad);

            if (this.sphgravity) {
                forces.accum(Vector3.make(0.0, -9.8, 0.0), 1.0);
            }

            if (this.drag > 0.0) {
                forces.accum(sv.u, -this.drag);
            }

            sv.a.copy(forces);
            sv.u.accum(sv.a, halfdt);
            clampSpeed(sv.u, 0.1 * c);
            sv.x.accum(sv.u, dt);
            sv.u.accum(sv.a, halfdt);
            clampSpeed(sv.u, 0.1 * c);

            // makeFinite3(sv.u, "uafter");

            let umag = sv.u.length();
            // this.uMin = Math.min(this.uMin, umag);
            // this.uMax = Math.max(this.uMax, umag);
            sv.uviz = this.vizGradients ? sv.ugrad.length() : sv.u.length();
            //sv.uviz = this.sphddW[i][0];
            this.uMin = Math.min(this.uMin, sv.uviz);
            this.uMax = Math.max(this.uMax, sv.uviz);
            sv.pviz = this.vizGradients ? sv.pgrad.length() : sv.p;
            this.pMin = Math.min(this.pMin, sv.pviz);
            this.pMax = Math.max(this.pMax, sv.pviz);
            let o1 = sv;
            let collisionFound = true;
            let maxTries = 2;
            while (collisionFound && maxTries-- > 0) {
                collisionFound = false;
                for (let j = 0; j < this.objects.length; j++) {
                    if (i == j) continue;
                    let o2 = this.objects[j];
                    let tries = 5;
                    while (tries-- > 0 && o1.detectCollision(o2)) {
                        this.respondToCollision(o1, o2);
                        this.sphBoundParticle(o1);
                        this.sphBoundParticle(o2);
                        collisionFound = true;
                    }
                }
            }

            // Two approaches here: Either figure out the actual velocity travelled
            // based on the position -OR- use the direction the particle actually
            // travelled but at its calculated velocity

            // let v = sv.x.sub(oldX).scale(1.0/dt);
            let v = sv.x.sub(oldX).normalize().scale(umag);
            sv.u.copy(v);
            i++;
        }
    }

    sphBoundParticles() {
        for (let sv of this.objects) {
            let min = this.minBoundValue + sv.radius;
            let max = this.maxBoundValue - sv.radius;
            if (sv.x.x < min && sv.u.x < 0) sv.u.x = -sv.u.x;
            if (sv.x.y < min && sv.u.y < 0) sv.u.y = -sv.u.y;
            if (sv.x.x > max && sv.u.x > 0) sv.u.x = -sv.u.x;
            if (sv.x.y > max && sv.u.y > 0) sv.u.y = -sv.u.y;
            sv.x = clamp3(sv.x, min, max);
        }
    }

    sphBoundParticle(sv) {
        let min = this.minBoundValue + sv.radius;
        let max = this.maxBoundValue - sv.radius;
        if (sv.x.x < min && sv.u.x < 0) sv.u.x = -sv.u.x;
        if (sv.x.y < min && sv.u.y < 0) sv.u.y = -sv.u.y;
        if (sv.x.x > max && sv.u.x > 0) sv.u.x = -sv.u.x;
        if (sv.x.y > max && sv.u.y > 0) sv.u.y = -sv.u.y;
        sv.x = clamp3(sv.x, min, max);
    }

    sph(timeElapsed) {
        this.sphInit();
        this.sphDensitiesPressures();
        this.sphPressureGradient();
        this.sphDiffusion();
        let dt = 0.01;
        for (let t = 0; t < timeElapsed; t += dt) {
            this.sphApplyForces(dt);
            this.sphBoundParticles();
        }
    }

    boundParticles(minValue = -2, maxValue = 2) {
        for (let sv of this.objects) {
            let min = minValue + sv.radius;
            let max = maxValue - sv.radius;

            if (sv.x.x < min && sv.u.x < 0) sv.v.x = -sv.v.x;
            if (sv.x.y < min && sv.u.y < 0) sv.v.y = -sv.v.y;
            if (sv.x.x > max && sv.u.x > 0) sv.v.x = -sv.v.x;
            if (sv.x.y > max && sv.u.y > 0) sv.v.y = -sv.v.y;

            if (sv.x.x < min && sv.u.x < 0) sv.u.x = -sv.u.x;
            if (sv.x.y < min && sv.u.y < 0) sv.u.y = -sv.u.y;
            if (sv.x.x > max && sv.u.x > 0) sv.u.x = -sv.u.x;
            if (sv.x.y > max && sv.u.y > 0) sv.u.y = -sv.u.y;

            sv.x = clamp3(sv.x, min, max);
        }
    }

    /**
     * Handles the response to collision between object 1 and 2
     * @param {StateVector} o1 Object 1
     * @param {StateVector} o2 Object 2
     */
    respondToCollisionNoElastic(o1, o2) {
        let dirTo = o1.dirTo(o2);
        let distance = o1.distanceTo(o2);
        let moveByAmount = Math.abs(distance);
        //o1.moveBy(dirTo, -moveByAmount);
        o2.moveBy(dirTo, moveByAmount);
    }

    /**
     * Handles the response to collision between object 1 and 2
     * @param {StateVector} o1 Object 1
     * @param {StateVector} o2 Object 2
     */
    respondToCollision(o1, o2) {
        let dirTo = o1.dirTo(o2);
        let distance = o1.distanceTo(o2);
        let moveByAmount = 0.5 * Math.abs(distance);
        o1.moveBy(dirTo, -moveByAmount);
        o2.moveBy(dirTo, moveByAmount);

        // elastic collision
        let totalMass = o1.m + o2.m;
        let v1minusv2 = Vector3.sub(o1.v, o2.v);
        let v2minusv1 = Vector3.sub(o2.v, o1.v);
        let x1minusx2 = Vector3.sub(o1.x, o2.x);
        let x2minusx1 = Vector3.sub(o2.x, o1.x);
        let dSquared1 = x1minusx2.lengthSquared();
        let dSquared2 = x2minusx1.lengthSquared();
        let b1 = -2 * o2.m;
        let b2 = -2 * o1.m;
        if (dSquared1 > 0.0) b1 *= Vector3.dot(v1minusv2, x1minusx2) / (totalMass * dSquared1);
        if (dSquared2 <= 0.0) b2 *= Vector3.dot(v2minusv1, x2minusx1) / (totalMass * dSquared2);
        o1.v.accum(x1minusx2, b1);
        o2.v.accum(x2minusx1, b2);
    }

    /**
     * Handles the response to collision between object 1 and 2
     * @param {StateVector} o1 Object 1
     * @param {StateVector} o2 Object 2
     */
    softRespondToCollision(o1, o2) {
        let dirTo = o1.dirTo(o2);
        let distance = o1.distanceTo(o2);
        let moveByAmount = 0.05 * Math.abs(distance);
        o1.moveBy(dirTo, -moveByAmount);
        o2.moveBy(dirTo, moveByAmount);

        // elastic collision
        let totalMass = o1.m + o2.m;
        let v1minusv2 = Vector3.sub(o1.u, o2.u);
        let v2minusv1 = Vector3.sub(o2.u, o1.u);
        let x1minusx2 = Vector3.sub(o1.x, o2.x);
        let x2minusx1 = Vector3.sub(o2.x, o1.x);
        let dSquared1 = x1minusx2.lengthSquared();
        let dSquared2 = x2minusx1.lengthSquared();
        let b1 = -2 * o2.m;
        let b2 = -2 * o1.m;
        if (dSquared1 > 0.0) b1 *= Vector3.dot(v1minusv2, x1minusx2) / (totalMass * dSquared1);
        if (dSquared2 <= 0.0) b2 *= Vector3.dot(v2minusv1, x2minusx1) / (totalMass * dSquared2);
        o1.u.accum(x1minusx2, b1);
        o2.u.accum(x2minusx1, b2);
    }

    update(dt) {
        this.syncControls();
        this.sph(dt);

        // TODO: Enable the previous acceleration operators from previous examples

        // if (this.G != 0.0) {
        //     this.acceleratorOperators(this.G, this.p);
        // }
        // this.calcSystemDynamics(dt);
        // this.boundParticles(this.minBoundValue, this.maxBoundValue);
        // if (this.useCollisions > 0.5) this.detectCollisions();
    }

    moveParticle(index, x, y) {
        if (this.objects.length > index) {
            this.objects[index].x.x = GTE.clamp(x, this.minBoundValue, this.maxBoundValue);
            this.objects[index].x.y = GTE.clamp(y, this.minBoundValue, this.maxBoundValue);
            this.detectCollisions();
        }
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        let p = document.getElementById('desc');
        p.innerHTML = `<p>This app demonstrates smoothed particle hydrodynamics.</p>`;

        let self = this;
        let controls = document.getElementById('controls');
        createButtonRow(controls, "bResetSim", "Reset Sim", () => {
            self.sim.reset();
        });
        createCheckRow(controls, "bGradients", false);
        createCheckRow(controls, "bUMag", true);
        createCheckRow(controls, "bPMag", true);
        createDivRow(controls, "U");
        createDivRow(controls, "p");
        createRangeRow(controls, "fSupportRadius", 0.1, 0.0, 2.0, 0.05);
        createRangeRow(controls, "fDensity", 7.00, 0.0, 10.0, 0.1);
        createRangeRow(controls, "fKs", 2.2, 0.0, 10.0, 0.1);
        createRangeRow(controls, "fnu", 14.0, 12.0, 15.5, 0.1);
        createRangeRow(controls, "fDrag", 0.00, -0.99, 0.99, 0.01);
        // createRangeRow(controls, "fWindAngle", 0, -180, 180, 1);
        // createRangeRow(controls, "fWindSpeed", 0, 0, 5, 0.1);
        createRangeRow(controls, "G", 1.0, -10.0, 10.0, 0.1);
        createRangeRow(controls, "p", 2, -4, 4, 0.1);
        // createRangeRow(controls, "collisions", 0, 0, 1);
        createRangeRow(controls, "objects", 500, 1, 1000);
        // createRangeRow(controls, "randoma", 0.0, 0.0, 10.0, 0.1);
        // createRangeRow(controls, "randomP", 0.0, 0.0, 1.0, 0.001);
        createRangeRow(controls, "fMassMean", 25.0, 0.0, 100.0, 1.0);
        createRangeRow(controls, "fMassSigma", 10.0, -25.0, 25.0, 0.1);
        // createRangeRow(controls, "fInitialP", 1.0, 0.0, 1.0, 0.05);

        this.visualizeU = false;
        this.visualizeP = false;
        this.vizParticle = null;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/particles.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        this.xor.meshes.load('rect', 'models/smallrect.obj');
        let spiral = this.xor.meshes.create('spiral');
        spiral.color3(pal.calcColor(pal.BROWN, pal.BLACK, 2, 0, 0, 0));
        spiral.spiral(1.0, 4.0, 64.0);

        let circle = this.xor.meshes.create('circle');
        circle.color3(pal.calcColor(pal.WHITE, pal.WHITE, 0, 0, 0, 0));
        circle.circle(0, 0, 1.0, 16);

        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BLACK));
        bg.rect(-5, -5, 5, 5);
        this.sim.reset();
        this.vizParticle = this.sim.objects[0];
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;
        let resetSim = false;
        if (xor.input.checkKeys([" ", "Space"])) {
            resetSim = true;
        }

        if (xor.input.mouseOver) {
            let w = xor.graphics.width;
            let h = xor.graphics.height;
            let x = xor.input.mouse.position.x;
            let y = xor.input.mouse.position.y;
            this.sim.moveParticle(0, 4 * (x - w / 2) / w, -4 * (y - h / 2) / h);
        }

        this.visualizeU = getCheckValue("bUMag");
        this.visualizeP = getCheckValue("bPMag");

        if (resetSim) {
            this.sim.reset();
            this.vizParticle = null;
            this.vizParticle = this.sim.objects[0];
        }

        this.sim.update(0.016);
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(XOR.Color.BROWN, XOR.Color.WHITE, 5);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            //xor.meshes.render('bg', rc);

            let p1 = this.sim.pMin;
            let p2 = this.sim.pMax;
            let pTotal = Math.max(p2 - p1, p1 + 0.1);
            let u1 = this.sim.uMin;
            let u2 = this.sim.uMax;
            let uTotal = Math.max(u2 - u1, u1 + 5.0);


            let i = 0;
            // {
            //     let sr = this.sim.supportRadius;
            //     let sv = this.sim.objects[0];
            //     //this.vizParticle;
            //     let m = Matrix4.makeTranslation3(sv.x);
            //     m.multMatrix(Matrix4.makeScale(sv.radius + sr, sv.radius + sr, sv.radius + sr));
            //     rc.uniformMatrix4f('WorldMatrix', m);
            //     let color = Vector3.make(0.0, 0.0, 0.0);
            //     rc.uniform3f('kd', color);
            //     xor.meshes.render('circle', rc);
            // }

            for (let sv of this.sim.objects) {
                let pmag = (sv.p - p1) / pTotal;
                let umag = (sv.uviz - u1) / uTotal;
                let r = (this.visualizeP) ? pmag : 0.0;
                let g = (this.visualizeU) ? umag : 0.0;
                let m = Matrix4.makeTranslation3(sv.x);
                m.multMatrix(Matrix4.makeScale(sv.radius, sv.radius, sv.radius));
                rc.uniformMatrix4f('WorldMatrix', m);
                let color = Vector3.make(r, g, 1.0);
                rc.uniform3f('kd', color);
                xor.meshes.render('circle', rc);
            }
        }
        xor.renderconfigs.use(null);
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            self.update(self.xor.dt);
            self.render();
            self.mainloop();
        });
    }
}

let app = new App();
app.init();
app.start();