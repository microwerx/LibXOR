/// <reference path="Fluxions.ts" />

class FxRenderingContext {
    gl: WebGLRenderingContext;
    scenegraph: Scenegraph;

    get width(): number { return this.xor.graphics.width; }
    get height(): number { return this.xor.graphics.height; }
    get aspectRatio(): number { return this.width / this.height; }

    constructor(public xor: LibXOR) {
        if (!xor.graphics.gl) throw "Unable to start Fluxions without valid gl context";
        this.gl = xor.graphics.gl;

        let debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            let vendor = this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            let renderer = this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            hflog.log(vendor);
            hflog.log(renderer);
        }
        this.enableExtensions([
            "OES_standard_derivatives",
            "WEBGL_depth_texture",
            "OES_element_index_uint",
            "EXT_texture_filter_anisotropic",
            "OES_texture_float",
            "OES_texture_float_linear"
        ]);

        this.scenegraph = new Scenegraph(this);
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