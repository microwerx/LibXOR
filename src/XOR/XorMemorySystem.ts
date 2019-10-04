/// <reference path="LibXOR.ts" />

namespace XOR {
    export class MemorySystem {
        private intmem: Int32Array = new Int32Array(65536);
        private fltmem: Float32Array = new Float32Array(65536);
        private vecmem: Array<Vector4> = new Array<Vector4>(65536);
        private colmem: Array<Vector4> = new Array<Vector4>(65536);

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
                this.intmem[i] = 0;
            }
        }

        PEEK(location: number): number {
            if (location < 0 || location > 65536) {
                return 0;
            }
            return this.intmem[location];
        }

        POKE(location: number, value: number) {
            if (location < 0 || location > 65535) {
                return;
            }
            this.intmem[location] = value | 0;
        }

        IPEEK(location: number): number {
            return this.intmem[location & 0xFFFF];
        }

        FPEEK(location: number): number {
            return this.fltmem[location & 0xFFFF];
        }

        VPEEK(location: number): Vector4 {
            return this.vecmem[location & 0xFFFF];
        }

        CPEEK(location: number): Vector4 {
            return this.colmem[location & 0xFFFF];
        }

        IPOKE(location: number, value: number): void {
            this.intmem[location & 0xFFFF] = value & ~0;
        }

        FPOKE(location: number, value: number): void {
            this.fltmem[location & 0xFFFF] = value;
        }

        VPOKE(location: number, value: Vector4): void {
            this.vecmem[location & 0xFFFF] = value;
        }

        CPOKE(location: number, value: Vector4): void {
            this.colmem[location & 0xFFFF] = value.clamp(0, 255);
        }
    }
}