class App {
    constructor() {
        this.xor = new LibXOR("project");

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
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
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