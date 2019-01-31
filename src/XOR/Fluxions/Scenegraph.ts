/// <reference path="Fluxions.ts" />
/// <reference path="FBO.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Texture.ts" />
/// <reference path="Material.ts" />
/// <reference path="DirectionalLight.ts" />

enum SGAssetType {
    Scene,
    GeometryGroup,
    MaterialLibrary,
    ShaderProgram,
    Image,
    Text
};


class ScenegraphNode {
    public geometryGroup: string = "";
    private transform_: Matrix4 = Matrix4.makeIdentity();
    private pretransform_: Matrix4 = Matrix4.makeIdentity();
    private posttransform_: Matrix4 = Matrix4.makeIdentity();

    set worldMatrix(m: Matrix4) {
        this.pretransform_.loadIdentity();
        this.transform_.copy(m);
        this.posttransform_.loadIdentity();
    }
    get worldMatrix(): Matrix4 { return Matrix4.multiply3(this.pretransform_, this.transform_, this.posttransform_); }
    get pretransform(): Matrix4 { return this.pretransform_; }
    get posttransform(): Matrix4 { return this.posttransform_; }
    get transform(): Matrix4 { return this.transform_; }

    constructor(
        public name: string = "unknown",
        public sceneName: string = "default",
        public parent: string = "") {
    }
}

class Scenegraph {
    private textfiles: Utils.TextFileLoader[] = [];
    private imagefiles: Utils.ImageFileLoader[] = [];
    private shaderSrcFiles: Utils.ShaderLoader[] = [];

    // private _defaultFBO: FBO | null;
    private _scenegraphs: Map<string, boolean> = new Map<string, boolean>();
    private _fbo: Map<string, FBO> = new Map<string, FBO>();
    private _deferredMesh: IndexedGeometryMesh;
    private _renderConfigs: Map<string, RenderConfig> = new Map<string, RenderConfig>();
    //private _cubeTextures: Map<string, WebGLTexture> = new Map<string, WebGLTexture>();
    private _textures: Map<string, Texture> = new Map<string, Texture>();
    private _materials: Map<string, Material> = new Map<string, Material>();
    private _sceneResources: Map<string, string> = new Map<string, string>();
    private _nodes: Array<ScenegraphNode> = [];
    private _meshes: Map<string, IndexedGeometryMesh> = new Map<string, IndexedGeometryMesh>();
    private _tempNode: ScenegraphNode = new ScenegraphNode("", "");
    public textFiles: Map<string, string[][]> = new Map<string, string[][]>();

    public camera: Camera = new Camera();
    public sunlight: DirectionalLight = new DirectionalLight();

    public currentrc: RenderConfig | null = null;
    public currentmtllib: string | null = "";
    public currentmtl: string | null = "";
    public currentobj: string | null = "";
    public currentscn: string | null = "";

    private _defaultRenderConfig: RenderConfig;

    // get shadowFBO(): FBO { return this.getFBO("sunshadow"); }
    // get gbufferFBO(): FBO { return this.getFBO("gbuffer") }
    // get imageFBO(): FBO { return this.getFBO("image"); }

    get width(): number { return this.fx.width; }
    get height(): number { return this.fx.height; }
    get aspectRatio(): number { return this.width / this.height; }

    constructor(private fx: FxRenderingContext) {
        this._defaultRenderConfig = new RenderConfig(this.fx);
        this._defaultRenderConfig.compile(
            `attribute vec4 aPosition;
             void main() {
                 gl_Position = aPosition;
            }`,
            `void main() {
                gl_FragColor = vec4(0.4, 0.3, 0.2, 1.0);
            }`);
        const width = this.fx.width;
        const height = this.fx.height;
        // this._defaultFBO = new FBO(this.fx, true, true, 1024, 1024, 0, true);
        // this._fbo.set("sunshadow", new FBO(this.fx, true, true, 512, 512, 0));
        // this._fbo.set("gbuffer", new FBO(this.fx, true, true, width, height, 1, true));
        // this._fbo.set("image", new FBO(this.fx, true, true, width, height, 1, true));

        let gl = this.fx.gl;
        this._deferredMesh = new IndexedGeometryMesh(this.fx);
        this._deferredMesh.texcoord3(Vector3.make(0.0, 0.0, 0.0));
        this._deferredMesh.vertex3(Vector3.make(-1.0, -1.0, 0.0));
        this._deferredMesh.texcoord3(Vector3.make(1.0, 0.0, 0.0));
        this._deferredMesh.vertex3(Vector3.make(1.0, -1.0, 0.0));
        this._deferredMesh.texcoord3(Vector3.make(1.0, 1.0, 0.0));
        this._deferredMesh.vertex3(Vector3.make(1.0, 1.0, 0.0));
        this._deferredMesh.texcoord3(Vector3.make(0.0, 1.0, 0.0));
        this._deferredMesh.vertex3(Vector3.make(-1.0, 1.0, 0.0));
        this._deferredMesh.mtllib("Floor10x10_mtl")
        this._deferredMesh.usemtl("ConcreteFloor");
        this._deferredMesh.begin(gl.TRIANGLES);
        this._deferredMesh.addIndex(0);
        this._deferredMesh.addIndex(1);
        this._deferredMesh.addIndex(2);
        this._deferredMesh.addIndex(0);
        this._deferredMesh.addIndex(2);
        this._deferredMesh.addIndex(3);
    }

    get loaded(): boolean {
        for (let t of this.textfiles) {
            if (!t.loaded) return false;
        }
        for (let i of this.imagefiles) {
            if (!i.loaded) return false;
        }
        for (let s of this.shaderSrcFiles) {
            if (!s.loaded) return false;
        }
        return true;
    }

    get failed(): boolean {
        for (let t of this.textfiles) {
            if (t.failed) return true;
        }
        for (let i of this.imagefiles) {
            if (i.failed) return true;
        }
        for (let s of this.shaderSrcFiles) {
            if (s.failed) return true;
        }
        return false;
    }

    get percentLoaded(): number {
        let a = 0;
        for (let t of this.textfiles) {
            if (t.loaded) a++;
        }
        for (let i of this.imagefiles) {
            if (i.loaded) a++;
        }
        for (let s of this.shaderSrcFiles) {
            if (s.loaded) a++;
        }
        return 100.0 * a / (this.textfiles.length + this.imagefiles.length + this.shaderSrcFiles.length);
    }

    load(url: string): void {
        let name = Utils.GetURLResource(url);
        let self = this;
        let assetType: SGAssetType;
        let ext = Utils.GetExtension(name);
        let path = Utils.GetURLPath(url);

        if (ext == "scn") assetType = SGAssetType.Scene;
        else if (ext == "obj") assetType = SGAssetType.GeometryGroup;
        else if (ext == "mtl") assetType = SGAssetType.MaterialLibrary;
        else if (ext == "png") assetType = SGAssetType.Image;
        else if (ext == "jpg") assetType = SGAssetType.Image;
        else if (ext == "txt") assetType = SGAssetType.Text;
        else return;

        if (this.wasRequested(name)) return;

        if (assetType == SGAssetType.Image) {
            if (this._textures.has(name))
                return;
            this.imagefiles.push(new Utils.ImageFileLoader(url, (data, name, assetType) => {
                self.processTextureMap(data, name, assetType);
                hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + name);
            }));
        } else {
            if (assetType == SGAssetType.Scene) {
                this._scenegraphs.set(name, false);
            }
            this.textfiles.push(new Utils.TextFileLoader(url, (data, name, assetType) => {
                self.processTextFile(data, name, path, assetType);
                hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + name);
            }, assetType));
        }
        hflog.debug("MyScenegraph::Load() => Requesting " + url);
    }

    isSceneGraph(name: string): boolean {
        let status = this._scenegraphs.get(name);
        if (status) return true;
        return false;
    }

    wasRequested(name: string): boolean {
        for (let tf of this.textfiles) {
            if (tf.name == name) return true;
        }
        for (let img of this.imagefiles) {
            if (img.name == name) return true;
        }
        return false;
    }

    areMeshes(names: string[]): boolean {
        for (let name of names) {
            if (!this._meshes.has(name))
                return false;
        }
        return true;
    }

    addRenderConfig(name: string, vertshaderUrl: string, fragshaderUrl: string) {
        let rc = new RenderConfig(this.fx);
        this._renderConfigs.set(name, rc);

        let self = this;
        this.shaderSrcFiles.push(new Utils.ShaderLoader(vertshaderUrl, fragshaderUrl, (vertShaderSource: string, fragShaderSource: string) => {
            rc.compile(vertShaderSource, fragShaderSource);
            hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + vertshaderUrl + " and " + fragshaderUrl);
        }));
    }

    getRenderConfig(name: string): RenderConfig | null {
        let rc = this._renderConfigs.get(name) || null;
        return rc;
    }

    userc(name: string): RenderConfig | null {
        let rc = this.getRenderConfig(name);
        if (this.currentrc && rc !== this.currentrc) {
            this.currentrc.restore();
        }
        this.currentrc = rc;
        if (this.currentrc) { this.currentrc.use(); }
        return this.currentrc;
    }

    // AddRenderConfig(name: string, vertshaderUrl: string, fragshaderUrl: string) {
    //     let self = this;
    //     this.shaderSrcFiles.push(new Utils.ShaderLoader(vertshaderUrl, fragshaderUrl, (vertShaderSource: string, fragShaderSource: string) => {
    //         let rc = new RenderConfig(this.fx);
    //         rc.compile(vertShaderSource, fragShaderSource);
    //         self._renderConfigs.set(name, rc);
    //         hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + vertshaderUrl + " and " + fragshaderUrl);
    //     }));
    // }

    // GetRenderConfig(name: string): RenderConfig | null {
    //     let rc = this._renderConfigs.get(name);
    //     if (rc) {
    //         return rc;
    //     }
    //     return null;
    // }

    // UseRenderConfig(name: string): RenderConfig | null {
    //     let rc = this._renderConfigs.get(name);
    //     if (rc) {
    //         rc.use();
    //         return rc;
    //     }
    //     return null;
    // }

    getMaterial(mtllib: string, mtl: string): Material | null {
        let material = this._materials.get(mtllib + mtl) || null;
        return material;
        // for (let ml of this._materials) {
        //     if (ml["0"] == mtllib + mtl) {
        //         return ml["1"];
        //     }
        // }
        // return null;
    }

    usemtl(mtllib: string, mtl: string) {
        let gl = this.fx.gl;
        if (!this.currentrc) return;
        let rc = this.currentrc;
        let m = this.getMaterial(mtllib, mtl);
        if (m) {
            let tnames = ["map_Kd", "map_Ks", "map_normal"];
            let textures = [m.map_Kd, m.map_Ks, m.map_normal];
            for (let i = 0; i < textures.length; i++) {
                if (textures[i].length == 0)
                    continue;
                let loc = rc.getUniformLocation(tnames[i]);
                if (loc) {
                    this.useTexture(textures[i], i);
                    rc.uniform1i(tnames[i], i);
                }
            }

            let v1fnames = ["map_Kd_mix", "map_Ks_mix", "map_normal_mix", "PBKdm", "PBKsm", "PBn2", "PBk2"];
            let v1fvalues = [m.map_Kd_mix, m.map_Ks_mix, m.map_normal_mix, m.PBKdm, m.PBKsm, m.PBn2, m.PBk2];
            for (let i = 0; i < v1fnames.length; i++) {
                let uloc = rc.getUniformLocation(v1fnames[i]);
                if (uloc) {
                    rc.uniform1f(v1fnames[i], v1fvalues[i]);
                }
            }

            let v3fnames = ["Kd", "Ks", "Ka"];
            let v3fvalues = [m.Kd, m.Ks, m.Ka];
            for (let i = 0; i < v3fnames.length; i++) {
                let uloc = rc.getUniformLocation(v3fnames[i]);
                if (uloc) {
                    rc.uniform3f(v3fnames[i], v3fvalues[i]);
                }
            }
        }
        // for (let ml of this._materials) {
        //     if (ml["0"] == mtllib + mtl) {// && ml["1"].name == mtl) {
        //         let m = ml["1"];
        //         let tnames = ["map_Kd", "map_Ks", "map_normal"];
        //         let textures = [m.map_Kd, m.map_Ks, m.map_normal];
        //         for (let i = 0; i < textures.length; i++) {
        //             if (textures[i].length == 0)
        //                 continue;
        //             let loc = rc.getUniformLocation(tnames[i]);
        //             if (loc) {
        //                 this.useTexture(textures[i], i);
        //                 rc.uniform1i(tnames[i], i);
        //             }
        //         }

        //         let v1fnames = ["map_Kd_mix", "map_Ks_mix", "map_normal_mix", "PBKdm", "PBKsm", "PBn2", "PBk2"];
        //         let v1fvalues = [m.map_Kd_mix, m.map_Ks_mix, m.map_normal_mix, m.PBKdm, m.PBKsm, m.PBn2, m.PBk2];
        //         for (let i = 0; i < v1fnames.length; i++) {
        //             let uloc = rc.getUniformLocation(v1fnames[i]);
        //             if (uloc) {
        //                 rc.uniform1f(v1fnames[i], v1fvalues[i]);
        //             }
        //         }

        //         let v3fnames = ["Kd", "Ks", "Ka"];
        //         let v3fvalues = [m.Kd, m.Ks, m.Ka];
        //         for (let i = 0; i < v3fnames.length; i++) {
        //             let uloc = rc.getUniformLocation(v3fnames[i]);
        //             if (uloc) {
        //                 rc.uniform3f(v3fnames[i], v3fvalues[i]);
        //             }
        //         }
        //     }
        // }
    }

    RenderMesh(name: string, rc: RenderConfig) {
        if (name.length == 0) {
            for (let mesh of this._meshes) {
                mesh["1"].render(rc, this);
            }
            return;
        }
        let mesh = this._meshes.get(name);
        if (mesh) {
            mesh.render(rc, this);
        }
    }

    useTexture(textureName: string, unit: number, enable: boolean = true): boolean {
        let texunit = unit | 0;
        let gl = this.fx.gl;
        let result = false;

        let minFilter = gl.LINEAR_MIPMAP_LINEAR;
        let magFilter = gl.LINEAR;

        if (unit <= 31) {
            unit += gl.TEXTURE0;
        }
        gl.activeTexture(unit);

        let t = this._textures.get(textureName);
        if (!t) {
            let alias = this._sceneResources.get(textureName);
            if (alias) {
                t = this._textures.get(alias);
            }
        }
        if (t) {
            if (unit <= 31) {
                unit += gl.TEXTURE0;
            }
            gl.activeTexture(unit);
            if (enable) {
                gl.bindTexture(t.target, t.texture)
                gl.texParameteri(t.target, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(t.target, gl.TEXTURE_MAG_FILTER, magFilter);
                result = true;
            } else {
                gl.bindTexture(t.target, null);
            }
        }
        if (!t) {
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        }
        gl.activeTexture(gl.TEXTURE0);
        return result;
    }

    GetNode(sceneName: string, objectName: string): ScenegraphNode | null {
        for (let node of this._nodes) {
            if (sceneName.length > 0 && node.sceneName != sceneName) {
                continue;
            }
            if (node.name.length > 0 && node.name == objectName) {
                return node;
            }
        }
        return null;
    }

    GetChildren(parentName: string): ScenegraphNode[] {
        let children: ScenegraphNode[] = [];
        for (let node of this._nodes) {
            if (node.parent == parentName)
                children.push(node);
        }
        return children;
    }

    UpdateChildTransforms(parentName: string = ""): void {
        let nodeWorldMatrix;
        let children: ScenegraphNode[] = [];
        if (parentName.length == 0) {
            nodeWorldMatrix = Matrix4.makeIdentity();
            children = this._nodes;
        } else {
            let node = this.GetNode("", parentName);
            if (!node) return;
            nodeWorldMatrix = node.worldMatrix;
            children = this.GetChildren(parentName);
        }
        for (let child of children) {
            child.pretransform.copy(nodeWorldMatrix);
            this.UpdateChildTransforms(child.name);
        }
    }

    AddNode(sceneName: string, objectName: string, parentNode: string = ""): ScenegraphNode {
        let sn = this.GetNode(sceneName, objectName);
        if (!sn) {
            sn = new ScenegraphNode(objectName, sceneName);
            this._nodes.push(sn);
        }
        return sn;
    }

    RemoveNode(sceneName: string, objectName: string): boolean {
        let i = 0;
        for (let node of this._nodes) {
            if (sceneName.length > 0 && node.sceneName != sceneName) {
                continue;
            }
            if (node.name.length > 0 && node.name == objectName) {
                this._nodes.splice(i, 1);
                return true;
            }
            i++;
        }
        return false;
    }

    GetMesh(meshName: string): IndexedGeometryMesh | null {
        let mesh = this._meshes.get(meshName);
        if (!mesh) {
            mesh = new IndexedGeometryMesh(this.fx)
            this._meshes.set(meshName, mesh);
        }
        return mesh;
    }

    SetGlobalParameters(rc: RenderConfig) {
        if (rc) {
            rc.use();
            rc.uniform1f("uWindowWidth", this.width);
            rc.uniform1f("uWindowHeight", this.height);
            rc.uniform1f("uWindowCenterX", this.width * 0.5);
            rc.uniform1f("uWindowCenterY", this.height * 0.5);
            rc.uniform3f("SunDirTo", this.sunlight.direction);
            rc.uniform3f("SunE0", this.sunlight.E0);
            this.camera.aspectRatio = this.aspectRatio;
            rc.uniformMatrix4f("ProjectionMatrix", this.camera.projection);
            rc.uniformMatrix4f("CameraMatrix", this.camera.transform);
            rc.uniform3f("CameraPosition", this.camera.eye);
            this.useTexture("enviroCube", 10);
            rc.uniform1i("EnviroCube", 10);
            if (!rc.usesFBO) {
                rc.uniformMatrix4f("SunShadowBiasMatrix", Matrix4.makeShadowBias());
                rc.uniformMatrix4f("SunShadowProjectionMatrix", this.sunlight.projectionMatrix);
                rc.uniformMatrix4f("SunShadowViewMatrix", this.sunlight.lightMatrix);
            }

            let unit = 11;
            for (let fbo of rc.fbos) {
                this.configureFBO(rc, fbo, unit, unit + 1);
                unit += 2;
            }
        }
        let gl = this.fx.gl;
        gl.viewport(0, 0, this.width, this.height);
    }

    configureFBO(rc: RenderConfig, name: string, colorUnit: number, depthUnit: number) {
        const colorUniform = name + "Color";
        const depthUniform = name + "Depth";
        const resolutionUnifom = name + "Resolution";
        const usingUniform = "Using" + name;
        let fbo = this._fbo.get(name) || null;
        if (!fbo) return;
        rc.uniform2f(resolutionUnifom, fbo.dimensions);
        rc.uniform1i(usingUniform, rc.usesFBO ? 1 : 0);
        if (rc.usesFBO && fbo.complete) {
            fbo.bindTextures(colorUnit, depthUnit);
            if (fbo.color) rc.uniform1i(colorUniform, colorUnit);
            if (fbo.depth) rc.uniform1i(depthUniform, depthUnit);
        } else {
            rc.uniform1i(colorUniform, 0);
            rc.uniform1i(depthUniform, 0);
        }
    }

    Restore() {
        let gl = this.fx.gl;
        for (let i = 0; i < 10; i++) {
            gl.activeTexture(i + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        this.useTexture("enviroCube", 10, false);
        for (let fbo of this._fbo) {
            if (fbo[1].complete) fbo[1].unbindTextures()
        }
    }

    Update() {
        // check FBOs
        this._fbo.forEach((fbo) => {
            if (fbo.width != this.width || fbo.height != this.height) {
                fbo.autoResize(this.width, this.height);
            }
        });
    }

    RenderScene(shaderName: string, sceneName: string = "") {
        let rc = this.userc(shaderName);
        if (!rc || !rc.usable) {
            //hflog.error("MyScenegraph::RenderScene(): \"" + shaderName + "\" is not a render config");
            return;
        }
        for (let node of this._nodes) {
            if (sceneName.length > 0 && node.sceneName != sceneName) {
                continue;
            }
            rc.uniformMatrix4f("WorldMatrix", node.worldMatrix);
            let mesh = this._meshes.get(node.geometryGroup);
            if (mesh) {
                if (rc.renderEdges) {
                    mesh.renderEdges(rc);
                } else {
                    mesh.render(rc, this);
                }
            }
        }
        rc.restore();
    }


    RenderDeferred(shaderName: string): void {
        let rc = this.userc(shaderName);
        if (!rc || !rc.usable) {
            //hflog.error("MyScenegraph::RenderDeferred(): \"" + shaderName + "\" is not a render config");
            return;
        }

        let gl = this.fx.gl;
        gl.disable(gl.DEPTH_TEST);
        rc.uniformMatrix4f("ProjectionMatrix", Matrix4.makeOrtho2D(-1.0, 1.0, -1.0, 1.0));
        rc.uniformMatrix4f("CameraMatrix", Matrix4.makeLookAt(
            Vector3.make(0.0, 0.0, 1.0),
            Vector3.make(0.0, 0.0, 0.0),
            Vector3.make(0.0, 1.0, 0.0)
        ));
        rc.uniformMatrix4f("WorldMatrix", Matrix4.makeTranslation(0.0, 0.0, 0.0));
        this._deferredMesh.render(rc, this);

        rc.restore();
    }

    private processTextFile(data: string, name: string, path: string, assetType: SGAssetType): void {
        let textParser = new TextParser(data);

        switch (assetType) {
            // ".SCN"
            case SGAssetType.Scene:
                this.loadScene(textParser.lines, name, path);
                break;
            // ".OBJ"
            case SGAssetType.GeometryGroup:
                this.loadOBJ(textParser.lines, name, path);
                break;
            // ".MTL"
            case SGAssetType.MaterialLibrary:
                this.loadMTL(textParser.lines, name, path);
                break;
            case SGAssetType.Text:
                this.textFiles.set(name, textParser.lines);
                break;
        }
    }

    private processTextureMap(image: HTMLImageElement, name: string, assetType: SGAssetType): void {
        let gl = this.fx.gl;

        let minFilter = gl.NEAREST;
        let magFilter = gl.NEAREST;

        let maxAnisotropy = 1.0;
        let ext = this.fx.getExtension("EXT_texture_filter_anisotropic")
        if (ext) {
            let maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        } else {
            hflog.debug("cannot use anisotropic filtering");
        }

        if (image.width == 6 * image.height) {
            let images: Array<ImageData> = new Array<ImageData>(6);
            Utils.SeparateCubeMapImages(image, images);
            let texture = gl.createTexture();
            if (texture) {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                for (let i = 0; i < 6; i++) {
                    if (!images[i]) {
                        continue;
                    } else {
                        hflog.debug("image " + i + " w:" + images[i].width + "/h:" + images[i].height);
                    }
                    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                let t = new Texture(this.fx, name, name, gl.TEXTURE_CUBE_MAP, texture);
                this._textures.set(name, t);
            }
        } else {
            let texture = gl.createTexture();
            if (texture) {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
                if (ext) {
                    gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
                }
                let t = new Texture(this.fx, name, name, gl.TEXTURE_2D, texture);
                this._textures.set(name, t);
            }
        }
    }

    private loadScene(lines: string[][], name: string, path: string): void {
        // sundir <direction: Vector3>
        // camera <eye: Vector3> <center: Vector3> <up: Vector3>
        // transform <worldMatrix: Matrix4>
        // geometryGroup <objUrl: string>

        for (let tokens of lines) {
            if (tokens[0] == "enviroCube") {
                this._sceneResources.set("enviroCube", Utils.GetURLResource(tokens[1]));
                this.load(path + tokens[1]);
            }
            else if (tokens[0] == "transform") {
                this._tempNode.transform.loadMatrix(TextParser.ParseMatrix(tokens));
            }
            else if (tokens[0] == "loadIdentity") {
                this._tempNode.transform.loadIdentity();
            }
            else if (tokens[0] == "translate") {
                let t = TextParser.ParseVector(tokens);
                this._tempNode.transform.translate(t.x, t.y, t.z);
            }
            else if (tokens[0] == "rotate") {
                let values = TextParser.ParseVector4(tokens);
                this._tempNode.transform.rotate(values.x, values.y, values.z, values.w);
            } else if (tokens[0] == "scale") {
                let values = TextParser.ParseVector4(tokens);
                this._tempNode.transform.scale(values.x, values.y, values.z);
            }
            else if (tokens[0] == "geometryGroup") {
                // geometryGroup filename
                // geometryGroup name filename
                // geometryGroup name parentNode filename
                let parentName = "";
                let filename = (tokens.length >= 2) ? tokens[tokens.length - 1] : "nothing.obj";
                let nodeName = (tokens.length >= 3) ? tokens[1] : filename;
                if (tokens.length >= 4) {
                    parentName = tokens[2];
                }
                this._tempNode.sceneName = name;
                this._tempNode.parent = parentName;
                this._tempNode.name = nodeName;
                this._tempNode.geometryGroup = filename;
                if (!this.wasRequested(filename)) {
                    hflog.log("loading geometry group [parent = " + parentName + "]" + path + filename);
                    this.load(path + filename);
                }
                this._nodes.push(this._tempNode);
                this._tempNode = new ScenegraphNode();
            }
            else if (tokens[0] == "node") {
                // node name
                // node name parentNode
                let nodeName = (tokens.length >= 2) ? tokens[1] : "";
                let parentName = (tokens.length >= 3) ? tokens[2] : "";
                this._tempNode.name = nodeName;
                this._tempNode.parent = parentName;
                this._tempNode.sceneName = name;
                this._tempNode.geometryGroup = "";
                this._nodes.push(this._tempNode);
                this._tempNode = new ScenegraphNode();
            }
            else if (tokens[0] == "renderconfig") {
                let name = tokens[1];
                let vertShaderUrl = tokens[2];
                let fragShaderUrl = tokens[3];
                this.addRenderConfig(name, vertShaderUrl, fragShaderUrl);
            }
        }
        this._scenegraphs.set(name, true);
    }

    private loadOBJ(lines: string[][], name: string, path: string): void {
        // mtllib <mtlUrl: string>
        // usemtl <name: string>
        // v <position: Vector3>
        // vn <normal: Vector3>
        // vt <texcoord: Vector2|Vector3>
        // vc <color: Vector4>
        // f <v1: number> <v2: number> <v3: number>
        // f <v1: number>/<vt1:number> <v2: number>/<vt2:number> <v2: number>/<vt2:number>
        // f <v1: number>//<vt1:number> <v2: number>//<vt2:number> <v2: number>//<vt2:number>
        // f <v1: number>/<vn1:number>/<vt1:number> <v2: number>/<vn2:number>/<vt2:number> <v2: number>/<vn3:number>/<vt2:number>
        // o <objectName: string>
        // g <newSmoothingGroup: string>
        // s <newSmoothingGroup: string>

        let mesh: IndexedGeometryMesh = new IndexedGeometryMesh(this.fx);

        // let gl = this.fx.gl;
        // let positions: Vector3[] = [];
        // let normals: Vector3[] = [];
        // let colors: Vector3[] = [];
        // let texcoords: Vector3[] = [];

        // // in case there are no mtllib's, usemtl's, o's, g's, or s's
        // mesh.begin(gl.TRIANGLES);
        // for (let tokens of lines) {
        //     if (tokens.length >= 3) {
        //         if (tokens[0] == "v") {
        //             let position = TextParser.ParseVector(tokens);
        //             positions.push(position);
        //             mesh.edgeMesh.addVertex(position);
        //         } else if (tokens[0] == "vn") {
        //             normals.push(TextParser.ParseVector(tokens));
        //         } else if (tokens[0] == "vt") {
        //             texcoords.push(TextParser.ParseVector(tokens));
        //         } else if (tokens[0] == "vc") {
        //             let color = TextParser.ParseVector(tokens);
        //             colors.push(color);
        //             mesh.color(color.x, color.y, color.z);
        //         } else if (tokens[0] == "f") {
        //             let indices = TextParser.ParseFace(tokens);
        //             let edgeIndices: number[] = [];
        //             for (let i = 0; i < 3; i++) {
        //                 try {
        //                     if (indices[i * 3 + 2] >= 0)
        //                         mesh.normal3(normals[indices[i * 3 + 2]]);
        //                     if (indices[i * 3 + 1] >= 0)
        //                         mesh.texcoord3(texcoords[indices[i * 3 + 1]]);
        //                     mesh.vertex3(positions[indices[i * 3 + 0]]);
        //                     mesh.addIndex(-1);
        //                     edgeIndices.push(indices[i * 3]);
        //                 }
        //                 catch (s) {
        //                     hflog.debug(s);
        //                 }
        //                 mesh.edgeMesh.addFace(edgeIndices);
        //             }
        //         }
        //     }
        //     else if (tokens.length >= 2) {
        //         if (tokens[0] == "mtllib") {
        //             this.load(path + tokens[1]);
        //             mesh.mtllib(TextParser.ParseIdentifier(tokens));
        //             mesh.begin(gl.TRIANGLES);
        //         } else if (tokens[0] == "usemtl") {
        //             mesh.usemtl(TextParser.ParseIdentifier(tokens));
        //             mesh.begin(gl.TRIANGLES);
        //         } else if (tokens[0] == "o") {
        //             mesh.begin(gl.TRIANGLES);
        //         } else if (tokens[0] == "g") {
        //             mesh.begin(gl.TRIANGLES);
        //         } else if (tokens[0] == "s") {
        //             mesh.begin(gl.TRIANGLES);
        //         }
        //     }
        // }

        mesh.loadOBJ(lines, this, path);
        mesh.build();
        this._meshes.set(name, mesh);
    }

    private loadMTL(lines: string[][], name: string, path: string): void {
        // newmtl <name: string>
        // Kd <color: Vector3>
        // Ks <color: Vector3>
        // map_Kd <url: string>
        // map_Ks <url: string>
        // map_normal <url: string>
        let mtl = "";
        let mtllib = TextParser.MakeIdentifier(name);
        let curmtl: Material | undefined;
        for (let tokens of lines) {
            if (tokens.length >= 2) {
                if (tokens[0] == "newmtl") {
                    mtl = TextParser.MakeIdentifier(tokens[1]);
                    curmtl = new Material(mtl);
                    this._materials.set(mtllib + mtl, curmtl);
                }
                else if (tokens[0] == "map_Kd") {
                    if (curmtl) {
                        curmtl.map_Kd = Utils.GetURLResource(tokens[1]);
                        curmtl.map_Kd_mix = 1.0;
                    }
                    this.load(path + tokens[1]);
                }
                else if (tokens[0] == "map_Ks") {
                    if (curmtl) {
                        curmtl.map_Ks = Utils.GetURLResource(tokens[1]);
                        curmtl.map_Ks_mix = 1.0;
                    }
                    this.load(path + tokens[1]);
                }
                else if (tokens[0] == "map_normal") {
                    if (curmtl) {
                        curmtl.map_normal = Utils.GetURLResource(tokens[1]);
                        curmtl.map_normal_mix = 1.0;
                    }
                    this.load(path + tokens[1]);
                } else if (tokens[0] == "Kd") {
                    if (curmtl) {
                        curmtl.Kd = TextParser.ParseVector(tokens);
                    }
                } else if (tokens[0] == "Ks") {
                    if (curmtl) {
                        curmtl.Ks = TextParser.ParseVector(tokens);
                    }
                } else if (tokens[0] == "Ka") {
                    if (curmtl) {
                        curmtl.Ka = TextParser.ParseVector(tokens);
                    }
                } else if (tokens[0] == "PBn2") {
                    if (curmtl) {
                        curmtl.PBn2 = parseFloat(tokens[1]);
                    }
                } else if (tokens[0] == "PBk2") {
                    if (curmtl) {
                        curmtl.PBk2 = parseFloat(tokens[1]);
                    }
                }
                else if (tokens[0] == "map_Kd_mix") {
                    if (curmtl) {
                        curmtl.map_Kd_mix = parseFloat(tokens[1]);
                    }
                }
                else if (tokens[0] == "map_Ks_mix") {
                    if (curmtl) {
                        curmtl.map_Ks_mix = parseFloat(tokens[1]);
                    }
                }
                else if (tokens[0] == "map_normal_mix") {
                    if (curmtl) {
                        curmtl.map_normal_mix = parseFloat(tokens[1]);
                    }
                }
            }
        }
    }

    getFBO(name: string): FBO | null {
        return this._fbo.get(name) || null;
    }
}
