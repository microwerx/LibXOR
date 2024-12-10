/// <reference path="./FxRenderingContext.ts" />
/// <reference path="../LibXOR.ts" />

namespace Fluxions {
    export class FxTextureSystem {
        private _textures: Map<string, FxTexture> = new Map<string, FxTexture>();
        // private _cubeTextures: Map<string, WebGLTexture> = new Map<string, WebGLTexture>();
        private _default2D: FxTexture;
        private _defaultCube: FxTexture;
        private imagefiles: XOR.ImageFileLoader[] = [];

        defaultWrapS = WebGLRenderingContext.REPEAT;
        defaultWrapT = WebGLRenderingContext.REPEAT;
        defaultMinFilter = WebGLRenderingContext.NEAREST;
        defaultMagFilter = WebGLRenderingContext.NEAREST;

        /**
         * 
         * @param {FxRenderingContext} fx The rendering context
         */
        constructor(public fx: FxRenderingContext) {
            let GL = WebGL2RenderingContext;
            let gl = fx.gl;
            let tex2D = gl.createTexture();
            let texCube = gl.createTexture();
            if (!texCube || !tex2D) {
                throw TypeError("texCube or tex2D is not valid");
            }
            let pixels = new ImageData(new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255]), 2, 2);
            gl.bindTexture(gl.TEXTURE_2D, tex2D);
            gl.texImage2D(gl.TEXTURE_2D, 0, GL.SRGB8_ALPHA8, GL.RGBA, gl.UNSIGNED_BYTE, pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            let xppixels = new ImageData(new Uint8ClampedArray([127, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 127, 0, 0, 255]), 2, 2);
            let xnpixels = new ImageData(new Uint8ClampedArray([0, 127, 127, 255, 0, 255, 255, 255, 0, 255, 255, 255, 0, 127, 127, 255]), 2, 2);
            let yppixels = new ImageData(new Uint8ClampedArray([0, 127, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 127, 0, 255]), 2, 2);
            let ynpixels = new ImageData(new Uint8ClampedArray([127, 0, 127, 255, 255, 0, 255, 255, 255, 0, 255, 255, 127, 0, 127, 255]), 2, 2);
            let zppixels = new ImageData(new Uint8ClampedArray([0, 0, 127, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 127, 255]), 2, 2);
            let znpixels = new ImageData(new Uint8ClampedArray([127, 127, 0, 255, 255, 255, 0, 255, 255, 255, 0, 255, 127, 127, 0, 255]), 2, 2);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texCube);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, xnpixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, ynpixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, znpixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, xppixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, yppixels);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, zppixels);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

            this._default2D = new FxTexture(this.fx, "__texture2D__", "", WebGLRenderingContext.TEXTURE_2D, tex2D);
            this._defaultCube = new FxTexture(this.fx, "__textureCube__", "", gl.TEXTURE_CUBE_MAP, texCube);
            this._textures.set("__texture2D__", this._default2D);
            this._textures.set("__textureCube__", this._defaultCube);
        }

        has(name: string): boolean {
            if (this._textures.has(name)) return true;
            return false;
        }

        get(name: string): FxTexture | null {
            let t = this._textures.get(name);
            if (t) return t;
            return null;
        }

        /**
         * 
         * @param {string} name name of the texture
         * @param {FxTexture} value 
         */
        set(name: string, value: FxTexture) {
            this._textures.set(name, value);
        }

        get loaded(): boolean {
            for (let i of this.imagefiles) {
                if (!i.loaded) return false;
            }
            return true;
        }

        get failed(): boolean {
            for (let i of this.imagefiles) {
                if (i.failed) return true;
            }
            return false;
        }

        get length(): number {
            return this.imagefiles.length;
        }

        get percentLoaded(): number {
            let a = 0;
            for (let i of this.imagefiles) {
                if (i.loaded) a++;
            }
            return 100.0 * a / this.imagefiles.length;
        }

        /**
         * @param {string} name the key to find this texture
         * @param {string} url  the url to load this texture
         */
        load(name: string, url: string) {
            if (this._textures.has(name))
                return;

            let self = this;
            let tname = name;
            this.imagefiles.push(new XOR.ImageFileLoader(url, (data, name) => {
                self.processTextureMap(data, tname);
                hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + tname);
            }));
        }

        wasRequested(name: string): boolean {
            for (let img of this.imagefiles) {
                if (img.name == name) return true;
            }
            return false;
        }

        // Creates a texture from an ImageData object
        createFromImageData(name: string, imageData: ImageData, width: number, height: number) {
            let canvas = document.createElement('canvas');
            if (!canvas) {
                hflog.error("createFromImageData: Cannot create a canvas");
                return;
            }
            let ctx = canvas.getContext('2d');
            if (!ctx) {
                hflog.error("createFromImageData: Cannot get a 2d context");
                return;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.putImageData(imageData, 0, 0);
            let dataURL = canvas.toDataURL();
            let newImage = document.createElement('img');
            let self = this
            newImage.onload = () => {
                self.processTextureMap(newImage, name);
            }
            newImage.src = dataURL;
        }

        private processTextureMap(image: HTMLImageElement, name: string): void {
            let GL = WebGL2RenderingContext;
            let gl = this.fx.gl;

            let minFilter = this.defaultMinFilter;
            let magFilter = this.defaultMagFilter;
            let wrapS = this.defaultWrapS;
            let wrapT = this.defaultWrapT;

            let maxAnisotropy = 1.0;
            let ext = this.fx.getExtension("EXT_texture_filter_anisotropic")
            if (ext) {
                maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            } else {
                hflog.debug("cannot use anisotropic filtering");
            }

            if (image.width == 6 * image.height) {
                let images: Array<ImageData> = new Array<ImageData>(6);
                XOR.SeparateCubeMapImages(image, images);
                let texture = gl.createTexture();
                if (texture) {
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    for (let i = 0; i < 6; i++) {
                        if (!images[i]) {
                            continue;
                        } else {
                            hflog.debug("image " + i + " w:" + images[i].width + "/h:" + images[i].height);
                        }
                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL.SRGB8_ALPHA8, GL.RGBA, gl.UNSIGNED_BYTE, images[i]);
                    }
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    let t = new FxTexture(this.fx, name, name, gl.TEXTURE_CUBE_MAP, texture);
                    this.fx.textures.set(name, t);
                }
            } else {
                let texture = gl.createTexture();
                if (texture) {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, GL.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    // gl.texImage2D(gl.TEXTURE_2D, 0, GL.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
                    if (ext) {
                        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
                    }
                    let t = new FxTexture(this.fx, name, name, gl.TEXTURE_2D, texture);
                    this.fx.textures.set(name, t);
                }
            }
        }
    }
}