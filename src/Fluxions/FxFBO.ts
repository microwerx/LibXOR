/// <reference path="../GTE/GTE.ts" />
/// <reference path="FxRenderingContext.ts" />

class FxFBO {
    private _fbo: WebGLFramebuffer;
    private _colorTexture: WebGLTexture | null = null;
    private _depthTexture: WebGLTexture | null = null;
    private _complete: boolean = false;
    private _colorUnit: number = -1;
    private _depthUnit: number = -1;
    private _savedViewport: Int32Array | undefined;
    private _depthTypeDesc: string = "NODEPTH";
    private _colorTypeDesc: string = "NOCOLOR";
    public clearColor: Vector3 = Vector3.make(0.2, 0.2, 0.2);
    // private _powerOfTwoDimensions: Vector2;

    get complete(): boolean { return this._complete; }
    get dimensions(): Vector2 { return Vector2.make(this.width, this.height); }

    fboStatusString(fboStatus: number): string {
        switch (fboStatus) {
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
                return "Incomplete Multisample";
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                return "Incomplete Dimensions";
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                return "Incomplete Missing Attachment"
            case WebGL2RenderingContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                return "Incomplete Attachment";
        }
        return "Complete"
    }

    constructor(private _renderingContext: FxRenderingContext,
        readonly color: boolean,
        readonly depth: boolean,
        public width: number = 512,
        public height: number = 512,
        private _colorType: number = 0,
        private _depthType: number = 0,
        public colorUnit: number = 11,
        public depthUnit: number = 12,
        readonly shouldAutoResize: boolean = false
    ) {
        let gl = _renderingContext.gl;
        let fbo = gl.createFramebuffer();
        if (fbo) {
            this._fbo = fbo;
        }
        else {
            throw "Unable to create FBO"
        }

        this.make();
    }

    autoResize(width: number, height: number) {
        if (!this.shouldAutoResize) return;
        if (this.width == width && this.height == height) return;
        let gl = this._renderingContext.gl;
        this.width = width;
        this.height = height;
        if (this._colorTexture) gl.deleteTexture(this._colorTexture);
        if (this._depthTexture) gl.deleteTexture(this._depthTexture);
        this._colorTexture = null;
        this._depthTexture = null;
        this.make();
    }

    make() {
        let GL = WebGL2RenderingContext;
        let gl = this._renderingContext.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.activeTexture(gl.TEXTURE0);

        if (this.color && !this._colorTexture) {
            this._colorTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._colorTexture);
            let internalformat = GL.RGBA32F;
            let format = GL.RGBA;
            let type = GL.FLOAT;
            this._colorTypeDesc = "RGBA32F";
            switch (this._colorType) {
                case GL.RGBA32F:
                case GL.FLOAT:
                    internalformat = GL.RGBA32F;
                    format = GL.RGBA;
                    type = GL.FLOAT;
                    this._colorTypeDesc = "RGBA32F";
                    break;
                case GL.RGBA16F:
                case GL.HALF_FLOAT:
                    internalformat = GL.RGBA16F;
                    format = GL.RGBA;
                    type = GL.HALF_FLOAT;
                    this._colorTypeDesc = "RGBA16F";
                    break;
                case GL.UNSIGNED_BYTE:
                case GL.RGBA8UI:
                case GL.RGBA8:
                    internalformat = GL.RGBA8;
                    format = GL.RGBA;
                    type = GL.UNSIGNED_BYTE;
                    this._colorTypeDesc = "RGBA8";
                    break;
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, internalformat,
                this.width, this.height, 0, format, type, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D, this._colorTexture, 0);
        }

        if (this.depth && !this._depthTexture) {
            this._depthTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
            let format = GL.DEPTH_STENCIL;
            let internalformat = GL.DEPTH24_STENCIL8;
            let type = GL.UNSIGNED_INT_24_8;
            this._depthTypeDesc = "DEPTH24_STENCIL8";
            switch (this._depthType) {
                case GL.DEPTH_COMPONENT16:
                case GL.UNSIGNED_SHORT:
                    format = GL.DEPTH_COMPONENT;
                    internalformat = GL.DEPTH_COMPONENT16;
                    type = GL.UNSIGNED_SHORT;
                    this._depthTypeDesc = "DEPTH_COMPONENT16";
                    break;
                case GL.DEPTH_COMPONENT24:
                case GL.UNSIGNED_INT:
                    format = GL.DEPTH_COMPONENT;
                    internalformat = GL.DEPTH_COMPONENT24;
                    type = GL.UNSIGNED_INT;
                    this._depthTypeDesc = "DEPTH_COMPONENT24";
                    break;
                case GL.DEPTH_COMPONENT32F:
                case GL.FLOAT:
                    format = GL.DEPTH_COMPONENT;
                    internalformat = GL.DEPTH_COMPONENT32F;
                    type = GL.FLOAT;
                    this._depthTypeDesc = "DEPTH_COMPONENT32F";
                    break;
                case GL.DEPTH24_STENCIL8:
                case GL.UNSIGNED_INT_24_8:
                    format = GL.DEPTH_STENCIL;
                    internalformat = GL.DEPTH24_STENCIL8;
                    type = GL.UNSIGNED_INT_24_8;
                    this._depthTypeDesc = "DEPTH24_STENCIL8";
                    break;
                case GL.DEPTH32F_STENCIL8:
                case GL.FLOAT_32_UNSIGNED_INT_24_8_REV:
                    format = GL.DEPTH_STENCIL;
                    internalformat = GL.DEPTH32F_STENCIL8;
                    type = GL.FLOAT_32_UNSIGNED_INT_24_8_REV;
                    this._depthTypeDesc = "DEPTH32F_STENCIL8";
                    break;
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, internalformat,
                this.width, this.height, 0, format, type, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D, this._depthTexture, 0);
        }

        let resolutionSizeText = this.width + "x" + this.height;
        let fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (fboStatus != gl.FRAMEBUFFER_COMPLETE) {
            if (this._colorType == gl.FLOAT) {
                this._colorType = gl.UNSIGNED_BYTE;
                gl.deleteTexture(this._colorTexture);
                this._colorTexture = null;
                hflog.warn("FBO::make() --> " + FxFBO.statusToText(fboStatus) + " --> Can't create FLOAT texture, trying UNSIGNED_BYTE");
                this.make();
                return;
            }

            this._complete = false;
            hflog.error("Unable to create a complete framebuffer " + resolutionSizeText + " | status: " + FxFBO.statusToText(fboStatus));
        } else {
            this._complete = true;
            hflog.log("Framebuffer is okay! size is " + resolutionSizeText + " with " +
                this._colorTypeDesc +
                "/" + this._depthTypeDesc);
            // hflog.log("Framebuffer is okay! size is " + this.width + "x" + this.height + " texture: " +
            //     this._powerOfTwoDimensions.x + "x" + this._powerOfTwoDimensions.y);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    use(clearScreen: boolean = true, disableColorWrites: boolean = false) {
        if (!this.complete) return;
        let gl = this._renderingContext.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        if (disableColorWrites)
            gl.colorMask(false, false, false, false);
        this._savedViewport = gl.getParameter(gl.VIEWPORT);
        gl.viewport(0, 0, this.width, this.height);
        if (clearScreen) {
            gl.clearColor(this.clearColor.x, this.clearColor.y, this.clearColor.z, 1.0);
            let bits = 0;
            if (this.color) bits |= gl.COLOR_BUFFER_BIT;
            if (this.depth) bits |= gl.DEPTH_BUFFER_BIT;
            gl.clear(bits);
        }
    }

    restore() {
        if (!this.complete) return;
        let gl = this._renderingContext.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        if (this.color && this._colorTexture) {
            gl.bindTexture(gl.TEXTURE_2D, this._colorTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        gl.colorMask(true, true, true, true);
        if (this._savedViewport) {
            gl.viewport(
                this._savedViewport[0],
                this._savedViewport[1],
                this._savedViewport[2],
                this._savedViewport[3]);
            this._savedViewport = undefined;
        }
    }

    bindTextures(colorUnit: number = 15, depthUnit: number = 16) {
        let gl = this._renderingContext.gl;
        this._colorUnit = colorUnit;
        this._depthUnit = depthUnit;
        if (this._colorUnit >= 0) {
            gl.activeTexture(this._colorUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._colorTexture);
        }
        if (this._depthUnit >= 0) {
            gl.activeTexture(this._depthUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._depthTexture);
        }
        gl.activeTexture(gl.TEXTURE0);
    }

    unbindTextures() {
        let gl = this._renderingContext.gl;
        if (this._colorUnit >= 0) {
            gl.activeTexture(this._colorUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this._colorUnit = -1;
        }
        if (this._depthUnit >= 0) {
            gl.activeTexture(this._depthUnit + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            this._depthUnit = -1;
        }
        gl.activeTexture(gl.TEXTURE0);
    }

    static statusToText(status: number): string {
        let gl = WebGL2RenderingContext;
        switch (status) {
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT: return "Incomplete attachment"; break;
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS: return "Incomplete dimensions"; break;
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: return "Missing attachment"; break;
            case gl.FRAMEBUFFER_UNSUPPORTED: return "Unsupported"; break;
            case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: return "Incomplete multisample"; break;
        }
        return "Unknown error: " + status;
    }
}
