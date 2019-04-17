/// <reference path="LibXOR.js" />
/// <reference path="../src/LibXOR.ts" />
/* global Vector3 */

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `This graphics demonstration uses two framebuffers to simulate a type of fluid using the Lattice-Boltzmann technique.`;
        
        let c = document.getElementById('controls');
        c.appendChild(createRow('iSkyMode', '<input id="iSkyMode" type="range" min="0", max="5", value="1" />'));
        createRangeRow(c, 'iTurbidity', 1, 1, 10, 1);
        createRangeRow(c, 'iAlbedo', 0, 0, 10, 1, true);
        createRangeRow(c, 'fSigma2', 0.0, 0.0, 1.0, 0.05);
        createRangeRow(c, 'fSunInclination', 90, 0, 180, 1);
        createRangeRow(c, 'fSunAzimuth', 0, -360, 360, 1);

        this.curFluid = 0;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let fx = this.xor.fluxions;
        fx.fbos.add("lb1", false, true, 128, 128, 1);
        fx.fbos.add("lb2", false, true, 128, 128, 1);

        // load some textures
        fx.textures.load("flame_map", "textures/flame_map.png");

        let lb = this.xor.renderconfigs.load('lattice-boltzmann', 'shaders/fluids.vert', 'shaders/fluids-lattice-boltzmann.frag');
        lb.useDepthTest = false;
        lb.writeToFBO = "Fluid";

        let rc = this.xor.renderconfigs.load('default', 'shaders/fluids.vert', 'shaders/fluids.frag');
        rc.useDepthTest = false;
        rc.readFromFBOs = ["Fluid"];

        let pal = this.xor.palette;

        let screen = this.xor.meshes.create('fullscreenquad');
        screen.color3(pal.getColor(pal.WHITE));
        screen.rect(0, 0, this.xor.graphics.width, this.xor.graphics.height);
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
    }

    simFluid() {
        let xor = this.xor;
        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();

        this.curFluid = 1 - this.curFluid;
        this.f1 = "lb" + (this.curFluid ? "1" : "2");
        this.f2 = "lb" + (this.curFluid ? "2" : "1");

        let rc = xor.renderconfigs.use('lattice-boltzmann');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(0.5, 0.5, 0.5));
            xor.meshes.render('fullscreenquad', rc);
        }
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.RED);

        this.simFluid();

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();        

        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform4f('iMouse', xor.input.mouseshadertoy);
            rc.uniform1f('iTime', xor.t1);
            rc.uniform1f('iTimeDelta', xor.dt);
            rc.uniform1i('iFrame', xor.frameCount);
            rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));

            let fSunInclination = getRangeValue('fSunInclination');
            let fSunAzimuth = getRangeValue('fSunAzimuth');
            let uSunDirTo = Vector3.makeFromSpherical(GTE.radians(fSunAzimuth), GTE.radians(fSunInclination));
            rc.uniform3f('uSunDirTo', uSunDirTo);

            let fSigma2 = getRangeValue('fSigma2');
            rc.uniform1f('fSigma2', fSigma2);

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