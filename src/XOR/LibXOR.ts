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
        this.oninit();
        this.mainloop();
    }

    mainloop() {
        window.requestAnimationFrame((t) => {
            this.t0 = this.t1;
            this.t1 = t;
            this.dt = this.t1 - this.t0;

            this.onupdate(this.dt);
            this.graphics.render();
        });
    }
}