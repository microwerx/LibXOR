class Vertex {
    constructor(public position: Vector3 = new Vector3(0, 0, 0),
        public normal: Vector3 = new Vector3(0, 0, 1),
        public color: Vector3 = new Vector3(1, 1, 1),
        public texcoord: Vector3 = new Vector3(0, 0, 0)) {
    }

    asFloat32Array(): Float32Array {
        return new Float32Array([
            this.position.x, this.position.y, this.position.z,
            this.normal.x, this.normal.y, this.normal.z,
            this.color.x, this.color.y, this.color.z,
            this.texcoord.x, this.texcoord.y, this.texcoord.z
        ]);
    }

    asArray(): Array<number> {
        return [
            this.position.x, this.position.y, this.position.z,
            this.normal.x, this.normal.y, this.normal.z,
            this.color.x, this.color.y, this.color.z,
            this.texcoord.x, this.texcoord.y, this.texcoord.z
        ];
    }
};
