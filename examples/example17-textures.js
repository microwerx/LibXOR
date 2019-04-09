/// <reference path="htmlutils.js" />
/// <reference path="LibXOR.js" />

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `Display G-Buffer.`;

        this.useRenderToTexture = false;

        let controls = document.getElementById('controls');
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();
        let xor = this.xor;
        let fx = this.xor.fluxions;

        fx.textures.load("test2D", "models/textures/test_texture.png");
        fx.textures.load("godzilla", "models/textures/godzilla.png");
        fx.textures.load("parrot", "models/textures/parrot.png");
        fx.fbos.add("gbuffer", true, true, 512, 256, 0);

        let rc = this.xor.renderconfigs.load('gbuffer', 'shaders/basic.vert', 'shaders/gbuffer.frag');
        rc.useDepthTest = true;
        rc.addTexture("test2D", "map_kd");
        rc.writeToFBO = "gbuffer";

        rc = xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic.frag');
        rc.useDepthTest = true;
        rc.addTexture("godzilla", "map_kd");

        rc = this.xor.renderconfigs.load('r2t', 'shaders/basic.vert', 'shaders/r2t.frag');
        rc.addTexture("test2D", "map_kd");
        rc.readFromFBOs = ["gbuffer"];

        this.xor.meshes.load('teapot', 'models/mitsuba.obj');
        this.xor.meshes.load('rect', 'rect.obj');

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
            this.useRenderToTexture = !this.useRenderToTexture;
        }
    }

    render() {
        let xor = this.xor;
        let gl = this.xor.fluxions.gl;
        xor.graphics.clear(xor.palette.AZURE);

        if (this.useRenderToTexture) {
            let rc = xor.renderconfigs.use('gbuffer');
            if (rc) {
                let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
                let cmatrix = Matrix4.makeOrbit(-xor.t1 * 5.0, 0, 3.0);
                rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
                rc.uniformMatrix4f('CameraMatrix', cmatrix);
                rc.uniform3f('kd', Vector3.make(1.0, 0.0, 0.0));
                rc.uniform1f('map_kd_mix', 1.0);
                rc.uniform3f('sunDirTo', Vector3.make(1.0, 1.0, 1.0));

                rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0, 0, 0));
                xor.meshes.render('teapot', rc);
            }
            rc.restore();
        }

        let rc = xor.renderconfigs.use('default');
        if (rc) {
            let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
            let cmatrix = Matrix4.makeOrbit(-xor.t1 * 5.0, 0, 3.0);
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('kd', Vector3.make(1.0, 0.0, 0.0));
            rc.uniform1f('map_kd_mix', 1.0);

            gl.activeTexture(gl.TEXTURE0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            let ext = xor.fluxions.getExtension('EXT_texture_filter_anisotropic');
            if (ext) {
                let max = gl.getParameter(gl.TEXTURE_MAX_ANISOTROPY_EXT);
                gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAX_ANISOTROPY_EXT, max);
            }

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0, 0, 0));
            xor.meshes.render('rect', rc);
        }
        rc.restore();

        if (this.useRenderToTexture) {
            let rc = xor.renderconfigs.use('r2t');
            if (rc) {
                //let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
                let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
                let cmatrix = Matrix4.makeOrbit(-xor.t1 * 5.0, 0, 3.0);
                rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
                rc.uniformMatrix4f('CameraMatrix', cmatrix);
                rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(0.5, 0.5, 0.5));
                rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
                rc.uniform1f('iTime', xor.t1);
                rc.uniform1f('iTimeDelta', xor.dt);
                rc.uniform1i('iFrame', xor.frameCount);
                rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));
                xor.meshes.render('rect', rc);
            }
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