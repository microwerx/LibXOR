/// <reference path="Fluxions.ts" />
/// <reference path="Vertex.ts" />
/// <reference path="Surface.ts" />

namespace FluxionsImpl {
    class Edge {
        v1: number = -1;
        v2: number = -1;
        leftFaceIndex: number = -1;
        rightFaceIndex: number = -1;
        leftNormal = Vector3.makeZero();
        rightNormal = Vector3.makeZero();
        N = Vector3.makeZero();

        static makeIndex(v1: number, v2: number): number {
            const SEPARATION = 1000000;
            if (v1 < v2) return (v1 + 1) * SEPARATION + (v2 + 1);
            else return (v2 + 1) * SEPARATION + (v1 + 1);
        }
    }

    class EdgeMeshFace {
        vertices: number[] = [];
        centerPoint = Vector3.makeZero();
        normalPoint = Vector3.makeZero();
        N = Vector3.makeZero();
    }

    export class EdgeMesh {
        vertices: Vector3[] = [];
        edges = new Map<number, Edge>();
        faces: EdgeMeshFace[] = [];

        constructor() {
        }

        get length(): number { return (this.edges.size + this.faces.length) * 2; }

        addVertex(v: Vector3) {
            this.vertices.push(v);
        }

        private calcNormal(v1: number, v2: number, v3: number): Vector3 {
            let v1v2 = this.vertices[v2].sub(this.vertices[v1]);
            let v1v3 = this.vertices[v3].sub(this.vertices[v1]);
            let N = Vector3.cross(v1v2, v1v3);
            return N.norm();
        }

        addFace(v: number[]) {
            this._dirty = true;
            if (v.length < 3)
                return;
            let f = new EdgeMeshFace();
            for (let i = 0; i < v.length; i++) {
                if (v[i] < 0)
                    v[i] = this.vertices.length + v[i];
            }
            f.vertices.push(...v);
            f.N = this.calcNormal(v[0], v[1], v[2]);
            f.centerPoint = Vector3.makeZero();
            for (let v of f.vertices) {
                f.centerPoint = f.centerPoint.add(this.vertices[v]);
            }
            f.centerPoint = f.centerPoint.div(f.vertices.length);
            f.normalPoint = f.centerPoint.add(f.N.mul(0.1));
            let faceIndex = this.faces.length;
            this.faces.push(f);
            for (let i = 0; i < v.length; i++) {
                let v1 = v[i];
                let v2 = v[(i + 1) % v.length];
                this.addEdge(v1, v2, faceIndex);
            }
        }

        addEdge(v1: number, v2: number, faceIndex: number) {
            let isLeft = true;
            if (v1 > v2) {
                let tmp = v1;
                v1 = v2;
                v2 = tmp;
                isLeft = false;
            }
            let face = this.faces[faceIndex];
            let edgeIndex = Edge.makeIndex(v1, v2);
            let edge = this.edges.get(edgeIndex);
            if (!edge) {
                edge = new Edge();
                edge.v1 = v1;
                edge.v2 = v2;
                this.edges.set(edgeIndex, edge);
            }
            if (isLeft) {
                edge.leftFaceIndex = faceIndex;
                edge.leftNormal = face.N;
                edge.N = edge.N.add(face.N);
            } else {
                edge.rightFaceIndex = faceIndex;
                edge.rightNormal = face.N;
                edge.N = edge.N.add(face.N);
            }
            if (edge.leftFaceIndex >= 0 &&
                edge.rightFaceIndex >= 0) {
                edge.N.normalize();
            }
        }

        private _ebo: WebGLBuffer | null = null;
        private _dirty = true;
        private _edgeData: number[] = [];
        eboCount = 0;

        buildBuffers(gl: WebGLRenderingContext, isStatic: boolean = true): WebGLBuffer | null {
            if (!this._dirty && this._ebo) return this._ebo;

            let self = this;
            this._edgeData = [];
            this.edges.forEach((value, index, array) => {
                let v1 = this.vertices[value.v1];
                let v2 = this.vertices[value.v2];
                let N = value.N;
                let N1 = value.leftNormal;
                let N2 = value.rightNormal;
                let v = [
                    v1.x, v1.y, v1.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                    v2.x, v2.y, v2.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                ];
                self._edgeData.push(...v);
                v = [
                    v2.x, v2.y, v2.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                    v1.x, v1.y, v1.z,
                    N.x, N.y, N.z,
                    N1.x, N1.y, N1.z,
                    N2.x, N2.y, N2.z,
                ];
                self._edgeData.push(...v);
            });
            if (1) this.faces.forEach((value, index) => {
                let f = value;
                let dir = f.normalPoint.sub(f.centerPoint);
                let v = [
                    f.centerPoint.x, f.centerPoint.y, f.centerPoint.z,
                    dir.x, dir.y, dir.z,
                    f.N.x, f.N.y, f.N.z,
                    f.N.x, f.N.y, f.N.z,
                    f.normalPoint.x, f.normalPoint.y, f.normalPoint.z,
                    dir.x, dir.y, dir.z,
                    f.N.x, f.N.y, f.N.z,
                    f.N.x, f.N.y, f.N.z,
                ];
                self._edgeData.push(...v);
            });
            this.eboCount = self._edgeData.length / 16;
            let eboData = new Float32Array(this._edgeData);
            let ebo = gl.createBuffer();
            if (ebo) {
                gl.bindBuffer(gl.ARRAY_BUFFER, ebo);
                gl.bufferData(gl.ARRAY_BUFFER, eboData, isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
            }
            this._ebo = ebo;
            this._dirty = false;
            return this._ebo;
        }
    }
}

class IndexedGeometryMesh {
    public vertices: number[] = [];
    public indices: number[] = [];
    public surfaces: Surface[] = [];
    public edgeMesh = new FluxionsImpl.EdgeMesh();

    private _mtllib: string = "";
    private _mtl: string = "";
    private _vertex: Vertex = new Vertex();
    private _dirty: boolean = true;

    private _vbo: WebGLBuffer;
    private _ibo: WebGLBuffer;
    private _ebo: WebGLBuffer;
    private _vboData: Float32Array = new Float32Array(0);
    private _iboData: Uint32Array = new Uint32Array(0);

    aabb = new GTE.BoundingBox();

    constructor(private fx: FxRenderingContext) {
        let gl = this.fx.gl;
        let vbo = gl.createBuffer();
        let ibo = gl.createBuffer();
        let ebo = gl.createBuffer();
        if (!vbo || !ibo || !ebo) throw "IndexedGeometryMesh::constructor() Unable to create buffer";
        this._vbo = vbo;
        this._ibo = ibo;
        this._ebo = ebo;
    }

    reset() {
        this.vertices = [];
        this.indices = [];
        this.surfaces = [];
        this._dirty = true;
        this._vertex = new Vertex();
        this._mtllib = "";
        this._mtl = "";
        this.aabb.reset();
    }

    mtllib(mtllib: string): void {
        this._mtllib = mtllib;
    }

    usemtl(mtl: string): void {
        this._mtl = mtl;
    }

    rect(x1: number, y1: number, x2: number, y2: number) {
        this.begin(WebGLRenderingContext.TRIANGLE_FAN);
        this.normal(0, 0, 1);
        this.texcoord(0, 0, 0);
        this.position(x1, y1, 0);
        this.addIndex(-1);
        this.texcoord(0, 1, 0);
        this.position(x1, y2, 0);
        this.addIndex(-1);
        this.texcoord(1, 1, 0);
        this.position(x2, y2, 0);
        this.addIndex(-1);
        this.texcoord(1, 0, 0);
        this.position(x2, y1, 0);
        this.addIndex(-1);
    }

    circle(ox: number, oy: number, radius: number = 0.5, segments: number = 32) {
        this.begin(WebGLRenderingContext.TRIANGLE_FAN);
        this.normal(0, 0, 1);
        let theta = 0;
        let dtheta = GTE.radians(360.0 / segments);
        // this.texcoord(0, 0, 0);
        // this.position(ox, oy, 0);
        // this.addIndex(-1);
        for (let i = 0; i < segments; i++) {
            let x = Math.cos(theta);
            let y = Math.sin(theta);
            let u = x * 0.5 + 0.5;
            let v = y * 0.5 + 0.5;
            this.texcoord(u, v, 0);
            this.position(radius * x + ox, radius * y + oy, 0);
            this.addIndex(-1);
            theta += dtheta;
        }
    }

    spiral(radius: number, spirality = 4.0, segments = 32) {
        this.begin(WebGLRenderingContext.LINE_STRIP);
        this.normal(0, 0, 1);
        let theta = 0;
        let dtheta = GTE.radians(spirality * 360.0 / segments);
        for (let i = 0; i < segments; i++) {
            let x = Math.cos(theta);
            let y = Math.sin(theta);
            let u = x * 0.5 + 0.5;
            let v = y * 0.5 + 0.5;
            this.texcoord(u, v, 0);
            let r = (i / segments) * radius;
            this.position(r * x, r * y, 0);
            this.addIndex(-1);
            theta += dtheta;
        }
    }

    begin(mode: number) {
        if (this.surfaces.length == 0) {
            // if no surfaces exist, add one
            this.surfaces.push(new Surface(mode, this.indices.length, this._mtllib, this._mtl));
        }
        else if (this.currentIndexCount != 0) {
            // do not add a surface if the most recent one is empty
            this.surfaces.push(new Surface(mode, this.indices.length, this._mtllib, this._mtl));
        }
        if (this.surfaces.length > 0) {
            // simply update the important details
            let s = this.surfaces[this.surfaces.length - 1];
            s.mtl = this._mtl;
            s.mtllib = this._mtllib;
        }
    }

    addIndex(i: number): void {
        if (this.surfaces.length == 0) return;
        if (i < 0) {
            this.indices.push((this.vertices.length / 12) + i);
        } else {
            this.indices.push(i);
        }
        this.surfaces[this.surfaces.length - 1].Add();
        this._dirty = true;
    }

    get currentIndexCount(): number {
        if (this.surfaces.length == 0)
            return 0;
        return this.surfaces[this.surfaces.length - 1].count;
    }

    normal3(n: Vector3): void {
        this._vertex.normal.copy(n);
    }

    normal(x: number, y: number, z: number): void {
        this._vertex.normal.reset(x, y, z);
    }

    color3(c: Vector3): void {
        this._vertex.color.copy(c);
    }

    color(r: number, g: number, b: number): void {
        this._vertex.color.reset(r, g, b);
    }

    texcoord3(t: Vector3): void {
        this._vertex.texcoord.copy(t);
    }

    texcoord(x: number, y: number, z: number) {
        this._vertex.texcoord.reset(x, y, z);
    }

    vertex3(v: Vector3): void {
        this.aabb.add(v);
        this._vertex.position.copy(v);
        this.vertices.push(...this._vertex.asArray());
        // this._vertex = new Vertex();
    }

    vertex(x: number, y: number, z: number): void {
        let v = new Vector3(x, y, z);
        this.vertex3(v);
    }

    position(x: number, y: number, z: number): void {
        let v = new Vector3(x, y, z);
        this.vertex3(v);
    }

    // DrawTexturedRect(bottomLeft: Vector3, upperRight: Vector3,
    //     minTexCoord: Vector3, maxTexCoord: Vector3): void {

    // }

    build(): void {
        // Building the VBO goes here
        if (!this._dirty) return;

        this._vboData = new Float32Array(this.vertices);
        this._iboData = new Uint32Array(this.indices);

        let gl = this.fx.gl; if (!gl) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this._vboData, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._iboData, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        this._dirty = false;
    }

    render(rc: RenderConfig, sg: Scenegraph): void {
        if (!rc.usable) {
            //hflog.warn("IndexedGeometryMesh Called, but render config is unusable.");
            return;
        }
        // Rendering code goes here
        this.build();
        let gl = this.fx.gl; if (!gl) return;

        let offsets = [0, 12, 24, 36];
        let locs = [
            rc.getAttribLocation("aPosition"),
            rc.getAttribLocation("aNormal"),
            rc.getAttribLocation("aColor"),
            rc.getAttribLocation("aTexcoord")
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);

        for (let i = 0; i < 4; i++) {
            if (locs[i] >= 0) {
                gl.enableVertexAttribArray(locs[i]);
                gl.vertexAttribPointer(locs[i], 3, gl.FLOAT, false, 48, offsets[i]);
            }
        }

        for (let s of this.surfaces) {
            sg.usemtl(s.mtllib, s.mtl);
            gl.drawElements(s.mode, s.count, gl.UNSIGNED_INT, s.offset * 4);
        }

        for (let i = 0; i < 4; i++) {
            if (locs[i] >= 0) {
                gl.disableVertexAttribArray(locs[i]);
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    renderplain(rc: RenderConfig): void {
        if (!rc.usable) {
            //hflog.warn("IndexedGeometryMesh Called, but render config is unusable.");
            return;
        }
        // Rendering code goes here
        this.build();
        let gl = this.fx.gl; if (!gl) return;

        let offsets = [0, 12, 24, 36];
        let locs = [
            rc.getAttribLocation("aPosition"),
            rc.getAttribLocation("aNormal"),
            rc.getAttribLocation("aColor"),
            rc.getAttribLocation("aTexcoord")
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo);

        for (let i = 0; i < 4; i++) {
            if (locs[i] >= 0) {
                gl.enableVertexAttribArray(locs[i]);
                gl.vertexAttribPointer(locs[i], 3, gl.FLOAT, false, 48, offsets[i]);
            }
        }

        for (let s of this.surfaces) {
            gl.drawElements(s.mode, s.count, gl.UNSIGNED_INT, s.offset * 4);
        }

        for (let i = 0; i < 4; i++) {
            if (locs[i] >= 0) {
                gl.disableVertexAttribArray(locs[i]);
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    renderEdges(rc: RenderConfig) {
        let gl = this.fx.gl; if (!gl) return;
        let ebo = this.edgeMesh.buildBuffers(gl);
        let offsets = [0, 12, 24, 36];
        let stride = 48;
        let locs = [
            rc.getAttribLocation("aPosition"),
            rc.getAttribLocation("aNormal"),
            rc.getAttribLocation("aFace1Normal"),
            rc.getAttribLocation("aFace2Normal")
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, ebo);
        for (let i = 0; i < locs.length; i++) {
            if (locs[i] >= 0) {
                gl.enableVertexAttribArray(locs[i]);
                gl.vertexAttribPointer(locs[i], 3, gl.FLOAT, false, 48, offsets[i]);
            }
        }

        gl.drawArrays(gl.LINES, 0, this.edgeMesh.eboCount);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        for (let i = 0; i < locs.length; i++) {
            if (locs[i] >= 0) {
                gl.disableVertexAttribArray(locs[i]);
            }
        }
    }

    loadOBJ(lines: string[][], scenegraph: Scenegraph | null = null, path: string | null = null) {
        let positions: Vector3[] = [];
        let normals: Vector3[] = [];
        let colors: Vector3[] = [];
        let texcoords: Vector3[] = [];

        // in case there are no mtllib's, usemtl's, o's, g's, or s's
        this.begin(WebGLRenderingContext.TRIANGLES);
        for (let tokens of lines) {
            if (tokens.length >= 3) {
                if (tokens[0] == "v") {
                    let position = TextParser.ParseVector(tokens);
                    positions.push(position);
                    this.edgeMesh.addVertex(position);
                } else if (tokens[0] == "vn") {
                    normals.push(TextParser.ParseVector(tokens));
                } else if (tokens[0] == "vt") {
                    texcoords.push(TextParser.ParseVector(tokens));
                } else if (tokens[0] == "vc") {
                    let color = TextParser.ParseVector(tokens);
                    colors.push(color);
                    this.color(color.x, color.y, color.z);
                } else if (tokens[0] == "f") {
                    let indices = TextParser.ParseFace(tokens);
                    let edgeIndices: number[] = [];
                    let ncount = normals.length;
                    let tcount = texcoords.length;
                    let pcount = positions.length;
                    let vcount = indices.length / 3;
                    for (let j = 1; j < vcount - 1; j++) {
                        for (let k = 0; k < 3; k++) {
                            let i = (k == 0) ? 0 : j + k - 1;
                            let n = indices[i * 3 + 2];
                            if (n >= 0 && n < ncount) this.normal3(normals[n]);
                            let t = indices[i * 3 + 1];
                            if (t >= 0 && t < tcount) this.texcoord3(texcoords[t]);
                            let p = indices[i * 3 + 0];
                            if (p >= 0 && p < pcount) this.vertex3(positions[p]);
                            this.addIndex(-1);
                            edgeIndices.push(indices[i * 3]);
                        }
                    }
                    this.edgeMesh.addFace(edgeIndices);
                }
            }
            else if (tokens.length >= 2) {
                if (tokens[0] == "mtllib") {
                    if (scenegraph && path) scenegraph.load(path + tokens[1]);
                    this.mtllib(TextParser.ParseIdentifier(tokens));
                    this.begin(WebGLRenderingContext.TRIANGLES);
                } else if (tokens[0] == "usemtl") {
                    this.usemtl(TextParser.ParseIdentifier(tokens));
                    this.begin(WebGLRenderingContext.TRIANGLES);
                } else if (tokens[0] == "o") {
                    this.begin(WebGLRenderingContext.TRIANGLES);
                } else if (tokens[0] == "g") {
                    this.begin(WebGLRenderingContext.TRIANGLES);
                } else if (tokens[0] == "s") {
                    this.begin(WebGLRenderingContext.TRIANGLES);
                }
            }
        }

        this.build();
    }
}