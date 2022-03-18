/* global uiRangeValue */
/// <reference path="../src/LibXOR.ts" />
/// <reference path="htmlutils.ts" />

class CellularAutomata {
    constructor() {
        this.a = 1.0;
        this.b = 1.0;
        this.radius = 5;
        this.width = 512;
        this.height = 512;
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
        p.innerHTML = `This graphics demonstration uses two framebuffers to simulate the cellular automata technique.
        You can adjust the speed (<i>iSimSteps</i>) either to increase the number of steps performed at one time (1-16), or to pause (0), or to slow down as a fraction of a second (-16 to -1). The negative numbers are interpreted as 1/16, 1/15, ..., 1/1 seconds.
        Some cellular automata will flicker.
        To reduce this, pick an <i>even</i> positive number, or an <i>odd</i> negative number.
        You can start or interact with a cellular automata by clicking or dragging in the viewport.
        The simulation is run in two textures ping ponging back and forth, so your click is really only valid for half the screen.
        You can effectively clear the screen by switching to mode 2 (the Reactive-Diffusion simulation) and then to mode 1 (the Game of Life).
        It's fun to switch between the different modes to see the interaction from the previous result.
        `;

        this.flame = new CellularAutomata();
        this.curFluid = 0;
        this.simSteps = 1;
        this.lastSimStepSeconds = 0; // If simSteps is < 0, then we will increment once per second.
        this.touching = false;
        this.mouseX = 0;
        this.mouseY = 0;

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
        this.simSteps = uiRangeValue("iSimSteps", 16, -16, 16);
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

        this.touching = false;
        let mouseX = this.xor.input.mouse.position.x;
        let mouseY = this.xor.input.mouse.position.y;
        if (this.xor.input.mouse.buttons & 1) {
            this.touching = true;
        }
        if (this.xor.input.touches[0].pressed) {
            this.touching = true;
            mouseX = this.xor.input.touches[0].x - this.xor.graphics.canvas.clientLeft;
            mouseY = this.xor.input.touches[0].y - this.xor.graphics.canvas.clientTop;
        }

        this.mouseX = mouseX / this.xor.graphics.width;
        this.mouseY = (this.xor.graphics.height - mouseY) / this.xor.graphics.height;
        this.mouseTX = this.mouseX * this.flame.width;
        this.mouseTY = this.mouseY * this.flame.height;

        if (this.touching) {
            this.flame.a = this.mouseTX;
            this.flame.b = this.mouseTY;
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
            rc.uniform1i('iMouseButtons', this.touching ? 1 : 0);
            xor.meshes.render('fullscreenquad', rc);
            rc.restore();
        }
        gl.flush();
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.BLACK, xor.palette.AZURE, 1);

        let swapSides = false;
        if (this.simSteps < 0) {
            const curTime = this.xor.t1;
            if (this.lastSimStepSeconds < curTime) {
                this.simFluid();
                this.lastSimStepSeconds = curTime - 1.0/this.simSteps;
            }
            if (this.simSteps & 1 == 1) {
                swapSides = this.curFluid == 0;
            }
        } else if (this.simSteps > 0) {
            for (let i = 0; i < this.simSteps; i++) {
                this.simFluid();
            }
        }

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();

        this.mainrc.readFromFBOs = swapSides ? [this.f2] : [this.f1];
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform4f('iMouse', xor.input.mouseshadertoy);
            rc.uniform1f('iMouseX', this.mouseX * this.xor.graphics.width);
            rc.uniform1f('iMouseY', this.mouseY * this.xor.graphics.height);
            rc.uniform1i('iMouseButtons', this.touching ? 1 : 0);
            rc.uniform1i('iFluidType', this.iFluidType);

            const aspectRatio = this.xor.graphics.width / this.xor.graphics.height;
            let M = Matrix4.makeIdentity();
            let S = 0.5 * xor.graphics.width / this.flame.width;
            if (aspectRatio < 1) S *= 1.0/aspectRatio;
            let x = 0.5 * (xor.graphics.width/2 - S * this.flame.width);
            let y = 0.5 * (xor.graphics.height - S * this.flame.height);
            M.translate(x, y, 0);
            M.scale(S, S, 1.0);
            rc.uniformMatrix4f('WorldMatrix', M);
            xor.meshes.render('fullscreenquad', rc);
            rc.restore();
        }

        this.mainrc.readFromFBOs = swapSides ? [this.f1] : [this.f2];
        rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform4f('iMouse', xor.input.mouseshadertoy);
            rc.uniform1f('iMouseX', this.mouseX * this.xor.graphics.width);
            rc.uniform1f('iMouseY', this.mouseY * this.xor.graphics.height);
            rc.uniform1i('iMouseButtons', this.touching ? 1 : 0);
            rc.uniform1i('iFluidType', this.iFluidType);

            const aspectRatio = this.xor.graphics.width / this.xor.graphics.height;
            let M = Matrix4.makeIdentity();
            let S = 0.5 * xor.graphics.width / this.flame.width;
            if (aspectRatio < 1) S *= 1.0/aspectRatio;
            let x = 0.5 * (xor.graphics.width/2 - S * this.flame.width);
            let y = 0.5 * (xor.graphics.height - S * this.flame.height);
            M.translate(x + xor.graphics.width / 2, y, 0.0);
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