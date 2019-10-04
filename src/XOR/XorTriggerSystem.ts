/// <reference path="LibXOR.ts" />
/// <reference path="XorTrigger.ts" />

namespace XOR {
    export class TriggerSystem {
        public triggers = new Map<string, Trigger>();

        constructor() {

        }

        set(name: string, time: number) {
            this.triggers.set(name, new Trigger(time));
        }

        get(name: string): Trigger {
            let t = this.triggers.get(name);
            if (!t) return new Trigger(0);
            return t;
        }
    }
}