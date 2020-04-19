///* global XOR Vector3 Matrix4 BoundingBox createButtonRow createRangeRow setIdToHtml createCheckRow createDivRow setDivRowContents getCheckValue */
/// <reference path="../LibXOR.d.ts" />
/// <reference path="htmlutils.js" />
/// <reference path="ecs.js" />


class PositionComponent {
    /**
     * Creates data for positionable entity
     * @param {Vector3} p position of entity
     * @param {BoundingBox} bbox bounding box of entity
     */
    constructor(p, bbox) {
        this.position = p;
        this.bbox = bbox;
    }
}


class PhysicsComponent {
    /**
     * Creates data for physics component
     * @param {Vector3} v velocity of entity
     * @param {number} mass mass of entity in KG
     */
    constructor(v, mass) {
        this.velocity = v;
        this.mass = mass;
    }
}


class RenderComponent {
    /**
     * Creates data for render component
     * @param {string} meshName name of mesh to render
     * @param {Matrix4} worldMatrix scaling matrix
     * @param {Vector3} color color of mesh to render
     */
    constructor(meshName, worldMatrix, color) {
        this.meshName = meshName;
        this.worldMatrix = worldMatrix;
        this.color = color;
    }
}


class App {
    constructor() {
        this.xor = new LibXOR("project");

        this.hudCanvas = document.createElement("canvas");
        this.hudCanvas.style.position = "absolute";
        this.hudCanvas.style.zIndex = 5;

        setIdToHtml("<p>This is a test of the LibXOR retro console.</p>");

        let self = this;
        let controls = document.getElementById('controls');
        createButtonRow(controls, "bReset", "Reset", () => {
            self.reset();
        });
        createButtonRow(controls, "bZSDF", "ZSDF/WASD", () => { self.euroKeys = 1 - self.euroKeys; });
        createCheckRow(controls, "zasdKeys", false);
        createRangeRow(controls, "SOffsetX", 0, -8, 8);
        createRangeRow(controls, "SOffsetY", 0, -8, 8);
        createRangeRow(controls, "SZoomX", 1.0, 0.0, 4.0, 0.1);
        createRangeRow(controls, "SZoomY", 1.0, 0.0, 4.0, 0.1);
        createRangeRow(controls, "playTrack", 0, 0, 7);
        createRangeRow(controls, "sfxTrack", 0, 0, 15);
        createButtonRow(controls, "bPlayTrack", "Play Track", () => {
            self.playMusic(getRangeValue("playTrack"));
        });
        createButtonRow(controls, "bPlaySFX", "Play SFX", () => {
            self.playSfx(getRangeValue("sfxTrack"));
        });

        this.theta = 0;

        this.mouse = Vector3.make(0, 0, 0);
        this.click = Vector3.make(0, 0, 0);

        this.ecs = new XOR.ECS();
        this.components = {};
        this.components.positionID = this.ecs.addComponent('position', 'Location of entity');
        this.components.physicsID = this.ecs.addComponent('physics', 'physics info of entity');
        this.components.renderID = this.ecs.addComponent('render', 'renderable info of entity');
        this.assemblages = {};
        this.assemblages.physicalID = this.ecs.addAssemblage();
        this.ecs.addComponentToAssemblage(this.assemblages.physicalID, this.components.positionID);
        this.ecs.addComponentToAssemblage(this.assemblages.physicalID, this.components.physicsID);
        this.ecs.addComponentToAssemblage(this.assemblages.physicalID, this.components.renderID);
        this.player1ID = this.ecs.addEntity('player1', 'player 1');
        this.player2ID = this.ecs.addEntity('player2', 'player 2');
        this.ecs.addAssemblageToEntity(this.player1ID, this.assemblages.physicalID);
        this.ecs.addAssemblageToEntity(this.player2ID, this.assemblages.physicalID);

        let bboxSizeOne = new GTE.BoundingBox(Vector3.make(-0.5, -0.5, -0.5), Vector3.make(0.5, 0.5, 0.5));
        // initialize positions
        this.ecs.setComponentData(this.player1ID, this.components.positionID, new PositionComponent(Vector3.make(0, 0, 0), bboxSizeOne.clone()));
        this.ecs.setComponentData(this.player2ID, this.components.positionID, new PositionComponent(Vector3.make(0, 0, 0), bboxSizeOne.clone()));

        // initialize physics
        this.ecs.setComponentData(this.player1ID, this.components.physicsID, new PhysicsComponent(Vector3.make(0, 0, 0), 1.0));
        this.ecs.setComponentData(this.player2ID, this.components.physicsID, new PhysicsComponent(Vector3.make(0, 0, 0), 1.0));

        // initialize graphics
        this.ecs.setComponentData(this.player1ID, this.components.renderID, new RenderComponent("dragon", Matrix4.makeIdentity(), XOR.Colors[XOR.Color.CYAN]));
        this.ecs.setComponentData(this.player2ID, this.components.renderID, new RenderComponent("bunny", Matrix4.makeIdentity(), XOR.Colors[XOR.Color.ROSE]));

        this.euroKeys = 0;
        this.xmoveKeys = [["KeyA", "KeyD"], ["KeyQ", "KeyD"]];
        this.zmoveKeys = [["KeyW", "KeyS"], ["KeyZ", "KeyS"]];
        this.zturnKeys = [["KeyQ", "KeyE"], ["KeyA", "KeyE"]];
        this.ymoveKeys = [["KeyC", "KeyZ"], ["KeyC", "KeyW"]];
        this.yturnKeys = [["ArrowLeft", "ArrowRight"], ["ArrowLeft", "ArrowRight"]];
        this.xturnKeys = [["ArrowUp", "ArrowDown"], ["ArrowUp", "ArrowDown"]];

        this.p1x = 0;
        this.p2x = 0;
        this.p1y = 0;
        this.p2y = 0;
        this.ENTERbutton = 0;
        this.BACKbutton = 0;
        this.SPACEbutton = 0;
        this.TABbutton = 0;

        this.xor.triggers.set("ESC", 60.0 / 120.0);
        this.xor.triggers.set("SPC", 0.033);
        this.xor.triggers.set("ENT", 0.033);
    }

    /**
     * 
     * @param {number} entityID which entityID
     * @returns {PositionComponent} returns position component for entityID
     */
    getPositionComponent(entityID) {
        return this.ecs.getComponentData(entityID, this.components.positionID);
    }

    /**
     * 
     * @param {number} entityID which entityID
     * @returns {PhysicsComponent} returns physics component for entityID
     */
    getPhysicsComponent(entityID) {
        return this.ecs.getComponentData(entityID, this.components.physicsID);
    }

    /**
     * 
     * @param {number} entityID which entityID
     * @returns {RenderComponent} returns render component for entityID
     */
    getRenderComponent(entityID) {
        return this.ecs.getComponentData(entityID, this.components.renderID);
    }

    /**
     * getAxis(keysToCheck)
     * @param {string[]} keysToCheck a two element string array
     */
    getAxis(keysToCheck) {
        let neg = this.xor.input.checkKeys([keysToCheck[this.euroKeys][0]]);
        let pos = this.xor.input.checkKeys([keysToCheck[this.euroKeys][1]]);
        return pos - neg;
    }

    /**
     * playMusic(index)
     * @param {number} index Which slot to start playing
     */
    playMusic(index) {
        this.xor.sound.jukebox.play(index | 0);
    }

    /**
     * playSfx(index)
     * @param {number} index Which slot to start playing
     */
    playSfx(index) {
        this.xor.sound.sampler.playSample(index & 0xF, false, 0);
    }

    /**
     * init()
     */
    init() {
        hflog.logElement = "log";
        this.xor.input.init();
        this.xor.sound.init();
        this.xor.graphics.init();
        this.xor.graphics.setVideoMode(1.5 * 384, 384);

        this.hudCanvas.width = 1.5 * 384;
        this.hudCanvas.height = 384;
        let p = document.getElementById('project');
        p.appendChild(this.hudCanvas);
        this.hud2d = this.hudCanvas.getContext("2d");

        this.reset();

        this.loadGraphics();
        this.loadSounds();
        this.loadMusic();
    }

    loadGraphics() {
        this.xor.renderconfigs.load('default', 'shaders/basic.vert', 'shaders/libxor.frag');

        let bbox = new GTE.BoundingBox();
        bbox.add(Vector3.make(-0.5, -0.5, -0.5));
        bbox.add(Vector3.make(0.5, 0.5, 0.5));
        this.xor.meshes.load('dragon', 'models/dragon.obj', bbox);
        this.xor.meshes.load('bunny', 'models/bunny.obj', bbox);
    }

    loadSounds() {
        this.xor.sound.sampler.loadSample(0, "sounds/BassDrum1.wav");
        this.xor.sound.sampler.loadSample(1, "sounds/BassDrum2.wav");
    }

    loadMusic() {
        this.xor.sound.jukebox.add(0, "music/noise.mp3");
        this.xor.sound.jukebox.add(1, "music/maintheme.mp3");
        this.xor.sound.jukebox.add(2, "music/adventuretheme.mp3");
        this.xor.sound.jukebox.add(3, "music/arcadetheme.mp3");
    }

    reset() {
        let spr = this.xor.graphics.sprites[0];
        if (spr) {
            spr.enabled = true;
            spr.position.reset(50, 50, 0);
        }

        spr = this.xor.graphics.sprites[1];
        if (spr) {
            spr.enabled = true;
            spr.position.reset(58, 50, 0);
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
            xor.input.resetKeys(["Space"]);
            if (xor.triggers.get("SPC").tick(xor.t1)) {
                hflog.info("pew!");
            }
        }

        this.p1x = this.getAxis(this.xmoveKeys);
        this.p1y = this.getAxis(this.zmoveKeys);
        this.p2x = this.getAxis(this.yturnKeys);
        this.p2y = this.getAxis(this.xturnKeys);
        xor.graphics.sprites[0].position.x += this.p1x * dt * 10;
        xor.graphics.sprites[0].position.y += this.p1y * dt * 10;
        xor.graphics.sprites[1].position.x += this.p2x * dt * 10;
        xor.graphics.sprites[1].position.y += this.p2y * dt * 10;

        let p1 = this.getPhysicsComponent(this.player1ID);
        if (p1) {
            p1.velocity.reset(this.p1x, -this.p1y, 0);
        }
        let p2 = this.getPhysicsComponent(this.player2ID)
        if (p2) p2.velocity.reset(this.p2x, -this.p2y, 0);

        for (let i = 0; i < 4; i++) {
            let spr = xor.graphics.sprites[2 + i];
            let gp = xor.input.gamepads.get(i);
            if (gp.enabled) {
                spr.enabled = true;
                spr.position.x += gp.axe(0) * dt * 10;
                spr.position.y += gp.axe(1) * dt * 10;
                p1.velocity.reset(gp.axe(0), gp.axe(1), 0);
            } else {
                spr.enabled = false;
            }
        }

        if (xor.input.touches[0].pressed) {
            let w = xor.graphics.width >> 1;
            let h = xor.graphics.height >> 1;
            if (p2) {
                let p2pos = this.getPositionComponent(this.player2ID);
                p2.velocity = Vector3.makeUnit(
                    xor.input.touches[0].x - w,
                    -xor.input.touches[0].y + h,
                    0);
            }
        } else {
            p2.velocity.reset(0, 0, 0);
        }

        if (xor.input.mouseOver) {
            let w = xor.graphics.width;
            let h = xor.graphics.height;
            let x = xor.input.mouse.position.x;
            let y = xor.input.mouse.position.y;
            this.mouse.x = x / w;
            this.mouse.y = y / h;
            if (xor.input.mouseButtons.get(0)) {
                this.click.x = x / w;
                this.click.y = y / h;
            }
        }

        this.updatePhysics();

        this.theta += dt;
    }

    updateControls() {
        let xor = this.xor;
        xor.graphics.setOffset(getRangeValue("SOffsetX"), getRangeValue("SOffsetY"));
        xor.graphics.setZoom(getRangeValue("SZoomX"), getRangeValue("SZoomY"));
    }

    /**
     * @returns {PositionComponents[]} array of position components
     */
    get positionComponents() {
        let cID = this.components.positionComponents;
        let components = [];
        let entities = this.ecs.getEntitiesWithComponent(cID);
        for (let eID of entities) {
            let data = this.ecs.getComponentData(eID, cID);
            if (data) components.push(data);
        }
        return components;
    }

    /**
     * @returns {PhysicsComponent[]} array of physics components
     */
    get physicsComponents() {
        let cID = this.components.physicsComponents;
        let components = [];
        let entities = this.ecs.getEntitiesWithComponent(cID);
        for (let eID of entities) {
            let data = this.ecs.getComponentData(eID, cID);
            if (data) components.push(data);
        }
        return components;
    }

    updatePhysics() {
        let positionID = this.components.positionID;
        let physicsID = this.components.physicsID;
        let renderID = this.components.renderID;
        let physicalID = this.assemblages.physicalID;
        let entities = this.ecs.getEntitiesWithAssemblage(physicalID);

        for (let eID of entities) {
            let position = this.ecs.getComponentData(eID, positionID);
            let physics = this.ecs.getComponentData(eID, physicsID);
            let render = this.ecs.getComponentData(eID, renderID);
            position.position.accum(physics.velocity, this.xor.dt);
            render.worldMatrix.loadIdentity();
            render.worldMatrix.translate3(position.position);
        }
    }

    /**
     * @returns {RenderComponent[]} array of render components
     */
    get renderComponents() {
        let cID = this.components.renderID;
        let components = [];
        let entities = this.ecs.getEntitiesWithComponent(cID);
        for (let eID of entities) {
            let data = this.ecs.getComponentData(eID, cID);
            if (data) components.push(data);
        }
        return components;
    }

    render() {
        let xor = this.xor;
        xor.graphics.clear(XOR.Color.BLUE, XOR.Color.WHITE, 5);

        if (!this.pauseGame) {
            xor.graphics.render();
        }

        let pmatrix = Matrix4.makePerspectiveY(45.0, 1.5, 1.0, 100.0);
        let cmatrix = Matrix4.makeOrbit(-90, 0, 5.0);
        let rc = xor.renderconfigs.use('default');

        if (rc) {
            rc.uniformMatrix4f('ProjectionMatrix', pmatrix);
            rc.uniformMatrix4f('CameraMatrix', cmatrix);
            rc.uniformMatrix4f('WorldMatrix', Matrix4.makeRotation(this.theta * 30, 0, 1, 0));
            rc.uniform3f('Kd', Vector3.make(1.0, 0.0, 0.0));

            let renderables = this.renderComponents;
            for (let r of renderables) {
                rc.uniformMatrix4f('WorldMatrix', r.worldMatrix);
                rc.uniform3f('Kd', r.color);
                xor.meshes.render(r.meshName, rc);
            }

            rc.restore();
        }

    }

    renderHUD() {
        this.hud2d.font = "Minute 20px";
        this.hud2d.fillStyle = "#ff0000";
        this.hud2d.fillText("LibXOR", 10, 10);
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.xor.startFrame(t);
            self.xor.input.poll();
            self.xor.sound.update();
            self.update(self.xor.dt);
            self.render();
            self.renderHUD();
            self.mainloop();
        });
    }
}

let app = new App();
app.init();
app.start();