/// <reference path="Fluxions.ts" />

class FxTexture {
    public id: string = "";

    constructor(private fx: FxRenderingContext,
        public name: string, public url: string, public target: number, public texture: WebGLTexture) {
    }
}
