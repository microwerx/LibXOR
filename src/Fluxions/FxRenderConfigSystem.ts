/// <reference path="FxRenderConfig.ts" />

namespace Fluxions {
    export class FxRenderConfigSystem {
        renderconfigs = new Map<string, FxRenderConfig>();
        private shaderLoaders: XOR.ShaderLoader[] = [];

        constructor(public fx: FxRenderingContext) {
        }

        get loaded(): boolean {
            for (let i of this.shaderLoaders) {
                if (!i.loaded) return false;
            }
            return true;
        }

        get failed(): boolean {
            for (let i of this.shaderLoaders) {
                if (i.failed) return true;
            }
            return false;
        }

        get length(): number {
            return this.shaderLoaders.length;
        }

        get percentLoaded(): number {
            let a = 0;
            for (let i of this.shaderLoaders) {
                if (i.loaded) a++;
            }
            return 100.0 * a / this.shaderLoaders.length;
        }

        create(name: string): FxRenderConfig {
            if (!this.fx) throw "Fluxions is not initialized";
            let rc = new FxRenderConfig(this.fx);
            this.renderconfigs.set(name, rc);
            rc.name = name;
            return rc;
        }

        load(name: string, vshaderUrl: string, fshaderUrl: string): FxRenderConfig {
            let rc = new FxRenderConfig(this.fx);
            rc.name = name;
            rc.vshaderUrl = vshaderUrl;
            rc.fshaderUrl = fshaderUrl;
            this.renderconfigs.set(name, rc);
            let sl = new XOR.ShaderLoader(vshaderUrl, fshaderUrl, (vsource, fsource) => {
                rc.compile(vsource, fsource);
                hflog.log("Loaded " + vshaderUrl + " and " + fshaderUrl);
            });
            this.shaderLoaders.push(sl);
            return rc;
        }

        use(name: string | null): FxRenderConfig | null {
            if (!this.fx) throw "Fluxions is not initialized";
            if (!name) {
                this.fx.gl.useProgram(null);
            }
            else if (this.renderconfigs.has(name)) {
                let rc = this.renderconfigs.get(name);
                if (rc && rc.usable) {
                    rc.use();
                    return rc;
                }
            }
            return null;
        }

        find(name: string | null): FxRenderConfig | null {
            if (!this.fx) throw "Fluxions is not initialized";
            if (!name) return null;
            else if (this.renderconfigs.has(name)) {
                let rc = this.renderconfigs.get(name);
                if (rc && rc.usable) {
                    return rc;
                }
            }
            return null;
        }
    }
}