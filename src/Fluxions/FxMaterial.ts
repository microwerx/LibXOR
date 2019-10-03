/// <reference path="Fluxions.ts" />

namespace Fluxions {
    export class FxMaterial {
        public Kd: Vector3 = Vector3.make(0.8, 0.8, 0.8);
        public Ka: Vector3 = Vector3.make(0.2, 0.2, 0.2);
        public Ks: Vector3 = Vector3.make(1.0, 1.0, 1.0);
        public Tf: Vector3 = Vector3.make(1.0, 1.0, 1.0);
        public MapKdMix: number = 0.0;
        public MapKd: string = "";
        public MapKsMix: number = 0.0;
        public MapKs: string = "";
        public MapNormalMix: number = 0.0;
        public MapNormal: string = "";
        public SpecularRoughness: number = 0;
        public DiffuseRoughness: number = 0;
        public PBn2: number = 1.333;
        public PBk2: number = 0;
        public Dissolve: number = 1;
        public minFilter: number = 0;
        public magFilter: number = 0;

        constructor(public name: string) {

        }
    }
}