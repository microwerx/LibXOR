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
    }

    syncControls() {
        this.supportRadius = getRangeValue("fSupportRadius");
        let G = getRangeValue("G");
        let sign = G >= 0.0 ? 1.0 : -1.0;
        let mag = Math.abs(G);
        this.G = sign * Math.pow(10.0, mag - 5.0) * 6.6740831e-11;
        this.p = getRangeValue("p");
        this.useCollisions = getRangeValue("collisions");
        this.numObjects = getRangeValue("objects");
        this.randoma = getRangeValue("randoma");
        this.randomP = getRangeValue("randomP");
        this.drag = getRangeValue("fAirDrag");
        let wtheta = GTE.radians(getRangeValue("fWindAngle"));
        this.wind = GTE.vec3(Math.cos(wtheta), Math.sin(wtheta), 0.0);
        this.windspeed = getRangeValue("fWindSpeed");
    }

    reset() {
        this.syncControls();

        this.objects = [];
        for (let i = 0; i < this.numObjects; i++) {
            let sv = new StateVector();
            let dice = Math.random();
            sv.x = S().scale(dice);
            sv.v = Vector3.make();//S().scale(Math.random());//Vector3.make(); //S();
            if (dice > 0.75) {
                sv.v = S().scale(0.5 + Math.random());
                sv.v.z = sv.v.x;
                sv.v.x = sv.v.y;
                sv.v.y = sv.v.z;
                sv.v.z = 0.0;
            }
            sv.m = (Math.random() * 50) + 25;
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
            }

            if (this.windspeed > 0.0) {
                accum(sv.a, (this.wind.sub(sv.v)), this.windspeed * this.drag / sv.m);
            }

            accum(sv.a, sv.v, -this.drag);

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

                let w = this.sphW(o1, o2, this.supportRadius);
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

    /**
     * 
     * @param {StateVector} o1 
     * @param {StateVector} o2 
     * @param {number} supportRadius 
     */
    sphW(o1, o2, supportRadius) {
        let r = o1.distanceTo(o2);
        let rOverS = r / supportRadius;
        let C = 1.0 / (Math.PI * Math.pow(supportRadius, 3));
        if (0 <= rOverS && rOverS <= 1) {
            let rOverS2 = rOverS*rOverS;
            let rOverS3 = rOverS*rOverS2;
            return C * (1.0 - 1.5 * rOverS2 + 0.75 * rOverS3);
        }
        else if (rOverS <= 2) {
            return C * (0.25 * Math.pow(2 - rOverS, 3.0));
        }
        return 0;
    }

    sphKernel() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].d = 0.0;
        }
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = 0; j < this.objects.length; j++) {
                if (i == j) continue;
                let o1 = this.objects[i];
                let o2 = this.objects[j];

                let w = this.sphW(o1, o2, this.supportRadius);
                o1.d += w;
                o2.d += w;
            }
        }
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
        o1.v = o1.v.negate();
        o2.v = o2.v.negate();
    }

    update(dt) {
        this.syncControls();
        this.sphKernel();
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
        createRangeRow(controls, "fSupportRadius", 0.50, -0.99, 0.99, 0.01);
        createRangeRow(controls, "fAirDrag", 0.00, -0.99, 0.99, 0.01);
        createRangeRow(controls, "fWindAngle", 0, -180, 180, 1);
        createRangeRow(controls, "fWindSpeed", 0, 0, 5, 0.1);
        createRangeRow(controls, "G", 0.0, -10.0, 10.0, 0.1);
        createRangeRow(controls, "p", 2, -4, 4, 0.1);
        createRangeRow(controls, "collisions", 0, 0, 1);
        createRangeRow(controls, "objects", 10, 1, 500);
        createRangeRow(controls, "randoma", 0.0, 0.0, 10.0, 0.1);
        createRangeRow(controls, "randomP", 0.0, 0.0, 1.0, 0.001);
        createButtonRow(controls, "bResetSim", "Reset Sim", () => {
            self.sim.reset();
        });
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

        this.sim.update(dt);
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.AZURE);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('bg', rc);

            let i = 0;
            let total = this.sim.objects.length;
            for (let sv of this.sim.objects) {
                let m = Matrix4.makeTranslation3(sv.x);
                m.multMatrix(Matrix4.makeScale(2 * sv.radius, 2 * sv.radius, 2 * sv.radius));
                rc.uniformMatrix4f('WorldMatrix', m);
                let color = Vector3.make(sv.d/10.0, 0.0, 1.0);
                rc.uniform3f('kd', color);
                xor.meshes.render('circle', rc);
                i++;
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