/* global uiRangeValue */
/// <reference path="../src/LibXOR.ts" />
/// <reference path="htmlutils.ts" />

class CellularAutomata {
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
        this.a = uiRangeValue("fa", this.width/2, 0, this.width-1);
        this.b = uiRangeValue("fb", this.height/8, 0, this.height-1);
        this.radius = uiRangeValue("fRadius", 5.0, 0.0, 25.0, 1.0);
        this.heat = uiRangeValue("fHeat", 0.99, 0.0, 1.0, 0.01);
        this.life = uiRangeValue("fLife", 0.5, 0.0, 1.0, 0.01);
        this.turbulence = uiRangeValue("fTurbulence", 3.0, 0.0, 5.0, 0.05);
        // this.width = getRangeValue("iWidth");
        // this.height = getRangeValue("iHeight");
    }
}

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `This graphics demonstration uses two framebuffers to simulate the cellular automata technique.`;

        this.flame = new CellularAutomata();
        this.curFluid = 0;
        this.simSteps = 1;

        this.syncControls();
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5*384, 384);
        this.xor.input.init();

        let fx = this.xor.fluxions;
        let gl = this.xor.fluxions.gl;
        let w = this.flame.width;
        let h = this.flame.height;
        fx.fbos.add("lb1", true, false, w, h);
        fx.fbos.add("lb2", true, false, w, h);
        fx.fbos.get("lb1").setWrap(gl.REPEAT, gl.REPEAT);
        fx.fbos.get("lb2").setWrap(gl.REPEAT, gl.REPEAT);

        // load some textures
        fx.textures.load("RadianceCLUT", "models/textures/flame_map.png");
        fx.textures.load("FirePattern", "models/textures/perlin3.png");

        this.lbrc = this.xor.renderconfigs.load('shader', 'shaders/fluids.vert', 'shaders/fluids-cellular-automata.frag');
        this.lbrc.useDepthTest = false;
        this.lbrc.writeToFBO = "uFluid";
        this.lbrc.addTexture("RadianceCLUT", "RadianceCLUT");

        let rc = this.xor.renderconfigs.load('default', 'shaders/fluids.vert', 'shaders/fluids-plain.frag');
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

    syncControls() {
        let fluid = this.iFluidType;
        this.iFluidType = uiRangeValue('iFluidType', 2, 0, 4);
        if (fluid != this.iFluidType)
            this.xor.frameCount = 0;
        this.simSteps = uiRangeValue("iSimSteps", 16, 0, 16);
        this.iCARule = uiRangeValue('iCARule', 30, 0, 255, 1);
        this.fRDDA = uiRangeValue('fRDDA', 1.0, 0.0, 1.0, 0.1);
        this.fRDDB = uiRangeValue('fRDDB', 0.5, 0.0, 1.0, 0.1);
        this.fRDFeedRate = uiRangeValue('fRDFeedRate', /*0.0545*/0.044, 0.03, 0.06, 0.001);
        this.fRDKillRate = uiRangeValue('fRDKillRate', /*0.0620*/0.060, 0.03, 0.07, 0.001);
        this.flame.syncControls();
    }

    update() {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            this.reset();
        }

        if (this.xor.input.mouse.buttons & 1) {
            let swap = this.flame.width < this.flame.height;
            let ar = this.flame.width / this.flame.height;
            let Sx = 1.0;//swap ? ar : 1.0;// * xor.graphics.width / this.flame.width;
            let Sy = 1.0;//swap ? 1.0 : ar;//ar * xor.graphics.height / this.flame.height;
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

        let t = fx.textures.get("RadianceCLUT");
        if (!t) return;
        t.setMinMagFilter(gl.LINEAR, gl.LINEAR);
        t.setWrapST(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

        this.curFluid = 1 - this.curFluid;
        this.f1 = "lb" + (this.curFluid ? "1" : "2");
        this.f2 = "lb" + (this.curFluid ? "2" : "1");
        this.lbrc.writeToFBO = this.f1;
        this.lbrc.readFromFBOs = [this.f2];

        let rc = xor.renderconfigs.use('shader');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(1.0, 1.0, 1.0));
            rc.uniform1f('a', this.flame.a);
            rc.uniform1f('b', this.flame.b);
            rc.uniform1f('radius', this.flame.radius);
            rc.uniform1f('width', this.flame.width);
            rc.uniform1f('height', this.flame.height);
            rc.uniform1i('iCARule', this.iCARule);
            rc.uniform1f('heat', this.flame.heat);
            rc.uniform1f('life', this.flame.life);
            rc.uniform1f('turbulence', this.flame.turbulence);
            rc.uniform1f('fRDDA', this.fRDDA);
            rc.uniform1f('fRDDB', this.fRDDB);
            rc.uniform1f('fRDFeedRate', this.fRDFeedRate);
            rc.uniform1f('fRDKillRate', this.fRDKillRate);
            rc.uniform1f('iTime', xor.t1);
            rc.uniform1i('iFluidType', this.iFluidType);
            rc.uniform1i('iSourceBuffer', this.curFluid);
            if (this.iFluidType == 0 && this.xor.frameCount == 1) rc.uniform1i('iMouseButtons', 1);
            else rc.uniform1i('iMouseButtons', this.xor.input.mouseButton1 ? 1 : 0);
            xor.meshes.render('fullscreenquad', rc);
            rc.restore();
        }
        gl.flush();
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.BLACK, xor.palette.AZURE, 1);

        for (let i = 0; i < this.simSteps; i++) {
            this.simFluid();
        }

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();

        this.mainrc.readFromFBOs = [this.f1];
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform4f('iMouse', xor.input.mouseshadertoy);
            rc.uniform1i('iFluidType', this.iFluidType);

            let M = Matrix4.makeIdentity();
            let S = 0.5 * xor.graphics.width / this.flame.width;
            let y = 0.5 * (xor.graphics.height - S * this.flame.height);
            M.translate(0, y, 0);
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
            rc.uniform1i('iFluidType', this.iFluidType);

            let M = Matrix4.makeIdentity();
            let S = 0.5 * xor.graphics.width / this.flame.width;
            let y = 0.5 * (xor.graphics.height - S * this.flame.height);
            M.translate(xor.graphics.width / 2, y, 0.0);
            M.scale(S, S, 1.0);
            rc.uniformMatrix4f('WorldMatrix', M);
            xor.meshes.render('fullscreenquad', rc);
            rc.restore();
        }

        xor.renderconfigs.use(null);
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            self.syncControls();
            self.update(self.xor.dt);
            self.render();
            self.mainloop();
        });
    }
}

let app = new App();
app.init();
app.start();