/// <reference path="../GTE/GTE.ts" />
/// <reference path="LibXOR.ts" />

namespace XOR {
    /**
     * @member buttons Map<number, number>
     * @member axes Map<number, number>
     * @member enabled boolean
     */
    export class XORGamepadState {
        buttons = new Map<number, number>();
        axes = new Map<number, number>();
        lastButtons = 0;
        currentButtons = 0;
        anyButtonPressed = true;
        numButtons = 0;
        numAxes = 0;
        enabled = false;
        id: any = null;

        constructor() {
            for (let i = 0; i < 17; i++) {
                this.buttons.set(i, 0.0);
            }
        }

        copyInfo(state: Gamepad) {
            this.lastButtons = this.currentButtons;
            this.currentButtons = 0;

            let bit = 1;
            for (let i = 0; i < state.buttons.length; i++) {
                this.buttons.set(i, state.buttons[i].value);
                if (state.buttons[i].value != 0.0)
                    this.currentButtons |= bit;
                bit <<= 1;
            }

            if (this.currentButtons > 0 && this.currentButtons != this.lastButtons) {
                this.anyButtonPressed = true;
            }

            for (let i = 0; i < state.axes.length; i++) {
                this.axes.set(i, state.axes[i]);
            }
        }

        button(i: number): number {
            let v = this.buttons.get(i);
            if (v) return v;
            return 0.0;
        }

        axe(i: number): number {
            let v = this.axes.get(i);
            if (v) return v;
            return 0.0;
        }

        get left(): boolean { return this.button(14) > 0.5 || this.axe(0) < -0.5; }
        get right(): boolean { return this.button(15) > 0.5 || this.axe(0) > 0.5; }
        get up(): boolean { return this.button(12) > 0.5 || this.axe(1) < -0.5; }
        get down(): boolean { return this.button(13) > 0.5 || this.axe(1) > 0.5; }
        get b0(): boolean { return this.button(0) > 0.5; }
        get b1(): boolean { return this.button(1) > 0.5; }
        get b2(): boolean { return this.button(2) > 0.5; }
        get b3(): boolean { return this.button(3) > 0.5; }
        get leftright(): number { return (this.left ? -1.0 : 0.0) + (this.right ? 1.0 : 0.0); }
        get updown(): number { return (this.down ? -1.0 : 0.0) + (this.up ? 1.0 : 0.0); }
    }
}