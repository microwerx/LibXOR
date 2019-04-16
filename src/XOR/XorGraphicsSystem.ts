/// <reference path="../GTE/GTE.ts" />
/// <reference path="LibXOR.ts" />
/// <reference path="XorGraphicsSprite.ts" />
/// <reference path="XorGraphicsTileLayer.ts" />

namespace XOR {
    export class GraphicsSystem {
        gl: WebGLRenderingContext | null = null;
        canvas: HTMLCanvasElement | null = null;
        private glcontextid = "GraphicsSystem" + GTE.randomUint8().toString();
        sprites: GraphicsSprite[] = [];
        tileLayers: GraphicsTileLayer[] = [];

        spriteImage: Uint8Array = new Uint8Array(128 * 128 * 4);

        // VIC memory
        layer1width = 0;
        layer1height = 0;
        layer2width = 0;
        layer2height = 0;
        layer3width = 0;
        layer3height = 0;
        layer4width = 0;
        layer4height = 0;

        worldMatrix = Matrix4.makeIdentity();
        cameraMatrix = Matrix4.makeIdentity(); //Matrix4.makeTranslation(0, 0, Math.sin(this.xor.t1) - 10);
        projectionMatrix = Matrix4.makeOrtho(0, 256, 0, 256, -100.0, 100.0);
        //perspectiveMatrix = Matrix4.makePerspectiveX(45.0, 1.0, 0.01, 100.0);

        readonly MaxSprites = 128;
        readonly MaxTileLayers = 4;
        readonly SpriteSize = 16;
        readonly VICMemoryStart = 0x6000;
        readonly CharMatrixMemoryStart = 0x7000;
        readonly CharColorsMemoryStart = 0x8000;
        readonly CharBitmapMemoryStart = 0x9000;
        readonly SpriteInfoMemoryStart = 0xA000;
        readonly SpriteBitmapMemoryStart = 0xB000;
        readonly TileBitmapMemoryStart = 0xD000;
        readonly TileMatrixMemoryStart = 0xF000;

        get width(): number { return this.canvas ? this.canvas.width : 0; }
        get height(): number { return this.canvas ? this.canvas.height : 0; }

        constructor(private xor: LibXOR) { this.setVideoMode(320, 200); }

        init() {
            this.sprites = [];
            for (let i = 0; i < this.MaxSprites; i++) {
                this.sprites.push(new GraphicsSprite());
            }

            this.tileLayers = [];
            for (let i = 0; i < this.MaxTileLayers; i++) {
                this.tileLayers.push(new GraphicsTileLayer());
            }
        }

        setVideoMode(width: number, height: number) {
            let p = this.xor.parentElement;
            while (p.firstChild) {
                p.removeChild(p.firstChild);
            }

            let canvas = document.createElement("canvas");
            canvas.id = this.glcontextid;
            canvas.width = width;
            canvas.height = height;
            canvas.style.borderRadius = "4px";
            this.gl = canvas.getContext("webgl");
            this.canvas = canvas;
            p.appendChild(canvas);

            // If this.xor.graphics is null, then LibXOR is in the constructor
            if (this.xor.graphics && this.gl) {
                this.xor.fluxions = new Fluxions.FxRenderingContext(this.xor);
                this.xor.input.captureMouse(canvas);
                hflog.info("Capturing mouse");
            }
        }

        clear(
            color1: XOR.Color = Color.BLACK,
            color2: XOR.Color = Color.BLACK,
            mix: number = 0,
            hue1: XOR.HueShift = HueShift.Zero,
            hue2: XOR.HueShift = HueShift.Zero,
            neg: number = 0) {
            let c = this.xor.palette.calcColor(color1, color2, mix, hue1, hue2, neg);
            this.clearrgba(c.r, c.g, c.b, 1.0);
        }

        clear3(color: Vector3) {
            this.clearrgba(color.x, color.y, color.z, 1.0);
        }

        clearrgba(r: number, g: number, b: number, a: number) {
            if (!this.gl) return;
            let gl = this.gl;
            gl.clearColor(r, g, b, a);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        readFromMemory() {
            // Read VIC information
            let mem = this.xor.memory;
            let pos = this.VICMemoryStart;
            this.layer1width = mem.PEEK(pos++);
            this.layer1height = mem.PEEK(pos++);
            this.layer2width = mem.PEEK(pos++);
            this.layer2height = mem.PEEK(pos++);
            this.layer3width = mem.PEEK(pos++);
            this.layer3height = mem.PEEK(pos++);
            this.layer4width = mem.PEEK(pos++);
            this.layer4height = mem.PEEK(pos++);

            // Read Sprite Info
            for (let i = 0; i < this.MaxSprites; i++) {
                this.sprites[i].readFromMemory(this.xor.memory, this.SpriteInfoMemoryStart + i * this.SpriteSize);
            }

            // Read Sprite Imagery        
            let pixels = this.spriteImage;
            let offset = this.SpriteBitmapMemoryStart;
            let p = 0;
            for (let spr = 0; spr < 256; spr++) {
                for (let j = 0; j < 8; j++) {
                    let pixel1 = mem.PEEK(offset++);
                    let pixel2 = mem.PEEK(offset++);
                    let pixel = (pixel1 & 0xFF) << 8 + (pixel2 & 0xFF);
                    for (let i = 0; i < 8; i++) {
                        let r = (pixel & 3) * 85;
                        pixels[p++] = r;
                        pixels[p++] = r;
                        pixels[p++] = r;
                        pixels[p++] = 255;
                        pixel >>= 2;
                    }
                }
            }

            // for (let i = 0; i < this.MaxTileLayers; i++) {
            //     this.tileLayers[i].readFromMemory(this.xor.memory, this.TileMatrixMemoryStart + i * this.TileLayerMemorySize)
            // }
        }

        drawABO: WebGLBuffer | null = null;
        shaderProgram: WebGLProgram | null = null;
        vertShader: WebGLShader | null = null;
        fragShader: WebGLShader | null = null;
        spriteTexture: WebGLTexture | null = null;
        charTexture: WebGLTexture | null = null;
        tileTexture: WebGLTexture | null = null;
        drawList: number[] = [];
        aPosition = -1;
        aNormal = -1;
        aTexcoord = -1;
        aColor = -1;
        aGeneric = -1;
        uTexture0: WebGLUniformLocation | null = null;
        uProjectionMatrix: WebGLUniformLocation | null = null;
        uCameraMatrix: WebGLUniformLocation | null = null;
        uWorldMatrix: WebGLUniformLocation | null = null;

        createBuffers() {
            if (!this.gl) return;
            let gl = this.gl;

            let vertices: number[] = [];
            this.drawList = [];

            this.drawList.push(gl.TRIANGLES);
            this.drawList.push(vertices.length / 16);

            // sprites ...
            for (let i = 0; i < this.MaxSprites; i++) {
                let spr = this.sprites[i];
                let r = 1;
                let g = 1;
                let b = 1;
                let a = spr.alpha;
                let u1 = spr.fliph ? 1.0 : 0.0;
                let u2 = spr.fliph ? 0.0 : 1.0;
                let v1 = spr.flipv ? 1.0 : 0.0;
                let v2 = spr.flipv ? 0.0 : 1.0;
                let w = 0.0;
                let scale = 1.0;// / this.canvas.width;
                let x1 = spr.position.x;// - spr.pivot.x;
                let y1 = spr.position.y;// - spr.pivot.y;
                let x2 = spr.position.x + 8;// - spr.pivot.x;
                let y2 = spr.position.y + 8;// - spr.pivot.y;
                let z = 0.0;//spr.plane + 4;
                let nx = 0.0;
                let ny = 0.0;
                let nz = 1.0;
                let p1 = 0;
                let p2 = 0;
                let p3 = 0;
                let ll = [scale * x1, scale * y1, z, nx, ny, nz, u1, v1, w, r, g, b, a, p1, p2, p3];
                let lr = [scale * x2, scale * y1, z, nx, ny, nz, u2, v1, w, r, g, b, a, p1, p2, p3];
                let ul = [scale * x1, scale * y2, z, nx, ny, nz, u1, v2, w, r, g, b, a, p1, p2, p3];
                let ur = [scale * x2, scale * y2, z, nx, ny, nz, u2, v2, w, r, g, b, a, p1, p2, p3];
                vertices.push(...ll);
                vertices.push(...lr);
                vertices.push(...ur);
                vertices.push(...ur);
                vertices.push(...ul);
                vertices.push(...ll);
                // vertices.push(...ll);
                // vertices.push(...ul);
                // vertices.push(...ur);
            }
            this.drawList.push(this.MaxSprites * 6);

            // tiles ...

            // characters ...

            if (!this.drawABO) {
                this.drawABO = gl.createBuffer();
            }
            if (this.drawABO) {
                let data = new Float32Array(vertices);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.drawABO);
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }

            if (!this.shaderProgram) {
                let vshader = `#version 100
                uniform mat4 WorldMatrix;
                uniform mat4 ProjectionMatrix;
                uniform mat4 CameraMatrix;
    
                attribute vec3 aPosition;
                attribute vec3 aNormal;
                attribute vec3 aTexcoord;
                attribute vec4 aColor;
                attribute vec3 aGeneric;
    
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vTexcoord;
                varying vec4 vColor;
                varying vec3 vGeneric;
    
                mat3 getNormalMatrix(mat4 m) {
                    return mat3(
                        m[0][0], m[0][1], m[0][2],
                        m[1][0], m[1][1], m[1][2],
                        m[2][0], m[2][1], m[2][2]);
                }
    
                void main() {
                    vPosition = (WorldMatrix * vec4(aPosition, 1.0)).xyz;
                    vNormal = getNormalMatrix(WorldMatrix) * aNormal;
                    vTexcoord = aTexcoord;
                    vColor = aColor;
                    gl_Position = ProjectionMatrix * CameraMatrix * WorldMatrix * vec4(aPosition, 1.0);
                }
                `;
                let fshader = `#version 100
                
                precision highp float;
    
                uniform sampler2D Texture0;
                uniform sampler2D Palette;
    
                varying vec3 vPosition;
                varying vec3 vNormal;
                varying vec3 vTexcoord;
                varying vec4 vColor;
                varying vec3 vGeneric;
    
                vec3 getColor(int index) {
                    if (index == 0) return vec3(0.000, 0.000, 0.000); //Black
                    if (index == 1) return vec3(0.333, 0.333, 0.333); //Gray33
                    if (index == 2) return vec3(0.667, 0.667, 0.667); //Gray67
                    if (index == 3) return vec3(1.000, 1.000, 1.000); //White
                    if (index == 4) return vec3(1.000, 0.000, 0.000); //Red
                    if (index == 5) return vec3(0.894, 0.447, 0.000); //Orange
                    if (index == 6) return vec3(0.894, 0.894, 0.000); //Yellow
                    if (index == 7) return vec3(0.000, 1.000, 0.000); //Green
                    if (index == 8) return vec3(0.000, 0.707, 0.707); //Cyan
                    if (index == 9) return vec3(0.000, 0.447, 0.894); //Azure
                    if (index == 10) return vec3(0.000, 0.000, 1.000); //Blue
                    if (index == 11) return vec3(0.447, 0.000, 0.894); //Violet
                    if (index == 12) return vec3(0.894, 0.000, 0.447); //Rose
                    if (index == 13) return vec3(0.500, 0.250, 0.000); //Brown
                    if (index == 14) return vec3(0.830, 0.670, 0.220); //Gold
                    if (index == 15) return vec3(0.250, 0.500, 0.250); //ForestGreen
                    return vec3(0.0);
                }
                            
                void main() {
                    gl_FragColor = vec4(vTexcoord.rg, 1.0, 1.0);
                }
                `;

                let vs = gl.createShader(gl.VERTEX_SHADER);
                if (vs) {
                    gl.shaderSource(vs, vshader);
                    gl.compileShader(vs);
                    let status = gl.getShaderParameter(vs, gl.COMPILE_STATUS);
                    let infoLog = gl.getShaderInfoLog(vs);
                    if (!status && infoLog) {
                        hflog.error("LibXOR Vertex Shader did not compile");
                        hflog.error(infoLog);
                        gl.deleteShader(vs);
                        vs = null;
                    }
                }

                let fs = gl.createShader(gl.FRAGMENT_SHADER);
                if (fs) {
                    gl.shaderSource(fs, fshader);
                    gl.compileShader(fs);
                    let status = gl.getShaderParameter(fs, gl.COMPILE_STATUS);
                    let infoLog = gl.getShaderInfoLog(fs);
                    if (!status && infoLog) {
                        hflog.error("LibXOR Fragment Shader did not compile");
                        hflog.error(infoLog);
                        gl.deleteShader(fs);
                        fs = null;
                    }
                }

                let p = gl.createProgram();
                if (p && fs && vs) {
                    gl.attachShader(p, vs);
                    gl.attachShader(p, fs);
                    gl.linkProgram(p);
                    let status = gl.getProgramParameter(p, gl.LINK_STATUS);
                    let infoLog = gl.getProgramInfoLog(p);
                    if (infoLog) {
                        hflog.error("LibXOR Program did not link");
                        hflog.error(infoLog);
                        gl.deleteProgram(p);
                        p = null;
                    }
                }

                if (p) {
                    this.shaderProgram = p;
                    this.vertShader = vs;
                    this.fragShader = fs;
                    this.aPosition = gl.getAttribLocation(p, "aPosition");
                    this.aNormal = gl.getAttribLocation(p, "aNormal");
                    this.aTexcoord = gl.getAttribLocation(p, "aTexcoord");
                    this.aColor = gl.getAttribLocation(p, "aColor");
                    this.aGeneric = gl.getAttribLocation(p, "aGeneric");
                    this.uTexture0 = gl.getUniformLocation(p, "Texture0");
                    this.uProjectionMatrix = gl.getUniformLocation(p, "ProjectionMatrix");
                    this.uCameraMatrix = gl.getUniformLocation(p, "CameraMatrix");
                    this.uWorldMatrix = gl.getUniformLocation(p, "WorldMatrix");
                }

                // Textures

                if (!this.spriteTexture) {
                    this.spriteTexture = gl.createTexture();
                }
                if (this.spriteTexture) {
                    gl.bindTexture(gl.TEXTURE_2D, this.spriteTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.spriteImage);
                    gl.generateMipmap(gl.TEXTURE_2D);
                }

                if (!this.charTexture) {

                }

                if (!this.tileTexture) {

                }
            }
        }

        enableVertexAttrib(gl: WebGLRenderingContext, location: number, size: number, type: number, stride: number, offset: number) {
            if (location < 0) return;
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, type, false, stride, offset);
        }

        disableVertexAttrib(gl: WebGLRenderingContext, location: number) {
            if (location < 0) return;
            gl.disableVertexAttribArray(location);
        }

        render() {
            if (!this.canvas || !this.gl) return;
            let gl = this.gl;
            let xor = this.xor;

            this.createBuffers();

            let s = Math.sin(xor.t1);
            gl.clearColor(0.3 * s, 0.1 * s, 0.2 * s, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            this.projectionMatrix = Matrix4.makeOrtho2D(0, this.canvas.width, this.canvas.height, 0);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);

            // General Order of Drawing

            // 1. Upload Palette ROM Textures
            // 2. Upload Character ROM Textures
            // 3. Upload Sprite ROM Textures
            // 4. Upload 3D Geometry
            // 5. Draw Tile Layer 0
            // 6. Draw Sprites
            // 7. Draw Tile Layer 1

            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);

            // bind ABO and configure vertex array
            gl.bindBuffer(gl.ARRAY_BUFFER, this.drawABO);
            this.enableVertexAttrib(gl, this.aPosition, 3, gl.FLOAT, 64, 0);
            this.enableVertexAttrib(gl, this.aNormal, 3, gl.FLOAT, 64, 12);
            this.enableVertexAttrib(gl, this.aTexcoord, 3, gl.FLOAT, 64, 24);
            this.enableVertexAttrib(gl, this.aColor, 4, gl.FLOAT, 64, 36);
            this.enableVertexAttrib(gl, this.aGeneric, 3, gl.FLOAT, 64, 52);

            gl.useProgram(this.shaderProgram);

            // set uniforms
            if (this.uTexture0) gl.uniform1i(this.uTexture0, 0);
            if (this.uWorldMatrix) gl.uniformMatrix4fv(this.uWorldMatrix, false, this.worldMatrix.toColMajorArray());
            if (this.uCameraMatrix) gl.uniformMatrix4fv(this.uCameraMatrix, false, this.cameraMatrix.toColMajorArray());
            if (this.uProjectionMatrix) gl.uniformMatrix4fv(this.uProjectionMatrix, false, this.projectionMatrix.toColMajorArray());

            // draw sprites
            // bind textures
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.spriteTexture);
            gl.drawArrays(gl.TRIANGLES, 0, this.MaxSprites * 6);
            // gl.activeTexture(gl.TEXTURE1);
            // gl.bindTexture(gl.TEXTURE_2D, this.tileTexture);
            // gl.activeTexture(gl.TEXTURE1);
            // gl.bindTexture(gl.TEXTURE_2D, this.charTexture);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.useProgram(null);

            this.disableVertexAttrib(gl, this.aPosition);
            this.disableVertexAttrib(gl, this.aNormal);
            this.disableVertexAttrib(gl, this.aTexcoord);
            this.disableVertexAttrib(gl, this.aColor);
            this.disableVertexAttrib(gl, this.aGeneric);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }
}
