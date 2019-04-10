/// <reference path="Fluxions.ts" />

namespace Fluxions {
    export class FxTexture {
        public id: string = "";

        constructor(private fx: FxRenderingContext,
            public name: string, public url: string, public target: number, public texture: WebGLTexture) {
        }
    }
}