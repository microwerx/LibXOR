/// <reference path="Fluxions.ts" />

namespace Fluxions {
    export class FxScenegraphNode {
        public geometryGroup: string = "";
        private transform_: Matrix4 = Matrix4.makeIdentity();
        private pretransform_: Matrix4 = Matrix4.makeIdentity();
        private posttransform_: Matrix4 = Matrix4.makeIdentity();

        set worldMatrix(m: Matrix4) {
            this.pretransform_.loadIdentity();
            this.transform_.copy(m);
            this.posttransform_.loadIdentity();
        }
        get worldMatrix(): Matrix4 { return Matrix4.multiply3(this.pretransform_, this.transform_, this.posttransform_); }
        get pretransform(): Matrix4 { return this.pretransform_; }
        get posttransform(): Matrix4 { return this.posttransform_; }
        get transform(): Matrix4 { return this.transform_; }

        constructor(
            public name: string = "unknown",
            public sceneName: string = "default",
            public parent: string = "") {
        }
    }
}