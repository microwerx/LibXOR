/// <reference path="FxFBO.ts" />
/// <reference path="FxRenderingContext.ts" />

namespace Fluxions {
    export class FxFboSystem {
        private _fbo: Map<string, FxFBO> = new Map<string, FxFBO>();
        private currentFBO: FxFBO | null = null;

        constructor(public fx: FxRenderingContext) {

        }

        /**
         * Returns null or the FBO referred to by name
         * @param name The name of the FBO
         */
        get(name: string): FxFBO | null {
            return this._fbo.get(name) || null;
        }

        /**
         * Creates a new FBO and adds it to the scene graph
         * @param name The name of the FBO
         * @param hasDepth Does the FBO have a depth attachment
         * @param hasColor Does the FBO have a color attachment
         * @param width The width of the FBO (should be power of two)
         * @param height The height of the FBO (should be power of two)
         * @param colorType 0 for gl.UNSIGNED_BYTE or 1 for gl.FLOAT
         */
        add(name: string,
            hasColor: boolean,
            hasDepth: boolean,
            width: number,
            height: number,
            colorType: number,
            depthType: number): FxFBO | null {
            this._fbo.set(name, new FxFBO(this.fx, hasColor, hasDepth, width, height, colorType, depthType));
            return this.get(name);
        }

        /**
         * autoresize
         */
        autoresize() {
            let fx = this.fx;
            this._fbo.forEach((fbo) => {
                if (fbo.width != fx.width || fbo.height != fx.height) {
                    fbo.autoResize(fx.width, fx.height);
                }
            });
        }

        restore() {
            if (this.currentFBO) {
                this.currentFBO.restore();
                this.currentFBO = null;
            } else {
                for (let fbo of this._fbo) {
                    if (fbo[1].complete) fbo[1].unbindTextures()
                }
            }
        }

        configure(rc: FxRenderConfig, startUnit = 11) {
            if (rc.writeToFBO != "") {
                let fbo = this.get(rc.writeToFBO);
                if (fbo) {
                    fbo.use(rc.clearWriteToFBO, rc.disableWriteToFBOColorWrites);
                    this.currentFBO = fbo;
                }
            }
            let unit = startUnit;
            for (let fbo of rc.readFromFBOs) {
                this.configureFBO(rc, fbo, unit, unit + 1);
                unit += 2;
            }
        }

        configureFBO(rc: FxRenderConfig, name: string, colorUnit: number, depthUnit: number) {
            const colorUniform = name + "Color";
            const depthUniform = name + "Depth";
            const resolutionUnifom = name + "Resolution";
            const usingUniform = name + "Enabled";
            let fbo = this._fbo.get(name) || null;
            if (!fbo) return;
            if (!rc.writesToFBO && fbo.complete) {
                rc.uniform2f(resolutionUnifom, fbo.dimensions);
                rc.uniform1f(usingUniform, rc.writesToFBO ? 0 : 1);
                fbo.bindTextures(colorUnit, depthUnit);
                if (fbo.color) rc.uniform1i(colorUniform, colorUnit);
                if (fbo.depth) rc.uniform1i(depthUniform, depthUnit);
            } else {
                rc.uniform1i(colorUniform, 0);
                rc.uniform1i(depthUniform, 0);
            }
        }
    }
}