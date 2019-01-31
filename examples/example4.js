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
    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        let p = document.getElementById('desc');
        p.innerHTML = `This graphics demonstration of a simple ray tracer demonstrates
        a miss shader used to render the sky and a closest hit shader to render the normal
        of the sphere in the center of the screen.`;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'raytracer.vert', 'raytracer.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let screen = this.xor.meshes.create('fullscreenquad');
        screen.color3(pal.getColor(pal.WHITE));
        screen.rect(0, 0, this.xor.graphics.width, this.xor.graphics.height);
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
        xor.graphics.clear(xor.palette.RED);

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();;
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform1f('iTime', xor.t1);
            rc.uniform1f('iTimeDelta', xor.dt);
            rc.uniform1i('iFrame', xor.frameCount);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('fullscreenquad', rc);
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