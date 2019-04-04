/* global Vector3 createButtonRow createRangeRow */
/// <reference path="LibXOR.js" />
/// <reference path="htmlutils.js" />

function accum(a, b, bscale) {
    a.x += b.x * bscale;
    a.y += b.y * bscale;
    a.z += b.z * bscale;
}

/**
 * 
 * @param {StateVector} o1 
 * @param {StateVector} o2 
 * @param {number} supportRadius 
 */
function sphW(o1, o2, supportRadius) {
    let r = o1.distanceTo(o2);
    let rOverS = r / supportRadius;
    let C = 1.0 / (Math.PI * Math.pow(supportRadius, 3));
    if (0 <= rOverS && rOverS <= 1) {
        let rOverS2 = rOverS * rOverS;
        let rOverS3 = rOverS * rOverS2;
        return C * (1.0 - 1.5 * rOverS2 + 0.75 * rOverS3);
    }
    else if (rOverS <= 2) {
        return C * (0.25 * Math.pow(2 - rOverS, 3.0));
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
    let r = o1.distanceTo(o2);
    let rOverS = r / s;
    let C = 1.0 / (Math.PI * Math.pow(s, 4));
    if (0.0 <= rOverS && rOverS <= 1.0) {
        return C * 3.0 * (-1.0 + 1.5 * rOverS);
    }
    else if (rOverS <= 2) {
        return C * 1.5 * Math.pow(2.0 - rOverS, 2.0);
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
    let r = o1.distanceTo(o2);
    let rOverS = r / s;
    let C = 1.0 / (Math.PI * Math.pow(s, 5.0));
    if (0.0 <= rOverS && rOverS <= 1.0) {
        return C * 3.0 * (-1.0 + 1.5 * rOverS);
    }
    else if (rOverS <= 2) {
        return C * 1.5 * (2.0 - rOverS);
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
        this.Ks = 2.2e9;          // bulk modulus (normally measured in GPa)
        this.c2 = this.Ks / this.density;
    }

    syncControls() {
        this.supportRadius = getRangeValue("fSupportRadius");
        this.density = getRangeValue("fDensity");
        this.Ks = getRangeValue("fKs");
        this.c2 = this.Ks / this.density;
        let G = getRangeValue("G");
        let sign = G >= 0.0 ? 1.0 : -1.0;
        let mag = Math.abs(G);
        this.G = sign * Math.pow(10.0, mag - 5.0) * 6.6740831e-11;
        this.p = getRangeValue("p");
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
            sv.v = Vector3.make();//S().scale(Math.random());//Vector3.make(); //S();
            if (dice > this.fInitialP) {
                sv.v = S().scale(0.5 + Math.random());
                sv.v.z = sv.v.x;
                sv.v.x = sv.v.y;
                sv.v.y = sv.v.z;
                sv.v.z = 0.0;
            }
            // sv.m = (Math.random() * 50) + 25;
            do {
                sv.m = randomg(this.fMassMean, this.fMassSigma);
            } while (sv.m < 0.0);
            sv.radius = sv.m / 1000.0;
            // if (i == 0) {
            //     sv.x = Vector3.make();
            //     sv.v = Vector3.make();
            //     sv.m = 100000000;                
            //     sv.radius = 1;
            // }
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
        this.pMin = 1e6;
        this.pMax = 1e-6;
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].d = 0.0;
            this.objects[i].density = 0.0;
            this.sphW[i][i] = 0.0;
        }
    }

    sphDensity() {
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            for (let j = 0; j < this.objects.length; j++) {
                //if (i == j) continue;
                let o2 = this.objects[j];

                let w = sphW(o1, o2, this.supportRadius);
                o1.d += w;
                o2.d += w;
                this.sphW[i][j] = w;
                if (w <= 0.0) continue;
                this.sphdW[i][j] = sphdW(o1, o2, this.supportRadius);
                this.sphddW[i][j] = sphddW(o1, o2, this.supportRadius);

                // calculate density
                o1.density += o2.m * w;
            }
            let rho_0 = this.density * 9.8 * (10 - o1.x.y);
            o1.p = this.c2 * (o1.density - rho_0);
            this.pMin = Math.min(o1.p, this.pMin);
            this.pMax = Math.max(o1.p, this.pMax);
        }
    }

    sphPressure() {
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            o1.pgrad = Vector3.make();
            for (let j = 0; j < this.objects.length; j++) {
                if (i == j) continue;
                let o2 = this.objects[j];

                if (this.sphW[i][j] <= 0.0) continue;

                let dw = this.sphdW[i][j];
                let rhoSquared1 = o1.density * o1.density;
                let rhoSquared2 = o2.density * o2.density;
                let ximinusxj = Vector3.sub(o1.x, o2.x);
                o1.pgrad.accum(ximinusxj, o2.m * (o1.p / rhoSquared1 + o2.p / rhoSquared2) * dw);
            }
        }
    }

    sphDiffusion() {
        for (let i = 0; i < this.objects.length; i++) {
            let o1 = this.objects[i];
            o1.ugrad.reset();
            for (let j = 0; j < this.objects.length; j++) {
                if (i == j) continue;
                let o2 = this.objects[j];

                if (this.sphW[i][j] <= 0.0) continue;

                let ddw = this.sphddW[i][j];
                let ujminusui = Vector3.sub(o2.u, o1.u);
                o1.ugrad.accum(ujminusui, ddw * o2.m / o1.density);
            }
        }
    }

    sphApplyForces() {
        let dt = 0.01;
        let halfdt = 0.5*dt;
        for (let sv of this.objects) {
            sv.a.copy(sv.pgrad);
            sv.v.accum(sv.a, halfdt);
            sv.x.accum(sv.v, dt);
            sv.v.accum(sv.a, halfdt);
        }
    }

    sph() {
        this.sphInit();
        this.sphDensity();
        this.sphPressure();
        //this.sphDiffusion();
        this.sphApplyForces();
    }

    boundParticles(minValue = -2, maxValue = 2) {
        for (let sv of this.objects) {
            // let old = sv.x.clone();

            if (sv.x.x < minValue || sv.x.x > maxValue) sv.v.x = -sv.v.x;
            if (sv.x.y < minValue || sv.x.y > maxValue) sv.v.y = -sv.v.y;

            sv.x = clamp3(sv.x, minValue, maxValue);
            // if (old.distance(sv.x) > 0) {
            //     sv.x = S().scale(2 * Math.random());
            //     sv.v = S().scale(Math.random() * 0.1);
            // }
        }
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
        let b1 = -2 * o2.m * Vector3.dot(v1minusv2, x1minusx2) / (totalMass * dSquared1);
        let b2 = -2 * o1.m * Vector3.dot(v2minusv1, x2minusx1) / (totalMass * dSquared2);
        o1.v.accum(x1minusx2, b1);
        o2.v.accum(x2minusx1, b2);
    }

    update(dt) {
        this.syncControls();
        this.sph();
        if (this.G != 0.0) {
            this.acceleratorOperators(this.G, this.p);
        }
        this.calcSystemDynamics(dt);
        this.boundParticles();
        if (this.useCollisions > 0.5) this.detectCollisions();
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        let p = document.getElementById('desc');
        p.innerHTML = `This app demonstrates the use of acceleration operators.`;

        let self = this;
        let controls = document.getElementById('controls');
        createButtonRow(controls, "bResetSim", "Reset Sim", () => {
            self.sim.reset();
        });
        createRangeRow(controls, "fSupportRadius", 0.50, 0.0, 3.0, 0.01);
        createRangeRow(controls, "fDensity", 1.00, 0.0, 3.0, 0.1);
        createRangeRow(controls, "fKs", 2.2, 0.0, 3.0, 0.1);
        createRangeRow(controls, "fDrag", 0.00, -0.99, 0.99, 0.01);
        createRangeRow(controls, "fWindAngle", 0, -180, 180, 1);
        createRangeRow(controls, "fWindSpeed", 0, 0, 5, 0.1);
        createRangeRow(controls, "G", 0.0, -10.0, 10.0, 0.1);
        createRangeRow(controls, "p", 2, -4, 4, 0.1);
        createRangeRow(controls, "collisions", 0, 0, 1);
        createRangeRow(controls, "objects", 10, 1, 500);
        createRangeRow(controls, "randoma", 0.0, 0.0, 10.0, 0.1);
        createRangeRow(controls, "randomP", 0.0, 0.0, 1.0, 0.001);
        createRangeRow(controls, "fMassMean", 50.0, 0.0, 50.0, 0.1);
        createRangeRow(controls, "fMassSigma", 25.0, 0.0, 25.0, 0.1);
        createRangeRow(controls, "fInitialP", 0.75, 0.0, 1.0, 0.05);
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let rc = this.xor.renderconfigs.load('default', 'basic.vert', 'particles.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        this.xor.meshes.load('rect', 'rect.obj');
        let spiral = this.xor.meshes.create('spiral');
        spiral.color3(pal.calcColor(pal.BROWN, pal.BLACK, 2, 0, 0, 0));
        spiral.spiral(1.0, 4.0, 64.0);

        let circle = this.xor.meshes.create('circle');
        circle.color3(pal.calcColor(pal.WHITE, pal.WHITE, 0, 0, 0, 0));
        circle.circle(0, 0, 0.5, 16);

        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BLACK));
        bg.rect(-5, -5, 5, 5);
        this.sim.reset();
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

        if (resetSim) {
            this.sim.reset();
        }

        this.sim.update(0.016);
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.WHITE);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            //xor.meshes.render('bg', rc);

            let total = this.sim.pMax - this.sim.pMin;
            let p1 = this.sim.pMin;

            for (let sv of this.sim.objects) {
                let m = Matrix4.makeTranslation3(sv.x);
                m.multMatrix(Matrix4.makeScale(2 * sv.radius, 2 * sv.radius, 2 * sv.radius));
                rc.uniformMatrix4f('WorldMatrix', m);
                //let color = Vector3.make(sv.density / 1000.0, 0.0, 1.0);
                let color = Vector3.make((sv.p - p1) / total, 0.0, 1.0);
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