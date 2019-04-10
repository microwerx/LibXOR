/// <reference path="FxRenderConfig.ts" />

namespace Fluxions {
    export class FxRenderConfigSystem {
        renderconfigs = new Map<string, FxRenderConfig>();

        constructor(public fx: FxRenderingContext) {
        }

        create(name: string): FxRenderConfig {
            if (!this.fx) throw "Fluxions is not initialized";
            let rc = new FxRenderConfig(this.fx);
            this.renderconfigs.set(name, rc);
            return rc;
        }

        load(name: string, vshaderUrl: string, fshaderUrl: string): FxRenderConfig {
            let rc = new FxRenderConfig(this.fx);
            this.renderconfigs.set(name, rc);
            let sl = new XOR.ShaderLoader(vshaderUrl, fshaderUrl, (vsource, fsource) => {
                rc.compile(vsource, fsource);
                hflog.log("Loaded " + vshaderUrl + " and " + fshaderUrl);
            });
            return rc;
        }

        use(name: string | null): FxRenderConfig | null {
            if (!this.fx) throw "Fluxions is not initialized";
            if (!name) {
                this.fx.gl.useProgram(null);
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
}