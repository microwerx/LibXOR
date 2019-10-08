/// <reference path="./htmlutils.d.ts" />
/// <reference path="../LibXOR.d.ts" />

class App {
    constructor() {
        this.xor = new LibXOR("project");

        let p = document.getElementById('desc');
        p.innerHTML = `Display G-Buffer.`;

        let controls = document.getElementById('controls');
        createRangeRow(controls, "outputType", 0, 0, 20);
        createLabelRow(controls, "SHADER", "");
        createRangeRow(controls, "objectType", 0, 0, 10);
        createRangeRow(controls, "ZFar", 100.0, 1.0, 100.0, 1.0);
        createRangeRow(controls, "sunEl", 70.0, 0.0, 90.0);
        createRangeRow(controls, "sunAz", 0.0, -180.0, 180.0);
        createRangeRow(controls, "Kdm", 0.05, 0.0, 1.0, 0.01);
        createRangeRow(controls, "Ksm", 0.05, 0.0, 1.0, 0.01);

        this.azimuth = -90;
        this.inclination = 0;
        this.distance = 2;
        this.gbufferOutputType = 0;
        this.gbufferZFar = 100.0;
        this.sunDirToEl = 45.0;
        this.sunDirToAz = 0.0;
        this.KdRoughness = 0.0;
        this.KsRoughness = 0.0;
    }

    reset() {
        this.azimuth = -90;
        this.inclination = 0;
        this.distance = 2;
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384, 2);
        this.xor.input.init();

        this.xor.fluxions.textures.load("test2D", "models/textures/test_texture.png");
        this.xor.fluxions.fbos.add("gbuffer", true, true, 512, 512);

        let rc = this.xor.renderconfigs.load('gbuffer', 'shaders/basic.vert', 'shaders/gbuffer.frag');
        rc.useDepthTest = true;
        rc.addTexture("test2D", "MapKd");
        rc.writeToFBO = "gbuffer";

        rc = this.xor.renderconfigs.load('r2t', 'shaders/r2t.vert', 'shaders/r2t.frag');
        rc.addTexture("test2D", "MapKd");
        rc.readFromFBOs = ["gbuffer"];

        let bbox = new GTE.BoundingBox();
        bbox.add(Vector3.make(-0.5, -0.5, -0.5));
        bbox.add(Vector3.make(0.5, 0.5, 0.5));
        // this.xor.meshes.load('0', 'models/cornellboxe.obj', bbox);
        // this.xor.meshes.load('1', 'models/teapot.obj', bbox);
        // this.xor.meshes.load('2', 'models/dragon2.obj', bbox);
        // this.xor.meshes.load('3', 'models/bunny.obj', bbox);
        // this.xor.meshes.load('4', 'models/sphere.obj', bbox);
        this.xor.meshes.load('scene', 'models/platonic.obj', bbox);

        let screen = this.xor.meshes.create('fullscreenquad');
        let pal = this.xor.palette;
        screen.color3(pal.getColor(pal.RED));
        screen.rect(0, 0, this.xor.graphics.width, this.xor.graphics.height);

        this.reset();
    }

    start() {
        this.mainloop();
    }

    update() {
        let xor = this.xor;
        if (xor.input.checkKeys([" ", "Space"])) {
            this.reset();
        }

        if (xor.input.mouse.buttons & 1) {
            this.azimuth -= xor.input.mouse.delta.x;
            this.inclination += xor.input.mouse.delta.y;
            this.azimuth = GTE.wrap(this.azimuth, -180, 180);
            this.inclination = GTE.clamp(this.inclination, -90, 90);
        }
        if (xor.input.mouse.buttons & 2) {
            this.distance += xor.input.mouse.delta.y * xor.dt;
            this.distance = GTE.clamp(this.distance, 2, 10);
        }

        this.gbufferOutputType = getRangeValue('outputType');
        this.gbufferZFar = getRangeValue('ZFar');
        this.sunDirToEl = getRangeValue('sunEl');
        this.sunDirToAz = getRangeValue('sunAz');
        this.KdRoughness = getRangeValue("Kdm");
        this.KsRoughness = getRangeValue("Ksm");

        const shaderTypes = [
            "FACE_NORMALS",
            "BUMP_NORMALS",
            "TEXCOORD",
            "VERTEX_COLOR",
            "VIEWDIR",
            "REFLDIR",
            "HALFDIR",
            "NDOTL",
            "NDOTV",
            "VDOTH",
            "RDOTV",
            "DEPTH",
            "KD",
            "KD m",
            "KS",
            "KS m",
            "REFLECTION",
            "LAMBERTIAN",
            "OREN-NAYER",
            "PHONG",
            "BLINN-PHONG",
            "NOT IMPLEMENTED"
        ];

        setDivLabelValue("SHADER", shaderTypes[this.gbufferOutputType]);
    }

    render() {
        let xor = this.xor;

        let sunDirTo = Vector3.makeOrbit(this.sunDirToAz, this.sunDirToEl, 1.0);

        // xor.graphics.clear(xor.palette.AZURE);
        let baseColor = xor.palette.calcColor(xor.palette.AZURE, xor.Color.WHITE, 3).scale(sunDirTo.y);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        // let cmatrix = Matrix4.makeOrbit(-xor.t1*5.0, 0, 3.0);
        let cmatrix = Matrix4.makeOrbit(this.azimuth, this.inclination, this.distance);
        let rc = xor.renderconfigs.use('gbuffer');
        xor.graphics.clear3(baseColor);
        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('Kd', Vector3.make(0.5, 0.0, 1.0));
            rc.uniform3f('Ks', Vector3.make(1.0, 1.0, 1.0));
            rc.uniform3f('SunDirTo', sunDirTo);
            rc.uniform1f('KdRoughness', this.KdRoughness);
            rc.uniform1f('KsRoughness', this.KsRoughness);

            rc.uniform1i('GBufferOutputType', this.gbufferOutputType);
            rc.uniform1f('GBufferZFar', this.gbufferZFar);
            // rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(0.01, 0.01, 0.01));
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
            xor.meshes.render('scene', rc);
            rc.restore();
        }

        rc = xor.renderconfigs.use('r2t');
        if (rc) {
            let pmatrix = Matrix4.makeOrtho2D(0, xor.graphics.width, 0, xor.graphics.height);
            let cmatrix = Matrix4.makeIdentity();
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeScale(1.0, 1.0, 1.0));
            rc.uniform3f('iResolution', GTE.vec3(xor.graphics.width, xor.graphics.height, 0));
            // rc.uniform1f('iTime', xor.t1);
            // rc.uniform1f('iTimeDelta', xor.dt);
            // rc.uniform1f('gbufferEnabled', 1.0);
            rc.uniform1i('iFrame', xor.frameCount);
            rc.uniform1i('iSkyMode', getRangeValue('iSkyMode'));
            xor.meshes.render('fullscreenquad', rc);
            xor.meshes.render('scene', rc);
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