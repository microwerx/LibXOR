/// <reference path="LibXOR.ts" />
/// <reference path="Fluxions/Fluxions.ts"/>

class MeshSystem {
    meshes = new Map<string, FxIndexedGeometryMesh>();

    constructor(public xor: LibXOR) { }

    create(name: string): FxIndexedGeometryMesh {
        if (!this.xor.fluxions) throw "Fluxions is not initialized";
        let mesh = new FxIndexedGeometryMesh(this.xor.fluxions);
        this.meshes.set(name, mesh);
        return mesh;
    }

    load(name: string, url: string): FxIndexedGeometryMesh {
        if (!this.xor.fluxions) throw "Fluxions is not initialized";
        let mesh = new FxIndexedGeometryMesh(this.xor.fluxions);
        this.meshes.set(name, mesh);
        let tl = new XORUtils.TextFileLoader(url, (data: string, name: string, p: number) => {
            let textParser = new FxTextParser(data);
            mesh.loadOBJ(textParser.lines);
        });
        return mesh;
    }

    render(name: string | null, rc: RenderConfig): FxIndexedGeometryMesh | null {
        if (!this.xor.fluxions) throw "Fluxions is not initialized";
        if (!name) {
            return null;
        }
        else if (this.meshes.has(name)) {
            let mesh = this.meshes.get(name);
            if (mesh) {
                mesh.renderplain(rc);
                return mesh;
            }
        }
        return null;
    }
}