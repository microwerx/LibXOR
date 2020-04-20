/// <reference path="../Hatchetfish.ts" />
/// <reference path="../GTE/GTE.ts" />
/// <reference path="XorUtils.ts" />
/// <reference path="XorMemorySystem.ts" />
/// <reference path="XorGraphicsSystem.ts" />
/// <reference path="XorSoundSystem.ts" />
/// <reference path="XorInputSystem.ts" />
/// <reference path="XorPaletteSystem.ts" />
/// <reference path="XorMeshSystem.ts" />
/// <reference path="XorTextFileLoaderSystem.ts" />
/// <reference path="XorTriggerSystem.ts" />
/// <reference path="../Fluxions/Fluxions.ts" />

type FxIndexedGeometryMesh = Fluxions.FxIndexedGeometryMesh;
type FxRenderConfig = Fluxions.FxRenderConfig;
type FxRenderingContext = Fluxions.FxRenderingContext;

/**
 * @class LibXOR
 * @member {FxRenderingContext} fluxions
 */
class LibXOR {
    public t1 = 0.0;
    public t0 = 0.0;
    public dt = 0.0;
    private baset = 0.0;
    public frameCount = 0;

    public parentElement: HTMLElement;
    public graphics: XOR.GraphicsSystem;
    public fluxions: FxRenderingContext;
    public memory = new XOR.MemorySystem(this);
    public sound = new XOR.SoundSystem(this);
    public input = new XOR.InputSystem(this);
    public palette = new XOR.PaletteSystem(this);
    public meshes = new XOR.MeshSystem(this);
    public textfiles = new XOR.TextFileLoaderSystem();
    public triggers = new XOR.TriggerSystem();

    public oninit = () => { };
    public onupdate = (dt: number) => { };

    constructor(public parentId: string) {
        let n = document.getElementById(parentId);
        if (!n) throw "Unable to initialize LibXOR due to bad parentId '" + parentId.toString() + "'";
        this.parentElement = n;

        this.graphics = new XOR.GraphicsSystem(this);
        this.fluxions = new Fluxions.FxRenderingContext(this);
    }

    get renderconfigs(): Fluxions.FxRenderConfigSystem { return this.fluxions.renderconfigs; }
    get fx(): FxRenderingContext { return this.fluxions; }

    resetClock() {
        this.baset = this.t1 * 1000;
        this.t0 = 0;
        this.t1 = 0;
        this.dt = 0;
    }

    start() {
        this.t0 = 0;
        this.t1 = 0;
        this.dt = 0;
        this.frameCount = 0;
        this.memory.init();
        this.graphics.init();
        this.sound.init();
        this.input.init();
        this.oninit();
        this.mainloop();
    }

    startFrame(t: number) {
        t -= this.baset;
        this.t0 = this.t1;
        this.t1 = t / 1000.0;
        this.dt = this.t1 - this.t0;
        this.frameCount++;
    }

    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.startFrame(t);
            self.onupdate(this.dt);
            self.graphics.readFromMemory();
            self.graphics.render();
            self.mainloop();
        });
    }
}