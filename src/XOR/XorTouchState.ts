namespace XOR {
    export class TouchState {
        private ox = 0;
        private oy = 0;
        public pressed = false;
        constructor(
            public x: number = 0,
            public y: number = 0,
            public dx: number = 0,
            public dy: number = 0
        ) { }

        get position(): Vector3 {
            return new Vector3(this.x, this.y);
        }

        get reldelta(): Vector3 {
            return new Vector3(this.dx, this.dy);
        }

        get touchDelta(): Vector3 {
            return new Vector3(this.x - this.ox, this.y - this.oy);
        }

        handleTouch(t: Touch, down: boolean, reset = false) {
            if (!t) return;
            if (reset) {
                this.dx = 0;
                this.dy = 0;
                this.ox = t.clientX;
                this.oy = t.clientY;
            } else {
                this.dx = t.clientX - this.x;
                this.dy = t.clientY - this.y;
            }
            this.x = t.clientX;
            this.y = t.clientY;
            this.pressed = down;
        }
    }
}