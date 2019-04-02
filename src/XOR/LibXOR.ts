/// <reference path="../Hatchetfish.ts" />
/// <reference path="../Fluxions/GTE.ts" />
/// <reference path="XORUtils.ts" />
/// <reference path="Fluxions/Fluxions.ts" />
/// <reference path="MemorySystem.ts" />
/// <reference path="GraphicsSystem.ts" />
/// <reference path="SoundSystem.ts" />
/// <reference path="InputSystem.ts" />
/// <reference path="PaletteSystem.ts" />
/// <reference path="RenderConfigSystem.ts" />
/// <reference path="MeshSystem.ts" />
/// <reference path="XORTextFileLoaderSystem.ts" />

/**
 * @class LibXOR
 * @member {FxRenderingContext} fluxions
 */
class LibXOR {
    public t1 = 0.0;
    public t0 = 0.0;
    public dt = 0.0;
    public frameCount = 0;

    public parentElement: HTMLElement;
    public graphics: GraphicsSystem;
    public fluxions: FxRenderingContext;
    public memory = new MemorySystem(this);
    public sound = new XOR.SoundSystem(this);
    public input = new InputSystem(this);
    public palette = new PaletteSystem(this);
    public renderconfigs = new RenderConfigSystem(this);
    public meshes = new MeshSystem(this);
    public textfiles = new XORTextFileLoaderSystem();

    public oninit = () => { };
    public onupdate = (dt: number) => { };

    constructor(public parentId: string) {
        let n = document.getElementById(parentId);
        if (!n) throw "Unable to initialize LibXOR due to bad parentId '" + parentId.toString() + "'";
        this.parentElement = n;

        this.graphics = new GraphicsSystem(this);
        this.fluxions = new FxRenderingContext(this);
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