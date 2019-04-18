/// <reference path="LibXOR.js" />
/// <reference path="../src/LibXOR.ts" />
/* global Vector3 */

class Flame {
    constructor() {
        this.a = 1.0;
        this.b = 1.0;
        this.radius = 5;
        this.width = 128;
        this.height = 256;
        this.heat = 0.6;
        this.life = 0.5;
        this.turbulence = 0.5;
    }

    syncControls() {
        this.a = getRangeValue("fa");
        this.b = getRangeValue("fb");
        this.radius = getRangeValue("fRadius");
        this.heat = getRangeValue("fHeat");
        this.life = getRangeValue("fLife");
        this.turbulence = getRangeValue("fTurbulence");
        // this.width = getRangeValue("iWidth");
        // this.height = getRangeValue("iHeight");
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");

        this.flame = new Flame();

        let p = document.getElementById('desc');
        p.innerHTML = `This graphics demonstration uses two framebuffers to simulate a type of fluid using the Lattice-Boltzmann technique.`;

        let c = document.getElementById('controls');
        createRangeRow(c, 'fa', this.flame.width / 2, 0, this.flame.width);
        createRangeRow(c, 'fb', this.flame.height / 8, 0, this.flame.height);
        createRangeRow(c, 'fRadius', 5.0, 0.0, 25.0, 1.0);
        createRangeRow(c, 'fHeat', 0.9, 0.0, 1.0, 0.05);
        createRangeRow(c, 'fLife', 0.85, 0.5, 1.0, 0.001);
        createRangeRow(c, 'fTurbulence', 3.0, 0.0, 5.0, 0.05);
        // createRangeRow(c, 'iWidth', this.flame.width, 64, 512, 1);
        // createRangeRow(c, 'iHeight', this.flame.height, 64, 512, 1);

        this.curFluid = 0;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let fx = this.xor.fluxions;
        let w = this.flame.width;
        fx.fbos.add("lb1", false, true, w, w, 1);
        fx.fbos.add("lb2", false, true, w, w, 1);

        // load some textures
        fx.textures.load("RadianceCLUT", "models/textures/flame_map.png");
        fx.textures.load("FirePattern", "models/textures/perlin3.png");

        this.lbrc = this.xor.renderconfigs.load('lattice-boltzmann', 'shaders/fluids.vert', 'shaders/fluids-lattice-boltzmann.frag');
        this.lbrc.useDepthTest = false;
        this.lbrc.writeToFBO = "uFluid";
        this.lbrc.addTexture("RadianceCLUT", "RadianceCLUT");

        let rc = this.xor.renderconfigs.load('default', 'shaders/fluids.vert', 'shaders/fluids.frag');
        rc.useDepthTest = false;
        rc.readFromFBOs = ["lb1", "lb2"];
        this.mainrc = rc;

        this.xor.meshes.load('rect', 'models/smallrect.obj');

        let pal = this.xor.palette;

        let screen = this.xor.meshes.create('fullscreenquad');
        screen.color3(pal.getColor(pal.WHITE));
        screen.rect(0, 0, this.flame.width, this.flame.height);
    }

    start() {
        this.mainloop();
    }

    reset() {

    }

    update() {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            this.reset();
        }
        this.flame.syncControls();

        if (this.xor.input.mouse.buttons & 1) {
            let ar = this.flame.width / this.flame.height;
            let Sx = 0.5 * xor.graphics.width / this.flame.width;
            let Sy = ar * xor.graphics.height / this.flame.height;
            let x = Sx * this.xor.input.mouse.position.x / this.xor.graphics.width;
            let y = Sy * (this.xor.graphics.height - this.xor.input.mouse.position.y) / this.xor.graphics.height;
            this.flame.a = x * this.flame.width;
            this.flame.b = y * this.flame.height;
        }
    }

    simFluid() {
        let xor = this.xor;
        let fx = this.xor.fx;
        let gl = fx.gl;
        let pmatrix = Matrix4.makeOrtho2D(0, this.flame.width, 0, this.flame.height);
        let cmatrix = Matrix4.makeIdentity();

        let t = fx.textures.get("RadianceCLUT")
        if (!t) return;
        t.setMinMagFilter(gl.LINEAR, gl.LINEAR);
        t.setWrapST(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

        this.curFluid = 1 - this.curFluid;
        this.f1 = "lb" + (this.curFluid ? "1" : "2");
        this.f2 = "lb" + (this.curFluid ? "2" : "1");
        this.lbrc.writeToFBO = this.f1;
        this.lbrc.readFromFBOs = [this.f2];

        let rc = xor.renderconfigs.use('lattice-boltzmann');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(1.0, 1.0, 1.0));
            rc.uniform1f('a', this.flame.a);
            rc.uniform1f('b', this.flame.b);
            rc.uniform1f('radius', this.flame.radius);
            rc.uniform1f('width', this.flame.width);
            rc.uniform1f('height', this.flame.height);
            rc.uniform1f('heat', this.flame.heat);
            rc.uniform1f('life', this.flame.life);
            rc.uniform1f('turbulence', this.flame.turbulence);
            rc.uniform1f('iTime', xor.t1);
            xor.meshes.render('fullscreenquad', rc);
            // xor.meshes.render('rect', rc);
            rc.restore();
        }
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.RED);

        this.simFluid();

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();

        this.mainrc.readFromFBOs = [this.f1];
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform4f('iMouse', xor.input.mouseshadertoy);

            let M = Matrix4.makeIdentity();
            let S = 0.5 * xor.graphics.width / this.flame.width;
            M.scale(S, S, 1.0);
            rc.uniformMatrix4f('WorldMatrix', M);
            xor.meshes.render('fullscreenquad', rc);
            rc.restore();
        }

        this.mainrc.readFromFBOs = [this.f2];
        rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform4f('iMouse', xor.input.mouseshadertoy);

            let M = Matrix4.makeIdentity();
            M.translate(xor.graphics.width / 2, 0.0, 0.0);
            let S = 0.5 * xor.graphics.width / this.flame.width;
            M.scale(S, S, 1.0);
            rc.uniformMatrix4f('WorldMatrix', M);
            // rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(xor.graphics.width/2, 0.0, 0.0));
            xor.meshes.render('fullscreenquad', rc);
            rc.restore();
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