/// <reference path="LibXOR.ts" />

class XORMouseEvent {
    constructor(
        public button = 0,
        public clicks = 0,
        public buttons = 0,
        public position = Vector2.make(0, 0),
        public screen = Vector2.make(0, 0),
        public delta = Vector2.make(0, 0),
        public ctrlKey = false,
        public altKey = false,
        public shiftKey = false,
        public metaKey = false
    ) { }

    copyMouseEvent(e: MouseEvent) {
        this.delta.x = e.offsetX - this.position.x;
        this.delta.y = e.offsetY - this.position.y;
        this.position.x = e.offsetX;
        this.position.y = e.offsetY;
        this.screen.x = e.screenX;
        this.screen.y = e.screenY;
        this.buttons = e.buttons;
        this.button = e.button;
        this.clicks = e.detail;
        this.ctrlKey = e.ctrlKey;
        this.altKey = e.altKey;
        this.shiftKey = e.shiftKey;
        this.metaKey = e.metaKey;
    }
}

class InputSystem {
    keys = new Map<string, number>();
    codes = new Map<string, number>();
    modifiers = 0;
    canvas: HTMLCanvasElement | null = null;
    mouseXY = Vector2.make(0, 0);
    mouse = new XORMouseEvent();
    mouseButtons = new Map<number, XORMouseEvent>();
    mouseOver = false;

    constructor(private xor: LibXOR) { }

    init() {
        let self = this;
        window.onkeydown = (e) => {
            self.onkeydown(e);
        };
        window.onkeyup = (e) => {
            self.onkeyup(e);
        };
        for (let i = 0; i < 5; i++) {
            this.mouseButtons.set(i, new XORMouseEvent());
        }
    }

    captureMouse(e: HTMLCanvasElement) {
        this.canvas = e;
        let self = this;
        this.canvas.onmousedown = (e) => {
            self.mouse.copyMouseEvent(e);
            let button = self.mouseButtons.get(e.button);
            if (button) {
                button.copyMouseEvent(e);
            }
        }
        this.canvas.onmouseup = (e) => {
            self.mouse.copyMouseEvent(e);
            let button = self.mouseButtons.get(e.button);
            if (button) {
                button.copyMouseEvent(e);
            }
        }
        this.canvas.onmousemove = (e) => {
            self.mouse.copyMouseEvent(e);
        }
        this.canvas.onmouseenter = (e) => {
            self.mouseOver = true;
        }
        this.canvas.onmouseleave = (e) => {
            self.mouseOver = false;
        }
    }

    checkKeys(keys: string[]): number {
        for (let key of keys) {
            if (this.codes.has(key)) {
                if (this.codes.get(key) != 0.0) {
                    return 1.0;
                }
            }
            if (this.keys.has(key)) {
                if (this.keys.get(key) != 0.0) {
                    return 1.0;
                }
            }
        }
        return 0.0;
    }

    get mousecurpos(): Vector2 { return this.mouse.position; }
    get mouseclick(): Vector2 { let b = this.mouseButtons.get(0); if (!b) return Vector2.make(0, 0); return b.position; }
    get mouseshadertoy(): Vector4 { return Vector4.make(this.mousecurpos.x, this.mousecurpos.y, this.mouseclick.x, this.mouseclick.y); }

    private changeModifier(bit: number, state: boolean) {
        bit = bit | 0;
        if (bit > 8) return;
        if (state) {
            this.modifiers |= bit;
        } else {
            this.modifiers &= ~bit;
        }
    }

    private translateKeyToCode(key: string): string {
        if (key.length == 1) {
            let s = key.toUpperCase();
            if (s[0] >= 'A' && s[0] <= 'Z')
                return 'Key' + s[0];
            if (s[0] >= '0' && s[0] <= '9')
                return 'Digit' + s[0];
            if (s[0] == ' ')
                return "Space";
        }

        if (key == "Left" || key == "ArrowLeft") return "ArrowLeft";
        if (key == "Right" || key == "ArrowRight") return "ArrowRight";
        if (key == "Up" || key == "ArrowUp") return "ArrowUp";
        if (key == "Down" || key == "ArrowDown") return "ArrowDown";
        if (key == "Esc" || key == "Escape") return "Escape";
        if (key == "Enter" || key == "Return") return "Enter";
        return "Unidentified";
    }

    onkeydown(e: KeyboardEvent) {
        if (e.key == "Shift") this.changeModifier(1, true);
        if (e.key == "Ctrl") this.changeModifier(2, true);
        if (e.key == "Alt") this.changeModifier(4, true);
        this.keys.set(e.key, 1);
        if (e.code != undefined) {
            this.codes.set(e.code, 1);
        } else {
            this.codes.set(this.translateKeyToCode(e.key), 1);
        }
        if (e.key == "F12") return;
        e.preventDefault();
    }

    onkeyup(e: KeyboardEvent) {
        if (e.key == "Shift") this.changeModifier(1, false);
        if (e.key == "Ctrl") this.changeModifier(2, false);
        if (e.key == "Alt") this.changeModifier(4, false);
        this.keys.set(e.key, 0);
        if (e.code != undefined) {
            this.codes.set(e.code, 0);
        } else {
            this.codes.set(this.translateKeyToCode(e.key), 0);
        }
        if (e.key == "F12") return;
        e.preventDefault();
    }
}