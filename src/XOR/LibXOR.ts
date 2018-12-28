/// <reference path="../Fluxions/GTE.ts" />
/// <reference path="MemorySystem.ts" />
/// <reference path="GraphicsSystem.ts" />
/// <reference path="SoundSystem.ts" />
/// <reference path="InputSystem.ts" />

class LibXOR {
    public memory = new MemorySystem(this);
    public graphics = new GraphicsSystem(this);
    public sound = new SoundSystem(this);
    public input = new InputSystem(this);
    public parentElement: HTMLElement;

    public t1 = 0.0;
    public t0 = 0.0;
    public dt = 0.0;

    public oninit = () => { };
    public onupdate = (dt: number) => { };

    constructor(public parentId: string) {
        let n = document.getElementById(parentId);
        if (!n) throw "Unable to initialize LibXOR due to bad parentId '" + parentId.toString() + "'";
        this.parentElement = n;
    }

    start() {
        this.memory.init();
        this.graphics.init();
        this.sound.init();
        this.input.init();
        this.oninit();
        this.mainloop();
    }

    frameCount = 0;
    mainloop() {
        let self = this;
        window.requestAnimationFrame((t) => {
            self.t0 = this.t1;
            self.t1 = t / 1000.0;
            self.dt = this.t1 - this.t0;

            self.onupdate(this.dt);
            self.graphics.readFromMemory();
            self.graphics.render();
            self.mainloop();
        });
    }
}