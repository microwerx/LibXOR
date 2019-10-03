/// <reference path="../XOR/XorUtils.ts" />
/// <reference path="Fluxions.ts" />
/// <reference path="FxFBO.ts" />
/// <reference path="FxCamera.ts" />
/// <reference path="FxTexture.ts" />
/// <reference path="FxMaterial.ts" />
/// <reference path="FxDirectionalLight.ts" />
/// <reference path="FxTextParser.ts" />
/// <reference path="FxIndexedGeometryMesh.ts" />
/// <reference path="FxScenegraphNode.ts" />

namespace Fluxions {
    export enum FxSGAssetType {
        Scene,
        GeometryGroup,
        MaterialLibrary,
        ShaderProgram,
        Image,
        Text
    };


    export class FxScenegraph {
        // private shaderSrcFiles: XOR.ShaderLoader[] = [];

        // private _defaultFBO: FBO | null;
        private _scenegraphs: Map<string, boolean> = new Map<string, boolean>();
        private _deferredMesh: FxIndexedGeometryMesh;
        // private _renderConfigs: Map<string, FxRenderConfig> = new Map<string, FxRenderConfig>();
        private _materials: Map<string, FxMaterial> = new Map<string, FxMaterial>();
        private _sceneResources: Map<string, string> = new Map<string, string>();
        private _nodes: Array<FxScenegraphNode> = [];
        private _meshes: Map<string, FxIndexedGeometryMesh> = new Map<string, FxIndexedGeometryMesh>();
        private _tempNode: FxScenegraphNode = new FxScenegraphNode("", "");
        public textFiles: Map<string, string[][]> = new Map<string, string[][]>();

        public camera: FxCamera = new FxCamera();
        public sunlight: DirectionalLight = new DirectionalLight();

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
            if (!this.fx.textures.loaded) {
                return false;
            }
            if (!this.fx.renderconfigs.loaded) {
                return false;
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
            if (this.fx.renderconfigs.failed) {
                return true;
            }
            return false;
        }

        get percentLoaded(): number {
            return 0.33 * (this.fx.renderconfigs.percentLoaded + this.fx.textures.percentLoaded + this.fx.xor.textfiles.percentLoaded);
        }

        load(url: string): void {
            let fx = this.fx;
            let name = XOR.GetURLResource(url);
            let self = this;
            let assetType: FxSGAssetType;
            let ext = XOR.GetExtension(name);
            let path = XOR.GetURLPath(url);

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

        getMaterial(mtllib: string, mtl: string): FxMaterial | null {
            let material = this._materials.get(mtllib + mtl) || null;
            return material;
        }

        usemtl(mtllib: string, mtl: string) {
            let gl = this.fx.gl;
            if (!this.currentrc) return;
            let rc = this.currentrc;
            let m = this.getMaterial(mtllib, mtl);
            if (m) {
                let tnames = ["MapKd", "MapKs", "MapNormal"];
                let textures = [m.MapKd, m.MapKs, m.MapNormal];
                for (let i = 0; i < textures.length; i++) {
                    if (textures[i].length == 0)
                        continue;
                    let loc = rc.getUniformLocation(tnames[i]);
                    if (loc) {
                        this.useTexture(textures[i], i);
                        rc.uniform1i(tnames[i], i);
                    }
                }

                let v1fnames = [
                    "MapKdMix",
                    "MapKsix",
                    "MapNormalMix",
                    "PBKdm",
                    "PBKsm",
                    "PBn2",
                    "PBk2"
                ];
                let v1fvalues = [
                    m.MapKdMix,
                    m.MapKsMix,
                    m.MapNormalMix,
                    m.DiffuseRoughness,
                    m.SpecularRoughness,
                    m.PBn2,
                    m.PBk2
                ];
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

        SetGlobalParameters(rc: Fluxions.FxRenderConfig) {
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

                this.fx.fbos.configure(rc);
            }
            let gl = this.fx.gl;
            gl.viewport(0, 0, this.width, this.height);
        }

        RenderScene(renderConfigName: string, sceneName: string = "") {
            let rc = this.fx.renderconfigs.use(renderConfigName);
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


        RenderDeferred(renderConfigName: string): void {
            let rc = this.fx.renderconfigs.use(renderConfigName);
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
                    this._sceneResources.set("enviroCube", XOR.GetURLResource(tokens[1]));
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
                    this.fx.renderconfigs.load(name, vertShaderUrl, fragShaderUrl);
                }
            }
            this._scenegraphs.set(name, true);
        }

        private loadOBJ(lines: string[][], name: string, path: string): void {
            let mesh: FxIndexedGeometryMesh = new FxIndexedGeometryMesh(this.fx);
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

                    if (!curmtl) continue;

                    if (tokens[0] == "map_Kd") {
                        curmtl.MapKd = XOR.GetURLResource(tokens[1]);
                        curmtl.MapKdMix = 1.0;
                        this.load(path + tokens[1]);
                    } else if (tokens[0] == "map_Ks") {
                        curmtl.MapKs = XOR.GetURLResource(tokens[1]);
                        curmtl.MapKsMix = 1.0;
                        this.load(path + tokens[1]);
                    } else if (tokens[0] == "map_normal") {
                        curmtl.MapNormal = XOR.GetURLResource(tokens[1]);
                        curmtl.MapNormalMix = 1.0;
                        this.load(path + tokens[1]);
                    } else if (tokens[0] == "Kd") {
                        curmtl.Kd = FxTextParser.ParseVector(tokens);
                    } else if (tokens[0] == "Ks") {
                        curmtl.Ks = FxTextParser.ParseVector(tokens);
                    } else if (tokens[0] == "Ka") {
                        curmtl.Ka = FxTextParser.ParseVector(tokens);
                    } else if (tokens[0] == "PBKdm" || tokens[0] == "DiffuseRoughness") {
                        curmtl.DiffuseRoughness = parseFloat(tokens[1]);
                    } else if (tokens[0] == "PBKsm" || tokens[0] == "SpecularRoughness") {
                        curmtl.SpecularRoughness = parseFloat(tokens[1]);
                    } else if (tokens[0] == "Ns") {
                        curmtl.SpecularRoughness = Math.sqrt(2.0 / (2.0 + parseFloat(tokens[1])));
                    } else if (tokens[0] == "PBn2" || tokens[0] == "Ni") {
                        curmtl.PBn2 = parseFloat(tokens[1]);
                    } else if (tokens[0] == "PBk2" || tokens[0] == "Nk") {
                        curmtl.PBk2 = parseFloat(tokens[1]);
                    } else if (tokens[0] == "MapKdMix") {
                        curmtl.MapKdMix = parseFloat(tokens[1]);
                    } else if (tokens[0] == "MapKsMix") {
                        curmtl.MapKsMix = parseFloat(tokens[1]);
                    } else if (tokens[0] == "MapNormalMix") {
                        curmtl.MapNormalMix = parseFloat(tokens[1]);
                    } else if (tokens[0] == "d") {
                        curmtl.Dissolve = parseFloat(tokens[1]);
                    } else if (tokens[0] == "Tf") {
                        curmtl.Tf = FxTextParser.ParseVector(tokens);
                    }
                }
            }
        }
    } // class Scenegraph
} // namespace Fluxions