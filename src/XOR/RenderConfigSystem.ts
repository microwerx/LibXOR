/// <reference path="LibXOR.ts" />
/// <reference path="Fluxions/RenderConfig.ts" />

class RenderConfigSystem {
    renderconfigs = new Map<string, RenderConfig>();

    constructor(public xor: LibXOR) {
    }

    create(name: string): RenderConfig {
        if (!this.xor.fluxions) throw "Fluxions is not initialized";
        let rc = new RenderConfig(this.xor.fluxions);
        this.renderconfigs.set(name, rc);
        return rc;
    }

    use(name: string | null): RenderConfig | null {
        if (!this.xor.fluxions) throw "Fluxions is not initialized";
        if (!name) {
            this.xor.fluxions.gl.useProgram(null);
        }
        else if (this.renderconfigs.has(name)) {
            let rc = this.renderconfigs.get(name);
            if (rc) {
                rc.use();
                return rc;
            }
        }
        return null;
    }
}