/* eslint-disable no-undef */
/// <reference path="./htmlutils.d.ts" />
/// <reference path="../src/LibXOR.ts" />

class App {
    constructor() {
        this.xor = new LibXOR("project");

        this.shaderTypes = [
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
            "CEL SHADING",
            "XTOON",
            "GOOCH",
            "CEL GOOCH",
            "HATCH"
        ];

        let p = document.getElementById('desc');
        p.innerHTML = `Display G-Buffer.`;

        let controls = document.getElementById('controls');
        createRangeRow(controls, "outputType", 0, 0, this.shaderTypes.length - 1);
        createLabelRow(controls, "SHADER", "");
        createRangeRow(controls, "objectType", 0, 0, 10);
        createRangeRow(controls, "ZFar", 100.0, 1.0, 100.0, 1.0);
        createRangeRow(controls, "Zoom", 2.0, 0.1, 10.0, 0.1);
        createRangeRow(controls, "sunEl", 70.0, 0.0, 180.0);
        createRangeRow(controls, "sunAz", 0.0, -180.0, 180.0);
        createRangeRow(controls, "Kdm", 0.05, -1.0, 1.0, 0.01);
        createRangeRow(controls, "Ksm", 0.05, -1.0, 1.0, 0.01);
        createRangeRow(controls, "GGX_gamma", 2, 1, 10);
        createRangeRow(controls, "n2", 1.5, 1.05, 2.5, 0.05);

        this.azimuth = -90;
        this.inclination = 0;
        this.distance = 2;
        this.gbufferOutputType = 0;
        this.gbufferZFar = 100.0;
        this.sunDirToEl = 45.0;
        this.sunDirToAz = 0.0;
        this.KdRoughness = 0.0;
        this.KsRoughness = 0.0;
        this.GGX_gamma = 2;
        this.n2 = 1.5;
        this.F0 = 0.02;
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

        let textures = this.xor.fluxions.textures;
        textures.load("test2D", "models/textures/test_texture.png");
        textures.load("xtoon1", "textures/xtoon1.png");
        textures.load("xtoon2", "textures/xtoon2.png");
        textures.load("hatch1", "textures/hatch1.png");
        textures.load("hatch2", "textures/hatch2.png");
        textures.load("hatch3", "textures/hatch3.png");
        textures.load("hatch4", "textures/hatch4.png");
        this.xor.fluxions.fbos.add("gbuffer", true, true, 512, 512);

        let rc = this.xor.renderconfigs.load('ubershader', 'shaders/basic.vert', 'shaders/ubershader-npr.frag');
        rc.useDepthTest = true;
        rc.addTexture("hatch1", "HatchMap[0]");
        rc.addTexture("hatch2", "HatchMap[1]");
        rc.addTexture("hatch3", "HatchMap[2]");
        rc.addTexture("hatch4", "HatchMap[3]");
        rc.addTexture("test2D", "MapKd");
        rc.addTexture("xtoon1", "XToonMap[0]");
        rc.addTexture("xtoon2", "XToonMap[1]");

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
        this.distance = getRangeValue("Zoom");
        this.GGX_gamma = getRangeValue("GGX_gamma");
        this.n2 = getRangeValue("n2");
        const n1 = 1.0001;
        this.F0 = Math.pow((n1 - this.n2) / (n1 + this.n2), 2.0);

        setDivLabelValue("SHADER", this.shaderTypes[this.gbufferOutputType]);
    }

    render() {
        let xor = this.xor;

        let sunDirTo = Vector3.makeOrbit(this.sunDirToAz, this.sunDirToEl, 1.0);

        // xor.graphics.clear(xor.palette.AZURE);
        let baseColor = xor.palette.calcColor(xor.palette.AZURE, XOR.Color.WHITE, 3).scale(sunDirTo.y);
        let gold = xor.palette.getColor(xor.palette.GOLD);
        xor.graphics.clear3(baseColor);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 0.1, 100.0);
        let cmatrix = Matrix4.makeOrbit(this.azimuth, this.inclination, this.distance);
        let rc = xor.renderconfigs.use('ubershader');
        if (rc) {
            rc.uniform1f("ScreenWidth", xor.graphics.width);
            rc.uniform1f("ScreenHeight", xor.graphics.height);
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniform3f('Kd', Vector3.make(0.5, 0.0, 1.0));
            rc.uniform3f('Ks', gold);//Vector3.make(1.0, 1.0, 1.0));
            rc.uniform3f('SunDirTo', sunDirTo);
            rc.uniform1f('KdRoughness', this.KdRoughness);
            rc.uniform1f('KsRoughness', this.KsRoughness);
            rc.uniform1f('GGX_gamma', this.GGX_gamma);
            rc.uniform1f('F0', this.F0);

            rc.uniform1i('GBufferOutputType', this.gbufferOutputType);
            rc.uniform1f('GBufferZFar', this.gbufferZFar);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeIdentity());
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