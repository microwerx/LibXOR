/// <reference path="../GTE/GTE.ts" />
/// <reference path="LibXOR.ts" />
/// <reference path="XorMemorySystem.ts" />

namespace XOR {
    export class GraphicsSprite {
        position = GTE.vec3(0, 0, 0);
        pivot = GTE.vec3(0, 0, 0);
        bbox = new GTE.BoundingBox();
        palette = 0;
        index = 0;
        plane = 0;
        enabled = true;
        alpha = 1.0;
        fliph = false;
        flipv = false;
        rotate90 = 0;
        matrix: Matrix4 = Matrix4.makeIdentity();

        constructor() {
            this.bbox.add(Vector3.make(-4, -4, -4));
            this.bbox.add(Vector3.make(4, 4, 4));
        }

        readFromMemory(mem: XOR.MemorySystem, offset: number) {
            this.position.x = mem.PEEK(offset + 0);
            this.position.y = mem.PEEK(offset + 1);
            this.pivot.x = mem.PEEK(offset + 2);
            this.pivot.y = mem.PEEK(offset + 3);
            this.palette = mem.PEEK(offset + 4);
            this.index = mem.PEEK(offset + 5);
            this.plane = mem.PEEK(offset + 6);
            this.enabled = mem.PEEK(offset + 7) > 0.0 ? true : false;
            this.alpha = mem.PEEK(offset + 8);
            let rvh = mem.PEEK(offset + 9);
            this.fliph = (rvh & 1) ? true : false;
            this.flipv = (rvh & 2) ? true : false;
            this.rotate90 = (rvh >> 2) & 3;
            let M11 = mem.PEEK(offset + 10);
            let M12 = mem.PEEK(offset + 11);
            let M13 = mem.PEEK(offset + 12);
            let M21 = mem.PEEK(offset + 13);
            let M22 = mem.PEEK(offset + 14);
            let M23 = mem.PEEK(offset + 15);

            this.matrix.loadRowMajor(
                M11, M12, 0, M13,
                M21, M22, 0, M23,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        }
    }
}