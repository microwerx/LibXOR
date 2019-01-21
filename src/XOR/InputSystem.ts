/// <reference path="LibXOR.ts" />

class InputSystem {
    keys = new Map<string, number>();
    codes = new Map<string, number>();
    modifiers = 0;

    constructor(private xor: LibXOR) { }

    init() {
        let self = this;
        window.onkeydown = (e) => {
            self.onkeydown(e);
        };
        window.onkeyup = (e) => {
            self.onkeyup(e);
        };
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