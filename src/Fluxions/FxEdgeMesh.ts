/// <reference path="../GTE/GTE.ts" />

namespace Fluxions {
    class FxEdge {
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

    class FxEdgeMeshFace {
        vertices: number[] = [];
        centerPoint = Vector3.makeZero();
        normalPoint = Vector3.makeZero();
        N = Vector3.makeZero();
    }

    export class FxEdgeMesh {
        vertices: Vector3[] = [];
        edges = new Map<number, FxEdge>();
        faces: FxEdgeMeshFace[] = [];

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
            let f = new FxEdgeMeshFace();
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
            let edgeIndex = FxEdge.makeIndex(v1, v2);
            let edge = this.edges.get(edgeIndex);
            if (!edge) {
                edge = new FxEdge();
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
    } // FxEdgeMesh
}