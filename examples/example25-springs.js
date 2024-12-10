class StateVector {
    constructor() {
        this.x = Vector3.make();
        this.v = Vector3.make();
        this.a = Vector3.make();
        this.m = 1.0;
    }
}

function accum(a, b, bscale) {
    a.x += b.x * bscale;
    a.y += b.y * bscale;
    a.z += b.z * bscale;
}

class Simulation {
    constructor() {
        this.objects = [];
    }

    reset() {
        this.objects = [];
        for (let i = 0; i < 10; i++) {
            let sv = new StateVector();
            sv.x.x = i - 5;
            sv.x.y = -1;
            sv.v.y = 5;
            sv.a.y = -9.8;
            this.objects.push(sv);
        }
    }

    update(dt) {
        for (let sv of this.objects) {
            let drag = 1;
            if (sv.x.y > 1) {
                drag = 2.0;
            }

            if (sv.x.y > 0) {
                drag = 0.75;
            }

            accum(sv.v, sv.a, dt);
            accum(sv.x, sv.v, drag*dt);

            if (sv.x.y < -1) {
                sv.x.y = -1;
                sv.v.y = Math.random() * 5 + 2.5;
            }
        }
    }
}

class App {
    springsSetParams(k, d, m, x0, v0)
    {
        this.k = k;
        this.d = d;
        this.mass.m = m;
        this.x0 = x0;
        this.v0 = v0;
    }

    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        this.wall = new StateVector();
        this.mass = new StateVector();

        this.k = 0.5;
        this.d = 0.5;
        this.m = 0.0;
        this.x0 = 0.0;
        this.v0 = 0.0;
        this.totalTime = 0.0;


        let p = document.getElementById('desc');
        p.innerHTML = `This physics demonstration of bouncing blocks demonstrates
        applying the force of gravity with a random starting up velocity. When the
        block hits the bottom, a new up velocity is applied and the block is not
        allowed to descend below the floor.`;

        let controls = document.getElementById('controls');
        createRangeRow(controls, 'springD', 0.5, 0.0, 20.0, 0.05);
        createRangeRow(controls, 'springK', 0.5, 0.0, 2.0, 0.05);
        createRangeRow(controls, 'springM', 5.0, 0.0, 5.0, 0.1);
        createRangeRow(controls, 'springX0', 2.0, -5.0, 5.0, 0.1);
        createRangeRow(controls, 'springV0', 0.0, -5.0, 5.0, 0.1);
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let rect = this.xor.meshes.load('rect', 'models/smallrect.obj');
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
            this.d = getRangeValue('springD');
            this.m = getRangeValue('springM');
            this.k = getRangeValue('springK');
            this.x0 = getRangeValue('springX0');
            this.v0 = getRangeValue('springV0');
            //this.springsSetParams(this.k, this.d, this.m, this.x0, this.v0);
            this.totalTime = 0.0;
        }

        this.totalTime += dt;
        let t = this.totalTime;
        let m = this.m;
        let k = this.k;
        let d = this.d;
        let x0 = this.x0;
        let v0 = this.v0;

        
        if (m == 0.0) {
            // Massless Spring-Damper
            this.mass.x.x = this.x0 * Math.exp(-this.d/this.k * this.totalTime);
        } else if (k < 0.005) {
            // Massless Spring-Damper
            this.mass.x.x = x0 + v0 * m/d * (1 - Math.exp(-d/m * t));
        } else if (d < 0.005) {
            let C = Math.sqrt(x0*x0 + m/k * v0*v0);
            let phi = 0.0;
            this.mass.x.x = C * Math.cos(Math.sqrt(k/m) * t + phi);
        } else {
            let xi = d / (2 * Math.sqrt(k*m));
            let wn = 0.2 * Math.PI * Math.sqrt(1 - xi*xi);
            this.mass.x.x = Math.exp(-xi*wn*t)*Math.cos(wn*Math.sqrt(1-xi**2) * t)
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

            // for (let sv of this.sim.objects) {
            //     rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation3(sv.x));
            //     xor.meshes.render('rect', rc);
            // }

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0.0, 0.0, 0.0));
            xor.meshes.render('rect', rc);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(this.mass.x.x, 0.0, 0.0));
            xor.meshes.render('rect', rc);
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