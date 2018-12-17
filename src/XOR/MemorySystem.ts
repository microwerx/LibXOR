import { LibXOR } from "./LibXOR";

export class MemorySystem {
    private mem: Int32Array = new Int32Array(65536);

    constructor(private xor: LibXOR) {

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