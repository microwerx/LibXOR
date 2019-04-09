/// <reference path="Fluxions.ts" />
/// <reference path="FxFBO.ts" />
/// <reference path="FxCamera.ts" />
/// <reference path="FxTexture.ts" />
/// <reference path="FxMaterial.ts" />
/// <reference path="FxDirectionalLight.ts" />
/// <reference path="FxTextParser.ts" />
/// <reference path="../XORUtils.ts" />
/// <reference path="FxIndexedGeometryMesh.ts" />

enum FxSGAssetType {
    Scene,
    GeometryGroup,
    MaterialLibrary,
    ShaderProgram,
    Image,
    Text
};


class FxScenegraphNode {
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

class FxScenegraph {
    private shaderSrcFiles: XORUtils.ShaderLoader[] = [];

    // private _defaultFBO: FBO | null;
    private _scenegraphs: Map<string, boolean> = new Map<string, boolean>();
    private _deferredMesh: FxIndexedGeometryMesh;
    private _renderConfigs: Map<string, FxRenderConfig> = new Map<string, FxRenderConfig>();
    private _materials: Map<string, FxMaterial> = new Map<string, FxMaterial>();
    private _sceneResources: Map<string, string> = new Map<string, string>();
    private _nodes: Array<FxScenegraphNode> = [];
    private _meshes: Map<string, FxIndexedGeometryMesh> = new Map<string, FxIndexedGeometryMesh>();
    private _tempNode: FxScenegraphNode = new FxScenegraphNode("", "");
    public textFiles: Map<string, string[][]> = new Map<string, string[][]>();

    public camera: FxCamera = new FxCamera();
    public sunlight: FxDirectionalLight = new FxDirectionalLight();

    public currentrc: FxRenderConfig | null = null;
    public currentmtllib: string | null = "";
    public currentmtl: string | null = "";
    public currentobj: string | null = "";
    public currentscn: string | null = "";

    private _defaultRenderConfig: FxRenderConfig;

    // get shadowFBO(): FBO { return this.getFBO("sunshadow"); }
    // get gbufferFBO(): FBO { return this.getFBO("gbuffer") }
    // get imageFBO(): FBO { return this.getFBO("image"); }

    get width(): number { return this.fx.width; }
    get height(): number { return this.fx.height; }
    get aspectRatio(): number { return this.width / this.height; }

    constructor(private fx: FxRenderingContext) {
        this._defaultRenderConfig = new FxRenderConfig(this.fx);
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
        this._deferredMesh = new FxIndexedGeometryMesh(this.fx);
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
        if (!this.fx.xor.textfiles.loaded) {
            return false;
        }
        if (!this.fx.textures.loaded)
            return false;
        for (let s of this.shaderSrcFiles) {
            if (!s.loaded) return false;
        }
        return true;
    }

    get failed(): boolean {
        if (this.fx.xor.textfiles.failed) {
            return true;
        }
        if (this.fx.textures.failed) {
            return true;
        }
        for (let s of this.shaderSrcFiles) {
            if (s.failed) return true;
        }
        return false;
    }

    get percentLoaded(): number {
        let a = 0;
        for (let s of this.shaderSrcFiles) {
            if (s.loaded) a++;
        }
        return 100.0 * a / (this.shaderSrcFiles.length) + this.fx.textures.percentLoaded / 3.0 + this.fx.xor.textfiles.percentLoaded / 3.0;
    }

    load(url: string): void {
        let fx = this.fx;
        let name = XORUtils.GetURLResource(url);
        let self = this;
        let assetType: FxSGAssetType;
        let ext = XORUtils.GetExtension(name);
        let path = XORUtils.GetURLPath(url);

        if (ext == "scn") assetType = FxSGAssetType.Scene;
        else if (ext == "obj") assetType = FxSGAssetType.GeometryGroup;
        else if (ext == "mtl") assetType = FxSGAssetType.MaterialLibrary;
        else if (ext == "png") assetType = FxSGAssetType.Image;
        else if (ext == "jpg") assetType = FxSGAssetType.Image;
        else if (ext == "txt") assetType = FxSGAssetType.Text;
        else return;

        if (this.wasRequested(name)) return;

        if (assetType == FxSGAssetType.Image) {
            fx.textures.load(name, url);
        } else {
            if (assetType == FxSGAssetType.Scene) {
                this._scenegraphs.set(name, false);
            }
            fx.xor.textfiles.load(name, url, (data, name, assetType) => {
                self.processTextFile(data, name, path, assetType);
                hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + name);
            }, assetType);
            // this.textFiles.push(new XORUtils.TextFileLoader(url, (data, name, assetType) => {
            //     self.processTextFile(data, name, path, assetType);
            //     hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + name);
            // }, assetType));
        }
        hflog.debug("MyScenegraph::Load() => Requesting " + url);
    }

    isSceneGraph(name: string): boolean {
        let status = this._scenegraphs.get(name);
        if (status) return true;
        return false;
    }

    wasRequested(name: string): boolean {
        if (this.fx.xor.textfiles.wasRequested(name)) {
            return true;
        }
        if (this.fx.textures.wasRequested(name)) {
            return true;
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
        let rc = new FxRenderConfig(this.fx);
        this._renderConfigs.set(name, rc);

        let self = this;
        this.shaderSrcFiles.push(new XORUtils.ShaderLoader(vertshaderUrl, fragshaderUrl, (vertShaderSource: string, fragShaderSource: string) => {
            rc.compile(vertShaderSource, fragShaderSource);
            hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + vertshaderUrl + " and " + fragshaderUrl);
        }));
    }

    getRenderConfig(name: string): FxRenderConfig | null {
        let rc = this._renderConfigs.get(name) || null;
        return rc;
    }

    userc(name: string): FxRenderConfig | null {
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
    //         let rc = new FxRenderConfig(this.fx);
    //         rc.compile(vertShaderSource, fragShaderSource);
    //         self._renderConfigs.set(name, rc);
    //         hflog.log("Loaded " + Math.round(self.percentLoaded) + "% " + vertshaderUrl + " and " + fragshaderUrl);
    //     }));
    // }

    // GetRenderConfig(name: string): FxRenderConfig | null {
    //     let rc = this._renderConfigs.get(name);
    //     if (rc) {
    //         return rc;
    //     }
    //     return null;
    // }

    // UseRenderConfig(name: string): FxRenderConfig | null {
    //     let rc = this._renderConfigs.get(name);
    //     if (rc) {
    //         rc.use();
    //         return rc;
    //     }
    //     return null;
    // }

    getMaterial(mtllib: string, mtl: string): FxMaterial | null {
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

    RenderMesh(name: string, rc: FxRenderConfig) {
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

        let t = this.fx.textures.get(textureName);
        if (!t) {
            let alias = this._sceneResources.get(textureName);
            if (alias) {
                t = this.fx.textures.get(alias);
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

    GetNode(sceneName: string, objectName: string): FxScenegraphNode | null {
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

    GetChildren(parentName: string): FxScenegraphNode[] {
        let children: FxScenegraphNode[] = [];
        for (let node of this._nodes) {
            if (node.parent == parentName)
                children.push(node);
        }
        return children;
    }

    UpdateChildTransforms(parentName: string = ""): void {
        let nodeWorldMatrix;
        let children: FxScenegraphNode[] = [];
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

    AddNode(sceneName: string, objectName: string, parentNode: string = ""): FxScenegraphNode {
        let sn = this.GetNode(sceneName, objectName);
        if (!sn) {
            sn = new FxScenegraphNode(objectName, sceneName);
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

    GetMesh(meshName: string): FxIndexedGeometryMesh | null {
        let mesh = this._meshes.get(meshName);
        if (!mesh) {
            mesh = new FxIndexedGeometryMesh(this.fx)
            this._meshes.set(meshName, mesh);
        }
        return mesh;
    }

    SetGlobalParameters(rc: FxRenderConfig) {
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

            // TODO: Make This Part of a Light Data Structure
            if (!rc.writesToFBO) {
                rc.uniformMatrix4f("SunShadowBiasMatrix", Matrix4.makeShadowBias());
                rc.uniformMatrix4f("SunShadowProjectionMatrix", this.sunlight.projectionMatrix);
                rc.uniformMatrix4f("SunShadowViewMatrix", this.sunlight.lightMatrix);
            }

            // let unit = 11;
            // for (let fbo of rc.readFromFBOs) {
            //     this.configureFBO(rc, fbo, unit, unit + 1);
            //     unit += 2;
            // }
            this.fx.fbos.configure(rc);
        }
        let gl = this.fx.gl;
        gl.viewport(0, 0, this.width, this.height);
    }

    // configureFBO(rc: FxRenderConfig, name: string, colorUnit: number, depthUnit: number) {
    //     const colorUniform = name + "Color";
    //     const depthUniform = name + "Depth";
    //     const resolutionUnifom = name + "Resolution";
    //     const usingUniform = "Using" + name;
    //     let fbo = this._fbo.get(name) || null;
    //     if (!fbo) return;
    //     rc.uniform2f(resolutionUnifom, fbo.dimensions);
    //     rc.uniform1i(usingUniform, rc.writesToFBO ? 1 : 0);
    //     if (rc.writesToFBO && fbo.complete) {
    //         fbo.bindTextures(colorUnit, depthUnit);
    //         if (fbo.color) rc.uniform1i(colorUniform, colorUnit);
    //         if (fbo.depth) rc.uniform1i(depthUniform, depthUnit);
    //     } else {
    //         rc.uniform1i(colorUniform, 0);
    //         rc.uniform1i(depthUniform, 0);
    //     }
    // }

    Restore() {
        let gl = this.fx.gl;
        for (let i = 0; i < 10; i++) {
            gl.activeTexture(i + gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        this.useTexture("enviroCube", 10, false);
        // for (let fbo of this._fbo) {
        //     if (fbo[1].complete) fbo[1].unbindTextures()
        // }
        this.fx.fbos.restore();
    }

    Update() {
        // check FBOs
        // this._fbo.forEach((fbo) => {
        //     if (fbo.width != this.width || fbo.height != this.height) {
        //         fbo.autoResize(this.width, this.height);
        //     }
        // });
        this.fx.fbos.autoresize();
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

    private processTextFile(data: string, name: string, path: string, assetType: FxSGAssetType): void {
        let textParser = new FxTextParser(data);

        switch (assetType) {
            // ".SCN"
            case FxSGAssetType.Scene:
                this.loadScene(textParser.lines, name, path);
                break;
            // ".OBJ"
            case FxSGAssetType.GeometryGroup:
                this.loadOBJ(textParser.lines, name, path);
                break;
            // ".MTL"
            case FxSGAssetType.MaterialLibrary:
                this.loadMTL(textParser.lines, name, path);
                break;
            case FxSGAssetType.Text:
                this.textFiles.set(name, textParser.lines);
                break;
        }
    }


    private loadScene(lines: string[][], name: string, path: string): void {
        // sundir <direction: Vector3>
        // camera <eye: Vector3> <center: Vector3> <up: Vector3>
        // transform <worldMatrix: Matrix4>
        // geometryGroup <objUrl: string>

        for (let tokens of lines) {
            if (tokens[0] == "enviroCube") {
                this._sceneResources.set("enviroCube", XORUtils.GetURLResource(tokens[1]));
                this.load(path + tokens[1]);
            }
            else if (tokens[0] == "transform") {
                this._tempNode.transform.loadMatrix(FxTextParser.ParseMatrix(tokens));
            }
            else if (tokens[0] == "loadIdentity") {
                this._tempNode.transform.loadIdentity();
            }
            else if (tokens[0] == "translate") {
                let t = FxTextParser.ParseVector(tokens);
                this._tempNode.transform.translate(t.x, t.y, t.z);
            }
            else if (tokens[0] == "rotate") {
                let values = FxTextParser.ParseVector4(tokens);
                this._tempNode.transform.rotate(values.x, values.y, values.z, values.w);
            } else if (tokens[0] == "scale") {
                let values = FxTextParser.ParseVector4(tokens);
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
                this._tempNode = new FxScenegraphNode();
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
                this._tempNode = new FxScenegraphNode();
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

        let mesh: FxIndexedGeometryMesh = new FxIndexedGeometryMesh(this.fx);

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
        let mtllib = FxTextParser.MakeIdentifier(name);
        let curmtl: FxMaterial | undefined;
        for (let tokens of lines) {
            if (tokens.length >= 2) {
                if (tokens[0] == "newmtl") {
                    mtl = FxTextParser.MakeIdentifier(tokens[1]);
                    curmtl = new FxMaterial(mtl);
                    this._materials.set(mtllib + mtl, curmtl);
                }
                else if (tokens[0] == "map_Kd") {
                    if (curmtl) {
                        curmtl.map_Kd = XORUtils.GetURLResource(tokens[1]);
                        curmtl.map_Kd_mix = 1.0;
                    }
                    this.load(path + tokens[1]);
                }
                else if (tokens[0] == "map_Ks") {
                    if (curmtl) {
                        curmtl.map_Ks = XORUtils.GetURLResource(tokens[1]);
                        curmtl.map_Ks_mix = 1.0;
                    }
                    this.load(path + tokens[1]);
                }
                else if (tokens[0] == "map_normal") {
                    if (curmtl) {
                        curmtl.map_normal = XORUtils.GetURLResource(tokens[1]);
                        curmtl.map_normal_mix = 1.0;
                    }
                    this.load(path + tokens[1]);
                } else if (tokens[0] == "Kd") {
                    if (curmtl) {
                        curmtl.Kd = FxTextParser.ParseVector(tokens);
                    }
                } else if (tokens[0] == "Ks") {
                    if (curmtl) {
                        curmtl.Ks = FxTextParser.ParseVector(tokens);
                    }
                } else if (tokens[0] == "Ka") {
                    if (curmtl) {
                        curmtl.Ka = FxTextParser.ParseVector(tokens);
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
}
