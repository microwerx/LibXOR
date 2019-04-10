/* global LibXOR, hflog, Vector3, Matrix4 */
function accum(a, b, bscale) {
    a.x += b.x * bscale;
    a.y += b.y * bscale;
    a.z += b.z * bscale;
}

class StateVector {
    constructor() {
        this.x = Vector3.make();
        this.v = Vector3.make();
        this.a = Vector3.make();
        this.m = Math.random() * 5.0 + 1;
    }
}

class Simulation {
    constructor() {
        this.objects = [];
    }

    reset() {
        this.objects = [];
        for (let i = 0; i < 5; i++) {
            let sv = new StateVector();
            sv.x.x = i - 3;
            sv.x.y = -1;
            sv.v.y = 5;
            sv.a.y = -9.8;
            this.objects.push(sv);
        }
    }

    update(dt) {
        for (let sv of this.objects) {
            let v_wind = Vector3.makeUnit(-1, 0, 0);
            let drag = 0.51;

            if (sv.x.y > 1) {
                drag = 2.0;
            }

            if (sv.x.y > 0) {
                drag = 0.75;
            }

            // update Forces
            // a = F/m
            // F_air = dv
            // F_wind = d v_wind
            // F = F_gravity + F_air + F_wind
            // a = g - (d/m)(v_wind - v)

            sv.a = Vector3.make(0.0, -9.8, 0.0).add((v_wind.sub(sv.v).scale(drag / sv.m)));

            // Integrate using 1/2(v0 + v1)
            let v_before = sv.v.clone();
            accum(sv.v, sv.a, dt);
            let v_after = sv.v.clone();
            let v = (v_after.add(v_before)).scale(0.5);
            accum(sv.x, v, drag * dt);

            if (sv.x.y < -1) {
                sv.x.y = -1;
                sv.v.y = Math.random() * 5 + 2.5;
            }

            if (sv.x.x < -3) {
                sv.x.x = 3;
            } else if (sv.x.x > 3) {
                sv.x.x = -3;
            }
        }
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        let p = document.getElementById('desc');
        p.innerHTML = `This physics demonstration of bouncing blocks demonstrates
        applying the force of gravity with a random starting up velocity. When the
        block hits the bottom, a new up velocity is applied and the block is not
        allowed to descend below the floor. Additionally, we apply the force of
        wind and air resistance.`;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        this.xor.meshes.load('rect', 'models/smallrect.obj');
        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BROWN));
        bg.rect(-5, -1, 5, -5);
        bg.color3(pal.getColor(pal.YELLOW));
        bg.circle(2, 1.5, 0.25);
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

            for (let sv of this.sim.objects) {
                rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation3(sv.x));
                xor.meshes.render('rect', rc);
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