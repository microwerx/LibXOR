/// <reference path="Fluxions.ts" />

namespace Fluxions {
    export class FxTexture {
        public id: string = "";
        public minFilter = WebGLRenderingContext.NEAREST;
        public magFilter = WebGLRenderingContext.NEAREST;
        public wrapS = WebGLRenderingContext.REPEAT;
        public wrapT = WebGLRenderingContext.REPEAT;

        constructor(private fx: FxRenderingContext,
            public name: string, public url: string, public target: number, public texture: WebGLTexture) {
        }

        setMinMagFilter(minFilter: number, magFilter: number) {
            switch (minFilter) {
                case WebGLRenderingContext.NEAREST:
                case WebGLRenderingContext.LINEAR:
                case WebGLRenderingContext.NEAREST_MIPMAP_NEAREST:
                case WebGLRenderingContext.NEAREST_MIPMAP_LINEAR:
                case WebGLRenderingContext.LINEAR_MIPMAP_NEAREST:
                case WebGLRenderingContext.LINEAR_MIPMAP_LINEAR:
                    this.minFilter = minFilter;
                    break;
            }
            switch (magFilter) {
                case WebGLRenderingContext.NEAREST:
                case WebGLRenderingContext.LINEAR:
                    this.magFilter = magFilter;
                    break;
            }
        }

        setWrapST(wrapS: number, wrapT: number) {
            switch (wrapS) {
                case WebGLRenderingContext.REPEAT:
                case WebGLRenderingContext.CLAMP_TO_EDGE:
                case WebGLRenderingContext.MIRRORED_REPEAT:
                    this.wrapS = wrapS;
                    break;
            }
            switch (wrapT) {
                case WebGLRenderingContext.REPEAT:
                case WebGLRenderingContext.CLAMP_TO_EDGE:
                case WebGLRenderingContext.MIRRORED_REPEAT:
                    this.wrapT = wrapT;
                    break;
            }
        }

        bind() {
            this.fx.gl.bindTexture(this.target, this.texture);
        }
    }
}