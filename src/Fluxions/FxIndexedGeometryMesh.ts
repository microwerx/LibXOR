/// <reference path="Fluxions.ts" />
/// <reference path="FxVertex.ts" />
/// <reference path="FxSurface.ts" />
/// <reference path="FxRenderConfig.ts" />
/// <reference path="FxScenegraph.ts" />
/// <reference path="FxEdgeMesh.ts" />

namespace Fluxions {
    function docenter(x: number, centering: number) {
        if (x > 0.0) {
            if (centering < 0) return 0;
            if (centering == 0) return 0.5 * x;
            if (centering > 0) return x;
        }
        return 0.0;
    }

    export class FxIndexedGeometryMesh {
        public vertices: number[] = [];
        public indices: number[] = [];
        public surfaces: FxSurface[] = [];
        public edgeMesh = new FxEdgeMesh();

        private _mtllib: string = "";
        private _mtl: string = "";
        private _vertex: FxVertex = new FxVertex();
        private _dirty: boolean = true;
        private _worldMatrix = Matrix4.makeIdentity();

        private _vbo: WebGLBuffer;
        private _ibo: WebGLBuffer;
        private _ebo: WebGLBuffer;
        private _vboData: Float32Array = new Float32Array(0);
        private _iboData: Uint32Array = new Uint32Array(0);

        aabb = new GTE.BoundingBox();
        rescaleBBox: GTE.BoundingBox | null = null;
        rescaleCenter = Vector3.make();

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
            this._vertex = new FxVertex();
            this._mtllib = "";
            this._mtl = "";
            this._worldMatrix.loadIdentity();
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
            this.texcoord(1, 0, 0);
            this.position(x2, y1, 0);
            this.addIndex(-1);
            this.texcoord(1, 1, 0);
            this.position(x2, y2, 0);
            this.addIndex(-1);
            this.texcoord(0, 1, 0);
            this.position(x1, y2, 0);
            this.addIndex(-1);
        }

        strokeRect(x1: number, y1: number, x2: number, y2: number) {
            this.begin(WebGLRenderingContext.LINE_LOOP);
            this.normal(0, 0, 1);
            this.texcoord(0, 0, 0);
            this.position(x1, y1, 0);
            this.addIndex(-1);
            this.texcoord(1, 0, 0);
            this.position(x2, y1, 0);
            this.addIndex(-1);
            this.texcoord(1, 1, 0);
            this.position(x2, y2, 0);
            this.addIndex(-1);
            this.texcoord(0, 1, 0);
            this.position(x1, y2, 0);
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

        strokeCircle(ox: number, oy: number, radius: number = 0.5, segments: number = 32) {
            this.begin(WebGLRenderingContext.LINE_LOOP);
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

        line(startX: number, startY: number, endX: number, endY: number) {
            this.begin(WebGLRenderingContext.LINES);
            this.normal(0, 0, 1);
            this.texcoord(0, 0, 0);
            this.position(startX, startY, 0);
            this.addIndex(-1);
            this.texcoord(1, 0, 0);
            this.position(endX, endY, 0);
            this.addIndex(-1);
        }

        begin(mode: number) {
            if (this.surfaces.length == 0) {
                // if no surfaces exist, add one
                this.surfaces.push(new FxSurface(mode, this.indices.length, this._mtllib, this._mtl, this._worldMatrix));
            }
            else if (this.currentIndexCount != 0) {
                // do not add a surface if the most recent one is empty
                this.surfaces.push(new FxSurface(mode, this.indices.length, this._mtllib, this._mtl, this._worldMatrix));
            }
            if (this.surfaces.length > 0) {
                // simply update the important details
                let s = this.surfaces[this.surfaces.length - 1];
                s.mtl = this._mtl;
                s.mtllib = this._mtllib;
                s.worldMatrix.copy(this._worldMatrix);
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

        transform(m: Matrix4): void {
            this._worldMatrix.copy(m);
        }

        loadIdentity(): void {
            this._worldMatrix.loadIdentity();
        }

        translate(x: number, y: number, z: number): void {
            this._worldMatrix.translate(x, y, z);
        }

        rotate(angleInDegrees: number, x: number, y: number, z: number): void {
            this._worldMatrix.rotate(angleInDegrees, x, y, z);
        }

        scale(x: number, y: number, z: number): void {
            this._worldMatrix.scale(x, y, z);
        }

        // DrawTexturedRect(bottomLeft: Vector3, upperRight: Vector3,
        //     minTexCoord: Vector3, maxTexCoord: Vector3): void {

        // }

        rescale() {
            if (!this.rescaleBBox) return;
            if (this.rescaleBBox.sameAs(this.aabb)) return;

            let centering = GTE.vec3(0, 0, 1);

            let bbox = new GTE.BoundingBox();
            const stride = 12;
            const numVertices = this.vertices.length / stride;
            let M = Matrix4.makeIdentity();
            let t = 1.0 / this.aabb.maxSize;
            let s = t * this.rescaleBBox.maxSize;
            let diffx = 1.0 - t * this.aabb.width;
            let diffy = 1.0 - t * this.aabb.height;
            let diffz = 1.0 - t * this.aabb.depth;
            let tx = docenter(diffx, this.rescaleCenter.x) + this.rescaleBBox.minBounds.x;
            let ty = docenter(diffy, this.rescaleCenter.y) + this.rescaleBBox.minBounds.y;
            let tz = docenter(diffz, this.rescaleCenter.z) + this.rescaleBBox.minBounds.z;
            M.translate(tx, ty, tz);
            M.scale(s, s, s);
            M.translate3(this.aabb.minBounds.negate());
            for (let i = 0; i < numVertices; i++) {
                let v = Vector3.make(
                    this.vertices[i * stride + 0],
                    this.vertices[i * stride + 1],
                    this.vertices[i * stride + 2]
                );
                v = M.transform3(v);
                bbox.add(v);
                this.vertices[i * stride + 0] = v.x;
                this.vertices[i * stride + 1] = v.y;
                this.vertices[i * stride + 2] = v.z;
            }
            // hflog.info("diff " + diffx.toFixed(3) + ", " + diffy.toFixed(3) + ", " + diffz.toFixed(3))
            // hflog.info("aabb size: " + this.aabb.maxSize.toFixed(3) + " -- " + this.aabb.whdString());
            // hflog.info("rebb size: " + this.rescaleBBox.maxSize.toFixed(3) + " -- " + this.rescaleBBox.whdString());
            // hflog.info("rebb min: " + " -- " + this.rescaleBBox.minString());
            // hflog.info("rebb max: " + " -- " + this.rescaleBBox.maxString());
            // hflog.info("bbox size: " + bbox.maxSize.toFixed(3) + " -- " + bbox.whdString());
            // hflog.info("bbox min: " + " -- " + bbox.minString());
            // hflog.info("bbox max: " + " -- " + bbox.maxString());

            // if (!bbox.sameAs(this.rescaleBBox)) hflog.error('Bounding boxes don\'t match!');
        }

        build(): void {
            // Building the VBO goes here
            if (!this._dirty) return;

            this.rescale();

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

        render(rc: FxRenderConfig, sg: FxScenegraph): void {
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

        renderplain(rc: FxRenderConfig): void {
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

        renderEdges(rc: FxRenderConfig) {
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

        loadOBJ(lines: string[][], scenegraph: FxScenegraph | null = null, path: string | null = null) {
            let positions: Vector3[] = [];
            let normals: Vector3[] = [];
            let colors: Vector3[] = [];
            let texcoords: Vector3[] = [];

            // in case there are no mtllib's, usemtl's, o's, g's, or s's
            this.begin(WebGLRenderingContext.TRIANGLES);
            for (let tokens of lines) {
                if (tokens.length >= 3) {
                    if (tokens[0] == "v") {
                        let position = FxTextParser.ParseVector(tokens);
                        positions.push(position);
                        this.edgeMesh.addVertex(position);
                    } else if (tokens[0] == "vn") {
                        normals.push(FxTextParser.ParseVector(tokens));
                    } else if (tokens[0] == "vt") {
                        texcoords.push(FxTextParser.ParseVector(tokens));
                    } else if (tokens[0] == "vc") {
                        let color = FxTextParser.ParseVector(tokens);
                        colors.push(color);
                        this.color(color.x, color.y, color.z);
                    } else if (tokens[0] == "f") {
                        let indices = FxTextParser.ParseFace(tokens);
                        let edgeIndices: number[] = [];
                        let ncount = normals.length;
                        let tcount = texcoords.length;
                        let pcount = positions.length;
                        let vcount = indices.length / 3;
                        for (let j = 0; j < vcount; j++) {
                            let p = indices[j * 3 + 0];
                            if (p < 0) indices[j * 3] = pcount + p;
                        }
                        for (let j = 1; j < vcount - 1; j++) {
                            let N: Vector3;
                            try {
                                let p1 = indices[0];
                                let p2 = indices[j * 3];
                                let p3 = indices[(j + 1) * 3];
                                let sidea = positions[p2].sub(positions[p1]);
                                let sideb = positions[p3].sub(positions[p1]);
                                N = Vector3.cross(sidea, sideb).normalize();
                            } catch (e) {
                                hflog.error("IndexedGeometryMesh --> Normal calculation error")
                                break;
                            }
                            for (let k = 0; k < 3; k++) {
                                let i = (k == 0) ? 0 : j + k - 1;

                                let n = indices[i * 3 + 2];
                                if (n >= 0 && n < ncount) {
                                    this.normal3(normals[n]);
                                } else {
                                    n = ncount - n;
                                }
                                if (n >= 0 && n < ncount) {
                                    this.normal3(normals[n]);
                                }
                                else {
                                    this.normal3(N);
                                }

                                let t = indices[i * 3 + 1];
                                if (t >= 0 && t < tcount) {
                                    this.texcoord3(texcoords[t]);
                                } else {
                                    t = tcount - t;
                                }
                                if (t >= 0 && t < tcount) {
                                    this.texcoord3(texcoords[t]);
                                } else {
                                    this.texcoord3(Vector3.makeZero());
                                }

                                let p = indices[i * 3 + 0];
                                if (p >= 0 && p < pcount) {
                                    this.vertex3(positions[p]);
                                } else {
                                    p = pcount - p;
                                }
                                if (p >= 0 && p < pcount) {
                                    this.vertex3(positions[p]);
                                } else {
                                    this.vertex3(Vector3.makeZero());
                                }
                                
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
                        this.mtllib(FxTextParser.ParseIdentifier(tokens));
                        this.begin(WebGLRenderingContext.TRIANGLES);
                    } else if (tokens[0] == "usemtl") {
                        this.usemtl(FxTextParser.ParseIdentifier(tokens));
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
}
