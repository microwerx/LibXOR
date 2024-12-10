/* global uiRangeRow createButtonRow createRow */
/// <reference path="../src/LibXOR.ts" />
/// <reference path="htmlutils.js" />

const SHAPE_BOX = 0;
const SHAPE_CIRCLE = 1;
const SHAPE_CONCAVE = 2;
const NUM_SHAPE_TYPES = 2;

const MAX_MARCH_STEPS = 64;

const BOX_RADIUS = 1.0;
const CIRCLE_RADIUS = 0.75;
const BG_SIZE = 5;

const C_OFFSET1 = Vector3.make(0.0, 0.1, 0.0);
const C_OFFSET2 = Vector3.make(0.1, 0.0, 0.0)

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

/**
 * 
 * @param {Vector3} d 
 * @param {number} a
 * @returns {Vector3}
 */
function max(d, a) {
    return Vector3.make(Math.max(d.x, a), Math.max(d.y, a, Math.max(d.z, a)));
}

/**
 * 
 * @param {Vector3} v 
 * @returns {Vector3}
 */
function abs(v) {
    return Vector3.make(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z))
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
 * Returns the signed distance to a circle located at a position in world units.
 * @param {Vector3} p 
 * @param {number} radius 
 * @returns {number} The signed distance the circle.
 */
function sdfCircle(p, radius) {
    const d = p.length() - radius;
    return d;
}

/**
 * Returns the signed distance to a box located at a position in world units.
 * @param {Vector3} p 
 * @param {number} size 
 * @returns {number} The signed distance the circlbox.
 */
function sdfBox(p, size) {
    const q = abs(p).sub(Vector3.make(size, size, size));
    const d = max(q, 0.0).length() + Math.min(Math.max(q.x, Math.max(q.y, q.z)), 0.0);
    return d;
}


/**
 * Returns the signed distance to a shape.
 * @param {Vector3} p 
 * @param {number} size 
 * @returns {number} The signed distance the shape.
 */
function sdfConcave(p, size) {
    const d1 = sdfBox(p.sub(C_OFFSET1), size);
    const d2 = sdfCircle(p.sub(C_OFFSET2), size);
    return Math.min(d1, d2);
}

/**
 * 
 * @param {number} type The type of the shape.
 * @param {Vector3} position The world position of the shape.
 * @param {Vector3} p The world position of the point to test.
 * @param {number} size The size of the shape.
 * @returns {number} The signed distance between `p` and the shape.
 */
function sdf(type, position, p, size) {
    // Transform the test point by the position.
    const p_transformed = p.sub(position)
    if (type == SHAPE_BOX)
        return sdfBox(p_transformed, size);
    else if (type == SHAPE_CIRCLE)
        return sdfCircle(p_transformed, size);
    else if (type == SHAPE_CONCAVE)
        return sdfConcave(p_transformed, size);
    return 0;
}

/**
 *
 * @param {number} x
 * @returns {number} the sign of x: 1 if x >= 0, or 0 otherwise.
 */
function sign(x) {
    return x >= 0.0 ? 1.0 : -1.0
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

        this.type = randbetween(0, NUM_SHAPE_TYPES) | 0;
        this.collided = false;

        this.pointOnA = Vector3.makeZero();
    }

    /**
     * Detects whether the otherSV intersects our object
     * @param {StateVector} otherSV
     */
    detectCollision(otherSV) {
        let d = this.distanceTo(otherSV);
        if (d < 0)
            return true;
        return false;
        // let totalRadius = this.radius + otherSV.radius;
        // if (this.x.distance(otherSV.x) < totalRadius) {
        //     return true;
        // }
        // return false;
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
        const directionOfAtoB = this.x.dirTo(otherSV.x)

        // Calculate the distance from our shape to their center.
        const pointOnA = this.rayMarch(this.x, directionOfAtoB)
        const pointOnB = otherSV.rayMarch(otherSV.x, directionOfAtoB.negate())

        const distanceA = this.sdf(pointOnB)
        const distanceB = otherSV.sdf(pointOnA)

        otherSV.pointOnA = pointOnB;

        this.pointOnA = pointOnA.clone();

        return Math.max(distanceA, distanceB);

        // let totalRadius = this.radius + otherSV.radius;
        // return this.x.distance(otherSV.x) - totalRadius;
    }

    /**
     * 
     * @param {Vector3} p 
     * @returns {number}
     */
    sdf(p) {
        return sdf(this.type, this.x, p, this.radius)
    }

    /**
     * 
     * @param {Vector3} origin The origin of the ray.
     * @param {Vector3} direction The normalized direction of travel.
     * @returns {Vector3} The point on this surface.
     */
    rayMarch(origin, direction) {
        // Start out with the ray origin.
        let p = origin.clone()
        // Step a maximum of 10 rays.
        let i = 0;
        for (; i < MAX_MARCH_STEPS; i++) {
            // Calculate the signed distance.
            const d = Math.abs(this.sdf(p))
            // Stop if the ray is near the surface.
            if (d < 0.00001)
                break
            // Move along the ray.
            p.accum(direction, d);
        }
        if (i == MAX_MARCH_STEPS)
            return Vector3.make(1000, 1000, 1000)
        return p
    }
}

class Simulation {
    constructor() {
        /**
         * @type {StateVector[]} objects
         */
        this.objects = [];
    }

    syncControls() {
        // Try G = 9, numObjects = 50, rA = 4, rP = 1
        this.drag = uiRangeRow("fAirDrag", 0.00, -0.99, 0.99, 0.01);
        const wtheta = uiRangeRow("fWindAngle", 0, -180, 180, 1);
        this.wind = GTE.vec3(Math.cos(wtheta), Math.sin(wtheta), 0.0);
        this.windspeed = uiRangeRow("fWindSpeed", 0, 0, 5, 0.1);
        const G = uiRangeRow("G", 0.0, -10.0, 10.0, 0.1);
        this.G = G * 6.6740831e-11;
        this.p = uiRangeRow("p", 2, -4, 4, 0.1);
        this.useCollisions = uiCheckRow("collisions", true);
        this.numObjects = uiRangeRow("objects", 125, 1, 500);
        this.randoma = uiRangeRow("randoma", 0.0, 0.0, 10.0, 0.1);
        this.randomP = uiRangeRow("randomP", 0.0, 0.0, 1.0, 0.001);
    }

    reset() {
        this.syncControls();

        this.objects = [];
        for (let i = 0; i < this.numObjects; i++) {
            let sv = new StateVector();
            let dice = Math.random();
            sv.x = S().scale(dice);
            sv.v = Vector3.make();//S().scale(Math.random());//Vector3.make(); //S();
            // if (dice > 0.75) {
            //     sv.v = S().scale(0.5 + Math.random());
            //     sv.v.z = sv.v.x;
            //     sv.v.x = sv.v.y;
            //     sv.v.y = sv.v.z;
            //     sv.v.z = 0.0;
            // }
            sv.m = ((Math.random() * 50) + 25) * 1e6;
            if (sv.type == SHAPE_BOX)
                sv.radius *= BOX_RADIUS;//sv.m / 1e9;// / 1000.0;
            else if (sv.type == SHAPE_CIRCLE)
                sv.radius *= CIRCLE_RADIUS;
            if (i == 0) {
                sv.x = Vector3.make();
                sv.v = Vector3.make();
                sv.m = 1e9;
                // sv.type = SHAPE_CONCAVE;
                // sv.radius = 1;
            }
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
            // if (this.drag != 0.0) {}

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

                let r = o1.distanceTo(o2);
                let x = o2.dirTo(o1);
                let a = -G_a * o2.m / Math.pow(Math.max(r, 1.0), p);
                accum(o1.a, x, a);
            }
        }
    }

    detectCollisions() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].collided = false;
        }

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
                        o1.collided = true;
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
        this.calcSystemDynamics(dt);
        this.boundParticles(-100, 100);
        // if (this.useCollisions)
        this.detectCollisions();
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
        this.sim.reset();
        createButtonRow(controls, "bResetSim", "Reset Sim", () => {
            self.sim.reset();
        });
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic-color.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let dot = this.xor.meshes.create('dot');
        dot.color3(pal.calcColor(pal.WHITE, pal.WHITE, 0, 0, 0, 0));
        dot.circle(0, 0, 0.5, 16);

        let circle = this.xor.meshes.create('circle');
        circle.color3(pal.calcColor(pal.WHITE, pal.WHITE, 0, 0, 0, 0));
        circle.circle(0, 0, 1.0, 16);
        circle.color3(pal.getColor(pal.GOLD));
        circle.strokeCircle(0, 0, 1.0, 16);
        circle.line(0, 0, 1.0, 0.0);

        let box = this.xor.meshes.create('box');
        box.color3(pal.getColor(pal.WHITE));
        box.rect(-1, -1, 1, 1);
        box.color3(pal.getColor(pal.FORESTGREEN));
        box.strokeRect(-1, -1, 1, 1);
        box.line(0.0, 0.0, 1.0, 0.0);

        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BLACK));
        bg.rect(-BG_SIZE, -BG_SIZE, BG_SIZE, BG_SIZE);
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

        if (xor.input.mouseOver) {
            let w = xor.graphics.width;
            let h = xor.graphics.height;
            let x = xor.input.mouse.position.x / w;
            let y = xor.input.mouse.position.y / h;
            y = 1 - y;
            x = 2 * x - 1;
            y = 2 * y - 1;
            x *= BG_SIZE;
            y *= BG_SIZE;
            this.sim.objects[0].x.reset(x, y);
        }

        if (resetSim) {
            this.sim.reset();
        }

        this.sim.update(dt);
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.AZURE);
        let pal = this.xor.palette;

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('bg', rc);

            let i = 0;
            const White = new Vector3(1, 1, 1);
            const Yellow = new Vector3(1, 1, 0);
            const Red = new Vector3(1, 0, 0);
            for (let sv of this.sim.objects) {
                let m = Matrix4.makeIdentity();
                m.multMatrix(Matrix4.makeTranslation3(sv.x));
                const R = sv.radius;
                m.multMatrix(Matrix4.makeScale(R, R, R));
                rc.uniformMatrix4f('WorldMatrix', m);
                if (i == 0) {
                    rc.uniform3f('Kd', Yellow);
                } else {
                    rc.uniform3f('Kd', White);
                }

                switch (sv.type) {
                    case SHAPE_BOX:
                        rc.uniform3f('Kd', pal.getColor(pal.GREEN));
                        xor.meshes.render('box', rc);
                        break;
                    case SHAPE_CIRCLE:
                        xor.meshes.render('circle', rc);
                        break;
                    case SHAPE_CONCAVE:
                        {
                            rc.uniform3f('Kd', pal.getColor(pal.ROSE));

                            let m = Matrix4.makeIdentity();
                            m.multMatrix(Matrix4.makeTranslation3(sv.x));
                            const R = sv.radius;
                            // m.multMatrix(Matrix4.makeScale(R, R, R));
            
                            const m1 = m.clone().translate(C_OFFSET1.x, C_OFFSET1.y, C_OFFSET1.z).scale(R, R, R);
                            const m2 = m.clone().translate(C_OFFSET2.x, C_OFFSET2.y, C_OFFSET2.z).scale(R, R, R);
                            rc.uniformMatrix4f('WorldMatrix', m1);
                            xor.meshes.render('box', rc);
                            rc.uniformMatrix4f('WorldMatrix', m2);
                            xor.meshes.render('circle', rc);
                            rc.uniformMatrix4f('WorldMatrix', m);
                        }
                        break;
                    default:
                        xor.meshes.render('circle', rc);
                        break;
                }

                if (sv.collided) {
                    rc.uniform3f('Kd', Red);
                } else {
                    rc.uniform3f('Kd', White);
                }

                // Draw center point.
                {
                    let m = Matrix4.makeIdentity();
                    m.multMatrix(Matrix4.makeTranslation3(sv.x));
                    m.multMatrix(Matrix4.makeScale(0.1, 0.1, 0.1));
                    rc.uniformMatrix4f('WorldMatrix', m);
                    rc.uniform3f('Kd', Red);
                    xor.meshes.render('dot', rc);
                }

                // Draw center point.
                {
                    let m = Matrix4.makeIdentity();
                    m.multMatrix(Matrix4.makeTranslation3(sv.pointOnA));
                    m.multMatrix(Matrix4.makeScale(0.12, 0.12, 0.12));
                    rc.uniformMatrix4f('WorldMatrix', m);
                    rc.uniform3f('Kd', pal.getColor(pal.GOLD));
                    xor.meshes.render('dot', rc);
                }

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