/// <reference path="LibXOR.ts" />

class MemorySystem {
    private mem: Int32Array = new Int32Array(65536);

    readonly PALETTESTART = 0x1000;
    readonly PALETTECOUNT = 16 * 16;

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