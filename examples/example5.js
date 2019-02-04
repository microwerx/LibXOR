class App {
    constructor() {
        this.xor = new LibXOR("project");
        this.sim = new Simulation();

        let p = document.getElementById('desc');
        p.innerHTML = `This physics demonstration of bouncing blocks demonstrates
        applying the force of gravity with a random starting up velocity. When the
        block hits the bottom, a new up velocity is applied and the block is not
        allowed to descend below the floor. Additionally, we apply the force of
        wind and air resistance.`;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let gl = this.xor.graphics.gl;

        let rc = this.xor.renderconfigs.load('default', 'basic.vert', 'basic.frag');
        rc.useDepthTest = false;

        let pal = this.xor.palette;

        let rect = this.xor.meshes.load('rect', 'rect.obj');
        let bg = this.xor.meshes.create('bg');
        bg.color3(pal.getColor(pal.BROWN));
        bg.rect(-5, -1, 5, -5);
        bg.color3(pal.getColor(pal.YELLOW));
        bg.circle(2, 1.5, 0.25);
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
        xor.graphics.clear(xor.palette.AZURE);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        let rc = xor.renderconfigs.use('default');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('bg', rc);

            for (let sv of this.sim.objects) {
                rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation3(sv.x));
                xor.meshes.render('rect', rc);
            }
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