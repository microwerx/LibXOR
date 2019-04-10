/// <reference path="Fluxions.ts" />

namespace Fluxions {
    export class FxMaterial {
        public Kd: Vector3 = Vector3.make(0.8, 0.8, 0.8);
        public Ka: Vector3 = Vector3.make(0.2, 0.2, 0.2);
        public Ks: Vector3 = Vector3.make(1.0, 1.0, 1.0);
        public map_Kd_mix: number = 0.0;
        public map_Kd: string = "";
        public map_Ks_mix: number = 0.0;
        public map_Ks: string = "";
        public map_normal_mix: number = 0.0;
        public map_normal: string = "";
        public PBKsm: number = 0;
        public PBKdm: number = 0;
        public PBn2: number = 1.333;
        public PBk2: number = 0;
        public minFilter: number = 0;
        public magFilter: number = 0;

        constructor(public name: string) {

        }
    }
}