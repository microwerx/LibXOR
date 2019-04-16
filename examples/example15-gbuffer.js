/// <reference path="htmlutils.js" />
/// <reference path="LibXOR.js" />
/* global Vector3 FxTextureUniform */

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `Display G-Buffer.`;

        let controls = document.getElementById('controls');

        this.azimuth = 0;
        this.inclination = 0;
        this.dist = 5;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        this.xor.fluxions.textures.load("test2D", "models/textures/test_texture.png");
        this.xor.fluxions.fbos.add("gbuffer", true, true, 512, 256, 0);

        let rc = this.xor.renderconfigs.load('gbuffer', 'shaders/basic.vert', 'shaders/gbuffer.frag');
        rc.useDepthTest = true;
        rc.addTexture("test2D", "map_kd");
        rc.writeToFBO = "gbuffer";
        
        rc = this.xor.renderconfigs.load('r2t', 'shaders/r2t.vert', 'shaders/r2t.frag');
        rc.addTexture("test2D", "map_kd");
        rc.readFromFBOs = ["gbuffer"];

        this.xor.meshes.load('teapot', 'models/mitsuba.obj');

        let screen = this.xor.meshes.create('fullscreenquad');
        let pal = this.xor.palette;
        screen.color3(pal.getColor(pal.RED));
        screen.rect(0, 0, this.xor.graphics.width, this.xor.graphics.height);
    }

    start() {
        this.mainloop();
    }

    update() {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            this.azimuth = 0;
            this.inclination = 0;
            this.distance = 5;
        }

        this.azimuth = xor.input.mouse.position.x;
        this.inclination = xor.input.mouse.position.y;
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(xor.palette.AZURE);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        // let cmatrix = Matrix4.makeOrbit(-xor.t1*5.0, 0, 3.0);
        let cmatrix = Matrix4.makeOrbit(this.azimuth, this.inclination, this.distance);
        let rc = xor.renderconfigs.use('gbuffer');
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('kd', Vector3.make(1.0, 0.0, 0.0));
            rc.uniform3f('sunDirTo', Vector3.make(1.0, 1.0, 1.0));

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0, 0, 0));
            xor.meshes.render('teapot', rc);
        }
        rc.restore();

        rc = xor.renderconfigs.use('r2t');
        if (rc) {
            let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
            let cmatrix = Matrix4.makeIdentity();
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
                rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(1.0, 1.0, 1.0));
                rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
                rc.uniform1f('iTime', xor.t1);
                rc.uniform1f('iTimeDelta', xor.dt);
                rc.uniform1i('iFrame', xor.frameCount);
                rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));
                xor.meshes.render('fullscreenquad', rc);
        }
        rc.restore();
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