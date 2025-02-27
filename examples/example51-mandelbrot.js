///* global XOR Vector3 Matrix4 BoundingBox createButtonRow createRangeRow setIdToHtml createCheckRow createDivRow setDivRowContents getCheckValue collremoveControls */
/// <reference path="../LibXOR.d.ts" />
/// <reference path="htmlutils.js" />


class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `This is a graphics demonstration of zooming into the Mandelbrot set.`;
        
        removeControls();
        collapseLog();

        this.resetSim=false;
        this.iResolution = Vector3.make(1.5 * 384, 384);
        this.iTime = 0.0;
        this.iFrame = 0;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let rc = this.xor.renderconfigs.load('default', 'shaders/raytracer.vert', 'shaders/mandelbrot.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let screen = this.xor.meshes.create('fullscreenquad');
        screen.color3(pal.getColor(pal.WHITE));
        screen.rect(0, 0, this.xor.graphics.width, this.xor.graphics.height);
    }

    start() {
        this.mainloop();
    }

    /**
     * 
     * @param {number} dt time change
     */
    update() {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            this.resetSim = true;
        }

        this.iTime = this.xor.t1;
        this.iTimeDelta = this.xor.dt;
        this.iFrame = this.xor.frameCount;
        // this.iTime = getRangeValue("iTime");

        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniform3f('iResolution', GTE.vec3(this.iResolution.x, this.iResolution.y, 0));
            rc.uniform1f('iTime', this.iTime);
            rc.uniform1f('iTimeDelta', xor.dt);
            rc.uniform1f('iFrame', this.iFrame);
        }
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.RED);

        let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
        let cmatrix = Matrix4.makeIdentity();
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            // rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));

            // let fSunInclination = getRangeValue('fSunInclination');
            // let fSunAzimuth = getRangeValue('fSunAzimuth');
            // let uSunDirTo = Vector3.makeFromSpherical(GTE.radians(fSunAzimuth), GTE.radians(fSunInclination));
            // rc.uniform3f('uSunDirTo', uSunDirTo);

            // let fSigma2 = getRangeValue('fSigma2');
            // rc.uniform1f('fSigma2', fSigma2);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('fullscreenquad', rc);
        }
        xor.renderconfigs.use(null);
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            self.xor.input.poll();
            self.xor.sound.update();
            self.update(self.xor.dt);
            self.render();
            self.mainloop();
        });
    }
}

let app = new App();
app.init();
app.start();
