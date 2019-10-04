/// <reference path="LibXOR.ts" />
/// <reference path="XorMouseEvent.ts" />
/// <reference path="XorGamepadState.ts" />
/// <reference path="XorTouchState.ts" />

namespace XOR {
    export class InputSystem {
        /** @type {Map<string, number} */
        keys = new Map<string, number>();
        /** @type {Map<string, number} */
        codes = new Map<string, number>();
        modifiers = 0;
        canvas: HTMLCanvasElement | null = null;
        mouseXY = Vector2.make(0, 0);
        mouse = new XORMouseEvent();
        /** @type {Map<number, XORMouseEvent>} */
        mouseButtons = new Map<number, XORMouseEvent>();
        mouseOver = false;
        /** @type {Map<number, XORGamepadState>} */
        gamepads: Map<number, XORGamepadState> = new Map<number, XORGamepadState>();
        gamepadAPI = false;
        touches = [
            new TouchState(),
            new TouchState(),
            new TouchState(),
            new TouchState(),
            new TouchState()
        ];

        constructor(public xor: LibXOR) { }

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

            for (let i = 0; i < 5; i++) {
                this.gamepads.set(i, new XORGamepadState());
            }
            window.addEventListener("gamepadconnected", (ev: Event | GamepadEvent) => {
                let e = <GamepadEvent>(ev);
                let gp = new XORGamepadState();
                gp.enabled = true;
                gp.id = e.gamepad.id;
                gp.numButtons = e.gamepad.buttons.length;
                gp.numAxes = e.gamepad.buttons.length;
                gp.copyInfo(e.gamepad);
                self.gamepads.set(e.gamepad.index, gp);
                hflog.info("gamepad %d connected", e.gamepad.index);
            });
            window.addEventListener("gamepaddisconnected", (ev: Event | GamepadEvent) => {
                let e = <GamepadEvent>(ev);
                let gp = self.gamepads.get(e.gamepad.index);
                if (gp) {
                    gp.enabled = false;
                }
                hflog.info("gamepad %d disconnected", e.gamepad.index);
            });
            this.gamepadAPI = true;
            hflog.info("capturing gamepads");
        }

        poll() {
            let gamepads = navigator.getGamepads();
            if (gamepads) {
                for (let i = 0; i < gamepads.length; i++) {
                    let gp = this.gamepads.get(i);
                    let gamepad = gamepads[i];
                    if (gamepad && gp) {
                        gp.copyInfo(gamepad);
                    }
                }
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
            this.captureTouches();
        }

        captureTouches() {
            if (!this.canvas) {
                hflog.error("Cannot register touches");
                return;
            }
            let self = this;
            this.canvas.addEventListener('touchstart', (ev) => {
                if (ev.targetTouches.length > 0) {
                    ev.preventDefault();
                } else {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }

                for (let i = 0; i < self.touches.length; i++) {
                    if (i < ev.targetTouches.length)
                        self.touches[i].handleTouch(ev.targetTouches[i], true, true);
                    else
                        self.touches[i].handleTouch(ev.targetTouches[i], false, true);
                }
            });
            this.canvas.addEventListener('touchend', (ev) => {
                if (ev.targetTouches.length > 0) {
                    ev.preventDefault();
                } else {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }

                if (ev.touches.length == 0) {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }

                for (let i = 0; i < self.touches.length; i++) {
                    if (i < ev.targetTouches.length)
                        self.touches[i].handleTouch(ev.targetTouches[i], true, false);
                    else
                        self.touches[i].handleTouch(ev.targetTouches[i], false, false);
                }
            });
            this.canvas.addEventListener('touchmove', (ev) => {
                if (ev.targetTouches.length > 0) {
                    ev.preventDefault();
                } else {
                    for (let i = 0; i < self.touches.length; i++) {
                        self.touches[i].pressed = false;
                    }
                }

                for (let i = 0; i < self.touches.length; i++) {
                    if (i < ev.targetTouches.length)
                        self.touches[i].handleTouch(ev.targetTouches[i], true, false);
                    else
                        self.touches[i].handleTouch(ev.targetTouches[i], false, false);
                }
            });
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
        get mouseButton1(): boolean { return (this.mouse.buttons & 1) > 0; }
        get mouseButton2(): boolean { return (this.mouse.buttons & 2) > 0; }
        get mouseButton3(): boolean { return (this.mouse.buttons & 4) > 0; }

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
            if (e.key == "i" && this.modifiers == 3) return;
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
            if (e.key == "i" && this.modifiers == 3) return;
            e.preventDefault();
        }
    }
}