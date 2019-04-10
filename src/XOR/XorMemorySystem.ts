/// <reference path="LibXOR.ts" />

namespace XOR {
    export class MemorySystem {
        private mem: Int32Array = new Int32Array(65536);

        // handy reminders
        // 0x1000 = 4096
        // 0x100 = 256
        // 0x10 = 16
        // Start of VIC memory
        readonly VICSTART = 0x1000;
        readonly VICCOUNT = 256;
        readonly PALETTESTART = 0x1100;
        readonly PALETTECOUNT = 16 * 16;
        readonly SPRITESHEETSTART = 0x2000;
        readonly SPRITESHEETCOUNT = 0x1000;

        constructor(private xor: LibXOR) {

        }

        init() {
            for (let i = 0; i < 65536; i++) {
                this.mem[i] = 0;
            }
        }

        PEEK(location: number): number {
            if (location < 0 || location > 65536) {
                return 0;
            }
            return this.mem[location];
        }

        POKE(location: number, value: number) {
            if (location < 0 || location > 65535) {
                return;
            }
            this.mem[location] = value | 0;
        }
    }
}