// LibXOR Library
// Copyright (c) 2017 - 2018 Jonathan Metzgar
// All Rights Reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
/// <reference path="Fluxions.ts"/>

class RenderConfig {
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

    public useDepthTest = true;
    public depthTest: number = WebGLRenderingContext.LESS;
    public depthMask = true;
    public useBlending = false;
    public blendSrcFactor: number = WebGLRenderingContext.ONE;
    public blendDstFactor: number = WebGLRenderingContext.ZERO;
    public useStencilTest = false;
    public stencilFunc: number = WebGLRenderingContext.ALWAYS;
    public stencilFuncRef: number = 0.0;
    public stencilMask: number = 1;
    public usesFBO = false;
    public renderShadowMap = false;
    public renderGBuffer = false;
    public renderImage = false;
    public renderEdges = false;

    constructor(private fx: FxRenderingContext) { }

    get usable(): boolean { return this.isCompiledAndLinked(); }

    isCompiledAndLinked(): boolean {
        if (this._isCompiled && this._isLinked)
            return true;
        return false;
    }

    public use() {
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
        if (this.useStencilTest) {
            gl.enable(gl.STENCIL_TEST);
            gl.stencilFunc(this.stencilFunc, this.stencilFuncRef, this.stencilMask);
        }
        gl.depthMask(this.depthMask);
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
        if (this.useStencilTest) {
            gl.disable(gl.STENCIL_TEST);
            gl.stencilFunc(gl.ALWAYS, 0, 1);
        }
        gl.depthMask(true);
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
                let errorElement: HTMLElement | null = document.getElementById("errors");
                if (!errorElement && infoLog) {
                    let newDiv: HTMLDivElement = document.createElement("div");
                    newDiv.appendChild(document.createTextNode("Vertex shader info log"));
                    newDiv.appendChild(document.createElement("br"));
                    newDiv.appendChild(document.createTextNode(infoLog));
                    let pre = document.createElement("pre");
                    pre.textContent = this._vertShaderSource;
                    pre.style.width = "50%";
                    newDiv.appendChild(pre);
                    document.body.appendChild(newDiv);
                }
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
                let errorElement: HTMLElement | null = document.getElementById("errors");
                if (!errorElement && infoLog) {
                    let newDiv: HTMLDivElement = document.createElement("div");
                    newDiv.appendChild(document.createTextNode("Fragment shader info log"));
                    newDiv.appendChild(document.createElement("br"));
                    newDiv.appendChild(document.createTextNode(infoLog));
                    let pre = document.createElement("pre");
                    pre.textContent = this._fragShaderSource;
                    pre.style.width = "50%";
                    newDiv.appendChild(pre);
                    document.body.appendChild(newDiv);
                }
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
                    console.error(infoLog);
                    console.error("--------------------------------------------");
                    if (infoLog) {
                        this._programInfoLog = infoLog;
                        let errorElement: HTMLElement | null = document.getElementById("errors");
                        if (!errorElement && infoLog) {
                            let newDiv: HTMLDivElement = document.createElement("div");
                            newDiv.appendChild(document.createTextNode("PROGRAM INFO LOG"));
                            newDiv.appendChild(document.createElement("br"));
                            newDiv.appendChild(document.createTextNode(infoLog));
                            document.body.appendChild(newDiv);
                        }
                    }
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
}
