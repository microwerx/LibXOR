/* global uiRangeRow createButtonRow createComboRow */
/// <reference path="../src/LibXOR.ts" />
/// <reference path="htmlutils.ts" />
/// <reference path="mathutils.ts" />

const INIT_AIR_DRAG = 0.0;
const INIT_G = 1.0;
const INIT_P = 2.0;
const INIT_OBJECTS = 50;
const INIT_CAMERA_DISTANCE = 0.14;
const MAXM_CAMERA_DISTANCE = 1.0;
const NUM_ITERATIONS_PER_FRAME = 1000;
const SPREAD = 0.0;
const GALAXY_RADIUS = 1.0;

const PRESET_GRAVITY = 0
const PRESET_MEDIUM_GRAVITY = 1
const PRESET_HEAVY_GRAVITY = 2
const PRESET_HEAVY_DRAG = 3
const PRESET_REPULSION = 4

function S() {
    // return Vector3.makeUnit(2.0 * Math.random() - 1.0, 2.0 * Math.random() - 1.0, 0.0);
    return Vector3.makeUnit(Math.random() - 0.5, Math.random() - 0.5, 0.0);
}

class StateVector {
    constructor() {
        this.x = Vector3.make();
        this.v = Vector3.make();
        this.a = Vector3.make();
        this.density = 5;
        this.radius = randbetween(0.15, 0.35);
        this.m = 0.5 * this.radius * this.radius * this.density;
        this.color = Vector3.make(Math.random(), Math.random(), Math.random());
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
        this.centerOfMass = Vector3.make();
    }

    syncControls() {
        this.drag = uiRangeRow("fAirDrag", INIT_AIR_DRAG, -0.99, 0.99, 0.01);
        const wtheta = uiRangeRow("fWindAngle", 0, -180, 180, 1);
        this.wind = GTE.vec3(Math.cos(wtheta), Math.sin(wtheta), 0.0);
        this.windspeed = uiRangeRow("fWindSpeed", 0, 0, 5, 0.1);
        const G = uiRangeRow("G", INIT_G, -10.0, 10.0, 0.1);
        this.G = G * 6.6740831e-11;
        this.p = uiRangeRow("p", INIT_P, -4, 4, 0.1);
        this.useCollisions = uiRangeRow("collisions", 0, 0, 1);
        this.numObjects = uiRangeRow("objects", INIT_OBJECTS, 1, 500);
        this.randoma = uiRangeRow("randoma", 0.0, 0.0, 10.0, 0.1);
        this.randomP = uiRangeRow("randomP", 0.0, 0.0, 1.0, 0.001);
        this.cameraDistance = uiRangeRow("cameraDistance", INIT_CAMERA_DISTANCE, 0.01, MAXM_CAMERA_DISTANCE, 0.01);
    }

    reset() {
        this.syncControls();

        let halfCount = this.numObjects / 2;

        this.objects = [];
        for (let i = 0; i < this.numObjects; i++) {
            let sv = new StateVector();
            let dice = Math.random();
            let dir = S();
            sv.x = dir.scale(GALAXY_RADIUS);
            if (i >= halfCount) {
                sv.x.x -= SPREAD;
            } else {
                sv.x.x += SPREAD;
            }

            sv.v = Vector3.make();
            let randomVelocities = true;
            if (randomVelocities) {
                // Add velocity to some of the objects.
                if (dice > 0.75) {
                    sv.v = S().scale(0.5 + Math.random());
                    sv.v.z = 0.0;
                }
            } else {
                let angle = Math.atan2(dir.y, dir.x);
                let distance = dir.length();
                let c = Math.cos(angle);
                let s = Math.sin(angle);
                sv.v = Vector3.make(c, s).scale(10.0);
            }
            let size = 0.5 + 0.5 * Math.random();
            sv.m = 4.0 / 3.0 * size * size * size * 1e9;
            sv.radius = 1.0;
            sv.a = Vector3.makeZero();
            sv.color = Vector3.make(Math.random(), Math.random(), Math.random());
            this.objects.push(sv);
            // hflog.info("SV: " + sv.x.x + " " + sv.x.y);
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
            // if (this.drag != 0.0) {}

            if (this.windspeed > 0.0) {
                accum(sv.a, (this.wind.sub(sv.v)), this.windspeed * this.drag / sv.m);
            }

            accum(sv.a, sv.v, -this.drag / dt);

            let v_before = sv.v.clone();
            accum(sv.v, sv.a, dt);
            let v_after = sv.v.clone();
            let v = (v_after.add(v_before)).scale(0.5);
            const MaxSpeed = 0.005;
            let vlen = v.length();
            if (vlen > MaxSpeed) {
                v = v.normalize().scale(MaxSpeed);
            }
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

                let r = o1.distanceTo(o2);
                let x = o2.dirTo(o1);
                let a = -G_a * o2.m / Math.pow(Math.max(r, 1.0), p);
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

    boundParticles(minValue = -2, maxValue = 2) {
        for (let sv of this.objects) {
            // let old = sv.x.clone();

            if (sv.x.x < minValue || sv.x.x > maxValue) sv.v.x = -sv.v.x;
            if (sv.x.y < minValue || sv.x.y > maxValue) sv.v.y = -sv.v.y;
            // Set Z = 0 to limit to plane physics.
            sv.x.z = 0;
            sv.v.z = 0;

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
    }

    update(dt) {
        this.syncControls();
        if (this.G != 0.0) {
            this.acceleratorOperators(this.G, this.p);
        }
        for (let i = 0; i < NUM_ITERATIONS_PER_FRAME; i++) {
            dt = 0.01666;//Math.min(dt, 0.1);
            this.calcSystemDynamics(dt);
            this.boundParticles(-100, 100);
            if (this.useCollisions > 0.5) this.detectCollisions();
        }
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        this.cameraDistance = 0.0;

        let p = document.getElementById('desc');
        p.innerHTML = `This app demonstrates the use of acceleration operators.`;

        let self = this;
        let controls = document.getElementById('controls');
        this.sim.reset();
        createButtonRow(controls, "bResetSim", "Reset Sim", () => {
            self.sim.reset();
        });

        createComboRow(controls, 'presets', ["Gravity", "Medium Gravity", "Heavy Gravity", "Heavy Drag", "Repulsion"], (index) => {
            self.loadPreset(index)
        })
    }

    /**
     * 
     * @param {number} index The index of the preset being loaded.
     */
    loadPreset(index) {
        setDivRowValue('fAirDrag', INIT_AIR_DRAG.toString());
        setDivRowValue('G', INIT_G);
        setDivRowValue('p', INIT_P);
        switch (index) {
            case PRESET_GRAVITY:
                break;
            case PRESET_MEDIUM_GRAVITY:
                setDivRowValue('G', 5.0);
                break;
            case PRESET_HEAVY_GRAVITY:
                setDivRowValue('p', 1.5);
                break;
            case PRESET_HEAVY_DRAG:
                setDivRowValue('fAirDrag', '0.99')
                setDivRowValue('G', 0.0);
                break;
            case PRESET_REPULSION:
                setDivRowValue('G', -INIT_G);
                break;
            default: break;
        }
        this.sim.syncControls();
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic-color.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let circle = this.xor.meshes.create('circle');
        circle.color3(pal.calcColor(pal.WHITE, pal.WHITE, 0, 0, 0, 0));
        circle.circle(0, 0, 0.5, 16);

        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BLACK));
        bg.rect(-250, -250, 250, 250);
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
        let cmatrix = Matrix4.makeOrbit(-90, 0, 1.0);
        const S = 0.1 * this.sim.cameraDistance;
        cmatrix.scale(S, S, S);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            // Calculate the center position of all the objects.
            this.centerOfMass = Vector3.makeZero();
            for (let i = 0; i < this.sim.objects.length; i++) {
                this.centerOfMass = Vector3.add(this.centerOfMass, this.sim.objects[i].x);
            }
            this.centerOfMass = this.centerOfMass.scale(1.0 / this.sim.objects.length);

            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation3(this.centerOfMass.scale(-1.0)));
            xor.meshes.render('bg', rc);

            for (let sv of this.sim.objects) {
                let P = sv.x.sub(this.centerOfMass)
                rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation3(P));
                rc.uniform3f('Kd', sv.color);
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