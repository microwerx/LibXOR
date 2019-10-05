class FxSurface {
    public count: number = 0;

    constructor(
        readonly mode: number,
        readonly offset: number,
        public mtllib: string,
        public mtl: string,
        public worldMatrix: Matrix4) {
    }

    Add(): void {
        this.count++;
    }
}