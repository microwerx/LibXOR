/// <reference path="htmlutils.js" />
/// <reference path="LibXOR.js" />

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `Display G-Buffer.`;

        this.useRenderToTexture = false;
        this.azimuth = 0;
        this.inclination = 0;
        this.distance = 3;
        this.fOrbitSpeed = 0.0;
        this.iMagFilter = 0;
        this.iMinFilter = 0;
        this.iAnisotropy = 0;
        this.iWrapS = 0;
        this.iWrapT = 0;
        this.iModel = 0;
        this.iTexture = 0;
        this.rc = null;

        let controls = document.getElementById('controls');
        createRangeRow(controls, "iMinFilter", 0, 0, 3);
        createRangeRow(controls, "iMagFilter", 0, 0, 1);
        createRangeRow(controls, "iAnisotropy", 0, 0, 16);
        createRangeRow(controls, "iTexture", 0, 0, 3);
        createRangeRow(controls, "iModel", 0, 0, 3);
        createRangeRow(controls, "fOrbitSpeed", 0.0, 0.0, 30.0);
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

        let rc = xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/basic.frag');
        rc.useDepthTest = true;
        rc.addTexture("godzilla", "map_kd");
        this.rc = rc;

        this.xor.meshes.load('mitsuba', 'models/mitsuba.obj');
        this.xor.meshes.load('teapot', 'models/teapot.obj');
        this.xor.meshes.load('rect', 'models/rect.obj');
    }

    start() {
        this.mainloop();
    }

    update() {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            this.azimuth = 0;
            this.inclination = 0;
            this.distance = 3;
        }

        this.fOrbitSpeed = getRangeValue("fOrbitSpeed");
        this.iMinFilter = getRangeValue("iMinFilter");
        this.iMagFilter = getRangeValue("iMagFilter");
        this.iWrapS = getRangeValue("iWrapS");
        this.iWrapT = getRangeValue("iWrapT");
        this.iAnisotropy = getRangeValue("iAnisotropy");
        this.iModel = getRangeValue("iModel");
        this.iTexture = getRangeValue("iTexture");
        if (this.rc) {
            this.rc.clearTextures();
            switch (this.iTexture) {
                case 0: this.rc.addTexture("godzilla", "map_kd");
                    break;
                case 1: this.rc.addTexture("parrot", "map_kd");
                    break;
                case 2: this.rc.addTexture("test2D", "map_kd");
                    break;
                default: this.rc.addTexture("godzilla", "map_kd");
                    break;
            }

        }
    }

    render() {
        let xor = this.xor;
        let gl = this.xor.fluxions.gl;
        xor.graphics.clear(xor.palette.AZURE);

        let rc = xor.renderconfigs.use('default');
        if (rc) {
            let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
            let cmatrix = Matrix4.makeOrbit(this.fOrbitSpeed * -xor.t1 * 5.0 + this.azimuth, this.inclination, this.distance);
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('kd', Vector3.make(1.0, 0.0, 0.0));
            rc.uniform1f('map_kd_mix', 1.0);

            gl.activeTexture(gl.TEXTURE0);

            try {
                switch (this.iWrapS) {
                    case 0: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                        break;
                    case 1: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        break;
                    case 2: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                        break;
                    default: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                        break;
                }
                switch (this.iWrapS) {
                    case 0: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                        break;
                    case 1: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        break;
                    case 2: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                        break;
                    default: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                        break;
                }
                switch (this.iMinFilter) {
                    case 0: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        break;
                    case 1: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                        break;
                    case 2: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
                        break;
                    case 3: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        break;
                    default:
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        break;
                }
                switch (this.iMagFilter) {
                    case 0: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        break;
                    case 1: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        break;
                    default: gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        break;
                }
            } catch (e) { }

            let ext = xor.fluxions.getExtension('EXT_texture_filter_anisotropic');
            if (ext && this.iAnisotropy > 0) {
                let max = Math.min(this.iAnisotropy, gl.getParameter(ext.TEXTURE_MAX_ANISOTROPY_EXT));
                gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
            }

            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeTranslation(0, 0, 0));
            switch (this.iModel) {
                case 0: xor.meshes.render('rect', rc);
                    break;
                case 1: xor.meshes.render('teapot', rc);
                    break;
                case 2: xor.meshes.render('mitsuba', rc);
                    break;
                default: xor.meshes.render('rect', rc);
                    break;
            }
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