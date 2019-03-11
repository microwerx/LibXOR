/// <reference path="../src/LibXOR.ts" />

class PhysicsConstants {
    constructor() {
        this.Mearth = 5.9722e24;
        this.Rearth = 6.3781e6;
        this.Rearth2 = 6.3781e6 * 6.3781e6;
        this.G = 6.674e-11;
        this.g = -this.Mearth * this.G / this.Rearth2;
        this.drag = 10.0;
        this.wind = 0.0;
    }
}

class PhysicsObject {
    constructor() {
        this.accelerations = [];
        this.x = GTE.vec3();
        this.a = GTE.vec3();
        this.v = GTE.vec3();
        this.m = 62.0; // average human mass
    }

    /**
     * update(dt)
     * @param {number} dt time in seconds elapsed since the last call
     * @param {PhysicsConstants} constants standard constants for physics calculations
     */
    update(dt, constants) {
        this.a = GTE.vec3(0.0, 0.0, 0.0);
        for (let i = 0; i < this.accelerations.length; i++) {
            this.a.accum(this.accelerations[i], 1.0);
        }

        this.v = GTE.vec3(
            0.5 * (this.v.x + this.a.x * dt + this.v.x),
            0.5 * (this.v.y + this.a.y * dt + this.v.y),
            0.5 * (this.v.z + this.a.z * dt + this.v.z)
        );

        this.x.accum(this.v, dt);
    }

    /**
     * 
     * @param {number} minx minimum x world coordinates
     * @param {number} maxx maximum x world coordinates
     * @param {number} miny minimum y world coordinates
     * @param {number} maxy maximum y world coordinates
     */
    bound(minx, maxx, miny, maxy) {
        this.x.x = GTE.clamp(this.x.x, minx, maxx);
        this.x.y = GTE.clamp(this.x.y, miny, maxy);
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `This graphics demonstration of a simple ray tracer demonstrates
        a signed distance function to render diverse objects.`;

        let c = document.getElementById('controls');
        c.appendChild(createRow('iSkyMode', '<input id="iSkyMode" type="range" min="0", max="5", value="1" />'));
        createRangeRow(c, 'iTurbidity', 1, 1, 10, 1);
        createRangeRow(c, 'iAlbedo', 0, 0, 10, 1, true);
        createRangeRow(c, 'fSigma2', 0.0, 0.0, 1.0, 0.05);
        createRangeRow(c, 'fSunInclination', 90, 0, 180, 1);
        createRangeRow(c, 'fSunAzimuth', 0, -360, 360, 1);

        this.leftright = 0.0;
        this.updown = 0.0;
        this.anybutton = 0.0;

        this.player = new PhysicsObject();
        this.constants = new PhysicsConstants();
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'basic.vert', 'basic.frag');
        rc.useDepthTest = true;

        let pal = this.xor.palette;
        let rect = this.xor.meshes.load('rect', 'rect.obj');
        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BROWN));
        bg.rect(-5, -1, 5, -5);
        bg.color3(pal.getColor(pal.YELLOW));
        bg.circle(2, 1.5, 0.25);
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;
        xor.input.poll();
        let resetSim = false;
        if (xor.input.checkKeys([" ", "Space"])) {
            resetSim = true;
        }
        for (let i = 0; i < 4; i++) {
            let gp = xor.input.gamepads.get(i);
            if (!gp.enabled) {
                continue;
            }
            this.updown = gp.updown;
            this.leftright = gp.leftright;
            this.anybutton = (gp.b0 + gp.b1 + gp.b2 + gp.b3) > 0.0 ? 1.0 : 0.0;
        }

        if (this.resetSim) {
            this.player.x = GTE.vec3();
        }
        if (this.updown) {}
        this.player.accelerations = [
            GTE.vec3(0.0, this.constants.g, 0.0),
            GTE.vec3(0.0, -this.updown * this.constants.g * 2, 0.0),
            GTE.vec3(this.leftright * 10.0, 0.0, 0.0),
            this.player.v.scale(-this.constants.drag)
        ];
        this.player.update(dt, this.constants);
        this.player.bound(-2.0, 2.0, -1.0, 2.0);
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

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation3(this.player.x));
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