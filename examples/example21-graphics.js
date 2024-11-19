/* global XOR Vector3 createButtonRow createRangeRow setIdToHtml createCheckRow createDivRow setDivRowContents getCheckValue */
/// <reference path="../src/LibXOR.ts" />
/// <reference path="htmlutils.js" />

function cosd(thetaInDegrees) {
    return Math.cos(thetaInDegrees * 3.1415926/180.0);
}

function sind(thetaInDegrees) {
    return Math.sin(thetaInDegrees * 3.1415926/180.0);
}

class App {
    constructor() {
        this.xor = new LibXOR("project");

        setIdToHtml("<p>This app demonstrates spherical harmonic lights.</p>");

        let self = this;
        let controls = document.getElementById('controls');
        createButtonRow(controls, "bReset", "Reset", () => {
            self.reset();
        });
        createRangeRow(controls, "BumpMix", 0, 0.0, 1.0, 0.05);
        createRangeRow(controls, "KsmMix", 0, 0.0, 1.0, 0.05);
        createRangeRow(controls, "Ksm", 0, 0.0, 1.0, 0.05);
        createRangeRow(controls, "theta", 0, -90, 90);
        createRangeRow(controls, "Zoom", 0.0, -4.0, 4.0, 0.1);
        createRangeRow(controls, "LightAngle", 0.0, 0.0, 180.0);
        createRangeRow(controls, "MeshObject", 0, 0, 1);

        // The controls to rotate the camera.
        this.azimuth = -90;
        this.inclination = 0;
        this.distance = 5;

        this.BumpMix = 0;
        this.theta = 0;
        this.KsmMix = 0;
        this.Ksm = 0;
        this.Zoom = 0;
        this.LightAngle = 0;
        this.MeshObject = 0;

        this.xor.triggers.set("ESC", 60.0 / 120.0);
        this.xor.triggers.set("SPC", 0.033);
    }

    init() {
        hflog.logElement = "log";
        this.xor.graphics.setVideoMode(1.5 * 384, 384);
        this.xor.input.init();

        let fx = this.xor.fluxions;
        fx.textures.load('chiptil-diffuse', 'textures/chiptil.png');
        fx.textures.load('chiptil-normal', 'textures/chiptil-normal.png');
        fx.textures.load('chiptil-roughness', 'textures/chiptil-roughness.png');
        fx.textures.load('charlesXII', 'textures/charlesXII_1024.jpg');

        let rc = this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/textures.frag');
        rc.addTexture("chiptil-diffuse", "MapKd");
        rc.addTexture("chiptil-normal", "MapNormal");
        rc.addTexture("chiptil-roughness", "MapKsRoughness");
        rc.addTexture("charlesXII", "MapEnvironment");

        let bbox = new GTE.BoundingBox();
        bbox.add(Vector3.make(-1.0, -1.0, -1.0));
        bbox.add(Vector3.make(1.0, 1.0, 1.0));
        this.xor.meshes.load('cornellbox', 'models/cornellbox_orig.obj', bbox);
        this.xor.meshes.load('rect1', 'models/mitsuba.obj', bbox);
        this.xor.meshes.load('rect2', 'models/rect.obj', bbox);

        this.xor.graphics.init();
        this.reset();
    }

    reset() {
        let spr = this.xor.graphics.sprites[0];
        if (spr) {
            spr.enabled = true;
            spr.position.reset(50, 50, 0);
        }

        this.pauseGame = false;
    }

    start() {
        this.mainloop();
    }

    update(dt) {
        let xor = this.xor;
        xor.input.poll();
        this.updateControls();

        if (xor.input.checkKeys([" ", "Space"])) {
            this.reset();
        }

        if (xor.input.checkKeys(["Escape"])) {
            if (xor.triggers.get("ESC").tick(xor.t1)) {
                this.pauseGame = !this.pauseGame;
                hflog.info(this.pauseGame ? "paused" : "not paused");
            }
        }

        if (xor.input.checkKeys(["Space"])) {
            if (xor.triggers.get("SPC").tick(xor.t1)) {
                hflog.info("pew!");
            }
        }

        let dx = xor.input.checkKeys(["ArrowRight"]) - xor.input.checkKeys(["ArrowLeft"]);
        let dy = xor.input.checkKeys(["ArrowDown"]) - xor.input.checkKeys(["ArrowUp"]);
        xor.graphics.sprites[0].position.x += dx * dt * 10;
        xor.graphics.sprites[0].position.y += dy * dt * 10;

        if (xor.input.mouseOver) {
            let w = xor.graphics.width;
            let h = xor.graphics.height;
            let x = xor.input.mouse.position.x;
            let y = xor.input.mouse.position.y;
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

        this.theta += dt;
    }

    updateControls() {
        this.BumpMix = getRangeValue("BumpMix");
        this.KsmMix = getRangeValue("KsmMix");
        this.Ksm = getRangeValue("Ksm");
        this.theta = getRangeValue("theta");
        this.Zoom = getRangeValue("Zoom");
        this.LightAngle = getRangeValue("LightAngle");
        this.MeshObject = getRangeValue("MeshObject");
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(XOR.Color.BLUE, XOR.Color.WHITE, 5);

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(this.azimuth, this.inclination, this.distance);
        let rc = xor.renderconfigs.use('default');

        if (rc) {
            rc.uniform1i('GBufferOutputType', 19);
            rc.uniform1f('MapKdMix', 1.0);
            rc.uniform1f('MapNormalMix', this.BumpMix);
            rc.uniform1f('KsRoughness', this.Ksm);
            rc.uniform1f('MapKsRoughnessMix', this.KsmMix);
            rc.uniform3f('Ks', Vector3.make(1, 1, 1));
            rc.uniform3f('SunDirTo', Vector3.makeUnit(cosd(this.LightAngle), 1, sind(this.LightAngle)));
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeRotation(this.theta, 0, 1, 0));
            rc.uniform3f('Kd', Vector3.make(1.0, 0.0, 0.0));
            switch (this.MeshObject) {
                case 0: xor.meshes.render('rect1', rc); break;
                case 1: xor.meshes.render('rect2', rc); break;
            }
            rc.restore();
        }

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