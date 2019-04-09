class App {
    constructor() {
        this.xor = new LibXOR("project");
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic.frag');
        rc.useDepthTest = true;

        let rect = this.xor.meshes.load('rect', 'teapot.obj');
    }

    start() {
        this.mainloop();
    }

    update(dt) {

    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(1.0, 0.0, 0.0, 1.0);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(xor.t1, 15 * Math.sin(xor.t1), 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeRotation(35 * xor.t1, 0, 1, 0));
            xor.meshes.render('rect', rc, xor.fluxions.scenegraph);
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