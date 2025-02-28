// LibXOR Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// See LICENSE for details.
//
/// <reference path="Fluxions.ts"/>
/// <reference path="FxTextureUniform.ts" />

namespace Fluxions {
    export class FxRenderConfig {
        public name = "unknown";
        public vshaderUrl = "unknown.vert";
        public fshaderUrl = "unknown.frag";
        private _isCompiled = false;
        private _isLinked = false;
        private _vertShader: WebGLShader | null = null;
        private _fragShader: WebGLShader | null = null;
        private _program: WebGLProgram | null = null;
        private _vertShaderSource = "";
        private _fragShaderSource = "";
        private _vertShaderInfoLog = "";
        private _fragShaderInfoLog = "";
        private _vertShaderCompileStatus = false;
        private _fragShaderCompileStatus = false;
        private _programInfoLog = "";
        private _programLinkStatus = false;
        public uniforms: Map<string, WebGLUniformLocation | null> = new Map<string, WebGLUniformLocation | null>();
        public uniformInfo: Map<string, WebGLActiveInfo | null> = new Map<string, WebGLActiveInfo | null>();
        private uniformUnits = new Map<string, number>();

        public useDepthTest = true;
        public depthTest: number = WebGLRenderingContext.LESS;
        public depthMask = true;
        public useCullFace = false;
        public cullFaceMode = WebGL2RenderingContext.BACK;
        public useBlending = false;
        public blendSrcFactor: number = WebGLRenderingContext.ONE;
        public blendDstFactor: number = WebGLRenderingContext.ZERO;
        public useStencilTest = false;
        public stencilFunc: number = WebGLRenderingContext.ALWAYS;
        public stencilFuncRef: number = 0.0;
        public stencilMask: number = 1;
        public renderShadowMap = false;
        public renderGBuffer = false;
        public renderImage = false;
        public renderEdges = false;

        public writesToFBO = false;
        public writeToFBO: string = "";
        public clearWriteToFBO = true;
        public disableWriteToFBOColorWrites = false;
        public readFromFBOs: string[] = [];

        public textures: FxTextureUniform[] = [];
        private _texturesBound: number = 0;

        private _warnings = 10;

        constructor(public fx: FxRenderingContext) { }

        get usable(): boolean {
            if (this.writesToFBO && !this.fx.verifyFBO(this.writeToFBO)) return false;
            return this.isCompiledAndLinked();
        }

        isCompiledAndLinked(): boolean {
            if (this._isCompiled && this._isLinked)
                return true;
            return false;
        }

        public use() {
            let fx = this.fx;
            let gl = this.fx.gl;
            gl.useProgram(this._program);
            if (this.useDepthTest) {
                gl.enable(gl.DEPTH_TEST);
                gl.depthFunc(this.depthTest);
            }
            if (this.useBlending) {
                gl.enable(gl.BLEND);
                gl.blendFunc(this.blendSrcFactor, this.blendDstFactor);
            }
            if (this.useCullFace) {
                gl.enable(gl.CULL_FACE);
                gl.cullFace(this.cullFaceMode);
            }
            if (this.useStencilTest) {
                gl.enable(gl.STENCIL_TEST);
                gl.stencilFunc(this.stencilFunc, this.stencilFuncRef, this.stencilMask);
            }
            gl.depthMask(this.depthMask);

            let unit = 0;
            for (let texture of this.textures) {
                this.bindTextureUniform(texture.uniformName, texture.textureName, unit);
                unit++;
            }
            this._texturesBound = unit;

            this.fx.fbos.configure(this, unit);
        }

        /**
         * 
         * @param uniform name of the uniform
         * @param texture name of the texture
         * @param unit >= 0 the unit, or if unit < 0 the last unit bound by this texture
         */
        bindTextureUniform(uniform: string, texture: string, unit: number) {
            let u = this.uniforms.get(uniform);
            if (!u) return;
            if (unit >= 0) this.uniformUnits.set(uniform, unit);
            let t = this.fx.textures.get(texture);
            if (!t) return;
            if (unit < 0) {
                let lastUnit = this.uniformUnits.get(uniform) || 0;
                t.bindUnit(lastUnit);
                this.fx.gl.uniform1i(u, lastUnit);
            } else {
                t.bindUnit(unit);
                this.fx.gl.uniform1i(u, unit);
            }
        }

        public restore() {
            let gl = this.fx.gl;
            gl.useProgram(null);
            if (this.useDepthTest) {
                gl.disable(gl.DEPTH_TEST);
                gl.depthFunc(gl.LESS);
            }
            if (this.useBlending) {
                gl.disable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ZERO);
            }
            if (this.useCullFace) {
                gl.disable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
            }
            if (this.useStencilTest) {
                gl.disable(gl.STENCIL_TEST);
                gl.stencilFunc(gl.ALWAYS, 0, 1);
            }
            gl.depthMask(true);
            for (let i = 0; i < this._texturesBound; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }
            this.fx.fbos.restore();
        }

        public uniformMatrix4f(uniformName: string, m: Matrix4): void {
            let gl = this.fx.gl;
            if (!this._program) return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniformMatrix4fv(location, false, m.toColMajorArray());
            }
        }

        public uniform1i(uniformName: string, x: number): void {
            let gl = this.fx.gl;
            if (!this._program) return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform1i(location, x);
            }
        }

        public uniform1f(uniformName: string, x: number): void {
            let gl = this.fx.gl;
            if (!this._program) return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform1f(location, x);
            } else if (this._warnings > 0) {
                this._warnings--;
                hflog.warn(uniformName + " is not a uniform for rc " + this.name);
            }
        }

        public uniform2f(uniformName: string, v: Vector2): void {
            let gl = this.fx.gl;
            if (!this._program) return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform2fv(location, v.toFloat32Array());
            }
        }

        public uniform3f(uniformName: string, v: Vector3): void {
            let gl = this.fx.gl;
            if (!this._program) return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location != null) {
                gl.uniform3fv(location, v.toFloat32Array());
            }
        }

        public uniform4f(uniformName: string, v: Vector4): void {
            let gl = this.fx.gl;
            if (!this._program) return;
            let location = gl.getUniformLocation(this._program, uniformName);
            if (location) {
                gl.uniform4fv(location, v.toFloat32Array());
            }
        }

        public getAttribLocation(name: string): number {
            let gl = this.fx.gl; if (!gl) return -1;
            if (!this._program) return -1;
            return gl.getAttribLocation(this._program, name);
        }

        public getUniformLocation(name: string): WebGLUniformLocation | null {
            let gl = this.fx.gl; if (!gl) return null;
            if (!this._program) return null;
            let uloc: any = gl.getUniformLocation(this._program, name);
            if (!uloc) return null;
            return uloc;
        }

        public compile(vertShaderSource: string, fragShaderSource: string): boolean {
            let gl = this.fx.gl;

            let vertShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
            if (vertShader) {
                gl.shaderSource(vertShader, vertShaderSource);
                gl.compileShader(vertShader);
                let status = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
                let infoLog: string | null = null;
                if (!status) {
                    infoLog = gl.getShaderInfoLog(vertShader);
                    hflog.error("VERTEX SHADER COMPILE ERROR:");
                    hflog.error(infoLog ? infoLog : "");
                    hflog.error("--------------------------------------------");
                    // let errorElement: HTMLElement | null = document.getElementById("errors");
                    // if (!errorElement && infoLog) {
                    //     let newDiv: HTMLDivElement = document.createElement("div");
                    //     newDiv.appendChild(document.createTextNode("Vertex shader info log"));
                    //     newDiv.appendChild(document.createElement("br"));
                    //     newDiv.appendChild(document.createTextNode(infoLog));
                    //     let pre = document.createElement("pre");
                    //     pre.textContent = this._vertShaderSource;
                    //     pre.style.width = "50%";
                    //     newDiv.appendChild(pre);
                    //     document.body.appendChild(newDiv);
                    // }
                }
                if (status)
                    this._vertShaderCompileStatus = true;
                if (infoLog)
                    this._vertShaderInfoLog = infoLog;
                this._vertShader = vertShader;
            }
            else {
                return false;
            }

            let fragShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
            if (fragShader) {
                gl.shaderSource(fragShader, fragShaderSource);
                gl.compileShader(fragShader);
                let status = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
                let infoLog: string | null = null;
                if (!status) {
                    infoLog = gl.getShaderInfoLog(fragShader);
                    hflog.error("FRAGMENT SHADER COMPILE ERROR:");
                    hflog.error(infoLog ? infoLog : "");
                    hflog.error("--------------------------------------------");
                    // let errorElement: HTMLElement | null = document.getElementById("errors");
                    // if (!errorElement && infoLog) {
                    //     let newDiv: HTMLDivElement = document.createElement("div");
                    //     newDiv.appendChild(document.createTextNode("Fragment shader info log"));
                    //     newDiv.appendChild(document.createElement("br"));
                    //     newDiv.appendChild(document.createTextNode(infoLog));
                    //     let pre = document.createElement("pre");
                    //     pre.textContent = this._fragShaderSource;
                    //     pre.style.width = "50%";
                    //     newDiv.appendChild(pre);
                    //     document.body.appendChild(newDiv);
                    // }
                }
                if (status)
                    this._fragShaderCompileStatus = true;
                if (infoLog)
                    this._fragShaderInfoLog = infoLog;
                this._fragShader = fragShader;
            }
            else {
                return false;
            }

            if (this._vertShaderCompileStatus && this._fragShaderCompileStatus) {
                this._isCompiled = true;
                this._program = gl.createProgram();
                if (this._program) {
                    gl.attachShader(this._program, this._vertShader);
                    gl.attachShader(this._program, this._fragShader);
                    gl.linkProgram(this._program);
                    if (gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
                        this._programLinkStatus = true;
                        this._isLinked = true;
                    }
                    else {
                        this._programLinkStatus = false;
                        let infoLog = gl.getProgramInfoLog(this._program);
                        console.error("PROGRAM LINK ERROR:");
                        console.error(infoLog ? infoLog : "");
                        console.error("--------------------------------------------");
                        // if (infoLog) {
                        //     this._programInfoLog = infoLog;
                        //     let errorElement: HTMLElement | null = document.getElementById("errors");
                        //     if (!errorElement && infoLog) {
                        //         let newDiv: HTMLDivElement = document.createElement("div");
                        //         newDiv.appendChild(document.createTextNode("PROGRAM INFO LOG"));
                        //         newDiv.appendChild(document.createElement("br"));
                        //         newDiv.appendChild(document.createTextNode(infoLog));
                        //         document.body.appendChild(newDiv);
                        //     }
                        // }
                    }
                }
            } else {
                return false;
            }

            this.updateActiveUniforms();

            return true;
        }

        private updateActiveUniforms(): boolean {
            let gl = this.fx.gl;
            if (!this._program) return false;
            let numUniforms = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);
            this.uniforms.clear();
            this.uniformInfo.clear();
            for (let i = 0; i < numUniforms; i++) {
                let uniform: WebGLActiveInfo | null = gl.getActiveUniform(this._program, i);
                if (!uniform)
                    continue;
                this.uniformInfo.set(uniform.name, uniform);
                this.uniforms.set(uniform.name, gl.getUniformLocation(this._program, uniform.name));
            }
            return true;
        }

        addTexture(textureName: string, uniformName: string) {
            this.textures.push(new FxTextureUniform(textureName, uniformName));
        }

        clearTextures() {
            this.textures = [];
        }
    }
}