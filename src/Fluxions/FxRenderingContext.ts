/// <reference path="Fluxions.ts" />
/// <reference path="FxFboSystem.ts" />
/// <reference path="FxTextureSystem.ts" />
/// <reference path="FxRenderConfigSystem.ts" />

namespace Fluxions {
    export class FxRenderingContext {
        gl: WebGLRenderingContext | WebGL2RenderingContext;
        scenegraph: FxScenegraph;
        textures: FxTextureSystem;
        fbos: FxFboSystem;
        renderconfigs: FxRenderConfigSystem;

        get width(): number { return this.xor.graphics.width; }
        get height(): number { return this.xor.graphics.height; }
        get aspectRatio(): number { return this.width / this.height; }

        constructor(public xor: LibXOR) {
            if (!xor.graphics.gl) {
                hflog.error("Unable to start Fluxions without valid gl context");
                throw "Unable to start Fluxions without valid gl context";
            }
            /** @property {WebGLRenderingContext} gl */
            this.gl = xor.graphics.gl;
            this.textures = new FxTextureSystem(this);
            this.fbos = new FxFboSystem(this);

            let debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                let vendor = this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                let renderer = this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                hflog.log(vendor);
                hflog.log(renderer);
            }

            if (xor.graphics.hasWebGL2) {
                this.enableExtensions([
                    "EXT_texture_filter_anisotropic",
                ]);
            } else {
                this.enableExtensions([
                    "EXT_texture_filter_anisotropic",
                    "WEBGL_depth_texture",
                    "WEBGL_debug_renderer_info",
                    "OES_element_index_uint",
                    "OES_standard_derivatives",
                    "OES_texture_float_linear",
                    "OES_texture_float",
                ]);
            }

            if (xor.graphics.hasWebGL2) {
                let GL = WebGL2RenderingContext;
                this.gl.hint(WebGL2RenderingContext.FRAGMENT_SHADER_DERIVATIVE_HINT, GL.NICEST);
            } else {
                let standardDerivatives = this.gl.getExtension('OES_standard_derivatives');
                if (standardDerivatives) {
                    this.gl.hint(standardDerivatives.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, this.gl.NICEST);
                }
            }

            this.scenegraph = new FxScenegraph(this);
            this.renderconfigs = new FxRenderConfigSystem(this);
        }

        private enabledExtensions: Map<string, any> = new Map<string, any>();
        private _visible: boolean = false;
        private _resized: boolean = true;


        // get visible(): boolean {
        //     return this._visible;
        // }

        // get canvas(): HTMLCanvasElement {
        //     if (!this.canvasElement_)
        //         return new HTMLCanvasElement();
        //     return this.canvasElement_;
        // }

        // ...
        enableExtensions(names: string[]): boolean {
            let supportedExtensions = this.gl.getSupportedExtensions();
            if (!supportedExtensions)
                return false;
            let allFound = true;
            for (let name of names) {
                let found = false;
                for (let ext of supportedExtensions) {
                    if (name == ext) {
                        this.enabledExtensions.set(name, this.gl.getExtension(name));
                        hflog.log("Extension " + name + " enabled")
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    hflog.log("Extension " + name + " not enabled")
                    allFound = false;
                    break;
                }
            }
            return allFound;
        }

        getExtension(name: string): any {
            if (this.enabledExtensions.has(name)) {
                return this.enabledExtensions.get(name);
            }
            return null;
        }

        update() {
            return;
            // if (this._resized) {
            //     this._resized = false;
            //     let w = (window.innerWidth) | 0;
            //     let h = (w / this.aspectRatio) | 0;
            //     this.canvas.width = w;
            //     this.canvas.height = h;
            //     this.width = w;
            //     this.height = h;
            // }
        }
    }
}