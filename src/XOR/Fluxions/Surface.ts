class Surface {
    public count: number = 0;

    constructor(readonly mode: number, readonly offset: number,
        public mtllib: string, public mtl: string) {
    }

    Add(): void {
        this.count++;
    }
}