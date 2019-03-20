
class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.sampleResets = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        let p = document.getElementById('desc');
        p.innerHTML = `This demonstration is a sampler that plays a variety of sound effects.`;
        
        let c = document.getElementById('controls');
        createRangeRow(c, 'fVolume', 1, 1, 10, 1);
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        this.xor.sound.init();
        this.xor.sound.sampler.loadSample(1, 'sounds/BassDrum1.wav');
        this.xor.sound.sampler.loadSample(2, 'sounds/CowBell.wav');
        this.xor.sound.sampler.loadSample(3, 'sounds/Snare1.wav');

        let rc = this.xor.renderconfigs.load('default', 'basic.vert', 'basic.frag');
        rc.useDepthTest = false;

        this.xor.meshes.load('rect', 'rect.obj');
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            resetSim = true;
        }
        if (xor.t1 > this.sampleResets[1] && xor.input.checkKeys(["1"])) {
            this.sampleResets[1] = xor.t1 + 0.100;
            xor.sound.sampler.playSample(1);
            hflog.info('playing 1');
        }
        if (xor.t1 > this.sampleResets[2] && xor.input.checkKeys(["2"])) {
            this.sampleResets[2] = xor.t1 + 0.100;
            xor.sound.sampler.playSample(2);
            hflog.info('playing 2');
        }
        if (xor.t1 > this.sampleResets[3] && xor.input.checkKeys(["3"])) {
            this.sampleResets[3] = xor.t1 + 0.100;
            xor.sound.sampler.playSample(3);
            hflog.info('playing 3');
        }

        xor.sound.volume = getRangeValue('fVolume');
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
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            rc.uniform1f('iTime', xor.t1);
            rc.uniform1f('iTimeDelta', xor.dt);
            rc.uniform1i('iFrame', xor.frameCount);
            rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));

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