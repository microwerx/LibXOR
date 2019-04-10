/// <reference path="FxRenderingContext.ts" />

namespace Fluxions {
    export class FxTextureUniform {
        private texture: WebGLTexture | null = null;
        private sampler: null = null;

        /**
         * 
         * @param {string} textureName The name of the textures from the fx.textures[] array
         * @param {string} uniformName The name of the uniform to apply this texture to
         * @param {string} samplerName The name of the sampler params to apply (default "")
         */
        constructor(
            public textureName: string,
            public uniformName: string,
            public samplerName: string = ""
        ) { }

        getTexture(fx: FxRenderingContext): WebGLTexture | null {
            if (this.texture) return this.texture;
            let t = fx.textures.get(this.textureName);
            if (t) {
                this.texture = t.texture;
            }
            return this.texture;
        }
    }
}